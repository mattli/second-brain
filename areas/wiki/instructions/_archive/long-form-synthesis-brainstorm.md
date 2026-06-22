# Long-Form Synthesis for the Readwise Wiki

> Date: 2026-04-17 (updated after decision session)
> Status: Decided — not yet implemented
> Related: [areas/wiki/instructions/readwise-wiki.md](../instructions/readwise-wiki.md) (v2.3)

## Problem

The scheduled Readwise wiki compiler treats anything over 50K words as **Tier C: reference-only** — a one-line metadata reference, no synthesis. Per the instructions, this was chosen because the library had too few long-form items to justify chunking infrastructure.

In practice: the Tier C rule has never fired. The compiler only picks up documents updated within its run window, and the existing long-form saves predate its first run. They're effectively invisible to the pipeline.

## Current library state (as of 2026-04-17)

Actual Tier-C-eligible PDFs in Readwise:

| Title | Author | Words | Readwise ID | Current status |
|-------|--------|-------|-------------|----------------|
| Knowledge About Knowledge | Claire McInerney, Ed. | 131,334 | `01knjemvdkrdqgy21tz280tbav` | Not in wiki |
| System Card: Claude Mythos Preview | Anthropic | 70,705 | `01knnraph8fhxanxpk246qj76j` | Not in wiki (though `models-safety/claude-mythos.md` exists as a topic page) |

Also worth noting for context:
- "The Future of Everything Is Lies, I Guess" (Kingsbury, 26K) is Tier B — the weekly compiler will synthesize it into a topic page automatically next run.
- "Knowledge Management and Polanyi" (Straw, 8K) is Tier A — same.
- No epubs. One untitled, archived PDF with null word count — probably a dead save.

## Key facts that shaped the decision

- **Context is not the bottleneck.** Opus 4.7 has a 1M-token window; a 200K-word doc fits easily.
- **Output token cap is the real constraint.** Opus caps output around 64K tokens. One-shot synthesis of a full book compresses 3:1+ into that budget, which tends to produce shallow bullet summaries.
- **Structure matters for books.** A 300-page work has an argument arc that gets lost when flattened into bullets on a short topic page.
- **NanoClaw uses the Max subscription.** Scheduled NanoClaw agents draw from the same weekly usage budget as personal Claude Code sessions. "Schedule it to save usage" is not a valid move. Running cost is real either way.
- **There is no programmatic way to detect the weekly reset date.** No CLI, no local file. Only `platform.claude.com/usage`.

## Decisions locked

### 1. Shape: dedicated long-form pages, cross-linked into topics

Each qualifying document gets its own page at `resources/wiki/long-form/<slug>.md`. The page is a first-class wiki citizen — it lives in its own folder but participates fully in the topic graph.

### 2. Tier structure

| Tier | Size | Behavior |
|------|------|----------|
| A | under 20K words | Full synthesis into topic pages (batched 5–8) |
| B | 20K–50K | Full synthesis into topic pages (one at a time) |
| **C** | **50K–200K** | **Full synthesis into a dedicated long-form page** (new) |
| C-overflow | over 200K | Reference-only line on the most relevant topic page (the existing Tier C behavior, now an escape hatch for oversized docs) |

The 200K cap is enforced before fetching content, using `word_count` from the list API.

### 3. Long-form page format

```markdown
---
created_at: YYYY-MM-DD
last_updated: YYYY-MM-DD
source_type: long-form
readwise_id: <id>
---

# Title

> TLDR: 1–2 sentences capturing the central argument.

## Metadata

- **Author:** ...
- **Category:** PDF (Nk words)
- **Saved:** YYYY-MM-DD
- **Source:** [Readwise](https://read.readwise.io/read/<id>)

## Overview

2–4 paragraphs: what the source is, the thesis, the intellectual frame.

## Key Themes

Sections mirroring the source's structure (chapters, parts, or thematic clusters). Synthesized claims, not paraphrase. Inline links to topic pages woven in where the source connects.

## Connections

Explicit list of topic pages this source informs, one line each:
- [Topic Page](../folder/page.md) — how this source informs that page

## Open Questions

Claims that contradict or extend existing wiki pages. Surfaces where the wiki should update after integration.
```

### 4. Bidirectional linking

- **Long-form page → topic pages:** inline links in the body wherever the source touches existing topics. Plus the explicit `## Connections` section.
- **Topic pages → long-form page:** each relevant topic page gets (or extends) a `## Long-form sources` section with a line in the format:
  ```
  - **Title** — Author ([long-form notes](../long-form/slug.md), Readwise: <id>)
  ```

Same `## Long-form sources` section that the existing Tier C reference-only behavior uses. The line format is what differs: reference-only uses a plain description, full-synthesis uses a link to the long-form page.

### 5. Folder structure

Flat `resources/wiki/long-form/`. No subfolders. Promote to subfolders only if the library grows past ~10 long-form items.

### 6. Trigger: manual, user-invoked

Synthesis is not part of the weekly compiler. The user triggers it explicitly when they want to spend the ~100K tokens on a given book, presumably when weekly usage has headroom.

Exact trigger mechanism (slash command vs chat trigger vs one-off Claude Code session with Readwise ID) is undecided. Simplest path: a one-off manual Claude Code session per book, following the format and linking rules spec'd in this doc. Promote to a formal slash command only if this becomes routine.

Why not scheduled, even with a one-per-week cap: NanoClaw shares the Max weekly budget with personal Claude Code. Even one scheduled book per week is ~100K tokens the user can't choose to defer to a better week. Manual triggering keeps that choice with the user.

### 7. No TOC extraction in v1

One-shot synthesis. Let the model structure its own output from whatever section headings it detects. Add chapter-by-chapter processing only if v1 output turns out shallow on a real book.

### 8. No backfill

The existing wiki has zero `## Long-form sources` sections to upgrade. The two current Tier C items will be the first long-form pages ever created.

## Open questions

1. **What about the 26K-word Kingsbury essay next week?** It's Tier B and the compiler will synthesize it into topic pages. Do we want to override that — bump it to a long-form page — given its standalone substance? Probably not, but flag it.
2. **First long-form page as calibration.** Start with the smaller of the two (Claude Mythos Preview, 70K) before tackling the 131K book. Easier to iterate on if the first output is off.
3. **Promote to a slash command later?** If manual book synthesis happens more than twice, codify it as `~/.claude/commands/synthesize-book.md` so the procedure isn't re-derived each time. For now, this doc is the procedure.

## Next step

Pick a week with budget headroom, run a manual Claude Code session that:
1. Fetches Claude Mythos Preview via Readwise MCP (`reader_get_document_details` with id `01knnraph8fhxanxpk246qj76j`)
2. Synthesizes into `resources/wiki/long-form/claude-mythos-system-card.md` using the format spec'd in section 3
3. Updates `resources/wiki/models-safety/claude-mythos.md` with a `## Long-form sources` section
4. Commits to vault
5. If the output is good, repeat for Knowledge About Knowledge. If shallow, iterate the format or add chapter-level passes before running the second book.

No changes to the scheduled compiler, no changes to the instructions doc. The Tier C reference-only rule in the instructions stays as-is (the escape hatch for >200K books, and for any Tier C doc the user hasn't manually synthesized yet).
