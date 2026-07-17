# BYOK Exploration — Voice Tutor Productization

*Captured 2026-07-16 from a Claude.ai session. Status: exploration, no decisions made. Goal as stated: "allow other people to use it" — not revenue, not scale.*

## The core tension

Voice Tutor needs **three** API keys per session:
- Deepgram (speech-to-text)
- Cartesia (text-to-speech)
- Anthropic (the tutor LLM)

The target user (law/med students) has **zero** developer accounts. Full BYOK
means asking them to create three accounts, add payment to each, and paste
three keys before their first conversation. Developers do that; students
bounce.

**So BYOK quietly re-answers "who is this for?"** — it selects for technical
users. That's acceptable as a deliberate interim choice (technical early users
are better bug reporters), but it should be chosen, not backed into.

## Three shapes BYOK can take (cheapest first)

### 1. Self-host with keys in a config file
Essentially what exists today: clone, add `.env`, run.
- Productizing = Docker + a good README
- Cost: days
- Audience: "people who can run Docker," full stop

### 2. Hosted app, keys entered in the browser
You host the URL; users paste keys into a settings UI; keys live in
localStorage/session only (or pass through per-request without server-side
storage). The standard indie BYOK pattern.
- Your per-user cost: ~zero
- Privacy story: "your keys never leave your browser / are never stored"
- Real work: key-entry UI, plumbing keys through session setup, and — the
  actual technical unknown — whether the Pipecat pipeline can accept
  **per-session credentials** rather than one server-wide `.env`.
  **This is the first thing to investigate.**

### 3. Friction-reducers (hybrid shapes)
Ways to soften three-keys-to-one:
- LLM router key (covers Anthropic-slot only; STT/TTS still separate)
- **You cover the cheap parts** (STT/TTS are pennies per session), user brings
  only the Anthropic key → one key instead of three, small cost exposure,
  much gentler onboarding. Probably the most promising middle path.

## The questions that actually decide it

1. Who are the realistic first ten users — technical or not?
2. Can Pipecat take per-session credentials without surgery? (Investigate
   before designing anything.)
3. Does one-key-BYOK + covering pennies beat three-key purity for onboarding?

## Related context

- Hand-picked access (today's Tailscale HTTPS URL + invited users) is the
  zero-build validation step and can precede ANY of the above.
- dev-harness productization is a separate, cheaper track (open-source repo
  cleanup) — see session notes 2026-07-16.
- Validation principle from the case studies (Postiz/Gojiberry/Peekaboo):
  interest before build; someone besides Matt demonstrably wanting it gates
  the hosted-for-strangers work.
