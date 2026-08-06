---
created_at: 2026-05-26
last_updated: 2026-08-06
---

# Voice AI Infrastructure

> TLDR: Voice AI spans two layers: transport infrastructure that makes latency invisible, and model architecture that makes conversation natural. OpenAI's relay-plus-transceiver split solves WebRTC-in-Kubernetes at scale, while GPT-Live's full-duplex architecture and delegation pattern decouple continuous interaction from deep reasoning — letting the voice model listen, speak, and dispatch work to frontier models simultaneously.

## Recent Updates

- **2026-08-06:** Added GPT-Live full-duplex architecture and delegation model to [GPT-Live: Full-Duplex Voice](#gpt-live-full-duplex-voice); folded Overview framing into TLDR and [WebRTC Foundations](#webrtc-foundations); added [Voice Architecture Evolution](#voice-architecture-evolution)

## WebRTC Foundations

Real-time voice AI has three hard infrastructure requirements: global reach, fast connection setup, and low, stable media round-trip time. WebRTC is the practical foundation because it standardizes ICE for NAT traversal, DTLS/SRTP for encrypted transport, codec negotiation, RTCP for quality control, and client-side echo cancellation and jitter buffering. The critical property for AI is that audio arrives as a continuous stream, enabling a model to transcribe, reason, and generate speech while the user is still talking.

The architectural challenge is deploying WebRTC inside Kubernetes at scale. The conventional one-port-per-session model requires exposing large public UDP port ranges that are difficult to secure, load-balance, and reconcile with pod autoscaling. ICE and DTLS are stateful protocols — the process that created a session must keep receiving that session's packets for connectivity checks, DTLS handshakes, and SRTP decryption.

## Media Architecture Choices

Three main options exist for terminating WebRTC connections:

**SFU (Selective Forwarding Unit)** — a media server that terminates a separate WebRTC connection per participant and selectively forwards streams. Good for multiparty scenarios (group calls, classrooms) where signaling, media routing, recording, and observability live in one system. Discord uses this approach for concurrent voice.

**Transceiver** — a WebRTC edge service terminates the client connection and converts media into simpler internal protocols for inference, transcription, and speech generation. Backend services scale like ordinary services instead of acting as WebRTC peers. Best for 1:1 workloads (one user to one model) where latency matters on every turn.

**TURN relay** — an edge relay terminates client allocations and forwards traffic. Clients only need to reach the TURN address, but allocations add setup round-trips and are difficult to recover across servers.

OpenAI chose the transceiver model for its predominantly 1:1, latency-sensitive sessions.

## Relay + Transceiver Architecture

The shipped architecture splits packet routing from protocol termination into two layers:

**Relay** — a lightweight, stateless UDP forwarding layer with a small public footprint. It parses just enough of each STUN packet header to read the ICE username fragment (ufrag), decode a routing hint, and forward to the correct transceiver. It does not decrypt media, run ICE state machines, or participate in codec negotiation.

**Transceiver** — the stateful WebRTC endpoint that owns all protocol state: ICE, DTLS, SRTP, and session lifecycle. It listens on a shared UDP socket (one OS endpoint, not one socket per session). From the client's perspective, the WebRTC session behaves exactly as standard.

The key insight is routing on the ICE ufrag — a protocol-native field already exchanged during session setup. OpenAI generates the server-side ufrag to contain routing metadata (destination cluster and owning transceiver), giving deterministic first-packet routing without any hot-path external lookup. If a relay restarts and loses its in-memory session map, the next STUN packet rebuilds the route from the ufrag. A Redis cache provides faster recovery before the next STUN packet arrives.

## Global Relay and Geo-Steering

With the public UDP surface reduced to a small number of stable addresses and ports, the relay pattern deploys globally. Geographic ingress shortens the first client-to-infrastructure hop — lower latency, less jitter, fewer loss bursts before traffic reaches the backbone.

Cloudflare geo and proximity steering routes the initial signaling request (HTTP/WebSocket) to a nearby transceiver cluster. The SDP answer provides the Global Relay address, while the ufrag encodes enough information for relay to forward media to the designated cluster and transceiver.

## Implementation Details

The relay is written in Go, kept deliberately narrow:

- **`SO_REUSEPORT`** — multiple relay workers on the same machine bind the same UDP port; the kernel distributes incoming packets across workers, avoiding a single read-loop bottleneck.
- **`runtime.LockOSThread`** — pins each UDP-reading goroutine to a specific OS thread, improving cache locality and reducing context switching when combined with `SO_REUSEPORT`.
- **Pre-allocated buffers and minimal copying** — keeps parsing overhead and GC pressure low.
- **No kernel bypass** — a userspace Go process reading from a standard socket was sufficient for global real-time media traffic, avoiding the operational complexity of kernel-bypass frameworks.

The relay maintains only ephemeral state: a small, short-timeout, in-memory map of client address to transceiver destination for forwarding and observability.

## Key Design Principles

- **Preserve protocol semantics at the edge** — clients speak standard WebRTC; browser and mobile interoperability stays intact.
- **Concentrate hard state in one place** — transceiver owns all WebRTC session state; relay only forwards.
- **Route on information already present in setup** — the ICE ufrag provides a first-packet routing hook with no added dependency.
- **Optimize for the common case first** — careful use of `SO_REUSEPORT`, thread pinning, and low-allocation parsing before reaching for kernel bypass.
- **Add complexity in a thin routing layer** — not in every backend service and not in custom client behavior.

## Voice Architecture Evolution

OpenAI's voice systems have progressed through three architectural generations, each removing a layer of interaction friction:

**Cascaded voice** — the original ChatGPT Voice chained three separate models: speech-to-text, a language model (GPT-5.5), and text-to-speech. This enabled talking to frontier models for the first time but at the cost of information loss across model boundaries and high latency.

**Turn-based voice** — Advanced Voice Mode (GPT-4o era) processed and generated audio within a single model, reducing latency. But it still operated through discrete turns: the model waited for silence before responding, and silence-based turn detection caused false interruptions from pauses or background noise.

**Full-duplex voice (GPT-Live)** — the current generation, which processes input continuously while generating output. See [GPT-Live: Full-Duplex Voice](#gpt-live-full-duplex-voice) below.

## GPT-Live: Full-Duplex Voice

GPT-Live (launched July 2026) introduces two architectural changes that move voice AI from turn-based to continuous interaction.

### Continuous Interaction via Full-Duplex

Instead of processing a sequence of separate messages, GPT-Live continuously processes input while generating output. The model makes interaction decisions many times per second — whether to speak, continue listening, pause, interrupt, or invoke a tool. This enables natural back-and-forth: the model can acknowledge with phrases like "mhmm" or "got it," wait when the user pauses to think, and handle interruptions gracefully rather than relying on silence-based turn detection.

### Delegation for Deep Work

GPT-Live decouples continuous interaction from deep reasoning. When a question requires web search, extended reasoning, or agentic capabilities, GPT-Live delegates to a frontier model (GPT-5.5 at launch) running in the background. The voice model keeps the conversation going while the delegated task completes, then brings the result back into the conversation. This separation means GPT-Live can continuously benefit from the latest [frontier models](../models-safety/frontier-models.md) without retraining the voice model itself.

### Two Model Tiers

GPT-Live ships in two variants: **GPT-Live-1** (for Plus, Go, and Pro users) and **GPT-Live-1 mini** (for Free users). In evaluations, GPT-Live-1 is strongly preferred over Advanced Voice Mode across overall preference, turn-taking, interruptions, conversational flow, and naturalness in matched 5–10 minute conversations. It also substantially outperforms on GPQA (expert-level scientific reasoning) and BrowseComp (agentic web search).

### Voice Safety Architecture

GPT-Live adds real-time safeguards that can act while the model is speaking — steering toward safer responses, surfacing safety messaging, or ending voice conversations in higher-risk cases. Audio output includes SynthID watermarking for provenance verification, with both a public verification tool and API access for developers [[source]](https://openai.com/index/introducing-gpt-live/). Age-appropriate behavior is trained directly into the model for teen users, with parental controls and linked-parent notifications for high-risk situations.

## Sources

- [Introducing GPT-Live](https://openai.com/index/introducing-gpt-live/) — GPT-Live full-duplex architecture, delegation to frontier models, voice architecture evolution (cascaded → turn-based → full-duplex), evaluation results, SynthID audio watermarking, voice safety design
- [How OpenAI delivers low-latency voice AI at scale](https://openai.com/index/how-openai-delivers-low-latency-voice-ai-at-scale/) — Full architecture walkthrough of the relay + transceiver split, ICE ufrag routing, Global Relay, and Go implementation details
- [Andon FM](https://andon.fm) — AI agents running autonomous radio stations 24/7
- "Real-time semantic search for Conversational AI" — Moss (article, May 2026) — real-time semantic search (<10ms) for voice AI and conversational systems
- "Moss adoption is growing 200% MoM" — Moss (tweet, May 2026) — YC F25; 50+ companies, 130+ projects, voice AI and multimodal agent teams
