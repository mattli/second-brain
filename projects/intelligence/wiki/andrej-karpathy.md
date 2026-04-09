---
created_at: 2026-04-05
last_updated: 2026-04-09
---

# Andrej Karpathy

> TLDR: AI researcher and educator whose recent focus has shifted from model internals to knowledge management — advocating for LLM-compiled personal wikis, file-over-app data ownership, and agent proficiency as core skills.

## Overview

Former Tesla AI director and OpenAI founding member. Created some of the most influential deep learning educational content (cs231n, the "Neural Networks: Zero to Hero" series). Known for going deep on fundamentals and sharing practical, opinionated takes.

## Recent Thinking (2026)

Karpathy's focus has visibly shifted from model architecture to **how people use AI agents effectively**. Key themes:

### LLM Knowledge Bases
Popularized the pattern of using LLMs to compile and maintain personal wikis from raw data sources. His own research wiki reached ~100 articles and ~400K words. Uses Obsidian as a viewer, with the LLM handling all writing and maintenance. See [LLM Knowledge Bases](llm-knowledge-bases.md).

### File Over App
Strong advocate for storing personal data in universal file formats (markdown, images) rather than proprietary app databases. The argument: files are interoperable, agents can operate on them with Unix tools, and you maintain full ownership. Any AI can plug in (BYOAI).

### Agent Proficiency
Called this a "CORE SKILL of the 21st century." His framing: agents speak English and do the computer stuff for you — the skill is knowing what to point them at and how to structure the inputs. See [Agent Proficiency](agent-proficiency.md).

### Idea Files Over Code
Proposed sharing ideas as text files rather than code/apps, since in the agent era, the recipient's agent can customize and build it for their specific needs. Published his LLM wiki concept as a GitHub gist "idea file."

### Autoresearch
New project (March 2026): a framework for AI agents that autonomously experiment with training code overnight on a single GPU. The agent modifies `train.py`, runs 5-minute training experiments, checks if loss improved, and repeats — ~100 experiments per 8-hour sleep cycle. The human edits `program.md` (agent instructions), not the code directly.

Key design choices:
- Fixed 5-minute time budget per experiment — makes results directly comparable regardless of what the agent changes (architecture, batch size, etc.)
- Single file for the agent to modify — keeps scope manageable
- Metric: val_bpb (validation bits per byte), vocab-size-independent for fair architectural comparisons
- "You're not touching any Python files like you normally would as a researcher. Instead, you are programming the Markdown files."

Released on GitHub as `karpathy/autoresearch`. Framed aspirationally in the README intro as the origin story of fully autonomous AI research. See also [Agentic Engineering](agentic-engineering.md) for related self-improving agent work.

## Sources

- "LLM Knowledge Bases" — Andrej Karpathy (tweet, Apr 2, 2026)
- "Farzapedia, personal wikipedia of Farza..." — Andrej Karpathy (tweet thread, Apr 4, 2026)
- "llm-wiki" — Andrej Karpathy (GitHub gist, Apr 4, 2026; 1,066 stars)
- "The guy who literally wrote the most popular deep learning..." — Aakash Gupta (commentary, Apr 2026)
- "karpathy is showing one of the simplest AI architectures..." — JUMPERZ (tweet, Apr 2026)
- "Andrej Karpathy Shares LLM-Powered Obsidian Knowledge Workflow" — x.com summary
- "Stanford CS230 | Autumn 2025 | Lecture 9: Career Advice in AI" — Stanford Online
