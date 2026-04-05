# LLM Knowledge Bases

> TLDR: Using LLMs to compile and maintain personal knowledge bases from raw sources — markdown wikis that the LLM writes, organizes, and queries, replacing traditional RAG with file-system-native agent navigation.

## Overview

A pattern popularized by Andrej Karpathy in April 2026: instead of relying on RAG pipelines or app-locked AI memory, you collect raw source material (articles, papers, notes, images) and have an LLM "compile" it into an interlinked wiki of markdown files. The LLM maintains the wiki — writing articles, adding backlinks, categorizing concepts — and you rarely edit it directly. The wiki becomes both a reference for you and a structured knowledge base your AI agent can navigate.

## How It Works

1. **Ingest** — Index source documents into a `raw/` directory. Web articles via Obsidian Web Clipper, papers, repos, images, notes.
2. **Compile** — An LLM processes the raw sources and produces/updates a wiki: markdown files organized by topic, with summaries, backlinks, and cross-references.
3. **Query** — Once the wiki is large enough (~100 articles, ~400K words per Karpathy's example), you ask the agent complex questions and it researches answers by navigating the wiki's file structure and index files.
4. **Lint** — Periodic health checks: find inconsistencies, impute missing data via web search, suggest new article candidates, clean up data integrity.
5. **Loop** — Query outputs get filed back into the wiki, so your explorations compound over time.

## Key Principles

- **File over app** — Data stored as plain files (markdown, images) in universal formats. No vendor lock-in. Any tool, CLI, or agent can operate on them. Viewable in Obsidian, VS Code, or custom UIs.
- **Explicit memory** — Unlike opaque AI personalization ("gets better the more you use it"), the knowledge artifact is inspectable and navigable. You can see exactly what the AI knows and doesn't know.
- **BYOAI** — Any AI can plug into the wiki. Claude, GPT, open-source models. In principle, you could fine-tune a model on your wiki so it "knows" the content in its weights, not just context.
- **Agent-navigable structure** — Backlinks and index files let agents find what they need via filesystem traversal rather than vector search. Karpathy and Farza both found this works better than RAG at wiki scale.

## Implementations

**Karpathy's approach:** Raw data → LLM-compiled wiki → Obsidian as viewer → CLI tools for search and Q&A. Mentioned vibe-coding a small search engine over the wiki, used both directly and handed to LLMs as a tool.

**Farzapedia (Farza):** 2,500 diary/notes/iMessage entries → LLM-compiled 400 articles covering friends, startups, research, anime. Built for the agent, not the human — the wiki structure and backlinks make it crawlable from `index.md`. Claude Code navigates it well. Previously tried RAG, found it inferior.

## Open Questions

- How well does this scale beyond ~100 articles / 400K words? At what point does agent navigation break down and you need search tooling?
- Fine-tuning on personal wikis — Karpathy mentions this as a future direction. Would give the model implicit knowledge rather than requiring context window.
- Productization — Both Karpathy and Farza hinted at building products around this. As of April 2026, it's still a DIY pattern.

## Sources

- "Farzapedia, personal wikipedia of Farza..." — Andrej Karpathy (tweet thread, Apr 2026)
- "The guy who literally wrote the most popular deep learning..." — Aakash Gupta (tweet, Apr 2026)
