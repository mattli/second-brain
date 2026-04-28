---
title: Product Vision
status: living
created: 2026-02-26
updated: 2026-04-12
---

# Product Vision

## North Star

Build something with positive impact on humanity or deep personal interest. No CRUD. Use what AI now makes possible that wasn't before.

---

## The Filter

Every new idea has to clear most of these. If it can't, it doesn't move forward. Work through them in order — the later questions only matter if the earlier ones pass.

1. **Does it ride model progress, or fight it?** Will this get better automatically as models improve, or will I have to rewrite it? Is the "intelligence" something the model does, or something I'm building? Avoid ideas whose core value is clever architecture — that work gets absorbed into base capabilities.

2. **Is there something here that takes time to accumulate?** A durable product has at least one time-accumulating advantage: compounding proprietary data, network effects, regulatory permission, trust built through track record. Without one of these, I'm building a temporary edge that gets competed away the moment models improve.

3. **Can I sell the outcome, not the tool?** Autopilot, not co-pilot. The user sets a goal once; the system delivers results. Tools compete against tools; outcomes compete against contractors, agencies, employees — structurally higher value.

4. **Is someone paying for this outcome today?** Through a contractor, agency, subscription, or service I could displace. For personal-software ideas, this question weakens — but the burden shifts to question 2: if nobody is paying today, there had better be something structural that makes the product defensible.

5. **Was this impossible before AI, and would it still be useful after the next model release?** Two directions. If a SaaS could've done it in 2020, skip. If Claude 6 makes it trivial for anyone to build, also skip. The sweet spot rides the current capability wave without being obsoleted by the next one.

6. **Am I reaching for this because it's the right shape, or because it's familiar?** Dev tools, PM tools, and AI infrastructure are where I spend my building time — so ideas in those shapes will always feel accessible. That's not the same as them being the right thing to build. Before committing, check whether the instinct is "this solves a problem I still have" or "this is the shape my mind defaults to."

7. **Do I actually live here?** *(See [Areas I Live In](#areas-i-live-in).)* Final gut check. Is the friction one I've personally felt this month, not something I can imagine feeling? Ideas in values-only areas fail here. Ideas in "engage with meaningfully" areas need harder scrutiny. Daily-tier ideas pass cleanly — but question 6 still applies.

---

## Areas I Live In

*Honest assessment, not aspirational. The filter question "do I live here" only works if this list reflects reality.*

**Daily or near-daily:**
- AI and developer tooling — building NanoClaw, running intelligence pipelines, using Claude Code and Claude.ai daily, reading AI news every morning
- Music theory and playing
- Self-learning — reading, absorbing, trying to understand things

**Engage with meaningfully, not daily:**
- Spirituality and philosophy
- Backpacking and the outdoors
- Product management — former practice, real intuition, but haven't worked as a PM in years; the domain has changed materially since (AI-native PM workflows, coding agents, the whole "what does a PM do now" question)

**Values, not domains** — things that would make an idea resonate, but not areas I live in well enough to see real problems:
- Positive impact on human flourishing
- Protecting what matters about the natural world
- Civic and political health

An idea in the first group passes the "do I live here" filter cleanly. Second group, partially — worth a harder look at whether the friction is real or imagined. Values-only: the filter should catch these. An idea that only connects to a value I hold, without a domain I live in, is probably not mine to build.

---

## Ideas In Flight

Active ideas tracked in [`ideas.md`](ideas.md).

---

## Operating Beliefs

The reasoning behind the filter, in case I need to remember why.

**Services, not software.** *(Sequoia, "Services: The New Software", Mar 2026)* The valuable companies won't be tools — they'll be services that deliver outcomes. The moat is domain expertise, data, and trust in a specific vertical. Start with a person and a result, not a technical idea.

**Moats in AI are things that take time to accumulate, not things that are hard to do.** *(Michael Bloch framework, Mar 2026 — see [business-moats-in-ai](../../../resources/wiki/concepts/business-moats-in-ai.md))* AI compresses how long it takes to *do* things. It doesn't compress how long it takes for things to *happen*. The durable moats are compounding proprietary data, network effects, regulatory permission, capital at scale, and physical infrastructure. What *isn't* a moat anymore: workflow embeddedness, ecosystem lock-in, software scale. For a solo builder, the idea has to have a plausible path to at least one time-accumulating advantage — or it's a temporary edge that gets competed away the moment models improve. Compounding proprietary data is the most accessible one at my scale: build something that generates unique data through real use over months or years.

**Autopilot, not co-pilot.** *(See [vertical-ai](../../../resources/wiki/landscape/vertical-ai.md) — Harvey's $0→$200M ARR playbook: selling work, not software.)* Tools compete on features and price against other tools. Autopilots compete against what it costs to get the outcome another way — a contractor, agency, employee. Structurally higher value, structurally harder to replace. Tools get copied in weeks; outcomes require years of track record.

**Let the model be smart. Don't try to out-clever it.** *(See [agentic-engineering](../../../resources/wiki/tools/agentic-engineering.md) — harnesses encode assumptions about what models can't do, and those assumptions go stale.)* Every successful LLM product is a simple pattern: a loop that calls the model, tools the model can use, and prompts telling it what to do. The temptation is to build clever scaffolding around this — novel multi-agent orchestration, custom memory systems, elaborate reasoning chains. Resist it. Anything you build to make the model smarter gets absorbed into the next model release. The effort is wasted. Spend your cleverness on the use case, the tools, the domain understanding, the prompts — not on trying to be smart where the model should be smart. Products built this way get better automatically as models improve. The wiki compiler is already this template: scheduled loop + Readwise/Filesystem MCP + instructions file as prompt.

**Personal friction beats sector analysis.** The best ideas will come from things that have annoyed me in the domains I actually live in, not from a TAM spreadsheet or a trending category.
