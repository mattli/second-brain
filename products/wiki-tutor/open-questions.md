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
- [ ] **Word-level definitions via double-click.** Single-click is reserved for paragraph-level explanation. Double-click on a word triggers a definition lookup — separate gesture, separate visual treatment (small inline tooltip near the word, not the right-side panel). Works in BOTH the main document text and inside the explanation panel — the gesture is about the user's relationship to a word, not which surface the word lives on. The AI's explanations will use technical terms the user might not know; forcing them to leave the panel to look them up would break the interaction. Avoids click-target ambiguity (single-click belongs to the paragraph it's inside). Definition can be document-grounded first (does the document define this term?) with a fallback to general knowledge if not. Decide implementation details when feature #5 (action menu) ships — might also surface "key terms" as a follow-up action on a paragraph for the case where the user wants multiple terms surfaced at once. **Naming note (2026-05-01):** prefer "key terms" over "definitions" — frames the action as "what should I notice in this passage" rather than the dictionary-style framing. Same underlying mechanism, sharper user mental model.
- [ ] **User notes and follow-up questions on passages.** Surfaced 2026-05-01. Beyond reading and triggering AI explanations, the user might want to leave their own notes — thoughts, questions, things to come back to. Different from highlights (Readwise's model) and different from the wiki layer (curated study output). This is in-the-moment annotation.
  - Notes anchored to specific blocks of text (paragraph IDs already exist for markdown; PDF would need stable anchoring — connects to the extract-and-render architecture decision since markdown-rendered PDFs would inherit paragraph IDs).
  - Follow-up questions are a specific kind of note: "come back to this" with explicit study intent. Could be answered async by the LLM in the background and surfaced when the user returns to the document. Async answering preserves study flow (don't break reading rhythm to wait for response) while still producing the value.
  - Open: do notes/follow-ups feed the wiki layer (when user curates them) or the engagement layer (always logged) or both? Probably both — every note is engagement, only some are wiki-worthy.
  - Open: is the note input a constrained action surface ("add note," "ask follow-up") or a free-form text affordance? Probably constrained — same discipline as the panel.
  - Not v1. v1.5+ once core study session works. Capture now because it shapes how engagement metadata is structured (need to support "user note" as a distinct event type beyond AI-interaction events).

- [ ] **Saving the explanations.** Surfaced 2026-05-01. When the AI explains a passage, the explanation is currently ephemeral — it's in the panel, then it's gone. What's the mechanism for the user to save an explanation they found useful?
  - Connects to the wiki/permission-layer thread already captured: the recap surface lets the user choose what to add to their wiki. Saving an explanation could be that mechanism (user clicks "add to wiki" on a specific explanation, it joins the per-document wiki article).
  - Or could be more granular: save individual explanations as standalone artifacts that compose into something later.
  - Open: do saved explanations live in the wiki, in a separate "my notes" surface, or both? The answer probably depends on how the wiki layer is built.
  - Saved explanations are also a strong engagement signal — "the user explicitly chose to keep this" is the highest-confidence wiki-worthy signal.
  - Decide when wiki/permission layer is the live build question. Probably v1.5.

- [ ] **Progress tracking.** Already captured architecturally in architecture.md (combined passive + engagement signals). Surfaced again 2026-05-01 as a v1 priority — the user wants to see progress, not just have it tracked invisibly. Open question: what's the v1 surface for showing progress?
  - Per-document: progress bar, percentage, sections-covered indicator?
  - Cross-document: library view shows which documents have been studied, how recently, how deeply?
  - Or both, at different scales?
  - Decide concretely when v1 nears feature-complete. Don't over-design before the underlying tracking infrastructure is real.

- [ ] **Drag-to-adjust output sliders.** Surfaced 2026-05-01. Instead of discrete "simpler" / "more detail" follow-up actions, what if the panel exposed continuous sliders the user could drag?
  - Slider 1: simple → advanced (complexity / vocabulary level)
  - Slider 2: short → long (response length)
  - User drags, panel re-generates the explanation at the new setting in real time (or on release).
  - Pros: continuous control feels powerful, lets users find the right level for them, more expressive than 3-5 fixed buttons.
  - Cons: more LLM calls (cost), latency on every drag, possible feedback loop where user fiddles instead of reads, harder to reason about "what's a good default," might feel like a toy rather than a study tool.
  - Open whether this is better than discrete buttons or worse. Worth prototyping if the discrete-button approach feels too rigid in dogfooding.
  - Connects to the larger "do explanations have configurable parameters" question — sliders are one expression of that.

- [ ] **Does chat exist somewhere in the product?** Surfaced 2026-05-01. The positioning argues hard against chat-over-content. But the question of whether chat lives anywhere in the product (not as the primary surface, possibly as a fallback or escape hatch) is genuinely open.
  - Pure no-chat: action set is the entire interaction model. Maximally disciplined.
  - Per-action threading: each action opens a bounded thread scoped to a passage; thread ends when user dismisses or clicks a different passage. Allows real follow-up questions without becoming chat-over-document.
  - Chat-fallback after N follow-ups: actions cover most cases; free-form input opens up only when actions clearly don't suffice.
  - Anchored chat surface elsewhere in the product: maybe "ask anything about this document" exists as a separate surface (different page, different mode) for users who specifically want chat, distinct from the study-session interaction.
  - The discipline that holds: any chat must be ANCHORED (to a passage, to a session, to a document) and BOUNDED (threads end, conversations don't accumulate forever). Unanchored chat collapses positioning into Ghostreader's category.
  - Don't decide tonight. This is meaningful design work for feature #5 and the recall layer. Worth dogfooding the no-chat model first to see what the actual failure modes are.

- [ ] **Document outline (Reader parity).** Surfaced 2026-05-01 during dogfooding. Long documents (textbook chapters, casebook sections, dense papers) need navigation. Reader has this; WikiTutor doesn't. A sidebar showing the document's heading hierarchy with click-to-jump and current-section indicator.
  - Pure reading-experience improvement, no positioning risk. Outlines don't pull WikiTutor toward chat or PKM or content-transformation — they're just navigation for documents too long to scroll comfortably.
  - Critical for the validated user's content: casebook chapters are 30-80 pages, textbook chapters are 50-150 pages, papers can be 30+ pages. Without outlines, study sessions on these documents would feel painful.
  - **Architectural side effect:** depends on heading hierarchy being preserved through PDF extraction. Marker's heading-level mapping is currently inconsistent (h3→h2 promotion, occasional h4). Building outlines forces the heading normalization pass, which improves the reading experience independently. Worth doing both at once.
  - Decide implementation when v1's reading view is feature-complete enough to feel cramped without it. Probably sooner rather than later — outlines are usually load-bearing once documents are long.
- [ ] **Web search beyond the document.** Tension with v1's source-only grounding rule. Validated users (law/med/PhD) named hallucination as a dealbreaker — they want to know when answers come from the document vs. external sources. If supported, probably needs: explicit user choice (not implicit AI decision), clear visual distinction in panel between grounded and external answers, separate action set for "go beyond the source" vs. "understand the source." Defer to post-v1; adding it prematurely could weaken the "stays grounded" positioning that differentiates from NotebookLM. Revisit when real users tell you they need it.
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
- **2026-05-01**: Hybrid trigger architecture (markdown paragraph-click + PDF native selection) abandoned. Native PDF selection consumed multiple debug cycles (jittery rendering, render storms, false-positive matching, StrictMode double-firing of engagement events) without producing a usable experience. Native PDF rendering and reading is broken enough to disqualify it as v1's reading surface.
- **2026-05-01**: Replaced with **unified extract-and-render architecture**. PDFs are still accepted as input (the validated user has PDFs), but on upload they're extracted to high-quality markdown via Marker. The reading view renders markdown for everything, regardless of original input format. Paragraph-click and explain panel work the same way for all documents. The original PDF is preserved as a "view source" affordance for verification. Settled by experiment 2026-05-01: Marker output matches source markdown structure within 3% on the metrics that drive click-unit experience (median paragraph length 282c vs 285c, max 791c vs 791c, fragments under 40c at 2% vs 2%). Architectural unification, not just a UX improvement — collapses two interaction models into one, simplifies engagement metadata schema, removes a debugging sink.
- **2026-05-01**: Engineering follow-ups for the new architecture (not blockers, but real work): (1) sync vs async extraction — Marker takes ~47s for a 12-page PDF, too slow for upload-blocking, needs job queue with status polling; (2) heading normalization — Marker's level-mapping is inconsistent (h3→h2 promotion, occasional h4), small post-processing pass at upload time; (3) Marker free/local vs Reducto/Llamaparse paid/fast tradeoff at scale, defer until real users surface latency complaints. None of these are architectural questions — just sequencing for v1.5+.
- **2026-05-01 (caveat)**: The unified extract-and-render architecture was validated on a single prose-heavy article (markdown → PDF → markdown round-trip via headless Chrome → Marker). The harder test — casebook chapters with multi-column layout and footnotes, textbook chapters with figures and equations, research papers with charts and citations — is still untested. The architecture is **tentatively committed pending that validation**. If Marker mangles structurally complex documents the way PyMuPDF4LLM mangled simple ones, the architecture would need to either: (a) invest in better extractors (Reducto, Llamaparse), (b) gracefully fall back to native PDF rendering for hard cases, or (c) be abandoned. Pre-build validation: run extraction tests on 3-4 representative validated-user documents (casebook chapter, textbook with figures, research paper with charts) before committing engineering effort to the new pipeline. Use the same probe pattern from 2026-05-01 (renderDocumentMarkdown over Marker output, comparison table of click-units and paragraph-length metrics).

---

## Lessons from today (process notes)

- **The validation doc was performed under the original voice-tutor frame; today's wiki-tutor pivots quietly drifted from it.** Drift was conversational, not strategic. The validation should have been the anchor.
- **Convenience can masquerade as strategy.** "My setup is wiki-shaped, so the product is wiki-shaped" felt like clarity but was rationalization. Build for the validated user, not the convenient one.
- **Names anchor identity.** "WikiTutor" kept pulling toward wiki framings even when the validated product wasn't wiki-shaped. Worth renaming when the product clarifies, not later.
- **A thinking partner that elaborates every direction without friction can amplify drift.** Stronger pushback at "let's switch from voice to text" with reference to the recent validation would have caught the drift earlier.
