# Build Workflow — From Idea to Shipped

A repeatable process for validating, speccing, building, and shipping products. Use this for every new project.

---

## Idea Sourcing

Ideas come from the monthly intelligence summary's **Build Candidates** section — 2–3 product ideas grounded in durable problems and persistent capital-vs-builder gaps. See [intelligence pipeline](../intelligence/README.md) for how these are generated.

Build Candidates are starting points, not assignments. Pick one that resonates, or let it spark something adjacent.

---

## Phase 1 — Validation

Run before writing a line of code. The goal is a clear answer to: "is this a real problem for enough people?"

**Tools:**
- `last30days` — one hour of targeted research on the specific problem space. Query Reddit, X, HN to confirm real people are experiencing this problem at the individual level. This is an ad hoc tool, not a multi-pass process — run it once with focused queries and read the results.
- GitHub search — check for existing tools. If something already solves this well, pivot or differentiate.
- X / HN — post the idea early, gauge reaction before building.

**What passing looks like:**
- Real community complaints about the problem (not just you feeling it)
- No existing tool that solves it well
- At least some signal that people would want a dedicated solution

**Gate:** Do not proceed to Phase 2 until validation is complete.

---

## Phase 2 — Spec

Write the spec as well as possible before handing to agents. The better the spec, the less correction needed during build. Think of it as a contract between you and the agents.

**Tools:**
- Claude.ai — think through the problem, explore edge cases, make product decisions, refine feature set
- Compound engineering `/ce:brainstorm` — for unclear requirements, brainstorm before planning
- Superpowers `/sp:brainstorm` — brainstorm skills for spec writing and subagent-driven development
- Compound engineering `/ce:plan` — transforms the spec into a detailed implementation plan with data models, file references, architectural decisions. Output is a markdown file specific enough that an agent can execute it without asking questions.
- Superpowers `/sp:plan` — plan skills and subagent architecture for execution

**Spec should include:**
- Problem statement
- Who it's for
- Core features with acceptance criteria
- Non-goals (explicit scope boundary)
- Tech stack decision
- Key technical decisions already made
- File and directory structure
- Edge cases and gotchas
- What success looks like

**Output:** A `SPEC.md` and a `plan.md` in the project repo, ready to hand to agents.

---

## Phase 3 — Build

Hand the plan to agents and monitor rather than type.

**Remote workflow:** SSH into Mac Mini via Tailscale, run Claude Code in tmux so sessions persist if the connection drops. Commit before starting any major phase for clean rollback. For status checks, SSH from phone or message Second Brain on Telegram.

**Tools:**
- Compound engineering `/ce:work` — executes the plan, writes code, generates tests
- Superpowers `/sp:work` — subagent-driven execution for parallelizable tasks
- Claude Code with `--dangerously-skip-permissions` — for unattended execution on Mac Mini where trust is established
- Compound engineering `/ce:review` — parallel subagents review output from multiple angles (security, performance, overbuilding, test coverage) before shipping

**NanoClaw's role:** Notifications and ops, not build orchestration. NanoClaw monitors the project folder and sends Telegram alerts for milestones, test failures, and build completion. Agent swarms (`add-telegram-swarm`) are a future option for parallel container execution when tasks are independent — don't set this up until you need it.

**Start simple.** SSH for interaction, Telegram for alerts. Don't build complex notification infrastructure upfront — add complexity when the pain is real.

**When to use Opus vs Sonnet:**
- Opus — planning, spec writing, architecture decisions, the review step. High-leverage reasoning tasks where quality matters more than cost.
- Sonnet — code execution, routine tasks, most agent work. Cost compounds fast at scale.

**Output:** Working code, tests, and a PR ready to review.

---

## Phase 4 — Compound

The step that separates compound engineering from regular AI-assisted coding. Feed learnings back into the system so the next build cycle starts smarter.

**Tools:**
- Compound engineering `/ce:compound` — extracts learnings from the build cycle and writes them to `docs/solutions/` in structured format. Future planning sessions reference these automatically.
- Update `CLAUDE.md` — project-specific conventions, gotchas, and patterns discovered during build go here for future sessions.
- Update `BUILD_WORKFLOW.md` (this file) — if the process itself revealed something worth capturing, update it.

**Output:** A codebase and a workflow that gets easier over time, not harder.

---

## Phase 5 — Ship and Learn

**Tools:**
- GitHub — open source with a good README. The README is your product page.
- X / HN — share what was built and how you built it. Writing about the process is as valuable as the product.
- `last30days` — periodic re-runs to track whether the community conversation has changed and inform what to build next.

---

## Prerequisites

Before this workflow can run on any project, the following must be in place:

- [ ] `last30days` skill installed — `git clone https://github.com/mvanhorn/last30days-skill.git ~/.claude/skills/last30days`
- [ ] Compound engineering plugin installed — `/plugin marketplace add https://github.com/EveryInc/every-marketplace` then `/plugin install compound-engineering`
- [ ] Superpowers plugin installed
- [ ] `--dangerously-skip-permissions` alias configured on Mac Mini
- [ ] Tailscale configured for SSH access to Mac Mini
- [ ] NanoClaw Telegram channel set up for alerts
- [ ] Parallel AI API key configured for better research quality

---

## Notes
- Claude.ai is for thinking and planning. Claude Code with compound engineering and superpowers is for building. NanoClaw is for notifications and monitoring.
- Build for yourself first. Open source when it works. Find out if others have the problem after it exists.
- The spec is the most important artifact. Time spent on the spec pays back in reduced correction during build.
