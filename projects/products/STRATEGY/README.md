# Product

Thinking and planning around building meaningful AI products -- things that have a genuine positive impact or tap into deep personal interests, not just CRUD apps.

## Key Docs

- **[Product Vision](product-vision.md)** — North star, strategic framework, areas of genuine interest, and the core questions guiding what to build and how.
- **[Ideas](projects/products/STRATEGY/ideas.md)** — Specific product ideas currently being evaluated, with feasibility and revenue analysis.

## Validation Tool: last30days

On-demand research tool for validating product ideas against real conversations on Reddit and X from the last 30 days. Installed as a Claude Code plugin from [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill), customized to focus on product validation — surfaces pain signals, existing solutions, and market gaps.

**Usage:** `/last30days <topic>` from any Claude Code session.

**Config:** `~/.config/last30days/.env` — ScrapeCreators key (Reddit) and Bird tokens (X). ScrapeCreators is required; the OpenAI fallback is unreliable.

**Output:** Raw data saved to `~/Documents/Last30Days/`. Claude synthesizes a Problem Validation report with verdict (strong/weak/inconclusive signal).

**Future:** May move from Claude Code plugin to a NanoClaw container task for scheduled validation runs.
