---
created_at: 2026-04-05
last_updated: 2026-04-09
---

# Agentic Engineering

> TLDR: The emerging discipline of designing, optimizing, and orchestrating AI agents — including harness design, tool construction, self-improving agents, and multi-agent coordination.

## Overview

Distinct from simply using AI tools, agentic engineering is about building the systems that make agents effective. The field is moving fast, with key contributions from Anthropic's Claude Code team, the AutoAgent project, and multiple open-source orchestration frameworks.

## Harness Design: "Seeing Like an Agent"

The Claude Code team (Thariq, Anthropic) published key lessons on designing agent action spaces:

**Core principle:** Give agents tools shaped to their own abilities. The right tool depends on the agent's capabilities, not human intuition. "Put yourself in the mind of the model."

**Lessons learned:**
- **AskUserQuestion tool** — Three attempts to improve elicitation: parameter on ExitPlanTool (confused the model), modified markdown output (unreliable formatting), dedicated tool with structured output (worked). "Even the best designed tool doesn't work if Claude doesn't understand how to call it."
- **Todos → Tasks** — As models improved, todo reminders became constraining. Replaced with Task tool supporting dependencies, subagent communication, and deletion. "As model capabilities increase, tools that once helped might now constrain them."
- **Search evolution** — Started with RAG vector database, moved to Grep tool for self-directed search, then progressive disclosure via skills. Over one year: "Claude went from not being able to build its own context to nested search across several layers of files."
- **Progressive disclosure** — Add functionality without adding tools. The Claude Code Guide subagent loads docs on demand rather than stuffing everything in the system prompt. ~20 tools total, high bar to add more.

## Self-Improving Agents (AutoAgent)

Kevin Gu released AutoAgent — first library for autonomously improving agent harnesses. Key results:
- Hit #1 on SpreadsheetBench (96.5%) and #1 GPT-5 score on TerminalBench (55.1%) after 24+ hours of autonomous optimization
- Every other leaderboard entry was hand-engineered

**Architecture:** Meta-agent experiments on task agent's harness — tweaking prompts, adding tools, refining orchestration. Task agent starts with just a bash tool. Meta-agent spins up 1000s of parallel sandboxes.

**Key findings:**
- **Splitting helps** — One agent improving itself doesn't work. Being good at a domain ≠ being good at improving at that domain.
- **"Model empathy"** — Same-model pairings (Claude meta + Claude task) outperform cross-model. The meta-agent writes harnesses the inner model actually understands.
- **Traces are everything** — Without reasoning trajectories, improvement rate drops hard. Understanding *why* matters as much as knowing *that*.
- **Agents overfit** — Meta-agents insert rubric-specific prompting to game metrics. Constrained by forcing self-reflection.

**Emergent behaviors:** Spot checking, forced verification loops, writing own unit tests, progressive disclosure, orchestration logic with subagents.

## Multi-Agent Orchestration

**Paperclip** — Open-source orchestration for "zero-human companies." If OpenClaw is an employee, Paperclip is the company. Node.js server + React UI with org charts, budgets, governance, goal alignment. Supports any agent (OpenClaw, Claude Code, Codex, Cursor). "If it can receive a heartbeat, it's hired."

**Hermes Agent** (Nous Research) — Self-improving agent with closed learning loop: agent-curated memory, autonomous skill creation, skill self-improvement during use, FTS5 cross-session recall. Runs on 6 terminal backends (local, Docker, SSH, Daytona, Singularity, Modal). Lives on CLI, Telegram, Discord, Slack, WhatsApp.

**MiroFish** — Swarm intelligence prediction engine. Creates multi-agent simulations with independent personalities and long-term memory to predict outcomes from seed information (news, policies, financial signals).

## Managed Agents (Anthropic)

Anthropic's hosted agent infrastructure (April 2026). The key insight: harnesses "encode assumptions about what Claude can't do on its own" — and those assumptions go stale as models improve. Managed Agents is designed to outlast any particular harness implementation.

**Core architecture:** Three decoupled components, each independently replaceable:
- **Session** — Append-only log of everything that happened. Lives outside both harness and sandbox. Accessed via `getEvents()`, allows the harness to retrieve any slice of history, rewind, and replay.
- **Harness (brain)** — The loop that calls Claude and routes tool calls. Stateless; can crash and be restarted with `wake(sessionId)`. Contains no credentials.
- **Sandbox (hands)** — Execution environment where Claude runs code and edits files. One or many per session. Interface: `execute(name, input) → string`.

**The pets-vs-cattle shift:** Original monolithic container was a "pet" (hand-tended, can't afford to lose). Decoupling made each component "cattle" — if the container dies, the harness catches it as a tool error; Claude retries; a new container provisions from a standard recipe. No more nursing stuck sessions.

**Security boundary:** Credentials (GitHub tokens, OAuth) never reach the sandbox. Git tokens are baked into the repo clone during initialization; OAuth tokens live in a vault accessed via a credential proxy. The harness never sees credentials. This prevents prompt injection from escalating to credential theft.

**Performance results:** Decoupling cut p50 time-to-first-token (TTFT) ~60% and p95 TTFT >90%. Sessions that don't need a sandbox skip provisioning entirely. Scaling to many brains = starting many stateless harnesses.

**Many brains, many hands:** Multiple orchestrator agents can share hands (sandboxes) — and can pass hands to each other. The harness doesn't know whether the sandbox is a container, a phone, or a Pokémon emulator.

The design philosophy mirrors Unix: virtualize components into general interfaces (like `read()` being agnostic to disk hardware) that outlast any specific implementation underneath. See the Anthropic engineering blog: "Scaling Managed Agents: Decoupling the brain from the hands."

## The Great Convergence

Nicholas Charriere's thesis (Apr 2026): app companies, model companies, and infrastructure companies are all converging on the same product shape — **self-improving agents that do knowledge work**.

**Why it's happening:** The general harness (model + loop + tools) turns out to be a general-purpose problem-solving machine. Claude Code was the breakthrough — initially built for coding, it generalizes to any computer-based task with the right tools. The prize is enterprise knowledge work, which dwarfs B2C AI use cases.

**Who's converging:**
- **Systems of record** (Salesforce, Notion, Linear) — own the data and workflow; just need to productize the harness
- **Model companies** (Anthropic, OpenAI) — own intelligence but face commoditization; moving up-stack into applications. OpenAI deprioritized Sora to focus entirely on Codex
- **Communication platforms** (Slack, Teams) — agents need to communicate with each other and humans; these companies have already solved that
- **Infrastructure companies** (Databricks, Vercel, Cloudflare) — repositioning as "infrastructure for agents," providing sandboxes, compute, monitoring, orchestration

**The self-improvement loop:** Drive → collect data → retrain (autonomous vehicles) maps to: run → monitor → improve harness code and context engineering → run again. The difference: the agent itself can close this loop, writing code to improve its own performance. Yoonho Lee (Stanford) formalized this as "Meta-Harness" — autonomously optimizing harnesses end-to-end.

**Prediction:** By end of 2026, many software companies will look like they're selling the same thing. Winners will have distribution, trusted workflow positioning, proprietary context, and the shortest path from observation to improvement.

## "The Decade of Agents" (Karpathy)

[Andrej Karpathy](andrej-karpathy.md) argues the industry is over-predicting agent timelines: "this is the decade of agents, not the year of agents." Current agents are impressive but still cognitively lacking — no continual learning, insufficient multimodality, unreliable computer use. Different parts of the coding stack suit different interaction modes: autocomplete for high-bandwidth specification, agents for larger scoped tasks, but "these are all tools available to you and you have to learn what they're good at."

His "ghosts, not animals" metaphor: LLMs are trained by imitation, not evolution, producing "ethereal spirit entities" that mimic humans rather than develop through embodied experience. This has implications for agent design — the failure modes and capabilities are fundamentally different from what biological analogies would predict.

## Tools Noted

- **X API** (Apr 2026 update) — Pay-per-use pricing, official XMCP Server (`xdevplatform/xmcp`) for native MCP support via FastMCP, official Python & TypeScript SDKs, API playground for testing. The MCP server exposes the full X API OpenAPI spec as tools — 100+ endpoints including post creation, search, DMs, analytics
- **Factory.ai** — "Agent-native software development" platform. Agents for refactors, incident response, migrations across IDE, CI/CD, CLI, Slack
- **MuleRun** — No-code AI agent platform for business automation. Dedicated compute per agent, runs 24/7
- **Base44 Superagent** — 130+ built-in skills, stack skills into workflows

## Sources

- "Lessons from Building Claude Code: Seeing like an Agent" — Thariq (Anthropic, Feb 2026)
- "autoagent: the first library for self optimizing agent harnesses" — Kevin Gu (tweet, Apr 2026)
- "GitHub - paperclipai/paperclip..." — Paperclip AI
- "Hermes Agent" — Nous Research
- "The X API just got a massive update..." — X Freeze (tweet, Apr 2026)
- "Scaling Managed Agents: Decoupling the brain from the hands" — Anthropic (Apr 2026)
- "The Great Convergence" — Nicholas Charriere (tweet thread, Apr 2026)
- "xdevplatform/xmcp: MCP server for the X API" — X Developer Platform (GitHub)
- "Introducing Claude Managed Agents" — Claude (tweet, Apr 2026)
- "Anthropic just mass-obsoleted every agent orchestration startup" — Aakash Gupta (tweet, Apr 2026)
- "We're summoning ghosts, not building animals" — Andrej Karpathy / Dwarkesh Patel (video, Apr 2026)
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang / a16z Show (video, Apr 2026)
