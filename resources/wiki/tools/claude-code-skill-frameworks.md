---
created_at: 2026-04-05
last_updated: 2026-07-15
---

# Claude Code Skill Frameworks

> TLDR: Claude Code is a full agent platform, not just a coding tool — it shares every capability that made OpenClaw go viral (broad context, real-world actions, memory, teachable skills, autonomous scheduling) but with cleaner session architecture and plain-text debuggability. Out of the box it's a powerful but "mushy" single-mode tool; four major skill frameworks — gstack, Superpowers, Compound Engineering, and Agent Skills — add explicit cognitive modes and structured workflows on top, each solving a different layer: decisions/QA, process discipline, cross-session knowledge accumulation, and senior-engineer SDLC enforcement. Anthropic's first-party Routines feature adds managed-infrastructure proactive automation with schedule and event-based triggers.

## Recent Updates

- **2026-07-15:** Added [The .claude/ Folder Anatomy](#the-claude-folder-anatomy) section — full structural reference for project and global configuration directories, path-scoped rules, and the commands/skills/agents distinction.
- **2026-06-27:** Added [Claude Code as Agent Platform](#claude-code-as-agent-platform) section with OpenClaw comparison and Claudie case study; removed stale Overview; folded framing into TLDR.

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

## The .claude/ Folder Anatomy

The `.claude/` folder is the control center for how Claude behaves in a project. Understanding its structure is a prerequisite for using any of the frameworks above effectively — gstack, Superpowers, Compound Engineering, and Agent Skills all live inside this folder as commands, rules, or skills.

**Two directories, not one.** The project-level `.claude/` folder holds team configuration (committed to git). The global `~/.claude/` folder holds personal preferences and machine-local state like session history and auto-memory. Claude reads both and combines them.

**CLAUDE.md** is the highest-leverage file in the system. It loads into the system prompt at session start and stays in context for the entire conversation. Best practice: keep it under 200 lines — longer files eat context and instruction adherence drops. Include build/test/lint commands, key architectural decisions, non-obvious gotchas, and import/naming conventions. Leave out anything that belongs in a linter config or a linked doc. A personal `CLAUDE.local.md` (auto-gitignored) sits alongside it for overrides you don't want committed.

**The rules/ folder** solves the scaling problem. When CLAUDE.md gets crowded, split instructions into separate markdown files by concern (`code-style.md`, `testing.md`, `api-conventions.md`). Every file in `.claude/rules/` loads alongside CLAUDE.md automatically. Path-scoped rules add a YAML frontmatter `paths:` field and only activate when Claude is working with matching files — a rule scoped to `src/api/**/*.ts` won't load when editing a React component.

**Commands vs. skills vs. agents** — three distinct extension points with different trigger models:

- **Commands** (`.claude/commands/`) are user-invoked slash commands. A file named `review.md` becomes `/project:review`. They support shell interpolation (`!` backtick syntax embeds command output) and `$ARGUMENTS` for parameters. Single files, not packages. Personal commands in `~/.claude/commands/` show up as `/user:command-name`.
- **Skills** (`.claude/skills/`) are workflows Claude can invoke on its own when the task matches the skill's description. Each skill lives in its own subdirectory with a `SKILL.md` file using YAML frontmatter (`name`, `description`, `allowed-tools`). Unlike commands, skills can bundle supporting files alongside them — a `@DETAILED_GUIDE.md` reference pulls in a companion document. Skills are packages; commands are single files.
- **Agents** (`.claude/agents/`) are specialized subagent personas spawned in isolated context windows. Each agent markdown file specifies its own system prompt, tool restrictions (`tools: Read, Grep, Glob`), and model preference (`model: sonnet` or `haiku` for cheaper focused tasks). The agent does its work, compresses findings, and reports back without cluttering the main session.

**settings.json** controls permissions via `allow` and `deny` lists. Allowed tools run without confirmation; denied tools are blocked entirely; anything unlisted prompts for approval. A sensible default allows `Bash(npm run *)`, read-only git commands, and file operations, while denying `rm -rf *`, `curl *`, and `.env` reads. `settings.local.json` (auto-gitignored) handles personal permission overrides.

**The global ~/.claude/ folder** holds `CLAUDE.md` (loads in every session across all projects), `projects/` (session transcripts and auto-memory per project), and personal `commands/`, `skills/`, and `agents/` directories available everywhere.

## Claude Code as Agent Platform

The perception gap between Claude Code and [OpenClaw](../people/peter-steinberger.md) was always marketing, not capability. OpenClaw was marketed as an AI agent; Claude Code was marketed as a coding tool. Underneath, both are the same thing: a [harness](agent-harness.md) for an AI model — the software layer deciding how the model receives context, which tools it can use, how it remembers things, and how it talks to the outside world.

Five capabilities made OpenClaw go viral, and Claude Code has every one:

1. **Broad context** — OpenClaw feels like an employee because it runs from the home folder, seeing every file and note. Claude Code can do the same — most people just confine it to a single project folder, which makes it *feel* like a coding tool. Give it broader filesystem access and it becomes a general-purpose agent.
2. **Real-world actions** — Both operate computers directly (creating files, running programs, reading webpages) and integrate external services via MCP.
3. **Memory** — Claude Code offers three layers: CLAUDE.md files (plain text, always in context), built-in memory tracking, and optional search engines indexing documents.
4. **Teachable skills** — Both use text-based skill definitions that transfer between platforms. This is the layer the frameworks on this page operate on.
5. **Autonomous scheduling** — Claude Code's headless mode (`claude -p`) pairs with cron jobs or [Routines](#routines-first-party-proactive-automation) to replicate OpenClaw's heartbeat feature for overnight task execution.

**Where Claude Code wins architecturally:** OpenClaw accumulates tokens in a single session — 50,000+ by midday — causing unpredictable costs and context degradation. Claude Code starts fresh threads with 2,000–5,000 token baselines. OpenClaw's memory uses eight bootstrap files plus dreaming processes and multiple storage layers, making debugging difficult; Claude Code's plain-text CLAUDE.md approach is straightforward to inspect and fix. [[source]](https://every.to/source-code/claude-code-is-the-openclaw-alternative-you-already-have)

**Claudie — production case study:** Every's consulting team built an AI employee ("Claudie") on Claude Code running 24/7 on a Mac Mini. The implementation required ~1,100 lines of Python connecting Claude Code to Slack, then Claude handled scheduling, memory management, and Google Workspace/Asana integration independently. The team chose Claude Code over OpenClaw specifically for operational reliability — shifting development focus from infrastructure maintenance toward feature development. [[source]](https://every.to/source-code/claude-code-is-the-openclaw-alternative-you-already-have)

## Building Your First Skill Library

The most common mistake when starting a skill library is beginning with lightweight tasks — summarizing meeting minutes, polishing paragraphs, categorizing emails. These produce a tidy folder of prompts that nobody opens, because today's models already handle them out of the box.

**Start with judgment-heavy work instead.** The right first question isn't "what prompts can I organize?" but "what task recurs frequently where I still feel the need to personally double-check it?" PRD reviews, support escalations, launch QA, code reviews, brand voice checks, sales call prep — these follow a process on the surface, but at critical junctures they require an experienced pair of eyes. When those judgments live only in someone's head, the company pays a recurring cost: a senior goes on PTO and review quality drops, a project pauses and the agent references outdated state, old project preferences pollute a new one.

A skill library captures the **sequence of judgment** — not what was said last time, but what to check first next time, who to trust, where to stop, and how to fix errors. The difference between a prompt and a skill: the prompt saves "assess severity and draft a reply"; the skill encodes "check customer tier first, review the last interaction, scan for risk keywords, route to the right team, trust the latest CRM record over older threads, and stop for a human if refund status or delivery timeline is uncertain."

### Five Layers of a Skill Library

**Layer 1 — Skill Map.** List skills by workflow (escalation triage, launch QA, content review), not by tool (Slack skill, Notion skill). An agent matching a task asks "what work am I doing," not "what tool should I open." A v0 library needs only 3–5 skills.

**Layer 2 — Boundaries.** Every skill must know when to step in and exactly when to exit. Content review owns quality, not fact-checking. Research synthesis owns data aggregation, not final tone. Without boundaries, three skills fight over one problem, or one skill tries to do everything and degrades into a generic CLAUDE.md.

**Layer 3 — State Source.** Multi-day tasks need a current state source (STATUS.md, Notion page, Linear issue, CRM record) answering: what version are we on, what's locked, what's pending, why did we change it last time, which old directions were already rejected. Many agent failures trace to looking at the wrong version.

**Layer 4 — Routing.** As the library grows, never dump all skill documents into context at once. A good library acts as a receptionist: "client wants a refund" routes to Escalation, "last look before go-live" routes to Launch QA. Skills need internal micro-routers too — starting a project loads templates, fixing a wrong output loads failure modes, a quick question skips historical context. This is [progressive disclosure](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) applied at the library level: show the entrance first, read the full skill after a match, load deeper references only when needed.

**Layer 5 — Maintenance.** Skill libraries rot. Models upgrade, making old rules a burden. Team members rotate, owners vanish. Projects pivot, state sources expire. Maintenance protocols: failed to trigger → fix the description. Triggered by mistake → narrow boundaries. Referenced old state → fix the source of truth. Repeated an error → add a failure mode. Model handles it natively now → delete the rule. Unused for three months → archive. For stricter maintenance, give every skill a small trigger eval with should-trigger and should-not-trigger queries.

### Failure Records Over Prompts

Three recurring failure patterns illustrate why encoding judgment matters more than saving prompts:

- **Phase transitions** — rules that work in one phase break in the next. A storyboard requires clear separation between frames; production requires smooth transitions. Baked into a skill: "before entering a new phase, verify if the correct practices from the previous phase still apply."
- **Conflicting inputs** — when text instructions say one thing but reference images, old versions, or state logs say another, output drifts. Skill discipline: input materials are also instructions. Old examples are for structural reference only; current state, brand guidelines, and client brief are the source of truth.
- **Ambiguous feedback** — "I don't like blue" doesn't mean all blues are wrong. "It doesn't feel premium" doesn't mean start over. Codified workflow: review the output yourself, ask for the specific pain point, judge if it's a minor tweak / pivot / redo, draft a revision plan, execute only after confirmation. This saves not one generation cost but three rounds of pointless rework.

### Sizing V1

Pick three workflows that recur most frequently and rely most heavily on judgment. For V1, each skill needs to clearly define six things: (1) when to use it, (2) what to read before starting, (3) what the key judgment points are, (4) what the output format is, (5) what actions require stopping to ask a human, (6) how to patch rules when it fails. V1 can be short — build it out as it runs. In month one, adoption matters far more than perfection. Three skills used daily deliver more value than thirty skills rotting in a folder.

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

A workflow structurally prevents these by giving each subagent its own context window and focused goal. Three capabilities make this possible: per-agent isolation (own context, no cross-contamination), per-agent model choice (Opus for hard reasoning, Haiku for cheap exploration, Sonnet for the middle), and per-agent isolation level (worktree for an isolated git checkout, or remote for no checkout).

**Core API.** Three functions do most of the work: `agent()` spawns a single subagent with a prompt, model, and optional structured output schema. `parallel()` fans out multiple agent calls and acts as a **barrier** — it waits for all results before returning. `pipeline()` is **streaming** — each item flows through every stage independently, which is cheaper and faster when you don't need all results before proceeding. The decision rule: *do I need all results before I can do anything next?* Yes → `parallel()`. No → `pipeline()`.

**Orchestration patterns.** Claude composes these when building a workflow:
- **Classify-and-act** — a classifier routes to different agents or behavior based on task type
- **Fan-out-and-synthesize** — split a task into many steps, run an agent per step, then merge results at a barrier
- **Adversarial verification** — for each worker agent, a separate agent adversarially checks its output against a rubric
- **Generate-and-filter** — generate ideas, then filter by rubric/verification and dedupe
- **Tournament** — N agents compete on the same task with different approaches; a judging agent runs pairwise comparisons until a winner emerges
- **Loop until done** — spawn agents in a loop until a stop condition is met (no new findings, no more errors) rather than a fixed number of passes

**Use cases beyond coding.** Workflows are sometimes more useful for non-technical work: sorting support tickets by severity via tournament (comparative judgment beats absolute scoring), mining session history for recurring corrections to distill into CLAUDE.md rules, triaging bug backlogs at scale with quarantine patterns (agents reading untrusted content are barred from high-privilege actions), root-cause investigation with structurally independent hypothesis generation, and taste-based exploration (design or naming) with rubric-driven review agents.

**Migrations and refactors** are a signature use case — Bun's rewrite from Zig to Rust used workflows to break the migration into per-callsite/per-module subagents running in worktrees, with adversarial review agents merging results.

**Pattern composition.** The six patterns rarely appear alone. Real workflows compose 2–4: migrations use fan-out (one agent per callsite in a worktree) → adversarial verification (separate agent reviews each fix) → loop until done. Deep research uses fan-out (parallel searches) → adversarial verification (each claim checked independently) → synthesize (one cited report). Root-cause investigation generates theories from disjoint evidence via fan-out → runs a panel of verifiers and refuters per theory → loops until one survives. Sorting 1,000+ items uses tournament with pairwise comparison, never absolute scoring. The selection heuristic: identify which failure mode your task suffers from, then pick the pattern that structurally prevents it — drift → fan-out, self-preference → adversarial verification, open-ended → loop until done, hard-to-score → tournament.

**Quarantine pattern.** Any workflow processing untrusted content — support tickets, bug reports, scraped data, third-party API output — needs a quarantine boundary. Agents that *read* untrusted content are barred from high-privilege actions. Separate agents, with no exposure to the raw content, do the acting. A 30-line read-only reader agent costs almost nothing and removes an entire class of prompt injection risk.

**Dynamic vs. static.** Static workflows (built with the Claude Agent SDK or `claude -p`) must handle all edge cases generically. Dynamic workflows are tailor-made: Claude analyzes the specific task and writes a custom harness. The dynamic version wins because the workflow shapes itself around your context — reading your code, checking each feature against actual docs, pricing at your transaction volume, and running adversarial passes against its own emerging answer. The trigger word "ultracode" ensures Claude creates a workflow rather than working inline.

**Practical tips:** pair workflows with `/goal` (hard completion requirement) and `/loop` (repeated execution for triage, research, or verification). Set explicit token budgets ("use 10k tokens") to cap usage — without a cap, ambitious workflows balloon to 5–10x expected token usage. Save workflows by pressing "s" in the workflow menu — they go to `~/.claude/workflows`. From there, bundle the JavaScript file inside a Skill folder and reference it in SKILL.md to distribute as a shareable skill. When packaging a workflow into a Skill, prompt Claude to treat the workflow as a template rather than a script to run verbatim — this leaves room for adaptation while keeping the overall structure intact.

**Common mistakes:** reaching for a workflow when a single context window would suffice; no token budget (costs balloon); one agent doing both work and verification (self-preferential bias); treating `parallel()` and `pipeline()` as interchangeable (the barrier semantics matter); skipping `/goal` on loop patterns (workflow stops at the first soft completion point); letting untrusted content reach the actor (quarantine is mandatory); sorting with absolute scores instead of comparative judgment; never saving working workflows (re-prompting the same shape every week).

**Tradeoff:** dynamic workflows use significantly more tokens than working in a single context. Best reserved for tasks that genuinely need parallel subagents, adversarial verification, or structured multi-step orchestration — not routine coding where one context window suffices.

## Anti-Fabrication Stack

A 4-layer configuration that makes fabrication structurally expensive rather than relying on model improvements alone. The core insight: Claude is a text predictor, and when it doesn't know something it predicts text that *looks* right — made-up function names, fake imports, "tests pass" when nothing ran. The fix is making output checkable in real time and making "I don't know" cheaper than guessing.

**Layer 1 — CLAUDE.md honesty rules.** Explicit rules requiring verification before claiming a function/class/import exists, prohibiting fabricated error messages or stack traces, and — critically — granting an "I don't know" license. By default Claude is optimized to look helpful, and admitting ignorance feels unhelpful unless given explicit permission. The rule "when you genuinely don't know, the correct answer is 'I don't know'" is the most important line because most people never grant it.

**Layer 2 — Verification-before-write protocol.** Before writing code that uses a symbol, Claude must read the defining file, grep for it, or check the dependency manifest. If verification is skipped, the code must be prefixed with `// UNVERIFIED: I have not confirmed this symbol exists`. Plan mode is preferred for multi-file tasks — it's where wrong assumptions surface before any code is written.

**Layer 3 — PostToolUse hooks.** Type checkers and linters run automatically every time Claude writes or edits a file. If Claude invents an import, `tsc` or `pyright` fails instantly and the error goes back into context — Claude must fix it before claiming the task is done. A `Stop` hook running the test suite prevents "done, tests pass" claims without actual execution. No invented code survives a PostToolUse check.

**Layer 4 — Fact-checker subagent.** A dedicated `.claude/agents/fact-checker.md` agent whose only job is verifying claims before they ship. It identifies every factual claim in the conversation (code behavior, test results, library capabilities, import correctness), independently verifies each one by reading files and running commands, and produces a VERIFIED / WRONG / UNVERIFIABLE report. Invoked before commits or before sharing results.

**The human layer.** The four technical layers don't stick without the behavioral one: rewarding "I haven't verified this" with patience rather than frustration. Punish honesty once and Claude reverts to guessing.

**Signs it's working:** Claude asks before adding dependencies instead of silently installing. Claude references `file:line` when discussing code. Type checker and linter output stays clean because hooks catch fabrications instantly and Claude self-corrects.

**Common setup mistakes:** CLAUDE.md too long (honesty rules must be in the first 50 lines). Hook output not reaching stdout (Claude doesn't know it lied). Skipping plan mode (cheapest moment to catch wrong assumptions). Not invoking the fact-checker agent. Reacting badly to "I don't know."

This pattern complements the [Agent Skills](agent-harness.md) principle that verification is non-negotiable — every skill terminates in concrete evidence. It also aligns with [dynamic workflows'](agent-harness.md) adversarial verification pattern, but operates at the session level rather than the workflow level.

## Verification Feedback Loops

Claude already self-verifies against deterministic signals — type errors, lint errors, failing tests, runtime errors. The gap is the *manual* checks developers run after Claude responds and before merging: opening a browser, clicking through the UI, checking the console, watching for layout shifts, running a performance trace. Encoding those checks as skills closes the loop and lets Claude work more independently on long-running tasks.

**The process:** start by writing down the best-practices version of what you already do manually. Every domain has one — frontend developers open the dev server and click around; backend developers hit endpoints and check logs; data engineers validate row counts and schema. For each step, identify a tool Claude can use: browser DevTools MCP for performance traces, Agent Browser for visual inspection, test runners for integration checks, accessibility auditors for a11y compliance.

**Encode as a skill.** The `skill-creator` plugin interviews you about your workflow and generates a skill file. Taste and judgment are hard to codify, but many checks have measurable criteria: a performance budget, an accessibility checklist, design-system rules, good-vs-bad examples. A frontend-verify skill might instruct Claude to open the URL in a browser, interact with the changed element, then run a mobile performance audit via Chrome DevTools MCP — all before responding to the user.

**Two verification layers.** The full model has two structurally distinct layers:
1. **In-loop verification** — skills that run *while Claude is building*, catching issues before the first response. This is where encoded manual checks live.
2. **Pre-merge review from a separate agent** — a fresh agent reviews the code without carrying the authoring agent's biases. Options range from `/review` (built-in single-pass) to `/code-review` (plugin spinning up parallel subagents, each reading the diff from a different angle) to Claude Code Review (managed service on every PR for Team/Enterprise plans). The isolation is the point: a new context window produces a more honest review.

**Composing skills.** Skills can call other skills, rolling an entire development lifecycle into one workflow. The Claude Code team bundles `/simplify` (clean up the diff), a custom `/verify` (end-to-end confirmation), a design check (if UI changed), PR creation, and CI monitoring into a single composite skill. The user kicks off one command; Claude verifies and ships without babysitting. This is the same thin-harness/fat-skills principle applied to the verification layer: each skill is a focused procedure, and the composite skill is the orchestration.

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
- "Start with Repetitive, High-Judgment Work: Building Your First Skill Library" — Vox (tweet, Jun 2026). Practical guide to building a first skill library: start with judgment-heavy recurring work, five-layer library architecture (skill map, boundaries, state source, routing, maintenance), failure records over prompts, and V1 sizing.
- "How to Make Claude Code Stop Making Stuff Up When It Doesn't Know" — rody (tweet, Jun 2026). 4-layer anti-fabrication setup: CLAUDE.md honesty rules, verification-before-write protocol, PostToolUse hooks for real-time type checking, and a fact-checker subagent.
- "Feedback loops: Help Claude Code complete ambitious tasks with less babysitting" — Delba (tweet, Jun 2026). Encoding manual verification processes as skills, two-layer verification model (in-loop + pre-merge review), and composing skills into end-to-end workflows.
- "Claude Code Is the OpenClaw Alternative You Already Have" — Nityesh Agarwal / Every (article, Jun 2026) ([link](https://every.to/source-code/claude-code-is-the-openclaw-alternative-you-already-have)). Claude Code as full agent platform vs OpenClaw: five shared capabilities, session architecture advantages, Claudie production case study.
- "Anatomy of the .claude/ folder" — Akshay Pachaar (tweet, Jul 2026). Complete guide to the .claude/ folder structure: two directories (project vs global), CLAUDE.md best practices and 200-line limit, rules/ with path-scoped frontmatter, commands vs skills vs agents distinction, settings.json permissions, and progressive setup advice.
- [Welcome to the Printing Press](https://printingpress.dev) — landing page for Printing Press CLI factory
