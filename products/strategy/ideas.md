# Product Ideas

*Last reviewed: April 14, 2026. Active candidates only. Shipped and parked ideas moved to the archive section at the bottom.*

---

## 1. Voice-First Wiki Tutor

**Status:** Prototype built April 13, 2026. Productized version sketched out the same day: a voice-first iOS app that lets Readwise users talk to their saved knowledge. See the full exploration including filter evaluation, cost math, and pricing analysis in [productization](../voice-tutor/productization.md)

**Origin:** Evolution of the April 10 personalized learning idea (Artemis 2 moment). Saturday night Retro.ai detour surfaced the voice-first framing on Sunday morning. Voice is the right input modality for learning because it captures the moment curiosity actually strikes — on a walk, in the car, after reading something — when typing would be too much friction. Prototype built April 13 with vault access; brainstorming with it produced real value, which led to the productized framing.

**What it is:** A voice-first learning tool that writes into a compiled wiki. You talk to it about a topic you want to understand — something you saved but haven't absorbed, a concept that came up in conversation, a question that's been nagging you. The system has a conversation with you, pulls in web sources as needed, and compiles what you're learning into a Karpathy-pattern wiki in your vault. Each session builds on the last because the agent reads the existing wiki before the next conversation.

**Productized framing:** User authenticates to Readwise → scheduled compiler builds a wiki from their saves → iOS app for voice conversations with the compiled knowledge. Targets existing Readwise users, who have acute pain (save more than they read) and established willingness to pay for knowledge tools. Passes the product vision filter cleanly on all seven questions. Cost structure likely forces $30-50/month pricing — premium positioning for serious knowledge workers, not mass-market.

**The two-part bet:**
1. Voice makes the conversation actually happen (removes the friction of typing)
2. The compiled wiki makes the learning compound (each session builds on structured prior knowledge, not just chat logs)

**Next steps (not immediate):** Use the prototype for a week — see if the reach-for-it signal holds. Talk to three Readwise power users, not to pitch but to ask what they'd pay. Don't commit to iOS, pricing, or scaling decisions yet.

---

## 2. Book Reading Companion

**Status:** Strong personal desire. Two architectural paths under consideration — pre-ingested wiki (heavy) and wearable snapshot (light). Light version surfaced April 14 and is likely the better v0.

**Origin:** Reading Infinite Jest, wanting contextual help without being pulled out of the experience (April 2026). Currently taking photos of pages and feeding them into ChatGPT — inefficient, but evidence the underlying workflow is real.

**Path A — Pre-ingested wiki (heavier):** An AI companion that has already "read" the book. Ingest the full text (ePub or plain text), run the Karpathy wiki pattern to compile character pages, chapter summaries, thematic threads, and key passages into a persistent wiki. Query against that wiki as you read. Knows exact passages, character histories, thematic threads. Spoiler protection has to be explicitly designed (system needs to know where you are). Stalled on April 9 on the Infinite Jest PDF because it had no page numbers, breaking the spoiler-boundary design.

**Path B — Wearable snapshot (lighter, surfaced April 14):** No pre-ingested book. User is reading a physical book wearing Meta Ray-Ban or similar smart glasses. Glasses camera captures the current page on demand (tap-to-capture, or wake phrase). Multimodal LLM reads what's on the page plus the last N pages the camera has seen in the session. User asks questions via voice — vocabulary, plot, characters, dense passages — and gets answers through the glasses' speakers or paired AirPods.

- Works on any book, any page, day one. No library, no ingestion, no "tell the system what you're reading."
- Spoiler protection falls out of the architecture for free — the system literally hasn't seen pages past the current one.
- Genuinely glasses-native: the camera is on your face without interrupting reading. A phone version would exist but lose the core insight (you'd be back to the ChatGPT photo workflow).
- Optional: user can name the book so the LLM can pull on its training data for deeper context.

**Platform constraint on Path B:** Meta Wearables Device Access Toolkit is in developer preview as of December 2025. SDK supports camera access from iPhone/Android app via Bluetooth, plus audio via standard headset profiles. No "Hey Meta" integration. General-availability App Store publishing is gated on Meta opening it up, targeted "later in 2026" with no committed date. Can build and self-test now; cannot ship to strangers until Meta opens the gate.

**Personal validation:** Matt would pay for this for Infinite Jest specifically. Currently doing the ChatGPT photo workaround, which is the clearest possible signal that the pain is real and the current tooling is inadequate.

**Open questions:**
- Path B suggested v0 is phone-only (hold phone camera up to page) to validate the core loop cheaply. If it works on phone, it works on glasses. If it doesn't work on phone, glasses won't save it.
- What's "session context" practically — last 10 pages? Last chapter? Every page captured this session?
- How does the system know you're reading vs. walking around (relevant for ambient-capture designs)?
- Is this a standalone app, a Readwise/Kindle feature, or a NanoClaw skill?
- DRM is a constraint for Path A only. Path B is DRM-agnostic because it's reading what the camera sees, not what a file contains.

**Relationship to idea #1:** Path A shares architecture with the voice wiki tutor (Karpathy wiki, conversational query, vault-based). Path B is architecturally lighter and independent — just multimodal capture plus session-scoped context. The wiki tutor is for "things I want to learn about." The reading companion is for "the specific book in front of me right now."

---

## 3. Offline Local AI with GPS Context

**Status:** Half-baked. Worth revisiting if on-device model quality improves significantly.

**Origin:** March 2026.

**What it is:** An offline-first AI on your phone that uses GPS to give you context about your surroundings — no internet required. Two modes: urban (restaurants, retail, things to do nearby) and outdoor (trails, water sources, waterfalls, points of interest). The key differentiator is that it works without connectivity — useful exactly when you don't have signal.

**Why interesting:** Every existing "what's around me" app requires internet. The outdoor use case is underserved — hikers and trail runners have no good AI companion that works off-grid. Sits in the backpacking/outdoors domain, which is a real area of personal interest.

**Open questions:**
- What model runs on-device at acceptable quality?
- How does the local database of POIs stay fresh without connectivity?
- Is the GPS/POI problem already solved by Apple Maps offline + Siri, or is there a real gap?

---

## 4. Left vs. Right Wing Debate Chatbots

**Status:** Held lightly. Gimmicky framing, but the underlying civic-discourse problem is real.

**Origin:** Political discourse gap, March 2026.

**What it is:** Paired chatbots that argue opposing political perspectives — one left-leaning, one right-leaning. Users can watch them debate a topic, jump in to challenge either side, or use them to stress-test their own views. Could be a web app, a social media format, or an interactive tool for civic education.

**Why interesting:** Political discourse online is tribal and low-quality. Most people never engage seriously with the strongest version of the opposing argument. Two well-constructed bots that steelman each side could be genuinely useful for understanding policy trade-offs.

**Open questions:**
- How do you keep the bots from being bland centrists or caricatures?
- What's the moderation story — topics like abortion, immigration, and gun control are exactly where this is most valuable but also most dangerous for brand risk.
- Is this a standalone product, a content format (YouTube/TikTok clips of bot debates), or an educational tool?
- Revenue model unclear — ad-supported content, paid "debate simulator" tool, or licensed to schools/media orgs.

**Risks:** AI safety policies at major providers actively resist taking political stances — you'd need to carefully prompt-engineer or fine-tune to get substantive arguments rather than hedged non-answers. Public backlash risk if either bot says something inflammatory. The "both sides" framing itself is politically charged.

---

## Archive

Ideas that are shipped, parked, or superseded. Kept here for historical context — do not actively track.

### Shipped

**CLAUDE.md Transparency Dashboard** (originally idea #3, March 2026) — shipped as `dotmd`. Maps every CLAUDE.md file across machines and projects into one editable interface.

### Parked

**Plain-Text PM Tool (pmtxt)** (originally idea #8, March 2026) — parked April 7, 2026. Felt like shipping a personal setup rather than a product; chat wasn't convincing as the interface for producing an outcome. The instinct underneath it (structured knowledge accumulation for PMs) resurfaced as Retro.ai on April 11 and was also parked when the same wall appeared. The underlying pattern — KB-as-substrate rather than KB-as-outcome — was the core issue in both cases.

**Personalized Learning / Wiki-Compiling Autopilot** (April 10, 2026) — superseded by idea #1 (Voice-First Wiki Tutor), which gave the same underlying bet a concrete activation layer (voice input) and a clearer relationship to the wiki-as-graveyard problem.
