# Reddit Product Validation Pipeline — Design

Status: design approved, ready for implementation plan
Created: 2026-04-14

## Purpose

A tool for validating product hypotheses against real Reddit conversations. Given a product-validation doc (e.g., `voice-tutor/product-validation.md`), the pipeline retrieves relevant posts and comments across target subreddits, classifies them against the hypothesis, and writes a findings doc with pain evidence, existing-solution mentions, and power-user candidates to approach.

Built because the existing `last30days` plugin is positioned for generic trend research — its engagement-based ranking and synthesis prompts don't match what product validation needs (pain signal over virality, community fit over novelty).

Immediate use case: validate the Voice Tutor hypothesis (Readwise power users drowning in saves). Secondary use case later: discovery mode for finding problems worth solving.

## Scope

**In scope:**
- Hypothesis validation mode — takes a product-validation.md, runs retrieval, classifies, writes findings
- Reddit only as a source
- Claude Code skill integration — invoked via `/validate <product-name>`
- Reuses `scripts/lib/reddit.py`, `scripts/lib/score.py`, `scripts/lib/relevance.py` from last30days as libraries

**Out of scope (this iteration):**
- Discovery mode (no hypothesis — find pain clusters from a subreddit list). Same architecture will extend to this later; different entry point, same retriever/classifier.
- X, Hacker News, or other sources. Architecture leaves room but doesn't build them now.
- Nanoclaw integration, Telegram triggering, scheduling. Product validation is interactive research, not unattended work.
- Upgrading last30days to v3.0.0. Unrelated; tracked separately.

## User Flow

1. User maintains `product-validation.md` in a product folder (e.g., `~/second-brain/projects/products/voice-tutor/`). Rough draft is fine — pipeline is robust to incomplete docs.
2. User runs `/validate voice-tutor` in Claude Code.
3. Pipeline reads the doc, reports coverage (which fields extracted, which missing).
4. Pipeline runs wide retrieval across listed subreddits plus a few adjacent ones it discovers.
5. Pipeline classifies each candidate against the hypothesis using the doc's problem statement as ground truth.
6. Pipeline writes `product-validation-findings-YYYY-MM-DD.md` alongside the input doc.
7. User reads findings, edits the input doc if queries or classifier missed the mark, reruns.

## Architecture

```
Input:  ~/second-brain/projects/products/<name>/product-validation.md
        │
        ▼
/validate <product-name>  (Claude Code skill)
        │
        ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
│ doc_reader  │ → │ retriever   │ → │ classifier  │ → │ synthesizer  │
└─────────────┘   └─────────────┘   └─────────────┘   └──────────────┘
   Claude API    ScrapeCreators       Claude API      No LLM call
                 Reddit               (batched)       (pure format)
                                                              │
                                                              ▼
                                   product-validation-findings-YYYY-MM-DD.md
```

### Retrieval strategy: wide retrieval, strict classification

The doc defines the center of the search, not its literal words. The pipeline:
1. Expands the problem statement into 8–15 queries with synonyms and related phrasings (people don't say "drowning in saves" — they say "my Kindle highlights are gathering dust").
2. Searches all queries across listed subreddits. Optionally discovers 2–3 adjacent subreddits from result patterns.
3. Classifies every candidate against the doc's problem statement. Anything below threshold is dropped.

Width without sacrificing relevance. The doc stays the authoritative hypothesis definition; the pipeline isn't hobbled by the user's choice of words.

### Unit of analysis: posts + top comments

For each retrieved post, pulls top 5–10 comments (by engagement). Both posts and comments go through the classifier. Comments are often where pain gets described in detail ("I have the same problem, I tried X, it didn't work because Y"). Comment authors with high-signal comments become power-user candidates.

## Components

Four independent units. Each has one job, a defined interface, independently testable.

### 1. `doc_reader.py` — input extraction

- **Input:** path to a product folder
- **Output:** `Hypothesis` object + coverage report
- Reads `product-validation.md`, runs one Claude call to extract structured fields
- Required fields: `problem_statement`, `target_subreddits`. Fails loud if missing.
- Optional fields: `existing_solutions`, `success_criteria`, `power_user_signals`. Warns if missing.
- Coverage report lists which fields were found and which weren't, shown to user before running retrieval.

### 2. `retriever.py` — wide retrieval

- **Input:** `Hypothesis`
- **Output:** list of `Candidate` objects (post or comment)
- One Claude call expands the problem statement into 8–15 search queries (temp 0).
- For each query × target subreddit: calls `lib/reddit.py` search.
- Optional adjacent-subreddit discovery: inspects which subreddits hits came from, takes top 2–3 novel ones by hit rate, reruns a subset of queries there. Controlled by `--no-adjacent-subs` flag.
- Pulls top 5–10 comments per post via `lib/reddit_enrich.py`.
- Dedupes across queries by post ID.
- Each `Candidate` tracks: text, author, permalink, engagement metadata, which query hit it, whether it's a post or comment.

### 3. `classifier.py` — strict classification

- **Input:** `Hypothesis` + `Candidate` list
- **Output:** `ClassifiedFinding` list (those passing threshold)
- Cheap pre-filter via `lib/relevance.py` token-overlap score — drops obviously off-topic before spending on Claude calls.
- For survivors: batched Claude calls (temp 0). Per candidate returns:
  - `score`: 0 (irrelevant), 1 (tangential), 2 (relevant pain evidence), 3 (strong match, quotable)
  - `evidence_quote`: exact quote
  - `pain_category`: one of the categories defined in the doc, or `none`
  - `mentions_existing_solution`: solution name or null
  - `power_user_signal`: boolean (author shows Readwise/PKM/etc. power-user behavior)
- Drops anything below threshold (default 2). Configurable via `--threshold`.

### 4. `synthesizer.py` — artifact writer

- **Input:** `Hypothesis`, `ClassifiedFinding` list, coverage/query/subreddit metadata
- **Output:** `product-validation-findings-YYYY-MM-DD.md` in the product folder
- Pure formatting, no LLM call for structure. Optional single LLM call for a short executive summary at the top.
- Sections:
  - Coverage (doc fields extracted, queries run, adjacent subs tried, candidate counts)
  - Pain Evidence (top-scored findings with quotes, authors, permalinks, classifier reasoning)
  - Existing Solutions Mentioned (grouped by tool, mention count, sentiment)
  - Power User Candidates (top 5–10 authors by signal count, best quote each, permalink)
  - Rejected for Review (top 5 borderline rejections — for sanity-checking the classifier)

### Skill entry point

`~/.claude/skills/product-validation/SKILL.md` plus a small orchestrator script. Wires the four components together, handles logging, exposes knobs: `--threshold`, `--no-adjacent-subs`, `--max-queries`.

## Data Flow

```
1. /validate voice-tutor
2. doc_reader → Hypothesis + coverage report printed
3. retriever generates 12 queries, searches 4 listed subreddits + 2 adjacent
   → "Found 161 candidates"
4. classifier: 161 → 58 after relevance pre-filter → 31 after Claude scoring
5. synthesizer writes product-validation-findings-2026-04-14.md
   → "31 findings, 5 power-user candidates, 4 existing solutions"
```

One log line per step — progress visible without terminal spam.

## Error Handling

Only at external-API boundaries. No defensive try/except around internal code.

- **Doc missing required fields** → fail before any API calls. Print missing fields, exit.
- **ScrapeCreators rate limit / auth failure** → fail loud with the specific error. No endless retry.
- **Claude error during query expansion** → one retry with backoff, then exit.
- **Claude error during classification** → per-batch retry up to 2x, then drop that batch with a warning in the findings doc. Run completes.
- **Zero results after classification** → still write a findings doc saying "no candidates passed" plus the full coverage/query log so the user can see what was tried.

### Determinism knobs

- Query expansion: temperature 0. Same doc → same queries. User can iterate the doc and see meaningful diffs.
- Classifier: temperature 0. Same candidate → same score.

## Testing

- **doc_reader** — fixtures of various drafts (full, minimal, missing required, voice-tutor's actual doc). Assert extracted fields match expected.
- **retriever** — mock ScrapeCreators responses. Test query dedup, adjacent-sub expansion, comment-pull behavior.
- **classifier** — fixture candidates with known labels. Live run against Claude with temp 0; assert scores in expected ranges. Pre-filter test uses no LLM.
- **synthesizer** — golden-file test: fixed set of `ClassifiedFinding` objects → assert output markdown matches committed fixture.
- **End-to-end** — one live test against voice-tutor's doc, one mock-LLM test with fully recorded responses.

## Dependencies

- **Python** — pipeline language, to match last30days lib/ which is Python
- **ScrapeCreators API key** — already set up for last30days
- **Anthropic API key** — already used by Claude Code
- **last30days installed** — pipeline imports `scripts/lib/reddit.py`, `reddit_enrich.py`, `score.py`, `relevance.py` as libraries. Pinned to v2.9.5 for now. If v3 upgrade happens later, verify import paths still work before merging.

## Open Questions

- Query expansion budget: cap at 15 queries or let Claude decide? Start with 15; revisit if costs are too high.
- Adjacent-subreddit discovery criteria: currently "top 2–3 by hit rate across retrieved results." May need refinement once we see real patterns.
- Classifier threshold default: starting at 2. Adjust after first voice-tutor run based on observed precision.

## Next Steps

Write implementation plan (via writing-plans skill) breaking this into build units with tests.
