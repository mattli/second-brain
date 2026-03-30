---
title: "feat: Build pmtxt V1 — AI-Native Product Management CLI"
type: feat
status: active
date: 2026-03-30
origin: projects/pmtxt/2026-03-30-pmtxt-requirements.md
---

# feat: Build pmtxt V1 — AI-Native Product Management CLI

## Overview

Build the first version of pmtxt: a CLI-first product management tool that maintains a governed plain-text knowledge base and uses LLMs to help PMs answer "what should we build next?" and generate agent-ready specs. V1 targets the first PM at a 2-15 person startup.

## Problem Frame

Product managers at small startups are overwhelmed and under-tooled. Their hardest job — deciding what to build next — gets no help from existing tools. Meanwhile, AI-generated PRDs fail because the AI lacks product context and fills gaps with hallucinations. pmtxt solves this architecturally: a structured, governed knowledge base gives the AI accurate context, and a structured Q&A workflow prevents premature generation. (see origin: projects/pmtxt/2026-03-30-pmtxt-requirements.md)

## Requirements Trace

- R1. Synthesize product context and recommend what to build next, with rationale
- R2. Recommendations grounded in the specific company's knowledge base
- R3. Knowledge base stored as structured markdown files (customers.md, competitors.md, goals.md, roadmap.md, decisions.md)
- R3a. decisions.md captures past decisions and rationale for cross-session continuity
- R4. Knowledge base built through hybrid of PM conversations, integrations, and manual input
- R5. PR-style approval workflow — system proposes, PM reviews and approves
- R6. Structured Q&A step before any generation
- R7. Thinking partner behavior — challenges assumptions, surfaces gaps
- R8a. Generate structured specs that coding agents can execute
- R8b. Specs detailed enough for agents to begin without PM translation
- R9. CLI chat interface as primary interaction
- R10. Web dashboard for shared visibility
- R11. Approval workflows accessible from CLI or web

## Scope Boundaries

- Not a project management tool (no sprint tracking, no task boards)
- Not a user research tool (no interviews, no surveys — may ingest their outputs)
- Not an analytics dashboard (may consume analytics as input)
- V1: single PM, no multi-user collaboration or team permissions
- V1: no integrations with external tools — manual input + AI conversation to prove value first (see Key Technical Decisions)

## Context & Research

### Technology Stack

- **Existing repo:** Next.js 16, React 19, Tailwind CSS 4, TypeScript, pnpm monorepo workspace
- **CLI framework:** Ink 5 + Pastel (React-based TUI, proven by Claude Code)
- **Web dashboard:** Next.js (already scaffolded in existing repo)
- **LLM integration:** Anthropic API with prompt caching
- **Knowledge base storage:** Local git repo with structured markdown files
- **Monorepo structure:** Turborepo with `@pmtxt/core`, `@pmtxt/cli`, `@pmtxt/web`

### Relevant Patterns

- **Claude Code:** Ink-based CLI with streaming chat UI, command routing, file operations
- **Approval workflow:** File-based proposals in `.pmtxt/proposals/` (YAML), CLI review flow, git commit on approve. No branches, no GitHub PRs — proposals are files, not database rows
- **LLM synthesis:** Full knowledge base in context window (10-50 pages of markdown fits easily in 200K tokens). Prompt caching for cost reduction across turns. No RAG needed for V1
- **Agent-ready specs:** Structured markdown with numbered requirements, technical constraints from KB, acceptance criteria as checkboxes, empty "Open Questions" as the readiness gate

### Competitive Differentiation

Traycer, Motionode, and Rakenne generate documents from scratch each time. pmtxt's differentiator is the **persistent, governed knowledge base** — the AI reads from a maintained source of truth rather than inventing context. (see origin)

## Key Technical Decisions

- **TypeScript monorepo:** Single language across CLI, web, and LLM integration. Matches existing Next.js landing page. Turborepo for build orchestration
- **Ink + Pastel for CLI:** React component model for both chat UI and structured commands. Proven by Claude Code at scale
- **Full-context LLM (no RAG):** A typical pmtxt knowledge base is 10-50 pages — fits in context. Prompt caching via Anthropic API reduces cost on repeated queries. RAG adds complexity without benefit at this scale
- **File-based proposals, not git branches:** One proposal = one YAML file in `.pmtxt/proposals/`. On approve, apply change + git commit. On reject, archive. No branch-per-proposal overhead for single-file markdown edits
- **No integrations in V1:** Manual input + AI conversation is sufficient to prove value. Integrations (Slack, Linear, Intercom) are a V2 concern. The reddit research validated that the structured Q&A workflow alone is highly valued
- **Generated agent instruction files:** Beyond per-feature specs, pmtxt generates project-level CLAUDE.md / .cursorrules from the knowledge base, giving coding agents persistent project context

## Open Questions

### Resolved During Planning

- **Which integrations for V1?** None. Manual input + AI conversation to prove the core value loop. Integrations add complexity without validating the core hypothesis
- **How does the recommendation engine work?** Full KB assembled into context + structured prompt templates. Prompt caching for cost. No RAG, no fine-tuning
- **What spec format for coding agents?** Structured markdown with: Context (links to KB), Numbered Requirements, Technical Constraints (from stack.md), Out of Scope, Acceptance Criteria (checkboxes), Open Questions (must be empty to be agent-ready)
- **How is approval implemented?** File-based proposals (YAML in `.pmtxt/proposals/`), CLI review command, git commit on approve. Web dashboard review in a later unit
- **KB file schema?** Defined per-file templates with consistent structure: frontmatter (last_updated, source), sections with headers, structured entries. See Unit 2

### Deferred to Implementation

- Exact prompt templates for synthesis and Q&A will need iteration during development
- CLI chat UX details (streaming, key bindings, status bar layout) will emerge during Ink prototyping
- Web dashboard layout and component design deferred until CLI core is working

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
                          pmtxt Architecture

  PM (CLI)                    @pmtxt/core                    Stakeholders (Web)
  ────────                    ────────────                    ─────────────────
  pmtxt chat  ──────┐                                    ┌── Next.js dashboard
  pmtxt review ─────┤    ┌─────────────────────┐         │
  pmtxt status ─────┼───>│  Knowledge Base Ops  │<────────┤   Read KB files
  pmtxt spec   ─────┤    │  (read/write/diff)   │         │   View proposals
                    │    └────────┬────────────┘         │   Review/approve
                    │             │                       │
                    │    ┌────────v────────────┐         │
                    ├───>│  Approval Engine     │<────────┘
                    │    │  (propose/review/    │
                    │    │   approve/reject)    │
                    │    └────────┬────────────┘
                    │             │ on approve: git commit
                    │             │
                    │    ┌────────v────────────┐
                    └───>│  LLM Layer           │
                         │  (context assembly,  │
                         │   Q&A, synthesis,     │
                         │   spec generation)    │
                         └──────────────────────┘
                                  │
                                  v
                         Anthropic API (prompt caching)

  Knowledge Base (git repo):
  ├── customers.md
  ├── competitors.md
  ├── goals.md
  ├── roadmap.md
  ├── decisions.md
  ├── stack.md
  ├── .pmtxt/
  │   ├── config.yaml
  │   └── proposals/
  │       ├── pending/
  │       ├── approved/
  │       └── rejected/
  └── specs/
      └── *.md
```

**Data flow for "What should I build next?":**

```
1. PM types question in CLI chat
2. Core assembles full KB into context (all .md files)
3. LLM generates 5-10 clarifying questions (R6)
4. PM answers in chat
5. LLM synthesizes recommendation with rationale, grounded in KB
6. PM accepts recommendation → optionally triggers spec generation
7. If spec generated → proposal for decisions.md update → PM approves
```

## Implementation Units

### Phase 1: Foundation

- [ ] **Unit 1: Monorepo scaffolding and shared core package**

  **Goal:** Set up the Turborepo monorepo with three packages: `@pmtxt/core`, `@pmtxt/cli`, `@pmtxt/web`. The existing Next.js app becomes the web package.

  **Requirements:** Foundation for all requirements

  **Dependencies:** None — first unit

  **Files:**
  - Create: `packages/core/package.json`
  - Create: `packages/core/tsconfig.json`
  - Create: `packages/core/src/index.ts`
  - Create: `packages/cli/package.json`
  - Create: `packages/cli/tsconfig.json`
  - Create: `packages/cli/src/index.tsx`
  - Modify: `package.json` (add Turborepo, workspace config)
  - Modify: `pnpm-workspace.yaml` (add packages/*)
  - Move: `app/` → `packages/web/app/` (existing Next.js app becomes web package)
  - Create: `turbo.json`

  **Approach:**
  - Use Turborepo for build orchestration across packages
  - Core package exports pure TypeScript functions with no UI dependencies
  - CLI package depends on core + Ink/Pastel
  - Web package depends on core + Next.js (already exists)
  - Shared TypeScript config with strict mode

  **Patterns to follow:**
  - Standard Turborepo monorepo layout with `packages/` directory
  - pnpm workspace protocol for inter-package dependencies

  **Test scenarios:**
  - Happy path: `pnpm install` succeeds, `pnpm build` compiles all three packages without errors
  - Happy path: CLI package can import and call a function from core package
  - Happy path: Web package can import and call a function from core package
  - Edge case: `pnpm dev` runs the web package in dev mode without affecting CLI

  **Verification:**
  - All three packages build cleanly
  - Cross-package imports resolve correctly
  - Existing Next.js app runs unchanged from its new location

---

- [ ] **Unit 2: Knowledge base file schema and operations**

  **Goal:** Define the structured markdown templates for each KB file type and implement core read/write/validate operations in `@pmtxt/core`.

  **Requirements:** R3, R3a

  **Dependencies:** Unit 1

  **Files:**
  - Create: `packages/core/src/kb/schema.ts` (file type definitions, templates)
  - Create: `packages/core/src/kb/reader.ts` (parse structured markdown into typed objects)
  - Create: `packages/core/src/kb/writer.ts` (serialize typed objects back to markdown)
  - Create: `packages/core/src/kb/init.ts` (initialize a new KB with template files)
  - Test: `packages/core/src/kb/__tests__/reader.test.ts`
  - Test: `packages/core/src/kb/__tests__/writer.test.ts`
  - Test: `packages/core/src/kb/__tests__/init.test.ts`

  **Approach:**
  - Each KB file type (customers, competitors, goals, roadmap, decisions, stack) has a defined template with frontmatter (last_updated, source) and consistent section structure
  - Reader parses markdown into typed TypeScript objects (e.g., `Customer { name, segment, painPoints, sources, insights }`)
  - Writer serializes back to markdown preserving formatting
  - `pmtxt init` creates a new KB directory with all template files
  - decisions.md has a specific structure: each entry has an ID, date, decision text, rationale, and status

  **Patterns to follow:**
  - Use gray-matter or similar for frontmatter parsing
  - Keep markdown format human-readable and editable — the structured types are a convenience layer, not a requirement

  **Test scenarios:**
  - Happy path: Parse a well-formed customers.md into typed Customer objects
  - Happy path: Serialize Customer objects back to markdown that matches the original
  - Happy path: `init` creates all expected template files with correct structure
  - Edge case: Parse a KB file with missing optional fields (graceful defaults)
  - Edge case: Parse a KB file that has been manually edited with extra sections (preserve unknown sections)
  - Error path: Reader returns clear error when file is malformed (missing frontmatter, broken structure)
  - Integration: Round-trip test — parse a file, serialize it, parse again, verify identical typed output

  **Verification:**
  - All KB file types can be parsed and round-tripped without data loss
  - Template files are human-readable markdown that a PM could edit directly
  - decisions.md entries have stable IDs for cross-referencing

---

### Phase 2: Approval Workflow

- [ ] **Unit 3: Proposal engine**

  **Goal:** Implement the file-based proposal system in `@pmtxt/core` — create, list, approve, reject proposals that modify KB files.

  **Requirements:** R5

  **Dependencies:** Unit 2

  **Files:**
  - Create: `packages/core/src/approval/proposal.ts` (create/read/list proposals)
  - Create: `packages/core/src/approval/review.ts` (approve/reject/edit logic)
  - Create: `packages/core/src/approval/diff.ts` (generate human-readable diffs for KB changes)
  - Create: `packages/core/src/approval/types.ts` (Proposal type, status enum, operation types)
  - Test: `packages/core/src/approval/__tests__/proposal.test.ts`
  - Test: `packages/core/src/approval/__tests__/review.test.ts`

  **Approach:**
  - Proposals stored as YAML files in `.pmtxt/proposals/pending/`
  - Each proposal has: id, status, created_at, target_file, operation (append_section, replace_section, replace_file), context (where it came from), proposed_content
  - On approve: apply change to target KB file, git commit with descriptive message, move proposal to `approved/`
  - On reject: move proposal to `rejected/`, optionally store rejection reason
  - On edit: open proposal content in $EDITOR before approving
  - Diff generation produces human-readable before/after (not unified diff) — shows additions in context

  **Patterns to follow:**
  - Use js-yaml for YAML serialization
  - Use simple-git for git operations (add, commit)
  - Archive pattern (per CLAUDE.md: never delete, move to approved/rejected)

  **Test scenarios:**
  - Happy path: Create a proposal for appending a new customer to customers.md — proposal YAML written to pending/
  - Happy path: Approve a proposal — change applied to target file, git commit created, proposal moved to approved/
  - Happy path: Reject a proposal — proposal moved to rejected/, target file unchanged
  - Happy path: List pending proposals — returns all proposals sorted by date
  - Edge case: Approve a proposal when the target file has changed since the proposal was created (conflict detection)
  - Error path: Approve a proposal for a target file that doesn't exist — clear error message
  - Error path: Create a proposal with an invalid operation type — validation error
  - Integration: Create → approve → verify git log shows the commit with correct message

  **Verification:**
  - Full lifecycle works: create → list → approve/reject
  - Approved changes appear in git history
  - Rejected proposals are preserved in rejected/ directory
  - No KB file changes without an approved proposal

---

### Phase 3: CLI Interface and LLM Integration

- [ ] **Unit 4: CLI shell with basic commands**

  **Goal:** Build the CLI entry point with Ink/Pastel, implementing `pmtxt init`, `pmtxt status`, and `pmtxt review` commands.

  **Requirements:** R9, R11

  **Dependencies:** Unit 3

  **Files:**
  - Create: `packages/cli/src/commands/init.tsx` (initialize a new KB)
  - Create: `packages/cli/src/commands/status.tsx` (show KB state and pending proposals)
  - Create: `packages/cli/src/commands/review.tsx` (interactive proposal review flow)
  - Create: `packages/cli/src/components/ProposalDiff.tsx` (render human-readable diffs)
  - Create: `packages/cli/src/components/StatusView.tsx` (KB summary view)
  - Modify: `packages/cli/src/index.tsx` (wire up Pastel command routing)
  - Modify: `packages/cli/package.json` (add Ink, Pastel, bin entry)
  - Test: `packages/cli/src/__tests__/commands.test.tsx`

  **Approach:**
  - `pmtxt init` calls core's init function, creates KB directory with templates, initializes git repo
  - `pmtxt status` shows: number of KB files, last updated dates, number of pending proposals
  - `pmtxt review` shows numbered list of pending proposals, PM selects one, sees the diff, can approve/edit/reject/skip
  - Use Ink's `<Text>`, `<Box>`, `<SelectInput>` for the review flow
  - Diff presentation: green additions, before/after blocks for replacements — no unified diff, no line numbers

  **Patterns to follow:**
  - Pastel's file-system routing for commands
  - Ink component patterns for interactive TUI elements

  **Test scenarios:**
  - Happy path: `pmtxt init` in an empty directory creates all KB template files and a .pmtxt directory
  - Happy path: `pmtxt status` shows correct file count and pending proposal count
  - Happy path: `pmtxt review` displays a pending proposal with readable diff, accepts approval input
  - Edge case: `pmtxt review` with no pending proposals shows "Nothing to review" message
  - Edge case: `pmtxt init` in a directory that already has a KB shows appropriate warning
  - Error path: `pmtxt status` outside a KB directory shows helpful error

  **Verification:**
  - `pmtxt init` produces a working KB that `pmtxt status` can read
  - `pmtxt review` completes the full approve/reject cycle
  - CLI is installable via `pnpm link` and runs from any directory

---

- [ ] **Unit 5: LLM layer — context assembly and synthesis**

  **Goal:** Implement the core LLM integration in `@pmtxt/core`: context assembly from KB files, prompt caching, and the structured Q&A workflow.

  **Requirements:** R1, R2, R6, R7

  **Dependencies:** Unit 2

  **Files:**
  - Create: `packages/core/src/llm/context.ts` (assemble full KB into structured context string)
  - Create: `packages/core/src/llm/client.ts` (Anthropic API client with prompt caching)
  - Create: `packages/core/src/llm/prompts.ts` (prompt templates for synthesis, Q&A, recommendations)
  - Create: `packages/core/src/llm/types.ts` (message types, response types)
  - Test: `packages/core/src/llm/__tests__/context.test.ts`
  - Test: `packages/core/src/llm/__tests__/prompts.test.ts`

  **Approach:**
  - Context assembly reads all KB files, formats them into a structured context string with clear section headers
  - Use Anthropic API's `cache_control` breakpoints to cache the KB context across turns — first call pays full cost, subsequent calls hit cache at ~90% reduction
  - System prompt establishes the "thinking partner" persona: challenge assumptions, ask clarifying questions, reference specific KB entries, never invent facts not in the KB
  - Structured Q&A template: given the KB context and the PM's question, generate 5-10 clarifying questions before any synthesis or generation
  - Recommendation template: synthesize across goals, customer pain points, competitive gaps, and constraints; output ranked recommendations with rationale citing specific KB entries

  **Patterns to follow:**
  - Anthropic SDK for TypeScript (`@anthropic-ai/sdk`)
  - Prompt caching pattern: system prompt + KB context as cached prefix, conversation as non-cached suffix

  **Test scenarios:**
  - Happy path: Context assembly produces a string containing all KB file contents with clear headers
  - Happy path: Prompt caching is configured correctly — second call in a session uses cached context
  - Happy path: Q&A prompt generates clarifying questions that reference specific KB content
  - Happy path: Recommendation prompt produces ranked recommendations with citations to KB entries
  - Edge case: Context assembly with a partially populated KB (some files exist, some don't) — includes available files, notes missing ones
  - Edge case: KB content that exceeds a reasonable context budget — truncation strategy with priority (goals > customers > competitors > roadmap > decisions)
  - Error path: Anthropic API returns rate limit error — exponential backoff with clear user message
  - Error path: Invalid API key — clear setup instructions

  **Verification:**
  - Recommendations reference specific entries from the KB (not generic advice)
  - Q&A step surfaces genuinely useful questions based on gaps in the KB
  - Prompt caching reduces token usage on subsequent turns (verifiable via API response headers)

---

- [ ] **Unit 6: CLI chat interface**

  **Goal:** Build the interactive chat mode where the PM converses with the AI about their product, grounded in the knowledge base.

  **Requirements:** R9, R6, R7

  **Dependencies:** Unit 4, Unit 5

  **Files:**
  - Create: `packages/cli/src/commands/chat.tsx` (main chat command)
  - Create: `packages/cli/src/components/ChatView.tsx` (streaming chat UI)
  - Create: `packages/cli/src/components/MessageBubble.tsx` (styled message display)
  - Create: `packages/cli/src/components/InputBar.tsx` (text input with history)
  - Test: `packages/cli/src/__tests__/chat.test.tsx`

  **Approach:**
  - `pmtxt chat` enters interactive mode: the PM types messages, the AI responds with streaming text
  - On session start, the full KB is assembled into context via the LLM layer
  - The AI acts as a thinking partner (R7): challenges assumptions, asks clarifying questions, surfaces gaps
  - When the AI identifies a KB update (new customer insight, decision made, etc.), it creates a proposal automatically
  - PM can review proposals inline (`/review`) or continue chatting
  - Chat history persisted to `.pmtxt/sessions/` for continuity across sessions

  **Patterns to follow:**
  - Ink's streaming text rendering for LLM responses
  - Claude Code's chat interaction model as a reference

  **Test scenarios:**
  - Happy path: Start chat, send a message, receive a streamed response that references KB content
  - Happy path: AI creates a proposal during chat when the PM provides new product context — proposal appears in pending/
  - Happy path: PM uses `/review` inline command to review pending proposals without leaving chat
  - Edge case: Chat with an empty KB (just initialized) — AI asks onboarding questions to populate the KB
  - Edge case: Very long conversation — verify context window management (truncation strategy)
  - Error path: LLM API failure during streaming — show error message, allow retry

  **Verification:**
  - Chat responses are grounded in KB content (not generic)
  - Proposals created during chat appear in `pmtxt review`
  - Session continuity works — starting a new chat session references prior context

---

### Phase 4: Spec Generation

- [ ] **Unit 7: Spec generation**

  **Goal:** Implement agent-ready spec generation from product decisions, outputting structured markdown that coding agents can execute.

  **Requirements:** R8a, R8b

  **Dependencies:** Unit 6

  **Files:**
  - Create: `packages/core/src/specs/generator.ts` (generate spec from decision + KB context)
  - Create: `packages/core/src/specs/template.ts` (spec markdown template)
  - Create: `packages/core/src/specs/validator.ts` (validate spec completeness — e.g., no open questions)
  - Create: `packages/cli/src/commands/spec.tsx` (CLI command: `pmtxt spec`)
  - Test: `packages/core/src/specs/__tests__/generator.test.ts`
  - Test: `packages/core/src/specs/__tests__/validator.test.ts`

  **Approach:**
  - Spec template includes: Context (links to KB entries), Numbered Requirements, Technical Constraints (from stack.md), Out of Scope, Acceptance Criteria (checkboxes), Open Questions
  - The "Open Questions" section must be empty for a spec to be considered agent-ready — this is the readiness gate
  - If open questions remain, the system loops back to Q&A with the PM to resolve them before marking the spec as ready
  - Specs are saved to `specs/` directory in the KB repo
  - `pmtxt spec` command: either generate a new spec from a recommendation, or generate from a freeform description
  - Optionally generate a companion CLAUDE.md / .cursorrules file from the KB (stack.md, conventions, goals) for project-level agent context

  **Patterns to follow:**
  - Spec format validated by reddit research: structured sections, numbered requirements, acceptance criteria as checkboxes
  - Agent instruction file patterns: CLAUDE.md for Claude Code, .cursorrules for Cursor

  **Test scenarios:**
  - Happy path: Generate a spec from a product decision — output contains all required sections with content drawn from KB
  - Happy path: Spec with empty Open Questions passes validation as agent-ready
  - Happy path: Generated spec references specific KB entries (customers, stack, decisions)
  - Edge case: Generate a spec when stack.md is empty — Technical Constraints section notes this gap
  - Error path: Spec with non-empty Open Questions fails the readiness gate — returns the questions for PM resolution
  - Integration: Full loop — recommendation from Unit 6 → spec generation → spec passes validation

  **Verification:**
  - Generated specs are structured enough for a coding agent to begin implementation
  - The readiness gate prevents specs with unresolved questions from being marked as ready
  - Specs reference real KB content, not hallucinated context

---

### Phase 5: Web Dashboard

- [ ] **Unit 8: Web dashboard — KB view and proposal review**

  **Goal:** Build the stakeholder-facing web dashboard that displays the knowledge base, pending proposals, and generated specs.

  **Requirements:** R10, R11

  **Dependencies:** Unit 3, Unit 7

  **Files:**
  - Create: `packages/web/app/kb/page.tsx` (knowledge base overview — list all files)
  - Create: `packages/web/app/kb/[file]/page.tsx` (individual KB file rendered as markdown)
  - Create: `packages/web/app/proposals/page.tsx` (list pending/approved/rejected proposals)
  - Create: `packages/web/app/proposals/[id]/page.tsx` (individual proposal with approve/reject)
  - Create: `packages/web/app/specs/page.tsx` (list generated specs)
  - Create: `packages/web/app/specs/[id]/page.tsx` (individual spec view)
  - Create: `packages/web/app/api/kb/route.ts` (API route: read KB files)
  - Create: `packages/web/app/api/proposals/route.ts` (API route: list/approve/reject proposals)
  - Create: `packages/web/app/api/specs/route.ts` (API route: list specs)
  - Create: `packages/web/components/MarkdownRenderer.tsx` (render KB markdown with styling)
  - Create: `packages/web/components/ProposalCard.tsx` (proposal with inline diff view)

  **Approach:**
  - API routes import `@pmtxt/core` and call the same functions as the CLI
  - KB files rendered as styled markdown with navigation between files
  - Proposals shown with inline diff view — additions in green, deletions in red strikethrough (Google Docs "suggesting" model)
  - Approve/reject buttons on proposals (R11)
  - Specs shown with readiness badge (agent-ready vs. has open questions)
  - The dashboard needs to know the KB path — configurable via environment variable or `.pmtxt/config.yaml`
  - Read-only for stakeholders by default; PM can approve/reject from the web too

  **Design:** Use the `/frontend-design` skill during implementation for design quality. Alternatives: create Figma mockups beforehand and use `/figma-design-sync` to match them, or bring your own designs from another tool. The dashboard is stakeholder-facing, so design matters here more than in the CLI.

  **Patterns to follow:**
  - Next.js App Router with server components for data fetching
  - Tailwind CSS for styling (already in the project)
  - diff-match-patch library for granular character-level diffs in the web view

  **Test scenarios:**
  - Happy path: Dashboard home shows list of all KB files with last-updated dates
  - Happy path: Individual KB file page renders markdown correctly
  - Happy path: Proposals page shows pending proposals with diff preview
  - Happy path: Approve a proposal from the web — change applied, git committed, same as CLI approval
  - Edge case: Dashboard with empty KB (just initialized) — shows helpful onboarding state
  - Edge case: Large KB file — renders without performance issues
  - Error path: Dashboard cannot find KB directory — shows configuration instructions
  - Integration: Approve a proposal on web, then `pmtxt status` in CLI reflects the change

  **Verification:**
  - Stakeholders can view the full KB and specs without using the CLI
  - PM can approve/reject proposals from the web dashboard
  - Web and CLI operate on the same data — changes in one are immediately visible in the other

## System-Wide Impact

- **Interaction graph:** CLI and web both import `@pmtxt/core` — all business logic changes propagate to both interfaces. Proposals created by the LLM during chat are the same proposals reviewed in the CLI or web
- **Error propagation:** LLM API failures surface as user-facing messages in both CLI and web. Git operation failures (commit, add) should surface clearly and never leave the KB in a half-modified state
- **State lifecycle risks:** The main risk is a proposal being approved while the target file has changed (e.g., another proposal was approved first). Unit 3 includes conflict detection for this case
- **API surface parity:** Approve/reject must work identically in CLI (Unit 4) and web (Unit 8). Both call the same core function
- **Integration coverage:** The critical cross-layer scenario is: LLM creates a proposal during chat → PM reviews in CLI or web → approval triggers git commit → KB is updated → next LLM call reflects the change. This end-to-end loop must work
- **Unchanged invariants:** Git history is the audit trail. Every approved change is a commit. This invariant must hold across all approval paths (CLI and web)

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Prompt quality for recommendations may need significant iteration | Start with simple prompts, iterate based on real PM usage. The structured Q&A step (R6) provides a forcing function for better context before generation |
| Ink/Pastel may have limitations for complex chat UX | Claude Code has proven Ink can handle sophisticated chat UIs. Start simple, add complexity incrementally |
| Full-context approach may hit token limits as KB grows | Monitor context size. At current model limits (200K tokens), a KB would need to be ~500 pages to overflow. Implement truncation with priority ordering as a safety valve |
| Single-user V1 means no real validation of the approval workflow's value | The approval workflow still provides value for a single PM: it creates an audit trail, prevents accidental changes, and builds the habit of reviewing AI-proposed changes |
| Next.js 16 + Turborepo setup may have compatibility issues | Pin versions, test the monorepo build early (Unit 1 is the foundation specifically to catch this) |

## Sources & References

- **Origin document:** [projects/pmtxt/2026-03-30-pmtxt-requirements.md](projects/pmtxt/2026-03-30-pmtxt-requirements.md)
- **User research:** [projects/pmtxt/reddit-feedback.md](projects/pmtxt/reddit-feedback.md)
- **YC RFS:** [projects/product/yc-rfs.md](projects/product/yc-rfs.md) — "Cursor for Product Managers"
- **Product vision:** [projects/product/product-vision.md](projects/product/product-vision.md) — autopilot data layer + co-pilot decision layer
- **Existing repo:** github.com/mattli/pmtxt — Next.js 16 template with pnpm monorepo workspace
- **Competitive landscape:** Traycer, Motionode, Rakenne (see origin document)
