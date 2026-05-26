---
created_at: 2026-04-16
last_updated: 2026-05-26
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
