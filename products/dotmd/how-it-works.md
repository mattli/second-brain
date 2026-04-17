# dotmd — How It Works

Technical walkthrough of dotmd's internals: what happens at each step, how data flows, and the key design decisions.

## Architecture Overview

dotmd is a TypeScript CLI tool built with Commander.js. It discovers AI instruction files on disk, snapshots their contents into a local SQLite database, and provides both CLI and web interfaces to view change history.

```
~/.dotmd/
  config.yaml      # scan roots, glob patterns, exclusions
  history.db       # SQLite database (WAL mode)

src/
  cli/             # Commander.js CLI entry point + subcommands
  config/          # YAML config loading/saving, defaults
  scanner/         # file discovery (fast-glob) + git metadata
  storage/         # SQLite schema, snapshot logic, session tracking
  dashboard/       # Hono web server + server-rendered HTML views
```

## Data Model

Three SQLite tables:

- **`tracked_files`** — one row per unique file path. Stores category (`global`, `memory`, `project`, `custom`), `first_seen_at`, `last_seen_at`.
- **`snapshots`** — one row per version of a file. Stores full content, SHA-256 content hash, unified diff from previous version, git commit/author/message, and timestamp.
- **`sessions`** — one timestamp per terminal session, used for "what changed since last session" queries.

## Step-by-Step Flows

### `dotmd init`

1. Scans well-known directories (`~/Documents`, `~/projects`, `~/development`, `~/code`, `~/Developer`, `~/src`, `~/workspace`) for subdirectories containing `CLAUDE.md` or `AGENTS.md`.
2. Combines discovered project roots with the default `~/.claude` root.
3. Uses `fast-glob` to match files against configured patterns (`CLAUDE.md`, `AGENTS.md`, `memory/*.md`) while excluding `node_modules`, `.git`, `vendor`, `plugins`, `cache`.
4. Categorizes each file by path: `~/.claude/projects/*/memory/` -> memory, `~/.claude/` -> global, repo-level `CLAUDE.md`/`AGENTS.md` -> project, everything else -> custom.
5. Saves the assembled config to `~/.dotmd/config.yaml`.
6. Creates the SQLite database at `~/.dotmd/history.db` (auto-migrates schema).
7. Takes an initial snapshot of every discovered file — reads content, hashes it, stores in the `snapshots` table with no diff (first version).

### `dotmd scan`

1. Loads config from `~/.dotmd/config.yaml`.
2. Re-discovers files using the same glob logic (picks up new files, ignores deleted ones).
3. For each file:
   - Reads current content and computes SHA-256 hash.
   - Upserts into `tracked_files` (updates `last_seen_at`).
   - Fetches the latest snapshot from the DB.
   - **Hash matches** -> no change, skip.
   - **Hash differs** -> generates unified diff via the `diff` library, stores new snapshot with diff + content + git metadata.
   - **New file** -> stores as initial snapshot (no diff).
4. Also fetches git metadata for each file: runs `git log -1` to get the last commit hash, author, and message that touched the file.

### `dotmd scan --session`

1. Queries the *second-most-recent* row in `sessions` to find when the previous session started.
2. Inserts a new session row (marks "now" as session start).
3. Runs the normal scan.
4. Queries `snapshots` for all changes created after the previous session timestamp.
5. Prints a compact summary (up to 5 files with line-change counts). Silent if nothing changed.

### `dotmd install-hook`

1. Detects shell from `$SHELL` env var (defaults to zsh).
2. Checks if the hook marker (`# dotmd shell hook`) already exists in `~/.zshrc` or `~/.bashrc`.
3. If not present, appends:
   ```sh
   # dotmd shell hook
   if command -v dotmd &> /dev/null; then dotmd scan --session --quiet 2>/dev/null; fi
   ```
4. Every new terminal session silently runs a session-aware scan.

### `dotmd status`

1. Reads all tracked files from the DB, grouped by category.
2. Displays them in order: Claude Code Global, Claude Code Memory, Projects, Other.
3. Shows the 5 most recent changes with timestamps.

### `dotmd serve`

1. Runs a full scan on startup to ensure data is fresh.
2. Starts a Hono HTTP server on port 3333 (configurable via `--port`).
3. Serves server-rendered HTML pages styled with Tailwind CSS:
   - **`/`** — File list grouped by category with blue dot indicators for recently changed files.
   - **`/files/:id`** — File detail view: current content + full change history with color-coded diffs (green = added, red = removed).
   - **`/timeline`** — Chronological feed of all changes across all tracked files (truncated diffs, up to 100 entries).
4. Also exposes JSON API endpoints:
   - `GET /api/files` — list all tracked files
   - `GET /api/files/:id` — file detail with snapshots
   - `GET /api/timeline?limit=N` — recent changes
   - `POST /api/scan` — trigger a scan, returns `{ scanned, changed }`

## Key Design Decisions

- **Content-addressed snapshots** — only stores a new snapshot when the SHA-256 hash changes. Repeated scans are essentially free.
- **SQLite with WAL mode** — fast concurrent reads, safe for shell hooks running in background while the dashboard is open.
- **Git-aware** — each snapshot records which git commit last touched the file, giving provenance without manual `git log` digging.
- **Path-based categorization** — no manual tagging; category is derived from the file's location on disk.
- **Full content + diff stored** — every snapshot stores the complete file content (not just the diff), so you can always read any historical version directly.
- **Config is explicit** — scan roots are listed in `config.yaml`, not inferred at runtime. `init` auto-discovers once, then you own the config.
