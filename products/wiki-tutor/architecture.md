# Wiki Tutor — Architecture

*Working document. As of 2026-04-29.*

---

## Two-layer architecture (the long-term shape)

### Layer 1: Raw documents (immutable, user-facing-truth)
- Original PDF preserved
- Extracted text preserved
- User can always go back to the source
- This is what users trust and own

### Layer 2: Wiki / derived (AI-facing-truth)
- Map of concepts encountered and connections between them
- Pointers to where actual content lives (documents, sessions)
- Embeddings for retrieval
- This is what makes the AI smart and what compounds over time

### Why this architecture
- **Separates trust from intelligence**: Users trust source docs; if AI summary is wrong, source is always there to verify
- **Makes the wiki disposable**: Layer 2 is a cache, not canonical truth. Can be regenerated as AI improves
- **Gives users portability**: Raw docs are theirs. Wiki is value-add.
- **Enables progressive enrichment**: Each version adds layers without touching the foundation
- **Mirrors how human knowledge works**: Source material + derived understanding

### Critical principle: build TOWARD this architecture, but ship simply
Don't actually build the structured wiki for MVP. Just preserve the *option* to add structure later by:
- Storing raw documents separately from derived data
- Tagging all derived content with source metadata (don't blend into undifferentiated pile)
- Picking storage that supports adding metadata later

The wiki structure emerges from real usage patterns, not from upfront guesses.

---

## Wiki as INDEX, not content (key reframing)

### The shift
**Old framing**: Wiki is a derived knowledge base. The user's understanding lives in the wiki.

**New framing**: Wiki is a *map* of encounters and connections. The user's understanding lives in the source content (documents + conversations); the wiki tells the system how to navigate it.

### What a wiki entry looks like (minimal)
- Concept name
- One-line description (cheap and stable, fine to have)
- Pointers: "first encountered in Document X, section 3"
- Pointers: "discussed in sessions on dates Y and Z"
- Pointers: "you asked these questions about it"
- Connections: "related to concepts A, B, C"

### What a wiki entry does NOT contain
- Definitions duplicated from sources
- Full explanations (lives in source or session)
- AI-generated summaries of what user "should" know

### Why this is better than content-style wikis
- **Dodges the truth-source problem**: Wiki doesn't *contain* knowledge with mixed epistemic status; it *points* to where knowledge lives in its original location
- **Lighter to build and maintain**: Tracking encounters and connections is much easier than synthesizing accurate content
- **Avoids the "AI wrote my wiki" problem**: Knowledge feels more authentically the user's
- **Synthesis happens at query time**: When user asks "what do I know about X?", system pulls from real sources rather than from drifted wiki pages
- **Maps to how knowledge actually works**: A web of connections anchored to specific encounters, not memorized definitions

### Implication: connections become first-class
If the wiki is mostly an index, the *connections* between entries are where most of the value lives. Two minimal entries with strong connections > two full content pages floating in isolation. The graph structure does the heavy lifting.

### What this doesn't solve
- Wiki itself isn't readable as a standalone knowledge source — user has to follow pointers back to sources. Probably fine; the "what do I know about X?" interface synthesizes at query time.
- No canonical statement of what user knows — knowledge is implicit in encounters/connections. Probably better — real knowledge is fuzzy and contextual.
- More retrieval steps at query time. Probably fine at MVP scale.

---

## How the wiki gets used by the system

Three distinct use cases, ship in this order:

### 1. Context injection during sessions (MVP — load-bearing)
When user starts a session, retrieve relevant prior content, inject as AI context. Makes the AI feel smart without exposing a "wiki" surface to the user.

### 2. Connection surfacing (v1+)
System proactively surfaces connections: "You're reading X, this connects to Y you read 2 months ago." Higher risk — wrong connections erode trust. Don't ship until #1 works smoothly.

### 3. Direct querying (v2+)
User asks "what do I know about X?" and gets a synthesis of their own past content, generated at query time from the actual source material the index points to. This is where the index-style wiki shines — fresh synthesis from trusted sources, not a stale derived page.

**MVP only needs #1.** The wiki is invisible plumbing; the user just experiences the AI being knowledgeable about their reading history.

---

## Source differentiation (do not skip this)

All content in the system has different epistemic status. Don't blend.

### Content types to tag
- `document`: original source material (authoritative for what was said)
- `session_transcript`: what the user and AI said during a session
- `session_artifact`: generated summary at end of session
- `user_note`: anything the user wrote themselves
- `ai_explanation`: AI's explanations given during sessions (may or may not be accurate)

### Why differentiation matters
- **Source attribution**: Six months from now, what does the system "know" because the textbook said so vs. because the AI explained it that way?
- **Error propagation**: AI explanations from past sessions shouldn't get treated as authoritative source material
- **User voice**: User's questions and reflections are valuable signal — they show what's interesting, what's confusing, what connections the user makes

### MVP implementation
Every chunk in the retrieval index has metadata:
- `source_type` (one of the above)
- `source_id` (which document/session)
- `created_at`

The AI can be told: "Here are passages from documents the user has read, and here are notes from past conversations. Treat documents as source material and notes as the user's evolving understanding."

### Why this matters now even though wiki is later
The wiki structure can come later. The source-type tagging cannot. If you blend everything together at MVP, you can't easily separate it later. Preserve the distinction in metadata from day one.

### How this fits with wiki-as-index
The index-style wiki *needs* source differentiation to work — pointers carry source-type information so the system knows whether it's pointing at authoritative content (a document) or at a past conversation. The two ideas are complementary.

---

## Architectural decisions

### File handling
- **Format**: PDF in, plain text / markdown extracted internally
- **Why convert**: PDFs are a poor substrate for AI reasoning (extraction issues, layout problems, embedded images)
- **Tools**: `pdfplumber`, `pymupdf`, or `unstructured` for extraction
- **Storage**: Supabase + S3-style file storage. Don't agonize. Migratable later.

### Vault format
- Each document = a markdown file (extracted text)
- Each session artifact = a markdown file
- Original PDFs preserved in storage
- Folder structure on disk
- **Why**: Plays nicely with Obsidian, gives users portability, reduces lock-in concerns

### Session artifact (what user gets at end of session)
- **MVP shape**: Summary note covering what was studied, key concepts surfaced, connections to prior reading
- **Saved to**: Vault as markdown
- **Why one shape only**: Don't ship quizzes / spaced review / question stacks until users tell you they want them

### Persistent context (what AI knows on next session)
- **Pattern**: RAG (Retrieval-Augmented Generation)
- **Mechanism**: Embed all prior content (documents, session artifacts, transcripts). On new session, retrieve top-N chunks similar to current focus, inject as context.
- **Critical**: Each chunk carries source-type metadata so the AI knows what kind of content it's looking at

### Retrieval strategies (worth thinking about even if MVP is simple)
Different needs may want different retrieval mixes:
- **Mid-session retrieval**: heavy on current document, light on past sessions, none on past documents
- **Session artifact generation**: heavy on current session, moderate on past sessions about adjacent topics
- **Future: "what do I know about X"**: heavy across past content, ideally routed by index entries

For MVP, one general retrieval is fine. But design the system so different retrieval strategies can be added.
