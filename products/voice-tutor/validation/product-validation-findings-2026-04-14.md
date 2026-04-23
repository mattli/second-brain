# Reddit Validation Findings — 2026-04-14

**Hypothesis:** Readwise power users feel a "drowning in saved content" pain — they save lots of articles/highlights, but can't absorb, recall, or get value from what they save.

## Coverage

- Queries generated: 8
  - drowning in saved articles
  - saved articles never read
  - highlight backlog
  - kindle highlights gathering dust
  - read later pile up
  - how to actually use readwise highlights
  - Ghostreader limitations
  - Snipd vs Readwise
- Target subreddits searched: r/Readwise, r/ObsidianMD, r/productivity, r/selfimprovement
- Adjacent subreddits tried: none (skipped — corpus already strongly aligned with hypothesis)
- Candidates retrieved: 156 unique → passed classifier (≥2): 9 (3 at score 3, 6 at score 2)

## Pain Evidence

### Score 3 — r/productivity — u/Frosty_Soft6726

> I was drowning in saved things and now I'm treading water. I have recurring tasks to go through some of my saved things. I usually start with a high frequency and a modest target for processing...

**Context:** post "Anyone else drowning in saved articles you never read?" — 68 upvotes, 30 comments. Hit by queries: "drowning in saved articles", "saved articles never read", "read later pile up". Mentions ChatGPT, Instapaper, Pocket as workarounds.
**Reasoning:** Bullseye. Title is the hypothesis; commenter literally uses the "drowning" metaphor and describes the workflow they've built to cope. This is the canonical post for this validation.
[View on Reddit](https://reddit.com/r/productivity/comments/1k1ifry/anyone_else_drowning_in_saved_articles_you_never/)

### Score 3 — r/ObsidianMD — u/Accomplished-Tap916

> This is exactly the shift I needed to hear. I've been drowning in my own notes for years, treating them like a library I have to meticulously organize instead of a partner I can actually talk to.

**Context:** post "Spent years trying to build a second brain with Obsidian, Notion, and Readwise. Here's what actually worked." — 25 comments. Mentions Claude, Obsidian, Readwise.
**Reasoning:** Names all three of the doc's tools (Obsidian + Readwise + Claude as workaround). The "library vs. partner I can talk to" framing is essentially the voice-tutor pitch in user words.
[View on Reddit](https://reddit.com/r/ObsidianMD/comments/1rqua4d/spent_years_trying_to_build_a_second_brain_with/)

### Score 3 — r/productivity — u/NoGreen8512

> Hey there - I totally get the struggle with screenshots and endless links piling up, especially with ADHD. It's a common pain point.

**Context:** post "ideas for making a second brain" — 8 upvotes, 21 comments.
**Reasoning:** Pain confirmed across-the-board phrasing ("common pain point") with the ADHD angle — relevant to the power-user persona who saves more than they can process.
[View on Reddit](https://reddit.com/r/productivity/comments/1rr8ujl/ideas_for_making_a_second_brain/)

### Score 2 — r/ObsidianMD — u/FinancialAppearance

> I despair seeing people on the /r/zettelkasten sub posting screenshots of their elaborate note systems...

**Context:** post "Is the concept of Personal Knowledge Management flawed?" — 534 upvotes, 108 comments. The most-discussed PKM-skepticism post in the corpus.
**Reasoning:** Adjacent — critiques the PKM mindset of saving-without-absorbing. Validates that the pain is widely felt enough to spawn 500+ upvote dunks on it.
[View on Reddit](https://reddit.com/r/ObsidianMD/comments/zkefis/is_the_concept_of_personal_knowledge_management/)

### Score 2 — r/readwise — u/0rAX0

> I realized that digital hoarding is blocking me from using anything I save because it's quite a lot, so I'm basically deleting stuff now. I just deleted my 8...

**Context:** post "Finally made my 500+ Readwise articles actually useful instead of just existing" — 92 upvotes, 21 comments. Mentions Claude, Reader, Readwise.
**Reasoning:** A Readwise power user (500+ articles) describing the pain in their own words — and the workaround is *deletion*, which suggests existing solutions aren't working. Strong power-user candidate (see below).
[View on Reddit](https://reddit.com/r/readwise/comments/1lmeszm/finally_made_my_500_readwise_articles_actually/)

### Score 2 — r/readwise — u/red-guard

> Retaining information requires slowly digesting that information so it is retained in long term memory. These apps take away from what is needed for that to...

**Context:** post "Here is how I save the knowledge and highlights from Podcasts in Readwise Reader." — 38 upvotes, 21 comments. Mentions Reader, Readwise, Snipd.
**Reasoning:** Skeptic in r/readwise itself — mentions all three named tools — challenges whether the tooling actually solves retention. Useful counter-signal.
[View on Reddit](https://reddit.com/r/readwise/comments/1b5fbet/here_is_how_i_save_the_knowledge_and_highlights/)

### Score 2 — r/productivity — u/Lazhmy

> I have always wanted to start doing active recall and spaced repetition, but one of the things that hold me ba...

**Context:** post "How to: Learn way faster" — 749 upvotes, 64 comments.
**Reasoning:** Most-upvoted post in the corpus. Confirms the *desire* to actually use what you've consumed exists at scale, even if this thread isn't Readwise-specific.
[View on Reddit](https://reddit.com/r/productivity/comments/l9d13h/how_to_learn_way_faster/)

### Score 2 — r/productivity — title only

> My brain is fried. How do you manage knowledge without drowning in it?

**Context:** post — 6 upvotes, 3 comments. Title-only signal.
**Reasoning:** Title is the pain in 13 words. Low engagement weakens it but the framing is exact.
[View on Reddit](https://reddit.com/r/productivity/comments/1rduzmm/my_brain_is_fried_how_do_you_manage_knowledge/)

### Score 2 — r/productivity — title only

> Drowning in information at work?

**Context:** post — 6 upvotes, 1 comment. Title-only signal.
**Reasoning:** Adjacent (work-info, not personal saves) but uses the metaphor.
[View on Reddit](https://reddit.com/r/productivity/comments/mtfw3i/drowning_in_information_at_work/)

## Existing Solutions Mentioned

Counts across all 156 candidate posts (not just those that passed the classifier):

- **Readwise** (44 mentions) — dominant in the corpus, both as the tool people use and the tool people compare alternatives against
- **Obsidian** (43 mentions) — co-mentioned constantly with Readwise; the standard "Readwise → Obsidian" pipeline
- **Reader** (16) — Readwise's own read-later product, frequently mentioned alongside Readwise
- **Pocket** (10) — read-later legacy, often cited as "I was drowning in Pocket"
- **Omnivore** (8) — open-source read-later; recurring "Readwise vs. Omnivore" thread pattern
- **Ghostreader** (7) — Readwise's own AI feature; appears in skepticism + comparison threads. Worth a deeper read for competitive signal.
- **Instapaper** (7) — same niche as Pocket
- **Claude** (7) — used as a workaround ("I just paste my notes into Claude and ask it to...")
- **Kindle** (5) — for highlight syncing context
- **ChatGPT** (5) — same workaround pattern as Claude
- **Snipd** (3) — podcast highlights; notably less mentioned than the doc anticipated

## Power User Candidates

### u/0rAX0 — r/readwise

> I realized that digital hoarding is blocking me from using anything I save because it's quite a lot, so I'm basically deleting stuff now.

500+ Readwise articles, actively in the pain. Coping strategy is *deletion* (not tooling) — suggests existing solutions aren't doing the job. Best lead.
[Profile activity](https://reddit.com/user/0rAX0)

### u/104488361 — r/productivity

Self-described digital hoarder with thousands of saved articles and videos; substantive comment in the canonical "drowning in saved articles" thread.
[Profile activity](https://reddit.com/user/104488361)

## Borderline Rejections (sanity check)

These scored 1 but were close to 2 — worth eyeballing in case the classifier was too strict:

- [What would a Readwise replacement need to get right for you to actually switch](https://reddit.com/r/readwise/comments/1r0xznv/) — could be a goldmine of unmet-need quotes
- [Readwise vs Omnivore](https://reddit.com/r/ObsidianMD/comments/174kg1p/) — comparison thread
- [Readwise vs Omnivore?](https://reddit.com/r/ObsidianMD/comments/1f2gq8k/) — second comparison thread
- [Love the vision, but AI just isn't there yet](https://reddit.com/r/readwise/comments/1qk8fh3/) — direct skepticism on Readwise's AI direction; almost certainly relevant to voice-tutor positioning
- [EPUB & PDF Reader & Manager Obsidian Plugin Discussion - BookFusion](https://reddit.com/r/ObsidianMD/comments/10ygytc/) — likely off-topic

## V0 Run Notes

- 8 queries × 4 subs at limit 10 = 156 unique posts retrieved (good corpus size)
- Classifier kept 9 of 156 (6%) — strict but defensible. The 3 score-3 posts are unambiguously on-hypothesis.
- Ghostreader appearing 7× warrants pulling those threads manually before phase 2 conversations — they're the closest-to-product competitive signal.
- Snipd at 3 mentions suggests it's less central to the Readwise power-user mindshare than the doc assumed.
- Title-only posts (no comments) consistently scored 0–1 — confirms the design call to enrich with comments was correct.
- Cost: ~1 ScrapeCreators credit per search call + ~10 per enriched post ≈ 1.7k credits for this run (out of 25k topped up).
