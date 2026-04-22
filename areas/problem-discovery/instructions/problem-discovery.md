# Problem Discovery Pipeline Instructions

> Version: 1.0 | Last updated: 2026-04-15

## Purpose

Surface the range of real pains in a domain I don't have a hypothesis for yet. Different from product-validation — this does not score against a specific problem statement. The classifier asks: *"is this a real, specific, recurring pain that someone could plausibly build for?"*

## When to use

- I'm entering a new category and want to see what people actually complain about before picking a hypothesis.
- I have a candidate category but no concrete product idea yet.

## Prerequisites

- `SCRAPECREATORS_API_KEY` in env
- `reddit_search.py` at `~/.claude/skills/product-validation/reddit_search.py`

Classification is done inline by the agent running the pipeline (you). No external classifier script or API key is required — read title + top_comments and score 0–3 against the rubric yourself.

## Inputs

Before running, I provide:

1. **Domain** — short name (e.g. "backpacking and outdoors")
2. **Target subreddits** — 5–10 subs where the audience discusses the domain
3. **Domain terms** — 6–12 nouns or short phrases that represent distinct surfaces within the domain. Don't include frustration phrases — trust the classifier to detect pain from context. Pure domain terms cast a wider net.
4. **Optional judgment calls** — e.g., "skip query X in subreddit Y if the term matches most posts there."

## Pipeline

### 1. Propose queries

Show me the final query × subreddit combinations with any judgment-call exclusions. Pause for my approval before running.

### 2. Run searches

For each query × subreddit combination:

```bash
python3 ~/.claude/skills/product-validation/reddit_search.py "<query>" "<sub-without-r/>" --limit 15 --enrich
```

`--enrich` fetches top comments (1 ScrapeCreators credit per post). Results have title, score, num_comments, permalink, and a `top_comments` array. **No post bodies** — classify from title + top comments only.

Parallelize where possible. Dedupe by post ID across queries; track which query hit each post.

Note: the helper occasionally emits `HTTP 400` preamble lines from partial comment-enrichment refusals before the JSON body. Strip those lines before parsing.

### 3. Classify broadly

Score each post 0–3 against the general pain bar — NOT against any specific product hypothesis:

- **3** — Specific, recurring pain. Multiple comments share it. Existing solutions explicitly fail.
- **2** — Real pain, but possibly niche or solvable with existing tools OP hasn't tried.
- **1** — Frustration mentioned, but edge-case or one-off.
- **0** — Not a pain post (gear porn, trip report, beginner Q, celebration, etc.)

Keep posts scored 2+. Sanity check: if fewer than 10 survive, lower the bar to 1 and tell me.

### 4. Cluster by pain shape

Group surviving posts into pain clusters by underlying problem, not by search query or subreddit. Name each cluster by the pain it represents (e.g. "Weather forecast → layer decision gap"). A cluster needs at least 2–3 posts to count; single-post anomalies go in Surprises.

For each cluster capture:
- Post count and subreddit spread
- 2–4 representative verbatim quotes (comment bodies preferred; title fallback if the title is itself the evidence)
- Named existing solutions mentioned + where they explicitly fail
- Which of the original queries hit posts in this cluster (useful for debugging coverage)

### 5. Write findings

Output path: `resources/problem-discovery/YYYY-MM-DD-<domain>.md` (use the date the run completed, domain as lowercase-with-hyphens).

```markdown
# <Domain> Problem Discovery — YYYY-MM-DD

## Coverage
- Queries run: N × M subreddits = K searches
- Posts retrieved: N → deduped: M → passed classifier (score 2+): K
- (Note if sanity-check lowered the bar to 1.)

## Pain Clusters

### Cluster 1: <Pain name>

**How often it appeared:** N posts across r/X, r/Y, r/Z
**Existing solutions & where they fail:** <tool names; the gap in one line each>

Representative quotes:
> quote 1 (r/sub, u/author, permalink)
> quote 2 (r/sub, u/author, permalink)

### Cluster 2: ...

## Surprises
Pains I wouldn't have predicted going in. 3–5 bullets.

## Pattern Observations
Meta-patterns across clusters. 3–5 bullets on the underlying shape of pain in this domain — not a cluster recap. Examples: "most pain is uncertainty during planning, not execution"; "existing tools solve discrete tasks but nothing stitches the workflow"; "users are already shipping half-built tools inside the threads."
```

**Do NOT include:**
- Power-user candidates section (this isn't validation, no interviews happening)
- Hypothesis-match reasoning or product recommendations (just surface pain; I'll decide where to go next)
- Individual post scoring — clusters are the unit, not posts

### 6. Update the run log

Add a row to the "Runs to Date" table in `projects/problem-discovery/README.md` with the date, domain, and link to the findings file.

### 7. Report back concisely (under 300 words)

- Output file path
- Counts: retrieved, deduped, passed classifier (broken down by score 2 vs 3)
- Cluster names + 1-line gist each
- The single most surprising pain
- Any pipeline issues (empty queries, API errors, credit warnings)

Do not paste the full findings doc back.

## Subagent note

For runs expected to return >200 passing posts, dispatch the pipeline to a subagent so raw search output doesn't bloat the main conversation context. Subagent writes the findings doc directly; main conversation gets only the concise report from Step 7.

## Judgment calls worth considering per run

- **Term-matches-everything problem:** if a query term is in the subreddit's name (e.g. `ultralight` in r/Ultralight), skip that combination — it floods the classifier with noise.
- **Vernacular-specific terms:** thru-hiker terms like `resupply`, `shakedown` will zero out on generic subs but hit hard on specialist subs. Leave them in; empty results are free.
- **Broad vs narrow queries:** don't pair frustration phrases with domain terms (e.g. `"gear list" "drives me crazy"`) — requiring both phrases in-post is too narrow and misses paraphrased frustration. Trust the classifier; cast a wider net at the search step.

## Troubleshooting

- **Helper returns `HTTP 400` lines** — comment enrichment refusal; strip preamble lines before parsing JSON.
- **Everything scores 0–1** — your subreddits may be wrong for the domain, or the queries are hitting showcase/reference subs rather than problem-discussion subs. Try adjacent subreddits.
- **One cluster dominates (>50% of results)** — may be a classifier artifact. Review a sample manually; consider splitting the cluster into finer pains.
