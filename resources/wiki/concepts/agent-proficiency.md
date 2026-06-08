---
created_at: 2026-04-05
last_updated: 2026-06-02
---

# Agent Proficiency

> TLDR: The skill of effectively managing and directing AI agents — structuring inputs, evaluating outputs, maintaining knowledge bases — is emerging as a core competency of the AI era, distinct from both coding and prompting.

## Overview

[Andrej Karpathy](../people/andrej-karpathy.md) coined "agent proficiency" as a "CORE SKILL of the 21st century" in April 2026. The argument: as AI agents become capable of handling increasingly complex tasks autonomously, the highest-leverage human skill shifts from doing the work to directing the systems that do it. This is not prompt engineering — it's the broader capability of maintaining structured data, writing clear agent instructions, and building feedback loops.

## The Shift

Aakash Gupta drew a parallel to software engineering's evolution 20 years ago: the best engineers stopped writing everything from scratch and started composing systems from components. The skill moved from "can you implement a B-tree" to "can you architect a system that uses 40 open-source libraries correctly."

The agent version: the people who compound fastest aren't fine-tuning models — they're the ones who:
- Maintain structured [knowledge bases](llm-knowledge-bases.md) their agents can navigate
- Write clear instructions and constraints for agent behavior
- Build feedback loops between data and AI outputs
- Evaluate and curate agent work (curation over creation)

## What It Looks Like in Practice

Karpathy's framing: "These are extremely powerful tools — they speak English and they do all the computer stuff for you." The barrier isn't technical skill but willingness to engage:

- Spending weekends firing up agentic coders to try things, instead of passive consumption
- Managing file directories and data pipelines for your agents
- Choosing which AI to point at which problem (BYOAI)

Gupta's metaphor: "The 21st century power user looks less like a programmer and more like an editor-in-chief: deciding what goes in, what gets compiled, what gets published, and which AI gets the assignment."

### The Skill File Method

A concrete framework for building agent proficiency: write markdown "skill files" that encode how a specific task should be done — the criteria, preferences, and domain expertise that make your judgment valuable — then hand the file to an agent and iterate.

The loop:
1. Pick a repeatable task where you already know what good looks like
2. Write the skill file yourself (the domain expertise must come from you, not the agent)
3. Hand it to the agent, review the output, give feedback
4. Let the agent improve the skill based on interactions
5. Once the agent handles that task reliably, move to the next one

The real signals that someone has built this kind of leverage: they can show a running agent setup, demonstrate real-time judgment on AI output, name things they've stopped delegating to AI and why, and point to the skill files their agents run on. Surface-level indicators — "knows how to prompt," "comfortable with ChatGPT," "uses AI tools daily" — are table stakes that don't distinguish.

## Levels of Delegation

A core dimension of agent proficiency is choosing the right level of AI delegation for a given task. Mike Taylor's eight-level framework maps the progression from basic chatbot use to full agent orchestration:

1. **Chatbot** — you ask, it answers (ChatGPT, Claude). Manual context setup each session.
2. **Copilot** — AI embedded in your workspace (Cursor, Gemini in Docs). Removes copy-paste but limited to single-file context.
3. **Agent** — multi-step execution with human approval at each step. Reactive — waits for you to initiate.
4. **Autopilot** — you describe the goal, the agent runs end-to-end, you review the result. This is where "vibe coding" lives.
5. **Workflows** — structured harnesses around the agent (plan-review-implement loops, compound engineering). The transition from vibe coding to agentic engineering.
6. **Assistant** — proactive, always-on agents that act without being prompted (monitoring, recurring work, background triage).
7. **Multi-agent** — parallel long-running agents with distinct responsibilities. Your role becomes team lead.
8. **Orchestrator** — a manager agent coordinates sub-agents. Highly experimental; even frontier engineers mostly fill the orchestrator role themselves.

The key insight: higher isn't better. The most proficient AI users operate at several levels simultaneously, matching the level to the task. The selection criteria is a trust-stakes calculus — how much you trust the AI to produce good output unsupervised, weighed against how consequential a failure would be. High-stakes tasks warrant lower levels (more supervision) or heavy engineering investment to make higher levels reliable. [[source]](https://every.to/guides/the-eight-levels-of-ai-adoption)

This also explains the [role asymmetry](#corporate-adoption) in adoption: knowledge workers currently cluster at levels 1–4, while engineers push into 5–8 because they can build the scaffolding (test suites, eval harnesses, structured workflows) that makes the higher levels safe. As platforms bake this scaffolding in, the accessible ceiling rises for everyone — but the skill of choosing the right level remains.

## Staying in the Loop

The emerging "shepherd of agents" narrative — get out of the programming loop, let agents build features end-to-end, just approve the PR — has a major blind spot: agents do not have good opinions. James Long (creator of OpenCode) argues that agent proficiency is not about delegation but about maintaining tight feedback loops even as you shift work to agents.

Two non-negotiable review habits:
- **Always read the diff.** Even if you're living inside a coding agent and rarely open your editor, the code review is where you catch structural decisions that compound. OpenCode built a dedicated diff viewer specifically because this step matters too much to skip.
- **Always run the product alongside the agent.** Your users will experience whatever you ship. If you stay out of the loop, you can't guarantee good experience. Interacting with live changes surfaces UX issues — like discovering that "Tab" is the instinctively correct keybinding for focus switching, not "f" — that no amount of code review alone would catch.

The cost of late discovery is asymmetric: the later you find issues, the harder they are to unwind. You could argue agents make it easier to refactor bad decisions after the fact, but by then users may already depend on the bad thing. Staying in the loop produces better outcomes from the start, with less total churn.

This maps directly to the "evaluate and curate agent work" bullet in the skill set above — the curation isn't a passive review gate but an active, continuous engagement with what the agent is producing.

## The Statistical Mimicry Problem

George Hotz (geohot) offers a sharper articulation of why staying in the loop matters: agents are statistical models that mimic the distribution of programming, not systems that understand it. The output is broken, but in ways that get harder to detect as models improve — which is exactly what you'd expect from an increasingly accurate statistical model. Old proxies for underlying quality like syntax and grammar are useless when the artifact wasn't produced by a human reasoning process.

This reframes the "always read the diff" discipline. The danger isn't obvious bugs — it's subtle structural wrongness that only surfaces when you try to build on the artifact in human ways. Hotz reports using agents extensively for [tinygrad](https://github.com/tinygrad/tinygrad) development and USB/PCIe reverse engineering: the agent frontloads progress, then gives you "a slot machine lever to pull to hope it gets the polish done. It never quite gets there." [[source]](https://substack.com/home/post/p-163103019)

The proficiency implication: knowing when to use agents and when not to is the core skill. Agents are useful for quick prototypes where polish doesn't matter and as a better search engine — but are "not close to the bar at any company I have worked at" as a software engineer. [[source]](https://substack.com/home/post/p-163103019)

## Organizational Asymmetry

Agent adoption hits large organizations harder than high-performing individuals or small teams. The mechanism is error correction: high performers naturally self-check agent output. Hotz observes that among strong engineers, no one has moved to a model where they don't carefully read and understand each line. They explore/exploit to tune the outer loops — when to use agents, when to trust them, how to structure inputs — but the review discipline holds.

In large organizations, feedback loops are slower and alignment is weaker. The bottom performers — the ones producing "10x output" with agents — won't have that self-check. The result: average output quality degrades even as volume explodes. More code, more apps, more features than ever before — "a golden era for buckets and buckets of slop, and a dark age for gems of quality." [[source]](https://substack.com/home/post/p-163103019)

This dynamic suggests agent proficiency may be most valuable not as an individual skill but as an organizational capability — the ability to maintain quality standards when the tools make it trivially easy to ship without them. The [Corporate Adoption](#corporate-adoption) trend of evaluating employees on AI usage needs the complementary metric: evaluating whether that usage actually produces good outcomes.

## The Frustration Trap

The conversational UX of coding agents creates a specific emotional hazard. Because agents speak in a relaxed, friendly tone — praising your ideas, apologizing for mistakes, promising to do better — they trigger the same social instincts you'd have with a human colleague. Paolo Scanferla calls this out directly: the illusion holds until things go wrong, and then the mismatch becomes infuriating.

The pattern: you correct a mistake, the agent apologizes and updates its memory. Five minutes later, same mistake. You correct again. The agent performs a postmortem, reflecting on what it should have done differently. But it keeps failing the same way, because the most probable path hasn't changed. If a colleague did this, you'd be justified in frustration — but with an agent, no amount of emotional pressure changes the output distribution.

This matters for agent proficiency because the frustration is a signal that you've slipped into treating the agent as a social peer rather than a probabilistic tool. The proficient response isn't to lash out or to demand the agent "try harder" — it's to restructure the input (better constraints, different prompting strategy, or switching tools entirely). Recognizing when you're caught in the anthropomorphic illusion is itself a skill, and possibly the hardest one to develop, because the illusion is a side effect of the same mechanism that makes LLMs useful in the first place.

## Relationship to AI Careers

The [Stanford CS230 lecture](../landscape/ai-careers.md) reinforces this from a different angle — the AI job market increasingly values people who can deliver business outcomes with AI tools, not just demonstrate technical knowledge. Agent proficiency is the practical manifestation of that shift.

## The Brain Fry Trap

Using AI tools without a structured system doesn't make you more productive — it often makes you less. The pattern: ask ChatGPT for a draft, copy it into a doc, ask another tool for a summary, paste into Slack, use another for research, another for editing. More tabs, same output, mounting cognitive overhead. HBR calls this "[Brain Fry](https://hbr.org/2026/03/when-using-ai-leads-to-brain-fry)" — working more while achieving less. This is the complement to the [frustration trap](#the-frustration-trap): where that one describes the emotional hazard of conversational agents, Brain Fry describes the productivity hazard of tool sprawl without integration.

## Corporate Adoption

Companies are now evaluating employees on AI proficiency directly. Zapier and Shopify rate employees specifically on AI tool usage. Aakash Gupta's framework for PM AI tool proficiency identifies three tiers: (1) chat-based agents (ChatGPT agent mode), (2) no-code/low-code agent builders (Lindy, Relay.app, Zapier, Make.com), and (3) coding agents (Claude Code, Cursor). The shift from "prompt engineering" to "context engineering" reflects the same evolution: the skill is in structuring what the agent knows, not just what you ask it.

[DHH](../people/dhh.md) frames it from the senior developer angle: agent proficiency lets senior developers "5x 10x their individual productivity" — the skill is knowing what to direct agents toward and how to evaluate their output. See [Knowledge Work Future](knowledge-work-future.md) for the broader implications.

The restructuring is no longer theoretical. In mid-2026, ClickUp laid off 22% of its workforce and introduced $1M salary bands specifically to attract "agentic-native" hires — people who can use AI to compress headcount into leverage. Wix, Webflow, and Meta followed with similar moves the same week. The pattern: flatten the org, cut entry-level and white-collar roles that AI can approximate, and reinvest the budget into AI infrastructure and the smaller number of high-leverage people who can direct it. The ClickUp CEO's framing was explicit — create budget for AI infra, attract agent-native talent fast, and become the first in their vertical to grow through AI-restructured productivity.

## The Enterprise Agent Deployer (Aaron Levie)

Aaron Levie (Box CEO, Apr 2026) predicts a new enterprise role: the **agent deployer and manager**. Not centralized — one or more on every team. The job description:

1. Identify highest-leverage workflows where throwing compute (agents) at a task could execute 100x faster or 100x more times — e.g., processing orders of magnitude more leads, automating contract review, streamlining client onboarding, building company-wide knowledge bases
2. Map the future-state workflow — structured and unstructured data flows, where the human interfaces with the agent, at which steps
3. Connect business systems — comfortable with skills, MCP, CLIs
4. Manage agents ongoing — run evals after model/data changes, track KPIs
5. Bridge technical and operational — relatively technical but also great at business

This may be an existing person repositioned or a net new hire. The role maps naturally to next-gen hires who are technical and leaning into AI. For anyone concerned about engineers in the future, this is an obvious landing zone.

The role description is essentially the enterprise version of what Karpathy calls "agent proficiency" — but formalized as a job function rather than a personal skill. See also: ericosiu's "Growth Operator" in [AI Startup Distribution](../landscape/ai-startup-distribution.md) for the marketing-specific version.

## Sources

- "Farzapedia, personal wikipedia of Farza..." — Andrej Karpathy (tweet thread, Apr 2026) ([link](https://x.com/karpathy/status/2040572272944324650/?s=12&rw_tt_thread=True))
- "The guy who literally wrote the most popular deep learning..." — Aakash Gupta (tweet, Apr 2026) ([link](https://x.com/aakashgupta/status/2040662476862394592/?s=12&rw_tt_thread=True))
- "How to 10x your productivity as a PM with AI tools" — Aakash Gupta (video, Apr 2026) ([link](https://youtube.com/watch?v=YKYQ-z6A9Fs&si=rM4oFGmcIRcItGyh))
- "The Claude Code Setup Nobody Shows You" — Aakash Gupta (video, Apr 2026) ([link](https://youtube.com/watch?v=Eqh2iwSl570&si=CgkjC-SZIXj-KR8C))
- "The more enterprises I talk to about AI agent transformation..." — Aaron Levie (tweet, Apr 2026)
- "Don't stay out of the loop" — James Long (tweet, May 2026) ([link](https://x.com/jlongster/status/2058197974321070379/?s=12&rw_tt_thread=True))
- "The User Is Visibly Frustrated" — Paolo Scanferla (article, May 2026) ([link](https://pscanf.com/the-user-is-visibly-frustrated/)) — added the frustration trap: conversational UX triggers social instincts that make agent failures disproportionately infuriating
- "The Eternal Sloptember" — George Hotz (article, May 2026) ([link](https://substack.com/home/post/p-163103019)) — agents as statistical mimicry, organizational asymmetry in error correction, and the quality-vs-volume tradeoff
- "How to become the AI-native hire every company wants" — Anita (tweet thread, May 2026) — skill file method for building agent proficiency, Brain Fry trap, ClickUp/Wix/Webflow restructuring signals
- "The Eight Levels of AI Adoption" — Mike Taylor, Every (article, May 2026) ([link](https://every.to/guides/the-eight-levels-of-ai-adoption)) — eight-level framework from chatbot to orchestrator; trust-stakes calculus for choosing delegation level; role asymmetry between knowledge workers and engineers
