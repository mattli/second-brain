# Voice Tutor

Self-hosted voice conversation service on Mac Mini using Pipecat, Claude, and persistent memory. Accessed from phone browser via Tailscale.

## Status

**V1 shipped** (2026-04-13). All 4 implementation units complete plus wiki integration.

**First Reddit validation run completed** (2026-04-14). 156 posts → 9 findings (3 score-3, 6 score-2), 2 power-user candidates. The "drowning in saves" pain shows up in real users' words; pain concentration is lower than the doc's confidence implied. See `product-validation-findings-2026-04-14.md`. Phase 2 conversations are warranted; pricing conversations aren't yet.

**Per-session cost telemetry shipped** (2026-04-14). Voice tutor now writes a `<session>.usage.json` sidecar next to every transcript and appends a row to `cost-log.md` in this folder (LLM / STT / TTS breakdown with estimated USD cost). Subscribed to Cartesia Pro ($5/mo monthly) after hitting a 402 on the free tier mid-session.

## Architecture

- **STT**: Deepgram Nova-3
- **LLM**: Claude Sonnet 4.5 via Anthropic API (prompt caching enabled)
- **TTS**: Cartesia Sonic (voice: British Reading Lady)
- **Transport**: SmallWebRTC via Pipecat, prebuilt web UI
- **Access**: Tailscale Serve HTTPS proxy → phone browser

## What it does

- Voice conversations with Claude that remember who you are (profile doc) and what you've talked about (last 3 transcripts)
- Full personal wiki (~50K tokens) loaded into system prompt — can teach, reference, and connect ideas from your knowledge base
- Transcripts saved automatically on session disconnect

## Repo & data

- **Code**: `~/Development/voice-tutor/`
- **Data**: `~/.voice-tutor/` (profile.md, transcripts/)
- **Wiki source**: `~/second-brain/resources/wiki/`

## Access

- Local: `http://localhost:7860/client/`
- Phone: `https://matts-mac-mini.taild1f9b7.ts.net/client/`
- Start: `./start.sh` from repo root

## API keys

Three keys in `.env`: Anthropic, Deepgram, Cartesia. Estimated cost at 2hr/day: $80-160/month.

Cartesia is on **Pro** ($5/mo billed monthly, 100K credits ≈ 1.85 hr of audio/mo). Past that it bills overage — check the dashboard if `cost-log.md` starts trending over budget.

## Known issues

- Prebuilt Pipecat UI shows duplicated text (bot-llm-text + deprecated bot-transcription). Voice output is correct. Cosmetic only.
- Memory is a sliding window of last 3 transcripts — older conversations are lost, no summarization.
- `bot.py` runs as a bare foreground process — no supervisor, no log file, no health check. A 24-hour session on 2026-04-14 did not visibly wedge (the real bug was Cartesia 402), but for production use it needs launchd + log to disk + restart policy. Pipecat itself is not the issue.

## Next steps

### Short term (use it for a week, then decide)
- **Pick a Cartesia voice** — browse play.cartesia.ai, find something that isn't British Reading Lady
- **Use it daily** — talk through ideas, ask about wiki topics, think out loud. See if it feels different from ChatGPT voice now that it has wiki context.
- **Monitor API costs** — `cost-log.md` in this folder now has per-session totals; cross-check against each vendor's dashboard after a week of use

### If it proves valuable
- **Transcript summarization** — instead of loading last 3 transcripts verbatim, distill older conversations into key takeaways so memory doesn't fall off after 3 sessions
- **Readwise integration** — load recent Readwise highlights into context so the tutor can reference what you're currently reading, not just the compiled wiki
- **Daily briefing readout** — have the tutor read your daily briefing and let you ask follow-up questions by voice
- **Custom frontend** — replace the Pipecat prebuilt UI to fix the duplicate text issue and tailor the experience
- **launchd auto-start** — start the bot automatically on Mac Mini boot so you never have to SSH in to run start.sh

### If it proves very valuable
- **Function calling / actions** — give the voice agent tools to save notes, create tasks, update wiki pages. This is the path to replacing the Telegram NanoClaw interface with voice.
- **Profile auto-updates** — have Claude update profile.md based on what it learns in conversations (with approval)
- **Capacitor iOS app** — native app that keeps audio running in the background, solving the "phone browser must stay in foreground" limitation

## Open questions

- Is the wiki-in-context approach sufficient, or does it need topic-aware retrieval as wiki grows?
- Should transcripts be summarized/distilled rather than loaded verbatim?
- How much does prompt caching actually save with ~50K tokens of wiki? Monitor Anthropic dashboard.
- Could this replace the Telegram NanoClaw interface with voice-driven actions?
