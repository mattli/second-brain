---
created_at: 2026-04-09
last_updated: 2026-04-09
---

# AI Safety & Interpretability

> TLDR: The effort to understand and align AI models — what's happening inside them, why they produce certain outputs, and how to ensure they behave as intended as they become more capable. Anthropic has made this a core research focus.

## Overview

As AI models become more capable, understanding their internal mechanisms becomes both more important and more difficult. Two related but distinct problems:

- **Interpretability:** Understanding *how* a model arrives at its outputs — which internal representations and computations produce a given behavior
- **Alignment:** Ensuring models reliably behave in accordance with human intentions and values, especially in novel situations

These are often treated together because interpretability is a key tool for alignment: if you can't see what a model is doing internally, it's hard to verify that it's actually "thinking" about the right things.

## Anthropic's Interpretability Research

Anthropic has invested heavily in mechanistic interpretability — understanding neural networks at the level of individual circuits and features.

High-level findings from public research:
- Models predict the next token by "thinking through" intermediate steps using internal representations of concepts like objects, goals, and relationships
- Individual neurons in transformer models often correspond to multiple concepts (superposition), complicating simple feature extraction
- Circuits within models perform recognizable tasks — induction heads for in-context learning, attention heads for copying, etc.

The goal of this research: make AI less of a black box, enabling better safety guarantees. If you can look inside the model and verify it's using the right features for the right reasons, you can trust it more.

## Why It Matters Now

[Dario Amodei](dario-amodei.md) and Anthropic argue we're at a critical juncture: models are becoming capable enough that their decisions have major real-world consequences, but current interpretability techniques don't scale to full model complexity.

The launch of [Claude Mythos Preview](claude-mythos.md) highlighted this concretely: a model capable enough to find zero-day vulnerabilities in critical infrastructure — which is impressive defensively but dangerous offensively — raises urgent questions about verifying what a model will and won't do.

## Alignment Approaches

Current mainstream techniques:
- **RLHF (Reinforcement Learning from Human Feedback)** — Train models to produce outputs that human raters prefer. Effective but gameable and doesn't guarantee the model is using "right" internal reasoning
- **Constitutional AI (CAI)** — Anthropic's approach: use a set of principles to guide model self-critique and revision during training
- **Scalable oversight** — Techniques to maintain human oversight even when the model's reasoning is too complex for humans to directly evaluate

[Dario Amodei's "Adolescence of Technology" essay](dario-amodei.md) argues current training methods are insufficient and we need substantially better alignment techniques before capabilities advance further.

## OpenAI's Safety Mission Controversy

A major New Yorker investigation (Ronan Farrow & Andrew Marantz, Apr 2026) documented allegations that OpenAI has departed from its founding safety mission:

- **The founding premise:** OpenAI was established as a nonprofit whose board had a duty to prioritize the safety of humanity over company success. Accepted charitable donations; employees took pay cuts for the mission.
- **The internal memos:** In 2023, chief scientist Ilya Sutskever compiled ~70 pages of memos about CEO Sam Altman alleging a "consistent pattern of lying." Separately, [Dario Amodei](dario-amodei.md) (who left to co-found Anthropic) kept years of private notes; 200+ pages of related documents circulated in Silicon Valley.
- **Safety commitments abandoned:** Several safety-related teams dissolved. Future of Life Institute gave OpenAI an F on existential safety (Anthropic got a D, Google DeepMind got a D-).
- **Nonprofit → for-profit:** Internal records show founders had private doubts about the nonprofit structure as early as 2017. OpenAI has since recapitalized as a for-profit entity.
- **The stakes:** AI is already deployed in military operations; researchers have documented its power to rapidly identify chemical warfare agents; OpenAI faces seven wrongful-death lawsuits.

The piece raises broader questions about whether the AI industry's current anti-regulation trajectory is prudent, and whether safety-focused governance structures can survive commercial pressures.

## Sources

- "Interpretability: Understanding how AI models think" — Anthropic (video, Apr 2026)
- "The Adolescence of Technology" — Dario Amodei (darioamodei.com)
- "Before limited-releasing Claude Mythos Preview, we investigated its internal mechanisms..." — tweet thread
- "Sam Altman May Control Our Future—Can He Be Trusted?" — Ronan Farrow & Andrew Marantz (The New Yorker, Apr 2026)
- "(🧵1/11) For the past year and a half, I've been investigating OpenAI..." — Ronan Farrow (tweet thread, Apr 2026)
