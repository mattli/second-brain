---
created: 2026-08-06
last_updated: 2026-08-06
type: validation
branch: feat/coverage-read-path
status: reviewed cold; HIGH + both MEDIUMs fixed on the branch; LOWs deferred (recorded below)
---

# Coverage read path — cold review findings (2026-08-06)

Cold review of `feat/coverage-read-path` against `main`, read without reference to
what was intended. Five focus areas: the archive/restore path, the coverage routes'
user scoping, the read path's never-raise promise, the as-of snapshot arithmetic,
and anything in the UI that could show a wrong number rather than no number.

Companion to [[2026-08-04-coverage-teardown-judge-review]] (the write half).
Feature design: [[2026-08-02-live-coverage-design]].

**Method note.** Findings were not read out of the diff — each promise was attacked
with probes against the real modules, and the live sidecar store was inspected
read-only. That is what turned the HIGH from a code-reading hypothesis into a
measured, already-happening defect. Three of the five areas came out clean *under
attack*, which is a stronger statement than "looked fine."

---

## HIGH — the past-session meter showed a wrong number on live data (FIXED)

`at_session` ("where the total stood when this session ran") and
`session_contribution`'s `new_claims` both cut on **`judged_at`** — when the *judge
ran* — rather than when the *session happened*. Those coincide only for sessions
judged live at teardown. `backfill_coverage.py` stamps `judged_at` with the time of
the backfill, so a re-judged month-old session claims to be the newest thing that
ever happened.

This was not hypothetical. The live ledger already contained it: on document
`2aa66acc` (63-claim map), session `6e9d58c5` ran 2026-08-04 16:47 PDT and was judged
that evening at 16:53 PDT (`judged_at` 2026-08-04T23:53:51 UTC), while five *earlier*
July sessions were backfilled the next day at 17:06–17:12 PDT (00:06–00:12 UTC on
08-05). Ordering on `judged_at` therefore placed the August session first.

Rendered vs. correct, in the order the history list displays (it sorts by
`session_start`):

| # | session | session start (local) | rendered | correct |
|---|---|---|---|---|
| 1 | e96da2d8 | Jul 26 09:39 | 1.6% | 0.0% |
| 2 | f6148c26 | Jul 26 10:23 | 17.5% | 15.9% |
| 3 | 7beee170 | Jul 27 16:34 | 25.4% | 23.8% |
| 4 | d33800bf | Jul 27 18:02 | 25.4% | 23.8% |
| 5 | bb979045 | Jul 27 19:32 | 25.4% | 23.8% |
| 6 | **6e9d58c5** | **Aug 4 16:47** | **1.6%** | **25.4%** |
| 7 | 5004cb13 | Aug 4 17:51 | 25.4% | 25.4% |
| 8 | 9a2d38d0 | Aug 4 17:59 | 28.6% | 28.6% |
| 9 | 0ca94682 | Aug 5 18:18 | 28.6% | 28.6% |

Covered-count sequence rendered `1, 11, 16, 16, 16, →1←, 16, 18, 18` against a true
`0, 10, 15, 15, 15, 16, 16, 18, 18`. Session 6 understated by 16×; session 1 was
credited with a claim covered nine days later. This defeats the ascending-history
property the surface exists to deliver.

**Why hand-testing missed it.** The newest session is always correct (nothing was
judged after it), and that is the one a phone test naturally lands on.

**Why the suite missed it.** Every pre-existing as-of test used `judged_at` values
that happened to ascend with session order, so ordering on the wrong field passed
them all. A test only discriminates if the two candidate orderings disagree in it.

### Fix

Ordering now keys on **session time**, the same field `sessions.list_study_sessions`
sorts history by, so the meter and the list it appears in cannot disagree about what
"earlier" means.

- `coverage_store._session_time_of` prefers a new `session_start` field on the sidecar
  envelope and falls back to the transcript beside it (`<session_id>.json`), which has
  always recorded `session_start`. **No migration**: all 11 existing production
  sidecars resolve correctly through the fallback, verified against the ledger.
- `judge_session` sources `session_start` from the transcript both callers already
  pass, so neither `bot.py` nor `backfill_coverage.py` changed — and backfill now
  stamps the session's real start rather than the time of the backfill.
- `_order_key` returns `(session time, session id)`. The session id is a tie-break
  that makes the order **total**, which also closes the LOW below about the snapshot
  and the delta using different tie conventions: `at_session` minus `prior` is now
  exactly this session's own contribution in every case.
- `_newest_map_group` deliberately **keeps** using `judged_at`, and says so. Its
  question is "which claim map is current?", and the judge always runs against the
  current map (backfill refuses a stale one), so ranking map-version groups by session
  time could pick a superseded map. Two different questions, two different keys.
- A sidecar with no resolvable session time sorts oldest and renders **no** snapshot
  rather than a near-empty one. It never falls back to `judged_at`: session times are
  naive local and `judged_at` is UTC-with-offset, so mixing them is a silent
  format-driven mis-ordering — see [[2026-08-06-timestamp-format-consistency]].

Live re-verification after the fix: all 9 rows match, sequence ascends, 0 inversions.

---

## MEDIUM — the ended view showed a pre-session total while the judge ran (FIXED)

On a returning document, `session_view` returned the accumulated total during the
10–40s the judge takes, so the card appeared within ~2s reading e.g. "Coverage · 4 of
63 claims · 3 sessions" with no delta, then jumped. Stale rather than fabricated, and
self-correcting — but an unqualified number about a session not yet counted in it, on
the screen you land on when you hang up.

**Fix (Matt's call, 2026-08-06): withhold, then release on failure.** No coverage card
at all while `coverage_status == "pending"`. If the judge fails, the accumulated total
is released with no delta, so a broken judge costs the *delta*, not the document's
number. Alternatives considered and rejected: labelling it "before this session"
(a number that visibly changes under the reader), and a skeleton placeholder.

## MEDIUM — a failed judge burned the full 60s poll (FIXED)

`expects_coverage` is computed from *preconditions* (map fresh, judge enabled, turn
floor cleared) and so cannot know the judge later failed. The done-condition waited
for the **artifact** (`coverage.session`), which a failed judge never produces, so all
30 poll attempts ran — 60s of requests after the last artifact had landed at ~5s.
Same family as the trap `expects_summary` already exists to prevent.

**Fix.** The server now reports `coverage_status` ∈ `ready | pending | failed | none`,
and only `pending` holds the poll open. "Failed" is read from the ledger's
`kind="coverage"` row, which bot.py writes unconditionally (the spend is real either
way) and which is the only durable record that a run finished at all. The check is
deliberately one-way — false means "no failure on record", covering both in-flight and
a teardown that died — so it can only ever stop the poll on *positive* evidence, and a
missing ledger degrades to the old poll-to-cap behaviour.

Sidecar presence always wins over a stale "failed" row: the file is written *after* the
ledger row, so it is the only proof the result actually landed.

### Note on where this logic lives

The status decision and the withhold policy are pure functions in `coverage_store`
(`resolve_status`, `finalize_for_status`), not inline in the `/telemetry` route.
`app.py` is untested at the transport layer by [[voice-tutor-claude-md]] rule, so a
decision left there is a decision no test can fail on — the exact shape of the
filename-scheme and teardown-ordering bugs this project has already been bitten by.

---

## LOW — deferred, not fixed

### 1. Same-second re-archive can destroy an earlier archive

**This is the one place the "never deletes" promise can break.** `archive_document`
builds `_archive/<doc_id>-<stamp>` with `%Y-%m-%d-%H%M%S` granularity, then
`mkdir(parents=True, exist_ok=True)` followed by `Path.rename` per file. Archive →
restore → edit → archive within the same second reuses the existing folder and
`rename` silently overwrites the previously archived copy. Verified with a probe.

Effectively unreachable through the UI (restore requires tapping the undo toast), but
the whole design rests on archiving being reversible, and this is the single path
where a moved file is destroyed rather than moved. Fix direction: a uniquifying
suffix on collision, or refuse when the target exists.

### 2. Restore's 409 guard only checks `<doc_id>.txt`

`restore_document` refuses when a live document occupies the id, then moves *every*
archived file over the top. If a claim-map warm was in flight when the document was
archived (`claims/prepare` runs 30–60s), it lands in the live directory afterward and
the restore silently overwrites it. Effect is benign — the restored text and claims
are a matched pair, and the orphaned map was the mismatched one — but the guard covers
one of four file kinds while its docstring claims to prevent overwriting "a document
that exists now."

### 3. `claims_total: true` counts as a claim total of 1

`isinstance(True, int)` is true in Python, so a boolean in that field passes the type
check and becomes 1. Reachable only via a hand-edited sidecar, and only when the live
claim-map identity is absent. Cosmetic.

*(The fourth LOW from the original review — the snapshot and the delta using different
tie conventions — was closed as a side effect of the HIGH fix's total ordering.)*

---

## Verified good — held up under attack

These were probed, not merely read. Recording them so a future pass knows what has
already been attacked and how.

- **No traversal in archive/restore.** 8 payloads (`../victim/<id>`, `....//`,
  absolute paths, `..`, `.`, percent-encoded) against both operations: all refused
  404, victim files untouched, nothing created outside the caller's namespace. Both
  the routes and the module helpers collapse the id.
- **Shared-document 409 is solid**, including the shadowing case — archiving your own
  shadowing copy leaves the shared original intact and correctly re-exposes it.
- **Archive invisibility is structural, not filtered.** The picker's scan is
  non-recursive and `_load_from_dir` builds an exact path, so an archived document is
  both absent from the picker and unloadable for study as a consequence of the move
  itself. `resolve_title` still resolves it, so history keeps its names.
- **`union_for_document` never raised** across 25 malformed sidecar shapes × 2
  source-hash modes, plus empty directory, missing user directory, and a *directory*
  named `*.coverage.json`. Re-run after the ordering change: still 75 cases, 0 raises.
- **No cross-user path in the coverage routes.** `/api/coverage` accepts no
  client-supplied id at all; document ids come from the caller's own sidecars. The
  `?doc=` parameter on `/telemetry` can only re-point among the caller's own sidecars
  and their own claim map.
- **The bar cannot exceed 100% from bad claim ids** — the judge rejects unknown ids
  upstream, and the UI clamps regardless.

---

## Test coverage added

Suite went 643 → 666 passing (+ 15 JS poll cases, up from 11).

The important ones are **backfill-shaped**: `judged_at` deliberately in the *reverse*
of session order, which is what the original tests never did. Proven discriminating by
reintroducing the bug and confirming 9 tests fail, including
`test_a_backfilled_session_keeps_the_contribution_it_actually_made` — which on its
first draft passed under both orderings because its claim sets were disjoint, and had
to be rewritten with an overlapping claim to actually bite.

Also pinned: the transcript fallback for pre-`session_start` sidecars, the refusal to
mix naive session time with UTC `judged_at`, all four coverage states, the
withhold/release policy, and the `session_start` stamp on new sidecars.

---

## Real-session verification (2026-08-06 evening) — and what it found

Run on the isolated dev lane (`127.0.0.1:7861`, tailnet `:8444`), production untouched.
Graph Engineering, the only document with judged history. 22-minute session, 125 turns,
83 of them user turns. Disconnect **18:55:00 PDT**.

| artifact | landed |
|---|---|
| transcript | +0.0s |
| recap | +5.0s |
| cost + summary | +23.7s |
| **coverage sidecar** | **+61.5s** |

**The withhold fix worked exactly as designed — no wrong number was shown.** On the
old code the pre-session figure (`28.6% · 18 of 63 claims · 9 sessions`) would have
appeared at ~5s and, once polling stopped, stayed there permanently.

**But the card never appeared at all**, because the poll gave up at 60s and the
sidecar landed at 61.5s. Confirmed by Matt from the phone.

The data was all correct — 18/63 → 21/63 (28.6% → 33.3%), 9 → 10 sessions, +3 new
claims, and the sidecar carried `session_start`, so the ordering fix works on fresh
data too. It was visible immediately on reopening the session from history. Only the
freshly-ended screen lost it.

### The durable finding: a step whose cost grows with the work

The two earlier teardown failures ([[2026-08-04-coverage-teardown-judge-review]]) were
**ordering** — fixable by moving things. This one is not. Judge latency scales with
**both** transcript turns **and** claim-map size, because it emits one verdict per
claim, so its output grows with the map (6,315 output tokens here, $0.0403). The
documented 10–40s is a short-session figure.

A teardown step whose cost scales with session length or document size cannot be sized
against a constant deadline. **Measure it at the largest realistic input, not a
convenient one.**

`COVERAGE_MAX_POLL_ATTEMPTS` (120s, coverage only, added 2026-08-06) buys headroom and
**does not solve this** — the race returns on a longer document or a longer session.
Incremental judging during the session (phase 2 of
[[2026-08-02-live-coverage-design]]) is the actual fix, because it removes the work
from teardown rather than giving it more room.

Recorded as a third numbered trap in the project CLAUDE.md's teardown section.

### Also observed, not concluded

83 user turns over 22 minutes produced **3 covered claims**. That may be correct — the
conversation may have stayed on already-covered ground — but it is the direction the
[[backlog]] item *"false-negative probe for the coverage-judge answer key"* flags as a
structural blind spot: `labels.json` holds only claims marked *covered*, so the eval
can catch the judge getting looser and is blind to it getting stricter. This session is
a reason to build that probe, not evidence on its own.

---

## Still open

- Not merged. Branch `feat/coverage-read-path`.
- The 120s poll extension has NOT yet been exercised on a real session — it was written
  after the run above. Needs one more long session to confirm the card now appears.
- Browser surfaces beyond the ended view (swipe-to-archive, undo toast, desktop hover)
  still only verified by probe, not by hand.
