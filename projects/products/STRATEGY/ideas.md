# Product Ideas

## 1. AI Agent Contribution Review Tool for Open Source

*Inspired by: Redox OS ban, matplotlib incident, Gentoo policy, ongoing HN debates (March 2026)*

**What it is:** A GitHub app that sits in PR review and flags whether code was likely AI-generated — and if so, runs automated quality checks (tests, security scan, benchmark validation) before it ever reaches a human maintainer. Maintainers configure their policy (allow, flag, or block), contributors get instant feedback.

**Why now:** Open source maintainers are in pain. They're getting flooded with AI-generated PRs and reacting with blanket bans — which is a blunt instrument. There's a clear market for a scalpel. Every project that's announced a no-LLM policy is a potential customer.

**Revenue immediately:** GitHub Marketplace with a freemium model. Free for public repos (viral distribution), paid for private repos and teams. $15-29/mo per org. The pain is acute and the buyer (maintainer/org) is already looking for solutions.

**Solo feasibility:** GitHub API + existing AI detection libraries + a simple rules engine. No infrastructure scaling issues early on — runs per PR event.

---

## 2. Agent Reliability & Cost Monitor

*Inspired by: "shipping is still painfully slow" HN thread, Claude Code economics debate, unit economics scrutiny (March 2026)*

**What it is:** A lightweight SDK wrapper + dashboard that tracks your AI agent runs — cost per task, success/failure rate, retry counts, latency — and alerts you when something goes off the rails (runaway costs, degraded success rates, prompt regressions). Like Datadog, but specifically for agentic workflows.

**Why now:** Builders are moving agents into production and immediately hitting the same wall: no visibility into what's actually happening or what it costs. The Claude Code economics debate shows people are actively anxious about spend. There's no good lightweight tool for solo devs and small teams — existing options are enterprise-grade and priced accordingly.

**Revenue immediately:** Usage-based SaaS. Free tier (1 agent, 7-day history), $19/mo for indie devs (5 agents, 30-day history), $79/mo for teams. People will pay immediately because unmonitored agent costs are a real and present danger.

**Solo feasibility:** Thin SDK in Python/TypeScript that wraps API calls, a Postgres backend, and a simple Next.js dashboard. No AI needed to build it — it's pure instrumentation.

---

## 3. CLAUDE.md Transparency Dashboard

*Inspired by: personal pain point managing multiple CLAUDE.md files across machines, NanoClaw containers, and projects (March 2026)*

**What it is:** A tool that maps every CLAUDE.md file across your entire Claude Code setup — global, project-level, and NanoClaw container groups — showing what each file applies to, its scope, and letting you view and edit them from a single interface.

**Why now:** As Claude Code adoption grows and NanoClaw-style multi-agent setups become more common, the CLAUDE.md landscape gets complex fast. No tooling exists to manage it. Every developer hitting this problem is solving it manually.

**Solo feasibility:** Read the filesystem, parse CLAUDE.md locations and scopes, simple UI or CLI. No AI needed to build it — pure developer tooling.

**Connection to pmtxt:** The core technical problem (discover, parse, render, and manage structured markdown files in a web UI) is shared with pmtxt's web dashboard. Building this first as open source would: (1) validate the shared technical foundation (monorepo, markdown parsing, Next.js dashboard), (2) build an audience in the Claude Code community — who are likely the same technical PMs that pmtxt targets, and (3) produce reusable code for pmtxt Units 1, 2, and 8. The open-source tool is a file viewer; pmtxt's value layer (governed knowledge base, LLM synthesis, compounding product intelligence) sits on top and is not something someone would build from a file viewer.

---

## 4. Offline Local AI with GPS Context

*Inspired by: half-baked idea, March 2026*

**What it is:** An offline-first AI on your phone that uses GPS to give you context about your surroundings — no internet required. Two modes: urban (restaurants, retail, things to do nearby) and outdoor (trails, water sources, waterfalls, points of interest). The key differentiator is that it works without connectivity — useful exactly when you don't have signal.

**Why interesting:** Every existing "what's around me" app requires internet. The outdoor use case is underserved — hikers and trail runners have no good AI companion that works off-grid. Urban mode is more competitive but the offline angle is still differentiated.

**Open questions:** What model runs on-device at acceptable quality? How does the local database of POIs stay fresh without connectivity? Is the GPS/POI problem already solved by Apple Maps offline + Siri, or is there a real gap?

**Status:** Half-baked — worth revisiting if on-device model quality improves significantly.

---

## 5. NanoClaw Telegram Build Workflow

*Inspired by: existing NanoClaw infrastructure, March 2026*

**What it is:** Kick off Claude Code builds from Telegram, get progress updates at checkpoints, respond with feedback from your phone, and let the build continue. Async, mobile-first coding workflow where NanoClaw orchestrates containers and Telegram is the interface.

**Why interesting:** Pieces already exist — NanoClaw containers, Telegram channel, credential proxy, IPC. The missing piece is the pause-and-wait loop for human input. This turns dead time (commutes, walks, waiting rooms) into productive coding sessions without needing a laptop.

**Solo feasibility:** Built on top of existing NanoClaw infrastructure. Main new work is a checkpoint/feedback IPC loop between the container agent and Telegram, plus a way to present diffs and plan summaries in a mobile-readable format.

---

## 6. Inbox Review Agent

*Inspired by: link hoarding problem, March 2026*

**What it is:** A NanoClaw scheduled task that reads links from the vault inbox, cross-references them against current project goals and context, and surfaces the few that are most relevant right now. Filters, not summarizes. Could run weekly.

**Why interesting:** The problem isn't collecting links — it's that they pile up and never get reviewed. An agent that knows your active projects can do the triage you keep putting off. The value is in what it discards, not what it keeps.

**Solo feasibility:** Scheduled NanoClaw task + vault file reading + project context from CLAUDE.md files. No new infrastructure needed.

---

## 7. Left vs. Right Wing Debate Chatbots

*Inspired by: political discourse gap, March 2026*

**What it is:** Paired chatbots that argue opposing political perspectives — one left-leaning, one right-leaning. Users can watch them debate a topic, jump in to challenge either side, or use them to stress-test their own views. Could be a web app, a social media format, or an interactive tool for civic education.

**Why interesting:** Political discourse online is tribal and low-quality. Most people never engage seriously with the strongest version of the opposing argument. Two well-constructed bots that steelman each side could be genuinely useful for understanding policy trade-offs — or just entertaining. The format (adversarial AI debate) is novel and shareable.

**Open questions:** How do you keep the bots from being bland centrists or caricatures? What's the moderation story — topics like abortion, immigration, and gun control are exactly where this is most valuable but also most dangerous for brand risk. Is this a standalone product, a content format (YouTube/TikTok clips of bot debates), or an educational tool? Revenue model is unclear — could be ad-supported content, a paid "debate simulator" tool, or licensed to schools/media orgs.

**Risks:** AI safety policies at major providers actively resist taking political stances — you'd need to carefully prompt-engineer or fine-tune to get substantive arguments rather than hedged non-answers. Public backlash risk if either bot says something inflammatory. The "both sides" framing itself is politically charged.

---

## 9. Book Reading Companion

*Inspired by: reading Infinite Jest, wanting contextual help without being pulled out of the experience (April 2026)*

**What it is:** An AI companion that has already "read" the book — not a summary app, but a deep reference. Ask it what's happening on page 277, who a character is, what happened three chapters ago that connects to what you just read, what a concept or reference means. It answers from full knowledge of the text, not a summary.

**Why interesting:** Book summaries exist everywhere. This is different — it's a reading companion for people who are *in the middle of the book* and want context without spoilers, without Googling, without leaving the experience. The value is depth and specificity: it knows the exact passage, the exact character's history, the exact thematic thread.

**How it works:** Ingest the full book text (ePub or plain text), run the Karpathy wiki pattern — compile character pages, chapter summaries, thematic threads, key passages into a persistent wiki. Query against that wiki as you read. The wiki is built once, stays current, and compounds as you ask questions (good answers get filed back in).

**Personal validation:** Matt would pay for this for Infinite Jest specifically. That's a strong signal — it's not a hypothetical user, it's a real present need.

**Open questions:** DRM is the hard constraint — Audible and Spotify audiobooks are locked. Works cleanly for ePubs (DRM-free or public domain). How do you handle spoilers — does the companion know where you are in the book and limit answers accordingly? Is this a standalone app, a Readwise feature, or a NanoClaw skill?

**Status:** Strong personal desire. Others are likely working on this. Worth building for personal use first as a dog-food test of the Karpathy wiki pattern.

---

## 8. Plain-Text PM Tool (pmtxt)

*Inspired by: YC Spring 2026 RFS "Cursor for Product Managers", March 2026*

**What it is:** A product management system built entirely in plain text / markdown files. Core files: `customers.md`, `competitors.md`, `team.md`, `roadmap.md`, `goals.md`, etc. Lives in a git repo, works with any editor, and is readable by AI agents. The anti-Jira — no dashboards, no SaaS lock-in, just structured text that you and your AI can reason over.

**Why interesting:** YC is actively looking to fund "Cursor for Product Managers" — a system that helps teams figure out *what to build*, not just how to build it. A plain-text PM system is a natural substrate for that: it's AI-readable by design, version-controlled, and portable. As coding agents take over implementation, the artifact that matters most is the product definition layer — and that's exactly what this is.

**Connection to existing work:** Matt is considering buying pmtxt.ai to build this out. The NanoClaw vault itself is a version of this idea applied to a personal system.

**Open questions:** Is this a file format/spec + CLI tool, a VS Code/Cursor extension, or a full web app? Who's the initial user — solo founders, small teams, or PMs at larger companies? How does the AI layer work — does it read the files and answer questions, generate new sections, or actively propose changes?

**Status:** Early concept — revisit in context of YC RFS "Cursor for PMs."

**Connection to open source file management idea:** These two ideas are the same concept from different angles. pmtxt defines the *format and spec* — what files exist (customers.md, competitors.md, team.md, etc.) and how they're structured. The file management tool provides the *tooling* — how you navigate, manage, and sync those files. Together they form a full stack: spec + tooling. The NanoClaw vault is a working proof of concept of this approach for a single person. The product leap is making it work for a team building a product together.

**Approval system note:** The core mechanic is less about pmtxt itself and more about the MD file management layer — specifically, an approval workflow for updates to each file. When a file like customers.md or competitors.md is proposed to change, it goes through a review/approval step before being committed. This turns plain markdown files into a governed, collaborative source of truth — not just a shared folder.

---

## 10. Voice-First Wiki Tutor

*Status: Building for personal use (April 12, 2026). Productize decision deferred until after 2+ weeks of real use.*

*Origin: Evolution of the April 10 personalized learning idea (Artemis 2 moment). Saturday night Retro.ai detour surfaced the voice-first framing on Sunday morning. Voice is the right input modality for learning because it captures the moment curiosity actually strikes — on a walk, in the car, after reading something — when typing would be too much friction.*

**What it is:** A voice-first learning tool that writes into a compiled wiki. You talk to it about a topic you want to understand — something you saved but haven't absorbed, a concept that came up in conversation, a question that's been nagging you. The system has a conversation with you, pulls in web sources as needed, and compiles what you're learning into a Karpathy-pattern wiki in your vault. Each session builds on the last because the agent reads the existing wiki before the next conversation.

**The two-part bet:**
1. Voice makes the conversation actually happen (removes the friction of typing)
2. The compiled wiki makes the learning compound (each session builds on structured prior knowledge, not just chat logs)

Together, these produce a loop that Hermes (voice in), ChatGPT (conversation), and RAG-over-vault tools (retrieval) don't individually — the conversation feeds the wiki, and the wiki makes the next conversation smarter.

**First use case (personal):** Going deeper on AI/tech articles, tweets, and videos already being saved to the vault. The pile-up problem — capture is solved, absorption isn't.

**Build approach:**
- Reuse existing Readwise wiki compilation pipeline (NanoClaw group, now with read/write, picks up new sources from a shared document)
- Add voice input layer — either via Hermes plugin or a custom integration
- Use NanoClaw for scheduled compilation, not real-time

**Why defer productizing:**
- Need 2+ weeks of personal use to know if the loop actually works
- The "am I returning to the wiki" test is the real signal; anything shorter than a couple weeks doesn't give that answer
- If the personal version fails, the product fails — there's no scenario where "I don't use it but others will"

**Open questions:**
- Is Hermes sufficient for the voice layer, or does it need custom work?
- Does the compilation step run on-demand after each session, or on a schedule?
- How does the system know when to create a new wiki page vs update an existing one?
- If this works for me, who else is it for — PKM people, learners generally, people who save things they don't read?

**Adjacent ideas this supersedes or relates to:**
- April 10 Personalized Learning / Wiki-Compiling Autopilot — same underlying bet, now with voice input as the activation layer for the wiki-as-graveyard problem
- Wiki Activation Layer — same underlying problem (knowing what to do with your wiki), now with a specific answer (talk to it, it updates itself)
