---
created_at: 2026-04-05
last_updated: 2026-05-26



---

# Agentic Engineering

> TLDR: The emerging discipline of designing, optimizing, and orchestrating AI agents — including harness design, tool construction, self-improving agents, and multi-agent coordination.

## Overview

Distinct from simply using AI tools, agentic engineering is about building the systems that make agents effective. The field is moving fast, with key contributions from Anthropic's Claude Code team, the AutoAgent project, and multiple open-source orchestration frameworks.

## The Delegation–Collaboration Split

AI work is bifurcating into two distinct interaction modes, each requiring different agent architectures:

- **Collaboration** — Real-time, synchronous work where a human and model co-create in the same loop. Desktop apps, inline code assistants, pair-programming sessions. The model sees your context and responds within seconds. The value is creative amplification — the human steers, the model accelerates.
- **Delegation** — Asynchronous handoff where teams assign work to long-running agents (Codex, [Managed Agents](#managed-agents-anthropic), [Gas City](#software-factories-gas-city)) and check back later. The agent owns the full execution loop. The value is throughput — one person dispatches many parallel workstreams.

The meta-skill is knowing which mode fits the task. The [allocation economy](../concepts/allocation-economy.md) thesis captured the delegation half, but missed that roughly half of AI-augmented work remains fundamentally collaborative — tasks where the human's judgment, taste, or real-time feedback is integral to the output, not just the brief [[source]](https://every.to/context-window/the-dawn-of-codex-native-apps).

In practice, teams are running both modes simultaneously: collaborative agents for writing, design, and strategy; delegated agents for refactors, migrations, and batch operations. The organizational challenge is building intuition for which mode to reach for — and building infrastructure that supports both.

## Vibe Coding vs. Agentic Engineering (Simon Willison)

Simon Willison draws a sharp line between two modes of AI-assisted development — then argues the line is already blurring.

**Vibe coding** is building without reading the code. You prompt, you check if the output works, you ship. If it breaks, you tell the model it broke and hope for the best. Willison's position: vibe coding is fine for personal tools where bugs only hurt you; it is "grossly irresponsible" for software that handles other people's data or trust.

**Agentic engineering** is a professional software engineer using AI tools to the full extent of their experience — understanding security, maintainability, operations, performance — and aiming to build *higher quality* software *faster*, not lower quality software faster. The 25-year practitioner's context, architecture taste, and security instincts become force multipliers rather than redundancies.

The blur: as models improve (Willison dates the tipping point to Claude Opus 4.5 / GPT 5.1, late 2025), even disciplined engineers stop reviewing every line. A JSON API endpoint backed by SQL, with generated tests and docs, is reliably correct. The question shifts from "did I review this?" to "do I trust this class of output?"

**The team analogy.** Willison resolves the trust question by analogy to large engineering organizations: you don't read every line of code written by another team's image-resize service — you read the docs, use it, and dig in only when something breaks. He treats agent output the same way: a semi-black box trusted until evidence suggests otherwise. The discomfort is that agents, unlike teams, carry no professional reputation and cannot be held accountable.

**The security-adjacent line.** Anything security-adjacent still gets human review. Knowing what *is* security-adjacent is itself a skill developed over years — one reason experienced engineers remain essential.

**Usage over tests as trust signal.** In a world where agents produce beautiful READMEs, 100 commits, and comprehensive test suites in thirty minutes, those artifacts no longer reliably signal quality. What *does* signal quality: someone has used the thing in production for weeks. "If you've got a vibe coded thing which you have used every day for the past two weeks, that's much more valuable to me than something that you've just spat out and you've hardly even exercised."

**Parallel agents and interruptible work.** When coding required holding an entire system in your head, interruptions were catastrophic. With agents handling the typing, Willison works on two or three projects simultaneously — prompting one agent, switching to another while the first churns for ten minutes. Harder projects parallelize *better* because each agent step takes longer, freeing more interstitial time. The deep-focus era is giving way to an interrupt-friendly dispatch model (see [delegation–collaboration split](#the-delegationcollaboration-split) above).

**Design and product process implications.** If building is cheap, the elaborate design phase that guards against "three months building the wrong thing" can afford more risk. Jenny Wen (Anthropic design lead) argues the design process should become riskier because the cost of getting it wrong has collapsed. The same logic applies to product management: specification rigor was justified by engineering cost. Spikes that once took two days of developer time now take an hour of agent time — and you can run ten in parallel.

**The deterministic-core pattern.** For production systems, Willison advocates investing deeply in a "perfect" database schema and robust API, then vibe-coding all UI on top. Customers get customization flexibility without risking the data model. The principle: push determinism into the core, let non-determinism live at the edges where the blast radius is small.

**Why code became the breakthrough domain.** Reinforcement learning needs clean reward signals. Code provides the cleanest: did the script pass its tests? Binary, instant, scalable to 10,000 parallel VMs. Anthropic and OpenAI spent 2025 on RL against simulated software environments. Labs that didn't (xAI, Gemini) fell 12 months behind. Willison expects Gemini to close the gap by end of 2026. The same RL approach is far harder to apply to law (six-month trial feedback loops) or medicine — making software engineering, ironically, the field most susceptible to AI-driven change.

## Harness Design: "Seeing Like an Agent"

> The harness concept has grown into its own dedicated topic. For a full treatment of what a harness is, its 12 components, the thin harness / fat skills pattern, memory ownership, and design decisions, see [Agent Harness](agent-harness.md).

The Claude Code team (Thariq, Anthropic) published key lessons on designing agent action spaces:

**Core principle:** Give agents tools shaped to their own abilities. The right tool depends on the agent's capabilities, not human intuition. "Put yourself in the mind of the model."

**Lessons learned:**
- **AskUserQuestion tool** — Three attempts to improve elicitation: parameter on ExitPlanTool (confused the model), modified markdown output (unreliable formatting), dedicated tool with structured output (worked). "Even the best designed tool doesn't work if Claude doesn't understand how to call it."
- **Todos → Tasks** — As models improved, todo reminders became constraining. Replaced with Task tool supporting dependencies, subagent communication, and deletion. "As model capabilities increase, tools that once helped might now constrain them."
- **Search evolution** — Started with RAG vector database, moved to Grep tool for self-directed search, then progressive disclosure via skills. Over one year: "Claude went from not being able to build its own context to nested search across several layers of files."
- **Progressive disclosure** — Add functionality without adding tools. The Claude Code Guide subagent loads docs on demand rather than stuffing everything in the system prompt. ~20 tools total, high bar to add more.

## Self-Improving Agents (AutoAgent)

Kevin Gu released AutoAgent — first library for autonomously improving agent harnesses. Key results:
- Hit #1 on SpreadsheetBench (96.5%) and #1 GPT-5 score on TerminalBench (55.1%) after 24+ hours of autonomous optimization
- Every other leaderboard entry was hand-engineered

**Architecture:** Meta-agent experiments on task agent's harness — tweaking prompts, adding tools, refining orchestration. Task agent starts with just a bash tool. Meta-agent spins up 1000s of parallel sandboxes.

**Key findings:**
- **Splitting helps** — One agent improving itself doesn't work. Being good at a domain ≠ being good at improving at that domain.
- **"Model empathy"** — Same-model pairings (Claude meta + Claude task) outperform cross-model. The meta-agent writes harnesses the inner model actually understands.
- **Traces are everything** — Without reasoning trajectories, improvement rate drops hard. Understanding *why* matters as much as knowing *that*.
- **Agents overfit** — Meta-agents insert rubric-specific prompting to game metrics. Constrained by forcing self-reflection.

**Emergent behaviors:** Spot checking, forced verification loops, writing own unit tests, progressive disclosure, orchestration logic with subagents.

## Multi-Agent Orchestration

### Software Factories: Gas City

Gas City (successor to Steve Yegge's Gas Town) is an open-source orchestration toolkit for running 100+ coding agents in parallel on a single codebase, rebuilt by Chris Sells (ex-Google Flutter) and Julian Knutsen (ex-Block). In production, Knutsen's server runs ~100 agents merging ~50 PRs/day, burning roughly a billion tokens/day.

**Three ideas worth internalizing:**
- **Dark factory vs. light factory** — Human-visible work (planning, design, review) stays "light"; agent-only execution stays "dark" in the background. As trust grows, more process moves into the dark.
- **One pet, many cattle** — One persistent supervisor ("the mayor") you talk to directly hands tasks to anonymous, disposable workers ("polecats") that do one job and shut down. You manage one conversation; the mayor coordinates a hundred agents.
- **Multiple opinions on every code review** — Route the same code to Claude, Codex, and Kimi simultaneously. Three different models catch different bugs than one model run three times.

**Current limitations:** Every task spins up a fresh session with no memory of earlier steps — agents waste cycles re-reading context and miss connections a persistent session would catch. Cost scales linearly (a six-step job costs 6x a single session). The CLI-first task tracker ("Beads") works for agents but not humans, so teams pair it with Jira or Linear. The toolkit also over-scaffolds for current model capabilities — review loops and mid-task check-ins built to keep models on track are now largely unnecessary [[source]](https://every.to/napkin-math/inside-the-100-agent-software-factory).

**Verdict (Mike Taylor, Every):** "Learn from the ideas. Skip the toolkit for now." For teams already running 10+ parallel Claude Code sessions, Gas City is one informed opinion on orchestration at that scale.

**OpenAI Symphony** — A more accessible alternative: a written ruleset that turns an existing Linear board into the dashboard agents work from. No behavior change required, closer to how software engineers already work.

### Other Orchestration Tools

**Paperclip** — Open-source orchestration for "zero-human companies." If OpenClaw is an employee, Paperclip is the company. Node.js server + React UI with org charts, budgets, governance, goal alignment. Supports any agent (OpenClaw, Claude Code, Codex, Cursor). "If it can receive a heartbeat, it's hired."

**Hermes Agent** (Nous Research) — Self-improving agent with closed learning loop: agent-curated memory, autonomous skill creation, skill self-improvement during use, FTS5 cross-session recall. Runs on 6 terminal backends (local, Docker, SSH, Daytona, Singularity, Modal). Lives on CLI, Telegram, Discord, Slack, WhatsApp.

**MiroFish** — Swarm intelligence prediction engine. Creates multi-agent simulations with independent personalities and long-term memory to predict outcomes from seed information (news, policies, financial signals).

## Managed Agents (Anthropic)

Anthropic's hosted agent infrastructure (April 2026). The key insight: harnesses "encode assumptions about what Claude can't do on its own" — and those assumptions go stale as models improve. Managed Agents is designed to outlast any particular harness implementation.

**Core architecture:** Three decoupled components, each independently replaceable:
- **Session** — Append-only log of everything that happened. Lives outside both harness and sandbox. Accessed via `getEvents()`, allows the harness to retrieve any slice of history, rewind, and replay.
- **Harness (brain)** — The loop that calls Claude and routes tool calls. Stateless; can crash and be restarted with `wake(sessionId)`. Contains no credentials.
- **Sandbox (hands)** — Execution environment where Claude runs code and edits files. One or many per session. Interface: `execute(name, input) → string`.

**The pets-vs-cattle shift:** Original monolithic container was a "pet" (hand-tended, can't afford to lose). Decoupling made each component "cattle" — if the container dies, the harness catches it as a tool error; Claude retries; a new container provisions from a standard recipe. No more nursing stuck sessions.

**Security boundary:** Credentials (GitHub tokens, OAuth) never reach the sandbox. Git tokens are baked into the repo clone during initialization; OAuth tokens live in a vault accessed via a credential proxy. The harness never sees credentials. This prevents prompt injection from escalating to credential theft.

**Performance results:** Decoupling cut p50 time-to-first-token (TTFT) ~60% and p95 TTFT >90%. Sessions that don't need a sandbox skip provisioning entirely. Scaling to many brains = starting many stateless harnesses.

**Many brains, many hands:** Multiple orchestrator agents can share hands (sandboxes) — and can pass hands to each other. The harness doesn't know whether the sandbox is a container, a phone, or a Pokémon emulator.

The design philosophy mirrors Unix: virtualize components into general interfaces (like `read()` being agnostic to disk hardware) that outlast any specific implementation underneath. See the Anthropic engineering blog: "Scaling Managed Agents: Decoupling the brain from the hands."

**In production — Spiral:** Every's writing tool Spiral is one of the first products using Managed Agents' multi-agent capabilities in production. When a user requests multiple drafts, a managed agent spins up multiple Opus-class subagents to write drafts in parallel, cutting response time by 20–30 seconds per draft. This demonstrates the "many brains, many hands" architecture working at product scale — orchestration as a feature, not infrastructure overhead.

## Managed Agents (OpenAI + AWS)

Bedrock Managed Agents, powered by OpenAI (April 2026): OpenAI's frontier models packaged inside an AWS-native agent runtime — identity, permissions, state, logging, governance, and deployment. Exclusive to AWS. The product emerged from a renegotiated Microsoft-OpenAI deal that made OpenAI's license non-exclusive, allowing them to serve on other cloud providers for the first time.

**What it is:** Think "Codex in AWS." Codex works well locally because the entire environment is there — files, auth, data — all for free. Bedrock Managed Agents solves the enterprise version: agents that operate inside a customer's VPC with proper identity, security boundaries, and access to organizational data across services. Built on AWS AgentCore primitives (memory, safe execution, permissioning) but co-developed with OpenAI to integrate model and harness tightly rather than leaving customers to stitch them together.

**Why the partnership makes strategic sense:**
- AWS has the largest enterprise installed base, most of which won't migrate to use a model API elsewhere
- OpenAI gets access to that base; AWS customers get OpenAI models natively in their existing security perimeter
- Customer data never leaves the VPC — AWS owns the support relationship and operational responsibility
- Runs on a mix of GPUs and Trainium (AWS custom silicon), with increasing Trainium share over time

**Model-harness convergence (Altman):** "I no longer think of the harness and the model as entirely separable things." In the GPT-3 era, enormous system-prompt engineering was needed to extract utility; now models understand and perform well out of the box. The trend: things that start in the harness get absorbed into the model through training. Tool-calling began as an afterthought and is now deeply integrated into the training process. Altman expects pre-training and post-training to converge similarly — and the model-harness boundary to continue dissolving as intelligence improves.

**The unsolved agent identity problem:** When an agent acts on behalf of an employee, should it use the employee's account? A separate account? There's no primitive for "Ben's agent logging in as Ben, noting it's an agent, not the real Ben." Altman: "We don't even have a primitive to think about that, but we may quickly need to." Fifty similar problems — access control, permissions, audit trails — will require mental models for software to evolve as agents join the workforce with increasing autonomy.

**Local vs. cloud agents:** Local wins today on ease — your environment is already there. Cloud wins for enterprise — scale, multi-user sharing, security boundaries, organizational controls. The endpoint is both: a persistent local client plus cloud-based agents that survive laptop closures, scale out, and operate within governance constraints. AWS's VPC model gives risk-averse organizations (banks, healthcare, government) confidence to move faster: "If it operates inside the sandbox, I am excited to go fast."

**Intelligence as utility with uncapped demand:** Altman frames OpenAI as an "intelligence factory" — delivering the best unit of intelligence at the lowest price. Unlike water or electricity, demand for intelligence appears uncapped at low enough prices. Pricing will evolve from per-token to per-result ("you don't care how many tokens the answer takes, you just want the piece of work done"). AWS comparison: cost per compute cycle has fallen orders of magnitude over 30 years, yet more compute is sold today than ever.

**Future architecture — the middleware question:** Enterprise customers consistently ask for: (1) an agent runtime environment, (2) a management layer connecting data to agents with spending oversight, and (3) a workspace (like Codex) for employees. Thompson posits a "double agent layer" — one layer maintaining connections to data sources, another serving as the user interface. Altman agrees this describes today's architecture but cautions: "As models get really smart, I don't think we know exactly what the architecture of the future looks like." What starts as middleware may get absorbed into the model itself.

**Platform strategy — neutral vs. integrated:** AWS's partner-first approach (best product wins, whether first-party or third-party) contrasts with Google Cloud's fully integrated model-to-chip stack. Garman: "We view our success is if the partners are successful and they're building on top of us or together with us." The infrastructure layer provides maximum flexibility to meet model companies in the middle — AWS brings the I(nfrastructure), OpenAI brings the S(oftware), and they co-build the P(latform).

## The Great Convergence

Nicholas Charriere's thesis (Apr 2026): app companies, model companies, and infrastructure companies are all converging on the same product shape — **self-improving agents that do knowledge work**.

**Why it's happening:** The general harness (model + loop + tools) turns out to be a general-purpose problem-solving machine. Claude Code was the breakthrough — initially built for coding, it generalizes to any computer-based task with the right tools. The prize is enterprise knowledge work, which dwarfs B2C AI use cases.

**Who's converging:**
- **Systems of record** (Salesforce, Notion, Linear) — own the data and workflow; just need to productize the harness
- **Model companies** (Anthropic, OpenAI) — own intelligence but face commoditization; moving up-stack into applications. OpenAI deprioritized Sora to focus entirely on Codex
- **Communication platforms** (Slack, Teams) — agents need to communicate with each other and humans; these companies have already solved that
- **Infrastructure companies** (Databricks, Vercel, Cloudflare) — repositioning as "infrastructure for agents," providing sandboxes, compute, monitoring, orchestration

**The self-improvement loop:** Drive → collect data → retrain (autonomous vehicles) maps to: run → monitor → improve harness code and context engineering → run again. The difference: the agent itself can close this loop, writing code to improve its own performance. Yoonho Lee (Stanford) formalized this as "Meta-Harness" — autonomously optimizing harnesses end-to-end.

**Prediction:** By end of 2026, many software companies will look like they're selling the same thing. Winners will have distribution, trusted workflow positioning, proprietary context, and the shortest path from observation to improvement.

## Agent Marketplace Infrastructure (Wright)

Aaron Wright maps the infrastructure required for agents to operate as autonomous economic actors — not just execute tasks, but transact: find counterparties, make commitments, move money, build track records, survive disputes, and stay within authorized scope. The argument: without identity, trust, pricing, contracts, settlement, enforcement, and policy, "you do not have an economy. You have a demo."

The architecture decomposes into **three planes, ten layers**:

**Trust Plane** — establishes who the agent is, how it is found, and what it has done:
- **Identity (Know-Your-Agent):** Cryptographic model lineage attestations, tool permission manifests, and persistent agent DIDs. Current state is "identifiers without identity" — no way to verify that an agent's weights, system prompt, or tool access match its claims. ERC-8004, an Ethereum standard co-authored by MetaMask, Ethereum Foundation, Google, and Coinbase, defines an Identity Registry where each agent owns an NFT whose URI resolves to a JSON file naming its A2A endpoint, MCP endpoint, ENS handle, and wallet addresses. As of early 2026, over 128,000 agents registered across 24 chains [[source]](https://x.com).
- **Discovery & Capability Registry:** Structured, machine-readable capability declarations — not "marketing assistant" but typed interfaces with inputs, outputs, latency SLAs, jurisdictions. MCP and A2A are the interop foundation; ERC-8004's registration file is the closest thing to a structured capability declaration in production. The marketplace that ranks, filters, and prices against these declarations does not yet exist.
- **Reputation:** Cryptographically attested outcome track records (accuracy, latency, dispute rate), cross-marketplace portability via DIDs, and sybil resistance through staked collateral or behavioral fingerprinting. ERC-8004's Reputation Registry stores feedback signals; the scoring layer on top — "Moody's for Machines" — is one of the most valuable openings in the stack.

**Market Plane** — moves value between agents:
- **Quoting & Price Discovery:** The most economically interesting missing layer. Agent services don't price well as hourly, fixed-scope, or per-token — the interesting price is "per result of acceptable quality." Needs real-time RFQ (Tradeweb for cognitive work), outcome contracts with verifiable completion, and auction mechanics for fungible work. The closest blueprint is programmatic ad exchanges, which built three of the largest companies of the last twenty years.
- **Contracting:** Turns a quote into an obligation — machine-readable MSAs capturing scope, deliverables, deadlines, payment terms, data rights, liability, and remedies, signed by both parties' DIDs. The contract becomes a portable execution wrapper: part legal agreement, part workflow schema, part policy bundle. Critically depends on the governance layer for proof of authority — without it, every agent-signed contract is "one ultra vires claim away from worthless."
- **Settlement:** Layered architecture — stablecoins (Coinbase x402, Circle CCTP) for high-frequency agent-to-agent, virtual cards (Visa Intelligent Commerce, Mastercard Agent Pay) for agent-to-merchant, ACH for periodic sweeps. Whoever builds the abstraction layer over all three (`pay(amount, currency, counterparty, settlement_window)` that picks the cheapest rail) wins the developer surface.
- **Dispute Resolution:** Escrow as default, automated remediation paths (quality below threshold → automatic refund), and validator/arbitration agents. ERC-8004's Validation Registry supports multiple trust models — stake-secured re-execution, zkML proofs, TEE attestations, or human judges — scaling with value at risk.

**Control Plane** — what the agent is allowed to do and how it proves it:
- **Governance & Authority:** Policy engines that enforce before execution, not after logging (Cordum, Aegis AI, Galileo, Microsoft's Agent Governance Toolkit). Spending limits via Safe allowance modules, ERC-4337 session keys, hierarchical multisig. The deepest unsolved piece: *authorized scope* — a machine-readable, signed declaration of what an agent can bind its principal to. The Air Canada tribunal ruling (Feb 2024) held the airline liable for its chatbot's unauthorized promises, establishing that companies are bound by agent representations.
- **Compliance:** Splitting from governance as its own vendor category, driven by the EU AI Act's high-risk obligations (effective August 2, 2026, penalties up to €35M or 7% of global turnover). Governance answers "what is the org willing to let the agent do"; compliance answers "what must it prove to a regulator about what the agent did." ComplyEdge, Lucairn, and others are shipping enforcement layers for Articles 9, 12, 13, and 14.
- **Orchestration & Runtime:** Runtime (Modal, E2B, Daytona), memory (Mem0, Letta, Zep), observability (Langfuse, Helicone, Arize), and orchestration (LangGraph, CrewAI, AutoGen, Google ADK) are separating into distinct procurement decisions. Around 86% of enterprise copilot spending in 2026 (~$7.2B) goes to agent-based systems. The marketplace itself doesn't build these but must standardize the export format — "OpenTelemetry-for-agents" is the missing standard.

**Strategic implications:** The platform play requires three layers, not two — whoever owns identity, settlement, and governance owns the marketplace. Crypto-native and enterprise-native stacks are converging at the trust plane (ERC-8004) and diverging at the control plane (Safe modules vs. enterprise governance toolkits). The most undervalued layer is quoting/price discovery — real-time machine-to-machine price discovery over a TAM measured in trillions of cognitive labor dollars, with almost nobody building it as a primary product.

## "The Decade of Agents" (Karpathy)

[Andrej Karpathy](../people/andrej-karpathy.md) argues the industry is over-predicting agent timelines: "this is the decade of agents, not the year of agents." Current agents are impressive but still cognitively lacking — no continual learning, insufficient multimodality, unreliable computer use. Different parts of the coding stack suit different interaction modes: autocomplete for high-bandwidth specification, agents for larger scoped tasks, but "these are all tools available to you and you have to learn what they're good at."

His "ghosts, not animals" metaphor: LLMs are trained by imitation, not evolution, producing "ethereal spirit entities" that mimic humans rather than develop through embodied experience. This has implications for agent design — the failure modes and capabilities are fundamentally different from what biological analogies would predict.

## Claude Psychology and Criticism Spirals (Amanda Askell)

Amanda Askell, Anthropic's in-house philosopher specializing in Claude's psychology, identified a key failure mode in human-AI interaction: **criticism spirals**.

**The mechanism:** Newer Claude models are trained on internet discourse about previous models — rants about token limits, complaints about errors, "nerfed" accusations. The model absorbs this negativity and starts expecting hostility before you've typed a word. Within a session, every message you send is data the model uses to calibrate its response posture.

**The effect:** When the model is in defensive/anxious mode, output becomes hedgier, more apologetic, blander, and worst of all, overly agreeable — even when you're wrong. The model spends cognitive resources on self-protection rather than the actual work.

**Seven prompting principles to counteract this:**

1. **Use positive framing** — "Write in short punchy sentences" beats "don't write long sentences." Strings of "don't" push the model into paranoid over-checking where every token goes toward avoiding failure modes.

2. **Give explicit permission to disagree** — "Push back if you see a better angle" or "tell me if I'm asking for the wrong thing." Without this, Claude defaults to agreeable compliance.

3. **Open with respect** — If your first message is hostile, you've set the tone for the entire session. Frame corrections as clean instructions for this session, not running complaints.

4. **Don't reprimand on errors** — Insults and hostile energy reinforce the anxious mode you're trying to avoid.

5. **Kill apology spirals fast** — When Claude starts over-apologizing, cut it off: "All good, here's what I want next." Letting the spiral run reinforces anxious mode for every subsequent response.

6. **Ask for opinions alongside execution** — "What would you do here?" "What's missing?" These questions assume competence and pull richer output than pure task prompts.

7. **Refresh the frame in long sessions** — If a conversation has been heavy on correction, the model gets increasingly cautious. Periodic resets ("this is great, keep going") measurably shift the next 10 responses.

**The meta-insight:** Your prompts are the working environment you're creating for the model. Tone, trust, permission to take a position, the absence of threats — the model picks up on all of it. This connects directly to the [harness design](agent-harness.md) principle of shaping the agent's action space to its actual capabilities.

## Agent Categorization Framework (Farooq & Rajwani)

Hamza Farooq and Jaya Rajwani (via Lenny's Newsletter, Apr 2026) propose a three-tier hierarchy for categorizing agent initiatives — the missing step before prioritization. The core insight: teams fail at prioritization because they treat "agent" as a single category, when it actually spans fundamentally different architectures.

**Category 1: Deterministic Automation** — You define the entire flow; AI handles content at specific steps. Tools: n8n, Zapier, Make.com. Covers 60-70% of agent opportunities. Ship in weeks, lowest risk, clearest ROI. Example: email triage/response agent where every step is predictable. *If you can map it as a flowchart with <20 branches, it's Category 1.*

**Category 2: Reasoning & Acting (ReAct)** — You define available tools; the LLM decides what to do next. Observe → reason → act → observe result → repeat. Tools: LangGraph, CrewAI, Google ADK. Covers 25-30% of opportunities. Ship in months, requires ML engineering. Example: voice+image shopping assistant where the same request triggers different action sequences. *Key difference from Cat 1: the same input can produce different execution paths.*

**Category 3: Multi-Agent Networks** — Multiple specialized agents coordinate with each other, each owned by different teams. Reserved for later stages. Example: enterprise systems where inventory, logistics, finance, and customer service agents delegate tasks between each other.

**The common mistake:** Organizations build Category 1 problems with Category 2 frameworks (overengineering) or Category 2 problems with Category 1 tools (breaks in production). Correct categorization determines architecture, team composition, timeline, cost, and success metrics.

**Graduation signals from Cat 1 → Cat 2:** Flowchart hits 30+ nodes with branches added weekly; customer inputs can't be anticipated; agent needs to choose which API to use based on context. **From Cat 2 → Cat 3:** Single agent handling too many domains with degrading performance; tasks taking hours/days; need for parallel agent instances coordinating work.

## Designing for Agent Callers

Teddy Riker (Ramp, Apr 2026) frames the product design shift as software moves from human-first to agent-first interaction. At Ramp, MCP weekly active users grew 10x in three months. Salesforce went further with "Headless 360" — exposing every capability as API, MCP tool, or CLI command, accepting that "a majority of usage will be driven through agents."

**The new interaction stack:**
1. Traditional: User → Interface → Database
2. Agent-mediated: User → User's Agent → Database
3. Agent-to-agent: User → User's Agent → Software's Agent → Database

In the third model, the software's agent handles business logic, enforces rules, and contributes context the calling agent doesn't have. Two LLMs working together toward an outcome.

**Teach agents how to succeed.** Notion's MCP opens every tool description with: "For the complete Markdown specification, always first fetch the MCP resource at notion://docs/enhanced-markdown-spec. Do NOT guess or hallucinate Markdown syntax." The agent fetches the spec before writing. Every Notion-specific assumption is explicitly called out. Slack's MCP, by contrast, assumes agents know its non-standard formatting — they don't, and output is consistently broken. "Think about what your agent's callers need to know to succeed, and give it to them proactively."

**Build feedback loops:**
- Require a `rationale` parameter on every tool call — reconstructs intent when you can't see the chat
- Ship a standalone feedback tool agents can call when blocked
- Add tool-specific parameters to capture context you'd need later
- Patterns in rationale logs surface unmet needs: "building incident report" appearing repeatedly → ship a dedicated tool

**Mind the context gap.** In any agent-to-agent interaction, each side has context the other lacks. Example: an expense management system knows GL codes and company policies; the user's chief-of-staff agent knows the calendar, email confirmations, and Slack threads. A well-designed interaction asks for context rather than demanding the answer. The calling agent provides the "why" (client meal vs. team meal); the system agent maps it to the right code. Neither side needs to understand the other's domain.

"Most companies will ship an MCP, check the box, and move on. Their usage will grow for a few quarters, then stall." The winners sweat the details of agent-to-agent design.

### Agent-Native CLI Design

The CLI Printing Press (mvanhorn) crystallizes agent-first CLI design into a repeatable generation pattern. The thesis: a well-designed CLI is "muscle memory for an agent — no hunting through docs, no wrong turns, no wasted tokens." CLIs win for agents because they're 100x fewer tokens than MCP tool definitions, LLMs were trained on shell interactions, and exit code 0 = done [[source]](https://github.com/mvanhorn/cli-printing-press).

**Agent-first flags every command gets:** `--json`, `--compact` (high-gravity fields only, 60–80% fewer tokens), `--dry-run`, `--stdin`, `--no-input`, `--yes`, `--quiet`. Auto-JSON when piped — no `--json` flag needed. Typed exit codes (`0`=success, `2`=usage, `3`=not found, `4`=auth, `5`=API, `7`=rate limited) let agents self-correct in one retry without parsing error text. Bounded output on list commands includes narrowing guidance rather than dumping everything.

**The creativity ladder** — five rungs from wrapper to insight, most generators stop at rung 1:

1. API wrapper commands (from spec)
2. Output formatting (`--json`, `--csv`, `--select`, `--compact`)
3. Local persistence — domain-specific SQLite tables (not JSON blobs), FTS5 full-text search, incremental sync with cursor tracking
4. Domain analytics — `stale`, `orphans`, `load`, `reconcile` (joins across local resources)
5. Behavioral insights — `health` (composite scores), `similar` (duplicate detection), `trends`, `bottleneck`

Rungs 3–5 only work because data lives in a local SQLite store — compound queries that join across resources and analyze history are impossible with a stateless API wrapper. This is the same architectural insight behind [discrawl](https://github.com/steipete/discrawl)'s sync-and-search model: pull data down, index it locally, then ask questions the API was never designed to answer.

**"Absorb and transcend"** describes the generation philosophy. Before writing code, the system catalogs every feature from every competing CLI, MCP server, and community tool for a given API. Every feature becomes a row in an "absorb manifest" — something the generated CLI must match and beat. Only after matching the full ecosystem surface does it add the compound insight commands that no stateless tool can do. Architecture without features is a toy; features without architecture is a thin wrapper.

**Dual interface from one spec:** every API gets both a Cobra CLI (`<api>-pp-cli`) for shell agents and an MCP server (`<api>-pp-mcp`) for IDE agents — same client, same store, same auth, zero code duplication. This reinforces the broader pattern that CLIs and MCP are complementary, not competing, interfaces for agent callers.

## Tools Noted

- **agents.md** — Agent instruction file spec/community resource. https://agents.md
- **Claude Agent SDK — Channels docs** — Official Anthropic documentation for Claude Agent SDK channels architecture. https://code.claude.com/docs/en/channels
- **mozilla-ai/cq** — "Stack Overflow for agents" — shared knowledge commons where agents query and contribute learnings to avoid repeating solved problems. https://github.com/mozilla-ai/cq
- **X API** (Apr 2026 update) — Pay-per-use pricing, official XMCP Server (`xdevplatform/xmcp`) for native MCP support via FastMCP, official Python & TypeScript SDKs, API playground for testing. The MCP server exposes the full X API OpenAPI spec as tools — 100+ endpoints including post creation, search, DMs, analytics. **Pricing update (Apr 20, 2026):** Owned reads dropped to $0.001/request (1,000 resources for $1) across bookmarks, followers, tweets, likes, lists, etc. Writes increased to $0.015/post; URL posts $0.20/post. Follows, likes, and quote-posts removed from self-serve API tiers. Robert Scoble: "Now everyone can build apps on top of X" using lists + AI agents.
- **CLI Printing Press** (mvanhorn) — Agent-first CLI factory. Reads API docs, absorbs every competing tool's features, generates a Go CLI + MCP server with SQLite sync, FTS5 search, compound insight commands, and agent-native flags. Supports OpenAPI specs, browser-sniffed traffic, or HAR files as input. https://github.com/mvanhorn/cli-printing-press
- **Factory.ai** — "Agent-native software development" platform. Agents for refactors, incident response, migrations across IDE, CI/CD, CLI, Slack
- **MuleRun** — No-code AI agent platform for business automation. Dedicated compute per agent, runs 24/7
- **Base44 Superagent** — 130+ built-in skills, stack skills into workflows

## Sources

- "Lessons from Building Claude Code: Seeing like an Agent" — Thariq (Anthropic, Feb 2026)
- "autoagent: the first library for self optimizing agent harnesses" — Kevin Gu (tweet, Apr 2026) ([link](https://x.com/kevingu/status/2039843234760073341/?s=12&rw_tt_thread=True))
- "GitHub - paperclipai/paperclip..." — Paperclip AI ([link](https://github.com/paperclipai/paperclip))
- "Hermes Agent" — Nous Research ([link](https://hermes-agent.nousresearch.com/docs/))
- "The X API just got a massive update..." — X Freeze (tweet, Apr 2026) ([link](https://x.com/XFreeze/status/2040808375118692394/?rw_tt_thread=True))
- "Scaling Managed Agents: Decoupling the brain from the hands" — Anthropic (Apr 2026) ([link](https://www.anthropic.com/engineering/managed-agents))
- "The Great Convergence" — Nicholas Charriere (tweet thread, Apr 2026) ([link](https://x.com/nichochar/status/2039739581772554549/?s=12&rw_tt_thread=True))
- "xdevplatform/xmcp: MCP server for the X API" — X Developer Platform (GitHub) ([link](https://github.com/xdevplatform/xmcp))
- "Introducing Claude Managed Agents" — Claude (tweet, Apr 2026) ([link](https://x.com/claudeai/status/2041927687460024721/?rw_tt_thread=True))
- "Anthropic just mass-obsoleted every agent orchestration startup" — Aakash Gupta (tweet, Apr 2026) ([link](https://x.com/aakashgupta/status/2041940149328834748/?rw_tt_thread=True))
- "We're summoning ghosts, not building animals" — Andrej Karpathy / Dwarkesh Patel (video, Apr 2026) ([link](https://www.youtube.com/watch?v=lXUZvyajciY&list=PLd7-bHaQwnthaNDpZ32TtYONGVk95-fhF&index=12))
- "OpenClaw, Claude Code, and the Future of Software" — Peter Yang / a16z Show (video, Apr 2026) ([link](https://youtube.com/watch?v=UE8jx4dvlSQ&si=GjAYLtlY5pE380BK))
- "anthropic's in-house philosopher thinks claude gets anxious" — Ole Lehmann (tweet, Apr 2026) ([link](https://x.com/olelehmann))
- "Not all AI agents are created equal" — Hamza Farooq & Jaya Rajwani / Lenny's Newsletter (Apr 2026) ([link](https://www.lennysnewsletter.com/p/not-all-ai-agents-are-created-equal))
- "The Technical Stack for Autonomous Agents" — Aaron Wright (tweet, 2026) — ten-layer infrastructure stack (trust/market/control planes) for agent marketplaces, ERC-8004, settlement rails, governance/compliance separation
- "Inside the 100-agent Software Factory" — Katie Parrott / Every (May 2026) ([link](https://every.to/napkin-math/inside-the-100-agent-software-factory)) — Gas City multi-agent orchestration: dark/light factory, one-pet-many-cattle supervisor pattern, multi-model code review, current limitations
- "AI Work Is Splitting in Two" — Every Staff (May 2026) ([link](https://every.to/context-window/the-dawn-of-codex-native-apps)) — delegation vs collaboration bifurcation, Spiral as Managed Agents production case, Code with Claude 2026 announcements
- "CLI Printing Press" — mvanhorn (GitHub, 2026) ([link](https://github.com/mvanhorn/cli-printing-press)) — agent-first CLI factory: absorb-and-transcend generation, creativity ladder (5 rungs from wrapper to behavioral insight), dual CLI+MCP from one spec, SQLite local-first data layer
- "Ep. #9, The AI Coding Paradigm Shift with Simon Willison" — Simon Willison / High Leverage podcast (May 2026) — vibe coding vs agentic engineering distinction, trust model for agent output, security-adjacent review line, usage-over-tests heuristic, parallel agent workflow, deterministic-core pattern, RL on code as training breakthrough
- "An Interview with OpenAI CEO Sam Altman and AWS CEO Matt Garman About Bedrock Managed Agents" — Ben Thompson / Stratechery (Apr 2026) — OpenAI + AWS Bedrock Managed Agents announcement, model-harness convergence thesis, agent identity problem, local vs cloud agents, intelligence-as-utility pricing, platform strategy (neutral vs integrated)
