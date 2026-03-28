Weekly AI Intelligence Summary — Instructions

> Version: 2.4 | Last updated: 2026-03-28

## Purpose
Each Saturday morning, synthesize the week's AI briefings, product briefings, and VC investment theses into a structured analysis of the product landscape. The goal is not to recap what happened — it's to understand what problem categories are emerging, which ones are gaining traction, and how they fit into the broader picture of AI capability shifts and capital flows.

Save output to `weekly-summaries/YYYY-WXX.md` using the ISO year and week number (e.g. `2026-W10`).

**Write the Problem Categories section first, then all other sections, then write the Week in Review last.**

**Empty Sections:** If a section has no genuinely significant content from the week, say so briefly and move on. Never pad with low-signal content to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry. Common acronyms like LLM, API, and AI do not need to be spelled out. Less common acronyms should be spelled out on first use. When in doubt, spell it out.

---

## Research Tasks

### 1. Read the Previous 3 Weekly Summaries
Read the last 3 files in `weekly-summaries/` before doing anything else. Note which problem categories were tracked and which problems kept appearing. You will use this to maintain category name consistency week-to-week and to carry forward any active categories even if they were quieter this week.

### 2. Read the Week's AI Briefings
Read all files in `ai-briefings/` from the last 5 weekday briefings (Monday–Friday only). Note any missed days and continue.

Do not summarize these — extract only what's relevant as context for the product analysis: capability shifts, model releases, infrastructure changes, or industry moves that create or close product surface area.

### 3. Read the Weekly Product Briefing
Read the most recent file in `weekly-products/` (the weekly product briefing produced earlier today). This file already contains products grouped into problem categories with traction signals.

This is your primary source for product signal. Use the problem categories as a starting point — you may merge, split, or rename them based on what the AI briefings and VC lens reveal.

### 4. Strategic Signals
Search for any new investment thesis posts, essays, or perspective pieces published in the last 7 days from:
- **a16z** (a16z.com)
- **Sequoia** (sequoiacap.com)
- **Kleiner Perkins** (kleinerperkins.com)

Include only forward-looking investment theses — pieces that articulate a belief about where a market or technology is heading. Exclude funding announcements, portfolio news, and press releases.

If nothing relevant was published this week, note it briefly.

---

## Output Sections

### Week in Review
2–3 sentences on the overall character of the week from a product perspective. What was the dominant story — a new capability unlocking new product categories, capital concentrating in a particular area, builders converging on a problem? Written last, placed first.

### AI Context
What shifted this week at the model or infrastructure layer that's relevant to product builders? Keep this short — 3–5 bullet points maximum. Focus only on changes that open or close product opportunities, not general AI news. Each bullet should connect directly to product implications.

### VC Lens
Summarize any investment thesis pieces published this week (from Research Task 4). For each: what they believe, why, and which product categories it validates, challenges, or ignores. If nothing was published this week, note it briefly.

### Problem Categories
The heart of the document. Discover and describe the problem categories active this week based on what you observed across the product briefings and catch-up research. Each category gets its own entry:

**[Category Name]**
- **Who it's for:** Who is experiencing this problem — what kind of person, role, or context?
- **Problem it's solving:** What is the underlying pain? Focus on the problem, not the solution.
- **What's being built:** 1–2 sentences on the types of products and approaches appearing in this category. If the problem and solution feel well-matched, note it. If builders seem to be solving the wrong thing or only part of the pain, note that too.
- **Traction signal:** What evidence exists that products in this category are working — user interest, revenue, community discussion, repeat appearances? Be honest if traction is unclear.

Use the previous weekly summaries (Research Task 1) to maintain consistent category names week-to-week. Carry forward any category that appeared in prior weeks even if it was quieter this week — a brief entry is better than dropping it silently. Retire a category only if it has been absent or negligible for 3+ consecutive weeks, and note the retirement briefly.

There is no fixed number of categories. Include as many as the week genuinely warrants. Quality over coverage.

### One Big Question
The single most interesting unresolved tension from the week. Not a summary — a genuine open question the week raised but didn't answer. Ideally something worth watching in the weeks ahead.

---

## Output Format

Save to `weekly-summaries/YYYY-WXX.md`:

```
# AI Intelligence Weekly — YYYY-WXX

> Week of [Monday date] – [Friday date]

## Week in Review
[2–3 sentences on the overall character of the week from a product perspective]

---

## AI Context
- [Capability or infrastructure shift → product implication]
- [Repeat as needed, max 5]

## VC Lens
[Thesis summaries with category implications, or "Nothing published this week."]

## Problem Categories

### [Category Name]
- **Who it's for:** ...
- **Problem it's solving:** ...
- **What's being built:** ...
- **Traction signal:** ...

[Repeat for each category]

## One Big Question
[The most interesting unresolved tension from the week]

---

## Sources Log (temporary — diagnostic)
| Source | Searched | Content Used |
|--------|----------|-------------|
| Previous weekly summaries | ✅/❌ | [which weeks read] |
| AI briefings (Mon–Fri) | ✅/❌ | [which days read] |
| Weekly product briefing | ✅/❌ | [date of briefing read] |
| a16z | ✅/❌ | [pieces or "(nothing published)"] |
| Sequoia | ✅/❌ | [pieces or "(nothing published)"] |
| Kleiner Perkins | ✅/❌ | [pieces or "(nothing published)"] |
```

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
