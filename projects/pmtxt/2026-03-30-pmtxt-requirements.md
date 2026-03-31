---
date: 2026-03-30
topic: pmtxt
---

# pmtxt — AI-Native Product Management System

## Problem Frame

The first PM at a 2-15 person startup is overwhelmed and under-tooled. They're drowning in scattered customer feedback, competitive signals, and internal requests — and their hardest job is answering "what should we build next?" Existing tools (Jira, Productboard, Notion) manage work but don't help make product decisions. Meanwhile, coding agents can build features faster than ever, but they need structured specs to execute on. The bottleneck has shifted from engineering throughput to product clarity.

A validated secondary problem (see reddit-feedback.md): AI-generated PRDs and specs consistently fail because the AI lacks product context — it doesn't know your customers, stack, past decisions, or tradeoffs, and fills those gaps with hallucinations. The most effective current workarounds are structured Q&A before generation and constraining AI with specific context. pmtxt solves this architecturally by maintaining a governed, always-current product knowledge base that the AI reads from rather than invents.

The core thesis: as AI automates coding, the bottleneck moves upstream to product judgment — deciding *what* to build and *why*. That judgment depends on deeply knowing your customers, competitors, constraints, and past decisions. pmtxt doesn't replace the PM; it gives their judgment better inputs. The human-in-the-loop approval workflow isn't just a safety feature — it's the product thesis. The PM's judgment is the value; pmtxt makes it faster and better-informed.

Engineering AI tools (like Compound Engineering, Superpowers, Cursor) already do structured brainstorming, planning, and execution — but they're **session-scoped**. They help you build *a thing* well, then the artifacts go stale. pmtxt is **product-scoped**: the knowledge base persists and compounds over months. The 50th spec is better than the 1st because the system knows your customers, past decisions, and competitive landscape. Engineering tools *can* pull in prior context, but they're not designed for it. pmtxt is purpose-built for compounding product intelligence over time.

## Requirements

**Core Decision Engine**
- R1. The system synthesizes product context (customer insights, competitive landscape, team goals, constraints) and recommends what to build next, with rationale
- R2. Recommendations are grounded in the product knowledge base, not generic — they reflect the specific company's customers, market position, and goals

**Product Knowledge Base**
- R3. Product context is stored in structured plain-text/markdown files (e.g., customers.md, competitors.md, goals.md, roadmap.md, decisions.md) as the underlying data layer
- R3a. `decisions.md` is a first-class file that captures past product decisions and rationale, solving the "continuity across sessions" problem identified in user research
- R4. The system builds and maintains these files through a hybrid of PM conversations, integrations with existing tools, and manual input
- R5. All updates to the knowledge base go through a PR-style approval workflow — the system proposes changes, the PM reviews and approves before anything becomes the source of truth

**Structured Exploration Before Generation**
- R6. Before generating any spec or recommendation, the system runs a structured Q&A step — surfacing clarifying questions, constraints, and gaps for the PM to resolve first
- R7. The system acts as a thinking partner: it challenges assumptions, identifies missing decisions, and surfaces edge cases rather than just generating documents

**Agent-Ready Spec Output**
- R8a. The system generates structured feature specs from product decisions that coding agents (Cursor, Claude Code, etc.) can directly execute on
- R8b. Specs are detailed enough for an agent to begin implementation without the PM needing to translate further

**Interaction Model**
- R9. The PM interacts with the system primarily through a CLI chat interface to explore decisions, review context, and approve changes
- R10. A web dashboard provides a shared view of the knowledge base and specs for both the PM and stakeholders (engineers, founders, investors)
- R11. The PM can perform approval workflows (reviewing and accepting/rejecting proposed knowledge base changes) from either the CLI or the web dashboard

## Success Criteria

- One real PM at a small startup uses it daily for a month and prefers it to their previous workflow
- The PM can go from "what should we build next?" to an agent-ready spec without leaving the system
- The knowledge base stays current with minimal manual effort from the PM

## Scope Boundaries

- Not a project management tool — does not replace Linear/Jira for task tracking and sprint management
- Not a user research tool — does not conduct interviews or run surveys, though it may ingest outputs from those
- Not a dashboard/analytics product — does not visualize usage data, though it may consume analytics as input
- V1 does not need to support multi-PM collaboration or team permissions

## Competitive Landscape

From user research (reddit-feedback.md):
- **Traycer** — Forces structured Q&A before generating specs; produces consistent spec + tickets. Multiple positive mentions. Closest to pmtxt's interaction model but lacks the persistent knowledge base
- **Motionode** — "Cursor for technical planning." Deterministic engine for deliverables, dependencies, and timelines. More structured/rigid than pmtxt's conversational approach
- **Rakenne** — Repeatable workflows with step-by-step output structure. Targets non-developers

pmtxt's differentiator: none of these maintain a governed, persistent product knowledge base. They generate documents from scratch each time, which is why they hit the hallucination/context problem.

## Key Decisions

- **Thinking partner, not document generator:** The system challenges, questions, and surfaces gaps before generating anything. AI as reviewer > AI as author (validated by user research)
- **Outcome over tool:** The product delivers PM outcomes (prioritization decisions, specs), not a file format. Plain-text files are the substrate, not the product
- **PR-style governance:** All knowledge base changes require PM approval. No auto-commits, even for minor updates. This ensures the PM stays in control and the knowledge base is trustworthy
- **Target user is first PM at small startup:** Not solo founders (too small a market for this level of product), not enterprise PMs (too entrenched in existing tools)
- **Agent-ready output is core, not a nice-to-have:** The full loop — decide what to build → generate spec → agent builds it — is the vision, not a future feature
- **CLI-first, web-supported:** V1 ships as a CLI tool for the PM's daily workflow. A web dashboard provides shared visibility into the knowledge base and specs. Web chat can be added later without changing the core product logic

## Dependencies / Assumptions

- Assumes LLMs are good enough at synthesis and recommendation to deliver useful "what to build next" answers when given sufficient context
- Assumes the target PM is willing to adopt a new tool if it meaningfully reduces their decision-making burden
- Assumes coding agents will continue to improve at executing from structured specs

## Outstanding Questions

### Deferred to Planning
- [Affects R4][Needs research] Which integrations matter most at launch for small startup PMs? (Slack, Linear, Intercom, analytics?)
- [Affects R1][Technical] How does the recommendation engine work — prompt engineering over context files, RAG, fine-tuned model, or something else?
- [Affects R3][Technical] What is the specific file schema/structure for the knowledge base?
- [Affects R6][Needs research] What spec format do coding agents (Cursor, Claude Code) work best with?
- [Affects R5][Technical] How is the approval workflow implemented — git-based, custom UI, or notification-based?

## Next Steps

→ `/ce:plan` for structured implementation planning
