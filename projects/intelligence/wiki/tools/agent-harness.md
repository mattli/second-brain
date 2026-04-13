---
created_at: 2026-04-13
last_updated: 2026-04-13
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
