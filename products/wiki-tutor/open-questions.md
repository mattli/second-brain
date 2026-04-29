# Wiki Tutor — Open Questions

*Running list. Capture as you encounter them. Don't try to answer all of these — patterns emerge with quantity.*

*Started 2026-04-29.*

---

## Product / UX

- [ ] Do users upload documents, or do we integrate where their docs already live (Readwise, Kindle, etc.)?
- [ ] How does the user invoke the tutor mid-session vs. at start? Highlight-driven only, or also "ask anything about what I'm reading"?
- [ ] How do users discover what they already know? "What do I know about X?" interface?
- [ ] What happens when a user re-reads a document? Replace prior session artifact, or accumulate?
- [ ] How does the vault stay coherent if the user also edits notes themselves (e.g., in Obsidian)?
- [ ] How do you onboard someone with no existing vault?
- [ ] Should the user ever see/edit the index directly, or is it purely internal infrastructure?
- [ ] When v1 supports multi-document workflows, what does that flow look like? Sequential study? Cross-document Q&A? Bulk import as separate feature?
- [ ] What's the right combination of passive (scroll, time) and active (engagement) signals for progress tracking? v0 candidate: track all three, surface a unified view, don't make the user think about which counts. Need to validate with real usage whether passive signals are noisy enough to be useless, or whether they meaningfully complement engagement signals.
- [ ] What defines a "session" boundary? Time-based (auto-close after inactivity)? User-driven (explicit close)? Document-switch? Probable answer: combination — explicit close OR auto-close after ~30 min inactivity OR auto-close on document switch. Resumes if user returns within ~1 hour.
- [ ] How is "where you left off" surfaced when user returns to a document? Cognitive resume ("you were exploring X") vs. consumption resume ("you stopped at section 5")? Probably both, depending on how the user was engaging.
- [ ] How do per-session artifacts compose into a per-document journey? Concatenation, evolving synthesis, or hybrid (top-level summary + session list)?

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
- **2026-04-29**: ~~No read-tracking in v0. Engagement signals (highlights, questions, sessions) are already captured and are the signal that actually matters.~~ **Reversed same day**: engagement-only misses the passive-comprehension case (user reads and understands without needing the tutor). Progress tracking is back on the table for v0 — combine passive signals (scroll, time-on-section) with engagement signals.
- **2026-04-29**: Per-session artifacts capture cognitive state ("where you were in your thinking"), not just consumption state. They compose into per-document journeys for "pick up where you left off" experiences.
- **2026-04-29**: Three layers of artifact, nested: per-session (immutable checkpoint), per-document journey (accumulating record), cross-document wiki (web of concepts). Each has different update cadence and purpose.
