# Wiki Pipeline

Readwise wiki compiler — processes Readwise saves into a persistent, interlinked knowledge base following Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into topic pages that grow over time.

## How It Runs

As of 2026-04-27, the wiki is built by a **three-stage per-doc pipeline** instead of a single weekly compiler. The old monolithic compiler kept dying mid-stream on Anthropic edge 502s during 30–60 min sessions. Splitting into short-lived stages eliminates that failure mode. Plan: [`2026-04-27-per-doc-pipeline-plan.md`](2026-04-27-per-doc-pipeline-plan.md).

Four NanoClaw scheduled tasks now maintain the wiki:

- **Daily list-maker** — runs 1am every night. Reads the wiki INDEX and recently-touched pages, fetches new Readwise saves since `list-maker-log.md`'s last `run_start` (fallback: 7 days), and decides per-item whether to create, update, skip, or hold in `unorganized.md`. For each non-skip decision it dispatches a per-doc worker via the `schedule_task` MCP tool. Bookkeeping only — never synthesizes content itself. Runs on Opus, ~1–2 min.
- **Per-doc workers** — dispatched by the list-maker, run sequentially via GroupQueue immediately after dispatch. Each worker handles exactly one Readwise document: fetches it, follows the dispatch hint (with veto power if the rationale doesn't hold up against the content), writes/updates one wiki page, commits and pushes. ~2–3 min per worker on Opus.
- **Weekly wrap-up** — runs Sunday 11pm. Dedup pass, cohesion linking, index.md refresh, `long-form/QUEUE.md` regen, `unorganized.md` cluster-promotion sweep (3+ items on a topic → promote to existing or new page), worker error summary, and writes `last-run-manifest.md`. Read-mostly over a known set — much shorter session than the old compiler.
- **Monthly structure review** — runs 3am on the 1st of each month. Evaluates folder organization and index.md alignment, writes a proposal to `resources/wiki/folder-review.md`. Proposal-only; never auto-applies.

**On-demand long-form synthesis** — user-triggered via the main Telegram group. Synthesizes a Readwise PDF (50K–200K words) into a dedicated page in `resources/wiki/long-form/`. Unchanged.

## Key Files

| File | Purpose |
|------|---------|
| `instructions/readwise-wiki.md` | Pipeline pointer + shared conventions (page format, linking, paths) |
| `instructions/list-maker.md` | Stage 1 — daily list-maker procedure and dispatch template |
| `instructions/per-doc-worker.md` | Stage 2 — per-doc worker procedure |
| `instructions/weekly-wrap-up.md` | Stage 3 — weekly dedup, cohesion, manifest, unorganized.md sweep |
| `instructions/folder-review.md` | Monthly folder/structure review (review mode + apply mode) |
| `instructions/long-form-synthesis.md` | On-demand long-form synthesis (single-doc + queue regeneration) |
| `instructions/_archive/readwise-wiki-monolithic-2026-04-27.md` | Archived old monolithic compiler instructions |
| `../../resources/wiki/` | Wiki output — all compiled pages live here |
| `../../resources/wiki/index.md` | Topic index with links and one-line summaries |
| `../../resources/wiki/list-maker-log.md` | Most recent list-maker run; `run_start` is the next run's `updated_after` cutoff |
| `../../resources/wiki/last-run-manifest.md` | Latest weekly wrap-up summary |
| `../../resources/wiki/long-form/QUEUE.md` | Pending long-form items (refreshed weekly) |
| `../../resources/wiki/folder-review.md` | Latest structure proposal (refreshed monthly) |
| `../../resources/wiki/unorganized.md` | Tier C/D items the list-maker couldn't place; wrap-up promotes 3+-item clusters |
| `../../resources/wiki/WORKER_ERRORS.md` | Per-doc worker failures; summarized and archived weekly by wrap-up |

## Container Path Mapping

The `readwise-wiki` group has three relevant mounts inside the container:

- `/workspace/extra/wiki/` → `~/second-brain/areas/wiki/` (instructions)
- `/workspace/extra/resources/wiki/` → `~/second-brain/resources/wiki/` (wiki content)
- `/workspace/extra/vault/` → `~/second-brain/` (full vault, used for `git add` / `git commit` / `git push`)

All page paths in stage instructions (e.g. `resources/wiki/index.md`) are written relative to `cd /workspace/extra/vault`.

## NanoClaw Groups

Two NanoClaw groups use the wiki:

- **readwise-wiki** — the compiler agent (list-maker, per-doc workers, wrap-up, folder review). Mounts `areas/wiki/`, `resources/`, and the full vault. Runs on **Opus**.
- **wiki-tutor** — a read-only librarian agent. Mounts `resources/wiki/` read-only. Reads pages, serves nuggets, logs research entries to `research-log.md` for the list-maker to process. Runs on **Opus**.

## Debugging silent worker failures

If the list-maker runs cleanly but no `wiki: update ...` commits land, and `WORKER_ERRORS.md` is empty:

1. **Check `chat_jid` on the wiki cron tasks.** Source of truth is `~/nanoclaw/store/messages.db` (not the 0-byte `nanoclaw.db` in the repo root — that file is a misleading sibling). All `readwise-wiki*` rows must have `chat_jid = task:readwise-wiki`. If they point at `tg:8790860459` instead, MCP `schedule_task` calls from the list-maker fail authorization and get dropped *silently* — NanoClaw is supposed to log `"Unauthorized schedule_task attempt blocked"` but doesn't. Fix: `sqlite3 ~/nanoclaw/store/messages.db "UPDATE scheduled_tasks SET chat_jid='task:readwise-wiki' WHERE group_folder='readwise-wiki'"` then restart NanoClaw with `launchctl kickstart -k gui/$(id -u)/com.nanoclaw`.
2. **Watch for the `"Task created via IPC"` line** in `~/nanoclaw/logs/nanoclaw.log` after the list-maker finishes. If the list-maker container completes but no `Task created via IPC` entries follow, the dispatch is being dropped.
3. **`current_tasks.json` is read-only output.** Editing `~/nanoclaw/data/ipc/<group>/current_tasks.json` does nothing — NanoClaw writes that file as a snapshot for containers to read via MCP. The scheduler reads only from the SQLite DB.

## Manual rewind / replay

The list-maker reads its `updated_after` cutoff from the previous `list-maker-log.md`'s **`run_end`** field. Editing the log to rewind the cutoff is fragile — the LLM in the container has been observed to **override suspiciously-old values** with a "more recent" guess. To force a backlog replay reliably, drop hand-crafted MCP IPC payloads directly into `~/nanoclaw/data/ipc/readwise-wiki/tasks/` (see `session-tasks.md` entry for 2026-05-26 for the payload shape and a working replay script).

## Related

- [Wiki README](../../resources/wiki/README.md) — describes the wiki content, page design, and deferred items
- [Intelligence pipeline](../intelligence/README.md) — the briefing system (separate project)
