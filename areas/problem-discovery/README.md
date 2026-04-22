# Problem Discovery Pipeline

Reddit-first problem-discovery pipeline. Surfaces the range of real pains in a domain without a predetermined hypothesis. Modeled on the product-validation pipeline, but classifies broadly ("is this a real, specific, recurring pain someone could plausibly build for?") rather than scoring against one hypothesis.

Use this when entering a new category and you want to see what people actually complain about, before deciding what to build.

## How It Runs

Ad-hoc. A conversation with the vault agent provides a domain, target subreddits, and a list of domain-term queries. The agent runs Reddit searches (via ScrapeCreators, with `--enrich` for top comments), classifies each post 0–3, clusters results by underlying pain, and writes findings to `resources/problem-discovery/YYYY-MM-DD-<domain>.md`.

See [instructions/problem-discovery.md](instructions/problem-discovery.md) for the full pipeline spec.

## Discovery vs. Validation

| | Discovery | Validation |
|---|---|---|
| Input | Domain + subreddits + broad queries | Hypothesis doc with specific problem statement |
| Classifier | "Is this real, recurring pain?" | "Does this support my hypothesis?" |
| Output grouping | Pain clusters + surprises + patterns | Evidence by score + power-user candidates |
| Next step | Pick a hypothesis to validate | Interview or move on |

Discovery → Validation is the natural flow. A discovery run produces candidate hypotheses; each one graduates to its own `product-validation.md` in the relevant product folder.

## Key Files

| File | Purpose |
|------|---------|
| `instructions/problem-discovery.md` | Pipeline spec (edit to change behavior) |
| `../../resources/problem-discovery/` | All problem-discovery findings docs live here |

## Runs to Date

| Date | Domain | Findings file |
|------|--------|---------------|
| 2026-04-15 | Backpacking & outdoors | [2026-04-15-backpacking.md](../../resources/problem-discovery/2026-04-15-backpacking.md) |
| 2026-04-21 | Ed-tech | [2026-04-21-ed-tech.md](../../resources/problem-discovery/2026-04-21-ed-tech.md) |

## Related

- [Product validation pipeline](https://github.com/mattli8020/product-validation) — hypothesis-validation sibling, uses the same `reddit_search.py` helper
