---
date: 2026-04-13
topic: voice-tutor
---

# Voice Tutor

## Problem Frame

ChatGPT voice is the closest thing to a persistent voice learning companion, but it falls short in three ways: unreliable connections and interruption handling, no memory of past conversations, and no sense of who you are over time. The result is that every session starts from zero — you re-explain your background, your interests, and what you talked about last time.

The bet: a self-hosted voice interface running Claude via Pipecat, with persistent conversation history and a hand-maintained profile, will be meaningfully better than ChatGPT voice for ongoing learning conversations. Good enough that it becomes the default over ChatGPT voice within two weeks.

## Requirements

**Voice Infrastructure**
- R1. Pipecat service running on Mac Mini with STT, Claude as LLM, and TTS in a real-time pipeline
- R2. Minimal web client accessible from phone browser via Tailscale. Pipecat does not serve web clients natively — this requires a small static page using pipecat-js, served by a lightweight HTTP server alongside the Pipecat service.
- R3. Handles natural conversation patterns: interruptions, pauses, back-and-forth without feeling like turn-based Q&A

**Session Memory**
- R4. Every conversation is transcribed and saved with a timestamp
- R5. At the start of each session, the agent loads recent conversation transcripts so it knows what was discussed in prior sessions
- R6. The agent can reference prior conversations naturally ("last time we talked about X" or "you mentioned Y the other day")

**Identity Memory (Manual for V1)**
- R7. A persistent profile document that the agent reads at session start, capturing who you are, what you care about, and how you think
- R8. Profile is maintained by hand during the V1 test period — you update it when something stands out from reviewing transcripts. Automated profile proposals are a future upgrade if the concept proves out.

**Scope Constraints**
- R9. The agent does not read or write to the Readwise wiki. Vanilla Claude with memory, not a wiki tutor. Wiki integration is a future upgrade if voice proves out.

## Success Criteria

- Over a two-week test period, you reach for this instead of ChatGPT voice for learning conversations
- Conversations feel like they pick up where they left off, not like starting over each time
- The profile document, after two weeks of use, captures something real about how you think — useful enough that you'd want any new AI tool to read it

## Scope Boundaries

- No NanoClaw integration — standalone Pipecat service for V1
- No wiki read or write — memory comes from transcripts and the profile doc, not the wiki
- No iOS app — phone browser over Tailscale is sufficient for testing. Known limitation: phone must stay unlocked with browser in foreground; locking or switching apps kills the session. Acceptable for a two-week test, but a blocker for any future production version.
- No custom persona or teaching methodology — vanilla Claude, conversational
- No multi-user support — single user, single device
- No automated profile updates — maintain by hand for V1
- Reliability and conversational quality are table stakes, not features to experiment with — if Pipecat + Claude doesn't deliver these baseline, the architecture is wrong

## Key Decisions

- **Voice-first validation before wiki write-back**: Testing whether a persistent voice companion is valuable before adding wiki integration complexity. If voice doesn't stick, wiki write-back is moot.
- **Skip vanilla voice test**: You already use ChatGPT voice heavily, so the "will I use voice at all?" question is answered. V1 tests whether memory makes voice meaningfully better.
- **Manual profile over automated proposals**: Transcript-based memory (R4-R6) is the load-bearing test for V1. The profile doc (R7) adds identity context but is maintained by hand. Automated profile proposals are a separate hypothesis — test it later if transcripts prove the concept.
- **Pipecat over ChatGPT voice**: Self-hosted gives full control over memory, identity, and LLM choice. Not locked into OpenAI's stack or memory limitations.
- **Phone browser over Tailscale**: Minimum viable mobile access. No app build required. Tailscale already running on both devices.

## Dependencies / Assumptions

- Tailscale is running on Mac Mini and iPhone (confirmed)
- Pipecat supports Claude as an LLM provider (needs verification during planning)
- STT and TTS provider selection deferred to planning (Deepgram, Whisper, etc.)
- Mac Mini has sufficient resources to run Pipecat alongside NanoClaw

## Outstanding Questions

### Resolve Before Planning

(None — all blocking product decisions resolved)

### Deferred to Planning

- [Affects R1][Needs research] Which STT and TTS providers work best with Pipecat for conversational latency? Deepgram, Whisper, ElevenLabs, others?
- [Affects R1][Needs research] Does Pipecat have a native Claude/Anthropic integration, or does it need a custom LLM service adapter?
- [Affects R1][Technical] The Pipecat service needs to assemble its own system prompt (profile doc + recent transcripts + conversational instructions) since there's no NanoClaw. Plan should specify the prompt construction approach.
- [Affects R5][Technical] How many prior transcripts should be loaded at session start? Full history vs. last N sessions vs. summary of older sessions? Back-of-envelope: a 15-min conversation is ~3K-4K words (~4K-5K tokens). Loading 5 sessions is ~20-25K tokens — well within Claude's context but affects first-token latency.
- [Affects R4][Technical] Where should transcripts and the profile doc live — local filesystem on Mac Mini, or in the Obsidian vault?
- [Affects R3][Needs research] What Pipecat configuration is needed for natural interruption handling and voice activity detection?
- [Affects R1][Technical] Cloud STT/TTS providers (Deepgram, ElevenLabs) are fastest to wire up and should be the default for V1. Local Whisper adds resource contention questions with NanoClaw.

## Related

- Prior voice architecture brainstorm: `2026-04-11-voice-channel-brainstorm.md` (this folder)
- Existing Wiki Tutor (Telegram, text-based): NanoClaw `wiki-tutor` group

## Next Steps

-> `/ce:plan` for structured implementation planning
