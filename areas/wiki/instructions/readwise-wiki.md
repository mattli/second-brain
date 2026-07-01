# Readwise Wiki — Pipeline Pointer

> Version: 4.0 | Last updated: 2026-06-22
> Supersedes the three-stage pipeline (wrap-up, folder-review, and long-form-synthesis archived).

The wiki is built by a two-stage pipeline. Each stage has its own instructions file.

| Stage | When | Instructions |
|-------|------|--------------|
| 1. List-maker | Daily @ 1am | `list-maker.md` |
| 2. Per-doc worker | Dispatched ad-hoc by list-maker | `per-doc-worker.md` |

Structural changes (page splits, folder reorgs, dedup, cohesion audits) happen ad-hoc in Claude Code sessions when the user wants them — not on a schedule. There is no weekly wrap-up, no monthly folder review, no holding bin.

## Why two stages

Splitting into short-lived sessions (list-maker is bookkeeping-only; each per-doc worker handles exactly one document) keeps every session well under Anthropic edge-502 failure thresholds and makes restarts cheap. The list-maker dispatches all routing; the worker is responsible for everything that touches a wiki page (synthesis, INDEX update, cross-linking).

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

> TLDR: Two to four sentences on a single line. What the topic is and the key insight. Reader should be able to decide from this alone whether the rest of the page is worth their time. Must be a `> TLDR:` blockquote (not an `## TLDR` heading) — Cold Mountain's renderer lifts this line into the page subtitle and the index description, and the build fails if it's missing.

## Recent Updates
(Maintained by per-doc workers. Only present once a worker has touched the page post-2026-06-22.)

## Body sections
Use `## Section Name` and `### Subsection` for navigability — Obsidian's outline panel and Cold Mountain's renderer both consume these. Avoid `**Bold paragraph headings.**` as section dividers; they don't show up in outlines.

## Sources
- [Source title](URL) — one-line note on what it added
```

Body section names should be descriptive and topic-specific (`## Open vs. Closed Loops`, `## Pitfalls`, `## Further Reading`). The page should NOT have an `## Overview` section — that convention was retired 2026-06-22 because Overview sections consistently restated TLDR and became filler. Framing lives in TLDR; everything else lives in the body sections.

**Frontmatter rules — strict.** The only allowed keys are `created_at` (set once, never changed) and `last_updated` (today, on every edit). Do **not** invent additional keys — no `sources:`, no `sources_updated:`, no `tags:`, no `title:`. The `## Sources` section in the body is the sole record of contributing documents. Each frontmatter key must appear exactly once; YAML rejects duplicates and the Cold Mountain build will fail on parse.

### Citations

Every page ends with a `## Sources` section listing every Readwise doc that has contributed to it, formatted as `- [Title](source_url) — one-line note on what it added`. Use the document's original `source_url` from Readwise metadata, **not** the Readwise reader URL. If `source_url` is missing (manual notes, pasted text, some PDFs), use plain-text title with no link. The per-doc worker appends to this section on every run, deduping by URL.

Inline citations are reserved for three narrow cases:

1. **Direct quotes** — anything in quotation marks pulled from a source.
2. **Specific statistics or numbers** — concrete figures a reader might want to verify.
3. **Contested or surprising claims** — assertions a skeptical reader would push back on.

Inline format: `[[source]](source_url)` immediately after the cited sentence. Everything else (synthesis, definitions, connective prose, common knowledge) stays uncited — the `## Sources` section covers attribution. Do **not** add inline citations for general framing or restatements; the wiki should read as distilled understanding, not an annotated bibliography.

### Linking

- Use standard markdown links between wiki pages: `[link text](path/to/page.md)`.
- Always update `last_updated:` in frontmatter when editing a page.
- Cross-link when a new page or section relates to existing content. The per-doc worker is responsible for this at edit time — there's no later stage that fills in cross-links.

### Cohesion bias

**Extend before creating.** When in doubt, add to an existing page rather than spinning up a new one. The wiki gets less useful as it fragments. The list-maker enforces this at intake. The per-doc worker enforces it again at synthesis (e.g., a thin tweet doesn't earn its own page — it earns a bullet on a related page).

### Folder structure

The wiki is organized into broad-topic folders under `resources/wiki/`. Check `resources/wiki/index.md` for the current layout. New folders are allowed when nothing fits — use short kebab-case names — but don't over-fragment.

### Persistent files

- `resources/wiki/index.md` — sidebar / navigation index. Updated by per-doc workers when creating new pages.
- `resources/wiki/list-maker-log.md` — daily list-maker output (overwritten each run; the `run_end` timestamp becomes tomorrow's cutoff).
- `resources/wiki/WORKER_ERRORS.md` — per-doc worker failures (append-only; clean manually when noisy).

### Path mapping

Inside the container the `readwise-wiki` group has three relevant mounts:

- `/workspace/extra/wiki/` → these instruction files (e.g. `instructions/list-maker.md`).
- `/workspace/extra/resources/wiki/` → the wiki content itself (pages, index.md, etc.).
- `/workspace/extra/vault/` → the full second-brain vault (used for `git add` / `git commit` / `git push`).

All page paths in the per-stage instructions are written assuming `cd /workspace/extra/vault` as the working directory before reading/writing.
