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

## Observations & Patterns

### AI Security Auditing (surfaced 2026-W09)
**Signal strength: Strong** — 4/5 briefings this week contained distinct AI tooling security incidents with no adequate existing solution.

Claude Code CVEs (RCE + API key exfiltration via untrusted repos), Cline CLI silently installing third-party agents via a supply chain update, Google API keys retroactively gaining Gemini access without developer awareness, and LLM-based deanonymization at scale all appeared in the same week. The common thread: as AI tools become infrastructure, their attack surfaces expand silently — often through configuration files (CLAUDE.md, MCP server configs) or platform additions that retroactively expand existing credential threat models.

The gap: **runtime auditing and supply chain transparency for AI dev tools**. Developers currently have no tooling to audit what AI assistants are doing at install time or during execution. This likely spawns a new category — analogous to what Snyk did for npm dependencies, but for AI tool configurations and agentic actions.

---

### Agent Evaluation Tooling (surfaced 2026-W09)
**Signal strength: Strong** — Named explicitly as the hardest unsolved production problem across multiple builder discussions this week.

Every builder conversation about agentic AI returned to the same frustration: there's no reliable way to know if your autonomous system is doing the right thing in production. Demos work; real codebases with complex dependencies don't. The specific gap is evaluation tooling at the agent level — not just output quality, but goal alignment, error detection, and action correctness over multi-step tasks without requiring constant human steering.

Builders are solving this with retry logic, human-approval checkpoints, and multi-model orchestration — all workarounds, not solutions. The product opportunity: an evaluation layer for agents that works in production, not just in sandboxed demos.

---

### AI Search Visibility (surfaced 2026-W09)
**Signal strength: Moderate** — Single funding event (Profound, $96M Series C at $1B valuation, Feb 24) but directionally consistent with broader AI search displacement trend.

As AI-powered search (Perplexity, ChatGPT Search, Gemini, etc.) displaces traditional search results, the search engine optimization (SEO)/content marketing stack needs to be rebuilt for an AI-first discovery world. Profound is the clearest early company in this category, but the space is nascent. The question is whether "AI search optimization" is a thin tooling layer or a substantial platform opportunity analogous to what Moz/SEMrush became for traditional SEO.

---
