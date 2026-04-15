# Atomic Notes Pipeline

Distills personal thinking from Telegram conversation history into atomic notes — one concept per file, written in first person, capturing decisions, recurring patterns, framings that stuck, and lessons from real work. Based on YB_Effect's pattern of extracting durable insights from conversational raw material.

## Current State

One-off experiment ran 2026-04-13, processing ~856 messages from the main Telegram group (last 30 days). Produced 13 notes across four clusters: building the system, product thinking, personal patterns, and bigger questions. Output lives at `resources/atomic-notes/`.

See the [experiment README](../../resources/atomic-notes/README.md) for the method, full note list, and patterns observed across the notes — that's the reference for what "good" atomic notes look like.

## Planned Pipeline

Weekly scheduled task that:
1. Pulls the last 7 days of Telegram conversation history from the main group
2. Filters for conceptual substance (skips task-oriented exchanges, one-off questions)
3. Generates new atomic notes or updates existing ones when thinking on a topic has evolved
4. Commits to the vault

Not yet built. The `instructions/` folder is ready for when the scheduled task gets created.

## Key Files

| File | Purpose |
|------|---------|
| `instructions/` | Pipeline instructions (empty — to be written when task is scheduled) |
| `../../resources/atomic-notes/` | All generated atomic notes live here |
| `../../resources/atomic-notes/README.md` | Experiment writeup and quality reference |
