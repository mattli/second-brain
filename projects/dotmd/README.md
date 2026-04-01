# dotmd

CLI-first tool that tracks changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files) across your Claude Code setup, with a local web dashboard for visualization. Periodic snapshots capture change history for files that live outside git repos. Open-source developer tool that also serves as the technical foundation for pmtxt.

## Status

Units 1-4 implemented. Web-based setup wizard added (replaces CLI init). Currently iterating on dashboard UX.

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
2. Run `dotmd scan` anytime to check if any tracked files have changed. If they have, it saves the new version and a diff showing what changed.
3. Run `dotmd status` to see which files are being tracked and what changed recently.
4. Run `dotmd install-hook` to add a line to your shell config so that scanning happens automatically every time you open a new terminal.
5. Run `dotmd serve` to open a web UI at localhost:3333 where you can browse files and see a timeline of changes.
6. All config lives at `~/.dotmd/config.yaml` — you can edit it to add/remove directories or change which file patterns to track.

## Upcoming Features

- **Settings page** — reuse the wizard folder/pattern picker as a settings page, pre-populated with current config, so users can add/remove folders and patterns after initial setup
- **Open in editor** — click a file in the dashboard to open it in the user's default text editor
- **File size in files view** — show line count or character count for each tracked file
- **End-of-session scanning** — scan when a Claude Code session ends (not just on terminal open) to capture changes immediately
- **Tests** — no test suite yet; need coverage for scanner, snapshots, and config
- **Frontend architecture** — current inline JS / server-rendered HTML may need to move to a lightweight framework as interactivity grows

## Recent Changes (2026-03-31)

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
