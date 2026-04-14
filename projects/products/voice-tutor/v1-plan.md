---
title: "feat: Voice Tutor V1 — Pipecat + Claude with persistent memory"
type: feat
status: active
date: 2026-04-13
origin: v1-requirements.md
---

# feat: Voice Tutor V1 — Pipecat + Claude with persistent memory

## Overview

Build a self-hosted voice conversation service on Mac Mini using Pipecat, Claude, and persistent transcript memory. Accessed from phone browser via Tailscale. The goal is a two-week test of whether voice conversations with memory are meaningfully better than ChatGPT voice.

## Problem Frame

ChatGPT voice has no memory across sessions and no sense of who you are. Every conversation starts from zero. This builds a self-hosted alternative with persistent conversation history and a hand-maintained identity profile, testing whether memory is the missing piece. (see origin: `v1-requirements.md`)

## Requirements Trace

- R1. Pipecat service on Mac Mini with STT, Claude, and TTS
- R2. Web client accessible from phone browser via Tailscale
- R3. Natural conversation: interruptions, pauses, back-and-forth
- R4. Conversations transcribed and saved with timestamps
- R5. Recent transcripts loaded at session start
- R6. Agent references prior conversations naturally
- R7. Persistent profile document read at session start
- R8. Profile maintained by hand
- R9. No wiki integration

## Scope Boundaries

- No NanoClaw integration — standalone Python service
- No iOS app — phone browser over Tailscale (foreground only)
- No wiki read or write
- No automated profile updates
- No custom persona — vanilla Claude, conversational
- Single user only

## Context & Research

### Pipecat Capabilities (Confirmed)

- **AnthropicLLMService**: Native Claude integration with `system_instruction`, prompt caching (`enable_prompt_caching=True`), runtime settings updates via `LLMUpdateSettingsFrame`
- **SmallWebRTCTransport**: Peer-to-peer WebRTC via `aiortc`, no Daily dependency, **serves a prebuilt web UI at `localhost:7860/client`** — no custom frontend needed for V1
- **Silero VAD + Smart Turn v3**: Local CPU-based voice activity detection (~1ms processing per 30ms chunk) with AI-powered turn detection that prevents premature bot responses during pauses. Interruptions cancel pending LLM/TTS work automatically.
- **Deepgram Nova-3 STT**: Best-in-class real-time streaming, 6.84% WER, Pipecat's default
- **Cartesia Sonic TTS**: ~90ms time-to-first-audio, Pipecat's default. Hallucination-free.
- **Transcript events**: `on_user_turn_stopped` and `on_assistant_turn_stopped` fire with content and timestamps. `on_client_disconnected` fires on browser tab close.
- **No Docker required**: Bare Python 3.12 process on Mac Mini M4, ARM64 native

### External References

- Pipecat docs: https://docs.pipecat.ai
- Anthropic service: https://docs.pipecat.ai/server/services/llm/anthropic
- SmallWebRTC transport: https://docs.pipecat.ai/server/services/transport/small-webrtc
- Context management: https://docs.pipecat.ai/guides/learn/context-management
- Transcript saving: https://docs.pipecat.ai/guides/fundamentals/saving-transcripts

## Key Technical Decisions

- **SmallWebRTCTransport over DailyTransport**: No external service dependency, prebuilt browser UI, sufficient for single-user P2P. Daily is the upgrade path if NAT traversal becomes an issue (unlikely with Tailscale).
- **Deepgram STT + Cartesia TTS**: Pipecat's recommended low-latency stack. Both are cloud services (API keys required, per-minute cost), but fastest path to working voice. ElevenLabs is a premium TTS alternative if Cartesia voice quality isn't satisfactory.
- **Local filesystem for transcripts and profile**: Store at `~/.voice-tutor/` on Mac Mini. Simpler than vault for V1 — no Obsidian Sync complexity, no git concerns. Move to vault later if the tool proves out.
- **Per-session LLM construction**: Build `AnthropicLLMService` with a dynamic `system_instruction` that includes the profile doc and recent transcript summaries. Pipecat's `system_instruction` takes precedence over context messages and survives context updates.
- **Last 3 transcripts loaded at session start**: ~15K tokens of transcript context. Well within Claude's window, low first-token latency impact. Increase if conversations feel amnesic.
- **Smart Turn v3 for turn detection**: AI-powered analysis prevents the bot from jumping in during pauses. More natural than a fixed silence timeout.

## Open Questions

### Resolved During Planning

- **Does Pipecat have native Claude support?** Yes — `AnthropicLLMService` with prompt caching, streaming, function calling.
- **Can Pipecat serve a web client?** Yes — `SmallWebRTCTransport` serves a prebuilt UI at `localhost:7860/client`. No custom frontend needed.
- **Which STT/TTS providers?** Deepgram Nova-3 (STT) + Cartesia Sonic (TTS). Pipecat defaults, lowest latency.
- **How does interruption handling work?** Silero VAD detects speech, Smart Turn v3 determines if the user finished their thought. On interruption, pending LLM/TTS work is automatically cancelled. Enabled by default.
- **Where do transcripts live?** `~/.voice-tutor/transcripts/` as JSON files, one per session. Profile at `~/.voice-tutor/profile.md`.
- **How many transcripts to load?** Last 3 sessions (~15K tokens). Adjustable.

### Deferred to Implementation

- **Cartesia voice selection**: The default voice ID works for testing. Pick a preferred voice during real-world use.
- **Transcript format details**: JSON with role, content, timestamp per turn. Exact schema settled during Unit 2.
- **Profile doc initial content**: Seed with a few sentences about who you are and what you care about. Evolve by hand during the test period.
- **System prompt wording**: The exact conversational instructions for Claude. Start minimal, iterate based on conversation quality.

## Implementation Units

**Target repo:** New standalone repo (e.g., `~/Development/voice-tutor/` on Mac Mini) — this is a Python service, not part of cold-mountain or NanoClaw.

- [x] **Unit 1: Basic voice pipeline — STT → Claude → TTS**

  **Goal:** Get a working voice conversation with Claude via Pipecat's prebuilt web UI. Proves the pipeline works end-to-end.

  **Requirements:** R1, R2, R3

  **Dependencies:** None

  **Files:**
  - Create: `bot.py` — main Pipecat bot
  - Create: `.env` — API keys (ANTHROPIC_API_KEY, DEEPGRAM_API_KEY, CARTESIA_API_KEY)
  - Create: `pyproject.toml` — dependencies
  - Create: `.gitignore`

  **Approach:**
  - Use `pipecat init` or manual setup with `uv`
  - Pipeline: `transport.input() → DeepgramSTT → user_aggregator → AnthropicLLM → CartesiaTTS → transport.output() → assistant_aggregator`
  - SmallWebRTCTransport with prebuilt client
  - Silero VAD with Smart Turn v3 for natural turn-taking
  - Simple system instruction: "You are a friendly, curious conversational partner. Keep responses concise and natural for voice."
  - Bind to `0.0.0.0` so it's reachable via Tailscale

  **Patterns to follow:**
  - Pipecat `06-voice-agent.py` foundational example
  - Pipecat quickstart structure

  **Test scenarios:**
  - Happy path: Open `localhost:7860/client` in browser, speak a question, hear Claude respond with natural voice
  - Happy path: Have a multi-turn conversation — context carries between turns within a session
  - Happy path: Interrupt Claude mid-response — TTS stops, agent listens to new input
  - Happy path: Pause mid-sentence — Smart Turn waits for you to finish instead of jumping in
  - Edge case: Long silence — bot does not repeatedly prompt or crash
  - Edge case: Access from phone browser via Tailscale IP — audio works bidirectionally

  **Verification:**
  - Can have a natural voice conversation with Claude from both desktop browser and phone browser over Tailscale
  - Interruptions work — speaking while Claude talks causes it to stop and listen
  - Latency feels conversational, not laggy (sub-2s response time)

- [x] **Unit 2: Transcript saving**

  **Goal:** Save every conversation to disk as a JSON transcript so sessions are recoverable.

  **Requirements:** R4

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `bot.py` — add transcript event handlers and session save logic

  **Approach:**
  - Register `on_user_turn_stopped` and `on_assistant_turn_stopped` handlers on the aggregators
  - Accumulate turns in a list with role, content, and ISO timestamp
  - On `on_client_disconnected`, write the transcript to `~/.voice-tutor/transcripts/YYYY-MM-DD-HHMMSS.json`
  - Create `~/.voice-tutor/transcripts/` directory on first run if it doesn't exist
  - Include session metadata: start time, duration, turn count

  **Patterns to follow:**
  - Pipecat transcript saving guide (turn-level events, not deprecated TranscriptProcessor)

  **Test scenarios:**
  - Happy path: Complete a conversation, close browser tab — transcript JSON appears in `~/.voice-tutor/transcripts/` with correct content and timestamps
  - Happy path: Transcript includes both user and assistant turns in order
  - Edge case: Very short session (one turn) — still saves a valid transcript
  - Edge case: Browser disconnects unexpectedly (network drop) — `on_client_disconnected` still fires, transcript saves
  - Error path: `~/.voice-tutor/transcripts/` doesn't exist — directory is created automatically

  **Verification:**
  - After each conversation, a readable JSON transcript exists on disk with accurate content

- [x] **Unit 3: Session memory — transcript loading + profile**

  **Goal:** At session start, load recent transcripts and the profile doc into Claude's system prompt so conversations build on prior context.

  **Requirements:** R5, R6, R7

  **Dependencies:** Unit 2

  **Files:**
  - Modify: `bot.py` — add context loading logic before LLM construction
  - Create: `~/.voice-tutor/profile.md` — seed profile document

  **Approach:**
  - On each new session (bot startup or `on_client_connected`), read the profile doc and last N transcript files
  - Construct a dynamic `system_instruction` that includes:
    1. Base conversational instructions
    2. Profile document content (who you are, what you care about)
    3. Summaries or key excerpts from recent transcripts ("In your last conversation on [date], you discussed X")
  - Pass the assembled instruction to `AnthropicLLMService.Settings(system_instruction=...)`
  - Enable prompt caching (`enable_prompt_caching=True`) so the profile + transcript context is cached across turns within a session
  - Start with last 3 transcripts. If context feels thin, increase; if latency suffers, decrease.
  - Seed `profile.md` with a few sentences to start. User edits it by hand over the test period.

  **Patterns to follow:**
  - Pipecat context management guide — `system_instruction` takes precedence over context messages

  **Test scenarios:**
  - Happy path: Have conversation A about topic X. Start new session. Ask "what did we talk about last time?" — agent references topic X accurately
  - Happy path: Profile says "I'm interested in AI and scaling laws." Ask about a general topic — agent connects it back to your interests
  - Happy path: No prior transcripts exist (first session) — bot works normally with just the profile
  - Happy path: No profile.md exists — bot works with base instructions only, no crash
  - Edge case: Prior transcript is very long (30+ minute conversation) — system prompt stays within reasonable token budget
  - Integration: Profile + transcript context + current conversation all coexist in Claude's context without confusion about what's "now" vs. "before"

  **Verification:**
  - Conversations reference prior sessions naturally
  - Profile content visibly shapes how the agent responds (tone, topic awareness)
  - No perceptible latency increase from loading context

- [x] **Unit 4: Startup script + deployment**

  **Goal:** Make the service easy to start, stop, and run persistently on Mac Mini.

  **Requirements:** R1, R2

  **Dependencies:** Unit 3

  **Files:**
  - Create: `start.sh` — startup script
  - Create: `README.md` — setup and usage instructions

  **Approach:**
  - Shell script that activates the venv, sets env vars from `.env`, runs `python bot.py --host 0.0.0.0`
  - Document the Tailscale URL for phone access (Mac Mini's Tailscale IP + port 7860)
  - Document API key setup (Anthropic, Deepgram, Cartesia)
  - Consider a simple launchd plist for auto-start on boot (optional, only if manual start feels annoying during the test)

  **Test scenarios:**
  - Happy path: Run `./start.sh`, open Tailscale URL on phone, have a voice conversation
  - Happy path: Kill the process, restart — prior transcripts are still loaded
  - Edge case: Port 7860 already in use — clear error message

  **Test expectation: none** — this is infrastructure/scripting, verified by manual use

  **Verification:**
  - Can start the service with one command and connect from phone within 30 seconds

## System-Wide Impact

- **Interaction graph:** Standalone service — no callbacks, middleware, or integration with NanoClaw or other systems. Only external calls are to Anthropic API, Deepgram API, and Cartesia API.
- **Error propagation:** API failures (Anthropic, Deepgram, Cartesia) should surface as voice feedback ("I'm having trouble connecting") rather than silent failure. Pipecat's pipeline handles this with frame-level error propagation.
- **State lifecycle risks:** Transcript loss on unexpected process termination (OOM, power loss) — acceptable for V1. Transcripts accumulate on disk indefinitely — add cleanup only if disk usage becomes noticeable.
- **Unchanged invariants:** NanoClaw, Telegram Wiki Tutor, Readwise wiki pipeline, vault sync — all completely untouched. This service has zero interaction with existing infrastructure.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| SmallWebRTCTransport doesn't work over Tailscale (NAT/firewall) | Tailscale provides direct peer-to-peer connectivity, so WebRTC should work. If not, fall back to FastAPIWebsocketTransport or DailyTransport. Test in Unit 1. |
| Cartesia voice quality not satisfactory | Swap to ElevenLabs (one-line change). Higher cost but better voice quality. |
| Phone browser foreground requirement kills the experience | Known limitation, accepted for V1. If voice proves out, Capacitor iOS app is the fix (already designed in April 11 brainstorm). |
| API costs higher than expected at daily use | Deepgram STT ~$0.0059/min, Cartesia TTS ~$0.015/min, Claude API varies. At 30 min/day, roughly $20-40/month all-in. Monitor during test. |
| Mac Mini resources strained with Pipecat + NanoClaw | Silero VAD is CPU-lightweight. STT/TTS are cloud-based (no local compute). Only concern is if multiple services compete for memory. Monitor during test. |

## Sources & References

- **Origin document:** `v1-requirements.md`
- **Prior voice brainstorm:** `projects/nanoclaw/engineering-docs/2026-04-11-voice-channel-brainstorm.md`
- **Pipecat docs:** https://docs.pipecat.ai
- **Pipecat Anthropic service:** https://docs.pipecat.ai/server/services/llm/anthropic
- **Pipecat SmallWebRTC:** https://docs.pipecat.ai/server/services/transport/small-webrtc
- **Pipecat context management:** https://docs.pipecat.ai/guides/learn/context-management
- **Pipecat transcript saving:** https://docs.pipecat.ai/guides/fundamentals/saving-transcripts
- **Pipecat examples:** https://github.com/pipecat-ai/pipecat-examples
