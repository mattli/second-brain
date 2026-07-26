---
created_at: 2026-07-26
last_updated: 2026-07-26
---

# Context Engineering

> TLDR: The discipline of filling a model's context window with exactly the right information for the next step. In Karpathy's Software 3.0 framing, the context window is the new programming surface; the same weights produce a good or bad agent depending entirely on what's in the window. Everything reduces to four operations — Write, Select, Compress, Isolate — and context engineering is the foundation that [loops](../tools/loop-engineering.md) automate and that the [harness](../tools/agent-harness.md) executes.

## Software 3.0: Context as the Programming Surface

Karpathy's Software 3.0 framework reframes the discipline. Software 1.0 is humans writing explicit code. Software 2.0 is humans training neural networks with data. **Software 3.0 is humans programming models through context** — the context window is the new programming surface. You are giving context to an intelligent interpreter that can read, reason, call tools, and adapt. As Karpathy puts it, "Context engineering is the delicate art and science of filling the context window with just the right information for the next step."

The difference between a good agent and a bad agent is not the model — it is what is in the context window when the model runs. The same model can score 0.637 or 0.488 on MMLU depending only on how the context is structured. Same weights, same question, different context, different result.

## The LLM-as-CPU Analogy

The LLM is the CPU; the context window is RAM. Just as an operating system decides what fits into RAM, context engineering decides what fits into the model's working memory. External databases are disk (large but slow); tool integrations are device drivers; the [harness](../tools/agent-harness.md) is the operating system. The raw model is a processor with no durable memory of its own — everything it can reason over in a given step has to be loaded into the window first, and the window is small relative to everything you could put in it. Managing that scarce, fast tier of memory is the whole game (see the [context-as-knowledge-hierarchy / L1-L2-L3 treatment](../tools/agent-harness.md#context-as-knowledge-hierarchy) for the cache-tier version of this same idea).

## The Four Operations

Everything in context engineering reduces to four operations:

- **Write** — persist context outside the window. CLAUDE.md, skills, state files. Things the agent can read back later instead of holding in memory.
- **Select** — retrieve only what is relevant right now. Not everything, not random chunks — the right five documents out of fifty thousand.
- **Compress** — summarize old information to save tokens. When history grows too long, compact it. Fresh tool results always get priority over stale conversation.
- **Isolate** — give subtasks their own clean context window. This is Cherny's "context firewall." Each sub-agent gets a fresh window; only structured output flows back.

These four operations are the unifying lens for the practitioner patterns scattered across the field: [SysLS's principles](../tools/agentic-engineering.md#practitioner-principles-sysls) (separate research from implementation, CLAUDE.md as a conditional directory) are techniques for doing Select and Isolate well; [domain knowledge as infrastructure](../tools/agentic-engineering.md#domain-knowledge-as-infrastructure-cherny) is the Write operation scaled across a team.

## Context Rot

Skipping these operations produces **context rot** — as a conversation grows, irrelevant tokens pile up, signal-to-noise drops, and the model makes worse decisions. The window did not get smaller; it got cluttered. [Chroma's research](https://research.trychroma.com/context-rot) formalizes it: models become worse at reasoning and completing tasks as their context window fills, making context a precious, scarce resource. This is the same mechanism behind the "Lost in the Middle" effect (models over-attend to the beginning and end of a long window and under-attend to the middle) and behind the practitioner-level failures of rule sets and skills contradicting each other as they accumulate.

Context rot is why the four operations are not optional hygiene but load-bearing architecture. The [harness](../tools/agent-harness.md) mitigates it structurally — compaction, tool-call offloading (keeping only head and tail tokens of large outputs, writing the full result to the filesystem), and progressive disclosure of skills so definitions load lazily rather than all at startup.

## Context Engineering vs RAG

RAG (retrieval-augmented generation) was an engineering workaround for small context windows — you couldn't fit the whole document, so you chunked, embedded, searched, and injected. Nyk's argument (Apr 2026): with Claude Opus at 1M tokens (750K words, ~3,000 pages) and Gemini 3 Pro at 2M, context capacity grew ~500x in three years. The bottleneck moved from *retrieval* to *curation*. "70% of LLM errors come from bad context, not bad models."

**When long context replaces RAG:** bounded document sets under ~500K tokens (~375K words) — skip the entire RAG pipeline. No chunking, no embeddings, no vector database. Claude Code already works this way: it reads files directly, uses agentic search, and manages context through compaction rather than retrieval.

**When RAG still wins:** scale beyond the window (millions of documents), cost at volume (50–200x token reduction), freshness (incremental indexing in seconds), and access control (permission filtering *before* retrieval).

The catch is that a bigger window is not a reliable window. On Anthropic's MRCR v2 benchmark there is a 15–17pp drop between 256K and 1M tokens, and 1 in 4 multi-needle retrievals fail at the full window — practical reliable performance sits in the 500–700K range, with critical information placed at the beginning or end. So the honest answer for most teams is: use both. Retrieve to narrow the corpus, then pass the relevant subset in full rather than chunking it further. This is the [LLM Knowledge Bases](llm-knowledge-bases.md) thesis from the other direction — a compiled, cross-referenced wiki is a way of doing Write and Select once and keeping the result current, rather than re-deriving context via vector search on every query.

## Prompt → Context → Loop

Three paradigm shifts in four years, each building on the previous:

1. **Prompt engineering** — writing one good instruction. You craft the sentence, hit enter, hope for the best.
2. **Context engineering** — designing everything the model sees: which files, which history, which tool results, which rules. The prompt is one component; the context is the whole operating system.
3. **[Loop engineering](../tools/loop-engineering.md)** — designing the system that does the context engineering for you, automatically, on repeat. Cherny: "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."

Each layer does not replace the previous one — it builds on top. A sloppy prompt inside a perfect loop still produces sloppy work faster. But the leverage moved. Every cycle of a loop does the same four operations: **Write** (save state to disk after each run), **Select** (load only relevant state on the next cycle), **Compress** (summarize old runs, prioritize fresh results), **Isolate** (sub-agents handle subtasks in their own windows). If those four operations are bad, the loop makes them bad faster. If they are good, the loop makes them good forever. Context engineering is the foundation; the [loop](../tools/loop-engineering.md) is the engine that runs it; the [harness](../tools/agent-harness.md) is the runtime that executes them both.

## Related

- [Loop Engineering](../tools/loop-engineering.md) — The system that does context engineering for you, automatically, on repeat; the third rung of the prompt → context → loop timeline
- [Agent Harness](../tools/agent-harness.md) — The runtime that executes the four operations; supplies the CPU/RAM analogy and the structural mitigations for context rot
- [Agentic Engineering](../tools/agentic-engineering.md) — The broader discipline this unifies; where the practitioner patterns (SysLS, domain-knowledge-as-infrastructure) live
- [LLM Knowledge Bases](llm-knowledge-bases.md) — Compiled markdown wikis as a way of doing Write/Select once; the fuller RAG-vs-long-context treatment
