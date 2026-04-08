### Memory & CLAUDE.md
- [ ] Create `/workspace/group/context.md` and update main group CLAUDE.md to read it at session start — context.md lives alongside memory.md in the group directory and serves as volatile, fast-changing session state (current lean on active problems, decisions in flight, half-formed ideas) vs. memory.md which holds stable long-term facts. I update it during conversations as decisions get made, same pattern as memory.md. Requires one Claude Code change: add context.md to the session start reads in CLAUDE.md.
- [ ] Update main chat group behavior — think through how Second Brain should ask clarifying questions and follow best practices before making changes (e.g. confirm scope, warn about side effects, suggest alternatives)
- [ ] Add session start instructions to main group CLAUDE.md — at session start, read three sources directly: (1) backlog.md for active priorities, (2) session-tasks.md for changelog of what's been built, (3) recent git log from both the NanoClaw fork and second-brain vault for what actually changed in the system. Also read context.md if it exists as a volatile supplement for current mental state, decisions in flight, and open questions that don't fit the other files. At session end, update context.md with anything that would be lost at cold start — current lean on active problems, half-formed ideas, decisions being sat with. context.md differs from memory.md in that memory.md is stable long-term facts; context.md is fast-changing state that goes stale quickly. Anything in context.md that hasn't changed in weeks should migrate to memory.md or backlog.md.

### Skills
- [ ] Install update-nanoclaw — pull upstream changes with preview and selective cherry-pick; run roughly once a month
- [ ] Install add-compact — adds /compact command for context compaction; needed when Phase 2 PM agent is built
- [ ] Install add-telegram-swarm — agent teams in Telegram, each subagent gets its own bot identity; relevant to Phase 3. Potential use case: adversarial agent debates — one optimistic, one pessimistic, one focused on execution risk — for stress-testing product decisions like pmtxt direction or YC application strategy. Related to the debate-perspectives project in the vault.
- [ ] Investigate add-ollama-tool — local models as tools inside containers, zero API cost for cheap tasks

### Readwise Enhancements
- [ ] Set up RSS feeds in Readwise Reader for key frontier lab blogs and thought leader sites — candidates: Anthropic blog, OpenAI blog, DeepMind blog, Dario Amodei, DHH, Paul Graham essays, Andrej Karpathy, Ben Thompson (Stratechery). Goal is to have new posts land in Reader automatically rather than relying on X or manual saves.

### Prompts
- [ ] Key figure publishing alerts — figure out a way to get notified when people like Dario Amodei or DHH publish a new long-form piece or thesis. Could be RSS monitoring, a periodic agent task that checks their blogs/sites, or Readwise feed subscriptions. Goal is to catch essays and posts worth reading without having to actively follow them.
- [ ] Readwise wiki → weekly summary integration — After ~4 weekly wiki runs (~mid-May), evaluate whether to add a wiki-update step to the weekly summary agent. Check: (1) Is the wiki being referenced by agents during searches or Q&A? (2) Are there obvious gaps where weekly briefing signals (funding rounds, capability shifts, VC theses) would have made wiki pages more useful? (3) Has the lint step surfaced real issues, or is the wiki too small for it to matter? If yes to 1 or 2, build the pipeline — scope it to factual signals only (AI Context, VC Lens, durable category patterns from Category Movement). Skip analysis, skip indie product listings. If no, the wiki needs more mass from Readwise first.
- [ ] Figure out how to use YC RFS in intelligence system — doc saved at `projects/products/STRATEGY/yc-rfs.md`; options include injecting as context into weekly briefing prompt, using as idea validation framework, or scheduling quarterly refresh
- [ ] Evaluate weekly product briefing after first Saturday run — verify thread search, URL resolution, and categorization work end-to-end unattended; first test run (W13b) triggered 2026-03-28 with v3.0 instructions
- [ ] AI Daily Briefing: Consider improving Product Hunt section in daily briefing. Sometimes "leaderboard not available" for current day. Is the current detail sufficient?
- [ ] AI Daily Briefing: Is the new models section too dense?
- [ ] Consider adding hyperlinks to product names/companies in the product briefing

### Cold Mountain (coldmountain.ai)
- [ ] Update Second Brain page — reflect current state of the system (Readwise wiki, pmtxt, dotmd all launched/in progress since last update). Consider pinning Second Brain to the top of the projects list. Add dotmd as an open source project. Consider adding a shipped count or rethinking the layout to better surface what's been built.

### Infrastructure
- [ ] Investigate how to reliably inject current date/time into LLM context — agents and scheduled tasks sometimes work off stale or missing date context. Options include injecting timestamp into CLAUDE.md at session start, passing it as a system prompt variable, or using a pre-task hook. Goal: every agent always knows the correct date without relying on the model's internal assumptions.
- [ ] Update NanoClaw carefully — v1.2.35 (OneCLI Agent Vault) is a breaking change for Docker users. Migration only handles Anthropic and OpenAI keys automatically; Readwise and Parallel API keys in the credential proxy route table must be manually migrated into OneCLI Vault after running `/init-onecli`. Use `/use-native-credential-proxy` skill as escape hatch if things break. Don't run `/update-nanoclaw` without a plan.
- [ ] Configure /remote-control — NanoClaw feature already merged, not yet configured. Starts a Claude Code session on the Mac Mini directly from Telegram, returns a browser URL. Full host access without SSH. Priority: next time at Mac Mini.
- [ ] Set up a dotfiles repo — put shared ~/.zshrc aliases and functions in a private GitHub repo so changes sync across MacBook Pro and Mac Mini without manual duplication. Machine-specific things (vault path, NanoClaw directory) stay in a local file sourced by the shared one.

### Completed
- [x] **Readwise wiki compiler** — Bootstrapped wiki with 12 pages from 65 saves, scheduled as weekly NanoClaw task (Fridays 10pm). Instructions at `intelligence/instructions/readwise-wiki.md`, output at `intelligence/wiki/`. (2026-04-05)
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
