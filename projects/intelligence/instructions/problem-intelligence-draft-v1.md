Problem Intelligence Layer — Instructions (DRAFT v1.0)

> Version: 1.0-draft | Last updated: 2026-03-20
> Status: Draft — concept stage. Not yet in use.

---

## Purpose

This is a PM-oriented intelligence layer focused on one question: **what problems are being solved by AI, and why do those problems exist?**

This is not a news briefing. It is not about what launched or what's trending. It is about understanding the underlying pain — who is suffering from it, what workarounds exist, and where the solutions being built are incomplete or wrong.

The output feeds into a rolling view of where real product opportunities might exist.

**The core lens for everything:**
- What was broken before this product existed?
- Who is paying for it (or would pay), and why?
- What does the fact that this exists tell you about a problem that isn't fully solved yet?

---

## How This Fits Into the Intelligence System

- **Daily briefing** — what happened; what launched; what builders are talking about
- **This layer** — what problems keep surfacing; what pain is being patched vs. actually solved
- **Weekly summary** — which problems appeared multiple times this week across different products, discussions, and funding signals
- **Monthly summary** — which problems are crystallizing into real opportunities; what the pattern of solutions reveals about what's still missing

---

## Research Tasks

### 1. Problems Surfacing in Complaints and Workarounds

The best signal for a real problem is not a product launch — it's a complaint, a workaround, or a question that keeps getting asked.

Search:
- **Hacker News** — threads where people are describing what's broken, frustrating, or missing ("I wish there was a tool that...", "why doesn't X do Y?", recurring pain in comments on product launches)
- **r/ChatGPTCoding**, **r/vibecoding**, **r/claudecode** — what are people struggling with? What do they keep hacking around?
- **X/Twitter** — search for frustration signals around AI tools ("annoying", "broken", "why can't", "no tool does this")

For each problem found: describe the pain in one sentence, note who is experiencing it (developer, PM, designer, non-technical user, enterprise team), and note what workaround or partial solution people are using today.

---

### 2. Problems Implied by New Products

For each notable product launched in the last week, ask: what problem does its existence prove?

A product launch is evidence that someone believed a problem was real enough to build for. The product itself may be wrong — but the problem it was built for is worth noting.

For each product:
- What problem does this solve?
- Who has this problem?
- Is the solution complete, or does it address only part of the pain?
- What would a better solution look like?

---

### 3. Problems Implied by Funding

Follow the money to find the problems investors believe are real and large.

For each significant funding round this week:
- What problem is this company solving?
- Why is now the right time for this problem to be solvable?
- What does the size of the round imply about the perceived market?

---

### 4. Recurring Problems

Cross-reference this week's findings against previous entries in this file. Flag any problem that has appeared in more than one week. Recurring problems are the most interesting — they indicate something that multiple builders are trying to solve but haven't fully cracked.

---

## Output Format

Save weekly to `projects/intelligence/problem-log/YYYY-WXX.md`.

```
# Problem Intelligence Log — YYYY-WXX

## Problems Surfacing This Week

### [Problem Name]
**Who has it:** [developer / PM / non-technical user / enterprise team / etc.]
**Evidence:** [where you saw it — HN thread, Reddit complaint, product launch, funding round]
**Current workaround:** [what people are doing today instead]
**Why it's not solved:** [what's missing from existing solutions]

[Repeat for each problem]

---

## Recurring Problems

[Flag any problem that has appeared in a previous week's log]

---

## Open Questions

[Problems that are unclear — worth watching but not yet well-defined]
```

---

## What to Ignore

- Problems that already have excellent solutions — even if the solution is new
- Problems that are interesting technically but have no clear person who would pay to solve them
- Problems that are downstream of a single company's API or platform decision (too fragile to build on)

---

## Notes on Methodology

This is a different kind of research than the daily briefing. It requires slowing down and asking "why" instead of "what." A single Reddit thread where someone describes a daily frustration is often more valuable than a TechCrunch article about a $50M raise.

The goal is to build up, over weeks and months, a personal map of where the pain is concentrated — and where the solutions being built are thin enough that a better one could break through.
