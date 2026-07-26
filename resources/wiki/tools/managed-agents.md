---
created_at: 2026-07-26
last_updated: 2026-07-26
---

# Managed Agents

> TLDR: Anthropic's and OpenAI/AWS's hosted agent infrastructure — decoupling model ("brain"), harness, and sandbox ("hands") into independently replaceable, stateless components so agents can scale, recover from crashes, and operate inside enterprise security boundaries.

## Anthropic

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

**Cached context across sub-agents:** Each sub-agent in this architecture keeps its own prompt cache, so repeat calls within the same sub-agent don't pay full price for the same context twice. This makes both the advisor and orchestrator cost-routing patterns described in [Agentic Engineering](agentic-engineering.md) more economical at scale — the frontier model's cache persists across its sparse advisory calls, and each worker's cache persists across its dense execution steps.

**In production — Spiral:** Every's writing tool Spiral is one of the first products using Managed Agents' multi-agent capabilities in production. When a user requests multiple drafts, a managed agent spins up multiple Opus-class subagents to write drafts in parallel, cutting response time by 20–30 seconds per draft. This demonstrates the "many brains, many hands" architecture working at product scale — orchestration as a feature, not infrastructure overhead.

## OpenAI + AWS

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

## Related

- [Agentic Engineering](agentic-engineering.md) — the broader discipline this infrastructure serves
- [Agent Harness](agent-harness.md) — harness-level patterns Managed Agents virtualizes and outlasts
- [Loop Engineering](loop-engineering.md) — recurring systems that call agents like these

## Sources

- "Scaling Managed Agents: Decoupling the brain from the hands" — Anthropic (Apr 2026) ([link](https://www.anthropic.com/engineering/managed-agents))
- "Introducing Claude Managed Agents" — Claude (tweet, Apr 2026) ([link](https://x.com/claudeai/status/2041927687460024721/?rw_tt_thread=True))
- "Anthropic just mass-obsoleted every agent orchestration startup" — Aakash Gupta (tweet, Apr 2026) ([link](https://x.com/aakashgupta/status/2041940149328834748/?rw_tt_thread=True))
- "An Interview with OpenAI CEO Sam Altman and AWS CEO Matt Garman About Bedrock Managed Agents" — Ben Thompson / Stratechery (Apr 2026) — OpenAI + AWS Bedrock Managed Agents announcement, model-harness convergence thesis, agent identity problem, local vs cloud agents, intelligence-as-utility pricing, platform strategy (neutral vs integrated)
- "AI Work Is Splitting in Two" — Every Staff (May 2026) ([link](https://every.to/context-window/the-dawn-of-codex-native-apps)) — Spiral as Managed Agents production case
