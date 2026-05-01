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
- [ ] **Panel interaction model — continual chat vs. constrained actions vs. one-shot.** Free-form chat brings WikiTutor into Copilot's category and weakens the "study session, not chat" positioning. Pure one-shot is too rigid for real study (user can't refine "explain it more simply" or "more detail on this part"). Likely answer: constrained follow-up actions surfaced as buttons after the initial explanation — "simpler," "more detail," "what's the context," "how does this connect to other parts." Each click is a discrete action on the same passage. No text input. No conversation thread. Keeps the click-driven character; gives the user agency to refine; doesn't collapse into chat. Also makes the eventual session artifact (feature #9) easier to compose since interactions are structured. Decide concretely when feature #5 (action menu) is the live build question. Surfaced 2026-04-30 after using v0 click-to-explain on real content.
- [ ] **Word-level definitions via double-click.** Single-click is reserved for paragraph-level explanation. Double-click on a word triggers a definition lookup — separate gesture, separate visual treatment (small inline tooltip near the word, not the right-side panel). Works in BOTH the main document text and inside the explanation panel — the gesture is about the user's relationship to a word, not which surface the word lives on. The AI's explanations will use technical terms the user might not know; forcing them to leave the panel to look them up would break the interaction. Avoids click-target ambiguity (single-click belongs to the paragraph it's inside). Definition can be document-grounded first (does the document define this term?) with a fallback to general knowledge if not. Decide implementation details when feature #5 (action menu) ships — might also surface "define key terms" as a follow-up action on a paragraph for the case where the user wants definitions for multiple terms at once.
- [ ] **Web search beyond the document.** Tension with v1's source-only grounding rule. Validated users (law/med/PhD) named hallucination as a dealbreaker — they want to know when answers come from the document vs. external sources. If supported, probably needs: explicit user choice (not implicit AI decision), clear visual distinction in panel between grounded and external answers, separate action set for "go beyond the source" vs. "understand the source." Defer to post-v1; adding it prematurely could weaken the "stays grounded" positioning that differentiates from NotebookLM. Revisit when real users tell you they need it.
- [ ] **PDF reading experience.** Native PDF rendering + selection is poor compared to markdown — selection feels jittery, raw PDF is hard to read at fit-to-width, requires zoom and horizontal scroll. Surfaced 2026-05-01 during dogfooding.

  Resolution direction: extract PDFs to high-quality markdown at upload, default reading to markdown with "view original" affordance. Honors the "limited feature set, good UX" principle (you'd rather ship narrow inputs that work well than broad inputs that work poorly) while keeping the validated user (who has PDFs).

  Pre-decision experiment: run 3–5 representative validated-user documents (casebook chapter, textbook chapter, research paper) through extraction tooling (Marker, Reducto, Llamaparse) and evaluate output quality. If extraction is reliably good — clean markdown, footnotes preserved, figures handled, equations rendered — the architecture is sound. If not, either invest in better extraction tooling or accept native PDF rendering as v1's reality.

  If the path is taken, architecture shifts: PDF input still accepted, original preserved (existing layer), but two extraction paths instead of one — lossy-for-AI (current) and high-quality-for-human-reading (new). Reading view defaults to markdown; "view original" affordance is one click away for verification. Hybrid trigger architecture (markdown paragraph-click, PDF native selection) collapses into a single markdown-paragraph-click model.

  Costs and risks to manage: extraction takes 30–90s (upload-time latency, needs user feedback), pay-per-page APIs are real money at free-tier scale (Marker is free but slower; Reducto/Llamaparse are paid), edge cases need graceful fallback (scanned PDFs without text layer, complex multi-column layouts, equation-heavy documents), trust failures (silently dropped footnotes, misattributed quotes) violate validated-user expectations more than current native rendering does.

  Decide deliberately after the extraction experiment, not reactively. The validated user is defined by their PDFs; the goal is making the PDF input give them the best reading experience, not abandoning PDFs.
- [ ] **Per-document wiki article as durable, user-curated study output (v1.5+ direction).** Idea surfaced 2026-04-30. Each source document gets a one-to-one wiki article that accumulates the user's engagement — passages they engaged with, explanations they received, definitions they looked up, questions they explored. The wiki article lives alongside the source as the user's evolving understanding of it. Composes into the cross-document wiki layer (v2+) when concepts appear across multiple documents.

  **Critical design choice: permission layer, not auto-synthesis.** End-of-session recap is the decision surface. The recap shows what happened in the session as add-able items; the user chooses what to add to the wiki, item-by-item or as a whole. Avoids hallucination concerns (user is the curator, not a passive observer of AI output). Makes the user the author of their wiki, not the AI. Two layers of trust: source-grounded answers + user-affirmed durable record.

  Implications:
  - Session recap and per-document wiki are different things. Recap = complete provisional record. Wiki = curated durable subset.
  - Permission unit should be granular (per-item, not just per-session) so users can keep what's useful and drop what's noise.
  - Every wiki entry needs source provenance: which session, which passage in the source, what kind of interaction. Enables trust + future features ("show me everything I've added from this document").
  - Wiki article shape is still open. Start with chronological list of items by session. Let structure emerge from real usage rather than pre-designing.
  - Wiki is optional. Users who skip curation still get the study experience; their wiki stays empty.
  - On document return: show wiki additions so far as the "where I left off" surface for session N+1.

  This resolves the WikiTutor name tension: wiki isn't input (rejected as drift) or auto-generated (hallucination risk). Wiki is the durable output of curated study — the user's accumulated, affirmed understanding of a source. Real wiki tutor.

  Not v1. Depends on sessions, artifacts, and progress tracking working first. Capture as direction; build after v1 ships.

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
