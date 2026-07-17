---
created_at: 2026-04-05
last_updated: 2026-07-18
---



# AI Organization Design

> TLDR: Block (Jack Dorsey) proposes replacing corporate hierarchy with an "intelligence layer" — a company organized as a mini-AGI where AI handles coordination that previously required layers of management, enabled by a "world model" of operations and customer data. A YC Root Access talk extends the model with a concrete architecture: recursive self-improving AI loops (sensor → policy → tool → quality gate → learning) that get better overnight without human intervention. Sivulka (a16z) adds the management frame: agent workforces fail in the same ways human workforces fail — token waste mirrors headcount bloat, loops mirror meetings-about-meetings, and evals are the new OKRs.

## Recent Updates

- **2026-07-18:** Added Replit's self-driving company case study — 2.9x per-engineer output, cross-company agent adoption, continual learning system — to [Replit's Self-Driving Company](#replits-self-driving-company)
- **2026-07-17:** Added Kai-Fu Lee's CEO mandate thesis and activity-results gap to [Architect Mode](#architect-mode-the-post-founder-mode-framework), intelligence-scarcity capstone to [Historical Context](#historical-context)
- **2026-07-15:** Added Sivulka's token-workforce parallels to [The Token Workforce](#the-token-workforce) and evals-as-management to [Organizational Legibility](#organizational-legibility)

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

Kai-Fu Lee sharpens the underlying logic: organizations were designed to ration scarce intelligence. Expertise sat in departments, information moved through hierarchies, decisions waited for meetings, approvals, and handoffs. All of this was an organizational response to the fact that human intelligence — the most expensive input companies have ever purchased — was finite and unscalable. When intelligence becomes abundant and scalable through AI workers, the organizational structures built to ration it become the bottleneck, not the solution.

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

## Self-Improving Loops

A YC group partner (Root Access talk) argues that the real shift is not AI as a productivity co-pilot ("the old way of working with a more powerful engine") but reimagining a company as a set of recursive self-improving AI loops. Each loop has five layers:

1. **Sensor layer** — Inputs from the real world: customer emails, support tickets, code changes, cancellations, product telemetry
2. **Policy layer** — Decision rules: what the system can do autonomously, what requires human permission, what must be logged
3. **Tool layer** — Deterministic APIs the AI can call (query database, check calendar, update records)
4. **Quality gate** — Evaluative checks, safety filters, human review for high-risk actions
5. **Learning mechanism** — The system observes where it fails, feeds that signal back to the top, and improves

When every step runs with minimal human intervention, the system gets better while the team sleeps. The concrete example from YC: they built an internal agent that answers group partner queries by calling database tools. Simple co-pilot — last year's model. The step change came when they added a *monitoring agent* that watched every query across all YC employees, identified failures, diagnosed why (missing tool? wrong database view? stale index?), wrote the fix, submitted a merge request, had another agent review and deploy it. By the next morning, the same query succeeds.
This pattern generalizes: a product analytics loop that identifies funnel friction, researches best practices, runs A/B tests, picks winners, and deploys — then repeats. Or a customer feedback loop where an agent triages suggestions against the roadmap, writes code for approved changes, and ships them without human involvement.

## Organizational Legibility

Organizational legibility is the prerequisite for AI to do anything useful. The principle operates at two levels: the organization must be legible *to itself* (strategic clarity) before it can be legible *to AI* (data capture and structuring).

**Strategic clarity comes first.** Daniel Miessler argues that most companies' frustration with AI is actually an inability to describe what they want. AI is about execution, and it's powerless without clear instructions. Companies that thrive with AI can articulate their goals, metrics, strategies, projects, people, and costs — and crucially, those answers stay largely stable across quarters. Companies where these answers change every quarter are just "writing down whatever they think makes them look good." [[source]](https://danielmiessler.com/p/most-companies-arent-anywhere-near-ready-for-ai) This is not a technical maturity problem — it's a self-knowledge problem. A company that can't describe itself to a consultant can't describe itself to an AI either.

**Data capture extends legibility to AI.** For self-improving loops to work, the organization must be *legible* to AI — if something wasn't recorded, it didn't happen to the intelligence. YC's approach: every partner email is stored in the database, every Slack message and DM is captured, and they've been recording every office hour for several months.

Raw recordings aren't enough — 100,000 hours of audio can't fit in a context window. The data must be diarized and synthesized into structured, navigable knowledge. YC's example: Haj took 2,000 hours of recorded office hours from three months and regenerated the YC user manual over a weekend — a 150-page document "dramatically better than the existing user manual." Now it self-updates monthly: new advice is compared against the existing manual and either incorporated or discarded. The manual becomes a living, self-improving artifact that feeds into AI agents, giving them the combined wisdom of 16 YC partners.

**Recording as the default.** David Haber (a16z) argues that universal meeting recording has already happened as a bottom-up shift — not debated, just adopted — because the productivity advantages for both individuals and leaders are too large to resist. The key insight: you need to onboard AI like you would onboard employees. You don't hand a new hire a wiki and expect them to get up to speed — you invite them to meetings and let them learn through osmosis. Meetings are where culture resides, where expectations live, where edge-case handling gets done. AI operates the same way, except it can attend every meeting, reason over every interaction, and never get bored. Bridgewater's policy of recording everything looked eccentric for years; it turns out it was prescient. OpenAI now runs with essentially everything recorded, with agents standing in for senior leaders in meetings they can't attend. Granola, which sits in on a16z meetings, has better context on the firm's culture and investments than almost any other tool — because it's been in the room.

The default is flipping from "don't record unless you opt in" to "assume you're being recorded unless a meeting is explicitly designated otherwise." The deeper reason: the old principle already applies to text — never put anything in writing you wouldn't want made public. Meeting recording is the same principle, applied to conversation. Sensitive meetings (HR, legal) will get special designations, but the controls get retrofitted on top of widespread recording, not the other way around.

The principle: if an interaction produces an artifact that can self-improve, it's valuable. If it doesn't, it's disposable.

**[Evals](../tools/ai-evals.md) operationalize legibility.** Strategic clarity and data capture make the organization legible to AI, but evals are the mechanism that converts legibility into managed output. Without evals, token spend is unmanaged headcount — the AI equivalent of hiring without performance reviews. The real work of managing is turning fuzzy human processes into code, expressing the qualitative as quantitative. [[source]](https://www.a16z.news/p/the-next-ai-goldrush-tokens-loops)

## Voice as the New System of Record

The current enterprise system of record is structured data: CRM entries, tickets, docs. But the highest-value context lives in conversation — the nuance on a customer call, the real argument in a product review, the offhand comment in a leadership meeting that quietly changes the roadmap. LLMs are uniquely suited to taking unstructured voice data and making it structured, searchable, and queryable. A new category of enterprise software is emerging, organized around voice instead of text.

This creates a structural advantage for **verbal cultures** (Shopify, OpenAI) over **written cultures** (Stripe, Anthropic) — though not in the way you'd expect. Written cultures already capture most of their context by construction. The historical bottleneck for verbal cultures was that important context happened in conversation and then evaporated. When AI can attend every meeting and synthesize what happened, verbal culture finally scales. AI disproportionately enhances verbal cultures by eliminating their core weakness.

Recording also creates a decisive wedge between AI-native companies (where it's the obvious default) and incumbents that have to overcome inertia. The competitive cost of not recording — measured in forgone context for the intelligence layer — is enormous. Every recorded meeting makes the system smarter; both the bottom-up advantage (AI with full company context as a force multiplier for ICs) and the top-down advantage (executive oversight via AI present in meetings they can't attend) compound over time.

## Ephemeral Software, Durable Context

A corollary of organizational legibility: the *data and domain knowledge* are the valuable, durable layer. The software built on top is ephemeral. Internal dashboards and workflows can be one-shot generated with current models, used, and thrown away. When models improve in a month, regenerate the software from the original instructions and context.

This inverts the traditional hierarchy of value. Business context, skills definitions, and operational knowledge — what Block calls the "world model" — are the assets worth preserving. The code is disposable.

## Burn Tokens, Not Headcount

YC is seeing companies reach demo day with roughly 5x more revenue per employee than 18 months ago, a trend expected to continue through Series A and B. The constraint shifts from headcount to token usage. The speaker's rough heuristic: track who in the organization is "token-maxing" (experimenting aggressively with AI) and who isn't — not as a promotion metric (that gets gamed immediately), but as a signal for where to focus leadership attention.
## The Token Workforce

George Sivulka (a16z) inverts the standard narrative: AI didn't replace human labor — it created a new kind of workforce that's *more expensive* than humans on average. Token spend per employee at top firms now exceeds salary costs, and AI is creating more jobs than it eliminates. The core insight: agent workforces and human workforces fail in the same ways.

Seven parallels between the two:

1. **Tokenmaxxing = throwing bodies at the problem.** Most employees can't prompt effectively — maybe 1 in 100 can articulate a process clearly enough for an agent. The other 99 compensate with volume.
2. **[Loops](../tools/loop-engineering.md) = meetings about meetings.** Agents calling themselves to fix themselves because the task was never articulated cleanly. "You are spending tokens on spending tokens."
3. **Wasted tokens = headcount bloat.** Just as 80% of employees at mismanaged companies don't meaningfully impact the business, 80% of tokens today do nothing. Looping is the new empire building.
4. **100X tokens = 10X engineers.** For any given task, some amount of context can cut AI effort by orders of magnitude. Finding and scaling these high-leverage tokens is the management challenge. "Humans are cheaper than tokens on average, but good tokens are cheaper at scale. Management converts one into the other." [[source]](https://www.a16z.news/p/the-next-ai-goldrush-tokens-loops)
5. **Context hoarding = job security.** Employees resist teaching AI their knowledge. The people who hold the 100X tokens have the least incentive to surrender them. Meta's stock-owning employees are outraged at using employee context as training data — at a *tech company*. Tribal knowledge has been job security for centuries; AI is the first technology that asks workers to hand all of it over at once.
6. **[Evals](../tools/ai-evals.md) = OKRs.** Coding is the breakout AI use case because it has built-in evals — code runs or it doesn't. Broader adoption requires building evals for every domain. A firm's eval suite will become its most valuable resource, and no two firms will have the same one.
7. **AI transformation companies > neofirms.** The next trillion-dollar businesses won't eat existing services spend — they'll sell ongoing AI transformation to incumbents. Palantir isn't selling software; it's selling transformation. Encoding each firm's nuances into agents may become the largest economic task of the decade. There's a Jevons paradox: every use case adopted surfaces ten more, so transformation never ends.

## People at the Edge

In a conventional company, intelligence is spread throughout the people and the hierarchy routes it. In Block's model, the intelligence lives in the system. The people are on the *edge* — where the intelligence makes contact with reality.

People at the edge do what the model can't:
- **Reach** into places the model can't go yet — conferences, in-person conversations, physical environments
- **Sense** things the model can't perceive: intuition, cultural context, trust dynamics, "the feeling in a room"
- **Decide** what the model shouldn't decide alone: ethical calls, novel situations, high-stakes moments where the cost of being wrong is existential

The speaker's framing aligns: the "company brain" (all data, emails, DMs, skills, know-how) sits in the center, and humans live around the edge, interfacing with reality. Sales conversations, co-founder breakups, and high-emotion moments where you really want a human — that's where people fit for the foreseeable future.
"A world model that can't touch the world is just a database." But the edge doesn't need layers of management to coordinate it — the world model gives every person the context they need to act without waiting for information to travel up and down a chain of command.

The fundamental question for any company: "What does your company understand that is genuinely hard to understand, and is that understanding getting deeper every day?" If the answer is nothing, AI is just a cost optimization story. If the answer is deep, AI reveals what the company actually is.

## Small Teams + Agents

Peter Yang (PM at Roblox, a16z Show): "Instead of having like a 10 person product team, you have like a two or three person product team and you just have a bunch of agents help you." The prediction: the shape of the economy shifts from concentrated large companies to more solopreneurs and small teams. AI handles the coordination overhead that previously required headcount.

The counter-view (from the same conversation): getting to 100% automation of any job function is "really rare." Almost every AI product provides "dramatic lift" but can't do the last 10%. The efficiency gain may show up as "European-style 4-day work weeks" or "companies getting twice as productive" rather than mass job elimination.

[DHH](../people/dhh.md) reinforces this from practice: at 37signals, "you actually go slower if you pour a bunch of people into a direction that is uncertain." AI lets tiny teams prototype faster, expanding what's feasible without expanding headcount.

Miessler sharpens the competitive angle: the primary danger to large unwieldy companies is that a smaller company can now function with the strength of a much larger one — and it's far easier for a small company to maintain the strategic clarity that AI requires. Most large companies survive not because they're well-run but because their competition is equally chaotic. AI breaks that equilibrium. [[source]](https://danielmiessler.com/p/most-companies-arent-anywhere-near-ready-for-ai)

## Broader Implications

Marc Andreessen's synthesis on AI + domains: "Domains with lots of edge cases = difficult for error-prone people. Such domains = where AI agents will do best."

## Intercom's 2x Experiment: AI Acceleration at Scale

Darragh Curran (Intercom CTO, Apr 2026) published detailed results from a deliberate 9-month goal to 2x R&D productivity. Key finding: they hit it with time to spare, and looking back over 16 months, they've 3x'd with no signs of plateauing.

**The metric:** Merged PRs divided by total R&D headcount (all roles, not just engineers). Imperfect but deliberately chosen — it puts pressure on the whole system and exposes bottlenecks.

**Results after 9 months:**
- **93.6% of PRs are agent-driven** (Claude Code). Many engineers rarely use an IDE at all.
- **Product defect backlog shrunk 54%** — all critical and high defects closed, working toward <24hr fix SLO
- **2x product changes shipped, 39% faster** from idea to shipped
- **Code quality improving** after initial decline during AI adoption — first-ever five-week streak of net positive quality
- **Downtime from breaking changes down 35%** despite doubled deployments
- **19.2% of PRs auto-approved by AI** — median merge time 14.6 min vs. 75.8 min for human-reviewed. 497 PRs went fully autonomous (AI-written, AI-reviewed, auto-shipped) in first four weeks
- **Cost per PR cut in half** — AI spend growing exponentially but dwarfed by salary cost savings

**The distribution problem:** Top 5% of engineers produce 6x median output. Engineers spending >$1K/month on tokens see the biggest gains, but spending alone doesn't guarantee it. Intercom tracks a progression from "minimal" to "elite" AI usage based on intensity, output, depth, efficiency, and prompt quality.

**Beyond R&D:** 1,100 active Claude Code users across 1,305 total employees — finance, legal, recruiting, sales teams all using agents. Internal platform lets anyone query Snowflake data and publish interactive reports.

**Key organizational change:** Created "team-2x" to build a shared Claude Code plugin marketplace — auto-updating skills that distribute best practices automatically. 153 contributors (31% of R&D), 267 skills. "Modernizing the factory is now part of everyone's job."

Context: Intercom is not a startup — ~8.5M lines of code, 500+ people building/operating, 30K business customers, 2M+ QPS on datastores, 313 daily production deployments. This is Block's "intelligence layer" thesis playing out in practice at a mature company.

## Replit's Self-Driving Company

Amjad Masad (Replit CEO, Jul 2026) describes what happens when a company weaves agents into every function — not as editor copilots but as an "expanding system of agents operating across the company: taking goals from people, gathering context, performing work, checking the results, and escalating when human judgment is needed."

**Engineering results (Jan–Jun 2026):**
- **2.9x code output per engineer** on a consistent cohort (5.8x including new hires). Review latency flat — agents assess PR risk level and only escalate to a second human reviewer when necessary, saving 30%+ of human review time.
- **Reversion rates and incidents flat** despite the output increase, meaning relative quality improved. Agent-assisted code review catches more bugs; agent-assisted incident investigation cuts mean time to mitigation.
- **Project completion rate sharply up** — the additional code translates into shipped features, not just lines.

**[Loop engineering](../tools/loop-engineering.md) at scale.** Every employee gets a manager agent that can spawn agent swarms for verifiable tasks. Engineers used this to complete a long-stalled CSS migration, automate product localization, maintain flaky tests, and debug a hard networking issue — all by orchestrating parallel agent fleets rather than doing the work step by step.

**Self-improving loop in production.** Replit's AI team built a continual learning system that analyzes user feedback on Replit Agent, proposes improvements, validates them through benchmarks and A/B tests, and ships the winners — a concrete instance of the recursive self-improving loop architecture described in the YC Root Access talk. Replit Agent is improving Replit Agent.

**Beyond engineering.** Adoption spread company-wide through a Slack interface — non-engineers saw engineers tagging the agent and started using it themselves:
- **Data team** gave the agent a semantic layer over the data warehouse, making any employee capable of self-serve business intelligence. A PM ran complex launch analysis without data team involvement.
- **Sales** uses the agent for lead enrichment from internal product data and to prepare branded account-specific slide decks for customer conversations.
- **Support** gave the agent playbooks to investigate issues and draft responses. Hard tickets (those escalated to humans) now close 60% faster.
- **Marketing** generates product specs from cross-team conversations and documents, enabling earlier launch planning without attending every meeting.

**Build vs. buy inverted.** Replit's internal agent now outperforms market-leading vertical SaaS products they evaluated — an alert-triage tool and an automated pen-testing tool both matched quality at 10x the cost. They churned a seven-figure SaaS solution because employees had already migrated to the internally built replacement. Deep integration with internal knowledge bases makes generic solutions feel inferior.

**The "promoted, not automated" framing.** Masad's recurring observation: "People don't feel like they've been automated. They feel like they've been promoted." Self-driving turns doers into directors — the people thriving think in outcomes and set direction. This complements the [people-at-the-edge](#people-at-the-edge) thesis: humans choose the destination; agents handle the steps.

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

**The activity-results gap.** Kai-Fu Lee, after meeting hundreds of CEOs, identifies the central failure mode: resources flow into AI (top models, AI teams, pilots, training), but the business itself doesn't change. His test: "If your AI program has not moved a number on your earnings call, you have not transformed the company. You have funded an expensive AI laboratory." [[source]](https://x.com/kaaboreal/status/1926009872946987008) Too many companies mistake pilots for progress, tools for strategy, and adoption for transformation. Adding a chatbot to an old workflow doesn't make a company AI-native; neither does a collection of disconnected copilots.

**AI transformation as CEO mandate.** Lee argues this is precisely why AI transformation cannot be delegated to the CIO or CTO as a technology project. Technology leaders are essential, but only the CEO can define the ambition, concentrate resources, redesign the operating model, remove barriers, and remain accountable for the result. This converges with Al-Abdullah's Architect Mode from a different angle: where Architect Mode describes the *posture* (designing the system), Lee emphasizes the *authority requirement* (only the CEO has the organizational leverage to force genuine restructuring). Lee's proposed mechanism — a "decision brain" for the enterprise with memory, context, company knowledge, and the ability to identify anomalies, execute actions, coordinate work, and learn from outcomes — maps directly to Block's intelligence layer.

**Key contrast with Block's model:** Block's "From Hierarchy to Intelligence" describes the organizational *structure* (world model + intelligence layer + capabilities). Architect Mode describes the *leadership posture* — what the CEO actually does all day when the intelligence layer handles coordination. They're complementary: Block answers "what does the company look like?" and Al-Abdullah answers "what does the CEO do?"

## See Also

- [Agentic Engineering](../tools/agentic-engineering.md) — technical patterns for the self-improving loops and multi-agent orchestration that the organizational models here depend on
- [AI-Native Product Development](../tools/ai-native-product-development.md) — the "docs to demos" workflow and team structures emerging from AI-native development

## Sources

- "From Hierarchy to Intelligence" — Jack Dorsey / Block (tweet, Mar 2026) ([link](https://x.com/jack/status/2039003879841362278/?s=12&rw_tt_thread=True))
- "From Hierarchy to Intelligence" — Roelof Botha / Sequoia (article, Apr 2026) — Full Sequoia endorsement with historical context and "edge" framework
- "Thesis: the problem with AI working in every domain..." — Marc Andreessen (tweet) ([link](https://x.com/pmarca/status/2038350516875595924/?s=12&rw_tt_thread=True))
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang / a16z Show (video, Apr 2026) ([link](https://youtube.com/watch?v=UE8jx4dvlSQ&si=GjAYLtlY5pE380BK))
- "Founder Mode is dead. Long live Founder Mode." — Ayman Al-Abdullah (Apr 2026) ([link](https://x.com/aaboreal))
- "2× – nine months later: We did it. You can too." — Darragh Curran / Intercom (Apr 2026) ([link](https://ideas.fin.ai/p/2x-nine-months-later))
- "How to Build a Self-Improving Company with AI" — YC Root Access (video, May 2026) — Self-improving loop architecture, organizational legibility imperative, YC monitoring agent example, burn tokens not headcount
- "Most Companies Aren't Anywhere Near Ready for AI" — Daniel Miessler (article, May 2026) ([link](https://danielmiessler.com/p/most-companies-arent-anywhere-near-ready-for-ai)) — Strategic clarity as AI prerequisite, small-company structural advantage in legibility
- "Everything Is Recorded Now" — David Haber (tweet, Jun 2026) — Recording as default, AI onboarding through meeting attendance, voice as new system of record, verbal vs written culture advantage
- "Why I wrote 'AI Native'" — Kai-Fu Lee (tweet, Jul 2026) ([link](https://x.com/kaaboreal/status/1926009872946987008)) — Intelligence scarcity → abundance as organizational redesign driver; activity-results gap; AI transformation as CEO mandate; decision brain concept
- "The Self-Driving Company" — Amjad Masad / Replit (tweet, Jul 2026) — 2.9x per-engineer output; cross-company agent adoption (data, sales, support, marketing); loop engineering at scale; continual learning system; build-vs-buy inversion; "promoted, not automated" framing
- "You Just Hired a Million Bad Employees" — George Sivulka / a16z (article, Jul 2026) ([link](https://www.a16z.news/p/the-next-ai-goldrush-tokens-loops)) — Seven parallels between token and human workforces; 100X tokens; evals as OKRs; context hoarding; AI transformation companies
