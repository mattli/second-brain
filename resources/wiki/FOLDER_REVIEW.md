---
generated: 2026-05-01
status: proposal (awaiting approval)
---

# Wiki Structure Review — 2026-05

## Current State

| Folder | Pages | Notes |
|--------|-------|-------|
| concepts/ | 8 | Core AI concepts — healthy size, clear theme |
| culture/ | 2 | Museum design, internet as mediating layer |
| landscape/ | 10 | AI industry landscape — densest folder, still scannable |
| models-safety/ | 3 | Models and safety research |
| music/ | 1 | Beatles early period only |
| people/ | 4 | AI figures — clear theme |
| science/ | 1 | AI drug discovery only |
| tools/ | 4 | Frameworks and agent engineering |
| writing/ | 1 | Writing craft only |

Total: 34 topic pages across 9 folders.

Unorganized: 22 items under `## Bookmarks`, 0 under `## Long-form sources`.

## Observations

- **INDEX drift persists:** `landscape/venture-capital-access.md` exists on disk but is still missing from `INDEX.md`. This was flagged in the April review and remains unfixed — the April review was never applied.
- `landscape/` at 10 pages remains the densest folder. Sub-themes (careers, startups, regulation, org design, definitions, VC) are visible but each page is distinct. No split warranted yet, but approaching the threshold where one becomes worth considering.
- Three single-page folders remain: `music/` (1), `writing/` (1), `science/` (1). The April review proposed merging `music/` into `culture/` — that proposal stands and is carried forward here.
- `writing/` and `science/` remain plausible growth areas. Leave as-is.
- `inbox/` is empty. Structural folder, no action needed.
- All folder names still match their contents. No drift detected in any folder.
- Unorganized has grown slightly since April (was 22 items, still 22 — same items, no new saves added to it this period). Several clusters identified in April remain unaddressed since the review was never applied.

## Proposed Changes

### 1. Merge `music/` into `culture/`

Move `music/beatles-early-period.md` to `culture/beatles-early-period.md` and delete the empty `music/` folder. Fold the INDEX "Music" section entry into the "Culture" section.

**Why:** `beatles-early-period.md` is compositional and cultural analysis — it sits naturally with the other culture pages (museum curation, internet-as-mediating-layer). A 1-page folder for a topic unlikely to grow rapidly costs a sidebar slot without aiding scannability. This was proposed in the April review and remains the right call.

**Impact:** 1 page moved, `music/` folder deleted, INDEX.md updated (remove Music section, add entry under Culture), any internal links to old path updated.

### 2. Fix INDEX drift — add `venture-capital-access.md`

Add `landscape/venture-capital-access.md` to the Landscape section of INDEX.md with its description line.

**Why:** The page has been missing from INDEX since its creation on 2026-04-24. This is the second consecutive review flagging it. The page covers USVC/AngelList indexed VC access — substantive content invisible to INDEX readers.

**Impact:** 1 line added to INDEX.md. No file moves.

## Unorganized Promotions

### 1. Merge Claude Opus 4.7 into `models-safety/frontier-models.md`

The Opus 4.7 release article (vision improvements, xhigh effort level, /ultrareview, auto mode, Project Glasswing cyber safeguards) extends the frontier-models page which already tracks model releases and benchmarks.

**Items to move:**
- Introducing Claude Opus 4.7 (article, saved 2026-04-17)

**Action:** Merge into `models-safety/frontier-models.md`. Remove from `unorganized.md`.

### 2. Merge OpenClaw article into `people/peter-steinberger.md`

The "How I created OpenClaw" article is about Peter Steinberger, who already has a people page mentioning OpenClaw.

**Items to move:**
- How I created OpenClaw (article, saved 2026-04-17, 170w — thin)

**Action:** Add source reference to `people/peter-steinberger.md`. Remove from `unorganized.md`.

### 3. Merge startup/marketing tweets into existing landscape pages

Several thin items belong in existing pages:

**Into `landscape/ai-startup-distribution.md`:**
- App Growth Formula (Viktor Seraleev's 16-point mobile formula)
- "the difference between 'why isn't this selling'…" (finding the right angle)
- "ok this startup is cool but…" (Andrew Chen on founders vs big-company threats)

**Into `landscape/yc-ai-thesis.md`:**
- Here's YC's official advice about being truthful… (Garry Tan on terminology precision)
- YC on how to build a company with AI from… (Ben Lang pointer tweet)

**Action:** Merge insights into respective target pages. Remove all from `unorganized.md`.

### 4. Drop non-wiki bookmarks

Items that don't belong in a knowledge wiki:

- **Jesse's Blueberry Chia Seed Pudding** — recipe
- **April 10, 2026** — Readwise product changelog
- **April 17, 2026** — Readwise product changelog
- **April 24, 2026** — Readwise product changelog
- **(untitled highlight)** — standalone highlight, no document context
- **x-bookmarks.com** — tool bookmark, no substantive content

**Action:** Remove these 6 items from `unorganized.md`.

## Watch Items

Pairs or singletons too thin to promote; flagged for next review.

- **Gabor Maté podcast** (19K words on trauma, narcissism, mind-body connection) — substantive but no matching wiki domain. Could seed a psychology/health page if more saves arrive.
- **Lenny Rachitsky profile** (7K words on creator-operator model) — substantive singleton. Could seed a creators/media page.
- **Neuromarketing & Meta Tribe V2** (11K words on brain-scan AI for ad optimization) — substantial but niche. Doesn't fit `ai-startup-distribution.md` cleanly (it's neuroscience-meets-marketing, not distribution strategy). Watch for more marketing-science saves.
- **Humanity Is About to Fork** (Diamandis) + **The Future Of Everything Is Lies** (Kingsbury, residual) — two societal-impact essays with partially synthesized content. The unsynthesized remainder (information ecology, epistemic collapse, speciation forks) could form an "AI & Society" topic if similar saves recur.
- **Beliefs guiding path to superintelligence** (ineffable.ai) — thin mission statement. Could fit `concepts/world-models.md` or `landscape/agi-definitions.md` if fleshed out, but too thin to merge now.
- **Perplexity Comet** + **NanoClaw + Vercel** + **Ghostty** — product/tool bookmarks with no shared knowledge theme. Singletons.
- `landscape/` folder at 10 pages — no split proposed, but if it grows past 12–13 pages, consider splitting by sub-theme (market analysis vs. strategy vs. regulation).

## Approval

To apply: open a Claude Code session in the vault and say "apply folder-review.md" — Claude will execute the moves, update every internal link, and commit atomically. You can watch each step and interrupt if anything looks off.

To modify: edit this file and re-request apply. To reject: leave as-is; next month's run regenerates it.
