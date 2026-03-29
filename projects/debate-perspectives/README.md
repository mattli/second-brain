# Debate Perspectives

Static website publishing AI-assisted debates on controversial topics. Two opposing voices argue back and forth, each engaging with the other side's moral framework. The goal is understanding, not entertainment.

## Status

Planning complete. Not yet started.

## Key Docs

- [requirements.md](requirements.md) — Brainstorm output: problem frame, requirements, scope boundaries
- [plan.md](plan.md) — Implementation plan: Astro + daisyUI + Cloudflare Pages, content pipeline using last30days + NewsAPI + Claude synthesis

## Stack

- **Site:** Astro + Tailwind + daisyUI chat bubbles, hosted on Cloudflare Pages
- **Content pipeline:** Local scripts — discover arguments (last30days for Reddit/X, NewsAPI for op-eds), synthesize with Claude, human editorial review
- **Cost:** Under $20 for dozens of debates

## Core Idea

Retrieve real arguments people have actually made, then use Claude to structure them into a dialogue where each side speaks the other's moral language. Not AI-generated opinions — AI-curated and structured real discourse.
