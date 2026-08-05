# Session Brief — Coverage Bar (read path + UI)

**Date:** 2026-08-05
**Session type:** supervised CC session on live code (`app.py`, `static/study.html`)
**Repo:** `~/development/voice-tutor`, `main` — coverage judge merged and live in production (teardown judging is ON)
**Deadline:** the bar is the demo deliverable for the meetup on **Tuesday 2026-08-11** (6 days)

---

## Read first, in this order

1. `~/second-brain/products/voice-tutor/planning/2026-08-02-live-coverage-design.md` — the design. Read the display decisions, the steering roadmap, and **the asymptote constraint section** in particular.
2. `~/second-brain/products/voice-tutor/validation/2026-08-04-coverage-teardown-judge-review.md` — the review findings, especially finding 3 (the read path raises where it promises to degrade) and the carried-forward residuals.
3. `coverage_store.py` — the read path being wired.
4. `app.py` — existing session routes and how they authorize (`session_belongs_to`, user-scoped path construction).
5. `static/study.html` — the study UI and its existing polling pattern.

## What exists today

The judge runs at teardown and writes a per-session sidecar. `coverage_store.union_for_document` computes accumulated coverage across a document's sidecars. **It has exactly two callers: `backfill_coverage.py` and tests.** No route, no UI. This session connects it to something a user sees.

Real data to build against: the matt Graph Engineering doc (`2aa66acc`, 63 claims) has 6 backfilled sessions and reads **16/63 = 25.4%**.

## Scope, in three parts

### Part 1 — fix the reader before it has an audience (finding 3)

Two reproduced cases where `union_for_document` raises instead of degrading:

- One structurally-invalid sidecar (e.g. `covered` not a bool, `verdicts` not a list) makes the whole union raise `CoverageInputError` — even though `iter_sidecars` deliberately skips unreadable files "so one corrupt file must not cost the user their whole coverage number." The skip covers unparseable JSON, not invalid structure.
- `source_hash=None` is documented as "merge every sidecar regardless of map version" but raises whenever versions actually differ — i.e. exactly its use case.

Both must degrade: skip the bad sidecar, count it in a `skipped`/`stale` tally, return the number from what's valid. **A single bad sidecar must never become a 500 and a blank panel.** This is constraint 2 of the design (a coverage failure degrades to no coverage data, silently) applied to the read path.

### Part 2 — the route

A route in `app.py` serving accumulated coverage for a document, for the authenticated user. Follow the existing authorization pattern exactly — user-scoped paths built from the authenticated `user_id`, never an unscoped read keyed on a client-supplied id. Note the review's standing warning: ownership-by-file-presence is safe **only** while every consumer is user-scoped.

Shape it to serve the display, not the internals: the union count, the claim total, the session count, and — if topics exist in the claim map — the per-topic rollup. **Claims are never user-facing**; claim text must not appear in the response.

### STOP HERE and report before building any UI

Show Matt the real numbers the route returns for the Graph Engineering doc: the union, the total, session count, and whatever topic structure actually exists in the claim map (or state plainly that it doesn't). He is deciding what the bar displays **while looking at real data**, not while imagining it. Do not design the frontend before this.

### Part 3 — the frontend

Built after Matt's call on Part 2's data. Constraints from the design doc that hold regardless of what he picks:

- **Claims are never displayed.** Topics are the display layer.
- **The bar opens at the accumulated cross-session number**, not zero.
- **The number can jump up at teardown** — live passes under-credit distributed explanations (a real case cited turns [4,6,8,14,16] for one claim), so UI copy must not promise smooth incremental movement.
- **The asymptote:** 100% will likely never be reached on any document — the claim map is exhaustive (majors + minors + asides) and conversation never naturally reaches the parentheticals. A bar that cannot fill reads as failure. Display options recorded in the design doc: topics as the completable unit with the overall number as quiet inventory; color rating (ordinal, promises no terminal state); or a hybrid. Matt decides in Part 2's stop.
- **Failure is invisible, not broken.** No coverage data ⇒ the panel is absent or quiet, never an error state.

## Explicitly out of scope

- The **live in-session loop** (phase 2 — judging mid-session so the bar moves while talking). Spec'd in the design doc; not this session.
- Any **steering** change — the tutor does not consult coverage in v1.
- Re-extracting claim maps or backfilling old sessions.
- `backfill_coverage.py`'s missing ledger row (recorded residual; close it before any large backfill, not now).

## Session shape

- **Phase A:** read, then propose Parts 1 + 2 (the reader fix and the route shape). Stop and report before writing code.
- **Phase B:** implement Parts 1 + 2, hermetic tests.
- **Phase C:** the STOP — show Matt real numbers.
- **Phase D:** frontend, after his call.
- **Phase E:** live check in the dev lane, then review before merge.

## Hard rules

- **Never restart production without confirming idle** — UDP sockets (WebRTC media is UDP), not just the HTTP log. Production is live and currently serving the merged judge.
- `local-dev` in `~/development/voice-tutor-dev` is **behind `main`** — rebase before any local test is believable.
- The dev lane shares `~/.voice-tutor/` and the vault with production: a `:7861` session writes real ledger rows and real vault artifacts.
- Don't push without being asked.
- Prove a probe works before reading its silence as evidence (see CLAUDE.shared.md).
- Teardown is a latency budget, not a sequence — the ended view gives up at 60s (see project CLAUDE.md).

## Done means

The read path degrades instead of raising, a route serves coverage safely to the authenticated user, the bar renders the accumulated number in the study UI, one live session in the dev lane confirms it end to end, reviewed, and waiting on Matt's merge call.
