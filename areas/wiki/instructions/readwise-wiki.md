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
created_at: YYYY-MM-DD
last_updated: YYYY-MM-DD
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

**Frontmatter rules — strict.** The only allowed keys are `created_at` (set once, never changed) and `last_updated` (today, on every edit). Do **not** invent additional keys — no `sources:`, no `sources_updated:`, no `tags:`, no `title:`. The `## Sources` section in the body is the sole record of contributing documents. Each frontmatter key must appear exactly once; YAML rejects duplicates and the Cold Mountain build will fail on parse.

### Citations

Every page ends with a `## Sources` section listing every Readwise doc that has contributed to it, formatted as `- [Title](source_url) — one-line note on what it added`. Use the document's original `source_url` from Readwise metadata, **not** the Readwise reader URL. If `source_url` is missing (manual notes, pasted text, some PDFs), use plain-text title with no link. The per-doc worker appends to this section on every run, deduping by URL.

Inline citations are reserved for three narrow cases:

1. **Direct quotes** — anything in quotation marks pulled from a source.
2. **Specific statistics or numbers** — concrete figures a reader might want to verify.
3. **Contested or surprising claims** — assertions a skeptical reader would push back on.

Inline format: `[[source]](source_url)` immediately after the cited sentence. Everything else (synthesis, definitions, connective prose, common knowledge) stays uncited — the `## Sources` section covers attribution. Do **not** add inline citations for general framing or restatements; the wiki should read as distilled understanding, not an annotated bibliography.

### Linking

- Use `[[wiki-link]]` syntax for internal links between wiki pages.
- Always update `last_updated:` in frontmatter when editing a page.
- Cross-link aggressively: when a new page or section relates to existing content, link both directions.

### Cohesion bias

**Extend before creating.** When in doubt, add to an existing page rather than spinning up a new one. The wiki gets less useful as it fragments. The list-maker enforces this at intake; the wrap-up enforces it again at the cluster level.

### Folder structure

The wiki is organized into broad-topic folders under `resources/wiki/`. Check `resources/wiki/index.md` for the current layout. New folders are allowed when nothing fits — use short kebab-case names — but don't over-fragment.

### Holding files

- `resources/wiki/unorganized.md` — Tier C/D items the list-maker couldn't place. Wrap-up sweeps this for clusters of 3+ and promotes them.
- `resources/wiki/long-form/QUEUE.md` — long-form sources awaiting on-demand synthesis (see `long-form-synthesis.md`).
- `resources/wiki/WORKER_ERRORS.md` — per-doc worker failures, summarized and archived weekly by wrap-up.

### Path mapping

Inside the container the `readwise-wiki` group has three relevant mounts:

- `/workspace/extra/wiki/` → these instruction files (e.g. `instructions/list-maker.md`).
- `/workspace/extra/resources/wiki/` → the wiki content itself (pages, index.md, unorganized.md, etc.).
- `/workspace/extra/vault/` → the full second-brain vault (used for `git add` / `git commit` / `git push`).

All page paths in the per-stage instructions (`resources/wiki/index.md`, `resources/wiki/unorganized.md`, etc.) are written assuming `cd /workspace/extra/vault` as the working directory before reading/writing.
