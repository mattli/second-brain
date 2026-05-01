# WikiTutor — Recall Architecture

*Working document. Started 2026-04-30. Captures the multi-year arc of how recall works as a system in WikiTutor — the wiki layer, the engagement metadata, the two-stage retrieval, and why this compounds per user over time.*

*Companion to: product-framing.md (what the product is), architecture.md (how v1 is built), positioning.md (how it differentiates), open-questions.md (live questions).*

---

## The core insight

Recall is the goal. Studying a document well is necessary but not sufficient — the value of study is being able to summon what you learned later, when you actually need it. WikiTutor's job isn't to make studying feel productive in the moment. It's to make what you studied durable, queryable, and trustworthy when you need to recall it.

Most existing AI study tools end at "the moment of study." They generate flashcards, summaries, explanations. The interaction is consumption-shaped — upload, transform, review. The user's accumulated study doesn't compose into anything queryable beyond the moment.

WikiTutor's architecture is designed so that every study session contributes to a personal knowledge base that the user can later query. Recall is the eventual destination; everything before it is infrastructure.

---

## The three-act structure

WikiTutor as a product is three acts, each depending on the one before it being real.

### Act 1 — Study one document deeply (v1)

The user uploads a document. They study it actively: click paragraphs for explanations, double-click words for definitions, refine with follow-up actions. Sessions have state. Sentences and paragraphs have stable IDs. The interaction is grounded in the source.

This is what v1 ships. It's standalone valuable: a study companion for academic readers that's better than NotebookLM (because of the conversational tutoring loop) and better than ChatGPT-with-PDF (because of the productized interaction model).

### Act 2 — Capture and curate (v1.5–v2)

End of session, the user gets a recap. The recap is the *complete provisional record* of what happened — every passage engaged with, every explanation received, every definition looked up, every follow-up explored.

The recap is the **decision surface**. The user chooses what to add to the wiki, item-by-item or as a whole. Added items flow into a per-document wiki article — one wiki article per source document, accumulating across sessions. Skipped items still exist in the session log but don't enter the durable record.

This permission layer matters. It makes the user the author of their wiki, not the AI. It addresses the validated user's hallucination concern at the architectural level: even bounded, source-grounded answers don't enter the durable record without user assent. Two layers of trust — source-grounded answers + user-affirmed retention.

### Act 3 — Recall on demand (v2+)

Once users have accumulated wiki content from real study, recall becomes the primary use case. Three forms:

- **Search across your wiki.** Find specific things you've studied. Returns wiki entries with provenance back to source.
- **Synthesize across your wiki.** "What do I know about [topic]?" returns a synthesis grounded in your curated knowledge, not generic AI knowledge.
- **Notice connections you didn't make.** While studying a new document, the system surfaces relevant entries from your past wiki content. Active surfacing, not passive querying.

Each form gets harder, but they share the underlying retrieval primitives.

### Why the ordering matters

Don't build Act 2 before Act 1 is solid. Don't build Act 3 before users have wiki content. Each act earns its place by the prior one being real. The temptation will be to promise Act 3 (recall) prematurely, but you can't deliver it without months of user wiki accumulation. v1 ships the foundation; the recall promise comes later.

---

## The two-layer retrieval model

The architectural mechanism that makes recall work: **engagement-weighted retrieval over a curated corpus.**

### Layer 1 — Source RAG

Standard retrieval over the user's uploaded documents. Chunks (paragraphs or sentences) are embedded and stored with provenance metadata (which doc, page, paragraph). When a query comes in, retrieve semantically similar chunks. This is what every AI-on-documents tool does.

WikiTutor's source RAG is no different from anyone else's at the primitive level. Source-type metadata (`document` | `session_transcript` | `session_artifact` | `wiki_entry`) is captured per chunk to enable filtering at retrieval time.

### Layer 2 — Engagement layer

The novel part. For every chunk in the source, track *what the user did with it*:

- Did they click it for explanation?
- Did they ask follow-up questions about it?
- Did they double-click words inside it for definitions?
- Did they explicitly dismiss or skip it?
- Did they add it (or content derived from it) to their wiki?
- How recently? How many times across how many sessions?

This is engagement metadata. Different from source metadata — it captures the user's relationship with the content, not just the content itself.

### Two-stage retrieval

When a query comes in:

1. **Vector retrieval pass.** Find candidate chunks based on semantic similarity to the query. This is pure source RAG.

2. **Engagement re-ranking pass.** Re-rank candidates based on engagement signals. Wiki entries get strong positive boosts. Engaged passages get moderate boosts. Dismissed content gets filtered or down-weighted. Recency and frequency factor in.

3. **Synthesis.** Feed the re-ranked, engagement-weighted chunks to the LLM as context. The user gets back recall that reflects their study history, not just the document's content.

### Why this is more precise than pure source RAG

Pure semantic retrieval is blind to user history. Two scenarios produce identical results:

- A passage the user studied three times last week and added to their wiki
- A passage the user scrolled past once and never engaged with

Pure RAG ranks them the same. For recall, those should rank very differently — the first is "something I actually know," the second is "something the document mentions." Engagement re-ranking makes retrieval reflect the user's actual relationship with the content.

This is what "what do I know about X" requires. Without engagement metadata, the answer is just "what's in your documents about X." With it, the answer is "what you've actually studied about X, weighted by how much you engaged."

### The wiki as the highest-confidence engagement signal

Within the engagement layer, the wiki has special status. A wiki entry means: the user saw this, engaged with it, *and chose to keep it*. That's the strongest possible signal of "this content matters to this user."

Other engagement signals (clicked, asked about, dismissed) form a hierarchy of strength. The wiki sits at the top. Re-ranking weights respect this hierarchy: wiki entries rank highest, engaged passages next, raw source content last.

---

## What engagement metadata to capture

Specific signals worth tracking, ranked by strength:

**Strongest (explicit user intent):**
- Wiki entries — user affirmed this matters
- Add-to-wiki gestures — user actively chose to retain
- Explicit dismissals — user actively chose to ignore

**Strong (active engagement):**
- Follow-up questions asked about a passage
- Definitions looked up for words inside a passage
- Multi-action sequences on the same passage (clicked, then refined with "simpler," then asked another follow-up)

**Moderate (basic engagement):**
- Passages clicked for explanation
- Time-on-section above a threshold
- Returns to the same passage across sessions

**Weak (consumption signal):**
- Scrolled past
- Time-on-section below threshold
- Skipped sections (jumped over)

The hierarchy isn't fixed. Real usage will surface which signals actually matter for retrieval quality. The principle: capture rich metadata in v1 even though it's not used for retrieval yet.

---

## v1 implications: capture metadata now, use it later

The engagement layer doesn't ship in v1. The wiki doesn't ship in v1. Recall doesn't ship in v1.

But the architectural choice you make *now* matters: **store engagement metadata from day one, even if you're not using it for retrieval yet.**

Specifically, v1 needs to:
- Track every paragraph click, with timestamp and session ID
- Track every follow-up action on a passage (when feature #5 ships)
- Track every double-click definition lookup (when that ships)
- Track passage-level engagement at the lowest cost possible (don't over-engineer it)

This costs little in v1. Storage is cheap, write paths are simple. It pays off enormously later: by the time you build engagement-weighted retrieval, every existing user has months of metadata feeding it.

If you skip this in v1 and try to retrofit, you've lost user history that could have powered Act 3. New users from launch onward get a thin engagement layer. Long-term users get nothing meaningful from their early sessions.

The discipline: **engagement metadata is a first-class concern from v1, even though no v1 feature consumes it.**

---

## Why this compounds per user over time

The deeper moat: **the product gets more valuable per user every session.**

A new user gets a study tool. Useful but not unique — many study tools exist.

A user who's been using WikiTutor for six months has:
- Dozens of source documents in their library
- Hundreds of paragraphs they've actively engaged with
- A growing per-document wiki of curated knowledge
- A web of engagement metadata across all of it

Their experience is qualitatively different from a new user's. When they ask "what do I know about [topic]," they get back synthesis grounded in their accumulated study. When they study a new document, the system can surface connections to past work. Their wiki is theirs, accumulated through real study, queryable on demand.

A competitor can copy the features in a month. They cannot give a new user six months of accumulated wiki content. The compound effect is the moat.

This also implies a specific kind of pricing logic: free tier users hit a feature ceiling, but the value isn't in unlocking features — it's in continuing to accumulate. Switching costs grow with the wiki. Lock-in is by user value, not by data hostage.

### What this means for product strategy

The strategic choice underneath this architecture: **bet on long-term users over feature breadth.**

Most AI study tools optimize for "wow this is useful in the moment" — generate flashcards, summarize papers, answer questions. They win short-term but plateau in user value. A user's tenth session is roughly as valuable as their first.

WikiTutor optimizes for "this gets more useful the more I use it." Less wow in session one. Much more value in session fifty. The bet is that compound user value beats moment-of-engagement features in the long run.

This bet only works if you stay disciplined about the architecture. If you start auto-synthesizing wiki content (skipping the permission layer), you lose user trust. If you start capturing source content as a "vault" (skipping the curated layer), you become Copilot. If you skip the engagement metadata in v1 (saving v1 effort), you can never build the engagement layer that makes recall powerful.

Every architectural decision should reinforce: source content is raw material, the user's curated engagement is the durable layer, recall is the destination.

---

## What this is not

Important for keeping the architecture honest:

**Not auto-synthesized notes.** The permission layer is non-negotiable. The AI offers; the user curates. Without that, you have a hallucination machine instead of a knowledge base.

**Not a PKM tool.** PKM tools start with capture (everything goes into the bag). WikiTutor starts with engagement (only what you actively studied flows in). The wiki is the *output of study*, not a kitchen sink for saved articles. This distinction has to stay sharp.

**Not a chat-over-vault tool.** Copilot's job. The query interface for recall is structured (browse by document, by topic, by date) plus AI synthesis on top. Not a free-form chat that converges back to ChatGPT.

**Not generic RAG.** RAG is a primitive WikiTutor uses. The architecture isn't novel because it uses RAG. It's distinctive because it uses RAG over a *curated, engagement-tracked corpus*. The combination matters; the primitive doesn't.

**Not "innovative and unheard-of."** Pieces of this exist elsewhere. Notion AI, Mem, Reflect, Readwise, Anki, recommender systems — they touch parts of what's described here. The combination is uncommon, the productization for academic study is uncommon, but the architectural ideas aren't unprecedented. Honesty about this matters; overclaiming weakens the position.

What's distinctive: the *combination* (engagement-tracked, user-curated, source-grounded, single-document focus, recall as destination) and the *discipline* (resisting feature drift toward auto-synthesis, vault management, or chat-over-content).

---

## Open architectural questions

Live questions tracked in detail in open-questions.md. Summary:

- **What's the engagement model exactly?** Specific weights, thresholds, decay. Discover through real usage rather than pre-design.
- **Per-document wiki shape.** Chronological list of items? Concept-organized? Hybrid? Let structure emerge from usage.
- **Cross-document layer composition.** How do per-document wikis combine into a cross-document wiki for v2+? Probably: shared concepts surface as candidates; user affirms or skips.
- **Query interface design.** Structured browse + free-form ask, or one or the other? Probably both — structured for known-item retrieval, AI synthesis for cross-cutting questions.
- **Engagement signal hierarchy.** The strength ranking proposed above is a starting hypothesis. Real retrieval quality data will refine it.

These don't need to be answered before v1. They need to be live questions that get answered through real usage in v1.5+ when the wiki and engagement layer come online.

---

## Summary

Recall is the goal. The wiki is the durable, user-curated layer above source documents. Engagement metadata captured from v1 enables eventual engagement-weighted retrieval. Two-stage retrieval combines source semantic similarity with engagement signals to produce recall grounded in the user's actual study history.

The architecture compounds per user. The moat is accumulated user value, not novel primitives.

v1 captures the metadata that makes Act 2 and Act 3 possible later. v1.5 adds the wiki and the permission layer. v2+ adds engagement-weighted retrieval and the recall surface.

Don't promise recall in v1. Build the foundation. Let recall emerge as the destination once users have months of real study feeding it.
