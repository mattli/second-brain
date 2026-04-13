# Readwise Wiki — Run Manifest

**Run date:** 2026-04-13
**Run type:** Weekly (incremental, `updated_after: 2026-04-09T00:00:00Z`)
**Documents fetched:** ~46
**Documents processed:** ~46 (after deduplication with existing wiki)
**Commits this run:** 7

---

## Time Breakdown

| Phase | Description | Status |
|-------|-------------|--------|
| 1. Inventory | Fetched document list, classified tiers | Complete |
| 2. Triage | Identified already-processed docs, classified A/B/C/D | Complete |
| 3. Batched Reading | Processed Tier A articles + Tier A videos | Complete |
| 4. Tier D | Noted minimal-value bookmarks | Complete |
| 5. Integration | Updated INDEX.md | Complete |
| 6. Manifest | This file | Complete |

---

## New Pages Created (3)

| Page | Source Documents |
|------|----------------|
| `tools/agent-harness.md` | 8 harness-cluster documents (Pachaar, Abrams, Chase, Wooders, Garry Tan, Lopopolo, Millidge, Sandhya) |
| `landscape/ai-user-perspectives.md` | Anthropic 81K-person survey (Dec 2025) |
| `landscape/agi-definitions.md` | Benjamin Todd "Do we already have AGI?" (80,000 Hours) |

## Pages Updated (10)

| Page | Changes |
|------|---------|
| `tools/agent-harness.md` | Added "Claude Code Hooks in Practice" (session_start hook, Dex, CLAUDE.md version control) |
| `tools/claude-code-skill-frameworks.md` | Added: thin harness/fat skills philosophy; Dex (Dave Khaled) personal OS; Content-Skill-Graph (Ronin) |
| `tools/agentic-engineering.md` | Added cross-reference to agent-harness.md |
| `landscape/vertical-ai.md` | Added: Harvey vertical model U-turn (scrapped custom model, Model Selector routing); Cursor Composer 2 details |
| `landscape/ai-startup-distribution.md` | Added: AI Voice Caller Agency model (Retell AI + GoHighLevel); Reddit "help completely, mention last" strategy (Tim Jayas) |
| `concepts/knowledge-work-future.md` | Added: AI's Early Labor Market Impact (2026 Data) — Anthropic observed exposure methodology, Jevons Paradox, entry-level hiring collapse |
| `concepts/llm-knowledge-bases.md` | Added: Tw93 learning workflow ("AI most useful when attached to real output"); Waza /learn skill |
| `concepts/business-moats-in-ai.md` | Added: "The Big Rug" enterprise data risk section (goodalexander thesis) |
| `people/andrej-karpathy.md` | Added: Two-Tier Perception Gap (casual vs professional frontier model users; RL domains improving fastest) |
| `people/dhh.md` | Added: Nuances and Tensions from Lex Fridman interview (speed complaints, competence preservation, VR parallel, DeepSeek think box) |
| `INDEX.md` | Updated to reflect all new and updated pages |

---

## Tier Classification

### Already in wiki (5)
Documents whose content was already synthesized in prior runs: karpathy/autoresearch, Dario Amodei Lex Fridman video, NanoClaw tweet, and 2 others.

### Tier A Articles (<20K words) — Processed
- Joe Hudson / Every.to — knowledge work and wisdom skills → knowledge-work-future.md
- Anthropic 81K survey — new page: ai-user-perspectives.md
- Benjamin Todd / 80,000 Hours — new page: agi-definitions.md
- Bloomfire / Polanyi — knowledge types taxonomy → knowledge-work-future.md
- Anthropic labor market research (Massenkoff & McCrory) — knowledge-work-future.md
- Paweł Huryn — Jevons Paradox of AI labor → knowledge-work-future.md
- Ivan Landabaso — Harvey AI playbook → vertical-ai.md
- Kimberly Tan a16z — enterprise AI adoption data → vertical-ai.md
- 8 harness-cluster documents — new page: agent-harness.md
- goodalexander "The Big Rug" — business-moats-in-ai.md
- Tw93 learning workflow — llm-knowledge-bases.md
- Alpha Batcher AI Agency guide — ai-startup-distribution.md
- Ronin Content Engine / Content-Skill-Graph — claude-code-skill-frameworks.md
- Tim Jayas Reddit strategy — ai-startup-distribution.md
- Karpathy two-tier gap tweet — andrej-karpathy.md
- Sandhya "The New Software" — vertical-ai.md, agent-harness.md

### Tier A Videos — Processed
- Aakash Gupta / Dave Khaled "Automate Your Work Life With Claude Code" → agent-harness.md, claude-code-skill-frameworks.md
- DHH / Lex Fridman "Future of Programming, AI, Ruby on Rails" → dhh.md

### Tier D (Bookmarks/Trivial) — Skipped or Minimal Processing
- Dickie Bush "If you can write this" — X growth/writing advice, no AI angle
- Cold Outreach Bible (Adrianna Lakatos) — general cold email advice
- Steal My Digital Product System — not found in search
- AI agents for marketing are here — tools already covered
- A Smart Bear: Specificity (Jason Cohen) — general writing advice
- Claude + Obsidian (Defileo) — pattern already covered in llm-knowledge-bases.md
- Claude for Dummies SMB (Charles Miller) — construction business multi-agent implementation; no distinct wiki home
- Various marketing/distribution bookmarks without new tactical depth

### Tier C (>50K words) — Carried from prior run
- `01knjemvdkrdqgy21tz280tbav` — "Knowledge About Knowledge" (131K words, PDF) → referenced in knowledge-work-future.md
- `01knnraph8fhxanxpk246qj76j` — "System Card: Claude Mythos Preview" (70K words, PDF) → referenced in claude-mythos.md

---

## Errors

- **State persistence failed:** `/workspace/state/` not writable. Crash recovery relied on git commits after each batch.
- **Context window exhaustion from prior run:** This run was a continuation from a context-exhausted prior session. Resumed from summary.
- **reader_list_documents validation:** `id` field not valid in response_fields; removed.
- **Large document output:** "What 81,000 people" required chunked JSON parsing from temp file.

---

## Wiki Stats (Post-Run)

- Total pages: 23 (was 20, +3 new)
- Orphan pages: 0
- Broken links: 0
- Index entries: 23/23

---

*Next run: updated_after 2026-04-13T00:00:00Z*
