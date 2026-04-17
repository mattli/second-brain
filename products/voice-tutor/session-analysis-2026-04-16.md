# Session Analysis — 2026-04-16 13:35

Second session with on-demand wiki pages. Session was driven almost entirely by a single fetched page (`services-as-software.md`), which turned into a 20-minute strategy conversation about where WikiTutor fits.

## Session overview

| Metric | Value |
|---|---|
| Duration | 22.0 min |
| Turns | 113 |
| Total cost | $6.90 |
| Cost/min | $0.31 |
| LLM cost | $4.47 |
| STT cost | $0.17 |
| TTS cost | $2.26 |

## On-demand tool calls

1 tool call during the session — the page anchored the rest of the conversation.

| Timestamp | Page | Latency to first audio |
|---|---|---|
| 13:37:30 | landscape/services-as-software.md | 3365ms |

### Observations

- **Latency regression vs yesterday.** Yesterday's three lookups were 155–194ms; today's was 3.4s. That's noticeable silence for the user. Worth investigating whether it's Anthropic API latency that day, cold-cache behavior, or something structural. Single data point, but the gap is too large to ignore.
- The tutor said "let me pull that up" style transitions implicitly — the pre-tool text "Okay, here's the Sequoia piece:" was spoken before the fetch completed, which covered the wait well.
- One tool call did all the work. The page on services-as-software → copilot vs autopilot → three-year data moats → switching costs → indie-product framing all chained off it, with no further lookups needed.

## Cost impact of on-demand pages

| Session | Duration | Cache write tokens | LLM $/min | Total $/min |
|---|---|---|---|---|
| Apr 15 16:37 (baseline, no on-demand) | ~30 min | 291K | $0.20 | ~$0.30 |
| Apr 15 18:09 (with on-demand) | 33.7 min | 292K | $0.22 | $0.30 |
| **Apr 16 13:35 (with on-demand)** | **22.0 min** | **292K** | **$0.20** | **$0.31** |

**Conclusion:** Cost profile is stable across sessions. The on-demand architecture is neither helping nor hurting cost — same conclusion as yesterday. The 22-min session cost $6.90 vs the 34-min session at $10.06, which scales linearly. To actually move the cost needle, more of the prompt needs to come out of the cache-write baseline.

## Conversation content analysis

### Topics covered

1. **Wiki update summary** — Matt asked what's new this past week; tutor correctly surfaced two new pages (Services as Software, Physical AI) and six updated pages
2. **Services-as-software deep dive** — Sequoia's copilot vs autopilot thesis, ColdIQ playbook, three-year data moat
3. **Copilot vs autopilot for WikiTutor** — landed on "guided autopilot": learning requires the human, but the outcome is "current on topics without reading everything"
4. **ChatGPT differentiation** — personalization via saved material is the wedge; tutor probed whether it's sufficient as a moat
5. **Defensibility for WikiTutor** — no data moat from running the work (unlike accounting/legal services); switching cost for new users is low (wiki is portable markdown)
6. **Distribution strategy** — Readwise partnership as the clearest path: integration → acquisition vs. building own distribution
7. **Goal right-sizing** — pivoted to indie product target ($100–200K ARR, 500–1000 users at $10–20/mo) where defensibility matters less

### Key decision reached

Matt explicitly chose **"derisk and get to market fast"** over swinging for venture-scale outcomes, and named an indie product ($100–200K ARR via Readwise users) as the target. This is a concrete narrowing from yesterday's open-ended strategy talk.

### Wiki usage vs general knowledge

| Source | Turns (approx) | Notes |
|---|---|---|
| On-demand wiki page (services-as-software.md) | ~30 | Anchored the entire strategy conversation |
| Pre-loaded wiki INDEX | ~4 | Used at session start to list new/updated pages |
| General LLM knowledge | ~50 | Moats, switching costs, indie SaaS economics, copilot/autopilot framing beyond what's in wiki |
| Matt's own knowledge/ideas | ~30 | WikiTutor positioning, Readwise-user target, indie ARR goal |

**Key finding:** Unlike yesterday (wiki as conversation *anchors*), today a single wiki page drove the whole session. The tutor used the services-as-software framework as a lens and then reasoned beyond it when Matt's case (learning, not execution) broke the framework. This is the wiki working as intended — one page, deeply applied.

### Interaction quality notes

- **Pacing:** Matt asked to slow down once ("Hey. Talk slower." at 36s in) — tutor adapted immediately and kept that pace for the rest of the session.
- **Repeat requests:** "Say that again?" twice (at ~8 min and ~15 min). Both times the tutor re-delivered a cleaner, tighter version rather than just repeating verbatim — good adaptation.
- **STT error:** "PM" transcribed as "PN" once; tutor inferred the intended meaning without asking.
- **Hallucination caught:** Tutor proposed writing to `raw/research-log.md` as if it had write access. Matt called it out ("I thought you don't have write [access]"). Tutor corrected immediately — "You're right — I can't write to files directly." Clean recovery, but the initial claim was confident enough to mislead a less careful user. Worth tightening the system prompt to prevent this specific failure mode.
- **Response length:** Generally good. Responses stayed within the 1–2 sentences / one-thought-per-turn target, with occasional structured lists (e.g., the ColdIQ playbook) when Matt asked for details.
- **Turn fragmentation:** 113 turns in 22 min = ~5 turns/min, lower than yesterday's ~8/min. Matt's turns were more deliberate — longer thoughts per turn — possibly because the conversation was focused on one topic.
