## To Do
- [ ] Build writing capture workflow in NanoClaw — voice/text capture via Telegram, saves to writing/drafts/ in vault, shaping questions, polish in Obsidian
- [ ] Add end-of-session build-in-public prompt to MacBook Pro CLAUDE.md — Claude Code prompts for a 1-3 sentence tweet about what you did, saves to writing/drafts/
- [ ] Set up @matttli on X and Substack — reactivate old account, create Substack as article host
- [ ] Rename NanoClaw bot from Andy to something personal — edit groups/global/CLAUDE.md in terminal
- [ ] Migrate weekly and monthly summaries from cron to NanoClaw scheduled tasks — once daily briefing is proven stable
- [ ] Test NanoClaw Reddit scraping — send bot a few Reddit thread URLs from communities of interest, evaluate comprehensiveness, identify which subreddits are worth monitoring regularly
- [ ] Build an on-demand AI business model research prompt
- [ ] Add project-level CLAUDE.md to ~/nanoclaw/ — gives Claude Code context when doing interactive NanoClaw development on the Mac Mini
- [ ] Design project-level CLAUDE.md workflow — when to create them, what goes in them, how to keep them updated (automated end-of-session + on-demand refresh pattern)
- [ ] GitHub credentials inside NanoClaw containers — add a scoped personal access token so agents can commit and push from inside containers, enabling autonomous building


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
