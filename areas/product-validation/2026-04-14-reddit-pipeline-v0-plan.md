# Reddit Product Validation Pipeline — V0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the smallest possible thing that validates a product hypothesis against Reddit, so we can learn what the findings actually look like before committing to a bigger architecture.

**Architecture:** A Claude Code skill (`product-validation`) plus one small Python helper that wraps `lib/reddit.py` search. Claude does query generation, classification, and findings writeup at inference time — same shape as the product-briefing agent. No dataclasses, no batching, no classifier code.

**Tech Stack:** Claude Code skill (markdown), one Python helper (~40 lines) importing from the last30days plugin (v2.9.5).

**Spec:** `~/second-brain/projects/product-validation/2026-04-14-reddit-pipeline-design.md`
**V1 plan (fallback, not this):** `~/second-brain/projects/product-validation/2026-04-14-reddit-pipeline-implementation-plan.md`

**Relationship to V1:** V0 is "Claude does the thinking, one small tool searches Reddit." V1 is "four Python components with deterministic batching." Ship V0 first. Build V1 only if V0 actually falls over (slow, inconsistent, hits context ceiling) — and when that happens, we'll know *why* and can build the V1 pieces that matter.

---

## File Structure

```
~/.claude/skills/product-validation/
├── SKILL.md              # All the pipeline instructions (Claude reads this, does the work)
└── reddit_search.py      # One small helper: wraps last30days lib/reddit.py, returns JSON
```

Two files. That's the whole thing.

---

## Task 1: Reddit search helper

**Files:**
- Create: `~/.claude/skills/product-validation/reddit_search.py`

- [ ] **Step 1.1: Create directory**

```bash
mkdir -p ~/.claude/skills/product-validation
```

- [ ] **Step 1.2: Inspect last30days reddit.py for the search function**

```bash
grep -nE "^def |^class " ~/.claude/plugins/marketplaces/last30days-skill/scripts/lib/reddit.py | head -20
```

Record the public search function name (likely `search_reddit_items` or similar) and its signature. Use it in Step 1.3.

- [ ] **Step 1.3: Write the helper**

Create `~/.claude/skills/product-validation/reddit_search.py`:

```python
#!/usr/bin/env python3
"""Minimal wrapper around last30days lib/reddit.py search.

Usage:
    python3 reddit_search.py "<query>" "<subreddit>" [--limit N]

Writes a JSON array of post dicts to stdout. Each post has id, title,
selftext, author, subreddit, permalink, created_utc, score, num_comments.
"""

import argparse
import json
import sys
from pathlib import Path

LAST30DAYS_SCRIPTS = (
    Path.home()
    / ".claude"
    / "plugins"
    / "marketplaces"
    / "last30days-skill"
    / "scripts"
)
sys.path.insert(0, str(LAST30DAYS_SCRIPTS))

# NOTE: substitute the real function name discovered in Step 1.2 if it differs.
from lib import reddit  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("subreddit", help="Without r/ prefix")
    parser.add_argument("--limit", type=int, default=15)
    args = parser.parse_args()

    results = reddit.search_reddit_items(
        query=args.query,
        subreddit=args.subreddit,
        limit=args.limit,
    )

    # Normalize to a consistent shape
    output = []
    for p in results:
        sub = p.get("subreddit", args.subreddit)
        if not sub.startswith("r/"):
            sub = f"r/{sub}"
        permalink = p.get("permalink", "")
        if permalink.startswith("/"):
            permalink = f"https://reddit.com{permalink}"
        output.append({
            "id": p.get("id"),
            "title": p.get("title", ""),
            "selftext": p.get("selftext", ""),
            "author": p.get("author", "[unknown]"),
            "subreddit": sub,
            "permalink": permalink,
            "created_utc": p.get("created_utc"),
            "score": p.get("score", 0),
            "num_comments": p.get("num_comments", 0),
            "upvote_ratio": p.get("upvote_ratio"),
        })

    print(json.dumps(output, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 1.4: Smoke-test the helper**

```bash
cd ~/.claude/skills/product-validation
SCRAPECREATORS_API_KEY=$SCRAPECREATORS_API_KEY python3 reddit_search.py "readwise highlights" "Readwise" --limit 3
```

Expected: a JSON array with up to 3 post objects from r/Readwise. If auth errors, verify `SCRAPECREATORS_API_KEY` is set.

If the function name from Step 1.2 differs from `search_reddit_items`, update the import call in `reddit_search.py` and retry.

- [ ] **Step 1.5: Commit**

```bash
cd ~/second-brain
git add projects/product-validation/
# (The skill directory isn't in the vault repo; it's under ~/.claude. Skip vault commit for the skill files.)
```

The skill lives at `~/.claude/skills/product-validation/`, which is outside the vault. Decide with the user whether to keep this directory under a separate git repo, or leave it uncommitted (Claude Code skills are often not version-controlled separately). Default: leave uncommitted for now.

---

## Task 2: SKILL.md with full pipeline instructions

**Files:**
- Create: `~/.claude/skills/product-validation/SKILL.md`

- [ ] **Step 2.1: Write the SKILL.md**

Create `~/.claude/skills/product-validation/SKILL.md`:

```markdown
---
name: product-validation
description: Validate a product hypothesis against Reddit. Reads product-validation.md from a product folder, searches target subreddits for pain evidence, writes findings back as a dated markdown file. Use when the user has a product-validation.md and wants to find Reddit evidence, pain quotes, existing-solution mentions, or power-user candidates.
---

# product-validation

Reddit-first product-validation pipeline. Reads a `product-validation.md` doc from a product folder, searches target subreddits for evidence that supports or challenges the hypothesis, and writes findings back to the same folder.

## When to use

- The user has a `product-validation.md` for a product and wants Reddit research against it.
- The user says "validate <product>" or "run product-validation on <product>" or similar.

## Prerequisites

- `ANTHROPIC_API_KEY` set (for your own LLM work).
- `SCRAPECREATORS_API_KEY` set (for Reddit search via the helper).
- `last30days` plugin installed at `~/.claude/plugins/marketplaces/last30days-skill/` (v2.9.5).

## Steps

### 1. Read the validation doc

Find `product-validation.md` in the product folder (usually `~/second-brain/projects/products/<name>/`). Read it.

Extract these fields (some may be implicit):
- **Problem statement** — what pain you're validating. Required.
- **Target subreddits** — listed in the doc. Required.
- **Existing solutions** — tools/products mentioned as current attempts. Optional.
- **Power-user signals** — what makes someone worth approaching. Optional.
- **Success criteria** — what a valuable finding looks like. Optional.

If the doc lacks a problem statement or target subreddits, stop and tell the user what's missing.

Print a one-line coverage summary: "Extracted: problem ✓, subreddits ✓ (4), existing solutions ✓ (3), power-user signals ✓". This helps the user notice if they forgot something.

### 2. Generate search queries

Draft 8–12 search queries covering:

- 2–3 literal restatements of the problem (different wordings)
- 2–3 queries in the language a frustrated user would actually type (not formal framing — think "kindle highlights backlog" not "highlight retention difficulties")
- 1–2 queries pairing the problem with named existing solutions (e.g., "Ghostreader limitations")
- 1–2 queries about workarounds or alternatives people try

Print the list. The user can see what you're searching for.

### 3. Search Reddit

For each query × each target subreddit, run:

```bash
python3 ~/.claude/skills/product-validation/reddit_search.py "<query>" "<subreddit-without-r/-prefix>" --limit 15
```

Collect results. Dedupe by post ID across queries. Keep track of which query hit each post.

**Optional adjacent-subreddit discovery:** If any subreddit *not* in the target list appears 2+ times across results, run a subset of your queries (~3) against it too. Note the hit rate so the user can add it to their doc later.

**Skip comment enrichment for V0.** If pain evidence turns out to be hiding in comments and the posts aren't enough signal, that's a learning that motivates V1.

### 4. Classify each candidate

For each post, judge it against the hypothesis:

- **Score 0** — irrelevant
- **Score 1** — tangential; weak signal
- **Score 2** — relevant pain evidence, useful
- **Score 3** — strong match, quotable

For each scored-2-or-higher candidate, note:
- `evidence_quote`: the most relevant verbatim substring
- `pain_category`: drowning_in_saves, existing_solution_gap, related_pain, etc.
- `mentions_existing_solution`: if a named tool from the doc appears
- `power_user_signal`: true if the author shows signs of matching the power-user signals

Drop posts scored below 2.

**Sanity check:** if fewer than 5 posts survive, the classifier is probably too strict. Lower the bar to 1 and try again. Tell the user you did this.

### 5. Write findings

Write `product-validation-findings-YYYY-MM-DD.md` in the product folder. Format:

```markdown
# Reddit Validation Findings — YYYY-MM-DD

**Hypothesis:** <problem statement>

## Coverage

- Queries generated: N
  - <query 1>
  - <query 2>
  ...
- Target subreddits searched: r/X, r/Y
- Adjacent subreddits tried: r/Z (N hits)
- Candidates retrieved: N → passed classifier: M

## Pain Evidence

### Score 3 — r/X — u/author

> <verbatim quote>

**Context:** post, N upvotes, M comments. Hit by query: "<query>".
**Reasoning:** <one sentence why this scored 3>
[View on Reddit](<permalink>)

...

## Existing Solutions Mentioned

- **<Tool>** (N mentions) — <one-line gist of sentiment>
...

## Power User Candidates

### u/author — r/X

> <their best quote>

[Profile activity](https://reddit.com/user/<author>)
...
```

### 6. Report to the user

Print:
- Output file path
- Count of findings by score (e.g., "3 at score 3, 8 at score 2")
- Number of power-user candidates
- Top 3 findings inline, quoted, with subreddit and permalink

Do not interpret findings beyond that. The user will read the doc.

## Notes

- **All LLM work happens in this conversation.** Query generation, classification, synthesis — you do it at inference time. No scripts, no batching.
- **The only external tool is `reddit_search.py`.** One call per query × subreddit.
- **Temperature:** set to 0 when you need determinism (you don't really, but don't hallucinate quotes).
- **If you can't find ANY signal:** still write the findings doc with the coverage section. Empty findings are a valid result — they tell the user the doc's framing might be off.

## Troubleshooting

- **Helper auth error** — `SCRAPECREATORS_API_KEY` not set.
- **Helper returns zero posts for everything** — the query phrasing might be too niche. Try broader queries.
- **Everything scores 0-1** — the hypothesis may be framed more narrowly than how people actually talk. Note this in the findings and ask the user if they want to broaden the doc.
```

- [ ] **Step 2.2: No test to write.** The skill is a prompt. Validation happens in Task 3 (end-to-end run).

- [ ] **Step 2.3: Commit** (if the skill directory is under git; otherwise skip)

---

## Task 3: End-to-end run against voice-tutor

**Files:**
- No new files. Run the skill on a real doc.

- [ ] **Step 3.1: Invoke the skill in a fresh Claude Code session**

```
/validate voice-tutor
```

Or if that pattern isn't auto-discovered:

```
Run the product-validation skill on ~/second-brain/projects/products/voice-tutor/
```

Expected flow:
- Claude reads voice-tutor's product-validation.md
- Claude prints coverage, queries, search progress
- Claude classifies each post inline
- Claude writes `product-validation-findings-YYYY-MM-DD.md` to the voice-tutor folder
- Claude reports top findings

- [ ] **Step 3.2: Review the findings**

Open the output file. Check:

1. **Queries generated** — are they reasonable? Did Claude find the actual vocabulary (not just the doc's formal framing)?
2. **Pain Evidence** — do the quotes actually match the hypothesis? Any obvious false positives?
3. **Existing Solutions Mentioned** — did Ghostreader or Snipd come up? (They should if r/Readwise was searched.)
4. **Power User Candidates** — at least one actionable lead?
5. **Coverage** — any subreddit return zero results? That might signal the wrong subreddit, not an empty topic.

Write down what worked and what didn't in notes. That list is the input to V1 — if you ever build it.

- [ ] **Step 3.3: Commit the findings doc to the vault**

```bash
cd ~/second-brain
git add projects/products/voice-tutor/product-validation-findings-*.md
git commit -m "Add first Reddit validation run for voice-tutor (V0)"
```

- [ ] **Step 3.4: Update the project README**

Create `~/second-brain/projects/product-validation/README.md`:

```markdown
# Product Validation Pipeline

Claude Code skill for validating product hypotheses against Reddit.

## Status

V0 shipped YYYY-MM-DD. Skill-based (Claude does the thinking), Reddit-only.

## Usage

Invoke the skill in Claude Code with the path to a product folder containing `product-validation.md`.

## Files

- `~/.claude/skills/product-validation/` — skill code (SKILL.md + reddit_search.py)
- `2026-04-14-reddit-pipeline-design.md` — design spec
- `2026-04-14-reddit-pipeline-v0-plan.md` — V0 implementation plan (this)
- `2026-04-14-reddit-pipeline-implementation-plan.md` — V1 plan (deterministic Python pipeline, on hold)

## V0 → V1 upgrade trigger

Build V1 only when V0 actually falls over. Candidate triggers:
- Findings drift significantly between runs on the same doc (inconsistency)
- Runs take >20 minutes or hit context limits (scale)
- Classifier judgment feels unreliable across products

Keep notes per V0 run about what felt off — those notes become the V1 motivation.
```

Commit:

```bash
cd ~/second-brain
git add projects/product-validation/README.md
git commit -m "Add product-validation README"
```

---

## Spec Coverage Check (V0)

| Spec requirement | V0 implementation |
|-|-|
| Reads product-validation.md | SKILL.md step 1 |
| Wide retrieval with query expansion | SKILL.md step 2 + step 3 |
| Adjacent subreddit discovery | SKILL.md step 3 (optional) |
| Posts + top comments as unit | **Posts only in V0.** Comments deferred. |
| Strict classification against hypothesis | SKILL.md step 4 |
| Findings artifact with coverage, pain evidence, existing solutions, power users | SKILL.md step 5 |
| Reuses last30days lib (pinned v2.9.5) | reddit_search.py imports |
| Determinism | Not a V0 goal. If it becomes one, that motivates V1. |
| Batched classification for efficiency | Not in V0. |
| Relevance pre-filter | Not in V0. Claude judges everything directly. |

**Intentional gaps vs. spec:** V0 skips comment enrichment, batched classification, and pre-filtering. Each is a known V1 upgrade if V0 proves insufficient.

---

## Notes

- **Time estimate:** 1.5–2 hours total. Task 1 is ~30 min, Task 2 is ~30 min, Task 3 is a live run + review (~30–60 min).
- **Biggest risk:** same as V1 — the real function name in `reddit.py` may differ. Task 1 Step 2 verifies this first.
- **If V0 results are already good enough:** stop. Keep V1 plan as a reference for later. Voice Tutor validation is done.
