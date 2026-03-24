# Intelligence

AI intelligence briefing system powered by NanoClaw. Automated research, synthesis, and analysis delivered on a recurring schedule.

## Briefing Types

| Type                 | Schedule           | Output                            | Description                                                               |
| -------------------- | ------------------ | --------------------------------- | ------------------------------------------------------------------------- |
| **AI Briefing**      | Mon–Fri 7am        | `ai-briefings/YYYY-MM-DD.md`      | Top AI/tech news, model releases, funding, discussions                    |
| **Product Briefing** | Mon–Fri 7am        | `product-briefings/YYYY-MM-DD.md` | Product launches, builder activity, tools gaining traction                |
| **Weekly Summary**   | Sat 7am            | `weekly-summaries/YYYY-WXX.md`    | Synthesizes the week's daily briefings into patterns and signal           |
| **Monthly Summary**  | 1st of month 7am   | `monthly-summaries/YYYY-MM.md`    | Synthesizes weekly summaries into durable trends and product observations |
|                      |                    |                                   |                                                                           |

## Directory Structure

```
intelligence/
├── instructions/           # Briefing instructions (edit these to change output)
│   ├── daily-briefing.md
│   ├── daily-products.md
│   ├── weekly-summary.md
│   └── monthly-summary.md
├── ai-briefings/           # Daily briefing output
├── product-briefings/      # Product briefing output
├── weekly-summaries/       # Weekly summary output
├── monthly-summaries/      # Monthly summary output
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
AI Briefing + Product Briefing (raw signal)
  → Weekly Summary (patterns across 5 days)
    → Monthly Summary (durable trends across 4 weeks)
```

The daily briefing researches live sources. The weekly summary reads only the week's daily briefings (plus a builder pulse search). The monthly summary reads only the weekly summaries, then appends product observations back to `projects/product/product-vision.md`. The product briefing is a standalone daily layer focused on launches and builder activity.

## How It Works

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
product-briefings:keep=7
```

Files beyond the keep count are moved to `_archive/` within each folder. To add a new folder or change the retention, edit the config file — no script changes needed. The archive script lives at `~/nanoclaw/scripts/archive-briefings.sh`.
