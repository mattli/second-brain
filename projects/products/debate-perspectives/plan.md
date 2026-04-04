---
title: "feat: Build Debate Perspectives static content site"
type: feat
status: active
date: 2026-03-28
origin: docs/brainstorms/2026-03-28-debate-perspectives-requirements.md
---

# feat: Build Debate Perspectives static content site

## Overview

Build a standalone static website that publishes AI-assisted debates on controversial topics. Each page presents a back-and-forth dialogue between two opposing voices, with shareable permalinks. The content pipeline discovers real arguments from Reddit, X, and news sources, then uses Claude to synthesize them into structured debates for human editorial review.

## Problem Frame

People live in filter bubbles and rarely encounter the strongest version of the opposing argument. Existing discourse is tribal and low-quality. This product presents two well-constructed perspectives that genuinely engage with each other's values — not just assert their own positions. (see origin: docs/brainstorms/2026-03-28-debate-perspectives-requirements.md)

## Requirements Trace

- R1. AI discovers strongest real arguments on each side from existing sources (Reddit, op-eds, X)
- R2. AI drafts structured debate; human edits and approves before publishing
- R3. Each voice makes its case firmly — no hedging
- R4. Each voice engages with the other side's moral framework (moral reframing)
- R5. Goal is understanding — readers grasp why reasonable people disagree
- R6. Static, pre-generated content
- R7. Back-and-forth dialogue on a clean web page
- R8. Input can be any controversial statement, quote, or topic
- R9. Shareable permalink per debate
- R10. Launch focused on political/cultural topics
- R11. Architecture allows broadening to non-political topics later

## Scope Boundaries

- No live chat or real-time bot interaction (see origin)
- No user accounts or user-generated debates in V1
- No moderation system needed
- No monetization in V1
- No newsletter, no social media formatting
- No clip/highlight extraction
- The content pipeline is a local script, not a hosted service

## Context & Research

### Static Site Stack

Astro is the best fit for this use case. Content Collections provide type-safe structured data (JSON debates), zero JS ships by default (debates are pure text), and file-based routing gives clean permalinks automatically. daisyUI's chat component provides production-quality dialogue bubbles (left/right aligned, speaker names, color-coded) with zero custom CSS. Cloudflare Pages offers unlimited bandwidth on the free tier — critical if a debate goes viral.

### Argument Discovery Pipeline

The existing `last30days` NanoClaw infrastructure already handles authenticated Reddit search (via ScrapeCreators) and X search (via Bird tokens). Adding NewsAPI's free tier (2,000 searches/month) covers op-eds and editorial content. This means the hardest part of sourcing — authenticated API access — is already solved.

Key Reddit sources for quality arguments: r/ChangeMyView (steelmanned arguments with delta system), r/NeutralPolitics (source-required), r/PoliticalDiscussion, r/AskConservatives, r/AskALiberal.

Intelligence Squared US (intelligencesquared.com) publishes Oxford-style debate transcripts with expert panelists — pre-structured steelman arguments on both sides. Useful supplementary source for topics they have covered.

### External References

- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- daisyUI Chat component: https://daisyui.com/components/chat/
- Cloudflare Pages free tier: unlimited bandwidth, 500 builds/month
- NewsAPI free tier: 2,000 searches, development use
- Feinberg & Willer (2015) moral reframing research — foundational for R4

## Key Technical Decisions

- **Astro + Tailwind + daisyUI over Next.js or Hugo**: Astro is content-first with zero JS overhead. Next.js is over-engineered for static text. Hugo's templating is awkward for component-style UI. daisyUI gives chat bubbles out of the box. (Advances R6, R7)
- **JSON content collections over markdown**: Debates are structured data (alternating turns with speaker attribution). JSON maps directly to a rendering loop with zero parsing. Markdown would require custom remark plugins for dialogue notation. (Advances R7)
- **Cloudflare Pages over Vercel/Netlify**: Unlimited bandwidth on free tier. If a debate goes viral, Vercel caps at 100GB/month. No serverless needed since there is no backend. (Advances R9)
- **Existing last30days infra over new API integrations**: ScrapeCreators and Bird tokens are already configured. Reusing them means the discovery pipeline costs pennies per topic with zero new auth setup. (Advances R1)
- **Hybrid sourcing (retrieval + AI synthesis) over pure AI generation**: Pure AI generation hedges, fabricates citations, and produces stale arguments. Retrieving real arguments first, then having Claude synthesize, gives authentic content with real attribution. (Advances R3, R4, R5)
- **Local scripts over hosted pipeline**: The content pipeline runs on the developer's machine as CLI scripts. No hosted backend, no queue, no database. Right-sized for an experiment producing a batch of debates. (see origin: experiment-first approach)

## Open Questions

### Resolved During Planning

- **Web stack**: Astro + Tailwind + daisyUI + Cloudflare Pages. Simplest path to a polished static site with dialogue UI.
- **Argument sources**: Existing last30days (Reddit, X) + NewsAPI free tier for op-eds. Under $20 total for dozens of debates.
- **URL structure**: `/debates/{slug}/` via Astro content collections and file-based routing.
- **AI provider for synthesis**: Claude via API. The guardrail concern is mitigated by the hybrid approach — Claude is synthesizing and structuring *real* arguments it was given, not generating positions from scratch. This is a much easier prompting task than asking it to "argue for gun control."

### Deferred to Implementation

- **Prompt engineering for moral reframing**: The exact prompt that gets Claude to structure arguments so each side engages with the other's values needs experimentation. The input (real sourced arguments) helps, but the synthesis prompt is where R4 lives.
- **Editorial policy for misleading "two sides" framing**: Topics like climate science or vaccines don't have equally valid opposing positions. Need to decide during content creation whether to skip these, reframe them (e.g., "what policy response is appropriate"), or add editorial notes.
- **daisyUI theme customization**: Exact colors, typography, and visual identity for the site. The research suggests serif headlines (e.g., Fraunces) + system sans-serif for bubble text, but this needs design iteration.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
Content Pipeline (local scripts):

  Topic Input (controversial statement/quote)
        │
        ▼
  ┌─────────────────────┐
  │  Discovery Script    │──── last30days (Reddit via ScrapeCreators)
  │  (source-collect.sh) │──── last30days (X via Bird tokens)
  │                      │──── NewsAPI (op-eds)
  └──────────┬──────────┘
             │ raw sources (JSON)
             ▼
  ┌─────────────────────┐
  │  Synthesis Script    │──── Claude API
  │  (draft-debate.sh)  │──── Moral reframing prompt
  └──────────┬──────────┘
             │ draft debate (JSON)
             ▼
  ┌─────────────────────┐
  │  Human Editorial     │──── Edit JSON in editor
  │  Review & Approval   │──── Adjust tone, verify sources
  └──────────┬──────────┘
             │ approved debate JSON
             ▼
  ┌─────────────────────┐
  │  Astro Static Site   │──── Content collection reads JSON
  │  (npm run build)     │──── Generates static HTML pages
  └──────────┬──────────┘
             │
             ▼
  Cloudflare Pages (deploy via git push)
```

Debate JSON schema (directional):

```json
{
  "title": "Should AI development be paused?",
  "slug": "ai-pause",
  "date": "2026-03-28",
  "topic": "Technology",
  "prompt": "The original controversial statement or question",
  "participants": {
    "left": { "name": "Label", "position": "One-line stance" },
    "right": { "name": "Label", "position": "One-line stance" }
  },
  "turns": [
    { "speaker": "left", "text": "..." },
    { "speaker": "right", "text": "..." }
  ],
  "sources": ["url1", "url2"]
}
```

## Implementation Units

- [ ] **Unit 1: Project scaffold and deployment**

  **Goal:** Working Astro site deployed to Cloudflare Pages with Tailwind and daisyUI configured.

  **Requirements:** R6, R9

  **Dependencies:** None

  **Files:**
  - Create: `debate-site/` (new repo root — standalone project, not inside nanoclaw)
  - Create: `debate-site/package.json`
  - Create: `debate-site/astro.config.mjs`
  - Create: `debate-site/tailwind.config.mjs`
  - Create: `debate-site/src/pages/index.astro` (placeholder)

  **Approach:**
  - Scaffold with `npm create astro@latest`
  - Add Tailwind integration via `npx astro add tailwind`
  - Install daisyUI and register as Tailwind plugin
  - Set up Cloudflare Pages project (git-connected deploys from main branch)
  - Verify deployment works with a placeholder page

  **Patterns to follow:**
  - Astro's official starter template structure

  **Test scenarios:**
  - Happy path: `npm run build` produces static output with no errors
  - Happy path: Deployed site loads on Cloudflare Pages URL
  - Edge case: daisyUI chat classes render correctly (not purged by Tailwind)

  **Verification:**
  - Site is live at a Cloudflare Pages URL with the placeholder page visible

- [ ] **Unit 2: Debate content schema and dialogue page**

  **Goal:** Astro content collection for debates with a dialogue page template using daisyUI chat bubbles.

  **Requirements:** R6, R7, R9, R11

  **Dependencies:** Unit 1

  **Files:**
  - Create: `debate-site/src/content/config.ts` (Zod schema for debates collection)
  - Create: `debate-site/src/content/debates/` (directory for debate JSON files)
  - Create: `debate-site/src/content/debates/_example.json` (sample debate for development)
  - Create: `debate-site/src/components/DebateThread.astro` (chat bubble rendering loop)
  - Create: `debate-site/src/layouts/Base.astro` (HTML shell, fonts, meta)
  - Create: `debate-site/src/pages/debates/[...slug].astro` (dynamic route from content collection)

  **Approach:**
  - Define Zod schema matching the debate JSON structure (title, slug, date, topic, participants, turns, sources)
  - Build DebateThread component that loops over turns and renders daisyUI `chat chat-start` / `chat chat-end` bubbles
  - Use distinct colors per side (e.g., `chat-bubble-primary` vs `chat-bubble-secondary`)
  - Base layout includes a distinctive headline font for debate titles and system sans-serif for bubble text
  - The `topic` field in the schema supports non-political categories for future broadening (R11)

  **Patterns to follow:**
  - daisyUI chat component: `chat-start`, `chat-end`, `chat-bubble`, `chat-header`
  - Astro content collections dynamic routing pattern

  **Test scenarios:**
  - Happy path: Example debate renders as alternating left/right chat bubbles with speaker names
  - Happy path: `/debates/example-slug/` resolves to the correct debate page
  - Edge case: Debate with only 2 turns renders correctly (minimal conversation)
  - Edge case: Long turn text wraps properly in bubble on mobile viewport
  - Edge case: Debate with missing optional `sources` field still renders

  **Verification:**
  - Example debate page is visually correct with chat bubble layout, readable on mobile

- [ ] **Unit 3: Homepage and social sharing**

  **Goal:** Index page listing all debates, plus OpenGraph meta tags so shared links preview well.

  **Requirements:** R9, R10

  **Dependencies:** Unit 2

  **Files:**
  - Modify: `debate-site/src/pages/index.astro` (replace placeholder with debate listing)
  - Create: `debate-site/src/components/DebateCard.astro` (card component for index)
  - Modify: `debate-site/src/layouts/Base.astro` (add OG meta tags)

  **Approach:**
  - Index page queries all debates from the content collection, sorted by date
  - Each debate renders as a card with title, topic tag, and participant positions
  - OG tags on debate pages: `og:title` (debate title), `og:description` (left position vs right position), `og:type` (article)
  - Clean, editorial homepage design — generous whitespace, debates as the only content

  **Patterns to follow:**
  - Astro `getCollection()` for querying content collections

  **Test scenarios:**
  - Happy path: Index page lists all debates with titles and topic tags
  - Happy path: Sharing a debate URL on a platform shows title and description in link preview
  - Edge case: Index page with zero debates shows an empty state (not an error)

  **Verification:**
  - Homepage lists debates, clicking one navigates to the debate page. OG tags render in link previews (testable via opengraph.xyz or similar validator).

- [ ] **Unit 4: Argument discovery script**

  **Goal:** CLI script that takes a topic and outputs raw source material from Reddit, X, and news APIs.

  **Requirements:** R1, R8

  **Dependencies:** None (can run in parallel with Units 1-3)

  **Files:**
  - Create: `debate-site/scripts/discover.sh` (orchestrator script)
  - Create: `debate-site/scripts/sources/` (directory for raw output per topic)

  **Approach:**
  - Script takes a topic string as input, runs three discovery passes:
    1. `last30days` with `--search reddit` targeting r/ChangeMyView, r/NeutralPolitics, r/PoliticalDiscussion
    2. `last30days` with `--search x` for the topic
    3. A `curl` call to NewsAPI free tier searching for opinion/editorial content
  - Output: consolidated JSON file in `scripts/sources/{topic-slug}.json` with all discovered arguments, attributed to their source
  - The script is a local developer tool, not a production service

  **Execution note:** Requires `SCRAPECREATORS_API_KEY` and NewsAPI key in environment. Ensure `last30days` CLI is accessible from PATH.

  **Patterns to follow:**
  - Existing `last30days` CLI invocation patterns from NanoClaw's skill handlers

  **Test scenarios:**
  - Happy path: Running script with "gun control" produces a JSON file with arguments from at least 2 of the 3 sources
  - Error path: Script handles NewsAPI rate limit gracefully (logs warning, continues with Reddit/X results)
  - Error path: Script handles missing API keys with clear error message listing which keys are needed
  - Edge case: Niche topic with few results still produces valid (possibly sparse) output

  **Verification:**
  - Running the script for a well-known topic produces a source file with real, attributed arguments from multiple platforms

- [ ] **Unit 5: AI synthesis and drafting script**

  **Goal:** CLI script that takes raw source material and produces a draft debate JSON ready for human editing.

  **Requirements:** R1, R2, R3, R4, R5

  **Dependencies:** Unit 4 (uses its output format)

  **Files:**
  - Create: `debate-site/scripts/draft.sh` (synthesis script)
  - Create: `debate-site/scripts/prompts/synthesis.md` (the Claude prompt template)
  - Create: `debate-site/scripts/drafts/` (directory for draft debate JSON files)

  **Approach:**
  - Script reads a source file from `scripts/sources/{topic}.json`
  - Sends the source material to Claude API with a synthesis prompt that instructs:
    1. Identify the 3-5 strongest arguments on each side from the source material
    2. Structure as an alternating dialogue where each side responds to the other's points
    3. Apply moral reframing — each side should address the other's values, not just assert its own
    4. No hedging, no "both sides" filler, no disclaimers
    5. Cite original sources where possible
  - Output: draft debate JSON matching the Astro content collection schema, saved to `scripts/drafts/{topic-slug}.json`
  - Human reviews and edits the draft, then copies the approved version to `src/content/debates/`

  **Execution note:** The moral reframing prompt (R4) is the hardest part of this unit and will need iteration. Start with a straightforward synthesis prompt, then refine based on output quality.

  **Patterns to follow:**
  - Claude API structured output (JSON mode) for reliable schema conformance

  **Test scenarios:**
  - Happy path: Draft debate has alternating turns, distinct voices, and references source material
  - Happy path: Output JSON validates against the Astro content collection Zod schema
  - Edge case: Source material heavily favors one side — draft still produces arguments for both (may flag the imbalance)
  - Edge case: Source material contains contradictory claims from the same side — draft picks the strongest version
  - Error path: Claude API failure produces clear error, does not write partial output

  **Verification:**
  - Draft debate is readable, the two voices are distinguishable, arguments are grounded in the source material, and the JSON is valid for the content collection

- [ ] **Unit 6: First batch of debates — end-to-end production run**

  **Goal:** Produce and publish 5 debates on political/cultural topics, validating the full pipeline.

  **Requirements:** R2, R3, R4, R5, R10

  **Dependencies:** Units 1-5

  **Files:**
  - Create: `debate-site/src/content/debates/` (5 debate JSON files)

  **Approach:**
  - Select 5 topics spanning different political/cultural domains (e.g., immigration policy, AI regulation, college value, gun policy, remote work)
  - For each: run discover script → run draft script → human editorial review → copy to content collection
  - Editorial review focuses on: tone (firm but not inflammatory), moral reframing quality (R4), factual accuracy, readability
  - Deploy to Cloudflare Pages and verify all 5 debates are live with working permalinks and OG previews

  **Test scenarios:**
  - Happy path: All 5 debates are live, load correctly, and display properly on mobile
  - Happy path: Sharing any debate link produces a good preview on social platforms
  - Integration: Full pipeline from topic input to published page works without manual JSON editing beyond editorial review

  **Verification:**
  - 5 published debates live on the site, each with distinct voices, moral reframing present, and shareable links that preview correctly

## System-Wide Impact

- **Interaction graph:** This is a standalone project with no integration into NanoClaw's runtime. The only dependency is using `last30days` CLI as an external tool in the discovery script.
- **Error propagation:** Pipeline is sequential scripts — failure at any stage stops the pipeline with an error message. No cascading failure risk.
- **State lifecycle risks:** None — all content is static files committed to git. No database, no cache, no mutable state.
- **API surface parity:** N/A — no API surface.
- **Unchanged invariants:** NanoClaw itself is not modified. The `last30days` CLI is used read-only as an external tool.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Claude synthesis produces bland, hedged debates despite real source material | The hybrid approach (real arguments in, synthesis out) is much easier to prompt than pure generation. If quality is still weak, increase editorial intervention in the human review step. |
| NewsAPI free tier is development-only, may not cover production use | For an experiment publishing a small batch, this is fine. If the product scales, switch to a paid plan or alternative source. |
| daisyUI chat bubble styling doesn't match the editorial tone desired | daisyUI is themeable — colors, fonts, and spacing are all configurable via Tailwind. Worst case, replace with custom CSS chat bubbles (minimal effort). |
| "Two sides" framing is misleading for some topics (climate, vaccines) | Handle editorially: skip topics where the framing is dishonest, or reframe as "what policy response is appropriate" rather than "is it real." |
| last30days CLI may not be accessible outside NanoClaw environment | Verify PATH and env vars. The script may need to source the last30days .env file or reference its absolute path. |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-03-28-debate-perspectives-requirements.md](../brainstorms/2026-03-28-debate-perspectives-requirements.md)
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- daisyUI Chat component: https://daisyui.com/components/chat/
- Cloudflare Pages: https://pages.cloudflare.com/
- NewsAPI: https://newsapi.org/
- Feinberg & Willer (2015) moral reframing research
- Intelligence Squared debate transcripts: https://intelligencesquared.com/
- r/ChangeMyView, r/NeutralPolitics — primary Reddit sources for quality political arguments
