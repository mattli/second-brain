# Session analyses

Haiku-generated post-session analyses for Voice Tutor study/chat sessions —
topics covered, wiki-vs-general-knowledge split, tool usage, and interaction
quality. One file per session, written fire-and-forget by `bot.py`
(`generate_session_analysis`) when a session runs past
`MIN_ANALYSIS_DURATION_SEC`.

## Layout (current, 2026-07-28)

```
session-analyses/<user_id>/session-analysis-<YYYY-MM-DD-HHMMSS>-<shortid>.md
```

Analyses are nested one level under a per-user directory (e.g. `matt/`,
`sarah/`) as part of the per-user identity + isolation work — the folder is no
longer flat. `README.md` and `_archive/` stay at the top level, outside any
user directory.

Within a user's directory, the filename scheme itself is unchanged from the
2026-07-27 date-first rename:

- **Date-first** (`YYYY-MM-DD-HHMMSS`) from the session's **actual start time**
  (not the write time) — so each user's subfolder sorts chronologically by
  plain filename.
- **`<shortid>`** = the first **8 characters** of the session UUID. It's the join
  key back to:
  - the session's row in `../validation/session-log.jsonl` (match the row whose
    `session_id` starts with the shortid), and
  - the recap artifact at `~/.voice-tutor/artifacts/<full-uuid>.md`.

The name is built by `session_naming.session_analysis_filename()` in the repo;
the app looks a file back up by session id via
`session_naming.find_analysis_path(directory, user_id, session_id)`, which globs
on the shortid within `directory/<user_id>/` (since the exact name isn't
reconstructable from the id alone — it lacks the start time, and now also
requires knowing which user's subdirectory to look in). The writer and reader
share `SHORTID_LEN` so they can't drift.

Existing flat, date-first files (written before 2026-07-28) move into `matt/`
via `migrate_identity.py`'s `plan_analysis_moves()` — a one-time, idempotent,
archive-first migration (originals copied into `_archive/` before any file is
moved). `plan_analysis_moves()` and its move runner were implemented and unit
tested on 2026-07-28; the actual run against this directory happens
separately, with Matt present.

## Legacy generations (left as-is)

Older files predate the current scheme and are **not** renamed — they already
sort correctly and their sessions predate UUID session ids, so they carry no
shortid:

1. **Date-only** — `session-analysis-YYYY-MM-DD.md` (e.g. `2026-04-15`). The
   earliest sessions.
2. **Date+timestamp** — `session-analysis-YYYY-MM-DD-HHMMSS.md` (e.g.
   `2026-04-17-184001`). Pre-UUID sessions with a start timestamp but no id.
3. **Current** — `session-analysis-YYYY-MM-DD-HHMMSS-<shortid>.md`. UUID-era
   sessions (2026-05-13 onward). The 13 original bare-UUID files
   (`session-analysis-<full-uuid>.md`) were migrated into this scheme on
   2026-07-27 using each session's `session_start` from the ledger, or file mtime
   where no ledger row existed.

## Housekeeping

As of 2026-07-28 the folder is nested one level by `<user_id>/` (see Layout,
above) rather than flat — the per-user isolation work required both the writer
(`bot.py`) and the app's `session_naming.find_analysis_path()` to target a
specific user's subdirectory, so this doubled as the reader's move to a
user-scoped (non-recursive) glob. Within each `<user_id>/` directory the
date-first names still make it navigable by date. Revisit further archiving
(into `_archive/YYYY-MM/`) only when a given user's subfolder gets unwieldy
(~30–40+ files).
