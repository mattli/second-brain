---
created_at: 2026-07-19
last_updated: 2026-07-19
type: strategic-roadmap
status: draft
---

# Voice Tutor — Strategic Roadmap

High-level phases. Not a production checklist — a personal north star for sequencing decisions.

---

## Phase 1 — Share with John

*Goal: one trusted expert user, personal motivation, test collaboration potential*

John is a speech-to-speech product expert met at a networking event (July 2026). Sharing is a low-stakes bet: get a smart outside eye on it, see if collaboration is viable, create external accountability to keep building.

*What needs to be true before sharing:*
- [ ] Verify cost telemetry is visible per session in the UI (cost-log data is there; confirm it surfaces in the history view)
- [ ] Add a session cap so usage is bounded even if he uses it heavily
- [ ] Stable enough to not embarrass — not polished, just functional

*What this phase is NOT:*
- Not a public launch
- Not about getting feedback from a stranger — this is about a specific person with relevant expertise

---

## Phase 2 — Limited Beta

*Goal: a handful of real users, hosted on Mac Mini, Matt covers cost, collect signal*

Still personal infrastructure. No payment required. The point is validation — does anyone find this useful unprompted?

*What needs to be true:*
- [ ] Simple login / auth system (can be minimal — magic link or password, doesn't need OAuth)
- [ ] Per-user session cap (non-optional at ~$7/hr marginal cost)
- [ ] Stable enough that a stranger can use it without hand-holding
- [ ] Some way to collect feedback (could be as simple as a follow-up email or a Typeform link at session end)

*Success signal:* unprompted positive feedback or return usage from someone who isn't Matt.

---

## Phase 3 — Move Off Machine

*Triggered by: positive signal from Phase 2*

- Move hosting off Mac Mini to a real server (VM or container, not Vercel — WebRTC needs stateful infra)
- Lift Supabase magic-link + RLS pattern from WikiTutor for accounts — don't rebuild
- Move state off local filesystem into multi-tenant store
- Hard per-user cost caps become load-bearing (not optional)
- Think about pricing: sessions not hours (see [[2026-07-18-grounded-assessment-brainstorm]])

*Not a decision to make now.* Phase 2 has to produce a reason to do this first.

---

## Open threads (not blocking anything, just tracked)

- Grounded assessment feature (claim-level scoring) — biggest product differentiator, not yet built — see [[2026-07-18-grounded-assessment-brainstorm]]
- Transcript readability + dashboard (dev-harness Phase 2)
- Re-verify vendor rates, recompute $/hr from recent sessions (cost estimates may be stale)
