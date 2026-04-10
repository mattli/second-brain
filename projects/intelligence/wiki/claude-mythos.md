---
created_at: 2026-04-09
last_updated: 2026-04-09
---

# Claude Mythos Preview

> TLDR: Anthropic's most capable model as of April 2026 — not released publicly, instead limited to a 40+ company security consortium (Project Glasswing) due to its exceptional ability to find and exploit zero-day vulnerabilities in critical software.

## Overview

Claude Mythos Preview (code-named "Capybara" during development) represents what Anthropic calls a "step change" in AI capabilities. Unlike prior models, Anthropic has withheld public release — providing access only to vetted partners focused on defensive cybersecurity. Anthropic described it as "the starting point for what we think will be an industry change point, or reckoning, with what needs to happen now."

The announcement came alongside Anthropic's revenue milestone: annualized revenue tripled in 2026 to over $30 billion (from $9 billion), driven primarily by Claude's popularity for programming.

## Cybersecurity Capabilities

Claude Mythos Preview demonstrates unprecedented ability to perform autonomous security research:

- Identifies zero-day vulnerabilities unknown even to the software's developers
- Found vulnerabilities triggerable by amateurs with simple prompts
- Claimed to have identified "thousands" of bugs across every major OS and browser
- Found a 27-year-old bug in OpenBSD (a security-focused OS)
- Found a vulnerability in popular video software that automated tools had scanned five million times without finding

Per Jared Kaplan (Anthropic CSO), these capabilities are "not a result of special training" — they're a natural consequence of the model's coding improvements. He predicted similar capabilities would emerge in other labs' models soon.

CrowdStrike CTO Elia Zaitsev: "What once took months now happens in minutes with AI."

## Project Glasswing

The defensive consortium Anthropic launched to get ahead of these risks:

- 40+ technology companies including Apple, Amazon, Microsoft, Google, Cisco, Broadcom, Linux Foundation
- $100 million in Claude usage credits committed by Anthropic
- Focus: finding and patching vulnerabilities in critical software before adversaries exploit them
- Named after the glasswing butterfly, which hides in plain sight — like long-standing vulnerabilities buried in complex code

The fundamental question Project Glasswing is trying to answer: does the old security paradigm of "security through human effort costs" still hold when AI can scan everything autonomously?

## Alignment and Safety

Multiple sources characterized Mythos Preview as unusually well-aligned:

- System card reportedly shows extensive safety work (70K+ word document)
- Multiple independent reviewers called it "the best-aligned model" available
- Anthropic's decision to withhold public release represents its most extreme application of responsible scaling principles to date
- The move echoes OpenAI's 2019 GPT-2 staged release, but with higher urgency

Anthropic occupies a distinctive position: it is simultaneously making billions commercializing AI while drawing public attention to its risks. The company was designated a "supply-chain risk" by the Pentagon in early 2026 (later stayed by a federal judge) for demanding certain limitations on military use.

## Competitive Context

Context from [Dario Amodei](dario-amodei.md): "As the slogan goes, this is the least capable model we'll have access to in the future." The implication is that the security reckoning Mythos Preview represents will only intensify with subsequent releases.

Related: [AI Safety & Interpretability](ai-safety-interpretability.md)

## Sources

- "Anthropic Claims Its New A.I. Model, Mythos, Is a Cybersecurity 'Reckoning'" — Kevin Roose (NYT, Apr 2026) ([link](https://www.nytimes.com/2026/04/07/technology/anthropic-claims-its-new-ai-model-mythos-is-a-cybersecurity-reckoning.html?smid=nytcore-ios-share))
- "Project Glasswing: Securing critical software for the AI era" — Anthropic ([link](https://www.anthropic.com/glasswing))
- "Introducing Project Glasswing: an urgent initiative..." — tweet thread ([link](https://x.com/anthropicai/status/2041578392852517128/?s=12&rw_tt_thread=True))
- "Before limited-releasing Claude Mythos Preview, we investigated..." — tweet thread ([link](https://x.com/jack_w_lindsey/status/2041588505701388648/?s=12&rw_tt_thread=True))
- "Mythos Preview seems to be the best-aligned model out there..." — tweet thread ([link](https://x.com/sleepinyourhat/status/2041584799929004045/?s=12&rw_tt_thread=True))
- System Card: Claude Mythos Preview — Anthropic [Tier C reference: 70K-word PDF, not fully synthesized. Full safety evaluation including benchmark results, red-teaming findings, and responsible scaling assessment.]
- "Assessing Claude Mythos Preview's cybersecurity capabilities" — Anthropic ([link](https://red.anthropic.com/2026/mythos-preview/))
