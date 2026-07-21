# Cost-log audit — findings (2026-07-20)

> Produced by a dev-harness run (`mrtt2vyo`) that built `cost_audit.py` in the Voice Tutor repo, then ran it against the real ledger. Goal doc: [[2026-07-20-cost-log-verification-goal]]. Idea origin: [[ideas]] item 3.

## Verdict
**The cost ledger is internally accurate — trustworthy to the cent.** No corrupt rows, no missing or orphaned records. The only discrepancies are sub-penny rounding noise.

## What was checked
The audit reads `~/second-brain/products/voice-tutor/validation/cost-log.jsonl` and, for every row, **recomputes each `cost_*_usd` figure from that row's own usage fields** (tokens, TTS characters, STT minutes) using the pricing constants — then compares against the stored figure. It also checks structure: malformed lines, and `artifact` rows with no matching `session` row.

## Results (52 rows)
- **rows read:** 52
- **rows valid:** 43
- **malformed:** 0
- **orphan artifact rows:** 0
- **cost mismatches:** 10 — all sub-penny rounding, both directions (some stored a hair high, some a hair low), largest ≈ $0.00007 (six hundredths of one cent).

### The 10 rounding discrepancies
| line | field | stored | recomputed | delta |
|------|-------|--------|------------|-------|
| 17 | cost_total_usd | 0.156500 | 0.156553 | −0.000053 |
| 23 | cost_total_usd | 0.102400 | 0.102336 | +0.000064 |
| 27 | cost_total_usd | 0.321600 | 0.321650 | −0.000050 |
| 33 | cost_stt_usd | 0.257400 | 0.257334 | +0.000066 |
| 34 | cost_stt_usd | 0.002400 | 0.002464 | −0.000064 |
| 37 | cost_total_usd | 0.135700 | 0.135770 | −0.000070 |
| 39 | cost_stt_usd | 0.009400 | 0.009471 | −0.000071 |
| 39 | cost_total_usd | 0.298200 | 0.298270 | −0.000070 |
| 47 | cost_total_usd | 1.397100 | 1.397042 | +0.000058 |
| 48 | cost_total_usd | 0.257300 | 0.257360 | −0.000060 |

Because the deltas go both ways and never exceed a fraction of a cent, this is rounding behavior in the logger, **not** systematic over- or under-charging. No real total moves.

## Important caveat — what this does NOT prove
This is **internal-consistency checking only**: it confirms the logger's arithmetic is honest given each row's own numbers and the price list. It does **not** confirm:
- **the prices are right** (the audit trusts the price constants), or
- **the usage counts are right** (the audit trusts the token/character/minute counts the row recorded).

Both blind spots have the same fix, and it's the open next step: **reconcile the ledger against actual provider invoices/usage APIs** (Anthropic, Deepgram, Cartesia). See [[ideas]] — "provider cost reconciliation." Usage counts most plausibly drift at voice-specific seams: barge-in interruptions (characters submitted to TTS but speech cut off), retries/failed turns that still bill, and provider-side metering/rounding differing from ours.

## Status
- Tool merged to Voice Tutor `main` (merge `cc9aad7`), 143 tests green, hermetic. Read-only diagnosis — no change to how costs are logged.
- Sub-penny rounding is a candidate follow-up (tighten logger rounding so stored == recomputed exactly), not a bug fixed here.
