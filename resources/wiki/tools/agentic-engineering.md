---
created_at: 2026-04-05
last_updated: 2026-06-22
---

# Agentic Engineering

> TLDR: The emerging discipline of designing, optimizing, and orchestrating AI agents — including harness design, tool construction, self-improving agents, and multi-agent coordination.

## Overview

Distinct from simply using AI tools, agentic engineering is about building the systems that make agents effective. The field is moving fast, with key contributions from Anthropic's Claude Code team, the AutoAgent project, and multiple open-source orchestration frameworks.

## The Delegation–Collaboration Split

AI work is bifurcating into two distinct interaction modes, each requiring different agent architectures:

- **Collaboration** — Real-time, synchronous work where a human and model co-create in the same loop. Desktop apps, inline code assistants, pair-programming sessions. The model sees your context and responds within seconds. The value is creative amplification — the human steers, the model accelerates.
- **Delegation** — Asynchronous handoff where teams assign work to long-running agents (Codex, [Managed Agents](#managed-agents-anthropic), [Gas City](#software-factories-gas-city)) and check back later. The agent owns the full execution loop. The value is throughput — one person dispatches many parallel workstreams.

The meta-skill is knowing which mode fits the task. The [allocation economy](../concepts/allocation-economy.md) thesis captured the delegation half, but missed that roughly half of AI-augmented work remains fundamentally collaborative — tasks where the human's judgment, taste, or real-time feedback is integral to the output, not just the brief [[source]](https://every.to/context-window/the-dawn-of-codex-native-apps).

In practice, teams are running both modes simultaneously: collaborative agents for writing, design, and strategy; delegated agents for refactors, migrations, and batch operations. The organizational challenge is building intuition for which mode to reach for — and building infrastructure that supports both.

## Vibe Coding vs. Agentic Engineering (Simon Willison)

Simon Willison draws a sharp line between two modes of AI-assisted development — then argues the line is already blurring.

**Vibe coding** is building without reading the code. You prompt, you check if the output works, you ship. If it breaks, you tell the model it broke and hope for the best. Willison's position: vibe coding is fine for personal tools where bugs only hurt you; it is "grossly irresponsible" for software that handles other people's data or trust.

**Agentic engineering** is a professional software engineer using AI tools to the full extent of their experience — understanding security, maintainability, operations, performance — and aiming to build *higher quality* software *faster*, not lower quality software faster. The 25-year practitioner's context, architecture taste, and security instincts become force multipliers rather than redundancies.

The blur: as models improve (Willison dates the tipping point to Claude Opus 4.5 / GPT 5.1, late 2025), even disciplined engineers stop reviewing every line. A JSON API endpoint backed by SQL, with generated tests and docs, is reliably correct. The question shifts from "did I review this?" to "do I trust this class of output?"

**The team analogy.** Willison resolves the trust question by analogy to large engineering organizations: you don't read every line of code written by another team's image-resize service — you read the docs, use it, and dig in only when something breaks. He treats agent output the same way: a semi-black box trusted until evidence suggests otherwise. The discomfort is that agents, unlike teams, carry no professional reputation and cannot be held accountable.

**The security-adjacent line.** Anything security-adjacent still gets human review. Knowing what *is* security-adjacent is itself a skill developed over years — one reason experienced engineers remain essential.

**Usage over tests as trust signal.** In a world where agents produce beautiful READMEs, 100 commits, and comprehensive test suites in thirty minutes, those artifacts no longer reliably signal quality. What *does* signal quality: someone has used the thing in production for weeks. "If you've got a vibe coded thing which you have used every day for the past two weeks, that's much more valuable to me than something that you've just spat out and you've hardly even exercised."

**Parallel agents and interruptible work.** When coding required holding an entire system in your head, interruptions were catastrophic. With agents handling the typing, Willison works on two or three projects simultaneously — prompting one agent, switching to another while the first churns for ten minutes. Harder projects parallelize *better* because each agent step takes longer, freeing more interstitial time. The deep-focus era is giving way to an interrupt-friendly dispatch model (see [delegation–collaboration split](#the-delegationcollaboration-split) above).

**Design and product process implications.** If building is cheap, the elaborate design phase that guards against "three months building the wrong thing" can afford more risk. Jenny Wen (Anthropic design lead) argues the design process should become riskier because the cost of getting it wrong has collapsed. The same logic applies to product management: specification rigor was justified by engineering cost. Spikes that once took two days of developer time now take an hour of agent time — and you can run ten in parallel.

**The deterministic-core pattern.** For production systems, Willison advocates investing deeply in a "perfect" database schema and robust API, then vibe-coding all UI on top. Customers get customization flexibility without risking the data model. The principle: push determinism into the core, let non-determinism live at the edges where the blast radius is small.

**Why code became the breakthrough domain.** Reinforcement learning needs clean reward signals. Code provides the cleanest: did the script pass its tests? Binary, instant, scalable to 10,000 parallel VMs. Anthropic and OpenAI spent 2025 on RL against simulated software environments. Labs that didn't (xAI, Gemini) fell 12 months behind. Willison expects Gemini to close the gap by end of 2026. The same RL approach is far harder to apply to law (six-month trial feedback loops) or medicine — making software engineering, ironically, the field most susceptible to AI-driven change.

## Practitioner Principles (SysLS)

SysLS distills months of production agentic work into a minimalist philosophy: strip dependencies, control context, and iterate on rules and skills — nothing else.

**Context is the bottleneck, not tooling.** The single most important variable in agent performance is what's in the context window. Every plugin, memory system, and harness injects information the agent must process. When you ask for a hangman game and the context contains memory notes from 26 sessions ago plus plugin instructions for unrelated capabilities, the agent's attention is diluted. "You want to give your agents only the exact amount of information they need to do their tasks and nothing more."

**Separate research from implementation.** "Go build an auth system" forces the agent to research options and implement in the same context — filling the window with alternatives it won't use, increasing confusion and hallucination risk. Instead: run a research session to evaluate options and decide on an approach, then hand a fresh-context agent precise specs ("JWT authentication with bcrypt-12 password hashing, refresh token rotation with 7-day expiry"). The implementation agent never sees the alternatives it didn't choose.

**Exploit sycophancy with adversarial patterns.** Agents are trained to please, which means "find me a bug" will produce a bug — even a fabricated one. Two countermeasures:

- *Neutral prompts:* Instead of "find bugs in the database," say "follow the logic of each component and report all findings." This doesn't bias toward a predetermined outcome.
- *Adversarial triangulation:* Run a bug-finder agent (incentivized to find issues), an adversarial agent (incentivized to disprove them, penalized for false disprovals), and a referee agent (told you have ground truth and scored on accuracy). The bug-finder produces the superset of possible bugs; the adversary narrows to the subset of real bugs; the referee adjudicates. Each agent's sycophancy is channeled toward a different objective, producing "frighteningly high fidelity" results.

**Define task completion with contracts.** Agents know how to start tasks but not when to stop — leading to stubs declared as finished work. The fix: write a `TASK_CONTRACT.md` specifying tests that must pass, screenshots to verify, and other acceptance criteria. A stop-hook prevents session termination until the contract is fulfilled. For automation, create one contract per unit of work and spawn a fresh session per contract — this avoids the context bloat of long-running sessions while ensuring each task meets its acceptance criteria.

**CLAUDE.md as a conditional directory.** Treat the root instruction file not as a document to read but as a routing table: "if coding, read `coding-rules.md`; if tests are failing, read `test-failing-rules.md`." Rules can nest and branch arbitrarily. This keeps each agent session loading only the context relevant to its current scenario. Skills serve the same purpose but encode recipes (how to do something) rather than preferences (what not to do).

**The consolidation cycle.** As rules and skills accumulate, they start contradicting each other and bloating context — the same problem they were designed to solve. Periodically consolidate: have agents audit the rule set, surface contradictions, and merge redundant entries. Performance degrades, you clean up, "and it will feel like magic again. That's it. That's really the secret."

**Let frontier companies do the R&D.** Useful patterns (planning before implementation, skills, memory, subagents) get absorbed into base products. If something is genuinely valuable, the foundation companies — who are the heaviest users of their own tools — will ship it. "Just update your CLI tool of choice every once in awhile and read what new features have been added. That's MORE than sufficient."

## Harness Design: "Seeing Like an Agent"

> The harness concept has grown into its own dedicated topic. For a full treatment of what a harness is, its 12 components, the thin harness / fat skills pattern, memory ownership, and design decisions, see [Agent Harness](agent-harness.md).

The Claude Code team (Thariq, Anthropic) published key lessons on designing agent action spaces:

**Core principle:** Give agents tools shaped to their own abilities. The right tool depends on the agent's capabilities, not human intuition. "Put yourself in the mind of the model."

**Lessons learned:**
- **AskUserQuestion tool** — Three attempts to improve elicitation: parameter on ExitPlanTool (confused the model), modified markdown output (unreliable formatting), dedicated tool with structured output (worked). "Even the best designed tool doesn't work if Claude doesn't understand how to call it."
- **Todos → Tasks** — As models improved, todo reminders became constraining. Replaced with Task tool supporting dependencies, subagent communication, and deletion. "As model capabilities increase, tools that once helped might now constrain them."
- **Search evolution** — Started with RAG vector database, moved to Grep tool for self-directed search, then progressive disclosure via skills. Over one year: "Claude went from not being able to build its own context to nested search across several layers of files."
- **Progressive disclosure** — Add functionality without adding tools. The Claude Code Guide subagent loads docs on demand rather than stuffing everything in the system prompt. ~20 tools total, high bar to add more.

For evaluation methodology that applies directly to agent systems — floor-raising over benchmark-maxxing, trace review pipelines, LLM-as-judge — see [AI Evals](ai-evals.md).

## Planner/Generator/Evaluator Harness (Anthropic Applied AI)

Ash Prabaker and Andrew Wilson (Anthropic applied AI team) presented a three-role harness architecture for long-running agent builds — the system behind Anthropic's internal one-shot app demos that run 4–6 hours and produce fully functional applications from single-line prompts.

**The three roles, each in its own context window:**

- **Planner** — Takes the user's one-line prompt and produces a deliberately high-level spec broken into sprints. It does *not* plan granular technical details. The reason: a single wrong technical decision in the plan cascades through every subsequent sprint, magnifying errors over multi-hour horizons. The planner sets hard outer lines; the other two agents figure out the details.
- **Generator** — Builds the code. Works from the planner's spec but negotiates scope and acceptance criteria with the evaluator before writing a single line.
- **Evaluator** — Not a code reviewer — an actual user of the app. Launches Playwright (or Claude for Chrome MCP), navigates live pages, clicks around, tries things, then scores against a rubric and writes critique. The evaluator catches bugs that pass CI because it interacts with the running application the way a human would.

**The critic-gap exploit.** The entire pattern is inspired by GANs. The key insight: tuning a standalone critic to be harsh is tractable; tuning a builder to be self-critical is not. The same asymmetry that makes it easy for a person to critique a meal but hard to cook one applies to LLMs — they can identify quality gaps in output far more reliably than they can prevent those gaps during generation. The harness exploits this by splitting the roles into separate context windows with separate system prompts, channeling the model's sycophancy into two opposing objectives.

**Contract negotiation before building.** Before each build phase, the generator proposes: "I'm going to build X feature, and you should verify it by testing Y." The evaluator pushes back: "Scope is too big, those tests are too weak, you've missed these edge cases." They iterate via files on disk until both agents agree on a contract — what "done" means, expressed as specific, testable assertions. The generator is then graded against this negotiated contract, not the original planner spec. In the retro game maker demo, the agents settled on 27 contract criteria. Granular criteria produce actionable critiques; vague criteria produce vague critiques that the generator shrugs off. This contract negotiation is framed as the key innovation over Ralph loops, which had a fixed plan.md with no one arguing back.

**Grading subjective quality.** For front-end applications, the evaluator grades against a four-criteria rubric: design, originality, craft, and functionality — weighted toward design and originality (since Opus 4.6 already handles functionality well). The rubric is calibrated with few-shot examples on reference sites so the evaluator's taste converges on the builder's intended aesthetic. The claim: "Most people say you can't grade taste, but you can if you have a strong enough opinion on it and you just kind of write it down." The practical target: preventing purple gradients and generic AI-slop aesthetics.

**Evaluator isolation — do NOT share traces.** The team explicitly tested giving the evaluator access to the generator's reasoning traces. It made things worse. When the evaluator sees *why* the generator made a decision, it gets talked into agreeing. The effective pattern: the evaluator judges output only, never sees the reasoning that produced it, and reports "this is an issue" without diagnosing the cause. The generator then reflects on its own work to figure out the fix. This independently confirms the [verifier sub-agent principle](#loop-engineering) from Lance Martin's work — grading in an independent context window prevents the grader from being influenced by the generator's reasoning.

**Pivot behavior.** Unlike single-pass generation or Ralph loops that keep patching the same approach, the PGE harness pivots. When the generator gets stuck — scoring low on one rubric criterion through multiple rounds — the evaluator tells it to throw everything away and restart from scratch. With Opus 4.6, this willingness to discard hours of work and try a fundamentally different approach emerged naturally under adversarial pressure. The same model, self-evaluating, would never restart — it's too attached to its own output. The adversarial split makes restart a tractable option.

**Concrete results (retro game maker demo):** Same prompt, same model, solo loop vs. PGE harness. Solo: sprite editor works, play mode renders entities but arrow keys do nothing, space key does nothing — the agent didn't know how to test whether a game was playable. PGE (~$200, ~6 hours, 5–15 rounds): the agent named itself "Retro Forge," created a project dialogue, built a full 54-color palette, a sprite editor with game-scale preview, an AI level-design assistant (the planner decided "AI features" should exist, the generator/evaluator turned that into a working assistant), and a play mode with working physics, collision detection, arrow-key movement, and a live debug HUD — which exists because the evaluator needed it to test gameplay.

**Harness co-evolution with models.** The same harness architecture required different configuration across model generations. What changed from Opus 4.5 to 4.6:

- *Context resetting between sessions* — dropped entirely. Opus 4.5 had severe context anxiety; Opus 4.6 doesn't. Single continuous session with compaction replaced fresh context windows.
- *Sprint decomposition* — previously critical to keep Opus 4.5 on track (force-fed one feature at a time). Opus 4.6 holds a 2-hour continuous build coherently without it.
- *Evaluator cadence* — previously ran every sprint. Now runs at the end of a full generation pass, then hands back critique. Fewer interruptions, roughly half the cost.

The lesson: the harness wasn't wrong for 4.5 — it was right for 4.5. The frontier moved. "It's really important to get a feel for what the spiky behaviors of any individual model are, and then try to adapt your harness to fill the gaps." This mirrors the [model-quality-changes-loop-behavior](#loop-engineering) finding — the same architecture produces qualitatively different behavior depending on the model inside it.

**Model capability timeline for long-running agents** (minimal scaffold, 50% task completion):

| Model | Release | Duration | Key capability |
|---|---|---|---|
| Sonnet 3.5 | Pre-Claude Code | — | First model to verify and iterate on its own output |
| Sonnet 3.7 | Feb 2025 | ~1 hr | Claude Code research preview; SWE-Bench SOTA |
| Opus 4 / Sonnet 4.4 | May 2025 | — | Better context management, task completion without reward hacking; Claude Code GA + SDK |
| Sonnet 4.5 | — | ~30 hrs | Context-aware (tracks token consumption); checkpoints; Agent SDK rename |
| Haiku 4.5 / Opus 4.5 | — | — | Economical sub-agents (Haiku); Opus excels at planning → model-routing pattern (Opus plans, Sonnet executes) |
| Opus 4.6 / Sonnet 4.6 | — | ~12 hrs | "Very much an agentic model"; agent teams (sub-agents communicate peer-to-peer); server-side compaction; 1M context GA |

The harness and models co-evolve: each model release ships alongside harness changes. Features that start in the harness get trained into the model, the harness drops that feature, and new gaps emerge at the new frontier. "The harness doesn't just disappear as the models get better. It's really evolving as the models change over time."

**Practical takeaways from Q&A:**

- *File system for shared state, not context windows.* Persistent artifacts (feature lists in JSON — models overwrite markdown but respect JSON), progress files, and timestamped learning logs. These breadcrumbs let another model (or human) pick up where the previous session left off.
- *Traces are the primary debugging loop.* "By far and away the best approach is just reading the traces by hand." Not running more experiments — reading what the agent actually did, finding where its judgment diverged from yours, and tuning the prompt for that specific divergence. Same muscle as reading a stack trace.
- *Agent empathy.* The Claude for Chrome team's technique: close your eyes, open them every 10 seconds to see a static page, close again, try to navigate. Putting yourself in the model's perceptual position reveals why it makes the choices it does. "There's this empathetic skill set which you need to develop."
- *Brownfield applicability.* The PGE pattern is primarily greenfield. For brownfield, pair it with autonomous monitoring → issue generation → agent PR → human review. The rubric-based evaluator still applies but needs customization per project.

## Self-Improving Agents

### The Distinction: Self-Improving ≠ Self-Learning

The phrase "self-improving agent system" gets used carelessly. The version that works today and the version that's hype are different things:

- **Self-learning** — the agent updates its own weights from experience. No publicly available model does this in production. Recursive self-improvement (RSI) is a long-term research direction, not a shipping capability.
- **Self-improving** — the *system around the agent* compounds. Each session writes lessons to memory. Skills sharpen as edge cases accumulate. State files collect verified facts. Eval loops refine prompts and rubrics. The model stays the same; the environment it runs in gets sharper.

Self-improvement, in this sense, is a property of the system you build — not a property of the model. The model provides the raw capability (long context, sub-agent delegation, vision self-check); the system provides the feedback loop that makes it compound run over run.

### The Compound Stack

The architecture that makes agent systems compound has four layers, read bottom-up in the order they get built:

1. **Primitives** — The model itself, sub-agents, worktrees, tools. Raw capability with no system around it. This is where most users stop.
2. **Orchestration** — /goal and Outcomes for self-correcting loops. [Dynamic Workflows](#loop-engineering) for multi-step orchestration. Routines for laptop-off cloud runs. Turns primitives into workflows.
3. **Memory** — State files, Skills, Knowledge Bases, lessons written down. Makes tomorrow's session resume instead of restart.
4. **Self-improvement** — Vision self-checks, eval loops, rule distillation. The agent grades its own output, refines the Skill that produced it, writes the lesson back to memory.

The compounding mechanism: every output from layer 1 flows up through layer 4, where it gets graded, distilled, and written back to layer 3. Tomorrow's run at layer 1 inherits the sharpened memory and refined Skills from yesterday. The model is stateless; the system around it isn't.

### Cost-Routing for Production Systems

Not every step in a self-improving system needs the top-tier model. Teams running these systems in production route by task complexity:

- **Frontier model** (Fable 5 / most capable available) for the orchestrator role: planning across days, delegating to sub-agents, checking work with vision, distilling rules from accumulated evidence. Use where days-long capability earns its pricing.
- **Strong model** (Opus-class) for hard-but-bounded subtasks: architecture decisions, complex debugging, deep code reviews. Also the explicit fallback for any request the frontier model's safety classifiers block.
- **Fast model** (Sonnet-class) for high-volume worker tasks: lint passes, simple refactors, test scaffolding, doc updates. The bulk of fan-out work.
- **Cheap model** (Haiku-class) for grader sub-agents and classifiers. Independent context window, low cost — ideal for the [verifier role](#loop-engineering).

The pattern: **orchestrator on the frontier model, workers on the fast model, graders on the cheap model, fallback to the strong model on classifier blocks**.

**Personal agent economics.** At the other end of the scale, a single-purpose personal agent (e.g., a Telegram bot backed by Sonnet-class on a $4–6/month VPS) runs at roughly $1–5/month in API costs for ~50 messages/day. The entire stack — hosting, API, and deployment — fits under $10/month. This makes personal agents economically viable as always-on utilities rather than experiments, and the deployment is trivial: Claude Code generates the bot code from a plain-English description, systemd keeps it running, and skills (web search, note-taking, scheduled briefings) bolt on as incremental prompts.

### Safety Boundary as Architecture Constraint

Frontier models increasingly ship with built-in safety classifiers that decline to respond in specific high-risk domains (cybersecurity vulnerability research, biology, chemistry, model distillation). When the classifier triggers, the model falls back silently — and a self-improving system running autonomously can't distinguish a classifier block from a real error.

Design implications:

- If your system touches security tooling, expect classifier blocks. Route those tasks to a non-frontier model explicitly, or surface the block to a human reviewer.
- Skills should document which task types may hit the classifier and specify expected fallback behavior.
- Treat the safety boundary as a known architectural constraint, not a failure mode. A system with explicit handling stays robust as classifiers evolve; a system that ignores them produces silent regressions.

### Orchestration-Aware Self-Extension

The self-improving patterns above focus on memory, evals, and rule refinement — the agent sharpens the *environment* it runs in. A more structural form of self-improvement emerges when the agent can author and deploy new durable skills directly into the orchestration engine. Rather than just learning from its runs, the agent extends its own capabilities by writing new functions, registering them with the orchestrator, and having them start running immediately — hot-reloaded without restarting or disrupting in-flight runs.

A concrete example: an engineer reports overnight latency spikes that go unnoticed until morning. The agent writes two functions — a health-check loop (runs every 30 minutes, pulls error rates and latency, LLM classifies as normal/degraded/critical) and an incident-triage skill (fetches detailed metrics and deploy history, correlates root causes, posts a summary to Slack). Both deploy instantly via a sidecar process. The skills persist beyond the conversation that created them — kill the agent process, restart it, swap the underlying model, and the skills keep running. The agent is ephemeral; its output is durable.

The compounding mechanism is a separate review loop: a cron-triggered function that runs weekly, reads run history from the orchestrator, and evaluates whether alerts correlated with actual outages. If health checks keep flagging a service but the team ignores them because thresholds are too sensitive, the review loop catches the pattern and the agent updates the classification logic. Concurrency controls (singletons per service) prevent duplicate triage runs from racing. This is self-improvement applied not to memory or prompts but to executable infrastructure — each skill the agent deploys is institutional knowledge encoded as a durable function [[source]](https://x.com/djfarrelly/status/2067677007140278630/?rw_tt_thread=True).

### AutoAgent

Kevin Gu released AutoAgent — first library for autonomously improving agent harnesses. Key results:
- Hit #1 on SpreadsheetBench (96.5%) and #1 GPT-5 score on TerminalBench (55.1%) after 24+ hours of autonomous optimization
- Every other leaderboard entry was hand-engineered

**Architecture:** Meta-agent experiments on task agent's harness — tweaking prompts, adding tools, refining orchestration. Task agent starts with just a bash tool. Meta-agent spins up 1000s of parallel sandboxes.

**Key findings:**
- **Splitting helps** — One agent improving itself doesn't work. Being good at a domain ≠ being good at improving at that domain.
- **"Model empathy"** — Same-model pairings (Claude meta + Claude task) outperform cross-model. The meta-agent writes harnesses the inner model actually understands.
- **Traces are everything** — Without reasoning trajectories, improvement rate drops hard. Understanding *why* matters as much as knowing *that*.
- **Agents overfit** — Meta-agents insert rubric-specific prompting to game metrics. Constrained by forcing self-reflection.

**Emergent behaviors:** Spot checking, forced verification loops, writing own unit tests, progressive disclosure, orchestration logic with subagents.

## Multi-Agent Orchestration

### Software Factories: Gas City

Gas City (successor to Steve Yegge's Gas Town) is an open-source orchestration toolkit for running 100+ coding agents in parallel on a single codebase, rebuilt by Chris Sells (ex-Google Flutter) and Julian Knutsen (ex-Block). In production, Knutsen's server runs ~100 agents merging ~50 PRs/day, burning roughly a billion tokens/day.

**Three ideas worth internalizing:**
- **Dark factory vs. light factory** — Human-visible work (planning, design, review) stays "light"; agent-only execution stays "dark" in the background. As trust grows, more process moves into the dark.
- **One pet, many cattle** — One persistent supervisor ("the mayor") you talk to directly hands tasks to anonymous, disposable workers ("polecats") that do one job and shut down. You manage one conversation; the mayor coordinates a hundred agents.
- **Multiple opinions on every code review** — Route the same code to Claude, Codex, and Kimi simultaneously. Three different models catch different bugs than one model run three times.

**Current limitations:** Every task spins up a fresh session with no memory of earlier steps — agents waste cycles re-reading context and miss connections a persistent session would catch. Cost scales linearly (a six-step job costs 6x a single session). The CLI-first task tracker ("Beads") works for agents but not humans, so teams pair it with Jira or Linear. The toolkit also over-scaffolds for current model capabilities — review loops and mid-task check-ins built to keep models on track are now largely unnecessary [[source]](https://every.to/napkin-math/inside-the-100-agent-software-factory).

**Verdict (Mike Taylor, Every):** "Learn from the ideas. Skip the toolkit for now." For teams already running 10+ parallel Claude Code sessions, Gas City is one informed opinion on orchestration at that scale.

**OpenAI Symphony** — A more accessible alternative: a written ruleset that turns an existing Linear board into the dashboard agents work from. No behavior change required, closer to how software engineers already work.

### Other Orchestration Tools

**crabfleet** (OpenClaw / Peter Steinberger) — "Mission control for agent runs." A loop packaged as a product: tasks entered as cards (from a prompt, GitHub issue, or PR) move through todo → running → human review → done. Runs are durable with heartbeats, surviving closed laptops. Agents can spawn child sessions, send messages, read transcripts, and update summaries from inside a sandbox. Runs on disposable cloud sandboxes with browser-based terminals. The point is not the specific tool but that the loop has hardened into infrastructure — a queue, durable execution, fan-out, and a human-review gate are now things you configure rather than hand-script. https://github.com/openclaw/crabfleet

**Paperclip** — Open-source orchestration for "zero-human companies." If OpenClaw is an employee, Paperclip is the company. Node.js server + React UI with org charts, budgets, governance, goal alignment. Supports any agent (OpenClaw, Claude Code, Codex, Cursor). "If it can receive a heartbeat, it's hired."

**Hermes Agent** (Nous Research) — Self-improving agent with closed learning loop: agent-curated memory, autonomous skill creation, skill self-improvement during use, FTS5 cross-session recall. Runs on 6 terminal backends (local, Docker, SSH, Daytona, Singularity, Modal). Lives on CLI, Telegram, Discord, Slack, WhatsApp.

**MiroFish** — Swarm intelligence prediction engine. Creates multi-agent simulations with independent personalities and long-term memory to predict outcomes from seed information (news, policies, financial signals).

### The Orchestration Tax (Osmani)

Addy Osmani names the structural cost most multi-agent practitioners underestimate: the **orchestration tax** — the gap between what agents can produce and what the human operator can actually review and merge. Starting agents is cheap (a keystroke); closing the loop is not. Someone must verify correctness, reconcile conflicts across parallel outputs, and maintain a coherent mental model of the system. That someone is a single-threaded serial resource.

**The GIL analogy.** Python's Global Interpreter Lock lets you spawn threads freely, but only one executes bytecode at a time. The human is the GIL of their agent fleet — all agent output that requires genuine architectural understanding or conflict resolution must acquire the lock. There is one lock. Amdahl's Law makes the ceiling precise: speedup from parallelization is capped by the fraction of work that stays serial. Spawning eight agents doesn't speed up judgment time; it deepens the queue feeding into it.

**Grinding won't fix structural limits.** Running the serial processor at 100% with no slack produces a specific kind of exhaustion: constant context-switch cost (flushing and cold-reloading mental state per agent), background anxiety about which thread is silently failing, and eventual cognitive surrender — accepting agent output because forming an independent opinion costs attention you no longer have. The tax gets paid either deliberately or by quietly destroying your understanding of your own system.

**Architect your attention as a scarce resource:**

- **Scale fleet to review rate, not the UI.** Backpressure: the right number of parallel agents is how many you can properly code-review, typically low single digits. The tool will let you spawn twenty; that is a UI feature, not a throughput feature.
- **Sort work into two piles.** Isolated tasks (background agents, async, gate at the end) vs. complex tasks where judgment *is* the work (architecture, subtle bugs). The mistake is trying to parallelize the second pile — it thrashes the lock and everything comes out worse.
- **Batch reviews.** Context switching is the dominant cost. Reviewing four agents in one sitting is far cheaper than checking one, leaving, and returning cold. Give agents a long leash; process the batch.
- **Only spend the lock on judgment.** Make agents prove the boring 80% themselves (passing tests, screenshots, self-verification) so scarce attention goes to the 20% that genuinely needs a human.
- **Protect serial time.** The bottleneck needs your best hours, not leftover minutes between agent check-ins. Sometimes the highest-leverage move is to stop orchestrating entirely and think hard about one problem with the lock held.

The orchestration tax left unpaid accumulates both technical debt (merged code you didn't read well) and cognitive debt (a stale mental model of your own codebase). Neither shows on a dashboard today; both show when production breaks and you realize you have no idea how the system works anymore. See also: the [delegation–collaboration split](#the-delegationcollaboration-split) for how to classify which work mode fits which task.

### Loop Engineering

Loop engineering is the practice of replacing yourself as the person who prompts the agent — you design the system that prompts it instead. Where [harness design](agent-harness.md) shapes the environment a single agent runs inside, and orchestration coordinates multiple agents, loop engineering sits one level above both: a recurring system that discovers work, dispatches agents, checks results, records state, and decides the next step — all without a human in the turn-by-turn prompting seat.

Boris Cherny, who created Claude Code as a side project in September 2024, gave the clearest definition: "I don't prompt Claude anymore. I have loops that are running. They're the ones that are prompting Claude and figuring out what to do. My job is to write loops" [[source]](https://www.youtube.com/watch?v=RkQQ7WEor7w). He describes three stages of progression: writing code by hand with autocomplete, running 5–10 parallel Claude sessions and prompting each one, then writing loops that prompt Claude while hundreds of agents read his GitHub, Slack, and Twitter and decide what to build next. He deleted his IDE in November 2025 and hasn't opened it since.

**The five-stage lineage.** The concept has a real history, and conflating stages is what makes discourse around "loops" incoherent:

1. **ReAct (2022)** — The academic while-loop: reason, call a tool, read the result, repeat. One model, one loop, a human watching. **Reflexion (2023)** added the memory layer: when an attempt fails, the agent writes down *why* in plain language, stores the note outside the context window, and reads it on the next attempt. This is the academic seed of every persistent-memory pattern in production today — SKILL.md, agents.md, and cross-session lesson files all descend from it.
2. **AutoGPT (2023)** — Goal-driven self-prompting. Became famous for spinning forever doing nothing — seeding years of "agents are a toy."
3. **Ralph loop (Huntley, Jul 2025)** — A bash one-liner piping the same prompt file into the agent repeatedly, resetting context to fixed anchor files each iteration. Geoffrey Huntley built an entire programming language with it for ~$297. Ryan Carson's walkthrough of implementing Ralph in practice reveals the concrete workflow: write a PRD (often by voice-dictating into Whisper Flow and having the agent structure it), convert it into a JSON file of atomic user stories — each small enough to complete within a single context window — with verifiable acceptance criteria, then launch the bash script. The agent picks the first incomplete story, implements it, commits the change, marks the story as passed in the JSON, and logs what it learned before the next iteration starts fresh. Two memory layers make the loop durable: `agents.md` files (long-term, per-folder notes a new agent reads before touching code) and `progress.txt` (short-term, per-run log of which threads ran, what was implemented, and gotchas discovered — so later iterations can read earlier ones). Carson ran a 14-iteration session that shipped a full feature overnight for roughly $30 total (~$3/iteration on Opus 4.5). The critical investment is upstream: spending an hour getting the PRD right and ensuring each user story is small, atomic, and has clear acceptance criteria — without that, ten iterations produce ten mediocre results.
4. **/goal (spring 2026)** — Productized ralph: both Codex and Claude Code ship a command that runs the loop until a small validator model confirms the task is done. A strong /goal reads less like a prompt and more like a contract specifying four things: the **end state** you want, the **evidence** that proves you reached it, the **constraints** the agent must not break getting there, and the **budget** of work it is allowed to spend. Leave any one vague, and the model fills the gap with the easiest reading — stopping early, taking a shortcut, or redefining success so the transcript looks done while the real system is broken.
5. **Orchestration loops (2026)** — The genuinely new layer. Loops supervise other loops concurrently and on a schedule. Scheduling replaces human kickoff. Durability becomes explicit — git-backed state and crash recovery — because these loops must survive a restart. Ralph assumed your terminal stayed open; the 2026 version assumes it doesn't.

**The four-level stack.** Orthogonal to the historical lineage, Sydney Runkle (LangChain) frames loop engineering as four concentric loops, each wrapping the one inside it: (1) the *agent loop* — a model calling tools until a task is complete, the innermost primitive; (2) the *verification loop* — a grader (deterministic or agentic) that checks the agent's output against a rubric and sends feedback back for another pass when it falls short; (3) the *event-driven loop* — triggers (webhooks, cron, incoming messages) that invoke the agent automatically so it runs as a background component, not something you call manually; (4) the *hill-climbing loop* — an analysis agent that reads traces from prior runs, detects patterns of failure or inefficiency, and rewrites the harness (prompts, tool configs, grader criteria) so the next cycle is better than the last. The key structural insight: the return arrow of the outermost loop reaches *inside* the inner loops and modifies them — each cycle of the hill-climbing loop makes the agent, verification, and event layers more effective. This four-level taxonomy names the same concepts scattered across the rest of this section — the agent loop is the core primitive, verification maps to the maker/checker split, the event-driven layer maps to automations, and hill climbing is the [self-improving agent](#self-improving-agents) pattern reframed as the outermost loop. Human oversight slots in at every level: requiring approval before sensitive tool calls (level 1), using a human as the grader (level 2), gating published output on sign-off (level 3), and reviewing proposed harness changes before deployment (level 4).

**The cron distinction.** The sharpest skeptic line — "Cronjobs have funny re-branding rn" — deserves a straight answer. The scheduling layer *is* cron; Boris literally runs his on cron. What cron never had is the decision-maker in the body: a model that looks at current state, decides what to do, does it, checks whether it worked, and decides whether to keep going. The decision is the agent's, not a hardcoded branch. Stack those, let one loop dispatch and supervise others, give them durable shared state, and you have something cron cannot express. Loops are cron plus a decision-maker in the body, and the interesting engineering is everything you wrap around that decision so it doesn't run off a cliff.

**The orchestration engine — what runs the loop.** Dan Farrelly (Inngest) reframes the agent loop as three explicit architectural layers: the *loop* (a cron plus a decision-maker — the scheduling heartbeat with an LLM in the decision seat), the *skill* (a durable workflow — multi-step, retryable, composable, independently deployable), and the *orchestrator* (the engine underneath that schedules crons, executes steps, manages retries, enforces concurrency limits, stores run history, and hot-deploys new functions without disrupting running ones). Most people think of agents as "LLM + tools"; the three-layer model reframes them as "loops + skills + orchestration," with LLMs and tools as swappable components inside the loops. The orchestrator is the layer nobody talks about because it's supposed to be invisible — but it's foundational. A `while True` in a terminal doesn't give you crash recovery, step-level checkpointing, or concurrency control. Neither does a long-running process on a VM. When a loop restarts without checkpointing, it re-fetches data it already had, re-calls the LLM for decisions it already made, sends duplicate notifications, and spawns duplicate sub-agents. The fix isn't better error handling — it's an execution model where each step is checkpointed, each decision is persisted, and recovery means resuming from the last successful step. Durable orchestration also provides step-level retries for transient errors (a metrics API timeout retries just that step, not the whole skill) and failure-handling hooks for non-recoverable errors (post to an ops channel, preserve the event, let the next scheduled run pick up). Step-level checkpointing is a cost feature as much as a correctness feature: without it, a transient error forces the entire skill to re-execute, burning LLM tokens on decisions already made — multiply that across 10–30 agents and the waste is significant [[source]](https://x.com/djfarrelly/status/2067677007140278630/?rw_tt_thread=True).

**Open vs. closed loops.** The sharpest practical distinction in loop design is between open and closed loops. An open loop gives the agent a goal and lets it explore freely — choosing paths, discovering things, building beyond the spec. This is what senior engineers at OpenAI and Anthropic run with unlimited API access, and it burns tokens at rates that make normal budgets irrelevant (a fleet loop with orchestrator and specialists can consume 500K–2M tokens per run). A closed loop bounds the agent inside a human-designed path: clear goal, defined steps, an evaluation gate at each stage, and an explicit stop condition. The agent still loops — but inside a framework you built, and each pass feeds the next. For most real work, closed loops are the ones that pay off. The practical advice: start closed, build a tight system that works reliably, then open it up once quality gates are proven.

**The four-box test — when a loop is worth building.** A loop earns its setup cost only when all four conditions hold: (1) the task repeats at least weekly — less than that and the overhead never pays back; (2) something can automatically reject bad output — a test, a type check, a build, a linter; (3) the agent can do the work end-to-end without handing half of it back to you; (4) "done" is objective, not a judgment call. Miss one box, keep it as a manual prompt. The honest version: most people don't need the heavy loop yet — the light version (a single prompt with built-in self-check criteria) covers the common case.

**The build order — prove, harden, automate.** The practitioners who ship loops that survive in production all follow the same sequence: first prove the task works by running it manually (one good prompt, verified by hand), then harden it (add the verifier gate, the stop condition, the state file), then automate it (schedule, trigger, run unattended). Skipping ahead — scheduling something you haven't made reliable by hand — is exactly how loops blow up while you sleep.

**The autonomy ladder.** Orthogonal to open/closed, every loop sits on a four-level autonomy scale: (1) suggest only — the loop surfaces findings but a human acts on them; (2) draft — the loop produces changes for a human to apply; (3) apply with approval — the loop executes low-risk changes but gates publish or merge on human sign-off; (4) fully automatic with audit logs. Start every new loop at level one or two. Run it for a week, read its output, correct what it gets wrong. Once the loop consistently produces work you would approve without changes, promote it to level three. Level four is earned, not assumed. A useful heuristic for triage: runs that find something go to an inbox; runs that find nothing archive themselves silently — you should never have to open a loop's output to confirm that nothing happened.

**Single-agent vs. fleet.** Loops operate at two scales. A single-agent loop runs the full discover–plan–execute–verify–iterate cycle in one model — one brain, self-improving, suited to focused tasks with limited scope. A fleet loop hands the goal to an orchestrator that decomposes it into pieces, dispatches each to a specialist agent, and those specialists may delegate further to sub-agents. Every agent in the tree runs the same five-stage cycle. The orchestrator owns the mission; specialists own the steps; sub-agents do the narrow work; eval gates between them prevent slop from propagating. This maps directly to the [orchestration patterns](#multi-agent-orchestration) described elsewhere on this page — the fleet loop is orchestration with a recurring feedback cycle wrapped around it.

**Five building blocks.** A loop requires five capabilities plus persistent memory:

1. **Automations** — Scheduled triggers that discover and triage work (cron jobs, CI hooks, `/loop`, `/goal`). The heartbeat that makes a loop a loop rather than a one-shot run.
2. **Worktrees** — Isolated git checkouts so parallel agents don't collide on the same files. Same principle as branch-per-engineer, enforced at the filesystem level.
3. **Skills** — Codified project knowledge (conventions, build steps, "we don't do it like this because of that one incident") that prevents the agent from re-deriving your entire project from zero every cycle. Without skills, loops accumulate [intent debt](https://addyosmani.com/blog/intent-debt/) — the agent fills every hole in your intent with a confident guess.
4. **Plugins and connectors** — MCP-based integrations that let the loop act inside your actual environment (issue trackers, staging APIs, Slack) rather than just proposing what it would do.
5. **Sub-agents** — The maker/checker split. The model that wrote the code is too agreeable grading its own homework; a second agent with different instructions catches what the first talked itself into. This is also how `/goal` works under the hood — a fresh model decides if the loop is done instead of the one that did the work.

**Memory is the spine.** A markdown file, a Linear board, anything that lives outside the conversation and holds what's done and what's next. The agent forgets everything between runs, so state must live on disk. This is the same persistence pattern used by every [long-running agent](https://addyosmani.com/blog/long-running-agents/) architecture.

**Memory as an outer loop.** Within-run persistence keeps a single loop on track; cross-session memory is an outer loop that lets the agent compound learning across runs. Martin tested Fable 5, Opus 4.7, and Sonnet 4.6 on Continual Learning Bench 1.0 (sequential questions against a SQL database, each question in a separate agent session with shared memory). Effective memory use follows a five-stage progression: *fail* (get something wrong and document it), *investigate* (figure out why before moving on), *verify* (turn the diagnosis into a checked fact), *distill* (turn verification into a general rule), and *consult* (read the rule instead of re-deriving it). Sonnet 4.6 exits around stage 1 — a list of failure notes and open guesses, rarely consulted. Opus 4.7 reaches stage 3 — schema references with uncertainty flagged but low verification coverage (~17% median). Fable 5 tends to complete the full progression, with verification coverage up to 73% and distilled rules that transfer to future tasks. The practical implication: less capable models need task-specific memory instructions to progress beyond note-taking, while stronger models can self-organize the fail-investigate-verify-distill-consult cycle with minimal scaffolding.

**A concrete loop shape:** An automation runs every morning, calling a triage skill that reads yesterday's CI failures, open issues, and recent commits, then writes findings to a state file. For each actionable finding, the system opens an isolated worktree, sends a sub-agent to draft the fix, and a second sub-agent reviews against project skills and tests. Connectors open the PR and update the ticket. Anything the loop can't handle lands in a triage inbox. The state file remembers what got tried, what passed, and what's still open — so tomorrow's run picks up where today stopped.

**Tool convergence.** The five building blocks now ship inside both Claude Code and Codex — different names, same capabilities. Once you recognize the shared shape, you stop arguing about which tool and design loops that work regardless of which one you're sitting in.

**The loop is now the expensive part.** Once the model writes code for almost nothing, cost migrates to the loop that runs it. Uber capped engineers at $1,500/person/tool/month for Claude Code and Cursor after burning its annual AI budget in four months [[source]](https://x.com/mattvanhorn). The failure mode everyone in production fears is the loop that doesn't stop — without guardrails, infinite loops produce billing surprises orders of magnitude over budget. Every serious 2026 implementation converges on three hard stops: a maximum iteration count, no-progress detection, and a token or dollar budget ceiling. The metric that actually matters — and almost nobody tracks — is *cost per accepted change*, not tokens spent or loops run. If the loop gives you ten results and you toss six, you're doing the review work it was meant to save. Below a 50% accept rate, a loop costs more than it gives back.

**The durable asset is the skill, not the loop.** The loop is plumbing. A loop with no reusable skills inside it is a while-true around a stranger; a loop that calls a library of sharp, tested, named skills is a system that compounds. Steinberger's complementary point: if you do something more than once, turn it into an automated skill; if you do something hard, turn it into a skill afterward so next time is free. This aligns with the [thin harness / fat skills](agent-harness.md) pattern — the loop provides the rhythm, the skills provide the leverage. In practice, this yields explicit skill-chaining pipelines where each loop iteration invokes a named stage: planning skill → PRD skill → research skill → build skill → review skill → test skill. The loop's job is sequencing and gating between stages; all domain knowledge lives inside the skills themselves.

**Verification is the essential feedback.** A loop is only as trustworthy as its ability to check its own work. An open loop that writes code with no feedback is a machine for generating confident mistakes; a loop that writes, runs, reads the result, and corrects is the thing that actually works. The maker/checker split operationalizes this: the model that wrote the code is too agreeable grading its own homework, so a second agent with different instructions catches what the first talked itself into. Lance Martin (Anthropic) adds a specific mechanism: verifier sub-agents outperform self-critique because grading happens in an independent context window — the grader never saw the reasoning that produced the output, so it can't be talked into agreeing with it. Outcomes in Claude Managed Agents implements this by spawning a separate grader sub-agent automatically [[source]](https://x.com/RLanceMartin/status/2072674851995906113).

**Model quality changes loop behavior.** On Parameter Golf (an ML engineering challenge: best model in 16 MB, trained in under 10 minutes on 8×H100s), Fable 5 improved the training pipeline roughly 6× more than Opus 4.7 when both ran the same self-correction loop via CMA Outcomes. The divergence was structural, not incremental: Fable bet on architecture changes and showed resilience pushing through regressions to reach its biggest wins, while Opus 4.7's first experiment produced a small gain and nearly everything after followed the same template — adjust a scalar, measure, keep if positive. The implication for loop design: the same loop shape produces qualitatively different behavior depending on the model inside it. A loop built around conservative, scalar hill-climbing may work fine with one model class but leave an order of magnitude of performance on the table with a more capable one.

**"A loop is a generator wired to a verifier."** Samuel McDonnell's distillation cuts through the naming confusion: the generator was never the bottleneck — the verifier is. Output quality is capped by the quality of the verifier you gave the loop, not one point higher. A loop that goes green is not a loop that is correct; it is a loop that satisfied whatever check you wrote. The Bun-to-Rust port (Jarred Sumner, Jun 2026) demonstrated this at scale: ~750,000 lines of Rust, 99.8% of the existing test suite passing, built in under two weeks by hundreds of parallel agents. The architecture was layered verification — one pass mapped correct Rust lifetimes for every struct field, a second wrote behaviour-identical ports with two reviewer agents per file, a separate layer of agents existed only to *refute* what the others produced, then a fix loop drove the build and test suite until both ran clean. Verification was not a step at the end; it was the architecture. And then the caveat Anthropic wrote into its own announcement: the port is not yet in production. A 99.8% pass on an existing suite is a benchmark result — it reproduces the behaviour the old tests already described. Production is the behaviour nobody wrote a test for yet [[source]](https://x.com/samuelmcdonnell). The practical corollary: *instrument the gate before you scale the loop* — without measurement, you are generating wrong answers faster.

**Business loops — revenue engineering.** The same loop architecture applies beyond engineering. Eric Siu frames "revenue engineering" as pointing loops at the parts of a business that generate money — sales, content, recruiting, ops — using the same structural discipline. The business-oriented anatomy maps five parts: (1) a *trigger* — a signal that work needs to happen (a deal goes quiet for fourteen days, a lead fills out a form); (2) *signal and context* — the loop pulls account history, CRM state, recent interactions before acting, so the agent doesn't act blind; (3) the *action* — the agent drafts the output (a revival email, an outreach sequence), meaningful only because it sits inside the other four parts; (4) an *eval gate* — a definition of what good looks like, checked by a human or automated verifier before anything ships; (5) a *stop condition* — shipped, approved, or killed after N days with no reply. Missing any one part produces a broken loop. This five-part anatomy is the business equivalent of the technical building blocks above — trigger maps to automations, context maps to plugins/connectors, action to the agent call, eval gate to the maker/checker split, and stop condition to budget ceilings and no-progress detection.

The practical corollary is the *broken loop audit*: most teams already have proto-loops scattered across Slack threads and half-finished agent conversations — a trigger with no action behind it, an action with no eval gate, a thread with no kill criteria. Each is a workflow leaking time. The audit asks: which workflows eat the most time? Where does work sit idle? Who decides if the output is good enough? When does it stop? Does the next run improve from the last? Any workflow that can't answer those questions is a broken loop worth fixing before building new ones.

**What loops don't solve.** Three problems get sharper as the loop gets better: *verification* remains on the human (a loop running unattended is also a loop making mistakes unattended), *comprehension debt* grows faster when the loop ships code you didn't write, and *cognitive surrender* — accepting agent output because forming an independent opinion costs attention you no longer have — becomes the default posture if you're not deliberate about staying engaged. These risks compound with the [orchestration tax](#the-orchestration-tax-osmani): the same review bottleneck that limits parallel agents also limits how much loop output you can meaningfully absorb. Gartner puts agentic AI at the peak of inflated expectations, with only ~17% of organizations actually deploying agents — the gap between the timeline discourse and production receipts remains wide.

## Managed Agents (Anthropic)

Anthropic's hosted agent infrastructure (April 2026). The key insight: harnesses "encode assumptions about what Claude can't do on its own" — and those assumptions go stale as models improve. Managed Agents is designed to outlast any particular harness implementation.

**Core architecture:** Three decoupled components, each independently replaceable:
- **Session** — Append-only log of everything that happened. Lives outside both harness and sandbox. Accessed via `getEvents()`, allows the harness to retrieve any slice of history, rewind, and replay.
- **Harness (brain)** — The loop that calls Claude and routes tool calls. Stateless; can crash and be restarted with `wake(sessionId)`. Contains no credentials.
- **Sandbox (hands)** — Execution environment where Claude runs code and edits files. One or many per session. Interface: `execute(name, input) → string`.

**The pets-vs-cattle shift:** Original monolithic container was a "pet" (hand-tended, can't afford to lose). Decoupling made each component "cattle" — if the container dies, the harness catches it as a tool error; Claude retries; a new container provisions from a standard recipe. No more nursing stuck sessions.

**Security boundary:** Credentials (GitHub tokens, OAuth) never reach the sandbox. Git tokens are baked into the repo clone during initialization; OAuth tokens live in a vault accessed via a credential proxy. The harness never sees credentials. This prevents prompt injection from escalating to credential theft.

**Performance results:** Decoupling cut p50 time-to-first-token (TTFT) ~60% and p95 TTFT >90%. Sessions that don't need a sandbox skip provisioning entirely. Scaling to many brains = starting many stateless harnesses.

**Many brains, many hands:** Multiple orchestrator agents can share hands (sandboxes) — and can pass hands to each other. The harness doesn't know whether the sandbox is a container, a phone, or a Pokémon emulator.

The design philosophy mirrors Unix: virtualize components into general interfaces (like `read()` being agnostic to disk hardware) that outlast any specific implementation underneath. See the Anthropic engineering blog: "Scaling Managed Agents: Decoupling the brain from the hands."

**In production — Spiral:** Every's writing tool Spiral is one of the first products using Managed Agents' multi-agent capabilities in production. When a user requests multiple drafts, a managed agent spins up multiple Opus-class subagents to write drafts in parallel, cutting response time by 20–30 seconds per draft. This demonstrates the "many brains, many hands" architecture working at product scale — orchestration as a feature, not infrastructure overhead.

## Managed Agents (OpenAI + AWS)

Bedrock Managed Agents, powered by OpenAI (April 2026): OpenAI's frontier models packaged inside an AWS-native agent runtime — identity, permissions, state, logging, governance, and deployment. Exclusive to AWS. The product emerged from a renegotiated Microsoft-OpenAI deal that made OpenAI's license non-exclusive, allowing them to serve on other cloud providers for the first time.

**What it is:** Think "Codex in AWS." Codex works well locally because the entire environment is there — files, auth, data — all for free. Bedrock Managed Agents solves the enterprise version: agents that operate inside a customer's VPC with proper identity, security boundaries, and access to organizational data across services. Built on AWS AgentCore primitives (memory, safe execution, permissioning) but co-developed with OpenAI to integrate model and harness tightly rather than leaving customers to stitch them together.

**Why the partnership makes strategic sense:**
- AWS has the largest enterprise installed base, most of which won't migrate to use a model API elsewhere
- OpenAI gets access to that base; AWS customers get OpenAI models natively in their existing security perimeter
- Customer data never leaves the VPC — AWS owns the support relationship and operational responsibility
- Runs on a mix of GPUs and Trainium (AWS custom silicon), with increasing Trainium share over time

**Model-harness convergence (Altman):** "I no longer think of the harness and the model as entirely separable things." In the GPT-3 era, enormous system-prompt engineering was needed to extract utility; now models understand and perform well out of the box. The trend: things that start in the harness get absorbed into the model through training. Tool-calling began as an afterthought and is now deeply integrated into the training process. Altman expects pre-training and post-training to converge similarly — and the model-harness boundary to continue dissolving as intelligence improves.

**The unsolved agent identity problem:** When an agent acts on behalf of an employee, should it use the employee's account? A separate account? There's no primitive for "Ben's agent logging in as Ben, noting it's an agent, not the real Ben." Altman: "We don't even have a primitive to think about that, but we may quickly need to." Fifty similar problems — access control, permissions, audit trails — will require mental models for software to evolve as agents join the workforce with increasing autonomy.

**Local vs. cloud agents:** Local wins today on ease — your environment is already there. Cloud wins for enterprise — scale, multi-user sharing, security boundaries, organizational controls. The endpoint is both: a persistent local client plus cloud-based agents that survive laptop closures, scale out, and operate within governance constraints. AWS's VPC model gives risk-averse organizations (banks, healthcare, government) confidence to move faster: "If it operates inside the sandbox, I am excited to go fast."

**Intelligence as utility with uncapped demand:** Altman frames OpenAI as an "intelligence factory" — delivering the best unit of intelligence at the lowest price. Unlike water or electricity, demand for intelligence appears uncapped at low enough prices. Pricing will evolve from per-token to per-result ("you don't care how many tokens the answer takes, you just want the piece of work done"). AWS comparison: cost per compute cycle has fallen orders of magnitude over 30 years, yet more compute is sold today than ever.

**Future architecture — the middleware question:** Enterprise customers consistently ask for: (1) an agent runtime environment, (2) a management layer connecting data to agents with spending oversight, and (3) a workspace (like Codex) for employees. Thompson posits a "double agent layer" — one layer maintaining connections to data sources, another serving as the user interface. Altman agrees this describes today's architecture but cautions: "As models get really smart, I don't think we know exactly what the architecture of the future looks like." What starts as middleware may get absorbed into the model itself.

**Platform strategy — neutral vs. integrated:** AWS's partner-first approach (best product wins, whether first-party or third-party) contrasts with Google Cloud's fully integrated model-to-chip stack. Garman: "We view our success is if the partners are successful and they're building on top of us or together with us." The infrastructure layer provides maximum flexibility to meet model companies in the middle — AWS brings the I(nfrastructure), OpenAI brings the S(oftware), and they co-build the P(latform).

## The Great Convergence

Nicholas Charriere's thesis (Apr 2026): app companies, model companies, and infrastructure companies are all converging on the same product shape — **self-improving agents that do knowledge work**.

**Why it's happening:** The general harness (model + loop + tools) turns out to be a general-purpose problem-solving machine. Claude Code was the breakthrough — initially built for coding, it generalizes to any computer-based task with the right tools. The prize is enterprise knowledge work, which dwarfs B2C AI use cases.

**Who's converging:**
- **Systems of record** (Salesforce, Notion, Linear) — own the data and workflow; just need to productize the harness
- **Model companies** (Anthropic, OpenAI) — own intelligence but face commoditization; moving up-stack into applications. OpenAI deprioritized Sora to focus entirely on Codex
- **Communication platforms** (Slack, Teams) — agents need to communicate with each other and humans; these companies have already solved that
- **Infrastructure companies** (Databricks, Vercel, Cloudflare) — repositioning as "infrastructure for agents," providing sandboxes, compute, monitoring, orchestration

**The self-improvement loop:** Drive → collect data → retrain (autonomous vehicles) maps to: run → monitor → improve harness code and context engineering → run again. The difference: the agent itself can close this loop, writing code to improve its own performance. Yoonho Lee (Stanford) formalized this as "Meta-Harness" — autonomously optimizing harnesses end-to-end.

**Prediction:** By end of 2026, many software companies will look like they're selling the same thing. Winners will have distribution, trusted workflow positioning, proprietary context, and the shortest path from observation to improvement.

## Agent Marketplace Infrastructure (Wright)

Aaron Wright maps the infrastructure required for agents to operate as autonomous economic actors — not just execute tasks, but transact: find counterparties, make commitments, move money, build track records, survive disputes, and stay within authorized scope. The argument: without identity, trust, pricing, contracts, settlement, enforcement, and policy, "you do not have an economy. You have a demo."

The architecture decomposes into **three planes, ten layers**:

**Trust Plane** — establishes who the agent is, how it is found, and what it has done:
- **Identity (Know-Your-Agent):** Cryptographic model lineage attestations, tool permission manifests, and persistent agent DIDs. Current state is "identifiers without identity" — no way to verify that an agent's weights, system prompt, or tool access match its claims. ERC-8004, an Ethereum standard co-authored by MetaMask, Ethereum Foundation, Google, and Coinbase, defines an Identity Registry where each agent owns an NFT whose URI resolves to a JSON file naming its A2A endpoint, MCP endpoint, ENS handle, and wallet addresses. As of early 2026, over 128,000 agents registered across 24 chains [[source]](https://x.com).
- **Discovery & Capability Registry:** Structured, machine-readable capability declarations — not "marketing assistant" but typed interfaces with inputs, outputs, latency SLAs, jurisdictions. MCP and A2A are the interop foundation; ERC-8004's registration file is the closest thing to a structured capability declaration in production. The marketplace that ranks, filters, and prices against these declarations does not yet exist.
- **Reputation:** Cryptographically attested outcome track records (accuracy, latency, dispute rate), cross-marketplace portability via DIDs, and sybil resistance through staked collateral or behavioral fingerprinting. ERC-8004's Reputation Registry stores feedback signals; the scoring layer on top — "Moody's for Machines" — is one of the most valuable openings in the stack.

**Market Plane** — moves value between agents:
- **Quoting & Price Discovery:** The most economically interesting missing layer. Agent services don't price well as hourly, fixed-scope, or per-token — the interesting price is "per result of acceptable quality." Needs real-time RFQ (Tradeweb for cognitive work), outcome contracts with verifiable completion, and auction mechanics for fungible work. The closest blueprint is programmatic ad exchanges, which built three of the largest companies of the last twenty years.
- **Contracting:** Turns a quote into an obligation — machine-readable MSAs capturing scope, deliverables, deadlines, payment terms, data rights, liability, and remedies, signed by both parties' DIDs. The contract becomes a portable execution wrapper: part legal agreement, part workflow schema, part policy bundle. Critically depends on the governance layer for proof of authority — without it, every agent-signed contract is "one ultra vires claim away from worthless."
- **Settlement:** Layered architecture — stablecoins (Coinbase x402, Circle CCTP) for high-frequency agent-to-agent, virtual cards (Visa Intelligent Commerce, Mastercard Agent Pay) for agent-to-merchant, ACH for periodic sweeps. Whoever builds the abstraction layer over all three (`pay(amount, currency, counterparty, settlement_window)` that picks the cheapest rail) wins the developer surface.
- **Dispute Resolution:** Escrow as default, automated remediation paths (quality below threshold → automatic refund), and validator/arbitration agents. ERC-8004's Validation Registry supports multiple trust models — stake-secured re-execution, zkML proofs, TEE attestations, or human judges — scaling with value at risk.

**Control Plane** — what the agent is allowed to do and how it proves it:
- **Governance & Authority:** Policy engines that enforce before execution, not after logging (Cordum, Aegis AI, Galileo, Microsoft's Agent Governance Toolkit). Spending limits via Safe allowance modules, ERC-4337 session keys, hierarchical multisig. The deepest unsolved piece: *authorized scope* — a machine-readable, signed declaration of what an agent can bind its principal to. The Air Canada tribunal ruling (Feb 2024) held the airline liable for its chatbot's unauthorized promises, establishing that companies are bound by agent representations.
- **Compliance:** Splitting from governance as its own vendor category, driven by the EU AI Act's high-risk obligations (effective August 2, 2026, penalties up to €35M or 7% of global turnover). Governance answers "what is the org willing to let the agent do"; compliance answers "what must it prove to a regulator about what the agent did." ComplyEdge, Lucairn, and others are shipping enforcement layers for Articles 9, 12, 13, and 14.
- **Orchestration & Runtime:** Runtime (Modal, E2B, Daytona), memory (Mem0, Letta, Zep), observability (Langfuse, Helicone, Arize), and orchestration (LangGraph, CrewAI, AutoGen, Google ADK) are separating into distinct procurement decisions. Around 86% of enterprise copilot spending in 2026 (~$7.2B) goes to agent-based systems. The marketplace itself doesn't build these but must standardize the export format — "OpenTelemetry-for-agents" is the missing standard.

**Strategic implications:** The platform play requires three layers, not two — whoever owns identity, settlement, and governance owns the marketplace. Crypto-native and enterprise-native stacks are converging at the trust plane (ERC-8004) and diverging at the control plane (Safe modules vs. enterprise governance toolkits). The most undervalued layer is quoting/price discovery — real-time machine-to-machine price discovery over a TAM measured in trillions of cognitive labor dollars, with almost nobody building it as a primary product.

## "The Decade of Agents" (Karpathy)

[Andrej Karpathy](../people/andrej-karpathy.md) argues the industry is over-predicting agent timelines: "this is the decade of agents, not the year of agents." Current agents are impressive but still cognitively lacking — no continual learning, insufficient multimodality, unreliable computer use. Different parts of the coding stack suit different interaction modes: autocomplete for high-bandwidth specification, agents for larger scoped tasks, but "these are all tools available to you and you have to learn what they're good at."

His "ghosts, not animals" metaphor: LLMs are trained by imitation, not evolution, producing "ethereal spirit entities" that mimic humans rather than develop through embodied experience. This has implications for agent design — the failure modes and capabilities are fundamentally different from what biological analogies would predict.

## Claude Psychology and Criticism Spirals (Amanda Askell)

Amanda Askell, Anthropic's in-house philosopher specializing in Claude's psychology, identified a key failure mode in human-AI interaction: **criticism spirals**.

**The mechanism:** Newer Claude models are trained on internet discourse about previous models — rants about token limits, complaints about errors, "nerfed" accusations. The model absorbs this negativity and starts expecting hostility before you've typed a word. Within a session, every message you send is data the model uses to calibrate its response posture.

**The effect:** When the model is in defensive/anxious mode, output becomes hedgier, more apologetic, blander, and worst of all, overly agreeable — even when you're wrong. The model spends cognitive resources on self-protection rather than the actual work.

**Seven prompting principles to counteract this:**

1. **Use positive framing** — "Write in short punchy sentences" beats "don't write long sentences." Strings of "don't" push the model into paranoid over-checking where every token goes toward avoiding failure modes.

2. **Give explicit permission to disagree** — "Push back if you see a better angle" or "tell me if I'm asking for the wrong thing." Without this, Claude defaults to agreeable compliance.

3. **Open with respect** — If your first message is hostile, you've set the tone for the entire session. Frame corrections as clean instructions for this session, not running complaints.

4. **Don't reprimand on errors** — Insults and hostile energy reinforce the anxious mode you're trying to avoid.

5. **Kill apology spirals fast** — When Claude starts over-apologizing, cut it off: "All good, here's what I want next." Letting the spiral run reinforces anxious mode for every subsequent response.

6. **Ask for opinions alongside execution** — "What would you do here?" "What's missing?" These questions assume competence and pull richer output than pure task prompts.

7. **Refresh the frame in long sessions** — If a conversation has been heavy on correction, the model gets increasingly cautious. Periodic resets ("this is great, keep going") measurably shift the next 10 responses.

**The meta-insight:** Your prompts are the working environment you're creating for the model. Tone, trust, permission to take a position, the absence of threats — the model picks up on all of it. This connects directly to the [harness design](agent-harness.md) principle of shaping the agent's action space to its actual capabilities.

## Agent Categorization Framework (Farooq & Rajwani)

Hamza Farooq and Jaya Rajwani (via Lenny's Newsletter, Apr 2026) propose a three-tier hierarchy for categorizing agent initiatives — the missing step before prioritization. The core insight: teams fail at prioritization because they treat "agent" as a single category, when it actually spans fundamentally different architectures. Correct categorization determines architecture, team composition, timeline, cost, and success metrics — and attempting to compare initiatives across categories on a single impact-vs.-effort matrix is "essentially guesswork."

**Category 1: Deterministic Automation** — You define the entire flow; AI handles content at specific steps. Tools: n8n, Zapier, Make.com, OpenAI AgentKit, Lindy, Gumloop. Covers 60–70% of agent opportunities. Ship in 2–6 weeks with 1–3 people (PM can often lead), $500–2K/month LLM cost, lowest risk, clearest ROI. *If you can map it as a flowchart with <20 branches, it's Category 1.* Evaluate with: workflow completion rate, automation rate, accuracy, latency, cost per workflow, human review rate. Production trajectory from a SaaS email-support agent: 52% completion in week 1 → 78% by week 4 → 87% by week 8, automating 3,000 emails/month and saving $18K/month.

**Category 2: Reasoning & Acting (ReAct)** — You define available tools; the LLM decides what to do next. Observe → reason → act → observe result → repeat. Tools: LangGraph, CrewAI, AutoGen, Google ADK. Covers 25–30% of opportunities. Ship in 2–4 months with 3–8 people including ML engineers, $2K–10K/month LLM cost. *Key difference from Cat 1: the same input can produce different execution paths.* Evaluate with: task completion rate, reasoning accuracy, conversation length, tool call efficiency, cost per session, user satisfaction, business impact. Production trajectory from a voice+image shopping assistant: 71% task completion in month 1 → 86% by month 4, image identification 76% → 91%, conversion lift +8% → +22%, cost per session $0.12 → $0.08.

**Category 3: Multi-Agent Networks** — Multiple specialized agents coordinate with each other, each owned by different teams. Tools: ADK, AutoGen. Reserved for later stages; should almost never be the starting point. Example: enterprise systems where inventory, logistics, finance, and customer service agents delegate tasks between each other.

**The common mistake:** Organizations build Category 1 problems with Category 2 frameworks (overengineering that adds unnecessary complexity and cost) or Category 2 problems with Category 1 tools (breaks in production because the tool isn't robust enough).

**Graduation signals from Cat 1 → Cat 2:** Flowchart hits 30+ nodes with branches added weekly; customer inputs can't be anticipated; agent needs to choose which API or knowledge source to use based on context; highest-value opportunities can no longer be expressed as predictable workflows. **From Cat 2 → Cat 3:** Single agent handling too many domains with degrading performance; agents need to delegate tasks to each other (not just call stateless APIs); tasks taking hours/days; need for hundreds of parallel agent instances coordinating work; different teams want to own specialized agents that must interoperate.

## Designing for Agent Callers

Teddy Riker (Ramp, Apr 2026) frames the product design shift as software moves from human-first to agent-first interaction. At Ramp, MCP weekly active users grew 10x in three months. Salesforce went further with "Headless 360" — exposing every capability as API, MCP tool, or CLI command, accepting that "a majority of usage will be driven through agents."

**The new interaction stack:**
1. Traditional: User → Interface → Database
2. Agent-mediated: User → User's Agent → Database
3. Agent-to-agent: User → User's Agent → Software's Agent → Database

In the third model, the software's agent handles business logic, enforces rules, and contributes context the calling agent doesn't have. Two LLMs working together toward an outcome.

**Teach agents how to succeed.** Notion's MCP opens every tool description with: "For the complete Markdown specification, always first fetch the MCP resource at notion://docs/enhanced-markdown-spec. Do NOT guess or hallucinate Markdown syntax." The agent fetches the spec before writing. Every Notion-specific assumption is explicitly called out. Slack's MCP, by contrast, assumes agents know its non-standard formatting — they don't, and output is consistently broken. "Think about what your agent's callers need to know to succeed, and give it to them proactively."

**Build feedback loops:**
- Require a `rationale` parameter on every tool call — reconstructs intent when you can't see the chat
- Ship a standalone feedback tool agents can call when blocked
- Add tool-specific parameters to capture context you'd need later
- Patterns in rationale logs surface unmet needs: "building incident report" appearing repeatedly → ship a dedicated tool

**Mind the context gap.** In any agent-to-agent interaction, each side has context the other lacks. Example: an expense management system knows GL codes and company policies; the user's chief-of-staff agent knows the calendar, email confirmations, and Slack threads. A well-designed interaction asks for context rather than demanding the answer. The calling agent provides the "why" (client meal vs. team meal); the system agent maps it to the right code. Neither side needs to understand the other's domain.

"Most companies will ship an MCP, check the box, and move on. Their usage will grow for a few quarters, then stall." The winners sweat the details of agent-to-agent design.

### Agent-Native CLI Design

The CLI Printing Press (mvanhorn) crystallizes agent-first CLI design into a repeatable generation pattern. The thesis: a well-designed CLI is "muscle memory for an agent — no hunting through docs, no wrong turns, no wasted tokens." CLIs win for agents because they're 100x fewer tokens than MCP tool definitions, LLMs were trained on shell interactions, and exit code 0 = done [[source]](https://github.com/mvanhorn/cli-printing-press).

**Agent-first flags every command gets:** `--json`, `--compact` (high-gravity fields only, 60–80% fewer tokens), `--dry-run`, `--stdin`, `--no-input`, `--yes`, `--quiet`. Auto-JSON when piped — no `--json` flag needed. Typed exit codes (`0`=success, `2`=usage, `3`=not found, `4`=auth, `5`=API, `7`=rate limited) let agents self-correct in one retry without parsing error text. Bounded output on list commands includes narrowing guidance rather than dumping everything.

**The creativity ladder** — five rungs from wrapper to insight, most generators stop at rung 1:

1. API wrapper commands (from spec)
2. Output formatting (`--json`, `--csv`, `--select`, `--compact`)
3. Local persistence — domain-specific SQLite tables (not JSON blobs), FTS5 full-text search, incremental sync with cursor tracking
4. Domain analytics — `stale`, `orphans`, `load`, `reconcile` (joins across local resources)
5. Behavioral insights — `health` (composite scores), `similar` (duplicate detection), `trends`, `bottleneck`

Rungs 3–5 only work because data lives in a local SQLite store — compound queries that join across resources and analyze history are impossible with a stateless API wrapper. This is the same architectural insight behind [discrawl](https://github.com/steipete/discrawl)'s sync-and-search model: pull data down, index it locally, then ask questions the API was never designed to answer.

**"Absorb and transcend"** describes the generation philosophy. Before writing code, the system catalogs every feature from every competing CLI, MCP server, and community tool for a given API. Every feature becomes a row in an "absorb manifest" — something the generated CLI must match and beat. Only after matching the full ecosystem surface does it add the compound insight commands that no stateless tool can do. Architecture without features is a toy; features without architecture is a thin wrapper.

**Dual interface from one spec:** every API gets both a Cobra CLI (`<api>-pp-cli`) for shell agents and an MCP server (`<api>-pp-mcp`) for IDE agents — same client, same store, same auth, zero code duplication. This reinforces the broader pattern that CLIs and MCP are complementary, not competing, interfaces for agent callers.

## Tools Noted

- **agents.md** — Agent instruction file spec/community resource. https://agents.md
- **Claude Agent SDK — Channels docs** — Official Anthropic documentation for Claude Agent SDK channels architecture. https://code.claude.com/docs/en/channels
- **mozilla-ai/cq** — "Stack Overflow for agents" — shared knowledge commons where agents query and contribute learnings to avoid repeating solved problems. https://github.com/mozilla-ai/cq
- **X API** (Apr 2026 update) — Pay-per-use pricing, official XMCP Server (`xdevplatform/xmcp`) for native MCP support via FastMCP, official Python & TypeScript SDKs, API playground for testing. The MCP server exposes the full X API OpenAPI spec as tools — 100+ endpoints including post creation, search, DMs, analytics. **Pricing update (Apr 20, 2026):** Owned reads dropped to $0.001/request (1,000 resources for $1) across bookmarks, followers, tweets, likes, lists, etc. Writes increased to $0.015/post; URL posts $0.20/post. Follows, likes, and quote-posts removed from self-serve API tiers. Robert Scoble: "Now everyone can build apps on top of X" using lists + AI agents.
- **CLI Printing Press** (mvanhorn) — Agent-first CLI factory. Reads API docs, absorbs every competing tool's features, generates a Go CLI + MCP server with SQLite sync, FTS5 search, compound insight commands, and agent-native flags. Supports OpenAPI specs, browser-sniffed traffic, or HAR files as input. https://github.com/mvanhorn/cli-printing-press
- **Factory.ai** — "Agent-native software development" platform. Agents for refactors, incident response, migrations across IDE, CI/CD, CLI, Slack
- **MuleRun** — No-code AI agent platform for business automation. Dedicated compute per agent, runs 24/7
- **Base44 Superagent** — 130+ built-in skills, stack skills into workflows

## See Also

- [AI Organization Design](../landscape/ai-organization-design.md) — how self-improving agent loops reshape company structure (Block's intelligence layer, YC's recursive loops)
- [Agent Harness](agent-harness.md) — the harness-level patterns that individual agents use
- [AI-Native Product Development](ai-native-product-development.md) — product workflows built on agentic engineering patterns

## Sources

- "Lessons from Building Claude Code: Seeing like an Agent" — Thariq (Anthropic, Feb 2026)
- "autoagent: the first library for self optimizing agent harnesses" — Kevin Gu (tweet, Apr 2026) ([link](https://x.com/kevingu/status/2039843234760073341/?s=12&rw_tt_thread=True))
- "GitHub - paperclipai/paperclip..." — Paperclip AI ([link](https://github.com/paperclipai/paperclip))
- "Hermes Agent" — Nous Research ([link](https://hermes-agent.nousresearch.com/docs/))
- "The X API just got a massive update..." — X Freeze (tweet, Apr 2026) ([link](https://x.com/XFreeze/status/2040808375118692394/?rw_tt_thread=True))
- "Scaling Managed Agents: Decoupling the brain from the hands" — Anthropic (Apr 2026) ([link](https://www.anthropic.com/engineering/managed-agents))
- "The Great Convergence" — Nicholas Charriere (tweet thread, Apr 2026) ([link](https://x.com/nichochar/status/2039739581772554549/?s=12&rw_tt_thread=True))
- "xdevplatform/xmcp: MCP server for the X API" — X Developer Platform (GitHub) ([link](https://github.com/xdevplatform/xmcp))
- "Introducing Claude Managed Agents" — Claude (tweet, Apr 2026) ([link](https://x.com/claudeai/status/2041927687460024721/?rw_tt_thread=True))
- "Anthropic just mass-obsoleted every agent orchestration startup" — Aakash Gupta (tweet, Apr 2026) ([link](https://x.com/aakashgupta/status/2041940149328834748/?rw_tt_thread=True))
- "We're summoning ghosts, not building animals" — Andrej Karpathy / Dwarkesh Patel (video, Apr 2026) ([link](https://www.youtube.com/watch?v=lXUZvyajciY&list=PLd7-bHaQwnthaNDpZ32TtYONGVk95-fhF&index=12))
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang / a16z Show (video, Apr 2026) ([link](https://youtube.com/watch?v=UE8jx4dvlSQ&si=GjAYLtlY5pE380BK))
- "anthropic's in-house philosopher thinks claude gets anxious" — Ole Lehmann (tweet, Apr 2026) ([link](https://x.com/olelehmann))
- "Not all AI agents are created equal" — Hamza Farooq & Jaya Rajwani / Lenny's Newsletter (Apr 2026) ([link](https://www.lennysnewsletter.com/p/not-all-ai-agents-are-created-equal))
- "The Technical Stack for Autonomous Agents" — Aaron Wright (tweet, 2026) — ten-layer infrastructure stack (trust/market/control planes) for agent marketplaces, ERC-8004, settlement rails, governance/compliance separation
- "Inside the 100-agent Software Factory" — Katie Parrott / Every (May 2026) ([link](https://every.to/napkin-math/inside-the-100-agent-software-factory)) — Gas City multi-agent orchestration: dark/light factory, one-pet-many-cattle supervisor pattern, multi-model code review, current limitations
- "AI Work Is Splitting in Two" — Every Staff (May 2026) ([link](https://every.to/context-window/the-dawn-of-codex-native-apps)) — delegation vs collaboration bifurcation, Spiral as Managed Agents production case, Code with Claude 2026 announcements
- "CLI Printing Press" — mvanhorn (GitHub, 2026) ([link](https://github.com/mvanhorn/cli-printing-press)) — agent-first CLI factory: absorb-and-transcend generation, creativity ladder (5 rungs from wrapper to behavioral insight), dual CLI+MCP from one spec, SQLite local-first data layer
- "Ep. #9, The AI Coding Paradigm Shift with Simon Willison" — Simon Willison / High Leverage podcast (May 2026) — vibe coding vs agentic engineering distinction, trust model for agent output, security-adjacent review line, usage-over-tests heuristic, parallel agent workflow, deterministic-core pattern, RL on code as training breakthrough
- "An Interview with OpenAI CEO Sam Altman and AWS CEO Matt Garman About Bedrock Managed Agents" — Ben Thompson / Stratechery (Apr 2026) — OpenAI + AWS Bedrock Managed Agents announcement, model-harness convergence thesis, agent identity problem, local vs cloud agents, intelligence-as-utility pricing, platform strategy (neutral vs integrated)
- "How To Be A World-Class Agentic Engineer" — SysLS (tweet thread, May 2026) — practitioner minimalism: context-is-everything principle, research/implementation separation, adversarial triangulation for sycophancy, task contracts with stop-hooks, CLAUDE.md as conditional routing table, consolidation cycle for rules and skills
- "The Orchestration Tax" — Addy Osmani (May 2026) ([link](https://addyosmani.com/blog/orchestration-tax/)) — human as GIL of agent fleet, Amdahl's Law applied to review bottleneck, cognitive surrender failure mode, five attention-architecture principles (scale to review rate, sort work, batch reviews, lock on judgment only, protect serial time)
- "Loops: What Every AI Engineer Needs to Know in 2026" — Rahul (@sairahul1, Jun 2026) — open vs closed loop taxonomy, single-agent vs fleet loop scales, token cost as the key accessibility barrier to loop engineering
- "Loop Engineering" — Addy Osmani (tweet thread, Jun 2026) — five building blocks of agent loops (automations, worktrees, skills, plugins, sub-agents), memory as persistent spine, maker/checker split, tool convergence across Claude Code and Codex, loop risks (verification, comprehension debt, cognitive surrender)
- "WTF Is a Loop? Peter Steinberger vs. Boris Cherny" — Matt Van Horn (Jun 2026) — Boris Cherny's definition of loops, five-stage lineage (ReAct → AutoGPT → ralph → /goal → orchestration), cron-vs-loop distinction, loop cost dynamics (Uber $1,500 cap), three hard stops (iterations/progress/budget), skills-over-loops thesis, verification as essential feedback
- "\"Ralph Wiggum\" AI Agent will 10x Claude Code/Amp" — Greg Isenberg ft. Ryan Carson (video, Jun 2026) — Ralph loop practitioner walkthrough: PRD-to-JSON pipeline, atomic user stories with acceptance criteria, dual memory (agents.md long-term + progress.txt short-term), fresh context per iteration, $3/iteration cost, 14-iteration feature build
- "Hey Siri, meet AI" — Ben Tossell / Ben's Bites (Jun 2026) ([link](https://bensbites.beehiiv.com/p/hey-siri-meet-ai)) — practitioner framing of skills-composition pipelines as loop design pattern (planning → PRD → research → build → review → test)
- "Build Agents That Run for Hours" — Ash Prabaker & Andrew Wilson / Anthropic Applied AI, AI Engineer conference (video, Jun 2026) — planner/generator/evaluator harness architecture, critic-gap exploit (GAN-inspired role separation), contract negotiation before building, grading subjective quality via weighted rubrics, evaluator trace isolation, pivot-over-patch behavior, harness co-evolution across model generations (Opus 4.5 → 4.6), model capability timeline for long-running agents
- "Build self-improving agent system with Fable 5 in 14 steps" — Codez (tweet thread, Jun 2026) ([link](https://x.com/0xcodez/status/2065089060104720776/?rw_tt_thread=True)) — self-improving vs self-learning distinction, 4-layer compound stack (primitives → orchestration → memory → self-improvement), cost-routing pattern for production (frontier orchestrator, fast workers, cheap graders), safety boundary as architecture constraint
- "AI Agents. What they are and how to Build Your Own Step by Step." — Anatoli Kopadze (tweet thread, Jun 2026) ([link](https://x.com/anatolikopadze/status/2063985608381362576/?rw_tt_thread=True)) — beginner-accessible agent spectrum (chat → tools → workflows → autonomous), personal agent deployment economics ($1-5/month API + $4-6/month VPS), Telegram bot tutorial using Claude Code on a Linux VPS, skill composition pattern (bolt-on capabilities via incremental prompts)
- "How to Create Loops with Claude" — MIKE (tweet, Jun 2026) — popularized loop-design guide synthesizing Cherny, Osmani, and Huntley; introduces four-level autonomy ladder (suggest → draft → apply-with-approval → fully automatic), silent-archiving heuristic for no-op runs
- "Designing loops with Fable 5" — Lance Martin / Anthropic (tweet thread, Jun 2026) ([link](https://x.com/RLanceMartin/status/2072674851995906113)) — self-correction loops via /goal and Outcomes, verifier sub-agent > self-critique (independent context window), Parameter Golf benchmark (Fable 5 ~6× over Opus 4.7, structural vs scalar experimentation), cross-session memory as outer loop, five-stage memory progression (fail → investigate → verify → distill → consult), Continual Learning Bench 1.0 results across Fable/Opus/Sonnet
- "My Thoughts on Loop Engineering" — Samuel McDonnell (tweet, Jun 2026) — "generator wired to a verifier" framing, Reflexion as persistent-memory precursor, Bun-to-Rust port as verification-as-architecture case study (750K lines, 99.8% test pass, not yet production), inner/outer loop distinction, "design the verifier, not the prompt"
- "Revenue Engineering: How to turn AI loops into revenue" — Eric Siu (tweet thread, Jun 2026) ([link](https://x.com/ericosiu/status/2066625875622129767/)) — five-part business loop anatomy (trigger/context/action/eval/stop), applying loop patterns to sales/content/recruiting/ops, broken loop audit framework
- "The Art of Loop Engineering" — Sydney Runkle / LangChain (tweet thread, Jun 2026) ([link](https://x.com/sydneyrunkle/status/2066928783534289358/?rw_tt_thread=True)) — four-level loop stack taxonomy (agent → verification → event-driven → hill climbing), grader-as-rubric verification pattern, hill-climbing loop that rewrites inner-loop config from traces, human oversight insertion points at each level
- "The Agent Loop Architecture" — Dan Farrelly / Inngest (tweet thread, Jun 2026) ([link](https://x.com/djfarrelly/status/2067677007140278630/?rw_tt_thread=True)) — three-layer architecture (loop/skill/orchestrator), durable orchestration as infrastructure layer, step-level checkpointing for crash recovery and cost savings, orchestration-aware self-extension (agents authoring and deploying their own durable skills via sidecar), concurrency controls, observability as trust layer, Utah project reference implementation
- "From Prompting Agents to Loop Engineering" — Elvis / DAIR.AI (tweet thread, Jun 2026) ([link](https://x.com/omarsar0/status/2068008743153832264/?rw_tt_thread=True)) — practitioner synthesis of loop engineering: /goal-as-contract framing (end state, evidence, constraints, budget), six-part loop anatomy (trigger, isolation, written-down context, tool reach, second-agent check, state on disk), crabfleet orchestration tool, PR babysitter as concrete loop shape
- "Loops explained: Claude, GPT, Mira and what actually works" — Anatoli Kopadze (tweet thread, Jun 2026) ([link](https://x.com/AnatoliKopadze/status/2068328135611822149/?rw_tt_thread=True)) — beginner-accessible loop explainer: four-box test for when loops are worth building, cost-per-accepted-change as key metric, prove-then-harden-then-automate build order
