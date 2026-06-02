# NanoClaw

Personal AI assistant and automation engine running on a Mac Mini M4 home server. Manages intelligence briefings, scheduled tasks, and interactive chat via Telegram.

## Infrastructure

| Component | Role |
|-----------|------|
| Mac Mini M4 | Always-on home server — runs all automated jobs |
| NanoClaw | Node.js orchestrator — spawns Docker containers running Claude Agent SDK |
| Docker | Container runtime for agent isolation (each group gets its own filesystem) |
| Telegram | Primary interface — `@matts_second_brain_bot` (default) and `@matts_wiki_tutor_bot` (Wiki Tutor persona). Per-group bot assignment via `~/.config/nanoclaw/telegram-bots.json` |
| Claude subscription OAuth | Auth for containers via NanoClaw's credential proxy (port 3001) |
| GitHub | Version control — vault synced every 30 minutes |
| Obsidian | Note-taking app — vault at `~/second-brain/` |
| Obsidian Sync | Syncs vault between Mac Mini, MacBook Pro, and iPhone |

## Registered Groups

| Group | Folder | Purpose |
|-------|--------|---------|
| telegram_main | `telegram_main` | Interactive Telegram chat (main group) |
| Daily Briefing | `briefing` | Daily AI intelligence briefing agent |
| Product Briefing | `product-briefing` | Weekly product intelligence briefing agent |
| Weekly Summary | `weekly-summary` | Weekly synthesis agent |
| Monthly Summary | `monthly-summary` | Monthly synthesis agent |
| Readwise Wiki | `readwise-wiki` | Compiles Readwise saves into interlinked wiki (Karpathy LLM Wiki pattern) |
| Wiki Tutor | `wiki-tutor` | Reference librarian over the Readwise wiki — menu-first drill-down, nuggets not summaries, read-only mount, `requiresTrigger: false`. Dedicated Telegram bot persona `@matts_wiki_tutor_bot` (assigned via `~/.config/nanoclaw/telegram-bots.json`) |

## Scheduled Tasks

| Task                   | Schedule         | Type      | What it does                                                                                                                                                         |
| ---------------------- | ---------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📋 Daily Briefing      | 7am Mon–Fri      | container | Researches and writes AI intelligence briefing                                                                                                                       |
| 🛠 Product Briefing    | 6am Saturday     | container | Researches and writes weekly product intelligence briefing                                                                                                           |
| 📊 Weekly Summary      | 8am Saturday     | container | Synthesizes the week's daily briefings                                                                                                                               |
| 📅 Monthly Summary     | 7am 1st of month | container | Synthesizes monthly trends, updates product-vision.md                                                                                                                |
| 📝 Daily To-Do         | 8am daily        | container | Reads today's section from daily-to-do.md, sends to Telegram                                                                                                         |
| 🧹 Backlog Maintenance | Midnight Sunday  | container | Moves checked items in `backlog.md` into the `### Completed` section                                                                                                 |
| 📚 Wiki list-maker (daily) | 1am daily        | container | Triages new Readwise saves since last run, dispatches one per-doc worker per Tier A doc (workers run as separate scheduled tasks, no notification each), commits log (Opus)            |
| 📚 Wiki weekly wrap-up     | 11pm Sunday      | container | Lint pass, dedup candidates, cluster promotion from `unorganized.md`, writes `last-run-manifest.md` (Opus)                                                                             |
| 📚 Wiki folder review      | 3am 1st of month | container | Evaluates wiki folder organization, writes scannability-focused proposal to `resources/wiki/folder-review.md` (proposal-only; apply happens via Claude Code session)                   |
| 🗄 Archive Briefings   | Midnight Sunday  | script    | Moves old briefing files to `_archive/` per retention rules                                                                                                          |
| Vault Sync             | Every 30 min     | script    | Commits and pushes vault changes to GitHub                                                                                                                           |
| Obsidian Sync Check    | Every 30 min     | script    | Verifies Obsidian Sync is running                                                                                                                                    |

**Completion notifications.** Container-type tasks ping telegram_main with `${display_name}: ✅ done` after a successful run (failures get `❌ failed`). Tasks without a `display_name` (e.g. per-doc workers the list-maker dispatches) stay silent. Pseudo-prefix `chat_jid` values (`task:`, `internal:`) fall back to the registered main group at send time, so the ping lands even when the task's home group isn't a Telegram chat. Source: `task-scheduler.ts:303` + `index.ts` sendMessage dep; details in `~/nanoclaw/CLAUDE.md` § Scheduler Done-Pings.

## MCP Servers (Container)

| Server          | Transport                 | Auth                             | Purpose                                      |
| --------------- | ------------------------- | -------------------------------- | -------------------------------------------- |
| parallel-search | HTTP via credential proxy | Bearer API key                   | Web search with ranked results and excerpts  |
| parallel-task   | HTTP via credential proxy | Bearer API key                   | Task management                              |
| readwise        | stdio via `mcp-remote`    | OAuth (tokens in `~/.mcp-auth/`) | Access saved articles, highlights, and notes |

Parallel servers use the credential proxy pattern — API key in `.env`, proxy injects auth headers, containers never see secrets. Readwise uses OAuth which requires `mcp-remote` as a stdio bridge; tokens were obtained via SSH port-forwarded OAuth flow and are mounted read-write into containers at `/home/node/.mcp-auth`.

To re-authenticate Readwise (e.g. after token expiry): `ssh -L 3334:localhost:3334 <mac-mini>` then on the Mini run `npx -y mcp-remote https://mcp2.readwise.io/mcp 3334` and authorize in browser.

## Authentication

- **Interactive Claude Code sessions** — Claude.ai Max subscription credentials, stored in macOS Keychain
- **NanoClaw containers** — Claude subscription OAuth token, injected by credential proxy; API keys never enter containers
- **Script tasks** — run directly on host, no AI tokens needed

## Cost

- Daily briefing: ~$1.00/run (Sonnet 4.6 via Claude subscription)
- Weekly summary: ~$1.17/run
- Estimated monthly: ~$25–26 (weekday briefings + weekly summaries)

## Vision

### Phase 2 — PM Best Practices Layer

Extend from intelligence into on-demand product management. Query via Telegram, get structured PM output back — SWOT analysis, RICE scoring, PRD generation, technical requirements.

### Phase 3 — Agent Swarm for Execution

Coordinated specialized agents take a vetted idea from decision to working prototype — compressing market signal to shipped experiment from weeks to hours.

### Infrastructure Improvements

- Multi-agent orchestration — parallel fetch agents feeding a synthesis orchestrator
- Model routing — lighter models for fetch/classify, heavier models for synthesis
- Cost reduction via multi-agent architecture

## Version

**Current:** v1.2.52 (updated 2026-04-13 from v1.2.15). Using native credential proxy (OneCLI deferred). See [update-v1.2.52-2026-04-13.md](update-v1.2.52-2026-04-13.md) for full merge details, nuances, and rollback instructions.

## Credential Proxy — Two-Layer Defense Against Anthropic Edge 502s

Long agent runs (especially the readwise-wiki compiler) had been dying intermittently for over a week with 502 Bad Gateway errors. Root cause turned out to be two distinct failure modes that looked identical from the container's perspective:

1. **DNS-driven 502s** — Tailscale's MagicDNS proxy occasionally drops/delays queries for non-tailnet names; surfaces as `ENOTFOUND`/`EAI_AGAIN`, the proxy's `httpsRequest` errors, and the proxy synthesizes a 502 to the container. **Fixed** via a public-DNS resolver (1.1.1.1, 1.0.0.1, 8.8.8.8) with a 5-minute cache and last-known-good IP fallback. TLS SNI preserved by passing original hostname as `servername`. See `src/credential-proxy.ts:31-74`.
2. **Genuine upstream 502/503/504/529 from Anthropic's Cloudflare-fronted edge** — proxy was forwarding these verbatim, killing runs with no retry safety net. **Fixed 2026-04-27** via a conservative best-practices retry wrapper in `src/credential-proxy.ts`: retries only 502/503/504/529 (per RFC 9110 + Anthropic docs), max 2 attempts, exponential backoff with full jitter (base=1000ms, max=30s), honors `Retry-After` header when present, only retries when no bytes have been written downstream (streaming-safe — Anthropic uses SSE), drains the upstream response before retry so the socket is released, and logs each attempt for observability. Sized conservatively because agent-runner uses `@anthropic-ai/claude-agent-sdk` (which spawns the `claude` Code CLI subprocess — the CLI does its own retries on an unknown internal budget; stacking 3-5 more would compound). Parallel AI route deferred — different outage profile.

**To monitor:**
```bash
grep "Credential proxy retrying" ~/nanoclaw/logs/nanoclaw.log    # success path — retries firing
grep "Credential proxy upstream error" ~/nanoclaw/logs/nanoclaw.log  # connection-level failures
grep "Credential proxy DNS resolve failed" ~/nanoclaw/logs/nanoclaw.log  # mode 1 should stay quiet
```

## Related Docs

- [Intelligence README](../intelligence/README.md) — briefing types, instructions, test runs, architecture, archival
- [NanoClaw Skills](nanoclaw-skills.md) — installed and available skills
- [NanoClaw source](~/nanoclaw/CLAUDE.md) — developer docs for working on the codebase
- [mac-mini-setup.md](mac-mini-setup.md) — Mac Mini build order and setup
- [nanoclaw-setup.md](nanoclaw-setup.md) — planning doc for multi-agent architecture
- [operator-guide.md](operator-guide.md) — operator reference for managing NanoClaw
- [update-v1.2.52-2026-04-13.md](update-v1.2.52-2026-04-13.md) — v1.2.52 merge details, decisions, and rollback
- [instruction-map-2026-04-12.html](instruction-map-2026-04-12.html) — visual map of all CLAUDE.md, MEMORY.md, and instruction files across NanoClaw, ~/.claude, and the vault (open in browser)
