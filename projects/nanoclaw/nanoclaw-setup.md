---
title: NanoClaw Setup
status: living
created: 2026-03-03
updated: 2026-03-18
version: 1.9
---

# NanoClaw Setup

## What Is NanoClaw

NanoClaw is an open-source AI agent framework written in TypeScript/Node.js, focused on security and container isolation. It runs as a single host process that spawns Docker containers, each running the Claude Agent SDK. Agents are sandboxed — API keys never enter containers (a credential proxy on port 3001 injects them), and filesystem IPC handles all communication between containers and the host.

**Repo:** https://github.com/qwibitai/nanoclaw

### Core architecture

- **Host process** — polls for messages and scheduled tasks, manages container lifecycle, proxies credentials
- **Containers** — isolated environments running Claude Agent SDK with tools (bash, web search, browser, MCP tools for scheduling and messaging)
- **Task scheduler** — built-in scheduling using cron expressions, intervals, or one-time timestamps (replaces crontab). Two task modes: container tasks (full Claude Agent SDK) and script tasks (direct bash on host, no AI tokens)
- **Credential proxy** — HTTP server on port 3001 that injects Anthropic API keys into container requests and serves GitHub tokens to containers via a git credential helper
- **Filesystem IPC** — containers write JSON files to `data/ipc/{group}/` to send messages or create tasks; the host watches for these files
- **Group folders** — each agent gets a `groups/{name}/` folder with a `CLAUDE.md` that serves as persistent memory and instructions

### Key file paths once installed

```
nanoclaw/
  src/                    # Host process source (TypeScript)
  container/              # Dockerfile + agent-runner (runs inside containers)
  groups/                 # Per-agent folders with CLAUDE.md memory
  store/messages.db       # SQLite database
  data/sessions/          # Agent session state
  data/ipc/               # Container IPC directories
  .env                    # Auth credentials (gitignored)
  launchd/                # macOS launchd plist
```

---

## Setup Plan

### Prerequisites

- [x] **Docker Desktop** installed and running
- [x] **Node.js 20+** installed (v25.8.0)
- [x] **Claude Code CLI** installed
- [x] **Git credentials** — served to containers via credential proxy (see Phase 5)

### Phase 1 — Fork, clone, install ✓

1. ~~`gh repo fork qwibitai/nanoclaw --clone`~~
2. ~~`cd nanoclaw && claude` then run `/setup`~~
3. ~~The `/setup` skill handles: npm install, Docker image build, `.env` creation, launchd plist setup~~

Completed 2026-03-10. Fork at `mattli/nanoclaw`, upstream at `qwibitai/nanoclaw`. Node v25.8.0, Docker container built and tested. Auth via Claude subscription OAuth token. Service running via launchd.

### Phase 1b — Telegram channel ✓

Added Telegram as the primary channel (merged `nanoclaw-telegram` skill branch). Bot: **@matts_second_brain_bot**. Registered as main chat (`tg:8790860459`, no trigger prefix needed). Fixed test suite for Markdown parse_mode. Group Privacy still default (bot sees @mentions only in groups — fine for now since using direct chat).

### Phase 2 — Configure for second-brain ✓

4. ~~Add auth to `.env`~~ — done (OAuth token)
5. ~~Add the second-brain vault to the mount allowlist~~ — done at `~/.config/nanoclaw/mount-allowlist.json` with `allowReadWrite: true`
6. ~~Create a briefing group folder at `groups/briefing/` with a `CLAUDE.md` that contains or points to the daily-briefing instructions~~ — done. CLAUDE.md points to `/workspace/extra/second-brain/ai-intelligence/instructions/daily-briefing.md`, remaps paths to container mount, skips git (host handles sync).
7. ~~Configure `containerConfig` for the main group to mount the vault at `/workspace/extra/second-brain`~~ — done (fixed allowlist format from plain strings to proper `AllowedRoot` objects, added `additionalMounts` to group's `container_config` in SQLite). Also set `nonMainReadOnly: false` in the allowlist so the briefing group can write to the vault.

### Phase 3 — Schedule the daily briefing ✓

8. ~~Create a scheduled task via NanoClaw's task scheduler with cron `0 7 * * 1-5` targeting the briefing group~~ — done. Task ID `daily-briefing`, results sent to Telegram (`tg:8790860459`).
9. ~~The agent inside the container will: read the instructions, do web research, write the briefing markdown~~ — agent commits and pushes directly via credential proxy. Vault-sync script task catches any manual edits every 30 min.
10. ~~This replaces the current crontab entry for daily briefings~~ — done. Old daily briefing cron removed.

### Phase 4 — Launch as background service ✓

11. ~~Install the launchd plist to `~/Library/LaunchAgents/com.nanoclaw.plist`~~
12. ~~`launchctl load ~/Library/LaunchAgents/com.nanoclaw.plist`~~
13. ~~Test with a manual trigger before relying on the schedule~~ — triggered test run from Telegram
14. ~~Remove the old daily briefing crontab entry once confirmed working~~ — removed

### Phase 4b — Vault git sync ✓ → replaced by Phase 5

~~Originally a host-side cron/launchd job. Removed — macOS TCC blocked iCloud Drive access from launchd processes, making it unreliable. Replaced by container-based git via the credential proxy (Phase 5).~~

### Phase 5 — Git credential proxy ✓

**Problem:** Containers need git access (vault sync now, autonomous coding soon), but tokens shouldn't live inside containers.

**Solution:** Extended the existing credential proxy (port 3001) to serve git credentials. The same proxy that injects Anthropic API keys now also handles GitHub tokens — one place for all secrets.

How it works:
1. `GITHUB_TOKEN` in `.env` — a single GitHub PAT scoped to needed repos
2. Credential proxy serves `GET /git-credentials` — returns the token in git credential helper format
3. Container Dockerfile installs `git-credential-nanoclaw` — a shell script that calls `curl $NANOCLAW_CREDENTIAL_PROXY/git-credentials`
4. Git is configured system-wide in the container to use this helper (`git config --system credential.helper nanoclaw`)
5. Every container can `git clone/push/pull` any repo the PAT covers — token never enters the container environment or filesystem

**Why not embed tokens in `.git/config` per-repo?** Doesn't scale. Adding repos means editing configs. The proxy approach: add repos to the PAT scope, done.

**Why not mount `~/.git-credentials`?** Mount security blocks paths containing "credentials" by default.

Replaces the broken launchd/VaultSync.app approach (removed). Briefing agents now commit and push directly after writing files.

### Phase 5b — Vault sync as script task ✓

Added a `vault-sync` scheduled task that runs every 30 minutes (`*/30 * * * *`) to catch manual vault edits. Uses the new `script` context_mode — runs as a direct bash command on the host, no container, no AI tokens.

**Why script tasks?** Spinning up a full Claude Code container for `git add && git commit && git push` wastes subscription tokens on a mechanical task. Script tasks (`context_mode: 'script'`) execute the prompt as a shell command via `execFile('/bin/bash', ...)` directly in the NanoClaw process.

**Why this doesn't hit the old TCC issue:** The old VaultSync.app was a separate unsigned binary launched by launchd — macOS wouldn't grant it iCloud Drive access. Script tasks run inside the NanoClaw Node.js process, which inherits Terminal.app's Full Disk Access permissions. (Note: iCloud is no longer used for vault sync — replaced by Obsidian Sync on 2026-03-18.)

**Task config:**
- ID: `vault-sync`
- Schedule: `*/30 * * * *`
- Context mode: `script`
- Prompt: `cd /Users/mattli/second-brain && git add -A && (git diff --cached --quiet || git commit -m "vault sync $(date)") && git push`
- Only notifies on failure

**iCloud mmap fix history:** Originally the vault lived inside iCloud Drive, which caused persistent `mmap failed: Resource deadlock avoided` errors. First fix (2026-03-16) moved `.git` to `~/vault-git-data` with `GIT_DIR`/`GIT_WORK_TREE` env vars. This reduced but didn't eliminate errors — iCloud also locked working tree files during `git add`. Permanent fix (2026-03-18): replaced iCloud with Obsidian Sync, moved vault to `~/second-brain/` as a plain local folder with `.git` inside it. No more env var hacks needed.

### Phase 5c — Deterministic task confirmations ✓

Task scheduler no longer forwards agent text to Telegram. Instead, it sends a deterministic status line after each task completes (e.g. `daily-briefing: ✅ completed`). This prevents issues where agents wrap output in `<internal>` tags (which get stripped by the router, resulting in no notification) or include unwanted summaries.

### Migration order

Migrate one cron job at a time. Keep the others on Claude Code until each is proven stable on NanoClaw.

1. **Daily briefing** (first — highest frequency, fastest feedback loop)
2. **Weekly summary** (after daily is stable for ~1 week)
3. **Monthly summary** (after weekly is stable)

---

## Planned Integrations

- **Telegram** ✓ — @matts_second_brain_bot, direct chat as main channel
- **Gmail** — email reading and sending as agent actions
- **Obsidian** ✓ — vault mounted at `/workspace/extra/second-brain` (read/write for main group)
- **GitHub** — git access via credential proxy; containers can clone/push/pull any repo covered by the PAT in `.env`
- **Remote Control** — `/remote-control` lets you start a Claude Code session on the Mac Mini from Telegram, running directly on the host (not in a container). Useful for NanoClaw admin tasks without SSH-ing in. Merged from upstream 2026-03-16, not yet configured.

---

## Fork Maintenance

Your fork (`mattli/nanoclaw`) is a customized copy of the upstream repo (`qwibitai/nanoclaw`). It's where your code lives — pushing to it is how you back up changes to GitHub.

### Upstream sync

Upstream releases new features and fixes regularly. Your fork works independently — you don't need to stay in sync. When you want to pull in updates, use `/update-nanoclaw` from a Claude Code session. Aim to check roughly once a month, or when you hear about a feature you want.

### GitHub Actions workflows

Upstream's workflows (version bumps, token count badges, skill branch merging) came with the fork but don't apply to you. They were disabled on 2026-03-16 because they require upstream-specific secrets and caused failure emails on every push. Only the CI workflow remains active.

If you ever need to re-enable them: `gh workflow enable <id> --repo mattli/nanoclaw`.

### Skill branches

Skill branches (`origin/skill/*`) are pre-built feature branches. If they fall behind `main` they can develop merge conflicts. If you're not using a skill branch, it's safe to delete it. You can always reinstall a skill fresh later.

Current skill branches: `skill/apple-container`, `skill/compact`, `skill/ollama-tool` (has conflict — safe to delete if not using).

### Vault sync

The vault lives at `~/second-brain/` — a plain local folder synced across devices via Obsidian Sync ($4/month). Previously the vault was in iCloud Drive, which caused persistent `mmap failed: Resource deadlock avoided` errors when git tried to read files iCloud was actively syncing. Migrated to Obsidian Sync on 2026-03-18. The vault-sync script is now a simple `cd ~/second-brain && git add -A && git commit && git push` — no `GIT_DIR`/`GIT_WORK_TREE` hacks needed. Obsidian is installed on the Mac Mini to receive sync updates from other devices.

---

## Future Architecture

Once the basic setup is running, the briefing system can evolve from a single sequential agent to parallel multi-agent orchestration:

- **Specialized fetch agents** — one agent per data source or section, running in parallel
- **Orchestrator agent** — receives outputs from fetch agents and handles synthesis
- **Optimized model selection** — lighter/faster models for fetch tasks, more capable models for synthesis and writing

This should significantly reduce total briefing runtime and allow each agent to be tuned for its specific task.

---

## Cost Optimization Strategy

- **Haiku** (or a local open-weight model via Ollama) for fetch tasks and first-pass relevance filtering
- **Sonnet** for deep reading, nuance detection, and synthesis
- **Expected savings:** 30-40% vs current single-model approach where Sonnet handles everything
- **Key tradeoff:** Haiku may miss subtle signals during filtering — tune the relevance threshold carefully to avoid discarding important material before Sonnet sees it
- **Local open-weight models** (e.g. Llama, Mistral via Ollama) worth evaluating for fetch/classify tasks — zero API cost, full privacy, no data leaving the Mac Mini
- **Best architecture:** local model for fetch/classify → Haiku for relevance filter → Sonnet for deep reading and synthesis

---

## Vision

Each agent should have a distinct name and voice via ElevenLabs. Voice and name combinations make agents feel like distinct collaborators rather than a generic AI. Examples:

- **Briefing agent** — calm, authoritative
- **Research agent** — thoughtful, measured
- **Product thinking agent** — conversational

Design agents as named entities from the start — not bolted on later.

**End goal:** AirPods-in, hands-free interaction with the second brain while working. Voice in via iPhone microphone or Telegram. Voice out via ElevenLabs text-to-speech.

---

## Open Questions

- ~~**Auth model:** Claude subscription OAuth token (free with Pro/Team) vs pay-per-use API key?~~ → OAuth token (subscription)
- ~~**Telegram now or later?**~~ → Done during initial setup
- ~~**Git inside containers:**~~ → Solved via credential proxy. Containers use `git-credential-nanoclaw` helper that fetches tokens from the host proxy at request time.

---

## Status

**Phases 1–5c complete (2026-03-16).** NanoClaw running as a background service via launchd. Telegram bot (@matts_second_brain_bot) is the primary channel. Daily briefing, weekly summary, and monthly summary all running as NanoClaw scheduled tasks. Each briefing agent commits and pushes to GitHub after writing via the credential proxy. Vault-sync script task runs every 30 min to catch manual edits (no container, no AI tokens). Task scheduler sends deterministic confirmations. `GITHUB_TOKEN` added to `.env`.

CLAUDE.md restructured: personal rules (plan first, never delete, vault path, end-of-session ritual, quick reference) moved to global `~/.claude/CLAUDE.md`. Project-level `~/nanoclaw/CLAUDE.md` now contains only NanoClaw developer context (architecture, key files, skills, development commands, troubleshooting).
