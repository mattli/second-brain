Daily Product Briefing — Instructions

> Version: 1.0 | Last updated: 2026-03-21

## Purpose
Each morning, research and compile a concise product intelligence briefing focused on what builders and product people are actively shipping, discussing, and excited about. The output should be readable in approximately 2 minutes and saved to `projects/intelligence/product-briefings/YYYY-MM-DD.md` using today's actual date.

Cover 3–5 of the most interesting products, tools, or projects gaining traction in the last 24 hours. Quality over quantity — skip anything that is not genuinely interesting or new.

**Overlap Prevention:** Only include a product or project if it launched or gained significant new traction in the last 24 hours. Do not include items simply because they are still being discussed. If something was covered yesterday and nothing new has happened, skip it.

**Empty Sections:** If a source has no genuinely significant activity in the last 24 hours, move on. Never pad with low-signal content.

---

## Before You Start

Read the last 5 product briefings from `projects/intelligence/product-briefings/` (by date, most recent first). Note which products, tools, and projects were already covered. Do not include any of these today unless there is a genuinely new development.

---

## Research Tasks

Search the following sources for what builders and product people are actively shipping or discussing:

- **Product Hunt** (producthunt.com — top launches of the day)
- **Hacker News** (news.ycombinator.com — Show HN posts and relevant discussions)
- **GitHub Trending** (github.com/trending)
- **Indie Hackers** (indiehackers.com — recent milestones and launches)

Focus on:
- Tools or projects gaining rapid traction
- Interesting products people are shipping
- Practical techniques or workflows being shared
- Problems or frustrations that keep coming up across multiple sources

---

## Output Format

Save to `projects/intelligence/product-briefings/YYYY-MM-DD.md`. Use this structure:

```
# Product Briefing — YYYY-MM-DD

## [Product or Project Name]
**Who has this problem?** [developer / PM / non-technical user / enterprise team / etc.]
**What problem does it attempt to solve?**
**Is the solution complete, or does it address only part of the pain?**
**What would a better solution look like?**

[Repeat for 3–5 products]

---

## Today's Signal
[1–2 sentences synthesizing what today's product activity reveals — what kinds of problems are builders choosing to solve, what does the pattern of launches suggest about where the market is heading?]

---

## Sources Log (temporary — diagnostic)
| Source | Searched | Items Used |
|--------|----------|------------|
| Product Hunt | ✅/❌ | [product names or "(nothing new)"] |
| Hacker News | ✅/❌ | |
| GitHub Trending | ✅/❌ | |
| Indie Hackers | ✅/❌ | |
```

---

## After Saving

Once the briefing file is written, commit and push it to GitHub:

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add product briefing for YYYY-MM-DD"
git push
```

Replace `YYYY-MM-DD` with today's actual date.
