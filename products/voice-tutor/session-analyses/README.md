# Session analyses

Haiku-generated post-session analyses for Voice Tutor study/chat sessions —
topics covered, wiki-vs-general-knowledge split, tool usage, and interaction
quality. One file per session, written fire-and-forget by `bot.py`
(`generate_session_analysis`) when a session runs past
`MIN_ANALYSIS_DURATION_SEC`.

## Naming scheme (current)

```
session-analysis-<YYYY-MM-DD-HHMMSS>-<shortid>.md
```

- **Date-first** (`YYYY-MM-DD-HHMMSS`) from the session's **actual start time**
  (not the write time) — so the folder sorts chronologically by plain filename.
- **`<shortid>`** = the first **8 characters** of the session UUID. It's the join
  key back to:
  - the session's row in `../validation/session-log.jsonl` (match the row whose
    `session_id` starts with the shortid), and
  - the recap artifact at `~/.voice-tutor/artifacts/<full-uuid>.md`.

The name is built by `session_naming.session_analysis_filename()` in the repo;
the app looks a file back up by session id via
`session_naming.find_analysis_path()` (globs on the shortid, since the exact name
isn't reconstructable from the id alone — it lacks the start time). The two share
`SHORTID_LEN` so they can't drift.

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

The folder is kept **flat** — the date-first names make it navigable by date, and
both the writer (`bot.py`) and the app read this directory by name, so subfolders
would need the reader switched to a recursive glob. Revisit archiving (into
`_archive/YYYY-MM/`) only when the flat list gets unwieldy (~30–40+ files).
