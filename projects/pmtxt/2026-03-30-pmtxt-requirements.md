---
date: 2026-03-30
topic: pmtxt
---

# pmtxt — AI-Native Product Management System

## Problem Frame

The first PM at a 2-15 person startup is overwhelmed and under-tooled. They're drowning in scattered customer feedback, competitive signals, and internal requests — and their hardest job is answering "what should we build next?" Existing tools (Jira, Productboard, Notion) manage work but don't help make product decisions. Meanwhile, coding agents can build features faster than ever, but they need structured specs to execute on. The bottleneck has shifted from engineering throughput to product clarity.

## Requirements

**Core Decision Engine**
- R1. The system synthesizes product context (customer insights, competitive landscape, team goals, constraints) and recommends what to build next, with rationale
- R2. Recommendations are grounded in the product knowledge base, not generic — they reflect the specific company's customers, market position, and goals

**Product Knowledge Base**
- R3. Product context is stored in structured plain-text/markdown files (e.g., customers.md, competitors.md, goals.md, roadmap.md) as the underlying data layer
- R4. The system builds and maintains these files through a hybrid of PM conversations, integrations with existing tools, and manual input
- R5. All updates to the knowledge base go through a PR-style approval workflow — the system proposes changes, the PM reviews and approves before anything becomes the source of truth

**Agent-Ready Spec Output**
- R6. The system generates structured feature specs from product decisions that coding agents (Cursor, Claude Code, etc.) can directly execute on
- R7. Specs are detailed enough for an agent to begin implementation without the PM needing to translate further

**Interaction Model**
- R8. The PM interacts with the system primarily through a CLI chat interface to explore decisions, review context, and approve changes
- R9. A web dashboard provides a shared view of the knowledge base and specs for both the PM and stakeholders (engineers, founders, investors)
- R10. The PM can perform approval workflows (reviewing and accepting/rejecting proposed knowledge base changes) from either the CLI or the web dashboard

## Success Criteria

- One real PM at a small startup uses it daily for a month and prefers it to their previous workflow
- The PM can go from "what should we build next?" to an agent-ready spec without leaving the system
- The knowledge base stays current with minimal manual effort from the PM

## Scope Boundaries

- Not a project management tool — does not replace Linear/Jira for task tracking and sprint management
- Not a user research tool — does not conduct interviews or run surveys, though it may ingest outputs from those
- Not a dashboard/analytics product — does not visualize usage data, though it may consume analytics as input
- V1 does not need to support multi-PM collaboration or team permissions

## Key Decisions

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
