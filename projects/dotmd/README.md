# dotmd

CLI-first tool that tracks changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files) across your Claude Code setup, with a local web dashboard for visualization. Periodic snapshots capture change history for files that live outside git repos. Open-source developer tool that also serves as the technical foundation for pmtxt.

## Status

Units 1-4 implemented. Dashboard UX polished: scan-on-page-load, unseen indicators on both files and timeline, Load More pagination, consistent styling. CLI simplified to three public commands (`init`, `status`, `serve`). GitHub README written. Development now happening on MacBook Pro (cloned from GitHub).

## Key Docs

- **[Requirements](2026-03-31-dotmd-requirements.md)** — problem frame, 12 requirements (R1-R12), scope boundaries
- **[V1 Implementation Plan](2026-03-30-001-feat-dotmd-v1-plan.md)** — 4 units, tech decisions, architecture
- **[Requirements Review](2026-03-31-requirements-review.md)** — 6-persona review, 22 findings
- **[Plan Review](2026-03-31-plan-review.md)** — 6-persona review, 12 findings after auto-fixes
- **[Market Validation](last30days-validation.md)** — Reddit/X research on the problem space
- **[How It Works](how-it-works.md)** — technical walkthrough of internals and data flow

## Key Decisions

- **CLI + web dashboard** — CLI for scanning/hooks, web dashboard for setup and browsing
- **OSS-first** — when OSS users and pmtxt reuse conflict, OSS user wins
- **Claude Code first** — V1 targets Claude Code; also detects .cursorrules, .windsurfrules
- **Deep search by default** — patterns use `**/` prefix to find files at any depth
- **Case-insensitive matching** — CLAUDE.md matches claude.md, Claude.md, etc.
- **No git metadata** — dotmd tracks its own snapshots; git info is redundant

## Stack

- TypeScript, Hono (web server), Tailwind CSS via CDN
- SQLite with WAL mode (`~/.dotmd/history.db`)
- Commander.js for CLI, fast-glob for file discovery

## How It Works

1. Run `dotmd init` to set up. It launches a web-based setup wizard where you pick folders and file patterns, preview discovered files, and confirm what to track.
2. Run `dotmd status` to scan tracked files and see what changed recently.
3. Run `dotmd serve` to open a web UI at localhost:3333 where you can browse files and see a timeline of changes. The dashboard rescans on every page load.
4. Settings are managed through the dashboard settings page. Config is stored at `~/.dotmd/config.yaml`.

## Upcoming Features

- **Tests** — no test suite yet; need coverage for scanner, snapshots, and config

## Recent Changes (2026-04-02)

- Open in Editor button — uses `VISUAL`/`EDITOR` env var
- Scanning audit — scan on page load, shell hook debounce, Scan Now button in nav
- Unseen indicators on timeline — yellow dots matching files page
- Load More pagination on timeline and file detail
- CLI simplified — public commands are `init`, `status`, `serve`; `scan` and `install-hook` hidden
- `status` now scans before showing results
- Back-forward cache fix for unseen indicators
- Font/margin consistency across pages
- Trimmed suggested roots and added `SKILL.md` pattern
- GitHub README.md written

### Previous (2026-04-01)

- Settings page — chip-based UI for toggling scan roots/patterns, folder browser, live file preview
- Per-project categorization (`project:<dirname>` instead of flat "project")
- Unseen changes indicator (yellow dot) with `last_viewed_at` tracking
- Collapsible diffs with +/- stats on timeline and file detail pages
- Tree view compression (single-child chains collapsed)
- Default dashboard page changed to timeline
- Scanner auto-cleanup of files no longer on disk or in config
- `dev:serve` script with hot-reload

### Previous (2026-03-31)

- Web-based setup wizard with 3-step flow: pick folders, pick patterns, preview/confirm
- Folder browser in setup wizard for adding custom directories
- Tree view on files page (collapsible, with localStorage persistence)
- Toggle between tree view and category view
- Case-insensitive file matching
- Deep search (`**/` prefix) so patterns match at any depth
- Removed git metadata collection (unnecessary)
- Only suggested patterns that exist on the machine are shown
- Timestamps only show on files that have actually changed

## Related

- **pmtxt** — dotmd's file discovery, diffing, and dashboard are the foundation for pmtxt
