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
Popularized the pattern of using LLMs to compile and maintain personal wikis from raw data sources. His own research wiki reached ~100 articles and ~400K words. Uses Obsidian as a viewer, with the LLM handling all writing and maintenance. See [LLM Knowledge Bases](../concepts/llm-knowledge-bases.md).

### File Over App
Strong advocate for storing personal data in universal file formats (markdown, images) rather than proprietary app databases. The argument: files are interoperable, agents can operate on them with Unix tools, and you maintain full ownership. Any AI can plug in (BYOAI).

### Agent Proficiency
Called this a "CORE SKILL of the 21st century." His framing: agents speak English and do the computer stuff for you — the skill is knowing what to point them at and how to structure the inputs. See [Agent Proficiency](../concepts/agent-proficiency.md).

### Idea Files Over Code
Proposed sharing ideas as text files rather than code/apps, since in the agent era, the recipient's agent can customize and build it for their specific needs. Published his LLM wiki concept as a GitHub gist "idea file."

### Autoresearch
New project (March 2026): a framework for AI agents that autonomously experiment with training code overnight on a single GPU. The agent modifies `train.py`, runs 5-minute training experiments, checks if loss improved, and repeats — ~100 experiments per 8-hour sleep cycle. The human edits `program.md` (agent instructions), not the code directly.

Key design choices:
- Fixed 5-minute time budget per experiment — makes results directly comparable regardless of what the agent changes (architecture, batch size, etc.)
- Single file for the agent to modify — keeps scope manageable
- Metric: val_bpb (validation bits per byte), vocab-size-independent for fair architectural comparisons
- "You're not touching any Python files like you normally would as a researcher. Instead, you are programming the Markdown files."

Released on GitHub as `karpathy/autoresearch`. Framed aspirationally in the README intro as the origin story of fully autonomous AI research. See also [Agentic Engineering](../tools/agentic-engineering.md) for related self-improving agent work.

### "The Decade of Agents"
In a Dwarkesh Patel interview (Apr 2026), Karpathy pushed back on "year of agents" framing: "There's some over-prediction going on in the industry. In my mind, this is more accurately described as the decade of agents." Early agents like Claude Code and Codex are "extremely impressive" but still cognitively lacking — no continual learning, insufficient multimodality, unreliable computer use. "It will take about a decade to work through all of those issues."

### "We're Not Building Animals"
Central metaphor from the same interview: LLMs are "ghosts" or "spirits," not animals. "We're not doing training by evolution. We're doing training by imitation of humans and the data that they've put on the Internet. You end up with these ethereal spirit entities because they're fully digital and they're mimicking humans." This is a fundamentally different kind of intelligence — starting from a different point in the space of possible intelligences. But it's "possible to make them a bit more animal-like over time."

On memorization vs. abstraction: LLMs can "regurgitate word-for-word what is the next thing in a Wikipedia page" but their ability to learn abstract concepts quickly (the way a child can) is limited. Humans are "not actually that good at memorization, which is actually a feature" — it forces finding patterns in a more general sense.

On the coding stack: autocomplete is high-bandwidth ("you point to the code where you want it, you type out the first few pieces, and the model will complete it") while typing instructions in English is "too much typing." Different modes work for different parts of the coding workflow. See [Agentic Engineering](../tools/agentic-engineering.md).

## Sources

- "LLM Knowledge Bases" — Andrej Karpathy (tweet, Apr 2, 2026) ([link](https://x.com/karpathy/status/2039805659525644595/?s=12&rw_tt_thread=True))
- "Farzapedia, personal wikipedia of Farza..." — Andrej Karpathy (tweet thread, Apr 4, 2026) ([link](https://x.com/karpathy/status/2040572272944324650/?s=12&rw_tt_thread=True))
- "llm-wiki" — Andrej Karpathy (GitHub gist, Apr 4, 2026; 1,066 stars) ([link](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f))
- "The guy who literally wrote the most popular deep learning..." — Aakash Gupta (commentary, Apr 2026) ([link](https://x.com/aakashgupta/status/2040662476862394592/?s=12&rw_tt_thread=True))
- "karpathy is showing one of the simplest AI architectures..." — JUMPERZ (tweet, Apr 2026) ([link](https://x.com/jumperz/status/2039826228224430323/?rw_tt_thread=True))
- "Andrej Karpathy Shares LLM-Powered Obsidian Knowledge Workflow" — x.com summary ([link](https://x.com/i/trending/2039841987067617664))
- "Stanford CS230 | Autumn 2025 | Lecture 9: Career Advice in AI" — Stanford Online ([link](https://www.youtube.com/watch?v=AuZoDsNmG_s))
- "We're summoning ghosts, not building animals" — Andrej Karpathy / Dwarkesh Patel (video, Apr 2026) ([link](https://www.youtube.com/watch?v=lXUZvyajciY&list=PLd7-bHaQwnthaNDpZ32TtYONGVk95-fhF&index=12))
