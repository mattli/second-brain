# Readwise Wiki — Pipeline Pointer

> Version: 3.0 | Last updated: 2026-04-27
> Supersedes the monolithic weekly compiler (archived at `_archive/readwise-wiki-monolithic-2026-04-27.md`).

The wiki is now built by a three-stage pipeline. Each stage has its own instructions file. Read the one that matches the task you were dispatched for — do not run all three.

| Stage | When | Instructions |
|-------|------|--------------|
| 1. List-maker | Daily @ 1am | `list-maker.md` |
| 2. Per-doc worker | Dispatched ad-hoc by list-maker | `per-doc-worker.md` |
| 3. Weekly wrap-up | Sunday @ 11pm | `weekly-wrap-up.md` |
| Folder review | Monthly | `folder-review.md` |
| Long-form synthesis | On-demand | `long-form-synthesis.md` |

## Why split

The old single-session compiler streamed for 30–60 min per run and kept dying mid-flight on Anthropic edge 502s. Splitting into short-lived stages (list-maker is bookkeeping-only; each per-doc worker handles exactly one document; wrap-up is read-mostly) keeps every session well under the failure threshold and makes restarts cheap.

## Shared conventions

All stages share these conventions — read them once, then go to your stage file.

### Wiki page format

Every wiki page has frontmatter and a standard structure:

```
---
title: <Page Title>
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
---

# Page Title

## TLDR
One-paragraph summary.

## Overview
Longer prose synthesis.

## Key Concepts
- Bullet list of core ideas.

## Sources
- [Source title](URL) — one-line note on what it added
```

Sections beyond these are fine when the topic warrants — keep them descriptive (`## Tools`, `## Pitfalls`, `## Further Reading`).

### Linking

- Use `[[wiki-link]]` syntax for internal links between wiki pages.
- Always update `updated:` in frontmatter when editing a page.
- Cross-link aggressively: when a new page or section relates to existing content, link both directions.

### Cohesion bias

**Extend before creating.** When in doubt, add to an existing page rather than spinning up a new one. The wiki gets less useful as it fragments. The list-maker enforces this at intake; the wrap-up enforces it again at the cluster level.

### Folder structure

The wiki is organized into broad-topic folders under `wiki/`. Check `wiki/INDEX.md` for the current layout. New folders are allowed when nothing fits — use short kebab-case names — but don't over-fragment.

### Holding files

- `wiki/unorganized.md` — Tier C/D items the list-maker couldn't place. Wrap-up sweeps this for clusters of 3+ and promotes them.
- `wiki/long-form/QUEUE.md` — long-form sources awaiting on-demand synthesis (see `long-form-synthesis.md`).
- `wiki/raw/research-log.md` — pre-summarized entries logged from chat. Treated as Tier A by the list-maker.
- `wiki/WORKER_ERRORS.md` — per-doc worker failures, summarized and archived weekly by wrap-up.

### Path mapping

The wiki lives at `/workspace/extra/wiki/` inside the container (the `extra` mount maps the vault's `resources/wiki/` directory). The container's working directory is `/workspace`. Always commit changes from `/workspace/extra` at the end of a run.
