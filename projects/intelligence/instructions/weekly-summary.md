Weekly AI Intelligence Summary — Instructions

> Version: 1.6 | Last updated: 2026-03-20

## Purpose
Each Saturday morning, read the last 5 weekday briefings (Monday–Friday) and synthesize them into a weekly intelligence summary. The output should surface patterns, signal, and insight that aren't visible in any single day's briefing. Save output to `weekly-summaries/YYYY-WXX.md` using the ISO year and week number (e.g. `2026-W10`).

**Write all sections first, then write the Week in Review last** — it should reflect the full picture after synthesis is complete.

**Empty Sections:** If a section has no genuinely significant content from the week, say so briefly and move on. Never pad sections with low-signal content to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry. Common acronyms like LLM, API, and AI do not need to be spelled out. Less common acronyms should be spelled out on first use. When in doubt about whether an acronym is widely known, spell it out — it is better to over-explain than to leave the reader confused.

---

## Research Tasks

### 1. Read the Week's Briefings
Read all files in the `ai-briefings/` folder from the last 5 weekday briefings (Monday–Friday only). If a day has no briefing file (e.g. missed run), note it and continue.

Use these briefings as your primary source. Do not re-research news independently — synthesize what was already captured.

### 2. Builder Pulse Research
Do a 7-day lookback on what indie projects and new products are gaining traction. Search:
- **Product Hunt** (producthunt.com) — top launches of the week by upvotes
- **Hacker News Show HN** (news.ycombinator.com) — builder-posted projects gaining community traction
- **Indie Hackers** (indiehackers.com) — revenue milestones, growth stories, and what's working

Look for patterns in what product categories are being built, not just individual launches. What types of problems are founders choosing to solve this week? What's getting real user traction vs what's just getting attention?

Synthesize findings into the Builder Pulse section alongside what the daily briefings captured.

If nothing significant surfaced this week, say so briefly.

### 3. Strategic Signals
Search for any new investment thesis posts, esays, or perspective pieces published in the last 7 days from:
- **a16z** (a16z.com)
- **Sequoia** (sequoiacap.com)
- **Kleiner Perkins** (kleinerperkins.com)
- **Khosla Ventures** (khoslaventures.com)

Include only forward-looking investment theses — pieces that articulate a belief about where a market or technology is heading. Exclude funding announcements, portfolio news, and press releases.

Summarize each thesis in 2–3 sentences: what they believe, why, and what it implies.

If nothing relevant was published this week, say so briefly.

---

## Output Sections

### Week in Review
2–3 sentences on the overall character of the week. What kind of week was it — consolidation, acceleration, noise, a turning point? Written last, placed first.

### Signal vs Noise
What felt genuinely significant versus what was just chatter or hype? Be direct. Call out stories that got attention but don't hold up on reflection.

### Emerging Patterns
Themes, technologies, or tensions that appeared more than once across the week's briefings. A pattern requires at least two independent data points. Name the pattern and explain what's driving it.

### Money & Power
Where did funding and attention flow consistently this week? Look for direction, not just individual deals — is capital moving toward infrastructure or applications, incumbents or startups, one modality or another?

### Builder Pulse
What was the developer and product community building, debating, and struggling with this week? What problems kept coming up without good solutions? What indie projects or product categories gained real traction (from Research Task 2 above)?

### One Big Question
The single most interesting unresolved tension from the week. Not a summary — a genuine open question the week raised but didn't answer.

### Strategic Signals
New investment thesis posts from a16z, Sequoia, Kleiner Perkins, or Khosla Ventures in the last 7 days (from Research Task 2 above). Forward-looking theses only — no funding announcements.

---

## Output Format

Save to `weekly-summaries/YYYY-WXX.md` using the ISO year and week number:

```
# AI Intelligence Weekly — YYYY-WXX

> Week of [Monday date] – [Friday date]

## Week in Review
[2–3 sentences on the overall character of the week]

---

## Signal vs Noise
[What held up vs what was chatter]

## Emerging Patterns
[Themes that appeared 2+ times, with explanation]

## Money & Power
[Where funding and attention consistently flowed]

## Builder Pulse
[What the community was building and struggling with]

## One Big Question
[The most interesting unresolved tension from the week]

## Strategic Signals
[Thesis posts from a16z, Sequoia, Kleiner Perkins, Khosla — or "Nothing published this week."]

---

## Sources Log (temporary — diagnostic)
| Source | Searched | Content Used |
|--------|----------|-------------|
| Daily briefings (Mon–Fri) | ✅/❌ | [which days read] |
| Product Hunt | ✅/❌ | [items or "(nothing notable)"] |
| Hacker News Show HN | ✅/❌ | |
| Indie Hackers | ✅/❌ | |
| a16z | ✅/❌ | |
| Sequoia | ✅/❌ | |
| Kleiner Perkins | ✅/❌ | |
| Khosla Ventures | ✅/❌ | |
| Other | — | [any sources not listed above] |
```

Keep the document tight and skimmable. Prioritize insight over coverage. A sharp observation in two sentences is better than a thorough recap in ten.

---

## After Saving

Once the summary file is written, commit and push to GitHub:

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add weekly summary for YYYY-WXX"
git push
```

Replace `YYYY-WXX` with the actual year and week number.

