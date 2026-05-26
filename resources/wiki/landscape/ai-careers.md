---
created_at: 2026-04-05
last_updated: 2026-05-27
---

# AI Careers

> TLDR: The AI job market is bifurcating into "big AI" and "small AI," but the highest-leverage roles are emerging at the intersection of building and strategy — hybrid positions like the Agent Strategist that combine technical depth, business acumen, and delivery skills.

## Overview

Stanford CS230 Lecture 9 (Autumn 2025), featuring Andrew Ng and Laurence Moroney, covers the current AI career landscape. The core message: it's the best time ever to build with AI, but the market is noisy with hype, and many AI projects fail because teams lack fundamentals or business understanding.

## The Golden Age Argument

Andrew Ng's framing: AI task complexity (measured by how long it takes a human to do the equivalent) is doubling every 7 months (per METR research). For coding specifically, the doubling time is ~70 days. This means anyone can now build software more powerful than what was possible a year ago, using AI building blocks (LLMs, agentic workflows, voice AI, deep learning).

The flip side: finding jobs has gotten tougher for fresh grads, but teams can't find enough skilled builders. The number of ideas exceeds the number of people who can execute.

## The Big/Small Bifurcation

Laurence Moroney's 5-year outlook:

**Big AI** — Frontier model companies (OpenAI, Anthropic, Google) pushing larger models toward AGI. This is where the current hype and bubble risk concentrates.

**Small AI** — Open-weight models getting smaller and more capable. The 7B model of next year will match the 300B model of today. Organizations in privacy-sensitive fields (law, medicine) will fine-tune small self-hosted models on downstream tasks. Skills for this side: fine-tuning, deployment, domain adaptation.

The bubble, if it bursts, will likely hit big AI first. Small AI has longer runway because it solves concrete privacy and cost problems.

## What Gets You Hired

Three things that matter more than technical depth alone:

1. **Fundamentals** — Deep understanding of AI academics and practicalities, not just surface-level tool usage
2. **Business focus** — Understanding what the business needs and being able to deliver for it. Bias toward delivery.
3. **Delivery skills** — The people who got jobs in Moroney's examples were the ones with half-baked ideas that were well-grounded, not the ones with impressive but unshippable demos

Anti-pattern: technically brilliant candidates who fail interviews because they can't collaborate or communicate. Teamwork is non-negotiable.

## Navigating Hype

The hype cycle in AI is extreme. Social media engagement farming makes signal-to-noise terrible. Advice:
- Filter actively — most AI content is noise
- Go deep on fundamentals rather than chasing every new release
- Read papers (better signal-to-noise than social media)
- Keep your finger on the pulse without drowning in it

The dotcom bubble analogy: it burst, but Amazon and Google survived because they understood fundamentals. Same principle applies.

## Relationship to Agent Proficiency

Ng's personal advice aligns with the [agent proficiency](../concepts/agent-proficiency.md) thesis: spend time building with agentic tools rather than consuming content passively. The practical skill of directing AI agents toward real problems is what separates hype participants from builders.

## Generalists vs. Specialists

A related debate: Grok-summarized X discussion found that broad thinkers who link ideas across fields hold power amid AI's rise. Supporters cite examples like Matthew Gallagher building a $401M telehealth business with broad skills and two employees. The emerging consensus favors hybrids who go wide then deepen strategically as AI handles routine tasks. See also [Agent Proficiency](../concepts/agent-proficiency.md) — agent management may be the ultimate generalist skill.

## The Agent Strategist: A New Hybrid Role

Sierra's fastest-growing team illustrates what the hybrid career path looks like in practice. The "Agent Strategist" role didn't exist a year ago; now it's a distinct archetype that combines go-to-market, consulting, and hands-on agent building in a single seat.

What makes it possible: tools like Sierra's Ghostwriter (an agent for building agents) collapse the coordination overhead that used to force people to choose between "build the system" and "be close to the customer." One person can now take an idea from concept to production with fewer handoffs.

**What the role actually involves:**
- Leading agent deployments end-to-end — from scoping with C-suite executives to prompt engineering and simulation testing
- Mapping real customer journeys (order tracking, insurance claims, returns) into working agent behaviors
- Deciding what to ship now vs. later, pushing back on scope creep, and getting teams comfortable with non-deterministic software
- Driving business outcomes (CSAT, resolution rates, revenue) — Sierra prices on outcomes, so the strategist's incentives align directly with customer success

**Why it matters for the career landscape:** The role validates the page's core themes — fundamentals matter, business focus matters, delivery over demos. But it goes further: it suggests that as AI tooling matures, the highest-leverage positions may not be pure engineering or pure strategy, but roles that span both. Agent Strategists come from diverse backgrounds (product management, engineering, consulting) and succeed by going deep on technical issues one moment and zooming out into change management the next.

This parallels the generalists-vs.-specialists debate below — the Agent Strategist is essentially the hybrid archetype made concrete, with "unreasonable agency" (Sierra's phrase) as a cultural prerequisite. See also [Agentic Engineering](../tools/agentic-engineering.md) for the technical patterns these roles build on top of.

## The AI Engineer Learning Path

An analysis of ~2,000 job descriptions (Luffytaro, Apr 2026, based on Alexey Grigorev's field guide) maps the skills that actually get hired in AI engineering roles. The core insight: AI engineering is about building systems *around* LLMs, not training models from scratch.

**The 20% that drives 80% of the work:**
1. LLM fundamentals — controlling models predictably, structured outputs, prompt engineering
2. RAG — the backbone of most real-world AI systems; chunking strategies matter more than people think
3. AI agents — tool calling, agent loops (think → act → observe → repeat), MCP, multi-agent systems
4. Testing and evaluation — LLM-as-judge, offline eval datasets, measuring retrieval quality
5. Monitoring and observability — tracing, logging, cost tracking, feedback loops
6. Production systems — turning notebooks into services, guardrails, cloud deployment

**The converging stack:** React/Next.js + FastAPI + LangChain/PydanticAI + OpenAI/Anthropic + Pinecone/Weaviate/Qdrant + Docker/K8s + OpenTelemetry. This mirrors Ann Miura-Ko's observation in [AI-Native Product Development](../tools/ai-native-product-development.md) that the tool stack is converging across companies.

**Differentiators that get hired faster:** agent frameworks (LangGraph, CrewAI), fine-tuning, evaluation systems, vector databases, multi-agent architectures. See also [Agentic Engineering](../tools/agentic-engineering.md) for the harness design patterns these roles increasingly require.

## The Agent Engineer Roadmap: Harness Engineering as Career Moat

A more opinionated take on the agent engineer career path frames **harness engineering** — not model knowledge or framework tourism — as the primary differentiator. The argument: the same model produces wildly different results depending on the harness wrapping it. Anthropic's own measurement showed Opus 4.5 scoring 78% on CORE inside Claude Code versus 42% inside Smolagents — same model, different harness [[source]](https://read.readwise.io/read/01kr3xm9p83j26jnf0w519kncj).

This reframes what "AI engineer" means in practice. The job is not calling an LLM API. It's building the loop control, tool dispatch, context management, persistence, sub-agent orchestration, eval harness, and observability that turn a frontier model into a production system.

**The recommended stack narrows to two:** LangGraph 1.0 + Deep Agents for production orchestration (durable execution, checkpointing, middleware, model-agnostic), and the Claude Agent SDK as a reference harness to study (CLAUDE.md, Skills, hooks, sub-agents, plan mode). Everything else is either fading, getting absorbed, or a weaker version of these two for production use.

**Context engineering replaces prompt engineering** as the core discipline. Four primitives: Write (scratchpads, memory files), Select (retrieval at point of use), Compress (summarization at 85–95% of context window), and Isolate (sub-agents with their own context windows). Anthropic's multi-agent research system beat single-agent Opus 4 by 90.2% on breadth-first research using exactly this pattern, though at ~15× the token cost.

**A 6-phase, ~17-week roadmap** for a technically strong engineer new to agents:

1. **Foundations (1–2 weeks)** — Build mental models: workflow vs. agent distinction, the augmented-LLM concept, context engineering primitives, the harness-as-operating-system framing. No agent code yet.
2. **First agent (2–3 weeks)** — Write a tool-using agent loop from scratch (~100 lines), then rebuild it on the Claude Agent SDK with a Skill, a hook, and a sub-agent. Ship something tiny that runs on a schedule.
3. **Real architecture (3–4 weeks)** — Build a multi-step, persistent agent on LangGraph with PostgresSaver durability, Deep Agents middleware, isolated-context sub-agents, and human-in-the-loop interrupts. Produce a LangSmith trace.
4. **Build your own harness (3–4 weeks)** — Write a ~1,500-line Python harness covering loop, tool dispatch, context compression, sub-agents, hooks, and OTEL traces. The post-mortem comparing it to Claude Agent SDK and Deep Agents is the real deliverable.
5. **Eval and regression (3–4 weeks)** — Golden datasets, four eval types (single-turn, trajectory, LLM-as-judge, end-state), CI gates that block PRs on regression, and at least one published benchmark via Inspect.
6. **Production hardening (ongoing)** — Prompt caching, model routing with cost budgets, sandboxed code execution, credential brokering, drift monitoring, and durable execution.

**The hiring market signal:** 57% of teams already have agents in production (LangChain State of Agent Engineering, 1,340 respondents), 89% have observability wired, and quality (32%) is the #1 barrier. The field is bottlenecked on engineers who can build evals and harnesses, not on engineers who can call an API. See [Agentic Engineering](../tools/agentic-engineering.md) for the technical patterns underlying this career path, and [Agent Proficiency](../concepts/agent-proficiency.md) for the broader skill of directing agents toward real problems.

## Sources

- "Stanford CS230 | Autumn 2025 | Lecture 9: Career Advice in AI" — Stanford Online (Andrew Ng, Laurence Moroney) ([link](https://www.youtube.com/watch?v=AuZoDsNmG_s))
- "Generalists Poised to Thrive in AI Era" — X discussion summary ([link](https://x.com/i/trending/2040140222386909626))
- "The AI Engineer Learning Path" — Luffytaro (tweet, Apr 2026) ([link](https://read.readwise.io/read/01kq6h5qsge0qe28ebmf4mnvg5)) — skills roadmap from ~2,000 job descriptions; based on Alexey Grigorev's AI Engineering Field Guide
- "Agent Strategist: Your PhD in applied AI" — Sierra (tweet) — the Agent Strategist as a new hybrid role combining building, consulting, and go-to-market
- "How to Become an AI Engineer in 2026 (Builder's Roadmap)" — Avid (tweet) — 17-week agent engineer roadmap centered on harness engineering, with LangGraph and Claude Agent SDK as the two recommended stacks
