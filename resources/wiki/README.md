# Readwise Wiki

Compiled knowledge base from Readwise saves, following Andrej Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into persistent, interlinked topic pages.

## Purpose

Agent-navigable reference layer. The wiki means agents don't have to re-derive knowledge from raw sources every time — they read the compiled pages instead. Pages are about topics (not individual articles) and grow over time as new sources are added.

## Use Case

Matt saves articles, tweets, GitHub repos, and other content to Readwise — often without reading them in full. The wiki acts as his reading staff, consuming what he can't and surfacing what matters. The filter for what gets saved is genuine curiosity from trusted sources, not comprehensiveness. The wiki optimizes for breadth across multiple domains (AI, startups, product management, competitive landscape) with enough depth to be useful when agents reference it.

## How It's Maintained

As of 2026-04-27, the wiki is built by a **three-stage per-doc pipeline** instead of a single weekly compiler. Old design kept dying mid-stream on Anthropic edge 502s during long sessions; short-lived stages eliminate that failure mode. Full plan: [`../../areas/wiki/2026-04-27-per-doc-pipeline-plan.md`](../../areas/wiki/2026-04-27-per-doc-pipeline-plan.md).

1. **Daily list-maker** (1am every night). Reads INDEX.md and recently-touched pages, fetches new Readwise saves since `LIST_MAKER_LOG.md`'s last `run_start`, and decides per-item: create, update, skip, or hold in `unorganized.md`. Dispatches per-doc workers — never synthesizes content itself. Runs on Opus, ~1–2 min.

2. **Per-doc workers** (dispatched on demand by the list-maker, run sequentially). Each worker handles exactly one Readwise document — fetches it, writes/updates one wiki page, commits and pushes. Has veto power over the dispatch hint if the rationale doesn't hold up against the content. ~2–3 min per worker on Opus.

3. **Weekly wrap-up** (Sunday 11pm). Dedup, cohesion linking, INDEX.md refresh, `long-form/QUEUE.md` regen, `unorganized.md` cluster-promotion sweep (3+ items on a topic → promote to existing or new page), worker error summary, and writes `LAST_RUN_MANIFEST.md`.

4. **Monthly structure review** (1st of each month at 3am). Evaluates folder organization and INDEX.md alignment, writes a scannability-focused proposal to `FOLDER_REVIEW.md`. Never auto-applies.

5. **On-demand long-form synthesis** (user-triggered via main Telegram group). Synthesizes individual Readwise PDFs between 50K and 200K words into dedicated pages in `long-form/`, with bidirectional links into relevant topic pages.

## Organization

Pages are organized into category folders: `concepts/`, `tools/`, `models-safety/`, `landscape/`, `people/`, `writing/`. New pages go in the matching folder; if nothing fits, they stay at the wiki root or go to `unorganized.md` as a holding pattern. Long-form synthesis pages live in their own `long-form/` folder (one page per source, not per topic).

The monthly structure review surfaces candidates for merging, splitting, or renaming folders when scannability degrades.

## How It Fits

The intelligence system has two modes: briefings (dated logs — daily, weekly, monthly) and the wiki (persistent compiled knowledge). Briefings answer "what happened this week." The wiki answers "what do I know about this topic."

## Deferred Items

- [ ] Rename "(prior session)" attribution to "(existing context)" or similar — confusing wording, not a bug
- [ ] Per-document time tracking in manifest (wall-clock duration per worker)
- [ ] Per-task model overrides — currently model is set per-group, so list-maker (cheap, bookkeeping) and per-doc workers (synthesis, judgment-heavy) both share Opus. If weekly Opus budget gets tight, demote list-maker + wrap-up's bookkeeping phases to Sonnet.
- [ ] Resolve open questions from the per-doc plan: list-maker context budget, dedup safety threshold, worker veto rate tracking, "this week" definition for wrap-up
- [x] Three-stage per-doc pipeline replacing the monolithic weekly compiler (2026-04-27) — plan at [`../../areas/wiki/2026-04-27-per-doc-pipeline-plan.md`](../../areas/wiki/2026-04-27-per-doc-pipeline-plan.md)
- [x] `unorganized.md` cluster-promotion sweep in weekly wrap-up (2026-04-27)
- [x] Long-form synthesis for PDFs 50K–200K words (2026-04-17) — instructions at `../../areas/wiki/instructions/long-form-synthesis.md`
- [x] Monthly folder/structure review (2026-04-17) — instructions at `../../areas/wiki/instructions/folder-review.md`
- [x] `unorganized.md` holding page for Tier C/D documents with no matching topic page (2026-04-09, v2.2)
- [x] Cadence-decoupled fetch window — reads previous manifest timestamp instead of hardcoded "7 days" (2026-04-09, v2.2)

## Reference

- **Index:** [`INDEX.md`](INDEX.md)
- **Pipeline pointer + shared conventions:** [`../../areas/wiki/instructions/readwise-wiki.md`](../../areas/wiki/instructions/readwise-wiki.md)
- **Stage 1 (list-maker):** [`../../areas/wiki/instructions/list-maker.md`](../../areas/wiki/instructions/list-maker.md)
- **Stage 2 (per-doc worker):** [`../../areas/wiki/instructions/per-doc-worker.md`](../../areas/wiki/instructions/per-doc-worker.md)
- **Stage 3 (weekly wrap-up):** [`../../areas/wiki/instructions/weekly-wrap-up.md`](../../areas/wiki/instructions/weekly-wrap-up.md)
- **Long-form synthesis:** [`../../areas/wiki/instructions/long-form-synthesis.md`](../../areas/wiki/instructions/long-form-synthesis.md)
- **Folder review:** [`../../areas/wiki/instructions/folder-review.md`](../../areas/wiki/instructions/folder-review.md)
- **Parent project:** [`../../areas/wiki/README.md`](../../areas/wiki/README.md)
