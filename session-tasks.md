### March 28, 2026 (session 3)
- Updated homepage tagline — iterated through several options, settled on "Building systems. Shipping products."
- Committed and pushed twice to main (auto-deploys to Vercel)

### March 28, 2026 (session 2)
- Upgraded weekly-summary instructions from v2.4 to v3.0 — new structure: Category Movement + Capital vs. Builder Gaps replace Problem Categories; archived v2.4
- Iterated weekly-summary to v3.3 — removed then restored AI Context section; added X engagement caveat to Category Movement; added Product Hunt note to Research Task 2
- Updated monthly-summary v2.1→v2.3 — research tasks now read Category Movement + Capital vs. Builder Gaps from weeklies + product briefings; added Build Candidates section; removed traction language; updated writing order
- Updated weekly-products v1.0→v1.1 — 3-product minimum per category; renamed Traction signal→Engagement signal; "builder energy" language
- Triggered weekly summary test run (2026-W13b) against new v3.0 instructions

### March 28, 2026
- Tested Bird search with `--sort top` vs `Latest` — `Top` mode matches too broadly (non-English, unrelated tweets); `Latest` with exact phrases + `min_replies` is the right approach
- Built one-off X thread product extraction pipeline — 6 keywords, `min_replies:50`, `lang:en`, last 24h; found 24 high-engagement threads, extracted 237 products from top 10
- Resolved t.co URLs via curl (171/209), GitHub API (3/7), WebFetch (29/35) — 97% coverage; remaining 6 are truly empty pages
- Categorized 209 products into 28 problem categories using weekly summary format
- Consolidated product briefing from daily to weekly — archived `daily-products.md`, created `weekly-products.md` (v1.0) with X thread pipeline
- Added Product Hunt as a source to daily AI briefing (`daily-briefing.md` v3.0)
- Updated weekly summary instructions (`weekly-summary.md` v2.4) to read weekly product briefing instead of 5 daily ones
- Renamed `product-briefings/` folder to `weekly-products/`; archived old daily briefings
- Updated scheduled tasks in DB: `product-briefing` changed from `0 7 * * 1-5` to `0 6 * * 6`; `weekly-summary` changed from `0 7 * * 6` to `0 8 * * 6`
- Added 3 new X search keywords to instructions: "drop your project", "what are you shipping", "what are you building"

### March 27, 2026 (session 2)
- Reviewed all 4 product briefing instruction files + 4 group CLAUDE.md files for consistency
- Fixed daily-products.md — changed "3-5 total" to "3-5 per source (6-10 total)"
- Fixed weekly-summary.md — corrected Research Task 5→4 reference; removed stale Sources Log entries (Product Hunt, HN, Indie Hackers, X)
- Fixed groups/weekly-summary/CLAUDE.md — corrected `briefings/` path to `ai-briefings/` + `product-briefings/`; replaced stale "Builder Pulse" with "Strategic Signals"
- Fixed groups/monthly-summary/CLAUDE.md — removed product-vision.md references, removed Strategic Signals research step, removed irrelevant Research Quality section
- Fixed groups/product-briefing/CLAUDE.md — switched IPC type from `last30days_research` to `last30days_thread_search`; aligned research strategy with 2-source approach (X threads + Product Hunt)

### March 27, 2026
- Diagnosed product briefing wrong-date bug — stale test prompt from `test-briefing.sh` revert failure; `product-briefing` DB prompt still had hardcoded `2026-03-26b.md`; restored original prompt
- Fixed `test-briefing.sh` revert reliability — replaced fragile `date -j` timestamp parsing with string comparison; added `nohup`/`disown` so background revert survives terminal close; added crash recovery via `/tmp/test-briefing-revert/` files
- Built `--min-likes` and `--require-url` post filters in IPC handler — strip low-engagement and URL-less posts before agent sees them
- Built X thread reply search (`last30days_thread_search` IPC type) — two-phase: finds "drop your product" threads, fetches replies via `conversation_id:`, filters to product URLs; calls Bird search directly from Node, bypasses Python pipeline
- Overhauled product briefing instructions (daily-products.md v3) — switched from keyword search to thread reply scraping + Product Hunt web search; separate sections for each source; engagement metrics and source attribution on every item
- Iterated on X search keywords — tested buildinpublic, MRR, claude code, just launched, built with AI, vibe coded; discovered query preprocessor strips noise words; settled on thread replies as primary X source
- Added `--days=1` flag to narrow X search to last 24 hours
- Archived 7 test briefing files (2026-03-27 a-g), kept final version as 2026-03-27.md

### March 26, 2026
- Created SKILL-briefing.md on MacBook Pro — stripped-down unattended variant of last30days SKILL.md; keeps research execution + Judge Agent synthesis + anti-pattern guards; removes all interactive conversation flow (intent parsing, user prompts, follow-ups, context memory)
- Installed last30days SKILL-briefing.md on Mac Mini — replaced default SKILL.md with unattended product research version, synced to all skill locations
- Built IPC bridge for last30days — `src/skill-handlers/last30days.ts` (host handler) + `container/skills/last30days-research/SKILL.md` (container instructions); wired into `src/ipc.ts` default case
- Fixed PATH issue — launchd process missing `/opt/homebrew/bin`, Bird CLI couldn't find Node; handler now augments PATH
- Fixed `--search` flag parsing — argparse received split args; switched to `--search=x` format
- Updated product briefing to use last30days — `daily-products.md` v2.0, X-only research via IPC; group CLAUDE.md updated
- Added X_AUTH_TOKEN/X_CT0 to .env with remapping in handler (clearer than raw AUTH_TOKEN/CT0)
- Verified end-to-end — test briefing produced 5 X-sourced product items with @handle citations
- Set initial research keywords: buildinpublic, building in public, MRR, claude code

### March 25, 2026 (session 2)
- Diagnosed last30days timeout issue — Reddit OpenAI fallback burns 2+ min in retry backoff; identified root cause in http.py retry logic + ThreadPoolExecutor can't kill stalled threads
- Added ScrapeCreators API key to ~/.config/last30days/.env — Reddit now uses fast ScrapeCreators API instead of OpenAI fallback
- Updated SKILL.md default command with --timeout 600 and Bash timeout to 600000
- Deployed SKILL.md changes via sync.sh to ~/.claude/skills, ~/.agents/skills, ~/.codex/skills
- Verified fix — nanoclaw research now returns 30 Reddit threads + 32 X posts (previously 0 Reddit, timeout)
- Ran "Claude Code" research (X only — Reddit IncompleteRead error pre-fix)
- Added last30days validation tool section to projects/product/README.md
- Modified last30days skill for product validation — reoriented from general research toward validating product ideas (pain points, demand signals, competitive landscape)

### March 25, 2026 (session 1)
- Tested last30days skill research on "nanoclaw" (X only, 22 posts) — validated as weak-to-moderate signal; strongest pain points are token cost management and inter-agent communication
- Updated all 5 project READMEs to reflect current state (cold-mountain, intelligence, nanoclaw, product, writing)
- Added CLAUDE.md review step (#3) to end-of-session ritual in global CLAUDE.md
- Added `claudemd-list` and `claudemd-read` functions to ~/.zshrc on MacBook Pro
- Updated global ~/.claude/CLAUDE.md (Mac Mini) — "Always Plan First" reads project README before planning; end-of-session updates project README if setup/status/structure changed; moved git steps to end of ritual
- Updated groups/main/CLAUDE.md — replaced Memory section with memory.md read/write workflow; added no-editorializing rule to Communication section

### March 24, 2026
- Changed homepage name from "Mathew Thomas Li" to "Matt Li"
- Updated tagline to "Building AI-enabled products across discovery, prototyping, and execution."
- Moved Seasons Journaling to second position (right below Second Brain) in project list
- Committed and pushed to main (auto-deploys to Vercel)
- Updated global ~/.claude/CLAUDE.md — "Always Plan First" now reads project README.md before planning; "End of Session" now includes updating project README.md if session changed setup/status/structure

### March 23, 2026
- Installed Parallel AI integration — Search and Task MCP servers available to all container agents
- Routed Parallel API key through credential proxy (not direct env var) — follows existing security pattern
- Added Parallel Search nudge to all 4 briefing group CLAUDE.md files (briefing, product-briefing, weekly-summary, monthly-summary)
- Added Parallel Search one-liner to main group CLAUDE.md
- Added Credential Proxy Pattern note to project CLAUDE.md for future integrations
- Test briefing confirmed working — 7 Search API + 5 Extract calls visible in Parallel dashboard; Reuters content retrieved that was previously blocked
- Unpaused product-briefing scheduled task and triggered test run
- Updated operator-guide.md — added product-briefing group, telegram_main, archive-briefings, test-briefing.sh, daily-products.md instructions
- Added permanent bash read permissions (cat, ls, grep) to ~/.claude/settings.json
- Updated /second-brain page content to match revised coldmountain.md — new description, capabilities (added daily product briefing, updated weekly/monthly descriptions), and replaced Phase 1/2/3 roadmap with Validation/Specification/Execution sections
- Updated homepage Second Brain card — shortened to one-line teaser to avoid redundancy with detail page
- Replaced homepage tagline with "Learning by building."
- Added social links (LinkedIn, X, Email) with SVG icons to homepage header
- Pushed to GitHub/Vercel

### March 21, 2026
- Review/Rewrite Briefing instructions
- Renamed `projects/intelligence/briefings/` → `ai-briefings/` — updated all references across vault and NanoClaw
- Archived stale `projects/nanoclaw/claude-md-briefing.md` (old `ai-intelligence/` paths)
- Fixed task success notifications — scheduler now sends confirmations for non-main groups; main group tasks (daily to-do) handle their own output
- Added `display_name` column to scheduled tasks for human-readable notifications
- Triggered one-off daily briefing run
- Created `test-briefing` script — ad-hoc test runs for daily/weekly/monthly/product briefings with dedup disabled and auto-suffix filenames; alias added to ~/.zshrc
- Set up product briefing — new group, container CLAUDE.md, scheduled task (paused), registered in DB with vault mounts
- Created `archive-briefings` script — moves old briefings to `_archive/` per configurable retention rules; runs Sundays at midnight as script task
- Consolidated vault docs — merged `system-overview.md` into `projects/nanoclaw/README.md` (updated for current state); archived `intelligence-layers.md` into `projects/intelligence/_archive/`; rewrote `projects/intelligence/README.md` with briefing types, test runs, architecture, and archival docs
- Added "About Matt" section to `groups/global/CLAUDE.md` — all agent groups now inherit user context
- Added "Your user is Matt" to `groups/main/CLAUDE.md`
- Fixed formatting inconsistency in global CLAUDE.md — switched `**bold**` to `*bold*` to match file's own rules
- Added `claudemd-read` function to ~/.zshrc — interactive numbered menu to pick and read any CLAUDE.md file
- Reviewed main group security posture per Cohen's recommendations — web tools are upstream default, main group is single-user only, no changes needed

### March 20, 2026
- Fix Executive Summary redundancy — changed from "lead with most important story" to cross-section synthesis (v2.7)
- Add Sources Log to briefing format — temporary diagnostic table at bottom of each briefing tracking which sources were searched and what they produced (v2.8). Run for ~1 week then audit.
- Add Sources Log to weekly summary (v1.6) and monthly summary (v1.1) instructions
- Move weekly summary schedule from Sunday to Saturday — updated all docs and Mac Mini cron job
- Update coldmountain.ai — move TAM/SAM/SOM market sizing out of the PRD bullet point and into its own line item under Phase 2
- Update Phase 2 vision for Second Brain — revisit and refine what Phase 2 (PM Best Practices Layer) actually includes; update system-overview.md and coldmountain.md accordingly
- Updated Phase 2 content on /second-brain — expanded bullets (Discovery, RICE, SWOT, PRD, Technical requirements), added workflow summary line
- Added Phase 1/2/3 status badges — Phase 1: Complete (green), Phase 2: In Progress (amber), Phase 3: Planned (grey)
- Updated Second Brain description on homepage and /second-brain page — new copy emphasizing personal use, intelligence layer, knowledge vault, and autonomous agents
- Started but deferred: resume webpage and personal use mention in "What It Does Today" section
- Pushed changes to GitHub
- Fixed daily briefing Telegram notification — briefing agent CLAUDE.md was telling agent not to send confirmation ("system handles it") but system only notifies on failure; restored `send_message` instruction for `Briefing YYYY-MM- DD: ✅ saved` format
- Investigated Obsidian Sync delay — MacBook Pro sync log confirmed Mac Mini headless `ob` CLI took 17 min to push briefing file (07:11 written → 07:28 pushed); MacBook Pro pulled instantly once available; `ob` v0.0.7 continuous mode appears to poll every ~6-8 min rather than use filesystem watchers; monitoring for now
- Simplified daily to-do workflow — removed auto-clear/reset behavior from agent CLAUDE.md; added instruction to create new date sections chronologically (most recent at top); reversed file order and removed empty days
- Added next week's to-do items — Monday (update resume), Tuesday (apply to jobs)

### March 19, 2026
- Added Second Brain project to Cold Mountain portfolio — new card with "AI Agent" tag, new /second-brain detail page with content from coldmountain.md brief
- Added subtle tag colors to portfolio — blue (iOS), purple (Web), green (AI Agent)
- Updated portfolio bio tagline
- Reordered Selected Work grid
- Deployed to Vercel via git push to main
- Updated global git email to noreply address for GitHub privacy
- Removed noisy task completion notifications — container agent tasks no longer send "task-xxx: ✅ completed" to Telegram on success; failure notifications kept
- Set up @matttli on X — reactivate account and start posting
- Grep vault for any remaining old iCloud paths — swept vault, nanoclaw, .claude, .config, .zshrc, LaunchAgents; all clean
- Check and update vault and brain aliases in ~/.zshrc

### March 18, 2026
- **Fixed vault mounts in NanoClaw containers** — vault moved to ~/second-brain/ but mount allowlist and DB still pointed to old iCloud path; updated mount-allowlist.json and all 4 registered_groups in DB; restarted NanoClaw
- **Daily briefing v2.6** — added "Before You Start" (read last 5 briefings) and step 8 (dedup review)
- **Vault migration path updates** — updated paths in CLAUDE.md and version number in system-overview.md
- **.gitignore** — added daily-to-do.md to whitelist
- **End-of-session ritual (MacBook Pro)** — removed git steps (no git repo in vault anymore)
- **Cold Mountain project** — created projects/cold-mountain/ folder with README for coldmountain.ai portfolio site
- **Obsidian headless sync set up** — `obsidian-headless` installed, `ob sync --continuous` running as `com.obsidian-sync` launchd service on Mac Mini; Obsidian desktop app no longer required for sync
- **Obsidian sync health check** — NanoClaw script task (`obsidian-sync-check`) runs every 30 min, sends ❌ to Telegram if the service is down
- **Vault sync: replaced iCloud with Obsidian Sync** — vault moved to ~/second-brain/ on all machines; Obsidian Sync ($4/month) handles device sync (MacBook Pro, iPhone, Mac Mini); git on Mac Mini pushes to GitHub every 30 min; vault-sync script simplified to plain cd/git add/commit/push; all docs updated
- Vault sync permanent fix — moved .git to ~/vault-git-data outside iCloud; script uses GIT_DIR/GIT_WORK_TREE env vars; eliminates mmap/deadlock errors
- Daily to-do workflow simplified — Mon–Sun file, 8am Telegram send, no automated reset; agent asks before clearing week when adding out-of-bounds items; Friday summary task paused
- Agent CLAUDE.md updated with daily to-do list handling instructions

### March 16, 2026
- Add Claude Code launch aliases to ~/.zshrc on Mac Mini — claude variants added to open Claude Code directly in vault, nanoclaw directories
- GitHub credentials inside NanoClaw containers — fine-grained PAT in .env, served via credential proxy; git credential helper in container calls back to host
- CLAUDE.md end-of-session ritual simplified — consolidated steps 3/4/6 into one, removed tweet drafting step, deleted tweets.md
- Auth cleanup — removed ANTHROPIC_API_KEY and classic GITHUB_TOKEN from ~/.zshrc; Claude Code now uses OAuth, GitHub CLI uses keyring; classic token revoked on GitHub
- Committed and pushed 4 previously uncommitted changes (agent rename, git credential proxy, script tasks, telegram tests)
- End-of-session ritual updated — now checks for uncommitted changes first and updates session-tasks.md
- Merged upstream NanoClaw updates — resolved settings.json conflict, now includes /remote-control feature
- Vault sync retry — updated script to retry 3x with 10s delays to handle iCloud git lock contention
- **Vault sync permanent fix (2026-03-16)** — moved .git dir to ~/vault-git-data outside iCloud; task script uses GIT_DIR/GIT_WORK_TREE env vars; eliminates mmap/deadlock errors caused by iCloud file provider
- Disabled upstream GitHub Actions workflows on fork — Bump version, Update token count, Sync/merge-forward all disabled; only CI remains active
- Documented fork maintenance in nanoclaw-setup.md — upstream sync, workflows, skill branches, vault sync/iCloud, /remote-control
- Git credential proxy extended — GITHUB_TOKEN in .env served via /git-credentials endpoint, containers get git access without token exposure; script task type added to NanoClaw scheduler for lightweight host-side tasks
- Vault git sync fixed — migrated from broken launchd to NanoClaw script task, runs every 30 minutes as host-side bash command, no container overhead

### March 13, 2026
- Migrate weekly and monthly summaries from cron to NanoClaw scheduled tasks — all three intelligence jobs now running on NanoClaw, zero cron jobs remaining
- Add end-of-session build-in-public tweet draft to MacBook Pro CLAUDE.md — Claude Code drafts a tweet based on session work, saves to projects/writing/tweets.md
- Agent renamed from Andy to Second Brain
- Add project-level CLAUDE.md to ~/nanoclaw/ — already exists from upstream repo, sufficient as-is
- Tested NanoClaw Reddit scraping — Reddit blocks bots with CAPTCHA, not viable; web search works instead
- Researched sustainability pain points — greenwashing/trust and "just tell me what to do" are the clearest signals; product direction tabled for now
- Mac Mini crontab fully emptied — all scheduled tasks now in NanoClaw

### March 12, 2026
- Research writing frameworks — X + Substack strategy documented, goal reframed from audience building to finding your people
- Trim groups/main/CLAUDE.md — split into CLAUDE.md (~30 lines) and nanoclaw-admin.md
- Web fetch capability added to briefing agent
- ai-intelligence/ moved to projects/intelligence/ — all paths updated
- Mac Mini ~/.claude/settings.json created
- claudemd-list alias added to ~/.zshrc

### March 10, 2026
- NanoClaw installed and running on Mac Mini — forked, Docker configured, Telegram connected
- Daily briefing migrated to NanoClaw scheduled task — runs 7am weekdays, results sent to Telegram
- Git sync cron job added — every 30 minutes, auto-commits and pushes vault changes
- Daily briefing cron job removed from crontab
- Vault mounted into NanoClaw containers — read/write for main and briefing groups
- Sequoia thesis and product framing saved to product-vision.md
- Two product ideas documented in ideas.md

### March 9, 2026
- Build monthly summary prompt (`instructions/monthly-summary.md`) — v1.0, saved to vault
- Set up monthly cron job — 7am on 1st of each month
- Test monthly summary — ran against W09 and W10, strong first output, product-vision.md updated automatically

### March 8, 2026
- Document how the system works — wrote system-overview.md, saved to projects/second-brain/
- Check `~/.claude/settings.json` to review permanent permissions — clean, only effortLevel set; added permissions check to end of session ritual in CLAUDE.md
- CLAUDE.md audit — global file on MacBook Pro is clean and sufficient; Mac Mini has no CLAUDE.md by design (cron-only environment); no project-level files needed yet; revisit when NanoClaw development starts

### March 3-4, 2026
- Setup Mac Mini — keyboard, trackpad, Screen Sharing enabled
- Claude Code installed and authenticated with API key
- API key added to ~/.zshrc (console.anthropic.com)
- GitHub CLI installed and authenticated
- Daily briefing ran successfully on Mac Mini
- Committed and pushed to GitHub
- Cron jobs set — 7am weekdays (briefing), 8am Sunday (weekly summary)
- Set up Sunday weekly summary cron job
- nanoclaw-setup.md created with future architecture notes
- trend-reports/ folder deleted — monthly summary serves that function
- intelligence-layers.md updated

### March 2, 2026
- Add `vault` and `brain` aliases to `~/.zshrc`
- Verify `.gitignore` is correct after rename
- Daily briefing updated to v2.1 (acronym rule, no padding, no embellished engagement)
- Draft weekly summary prompt (`instructions/weekly-summary.md`) v1.3
- Weekly summary updated to v1.4 — removed Product Observations, synthesis-only
- Previewed weekly summary — strong first run (2026-W09)
- Decided first sector — EdTech
- Reviewed Claude Code CVEs — both patched, low personal risk
- Intelligence layers doc updated — weekly summary marked complete
- product-vision.md restructured — Active Ideas + Watching sections, ideas/ folder created
- product-vision.md merged — W09 observations folded in, duplicate files cleaned up
- ai-intelligence/_archive/ deleted

### February 27, 2026
- Daily briefing v1.5 with overlap prevention
- `second-brain` private GitHub repo live
- Auto-commit step added to briefing instructions
- PARA folder structure created in vault
- `projects/mac-mini-setup.md` living document created
- `projects/product-vision.md` created
- `projects/intelligence-layers.md` created
- Mac Mini ordered — arrives Monday March 2nd
- Obsidian Git plugin configured
- Cron job updated with --dangerously-skip-permissions
