# Provider cost reconciliation — findings (2026-07-20)

> Produced by `reconcile_costs.py` (Voice Tutor repo, a standalone manual diagnostic — NOT part of the app, NOT a dev-harness run). It diffs the local ledger (`cost-log.jsonl`) against what Anthropic / Deepgram / Cartesia *actually billed* via their usage APIs. This is the check the 2026-07-20 internal-consistency audit ([[2026-07-20-cost-audit-findings]]) deliberately could not do. Idea origin: [[ideas]] — "provider cost reconciliation."
> Range reconciled: **full ledger history, 2026-04-15 → 2026-07-18** (52 rows: 38 session/legacy, 14 artifact). Read-only everywhere.

## Verdict per provider

| provider | ledger recorded | provider billed | verdict | direction |
|----------|-----------------|-----------------|---------|-----------|
| **Anthropic** | $26.96 | **~$12.40** | ❌ DISCREPANCY (~2.2×) | ledger **over**-states |
| **Cartesia** | $16.32 | **$7.09** | ❌ DISCREPANCY (~2.3×) | ledger **over**-states |
| **Deepgram** | $1.54 | **$2.22** | ❌ DISCREPANCY (~1.44×) | ledger **under**-states |

**Headline:** the ledger's *arithmetic* is honest (the internal audit was right — trustworthy to the cent), but its *usage inputs* are wrong on all three providers. Net we have been **over-estimating our own spend by roughly 2×**: confirmed actual spend across all three is **~$21.7 vs the $44.8 the ledger recorded**. This is a good-news surprise (no provider is over-billing us) — but the ledger, `economics.md`, and any cost-per-hour figures derived from it are unreliable and should be treated as rough until the logging is fixed. Note the directions differ: Anthropic and Cartesia are **over**-counted (dominating the net), while Deepgram is **under**-counted — so the errors partially mask each other in the total.

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

## Deepgram — under-counts STT minutes ~44% (verified 2026-07-20)

Initially blocked (the app's `.env` `DEEPGRAM_API_KEY` lacked the `usage:read` scope → HTTP 403). Re-run with a usage-scoped key + `DEEPGRAM_PROJECT_ID` (both in `~/.voice-tutor-secrets.env`) succeeded via `GET /v1/projects/{id}/usage/breakdown`:

- Ledger: **199.86 STT minutes** / $1.54.
- Deepgram billed: **287.65 minutes** (4.79 hours over 97 requests) / **$2.22**.
- Ledger **under**-states by **87.79 minutes (1.44×) = ~$0.68**.

**This is the opposite direction from Anthropic/Cartesia.** Likely mechanism (confirmed in code, see root cause below): the ledger records STT time as **session wall-clock duration** (`session_duration_sec / 60`, `bot.py:139`), not the actual audio duration Deepgram meters. Deepgram bills the audio streamed over the open connection (including silence / connection-open time beyond the measured session window), so it meters ~44% more than the wall-clock proxy. The one field that could have caught this (`stt_audio_sec_observed`) is itself corrupted by the Anthropic-side observer bug (below), so it reads ~8× and can't be trusted as a cross-check.

## Root cause in `bot.py` (read-only trace, 2026-07-20)

Both token and STT errors trace to `UsageAccumulator(BaseObserver)` and how it's wired.

**Anthropic over-count — per-hop frame multi-counting (confirmed bug).** `UsageAccumulator.on_push_frame` (`bot.py:88-126`) does `self.<tokens> += …` for every `MetricsFrame` it sees, with **no dedup by frame identity and no source/direction filter**. Pipecat invokes `on_push_frame` **once per processor-to-processor hop** (`frame_processor.py:929` downstream, `:941` upstream), and the single observer is attached pipeline-wide (`observers=[usage]`, `bot.py:579`). So each LLM response's usage delta is added **once per hop the `MetricsFrame` traverses** — i.e., multiplied by the number of downstream processors. That produces the observed *exact-integer* ratios (cache_read and cache_write both exactly **5.00×** on the controlled 2026-07-18 session). NB: the values Pipecat emits are **per-response deltas, not cumulative running totals** — so the "summing cumulative values as deltas" theory is *refuted*; the real bug is frame-level multi-counting. Why the multiple varies 2×–5× across sessions (pipeline topology / mode / interruptions changing hop count) needs runtime evidence to pin down.

**Deepgram under-count — wall-clock proxy for billed audio (confirmed).** `summary()` bills STT as `session_duration_sec / 60` (`bot.py:139`), where `session_duration_sec = (session_end − session_start)` between two `datetime.now()` calls (`bot.py:583`, `:607`). The comment at `bot.py:135-138` *assumes* "SmallWebRTCTransport streams continuously, so session_duration_sec is ground-truth" — the +44% billed gap refutes that assumption. Exact driver (connection-open time vs active window, silence billing, per-request overhead) needs runtime evidence.

See the accompanying investigation notes for the per-hypothesis verdicts (confirmed / refuted / needs-runtime-evidence) and the exact logging that would settle the open pieces.

## The tool

- `reconcile_costs.py` in the Voice Tutor repo root. Stdlib-only (imports pricing constants from `cost_audit.py` for a single source of truth); no pipecat/ML import surface. Read-only; never prints API keys.
- Credentials: `~/.voice-tutor-secrets.env` (ANTHROPIC_ADMIN_KEY, CARTESIA_ADMIN_KEY, and a usage-scoped DEEPGRAM_API_KEY + DEEPGRAM_PROJECT_ID) + the app's `.env` (ANTHROPIC_API_KEY for key-id discovery; secrets-file values override `.env`).
- Run: `.venv/bin/python reconcile_costs.py [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--json] [--providers ...] [--tolerance-pct N]`. Default range = full ledger history; default tolerance ±1% (also settable via `RECONCILE_TOLERANCE_PCT`).
- Timezone: ledger timestamps are naive local (America/Los_Angeles); the tool converts the local range to a padded UTC window before querying, and reconciles whole-range totals so day-boundary snapping is a non-issue.
- Unit tests cover the pure ledger-summing + reconciliation math only (`tests/test_reconcile_costs.py`, 23 tests); the network fetchers are verified by this real run.

## Next steps (candidates, not yet scheduled)

1. **Fix `UsageAccumulator`'s per-hop multi-counting** (`bot.py:88-126`) — dedup each `MetricsFrame`/`InputAudioRawFrame` so its usage is counted once, not once per processor hop. This is the biggest money-visibility fix: it would bring recorded Anthropic cost from $26.96 → ~$12.40, and also un-corrupt `stt_audio_sec_observed`. (Root cause section above.)
2. **Deepgram: bill on actual metered audio, not `session_duration_sec`** — once `stt_audio_sec_observed` is fixed (item 1) evaluate it as the billing basis, or pull Deepgram's per-request durations; the wall-clock proxy under-counts ~44%.
3. **Cartesia: log synthesized (billed) chars, not submitted** — or record both, so barge-in loss is visible instead of silently inflating cost.
4. Decide whether off-ledger key usage (dev/testing) matters enough to isolate (separate dev key) — for cost *accuracy* of real sessions it does not, but it means the provider dashboard will always read a bit higher than the ledger.
