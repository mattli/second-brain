---
date: 2026-04-05
topic: pmtxt
type: spec
status: draft
supersedes: 2026-03-30-pmtxt-requirements.md
---

# pmtxt V1 — Product Spec

## What This Is

pmtxt is an AI-native product management system that helps PMs at small startups answer "what should we build next?" It maintains a structured, compounding knowledge base of product context and uses it to generate prioritized feature recommendations with ready-to-go prompts for coding agent frameworks.

## Core Thesis

As AI automates coding, the bottleneck moves upstream to product judgment — deciding *what* to build and *why*. That judgment depends on deeply knowing your customers, competitors, constraints, and past decisions. pmtxt doesn't replace the PM; it gives their judgment better inputs and produces actionable output that flows directly into the build process.

Engineering AI tools (Cursor, Claude Code, Compound Engineering, Superpowers, G-Stack) are session-scoped — they help you build a thing well, then the artifacts go stale. pmtxt is product-scoped — the knowledge base persists and compounds over time. The 50th recommendation is better than the 1st because the system knows your customers, past decisions, competitive landscape, and what worked and what didn't.

**Relationship to the YC RFS:** The YC Request for Startups in this space describes a tool where PMs upload customer interviews and product usage data and ask "what should we build next?" pmtxt molds to this thesis — upstream of code, output executable by coding agents — but not to the RFS's specific implementation. The RFS as written assumes the PM already has clean customer interviews and structured usage data sitting in files, ready to upload. In reality, most PMs don't. That data lives in Notion docs, Slack threads, Mixpanel dashboards, and people's heads. pmtxt's interview *creates* the structured data the RFS assumes already exists. That's a stronger product position than the RFS implies: the RFS assumes the data is the easy part and the synthesis is hard; pmtxt's insight is that getting the data into existence at all is the hard part. The RFS thesis is the destination; the interview is the on-ramp.

## Target User

First PM at a 2-15 person startup. Overwhelmed, under-tooled. Drowning in scattered customer feedback, competitive signals, and internal requests. Needs help deciding what to build, not managing tasks. Already using or willing to use AI coding agents for execution.

## How It Works

### The Loop

```
Inputs (raw data)
  → Knowledge Base (structured, compounding wiki)
    → AI Evaluation Engine (synthesizes KB, generates recommendations)
      → Prioritized Feature Ideas (with ready-to-go prompts)
        → PM approves / denies / defers
          → Approved prompts go to coding agents (CE, G-Stack, Superpowers, Cursor)
            → Results fed back into the system
              → KB gets smarter, next recommendations are better
```

### 1. Inputs

PMs feed the system with raw product data. For V1, all input is manual — no integrations.

**Onboarding interview:** The first experience is a structured conversation that bootstraps the KB. Design informed by G-Stack's `/office-hours` pattern (MIT licensed) — which pushes back on framing, asks for specific examples rather than hypotheticals, and challenges premises before accepting answers. Applied to PM context: instead of "Who are your customers?" (too broad, gets a generic answer), the system asks for specific recent interactions, concrete pain points with evidence, and real competitive encounters. Follow-up questions drill deeper based on what the PM says. The system populates the initial KB from the PM's answers.

**Quick capture:** A text input (or chat) where the PM drops in raw context anytime. "Just had a call with Acme Corp — they're frustrated about X and considering Competitor Y." The system reads it, proposes KB updates, PM approves.

**Document upload:** Paste or upload a transcript, a Google Doc export, interview notes, a CSV of feature requests. The system ingests it, extracts what matters, proposes KB updates.

**URL submission:** Paste a URL (competitor page, industry article, product review). The system fetches and processes it.

**Stakeholder input:** The PM invites stakeholders (CEO, engineering leads, sales, support) to contribute context directly via a shared link. Each stakeholder gets a lightweight, targeted experience — a few structured questions customized by the system based on what the KB is missing. "Hey Sarah, pmtxt has a few questions about engineering constraints" → she spends three minutes answering → the system proposes KB updates. Stakeholders don't need accounts or dashboard access. They contribute raw material; the PM reviews and approves all resulting KB changes through the same governance workflow. The PM remains the editor-in-chief.

This is valuable because PMs don't operate in isolation. The CEO has strategic context the PM might not fully internalize. Engineering has constraints the PM might underestimate. Sales hears objections the PM never sees. Support knows pain points that never reach formal feedback channels. If the system has input from multiple perspectives, it can surface tensions the PM would otherwise have to hold in their head: "Your CEO wants to go upmarket, but your support team reports three unresolved SMB pain points. Building enterprise features now means these don't get addressed."

The system tracks who provided what input, enabling provenance-aware recommendations: "This recommendation is strongly supported by customer data but hasn't been validated with engineering on feasibility."

**What V1 does NOT do:** Direct integrations with Slack, Intercom, Linear, Notion, analytics tools, or any external service — including GitHub repo connection. The PM exports from those tools and uploads here. All integrations are deferred to V2 or later.

GitHub repo connection specifically was considered for V1 as a way to scan the actual product structure (files, components, schemas, routes) and ground recommendations in real codebase context. It is deferred because real privacy and security concerns (auth, scopes, repo access) require careful design, the engineering effort is significant (OAuth flow, repo scanning, structure extraction, ongoing sync), and for v0.1 specifically, the interview's product-context question plus the optional plain-text file upload cover most of the value at a fraction of the cost. V2 plan: PM connects their repo, pmtxt scans for major features, data entities, and route structure, and uses that as the foundation for product context — replacing or supplementing what the interview captures manually.

### 2. Knowledge Base

A structured, governed collection of product context stored as markdown. The LLM maintains this layer — proposing updates, cross-referencing, flagging contradictions. The PM approves all changes.

**Structured categories (suggested scaffolding, not rigid):**

- `customers.md` — Customer segments, personas, pain points, quotes, behavioral patterns. Who they are, what they need, how they use the product.
- `competitors.md` — Competitive landscape. Who they are, what they do well, where they're weak, how they position, pricing.
- `stakeholders.md` — Internal stakeholders, their priorities, constraints they impose. "CEO wants to go upmarket." "Engineering says auth can't handle multi-tenant."
- `market.md` — Market size, trends, adjacent markets, regulatory environment, timing factors.
- `goals.md` — Company and product goals. What metrics matter, what the team is optimizing for, time horizons.
- `constraints.md` — Technical stack, team size, budget, timeline, architectural limitations, compliance requirements.
- `revenue-model.md` — Pricing, segments, unit economics, monetization strategy.
- `decisions.md` — Past product decisions with rationale and outcomes. First-class file that solves the "continuity across sessions" problem. Each entry: what was decided, why, what happened.
- `product-principles.md` — What the team believes about how the product should work. Design values, technical philosophies, non-negotiable standards.

The system can propose new categories as the KB grows. "I'm seeing a lot of regulatory constraints — should we add a compliance page?" Categories are scaffolding to help the PM get started, not a rigid schema.

**Comprehensiveness indicators:** Each KB category has a visual depth indicator in the UI. The system knows what a useful version of each category looks like — customers.md should have defined segments, pain points with evidence, usage patterns, and alternatives considered. If all of that is present, the category reads as rich. If it only has "we sell to startups," it reads as sparse.

Four tiers, expressed visually (not as percentages — percentages imply a precision the system doesn't have):

- **Empty** — grayed out. The category exists in the scaffolding but the PM hasn't populated it yet. Communicates "this is available when you're ready" without nagging.
- **Sparse** — has some content but major gaps. The system can identify what's missing ("customers.md has segments but no pain points").
- **Solid** — enough depth to meaningfully inform the evaluation engine's recommendations.
- **Rich** — deep, multi-source, well-evidenced. Multiple data points, quotes, cross-references to other categories.

The indicators serve two purposes. First, the PM sees at a glance where their blind spots are — most PMs think they know their product context well until they're forced to externalize it. Second, when the evaluation engine generates a recommendation, it can flag which KB gaps affected the quality of that recommendation: "This recommendation doesn't account for competitive positioning because your competitive intelligence is sparse. Adding competitor data would improve future recommendations." This creates a virtuous cycle: better KB → better recommendations → PM sees the value → PM invests more in the KB.

**Governance:** All KB changes go through an approval workflow. The system proposes an update (e.g., "Based on your interview with Acme Corp, I'd like to update customers.md with a new pain point and add a competitive mention to competitors.md"). The PM reviews a diff and approves, edits, or rejects. No auto-commits. The PM's judgment is the value; the system makes it faster and better-informed.

**Compounding:** The KB gets richer over time through use. Every approved update, every decision logged, every piece of feedback makes the next recommendation sharper. This is the moat — a new competitor can replicate the prompting, but not six months of accumulated product context with outcome data.

### 3. Evaluation Engine

The AI reads the full KB and evaluates feature ideas against the PM's actual product context.

**Idea sources:**

- PM-submitted ideas (typed in or captured from conversations)
- System-generated suggestions (based on patterns in the KB — customer pain points without solutions, competitive gaps, underserved segments)
- Ingested feature requests (from uploaded feedback, support tickets, user interviews)

**Continuous generation and re-ranking:** The system maintains a living backlog of ideas, continuously ranked against the current state of the KB. When the PM opens the dashboard, they see the current best recommendations — not a stale list from the last time they asked. New ideas surface automatically as the KB grows (the system notices patterns — "three customers mentioned export functionality this month but there's no idea for it"). Existing ideas get re-ranked as context changes. A KB update (new customer feedback, competitor move, stakeholder input) triggers re-evaluation of ideas linked to the affected context. The PM doesn't have to ask "what should I build?" — the answer is always there, always current.

**Structured ideas layer (SQLite):** Ideas live in a relational database, not in markdown files. The KB is markdown (unstructured, rich, human-readable, git-backed). The ideas layer has different needs — ideas need to be filtered, sorted, grouped, compared, and merged. Each idea record includes structured metadata: title, description, source (which input triggered it), target customer segments, problem category, product area, status (active/approved/denied/deferred), created date, last re-ranked date, related idea IDs, and the generated prompt.

This hybrid architecture serves two purposes. First, dedup becomes a database query before it becomes an LLM judgment call. Two ideas that share the same customer segment, problem category, and product area are flagged as potential duplicates without the LLM comparing every idea against every other idea. The system surfaces potential duplicates to the PM, who merges or keeps them separate. Second, re-ranking is efficient — when the KB changes, the system queries "which ideas are linked to the customer segment that just got updated" and re-evaluates only those, rather than regenerating everything from scratch.

The feedback loop is also inherently relational: an idea links to a decision, which links to an outcome, which informs future rankings. SQLite handles these relationships natively.

**What the engine does:**

- Categorizes and deduplicates ideas using structured metadata for fast matching and LLM judgment for nuanced cases. "I wish I could share my work" and "we need collaboration features" get flagged as potential duplicates; the PM decides whether to merge.
- Evaluates each idea against the full KB: alignment with goals, relevance to target customer segments, competitive implications, technical feasibility given constraints, revenue impact, stakeholder priorities.
- Ranks ideas with clear rationale grounded in the KB. Not generic — the reasoning references specific customers, specific competitors, specific past decisions.
- Resurfaces deferred ideas when KB context changes. "You deferred real-time collaboration three months ago because your user base was too small. Customer count has tripled — worth revisiting?"

**What the engine does NOT do:** Make the decision. It recommends and explains why. The PM decides.

### 4. Output — Ready-to-Go Prompts

The primary output is a prioritized list of feature recommendations. Each recommendation includes:

- **Feature description** — What to build, in clear language.
- **Rationale** — Why this is the priority right now, grounded in KB data. Which customers need it, what competitive pressure exists, how it aligns with goals, what past decisions support or complicate it.
- **Impact assessment** — Expected effect on key metrics, revenue, customer segments. Honest about uncertainty.
- **Ready-to-go prompt** — A prompt the PM can paste directly into a coding agent framework (Compound Engineering, G-Stack, Superpowers, Cursor, Claude Code) to begin technical planning and execution. Not a full PRD — a clear, contextualized starting point that includes what to build, why, key constraints, and success criteria. **The prompt should be detailed enough that a coding agent can produce a working prototype from it alone, without requiring the PM to translate or add missing context.** That means referencing specific product context from the KB — component names, data entities, existing patterns — so the agent knows exactly where in the codebase to work. Detailed enough to be actionable, lightweight enough that the coding agent takes it from there. This is the bar that separates pmtxt's output from generic feature descriptions: a PM using pmtxt should be able to go from recommendation to working prototype in one hop, not two.
- **Suggested scope** — What's in V1, what's deferred. Helps the PM avoid scope creep.

**Customizable output format:** The default output structure (description, rationale, constraints, success criteria, scope) should work well out of the box. But PMs should be able to customize the output format to match their workflow — add sections, remove sections, change the level of detail, specify which coding agent framework they use so the output is shaped accordingly. A solo founder building in Cursor needs different output than an enterprise PM handing specs to a team using G-Stack. These preferences persist as part of the PM's profile — set once, applied to every recommendation. The output format is itself part of the PM's product intelligence, refined over time as they learn what works for their specific workflow.

### 5. PM Actions

For each recommendation, the PM can:

- **Approve** — The idea moves to "ready to build." The prompt is available to copy/export. The decision is logged in `decisions.md` with rationale.
- **Deny** — The idea is rejected with a reason. Logged in `decisions.md`. The system learns from this — "PM rejected collaboration features because the market is too early" informs future recommendations.
- **Defer** — Not now, but keep it. The idea goes to a backlog. The system periodically resurfaces deferred ideas when context changes.

### 6. Feedback Loop

After a feature is built and shipped, the PM feeds results back into the system:

- Did it move the metric?
- How did customers respond?
- What surprised you?
- Would you make the same decision again?

This historical context is logged in `decisions.md` and shapes future recommendations. The system learns which types of bets pay off for this specific product and customer base. The feedback loop is slow (weeks or months), but every data point makes the system meaningfully better.

## Form Factor

**Web application.** The primary interface is a dashboard, not a CLI or chat window.

**Dashboard views:**

- **Ideas feed** — Prioritized recommendations from the evaluation engine. Each idea shows the feature, rationale, impact, and actions (approve/deny/defer). This is the default view — what the PM sees when they open the product.
- **Knowledge base** — Browse and search the KB. See the current state of each category file. Review pending KB update proposals.
- **Decision log** — History of approved, denied, and deferred ideas with rationale and outcomes. The institutional memory.
- **Deferred backlog** — Ideas the PM punted on. System flags when context has changed enough to reconsider.

**Chat as a feature:** A conversational interface for interacting with the KB. The PM can ask questions ("What do our enterprise customers care most about?"), submit quick captures ("Just learned Competitor X launched a free tier"), manage approvals, or explore ideas through dialogue. Chat is a feature within the product, not the primary interface.

## Tech Stack & Technical Decisions

- **Web app:** Next.js (existing repo at github.com/mattli/pmtxt). React 19, Tailwind CSS 4, TypeScript, pnpm.
- **LLM:** Anthropic API with prompt caching. Full KB assembled into context on every call — a typical pmtxt knowledge base is 10-50 pages, which fits easily in 200K tokens. Prompt caching reduces cost on repeated queries. No RAG, no fine-tuning, no embeddings for V1.
- **Full context, every time:** The system reads the entire KB on every evaluation — the PM never selects which files to include. This is a key differentiator: Cursor makes you manage context, pmtxt manages context for you. The PM's job is to keep the KB current. The system's job is to use all of it, all the time, without being asked. This is what allows the system to surface tensions the PM didn't anticipate. If context window limits ever become a constraint at scale, smarter context assembly is a future optimization, not a V1 concern.
- **Knowledge base storage:** Structured markdown files, git-backed. Git provides version history, branching, and an audit trail for free. Every approved KB change is a commit.
- **Ideas layer:** SQLite. Structured metadata for ideas, decisions, and outcomes. Queryable for dedup, filtering, re-ranking, and relationship tracking. No separate database server — just a file on disk alongside the KB.
- **Core logic:** TypeScript — shared between web app and any future interfaces (CLI, API, etc.).
- **Approval system:** File-based proposals. One proposal = one file. On approve, apply the change and git commit. On reject, archive. No branch-per-proposal overhead for single-file markdown edits.
- **KB file format:** Structured markdown with YAML frontmatter (last_updated, source). Each file type has a defined template with consistent section structure. Files are human-readable and directly editable — the structured types are a convenience layer, not a requirement.
- **No integrations in V1:** Manual input + AI conversation is sufficient to prove value. Integrations (Slack, Linear, Intercom, analytics) add weeks of work without validating the core hypothesis.
- **No multi-user in V1:** Single PM user. Team features, permissions, and shared access are V2 concerns.

## What pmtxt Is Not

- Not a project management tool (no sprint tracking, no task boards, no Jira replacement)
- Not a user research tool (no interviews, no surveys — ingests their outputs)
- Not an analytics dashboard (ingests PM's interpretation of analytics, not raw event data)
- Not a coding tool (sits upstream of Cursor/CE/G-Stack — its output is their input)
- Not a document generator (the prompt is the deliverable, not a PRD)

## Competitive Positioning

**vs. Productboard / Canny / UserVoice:** Those tools collect and organize feedback. pmtxt synthesizes feedback with competitive intel, stakeholder context, and past decisions to recommend what to build. They're input tools; pmtxt is a decision tool.

**vs. Traycer / Motionode / Rakenne:** Those tools generate documents (PRDs, specs) from scratch each time. pmtxt maintains a persistent knowledge base — the AI reads from a governed source of truth rather than inventing context. Their output is a document; pmtxt's output is a decision with a prompt.

**vs. ChatGPT / Claude chat:** Generic AI lacks your product context and forgets between sessions. pmtxt's KB means the AI knows your customers, competitors, past decisions, and what worked. The 50th conversation is better than the 1st.

**vs. Cursor / Claude Code / CE / Superpowers / G-Stack:** Those tools handle "how to build." pmtxt handles "what to build and why." pmtxt sits upstream — its output becomes their input.

## Scope Boundaries for V1

- Single PM user, no multi-user collaboration or team permissions
- No direct integrations with external tools (including GitHub repo connection, Notion, Linear, Slack, analytics platforms — all deferred to V2)
- No raw analytics ingestion — PM provides interpreted data
- Advisory only — recommends what to build, does not execute
- No visual mockup generation — the prompt describes the feature, the coding agent generates visuals
- Execution bridge (spec → coding agent handoff) designed into the architecture but not automated in V1

## Version Roadmap

pmtxt grows toward the full vision incrementally based on real user feedback, not by trying to build the full thing on day one. The v0.1 build target is a narrow slice that tests the core hypothesis; subsequent versions earn their way in based on what users do after their first session.

**v0.1 — The Interview (build target, shipping April 2026).** A standalone, single-session web experience. Pre-interview context capture (URL + one-liner + optional plain-text file upload), 5-question interview with AI pushback, generated KB, 3 recommendations with coding-agent-ready prompts. **Single-session by design:** no persistence, no accounts, no email. The PM gets value, downloads their output, and leaves. Persistence shapes how the KB compounds, how recommendations evolve, whether the PM can come back — all of which are real concerns, but v0.1 defers them to keep the scope tight and the validation loop fast. Session state lives in localStorage as a zero-cost mitigation against connection loss during the interview. Full v0.1 product spec in `v0.1-spec.md`; conversational design in `v0.1-conversation-spec.md`.

**v0.2 — Persistence & richer inputs.** Accounts, persistent KB across sessions, document parsing beyond plain text (PDF, docx, slide decks), GitHub repo connection for product context, and the first version of the quick-capture and document-upload input modes described earlier in this spec. This is the version that starts compounding in the way the long-term thesis requires.

**v0.3+ — Integrations & the full loop.** Direct integrations with Notion, Linear, Slack, and analytics tools. Usage data ingestion. Stakeholder input flows. The evaluation engine's continuous re-ranking. The execution bridge that dispatches work directly to coding agents. This is where pmtxt starts becoming the product development operating system described in the Long-Term Vision section.

The v0.1 → v0.2 → v0.3 sequence is deliberate: each version adds depth in a direction that real users have asked for, rather than building the full spec speculatively. If v0.1 users don't ask for persistence, v0.2 gets rethought. If they do, the existing spec's architecture (markdown KB, SQLite ideas layer, approval workflow) is what v0.2 ships.

## Long-Term Vision

V1 is advisory — the PM reads recommendations, approves them, and manually takes the prompt to a coding agent. But the architecture should not preclude the full loop.

The end state: pmtxt becomes the product development operating system. Stakeholders feed context into the system from their respective vantage points (sales, support, engineering, leadership). The KB compounds. The evaluation engine recommends what to build. The PM approves. And the system dispatches the work directly to coding agents — monitors progress, reports back, and logs outcomes. The PM shifts from "person who writes specs and talks to engineers" to an editor-in-chief governing a system that runs the full cycle from signal to shipped feature.

This aligns with the Gartner prediction (April 2026) that enterprises will abandon assistive AI tools by 2028 in favor of execution platforms where agents commit to workflow outcomes autonomously. V1 earns trust by being right about what to build. The execution layer is earned, not assumed.

For V1, this means: output format should be structured enough that a future version could programmatically dispatch it to a coding agent, even though V1 just presents it to the PM as a copyable prompt.

## What Success Looks Like

A PM signs up, completes the onboarding interview in under 15 minutes, and has a populated KB. Over the next few weeks, they drop in interview notes, competitive observations, and feedback. They open the product and see a prioritized list of feature recommendations grounded in their actual data — not generic suggestions. They approve an idea, copy the prompt into Claude Code, and start building. After shipping, they log the results. The next batch of recommendations is noticeably better because the system knows what worked.

The PM thinks: "This tool understands my product."

## Open Questions

- **Onboarding depth:** How many questions in the initial interview? Too few and the KB is too thin to be useful. Too many and the PM abandons onboarding. Need to find the minimum viable KB that produces useful first recommendations. **Next step:** Study G-Stack's `/office-hours` skill file to understand how it structures conversational flow — when to drill deeper, when to push back, when to move on — and adapt the pattern for PM context rather than technical planning.
- **Deferred idea resurfacing:** Resurfacing should be trigger-based, not timer-based — ideas resurface when the KB changes in a way that materially affects the idea's scoring dimensions, not on a cadence. Borrowing from project management frameworks like RICE (Reach, Impact, Confidence, Effort) or ICE (Impact, Confidence, Ease), each idea in the structured ideas layer carries scoring dimensions that the system re-evaluates when related KB context changes. **Resolved:** the trigger model (KB-change-driven, not scheduled). **Unresolved:** which scoring framework to use and whether the PM sees/adjusts scores directly; what threshold triggers a resurface (score increase %, outranking a previously approved idea, or a specific dimension changing significantly); how to handle explicit time-based deferrals ("not until Q3") — does a score change override the PM's time boundary, or does the system respect it and flag for later?
- **Dedup accuracy:** The structured ideas layer (SQLite metadata matching) handles obvious duplicates, but nuanced cases — where two ideas use different language for the same underlying need — require LLM judgment with KB context. How well this works in practice needs to be tested with real PM data. If dedup is too aggressive, distinct ideas get incorrectly merged. If too passive, the dashboard fills with near-duplicates.

## Relationship to Prior Docs

This spec supersedes both `2026-03-30-pmtxt-requirements.md` and `2026-03-30-001-feat-pmtxt-v1-plan.md`. The requirements have been rethought and the implementation plan was designed for a CLI-first product that no longer reflects the current direction. Technical decisions that still hold have been merged into this spec's Tech Stack section. The prior docs can be retained as historical context but should not be treated as current.

Additional sources incorporated:
- `2026-04-04-pmtxt-brainstorm-summary.md` — Product shape rethink, Karpathy wiki pattern, YC RFS alignment
- `reddit-feedback.md` — User research validating the core problem
- `last30days-validation.md` — Market validation
