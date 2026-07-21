---
created_at: 2026-07-21
type: dev-harness-run-findings
run: 2026-07-21-deepgram-request-audit
target_repo: /Users/mattli/development/deepgram-request-audit
branch: run-mru5b2o4 (NOT merged — human merge gate)
goal_doc: "[[2026-07-20-deepgram-request-audit-goal]]"
status: fixed + verified offline; ONE live-API probe outstanding before numbers are trusted
---

# Deepgram request audit — run findings & status

## What happened (timeline)
1. Harness run built `deepgram_request_audit.py` + tests. Passed all 4 sprints
   (scores 98/96/96/96), 55 tests green. Cost $11.32 (notional, subscription).
2. Independent review #1 found the tool was written against an **imagined**
   Deepgram API — its pagination and billed-seconds handling were wrong, but the
   tests passed because the fixtures encoded the same wrong shape. Classic
   "the tests only prove what the fixtures assume."
3. Confirmed the **real** Deepgram API from their published OpenAPI (see facts
   below) and fixed against it. Reviews #2 and #3 (each on the prior fix commit —
   "a fix is unreviewed code") found successive issues; all addressed.
4. Final state: 72 tests pass offline; 3 fix commits on `run-mru5b2o4`.

## Confirmed Deepgram API facts (reference — from developers.deepgram.com OpenAPI `.md`)
- `GET /v1/projects/{project_id}/requests`, header `Authorization: Token <key>`.
- **Pagination is `page` (0-indexed) + `limit`** (range [1,1000]). NO offset,
  NO cursor. Response envelope: `{page, limit, requests[]}` — no total, no next.
  → terminate by paging until an **empty** page (tool now does this).
- Query params: `start` / `end` accept `YYYY-MM-DD`.
- Each request item: `request_id`, `created` (ISO-8601 UTC, e.g.
  `2023-10-05T22:49:03.509654Z`), `path` (`/v1/listen` = STT), `response`, `code`,
  `callback`, …
- **BIG ONE:** in the documented list example, each item's **`response` is
  `null`**. Per-request billed detail (`response.details.usd`, etc.) is populated
  on the **single-request** endpoint `GET /requests/{request_id}`. The exact STT
  billed-**audio-seconds** field name is NOT documented (the OpenAPI leaves
  `response` opaque; the TTS example shows `usd` but no audio-seconds field).

## What was fixed (branch run-mru5b2o4, 3 commits)
- Pagination rewritten to the real `page`/`limit` model; terminate on empty page
  (robust to any server limit echo — adversarially proven); MAX_PAGES backstop.
- Billed seconds read from nested `response.details` (not top-level); numeric +
  finiteness coercion; `duration` excluded (ambiguous vs wall-clock).
- One bad row never kills the run: missing/blank/unparseable `created` is skipped
  **and counted**; unresolved billed seconds counted — both surfaced in a new
  "Data quality" section (text + JSON) so any under-count is **visible**.
- DST fall-back/spring-forward convention (fold=0) made explicit + test-pinned.
- Cleanups: dedup extractor, unused const, centralized None→0 policy, cache the
  parsed timestamp.

## THE open question — needs one live API probe before trusting totals
Because the list endpoint's per-request `response` can be `null`, the tool may
not receive billed seconds from the list call at all. Two things need a single
real API call to confirm (both flagged in-code):
1. Does the **list** `/requests` response carry STT billed audio seconds (and
   under what field), or must the tool make a **second per-request detail fetch**
   (`GET /requests/{id}`) to get them? If the latter, that's a follow-up build.
2. Does a page requested **past the end** return an empty `requests` list (the
   tool's termination assumption), vs. an error / repeated last page?

Everything downstream (matching, timezones, aggregation, reporting) is correct
and well-tested; the uncertainty is isolated to how billed seconds are obtained.

## Recommendation
Before trusting the tool's reconciliation numbers against a real Deepgram bill,
run one probe against the live API (a single `curl` to `/requests` with the real
key) to answer the two questions above. If billed seconds require the per-request
detail fetch, that's a small, well-scoped follow-up. The branch is not merged.
