# Session Brief — Wire the Live Coverage Loop (Phase 2)

**Date:** 2026-08-08
**Session type:** supervised CC session on live code — this touches `bot.py` and the *running* session lifecycle
**Repo:** `~/development/voice-tutor`, `main` at `414c96a` or later
**Module branch:** `run-msjma91f` — the incremental judging module, 91 hermetic tests + a credentialed smoke, reviewed, **unmerged**

**No deadline.** Phase 1 is live and working. This is the piece that makes the meter move *while* the user is talking.

---

## Read first, in this order

1. `~/second-brain/products/voice-tutor/planning/2026-08-02-live-coverage-design.md` — the design, especially the phase-2 spec and the incremental-judging amendment.
2. **The review of `run-msjma91f`** — three HIGH, five MEDIUM findings, all at the module-caller boundary. These are this session's agenda, not a separate cleanup. Read them before proposing anything.
3. `~/second-brain/products/voice-tutor/planning/2026-08-07-incremental-judging-goal.md` — what the module was built to do, and what was deliberately left out.
4. The module itself on `run-msjma91f`, plus `incremental_coverage_smoke.py`.
5. `bot.py` — the session lifecycle: pipeline setup, turn handling, teardown, `on_client_disconnected`.
6. `app.py` and `static/study.html` — the existing coverage routes and the ended-view polling, so the live surface follows the same patterns.

## What this session builds

A **live judging loop**: while a study session is running, periodically judge the new turns against the still-uncovered claims, and expose the growing coverage number so the UI can show it moving.

Per the design: a periodic asyncio task started alongside the pipeline, **never inside it**. It copies the append-only turns list, runs the judge off-thread, and parks the result in an in-memory per-session slot that a route exposes for the frontend to poll. It touches no frames and holds no pipeline references, so a slow or failed pass is invisible to the conversation.

## Non-negotiable constraints

- **The judge never blocks or delays the voice path.** Not once, not on a slow pass, not on a failure. This is the constraint everything else bends around.
- **The teardown pass stays the strict record and the only sidecar writer.** Live passes are provisional; the full-transcript pass at session end corrects them.
- **Claims are never user-facing.** Counts and ids only.
- **The bar opens at the accumulated cross-session number**, not zero.
- **Cancel the live task before teardown** so a live pass and the strict pass never run concurrently.
- **The tutor does not consult coverage to steer.** Unchanged in v1.

## The review findings — fix these as part of wiring

All three HIGH findings are about the boundary between the module and its caller. The caller doesn't exist until this session, which is why they were deferred.

**HIGH 1 — the production path can crash the caller.** Client setup sits outside the try block. With the default `client=None` — the only configuration production uses — an SDK import or constructor failure escapes as an exception instead of degrading. No test touches this path because every test injects a fake client. Move the setup inside, and add a test that exercises the real construction path with a deliberately broken client.

**HIGH 2 — failed passes make requests grow without bound.** The module returns the watermark unchanged on failure (correct — nothing was judged), so a caller honoring it re-sends every unjudged turn next time. Measured: six consecutive failures took turns-sent from 5 to 39, over four times the intended bound. The outage that triggers this is exactly when the largest payload hurts most. **The caller needs a policy** — see the decision below.

**HIGH 3 — a reasonable caller can silently freeze coverage forever.** The module requires the whole transcript from index zero on every pass, because turns without explicit indices are renumbered from list position. That precondition is undocumented. A caller keeping a bounded buffer of recent turns — the obvious memory optimization — pins every later turn below the watermark, and coverage freezes while still reporting `ok=True` with no error.

Three options, in preference order:
- **(a) State the precondition and enforce it.** Document it, and if the list is shorter than the watermark, raise — that's impossible input. Converts a silent freeze into a loud error. Cheapest.
- **(b) Turns carry their own index.** The module trusts the label instead of counting position, so any slice works. More robust; only worth it if the turn format is being touched anyway.
- **(c) The module owns its own position.** Fewer caller mistakes, but it makes the module stateful, which was deliberately avoided.

Take (a) unless (b) falls out naturally from the wiring.

**DECIDED 2026-08-08: (a).** (b) does not fall out naturally. `bot.py`'s turn dicts
carry no index, and the teardown pass reads the *same* list — so labelling turns for
the live path would put the two passes in different index spaces, which is a worse
problem than the one it solves. The live caller passes the full snapshot every pass,
so the enforced precondition never fires in production; it exists as a tripwire for
the next caller.

**MEDIUM 4 — two concurrent passes lose one's work.** `merge_pass` returns new objects and needs a read-modify-write, which isn't atomic; a demonstrated race dropped a claim. The monotonic guarantee holds for a single-threaded caller only. A live polling loop is exactly where overlap happens — so **the caller must guarantee passes never overlap** (a lock, or a single task that never runs concurrently with itself). Make that structural, not a comment.

**MEDIUM 5–8** — a failed pass corrupts the under-credit measurement (the simulation driver advances its watermark on failure and the smoke never reads the error list); a `covered_ids` passed as a bare string silently disables the whole cost saving; `None` inputs raise uncaught `TypeError` from rehydrated state; the all-covered early return freezes the watermark and arms a huge catch-up if the claim set grows. Address what the caller can hit; record the rest.

## The decision I need to make — surface it, don't decide it

**DECIDED 2026-08-08: cap the catch-up.** When live passes fail, never send more than the normal window — accept that some turns get skipped live rather than letting the request grow unboundedly. Reasoning: the teardown pass re-judges the entire transcript from scratch, so anything a live pass skips isn't lost, only late. Skipping is nearly free; an unbounded request during an outage is genuinely dangerous. Accepted cost: during a failure run the live number drifts further behind, and the correction at teardown is bigger — but it jumps *up*, which is the safe direction.

**REVERSED later the same day — stop the loop after 3 consecutive failures.** The
decision above is kept verbatim because its reasoning is still half-right: capping
the request *is* the correct bound on any single pass, and teardown *does* correct
everything. What it missed is the second axis. Capping is bounded **per pass and
unbounded in total** — it keeps paying, pass after pass, through an outage, for a
bar that is drifting further behind the whole time. Stopping is bounded on both
axes, and buys back nothing that teardown wasn't already going to fix.

The reversal came from laying the options against each other in a table
(stop / cap / backoff × what-a-tester-sees × cost-under-failure). The cap option
looked strong when compared only against unbounded backoff, which was the
comparison the original reasoning made; against *stopping*, its total-cost column
is what gives it away. The generalizable bit: "bounded" is not one property —
ask bounded *per unit of work* and bounded *in aggregate* separately, because an
option can be one and not the other, and the failure case is exactly where the
difference bites.

What a tester sees under the new policy: the bar freezes at its last good number
for the rest of the session — indistinguishable from a quiet stretch of
conversation — then jumps at teardown. Live passes stop spending entirely after
the third consecutive failure; the strict pass at teardown is unaffected and still
runs.

**Also decided 2026-08-08 (cadence).** Start slower than the design's spec: a
90–120s floor, ~6 passes per session, as a named documented constant so it is one
line to tighten. Reason is measured, not cautious — the credentialed smoke put one
session's live judging at **$0.695** (20 passes at ~$0.035 each, i.e. each live
pass costs about what a full teardown pass costs). The flat-*latency* property
held perfectly; the flat-*cost* property did not, because today's prompt still
emits a verdict per uncovered claim. Until the v3 prompt lands, cadence is the
only cost lever, and the design's own stated lag tolerance (~a minute) means a
slower cadence costs almost nothing in feel.

**Also decided 2026-08-08 (ledger).** Do **not** mint a new row kind. Live passes
write `kind: "coverage"` with a new `pass_type: "live"|"teardown"` field. A reader
that does not know about a new *field* keeps counting the money correctly; a
reader that does not know about a new *kind* silently drops the row — which is
exactly the trap this repo already shipped once. A live-vs-teardown split is still
added to `reconcile_costs`' reporting, but as display, not as a correctness
dependency.

## Make teardown a background correction, not something the user waits for
**This is a goal of this session, not an afterthought.** Today the ended view polls for the teardown judge and gives up at 60s — a 22-minute session lost that race at 61.5s, and the poll cap had to be extended to 120s as a patch. The latency scales with turns × claims, so a fixed display budget keeps losing on longer sessions.

Once a live bar exists, that shape should change: **show the live number immediately on the ended view, and let the strict teardown pass settle in the background.** Same work, no waiting. The user sees their coverage the instant they hang up; the number may tick up a little when the strict pass lands.

What this requires the session to think through:
- The live number must be available to the ended view at disconnect — in-memory state disappears with the session, so something has to hand it off.
- The strict pass still writes the sidecar; the ended view just stops *blocking* on it.
- Whether the ended view should indicate a pending correction, or simply update quietly when it lands. Matt's standing preference is that a number changing while someone reads it is worse than one arriving late — but that reasoning applied to a number that was *wrong* (it excluded the just-finished session). A live number that's already roughly right and settles upward is a different case. Propose, don't assume.
- The 120s poll extension may become unnecessary. Say so if it does.

**And a related open question, answered for now:** teardown judging stays required. It is the only sidecar writer (live passes are in-memory), the only pass that sees the whole transcript (so it catches distributed explanations no window contains — the c49 case cited turns [4,6,8,14,16]), and the strict one (c4 was credited by both live runs and correctly rejected by teardown). Capping the catch-up makes teardown *more* necessary, not less. It could only be dropped if live and full passes were measured to agree closely across many sessions — that data doesn't exist.


## Cost accounting — do not skip

Each live pass spends real money. **A new ledger row kind means updating its readers in the same change** — `reconcile_costs.py` (`_row_kind`, range filtering, `summarize_ledger`, row counters) and `cost_audit.py`. This exact trap already shipped once: teardown judging's `kind:"coverage"` rows were invisible to reconciliation until a reviewer caught it, and the tool would have reported the gap as phantom drift. A row without its own timestamp must be joined to its session's `session_start`.

Measured economics for sizing: incremental passes cost roughly a third of full re-judging (0.66–0.78 ratio across two measurements), not the 4× saving the design predicted — because today's judge prompt still emits a verdict per uncovered claim. The 4× needs a v3 prompt, which is separate active work.

## Explicitly out of scope

- **Judge prompt authoring.** v3 is separate, active, and gated on the variance work. Take today's prompt as given.
- **Any steering change.** The tutor doesn't consult coverage.
- **Topics, navigation, per-topic display** — phase 3.
- **Changing teardown judging**, which stays the strict record.
- **Majority-of-N judging** — an open decision tracked separately.

## Session shape

- **Phase A:** read, then propose. The wiring shape, the HIGH fixes, the concurrency guarantee, the ledger changes, and the failure-policy options. **Stop and report before writing code.**
- **Phase B:** merge `run-msjma91f` to `main` first (it's reviewed and waiting), then implement.
- **Phase C:** hermetic tests, then a real session in the dev lane — watch the number move while talking, and confirm the teardown pass still lands and still corrects.
- **Phase D:** independent review in fresh context before merge. This touches the live session lifecycle; that's the high end of the blast-radius scale.

## Hard rules

- **Never restart production without confirming idle** — probe the *server child* (`lsof -ti :7860`), not the launchd wrapper, and confirm the probe returns something before reading zero UDP as idle.
- **A merge is half a deploy.** `static/` is served per-request, so merged frontend goes live immediately while Python waits for the restart. Merge and kickstart together; verify *after* the restart, never in the gap.
- **Create feature branches in a worktree**, never with `git checkout -b` in the live checkout.
- `local-dev` in `~/development/voice-tutor-dev` is behind `main` — rebase before any local test is believable.
- The dev lane shares `~/.voice-tutor/` and the vault with production: a `:7861` session writes real ledger rows and real vault artifacts.
- Don't push without being asked.
- Prove a probe works before reading its silence as evidence.

## Done means

The meter moves during a live session; the loop cannot touch the voice path; failures degrade to no coverage data rather than a broken session or an unbounded request; the teardown pass still writes the strict record and still corrects the live number; costs are recorded *and* reconcilable; one real session verified in the dev lane; reviewed in fresh context; waiting on my merge call.
