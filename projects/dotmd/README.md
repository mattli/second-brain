# dotmd

Track changes to AI instruction files (CLAUDE.md, AGENTS.md, memory files, skill configs) across your entire setup. Periodic snapshots capture change history for files that live outside git repos. Open-source developer tool that also serves as the technical foundation for pmtxt.

## Status

Planning complete. Not yet started.

## Key Docs

- **[Requirements](2026-03-30-dotmd-requirements.md)** — problem frame, requirements, scope boundaries
- **[V1 Implementation Plan](2026-03-30-001-feat-dotmd-v1-plan.md)** — 5 units, tech decisions, architecture
- **[Market Validation](last30days-validation.md)** — Reddit/X research on the problem space

## Stack

- TypeScript, Next.js (App Router), Tailwind CSS
- SQLite for snapshot storage (`~/.dotmd/history.db`)
- Commander.js for CLI

## Architecture

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

## How It Works

- Configure tracked file patterns in `~/.dotmd/config.yaml`
- `dotmd scan` snapshots tracked files, diffs against previous, stores in SQLite
- `dotmd serve` launches a web dashboard on localhost:3333
- Shell hook runs scan automatically on new terminal sessions
- Git history enrichment when tracked files are inside a repo

## Related

- **pmtxt** — dotmd's file discovery, diffing, and dashboard are the foundation for pmtxt
