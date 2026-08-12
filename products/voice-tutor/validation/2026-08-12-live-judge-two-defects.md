---
date: 2026-08-12
type: findings
status: seeding fix built on `feat/live-coverage-loop`, unmerged; recap defect open, unfixed
branch: feat/live-coverage-loop
sessions: 232823ad-982a-4fc6-802a-8d18ed11e0c7, 53cce79c-aa14-4bac-b425-72d87230c3cf
---

# Two independent defects in the live judge, found from the first real evidence files

The first evidence files produced by the per-pass recorder built on 2026-08-08.
Two dev-lane sessions (294 and 257 turns), both with strict sidecars, both
comparable. What they surfaced was not the question they were built to answer.

## The reframe that matters most

**Live and strict run the identical prompt.** Same v2 prompt, hash
`5b9090d7a60ce5d1`, same model (Haiku 4.5) — verified from code against the hash
recorded in both strict sidecars and both evidence files. `run_incremental_pass`
takes no prompt argument and defaults to the same `JudgeConfig` strict uses.

So the Saturday framing — that the live judge is *optimistic* — was wrong.
It is **the same judge with a ten-turn horizon**. Strict's rejection reasoning
("a reference to a prior conversation, not an explanation in this transcript")
is a conclusion available only to a reader who can see the session never returned
to that material. A judge shown eleven turns cannot distinguish a recap of last
week from an introduction to this week.

This is a **visibility defect, not a strictness defect**, and it corrects
[[2026-08-08-live-coverage-loop-first-session]].

## Caveat on the sessions themselves

Both were run as interview prep and were substantially off-document. Strict
credited **zero new claims on both** — correct behaviour, not a failure. That
means these sessions cannot answer the original design question (does a windowed
judge *under*-credit when explanation is spread across a real session). That
still needs a session where the document is actually worked.

What they do provide is an unusually clean demonstration of the defects below:
with almost no real coverage to confound it, the live judge still put 2 claims
on the board.

## Defect 1 — the live judge is never seeded with prior coverage

`live_covered` is initialized empty at session start (`bot.py`). It is never
seeded from the stored cross-session union. `coverage_store.union_for_document`
is called from `app.py` (display) and `backfill_coverage.py`, and **from nowhere
in `bot.py`**.

Within a session the exclusion works exactly as designed — the evidence file
shows pass 1 sending 63 claims, passes 2–13 sending 61 after two were credited.
Across sessions there is no memory at all.

**Consequence:** every session's pass 1 sends the full claim map, including
claims banked days earlier. On `232823ad` that was 22 wasted claims out of 63.

**Not a recorded trade-off.** No rationale in module docstrings, design notes, or
the wiring commit (`bd3ea46`) — whose message reasons about the cross-session
union at length in the *display* context, and separately flags per-pass cost as
the loop's weak point. Seeding would have cut the first pass by 35%. That is not
a saving declined on purpose while writing that paragraph. It is a gap.

## Defect 2 — the opening turn is read as explanation

The tutor's first spoken turn is an LLM paraphrase of the "Where you left off"
block (`study_history.previous_session_recap()` → `bot._previously_block()`).
It is appended to the transcript by the same handler as every other assistant
turn — a plain `{role, content, timestamp}` dict **with no marker**. By the time
the judge sees it, it is indistinguishable from an explanation.

`bot.py` knows at session start whether a recap was injected. The information
exists and is discarded before the judge sees it.

**The exposure is wider than returning sessions.** On a *first* session the
opening instructions tell the tutor to orient the student in "two to four beats,
synthesized from the document and your private claim map" — also a document
summary at turn 0, also in front of a ten-turn horizon. A fix scoped to
"last time we covered…" leaves that case open.

## How the two compounded

Both live credits on `232823ad` cited turn 0 and nothing else — a recap opening
with the four cases where graphs don't make sense, and anchors.

- **`c58`** — **already in the stored union**, banked by session `e5b75522` two
  days earlier. Should never have been in the request (defect 1). It was then
  re-credited on a paraphrase of the very session that originally earned it
  (defect 2). Two failures, one turn.
- **`c55`** — genuinely uncovered, so asking was legitimate. Credited on the
  recap alone (defect 2 only).

Neither citation was hallucinated: turn 0 was inside pass 1's window `[0,10]`.
The evidence was real and the judgment was wrong.

**Fixing either leaves the other standing.**

A note on display impact: `c58`'s live credit never moved the number, since the
route returns `union(stored, live)` and `c58` was already in the stored half. The
costs were money and a corrupted evidence record, not a wrong bar.

## What was built today — defect 1 only

`coverage_store.seed_covered_ids(user_id, document_id, source_hash)`, a pure
helper returning the stored union as a set. `bot.py` seeds `live_covered` from it.

- **Requires a real `source_hash`** — a falsy one returns `set()` rather than
  falling through to `union_for_document`'s newest-map-version mode, which could
  hand back ids from a map this session isn't using. Claim ids are per-document
  sequentials; merging across a re-extracted map would let a stale `c15`
  silently suppress a real claim.
- **Degrades to empty on any failure**, logged — never fails the session.
- No env flag: unmerged branch, `git revert` is the backout.

**A diagnostic it would have broken, caught during implementation and worth
recording.** The teardown's *"strict pass settled DOWNWARD"* warning compares
`live_covered` against this session's strict verdicts. Once `live_covered`
carries the seed, all 22 seeded claims read as live credits strict rejected —
22 false alarms burying the one real disagreement. Fixed by holding the seed in
a separate `live_seeded` set and comparing `live_covered - live_seeded`.
**Without that, the fix would have destroyed the instrument used to find these
defects in the first place.**

### Measured effect

| | Before | After |
|---|---|---|
| Pass 1 claims sent (`232823ad`) | 63 | **41** |
| Passes 2–13 claims sent | 61 | ~40 |
| Input tokens | 64,423 | ~48,400 |
| Output tokens | 71,219 | ~46,700 |
| Cost @ $1/$5 per Mtok | **$0.4205** | **~$0.28** |

~33% saving, ~$0.14 on this session. Output dominates — one verdict per
uncovered claim, at 5× the input price. **The saving scales with how covered the
document already is**: a first session on a fresh document saves nothing.

The after-column is a projection from measured per-claim rates, not a measurement
of the fixed code.

`c58` would no longer be judged. `c55` would still be judged and still credited.

**Tests:** 10 new in `tests/test_live_coverage_seed.py`, hermetic. Suite 836
green.

> **Corrected 2026-08-12 (same day).** This section originally said *eight* of
> the ten new tests fail against the unfixed code with `AttributeError`. It was
> **all ten** — the original run output shows `10 failed in 0.12s`, every one on
> `AttributeError: no attribute 'seed_covered_ids'`. The error was mine in
> transcribing the run report, and it made the proof look stronger than it was:
> a missing-symbol failure proves the symbol is new, not that behaviour changed.
> The point below stands and is in fact sharper.

Honest note on proof strength: **all ten** fail against unfixed code with
`AttributeError: no attribute 'seed_covered_ids'` — a missing symbol, not a
behavioural difference. The arithmetic was demonstrated separately (unfixed pass 1
sends 10 claims where the fixed test asserts 7). The headline "10 proven to fail"
is softer than it reads.

## Open — defect 2, undecided

Proposed fix (not built): reject any live credit whose cited turns fall
**entirely** within the opening assistant turns — defined as *all assistant turns
before the first user turn*, not index 0, since the opener can split across
aggregator messages. One predicate at the merge site. Would have caught both
credits exactly. Hermetically testable. Prompt untouched.

Rejected alternatives:

- **Excluding the opener from the live window** — creates a deliberate
  live-vs-strict asymmetry, so `live_vs_strict.py` stops comparing like with
  like on that turn. Also: moving the *watermark* would not work, since the
  4-turn lookback pulls turn 0 straight back in on pass 2.
- **Marking prior-session content structurally** — touches `Turn` and
  `_render_transcript_block`, both used by strict, which currently gets this
  right. The prompt hash covers prompt *text*, not the render function, so this
  silently changes what the judge sees while sidecars still record
  `5b9090d7…`.
- **A prior-conversation rule in the prompt (v3)** — argued against. Such a
  clause existed in an early draft and was **deliberately removed 2026-08-03**
  when v2 was generalized off its eval set: it was answer-key-specific, and
  "a prompt tuned to its own answer key proves nothing about unseen documents."
  Strict's correct rejection was **derived**, not instructed. Writing one means
  authoring new language — a v3 — which lands in the measured variance gradient
  (*more decomposition instruction → more enumeration → more variance*) and
  forks the hash. The benefit would land on the path that already works.

## The limit worth remembering

The opener guard patches the most frequent instance, not the cause. A judge
reading ten turns cannot tell a mention from an explanation, because it cannot
see whether the conversation ever returns to the material. Turn 0 is simply where
that goes wrong most reliably. **Do not read the guard as solving the
windowed-judge problem.**

## Method note

The previous analysis examined the recap defect in depth, wrote three options and
a recommendation, and never asked whether the claims should have been in the
request at all. The naive question — *shouldn't it already know what's covered?* —
surfaced a cheaper, cleaner bug underneath a well-argued fix plan. Worth asking
before accepting one.
