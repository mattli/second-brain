> Last updated: 2026-03-18

This document explains how the second-brain system works — what runs, when, why, and how the pieces connect. Written for both future reference and to give Claude context at the start of a session.

---

## What This System Is

A personal AI-powered research and product development engine running on a Mac Mini M4 home server. It automatically generates daily intelligence briefings and weekly summaries, stores everything in a structured Obsidian vault, and versions everything through GitHub. The long-term vision is to automate the full cycle from market intelligence to product insight to early prototyping.

---

## How It Works — End to End

### Daily Briefing (7am, Monday–Friday)
1. NanoClaw's task scheduler triggers the briefing agent in a Docker container
2. The agent reads `projects/intelligence/instructions/daily-briefing.md` for task instructions
3. The agent searches 15+ sources — TechCrunch, The Verge, Reuters, Hacker News, Twitter/X, AI lab blogs, Reddit, GitHub Trending, and others (web fetch enabled in container)
4. The agent synthesizes findings into a structured briefing covering: top news, model releases, what builders are talking about, funding and launches, and notable debates
5. The briefing is saved to `projects/intelligence/ai-briefings/YYYY-MM-DD.md`
6. Results are sent to Telegram via @matts_second_brain_bot
7. Host-side cron commits and pushes vault changes to GitHub every 30 minutes
8. Obsidian Sync syncs to other devices (MacBook Pro, iPhone)

### Weekly Summary (7am, Saturday)
1. A cron job on the Mac Mini runs Claude Code (not yet migrated to NanoClaw)
2. Claude reads the last 5 weekday briefings from `projects/intelligence/ai-briefings/`
3. Claude synthesizes across the week — surfacing patterns, signal vs noise, builder pulse, money flows, and one big open question
4. Claude also searches a16z, Sequoia, Kleiner Perkins, and Khosla Ventures for new investment thesis posts
5. Summary is saved to `projects/intelligence/weekly-summaries/YYYY-WXX.md`
6. Committed and pushed to GitHub, synced via Obsidian Sync

### Monthly Summary (7am, 1st of month)
1. A cron job on the Mac Mini runs Claude Code (not yet migrated to NanoClaw)
2. Claude reads the last 4–5 weekly summaries from `projects/intelligence/weekly-summaries/`
3. Claude synthesizes into longer-term trends, product observations, and strategic signals
4. Summary is saved to `projects/intelligence/monthly-summaries/YYYY-MM.md`
5. Product observations are written back to `projects/product/product-vision.md`
6. Committed and pushed to GitHub, synced via Obsidian Sync

---

## Key Files

| File | Purpose |
|------|---------|
| `~/.claude/CLAUDE.md` | Global Claude Code instructions — applies to every session |
| `projects/intelligence/instructions/daily-briefing.md` | Instructions for the daily briefing (current: v2.6) |
| `projects/intelligence/instructions/weekly-summary.md` | Instructions for the weekly summary (current: v1.4) |
| `projects/intelligence/instructions/monthly-summary.md` | Instructions for the monthly summary (current: v1.0) |
| `projects/intelligence/ai-briefings/` | Daily briefing outputs |
| `projects/intelligence/weekly-summaries/` | Weekly summary outputs |
| `projects/intelligence/monthly-summaries/` | Monthly summary outputs |
| `projects/intelligence/intelligence-layers.md` | Architecture plan for the intelligence system |
| `projects/nanoclaw/nanoclaw-setup.md` | Planning doc for the next phase (multi-agent architecture) |
| `projects/nanoclaw/mac-mini-setup.md` | Mac Mini setup, build order, and open questions |
| `projects/product/product-vision.md` | North star, active ideas, and trends worth watching |

---

## Claude Settings and Claude MD files

**Machine level** (`~/.claude/settings.json`)

- MacBook Pro: exists, `effortLevel: medium`, git + WebSearch
- Mac Mini: just added, same settings
- Purpose: controls interactive Claude Code sessions on that machine

**Global CLAUDE.md** (`~/.claude/CLAUDE.md`)

- MacBook Pro: exists — always plan first, never delete files, vault location, end-of-session ritual (4 steps: update session-tasks.md + affected project docs, verify permissions), quick reference with aliases and commands
- Mac Mini: exists — same structure, adapted for Mac Mini environment + git status
- Purpose: rules that apply to every Claude Code session on that machine

**NanoClaw project** (`~/nanoclaw/CLAUDE.md`)

- Exists on Mac Mini
- Purpose: developer docs for when you're working on NanoClaw source code in the terminal

**NanoClaw agent defaults** (`~/nanoclaw/groups/global/CLAUDE.md`)

- Purpose: baseline personality and behavior inherited by all agent containers

**NanoClaw main chat** (`~/nanoclaw/groups/main/CLAUDE.md`)

- Purpose: instructions for your Telegram chat agent
- Split in two 
	- NanoClaw admin content (group management, allowlists, scheduling) to groups/main/nanoclaw-admin.md
	- Keep personality, tools, vault access, and response style in CLAUDE.md

**NanoClaw briefing agent** (`~/nanoclaw/groups/briefing/CLAUDE.md`)

- Purpose: single-purpose briefing instructions — clean, 31 lines

--- 

## Scheduled Tasks

| Task | Schedule | What it does |
|------|----------|--------------|
| Daily briefing | 7am Mon–Fri | Researches and writes intelligence briefing to vault |
| Weekly summary | 7am Saturday | Synthesizes the week's briefings |
| Monthly summary | 7am 1st of month | Synthesizes monthly trends, updates product-vision.md |
| Daily to-do | 8am daily | Reads today's section from daily-to-do.md and sends it to Telegram |
| Weekly to-do recap | 4pm Friday | Sends reflective weekly summary, then resets daily-to-do.md for next week |
| Vault sync | Every 30 min | Commits and pushes vault changes to GitHub |
| March 21 reminder | Once, Mar 21 9am | Check if "Check usage" note is still in briefing CLAUDE.md |

---

## Infrastructure

| Component | Role |
|-----------|------|
| Mac Mini M4 | Always-on home server — runs all automated jobs |
| NanoClaw | Agent framework — Docker containers running Claude Agent SDK, manages daily briefing |
| cron | macOS scheduler — weekly summary, monthly summary, vault git sync |
| Claude Code | Executes weekly/monthly summary instructions autonomously (via cron) |
| Docker | Container runtime for NanoClaw agent isolation |
| Telegram | Primary interface — @matts_second_brain_bot for briefing delivery and chat |
| Claude subscription OAuth | Auth for NanoClaw containers via credential proxy |
| Anthropic API key | Auth for cron-based Claude Code runs (weekly/monthly) |
| GitHub | Version control — vault synced every 30 minutes via host-side cron |
| Obsidian | Note-taking app — vault at `~/second-brain/` on each machine |
| Obsidian Sync | Syncs the vault between Mac Mini, MacBook Pro, and iPhone |

---

## Authentication

- **Interactive Claude Code sessions** (manual work) — use Claude.ai Max subscription credentials, stored in macOS Keychain
- **NanoClaw containers** — use Claude subscription OAuth token, injected by NanoClaw's credential proxy (port 3001); API keys never enter containers
- **Automated cron jobs** (weekly/monthly) — use Anthropic API key stored in `~/.zshrc` as `ANTHROPIC_API_KEY`; the cron environment cannot access the macOS Keychain

---

## Vault Structure

```
second-brain/
  system-overview.md    — this file
  archives/             — archived notes
  areas/                — ongoing responsibilities and interests
  personal/             — private notes
  projects/             — active projects and documentation
    intelligence/       — intelligence system architecture
      ai-briefings/     — daily briefing outputs
      instructions/     — prompt files for Claude Code
      weekly-summaries/ — weekly summary outputs
      monthly-summaries/— monthly summary outputs
      intelligence-layers.md
    nanoclaw/           — NanoClaw server setup and planning
      mac-mini-setup.md
      nanoclaw-setup.md
    product/            — product vision and ideas
      product-vision.md — north star, active ideas, trends watching
    writing/            — writing system for Substack and X
```

---

## Vision

### Phase 2 — PM Best Practices Layer

Extend Second Brain from an intelligence layer into an on-demand product management system. Query via Telegram, get structured PM output back.

- **SWOT analysis** — strengths, weaknesses, opportunities, threats for any idea or competitor
- **RICE scoring** — Reach, Impact, Confidence, Effort to prioritize ideas
- **PRD generation** — ideal customer profile, TAM/SAM/SOM market sizing, competitive positioning, go-to-market channels, user stories, success metrics
- **Technical requirements** — stack, APIs, integrations, acceptance criteria, level of effort estimation, structured for direct handoff to a coding agent

### Phase 3 — Agent Swarm for Execution

A coordinated swarm of specialized agents takes a vetted idea from decision to working prototype — compressing the time from market signal to shipped experiment from weeks to hours.

### Infrastructure Improvements

- Migrate weekly and monthly summaries from cron to NanoClaw scheduled tasks
- Multi-agent orchestration — parallel fetch agents feeding a synthesis orchestrator
- Model routing — lighter models for fetch/classify, Sonnet for deep reading and synthesis
- Cost reduction — current daily briefing costs ~$1.00; multi-agent architecture should reduce to $0.10–0.20

See `projects/nanoclaw/nanoclaw-setup.md` for full planning details.

---

## Cost

- Daily briefing: ~$1.00/run (Sonnet 4.6 via Anthropic API)
- Weekly summary: ~$1.17/run
- Estimated monthly: ~$25–26 (weekday briefings + Sunday summaries)
- Billed to Anthropic Console separately from Claude.ai Max subscription


