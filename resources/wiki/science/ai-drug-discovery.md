---
created_at: 2026-04-27
last_updated: 2026-04-27
---

# AI Drug Discovery

> TLDR: Generative AI can compress the early drug discovery timeline from 5–6 years to ~18 months by automating target identification and molecule design — but no AI-discovered drug has reached regulatory approval yet.

## Overview

Drug development is one of the hardest problems in science: find a molecule that binds to a specific protein, is absorbed by the body, isn't toxic, and actually helps patients. The traditional process takes 10–15 years and costs $2B+, with roughly 86% of candidates failing to reach approval. Generative AI is being applied to the early stages — target identification and molecule design — with measurable speed improvements.

## How the Pipeline Works (Insilico Medicine)

Insilico Medicine, founded 2014, has built a two-stage AI pipeline covering the earliest phases of drug discovery:

**Stage 1 — Target identification (PandaOmics):** Analyzes biological datasets, published research, patents, clinical trials, and grant applications. Deep learning models rank candidate targets by relevance to a disease, suitability as a drug target, and novelty. For idiopathic pulmonary fibrosis (IPF), PandaOmics identified TNIK — a protein involved in lung scarring — as the top candidate. No prior IPF drug had targeted TNIK.

**Stage 2 — Molecule design (Chemistry42):** ~30 generative models run in parallel to propose candidate molecular structures, each optimized for binding strength, toxicity, solubility, and other properties. Scientists evaluate and refine across multiple rounds.

**Result:** ~80 compounds synthesized and tested before finding a preclinical candidate. In conventional discovery, teams screen 200,000 to 1,000,000 existing compounds before synthesizing and testing hundreds. Time from target identification to preclinical-ready molecule: ~18 months vs. a typical 5–6 years.

This pace held across 20+ Insilico programs between 2021–2024, each synthesizing 60–200 molecules to find a preclinical candidate.

## Clinical Progress

- **Rentosertib** (targets TNIK for IPF): Most advanced AI-discovered drug in the pipeline. Phase 2a results: participants taking the highest dose gained 98.4 mL in forced vital capacity while placebo group declined 20.3 mL. Early but concrete evidence of patient benefit.
- **Garutadustat** (inflammatory bowel disease): Entered Phase 2a in January 2026.
- Insilico has developed 28 candidate drugs, roughly half in clinical trials.

## Industry Landscape

As of mid-2025, a peer-reviewed analysis catalogued 173 AI-enabled drug programs across clinical stages. Despite the volume, no AI-discovered drug has received regulatory approval. Phase 2 failure rates remain high (70% fail to reach Phase 3), including AI-designed drugs from BenevolentAI and Recursion Pharmaceuticals.

**Major deals:**
- Eli Lilly agreed to pay up to $2.75B to Insilico (April 2026): $115M upfront for exclusive rights to undisclosed pre-clinical drugs, with milestone payments tied to development, regulatory, and commercial progress. Third deal between the companies following a 2023 software license and a $100M collaboration in November 2025.

## Where AI Helps (and Doesn't)

AI compresses the *preclinical* stages — target identification and molecule design. The clinical trial pipeline (Phase 1, 2, 3) remains expensive, slow, and uncertain. Whether AI-discovered drugs will clear clinical trials at higher rates than traditionally-discovered drugs remains an open question. The speedup in early discovery doesn't change the fundamental biology of why drugs fail — toxicity, off-target effects, and efficacy in humans that doesn't match animal models.

## Sources

- "Big Pharma Bets Big on AI" — Andrew Ng / deeplearning.ai (newsletter, Apr 2026) ([link](https://read.readwise.io/read/01kq881g9mf0dfc4nzk8eyywt1)) — Eli Lilly/Insilico deal, PandaOmics/Chemistry42 pipeline, Rentosertib Phase 2a results, industry context
