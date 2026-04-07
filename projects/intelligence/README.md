# Intelligence

AI intelligence briefing system powered by NanoClaw. Automated research, synthesis, and analysis delivered on a recurring schedule.

## Briefing Types

| Type                 | Schedule           | Output                            | Description                                                               |
| -------------------- | ------------------ | --------------------------------- | ------------------------------------------------------------------------- |
| **AI Briefing**      | Mon–Fri 7am        | `ai-briefings/YYYY-MM-DD.md`      | Top AI/tech news, model releases, funding, Product Hunt launches          |
| **Product Briefing** | Sat 6am            | `weekly-products/YYYY-MM-DD.md`   | X thread product extraction and categorization into problem buckets       |
| **Weekly Summary**   | Sat 8am            | `weekly-summaries/YYYY-WXX.md`    | Synthesizes AI briefings + product briefing into patterns and signal      |
| **Monthly Summary**  | 1st of month 7am   | `monthly-summaries/YYYY-MM.md`    | Synthesizes weekly summaries into durable trends and product observations |
| **Readwise Wiki**    | Fri 10pm           | `wiki/*.md`                        | Persistent knowledge base compiled from Readwise saves                    |

## Directory Structure

```
intelligence/
├── instructions/           # Briefing instructions (edit these to change output)
│   ├── daily-briefing.md
│   ├── weekly-products.md
│   ├── weekly-summary.md
│   ├── monthly-summary.md
│   └── readwise-wiki.md
├── ai-briefings/           # Daily briefing output
├── weekly-products/        # Weekly product briefing output
├── weekly-summaries/       # Weekly summary output
├── monthly-summaries/      # Monthly summary output
├── wiki/                   # Persistent knowledge base (Readwise wiki)
│   ├── INDEX.md            # Topic index with links and one-line summaries
│   └── *.md                # Individual topic pages
└── README.md
```

## Editing Instructions

Each briefing type has an instructions file in `instructions/`. Edit these to change what the agent researches, how it formats output, or what sources it uses. Changes take effect on the next scheduled run.

## Test Runs

After editing instructions, use the `test-briefing` command to trigger an ad-hoc run:

```bash
test-briefing daily      # Test the daily briefing
test-briefing product    # Test the product briefing
test-briefing weekly     # Test the weekly summary
test-briefing monthly    # Test the monthly summary
```

What it does:
- Disables deduplication (so stories aren't skipped for being "already covered")
- Auto-generates a unique filename suffix (e.g., `2026-03-21c.md`) to avoid overwriting scheduled output
- Triggers the task immediately via the NanoClaw scheduler
- Automatically reverts the task prompt to its original state after the run

The script lives at `~/nanoclaw/scripts/test-briefing.sh`.

## Architecture

The briefings form a layered synthesis pipeline — each layer distills the one below it:

```
AI Briefing (Mon-Fri, includes Product Hunt)
  + Weekly Product Briefing (Sat 6am, X thread extraction)
    → Weekly Summary (Sat 8am, synthesizes both)
      → Monthly Summary (durable trends across 4 weeks)
```

The daily AI briefing researches live sources including Product Hunt. The weekly product briefing searches X for high-engagement "share your product" threads (50+ replies), extracts product URLs, resolves them, and categorizes into problem buckets. The weekly summary reads both the AI briefings and the product briefing plus VC thesis searches. The monthly summary reads only the weekly summaries — no independent research.

## Readwise Wiki

A persistent, interlinked knowledge base compiled from Readwise saves — following Andrej Karpathy's "LLM Wiki" pattern. Unlike the briefings (which are time-series outputs on a schedule), the wiki is a living reference that gets updated over time, not replaced.

### How It Works

1. **Fetch recent saves** — uses Readwise MCP tools to pull documents saved in the last 7 days (or all documents on first run)
2. **Read and extract** — for each document, extracts key concepts, claims, connections to existing pages, and notable people/tools
3. **Update or create pages** — integrates new information into existing topic pages, or creates new pages when a topic has enough substance. Pages are about *topics* (not individual articles) and may draw from multiple sources.
4. **Maintain the index** — `wiki/INDEX.md` is updated with links and one-line summaries for every page, loosely grouped by domain
5. **Lint** — scans for orphan pages, missing pages, and stale content on every run

### Page Design

- Each page starts with a TLDR, has content organized by the natural structure of the topic, and ends with a Sources section citing which Readwise saves informed it
- Pages interlink with standard markdown links (works in both Obsidian and GitHub)
- File names use kebab-case: `retrieval-augmented-generation.md`, `andrej-karpathy.md`
- Tool/product bookmarks don't get standalone pages — they're noted as data points on the relevant topic page

### When It Runs

The wiki runs as a **scheduled task every Friday at 10pm**, processing the week's Readwise saves. Instructions live in `instructions/readwise-wiki.md`.

### Current Pages

The wiki currently has 12 topic pages across concepts, tools, landscape analysis, and people profiles. See `wiki/INDEX.md` for the full list.

## Briefing Execution

Each briefing type runs as a NanoClaw scheduled task:
1. The scheduler detects a due task and spawns an isolated container
2. The container agent reads its instructions file and performs research (web search, full article fetching)
3. Output is written to the appropriate directory and committed/pushed to git
4. A notification is sent to Telegram on completion

Tasks are defined in NanoClaw's SQLite database (`~/nanoclaw/store/messages.db`). The `test-briefing` script temporarily modifies the task prompt and triggers it, then reverts after the run completes.

## Archival

Old briefing files are automatically archived every Sunday at midnight. Each folder has a retention rule defined in `~/nanoclaw/scripts/archive-briefings.conf`:

```
ai-briefings:keep=7
weekly-products:keep=4
```

Files beyond the keep count are moved to `_archive/` within each folder. To add a new folder or change the retention, edit the config file — no script changes needed. The archive script lives at `~/nanoclaw/scripts/archive-briefings.sh`.
