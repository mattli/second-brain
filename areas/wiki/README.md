# Wiki Pipeline

Readwise wiki compiler — processes Readwise saves into a persistent, interlinked knowledge base following Karpathy's LLM Wiki pattern. An LLM reads saved articles, extracts key concepts, and integrates them into topic pages that grow over time.

## How It Runs

Three NanoClaw scheduled tasks maintain the wiki:

- **Weekly compiler** — runs 3am Mon & Thu. Fetches Readwise saves since the last run, processes research log entries from Wiki Tutor, updates existing pages or creates new ones, maintains the index, lints for orphans and stale content, and regenerates `long-form/QUEUE.md`. Runs on Opus with a 90-minute timeout.
- **Monthly structure review** — runs 3am on the 1st of each month. Evaluates folder organization and INDEX.md alignment, writes a scannability-focused proposal to `resources/wiki/FOLDER_REVIEW.md`. Proposal-only; never auto-applies.
- **On-demand long-form synthesis** — user-triggered via the main Telegram group. Synthesizes a Readwise PDF (50K–200K words) into a dedicated page in `resources/wiki/long-form/` with bidirectional links into topic pages.

## Key Files

| File | Purpose |
|------|---------|
| `instructions/readwise-wiki.md` | Weekly compiler instructions |
| `instructions/long-form-synthesis.md` | Long-form synthesis procedure (single-doc mode + queue regeneration) |
| `instructions/folder-review.md` | Folder/structure review (review mode + apply mode) |
| `../../resources/wiki/` | Wiki output — all compiled pages live here |
| `../../resources/wiki/INDEX.md` | Topic index with links and one-line summaries |
| `../../resources/wiki/long-form/` | Dedicated pages for synthesized long-form PDFs |
| `../../resources/wiki/long-form/QUEUE.md` | Pending long-form items (refreshed weekly) |
| `../../resources/wiki/FOLDER_REVIEW.md` | Latest structure proposal (refreshed monthly) |
| `../../resources/wiki/raw/research-log.md` | Append-only log from Wiki Tutor conversations |

## NanoClaw Groups

Two NanoClaw groups use the wiki:

- **readwise-wiki** — the compiler agent. Mounts `projects/wiki/` (instructions) and `resources/` (wiki output). Writes pages.
- **wiki-tutor** — a read-only librarian agent. Mounts `resources/wiki/` read-only. Reads pages, serves nuggets, logs research entries for the compiler to process.

## Related

- [Wiki README](../../resources/wiki/README.md) — describes the wiki content, page design, and deferred items
- [Intelligence pipeline](../intelligence/README.md) — the briefing system (separate project)
