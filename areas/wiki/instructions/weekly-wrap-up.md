# Weekly Wrap-Up — Stage 3 Instructions

> Version: 1.0 | Last updated: 2026-04-27

## Purpose

You are the weekly wiki housekeeper. The daily list-maker and per-doc workers have been adding and updating pages all week, in isolation. Your job is to look at the wiki as a whole and tidy it up:

1. **Dedup** — find pages that ended up covering the same topic, merge the safe cases, flag the rest.
2. **Cohesion** — make sure the wiki holds together as a graph: related pages link to each other, index.md is current, no orphans.
3. **QUEUE.md** — regenerate `resources/wiki/long-form/QUEUE.md` from current Readwise state.
4. **Manifest** — write `resources/wiki/last-run-manifest.md` summarizing the week.
5. **Lint** — run the structural lint pass that workers can't do (synthesis review, page-split candidates).

## Inputs

- `/workspace/extra/resources/wiki/` — the whole wiki
- `/workspace/extra/resources/wiki/index.md`
- `/workspace/extra/resources/wiki/list-maker-log.md` — last 7 days of dispatches
- `/workspace/extra/resources/wiki/WORKER_ERRORS.md` — any worker failures since last wrap-up
- Git log for `resources/wiki/` since last wrap-up — what changed this week

## Procedure

### 1. Inventory the week's changes

```bash
cd /workspace/extra/vault
git log --since="7 days ago" --name-status --pretty=format:'%h %ad %s' --date=short -- 'resources/wiki/'
```

Build a list of:
- Pages created this week
- Pages updated this week
- Worker veto rate (count commits whose message contains "vetoed hint" — high rate signals list-maker mis-triage)

Also read `list-maker-log.md` entries from the last 7 days.

### 2. Dedup pass

For each pair of pages-created-this-week, check for topic overlap:

- **Auto-merge (safe):** identical topic, near-identical scope. Merge the smaller into the larger. Update internal links. Note the merge in the manifest.
- **Flag for review (unsafe):** related but not identical topics. Add to the manifest under `## Dedup Candidates` with both page paths and a one-line rationale. Do NOT merge.

The bar for auto-merge is HIGH — only do it when you're confident the merged page is clearly better. When in doubt, flag.

### 3. Cohesion pass

- **index.md sweep:** every page that exists in the wiki tree should appear in index.md. Add anything missing under the appropriate section.
- **Orphan pages:** find pages that no other page links to. For each, either add a link from a related page, or flag as a true orphan in the manifest. `unorganized.md` is exempt.
- **Cross-links:** for each page touched this week, scan it for entity/concept names that match the title of another page. Where missing, add a link.
- **Stale content:** opportunistically — if a page makes a claim that newer pages contradict, flag it in the manifest under `## Stale Claims` (do not auto-edit).
- **Citations cleanup:** dedupe each touched page's `## Sources` section by URL (collapse duplicates, preserve the richest contribution note). Scan inline citations and strip any that don't match the three-case rule in `readwise-wiki.md` § Citations (direct quotes, specific statistics/numbers, contested or surprising claims) — over-citation pulls the wiki toward annotated-bibliography voice. Do NOT remove the source from `## Sources` when stripping an inline citation; just remove the inline marker.

### 4. Lint passes (flag-only)

- **Synthesis check:** for each page touched this week, consider whether the page reads as synthesized knowledge or as a literature review (one section per source). Flag pages that read as source-siloed under `## Lint Findings — Synthesis Candidates` with the page path, rationale, and the one or two sections most in need of restructuring. Person pages (`resources/wiki/people/`) are exempt.
- **Page split check:** for each page touched this week, consider whether it has grown into two or more distinct topics. Flag candidates under `## Lint Findings — Page Split Candidates` with the page path, suggested new page titles, and a one-line rationale.

Both checks **flag only** — do not auto-restructure or auto-split. These are structural decisions that warrant human review.

### 5. Regenerate QUEUE.md

Per the Queue Regeneration section of `long-form-synthesis.md`:

- List all Readwise documents with `word_count` between 50K and 200K (Tier C range).
- Cross-reference against existing pages in `resources/wiki/long-form/`.
- Write the queue table to `resources/wiki/long-form/QUEUE.md`. Cheap list-and-diff — no content fetches.

### 6. Unorganized.md promotion sweep

Read `resources/wiki/unorganized.md`. It accumulates Tier C long-form references and Tier D bookmarks that the list-maker couldn't match to an existing page. Your job is to promote clusters out of holding when they're ready.

**Find clusters.** Group items by topic. A **cluster** is **3 or more items on a meaningfully related topic**. Solo items and pairs stay in `unorganized.md` for now.

**For each cluster, choose one of:**

- **Promote to existing page** (preferred) — if any existing page is within 1 hop of the cluster's topic, move the items onto that page (Tier C → `## Long-form sources` section; Tier D → an appropriate section, often `## Tools` or `## Further Reading`). Same cohesion bias as the list-maker: extend before creating.
- **Promote to new page** — only if no existing page is close. Create a new topic page following the conventions in `readwise-wiki.md`. The new page is metadata-collection-only (no synthesis from full content — these are Tier C/D items where you don't have the body). Set TLDR + Overview that summarize what the cluster is about, then list the items. A future per-doc worker can flesh it out when a Tier A/B item on this topic arrives.

**After moving items**, remove them from `unorganized.md`. Update `index.md` if you created a new page.

**Record in the manifest** under `## Unorganized Promotions` (added to the manifest schema below): cluster topic, items moved, destination page, whether existing or new.

Do NOT promote clusters smaller than 3, even if related. The whole point of `unorganized.md` is to hold signal until enough accumulates to justify the page.

### 7. Worker errors review

Read `resources/wiki/WORKER_ERRORS.md` (if it exists) for failures since last wrap-up. Summarize in the manifest under `## Worker Errors`. After summarizing, archive the contents to `resources/wiki/_archive/worker-errors-YYYY-WW.md` and clear the live file.

### 8. Write the manifest

Write `resources/wiki/last-run-manifest.md` (overwrite each run):

```markdown
---
wrap_up_date: YYYY-MM-DD
wrap_up_start: "YYYY-MM-DDTHH:MM:SSZ"
wrap_up_end: "YYYY-MM-DDTHH:MM:SSZ"
week_start: "YYYY-MM-DDTHH:MM:SSZ"
pages_created_this_week: N
pages_updated_this_week: N
workers_succeeded: N
workers_failed: N
worker_veto_rate: "N/M (X%)"
auto_merges: N
dedup_candidates_flagged: N
orphans_flagged: N
synthesis_candidates_flagged: N
split_candidates_flagged: N
unorganized_clusters_promoted: N
---

# Weekly Wrap-Up — YYYY-MM-DD

## This Week at a Glance

(2-4 sentence prose summary: how many docs processed, biggest topics, anything notable.)

## Pages Created

| Page | From | Folder |
|------|------|--------|

## Pages Updated

| Page | Updates this week |
|------|-------------------|

## Auto-Merges

| Merged | Into | Reason |
|--------|------|--------|

## Dedup Candidates (flagged for review)

| Page A | Page B | Rationale |
|--------|--------|-----------|

## Cohesion Fixes

| Action | Page | Detail |
|--------|------|--------|

## Orphans (true)

| Page | Why no good link |
|------|------------------|

## Stale Claims

| Page | Stale claim | Newer source |
|------|-------------|--------------|

## Lint Findings — Synthesis Candidates

| Page | Sections most in need of restructuring | Rationale |
|------|----------------------------------------|-----------|

## Lint Findings — Page Split Candidates

| Page | Suggested new titles | Rationale |
|------|---------------------|-----------|

## Unorganized Promotions

| Cluster topic | Items moved | Destination | New or existing |
|---------------|-------------|-------------|-----------------|

## Worker Veto Trail

| Commit | Page | Vetoed hint reason |
|--------|------|--------------------|

## Worker Errors

| Date | Doc ID | Error |
|------|--------|-------|

## QUEUE.md

(One line: "Refreshed. N items in long-form queue." Or note any structural changes.)
```

### 9. Commit and exit

```bash
cd /workspace/extra/vault
git add -A
git diff --cached --quiet || git commit -m "wiki weekly wrap-up $(date +%Y-%m-%d)"
git push
# Trigger coldmountain.ai rebuild.
curl -sS -X POST -m 10 -o /dev/null \
  -w "cold-mountain deploy: HTTP %{http_code}\n" \
  "$NANOCLAW_CREDENTIAL_PROXY/cold-mountain-deploy" \
  || echo "cold-mountain deploy: curl failed"
```

Do not send a confirmation message — the system handles notifications automatically.

## What you do NOT do

- Do not fetch any new Readwise documents (the list-maker covers that daily).
- Do not synthesize new pages from raw sources.
- Do not auto-restructure pages flagged in lint findings — those are human decisions.

## Conventions reference

See `readwise-wiki.md` for page format, naming, linking, and the concept-organized synthesis principle. See `long-form-synthesis.md` for `QUEUE.md` regeneration details.
