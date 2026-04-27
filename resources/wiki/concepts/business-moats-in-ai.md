---
created_at: 2026-04-05
last_updated: 2026-04-27
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

## The Opinionated Perspective Moat

fintechjunkie's counterpoint to the pure-infrastructure moat thesis: when anyone can build your product in a weekend, the last real moat standing is **an opinionated perspective on the solution**.

"Being able to build and understanding the best way to solve a problem aren't remotely the same thing." Building is mechanical now. But having a genuinely informed opinion about the right inputs, workflows, and outputs takes years of pattern recognition and listening to customers.

Why opinions compound into defensibility:
- Great product people ship constantly, plugging holes before users report them — copying them is hitting a moving target while reading their old blog posts
- Over time, hooks build: memory that doesn't port, context about preferences, integration work and muscle memory, data that makes the product smarter for your specific use case
- These switching costs don't show up on any spreadsheet but are real

The new competitive landscape: "Your competition isn't only other startups, it's also your user deciding they could probably just do this themselves on a Saturday." In that world, only one thing matters: having a perspective worth paying for.

This aligns with the "taste as moat" observation from Ann Miura-Ko's AI-native company visits: "When execution is nearly free, taste becomes the moat."

## The Perennial "What If Big Co Builds This?"

Andrew Chen's historical framing: every technology wave produces the same objection — "what if IBM builds this?" (1980), "what if Microsoft builds this?" (1995), "what if Google builds this?" (2010), "what if \<huge AI lab\> builds this?" (today). Reality: when these waves happen, new markets are so large there will be tens of thousands of new viable companies, hundreds of unicorns, and a few iconic generational companies. Big cos play a role but can never compete with the open market.

"Pessimists ask 'what if they build it.' Founders ask 'what if I build it?'"

## The AI SaaS Squeeze (Tyler Tringas)

Tyler Tringas (Calm Fund) wrote a thesis in June 2025 (published Apr 2026) arguing AI-assisted coding is eroding the fundamental SaaS moat — and the predictions proved "very directionally correct," with effects faster and larger than expected.

**The core thesis:** SaaS's golden-era margins rested on one moat: it was hard to hire good developers and you needed lots of them. AI-assisted coding erodes this. As the difficulty and time to build shrink, fast-follow competition becomes dramatically easier. The result: **multiple compression** — SaaS valuations converging toward normal business multiples (5-9x profit vs. the historic 20x revenue).

**Evidence:** Public SaaS multiples returned to 2016-2017 levels (median ~6.7x ARR per SaaS Capital). Private acquisition offers are down significantly from 2022 peaks, with typical decent SaaS businesses seeing 4-6x revenue from non-strategic buyers. "Merely being a SaaS company is no longer a ticket to premium ARR multiples."

**The Red Queen effect:** Businesses may double revenue YoY but end up worth the same or less because the valuation multiple decreased over that time.

**Three headwinds:**
1. **Price pressure** — More competitors building faster and cheaper
2. **Customer overwhelm** — Buyers bombarded with AI pitches, slower to close, lower willingness to pay ("any day now I'll do this on my $20/mo ChatGPT subscription")
3. **LLM platform competition** — OpenAI, Anthropic, Google can release competitive vertical features on massive user bases

**The Fractal of AI Panic:** The Red Queen dynamic operates at every level simultaneously. Individual workers race to become AI-fluent before a colleague replicates them. Companies sprint to avoid being disrupted by leaner AI-native competitors. Public companies face activist investors and analyst pressure to show AI wins. The fractal cascades downward: board → CEO → direct reports → individual contributors. Each level runs so hard they have no bandwidth to notice the structural pattern — that they're competing on a dimension that is being commoditized, not a dimension where they can actually win.

**The Founder Playbook — 6 strategic responses:**

1. **Lean into AI** — Table stakes. Use AI for development and integrate it into the product. But alone, this won't protect against the headwinds.

2. **Expand and bundle** — Take more products through the "zero to good enough" phase using AI, sell as add-ons. Commoditize your complement. Every.to's approach: cross-bundling software with a paid media subscription.

3. **Micro-acquire the competition** — Multiple compression hits weakest performers hardest. Acquire smaller competitors at depressed multiples to drive growth. Especially effective for things with built-in distribution (plugins, Chrome extensions, newsletters).

4. **Sell solutions, not software** — The conventional wisdom flip. Use your own software, don't just sell it. Add done-for-you services at 5-20x the ARPU. "Customers would rather pay $300-500/mo for 'the books are done' than $30-50/mo for bookkeeping software." Blend humans and AI now; replace humans gradually as models improve.

5. **Consider exiting** — If an exit would be life-changing, take it seriously before multiple compression becomes consensus. "Get out of the business of *only* selling software as soon as possible."

6. **Ignore me** — Building a company isn't entirely about maximizing equity value. If you enjoy it and you're making money, carry on.

**Key insight on AI coding reality:** "Vibe coding is basically BS" — but acceleration for someone with programming skills is staggering. Work that required entire teams can now be done by one person running multiple AI agents in parallel. The project of making models all-purpose better is thorny, but models will keep getting phenomenally better at coding specifically.

**The conventional wisdom flip:** SaaS dogma said be hyper-specialized and avoid services revenue. Tringas argues the opposite: bundle aggressively, add services, cross-sell non-software products (community, media, events). The strategic responses that work are precisely those that traditional SaaS wisdom warned against.

## Niche Construction: Escaping the Commodity Race

The Red Queen hypothesis (Van Valen, 1973) explains a recurring pattern in evolution and competitive markets: when all competitors adopt the same fitness-improving advantage, nobody gains ground — they just run faster to stay in the same place. AI adoption in 2025–26 shows this dynamic clearly: every company deploys AI, announces productivity gains, and ends up in the same relative competitive position.

The winning move isn't to adopt the commodity fastest. It's **niche construction**: rather than adapting to your environment, you modify the environment in ways that shift the competitive rules in your favor. Organisms (and companies) that do this don't just survive the commodity wave — they define what the next competition is about.

Three historical examples from the BuccoCapital thesis:

- **Amazon vs. the internet:** While retailers optimized their websites and Google ad spend, Amazon asked: *What happens when digital distribution goes to zero?* They built physical warehouses, logistics networks, and last-mile delivery — a niche nobody could replicate quickly, and one that mattered precisely because the digital layer became commoditized. Amazon's website is still ugly; their moat is physical infrastructure.

- **GM (Alfred Sloan) vs. the Model T:** Ford made cars a commodity. Sloan asked: *If everyone can own a car, why not one that says something about you?* GM built laddered brands (Chevrolet → Pontiac → Oldsmobile → Buick → Cadillac), added annual model changes, and invented consumer auto financing. The niche: identity and aspiration layered on top of the commodity.

- **Toyota vs. mass production:** When Ford-style scaled production became the norm, American automakers optimized inside the existing paradigm. Toyota asked: *If scale is commoditized, what isn't?* They constructed a niche around waste elimination and quality control (the Toyota Production System) — winning on a dimension where their competitors had grown complacent.

The pattern in every case: the winner recognized when the critical input had been commoditized, stopped optimizing for that input, and invested heavily in a *different* scarce variable. The loser kept running the old race harder.

**Applied to AI:** Companies racing to adopt AI fastest are optimizing for intelligence as a scarce input. That input is becoming a commodity. The five durable moats above (data, network effects, regulatory permission, capital, physical infrastructure) are all things that *can't* be parallelized by AI and *can't* be commoditized quickly. Building those is the niche construction play. Optimizing AI token usage metrics and winning "most AI-native company" press releases is the Red Queen trap.

## The Meta-Moat

"Time that can't be parallelized." Network density takes years of human adoption. Regulatory approval takes years of political process. Infrastructure takes years to build. Data takes years to compound. Capital relationships take decades to earn.

## Sources

- "The Only Moats That Matter" — Michael Bloch (tweet, Mar 2026) ([link](https://x.com/michaelxbloch/status/2038753872890778029/?rw_tt_thread=True))
- "There are only two paths left for software" — David George (a16z, Apr 2026) ([link](https://a16z.com/there-are-only-two-paths-left-for-software/))
- "Notes on AI Apps / Feb 2026" — Anish Acharya (tweet, Apr 2026) ([link](https://x.com/illscience/status/2023424880776228974/?s=12&rw_tt_thread=True))
- "Claude is growing itself at this point" — Head of Growth, Anthropic / Lenny's Podcast (video, Apr 2026) ([link](https://www.youtube.com/watch?v=k-H4nsOTuxU))
- "The Big Rug" — goodalexander (Apr 2026)
- "ok this startup is cool but..." — andrew chen (tweet, Apr 2026)
- "The Last Moat Standing" — fintechjunkie (tweet, Apr 2026)
- "The AI-pilled compounding startup" — Ann Miura-Ko (tweet, Apr 2026)
- "The AI SaaS Squeeze" — Tyler Tringas (Calm Fund, Jun 2025 / published Apr 2026) ([link](https://x.com/tylertringas))
- "Running Faster to Go Nowhere: The AI Adoption Trap" — BuccoCapital / Educated Guess (Apr 2026) ([link](https://www.educatedguess.com)) — Red Queen dynamics in AI adoption, Fractal of AI Panic, niche construction historical case studies (Amazon, GM/Sloan, Toyota)
