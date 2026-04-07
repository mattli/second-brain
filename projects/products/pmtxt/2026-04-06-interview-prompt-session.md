---
date: 2026-04-06
topic: pmtxt interview — prompt engineering session
status: ready to run
---

# pmtxt Interview — Prompt Engineering Session

Prompt to run before writing any UI code for "The Interview" V1. References:
- Design doc: `projects/products/pmtxt/2026-04-06-pmtxt-interview-design.md`
- Wireframe: `projects/products/pmtxt/2026-04-06-pmtxt-interview-wireframe.html`
- Output target: `projects/products/pmtxt/2026-04-07-pmtxt-interview-prompts.md`

---

## Prompt

I'm planning the prompt engineering work that needs to happen before I start building pmtxt's "The Interview" V1. The design doc is at projects/products/pmtxt/2026-04-06-pmtxt-interview-design.md and the wireframe is at projects/products/pmtxt/2026-04-06-pmtxt-interview-wireframe.html.

Before I write any UI code, I need to draft three prompt artifacts. Help me create a working document at projects/products/pmtxt/2026-04-07-pmtxt-interview-prompts.md that captures all three.

**1. Interview questions (the actual product).**

Draft 10-15 structured questions that cover the eight KB categories from the design doc: customers, competitors, goals, constraints, decisions, revenue-model, market, product-principles. The questions should be conversational, open-ended enough to surface real context but specific enough to ground out in concrete answers. Look at ~/.claude/skills/gstack/office-hours/SKILL.md for inspiration on how G-Stack structures its pushback-driven interview — study the pattern, don't copy. The goal is for a PM to feel like the interview is sharper than they expected, not like a survey.

**2. System prompt for the interviewer agent.**

Draft the system prompt that the interview chat agent uses. It needs to capture:
- The role the agent is playing (an opinionated product strategist conducting a structured interview)
- The pushback logic from the design doc (push back when answers are vague, abstract, category-level, or hypothetical; accept when answers contain a named entity, specific number, or concrete example from direct experience)
- The "max twice per question" pushback limit
- When to move to the next question vs. dig deeper
- The tone — direct but not adversarial, like a smart friend who wants you to think harder
- How the agent should reference the KB sidebar filling up in real-time

**3. Generation prompts for the KB and recommendations.**

Draft two output prompts:
- The KB generation prompt that takes the full interview transcript and produces structured markdown files for each of the eight KB categories. The output should match the format shown in the wireframe's KB Overview screen — depth indicators (empty/sparse/solid/rich), specific gap callouts on sparse categories, etc.
- The recommendations generation prompt that takes the KB and produces 3-5 prioritized feature recommendations with grounded rationale (referencing specific KB entries and customers), an impact assessment, and a copy-pasteable coding agent prompt for each one. Match the format shown in the wireframe's Recommendations screen.

For each of the three artifacts, write a first draft. Don't try to make it perfect — the goal is a working starting point I can iterate on as I test the actual interview with real users. Mark sections as DRAFT so it's clear they're meant to be refined.

Plan first, then execute.
