# Readwise Wiki

Compiled knowledge base from Readwise saves, following Andrej Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into persistent, interlinked topic pages.

## Purpose

Agent-navigable reference layer. The wiki means agents don't have to re-derive knowledge from raw sources every time — they read the compiled pages instead. Pages are about topics (not individual articles) and grow over time as new sources are added.

## Use Case

Matt saves articles, tweets, GitHub repos, and other content to Readwise — often without reading them in full. The wiki acts as his reading staff, consuming what he can't and surfacing what matters. The filter for what gets saved is genuine curiosity from trusted sources, not comprehensiveness. The wiki optimizes for breadth across multiple domains (AI, startups, product management, competitive landscape) with enough depth to be useful when agents reference it.

## How It's Maintained

As of 2026-06-22, the wiki is built by a **two-stage pipeline**. Earlier iterations had a weekly wrap-up, monthly folder review, and on-demand long-form synthesis; those stages produced signal that wasn't being consumed and have been collapsed out. Structural changes (page splits, folder reorgs, dedup) now happen ad-hoc in Claude Code sessions when wanted, not on a schedule.

1. **Daily list-maker** (1am every night). Reads `index.md` and recently-touched pages, fetches new Readwise saves since `list-maker-log.md`'s `run_end`, and decides per-item: drop (deterministic pre-filter), update an existing page, or create a new one. Dispatches per-doc workers for every update/create. Never synthesizes content itself. Runs on Opus, ~1–2 min.

2. **Per-doc workers** (dispatched on demand by the list-maker, run sequentially). Each worker handles exactly one Readwise document — fetches it, writes/updates one wiki page, updates `index.md` if creating, adds cross-links, commits and pushes. Has veto power over the dispatch hint. ~2–3 min per worker on Opus.

There is no holding bin. Every save that passes the pre-filter lands in a real wiki page. Personal-interest items (recipes, hobby bookmarks) route to `personal/`.

## Organization

Pages are organized into category folders: `concepts/`, `tools/`, `models-safety/`, `landscape/`, `people/`, `science/`, `writing/`, `music/`, `culture/`, `personal/`. New pages go in the matching folder; if nothing fits, the worker creates a folder or proposes one.

## How It Fits

The intelligence system has two modes: briefings (dated logs — daily, weekly, monthly) and the wiki (persistent compiled knowledge). Briefings answer "what happened this week." The wiki answers "what do I know about this topic."

## Reference

- **Index:** [`index.md`](index.md)
- **Pipeline pointer + shared conventions:** [`../../areas/wiki/instructions/readwise-wiki.md`](../../areas/wiki/instructions/readwise-wiki.md)
- **Stage 1 (list-maker):** [`../../areas/wiki/instructions/list-maker.md`](../../areas/wiki/instructions/list-maker.md)
- **Stage 2 (per-doc worker):** [`../../areas/wiki/instructions/per-doc-worker.md`](../../areas/wiki/instructions/per-doc-worker.md)
- **Parent project:** [`../../areas/wiki/README.md`](../../areas/wiki/README.md)
