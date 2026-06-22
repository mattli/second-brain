# Claude Code Skills

Personal index of Claude Code skills I've authored, installed plugins I rely on, and notes on what works. NOT an attempt to mirror the full runtime skill list — Claude Code's system reminder already does that. This file is curated commentary only.

## Three tiers of skills

| Tier | Location | Scope | Who maintains |
|------|----------|-------|---------------|
| Built-in | Ship with Claude Code CLI | All sessions | Anthropic |
| User | `~/.claude/skills/<name>/SKILL.md` | All sessions, machine-specific | Me |
| Project | `<project>/.claude/skills/<name>/SKILL.md` | Only sessions inside that project | Me (committed/synced with the project) |
| Plugin | Installed via plugin system | All sessions | Plugin author |

## Custom skills I've authored

### User-scoped

- **`resynthesize`** — `~/.claude/skills/resynthesize/SKILL.md`
  - Resynthesizes a single wiki page from "stitched by source" into "organized by concept." Preserves Sources verbatim. Auto-applies with git as the undo button. Proposes a split instead of rewriting when the page covers 2+ distinct topics.
  - Built 2026-06-22 alongside the wiki pipeline simplification.
  - Invocation: `/resynthesize <path>` or "resynthesize <path>" in natural language.
  - Tested on: TBD (no test runs yet).
  - **Why user-scoped (not project-scoped, even though it's wiki-specific):** project-scope would put it inside `~/second-brain/.claude/skills/`, which would couple sync to Obsidian Sync's behavior for hidden directories. That toggle is global — enabling it to sync `.claude/` would also sync other hidden directories I don't want syncing. User-scope keeps Claude Code config separate from vault content, and lets the (eventual) dotfiles repo handle cross-machine sync surgically.

### Project-scoped

(none yet — see note above on why user-scope is the default for now)

## Plugin skills I actually use

(TBD — most of the gstack and compound-engineering catalog is dev-tooling I don't use day-to-day. Worth adding entries here only for skills I find myself reaching for repeatedly.)

## Cross-machine sync

**Empirically verified 2026-06-22: nothing currently replicates `.claude/` (in any location) between machines.**

- **`~/.claude/skills/` (user-scoped):** outside the vault entirely. Obsidian Sync doesn't reach here. No mechanism syncs this without intervention.
- **`~/second-brain/.claude/skills/` (project-scoped, inside the vault):** also doesn't sync. The vault's `.gitignore` uses an allowlist pattern (`*` ignores everything, then explicit `!` lines re-include allowed paths). `.claude/` isn't on the allowlist, so NanoClaw's vault-sync cron never commits it. Confirmed via the Mac Mini test: a MacBook-side `~/second-brain/.claude/settings.local.json` (Apr 27 14:53) never propagated to the Mac Mini, which has a stale Mar 31 12:46 version frozen since whenever Claude Code created it locally on that machine.

**Practical implication:** the project-scope-vs-user-scope debate was actually moot for sync purposes — neither location gives free cross-machine sync today. The reason to choose user-scope was conceptual (keep Claude Code config separate from vault content, avoid coupling to Obsidian Sync's global hidden-dir toggle), not sync-driven.

Two options going forward:

1. **Eventually:** the standing backlog item to set up a dotfiles repo is the right home — include `~/.claude/skills/` as one of the synced paths.
2. **Until then:** manual `scp` if I ever need a specific skill on the Mac Mini. For `resynthesize` specifically, that's only needed if I want to invoke it from a Claude Code session on the Mac Mini — which I probably won't, since wiki work happens on the MacBook.

## Notes on the skill system

- **Skill descriptions matter.** Claude Code matches the user's natural-language request against skill descriptions to decide which to invoke. A skill with a vague description gets skipped even when it would be perfect. Trigger phrases are worth including explicitly in the description.
- **Skills are markdown, not code.** A `SKILL.md` is just a procedure and decision rules in natural language. No special syntax beyond frontmatter (`name`, `description`). This makes them cheap to author and easy to revise.
- **Project skills are best for skills with hardcoded paths or domain-specific behavior.** User skills are best for skills that work anywhere.
