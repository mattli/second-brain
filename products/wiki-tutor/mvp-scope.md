# Wiki Tutor — MVP Scope & Sequencing

*Working document. As of 2026-04-29.*

---

## v1 feature list (shippable scope)

The full set of things that need to exist for the product to work end-to-end. Listed roughly in build order — earlier items unblock later ones.

1. **Auth** — Users can sign up and log in. Each user has their own data. Magic links or Google sign-in is fine for v1.
2. **File upload + storage** — User uploads a PDF. Original file stored. Text extracted to markdown. Both preserved.
3. **PDF rendering / reading view** — A PDF viewer the user can read in. Supports text selection (so highlight works) and is instrumentable for scroll/time tracking.
4. **Document library / list view** — User sees their uploaded documents. Click to open. Shows progress at a glance.
5. **Highlight + selection mechanic** — User selects text, a menu appears with actions (define, explain, ask). Selection state, menu positioning, action wiring.
6. **LLM API integration** — Wires the AI behind the menu actions. Sends the highlighted text plus context, returns response.
7. **Chat / Q&A interface** — Where the AI's response appears. Where follow-up questions get asked. Side panel, modal, or inline — design decision.
8. **Session state management** — Defines what a session is. When it starts (open document), when it ends (explicit close OR ~30 min inactivity OR document switch). Tracks transcript.
9. **End-of-session artifact generation** — At session close, AI generates a markdown summary with sections: questions asked, key concepts discussed, where you left off, open threads, connections to prior reading. Saved to user's vault.
10. **Vector storage + RAG context injection** — Embed all stored content (documents, session transcripts, artifacts). On new session, retrieve relevant prior content, inject as AI context. This is what makes the AI feel smart about the user's reading history.
11. **Source-type metadata** — Every stored chunk tagged with `source_type` (`document` | `session_transcript` | `session_artifact` | `user_note` | `ai_explanation`). Doesn't need to be used cleverly in v1, but must be preserved.
12. **Progress tracking** — Passive signals (scroll position + time-on-section) combined with engagement signals (sessions, highlights). Surfaced as "where you are in this document" and powers "pick up where you left off."

---

## What's out of v1

- Voice (any kind)
- Multiple file formats (EPUB, DOCX, web articles)
- Readwise / external integrations
- Spaced review / flashcards
- Cross-document quizzing
- Wiki page auto-generation
- Proactive connection surfacing during sessions
- "What do I know about X?" interface
- Concept extraction / entity graphs
- Index-style wiki structure (emerges from usage, not built upfront)
- In-app artifact viewer (artifacts go to vault as markdown; user opens in their vault tool)
- Multi-document study flows

---

## Build order (suggested)

If picking a single ordering:

1. Auth (basic — magic links or Google)
2. File upload + PDF extraction + storage (pipeline only, no UI yet)
3. PDF rendering + library view (now you can see what you uploaded)
4. Highlight + LLM-backed menu actions (the core interaction works)
5. Chat / follow-up Q&A (the conversation works)
6. Session state management + end-of-session artifact generation (the loop closes)
7. Vector storage + RAG context injection (the AI gets smart about prior reading)
8. Progress tracking (passive signals, "where you are")
9. Source-type metadata — done throughout, not last; verify it's right before shipping

You can ship without #7 and #8 and have a working product that's basically Explainpaper. You can't ship without #1–6.

#7 is what makes it *wiki tutor* and not just a PDF chat tool. It's also the most complex of the list. Worth knowing it's the differentiator and budgeting accordingly.

---

## Sequencing beyond v1

### v2 (after first feedback)
- Connections surfaced during study ("this relates to X you read last month")
- Better artifact shapes based on user feedback
- Initial index-style wiki: lightweight concept entries with pointers to encounters

### v3 (after product-market signal)
- "What do I know about X?" interface — synthesizes at query time from index pointers
- Voice mode (push-to-talk first, ambient later)
- Additional file formats
- Readwise / external integrations
- Spaced review

### v4+ (much later, only if validated)
- Always-listening voice agent
- Cross-user features
- Mobile

---

## Things to write up separately in the vault

- The 2026-04-29 product clarification (voice → text-first, wiki tutor framing, why)
- Competitive landscape note (Explainpaper, Speechify, Adobe, Glasp — what each does and gaps)
- The "design toward A, ship B" architectural principle for the wiki substrate question
- The wiki-as-index reframing (why pointers > content)

---

## Reminders for future me

- **Don't over-spec before shipping.** Reality teaches faster than specs do.
- **Capture questions, don't answer them all.** Patterns emerge with quantity.
- **The artifact is the product.** If the post-session note doesn't feel valuable, nothing else matters.
- **The wiki/vault is what makes this defensible.** Don't let it become a side feature.
- **Voice is real differentiation eventually, but not the wedge.** Ship text first.
- **The wiki is invisible plumbing in v1.** Don't build a wiki UI; just use it to make the AI smart.
- **Source-type metadata from day one.** Cannot be retrofitted easily.
- **"Build toward" the architecture, don't build it all.** Each MVP decision should keep the architecture's options open without committing to its full complexity.
- **The wiki is a map, not a repository.** Pointers and connections, not content. Synthesis happens at query time from real sources.
- **The connective tissue is the work.** Most of what makes a real product isn't the feature list — it's PDF rendering, selection mechanics, session state, library views. The "obvious" stuff is where most of the build effort lives.
