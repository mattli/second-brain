# pmtxt

AI-native product management system. Web app that helps PMs at small startups answer "what should we build next?" by externalizing scattered product knowledge into a structured, AI-readable knowledge base and generating prioritized feature recommendations with ready-to-go coding agent prompts.

## Status

**Phase: Pre-Build / Customer Discovery**

V1 spec complete (2026-04-05). Office-hours session (2026-04-06) chose **"The Interview"** as the narrowest wedge. Design doc approved (9/10 quality, two adversarial review iterations). No code yet. Next step is talking to 5 PMs at small startups before writing code.

## Active design: "The Interview"

A standalone, single-session web experience. The PM answers 10-15 structured questions with AI pushback on vague answers. The system generates a structured knowledge base from the conversation and produces 3-5 prioritized feature recommendations with copy-pasteable coding agent prompts. No ongoing maintenance, no dashboard, no auth. Designed to be shared as a URL in r/ProductManagement, r/startups, r/ClaudeAI.

If PMs ask "can this update over time?" — that validates the compounding thesis and unlocks the rest of the V1 spec.

**Wireframe:** Three screens — interview with KB sidebar filling in real-time, KB overview with depth indicators, recommendations with grounded rationale and Copy Prompt action.
- HTML: `v0.1-wireframe.html` (open in a browser)
- Described inside `v0.1-spec.md` in the Wireframe section

## Doc hierarchy

Three active specs, each one level more granular than the one above it:

- **`v1-spec.md`** — the **long-term vision**. Full product: dashboard, KB maintenance, evaluation engine, approval workflow, ideas database, stakeholder input, comprehensiveness indicators, decision log. Still the destination.
- **`v0.1-spec.md`** — the **v0.1 product spec**. The narrowest slice of the vision that delivers value in a single session and tests the core hypothesis. Three screens, wireframe (merged in), KB format, recommendations format, distribution plan. v0.1 is what gets built first; the rest of the v1 spec earns its way in based on what users do after they finish their first session.
- **`v0.1-conversation-spec.md`** — the **conversational design** of the interview itself (scaffolding, being filled in). Operating principles, question sequence, anti-sycophancy rules, pushback patterns. One level deeper than the v0.1 product spec: that doc says *what* v0.1 is as a product; this doc says *how* the conversation actually runs. Also contains a Section 9 of decisions that belong in other docs and should be extracted later.

The v1 spec is the destination. The v0.1 spec is how you take the first concrete step. The v0.1 conversation spec is what makes that first step actually work as a conversation.

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
- `v1-spec.md` — long-term vision (full product spec, dated 2026-04-05)
- `v0.1-spec.md` — approved product spec for v0.1 "The Interview" (dated 2026-04-06, wireframe merged in 2026-04-08)
- `v0.1-wireframe.html` — HTML wireframe of the three screens (open in a browser); described inside `v0.1-spec.md`
- `v0.1-prompt-session.md` — queued prompt-engineering session to run before writing UI code; output target is `v0.1-prompts.md` (not yet created)
- `v0.1-conversation-spec.md` — scaffolding for the conversational design of the interview (questions, principles, pushback patterns); pairs with the v0.1 product spec
- `last30days-validation.md` — market validation from Reddit + X (Mar 2026)
- `reddit-feedback.md` — user research from r/startups (Feb 2026)

**Archive (`_archive/`):** Documents superseded by newer work and kept only for historical context. Do not treat as current.
- `2026-03-30-pmtxt-requirements.md` — earlier requirements doc (CLI-first framing, superseded by the 2026-04-05 web-app spec)
- `2026-03-30-001-feat-pmtxt-v1-plan.md` — earlier implementation plan written against the CLI-first requirements (also superseded)
- `2026-04-04-pmtxt-brainstorm-summary.md` — product-shape rethink that fed into the 2026-04-05 spec; the conclusions are now baked into the active spec, so the brainstorm itself is historical
- `# pmtxt Interview — Wireframe.md` — earlier wireframe stub with an awkward filename, replaced by the merged Wireframe section in `v0.1-spec.md`
- `v0.1-interview-wireframe.md` — wireframe description stub, merged into `v0.1-spec.md` on 2026-04-08

## Open questions

- ~~How many interview questions hit the right balance of KB depth vs PM completion rate?~~ Resolved 2026-04-07 in `v0.1-conversation-spec.md`: 5 questions max for v0.1.
- Should the generated KB be downloadable markdown or display-only?
- How has the actual PM workflow changed in the AI-native era? (Founder hasn't observed recently — biggest risk, gated by customer discovery)

## Next steps

**Deadline:** PM happy hour on Tuesday, April 21 — natural forcing function for v0.1.

1. **Fill in the conversation spec** (`v0.1-conversation-spec.md`). Section 1 (Sarah, purpose, walk-away state), Section 2 (operating principles), Section 3 (question text), Section 4 (anti-sycophancy rules), Section 5 (pushback patterns).
2. **Customer discovery in parallel.** Talk to 5 PMs at small startups about how they decide what to build now. Post in r/ProductManagement: "How has AI changed the way you prioritize features?"
3. **After discovery,** refine The Interview question design based on what's actually painful in 2026.
4. **Week of April 14-20:** Build the three-screen MVP (interview → KB overview → recommendations).
5. **April 21:** Show at PM happy hour. Listen for "can this update over time?".

## Competitive landscape

- **ChatPRD** — 100K+ users, "AI writes docs faster" approach. Validates the space.
- **Aligno** (Seattle) — "Cursor for Product Management." Direct competitor.
- **Traycer** — Structured Q&A for spec generation, dev-focused.
- **Status quo** — ChatGPT/Claude with manual context dumping every session.
