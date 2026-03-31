---
title: "feat: Build dotmd V1 — AI Instruction File Tracker"
type: feat
status: active
date: 2026-03-30
origin: projects/dotmd/2026-03-30-dotmd-requirements.md
---

# feat: Build dotmd V1 — AI Instruction File Tracker

## Overview

Build dotmd: an open-source web dashboard that tracks changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files, skill configs, etc.) across a developer's entire setup. Periodic snapshots capture change history for files that live outside git repos. Also serves as the technical foundation for pmtxt.

## Problem Frame

Developers accumulate structured markdown files that control AI behavior, scattered across global config, project directories, and containers. These files are modified by both humans and AI agents, with no visibility into what changed, when, or why. dotmd solves this with configurable file tracking, periodic snapshots, and a web dashboard. (see origin: projects/dotmd/2026-03-30-dotmd-requirements.md)

## Requirements Trace

- R1. Configurable file patterns and paths to track
- R2. Sensible defaults for common AI instruction files
- R3. Periodic snapshots storing diffs in dotmd's own history
- R4. Git history enrichment when available
- R5. Change timeline view with diffs
- R6. Web dashboard showing all tracked files by location/scope
- R7. Individual file view with rendered markdown and change history
- R8. Edit tracked files from the dashboard
- R9. Highlight recent changes and unseen modifications

## Scope Boundaries

- Not a CLAUDE.md generator — tracks and displays, users edit
- Not a sync tool — no cross-machine replication
- Not a linter — no content validation
- V1 local only — single machine, no cloud

## Key Technical Decisions

- **Standalone repo:** Own open-source project, not in the pmtxt monorepo. Code patterns will be adapted into pmtxt later. Cleaner open-source positioning
- **TypeScript + Next.js:** Same stack as pmtxt for maximum reusability. Next.js handles both the dashboard UI and the API routes for file operations
- **Session-triggered snapshots:** Scan runs on every new terminal/Claude Code session start (via shell hook or Claude Code session hook). Each scan diffs tracked files against the last snapshot and stores changes. Takes milliseconds for a handful of small files
- **SQLite for snapshot storage:** Lightweight, zero-config, portable. Stores file snapshots, diffs, and metadata. Single file at `~/.dotmd/history.db`
- **File-based config:** `~/.dotmd/config.yaml` defines which file patterns to track. Sensible defaults included on first run

## Open Questions

### Resolved During Planning

- **Snapshot frequency:** Session-triggered scans (new terminal or Claude Code session) plus on-demand via dashboard. No persistent watcher needed
- **Dashboard hosting:** Local Next.js dev server (`dotmd serve`). No Electron/Tauri — keep it simple
- **Default file patterns:** `~/.claude/CLAUDE.md`, `~/.claude/projects/*/CLAUDE.md`, `~/.claude/projects/*/memory/**/*.md`, `**/CLAUDE.md`, `**/AGENTS.md`. User adds custom patterns via config
- **Edit mechanism:** Dashboard opens file in the user's configured `$EDITOR` via a local API endpoint, or provides inline editing for quick changes

### Deferred to Implementation

- Exact SQLite schema for snapshots will emerge during Unit 2
- Shell hook installation mechanism (zshrc append vs. separate sourced file) is an implementation detail
- Dashboard styling and layout details deferred to build time

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
  Session Start (shell hook)
       │
       v
  dotmd scan ──> Read config.yaml (tracked patterns)
       │              │
       v              v
  Glob for files  Load last snapshot from SQLite
       │              │
       v              v
  Read current    Compare with previous
  file contents        │
       │              v
       └──> Store new snapshot + diff if changed
                      │
                      v
              SQLite (~/.dotmd/history.db)
                      │
                      v
              dotmd serve (Next.js)
                      │
       ┌──────────────┼──────────────┐
       v              v              v
  File list      File viewer     Timeline
  (by scope)     (markdown +     (diffs by
                  history)        date)
```

## Implementation Units

- [ ] **Unit 1: Project scaffolding and config system**

  **Goal:** Create the dotmd repo with Next.js, the CLI entry point, and the config file system.

  **Requirements:** R1, R2

  **Dependencies:** None

  **Files:**
  - Create: `package.json`
  - Create: `tsconfig.json`
  - Create: `src/cli/index.ts` (CLI entry point — `dotmd` command)
  - Create: `src/cli/commands/init.ts` (`dotmd init` — create default config)
  - Create: `src/config/loader.ts` (read/parse config.yaml)
  - Create: `src/config/defaults.ts` (default file patterns)
  - Test: `src/config/__tests__/loader.test.ts`

  **Approach:**
  - CLI uses a lightweight command router (Commander.js or similar — no Ink needed, this isn't a chat tool)
  - `dotmd init` creates `~/.dotmd/config.yaml` with default patterns
  - Config format: list of glob patterns with optional labels (e.g., "Global Claude.md", "Project instructions")
  - Default patterns cover: `~/.claude/CLAUDE.md`, `~/.claude/projects/*/CLAUDE.md`, `~/.claude/projects/*/memory/**/*.md`, `**/CLAUDE.md`, `**/AGENTS.md`

  **Test scenarios:**
  - Happy path: `dotmd init` creates config.yaml with all default patterns
  - Happy path: Config loader reads a valid config.yaml and returns typed pattern list
  - Edge case: Config file doesn't exist — loader returns defaults and suggests running init
  - Edge case: Config with empty patterns list — warn user, use defaults
  - Error path: Malformed YAML — clear error message with line number

  **Verification:**
  - `dotmd init` creates a valid, human-readable config file
  - Config loader handles missing, empty, and malformed configs gracefully

---

- [ ] **Unit 2: Scanner and snapshot storage**

  **Goal:** Implement file scanning (glob resolution, content reading) and SQLite-based snapshot storage with diffing.

  **Requirements:** R3, R4

  **Dependencies:** Unit 1

  **Files:**
  - Create: `src/scanner/glob.ts` (resolve configured patterns to actual file paths)
  - Create: `src/scanner/reader.ts` (read file contents and metadata)
  - Create: `src/scanner/differ.ts` (compute diffs between snapshots)
  - Create: `src/storage/db.ts` (SQLite setup and migrations)
  - Create: `src/storage/snapshots.ts` (store/retrieve snapshots and diffs)
  - Create: `src/scanner/git.ts` (enrich with git log when file is in a repo)
  - Create: `src/cli/commands/scan.ts` (`dotmd scan` command)
  - Test: `src/scanner/__tests__/glob.test.ts`
  - Test: `src/scanner/__tests__/differ.test.ts`
  - Test: `src/storage/__tests__/snapshots.test.ts`

  **Approach:**
  - Scanner resolves glob patterns from config, expanding `~` and `**`
  - For each resolved file: read content, compute hash, check against last snapshot
  - If content changed: store new snapshot with timestamp, compute and store diff
  - If file is inside a git repo: run `git log -1` on the file to get last commit info (author, message, date) and attach to snapshot
  - SQLite database at `~/.dotmd/history.db` with tables for files, snapshots, and diffs
  - `dotmd scan` runs this process and reports what changed

  **Test scenarios:**
  - Happy path: Scan finds 3 tracked files, all unchanged — no new snapshots created
  - Happy path: Scan finds a file that changed since last snapshot — new snapshot + diff stored
  - Happy path: File in a git repo — snapshot enriched with git commit info
  - Happy path: First scan ever (empty DB) — creates initial snapshots for all tracked files
  - Edge case: Glob pattern matches 0 files — log warning, continue with other patterns
  - Edge case: File that existed in previous scan is now deleted — record deletion event
  - Edge case: File is a symlink — resolve and track the real path
  - Error path: File exists but is not readable (permissions) — skip with warning
  - Integration: Scan → modify a file → scan again → verify diff captures the change

  **Verification:**
  - `dotmd scan` correctly detects new, changed, and deleted files
  - Diffs are human-readable and accurate
  - Git enrichment works without failing when file is not in a git repo

---

- [ ] **Unit 3: Session hook**

  **Goal:** Install a shell hook that runs `dotmd scan` on every new terminal session start.

  **Requirements:** R3

  **Dependencies:** Unit 2

  **Files:**
  - Create: `src/cli/commands/install-hook.ts` (`dotmd install-hook`)
  - Create: `src/hooks/shell-hook.sh` (sourced script that runs scan)
  - Test: `src/cli/__tests__/install-hook.test.ts`

  **Approach:**
  - `dotmd install-hook` adds a source line to `~/.zshrc` (or `~/.bashrc`) that runs `dotmd scan --quiet` on session start
  - `--quiet` flag suppresses output unless something changed
  - The hook script checks if dotmd is installed and skips silently if not
  - Also supports Claude Code session hooks if the user prefers that

  **Test scenarios:**
  - Happy path: `dotmd install-hook` appends source line to zshrc — verified by reading the file
  - Happy path: Shell hook runs `dotmd scan --quiet` — no output when nothing changed
  - Happy path: Shell hook reports "2 files changed" when changes detected
  - Edge case: Hook already installed — detect and skip, don't duplicate
  - Edge case: zshrc doesn't exist — create it or suggest alternative
  - Error path: dotmd not in PATH when hook runs — skip silently

  **Verification:**
  - New terminal sessions trigger an automatic scan
  - No perceptible delay on session start

---

- [ ] **Unit 4: Web dashboard — file list and viewer**

  **Goal:** Build the Next.js web dashboard showing all tracked files with rendered markdown and change history.

  **Requirements:** R6, R7, R9

  **Dependencies:** Unit 2

  **Files:**
  - Create: `src/app/page.tsx` (dashboard home — file list grouped by scope)
  - Create: `src/app/files/[id]/page.tsx` (individual file view with markdown + history)
  - Create: `src/app/api/files/route.ts` (API: list tracked files with status)
  - Create: `src/app/api/files/[id]/route.ts` (API: file content + snapshot history)
  - Create: `src/app/api/scan/route.ts` (API: trigger a scan from the dashboard)
  - Create: `src/components/FileCard.tsx` (file summary card with change indicator)
  - Create: `src/components/MarkdownRenderer.tsx` (render markdown with styling)
  - Create: `src/components/DiffView.tsx` (render snapshot diffs)
  - Create: `src/cli/commands/serve.ts` (`dotmd serve` — start the dashboard)

  **Approach:**
  - Dashboard triggers a scan on page load via the scan API endpoint
  - File list grouped by scope (Global, Project, Memory, Custom) based on file path
  - Each file card shows: file name, path, last modified, change indicator if modified since last view
  - File detail page: rendered markdown at top, change timeline below with expandable diffs
  - Change indicator (R9): track last-viewed timestamp per file in SQLite, highlight files changed since
  - `dotmd serve` starts Next.js on a local port (default 3333)

  **Patterns to follow:**
  - Next.js App Router with server components
  - Tailwind CSS for styling

  **Test scenarios:**
  - Happy path: Dashboard loads and shows all tracked files grouped by scope
  - Happy path: File detail page renders markdown correctly and shows change history
  - Happy path: Files modified since last dashboard visit show a change indicator
  - Happy path: Scan triggered on page load captures any changes since last scan
  - Edge case: No tracked files found — show helpful setup instructions
  - Edge case: File with no change history (just initialized) — show current content, no timeline
  - Error path: SQLite database doesn't exist — show "Run dotmd init first" message

  **Verification:**
  - Dashboard displays all tracked files with accurate metadata
  - Change timeline shows correct diffs with timestamps
  - Modified-since-last-view indicator works

---

- [ ] **Unit 5: Timeline view and file editing**

  **Goal:** Add a global change timeline across all tracked files and the ability to edit files from the dashboard.

  **Requirements:** R5, R8

  **Dependencies:** Unit 4

  **Files:**
  - Create: `src/app/timeline/page.tsx` (global timeline — all changes across all files)
  - Create: `src/app/api/timeline/route.ts` (API: paginated change history across all files)
  - Create: `src/app/api/files/[id]/edit/route.ts` (API: write file content)
  - Create: `src/components/TimelineEntry.tsx` (timeline item with file name, timestamp, diff preview)
  - Create: `src/components/InlineEditor.tsx` (textarea-based markdown editor)

  **Approach:**
  - Global timeline shows all changes across all tracked files in reverse chronological order
  - Each entry shows: file name, timestamp, diff preview, git commit info if available
  - Paginated (load more on scroll) to handle long histories
  - File editing: inline textarea editor on the file detail page with save button
  - Save writes directly to the file on disk via API route, then triggers a new scan to capture the snapshot
  - Also offer "Open in editor" button that runs `$EDITOR <filepath>` via a local API endpoint

  **Test scenarios:**
  - Happy path: Timeline shows changes from multiple files in correct chronological order
  - Happy path: Edit a file inline — save writes to disk, new snapshot captured
  - Happy path: "Open in editor" launches $EDITOR with the correct file path
  - Edge case: Timeline with 100+ entries — pagination works, no performance issues
  - Edge case: Edit a file that was deleted since page load — clear error message
  - Error path: File write fails (permissions) — error message, no snapshot created
  - Integration: Edit file in dashboard → change appears in timeline immediately

  **Verification:**
  - Timeline provides a complete view of all changes across tracked files
  - Editing from the dashboard works end-to-end and is captured in history

## System-Wide Impact

- **Interaction graph:** CLI commands (scan, serve, init) and web API routes both read/write to the same SQLite database. No concurrency issues expected since only one user on one machine
- **Error propagation:** Scanner errors (unreadable files, missing directories) should be logged but never crash the scan — skip the problem file and continue
- **State lifecycle risks:** SQLite database grows over time with snapshots. Should consider a retention policy in a future version, but V1 can ignore this (small files, low change frequency)
- **Unchanged invariants:** dotmd never modifies tracked files except through explicit user-initiated edits (R8). Scanning is read-only

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Glob patterns may match too many files (e.g., `**/CLAUDE.md` in a node_modules tree) | Add default exclusions (node_modules, .git, vendor) and document how to tune patterns |
| Shell hook may slow down terminal startup | Scan is fast (milliseconds for small file sets). Use `--quiet` flag. Benchmark during implementation |
| SQLite in `~/.dotmd/` may conflict with other tools | Unlikely — unique directory name. Document the data location |
| Open-source adoption depends on discoverability | Publish to npm, write a good README, share in Claude Code community channels |

## Sources & References

- **Origin document:** [projects/dotmd/2026-03-30-dotmd-requirements.md](projects/dotmd/2026-03-30-dotmd-requirements.md)
- **pmtxt connection:** dotmd's file discovery, diffing, and dashboard patterns will be adapted into pmtxt Units 1, 2, and 8
- **Related:** pmtxt plan at projects/pmtxt/2026-03-30-001-feat-pmtxt-v1-plan.md
