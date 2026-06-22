---
generated: 2026-06-01
status: proposal (awaiting approval)
---

# Wiki Structure Review — 2026-06

## Current State

| Folder | Pages | Notes |
|--------|-------|-------|
| concepts/ | 8 | Core AI concepts, patterns, paradigms |
| culture/ | 2 | Museum curation, internet culture |
| landscape/ | 10 | AI industry: careers, startups, regulation, org design, VC |
| models-safety/ | 3 | Frontier models, safety, interpretability |
| music/ | 1 | Beatles compositional analysis |
| people/ | 4 | Karpathy, DHH, Steinberger, Amodei |
| science/ | 1 | AI drug discovery |
| tools/ | 6 | Agent harnesses, evals, voice AI, product dev, skill frameworks |
| writing/ | 1 | Writing craft |

Total: 38 topic pages across 9 folders.

Unorganized: 26 items under `## Bookmarks` (no `## Long-form sources` section).

## Observations

- **May review was never applied.** The May 2026 review proposed merging `music/` into `culture/` and fixing INDEX drift for `venture-capital-access.md`. Neither was applied. Both proposals are re-evaluated below.
- **INDEX drift is fixed.** `landscape/venture-capital-access.md` now appears in INDEX.md — the weekly compiler corrected this since the May review. No action needed.
- **`tools/` grew from 4 to 6 pages** since the May review (added `ai-evals.md` and `voice-ai-infrastructure.md`). Healthy growth, no concern.
- **`landscape/` remains the densest folder at 10 pages.** Sub-themes visible (market dynamics, societal, institutional) but each page is distinct. Still below the split threshold.
- **Three 1-page folders persist: `music/`, `science/`, `writing/`.** The May review proposed merging `music/` into `culture/`. This remains a reasonable call — see Proposed Changes.
- **`unorganized.md` has grown to 26 items.** Some April items remain (the May review's promotions/drops were never applied). New items added since May: Readwise changelogs, Moss tweets, Andon FM, Printing Press, science quote. Several items are clearly non-wiki material accumulating as noise.
- **All folder names match their contents.** Spot-checked `landscape/venture-capital-access.md`, `concepts/synthetic-personas.md`, `culture/museum-design-curation.md` — all fit their folder themes.

## Proposed Changes

### 1. Merge `music/` into `culture/`

Move `music/beatles-early-period.md` to `culture/beatles-early-period.md`. Delete the empty `music/` folder. Fold the INDEX "Music" section entry into the "Culture" section.

**Why:** `beatles-early-period.md` is compositional and cultural analysis — it sits naturally alongside museum curation and internet culture essays. A 1-page folder for a topic unlikely to grow rapidly costs a sidebar slot without aiding scannability. This was proposed in both April and May reviews and remains the right call.

**Impact:** 1 page moved, `music/` folder deleted, INDEX.md updated (remove Music section, add entry under Culture), internal links to old path updated.

## Unorganized Promotions

### 1. Merge Claude Opus 4.7 into `models-safety/frontier-models.md`

The Opus 4.7 release article (3.75MP vision, xhigh effort level, Project Glasswing safeguards, auto mode) extends the frontier-models page which already tracks model releases and benchmarks.

**Items to move:**
- Introducing Claude Opus 4.7 (article, saved 2026-04-17)

**Action:** Merge key details into `models-safety/frontier-models.md`. Remove from `unorganized.md`. No INDEX change needed.

### 2. Merge Karpathy agentic engineering tweet into `people/andrej-karpathy.md`

The existing Karpathy page already covers "decade of agents" and agentic themes.

**Items to move:**
- Andrej Karpathy on the shift to agentic engineering (tweet, saved 2026-05-05)

**Action:** Merge into `people/andrej-karpathy.md`. Remove from `unorganized.md`.

### 3. Merge OpenClaw article into `people/peter-steinberger.md`

The existing Steinberger page already covers OpenClaw. This is a thin reference to confirm/extend.

**Items to move:**
- How I created OpenClaw (article, saved 2026-04-17, 170w)

**Action:** Confirm covered in `people/peter-steinberger.md`. Remove from `unorganized.md`.

### 4. Merge startup/marketing tweets into existing landscape pages

Thin tweets that extend existing page themes:

**Into `landscape/ai-startup-distribution.md`:**
- "ok this startup is cool but…" (Andrew Chen on founders vs big-company threats)
- how to cold DM anyone (Founders Inc thread, 181w)

**Into `landscape/yc-ai-thesis.md`:**
- Here's YC's official advice about being truthful… (Garry Tan on terminology precision)
- YC on how to build a company with AI from… (Ben Lang pointer tweet)

**Into `tools/ai-native-product-development.md`:**
- "must read" (Dan Shipper pointer to agent-native PM guide)

**Action:** Merge insights into respective target pages. Remove all 5 items from `unorganized.md`.

### 5. Drop non-wiki bookmarks

Items that will never cluster into knowledge topics:

**Items to remove:**
- **Jesse's Blueberry Chia Seed Pudding** — recipe
- **(untitled highlight)** (saved 2026-04-29) — no document context
- **May 15, 2026** (Readwise changelog) — ephemeral product update
- **May 22, 2026** (Readwise changelog) — ephemeral product update
- **x-bookmarks.com** — bare tool bookmark, no knowledge content
- **Ghostty** — bare tool bookmark (terminal emulator), no knowledge content

**Action:** Remove these 6 items from `unorganized.md`.

## Watch Items

Pairs or singletons too thin to promote; flagged for next review.

- **Moss semantic search** + **Moss 200% MoM** — voice AI / real-time inference pair. Two items about Moss (YC F25) for conversational AI. Natural merge target: `tools/voice-ai-infrastructure.md`. Promote if more voice AI tooling saves appear.
- **Gabor Maté podcast** (19K words on trauma, narcissism, mind-body) — substantive but no matching wiki domain. Could seed a psychology/health page if similar saves arrive.
- **Lenny Rachitsky profile** (7K words on creator-operator model) — substantive singleton. Could seed a creators/media page or merge into a future people/ entry.
- **Humanity Is About to Fork** (Diamandis) + **The Future Of Everything Is Lies** (Kingsbury, residual) — societal-impact essays. The unsynthesized remainders (information ecology, epistemic collapse, speciation forks) could form an "AI & Society" topic if more saves recur.
- **Perplexity Comet** + **NanoClaw + Vercel** + **Printing Press** + **Andon FM** — product/tool bookmarks with no shared knowledge theme. Singletons with thin content. Will drop next month if still unmatched.
- **Beliefs guiding path to superintelligence** (ineffable.ai) — thin mission statement. Singleton.
- **Feeling stupid is a crucial part of science** — standalone quote on embracing uncertainty. Singleton.
- **`landscape/`** at 10 pages — no split proposed, but if it grows past 12-13, consider splitting by sub-theme (market/business vs. institutional/regulatory vs. societal).

## Approval

To apply: open a Claude Code session in the vault and say "apply folder-review.md" — Claude will execute the moves, update every internal link, and commit atomically. You can watch each step and interrupt if anything looks off.

To modify: edit this file and re-request apply. To reject: leave as-is; next month's run regenerates it.
