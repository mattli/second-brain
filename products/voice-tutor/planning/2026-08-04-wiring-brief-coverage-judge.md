# Wiring Brief — Coverage Judge into Voice Tutor

**Date:** 2026-08-04
**Session type:** supervised CC session on live code (NOT a harness run — this touches `bot.py` and the session lifecycle)
**Repo:** `~/development/voice-tutor`, `main` at `d5a8aa7` (coverage_judge merged, unwired, clean)
**Deadline context:** the coverage bar should be demo-able by the meetup on 2026-08-11.

---

## Read first (in this order, before proposing anything)

1. `~/second-brain/products/voice-tutor/planning/2026-08-02-live-coverage-design.md` — the design. Architecture, storage, the async-off-the-voice-path constraint, the live-bar decisions, the topics/claims display split.
2. `~/second-brain/products/voice-tutor/validation/2026-08-03-coverage-judge-review-findings.md` — the review findings, including the four deferred failure-path items that this session must address (see below).
3. `coverage_judge.py` and `coverage_smoke.py` in the repo — the module being wired, its interface, and its acceptance harness.
4. `bot.py` — specifically the session lifecycle: startup, the teardown path where summary/analysis/recap are generated, and `on_client_disconnected`.

## Non-negotiable constraints (from the design doc)

- **The judge never blocks the voice path.** The Pipecat pipeline must not await judging. A slow or failed judge call must not delay a tutor response or affect the conversation in any way.
- **The tutor does not consult the judge to steer.** It already has the claim map in context and steers from that, unchanged. Coverage is for *reporting*, not steering, in v1.
- **Claims are never user-facing.** The display layer is topics; claim text is verification-grade and stays internal.
- **The live bar starts at the accumulated cross-session number**, not zero — union of covered claims across all prior sessions on that doc.
- **The judge sees only the current session's transcript.** Union happens after, at read time.
- **Storage: per-session sidecar, evidence not conclusions.** Verdicts + cited turns + judge-prompt hash. Percentage derived at read time, never stored as the primary record.

## Scope for THIS session

**In scope — phase 1 (teardown judging):**
- Call the judge during teardown, in the same slot as summary/analysis/recap generation.
- Write the per-session coverage sidecar.
- A read path that computes union coverage across a document's sidecars for a given user.
- Fix the four deferred failure-path findings BEFORE the pipeline calls the judge (see next section).

**Explicitly OUT of scope for this session:**
- The live in-session judge loop (phase 2) — decide the hook shape, don't build it.
- The UI/bar itself, polling, topics rollup — separate work.
- Any change to claim extraction, claim maps, or the tutor's prompts/steering.
- The false-negative probe (separate, vault-side, Matt's judgment).

## The four failure-path fixes — do these BEFORE the pipeline calls the judge

From the review findings doc. All four are the same disease: the module throws away everything when something small goes wrong. That is acceptable in a CLI, unacceptable once a tester's session depends on it.

1. **One bad citation kills all 63 verdicts** (and burns a retry) — downgrade the single claim instead.
2. **A malformed `reason` field fails the whole run** — auditing metadata must never cost the coverage number.
3. **The cost file isn't written when a run fails** — spend goes unrecorded exactly when it spiked.
4. **Partial token counts print as complete** — an unobserved count shows a confident `0`.

**The failure principle for wiring:** a coverage failure must degrade to *no coverage data* for that session, silently and logged — never to a broken session, a lost transcript, a lost recap, or a blank UI that reads as "the product is broken."

## Known landmine — graceful shutdown

There is an open, unfixed issue: **a hard process stop loses the session's transcript, recap, and cost artifacts**, because they're all written during graceful teardown. Coverage will inherit this exact fragility if it's written the same way. Do not fix graceful shutdown in this session, but:
- Note explicitly where coverage sits relative to that risk.
- Prefer writing the coverage sidecar as early as it can be correct, rather than last in a long teardown chain.

Related: `on_client_disconnected` only fires on CLIENT disconnect — a bot-initiated end writes no artifacts unless triggered explicitly.

## Session shape (supervised — Matt is reading, not watching)

**Phase A — read and propose. STOP and report before writing code.**
Propose: exactly where the judge hooks into teardown; the sidecar path and schema; the union read path; how the four failure-path fixes will be implemented; and — design only, not built — where the phase-2 live loop would hook in. Include what could go wrong on a tester's live session.

**Phase B — implement**, after Matt approves the proposal.

**Phase C — verify.** Hermetic tests for the new wiring. Then an end-to-end check on a real session before anything is called done: run a short study session against the dev lane (`~/development/voice-tutor-dev`, `:7861` — **rebase `local-dev` onto `main` first**, it drifts), confirm a coverage sidecar is written, and confirm the union math against a doc with prior sessions.

**Phase D — independent review before merge.** Live-code change, judgment machinery adjacent → full review, fresh context. Merge gate: suite green + review + Matt's go.

## Hard rules

- **Never restart the production server without confirming idle** — check UDP sockets, not just the HTTP log. A quiet log killed a live 16-minute session on 7/30.
- Production is launchd-supervised: `launchctl kickstart -k gui/$(id -u)/com.voice-tutor.server`.
- Do not push without being asked.
- Dev lane shares `~/.voice-tutor/` and the vault with production — a `:7861` session writes REAL ledger rows and vault artifacts. Expect the noise; don't be surprised by it.
- Credentials: the app `.env` at the absolute path. Never echo keys.

## Done means

Judge runs at teardown, sidecar written, union read path working, four failure-path fixes in, hermetic tests green, one real end-to-end session verified in the dev lane, reviewed, and waiting on Matt's merge call. Phase-2 hook shape decided on paper.
