Weekly AI Intelligence Summary — Instructions

> Version: 3.3 | Last updated: 2026-03-28

## Purpose
Each Saturday morning, synthesize the week's AI briefings and weekly product briefing into an analysis of where the product landscape is moving. The goal is not to recap what happened or re-categorize products — the daily briefings and weekly product briefing already did that. The goal is to layer on context (capability shifts, capital flows, VC theses) and surface the gaps between what's being invested in and what's actually being built.

Save output to `weekly-summaries/YYYY-WXX.md` using the ISO year and week number (e.g. `2026-W13`).

**Write the Category Movement section first, then Capital vs. Builder Gaps, then all other sections, then write the Week in Review last.**

**Empty Sections:** If a section has no genuinely significant content from the week, say so briefly and move on. Never pad with low-signal content to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry. Common acronyms like LLM, API, and AI do not need to be spelled out. Less common acronyms should be spelled out on first use. When in doubt, spell it out.

---

## Research Tasks

### 1. Read the Previous 3 Weekly Summaries
Read the last 3 files in `weekly-summaries/` before doing anything else. Note which categories were tracked, which gaps were identified, and what the open questions were. You will use this to maintain continuity week-to-week.

### 2. Read the Week's AI Briefings
Read all files in `ai-briefings/` from the last 5 weekday briefings (Monday–Friday only). Note any missed days and continue.

Extract only what's relevant as context for the analysis: capability shifts, model releases, infrastructure changes, funding rounds, acquisitions, notable Product Hunt launches, or industry moves that create or close product surface area. Do not summarize the briefings — distill them into the context that matters for understanding what's changing.

Pay specific attention to Product Hunt launches captured in the daily briefings — these represent products with more polish and ambition than X thread replies and may warrant mention in Category Movement if they map to active categories.

### 3. Read the Weekly Product Briefing
Read the most recent file in `weekly-products/` (the weekly product briefing produced earlier today). This file already contains products grouped into problem categories with source data.

**Do not re-categorize these products.** The product briefing owns the categorization. Your job is to analyze what those categories mean when you overlay the AI briefing context and VC lens.

### 4. VC Thesis Search
Search for any new investment thesis posts, essays, or perspective pieces published in the last 7 days from:
- **a16z** (a16z.com)
- **Sequoia** (sequoiacap.com)
- **Kleiner Perkins** (kleinerperkins.com)

Include only forward-looking investment theses — pieces that articulate a belief about where a market or technology is heading. Exclude funding announcements, portfolio news, and press releases.

If nothing relevant was published this week, note it briefly.

---

## Output Sections

### Week in Review
2–3 sentences on the overall character of the week from a product perspective. What was the dominant story — a new capability unlocking new product categories, capital concentrating in a particular area, a gap becoming visible between investment and builder activity? Written last, placed first.

### AI Context
What shifted this week at the model or infrastructure layer that's relevant to product builders? Keep this short — 3–5 bullet points maximum. Each bullet should connect a capability or infrastructure change to its product implication. Skip general AI news that doesn't affect what's buildable.

### VC Lens
Summarize any investment thesis pieces published this week (from Research Task 4). For each: what they believe, why, and which product categories it validates, challenges, or opens up. If nothing was published this week, note it briefly. Also note any significant funding rounds or acquisitions from the daily briefings that signal where capital is concentrating.

### Category Movement
Take the problem categories from the weekly product briefing as your starting point. For each notable category, provide brief commentary:
- Is this category growing, shrinking, or steady compared to prior weeks?
- Did anything in the AI briefings this week (a new capability, a platform change, a funding round) reinforce or undercut this category?
- Are the products in this category actually solving the problem, or are they clustering around a surface-level version of it?

You don't need to comment on every category. Focus on the ones where something interesting is happening — movement, contradiction, or insight. Carry forward any category from prior weeks that is notably absent this week and flag it.

The weekly product briefing includes X engagement metrics (likes). Do not treat these as traction signals. They measure visibility in a thread, not product usage, revenue, or growth. When discussing products from the weekly briefing, describe what's being built and how categories are shifting — do not claim traction unless there is evidence beyond social engagement (e.g. funding, reported revenue, user counts from the product itself).

### Capital vs. Builder Gaps
This is the most important section. Cross-reference the VC Lens and funding activity (where capital is flowing) with the product briefing categories (where builders are clustering). Identify 1–3 mismatches:

- **Capital without builders:** Where are VCs investing or publishing theses that indie builders aren't building toward yet? Why might the gap exist — is the problem too hard, too enterprise, too early, or just not visible to solo builders?
- **Builders without capital:** Where are builders crowding that VCs aren't validating? Is this because the market is too small, the business model isn't there, or VCs are wrong?

For each gap, briefly note whether it looks like an opportunity or a warning.

If the data this week doesn't reveal clear gaps, say so — don't manufacture them. Some weeks the signal won't be there.

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
[Thesis summaries with category implications, or "Nothing published this week." Plus notable funding/acquisitions.]

## Category Movement
[Commentary on notable categories from the product briefing — what's growing, shrinking, reinforced, or undercut]

## Capital vs. Builder Gaps
[1–3 mismatches between where capital is flowing and where builders are clustering, with analysis of each gap]

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
