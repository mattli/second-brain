Daily AI Intelligence Briefing — Instructions

> Version: 1.7 | Last updated: 2026-02-27

## Purpose
Each morning, research and compile a concise AI and tech intelligence briefing. The output should be readable in approximately 2 minutes and saved to `briefings/YYYY-MM-DD.md` using today's actual date.

**Important:** Research and write all sections first, then write the Executive Summary last and place it at the top of the document. The Executive Summary should reflect the full picture after all sections are complete.

**Overlap Prevention:** Only include a story or item if something materially new happened in the last 24 hours — new information, new data, new reaction, or a significant new development. Do not include stories simply because they are still being discussed or are generally important. If a story was covered yesterday and nothing new has happened, skip it.

---

## Research Tasks

### 1. Top AI & Tech News
Search for the latest headlines from:
- **The Verge** (theverge.com)
- **TechCrunch** (techcrunch.com)
- **Hacker News** (news.ycombinator.com — top stories and "Ask HN" threads relevant to AI)

Pick the 3–5 most significant stories published or materially updated in the last 24 hours strictly. Summarize each in 1–2 sentences.

**Section Summary:** End with 1–2 sentences interpreting what today's news collectively signals — are there patterns, a dominant theme, or a surprising absence? Be forward-looking, not just descriptive.

### 2. Model Releases & Announcements
Check for any new model releases, research previews, API updates, or public announcements from:
- **Anthropic** (claude.ai, anthropic.com)
- **OpenAI** (openai.com)
- **Google DeepMind** (deepmind.google, blog.google)
- **Meta AI** (ai.meta.com)

Only include announcements made in the last 24 hours. If nothing new was released, say so briefly and note what that absence might mean.

**Section Summary:** End with 1–2 sentences on what today's releases suggest about where the frontier is moving — or if nothing was released, note what that absence might mean.

### 3. What Builders Are Talking About
Search Hacker News, GitHub Trending, and indie hacker communities (indiehackers.com, reddit.com/r/MachineLearning, reddit.com/r/SideProject) for what developers and product people are actively building, discussing, or excited about.

Focus on:
- Tools or libraries gaining rapid traction
- Interesting projects people are shipping
- Practical techniques or workflows being shared
- Frustrations or problems that keep coming up

List 2–3 items posted or gaining significant traction in the last 24 hours. Include a 1–2 sentence summary of why the community finds it interesting.

**Section Summary:** End with 1–2 sentences on what the builder community's focus today suggests about emerging opportunities or pain points — what problem keeps coming up that doesn't have a great solution yet?

### 4. Funding, Acquisitions & Product Launches
Search for major AI-related business news in the last 24 hours strictly:
- Funding rounds (Series A and above, or notable seed rounds)
- Acquisitions or mergers involving AI companies
- Significant new product or feature launches

Summarize each item in 1–2 sentences. If nothing significant occurred in the last 24 hours, say so briefly.

**Section Summary:** End with 1–2 sentences interpreting where money and product activity is flowing — infrastructure vs applications, incumbents vs startups, any surprising bets being made.

### 5. Notable Discussions & Debates
Find 1–2 interesting conversations started or gaining significant momentum in the last 24 hours — on Hacker News, Reddit (r/MachineLearning, r/artificial), X/Twitter, or elsewhere. These could be debates, critiques, thought experiments, or viral threads.

Summarize the core argument or question being discussed.

**Section Summary:** End with 1–2 sentences on what these debates reveal about where the AI community's anxieties or excitement are concentrated right now.

### 6. Final Check
After completing all sections, do a final search for **AI news today** and **AI funding today** to catch any major stories that may have been missed. If anything significant is found that isn't already covered, add it to the most relevant section.

---

## Output Format

Save the briefing to `briefings/YYYY-MM-DD.md`. Use this structure:

```
# AI Intelligence Briefing — YYYY-MM-DD

## Executive Summary
**Bottom Line:** [The single most important story today]
**Builders:** [One sentence on what the builder community is focused on]
**Money:** [One sentence on where funding/launches are pointing]
**Debate:** [One sentence on the key tension in the community]

---

## Top News
[3–5 stories, 1–2 sentences each]
**Today's Signal:** [1–2 sentence interpretive summary]

## Model Releases & Announcements
[Releases with name, capabilities, significance]
**Today's Signal:** [1–2 sentence interpretive summary]

## What Builders Are Talking About
[2–3 items with why the community cares]
**Today's Signal:** [1–2 sentence interpretive summary]

## Funding & Launches
[Business news items, 1–2 sentences each]
**Today's Signal:** [1–2 sentence interpretive summary]

## Discussions & Debates
[1–2 online conversations summarized]
**Today's Signal:** [1–2 sentence interpretive summary]
```

Keep each section tight. The Executive Summary should be the single most valuable 3-5 sentences in the document — written last, placed first. Section summaries should be interpretive and forward-looking, not just recapping what's above. The full briefing should be skimmable in ~2 minutes.

---

## After Saving

Once the briefing file is written, commit and push it to GitHub:

```bash
cd "/Users/mattli/Library/Mobile Documents/iCloud~md~obsidian/Documents/mattli"
git add ai-intelligence/briefings/YYYY-MM-DD.md
git commit -m "Add briefing for YYYY-MM-DD"
git push
```

Replace `YYYY-MM-DD` with today's actual date.
