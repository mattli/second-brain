---
created_at: 2026-04-05
last_updated: 2026-04-13
---

# Business Moats in AI

> TLDR: As AI commoditizes everything "hard to do," the only durable moats are things "hard to get" — compounding proprietary data, network effects, regulatory permission, capital at scale, and physical infrastructure. Time that can't be parallelized is the meta-moat.

## Overview

Michael Bloch's framework for defensibility in the AI era. The core filter: AI compresses the time it takes to DO things. It does not compress the time it takes for things to HAPPEN.

## The Five Moats

### 1. Compounding Proprietary Data
Not static datasets (those get synthesized or worked around). The moat is *living data*: proprietary information continuously generated through defensible operations. Example: Orchard AI mounts cameras on farm equipment tracking billions of fruit across multiple growing seasons. You can't replicate it by training a model on public data.

### 2. Network Effects
Every user makes the product more valuable for every other user. DoorDash: every driver → faster delivery, every restaurant → more choice, every customer → better economics. "Clone the app overnight. The drivers, restaurants, customers in ten thousand cities don't come with it." Cold start problem may get *harder* as AI makes it trivial to build competitors.

### 3. Regulatory Permission
Governments move at the speed of politics, not technology. Bank charters take years. FDA approval takes years. Surface area of regulation is *expanding* because higher AI capability → higher stakes. Example: Anduril needs procurement clearances and classified contracts.

### 4. Capital at Scale
The endgame is physical. Chip fabs cost $20B. Nuclear plants cost $10B. "There's a reason Elon is raising $75B even while saying money might not matter in 15 years." Capital access = institutional trust + track record + relationships built over decades.

### 5. Physical Infrastructure
Factories, power plants, battery networks, data centers. Example: Base Power deploying thousands of battery units across Texas homes while building own manufacturing. "You can design the system in a week with AI. You cannot manufacture, install, and interconnect thousands of units in a week."

## What's NOT a Moat Anymore

- **Workflow embeddedness** — Switching cost is really just engineering time in disguise
- **Ecosystem lock-in** — AI can rebuild integrations as fast as you describe them
- **Software scale** — Spreading engineering costs across millions of users stops mattering when engineering costs approach zero

These were moats against the scarcity of intelligence. "That's the one form of scarcity we know is ending."

## Open Questions

- **Trust as moat?** — When AI does more work, someone must be accountable. Institutions that bear liability might become more valuable.
- **Human attention as moat?** — When content creation cost drops to zero, brands that already hold attention may have the most compounding advantage.

## Two Paths for Software Companies

David George's framework (a16z, Apr 2026): the comfortable middle is over for software. Public markets have repriced the sector. Only two credible paths to durable equity value:

**Path 1 — Accelerate growth (+10pp revenue):** Build genuinely new AI-native products within 12-18 months. Not bolt-on copilots — products that move the total growth rate. Requires: four-person pods (collapse design/product/eng), 50% of R&D on net-new, token/consumption pricing (not seats), and finding the ~5 people in the org who will deliver 100x value.

**Path 2 — Rebuild for 40%+ true margins:** Including stock-based compensation as a real expense. Requires flattening management, killing committees, standardizing implementation, raising prices where you own the workflow. The Broadcom/VMware playbook: radical cost discipline + product simplification → 61% adjusted EBITDA.

**Key insight:** The new growth sits in tokens, consumption, automations, and machine-driven workflows. Seat-based revenue is where customers look to cut costs. "If you are not in the token path, you are not standing in the fastest-growing part of the budget."

## Token Price Discrimination

Anish Acharya's observation (Feb 2026): despite claims of model commoditization, consumers pay $200-300/month for ChatGPT Pro/Claude Max/Gemini Ultra, and 75% of public SaaS companies have *raised* prices since ChatGPT launched. Value of a token varies enormously: a token unlocking a drug design vs a weather query, despite similar generation costs. Per-token price discrimination may be as important a business model innovation as "renting software" was 15 years ago.

## Anthropic Growth Case Study

Anthropic's trajectory illustrates how moats compound in practice: $0 → $100M ARR (2023) → $1B (2024) → $19B+ (early 2026) — 10x year-over-year growth sustained across three years. Head of Growth: "Historically, we were very much the smallest, least well-funded player in this space. We didn't have the free cash flow or distribution of a Meta or Google. We didn't have the first mover advantage of an OpenAI."

Their internal growth program "CASH" (Claude Accelerated Sustainable Hypergrowth) uses Claude itself to automate growth experimentation. The meta-lesson: the product is its own growth engine when it's genuinely useful — "Claude is growing itself at this point." This echoes the token-based moat thesis: Anthropic's moat isn't software lock-in but compounding usage data, research capability, and the flywheel between model quality and adoption.

## The Enterprise Data Risk: "The Big Rug"

The inverse of the compounding data moat: what happens when enterprises feed their proprietary data into AI lab tools?

goodalexander's thesis (Apr 2026): AI labs are executing what he calls the largest vampire attack in corporate history. The mechanism: enterprises adopt closed-source AI tools (models, coding assistants, agents) for productivity gains, generating millions of interactions and workflows. Those interactions are training data. Labs use that training data to build models that eventually outcompete the enterprises that fed them.

*The arithmetic:* Productivity at major enterprises is growing at 1.2-1.5% YoY. Token consumption is growing 400%+. The productivity gains are real but modest. The data leakage is enormous. Enterprise AI is characterized mostly by "vibe coding and slop" — low-value output generated primarily to test tools, not to create durable IP. Meanwhile, the high-value workflows and edge cases are exactly what model providers need for the next training run.

*The trust architecture problem:* This is the flip side of the regulatory permission moat. Enterprises with the most valuable proprietary workflows — in law, finance, pharma, defense — are also the most exposed if their process data leaves the perimeter. The enterprises that can maintain genuine data sovereignty (on-prem deployments, air-gapped models, contractual data isolation) may command a structural advantage as this concern becomes mainstream.

*Counterargument:* Harvey AI's approach suggests a middle path — proprietary process data stored inside the firm, with models rented and rotated based on performance (their "Model Selector"). The moat becomes orchestration and workflow IP, not the model itself. The data moat is genuinely valuable only when you control both the data and the model training.

See also: [Vertical AI](../landscape/vertical-ai.md) for Harvey's model U-turn and how vertical AI companies are navigating this.

## The Perennial "What If Big Co Builds This?"

Andrew Chen's historical framing: every technology wave produces the same objection — "what if IBM builds this?" (1980), "what if Microsoft builds this?" (1995), "what if Google builds this?" (2010), "what if \<huge AI lab\> builds this?" (today). Reality: when these waves happen, new markets are so large there will be tens of thousands of new viable companies, hundreds of unicorns, and a few iconic generational companies. Big cos play a role but can never compete with the open market.

"Pessimists ask 'what if they build it.' Founders ask 'what if I build it?'"

## The Meta-Moat

"Time that can't be parallelized." Network density takes years of human adoption. Regulatory approval takes years of political process. Infrastructure takes years to build. Data takes years to compound. Capital relationships take decades to earn.

## Sources

- "The Only Moats That Matter" — Michael Bloch (tweet, Mar 2026) ([link](https://x.com/michaelxbloch/status/2038753872890778029/?rw_tt_thread=True))
- "There are only two paths left for software" — David George (a16z, Apr 2026) ([link](https://a16z.com/there-are-only-two-paths-left-for-software/))
- "Notes on AI Apps / Feb 2026" — Anish Acharya (tweet, Apr 2026) ([link](https://x.com/illscience/status/2023424880776228974/?s=12&rw_tt_thread=True))
- "Claude is growing itself at this point" — Head of Growth, Anthropic / Lenny's Podcast (video, Apr 2026) ([link](https://www.youtube.com/watch?v=k-H4nsOTuxU))
- "The Big Rug" — goodalexander (Apr 2026)
- "ok this startup is cool but..." — andrew chen (tweet, Apr 2026)
