---
created_at: 2026-04-13
last_updated: 2026-04-20
---

# Agent Harness

> TLDR: The harness is everything that wraps a model to make it an agent — orchestration loop, tools, memory, context management, state, and safety. The same model can jump 20+ positions on a benchmark by changing only the harness. "If you're not the model, you're the harness."

## What Is a Harness

The term was formalized in early 2026 but the concept preceded it. The canonical formula, from LangChain's Vivek Trivedy: *Agent = Model + Harness*. The corollary: "if you're not the model, you're the harness."

The harness is the complete software infrastructure wrapping an LLM: orchestration loop, tools, memory, context management, state persistence, error handling, and guardrails. When someone says "I built an agent," they mean they built a harness pointed at a model.

*LLM as CPU analogy* (Beren Millidge, 2023): A raw LLM is a CPU with no RAM, no disk, no I/O. The context window is RAM (fast but limited). External databases are disk (large but slow). Tool integrations are device drivers. The harness is the operating system. "We have reinvented the Von Neumann architecture."

*Framework vs. runtime vs. harness:* A framework (LangChain) provides abstractions. A runtime (LangGraph) manages execution state. A harness is the opinionated, batteries-included layer that configures both with domain-specific constraints and infrastructure. The Node.js analogy: Node is the runtime, Express is the framework, Next.js is the harness.

Claude Code is a harness. Codex is a harness. Cursor is a harness. They all run the same underlying models; the harness is why they behave differently.

## Why Harnesses Matter

*Benchmark evidence:* LangChain changed only the infrastructure wrapping their LLM (same model, same weights) and jumped from outside the top 30 to rank 5 on TerminalBench 2.0. "The model is a constant. The harness is the variable."

Claude Code's leaked source code (March 2026, accidentally shipped to npm) was 512,000 lines. That code is the harness. Even the makers of the best model in the world invest heavily in harnesses.

## Three Levels of Engineering

- *Prompt engineering* — crafts instructions the model receives
- *Context engineering* — manages what the model sees and when
- *Harness engineering* — encompasses both, plus all application infrastructure: tool orchestration, state persistence, error recovery, verification loops, safety enforcement, lifecycle management

## 12 Components of a Production Harness

1. *Orchestration loop* — the Thought-Action-Observation (TAO/ReAct) cycle. Often just a while loop; complexity lives in everything it manages. Anthropic describes their runtime as a "dumb loop" — all intelligence lives in the model.

2. *Tools* — the agent's hands. Defined as schemas injected into context. Handles registration, validation, argument extraction, sandboxed execution, result capture, formatting.

3. *Memory* — see section below.

4. *Context management* — model performance degrades 30%+ when key content falls in mid-window positions ("Lost in the Middle"). Production strategies: compaction, observation masking, just-in-time retrieval, sub-agent delegation.

5. *Prompt construction* — assembles system prompt, tool definitions, memory files, conversation history, current message.

6. *Output parsing* — modern harnesses use native tool calling (structured tool_calls objects). Legacy: RetryWithErrorOutputParser.

7. *State management* — LangGraph uses typed dictionaries with checkpointing. Claude Code uses git commits as checkpoints and progress files as scratchpads.

8. *Error handling* — "a 10-step process with 99% per-step success still has only ~90.4% end-to-end success." Errors compound. Four types: transient (retry), LLM-recoverable (return as ToolMessage), user-fixable (interrupt), unexpected (bubble up).

9. *Guardrails and safety* — OpenAI SDK: input, output, and tool-level guardrails plus tripwires. Claude Code gates ~40 tool capabilities independently with 3-stage permission flow.

10. *Verification loops* — "giving the model a way to verify its work improves quality by 2-3x" (Boris Cherny, Claude Code creator). Approaches: rules-based (tests/linters), visual (screenshots), LLM-as-judge.

11. *Subagent orchestration* — Claude Code: Fork, Teammate, Worktree execution models. OpenAI: agents-as-tools and handoffs. LangGraph: nested state graphs.

12. *Long-horizon continuity* — "Ralph Loop" pattern (Geoffrey Huntley): agent treats every session as a repeating loop — write a planning file at the start, execute one task, update the file before context resets.

## Memory Is the Harness

Sarah Wooders (Letta/MemGPT): "Asking to plug memory into an agent harness is like asking to plug driving into a car." Memory isn't a plugin — it's core to what the harness does.

The harness makes invisible memory decisions no external plugin can control:
- How is CLAUDE.md / AGENTS.md loaded into context?
- How is skill metadata shown to the agent?
- Can the agent modify its own system instructions?
- What survives compaction, and what's lost?
- Are interactions stored and made queryable?
- How is memory metadata presented to the agent?
- How is the current working directory represented?

*Claude Code's multi-level memory hierarchy* (from leaked source code):
- Memory = index, not storage (MEMORY.md as pointers, ~150 chars/entry)
- 3-layer design: index (always loaded), topic files (on-demand), transcripts (grep only)
- Strict write discipline: write to file → then update index, never dump content into index
- Background memory rewriting (autoDream): merges, deduplicates, prunes, converts vague → absolute
- Memory is a hint, not truth — model must verify before acting
- What they don't store: no debugging logs, no code structure, no PR history ("if it's derivable, don't persist it")

*Letta's Context Constitution:* Agents learn by actively managing their own context — creating durable token-space representations of what they know. Letta Code uses a git-versioned memory filesystem with background memory subagents for sleep-time compute.

## Open vs. Closed Harnesses (Harrison Chase, LangChain)

*The ownership question:* If you use a closed harness (especially behind a proprietary API), you yield control of your agent's memory to a third party.

- *Mildly bad:* Stateful APIs (OpenAI Responses API, Anthropic server-side compaction) store state on their servers. Switching models means losing thread history.
- *Bad:* Closed harnesses like Claude Agent SDK manage memory in ways that are unknown and non-transferrable.
- *Worst:* When the whole harness including long-term memory is behind an API — you have zero ownership or visibility.

Model providers are incentivized to move memory behind APIs because it creates lock-in. Anthropic's Managed Agents is the clearest example: literally everything behind an API, locked to their platform. Codex generates encrypted compaction summaries not usable outside OpenAI's ecosystem.

Open alternatives: Deep Agents (LangChain), open-source harnesses using open standards (agents.md, agentskills.io).

## Thin Harness, Fat Skills (Garry Tan, YC)

The anti-pattern: a fat harness with thin skills. 40+ tool definitions eating half the context window, god-tools with 2-5 second MCP round-trips, REST API wrappers turning every endpoint into a separate tool.

*The principle:* Push intelligence *up* into skill files. Push execution *down* into deterministic tooling. Keep the harness *thin*.

*Five definitions:*

1. *Skill files* — reusable markdown that teaches the model *how* to do something (not what). Works like a method call: same procedure + different parameters = different capabilities. "Markdown is a more perfect encapsulation of capability than rigid source code, because it describes process, judgment, and context in the language the model already thinks in."

2. *The harness* — runs the model in a loop, reads/writes files, manages context, enforces safety. ~200 lines of code. That's it.

3. *Resolvers* — routing tables for context. When task type X appears, load document Y first. Skills have description fields; the model matches user intent to skill descriptions automatically.

4. *Latent vs. deterministic* — judgment and synthesis go in latent space (the model). Same-input-same-output tasks go deterministic (code, SQL, arithmetic). Confusing these is the most common mistake in agent design.

5. *Diarization* — the model reads everything about a subject and writes a structured profile. No RAG pipeline produces this. It requires reading, holding contradictions, noticing what changed, and synthesizing.

*When skills improve themselves:* Skills can have an /improve loop — read feedback, extract patterns, write updated rules back into the skill file. The skill rewrites itself. The system compounds.

## Resolvers in Depth (Garry Tan)

A follow-up to "Thin Harness, Fat Skills" that expands on definition #3 (resolvers) — the component that got the least attention but matters most.

**The problem:** Garry's CLAUDE.md grew to 20,000 lines. The model's attention degraded; responses got slower and less precise. Claude Code literally told him to cut it back. The fix: 200 lines. A numbered decision tree with pointers to documents. "You can't make someone smarter by shouting louder. You make them smarter by giving the right book at the right moment."

**The misfiling that revealed everything:** An AI-filed policy analysis went to `sources/` (raw data dumps) instead of `civic/` (political analysis). Root cause: the idea-ingest skill had hardcoded `brain/sources/` as default — it didn't consult the resolver. After auditing all 13 brain-writing skills, only 3 referenced the resolver. The other 10 had hardcoded paths.

**The fix:** A shared `_brain-filing-rules.md` document + mandate that every brain-writing skill reads `RESOLVER.md` before creating any page. One rule, ten skills fixed. Zero misfilings since.

**The invisible skill problem:** A skill that exists but isn't reachable is worse than a missing skill — it creates the illusion of capability. After a month of building, 40+ skills existed but 15% were "dark" (unreachable from the resolver). A signature-tracking system worked perfectly but nobody could invoke it because the resolver had no trigger for "check my signatures."

**Resolver trigger evals:** A test suite of 50 sample inputs with expected outputs. Two failure modes: false negatives (skill should fire but doesn't) and false positives (wrong skill fires). Both fixable by editing markdown, no code changes. "If you can't prove the right skill fires for the right input, you don't have a system. You have a collection of skills and a prayer."

**check-resolvable meta-skill:** Walks the entire chain (AGENTS.md → skill file → code) and finds dead links. First run found 6 unreachable skills out of 40+ (15%). Runs weekly as a linter for the resolver.

**Context rot:** Day 1 the resolver is perfect. Day 30, three new skills exist that nobody added. Day 60, trigger descriptions don't match user phrasing. Day 90, the resolver is a historical document. The endgame: a reinforcement learning loop where the system observes every task dispatch and periodically rewrites the resolver based on observed evidence. "A resolver that learns from its own traffic — that's the endgame for agent governance."

**Resolvers are fractal:** They compose at every layer:
- *Skill resolver* (AGENTS.md) — maps task types to skill files
- *Filing resolver* (RESOLVER.md) — maps content types to directories
- *Context resolver* (inside each skill) — sub-routing within the skill

**Resolvers as management:** Skills are employees. The resolver is the org chart. Filing rules are internal process. check-resolvable is audit and compliance. Trigger evals are performance reviews. "The problem isn't that models aren't smart enough. The problem is that we've been building organizations with no management layer."

**GBrain:** Open-sourced system shipping with the resolver pattern built in. `gbrain init` creates RESOLVER.md, the decision tree, and disambiguation rules. 25,000 files, 200 inputs/day, compounding. GStack (72K+ stars) is the coding layer; OpenClaw or Hermes Agent is the conductor.

## OpenAI's Harness Engineering Lessons (Ryan Lopopolo)

Team built a product with 1M+ lines of code and 0 manually-written lines over 5 months (3.5 PRs per engineer per day, using Codex).

Key lessons:

- *Give agents a map, not a 1,000-page manual.* One-big-AGENTS.md fails: crowds out task/code, creates non-guidance ("everything important" = nothing important), rots instantly, can't be mechanically verified. Solution: short AGENTS.md (~100 lines) as table of contents, with structured `docs/` directory as system of record. Progressive disclosure from a stable entry point.

- *Agent legibility first.* Repository optimized for Codex's legibility, not human aesthetics. "From the agent's point of view, anything it can't access in-context while running effectively doesn't exist." Knowledge in Google Docs or Slack = invisible.

- *Enforce invariants, not implementations.* Strict architectural constraints (layer dependencies enforced via custom linters), but freedom within those boundaries. Constraints are multipliers: "once encoded, they apply everywhere at once."

- *Garbage collection for AI slop.* Full agent autonomy introduces entropy — agents replicate patterns that already exist, even bad ones. Solution: encode "golden principles," run background cleanup agents on a regular cadence. "Technical debt is like a high-interest loan — better to pay continuously in small increments."

- *Throughput changes merge philosophy.* In high-throughput agent systems, corrections are cheap, waiting is expensive. Most review can be agent-to-agent.

## Seven Harness Design Decisions

1. *Single vs. multi-agent* — maximize a single agent first. Split only when tool overload exceeds ~10 overlapping tools or clearly separate domains. Multi-agent adds routing overhead and context loss during handoffs.

2. *ReAct vs. plan-and-execute* — ReAct is flexible but higher per-step cost. Plan-and-execute separates planning from execution. LLMCompiler reports 3.6x speedup over sequential ReAct.

3. *Context window strategy* — five approaches: time-based clearing, summarization, observation masking, structured note-taking, sub-agent delegation. ACON research: 26-54% token reduction while preserving 95%+ accuracy by prioritizing reasoning traces over raw tool outputs.

4. *Verification loop design* — computational (tests, linters) provides deterministic ground truth. Inferential (LLM-as-judge) catches semantic issues but adds latency.

5. *Permission architecture* — permissive (fast but risky) vs. restrictive (safe but slow). Depends on deployment context.

6. *Tool scoping* — more tools often means worse performance. Vercel removed 80% of tools from v0 and got better results. Claude Code achieves 95% context reduction via lazy loading.

7. *Harness thickness* — Anthropic bets on thin harnesses + model improvement. Graph-based frameworks bet on explicit control. "Anthropic regularly deletes planning steps from Claude Code's harness as new model versions internalize that capability."

## Agent Experience (AX): Harnesses for Agents, Not Humans

By April 2026, machine identities outnumber human users 45:1 in the average enterprise (some organizations up to 100:1). 80% of Neon databases created by AI agents. GitHub sees 5%+ of commits completely authored by Claude Code.

Agents operate through APIs, scripts, and structured commands — bypassing GUIs entirely. The new software stack:

1. *Skill files* — encode practitioner expertise in machine-readable markdown (Figma Skills example: design system conventions, token structure agents would otherwise get wrong)
2. *CLI tools and MCP servers* — the new interface layer. A CLI that accepts structured input and produces structured output is composable in ways a GUI never can be.
3. *Vertical models* — see [Vertical AI](../landscape/vertical-ai.md) for the tradeoffs

Linear's error: built an embedded agent (GUI-first), but customers wanted MCP support so external agents could connect to Linear's data. Basecamp's success: full CLI + revamped API with structured JSON output.

## Claude Code Hooks in Practice

Claude Code exposes hooks that fire at specific lifecycle points — `session_start`, `pre_tool_use`, `post_tool_use`, `stop`. These are a concrete implementation of the harness-as-context-manager concept.

The `session_start` hook is particularly powerful for personal operating systems: it fires when a new Claude Code session opens and can inject structured context (weekly priorities, active projects, past learnings, constraints) before the user types a word. This makes the system compound over time — every session builds on everything from previous sessions, rather than starting from an empty context window.

*Practical demonstration* (Dave Khaled, "Dex" personal OS, Apr 2026): Session start hook loads weekly goals, quarterly priorities, account health data, and a list of mistakes made in previous sessions. The CLAUDE.md file for this system deliberately stays short and acts as a map (progressive disclosure) — but the hook ensures the key context always lands, regardless of the CLAUDE.md content.

Key insight: CLAUDE.md is good guidance but *not always adhered to*. Session start hooks are adhered to every single time because they fire programmatically. For time-sensitive context (current priorities, recent learnings), hooks are more reliable than CLAUDE.md alone.

Operational tip: version-control your CLAUDE.md via git. In high-iteration systems, CLAUDE.md regressions are common — you'll want the ability to revert to a previous version that worked.

## Real-World SMB Harness: "Peggy" (Charles Miller, Cooper Demolition)

Charles Miller, a construction business owner running Cooper Demolition (site preparation specialty subcontractor), built a multi-agent architecture he calls "Peggy" — proving that agent harnesses aren't just for tech companies. His framing: if a demolition contractor can use this, so can any SMB owner.

**Hardware & Stack:** Mac Mini ($600) running 24/7, accessed remotely via Tailscale. Claude Max ($100/mo), MS 365 (Outlook), Airtable (shared memory via API). Deliberately uses existing subscriptions to minimize implementation effort. More elegant stacks exist, but this gets SMBs off the ground with minimal risk.

**Shared persona architecture:** All agents operate under one identity ("Peggy Olson, Executive Assistant") sharing the same rulebook, CRM, memory file, and to-do list. This makes the system feel coherent rather than a pile of disconnected automations. Peggy has her own company email — employees interact by emailing her like any other teammate.

**Four specialized agents:**
1. *Finance Agent* — Weekly WIP reports, 13-week cash flow model, AR aging/reconciliation on fixed schedules. Lands in the right inboxes before the workweek starts.
2. *Operations Agent* — Scans email every 30 minutes, triages, maintains to-do list, sends morning briefing. Handles compliance tracking, project submittals, change orders, budget tracking. Directly interacts with project managers.
3. *Sales Agent* — CRM updates with auto-captured contacts, pipeline monitoring, deal status tracking.
4. *Personal EA* — Travel documents, loyalty programs, important dates, relationship context in CRM.

**Why segregated agents:** Parallel task performance and risk mitigation. Each agent only accesses its specialty area files — sandboxing is "a major reason for widespread Claude adoption when compared to options like OpenClaw."

**Interaction model:** Primarily through Claude Dispatch — single chat session on phone/laptop with full visibility into everything Peggy does. Also accepts emails from any employee. Background tasks via Claude Cowork scheduled tasks (not Claude Code) — chosen for the approachable UI, with expectation that capabilities will converge.

**Key insight for harness design:** The shared persona + shared memory + sandboxed tool access pattern makes multi-agent systems feel like one coherent assistant to non-technical users. This is a distribution strategy for agent adoption in AI-resistant industries.

## Enterprise Context Synthesis (Hyperspell)

Conor Brennan-Burke (Hyperspell, Apr 2026) argues the industry framed the enterprise AI problem wrong — it's about **understanding**, not retrieval. Current agent integrations (MCP servers, API connectors) give agents *access* to company data but not *understanding* of it.

**Access vs. understanding:** A new employee with access to Google Drive, Slack, and CRM has access. After six months absorbing context, attending meetings, learning which sources matter — they have understanding. That transition is the entire game.

**Five synthesis problems retrieval ignores:**
1. *Data contradiction* — Slack says deadline is Friday, Linear says Wednesday, PM said "end of month." Retrieval returns whichever it finds first; synthesis resolves the conflict.
2. *Entity resolution* — "sarah.chen@acme.com" in email, "@sarah" in Slack, "Sarah from Acme" in a transcript are five unrelated strings to retrieval but one person to synthesis.
3. *Information decay* — A six-month-old strategy doc treated with same confidence as a 10-minute-old message. Synthesis tracks when information was last confirmed.
4. *Source hierarchy* — CEO's email vs. random Slack thread, signed contract vs. CRM field. Synthesis maintains authority ranking.
5. *Cross-source inference* — "The migration is at risk" exists nowhere as a document — it only emerges from combining project tracker, calendar, hiring pipeline, and standup notes.

**Delivery via filesystem:** A context graph surfaced as files any agent can read without custom integration. Claude Code reads project directories, Cursor reads codebases, OpenClaw reads local filesystem. The filesystem is the one interface every agent already supports. The context layer is decoupled from any specific agent or vendor.

**Compounding moat:** Day 1, the context graph knows a little. Day 30, it has absorbed thousands of signals, resolved conflicts, built identity maps. Every new data point doesn't just add one fact — it might confirm a status, update a relationship, reveal a priority shift, and resolve a conflict between older sources. "The company that starts building today will have six months of compounded understanding that no amount of money can buy later."

**The missing benchmark:** No benchmark asks whether a system can synthesize fragmented, contradictory, multi-source company data into accurate answers. Kingsbury-style applied skepticism (see Testing section below) applied to the *system*, not the model.

## Testing Pyramid for Agent Systems (Garry Tan)

Garry Tan's response to Kyle Kingsbury's "The Future of Everything is Lies" essay (Apr 2026) reframes model unreliability as an engineering problem, not a verdict. Kingsbury — the Jepsen author who spent a decade proving distributed databases didn't work as advertised — catalogues real LLM failures but tests models in isolation, "testing the engine on a bench and concluding that cars are unsafe."

**The core argument:** A naked model produces *plausible* text. A harnessed system produces *verified* text. The skill file says "check your work against source data." The deterministic code says "compare output to ground truth." The gap between plausible and verified is exactly what harness engineering fills.

**Jepsen methodology applied to the right layer:** Don't test whether the model hallucinates — of course it does. Test whether the *system* hallucinates:
- Does the harness prevent hallucinated data from reaching the user?
- Does the skill file route to deterministic code where precision matters?
- Does the resolver fire for the right inputs?

**The testing pyramid for agent systems:**
1. *Unit tests* — for deterministic code
2. *Integration tests* — for pipeline correctness
3. *Resolver trigger evals* — for routing accuracy
4. *LLM-as-judge evals* — for output quality
5. *End-to-end tests* — for the full pipeline

**Why open harnesses matter:** Closed-source agents prevent users from writing the skill that verifies output. Real verification requires: "here is my schema, here are my invariants, here is what correct looks like in my domain — now verify against that." This requires open harnesses where the user controls the verification layer. As Pete Koomen (YC) puts it: "The user must write their prompt, otherwise we'll be slaves to a system prompt we can't see."

**The aspirin analogy:** "We don't know why transformer models have been so successful" — also true of aspirin (mechanism understood only in the 1970s), general anesthesia (still incompletely understood), and bicycle stability (definitively explained only in 2011). Practical utility doesn't require theoretical completeness.

## Three Dimensions of the Harness (Akshay Pachaar)

Akshay's follow-up framing (Apr 2026): the model itself should be deliberately thin, with intelligence pushed outward and composed at runtime through three dimensions:

1. **Memory** — holds state the model shouldn't carry in weights or context. Working context, semantic knowledge, episodic experience, and personalized memory each have their own lifecycle.
2. **Skills** — holds procedural knowledge. Operational procedures, decision heuristics, and normative constraints specialize the general model per task.
3. **Protocols** — holds interaction contracts. Agent-to-user, agent-to-agent, and agent-to-tools are three distinct surfaces with their own failure modes.

Between the core and these modules sit **mediators**: sandboxing, observability, compression, evaluation, approval loops, and sub-agent orchestration. They govern how the harness reaches out and how state flows back in.

**The useful question this framing unlocks:** For any new capability, where should it live? Stable knowledge → memory. Learned playbooks → skills. Communication contracts → protocols. Loop governance → mediators.

## Framework Implementation Comparison

How major frameworks implement the harness pattern (synthesized from Akshay's deep dive):

- **Claude Agent SDK** — Single `query()` function creating an agentic loop, returning async iterator. "Dumb loop" runtime — all intelligence in the model. Gather-Act-Verify cycle.
- **OpenAI Agents SDK** — Runner class with async/sync/streamed modes. Code-first: workflow logic in native Python. Codex extends with three-layer architecture: Core (agent code + runtime), App Server (bidirectional JSON-RPC), client surfaces. All surfaces share the same harness — "Codex models feel better on Codex surfaces than a generic chat window."
- **LangGraph** — Explicit state graph: two nodes (llm_call, tool_node) connected by conditional edge. Evolved from LangChain's AgentExecutor (deprecated in v0.2 for lack of extensibility). Deep Agents layer adds planning, file systems, subagent spawning, persistent memory.
- **CrewAI** — Role-based multi-agent: Agent (harness around LLM, defined by role/goal/backstory/tools), Task (unit of work), Crew (collection). Flows layer adds "deterministic backbone with intelligence where it matters."
- **AutoGen** (→ Microsoft Agent Framework) — Conversation-driven orchestration. Three-layer architecture (Core, AgentChat, Extensions). Five orchestration patterns: sequential, concurrent, group chat, handoff, and magentic (manager agent with dynamic task ledger).

## Harness Coevolution with Models

Models are now post-trained with specific harnesses in the loop. Claude Code's model learned to use the specific harness it was trained with. Changing tool implementations can degrade performance.

The "future-proofing test": if performance scales up with more powerful models without adding harness complexity, the design is sound. Manus was rebuilt 5 times in 6 months, each rewrite removing complexity.

See also: [Agentic Engineering](agentic-engineering.md), [Claude Code Skill Frameworks](claude-code-skill-frameworks.md)

## Sources

- "The Anatomy of an Agent Harness" — Akshay Pachaar (tweet thread, Apr 2026) ([link](https://x.com/akshay_pachaar))
- "What's an Agent Harness? And how do I choose the best one?" — Matt Abrams (tweet thread, Apr 2026) ([link](https://x.com/mattabrams))
- "Your harness, your memory" — Harrison Chase, LangChain (tweet thread, Apr 2026) ([link](https://x.com/hwchase17))
- "Why memory isn't a plugin (it's the harness)" — Sarah Wooders, Letta (tweet, Apr 2026) ([link](https://x.com/sarahwooders/status/2040121230473457921))
- "Thin Harness, Fat Skills" — Garry Tan, YC (tweet thread, Apr 2026) ([link](https://x.com/garrytan))
- "Harness engineering: leveraging Codex in an agent-first world" — Ryan Lopopolo, OpenAI (Feb 2026) ([link](https://openai.com/news/engineering/))
- "Harness, Memory, Context Fragments, & the Bitter Lesson" — Viv (tweet, Apr 2026) ([link](https://x.com))
- "The New Software: CLI, Skills & Vertical Models" — Sandhya (tweet thread, Apr 2026) ([link](https://x.com))
- "Automate Your Entire Work Life With Claude Code — No Coding Needed" — Aakash Gupta / Dave Khaled (video, Apr 2026) ([link](https://www.youtube.com/watch?v=...))
- "Claude for Dummies (SMB Owners)" — Charles Miller (tweet thread, Apr 2026) ([link](https://x.com/charlesmiller))
- "Resolvers: The Routing Table for Intelligence" — Garry Tan, YC (tweet thread, Apr 2026) ([link](https://x.com/garrytan))
- "Your company needs a brain, not more connectors" — Conor Brennan-Burke, Hyperspell (tweet, Apr 2026) ([link](https://x.com))
- "A harnessed LLM agent" — Akshay Pachaar (tweet thread, Apr 2026) ([link](https://x.com/akshay_pachaar)) — expanded deep dive with framework comparison
- "Imagine if naked people were stupider" — Garry Tan, YC (tweet thread, Apr 2026) ([link](https://x.com/garrytan)) — response to Kyle Kingsbury's "The Future of Everything is Lies"; testing pyramid for agent systems
