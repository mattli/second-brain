---
title: Voice AI Infrastructure
created: 2026-05-26
updated: 2026-05-26
tags: [webrtc, voice-ai, infrastructure, real-time, networking]
---

# Voice AI Infrastructure

## TLDR

Voice AI only feels natural when latency is invisible. OpenAI's relay-plus-transceiver architecture splits stateless UDP packet forwarding from stateful WebRTC session ownership, solving the tension between Kubernetes-native deployment and WebRTC's one-port-per-session model at global scale.

## Overview

Real-time voice AI has three hard infrastructure requirements: global reach, fast connection setup, and low, stable media round-trip time. WebRTC is the practical foundation because it standardizes the difficult parts — ICE for NAT traversal, DTLS/SRTP for encrypted transport, codec negotiation, RTCP for quality control, and client-side echo cancellation and jitter buffering. The critical property for AI is that audio arrives as a continuous stream, enabling a model to transcribe, reason, and generate speech while the user is still talking — the difference between conversational and push-to-talk.

The architectural challenge is deploying WebRTC inside Kubernetes at scale. The conventional one-port-per-session model requires exposing large public UDP port ranges that are difficult to secure, load-balance, and reconcile with pod autoscaling. Meanwhile, ICE and DTLS are stateful protocols — the process that created a session must keep receiving that session's packets for connectivity checks, DTLS handshakes, and SRTP decryption.

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

## Sources

- [How OpenAI delivers low-latency voice AI at scale](https://openai.com/index/how-openai-delivers-low-latency-voice-ai-at-scale/) — Full architecture walkthrough of the relay + transceiver split, ICE ufrag routing, Global Relay, and Go implementation details
