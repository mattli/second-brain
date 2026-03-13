---
title: Intelligence Layers
status: living
created: 2026-02-27
updated: 2026-03-13 (rev 11)
---

# Intelligence Layers

A map of the planned intelligence layers for the second-brain system — from daily signal to product opportunity.

---

### Layer 1: Daily Briefing ✅
- **Prompt:** `projects/intelligence/instructions/daily-briefing.md`
- **Schedule:** 7am weekdays
- **Goal:** Stay current on AI and tech news daily
- **Status:** Running, v2.3 — migrated from cron to NanoClaw scheduled task, web fetch capability added to briefing container

### Layer 2: Weekly Summary ✅
- **Prompt:** `projects/intelligence/instructions/weekly-summary.md`
- **Schedule:** 7am Sunday
- **Goal:** Synthesize the week's briefings into patterns and signals
- **Status:** Running, v1.4 — cron job on Mac Mini, Sundays 7am, not yet migrated to NanoClaw
- **Sections:** Week in Review, Signal vs Noise, Emerging Patterns, Money & Power, Builder Pulse, One Big Question, Strategic Signals
- **Note:** Product Observations removed from weekly layer — product synthesis handled by monthly summary instead. Strategic Signals uses 5 weekday briefings as source; VC thesis search is a 7-day lookback.

### Layer 3: Monthly Summary ✅
- **Prompt:** `projects/intelligence/instructions/monthly-summary.md`
- **Schedule:** 7am 1st of month (cron job on Mac Mini)
- **Goal:** Synthesize weekly summaries, sector intelligence, and VC signals into longer-term trends and product observations — this layer serves the function previously planned for a separate Trend Reports layer
- **Status:** Built and running, v1.0 — tested against W09 and W10, writes product observations back to `projects/product/product-vision.md`

### Layer 4: NanoClaw ✅
- **What:** Agent framework running the intelligence system
- **Status:** Running on Mac Mini — Docker containers, vault mounted at `projects/intelligence/`
- **Telegram:** Connected via @matts_second_brain_bot
- **Currently running:** Daily briefing (Layer 1)
- **Migration pending:** Weekly summary (Layer 2), monthly summary (Layer 3)