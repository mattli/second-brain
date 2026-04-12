---
title: "Speech-to-Speech Voice Channel — Brainstorm"
type: brainstorm
status: in-progress
date: 2026-04-11
---

# Speech-to-Speech Voice Channel

## Framing

**It's Telegram, but voice.** Add a new channel to NanoClaw that lets Matt talk to his existing agents (Second Brain, Wiki Tutor, future personas) using speech, from his phone, anywhere he isn't at his laptop. Same agents, same memory, same vault access — different I/O modality.

Not a new product. A new channel alongside the existing Telegram channel.

## Use Cases

1. **Talk to an agent** — pick a persona, have a real conversation. Walking, driving, anywhere away from the laptop.
2. **Listen to briefings** — TTS playback of the daily briefing markdown, then drop into Q&A with Second Brain about what was just heard.
3. **Capture into the vault** — talk to Second Brain naturally ("add this to the pmtxt backlog under infrastructure"), agent figures out where it goes because the vault is mounted and it has context. Replaces Wispr Flow for vault capture specifically.

All three collapse into "talk to an agent." Capture isn't a separate mode — it's just Second Brain doing what it already does in Telegram, via voice instead of text.

## Decisions Made

- **Surface:** Phone-based, ambient. Not laptop.
- **Persona selection:** Tap to pick (not voice-activated wake word).
- **Investment level:** Building toward something durable, not a throwaway test.
- **State model:** Voice and Telegram share memory and session state per agent. Two windows into the same conversation, not two parallel ones.
- **Architecture:** New NanoClaw channel alongside Telegram. Agents don't need to know which channel they're being talked to through.
- **Interruption:** Must be native — non-negotiable for walking-around use.
- **Voice provider:** Start on Hume Creator ($14/mo) as a real-world test. Build the channel provider-agnostic so swapping to Inworld later is a config change, not a rewrite.
- **Phone surface:** Capacitor-wrapped web app, sideloaded via Xcode using a paid Apple Developer account. Background audio is the load-bearing requirement that rules out PWA and pure web.

## Voice Provider Comparison

### Ruled out

**DIY stack (Whisper/Deepgram → Claude → ElevenLabs/Cartesia).** Highest control, lowest cost per minute, but no native interruption handling. Building real-time interruption on a glued-together stack is the hardest part of voice AI and not worth doing yourself when two providers ship it natively.

**OpenAI Realtime API** — first to market, locks you to GPT-4o. Cannot use Claude as the reasoning model. Ruled out for that reason alone.

### Live options

**Hume EVI 3** — speech-language foundation model with Claude as a first-class LLM option (bring your own Anthropic key, Hume doesn't charge for the LLM portion). Native interruption. Sub-300ms target latency.

**Inworld Realtime API** — newer entrant. Same audio-in/audio-out simplicity as OpenAI Realtime, but model-agnostic — routes to Anthropic, OpenAI, Google, and 200+ models via the Inworld Router. No model lock-in. API is event-compatible with OpenAI Realtime, so switching later is trivial. Lower TTS cost than ElevenLabs.

### Also considered

**Twilio ConversationRelay** — Claude integration exists but Twilio is built for phone-call flows. Wrong shape for a phone app.

**Duck Talk pattern** — open-source project that wraps any black-box agent (including Claude Code) with two Gemini Live sessions for STT and TTS. Worth knowing about as a reference architecture, not a production dependency. Demonstrates that the "wrap any agent in voice" pattern is real and shippable.

### Cost comparison (real numbers)

**Hume EVI 3** — subscription tiered:
- Free: 5 EVI minutes/month (testing only)
- Starter ($3/mo): 40 EVI minutes
- Creator ($14/mo): 200 EVI minutes
- Pro ($70/mo): 1,200 EVI minutes
- Overage: $0.06/minute on Pro and above
- Bring your own Claude API key, Hume does not charge for the LLM portion

**Inworld Realtime** — pay-per-use, no subscription tiers. TTS at ~$10/1M characters; LLM is whatever you route to (Claude API pricing applies separately).

**OpenAI Realtime** (for reference, ruled out): ~$0.15/minute all-in. ~2x more expensive than Hume, locked to GPT-4o.

### What this means for usage

Realistic personal usage: 30–60 min/day on walks plus occasional desk use, ~30 hrs/month at the high end.

- **Hume Creator** ($14/mo for 200 min) → real-world test for 2–4 weeks at low volume
- **Hume Pro** ($70/mo for 1,200 min) + overage on extra 10 hours at $0.06/min = ~$106/month at heavy use
- **Inworld** ~$40–60/month all-in at heavy use including Claude tokens (rough estimate)

**Recommendation:** start on Hume Creator. If you actually use it daily and bump up against the 200-minute cap, *then* decide between Hume Pro and migrating to Inworld based on real usage data, not estimates.

## Architecture for portability

The voice channel should treat the provider as a swappable adapter behind a stable interface, matching how NanoClaw already structures its Telegram channel.

### Layered shape

```
voice channel (src/channels/voice.ts)
  ├── session manager — persona, state, conversation history
  ├── audio I/O — mic in from phone, speaker out to phone
  ├── LLM call — Claude direct, NanoClaw owns this (critical)
  └── voice provider adapter
       ├── HumeAdapter — WebSocket + event mapping
       └── InworldAdapter — WebSocket + event mapping (deferred)
```

### The single most important rule

**NanoClaw owns the LLM call. The voice provider only does STT and TTS.**

Both Hume and Inworld offer "managed LLM" modes where they call Claude internally. Don't use them. Instead:

1. Voice provider transcribes incoming audio → sends transcript to NanoClaw
2. NanoClaw calls Claude directly (same as every other agent path)
3. NanoClaw streams Claude's response back to the voice provider
4. Voice provider TTS streams audio to the user's ear

This keeps agent reasoning where the rest of NanoClaw lives, makes provider swap-out a config change, and unlocks optimizations the managed mode can't do (prompt caching, context injection, vault state).

### Latency and quality tradeoffs

**Latency cost of the abstraction:** ~50–150ms per turn from the extra NanoClaw round-trip. Below the perceptual threshold on a local network. As long as Claude's response streams through to TTS without buffering, the streaming behavior is preserved.

**Quality cost:** zero. Voice quality is determined by the voice model, not by who's calling Claude.

**Latency *gains* from owning the LLM call:**
- Anthropic prompt caching shaves hundreds of ms off subsequent turns in long conversations
- Tool calls and vault reads happen in NanoClaw without round-tripping through the voice provider
- Context injection (recent briefings, vault state) happens server-side, invisibly to the voice provider

### The one thing to verify in the smoke test

End-to-end streaming, without any buffering step. The first version of the channel must prove that:

`Claude streams tokens → NanoClaw streams them onward → Hume streams audio to ear`

If any step accidentally waits for the full response before passing it on, perceived latency jumps from "natural conversation" to "frustrating pause." This is the failure mode to catch on day one.

### Network reality (home and away)

**Default architecture:** phone → Tailscale → NanoClaw → Hume → back the same way. Tailscale provides peer-to-peer encrypted access from anywhere, no port forwarding, no internet-exposed endpoints. NanoClaw is the WebSocket client to Hume; the phone never talks to Hume directly.

**At home:** ~50–150ms total overhead. Imperceptible.

**Away from home (cellular, coffee shop, travel):** add 20–50ms for the Tailscale internet hop. Still imperceptible on 5G in a city, occasionally noticeable on weak LTE rural coverage.

**International travel from a Mac Mini in LA:** worst case ~200–400ms extra per turn. Starts to feel laggy. This is the only scenario where the default architecture struggles.

**Alternative architecture (deferred):** phone talks to Hume directly; NanoClaw is reachable via Cloudflare Tunnel for LLM callbacks only. Don't build preemptively — solve when international travel becomes a real use case.

**Cellular gotcha:** the issue on the road isn't average latency, it's jitter and brief drops at cell transitions. Both Hume and Inworld have reconnection logic; the NanoClaw channel needs to handle reconnects gracefully too. Expect occasional hiccups walking past buildings or under overpasses.

**Smoke test on the road:** measure end-to-end latency on the normal walking route at the edge of usual cellular coverage. If it feels natural, ship it.

### Provider-specific concerns when swapping

The portable parts: WebSocket session lifecycle, audio chunks in/out, interruption signals, conversation history. The non-portable parts:

1. **Voice configuration.** Hume describes voices in plain English; Inworld has a fixed voice catalog. Store voice intent abstractly in NanoClaw config; map to provider-specific values inside the adapter.
2. **Event names and wire format.** Different providers use different event types. Inworld is API-compatible with OpenAI Realtime; Hume is its own thing. The adapter handles translation.
3. **Interruption timing.** Both support interruption, but the exact event timing differs. The channel should react to a generic "user interrupted" signal from the adapter, not a vendor-specific event.

If the LLM call stays in NanoClaw, swapping providers is a few hours of adapter work. If the LLM call lives inside the voice provider, swapping is a rewrite.

## Phone surface

**Decision: Capacitor-wrapped web app, installed via Xcode using a paid Apple Developer account.**

Native iOS shell, ~50 lines of Swift, wraps a WebView running normal web app code. From the user's perspective it's a real app — home screen icon, full-screen, native lifecycle. From the developer's perspective, 95% of the code is web you can iterate on without rebuilding the binary.

### Why not the alternatives

- **Pure web app (Safari URL):** opening a URL on the phone is friction Matt explicitly hates. Also can't do background audio.
- **PWA installed to home screen:** looks like an app, but iOS Safari does not grant persistent background audio. Dealbreaker.
- **iOS Shortcut:** native and frictionless, but can't host a persistent voice session.
- **True native SwiftUI:** weeks of Swift work for benefits Matt doesn't need (audio is going through Hume, not Apple's audio APIs).

### Background audio is the load-bearing requirement

Matt wants to start a conversation, lock the phone, put it in his pocket, and keep talking. iOS gates this behind the `audio` background mode declaration in Info.plist, which only a real installed app can use. Capacitor handles this with a config flag.

Specifics:
- Audio session must be **started** in the foreground, then can continue in the background. Open the app once at the start of the walk, then put the phone away.
- Lock screen "now playing" controls available via MediaSession API.
- Mic indicator (orange dot or Dynamic Island) stays visible — always know when the app is listening.
- AirPods routing works automatically with `AVAudioSessionCategoryPlayAndRecord` + `allowBluetooth` + `defaultToSpeaker`.
- AirPod button presses can be wired to "interrupt assistant" (single tap) and "end session" (double tap) via MediaSession.

### iOS audio interruption handling (must test deliberately)

Phone calls, navigation prompts, "Hey Siri," alarms — all interrupt the audio session. iOS posts an interruption notification; the app must catch it, suspend the conversation cleanly, and resume when the interruption ends. Capacitor handles the low-level part; the app handles "what does it mean to suspend a conversation." Don't assume this works without testing it on an actual walk with real interruptions.

### Deployment

- Apple Developer account ($99/year)
- Sideload via Xcode, no App Store needed
- Provisioning lasts 1 year on a paid account, then re-sign once a year
- No App Store review, no public listing — fully personal

### Effort estimate

- Capacitor shell + background audio config + AirPods routing: ~weekend
- Voice channel work in NanoClaw (provider abstraction, streaming, session management): the bigger lift, ~1–2 weeks of focused work

## Build order

Sequence matters. Don't build the iOS app and the NanoClaw channel in parallel — if something breaks, you won't know which side is at fault.

1. **NanoClaw voice channel** (foundation). Provider-agnostic abstraction, Hume adapter, end-to-end streaming proven. The single test that has to pass: Claude tokens stream all the way to TTS audio without buffering.
2. **Throwaway test client.** Tiny terminal app, or curl + audio file — anything that exercises the channel end-to-end without depending on iOS. Proves the architecture before any app code exists.
3. **Capacitor iOS app.** Now integrating two known-working pieces, not debugging both at once. Background audio, AirPods routing, persona picker, interruption handling.
4. **Real-world testing.** Walks, cellular edge, AirPods, real interruptions (calls, navigation, alarms). The smoke test that determines whether the experience is actually good.

The mistake to avoid: letting the iOS shell become the gating dependency for proving the channel works.

## Open Questions

- Does the voice channel need its own session ID, or does it reuse the agent's existing session?
- How does authentication work from the phone to NanoClaw over Tailscale?
- Does the briefing playback mode need its own NanoClaw concept, or is it just "send the briefing markdown to TTS and stream it"?
- What's the failure mode when network drops mid-conversation? Reconnect to the same session, or start fresh?
- How does persona selection work in the iOS app? Tap-to-pick from a list at session start, or persistent "active persona" setting?
