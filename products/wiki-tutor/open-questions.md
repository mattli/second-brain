# Wiki Tutor — Open Questions

*Running list. Capture as you encounter them. Don't try to answer all of these — patterns emerge with quantity.*

*Started 2026-04-29.*

---

## Product / UX

- [ ] Do users upload documents, or do we integrate where their docs already live (Readwise, Kindle, etc.)?
- [ ] What's the right granularity for "session"? One document? One topic? One sitting?
- [ ] How does the user invoke the tutor mid-session vs. at start? Highlight-driven only, or also "ask anything about what I'm reading"?
- [ ] How do users discover what they already know? "What do I know about X?" interface?
- [ ] What happens when a user re-reads a document? Replace prior session artifact, or accumulate?
- [ ] How does the vault stay coherent if the user also edits notes themselves (e.g., in Obsidian)?
- [ ] How do you onboard someone with no existing vault?
- [ ] Should the user ever see/edit the index directly, or is it purely internal infrastructure?
- [ ] What signals matter for "did the user engage with this content"? Engagement (highlights, questions, sessions) vs. raw read-completion (scroll, time, click). Lean toward engagement; raw read tracking is probably vanity.
- [ ] When v1 supports multi-document workflows, what does that flow look like? Sequential study? Cross-document Q&A? Bulk import as separate feature?

---

## Architecture / system

- [ ] When the AI surfaces connections to prior reading, how does it handle wrong/stale connections?
- [ ] Do session artifacts get re-summarized over time as the user accumulates more context?
- [ ] When extraction starts (concepts, definitions, etc.), what types matter most? Concepts? Claims? Definitions? Open questions?
- [ ] How does the wiki schema evolve as the user accumulates content? Is each concept its own page?
- [ ] If the AI explained something wrong in a past session, how does that get corrected without losing the conversational context?
- [ ] How are index entries created? Auto-extracted on document ingest? Surfaced from session conversations? Both?
- [ ] How are connections between index entries determined? Co-occurrence? Semantic similarity? Explicit user signal?
- [ ] What's the markdown extraction quality threshold? When is "good enough"? Probably: AI-readable, lossy is fine, pretty is not the goal.
- [ ] After PDF, what file format comes next? Markdown likely highest leverage for Readwise-persona users. EPUB adds extraction complexity. Web articles probably better via integration than direct upload.

---

## Business / strategy

- [ ] Pricing model — free tier shape? What's behind paywall?

---

## Decisions made (move out of open-questions when settled)

- **2026-04-29**: v0 is one document at a time, PDF only. Multi-upload and additional formats are v1+ decisions, made with real user data.
- **2026-04-29**: Convert all uploaded content to markdown internally. Preserve original file in storage. Markdown is what gets chunked, embedded, used for AI context.
- **2026-04-29**: No read-tracking in v0. Engagement signals (highlights, questions, sessions) are already captured and are the signal that actually matters.
