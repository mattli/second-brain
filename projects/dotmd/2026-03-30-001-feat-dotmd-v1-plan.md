---
title: "feat: Build dotmd V1 — AI Instruction File Tracker"
type: feat
status: active
date: 2026-03-30
origin: projects/dotmd/2026-03-31-dotmd-requirements.md
---

# feat: Build dotmd V1 — AI Instruction File Tracker

## Overview

Build dotmd: a CLI-first open-source tool that tracks changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files) across a developer's Claude Code setup, with a local web dashboard for visualization. Periodic snapshots capture change history for files that live outside git repos. Also serves as the technical foundation for pmtxt.

## Problem Frame

Developers accumulate structured markdown files that control AI behavior, scattered across global config, project directories, and containers. These files are modified by both humans and AI agents, with no visibility into what changed, when, or why. dotmd solves this with a CLI tool for configurable file tracking, periodic snapshots, and session-start notifications, plus an optional web dashboard for visualization. (see origin: projects/dotmd/2026-03-31-dotmd-requirements.md)

## Requirements Trace

- R1. Configurable file patterns and paths to track
- R2. Sensible defaults for Claude Code instruction files
- R3. Periodic snapshots storing diffs in dotmd's own history
- R4. Git history enrichment when available
- R5. Change timeline view with diffs
- R6. Web dashboard showing all tracked files by location/scope
- R7. Individual file view with rendered markdown and change history
- ~~R8. Edit tracked files from the dashboard~~ **Cut from V1**
- R9. Highlight recent changes and unseen modifications
- R10. On session start, display summary of files changed since last session
- R11. Installable via npm with single-command first run
- R12. dotmd init auto-discovers files, shows results, runs first snapshot

## Scope Boundaries

- Not a CLAUDE.md generator — tracks and displays, users edit
- Not a sync tool — no cross-machine replication
- Not a linter — no content validation
- V1 local only — single machine, no cloud

## Key Technical Decisions

- **Standalone repo:** Own open-source project, not in the pmtxt monorepo. Code patterns will be adapted into pmtxt later. Cleaner open-source positioning
- **CLI-first, dashboard-supported:** Core value (scan, diff, track, notify) lives in the CLI. Web dashboard is a visualization layer on the same data store
- **OSS-first:** When a design decision serves open-source users but complicates pmtxt reuse, we choose the OSS user
- **Claude Code first:** V1 targets Claude Code users only. Defaults and docs focus on Claude Code's file structure. Other tools supported via custom config
- **TypeScript + Next.js:** Same stack as pmtxt for maximum reusability. Next.js handles both the dashboard UI and the API routes for file operations
- **Explicit scan roots, not recursive globs from CWD:** Config specifies directories to scan (e.g., `~/.claude`, `~/projects`), not `**/CLAUDE.md` from wherever the shell happens to be. This keeps scans fast and predictable
- **Session-triggered snapshots:** Scan runs on every new terminal/Claude Code session start (via shell hook). Each scan diffs tracked files against the last snapshot and stores changes. Takes milliseconds for a handful of small files
- **SQLite for snapshot storage:** Lightweight, zero-config, portable. Stores file snapshots, diffs, and metadata. Single file at `~/.dotmd/history.db`. Uses WAL mode for safe concurrent access between CLI and dashboard
- **File-based config:** `~/.dotmd/config.yaml` defines scan roots, file patterns, and exclusions. Sensible defaults included on first run

## Open Questions

### Resolved During Planning

- **Snapshot frequency:** Session-triggered scans (new terminal or Claude Code session) plus on-demand via dashboard. No persistent watcher needed
- **Dashboard hosting:** Local Next.js dev server (`dotmd serve`). No Electron/Tauri — keep it simple
- **File discovery approach:** Explicit scan roots (directories to search) + file patterns (what to match) + exclusions (what to skip). Defaults scan `~/.claude` for global config and memory files, plus user-configured project directories for per-project CLAUDE.md files. Users add custom roots and patterns via config
- ~~**Edit mechanism:** Dashboard opens file in the user's configured `$EDITOR` via a local API endpoint, or provides inline editing for quick changes~~ **Resolved: R8 cut from V1 — dashboard is read-only**

### Deferred to Implementation

- Exact SQLite schema for snapshots will emerge during Unit 1
- Shell hook installation mechanism (zshrc append vs. separate sourced file) is an implementation detail
- Dashboard styling and layout details deferred to build time
- Exact heuristics for auto-discovering project directories during init

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
  dotmd init ──> Auto-discover files ──> Save config ──> First snapshot
                                                              │
  Session Start (shell hook)                                  │
       │                                                      v
       v                                              SQLite (~/.dotmd/history.db)
  dotmd scan ──> Read config.yaml (roots + patterns)          │
       │              │                                       │
       v              v                              ┌────────┴────────┐
  Find files in   Load last snapshot                 │                 │
  scan roots           │                             v                 v
       │              v                     CLI commands         dotmd serve
       v         Compare with previous      (status, scan)      (Next.js)
  Read + hash          │                             │                 │
       │              v                             v          ┌──────┼──────┐
       └──> Store snapshot + diff             Terminal          v      v      v
                      │                       summary      File list  File   Timeline
                      v                                   (by scope)  view
              Print change summary (R10)
```

## Implementation Units

- [ ] **Unit 1: Core — config, scanner, storage, and init**

  **Goal:** Create the dotmd repo with CLI, config system, file scanner, SQLite storage, and the `dotmd init` auto-discovery flow. This is the foundation everything else builds on.

  **Requirements:** R1, R2, R3, R4, R11, R12

  **Dependencies:** None

  **Files:**
  - Create: `package.json` (with `bin` field for `dotmd` CLI, npm-publishable)
  - Create: `tsconfig.json`
  - Create: `src/cli/index.ts` (CLI entry point — `dotmd` command via Commander.js)
  - Create: `src/cli/commands/init.ts` (`dotmd init` — auto-discover, configure, first snapshot)
  - Create: `src/cli/commands/scan.ts` (`dotmd scan` — scan tracked files, store changes)
  - Create: `src/cli/commands/status.ts` (`dotmd status` — show tracked files and recent changes)
  - Create: `src/config/loader.ts` (read/parse config.yaml)
  - Create: `src/config/defaults.ts` (default scan roots, patterns, exclusions)
  - Create: `src/scanner/index.ts` (resolve patterns to files, read contents, compute diffs)
  - Create: `src/scanner/git.ts` (enrich with git log when file is in a repo)
  - Create: `src/storage/db.ts` (SQLite setup with WAL mode, migrations)
  - Create: `src/storage/snapshots.ts` (store/retrieve snapshots and diffs)
  - Test: `src/config/__tests__/loader.test.ts`
  - Test: `src/scanner/__tests__/scanner.test.ts`
  - Test: `src/storage/__tests__/snapshots.test.ts`

  **Config format (`~/.dotmd/config.yaml`):**
  ```yaml
  # Directories to scan for instruction files
  scan_roots:
    - ~/.claude                    # Claude Code global config + memory
    - ~/projects                   # Your project directories (add yours)

  # File patterns to match within scan roots
  patterns:
    - CLAUDE.md
    - AGENTS.md
    - memory/*.md

  # Paths to exclude (applied during scan)
  exclude:
    - "**/node_modules/**"
    - "**/.git/**"
    - "**/vendor/**"
    - "**/plugins/**"
    - "**/cache/**"
  ```

  **Default scan roots for Claude Code:**
  - `~/.claude` — global CLAUDE.md and per-project memory files (under `~/.claude/projects/*/memory/`)
  - User-provided project directories — for per-project CLAUDE.md files at project roots

  **`dotmd init` flow (R12):**
  1. Auto-scan `~/.claude` for existing instruction files
  2. Look for git repos under common locations (`~`, `~/Documents`, `~/projects`, `~/Developer`) that contain CLAUDE.md — add their parent dirs as scan roots
  3. Display discovered files grouped by category:
     ```
     Found 8 instruction files:

     ── Claude Code Global ──
       ~/.claude/CLAUDE.md

     ── Claude Code Memory ──
       ~/.claude/projects/…/memory/user_role.md
       ~/.claude/projects/…/memory/feedback_testing.md

     ── Projects ──
       ~/nanoclaw/CLAUDE.md
       ~/second-brain/CLAUDE.md

     ── Projects without CLAUDE.md ──
       ~/other-project  (git repo, no CLAUDE.md)
     ```
  4. Let user confirm, add/remove scan roots, or skip straight to saving
  5. Save config.yaml
  6. Run first snapshot and show results: "Saved initial snapshot of 8 files."

  **`dotmd status` (CLI-first data access):**
  - Show all tracked files grouped by category (like `claudemd-list` style)
  - Show which files have changed since last scan
  - Show projects without CLAUDE.md ("coverage gaps")

  **npm packaging (R11):**
  - `package.json` has `bin: { "dotmd": "./dist/cli/index.js" }` for global install
  - Works with `npm install -g dotmd` and `npx dotmd init`
  - Build script compiles TypeScript before publish

  **Test scenarios:**
  - Happy path: `dotmd init` discovers files, shows them grouped, saves config, runs first snapshot
  - Happy path: `dotmd scan` detects changed files, stores new snapshots + diffs
  - Happy path: File in a git repo — snapshot enriched with git commit info
  - Happy path: `dotmd status` shows tracked files and recent changes
  - Happy path: Config loader reads valid config.yaml and returns typed config
  - Edge case: No instruction files found during init — helpful message, still create config with defaults
  - Edge case: Config file doesn't exist — loader returns defaults, suggests running init
  - Edge case: File that existed in previous scan is now deleted — record deletion event
  - Edge case: Glob pattern matches 0 files — log warning, continue with other patterns
  - Error path: Malformed YAML — clear error message with line number
  - Error path: File exists but not readable — skip with warning
  - Integration: init → modify a file → scan → verify diff captured

  **Verification:**
  - `npx dotmd init` discovers real files on the developer's machine
  - `dotmd scan` correctly detects new, changed, and deleted files
  - `dotmd status` gives a useful overview without needing the web dashboard
  - Git enrichment works without failing when file is not in a git repo
  - Config format is human-readable and easy to edit by hand

---

- [ ] **Unit 2: Session hook and notifications**

  **Goal:** Install a shell hook that runs `dotmd scan` on every new terminal session and displays a summary of what changed (R10).

  **Requirements:** R3, R10

  **Dependencies:** Unit 1

  **Files:**
  - Create: `src/cli/commands/install-hook.ts` (`dotmd install-hook`)
  - Create: `src/hooks/shell-hook.sh` (sourced script that runs scan and shows summary)
  - Test: `src/cli/__tests__/install-hook.test.ts`

  **Approach:**
  - `dotmd install-hook` adds a source line to `~/.zshrc` (or `~/.bashrc`) that runs `dotmd scan` on session start
  - Scan compares against a "last session" timestamp stored in SQLite
  - If files changed since last session, print a per-file summary:
    ```
    dotmd: 3 files changed since last session
      ~/.claude/CLAUDE.md (2h ago) — added 4 lines to ## Global Instructions
      ~/project/CLAUDE.md (yesterday) — removed test coverage section
      ~/.claude/projects/…/memory/user_role.md (3h ago) — new file
    ```
  - If no changes, stay silent
  - Truncate at 5 files: "and 3 more — run `dotmd status` for details"
  - Hook script checks if dotmd is installed and skips silently if not
  - Also supports Claude Code session hooks if the user prefers that

  **Test scenarios:**
  - Happy path: `dotmd install-hook` appends source line to zshrc
  - Happy path: Session start with changes — prints per-file summary with timestamps and one-line diff descriptions
  - Happy path: Session start with no changes — silent
  - Happy path: Session start with 8 changes — shows 5, truncates with "and 3 more"
  - Edge case: Hook already installed — detect and skip, don't duplicate
  - Edge case: First session ever (no last-session marker) — treat as "show all tracked files" or stay silent
  - Edge case: zshrc doesn't exist — create it or suggest alternative
  - Error path: dotmd not in PATH when hook runs — skip silently

  **Verification:**
  - New terminal sessions trigger automatic scan
  - Changed files produce a useful, scannable summary
  - No perceptible delay on session start (< 200ms target)

---

- [ ] **Unit 3: Web dashboard — file list and viewer**

  **Goal:** Build the Next.js web dashboard showing all tracked files with rendered markdown and change history.

  **Requirements:** R6, R7, R9

  **Dependencies:** Unit 1

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

- [ ] **Unit 4: Timeline view**

  **Goal:** Add a global change timeline across all tracked files.

  **Requirements:** R5

  **Dependencies:** Unit 3

  **Files:**
  - Create: `src/app/timeline/page.tsx` (global timeline — all changes across all files)
  - Create: `src/app/api/timeline/route.ts` (API: paginated change history across all files)
  - Create: `src/components/TimelineEntry.tsx` (timeline item with file name, timestamp, diff preview)

  **Approach:**
  - Global timeline shows all changes across all tracked files in reverse chronological order
  - Each entry shows: file name, timestamp, diff preview, git commit info if available
  - Paginated (load more on scroll) to handle long histories

  **Test scenarios:**
  - Happy path: Timeline shows changes from multiple files in correct chronological order
  - Edge case: Timeline with 100+ entries — pagination works, no performance issues
  - Edge case: No changes recorded yet — show helpful empty state

  **Verification:**
  - Timeline provides a complete view of all changes across tracked files

## System-Wide Impact

- **Interaction graph:** CLI commands (scan, serve, init) and web API routes both read/write to the same SQLite database. WAL mode handles concurrent access between shell hook scans and the dashboard server
- **Error propagation:** Scanner errors (unreadable files, missing directories) should be logged but never crash the scan — skip the problem file and continue
- **State lifecycle risks:** SQLite database grows over time with snapshots. Should consider a retention policy in a future version, but V1 can ignore this (small files, low change frequency)
- **Unchanged invariants:** dotmd never modifies tracked files. All operations are read-only

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Glob patterns may match too many files within scan roots | Default exclusions (node_modules, .git, vendor, plugins, cache) in config. Scan roots keep scope bounded |
| Shell hook may slow down terminal startup | Scan is fast (milliseconds for small file sets). Use `--quiet` flag. Benchmark during implementation |
| SQLite in `~/.dotmd/` may conflict with other tools | Unlikely — unique directory name. Document the data location |
| Open-source adoption depends on discoverability | Publish to npm, write a good README, share in Claude Code community channels |

## Sources & References

- **Origin document:** [projects/dotmd/2026-03-31-dotmd-requirements.md](projects/dotmd/2026-03-31-dotmd-requirements.md)
- **pmtxt connection:** dotmd's file discovery, diffing, and dashboard patterns will be adapted into pmtxt Units 1, 2, and 8
- **Related:** pmtxt plan at projects/pmtxt/2026-03-30-001-feat-pmtxt-v1-plan.md
