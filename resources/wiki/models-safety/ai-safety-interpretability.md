---
created_at: 2026-04-09
last_updated: 2026-04-20
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

[Dario Amodei](../people/dario-amodei.md) and Anthropic argue we're at a critical juncture: models are becoming capable enough that their decisions have major real-world consequences, but current interpretability techniques don't scale to full model complexity.

The launch of [Claude Mythos Preview](claude-mythos.md) highlighted this concretely: a model capable enough to find zero-day vulnerabilities in critical infrastructure — which is impressive defensively but dangerous offensively — raises urgent questions about verifying what a model will and won't do.

## Alignment Approaches

Current mainstream techniques:
- **RLHF (Reinforcement Learning from Human Feedback)** — Train models to produce outputs that human raters prefer. Effective but gameable and doesn't guarantee the model is using "right" internal reasoning
- **Constitutional AI (CAI)** — Anthropic's approach: use a set of principles to guide model self-critique and revision during training
- **Scalable oversight** — Techniques to maintain human oversight even when the model's reasoning is too complex for humans to directly evaluate

[Dario Amodei's "Adolescence of Technology" essay](../people/dario-amodei.md) argues current training methods are insufficient and we need substantially better alignment techniques before capabilities advance further.

## OpenAI's Safety Mission Controversy

A major New Yorker investigation (Ronan Farrow & Andrew Marantz, Apr 2026) documented allegations that OpenAI has departed from its founding safety mission:

- **The founding premise:** OpenAI was established as a nonprofit whose board had a duty to prioritize the safety of humanity over company success. Accepted charitable donations; employees took pay cuts for the mission.
- **The internal memos:** In 2023, chief scientist Ilya Sutskever compiled ~70 pages of memos about CEO Sam Altman alleging a "consistent pattern of lying." Separately, [Dario Amodei](../people/dario-amodei.md) (who left to co-found Anthropic) kept years of private notes; 200+ pages of related documents circulated in Silicon Valley.
- **Safety commitments abandoned:** Several safety-related teams dissolved. Future of Life Institute gave OpenAI an F on existential safety (Anthropic got a D, Google DeepMind got a D-).
- **Nonprofit → for-profit:** Internal records show founders had private doubts about the nonprofit structure as early as 2017. OpenAI has since recapitalized as a for-profit entity.
- **The stakes:** AI is already deployed in military operations; researchers have documented its power to rapidly identify chemical warfare agents; OpenAI faces seven wrongful-death lawsuits.

The piece raises broader questions about whether the AI industry's current anti-regulation trajectory is prudent, and whether safety-focused governance structures can survive commercial pressures.

## AI Safety Fieldbuilding (80,000 Hours)

80,000 Hours makes the case that **fieldbuilding** — recruiting, training, and creating infrastructure for AI safety talent — is one of the most impactful and most neglected career paths for reducing catastrophic AI risk.

**The growth story:** From a few dozen full-time AI safety workers in 2017 to over 1,000 by 2025 — a 3,000% increase. Much of this growth came from active fieldbuilding, not just organic interest. Over 60% of people in the field cited a specific fieldbuilding project as one of the most important factors in their career choice (Coefficient Giving survey).

**Why it's high-leverage:** An hour of good fieldbuilding can enable many hours of direct work. BlueDot Impact (7-person team) has reached 7,000+ people, with nearly 1,000 now in full-time AI safety roles. Even at a conservative 10% attribution rate, that's ~100 careers per 7 staff.

**The neglect problem:** Leaders across the field broadly agree that (1) fieldbuilding is among the most impactful work in AI safety, (2) many people in direct roles should instead be fieldbuilding, and (3) it's very hard to hire good fieldbuilders because qualified people don't apply. Example: IAPS drew thousands of applications for a policy fellowship but only a handful for the role *running* the fellowship.

**The numbers gap:** ~2,000 AI safety research fellows will be trained in 2026, but only ~300 non-research fellows. The field has a severe generalist talent shortage.

**What fieldbuilders do:** Curriculum design, mentorship matching, researcher management, event planning, grantmaking, public communications. Key organizations: BlueDot Impact, MATS, GovAI, Tarbell Fellowship, Kairos, Constellation, 80,000 Hours.

**Skills that fit:** Versatility ("if you think you'd be good at almost anything, do fieldbuilding"), technical fluency (not expertise), mentorship ability, social intelligence, and genuine passion for the mission. The career offers fast progression, strong networking, and skills that are hard to automate.

**Tradeoffs:** Weaker career capital outside AI safety, no clear career pipeline, lower median pay than technical roles. But the multiplier effect — enabling 10+ careers through your work — can outweigh direct contribution.

**Potential downsides:** Risk of encouraging less impactful paths, giving bad impressions that discourage capable people, or speeding AI progress by highlighting its economic potential. But these outcomes appear significantly rarer than positive ones.

## Sources

- "Interpretability: Understanding how AI models think" — Anthropic (video, Apr 2026) ([link](https://www.youtube.com/watch?v=fGKNUvivvnc))
- "The Adolescence of Technology" — Dario Amodei (darioamodei.com) ([link](https://darioamodei.com/essay/the-adolescence-of-technology))
- "Before limited-releasing Claude Mythos Preview, we investigated its internal mechanisms..." — tweet thread ([link](https://x.com/jack_w_lindsey/status/2041588505701388648/?s=12&rw_tt_thread=True))
- "Sam Altman May Control Our Future—Can He Be Trusted?" — Ronan Farrow & Andrew Marantz (The New Yorker, Apr 2026) ([link](https://www.newyorker.com/magazine/2026/04/13/sam-altman-may-control-our-future-can-he-be-trusted))
- "(🧵1/11) For the past year and a half, I've been investigating OpenAI..." — Ronan Farrow (tweet thread, Apr 2026) ([link](https://x.com/RonanFarrow/status/2041213917611856067/?rw_tt_thread=True))
- "Building the field of AI safety" — Aaron Gertler / 80,000 Hours (Apr 2026) ([link](https://80000hours.org/career-reviews/ai-safety-fieldbuilding/))
