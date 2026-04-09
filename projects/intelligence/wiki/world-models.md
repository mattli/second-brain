---
created_at: 2026-04-09
last_updated: 2026-04-09
---

# World Models

> TLDR: An alternative AI paradigm to LLMs — models that simulate the physical world internally rather than predicting text tokens. Relevant to robotics, autonomous vehicles, video generation, and spatial reasoning. Key players: Yann LeCun/AMI, World Labs (Fei-Fei Li), Google (SEMA/Genie), NVIDIA (Cosmos).

## Overview

World models approach intelligence differently from LLMs. Instead of training on text tokens (the "highest abstraction that describes the physical world"), world models are trained to simulate physical environments internally — learning cause-and-effect, spatial relationships, and physics.

The original architecture (David Ha, 2018) uses three components:
1. **Vision model** — Observes the environment via variational autoencoder, compresses visual input to latent space
2. **MDN-RNN** — Processes compressed observations, stores hidden states for temporal prediction
3. **Controller** — Samples from both components to produce actions

The key claim: this modeling approach is closer to how humans develop understanding and may get closer to AGI than pure language models.

## The LLM vs. World Models Debate

Yann LeCun (who left Meta to start AMI, seeking ~$5B valuation) argues LLMs "don't understand the physical world beyond auto-regressive token prediction." But this view has nuances:

- Language contains more information about the physical world than the pure critique suggests — grammar, figures of speech, and word categories all encode physical world facts
- Multimodal LLMs (GPT-4, Gemini) blur the boundary by adding vision capabilities via cross-attention
- Vision-Language-Action (VLA) models combine vision transformers with LLMs to create action tokens — powering systems like the Neo humanoid robot

[Andrej Karpathy](andrej-karpathy.md) offers a middle view: LLMs can "regurgitate word-for-word" Wikipedia pages but struggle with abstract concept learning compared to children. Humans' poor memorization is "actually a feature" — it forces pattern-finding at a more general level.

## Key Players

- **AMI** (Yann LeCun) — Advanced Machine Intelligence, JEPA-based world models
- **World Labs** (Fei-Fei Li) — Spatial intelligence startup ($230M+ raised). Product: Marble (Gaussian splat environments)
- **Google** — SEMA (Mar 2024), SEMA 2 (Nov 2025), Genie 3 (hyperrealistic interactive worlds)
- **NVIDIA Cosmos** — Open-source world foundation model for data augmentation and downstream training (autonomous vehicles, robots, video agents)

## Relevance

Y Combinator's [2026 RFS](yc-ai-thesis.md) explicitly calls out spatial reasoning models as a major opportunity — "unlocking the next wave of AI capability" and potentially defining the next foundation model company on the scale of OpenAI or Anthropic.

## Sources

- "World Models explained in 10min" — Caleb Writes Code (video, Apr 2026)
