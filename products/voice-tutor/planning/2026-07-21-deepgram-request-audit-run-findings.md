---
created_at: 2026-07-21
type: dev-harness-run-findings
run: 2026-07-21-deepgram-request-audit
target_repo: /Users/mattli/development/deepgram-request-audit
branch: run-mru5b2o4 (NOT merged — human merge gate)
goal_doc: "[[2026-07-20-deepgram-request-audit-goal]]"
status: fixed + verified offline AND against the live API; open question resolved; ready for human review/merge
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

## Open question — RESOLVED by a live read-only probe (2026-07-21)
A live probe against the real API (read-only, key kept in the Authorization
header, never printed) answered both questions and surfaced one more bug:
1. **Billed seconds ARE in the list response** at `response.details.total_audio`
   (audio seconds) for succeeded STT requests — NO second per-request fetch
   needed. `response` is null only for non-succeeded states (pending/lost/error),
   which carry no billed time and are counted as "billed unavailable". `duration`
   sits alongside `total_audio` and is ~identical for STT; the tool correctly
   uses `total_audio` and ignores the ambiguous `duration`.
2. **A page past the end returns `{requests: []}`** — the tool's empty-page
   termination assumption holds.
3. **NEW bug the probe caught (offline review could not):** the live API rejects
   `limit > 100` with 400, even though the OpenAPI says [1,1000]. The prior fix
   pass had set limit=1000 "to restore capacity" — which would have made every
   real fetch fail. Fixed to the real max (100), pinned by `DEEPGRAM_MAX_LIMIT`
   + a test.

**End-to-end proof:** the real production fetcher pulled 75 live requests across
pages in ~0.9s and extracted ~1.96h of billed STT time (2026-04-22 → 07-18),
0 skipped / 0 unavailable. The tool works against the real API.

## Recommendation / status
The tool is validated against the live API and offline (74 tests). The only step
left to run a full reconciliation is pointing `--ledger` at Voice Tutor's local
session ledger (JSONL with session_start/session_end/session_duration_sec) and
eyeballing the per-session delta/ratio. Branch `run-mru5b2o4` is ready for human
review/merge (5 commits: 1 harness build + 4 fix passes). Nothing is merged.
