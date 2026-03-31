---
date: 2026-03-30
topic: dotmd
---

# dotmd — AI Instruction File Tracker

## Problem Frame

Developers using AI coding tools (Claude Code, Cursor, Codex) accumulate structured markdown files that control AI behavior: CLAUDE.md, AGENTS.md, memory files, skill configs, and others. These files live in scattered locations (global config, project directories, containers), are frequently modified by both humans and AI agents (hooks, skills, auto-updates), and have no visibility into what changed, when, or why. There's no way to see the full picture, track changes over time, or catch unexpected modifications.

This is an open-source developer tool. It also serves as the technical foundation for pmtxt (a product management system that tracks and governs structured markdown knowledge bases).

## Requirements

**File Discovery and Configuration**
- R1. Users configure which file patterns and paths to track (e.g., `**/CLAUDE.md`, `~/.claude/projects/*/memory/*.md`, custom paths)
- R2. Sensible defaults for Claude Code instruction files (CLAUDE.md, AGENTS.md, memory files) so it works out of the box with zero config. Support for other AI coding tools (Cursor, Codex, Windsurf) deferred to a future release

**Change Tracking**
- R3. Periodic snapshots of all tracked files, storing diffs in dotmd's own history — works whether or not files are in a git repo
- R4. When a tracked file is inside a git repo, enrich the snapshot with git history (commit messages, authors, timestamps)
- R5. Change timeline view showing what changed, when, and the diff for each change

**Web Dashboard**
- R6. Web dashboard showing all tracked files organized by location/scope
- R7. Each file viewable with rendered markdown and change history
- R8. ~~Ability to edit tracked files directly from the dashboard~~ **Cut from V1** — dashboard is read-only
- R9. Dashboard highlights recent changes and files that were modified since the user last viewed them

**Notifications**
- R10. On session start (shell hook), display a summary of files that changed since the last session — which files, when, and a one-line summary of the diff

**Packaging and Onboarding**
- R11. Installable via `npm install -g dotmd` (or `npx dotmd`) with a single-command first run that scans defaults and shows results
- R12. `dotmd init` auto-discovers Claude Code instruction files matching defaults, shows what was found, and runs the first snapshot — so the user sees value before any configuration

## Success Criteria

- Open source project gains adoption in the Claude Code developer community (GitHub stars, issues, contributions)
- Core code (file discovery, snapshot diffing, web dashboard) is reusable as the foundation for pmtxt's web dashboard
- A developer with 10+ AI instruction files across multiple projects can see their full landscape and track changes in under 5 minutes of setup

## Scope Boundaries

- Not a CLAUDE.md generator or editor — it tracks and displays, users edit in their own tools
- Not a sync tool — does not replicate files across machines or projects
- Not a linter or validator — does not check CLAUDE.md content for correctness
- V1 is local only — tracks files on one machine, no cloud sync or multi-machine dashboard

## Key Decisions

- **Configurable file patterns, not hardcoded:** Users have varied setups (CLAUDE.md, memory.md, context.md, skill files, etc.). The tool should let users select which files to track, with sensible defaults
- **Snapshots as core, git as enrichment:** Many AI instruction files live outside git repos (global ~/.claude/CLAUDE.md, memory files). Periodic snapshots ensure change tracking works everywhere, with git history added when available
- **CLI-first, dashboard-supported:** Core value (scan, diff, track, notify) lives in the CLI. Web dashboard is a visualization layer on the same data store, and directly reusable as pmtxt's dashboard foundation
- **Open source, OSS-first:** When a design decision serves open-source users but complicates pmtxt reuse, we choose the OSS user. Builds developer audience for pmtxt. The tracking/dashboard layer is the open-source tool; pmtxt's value layer (governed knowledge base, LLM synthesis, compounding product intelligence) sits on top
- **Claude Code first:** V1 targets Claude Code users only. Defaults, file discovery, and documentation focus on Claude Code's file structure. Other tools (Cursor, Codex, Windsurf) supported via custom config but not with curated defaults until a future release

## Dependencies / Assumptions

- Assumes developers have enough AI instruction files to make tracking valuable (likely 5+ across global, projects, and containers)
- Reusability for pmtxt depends on choosing the same tech stack (TypeScript, Next.js) — this is a planning decision, not a brainstorm decision
- pmtxt connection: dotmd's file discovery maps to pmtxt's KB reader (Unit 2), snapshot diffing maps to pmtxt's approval diffs (Unit 3), and the web dashboard maps to pmtxt Unit 8

## Outstanding Questions

### Deferred to Planning
- [Affects R3][Technical] How often should snapshots run? (On-demand, cron, filesystem watcher, or combination?)
- [Affects R6][Technical] Should the dashboard run as a local dev server, an Electron/Tauri app, or something else?
- ~~[Affects R1][Needs research] What are the common file locations across Claude Code, Cursor, Codex, and Windsurf that should be in the defaults?~~ **Resolved:** V1 targets Claude Code only
- ~~[Affects R8][Technical] How should editing work — direct file write from the web UI, or open in the user's editor?~~ **Resolved:** R8 cut from V1

## Next Steps

→ `/ce:plan` for structured implementation planning
