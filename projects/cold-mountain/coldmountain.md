# coldmountain.ai — Second Brain Feature Brief

## What Is Second Brain?

Second Brain is a personal AI assistant specialized in research, project management, and product development. It synthesizes market signals and industry trends, applies product frameworks to evaluate ideas, and deploys specialized agents to generate testable deliverables. 

The system runs in two modes: scheduled agents that deliver intelligence automatically, and on-demand agents you can query anytime via Telegram.

---

## What It Does Today

Second Brain functions as an intelligence layer. Built on Claude and a self-hosted agent framework called NanoClaw, it continuously monitors signals across AI, technology, and product. Every weekday morning an AI agent scans the web, synthesizes what matters, and delivers a structured briefing to my Obsidian vault. I get notified via Telegram when it's ready.

Weekly and monthly summaries build on those daily signals, surfacing trends and product observations over time. Everything the system learns and produces is written to a personal knowledge vault in the form of a structured set of markdown files. They are then synced to GitHub, serving as the long-term memory of the system.

**Current capabilities:**
- Daily AI and technology intelligence briefing (automated, 7am weekdays)
- Daily product briefing tracking what builders are shipping and what's gaining traction
- Weekly synthesis organized around emerging problem categories — who has them, what's being built, what's getting traction
- Monthly summary identifying which problem categories are durable enough to build on
- Persistent knowledge vault, searchable, versioned, always current
- Telegram interface for on-demand queries and agent interaction

**Technology stack:**
- Mac Mini M4, always-on, home-hosted
- NanoClaw (self-hosted agent framework, Docker, Node.js)
- Claude Sonnet via Anthropic API
- Claude Code for development
- Obsidian vault synced to GitHub via automated git pipeline
- Obsidian Sync for device sync, GitHub for version history and backup
- Telegram bot for agent interaction

---

## What It's Becoming

The next phase extends Second Brain from an intelligence layer into a system that can act on what it finds.

### Validation

When something surfaces from the intelligence layer that's worth pursuing, Second Brain can run a structured research and validation process on demand via Telegram. The goal is to go deeper on a problem quickly — grounding it in real evidence before investing further.

### Specification

Once a problem is validated, Second Brain can generate high-fidelity product specifications — detailed enough to hand off directly for prototyping or development. The goal is to eliminate the gap between a validated idea and something a developer or coding agent can act on.

### Execution

Agents that can take a validated idea and move it toward a working prototype. The specifics are still taking shape, but the direction is clear: compress the time from insight to shipped experiment.


