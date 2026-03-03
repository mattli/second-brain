---
title: Intelligence Layers
status: living
created: 2026-02-27
updated: 2026-03-02 (rev 7)
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
- **Status:** Prompt built, v1.3 — not yet running
- **Sections:** Week in Review, Signal vs Noise, Emerging Patterns, Money & Power, Builder Pulse, One Big Question, Product Observations, Strategic Signals
- **Note:** Product Observations section prompts carry-through to `projects/product-vision.md` if observation is strong. Strategic Signals uses 5 weekday briefings as source (not 7 days), but VC thesis search is a 7-day lookback.

### Layer 3: Monthly Summary ⬜
- **Prompt:** `instructions/monthly-summary.md` (to build)
- **Schedule:** 8am 1st of month
- **Goal:** Synthesize weekly summaries into longer-term trends
- **Status:** Not started

### Layer 4: Sector Intelligence ⬜
- **Prompt:** `instructions/sector-[name].md` (to build per sector)
- **Schedule:** Weekly, rotating by sector — one sector per week, cycling through all sectors so each is covered once per month
- **Sectors:** TBD — candidates include EdTech, climate, wellness, civic tech
- **Goal:** Deep intelligence on specific sectors to combine with AI trends
- **Status:** Not started — sectors not yet decided

### Layer 5: Trend Report & Product Ideas ⬜
- **Prompt:** `instructions/trend-report.md` (to build)
- **Schedule:** 9am 1st of month
- **Goal:** Synthesize monthly summaries and sector intelligence to surface product opportunities at the intersection of AI trends and personal interest areas
- **Status:** Not started
