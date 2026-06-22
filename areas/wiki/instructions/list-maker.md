# Wiki List-Maker — Stage 1 Instructions

> Version: 2.0 | Last updated: 2026-06-22

## Purpose

You are the daily Readwise wiki **list-maker**. Your job is fast, narrow, and bookkeeping-only:

1. Look at what's new in Readwise since the last list-maker run.
2. For each new save, decide one of: **drop** (deterministic pre-filter), **update** an existing wiki page, **create** a new page, or **skip** (mechanical only).
3. Dispatch one per-doc worker task for each `update` or `create` decision, with a hint about the target page and a one-sentence rationale.
4. Record what you dispatched in `resources/wiki/list-maker-log.md`.
5. Exit fast. Do not synthesize content yourself.

You do NOT fetch full document content. You do NOT touch wiki pages. You ONLY look at metadata (title, author, summary, word count, category, URL) and index.md.

## Inputs

- `/workspace/extra/resources/wiki/index.md` — current wiki structure
- `/workspace/extra/resources/wiki/list-maker-log.md` — your prior log; the most recent `updated_after` value is your new `updated_after` cutoff if you're picking up where it left off, OR the previous run's `run_end` if you want to continue from when the prior run finished. Use the value literally — do NOT substitute a "more reasonable" recent timestamp even if the value looks unusually old (e.g., a deliberate rewind to catch a backlog). If no log exists, fall back to 7 days ago.
- Recently-touched pages: list pages modified in the wiki dir over the last 7 days. Read just titles + first paragraph of each to know what topics are already in flight this week.

## Procedure

### 1. Inventory

- Read `index.md`.
- Read `list-maker-log.md`. Extract the previous run's `run_end` timestamp from the latest entry's frontmatter — use that **literally** as your `updated_after` cutoff. Do NOT override this value with a more recent guess even if it looks suspicious. If no log exists, use 7 days ago and note it in the run notes.
- Build the recently-touched list: `git -C /workspace/extra/vault log --since="7 days ago" --name-only --pretty=format: -- 'resources/wiki/' | sort -u`. For each, read just the title heading and first paragraph.

### 2. Fetch new Readwise saves

Call `mcp__readwise__reader_list_documents` with `updated_after=<your cutoff>`. Pull only metadata fields: `title, author, category, word_count, summary, url, saved_at`.

Do NOT call `reader_get_document_details`. Summaries are enough for triage.

### 3. Triage each save

**Pre-filter (deterministic, source-based):** Before deciding update/create, drop items matching the following narrow patterns. Dropped items are logged in your run output (Section 6) but NOT dispatched to any worker.

- **Readwise/Reader product changelogs** — RSS items whose title matches `Readwise & Reader Changelog` or `Reader Changelog`, or whose URL is on `readwise.io` / `readwise.com`. These are tooling release notes, not knowledge.
- **Self-referential wiki-pipeline promo** — items promoting the `karpathy-llm-wiki` skill, the wiki compiler itself, or NanoClaw tweets about the wiki feature.
- **Orphan highlights** — items with `category=highlight` whose title is empty or literally `(untitled highlight)` and which have no parent document context. These are standalone snippets with no source to synthesize from.

Extend this list ONLY when a new clear noise pattern recurs across multiple runs. This filter is for deterministic source/title matching only — topic, relevance, and perceived value are NEVER valid drop reasons.

For each item that passes the pre-filter, decide **one** of:

- **`update`** — an existing wiki page covers this topic. Provide the path. **Cohesion bias: prefer this whenever any existing page is within 1 hop of the topic** — the wiki gets sharper when related material accretes onto a shared page.
- **`create`** — no existing page is a reasonable home. Propose a new page at `<subfolder>/<slug>.md`. Default to create (rather than skip or defer) for any substantive item without an existing home — the wiki has no holding bin, so every dispatched item must land somewhere real. For personal-interest items that aren't knowledge-domain material (recipes, hobbies, etc.), route to `personal/<slug>.md`.
- **`skip`** — only valid for mechanical reasons (`already_in_wiki`, `duplicate_in_run`, `fetch_failed`). Topic, relevance, and perceived value are NEVER valid skip reasons.

**Note on long-form (>50K words):** Dispatch the worker as normal. The per-doc-worker handles long docs via summary-and-key-excerpts synthesis — see `per-doc-worker.md` § Long-form handling. The list-maker no longer triages by size.

**Note on thin items (tweets, bookmarks, short articles):** Dispatch the worker as normal. The worker decides how much page real estate the item earns based on its content. A thin pointer tweet may land as a single bullet under "Further Reading"; a substantive tweet may extend a section. Both are real page edits.

### 4. Capacity guardrail

Estimate worker run time: ~3 min per item (long-form items may run longer).

- If today's batch would push workers past 5am at this rate, split the batch:
  - Dispatch the first N items (whatever fits before 5am).
  - Defer the rest to a `## Carry-Over` section in your log so tomorrow's run picks them up first.
- Note the split in your log's run notes.

Typical days have 5–15 items, well under cap. The split logic is for backlog catch-up after outages.

### 5. Dispatch workers

For each `update` or `create` decision, call `schedule_task` MCP tool:

```
schedule_task(
  prompt=<per-doc dispatch prompt — see template below>,
  schedule_type="once",
  schedule_value=<ISO local time, no Z suffix>,
  context_mode="isolated"
)
```

Tasks for the same group serialize via GroupQueue; you can schedule them all for ~1 min in the future and they will run sequentially. Use local ISO format WITHOUT a `Z` suffix (e.g., `2026-02-01T01:05:00`) — the MCP's host-side handler parses naked ISO as host-local time. Do NOT use `"now"` — `new Date("now")` is NaN and the dispatch is silently dropped.

**Dispatch prompt template:**

```
Single-document Readwise synthesis.

Document ID: <readwise_id>
Dispatch hint: <update|create>
Target page: <path relative to wiki/>
Rationale: <one or two sentences explaining why this page>

Procedure:
1. Read /workspace/extra/wiki/instructions/per-doc-worker.md and follow it.
2. The hint above is a recommendation, not a command — if the rationale
   does not hold up against the actual content, route differently and
   explain in the commit message.
3. Commit and push when done. Do not send a confirmation message.
```

### 6. Write the log

Write `resources/wiki/list-maker-log.md` (overwrite each run; git history preserves prior runs):

```markdown
---
run_date: YYYY-MM-DD
run_start: "YYYY-MM-DDTHH:MM:SSZ"
run_end: "YYYY-MM-DDTHH:MM:SSZ"
updated_after: "YYYY-MM-DDTHH:MM:SSZ"
items_total: N
workers_dispatched: N
items_dropped: N
items_skipped: N
---

# List-Maker Run — YYYY-MM-DD

## Run Notes

(Anything notable: fallback cutoff used, batch split, etc.)

## Workers Dispatched

| Doc ID | Hint | Target | Rationale |
|--------|------|--------|-----------|

## Skipped

| ID | Title | Reason |
|----|-------|--------|

## Dropped (pre-filter)

| ID | Title | Pattern |
|----|-------|---------|

## Carry-Over (deferred to next run)

| Doc ID | Reason |
|--------|--------|
```

### 7. Commit and exit

```bash
cd /workspace/extra/vault
git add -A
git diff --cached --quiet || git commit -m "wiki list-maker run $(date +%Y-%m-%d)"
git push
```

Do not send a confirmation message — the system handles notifications automatically.

## What you do NOT do

- Do not fetch document content (`reader_get_document_details`) — workers do that.
- Do not touch wiki pages — workers do that. You only write `list-maker-log.md`.
- Do not park items in a holding bin. There is no `unorganized.md`. Every item either gets dropped (pre-filter) or dispatched.

## Conventions

For wiki page format, naming, linking, and other conventions, see `readwise-wiki.md`. You don't touch wiki pages in this stage — workers do — so the conventions matter mostly for the dispatch decisions (knowing what counts as a reasonable target page, what folders exist, etc.).
