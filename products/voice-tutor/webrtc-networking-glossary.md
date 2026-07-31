# WebRTC networking glossary

Learned 2026-07-30 while fixing Voice Tutor's remote-session bug (see products/voice-tutor). Plain-language reference for the acronym family behind real-time audio connections.

## NAT — Network Address Translation
What home/office routers do: present one public IP address to the internet and translate traffic for all the devices hiding behind it. It's why a device on a home network (like the Mac Mini) can dial out but can't be directly dialed from outside.

## STUN — Session Traversal Utilities for NAT
A lightweight helper server. A device asks it "what address do I look like from the outside?" and uses the answer to attempt a **direct** peer-to-peer connection. Free, low latency. Works for most networks, fails behind stricter NATs/firewalls.

## TURN — Traversal Using Relays around NAT
The fallback when direct connection fails: both peers connect **outbound** to a relay (outbound always works through NAT), and audio flows through it. Costs bandwidth, adds a little latency, works nearly everywhere.

## ICE — Interactive Connectivity Establishment
The negotiation process that ties it together: both sides gather **candidates** (possible addresses — local, STUN-derived, TURN relay) and test pairs until one connects. Prefers direct; falls back to relay.

## How this maps to Voice Tutor
- Web traffic (page, login, upload) rides Tailscale Funnel. Audio does not — it needs its own peer connection.
- The Mini is NAT-hidden in the apartment; a remote tester's phone is NAT-hidden too. Two hidden endpoints → direct connection often impossible → TURN required.
- Current setup: STUN first (metered + Google), TURN via metered.ca as fallback. Credentials in `.env`.
- TURN is the cost of **self-hosting** voice, not of voice itself — a cloud server with a public IP wouldn't need it. Relay allocations expire (~10 min) and are refreshed on a loop; see backlog re: refresh-failure fragility.
