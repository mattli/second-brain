# Codebase Map

**Status:** exploratory design, pre-build (v0 not yet specced)
**Started:** 2026-08-06
**Type:** development tool (sibling to dotmd) — intended to work on any repo, not just Voice Tutor

---

## Why this exists

A week of building the Voice Tutor coverage feature entirely through Claude Code — real architectural decisions made, zero code read.

The loss isn't "I don't understand my architecture." It's the **felt sense of proportion** that used to come from touching files. Coding by hand produced this for free: knowing a file was 1,200 lines, that 400 of those were teardown, that teardown had grown three times in two weeks. That perception is what generated the useful questions — *should this be a helper? is this too long? does this need splitting?* Not a diagram. A sense of mass.

Two distinct things were lost, and they need different instruments:

1. **The map** — what exists, what each piece is responsible for. Static-ish, changes slowly. Recoverable by reading a good summary once and refreshing occasionally.
2. **The proportions and the drift** — how big things are, what's growing, where complexity is accumulating. **This is the real loss.** Not recoverable by reading once, because the original signal was *repetition*: you noticed a file was getting long because you kept opening it.

Goal is **comprehension**, on the theory that comprehension is enough to generate the maintainability questions yourself. The tool doesn't render judgments; it restores perception.

## Shape

**A treemap, not a dependency graph.**

Nodes proportional to size is the core requirement — seeing that `bot.py` is a boulder next to `coverage_store.py`'s pebble is the perception being restored.

But a dependency graph of a Python codebase mostly confirms what's already suspected: everything imports the shared modules, `bot.py` imports everything, arrows converge on the middle. The layout costs real effort and yields little. **The sizes are the signal; the edges are mostly noise.** A treemap gives the same proportion perception with no layout problem and reads instantly. Edges can be added later if their absence is actually felt.

**Click a rectangle → a concise panel:**
- What this module is responsible for (2–4 bullets, plain language)
- Its functions/classes, one line each
- Size, and how it changed since the last snapshot

## The cheap/expensive split — the key design decision

- **Sizes, structure, and deltas are pure computation.** Line counts, function counts, per-function length, what changed since the last run. No LLM. Fast, deterministic, runs as often as you like.
- **Summaries need an LLM.** Nothing static writes "this file is doing two jobs." But they're **cached per file and regenerated only when the file's content hash changes** — so the expensive part costs nothing on a codebase that didn't move.

This split is what makes a frequent cadence affordable.

## On refactor suggestions — the honest caution

An LLM asked "should this be split?" will almost always say yes. Ungrounded advice becomes noise you learn to ignore, and then the whole tool loses credibility.

**Anchor suggestions to change, not to standing judgment.** "Teardown grew 180 lines this week and now has four distinct responsibilities" is a fact with a suggestion attached. "This file is long" is an opinion. v0 should probably ship *drift* only — biggest movers since last snapshot — and let the conclusions be Matt's, exactly as they used to be.

If a judgment layer is added later, trigger it on a threshold crossing (a file grew N%, or gained a distinct responsibility), never on a standing scan.

## Build and run — two different things

- **Building the analyzer: dev-harness work.** Self-contained new tool, hermetically verifiable, no live code, no app dependency. Textbook harness shape.
- **Running it on a schedule: not harness work.** That's a NanoClaw-style scheduled job, a git hook, or a manual command. Decide cadence after using it once — a daily report on a codebase that didn't change is noise.

v0 should be runnable by hand. Automation is a separate decision.

## Open questions for the v0 goal

**Decided 2026-08-06:**

- **Scope: generic.** Takes a repo path as an argument. Barely harder than hardcoding one, and the obvious second subject is dev-harness — a codebase Matt has never read at all. Cross-language means crude, language-agnostic line counting for v0 (voice-tutor is Python, dev-harness is TypeScript); per-language parsing is a much bigger build and not warranted yet.
- **v0 includes LLM summaries, not drift-only.** Matt does *not* know what each file is responsible for — that's the actual gap. A drift-only treemap would restore proportion but clicking a rectangle would show a function list, not a purpose. The click-for-responsibilities is the point.

**Still open:**

- **Output format:** a self-contained static HTML file (opens in a browser, no server, no build step) is the obvious v0.
- **Granularity:** file-level for v0. Function-level inside a file is a natural v1 once file-level proves useful.
- **What counts as size:** lines is the crude proxy and probably right for v0. (Function count, cyclomatic complexity, "number of distinct responsibilities" are all more meaningful and all more expensive.)
- **Snapshot storage:** where do previous runs live, so deltas are computable? A JSON snapshot beside the output is likely enough.
- **Tests, generated code, vendored files** — include, exclude, or show separately? A test file growing is a different signal than a module growing.

## What success looks like for v0

Open one HTML file, see the shape of the codebase by mass, click the biggest rectangle, and be able to say what it's responsible for without opening the code. Run it again a week later and the biggest movers are visible.

That's it. If that works, the questions it generates — *should this split? is this doing two jobs?* — are Matt's to ask, which was the whole point.
