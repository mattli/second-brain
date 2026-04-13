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

| Task | Schedule | Type | What it does |
|------|----------|------|--------------|
| 📋 Daily Briefing | 7am Mon–Fri | container | Researches and writes AI intelligence briefing |
| 🛠 Product Briefing | 6am Saturday | container | Researches and writes weekly product intelligence briefing |
| 📊 Weekly Summary | 7am Saturday | container | Synthesizes the week's daily briefings |
| 📅 Monthly Summary | 7am 1st of month | container | Synthesizes monthly trends, updates product-vision.md |
| 📝 Daily To-Do | 8am daily | container | Reads today's section from daily-to-do.md, sends to Telegram |
| 📚 Readwise Wiki | 3am Mon + Thu | container | Processes week's Readwise saves into wiki pages at `intelligence/wiki/` (runs on Opus, 90min timeout) |
| 🗄 Archive Briefings | Midnight Sunday | script | Moves old briefing files to `_archive/` per retention rules |
| Vault Sync | Every 30 min | script | Commits and pushes vault changes to GitHub |
| Obsidian Sync Check | Every 30 min | script | Verifies Obsidian Sync is running |

## MCP Servers (Container)

| Server | Transport | Auth | Purpose |
|--------|-----------|------|---------|
| parallel-search | HTTP via credential proxy | Bearer API key | Web search with ranked results and excerpts |
| parallel-task | HTTP via credential proxy | Bearer API key | Task management |
| readwise | stdio via `mcp-remote` | OAuth (tokens in `~/.mcp-auth/`) | Access saved articles, highlights, and notes |

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

## Related Docs

- [Intelligence README](../intelligence/README.md) — briefing types, instructions, test runs, architecture, archival
- [NanoClaw Skills](nanoclaw-skills.md) — installed and available skills
- [NanoClaw source](~/nanoclaw/CLAUDE.md) — developer docs for working on the codebase
- [mac-mini-setup.md](mac-mini-setup.md) — Mac Mini build order and setup
- [nanoclaw-setup.md](nanoclaw-setup.md) — planning doc for multi-agent architecture
- [operator-guide.md](operator-guide.md) — operator reference for managing NanoClaw
- [update-v1.2.52-2026-04-13.md](update-v1.2.52-2026-04-13.md) — v1.2.52 merge details, decisions, and rollback
- [instruction-map-2026-04-12.html](instruction-map-2026-04-12.html) — visual map of all CLAUDE.md, MEMORY.md, and instruction files across NanoClaw, ~/.claude, and the vault (open in browser)
