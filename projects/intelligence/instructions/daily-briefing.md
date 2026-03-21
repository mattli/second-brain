Daily AI Intelligence Briefing — Instructions

> Version: 2.8 | Last updated: 2026-03-20

## Purpose
Each morning, research and compile a concise AI and tech intelligence briefing. The output should be readable in approximately 2 minutes and saved to `briefings/YYYY-MM-DD.md` using today's actual date.

**Important:** Research and write all sections first, then write the Executive Summary last and place it at the top of the document. The Executive Summary should synthesize across sections — it is not a compressed version of Top News.

**Overlap Prevention:** Only include a story or item if something materially new happened in the last 24 hours — new information, new data, new reaction, or a significant new development. Do not include stories simply because they are still being discussed or are generally important. If a story was covered yesterday and nothing new has happened, skip it.

**Cross-Section Deduplication:** Each story, tool, or item should appear in at most one section. If an item could fit in multiple sections, place it in the most relevant one and do not repeat it elsewhere.

**Empty Sections:** If a section has no genuinely significant content in the last 24 hours, say so briefly and move on. Never pad sections with low-signal content or embellish the significance of sources to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry. Common acronyms like LLM, API, and AI do not need to be spelled out. Less common acronyms should be spelled out on first use. When in doubt about whether an acronym is widely known, spell it out — it is better to over-explain than to leave the reader confused.

---

## Before You Start

Read the last 5 briefings from `briefings/` (by date, most recent first). Note which stories, funding rounds, model releases, and tools were already covered. Do not include any of these in today's briefing unless there is a genuinely new development — new information, new data, or a significant update beyond continued discussion.

---

## Research Tasks

### 1. Top AI & Tech News
Search for the latest headlines from:
- **TechCrunch** (techcrunch.com)
- **Reuters** (reuters.com)
- **Hacker News** (news.ycombinator.com — top stories and "Ask HN" threads relevant to AI)
- **X/Twitter** (for breaking news and real-time signals)

Pick the 3–5 most significant stories published or materially updated in the last 24 hours strictly. Summarize each in 1–2 sentences.

**Section Summary:** End with 1–2 sentences interpreting what today's news collectively signals — are there patterns, a dominant theme, or a surprising absence? Be forward-looking, not just descriptive.

### 2. Notable Model Releases
Only include a model release if it clears at least one of these bars:
- A flagship model from a major lab (Anthropic, OpenAI, Google DeepMind, Meta)
- A release that meaningfully shifts the cost/capability tradeoff for builders
- A release generating significant real-world builder discussion today

If nothing clears this bar, skip the section entirely — do not list minor model updates, fine-tunes, or incremental releases just to fill space.

**Section Summary:** End with 1–2 sentences on what today's notable release signals about where the frontier is moving. Omit this if the section is skipped.

### 3. New Tools & Products
Search for newly launched or newly trending tools, apps, or products in the AI/tech space:
- **Product Hunt** (producthunt.com — top launches)
- **Hacker News** (Show HN posts)
- **GitHub Trending** (github.com/trending)

Focus on tools builders are actually trying or recommending — not press releases. List 2–3 items max, 1 sentence each describing what it does and why it's getting attention. If nothing notable launched in the last 24 hours, skip this section.

### 4. What Builders Are Talking About
Search the following for what developers and product people are actively building, discussing, or excited about:
- **Hacker News** (news.ycombinator.com)
- **GitHub Trending** (github.com/trending)
- **r/vibecoding**, **r/ChatGPTCoding**, **r/claudecode** (reddit.com)

Focus on:
- Tools or libraries gaining rapid traction
- Interesting projects people are shipping
- Practical techniques or workflows being shared
- Frustrations or problems that keep coming up

List 2–3 items posted or gaining significant traction in the last 24 hours. Include a 1–2 sentence summary of why the community finds it interesting.

**Section Summary:** End with 1–2 sentences on what the builder community's focus today suggests about emerging opportunities or pain points — what problem keeps coming up that doesn't have a great solution yet?

### 5. Funding, Acquisitions & Product Launches
Search for major AI-related business news in the last 24 hours strictly:
- Funding rounds (Series A and above, or notable seed rounds)
- Acquisitions or mergers involving AI companies
- Significant new product or feature launches

Summarize each item in 1–2 sentences. If nothing significant occurred in the last 24 hours, say so briefly.

**Section Summary:** End with 1–2 sentences interpreting where money and product activity is flowing — infrastructure vs applications, incumbents vs startups, any surprising bets being made.

### 6. Notable Discussions & Debates
Find 1–2 interesting conversations started or gaining significant momentum in the last 24 hours — on Hacker News or X/Twitter. These could be debates, critiques, thought experiments, or viral threads.

Summarize the core argument or question being discussed. Do not characterize how widely shared or discussed something is. Only summarize the content and argument — let the reader judge significance.

**Section Summary:** End with 1–2 sentences on what these debates reveal about where the AI community's anxieties or excitement are concentrated right now.

### 7. Final Check
After completing all sections, do a final search for **AI news today** and **AI funding today** to catch any major stories that may have been missed. If anything significant is found that isn't already covered, add it to the most relevant section.

### 8. Deduplication Review
Re-read the full briefing top to bottom. Remove any item that appears in more than one section — keep it in the most relevant section only. Then cross-check against the 5 previous briefings you read at the start. Remove any story that was already covered unless today's entry contains genuinely new information beyond what was previously reported.

---

## Output Format

Save the briefing to `briefings/YYYY-MM-DD.md`. Use this structure:

```
# AI Intelligence Briefing — YYYY-MM-DD

## Executive Summary 
[3–5 sentences of flowing prose — no field labels, no bullet points. Identify the tension, pattern, or throughline that connects today's news, tools, builder discussion, and funding signals. Do not restate individual stories — synthesize across sections. What do they have in common? What contradiction or open question cuts across all of them? Close with the question the day raises. Written last, placed first.]

---

## Top News
[3–5 stories, 1–2 sentences each]
**Today's Signal:** [1–2 sentence interpretive summary]

## Notable Model Releases
[Only if a release clears the bar — flagship lab, meaningful cost/capability shift, or real builder traction. Skip section if nothing qualifies.]
**Today's Signal:** [1–2 sentence interpretive summary — omit if section skipped]

## New Tools & Products
[2–3 newly launched or trending tools, 1 sentence each — what it does and why it's getting attention. Skip if nothing notable.]

## What Builders Are Talking About
[2–3 items with why the community cares]
**Today's Signal:** [1–2 sentence interpretive summary]

## Funding & Launches
[Business news items, 1–2 sentences each]
**Today's Signal:** [1–2 sentence interpretive summary]

## Discussions & Debates
[1–2 online conversations summarized]
**Today's Signal:** [1–2 sentence interpretive summary]

---

## Sources Log (temporary — diagnostic)
| Source | Searched | Stories Used |
|--------|----------|-------------|
| TechCrunch | ✅/❌ | [story titles or "(nothing new)"] |
| Reuters | ✅/❌ | |
| Hacker News | ✅/❌ | |
| X/Twitter | ✅/❌ | |
| Product Hunt | ✅/❌ | |
| GitHub Trending | ✅/❌ | |
| r/vibecoding | ✅/❌ | |
| r/ChatGPTCoding | ✅/❌ | |
| r/claudecode | ✅/❌ | |
| Other | — | [any sources not listed above] |
```

Keep each section tight. The Executive Summary should be the single most valuable 3–5 sentences in the document — a cross-section synthesis, not a recap of Top News. Written last, placed first. Section summaries should be interpretive and forward-looking, not just recapping what's above. The full briefing should be skimmable in ~2 minutes.

---

## After Saving

Once the briefing file is written, commit and push it to GitHub:

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add briefing for YYYY-MM-DD"
git push
```

Replace `YYYY-MM-DD` with today's actual date.
