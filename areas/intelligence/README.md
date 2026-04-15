# Intelligence

AI intelligence briefing system powered by NanoClaw. Automated research, synthesis, and analysis delivered on a recurring schedule.

## Briefing Types

| Type                 | Schedule                | Output                          | Description                                                               |
| -------------------- | ----------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| **Daily Briefing**   | Mon–Fri 7am             | `resources/intelligence/daily-briefings/YYYY-MM-DD.md`    | Top AI/tech news, model releases, funding, Product Hunt launches     |
| **Product Briefing** | Sat 6am                 | `resources/intelligence/weekly-products/YYYY-MM-DD.md`    | X thread product extraction and categorization into problem buckets  |
| **Weekly Summary**   | Sat 8am                 | `resources/intelligence/weekly-summaries/YYYY-WXX.md`     | Synthesizes daily briefings + product briefing into patterns and signal |
| **Monthly Summary**  | 1st of month 7am        | `resources/intelligence/monthly-summaries/YYYY-MM.md`     | Synthesizes weekly summaries into durable trends and product observations |
## Directory Structure

```
intelligence/
├── instructions/           # Briefing instructions (edit these to change output)
│   ├── daily-briefing.md
│   ├── weekly-products.md
│   ├── weekly-summary.md
│   └── monthly-summary.md
└── README.md
# Output folders live at resources/intelligence/ (vault root). Consolidated 2026-04-15.
# Wiki pipeline moved to projects/wiki/. Moved 2026-04-13.
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

## Related Pipelines

- **Wiki pipeline** — moved to [`projects/wiki/`](../wiki/README.md) (2026-04-13)
- **Atomic notes pipeline** — at [`projects/atomic-notes/`](../atomic-notes/README.md) (2026-04-13)

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
daily-briefings:keep=7
weekly-products:keep=4
```

Files beyond the keep count are moved to `_archive/` within each folder. To add a new folder or change the retention, edit the config file — no script changes needed. The archive script lives at `~/nanoclaw/scripts/archive-briefings.sh`.
