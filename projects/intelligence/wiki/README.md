# Readwise Wiki

Compiled knowledge base from Readwise saves, following Andrej Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into persistent, interlinked topic pages.

## Purpose

Agent-navigable reference layer. The wiki means agents don't have to re-derive knowledge from raw sources every time — they read the compiled pages instead. Pages are about topics (not individual articles) and grow over time as new sources are added.

## Use Case

Matt saves articles, tweets, GitHub repos, and other content to Readwise — often without reading them in full. The wiki acts as his reading staff, consuming what he can't and surfacing what matters. The filter for what gets saved is genuine curiosity from trusted sources, not comprehensiveness. The wiki optimizes for breadth across multiple domains (AI, startups, product management, competitive landscape) with enough depth to be useful when agents reference it.

## How It's Maintained

A NanoClaw scheduled task runs every Friday at 10pm. It fetches the last 7 days of Readwise saves, updates existing pages or creates new ones, maintains the index, and lints for orphans and stale content. Each page has `created_at` and `last_updated` frontmatter.

## How It Fits

The intelligence system has two modes: briefings (dated logs — daily, weekly, monthly) and the wiki (persistent compiled knowledge). Briefings answer "what happened this week." The wiki answers "what do I know about this topic."

## Reference

- **Index:** [`_index.md`](_index.md)
- **Compiler instructions:** [`../instructions/readwise-wiki.md`](../instructions/readwise-wiki.md)
- **Parent project:** [`../README.md`](../README.md)
