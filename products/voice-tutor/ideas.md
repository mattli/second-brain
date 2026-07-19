# Voice Tutor — Idea Inbox

> Light capture, no commitment. Promote to planning/ when one earns a design pass.

## 2026-07-18

- **Session recap browser** — display all previous session recaps in the app (list + read view over `~/.voice-tutor/artifacts/`). Makes the recap artifact a durable study surface instead of a one-shot file. → **Promoted to planning 2026-07-18: [past-sessions history goal](planning/2026-07-18-past-sessions-history-goal.md)** (dev-harness goal). Refinement from the design pass: the *list* is driven by `cost-log.jsonl` (it carries title/date/duration/cost — the `artifacts/` dir alone has none of that metadata); the *read* view reuses the existing `loadSessionView(sid)` path, not a new reader. Shared-pool / no-auth / cost-visible for this validation build.
- **Live conversation text stream** — show the transcript text streaming in the UI while the voice conversation is happening. Voice-in/text-out visibility during the session, not just after.

### Harness angle on 1 & 2 (noted 2026-07-18)
Both are candidates for dev-harness UI-capable runs — and UI verification via Playwright was part of the harness's original inspiration, so this is the intended direction, not scope creep. Sequencing: **idea 1 first** — mostly backend (list/read endpoints over artifacts/, hermetically testable) plus one static page verifiable at fetch-level (serves 200, expected element IDs, right endpoints), with Matt's eyeball at the merge gate as the look-and-feel layer. **Idea 2 second** — needs a realtime channel out of the Pipecat pipeline (SSE/websocket from bot.py), riskier and hard to verify hermetically; do after idea 1 proves the UI pattern. **Playwright verifier lane** is the capability investment to make when fetch-level verification first proves insufficient (or when idea 2 demands it) — browser-driven checks as a verifier option alongside pytest.
- **Verify cost logging** — audit that `cost-log.jsonl` rows (session + artifact kinds) are actually accurate against provider usage; hasn't been validated since the study-mode changes and the grounding.py relocation.
- **Hourly cost in cost analysis** — add cost-per-hour-of-conversation to the cost analysis, so sessions are comparable regardless of length and the "what does a study hour cost" number is visible.
