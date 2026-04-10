---
created_at: 2026-04-05
last_updated: 2026-04-09
---

# Claude Code Skill Frameworks

> TLDR: Three major skill frameworks — gstack, Superpowers, and Compound Engineering — have emerged to add structured workflows on top of Claude Code, each solving a different layer: decisions/QA, process discipline, and cross-session knowledge accumulation.

## Overview

Claude Code out of the box is a powerful but "mushy" single-mode tool. These frameworks add explicit cognitive modes and structured workflows. A comparison by Vox (Mar 2026) mapped them to Anthropic's harness architecture: planning, execution, evaluation, and cross-session state.

## The Three Frameworks

### gstack (Garry Tan)

**Focus:** Decision layer + QA testing. 54.6K stars (as of Mar 2026).

Six slash commands acting as different "brains":
- `/plan-ceo-review` — Founder mode. "What is the 10-star product hiding inside this request?" Inspired by Brian Chesky's approach.
- `/plan-eng-review` — Eng manager mode. Architecture, state machines, failure modes, diagrams. Forces hidden assumptions into the open.
- `/review` — Paranoid staff engineer. Finds bugs that pass CI but break production: N+1 queries, race conditions, trust boundaries, broken invariants.
- `/ship` — Release engineer. Sync main, run tests, push, open PR. For ready branches, not deciding what to build.
- `/browse` — QA engineer. Compiled Playwright binary giving Claude eyes on live URLs. Full QA pass in ~60 seconds.
- `/retro` — Engineering manager. Analyzes commit history, work patterns, shipping velocity.

Created by Garry Tan (YC CEO). Claims 600K lines of production code in 60 days with this setup.

### Superpowers (Jesse Vincent)

**Focus:** Process discipline. 121K stars.

Workflow: brainstorm → plan → execute → review. Key philosophy:
- Enforces true RED-GREEN-REFACTOR TDD
- Subagent-driven development with two-stage review (spec compliance, then code quality)
- Skills trigger automatically — mandatory workflows, not suggestions
- YAGNI and DRY principles throughout

Limitation: doesn't treat knowledge accumulation as first-class. Every session's context stays in that session.

### Compound Engineering (Every Inc)

**Focus:** Cross-session knowledge accumulation. 11.5K stars.

Extends the brainstorm → plan → work → review cycle with a fifth step: `/ce:compound`. After fixing a bug or completing a feature, spawns 5 parallel subagents:
- Context Analyzer, Solution Extractor, Related Docs Finder, Prevention Strategist, Category Classifier

Results merge into `docs/solutions/` — structured, categorized, searchable documents. Next time any agent starts a task, the plan-phase researcher automatically finds relevant past solutions.

Also features a dynamic reviewer ensemble: minimum 6 always-on reviewers plus conditional ones based on diff type (correctness, security, performance, testing, maintainability, adversarial).

## How They Layer

| Layer | Tool | Purpose |
|-------|------|---------|
| Decisions | gstack | Head chef sets the menu |
| Planning | CE /ce:plan | Researcher reviews past work first |
| Execution | CE /ce:work | Kitchen team cooks |
| Review | CE /ce:review + gstack /browse | Multi-reviewer + real-browser QA |
| Knowledge | CE /ce:compound | Recipe binder everyone reads |

Key insight: "Closing notes solve continuity. A recipe binder solves accumulation. One is linear. One is exponential."

## Related Concepts

- [Agent Proficiency](agent-proficiency.md) — The skill of managing these frameworks effectively
- [Agentic Engineering](agentic-engineering.md) — The broader field these frameworks operate in
- Anthropic's harness architecture blog (Nov 2025) — The formal framework Vox used to compare these tools

## Domain-Specific Skill Libraries

### MarketingSkills (Corey Haines)

35+ marketing skills for AI agents. Works with Claude Code, Codex, Cursor, Windsurf via the Agent Skills spec. Skills include CRO, copywriting, SEO audit, AI SEO, analytics tracking, cold email, paid ads, A/B testing, churn prevention, referral programs, RevOps, sales enablement, pricing strategy. All skills cross-reference each other and build on a shared `product-marketing-context` skill — the foundation every other skill checks first.

Key architecture: skills trigger automatically when the agent recognizes a marketing task. The `product-marketing-context.md` file (explicit knowledge about the product, audience, positioning) is read by every skill before execution.

### Career-Ops (Santiago Ferrer)

AI-powered job search pipeline built on Claude Code. 14 skill modes for evaluating offers (A-F scoring, 10 weighted dimensions), generating ATS-optimized CVs, scanning 45+ company job portals, batch processing, and interview prep (STAR+R story bank). Built by someone who used it to evaluate 740+ offers and land a Head of Applied AI role. Includes a Go TUI dashboard.

Key design: the system is designed for Claude to customize itself — modes, scoring weights, and negotiation scripts are all readable/writable markdown files.

### Obsidian Skills (kepano)

Agent skills for Obsidian — teaching AI agents to read, write, and navigate Obsidian vaults. See [LLM Knowledge Bases](llm-knowledge-bases.md).

### Skills Ecosystem Note

The `npx skills` CLI (Vercel Labs) and SkillKit enable installing skills across agents. The Minimalist Entrepreneur skills (`slavingia/skills`) and Base44 Superagent (130+ built-in skills) suggest an emerging marketplace pattern where skills are shared as open-source markdown files.

## Tools Noted

- **Codex plugin for Claude Code** (OpenAI) — `/codex:review`, `/codex:adversarial-review`, `/codex:rescue` for delegating to Codex from within Claude Code
- **SOUL.md** (OpenClaw) — Agent personality configuration. Sharp rules beat corporate guidelines. "Be the assistant you'd actually want to talk to at 2am."

## Sources

- "I Compared gstack, Superpowers, and Compound Engineering..." — Vox (tweet, Mar 2026) ([link](https://x.com/Voxyz_ai/status/2038237755654783107/?rw_tt_thread=True))
- "GitHub - garrytan/gstack..." — Garry Tan ([link](https://github.com/garrytan/gstack))
- "obra/superpowers..." — Jesse Vincent ([link](https://github.com/obra/superpowers))
- "How Claude Code actually works..." — Suryansh Tiwari / Nainsi Dwivedi (tweet, Mar 2026) ([link](https://x.com/suryanshti777/status/2038633532852158745/?s=12&rw_tt_thread=True))
- "openai/codex-plugin-cc..." — OpenAI ([link](https://github.com/openai/codex-plugin-cc))
- "SOUL.md Personality Guide" — OpenClaw ([link](https://docs.openclaw.ai/concepts/soul))
- "coreyhaines31/marketingskills" — Corey Haines (GitHub) ([link](https://github.com/coreyhaines31/marketingskills))
- "santifer/career-ops" — Santiago Ferrer (GitHub) ([link](https://github.com/santifer/career-ops))
- "kepano/obsidian-skills" — kepano (GitHub) ([link](https://github.com/kepano/obsidian-skills))
- "slavingia/skills" — Sahil Lavingia (GitHub) ([link](https://github.com/slavingia/skills))
- "The Claude Code Setup Nobody Shows You" — Aakash Gupta / Carl Votti (video, Apr 2026) ([link](https://youtube.com/watch?v=Eqh2iwSl570&si=CgkjC-SZIXj-KR8C))
