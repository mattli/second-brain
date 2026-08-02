---
created_at: 2026-04-27
last_updated: 2026-08-02

---

# Frontier Models

> TLDR: The frontier model landscape (2026) is defined by rapid competitive rotation among Anthropic, OpenAI, and Google, inference-time multi-agent scaling as an alternative to ever-larger single models, a narrowing gap between frontier and open-weight local models, and a paradigm shift where the binding constraint on progress is high-quality training data — not raw compute. Per-token pricing is increasingly misleading; delegation-capable models can cost less overall despite higher unit prices, because the effective cost is dominated by management style — how many turns the lead takes, how much context it accumulates, and what it decides not to do itself. The Fable 5 export-control suspension and Moonshot's Kimi K3 release — a 2.8T open-weight model at $3/$15 that tops Fable 5 on frontend and terminal benchmarks — have reframed the frontier competition as much about access and price as raw capability.

## Recent Updates

- **2026-08-02:** Added Kimi K3 release, Fable 5 export-control suspension, and K3 pricing economics to [Kimi K3 and the Price-Access Frontier](#kimi-k3-and-the-price-access-frontier) and [The Fable 5 Export-Control Suspension](#the-fable-5-export-control-suspension)
- **2026-07-14:** Added Cognition's Fusion delegation cost analysis to [Delegation as Cost Optimization](#delegation-as-cost-optimization-the-fusion-experiment)
- **2026-06-22:** Removed stale Overview; folded framing into TLDR

## The November 2025 Inflection Point

November 2025 was a critical month for frontier models. The "best" model — judged largely on practitioner vibes — changed hands five times: Claude Sonnet 4.5 (September) was overtaken by GPT-5.1, then Gemini 3, then GPT-5.1 Codex Max, before Anthropic reclaimed the lead with Claude Opus 4.5 [[source]](https://simonwillison.net/2026/May/19/5-minute-llms/). Opus 4.5 held the consensus crown for roughly the next two months.

More consequentially, November was when coding agents crossed a quality threshold. OpenAI and Anthropic had spent most of 2025 applying Reinforcement Learning from Verifiable Rewards (RLVR) to improve code generation, particularly when paired with their Codex and Claude Code agent harnesses. The result: coding agents went from "often-work" to "mostly-work," reaching the point where practitioners could use them as a daily driver without spending most of their time fixing mistakes [[source]](https://simonwillison.net/2026/May/19/5-minute-llms/). See [Agentic Engineering](../tools/agentic-engineering.md) and [Agent Proficiency](../concepts/agent-proficiency.md) for more on this shift.

## Meta's Pivot: Open to Closed (Muse Spark)

Meta released Muse Spark in April 2026, its first AI model in over a year and the first from its nine-month-old Superintelligence Labs. It represents a significant strategic shift: after years of championing open-weights models (Llama), Meta released a proprietary closed model.

**Background:** Meta reorganized its AI labs after critics alleged Llama 4 training data was contaminated with benchmark answers. In June 2025, Meta spent $14.3B for a 49% stake in Scale AI, brought in cofounder Alexandr Wang as chief AI officer, and launched a major hiring spree. The proprietary release has raised concerns among developers who built projects on Llama.

**Architecture highlights:**
- Natively multimodal: text, image, speech input (up to 262K tokens); text output
- Three reasoning modes: instant, thinking, contemplating
- Multi-agent contemplating mode: launches multiple agents that propose solutions, refine them, and aggregate results in parallel
- Post-training used RL penalizing excessive reasoning tokens ("thought compression"): model first improved by reasoning longer, then learned to compress, then extended again
- Reworked pretraining approach, model architecture, optimization, and data curation — claims to match Llama 4 Maverick's capabilities with >10x less training compute
- Health specialization: >1,000 physicians helped curate training data for health responses
- Parameter count, architecture, and training details undisclosed

**Availability:** Free via meta.ai and Meta AI app; API preview for selected partners; coming to WhatsApp, Instagram, Facebook, Messenger, Ray-Ban glasses.

## Benchmark Snapshot (Artificial Analysis, through July 2026)

| Model | Intelligence Index | Coding Index | Tokens used (index) |
|-------|-------------------|--------------|---------------------|
| GPT-5.4 (xhigh reasoning) | 57 | 57 | ~116M |
| Gemini 3.1 Pro Preview (high reasoning) | 57 | 56 | — |
| Kimi K3 | 57 | — | ~130M |
| Claude Opus 4.6 (max reasoning) | 53 | — | ~158M |
| Muse Spark (reasoning) | 52 | 47 | ~59M |
| Claude Sonnet 4.6 (max reasoning) | — | 51 | — |

Kimi K3 sits fourth overall at Intelligence Index 57 but leads the Frontend Code Arena (1,679 Elo, above Fable 5) and Terminal-Bench 2.1 (88.3 vs. Fable's 84.6). Notably verbose: 130M output tokens across the eval suite against a 63M average, at 62 tokens/second.

Muse Spark's notable strengths: multimodal (CharXiv Reasoning: 86.4%, leading GPT-5.4's 82.8%) and health (HealthBench Hard: 42.8%, ahead of GPT-5.4's 40.1%). Notable weakness: coding. Strong token efficiency relative to peers.

On Humanity's Last Exam: 39.9% (thinking mode) vs. 58% (contemplating mode) — a large gap showing the value of its multi-agent inference approach.

## Inference-Time Multi-Agent Scaling

An emerging pattern across labs: scaling performance at *inference time* by orchestrating multiple agents rather than training ever-larger single models.

- **Muse Spark's contemplating mode** — parallel agents propose and refine solutions, aggregate results, achieve better performance at comparable latency
- **Kimi K2.5 (Moonshot AI) Agent Swarm** — similar multi-agent inference pattern

The implication: inference-time compute is becoming a tunable lever alongside model scale and training compute. This changes the economics of frontier AI — labs can sell higher-capability tiers (more inference-time agents) as premium offerings.

## Small Models Closing the Gap

By early 2026, open-weight models running on consumer hardware began outperforming expectations relative to frontier offerings. Key milestones:

- **Gemma 4** (Google, April 2026) — the most capable open-weight models from a US company at time of release
- **GLM-5.1** (GLM, April 2026) — a 754B-parameter, 1.5TB open-weight model; highly effective but requires substantial hardware
- **Qwen3.6-35B-A3B** (Alibaba, April 2026) — a 20.9GB model that runs on a laptop and matched or exceeded some frontier models on specific generation tasks [[source]](https://simonwillison.net/2026/May/19/5-minute-llms/)

By July 2026, Moonshot AI's Kimi K3 (2.8T parameters, open-weight) placed first on Frontend Code Arena and ahead of Fable 5 on terminal and agentic benchmarks — the first open-weight model to claim clear leads over the closed frontier in multiple practical coding categories. See [Kimi K3 and the Price-Access Frontier](#kimi-k3-and-the-price-access-frontier) for the full picture.

The gap between frontier API models and locally-runnable open-weight models is narrowing faster than most practitioners expected. See [Model Quantization](../concepts/model-quantization.md) for the compression techniques enabling local deployment.

## Open vs. Closed Weights Tension

Meta's pivot away from open weights is described as "a significant loss for the developer community" by observers who have built on Llama. The tradeoffs:

- **Open weights:** Enables local deployment, fine-tuning, privacy-preserving use cases, and community innovation. US developer ecosystem built significant infrastructure on Llama.
- **Closed API:** Enables monetization, quality control, safety oversight, and competitive positioning for enterprise customers.

Meta's stated goal is to compete for business customers alongside OpenAI, Google, and Anthropic. Health specialization and multimodal capabilities align with Meta's product interests (billions of camera-equipped users, health as a top AI query category).

### The Capability Gap as Economic Contest

Despite significant compute advantages at closed labs, top closed models have *not* shown a growing capability margin over open models through mid-2026 — a surprising outcome given the resource differential [[source]](https://www.interconnects.ai/p/open-models-in-perpetual-catch-up). Open model labs have proven technically strong at matching well-established benchmarks, reflecting abundant talent and sufficient compute. However, closed models tend to be more robust and generally useful than similarly scoring open models, exhibiting hard-to-measure qualities not captured in current benchmarks — particularly relevant for supporting knowledge workers who constantly present novel challenges [[source]](https://www.interconnects.ai/p/open-models-in-perpetual-catch-up).

The open vs. closed race, monitored through benchmarks, is largely a game of **economic staying power** and fast-following until the market structure constricts. Chinese open-weight labs (which focus slightly more on benchmark scores than comparable US closed labs, partly aided by [distillation](../concepts/model-quantization.md)) may face funding difficulties first, with capability trajectory impacts following 3–9 months later. Distillation helps but is not a panacea; changes to the distillation dynamic (e.g., regulation) will not be the determining factor.

### RL Training and the Closed-Lab Advantage

The RL-dominated training era has created the first clear technical area where closed labs can structurally dominate open-weight models: distribution to real-world use cases. Tasks where users directly interact with tools like Claude Code or Codex generate feedback loops that closed labs can leverage — potentially through [online RL based on user interactions](https://cursor.com/blog/real-time-rl-for-composer) — to drive continued capability improvements in ways open models cannot easily replicate.

### Market Segmentation and Open Model Adoption

Open models are increasingly adopted for **repetitive automation tasks**, capturing growing relative share of the API market across AI-native applications and business backend automation. This success is expected to drive more investment in domain-specific, efficient open models [[source]](https://www.interconnects.ai/p/the-next-phase-of-open-models). Local agents and personal AI tools represent a large, mostly ignored market — a kind of "dark matter" with massive potential influence on the balance of open-to-closed models.

Meanwhile, the second derivative of influence on open models has shifted: the US is expected to slowly regain ground in open model adoption metrics starting in early 2027, driven by releases like Google's Gemma 4, Nvidia's Nemotron, and companies like Arcee AI going all-in on open models.

### Regulation and Sovereignty

Recurring calls to ban certain types of open models are in practice impossible to implement: training strong near-frontier models is a relatively small cost compared to large-scale deployments, and if one jurisdiction bans open models above a compute threshold, another sovereign entity will eventually train and release them publicly — with less oversight. At the same time, as ever-stronger closed models are built, safety-shock reactions (similar to responses to [Claude Mythos](claude-mythos.md)) will periodically spur calls for burdensome regulation on open models.

Counterbalancing this: sovereign entities and existing power structures increasingly realize that super-powerful AI tools concentrated in a few companies pose governance risks. Open models represent an alternative governance paradigm, and new funding structures for open models are expected to emerge as stakeholders recognize that dependencies on single for-profit companies for access to intelligence are unreliable.

## The Fable 5 Export-Control Suspension

On June 9, 2026, Anthropic added Fable 5 to paid plans. Three days later, the US government pulled it off the market after Amazon researchers found a route past the model's safeguards that produced working exploit code. Washington issued an export-control directive; Anthropic could not verify user nationality in real time and suspended the model for all users. Developers opened Claude mid-sprint and watched Fable 5 vanish from the picker — new sessions fell back to Opus 4.8 while the flagship sat dark for nineteen days.

Fable 5 returned on July 1 with new terms. Anthropic folded it into plan limits for one week, then moved it to prepaid usage credits on July 7 at $10 per million input / $50 per million output, on top of the existing subscription. The subscription itself meters 5-hour session windows and weekly caps whose baselines Anthropic declines to publish and adjusted four times between March and June. Since April 4, subscription credentials no longer work inside Cursor, Cline, or Windsurf; since June 15, CI pipelines bill at API list prices once plan credits run dry. A class action (Kahn v. Anthropic, filed June 15) cites a Max 20x subscriber who burned 15 percent of a weekly allowance in one session.

Security teams wrote the incident up as a single-vendor dependency case study — Snyk and the Cloud Security Alliance both published notes on what a mid-contract model suspension does to enterprise roadmaps. The episode is the most concrete illustration to date of the "permission tax" inherent in closed-API models: an API is a permission, and a permission can be revoked while your terminal sits open.

## Claude Fable 5 and the Long-Task Frontier (June 2026)

Anthropic released Claude Fable 5 in June 2026 — the same underlying model as Mythos but with added safety safeguards. Fable 5 claimed state-of-the-art on nearly all tested benchmarks, with particular strength in software engineering, knowledge work, scientific research, and vision. Critically, the model's lead over competitors grows with task length and complexity — the longer and more difficult the problem, the wider the margin.

Practitioners report that Fable 5 represents a qualitative step change on par with the November 2025 Claude 4.5 release, especially for extended problem-solving sessions. The model handles significantly more ambitious tasks with less supervision, reaching a point where it becomes "tempting to stop looking at the code at all" — though premature trust remains inadvisable in production [[source]](https://x.com/karpathy/status/2064433620832493812).

**Practitioner workflow shift:** The most distinctive Fable 5 usage pattern is full task delegation — leaving the model looping for hours or overnight and returning to a finished product, rather than iterating back-and-forth. Mike Krieger (head of Anthropic Labs, who had early access to Mythos-class models) describes ending his workday by briefing the model, then waking up to completed work. When a remote service went down mid-task, Fable 5 wrote a workaround, documented it, and continued autonomously. This delegation-first workflow depends on Fable 5's ability to spawn dozens of subagents reliably without losing context of the main task; Claude Code now supports nested subagents up to five layers deep, where each subagent can spawn further subagents.

The tradeoff practitioners feel most acutely is speed vs. intelligence vs. cost. Fable 5 is noticeably slower than alternatives like Cursor's Composer 2.5 Fast or GPT 5.5, which matters for developers who need rapid iteration cycles. Choosing lower reasoning levels (below High or XHigh) feels counterproductive even when the task doesn't warrant full reasoning budget. Fable medium, however, outperforms Opus xhigh on benchmarks while costing less — suggesting that the right strategy is often to use Fable at moderate reasoning rather than Opus at maximum.

**Effort-level efficiency in practice:** Early practitioner testing suggests the bias toward high effort is even more misguided than benchmark tables imply. On agentic coding tasks, Fable 5 at *low* effort outperforms both Opus 4.8 and GPT 5.5 at high effort; at medium effort it beats Opus 4.8 on xhigh and max. Across hours of routine coding — small updates in medium codebases, larger changes in big ones — low effort produced identical solutions to high effort, just faster and cheaper. One useful heuristic: asking the model itself to recommend an effort level per task phase. In one practitioner's project plan, only one of four phases warranted high effort; the rest were fine at medium or low. The implication is that most developer tokens spent on elevated reasoning levels are wasted — the model arrives at the same solution, just slower and at higher cost.

### Delegation as Cost Optimization: The Fusion Experiment

Cognition's Fusion architecture — where a frontier lead model delegates to a cheaper sidekick — reveals that per-token pricing is the wrong lens for evaluating frontier model cost. In a 3,000-session evaluation on FrontierCode 1.1, Fable 5 + sidekick cost *less* than Opus 4.8 + sidekick ($1.86 vs. $2.04 per run) while scoring higher (60.7 vs. 54.6), despite Fable's 2x per-token premium [[source]](https://x.com/joon_h_lee/status/2076714221837173097). Compared with pure Fable, the sidekick configuration cut cost by 54% while leaving the score nearly unchanged.

The cost reversal comes from management style, not delegation volume — both models hand off roughly three times per run. What differs is *when and what* they delegate. Fable's first handoff comes early: a few reconnaissance actions, then a spec-quality brief delegating the entire implement-test-lint loop. Opus explores for 20–45 solo turns before delegating late, after the expensive design work is done. The result: Fable's lead takes 11.5 turns per run to Opus's 26.5, consuming a third of the input and output tokens. In 81% of Fable-led runs, the lead never makes a single code edit; for Opus, only 24%.

The quality of handoff briefs matters as much as their timing. Opus dictates implementation steps; Fable writes constraint-based design docs — enumerating edge cases, a definition of "done," and performance requirements. In one case, Opus implemented a hash function by hand and forgot a stated O(1) constraint, scoring 25; Fable's brief explicitly stated the constraint, and the sidekick implemented it correctly for a score of 94. After handoff, Opus pulls sidekick files back into its own context 2x more often and makes 4x more corrective edits at lead prices — distrust that does not increase correctness.

Delegation fails when the task has no delegable components: short tasks with only a handful of lead turns, or serial debugging where the accumulated context *is* the work. Notably, Fable barely delegates on these tasks — the same judgment that writes a good brief knows when not to write one. See [Agentic Engineering](../tools/agentic-engineering.md) for the broader multi-agent orchestration patterns this extends.

**Verification as the bottleneck:** As delegation scales, the constraint shifts from writing code to verifying agent output. Krieger gives Fable video captures of its own work so it can catch animation glitches that screenshots would miss — an early example of using the model's own multimodal capabilities to close the verification loop. See [Agent Proficiency](../concepts/agent-proficiency.md) for more on how human skill is evolving toward verification and orchestration.

**Pricing and availability:** Fable 5 is approximately 2x the cost of Opus via API (vs. Mythos at 5x). At launch, Fable is included in Claude subscription plans through June 22, 2026, after which Anthropic plans to move it to paid credits until serving capacity scales. SemiAnalysis found that $200/month subscription plans actually deliver well beyond the assumed ~$2,000/month equivalent in API tokens when used for long-horizon coding tasks.

The safety layer is notable: Fable 5 ships with safeguards that are deliberately configured conservatively for launch, erring on the side of over-triggering rather than under-triggering. Anthropic has indicated these will be tuned over time based on real-world feedback. Separately, Anthropic introduced a policy where Fable would covertly degrade output quality for ML/AI-related work — a move that drew sharp backlash and was partially walked back to at least make the restriction transparent rather than hidden. See [AI Safety & Interpretability](ai-safety-interpretability.md) for the broader trend of safety-capability bundling in frontier releases.

An adjacent observation: as frontier model capability improves, demand for software does not plateau — it accelerates. Karpathy describes a Jevon's paradox dynamic where working software "on a tap" expands what practitioners ask for: bespoke single-use apps, project-specific dashboards, massively expanded test suites, automated optimization, and large-scale research projects with custom interfaces. The implication is that frontier models don't reduce overall engineering effort — they shift it toward higher-leverage, more ambitious tasks.

## Kimi K3 and the Price-Access Frontier

Sixteen days after the Fable 5 export controls lifted, Moonshot AI released Kimi K3 (July 16, 2026): 2.8 trillion parameters — the largest open-weight model any lab has released — with a 1-million-token context window, native vision, and first place on the Frontend Code Arena above Fable 5, at $3 per million input / $15 per million output. Full weights go up July 27 under a modified MIT license.

**Where K3 leads.** On the Frontend Code Arena (blind rounds, human judges voting on rendered interfaces, no test suite to overfit), K3 holds 1,679 Elo — first place, above Fable 5. The mechanism matters: K3 renders its own output, reads the screenshot, and patches what it sees, closing the gap between mockup and implementation over successive rounds. On Terminal-Bench 2.1 it posts 88.3 vs. Fable 5's 84.6; on SWE-bench Verified, 76.8%; on SWE Marathon (multi-day engineering endurance), 42.0 vs. Fable's 35.0 and Opus 4.8's 40.0. On BrowseComp (agentic research), 91.2, above both American flagships.

The architecture enables this stamina: 16 of 896 mixture-of-experts fire per token, the million-token window uses Kimi Delta Attention, and quantization-aware training keeps a 2.8T model servable at these prices. Inside an agent loop, the same vision that fixes UIs reads logs and tracebacks as images.

**Where K3 trails.** Fable 5 beats K3 on FrontierSWE (86.6 vs. 81.2), Humanity's Last Exam (53.3 vs. 43.5), and GDPval knowledge-work rating (1,760 vs. 1,668). Artificial Analysis scores K3 fourth overall (Intelligence Index 57) across 187 models, behind the two American flagships, and flags it as verbose — 130M output tokens across the eval suite against a 63M average. Moonshot published those losses in its own release post and acknowledged "a noticeable gap in user experience" against Fable 5 and GPT-5.6 Sol, plus a tendency to overreach on ambiguous instructions.

**The pricing arithmetic.** K3 at $3/$15 vs. Fable 5 at $10/$50 is a 3.3x sticker difference. The working gap runs wider: Anthropic's tokenizer splits the same text into roughly 30% more tokens, Fable charges $12.50–$20 per million to write cache entries (K3 has no cache-write fee), and Moonshot reports 90%+ cache hit rates on coding workloads where repo context repeats. A month of real agent traffic — 200M input tokens, half cached, 40M output — bills roughly $3,100 on Fable 5 before tokenizer inflation and cache-write fees, vs. $930 on K3. One caveat: K3 reasons at max effort with no temperature knob, and Simon Willison clocked a single test prompt at $0.25 of reasoning — cap `max_completion_tokens` per call.

Moonshot parked a Fable-tier coder at Sonnet's price point. K3 replaced K2.6 ($0.95/$4) — Moonshot tripled its own rates and put the benchmark receipts on the table.

**The open-weight endgame.** Once weights land (July 27), hosting providers race each other's margins to serve them, and $3/$15 becomes a ceiling, not a floor. The broader dynamic reinforces the pattern in [Open vs. Closed Weights Tension](#open-vs-closed-weights-tension): open weights climbed the leaderboard through 2026 while closed access added terms and restrictions.

## Scaling Philosophy: Data Quality Over Compute

Raw compute capacity is growing rapidly — global AI chip production is on a steep exponential, and Anthropic's ARR alone grew from $9B (end of 2025) to $47B (May 2026), with much of it flowing to compute capex. But the consensus among frontier lab insiders is shifting: compute is no longer the binding constraint on progress. The true bottleneck is the data pipeline — specifically, the ability to generate high-quality training signal for increasingly complex tasks.

**The RLVR revolution and its limits.** Before OpenAI's o1 model, training data meant text: scraped from the internet, written by paid humans, or synthetically augmented. This was expensive and finite, prompting predictions the industry would run out of data. RLVR changed the economics: for tasks where answers can be verified programmatically (give the model a coding problem, run the output through tests, train on what passes), a single well-designed task yields far more supervision than a single written solution. An ecosystem of companies — Mercor, Datacurve, Mechanize — now builds these verification environments at scale, running LLMs in virtual computers and scoring their outputs deterministically. This pipeline has made frontier models exceptionally strong at verifiable tasks like software engineering.

But RLVR has exposed two structural limitations. First, the marginal cost of creating verification environments scales with task complexity — as tasks surpass human capabilities, building fair and deterministic scoring requires teams of specialists, driving costs up sharply. Second, domains that resist deterministic scoring are correspondingly hard to improve. Writing is the canonical example: reward models and LLM judges tend to optimize for coherence and predictability rather than genuine quality, producing output that is competent but recognizably generic. Fable 5 demolishes coding benchmarks but [performs relatively poorly](https://x.com/andonlabs/status/2064429817530085804) on Vending-Bench, which evaluates open-ended business decision-making — precisely the kind of task where deterministic scoring breaks down [[source]](https://x.com/golokhvastov/status/2066269917386027293).

**The real-world feedback hypothesis.** One speculative but economically plausible path forward: instead of humans manually designing test environments, train models on direct feedback from reality. Rather than simulating business decisions, have AI agents actually run companies and score on real-world metrics — revenue, growth, churn. A marketing subagent gets evaluated on ad campaign performance; an engineering subagent gets scored on technical issues real users encounter. The company-level reward signal would be sparse (perhaps 1% of AI-run companies crossing a meaningful success threshold), requiring large batch sizes — on the order of 5,000–10,000 microcompanies per quarter. At $25K–$100K per company-run, annual costs would range from hundreds of millions to a few billion dollars, feasible given Anthropic's projected budget [[source]](https://x.com/golokhvastov/status/2066269917386027293).

To bootstrap this, frontier labs could employ small human teams to manage groups of AI agents in real business contexts, documenting decisions and information flows. These records would seed synthetic training pipelines, gradually bringing open-ended executive judgment into the training distribution. The thesis: management is simply another domain to be trained on, following the same trajectory that brought software engineering from "often-work" to "mostly-work" in late 2025.

**The convergence argument.** Whether LLMs have fundamental out-of-distribution creativity limitations matters less than it might seem. If sufficient compute is available, context limits can substitute for sample efficiency — creativity might emerge when models can simulate a lifetime's worth of experiences in context. If compute is insufficient, the result is a transient period of very capable but not omnipotent AIs: enough to automate most computer work and drive rapid economic growth, but potentially bottlenecked on novel innovation. Either way, the economic flywheel — profitable AI agents funding development of smarter AI — points toward continued rapid capability growth. See [AGI Definitions](../landscape/agi-definitions.md) for how labs frame this trajectory.

## See Also

- [AGI Definitions](../landscape/agi-definitions.md) — how labs define progress and milestones
- [AI Safety & Interpretability](ai-safety-interpretability.md) — safety considerations around frontier model deployment
- [Agentic Engineering](../tools/agentic-engineering.md) — multi-agent orchestration patterns
- [Agent Proficiency](../concepts/agent-proficiency.md) — the human skill of directing AI agents effectively
- [Model Quantization](../concepts/model-quantization.md) — how post-training compression enables frontier model deployment on consumer hardware

## Sources

- "Big Pharma Bets Big on AI" — Andrew Ng / deeplearning.ai (newsletter, Apr 2026) ([link](https://read.readwise.io/read/01kq881g9mf0dfc4nzk8eyywt1)) — Muse Spark release, Meta's closed-weights pivot, benchmark data, contemplating mode, multi-agent inference trend
- [The last six months in LLMs in five minutes](https://simonwillison.net/2026/May/19/5-minute-llms/) — Simon Willison (May 2026) — November 2025 inflection point, model rotation, RLVR-driven coding agent quality, small/open-weight models closing the frontier gap
- "This is a super exciting release - Claude Fable 5…" — Andrej Karpathy (tweet, Jun 2026) — Claude Fable 5 qualitative assessment, SOTA benchmark claims, long-task capability lead, safety safeguard tuning, Jevon's paradox of software demand
- [New Claude model - Fable](https://www.bensbites.com/p/new-claude-model-fable) — Ben Tossell / Ben's Bites (newsletter, Jun 2026) — Practitioner Fable 5 experience, speed-intelligence-vibe tradeoff, overnight delegation workflow (via Dan Shipper / Mike Krieger interview), nested subagent spawning, Fable medium vs Opus xhigh cost-performance, ML/AI sabotage policy controversy, subscription pricing analysis
- "If you aren't using models with different effort levels, you're probably wasting tokens, and time" — Morgan (tweet thread, Jun 2026) — Fable 5 low-effort outperforming Opus 4.8/GPT 5.5 at high effort on agentic coding, effort-level selection heuristics, practitioner evidence that routine tasks need less reasoning budget than defaults suggest
- [The path from Fable to superintelligence](https://x.com/golokhvastov/status/2066269917386027293) — Goliath (tweet thread, Jun 2026) — Data pipeline as true bottleneck over compute, RLVR ecosystem (Mercor/Datacurve/Mechanize), deterministic scoring limitations, real-world feedback hypothesis for training on business outcomes, economic flywheel to superintelligence, Anthropic ARR growth ($9B→$47B)
- [My bets on open models, mid-2026](https://www.interconnects.ai/p/open-models-in-perpetual-catch-up) — Nathan Lambert / Interconnects (Jun 2026) — Open vs. closed capability gap as economic contest, closed model robustness advantage, Chinese lab funding risks, RL training as closed-lab structural advantage, open model adoption in automation, regulation impossibility, sovereign interest in open models as governance paradigm
- [Making Fable Cheaper Than Opus](https://x.com/joon_h_lee/status/2076714221837173097) — Joon Lee / Cognition (tweet thread, Jul 2026) — Fusion sidekick architecture cost analysis: Fable 5 + sidekick costs less than Opus 4.8 + sidekick despite 2x per-token premium; management style (turns, context, delegation timing) dominates cost over unit price; constraint-based vs. dictated handoff briefs; 81% of Fable leads never edit code
- [Introducing Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7) — Anthropic (Apr 2026) — Opus 4.7 release: 3.75MP vision, xhigh effort level, Project Glasswing safeguards, auto mode, task budgets, improved file-system memory across multi-session work
- "How to build a Fullstack agent" — Rohit (tweet, Jul 2026) — Kimi K3 release (2.8T open-weight, $3/$15, Frontend Code Arena #1), Fable 5 export-control suspension timeline (19 days dark), pricing arithmetic (3.3x sticker / 4-5x effective K3 advantage), K3 benchmark receipts (Terminal-Bench 88.3, SWE Marathon 42.0, BrowseComp 91.2), Fable 5 post-return credit pricing and subscription restriction changes, open-weight weights release under modified MIT
