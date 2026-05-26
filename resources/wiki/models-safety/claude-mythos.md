---
created_at: 2026-04-09
last_updated: 2026-05-26
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
- Claimed to have identified "thousands" of zero-day bugs across every major OS and browser
- Found a 27-year-old remote-crash vulnerability in OpenBSD — triggerable just by connecting to the machine
- Found a 16-year-old vulnerability in FFmpeg in a line of code that automated testing tools had hit five million times without catching
- Autonomously discovered and chained together several Linux kernel vulnerabilities to escalate from ordinary user access to complete machine control
- Nearly all vulnerabilities were found entirely autonomously, without human steering
- Evaluation benchmarks such as CyberGym show a "substantial difference" between Mythos Preview and Claude Opus 4.6

Per Jared Kaplan (Anthropic CSO), these capabilities are "not a result of special training" — they're a natural consequence of the model's coding improvements. He predicted similar capabilities would emerge in other labs' models soon.

CrowdStrike CTO Elia Zaitsev: "What once took months now happens in minutes with AI."

## Project Glasswing

The defensive consortium Anthropic launched to get ahead of these risks:

- 40+ technology companies including Apple, Amazon, Microsoft, Google, Cisco, Broadcom, CrowdStrike, JPMorganChase, Palo Alto Networks, Linux Foundation
- $100 million in Claude usage credits committed by Anthropic
- Additional $2.5M donated to Alpha-Omega and OpenSSF (via Linux Foundation), plus $1.5M to the Apache Software Foundation — enabling open-source maintainers to respond to the changing threat landscape
- Focus areas: local vulnerability detection, black-box testing of binaries, endpoint security, and penetration testing
- Named after the glasswing butterfly, which hides in plain sight — like long-standing vulnerabilities buried in complex code
- Post-credits pricing: $25/$125 per million input/output tokens, available on Claude API, Amazon Bedrock, Vertex AI, and Microsoft Foundry

The fundamental question Project Glasswing is trying to answer: does the old security paradigm of "security through human effort costs" still hold when AI can scan everything autonomously?

### Partner Perspectives

Partners who tested Mythos Preview during the pre-announcement period reported findings consistent with Anthropic's claims. AWS described applying it to critical codebases where it was "already helping strengthen code." Microsoft tested it against CTI-REALM (their open-source security benchmark) and found "substantial improvements compared to previous models." Palo Alto Networks reported it identified "complex vulnerabilities that prior-generation models missed entirely."

The Linux Foundation/OpenSSF framed the significance in equity terms: open-source maintainers — whose software underpins most critical infrastructure — have historically lacked access to serious security tooling. Glasswing could make "AI-augmented security a trusted sidekick for every maintainer, not just those who can afford expensive security teams."

### Forward Commitments

Anthropic committed to publishing a public report within 90 days covering lessons learned, vulnerabilities fixed, and best practices. The collaboration aims to produce recommendations spanning vulnerability disclosure processes, software update processes, open-source supply-chain security, secure-by-design practices, standards for regulated industries, triage automation, and patching automation.

Longer-term, Anthropic envisions an independent third-party body — combining private and public-sector organizations — to house continued work on large-scale AI-driven cybersecurity projects.

## Alignment and Safety

Multiple sources characterized Mythos Preview as unusually well-aligned:

- System card reportedly shows extensive safety work (70K+ word document)
- Multiple independent reviewers called it "the best-aligned model" available
- Anthropic's decision to withhold public release represents its most extreme application of responsible scaling principles to date
- The move echoes OpenAI's 2019 GPT-2 staged release, but with higher urgency
- Anthropic plans to launch new safeguards with an upcoming Claude Opus model, using it as a less-risky testbed to develop and refine controls before deploying Mythos-class models more broadly
- Anthropic has been in ongoing discussions with US government officials about Mythos Preview's offensive and defensive cyber capabilities

Anthropic occupies a distinctive position: it is simultaneously making billions commercializing AI while drawing public attention to its risks. The company was designated a "supply-chain risk" by the Pentagon in early 2026 (later stayed by a federal judge) for demanding certain limitations on military use.

## Competitive Context

Context from [Dario Amodei](../people/dario-amodei.md): "As the slogan goes, this is the least capable model we'll have access to in the future." The implication is that the security reckoning Mythos Preview represents will only intensify with subsequent releases.

Related: [AI Safety & Interpretability](ai-safety-interpretability.md) · [Frontier Models](frontier-models.md)

## Sources

- "Anthropic Claims Its New A.I. Model, Mythos, Is a Cybersecurity 'Reckoning'" — Kevin Roose (NYT, Apr 2026) ([link](https://www.nytimes.com/2026/04/07/technology/anthropic-claims-its-new-ai-model-mythos-is-a-cybersecurity-reckoning.html?smid=nytcore-ios-share))
- "Project Glasswing: Securing critical software for the AI era" — Anthropic ([link](https://www.anthropic.com/glasswing))
- "Introducing Project Glasswing: an urgent initiative..." — tweet thread ([link](https://x.com/anthropicai/status/2041578392852517128/?s=12&rw_tt_thread=True))
- "Before limited-releasing Claude Mythos Preview, we investigated..." — tweet thread ([link](https://x.com/jack_w_lindsey/status/2041588505701388648/?s=12&rw_tt_thread=True))
- "Mythos Preview seems to be the best-aligned model out there..." — tweet thread ([link](https://x.com/sleepinyourhat/status/2041584799929004045/?s=12&rw_tt_thread=True))
- System Card: Claude Mythos Preview — Anthropic [Tier C reference: 70K-word PDF, not fully synthesized. Full safety evaluation including benchmark results, red-teaming findings, and responsible scaling assessment.]
- "Assessing Claude Mythos Preview's cybersecurity capabilities" — Anthropic ([link](https://red.anthropic.com/2026/mythos-preview/))
