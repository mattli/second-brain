# System Overview

> Last updated: 2026-03-12

This document explains how the second-brain system works — what runs, when, why, and how the pieces connect. Written for both future reference and to give Claude context at the start of a session.

---

## What This System Is

A personal AI-powered research and product development engine running on a Mac Mini M4 home server. It automatically generates daily intelligence briefings and weekly summaries, stores everything in a structured Obsidian vault, and versions everything through GitHub. The long-term vision is to automate the full cycle from market intelligence to product insight to early prototyping.

---

## How It Works — End to End

### Daily Briefing (7am, Monday–Friday)
1. A cron job on the Mac Mini wakes up and runs Claude Code
2. Claude Code reads `~/.claude/CLAUDE.md` for global standing instructions
3. Claude Code reads `projects/intelligence/instructions/daily-briefing.md` for task instructions
4. Claude searches 15+ sources — TechCrunch, The Verge, Reuters, Hacker News, Twitter/X, AI lab blogs, Reddit, GitHub Trending, and others
5. Claude synthesizes findings into a structured briefing covering: top news, model releases, what builders are talking about, funding and launches, and notable debates
6. The briefing is saved to `projects/intelligence/briefings/YYYY-MM-DD.md`
7. Claude commits and pushes to the private GitHub repo (`second-brain`)
8. iCloud syncs the file to Obsidian on other devices

### Weekly Summary (8am, Sunday)
1. Same cron mechanism triggers a weekly summary run
2. Claude reads the last 5 weekday briefings from `projects/intelligence/briefings/`
3. Claude synthesizes across the week — surfacing patterns, signal vs noise, builder pulse, money flows, and one big open question
4. Claude also searches a16z, Sequoia, Kleiner Perkins, and Khosla Ventures for new investment thesis posts
5. Summary is saved to `projects/intelligence/weekly-summaries/YYYY-WXX.md`
6. Committed and pushed to GitHub, synced via iCloud

---

## Key Files

| File | Purpose |
|------|---------|
| `~/.claude/CLAUDE.md` | Global Claude Code instructions — applies to every session |
| `projects/intelligence/instructions/daily-briefing.md` | Instructions for the daily briefing (current: v2.1) |
| `projects/intelligence/instructions/weekly-summary.md` | Instructions for the weekly summary (current: v1.4) |
| `projects/intelligence/briefings/` | Daily briefing outputs |
| `projects/intelligence/weekly-summaries/` | Weekly summary outputs |
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

- MacBook Pro: exists — always plan first, never delete files, end of session ritual
- Mac Mini: doesn't exist
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

## Infrastructure

| Component | Role |
|-----------|------|
| Mac Mini M4 | Always-on home server — runs all automated jobs |
| cron | macOS scheduler — triggers Claude Code at 7am weekdays and 8am Sunday |
| Claude Code | Executes briefing and summary instructions autonomously |
| Anthropic API | Powers Claude Code for automated runs (separate from Claude.ai subscription) |
| `~/.zshrc` | Stores `ANTHROPIC_API_KEY` so cron jobs can authenticate |
| GitHub | Version control — every briefing and summary is committed and pushed |
| Obsidian | Note-taking app — the vault lives here, synced via iCloud |
| iCloud | Syncs the vault between Mac Mini, MacBook, and iPhone |

---

## Authentication

- **Interactive Claude Code sessions** (manual work) — use Claude.ai Max subscription credentials, stored in macOS Keychain
- **Automated cron jobs** — use Anthropic API key stored in `~/.zshrc` as `ANTHROPIC_API_KEY`; the cron environment cannot access the macOS Keychain, so the API key is required for unattended runs

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
      briefings/        — daily briefing outputs
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

## What's Next

The current system is Phase 1 — single-agent, sequential, cron-based. Phase 2 (NanoClaw) replaces this with:
- Multi-agent orchestration — parallel fetch agents feeding a synthesis orchestrator
- Model routing — lighter models for fetch/classify, Sonnet for deep reading and synthesis
- Telegram integration — notifications and lightweight interactive control
- Significant cost reduction — current daily briefing costs ~$1.00 due to growing context; multi-agent architecture should reduce this to $0.10–0.20

See `projects/nanoclaw/nanoclaw-setup.md` for full planning details.

---

## Cost

- Daily briefing: ~$1.00/run (Sonnet 4.6 via Anthropic API)
- Weekly summary: ~$1.17/run
- Estimated monthly: ~$25–26 (weekday briefings + Sunday summaries)
- Billed to Anthropic Console separately from Claude.ai Max subscription


