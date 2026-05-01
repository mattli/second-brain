# WikiTutor — Positioning

*Working document. Started 2026-04-30. WikiTutor is the working name; will rename before external launch.*

*This doc captures how WikiTutor differentiates against existing tools and what the deliberate competitive posture is. Sharpens over time as more competitors are researched. Companion to product-framing.md (what the product is) and architecture.md (how it's built).*

---

## Category positioning: study session, not chat over content

WikiTutor is in a different category from most existing AI-on-documents tools.

The dominant category today is **chat over content**: tools that treat the document as a passive source to query. NotebookLM, Obsidian Copilot, ChatGPT-with-PDF all work this way. The user opens a chat, asks a question, gets a response. Each query is a fresh search against the whole document. There's no notion of "where I am right now," "what we've covered," "where I got stuck," or "what's still open."

WikiTutor is a **study session** product. The interaction has structure:
- Where the user's attention is right now (active passage)
- What's happened so far (session state, transcript)
- Where they are in the document (progress tracking)
- What this session leaves them with (the artifact)
- How sessions compose into a per-document journey (continuity across returns)

This isn't a feature-level distinction. It's category-level. A chat product treats content as searchable reference. A study session treats content as something the user is actively learning from. The architecture starts in different places, and you can't easily turn a chat interface into a study session after the fact.

For positioning: WikiTutor is in the "study session" category. Most competitors are in "chat over content," "AI study tool" (content transformation), or "read-later with highlights." They serve different jobs even when feature lists appear to overlap.

---

## Competitive differentiation

### NotebookLM
Google's AI-on-documents tool. Chat-with-PDF interface with podcast generation. Validation findings explicitly named the gap: "blob of text," "doesn't support retention or grounded sources." Treats document as a queryable object rather than something to study through. WikiTutor's conversational tutoring loop with retention focus and structured artifacts is the difference.

### ChatGPT-with-PDF (the validated workaround)
What med students, law students, and PhDs are doing today: paste PDF into ChatGPT, ask questions, manually shape the experience. Productized version of this is what WikiTutor offers — the loop is structured, memory persists across sessions, the artifact is generated automatically, and answers are grounded in the source document.

### Explainpaper
Click-to-explain on academic papers. Closest in interaction model to WikiTutor's click-to-explain feature. Difference: Explainpaper is moment-of-clarification only — no session state, no per-document journey, no artifact. Useful for one-off lookups; not a study companion.

### Obsidian Copilot
Chat-over-vault for PKM users. 100K+ users, well-developed plugin (Brevilabs LLC). Different category entirely:
- **Different user**: Copilot serves Obsidian power users with vaults; WikiTutor serves academic readers with single documents
- **Different surface**: Copilot lives inside Obsidian (requires Obsidian + vault + Plus tier for advanced features); WikiTutor is a web app (sign up, upload, study)
- **Different job**: Copilot answers questions about your knowledge base; WikiTutor walks you through a single document with state and continuity
- **Configuration friction**: Copilot is BYOK with embedding model setup, vault search behind paywall, CORS configuration issues — barriers that filter out non-technical users entirely

WikiTutor and Copilot can both serve the same person at different moments without being in direct competition. They're solving different jobs.

### Mindgrasp / Raena / Knowt (AI study tool category)
These tools generate study aids (notes, flashcards, quizzes, podcasts, mind maps) from uploaded content. The unit of value is the *output* (a study aid), not the *session* (an engagement). Their "progress" is checklist-style: have you generated all the study aid types yet? Their sessions are isolated upload-and-review cycles.

WikiTutor has less output-format breadth but no session-continuity gap. The wedge is the conversational study session as a unit, with cognitive state composing across multiple sittings — not a one-time content transformation.

### Readwise Reader
Read-later application with highlighting layer. Save articles, annotate while reading, sync highlights and notes to Obsidian via the official plugin. Excellent at its job: capture, read, highlight, send to PKM.

Different category from WikiTutor. Reader is a *consumption* tool (read articles, save thinking via highlights). WikiTutor is a *study* tool (engage actively with a single document over multiple sessions). A user might use both: Reader to capture and consume, WikiTutor to deeply study specific documents that warrant it.

### Ghostreader (Readwise Reader's AI feature)
AI assistant inside Readwise Reader. Sits in a side panel next to the article being read, knows what's on the page, can answer questions, summarize, define terms, generate prompts. Surfaced 2026-05-01 — worth calling out separately from Reader because the AI feature has more surface overlap with WikiTutor than the parent product does.

Where it overlaps with WikiTutor:
- AI assistance anchored to the document being read
- Context-aware (knows what's on the page)
- Side panel UX pattern
- Ask-question interface
- Has preset prompts (Ghostreader has "Explain passage," "Expand passage," "Quiz me," "Translate," etc.) that look superficially like the constrained-action set WikiTutor is moving toward

Where it doesn't:
- **Chat over content, not study session.** Same fundamental category as Copilot, NotebookLM, ChatGPT-with-PDF. No session state, no progress tracking, no per-document journey, no artifact at the end. User asks, AI answers, interaction ends.
- **Preset prompts are entry-points into chat, not action-set replacements for chat.** This is the load-bearing distinction. Ghostreader's UX: chat panel is the primary surface, presets live in a dropdown near the chat input, picking a preset auto-inserts the prompt text into the chat input and sends it, response appears in the chat thread, follow-up is free-form text. The presets save typing; they don't change the shape of the interaction. From use one onward, the user is in a chat conversation.

  WikiTutor's planned constrained-action menu is structurally different: no text input, no chat thread, each action is a discrete request anchored to a specific passage. Follow-up is more actions, not free-form messages. The interaction is *bounded by the action set*, not augmented by it. This is the discipline that keeps "study session, not chat over content" architecturally true rather than just a marketing claim.

  If WikiTutor adds a text input alongside the action buttons, it becomes Ghostreader. The discipline of "actions only, no chat" is what holds the category distinction.
- **Prompt set reveals the intended user.** Ghostreader's defaults — "Translate to Spanish," "Draft newsletter blurb," "Extract key takeaways and to-dos" — are creator and knowledge-worker shaped, not student shaped. "Newsletter blurb" especially: that's a workflow for someone who reads things and writes about them online. WikiTutor's eventual action set should be study shaped ("explain simpler," "more detail," "how does this connect to earlier sections," "define key terms in this passage," "quiz me on this section"). Not because Ghostreader's are bad — because they're for a different user.
- **Configuration burden vs zero-config.** Ghostreader exposes prompt management to the user (Preferences screen, toggles to enable/disable each prompt, ability to add custom prompts). This is power-user UX for someone who wants to tune their tools. WikiTutor's zero-config principle applies at the prompt layer too: ship sensible study-shaped defaults; don't require configuration.
- **Discoverability reflects product priorities.** Ghostreader's preferences live behind multiple clicks (Settings → Preferences → Ghostreader prompts). The feature itself requires text selection or panel toggle. This is appropriate for Reader because reading is the primary activity and AI is a power-user augmentation. WikiTutor inverts this: study is the primary activity, so the explain interaction is primary in the UI — click paragraph, get explanation, no menus or selection gestures required for the default action.
- **Feature inside a read-later app, not a study tool.** Ghostreader is one capability among many in service of Reader's core consumption-and-capture loop. WikiTutor is study session as the entire product.
- **Different user posture.** Reader users have a queue of articles to consume. WikiTutor users have one document and a study goal. "What's next in my queue" vs. "how do I learn this thing."
- **Different validated user.** Reader skews PKM enthusiasts, knowledge workers, technical readers with a curated information diet. WikiTutor's validated user is students with deadlines — many wouldn't know what Readwise is.
- **No recall layer.** Ghostreader helps you read this article now. It doesn't build a queryable knowledge base of accumulated study (the recall architecture WikiTutor is designed around).
- **PDFs are second-class in Reader.** Reader is primarily for web articles and email newsletters; PDFs work but aren't the focus. The validated WikiTutor user reads casebooks, textbook chapters, papers — PDF-native content.

Why this isn't discouraging:

Ghostreader's existence proves "AI panel next to the content you're reading" is a real product pattern users want — that's *validation* for WikiTutor's direction, not a threat to it. What it doesn't try to do (and what no chat-over-content tool does): build the study session as the unit, with cross-session continuity, engagement-weighted recall, and validated focus on academic readers. That space is open.

The sharper positioning statement: WikiTutor is what Ghostreader would be if Readwise rebuilt around the study session as the primary unit instead of the read-later queue, and committed to actions-without-chat as the interaction model.

Watch for: if Readwise starts adding session state, progress tracking, artifacts, cross-document recall, or removes the chat input in favor of pure action-set interaction, that's signal worth responding to. If they stay in chat-with-prompt-shortcuts mode, the positioning stays defensible.

### Obsidian Web Clipper + Reader mode
Free, open-source browser extension from the Obsidian team. Clips web pages, YouTube transcripts, articles into the vault as clean markdown. Reader mode (added 2026) provides a clean reading view inside the extension with typography, themes, highlighting, and YouTube transcript UI.

Different category. Web Clipper is a *capture and read* tool — get the web into your vault, read it cleanly. WikiTutor is a *study* tool — engage with a document beyond reading it. Reader mode is a reading view; WikiTutor is a study session.

There's potential overlap at the edges: someone could clip an article with Web Clipper, read it in Reader mode, then upload to WikiTutor for deep study. The tools complement rather than compete.

### Speechify / Paper2Audio
Listen-only — convert documents to audio for passive consumption. Different mode entirely (listening vs. studying). WikiTutor's voice direction (v1.5+) is conversational, not listen-only.

---

## The progress-tracking gap

Research across the AI study tool market surfaced a specific gap nobody is filling:

**No tool combines passive reading signals (scroll position, time-on-section) with engagement signals (sessions, sentences engaged with, questions asked) into a coherent representation of "where you are in your thinking."**

What competitors do instead:
- **Mindgrasp**: tracks which study aids you've generated per session (checklist, not journey)
- **Knowt**: basic position tracking (last page/scroll), no engagement signal integration
- **Raena**: gamified progress (points, leaderboards, streaks) — attention metric, not learning metric
- **Atlas, Myreader, ChatPDF**: no progress concept beyond "documents in your library"
- **Readyy**: reading speed tracking — separate product category

What none of them do:
- Surface "where you got stuck last time" across sessions
- Compose per-session artifacts into a per-document journey
- Distinguish cognitive state ("you were exploring how the encoder works, with unresolved questions about positional encoding") from consumption state ("you stopped scrolling at page 47")
- Treat returning to a document as a continuation rather than a fresh session

This isn't a feature gap that's easy to retrofit. It requires the architecture to be designed around session artifacts as composable units from day one — which is what WikiTutor's architecture specifies. Existing competitors would need to rebuild their core data model to match. They're unlikely to.

This validates a v1 architectural choice: per-session artifacts capture cognitive state, not just consumption state. They compose into per-document journeys. **The differentiation is defensible because of how the system is built, not just what it does.**

---

## Zero-config as a moat

The validated user is a student with a deadline, not a developer evaluating tools. They don't have API keys. They don't know what an embedding model is. They've never opened a terminal.

For this user, configuration friction is a complete dead end — not a minor annoyance. A product that requires "add your OpenAI API key, choose an embedding model, configure CORS settings, click Build Index" loses every non-technical user before they've started.

**WikiTutor's onboarding is sign up → upload PDF → study.** Three steps. No keys. No model selection. No configuration. The AI is invisible infrastructure; the user thinks about studying, not about LLMs.

This is a real moat against BYOK PKM tools (Copilot, Web Clipper, anything with self-hosted LLM options) that target technical users. Those products charge $15/mo because their users accept configuration friction. WikiTutor handles infrastructure entirely — different value prop, different price-sensitivity profile (students are price-sensitive but expect zero-config from consumer products).

Product principles that follow from this:
- Setup friction kills conversion — if onboarding requires more than three steps, users are lost
- Errors should never expose underlying machinery ("build index" is the wrong button name; do it silently in the background)
- Don't make users juggle services — single sign-in, single product surface, no provider/model decisions visible

This principle is more restrictive than "make onboarding easy." It's "the existence of configuration is itself a UX failure for the validated user."

---

## Desktop-first as the deliberate v1 posture

WikiTutor ships v1 desktop-first. Not because mobile is unimportant, but because the product is desktop-shaped at its core.

### Why desktop-first is right for this specific product

**The active-study interaction model is desktop-shaped.** Point at a passage, get a focused response beside it, refine with actions. Document on one side, panel on the other, both visible. This requires screen real estate that phones don't have.

**The validated user is on desktop.** Reddit research described deep, sustained reading sessions — 60-90 minute desktop reading, not 5-minute phone glances. Building mobile-first for a desktop-primary use case means optimizing for the wrong context.

**Mobile-first as a forcing function isn't needed here.** The classic argument for mobile-first is that the constraint of a phone forces ruthless prioritization. v1 scope is already aggressive (12 features, brutal cuts). The discipline mobile-first provides is solving a problem that doesn't exist.

**Most products that win on desktop are desktop-shaped at their core.** Figma, Linear, Notion (in serious mode), code editors. WikiTutor's deep-engagement interaction model fits this pattern. Most products that win on mobile are mobile-shaped at their core (Instagram, TikTok, ride-sharing). WikiTutor isn't one of those.

### The two-tier mobile model (v1.5+)

Mobile isn't ignored, just deferred to a secondary surface:

- **Tier 1 — reading**: works at any width, including mobile. Tap a passage for an explanation in a bottom sheet. Available on phone, tablet, desktop. For re-reading, lighter engagement, on-the-go review.
- **Tier 2 — active study**: desktop only for v1. Definitions via double-click, follow-up action set, multi-action workflows. The full interaction model that requires precision and screen real estate.

A user who wants to deeply study a document goes to desktop. A user who wants to re-read something they've already studied works on mobile, with explanations available but not the full toolkit.

### When mobile expands

When v1 has real users (or the builder has been dogfooding for a few weeks), pay attention to whether mobile gaps are a real complaint or just an assumption. Specific signals worth responding to:
1. Power-user candidates from validation outreach asking about mobile
2. Self-observation: builder finding themselves wanting mobile use repeatedly

Until then: ship desktop, observe, decide based on real usage.

---

## What WikiTutor is NOT

Important for keeping positioning honest. WikiTutor is not:

- **Not a chat-with-vault tool.** Copilot's job. WikiTutor doesn't manage your knowledge base.
- **Not a content transformer.** Mindgrasp's job. WikiTutor doesn't auto-generate flashcards, quizzes, or podcasts (though it might in v2 if validated).
- **Not a read-later app.** Readwise's job. WikiTutor doesn't manage a queue of articles to read.
- **Not a web clipper.** Obsidian Web Clipper's job. WikiTutor doesn't capture web content into your vault.
- **Not a research database.** NotebookLM's broader vision. WikiTutor is single-document focused; multi-document workflows are v2 territory.
- **Not a speed-reading or audio tool.** Speechify / Readyy. WikiTutor is conversational and active.
- **Not a generic AI study tool with maximum feature breadth.** Mindgrasp / Raena. WikiTutor's wedge is the session as a unit; trading feature breadth for interaction depth is intentional.

The temptation will be to drift toward any of these. Each is a real category with real demand. Each is also someone else's product. WikiTutor stays in its lane: study sessions on single documents, with state and continuity.

---

## Open positioning questions

Tracked in open-questions.md, summarized here for quick reference:

- **Naming.** WikiTutor is a working name. The product is a study tutor, not a wiki. Rename before external launch.
- **Web search beyond the document.** Would break the source-only grounding rule that differentiates from NotebookLM. Defer to post-v1 unless real users explicitly need it.
- **Panel interaction model.** Constrained follow-up actions vs. continual chat vs. one-shot. Continual chat collapses positioning into Copilot's category. Lean: constrained actions.
- **Pricing model.** Free tier shape, paywall placement. Validation hints at willingness-to-pay among med students and law students. Decide before external launch.
- **Distribution.** Power-user pools surfaced by validation (r/LawSchool, r/medicalschool, r/PhD) are the initial outreach targets. Distribution-in-public is the moat when underlying technology is commoditized.
