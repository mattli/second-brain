# Voice Tutor — Economics

Written 2026-04-14 after the cost-log bug was fixed and the first real session came in at $6.43 for 18.5 min (~$21/hr).

## The question

Can this be economically viable as a business with these costs?

## Short answer

At the current stack, **no.** $21/hr variable cost vs. ChatGPT Voice at $20/mo unlimited is a losing battle. But the cost is almost entirely in two levers we control.

## Cost breakdown per hour (as of 2026-04-14)

| Component | Rate | Share |
|---|---|---|
| TTS (Cartesia Sonic, PAYG) | ~$8.10/hr | 38% |
| LLM (Claude Sonnet 4.5, 50K wiki cached every turn) | ~$12.30/hr | 57% |
| STT (Deepgram Nova-3) | ~$0.46/hr | 2% |
| **Total** | **~$21/hr** | |

STT is negligible. The margin hides in TTS and in how we ship context to the LLM.

## Where the margin hides

### 1. TTS is the fattest single lever

Cartesia PAYG at 15 credits/sec is premium pricing. Alternatives:

- **Deepgram Aura** (~$0.90/hr) — 9× cheaper, hosted
- **OpenAI TTS** (~$0.50/hr) — 16× cheaper, hosted
- **Self-hosted Kokoro / Piper on the Mac Mini** (~$0/hr) — free, slight quality tradeoff

Swapping TTS alone cuts 30–40% of cost.

### 2. Stop shipping the full wiki every turn

We currently cache ~50K tokens of wiki into every prompt. Cache reads at $0.30/Mtok × 50K × ~6 turns/min ≈ **$9/hr in cache reads** for content the model barely uses on any given turn.

Fixes:

- **RAG**: embed the wiki, retrieve 2–5K relevant tokens per turn. Drops LLM to $2–4/hr.
- **Model mix**: route most turns to Haiku 4.5, escalate to Sonnet only when the turn needs it.
- **Summarized wiki**: ship a 5K-token digest by default, full page only when retrieved.

### 3. Realistic target

**$2–3/hr marginal.** At that point:

- $30/mo tier sustains a ~30 min/day user with healthy margin
- $100/mo prosumer tier sustains 2 hr/day

## The real strategic answer

Getting costs down to undercut ChatGPT is the wrong frame — you can't win that race. The economic case only works if this does something ChatGPT Voice **can't**:

- Personal memory across sessions
- Wiki-grounded answers from your own knowledge base
- Agentic actions (create tasks, update notes, send messages, modify the wiki itself)

That justifies prosumer pricing where $50–100/mo is cheap vs. the time saved. Commodity voice chat is a loss leader. **The agent-with-your-context is the product.**

## Priorities if this ever becomes a product

1. Swap Cartesia → Deepgram Aura or self-hosted TTS (biggest immediate win)
2. Move wiki from full-cache to RAG / summary-first retrieval
3. Add agent capabilities (notes, tasks, wiki edits) to justify prosumer pricing
4. Only then think about pricing tiers

## For personal use

$21/hr is fine as infrastructure spend — the cost of running a personal thinking partner with full wiki context. No action needed unless daily usage climbs past ~1 hr/day, at which point swapping TTS is the first thing to do.
