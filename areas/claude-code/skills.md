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

## Candidates — vetted 2026-08-08, nothing built

### The filter: skills fix *not-doing*, lessons fix *not-knowing*

A fair objection to any of these: most of it is already written down, in `CLAUDE.md` sticky notes and `docs/solutions/` compound-engineering docs. So why would a skill add anything?

- A **lesson** says *"the verifier env must live outside the repo."* A fact needed at the right moment. CLAUDE.md is good at this — always loaded, short, broadly applicable. `docs/solutions/` is the long-form version with the worked example.
- A **skill** produces *a thing*. Not "remember goal docs need a credentialed smoke" but "here is the template, here are two real examples, fill it in." The output is an artifact, not a recollection.

**The evidence that lessons alone aren't enough:** the worktree/venv lesson was written 2026-08-06 — a `docs/solutions/` doc *and* a sticky note in dev-harness's `CLAUDE.md`, which is loaded at session start. On 2026-08-07 the incremental-judging run hit the same wall and lost roughly an hour. The rule existed, was documented, was pointed at from the file read at startup — and it still didn't fire, because nothing forced the check to *happen* at the moment of launching.

**So: add a skill only where the failure mode is not-remembering-at-the-moment-of-doing.** Checklists and templates fix that; rules don't.

### 1. Launch preconditions — strongest candidate

The checks that must pass *before* a harness run starts, because failing them costs hours rather than minutes:

- Target repo clean and on the expected branch
- API key reachable **by absolute path from inside a worktree** — `.env` is gitignored, so it does not exist there
- **The verifier command actually runs in a worktree** — a worktree contains only *tracked* files, so a gitignored `.venv` isn't there and bare `pytest` resolves to a system Python with nothing installed
- Any repo the run needs to create actually exists (a greenfield target needs `git init` before launch)
- Read-only targets confirmed readable

This is where the most time has been lost — the venv trap cost a sprint on the codebase-map run and an hour on the incremental-judging run. Identical every time, expensive to forget: exactly the profile of a thing that should be a checklist rather than a habit.

### 2. The harness goal doc — natural first if learning skill authoring

Four written in a week (coverage judge, codebase-map, incremental judging, plus the wiring brief). Same skeleton every time: why this exists → what to build (the contract: in, out) → the mechanics acceptance must test → verification, hermetic tests **plus a credentialed smoke as acceptance criteria not an afterthought** → explicitly out of scope → hard rules (read-only paths, never restart production, don't push) → done means.

They've improved each time, but each is rebuilt from memory, so each version is only as good as what was top of mind. The "prompt is a versioned INPUT the module doesn't own" framing — which came out of a mid-conversation pushback — exists in exactly one of the four. A skill with the template plus two real examples would make each new one start at the current best.

### 3. The review brief — third, may not need it

The document handed to a *fresh* session so it can review a branch cold, without inheriting the builder's assumptions. Written three times so far. Structure: focus areas ordered by blast radius (file-moving and authorization before display logic) → hard constraints the change must not violate → the honest warning about what tests don't cover ("a green suite proves nothing about `bot.py` or the browser") → report by severity, **fix nothing**.

The hard-won rule embedded in it: **reviewers must be fresh context.** An in-process "adversarial lens" shares the author's assumptions and does not count — caught once mid-review, when the review machinery disclosed it couldn't find a peer CLI and fell back to reviewing itself.

### Rejected: the end-of-session ritual

The appeal was the engineering pattern — it's a component, and components get extracted. But run the usual payoffs against it: not reused across contexts, never tested independently, changes rarely, and it's ~15 lines. The only win is context weight, and 15 lines isn't a weight problem.

**And it has a seam that would leak.** The ritual isn't purely shared — the Mini holds the vault git repo and the NanoClaw sync rules; the MacBook doesn't. That works today because CLAUDE.md is *layered* (shared file + machine-local `@import`). A skill folder is a single artifact with no import-and-override structure, so it would either need "if on the Mini" conditionals (reintroducing what layering avoids) or split across two homes (bloat traded for fragmentation).

**Trigger to revisit:** if the ritual grows enough steps, edge cases, or branches that its context cost becomes real.

### Also considered and tabled: a "plain-language report" skill for Claude Code

The idea: instruct CC to open every report with what happened / what it means / what's my call, so reports arrive readable and don't need translating in Claude.ai.

Tabled because **the translation isn't why the pasting happens.** Two reasons to paste a CC report into Claude.ai: wanting the plain-language version (skill-shaped, fixable at source), and wanting to *decide* something — merge or not, is this finding real, does this change the plan. The second needs accumulated conversation context a skill can't carry. As long as it exists the paste happens anyway, and the plain-language version comes for free once pasted.

## Notes on the skill system

- **Skill descriptions matter.** Claude Code matches the user's natural-language request against skill descriptions to decide which to invoke. A skill with a vague description gets skipped even when it would be perfect. Trigger phrases are worth including explicitly in the description.
- **Skills are markdown, not code.** A `SKILL.md` is just a procedure and decision rules in natural language. No special syntax beyond frontmatter (`name`, `description`). This makes them cheap to author and easy to revise.
- **Project skills are best for skills with hardcoded paths or domain-specific behavior.** User skills are best for skills that work anywhere.
