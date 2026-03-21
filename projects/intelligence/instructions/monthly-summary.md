Monthly AI Intelligence Summary — Instructions

> Version: 1.1 | Last updated: 2026-03-20

## Purpose

On the 1st of each month, read the last 4–5 weekly summaries and synthesize them into a monthly intelligence summary. The goal is not to recap what happened — the weeklies already did that. The goal is to identify what is actually changing: which patterns held, which reversed, which accelerated, and what they might mean for product opportunities.

Save output to `monthly-summaries/YYYY-MM.md` (e.g. `2026-03.md`).

Then update `projects/product/product-vision.md` with any new observations surfaced this month (see After Saving).

**Write all sections first, then write the Month in Review last** — it should reflect the full picture after synthesis is complete.

**Empty Sections:** If a section has no genuinely significant content, say so briefly and move on. Never pad sections with low-signal content to fill space.

**Acronyms:** Spell out any acronym that is not widely known outside the AI/tech industry on first use. When in doubt, spell it out.

---

## Research Tasks

### 1. Read the Month's Weekly Summaries

Read all files in `weekly-summaries/` from the last 4–5 weeks. Use these as your primary source. Do not re-research news independently.

Note any weeks that are missing and continue.

### 2. Identify What Changed

As you read, track:
- Patterns that appeared in multiple weeks (strengthening trends)
- Patterns that appeared once and didn't recur (noise)
- Stories or beliefs from early in the month that the later weeks complicated or reversed
- Anything that was missing from the weeklies but should have been there

3. dfsdf
---

## Output Sections

### Month in Review
3–4 sentences on the overall character of the month. What kind of month was it — a turning point, a consolidation, an acceleration? What's the one thing that will matter in six months that most people aren't paying enough attention to right now? Written last, placed first.

### What Actually Changed
The most important section. Look across all four weeks and identify 3–5 things that demonstrably shifted — not "this was discussed a lot" but "the situation is different than it was 30 days ago." Each item should name what changed, what drove it, and why it matters going forward.

### Durable Patterns
Themes that appeared consistently across multiple weeks and show no sign of reversing. These are the things you can build on — they're not going away. Distinguish between patterns that are accelerating vs. plateauing.

### False Signals
Stories or narratives from early in the month that the evidence later complicated or contradicted. What got attention that didn't hold up? What looked like a trend but was actually a moment?

### Money & Power — Monthly View
Step back from individual deals. Where is capital consistently flowing across the full month? Are there sectors, stages, or archetypes that are attracting disproportionate attention? What does the aggregate pattern suggest about where investors think value will be created?

### Builder Pulse — Monthly View
What problems kept coming up across four weeks without getting solved? What tools or patterns are clearly winning developer adoption? What's the most important unsolved pain point in the builder community right now?

### Product Observations
The section that connects intelligence to product thinking. Look across the month's patterns and identify 2–5 moments where a recurring pain point and an emerging AI capability appear to be converging — situations where something that was previously impractical looks like it might now be solvable.

For each observation, note what you saw and why it looks like an opening:

> **[Pattern name]:** [What recurring problem or friction appeared across the month.] [What AI capability or shift makes it newly addressable.] Question: [What you'd want to understand better before taking it seriously.]

Be concrete and specific. "AI is improving" is not an observation. "Developers keep hitting the same multi-agent coordination problem and no tool has solved it yet" is.

If nothing this month looks like a genuine product opening, say so and move on. Don't force it.

### One Big Unresolved Question
The single most important thing the month raised but didn't answer. Should be a genuine tension — not a summary, not a prediction. Something that will determine which of several plausible futures we end up in.

### Strategic Signals — Monthly View
Compile all VC thesis posts from the last 30 days (from Research Task 3). If a thesis was already in a weekly summary, include it here but note it was previously captured. Group theses by theme if more than three appear.

---

## Output Format

```
# AI Intelligence Monthly — YYYY-MM

> Month of [Month] [Year]

## Month in Review
[3–4 sentences on the overall character of the month]

---

## What Actually Changed
[3–5 things that demonstrably shifted this month]

## Durable Patterns
[Themes holding consistently across multiple weeks]

## False Signals
[What got attention but didn't hold up]

## Money & Power — Monthly View
[Where capital consistently flowed across the month]

## Builder Pulse — Monthly View
[Unsolved problems and winning patterns across the month]

## Product Observations
[2–5 observations where a recurring pain point and an emerging AI capability are converging]

## One Big Unresolved Question
[The most important tension the month raised but didn't answer]

## Strategic Signals — Monthly View
[All VC thesis posts from the last 30 days]

---

## Sources Log (temporary — diagnostic)
| Source | Searched | Content Used |
|--------|----------|-------------|
| Weekly summaries | ✅/❌ | [which weeks read] |
| a16z | ✅/❌ | [items or "(nothing new)"] |
| Sequoia | ✅/❌ | |
| Kleiner Perkins | ✅/❌ | |
| Khosla Ventures | ✅/❌ | |
| Other | — | [any sources not listed above] |
```

Keep the document tight. Prioritize insight over coverage. A sharp observation in two sentences is better than a thorough recap in ten.

---

## After Saving

### 1. Update product-vision.md

Read `projects/product/product-vision.md`. Under the `## Observations & Patterns` section, append any Product Observations from this month's summary that feel worth carrying forward. Use this format:

```
**[YYYY-MM] [Pattern name]:** [One sentence on what you observed and why it's relevant.]
```

Only add observations that are genuinely new or that strengthen an existing pattern. Don't copy everything — be selective.

### 2. Commit and push to GitHub

```bash
cd /Users/mattli/second-brain
git add -A
git commit -m "Add monthly summary for YYYY-MM"
git push
```

Replace `YYYY-MM` with the actual year and month.
