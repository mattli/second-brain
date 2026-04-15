### April 15, 2026 (session 2)
- Cleaned up NanoClaw scheduled task prompts to use canonical container paths. The 4 recurring intelligence tasks (daily-briefing, weekly-summary, monthly-summary, product-briefing) had been using `/workspace/extra/second-brain/areas/intelligence/...` which is NOT a valid mount path (no container mount with containerPath="second-brain" for those groups) — tasks were working via agent Glob/search fallback, wasting one tool call per run. Changed prompts to canonical `/workspace/extra/intelligence/...` matching the `intelligence` mount directly. Also updated the 5 IPC cache files. This was a pre-existing quirk since the April 13 PARA reorg, not introduced by today's changes. (2026-04-15)
- Full PARA vault reorganization — two-pass migration. Pass A: promoted `projects/products/` → `products/` (top-level). Pass B: renamed `projects/` → `areas/`. Updated all references across vault (inbox.md, intelligence README, global CLAUDE.md line 31), NanoClaw (DB: 5 registered_groups mount_configs + 12 scheduled_tasks prompts; telegram_main MEMORY.md; 5 IPC cache files), and external repos (voice-tutor/bot.py:113 COST_LOG_PATH, voice-tutor/README.md, product-validation/README.md + SKILL.md + 2 learnings docs). Historical plan docs in areas/nanoclaw/, areas/wiki/, areas/product-validation/ intentionally left unchanged (dated snapshots). Final structure: `~/second-brain/{areas, products, resources, personal, _archive}` + loose files. Phantom `projects/products/pmtxt/` empty dirs kept reappearing from Obsidian Sync pushing stale state from another device — resolution is to open Obsidian on the other devices so they converge. Backups: vault git commit 71c600c, DB backup `messages.db.backup-2026-04-15-para-reorg`. (2026-04-15)
- Consolidated intelligence resources folders. Moved `resources/ai-briefings/`, `weekly-summaries/`, `weekly-products/`, `monthly-summaries/` under `resources/intelligence/` and renamed `ai-briefings` → `daily-briefings` for naming consistency. Updated all 4 intelligence instruction files to use fully-qualified `resources/intelligence/<sub>/` paths. Fixed two pre-existing bugs in NanoClaw scripts: `archive-briefings.sh` INTEL_DIR pointed at stale `projects/intelligence/` path (broken since April 13 reorg), and `test-briefing.sh` product case pointed at nonexistent `product-briefings/` folder (real folder is `weekly-products/`). Side effect: archive script now runs — 4 older daily-briefings (March 31–April 7) moved to `_archive/`. (2026-04-15)
- Built problem-discovery pipeline modeled on product-validation. Created `projects/problem-discovery/` (later renamed → `areas/problem-discovery/` via the PARA pass) with README + instructions/problem-discovery.md, plus `resources/problem-discovery/` for findings output. Ran the pipeline on backpacking/outdoors domain: 9 domain-term queries × 7 subreddits (minus ultralight-in-r/Ultralight carve-out) = 62 searches, 899 unique posts, 282 passed classifier at score 2+. Output at `resources/problem-discovery/2026-04-15-backpacking.md` with 9 pain clusters. Key insight: user pushed back on initial frustration-phrase+domain-term query strategy — too narrow, requires both phrases in same post. Revised to bare domain-term queries, trust classifier for pain detection. Most surprising finding: Reddit users shipping half-built solutions inside the threads themselves. Pipeline is ad-hoc / event-driven, not scheduled. (2026-04-15)
- Investigated why Sequoia's "From Hierarchy to Intelligence" (Jack Dorsey + Roelof Botha, Mar 31) didn't appear in the W15 weekly summary. Root cause was not a time-window bug — W14 (window Mar 28–Apr 4) should have caught it but the Sources Log said "no new essays." Real cause: the VC & Analyst Thesis Search section of `weekly-summary.md` named sources by bare domain with no pinned discovery URL, leaving the agent to run generic web searches that missed a 4-day-old essay. Confirmed via test: `sequoiacap.com/stories/?_story-category=perspective` returns the Dorsey/Botha piece as item #1, cleanly excludes "Partnering with X" portfolio announcements, and would have surfaced it reliably.
- Verified all 8 sources by fetching each and inspecting URL structure. Findings: Sequoia has a taxonomy URL that filters to perspectives only. a16z.com uses path-level categorization (`/announcement/`, `/podcast/` vs bare slugs) — cleaner than the Substack mirror at a16z.news. Kleiner Perkins has no thesis/perspective taxonomy and recent output is entirely portfolio pieces. First Round Review has no date-in-URL and recent output is case studies + tactical how-tos that trip the existing exclusion rules. Benedict Evans, Stratechery have date-in-URL for easy filtering. Ethan Mollick domain should be oneusefulthing.org, not the old oneusefulthing.substack.com. NFX is fine as-is.
- Updated `projects/intelligence/instructions/weekly-summary.md` to v3.6 — replaced bare-domain source list with pinned discovery URLs per source; removed Kleiner Perkins (no thesis taxonomy, portfolio-heavy) and First Round Review (no date filter, output drifted to case studies/how-tos); added Parallel as explicit primary search tool for this section; updated Sources Log template to match. Left the 7-day lookback window unchanged — the window was fine, the discovery mechanism was broken. (2026-04-15)

### April 14, 2026 (session 4)
- Debugged voice tutor unresponsiveness — root cause was Cartesia returning HTTP 402 (out of credits). Initial hypothesis was a wedged long-running `bot.py` process (~24hr uptime, no log file); restarted it, but same symptom. Bot log showed repeated `server rejected WebSocket connection: HTTP 402` from CartesiaTTSService. User subscribed to Cartesia Pro ($5/mo billed monthly, 100K credits ≈ 1.85hr of audio/month at 15 credits/sec) to unblock. (2026-04-14)
- Added per-session cost telemetry to voice tutor — built `UsageAccumulator(BaseObserver)` in `bot.py` that subscribes to Pipecat's `MetricsFrame` events and aggregates LLM tokens (uncached input / cache-read / cache-write / output), TTS characters, and STT duration. On session disconnect writes `<session>.usage.json` sidecar and appends a row to `~/second-brain/projects/products/voice-tutor/cost-log.md` (markdown table — easy Obsidian scan). Prices hardcoded at top of `bot.py` with source URLs and verified-on dates (Anthropic $3/$15/$3.75/$0.30 per MTok, Deepgram Nova-3 $0.0077/min, Cartesia 15 credits/sec, Pro $5/mo for 100K credits). LLM cost exact; STT estimated from session duration (Pipecat's Deepgram service doesn't emit audio-seconds); TTS estimated from char count at 14 chars/sec → credits. Initial implementation used macOS notification via `osascript`; replaced with vault cost-log per user preference. Confirmed prompt caching was already enabled (`enable_prompt_caching=True` at `bot.py:113`). Fixed path bug — project lives at `projects/products/voice-tutor/`, not `projects/voice-tutor/`. (2026-04-14)

### April 14, 2026 (session 3)
- Replicated `work` zsh function on Mac Mini — same setup as MacBook Pro: numbered menu, vault + dynamic `~/development/` subfolders, skips `_`-prefixed. Created `~/development/_archive/` (empty). Mac Mini dev state is cleaner — only 3 folders: `dotmd`, `product-validation`, `voice-tutor`; nothing to archive. Existing aliases (`vault`, `brain`, `nanoclaw`, etc.) preserved. Corrected the reference glob `*/(N)` → `*(N/)` (the original is invalid zsh syntax). (2026-04-14)

### April 14, 2026 (session 2)
- Added `work` zsh function to `~/.zshrc` on MacBook Pro — numbered menu picker that lists `~/second-brain` (vault) + every subfolder of `~/development/`, skips `_`-prefixed folders, cds into the selection and launches `claude`. Dynamic discovery so new projects appear automatically. `vault` and `brain` aliases kept alongside. Prompt drafted for replicating the same setup on Mac Mini. (2026-04-14)
- Archived 9 stale dev folders to `~/development/_archive/` on MacBook Pro — `cieg`, `claude-code-test`, `dev-tools`, `extractlyrics`, `gpt-thought-logger`, `interpret-text`, `school-search`, `semantic-music-search`, `wordsmith`. Safety check first: 5 were clean git repos with remotes, 3 had no `.git` (local-only, no GitHub loss risk), 1 (`semantic-music-search`) had 2 uncommitted files that travel with the `mv`. Remaining active: `cold-mountain`, `dotmd`, `pmtxt`. Note: `interpret-text`'s GitHub remote is actually named `learning-map` — looks like a past rename. (2026-04-14)
- Investigated Compound Engineering output routing — user recalled redirecting `/ce:compound` output to the vault but couldn't remember how. Exhaustive search of `~/second-brain/`, `~/.claude/`, and the `compound-engineering` plugin found **zero** CE output in the vault and zero routing mechanism. Conclusion: past CE runs landed in the individual repos' `docs/solutions/` folders, not the vault — memory was off. Decision going forward: let CE keep its default (per-project `docs/solutions/`), since `learnings-researcher` only searches the current repo. voice-tutor CE output will live in `~/development/voice-tutor/docs/solutions/` on the Mac Mini (not in the vault copy of voice-tutor, which is docs-only). (2026-04-14)

### April 14, 2026
- Built and ran the product-validation skill V0 — Reddit-first hypothesis-validation pipeline, `Claude does the thinking + ~140-line Python wrapper around last30days lib/reddit.py`. Three tasks: (1) `reddit_search.py` helper with opt-in `--enrich` flag that fetches top comments via `enrich_reddit_item_sc` (ScrapeCreators path, no Reddit rate limit), (2) `SKILL.md` with 6-step pipeline (read doc → generate queries → search → classify → write findings → report), (3) end-to-end run on voice-tutor. Dispatched via subagent-driven-development. Mid-Task-1 discovery: Reddit search endpoint returns titles only — no `selftext`, no comments — required adding the enrichment step; classification works from title + top_comments. ScrapeCreators credit accident mid-run (account drained to -22), topped up with 25k credits and re-ran. Final run: 156 unique posts → 9 passed classifier (3 score-3, 6 score-2), 2 power-user candidates (u/0rAX0 with 500+ Readwise articles is the strongest lead). Output: `~/second-brain/projects/products/voice-tutor/product-validation-findings-2026-04-14.md`. (2026-04-14)
- Promoted product-validation to its own dev folder — created `~/development/product-validation/` (git init), moved skill files (`SKILL.md`, `reddit_search.py`) out of `~/.claude/skills/` and symlinked `~/.claude/skills/product-validation` → the new dev folder so Claude Code still finds it. Wrote `README.md` covering V0 status, architecture, last30days v2.9.5 pin (don't upgrade — v3 removed `score.py`), ScrapeCreators dependency, cost (~250–400 credits per run), V0/V1 distinction, known limitations, runs to date. Files staged but not yet committed. (2026-04-14)
- Captured two cross-tool engineering learnings via `ce:compound` — "Search APIs return preview data, not enough for classification" (search returns links, not documents — plan an enrichment step from the start) and "Plan code drafts will lie about unfamiliar library APIs" (don't pre-bake field names; mark API calls as VERIFY). Both live in `~/development/product-validation/docs/learnings/` (initially put in vault `docs/solutions/` then moved — vault is for product knowledge, dev folder is for engineering postmortems). (2026-04-14)

### April 13, 2026 (session 6)
- Cleaned up products strategy and voice-tutor docs — fixed 3 broken links in STRATEGY/ (README.md, product-vision.md, ideas.md all pointed to nonexistent `../ideas/ideas.md`). Flattened voice-tutor folder: removed `docs/` and `docs/plans/` subfolders, moved all files to project root. Renamed files to drop date prefixes and add version context: `v1-requirements.md`, `v1-plan.md`, `productization.md`. Added `status: draft` frontmatter to productization.md. Updated all internal cross-references (v1-plan.md, ideas.md). (2026-04-13)

### April 13, 2026 (session 5)
- Built Voice Tutor V1 — self-hosted voice conversation service on Mac Mini using Pipecat + Claude + Deepgram STT + Cartesia TTS. Four implementation units: (1) basic voice pipeline with SmallWebRTC transport and prebuilt UI, (2) transcript saving to ~/.voice-tutor/transcripts/ on session disconnect, (3) session memory loading profile + last 3 transcripts into system prompt with prompt caching, (4) startup script and README. Accessible from phone via Tailscale Serve HTTPS proxy at matts-mac-mini.taild1f9b7.ts.net. Added wiki integration beyond original plan — loads full ~/second-brain/resources/wiki/ (~50K tokens) into system prompt so the voice tutor can teach from the personal knowledge base. Latency feels conversational (sub-2s). Known UI issue: Pipecat prebuilt playground shows duplicated text (sends both bot-llm-text and deprecated bot-transcription), voice output is correct. Repo at ~/Development/voice-tutor/. (2026-04-13)

### April 13, 2026 (session 4)
- Updated coldmountain.ai — added dotmd project card to homepage (Dev Tool pill, links to GitHub repo, npm package mention). Added Readwise wiki / Karpathy LLM wiki pattern to Second Brain page. Merged Intelligence + Research into single section, merged Specification + Execution into single section. Updated tech stack to model-agnostic "Claude via Anthropic API". Updated tagline to "Product manager. Product builder." Updated vault doc (coldmountain.md) with Readwise wiki mention. (2026-04-13)

### April 13, 2026 (session 3)
- Ran atomic notes experiment — distilled 13 atomic notes from 30 days of Telegram conversation history (~856 messages from main group). Notes cover building the system, product thinking, personal patterns, and bigger questions. Output at `resources/atomic-notes/`. One-off experiment to evaluate whether conversation logs can produce useful atomic notes per YB_Effect's pattern. (2026-04-13)
- Three-pass vault reorganization to PARA structure — moved pipeline outputs and wiki out of `projects/intelligence/` into proper locations. Pass 1: `intelligence/wiki/` → `resources/wiki/`, `intelligence/atomic-notes-experiment/` → `resources/atomic-notes/`. Pass 2: `intelligence/ai-briefings/`, `intelligence/weekly-summaries/`, `intelligence/monthly-summaries/`, `intelligence/weekly-products/` → `resources/`. Pass 3: `intelligence/instructions/readwise-wiki.md` → `projects/wiki/instructions/readwise-wiki.md`, created `projects/wiki/` and `projects/atomic-notes/` as dedicated pipeline projects. Updated all references across vault (backlog, session-tasks, READMEs, engineering docs, instruction files, product-vision links) and NanoClaw (6 group CLAUDE.md files, 6 DB registered_groups mount configs, 1 scheduled_tasks prompt). Each pass included: SQLite backup, grep verification for zero stale references, NanoClaw restart, container spawn test confirming mounts work. Final state: `projects/intelligence/` contains only briefing instructions, `projects/wiki/` owns wiki pipeline instructions, `resources/` holds all pipeline outputs at vault root. (2026-04-13)

### April 13, 2026 (session 2)
- Updated NanoClaw v1.2.15 → v1.2.52 — merged 365 upstream commits crossing two breaking changes (OneCLI Agent Vault v1.2.35, pino removal v1.2.36). Kept native credential proxy via `upstream/skill/native-credential-proxy` branch (preserves Parallel AI, GitHub token, and Readwise MCP routes). Deferred OneCLI migration as separate follow-up. Key upstream features adopted: per-group trigger patterns, MAX_MESSAGES_PER_PROMPT, stale session recovery, task scripts, reply/quoted message context, built-in logger, stopContainer security hardening, session cleanup service. Preserved all local customizations: Telegram multi-bot, per-group model config, Readwise MCP, Parallel AI, Last30Days IPC, thread search. One post-merge bug caught during smoke test: upstream emptied channel import barrel file, causing "No channels connected" crash — fixed by re-adding Telegram import. Both code paths verified end-to-end (Telegram ad-hoc spawn + daily briefing scheduled task). Detailed merge doc at `projects/nanoclaw/update-v1.2.52-2026-04-13.md`. Rollback branch `pre-update-backup` preserved. (2026-04-13)
- Added VentureBeat as secondary funding source for daily briefing — Section 3 of `intelligence/instructions/daily-briefing.md` was light on funding coverage with only TechCrunch as a source. VentureBeat covers AI funding consistently and is free. (2026-04-13)
- Recategorized backlog — renamed "Memory & CLAUDE.md" → "Agent Behavior", merged "WIKI" + "Prompts" → "Intelligence Pipeline", moved items between NanoClaw and Infrastructure for better fit. (2026-04-13)

### April 13, 2026
- Investigated 3 AM readwise-wiki scheduled task failure — root cause was DNS resolution failure (`getaddrinfo ENOTFOUND api.anthropic.com`) due to WiFi being down, not an Anthropic API outage. The cron fired on time, container spawned, but all external hosts were unreachable. Container eventually got a 502 Bad Gateway as network partially recovered, treated it as fatal, and exited. Decision: hardwire Mac Mini to ethernet; defer adding retry logic unless failures recur. (2026-04-13)
- Updated readwise-wiki compiler instructions to v2.3 — four changes: (1) removed fixed AI-only folder structure, compiler can now create new folders when no existing one fits; (2) explicit scope statement that all saved topics are valid, not just AI/tech; (3) single-article pages are OK if substantive enough; (4) topic/relevance/perceived-value are never valid skip reasons for any tier; (5) removed `no_content` as a skip reason — bare URLs still get Tier D bookmark treatment. Triggered by today's run skipping non-AI saves like writing advice and cold outreach guides with reasons like "no AI angle." (2026-04-13)
- Triggered one-off readwise-wiki reprocess task via IPC — targets documents skipped in today's run (Dickie Bush, Cold Outreach Bible, Jason Cohen, Charles Miller, etc.) using updated v2.3 instructions. Had to fix group_folder in DB after IPC handler resolved targetJid to telegram_main instead of readwise-wiki. (2026-04-13)

### April 12, 2026
- Changed Wiki Tutor research log behavior from auto-log-then-announce to approval-before-logging — updated `groups/wiki-tutor/CLAUDE.md` "Announce logging" subsection to "Approval before logging" (ask user, wait for confirmation, support deferred approval). (2026-04-12)
- Created instruction file map — interactive HTML diagram showing all CLAUDE.md, MEMORY.md, and instruction files across `~/.claude/`, `~/nanoclaw/`, and `~/second-brain/`, with hover tooltips on every file. Investigated SDK auto-memory in containers: wiki-tutor has auto-generated memory at `data/sessions/wiki-tutor/.claude/.../memory/` because its CLAUDE.md has no explicit memory instructions (SDK fills the gap); telegram_main's is empty because its CLAUDE.md tells the agent to use `groups/telegram_main/MEMORY.md` instead. Both have `CLAUDE_CODE_DISABLE_AUTO_MEMORY: "0"` — identical config, different behavior from instructions. Saved to `projects/nanoclaw/instruction-map-2026-04-12.html`, referenced in NanoClaw vault README. (2026-04-12)
- Extended Readwise Wiki system with research log pipeline — Wiki Tutor now logs web research during conversations to `wiki/raw/research-log.md`, which the weekly compiler processes as Phase 0 (Tier A-equivalent, before Readwise content). Implementation: (1) gave Wiki Tutor read-write vault access via new `~/second-brain` mount at `/workspace/extra/second-brain`; (2) created `wiki/raw/research-log.md` with header; (3) added Phase 0 to compiler instructions with entry format, archive mechanism (`raw/_archive/research-log-YYYY-WW.md`), and manifest section; (4) added research log instructions to Wiki Tutor's CLAUDE.md — when to log, source quality guidance, entry format, announce+undo behavior. Also fixed pre-existing bug: compiler git commands referenced `/workspace/extra/second-brain` but vault is mounted at `/workspace/extra/vault`. Fixed Wiki Tutor CLAUDE.md contradiction where it said "cannot write under any circumstance" but now writes the research log. (2026-04-12)

### April 11, 2026
- Shipped multi-bot Telegram — NanoClaw Telegram channel now supports per-group bot personas. Wiki Tutor group now has its own dedicated bot `@matts_wiki_tutor_bot` with its own name and avatar; main chat continues on `@matts_second_brain_bot`. Three-unit implementation (commits `750a88c`, `7fef372`, `0203592`): Unit 1 loads multi-token env + `~/.config/nanoclaw/telegram-bots.json` group→bot assignment file; Unit 2 replaces `this.bot` with `Map<botId, Bot>`, adds bot-ID-aware inbound filter (drops cross-bot messages before `onMessage`) and group-aware outbound dispatch; Unit 3 docs. Pressure-tested architecture via `/ce-plan` against alternatives — in-DB column and second-process both rejected. JSON config file touches exactly **one** core src file (`src/channels/telegram.ts`) vs 4 for in-DB vs 5 for second-process. Zero overlap with pending OneCLI Vault v1.2.35 upgrade. One approved deviation: added `readEnvFilePrefix(prefix)` to `src/env.ts` because launchd does NOT populate `process.env` with secrets (they live in `.env` via `readEnvFile`) — pure-process.env scan would have silently failed in production. All 293 tests pass, full 7-phase smoke test passed: regression baseline, BotFather setup + privacy off, both bots load on startup, inbound/outbound routing, cross-bot filter (both bots in same chat → only assigned bot delivers, proved via `phase4 bothbots` test), unaffected-group regression, reboot persistence. Plan at `projects/nanoclaw/engineering-docs/2026-04-11-002-feat-multi-bot-telegram.md`. (2026-04-11)
- Shipped Wiki Tutor NanoClaw group — new `wiki-tutor` group in Telegram, dedicated "Wiki Tutor" chat, `requiresTrigger: false`, opus model, read-only mount of `~/second-brain/resources/wiki` at `/workspace/extra/wiki`. Zero code changes — pure config (new `groups/wiki-tutor/CLAUDE.md` + one `registered_groups` row). Persona is reference-librarian: menu-first from INDEX.md, nugget not summary (2–4 sentences capturing sharpest claim), 2–3 prose follow-up moves, no quizzing/scoring/tracking. Smoke test passed: category drill-down correct, first nugget (Knowledge Work Future → Polanyi's "tacit knowing as process, not category") verified accurate against page line 59. Plan at `projects/nanoclaw/engineering-docs/2026-04-11-001-feat-wiki-tutor-group-plan.md`; V2 direction (Socratic research with sourced wiki write-back via readwise-wiki compiler) captured at end of plan doc. (2026-04-11)
- Moved plan doc from `nanoclaw/docs/plans/` to `projects/nanoclaw/plans/` per global file-structure convention; removed the empty `docs/plans/` directory. Also discovered and documented that NanoClaw auto-creates `groups/<name>/logs/` on registration (src/index.ts:114), so future group setups don't need to pre-create it; `conversations/` in existing groups is cargo-culted and not referenced in source. (2026-04-11)
- Discovered Telegram bot privacy mode gotcha for `requiresTrigger: false` groups — Telegram hides plain messages from bots in group chats by default (privacy mode on), so NanoClaw's `requiresTrigger: false` flag alone is insufficient for non-DM groups. Must also disable Group Privacy for the bot in BotFather. Flipped privacy off on @matts_second_brain_bot to ship the tutor. Privacy mode is per-bot, global across all the bot's groups — but other groups still enforce the trigger at the NanoClaw application layer, so no behavior change for them. Proposing to add this to project CLAUDE.md. (2026-04-11)

### April 9, 2026 (session 3)
- Wiki compiler v2.2 — decoupled fetch window from fixed schedule (reads `run_start` from previous manifest instead of hardcoding "7 days ago", falls back to 30 days on first run), added `unorganized.md` holding page for Tier C/D documents with no matching topic page (no more silent "off_topic" or "no matching page" skips), removed `off_topic` skip reason, added unorganized section to manifest schema, exempted `unorganized.md` from orphan lint check. (2026-04-09)
- Backfilled source URLs across all 20 wiki pages — matched ~107 source entries against Readwise library, added `([link](URL))` to each. One unmatched: "Lessons from Building Claude Code" (not in Readwise). Updated compiler Page Guidelines and template to include URLs in Sources format going forward. (2026-04-09)
- Reorganized wiki into category folders — moved 20 pages into `concepts/`, `tools/`, `models-safety/`, `landscape/`, `people/`. Updated INDEX.md paths, ~35 inter-page links across 15 files, and compiler instructions for folder-aware page placement. (2026-04-09)

### April 9, 2026 (session 2)
- Assessed wiki compiler v2.0 first run via LAST_RUN_MANIFEST.md — 20 pages, 0 orphans, 0 broken links, Tier C references correct, video transcripts processed. Identified two issues: context exhaustion during Tier B with temp file loss on resume, and manifest not itemizing skipped documents. (2026-04-09)
- Implemented wiki compiler v2.1 — Tier B processing changed to one-at-a-time (was batched 2-3), per-batch/per-document git commits (was end-of-run only), state persistence to `/workspace/state/` with `pending.json` checkpoint (was `/tmp`), manifest skip list now itemizes every skipped document with ID/title/category/words/reason. Updated both `readwise-wiki.md` instructions and group `CLAUDE.md`. (2026-04-09)
- Updated wiki README — fixed stale schedule (was "every Friday at 10pm", now "3am Monday and Thursday"), added deferred items list (unorganized.md page, prior-session rename, per-doc time tracking, cadence review, manual Tier C synthesis). (2026-04-09)

### April 9, 2026
- Fixed readwise-wiki scheduled task failure — group was in DB but not in-memory because it was registered after the process started. Added scheduler group refresh from DB each tick to prevent stale-group bugs. Added pause+notify on group-not-found (same pattern as invalid folder). Re-triggered missed wiki run manually. (2026-04-09)
- Added auto-restart to `npm run build` — `tsc && launchctl kickstart -k` so NanoClaw always picks up new compiled code. Use `npm run typecheck` for type-only checks. (2026-04-09)
- Audited readwise-wiki run output — cross-referenced 105 Readwise documents against wiki commit. Found ~40% of documents skipped: 15 videos with full transcripts (word_count: 0 API quirk), several 10K+ word articles, tool bookmarks, and a 131K-word PDF. Root causes: no batching, Sonnet rushing, no video transcript awareness, no audit trail. (2026-04-09)
- Implemented wiki compiler v2.0 — per-group model configuration (Opus for wiki, Sonnet default for others), tiered processing workflow (A: full read <20K, B: full read 20-50K, C: reference-only >50K, D: bookmarks), batching in groups of 5-8, video transcript fix, error handling (rate limits/failed fetches/timeout awareness), LAST_RUN_MANIFEST.md audit trail with time breakdown. Plan at `projects/nanoclaw/engineering-docs/2026-04-09-readwise-wiki-improvements.md`. DB updated: model=opus, timeout=90min. Awaiting manual first run to verify. (2026-04-09)

### April 8, 2026
- Updated `intelligence/instructions/daily-briefing.md` Section 3: replaced Product Hunt with TechCrunch (primary) + Show HN secondary pass for funded/well-known team dev tool launches; explicitly excludes frontier model releases and indie/solo-dev launches (handled by Section 2 and weekly X scrape). Updated Sources Log table accordingly. (2026-04-08)
- Rescheduled `readwise-wiki` NanoClaw task from `0 22 * * 5` (Fri 10pm) to `0 3 * * 1,4` (Mon + Thu 3am local). Twice-weekly to handle increased Readwise volume; 3am chosen to avoid collision with own Claude Code usage. Confirmed scheduler parses cron in local TZ via `src/config.ts` → `TIMEZONE`. (2026-04-08)

### April 7, 2026
- Renamed `projects/resources/wiki/_index.md` → `INDEX.md` and updated 5 references across wiki/README.md, intelligence/README.md, and instructions/readwise-wiki.md. Dropping the leading-underscore convention for meta files; `_archive/` is the kept exception. (2026-04-07)

### April 6, 2026
- Reorganized gstack project folder: moved everything from `~/.gstack/projects/second-brain/` into `~/.gstack/projects/pmtxt/` (design doc, learnings.jsonl, resources-shown.jsonl, timeline.jsonl, designs/mockup-20260406/) and removed the empty `second-brain/` dir. Future gstack sessions for other products won't get mixed in. Note: downstream gstack skills like `/plan-eng-review` need to be run from the actual pmtxt code repo so the slug resolves to `pmtxt`. (2026-04-06)
- Ran `/office-hours` on pmtxt — produced approved design doc at `~/.gstack/projects/second-brain/mattli-unknown-design-20260406-151458.md` (9/10 quality, 2 review iterations). Chose "The Interview" approach: standalone onboarding experience as narrowest wedge, validates externalization-of-tacit-knowledge thesis with minimal build. Key reframe: KB's job is to make PM's tacit knowledge explicit, not to make the LLM smarter (revised after subagent challenged Premise 3 about persistent context vs 1M-token windows). Honest assessment: no demand evidence yet, founder hasn't observed current PM workflow recently. Assignment: talk to 5 PMs this week before building. (2026-04-06)
- Generated HTML wireframe for The Interview at `/tmp/gstack-sketch-pmtxt.html` — three screens: conversational interview with KB sidebar filling in real-time, KB overview with depth indicators, recommendations with grounded rationale and copy-prompt action. (2026-04-06)
- Configured gstack: telemetry off, proactive on, cross-project learnings on, routing rules declined, lake-intro seen. Added OpenAI API key to `~/.gstack/openai.json` (image gen still pending OpenAI org verification propagation). (2026-04-06)
- Reorganized `projects/products/pmtxt/`: created `archive/` subfolder, moved superseded docs into it (2026-03-30 requirements, 2026-03-30 v1 plan, 2026-04-04 brainstorm, plus an earlier wireframe stub with an awkward filename). Copied the office-hours design doc into the vault as `2026-04-06-pmtxt-interview-design.md` and the wireframe HTML as `2026-04-06-pmtxt-interview-wireframe.html`. Created a sibling markdown stub `2026-04-06-pmtxt-interview-wireframe.md` so the wireframe is discoverable in Obsidian. Rewrote `README.md` to reflect the spec ↔ design relationship (long-term vision vs V1 build target) and explain the archive contents. (2026-04-06)
- Added "Vault Sync Architecture" section to `~/.claude/CLAUDE.md` documenting that the vault on this MacBook Pro is an Obsidian Sync mirror (no `.git` here), the actual git repo lives on the Mac Mini, NanoClaw runs vault-sync every 30 minutes, and the End of Session protocol's step 5 (git status) should be skipped on this machine. Prevents future sessions from wasting time hunting for `.git`. (2026-04-06)
- Updated wireframe references in both copies of the design doc (vault + `~/.gstack/projects/second-brain/`) to point at the permanent vault location instead of the ephemeral `/tmp/gstack-sketch-pmtxt.html`. Downstream gstack skills (`/plan-eng-review`, etc.) will resolve correctly after the next reboot wipes `/tmp/`. (2026-04-06)

### April 5, 2026 (session 3)
- Created `wiki/README.md` — explains wiki purpose, use case, maintenance, and how it fits the intelligence system (2026-04-05)
- Fixed stale `index.md` → `_index.md` references in intelligence README (2026-04-05)

### April 5, 2026 (session 2)
- Committed and pushed NanoClaw: migrated main group → telegram_main, cleaned up global CLAUDE.md, added gitignore rules for compiled skill files and nanoclaw.db (2026-04-05)
- Added `created_at` and `last_updated` frontmatter to all 12 wiki pages (2026-04-05)
- Updated readwise-wiki compiler instructions to include both date fields in template (2026-04-05)
- Renamed wiki `index.md` → `_index.md` for top-sort in file explorers (2026-04-05)
- Deleted stale `docs/brainstorms/` and `docs/plans/` from NanoClaw repo (2026-04-05)
- Deleted accidental `SELECT * FROM scheduled_tasks;` file (2026-04-05)

### April 5, 2026
- Bootstrapped Readwise wiki — processed all 65 saves, created 12 wiki pages (LLM Knowledge Bases, Agent Proficiency, AI Careers, Andrej Karpathy, Claude Code Skill Frameworks, Agentic Engineering, AI-Native Product Development, AI Startup Distribution, AI Organization Design, Business Moats in AI, YC AI Thesis, Peter Steinberger) at `resources/wiki/` (2026-04-05)
- Wrote readwise-wiki instructions file (`wiki/instructions/readwise-wiki.md`) — fixed vault git path, added tool bookmark guidance (2026-04-05)
- Scheduled Readwise wiki as weekly NanoClaw task — Fridays 10pm, isolated container, incremental (last 7 days only) (2026-04-05)
- Updated NanoClaw README with Readwise Wiki group and scheduled task (2026-04-05)
- Added `set -g mouse on` to `~/.tmux.conf` for trackpad scrolling in tmux (2026-04-05)
- Split nanoclaw alias into `nanoclaw` (no tmux) and `nanoclaw-tmux` (with tmux) in `~/.zshrc` (2026-04-05)

### April 4, 2026 (session 4)
- Diagnosed why weekly product briefing yields ~12-20 products vs 209 in March 28 run — agent was freelancing `last30days_research` searches instead of using thread search; render cap of 15 items on research path; agent cherry-picking instead of cataloging all replies (2026-04-04)
- Fixed: added instruction to block `last30days_research`, added `min_replies:50` to thread search query, bumped reply fetch from 100→300, told agent to extract all products not cherry-pick (2026-04-04)
- Added backlog item: Readwise wiki compiler (weekly scheduled task, Karpathy LLM wiki pattern) (2026-04-04)
- Un-ignored backlog.md in second-brain .gitignore (2026-04-04)

### April 4, 2026 (session 3)
- Diagnosed low product count in weekly briefing (18 vs expected 100+) — three bugs: `--count=N` flag silently ignored by bird-search.mjs (equals vs space parsing), `keywords` vs `query` field mismatch in IPC handler, Twitter API caps at ~40 replies per conversation_id (2026-04-04)
- Fixed all three: split `--count` into two spawn args, added `data.query || data.keywords` fallback, renamed `keywords` to `query` in instructions and group CLAUDE.md (2026-04-04)
- Ran oneoff product briefing (2026-04-04c) to verify fixes — reply counts up (88, 57, 40 per search vs previous 20); dedup against earlier runs limited new products but pipeline is working (2026-04-04)
- Added tmux to nanoclaw alias in ~/.zshrc — prevents SSH broken pipe from killing Claude Code sessions (2026-04-04)
- Killed stale dotmd tmux session from March 31 (2026-04-04)

### April 4, 2026 (session 2)
- Restored original morning product briefing (2026-04-04.md) after oneoff afternoon run overwrote it; renamed afternoon version to 2026-04-04b.md following existing a/b/c convention (2026-04-04)

### April 4, 2026
- Diagnosed broken X thread reply fetching in weekly product briefing — `last30days_thread_search` IPC handler was never committed to git, lost during March 28 rebuild; both March 30 and April 4 briefings affected (2026-04-04)
- Rebuilt thread search handler in `src/skill-handlers/last30days.ts` — two-phase flow: bird-search finds starters, then fetches replies via `conversation_id:`; tested end-to-end with live credentials (2026-04-04)
- Added "Commit Before Ending a Session" rule to project CLAUDE.md to prevent recurrence (2026-04-04)
- Updated weekly-summary.md v3.3→v3.4 — replaced "VC Thesis Search" (Task 4) with expanded "Strategic Signals" section (4a: 8 sources including NFX, Benedict Evans, Stratechery, Ethan Mollick, First Round Review; 4b: overnight catch-up scan); updated VC Lens output section; expanded Sources Log template; fixed a16z URL to a16z.news (2026-04-04)

### April 3, 2026
- Merged 3-step setup wizard into single-page settings — shared code for /setup (init) and /settings (2026-04-03)
- Folder browser UX — Add/Remove buttons per row, grayed-out covered subfolders, all chips have X buttons (2026-04-03)
- Pattern chips UX — X to remove, suggested patterns restore to original position, suggestions section toggles visibility (2026-04-03)
- Subdirectory grouping — collapsible details/summary in file preview for both wizard and settings (2026-04-03)
- Live file count — "N of M files selected" updates on checkbox changes (2026-04-03)
- Section dividers and right-aligned save button (2026-04-03)
- Help page — commands, scanning behavior, dashboard views, privacy, feedback link (2026-04-03)
- Back button preserves wizard state via URL params (2026-04-03)
- Next/Preview buttons disabled when no selections (2026-04-03)
- Settings page only shows suggested folders that exist on disk (2026-04-03)
- No pre-selected patterns on init — user chooses everything (2026-04-03)
- Friendly port-in-use message instead of crash (2026-04-03)
- dotmd serve and dotmd init auto-open browser (2026-04-03)
---no-open flag for dev server to prevent tab spam on hot-reload (2026-04-03)
- Open in Editor returns error to UI when editor command not found (2026-04-03)
- dotmd status shows "Changes in the last 24 hours" instead of last 5 (2026-04-03)
- Amber refresh button in nav (2026-04-03)
- Dashboard screenshot added to README (2026-04-03)
- Published v0.1.1 through v0.1.6 to npm (2026-04-03)
- Fresh install tested on Mac Mini — full flow working (2026-04-03)
- GitHub repo made public (2026-04-03)
- Launch post submitted to r/ClaudeAI — pending mod approval (2026-04-03)
- Archived wizard.ts and wizard-client.ts to _archive/ (2026-04-03)

### April 2, 2026
- Open in Editor — uses `VISUAL`/`EDITOR` env var with `open -t` fallback; label changed from "Edit" to "Open in Editor" (2026-04-02)
- Scanning audit — scan on dashboard page load (timeline, files, file detail); debounce shell hook scans (60s); wired up Scan Now refresh button in nav (2026-04-02)
- Back-forward cache fix — `pageshow` listener reloads on browser back so unseen indicators update (2026-04-02)
- Unseen indicators on timeline — yellow dots for changes not yet viewed, matching files page behavior (2026-04-02)
- Font/margin consistency — aligned timestamp styling (`text-xs text-gray-400`) and padding (`px-4`) across timeline and files pages (2026-04-02)
- View toggle label — renamed "Category" to "Group" (2026-04-02)
- Load More pagination — timeline and file detail pages load 50 items, "Load More" button fetches next batch via API (2026-04-02)
- Settings page scroll fix — preview container preserves min-height during refresh to prevent scroll jump (2026-04-02)
- CLI cleanup — `scan` and `install-hook` hidden from `--help`; `status` now scans before showing results; public commands are just `init`, `status`, `serve` (2026-04-02)
- Config cleanup — trimmed suggested roots to `~/.claude`, `~/projects`, `~/dev`; added `SKILL.md` to suggested patterns; changed placeholder to `*.md` (2026-04-02)
- Cache-Control header — `no-store` on all responses to prevent stale dashboard pages (2026-04-02)
- GitHub README — wrote public-facing README.md for the repo with install, quick start, commands, feedback link, and uninstall (2026-04-02)
- Filter "No newline at end of file" from diff display (2026-04-02)
- Updated MacBook Pro global CLAUDE.md — added git status step to end-of-session ritual, removed shell alias references (2026-04-02)
- Updated vault project README with 5-step launch roadmap (2026-04-02)
- Test suite — 44 tests for snapshots, config, scanner using vitest + in-memory SQLite (2026-04-02)
- Code review via compound-engineering:ce-review — 9 findings; applied 2 safe_auto fixes (pagination validation, test assertion) (2026-04-02)
- Fixed unseen indicators on Load More — /api/timeline now returns unseenIds, client renders yellow dots on paginated items (2026-04-02)
- Fixed snapshot query ordering — added `id DESC` tiebreaker for same-timestamp rows (2026-04-02)
- Published to npm as `@mattli/dotmd@0.1.0` — scoped package, 41.6 kB, public access (2026-04-02)
- npm account setup — created account, enabled 2FA, published with automation token (2026-04-02)

### April 1, 2026
- Built Settings page — new `/settings` route with chip-based UI for toggling scan roots/patterns, folder browser, live file preview, save (2026-04-01)
- Per-project categorization — changed flat "project" category to `project:<dirname>` in CLI status, dashboard views, and `categorizeFile()` (2026-04-01)
- Unseen changes indicator — yellow dot on files changed since last viewed; `last_viewed_at` DB column; marks viewed on open (2026-04-01)
- Collapsible diffs — timeline and file detail show diffs collapsed with +/- stats, click to expand (2026-04-01)
- Tree view compression — single-child directory chains collapsed (e.g., `a/b/` instead of nested) (2026-04-01)
- Nav restructure — dashboard default changed to timeline; added Settings nav link (2026-04-01)
- File root grouping — wizard preview and settings group files by scan root instead of category (2026-04-01)
- Scanner auto-cleanup — removes tracked files no longer on disk or not in current config (2026-04-01)
- Category update on rescan — `upsertTrackedFile` now updates category on conflict (2026-04-01)
- Added `dev:serve` script with `--watch` for hot-reload development (2026-04-01)

### March 31, 2026 (session 2)
- Created how-it-works.md technical walkthrough for dotmd (2026-03-31)
- Rewrote "How It Works" section in dotmd README for plain language (2026-03-31)
- Built web-based setup wizard — 3-step flow: pick folders, pick patterns, preview/confirm with checkboxes (2026-03-31)
- `dotmd init` now starts server and opens browser to setup wizard (2026-03-31)
- Added folder browser to setup wizard for picking custom directories (2026-03-31)
- Added collapsible tree view to dashboard files page with localStorage persistence (2026-03-31)
- Added tree/category view toggle with localStorage persistence (2026-03-31)
- Made scanner case-insensitive and deep-search by default (`**/` prefix) (2026-03-31)
- Removed git metadata collection — unnecessary for dotmd's purpose (2026-03-31)
- Only show folders that exist on machine in setup wizard suggestions (2026-03-31)
- Timestamps only show on files that have actually changed (not initial snapshots) (2026-03-31)
- Added select/deselect by group on step 3 preview (2026-03-31)
- Updated dotmd project README with current status, decisions, upcoming features (2026-03-31)

### March 31, 2026
- Reviewed dotmd requirements doc — 6-persona document review; 22 findings; resolved P0 (R8 editing cut), made three strategic decisions: CLI-first, OSS-first, Claude Code first (2026-03-31)
- Updated dotmd requirements — added R10 (session-start notifications), R11 (npm packaging), R12 (auto-discovery onboarding); scoped R2 to Claude Code only; renamed to 2026-03-31-dotmd-requirements.md (2026-03-31)
- Reviewed dotmd implementation plan — 6-persona review; 12 findings after 7 auto-fixes; plan was stale vs updated requirements (2026-03-31)
- Rewrote dotmd implementation plan — merged Units 1+2 into single Core unit (config+scanner+storage+init); restructured to 4 units; added scan_roots config format, glob exclusions, `dotmd status` CLI command, R10 notification format, auto-discovery init flow, "projects without CLAUDE.md" coverage gaps; fixed default patterns to match real Claude Code filesystem (2026-03-31)
- Saved review artifacts — `projects/dotmd/2026-03-31-requirements-review.md` and `projects/dotmd/2026-03-31-plan-review.md` (2026-03-31)

### March 30, 2026 (session 4)
- Rewrote coldmountain.md — replaced "What It Does Today / What It's Becoming" framing with five capability sections: Intelligence, Research, Validation, Specification, Execution (2026-03-30)
- Updated /second-brain page on coldmountain.ai — restructured to match; added inline links to Bird, Readwise, Parallel, Last 30 Days, Superpowers, G-Stack, Compound Engineering (2026-03-30)
- Deployed to Vercel via git push to main (2026-03-30)

### March 30, 2026 (session 3)
- Created dotmd project README — `projects/dotmd/README.md`; matches existing README conventions (scannable sections, internal doc links, minimal tone) (2026-03-30)

### March 30, 2026 (session 2)
- Brainstormed pmtxt product concept — full CE brainstorm workflow; defined problem frame, target user (first PM at 2-15 person startup), core outcome ("what to build next"), approval governance, CLI-first form factor (2026-03-30)
- Created pmtxt requirements doc — `projects/pmtxt/2026-03-30-pmtxt-requirements.md`; integrated reddit-feedback.md research (2026-03-30)
- Created pmtxt implementation plan — `projects/pmtxt/2026-03-30-001-feat-pmtxt-v1-plan.md`; 8 units across 5 phases; TypeScript monorepo, Ink CLI, Next.js dashboard, Anthropic API (2026-03-30)
- Ran last30days product validation — `projects/pmtxt/last30days-validation.md`; moderate-to-strong signal; found competitor Aligno; r/ClaudeAI context-transfer thread validates core problem (2026-03-30)
- Fixed last30days Reddit enrichment timeout — `~/.claude/skills/last30days/scripts/last30days.py`; enrichment calls were missing timeout/retries params; now passes profile-based timeout + 2 retries (2026-03-30)
- Added ScrapeCreators API key to `~/.config/last30days/.env` (2026-03-30)
- Added project file structure override to global CLAUDE.md — brainstorm/plan docs go to `~/second-brain/projects/<project>/` instead of default `docs/` directories (2026-03-30)

### March 30, 2026
- Fixed stale cron task bug in NanoClaw — product briefing ran on Monday instead of Saturday because `next_run` was stuck in the past after a missed window; added staleness check in scheduler loop (`task-scheduler.ts`) to skip cron tasks >10min overdue and advance to next occurrence (2026-03-30)
- Fixed product briefing sourcing — agent was using Product Hunt despite instructions specifying X-only; old archived briefings (which used PH) were contaminating the agent's context; added explicit "use only listed sources" guardrail to `weekly-products.md` instructions

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
