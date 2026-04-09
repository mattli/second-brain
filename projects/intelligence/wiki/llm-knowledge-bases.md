---
created_at: 2026-04-05
last_updated: 2026-04-09
---

# LLM Knowledge Bases

> TLDR: Using LLMs to compile and maintain personal knowledge bases from raw sources — markdown wikis that the LLM writes, organizes, and queries, replacing traditional RAG with file-system-native agent navigation.

## Overview

A pattern popularized by [Andrej Karpathy](andrej-karpathy.md) in April 2026: instead of relying on RAG pipelines or app-locked AI memory, you collect raw source material (articles, papers, notes, images) and have an LLM "compile" it into an interlinked wiki of markdown files. The LLM maintains the wiki — writing articles, adding backlinks, categorizing concepts — and you rarely edit it directly. The wiki becomes both a reference for you and a structured knowledge base your AI agent can navigate.

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

**Community tools mentioned in gist comments:**
- qmd (by Tobi Lutke) — local search engine for markdown with hybrid BM25/vector search and LLM re-ranking, CLI + MCP server
- Commonplace — similar wiki system by zby
- Context Lattice — meta-RAG system combining MongoDB, graph, vector, and semantic services
- Engram — always-on agent with MEMORY.md persistence + wiki compilation
- GitCMS — CMS for markdown-based wiki management via MCP

## Tooling Tips

- **Obsidian Web Clipper** — browser extension converting web articles to markdown
- **Download images locally** — Set Obsidian attachment folder, bind hotkey. Lets LLM reference images directly instead of relying on URLs
- **Obsidian graph view** — Best way to see wiki shape, connections, orphans
- **Marp** — Markdown slide decks, Obsidian plugin available
- **Dataview** — Obsidian plugin for queries over page frontmatter
- **TLDR at top of pages** — Helps both humans and LLMs decide whether to read full article (saves tokens)

## LLM Wiki as Infrastructure for Agent Research

Karpathy's autoresearch project extends this pattern into scientific research: an AI agent autonomously modifies ML training code, runs 5-minute experiments, checks results, and iterates — ~100 experiments per overnight GPU session. The human edits `program.md` (instructions), the agent modifies `train.py` (code). The same principles apply: file-based, explicit, navigable — but now the "wiki" is an evolving codebase and research log, and the LLM is the researcher. See [Andrej Karpathy](andrej-karpathy.md).

## File > App

Anish Acharya (a16z) identifies an emerging paradigm: local files are the durable and preferred way to capture data, with apps/intelligence as a dynamic overlay. Evidence:

- **Claude Cowork** — file-centric architecture where the agent works with your files directly
- **OpenClaw** — memory architecture based on flat markdown files (SOUL.md, MEMORY.md, DREAMS.md — see [Peter Steinberger](peter-steinberger.md))
- **Dwarkesh Patel's observation** — coding agents made rapid progress because source code is an "external scaffold of memory"

This architecture particularly benefits enterprise users: agents running on laptops inherit employee permissions, internal systems are accessible via browser, and memory can cascade from employees → teams → enterprise through simple file sharing.

Related: Balaji Srinivasan's thesis that local files outlast apps, and Paul Graham's observation that "the best designs are often simple." HTTP was controversial for being plain text on the wire — turned out to be one of the best design decisions ever made.

The [Obsidian Second Brain](https://twitter.com/CyrilXBT) pattern (CyrilXBT) demonstrates this in practice: using Obsidian + Claude to build a personal knowledge system where the agent reads and writes to the same markdown files the human uses.

## Open Questions

- How well does this scale beyond ~100 articles / 400K words? At what point does agent navigation break down and you need search tooling like qmd?
- Fine-tuning on personal wikis — Karpathy mentions this as a future direction. Would give the model implicit knowledge rather than requiring context window.
- Productization — Multiple people building products around this. As of April 2026, it's still mostly a DIY pattern with community tools emerging.

## Sources

- "LLM Knowledge Bases" — Andrej Karpathy (tweet, Apr 2, 2026)
- "Farzapedia, personal wikipedia of Farza..." — Andrej Karpathy (tweet thread, Apr 4, 2026)
- "llm-wiki" — Andrej Karpathy (GitHub gist, Apr 4, 2026)
- "The guy who literally wrote the most popular deep learning..." — Aakash Gupta (tweet, Apr 2026)
- "karpathy is showing one of the simplest AI architectures..." — JUMPERZ (tweet, Apr 2026)
- "Andrej Karpathy Shares LLM-Powered Obsidian Knowledge Workflow" — x.com summary
- "Wow, this tweet went very viral!" — Andrej Karpathy (tweet, Apr 2026)
- "llm-wiki · GitHub" — GitHub (Apr 2026)
- "Build your own knowledge base with the /add-karpathy-llm-wiki skill!" — tweet (Apr 2026)
- "Notes on AI Apps / Feb 2026" — Anish Acharya (tweet, Apr 2026)
- "How I Turned Obsidian Into a Second Brain That Runs on Claude" — CyrilXBT (tweet, Apr 2026)
