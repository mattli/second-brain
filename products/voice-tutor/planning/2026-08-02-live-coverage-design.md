---
created_at: 2026-08-02
status: design-draft
type: design-spec
---

# Live Coverage — Async Judge, Evidence Store, UI Surfaces

> Design conversation 2026-08-02 (Claude.ai session). Decisions below are Matt's; open questions marked. Supersedes nothing — this is the first coverage design doc. Related: the [[2026-07-27-control-surface-brainstorm]] ("numbers on the screen, narrative in the voice") and the 7/23 steering brainstorm in [ideas.md](../ideas.md) (mark_claim, two-tier coverage, secondary judge).

## What this is

Behind-the-scenes infrastructure that marks which claims from a document's claim map have been covered during voice sessions, converts that into a percentage and topics-covered rollup, and surfaces it — including **live in the UI while the conversation is happening**. The voice pipeline never waits on any of it.

## Decisions (2026-08-02)

1. **v1 definition of "covered": the tutor explained it** — with real comprehensiveness, not a passing mention. "The user can say it back" is the v2 direction (generation-effect thesis), iterated into later. v1 is the version that's verifiable against a transcript.
2. **Judging is asynchronous, off the voice path.** No coverage mechanism adds latency to the conversation. The tutor doesn't consult the judge to steer (it has the claim map in context and steers from that, as today).
3. **Live display is in scope.** During a session, the UI shows progress: percentage + topics covered, updating as the conversation advances. Lag of ~a minute is acceptable — it's a glanceable bar, not a scoreboard.
4. **Store evidence, derive judgments.** Verdicts and turn citations are facts; percentage/depth/confidence are interpretations derived at read time and re-derivable when definitions change.
5. **Repetition-as-confidence is deferred** (Matt's idea, held for v2). In v1, repetition is ambiguous — a claim revisited three times could be thoroughly worked or could mean the user wasn't getting it. It becomes informative in v2 when the user is producing. v1 captures the raw material anyway (all citing turns per claim), so depth is derivable without a schema change.

## Architecture

### The judge loop (new)

A parallel async loop per study session, alongside the Pipecat pipeline but invisible to it:

- Wakes every N user turns or ~60s (tunable), takes **transcript-so-far + claim map**, asks a cheap model (Haiku): *which of these claims has the tutor explained up to this point?*
- **Stateless / incremental-by-re-judging:** each pass judges the full transcript-so-far from scratch. No judge memory, no drift, no unrecoverable misses. Slightly more tokens per pass; simplicity wins.
- Verdicts land in session state; the frontend polls and redraws.
- The **final pass at teardown is the strict record** — same mechanism, last invocation — and writes the per-session sidecar. Runs in the same teardown slot as summary/analysis/recap.

### Verdict discipline

- **Every "covered" verdict must cite the transcript turn(s)** that constitute the explanation. Cite **all** touching turns, not just one — depth (mention vs. worked topic) becomes derivable for free. No citable turn → not covered. Same principle as claim anchors: no provable span, no claim.
- Known risk: the judge reads the tutor's own words and will drift generous. Mitigation is a strict prompt + hand-calibration — read a few sessions' verdicts against Matt's own judgment before trusting the number.
- **Hand-calibration labels are a persistent eval set, not a throwaway check.** When Matt marks his own covered/not-covered verdicts for a session, save them (e.g. `<session_id>.coverage.labels.json` beside the sidecar). Every judge-prompt change then re-runs against the same labeled transcripts and diffs — a regression suite for judgment, comparable across runs via the sidecar's judge-prompt versioning. Full eval infrastructure (scored harness, eval-on-every-change) is deliberately deferred until prompt churn makes manual re-checking hurt — instrument the gate before scaling the loop.

### Storage

Per-session coverage sidecar (shape TBD in the build pass, roughly):

```
<session_id>.coverage.json
  { claim_id, covered: bool, turns: [indices] } per claim
  + judged_at, prompt_hash-style versioning for the judge prompt
```

- Percentage = covered/total, derived at read time, never stored as the primary record.
- **Cross-session coverage = union of covered claims across all sessions on the doc** (merge over sidecars). This is what makes the number mean "how much of this document have I been through," and it feeds the returning-session opener ("last time you covered X — pick up at Y?").
- **The live bar starts at the accumulated number, not zero** (decided 2026-08-02). On a returning session, the bar opens at the doc's union coverage and climbs from there — it means "your progress through this document," not "today's work." This is the unfinished-business pull; a bar that resets to 0% each session throws away the return mechanism.
- **The judge sees only the current session's transcript** — it is never told which claims prior sessions covered. Union happens after, at read time. Keeps every session independently re-judgeable, and keeps the judge's job simple. (Telling the judge about prior coverage would let it detect *re-coverage* — the raw material for the deferred repetition-confidence idea — so that's the v2 door, consciously not opened in v1.)
- **Union-by-claim-id depends on the claim map staying frozen per doc.** The existing cache guarantees this today, but note the collision with the open doc-freshness backlog item: re-extracting a doc's claims orphans every prior sidecar (old ids point at a dead map). If re-extraction ever ships, it needs a migration story for existing coverage — don't re-extract casually on a doc with session history.
- Re-running the judge with a new threshold/prompt over stored transcripts re-derives everything without new sessions.

### Topics rollup

If claims carry a cluster/topic field at extraction (the session-opening outline idea from 7/23 already wants this), the same verdicts roll up into "topics covered" with zero extra judging. Extraction change, not a judge change.

### Cost

Haiku, claim ids + short claim text (not full anchors), ~8–10 passes in a 20-min session → pennies. Watch, don't fear. Ledger rows with their own `kind` so it's attributable.

## Consumers (build order TBD)

1. **Live in-session bar** — percentage + topics, polling session state. The demo-visible differentiation artifact.
2. **Ended view** — final strict numbers alongside the recap.
3. **Returning-session opener** — accumulated coverage injected with the recap.
4. **Spoken close-out** — the narrative half; reads the same coverage. Separate design (see backlog item "End the session by voice"); note the spoken number mid-session is the *live* (soft) figure unless the wrap moves post-judge.

## Sequencing note (deliberate override)

The 7/23 notes deferred a live mid-session strict judge pending "evidence that steering needs strict coverage mid-session." This design pulls it forward for **display**, not steering — a different justification, consciously overriding that sequencing call. The mechanism is identical to the post-session judge called repeatedly, so the marginal build over the deferred plan is the loop + polling, not a new judging system.

## Open questions

- Judge cadence: every N user turns vs. fixed interval; what N.
- Sidecar exact schema + where it lives (`~/.voice-tutor/artifacts/`? alongside transcripts?).
- Whether the live bar needs claim-level display (covered/uncovered list) in v1 or just the number + topics.
- Judge prompt: what "explained with comprehensiveness" means operationally — calibrate by hand against 2–3 real sessions before trusting.
- UI treatment on `static/study.html` (design pass with the coverage bar item from the validation-gate plan).

## First experiment (before any build)

Run the judge by hand over Matt's existing Graph Engineering sessions — a real multi-session pair on the frozen 71-claim demo map:

1. **Inventory first (step zero).** From `session-log.jsonl`, list every session on doc `ac4b826f` under user `matt` — the true session count behind the tutor's ~40% is unknown from memory (candidates: 7/26, 7/27, 7/30 per the analyses folder). For each row, confirm a transcript exists on disk; **flag any row with no transcript** (pre-fix failure or hard stop) — those sessions contributed to the tutor's estimate but can't contribute to the judge's union, so the union may honestly come in under ~40% if any exist. Report the roster before judging anything.
2. Judge each session with a transcript independently (Haiku; verdicts must cite turns). Merge the sidecars — the union works identically for two sessions or four; more sessions is a stronger test of the merge, not a complication.
3. Compare: the union vs. the tutor's in-context ~40% estimate, and Matt's memory-first audit of the verdicts (agreements pass, disagreements arbitrated by the transcript). Save the corrected set as the first labels file.
4. Free strictness test: the 7/30 session discussed conditional routing mostly from general LLM knowledge, not the document — an honest judge marks almost nothing covered there; a generous one credits the topic. Watch this case specifically.

This validates the judge AND the cross-session merge in one pass, on real data, before any pipeline code exists.
