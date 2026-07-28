# Session Analysis — 2026-04-15 18:09

First session with on-demand wiki pages (`landscape/` fetched via `read_wiki_page` tool instead of loaded into system prompt).

## Session overview

| Metric | Value |
|---|---|
| Duration | 33.7 min |
| Turns | 270 |
| Total cost | $10.06 |
| Cost/min | $0.30 |
| LLM cost | $7.26 |
| STT cost | $0.26 |
| TTS cost | $2.55 |

## On-demand tool calls

3 tool calls during the session. All latencies under 200ms — no perceptible delay.

| Timestamp | Page | Latency to first audio |
|---|---|---|
| 18:11:34 | landscape/yc-ai-thesis.md | 155ms |
| 18:34:22 | landscape/ai-startup-distribution.md | 160ms |
| 18:34:46 | landscape/vertical-ai.md | 194ms |

### Observations

- The tutor said "let me pull that up" before each lookup (as instructed), so Matt wasn't left in silence.
- Two lookups were back-to-back (18:34:22 and 18:34:46) — the tutor fetched `ai-startup-distribution.md` then `vertical-ai.md` in quick succession as the conversation touched both topics.
- One attempted lookup failed: Matt asked about an a16z "outcomes over autopilot vs copilot" article. The tutor tried `yc-ai-thesis.md` and `vertical-ai.md` but couldn't find it — it likely wasn't in the wiki. The tutor asked follow-up questions to identify the page, which was good recovery.

## Cost impact of on-demand pages

Minimal. Cache write tokens were ~292K (vs ~291K in the prior session without on-demand). The `landscape/` folder is a small fraction of the total wiki, so excluding it doesn't meaningfully reduce prompt size.

| Session | Cache write tokens | LLM $/min |
|---|---|---|
| Apr 14 (baseline, no on-demand) | 273K | $0.20 |
| Apr 15 16:37 (baseline, no on-demand) | 291K | $0.20 |
| Apr 15 18:09 (with on-demand) | 292K | $0.22 |

**Conclusion:** The on-demand approach validated that tool-call latency is negligible (~160ms avg), but cost savings require moving more content out of the system prompt — not just the 7 landscape pages.

## Conversation content analysis

### Topics covered

1. **Decision layer vs execution layer** — AI commoditizes execution; value shifts to decisions
2. **VoiceTutor positioning** — currently execution layer (helps consume info); could move to decision layer (recommend what to learn next)
3. **Knowledge gap tracking** — wiki should track what Matt *doesn't* know, not just what he's saved
4. **Write-back loop** — conversations that fill gaps write back to wiki; knowledge compounds from saves AND conversations
5. **Target market exploration** — graduate students → too deep for wiki TLDRs; PMs → needs too many integrations; **Readwise users** emerged as the clearest starting point
6. **Defensibility** — switching cost (user's wiki is too valuable to leave) vs distribution (Readwise partnership/acqui-hire)
7. **PMTXT connection** — Matt's earlier "Cursor for PMs" idea hit the wall of needing too many data sources; VoiceTutor for Readwise users is the path of least resistance

### Wiki usage vs general knowledge

| Source | Turns (approx) | Notes |
|---|---|---|
| Landscape wiki pages | ~15 | YC thesis, startup distribution, vertical AI — triggered by explicit questions about landscape topics |
| Pre-loaded wiki (concepts, writing, etc.) | ~5 | Specificity in writing example at session start; gstack reference |
| General LLM knowledge | ~80 | Majority of conversation was product strategy, market analysis, and brainstorming — not wiki-dependent |
| Matt's own knowledge/ideas | ~40 | PMTXT idea, Readwise user insight, write-back loop concept |

**Key finding:** The wiki provided conversation *anchors* (starting points and references), but most value came from the back-and-forth dialogue itself. This supports Matt's observation that the real product is the conversation layer, not just "chat with your notes."

### Interaction quality notes

- Matt asked to slow down and keep responses shorter multiple times early on. The tutor adapted well after the third prompt.
- The tutor misheard "EdTech" as "ad tech" — STT limitation, not an LLM issue.
- Fragmented user turns are frequent (270 turns in 33 min = ~8 turns/min). Many are partial sentences that get stitched together. This is normal for voice input with VAD segmentation.
