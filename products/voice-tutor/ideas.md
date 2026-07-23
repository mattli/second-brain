# Voice Tutor — Idea Inbox

> Light capture, no commitment. Promote to planning/ when one earns a design pass.

## 2026-07-18

- **Session recap browser** — display all previous session recaps in the app (list + read view over `~/.voice-tutor/artifacts/`). Makes the recap artifact a durable study surface instead of a one-shot file. → **Promoted to planning 2026-07-18: [past-sessions history goal](planning/2026-07-18-past-sessions-history-goal.md)** (dev-harness goal). Refinement from the design pass: the *list* is driven by `cost-log.jsonl` (it carries title/date/duration/cost — the `artifacts/` dir alone has none of that metadata); the *read* view reuses the existing `loadSessionView(sid)` path, not a new reader. Shared-pool / no-auth / cost-visible for this validation build.
- **Live conversation text stream** — show the transcript text streaming in the UI while the voice conversation is happening. Voice-in/text-out visibility during the session, not just after.

### Harness angle on 1 & 2 (noted 2026-07-18)
Both are candidates for dev-harness UI-capable runs — and UI verification via Playwright was part of the harness's original inspiration, so this is the intended direction, not scope creep. Sequencing: **idea 1 first** — mostly backend (list/read endpoints over artifacts/, hermetically testable) plus one static page verifiable at fetch-level (serves 200, expected element IDs, right endpoints), with Matt's eyeball at the merge gate as the look-and-feel layer. **Idea 2 second** — needs a realtime channel out of the Pipecat pipeline (SSE/websocket from bot.py), riskier and hard to verify hermetically; do after idea 1 proves the UI pattern. **Playwright verifier lane** is the capability investment to make when fetch-level verification first proves insufficient (or when idea 2 demands it) — browser-driven checks as a verifier option alongside pytest.
- **Verify cost logging** — ✅ **Done 2026-07-20** (dev-harness run `mrtt2vyo`; `cost_audit.py` merged to `main` @ `cc9aad7`). Built a pipecat-free auditor that recomputes each row's costs from its own usage fields and checks structure. **Verdict: ledger internally accurate to the cent** — 52 rows, 0 malformed, 0 orphans, 10 sub-penny rounding discrepancies (both directions). Findings: [[2026-07-20-cost-audit-findings]]. Caveat: internal-consistency only — provider-invoice reconciliation is still open (new idea below).
- **Hourly cost in cost analysis** — add cost-per-hour-of-conversation to the cost analysis, so sessions are comparable regardless of length and the "what does a study hour cost" number is visible.

## 2026-07-20

- **Provider cost reconciliation** — ✅ **Done 2026-07-20** (`reconcile_costs.py` @ `c150b9d`, pushed) — pull actual usage/cost from the provider APIs and diff against `cost-log.jsonl`. This is the check the 2026-07-20 internal-consistency audit ([[2026-07-20-cost-audit-findings]]) deliberately can't do: it catches wrong prices and wrong usage counts, not just bad arithmetic. **Approach:** a one-shot verdict script first (a regular Claude Code task, **not** a harness run — it needs network + real credentials, which the hermetic verifier env can't provide); build ongoing infrastructure only if the diff turns out to be real. **Provider facts (so the research isn't lost):** Anthropic **Admin Usage & Cost API** (added mid-2025; groups by workspace + API key; requires an Admin API key); Cartesia **credit-usage routes** behind a separate admin key (play.cartesia.ai/keys/admin); Deepgram **per-project usage API**. **Prerequisite:** dedicated per-provider API keys for Voice Tutor so usage attributes cleanly to this app — reconciliation only covers usage from the key-cutover date forward. **Verdict: all three providers disagree with the ledger — Anthropic & Cartesia over-count ~2.2–2.3×, Deepgram under-counts ~1.44×; net spend over-estimated ~2× (real ≈$21.7 vs $44.8 recorded). Root-caused to `bot.py` usage-logging bugs (per-hop `MetricsFrame` multi-count; wall-clock STT proxy); logging fix pending.** Findings: [[2026-07-20-provider-reconciliation]].

## 2026-07-21

- Grounded assessment v0: implement a basic version of the scoring — user explains aloud, score claim-by-claim against the reference doc. Smallest thing that produces a real coverage number. Detail: planning/2026-07-18-grounded-assessment-brainstorm.md
- Verbal session end: a tool the voice agent exposes so saying "I'm done" / "end session" closes the session cleanly instead of requiring the browser UI.

## 2026-07-23

- Comprehension levels: user-selectable rubric depth (gist / working / exam-level or similar) instead of one fixed claim granularity — different extraction prompts per level, rubric cached per doc per level. Coverage stays comparable within a level. Reframes granularity from an engineering constant into a study-intent setting. (2026-07-23, origin: Sonnet 5 count-overshoot discussion)