# coldmountain.ai — Second Brain Feature Brief

## What Is Second Brain?

Second Brain is a personal AI system for research, product development, and building. It monitors market signals and industry trends, validates product ideas against real evidence, and generates specifications and prototypes through specialized agents.

The system runs in two modes: scheduled agents that deliver intelligence automatically, and on-demand agents you can query anytime via Telegram.

---

## What It Does Today

Second Brain functions as an intelligence and research layer. Built on Claude and a self-hosted agent framework called NanoClaw, it continuously monitors signals across AI, technology, and product — then makes that intelligence actionable.

Every weekday morning an AI agent scans the web, synthesizes what matters, and delivers a structured briefing to my Obsidian vault. I get notified via Telegram when it's ready. Weekly and monthly summaries build on those daily signals, surfacing trends and product observations over time.

Product signals come from X via [Bird](https://www.npmjs.com/package/@steipete/bird), a CLI that searches X's GraphQL API directly. Bird powers a weekly product briefing that mines builder threads and product launches, extracting what people are shipping and what's gaining traction.

Everything I come across — X posts, articles, GitHub repos, newsletters — gets saved to [Readwise](https://readwise.io), which acts as an async intake pipeline. Second Brain can synthesize anything in that queue and surface how it connects to what I'm currently working on. [Parallel](https://parallel.ai) handles web search when I need to go deeper on a topic in real time.

Everything the system learns and produces is written to a personal knowledge vault as structured markdown, synced to GitHub as the long-term memory of the system.

**Current capabilities:**
- Daily AI and technology intelligence briefing (automated, 7am weekdays)
- Weekly product briefing via Bird — mining X threads for launches, organized by problem category
- Monthly summary identifying which problem categories are durable enough to build on
- Readwise integration for async reading and synthesis across sources
- Parallel-powered web search for on-demand deep research
- Persistent knowledge vault, searchable, versioned, always current
- Telegram interface for on-demand queries and agent interaction

**Technology stack:**
- Mac Mini M4, always-on, home-hosted
- NanoClaw (self-hosted agent framework, Docker, Node.js)
- Claude Sonnet via Anthropic API
- Claude Code with [Superpowers](https://github.com/obra/superpowers), [G-Stack](https://github.com/garrytan/gstack), and [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) for planning, brainstorming, and development
- [Bird](https://www.npmjs.com/package/@steipete/bird) for X/Twitter search
- [Last 30 Days](https://github.com/mvanhorn/last30days-skill) for product validation research
- [Readwise](https://readwise.io) for reading aggregation and synthesis
- [Parallel](https://parallel.ai) for web search
- Obsidian vault synced to GitHub via automated git pipeline
- Obsidian Sync for device sync, GitHub for version history and backup
- Telegram bot for agent interaction

---

## What It's Becoming

The next phase extends Second Brain from an intelligence layer into a system that can act on what it finds.

### Validation — In Progress

When something surfaces from the intelligence layer that's worth pursuing, Second Brain runs a structured research and validation process. Using [Last 30 Days](https://github.com/mvanhorn/last30days-skill), it searches Reddit and X for real pain points, existing solutions, and market gaps — grounding ideas in recent evidence before investing further.

### Specification — In Progress

Once a problem is validated, Second Brain generates high-fidelity product specifications using [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin). The goal is to eliminate the gap between a validated idea and something a developer or coding agent can act on — detailed enough to hand off directly for prototyping.

### Execution

Agents that can take a validated idea and move it toward a working prototype. The specifics are still taking shape, but the direction is clear: compress the time from insight to shipped experiment.


