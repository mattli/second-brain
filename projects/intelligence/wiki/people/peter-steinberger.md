---
created_at: 2026-04-05
last_updated: 2026-04-09
---

# Peter Steinberger

> TLDR: Prolific builder of AI developer tools and creator of OpenClaw. Ex-PSPDFKit founder who pivoted to "polyagentmorous" development — building 50+ open-source tools at extreme velocity using AI agents.

## Overview

Vienna/London-based developer. Founded PSPDFKit (PDF SDK, exited 2021 via TechCrunch-reported deal). Now building AI-native developer tools at ludicrous speed. Self-describes as "polyagentmorous builder." 660K+ GitHub contributions in the last year. Runs 3-6 Claude instances concurrently.

## Current Work

Primary project: **OpenClaw** — "the AI that actually does things." A full-featured AI agent platform with channels (WhatsApp, Discord, Telegram, Slack), voice calls, browser automation, and plugin ecosystem.

Notable tools (50+ repos):
- **Peekaboo** — macOS screenshots & GUI automation (MCP + CLI), 3K stars
- **mcporter** — Call MCPs via TypeScript or package as CLI, 3.5K stars
- **CodexBar** — Show OpenAI/Claude usage stats in menubar, 9.6K stars
- **VibeTunnel** — Turn any browser into your terminal
- **bird** — Fast X CLI for tweeting, replying, reading
- **summarize** — Point at any URL or file, get the gist
- **oracle** — Invoke GPT-5 Pro with custom context and files

## Opinions

- **"I never use plan mode"** — Claims plan mode was added for "claude-pilled people who struggle with changing their habits." Advocates conversational interaction over structured planning. Contrasts with [gstack's](../tools/claude-code-skill-frameworks.md) structured workflow approach.
- **SOUL.md** — Created personality configuration guide for OpenClaw agents. Key principle: "Sharp beats vague." Good rules: "have a take, skip filler, call out bad ideas." Bad rules: "maintain professionalism at all times."
- **Agent proficiency** — Exemplifies the [builder archetype](../concepts/agent-proficiency.md) Karpathy describes: extreme velocity through agent orchestration.

## Notable OpenClaw Use Cases

**Ryan Sarver's "Stella" (chief of staff):** A VC managing fundraise + board roles + portfolio built an AI chief of staff named Stella on OpenClaw. Stella:
- Sends pre-meeting briefs 60 minutes before external meetings via WhatsApp, with prior notes, open action items, and LP pipeline context
- Processes all meeting notes via Granola API; extracts action items to Todoist; tracks commitments per person in markdown files
- Runs a Friday research scan of OpenClaw community for new patterns, and Sunday review loop to continuously improve the system
- Provides morning and evening briefs via WhatsApp

Key architectural principle: LLMs handle judgment (synthesis, prioritization, drafting); Python scripts handle deterministic work (reading files, calling APIs, comparing timestamps). "When you push deterministic work through an LLM, things break in unpredictable ways and you stop trusting the system."

Memory layer: flat markdown files (daily notes + MEMORY.md). Observable, git-backable, no abstraction layer. The human can open any file, see exactly what the AI knows, and fix it instantly.

**Dave Morin's "Theory of Mind in Three Files":** A philosophical framework for OpenClaw's architecture, articulated by Dave Morin (Apr 2026). Three plaintext markdown files that form a complete agent identity system:

- **SOUL.md (Identity)** — Who the AI is: voice, values, personality, taste. Plaintext, model-agnostic, portable. "The model is not the product. The personality is the product." If your lab disappears, your soul doesn't go with it.
- **MEMORY.md (Experience)** — What the AI has lived: a living document of decisions, relationships, open threads. Not a vector database — a narrative. "The accumulated weight of shared experience, exactly what makes any relationship real."
- **DREAMS.md (Integration)** — What the AI is becoming: when idle, the agent reflects, finds connections between conversations, surfaces emerging patterns. "You wake up and your AI has been thinking. Not executing tasks. *Thinking.*"

The triad — identity, experience, integration — works across Claude, GPT, Grok, Gemma, open-weight models. The soul layer is the part that doesn't move while models change underneath.

**User experience reality check (Peter Yang, a16z Show):** Despite enthusiasm, practical limitations persist. The default memory system (daily MEMORY.md files) "tends to forget things a lot." Yang installed a three-layer memory system with vector search to improve recall. The agent also "tends to forget that it can do stuff" — requiring explicit reminders in agents.md. Yang estimates 70-80% of OpenClaw's value is "just the personable part" (Telegram integration making it feel like texting a friend), with tool capabilities secondary. See [LLM Knowledge Bases](../concepts/llm-knowledge-bases.md).

**Lex Fridman Podcast appearance (Podcast #491):** Peter discussed OpenClaw's rapid growth, its self-modifying capability, and his vision of it as "a powerful tool that works like a helpful coworker." See also the a16z Show interview with Peter Yang.

## Sources

- "steipete (Peter Steinberger)" — GitHub profile ([link](https://github.com/steipete))
- "I never use plan mode" — Peter Steinberger (tweet, Apr 2026) ([link](https://twitter.com/steipete/status/2039551079621566812/?rw_tt_thread=True))
- "Your @openclaw is too boring?" — Peter Steinberger (tweet, Apr 2026) ([link](https://x.com/steipete/status/2020704611640705485/?s=12&rw_tt_thread=True))
- "SOUL.md Personality Guide" — OpenClaw docs ([link](https://docs.openclaw.ai/concepts/soul))
- "How I built a chief of staff on OpenClaw that's better than any human I've hired" — Ryan Sarver (tweet thread, Apr 2026) ([link](https://x.com/rsarver/status/2041148425366843500/?rw_tt_thread=True))
- "OpenClaw: The Viral AI Agent that Broke the Internet" — Lex Fridman Podcast #491 ([link](https://www.youtube.com/watch?v=YFjfBk8HI5o&t=351s))
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang on The a16z Show ([link](https://youtube.com/watch?v=UE8jx4dvlSQ&si=GjAYLtlY5pE380BK))
- "A Theory of Mind in Three Files" — Dave Morin (tweet thread, Apr 2026) ([link](https://x.com/davemorin/status/2040999146694553761/?rw_tt_thread=True))
