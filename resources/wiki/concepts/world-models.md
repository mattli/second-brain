---
created_at: 2026-04-09
last_updated: 2026-06-11
---

# World Models

> TLDR: An alternative AI paradigm to LLMs — models that simulate the physical world internally rather than predicting text tokens. Relevant to robotics, autonomous vehicles, video generation, and spatial reasoning. Key players: Yann LeCun/AMI, World Labs (Fei-Fei Li), Google (SEMA/Genie), NVIDIA (Cosmos). Sutton argues world models are necessary but insufficient — true discovery also requires evaluation and selective retention (the RL loop).

## Overview

World models approach intelligence differently from LLMs. Instead of training on text tokens (the "highest abstraction that describes the physical world"), world models are trained to simulate physical environments internally — learning cause-and-effect, spatial relationships, and physics.

The original architecture (David Ha, 2018) uses three components:
1. **Vision model** — Observes the environment via variational autoencoder, compresses visual input to latent space
2. **MDN-RNN** — Processes compressed observations, stores hidden states for temporal prediction
3. **Controller** — Samples from both components to produce actions

The key claim: this modeling approach is closer to how humans develop understanding and may get closer to AGI than pure language models.

## A Functional Taxonomy

"World model" is one of the most overloaded terms in AI. Computer vision, robotics, reinforcement learning, and generative AI each claim to be building world models — and each means something different. A video model producing gorgeous but physically impossible flames, a language model improvising a playable game, and a physics engine faithfully simulating combustion all go by the same name.

Fei-Fei Li and the World Labs team cut through this by returning to the formal structure underneath: the partially observable Markov decision process (POMDP). The loop works as follows:

1. An **agent** (person, robot, or software system) takes **actions**
2. Actions affect the **state** of the world — a complete description of what is happening at a given moment (every object, position, velocity, property)
3. The agent never sees state directly; it receives **observations** — photons on a retina, sensor readings, pixels in a frame
4. Observations inform new actions, and the loop continues

State is the underlying reality; observations are an agent's partial view of it. This distinction matters: where language models learn the statistical structure of text, world models learn the statistical structure of space and time — how light falls on a surface, how a scene looks from an unseen angle, how objects respond to force.

The key insight of the taxonomy is that the different things now called "world models" are in fact **different projections of this same loop**. Each one outputs a different piece of it — some predict observations (video generators), some predict state transitions (physics engines), some plan actions (RL agents). Recognizing which piece a system actually models clarifies what it can and cannot do.

The term's lineage predates deep learning entirely. Kenneth Craik proposed in 1943 that minds reason by running "small-scale models" of reality, and the idea was carried into neural networks by the late 1980s. The POMDP formalization (canonical in Sutton and Barto's RL textbook) gave "world model" its modern technical meaning.

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

## Sutton's Discovery Framework: Why World Models Aren't Enough Either

Rich Sutton argues that the limitation of generative AI goes deeper than the text-vs-spatial divide. Even world models, when trained via supervised learning, share the same fundamental gap: they can produce output that is novel *or* good, but never both simultaneously. Novel output comes from stochastic variation; good output comes from training data. The two sources don't interact at runtime.

True creativity and discovery require three steps operating together:

1. **Variation** — generating candidates (partly informed, partly blind)
2. **Evaluation** — judging candidates against a clear objective
3. **Selective retention** — keeping only what works

Generative AI has variation (stochastic sampling) but lacks runtime evaluation. Without evaluation there can be no selective retention, and "the novelty flickers into existence, but if its value is unrecognized, then it flickers away and is lost." This applies equally to language models, image generators, and supervised world models.

The systems that *have* achieved genuine discovery — AlphaGo's move 37, AlphaZero's chess style, AlphaFold's protein structures, AlphaProof's mathematical advances — all include the evaluation step, typically via reinforcement learning or search against an explicit objective. Sutton traces the pattern to evolution (natural selection), the scientific method, and operant conditioning — all instances of the same generate-evaluate-retain loop.

Sutton explicitly includes world modeling in the insufficient category: "creativity and discovery are more than what can be done by supervised learning. More than what can be done by pattern recognition or prediction, even more than what can be done with world modeling." The implication is that world models are a necessary component (better representations enable better variation) but not sufficient without the discovery loop on top.

This reframes the LLM-vs-world-models debate. LeCun argues world models are the missing piece; Sutton argues that *evaluation against objectives* is the missing piece, and that neither LLMs nor world models provide it on their own. The two views are complementary — world models give richer representations of the environment, while RL and search provide the evaluation loop that turns those representations into discovery.

## Open vs. Closed Models: The Mid-2026 Landscape

Nathan Lambert (Apr 2026) published 13 beliefs on the open vs. closed model dynamic, extending the debate LeCun framed around open-source AI:

**The surprise:** Closed models did *not* show a growing capability margin over open models through 2025-2026. Many expected the gap to widen as scaling laws kicked in. Instead, open models kept pace on benchmarks — though with important caveats.

**Key beliefs:**
1. Closed models are more robust and generally useful than benchmarks suggest — they handle edge cases, long-context, and multi-step reasoning more reliably
2. Economics will matter more than capabilities long-term — whoever can serve tokens cheapest wins the commodity layer
3. Chinese labs (DeepSeek, Qwen) may face funding difficulties as the geopolitical situation tightens and domestic capital reallocates
4. The RL (reinforcement learning) era favors closed labs — RL training requires massive compute and proprietary reward signals that open efforts struggle to replicate
5. Local agents running on consumer hardware are a "dark matter market" for open models — usage is real but doesn't show up in API revenue or benchmarks
6. Open model progress is increasingly driven by distillation from closed models, which creates a dependency that could become a vulnerability
7. The best open models in 2026 are fine-tunes of base models from 2-3 labs (Meta, Mistral, sometimes Alibaba) — the open ecosystem is less diverse than it appears

**Connection to LeCun's position:** LeCun argues open-source AI is essential for democratic control. Lambert's data suggests open models are viable but increasingly dependent on closed-model innovations trickling down — a tension that may test the open-source imperative as the RL era deepens.

## Key Players

- **AMI** (Yann LeCun) — Advanced Machine Intelligence, JEPA-based world models
- **World Labs** (Fei-Fei Li) — Spatial intelligence startup ($230M+ raised). Product: Marble (Gaussian splat environments). Li's functional taxonomy grounds the field in the POMDP loop, classifying systems by which piece of the agent–state–observation cycle they model
- **Google** — SEMA (Mar 2024), SEMA 2 (Nov 2025), Genie 3 (hyperrealistic interactive worlds)
- **NVIDIA Cosmos** — Open-source world foundation model for data augmentation and downstream training (autonomous vehicles, robots, video agents)

## Relevance

Y Combinator's [2026 RFS](../landscape/yc-ai-thesis.md) explicitly calls out spatial reasoning models as a major opportunity — "unlocking the next wave of AI capability" and potentially defining the next foundation model company on the scale of OpenAI or Anthropic.

## See Also

- [Physical AI](physical-ai.md) — the five shared technical primitives (perception, planning, control, simulation, hardware) converging across robotics, autonomous science, and new interfaces

## Sources

- "World Models explained in 10min" — Caleb Writes Code (video, Apr 2026) ([link](https://youtube.com/watch?v=ECWC-YlAk1o&si=JtFcOyR1f29mfqpi))
- "How Not to Be Stupid About AI, With Yann LeCun" — Steven Levy / Wired ([link](https://www.wired.com/story/how-not-to-be-stupid-about-ai-with-yann-lecun/))
- "My bets on open models, mid-2026" — Nathan Lambert (Apr 2026) ([link](https://www.interconnects.ai/p/my-bets-on-open-models-mid-2026))
- "A Functional Taxonomy of World Models" — Fei-Fei Li / World Labs (2026) ([link](https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models)) — POMDP-based framework classifying world models by which piece of the agent–action–state–observation loop they output
- "AI creativity & discovery" — Rich Sutton (video, 2026) — Variation/evaluation/retention framework; argues world models (and all supervised learning) lack the evaluation step needed for true discovery
