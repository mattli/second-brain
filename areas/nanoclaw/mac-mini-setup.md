---
title: Mac Mini + NanoClaw Intelligence System
status: in-progress
created: 2026-02-26
updated: 2026-03-18 (rev 6)
---

# Mac Mini + NanoClaw Intelligence System

## The Vision

An always-on personal intelligence system that keeps you informed, surfaces product opportunities, and feeds directly into whatever you build — running automatically with your data under your control.

---

## Current Status

| Component | Status |
|---|---|
| Daily briefing | ✅ Running (Mac Mini, v2.1) |
| Weekly summary | ✅ Running (Mac Mini, v3.3, Saturdays 8am) |
| GitHub private repo (`second-brain`) | ✅ Set up |
| Obsidian vault structure | ✅ Set up 2026-02-26 |
| Obsidian Git plugin | ✅ Set up |
| Mac Mini | ✅ Arrived and set up |
| NanoClaw | ⬜ Not yet set up |
| Telegram integration | ⬜ Not yet set up |
| Cron jobs | ✅ Running on Mac Mini (daily + weekly) |
| Monthly summary | ⬜ Not yet built |

---

## Hardware

**Mac Mini M4** (~$599 one-time)

- Always on, always connected, sits at home
- Runs all your automation
- Your data never leaves your house
- Replaces the need for cloud servers

---

## Data Architecture

Two layers, each serving a different purpose:

```
Obsidian Vault (~/second-brain/, synced via Obsidian Sync)
└── For you to read and write personally
    └── personal/ ← stays here only, never leaves

GitHub Private Repo (second-brain)
└── ai-intelligence/ ← your knowledge base
    └── Version history, backup, connects to products
```

---

## Knowledge Base Structure

```
ai-intelligence/
├── CLAUDE.md                  ← standing instructions
├── instructions/              ← prompt files
│   ├── daily-briefing.md      ✅ v2.1 (running on Mac Mini)
│   ├── weekly-summary.md      ✅ v1.4 (running on Mac Mini, Saturdays)
│   ├── monthly-summary.md     ⬜ to build
│   └── sector-[name].md       ⬜ to build per sector
├── briefings/                 ← daily automated briefings ✅ running
├── weekly-summaries/          ← weekly synthesis ✅ running
└── monthly-summaries/         ← monthly synthesis ⬜ to build

projects/
├── intelligence/              ✅ intelligence system architecture
│   ├── intelligence-layers.md ✅ layer map
│   └── system-overview.md     ✅ system overview
├── nanoclaw/                  ✅ server setup and planning
│   ├── mac-mini-setup.md      ✅ this file
│   └── nanoclaw-setup.md      ✅ NanoClaw vision and setup plan
├── product/                   ✅ product vision and ideas
│   └── product-vision.md      ✅ north star + active ideas
└── writing/                   ✅ writing system for Substack and X
```

---

## Automation

See [[intelligence-layers]] for full layer details.

Cron schedule (running on Mac Mini):

```
7am weekdays  → daily briefing
6am Saturday  → product briefing
8am Saturday  → weekly summary (reads product briefing)
8am 1st of month → monthly summary
```

Each run:
1. Generates markdown → saved to vault
2. Commits to GitHub → version history + backup

---

## Interface

**Now:** Claude Code on MacBook for interactive sessions + Mac Mini running automated cron jobs

**Next — NanoClaw + Telegram:**
- Morning briefing pushed to phone
- Message your agent from anywhere
- Proactive alerts for things you're monitoring
- Named agents with distinct ElevenLabs voices (see `nanoclaw-setup.md`)

---

## Product Pipeline

```
Daily briefings
      ↓
Weekly summaries
      ↓
Monthly summaries (product observations surfaced here)
      ↓
Product ideas → projects/ideas/
      ↓
Product specs
      ↓
GitHub product repos
      ↓
Deployed via Vercel/Netlify
```

---

## Security Model

```
Most private    Personal notes → Obsidian Sync only
                ai-intelligence → GitHub private repo
                API keys → macOS Keychain
Least private   Products → public when you choose
```

Access levels staged deliberately:

**Phase 1 — Now**
- Read/write markdown files
- Web search for briefings

**Phase 2 — When ready**
- Google Workspace read access
- Calendar integration
- Email read access

**Phase 3 — Specific use cases only**
- Email sending (confirmation required)
- Browser automation
- Purchasing (explicit approval every time)

---

## What It Costs

| Item | Cost |
|---|---|
| Mac Mini M4 | $599 one-time |
| GitHub | Free |
| Claude Pro/Max | $20–200/month (already have) |
| Electricity | ~$1–2/month |
| Telegram | Free |
| NanoClaw | Free (open source) |
| **Ongoing** | **~$21–202/month** |

---

## Build Order

### MacBook phase — complete
- [x] Set up private GitHub repo for `second-brain`
- [x] Get daily briefing running reliably
- [x] Add cron job logging
- [x] Iterate daily briefing instructions to v2.1
- [x] Build weekly summary instructions (v1.4)
- [x] Map intelligence layers in `projects/intelligence-layers.md`
- [x] Set up Obsidian Git plugin for auto-sync

### Mac Mini — complete
- [x] Set up Mac Mini
- [x] Move daily cron job to Mac Mini
- [x] Set up weekly summary cron job (Saturdays 7am)

### Next
- [ ] Build `instructions/monthly-summary.md`
- [ ] Set up NanoClaw (see `nanoclaw-setup.md`)
- [ ] Connect Telegram
- [x] Decide sync source of truth — Obsidian Sync for device sync, GitHub for version history/backup (2026-03-18)
- [ ] Decide sectors for Layer 4

---

## Notes

- **Nested session fix:** Cron commands prepend `unset CLAUDECODE &&` to prevent nested session errors. Prompts also include "Execute immediately — no plan approval needed" to override the global plan-first instruction.
- **2026-03-08:** Audited system-overview.md against other project docs. Fixed Key Files paths to reflect `projects/second-brain/` move, added mac-mini-setup.md to Key Files table. Updated intelligence-layers.md weekly summary status from "not yet running" to "Running". Added permissions audit step to `~/.claude/CLAUDE.md` end-of-session checklist.
- **2026-03-16:** Auth cleanup — removed ANTHROPIC_API_KEY and GITHUB_TOKEN (classic) from ~/.zshrc. Claude Code now uses OAuth (claude.ai subscription). GitHub CLI uses macOS keyring. NanoClaw containers use OAuth token + fine-grained PAT from .env (gitignored). Classic GitHub token revoked. No API keys in plain text shell configs.

## Open Questions

- ~~**iCloud vs GitHub as source of truth**~~ — Resolved 2026-03-18: replaced iCloud with Obsidian Sync ($4/month) for device sync. Git/GitHub handles version history and backup. Vault moved to `~/second-brain/` on all machines.
- **Mac Mini CLAUDE.md audit** — Mac Mini CLAUDE.md is essentially empty. Needs end-of-session instructions and any other global instructions mirrored from MacBook. Part of a broader CLAUDE.md audit.
- Which NanoClaw version / config to start with?
- Telegram bot setup — personal bot or shared?
- ~~How to handle API key management on Mac Mini (Keychain vs env file)?~~ Resolved: OAuth for Claude Code, .env (gitignored) for NanoClaw container secrets, macOS keyring for GitHub CLI.

---

## The North Star

Wake up every morning to a briefing on your phone. Watch trends emerge over weeks. See product ideas surface automatically. Build the most promising ones with your intelligence system feeding directly into your development workflow. All running securely, all under your control, all getting smarter over time.
