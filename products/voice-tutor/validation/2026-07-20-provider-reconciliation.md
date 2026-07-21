# Provider cost reconciliation — findings (2026-07-20)

> Produced by `reconcile_costs.py` (Voice Tutor repo, a standalone manual diagnostic — NOT part of the app, NOT a dev-harness run). It diffs the local ledger (`cost-log.jsonl`) against what Anthropic / Deepgram / Cartesia *actually billed* via their usage APIs. This is the check the 2026-07-20 internal-consistency audit ([[2026-07-20-cost-audit-findings]]) deliberately could not do. Idea origin: [[ideas]] — "provider cost reconciliation."
> Range reconciled: **full ledger history, 2026-04-15 → 2026-07-18** (52 rows: 38 session/legacy, 14 artifact). Read-only everywhere.

## Verdict per provider

| provider | ledger recorded | provider billed | verdict | direction |
|----------|-----------------|-----------------|---------|-----------|
| **Anthropic** | $26.96 | **~$12.40** | ❌ DISCREPANCY (~2.2×) | ledger **over**-states |
| **Cartesia** | $16.32 | **$7.09** | ❌ DISCREPANCY (~2.3×) | ledger **over**-states |
| **Deepgram** | $1.54 | *unverified* | ⚠️ BLOCKED | app key lacks `usage:read` scope |

**Headline:** the ledger's *arithmetic* is honest (the internal audit was right — trustworthy to the cent), but its *usage inputs* are inflated. We have been **over-estimating our own spend by roughly 2×**. Confirmed actual spend on the two verifiable providers is **~$19.5 vs the ~$43.3 the ledger recorded** for them. This is a good-news surprise (we are not being over-billed by a provider) — but the ledger, `economics.md`, and any cost-per-hour figures derived from it are overstated and should be treated as an upper bound until the logging is fixed.

## Anthropic — over-counts cache tokens, and misses off-ledger usage

Filtered to the Voice Tutor key only (`api_key_id=apikey_01A2DXnC7PivLeAqgH41XECQ`, resolved by matching the app key's hint — the org has 5 keys and this is the right one). Whole-range token totals:

| class | ledger | provider (billed) | Δ |
|-------|--------|-------------------|---|
| Sonnet uncached input | 27,590 | 70,546 | provider higher |
| Sonnet cache read | 50,905,200 | 24,314,618 | **ledger 2.09×** |
| Sonnet cache write | 2,522,450 | 1,079,251 | **ledger 2.34×** |
| Sonnet output | 135,955 | 40,852 | **ledger 3.33×** |
| Haiku uncached input | 70,161 | 155,098 | provider higher |
| Haiku output | 6,719 | 16,080 | provider higher |
| **derived cost** | **$26.96** | **$12.40** | ledger 2.17× |

Two distinct real effects overlap here (the reason the naive whole-range diff looks chaotic):

**1. Cache-token over-count on logged sessions.** On a controlled single-session day (2026-07-18, one session, 38 turns), the two dominant classes are an *exact* integer multiple:

| class | ledger | provider | ratio |
|-------|--------|----------|-------|
| cache_read | 655,855 | 131,171 | **exactly 5.00×** |
| cache_write | 37,950 | 7,590 | **exactly 5.00×** |
| output | 5,735 | 1,117 | 5.13× |

Across all logged days the over-count ratio ranges 2×–5× and **grows with turn/tool volume** (single-turn days ~2×, high-turn days ~5×). Because cache reads dominate the LLM bill ($0.30/Mtok × 50.9M = the bulk of the recorded $26.96), this inflation is most of the Anthropic gap. **Hypothesis (needs a `bot.py` trace to confirm):** the per-session usage aggregator is summing Pipecat's cumulative/per-frame `LLMUsageMetrics` more than once per actual API response — the exact-integer ratios and the growth-with-turns pattern both fit a repeated-accumulation bug rather than genuine billing drift.

**2. Off-ledger provider usage.** Several days have real Anthropic usage on the Voice Tutor key with **zero ledger sessions** — 2026-04-14 (1.84M Sonnet tokens), 2026-05-13 (56k Haiku), 2026-06-01 (16k Haiku). These are dev/testing/failed-session calls that hit the API but were never written to the ledger. This is why whole-range *uncached input* and *Haiku* both run provider-higher even though logged sessions run ledger-higher. It also means the Voice Tutor key is not exclusively app traffic — reconciliation attributes it correctly, but the ledger will never see this usage.

## Cartesia — over-counts submitted TTS characters ~2.3×

- Ledger: **326,463 characters** submitted to TTS → treated as 326,463 credits (conversion assumption: **1 Cartesia credit = 1 character**, per `PRICE_CARTESIA_PER_CHAR`).
- Cartesia billed: **141,852 credits** (whole-account; VT's Cartesia account is dedicated to this app, so the whole account *is* Voice Tutor).
- Ledger over-states by **184,611 credits (2.30×) = ~$9.23**.

This matches the voice-seam hypothesis flagged in [[2026-07-20-cost-audit-findings]]: the ledger logs characters **submitted** to the TTS WebSocket, but Cartesia bills characters actually **synthesized**. On barge-in (user interrupts, speech cut off), text is submitted but not fully synthesized — so submitted > billed. A 2.3× ratio implies a large fraction of submitted TTS is interrupted before completion, which is plausible for a conversational tutor.

## Deepgram — could not verify (credential scope)

`GET /v1/projects/{id}/usage/breakdown` returned **HTTP 403 INSUFFICIENT_PERMISSIONS**: the app's `DEEPGRAM_API_KEY` (from `.env`) lacks the `usage:read` scope on the project (`fef96cca-…`). The tool resolved the project correctly; the key just can't read usage. **To unblock:** create (or re-scope) a Deepgram key with `usage:read` and either put it in `.env` or pass it via env for a one-off run; the tool already supports a `DEEPGRAM_PROJECT_ID` override. Ledger recorded 199.86 STT minutes / $1.54 for the range — likely also affected by the same barge-in/retry seams, but unconfirmed until the scope is fixed.

## The tool

- `reconcile_costs.py` in the Voice Tutor repo root. Stdlib-only (imports pricing constants from `cost_audit.py` for a single source of truth); no pipecat/ML import surface. Read-only; never prints API keys.
- Credentials: `~/.voice-tutor-secrets.env` (ANTHROPIC_ADMIN_KEY, CARTESIA_ADMIN_KEY) + the app's `.env` (DEEPGRAM_API_KEY, ANTHROPIC_API_KEY for key-id discovery).
- Run: `.venv/bin/python reconcile_costs.py [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--json] [--providers ...] [--tolerance-pct N]`. Default range = full ledger history; default tolerance ±1% (also settable via `RECONCILE_TOLERANCE_PCT`).
- Timezone: ledger timestamps are naive local (America/Los_Angeles); the tool converts the local range to a padded UTC window before querying, and reconciles whole-range totals so day-boundary snapping is a non-issue.
- Unit tests cover the pure ledger-summing + reconciliation math only (`tests/test_reconcile_costs.py`, 23 tests); the network fetchers are verified by this real run.

## Next steps (candidates, not yet scheduled)

1. **Trace `bot.py`'s Anthropic usage aggregation** — confirm/fix the cache-token over-count (the exact 5× is the strongest lead). This is where the real money-visibility fix is: it would bring recorded Anthropic cost from $26.96 → ~$12.40 for this history.
2. **Cartesia: log synthesized (billed) chars, not submitted** — or record both, so barge-in loss is visible instead of silently inflating cost.
3. **Fix the Deepgram key scope** and re-run to close the last provider.
4. Decide whether off-ledger key usage (dev/testing) matters enough to isolate (separate dev key) — for cost *accuracy* of real sessions it does not, but it means the provider dashboard will always read a bit higher than the ledger.
