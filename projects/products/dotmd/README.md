# dotmd

CLI-first tool that tracks changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files) across your Claude Code setup, with a local web dashboard for visualization. Periodic snapshots capture change history for files that live outside git repos. Open-source developer tool that also serves as the technical foundation for pmtxt.

## Status

**Launched.** Published to npm as `@mattli/dotmd` (v0.1.6). GitHub repo public. First launch post submitted to r/ClaudeAI (pending mod approval). Fresh install tested on Mac Mini.

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

## Upcoming

- Post to X, r/VibeCodersNest, r/GithubCopilot based on r/ClaudeAI reception
- Show HN if Reddit traction is strong
- MCP server (from marketing plan — zero-CAC discovery channel)

## Recent Changes (2026-04-03)

- Merged 3-step wizard into single-page setup (shared with settings)
- Folder browser with Add/Remove per row, grayed-out covered subfolders
- Pattern chips with X buttons, restorable suggestions
- Subdirectory grouping in file preview
- Help page, section dividers, right-aligned save
- Auto-open browser on serve/init, friendly port-in-use message
- Open in Editor error handling, 24-hour status window
- Dashboard screenshot in README, amber refresh button
- Published v0.1.1–v0.1.6, GitHub repo public

### Previous (2026-04-02)

- Open in Editor, scanning audit, unseen indicators on timeline
- Load More pagination, CLI cleanup, GitHub README
- Test suite (44 tests), published to npm as `@mattli/dotmd@0.1.0`

### Previous (2026-04-01)

- Settings page, per-project categorization, unseen changes indicator
- Collapsible diffs, tree view, scanner auto-cleanup

### Previous (2026-03-31)

- Web-based setup wizard, folder browser, tree view, case-insensitive matching

## Related

- **pmtxt** — dotmd's file discovery, diffing, and dashboard are the foundation for pmtxt
