# coldmountain.ai — Second Brain Feature Brief

## What Is Second Brain?

Second Brain is a personal AI system for agentic product management. It synthesizes market signals and industry trends, applies product frameworks to evaluate ideas, and deploys specialized agents to generate testable deliverables.

Second Brain runs in two modes: scheduled agents that deliver intelligence automatically, and on-demand agents you can query anytime via Telegram.

---

## What It Does Today

Today, Second Brain functions as an intelligence layer. Built on Claude and a self-hosted agent framework called NanoClaw, it continuously monitors signals across AI, technology, and product. Every weekday morning an AI agent scans the web, synthesizes what matters, and delivers a structured briefing to my Obsidian vault. I get notified via Telegram when it's ready.

Weekly and monthly summaries build on those daily signals, surfacing trends and product observations over time. Everything the system learns and produces is written to a personal knowledge vault in the form of a structured set of markdown files. They are then synced to GitHub, serving as the long-term memory of the system.

**Current capabilities:**
- Daily AI and technology intelligence briefing (automated, 7am weekdays)
- Weekly synthesis of key trends and signals
- Monthly strategic summary with product observations
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

The next phase extends Second Brain from an intelligence layer into a fully agentic product development system.

### Phase 2: PM Best Practices Layer

Second Brain will apply structured product management frameworks to any idea or market signal, automatically, on demand via Telegram.

Planned capabilities:
* **Discovery**: problem validation, ideal customer profile, competitive landscape 
- **RICE scoring:** Reach, Impact, Confidence, Effort scoring to prioritize ideas
- **SWOT analysis:** strengths, weaknesses, opportunities, threats for any idea or competitor
- **PRD generation:**  competitive positioning, go-to-market channels, user stories, and success metrics for an MVP
- **Technical requirements:** stack, APIs, integrations, acceptance criteria, and level of effort estimation, structured for direct handoff to a coding agent

The workflow: intelligence in, PM frameworks applied, prioritized and documented product decisions out.

### Phase 3: Agent Swarm for Execution

A coordinated swarm of specialized agents takes a vetted idea from decision to working prototype, compressing the time from market signal to shipped experiment from weeks to hours.

---

## What I'm Learning

Building Second Brain is as much about understanding how AI changes the way you work as it is about the system itself:

- **Product and a tool.** Over time it reveals its own strengths and weaknesses. You notice where prompts need tightening and workflows could be improved. The same iteration loops you run on any product apply here. This takes time and effort, and can draw your focus away from what you actually want the system to do for you.
- **Friction significantly decreases.** Conversational interactions via Telegram replace context switching across multiple tools and manual work. Moving files, creating documents, scheduling tasks, articulating notes, and setting reminders all happen in a single chat thread.
- **Guardrails matter.** A system without them becomes unmanageable quickly. An effective pattern is having the system propose changes with you as the final decision maker. The system improves itself, but you stay in control.


