Monthly AI Intelligence Summary — Instructions

> Version: 2.3 | Last updated: 2026-03-28

## Purpose
On the 1st of each month, read the last 4–5 weekly summaries and synthesize them into a monthly intelligence summary. The goal is not to recap what happened — the weeklies already did that. The goal is to identify which problems are durable enough to build on, and which trends didn't hold up.

Save output to `monthly-summaries/YYYY-MM.md` (e.g. `2026-03.md`).

**Write the Durable Problem Categories section first, then False Signals, then Build Candidates, then Month in Review last.**

**Empty Sections:** If a section has no genuinely significant content, say so briefly and move on. Never pad with low-signal content to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry on first use. When in doubt, spell it out.

---

## Research Tasks

### 1. Read the Month's Weekly Summaries
Read all files in `weekly-summaries/` from the last 4–5 weeks, plus the corresponding `weekly-products/` briefings. Use these as your primary sources — do not re-research news independently.

From the weekly summaries, focus on the **Category Movement** and **Capital vs. Builder Gaps** sections. From the weekly product briefings, read the problem categories and the products listed under each. Track across weeks:
- Which problems appeared consistently (3+ weeks)?
- Which capital-vs-builder gaps kept showing up?
- Which categories showed real movement (growing, shifting, or consolidating)?
- Which appeared once and didn't recur?

Note any missing weeks and continue.

---

## Output Sections

### Month in Review
3–4 sentences on the overall character of the month from a product perspective. What was the dominant story? Did a new capability open up a cluster of new problems worth solving? Did a category emerge, consolidate, or die? Written last, placed first.

### Durable Problem Categories
The heart of the document. Identify 2–5 problem categories that appeared consistently across the month's category movement analysis, product briefings, and capital-vs-builder gaps. A problem that shows up in Capital vs. Builder Gaps three out of four weeks is durable signal.

For each problem:

**[Problem Name]**
- **Who has it:** What kind of person or team experiences this consistently?
- **Why it's durable:** What made it appear week after week? Is it structural, or tied to a specific AI capability shift? Did capital interest reinforce it?
- **Where it's headed:** Is the problem getting more acute, more solvable, or both? What would need to be true for a product here to work?
- **Examples from the month:** 2–3 specific products from the weekly product briefings that attempted to address this problem. Note briefly whether they appeared to be solving it well or only partially.

Be concrete. "People struggle with X" is not enough — name the context, the friction, the moment where it breaks down. If a problem doesn't have that level of clarity yet, it's not durable enough to include.

### False Signals
What looked like a trend this month but didn't hold up? What got attention early and faded, or turned out to be one product's moment rather than a category? Keep this brief — 2–3 items maximum. Knowing what not to build on is as useful as knowing what to build on.

### Build Candidates
2–3 high signal specific product ideas grounded in the month's durable problems and persistent gaps. These are prompts for thinking, not business plans.

For each:
- **What to build:** One sentence.
- **Who it's for:** The specific person or context.
- **Why now:** What this month's data suggests about timing — a persistent gap, a capability shift, capital interest without builder activity.
- **Scrappy v1:** What the smallest useful version looks like.

### One Big Unresolved Question
The single most important thing the month raised but didn't answer. A genuine tension — not a summary, not a prediction. Something that will determine which of several plausible futures we end up in.

---

## Output Format

Save to `monthly-summaries/YYYY-MM.md`:

```
# AI Intelligence Monthly — YYYY-MM

> Month of [Month] [Year]

## Month in Review
[3–4 sentences on the overall character of the month]

---

## Durable Problem Categories

### [Problem Category Name]
- **Who has it:** ...
- **Why it's durable:** ...
- **Where it's headed:** ...
- **Examples from the month:** ...

[Repeat for each durable problem]

## False Signals
[2–3 things that looked like trends but didn't hold up]

## Build Candidates

### [Idea Name]
- **What to build:** ...
- **Who it's for:** ...
- **Why now:** ...
- **Scrappy v1:** ...

[Repeat for 2–3 ideas]

## One Big Unresolved Question
[The most important tension the month raised but didn't answer]

---

## Sources Log (temporary — diagnostic)
| Source | Content Used |
|--------|-------------|
| Weekly summaries | [which weeks read] |
| Missing weeks | [any gaps noted] |
```

Keep the document tight. A sharp observation in two sentences is better than a thorough recap in ten.

---

## After Saving

Commit and push to GitHub:

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add monthly summary for YYYY-MM"
git push
```

Replace `YYYY-MM` with the actual year and month.
