# Wiki Tutor — MVP Scope & Sequencing

*Working document. As of 2026-04-29.*

---

## MVP scope decisions

### What's in
1. PDF upload only
2. Highlight → explain (Explainpaper's proven mechanic)
3. Follow-up Q&A in text
4. Session artifact: a generated markdown summary note saved to the vault
5. Persistent context: RAG-style retrieval over prior session content + documents
6. Source-type metadata on all stored content

### What's out (for now)
- Voice
- Multiple file formats (EPUB, DOCX, web articles, etc.)
- Readwise / external integrations
- Spaced review / flashcards
- Cross-document quizzing
- Wiki page auto-generation
- Connection surfacing
- "What do I know about X?" interface
- Concept extraction / entity graphs
- Index-style wiki structure (emerges from usage, not built upfront)

---

## Sequencing: what to build, in what order

### v0 (now → first user)
1. Upload PDF, extract text, store
2. Highlight → explain interaction (text only)
3. Follow-up Q&A within session
4. Generate session summary at end, save to vault as markdown
5. RAG over prior content for next session, with source-type metadata preserved

### v1 (after first feedback)
- Connections surfaced during study ("this relates to X you read last month")
- Better artifact shapes based on user feedback
- Initial index-style wiki: lightweight concept entries with pointers to encounters

### v2 (after product-market signal)
- "What do I know about X?" interface — synthesizes at query time from index pointers
- Voice mode (push-to-talk first, ambient later)
- Additional file formats
- Readwise / external integrations
- Spaced review

### v3+ (much later, only if validated)
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
- **The wiki is invisible plumbing in v0.** Don't build a wiki UI; just use it to make the AI smart.
- **Source-type metadata from day one.** Cannot be retrofitted easily.
- **"Build toward" the architecture, don't build it all.** Each MVP decision should keep the architecture's options open without committing to its full complexity.
- **The wiki is a map, not a repository.** Pointers and connections, not content. Synthesis happens at query time from real sources.
