---
created_at: 2026-04-16
last_updated: 2026-04-20
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

## Connections

- [Business Moats in AI](../concepts/business-moats-in-ai.md) — The data moat pattern: proprietary operational data from running the work
- [Vertical AI](vertical-ai.md) — Harvey's trajectory illustrates the copilot-to-autopilot transition
- [AI Startup Distribution](ai-startup-distribution.md) — Distribution strategies for services-as-software companies
- [AI Organization Design](ai-organization-design.md) — Organizational implications of autopilot services

## Sources

- "Services: The New Software" — Julien Bek, Sequoia ([link](https://sequoiacap.com/article/services-the-new-software/))
- "How to Build Services-as-Software Business" — Alex Vacca ([link](https://x.com/alexvacca))
- "$1T up for grabs for agent-first startups" — Greg Isenberg (tweet, Apr 2026) ([link](https://x.com/gregisenberg))
