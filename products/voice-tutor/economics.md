# Voice Tutor — Economics

Originally written 2026-04-14 when first real session came in at $21/hr. Revised 2026-04-22 after three rounds of optimization (slim cached system prompt, Inworld TTS, Haiku for post-session).

## The question

Can this be economically viable as a business with these costs?

## Short answer

Not yet at current stack, but it's close — and the gap is narrowing fast. Marginal cost dropped from ~$21/hr on 2026-04-14 to **~$4.30/hr** today. Two more fixes (RAG over wiki, daytime Haiku routing for simple turns) plausibly bring it under $2/hr, which is where prosumer tiers make sense.

## Providers & pricing (2026-04-22)

Sources: [claude.com/pricing](https://claude.com/pricing), [docs.inworld.ai](https://docs.inworld.ai/), [cartesia.ai/pricing](https://cartesia.ai/pricing), [deepgram.com/pricing](https://deepgram.com/pricing). Hardcoded in `bot.py:40-49`; refresh when vendors change.

### LLM (Anthropic)

| Model | Where it's used | Input | Cache write (5m) | Cache read | Output |
|---|---|---|---|---|---|
| Sonnet 4.5 (`claude-sonnet-4-5-20250929`) | live conversational turns (`bot.py:408`) | $3/MTok | $3.75/MTok | $0.30/MTok | $15/MTok |
| Haiku 4.5 (`claude-haiku-4-5-20251001`) | post-session summary (`bot.py:332`) + analysis (`bot.py:354`) | $1/MTok | $1.25/MTok | $0.10/MTok | $5/MTok |

Haiku is **5× cheaper** than Sonnet on every axis. Used only for end-of-session jobs where quality is uncritical.

### STT (Deepgram Nova-3)

$0.0077/min → **~$0.46/hr** at continuous audio.

### TTS (pick one via `TTS_PROVIDER` in `.env`)

| Provider | Rate | $/hr (60 min of audio) | Notes |
|---|---|---|---|
| **Inworld** (current) | $0.0042/min | ~$0.25/hr | Default voice: Olivia. 10.7× cheaper than Cartesia. |
| Cartesia Sonic-3 | $0.045/min (15 cr/s × $5/100K cr on Pro) | ~$2.70/hr | Previous default; higher perceived quality. |
| Kokoro (local) | $0/min | $0/hr | Shelved 2026-04-22 — wedges pipeline after tool calls; quality below bar anyway. |

## Cost breakdown per hour (measured 2026-04-22, 13-min session)

Using today's post-optimization stack: Sonnet 4.5 + Inworld + Nova-3, with 95%+ cache hit rate after warmup.

| Component | Per hour | Share |
|---|---|---|
| LLM (Sonnet 4.5, live) | ~$3.60 | 84% |
| TTS (Inworld) | ~$0.25 | 6% |
| STT (Deepgram Nova-3) | ~$0.46 | 11% |
| **Subtotal (marginal)** | **~$4.31** | |
| + Haiku summary + analysis | ~$0.02/session (flat) | |

Today's single session broke down as:
- cache_read: $0.34 (44%)
- output: $0.24 (30%)
- cache_write: $0.20 (26%)
- uncached input: $0.004 (<1%)

LLM is now 84% of variable cost. TTS is no longer the fattest lever; **the system prompt's cached payload is.**

## Where the margin still hides

### 1. System prompt payload on every cache read

We cache ~19K tokens per turn (system prompt + profile + most-recent transcript + wiki INDEX + tool defs). At 95% cache hit rate on a long session that's the majority of LLM spend.

Levers:

- **RAG / on-demand everything**: move profile and transcript summaries to tool calls, only ship what a turn needs. Plausibly halves cache_read cost.
- **Compact accumulating memory**: `~/.voice-tutor/memory.md` grows unbounded; planned future step once it crosses ~2K tokens.

### 2. Model mix on live path

Right now *every* conversational turn hits Sonnet. Many turns are short and don't need it.

- **Route simple turns to Haiku 4.5** (~5× cheaper), escalate to Sonnet when the turn needs reasoning. Requires a turn-classification step — non-trivial.

### 3. Output tokens

~270 output tokens/turn already — the "one thought at a time" system prompt (commit `93000aa`) keeps this in check. Little left to squeeze.

## Done (historical priorities from the 2026-04-14 doc)

- ~~Swap Cartesia → cheaper TTS~~ — done 2026-04-22 (Inworld, 10.7× cheaper)
- ~~Stop shipping full wiki every turn~~ — done 2026-04-15 (INDEX-only + on-demand pages)
- ~~Use Haiku for non-critical calls~~ — done 2026-04-22 (summary + analysis)

## Still open

1. **RAG-style on-demand profile + transcripts** — trim the 19K cached block
2. **Turn-level model routing** (Haiku simple, Sonnet hard)
3. **Memory compaction** when `memory.md` > 2K tokens
4. **Agent capabilities** (notes, tasks, wiki edits) — justifies prosumer pricing even at $4/hr

## For personal use

**~$4.30/hr** is easy infrastructure spend. At 30 min/day, that's ~$65/month — less than one meal out, and the tutor has full context of your profile + last session. No urgent action needed; revisit if daily usage crosses 1 hr.
