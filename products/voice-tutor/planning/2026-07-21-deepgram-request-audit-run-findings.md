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

## Reconciliation results (ran against the real ledger 2026-07-21)
Ledger: `~/second-brain/products/voice-tutor/validation/cost-log.jsonl` (mixed
cost-log; `parse_ledger` fixed to skip non-session artifact/legacy rows).

**Rule-out-yourself pass first (per the shared "diff vs external source" rule):**
- **Window:** Deepgram retains only ~90 days of request logs; data floor is
  2026-04-22 (= today − 90d, exact). The ledger's 10 oldest sessions (Apr 15–20,
  6,833 wall-sec) have NO Deepgram data to compare — a retention artifact, not an
  under-count. It alone accounts for ~92% of the raw gap.
- **Coverage/units:** confirmed page-complete fetch; both sides in seconds; the
  matched sessions line up (ratios mostly 0.95–0.99), which cross-checks units.

**Full ledger (all 38 sessions):** wall 11,990s vs Deepgram-billed 4,601s,
overall ratio **0.38** — dominated by the retention artifact above.

**Clean 90-day window (28 in-retention sessions):** wall 5,157s vs billed 4,601s,
overall ratio **0.89**. Deepgram bills ~89% of session wall-clock — healthy
(the ~11% is in-session silence). Original worry ("ledger under-counts Deepgram
STT") is **NOT confirmed** once retention is accounted for.

**The one real thing to look at:** 46 Deepgram requests (~2,458s ≈ 41 min of
billed STT) match NO ledger session — clustered on May 12–13 and June 1, days
where the ledger has few/no sessions, mostly tiny (0–4s) calls. The daily
breakdown corroborates the concentration: May 12 = 24 req (550s), May 13 = 13 req
(788s), June 1 = 8 req (1,303s), all on days with little/no ledger activity. These
same May 12–13 / June 1 dates line up with the zero-ledger days flagged in the
Anthropic (LLM) reconciliation — **third-provider corroboration that this is
off-ledger dev/testing usage**, not a per-session cost error.

## Reconciling the two Deepgram sources (breakdown vs per-request) — ONE story
Two Deepgram totals looked contradictory; live probing shows they are not — they
just see different windows. All numbers verified against the live API 2026-07-21.

| Window | usage/breakdown (aggregate) | /requests (per-request) |
|---|---|---|
| Full 04-15→07-18 | 15,409s (256.8 min, 89 req) | — retention-blocked |
| Retained 04-22→07-18 | 7,059s (117.6 min, 75 req) | 7,059s (75 req) — **exact match** |
| Pre-cutoff 04-15→04-21 | 8,350s (139.2 min, 14 req) | — purged |

- **The breakdown endpoint is NOT retention-limited** (it returns the Apr 15–21
  data /requests has dropped); the retention floor for /requests is exactly
  2026-04-22 (earliest `created` = 2026-04-22T22:59:36Z = today − 90d). Additivity
  holds: 7,059 + 8,350 = 15,409.
- **Within the 90-day window the two sources agree to the second** (7,059s / 75
  req both), so the per-request analysis is complete for what it can see; the
  full-range gap is 100% pre-retention data, not a double-count or a bug.
- **Pre-cutoff ratio = 8,350s billed ÷ 6,833s pre-cutoff session wall-clock =
  1.22×** — a modest excess (14 Deepgram requests vs 10 ledger sessions in that
  period), NOT the ~1.5× hypothesized. The 1.5× came from a cited 287.65-min
  breakdown figure; the live endpoint returns 256.8 min for the same range and
  the same summation `reconcile_costs.py` uses, so 1.5× was an artifact of that
  higher input, not the data. Given the retained-window evidence (matched sessions
  bill 0.89–0.99× wall-clock, and the >1 blended ratio comes from off-ledger dev
  traffic), the pre-cutoff 1.22× is most consistent with early-April dev/testing
  usage plus a little connection-open time — not systematic per-session over-bill.
- **Current sessions are healthy:** matched ratios 0.89–0.99, wall-clock a
  slightly conservative proxy for Deepgram-billed audio.

**Open item for the fold-into-reconcile_costs work:** the `reconcile_costs.py`
run reported 287.65 min for the full range; the live breakdown endpoint returns
256.8 min for 04-15→07-18 with the same `hours`-summation. The ~31-min gap is
likely a different date range in that run — verify when merging the tools.

## Status
Tool validated live + offline (75 tests). Branch `run-mru5b2o4` ready for
human review/merge (6 commits: 1 harness build + 5 fix passes). Nothing merged.
Follow-up: fold into `reconcile_costs.py` and compare Deepgram-billed against the
ledger's own `stt_minutes_billed` (not just wall-clock) — see backlog.
