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

- `dotmd init` auto-discovers Claude Code instruction files, shows what was found, runs first snapshot
- `dotmd scan` snapshots tracked files, diffs against previous, stores in SQLite
- `dotmd status` shows tracked files, recent changes, and coverage gaps
- Shell hook runs scan on new terminal sessions and prints a change summary
- `dotmd serve` launches a web dashboard on localhost:3333
- Config at `~/.dotmd/config.yaml` with scan roots, patterns, and exclusions

## Related

- **pmtxt** — dotmd's file discovery, diffing, and dashboard are the foundation for pmtxt
