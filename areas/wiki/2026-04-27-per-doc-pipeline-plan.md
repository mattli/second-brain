# Per-Doc Wiki Pipeline — Implementation Plan

> Date: 2026-04-27
> Status: Proposed
> Supersedes: monolithic weekly compiler in `instructions/readwise-wiki.md`

## Background

The weekly readwise-wiki compiler has been failing for at least a week. Every run dies with `API Error: 502 Bad Gateway` — Anthropic's edge dropping mid-stream during long sessions. Switching opus → sonnet didn't help; both models hit the same edge after 30–60 min of streaming.

A test on 2026-04-27 confirmed the fix: dispatch each Readwise save to its own short-lived container. Five Tier A docs processed in 77–303s each, zero failures.

See `~/.claude/projects/-Users-mattli-nanoclaw/memory/` and the credential-proxy section of `nanoclaw/CLAUDE.md` for prior diagnosis.

## Goal

Replace the single monolithic weekly run with a three-stage pipeline:

1. **Daily list-maker** — small triage agent that decides what to do with each new save
2. **Per-doc workers** — one container per save, runs the synthesis
3. **Weekly wrap-up** — housekeeping pass over the week's accumulation

The folder review (monthly) is unchanged.

## Architecture

### Stage 1 — Daily list-maker (cron: `0 1 * * *`, 1am)

A new scheduled task in the `readwise-wiki` group. Runs every night at 1am.

**Job:**
1. Read `resources/wiki/INDEX.md` and a list of pages touched in the last 7 days (so it sees what's already in flight).
2. Fetch new Readwise saves since the last list-maker run (`reader_list_documents` with `updated_after`).
3. For each new save, decide one of:
   - **Update** existing page X (with reason)
   - **Create** new page Y at slug `<subfolder>/<slug>.md` (with reason — usually "≥2 docs in this batch share this topic and no existing page covers it well")
   - **Skip / reference-only** for thin saves (empty bookmarks, very short content)
4. Apply guardrails:
   - Never create a new page when an existing page is within 1 hop of the topic. Cohesion bias is the point.
   - If the batch is large enough that workers would run past 5am at ~3 min each, split across nights and log a note.
5. For each non-skip decision, insert a `once` scheduled task in the `readwise-wiki` group with the per-doc prompt (template in §Implementation).
6. Exit fast. Do not synthesize anything itself.

**Why night:** batch dispatched at 1am. Workers serialize via GroupQueue, finish well before morning for any normal batch size (5–15/day → done by 1:30am).

**Failure surface:** small. Stage 1 only reads summaries/metadata, not full content. Session length ~1–2 min. 502 risk drops to near-zero.

### Stage 2 — Per-doc workers (scheduled: "now" at dispatch, run sequentially)

Already proven by the test run on 2026-04-27. Each worker:

1. Reads `instructions/readwise-wiki.md` only for conventions (page format, linking).
2. Fetches the assigned doc via `mcp__readwise__reader_get_document_details`.
3. Follows the dispatch hint (target page + rationale). Has veto power — can route differently if rationale doesn't hold up against actual content; must note why in the commit message.
4. Writes/updates the wiki page.
5. Updates `INDEX.md` if a new page was created.
6. Commits and pushes the vault.
7. Exits.

**Per-worker duration:** 1–3 min typical (Tier A and Tier B). Tier C (>200K words) still routes to user-invoked long-form synthesis — unchanged.

### Stage 3 — Weekly wrap-up (cron: `0 23 * * 0`, Sunday 11pm)

A new scheduled task. Runs once a week after the week's daily dispatches have all landed.

**Job:**
1. **Dedup pass** — find pages with overlapping topics, propose merges, execute the safe ones, flag ambiguous cases in the manifest.
2. **Cohesion pass** — every page should link to related pages; INDEX.md should list every existing page; no orphans.
3. **QUEUE.md regen** — refresh `resources/wiki/long-form/QUEUE.md` from current Readwise state.
4. **Manifest** — write `resources/wiki/LAST_RUN_MANIFEST.md` summarizing the week: created, updated, skipped, failed, dedup actions.
5. Commit and push.

This is the only stage that needs to hold multi-page context. It runs over a known set (this week's accumulation), not unbounded — much shorter session than the old monolithic compiler.

### Stage 4 — Folder review (cron: `0 3 1 * *`, monthly, **unchanged**)

Existing task `readwise-wiki-folder-review`. No changes.

## Implementation

### New files

- `instructions/list-maker.md` — Stage 1 procedure, decision rubric, dispatch template
- `instructions/per-doc-worker.md` — Stage 2 procedure (codifies the prompt that worked in the 2026-04-27 test)
- `instructions/weekly-wrap-up.md` — Stage 3 procedure (dedup, cohesion, QUEUE regen, manifest)

### Modified files

- `instructions/readwise-wiki.md` — trim to a stub explaining the new pipeline and pointing at the three new instruction files. Keep page-format/linking conventions section since workers reference it.

### Scheduled task changes (in `store/messages.db`)

- **Replace** `readwise-wiki` (current weekly cron `0 3 * * 1,4`) → new daily list-maker task at `0 1 * * *`
- **Add** new weekly wrap-up task at `0 23 * * 0`
- **Leave** `readwise-wiki-folder-review` alone

### Per-doc dispatch prompt template

Stage 1 inserts tasks with this prompt (adapted from the 2026-04-27 test):

```
Single-document Readwise synthesis.

Document ID: <ID>
Dispatch hint: <update|create|skip>
Target page: <path>
Rationale: <one or two sentences>

Procedure:
1. Read /workspace/extra/wiki/instructions/per-doc-worker.md and follow it.
2. The hint above is a recommendation, not a command — if the rationale
   does not hold up against the actual content, route differently and
   explain in the commit message.
3. Commit and push when done. Do not send a confirmation message.
```

### Code changes

None expected. The pipeline is entirely instruction + scheduled-task changes. The existing scheduler, GroupQueue, and per-doc container plumbing already work (proven by the test).

## Migration steps

1. Write the three new instruction files in `~/second-brain/areas/wiki/instructions/`.
2. Trim `readwise-wiki.md` to the new stub.
3. Update the existing `readwise-wiki` scheduled task: change cron to `0 1 * * *`, change prompt to invoke `list-maker.md`.
4. Insert new `readwise-wiki-weekly-wrap-up` task with cron `0 23 * * 0`.
5. Wait one daily cycle, verify dispatch and worker runs land cleanly.
6. Wait one weekly cycle, verify wrap-up dedup/cohesion/manifest output.
7. If both look good, delete the 2026-04-27 single-doc test tasks from `scheduled_tasks` (they're already `completed`, just clutter).

## Open questions

- **Cohesion budget for Stage 1:** how many pages-touched-in-7-days does Stage 1 load as context? Probably just titles + first paragraph. To revisit after first run.
- **Dedup safety:** which dedup actions are "safe" enough for the wrap-up to execute autonomously vs flag for manual review? Probably: identical titles → auto-merge; high-similarity titles → flag. Lock down the rule before first wrap-up runs.
- **Worker veto rate:** if workers frequently overrule Stage 1's hints, that's a signal Stage 1 is mis-triaging. Track this in the manifest.
- **What counts as "this week" for the wrap-up?** Last 7 days of git commits in the wiki dir, or all docs processed since last wrap-up? Latter is more robust to missed weeks.

## Test of the per-doc model (already done)

5 Tier A docs, 2026-04-27 23:11–23:18Z. All succeeded in 77–303s. Zero 502s. Pages created: `music/beatles-early-period.md`, `culture/museum-design-curation.md`, `culture/internet-as-mediating-layer.md`. Two existing pages updated. All commits pushed.
