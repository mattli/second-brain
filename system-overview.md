> Last updated: 2026-03-13

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
5. The briefing is saved to `projects/intelligence/briefings/YYYY-MM-DD.md`
6. Results are sent to Telegram via @matts_second_brain_bot
7. Host-side cron commits and pushes vault changes to GitHub every 30 minutes
8. iCloud syncs to Obsidian on other devices

### Weekly Summary (7am, Sunday)
1. A cron job on the Mac Mini runs Claude Code (not yet migrated to NanoClaw)
2. Claude reads the last 5 weekday briefings from `projects/intelligence/briefings/`
3. Claude synthesizes across the week — surfacing patterns, signal vs noise, builder pulse, money flows, and one big open question
4. Claude also searches a16z, Sequoia, Kleiner Perkins, and Khosla Ventures for new investment thesis posts
5. Summary is saved to `projects/intelligence/weekly-summaries/YYYY-WXX.md`
6. Committed and pushed to GitHub, synced via iCloud

### Monthly Summary (7am, 1st of month)
1. A cron job on the Mac Mini runs Claude Code (not yet migrated to NanoClaw)
2. Claude reads the last 4–5 weekly summaries from `projects/intelligence/weekly-summaries/`
3. Claude synthesizes into longer-term trends, product observations, and strategic signals
4. Summary is saved to `projects/intelligence/monthly-summaries/YYYY-MM.md`
5. Product observations are written back to `projects/product/product-vision.md`
6. Committed and pushed to GitHub, synced via iCloud

---

## Key Files

| File | Purpose |
|------|---------|
| `~/.claude/CLAUDE.md` | Global Claude Code instructions — applies to every session |
| `projects/intelligence/instructions/daily-briefing.md` | Instructions for the daily briefing (current: v2.3) |
| `projects/intelligence/instructions/weekly-summary.md` | Instructions for the weekly summary (current: v1.4) |
| `projects/intelligence/instructions/monthly-summary.md` | Instructions for the monthly summary (current: v1.0) |
| `projects/intelligence/briefings/` | Daily briefing outputs |
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
| NanoClaw | Agent framework — Docker containers running Claude Agent SDK, manages daily briefing |
| cron | macOS scheduler — weekly summary, monthly summary, vault git sync |
| Claude Code | Executes weekly/monthly summary instructions autonomously (via cron) |
| Docker | Container runtime for NanoClaw agent isolation |
| Telegram | Primary interface — @matts_second_brain_bot for briefing delivery and chat |
| Claude subscription OAuth | Auth for NanoClaw containers via credential proxy |
| Anthropic API key | Auth for cron-based Claude Code runs (weekly/monthly) |
| GitHub | Version control — vault synced every 30 minutes via host-side cron |
| Obsidian | Note-taking app — the vault lives here, synced via iCloud |
| iCloud | Syncs the vault between Mac Mini, MacBook, and iPhone |

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

NanoClaw is running with the daily briefing migrated. Next steps:
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


