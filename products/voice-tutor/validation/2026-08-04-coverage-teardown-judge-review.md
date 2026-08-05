---
last_updated: 2026-08-04
status: review complete, fixes applied, merge call pending
branch: feat/coverage-teardown-judge
---

# Coverage teardown judge — independent review findings (2026-08-04)

Independent cold review of `feat/coverage-teardown-judge` (6 commits, ~1,700 lines,
11 files) against the brief's four hard constraints. Report-only review, followed by
a fix pass. Related: [[2026-07-20-provider-reconciliation]] (the reconciliation tool
finding 1 protects).

## Verdict on the hard constraints

| Constraint | Verdict |
|---|---|
| 1. Judge never blocks/delays the voice path | Holds. Created only in the disconnect handler, runs in a worker thread, nothing in the pipeline awaits it. |
| 2. A coverage failure degrades to "no coverage data" | Holds on the write path. Did **not** hold on the read path — see finding 3, still open. |
| 3. Coverage is append-only / monotonic | Holds. Single choke point in `write_sidecar`, no `overwrite=` at the bot call site. |
| 4. Cross-document / re-extracted maps never merge | Holds, two independent layers (`document_id` + `source_hash` filter, then the `doc_id` guard in `union_coverage`). Verified by probe: a re-extracted map's sidecars are excluded and counted as `stale_sessions`. |
| 5. `VOICE_TUTOR_COVERAGE_JUDGE` disables everything | Holds. No model call, no sidecar, no ledger row. Only residual is a stdlib-only, network-free import. |

The per-claim citation downgrade (`repair_turn_citations`) does **not** weaken the
check in the direction that matters: every repair moves coverage down and cannot
credit unsupported coverage. What it removed was the loud-failure signal — that is
finding 2.

## Fixed in this pass

**1. Coverage spend was invisible to `reconcile_costs.py` (blocking).**
`bot.py` writes a `kind: "coverage"` ledger row with real Haiku tokens;
`_row_kind` returned unknown kinds verbatim and `summarize_ledger` dropped them
("Unknown kinds contribute nothing"). Every judged session's ~$0.03 would have sat
in the ledger but been excluded from local totals, so reconciliation would report
the provider ahead of us — a phantom logging error of exactly the shape that tool
exists to distinguish from real drift.
*Fix:* named `coverage` in `_row_kind`, summed into the Haiku bucket and
`recorded_anthropic_usd`, joined to its session's time for range filtering (it has
no timestamp of its own, like an artifact row), and surfaced in the row-count line.
Failed rows count their burned tokens too. Tests: `test_reconcile_costs.py`.

**2. A wholesale citation failure wrote a permanent false zero (blocking).**
If the model cites in a different index space (1-based, line numbers, ids from
another rendering), per-claim repair downgrades *every* covered verdict and produces
a well-formed "0 of 63 covered" sidecar. Under append-only that zero is permanent —
never re-judged without `--force`. It is a transport failure wearing a coverage
number.
*Fix:* new `MassCitationDowngradeError` (a retryable `VerdictParseError`) plus the
pure `is_mass_citation_downgrade()`. Fires only when ≥`MIN_MASS_DOWNGRADE_CLAIMS`
(2) claims were downgraded **and** nothing survives — so it retries once and then
degrades to no coverage data, rather than persisting the zero.
*Deliberate residual:* a session where the model asserts exactly **one** covered
claim and miscites it still writes a zero. Below the corroboration threshold there
is no evidence distinguishing "slipped on its only claim" from "every index is
wrong", and lowering the threshold to 1 would swallow the per-claim repair path the
branch exists to add. Revisit if it is ever observed in the wild.

**5. `save_transcript` had no `try/finally` around its middle.** A raise between
task creation and the await loop (full disk on `.usage.json` / `cost-log.md`, an
`OSError` in `append_to_memory`) skipped the await loop, leaving the recap and judge
tasks referenced only by a dead frame's local list — the weak-reference GC hazard the
code's own comment cites — and skipped `await task.cancel()`.
*Fix:* the middle is now `try` with the await loop in `finally`, and the disconnect
handler wraps `save_transcript()` so `task.cancel()` runs whatever happened.

**6. The new traversal regression test passed vacuously.** `pathlib` + `os.stat`
only traverse `..` through a directory that really exists, and the test never
created `transcripts/sarah/`, so the assertion held whether or not the guard was
present — the exact trap CLAUDE.md records.
*Fix:* seed sarah's own transcript first. Verified by removing the guard: the test
now fails without it and passes with it.

**7. Ledger row ordering and a confident zero.** The coverage cost row was written
after the sidecar inside the same `try`, so a failing sidecar write also swallowed
the cost record — losing spend in exactly the failure case the write-either-way rule
exists for. And `cost_usd` was computed with `.get(..., 0)`, emitting a confident
`$0.0000` when no call reported usage, contradicting the same row's deliberate
choice to omit unobserved token fields.
*Fix:* ledger first, in its own `try`; `cost_usd` is only computed when at least one
token count was actually observed.

Suite: **585 passed, 1 xfailed** (was 574; +11 new tests).

## Open — carry into the read-path/wiring work

**3. `union_for_document` raises where it promises to degrade (blocks the bar, not
the merge).** Two cases, both reproduced:
- one structurally-invalid sidecar (`covered` not a bool, `verdicts` not a list)
  makes the *entire* union raise `CoverageInputError`, even though `iter_sidecars`
  is written to skip unreadable files "so one corrupt file must not cost the user
  their whole coverage number" — the skip covers unparseable JSON, not invalid
  structure;
- `source_hash=None`, documented as "merge every sidecar regardless of map version",
  raises whenever map versions actually differ, i.e. the only case it exists for.

Today the only caller is `backfill_coverage.py`, so the blast radius is one script.
**The moment this reader backs a route it is a 500 and a blank panel** — constraint 2
inverted. Fix alongside the progress-bar wiring: skip bad sidecars per-item, and make
`source_hash=None` group by `doc_id` rather than raise.

**Also for the wiring work:** the read path is currently unwired. `union_for_document`
has exactly two callers — `backfill_coverage.py` and the tests. There is no route in
`app.py` and no reference to coverage in `static/study.html`. The branch delivers the
writer, the backfill, and a reader nothing user-facing exercises.

**Deliberately out of scope this pass:** `cost_audit.py` still tolerates `coverage`
rows as an unknown kind and never recomputes their `cost_usd`. Adding an audit branch
is a separate call from the reconciliation fix.

## Observations and known-unknowns

**4. Teardown holds the pipeline open for the life of the judge (~50s).**
`on_client_disconnected` now awaits `save_transcript()`, which awaits both background
tasks before `await task.cancel()`. Every study session keeps its pipeline, STT and
TTS connections alive ~50s past the conversation. Not a correctness break — pipecat
registers this handler as non-sync, so it runs in its own task and the transport's
disconnect path is not blocked. Left as-is: reordering (cancel first, then await) is
not trivially safe, because transport cleanup waits on its own event tasks, one of
which is this handler.
- **Open check:** does Deepgram bill for an idle open live-stream connection? If yes,
  the ~50s tail has a per-session cost and the ordering deserves revisiting. Not
  measured. Settle it against the Deepgram usage API for a window of known sessions
  (per the "rule out yourself first" method in [[2026-07-20-provider-reconciliation]]).

**Known-unknown: reconnect during teardown.** The judge reads `transcript["turns"]`,
the same list object the turn handlers append to. If a WebRTC reconnect can fire
`on_client_connected` while the judge thread is iterating, the judged transcript would
be skewed (not crashing — lists don't raise on concurrent size change). Could not
establish from the pipecat 0.0.108 source whether a reconnect after
`_handle_client_closed` is reachable in this configuration.
- **Trigger / settling test:** drop and restore the connection mid-teardown on a live
  session and check whether a second `on_client_connected` fires against the same bot
  instance. Not chased now.

## Ownership check (focus area 3)

No, a crafted `session_id` or `user_id` cannot prove membership of another namespace.
The probe path is built from the authenticated `user_id`, both halves collapse to one
path component, and all four `app.py` call sites read only user-scoped paths
afterward. The two sources disagree only by the transcript answering earlier than the
ledger, which is the intent.

**Property to preserve:** ownership is now "a file with that name exists in my
directory", which a user can mint for any id by starting a session with it. Harmless
today because every consumer is user-scoped. A future route that uses this predicate
and then reads an *unscoped* path by `session_id` would leak.
