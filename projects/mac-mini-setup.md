---
title: Mac Mini + OpenClaw Intelligence System
status: in-progress
created: 2026-02-26
updated: 2026-02-27 (rev 2)
---

# Mac Mini + OpenClaw Intelligence System

## The Vision

An always-on personal intelligence system that keeps you informed, surfaces product opportunities, and feeds directly into whatever you build — running automatically with your data under your control.

---

## Current Status

| Component | Status |
|---|---|
| Daily briefing | ✅ Running (MacBook, v1.9) |
| GitHub private repo (`second-brain`) | ✅ Set up |
| Obsidian vault structure | ✅ Set up 2026-02-26 |
| Obsidian Git plugin | ✅ Set up |
| Mac Mini | ⬜ Not yet arrived |
| OpenClaw | ⬜ Not yet set up |
| Telegram integration | ⬜ Not yet set up |
| Cron jobs | ✅ Running (7am weekdays) |
| Cron job logging | ✅ Logging to `~/logs/briefing.log` |
| Weekly/monthly summaries | ⬜ Not yet built |

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
│   ├── daily-briefing.md      ✅ v1.9 (running since 2026-02-24)
│   ├── weekly-summary.md      ⬜ to build
│   ├── monthly-summary.md     ⬜ to build
│   └── sector-[name].md       ⬜ to build per sector (schedule: weekly rotating)
├── briefings/                 ← daily automated briefings ✅ 4 generated
├── weekly-summaries/          ← weekly synthesis ⬜ to build
├── monthly-summaries/         ← monthly synthesis ⬜ to build
└── trend-reports/             ← trends and product ideas ⬜ to build

projects/
├── mac-mini-setup.md          ✅ this file
└── intelligence-layers.md     ✅ layer map
```

---

## Automation

See [[intelligence-layers]] for full layer details.

Cron schedule:

```
7am weekdays
8am Sunday
8am 1st of month
9am 1st of month
```

Each run:
1. Generates markdown → saved to Obsidian vault
2. Commits to GitHub → version history + backup

---

## Interface

**Phase 1 — Now:** Claude Code on MacBook for interactive sessions

**Phase 2 — Mac Mini arrives:** OpenClaw on Mac Mini + Telegram
- Morning briefing pushed to your phone
- Message your agent from anywhere
- Proactive alerts for things you're monitoring

---

## Product Pipeline

```
Daily briefings
      ↓
Weekly summaries
      ↓
Monthly trend reports
      ↓
Product ideas (auto-surfaced)
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
| OpenClaw | Free (open source) |
| **Ongoing** | **~$21–202/month** |

---

## Build Order

### This Week (MacBook) — mostly complete
- [x] Set up private GitHub repo for `ai-intelligence`
- [x] Get daily briefing running reliably (4 briefings generated, Feb 24–27)
- [x] Add cron job logging (`~/logs/briefing.log`)
- [x] Iterate daily briefing instructions to v1.9 (added sources, Final Check step, path fixes)
- [x] Map intelligence layers in `projects/intelligence-layers.md`
- [x] Set up Obsidian Git plugin for auto-sync

### When Mac Mini Arrives
- [ ] Fresh macOS install
- [ ] Move cron jobs from MacBook to Mac Mini
- [ ] Set up Claude Code and OpenClaw
- [ ] Connect Telegram
- [ ] Test full automated pipeline

### Phase 2 (as use cases emerge)
- [ ] Build weekly summary automation
- [ ] Build monthly summary + trend report automation
- [ ] Expand OpenClaw capabilities deliberately
- [ ] Add Google Workspace integration

### Phase 3 (when ready)
- [ ] Full product validation pipeline
- [ ] Browser automation for research
- [ ] Landing page generation
- [ ] Whatever use cases have emerged

---

## Notes

- **Nested session limitation:** The daily briefing cron job cannot be triggered from within a Claude Code session — it must be run from a standalone terminal or via cron. This is a Claude Code restriction, not a bug.

## Open Questions

- What's the expected delivery date for the Mac Mini?
- Which OpenClaw version / config to start with?
- Telegram bot setup — personal bot or shared?
- How to handle API key management on Mac Mini (Keychain vs env file)?
- Weekly summary format — same structure as daily briefing, or different?

---

## Next Steps

1. Draft `instructions/weekly-summary.md` prompt file
2. Decide on sectors for Layer 4 and build `instructions/sector-[name].md`
3. Await Mac Mini delivery

---

## The North Star

Wake up every morning to a briefing on your phone. Watch trends emerge over weeks. See product ideas surface automatically. Build the most promising ones with your intelligence system feeding directly into your development workflow. All running securely, all under your control, all getting smarter over time.
