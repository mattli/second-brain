# Wiki Pipeline

Readwise wiki compiler — processes Readwise saves into a persistent, interlinked knowledge base following Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into topic pages that grow over time.

## How It Runs

As of 2026-06-22, the wiki is built by a **two-stage pipeline**. Earlier iterations had a weekly wrap-up, monthly folder review, and on-demand long-form synthesis; those stages produced signal that wasn't being consumed and have been collapsed out. Structural changes (page splits, folder reorgs, dedup) happen ad-hoc in Claude Code sessions, not on a schedule.

Two NanoClaw scheduled tasks now maintain the wiki:

- **Daily list-maker** — runs 1am every night. Reads the wiki `index.md` and recently-touched pages, fetches new Readwise saves since `list-maker-log.md`'s `run_end` (fallback: 7 days), and decides per-item whether to drop (deterministic pre-filter), update an existing page, or create a new one. Dispatches a per-doc worker for every update/create via the `schedule_task` MCP tool. Bookkeeping only — never synthesizes content itself. Runs on Opus, ~1–2 min.
- **Per-doc workers** — dispatched by the list-maker, run sequentially via GroupQueue immediately after dispatch. Each worker handles exactly one Readwise document: fetches it, follows the dispatch hint (with veto power if the rationale doesn't hold up), writes/updates one wiki page, updates `index.md` if creating a new page, adds cross-links, commits and pushes. ~2–3 min per worker on Opus.

There is no holding bin. Every save that passes the pre-filter lands in a real wiki page.

## Key Files

| File | Purpose |
|------|---------|
| `instructions/readwise-wiki.md` | Pipeline pointer + shared conventions (page format, linking, paths) |
| `instructions/list-maker.md` | Stage 1 — daily list-maker procedure and dispatch template |
| `instructions/per-doc-worker.md` | Stage 2 — per-doc worker procedure |
| `instructions/_archive/` | Archived stage instructions (weekly-wrap-up, folder-review, long-form-synthesis) and the monolithic compiler |
| `../../resources/wiki/` | Wiki output — all compiled pages live here |
| `../../resources/wiki/index.md` | Topic index with links and one-line summaries |
| `../../resources/wiki/list-maker-log.md` | Most recent list-maker run; `run_end` is the next run's `updated_after` cutoff |
| `../../resources/wiki/WORKER_ERRORS.md` | Per-doc worker failures (append-only; clean manually when noisy) |
| `../../resources/wiki/_archive/` | Archived wiki content and prior pipeline artifacts |

## Container Path Mapping

The `readwise-wiki` group has three relevant mounts inside the container:

- `/workspace/extra/wiki/` → `~/second-brain/areas/wiki/` (instructions)
- `/workspace/extra/resources/wiki/` → `~/second-brain/resources/wiki/` (wiki content)
- `/workspace/extra/vault/` → `~/second-brain/` (full vault, used for `git add` / `git commit` / `git push`)

All page paths in stage instructions (e.g. `resources/wiki/index.md`) are written relative to `cd /workspace/extra/vault`.

## NanoClaw Groups

Two NanoClaw groups use the wiki:

- **readwise-wiki** — the compiler agent (list-maker + per-doc workers). Mounts `areas/wiki/`, `resources/`, and the full vault. Runs on **Opus**.
- **wiki-tutor** — a read-only librarian agent. Mounts `resources/wiki/` read-only. Reads pages, serves nuggets, logs research entries to `research-log.md` for the list-maker to process. Runs on **Opus**.

## Debugging silent worker failures

If the list-maker runs cleanly but no `wiki: update ...` commits land, and `WORKER_ERRORS.md` is empty:

1. **Check `chat_jid` on the wiki cron tasks.** Source of truth is `~/nanoclaw/store/messages.db` (not the 0-byte `nanoclaw.db` in the repo root — that file is a misleading sibling). The `readwise-wiki` row must have `chat_jid = task:readwise-wiki`. If it points at `tg:8790860459` instead, MCP `schedule_task` calls from the list-maker fail authorization and get dropped *silently* — NanoClaw is supposed to log `"Unauthorized schedule_task attempt blocked"` but doesn't. Fix: `sqlite3 ~/nanoclaw/store/messages.db "UPDATE scheduled_tasks SET chat_jid='task:readwise-wiki' WHERE group_folder='readwise-wiki'"` then restart NanoClaw with `launchctl kickstart -k gui/$(id -u)/com.nanoclaw`.
2. **Watch for the `"Task created via IPC"` line** in `~/nanoclaw/logs/nanoclaw.log` after the list-maker finishes. If the list-maker container completes but no `Task created via IPC` entries follow, the dispatch is being dropped.
3. **`current_tasks.json` is read-only output.** Editing `~/nanoclaw/data/ipc/<group>/current_tasks.json` does nothing — NanoClaw writes that file as a snapshot for containers to read via MCP. The scheduler reads only from the SQLite DB.

## Done-ping notifications (the 1am chime)

The `📚 Wiki list-maker (daily): ✅ done` Telegram ping is emitted by NanoClaw's scheduler (`task-scheduler.ts:303`), not the agent. The scheduler sends `${display_name}: ✅ done` to `task.chat_jid` after a non-main task completes successfully. Setting `chat_jid = task:readwise-wiki` (required for worker dispatch — see above) used to silently drop this ping because Telegram only owns `tg:` jids; the warn went to `logs/nanoclaw.error.log` and was easy to miss.

Fixed 2026-06-02 (NanoClaw commit `1116d2d`): pseudo-prefix jids (`task:`, `internal:`) now fall back to the registered main group's jid at send time, and the ping requires `task.display_name` so internal worker tasks stay silent. The `readwise-wiki` task has a display_name set and routes to telegram_main via the fallback. No DB change needed — `chat_jid` stays at `task:readwise-wiki`.

**If the 1am ping stops arriving again,** check:
1. `grep -E "Telegram message sent" ~/nanoclaw/logs/nanoclaw.log` right after the list-maker's `Task completed` line — should see a send to `tg:8790860459` length ~34.
2. `grep "No channel owns JID" ~/nanoclaw/logs/nanoclaw.error.log` — if firing, the fallback didn't kick in (means main group registration is wrong or the registered_groups row's `is_main` flag is 0).
3. `sqlite3 ~/nanoclaw/store/messages.db "SELECT display_name FROM scheduled_tasks WHERE id='readwise-wiki'"` — must be non-empty under the new gate.

## Manual rewind / replay

The list-maker reads its `updated_after` cutoff from the previous `list-maker-log.md`'s **`run_end`** field. Editing the log to rewind the cutoff is fragile — the LLM in the container has been observed to **override suspiciously-old values** with a "more recent" guess. To force a backlog replay reliably, drop hand-crafted MCP IPC payloads directly into `~/nanoclaw/data/ipc/readwise-wiki/tasks/` (see `session-tasks.md` entry for 2026-05-26 for the payload shape and a working replay script).

## Related

- [Wiki README](../../resources/wiki/README.md) — describes the wiki content and philosophy
- [Intelligence pipeline](../intelligence/README.md) — the briefing system (separate project)
