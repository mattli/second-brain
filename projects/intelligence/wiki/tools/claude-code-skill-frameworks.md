---
created_at: 2026-04-05
last_updated: 2026-04-13
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

## The Underlying Philosophy: Thin Harness, Fat Skills

Garry Tan's architectural principle (from the same author as gstack): *push intelligence up into skill files, push execution down into deterministic tooling, keep the harness thin.*

Skill files work like method calls: same procedure + different arguments = different capabilities. The skill encodes *how*; the invocation supplies the world. This is why gstack's six slash commands can power radically different workflows — the same /review skill yields different outputs depending on what code it encounters.

See [Agent Harness](agent-harness.md) for the full principle and why "fat harness with thin skills" is the anti-pattern.

## Related Concepts

- [Agent Proficiency](../concepts/agent-proficiency.md) — The skill of managing these frameworks effectively
- [Agentic Engineering](agentic-engineering.md) — The broader field these frameworks operate in
- [Agent Harness](agent-harness.md) — The architectural layer these frameworks sit on top of
- Anthropic's harness architecture blog (Nov 2025) — The formal framework Vox used to compare these tools

## Domain-Specific Skill Libraries

### MarketingSkills (Corey Haines)

35+ marketing skills for AI agents. Works with Claude Code, Codex, Cursor, Windsurf via the Agent Skills spec. Skills include CRO, copywriting, SEO audit, AI SEO, analytics tracking, cold email, paid ads, A/B testing, churn prevention, referral programs, RevOps, sales enablement, pricing strategy. All skills cross-reference each other and build on a shared `product-marketing-context` skill — the foundation every other skill checks first.

Key architecture: skills trigger automatically when the agent recognizes a marketing task. The `product-marketing-context.md` file (explicit knowledge about the product, audience, positioning) is read by every skill before execution.

### Career-Ops (Santiago Ferrer)

AI-powered job search pipeline built on Claude Code. 14 skill modes for evaluating offers (A-F scoring, 10 weighted dimensions), generating ATS-optimized CVs, scanning 45+ company job portals, batch processing, and interview prep (STAR+R story bank). Built by someone who used it to evaluate 740+ offers and land a Head of Applied AI role. Includes a Go TUI dashboard.

Key design: the system is designed for Claude to customize itself — modes, scoring weights, and negotiation scripts are all readable/writable markdown files.

### Obsidian Skills (kepano)

Agent skills for Obsidian — teaching AI agents to read, write, and navigate Obsidian vaults. See [LLM Knowledge Bases](../concepts/llm-knowledge-bases.md).

### Dex (Dave Khaled)

Open-source personal operating system (POS) built on Claude Code. ~60 skills that compound over time via a `session_start` hook injecting weekly goals, projects, and learnings into every new chat. Used by the field CPO of Pendo.io to manage enterprise accounts, synthesize market intelligence, and generate PRDs.

Key skills:
- *Daily plan* — morning briefing pulling calendar, CRM (Clary), meeting notes (Granola), YouTube, LinkedIn, newsletters into a unified situational report with prioritized actions
- *Health score* — account health across all enterprise deals; surfaces where help is most needed proactively
- *X-ray* — explains how any Dex command works via mermaid diagrams, teaching the user AI fluency as they use the system
- *Backlog* — collects ideas, ranks by impact/alignment/token efficiency, competes human vs. AI ideas

MCP architecture: Dave creates a custom MCP server for each new integration by pointing Claude at the API documentation with an API key: "Hey, read the API docs for this tool. Create me an MCP server." MCP preferred over raw API calls because it provides better guardrails and context representation.

CLAUDE.md philosophy: keep it short (progressive disclosure to other files), version-control via git for regression recovery, periodically audit with Claude itself. Key test: "Is this system for you or for others?"

See [Agent Harness](agent-harness.md) for the `session_start` hook pattern that makes Dex compound over time.

### Content-Skill-Graph (Ronin)

A content production system built entirely on markdown skill files with wikilinks. Replaces a content team or $5-8K/month agency retainer with a folder of 17 interconnected `.md` files.

Folder structure:
```
/content-skill-graph
├── index.md            ← briefing doc the AI reads first
├── platforms/          ← one file per platform (X, LinkedIn, Instagram, TikTok, YouTube, Threads, Facebook, newsletter)
├── voice/              ← brand-voice.md + platform-tone.md
├── engine/             ← hooks.md, repurpose.md, scheduling.md, content-types.md
└── audience/           ← audience segment files
```

The key: each file uses `[[wikilinks]]` to reference other nodes. When the agent gets a topic, it doesn't read one file — it follows the links, builds a complete understanding of brand/voice/platform rules/hook formulas, then writes. The difference from a single prompt: *"One flat .md file gives you a tool. A graph gives you a team."*

Why this pattern works: the agent has amnesiac tendencies — each session starts from zero. The skill graph acts as a persistent playbook that outlasts any chat window. Same principle as thin-harness / fat-skills, applied to content production rather than software development. See [Agent Harness](agent-harness.md).

Output: one topic → 10 platform-native posts, each reframed for platform conventions (X: contrarian thread; LinkedIn: personal narrative 1500 words; Instagram: 7-slide carousel; TikTok: 45-second script).

### Skills Ecosystem Note

The `npx skills` CLI (Vercel Labs) and SkillKit enable installing skills across agents. The Minimalist Entrepreneur skills (`slavingia/skills`) and Base44 Superagent (130+ built-in skills) suggest an emerging marketplace pattern where skills are shared as open-source markdown files.

## Tools Noted

- **Codex plugin for Claude Code** (OpenAI) — `/codex:review`, `/codex:adversarial-review`, `/codex:rescue` for delegating to Codex from within Claude Code
- **SOUL.md** (OpenClaw) — Agent personality configuration. Sharp rules beat corporate guidelines. "Be the assistant you'd actually want to talk to at 2am."
- **claude-plugins-official** (Anthropic) — Official Anthropic-managed directory of Claude Code plugins, including internal and third-party community plugins. https://github.com/anthropics/claude-plugins-official
- **EveryInc/compound-engineering-plugin** — Installable Claude Code plugin version of Compound Engineering. https://github.com/EveryInc/compound-engineering-plugin
- **everything-claude-code** — Performance optimization system for Claude Code with 28 specialized agents, 125+ skills, and 60+ commands. https://github.com/affaan-m/everything-claude-code
- **ShopClawMart** — Marketplace for browsing, purchasing, and installing pre-built AI personas and skills for agents. https://www.shopclawmart.com
- **"Every Claude Code Hack I Know" (Matt Van Horn)** — Curated thread of Claude Code tips and workflows, March 2026. https://x.com/mvanhorn/status/2035857346602340637
- **Claude Code Cheat Sheet** (storyfox.cz) — Quick reference for keyboard shortcuts, slash commands, and workflow patterns. https://cc.storyfox.cz

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
- "How To Build Own Content Engine? (FULL COURSE)" — Ronin (tweet thread, Apr 2026)
- "Automate Your Entire Work Life With Claude Code — No Coding Needed" — Aakash Gupta / Dave Khaled (video, Apr 2026)
