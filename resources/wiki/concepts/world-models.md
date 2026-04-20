---
created_at: 2026-04-09
last_updated: 2026-04-20
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

[Andrej Karpathy](../people/andrej-karpathy.md) offers a middle view: LLMs can "regurgitate word-for-word" Wikipedia pages but struggle with abstract concept learning compared to children. Humans' poor memorization is "actually a feature" — it forces pattern-finding at a more general level.

## LeCun's Full Position (Wired Interview)

In a detailed Wired interview (Steven Levy), LeCun laid out his comprehensive stance on AI's trajectory and the open-source imperative:

**On current AI's limits:** "Machine learning is great. But the idea that we're going to just scale up the techniques that we have and get to human-level AI? No. We're missing something big to get machines to learn efficiently, like humans and animals do." LLMs produce fluent text with good style, "but they're boring, and what they come up with can be completely false."

**On AGI:** LeCun rejects the term entirely — "there is no such thing as general intelligence. Intelligence is not a linear thing you can measure." Machines will eventually be smarter than humans ("could be years, could be centuries"), but there's no reason to believe intelligent systems will want to dominate us. "People are mistaken when they imagine that AI systems will have the same motivations as humans."

**Objective-driven AI:** LeCun's current research direction. Build machines with explicit objectives and guardrails as architectural constraints, not post-hoc patches. "Putting drives into AI systems is the only way to make them controllable and safe." No working demonstration exists yet.

**The open-source imperative:** When all interactions with the digital world are mediated by AI, "you do not want that AI system to be controlled by a small number of companies on the West Coast of the US." European governments bought this argument — France, Germany, and Italy blocked EU attempts to regulate open source AI. LeCun personally influenced the French government's position. "Open platforms progress faster. The systems you end up with are more secure and perform better."

**On OpenAI:** "They imagined creating a nonprofit as a counterweight to bad guys like Google and Meta. I said that's wrong. They are no longer open. Meta has always been open and still is." The research world "doesn't care too much about OpenAI anymore, because they're not publishing."

**On AI doom:** LeCun stands firmly against the doomer camp, arguing fear-mongering risks scaring people away from beneficial technology — the same mistake made with the printing press. The way to stay ahead of bad actors: "progress faster. The way to progress faster is to open the research."

**On art and soul:** AI will produce technically superior music, but lacks "the essence of improvised music, which relies on communication of mood and emotion from a human." Truthfulness is essential to the artistic experience — AI-generated art at Charlie Parker's level would be "like Milli Vanilli."

See also: [AGI Definitions](../landscape/agi-definitions.md) for where LeCun's views fit in the broader AGI debate.

## Key Players

- **AMI** (Yann LeCun) — Advanced Machine Intelligence, JEPA-based world models
- **World Labs** (Fei-Fei Li) — Spatial intelligence startup ($230M+ raised). Product: Marble (Gaussian splat environments)
- **Google** — SEMA (Mar 2024), SEMA 2 (Nov 2025), Genie 3 (hyperrealistic interactive worlds)
- **NVIDIA Cosmos** — Open-source world foundation model for data augmentation and downstream training (autonomous vehicles, robots, video agents)

## Relevance

Y Combinator's [2026 RFS](../landscape/yc-ai-thesis.md) explicitly calls out spatial reasoning models as a major opportunity — "unlocking the next wave of AI capability" and potentially defining the next foundation model company on the scale of OpenAI or Anthropic.

## Sources

- "World Models explained in 10min" — Caleb Writes Code (video, Apr 2026) ([link](https://youtube.com/watch?v=ECWC-YlAk1o&si=JtFcOyR1f29mfqpi))
- "How Not to Be Stupid About AI, With Yann LeCun" — Steven Levy / Wired ([link](https://www.wired.com/story/how-not-to-be-stupid-about-ai-with-yann-lecun/))
