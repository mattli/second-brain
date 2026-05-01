---
generated: 2026-04-30
status: proposal (awaiting approval)
---

# Wiki Structure Review — 2026-04

## Current State

| Folder | Pages | Notes |
|--------|-------|-------|
| concepts/ | 8 | Core AI concepts. Coherent, well-sized. |
| culture/ | 2 | Cultural analysis — museum design, internet theory. |
| landscape/ | 10 | AI industry landscape. Densest folder; venture-capital-access.md missing from INDEX. |
| models-safety/ | 3 | Model releases and safety. Healthy. |
| music/ | 1 | Only beatles-early-period.md. |
| people/ | 4 | Individual profiles. Healthy. |
| science/ | 1 | Only ai-drug-discovery.md. |
| tools/ | 4 | Agent/product frameworks. Healthy. |
| writing/ | 1 | Only writing-craft.md. |

Total: 34 topic pages across 9 folders (plus empty `inbox/`).

Unorganized: 22 items under `## Bookmarks` (no `## Long-form sources` section).

## Observations

- `landscape/` is the densest folder at 10 pages. Sub-themes are visible (market analysis, startup strategy, industry structure, regulation) but still scannable. A split isn't warranted yet, but continued growth will push it past the threshold. Worth watching.
- `music/` has 1 page (`beatles-early-period.md`). The content is compositional/cultural analysis — it fits naturally alongside `culture/museum-design-curation.md` and `culture/internet-as-mediating-layer.md`. A whole sidebar slot for one music-analysis page is a scannability cost.
- `science/` has 1 page (`ai-drug-discovery.md`). This is a genuine growth area — AI-driven science is a recurring theme in the source material. Keeping the folder signals that more content is expected. Leave as-is.
- `writing/` has 1 page (`writing-craft.md`). Similar to science/ — writing and communication are plausible growth topics. Leave as-is.
- `landscape/venture-capital-access.md` exists on disk but is missing from INDEX.md. INDEX drift — the page was created on 2026-04-24 but never added to the index.
- `inbox/` is empty. It appears to be structural (not a topic folder). No action needed.

## Proposed Changes

### 1. Merge `music/` into `culture/`

Move `music/beatles-early-period.md` to `culture/beatles-early-period.md` and delete the empty `music/` folder. Rename the INDEX section from "Music" to fold the entry into "Culture" (or rename "Culture" to "Culture & Music" if the distinction matters).

**Why:** `beatles-early-period.md` is compositional and cultural analysis. It sits naturally with the other culture pages. A 1-page folder for a topic unlikely to grow rapidly costs a sidebar slot without aiding scannability.

**Impact:** 1 page moved, `music/` folder deleted, INDEX.md updated (remove Music section, add entry under Culture), internal links in other pages updated if any reference the old path.

### 2. Fix INDEX drift — add `venture-capital-access.md`

Add `venture-capital-access.md` to the Landscape section of INDEX.md with its description.

**Why:** The page exists and has substantive content (USVC/AngelList indexed VC thesis) but was never added to INDEX after creation. INDEX should reflect all topic pages.

**Impact:** 1 line added to INDEX.md. No file moves.

## Unorganized Promotions

### 1. Merge marketing/growth cluster into `landscape/ai-startup-distribution.md`

Three items cluster around marketing tactics and growth strategy, which is the core topic of the existing `ai-startup-distribution.md` page.

**Items to move:**
- **App Growth Formula** (Viktor Seraleev's 16-point formula for mobile app success)
- **Neuromarketing & Meta Tribe V2** (Meta's brain-scan AI model for ad optimization)
- **"the difference between 'why isn't this selling'..."** (The Boring Marketer on finding the right angle)

**Action:** Merge relevant insights into `landscape/ai-startup-distribution.md`. Remove items from `unorganized.md`. No INDEX change needed (page already listed).

### 2. Merge YC/startup cluster into `landscape/yc-ai-thesis.md`

Three items are YC-adjacent startup advice that fits the existing YC thesis page.

**Items to move:**
- **"ok this startup is cool but..."** (Andrew Chen on founders building despite big-company threats)
- **Here's YC's official advice about being truthful...** (Garry Tan on pilot/bookings/revenue terminology precision)
- **YC on how to build a company with AI from...** (Ben Lang pointer to YC video)

**Action:** Merge relevant insights into `landscape/yc-ai-thesis.md`. Remove items from `unorganized.md`. No INDEX change needed.

### 3. Merge model release items into existing pages

Two items fit naturally into existing wiki pages as individual merges.

**Items to move:**
- **Introducing Claude Opus 4.7** → merge into `models-safety/frontier-models.md`
- **Beliefs guiding our path to superintelligence** (ineffable.ai) → merge into `landscape/agi-definitions.md` or `concepts/world-models.md`

**Action:** Merge into respective target pages. Remove from `unorganized.md`.

### 4. Merge Peter Steinberger item into existing page

**Items to move:**
- **How I created OpenClaw** (170w, thin) — already covered by `people/peter-steinberger.md`

**Action:** Add source link to `people/peter-steinberger.md` if not already referenced. Remove from `unorganized.md`.

### 5. Drop non-wiki bookmarks

Items that don't belong in a knowledge wiki — recipes, product changelogs, tool bookmarks, and empty highlights.

**Items to drop:**
- **Jesse's Blueberry Chia Seed Pudding** — recipe, not knowledge wiki material
- **April 10, 2026** — Readwise product changelog
- **April 17, 2026** — Readwise product changelog
- **April 24, 2026** — Readwise product changelog
- **x-bookmarks.com** — tool bookmark with no substantive content
- **(untitled highlight)** — standalone highlight with no document context

**Action:** Remove from `unorganized.md`.

## Watch Items

Pairs or singletons too thin to promote; flagged for next review.

- **Gabor Mate podcast** (psychology, trauma, mind-body) — substantial content (19K words) but no matching wiki domain. If more psychology/health items arrive, a `science/` or `health/` page could form.
- **Lenny Rachitsky profile** + **Peter Steinberger "How I created OpenClaw"** — both are creator/builder profiles. If more creator profiles accumulate, a dedicated page or `people/` expansion could work. (Steinberger already has a page; Rachitsky doesn't.)
- **Humanity Is About to Fork** (Diamandis) + **The Future Of Everything Is Lies** (Kingsbury, residual) — both are long-form future-of-technology pieces. The Kingsbury essay's unsynthesized remainder (information ecology, epistemic collapse) could seed a new topic if similar themes recur.
- **Perplexity Comet** + **NanoClaw + Vercel** — both are AI product announcements. Too thin individually; would need more product-launch items to form a cluster.
- **Ghostty** — developer tool bookmark. Singleton, no adjacent items.
- `landscape/` folder at 10 pages — not proposing a split yet, but if it grows past 12-13 pages, consider splitting into `landscape/market/` and `landscape/strategy/` or similar.

## Approval

To apply: open a Claude Code session in the vault and say "apply folder-review.md" — Claude will execute the moves, update every internal link, and commit atomically. You can watch each step and interrupt if anything looks off.

To modify: edit this file and re-request apply. To reject: leave as-is; next month's run regenerates it.
