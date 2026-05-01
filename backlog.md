### Agent Behavior
- [ ] Periodic README audit — on a regular schedule, scan all folders in the vault for README files, compare contents against the current folder contents, and flag or update anything stale. Could be a NanoClaw cron task or a Claude Code session trigger. Define "stale" heuristic: file listed in README that no longer exists, or new files not mentioned.
- [ ] Fix daily to-do ordering — when adding items to future days, insert them in most-recent-first order (Wed before Tue before Mon). Options: (1) agent always reads the full week section before inserting, or (2) scaffold the full week at the start of each Monday (all 7 day headings pre-created in order) so insertions never need to reorder. Weekly scaffold is simpler and prevents ordering bugs entirely.
- [ ] Update main chat group behavior — think through how Second Brain should ask clarifying questions and follow best practices before making changes (e.g. confirm scope, warn about side effects, suggest alternatives)

### Skills & Tools
- [ ] Install frontend-design skill in Claude Code — enables polished UI component generation as part of the Claude Design → v0 → Claude Code workflow. See products/strategy/design-workflow.md.
- [ ] Install add-compact — adds /compact command for context compaction; needed when Phase 2 PM agent is built
- [ ] Install add-telegram-swarm — agent teams in Telegram, each subagent gets its own bot identity; relevant to Phase 3. Potential use case: adversarial agent debates — one optimistic, one pessimistic, one focused on execution risk — for stress-testing product decisions like pmtxt direction or YC application strategy. Related to the debate-perspectives project in the vault.
- [ ] Investigate add-ollama-tool — local models as tools inside containers, zero API cost for cheap tasks

### Intelligence Pipeline
- [ ] Wiki Tutor conversation synthesis — investigate whether the Wiki Tutor Telegram bot's stored message history is worth synthesizing. If users are asking questions and getting answers grounded in wiki pages, those exchanges could be backlinked from the source wiki pages as "discussions" or used to surface gaps and update the wiki. Evaluate: (1) is there enough volume? (2) does the Q&A reveal knowledge gaps worth filling? (3) would linking conversation excerpts back to wiki pages add value for future sessions?
- [ ] Schedule atomic notes compiler — weekly NanoClaw task that compiles atomic notes from the previous 7 days of Telegram conversation history (main group). Output to resources/atomic-notes/. Pipeline scaffold already exists at projects/atomic-notes/; one-off experiment ran 2026-04-13 and produced 13 usable notes. Decide cadence, prompt format, and whether notes should update in place or append new. Evaluate after ~4 runs whether output is actually useful or just noise.
- [ ] Investigate whether it would be worthwhile to internal link weekly/monthly summaries back to weekly/daily briefings.
- [ ] Key figure publishing alerts — figure out a way to get notified when people like Dario Amodei or DHH publish a new long-form piece or thesis. Could be RSS monitoring, a periodic agent task that checks their blogs/sites, or Readwise feed subscriptions. Goal is to catch essays and posts worth reading without having to actively follow them.
- [ ] Add source count to wiki front matter — each wiki page should include a `sources:` field in its YAML front matter listing how many Readwise sources were used to compile it. Update the wiki compiler to write this automatically.
- [ ] Readwise wiki → weekly summary integration — After ~4 weekly wiki runs (~mid-May), evaluate whether to add a wiki-update step to the weekly summary agent. Check: (1) Is the wiki being referenced by agents during searches or Q&A? (2) Are there obvious gaps where weekly briefing signals (funding rounds, capability shifts, VC theses) would have made wiki pages more useful? (3) Has the lint step surfaced real issues, or is the wiki too small for it to matter? If yes to 1 or 2, build the pipeline — scope it to factual signals only (AI Context, VC Lens, durable category patterns from Category Movement). Skip analysis, skip indie product listings. If no, the wiki needs more mass from Readwise first.

### Cold Mountain (coldmountain.ai)


### NanoClaw
- [ ] Diagnose Telegram response latency — messages to the main group take 10–20+ seconds to get a response. Unknown whether it's container cold start, context loading, MCP startup, model latency, or tool calls within the response. Run diagnostic: send a trivial message ("hi") and a vault-lookup message back to back, compare times. If both slow → cold start or model latency. If only complex one slow → context/tool overhead. Possible knobs: warm containers, lower MAX_MESSAGES_PER_PROMPT, trim CLAUDE.md, route simple tasks to Haiku. Note (2026-04-30): streaming progress (`NANOCLAW_STREAMING_PROGRESS=1`) now masks the wait conversationally — first 🔧 tool note appears within ~1s — but root cause is still unsolved.
- [ ] Update Phase 2 in the NanoClaw README — current vision (PM Best Practices Layer) no longer reflects actual plans; revisit when clearer on what, if anything, replaces it.
- [x] Investigate silent wiki task failure — 3am run failed (root cause: WiFi DNS failure, not API issue) with no Telegram notification. Container exited non-zero but NanoClaw treated it as complete. Fix: catch non-zero container exits and notify. Separate from the network issue — hardwiring to ethernet should prevent the DNS failures, but the missing notification is still a bug.
- [ ] Configure /remote-control — NanoClaw feature already merged, not yet configured. Starts a Claude Code session on the Mac Mini directly from Telegram, returns a browser URL. Full host access without SSH. Priority: next time at Mac Mini.

### Infrastructure
- [ ] Research terminal apps with Claude Code notifications — find a terminal (or terminal + integration) that sends a notification or badge when Claude Code finishes a task or needs a permission grant. Candidates: iTerm2 triggers, Warp AI-native terminal, Ghostty, or a shell hook on the Claude Code process. Goal: stop checking back manually mid-task.
- [ ] Fix macOS keychain on MacBook Pro — Claude Code can't write to login keychain ("User interaction is not allowed" error). Try `security unlock-keychain ~/Library/Keychains/login.keychain-db` first; if that fails, keychain password is out of sync with account password — fix via Keychain Access → login keychain → Edit → Change Password. Not blocking anything now, but will bite next time Claude Code needs to save a credential.
- [ ] Mobile Claude vault access — mobile Claude has no read/write access to the vault; planning sessions can't capture ideas directly. Options: (1) GitHub MCP connector — vault already on GitHub, lowest effort, works today, writes go through git commits; (2) Hosted MCP server via Cloudflare tunnel — more powerful, more work, security surface; (3) Telegram bridge — forward intent from mobile Claude to existing Second Brain agent, indirect but reuses infra.
- [ ] Investigate how to reliably inject current date/time into LLM context. This was done on Claude desktop. Observing how often I run into the issue in claude code & telegram.
- [ ] Set up a dotfiles repo — put shared ~/.zshrc aliases and functions in a private GitHub repo so changes sync across MacBook Pro and Mac Mini without manual duplication. Machine-specific things (vault path, NanoClaw directory) stay in a local file sourced by the shared one.

### Completed
- [x] Hardwire Mac Mini to ethernet — WiFi DNS failures at 3am killed the readwise-wiki scheduled task on 2026-04-13. Prevents future overnight network flakiness.
- [x] Install update-nanoclaw — pull upstream changes with preview and selective cherry-pick; run roughly once a month (2026-04-12)
- [x] Upstream NanoClaw release monitoring — subscribed to the NanoClaw GitHub repo with Watch → Custom → Releases only. Email arrives on every upstream release; glance at notes, act if "BREAKING" or "migration" appears. Rule: 1 breaking change behind = update within ~2 weeks; 2 stacked = update now. (2026-04-13)
- [x] Update NanoClaw v1.2.15 → v1.2.52 — merged 365 upstream commits, kept native credential proxy (Parallel AI, GitHub token, Readwise MCP routes), preserved Telegram multi-bot, per-group model config. OneCLI migration deferred. (2026-04-13)
- [x] Add session start instructions to main group CLAUDE.md (both machines)
- [x] **Readwise wiki compiler** — Bootstrapped wiki with 12 pages from 65 saves, scheduled as weekly NanoClaw task (Fridays 10pm). Instructions at `wiki/instructions/readwise-wiki.md`, output at `resources/wiki/`. (2026-04-05)
- [x] Set up tmux on Mac Mini — keeps SSH sessions alive if connection drops; useful for long Claude Code sessions
- [x] Readwise MCP integration — connected to NanoClaw main group via mcp-remote stdio bridge + OAuth (2026-03-29)
- [x] Investigate Parallel AI MCP skill — installed Search + Task MCP via credential proxy; confirmed working (2026-03-23)
- [x] Add start instruction to check README to global claude.md files (both machines) (2026-03-25)
- [x] Add end instruction to update README "Check if any README.md files in projects you touched need updating to reflect what was done this session" (2026-03-25)
- [x] Automated memory curation — Practical starting point is a curated memory.md read at session start
- [x] Update main Telegram group CLAUDE.md — add communication style preferences (no value judgments on content)
- [x] Investigate last30days skill — better briefing source coverage for Reddit, X, HN (Phase 2)
- [x] Explore using last30days for a new product briefing — installed IPC bridge, X-only research working (2026-03-26)
- [x] Disable iCloud on Mac Mini — no longer needed, may cause conflicts
- [x] Include detected keyword in product briefing export, link, signal? — source attribution added to each product entry (2026-03-27)
- [x] Tune product briefing research topics — switched from keyword search to thread reply scraping (2026-03-27)
- [x] Bird search product aggregation — built full pipeline: thread search → product extraction → URL resolution → categorization; consolidated to weekly schedule (2026-03-28)
- [x] Update coldmountain.ai — added dotmd card, Readwise wiki mention, merged Intelligence/Research and Specification/Execution sections, updated tagline and tech stack (2026-04-13)
- [x] Wire up Vercel deploy hook so coldmountain.ai rebuilds on weekly wiki compile — added `POST /cold-mountain-deploy` proxy route reading `COLD_MOUNTAIN_DEPLOY_HOOK` from `.env`; curl trailer in readwise-wiki.md + folder-review.md fires only when commit produces changes; also fixed latent `/workspace/extra/second-brain` → `/workspace/extra/vault` path bug in folder-review.md (2026-04-21)
