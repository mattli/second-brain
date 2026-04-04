# pmtxt

AI-native product management system. CLI-first tool that helps PMs at small startups answer "what should we build next?" by maintaining a governed plain-text knowledge base and generating agent-ready specs for coding agents.

## Status

**Phase: Planning** — requirements and implementation plan complete, awaiting document review and implementation.

## Key Concept

Engineering AI tools (Cursor, Claude Code, CE) are session-scoped — they help you build a thing, then the artifacts go stale. pmtxt is product-scoped — the knowledge base persists and compounds over time. The 50th spec is better than the 1st because the system knows your customers, past decisions, and competitive landscape.

## Target User

First PM at a 2-15 person startup — overwhelmed, under-tooled, needs help deciding what to build, not managing tasks.

## Tech Stack (Planned)

- TypeScript monorepo (Turborepo): `@pmtxt/core`, `@pmtxt/cli`, `@pmtxt/web`
- CLI: Ink + Pastel
- Web dashboard: Next.js (existing repo at github.com/mattli/pmtxt)
- LLM: Anthropic API with prompt caching
- Knowledge base: Structured markdown files in a local git repo

## Docs

- `2026-03-30-pmtxt-requirements.md` — What to build (requirements, scope, key decisions)
- `2026-03-30-001-feat-pmtxt-v1-plan.md` — How to build it (8 units, 5 phases)
- `reddit-feedback.md` — User research from r/startups (Feb 2026)
- `last30days-validation.md` — Market validation from Reddit + X (Mar 2026)

## Next Steps

1. Run `/ce:plan` on the plan file → select "Run document-review" to stress-test
2. Run `/ce:work` to begin implementation
