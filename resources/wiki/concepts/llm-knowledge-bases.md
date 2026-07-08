---
created_at: 2026-04-05
last_updated: 2026-07-08
---

# LLM Knowledge Bases

> TLDR: Using LLMs to compile and maintain personal knowledge bases from raw sources — markdown wikis that the LLM writes, organizes, and queries, replacing traditional RAG with file-system-native agent navigation. Popularized by [Andrej Karpathy](../people/andrej-karpathy.md) in April 2026 as an intentionally abstract "idea file" designed to be shared with any LLM agent — in the agent era, you share ideas as text, not code.

## Recent Updates

- **2026-07-08:** Added [The Scaling Wall](#the-scaling-wall) section — retrieval ceiling, identity gap, and OWASP memory-poisoning risk; expanded GBrain and Claude Code entries with concrete scaling limits.
- **2026-06-27:** Removed stale Overview; folded Karpathy attribution and "ideas as text" framing into [TLDR](#llm-knowledge-bases).

## Architecture

Three layers:

1. **Raw sources** — Curated collection of immutable source documents (articles, papers, images, data). The LLM reads from these but never modifies them. Source of truth.
2. **The wiki** — LLM-generated markdown files: summaries, entity pages, concept pages, comparisons. The LLM owns this layer entirely — creates pages, updates them, maintains cross-references. You read it; the LLM writes it.
3. **The schema** — A configuration file (CLAUDE.md, AGENTS.md) telling the LLM how the wiki is structured, what conventions to follow, and what workflows to use. You and the LLM co-evolve this over time.

## Operations

- **Ingest** — Drop a new source into raw, tell the LLM to process it. A single source might touch 10-15 wiki pages. Can be supervised or batch-ingested.
- **Compile** — The LLM reads sources, extracts key information, integrates into existing wiki — updating entity pages, revising summaries, flagging contradictions.
- **Query** — Ask questions against the wiki. The LLM searches via index files, reads relevant pages, synthesizes answers. Good answers get filed back into the wiki as new pages — explorations compound.
- **Lint** — Periodic health checks: find contradictions, stale claims, orphan pages, missing cross-references, data gaps. The LLM suggests new questions and sources to investigate.

## Key Principles

- **File over app** — Data stored as plain files (markdown, images) in universal formats. No vendor lock-in. Any tool, CLI, or agent can operate on them. Viewable in Obsidian, VS Code, or custom UIs.
- **Explicit memory** — Unlike opaque AI personalization ("gets better the more you use it"), the knowledge artifact is inspectable and navigable. You can see exactly what the AI knows and doesn't know.
- **BYOAI** — Any AI can plug into the wiki. Claude, GPT, open-source models. In principle, you could fine-tune a model on your wiki so it "knows" the content in its weights, not just context.
- **Agent-navigable structure** — Backlinks and index files let agents find what they need via filesystem traversal rather than vector search. Works surprisingly well at moderate scale (~100 sources, ~hundreds of pages).
- **The wiki is a persistent, compounding artifact** — The key difference from RAG: cross-references are already there, contradictions already flagged, synthesis already reflects everything read. Knowledge is compiled once and kept current, not re-derived on every query.

## Why It Works

The tedious part of maintaining a knowledge base is the bookkeeping — updating cross-references, keeping summaries current, noting contradictions, maintaining consistency across dozens of pages. Humans abandon wikis because maintenance burden grows faster than value. LLMs don't get bored and can touch 15 files in one pass. The human's job: curate sources, direct analysis, ask good questions, think about what it all means.

Related in spirit to Vannevar Bush's Memex (1945) — a personal, curated knowledge store with associative trails between documents. Bush's vision was closer to this than to what the web became. The part he couldn't solve was who does the maintenance.

## Implementations

**Karpathy's approach:** Raw data → LLM-compiled wiki → Obsidian as viewer → CLI tools for search and Q&A. His research wiki reached ~100 articles and ~400K words. Uses Obsidian Web Clipper for ingestion, Marp for slide generation, matplotlib for charts.

**Farzapedia (Farza):** 2,500 diary/notes/iMessage entries → LLM-compiled 400 articles covering friends, startups, research, anime. Built for the agent, not the human — the wiki structure and backlinks make it crawlable from `index.md`. Claude Code navigates it well. Previously tried RAG, found it inferior.

**Tw93's learning workflow:** A structured pattern for converting learning into output in the AI era. Stages: collect high-quality material → read and filter → build mental map → outline → draft → refine with AI → publish. The key principle: *"AI is most useful when attached to real output."* The workflow treats AI as a final-stage refinement tool applied after the human has already done the sense-making work, not as a shortcut that replaces it. Also introduced the Waza `/learn` skill — open-source Claude Code skill that scaffolds this workflow, allowing agents to execute the entire pipeline from a topic input.

**Familiar (Avid):** Full vault system with 13 agents, cron-automated capture/processing/review, KIMI Work desktop agent for local-first operation. Designed as infrastructure: MCP server exposure makes the vault queryable by any agent in the stack. Open source at [github.com/codejunkie99/familiar-second-brain](https://github.com/codejunkie99/familiar-second-brain). See § File > App for architecture details.

**GBrain (Garry Tan):** Open-sourced as the brain behind Tan's own agents. Follows the LLM Wiki pattern — knowledge lives as markdown in a git "brain repo" with a CLAUDE.md-style schema — but adds a knowledge graph auto-built from entity references. What makes it work at 146,646 pages (not Karpathy's ~100): GBrain doesn't query the markdown directly. It syncs the repo into Postgres — pgvector for semantic search, tsvector for keyword search, Reciprocal Rank Fusion to combine them. The markdown is the interface you edit; the database is what answers your questions. The clearest proof that crossing the flat-file ceiling means building a search engine underneath.

**Claude Code auto memory:** Ships on by default since v2.1.59. Memory lives at `~/.claude/projects/<project>/memory/` as plain markdown — structurally the LLM Wiki almost line-for-line. `MEMORY.md` is a concise index loaded every session; topic files like `debugging.md` are read on demand. No embeddings, no vector store. Anthropic caps it hard: only the first 200 lines or 25KB of the index load per session, memory is scoped to one git repo, and it is "machine-local" — explicitly not shared across machines or cloud environments. The company that could build any retrieval system chose plain files, and the price is a memory that cannot leave your laptop or your repo. That is not a bug — it is the pattern's ceiling, drawn by the people who know it best.

**Community tools mentioned in gist comments:**
- qmd (by Tobi Lutke) — local search engine for markdown with hybrid BM25/vector search and LLM re-ranking, CLI + MCP server
- Commonplace — similar wiki system by zby
- Context Lattice — meta-RAG system combining MongoDB, graph, vector, and semantic services
- Engram — always-on agent with MEMORY.md persistence + wiki compilation
- GitCMS — CMS for markdown-based wiki management via MCP
- **Readwise MCP** — Readwise Reader integration via MCP, enabling agents to read, search, and manage saved articles and highlights directly. https://readwise.io/mcp
  - *Readwise & Reader changelogs (Feb–May 2026):* Wikiwise Mac app, dark mode highlights, annotation bars, tweet rendering, podcast category override, API filtering, Zapier export, OPML import, Claude highlight search, security updates.
- **SurfSense** — Open-source, self-hostable knowledge aggregator. Connects to Slack, Notion, Gmail, GitHub, YouTube, Confluence, and search engines. Includes podcast generation via local TTS (Kokoro) — nothing leaves your machine. Best fit for privacy-sensitive workflows (legal, medical, finance) where third-party data exposure is non-negotiable.
- **Recall** — Cross-document querying tool. Ingests PDFs, slides, videos, articles and allows chat across all sources at once, removing the "one notebook at a time" constraint of tools like NotebookLM. No hard source limits. Aimed at researchers and consultants juggling many documents across projects.

## Audio as Knowledge Consumption Layer

A growing category of tools converts knowledge base content into audio for on-the-go consumption — extending the wiki pattern with a listen-first interface. Google's **NotebookLM** pioneered this with AI-generated "audio overviews" (two-host conversational summaries of uploaded sources). By mid-2026, NotebookLM runs on Gemini 3 with a large context window and supports up to 300 sources per notebook — functioning as a structured knowledge synthesis tool with audio output, not just a summarizer.

Limitations driving users to alternatives: fixed voice pair, 20-minute cap, 3/day audio limit on free tier, weak mobile experience, and paying for Plus didn't improve audio quality. The gap created space for specialized tools:

- **Illuminate** (Google) — Academic paper audio, tuned for dense research content. Separate product from NotebookLM. Narrower scope (papers only) but cleaner output for that use case.
- **BeFreed** — Personalized audio learning paths. Evaluates user level and goal, builds learning paths from books, expert talks, and research. Customizable voice, length (40+ min), and narration style. Mobile-first design. Trade-off: newer app, some UX rough edges.
- **ElevenLabs Reader** — High-quality TTS for articles and PDFs. No AI synthesis — pure narration. Best voice quality in the category. Useful as a "read it aloud" tool for long-form content.
- **NoteGPT** — YouTube-specific: timestamped summaries, question-answering against video timestamps. Chrome extension. Good for triaging long lectures and podcasts before committing to a full listen.
- **StewReads** — MCP plugin for Claude, ChatGPT, and Mistral that converts AI conversations into ebooks or audiobooks, deliverable to Kindle or Apple Podcasts.

The pattern: knowledge bases handle *compilation and synthesis*, audio tools handle *consumption*. SurfSense bridges both — it aggregates sources like a knowledge base AND generates podcasts locally. The DIY approach is also viable: one user described building a custom pipeline with Google's API to research topics, generate audio, and email MP3s on a daily schedule.

## Tooling Tips

- **Obsidian Web Clipper** — browser extension converting web articles to markdown
- **Smart Connections** — Obsidian plugin (4,700+ GitHub stars, 786K+ downloads) that indexes an entire vault via embeddings and finds semantic connections between notes automatically. Surfaces relationships the user never explicitly linked — turns the knowledge graph from a visualization into a working search mechanism. Pairs with MCP servers (e.g. `obsidian-mcp`) so external agents can read, search, and write to the vault.
- **Download images locally** — Set Obsidian attachment folder, bind hotkey. Lets LLM reference images directly instead of relying on URLs
- **Obsidian graph view** — Best way to see wiki shape, connections, orphans
- **Marp** — Markdown slide decks, Obsidian plugin available
- **Dataview** — Obsidian plugin for queries over page frontmatter
- **TLDR at top of pages** — Helps both humans and LLMs decide whether to read full article (saves tokens)

## LLM Wiki as Infrastructure for Agent Research

Karpathy's autoresearch project extends this pattern into scientific research: an AI agent autonomously modifies ML training code, runs 5-minute experiments, checks results, and iterates — ~100 experiments per overnight GPU session. The human edits `program.md` (instructions), the agent modifies `train.py` (code). The same principles apply: file-based, explicit, navigable — but now the "wiki" is an evolving codebase and research log, and the LLM is the researcher. See [Andrej Karpathy](../people/andrej-karpathy.md).

## File > App

Anish Acharya (a16z) identifies an emerging paradigm: local files are the durable and preferred way to capture data, with apps/intelligence as a dynamic overlay. Evidence:

- **Claude Cowork** — file-centric architecture where the agent works with your files directly
- **OpenClaw** — memory architecture based on flat markdown files (SOUL.md, MEMORY.md, DREAMS.md — see [Peter Steinberger](../people/peter-steinberger.md))
- **Dwarkesh Patel's observation** — coding agents made rapid progress because source code is an "external scaffold of memory"

This architecture particularly benefits enterprise users: agents running on laptops inherit employee permissions, internal systems are accessible via browser, and memory can cascade from employees → teams → enterprise through simple file sharing.

Related: Balaji Srinivasan's thesis that local files outlast apps, and Paul Graham's observation that "the best designs are often simple." HTTP was controversial for being plain text on the wire — turned out to be one of the best design decisions ever made.

The [Obsidian Second Brain](https://twitter.com/CyrilXBT) pattern (CyrilXBT) demonstrates this in practice: using Obsidian + Claude to build a personal knowledge system where the agent reads and writes to the same markdown files the human uses.

**Familiar (Avid/codejunkie99):** An Obsidian-like vault built from scratch, designed for fully automated agent processing via Moonshot's [KIMI Work](../tools/kimi-work.md) desktop agent (built on the open-weight Kimi K2.6 model). Goes beyond the "invoke when needed" pattern — three cron-driven skills run the vault autonomously: morning web capture (7am), inbox processing (8am), and weekly review (Friday 6pm). KIMI Work's Agent Swarm parallelizes bulk processing across up to 300 sub-agents (a 50-file inbox batch completes in under 4 minutes). Vault reached 347 notes with hundreds of cross-links in 11 weeks. Kimi K2.6 also introduces **Document to Skill** — upload an exemplar note (e.g. how you structure research or analysis) and the model captures its "structural DNA," reproducing your format and approach in subsequent outputs. The more notes converted into skills, the less generic the results become — a form of style transfer that compounds alongside the vault's content.

Architecture follows the three-layer pattern closely — immutable `/resources/` folder (agents never modify sources), agent-generated `/wiki/` pages with YAML frontmatter (including `confidence` and `last_updated_by` fields for auditability), and an `AGENTS.md` schema file portable across any agent. Adds **tiered memory** (journal / projects / wiki / CRM) to prevent stale project context from contaminating synthesis. Key safety rule: *agents never write to `/journal/`* — human timestamped thinking is ground truth everything else builds on.

Notable features: global quick-capture hotkey (Cmd+Shift+K) that drops thoughts into the inbox from anywhere on the desktop; vault exposed as an MCP server so Claude Code, Cursor, or any MCP-compatible agent queries the same knowledge base; weekly lint pass filtering `last_updated_by: agent` with `confidence: low` for human review (~20 min/week). Voice memo ingestion via local Whisper and WebBridge reading-list capture are in development.

**Defileo's "Claude + Obsidian" implementation** takes this further with a full operational playbook. Key additions beyond the basic pattern:

- *Morning briefing automation* — A Python script on a cron job reads Memory.md for due actions, checks /raw-sources for new files from the last 24 hours, and prints a clean terminal briefing at 7:30am daily. Set up once, runs forever.
- *Transcript → system update pipeline* — Process a call transcript in one prompt: extract decisions, action items with owners/deadlines, and 3-bullet summary. Route to Action-Tracker.md, Decision-Log.md, and client notes — with backlinks. Nothing lost to chat history.
- *Terminal-first workflow* — "You don't even need to open Obsidian. Point Claude Code at the folder, work from the terminal, and your second brain quietly builds itself in the background. Obsidian is just the window you look through."
- *The maintenance death spiral* — Most second brain projects die the same way: start organized → maintenance piles up → skip it → system degrades → back to scattered notes → rebuild 6 months later → repeat. Claude breaks the cycle because maintenance is just a command. Reorganizing the entire vault is a prompt.

Defileo explicitly traces the pattern to Vannevar Bush's Memex (1945): "a personal, curated knowledge store where the connections between documents are as valuable as the documents themselves. He called it the Memex. The part he couldn't solve was who does the maintenance."

## AI Memory Tools: Two Paradigms

A comprehensive survey of 900+ GitHub repos (witcheer, Apr 2026) reveals two fundamentally different approaches to agent memory:

### Camp 1: Memory Backends

Extract facts from conversations, store in vector databases, retrieve on demand. The loop: conversation → extract facts → store → next conversation retrieves relevant facts. Optimizes for **recall** — "can the system find the right fact?"

Key tools:
- **Mem0** (53K stars) — Category leader. Four operations: add/search/update/delete. Flat entries, no relationships, no temporal supersession.
- **MemPalace** (46K stars) — Verbatim storage, no extraction. 96.6% retrieval recall on LongMemEval via raw semantic search. Limitation: scales linearly, no synthesis.
- **Supermemory** (22K stars) — Temporal awareness: "I just moved to San Francisco" supersedes old city. Expired facts auto-forgotten. Closest Camp 1 gets to thinking about state.
- **Honcho** (2.4K stars) — Treats humans and agents as "peers," builds psychological models of each from sessions.

### Camp 2: Context Substrates

Maintain structured, human-readable context that accumulates across sessions. Nothing gets "extracted" — the context IS the files. The loop: agent reads context → works within it → writes back → next session, context is richer. Optimizes for **compounding** — "does the system get better over time?"

Key tools:
- **OpenClaw** (358K stars) — MEMORY.md + daily notes + DREAMS.md. "Dreaming" consolidation process: light sleep (grouping) → REM (weighted recall promotion) → deep sleep (threshold-gated promotion into long-term memory). Six weighted signals score candidates.
- **Zep** (4.4K stars) — Rebranded from "memory" to "context engineering" — the strongest market signal in the landscape. Temporal knowledge graph with valid_at/invalid_at timestamps. Sub-200ms retrieval.
- **Thoth** (145 stars) — Deepest architecture found. Personal knowledge graph with 10 entity types and 67 typed relations. Nightly four-phase dream cycle: duplicate merging → description enrichment → relationship inference → confidence decay.
- **TrustGraph** (2K stars) — "Context Cores": portable, versioned bundles with schemas, knowledge graphs, embeddings, evidence, retrieval policies. Treats context like code — version, test, promote, roll back.
- **MemSearch/Zilliz** (1.2K stars) — Markdown-first memory from the Milvus team. Files are source of truth; vector search is just an access layer. Notable: a vector DB company shipping a product where their own database is downstream of plain files.

### The Prediction

"Within 6 months, 'context engineering' replaces 'memory' as the default term for what serious agent infrastructure does." The projects building substrate-style architectures will pull ahead of fact-storage approaches.

## Semantic Collapse: Why RAG Breaks at Scale

Stanford researchers exposed a fundamental scaling limit in RAG systems called "Semantic Collapse." The mechanism:

- Under 10,000 documents, vector embeddings cluster well — similar concepts group together and retrieval works as intended.
- Past 10,000 documents, the high-dimensional embedding space fills up. Clusters overlap. Distances compress. Everything starts to look "relevant."
- This is a mathematical inevitability called the **Curse of Dimensionality**: in a 1000-dimensional space, 99.9% of data lives on the outer edge. All points become equidistant.

**The Stanford findings:** At 50,000 documents, precision drops by 87%. Semantic search becomes *worse* than old-school keyword search. Adding more context doesn't fix hallucinations — it makes them worse, because "nearest neighbor" search finds everyone, not the best answer.

This validates the LLM Wiki approach: compiled, cross-referenced markdown files where synthesis is done once and kept current — rather than re-derived via vector search on every query. At moderate scale (~100 sources, hundreds of pages), agent-navigable file structure with backlinks and index files outperforms RAG without the scaling cliff.

## The Scaling Wall

Every second brain implementation, once it grows past a toy vault, hits the same two walls in the same order.

**First, retrieval.** The "just read the index" trick works until the index no longer fits in the context window. [Karpathy](../people/andrej-karpathy.md) drew the line at ~100 sources and pointed to hybrid BM25/vector search past it. Anthropic drew it at 200 lines and a single machine. GBrain and the Obsidian plugins arrive at the same answer from different directions: a vector index under the files. For every implementation that crossed this line, the files were never the retrieval system — the database underneath was. A folder of markdown is a good way to store knowledge and a bad way to find it.

**Second, identity.** A second brain compiles knowledge about a corpus — what your documents say about a topic. That is different from remembering a user: preferences, past decisions, what an agent tried in a different app yesterday. A vault has no notion of identity. Claude Code's memory is bound to one repository on one machine because a pile of files has no way to know *whose* memory it is or to follow that person across sessions, machines, and apps. The moment you need memory scoped to a person rather than a document set, you need something the file-system pattern cannot provide: identity-tagged storage with cross-app retrieval.

**Third, security.** Because a second brain trusts whatever is written into it, the files are an attack surface. In December 2025, OWASP named Memory and Context Poisoning as ASI06 in its Top 10 for Agentic Applications — a dedicated top-tier risk in which attacker-controlled content persists in memory and is trusted across sessions, long after a prompt injection would have reset. A vault the agent reads on every startup is exactly that surface. The risk scales with openness: the more sources an agent ingests, the larger the window for poisoned content to enter the memory layer.

None of this makes the pattern bad. For a personal wiki of a few hundred notes, or one repo's build quirks, files plus keyword search are genuinely enough. The wall is about scale, multiple agents, and multiple apps — not about note-taking.

## Context Engineering vs RAG

Nyk (Apr 2026) argues RAG was an engineering workaround for small context windows — you couldn't fit the whole document, so you chunked, embedded, searched, and injected. With Claude Opus 4.6 at 1M tokens (750K words, 3,000 pages) and Gemini 3 Pro at 2M, context capacity grew 500x in three years. The bottleneck moved from retrieval to curation. "70% of LLM errors come from bad context, not bad models."

**When long context replaces RAG:** Bounded document sets under 500K tokens (~375K words) — skip the entire RAG pipeline. No chunking, no embeddings, no vector database. Claude Code already works this way: reads files directly, uses agentic search, manages context through compaction — not retrieval.

**When RAG still wins:** Scale beyond the window (millions of documents), cost at volume (50-200x token reduction), freshness (incremental indexing in seconds), access control (permission filtering before retrieval).

**The "lost in the middle" problem:** Models over-attend to beginning and end, under-attend to middle. At 1M tokens, there's a 15-17pp drop between 256K and 1M on Anthropic's MRCR v2 benchmark. 1 in 4 multi-needle retrievals fail at full window. Practical reliable performance: 500-700K range. Critical information should go at beginning or end.

**The four pillars of context engineering:** (1) Knowledge retrieval — RAG, agentic search, direct reading, MCP; (2) Memory management — CLAUDE.md, auto-memory, compaction; (3) Context orchestration — document placement, priority ordering, token budgeting; (4) Quality monitoring — retrieval accuracy, hallucination rate, task completion.

The honest answer for most teams: use both. Retrieve to narrow the corpus, then pass the relevant subset in full rather than chunking it further.

## Web-Native LLM Access: /llms.txt

The same "file over app" principle that makes personal wikis work applies to public websites. Jeremy Howard's `/llms.txt` proposal standardizes how websites expose content to LLMs: place a markdown file at `/llms.txt` containing a curated overview of the site — project name, summary, and links to detailed markdown versions of key pages. Individual pages can also offer clean markdown at the same URL with `.md` appended.

The format is intentionally simple — an H1 title, an optional blockquote summary, freeform markdown notes, then H2-delimited sections listing linked resources. An `## Optional` section marks content that can be skipped when context is tight. The file is both human-readable and parseable by classical tools (regex, parsers), not just LLMs.

Where `/llms.txt` complements the wiki pattern: personal wikis solve knowledge access for *your own* curated sources, while `/llms.txt` solves it at the *publisher* level — documentation sites, APIs, legislation, course catalogs. Both reject the same failed approach: forcing LLMs to extract meaning from complex HTML, navigation chrome, and JavaScript. Both converge on markdown as the universal interchange format.

The standard coexists with `robots.txt` (access policy) and `sitemap.xml` (exhaustive page list) by serving a different purpose: curated, context-window-friendly overviews rather than complete indexes. Tools like `llms_txt2ctx` expand `/llms.txt` into full context files by inlining linked documents — effectively compiling a mini knowledge base from the spec, much like how wiki compilation works from raw sources.

## Open Questions

- How well does this scale beyond ~100 articles / 400K words? At what point does agent navigation break down and you need search tooling like qmd?
- Fine-tuning on personal wikis — Karpathy mentions this as a future direction. Would give the model implicit knowledge rather than requiring context window.
- Productization — Multiple people building products around this. As of April 2026, it's still mostly a DIY pattern with community tools emerging.

## Sources

- "RAG is broken and nobody's talking about it" — How To AI (tweet, Apr 2026)
- "Context Engineering killed RAG" — Nyk (tweet, Apr 2026)
- "LLM Knowledge Bases" — Andrej Karpathy (tweet, Apr 2, 2026) ([link](https://x.com/karpathy/status/2039805659525644595/?s=12&rw_tt_thread=True))
- "Farzapedia, personal wikipedia of Farza..." — Andrej Karpathy (tweet thread, Apr 4, 2026) ([link](https://x.com/karpathy/status/2040572272944324650/?s=12&rw_tt_thread=True))
- "llm-wiki" — Andrej Karpathy (GitHub gist, Apr 4, 2026) ([link](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f))
- "The guy who literally wrote the most popular deep learning..." — Aakash Gupta (tweet, Apr 2026) ([link](https://x.com/aakashgupta/status/2040662476862394592/?s=12&rw_tt_thread=True))
- "karpathy is showing one of the simplest AI architectures..." — JUMPERZ (tweet, Apr 2026) ([link](https://x.com/jumperz/status/2039826228224430323/?rw_tt_thread=True))
- "Andrej Karpathy Shares LLM-Powered Obsidian Knowledge Workflow" — x.com summary ([link](https://x.com/i/trending/2039841987067617664))
- "Wow, this tweet went very viral!" — Andrej Karpathy (tweet, Apr 2026) ([link](https://x.com/karpathy/status/2040470801506541998/?s=12&rw_tt_thread=True))
- "llm-wiki · GitHub" — GitHub (Apr 2026) ([link](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f))
- "Build your own knowledge base with the /add-karpathy-llm-wiki skill!" — tweet (Apr 2026) ([link](https://x.com/nanoclaw_ai/status/2041409400946950485/?s=12&rw_tt_thread=True))
- "Notes on AI Apps / Feb 2026" — Anish Acharya (tweet, Apr 2026) ([link](https://x.com/illscience/status/2023424880776228974/?s=12&rw_tt_thread=True))
- "How I Turned Obsidian Into a Second Brain That Runs on Claude" — CyrilXBT (tweet, Apr 2026) ([link](https://x.com/cyrilxbt/status/2040988306154901742/?s=12&rw_tt_thread=True))
- "How I Turn Learning Into a Workflow in the AI Era" — Tw93 (Apr 2026)
- "Claude + Obsidian have to be illegal" — Defileo (tweet thread, Apr 2026) ([link](https://x.com/defileo_))
- "I Went Through Every AI Memory Tool I Could Find. There Are Two Camps." — witcheer (tweet thread, Apr 2026) ([link](https://x.com/witcheer))
- "The /llms.txt file" — Jeremy Howard (llmstxt.org) ([link](https://llmstxt.org/)): Proposed web standard for LLM-friendly site content via markdown at `/llms.txt`; connects the "file over app" principle to publisher-side knowledge access.
- "NotebookLM alternatives I'm actually using in 2026 (after getting burned by Plus)" — Realistic-Spare97 (Reddit r/notebooklm, May 2026): Audio learning tool landscape; SurfSense, Recall, BeFreed, Illuminate, NoteGPT, ElevenLabs Reader, StewReads.
- "I Built My Own Obsidian. Then put Kimi Work. Which Turned It Into a Second Brain." — Avid (@Av1dlive, tweet thread, Jun 2026) ([link](https://x.com/Av1dlive/status/2065475063928000681)): Familiar vault system — local-first Obsidian clone with KIMI Work agent automation, cron-driven capture/processing/review, MCP server exposure, tiered memory architecture.
- "Obsidian + Kimi K2.6 turned my 7,000 notes into a $15,000/month research system" — Noisy (@noisyb0y1, tweet thread, Jun 2026) ([link](https://x.com/noisyb0y1/status/2066856811404087519)): Practical walkthrough of connecting Obsidian vault to Kimi K2.6 via Smart Connections plugin and MCP server; Document to Skill feature for style transfer.
- "Second Brain and the Wall it Hits" — Mem0 / In Context #16 (tweet thread, Jul 2026): Survey of five second-brain implementations (Karpathy, Claude Code, GBrain, Obsidian plugins); the scaling wall (retrieval ceiling → identity gap); OWASP ASI06 memory poisoning risk; concrete scaling numbers from Anthropic and GBrain.
