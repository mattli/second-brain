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

## Tools Noted

- **X API** (Apr 2026 update) — Pay-per-use pricing, XMCP Server for native MCP support, official Python & TypeScript SDKs, API playground for testing
- **Factory.ai** — "Agent-native software development" platform. Agents for refactors, incident response, migrations across IDE, CI/CD, CLI, Slack
- **MuleRun** — No-code AI agent platform for business automation. Dedicated compute per agent, runs 24/7
- **Base44 Superagent** — 130+ built-in skills, stack skills into workflows

## Sources

- "Lessons from Building Claude Code: Seeing like an Agent" — Thariq (Anthropic, Feb 2026)
- "autoagent: the first library for self optimizing agent harnesses" — Kevin Gu (tweet, Apr 2026)
- "GitHub - paperclipai/paperclip..." — Paperclip AI
- "Hermes Agent" — Nous Research
- "The X API just got a massive update..." — X Freeze (tweet, Apr 2026)
