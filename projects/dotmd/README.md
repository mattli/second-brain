# dotmd

CLI-first tool that tracks changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files) across your Claude Code setup, with a local web dashboard for visualization. Periodic snapshots capture change history for files that live outside git repos. Open-source developer tool that also serves as the technical foundation for pmtxt.

## Status

Planning reviewed and updated. Ready to implement. Next step: build Unit 1 (core).

## Key Docs

- **[Requirements](2026-03-31-dotmd-requirements.md)** — problem frame, 12 requirements (R1-R12), scope boundaries
- **[V1 Implementation Plan](2026-03-30-001-feat-dotmd-v1-plan.md)** — 4 units, tech decisions, architecture
- **[Requirements Review](2026-03-31-requirements-review.md)** — 6-persona review, 22 findings
- **[Plan Review](2026-03-31-plan-review.md)** — 6-persona review, 12 findings after auto-fixes
- **[Market Validation](last30days-validation.md)** — Reddit/X research on the problem space
- **[How It Works](how-it-works.md)** — technical walkthrough of internals and data flow

## Key Decisions

- **CLI-first, dashboard-supported** — core value in CLI, web dashboard is optional visualization
- **OSS-first** — when OSS users and pmtxt reuse conflict, OSS user wins
- **Claude Code first** — V1 targets Claude Code only; other tools via custom config
- **Explicit scan roots** — config specifies directories to scan, not `**/` from CWD

## Stack

- TypeScript, Next.js (App Router), Tailwind CSS
- SQLite with WAL mode (`~/.dotmd/history.db`)
- Commander.js for CLI

## How It Works

1. Run `dotmd init` to set up. It searches your machine for CLAUDE.md, AGENTS.md, and memory files, saves their locations to a config file, and takes a first snapshot of each one.
2. Run `dotmd scan` anytime to check if any tracked files have changed. If they have, it saves the new version and a diff showing what changed.
3. Run `dotmd status` to see which files are being tracked and what changed recently.
4. Run `dotmd install-hook` to add a line to your shell config so that scanning happens automatically every time you open a new terminal.
5. Run `dotmd serve` to open a web UI at localhost:3333 where you can browse files and see a timeline of changes.
6. All config lives at `~/.dotmd/config.yaml` — you can edit it to add/remove directories or change which file patterns to track.

## Related

- **pmtxt** — dotmd's file discovery, diffing, and dashboard are the foundation for pmtxt
