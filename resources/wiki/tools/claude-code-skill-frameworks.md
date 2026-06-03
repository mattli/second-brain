---
created_at: 2026-04-05
last_updated: 2026-06-03
---

# Claude Code Skill Frameworks

> TLDR: Four major skill frameworks — gstack, Superpowers, Compound Engineering, and Agent Skills — have emerged to add structured workflows on top of Claude Code, each solving a different layer: decisions/QA, process discipline, cross-session knowledge accumulation, and senior-engineer SDLC enforcement. Anthropic's first-party Routines feature adds managed-infrastructure proactive automation with schedule and event-based triggers.

## Overview

Claude Code out of the box is a powerful but "mushy" single-mode tool. These frameworks add explicit cognitive modes and structured workflows. A comparison by Vox (Mar 2026) mapped them to Anthropic's harness architecture: planning, execution, evaluation, and cross-session state.

## The Four Frameworks

### gstack (Garry Tan)

**Focus:** Decision layer + QA testing. 87K+ stars.

Six slash commands acting as different "brains":
- `/plan-ceo-review` — Founder mode. "What is the 10-star product hiding inside this request?" Inspired by Brian Chesky's approach.
- `/plan-eng-review` — Eng manager mode. Architecture, state machines, failure modes, diagrams. Forces hidden assumptions into the open.
- `/review` — Paranoid staff engineer. Finds bugs that pass CI but break production: N+1 queries, race conditions, trust boundaries, broken invariants.
- `/ship` — Release engineer. Sync main, run tests, push, open PR. For ready branches, not deciding what to build.
- `/browse` — QA engineer. Compiled Playwright binary giving Claude eyes on live URLs. Full QA pass in ~60 seconds.
- `/retro` — Engineering manager. Analyzes commit history, work patterns, shipping velocity.

Created by Garry Tan (YC CEO). Claims 600K lines of production code in 60 days with this setup. Tan uses GStack as a coding skill inside OpenClaw/Hermes Agent — it's the execution layer, while GBrain handles knowledge.

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

### Agent Skills (Addy Osmani)

**Focus:** Senior-engineer SDLC enforcement. 26K+ stars.

Twenty skill files organized around six lifecycle phases, with seven slash commands: `/spec` (define), `/plan`, `/build`, `/test`, `/review`, `/ship`, and `/code-simplify`. Each skill is a workflow with checkpoints and exit criteria — not reference documentation. A meta-skill (`using-agent-skills`) acts as a router, progressively disclosing only the skills relevant to the current phase.

Five load-bearing design principles:

1. **Process over prose** — workflows are agent-actionable; essays are not. Steps with exit criteria beat best-practices documents.
2. **Anti-rationalization tables** — each skill includes a table of common excuses for skipping the workflow, paired with pre-written rebuttals. LLMs are excellent at rationalizing why *this particular* task doesn't need a spec or test; the tables are "pre-written rebuttals to lies the agent hasn't yet told." [[source]](https://addyosmani.com/blog/agent-skills/)
3. **Verification is non-negotiable** — every skill terminates in concrete evidence (passing tests, clean build, reviewer sign-off). "Seems right" never closes the loop.
4. **Progressive disclosure** — don't load all twenty skills at session start. The router activates what's relevant, keeping the library in a small token footprint.
5. **Scope discipline** — touch only what you're asked to touch. The single biggest determinant of whether an agent's PR is mergeable.

Heavily informed by Google's engineering practices: Hyrum's Law in API design, the test pyramid and the Beyoncé Rule ("if you liked it, you should have put a test on it") in TDD, DAMP over DRY in tests, ~100-line PR sizing with severity labels in code review, Chesterton's Fence in code simplification, trunk-based development, shift-left with feature flags, and code-as-liability in deprecation.

Portable across tools — the same markdown-with-frontmatter skill files work in Claude Code, Cursor (via rules), Gemini CLI, Codex, and any harness that accepts system-prompt content. See [Agent Harness](agent-harness.md) for the broader harness architecture these skills plug into.

## How They Layer

| Layer | Tool | Purpose |
|-------|------|---------|
| Decisions | gstack | Head chef sets the menu |
| SDLC discipline | Agent Skills | Senior engineer enforces the process |
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

### GBrain (Garry Tan)

Personal knowledge brain for agents — the knowledge layer that GStack's coding skills operate on. Ships with the resolver pattern built in: `gbrain init` creates RESOLVER.md, decision tree, and disambiguation rules. In production, Tan runs ~100,000 pages and 100+ cron jobs processing inputs continuously — meetings, emails, social media, reading. Designed to work with OpenClaw or Hermes Agent as the conductor. GStack (87K+ stars) calls knowledge stored in GBrain; together they form the full "thin harness, fat skills" architecture.

**Page schema:** Each brain page has compiled truth at the top (current best understanding), an append-only timeline below (events in chronological order), and raw data sidecars for source material. Person pages include timeline, state section, open threads, and a score. Every meeting triggers **entity propagation** — the system walks through every person and company mentioned and updates their brain pages with what was discussed. [[source]](https://x.com/garrytan/status/2053127519872614419)

**Skillify — the meta-skill:** When Tan encounters a workflow he'll repeat, he runs `skillify` which examines what just happened, extracts the repeatable pattern, writes a tested skill file with triggers and edge cases, and registers it in the resolver. Skills compose: a complex pipeline like book-mirror calls brain-ops for storage, enrich for context, cross-modal-eval for quality, and pdf-generation for output. Improving one skill improves every workflow that uses it. [[source]](https://x.com/garrytan/status/2053127519872614419)

**Cross-modal eval:** Multi-model quality checking. Tan routes outputs through Opus 4.7 1M (precision errors), GPT-5.5 (missing context), and DeepSeek V4-Pro (generic writing detection). The skill decides which model to call for which task; the harness doesn't care. This is how factual errors in early book-mirror versions were caught and permanently fixed.

**Key skills beyond GStack's coding set:**
- *book-mirror* — per-chapter synthesis mapping author's ideas to the user's actual life context; cross-references brain pages for specificity
- *meeting-ingestion* — auto-pulls transcripts, creates structured summaries, propagates entities to person/company pages
- *enrich* — takes a person's name, merges five sources into a single brain page with career arc, contact info, meeting history
- *media-ingest* — handles video, audio, PDF, screenshots, GitHub repos; transcribes and files to the right brain location
- *perplexity-research* — brain-augmented web research; checks what the brain already knows before synthesizing so it highlights genuinely new information

GBrain benchmarks at 97.6% recall on LongMemEval, beating MemPalace with no LLM in the retrieval loop. [[source]](https://x.com/garrytan/status/2053127519872614419)

See [Agent Harness](agent-harness.md) for the full resolver pattern and how GBrain implements it.

### Skills Ecosystem Note

The `npx skills` CLI (Vercel Labs) and SkillKit enable installing skills across agents. The Minimalist Entrepreneur skills (`slavingia/skills`) and Base44 Superagent (130+ built-in skills) suggest an emerging marketplace pattern where skills are shared as open-source markdown files.

## HTML as Artifact Format

Thariq (Anthropic, Claude Code team) advocates replacing Markdown with HTML as the default output format for Claude Code artifacts — specs, plans, reports, prototypes, and code reviews. The core argument: as agents produce longer, more complex outputs and users increasingly don't edit these files themselves, Markdown's simplicity becomes a constraint rather than a benefit.

**Why HTML over Markdown:**
- **Information density** — tables, SVG diagrams, CSS styling, interactive JavaScript elements, and spatial layouts in a single file, replacing the ASCII diagrams and Unicode color approximations agents resort to in Markdown
- **Readability at scale** — plans over ~100 lines go unread in Markdown; HTML with tabs, navigation, illustrations, and responsive layout gets actually consumed
- **Shareability** — upload to S3 and share a link; colleagues open it in any browser without needing a renderer
- **Two-way interaction** — sliders, knobs, and parameter editors with "copy as JSON/prompt" buttons let users tune outputs and feed results back into Claude Code

**Use cases:** exploration grids (6 design variants side-by-side), implementation plans with embedded mockups and data-flow diagrams, PR explainers with color-coded diffs and inline annotations, throwaway editing UIs (drag-and-drop ticket prioritization, feature-flag config editors, prompt-tuning side-by-side previews), research reports with SVG flowcharts.

**Tradeoffs:** HTML takes 2–4x longer to generate, diffs are noisy for version control, and token usage is higher (though with large context windows this matters less in practice).

**Getting started:** no special skill file needed — "make an HTML file" or "make an HTML artifact" is sufficient. Over time, a design-system HTML file pointed at the codebase can enforce consistent styling. Examples at [thariqs.github.io/html-effectiveness](https://thariqs.github.io/html-effectiveness/).

## The Compounding Personal AI Thesis

Tan's overarching argument: the future belongs to individuals who build compounding AI systems, not those who use centralized AI tools. The difference is between keeping a journal and having a nervous system — one stores things, the other connects them, flags changes, and surfaces what's relevant right now. [[source]](https://x.com/garrytan/status/2053127519872614419)

The compounding loop: every meeting adds to the brain, every book enriches context for the next, every skill makes the next workflow faster, every person-page update makes the next meeting prep sharper. Tan reports 100 cron jobs running 24/7 for automated ingestion — meeting transcripts, email triage (every 10 minutes), social media, and knowledge graph enrichment from conversations.

Practical starting path: pick a thin harness (OpenClaw, Hermes Agent, or custom), start a brain with GBrain, do something interesting manually with the agent, then skillify the pattern into a reusable skill. Run cross-modal eval to catch errors. The first skill will be mediocre — the value comes from the compound curve as fixes get baked into skills and every future invocation benefits.

## Routines: First-Party Proactive Automation

Routines is Anthropic's built-in answer to the proactive automation problem — the gap between Claude Code as a reactive tool (waits for you to press enter) and a proactive teammate (notices when something breaks and acts). Before Routines, building proactive Claude Code agents required managing hosting, session state, authentication, triggers, and monitoring infrastructure yourself.

A routine is defined by three decisions:

1. **Trigger** — when should the session start? Schedule-based (weekly docs sync) or event-based (GitHub issue opens, PR merges with a specific label, POST to a webhook after a deploy).
2. **Context** — what does Claude need? One or more repos, connectors (Slack, Google Drive, GitHub MCP, monitoring tools like Datadog/Grafana), and any additional files or documentation.
3. **Steerability** — how do you keep Claude honest? Agent-on-agent review (generator-critique pattern: one routine creates a PR, another routine triggers on that PR's creation to review it), live session monitoring via web UI, mid-session steering, and output verification.

Sessions run on Anthropic's managed infrastructure — no dependency on a local machine. Each routine launches a full Claude Code session that can be opened, watched, steered, and resumed from web, CLI, or desktop.

**Internal use case at Anthropic:** Sarah, the engineer maintaining Claude Code and Agent SDK docs, set up two routines:
- *Weekly docs sync* — every Monday at 10am, reviews all changes merged to main against the documentation repo, creates PRs for any gaps.
- *Issue-triggered investigation* — fires on every new GitHub issue in the docs repo, investigates whether it's a documentation gap, and opens a PR if so.

**Suggested patterns:** deploy verifier (webhook trigger after CD pipeline → run investigation with monitoring tool access → go/no-go decision on rollback), on-call investigator, PM backlog triage (weekly job reading GitHub issues and Slack channels → prioritize and open PRs for top items).

The `/schedule` command inside Claude Code creates a routine interactively — Claude asks clarifying questions about timing, notification preferences, and then generates the routine configuration.

See [Agent Harness](agent-harness.md) for the broader infrastructure concept that Routines implements as a managed service.

## Dynamic Workflows: Self-Authored Harnesses

Dynamic workflows let Claude Code write its own JavaScript harness on the fly, custom-built for the task at hand. Instead of relying on a fixed set of skill files, Claude generates a workflow script that spawns and coordinates [subagents](agent-harness.md) — choosing models, isolation levels (worktrees), and orchestration patterns dynamically. This is the logical endpoint of the thin-harness/fat-skills philosophy: the harness itself becomes authored by the agent.

**Why a separate harness matters.** The default Claude Code harness plans and executes in one context window. Over long-running or massively parallel tasks, three failure modes emerge:
- **Agentic laziness** — Claude declares the job done after partial progress (e.g., addressing 20 of 50 items in a security review)
- **Self-preferential bias** — Claude favors its own results when asked to verify them
- **Goal drift** — lossy compaction erodes fidelity to the original objective, especially edge-case requirements and "don't do X" constraints

A workflow structurally prevents these by giving each subagent its own context window and focused goal.

**Orchestration patterns.** Claude composes these when building a workflow:
- **Classify-and-act** — a classifier routes to different agents or behavior based on task type
- **Fan-out-and-synthesize** — split a task into many steps, run an agent per step, then merge results at a barrier
- **Adversarial verification** — for each worker agent, a separate agent adversarially checks its output against a rubric
- **Generate-and-filter** — generate ideas, then filter by rubric/verification and dedupe
- **Tournament** — N agents compete on the same task with different approaches; a judging agent runs pairwise comparisons until a winner emerges
- **Loop until done** — spawn agents in a loop until a stop condition is met (no new findings, no more errors) rather than a fixed number of passes

**Use cases beyond coding.** Workflows are sometimes more useful for non-technical work: sorting support tickets by severity via tournament (comparative judgment beats absolute scoring), mining session history for recurring corrections to distill into CLAUDE.md rules, triaging bug backlogs at scale with quarantine patterns (agents reading untrusted content are barred from high-privilege actions), root-cause investigation with structurally independent hypothesis generation, and taste-based exploration (design or naming) with rubric-driven review agents.

**Migrations and refactors** are a signature use case — Bun's rewrite from Zig to Rust used workflows to break the migration into per-callsite/per-module subagents running in worktrees, with adversarial review agents merging results.

**Dynamic vs. static.** Static workflows (built with the Claude Agent SDK or `claude -p`) must handle all edge cases generically. Dynamic workflows are tailor-made: Claude analyzes the specific task and writes a custom harness. The trigger word "ultracode" ensures Claude creates a workflow rather than working inline.

**Practical tips:** pair workflows with `/goal` (hard completion requirement) and `/loop` (repeated execution for triage, research, or verification). Set explicit token budgets ("use 10k tokens") to cap usage. Save workflows by pressing "s" in the workflow menu — they can be checked into `~/.claude/workflows` or distributed as skills.

**Tradeoff:** dynamic workflows use significantly more tokens than working in a single context. Best reserved for tasks that genuinely need parallel subagents, adversarial verification, or structured multi-step orchestration — not routine coding where one context window suffices.

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
- "GBrain: Build your personal mini-AGI" — Garry Tan (GitHub) ([link](https://github.com/garrytan/gbrain))
- "Meta-Meta-Prompting: The Secret to Making AI Agents Work" — Garry Tan (tweet, May 2026) ([link](https://x.com/garrytan/status/2053127519872614419)). Full walkthrough of GBrain in production: 100K pages, skillify meta-skill, cross-modal eval, entity propagation, book-mirror pipeline, and the compounding personal AI thesis.
- "Using Claude Code: The Unreasonable Effectiveness of HTML" — Thariq (tweet, May 2026). HTML as artifact format for Claude Code outputs — specs, plans, reports, prototypes, interactive editors.
- "Agent Skills" — Addy Osmani (blog, May 2026) ([link](https://addyosmani.com/blog/agent-skills/)). Twenty markdown skill files encoding senior-engineer SDLC phases for AI coding agents. Anti-rationalization tables, progressive disclosure, Google engineering practices, portable across Claude Code / Cursor / Gemini CLI / Codex.
- "Build a proactive agent workflow with Claude Code" — Maya / Anthropic Applied AI (Code with Claude workshop video, May 2026). Introduces Routines: managed-infrastructure proactive automation for Claude Code with schedule and event-based triggers, connectors, and interactive steerability.
- "A harness for every task: dynamic workflows in Claude Code" — Thariq / Anthropic (tweet + blog, Jun 2026) ([link](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)). Dynamic workflows: Claude writes its own JavaScript harness on the fly. Orchestration patterns (fan-out, adversarial verification, tournament, classify-and-act), failure modes (agentic laziness, self-preferential bias, goal drift), use cases from migrations to non-technical work, and tips for token budgets and sharing.
