# Wiki Tutor — Product Framing

*Working document. WikiTutor is the working name; will rename before external launch since the product isn't really wiki-shaped — see naming note at bottom.*

*As of 2026-04-29 (afternoon, post-validation realignment).*

---

## What it is

A study companion for single dense documents. User uploads a PDF (textbook chapter, research paper, casebook chapter, dense article), studies it conversationally with an AI tutor, and receives an async recap they can revisit. Over time, the system builds memory of what they've studied so subsequent sessions are smarter.

---

## The validated pain (Reddit research, 2026-04-26)

The product is anchored to real, named pain surfaced in a 1,330-post Reddit research pass:

- **"PDF paralysis"** — users freeze on dense documents, re-read without absorbing
- **"I read everything and remembered nothing"** — solo reading fails for retention
- **No listener for active recall** — users lecture to walls, desk lamps, pretend to tutor someone
- **Existing workaround is manual** — multiple users describe ChatGPT voice mode + uploaded PDF as their current method
- **NotebookLM gap is named** — "blob of text", "doesn't support retention or grounded sources"
- **Hallucination concern in legal/medical** — accuracy when bound to one source matters intensely

28 score-3 findings, validated power-user pools in r/LawSchool, r/medicalschool, r/PhD, r/AskAcademia.

Full validation: see the 2026-04-26 product-validation-findings doc.

---

## Target user

Students and academic readers studying single dense documents:
- Law students briefing casebook chapters
- Med students working through textbook chapters and review materials
- PhD students reading dense papers
- Self-directed learners studying technical PDFs

NOT the PKM-developer with a vault (that was a midday drift; user is single-doc study, not wiki management).

---

## Differentiation vs. existing tools

- **vs. NotebookLM**: Conversational tutoring loop with retention focus, not "blob of text" summarization
- **vs. ChatGPT-with-PDF (the current workaround)**: Productized loop, persistent memory across sessions, structured recap artifact, grounded answers
- **vs. Explainpaper**: Tutoring intent and session artifacts vs. moment-of-clarification only
- **vs. Speechify / Paper2Audio**: Conversational vs. listen-only
- **vs. Obsidian Copilot (and similar PKM AI plugins)**: Different category entirely — Copilot is chat-over-vault for PKM users; WikiTutor is a study session for academic readers. Copilot has no progress tracking, no session state, no per-document journey, no zero-config onboarding. Different jobs, different users.

---

## Study session, not chat over content

A core framing the product turns on: WikiTutor is a study session, not a chat interface over content.

A chat-over-content product (NotebookLM, Obsidian Copilot, ChatGPT-with-PDF) treats the document as a passive source to query. Every question is a fresh query against the whole document. There's no notion of "where I am right now," "what we've covered," "where I got stuck," or "what's still open."

A study session has structure to the interaction:
- **Where the user's attention is right now** (active sentence/passage)
- **What's happened so far** (session state, transcript)
- **Where they are in the document** (progress tracking)
- **What this session leaves them with** (the artifact)
- **How sessions compose into a per-document journey** (continuity across returns)

This is why progress tracking, session state, sentence-level interaction, and the artifact aren't nice-to-haves — they're what distinguishes WikiTutor from the chat-over-content category. The architecture starts in a different place than a chat product, and you can't easily turn a chat interface into a study session after the fact.

For positioning: WikiTutor is in the "study session" category. Most existing tools in this space are in the "chat over content" category. They're solving different jobs even when they appear feature-overlapping.

---

## Zero-config as a product principle

The validated user is a student with a deadline, not a developer evaluating tools. They don't have API keys. They don't know what an embedding model is. They've never opened a terminal.

For this user, configuration friction is a complete dead end — not a minor annoyance. A product that requires "add your OpenAI API key, choose an embedding model, configure CORS settings, click Build Index" loses every non-technical user before they've started.

**WikiTutor's onboarding is sign up → upload PDF → study.** Three steps. No keys. No model selection. No configuration. The AI is invisible infrastructure; the user thinks about studying, not about LLMs.

This is a real moat against BYOK PKM tools (Copilot, etc.) that target technical users. Those products charge $15/mo because their users accept configuration friction. WikiTutor handles infrastructure entirely — different value prop, different price-sensitivity profile (students are price-sensitive but expect zero-config from consumer products).

Product principles that follow from this:
- Setup friction kills conversion — if onboarding requires more than three steps, you're losing users
- Errors should never expose underlying machinery ("build index" is the wrong button name; do it silently in the background)
- Don't make users juggle services — single sign-in, single product surface, no provider/model decisions visible

---

## One-line pitch

*"The voice mode of ChatGPT, but bound to one doc, with a recap that helps you actually retain it."*

(Even though v1 is text-first, this is the pitch the product is aimed at.)

---

## Two product framings (pick one to anchor)

- **Sells the moment**: "Understand this dense document faster"
- **Sells the relationship**: "Study a document, retain what you learned, build on it next time"

Lean into the second. Retention and "no one to talk to while reading" is the validated pain. Faster understanding is downstream of that.

---

## What the product really is (the deeper version)

Not just "an AI that explains your document" (NotebookLM does that), but "the listener you didn't have when reading alone." Active recall needs a partner. The product is that partner, plus a recap that turns the conversation into something durable.

---

## Voice: in scope, deferred to v1.5+

Voice is in the eventual product, not optional. The validated workaround is voice ChatGPT + PDF. Multiple users explicitly chose voice over text when both were available. The "speaking out loud as active recall" technique is the underlying behavior.

**v1 ships text-first as a stepping stone.** Reasons:
- Faster to ship, lets us validate the artifact + recall loop
- Avoids voice unit economics complexity in v1
- Clear path to add voice in v1.5 once the rest works

**Honest acknowledgment**: Text-first v1 is a thinner version of the validated product. We're explicitly trading some product-fit for ship speed. Voice should be added as soon as the text loop is working, not deferred indefinitely.

**Self-check**: After text MVP works, will I actually build voice, or quietly drop it? If the latter, the deferral was avoidance. Voice was the original instinct, the validation supports it, and it's a v1.5 priority — not a v3 nice-to-have.

**Voice form factor TBD**: Real-time conversational voice has tough unit economics (see voice-tutor project). Push-to-talk, voice-in/text-out, or async voice notes all have different economics. Pick the form factor when v1.5 is the live question.

---

## Naming note

"WikiTutor" is the working name. The product is a study tutor for documents, not a wiki tutor — the wiki is internal infrastructure (derived knowledge graph), not the user-facing surface.

The name will keep pulling toward wiki framings as long as it stays. Plan to rename before any external launch. Don't burn time on this now; v1 build is what matters.
