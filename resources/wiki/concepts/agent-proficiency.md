---
created_at: 2026-04-05
last_updated: 2026-05-26
---

# Agent Proficiency

> TLDR: The skill of effectively managing and directing AI agents — structuring inputs, evaluating outputs, maintaining knowledge bases — is emerging as a core competency of the AI era, distinct from both coding and prompting.

## Overview

Andrej Karpathy coined "agent proficiency" as a "CORE SKILL of the 21st century" in April 2026. The argument: as AI agents become capable of handling increasingly complex tasks autonomously, the highest-leverage human skill shifts from doing the work to directing the systems that do it. This is not prompt engineering — it's the broader capability of maintaining structured data, writing clear agent instructions, and building feedback loops.

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

## Staying in the Loop

The emerging "shepherd of agents" narrative — get out of the programming loop, let agents build features end-to-end, just approve the PR — has a major blind spot: agents do not have good opinions. James Long (creator of OpenCode) argues that agent proficiency is not about delegation but about maintaining tight feedback loops even as you shift work to agents.

Two non-negotiable review habits:
- **Always read the diff.** Even if you're living inside a coding agent and rarely open your editor, the code review is where you catch structural decisions that compound. OpenCode built a dedicated diff viewer specifically because this step matters too much to skip.
- **Always run the product alongside the agent.** Your users will experience whatever you ship. If you stay out of the loop, you can't guarantee good experience. Interacting with live changes surfaces UX issues — like discovering that "Tab" is the instinctively correct keybinding for focus switching, not "f" — that no amount of code review alone would catch.

The cost of late discovery is asymmetric: the later you find issues, the harder they are to unwind. You could argue agents make it easier to refactor bad decisions after the fact, but by then users may already depend on the bad thing. Staying in the loop produces better outcomes from the start, with less total churn.

This maps directly to the "evaluate and curate agent work" bullet in the skill set above — the curation isn't a passive review gate but an active, continuous engagement with what the agent is producing.

## Relationship to AI Careers

The [Stanford CS230 lecture](../landscape/ai-careers.md) reinforces this from a different angle — the AI job market increasingly values people who can deliver business outcomes with AI tools, not just demonstrate technical knowledge. Agent proficiency is the practical manifestation of that shift.

## Corporate Adoption

Companies are now evaluating employees on AI proficiency directly. Zapier and Shopify rate employees specifically on AI tool usage. Aakash Gupta's framework for PM AI tool proficiency identifies three tiers: (1) chat-based agents (ChatGPT agent mode), (2) no-code/low-code agent builders (Lindy, Relay.app, Zapier, Make.com), and (3) coding agents (Claude Code, Cursor). The shift from "prompt engineering" to "context engineering" reflects the same evolution: the skill is in structuring what the agent knows, not just what you ask it.

[DHH](../people/dhh.md) frames it from the senior developer angle: agent proficiency lets senior developers "5x 10x their individual productivity" — the skill is knowing what to direct agents toward and how to evaluate their output. See [Knowledge Work Future](knowledge-work-future.md) for the broader implications.

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
