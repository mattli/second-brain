# Wiki Tutor — Open Questions

*Running list. Capture as you encounter them. Don't try to answer all of these — patterns emerge with quantity.*

*Started 2026-04-29. Realigned to validated single-doc study tutor 2026-04-29 afternoon.*

---

## Product / UX

- [ ] How does the user invoke the tutor mid-session vs. at start? Highlight-driven only, or also "ask anything about what I'm reading"?
- [ ] How do users discover what they already know? "What do I know about X?" interface?
- [ ] What happens when a user re-reads a document? Replace prior session artifact, or accumulate?
- [ ] How does the artifact stay coherent if the user edits it themselves?
- [ ] When v2 supports multi-document workflows, what does that flow look like? Sequential study? Cross-document Q&A?
- [ ] What's the right combination of passive (scroll, time) and active (engagement) signals for progress tracking? Need to validate with real usage whether passive signals meaningfully complement engagement signals.
- [ ] How is "where you left off" surfaced when user returns to a document? Cognitive resume ("you were exploring X") vs. consumption resume ("you stopped at section 5")? Probably both, depending on how the user was engaging.
- [ ] How do per-session artifacts compose into a per-document journey? Concatenation, evolving synthesis, or hybrid (top-level summary + session list)?
- [ ] What's the artifact download flow? One-click? Auto-saved somewhere? Email it to the user?

---

## Voice (v1.5)

- [ ] What voice form factor — push-to-talk, voice-in / text-out, voice-in / voice-out, async voice notes?
- [ ] Unit economics for each form factor — same concern that made the standalone voice-tutor project tough?
- [ ] Real-time conversational vs. turn-based — different UX, different cost
- [ ] How does voice input integrate with the highlight + selection mechanic from v1?
- [ ] Does voice make the recap artifact richer (transcript-based) or just same as text but voice-input?

---

## Architecture / system

- [ ] How strict is the "source-only answers" constraint? When the user asks something tangential, does the AI refuse, answer with a caveat, or politely redirect?
- [ ] When the AI surfaces connections to prior reading, how does it handle wrong/stale connections?
- [ ] Do session artifacts get re-summarized over time as the user accumulates more context?
- [ ] When extraction starts (concepts, definitions, etc.), what types matter most? Concepts? Claims? Definitions? Open questions?
- [ ] If the AI explained something wrong in a past session, how does that get corrected without losing the conversational context?
- [ ] How are index entries created? Auto-extracted on import? Surfaced from session conversations? Both?
- [ ] What's the markdown extraction quality threshold for PDFs? When is "good enough"? Probably: AI-readable, lossy is fine, pretty is not the goal.
- [ ] After PDF, what file format comes next?

---

## Business / strategy

- [ ] Pricing model — free tier shape? What's behind paywall? Validation hints at willingness-to-pay (med students paying for ChatGPT/Claude already, law students valuing case-briefing time savings).
- [ ] Distribution — validation surfaced specific power-user pools (r/LawSchool, r/medicalschool, r/PhD). Outreach to flagged power-user candidates is a real next step.
- [ ] Naming — when to rename from WikiTutor, what to rename to.

---

## Decisions made (move out of open-questions when settled)

- **2026-04-29**: ~~v0 is one document at a time, PDF only.~~ → ~~Shifted to Readwise/markdown wedge same day.~~ → ~~Shifted to GitHub-synced wiki.~~ → **Reverted to original after revisiting 2026-04-26 validation findings**: validated product is single-doc PDF study tutor, voice-anchored. Text-first v1 as stepping stone.
- **2026-04-29**: Convert PDFs to markdown internally for AI processing. Preserve original PDF in storage. Lossy extraction is fine.
- **2026-04-29**: Progress tracking combines passive signals (scroll, time) with engagement signals (sessions, highlights). Engagement-only misses passive comprehension.
- **2026-04-29**: Per-session artifacts capture cognitive state ("where you were in your thinking"), not just consumption state. They compose into per-document journeys for "pick up where you left off" experiences.
- **2026-04-29**: Three layers of artifact, nested: per-session (immutable checkpoint), per-document journey (accumulating record), cross-document wiki (web of concepts). Each has different update cadence and purpose.
- **2026-04-29**: Artifact delivery in v1 is download-as-markdown. Direct vault writing requires desktop app or plugin (v2+ territory).
- **2026-04-29**: Voice is in v1.5, not v3. Validated product is voice-anchored. Text-first is stepping stone, not the destination.
- **2026-04-29**: Source-only grounding (no external knowledge bleed) is v1, not v2. Hallucination is a dealbreaker in legal/medical study contexts per validation findings.
- **2026-04-29**: WikiTutor is a working name. Plan to rename before external launch since the product is a study tutor, not a wiki.
- **2026-04-30**: WikiTutor is a study session, not a chat interface over content. The chat-over-content category (NotebookLM, Copilot, ChatGPT-with-PDF) treats the document as a passive source to query. WikiTutor treats it as something the user actively studies through, with state and structure. This is the product's category-level differentiator and informs why progress tracking, session state, sentence-level interaction, and the artifact are core (not nice-to-haves).
- **2026-04-30**: Zero-config onboarding is a product principle. Sign up → upload PDF → study. No API keys, no model selection, no configuration. This is a real moat against BYOK tools targeting technical users — the validated user (student with a deadline) won't get past configuration friction.
- **2026-04-30**: "Personal use AND validated student user" is the same product, not two products. Earlier framing of "WikiTutor for students AND a separate personal tool for me" was wrong. As long as WikiTutor stays focused on the study session as the unit of interaction, both users are served. The drift to worry about isn't "make WikiTutor work for me too" — it's "make WikiTutor manage my whole vault" (which is Copilot territory).

---

## Lessons from today (process notes)

- **The validation doc was performed under the original voice-tutor frame; today's wiki-tutor pivots quietly drifted from it.** Drift was conversational, not strategic. The validation should have been the anchor.
- **Convenience can masquerade as strategy.** "My setup is wiki-shaped, so the product is wiki-shaped" felt like clarity but was rationalization. Build for the validated user, not the convenient one.
- **Names anchor identity.** "WikiTutor" kept pulling toward wiki framings even when the validated product wasn't wiki-shaped. Worth renaming when the product clarifies, not later.
- **A thinking partner that elaborates every direction without friction can amplify drift.** Stronger pushback at "let's switch from voice to text" with reference to the recent validation would have caught the drift earlier.
