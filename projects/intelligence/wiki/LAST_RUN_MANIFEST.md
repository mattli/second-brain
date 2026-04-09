# Readwise Wiki — Run Manifest

**Run date:** 2026-04-09
**Run type:** Weekly (incremental, `updated_after: 2026-04-02`)
**Documents fetched:** ~110 (100 from first page + additional)
**Documents processed:** ~45 (after deduplication with existing wiki)
**Documents skipped:** ~65 (already in wiki from prior run, duplicates, off-topic, no transcript)

---

## Time Breakdown

| Phase | Description | Status |
|-------|-------------|--------|
| 1. Inventory | Fetched document list, classified tiers | Complete |
| 2. Triage | Identified already-processed docs, classified A/B/C/D | Complete |
| 3. Batched Reading | Processed Tier A articles + Tier B videos | Complete |
| 4. Tier C References | Attached metadata refs for 2 large documents | Complete |
| 5. Integration | Updated INDEX.md, ran lint (0 orphans, 0 broken links) | Complete |
| 6. Manifest | This file | Complete |

---

## New Pages Created (2)

| Page | Source Documents |
|------|----------------|
| `dhh.md` | DHH's new way of writing code (Pragmatic Engineer video) |
| `world-models.md` | World Models explained in 10min (Caleb Writes Code video) |

## Pages Updated (12)

| Page | Changes | Source Documents |
|------|---------|----------------|
| `andrej-karpathy.md` | Added "Decade of Agents" and "Ghosts Not Animals" sections | Karpathy-Dwarkesh interview |
| `agentic-engineering.md` | Added "Decade of Agents (Karpathy)" section, Great Convergence, Managed Agents (prior session) | Karpathy-Dwarkesh, Peter Yang/a16z, Nicholas Charriere |
| `agent-proficiency.md` | Added "Corporate Adoption" section (Zapier/Shopify ratings, 3 tool tiers, DHH amplification) | Aakash Gupta PM 10x, Claude Code Setup, DHH video |
| `ai-native-product-development.md` | Added AI Evals as PRD, Team OS, Vibe Experimentation, AI Transformation Model (prior session) | Aakash Gupta Evals, Hannah Stalberg, Aakash Gupta PM 10x, Notion |
| `ai-organization-design.md` | Added "Small Teams + Agents" section | Peter Yang/a16z Show |
| `ai-safety-interpretability.md` | Added "OpenAI's Safety Mission Controversy" section (prior session) | Ronan Farrow/New Yorker |
| `business-moats-in-ai.md` | Added "Anthropic Growth Case Study" ($1B→$19B ARR), Two Paths, Token Price Discrimination (prior session) | Head of Growth Anthropic, David George/a16z, Anish Acharya |
| `claude-code-skill-frameworks.md` | Added domain-specific skill libraries (prior session), Claude Code Setup source | MarketingSkills, Career-Ops, Obsidian Skills, Aakash Gupta |
| `claude-mythos.md` | Added Tier C reference for System Card (70K-word PDF) | System Card: Claude Mythos Preview |
| `knowledge-work-future.md` | Added Knowledge Types Taxonomy, Polanyi, Tier C reference (prior session) | Bloomfire, Anish Acharya, Knowledge About Knowledge PDF |
| `peter-steinberger.md` | Added OpenClaw user experience reality check (memory limitations) | Peter Yang/a16z Show |
| `yc-ai-thesis.md` | Added PG Foundation section (prior session) | Paul Graham "How to Get Startup Ideas" |

## Pages Unchanged

`ai-careers.md`, `ai-startup-distribution.md`, `claude-mythos.md` (structure only), `dario-amodei.md`, `llm-knowledge-bases.md` (updated prior session), `model-quantization.md`, `vertical-ai.md`

---

## Tier Classification

### Tier A (<20K words) — Fully Processed
- Anthropic shipped 74 features / PDLC adoption
- Anyone using AI for specs/technical planning?
- Different Types of Knowledge (Bloomfire)
- Knowledge Management and Polanyi (academic paper)
- Notes on AI Apps / Feb 2026 (Anish Acharya)
- There are only two paths left for software (David George/a16z)
- The Great Convergence (Nicholas Charriere)
- The AI Transformation Model (Notion/John Hurley)
- Sam Altman May Control Our Future (New Yorker — Ronan Farrow)
- How to Get Startup Ideas (Paul Graham)
- Various tweets and short articles (~20 documents)

### Tier B (20-50K words) — Fully Processed (via keyword extraction)
- Karpathy-Dwarkesh "We're summoning ghosts" (152K chars video transcript)
- DHH "DHH's new way of writing code" (113K chars video transcript)
- Head of Growth Anthropic (124K chars video transcript)
- Aakash Gupta "10x PM productivity" (54K chars video transcript)
- Aakash Gupta "Claude Code Setup" (74K chars video transcript)
- Aakash Gupta "AI Evals Masterclass" (74K chars video transcript)
- Hannah Stalberg "PM Used Claude Code" (76K chars video transcript)
- Peter Yang "OpenClaw, Claude Code" (a16z Show, inline)
- World Models explained (inline, ~medium)

### Tier C (>50K words) — Metadata Reference Only
- `01knjemvdkrdqgy21tz280tbav` — "Knowledge About Knowledge" (131K words, PDF) → referenced in knowledge-work-future.md
- `01knnraph8fhxanxpk246qj76j` — "System Card: Claude Mythos Preview" (70K words, PDF) → referenced in claude-mythos.md

### Tier D (Bookmarks/Trivial) — Skipped or Minimal Processing
- FOMO podcast (no subtitles available)
- DHH on Lex Friedman (pre-turn, duplicative of Pragmatic Engineer interview)
- Beatles documentary (off-topic)
- Various URL bookmarks with no substantive content
- Duplicate YC Startup School videos
- NanoClaw/tool tweets (already covered)

---

## Errors

- **Context window exhaustion:** Session hit context limit during Phase 3 (video transcript processing). Resumed in new session with summary context.
- **Temp file loss:** Files saved to /tmp in first session were not available in resumed session. Re-fetched documents via MCP.
- **No rate limit or timeout errors.**

---

## Wiki Stats (Post-Run)

- Total pages: 20 (was 18, +2 new)
- Total sections across all pages: ~95
- Orphan pages: 0
- Broken links: 0
- Index entries: 20/20
