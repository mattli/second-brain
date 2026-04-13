# Wiki Pipeline

Readwise wiki compiler — processes Readwise saves into a persistent, interlinked knowledge base following Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into topic pages that grow over time.

## How It Runs

A NanoClaw scheduled task runs at 3am Monday and Thursday. It fetches Readwise saves since the last successful run, processes research log entries from Wiki Tutor conversations, updates existing pages or creates new ones, maintains the index, and lints for orphans and stale content. Runs on Opus with a 90-minute timeout.

## Key Files

| File | Purpose |
|------|---------|
| `instructions/readwise-wiki.md` | Compiler instructions (edit to change behavior) |
| `../../resources/wiki/` | Wiki output — all compiled pages live here |
| `../../resources/wiki/INDEX.md` | Topic index with links and one-line summaries |
| `../../resources/wiki/raw/research-log.md` | Append-only log from Wiki Tutor conversations |

## NanoClaw Groups

Two NanoClaw groups use the wiki:

- **readwise-wiki** — the compiler agent. Mounts `projects/wiki/` (instructions) and `resources/` (wiki output). Writes pages.
- **wiki-tutor** — a read-only librarian agent. Mounts `resources/wiki/` read-only. Reads pages, serves nuggets, logs research entries for the compiler to process.

## Related

- [Wiki README](../../resources/wiki/README.md) — describes the wiki content, page design, and deferred items
- [Intelligence pipeline](../intelligence/README.md) — the briefing system (separate project)
