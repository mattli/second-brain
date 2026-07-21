# Voice Tutor — Economics

> ⚠️ **Stale (2026-07-20): the cost figures below are inflated ~2× by ledger logging bugs.** Provider reconciliation confirmed the local ledger over-states spend — Anthropic ~2.2× (an exact ~5× per-hop `MetricsFrame` multi-count on cache tokens), Cartesia ~2.3× (submitted- vs synthesized-TTS chars); Deepgram *under*-counts ~1.44×. **Net real marginal cost is roughly half of every figure on this page.** Do NOT rewrite the numbers until the `bot.py` logging fix lands and a re-run confirms new figures. See [[2026-07-20-provider-reconciliation]].

Originally written 2026-04-14 when first real session came in at $21/hr. Revised 2026-04-22 after two rounds of real optimization (slim cached system prompt, Haiku for post-session) plus one failed experiment (Inworld TTS).

## The question

Can this be economically viable as a business with these costs?

## Short answer

Not yet. Marginal cost dropped from ~$21/hr on 2026-04-14 to **~$6.70/hr** today — most of the win came from slimming the cached system prompt (2026-04-15). TTS remains the second-fattest lever; the one attempted swap (Inworld) turned out to cost the same. Two more fixes (RAG over remaining cached context, daytime Haiku routing for simple turns) plausibly bring total cost under $3/hr, which is where prosumer tiers make sense.

## Providers & pricing (verified 2026-04-22)

Sources: [claude.com/pricing](https://claude.com/pricing), [cartesia.ai/pricing](https://cartesia.ai/pricing), [inworld.ai/pricing](https://inworld.ai/pricing), [deepgram.com/pricing](https://deepgram.com/pricing). Hardcoded rates live in `bot.py:40-49`; refresh when vendors change.

### LLM (Anthropic)

| Model | Where it's used | Input | Cache write (5m) | Cache read | Output |
|---|---|---|---|---|---|
| Sonnet 4.5 (`claude-sonnet-4-5-20250929`) | live conversational turns (`bot.py:408`) | $3/MTok | $3.75/MTok | $0.30/MTok | $15/MTok |
| Haiku 4.5 (`claude-haiku-4-5-20251001`) | post-session summary (`bot.py:332`) + analysis (`bot.py:354`) | $1/MTok | $1.25/MTok | $0.10/MTok | $5/MTok |

Haiku is **5× cheaper** than Sonnet on every axis. Used only for end-of-session jobs where quality is uncritical.

### STT (Deepgram Nova-3)

$0.0077/min → **~$0.46/hr** at continuous audio.

### TTS — active: Cartesia Sonic-3

Billed at **1 credit per character** (≈ 14 chars/sec of speech, so ~840 credits per minute of audio). Plans, from cartesia.ai/pricing:

| Plan | Monthly billing | Yearly billing | Monthly credits | Audio/mo | Effective $/hr if fully used |
|---|---|---|---|---|---|
| Free | $0 | — | 20K | ~24 min | $0 |
| **Pro** (current) | $5 | $4 | 100K | ~1.67 hr | ~$2.40-$3.00/hr |
| Startup | $49 | $39 | 1.25M | ~20.8 hr | ~$2.35/hr |
| Scale | $239 | $239 | 8M | ~133 hr | ~$1.80/hr |

On Pro, anything past 100K credits/mo is charged overage at the same per-credit rate (~$0.05/credit × 1 credit/char × 1000 char/min ≈ **$0.05/min = $3/hr**). So Pro only pays for itself below ~1.67 hr/mo.

### TTS — fallback: Inworld (shelved, not cheaper)

Tried 2026-04-22 based on a stale `$0.0042/min` figure in the code README that turned out to be wrong. Actual rates for `inworld-tts-1.5-max` (on-demand):

| Model | Rate | → $/min (1 min ≈ 1000 chars per Inworld) | → $/hr |
|---|---|---|---|
| Inworld TTS Max (active choice) | $50 / 1M chars | $0.05/min | ~$3.00/hr |
| Inworld TTS Mini (lower quality) | $25 / 1M chars | $0.025/min | ~$1.50/hr |

Reverted to Cartesia the same day since credits remained on the subscription. Inworld Mini would be the only way Inworld beats Cartesia, and it's in the same quality bucket as Kokoro (already rejected on voice quality).

### TTS — local: Kokoro (shelved)

Free in theory ($0/hr), but wedges the Pipecat pipeline after any tool call and voice quality judged too low. Don't enable for real sessions until the audio-context bug is fixed.

## Cost breakdown per hour (measured 2026-04-22, 13-min session, pre-revert)

Even though the session was on Inworld, the LLM and STT numbers generalize. Substituting Cartesia's ~$3/hr for Inworld's equivalent cost doesn't change the picture much.

| Component | Per hour | Share |
|---|---|---|
| LLM (Sonnet 4.5, live) | ~$3.60 | 54% |
| TTS (Cartesia Sonic-3, overage rate) | ~$3.00 | 45% |
| STT (Deepgram Nova-3) | ~$0.46 | 7% |
| **Subtotal (marginal)** | **~$7.06** | |
| *if on Cartesia Startup plan, fully utilized* | ~$6.40 | |
| + Haiku summary + analysis | ~$0.02/session (flat) | |

Today's single 13-min session's LLM breakdown:
- cache_read: $0.34 (44%)
- output: $0.24 (30%)
- cache_write: $0.20 (26%)
- uncached input: $0.004 (<1%)

## Where the margin still hides

### 1. System prompt payload on every cache read

We cache ~19K tokens per turn (system prompt + profile + most-recent transcript + wiki INDEX + tool defs). At 95% cache hit rate on a long session that's the majority of LLM spend.

Levers:

- **RAG / on-demand everything**: move profile and transcript summaries to tool calls, only ship what a turn needs. Plausibly halves cache_read cost.
- **Compact accumulating memory**: `~/.voice-tutor/memory.md` grows unbounded; planned future step once it crosses ~2K tokens.

### 2. Model mix on live path

Right now *every* conversational turn hits Sonnet. Many turns are short and don't need it.

- **Route simple turns to Haiku 4.5** (~5× cheaper), escalate to Sonnet when the turn needs reasoning. Requires a turn-classification step — non-trivial.

### 3. TTS — already at market price

Cartesia at $3/hr overage is roughly the going rate for quality streaming TTS. Inworld Max matches it. Getting below ~$2/hr means either (a) accepting lower voice quality (Inworld Mini, Deepgram Aura, local Kokoro) or (b) committing to Cartesia Startup on yearly billing *and* using ≥20 hr/mo to amortize.

### 4. Output tokens

~270 output tokens/turn already — the "one thought at a time" system prompt (commit `93000aa`) keeps this in check. Little left to squeeze.

## Done (historical priorities from the 2026-04-14 doc)

- ~~Stop shipping full wiki every turn~~ — done 2026-04-15 (INDEX-only + on-demand pages). Biggest single win.
- ~~Use Haiku for non-critical calls~~ — done 2026-04-22 (summary + analysis)
- ~~Swap Cartesia → cheaper TTS~~ — attempted 2026-04-22 with Inworld, reverted same day (no actual savings at Max quality tier; see table above)

## Still open

1. **RAG-style on-demand profile + transcripts** — trim the 19K cached block
2. **Turn-level model routing** (Haiku simple, Sonnet hard)
3. **Memory compaction** when `memory.md` > 2K tokens
4. **Agent capabilities** (notes, tasks, wiki edits) — justifies prosumer pricing even at current cost

## For personal use

**~$6.70/hr** is still reasonable infrastructure spend. At 30 min/day, that's ~$100/month — less than a typical SaaS subscription stack, and the tutor has full context of your profile + last session. If daily usage crosses ~40 min, upgrade Cartesia to Startup ($49/mo monthly or $39/mo yearly) for ~$2.35/hr on audio and drop total to ~$6.00/hr. Below that is harder without quality tradeoffs.
