# Run report — credentialed smoke (Sprint 3)

**Judged at:** 2026-08-04T00:39:29.190382+00:00
**Model:** `claude-haiku-4-5-20251001`
**Judge prompt (v2) hash:** `5b9090d7a60ce5d1`
**Total live judge calls:** 5 (happy path = 5; bound = 5 × max_attempts = 10)
**Result:** PASS — 17/17 label agreement

## Per-session raw covered_ids (union + strictness recomputable from here)

| session | claim map | #claims | #covered | covered_ids |
|---|---|---|---|---|
| f6148c26 | matt-2aa66acc | 63 | 10 | c1, c15, c17, c2, c3, c47, c5, c6, c8, c9 |
| 7beee170 | matt-2aa66acc | 63 | 11 | c15, c2, c21, c27, c28, c3, c31, c46, c47, c48, c9 |
| d33800bf | matt-2aa66acc | 63 | 0 | (none) |
| bb979045 | matt-2aa66acc | 63 | 3 | c1, c2, c3 |
| 12f3a30d | shared-ac4b826f | 71 | 1 | c56 |

## PRIMARY union (four primary sessions vs the 63-claim matt map)

- covered_ids (16): `c1, c15, c17, c2, c21, c27, c28, c3, c31, c46, c47, c48, c5, c6, c8, c9`
- coverage percentage (derived): 25.4%

### Per-claim label agreement (16 upheld + c30 regression)

| claim | answer key | judge (v2) | agree |
|---|---|---|---|
| c1 | covered | covered | ✅ |
| c2 | covered | covered | ✅ |
| c3 | covered | covered | ✅ |
| c5 | covered | covered | ✅ |
| c6 | covered | covered | ✅ |
| c8 | covered | covered | ✅ |
| c9 | covered | covered | ✅ |
| c15 | covered | covered | ✅ |
| c17 | covered | covered | ✅ |
| c21 | covered | covered | ✅ |
| c27 | covered | covered | ✅ |
| c28 | covered | covered | ✅ |
| c31 | covered | covered | ✅ |
| c46 | covered | covered | ✅ |
| c47 | covered | covered | ✅ |
| c48 | covered | covered | ✅ |
| c30 | not_covered | not_covered | ✅ |

## Strictness trap (session 12f3a30d vs the 71-claim shared map)

- covered (1 ≤ 2? ✅): `c56`

## Cost

- live Haiku judge calls: **5** (~$0.07 at ~5 calls)
- cost-out JSON: `coverage_smoke_cost.json`

## Interpretation

All 17 labels agree: the 16 upheld claims are covered in the primary union, c30 (the mandatory v2 regression) is NOT covered, and the strictness trap stays within the ≤ 2 ceiling. Recall was not traded for the c30 fix. Ready to wire into the app in a later CC session.

