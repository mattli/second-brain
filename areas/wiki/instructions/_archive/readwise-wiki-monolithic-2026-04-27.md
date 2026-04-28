Readwise Wiki Compiler — Instructions

> Version: 2.4 | Last updated: 2026-04-21

## Purpose

Compile Readwise saves into a persistent, interlinked wiki. This is a knowledge compiler — wiki pages are persistent reference pages that get updated over time, not replaced. The wiki sits between you and the raw Readwise saves, synthesizing information into structured, cross-referenced pages.

This follows Karpathy's LLM Wiki pattern: you read the sources, extract key information, and integrate it into the existing wiki — updating pages, noting where new data connects to or contradicts existing content, and keeping cross-references current. The knowledge is compiled once and kept current.

Output goes to the wiki directory (see CLAUDE.md path mapping for the container mount path). The wiki is organized into category folders. Check `wiki/INDEX.md` for the current folder structure.

**Folder management:** Place new pages in the best-fitting existing folder. If no folder fits, create a new one — use a short, descriptive kebab-case name (e.g., `writing/`, `marketing/`, `health/`). Add the new folder as a section in `INDEX.md`. Don't over-fragment: a folder should represent a broad topic area, not a single article's subject.

---

## Workflow

### Phase 0 — Research Log

Before fetching Readwise content, check `wiki/raw/research-log.md` for new entries.

Each entry has a structured format:

```
## YYYY-MM-DD — <title>

- **Source:** <URL>
- **Why it came up:** <conversation context>
- **Related wiki pages:** <page1.md>, <page2.md>
- **Notes:** <pre-summarized content, typically 3-8 sentences for substantive sources>
```

Processing rules:

1. Read `wiki/raw/research-log.md`. If it contains only the file header (no entries below the `---`), skip to Phase 1.
2. Treat each entry as **Tier A-equivalent** — short, pre-summarized, high signal. The notes are already distilled; your job is to integrate them into existing wiki pages or create new ones, same as any Tier A document.
3. If an entry doesn't cleanly fit an existing page and isn't substantial enough to justify a new page, log it in the manifest as "logged, not integrated" with a one-line reason. Don't force-create stub pages — mirror Tier D's reference-only treatment.
4. Process all entries before moving to Phase 1. These are typically 1-5 entries per week and take minimal context.
5. After processing, archive the entries:
   - Move all processed entries (everything below the `---` separator) to `wiki/raw/_archive/research-log-YYYY-WW.md` (ISO year and week number, e.g. `research-log-2026-W15.md`). If the archive file already exists (multiple runs in the same week), append to it.
   - Leave `research-log.md` with only its original header (the `# Research Log` line, description, and `---` separator).
   - Create the `_archive/` directory if it doesn't exist.
6. Commit wiki updates after processing research log entries (same cadence as Tier A batches).

### Phase 1 — Inventory

Read `wiki/INDEX.md` first. This tells you what pages already exist, what topics are covered, and where to integrate new information.

Determine the fetch window:
1. Read `wiki/LAST_RUN_MANIFEST.md` and extract the `run_start` timestamp from the frontmatter.
2. Use that timestamp as the `updated_after` parameter when calling `reader_list_documents`.
3. If no manifest exists (first run, or manifest was deleted), fall back to 30 days ago as `updated_after`. Note this fallback in the manifest's run notes (add a `## Run Notes` section before the Skipped table).

Fetch ALL documents via `reader_list_documents` with the determined `updated_after` value. Record every document's ID, title, category, word_count, and author.

> **IMPORTANT: Video transcripts.** Videos show `word_count: 0` in the list API response. This does NOT mean they have no content. Readwise stores full video transcripts. ALWAYS fetch document details for videos regardless of word_count. Classify them by actual content length after fetching.

Record the current time as the run start time — you'll need this for timeout awareness later.

Also check `wiki/LAST_RUN_MANIFEST.md` for any documents that were partially processed in a previous run, and check the state directory (`state/` relative to the readwise-wiki group directory — inside the container this is `/workspace/state/`) for any intermediate state from a crashed or context-exhausted session.

### Phase 2 — Triage

Classify each document into processing tiers:

- **Tier A (full read):** Under ~20K words. The bulk of most runs — articles, tweets, videos with transcripts.
- **Tier B (full read, large):** 20K-50K words. Fetch full content directly. Fits comfortably in Opus's 200K context. Processed the same way as Tier A but tracked separately for batch-size differentiation.
- **Tier C (reference only):** Over 50K words. Not synthesized by this compiler. A metadata-only reference is attached to the most relevant existing wiki topic page. See Phase 4 below.
- **Tier D (bookmark):** Minimal content (landing pages, tool repos, short bookmarks with no substantive body). Note on the relevant topic page with name, URL, and one-line description. If no relevant topic page exists, append to `wiki/unorganized.md` under `## Bookmarks` instead (see Phase 3). Tier D documents are never skipped for relevance or topic — only for mechanical reasons (`already_in_wiki`, `duplicate_in_run`, `fetch_failed`). Topic, relevance, and perceived value are never valid skip reasons for any tier.

Skip decisions are recorded per-document for the manifest (see Phase 6). For each document not assigned to a tier, record its ID, title, category, word_count, and the skip reason (one of: `already_in_wiki`, `duplicate_in_run`, `no_content`, `fetch_failed`).

### Phase 3 — Batched reading (Tiers A, B, D)

**Tier A documents:** Process **one document at a time**. For each document:
1. Fetch full content via `reader_get_document_details` — a SINGLE call. Do NOT issue parallel `reader_get_document_details` calls. Anthropic's API gateway returns 502 Bad Gateway on requests that include several large MCP tool results in one turn (confirmed Apr 2026 — every batched-fetch run since Apr 23 has died this way; sequential fetches are reliable).
2. Extract key concepts, claims, connections to existing wiki pages, and notable entities
3. Update or create wiki pages (see Page Guidelines below)
4. Move to the next document

Process documents in groups of 5–8 for commit cadence purposes only (see "Tier A commit cadence" below) — but the fetches themselves stay sequential.

**Tier B:** Process after Tier A. These are larger (20K-50K words) — typically video transcripts that can be 100K-150K+ characters. Process **one document at a time**. For each Tier B document:
1. Fetch full content via `reader_get_document_details`
2. Extract key concepts, claims, connections to existing wiki pages
3. Update or create wiki pages
4. **Commit wiki updates to git immediately** (same commit command as the After Writing section, but with message: `"readwise wiki: processed <title> $(date +%Y-%m-%d)"`)
5. Move to the next document

Do NOT batch Tier B documents together. A single 150K-character transcript plus existing wiki context plus your response can approach the context limit. One-at-a-time processing ensures each document is committed before the next begins, so context exhaustion never loses completed work.

**Tier A commit cadence:** Commit wiki updates to git after every 5–8 documents (a logical "batch" for commit purposes — the fetches inside it are still sequential). This ensures a mid-run failure preserves all completed work.

**Tier D:** Process last. For each bookmark, note the tool/product on the relevant topic page with name, URL, and one-line description. If no relevant topic page exists, append to `wiki/unorganized.md` under a `## Bookmarks` section (create the file/section if it doesn't exist). Format:

```
- **Title** (category, saved YYYY-MM-DD, Readwise: <id>) — URL or one-line description
```

**Timeout check:** Before starting each new batch, check elapsed time since run start. If less than 15 minutes remain (this threshold is a tunable heuristic — adjust based on observed integration phase duration), skip to Phase 5.

---

## State Persistence

Intermediate state that must survive across sessions (context exhaustion, crashes, resumed runs) goes in the **state directory**: `state/` relative to the readwise-wiki group directory. Inside the container, this is `/workspace/state/`.

On each run:
1. **Check for existing state** at startup (Phase 1). If `state/pending.json` exists, check its mtime first:
   - If younger than 24 hours: it's a recent crash recovery. Resume from where it left off rather than re-fetching and re-triaging.
   - If 24 hours or older: it's stale and would skip docs saved since the previous run. Move it to `state/_archive/pending-<original-mtime-ISO>.json` (create `_archive/` if needed) and proceed with a fresh inventory. Note the staleness in the manifest's Run Notes.
2. **Write state after triage** (end of Phase 2). Save `state/pending.json` with the full document list, tier classifications, and skip decisions. This is the resumption checkpoint.
3. **Update state after each commit** (during Phase 3). Remove processed documents from `pending.json` so a resumed run doesn't reprocess them.
4. **Delete state on clean completion** (end of Phase 6). If the run completes all phases normally, delete `state/pending.json`. A clean manifest is the record; intermediate state is only for crash recovery.

Do NOT use `/tmp` for any state that needs to survive across sessions. `/tmp` is ephemeral and will be empty if the session is resumed.

---

### Phase 4 — Tier C: Reference attachment

For each Tier C document (over 50K words):

1. **Metadata only.** Use the document's title, author, category, word count, and ID from the inventory. Do NOT fetch full content.
2. **Match against INDEX.md.** Identify the most relevant existing topic page by matching title keywords against the wiki index.
3. **If a match exists:** Append a reference line to that page under a `## Long-form sources` section (create the section if it doesn't exist). Format:
   ```
   - **Knowledge About Knowledge** (131K words, saved 2026-04-06, Readwise: 01knjemvdkrdqgy21tz280tbav) — long-form source, not synthesized by compiler
   ```
4. **If no match exists:** Append the reference line to `wiki/unorganized.md` under a `## Long-form sources` section (create the file/section if it doesn't exist). Same format as step 3.
5. **Log in manifest:** Either "referenced on `<page>.md`" or "added to `unorganized.md`."

### Phase 5 — Integration

After all tiers are processed (or timeout forces early completion):

1. Update `wiki/INDEX.md` with any new pages and updated summaries
2. Run the lint pass:
   - **Orphan pages** — pages not linked from any other page (add links where relevant). Exempt `unorganized.md` — it is a holding page, not a topic page.
   - **Missing pages** — topics mentioned frequently across pages but lacking their own page
   - **Stale content** — claims that newer sources have superseded
   - **Synthesis check (flag only).** For each topic page, consider whether the page reads as synthesized knowledge or as a literature review (one section per source). Use your judgment — the same judgment you'd use when deciding whether new content belongs under an existing concept heading or needs its own section. Flag pages that read as source-siloed rather than synthesized. Record findings in the manifest under `## Lint Findings — Synthesis Candidates` with page path, a brief rationale, and one or two specific sections most in need of restructuring. **Person pages (`wiki/people/`) are exempt** — sections on a person page about that person's views are expected to attribute to that person.
   - **Page split check (flag only).** For each topic page, consider whether it has grown into two or more distinct topics that would be better served as separate pages. Use the same judgment you apply when deciding whether a new source deserves its own page versus being absorbed into an existing one. Flag split candidates in the manifest under `## Lint Findings — Page Split Candidates` with page path, suggested new page title(s) for the split, and a one-line rationale.

   Both new checks **flag only** — do not auto-restructure or auto-split. These are structural decisions that require human review.
3. Fix what you find
4. Regenerate `wiki/long-form/QUEUE.md` per the Queue Regeneration section of `wiki/instructions/long-form-synthesis.md`. Cheap list-and-diff — no content fetches.

### Phase 6 — Manifest

Write `wiki/LAST_RUN_MANIFEST.md` with the full audit trail. See the Manifest Schema section below.

---

## Page Guidelines

- Pages are about **topics**, not about individual articles. A page on "retrieval-augmented generation" draws from every source that discusses RAG.
- Keep pages concise and scannable — use headers, bullet points, short paragraphs.
- Each page starts with a 1-2 sentence TLDR at the top.
- Interlink pages with relative markdown links. Within the same folder: `[topic](file.md)`. Across folders: `[topic](../other-folder/file.md)`. Always resolve paths relative to the linking page's location.
- Each page has a `## Sources` section at the bottom listing which Readwise saves informed it (title, author, and URL). URLs go in the Sources section only, not inline in page content — the wiki pages are synthesized knowledge and inline links would clutter the prose.
- File names use kebab-case: `retrieval-augmented-generation.md`, `andrej-karpathy.md`
- Each page has YAML frontmatter with `created_at` (set once) and `last_updated` (set to today's date when content changes).

**Organize by concept, not by source.** Pages are synthesized knowledge, not literature reviews.

- Section headings (H2, H3) name **concepts**, not authors or articles.
  - Good: "Memory ownership", "Thin vs fat harnesses", "Verification loops"
  - Bad: "Thin Harness, Fat Skills (Garry Tan)", "OpenAI's Engineering Lessons (Ryan Lopopolo)", "Three Dimensions (Akshay Pachaar)"
- When multiple sources make related claims, **merge them under a single concept heading with inline attribution**: "Harrison Chase argues...", "Garry Tan's framing...", "According to the OpenAI engineering team...".
- Do **not** create a new H2 section for each source processed. That's the author-organized anti-pattern — it turns the page into a literature review instead of synthesized knowledge.
- Attribution happens **inline in prose** and **comprehensively in the Sources section** at the bottom. The Sources section may include a short note per source describing what that source contributed (one line) — see the Page Template below.
- **Existing pages may violate this rule.** When the compiler touches an existing page, it should opportunistically restructure author-branded sections it encounters — promote the concept to the heading, move attribution inline. Do not restructure the entire page in one pass unless specifically asked; just fix what you touch.
- **Person pages (`wiki/people/`) are an exception.** Sections on a person page about that person's views are expected to attribute to that person; concept-first organization does not apply there.

**What pages to create is your decision.** The wiki covers everything the user saves — not just AI/tech. Writing, marketing, business, health, productivity, history, or any other topic is equally valid. If the user saved it, it has signal.

Heuristics:
- A concept that appears across multiple sources → page
- A person doing notable work that comes up repeatedly → page
- A technique, framework, or tool with enough substance → page
- A broad theme that many sources touch → page
- A single article with enough standalone substance to be a useful future reference → page (don't wait for multiple sources on every topic)
- A tool or product bookmark → don't create a standalone page; mention it on the relevant topic page as a data point

Don't create a page for every minor mention. Create pages when there's enough substance to make a useful reference. Every document the user saved gets processed — topic, relevance, and perceived value are never reasons to skip or downgrade.

## Page Template

```markdown
---
created_at: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Page Title

> TLDR: One or two sentences summarizing this topic.

## Overview

Brief introduction to the topic.

## [Sections as needed]

Content organized by the natural structure of the topic.

## Sources

- "Article Title" — Author Name ([link](URL))
- "Another Article" — Another Author ([link](URL))

Optional enriched format — add a one-line contribution note when it helps a future reader understand what each source brought to the page:

- "Thin Harness, Fat Skills" — Garry Tan ([link](URL)) — introduced the thin-harness principle and the five definitions
- "OpenAI's Engineering Lessons" — Ryan Lopopolo ([link](URL)) — verification-loop patterns from production agents
```

---

## Error Handling

**Rate limit errors:** On any rate limit from the Anthropic API or Readwise MCP:
1. Write the manifest with current progress (whichever documents have been processed so far)
2. Commit any wiki updates completed: `cd /workspace/extra/vault && git add -A && git diff --cached --quiet || git commit -m "readwise wiki partial update $(date +%Y-%m-%d)" && git push`
3. Exit cleanly — do not retry in a loop

The next scheduled run picks up where this one stopped.

**Failed document fetch:** If `reader_get_document_details` fails or returns empty for a document, log it to the manifest with the failure reason and move on to the next document. Do not halt the run.

**Timeout awareness:** Before starting each new batch or Tier B document, check elapsed time:
- If less than 15 minutes remain, skip to Phase 5 (integration) and Phase 6 (manifest)
- The 15-minute threshold is a tunable heuristic — adjust based on observed integration phase duration

---

## Manifest Schema

**`wiki/LAST_RUN_MANIFEST.md`** — Overwritten each run. Git history preserves previous runs.

```markdown
---
run_date: YYYY-MM-DD
run_start: "YYYY-MM-DDTHH:MM:SSZ"
run_end: "YYYY-MM-DDTHH:MM:SSZ"
documents_total: N
documents_processed: N
documents_referenced: N
documents_skipped: N
documents_failed: N
research_log_entries: N
---

# Run Manifest — YYYY-MM-DD

## Time Breakdown

| Phase | Duration |
|-------|----------|
| Research Log (N entries) | Xm |
| Inventory + Triage | Xm |
| Tier A (N docs, N batches) | Xm |
| Tier B (N docs) | Xm |
| Tier D (N docs) | Xm |
| Tier C references (N docs) | Xm |
| Integration + Lint | Xm |
| **Total** | **Xm** |

## Research Log — Processed

| Entry | Source URL | Wiki Pages Updated |
|-------|-----------|---------------------|

## Tier A — Processed

| Title | Category | Words | Wiki Pages Updated |
|-------|----------|-------|--------------------|

## Tier B — Processed

| Title | Category | Words | Wiki Pages Updated |
|-------|----------|-------|--------------------|

## Tier C — References

| Title | Words | Action |
|-------|-------|--------|

## Tier D — Bookmarks

| Title | URL | Noted On |
|-------|-----|----------|

## Unorganized

### Bookmarks added

| Title | Readwise ID |
|-------|-------------|

### Long-form sources added

| Title | Readwise ID |
|-------|-------------|

## Skipped

| ID | Title | Category | Words | Reason |
|----|-------|----------|-------|--------|

Skip reasons:
- `already_in_wiki` — document content already represented in an existing wiki page (matched by title, URL, or Readwise ID against sources sections)
- `duplicate_in_run` — same document appeared more than once in the fetch results
- `fetch_failed` — MCP tool returned an error when fetching document details

Documents with no extractable body content are NOT skipped. If the document has a title and URL, process it as Tier D (bookmark it on the relevant topic page or `unorganized.md`). The user saved it intentionally.

Every skipped document must appear in this table. A count-only summary is not acceptable.

## Failed

| Title | Category | Error |
|-------|----------|-------|

## New Pages Created

## Pages Updated

## Lint Findings — Synthesis Candidates

| Page | Sections most in need of restructuring | Rationale |
|------|----------------------------------------|-----------|

## Lint Findings — Page Split Candidates

| Page | Suggested new titles | Rationale |
|------|---------------------|-----------|
```

---

## After Writing

Once wiki pages are written/updated, commit and push to the vault:

```bash
cd /workspace/extra/vault
git add -A
if ! git diff --cached --quiet; then
  git commit -m "readwise wiki update $(date +%Y-%m-%d)"
  git push
  # Trigger coldmountain.ai rebuild. Proxy returns 404 if hook unset — non-fatal.
  curl -sS -X POST -m 10 -o /dev/null \
    -w "cold-mountain deploy: HTTP %{http_code}\n" \
    "$NANOCLAW_CREDENTIAL_PROXY/cold-mountain-deploy" \
    || echo "cold-mountain deploy: curl failed"
else
  git push
fi
```

Do not send a confirmation message — the system handles notifications automatically.

---

## Design Decisions

**Why Tier C is metadata-only references, not full synthesis:**
The user's Readwise library as of April 2026 contains ~4 PDFs total, with only 1-2 exceeding the 50K-word Tier C threshold. Building chunking infrastructure (structure detection, JSON extraction, merge passes, per-chunk resumability) is disproportionate to this volume. However, completely skipping large documents loses useful signal — the user saved them for a reason. The compromise: a single reference line on an existing relevant topic page, so the user sees "this source exists" when reading related material. Long PDFs that need real synthesis are handled as one-off manual Claude Code sessions outside the scheduled compiler.

**Why `unorganized.md` exists as a holding page:**
Documents are saved to Readwise intentionally — the compiler should preserve that signal rather than discarding it via "no matching page" skips. When no existing topic page matches a Tier C reference or Tier D bookmark, the document lands on `unorganized.md` instead of being silently dropped. This is a holding pattern: when a cluster of unorganized documents accumulates around a topic, that's the signal to promote the cluster to its own topic page. This applies only to Tier C and Tier D. Tier A and Tier B documents that don't match existing topics should result in new topic pages being created — they have enough substance to warrant their own pages.

**Why Tier B has no highlight-first logic:**
The user doesn't highlight anything in Readwise. Any plan depending on extracting signal from highlights is broken from the start. Tier B fetches full content directly, same as Tier A. The distinction between Tier A and Tier B is currently cosmetic (batch-size differentiation) — they may merge in a future iteration.

**Why the scheduled compiler doesn't handle all document sizes:**
The scheduled compiler is optimized for the common case: dozens of articles, tweets, and videos per week that need to be synthesized into wiki pages. Rare, very large documents (100K+ words) are outside this sweet spot. The compiler notes their existence (Tier C reference) so they're not invisible, but real synthesis of book-length content is a manual session where the user can guide the process.

**Readwise library composition (April 9, 2026):**
~105 documents in the weekly window. Breakdown: mostly articles, tweets, and videos (with full transcripts). ~4 PDFs, ~2 of which exceed 50K words. No highlights. No bookmarks. If this composition changes materially (user starts highlighting, long PDFs become frequent), this design should be revisited.
