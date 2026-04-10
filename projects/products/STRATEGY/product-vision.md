---
title: Product Vision
status: living
created: 2026-02-26
updated: 2026-03-02
---

# Product Vision

## North Star

I want to build something that has a positive impact on humanity or is of deep personal interest to me. I don't want to build crud — I want to build something meaningful that takes advantage of what AI makes possible now that wasn't possible before.

---

## Areas of Genuine Interest

- **Music theory and playing music** — not the music business
- **Spirituality and philosophy** — introspective, meaning-making
- **Climate change and environmental protection**
- **Improving people's lives and wellbeing**
- **Improving the political system / civic tech**
- **Backpacking and hiking** — protecting the outdoors
- **EdTech** — self-learner across many domains including guitar, coding, reading

---

## The Central Question

*What was impossible or impractical before AI that is now possible in these areas?*

---

## The Core Insight

I'm not just interested in these sectors academically — I live in most of them. My best product ideas will probably come from friction I've personally experienced, not from sector analysis.

---

## Active Ideas

Ideas with enough signal to warrant their own file. Each links to a dedicated note in `projects/ideas/`.

*None yet.*

---

## The Right Question

*Via Sequoia Capital, "Services: The New Software", March 5 2026*

The valuable companies won't be tools — they'll be services that deliver outcomes. The moat isn't the software, it's the domain expertise, the data, and the trust built up by delivering results in a specific vertical. Instead of starting with a technical idea, start with a person and a result. Who is paying for something today — a service, a contractor, a subscription — where AI could deliver the same outcome better or cheaper?

---

## The Business Model

Aim for autopilot, not co-pilot. A co-pilot sells a tool that helps a human do work. An autopilot sells the outcome itself — the human sets the goal once and the system delivers results. The moat in an autopilot business isn't the software, it's the track record, the calibrated expertise, and the institutional trust built up over time. Tools get copied in weeks. Outcomes require years to replicate.

This also sets the pricing ceiling: a tool competes on features and price against other tools. An autopilot competes against what it costs to get that outcome another way — a contractor, an agency, an employee. Structurally higher value, structurally harder to replace.

For a solo founder, this is the right model: go deep on one vertical, build genuine expertise, and deliver results better than anyone else in that narrow domain. That's a defensible position that doesn't require out-resourcing a big company.

---

## Watching

Observations that have surfaced in monthly summaries but aren't strong enough to act on yet. No links — just a sentence or two per item.

**[2026-03] AI security auditing for dev tooling:** AI coding tools are generating systematic security vulnerabilities (RCE, supply chain injection, privilege escalation) across every vendor simultaneously, with no runtime auditing or supply chain transparency tooling to address it — likely a new product category.

**[2026-03] Agent evaluation and observability:** No reliable way exists to know if an autonomous AI system is doing the right thing in production — goal alignment, error detection, and action correctness over multi-step tasks are unsolved at the agent level.

**[2026-03] Multi-agent coordination infrastructure:** Developers have converged on multi-agent architectures as the default pattern, but orchestration tooling (conflict resolution, context sharing, handoffs) doesn't work at production quality — multiple startups attempting, none solved.

---

## Architectural Principles

**[2026-04-10] LLM apps are loop + tools + prompts. Don't innovate over this.**

A tweet making the deliberately reductive claim: any successful LLM-powered product, underneath the surface, is the same shape — *a model in a for loop, calling tools, guided by prompts, running until the task is done*.

Unpacked:
- **Loop** — the model isn't called once. It thinks, calls a tool, gets a result, thinks again, repeats until done. This is the agent pattern. Claude Code, Cursor, NanoClaw agents, the wiki compiler — all this shape.
- **Tools** — functions the model can call (search, read files, run code, query APIs, send messages). MCP is one way to wire tools in; built-in tools are another.
- **Prompts** — instructions, system prompts, skills, context that shape *how* the model uses the tools. The wiki compiler instructions file is exactly this.

The punchline: **products like these scale with intelligence automatically.** Because the architecture is just `loop + tools + prompts`, the product gets better as the underlying model gets smarter — no rewrite required. Contrast with traditional software, where improvements require engineering work.

The warning: people keep trying to invent clever architectures (complex multi-agent orchestration, novel memory systems, custom reasoning frameworks) and most of those things either get absorbed into the base model's capabilities a few months later, or turn out to be unnecessary because the simple loop already works.

**Implication for what I build:** stop worrying about needing a novel AI architecture. The hard part isn't engineering — it's figuring out what to build, for whom, and wiring the right tools and prompts into the basic loop. Every product I build should look like this at the core. The differentiation lives in the use case and the quality of the prompts/tools, not in cleverness of the wiring.

The wiki compiler I built is already exactly this pattern: scheduled loop + Readwise/Filesystem MCP tools + the instructions file as the prompt. That's the template.
