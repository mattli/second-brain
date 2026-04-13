# NanoClaw Update: v1.2.15 to v1.2.52

**Date:** 2026-04-13
**Commits merged:** 365 from upstream/main + native-credential-proxy skill branch
**Breaking changes crossed:** v1.2.35 (OneCLI Agent Vault), v1.2.36 (pino logger removed)

## What Changed

### Upstream features adopted

- **Per-group trigger patterns** — each group can have its own trigger word instead of sharing the global `@Second Brain`. Configured via `group.trigger` field.
- **MAX_MESSAGES_PER_PROMPT** — caps message history sent to containers (default 10). Prevents full chat history from being dumped into agent context on busy groups.
- **Stale session auto-recovery** — if a session `.jsonl` goes missing (crash, manual deletion), the system detects it and starts a fresh session instead of retrying infinitely.
- **Session cleanup service** — auto-prunes stale session artifacts on startup and daily.
- **Reply/quoted message support** — new DB columns (`reply_to_message_id`, `reply_to_message_content`, `reply_to_sender_name`) and router support. Agents now see quoted message context.
- **Task scripts** — scheduled tasks can include a bash `script` that runs before the agent wakes. If `wakeAgent: false`, the agent doesn't spawn. Saves API credits for conditional tasks.
- **Built-in logger** — pino/pino-pretty replaced with a zero-dependency colored logger. Same API (`logger.info({data}, 'msg')`), no behavior change.
- **stopContainer security hardening** — validates container names to prevent command injection, uses `-t 1` for faster stops.
- **Agent-runner source cache refresh** — detects when canonical source is newer than the cached copy and refreshes automatically (reduces but doesn't eliminate the need for manual cleanup).
- **Message cursor recovery** — recovers from missing `lastAgentTimestamp` by finding the last bot reply in the DB.
- **CLAUDE.md template for new groups** — new groups get a copy of the global or main CLAUDE.md automatically.
- **ESLint config** — error-handling rules added.
- **New skills:** emacs channel, Karpathy LLM Wiki, macOS status bar, claw CLI, channel-formatting, migrate-nanoclaw, migrate-from-openclaw, init-onecli.

### Local customizations preserved

- **Telegram multi-bot** — default bot + wiki_tutor bot, per-group assignment via JSON config
- **Readwise MCP** — mcp-remote in Dockerfile, OAuth token mounts, tool permissions in agent-runner
- **Parallel AI integration** — credential proxy routes for search and task MCP endpoints
- **Per-group model config** — `model` field on `ContainerConfig` (upstream removed it; we kept it)
- **Git credential proxy endpoint** — `/git-credentials` route on the credential proxy
- **Last30Days IPC skill** — product briefing research via X/Twitter
- **Thread search IPC handler**
- **All scheduled tasks and group configurations** — unchanged

### Credential proxy decision

Upstream replaced the built-in credential proxy with OneCLI Agent Vault (v1.2.35). We kept the native credential proxy by merging the `upstream/skill/native-credential-proxy` escape hatch branch. Reasons:

1. Our proxy has custom routes (Parallel AI, GitHub tokens) that OneCLI doesn't know about
2. Avoids stacking a new dependency on top of a 37-version jump
3. OneCLI migration becomes a clean, isolated follow-up

**OAuth env var change:** Containers now receive `CLAUDE_CODE_OAUTH_TOKEN=placeholder` (was `ANTHROPIC_AUTH_TOKEN=placeholder`). The credential proxy reads both names with `CLAUDE_CODE_OAUTH_TOKEN` preferred. The `.env` file uses `CLAUDE_CODE_OAUTH_TOKEN`. Everything is aligned.

## Merge nuances

- **`src/channels/index.ts`** — upstream emptied all channel imports (channels are fork repos now). Had to re-add `import './telegram.js'` manually. This caused a startup crash ("No channels connected") that was caught during smoke testing.
- **`package.json` build script** — upstream changed `"build": "tsc && launchctl kickstart..."` to just `"tsc"`. Build no longer auto-restarts NanoClaw. CLAUDE.md updated to reflect this.
- **`grammy` dependency** — upstream removed it (Telegram is a fork repo for them). Re-added since our Telegram code is in-tree.
- **`@onecli-sh/sdk` dependency** — removed since we're not using OneCLI. Cleaned up the test mock that referenced it.
- **`is_group` default for Telegram** — upstream changed the DB migration backfill from `is_group = 1` to `is_group = 0` for `tg:` JIDs. Safe because: (a) the migration only runs on first column creation (existing DBs skip it), and (b) our Telegram code explicitly passes `isGroup` on every message based on `ctx.chat.type`.

## What's left to do

- **OneCLI migration** — deferred. When ready, run `/init-onecli` to install OneCLI and migrate credentials from `.env` to the vault. The Parallel AI and GitHub token proxy routes would need to be reimplemented as OneCLI plugins or kept via a hybrid approach. Not urgent — the native proxy works fine.
- **Container rebuild** — the Dockerfile wasn't rebuilt as part of this merge. The next `./container/build.sh` will pick up the updated agent-runner source. Not blocking — stale session copies were cleaned and will regenerate.
- **Weekly upstream monitoring** — new backlog item added to set up automated upstream release checking so we never fall 30+ commits behind again.

## Verification

| Test | Result |
|------|--------|
| TypeScript build | Clean, no errors |
| Credential proxy — Anthropic route | Forwarding + auth injection working |
| Credential proxy — Parallel AI routes | Forwarding + auth injection working |
| Credential proxy — Git credentials | Returns token correctly |
| Telegram ad-hoc agent spawn | Working (tested via main group message) |
| Scheduled task (daily briefing) | Working — container ran 3.7 min, output landed at `ai-briefings/2026-04-13b.md` |
| upsertChat isGroup call sites | Both Telegram call sites explicitly derive isGroup from chat type |

## Rollback

If issues emerge during the stability period:

```bash
git reset --hard pre-update-backup && npm install && npm run build && launchctl kickstart -k gui/$(id -u)/com.nanoclaw
```

The `pre-update-backup` branch and `.env` backup at `~/.env.nanoclaw-backup-20260413` are preserved.
