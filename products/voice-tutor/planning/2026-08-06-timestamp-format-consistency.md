---
created_at: 2026-08-06
last_updated: 2026-08-06
status: decided, not built
type: design-decision
---

# Timestamp format consistency — one format for new writes

> Decision recorded 2026-08-06, during the coverage-bar read-path session. The
> decision is settled; the change is deliberately NOT on the coverage branch
> (`feat/coverage-read-path`) — see "Why it isn't riding that branch". Related:
> [[2026-08-02-live-coverage-design]] (the coverage sidecar this surfaced in),
> [[2026-08-04-coverage-teardown-judge-review]], [[2026-07-20-provider-reconciliation]]
> (the tool the ledger half would break).

## The problem, and how it surfaced

Two stores in one system write timestamps in two formats:

| store | field | format | count on disk (2026-08-06) |
|---|---|---|---|
| `session-log.jsonl` | `session_start` / `session_end` | naive local (`2026-08-05T18:18:35`), America/Los_Angeles wall clock, no offset | 58 rows, all naive |
| coverage sidecars | `judged_at` | offset-aware UTC (`2026-08-06T01:40:47+00:00`) | 11 sidecars, all aware |

Neither store mixes formats internally. The inconsistency is strictly *between*
them — which is why it stayed invisible until something read both.

**How it surfaced.** A session that ran 18:18–18:39 local was reported back to
Matt as having been judged at "01:40" — the sidecar's UTC value, quoted without
a timezone label. Matt read that as 1:40am and asked whether something had
created a session on its own. It hadn't: 01:40 UTC *is* 18:40 local, 72 seconds
after that session ended. The investigation was cheap but the alarm was real,
and the ambiguity is structural, not a one-off reporting slip: any human or tool
reading across both stores has to know which format it is looking at, with
nothing in the data to say so.

## Decision

**UTC everywhere for new writes.** Specifically:

1. **Writers emit timezone-aware UTC** — `datetime.now(timezone.utc).isoformat()`
   — for every persisted timestamp. `coverage_judge` already does this; `bot.py`
   (session rows, transcript envelope) does not.
2. **Readers parse aware and convert at the boundary.** Anything comparing,
   filtering, or bucketing timestamps works in aware UTC; conversion to local
   happens only where a human sees the value.
3. **The 58 existing ledger rows stay exactly as written.** They are documented
   as America/Los_Angeles wall clock (`reconcile_costs._parse_local` says so),
   and a reader that localizes a naive value keeps handling them correctly. No
   migration, no rewrite — they are records.
4. **Display always carries an explicit timezone.** The failure above was a
   value shown without one; a format change alone would not have prevented it.

### Why UTC and not naive local

UTC is absolute, sortable as a string, and unambiguous across DST. Naive local
is none of those: it repeats an hour every autumn, skips one every spring, and
is silently wrong the moment a value crosses machines. It is also the format
that produced the confusion above.

The coverage sidecar is additionally load-bearing here: the past-session
"coverage after this session" snapshot orders sessions by comparing `judged_at`
strings. That comparison is only meaningful if every value shares one format.

## Blast radius

Four modules parse these timestamps, each needing its own test pass:

- **`reconcile_costs.py`** — the sharp edge. `_parse_local` deliberately STRIPS
  any timezone to keep date-range filtering naive-local. Feed it aware UTC
  unchanged and it treats `01:40 UTC` as `01:40 local` — every new row
  mis-bucketed by 7 hours. That surfaces as the provider appearing ahead of the
  ledger, i.e. a phantom logging error, which is precisely the condition this
  tool exists to distinguish from real drift ([[2026-07-20-provider-reconciliation]]).
  This module must be changed in the same commit as the writers, never after.
- **`cost_audit.py`** — same ledger, same range semantics.
- **`session_state.py`** — parses timestamps for the memory/summary path.
- **`sessions.py`** — sorts study-session rows by `session_start` (ISO lexical
  ordering, which holds within one format and breaks across two).

Plus the writers themselves in `bot.py`, and the naive `session_start` /
`session_end` in the transcript envelope.

**Mixed-format window.** After the change, the ledger contains 58 naive rows and
every subsequent row is aware. Readers must handle both — treating naive as
America/Los_Angeles — for as long as those rows exist. That is the price of not
rewriting records, and it is the right price; the alternative is editing history.

## Why it isn't riding the coverage branch

`feat/coverage-read-path` is about making coverage visible: the degrading read
path, two routes, four display surfaces, and archiving a document. It is about
to go to review.

This change touches the cost-reconciliation tooling, which is unrelated to any
of that, and its failure mode is a *quiet wrong number* in a diagnostic — the
hardest kind to notice and the worst kind to bundle into someone else's review.
Reviewing it alongside UI work invites the reviewer to skim exactly the part
that needs the most care.

It is small and well-understood, but it is a separate change, with the
reconciliation tests as its gate.

## Definition of done

- Every persisted timestamp is written as aware UTC.
- `reconcile_costs` and `cost_audit` bucket a known set of sessions into the same
  dated ranges before and after the change — verified against the real ledger,
  not only fixtures.
- The past-session coverage snapshot still orders sessions correctly with a mix
  of pre-change and post-change sidecars.
- Any timestamp rendered for a human carries its timezone.
