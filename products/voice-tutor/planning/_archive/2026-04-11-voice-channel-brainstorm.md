---
title: "Speech-to-Speech Voice Channel — Brainstorm"
type: brainstorm
status: in-progress
date: 2026-04-11
---

# Speech-to-Speech Voice Channel

## Revised recommendation (2026-04-11, late session): use Pipecat

After building out the custom-implementation plan below, discovered [Pipecat](https://github.com/pipecat-ai/pipecat) — an open-source Python framework (10.3k stars, BSD-2-Clause, active development) that already implements the voice channel layer this document was going to build from scratch.

**Pipecat handles as built-in infrastructure:** STT → LLM → TTS pipelines, native interruption, voice activity detection, context aggregation, WebRTC transport, provider swapping (Hume, Inworld, Deepgram, Anthropic, and many others as first-class services), and an RTVI protocol with official JavaScript/React/Swift SDKs for client apps.

### What this changes

- **Voice runs as a separate Python service**, not a channel inside NanoClaw's TypeScript codebase. The Mac Mini runs a Pipecat process alongside NanoClaw; they talk over HTTP/WebSocket.
- **The "write a HumeAdapter and InworldAdapter" work goes away.** Pipecat already has both as configured services. Swapping is a one-line config change.
- **Zero merge-conflict surface with upstream NanoClaw.** No files in `src/` are touched — the voice service lives in its own repo.
- **iOS app connects via Pipecat's JavaScript SDK over RTVI.** No custom WebSocket protocol to design.
- **NanoClaw still owns agent reasoning, personas, and vault access.** Pipecat calls into NanoClaw for the LLM step; all the agent logic stays where it already lives.
- **Effort drops from ~1–2 weeks (NanoClaw channel) to ~3–5 days (wire up Pipecat + integrate).** The iOS weekend stays the same.

### What you give up by using Pipecat

- **Python in the stack.** New runtime to manage on the Mac Mini (uv, dependencies, container).
- **Framework opinions.** Non-standard logic between pipeline stages means writing custom Pipecat processors. Fine for 95% of cases; a cognitive tax for the 5%.
- **Debugging depth.** Bugs in Pipecat's 10k+ lines of code become your problem to triage, even if their fix is cleaner than yours would have been.
- **Upgrade treadmill.** 100+ Pipecat releases; you'll pay attention to their changelog like you do NanoClaw's.
- **Channel symmetry.** Telegram is an in-process NanoClaw channel; voice is a separate service. Functionally fine, architecturally asymmetric.

### What you do NOT give up

- Provider swapping (Pipecat supports it natively)
- Claude as the LLM (first-class Anthropic service)
- Prompt caching and Anthropic SDK optimizations (happen inside the Anthropic service, unchanged)
- Vault integration (NanoClaw handles this; Pipecat calls into NanoClaw)
- Background audio on iOS, Capacitor shell, Tailscale access — all still the plan

### Revised architecture sketch

```
Phone (Capacitor app + Pipecat JS SDK)
   ↓ RTVI over WebRTC (via Tailscale)
Pipecat service on Mac Mini
   ├── STT (Deepgram or equivalent)
   ├── LLM stage → HTTP call to NanoClaw
   │     ↓
   │   NanoClaw picks persona, calls Claude, optionally writes to vault
   │     ↓
   │   Response returned to Pipecat
   └── TTS (Hume, or Inworld/Cartesia)
   ↓ RTVI audio back to phone
```

### Revised build order

1. **Pipecat service running locally** with a stub LLM stage (just echoes text). Proves STT → TTS path works end-to-end.
2. **NanoClaw integration endpoint.** HTTP route on NanoClaw that accepts a transcript + persona ID, returns Claude's streamed response. Tests with curl first.
3. **Wire Pipecat LLM stage to call NanoClaw's endpoint.** Now the full pipeline works with real agents.
4. **Capacitor iOS app using Pipecat's JS SDK.** Background audio, AirPods, persona picker.
5. **Real-world testing.** Same as before — walks, cellular, interruptions.

The original four-step build order below still holds in spirit; just substitute "Pipecat service" for "custom voice channel in NanoClaw."

### Why this isn't in the earlier sections

The decisions and reasoning below were made without knowing Pipecat existed. They're all still valid — the framing, the use cases, the Hume-vs-Inworld cost comparison, the portability principles, the phone surface decision, the network reality. What changes is only the *implementation vehicle* for the voice-channel layer. Treat everything below as the durable decisions; treat this section as the "how we're actually going to build it."

---

## Mission

**Voice provides one capability: conversation with an agent.** Everything else (learning, briefing Q&A, capture, brainstorming, asking questions) is what the agents already do, accessed through a new surface. The voice app is small *because the agents are powerful*. The marginal cost is low because the marginal value is unlocked by infrastructure that already exists.

When tempted to add features, return to this sentence. If a proposed feature is not "make voice conversation with an agent better," it does not belong in the voice app — it belongs in the agents themselves, where Telegram and voice both benefit.

## Framing

**It's Telegram, but voice.** Add a new channel to NanoClaw that lets Matt talk to his existing agents (Second Brain, Wiki Tutor, future personas) using speech, from his phone, anywhere he isn't at his laptop. Same agents, same memory, same vault access — different I/O modality.

Not a new product. Not a Telegram replacement. A new channel alongside the existing Telegram channel.

## Voice and Telegram are complementary, not competing

The worry "am I building a Telegram replacement" was raised and resolved. The honest answer: no, because voice and text have different ceilings.

**Voice wins:** walking, driving, hands occupied, listening to a briefing, capturing a thought without pulling out the phone, back-and-forth conversation where text would feel slow.

**Telegram wins:** at a desk, sending images, async messages, scanning past conversations, anything where reading is faster than listening, anything you want a written record of.

**Both work:** quick questions, capture, persona switching.

The voice app does not need to build "browse past conversations," "view vault files," "manage personas via UI," or any other non-audio feature. Those things live in Telegram, where they already work. The voice app stays focused on the moments voice is genuinely better.

**Signal that scope is creeping:** wanting to add features to the voice app that aren't audio-specific (settings page, conversation history view, file browser). When that happens, stop and decide deliberately whether the scope has changed.

## Use Cases

All five use cases collapse into "voice conversation with an agent." They are not separate modes; they are different topics and different personas using the same surface.

1. **Learning** — wiki tutor persona, exploratory Q&A about topics in the vault
2. **Brainstorming** — Second Brain or another persona, working through an idea out loud
3. **Listening to the briefing** — TTS playback of the daily briefing markdown, then drop into Q&A with Second Brain
4. **Asking questions** — short-form, any persona, just need an answer
5. **Capture into the vault** — at the end of any conversation, "create a document and put it in projects/intelligence about X" — Second Brain writes the file because the vault is mounted and it has context

The capture use case is not a separate mode. It is the agent doing what it already does (write to the vault) at the end of a conversation. Same as in Telegram today.

## Decisions Made

- **Surface:** Phone-based, ambient. Not laptop.
- **Persona selection:** Tap to pick (not voice-activated wake word).
- **Investment level:** Building toward something durable, not a throwaway test.
- **State model:** Voice and Telegram share memory and session state per agent. Two windows into the same conversation, not two parallel ones.
- **Architecture:** New NanoClaw channel alongside Telegram. Agents don't need to know which channel they're being talked to through.
- **Interruption:** Must be native — non-negotiable for walking-around use.
- **Voice provider:** Start on Hume Creator ($14/mo) as a real-world test. Build the channel provider-agnostic so swapping to Inworld later is a config change, not a rewrite.
- **Phone surface:** Capacitor-wrapped web app, sideloaded via Xcode using a paid Apple Developer account. Background audio is the load-bearing requirement that rules out PWA and pure web.
- **Scope:** Voice surface only, not a second AI client. Telegram remains the desk-based client.
- **Implementation vehicle (revised 2026-04-11 late):** Pipecat framework running as a separate Python service on the Mac Mini. Replaces the custom TypeScript voice channel originally planned. See "Revised recommendation" at top.

## Voice Provider Comparison

### Ruled out

**DIY stack (Whisper/Deepgram → Claude → ElevenLabs/Cartesia) as a from-scratch build.** Highest control, lowest cost per minute, but no native interruption handling. Building real-time interruption on a glued-together stack is the hardest part of voice AI and not worth doing yourself when two providers ship it natively.

**Note:** Pipecat effectively is a "DIY stack" assembled for you with interruption solved. The original "ruled out" reasoning applies to building this yourself, not to using Pipecat.

**OpenAI Realtime API** — first to market, locks you to GPT-4o. Cannot use Claude as the reasoning model. Ruled out for that reason alone.

### Live options (still valid under Pipecat)

**Hume EVI 3** — speech-language foundation model with Claude as a first-class LLM option (bring your own Anthropic key, Hume doesn't charge for the LLM portion). Native interruption. Sub-300ms target latency. Available as a TTS service in Pipecat.

**Inworld Realtime API** — newer entrant. Same audio-in/audio-out simplicity as OpenAI Realtime, but model-agnostic — routes to Anthropic, OpenAI, Google, and 200+ models via the Inworld Router. No model lock-in. API is event-compatible with OpenAI Realtime, so switching later is trivial. Lower TTS cost than ElevenLabs. Also available as a TTS service in Pipecat.

### Also considered

**Twilio ConversationRelay** — Claude integration exists but Twilio is built for phone-call flows. Wrong shape for a phone app.

**Duck Talk pattern** — open-source project that wraps any black-box agent with two Gemini Live sessions. Worth knowing as a reference architecture. Pipecat is a more complete version of the same idea.

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

## Architecture for portability (original, pre-Pipecat)

> **Status note:** This section describes the original custom-implementation plan. With Pipecat, most of this work is already done by the framework. Kept for reference because the underlying principles — Claude owns the LLM call, providers are swappable, streaming without buffering — still apply, just implemented differently.

The voice channel should treat the provider as a swappable adapter behind a stable interface, matching how NanoClaw already structures its Telegram channel.

### Layered shape (original)

```
voice channel (src/channels/voice.ts)
  ├── session manager — persona, state, conversation history
  ├── audio I/O — mic in from phone, speaker out to phone
  ├── LLM call — Claude direct, NanoClaw owns this (critical)
  └── voice provider adapter
       ├── HumeAdapter — WebSocket + event mapping
       └── InworldAdapter — WebSocket + event mapping (deferred)
```

### The single most important rule (still applies with Pipecat)

**NanoClaw owns the LLM call. The voice provider only does STT and TTS.**

With Pipecat, this rule is enforced naturally: the LLM is a pipeline stage configured to call NanoClaw's endpoint. Pipecat's "managed LLM" concern goes away because you're using Anthropic directly as a service, not letting a voice provider manage it.

### Latency and quality tradeoffs

**Latency cost of the abstraction:** ~50–150ms per turn from the extra NanoClaw round-trip. Below the perceptual threshold on a local network. As long as Claude's response streams through to TTS without buffering, the streaming behavior is preserved. (Pipecat streams by default.)

**Quality cost:** zero. Voice quality is determined by the voice model, not by who's calling Claude.

**Latency *gains* from owning the LLM call:**
- Anthropic prompt caching shaves hundreds of ms off subsequent turns in long conversations
- Tool calls and vault reads happen in NanoClaw without round-tripping through the voice provider
- Context injection (recent briefings, vault state) happens server-side, invisibly to the voice provider

### The one thing to verify in the smoke test

End-to-end streaming, without any buffering step. The first version of the channel must prove that:

`Claude streams tokens → NanoClaw streams them onward → Pipecat streams audio to ear`

If any step accidentally waits for the full response before passing it on, perceived latency jumps from "natural conversation" to "frustrating pause." This is the failure mode to catch on day one.

### Network reality (home and away)

**Default architecture:** phone → Tailscale → Pipecat service (Mac Mini) → TTS provider → back the same way. Tailscale provides peer-to-peer encrypted access from anywhere, no port forwarding, no internet-exposed endpoints.

**At home:** ~50–150ms total overhead. Imperceptible.

**Away from home (cellular, coffee shop, travel):** add 20–50ms for the Tailscale internet hop. Still imperceptible on 5G in a city, occasionally noticeable on weak LTE rural coverage.

**International travel from a Mac Mini in LA:** worst case ~200–400ms extra per turn. Starts to feel laggy. This is the only scenario where the default architecture struggles.

**Alternative architecture (deferred):** phone talks to TTS provider directly; Pipecat is reachable via Cloudflare Tunnel for LLM callbacks only. Don't build preemptively — solve when international travel becomes a real use case.

**Cellular gotcha:** the issue on the road isn't average latency, it's jitter and brief drops at cell transitions. Pipecat's WebRTC transport handles reconnects; the NanoClaw integration endpoint needs to handle reconnects gracefully too. Expect occasional hiccups walking past buildings or under overpasses.

**Smoke test on the road:** measure end-to-end latency on the normal walking route at the edge of usual cellular coverage. If it feels natural, ship it.

### Provider-specific concerns when swapping (now Pipecat's problem)

With Pipecat, swapping Hume ↔ Inworld ↔ Cartesia is a configuration change, not a code change. The adapter layer described below is built into the framework.

Original notes, preserved for reference:

1. **Voice configuration.** Hume describes voices in plain English; Inworld has a fixed voice catalog. Store voice intent abstractly in NanoClaw config; Pipecat's service configuration handles the translation.
2. **Event names and wire format.** Pipecat normalizes this across providers.
3. **Interruption timing.** Handled by Pipecat's VAD and interruption logic.

## Phone surface

**Decision: Capacitor-wrapped web app, installed via Xcode using a paid Apple Developer account.**

Native iOS shell, ~50 lines of Swift, wraps a WebView running normal web app code. From the user's perspective it's a real app — home screen icon, full-screen, native lifecycle. From the developer's perspective, 95% of the code is web you can iterate on without rebuilding the binary.

**Under Pipecat:** the web app uses Pipecat's JavaScript SDK (via RTVI protocol) to connect to the Pipecat service. Replaces the custom WebSocket protocol that would have been in the original plan.

### Why not the alternatives

- **Pure web app (Safari URL):** opening a URL on the phone is friction Matt explicitly hates. Also can't do background audio.
- **PWA installed to home screen:** looks like an app, but iOS Safari does not grant persistent background audio. Dealbreaker.
- **iOS Shortcut:** native and frictionless, but can't host a persistent voice session.
- **True native SwiftUI:** weeks of Swift work. Also: Pipecat has a Swift SDK, so if you ever wanted to go native later, the integration work is already done.

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

- Capacitor shell + background audio config + AirPods routing + Pipecat JS SDK integration: ~weekend
- Pipecat service setup + NanoClaw integration endpoint: ~3–5 days of focused work (down from ~1–2 weeks for custom build)

## Build order (revised for Pipecat)

Sequence matters. Don't build the iOS app and the voice service in parallel — if something breaks, you won't know which side is at fault.

1. **Pipecat service running locally** with a stub LLM stage (echoes text). Proves STT → TTS path works end-to-end. This replaces "NanoClaw voice channel (foundation)" from the original plan.
2. **NanoClaw integration endpoint.** HTTP route that accepts transcript + persona ID, returns Claude's streamed response. Test with curl.
3. **Wire Pipecat LLM stage to NanoClaw.** Full pipeline works with real agents.
4. **Capacitor iOS app using Pipecat JS SDK.** Background audio, AirPods, persona picker, interruption handling.
5. **Real-world testing.** Walks, cellular edge, AirPods, real interruptions (calls, navigation, alarms).

The mistake to avoid: letting the iOS shell become the gating dependency for proving the voice service works.

## Open Questions

- Does the voice channel need its own session ID, or does it reuse the agent's existing session?
- How does authentication work from the phone to the Pipecat service (and from Pipecat to NanoClaw) over Tailscale?
- Does the briefing playback mode need its own NanoClaw concept, or is it just "send the briefing markdown to TTS and stream it"?
- What's the failure mode when network drops mid-conversation? Reconnect to the same session, or start fresh?
- How does persona selection work in the iOS app? Tap-to-pick from a list at session start, or persistent "active persona" setting?
- How does Pipecat handle Docker deployment on the Mac Mini alongside NanoClaw's existing container setup?
- Does Pipecat's Anthropic service support prompt caching out of the box, or does it need a custom processor?
