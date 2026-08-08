---
date: 2026-08-08
type: findings
status: built on `feat/live-coverage-loop`, unmerged, unreviewed; one real session run
session: e5b75522
branch: feat/live-coverage-loop
---

# Live coverage loop — wiring, and what the first real session showed

Phase 2 of [[2026-08-02-live-coverage-design]], built against
[[2026-08-08-wiring-brief-live-coverage-loop]]. The module it wires
([[2026-08-07-incremental-judging-goal]], run `msjma91f`) was merged to `main`
locally at the start of this session.

## The headline: the meter works

A live in-session coverage meter climbed while Matt talked, on a real 11-minute,
51-turn session against the 63-claim Graph Engineering map. Four live passes, all
successful, no audible or measurable effect on the conversation.

## What the session measured

| | |
|---|---|
| Session | `e5b75522`, 51 turns, 14:34:16 → 14:46:13 PDT |
| Live passes | 4 (0 → 0 → 2 → **4** claims credited) |
| **Live meter at hangup** | **25/63 = 39.7%** (21 prior union + 4 live) |
| **Teardown strict** | **1/63** — only `c58` |
| **Ended view after teardown** | **22/63 = 34.9%** |
| Coverage spend | **$0.1895** (4 live @ ~$0.035, teardown $0.034) |
| Sidecar landed | **+57s** after disconnect |
| Recap landed | +20s after disconnect |

## Three findings

### 1. The displayed number went DOWN, and the floor was in the wrong place

The route built for the live bar returns `union(stored coverage, live set)`, which
is monotonic by construction. **But the ended view does not call that route.** It
renders from `/api/sessions/{id}/telemetry`, which reads the strict sidecar and
the stored union — so the live number never reached it. The floor was real at the
endpoint and absent from the product.

Two symptoms, one cause: immediately after hangup the ended view showed the
*pre-session* number (the sidecar did not exist yet), and after the sidecar landed
it showed 22 against the live meter's 25.

**Unresolved by design — the display decision is Matt's and was deliberately not
made.** Note that flooring the ended view would only *defer* the drop: the
inflated 25 exists solely in memory, while the picker, the pre-connect meter and
the next session's opener all read the stored union, which is 22.

### 2. The strict pass rejected 3 of 4 live credits — the opposite of the design's prediction

The design expects live to UNDER-credit (a windowed pass cannot see an explanation
spread across a session) and teardown to correct upward. This session went the
other way: `c55`, `c56`, `c59` credited live, rejected strict; only `c58` survived.

The downward-settle warning fired correctly with both numbers.

**One sample of a stochastic judge, and not a rate.** The judge's measured noise
band is ~±1.5 claims (see the variance work in
[coverage-experiment/README](coverage-experiment/README.md)); a 3-claim gap sits
outside it, but direction and magnitude need the multi-run protocol, not one
session. This is what the evidence recording below exists to answer.

### 3. The recap is slow, but the live loop did not make it slower

20s from disconnect to recap. Against history: 23s (8/06), 22s (8/05), both
**before** the live loop existed; the ~5s figure in memory was a 17-turn session.
Cancelling the live task at disconnect cost **1ms** — no pass was in flight.

Tracked as its own backlog item.

## A bug found on the way: a bare `pytest` was spending real money

The incremental-judging module shipped its credentialed smoke as a **pytest node**
rather than a standalone script. Its only cost guard was "skip when no API key is
reachable" — but the key is read from the app `.env` by **absolute** path, which
resolves from every worktree on this machine and from the live checkout. The skip
could therefore never fire: every bare `pytest` made ~24 real Haiku calls (~$0.80,
several minutes) instead of running a hermetic suite in ~6 seconds.

The node's own docstring carries the reasoning error — it asserts the `.env` is
"absent in a worktree", which is true of a relative path and false of the absolute
one it uses. This also broke the convention phase-1's `coverage_smoke.py` states
explicitly ("NOT part of the hermetic verifier", run once by hand).

**Hit twice before diagnosis**, both runs killed mid-flight; unmeasured spend
bounded by ~$0.80/run. Now gated on `VOICE_TUTOR_RUN_CREDENTIALED_SMOKE`, opt-IN,
because the failure mode of forgetting to opt *out* is silent spend on every run.

**The generalizable bit:** the branch-era claim of "759 tests in under 6 seconds"
was measured where the smoke skipped. A test that silently changes cost and
runtime depending on whether a credential happens to be reachable is a test whose
green is not comparable across environments.

## What was built

- The live loop in `bot.py` — a single task, cancelled and awaited before
  teardown. Holds no pipeline reference and copies the turns list, so the voice
  path is unreachable from it.
- `live_coverage.py` — the in-memory slot, keyed on `(user_id, session_id)` so the
  key *is* the authorization boundary.
- `live_coverage_evidence.py` + `live_vs_strict.py` — per-pass evidence written at
  pass time, and the analyzer that joins it against the strict sidecar. Added
  specifically because finding 2 was unauditable: the live loop wrote nothing, so
  a disagreement could be counted but never explained.
- Ledger rows use `kind:"coverage"` with a `pass_type` FIELD, never a new kind — a
  reader that has never heard of a field still counts the money; one that has
  never heard of a *kind* drops the row silently.
- The review's HIGH/MEDIUM findings fixed, each new test proven to fail against
  the unfixed module.

**Unbounded request growth (review HIGH 2) needed no retry policy**: the per-pass
slice is computed from the watermark rather than the end of the transcript, so a
retry after a failure sends the same bounded slice. Growth is impossible by
construction; the 3-consecutive-failure budget bounds the total.

## Open

- **The display decision** — which number the post-session surfaces show.
- **Independent review in fresh context** (Phase D) has not run. The branch touches
  the live session lifecycle and has had only its author as a reader.
- **Evidence has zero files on disk** — the recorder postdates the only session
  run so far. A few more sessions make findings 2 answerable.
