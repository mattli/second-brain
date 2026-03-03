---
title: Intelligence Layers
status: living
created: 2026-02-27
updated: 2026-03-02 (rev 9)
---

# Intelligence Layers

A map of the planned intelligence layers for the second-brain system — from daily signal to product opportunity.

---

### Layer 1: Daily Briefing ✅
- **Prompt:** `instructions/daily-briefing.md`
- **Schedule:** 7am weekdays
- **Goal:** Stay current on AI and tech news daily
- **Status:** Running, v2.1
- **Cron fix (2026-03-02):** Added `unset CLAUDECODE &&` to cron command to prevent nested session error when running while a Claude Code session is open.

### Layer 2: Weekly Summary ✅
- **Prompt:** `instructions/weekly-summary.md`
- **Schedule:** 8am Sunday
- **Goal:** Synthesize the week's briefings into patterns and signals
- **Status:** Prompt built, v1.4 — not yet running
- **Sections:** Week in Review, Signal vs Noise, Emerging Patterns, Money & Power, Builder Pulse, One Big Question, Strategic Signals
- **Note:** Product Observations removed from weekly layer — product synthesis handled by monthly summary instead. Strategic Signals uses 5 weekday briefings as source; VC thesis search is a 7-day lookback.
- **Open:** Sunday cron job not yet set up.

### Layer 3: Monthly Summary ⬜
- **Prompt:** `instructions/monthly-summary.md` (to build)
- **Schedule:** 8am 1st of month
- **Goal:** Synthesize weekly summaries, sector intelligence, and VC signals into longer-term trends and product observations — this layer serves the function previously planned for a separate Trend Reports layer
- **Status:** Not started

### Layer 4: Sector Intelligence ⬜
- **Prompt:** `instructions/sector-[name].md` (to build per sector)
- **Schedule:** Weekly, rotating by sector — one sector per week, cycling through all sectors so each is covered once per month
- **Sectors:** TBD — candidates include EdTech, climate, wellness, civic tech
- **Goal:** Deep intelligence on specific sectors to combine with AI trends
- **Status:** Not started — sectors not yet decided
