---
generated: 2026-04-17
status: proposal (awaiting approval)
---

# Wiki Structure Review — 2026-04

## Current State

| Folder | Pages | Notes |
|--------|-------|-------|
| concepts/ | 7 | patterns, frameworks, theoretical models |
| landscape/ | 8 | industry trends, market dynamics, strategic takes |
| tools/ | 4 | harnesses, skill frameworks, product development systems |
| people/ | 4 | individual profiles |
| models-safety/ | 2 | model-specific pages + safety research |
| writing/ | 1 | single page on writing craft |
| long-form/ | 0 | reserved for full synthesis of large PDFs (none yet) |

Total: 26 topic pages across 6 folders (excluding `long-form/`, `raw/`, and the root-level `unorganized.md` holding page).

## Observations

- **`writing/` is a one-page folder.** `writing-craft.md` sits alone. Sidebar cost: a whole folder opens for a single item.
- **`models-safety/` is thin (2 pages) but cohesive.** Content is specifically about model-level safety and interpretability. Growth candidate, not a merge candidate.
- **`landscape/` is the largest folder (8 pages).** Still scannable, but several sub-themes are visible: (a) business dynamics (services-as-software, vertical-ai, ai-startup-distribution), (b) research/capabilities (agi-definitions, world-models), (c) people-and-culture (ai-careers, ai-user-perspectives, ai-organization-design). If `landscape/` crosses ~12 pages, a split will become warranted.
- **`tools/` is mixed in scope.** Two pages are frameworks (`agent-harness`, `claude-code-skill-frameworks`), one is a practice area (`agentic-engineering`), and one is a domain (`ai-native-product-development`). Folder name "tools" is a bit loose for this mix, but the grouping is defensible as "building-with-AI techniques."
- **index.md alignment is good.** Section headers mirror folder names and descriptions are current. No drift detected.
- **No orphan folders.** Every folder is indexed in index.md; every INDEX section has a corresponding folder (except `Holding` which points to `unorganized.md`).

## Proposed Changes

### 1. Merge `writing/` into `concepts/`

Move `writing/writing-craft.md` → `concepts/writing-craft.md`. Delete the empty `writing/` folder. Update index.md: remove the `## Writing` section and add the single entry to `## Concepts & Patterns` (or create a short `## Craft` subsection within Concepts if a second craft page emerges).

**Why:** A one-page folder fights scannability — the sidebar shows `writing/ > writing-craft.md` when it could just show `concepts/writing-craft.md`. Writing craft is a meta-pattern (about how to do the work well), which fits `concepts/`'s "patterns and frameworks" theme. The `writing/` folder is premature organization for a cluster that doesn't yet exist. If a future Writing cluster forms (3+ pages on writing-specific topics), promote it back to its own folder at that point.

**Impact:** 1 page moved, 1 folder removed, index.md regrouped (~3 lines changed). Search for `(../writing/writing-craft.md)` across the wiki to catch any internal references — initial scan suggests zero cross-page links currently point to it.

### 2. No change to `landscape/`

At 8 pages it is still scannable. Flag for re-evaluation when it hits ~12.

### 3. No change to `models-safety/`

Two pages but cohesive. Growth zone, not a merge target.

### 4. No change to `tools/`

Naming is loose but contents are internally consistent as "building-with-AI techniques." Revisit only if a sharper theme emerges.

## Approval

To apply: open a Claude Code session in the vault and say "apply folder-review.md" — Claude will execute the move, update links, regroup index.md, and commit atomically. You can watch each step and interrupt if anything looks off.

To modify: edit this file and re-request apply. To reject: leave as-is; next month's run regenerates it.
