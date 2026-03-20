## High Priority
- [ ] Disable iCloud on Mac Mini — vault has migrated to Obsidian Sync; iCloud no longer needed and may cause conflicts
- [ ] Update coldmountain.ai — move TAM/SAM/SOM market sizing out of the PRD bullet point and into its own line item under Phase 2
- [ ] Understand CLAUDE.md files — audit all existing CLAUDE.md files across machines and NanoClaw groups; understand what each one does, what's missing, and how they interact
- [ ] Check/update monthly summary instructions — reframe product observations as "problem statements" rather than general observations
- [ ] Investigate new NanoClaw skills — check upstream for recently added skills (e.g. Perplexity); evaluate if Perplexity skill could replace or improve existing web search in briefing agent

## Medium Priority
- [ ] Design project-level CLAUDE.md workflow — when to create them, what goes in them, how to keep them updated (automated end-of-session + on-demand refresh pattern)
- [ ] Evaluate briefing quality and source refinement — review whether the briefing is delivering the right signals; reverse-engineer specific stories to trace back to their sources and determine if better or more targeted sources could improve coverage

## Low Priority
- [ ] Automated CLAUDE.md memory curation — weekly/monthly NanoClaw task reads conversation history and proposes additions to global CLAUDE.md; continue brainstorming the right approach
- [ ] Investigate Readwise integration for NanoClaw — save paywalled articles via Readwise, query via API from Telegram instead of storing article text in vault
- [ ] Set up X integration in NanoClaw — post tweets, like, reply, retweet, quote via Telegram; uses Chrome browser automation (no expensive API needed); requires code changes + container rebuild
- [ ] Build an on-demand AI business model research prompt
- [ ] Improve briefing tool coverage — add explicit search for viral GitHub repos (repos crossing major star milestones in last 24 hours) to catch fast-moving projects that may not surface via GitHub Trending alone. Triggered by missing Superpowers repo (~90k stars).

## Completed — March 20, 2026
- [x] Fixed daily briefing Telegram notification — briefing agent CLAUDE.md was telling agent not to send confirmation ("system handles it") but system only notifies on failure; restored `send_message` instruction for `Briefing YYYY-MM-DD: ✅ saved` format
- [x] Investigated Obsidian Sync delay — MacBook Pro sync log confirmed Mac Mini headless `ob` CLI took 17 min to push briefing file (07:11 written → 07:28 pushed); MacBook Pro pulled instantly once available; `ob` v0.0.7 continuous mode appears to poll every ~6-8 min rather than use filesystem watchers; monitoring for now
- [x] Simplified daily to-do workflow — removed auto-clear/reset behavior from agent CLAUDE.md; added instruction to create new date sections chronologically (most recent at top); reversed file order and removed empty days
- [x] Added next week's to-do items — Monday (update resume), Tuesday (apply to jobs)

## Completed — March 19, 2026
- [x] Added Second Brain project to Cold Mountain portfolio — new card with "AI Agent" tag, new /second-brain detail page with content from coldmountain.md brief
- [x] Added subtle tag colors to portfolio — blue (iOS), purple (Web), green (AI Agent)
- [x] Updated portfolio bio tagline
- [x] Reordered Selected Work grid
- [x] Deployed to Vercel via git push to main
- [x] Updated global git email to noreply address for GitHub privacy
- [x] Removed noisy task completion notifications — container agent tasks no longer send "task-xxx: ✅ completed" to Telegram on success; failure notifications kept
- [x] Set up @matttli on X — reactivate account and start posting
- [x] Grep vault for any remaining old iCloud paths — swept vault, nanoclaw, .claude, .config, .zshrc, LaunchAgents; all clean
- [x] Check and update vault and brain aliases in ~/.zshrc

## Completed — March 18, 2026
- [x] **Fixed vault mounts in NanoClaw containers** — vault moved to ~/second-brain/ but mount allowlist and DB still pointed to old iCloud path; updated mount-allowlist.json and all 4 registered_groups in DB; restarted NanoClaw
- [x] **Daily briefing v2.6** — added "Before You Start" (read last 5 briefings) and step 8 (dedup review)
- [x] **Vault migration path updates** — updated paths in CLAUDE.md and version number in system-overview.md
- [x] **.gitignore** — added daily-to-do.md to whitelist
- [x] **End-of-session ritual (MacBook Pro)** — removed git steps (no git repo in vault anymore)
- [x] **Cold Mountain project** — created projects/cold-mountain/ folder with README for coldmountain.ai portfolio site
- [x] **Obsidian headless sync set up** — `obsidian-headless` installed, `ob sync --continuous` running as `com.obsidian-sync` launchd service on Mac Mini; Obsidian desktop app no longer required for sync
- [x] **Obsidian sync health check** — NanoClaw script task (`obsidian-sync-check`) runs every 30 min, sends ❌ to Telegram if the service is down
- [x] **Vault sync: replaced iCloud with Obsidian Sync** — vault moved to ~/second-brain/ on all machines; Obsidian Sync ($4/month) handles device sync (MacBook Pro, iPhone, Mac Mini); git on Mac Mini pushes to GitHub every 30 min; vault-sync script simplified to plain cd/git add/commit/push; all docs updated
- [x] Vault sync permanent fix — moved .git to ~/vault-git-data outside iCloud; script uses GIT_DIR/GIT_WORK_TREE env vars; eliminates mmap/deadlock errors
- [x] Daily to-do workflow simplified — Mon–Sun file, 8am Telegram send, no automated reset; agent asks before clearing week when adding out-of-bounds items; Friday summary task paused
- [x] Agent CLAUDE.md updated with daily to-do list handling instructions

## Completed — March 16, 2026
- [x] Add Claude Code launch aliases to ~/.zshrc on Mac Mini — claude variants added to open Claude Code directly in vault, nanoclaw directories
- [x] GitHub credentials inside NanoClaw containers — fine-grained PAT in .env, served via credential proxy; git credential helper in container calls back to host
- [x] CLAUDE.md end-of-session ritual simplified — consolidated steps 3/4/6 into one, removed tweet drafting step, deleted tweets.md
- [x] Auth cleanup — removed ANTHROPIC_API_KEY and classic GITHUB_TOKEN from ~/.zshrc; Claude Code now uses OAuth, GitHub CLI uses keyring; classic token revoked on GitHub
- [x] Committed and pushed 4 previously uncommitted changes (agent rename, git credential proxy, script tasks, telegram tests)
- [x] End-of-session ritual updated — now checks for uncommitted changes first and updates session-tasks.md
- [x] Merged upstream NanoClaw updates — resolved settings.json conflict, now includes /remote-control feature
- [x] Vault sync retry — updated script to retry 3x with 10s delays to handle iCloud git lock contention
- [x] **Vault sync permanent fix (2026-03-16)** — moved .git dir to ~/vault-git-data outside iCloud; task script uses GIT_DIR/GIT_WORK_TREE env vars; eliminates mmap/deadlock errors caused by iCloud file provider
- [x] Disabled upstream GitHub Actions workflows on fork — Bump version, Update token count, Sync/merge-forward all disabled; only CI remains active
- [x] Documented fork maintenance in nanoclaw-setup.md — upstream sync, workflows, skill branches, vault sync/iCloud, /remote-control
- [x] Git credential proxy extended — GITHUB_TOKEN in .env served via /git-credentials endpoint, containers get git access without token exposure; script task type added to NanoClaw scheduler for lightweight host-side tasks
- [x] Vault git sync fixed — migrated from broken launchd to NanoClaw script task, runs every 30 minutes as host-side bash command, no container overhead

## Completed — March 13, 2026
- [x] Migrate weekly and monthly summaries from cron to NanoClaw scheduled tasks — all three intelligence jobs now running on NanoClaw, zero cron jobs remaining
- [x] Add end-of-session build-in-public tweet draft to MacBook Pro CLAUDE.md — Claude Code drafts a tweet based on session work, saves to projects/writing/tweets.md
- [x] Agent renamed from Andy to Second Brain
- [x] Add project-level CLAUDE.md to ~/nanoclaw/ — already exists from upstream repo, sufficient as-is
- [x] Tested NanoClaw Reddit scraping — Reddit blocks bots with CAPTCHA, not viable; web search works instead
- [x] Researched sustainability pain points — greenwashing/trust and "just tell me what to do" are the clearest signals; product direction tabled for now
- [x] Mac Mini crontab fully emptied — all scheduled tasks now in NanoClaw

## Completed — March 12, 2026
- [x] Research writing frameworks — X + Substack strategy documented, goal reframed from audience building to finding your people
- [x] Trim groups/main/CLAUDE.md — split into CLAUDE.md (~30 lines) and nanoclaw-admin.md
- [x] Web fetch capability added to briefing agent
- [x] ai-intelligence/ moved to projects/intelligence/ — all paths updated
- [x] Mac Mini ~/.claude/settings.json created
- [x] claudemd-list alias added to ~/.zshrc

## Completed — March 10, 2026
- [x] NanoClaw installed and running on Mac Mini — forked, Docker configured, Telegram connected
- [x] Daily briefing migrated to NanoClaw scheduled task — runs 7am weekdays, results sent to Telegram
- [x] Git sync cron job added — every 30 minutes, auto-commits and pushes vault changes
- [x] Daily briefing cron job removed from crontab
- [x] Vault mounted into NanoClaw containers — read/write for main and briefing groups
- [x] Sequoia thesis and product framing saved to product-vision.md
- [x] Two product ideas documented in ideas.md

## Completed — March 9, 2026
- [x] Build monthly summary prompt (`instructions/monthly-summary.md`) — v1.0, saved to vault
- [x] Set up monthly cron job — 7am on 1st of each month
- [x] Test monthly summary — ran against W09 and W10, strong first output, product-vision.md updated automatically

## Completed — March 8, 2026
- [x] Document how the system works — wrote system-overview.md, saved to projects/second-brain/
- [x] Check `~/.claude/settings.json` to review permanent permissions — clean, only effortLevel set; added permissions check to end of session ritual in CLAUDE.md
- [x] CLAUDE.md audit — global file on MacBook Pro is clean and sufficient; Mac Mini has no CLAUDE.md by design (cron-only environment); no project-level files needed yet; revisit when NanoClaw development starts

## Completed — March 3-4, 2026
- [x] Setup Mac Mini — keyboard, trackpad, Screen Sharing enabled
- [x] Claude Code installed and authenticated with API key
- [x] API key added to ~/.zshrc (console.anthropic.com)
- [x] GitHub CLI installed and authenticated
- [x] Daily briefing ran successfully on Mac Mini
- [x] Committed and pushed to GitHub
- [x] Cron jobs set — 7am weekdays (briefing), 8am Sunday (weekly summary)
- [x] Set up Sunday weekly summary cron job
- [x] nanoclaw-setup.md created with future architecture notes
- [x] trend-reports/ folder deleted — monthly summary serves that function
- [x] intelligence-layers.md updated

## Completed — March 2, 2026
- [x] Add `vault` and `brain` aliases to `~/.zshrc`
- [x] Verify `.gitignore` is correct after rename
- [x] Daily briefing updated to v2.1 (acronym rule, no padding, no embellished engagement)
- [x] Draft weekly summary prompt (`instructions/weekly-summary.md`) v1.3
- [x] Weekly summary updated to v1.4 — removed Product Observations, synthesis-only
- [x] Previewed weekly summary — strong first run (2026-W09)
- [x] Decided first sector — EdTech
- [x] Reviewed Claude Code CVEs — both patched, low personal risk
- [x] Intelligence layers doc updated — weekly summary marked complete
- [x] product-vision.md restructured — Active Ideas + Watching sections, ideas/ folder created
- [x] product-vision.md merged — W09 observations folded in, duplicate files cleaned up
- [x] ai-intelligence/_archive/ deleted

## Completed — February 27, 2026
- [x] Daily briefing v1.5 with overlap prevention
- [x] `second-brain` private GitHub repo live
- [x] Auto-commit step added to briefing instructions
- [x] PARA folder structure created in vault
- [x] `projects/mac-mini-setup.md` living document created
- [x] `projects/product-vision.md` created
- [x] `projects/intelligence-layers.md` created
- [x] Mac Mini ordered — arrives Monday March 2nd
- [x] Obsidian Git plugin configured
- [x] Cron job updated with --dangerously-skip-permissions
