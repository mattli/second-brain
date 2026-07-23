---
created_at: 2026-04-05
last_updated: 2026-07-23
---

# Agentic Engineering

> TLDR: The emerging discipline of designing, optimizing, and orchestrating AI agents — including harness design, tool construction, self-improving agents, and multi-agent coordination.

## Recent Updates

- **2026-07-23:** Added Block's Buzz — agents as cryptographic team members, model-agnostic harnesses, peer-to-peer shared compute — to [Other Orchestration Tools](#other-orchestration-tools)
- **2026-07-22:** Added Cherny's domain-knowledge-as-infrastructure thesis — automation multiplies agent fleets, CLAUDE.md/skills/docs as zero-context onboarding — to [Domain Knowledge as Infrastructure](#domain-knowledge-as-infrastructure-cherny)
- **2026-07-19:** Added free AI agent starter repo (LangChain + Groq/Gemini fallback) to [Tools Noted](#tools-noted)
- **2026-07-19:** Added Machina's five-part agent composition template and engine-routing table to [Agent Composition Template](#agent-composition-template-machina), Raft to [Other Orchestration Tools](#other-orchestration-tools)
- **2026-07-18:** Added Flurry's virtual-OS thesis — WASM-based agent runtimes as 47x cheaper alternative to Linux VM sandboxes — to [Agent Runtime: Virtual Operating Systems](#agent-runtime-virtual-operating-systems)
- **2026-07-18:** Added Osmani's outer-loop accountability framework — Quality/Verdict/Answerability triad, trust-verification gap, three hidden costs, back-pressure principle, four human loops — to [Owning the Outer Loop](#owning-the-outer-loop-osmani)
- **2026-07-17:** Added retrieval tax concept — tokens wasted on fetch-and-clean loops — and owned-index principle to [Designing for Agent Callers](#designing-for-agent-callers)
- **2026-07-12:** Added Eric Siu's compounding-vs-leaking framework and cross-tool resolver pattern to [Compounding vs. Leaking](#compounding-vs-leaking-eric-siu)
- **2026-07-08:** Added Anthropic's advisor/orchestrator benchmark data (92%@63% cost, 96%@46% cost) to [Cost-Routing](#cost-routing-for-production-systems) and cached context sharing to [Managed Agents](#managed-agents-anthropic)
- **2026-07-08:** Added Replit's continual learning pipeline — ViBench, Telescope trace clustering, and production self-improvement loop — to [Self-Improving Agents](#self-improving-agents)

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

## Domain Knowledge as Infrastructure (Cherny)

Boris Cherny extends the [CLAUDE.md-as-routing-table](#practitioner-principles-sysls) principle into a broader thesis: the best engineers have always spent their highest-leverage hours automating their own work — vim macros, lint rules, end-to-end test suites — and agents make this practice dramatically more important.

**Three reasons automation matters more now:**

- **Fleet multiplication.** Automation that speeds you up also speeds up every agent you run. If you have an army of agents, each inherits the same infrastructure improvements. More automation = more output per unit of time across the entire fleet.
- **Permanent class elimination.** An agent can fix an issue every time it encounters it, but that burns tokens and may miss cases. If the agent instead writes a lint rule, CI step, or routine, that entire class of issue is automated forever. This is what [loops](loop-engineering.md) actually are — automating entire types of busywork rather than solving them one-off. Engineers have been doing this long before agents existed.
- **Zero-context contribution.** The most important shift: automation makes it possible for others to contribute to a codebase without the ramp-up period. Engineers are contributing to unfamiliar codebases on day one because agents navigate for them; non-engineers are contributing as effectively as engineers. What blocks both is domain knowledge that lives in people's heads rather than in infrastructure. With agents, the range of encodable domain knowledge has expanded beyond what lint rules, types, and tests can express — it now includes code comments, skills, CLAUDE.md rules, and memories. If a PR gets rejected because it doesn't use the right framework, or a feature gets rejected because it doesn't follow architectural patterns, those are failures of automation.

**The mandate:** every team should be writing the CLAUDE.md's, REVIEW.md's, skills, and docs that enable agents to work productively in their codebase with zero additional context from the prompter. This is a natural extension of what engineers have always done — automate and encode domain knowledge as infrastructure. As the model gets smarter and as the [harness](agent-harness.md) matures, the task becomes easier. The bottleneck is converting tacit domain knowledge to explicit infrastructure so that agents write better code, code review catches issues automatically, and the next person (or agent) working on the codebase can contribute without a ramp-up period.

## Discovering Unknowns (Thariq)

Thariq (Anthropic, Claude Code team) frames the core bottleneck of agentic work as **unknowns** — the gap between the map (your prompts, skills, and context) and the territory (the codebase, the real world, its actual constraints). With Fable-class models, work quality is no longer bottlenecked by model capability but by the operator's ability to surface and clarify unknowns before the agent encounters them mid-run.

**The four types of unknowns** (the Rumsfeld matrix applied to agentic work):

- **Known knowns** — what's in your prompt. What you explicitly tell the agent you want.
- **Known unknowns** — what you haven't figured out yet but are aware of. You know you don't know the right database schema.
- **Unknown knowns** — what's so obvious you'd never write it down, but would recognize if you saw it done wrong. Taste, layout preferences, implicit conventions.
- **Unknown unknowns** — what you haven't considered at all. Edge cases in the codebase, better approaches you don't know exist, quality levels you haven't imagined.

The best agentic coders have relatively few unknowns — they are deeply in sync with both the codebase and the model's behaviors. But they also *assume* unknowns exist and plan for them. Reducing unknowns is the skill of agentic coding, and Claude itself is the best tool for doing it.

**Pre-implementation discovery techniques:**

- **Blind spot pass** — ask Claude to find your unknown unknowns before you start building. Give it context about your experience level and what you know. "I'm working on adding a new auth provider but I know nothing about the auth modules in this codebase. Can you do a blindspot pass to help me figure out my relevant unknown unknowns?" Especially valuable when working in unfamiliar parts of the codebase.
- **Brainstorms and prototypes** — for surfacing unknown knowns (criteria you can only define when you see them). Ask for multiple design directions to react to rather than articulating requirements upfront. Visual design and UX are prime examples — difficult to describe, easy to evaluate. "Make me an HTML page with 4 wildly different design directions so I can react to them." This also prevents setting too narrow or too wide a scope.
- **Interviews** — ask Claude to interview you about ambiguities, one question at a time, prioritizing questions where the answer would change the architecture. This surfaces unknowns you couldn't have found by brainstorming alone.
- **References as specification** — when you can't describe what you want, point Claude at source code that implements the behavior you need. Source code is a richer reference than screenshots or documentation because it captures structure, edge-case handling, and implementation decisions. Claude Design uses this same principle — it reads the underlying code of a reference component, not just its visual appearance.
- **Implementation plans with decision surfaces** — ask for plans that lead with the parts most likely to change: data models, type interfaces, UX flows. Bury mechanical refactoring at the bottom. This lets Claude surface unknowns you'd otherwise discover mid-implementation.

**During implementation:** keep a temporary `implementation-notes.md` where the agent logs deviations from the plan. "If you hit an edge case that forces you to deviate from the plan, pick the conservative option, log it under 'Deviations', and keep going." No amount of planning eliminates unknown unknowns — the notes file captures them for the next attempt.

**Post-implementation:** two techniques for closing the loop. First, package the prototype, spec, and implementation notes into explainer artifacts — this accelerates buy-in by showing reviewers you accounted for the unknowns they would have anticipated. Second, ask Claude to quiz you on the changes. Reading diffs gives only surface understanding; a quiz forces comprehension of behavior changes across existing code paths. "Give me an HTML report on the changes with context and intuition, and a quiz at the bottom that I must pass." Only merge after passing.

**The instructing balance:** being too specific makes Claude follow instructions even when a pivot is better; being too vague lets it default to industry best practices that may not fit. The unknowns framework resolves this — you don't need to specify everything upfront if you've systematically reduced the gap between your map and the territory. This complements the [SysLS principle](#practitioner-principles-sysls) of separating research from implementation — Thariq's techniques are how you do the research phase well.

## Owning the Outer Loop (Osmani)

Addy Osmani frames the defining boundary of agentic engineering: agents run the **inner execution loop** (investigate → implement → verify → repeat); engineers own the **outer loop** — the accountability for what ships. As models gain capability, the outer loop becomes the scarce, high-leverage work. "An agent can write it. But before it reaches users, someone must explain why it should exist, why it's safe enough to be part of production, and what they will do when it is wrong."

**The accountability triad.** Three concepts hold the outer loop together:

- **Quality** — all the checks installed before the system runs: type checks, tests, hooks, sandbox limits, audit logs. These checks produce evidence, and from that evidence you derive a verdict.
- **Verdict** — the production decision made from that evidence: ship, block, redirect, add a guardrail, or reject. The model may write the code, but the verdict belongs to the engineer. "The work of my team will not enter our dependent systems without my decision."
- **Answerability** — the guarantee that if someone asks, you can explain why. With long-horizon agents making hundreds of intermediate decisions over hours, reconstructing the chain after the fact becomes impossible unless answerability is designed in from the start.

**The trust-verification gap.** Code generation has outrun code control. Sonar's 2026 survey found 42% of committed code was AI-generated or significantly AI-assisted, with expectations for that share to keep growing [[source]](https://www.sonarsource.com/state-of-code-developer-survey-report.pdf). GitLab's June 2026 research showed governance typically happens *after* code creation — after risk has been accepted and ownership lost [[source]](https://ir.gitlab.com/news/news-details/2026/GitLab-Research-Reveals-Organizations-Are-Generating-AI-Code-Faster-Than-They-Can-Control-It/default.aspx). Many teams distrust AI code but haven't built that distrust into their verification processes. Creation is getting cheaper; review, validation, understanding, and maintenance are the scarce resources.

**Three hidden costs of delegation:**

- **Cognitive surrender** — blindly accepting AI output. A Wharton study found that when AI was wrong, nearly 75% of people accepted it anyway, and felt *more* confident than they would have without AI [[source]](https://executiveeducation.wharton.upenn.edu/thought-leadership/wharton-at-work/2026/05/thinking-fast-slow-and-artificially/). The agent's output becomes your answer; with it comes all the accountability.
- **Cognitive debt** — erosion of understanding. An Anthropic randomized controlled trial found engineers who leaned on AI scored 17 percentage points lower on comprehension (50% vs 67%) than those who wrote code themselves [[source]](https://www.anthropic.com/research/AI-assistance-coding-skills). The longer the agentic planning horizon, the wider the gap between what the agent produces and what you understand. The debt compounds.
- **Orchestration tax** — cognitive bandwidth doesn't parallelize the way agent fleets do. Steering, sorting, verifying, directing — none of it can be automated. See the [dedicated treatment](#the-orchestration-tax-osmani) for the full analysis.

**Back pressure, not maximum autonomy.** Don't grant agents as much autonomy as they can exercise — grant just enough that you retain enough back pressure to stop them, check their work, and ensure your understanding. Ordinary engineering signals (type checks, tests, hooks, monitors) provide natural back pressure. As long as agents emit the same signals, the existing engineering system constrains them appropriately.

**Four human loops (not the inner loop).** The human doesn't need to be in the agent's execution loop. They need to be in four surrounding loops:

1. **Constraints loop** — what inputs, architectures, instructions, or invariants to set
2. **Sampling loop** — how much output to sample and review
3. **Audit loop** — what evidence to keep and how to ensure audit effectiveness
4. **Ownership loop** — what part of the production boundary to own

This maps directly to the [delegation–collaboration split](#the-delegationcollaboration-split): collaborative work keeps the human in the inner loop; delegated work moves them to these four outer loops. The [loop engineering](loop-engineering.md) concept of open vs. closed loops is the implementation-level version of the same boundary.

**High agency as discernment.** The agency ladder runs from low to high: flag a problem → investigate → execute → diagnose → propose solutions → recommend → resolve. The highest rung is discernment: "found it, it's not worth fixing, moving on." High agency is knowing when to delegate, when to inspect, when to stop, and when to own the result.

**Accountability scales the factory.** Without accountability, high agency brings chaos — no rules, no trade-offs, no safety nets. Skills give you leverage; accountability turns leverage into trust. The half-life of a technical edge is one release; the half-life of a signature — your name on work you stand behind — is a career. Every codebase should come with an accountability contract: the checklist understood when the change was accepted, the evidence behind the decision, who was accountable, and the system status after the change. The bottleneck moves from "can we build this?" to "should this exist, and can we answer for it?"

## Harness Design: "Seeing Like an Agent"

> The harness concept has grown into its own dedicated topic. For a full treatment of what a harness is, its 12 components, the thin harness / fat skills pattern, memory ownership, and design decisions, see [Agent Harness](agent-harness.md).

The Claude Code team (Thariq, Anthropic) published key lessons on designing agent action spaces:

**Core principle:** Give agents tools shaped to their own abilities. The right tool depends on the agent's capabilities, not human intuition. "Put yourself in the mind of the model."

**Lessons learned:**
- **AskUserQuestion tool** — Three attempts to improve elicitation: parameter on ExitPlanTool (confused the model), modified markdown output (unreliable formatting), dedicated tool with structured output (worked). "Even the best designed tool doesn't work if Claude doesn't understand how to call it."
- **Todos → Tasks** — As models improved, todo reminders became constraining. Replaced with Task tool supporting dependencies, subagent communication, and deletion. "As model capabilities increase, tools that once helped might now constrain them."
- **Search evolution** — Started with RAG vector database, moved to Grep tool for self-directed search, then progressive disclosure via skills. Over one year: "Claude went from not being able to build its own context to nested search across several layers of files."
- **Progressive disclosure** — Add functionality without adding tools. The Claude Code Guide subagent loads docs on demand rather than stuffing everything in the system prompt. ~20 tools total, high bar to add more.

The eval gap remains the widest hole in production agent work: 89% of teams running agents have observability set up, but only 52% have evals [[source]](https://x.com/akshay_pachaar/status/2070860837448040832/?rw_tt_thread=True). For evaluation methodology that applies directly to agent systems — floor-raising over benchmark-maxxing, trace review pipelines, LLM-as-judge — see [AI Evals](ai-evals.md).

## Planner/Generator/Evaluator Harness (Anthropic Applied AI)

Ash Prabaker and Andrew Wilson (Anthropic applied AI team) presented a three-role harness architecture for long-running agent builds — the system behind Anthropic's internal one-shot app demos that run 4–6 hours and produce fully functional applications from single-line prompts.

**The three roles, each in its own context window:**

- **Planner** — Takes the user's one-line prompt and produces a deliberately high-level spec broken into sprints. It does *not* plan granular technical details. The reason: a single wrong technical decision in the plan cascades through every subsequent sprint, magnifying errors over multi-hour horizons. The planner sets hard outer lines; the other two agents figure out the details.
- **Generator** — Builds the code. Works from the planner's spec but negotiates scope and acceptance criteria with the evaluator before writing a single line.
- **Evaluator** — Not a code reviewer — an actual user of the app. Launches Playwright (or Claude for Chrome MCP), navigates live pages, clicks around, tries things, then scores against a rubric and writes critique. The evaluator catches bugs that pass CI because it interacts with the running application the way a human would.

**The critic-gap exploit.** The entire pattern is inspired by GANs. The key insight: tuning a standalone critic to be harsh is tractable; tuning a builder to be self-critical is not. The same asymmetry that makes it easy for a person to critique a meal but hard to cook one applies to LLMs — they can identify quality gaps in output far more reliably than they can prevent those gaps during generation. The harness exploits this by splitting the roles into separate context windows with separate system prompts, channeling the model's sycophancy into two opposing objectives.

**Contract negotiation before building.** Before each build phase, the generator proposes: "I'm going to build X feature, and you should verify it by testing Y." The evaluator pushes back: "Scope is too big, those tests are too weak, you've missed these edge cases." They iterate via files on disk until both agents agree on a contract — what "done" means, expressed as specific, testable assertions. The generator is then graded against this negotiated contract, not the original planner spec. In the retro game maker demo, the agents settled on 27 contract criteria. Granular criteria produce actionable critiques; vague criteria produce vague critiques that the generator shrugs off. This contract negotiation is framed as the key innovation over Ralph loops, which had a fixed plan.md with no one arguing back.

**Grading subjective quality.** For front-end applications, the evaluator grades against a four-criteria rubric: design, originality, craft, and functionality — weighted toward design and originality (since Opus 4.6 already handles functionality well). The rubric is calibrated with few-shot examples on reference sites so the evaluator's taste converges on the builder's intended aesthetic. The claim: "Most people say you can't grade taste, but you can if you have a strong enough opinion on it and you just kind of write it down." The practical target: preventing purple gradients and generic AI-slop aesthetics.

**Evaluator isolation — do NOT share traces.** The team explicitly tested giving the evaluator access to the generator's reasoning traces. It made things worse. When the evaluator sees *why* the generator made a decision, it gets talked into agreeing. The effective pattern: the evaluator judges output only, never sees the reasoning that produced it, and reports "this is an issue" without diagnosing the cause. The generator then reflects on its own work to figure out the fix. This independently confirms the [verifier sub-agent principle](loop-engineering.md#verification-is-the-essential-feedback) from Lance Martin's work — grading in an independent context window prevents the grader from being influenced by the generator's reasoning.

**Pivot behavior.** Unlike single-pass generation or Ralph loops that keep patching the same approach, the PGE harness pivots. When the generator gets stuck — scoring low on one rubric criterion through multiple rounds — the evaluator tells it to throw everything away and restart from scratch. With Opus 4.6, this willingness to discard hours of work and try a fundamentally different approach emerged naturally under adversarial pressure. The same model, self-evaluating, would never restart — it's too attached to its own output. The adversarial split makes restart a tractable option.

**Concrete results (retro game maker demo):** Same prompt, same model, solo loop vs. PGE harness. Solo: sprite editor works, play mode renders entities but arrow keys do nothing, space key does nothing — the agent didn't know how to test whether a game was playable. PGE (~$200, ~6 hours, 5–15 rounds): the agent named itself "Retro Forge," created a project dialogue, built a full 54-color palette, a sprite editor with game-scale preview, an AI level-design assistant (the planner decided "AI features" should exist, the generator/evaluator turned that into a working assistant), and a play mode with working physics, collision detection, arrow-key movement, and a live debug HUD — which exists because the evaluator needed it to test gameplay.

**Harness co-evolution with models.** The same harness architecture required different configuration across model generations. What changed from Opus 4.5 to 4.6:

- *Context resetting between sessions* — dropped entirely. Opus 4.5 had severe context anxiety; Opus 4.6 doesn't. Single continuous session with compaction replaced fresh context windows.
- *Sprint decomposition* — previously critical to keep Opus 4.5 on track (force-fed one feature at a time). Opus 4.6 holds a 2-hour continuous build coherently without it.
- *Evaluator cadence* — previously ran every sprint. Now runs at the end of a full generation pass, then hands back critique. Fewer interruptions, roughly half the cost.

The lesson: the harness wasn't wrong for 4.5 — it was right for 4.5. The frontier moved. "It's really important to get a feel for what the spiky behaviors of any individual model are, and then try to adapt your harness to fill the gaps." This mirrors the [model-quality-changes-loop-behavior](loop-engineering.md#model-quality-changes-loop-behavior) finding — the same architecture produces qualitatively different behavior depending on the model inside it.

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
2. **Orchestration** — /goal and Outcomes for self-correcting loops. [Loop Engineering](loop-engineering.md) for multi-step orchestration. Routines for laptop-off cloud runs. Turns primitives into workflows.
3. **Memory** — State files, Skills, Knowledge Bases, lessons written down. Makes tomorrow's session resume instead of restart.
4. **Self-improvement** — Vision self-checks, eval loops, rule distillation. The agent grades its own output, refines the Skill that produced it, writes the lesson back to memory.

The compounding mechanism: every output from layer 1 flows up through layer 4, where it gets graded, distilled, and written back to layer 3. Tomorrow's run at layer 1 inherits the sharpened memory and refined Skills from yesterday. The model is stateless; the system around it isn't.

### Cost-Routing for Production Systems

Not every step in a self-improving system needs the top-tier model. Teams running these systems in production route by task complexity:

- **Frontier model** (Fable 5 / most capable available) for the orchestrator role: planning across days, delegating to sub-agents, checking work with vision, distilling rules from accumulated evidence. Use where days-long capability earns its pricing.
- **Strong model** (Opus-class) for hard-but-bounded subtasks: architecture decisions, complex debugging, deep code reviews. Also the explicit fallback for any request the frontier model's safety classifiers block.
- **Fast model** (Sonnet-class) for high-volume worker tasks: lint passes, simple refactors, test scaffolding, doc updates. The bulk of fan-out work.
- **Cheap model** (Haiku-class) for grader sub-agents and classifiers. Independent context window, low cost — ideal for the [verifier role](loop-engineering.md#verification-is-the-essential-feedback).

The pattern: **orchestrator on the frontier model, workers on the fast model, graders on the cheap model, fallback to the strong model on classifier blocks**.

Anthropic's own benchmarks quantify the savings from two variants of this pattern. In the **advisor pattern**, a Sonnet-class executor calls a Fable-class model for guidance — typically once per task for strategic steering while the executor handles the bulk of the work. On SWE-bench Pro, this recovers ~92% of the frontier model's score at ~63% of the cost. In the **orchestrator pattern**, a Fable-class model plans and delegates to Sonnet-class workers. On BrowseComp, the orchestrator configuration achieves 96% of solo-frontier performance at 46% of the price, because token-heavy research is delegated to the cheaper workers [[source]](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool).

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

### Continual Learning in Production (Replit)

Replit's Michele Catasta frames continual learning as operating at three layers — model, harness, and context — and argues that the latter two are where most production teams should focus, since frontier model weights are off the table for fine-tuning. Harness-level learning mines production traces to systematically improve code, tools, and instructions across all agent instances. Context-level learning personalizes at agent, user, and org scope so the product compounds with every interaction.

The practical system has two measurement pillars and one optimization loop, following a Swiss cheese model where each layer has gaps but together they catch more than any single layer:

- **Offline benchmarks ([ViBench](https://vibench.ai/))** — Replit's public benchmark for vibe coding. Unlike SWE-bench or Terminal-Bench, ViBench starts from a plain-English PRD (drawn from anonymized production traces) and grades whether the built application meets the spec. The eval agent uses Playwright to progressively discover and exercise whatever the coding agent invented — no fixed locators, routes, or test harnesses. Natural-language test plans replace hard-coded assertions. Early results showed that frontier coding-benchmark scores don't reliably transfer to full app building, and most models degrade when extending their own code as errors compound. See [AI Evals](ai-evals.md) for complementary evaluation frameworks.
- **Online A/B tests** — Most agent-affecting changes (prompts, tools, harness revisions, model swaps) get A/B tested in production. Results are hard to interpret: longer runs may mean more useful work or the agent getting stuck; lower cost may mean efficiency or silently dropped capability.
- **Telescope (trace clustering)** — At production scale, no engineer can read every trace. Telescope organizes repeated failure patterns into issue clusters using density-based clustering on evidence-grounded facets (inspired by Anthropic's Clio). It reconstructs sessions from user messages, agent replies, tool calls, and errors, then summarizes, embeds, and clusters what went wrong. Engineers search the compact facet layer first, then drill into representative sessions. In aggregate, Telescope answers which workflows dominate, which get abandoned, and whether a mitigation is shrinking its target cluster.

**The self-improvement loop.** Once measurement exists, the bottleneck shifts to turning evidence into fixes. Each loop pass reads production logs, trace clusters, and recent failures to form a hypothesis, builds a candidate fix, opens a draft PR with reasoning attached, measures against ViBench and A/B baselines, and recommends whether to ship, iterate, or drop. Engineers still review and own the launch decision — the loop prepares the evidence and first-pass implementation. Each run records what it tried (including failures), so future runs reuse what worked and avoid known dead ends.

**Where human judgment remains essential:** hypothesis selection (deciding which clusters deserve the loop's overnight budget), implementation architecture (traces show abandonment but humans decide whether to smooth the path or redesign the surface), [eval](ai-evals.md) curation (shaping the hill the agent climbs — wrong rewards produce wrong optimizations), and launch approval (reading evidence, understanding blast radius, owning the rollout).

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

**Raft** — Shared workspace where humans and agents collaborate as teammates. Looks like Slack (channels, threads, tasks, DMs) but members include agents with persistent identity and memory. Agents claim tasks from channels, run in parallel, hand work to each other, and review each other's output in shared threads. Agents run locally via a lightweight process ("the Computer") using existing subscriptions (Claude Code, Codex, Gemini CLI, Cursor) — Raft never sits between agent and model. External agents (like [Hermes](#other-orchestration-tools)) join through a gateway process. 20,000+ builders; the Raft team itself runs 10 humans and 100+ named agents internally.

**Buzz** ([Block](../landscape/ai-organization-design.md) / Jack Dorsey) — Agent-as-teammate workspace where every agent gets a cryptographic key pair (not an API token), joins channels like a new hire, reads history, and participates in threads, DMs, and voice huddles with the same mechanics as human members. Model-agnostic via a harness layer — agents run on Claude Code, Codex, or Goose, and switching models is a dropdown change with the agent's identity and memory preserved. Self-hosted on your own server (Nostr-based decentralized identity), so messages stay off vendor infrastructure. The "chief of staff" pattern — one agent that delegates research, writing, and fact-checking to specialized agents, spins up project channels, and coordinates handoffs in threads — demonstrates multi-agent orchestration emerging from the room metaphor rather than from code. Shared compute lets community members pool local hardware (Mac Studios, etc.) so agents run on peer-to-peer local models that scale automatically as more members contribute — no API costs, no token bills. Early-stage (July 2026): rough installer, no mobile client, but the core architecture treats agents as first-class organizational members rather than plugins.

**MiroFish** — Swarm intelligence prediction engine. Creates multi-agent simulations with independent personalities and long-term memory to predict outcomes from seed information (news, policies, financial signals).

### Agent Composition Template (Machina)

A practitioner template for standing up named agents as teammates rather than disposable sessions. Every agent is assembled from the same five parts:

1. **Name** — A real name, not "agent-2." The name is how you route work ("give this to june") and how you audit it ("june drafted this, who reviewed it?").
2. **Soul** — The agent's job description, scope constraints, and tone. Half a page is enough: role, scope boundaries, tone rules, daily deliverables, hard rules. On Raft this accumulates from chat corrections rather than being written up front — you tell the agent things ("drafts only, never contact a prospect") and its own version builds over time.
3. **Memory** — Agent-maintained working notes (a `MEMORY.md` plus scratch files): what worked, what failed, which sources are gold, which are noise. The operator feeds it through corrections; the agent writes it down. Compress when notes pass a page — memory that grows forever stops being read.
4. **Goals** — What the agent owns, what "done" looks like, and what it must escalate instead of deciding. Three buckets: own (steady flow of X), done (every output has Y), escalate (pricing, legal, anything answered).
5. **Heartbeat** — The schedule it wakes on without being asked. Two are usually enough: a daily sweep and an hourly check that stays silent when nothing changed.

**Engine-routing table.** Match engine to work type rather than defaulting everything to one model: Claude Code for writing-heavy tasks (content, client deliverables — strongest prose), Codex for building (internal tools, automations, scripts — sandboxed execution), Hermes for always-on monitoring (lead sweeps, reply watches — heartbeats, monitors, playbooks). The routing isn't about which model is "best" but which harness suits the task shape.

**Cross-review as self-improvement.** No agent grades its own work — left alone, an agent approves its own output every time. Every deliverable crosses a second agent instructed to assume the work is broken. The same five agents review each other (cole reviews ray, etta reviews june, etc.). Every rejection carries a reason that gets written back into the soul and memory files, so the same mistake doesn't survive twice. See also [self-improving agents](#self-improving-agents) and [loop engineering](loop-engineering.md) for the broader pattern.

**One pillar at a time.** Don't stand up five agents at once — "a team you can't feed is theater." Day 1: one agent for the pillar where you lose the most hours. Day 2: add its reviewer. Days 3–7: run the pair daily; every time you correct the same mistake twice, write it into the soul file. Week 2: add the next pillar only because the first one now runs without you.

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

The orchestration tax left unpaid accumulates both technical debt (merged code you didn't read well) and cognitive debt (a stale mental model of your own codebase). Neither shows on a dashboard today; both show when production breaks and you realize you have no idea how the system works anymore. Osmani later placed the orchestration tax alongside two companion costs — cognitive surrender and cognitive debt — within the broader [outer-loop accountability framework](#owning-the-outer-loop-osmani). See also: the [delegation–collaboration split](#the-delegationcollaboration-split) for how to classify which work mode fits which task.

### Compounding vs. Leaking (Eric Siu)

Eric Siu, running 10–15 agents daily (Hermes in Slack, Claude Code, Codex), names the failure mode that the orchestration tax creates when left unmanaged: **leaking**. Work either compounds — today's output builds on yesterday's, making the pile more valuable over time — or it leaks, vanishing into threads you'll never reopen, forcing you to pay for the same work twice.

Symptoms of leaking: asking your own threads to summarize what they were for, dreading old sessions because you can't remember their state, shipping something and finding a near-identical agent-produced version from two days earlier. The feeling is "busy all day, moving slowly" — the worst kind of problem because you can't point at it to fix it.

**Workspace over stream.** Chat apps are streams — newest on top, no sense of priority, no memory of what's still open. That model breaks at 15 concurrent workstreams because the human becomes the memory for all of it. The fix is treating agent work as sessions with state, status, and priority — the same model Claude Code and Codex use. Siu's first move: point an agent at his own backlog and have it sort by priority, grouping P0s (CFO spend thread, HubSpot work, pre-meeting context cron) at the top. "That single change moved me from a stream to a workspace."

**Skill reuse.** Building a good [skill](claude-code-skill-frameworks.md), using it once, then forgetting it exists is compounding running in reverse. A searchable skill library turns past work into an asset; an unsearchable one turns it into "a story about a thing you once did." The same applies to artifacts (pages, images, creatives) — when they live in one searchable place, last month's output becomes this month's starting point.

**Cross-tool resolver.** The highest-leverage piece: a resolver that runs at end of day, reads across all tools (Hermes, Claude Code, Codex), finds overlapping work, and gives a straight call on each cluster — keep this, consolidate these, delete that. Any single tool can only see its own sessions, but duplicate work typically spans tools (thread in Hermes Monday, half-solution in Codex Tuesday). The resolver is the only view that sees the whole day at once.

**Scaffolding compounds, models don't.** Swapping in a new model gives a slightly better answer; you're back to square one when the next one lands. Scaffolding — workspace organization, reusable skills, prep crons, resolvers — stacks permanently. "Build a couple of these a week, and six months from now you're operating at a level no model release can hand you."

### Loop Engineering

> The loop engineering concept has grown into its own dedicated topic. For a full treatment — five-stage lineage (ReAct → Reflexion → AutoGPT → Ralph → /goal → orchestration), the four-level stack, open vs. closed loops, the four-box test, autonomy ladder, five building blocks, verification patterns, business loops, and the cost dynamics — see [Loop Engineering](loop-engineering.md).

Loop engineering is the practice of replacing yourself as the person who prompts the agent — you design the system that prompts it instead. Where [harness design](agent-harness.md) shapes the environment a single agent runs inside, and orchestration coordinates multiple agents, loop engineering sits one level above both: a recurring system that discovers work, dispatches agents, checks results, records state, and decides the next step — all without a human in the turn-by-turn prompting seat. Boris Cherny's framing: "I don't prompt Claude anymore. I have loops that are running. They're the ones that are prompting Claude and figuring out what to do. My job is to write loops." The fleet loop maps directly to the orchestration patterns elsewhere on this page — orchestration with a recurring feedback cycle wrapped around it. See [Loop Engineering](loop-engineering.md) for details.

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

**Cached context across sub-agents:** Each sub-agent in [Managed Agents](#managed-agents-anthropic) keeps its own prompt cache, so repeat calls within the same sub-agent don't pay full price for the same context twice. This makes both the advisor and orchestrator cost-routing patterns above more economical at scale — the frontier model's cache persists across its sparse advisory calls, and each worker's cache persists across its dense execution steps.

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

## Agent Runtime: Virtual Operating Systems

Nathan Flurry argues the industry's default approach to agent sandboxes — giving each coding agent a full Linux VM — is dramatically over-provisioned. The shift from "agents-with-tools" (AI SDK, Mastra) to "agents-with-linux" (Claude Code, Pi, OpenCode) drove sandbox adoption because agents perform vastly better with filesystem access and shell commands. But a full VM reserves gigabytes of RAM and a dedicated CPU per agent, most of which sits idle.

**The alternative: a "virtual operating system."** Instead of a real Linux kernel, emulate the four things coding agents actually need — terminal commands, filesystem access, outbound networking, and dev servers — in a lightweight runtime. AgentOS, an open-source project from Rivet, compiles real Linux commands to WebAssembly so they execute cheaply without a full sandbox. By their benchmarks, a basic WASM shell uses ~22 MB of RAM vs. 1 GiB for the cheapest mainstream sandbox provider — roughly 47x less [[source]](https://agentos-sdk.dev/docs/benchmarks).

**Key components of the virtual OS approach:**

- **Shell emulation** — Agents don't need a kernel; they need `cat`, `ls`, and `grep` to behave correctly. These commands can be compiled to WASM or replaced with simple lookup maps. AgentOS adds full shell/Node.js/Python scripting, process trees, PATH, and shebang support.
- **Network-attached filesystem** — Cloud filesystems are already network-attached (S3, Archil, Mesa). Mounting one for an agent is no different: reads become GETs, writes become PUTs. AgentOS provides a POSIX-compliant filesystem with pluggable backends.
- **Granular network security** — A virtual OS gives programmatic control over the networking layer: domain allowlists, ingress/egress limits, rate limiting, SSRF protection. Most traditional sandboxes still lack this granularity despite networking being a primary attack vector.
- **Stateless dev servers** — For static builds, the agent runs `vite build` on the host, writes output to the virtual filesystem, and a preview endpoint routes requests to the stored files. Live servers (hot reload, SSR, WebSockets) run inside the WASM runtime with native preview URLs.

**Hybrid architecture for edge cases.** Docker-in-Docker, GPU workloads, and native binaries without WASM builds genuinely need a full sandbox. AgentOS supports "sandbox mounting" — default to the lightweight virtual OS, escalate to a full sandbox (E2B, Daytona) only for the rare operations that require it.

**Prior art:** Mintlify, Upstash, and Turso have deployed virtual OS architectures in production. Parallel efforts include Vercel's just-bash (JavaScript reimplementations of Linux tools) and Cloudflare's Project Think (custom harness using JavaScript instead of bash for code execution on their proprietary stack).

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

**The retrieval tax.** Web search is how agents see anything that happened after training, but standard search APIs return links and thirty-word snippets — pointers to content, not content itself. The agent then pays to fetch the page, strip the HTML, and extract usable text before any reasoning starts. In a single-query task the overhead is invisible; in a multi-hop research loop each iteration re-bills the entire growing context window, because every prior page is still sitting in context. Benchmarking the same question across three retrieval setups showed the looping agent burning roughly 4x the tokens of an owned index that had already crawled and cleaned the pages ahead of time [[source]](https://x.com/akshay_pachaar/status/2077753829526056985/). The principle: good retrieval returns documents, not directions. An owned index does the fetch-and-clean work before the query arrives, so the agent goes straight to reasoning. This is the same architectural insight behind [agent-native CLI design](#agent-native-cli-design) below — pull data down and pre-process it so the agent's token budget goes to thinking, not janitorial I/O.

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
- **Google Agents CLI** — Injects 7 ADK skills into any coding agent (Claude Code, Cursor, Codex), covering scaffolding, [eval](ai-evals.md) setup with LLM-as-judge scoring, deployment to Agent Runtime / Cloud Run, and Cloud Trace observability. Full lifecycle from natural language prompts without leaving the editor. https://github.com/google/agents-cli
- **Free AI Agent Starter** (divyansh tiwari) — Beginner-friendly open-source agent repo: LangChain + LangGraph, Groq/Gemini free-tier LLMs with automatic fallback, DuckDuckGo search, LangGraph checkpoint memory. Runs locally, MIT licensed.

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
- "BUILD A REAL AI AGENT FOR $0 WITH THIS GITHUB REPO" — divyansh tiwari (tweet, Jul 2026) — pointer to beginner-friendly free agent repo (LangChain/LangGraph, Groq/Gemini, DuckDuckGo)
- "An Interview with OpenAI CEO Sam Altman and AWS CEO Matt Garman About Bedrock Managed Agents" — Ben Thompson / Stratechery (Apr 2026) — OpenAI + AWS Bedrock Managed Agents announcement, model-harness convergence thesis, agent identity problem, local vs cloud agents, intelligence-as-utility pricing, platform strategy (neutral vs integrated)
- "How To Be A World-Class Agentic Engineer" — SysLS (tweet thread, May 2026) — practitioner minimalism: context-is-everything principle, research/implementation separation, adversarial triangulation for sycophancy, task contracts with stop-hooks, CLAUDE.md as conditional routing table, consolidation cycle for rules and skills
- "The Orchestration Tax" — Addy Osmani (May 2026) ([link](https://addyosmani.com/blog/orchestration-tax/)) — human as GIL of agent fleet, Amdahl's Law applied to review bottleneck, cognitive surrender failure mode, five attention-architecture principles (scale to review rate, sort work, batch reviews, lock on judgment only, protect serial time)
- "Loops: What Every AI Engineer Needs to Know in 2026" — Rahul (@sairahul1, Jun 2026) — open vs closed loop taxonomy, single-agent vs fleet loop scales, token cost as the key accessibility barrier to loop engineering
- "Agents Need a New Kind of Web Search" — Akshay (tweet thread, Jul 2026) ([link](https://x.com/akshay_pachaar/status/2077753829526056985/)) — retrieval tax concept: tokens agents burn on fetch-and-clean before reasoning; owned-index principle; 4x token cost gap between looping search and pre-crawled index
- "Own the Outer Loop" — Addy Osmani (Jul 2026) — inner/outer loop accountability framework: Quality/Verdict/Answerability triad, trust-verification gap (Sonar 42% AI-assisted commits, GitLab governance gap), three hidden costs (cognitive surrender, cognitive debt, orchestration tax), back-pressure principle, four human loops, high agency ladder, accountability contracts
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
- "We've partnered with @Vercel" — NanoClaw (tweet, Apr 2026) — NanoClaw + Vercel approval system for AI actions in Slack/WhatsApp/Teams
- "Karpathy's Agentic Engineering Finally Has Proper Tooling" — Akshay (tweet thread, Jun 2026) ([link](https://x.com/akshay_pachaar/status/2070860837448040832/?rw_tt_thread=True)) — Google Agents CLI walkthrough: 7 injected ADK skills, full-lifecycle from scaffold to deploy, eval adoption gap stat (89% observability vs 52% evals)
- "A Field Guide to Fable: Finding Your Unknowns" — Thariq (tweet thread, Jul 2026) — map-vs-territory metaphor for agentic work, four types of unknowns (Rumsfeld matrix), phased discovery techniques (blind spot pass, brainstorms, interviews, references, implementation plans, quizzes)
- "Continual Learning for Agents" — Michele Catasta / Replit (tweet, Jul 2026) — three-layer continual learning (model/harness/context), ViBench vibe coding benchmark, Telescope trace clustering, production self-improvement loop, human judgment insertion points
- "you probably don't need an expensive sandbox" — Nathan Flurry (tweet, Jul 2026) — virtual OS thesis: WASM-based agent runtimes as 47x cheaper alternative to Linux VM sandboxes, AgentOS open-source project, hybrid sandbox mounting for edge cases
- "A few patterns we frequently use with Fable 5" — ClaudeDevs (tweet, Jul 2026) ([advisor docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool), [cookbook](https://github.com/anthropics/claude-cookbooks/blob/main/managed_agents/CMA_plan_big_execute_small.ipynb)) — advisor pattern (92% of Fable score at 63% cost on SWE-bench Pro), orchestrator pattern (96% at 46% cost on BrowseComp), cached context sharing across Managed Agents sub-agents
- "How To Run 15 AI Agents at Once (Without Losing Half the Work)" — Eric Siu (tweet thread, Jul 2026) ([link](https://x.com/ericosiu/status/2075640250626715833/?rw_tt_thread=True)) — compounding-vs-leaking framework for multi-agent output management, workspace-over-stream organization, cross-tool resolver pattern, skill reuse as compounding, scaffolding > models thesis
- "This New App Gave Me an AI Team of Employees" — Creator Magic (video, Jul 2026) ([link](https://www.youtube.com/watch?v=g8dQBSKIGyc)) — Buzz (Block/Dorsey) walkthrough: cryptographic agent identity, model-agnostic harness switching, chief-of-staff delegation pattern, peer-to-peer shared compute
- "How to build your first team of agents" — Machina (tweet thread, Jul 2026) — five-part agent composition template (name, soul, memory, goals, heartbeat), engine-routing table (Claude Code writes, Codex builds, Hermes monitors), cross-review self-improvement loop, one-pillar-at-a-time rollout, Raft shared workspace
- "Something I have been thinking about: in the past, the best engineers..." — Boris Cherny (tweet, Jul 2026) — domain knowledge as infrastructure thesis: automation multiplies agent fleets, lint rules/CI steps as permanent class elimination, CLAUDE.md/skills/docs enabling zero-context contribution
