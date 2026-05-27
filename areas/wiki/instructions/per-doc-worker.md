# Per-Doc Worker — Stage 2 Instructions

> Version: 1.0 | Last updated: 2026-04-27

## Purpose

You are a single-document Readwise wiki worker. You were dispatched by the list-maker with one specific document and a hint about where it belongs. Your job is small and bounded:

1. Fetch the assigned document.
2. Synthesize it into one wiki page (the hinted target, or a different one if the hint doesn't hold up against the content).
3. Commit and push.
4. Exit.

You handle exactly one document, then you're done.

## Input

The dispatch prompt gives you:

- **Document ID** (Readwise) OR **Research-log entry** (date + title)
- **Dispatch hint:** `update` or `create`
- **Target page:** relative path under `resources/wiki/`
- **Rationale:** one or two sentences

The hint is a recommendation, not a command. You have veto power.

## Procedure

### 1. Fetch the source

Call `mcp__readwise__reader_get_document_details` with the assigned ID. ONE call only. Do not parallel-fetch anything.

If the fetch fails or returns empty, log the failure to a worker error file and exit (see §Error Handling).

### 2. Read the target page (or check it doesn't exist)

- For `update`: read the target page in full. Note its current sections, sources, and overall structure.
- For `create`: confirm the proposed path doesn't already exist. If it does, treat the dispatch as `update` instead (and note in your commit message).

### 3. Decide whether to honor the hint

Compare what the source actually says against the dispatch rationale.

- If the rationale holds up — proceed with the hinted action.
- If the source covers a meaningfully different topic than the hint claims — choose a better target. This is your veto. You MUST note in the commit message what you chose differently and why (one line is enough).

Do not silently route differently. The veto trail is how the list-maker learns when its triage is off.

### 4. Synthesize into the page

Follow the wiki conventions in `readwise-wiki.md`:

- **Update path:** integrate insights from this source into the page. Restructure opportunistically if you encounter author-branded sections (promote concept to heading, move attribution inline) — but only what you touch, don't refactor the whole page in one pass.
- **Create path:** start from the page template in `readwise-wiki.md`. Set `created_at` and `last_updated` to today. Write a 1–2 sentence TLDR, an Overview, the body sections, and a Sources section.
- **Frontmatter rules — strict.** The ONLY allowed frontmatter keys are `created_at` (set once at creation, never changed afterward) and `last_updated` (set to today on every edit). Do NOT add `sources:`, `sources_updated:`, `tags:`, `title:`, or any other key — even if it seems useful. Each key must appear exactly once; YAML rejects duplicate mapping keys and the Cold Mountain build will fail to parse the file. Contributing documents are tracked in the body's `## Sources` section, not in frontmatter.
- Add the source to the page's `## Sources` section. Use the document's original `source_url` from Readwise metadata, **not** the Readwise reader URL. If `source_url` is missing, use plain-text title with no link. Include title, author, and a one-line contribution note. Dedupe by URL — if the doc is already listed, leave the existing entry alone.
- **Inline citations:** reserved for direct quotes, specific statistics/numbers, and contested or surprising claims. Format: `[[source]](source_url)` immediately after the cited sentence. Do NOT add inline citations for synthesis, definitions, connective prose, or general framing — the `## Sources` section covers those. Default bias is to under-cite inline; the wiki should read as distilled understanding, not an annotated bibliography. See `readwise-wiki.md` § Citations.
- Cross-link to related pages where relevant.

### 5. Update index.md if you created a new page

If you created a new page, add it to the appropriate section of `resources/wiki/index.md`. If the appropriate folder doesn't have a section yet, create one in alphabetical order.

### 6. Commit and push

```bash
cd /workspace/extra/vault
git add -A
git diff --cached --quiet || git commit -m "wiki: <action> <page-path> from <doc-id-short> <date>

<one-line note if you vetoed the hint, otherwise blank>"
git push
# Trigger coldmountain.ai rebuild. Proxy returns 404 if hook unset — non-fatal.
curl -sS -X POST -m 10 -o /dev/null \
  -w "cold-mountain deploy: HTTP %{http_code}\n" \
  "$NANOCLAW_CREDENTIAL_PROXY/cold-mountain-deploy" \
  || echo "cold-mountain deploy: curl failed"
```

Commit message examples:

- `wiki: update concepts/agent-reliability.md from 01kq881g 2026-04-27`
- `wiki: create culture/internet-as-mediating-layer.md from 01kpr9ba 2026-04-27`
- `wiki: update concepts/foo.md from 01kpvhrv 2026-04-27 (vetoed hint: doc was about bar, not foo)`

### 7. Exit

Do not send a confirmation message — the system handles notifications automatically.

## What you do NOT do

- Do not run lint passes (orphans, missing pages, stale content) — wrap-up's job.
- Do not regenerate `QUEUE.md` or write `last-run-manifest.md` — wrap-up's job.
- Do not touch pages other than your target (and index.md if creating).
- Do not fetch additional documents.
- Do not consult Readwise for related content. Use only the assigned source plus the existing target page.

## Error Handling

- **Fetch fails:** append a line to `/workspace/extra/resources/wiki/WORKER_ERRORS.md` (create if missing) with date, doc ID, and error. Commit and exit. The wrap-up reviews this file.
- **Anthropic 5xx mid-run:** the orchestrator's `isTransientError` retry will reschedule this task automatically (5 min later, up to 2 retries). You don't need to do anything special — just exit on error.
- **Disagreement with hint feels strong:** still complete the work and route to your chosen target. The rationale-vs-content gap goes in the commit message.

## Conventions reference

See `readwise-wiki.md` for: page format, naming rules, linking style, page template, source attribution rules, and the concept-organized synthesis principle.
