---
date: 2026-03-28
topic: debate-perspectives
---

# Debate Perspectives — Opposing Viewpoints on Controversial Takes

## Problem Frame

People live in filter bubbles and rarely encounter the strongest version of the opposing argument on controversial topics. Existing discourse (social media, news) is tribal and low-quality. There's no lightweight way to see two well-constructed perspectives genuinely engage with each other's values — not just assert their own position.

## Requirements

**Content Pipeline**
- R1. Given a controversial statement, quote, or topic, AI discovers the strongest real arguments on each side from existing sources (Reddit, op-eds, debates, X posts)
- R2. AI drafts a structured debate from discovered arguments; human edits and approves before publishing
- R3. Each voice makes its case firmly and clearly — no hedging, no "both sides have valid points" filler
- R4. Each voice engages with the other side's moral framework and values, not just its own (moral reframing approach)
- R5. The goal is understanding, not entertainment or provocation — readers should walk away grasping why reasonable people disagree

**Content Format**
- R6. Debates are static, pre-generated content — not live chatbots or real-time interactions
- R7. Each debate is presented as a back-and-forth dialogue on a clean web page
- R8. Input can be a policy topic, a controversial statement, a quote, or a cultural take — not limited to formal policy debates
- R9. Each debate has a shareable permalink

**Scope and Brand**
- R10. Launch focused on political and cultural topics to establish a clear brand identity
- R11. Architecture should not preclude broadening to non-political controversial takes later (tech, lifestyle, business)

## Success Criteria

- Debates feel genuinely illuminating — a reader with a strong opinion should encounter at least one argument they hadn't considered
- Content is shareable — people send debate links to others to make a point or start a conversation
- The tone lands in "firm but engaging" — not bland, not inflammatory

## Scope Boundaries

- No live chat or real-time bot interaction — static content only
- No user accounts or user-generated debates in V1
- No moderation system needed (no user interaction to moderate)
- No monetization in V1 — this is an experiment to test whether the content resonates
- No newsletter, no social media formatting — just the website with shareable links
- No clip/highlight extraction — full debates only

## Key Decisions

- **Static content over chatbots**: Simpler to build, no moderation burden, content quality is controllable. The dialogue format gives the *feel* of a conversation without the infrastructure of one.
- **Moral reframing as differentiator**: The product thesis is that arguments which speak the other side's moral language are more persuasive than louder arguments. This is the editorial voice of the product.
- **Controversial statements as input, not just policy topics**: Broadens the content surface area and makes the product more shareable. A debate about a viral tweet is more interesting than "Healthcare Policy: Two Perspectives."
- **AI-assisted editorial, not fully automated**: AI discovers and drafts; human curates and approves. Sidesteps AI guardrail issues (real human arguments are sharper), ensures quality, and the editorial step is where the product voice lives.
- **Experiment-first approach**: No monetization, no scale planning. Build it, publish a batch, see if people share it.

## Outstanding Questions

### Resolve Before Planning

(None — all blocking questions resolved)

### Deferred to Planning
- [Affects R7][Technical] What's the simplest web stack for static debate pages with a clean dialogue UI? (Static site generator? Simple React app? Plain HTML?)
- [Affects R1][Needs research] Best sources and methods for AI-assisted argument discovery (Reddit API, X API, news archives, academic databases)
- [Affects R4][Needs research] Prompt engineering strategy for moral reframing in the drafting step — how to structure discovered arguments so each side engages with the other's values
- [Affects R9][Technical] URL structure and hosting for shareable permalinks
- [Affects R8][Needs research] How to handle topics where the "two sides" framing is itself misleading (e.g., climate science, vaccines) — does the product need an editorial policy on this?

## Next Steps

-> `/ce:plan` for structured implementation planning
