# pmtxt Brainstorm Session — April 4, 2026 (Friday, ~5:00 PM)

## Context

Matt was on a walk brainstorming what pmtxt could look like. This was a free-flowing conversation that started with revisiting the pmtxt concept and ended with a much clearer product shape, a strategic framing around a YC application, and open questions for next steps. The conversation covered product vision, competitive positioning, output format, the relationship to Second Brain, career strategy, and personal sustainability.

---

## 1. Starting Point: Revisiting the pmtxt Concept

Matt opened by saying he'd been thinking about pmtxt on his walk. He expressed ambivalence about the instruction-file approach (the structured .md files for customers, market, stakeholders, etc.) — his exact words were "I can't say I like it."

However, he proposed a new framing for the product: **the system takes in feature requests (both user-submitted and AI-generated suggestions), runs them against the structured context (the MD knowledge base files), and lets the PM evaluate the output through customizable criteria.** He also described several functions the product could have — brainstorming, social media validation (similar to his last30days tool), and producing output (likely a PRD) that plugs into your coding system of choice.

Claude reframed this as a shift from "AI chat partner that knows your product" to a **feature evaluation engine**, where the KB files become the lens/criteria rather than the product itself. The proposed pipeline:

- **Inputs:** Feature requests from users/stakeholders, or system-generated ideas (from social listening, competitor moves, etc.)
- **Processing:** Evaluate each idea against the KB context — alignment with goals, customer segment relevance, competitive implications, constraints
- **Output:** Structured evaluation the PM can scan, plus a path to a PRD for coding agents

Claude noted that the "customizable criteria" piece is the real product — every PM weighs things differently, and if the KB defines what matters and the system applies that lens consistently, that's the unique value.

---

## 2. The Y Combinator RFS and "Cursor for PMs"

Matt referenced the Y Combinator "Requests for Startups" page (which he had saved to Readwise). The relevant RFS one-liner was essentially: **"Cursor for product managers."**

Matt also referenced a VC thesis piece (possibly A16Z, Sequoia, or Kleiner Perkins) that said **the future of AI products will be outcome-based.** This led to a key question: what is the actual outcome for a product manager? Is the deliverable still a PRD?

### The Outcome Discussion

Claude argued that the outcome for a PM is NOT a PRD. The PRD is a means to an end. The actual outcome is **knowing what to build next and being right about it** — shipping the thing that moves the business metric. This reframes the product:

- Cursor's outcome isn't "code files" — it's "working software, faster." Code is a side effect.
- Similarly, pmtxt's outcome shouldn't be a PRD — it should be **confidence that you're building the right thing**, with the PRD as a side effect for handoff.

An outcome-oriented version would care about things like: did the shipped feature actually move the metric? Can the system learn from outcomes over time? Can it get better at predicting which bets pay off?

**Key tension identified:** The feedback loop for PM decisions is slow (weeks/months to know if a feature worked), unlike Cursor where code runs or doesn't immediately. This makes it harder to prove value quickly.

### What YC Specifically Described

From the RFS page, YC envisions: upload customer interviews and product usage data, ask "what should we build next?", and get a feature outline grounded in customer feedback explaining why it's worth building. The tool would also propose specific changes to UI, data model, and workflows, and break down development tasks for coding agents.

YC's buried insight (per Claude's read): *"As agents increasingly take the first pass at implementation, the way we define and communicate 'what to build' needs to change."* The real opportunity is redesigning the **interface between human judgment and AI execution**, not just producing documents.

---

## 3. The Relationship to Second Brain

Matt made a critical observation: **this is, in large part, what he's been trying to build with Second Brain.** Second Brain already ingests signals (Readwise highlights, social media via last30days, notes), maintains persistent context (the vault), runs scheduled intelligence tasks (daily briefing, weekly summary), and surfaces what matters for better decisions.

pmtxt as originally specced is essentially Second Brain narrowed to the PM domain — same architecture pattern: persistent knowledge base, AI that reads it, structured outputs, feedback loops.

### Three Paths Discussed

1. **Build pmtxt as a product** — package the system and sell it to other PMs. Software company. Revenue from subscriptions. Job becomes features, onboarding, support, marketing.
2. **Use the system to do PM work for others** — don't sell the tool, use Second Brain + AI setup to be a highly effective product consultant or fractional PM. Sell the deliverable, not the software. (Matt rejected this — "how do I convince someone I'm worth paying.")
3. **Keep building Second Brain for yourself and ship your own products** — the system makes you faster at identifying what to build, validating it, and shipping. The system is your competitive advantage, not your product.

Path 2 was dropped. The real tension is between 1 and 3, though they're not mutually exclusive if sequenced right.

---

## 4. The YC Application Strategy

Matt clarified an important point: **he's not positioning Second Brain as the product.** He would use Second Brain as his *process* to build a fresh product from scratch. The existing pmtxt project folder (requirements doc, validation, implementation plan) would be treated as brainstorm material, not a spec. He explicitly said he'd want to rethink the entire product from scratch.

### Timeline

- Current date: April 4, 2026 (Friday)
- YC application deadline: ~May 3, 2026
- Available time: ~30 days

### The Hedging-Bets Strategy (Matt's Framing)

Matt articulated a smart bet structure where every outcome moves him forward:

1. **YC accepts him** — funding and a cohort to build with. Best case.
2. **YC rejects him but the product works** — run it as an indie product. Space is already validated.
3. **The product doesn't take off** — he still has a shipped product in a space YC explicitly validated as important. Tells any hiring manager "this person understands the future of PM and can build." Better than any resume line.
4. **Regardless of all outcomes** — Second Brain keeps getting better because he used it to build something real.

### Solo Founder Concerns

Matt expressed that velocity pressure is overwhelming: "I'm not one of these hustle culture guys. I mean, I work hard, but I don't want to burn out." Claude reframed this — YC doesn't need hustle culture, they need someone who can ship something real and understand the problem deeply. Matt's advantages are taste and clarity, not velocity. The 30 days should be about making smart scope cuts, not grinding.

---

## 5. Defining the Product from Scratch

### Starting from the Output

Matt suggested starting backwards from the output. His take: the output doesn't need to be much. It could be:

- A prompt/description of a feature
- Maybe an auto-generated mockup or specs
- Lightweight enough that you then go into a coding tool (Cursor, Claude Code) and run Compound Engineering, G-Stack, or Superpowers from there

**Key product decision:** The output is the *input to the next step*, not the final deliverable. The product owns the decision (what to build and why), then hands off to the existing coding tool ecosystem for execution. It's not competing with Cursor or Claude Code — it sits upstream.

### Positioning Relative to Existing Tools

Matt raised an important competitive question: Compound Engineering, Superpowers, and G-Stack already do brainstorming within Claude Code. How does pmtxt fit?

**Distinction:** Those tools brainstorm about *implementation* — how to architect code, technical approaches, project structure. They operate inside the codebase. pmtxt operates *before* all of that — the question isn't "how should I build this feature" but "should I build this feature at all, and why." The input is customer data, market signals, business goals, competitive landscape — not code.

pmtxt sits upstream. Its output becomes the input to Cursor + Compound Engineering + whatever.

### The Context Layer and Why It Matters

Matt circled back to the .md/.txt files idea with more conviction. The structured context files (customer personas, stakeholders, revenue model, competitors, etc.) are the product's core. The system improves over time as this context gets richer. The dotmd connection makes sense — changes to context files *are* product decisions. The approval workflow (PR-style review) means the system can suggest "based on this new customer interview, I think your customer personas should be updated like this" and the PM approves or rejects.

**The context is the product.** It's the PM's accumulated product intelligence — structured, versioned, and alive. The AI call is "just prompting," but the value is in how the context is assembled, maintained, and applied.

### The "Just Prompting" Concern

Matt raised a valid skepticism: all of this is just prompting with good context and open-source tech. What's the moat?

Two answers discussed:

1. **Context management IS the product.** Same reason Cursor is valuable — it's "just prompting" with your repo in context, but the value is how it assembles that context automatically and invisibly. The defensibility comes from the data layer (context compounds and becomes hard to replicate), the workflow (fits into how PMs actually work), and integrations over time.
2. **The entire AI tooling wave is thin wrappers around LLM calls with smart context assembly.** The ones that win nail the UX and make context assembly invisible. The question is: can you make a PM open this and think "this tool understands my product"?

### Input Side

Ideally, the product would integrate with customer interviews, analytics, research tools (like Second Brain does). But for V1 in 30 days, integrations are a trap. The minimum viable input is manual: paste in a transcript, type a competitive insight, upload a CSV of feature requests. Build the reasoning engine first, pitch the integration story for the future.

---

## 6. Final Product Shape (as of end of session)

**What it is:** A system that helps PMs decide what to build next, grounded in real product context.

**How it works:**
- PM builds a structured knowledge base over time — customer personas, competitors, goals, constraints, revenue model
- PM feeds in signals — feature requests, interview notes, research (manual for V1)
- AI evaluates against full context, recommends what to build with clear, grounded reasoning
- Context gets richer and more accurate over time through use and governed updates (approval workflow for KB changes)

**What it outputs:** A feature description with rationale, grounded in the PM's actual data. Lightweight enough to hand off to Cursor/Claude Code as a starting point.

**What it doesn't do:** Write code, manage sprints, replace coding tools. It sits upstream of the build process.

**What makes it compound:** Every decision logged, every new input, every piece of feedback makes the next recommendation sharper. The knowledge base is the moat.

**Relationship to existing tools:** Upstream of Compound Engineering, G-Stack, Superpowers, Cursor, Claude Code. Those tools handle "how to build." This handles "what to build and why."

---

## 7. Advisory vs. Execution: The Gartner Prediction (April 4, afternoon session)

### Source

Gartner prediction (published April 2, 2026, surfaced via Matt's daily AI briefing): Over half of enterprises will abandon assistive/copilot-style AI tools by 2028 and shift to execution platforms where AI agents commit to workflow outcomes autonomously. Vendors that layer AI onto legacy applications face 80% margin compression by 2030.

### What This Means for pmtxt

The product shape defined in section 6 is still advisory. The PM reads a recommendation, decides whether to act, then manually takes it to a coding tool. Gartner is saying that model has a defined expiration — "product strategy that cannot articulate how it takes execution authority (not just advisory) has a defined expiration."

The version of pmtxt that aligns with this trajectory wouldn't just recommend what to build — it would **initiate execution**. Instead of "here's what you should build and why, good luck," it would be "here's what you should build and why, I've drafted the spec, hit approve and it's queued for your coding agent." One approval from the PM and the feature is being built.

### The PM's Evolving Role

This raises a fundamental question about who the customer is and what they do day-to-day. In this model, the PM shifts from doer to governor:

- **Setting the criteria** — defining goals, constraints, customer segments. This is the knowledge base — the PM defines the lens the system uses.
- **Governing decisions** — reviewing and approving/rejecting the system's recommendations. Not writing the spec, reviewing it. Not doing the analysis, checking it.
- **Feeding the system** — talking to customers, noticing market shifts, providing judgment that data alone can't capture.
- **Catching mistakes** — knowing when the system is wrong before bad features get shipped. Taste and experience — exactly what AI is worst at.

### Practical Resolution: Don't Build the Execution Layer, Build the Bridge

Matt's concern: building execution capability means rebuilding things that Cursor, Claude Code, and Compound Engineering already do well. The resolution: pmtxt doesn't need to build a coding agent. It needs to **trigger** one.

The execution bridge could be as simple as generating a spec in a format that coding agents already consume (e.g., a CLAUDE.md-compatible file dropped into a repo that kicks off a Claude Code session). The hard part isn't execution — it's the bridge between "decision made" and "execution started."

Matt's dotmd and NanoClaw experience is directly relevant here — he understands how these tools consume instruction files and how to trigger agents programmatically.

### Strategic Decision: Keep for YC Narrative, Don't Build for V1

The Gartner insight strengthens the YC pitch as a roadmap story: "Today, pmtxt helps PMs decide what to build. The roadmap closes the loop — one approval and the spec flows to your coding agent. The market is moving from advisory to autonomous execution, and pmtxt is designed for that transition."

But the V1 (30-day build for YC application) should remain advisory. A PM who gets a grounded, trustworthy recommendation — even if they manually take it to Cursor — is already better off than the status quo. That's enough to demo, validate, and get into YC. The execution layer is phase 2.

**Don't let a 2028 prediction paralyze an April 2026 product.**

---

## 8. Karpathy's LLM Wiki Pattern (April 4, evening session)

### Source

Andrej Karpathy tweet (April 2, 2026) and detailed gist (April 4, 2026, 1,066 GitHub stars in 2 days). Saved to Readwise — original tweet, follow-up tweet with gist link, community reaction thread, and the full gist.

### The Pattern

Three layers: **Raw sources** (articles, papers, images — immutable, LLM never modifies them). **The wiki** (LLM-generated markdown files — summaries, entity pages, concept pages, all interlinked. The LLM owns this layer entirely, you never write it). **The schema** (a CLAUDE.md-style file that tells the LLM how to maintain the wiki).

Three operations: **Ingest** (drop a new source in, LLM reads it, writes summary, updates index, updates 10-15 related wiki pages). **Query** (ask questions against the wiki — and importantly, file good answers back into the wiki so explorations compound). **Lint** (periodically health-check for contradictions, orphan pages, stale claims, missing cross-references).

Key insight: most people use LLMs as RAG — retrieve chunks at query time, re-derive knowledge from scratch every question. Karpathy's approach has the LLM **compile** knowledge into a persistent wiki once, then keep it current. The wiki is a compounding artifact. The cross-references are already there. The contradictions have already been flagged.

Karpathy's framing: "The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The LLM's job is everything else." He also called the concept an "idea file" — intentionally abstract so others' agents can build custom implementations.

### How This Maps to Second Brain

Matt is already doing a version of this, but less structured. The vault has briefings, summaries, project docs, intelligence output — all maintained by NanoClaw agents. But there's no explicit "raw → compiled wiki" separation. Daily briefings are more like logs than compiled knowledge. The weekly summary synthesizes, but creates a new dated file rather than updating persistent pages.

### How This Maps to pmtxt

pmtxt's knowledge base IS Karpathy's wiki layer, applied to product management. Customer interviews and feature requests are the raw sources. The structured MD files (customers, competitors, goals, revenue model) are the compiled wiki. The approval workflow is a governed version of Karpathy's ingest — the system proposes wiki updates and the PM approves.

The part Karpathy adds that the earlier pmtxt brainstorm didn't emphasize: **query answers should be filed back into the wiki.** When a PM asks "what should I build next?" and gets a good answer, that answer becomes part of the knowledge base. Explorations compound.

### Strategic Angle

Karpathy's gist went massively viral (1,066 stars, 195 forks in two days). The community is excited about the idea but almost nobody has built and used it daily. Matt has been running a version of this pattern for over a month with Second Brain. That operational experience is a genuine advantage for a YC application — "I've been living this pattern. I know what works, what breaks, and what the product needs to be."

### Practical Decision: Readwise Wiki

Rather than restructuring the entire vault, Matt decided to add a new `wiki/` directory compiled from Readwise saves. A weekly NanoClaw task would read recent saves, create/update wiki pages, and maintain an index. The agent decides what pages to create — no pre-defined categories. This is directly applicable to pmtxt (same ingest-compile-query pattern, applied to a PM's reading list) and serves as a dog-food test of the core mechanic. Added to backlog.

---

## 9. Open Questions for Next Session

- **UX:** What form does this take? CLI? Web app? Something else?
- **Onboarding:** How does a PM bootstrap the context/knowledge base?
- **Demo scope:** What's the smallest demo that shows the core loop working? (For both YC application and as a standalone product)
- **Differentiation from old pmtxt plan:** The 8-unit plan is being treated as brainstorm material only — what actually changes in the rethink?
- **Molding toward YC:** YC emphasized data ingestion (customer interviews, usage data), agent handoff, and team use. How much of that matters for V1 vs. future pitch?
- **Should the product be molded toward YC's description?** Decision: Yes, but not cynically — YC's RFS naturally aligns with the direction Matt was already heading. Focus on nailing the parts they explicitly care about.
- **Advisory vs. execution:** V1 stays advisory. But the execution bridge (spec → coding agent handoff) should be designed into the architecture from day one, even if not built yet. How does the output format need to look to make that bridge easy later?

---

## 10. References and Artifacts Mentioned

- **YC Requests for Startups page** — saved to Readwise (document ID: 01kmykr52828nx2g5gh954q04b)
- **Existing pmtxt project files:** `projects/pmtxt/2026-03-30-pmtxt-requirements.md`, `projects/pmtxt/2026-03-30-001-feat-pmtxt-v1-plan.md`, `projects/pmtxt/last30days-validation.md`
- **Second Brain** — Matt's personal knowledge management system (vault, daily briefings, weekly summaries, Readwise integration, last30days, NanoClaw)
- **Build workflow** — `projects/product/build-workflow.md`
- **dotmd** — related project for tracking AI instruction file changes, components reusable for pmtxt
- **Tools referenced:** Compound Engineering, Superpowers, G-Stack (Garry Tan), Cursor, Claude Code
- **Competitors identified in earlier validation:** Traycer, Motionode, Rakenne, Aligno
- **VC thesis on outcome-based AI products** — Matt couldn't remember the source (possibly A16Z, Sequoia, or Kleiner Perkins)
- **Gartner prediction (April 2, 2026)** — enterprise abandonment of assistive AI by 2028; shift to execution platforms; 80% margin compression for vendors layering AI onto legacy apps by 2030. Surfaced via Matt's daily AI briefing.
- **Karpathy LLM wiki pattern (April 2-4, 2026)** — tweet, follow-up with gist link, and detailed gist (github.com/karpathy/442a6bf...). All saved to Readwise. 1,066 GitHub stars, 195 forks in 2 days.
