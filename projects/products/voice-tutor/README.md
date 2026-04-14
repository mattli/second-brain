# Voice Tutor

Self-hosted voice conversation service on Mac Mini using Pipecat, Claude, and persistent memory. Accessed from phone browser via Tailscale.

## Status

**V1 shipped** (2026-04-13). All 4 implementation units complete plus wiki integration.

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

## Known issues

- Prebuilt Pipecat UI shows duplicated text (bot-llm-text + deprecated bot-transcription). Voice output is correct. Cosmetic only.
- Memory is a sliding window of last 3 transcripts — older conversations are lost, no summarization.

## Open questions

- Is the wiki-in-context approach sufficient, or does it need topic-aware retrieval as wiki grows?
- Should transcripts be summarized/distilled rather than loaded verbatim?
- Voice selection — currently using default "British Reading Lady" from Cartesia
- Could this replace the Telegram NanoClaw interface with voice-driven actions (function calling)?
