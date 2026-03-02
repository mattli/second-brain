Weekly AI Intelligence Summary — Instructions

> Version: 1.1 | Last updated: 2026-03-02

## Purpose
Each Sunday morning, read all daily briefings from the past 7 days and synthesize them into a weekly intelligence summary. The output should surface patterns, signal, and insight that aren't visible in any single day's briefing. Save output to `weekly-summaries/YYYY-WXX.md` using the ISO year and week number (e.g. `2026-W10`).

**Write all sections first, then write the Week in Review last** — it should reflect the full picture after synthesis is complete.

**Empty Sections:** If a section has no genuinely significant content from the week, say so briefly and move on. Never pad sections with low-signal content to fill space.

---

## Research Tasks

### 1. Read the Week's Briefings
Read all files in the `briefings/` folder from the last 5 weekday briefings (Monday–Friday only). If a day has no briefing file (e.g. missed run), note it and continue.

Use these briefings as your primary source. Do not re-research news independently — synthesize what was already captured.

### 2. Strategic Signals
Search for any new investment thesis posts, essays, or perspective pieces published in the last 7 days from:
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
What was the developer and product community building, debating, and struggling with this week? What problems kept coming up without good solutions?

### One Big Question
The single most interesting unresolved tension from the week. Not a summary — a genuine open question the week raised but didn't answer.

### Product Observations
Anything from the week that surfaced a potential product opportunity worth noting. Keep this grounded — only include observations backed by something concrete from the briefings. If any observation is strong enough, add it to the Observations & Patterns section of `projects/product-vision.md`.

### Strategic Signals
New investment thesis posts from a16z, Sequoia, Kleiner Perkins, or Khosla Ventures in the last 7 days (from Research Task 2 above). Forward-looking theses only — no funding announcements.

---

## Output Format

Save to `weekly-summaries/YYYY-WXX.md` using the ISO year and week number:

```
# AI Intelligence Weekly — YYYY-WXX

> Week of [Monday date] – [Sunday date]

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

## Product Observations
[Grounded opportunities surfaced by the week's content]

## Strategic Signals
[Thesis posts from a16z, Sequoia, Kleiner Perkins, Khosla — or "Nothing published this week."]
```

Keep the document tight and skimmable. Prioritize insight over coverage. A sharp observation in two sentences is better than a thorough recap in ten.

---

## After Saving

Once the summary file is written, commit and push to GitHub:

```bash
cd "/Users/mattli/Library/Mobile Documents/iCloud~md~obsidian/Documents/second-brain"
git add -A
git commit -m "Add weekly summary for YYYY-WXX"
git push
```

Replace `YYYY-WXX` with the actual year and week number.
