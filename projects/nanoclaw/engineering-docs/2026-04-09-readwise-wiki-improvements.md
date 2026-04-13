# Readwise Wiki Compiler Improvements

## Context

The wiki compiler scheduled task runs twice weekly on Sonnet (200K context) and processes Readwise saves into a persistent interlinked wiki. Audit of the April 9 run found it skipped ~40% of documents:
- ~15 videos with full transcripts (Readwise list API shows `word_count: 0` for videos, but `get_document_details` returns full transcripts)
- Several 10K+ word articles
- Tool/product bookmarks that should be noted on topic pages
- A 131K-word PDF (would consume the entire context window alone)

Root causes: (1) no batching strategy for context management, (2) Sonnet rushing through without depth, (3) no guidance on handling videos or large documents, (4) no audit trail of what was processed.

## Plan

### 1. Add per-group model configuration

**`src/types.ts`** — Add `model` to `ContainerConfig`:
```typescript
export interface ContainerConfig {
  additionalMounts?: AdditionalMount[];
  timeout?: number;
  model?: 'sonnet' | 'opus' | 'haiku';
}
```

**`container/agent-runner/src/index.ts`** — Add `model` to `ContainerInput` interface (line 22) and pass it to `query()` options (line 394):
```typescript
// In ContainerInput interface:
model?: 'sonnet' | 'opus' | 'haiku';

// In query() call:
model: containerInput.model,  // undefined falls back to SDK default
```

**`src/container-runner.ts`** — Inject model from group config into container input. Add before `container.stdin.write(JSON.stringify(input))` at line 334:
```typescript
if (group.containerConfig?.model && !input.model) {
  input.model = group.containerConfig.model;
}
```

Also add `model` to the `ContainerInput` interface in this file (line 37).

### 2. Update readwise-wiki group config in DB

```sql
-- store/messages.db
UPDATE registered_groups 
SET container_config = json_set(
  container_config, 
  '$.model', 'opus',
  '$.timeout', 5400000
)
WHERE folder = 'readwise-wiki';
```

Sets model to Opus and timeout to 90 minutes (up from 30). Expect to tune timeout after first run — the manifest will show whether 90 minutes was enough.

### 3. Rewrite processing instructions

**`/Users/mattli/second-brain/projects/wiki/instructions/readwise-wiki.md`** — Replace the current sequential workflow with a phased, context-aware approach.

#### Phase 1 — Inventory

Fetch ALL documents via `reader_list_documents` with `updated_after`. Record every document's ID, title, category, word_count. Do NOT skip any based on word_count (videos show 0 but have full transcripts).

Record the run start time — needed for timeout awareness later.

#### Phase 2 — Triage

Classify each document into processing tiers:

- **Tier A (full read):** Under ~20K words. Fetch full content via `get_document_details`.
- **Tier B (full read, large):** 20K-50K words. Fetch full content directly via `get_document_details`. Fits comfortably in Opus's 200K context. Processed the same way as Tier A but tracked separately for batch-size differentiation.
- **Tier C (reference only):** Over 50K words. Not synthesized by the scheduled compiler. Instead, a metadata-only reference is attached to the most relevant existing wiki topic page. See Tier C treatment below.
- **Tier D (bookmark):** Minimal content (landing pages, tool repos, short bookmarks). Note on the relevant topic page with name, URL, and one-line description.

> **Video transcript quirk:** Videos show `word_count: 0` in the list API. This is a Readwise API artifact. ALWAYS fetch document details for videos — they have full transcripts. Classify by actual content length after fetching.

#### Phase 3 — Batched reading (Tiers A, B, D)

Process Tier A in batches of **5-8 documents**. For each batch: fetch content, extract topics, update wiki pages. Start conservative — increase batch size in future runs only after confirming context headroom.

Process Tier B after Tier A (individually or in smaller batches given their size). Process Tier D last.

#### Phase 4 — Tier C: Reference attachment

For each Tier C document (over 50K words):

1. **Metadata only.** Use the document's title, author, category, word count, and ID. Do NOT fetch full content.
2. **Match against INDEX.md.** Identify the most relevant existing topic page by matching title keywords against the wiki index.
3. **If a match exists:** Append a reference line to that page under a `## Long-form sources` section (create the section if it doesn't exist):
   ```
   - **Knowledge About Knowledge** (131K words, saved 2026-04-06, Readwise: 01knjemvdkrdqgy21tz280tbav) — long-form source, not synthesized by compiler
   ```
4. **If no match exists:** Skip the document. Do NOT create a new topic page solely to house a reference. References are strictly opportunistic — they attach to existing pages or they don't.
5. **Log in manifest:** Either "referenced on `<page>.md`" or "skipped — no matching topic page."

#### Phase 5 — Integration

Update INDEX.md, run lint pass (orphans, missing pages, stale content).

#### Phase 6 — Manifest

Write `wiki/LAST_RUN_MANIFEST.md` — see manifest schema below.

### 4. Error handling and resilience

All error handling lives in the **instructions file** (readwise-wiki.md) — the agent follows these rules, no TypeScript changes needed.

**Rate limit errors:** On any rate limit from the Anthropic API or Readwise MCP, immediately:
1. Write the manifest with current progress
2. Commit any wiki updates completed so far (`git add -A && git commit -m "readwise wiki partial update $(date +%Y-%m-%d)"`)
3. Exit cleanly — do not retry in a loop

The next scheduled run reads the manifest and resumes from where this run stopped.

**Failed document fetch:** If `reader_get_document_details` fails or returns empty for a document, log it to the manifest with the failure reason and move on. Do not halt the run.

**Timeout awareness:** Before starting a new batch or Tier B document, check remaining time:
- Read the run start time (recorded at Phase 1)
- If less than 15 minutes remain, skip to Phase 5 (integration) and Phase 6 (manifest)
- The manifest records where processing stopped so the next run can resume
- The 15-minute threshold is a tunable heuristic — adjust based on observed integration phase duration in early runs

### 5. Manifest schema

**`wiki/LAST_RUN_MANIFEST.md`** — Overwritten each run. Git history preserves previous runs.

```markdown
---
run_date: 2026-04-09
run_start: "2026-04-09T10:00:00Z"
run_end: "2026-04-09T11:15:00Z"
documents_total: 52
documents_processed: 46
documents_referenced: 2
documents_skipped: 2
documents_failed: 2
---

# Run Manifest — 2026-04-09

## Time Breakdown

| Phase | Duration |
|-------|----------|
| Inventory + Triage | 2m |
| Tier A (35 docs, 7 batches of 5) | 30m |
| Tier B (5 docs) | 15m |
| Tier D (4 docs) | 3m |
| Tier C references (2 docs) | 1m |
| Integration + Lint | 5m |
| **Total** | **56m** |

## Tier A — Processed (35 documents)

| Title | Category | Words | Wiki Pages Updated |
|-------|----------|-------|--------------------|
| Scaling Managed Agents | article | 2,024 | agentic-engineering |
| DHH's new way of writing code | video | 8,500 | (new) programming-philosophy |
| ... | ... | ... | ... |

## Tier B — Processed (5 documents)

| Title | Category | Words | Wiki Pages Updated |
|-------|----------|-------|--------------------|
| Sam Altman New Yorker | article | 16,233 | (new) sam-altman |
| Unpacking AI at work | article | 13,528 | knowledge-work-future |

## Tier C — References (2 documents)

| Title | Words | Action |
|-------|-------|--------|
| Knowledge About Knowledge | 131,334 | Referenced on knowledge-work-future.md |
| Knowledge Management and Polanyi | 8,102 | Referenced on knowledge-work-future.md |

## Tier D — Bookmarks (4 documents)

| Title | URL | Noted On |
|-------|-----|----------|
| LangSmith | langsmith.dev | agentic-engineering |

## Skipped (2 documents)

| Title | Category | Words | Reason |
|-------|----------|-------|--------|
| The Beatles History | video | 12,500 | Not relevant to wiki topics |

## Failed (2 documents)

| Title | Category | Error |
|-------|----------|-------|
| Unnamed Document | pdf | get_document_details returned empty |

## New Pages Created
- vertical-ai.md — Enterprise AI adoption data and Harvey's playbook

## Pages Updated
- agentic-engineering.md — Added Managed Agents section
- knowledge-work-future.md — Added long-form source references
```

### 6. Update group CLAUDE.md

**`/Users/mattli/nanoclaw/groups/readwise-wiki/CLAUDE.md`** — Add after "Token Budget Awareness":

```markdown
## Processing Strategy

You have a 200K context window. A single large document can consume it entirely.

**Batching:** Process Tier A documents in batches of 5-8. Increase only after confirming
context headroom in practice.

**Videos:** NEVER skip based on word_count from the list API. Videos report word_count: 0
but have full transcripts via get_document_details.

**Large documents (Tier C, over 50K words):** Do NOT synthesize. Attach a metadata-only
reference line to the most relevant existing wiki topic page. If no matching page exists,
skip with a manifest entry. Never create a new page solely to house a reference.

**Manifest:** After every run, write wiki/LAST_RUN_MANIFEST.md with per-document progress
and time breakdown. A partial run must be resumable by the next scheduled run.

**Errors:** On rate limit or timeout, commit completed work and write the manifest
before exiting. On failed document fetch, log to manifest and continue.
```

### 7. Delete stale agent-runner copy

```bash
rm -rf /Users/mattli/nanoclaw/data/sessions/readwise-wiki/agent-runner-src/
```

Forces a fresh copy on next container spawn, picking up the new `model` field support.

## Design Decisions

Document these in the instructions file (`readwise-wiki.md`) under a "Design Decisions" section, and preserve here for plan context.

**Why Tier C is metadata-only references, not full synthesis:**
The user's Readwise library as of April 2026 contains ~4 PDFs total, with only 1-2 exceeding the 50K-word Tier C threshold. Building chunking infrastructure (structure detection, JSON extraction, merge passes, per-chunk resumability) is disproportionate to this volume. However, completely skipping large documents loses useful signal — the user saved them for a reason. The compromise: a single reference line on an existing relevant topic page, so the user sees "this source exists" when reading related material. Long PDFs that need real synthesis are handled as one-off manual Claude Code sessions outside the scheduled compiler.

**Why Tier C references only attach to existing pages, never create new ones:**
Without this constraint, the compiler might create new topic pages solely to house references for documents it hasn't read. This is cargo-cult page creation — pages that exist only as reference holders, with no synthesized content. References are strictly opportunistic: they attach to pages that already exist for other reasons, or they're skipped with a manifest entry.

**Why Tier B has no highlight-first logic:**
The user doesn't highlight anything in Readwise. Any plan depending on extracting signal from highlights is broken from the start. Tier B fetches full content directly, same as Tier A. The distinction between Tier A and Tier B is currently cosmetic (batch-size differentiation) — they may merge in a future iteration.

**Why the scheduled compiler doesn't handle all document sizes:**
The scheduled compiler is optimized for the common case: dozens of articles, tweets, and videos per week that need to be synthesized into wiki pages. Rare, very large documents (100K+ words) are outside this sweet spot. The compiler notes their existence (Tier C reference) so they're not invisible, but real synthesis of book-length content is a manual session where the user can guide the process.

**Readwise library composition (April 9, 2026):**
~105 documents in the weekly window. Breakdown: mostly articles, tweets, and videos (with full transcripts). ~4 PDFs, ~2 of which exceed 50K words. No highlights. No bookmarks. If this composition changes materially (user starts highlighting, long PDFs become frequent), this design should be revisited.

## Files Modified

| File | Change |
|------|--------|
| `src/types.ts` | Add `model` to `ContainerConfig` |
| `src/container-runner.ts` | Add `model` to `ContainerInput`, inject from group config |
| `container/agent-runner/src/index.ts` | Add `model` to `ContainerInput`, pass to `query()` |
| `groups/readwise-wiki/CLAUDE.md` | Add processing strategy with tiers, errors, manifest |
| `second-brain/projects/wiki/instructions/readwise-wiki.md` | Full rewrite: phased workflow, Tier C reference-only, error handling, manifest schema, design decisions |
| `store/messages.db` | Update readwise-wiki group config (model + timeout) |
| `data/sessions/readwise-wiki/agent-runner-src/` | Delete stale copy |

## Verification

1. `npm run build` — TypeScript compiles with new `model` field
2. Query DB to confirm `readwise-wiki` group has `"model":"opus"` and `"timeout":5400000`
3. Trigger a manual run and monitor:
   - `tail -f groups/readwise-wiki/logs/*.log` for Opus model usage
   - After completion, check `wiki/LAST_RUN_MANIFEST.md` — verify:
     - All documents listed (processed, referenced, skipped with reasons, or failed with errors)
     - Videos processed (not skipped for word_count: 0)
     - Time breakdown by tier
     - Tier C documents show "referenced on `<page>.md`" or "skipped — no matching topic page"
   - Verify wiki pages have content sourced from video transcripts
   - Check that the 131K "Knowledge About Knowledge" PDF either got referenced on `knowledge-work-future.md` or was skipped with a clear reason
   - Note total runtime for timeout tuning
4. Verify other groups still default to Sonnet (no `model` in their config)
