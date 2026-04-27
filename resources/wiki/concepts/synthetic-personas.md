---
created_at: 2026-04-27
last_updated: 2026-04-27
---

# Synthetic Personas

> TLDR: LLMs prompted to take on personas produce average, not diverse, responses — but evolutionary optimization of persona-generating code can achieve coverage across 82% of possible human attitudes, enabling more realistic synthetic user cohorts.

## Overview

LLMs can simulate user responses to products, policies, or questions — a faster alternative to recruiting real survey participants. The problem: naive persona prompting (e.g., "answer as a Democrat") tends to elicit average, consensus responses rather than the full range of variation a real human population would produce. Google researchers developed a system called Persona Generators that addresses this through evolutionary optimization.

## The Core Problem

When you prompt an LLM to "adopt a persona with these demographics," it tends to reproduce the most probable response for that profile — not the outlier views, the edge cases, or the range of internal variation within a group. Even explicit directives to be diverse don't reliably fix this. The model's training pushes it toward central tendency.

## Persona Generators (Google, 2026)

Davide Paglieri, Logan Cross, and colleagues at Google used AlphaEvolve (an evolutionary algorithm that iteratively improves code using LLMs) to generate code that creates diverse personas — rather than generating the personas themselves directly.

**Why optimize the code, not the personas:** Individual persona prompts can be made diverse through examples or instructions, but you'd need to re-do the work for each new context. By optimizing the *generator* — the code that produces persona prompts — the diversity generalizes to any new topic.

**Method:**
1. Gemini 2.5 Pro generated 30 questionnaires on diverse topics (healthcare, financial literacy, conspiracy theories, etc.). Each questionnaire defined a context, "diversity axes" (e.g., tolerance of risk, trust in institutions), and Likert-scale questions (1=strongly agree to 5=strongly disagree).
2. AlphaEvolve iteratively updated code to produce 25 persona prompts per questionnaire, maximizing six diversity metrics (average pairwise distance between response vectors, population coverage of possible responses, etc.).
3. Gemma 3-27B-IT adopted each persona in turn and answered questionnaires via Concordia (Google's agent-based simulation library). Answers converted to vectors.
4. After 500 iterations across 10 parallel code variants, the best code was selected.

**Results on novel questionnaires:**
- Persona Generators: **82%** coverage of possible responses
- Nemotron Personas (NVIDIA, demographically-sampled dataset): **76%**
- Concordia memory generator (generates persona memories from childhood to adulthood): **46%**

## Applications

**Product research:** Simulate how different user segments will respond to a feature, pricing, or message before running real user tests. One team mentioned using AI personas to pre-test product decisions before users ever touch the product.

**Navigating the PM bottleneck:** Andrew Ng explicitly flags synthetic personas as a potential answer to the product management bottleneck — when you can build quickly but struggle to decide what to build, AI cohorts can give rapid signal about what different user types want. See [AI-Native Product Development](../tools/ai-native-product-development.md).

**Audience expansion:** Organizations trying to reach new demographics can test messaging against synthetic cohorts representing those groups before investing in real outreach.

**Edge case discovery:** Diverse synthetic personas surface fringe opinions and minority views that average-persona prompting systematically misses.

## Limitations and Open Questions

The system covers the *attitudinal* range — how people feel about a topic — but it's less clear how well synthetic personas capture behavioral variation (what people *do* vs. what they *say*). AI personas may still share systematic blind spots from their training data. The approach also requires a well-defined set of diversity axes, which requires human judgment about what dimensions of variation matter for a given topic.

## See Also

- [AI-Native Product Development](../tools/ai-native-product-development.md) — the PM bottleneck that synthetic personas partially address
- [Agentic Engineering](../tools/agentic-engineering.md) — multi-agent simulation patterns

## Sources

- "Big Pharma Bets Big on AI" — Andrew Ng / deeplearning.ai (newsletter, Apr 2026) ([link](https://read.readwise.io/read/01kq881g9mf0dfc4nzk8eyywt1)) — Persona Generators paper, AlphaEvolve method, benchmark results, PM bottleneck connection
