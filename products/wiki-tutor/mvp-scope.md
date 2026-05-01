# Wiki Tutor — MVP Scope & Sequencing

*Working document. As of 2026-04-29 (afternoon, post-validation realignment).*

---

## Product anchor

Single-document study companion. User uploads a PDF, studies it conversationally with the AI, gets an async recap. Validated by 2026-04-26 Reddit research — see product-framing.md and the validation findings doc.

Voice is in scope but deferred to v1.5. v1 ships text-first as a stepping stone.

---

## v1 feature list (shippable scope)

The full set of things that need to exist for the product to work end-to-end. Listed roughly in build order — earlier items unblock later ones.

1. **Auth** — Users can sign up and log in. Each user has their own data. Magic links. ✅ Done.
2. **PDF upload + storage** — User uploads a PDF. Original file stored. Text extracted to markdown. Both preserved. RLS-isolated per user.
3. **Library view** — User sees their uploaded documents. Click to open. Shows progress at a glance.
4. **Reading view** — A PDF viewer the user can read in. Supports text selection (so highlight works) and is instrumentable for scroll/time tracking.
5. **Highlight + selection mechanic** — User selects text, a menu appears with actions (define, explain, ask). Selection state, menu positioning, action wiring.
6. **LLM API integration** — Wires the AI behind the menu actions. Sends the highlighted text plus context, returns response.
7. **Chat / Q&A interface** — Where the AI's response appears. Where follow-up questions get asked. Side panel, modal, or inline — design decision.
8. **Session state management** — Defines what a session is. When it starts (open document), when it ends (explicit close OR ~30 min inactivity OR document switch). Tracks transcript.
9. **End-of-session artifact generation** — At session close, AI generates a markdown recap with sections: questions asked, key concepts discussed, where you left off, open threads, connections to prior reading. Downloadable as markdown.
10. **Vector storage + RAG context injection** — Embed all stored content (documents, session transcripts, artifacts). On new session, retrieve relevant prior content, inject as AI context. This is what makes the AI feel smart about the user's reading history.
11. **Source-type metadata** — Every stored chunk tagged with `source_type` (`document` | `session_transcript` | `session_artifact` | `user_note` | `ai_explanation`). Doesn't need to be used cleverly in v1, but must be preserved.
12. **Progress tracking** — Passive signals (scroll position + time-on-section) combined with engagement signals (sessions, highlights). Surfaced as "where you are in this document" and powers "pick up where you left off."

### Architectural note on grounding
The validated pain explicitly names hallucination as a dealbreaker in legal/medical contexts. v1's RAG pipeline must constrain answers to the uploaded document plus the user's prior content. "Source-only answers" is a v1 concern, not a v2 concern.

---

## What's out of v1

- Voice (any kind) — v1.5 priority, not a v3 nice-to-have
- Multiple file formats (EPUB, DOCX, web articles) — v2
- Markdown / wiki import — v2 if validated, otherwise drop
- Readwise integration — explored in afternoon drift, not in v1
- GitHub-synced vault integration — explored in afternoon drift, not in v1
- Spaced review / flashcards
- Cross-document quizzing
- Wiki page auto-generation
- Proactive connection surfacing during sessions
- "What do I know about X?" interface
- Concept extraction / entity graphs
- Index-style wiki structure (emerges from usage, not built upfront)
- In-app artifact viewer (artifacts download as markdown for v1; user opens in their tool of choice)
- Multi-document study flows

---

## Build order (suggested)

If picking a single ordering:

1. Auth (basic — magic links) ✅ Done
2. PDF upload + extraction + storage (pipeline only, no UI yet)
3. Library view (now you can see what you uploaded)
4. Reading view (PDF rendering, text selection)
5. Highlight + LLM-backed menu actions (the core interaction works)
6. Chat / follow-up Q&A (the conversation works)
7. Session state management + end-of-session artifact generation (the loop closes)
8. Vector storage + RAG context injection with grounding constraints (the AI gets smart about prior reading without hallucinating)
9. Progress tracking (passive signals, "where you are")
10. Source-type metadata — done throughout, not last; verify it's right before shipping

You can ship without #8 and #9 and have a working product that's basically NotebookLM-but-with-recaps. You can't ship without #1–7.

#8 is what makes it differentiated from NotebookLM. The grounding constraint is what makes it credible to the law/med users in the validation. Worth budgeting accordingly.

---

## Sequencing beyond v1

### v1.5 (after v1 working, validated by initial users)
- Voice mode — push-to-talk, voice-in / voice-out
- Form factor TBD; pick based on unit economics work

### v2 (after product-market signal)
- Connections surfaced during study ("this relates to X you read last month")
- Better artifact shapes based on user feedback
- Initial index-style wiki: lightweight concept entries with pointers to encounters
- Additional file formats (EPUB, DOCX)
- "What do I know about X?" interface
- Spaced review

### v3+ (much later, only if validated)
- Always-listening voice agent
- Cross-user features
- Mobile

---

## Things to write up separately in the vault

- The 2026-04-29 day-of pivots (voice → wiki → Readwise → GitHub → back to validated voice tutor)
- Competitive landscape note (NotebookLM, ChatGPT+PDF workaround, Explainpaper, Speechify, Paper2Audio — what each does and gaps)
- The "design toward A, ship B" architectural principle for the wiki substrate question
- The wiki-as-index reframing (why pointers > content)
- Why text-first v1 is a stepping stone, not the destination

---

## Reminders for future me

- **The validated product is voice tutor for single-doc study.** Text-first v1 is a stepping stone. Don't lose the voice plot.
- **Hallucination is a dealbreaker for the law/med users.** Source-only grounding is v1, not v2.
- **WikiTutor is a working name.** Rename before external launch.
- **Don't over-spec before shipping.** Reality teaches faster than specs do.
- **Capture questions, don't answer them all.** Patterns emerge with quantity.
- **The artifact is the product.** If the post-session note doesn't feel valuable, nothing else matters.
- **Source-type metadata from day one.** Cannot be retrofitted easily.
- **Capture engagement metadata from day one.** Every paragraph click, every follow-up action, every double-click definition lookup — log it with timestamp, session ID, and the source chunk it ties to, even if no v1 feature consumes it. Cheap now; expensive to retrofit. The engagement layer is what makes Act 2 (curated wiki) and Act 3 (engagement-weighted recall) possible later. See recall-architecture.md for the full reasoning.
- **"Build toward" the architecture, don't build it all.** Each MVP decision should keep the architecture's options open without committing to its full complexity.
- **The connective tissue is the work.** Most of what makes a real product isn't the feature list — it's PDF rendering, selection mechanics, session state, library views.
- **Build for the validated user, not the convenient one.** When in doubt, look at the validation doc, not your own setup.
