---
created_at: 2026-04-05
last_updated: 2026-04-20
---

# AI Organization Design

> TLDR: Block (Jack Dorsey) proposes replacing corporate hierarchy with an "intelligence layer" — a company organized as a mini-AGI where AI handles coordination that previously required layers of management, enabled by a "world model" of operations and customer data. Endorsed by Sequoia (Roelof Botha): "speed is the best predictor of start-up success."

## Overview

Block's "From Hierarchy to Intelligence" essay (Jack Dorsey, Sequoia-endorsed) is the most ambitious articulation yet of how AI might restructure organizations. The argument: hierarchy exists because humans are the only coordination mechanism available. AI changes that.

## Historical Context

The essay traces 2,000 years of organizational evolution:
- **Roman Army** — Nested hierarchy (8 → 80 → 480 → 5,000) as an information routing protocol built around span of control
- **Prussian General Staff** (post-1806) — Created middle management: officers whose job was to plan, process information, coordinate — "support incompetent generals"
- **American railroads** (1840s-50s) — West Point engineers brought military org thinking to business. First org chart (Daniel McCallum, 1856)
- **Frederick Taylor** — Scientific management optimized work within the hierarchy
- **Manhattan Project** — First real stress test of cross-functional coordination
- **McKinsey matrix** (1959) — Combined functional specialties with divisional units
- **Modern experiments** — Spotify squads, Zappos holacracy, Valve flat structure. All reverted toward hierarchy at scale.

The constraint is unchanged: narrowing span of control means adding layers, but more layers means slower information flow.

## Block's Model

**Two world models:**
1. **Company world model** — How the company understands its own operations, performance, priorities. Remote-first work creates machine-readable artifacts. AI maintains this picture continuously, replacing what managers used to carry.
2. **Customer world model** — Per-customer, per-merchant understanding built from transaction data (both sides: Cash App buyers + Square sellers). "Money is the most honest signal in the world."

**Four things to build:**
1. **Capabilities** — Atomic financial primitives (payments, lending, card issuance). No UIs of their own. Hard to acquire, some have network effects and regulatory permission.
2. **World model** — Company + customer sides. Starts with raw transaction data, evolves toward causal and predictive models.
3. **Intelligence layer** — Composes capabilities into solutions for specific customers at specific moments, proactively. No product manager decides to build each solution.
4. **Interfaces** — Delivery surfaces (Square, Cash App, Afterpay). Important but not where value is created.

**Three roles replace traditional hierarchy:**
- **ICs** — Deep specialists building capabilities, model, intelligence, interfaces. World model provides context a manager used to provide.
- **DRIs** — Own specific cross-cutting problems for ~90 days with authority to pull resources across teams.
- **Player-coaches** — Combine building with developing people. Replace managers whose primary job was information routing.

"There is no need for a permanent middle management layer."

## The Intelligence Layer in Action

The intelligence layer composes capabilities into solutions for specific customers at specific moments, proactively. Two examples from the Sequoia essay:

- A restaurant's cash flow is tightening ahead of a seasonal dip the model has seen before. The intelligence layer composes a short-term loan from the lending capability, adjusts the repayment schedule using the payments capability, and surfaces it to the merchant *before they even think to look for financing.*
- A Cash App user's spending pattern shifts in a way the model associates with a move to a new city. The intelligence layer composes a new direct deposit setup, a Cash App Card with boosted categories for their new neighborhood, and a savings goal calibrated to their updated income.

No product manager decided to build either solution. The capabilities existed. The intelligence layer recognized the moment and composed them.

When the intelligence layer tries to compose a solution and can't because a capability doesn't exist, that failure signal IS the future roadmap. "The traditional roadmap, where product managers hypothesize about what to build next, is any company's ultimate limiting factor."

## People at the Edge

In a conventional company, intelligence is spread throughout the people and the hierarchy routes it. In Block's model, the intelligence lives in the system. The people are on the *edge* — where the intelligence makes contact with reality.

People at the edge do what the model can't:
- **Reach** into places the model can't go yet
- **Sense** things the model can't perceive: intuition, cultural context, trust dynamics, "the feeling in a room"
- **Decide** what the model shouldn't decide alone: ethical calls, novel situations, high-stakes moments where the cost of being wrong is existential

"A world model that can't touch the world is just a database." But the edge doesn't need layers of management to coordinate it — the world model gives every person the context they need to act without waiting for information to travel up and down a chain of command.

The fundamental question for any company: "What does your company understand that is genuinely hard to understand, and is that understanding getting deeper every day?" If the answer is nothing, AI is just a cost optimization story. If the answer is deep, AI reveals what the company actually is.

## Small Teams + Agents

Peter Yang (PM at Roblox, a16z Show): "Instead of having like a 10 person product team, you have like a two or three person product team and you just have a bunch of agents help you." The prediction: the shape of the economy shifts from concentrated large companies to more solopreneurs and small teams. AI handles the coordination overhead that previously required headcount.

The counter-view (from the same conversation): getting to 100% automation of any job function is "really rare." Almost every AI product provides "dramatic lift" but can't do the last 10%. The efficiency gain may show up as "European-style 4-day work weeks" or "companies getting twice as productive" rather than mass job elimination.

[DHH](../people/dhh.md) reinforces this from practice: at 37signals, "you actually go slower if you pour a bunch of people into a direction that is uncertain." AI lets tiny teams prototype faster, expanding what's feasible without expanding headcount.

## Broader Implications

Marc Andreessen's synthesis on AI + domains: "Domains with lots of edge cases = difficult for error-prone people. Such domains = where AI agents will do best."

## Architect Mode: The Post-Founder Mode Framework

Ayman Al-Abdullah (Apr 2026, ex-CEO AppSumo) argues that Paul Graham's "Founder Mode" is already obsolete — replaced by "Architect Mode," the leadership framework for the intelligence era.

**Three eras of company building:**
1. **Manager Mode** (pre-2024) — Hire professionals, delegate, trust the process. Worked when execution was the bottleneck.
2. **Founder Mode** (2024-2025) — Paul Graham's corrective: founders should stay in the details, skip-level, maintain direct involvement. Worked when vision and speed mattered more than scale.
3. **Architect Mode** (2026+) — The founder doesn't do the work OR manage the people doing the work. The founder designs the system — the intelligence layer — that does the work. "You're not the player. You're not the coach. You're the architect of the stadium."

**The CEO's three jobs in Architect Mode:**
- **Aim** — Set direction with clarity and conviction. "The scarce resource is no longer information. It is conviction." When AI can analyze any dataset and generate any strategy deck, the differentiator is the founder's willingness to commit to a direction.
- **Army** — Build the team, but a fundamentally different team. Fewer people, higher leverage. Each person operates with AI agents as force multipliers. Hiring for judgment and taste, not execution capacity.
- **Assets** — Build compounding advantages: proprietary data, customer relationships, regulatory positioning, brand trust. These are the inputs the intelligence layer needs to outperform competitors running on the same models.

**The compounding data moat:** In Architect Mode, every customer interaction generates data that improves the intelligence layer, which improves the next interaction. The company's competitive advantage compounds automatically — but only if the architect designed the system to capture and learn from its own operations. This mirrors the [services-as-software](services-as-software.md) thesis: the data moat comes from running the work, not from building the tool.

**Key contrast with Block's model:** Block's "From Hierarchy to Intelligence" describes the organizational *structure* (world model + intelligence layer + capabilities). Architect Mode describes the *leadership posture* — what the CEO actually does all day when the intelligence layer handles coordination. They're complementary: Block answers "what does the company look like?" and Al-Abdullah answers "what does the CEO do?"

## Sources

- "From Hierarchy to Intelligence" — Jack Dorsey / Block (tweet, Mar 2026) ([link](https://x.com/jack/status/2039003879841362278/?s=12&rw_tt_thread=True))
- "From Hierarchy to Intelligence" — Roelof Botha / Sequoia (article, Apr 2026) — Full Sequoia endorsement with historical context and "edge" framework
- "Thesis: the problem with AI working in every domain..." — Marc Andreessen (tweet) ([link](https://x.com/pmarca/status/2038350516875595924/?s=12&rw_tt_thread=True))
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang / a16z Show (video, Apr 2026) ([link](https://youtube.com/watch?v=UE8jx4dvlSQ&si=GjAYLtlY5pE380BK))
- "Founder Mode is dead. Long live Founder Mode." — Ayman Al-Abdullah (Apr 2026) ([link](https://x.com/aaboreal))
