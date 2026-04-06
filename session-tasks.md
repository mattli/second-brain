### April 5, 2026 (session 2)
- [x] Committed and pushed NanoClaw: migrated main group → telegram_main, cleaned up global CLAUDE.md, added gitignore rules for compiled skill files and nanoclaw.db (2026-04-05)
- [x] Added `created_at` and `last_updated` frontmatter to all 12 wiki pages (2026-04-05)
- [x] Updated readwise-wiki compiler instructions to include both date fields in template (2026-04-05)
- [x] Renamed wiki `index.md` → `_index.md` for top-sort in file explorers (2026-04-05)
- [x] Deleted stale `docs/brainstorms/` and `docs/plans/` from NanoClaw repo (2026-04-05)
- [x] Deleted accidental `SELECT * FROM scheduled_tasks;` file (2026-04-05)

### April 5, 2026
- [x] Bootstrapped Readwise wiki — processed all 65 saves, created 12 wiki pages (LLM Knowledge Bases, Agent Proficiency, AI Careers, Andrej Karpathy, Claude Code Skill Frameworks, Agentic Engineering, AI-Native Product Development, AI Startup Distribution, AI Organization Design, Business Moats in AI, YC AI Thesis, Peter Steinberger) at `intelligence/wiki/` (2026-04-05)
- [x] Wrote readwise-wiki instructions file (`intelligence/instructions/readwise-wiki.md`) — fixed vault git path, added tool bookmark guidance (2026-04-05)
- [x] Scheduled Readwise wiki as weekly NanoClaw task — Fridays 10pm, isolated container, incremental (last 7 days only) (2026-04-05)
- [x] Updated NanoClaw README with Readwise Wiki group and scheduled task (2026-04-05)
- [x] Added `set -g mouse on` to `~/.tmux.conf` for trackpad scrolling in tmux (2026-04-05)
- [x] Split nanoclaw alias into `nanoclaw` (no tmux) and `nanoclaw-tmux` (with tmux) in `~/.zshrc` (2026-04-05)

### April 4, 2026 (session 4)
- [x] Diagnosed why weekly product briefing yields ~12-20 products vs 209 in March 28 run — agent was freelancing `last30days_research` searches instead of using thread search; render cap of 15 items on research path; agent cherry-picking instead of cataloging all replies (2026-04-04)
- [x] Fixed: added instruction to block `last30days_research`, added `min_replies:50` to thread search query, bumped reply fetch from 100→300, told agent to extract all products not cherry-pick (2026-04-04)
- [x] Added backlog item: Readwise wiki compiler (weekly scheduled task, Karpathy LLM wiki pattern) (2026-04-04)
- [x] Un-ignored backlog.md in second-brain .gitignore (2026-04-04)

### April 4, 2026 (session 3)
- [x] Diagnosed low product count in weekly briefing (18 vs expected 100+) — three bugs: `--count=N` flag silently ignored by bird-search.mjs (equals vs space parsing), `keywords` vs `query` field mismatch in IPC handler, Twitter API caps at ~40 replies per conversation_id (2026-04-04)
- [x] Fixed all three: split `--count` into two spawn args, added `data.query || data.keywords` fallback, renamed `keywords` to `query` in instructions and group CLAUDE.md (2026-04-04)
- [x] Ran oneoff product briefing (2026-04-04c) to verify fixes — reply counts up (88, 57, 40 per search vs previous 20); dedup against earlier runs limited new products but pipeline is working (2026-04-04)
- [x] Added tmux to nanoclaw alias in ~/.zshrc — prevents SSH broken pipe from killing Claude Code sessions (2026-04-04)
- [x] Killed stale dotmd tmux session from March 31 (2026-04-04)

### April 4, 2026 (session 2)
- [x] Restored original morning product briefing (2026-04-04.md) after oneoff afternoon run overwrote it; renamed afternoon version to 2026-04-04b.md following existing a/b/c convention (2026-04-04)

### April 4, 2026
- [x] Diagnosed broken X thread reply fetching in weekly product briefing — `last30days_thread_search` IPC handler was never committed to git, lost during March 28 rebuild; both March 30 and April 4 briefings affected (2026-04-04)
- [x] Rebuilt thread search handler in `src/skill-handlers/last30days.ts` — two-phase flow: bird-search finds starters, then fetches replies via `conversation_id:`; tested end-to-end with live credentials (2026-04-04)
- [x] Added "Commit Before Ending a Session" rule to project CLAUDE.md to prevent recurrence (2026-04-04)
- [x] Updated weekly-summary.md v3.3→v3.4 — replaced "VC Thesis Search" (Task 4) with expanded "Strategic Signals" section (4a: 8 sources including NFX, Benedict Evans, Stratechery, Ethan Mollick, First Round Review; 4b: overnight catch-up scan); updated VC Lens output section; expanded Sources Log template; fixed a16z URL to a16z.news (2026-04-04)

### April 3, 2026
- [x] Merged 3-step setup wizard into single-page settings — shared code for /setup (init) and /settings (2026-04-03)
- [x] Folder browser UX — Add/Remove buttons per row, grayed-out covered subfolders, all chips have X buttons (2026-04-03)
- [x] Pattern chips UX — X to remove, suggested patterns restore to original position, suggestions section toggles visibility (2026-04-03)
- [x] Subdirectory grouping — collapsible details/summary in file preview for both wizard and settings (2026-04-03)
- [x] Live file count — "N of M files selected" updates on checkbox changes (2026-04-03)
- [x] Section dividers and right-aligned save button (2026-04-03)
- [x] Help page — commands, scanning behavior, dashboard views, privacy, feedback link (2026-04-03)
- [x] Back button preserves wizard state via URL params (2026-04-03)
- [x] Next/Preview buttons disabled when no selections (2026-04-03)
- [x] Settings page only shows suggested folders that exist on disk (2026-04-03)
- [x] No pre-selected patterns on init — user chooses everything (2026-04-03)
- [x] Friendly port-in-use message instead of crash (2026-04-03)
- [x] dotmd serve and dotmd init auto-open browser (2026-04-03)
- [x] --no-open flag for dev server to prevent tab spam on hot-reload (2026-04-03)
- [x] Open in Editor returns error to UI when editor command not found (2026-04-03)
- [x] dotmd status shows "Changes in the last 24 hours" instead of last 5 (2026-04-03)
- [x] Amber refresh button in nav (2026-04-03)
- [x] Dashboard screenshot added to README (2026-04-03)
- [x] Published v0.1.1 through v0.1.6 to npm (2026-04-03)
- [x] Fresh install tested on Mac Mini — full flow working (2026-04-03)
- [x] GitHub repo made public (2026-04-03)
- [x] Launch post submitted to r/ClaudeAI — pending mod approval (2026-04-03)
- [x] Archived wizard.ts and wizard-client.ts to _archive/ (2026-04-03)

### April 2, 2026
- [x] Open in Editor — uses `VISUAL`/`EDITOR` env var with `open -t` fallback; label changed from "Edit" to "Open in Editor" (2026-04-02)
- [x] Scanning audit — scan on dashboard page load (timeline, files, file detail); debounce shell hook scans (60s); wired up Scan Now refresh button in nav (2026-04-02)
- [x] Back-forward cache fix — `pageshow` listener reloads on browser back so unseen indicators update (2026-04-02)
- [x] Unseen indicators on timeline — yellow dots for changes not yet viewed, matching files page behavior (2026-04-02)
- [x] Font/margin consistency — aligned timestamp styling (`text-xs text-gray-400`) and padding (`px-4`) across timeline and files pages (2026-04-02)
- [x] View toggle label — renamed "Category" to "Group" (2026-04-02)
- [x] Load More pagination — timeline and file detail pages load 50 items, "Load More" button fetches next batch via API (2026-04-02)
- [x] Settings page scroll fix — preview container preserves min-height during refresh to prevent scroll jump (2026-04-02)
- [x] CLI cleanup — `scan` and `install-hook` hidden from `--help`; `status` now scans before showing results; public commands are just `init`, `status`, `serve` (2026-04-02)
- [x] Config cleanup — trimmed suggested roots to `~/.claude`, `~/projects`, `~/dev`; added `SKILL.md` to suggested patterns; changed placeholder to `*.md` (2026-04-02)
- [x] Cache-Control header — `no-store` on all responses to prevent stale dashboard pages (2026-04-02)
- [x] GitHub README — wrote public-facing README.md for the repo with install, quick start, commands, feedback link, and uninstall (2026-04-02)
- [x] Filter "No newline at end of file" from diff display (2026-04-02)
- [x] Updated MacBook Pro global CLAUDE.md — added git status step to end-of-session ritual, removed shell alias references (2026-04-02)
- [x] Updated vault project README with 5-step launch roadmap (2026-04-02)
- [x] Test suite — 44 tests for snapshots, config, scanner using vitest + in-memory SQLite (2026-04-02)
- [x] Code review via compound-engineering:ce-review — 9 findings; applied 2 safe_auto fixes (pagination validation, test assertion) (2026-04-02)
- [x] Fixed unseen indicators on Load More — /api/timeline now returns unseenIds, client renders yellow dots on paginated items (2026-04-02)
- [x] Fixed snapshot query ordering — added `id DESC` tiebreaker for same-timestamp rows (2026-04-02)
- [x] Published to npm as `@mattli/dotmd@0.1.0` — scoped package, 41.6 kB, public access (2026-04-02)
- [x] npm account setup — created account, enabled 2FA, published with automation token (2026-04-02)

### April 1, 2026
- [x] Built Settings page — new `/settings` route with chip-based UI for toggling scan roots/patterns, folder browser, live file preview, save (2026-04-01)
- [x] Per-project categorization — changed flat "project" category to `project:<dirname>` in CLI status, dashboard views, and `categorizeFile()` (2026-04-01)
- [x] Unseen changes indicator — yellow dot on files changed since last viewed; `last_viewed_at` DB column; marks viewed on open (2026-04-01)
- [x] Collapsible diffs — timeline and file detail show diffs collapsed with +/- stats, click to expand (2026-04-01)
- [x] Tree view compression — single-child directory chains collapsed (e.g., `a/b/` instead of nested) (2026-04-01)
- [x] Nav restructure — dashboard default changed to timeline; added Settings nav link (2026-04-01)
- [x] File root grouping — wizard preview and settings group files by scan root instead of category (2026-04-01)
- [x] Scanner auto-cleanup — removes tracked files no longer on disk or not in current config (2026-04-01)
- [x] Category update on rescan — `upsertTrackedFile` now updates category on conflict (2026-04-01)
- [x] Added `dev:serve` script with `--watch` for hot-reload development (2026-04-01)

### March 31, 2026 (session 2)
- [x] Created how-it-works.md technical walkthrough for dotmd (2026-03-31)
- [x] Rewrote "How It Works" section in dotmd README for plain language (2026-03-31)
- [x] Built web-based setup wizard — 3-step flow: pick folders, pick patterns, preview/confirm with checkboxes (2026-03-31)
- [x] `dotmd init` now starts server and opens browser to setup wizard (2026-03-31)
- [x] Added folder browser to setup wizard for picking custom directories (2026-03-31)
- [x] Added collapsible tree view to dashboard files page with localStorage persistence (2026-03-31)
- [x] Added tree/category view toggle with localStorage persistence (2026-03-31)
- [x] Made scanner case-insensitive and deep-search by default (`**/` prefix) (2026-03-31)
- [x] Removed git metadata collection — unnecessary for dotmd's purpose (2026-03-31)
- [x] Only show folders that exist on machine in setup wizard suggestions (2026-03-31)
- [x] Timestamps only show on files that have actually changed (not initial snapshots) (2026-03-31)
- [x] Added select/deselect by group on step 3 preview (2026-03-31)
- [x] Updated dotmd project README with current status, decisions, upcoming features (2026-03-31)

### March 31, 2026
- [x] Reviewed dotmd requirements doc — 6-persona document review; 22 findings; resolved P0 (R8 editing cut), made three strategic decisions: CLI-first, OSS-first, Claude Code first (2026-03-31)
- [x] Updated dotmd requirements — added R10 (session-start notifications), R11 (npm packaging), R12 (auto-discovery onboarding); scoped R2 to Claude Code only; renamed to 2026-03-31-dotmd-requirements.md (2026-03-31)
- [x] Reviewed dotmd implementation plan — 6-persona review; 12 findings after 7 auto-fixes; plan was stale vs updated requirements (2026-03-31)
- [x] Rewrote dotmd implementation plan — merged Units 1+2 into single Core unit (config+scanner+storage+init); restructured to 4 units; added scan_roots config format, glob exclusions, `dotmd status` CLI command, R10 notification format, auto-discovery init flow, "projects without CLAUDE.md" coverage gaps; fixed default patterns to match real Claude Code filesystem (2026-03-31)
- [x] Saved review artifacts — `projects/dotmd/2026-03-31-requirements-review.md` and `projects/dotmd/2026-03-31-plan-review.md` (2026-03-31)

### March 30, 2026 (session 4)
- [x] Rewrote coldmountain.md — replaced "What It Does Today / What It's Becoming" framing with five capability sections: Intelligence, Research, Validation, Specification, Execution (2026-03-30)
- [x] Updated /second-brain page on coldmountain.ai — restructured to match; added inline links to Bird, Readwise, Parallel, Last 30 Days, Superpowers, G-Stack, Compound Engineering (2026-03-30)
- [x] Deployed to Vercel via git push to main (2026-03-30)

### March 30, 2026 (session 3)
- [x] Created dotmd project README — `projects/dotmd/README.md`; matches existing README conventions (scannable sections, internal doc links, minimal tone) (2026-03-30)

### March 30, 2026 (session 2)
- [x] Brainstormed pmtxt product concept — full CE brainstorm workflow; defined problem frame, target user (first PM at 2-15 person startup), core outcome ("what to build next"), approval governance, CLI-first form factor (2026-03-30)
- [x] Created pmtxt requirements doc — `projects/pmtxt/2026-03-30-pmtxt-requirements.md`; integrated reddit-feedback.md research (2026-03-30)
- [x] Created pmtxt implementation plan — `projects/pmtxt/2026-03-30-001-feat-pmtxt-v1-plan.md`; 8 units across 5 phases; TypeScript monorepo, Ink CLI, Next.js dashboard, Anthropic API (2026-03-30)
- [x] Ran last30days product validation — `projects/pmtxt/last30days-validation.md`; moderate-to-strong signal; found competitor Aligno; r/ClaudeAI context-transfer thread validates core problem (2026-03-30)
- [x] Fixed last30days Reddit enrichment timeout — `~/.claude/skills/last30days/scripts/last30days.py`; enrichment calls were missing timeout/retries params; now passes profile-based timeout + 2 retries (2026-03-30)
- [x] Added ScrapeCreators API key to `~/.config/last30days/.env` (2026-03-30)
- [x] Added project file structure override to global CLAUDE.md — brainstorm/plan docs go to `~/second-brain/projects/<project>/` instead of default `docs/` directories (2026-03-30)

### March 30, 2026
- [x] Fixed stale cron task bug in NanoClaw — product briefing ran on Monday instead of Saturday because `next_run` was stuck in the past after a missed window; added staleness check in scheduler loop (`task-scheduler.ts`) to skip cron tasks >10min overdue and advance to next occurrence (2026-03-30)
- [x] Fixed product briefing sourcing — agent was using Product Hunt despite instructions specifying X-only; old archived briefings (which used PH) were contaminating the agent's context; added explicit "use only listed sources" guardrail to `weekly-products.md` instructions

### March 29, 2026
- Integrated Readwise MCP into NanoClaw main group — OAuth via `mcp-remote` stdio bridge with tokens mounted from `~/.mcp-auth`; credential proxy pattern doesn't work here (Readwise uses OAuth, not API keys)
- Fixed stale weekly-summary group CLAUDE.md — `product-briefings/` path corrected to `weekly-products/`
- Fixed `container/build.sh` — now auto-prunes builder cache and uses `--no-cache` to prevent stale COPY layers
- Removed stale agent-runner session copies for briefing, weekly-summary, product-briefing groups
- Documented MCP servers in vault NanoClaw README (Parallel + Readwise, transport types, re-auth instructions)
- Audited all 13 CLAUDE.md files on the machine

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
