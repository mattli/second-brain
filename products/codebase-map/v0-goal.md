# Goal: Codebase Map v0

**Date:** 2026-08-06
**Type:** self-contained new tool — harness lane (no live code, no app dependency)
**Design notes:** `~/second-brain/products/codebase-map/design-notes.md` — read this first; it explains *why* the tool exists and which shapes were rejected.
**Where the code lives:** a new repo at `~/development/codebase-map` (create it; git init, no remote).

## What to build

A command-line tool that analyzes any repo and produces **one self-contained HTML file** showing the codebase as a treemap — rectangles sized by lines of code — where clicking a rectangle reveals what that file is responsible for.

```
codebase-map <path-to-repo>
```

Output goes to `~/.codebase-map/<repo-name>/` — an `index.html` plus a JSON snapshot. Never write into the analyzed repo.

## The three parts

### 1. Scan (pure computation, no LLM)

Walk the repo, respecting `.gitignore`. For each source file: path, line count, and a content hash. Language-agnostic — count lines, don't parse. Skip binaries, lockfiles, vendored dependencies, and anything gitignored.

Classify each file as **source** or **test** (path- and filename-based heuristics are fine). Both are included in the output; they are visually distinguished and separately totaled. A test file growing is a real signal, just a different one from a module growing.

### 2. Summarize (LLM, cached by content hash)

For each source file, a short summary: **2–4 plain-language bullets on what the file is responsible for**, plus a one-line-each list of its functions/classes. Use Claude Haiku (`claude-haiku-4-5-20251001`).

**Caching is the core cost control.** Key summaries by the file's content hash. A file whose hash is unchanged since the last run is never re-summarized. First run on a mid-size repo costs a few dollars at most; subsequent runs cost near zero.

Summaries must be **descriptive, not evaluative** — what the file does, not whether it's well designed. No refactor advice at this layer (see the design notes on why ungrounded advice becomes noise).

### 3. Render (static HTML, no server, no build step)

A single `index.html` with everything inlined — no external assets, no framework, no network calls at view time. Opening the file in a browser must just work.

- **Treemap**, rectangles proportional to line count, source and test visually distinguished.
- **Click a rectangle** → a panel with the file's summary bullets, its function list, its line count, and its delta since the last snapshot.
- **Drift**: if a previous snapshot exists, show what changed — biggest growers, biggest shrinkers, new files, deleted files. Facts only; no judgments.
- Readable on a laptop screen. Mobile is not a target.

## Snapshots and deltas

Each run writes a JSON snapshot (paths, line counts, hashes, summaries) to the output directory. The next run diffs against it. The very first run on a repo has no deltas — say so plainly rather than showing zeros.

## Verification (contract acceptance criteria)

**Hermetic tests:** the scanner (gitignore handling, classification, hashing), the cache (a changed hash re-summarizes, an unchanged one does not), the delta computation (growth, shrinkage, additions, deletions, first-run-no-baseline), and HTML generation. Mock the model call.

**Credentialed smoke — required, not an afterthought.** Per this environment's standing rule, mocks cannot catch transport-layer bugs in an LLM-calling module. Run the real tool with real Haiku calls against a small real target, and assert: summaries are non-empty and well-formed for every source file, the cache prevents re-summarization on an immediate second run (assert zero model calls), and the emitted HTML opens and contains every scanned file. Report the actual cost.

**Two real targets to prove genericness:** `~/development/voice-tutor` (Python) and `~/development/dev-harness` (TypeScript). Both must scan cleanly. Read-only — never write into either.

## Constraints

- New repo, new files only. Do not modify voice-tutor, dev-harness, or anything under `~/.voice-tutor/`.
- API key from the voice-tutor `.env` by absolute path (`/Users/mattli/development/voice-tutor/.env`) or the environment. Never echo it.
- Bound the first-run cost: if a repo has more than ~200 source files, summarize the largest N by default and say plainly in the output that the rest are unsummarized. A tool that costs $40 on first run against a big repo is a tool Matt won't run twice.
- Runs on Matt's Claude subscription — normal harness usage limits apply.

## Out of scope

- Dependency edges / import graphs. The design notes explain why: sizes are the signal, edges are mostly noise. Possible v1.
- Function-level granularity inside a file. File-level for v0.
- Any refactor or "should this be split?" judgment. v0 shows facts and drift; the conclusions are Matt's.
- Scheduling or automation. v0 is run by hand; cadence is a separate decision after using it once.
- Per-language AST parsing. Crude line counting is correct for v0.

## Success looks like

Matt runs `codebase-map ~/development/dev-harness` — a codebase he has never read — opens one HTML file, sees its shape by mass, clicks the biggest rectangle, and can say what that file is responsible for. Runs it again a week later and the biggest movers are visible.
