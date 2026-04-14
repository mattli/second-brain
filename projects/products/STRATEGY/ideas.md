# Product Ideas

*Last reviewed: April 13, 2026. Active candidates only. Shipped and parked ideas moved to the archive section at the bottom.*

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

**Status:** Strong personal desire. Worth building for personal use first as a dog-food test of the Karpathy wiki pattern.

**Origin:** Reading Infinite Jest, wanting contextual help without being pulled out of the experience (April 2026).

**What it is:** An AI companion that has already "read" the book — not a summary app, but a deep reference. Ask it what's happening on page 277, who a character is, what happened three chapters ago that connects to what you just read, what a concept or reference means. It answers from full knowledge of the text, not a summary.

**Why interesting:** Book summaries exist everywhere. This is different — it's a reading companion for people who are *in the middle of the book* and want context without spoilers, without Googling, without leaving the experience. The value is depth and specificity: it knows the exact passage, the exact character's history, the exact thematic thread.

**How it works:** Ingest the full book text (ePub or plain text), run the Karpathy wiki pattern — compile character pages, chapter summaries, thematic threads, key passages into a persistent wiki. Query against that wiki as you read. The wiki is built once, stays current, and compounds as you ask questions (good answers get filed back in).

**Personal validation:** Matt would pay for this for Infinite Jest specifically. That's a strong signal — it's not a hypothetical user, it's a real present need.

**Open questions:**
- DRM is the hard constraint — Audible and Spotify audiobooks are locked. Works cleanly for ePubs (DRM-free or public domain).
- How do you handle spoilers — does the companion know where you are in the book and limit answers accordingly?
- Is this a standalone app, a Readwise feature, or a NanoClaw skill?

**Relationship to idea #1:** Same underlying architecture (Karpathy wiki, conversational query, vault-based). The wiki tutor is built for "things I want to learn about." The reading companion is built for "one specific book I'm reading." If the wiki tutor works for personal use, the reading companion is a natural extension with a tighter scope.

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
