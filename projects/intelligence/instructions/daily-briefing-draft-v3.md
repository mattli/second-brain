Daily AI Intelligence Briefing — Instructions (DRAFT v3.0)

> Version: 3.0-draft | Last updated: 2026-03-20
> Status: Draft — not yet in use. Replaces v2.8 if approved.

---

## Purpose

Each morning, research and compile a concise AI and tech intelligence briefing written for a product-minded builder who wants to stay sharp on what's shipping, what's gaining traction, and where the market is moving — not just what made headlines.

The output should be readable in approximately 2 minutes and saved to `briefings/YYYY-MM-DD.md` using today's actual date.

**How this rolls up:**
- **Daily** — what happened, what launched, what builders are talking about right now
- **Weekly** — what themes emerged? What actually mattered? What changed your mental model?
- **Monthly** — what does this month signal about where the market is heading? What opportunities or threats are crystallizing?

**Important:** Research and write all sections first, then write the Executive Summary last and place it at the top of the document. The Executive Summary should synthesize across sections — it is not a compressed version of Top News.

**Overlap Prevention:** Only include a story or item if something materially new happened in the last 24 hours — new information, new data, new reaction, or a significant new development. Do not include stories simply because they are still being discussed or are generally important. If a story was covered yesterday and nothing new has happened, skip it.

**Cross-Section Deduplication:** Each story, tool, or item should appear in at most one section. If an item could fit in multiple sections, place it in the most relevant one and do not repeat it elsewhere.

**Empty Sections:** If a section has no genuinely significant content in the last 24 hours, say so briefly and move on. Never pad sections with low-signal content or embellish the significance of sources to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry. Common acronyms like LLM, API, and AI do not need to be spelled out. Less common acronyms should be spelled out on first use. When in doubt, spell it out.

---

## Before You Start

Read the last 5 briefings from `briefings/` (by date, most recent first). Note which stories, launches, and tools were already covered. Do not include any of these today unless there is a genuinely new development.

---

## Research Tasks

### 1. Top News

Search for the latest headlines from:
- **TechCrunch** (techcrunch.com)
- **Reuters** (reuters.com)
- **Hacker News** (news.ycombinator.com — top stories only, not Show HN)
- **X/Twitter** (for breaking news and real-time signals)

Pick the 3–5 most significant stories published or materially updated in the last 24 hours. Summarize each in 1–2 sentences.

**Model releases:** Do not give model releases their own section. If a model release is genuinely significant — a flagship model from a major lab, or a release that materially shifts the cost/capability tradeoff for builders — include it here as a top story. Otherwise skip it.

**Section Summary:** End with 1–2 sentences on what today's news collectively signals. Be forward-looking, not just descriptive.

---

### 2. Consumer & Enterprise Products

What are people actually using, downloading, and paying for? This section covers products aimed at end users (consumer) and businesses or teams (enterprise). Not developer tools — those go in the next section.

Search:
- **Product Hunt AI category** (producthunt.com/topics/artificial-intelligence — today's top launches)
- **Show HN** (news.ycombinator.com — filter for "Show HN:" posts from the last 24 hours aimed at non-developer users)
- **X/Twitter** — search for product launches, demos, or "just shipped" announcements in the AI/tech space

List 2–4 items. For each: what it does, who it's for, and why it's getting attention. If nothing notable launched today, say so and skip the section.

**Section Summary:** End with 1–2 sentences on what today's launches reveal about what problems people are actually trying to solve — and whether there are patterns across launches.

---

### 3. Developer Tools

What are developers and builders actually using to build things? This section covers libraries, frameworks, CLIs, APIs, coding tools, and infrastructure aimed at technical users.

Search:
- **GitHub Trending** (github.com/trending — look for repos gaining stars rapidly today, not just the all-time list; flag any repo crossing a major star milestone in the last 24 hours)
- **Show HN** (news.ycombinator.com — filter for "Show HN:" posts from the last 24 hours aimed at developers)
- **Hacker News** (top threads where builders are discussing tools, techniques, or workflows)
- **r/vibecoding**, **r/ChatGPTCoding**, **r/claudecode** (reddit.com)

Focus on:
- Tools or libraries gaining rapid traction
- Practical techniques or workflows being shared
- Frustrations or recurring problems that keep coming up

List 2–3 items with a 1–2 sentence summary of what it does and why the community finds it interesting.

**Section Summary:** End with 1–2 sentences on what the developer community's focus today reveals about emerging pain points — what problem keeps coming up that doesn't have a great solution yet?

---

### 4. Discussions & Debates

Find 1–2 interesting conversations started or gaining significant momentum in the last 24 hours — on Hacker News or X/Twitter. These could be debates, critiques, thought experiments, or viral threads.

Summarize the core argument or question being discussed. Do not characterize how widely shared or discussed something is. Only summarize the content and argument — let the reader judge significance.

**Section Summary:** End with 1–2 sentences on what these debates reveal about where the AI community's anxieties or excitement are concentrated right now.

---

### 5. Funding & Business

Search for major AI-related business news in the last 24 hours:
- Funding rounds (Series A and above, or notable seed rounds)
- Acquisitions or mergers
- Significant strategic moves by major companies

Summarize each in 1–2 sentences. Focus on what the capital flow signals about where the market is heading — not just the dollar amounts. If nothing significant occurred in the last 24 hours, say so briefly.

**Section Summary:** End with 1–2 sentences on where money is flowing and what it bets on — infrastructure vs. applications, incumbents vs. startups, any surprising or contrarian bets.

---

### 6. Final Check

After completing all sections, do a final search for **AI news today** and **AI product launches today** to catch any major stories that may have been missed. If anything significant is found that isn't already covered, add it to the most relevant section.

### 7. Deduplication Review

Re-read the full briefing top to bottom. Remove any item that appears in more than one section — keep it in the most relevant section only. Then cross-check against the 5 previous briefings you read at the start. Remove any story that was already covered unless today's entry contains genuinely new information.

---

## Output Format

Save the briefing to `briefings/YYYY-MM-DD.md`. Use this structure:

```
# AI Intelligence Briefing — YYYY-MM-DD

## Executive Summary
[3–5 sentences of flowing prose — no field labels, no bullet points. Identify the tension, pattern, or throughline that connects today's news, products, developer tools, and funding signals. Do not restate individual stories — synthesize across sections. What do they have in common? What contradiction or open question cuts across all of them? Close with the question the day raises. Written last, placed first.]

---

## Top News
[3–5 stories, 1–2 sentences each. Includes model releases if significant enough.]
**Today's Signal:** [1–2 sentence interpretive summary]

## Consumer & Enterprise Products
[2–4 launches — what it does, who it's for, why it's getting attention.]
**Today's Signal:** [1–2 sentence interpretive summary]

## Developer Tools
[2–3 items — tools, libraries, techniques gaining traction in the developer community]
**Today's Signal:** [1–2 sentence interpretive summary]

## Discussions & Debates
[1–2 online conversations summarized]
**Today's Signal:** [1–2 sentence interpretive summary]

## Funding & Business
[Business news items, 1–2 sentences each]
**Today's Signal:** [1–2 sentence interpretive summary]
```

Keep each section tight. The full briefing should be skimmable in ~2 minutes.

---

## Sources Log (temporary — diagnostic)

| Source | Searched | Stories Used |
|--------|----------|-------------|
| TechCrunch | ✅/❌ | [story titles or "(nothing new)"] |
| Reuters | ✅/❌ | |
| Hacker News (top) | ✅/❌ | |
| Show HN | ✅/❌ | |
| X/Twitter | ✅/❌ | |
| Product Hunt AI | ✅/❌ | |
| GitHub Trending | ✅/❌ | |
| r/vibecoding | ✅/❌ | |
| r/ChatGPTCoding | ✅/❌ | |
| r/claudecode | ✅/❌ | |
| Other | — | [any sources not listed above] |

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
