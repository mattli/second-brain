---
created_at: 2026-07-26
last_updated: 2026-07-26
---

# Graph Engineering

> TLDR: Graph engineering organizes AI work as nodes (bounded tasks) and edges (real data dependencies), enabling parallel execution wherever tasks are independent. The core skill is the "fake-edge test" — identifying sequential steps that don't actually depend on each other — and the core pattern is the diamond (fan-out, reduce, synthesize). It buys breadth and speed, not better judgment; a graph is only as honest as its anchors — outputs verified against reality, not against other model outputs.

## Recent Updates

- **2026-07-26:** Created page with Kopadze's graph engineering explainer covering [The Diamond Pattern](#the-diamond-pattern), [Fake-Edge Test](#the-fake-edge-test), [Verification](#verification-in-graphs), [Failure Modes](#failure-modes), [When Not to Use](#when-not-to-use-a-graph), and [Anchors](#anchors)

## From Loops to Graphs

Graph engineering emerged as a natural evolution from [loop engineering](loop-engineering.md). A loop is one agent improving one thing on repeat — try, check, adjust, repeat. A graph is a network of loops where cycles watch and correct each other instead of a single agent chasing a single metric.

Engineers quickly pointed out that this is a decades-old computer science concept (DAGs, dataflow programming) wearing a new name. That's the good news — a pattern that has run critical systems for thirty years is exactly what you want to trust with production work.

The vocabulary is minimal: a **node** is one bounded task with a defined input and output. An **edge** is a real data dependency — one node needs what another produced, so it waits. If no data passes along the arrow, the edge is fake and the wait is wasted.

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

Cost-conscious design: use cheap models on boring nodes and the strong model only where judgment matters. The skeleton (fan-out → reduce → verify → synthesize) is the same whether the job is a market scan, code review, or research report.

## Verification in Graphs

The part most implementations skip — and what separates a real graph from an expensive toy.

Models miss most of their own mistakes. A model grading its own work is too easy on itself. The rule: **never let the agent that did the work check the work.** Place a separate verifier node on the edge. Its only job is to try to kill the finding before it moves on.

Critical requirement: the verifier needs a **clean context**. Give it the same conversation the worker had and it's not checking anything — it's nodding along to itself in a different font. A graph of agents sharing one context is just a single [loop](loop-engineering.md) in a costume.

Split verification three ways — is it correct? Is it current? Is the source real? Three different lenses catch what ten identical ones miss.

## Failure Modes

### Context collapse

Fan out a thousand nodes, then feed all outputs into one final step — you blow past the context window before synthesis starts. Fix: layer your fan-in. Batch results, summarize each batch, then combine summaries, never the raw pile.

### False independence

Two nodes look independent because their prompts never mention each other, but they both write to the same file or hit the same rate-limited API. That's a hidden edge. When Bun's team first fanned a big job across many agents, they shared one workspace and overwrote each other. Fix: give every worker its own isolated space and audit for shared resources, not just shared data.

### Silent node failure

In a chain, one failure stops everything — annoying but obvious. In a graph, one dead node among two hundred can slip into a report that looks complete. Fix: every merge step counts its inputs against the number expected and flags the gap instead of quietly running on half the data.

## When Not to Use a Graph

A graph buys breadth, not better judgment. Skip it when:

- **The task is small or isolated.** Adding one function, fixing one bug — coordination is pure overhead.
- **You want to approve every step.** A graph's point is running wide without you; a tight leash defeats the purpose.
- **You don't know what you're looking for.** Exploratory work wants one steerable agent, not a fleet locked into a plan.
- **Steps genuinely depend on each other.** Forcing a graph onto truly sequential work adds cost for zero speedup.

The tell: if you can't find two jobs with no edge between them, there's no graph to build. It's a loop, and a loop is fine.

## Anchors

The deepest trap: build a full graph with paired checkers, audit nodes, and meta-nodes, and every node reads a report that came from the same system. Everything is consistent. Nothing is verified against reality.

Topology alone does not buy truth. A graph needs **anchors** — nodes whose outputs cannot be argued with: tests that actually ran (not "should pass" — *did* pass), revenue that landed in the bank, customers who actually stayed. Some constraints must be frozen — kept off-limits precisely because they're the ones an optimizer would weaken to win.

Judge a graph on numbers that can't argue back and it stays grounded. Let it grade its own reports and it will be confidently wrong.

## Cost Reality

A graph costs more than a single-agent chat — substantially more. The coordination gets cheaper, but the fleet still burns tokens. The clearest public example: an engineer used this pattern to rewrite the Bun runtime (~535K lines translated into ~1M lines in eleven days) — roughly 50 workflows with up to 64 concurrent agents, costing ~$165,000 in usage, with a human designing and watching throughout [[source]](https://x.com/anatolikopadze/status/2080668775796314331/?rw_tt_thread=True).

Start small, watch what a run costs, and go wider only once one has earned it.

## Sources

- [Graph Engineering explained: what it is, when to use it and when not to](https://x.com/anatolikopadze/status/2080668775796314331/?rw_tt_thread=True) — Foundational explainer covering graph vocabulary, fake-edge test, diamond pattern, verification architecture, failure modes, when-not-to-use criteria, anchors, and cost reality
