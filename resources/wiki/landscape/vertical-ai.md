---
created_at: 2026-04-09
last_updated: 2026-05-26

---

# Vertical AI

> TLDR: Domain-specific AI applications are finding product-market fit faster than horizontal AI, especially in legal, healthcare, customer service, and coding. Harvey ($0→$200M ARR in 36 months) and Sierra ($0→$165M ARR in 26 months) are the benchmark case studies; both combine vertical domain expertise with outcome-aligned pricing.

## Enterprise AI Adoption (2026 Data)

Per a16z analysis (Apr 2026), based on internal data and executive conversations:

- **29% of Fortune 500** and **~19% of Global 2000** are live, paying customers of a leading AI startup
- These are real deployments — top-down contracts, converted pilots, and active usage — not just signed deals
- This penetration happened faster than any prior enterprise technology wave; large enterprises are betting on newer AI products earlier than they ever have before

**Top use cases by adoption:**
1. **Coding** — Dominant by an order of magnitude. 10-20x productivity gains for engineers. Tight human-in-the-loop. Verifiable output. Tools: Cursor, Claude Code, Codex.
2. **Support** — High volume, well-defined tasks, clear SOPs, verifiable resolution. Easy to A/B test ROI. Low change management (often outsourced to BPOs already).
3. **Search** — Internal knowledge retrieval, industry-specific search. Glean (enterprise), Harvey (legal search), OpenEvidence (medical search).

**Top industries:**
- **Technology** — Always-early adopter, spawned the wave
- **Legal** — Surprising first mover. AI is excellent at parsing dense text, reasoning over contracts, summarizing. Harvey: ~$200M ARR in 3 years.
- **Healthcare** — Medical scribing (Abridge, Ambience), medical search (OpenEvidence), admin automation (Tennr)

**Why these sectors:** Text-based work, rote and repetitive tasks, natural human-in-the-loop oversight, limited regulation, verifiable outputs. Industries requiring physical world interaction, interpersonal relationships, or heavy regulation are lagging.

## Harvey AI: The Vertical AI Playbook

Harvey ($0 → $200M+ ARR in 36 months; ~$11B valuation) is the canonical vertical AI success story. Founders: Winston Weinberg (securities litigator) + Gabriel Pereyra (DeepMind researcher). Seed investor: OpenAI (led $5M round in 2022).

**Why legal AI works:**
- Billable-hour model means there's already a human-in-the-loop review system — minimum viable AI quality is lower
- Legal work is structured: ~10 categories (drafting, document comparison, case law research, etc.)
- Process data exists only inside law firms — no public training data, so proprietary data is a genuine moat
- Prestige signals trust in professional services — top firm adoption creates downstream credibility

**Harvey's growth levers:**

1. **Contrarian customer choice** — Went to Allen & Overy (now A&O Shearman, 4,000 lawyers) when they had 4 employees. If elite firms trust you, everyone downstream trusts you. On the product side: hard problems build defensible systems.

2. **Hyper-personalized demos** — Before every pitch, researched the specific partner, found their public case filings, had Harvey analyze their own work. "Upload their own argument. Tell me how to argue against it. Lawyers are argumentative. Let them fight with the model."

3. **External trust flywheel** — Law firms bring Harvey to their clients. PE fund's law firm builds a workflow → PE fund wants it → PE fund pulls their other law firms. First 50 enterprise customers were all referrals.

4. **Expand then collapse** — First built specialized systems for each legal task type (separate system for drafting vs. due diligence vs. case research). Then unified into single interface where the AI routes users via "nudges." Classic platform move.

5. **GRR focus** — "A lot of investors have been basically just looking at net new ARR... that's a huge mistake." Median seat count doubles within 12 months of deployment.

6. **Domain experts, not just engineers** — ~20% of 460 employees are lawyers. Domain hires: closing enterprise deals (ex-Wachtell partner calling = meeting gets taken), and product design (lawyers define 15 sub-tasks in a workflow, what "good" looks like).

7. **Selling work, not just software** — Revenue-share model where Harvey builds custom workflows with law firms, law firms sell to clients. Budget comes from professional services spend (billions) not tech budget (millions).

**Competitive landscape:** Harvey vs. Legora. Harvey: ~$200M ARR, backed by Sequoia/a16z/Kleiner. Legora: ~$100M ARR est., backed by Benchmark/Bessemer. Both using Claude heavily.

## Harvey's Tech Architecture

- Runs ~6 foundation models (OpenAI, Anthropic, Google, Mistral) with an orchestration layer that picks the best per task
- Proprietary process data from inside law firms sits on top
- 40% of engineering/product/design team is senior infrastructure engineers (moat is the system, not the prompt)

## Harvey's Vertical Model U-Turn (2025-2026)

Harvey initially built a custom-trained case law model in partnership with OpenAI. Lawyers preferred it over GPT-4 97% of the time. The model drove rapid growth: $190M ARR by January 2026, $11B valuation by March 2026, majority of AmLaw 100 as clients.

Then Harvey scrapped the model.

Frontier reasoning models from Google, xAI, OpenAI, and Anthropic started outperforming Harvey's custom legal model on Harvey's own BigLaw Bench evaluation. Harvey now routes tasks across Claude, Gemini, and GPT via a Model Selector.

*The lesson on vertical model durability:* Fine-tuning wins decisively only when:
- Query patterns are genuinely specialized and underrepresented in general training data
- Consequence of errors is high enough to justify sustained investment
- Company has enough distribution to generate meaningful proprietary feedback

For many categories, the better bet remains exceptional workflow infrastructure, skill files, and agentic orchestration on top of frontier models — a fine-tuned model that requires sustained investment to stay ahead of a constantly improving baseline may not hold its advantage.

*Counterexample:* Intercom's fin-cx-retrieval (custom retrieval model for customer service) works because customer service reasoning is structurally different from general language tasks, and 40M+ resolved conversations have compounded the advantage.

Cursor launched Composer 2 (Apr 2026) — a proprietary coding model built on Moonshot AI's Kimi K2.5 with their own continued pre-training and RL. Scored 61.7% on Terminal-Bench 2.0, beating Claude Opus 4.6 (58.0%), at $0.50/M input tokens (1/10th of Anthropic's flagship). Cursor's strategy: frontier models for hardest reasoning tasks, custom vertical models for everything else.

## Sierra: Customer Service Vertical AI

Sierra ($0 → $165M+ ARR in 26 months) is a managed AI agent platform for enterprise customer service. Founded by Bret Taylor (ex-Salesforce co-CEO) and Clay Bavor shortly after ChatGPT launched. While most AI startups in early 2023 went horizontal, Sierra went vertical into customer service — and grew even faster than Harvey.

**Why customer service works:** A human-handled call costs ~$10 in the US; Sierra's per-resolution cost is $0.10–$1. At Fortune 500 scale (50M customers, ~$1.2B contact-center spend), the savings land on the CEO's desk. The absolute dollar magnitude of the savings determines deal priority, which is why Sierra went straight at the Fortune 500. [[source]](https://x.com/IvanLandabaso/status/1924809153840267528)

**Growth levers:**

1. **Stealth design partners chosen for hard constraints** — Recruited 4 companies they personally knew and built in stealth for 11 months. Intentionally chose customers that would stress-test the product: WeightWatchers (cost pressure from restructuring), Sonos (10x Black Friday surges), SiriusXM (34M subscribers on legacy IVR), and OluKai (a sandals brand obsessed with brand voice that forced agents to hold a personality).

2. **Outcome-based pricing** — Sierra gets paid a pre-negotiated rate per resolved case. If the case escalates to a human, Sierra gets $0. This forces the company to optimize for one metric: time-to-live. Incumbents can't match without cannibalizing the revenue base their market cap is priced on. As Taylor put it: "Business model transitions are harder than technology transitions." [[source]](https://x.com/IvanLandabaso/status/1924809153840267528)

3. **Speed as structural advantage** — Outcome pricing means every week of implementation is a week of zero revenue, so the company is wired around deployment speed. Nordstrom voice agent (Nora): 5 weeks. Cigna: 8 weeks. Singtel: 10 weeks. Comparable Salesforce Agentforce deployments take multiple quarters; traditional ERP rollouts take 18+ months. Three layers compound the speed: no-code tooling for the customer's CX team, Ghostwriter (an agent that builds agents, launched March 2026), and a deployment team whose charter is "to automate themselves."

4. **Omnichannel collapse** — Most enterprises in 2024 had separate vendors for SMS (Twilio), call center (Five9/Genesys), chat (Intercom/Zendesk), cases (Salesforce), WhatsApp, and email — 6 contracts, pricing models, and data silos. Sierra collapsed all channels into one agent. Voice launched October 2024 and within 12 months surpassed text as the largest interaction surface. One Sierra contract absorbs budget from 4–6 vendor line items.

5. **Brand-personalized agents** — Agents have names, personalities, and brand voices (Chubbies → Duncan, SiriusXM → Harmony, Nordstrom → Nora). This gives every buying committee stakeholder something they care about: IT gets SOC2/HIPAA/GDPR compliance, CMO gets brand voice control, Head of CX gets CSAT metrics, and the brand team gets tone customization.

6. **Vertical sales org** — Sales organized by industry vertical (not geography), so reps speak the buyer's language on the first call. This compounds with customer referrals and industry-specific case studies.

7. **Land-and-expand** — Customer service is the foot in the door. Expansion path: (1) CX wedge → (2) voice channel expansion (ACV doubles or triples) → (3) sales agents for commerce and cart recovery → (4) full-lifecycle digital interface.

**Competitive positioning:** Sierra occupies the "managed agent vendor" quadrant where outcome pricing works because the vendor owns everything that determines the outcome. The biggest competitive threat is foundation labs (Anthropic, OpenAI, Google) moving downstream into managed deployment with outcome pricing — but that requires them to rebuild their business model away from selling tokens.

**Category naming:** Sierra coined vocabulary the industry now uses — Agent OS, Agent Studio, outcome-based pricing, Ghostwriter, Agents as a Service, τ-bench (open eval framework). This mirrors how Salesforce coined "SaaS" and Anthropic coined "Constitutional AI" and "MCP."

**Harvey parallel:** Both companies picked a vertical everyone else ignored, sold to the hardest possible first customers, used outcome-aligned pricing to lock out incumbents, and organized sales by domain expertise rather than geography. The key difference: Harvey sells to professionals who bill by the hour (legal), while Sierra sells to enterprises that pay per customer interaction (CX). Both demonstrate that vertical AI companies win by making business model transitions that horizontal incumbents can't follow.

## The 1-1-1 Playbook (Alton Syn / Mark Cuban)

Alton Syn distills Mark Cuban's AI agent thesis into a sharper framework: the money isn't in "selling AI" — it's in pointing to **one painful workflow inside one business** and fixing it fast.

**The framework:** One vertical. One workflow. One painful problem. Everything else is distribution.

**Why most people fail:** They pick a vertical too broad ("healthcare," "real estate," "legal"). The winning move is one level deeper:
- PT clinics with insurance verification delays
- Cleaning companies with slow quote turnaround
- HVAC businesses with missed maintenance follow-up
- Pool service companies with technician routing chaos

**What clients actually buy:** Not agents, not AI, not your stack — they buy the disappearance of a painful operational loop. A strong offer makes sense to a tired business owner in under 15 seconds: "when a job is cancelled, the next best customer gets contacted automatically."

**The real moat — workflow fluency:** Knowing one painful loop well enough to instantly answer: What triggers it? What data does it need? What counts as urgent? Where does a human still step in? What breaks most often? What ROI shows up fastest?

**Where value is shifting:** Away from node-dragging, repetitive setup, and manual debugging as a billing model. Toward workflow selection, commercial packaging, deployment confidence, monitoring, and iteration speed.

**The playbook from zero:**
1. Pick one narrow vertical slice (not "healthcare" — a specific operator pain)
2. Find one workflow tied to money or time (lead response, quote turnaround, cancellations, invoice recovery)
3. Make the offer outcome-based — say what painful thing stops happening
4. Keep V1 tight — one workflow, one commercial win, one before-and-after
5. Build for ownership: monitoring, fallbacks, alerts, exception handling — this is where retainers come from

This aligns with the [Services-as-Software](services-as-software.md) thesis: the 1-1-1 playbook is effectively the individual operator's version of the autopilot wedge — start with the outsourced, intelligence-heavy task and compound from there.

## Abridge: Healthcare Vertical AI at Scale

Abridge (founded 2018, CEO is a practicing cardiologist) is a clinical intelligence layer for health systems. Started with ambient clinical documentation — passively listening to doctor-patient conversations and generating notes — and expanded into clinical decision support, prior authorization, and broader workflow automation. Over 100 million doctor-patient conversations processed.

**Why the conversation is the wedge:** ~20% of US GDP flows through healthcare, and almost everything — claims, payments, diagnoses, treatments — is a derivative of the doctor-patient conversation. Clinicians spend 10-20 hours per week on documentation ("pajama time" — catching up on notes after hours at home). Abridge eliminates that burden and uses the captured context to power adjacent products.

**Three-act strategy:**
1. **Save time** — Ambient documentation, the original product. Clinicians report going home to eat dinner with their families for the first time.
2. **Save and make money** — Prior authorization (collapsing 45-day, 20-touchpoint approval processes into real-time in-visit resolution), revenue cycle optimization (ensuring notes are complete enough for proper billing).
3. **Save lives** — Clinical decision support: proactive intelligence that preps clinicians before visits, surfaces guideline-based recommendations, and catches safety-critical gaps while patients are still in the room.

**Product philosophy — "air conditioning":** The product should be in the background, just making things better. Over 90% of alerts in healthcare are ignored (alert fatigue). Abridge's approach is proactive over reactive — pre-visit patient summaries, quiet in-context nudges when clinically critical, not interruptive pop-ups. Only break the ambient wall when the clinical stakes justify it.

**Personalization at three levels:**
- *Individual:* Style preferences (bullets vs. paragraphs, specific phrases, template structure). Doctors treat notes as deeply personal reflections of their practice — "I refuse to use this tool" over two missing spaces between sentences.
- *Specialty:* A cardiology note and workflow look nothing like dermatology. Eval criteria for what constitutes a "great" note differ by specialty — completeness, compliance, billability all shift.
- *Health system:* Organizations embed their own clinical guidelines into the platform. Decades of refined best practices become context that the AI uses in real-time recommendations.

**Moat mechanics:**
- **Data flywheel** — 100M+ conversations generate edit data, feedback, and outcome signals that compound into personalization and quality improvements. The conversation corpus is a data source that never existed before in structured form.
- **EHR integration** — Deep partnerships with major electronic health records systems. Pulling and pushing data with APIs "that weren't ready out of the box." Without seamless EHR integration, health systems won't adopt — every additional click is a dealbreaker.
- **Eval rigor** — Internal clinicians run LFD ("look at the f***ing data") review passes; LLM judges calibrated with annotated data across specialties; progressive rollout modeled on Waymo's approach. "80/20 doesn't work here" — the long tail matters because errors can be fatal.
- **Clinician scientists** — MDs who are also deeply technical (internally called "mutants"), embedded in product teams. They define eval criteria, shape product design, and ensure clinical safety. Similar to Harvey's 20% lawyer workforce but in healthcare.
- **Trust is earned in drops** — Health systems traditionally operate on quarterly release cycles. Abridge has moved customers to monthly cycles, with a subset opting into even faster iterative development partnerships.

**Technical architecture:**
- Post-training and distillation for cost efficiency at scale — you can't use the most expensive model at 100M conversations. Fast/cheap models triage, hand off to larger models for complex reasoning (think fast/think slow pattern).
- Memory sub-agents that learn clinician preferences in the background, with consolidation jobs analogous to sleep.
- Event-driven real-time systems (Kafka, Temporal, sockets) — the ambient always-on modality requires low-latency processing during live conversations.
- Currently batch-based real-time (not native voice-in/text-out), with prototypes for triggering agentic workflows at specific conversation moments.
- De-identification models strip PHI from transcripts before any training or eval use, with government-defined standards for what constitutes protected health information.

**Healthcare vs. horizontal AI (Glean comparison):** Chai Asawa (early Glean engineer, now leading Abridge clinical decision support) frames Abridge as "a healthcare-coded version of Glean." Both companies share the core insight that context is king — amazing models need the right context to be useful. Key differences: healthcare's downside risk is potentially fatal (vs. a wrong search result), the persona variance is narrower but deeper (specialties vs. all knowledge workers), and the ambient always-on modality is structurally different from search-triggered interaction.

**Regulatory tailwinds:** Contrary to the assumption that healthcare regulation is purely a headwind, the FDA released updated clinical decision support guidance (Jan 2026) that is forward-looking and more permissive. Government interoperability mandates also help — they require the data exchange that makes agentic healthcare workflows possible.

## Comparable Cases

- **Customer service:** Sierra ($165M+ ARR in 26 months), Decagon, Ada Support. Outcome-based pricing and omnichannel collapse make CX a natural vertical for managed AI agents. Salesforce Agentforce is the incumbent response but deploys on multi-quarter timelines.
- **Healthcare:** Abridge (clinical intelligence layer, 100M+ conversations), Ambience Healthcare, OpenEvidence (medical search), Tennr (back-office healthcare admin). All grew rapidly on discrete, text-heavy use cases that circumvent the EHR system of record. See also [AI Drug Discovery](../science/ai-drug-discovery.md) for how generative AI is compressing preclinical timelines in pharma.
- **Code:** Cursor (reported explosive growth), Claude Code, Codex. Code is "upstream of all other applications" — AI accelerating code accelerates every domain.

## Implications for Builders

- Fertile ground: serving tech, legal, healthcare buyers — but no single winner; many sub-specialties within each
- Look for high model capability but no breakout company yet (the company that builds early when capabilities arrive + has market awareness when they mature wins)
- Watch where labs focus research: long-horizon agents, computer use, spreadsheet/presentation interfaces signal next unlocks

See also: [Business Moats in AI](../concepts/business-moats-in-ai.md), [AI Startup Distribution](ai-startup-distribution.md)

## Sources

- "Harvey AI went from $0 to $200M+ ARR in 36 months" — Ivan Landabaso (tweet thread, Apr 2026) ([link](https://x.com/ivanlandabaso/status/2042179119325082087/?s=12&rw_tt_thread=True))
- "AI Adoption by the Numbers" — Kimberly Tan (a16z, Apr 2026) ([link](https://www.a16z.news/p/ai-adoption-by-the-numbers?r=1xuh9&utm_medium=ios&triedRedirect=true))
- "The New Software: CLI, Skills & Vertical Models" — Sandhya (tweet thread, Apr 2026) ([link](https://x.com))
- "Mark Cuban Is Right About AI Agents" — Alton Syn (tweet, Apr 2026) ([link](https://x.com/altonsyn))
- "Inside Abridge: The AI Listening to 100 Million Doctor Visits" — Latent Space / Janie Lee & Chai Asawa (video, 2026). Abridge clinical intelligence layer, healthcare vertical AI at scale, three-act strategy, eval rigor, data flywheel.
- "Sierra went from $0 to $165M+ ARR in 26 months" — Ivan Landabaso (tweet thread, May 2026) ([link](https://x.com/IvanLandabaso/status/1924809153840267528)). Sierra growth playbook, outcome-based pricing, omnichannel collapse, deployment speed, Fortune 500 CX vertical.
