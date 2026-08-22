# Goal: Incremental Coverage Judging Module

**Date:** 2026-08-07
**Type:** self-contained new module — harness lane (no live code, no pipeline wiring)
**Target repo:** `~/development/voice-tutor`, branch from `main` (`a1dd234` or later)
**Design context:** `~/second-brain/products/voice-tutor/planning/2026-08-02-live-coverage-design.md` — read the phase-2 spec and the incremental-judging amendment before proposing anything.

---

## Why this exists

Coverage is judged today by one call at teardown: the full transcript against all claims. That works, but it has two properties that make a live in-session meter impossible:

- **Latency scales with the work.** A 125-turn session against a 63-claim map took **61.5 seconds** — it lost the ended view's 60s poll race. A live loop re-judging the full transcript every pass would get slower as the session went on, exactly when responsiveness matters most.
- **Cost scales the same way.** Output is ~83% of judge cost (measured: $1/MTok in vs $5/MTok out across three real sessions), because the judge emits a verdict per claim. Full re-judging at live cadence was estimated at ~$0.35/session.

The fix is incremental judging with **external state**: keep the covered-claim set in code, and each pass ask the model only about *new turns* against *claims not yet covered*. Both inputs stay small, so per-pass cost and latency stop growing with session length. Estimated ~$0.09/session at spec cadence.

Provenance worth noting: the pattern came from Matt's own Voice Tutor study session on the Graph Engineering document — deduplication with external state, applied to the product itself.

## What to build

A **pure module** implementing incremental coverage judging. No Pipecat imports, no pipeline wiring, no UI. Same shape as `coverage_judge.py` and `coverage_store.py`: stdlib-only at import, lazy Anthropic client, path constants monkeypatchable, hermetically testable with an injected fake client.

**The contract, roughly:**

- **In:** the session's turns so far, the index of the last judged turn, the set of claim ids already covered, the full claim map, and a prompt (see below).
- **Out:** newly-covered claim ids with their evidence (cited turns, reason), the new last-judged-turn index, and the cost/usage for the pass.
- **State is the caller's.** The module does not own or persist the covered set — it receives it and returns additions. This keeps it testable and lets the caller decide where state lives.

**The prompt is a versioned INPUT, not something this module owns.** The judge prompt will keep evolving (v1 → v2 → v3 → …); the module must not hardcode it or depend on its wording. Accept it as a parameter, record which version was used in the output, and build acceptance criteria around *mechanics* against a fixed current prompt — not around specific coverage verdicts.

## The mechanics that need to be right

These are what acceptance should test, because they're what a prompt change can't fix:

1. **Windowing.** Each pass judges new turns *plus a lookback window* into already-judged turns — explanations span turn boundaries. Real evidence: claim `c49` was covered by an explanation citing turns **[4, 6, 8, 14, 16]** — one idea delivered across twelve turns with other topics in between. The spec sets the window at **4 turns** and marks it load-bearing; make it a named, documented parameter, not a magic number.
2. **Monotonic state.** The covered set only grows within a session. A claim marked covered by an earlier pass is never re-examined and never un-covered. This mirrors the append-only sidecar rule already enforced in `coverage_store.write_sidecar`.
3. **Correct exclusion.** Claims already in the covered set are not sent to the model. That exclusion is the entire cost saving — verify it, don't assume it.
4. **Merging.** Newly-covered ids merge into the caller's set without duplication or loss; evidence from the pass is preserved per claim.
5. **Idempotence and boundaries.** A pass over zero new turns does nothing and costs nothing. A pass where every claim is already covered does nothing and costs nothing. Re-running the same pass with the same inputs produces the same additions.
6. **Failure degrades to nothing.** A failed or malformed pass returns no additions and leaves the caller's state untouched — never a crash, never a partial write, never a shrunk set. Same failure principle as teardown judging: *a coverage failure degrades to no coverage data, silently and logged.*

## Known and accepted: live passes will under-credit

A windowed pass cannot see an explanation whose pieces fall outside the window — `c49` above is the proven case. So live coverage will run *low*, and the teardown pass (full transcript, from scratch, still the strict record and the only sidecar writer) will correct it upward at session end.

**This is the safe direction and it is deliberate.** Do not try to engineer it away — do not widen the window until it approximates a full re-judge, and do not re-examine covered claims to "catch up." The design accepts a slightly-low live number in exchange for flat cost and latency.

Do, however, make the gap **measurable**: the module should make it possible to compare a simulated incremental run against a known full-transcript result on the same session, so the size of the under-credit can be measured on real data later rather than argued about. If that's cheap to expose as a test helper or a small CLI, do it.

## Verification

**Hermetic tests** with an injected fake client covering every mechanic above — windowing (including a c49-shaped distributed explanation that a naive window misses and the lookback catches), monotonic state, exclusion of covered claims, merge correctness, the zero-work boundaries, and the failure paths.

**Credentialed smoke — required, not optional.** Per this repo's standing rule, mocks cannot catch transport-layer bugs in an LLM-calling module. Run the real path with real Haiku calls against a real stored transcript from `~/.voice-tutor/transcripts/matt/` (read-only) and assert: passes produce well-formed additions, the covered set grows monotonically across a simulated session, per-pass cost does not grow with session length, and total cost is materially below a full re-judge. Report actual measured cost.

**Do not** tune the prompt, chase specific coverage numbers, or treat verdict correctness as an acceptance criterion. If the module is mechanically right and the prompt is bad, that's a prompt problem tracked separately.

## Out of scope

- **Any pipeline wiring.** `bot.py`, the session lifecycle, and the frontend are untouched. That's a supervised CC session later.
- **The live UI / polling / meter rendering.**
- **Judge prompt authoring.** A v3 prompt is a separate, active piece of work (see the coverage-experiment README). Take today's prompt as given.
- **Changing teardown judging.** It stays the strict record and the only sidecar writer.
- **Persisting live state.** In-memory, caller-owned, for now.

## Hard rules

- Read-only against `~/.voice-tutor/` — never write transcripts, sidecars, ledger rows, or documents.
- Never restart or touch the production server. It is live at `:7860` under launchd.
- Do not push without being asked; leave the branch unmerged for review.
- API key from the app `.env` by absolute path or the environment. Never echo it.
- Prove a probe works before reading its silence as evidence.

## Done means

A pure, hermetically-tested incremental judging module on its own branch, with a documented contract, the six mechanics pinned by tests, a credentialed smoke run reporting real measured cost, and the under-credit gap made measurable — waiting on review and Matt's merge call. Nothing wired, nothing live.
