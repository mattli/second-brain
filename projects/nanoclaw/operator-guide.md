# Operator Guide — How to Change Things

This is a reference for making changes to the Second Brain system. Written for Matt, not for Claude.

---

## The Two Ways to Make Changes

*From Telegram (no SSH needed):*
- Change scheduled task prompts and schedules — use the task scheduler MCP tool
- Edit files in the vault — ask Second Brain to read/edit files
- Add/remove scheduled tasks

*Requires SSH into the Mac Mini or a Claude Code session:*
- Edit CLAUDE.md files (agent system prompts) — they're read-only inside containers
- Install new NanoClaw skills
- Change container configuration (mounts, env vars)
- Edit nanoclaw scripts in `~/nanoclaw/`

---

## How Agent Behavior Works

There are two places that control how an agent behaves. Both matter.

*CLAUDE.md files* — the agent's permanent system prompt. Loaded at startup. Controls personality, capabilities, and standing instructions. Located at `~/nanoclaw/groups/{group-name}/CLAUDE.md` on the Mac Mini host.

*Task prompt* — the instruction passed when a scheduled task fires. Controls what the agent does in that specific run. Set via the task scheduler MCP tool from Telegram.

If the CLAUDE.md and the task prompt conflict, the task prompt usually wins for that specific run.

*To change how an agent permanently behaves:* edit its CLAUDE.md on the host.

*To change what a scheduled task does when it fires:* update the task prompt from Telegram.

---

## The CLAUDE.md Hierarchy

There are multiple CLAUDE.md files. They layer on top of each other:

1. `groups/global/CLAUDE.md` — applies to ALL agents. Contains "About Matt" and message formatting rules.
2. `groups/main/CLAUDE.md` — applies only to the main Telegram chat agent.
3. `groups/telegram_main/CLAUDE.md` — applies to the Telegram main channel agent.
4. `groups/briefing/CLAUDE.md` — applies only to the daily briefing agent.
5. `groups/product-briefing/CLAUDE.md` — applies only to the product briefing agent.
6. `groups/weekly-summary/CLAUDE.md` — applies only to the weekly summary agent.
7. `groups/monthly-summary/CLAUDE.md` — applies only to the monthly summary agent.

To edit any of these: SSH into the Mac Mini and edit the file directly. They're plain markdown.

---

## Scheduled Tasks

All tasks live in the NanoClaw task database. To view them: ask Second Brain "show me my scheduled tasks."

*Task types:*
- *container* — spawns a Docker container running Claude, reads the task prompt, does work
- *script* — runs a bash script directly on the Mac Mini host (no Claude, no container)

*To change a task's schedule or prompt:* use the `update_task` MCP tool from Telegram.

*To pause/resume a task:* use `pause_task` / `resume_task` from Telegram.

*To trigger a one-off run:* use `schedule_task` with `schedule_type: once` and a near-future timestamp.

*Cron format (for reference):*
- `0 7 * * 1-5` = 7am Monday–Friday
- `0 7 * * 6` = 7am Saturday
- `0 7 1 * *` = 7am on the 1st of each month
- `*/30 * * * *` = every 30 minutes

---

## Briefings

The briefing pipeline has three layers:

*Instructions file* (in the vault) — tells the agent what to research, how to structure the output, what sources to use. Editable from Telegram. Located at `projects/intelligence/instructions/`.

*Task prompt* — tells the agent to read the instructions file and run the briefing. Where the send-notification step lives.

*Output* — saved to `projects/intelligence/ai-briefings/YYYY-MM-DD.md`. Committed to GitHub automatically.

*Product briefing* — a separate daily briefing focused on product/tech news. Same three-layer structure:
- Instructions: `projects/intelligence/instructions/daily-products.md`
- Output: `projects/intelligence/product-briefings/YYYY-MM-DD.md`
- Schedule: weekdays at 7am (same as daily briefing)

*Archiving* — the `archive-briefings` task runs weekly (Sunday midnight) and keeps only the 7 most recent briefings in each folder, moving older ones to `_archive/`. Config is in `scripts/archive-briefings.conf`.

*Test runs* — use `test-briefing.sh` to trigger a one-off briefing without affecting the schedule:
```bash
test-briefing daily|weekly|monthly|product
```
This creates a suffixed file (e.g. `2026-03-23b.md`), disables dedup, and auto-reverts the prompt.

To change briefing content/structure: edit the instructions file.

To change notification behavior: update the task prompt.

---

## The Vault

The Obsidian vault lives at `~/second-brain/` on the Mac Mini. It's synced three ways:
- *Obsidian Sync* — device sync between Mac Mini, MacBook Pro, and iPhone (near real-time)
- *Git* — commits and pushes to GitHub every 30 minutes (via vault-sync task)
- *NanoClaw containers* — mounted at `/workspace/extra/second-brain` (read/write)

Changes made from Telegram (via Second Brain editing files) go into the vault immediately. Obsidian Sync picks them up within a minute or two. Git syncs every 30 minutes.

Nothing in the vault is permanent in a scary way — git history means everything is recoverable.

---

## What Can Break (and What Can't)

*Hard to break accidentally:*
- Vault files — git-tracked, fully reversible
- Task prompts — editable at any time, old version is just gone (not versioned)
- Briefing instructions — git-tracked

*Possible to break with some effort:*
- Task schedules — wrong cron expression means a task never fires; easy to fix
- CLAUDE.md edits — bad instructions can confuse agents; fix by editing the file again

*Can't break from Telegram:*
- NanoClaw itself — requires host-level changes
- Container configuration — requires editing nanoclaw config files on host
- Docker setup — requires host access

---

## Common Operations

*Change when the weekly summary runs:*
Ask Second Brain: "Change the weekly summary to run on [day] at [time]."

*Change what the daily briefing covers:*
Edit `projects/intelligence/instructions/daily-briefing.md` from Telegram or Claude Code.

*Add something to tomorrow's to-do list:*
Tell Second Brain: "Add [item] to tomorrow's to-do list."

*Trigger a briefing now:*
Ask Second Brain: "Trigger a one-off daily briefing." Or from the host: `test-briefing daily` (also works with `weekly`, `monthly`, `product`).

*See all scheduled tasks:*
Ask Second Brain: "Show me my scheduled tasks."

*Add a new scheduled reminder:*
Ask Second Brain: "Remind me to [thing] every [day] at [time]."

---

## Files Worth Knowing

| File | What it is |
|------|-----------|
| `daily-to-do.md` | Daily to-do list, most recent week at top |
| `session-tasks.md` | Running backlog of Second Brain improvements |
| `projects/intelligence/inbox.md` | Links and things to read/explore later |
| `projects/intelligence/instructions/daily-briefing.md` | Daily briefing instructions |
| `projects/intelligence/instructions/daily-products.md` | Product briefing instructions |
| `projects/intelligence/instructions/weekly-summary.md` | Weekly summary instructions |
| `projects/intelligence/instructions/monthly-summary.md` | Monthly summary instructions |
| `~/nanoclaw/scripts/test-briefing.sh` | Ad-hoc briefing trigger script |
| `~/nanoclaw/scripts/archive-briefings.conf` | Briefing archive retention config |
| `projects/nanoclaw/README.md` | Infrastructure overview |
| `projects/intelligence/README.md` | Intelligence layer overview |
