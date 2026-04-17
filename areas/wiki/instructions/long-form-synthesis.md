# Long-Form Synthesis — Instructions

> Version: 1.0 | Last updated: 2026-04-17

## Purpose

Synthesize large Readwise PDFs (50K–200K words) into dedicated wiki pages that preserve the source's argument arc and cross-link into the existing topic graph. Complements the weekly readwise-wiki compiler, which handles shorter content and maintains the queue of pending long-form items.

## Scope

| Word count | Handling |
|------------|----------|
| < 20K | Weekly compiler, Tier A — batched synthesis into topic pages |
| 20K–50K | Weekly compiler, Tier B — one-at-a-time synthesis into topic pages |
| **50K–200K** | **Long-form synthesis — dedicated page in `wiki/long-form/`** |
| > 200K | Existing Tier C reference-only rule — metadata line on relevant topic page |

The 200K cap protects against book-length works where output compression becomes too severe. Opus's ~64K output cap vs. a 200K-word input is already a ~4:1 ratio; much beyond that produces shallow summaries that lose the source's structure.

## Trigger

Long-form synthesis is **user-invoked**, not scheduled. Dispatch flow:

1. Matt asks the main Telegram group about the queue or to synthesize a specific item (natural language; no required phrase).
2. The main group agent resolves the reference against `resources/wiki/long-form/QUEUE.md` (or against Readwise directly if the ask is ambiguous). Confirms with Matt if the resolution is unclear.
3. The main group agent schedules a one-off task in the `readwise-wiki` group (see `nanoclaw-admin.md` for the scheduling mechanism). The task prompt must include:
   - The Readwise document ID
   - A pointer to this instructions file
   - A directive to send a completion notification to the main channel when done
4. The readwise-wiki container runs the synthesis per the Workflow below.

## Queue File

`resources/wiki/long-form/QUEUE.md` is the source of truth for what's pending. It is regenerated at the end of every weekly compiler run (Phase 5 of `readwise-wiki.md`) — see Queue Regeneration below. Format:

```markdown
---
last_updated: YYYY-MM-DD
---

# Long-Form Synthesis Queue

Readwise items (50K–200K words) without a corresponding page in `long-form/`.

| # | Title | Author | Words | Saved | Readwise ID | Suggested topic link |
|---|-------|--------|-------|-------|-------------|----------------------|
| 1 | ... | ... | ... | ... | `<id>` | `concepts/example.md` |
```

The `Suggested topic link` is the agent's best match against `INDEX.md` by title keywords. Matt can override during dispatch.

## Page Format

Long-form pages live at `resources/wiki/long-form/<slug>.md`. Slug is kebab-case from the title. Template:

```markdown
---
created_at: YYYY-MM-DD
last_updated: YYYY-MM-DD
source_type: long-form
readwise_id: <id>
---

# Title

> TLDR: 1–2 sentences capturing the central argument and why this source is worth synthesized notes.

## Metadata

- **Author:** ...
- **Category:** PDF (Nk words)
- **Saved:** YYYY-MM-DD
- **Source:** [Readwise](https://read.readwise.io/read/<id>)

## Overview

2–4 paragraphs: what the source is, the thesis, the intellectual frame.

## Key Themes

Sections mirroring the source's own structure (chapters, parts, or thematic clusters — whatever fits best). Synthesized claims, not paraphrase. Inline links to topic pages go here, woven into the prose where the source actually connects to them.

## Connections

Explicit list of topic pages this source informs, one line each explaining how:

- [Topic Page](../folder/page.md) — how this source informs that page

## Open Questions

Claims that contradict or extend existing wiki pages. Surfaces where other pages may need updating after integration.
```

## Bidirectional Linking Rule

For every topic page listed in the Connections section of a new long-form page:

1. Open the topic page.
2. Add a `## Long-form sources` section at the bottom if one does not exist.
3. Append a line in this format:
   ```
   - **Title** — Author ([long-form notes](../long-form/<slug>.md), Readwise: <id>)
   ```

The inline links within the long-form page's body handle the long-form → topic direction. The `## Long-form sources` section handles topic → long-form. Two-way discovery.

## Workflow (readwise-wiki agent, single-document synthesis mode)

When invoked with a one-off task containing a Readwise ID:

1. **Fetch** the document via `reader_get_document_details`.
2. **Verify** word count is in 50,000–200,000 range. If outside:
   - Below 50K: abort, notify "Below long-form threshold; let the weekly compiler handle this as Tier A/B."
   - Above 200K: apply the Tier C reference-only rule (append a metadata line to the best-match topic page, log which page) and notify "Above 200K cap; reference line added to `<page>`."
3. **Synthesize** the long-form page per the Page Format above. Write to `resources/wiki/long-form/<slug>.md`.
4. **Update topic pages** per the Bidirectional Linking Rule for each Connections entry.
5. **Commit and push** the vault:
   ```bash
   cd /workspace/extra/second-brain
   git add -A
   git diff --cached --quiet || git commit -m "long-form synthesis: <title> $(date +%Y-%m-%d)"
   git push
   ```
6. **Notify** the main channel via `send_message`: "✅ Long-form synthesis complete: <title>. Saved to `wiki/long-form/<slug>.md`, linked from N topic pages."

On any error: commit partial work if any, notify the main channel with the error, exit cleanly.

## Queue Regeneration (weekly compiler, Phase 5 addition)

At the end of Phase 5 of `readwise-wiki.md`, after the lint pass:

1. Call `reader_list_documents` for `category: pdf` and `category: epub` with **no `updated_after`** — full library scan. Collect all results.
2. Filter to documents with `50,000 ≤ word_count ≤ 200,000`.
3. List existing files in `resources/wiki/long-form/` (exclude `QUEUE.md`).
4. For each qualifying Readwise doc, check if any existing long-form page has matching `readwise_id` in its frontmatter. If yes, already processed; skip. If no, pending.
5. For each pending item, suggest a topic page by matching title keywords against `INDEX.md`. If nothing matches well, leave the suggestion blank.
6. Write `resources/wiki/long-form/QUEUE.md` with the table.

Queue regeneration is a cheap list-and-diff operation — no `reader_get_document_details` calls, no synthesis, no significant token cost.

## Design Decisions

**Why manual triggering, not scheduled synthesis:**
NanoClaw shares the Max subscription weekly usage budget with personal Claude Code sessions. Each long-form synthesis is ~100K tokens. Scheduled runs would consume that budget without Matt's ability to defer to a better week. Manual triggering keeps cost control in Matt's hands while the queue regeneration (cheap) stays automated.

**Why the 200K cap:**
Opus's output token cap is ~64K. At 200K input words (~265K tokens), synthesis compresses ~4:1 — tight but workable. Much above that, compression becomes severe enough that output loses the source's argument arc. The existing Tier C reference-only rule remains the escape hatch for oversized docs.

**Why long-form pages live in their own folder:**
A book-length source is structurally different from an article. Compressing it into bullets on a topic page loses the argument arc; splitting it across many topic pages loses the book as a unit. A dedicated page per source, cross-linked into the topic graph, preserves both.
