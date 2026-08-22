# Session Brief — Coverage Bar, Phase 1 (read path + two display surfaces)

**Date:** 2026-08-05
**Session type:** supervised CC session on live code (`app.py`, `static/study.html`)
**Repo:** `~/development/voice-tutor`, `main` — coverage judge merged and live in production (teardown judging is ON)

**Self-set milestone: both display surfaces working on Matt's phone by Monday night 2026-08-10.** The 8/11 meetup is conversation and recruiting, not a live demo — but Matt wants something showable if a conversation goes that way, and a self-chosen deadline creates useful pace. Missing it costs nothing.

**The demo this enables** (and it's the right one for a loud room — no audio, no headset, ~30 seconds): open the picker → "these are documents I've studied, that bar is how much of each I've actually covered" → tap into one → show the ended view from a past session. Design both surfaces with that walkthrough in mind.

---

## Product decision (Matt, 2026-08-05) — the phasing

1. **Phase 1 (this session):** coverage becomes visible on two read-only surfaces — the post-session recap view and the document picker. Nothing touches the live session or `bot.py`.
2. **Phase 2 (next):** real-time coverage during a session (the live judging loop, already spec'd in the design doc).
3. **Phase 3 (later):** topics and navigation. **Explicitly deferred** — see "On topics" below.

Each phase leaves the next fully open. Phase 1 commits to no display decision beyond the two surfaces below.

## On topics — deferred, and why

Topics are **two separate ideas** that share a data source, and neither is in scope here:

- **Topics as navigation** — a structural view of the document you can steer with (Matt's framing: like Spotify's lyrics view, tap a line to jump there). Valuable independent of coverage.
- **Topics as coverage granularity** — per-topic progress instead of one number.

Blocking question for both, unresolved: **where do topics come from?** Claims today carry only `id`, `claim`, `anchor`, `anchor_start`, `anchor_end`, `anchor_unresolved`, `resolution` — no topic/cluster/section field, and `CLAIMS_TOOL` is `strict: True` with `additionalProperties: false`, so the model structurally cannot emit one. Options: (a) schema change + re-extraction (**orphans every existing sidecar** — the backfilled 25.4% dies), (b) a separate clustering pass, (c) derive from heading offsets — works on Matt's wiki markdown, **does not generalize** to arbitrary user uploads (scanned PDFs, transcripts, unstructured notes). Decide after using coverage for real, not before.

---

## Scope

### Part 1 — fix the reader before it has an audience (review finding 3)

`coverage_store.union_for_document` raises where it promises to degrade. Two reproduced cases:

- One structurally-invalid sidecar (`covered` not a bool, `verdicts` not a list) makes the whole union raise `CoverageInputError` — even though `iter_sidecars` deliberately skips unreadable files "so one corrupt file must not cost the user their whole coverage number." The skip covers unparseable JSON, not invalid structure.
- `source_hash=None` is documented as "merge every sidecar regardless of map version" but raises whenever versions actually differ — i.e. exactly its use case.

Both must degrade: skip the bad sidecar, count it in a `skipped`/`stale` tally, return the number from what's valid. **A single bad sidecar must never become a 500 and a blank panel.** This is design constraint 2 (a coverage failure degrades to no coverage data, silently) applied to the read path.

### Part 2 — the route(s)

Serve accumulated coverage for the authenticated user. Two consumers with slightly different needs:

- **Ended view:** the accumulated total for the document **and** what this session contributed. Session delta = claims this session's sidecar covered that no prior session had covered. If the session's sidecar is missing (judge failed, refused, or flag off), the total still renders and the delta is simply absent — never an error.
- **Document picker:** accumulated coverage per document, for the list of documents the user can see. Watch the N+1 shape — the picker may list many documents; don't make it a per-document round trip if one call can serve the list.

Authorization: follow the existing pattern exactly — user-scoped paths built from the authenticated `user_id`, never an unscoped read keyed on a client-supplied id. The review's standing warning: ownership-by-file-presence is safe **only** while every consumer is user-scoped.

**Claims are never user-facing.** No claim text in any response. Counts and ids only.

### Part 3 — the two display surfaces

**A. Post-session recap view** (`static/study.html` ended view) — coverage displayed alongside the recap, prioritized with it (not buried in the diagnostics footer). Shows **both**: the accumulated total for the document, and the progress made in this session.

**B. Document picker** — accumulated coverage per document, so the picker doubles as a progress view: which documents have been worked, which are untouched.

Display constraints that hold regardless of visual treatment:

- **Mobile is a first-class target, not an afterthought.** Both surfaces must be verified on an actual phone (via the Funnel URL, on real mobile Safari/Chrome — not a narrow desktop browser window). The picker with coverage bars plus swipe-to-delete is exactly the layout that breaks at ~390px. Swipe-to-delete is a mobile-native gesture; desktop needs its own affordance.
- **The bar opens at the accumulated cross-session number**, not zero.
- **Failure is invisible, not broken.** No coverage data ⇒ the element is absent or quiet. Never an error state, never a blank panel, never a spinner that outlives the poll window.
- **A document with no sessions shows no coverage**, not 0% — those read differently to a user.
- **The asymptote:** 100% will likely never be reached — the claim map is exhaustive (majors + minors + asides) and conversation never naturally reaches the parentheticals. Don't design copy that promises a fillable bar or implies completion is the goal. Inventory framing ("16 of 63 claims covered") is safer than a goal framing.
- Recorded but not yet relevant (phase 2): live passes under-credit distributed explanations, so the number can jump up at teardown.

### Part 4 — swipe-to-delete on the document picker

Separate small feature, same session:

- Swipe left on a document row reveals a delete button; tapping it deletes the document.
- **Must work on desktop and mobile.** Desktop needs an equivalent affordance (hover-reveal, or drag with a pointer) — swipe alone strands desktop users.
- Deletion must be **user-scoped** — a user can only delete documents in their own namespace. Same authorization discipline as everything else here.
- **Archive rather than hard-delete** unless there's a good reason not to (Matt's standing rule). Propose the mechanics before implementing: what happens to the document file, its claim map, its coverage sidecars, and any session history pointing at it. Sidecars for a deleted document should not break the picker or the union.
- Needs a confirm step or an undo — an accidental swipe that destroys a warmed document with study history is a bad outcome.

---

## Explicitly out of scope

- The **live in-session loop** (phase 2). Spec'd in the design doc; not this session.
- Any **steering** change — the tutor does not consult coverage in v1.
- Topics, navigation, per-topic progress (phase 3).
- Re-extracting claim maps or backfilling old sessions. (15 pre-2026-07-26 sessions have no claim map; they're on old/test documents Matt doesn't care about. Not planned.)
- `backfill_coverage.py`'s missing ledger row — recorded residual, close it before any large backfill, not now.

## Read first, in this order

1. `~/second-brain/products/voice-tutor/planning/2026-08-02-live-coverage-design.md` — the design, including the storage decisions and the asymptote section.
2. `~/second-brain/products/voice-tutor/validation/2026-08-04-coverage-teardown-judge-review.md` — review findings, especially finding 3 and the carried residuals.
3. `coverage_store.py` — the read path being wired.
4. `app.py` — existing session routes, `session_belongs_to`, user-scoped path construction, and the document listing the picker uses.
5. `static/study.html` — the ended view, its polling pattern, and the document picker.

## Session shape

- **Phase A:** read, then propose Parts 1, 2, and 4's mechanics (reader fix, route shape, delete semantics). **Stop and report before writing code.**
- **Phase B:** implement Parts 1 + 2 with hermetic tests.
- **Phase C:** show Matt the real numbers the route returns for the Graph Engineering doc (`2aa66acc`, 63 claims, 6 sessions, 16 covered) before building UI.
- **Phase D:** the two display surfaces + swipe-to-delete.
- **Phase E:** live check in the dev lane, then review before merge.

## Hard rules

- **Never restart production without confirming idle** — UDP sockets (WebRTC media is UDP), not just the HTTP log. Production is live and serving the merged judge.
- `local-dev` in `~/development/voice-tutor-dev` is **behind `main`** — rebase before any local test is believable.
- The dev lane shares `~/.voice-tutor/` and the vault with production: a `:7861` session writes real ledger rows and real vault artifacts.
- Don't push without being asked.
- Prove a probe works before reading its silence as evidence (CLAUDE.shared.md).
- Teardown is a latency budget, not a sequence — the ended view gives up at 60s (project CLAUDE.md).

## Done means

The read path degrades instead of raising; routes serve coverage safely to the authenticated user; the ended view shows accumulated total plus this session's progress; the picker shows per-document coverage; swipe-to-delete works on desktop and mobile with archiving and a confirm/undo; **both surfaces verified on Matt's actual phone**, not just a desktop browser; one live session in the dev lane confirms it end to end; reviewed; waiting on Matt's merge call.
