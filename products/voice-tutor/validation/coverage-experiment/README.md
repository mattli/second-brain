---
created: 2026-08-03
type: validation-experiment
---

# Claim-coverage experiment — Graph Engineering study sessions

An experiment (no app changes, nothing run on the live server) measuring how much
of each document's **claim map** a study-tutor session actually *explained* — judged
strictly by one Haiku call per session. See [[backlog]] and the two-doc version check
that preceded it.

## Baseline decision — each roster judged against its OWN doc's map

Two "Graph Engineering" documents exist (a `matt` doc and a newer `_shared`
superset). The decision for this run was: **judge each session against the claim map
of the doc it actually used**, not a single shared baseline.

| Scope | Doc | Claim map | Sessions judged |
|---|---|---|---|
| **PRIMARY** | `matt/2aa66acc-1c4b-4d7d-83fe-b361fbe38523` | 63 claims (mtime 2026-07-26 09:41:21) | `f6148c26`, `7beee170`, `d33800bf`, `bb979045` |
| **SECONDARY** | `_shared/ac4b826f-b189-442e-98c0-a59bb066d600` | 71 claims (mtime 2026-07-29 12:35:10) | `12f3a30d` (strictness test) |

Each `<session>.coverage.json` records which map it was judged against (`doc_key` +
`doc_claims_count`).

## Exclusions

- **`e96da2d8` (matt doc) — excluded.** Its session (2026-07-26 09:39:50) started ~91s
  *before* the matt claim map was written (09:41:21), so it ran without the current
  map (session start reads the sidecar cache-only; none existed yet). It cannot be
  judged against a map it never had.
- **`e37a01d3`, `9e92feb4`, `f82e0d16`, `8a691356` (matt doc) — excluded, no transcript.**
  Each has only a `prompt.txt` (no `.json`, no `usage.json`): the session was created
  but never recorded any turns, so there is nothing to judge. An empty session
  contributes nothing to a *union* of covered claims, so their exclusion does not
  change the union membership — but it means the PRIMARY roster is **4 judged
  sessions, not the 8** originally listed. The other 3 shared-doc/john sessions and
  all other shared sessions were out of scope by the baseline decision.

## Method

- **One `claude-haiku-4-5` call per session**, temperature 0 (model id
  `claude-haiku-4-5-20251001`). Key: `ANTHROPIC_API_KEY` from the app `.env` — the
  secrets file holds only an *admin* key, which can't call Messages; the key is never
  echoed.
- **Input:** that doc's claim list (id + claim text, **no anchors**) + the full
  indexed transcript (`[i] ROLE: content`, one line per turn).
- **Instruction (strict):** for each claim, did the **tutor** explain the claim's
  actual assertion comprehensively — not a passing mention, not topic adjacency? Every
  `covered: true` must cite **all** constituent assistant turn indices; no citable
  turn ⇒ not covered. Full text in `judge-prompt-v1.md` (hash `632b73a34b1a22b1`,
  recorded on every `.coverage.json` as `judge_prompt_hash`).
- **Session date = `prompt.txt` mtime** (the session's start artifact).

## Artifacts

- `judge-prompt-v1.md` — the exact judge prompt.
- `<session>.coverage.json` — per-session verdicts, cited turns, `judged_at`, `model`,
  `judge_prompt_hash`, doc judged against.
- `union.json` — union of covered claims across the 4 PRIMARY sessions, % over 63.
- `audit-sheet.md` — one row per PRIMARY-union claim for Matt to check (agree/disagree).
- `_run-cost.json` — token totals + Haiku cost for the run.

## Results (2026-08-03 run)

- **Strictness test (`12f3a30d`, shared doc):** 1 of 71 claims covered — honest, not
  generous (see the final report).
- **PRIMARY union:** 17 of 63 claims = **27%** (vs. the tutor's ~40% recap estimate).
- Per-session covered: `f6148c26` 10, `7beee170` 12, `d33800bf` 0, `bb979045` 11.
- Haiku cost: **$0.068** (30,007 in / 7,601 out).

**No labels file yet** — that happens after Matt's audit of `audit-sheet.md`.
