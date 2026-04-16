---
created_at: 2026-04-05
last_updated: 2026-04-16
---

# LLM Knowledge Bases

> TLDR: Using LLMs to compile and maintain personal knowledge bases from raw sources — markdown wikis that the LLM writes, organizes, and queries, replacing traditional RAG with file-system-native agent navigation.

## Overview

A pattern popularized by [Andrej Karpathy](../people/andrej-karpathy.md) in April 2026: instead of relying on RAG pipelines or app-locked AI memory, you collect raw source material (articles, papers, notes, images) and have an LLM "compile" it into an interlinked wiki of markdown files. The LLM maintains the wiki — writing articles, adding backlinks, categorizing concepts — and you rarely edit it directly. The wiki becomes both a reference for you and a structured knowledge base your AI agent can navigate.

Karpathy published a formal "idea file" as a GitHub gist (1,000+ stars in the first day) — intentionally abstract so anyone's agent can customize and build it for their specific needs. The concept: in the agent era, you share ideas as text, not code.

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

**Community tools mentioned in gist comments:**
- qmd (by Tobi Lutke) — local search engine for markdown with hybrid BM25/vector search and LLM re-ranking, CLI + MCP server
- Commonplace — similar wiki system by zby
- Context Lattice — meta-RAG system combining MongoDB, graph, vector, and semantic services
- Engram — always-on agent with MEMORY.md persistence + wiki compilation
- GitCMS — CMS for markdown-based wiki management via MCP
- **Readwise MCP** — Readwise Reader integration via MCP, enabling agents to read, search, and manage saved articles and highlights directly. https://readwise.io/mcp

## Tooling Tips

- **Obsidian Web Clipper** — browser extension converting web articles to markdown
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

See also: the "Context Engineering killed RAG" thesis — as context windows grow to 1M+ tokens, the need for chunking and retrieval diminishes for smaller document sets, while the real challenge becomes selecting the *right* context, not finding *any* context.

## Open Questions

- How well does this scale beyond ~100 articles / 400K words? At what point does agent navigation break down and you need search tooling like qmd?
- Fine-tuning on personal wikis — Karpathy mentions this as a future direction. Would give the model implicit knowledge rather than requiring context window.
- Productization — Multiple people building products around this. As of April 2026, it's still mostly a DIY pattern with community tools emerging.

## Sources

- "RAG is broken and nobody's talking about it" — How To AI (tweet, Apr 2026)
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
