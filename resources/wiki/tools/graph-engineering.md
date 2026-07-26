---
created_at: 2026-07-26
last_updated: 2026-07-26
---

# Graph Engineering

> TLDR: Graph engineering organizes AI work as nodes (bounded tasks) and edges (real data dependencies), enabling parallel execution wherever tasks are independent. The core skill is the "fake-edge test" — identifying sequential steps that don't actually depend on each other — and the core pattern is the diamond (fan-out, reduce, synthesize). It buys breadth and speed, not better judgment; a graph is only as honest as its anchors — outputs verified against reality, not against other model outputs.

## Recent Updates

- **2026-07-26:** Added [The Human Gate](#the-human-gate) (approval placement principle, Klarna case) and [Applied Diamond Builds](#applied-diamond-builds) (research desk, SEO machine, GTM kit) from Machina's graph engineering course
- **2026-07-26:** Added engineering stack layering, napkin/collapse node tests, idempotency for replay, Cognition's read-many/write-one pattern, and Anthropic cost multipliers to [From Loops to Graphs](#from-loops-to-graphs), [Failure Modes](#failure-modes), [Verification](#verification-in-graphs), and [Cost Reality](#cost-reality)
- **2026-07-26:** Added node/edge contracts, [Conditional Routing](#conditional-routing), [Controlled Cycles](#controlled-cycles), [Pipeline vs Parallel](#pipeline-vs-parallel), and [Self-Routing](#self-routing-dynamic-workflows) from Codez's 14-step roadmap
- **2026-07-26:** Added Anthropic's build methodology (judge-first, rulebook, state on disk, independent reviewers) to [Building the Graph](#building-the-graph) and the meta-principle to [Fix the Process Not the Code](#fix-the-process-not-the-code)
- **2026-07-26:** Created page with Kopadze's graph engineering explainer covering [The Diamond Pattern](#the-diamond-pattern), [Fake-Edge Test](#the-fake-edge-test), [Verification](#verification-in-graphs), [Failure Modes](#failure-modes), [When Not to Use](#when-not-to-use-a-graph), and [Anchors](#anchors)

## From Loops to Graphs

Graph engineering emerged as a natural evolution from [loop engineering](loop-engineering.md). A loop is one agent improving one thing on repeat — try, check, adjust, repeat. A graph is a network of loops where cycles watch and correct each other instead of a single agent chasing a single metric.

Engineers quickly pointed out that this is a decades-old computer science concept (DAGs, dataflow programming) wearing a new name. LangGraph shipped this exact model — nodes and edges over shared state — in January 2024; Microsoft's AutoGen has GraphFlow; Google built ADK 2.0's workflow runtime on the same idea. The name is new, the practice isn't. That's the good news — a pattern that has run critical systems for thirty years is exactly what you want to trust with production work.

Each layer in the AI engineering stack wraps the one before it: **prompt engineering** (the words you send) → **[context engineering](../concepts/llm-knowledge-bases.md)** (everything the model sees) → **[harness engineering](agent-harness.md)** (the code around the model) → **[loop engineering](loop-engineering.md)** (the autonomous cycle driving one agent toward a goal) → **graph engineering** (the coordination layer across many loops). Skip a lower layer and the graph just fails in a more elaborate way. A single agent loop is just a one-node graph with an edge pointing back to itself — graphs don't replace loops, they connect and govern them.

The vocabulary is minimal: a **node** is one bounded task with a defined input and output. An **edge** is a real data dependency — one node needs what another produced, so it waits. If no data passes along the arrow, the edge is fake and the wait is wasted.

A node earns its place only if it represents a real specialty — a different model, a different toolset, or a genuinely separate role like a read-only reviewer. Steps you could inline into an existing loop are not nodes. Two filters: if you can't draw the graph on a napkin, it's too complex; if collapsing two nodes into one loses nothing, they were never two nodes. The most common failure mode is turning "summarize this PDF" into a five-node graph with a fetcher, a chunker, a summarizer, a reviewer, and a formatter.

Both sides carry **contracts**. A node contract means bounded input, bounded output, exactly one job — enforced with a schema so the next node can consume structured data without guessing. An edge contract names the data shape that crosses it, not just the order. Name the edge by its data and two things get easier: you can see instantly whether the edge is real, and you can swap the node on either end without breaking the graph, as long as the shape holds. A quiet win of this framing: a huge amount of what people burn model tokens on is really an edge operation (flatten, dedupe, filter) — and edges are code, not conversation. They cost zero tokens.

State hygiene scales with the graph. Give the shared state a typed schema. Decide explicitly which nodes may write to which fields. Checkpoint state between nodes so you can replay a run and see exactly where it went bad — but beware: nodes after a checkpoint execute again, so any node with external side effects (sending an email, creating a record) must be idempotent.

## Fix the Process, Not the Code

Anthropic states the governing principle in a single line: **you do not fix the code, you fix the process that produced the code.** When a reviewer catches the same mistake in the third file, the wrong move is to fix three files. The right move is to add one sentence to the rules and regenerate the batch. Individual failures are the [loop's](loop-engineering.md) job. Your attention belongs on the patterns.

The moment you hand-patch agent output, you are working inside the agent's job instead of building the thing that does it. Every mechanism in the build methodology below — judges, rulebooks, independent reviewers — exists to make this principle operational.

## The Fake-Edge Test

The single most useful technique in graph engineering: walk your current workflow step by step and at each step ask — *does this step actually need the result of the one before it?*

If yes, the edge is real. If no, the two tasks can run simultaneously. Most workflows have two or three fake edges — sequential steps that only run in order because that's the order they were typed, not because of any data dependency.

A linear workflow with 40 steps has 40 points of sequential failure and the latency of all 40 summed. The same 40 tasks drawn as a graph execute at the speed of the slowest layer, not the sum of everything. The model was never the bottleneck — the line you drew was.

## The Diamond Pattern

The dominant graph shape in production agent systems: **fan-out, reduce, synthesize.**

1. **Fan out** — split work across parallel workers (one per angle, file, or subtask)
2. **Reduce** — compress results with plain code (not another LLM call)
3. **Synthesize** — a final agent writes the unified answer

Claude's research feature runs exactly this: a lead plans angles, workers gather in parallel, findings get checked, and one report reaches the user. The coordination is code, not conversation — passing results between agents costs zero extra context.

Two implementation details make fan-out robust. First, the parallel barrier waits for every worker before returning, so the next stage sees the complete set. Second, a worker that throws resolves to null instead of rejecting the whole batch — one flaky agent can't sink the run. Always filter out nulls before the merge step. The barrier rule: **use a barrier only when a stage genuinely needs every prior result together** — deduping across sources needs a barrier, but flattening a list is just an edge. If you wrote fan-out → transform → fan-out and that middle transform has no cross-item dependency, you should have used a pipeline and skipped the barrier entirely.

Cost-conscious design: use cheap models on boring nodes and the strong model only where judgment matters. The skeleton (fan-out → reduce → verify → synthesize) is the same whether the job is a market scan, code review, or research report.

The same fan-out → check → synthesize shape underlies Anthropic's [Planner/Generator/Evaluator harness](loop-engineering.md#the-planner-generator-evaluator-harness) — read it as a minimal diamond with a single generator node and one adversarial evaluator sitting on the checking edge.

## Applied Diamond Builds

Three concrete business applications of the diamond pattern, each following the same skeleton: fan-out parallel researchers → verify/skeptic pass → synthesize into one deliverable → human gate before anything ships.

**Deep research desk.** A business question (pricing, market entry, offer comparison) fans out to five researchers working distinct angles in parallel. Each finding requires a source link and date. A skeptic node attacks every finding, trying to disprove it — only survivors reach the final report, ranked by confidence. The skeptic pass is the difference between research and rumor collection.

**SEO content machine.** Three parallel researchers cover what top-ranking pages include, what real questions people ask, and what everyone misses. Their outputs merge into an outline, a writer drafts from the outline, and a fact-checker flags every claim without a source. The draft lands in a folder with flagged claims listed at the top — nothing publishes without human review.

**Go-to-market kit.** Three researchers profile the buyer (in their own words), map their channels, and collect competitor positioning — all in parallel. Their work merges into a one-page positioning document, and the graph pauses for human approval of that positioning before proceeding. Then three writers draft landing copy, launch posts, and outreach messages in parallel from the approved positioning. A checker flags anything that drifts from the positioning doc. Every piece waits for individual approval.

The pattern across all three: the graph's value comes from breadth (five angles, three research tracks), not from deeper single-thread reasoning. Each uses verification as a filter, not a rubber stamp. And the human gate sits exactly where a mistake would be expensive — before publish, before send, before launch.

## Verification in Graphs

The part most implementations skip — and what separates a real graph from an expensive toy.

Models miss most of their own mistakes. A model grading its own work is too easy on itself. The rule: **never let the agent that did the work check the work.** Place a separate verifier node on the edge. Its only job is to try to kill the finding before it moves on.

Critical requirement: the verifier needs a **clean context**. Give it the same conversation the worker had and it's not checking anything — it's nodding along to itself in a different font. A graph of agents sharing one context is just a single [loop](loop-engineering.md) in a costume.

Cognition landed in the same place after a year of running Devin: several agents may read and weigh in, but only one agent is ever allowed to change anything. Reading is safe to parallelize because a bad opinion costs nothing until someone acts on it. Writing is where damage happens, so you keep it in one place where you can see it.

Split verification three ways — is it correct? Is it current? Is the source real? Three different lenses catch what ten identical ones miss. Three named patterns: **adversarial verify** (spawn N independent skeptics prompted to refute each finding; keep only what a majority survives), **perspective-diverse verify** (give each verifier a distinct lens — correctness, security, reproducibility — because diversity catches failure modes that N identical checks never will), and **judge panel** (generate N attempts from different angles, score with parallel judges, synthesize from the winner while grafting the best of the runners-up).

## The Human Gate

You are the most important node in your own graph. The design question is not whether to include human approval, but where to place it.

The rule: **put your approval where a mistake would be expensive to undo, not on every step.** A gate on everything makes you the bottleneck and defeats the graph's purpose of running wide without you. A gate on nothing means nobody is watching when the send, the publish, the refund, or the invoice fires. The irreversible actions — anything that touches a customer, spends money, or ships publicly — are the edges that should end at you.

Even Klarna learned this in public: they went all-in on AI customer support, admitted the cost cutting went too far, and brought human service back as the premium tier. The approval isn't overhead — it's the last yes between a drafted pipeline and the world.

Four safety rules keep graphs from becoming expensive accidents: every loop gets a maximum number of rounds, only one job writes to any one file, the routing lives in written steps while the AI fills the jobs, and there is always a cap on how many agents can spawn. Skip the last yes and the graph ships its first confident mistake straight to a customer.

## Building the Graph

A concrete methodology drawn from Anthropic's large-scale migrations. Everything lives in one folder; each step adds one file.

### 1. Build the judge first

An agent without an exit condition never finishes — it stops when it *feels* done, which is a mood, not a condition. Before writing a single instruction about the work itself, decide how a machine tells you the work is correct. For code, this wraps the test runner. For documents, it checks required sections and forbidden patterns. For data, it validates schema and row counts. When a check is too fuzzy for a script, the judge calls a model with the source material and a yes/no question and parses the answer.

You have a judge when you can answer this without opening the output: *what command tells me this passed?*

### 2. Validate the judge in both directions

A judge that never fails is decoration. Run it against a known-good input (should pass) and a deliberately broken copy (should fail). If the broken copy passes, every green result after this point is meaningless. Do this before generating anything at scale.

### 3. Write the rulebook — and grow it, never patch around it

A `rulebook.md` is what every worker reads before touching anything. Build it by talking through ambiguities with the model — every time you think "well, in that case it should probably…" that's a rule. Two properties make it work: it grows (every reviewer catch that the rules didn't cover becomes a new sentence), and nothing bypasses it (the moment you hand-edit output to match what the rulebook should have said, you have two sources of truth and one of them is in your head).

Jarred Sumner worked through each area of ambiguity with Claude, then ran eight subagents whose only job was reviewing for eight specific failure categories he expected from experience.

### 4. Stress-test on three items, then delete the work

Run three items two different ways — with and without the rulebook. Diff them. Every difference is a place where the rules are wrong, missing, or worse than the model's default. Fix the rulebook, not the files. Then delete everything produced. The goal was never the three files — it was the rules. Keeping pilot output is how the first three items follow one convention and everything else follows another.

### 5. State on disk, not in the context window

The change that makes long runs survivable. A queue script rebuilds the work queue from the filesystem every run — checking which output files exist to determine what's done. Nothing about progress lives in a conversation. The consequence: the process is resumable by construction. Kill it at 60%, restart, and it picks up at 60% because the disk remembers.

### 6. Two independent reviewers with clean context

One reviewer in the same context as the worker will agree with the worker — it has seen the reasoning and is primed to accept it. Run two fresh sessions per item, each seeing only the output and the rulebook, nothing else. No worker reasoning, no chat history.

Force a rule citation on every finding. A citation turns a vague complaint into a queue item. A rule cited three times across different files is not three problems — it's one badly written rule. Disagreement between the two reviewers usually means the rulebook is ambiguous at that spot. That's an edit, not a coin flip.

### 7. Place checks by cost

Anything a script can verify should never be verified by a model — faster, cheaper, no opinions. Then place each check based on how long it takes. **Fast checks go inside the loop:** Mike Krieger ran the TypeScript compiler on every unit because it returns in seconds. **Slow checks go outside, in batches:** Jarred Sumner banned the Rust compiler from the loop because `cargo` takes minutes — he ran it once across the workspace, then dispatched fixer agents against the error list in parallel.

Same problem, opposite decisions, both correct. The rule is not "check often" — it's match check frequency to check cost. Categorize errors (`uniq -c | sort -rn`) to see patterns rather than instances — Jarred hit thousands of Rust module errors from cyclic imports Zig had tolerated, fixed with one classification rule added to the loop.

### 8. Serialize the expensive operation

If one operation dominates cost or time, don't let every agent trigger it. Agents write requests to a directory; a single daemon owns the operation, batches requests, runs once, and feeds results back. Anthropic's version is a build daemon — the only process allowed to rebuild the binary. Ten agents each triggering a full rebuild means paying ten times for work that batches into one.

### Model selection by role

Don't run the largest model everywhere. Use cheap, fast models for workers doing the main transformation. Save the strong model for reviewers and anything that writes rules other agents will follow — a bad rule propagates into every downstream output, which is exactly where capability is worth paying for. Mike Krieger fanned out twelve subagents on Sonnet for the main migration, reserving the larger model for review.

## Failure Modes

### Context collapse

Fan out a thousand nodes, then feed all outputs into one final step — you blow past the context window before synthesis starts. Fix: layer your fan-in. Batch results, summarize each batch, then combine summaries, never the raw pile.

### False independence

Two nodes look independent because their prompts never mention each other, but they both write to the same file or hit the same rate-limited API. That's a hidden edge. When Bun's team first fanned a big job across many agents, they shared one workspace and overwrote each other. Fix: give every worker its own isolated space — in practice, each agent runs in its own git worktree, does its work in a sandbox, and merges cleanly. Reach for worktree isolation only when nodes actually write in parallel; it's the seatbelt for the one topology that needs it, not a default tax on every run.

### Silent node failure

In a chain, one failure stops everything — annoying but obvious. In a graph, one dead node among two hundred can slip into a report that looks complete. Fix: every merge step counts its inputs against the number expected and flags the gap instead of quietly running on half the data.

## Conditional Routing

Not every graph is fixed at design time. A **router node** inspects a result and decides which downstream path fires — classify the ticket, then branch to the right handler; check the diff size, then either do a quick review or spin up a full audit. Determinism becomes a feature here: the router's *decision* can be Claude-powered (a subagent classifies), but the *routing* is code the model wrote — so it runs the same way every time for the same classification. You get model judgment at the node and script reliability at the edge. No emergent "Claude decided to skip the audit" surprises, because the skip would have to be written into the graph.

## Controlled Cycles

Sometimes you don't know how big the job is until you're in it — unknown-size discovery, a bug sweep where finding one bug reveals three more. That needs a **cycle**: a controlled edge back to an earlier node. The danger is obvious — a cycle that doesn't converge is an infinite loop that spawns agents until your budget is gone.

The pattern that converges is **loop-until-dry:** keep spawning finders until K consecutive rounds surface nothing new, then stop. The critical detail: dedupe against everything *seen*, not just against confirmed results. Otherwise rejected findings reappear every round, the loop never runs dry, and you've built a machine that pays to rediscover the same dead ends forever.

## Pipeline vs Parallel

The choice that trips everyone up. A `parallel()` barrier makes everything wait for the slowest node before the next stage starts. A `pipeline()` streams each item through all stages independently — item A can be in stage 3 while item B is still in stage 1. Fast items finish early instead of idling behind slow ones.

**Default to pipeline.** Reach for a barrier only when a stage truly needs every prior result at once — a cross-set dedupe, an early-exit on the total, a prompt that compares against "the other findings." "It's cleaner code" and "the stages feel separate" are not reasons; barrier latency is real, measurable, wasted time. The shape of the graph isn't cosmetic — topology is the single biggest lever on wall-clock time.

## Self-Routing (Dynamic Workflows)

The final move: stop drawing the graph by hand for jobs you can't plan in advance. With dynamic workflows, you describe the objective and the model writes the orchestration script itself — decomposing the task, choosing the fan-out, spawning a coordinated fleet of subagents, and synthesizing the result. You get a graph tailored to *this* run instead of a fixed one you hoped would fit.

When a run is good, save its script — version-controlled, re-runnable by name, a graph anyone who clones the repo can launch. This is where graph engineering meets [loop engineering](loop-engineering.md): the first run is exploratory (a loop), the saved workflow is the graph you reuse.

## When Not to Use a Graph

A graph buys breadth, not better judgment. Skip it when:

- **The task is small or isolated.** Adding one function, fixing one bug — coordination is pure overhead.
- **You want to approve every step.** A graph's point is running wide without you; a tight leash defeats the purpose.
- **You don't know what you're looking for.** Exploratory work wants one steerable agent, not a fleet locked into a plan.
- **Steps genuinely depend on each other.** Forcing a graph onto truly sequential work adds cost for zero speedup.

The tell: if you can't find two jobs with no edge between them, there's no graph to build. It's a loop, and a loop is fine.

**The middle path:** run a [loop](loop-engineering.md) first to learn the shape of the work, keeping notes on every correction you make. Those notes become your first rulebook. Then build the graph for the second run. The graph earns its setup cost when the same shape of work repeats hundreds of times and a machine can tell right from wrong.

## Anchors

The deepest trap: build a full graph with paired checkers, audit nodes, and meta-nodes, and every node reads a report that came from the same system. Everything is consistent. Nothing is verified against reality.

Topology alone does not buy truth. A graph needs **anchors** — nodes whose outputs cannot be argued with: tests that actually ran (not "should pass" — *did* pass), revenue that landed in the bank, customers who actually stayed. Some constraints must be frozen — kept off-limits precisely because they're the ones an optimizer would weaken to win.

Judge a graph on numbers that can't argue back and it stays grounded. Let it grade its own reports and it will be confidently wrong.

## Cost Reality

A graph costs more than a single-agent chat — substantially more. Anthropic's published numbers: a single agent burns roughly 4× the tokens of a chat interaction; multi-agent systems burn roughly 15×. Every node you add multiplies that. The coordination gets cheaper, but the fleet still burns tokens. The clearest public examples: Jarred Sumner ported Bun from Zig to Rust — a million lines of code in under two weeks with the entire existing test suite passing in CI before the merge landed, burning 5.9 billion uncached input tokens and 690 million output tokens (~$165,000 at API pricing) [[source]](https://x.com/anatolikopadze/status/2080668775796314331/?rw_tt_thread=True). Mike Krieger took a Python codebase to 165,000 lines of TypeScript over a weekend using hundreds of agents, eight phase gates, three adversarial review rounds, and a final check that diffed every command's output against the Python original.

The ceiling is real when the task genuinely parallelizes — Anthropic's multi-agent research system outperformed a single Opus agent by 90.2% on their internal research eval, because research fans out into independent searches naturally. But their standing advice from *Building Effective Agents* hasn't changed: find the simplest solution possible, and only add complexity when the task demands it.

This is not a free technique. It is a technique that makes a multi-year project into a multi-week one. Start small, watch what a run costs, and go wider only once one has earned it.

## Sources

- [Graph Engineering explained: what it is, when to use it and when not to](https://x.com/anatolikopadze/status/2080668775796314331/?rw_tt_thread=True) — Foundational explainer covering graph vocabulary, fake-edge test, diamond pattern, verification architecture, failure modes, when-not-to-use criteria, anchors, and cost reality
- [Graph Engineering: an Agent That Reviews Its Own Work. The Anthropic Method (Full Guide)](https://x.com/undefinedki/status/2080992300893675775/?rw_tt_thread=True) — Concrete 8-step build methodology (judge-first, rulebook, state on disk, independent reviewers, cost-based check placement, serialized expensive ops, model selection by role); "fix the process not the code" meta-principle; Bun and Krieger migration details
- [Graph Engineering with Claude: 14-Step roadmap from 0 to graph architect](https://x.com/0xcodez/status/2079165300625330317/?rw_tt_thread=True) — Node/edge contracts, barrier mechanics, conditional routing, controlled cycles (loop-until-dry), pipeline vs parallel topology choice, self-routing dynamic workflows, worktree isolation for parallel writes
- [Graph Engineering Clearly Explained](https://x.com/akshay_pachaar/status/2081089131808243999/?rw_tt_thread=True) — Engineering stack layering (prompt → context → harness → loop → graph), napkin/collapse node tests, state checkpointing and idempotency, Cognition's read-many/write-one pattern, Anthropic cost multipliers (4× single-agent, 15× multi-agent), 90.2% multi-agent research improvement
- How to master graph engineering (Full Course) by Machina — Human gate principle (approval placement where mistakes are expensive to undo, Klarna case), four safety rules, three applied diamond builds (deep research desk, SEO content machine, go-to-market kit) with concrete prompts
