# Readwise Wiki

Compiled knowledge base from Readwise saves, following Andrej Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into persistent, interlinked topic pages.

## Purpose

Agent-navigable reference layer. The wiki means agents don't have to re-derive knowledge from raw sources every time — they read the compiled pages instead. Pages are about topics (not individual articles) and grow over time as new sources are added.

## Use Case

Matt saves articles, tweets, GitHub repos, and other content to Readwise — often without reading them in full. The wiki acts as his reading staff, consuming what he can't and surfacing what matters. The filter for what gets saved is genuine curiosity from trusted sources, not comprehensiveness. The wiki optimizes for breadth across multiple domains (AI, startups, product management, competitive landscape) with enough depth to be useful when agents reference it.

## How It's Maintained

Three NanoClaw processes keep the wiki current:

1. **Weekly compiler** (Mon & Thu at 3am). Fetches Readwise saves since the last run, updates existing pages or creates new ones, maintains the index, lints for orphans and stale content, and regenerates `long-form/QUEUE.md`. Each page has `created_at` and `last_updated` frontmatter. Runs on Opus with a 90-minute timeout.

2. **Monthly structure review** (1st of each month at 3am). Evaluates folder organization and INDEX.md alignment, writes a scannability-focused proposal to `FOLDER_REVIEW.md`. Never auto-applies — apply happens in a user-driven Claude Code session.

3. **On-demand long-form synthesis** (user-triggered via main Telegram group). Synthesizes individual Readwise PDFs between 50K and 200K words into dedicated pages in `long-form/`, with bidirectional links into relevant topic pages.

The compiler also processes entries from `raw/research-log.md` — an append-only log written by Wiki Tutor during conversations. Research log entries are processed first (Phase 0), before Readwise content, as Tier A-equivalent items. Processed entries are archived to `raw/_archive/`.

## Organization

Pages are organized into category folders: `concepts/`, `tools/`, `models-safety/`, `landscape/`, `people/`, `writing/`. New pages go in the matching folder; if nothing fits, they stay at the wiki root or go to `unorganized.md` as a holding pattern. Long-form synthesis pages live in their own `long-form/` folder (one page per source, not per topic).

The monthly structure review surfaces candidates for merging, splitting, or renaming folders when scannability degrades.

## How It Fits

The intelligence system has two modes: briefings (dated logs — daily, weekly, monthly) and the wiki (persistent compiled knowledge). Briefings answer "what happened this week." The wiki answers "what do I know about this topic."

## Deferred Items

- [ ] Rename "(prior session)" attribution to "(existing context)" or similar — confusing wording, not a bug
- [ ] Per-document time tracking in manifest (wall-clock duration per Tier B document, total per Tier A batch)
- [x] Long-form synthesis for PDFs 50K–200K words (2026-04-17) — instructions at `../../areas/wiki/instructions/long-form-synthesis.md`
- [x] Monthly folder/structure review (2026-04-17) — instructions at `../../areas/wiki/instructions/folder-review.md`
- [x] `unorganized.md` holding page for Tier C/D documents with no matching topic page (2026-04-09, v2.2)
- [x] Cadence-decoupled fetch window — reads previous manifest timestamp instead of hardcoded "7 days" (2026-04-09, v2.2)

## Reference

- **Index:** [`INDEX.md`](INDEX.md)
- **Weekly compiler instructions:** [`../../areas/wiki/instructions/readwise-wiki.md`](../../areas/wiki/instructions/readwise-wiki.md)
- **Long-form synthesis:** [`../../areas/wiki/instructions/long-form-synthesis.md`](../../areas/wiki/instructions/long-form-synthesis.md)
- **Folder review:** [`../../areas/wiki/instructions/folder-review.md`](../../areas/wiki/instructions/folder-review.md)
- **Parent project:** [`../../areas/wiki/README.md`](../../areas/wiki/README.md)
