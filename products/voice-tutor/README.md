# Voice Tutor

Self-hosted voice conversation service on Mac Mini using Pipecat, Claude, and persistent memory. Accessed from phone browser via Tailscale.

Code: [github.com/mattli/voice-tutor](https://github.com/mattli/voice-tutor) (private; pushed 2026-05-06).

## Status

**TTS pacing controls + session-analysis source attribution** (2026-06-01). Two small tuning commits after a stretch of daily use:

1. **Deliberate cadence** (commit `52258e7`). New `VOICE_TUTOR_TTS_SPEED` env var (unset by default) overrides Cartesia Sonic-3 generation speed at runtime, paired with a `BREVITY_REMINDER` cue — "Speak deliberately — use commas and brief pauses; don't rush." — so the LLM produces text with natural pauses. Prompt-level pacing is the primary lever; the TTS flag is a backstop if that alone isn't enough.
2. **Session-analysis knowledge-source buckets** (commit `cd5c17a`). The post-session analyzer was lumping `memory.md`, the most-recent transcript, and the wiki INDEX into a single "Pre-loaded wiki" source, misattributing facts that actually came from prior-session memory. Split into six distinct buckets — four pre-loaded (on-demand wiki pages, wiki INDEX, prior-session memory, most-recent transcript) plus general LLM knowledge and Matt's own ideas — and told Haiku to be specific about which fact came from which source.

**`/study/` UI redesign + telemetry-inline ended view** (2026-05-13). Both Beni-demo prep items from the Next steps now done. Two threads:

1. **UI redesign via Claude Design handoff** (commit `6bfb4f3`). Ported the Claude Design output — paper aesthetic (`#faf7f0` background, Source Serif 4 headings, Inter body, ink-blue `#2d4a6b` accent), wordmark header, pulsing listening dot, book-style recap typography. UX tweaks during port: upload is one-step (file picker → auto-uploads); post-recap CTA reads "Start another session" (stays on the doc); session-idle screen shows a Haiku-generated 1–2 sentence doc summary so the user knows what they're about to discuss. Summaries persisted as `<doc_id>.summary.txt` sidecars; existing docs lazily backfilled in parallel on first list call.

2. **Diagnostics panel on the ended view** (commit `d2b7a8f`). One screen surfaces every artifact a session produces: cost breakdown (tabular monospace), memory append (italic serif), session analysis (link), system prompt (link). Persistent state (memory.md, profile.md, cost-log.md) in a footer row. Visual register deliberately distinct from the recap above — tinted background, monospace eyebrows — so the recap reads like a printed page while diagnostics read like a DevTools panel docked beneath. View-full links open in the same tab; viewer pages have a quiet "← Back" link that returns to `/study/?session=<id>` (the recap-ready view for *that* session, not the picker). `sessionStorage` preserves scroll position across the round-trip. New env var `VOICE_TUTOR_MIN_TELEMETRY_SEC` overrides both summary and analysis duration gates together (default 120s; set to 60 in `.env` for demos). New endpoints: `GET /api/sessions/{id}/telemetry` (composite — recap + cost + memory_append + analysis + has_prompt + doc info), `GET /api/sessions/latest` (for the "View last session →" picker shortcut, useful for both demo and dev iteration), `/view/memory`, `/view/profile`, `/view/cost-log`, plus per-session `/view/sessions/{id}/prompt` and `/view/sessions/{id}/analysis`.

Decisions worth remembering: dropped recap chrome (title + duration) above the markdown body since the artifact already contains both — duplication caused inconsistent duration values. Same-tab viewer navigation rather than new-tab/overlay because overlays make persistent state feel like a product feature; a URL change is the diagnostic register. Diagnostics fill in *alongside* the recap loading state, not behind it — the recap is server-side the *last* artifact to land (summary → memory → analysis → cost → recap), so the original "full-screen Generating recap…" hid everything else behind a 10–30s curtain.

**Mode parity + UI polish prep for Beni demo** (2026-05-12, continued from the dev-env migration earlier today). Five threads:

1. **Pre-connect screen for `/study/`** — picking a doc navigates to a Start/Back screen; the WebRTC connection only opens when Start is pressed. Doc selection is no longer the moment of commitment. Commit `2d7c665`.
2. **Mode parity for study mode** — study mode now loads `memory.md` alongside `profile.md` and runs the same post-session pipeline as open chat (summary → memory append → analysis). The original "doc IS the world" bet (strip memory + recent transcript + wiki INDEX from study) was reverted — it didn't serve the real use case (revisiting a paper across sessions) and didn't map cleanly to per-person memory in product analogies. Mitigations for `memory.md` priming the open-chat persona: reframed the memory header to "Background — Matt's prior topics (reference only if directly relevant to the document)" and added `STUDY_REMINDER` at the very end of the prompt for recency-priming. `MIN_ANALYSIS_DURATION_SEC` lowered to 120s (matches summary threshold). Also fixed a latent mic-leak in `/study/`: `pc.close()` doesn't stop the underlying `MediaStreamTrack`s from `getUserMedia`, leaving the browser mic indicator hot until tab close — now releases on End and on connection state `failed`/`closed`. Commits `bd9061e`, `f70c221`.
3. **`/client/` → `/chat/` rename** — `/client/` was a pipecat technical artifact (mount path for the prebuilt UI), not a product name. `/chat/` + `/study/` reads as a coherent product. Commit `4969b36`.
4. **README updates** — new "Modes" section with a side-by-side comparison table (persona, prompt context, tools, post-session work), and a "Next steps" section capturing tomorrow's plan: polish `/study/` UI (keep `/chat/` on the prebuilt UI for its diagnostic panel — the architecture-visibility surface), and surface telemetry + artifacts inline on the `/study/` ended view (one screen for cost row + session analysis + memory.md append + recap, replacing tab-switching). Commits in `bd9061e` and `cb4267c`.
5. **Demo prep docs rewired** — `personal/job-search/` updated for the new two-mode demo strategy: chat first ~60s as architecture proof point (pipecat's diagnostic panel + tool call firing), then study as the polished product surface. Touches `demo-script.md` (new Beat 2, total ~7:00), `beni-demo-prep.md`, `demo-format-contingencies.md`, `beni-interview-prep.md` §D, and `architecture-decisions.md` §1.3 (which still claimed study mode strips memory). Archived `demo-fallback-video-script.md` — decided pre-recorded video fallback isn't a real option.

Side calls during the same session: kept Voice Tutor's naming product-honest rather than Beni-flavored ("I'm building Voice Tutor, not Beni's product — analogies are stronger than mimicry"). Decided against building a parallel Vapi POC for the interview — 1-2hr docs + hello-world exploration captures 80% of the comparison value at days less cost.

**V1 shipped** (2026-04-13). All 4 implementation units complete plus wiki integration.

**First Reddit validation run completed** (2026-04-14). 156 posts → 9 findings (3 score-3, 6 score-2), 2 power-user candidates. The "drowning in saves" pain shows up in real users' words; pain concentration is lower than the doc's confidence implied. See `validation/product-validation-findings-2026-04-14.md`. Phase 2 conversations are warranted; pricing conversations aren't yet.

**Second Reddit validation run — Study Companion hypothesis** (2026-04-26). 11 queries × 12 subreddits → 1,330 deduped posts → 980 shortlisted → classified in 4 parallel chunks → **80 findings at score ≥ 2 (28 score-3, 52 score-2), 23 power-user candidates**. Hypothesis confirmed with high confidence: doc framings (*re-reading without absorbing*, *PDF paralysis*, *no one to ask*, voice-as-study workaround) appear verbatim in titles. ChatGPT voice mode bound to a doc is already the manual workaround across med/law/undergrad. Richest power-user pools: **r/LawSchool** (casebook→ChatGPT, hallucination-on-named-doc) and **r/medicalschool** (voice-as-tutor on textbook chapters). Avoid r/selfimprovement and r/college (too generic). Positioning: not "an AI tutor" — *"ChatGPT voice mode, bound to one doc, with a recap"*. See `validation/product-validation-findings-2026-04-26.md`. Phase 2 outreach started same day: DMs to u/MyDogNewt, u/just_premed_memes, u/gazeintotheiris.

**Per-session cost telemetry shipped** (2026-04-14). Voice tutor now writes a `<session>.usage.json` sidecar next to every transcript and appends a row to `cost-log.md` in this folder (LLM / STT / TTS breakdown with estimated USD cost). Subscribed to Cartesia Pro ($5/mo monthly) after hitting a 402 on the free tier mid-session.

**On-demand wiki pages + session analysis** (2026-04-15). `landscape/` wiki pages are now fetched via tool call instead of loaded into the system prompt. Latency validated at ~160ms avg — imperceptible. Cost savings minimal (landscape is a small fraction of total wiki). Auto-generated session analysis (via Sonnet) now runs after every session >= 5 min, writing to `session-analysis-{date}.md` in this folder. Covers topics, wiki usage patterns, tool call latency, and interaction quality.

**Memory refactor — accumulating memory.md + per-session summaries** (2026-04-16). After measuring that 86% of the system prompt was coming from 3 verbatim transcripts loaded at session start, replaced the sliding-window approach with: (1) a per-session `.summary.md` sidecar generated by a short Sonnet call (≥120s sessions), and (2) `~/.voice-tutor/memory.md`, an append-only accumulating record of dated summaries. Session start now loads memory.md + the most-recent full transcript only. System prompt: 11.4K → 6.1K tokens. History reach: unbounded (previously capped at last 3 sessions). Commit `5cfc083`. Future note: compact memory.md when it crosses ~2K tokens.

**Wikiwise finding** (2026-04-16). Readwise founder Tristan Homsi published [TristanH/wikiwise](https://github.com/TristanH/wikiwise) on 2026-04-10 — a native macOS app that scaffolds a Karpathy-pattern wiki and ships Claude Code skills for Readwise ingestion. Same pattern as WikiTutor's wiki. Strategic read: Readwise-acquisition path is weaker (founder is already shipping his own wiki product, open-sourced GPLv3), but voice is an orthogonal wedge — WikiTutor can position as the conversational companion to a Wikiwise-compiled wiki. Their `fetch-readwise-document` and `fetch-readwise-highlights` skills are directly reusable for WikiTutor ingestion. The `@readwise/cli` is the canonical programmatic access path to Readwise going forward.

**Study companion mode — built and shipped** (2026-04-26). New document-grounded variant on branch `feat/study-companion-mode` (unmerged). Six commits, all today: (1) moved HTTP server out of `pipecat.runner.run.main()` into `app.py` so we can add custom routes; (2) `documents.py` + `POST/GET /api/documents` (PDF/MD/TXT under 5MB, `pypdf` extraction, 150K-char cap); (3) `STUDY_BASE_INSTRUCTION` + `ARTIFACT_PROMPT` constants and system-prompt branching (drops wiki INDEX, `memory.md`, most-recent transcript — doc is the world; `profile.md` still loads); (4) bot reads `document_id`/`session_id` from the WebRTC offer body via `runner_args.body`, uses session_id as the transcript stem; (5) `/study/` page — vanilla HTML/JS, single file picker → session → ended UI; (6) async fire-and-forget Haiku call writes `~/.voice-tutor/artifacts/<session_id>.md` after disconnect, exposed via `GET /api/sessions/<id>/artifact`; cost logged with `kind="artifact"` separately. The regular `/client/` flow is untouched. See `planning/2026-04-26-study-companion-mode-design.md` and `planning/2026-04-26-study-companion-mode-plan.md` for the design + task list. Same-day fix to `ARTIFACT_PROMPT`: added explicit SCOPE block (transcript-bound, doc-as-reference), tightened section descriptions, reordered placeholders so transcript precedes the document (now labeled reference-only) — the original prompt biased the model toward summarizing the doc instead of the conversation. Same-day `/client/` regression fix: moving the HTTP server into `app.py` in `d0e3a9a` only replicated `POST /api/offer`, breaking the prebuilt RTVI UI which also requires `POST /start` and `/sessions/{session_id}/{path:path}`; both routes now mirrored from `pipecat.runner.run.main`. Plus quality-of-life tweaks: `start.sh` tees uvicorn output to `voice-tutor.log` (was silent on crashes), and `/study/` opens a no-op RTVI data channel client-side so pipecat's server queue doesn't fill. **Decision: defer pipecat 0.0.108 → 1.0.0 (released 2026-04-14) until this branch is merged** — major version bump touches exactly the frame/transport/runner surfaces the branch depends on.

**Dev environment on MacBook Pro + short-session UX fix** (2026-05-12). Cloned the repo and brought up a working dev environment on the MacBook Pro: `git clone` → checkout `feat/study-companion-mode` → rsync `~/.voice-tutor/` (~700KB: profile.md, memory.md, transcripts, artifacts, documents) and `.env` from Mac Mini over Tailscale → `uv sync` (Python 3.12.13, 103 packages) → `./start.sh` boots in ~5s, `/study/` loads. Data flow worth remembering: `~/.voice-tutor/` is rsync'd manually between machines; vault-side `cost-log.md` + `session-analyses/` come over automatically via the hourly vault sync. Plus a UX fix on the study mode "ended" view (commit `6621291`): a session ended before any conversation produces no transcript, so `generate_artifact` never fires — the UI was polling `/api/sessions/{id}/artifact` indefinitely and showing "Generating recap…" forever. Fix in `static/study.html`: (1) skip the recap view when `pc` was 'connected' for <5s — show "Session ended — too short for a recap"; (2) cap polling at 30 attempts (60s) before surfacing "Recap didn't generate within 60s — check server logs". Two checks, two failure modes (empty session vs server-side generation failure).

**Cost optimizations — Haiku for post-session + TTS experiments stripped** (2026-04-22 / 2026-04-25). Two changes kept, one rolled out of the code: (1) **kept:** swapped the end-of-session summary and analysis calls from Sonnet 4.5 → **Haiku 4.5** (`claude-haiku-4-5-20251001`) — ~5× cheaper, quality fine for post-hoc summarization, live conversational LLM untouched (still Sonnet 4.5); (2) **kept:** organized the growing pile of `session-analysis-*.md` files into a `session-analyses/` subfolder and pointed `SESSION_ANALYSIS_DIR` at it; (3) **removed entirely (2026-04-25):** the `TTS_PROVIDER` switch and the Inworld + Kokoro fallback branches in `bot.py` are gone. Inworld Max turned out to be ~$0.05/min on-demand (more than Cartesia Pro at ~$2.70/hr, not less), and Kokoro both wedges the pipeline after tool calls and produces unacceptable voice quality. Cartesia Sonic-3 ("British Reading Lady") is the only TTS path now — simpler code, no dead branches. Marginal hourly cost is ~$6.70/hr (Sonnet live + Cartesia + Nova-3). See `validation/economics.md` for the verified pricing tables.

## Architecture

Voice-to-voice pipeline (Deepgram STT → Claude → Cartesia TTS) on Pipecat, served from the Mac Mini behind Tailscale. See the [repo README](https://github.com/mattli/voice-tutor#architecture) for the canonical current stack — this file holds pricing/economics context (below) and the dated history, not code-level details.

Pricing context worth keeping here:
- Sonnet 4.5 (live): $3/$15 per MTok input/output, prompt caching enabled
- Haiku 4.5 (post-session summary + analysis): $1/$5 per MTok input/output
- Cartesia Sonic-3: 1 credit/character, ~$0.05/min at Pro overage rate
- Deepgram Nova-3: $0.0077/min
- Marginal hourly cost at today's stack: ~$6.70/hr of audio (see `validation/economics.md`)

## What it does

- Voice conversations with Claude that remember who you are (profile doc) and what you've talked about (accumulating `memory.md` + most-recent full transcript)
- Wiki INDEX loaded into system prompt; individual wiki pages fetched on-demand via `read_wiki_page` tool
- Transcripts saved automatically on session disconnect; per-session summary + session analysis generated automatically

## Repo & data

- **Code**: `~/Development/voice-tutor/`
- **Data**: `~/.voice-tutor/` (profile.md, transcripts/)
- **Wiki source**: `~/second-brain/resources/wiki/`

## Access

- Local: `http://localhost:7860/chat/` (open chat) or `http://localhost:7860/study/` (doc-grounded)
- Phone: `https://matts-mac-mini.taild1f9b7.ts.net/chat/` (or `/study/`)
- Start: `./start.sh` from repo root

## API keys

In `.env`: `ANTHROPIC_API_KEY`, `DEEPGRAM_API_KEY`, `CARTESIA_API_KEY`. See `validation/economics.md` for current hourly rates; at today's stack (Cartesia + Sonnet-live + Haiku-post-session) marginal cost is ~$6.70/hr of audio.

Cartesia is on **Pro** ($4/mo yearly or $5/mo monthly, 100K credits ≈ 1.67 hr of audio/mo). Overage bills at the same per-character rate. If daily usage grows past ~40 min/day, the **Startup** plan ($39/mo yearly / $49/mo monthly, 1.25M credits ≈ 21 hr/mo) works out to ~$2.33/hr of audio if fully utilized.

## Known issues

- Prebuilt Pipecat UI shows duplicated text (bot-llm-text + deprecated bot-transcription). Voice output is correct. Cosmetic only.
- `bot.py` runs as a bare foreground process — no supervisor, no log file, no health check. A 24-hour session on 2026-04-14 did not visibly wedge (the real bug was Cartesia 402), but for production use it needs launchd + log to disk + restart policy. Pipecat itself is not the issue.
- Tool-call latency regression observed on 2026-04-16 — single `read_wiki_page` call took 3.37s vs ~160ms average the day before. Single sample, cause unknown, re-measure next session.

## Next steps

### Interview prep (this week — Beni demo)
- **Vapi investigation** — ~1hr Claude/ChatGPT Q&A on Vapi's limitations vs. the current pipecat stack (frame APIs, transport control, post-session pipeline, cost model), plus a one-page comparison writeup. Skip the hello-world POC — the docs alone capture the comparison value. Goal: be able to answer "why pipecat over Vapi" in the interview without hand-waving.
- **Demo dry runs** — practice the two-mode demo (chat for architecture, study for product surface) end-to-end on the timer. Target ~7:00 per `personal/job-search/demo-script.md`. Specifically rehearse the "watch artifacts materialize" beat now that the diagnostics panel is live.
- **Question prep** — review `personal/job-search/beni-interview-prep.md`, draft answers to the likely product-engineer questions, and pre-write the 2–3 sharp questions to ask them.
- **Done 2026-05-13:** `/study/` UI polish (commit `6bfb4f3`) and the telemetry-inline ended view (commit `d2b7a8f`).

### Short term (use it for a week, then decide)
- **Pick a Cartesia voice** — browse play.cartesia.ai, find something that isn't British Reading Lady
- **Use it daily** — talk through ideas, ask about wiki topics, think out loud. See if it feels different from ChatGPT voice now that it has wiki context.
- **Monitor API costs** — `cost-log.md` in this folder now has per-session totals; cross-check against each vendor's dashboard after a week of use

### If it proves valuable
- **Readwise integration via `@readwise/cli`** — reuse the wikiwise `fetch-readwise-document` and `fetch-readwise-highlights` skill logic. The CLI (`npm install -g @readwise/cli`) handles OAuth, pagination, and rate limiting; the skills stream doc bodies to disk via `jq -r '.content' > file` without loading into context, and vector-search highlights into per-doc markdown collections. Canonical access path — don't hit Readwise APIs directly.
- **Daily briefing readout** — have the tutor read your daily briefing and let you ask follow-up questions by voice
- **launchd auto-start** — start the bot automatically on Mac Mini boot so you never have to SSH in to run start.sh
- **Memory compaction** — when `~/.voice-tutor/memory.md` grows past ~2K tokens, summarize older entries into a single "before <date>" block so the memory layer stays cheap

### If it proves very valuable
- **Function calling / actions** — give the voice agent tools to save notes, create tasks, update wiki pages. This is the path to replacing the Telegram NanoClaw interface with voice.
- **Profile auto-updates** — have Claude update profile.md based on what it learns in conversations (with approval)
- **Capacitor iOS app** — native app that keeps audio running in the background, solving the "phone browser must stay in foreground" limitation

## Open questions

- Is the on-demand wiki-page approach sufficient, or does it need topic-aware pre-fetching as wiki grows?
- Does WikiTutor's positioning change given Wikiwise exists? (Current read: voice is an orthogonal wedge — WikiTutor could target users who already run Wikiwise rather than compete with it.)
- Could this replace the Telegram NanoClaw interface with voice-driven actions?
