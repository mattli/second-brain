# Wiki Folder & Structure Review — Instructions

> Version: 1.0 | Last updated: 2026-04-17

## Purpose

Evaluate the wiki's high-level organization — folders AND `INDEX.md` sections together — and propose scannability-focused reorganizations. Runs monthly (or on-demand) as a cheap, proposal-only review. Apply is a separate, explicit step that happens through a Claude Code session, not through the container.

Folder structure exists for one job: fast sidebar scanning. The review judges structure by that standard, not by tidiness or abstract taxonomy.

## Modes

This instructions file covers two modes. They share the same procedure for reading wiki state but differ on output:

- **Review mode** (scheduled monthly, or on-demand) — writes a proposal to `resources/wiki/FOLDER_REVIEW.md`. Never applies changes.
- **Apply mode** (user-invoked via Claude Code) — reads `FOLDER_REVIEW.md` and executes the proposed changes, updating all cross-page links and INDEX.md in one atomic commit.

---

## Review Mode Procedure

### Phase 1 — State

1. Read `resources/wiki/INDEX.md` to see current sections and descriptions.
2. List each folder under `resources/wiki/` (excluding `raw/`, `long-form/`, and `_archive` — these are structural, not topic folders). Record page count and list page titles per folder.
3. Sample 1–2 page titles per folder to verify folder name still matches content.
4. Read `resources/wiki/unorganized.md`. Record the count of items under each section (`## Bookmarks`, `## Long-form sources`) and the total.

### Phase 2 — Evaluate

For each folder, judge against these criteria:

- **Scannable at a glance?** Can you predict what's inside from the folder name?
- **Page count sane?** 1-page folders fight scannability (too thin); 15+ may hide structure (too dense).
- **Name still matches contents?** Did the folder drift from its original theme as pages were added?
- **Topic overlap?** Are there pages in different folders that would naturally cluster?
- **Misplaced pages?** Pages whose content sits awkwardly with folder-mates.
- **INDEX.md alignment?** Do INDEX sections still mirror folders, or has one drifted?

Thresholds are heuristics, not rules. A 1-page folder is fine if it's a growth area; a 15-page folder is fine if the contents are internally distinct. Apply judgment.

### Phase 2.5 — Scan `unorganized.md`

Read `resources/wiki/unorganized.md`. Group items under `## Bookmarks` and `## Long-form sources` by topic affinity. For each group:

- **Cluster (3+ items on a shared topic)** — propose promotion to a new topic page in the best-fitting folder, or merge into an existing page if one fits.
- **Pair (2 items on a shared topic)** — note as a watch item. Don't propose promotion yet; flag so next month's review sees the trajectory.
- **Singleton** — leave in place.
- **Non-wiki bookmark** (items that clearly aren't knowledge — recipes, unrelated tool bookmarks) — propose removal from `unorganized.md`. The holding bin shouldn't grow forever with items that will never cluster.

Record each group's decision for the proposal.

### Phase 3 — Write Proposal

Write `resources/wiki/FOLDER_REVIEW.md` using the template below. Overwrite any previous file. Do not apply any changes.

A no-change output is valid and expected when the structure is healthy. In that case the proposal section simply says "No changes proposed this month" with a one-line summary of why the structure is healthy.

### Phase 4 — Commit

```bash
cd /workspace/extra/vault
git add resources/wiki/FOLDER_REVIEW.md
if ! git diff --cached --quiet; then
  git commit -m "wiki folder review $(date +%Y-%m-%d)"
  git push
  # Trigger coldmountain.ai rebuild. Proxy returns 404 if hook unset — non-fatal.
  curl -sS -X POST -m 10 -o /dev/null \
    -w "cold-mountain deploy: HTTP %{http_code}\n" \
    "$NANOCLAW_CREDENTIAL_PROXY/cold-mountain-deploy" \
    || echo "cold-mountain deploy: curl failed"
fi
```

No notifications are sent — the file appears in the vault for Matt to review when he has time.

---

## Apply Mode Procedure

Invoked from a Claude Code session with a command like "apply FOLDER_REVIEW.md" or "apply the folder review." Never triggered automatically.

1. Read `resources/wiki/FOLDER_REVIEW.md`. If its status is not `proposal (awaiting approval)`, abort and ask the user to confirm which review to apply.
2. For each "Proposed Changes" entry:
   - Execute the file moves, folder creations/renames, or merges as specified.
   - Identify every internal link that points to any affected page and update it. Use `grep -rn "target-filename"` to find references; preserve the link text, change only the path.
   - Update `INDEX.md` to reflect the new structure — move entries between sections, rename sections, or regroup as needed.
2a. For each "Unorganized Promotions" entry:
   - **Promote to new page:** create the file using the standard page template, synthesize content from the referenced items (re-fetching from Readwise via `reader_get_document_details` if needed), add to `INDEX.md`, remove items from `unorganized.md`.
   - **Merge into existing page:** update the target page with the new material, remove items from `unorganized.md`.
   - **Drop:** remove items from `unorganized.md` only.
3. Run the existing readwise-wiki lint pass afterward (orphan pages, missing pages, stale content) to catch anything the reorg broke.
4. Update `FOLDER_REVIEW.md` status: change the frontmatter from `status: proposal (awaiting approval)` to `status: applied YYYY-MM-DD`.
5. Commit everything in one atomic commit:
   ```bash
   git add -A
   git commit -m "wiki reorg: <short description> $(date +%Y-%m-%d)"
   git push
   ```

If something looks wrong mid-apply, stop and ask the user before continuing. Partial state is recoverable via git reset; a half-applied review that commits broken links is not.

---

## `FOLDER_REVIEW.md` Template

```markdown
---
generated: YYYY-MM-DD
status: proposal (awaiting approval)
---

# Wiki Structure Review — YYYY-MM

## Current State

| Folder | Pages | Notes |
|--------|-------|-------|
| concepts/ | N | ... |
| ...

Total: N topic pages across M folders.

## Observations

Short, evidence-based observations. Each bullet cites specific pages or folder names.
Example:
- `writing/` has only 1 page (`writing-craft.md`). Sidebar cost: a whole folder for a single item.
- `landscape/` is at 8 pages — scannable, but the sub-themes (research/business/people) are visible and will push toward a split if growth continues.

## Proposed Changes

### 1. <Short action title>

<1–2 sentences describing the change.>

**Why:** <Rationale grounded in scannability, drift, or growth.>

**Impact:** <Pages moved, links updated, INDEX.md changes.>

### 2. ...

(Or, if the structure is healthy: `No changes proposed this month.` with a one-line reason.)

## Unorganized Promotions

### 1. Promote "<cluster name>" to <target path>

<1-2 sentences on cluster coherence.>

**Items to move:**
- <item 1>
- <item 2>
- <item 3+>

**Action:** Create `<path>` (or merge into `<existing-page>`). Remove items from `unorganized.md`. Update `INDEX.md`.

### 2. Drop non-wiki bookmarks

<Items that don't belong in a knowledge wiki.>

**Action:** Remove from `unorganized.md`.

(Or, if no promotions are warranted: `No promotions proposed this month.`)

## Watch Items

Pairs too thin to promote; flagged for next review.
- <item 1> + <item 2> — possible "<topic>" cluster forming

## Approval

To apply: open a Claude Code session in the vault and say "apply FOLDER_REVIEW.md" — Claude will execute the moves, update every internal link, and commit atomically. You can watch each step and interrupt if anything looks off.

To modify: edit this file and re-request apply. To reject: leave as-is; next month's run regenerates it.
```

---

## Design Decisions

**Why monthly, not weekly:**
Folder structure shifts slowly. Weekly reviews would mostly be "no changes proposed" and add noise. Monthly is frequent enough to catch drift, infrequent enough that the review stays fresh when it does propose something.

**Why apply happens in Claude Code, not the container:**
Reorganizing folders is a destructive operation that rewrites links across many pages. Doing it in a direct Claude Code session means Matt can watch each step, interrupt if something looks wrong, and make judgment calls on edge cases. The container path would trade that visibility for convenience, which is a bad trade for this operation.

**Why review and apply are separated:**
Structure changes should never auto-apply. The review is proposal-only so Matt controls both timing and content. Apply is an explicit act, not a consequence of a scheduled run.

**Why "scannability" is the primary criterion:**
Folders exist for sidebar browsing. That's their job. Reviews that optimize for taxonomic neatness or "correct" categorization at the expense of scannability make the wiki harder to use, not easier.

**Why INDEX.md is part of the review:**
INDEX.md mirrors the folder structure — they're two views of the same organization. A review that only looks at folders misses the common case of INDEX drift (sections that no longer match what they contain). Treating them as one surface keeps both in sync.

**Why the folder review scans `unorganized.md`:**
The weekly compiler drops Tier C/D items into `unorganized.md` when no existing page fits. Nothing else reads that file, so items accumulate indefinitely. The monthly folder review is the natural host for cluster detection — it already reads wiki state and emits proposal-only output. Promotion proposals flow through the same apply mechanism as folder reorganizations.
