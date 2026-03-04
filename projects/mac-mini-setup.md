---
title: Mac Mini + NanoClaw Intelligence System
status: in-progress
created: 2026-02-26
updated: 2026-03-03 (rev 4)
---

# Mac Mini + NanoClaw Intelligence System

## The Vision

An always-on personal intelligence system that keeps you informed, surfaces product opportunities, and feeds directly into whatever you build — running automatically with your data under your control.

---

## Current Status

| Component | Status |
|---|---|
| Daily briefing | ✅ Running (Mac Mini, v2.1) |
| Weekly summary | ✅ Running (Mac Mini, v1.4, Sundays 8am) |
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
Obsidian Vault (iCloud)
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
│   ├── weekly-summary.md      ✅ v1.4 (running on Mac Mini, Sundays)
│   ├── monthly-summary.md     ⬜ to build
│   └── sector-[name].md       ⬜ to build per sector
├── briefings/                 ← daily automated briefings ✅ running
├── weekly-summaries/          ← weekly synthesis ✅ running
├── monthly-summaries/         ← monthly synthesis ⬜ to build
└── _archive/                  ← archived files

projects/
├── mac-mini-setup.md          ✅ this file
├── intelligence-layers.md     ✅ layer map
├── nanoclaw-setup.md          ✅ NanoClaw vision and setup plan
├── product-vision.md          ✅ north star + active ideas
└── ideas/                     ← individual idea files (empty)
```

---

## Automation

See [[intelligence-layers]] for full layer details.

Cron schedule (running on Mac Mini):

```
7am weekdays  → daily briefing
8am Sunday    → weekly summary
8am 1st of month → monthly summary (to build)
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
Most private    Personal notes → iCloud only
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
- [x] Set up weekly summary cron job (Sundays 8am)

### Next
- [ ] Build `instructions/monthly-summary.md`
- [ ] Set up NanoClaw (see `nanoclaw-setup.md`)
- [ ] Connect Telegram
- [ ] Decide iCloud vs GitHub as sync source of truth (before NanoClaw setup)
- [ ] Decide sectors for Layer 4

---

## Notes

- **Nested session fix:** Cron commands prepend `unset CLAUDECODE &&` to prevent nested session errors. Prompts also include "Execute immediately — no plan approval needed" to override the global plan-first instruction.

## Open Questions

- **iCloud vs GitHub as source of truth** — Consider replacing iCloud sync with GitHub as the primary sync mechanism. Add a `git pull` step to cron jobs before each run. Benefits: explicit versioning, conflict detection, works without iCloud dependency. Decide before setting up NanoClaw.
- Which NanoClaw version / config to start with?
- Telegram bot setup — personal bot or shared?
- How to handle API key management on Mac Mini (Keychain vs env file)?

---

## The North Star

Wake up every morning to a briefing on your phone. Watch trends emerge over weeks. See product ideas surface automatically. Build the most promising ones with your intelligence system feeding directly into your development workflow. All running securely, all under your control, all getting smarter over time.
