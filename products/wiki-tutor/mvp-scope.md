# Wiki Tutor — MVP Scope & Sequencing

*Working document. As of 2026-04-29.*

---

## Direction shift: Readwise/markdown input, not PDF

Originally scoped as PDF upload tool. Shifted to Readwise/markdown wedge after recognizing:
- Matt is the first user. His use case is learning from his own Readwise-fed wiki.
- Readwise users have a pile of saved highlights they never properly absorb. Real itch.
- Markdown is the substrate; Readwise is one source. Anyone with a markdown vault is a potential user — durable position even if Readwise relationship changes.
- Sharper persona, sharper pitch, less direct competition with Explainpaper.

**Tactical wedge** (early acquisition): "Tutor mode for your Readwise highlights."
**Strategic positioning** (durable): "Active learning over your second brain. Markdown-native."

PDF upload moves to v2 or later.

---

## v1 feature list (shippable scope)

The full set of things that need to exist for the product to work end-to-end. Listed roughly in build order — earlier items unblock later ones.

1. **Auth** — Users can sign up and log in. Each user has their own data. Magic links. ✅ Done.
2. **Readwise import** — Connect Readwise account, pull highlights and document metadata into the system. Store with source-type metadata.
3. **Library view** — User sees their imported documents/sources. Click to open. Shows progress at a glance.
4. **Reading view** — Display a document's highlights and notes in a readable format. Supports text selection (for highlight-driven actions) and is instrumentable for scroll/time tracking.
5. **Highlight + selection mechanic** — User selects text, a menu appears with actions (define, explain, ask). Selection state, menu positioning, action wiring.
6. **LLM API integration** — Wires the AI behind the menu actions. Sends the highlighted text plus context, returns response.
7. **Chat / Q&A interface** — Where the AI's response appears. Where follow-up questions get asked. Side panel, modal, or inline — design decision.
8. **Session state management** — Defines what a session is. When it starts (open document), when it ends (explicit close OR ~30 min inactivity OR document switch). Tracks transcript.
9. **End-of-session artifact generation** — At session close, AI generates a markdown summary with sections: questions asked, key concepts discussed, where you left off, open threads, connections to prior reading. Downloadable as markdown for the user to drop in their vault.
10. **Vector storage + RAG context injection** — Embed all stored content (highlights, session transcripts, artifacts). On new session, retrieve relevant prior content, inject as AI context. This is what makes the AI feel smart about the user's reading history.
11. **Source-type metadata** — Every stored chunk tagged with `source_type` (`highlight` | `document_metadata` | `session_transcript` | `session_artifact` | `user_note` | `ai_explanation`). Doesn't need to be used cleverly in v1, but must be preserved.
12. **Progress tracking** — Passive signals (scroll position + time-on-content) combined with engagement signals (sessions, asked-about highlights). Surfaced as "where you are with this document" and powers "pick up where you left off."

### Architectural note on import pluggability
Readwise API is the v1 import path. Internal data model should treat Readwise as one source among many, not the substrate. Keep the import layer pluggable — markdown file upload, other PKM tool integrations, etc., should all be addable without restructuring. Don't paint into a Readwise-only corner.

---

## What's out of v1

- Voice (any kind)
- PDF upload (moved out of v1; Readwise/markdown is the wedge)
- Other file formats (EPUB, DOCX, web articles)
- Direct markdown vault folder import (v2 — adds filesystem complexity; Readwise API is the easy first path)
- Spaced review / flashcards
- Cross-document quizzing
- Wiki page auto-generation
- Proactive connection surfacing during sessions
- "What do I know about X?" interface
- Concept extraction / entity graphs
- Index-style wiki structure (emerges from usage, not built upfront)
- In-app artifact viewer (artifacts download as markdown; user drops in their vault)
- Multi-document study flows
- Direct vault write / Obsidian plugin (v2+ — desktop app or plugin territory)

---

## Build order (suggested)

If picking a single ordering:

1. Auth (basic — magic links) ✅ Done
2. Readwise import (pipeline + storage; pull highlights, store with source metadata)
3. Library view (now you can see what you imported)
4. Reading view (display highlights, support selection)
5. Highlight + LLM-backed menu actions (the core interaction works)
6. Chat / follow-up Q&A (the conversation works)
7. Session state management + end-of-session artifact generation (the loop closes)
8. Vector storage + RAG context injection (the AI gets smart about prior reading)
9. Progress tracking (passive signals, "where you are")
10. Source-type metadata — done throughout, not last; verify it's right before shipping

You can ship without #8 and #9 and have a working product that's basically "highlight chat." You can't ship without #1–7.

#8 is what makes it *wiki tutor* and not just a chat-with-highlights tool. It's also the most complex of the list. Worth knowing it's the differentiator and budgeting accordingly.

---

## Sequencing beyond v1

### v2 (after first feedback)
- Connections surfaced during study ("this relates to X you read last month")
- Better artifact shapes based on user feedback
- Initial index-style wiki: lightweight concept entries with pointers to encounters
- Direct markdown vault folder import (filesystem access for non-Readwise users)
- PDF upload (broadens addressable market)

### v3 (after product-market signal)
- "What do I know about X?" interface — synthesizes at query time from index pointers
- Voice mode (push-to-talk first, ambient later)
- Direct vault write (Obsidian plugin, desktop app, or sync-based)
- Additional file formats (EPUB, DOCX)
- Spaced review

### v4+ (much later, only if validated)
- Always-listening voice agent
- Cross-user features
- Mobile

---

## Things to write up separately in the vault

- The 2026-04-29 product clarification (voice → text-first, wiki tutor framing, then Readwise/markdown wedge)
- Competitive landscape note (Explainpaper, Speechify, Adobe, Glasp, Readwise — what each does and gaps)
- The "design toward A, ship B" architectural principle for the wiki substrate question
- The wiki-as-index reframing (why pointers > content)
- Strategic vs. tactical positioning — Readwise wedge vs. markdown PKM positioning

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
- **The connective tissue is the work.** Most of what makes a real product isn't the feature list — it's reading views, selection mechanics, session state, library views. The "obvious" stuff is where most of the build effort lives.
- **Readwise is a source, not the substrate.** Markdown is the substrate. Don't paint into a Readwise-only corner.
- **Build for yourself first.** You're the first user. If it's not useful for your own Readwise-fed wiki, it's not useful.
