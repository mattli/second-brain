---
date: 2026-08-06
type: findings
status: open — no fixes applied
product: codebase-map
target_repo: /Users/mattli/development/voice-tutor
---

# Codebase Map v0 — first real-run findings

First run of the v0 tool against a real repo (voice-tutor), 2026-08-06.
Built by the dev-harness (run `msi6bsp1`, all 5 sprints passed, scores
96/96/98/96/90, $24.13). Code merged to `main` in
[codebase-map](https://github.com/mattli/codebase-map) (private).

Related: [[v0-goal]] (the goal the harness ran against — a record, not edited),
[[design-notes]] (why the tool exists and which shapes were rejected).

## The machinery works

Worth stating plainly before the problems, because none of these findings are
architectural:

- **Scan, cache, treemap, and click-for-summary all function.** The pipeline runs
  end to end and produces one self-contained HTML file that opens with no server.
- **The cache is real and is the cost story.** First run on voice-tutor: 29 model
  calls, **$0.13**, 2 minutes 24 seconds. A re-run against an unchanged repo makes
  **zero** model calls — verified in the harness's credentialed smoke by measuring
  the returned call count, not by mocking. This is what makes a weekly cadence
  free, which was the design bet.
- **The summaries it writes are good.** Where the tool sees a whole file, the 2–4
  bullets are accurate and genuinely descriptive, and stay on the right side of the
  descriptive/evaluative line the design notes drew.
- **It does not touch the analyzed repo.** voice-tutor's working tree was clean
  before and after; all output goes to `~/.codebase-map/<repo>/`.

The estimate discipline also held: predicted $0.10, actual $0.13.

## Finding 1 — lockfiles and non-code inflate the treemap

`uv.lock` is currently **the single largest rectangle** in the voice-tutor map at
2,732 lines — over a fifth of total "source" mass — and it was summarized with a
real model call. The goal doc explicitly called for skipping lockfiles.

More broadly, only 19 of the 29 files classified as source are actually Python.
The other 10 are `README.md`, `CLAUDE.md`, `.gitignore`, `pyproject.toml`, a
launchd plist, `start.sh`, `RELOCATION_NOTES.md`, `static/study.html`, and
`.python-version` — the last of which is one line long and received a two-bullet
summary explaining that it specifies the Python version.

**Why it matters:** the treemap's dominant shape is a machine-generated file, and
the mass picture is diluted by docs and config. The core promise is perception of
proportion; proportion is the thing being distorted.

## Finding 2 — JSON test fixtures counted as test files

Test-side mass is inflated by roughly 2,000 lines of `tests/fixtures/**/*.json`
(the largest single fixture is 802 lines). These are data, not test code.

The path-based heuristic is doing what it was told — anything under `tests/` is a
test — but "a test file growing is a real signal" was the reason for tracking the
test side separately, and a fixture growing is a different signal again. Lower
severity than the other two; it distorts a total rather than the main view.

## Finding 3 — large files get summaries of their first fifth, silently

**This is the important one.**

The summarizer reads only the first **12,000 characters** of any file. Every one
of voice-tutor's nine largest Python files exceeds that:

| File | Lines | Bytes | Fraction actually read |
|---|---|---|---|
| `coverage_judge.py` | 1,797 | 81,721 | 15% |
| `bot.py` | 1,193 | 56,830 | 21% |
| `reconcile_costs.py` | 993 | 39,552 | 30% |
| `claims.py` | 810 | 38,093 | 31% |
| `app.py` | 741 | 33,410 | 36% |
| `cost_audit.py` | 513 | 20,691 | 58% |
| `coverage_smoke.py` | 426 | 17,143 | 70% |
| `coverage_store.py` | 367 | 15,773 | 76% |
| `backfill_coverage.py` | 262 | 12,254 | 98% |

`bot.py` is the clearest illustration. Its summary is well-written and accurate —
and describes the top fifth of the file: imports, configuration flags, the usage
accumulator. It lists **5 functions for a 1,193-line file**. The pipeline handlers
and session lifecycle further down are simply absent.

**The panel gives no indication that the summary is partial.** The word
"truncated" appears in the emitted HTML only inside summary *prose* about
`claims.py`'s own truncation handling — there is no per-file badge, no note, no
symbol-count caveat.

**Why it matters most:** the whole premise is *click the biggest rectangle and
learn what it's responsible for.* That is precisely where the tool is weakest —
small files get complete, faithful summaries; the boulders get their first page.
Confidently partial is worse than visibly incomplete, because there is no cue to
distrust it.

## Shape of the fix (not planned, not scheduled)

All three are v0.1-scale, not redesigns:

1. An exclusion pass for lockfiles, and a decision about whether docs/config count
   as source mass at all (possibly a third category alongside source/test).
2. Treat fixture data as its own category, or exclude it from the test total.
3. Handle large files in more than one pass — chunk-and-merge, or a
   structure-first pass over signatures — and **until then, disclose truncation in
   the panel**. The disclosure is the cheap half and is worth doing regardless of
   how the read-limit question is answered.

Nothing has been fixed. No work is scheduled.
