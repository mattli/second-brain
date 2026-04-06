# pmtxt

AI-native product management system. Web app that helps PMs at small startups answer "what should we build next?" by externalizing scattered product knowledge into a structured, AI-readable knowledge base and generating prioritized feature recommendations with ready-to-go coding agent prompts.

## Status

**Phase: Pre-Build / Customer Discovery**

V1 spec complete (2026-04-05). Office-hours session (2026-04-06) chose **"The Interview"** as the narrowest wedge. Design doc approved (9/10 quality, two adversarial review iterations). No code yet. Next step is talking to 5 PMs at small startups before writing code.

## Active design: "The Interview"

A standalone, single-session web experience. The PM answers 10-15 structured questions with AI pushback on vague answers. The system generates a structured knowledge base from the conversation and produces 3-5 prioritized feature recommendations with copy-pasteable coding agent prompts. No ongoing maintenance, no dashboard, no auth. Designed to be shared as a URL in r/ProductManagement, r/startups, r/ClaudeAI.

If PMs ask "can this update over time?" — that validates the compounding thesis and unlocks the rest of the V1 spec.

**Wireframe:** Three screens — interview with KB sidebar filling in real-time, KB overview with depth indicators, recommendations with grounded rationale and Copy Prompt action.
- HTML: `2026-04-06-pmtxt-interview-wireframe.html` (open in a browser)
- Description: `2026-04-06-pmtxt-interview-wireframe.md`

## Spec ↔ design relationship

- **`2026-04-05-pmtxt-v1-spec.md`** — the **long-term vision**. Full product: dashboard, KB maintenance, evaluation engine, approval workflow, ideas database, stakeholder input, comprehensiveness indicators, decision log. Still the destination.
- **`2026-04-06-pmtxt-interview-design.md`** — the **V1 build target**. The narrowest slice of the vision that delivers value in a single session and tests the core hypothesis. The Interview is what gets built first; the rest of the spec earns its way in based on what users do after they finish their first session.

The spec is the destination. The design doc is how you take the first concrete step.

## Key reframe (from the office-hours session)

The original spec framed pmtxt's value as "AI gives better recommendations because it has persistent context." A cross-model challenge in the office-hours session pointed out that 1M-token context windows have collapsed the technical gap — a PM can paste their full context into Claude fresh each time and get equally good answers.

The reframe: the value of a persistent, structured KB is **forced externalization of tacit knowledge**, not better AI output. Most PMs can't use AI effectively because their context isn't organized — it lives in Slack, Notion, email, and their heads. The KB makes that scattered knowledge explicit and accessible. Compounding and recommendation quality are real but secondary benefits.

This reframe changes what "first moment of value" looks like: it's the PM watching their tacit knowledge become structured during the interview, not the recommendations on the next screen.

## Target user

Someone operating in the PM/technical founder overlap at a 2-15 person startup. Defined by behavior, not job title — they make product decisions AND use AI coding tools.

## Tech stack (V1)

- Next.js (existing repo at github.com/mattli/pmtxt)
- Anthropic API with prompt caching
- localStorage for session state (no database in V1)
- Auto-download generated KB files on completion (handles incognito browsing)
- Vercel deployment

## Files

**Active (in this folder):**
- `README.md` — this file
- `2026-04-05-pmtxt-v1-spec.md` — long-term vision (full V1 spec)
- `2026-04-06-pmtxt-interview-design.md` — approved design doc for the V1 build target ("The Interview")
- `2026-04-06-pmtxt-interview-wireframe.html` — HTML wireframe of the three screens
- `2026-04-06-pmtxt-interview-wireframe.md` — wireframe description (so it's discoverable in Obsidian, which doesn't show HTML files in the tree)
- `last30days-validation.md` — market validation from Reddit + X (Mar 2026)
- `reddit-feedback.md` — user research from r/startups (Feb 2026)

**Archive (`archive/`):** Documents superseded by newer work and kept only for historical context. Do not treat as current.
- `2026-03-30-pmtxt-requirements.md` — earlier requirements doc (CLI-first framing, superseded by the 2026-04-05 web-app spec)
- `2026-03-30-001-feat-pmtxt-v1-plan.md` — earlier implementation plan written against the CLI-first requirements (also superseded)
- `2026-04-04-pmtxt-brainstorm-summary.md` — product-shape rethink that fed into the 2026-04-05 spec; the conclusions are now baked into the active spec, so the brainstorm itself is historical
- `# pmtxt Interview — Wireframe.md` — earlier wireframe stub with an awkward filename, replaced by `2026-04-06-pmtxt-interview-wireframe.md`

## Open questions

- How many interview questions hit the right balance of KB depth vs PM completion rate?
- Should the generated KB be downloadable markdown or display-only?
- How has the actual PM workflow changed in the AI-native era? (Founder hasn't observed recently — biggest risk, gated by customer discovery)

## Next steps

1. **Customer discovery first.** Talk to 5 PMs at small startups about how they decide what to build now. Post in r/ProductManagement: "How has AI changed the way you prioritize features?"
2. After discovery, refine The Interview question design based on what's actually painful in 2026
3. Build the three-screen MVP (interview → KB overview → recommendations)
4. Share in communities, watch what happens, listen for "can this update over time?"

## Competitive landscape

- **ChatPRD** — 100K+ users, "AI writes docs faster" approach. Validates the space.
- **Aligno** (Seattle) — "Cursor for Product Management." Direct competitor.
- **Traycer** — Structured Q&A for spec generation, dev-focused.
- **Status quo** — ChatGPT/Claude with manual context dumping every session.
