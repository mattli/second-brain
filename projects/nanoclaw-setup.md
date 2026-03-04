---
title: NanoClaw Setup
status: living
created: 2026-03-03
updated: 2026-03-03
version: 1.1
---

# NanoClaw Setup

## What Is NanoClaw

NanoClaw is a lightweight open-source AI agent framework — approximately 500 lines of code — focused on security and container isolation. It is designed to run agents in isolated environments, making it a safer foundation for automating tasks that touch sensitive systems or credentials.

---

## Planned Integrations

- **Telegram** — notifications and lightweight interactive control
- **Gmail** — email reading and sending as agent actions
- **Obsidian** — read and write to the second-brain vault
- **GitHub** — commit, push, and repository operations

---

## Future Architecture

The current briefing system runs sequentially — a single Claude Code session reads instructions and executes all research and synthesis tasks in one pass. The planned NanoClaw architecture replaces this with parallel multi-agent orchestration:

- **Specialized fetch agents** — one agent per data source or section, running in parallel
- **Orchestrator agent** — receives outputs from fetch agents and handles synthesis
- **Optimized model selection** — lighter/faster models for fetch tasks, more capable models for synthesis and writing

This should significantly reduce total briefing runtime and allow each agent to be tuned for its specific task rather than using a single general-purpose session for everything.

---

## Vision

Each agent should have a distinct name and voice via ElevenLabs. Voice and name combinations make agents feel like distinct collaborators rather than a generic AI. Examples:

- **Briefing agent** — calm, authoritative
- **Research agent** — thoughtful, measured
- **Product thinking agent** — conversational

Design agents as named entities from the start — not bolted on later.

**End goal:** AirPods-in, hands-free interaction with the second brain while working. Voice in via iPhone microphone or Telegram. Voice out via ElevenLabs text-to-speech.

---

## Status

Not started — pending Mac Mini setup.
