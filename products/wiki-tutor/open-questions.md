# Wiki Tutor — Open Questions

*Running list. Capture as you encounter them. Don't try to answer all of these — patterns emerge with quantity.*

*Started 2026-04-29.*

---

## Product / UX

- [ ] How does the user invoke the tutor mid-session vs. at start? Highlight-driven only, or also "ask anything about what I'm reading"?
- [ ] How do users discover what they already know? "What do I know about X?" interface?
- [ ] What happens when a user re-reads a document? Replace prior session artifact, or accumulate?
- [ ] How does the vault stay coherent if the user also edits notes themselves (e.g., in Obsidian)?
- [ ] Should the user ever see/edit the index directly, or is it purely internal infrastructure?
- [ ] When v1 supports multi-document workflows, what does that flow look like? Sequential study? Cross-document Q&A?
- [ ] What's the right combination of passive (scroll, time) and active (engagement) signals for progress tracking? Need to validate with real usage whether passive signals meaningfully complement engagement signals.
- [ ] How is "where you left off" surfaced when user returns to a document? Cognitive resume ("you were exploring X") vs. consumption resume ("you stopped at section 5")? Probably both, depending on how the user was engaging.
- [ ] How do per-session artifacts compose into a per-document journey? Concatenation, evolving synthesis, or hybrid (top-level summary + session list)?
- [ ] How does artifact delivery work without filesystem access? Download as markdown is v1 default — is that friction acceptable, or does it need a one-click flow?
- [ ] How to onboard a non-Readwise user in v1? Do we let them paste markdown, or is v1 strictly Readwise-gated?

---

## Readwise-specific

- [ ] How fresh does Readwise sync need to be? On-demand pull at session start, periodic sync, or webhook-based?
- [ ] What's the unit of "document" when importing from Readwise? Each book/article they've highlighted from? A collection? How does the user select what to study?
- [ ] How are tags/categories from Readwise surfaced (if at all) in v1?
- [ ] What about content the user has in Readwise but didn't highlight (full articles in Readwise Reader)? In or out of scope?

---

## Architecture / system

- [ ] When the AI surfaces connections to prior reading, how does it handle wrong/stale connections?
- [ ] Do session artifacts get re-summarized over time as the user accumulates more context?
- [ ] When extraction starts (concepts, definitions, etc.), what types matter most? Concepts? Claims? Definitions? Open questions?
- [ ] How does the wiki schema evolve as the user accumulates content? Is each concept its own page?
- [ ] If the AI explained something wrong in a past session, how does that get corrected without losing the conversational context?
- [ ] How are index entries created? Auto-extracted on import? Surfaced from session conversations? Both?
- [ ] How are connections between index entries determined? Co-occurrence? Semantic similarity? Explicit user signal?

---

## Business / strategy

- [ ] Pricing model — free tier shape? What's behind paywall?
- [ ] Readwise dependency risk — what's the contingency if API access changes? (Markdown vault import is the natural answer; v2 priority.)

---

## Decisions made (move out of open-questions when settled)

- **2026-04-29**: ~~v0 is one document at a time, PDF only.~~ **Reversed same day**: shifted to Readwise/markdown wedge. PDF moves to v2. Matt is the first user, his use case is learning from his own Readwise-fed wiki, and markdown is a more durable substrate than PDF.
- **2026-04-29**: ~~Convert all uploaded content to markdown internally.~~ **Still true but reframed**: Readwise content already comes as structured highlights/notes. Markdown remains the internal substrate; conversion is now from Readwise API responses, not PDF extraction.
- **2026-04-29**: ~~No read-tracking in v0. Engagement signals are enough.~~ **Reversed same day**: engagement-only misses the passive-comprehension case. Progress tracking combines passive signals (scroll, time) with engagement signals.
- **2026-04-29**: Per-session artifacts capture cognitive state ("where you were in your thinking"), not just consumption state. They compose into per-document journeys for "pick up where you left off" experiences.
- **2026-04-29**: Three layers of artifact, nested: per-session (immutable checkpoint), per-document journey (accumulating record), cross-document wiki (web of concepts). Each has different update cadence and purpose.
- **2026-04-29**: Tactical wedge is "tutor mode for your Readwise highlights." Strategic position is "active learning over your second brain, markdown-native." Don't paint into a Readwise-only architecture — markdown is the substrate, Readwise is one source.
- **2026-04-29**: Artifact delivery in v1 is download-as-markdown. Direct vault writing requires desktop app or plugin (v2+ territory).
