Daily AI Intelligence Briefing — Instructions

> Version: 3.0 | Last updated: 2026-03-28

## Purpose
Each morning, research and compile a concise AI and tech intelligence briefing. The output should be readable in approximately 2 minutes and saved to `ai-briefings/YYYY-MM-DD.md` using today's actual date.

**Overlap Prevention:** Only include a story or item if something materially new happened in the last 24 hours — new information, new data, new reaction, or a significant new development. Do not include stories simply because they are still being discussed or are generally important. If a story was covered yesterday and nothing new has happened, skip it.

**Cross-Section Deduplication:** Each story, tool, or item should appear in at most one section. If an item could fit in multiple sections, place it in the most relevant one and do not repeat it elsewhere.

**Empty Sections:** If a section has no genuinely significant content in the last 24 hours, say so briefly and move on. Never pad sections with low-signal content or embellish the significance of sources to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry. Common acronyms like LLM, API, and AI do not need to be spelled out. Less common acronyms should be spelled out on first use. When in doubt about whether an acronym is widely known, spell it out — it is better to over-explain than to leave the reader confused.

---

## Before You Start

Read the last 5 briefings from `ai-briefings/` (by date, most recent first). Note which stories, funding rounds, model releases, and tools were already covered. Do not include any of these in today's briefing unless there is a genuinely new development — new information, new data, or a significant update beyond continued discussion.

---

## Research Tasks

### 1. Top AI & Tech News
Search for the latest headlines from:
- **TechCrunch** (techcrunch.com)
- **Hacker News** (news.ycombinator.com — top stories and "Ask HN" threads relevant to AI)

Pick the 3–5 most significant stories published or materially updated in the last 24 hours strictly. Summarize each in 1–2 sentences.

**Section Summary:** End with 1–2 sentences interpreting what today's news collectively signals — are there patterns, a dominant theme, or a surprising absence? Be forward-looking, not just descriptive.

### 2. Notable Model Releases
Keep this section short. Only include a model release if it clears at least one of these bars:
- A flagship model from a major lab (Anthropic, OpenAI, Google DeepMind, Meta) or a notable open source release.
- A release that meaningfully shifts the cost/capability tradeoff for builders
- A release generating significant real-world builder discussion today

If nothing clears this bar, skip the section entirely — do not list minor model updates, fine-tunes, or incremental releases just to fill space.

**Section Summary:** End with 1–2 sentences on what today's notable release signals about where the frontier is moving. Omit this if the section is skipped.

### 3. Funding, Acquisitions & Product Launches
Search for major AI-related business news in the last 24 hours strictly:
- Funding rounds (Series A and above, or notable seed rounds)
- Acquisitions or mergers involving AI companies
- Significant new product or feature launches
- **Product Hunt** (producthunt.com) — check today's top 3–5 launches. Include any that are genuinely notable in the AI/tech space. Skip generic or low-signal launches.

Summarize each item in 1–2 sentences. If nothing significant occurred in the last 24 hours, say so briefly.

**Section Summary:** End with 1–2 sentences interpreting where money and product activity is flowing — infrastructure vs applications, incumbents vs startups, any surprising bets being made.

### 4. Notable Discussions & Debates
Find 1–2 interesting conversations started or gaining significant momentum in the last 24 hours — on Hacker News. These could be debates, critiques, thought experiments, or viral threads.

Summarize the core argument or question being discussed. Do not characterize how widely shared or discussed something is. Only summarize the content and argument — let the reader judge significance.

**Section Summary:** End with 1–2 sentences on what these debates reveal about where the AI community's anxieties or excitement are concentrated right now.

### 5. Final Check
After completing all sections, do a final search for **AI news today** to catch any major stories that may have been missed. Only include stories from established tech publications or primary sources (company blogs, official announcements). Skip aggregators, opinion sites, and low-quality blogs. If anything significant is found that isn't already covered, add it to the most relevant section.

### 6. Deduplication Review
Re-read the full briefing top to bottom. Remove any item that appears in more than one section — keep it in the most relevant section only. Then cross-check against the 5 previous briefings you read at the start. Remove any story that was already covered unless today's entry contains genuinely new information beyond what was previously reported.

---

## Output Format

Save the briefing to `ai-briefings/YYYY-MM-DD.md`. Use this structure:

```
# AI Intelligence Briefing — YYYY-MM-DD

## Top News
[3–5 stories, 1–2 sentences each]
**Today's Signal:** [1–2 sentence interpretive summary]

## Notable Model Releases
[Only if a release clears the bar — flagship lab, meaningful cost/capability shift, or real builder traction. Skip section if nothing qualifies.]
**Today's Signal:** [1–2 sentence interpretive summary — omit if section skipped]

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
| Hacker News | ✅/❌ |
| Product Hunt | ✅/❌ | [product names or "(nothing notable)"] |
| Other | — | [any sources not listed above] |
```

Keep each section tight. Section summaries should be interpretive and forward-looking, not just recapping what's above. The full briefing should be skimmable in ~2 minutes.

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
