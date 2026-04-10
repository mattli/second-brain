# Readwise Wiki

Compiled knowledge base from Readwise saves, following Andrej Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into persistent, interlinked topic pages.

## Purpose

Agent-navigable reference layer. The wiki means agents don't have to re-derive knowledge from raw sources every time — they read the compiled pages instead. Pages are about topics (not individual articles) and grow over time as new sources are added.

## Use Case

Matt saves articles, tweets, GitHub repos, and other content to Readwise — often without reading them in full. The wiki acts as his reading staff, consuming what he can't and surfacing what matters. The filter for what gets saved is genuine curiosity from trusted sources, not comprehensiveness. The wiki optimizes for breadth across multiple domains (AI, startups, product management, competitive landscape) with enough depth to be useful when agents reference it.

## How It's Maintained

A NanoClaw scheduled task runs at 3am Monday and Thursday. It fetches Readwise saves since the last successful run, updates existing pages or creates new ones, maintains the index, and lints for orphans and stale content. Each page has `created_at` and `last_updated` frontmatter. Runs on Opus with a 90-minute timeout.

Pages are organized into category folders: `concepts/`, `tools/`, `models-safety/`, `landscape/`, `people/`. New pages go in the matching folder; if nothing fits, they stay at the wiki root. Documents that don't match any topic page land on `unorganized.md` as a holding pattern until a cluster warrants promotion to its own page.

## How It Fits

The intelligence system has two modes: briefings (dated logs — daily, weekly, monthly) and the wiki (persistent compiled knowledge). Briefings answer "what happened this week." The wiki answers "what do I know about this topic."

## Deferred Items

- [ ] Rename "(prior session)" attribution to "(existing context)" or similar — confusing wording, not a bug
- [ ] Per-document time tracking in manifest (wall-clock duration per Tier B document, total per Tier A batch)
- [ ] Manual Tier C synthesis for specific long PDFs if needed (one-off Claude Code sessions, not the scheduled compiler)
- [x] `unorganized.md` holding page for Tier C/D documents with no matching topic page (2026-04-09, v2.2)
- [x] Cadence-decoupled fetch window — reads previous manifest timestamp instead of hardcoded "7 days" (2026-04-09, v2.2)

## Reference

- **Index:** [`INDEX.md`](INDEX.md)
- **Compiler instructions:** [`../instructions/readwise-wiki.md`](../instructions/readwise-wiki.md)
- **Parent project:** [`../README.md`](../README.md)
