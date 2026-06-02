---
created_at: 2026-04-16
last_updated: 2026-06-02
---

# Services-as-Software

> TLDR: The next trillion-dollar company will sell the work, not the tool — AI autopilots replace outsourced services by delivering outcomes directly, capturing the services budget (6x larger than software budgets) while compounding a data moat.

## Overview

Sequoia partner Julien Bek formalized a thesis gaining traction since ~2022: for every dollar spent on software, six are spent on services. AI models are now intelligent enough to sell outcomes directly to buyers, not just tools to professionals. A company might spend $10K/year on QuickBooks and $120K on an accountant to close the books. The next legendary company will just close the books.

## Copilot vs. Autopilot

Two models that look similar but behave differently underneath:

- **Copilot** — puts AI in the hands of a professional. The professional takes the output, carries the risk, owns the client relationship. Harvey sells to law firms. Rogo sells to investment banks.
- **Autopilot** — skips the professional and sells the outcome directly to the buyer. Crosby ships the NDA to the company that needs one. WithCoverage closes the insurance policy for the CFO.

The key asymmetry: a copilot company is in a permanent race against the model (every model upgrade threatens to turn the product into a feature). An autopilot company improves with every model upgrade — cost of delivery drops while customer price stays, widening margins and deepening the data moat.

The higher the intelligence-to-judgement ratio in a field, the sooner autopilots win.

## The Convergence

Today's judgement becomes tomorrow's intelligence. As AI systems accumulate proprietary data about what good judgement looks like in their domain, the frontier shifts. Copilots and autopilots converge — but starting position matters because it determines who can win customers now and begin compounding data.

## The Autopilot Playbook: Outsourcing as the Wedge

If a task is already outsourced, three things are true: (1) the company accepted external execution, (2) there's an existing budget line, (3) the buyer already purchases outcomes. Replacing an outsourcing contract is a vendor swap. Replacing headcount is a reorg.

**Playbook:** Start with the outsourced, intelligence-heavy task. Nail distribution. Expand toward insourced, judgement-heavy work as AI compounds.

## The Death of the Three-Act Playbook

The traditional enterprise software scaling playbook had three sequential acts: start with a **wedge** (a feature or niche made 10x better during a platform shift, scaling to $10–50M ARR over 3–5 years), expand into a **suite** of adjacent products to reach $200–500M ARR, then earn the right to **rebundle** as the platform and rip-and-replace the system of record underneath.

AI is compressing this sequence to near-zero. The cost of building software is dropping so fast that Acts I and II can be executed simultaneously rather than sequentially. The number of companies that have gone from ~$0 to $100M ARR in the past two years — Cursor, Cognition, Clay, Harvey, Sierra, Lovable — is evidence the timeline has collapsed [[source]](https://x.com/mikevernal).

This has direct implications for the wedge strategies discussed above. The outsourcing-as-wedge playbook remains sound for services-as-software companies entering a vertical — the buyer dynamics (existing budget, accepted external execution, outcome-based purchasing) still hold. But the *protective harbor* that a wedge once provided is shrinking. When competitors can build the full suite from day one, a narrow wedge that would have guaranteed 3–5 years of runway now buys months. The rational response: plan to build it all quickly, mostly from the start.

The shift revalues ambition over defensibility at the seed stage. The Anysphere (Cursor) case is instructive: at seed, building a full VS Code replacement seemed reckless when an extension would have been the "sensible" wedge. In hindsight, even replacing VS Code feels under-ambitious. For services-as-software founders, the equivalent question is whether to start with one outsourced task in one vertical or to go directly for the full service delivery platform.

## Opportunity Map (by vertical)

| Vertical | TAM | Intelligence Ratio | Key Players |
|----------|-----|-------------------|-------------|
| Insurance brokerage | $140-200B | Very high | WithCoverage, Harper |
| Accounting & audit | $50-80B (US outsourced) | High | Rillet, Basis |
| Healthcare revenue cycle | $50-80B | High (coding = rules) | Anterior |
| Claims adjusting | $50-80B | High | Pace, Strala |
| Tax advisory | $30-35B | 80-90% intelligence | TaxGPT, Skalar, Ravical |
| Legal (transactional) | $20-25B | High | Harvey, Crosby, Lawhive |
| IT managed services | $100B+ | Very high (repetitive) | Edra, Serval |
| Supply chain / procurement | $200B+ | Medium-high | Magentic, AskLio, Tacto |
| Recruitment & staffing | $200B+ | Mixed | Juicebox, Mercor, Jack & Jill |
| Management consulting | $300-400B | Mostly judgement | TBD |

## Building a Services-as-Software Business (ColdIQ Playbook)

Alex Vacca (ColdIQ, $7M+ ARR, bootstrapped, 400+ B2B clients) has been operating this model since 2022 — before Sequoia named it.

**Six-step playbook:**

1. **Pick one outsourced line item in one industry.** Three qualifying questions: Is it already outsourced? Is it mostly intelligence work? Is the services spend larger than software spend?
2. **Land first clients yourself.** Charge a retainer floor you want to anchor to in three years. Record every sales call.
3. **Do the work manually and document every step.** Four artifacts from day one: markdown SOPs, Looms, per-client decision logs, and a failure file. The failure file becomes the most valuable asset in year one.
4. **Price like a service, report like a product.** Setup fee + monthly retainer tied to outcome metric + performance bonus. Live dashboards from day one. "Retention starts looking like SaaS when the client experience looks like SaaS."
5. **Replace yourself on delivery before scaling anything else.** Hire order: delivery operator → technical automator → head of delivery. No marketers or salespeople until delivery runs without the founder.
6. **Compound the data moat before the software.** Save every input, output, reasoning, and objection. Three years of this creates an asset competitors can't bootstrap.

**The key insight:** "Judgement turns into intelligence as your dataset grows, and three years of running the work gives you an asset no pure-SaaS competitor can buy, license, or ship around."

## The Agent-First SaaS Disruption (Greg Isenberg)

Greg Isenberg predicts $1T up for grabs across 10,000+ niches as the agent-first wave reshapes enterprise software. The catalyst: Salesforce going "headless" (entire platform exposed as APIs, MCP, and CLI).

**How it plays out:**
1. Every SaaS company follows Salesforce and goes headless within 18 months
2. "Agent-native" startups emerge that treat Salesforce, HubSpot, Workday as dumb backends — the startup IS the agent, the SaaS is just the database
3. The entire consulting/services industry around enterprise SaaS gets compressed into software — the agent replaces the implementation team
4. Outcome-based pricing becomes default — nobody pays per seat when the "seat" is an agent making 10,000 API calls a minute
5. Winning founders are ex-operators who understand a vertical workflow cold — "knowing that a property manager spends 14 hours a week on lease renewals is the insight worth $100M"
6. Distribution becomes the moat — when anyone can wire agents to APIs, the company with the audience and the brand wins. "Media + agents is the new SaaS"

**The $1B agent-native company** in each vertical will look nothing like the SaaS it replaced: smaller team, higher margins, no implementation cost, no churn from bad UX because there is no UX.

**The shift:** The last wave rewarded people who built pretty interfaces on top of ugly data. This wave rewards people who build smart agents on top of exposed APIs — or who build the APIs themselves.

This maps directly to the autopilot thesis: outcome-based pricing + no human in the loop + vertical workflow mastery = the services-as-software endgame at scale. See also [Vertical AI](vertical-ai.md) for the 1-1-1 playbook on executing this at the individual operator level.

## The Managed Growth Loop Model (Eric Siu)

Eric Siu argues agencies should stop selling labor — even AI-augmented labor — and instead sell **managed growth loops**: end-to-end business processes that repeatedly turn inputs into outcomes and get smarter from feedback.

The evolution of agency value units: hours → deliverables → expertise → **loops**.

A loop is not an agent. An agent is a worker *inside* a loop. A paid creative loop might contain a research agent, a creative agent, a QA agent, an analytics agent, and a narrative agent — but individually they produce nothing. The loop is where value lives. Companies buying a "zoo of agents" without an operating system get AI theater.

**Three-layer architecture:**

1. **Loops** — the business processes that produce outcomes
2. **Agents** — workers inside loops handling repeatable execution
3. **Humans** — directing agents, judging output, reading weak signals, making decisions, earning client trust, and improving workflows

**The seven loops:**

1. **Raw materials** — continuously collect competitive intelligence, sales call transcripts, customer objections, product data, audience signals. Not a one-time onboarding task; stale inputs produce stale marketing.
2. **Creative testing** — produce 100 variants, kill 90 fast, learn from 10, compound the next batch. Human input is taste; machine work is variant generation, QA, and performance readouts.
3. **Demand capture** — SEO is becoming search + AI answers + social discovery + community validation. Turn demand signals into briefs, pages, assets.
4. **Conversion** — watch every step between attention and action. Find where momentum dies, not where channel metrics look good.
5. **Client narrative** — replace "expensive therapy" reporting with: what changed, why it matters, what we learned, what's next, what needs approval.
6. **Sales enablement** — read sales calls, surface recurring objections, create proof and follow-up assets that shorten the path to close.
7. **Learning** — capture winning hooks, losing angles, offer patterns, creative fatigue signals, QA failures, workflow improvements. Feed them back into skills, agents, and future client work.

The learning loop is the moat. Every client makes the system smarter; clients buy accumulated learning, not people. This echoes the ColdIQ playbook's emphasis on compounding the data moat before building the software.

**Codified expertise** is the mechanism that makes loops repeatable. "Skill files" encode institutional knowledge — what to do, what good looks like, what to avoid — so agents repeat the best version of a workflow rather than improvising. Without codification, agents hallucinate process; with it, agencies compound. The core principle: labor resets every time; infrastructure compounds.

## System of Record → System of Intelligence

a16z frames the same disruption through a different lens: the CRM isn't dying — it's being demoted. The analogy is Facebook's evolution. The friend graph was once the valuable layer; then the news feed turned it into "just one of many inputs" to the algorithm. The same inversion is happening to enterprise systems of record.

Salesforce and HubSpot still own the database, and that database remains sticky — but AI agents treat it as infrastructure, one data source among many. An orchestration layer pulls signals simultaneously from the CRM, calendar, shared inbox, call recordings, Slack, enrichment APIs, billing, and product telemetry, synthesizes them, and surfaces a prioritized feed to the rep. The opinionated UI on top of the CRM becomes legacy furniture, like a lovingly crafted Facebook profile page.

**Switching costs migrate upward.** In the software era, gravity came from data accumulation — every piece of sales context had to live in one place because humans could only look in one place. In the AI era, gravity comes from orchestration. "All of our customer data is in Salesforce" gives way to "all of our workflows, reasoning, and institutional context live in our AI layer." [[source]](https://www.a16z.news/p/from-system-of-record-to-system-of)

Counter-intuitively, CRM usage has actually *risen* since AI adoption — agents writing structured notes back into the system give reps fresh reason to consult it, because the data is dramatically richer [[source]](https://www.a16z.news/p/from-system-of-record-to-system-of). But this enrichment loop strengthens the intelligence layer's position, not the CRM's. The more agents read from and write to the system of record, the more indispensable the orchestration layer becomes.

Incumbents recognize the threat: Salesforce has launched API-first / headless offerings and acquired agentic startups in its ecosystem (Qualified, Momentum). But the domain-specific work between the foundation model and the customer — orchestrating context across dozens of systems, encoding actual GTM logic, handling permissions and compliance — is where the new application layer is being built. That work is the new surface area for services-as-software companies.

GTM software has historically been 5–10% of total GTM spending; the rest is payroll. AI expands what software can charge for by delivering outcomes that used to require labor — the total pie grows rather than the labor budget shrinking. Reps using AI tools hit quota at noticeably higher rates, so companies spend *more* on people, not less.

## When Software Goes Headless: The Defensibility Shift

Salesforce's "headless" announcement — exposing its platform as APIs for agent consumption rather than human interaction — crystallizes a deeper question: if you strip away the UI and expose the database, what differentiates a system of record from a Postgres instance with a well-designed schema? [[source]](https://x.com/seamble/status/1927893610047545700)

**What fades.** The historical defensibility of systems of record rested heavily on human-centric factors: frequency of access (daily use creates muscle memory), read-write patterns (bidirectional data flow makes cutover dangerous), and UI-driven data hygiene (the interface enforced shared vocabulary — Leads, Opportunities, Accounts — and made reps enter data they otherwise wouldn't). Agents neutralize all of these. They don't form habits, don't need training, and don't care about interface design.

**What persists and deepens.** Three legacy factors survive the transition:

- **Undocumented SOPs** — The institutional logic encoded in workflow rules (enterprise deals over $100K need VP approval, EMEA deals require privacy review, quarter-end discounts can bypass finance) is exactly what agents need to operate correctly. This context doesn't export cleanly. However, as agents replace more labor and context-capture improves, this advantage erodes over time.
- **Connectivity** — The number of internal systems and external stakeholders (auditors, regulators, partners) depending on the SoR. This factor *extends* in the agentic era: a CRM agent must stitch together data across sales, billing, and customer success. If the platform mediates agent-to-agent transactions across multiple organizations, the dependency deepens further.
- **Compliance-critical data** — Payroll, accounting, and HR data require a legally defensible source of truth with strict access controls. In a fully agentic world, the hardest unsolved problem is: which agents are authorized to do what, on whose behalf, with what auditability? A system of record that becomes the identity and permissioning layer for agent interactions has a structural role that's genuinely hard to displace.

**New defensibility factors** for AI-native builders:

1. **Proprietary data generation.** The defensible data is not what you import — it's what your product uniquely causes to exist. Observed behavior, response rates, timing patterns, process outcomes, benchmarks, exception patterns, and agent performance traces. The data *is* the context now.
2. **Action-layer ownership.** Storing the record was enough in the old world. In the new world, defensibility shifts toward products that close the loop: take the action, capture the outcome, use that feedback to improve future decisions. Products inside execution generate unique data, improve with use, and become harder to remove without breaking the workflow.
3. **Real-world execution.** Software businesses connected to field operations, logistics, fulfillment, or payments have a different kind of defensibility than pure SaaS. They don't just store the record or recommend an action — they dispatch people, move goods, or complete the service.
4. **Network effects across parties.** Historically weak in SoRs (the software was internal), but in an agentic world, if the system mediates recurring multi-party interactions — buyers and sellers, employers and employees, companies and auditors — each additional participant makes the network more useful. The product becomes coordination infrastructure for the market itself.
5. **Buyer technical capability.** In vertical end markets where buyers lack internal engineering resources, the odds of DIY (building your own database, workflow logic, agent stack, and governance layer) remain low. Cost shifts from licensing to implementation and maintenance complexity.

**The 80/20 split.** AI lowers the cost of recreating the first 80% of a system of record. The remaining 20% — exceptions, approvals, compliance requirements, and edge-case workflows — is what separates a useful wedge from a true replacement. Incumbents will fight back by making APIs painful, gated, incomplete, or economically unattractive. But as extraction tools and computer-using agents improve, these barriers weaken.

**Agentic ontology.** Incumbent schemas were built for dashboards and human workflow — opportunities, tickets, candidates. Agentic schemas need to capture reasoning, actions, state tracking, exception handling, delegation, and coordination across systems. The native object model shifts from workflow artifacts to tasks, intents, threads, policies, and outcomes. Similarly, permissioning evolves from managing human roles to governing which agents can act, through what policy, with what approvals and audit trail.

This maps directly to the services-as-software opportunity: the next generation of systems of record won't just log human work — they'll capture context, initiate work, and record the data exhaust. The most interesting businesses will extend into real-world execution and sit between multiple parties, mixing business models and making the traditional data layer just one component of a larger services delivery platform.

## Agentic Commerce: When Agents Become the Customer

Stripe Sessions 2026 surfaced a further evolution: agents are not just delivering services — they are becoming transacting parties. Stripe processes ~2% of global GDP ($1.9T in annual payment volume across 5M+ businesses), and 86% of the Forbes AI 50 use its rails. Its data shows the AI economy breaking out: AI-native companies on Stripe grew 120% in 2025 and 575% year-to-date in 2026 [[source]](https://x.com/gaofei_work/status/1926455987571527782). Agent traffic reading Stripe documentation grew roughly tenfold in 2025; at current rates, agents will read more Stripe docs than humans by year-end.

The shift from human commerce to agent commerce introduces dynamics that extend the services-as-software thesis in several directions:

**Micropayments become viable.** Humans are poor at extremely granular purchasing decisions — Spotify replaced per-song pricing with a flat $9.99/mo because nobody wants to decide if a track is worth 15 cents. Agents carry no cognitive burden. Business models that failed because of human friction (pay-per-article, per-query, per-dataset) may suddenly work when the buyer is an agent. Stripe demonstrated streaming payments at sub-cent granularity: an application charging $3/M tokens settled via thousands of micropayments on the Tempo blockchain, each worth one three-thousandth of a cent — a transaction size no credit card, ACH, UPI, or Pix system can handle.

**Payment shifts from moment to strategy.** A human purchase is discrete — walk up, swipe, done. Agent consumption is continuous: a user sets rules ("spend no more than $50 on groceries this week," "never authorize above $500 automatically") and the agent spends autonomously within that framework. This maps to the autopilot model: the agent delivers the outcome within a policy envelope rather than asking for approval at each step.

**Merchants must serve agents, not just humans.** Jeff Weinstein (Stripe) frames it simply: treat an agent like the best programmer you know. It wants structured data, precise logistics information, and the ability to complete a transaction in as few steps as possible. The services-as-software company that exposes clean APIs and machine-readable pricing wins agent distribution; the one that presents "join the waitlist" or "contact sales" gets skipped instantly.

**Protocols as coordination infrastructure.** Stripe launched or joined several protocols to enable agent commerce: the Machine Payments Protocol (MPP) lets agents discover and complete payments over HTTP with zero configuration; the Universal Commerce Protocol (UCP), initiated by Shopify and joined by Meta, Amazon, Salesforce, and Microsoft, standardizes cross-platform commerce so agents can transact across ecosystems without fragmentation. These protocols lower the coordination costs that Coase's theory predicts will shrink firm size — and Stripe's John Collison invoked Coase directly: when agents handle discovery, integration, and payment, external coordination becomes cheaper than internal headcount, enabling one-person companies with real revenue.

**Compute is the new cash.** AI companies face fraud patterns fundamentally different from traditional SaaS. One in six AI company sign-ups involves multi-account abuse to harvest free quotas. For one Stripe partner, the token cost of acquiring a paying customer exceeded $500 because 19 of every 25 free trials were fraudulent [[source]](https://x.com/gaofei_work/status/1926455987571527782). Unlike legacy SaaS where abuse has near-zero marginal cost, every stolen inference call is real money. This creates a dilemma: shutting down free tiers stops fraud but kills the self-serve growth channel that agents increasingly use to discover services. Stripe's answer is Radar, its shared fraud network across 5M businesses — but the deeper implication for services-as-software builders is that usage-based pricing requires robust identity and metering infrastructure from day one.

Counterintuitively, agent commerce may prove safer than human web shopping. Human fraud detection relies on behavioral inference (dwell time, click paths). Agent transactions can be programmatically authenticated with tokenized credentials, biometric authorization, transaction limits, and merchant whitelists — shifting the trust mechanism from inference to confirmation.

## Connections

- [Business Moats in AI](../concepts/business-moats-in-ai.md) — The data moat pattern: proprietary operational data from running the work
- [Vertical AI](vertical-ai.md) — Harvey's trajectory illustrates the copilot-to-autopilot transition
- [AI Startup Distribution](ai-startup-distribution.md) — Distribution strategies for services-as-software companies
- [AI Organization Design](ai-organization-design.md) — Organizational implications of autopilot services

## Sources

- "Services: The New Software" — Julien Bek, Sequoia ([link](https://sequoiacap.com/article/services-the-new-software/))
- "How to Build Services-as-Software Business" — Alex Vacca ([link](https://x.com/alexvacca))
- "$1T up for grabs for agent-first startups" — Greg Isenberg (tweet, Apr 2026) ([link](https://x.com/gregisenberg))
- "From 'System of Record' to 'System of Intelligence'" — Gio Ahern, Steph Zhang, Alex Immerman, a16z ([link](https://www.a16z.news/p/from-system-of-record-to-system-of)) — CRM-to-intelligence-layer inversion; orchestration as the new gravity well; GTM TAM expansion
- "Is Software Losing Its Head?" — Seema Amble, a16z ([link](https://x.com/seamble/status/1927893610047545700)) — Headless SoR defensibility shift; historical vs. agentic stickiness factors; proprietary data, action-layer ownership, and network effects as new moats
- "The next $1T company… Services-as-software (how to do it)" — Eric Siu ([link](https://x.com/ericosiu/status/2052091708826063284/)) — Managed growth loops framework; seven loops for agency transformation; codified expertise as compounding infrastructure
- "The Death of the Three-Act Playbook" — Mike Vernal ([link](https://x.com/mikevernal)) — AI collapses the traditional wedge → suite → platform scaling sequence; ambition over defensibility at seed stage; Cursor as case study for skipping the wedge
- "What I Learned About AI Economics at Stripe Sessions 2026" — Gao Fei — Agentic commerce data from Stripe ($1.9T volume, 5M businesses); micropayments and streaming payments via Tempo blockchain; MPP and UCP protocols; compute-as-cash fraud patterns; Coasean argument for agent-enabled solopreneurship
