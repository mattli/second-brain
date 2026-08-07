# Dead-man's switch for `vault-sync` (healthchecks.io)

**Date:** 2026-08-06
**Status:** proposed, not built
**Area:** [[nanoclaw-landscape]] · backlog: Infrastructure

## The gap

`vault-sync` is a NanoClaw scheduled task (`context_mode=script`, cron `*/30 * * * *`)
that commits and pushes `~/second-brain` from the Mac Mini. It is not a cron job — the
schedule lives in `scheduled_tasks` in `store/messages.db`, which is why nothing shows
up in `crontab -l` or `launchctl`.

A **failing** task already alerts: `src/task-scheduler.ts` sends
`${task.id}: ❌ failed` to Telegram on a non-zero exit. What is not covered is
**silence**. A healthy scheduler and a dead one produce identical output — nothing.

| Scenario | Telegram ping | Session-start staleness check | Dead-man's switch |
|---|---|---|---|
| Task fails (network, git) | ✅ | ✅ | ✅ |
| NanoClaw wedged but alive | ❌ | ✅ | ✅ |
| NanoClaw job unloaded | ❌ | ✅ | ✅ |
| **Mini off, asleep, or offline** | ❌ | ❌ | ✅ |
| **Sessions stop being started** | ❌ | ❌ | ✅ |

launchd `KeepAlive` restarts NanoClaw on crash, but silently, and it does nothing for a
wedged-but-alive process. This is the "Prove the Probe Works Before Reading Its Silence
as Evidence" rule applied to a scheduler: no local probe can report that its own machine
is down.

## The proposal

Invert the problem. Rather than watching NanoClaw, have `vault-sync` report in on every
success; healthchecks.io alerts when a report fails to arrive.

**Setup (~5 min, free tier, no card):**

1. Create a check: name `vault-sync`, period **30 minutes**, grace **20 minutes**.
   Yields a ping URL `https://hc-ping.com/<uuid>`.
2. Notification channel — email by default; a Telegram webhook lands it alongside the
   existing task-failure pings.
3. Append to the `vault-sync` task prompt:

   ```
   && curl -fsS -m 10 --retry 3 https://hc-ping.com/<uuid> > /dev/null
   ```

The `&&` placement is the design. The ping fires **only if `git push` succeeded** — a
network failure, an auth failure, or a conflict breaks the chain, no ping is sent, and
the alert fires. It verifies the outcome, not merely that a process is alive.

## Constraints and caveats

- **False alarms when the Mini is legitimately off** (travel, reboot, power cut). The
  20-minute grace absorbs a reboot; a planned outage means pausing the check. Inherent
  to dead-man's switches, not a flaw in this setup.
- **The ping URL is a capability, not a secret.** Whoever holds it can only send a false
  "all is well," suppressing alerts rather than leaking data. It still must **not** go
  into `~/dotfiles` or the vault — both are pushed to GitHub, and a UUID in a public repo
  lets anyone silence the alarm. It belongs in the task prompt in `store/messages.db`,
  which is local and untracked.
- **Editing the prompt hits the two-sources-of-truth rule** (`~/nanoclaw/CLAUDE.md`): the
  `scheduled_tasks` row *and* `data/ipc/telegram_main/current_tasks.json` both need
  updating, or the running container agent keeps seeing the old prompt.
- **Liveness, not correctness.** It proves the task ran and pushed. A sync that commits
  an empty or wrong tree still pings green.
- **Watches one task, not the scheduler.** `dotfiles-sync` would need its own check —
  though since both share a scheduler, one is a reasonable proxy for its health.

## Related

- [[nanoclaw-landscape]] — where the scheduled-task machinery is described.
- `dotfiles-sync` (registered 2026-08-06, cron `5,35 * * * *`) — the second script task,
  a backstop for the Claude Code dotfiles hooks. Same silent-failure exposure.
