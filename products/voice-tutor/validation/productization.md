---
title: Voice Wiki Tutor — Product Idea
status: draft
created: 2026-04-13
updated: 2026-04-13
---

# Voice Wiki Tutor — Product Idea

> Captured from Claude.ai ideation session, April 13, 2026. Built a working voice speech-to-speech prototype with vault access today. Brainstormed with it and found it valuable. This document captures the product idea, filter evaluation, and cost/pricing analysis that came out of vetting it.

---

## The Idea

A voice-first iOS app that lets Readwise users talk to their saved knowledge.

**How it works:**

1. User authenticates to Readwise via OAuth
2. A scheduled compiler (NanoClaw-style) pulls their Readwise saves and compiles them into a persistent, interlinked wiki — the Karpathy pattern
3. User downloads the iOS app and has voice conversations with the wiki: ask questions, brainstorm, explore connections across saved content
4. Simple tools available during conversation: write notes back to the wiki, web search to supplement what's saved

**Core bet:**

Readwise solves capture. Nobody has solved absorption. Users save more than they can read, and the saved content becomes dead weight. This product turns that dead weight into a thinking partner — voice-first because that's the only way the interaction actually happens in real life (walks, commutes, moments of curiosity rather than at-desk reading sessions).

---

## Why This Is Different From Earlier Ideas

This is the first product idea that came out of **building, not brainstorming**. A working prototype exists. The excitement is from using the thing, not imagining it. That's a completely different starting position than anything else surfaced in recent ideation sessions.

Every earlier idea in this project was hypothetical — filtered against the vision doc, pressure-tested in conversation, parked or kept on the list. This one has a functioning voice tutor with vault access behind it.

---

## What's Genuinely Good

- **Built it today, used it, liked it.** The strongest possible signal.
- **Coherent product shape.** Every piece is real infrastructure that exists: Readwise API, wiki compiler pattern already running in NanoClaw, Pipecat or equivalent for voice, iOS SDK.
- **Plausible audience.** Readwise users have already paid for a knowledge tool. They save more than they read. They're the exact demographic with acute, lived pain.
- **Genuine differentiation.** Nobody is doing voice-first conversational access to a Readwise-compiled wiki. Readwise Ghostreader is text. Snipd is audio-in, not audio-conversational. The "talk to your saved knowledge" pattern is underserved.
- **Solves cold start.** Existing Readwise users arrive with a corpus — months or years of saves. The wiki compiles from real content on day one. Different from the personal-wiki cold start that killed path-1 ideas.

---

## Filter Evaluation (from product-vision.md)

**1. Does it ride model progress, or fight it?** Yes, cleanly. Better voice, better synthesis, better conversational reasoning all make the product better.

**2. Is there something here that takes time to accumulate?** Plausible yes, with design work required. Candidates for company-level compounding data:
- Patterns of what users actually ask vs. what they saved (what's valuable vs. what's dead weight)
- Cross-user synthesis — taste about which articles in a topic actually matter
- Feedback signal from voice conversations that improves wiki compilation for everyone

Not automatic, but achievable. Real.

**3. Can I sell the outcome, not the tool?** Yes. "I understand my saved content" or "my reading compounds into real understanding" is an outcome. Clean pass.

**4. Is someone paying for this outcome today?** Yes. Readwise $10-16/mo, Snipd $9/mo, Stratechery $15/mo, audiobook subscriptions $15/mo. Knowledge tool subscriptions are established.

**5. Was this impossible before AI, and would it still be useful after the next model release?** Yes to first. Pass on second — next-gen models make it richer, not obsolete. The product's value comes from accumulated context (the compiled wiki) and the voice interaction layer, both of which get better as models improve.

**6. Am I reaching for this because it's the right shape, or because it's familiar?** Interesting question. It's AI-adjacent but **not** a dev tool. Consumer knowledge product. The user isn't a developer; the use case isn't building. Surfaced from building-and-using, not from default-shape reaching. Cleaner than most surfaced ideas.

**7. Do I actually live here?** Yes. Daily. Self-learning + AI/developer tooling + the exact "drowning in saved content" pain articulated explicitly in recent sessions.

**Verdict:** Passes the filter more convincingly than anything else surfaced this week. Also passes Troy's pain-vs-enjoyment test (clear pain), his niche test (Readwise users are specific), and his "build for yourself" test (already done).

---

## What's Hard and Worth Knowing

### The Moat Question (Sharper Version)

If the product is "your Readwise library but voice-queryable," the compounding data is still user-side (each user's library + wiki). What could accumulate at the company level?

- Patterns of questions asked vs. content saved (signal about what's actually valuable)
- Cross-user taste on which sources in a topic are genuinely high-signal
- Voice conversation feedback that improves wiki compilation quality for all users

All real. All require explicit design work to capture — they don't emerge automatically.

### Platform Risk — Readwise Dependency

Building on someone else's platform. Readwise could:
- Build this themselves (probably should, and might)
- Cut off API access
- Change pricing

**Mitigation:** Don't be Readwise-exclusive long term. Start with Readwise because their users are the ideal audience, but design the architecture so other sources could be added later — Pocket, Instapaper, Obsidian vaults, RSS, manual URL saves.

### iOS App Is A Real Undertaking

"Download an iOS app" sounds simple. Reality:
- App Store submission and ongoing review
- Native development or React Native
- Notification infrastructure
- Authentication flow
- Subscription management if charging
- Ongoing maintenance and updates

Going from "works on my Mac" to "shipped in App Store" is 3-6 months of real work, not a weekend. Worth knowing before committing.

---

## Cost Structure (Ballpark)

Voice AI inference is expensive. This is the single most important practical constraint on the business.

### Per-minute costs in a voice conversation

- **Deepgram streaming STT:** ~$0.0043/minute
- **Cartesia streaming TTS:** ~$0.02-0.03/minute depending on voice
- **Claude API:** $0.10-0.30 per 15-minute conversation (variable; compiled wiki as context isn't small)

**Rough total: $0.05-0.10/minute when all three running.**

### Usage scenarios

- 30-minute session: $1.50-3.00 in raw inference costs
- 5 sessions/week of 30 min each: ~$30-60/month in costs per active user

This is **before** iOS infrastructure, Readwise API costs if they charge for heavy use, auth infrastructure, support, and the builder's time.

### What This Tells Us About Pricing

- **$10/month consumer SaaS pricing doesn't work.** Would lose money on any engaged user. Volume-based disaster.
- **$30-50/month is where this product probably needs to be priced** to be sustainable.
- Reference points: Granola $18/mo, Otter $17/mo, Stratechery $15/mo, most voice-AI products cluster $20-50/mo.
- Readwise users already pay $10-16 for Readwise itself. They're a paying-for-knowledge-tools demographic. Additional $30 for "my saved content becomes a thinking partner I can talk to" is a real sell to the right person.

### Pricing Changes Who You're Selling To

- **At $10/month:** curious Readwise user
- **At $30+/month:** serious knowledge worker — researcher, founder, writer, analyst, investor, academic

Smaller audience, higher willingness to pay, different marketing. **Aligned with indie-not-venture goal.** 500 users at $30/month = $180K ARR. That's a real indie business. Don't need 50,000 users at $10.

### Pricing Model Options

1. **Usage caps.** "Up to 2 hours of voice conversation per month" at $20, more at higher tiers. How most usage-expensive AI products handle it. Clean, predictable, lets pricing track cost.

2. **Bring-your-own-key.** Power users provide their own Deepgram/Cartesia/Anthropic keys; you charge a lower software fee. Reduces cost to near-zero. Unusual in consumer but workable for a power-user tool.

3. **Hybrid.** Subscription covers a baseline, overages billed. Less friendly but honest about cost structure.

4. **Self-hosted tier.** Users run the voice pipeline on their own hardware (Mac Mini-style). You charge for the app and the Readwise integration layer. Much cheaper to operate but reduces addressable market significantly.

---

## The Question To Sit With Before Pricing

**Name three specific people you know who'd pay $30-50/month for this without flinching.**

Not "people in general" — three specific humans. If you can name them, the business is real at that price point. If you can't, either the price is wrong or the product is wrong.

Distribution has to go specifically to these audiences — Readwise power users, VCs, researchers, academics, newsletter writers — not to general "productivity" or "AI" audiences who'll balk at the price.

---

## Positioning

The cost structure makes this a **premium tool, not a mass-market app**. That's fine. In fact, for an indie builder it's probably better — serve 500 power users instead of trying to acquire 50,000 casual ones.

Implication: everything about the product (UX, positioning, marketing) has to signal "serious tool" rather than "fun app." Lean into that from day one. Don't hide the price. Don't pretend this is a casual utility.

---

## Next Steps (Not Today)

1. **Use the prototype for a week.** See if the reach-for-it signal holds. Friday test: is it still useful?
2. **Talk to three Readwise power users.** Not to pitch — to ask. Find them on X, in Readwise communities. Ask what they'd pay for this. Troy's ten-paying-customers bar applied at stage zero. Three conversations will teach more than a week of building.
3. **Don't commit to iOS, pricing, or scaling decisions yet.** Those are downstream of whether the prototype keeps earning its place in daily life.

---

## What This Document Is For

A snapshot of the idea, the filter pass, the cost/pricing analysis, and the honest caveats — captured the same day the prototype was built and the excitement is fresh. Reference this later to see whether the idea holds up or whether the excitement was situational. The test isn't whether it passes the filter today; it's whether the prototype still pulls on Friday, and whether three specific people would pay for it.
