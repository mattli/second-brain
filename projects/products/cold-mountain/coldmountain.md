# coldmountain.ai — Second Brain Feature Brief

## What Is Second Brain?

Second Brain is a personal AI system for research, product development, and building. It monitors market signals, validates product ideas against real evidence, generates specifications, and moves them toward working prototypes — compressing the path from insight to shipped experiment.

The system runs on a mix of scheduled agents that deliver intelligence automatically and on-demand workflows triggered via Telegram and Claude Code.

---

## Intelligence

Second Brain continuously monitors signals across AI, technology, and product. Every weekday morning an AI agent scans the web, synthesizes what matters, and delivers a structured briefing to my Obsidian vault. I get notified via Telegram when it's ready. Weekly and monthly summaries build on those daily signals, surfacing trends and product observations over time.

## Research

Product signals come from X via [Bird](https://www.npmjs.com/package/@steipete/bird), a CLI that searches X's GraphQL API directly. Bird powers a weekly product briefing that mines builder threads and product launches, extracting what people are shipping and what's gaining traction.

Everything I come across — X posts, articles, GitHub repos, newsletters — gets saved to [Readwise](https://readwise.io), which acts as an async intake pipeline. Second Brain synthesizes anything in that queue and surfaces how it connects to what I'm currently working on. A weekly scheduled agent compiles a personal knowledge wiki from those highlights, following Andrej Karpathy's LLM wiki pattern — cross-referenced markdown pages an agent can query when working on related topics. [Parallel](https://parallel.ai) handles web search when I need to go deeper on a topic in real time.

Everything the system learns and produces is written to a personal knowledge vault as structured markdown, synced to GitHub as the long-term memory of the system.

## Validation

When something is worth pursuing, Second Brain runs a structured research and validation process. Using [Last 30 Days](https://github.com/mvanhorn/last30days-skill), it searches Reddit and X for real pain points, existing solutions, and market gaps — grounding ideas in recent evidence before investing further.

## Specification

Once a problem is validated, Second Brain generates high-fidelity product specifications using [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) — detailed enough to hand off directly for prototyping or development.

## Execution

Second Brain takes validated specs and moves them toward working prototypes, using [Superpowers](https://github.com/obra/superpowers) and [G-Stack](https://github.com/garrytan/gstack) for planning, brainstorming, and development within Claude Code.

---

**Technology stack:**
- Mac Mini M4, always-on, home-hosted
- NanoClaw (self-hosted agent framework, Docker, Node.js)
- Claude Sonnet via Anthropic API
- Claude Code with [Superpowers](https://github.com/obra/superpowers), [G-Stack](https://github.com/garrytan/gstack), and [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin)
- [Bird](https://www.npmjs.com/package/@steipete/bird) for X/Twitter search
- [Last 30 Days](https://github.com/mvanhorn/last30days-skill) for product validation research
- [Readwise](https://readwise.io) for reading aggregation and synthesis
- [Parallel](https://parallel.ai) for web search
- Obsidian vault synced to GitHub via automated git pipeline
- Obsidian Sync for device sync, GitHub for version history and backup
- Telegram bot for agent interaction
