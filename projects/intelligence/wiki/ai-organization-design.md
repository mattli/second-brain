---
created_at: 2026-04-05
last_updated: 2026-04-09
---

# AI Organization Design

> TLDR: Block (Jack Dorsey) proposes replacing corporate hierarchy with an "intelligence layer" — a company organized as a mini-AGI where AI handles coordination that previously required layers of management, enabled by a "world model" of operations and customer data.

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

## The Intelligence Thesis

When the intelligence layer can't compose a solution because a capability doesn't exist, that failure signal IS the future roadmap. "The traditional roadmap, where product managers hypothesize about what to build next, is any company's ultimate limiting factor."

## Small Teams + Agents

Peter Yang (PM at Roblox, a16z Show): "Instead of having like a 10 person product team, you have like a two or three person product team and you just have a bunch of agents help you." The prediction: the shape of the economy shifts from concentrated large companies to more solopreneurs and small teams. AI handles the coordination overhead that previously required headcount.

The counter-view (from the same conversation): getting to 100% automation of any job function is "really rare." Almost every AI product provides "dramatic lift" but can't do the last 10%. The efficiency gain may show up as "European-style 4-day work weeks" or "companies getting twice as productive" rather than mass job elimination.

[DHH](dhh.md) reinforces this from practice: at 37signals, "you actually go slower if you pour a bunch of people into a direction that is uncertain." AI lets tiny teams prototype faster, expanding what's feasible without expanding headcount.

## Broader Implications

Marc Andreessen's synthesis on AI + domains: "Domains with lots of edge cases = difficult for error-prone people. Such domains = where AI agents will do best."

## Sources

- "From Hierarchy to Intelligence" — Jack Dorsey / Block (tweet, Mar 2026)
- "Thesis: the problem with AI working in every domain..." — Marc Andreessen (tweet)
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang / a16z Show (video, Apr 2026)
