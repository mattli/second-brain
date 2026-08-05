---
created_at: 2026-08-02
last_updated: 2026-08-05
status: phase-1-shipped
type: design-spec
---

# Live Coverage — Async Judge, Evidence Store, UI Surfaces

> Design conversation 2026-08-02 (Claude.ai session). Decisions below are Matt's; open questions marked. Supersedes nothing — this is the first coverage design doc. Related: the [[2026-07-27-control-surface-brainstorm]] ("numbers on the screen, narrative in the voice") and the 7/23 steering brainstorm in [ideas.md](../ideas.md) (mark_claim, two-tier coverage, secondary judge).

> **Build status (2026-08-04).** Phase 1 — teardown judging + the evidence store + the union read path — is built on branch `feat/coverage-teardown-judge`, per [[2026-08-04-wiring-brief-coverage-judge]]. Phase 2 (the live in-session loop) is the immediate next step in the same work stream, not a future project: it is the demo-visible artifact and is wanted by the 2026-08-11 meetup. Its implementation plan is the last section of this doc.

> **Shipped 2026-08-05.** Phase 1 merged to `main` (`7425536`) and live on production after a verified-idle restart. Independently reviewed cold before the merge, then a second scoped review of the fixes themselves; findings, residuals, and the open read-path work are in [[2026-08-04-coverage-teardown-judge-review]]. **The union read path is written and tested but wired to nothing user-facing** — no route, no bar — so decision 3 (live display) is entirely Phase 2. Two things to carry into that work: `union_for_document` raises rather than degrading on a malformed sidecar, which becomes a blank panel the moment it backs a route; and `backfill_coverage.py` writes no ledger row, so a backfill run's spend is invisible to reconciliation.

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

Per-session coverage sidecar (sketched here 2026-08-02; **built 2026-08-04** — the
exact shape and location are in Open questions below):

```
<session_id>.coverage.json
  { claim_id, covered: bool, turns: [indices] } per claim
  + judged_at, prompt_hash-style versioning for the judge prompt
```

- Percentage = covered/total, derived at read time, never stored as the primary record.
- **Cross-session coverage = union of covered claims across all sessions on the doc** (merge over sidecars). This is what makes the number mean "how much of this document have I been through," and it feeds the returning-session opener ("last time you covered X — pick up at Y?").
- **The live bar starts at the accumulated number, not zero** (decided 2026-08-02). On a returning session, the bar opens at the doc's union coverage and climbs from there — it means "your progress through this document," not "today's work." This is the unfinished-business pull; a bar that resets to 0% each session throws away the return mechanism.
- **The judge sees only the current session's transcript** — it is never told which claims prior sessions covered. Union happens after, at read time. Keeps every session independently re-judgeable, and keeps the judge's job simple. (Telling the judge about prior coverage would let it detect *re-coverage* — the raw material for the deferred repetition-confidence idea — so that's the v2 door, consciously not opened in v1.)
- **Coverage is APPEND-ONLY; the bar is monotonic by construction** (decided 2026-08-04, enforced in code). A written sidecar is a *record* of what a session was judged to have covered, and it is never silently re-judged — `coverage_store.write_sidecar` refuses to overwrite an existing sidecar unless an explicit `overwrite=True` is passed, so the union can only ever grow as sessions are added. The reason is measured, not theoretical: the judge is **not perfectly reproducible even at temperature 0** (see the reproducibility finding in [[2026-08-03-coverage-judge-review-findings]]), so a silent re-judge could make a user's progress bar go *down* with no session having happened. A bar that retreats reads as a broken product, and it would also quietly rewrite the evidence an eval label was assigned against. The guard lives at the single writer every path funnels through rather than at each call site — this also closes a real hole, since `session_id` is client-supplied and a reused id would otherwise clobber a previous session's coverage. Re-judging (a new judge prompt, say) is a deliberate operator action: `backfill_coverage.py --force`.
- **Union-by-claim-id depends on the claim map staying frozen per doc.** The existing cache guarantees this today, but note the collision with the open doc-freshness backlog item: re-extracting a doc's claims orphans every prior sidecar (old ids point at a dead map). If re-extraction ever ships, it needs a migration story for existing coverage — don't re-extract casually on a doc with session history.
  - **Still theoretical — there is not one stale claim map on disk (verified 2026-08-05).** An earlier version of this bullet claimed the backfill had found ~16 sessions orphaned by edited documents. That was wrong and has been withdrawn; see the coverage-history bullet below for what the backfill actually found. Every skip in the real history is a *missing* map, never a stale one, so no coverage has yet been orphaned by re-extraction. The landmine is real in design but unfired in data.

- **Coverage can only start from the point a document got a claim map** (measured 2026-08-05). Claim extraction landed 2026-07-26; the earliest map on disk was extracted that morning. **15 of 31 logged study sessions predate it** — five on `701313d7` (2026-04-26), four on `12f379a0` (2026-05-12), two on `a9f59a8f` (2026-07-16), four on `8050fe28` (2026-07-18→22) — so those documents have no rubric to judge against, not a stale one. The documents themselves are **untouched**: every `.txt` mtime sits at or before its first session and never moves after (`8050fe28` was written 07-18 and its last session ran 07-22 with the file unchanged), so the current text *is* what those sessions saw.
  - **This is a recoverable gap, not data loss.** Extracting a map now produces one that legitimately applies to those transcripts. Recovery is 4 extractions (~30–60s Sonnet each) followed by a backfill over the 15 sessions, ~$0.45 total.
  - The generalizable shape: **a rubric-dependent metric can only ever be computed back to the date the rubric existed.** Any future measure keyed on the claim map inherits the same horizon, and the fix is always to backfill the rubric first, then the measure.
- Re-running the judge with a new threshold/prompt over stored transcripts re-derives everything without new sessions.

### Topics rollup

If claims carry a cluster/topic field at extraction (the session-opening outline idea from 7/23 already wants this), the same verdicts roll up into "topics covered" with zero extra judging. Extraction change, not a judge change.

**Display decision (2026-08-03): claims are never user-facing.** Claim text is verification-grade — dense, precise, written for anchors and judges — and 63 of them on screen is unreadable. The user-facing layer is **topics**: a handful of human-sized labels (the doc's own section headers are roughly the topic list already). Three layers, each ignorant of the next:

- **Claims** — measurement substrate, judge-facing only.
- **Topics** — the display and navigation surface. The v1 UI shape is an **interactive table of contents**: topics listed, coverage shown per topic ("Verification: 4/6"), and — later — tappable to steer the conversation there (the 7/27 "map is the menu" control-surface idea, landing as topics-as-menu, not claims-as-menu).
- **Coverage** — computed on claims, displayed on topics.

The mapping is one extraction-time field (claim → topic). Tap-to-steer stays v2; the TOC display itself is v1 UI scope.

### Cost

Haiku, claim ids + short claim text (not full anchors), ~8–10 passes in a 20-min session → pennies. Watch, don't fear. Ledger rows with their own `kind` so it's attributable.

**Measured 2026-08-04** (phase 1, real 100–160-turn sessions on the 63-claim map): one judge pass is ~9.4K input / ~7.4K output tokens ≈ **$0.04**, so teardown judging adds ~$0.04 per session — but the phase-2 live loop at 8–10 passes lands nearer **$0.30 per session**, an order of magnitude above "pennies". Ledger rows are written with `kind: "coverage"`, on failure as well as success. See the phase-2 plan for the cadence lever.

## Consumers (build order TBD)

1. **Live in-session bar** — percentage + topics, polling session state. The demo-visible differentiation artifact.
2. **Ended view** — final strict numbers alongside the recap.
3. **Returning-session opener** — accumulated coverage injected with the recap.
4. **Spoken close-out** — the narrative half; reads the same coverage. Separate design (see backlog item "End the session by voice"); note the spoken number mid-session is the *live* (soft) figure unless the wrap moves post-judge.

## Sequencing note (deliberate override)

The 7/23 notes deferred a live mid-session strict judge pending "evidence that steering needs strict coverage mid-session." This design pulls it forward for **display**, not steering — a different justification, consciously overriding that sequencing call. The mechanism is identical to the post-session judge called repeatedly, so the marginal build over the deferred plan is the loop + polling, not a new judging system.

## Steering roadmap (added 2026-08-04)

How much should measured coverage influence steering? Decided in layers:

- **v1 (now): coverage steers nothing.** The tutor steers from the claim map in context plus its own conversational memory, unchanged. Coverage is reporting only. Within a session, the tutor's live memory of what it discussed is richer, faster, and free — a lagging strict judge adds nothing mid-session.
- **v1.5 (the cheap win): inject the union at returning-session open.** Today a returning session's coverage memory is the *previous session's recap* — newest-only, prose, the tutor's own self-summary (the same self-reporting that claimed ~40% when measured coverage was 25.4%), and fragile (missing/unparseable recap ⇒ opens first-session style, per the 2026-07-27 session-aware-opening design). The union is strictly better on all three axes: all sessions not just the newest, verified claim ids not prose, graceful degradation. The 7/27 design explicitly deferred this — "cross-session claim-coverage tracking … deliberately not in this change. The recap is the coverage memory" — because no coverage store existed. Now it does: one `union_for_document` read at session open, inject the uncovered set (or covered + open) alongside or instead of the recap bullets. Cross-session steering from settled end-of-session data, where strictness is a feature. Serves the returning-session experience the validation gate measures.
- **Live-loop steering: only with evidence.** The strictness that makes the number trustworthy makes it a bad boss mid-session — the judge under-credits distributed explanations (c49's citations spanned 12 turns) and refuses on glitches, so a live-coverage-steered tutor would say "let's revisit X" about things the user did cover: reads as not listening, the most trust-destroying tutor behavior. The 7/23 two-tier instinct holds: generous-live for steering, strict-after for record. Trigger for revisiting: real sessions where the tutor visibly re-covers ground or loses track — nothing yet shows it does.
- **v2 candidate — threshold-triggered sweep (Matt, 2026-08-04).** Once coverage passes a threshold (majors covered), the tutor offers — or shifts into — a review/recap mode that hunts the uncovered tail: "you've got the core; want to sweep the loose ends on this topic?" Two intensities of one idea: offer vs. mode-shift. This also dissolves the asymptote problem (below): the long tail stops being the meter's dead weight and becomes endgame content the tutor actively carries. Crucially, sweep time is the one context where strict steering's false positives are cheap — "let's touch on X" about something half-covered reads as *review*, not as the tutor not listening.
- **Steering intensity is a dial, not a switch.** Curiosity-led with a closing sweep at one end (the default — matches "just a conversation" and the generation effect); rubric-march (claims-first from minute one) at the other — legitimate for exam-prep/compliance/"make sure I get all of it" intents, where wandering is the failure mode. Where the dial sits should eventually follow user intent (explicit mode or inferred from session open), not be hardcoded. v2+ segmentation question; test on real users.

### The asymptote constraint (display design, 2026-08-04)

The meter will likely never reach 100% for most users on most documents: the claim map is exhaustive by design (majors + minors + asides), conversations naturally cover the majors and never naturally arrive at the parenthetical details, and the strict judge caps the ceiling further. Shape: fast early progress, long tail that never closes. A progress bar that can't fill reads as failure. Display directions open, to be tested on humans at the bar-design session: (1) topics as the completable unit ("Verification: 6/6 ✓") with the overall number as quiet inventory ("16 of 63 covered"), never framed as a goal; (2) color rating per topic — ordinal, not arithmetic, so it makes no promise about a terminal state (cost: loses the crisp count that makes the differentiator legible in a demo); (3) some hybrid. Related copy constraint already recorded: the number can jump up at teardown. The threshold-sweep above is the steering-side answer to the same problem.


## Open questions

- ~~Judge cadence: every N user turns vs. fixed interval; what N.~~ **Decided 2026-08-04** — both, whichever fires first, with a floor (see the phase-2 plan below).
- ~~Sidecar exact schema + where it lives.~~ **Decided 2026-08-04, built** — `~/.voice-tutor/transcripts/<user_id>/<session_id>.coverage.json`, beside the transcript it was judged from and sharing its filename stem. Envelope: `{schema_version, session_id, user_id, document_id, source_hash, doc_id, claims_total, transcript_turns, judged_at, model, judge_prompt_hash, citation_repairs, covered_count, verdicts[]}`. No percentage is stored — it is derived by the read path, per the "store evidence, derive judgments" decision. Union filters on `document_id` **and** `source_hash`, so a re-extracted claim map cannot silently merge into the old one (the freshness landmine above); ignored sidecars are counted and reported as `stale_sessions` rather than vanishing.
- Whether the live bar needs claim-level display (covered/uncovered list) in v1 or just the number + topics.
- Judge prompt: what "explained with comprehensiveness" means operationally — calibrate by hand against 2–3 real sessions before trusting.
- UI treatment on `static/study.html` (design pass with the coverage bar item from the validation-gate plan).

## First experiment (before any build)

**Status: RUN 2026-08-03. The design survived.** Full artifacts in [validation/coverage-experiment/](../validation/coverage-experiment/). Headline results:

- **Judge strictness confirmed** — on the known-answer trap session (12f3a30d, discussed routing from general knowledge, not the doc), the judge credited exactly 1 of 71 claims. It also cleanly split a substantive recap (11 covered) from a vague one (0).
- **Coverage vs. the tutor's own estimate:** post-audit union 16/63 ≈ 25%, against the tutor's spoken "~40%" recap claim — the tutor over-reports its own teaching. This is the case for the judge existing.
- **One judge failure mode found (the c30 case):** the judge credits *fluent wrongness* — the tutor taught a plausible adjacent triad (the doc's sub-example lenses) as the headline three-way split, and the judge matched shape+keywords over content. **Any judge-prompt v2 must mark c30 NOT covered** — it is the standing regression case. The claim itself was arbitrated faithful (exact anchor; the doc contains both triads in one paragraph, in different roles).
- **Labels:** 17 human-audited verdicts (16 familiarity-based agreements + c30 transcript-and-source-verified rejection) form the first eval set. Confidence level is recorded per row; labels are a tripwire hardened on disagreement, not ground truth.
- Two Graph Engineering docs exist (matt 63-claim map, _shared 71-claim superset); each roster was judged against its own map. 4 of 8 matt sessions had no recorded transcript (created, never conducted).

Original protocol (kept for reference):

Run the judge by hand over Matt's existing Graph Engineering sessions — a real multi-session pair on the frozen 71-claim demo map:

1. **Inventory first (step zero).** From `session-log.jsonl`, list every session on doc `ac4b826f` under user `matt` — the true session count behind the tutor's ~40% is unknown from memory (candidates: 7/26, 7/27, 7/30 per the analyses folder). For each row, confirm a transcript exists on disk; **flag any row with no transcript** (pre-fix failure or hard stop) — those sessions contributed to the tutor's estimate but can't contribute to the judge's union, so the union may honestly come in under ~40% if any exist. Report the roster before judging anything.
2. Judge each session with a transcript independently (Haiku; verdicts must cite turns). Merge the sidecars — the union works identically for two sessions or four; more sessions is a stronger test of the merge, not a complication.
3. Compare: the union vs. the tutor's in-context ~40% estimate, and Matt's memory-first audit of the verdicts (agreements pass, disagreements arbitrated by the transcript). Save the corrected set as the first labels file.
4. Free strictness test: the 7/30 session discussed conditional routing mostly from general LLM knowledge, not the document — an honest judge marks almost nothing covered there; a generous one credits the topic. Watch this case specifically.

This validates the judge AND the cross-session merge in one pass, on real data, before any pipeline code exists.

---

## Phase 2 — the live in-session loop (implementation plan, 2026-08-04)

Written at the end of the phase-1 wiring session so the next session builds from a
spec rather than a summary. Phase 1 (built) is the same judge called ONCE at
teardown; phase 2 is that call put on a timer while the session runs, plus a way
for the browser to read the result. **The marginal build is the loop + polling —
not a new judging system.**

Everything below assumes the phase-1 pieces already on `feat/coverage-teardown-judge`:
`coverage_store.judge_session` (one judge invocation → `(sidecar|None, cost_row)`,
never raises), `coverage_store.union_for_document` (the read path), and
`bot.run_coverage_judge` (the teardown caller).

### Where the task starts

In `bot()`, immediately after `task = PipelineTask(...)` and BEFORE
`runner.run(task)` — the same scope that already closes over `turns`,
`study_meta`, `study_claims`, and `user_id`. Start it only when ALL of: study
mode, the flag is on, and `study_claims` is non-empty (no claim map → nothing to
judge, exactly as steering degrades).

```
live_task = None
if study_meta and COVERAGE_LIVE and study_claims:
    live_task = asyncio.create_task(live_coverage_loop())
```

Guard it behind its own flag (`VOICE_TUTOR_COVERAGE_LIVE`, default ON once
proven, full disable spelling set) so the loop can be killed without touching
teardown judging — the two must be independently revertible.

### Cadence

Wake on **whichever fires first**: `LIVE_COVERAGE_MIN_NEW_TURNS` new USER turns
(start at 6) or `LIVE_COVERAGE_INTERVAL_SEC` elapsed (start at 60), with a hard
floor of `LIVE_COVERAGE_MIN_INTERVAL_SEC` (start at 45) between calls so a fast
talker cannot trigger back-to-back judging. Skip the pass entirely when no NEW
user turn has landed since the last one — re-judging an unchanged transcript
spends money to produce the identical answer. Both knobs are env-tunable; the
design's stated tolerance is ~a minute of lag ("a glanceable bar, not a
scoreboard").

Cost sanity: a 20-minute session at this cadence is ~8–10 Haiku passes. See the
re-estimate under the incremental design below — the full-re-judge figure this
section originally carried (~$0.30/session) no longer applies.

### Incremental judging with external state (amended 2026-08-04)

**This supersedes the stateless full-transcript re-judge for LIVE passes only.**
The teardown pass is unchanged.

The covered-claim-id set already exists in code — it is the union. Make it the
state, and stop asking the model to re-derive it:

- **The set is authoritative and lives in code.** The model never re-derives it
  and is never asked to reproduce it.
- **Each live pass sends only the delta**: the turns added since the last pass
  plus a small **overlap window**, and only the claims **not yet in the covered
  set**.
- **The model answers the small question** — "which of these remaining claims do
  these new turns cover?" — and the code adds any newly-covered ids to the set.
- **The set grows monotonically**, which is the same invariant the storage layer
  already enforces via the append-only `write_sidecar` guard. A live pass can
  add to the bar; it can never subtract from it.

**Overlap window: 4 turns (2 user + 2 assistant), and this number is load-bearing
— document it at the call site.** Explanations span turn boundaries, so a pass
that sees only its own new turns will cut explanations in half.

**Measured caveat that bounds what the overlap can buy.** In the first real
wired session (2026-08-04, session `6e9d58c5`), the single covered claim c49 cited
turns **[4, 6, 8, 14, 16]** — one claim's explanation was distributed across
twelve turns, i.e. the whole session. No practical overlap window captures that.
So live passes will **systematically under-credit distributed explanations**, and
the bar will visibly jump at teardown when the full-transcript pass sees the
whole thing at once.

Under-crediting is the **safe** direction here, and it is what makes the design
hold together: the live set only grows, the teardown record only corrects
upward, and a user never watches their progress bar retreat. Design the UI copy
for a number that can jump up at the end ("final" vs "so far"), not for one that
is exact mid-session.

**Response contract differs from teardown — do not reuse the parser as-is.** The
teardown pass enforces completeness: every claim id appears exactly once
(`coverage_judge.parse_verdicts`, the truncation defense). An incremental pass
must instead return **only the newly-covered claims** — typically zero to three —
because that is where the cost saving actually lives (see below). That is a
*laxer* contract and needs its own validation path: still verify every returned
id is in the uncovered set, still verify every citation exists in the turns
actually sent, but do **not** require one verdict per claim. Keep the strict
completeness check on the teardown path where the record is made.

#### The tradeoff, stated plainly

Live passes **give up stateless re-judging** — a deliberate v1 property (see
"The judge loop" above: "no judge memory, no drift, no unrecoverable misses") —
in exchange for near-flat per-pass cost. The consequences, accepted:

- A live pass that **wrongly credits** a claim stays wrong on the bar until
  teardown. There is no live mechanism to remove it, by construction.
- Errors **accumulate within a session** rather than being re-derived away each
  pass.
- Both are acceptable because **rigor lives in the teardown record**: the sidecar
  — the thing every downstream consumer reads, and the thing the eval labels are
  assigned against — is still a from-scratch, full-transcript, completeness-
  checked judgment. The live number is a glanceable indicator, never the record.

#### Cost re-estimate

Measured on three real wired sessions (2026-08-04, 63-claim map, Haiku at
$1.00/MTok input and $5.00/MTok output): ~5.1–6.1K input and ~5.2–6.4K output per
full pass, **$0.032–$0.037**. Note the shape: **output is ~83% of the cost**.
That is the whole reason this redesign pays — not the shorter transcript.

| | Full re-judge (superseded) | Incremental (this design) |
|---|---|---|
| Input/pass | ~5.5K, grows with transcript | ~5.0K, **flat** |
| Output/pass | ~5.6K (a verdict per claim) | **~0.3K** (only newly-covered) |
| Cost/pass | ~$0.034 | **~$0.0065** |
| 9 live passes | ~$0.31 | **~$0.06** |
| + teardown pass | $0.034 | $0.034 |
| **Per session** | **~$0.35** | **~$0.09** |

Assumptions, so this can be checked rather than trusted: 9 live passes at the
cadence above; the uncovered claim list averaging ~55 of 63 claims (~1.5K tokens)
and being resent each pass; ~16 turns of new+overlap content per pass (~2.2K) at
the ~140 tokens/turn measured in these sessions; a ~1.2K system prompt; and
0–3 newly-covered claims per pass with citations and a brief reason (~300 output
tokens). **~4× cheaper, and per-pass cost stops growing with session length** —
the second property matters more than the first for long sessions.

Where the remaining cost sits: input is now dominant (~$0.005 of the ~$0.0065),
and most of it is **resending the uncovered claim list every pass**. The next
lever, if needed, is prompt-caching that block or sending ids plus shortened
claim text — not cadence. Not counted above; measure before claiming it.

### The loop body

```
while True:
    await asyncio.sleep(tick)
    if not enough_new_user_turns_or_time(): continue
    snapshot = list(turns)                       # append-only: a copy is safe
    delta    = snapshot[last_judged_index - OVERLAP_TURNS:]
    remaining = [c for c in claims if c.id not in covered]   # state lives HERE
    if not remaining: break                      # everything covered; stop paying
    newly, cost = await asyncio.to_thread(judge_delta, remaining, delta, ...)
    covered |= {v.claim_id for v in newly}       # monotonic; never removes
    last_judged_index = len(snapshot)
    live_coverage.publish(user_id, session_id, covered)
```

Note `if not remaining: break` — once every claim is covered there is nothing
left to ask, and the loop should stop spending rather than keep confirming a
finished document.

Three properties this must keep:

- **`asyncio.to_thread`, always.** The judge is a blocking 10–40s call; on the
  event loop it would stall every other live session. Same reason teardown
  judging threads it.
- **Snapshot, never mutate.** `turns` is appended to by the aggregator event
  handlers; the loop only ever copies it. It holds no reference to `task`,
  the transport, or any frame — the pipeline cannot be reached from here, which
  is what makes "the judge never blocks the voice path" structural rather than
  careful.
- **A failed pass is a skipped pass.** `judge_session` already returns
  `(None, cost_row)` instead of raising. Log, keep the last good number on
  screen, and try again next tick. Never surface a failure as a blank bar — a
  blank bar reads to a tester as "the product is broken" (the same
  demoralization risk as the false-negative probe item).

The loop writes **no sidecar**. Per the design, the teardown pass is the strict
record; live passes are in-memory only. This also keeps the union read path free
of half-session records.

### The in-memory slot

A tiny module (`live_coverage.py`, Pipecat-free, so it is importable by both
`bot.py` and `app.py` and unit-testable):

```
_slots: dict[tuple[str, str], dict] = {}    # (user_id, session_id) -> snapshot
publish(user_id, session_id, sidecar)       # store covered_ids + judged_at + counts
read(user_id, session_id) -> dict | None
drop(user_id, session_id)                   # called at disconnect
```

Keyed by **(user_id, session_id)**, never session_id alone — the key is also the
authorization boundary, so one user can never read another's live number. Store
the derived snapshot (`covered_ids`, `claims_total`, `judged_at`, `pass_count`),
not the full verdict list: claims are never user-facing, and the endpoint should
not be able to leak claim text even by accident.

Bound it: drop entries at disconnect, and cap total slots so a crash-looping
client cannot grow the dict without limit. Single process today, so a plain dict
is right — if the server ever forks, this becomes the first thing to move.

### The app.py exposure

`GET /api/sessions/{session_id}/coverage`, authenticated exactly like the
existing per-user routes (resolve the cookie → `user_id`, then read the slot with
BOTH ids; never trust the path id alone). `Path(session_id).name` at the route
boundary, as the other routes already do.

Response — the number the bar draws, already unioned:

```
{"percentage": 41.3, "covered_claims": 26, "claims_total": 63,
 "live": true, "judged_at": "...", "topics": [...]}
```

**The live bar starts at the accumulated cross-session number, not zero** (the
decision above). So the endpoint returns the union of (a) the doc's stored
union from `coverage_store.union_for_document(user_id, document_id, source_hash)`
and (b) the current session's live covered set — merged by claim id, which is
exactly what `coverage_judge.union_coverage` already does. Before the first live
pass lands, that is simply the stored union, so the bar opens at the right place
with no special case. `"live": false` while no in-session pass has run yet, so
the UI can distinguish "your prior progress" from "updated just now".

Poll every ~15s from `static/study.html`. Guard the poll against wrong-shaped
responses and KEEP THE LAST GOOD RENDER on failure — the mount-aware/poll lesson
from the dev-harness dashboard applies verbatim: a 200 with foreign JSON must not
blank the bar.

### Cancellation at disconnect

In `on_client_disconnected`, BEFORE `save_transcript()`:

```
if live_task is not None:
    live_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await live_task
```

Cancel first, then run the teardown pass — otherwise a live pass and the strict
pass judge concurrently, doubling spend for a number that is about to be
overwritten. Await the cancellation so the worker thread is not still running
when the process starts tearing down. `live_coverage.drop(...)` goes after the
teardown sidecar is written, so a UI polling during teardown keeps reading the
last live number instead of falling back to a stale union.

Inherited risk, unchanged: `on_client_disconnected` only fires on CLIENT
disconnect, and a hard process stop still loses the teardown artifacts. The live
loop does not make that worse (it writes nothing), and phase 1 already moved
coverage as early in teardown as it can be correct.

### Definition of done for phase 2

The bar on `static/study.html` opens at the document's accumulated coverage,
climbs during a real session without any audible or measurable effect on the
conversation, survives a failed judge pass without blanking, and stops cleanly at
disconnect with the teardown sidecar as the final record. Cost per session
measured and recorded in [cost-log.md](../validation/cost-log.md).
