---
date: 2026-08-07
type: findings
status: module built and green; branch unmerged, awaiting review
run_id: msjma91f
target_repo: /Users/mattli/development/voice-tutor
branch: run-msjma91f
---

# Incremental judging — run `msjma91f` diagnosis

Diagnosis of the dev-harness run against [[2026-08-07-incremental-judging-goal]],
launched 17:10 PDT 2026-08-07, halted on the per-sprint wall clock at 20:22 PDT.
Design context: [[2026-08-02-live-coverage-design]] (phase-2 spec).

Related backlog items: the verifier preflight + failure classifier, and
"a sprint that cannot satisfy its contract should halt saying so."

## Outcome in one line

Four of five sprints passed and the module is green; the fifth sprint was asked
to prove a cost saving the goal doc's own constraints made unreachable, and in
failing it produced the most valuable result of the run.

| | |
|---|---|
| Scores | 96, 96, 92, 93, **22** |
| Halt | wall-clock, on the fifth sprint |
| Harness cost | $23.07 (plus ~$0.80 of real Haiku inside the smoke) |
| Tests on branch | **759 passed, 1 xfailed in 5.7s** (baseline 666 → +93, no regressions) |
| Files touched | 8, **all added**; zero modified, zero deleted |

## The headline finding: the cost thesis did not hold

The design predicted each live pass would emit **~300 output tokens** — only the
newly-covered claims — against ~5,600 for a full re-judge. Output is ~83% of
judge cost, so that gap was the entire 4× saving.

Measured on 159 real turns of session `f6148c26`:

| | Design predicted | Measured |
|---|---|---|
| Output tokens per pass | ~300 | **5,977** |
| Cost vs. full re-judge at cadence | ~0.26 | **0.78** |

**Root cause, and it is a goal-level conflict rather than a build defect.** The
smoke used today's judge prompt, which instructs the model to return "exactly one
verdict per input claim id" (`coverage_judge.py`). So every pass still emits a
verdict for all ~55 uncovered claims — the transcript got shorter, the answer did
not. The goal doc explicitly placed prompt authoring out of scope ("take today's
prompt as given"), so the sprint was required to prove a saving the same document
forbade it from making true.

**What does hold: the flatness half.** Per-pass input stayed at 4,338–4,951
tokens regardless of how far into the session the pass ran, and turns-sent held at
the 12-turn bound (`turns_per_pass + LOOKBACK_WINDOW`) on every pass including the
first. Latency and per-pass work are flat on real data — which is the property
that makes a live meter possible at all. Only the dollar saving came in smaller
than hoped.

**Open product question this creates:** at 22% cheaper rather than 4×, is a live
meter worth ~$0.70/session? If yes, the next lever is a v3 judge prompt that
returns only newly-covered claims (already active work), which should restore most
of the predicted saving. If no, the flat-latency result may justify a slower
cadence instead.

## Why the fifth sprint scored 22

The evaluator's reasoning was **not recorded** — the trace stored only `score 22`.
That is the known transcript-v2 gap, and this run is a clean example of its cost:
the "why" had to be reconstructed by hand from the contract and the artifact.

What is established:

- That sprint's contract was the **only one to force-freeze at the negotiation
  round cap** rather than by agreement. Five rounds, no agreement, 13 criteria
  frozen — roughly triple any other sprint's. The criteria carry visible
  defensive armor against the generator faking evidence ("CRITICALLY, that
  run-log must be EMITTED BY the committed pytest node's own reporting code").
- The generator did **not** fail to run the smoke. It ran it live — 24 real Haiku
  calls across both sessions — and committed a run log whose arithmetic
  reconciles exactly (token sums, call count, and dollars all check out).
- Timing killed the iteration budget: the first three sprints generated in 3–8
  minutes each; the fourth took 48; the fifth took 48 generating plus 18
  evaluating, against a 30-minute per-sprint cap. It got **one** evaluation and
  had no clock left to respond to it.

Inferred, not proven, dock reasons: the measured cost ratio of 0.78 is arguably
not "materially below," and the committed log has a real internal inconsistency
(20 passes but a 21-entry turns-sent list) against a criterion demanding
coherence.

## A cost-accounting anomaly worth a look

Per-sprint generation cost was $10.43, $5.69, $4.45, $2.49 — and **$0.00 recorded
for the fifth**, despite 48 minutes of generation and 18 of evaluation. Unexplained
from the trace. It coincides with API credits being added to the account on
2026-08-07, so spend may have stopped being attributed when billing changed. If
so, the harness's reported run cost understates reality.

## Duplicated test work across sprints

Each sprint wrote its **own new test file** rather than extending the previous
one, leaving four overlapping files for one module: windowing is tested 13 times
across three files, lookback 10 times, merge 6. 91 hermetic tests where perhaps 60
would do. All green, so this is redundancy rather than a defect — but it is work
the run paid for twice.

## Scope: clean

`bot.py`, `documents.py`, `app.py`, and the frontend were never touched;
`~/.voice-tutor/` was read-only throughout; production on `:7860` was never
contacted. The branch base is 2 commits behind `main` (the `_originals/` upload
fix and the deploy note landed after launch); neither touches the coverage lane.

## Disposition

Salvage rather than re-run. The expensive part — the module and its 91 hermetic
tests — is built and green. What remains is finishing the smoke's proof and
re-aiming its cost assertion at something true. Branch stays unmerged pending
review.
