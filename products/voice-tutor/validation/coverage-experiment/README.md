---
created: 2026-08-03
type: validation-experiment
---

# Claim-coverage experiment — Graph Engineering study sessions

An experiment (no app changes, nothing run on the live server) measuring how much
of each document's **claim map** a study-tutor session actually *explained* — judged
strictly by one Haiku call per session. See [[backlog]] and the two-doc version check
that preceded it.

> **Closed (2026-08-07):** [[2026-08-07-false-negative-review-sheet]] — the
> not-covered half of the answer key is built. 10 claims marked, 9 upheld the judge,
> `c31` the sole false negative; written to `labels.json` as era 2.
>
> **Now open — the judge is UNSTABLE, and that outranks the prompt work.** A 7-run
> measurement (2026-08-07) found v1 deterministic on session `7beee170` and v2 not:
> `c31` 3/7, `c28` 5/7, `c9` 6/7, all three of them era-1 *covered* rows. Since the
> product stores one run per session, a session's number moves ~±1.5 claims for
> reasons unrelated to the session. **No prompt change is measurable until this is
> addressed** — a 1-claim diff is inside the noise. Numbers in `labels.json` under
> `variance_measurement_2026_08_07`.

## The shapes — how a claim can appear without being covered

Three distinct ways a claim's material shows up in a transcript. They are not
degrees of the same thing; they fail differently, and the judge handles them
differently. All confirmed against Matt's verdicts 2026-08-07.

| shape | what happens | example | correct verdict | judge |
|---|---|---|---|---|
| **Mentioned only** | The words appear — recited, or a bare name-drop — and are never unpacked. | `c4` (both clauses recited, then handed back as a question), `c62` (five words in a list) | not covered | ✅ right |
| **Used as evidence for a different argument** | The claim's subject is invoked, and something *is* explained — but the thing explained is a different point the example was recruited to support. The claim's own content is never taught. | `c61` — Sumner's migration is named and used to argue that one-time migrations don't transfer to VoiceTutor; Zig→Rust, the CI gate and the cost figures never appear | not covered | ✅ right |
| **Explained as a digression** | The claim's content *is* genuinely taught, but as an aside inside a conversation about something else rather than as the session's declared subject. | `c31` (human-gate principle and both failure directions, while answering a question about the limits of AI judgment) | **covered** | ❌ wrong |

The middle shape is the subtle one, and worth stating plainly because it is the
easiest to mislabel in either direction: **explanation happened, but not of this
claim.** A judge that asks "was there teaching near this material?" credits it; a
judge that asks "was THIS claim's content taught?" does not. The live judge gets
it right, so a v2 prompt must not lose that.

## Known judge biases

Findings that call for a change to [[judge-prompt-v1]] rather than to the labels.
Each one needs a confirmed false negative behind it, not a suspicion.

- **Over-decomposes multi-clause claims — and does it UNRELIABLY** (measured
  2026-08-07, claims `c31`, `c28`, `c9`). Originally recorded as "under-credits
  digressions", which the judge's own reasoning does not support. Its recorded
  reason for `c31` is not about framing at all: *"delivers the core principle but
  does not explicitly address the tradeoff between too many gates and too few…
  the claim's full substance is not delivered."* It split a single principle's two
  consequence clauses into separately-required parts. Both consequences **were**
  conveyed, just not framed as a tradeoff — so this is a **form** requirement
  masquerading as a substance one.

  The 7-run measurement then showed it is not even a consistent bias: v2 marks
  `c31` covered 3/7, `c28` 5/7, `c9` 6/7, while v1 marked all three covered 7/7.
  So v2 does not reliably over-decompose — it over-decomposes *sometimes*, which
  is worse than a stable bias because it cannot be corrected by a label.

  Structure is general, not a `c31` quirk: **33 of the 63 claims** carry a
  subordinate consequence/contrast/rationale clause, so any prompt that treats
  such clauses as required parts is unstable across half the map.

## The brief for v3 (set 2026-08-07 — supersedes "fix the digression bias")

**Start from v1's simplicity, add back only content-match, and measure variance
rather than correctness alone.**

This replaces the earlier brief. "Fix the digression bias" was written before the
judge's own reasoning was read and before anything was measured; both turned out
to point elsewhere. What the evidence supports:

1. **v1 was deterministic** on the measured session (12 covered, 7/7 identical,
   zero unstable claims). v2 is not (3 unstable, all era-1 *covered* rows).
   Simplicity is doing work here — treat every v2 addition as suspect until it
   earns its place.
2. **Content match earned its place.** It is the one v2 rule with a proven,
   stable win: `c30` went 7/7 wrong under v1 to 0/7 wrong under v2. Keep it.
3. **Everything else v2 added is unproven** — the enumeration rules, the
   decomposition procedure, the required `reason` field — and the variance
   arrived alongside them.
4. **Acceptance is a flip RATE, not a verdict.** Run N times per session and
   compare per-claim rates. A one-claim difference between two prompts is inside
   the noise and means nothing; this session produced two wrong conclusions
   (in opposite directions) by sampling an unstable claim too few times.

Unchanged acceptance targets: `c30` stays not-covered, `c31` returns to covered,
era-1 covered rows hold, the `12f3a30d` strictness trap stays ≤2, and `c61`'s
shape does not regress.

## Open design question — one run per session puts luck in the number

The product stores **one** judge run per session, so an unstable prompt makes a
session's coverage partly luck. Measured today: v2's per-run total on one session
ranges 9–11 of 63, roughly ±2.4 points of the bar, for reasons having nothing to
do with the session.

**Majority-of-N judging is the obvious answer and costs N×.** At today's ~$0.04
per judged session, 3× is ~$0.12 — cheap in isolation, but it lands on the
teardown path that already loses the 60s display race, so it is a latency
decision as much as a cost one.

**Decide once v3's variance is known, not before.** If v3 recovers v1's
determinism the question disappears; if it does not, N-of-3 with the existing
append-only sidecar is the fallback. Related: the teardown-latency trap in the
project CLAUDE.md, and phase 2's incremental judging, which would move the work
off teardown entirely.

## Prompt-authoring lessons — read before attempting v3

### Telling the model to enumerate "required parts" makes it enumerate MORE

**Measured 2026-08-07 on a v3 draft that was abandoned.** The draft tried to make
the judge *narrower* about which parts of a claim it demands, by adding an
explicit step — "work out the claim's REQUIRED PARTS using an independent-substance
test" — plus a rule saying consequences, failure modes and contrasts are
elaboration, not extra parts.

It did the opposite. Giving the model a checklist-building instruction made it
build **longer** checklists; the elaboration rule sat right beside it and lost.
The draft's own reasoning on `c31` enumerated four required parts, including the
two consequence clauses the new rule was written to exempt, and marked it not
covered 3/3 — worse than the prompt it was meant to fix. It also **lost `c28`**
(which v2 held) for exactly the same reason, decomposing a metaphorical
restatement into a required part.

**The lesson generalises past this prompt:** an instruction to *identify parts*
is an instruction to *find parts*, and the model will satisfy it. Exemption rules
placed alongside a decomposition step do not restrain it — the decomposition step
sets the task and the exemption reads as an edge case. If the goal is less
decomposition, remove the decomposition instruction rather than qualifying it.

Do not re-run this experiment expecting a different result. If a future v3 needs
tighter part-matching, change what the model is asked to *do*, not what it is
told to *avoid*.

### The variance evidence points the same way

The 7-run measurement puts this in context. v1 — the *shorter* prompt, with no
`reason` field and no decomposition rules — was **deterministic** (12 covered,
identical across 7 runs). v2 added enumeration rules and a required reasoning
field, and became unstable on exactly the claims those rules bear on. The v3
draft pushed further in the same direction and was the most decompositional of
the three (`c31` not covered 3/3, and it lost `c28` outright).

So the gradient is consistent across all three prompts: **more decomposition
instruction → more enumeration → more borderline calls → more variance.** The
design direction for a real v3 is therefore *back toward v1's simplicity*, while
keeping the one v2 rule that demonstrably earned its place — content match, which
fixed `c30` stably (v1 7/7 wrong → v2 0/7 right). Everything else v2 added should
be treated as suspect until measured.

## What coverage means — the v1 rule, restated

**The rule is unchanged: was the claim EXPLAINED?** Coverage judges the TUTOR's
output. There is no student-engagement variable — whether Matt took the topic up
is not part of the test.

**Mentioning is not explaining.** `c4` is the clean instance (Matt's verdict,
2026-08-07): the tutor recited both clauses of the claim verbatim and asked "what
do you make of that framing?" — but never unpacked what an anchor *is*, or why
verifying against reality differs from verifying against other model outputs.
A headline, not a lesson. Correctly not covered.

`c31` is the same rule reaching the opposite verdict, not a competing one: there
the tutor actually explained the principle and both of its failure directions. It
arrived as an aside inside another conversation, and the judge appears to have
discounted it for that — which is the bias recorded above. **Delivery framing is
irrelevant; explanation is the whole test.**

So the two findings agree: c31 was explained (though as a digression) and should
count; c4 was mentioned but never explained and should not. This is also the
question to apply to `c61`/`c62` — did the tutor explain the claim's content, not
did it say the name.

## Baseline decision — each roster judged against its OWN doc's map

Two "Graph Engineering" documents exist (a `matt` doc and a newer `_shared`
superset). The decision for this run was: **judge each session against the claim map
of the doc it actually used**, not a single shared baseline.

| Scope | Doc | Claim map | Sessions judged |
|---|---|---|---|
| **PRIMARY** | `matt/2aa66acc-1c4b-4d7d-83fe-b361fbe38523` | 63 claims (mtime 2026-07-26 09:41:21) | `f6148c26`, `7beee170`, `d33800bf`, `bb979045` |
| **SECONDARY** | `_shared/ac4b826f-b189-442e-98c0-a59bb066d600` | 71 claims (mtime 2026-07-29 12:35:10) | `12f3a30d` (strictness test) |

Each `<session>.coverage.json` records which map it was judged against (`doc_key` +
`doc_claims_count`).

## Exclusions

- **`e96da2d8` (matt doc) — excluded.** Its session (2026-07-26 09:39:50) started ~91s
  *before* the matt claim map was written (09:41:21), so it ran without the current
  map (session start reads the sidecar cache-only; none existed yet). It cannot be
  judged against a map it never had.
- **`e37a01d3`, `9e92feb4`, `f82e0d16`, `8a691356` (matt doc) — excluded, no transcript.**
  Each has only a `prompt.txt` (no `.json`, no `usage.json`): the session was created
  but never recorded any turns, so there is nothing to judge. An empty session
  contributes nothing to a *union* of covered claims, so their exclusion does not
  change the union membership — but it means the PRIMARY roster is **4 judged
  sessions, not the 8** originally listed. The other 3 shared-doc/john sessions and
  all other shared sessions were out of scope by the baseline decision.

## Method

- **One `claude-haiku-4-5` call per session**, temperature 0 (model id
  `claude-haiku-4-5-20251001`). Key: `ANTHROPIC_API_KEY` from the app `.env` — the
  secrets file holds only an *admin* key, which can't call Messages; the key is never
  echoed.
- **Input:** that doc's claim list (id + claim text, **no anchors**) + the full
  indexed transcript (`[i] ROLE: content`, one line per turn).
- **Instruction (strict):** for each claim, did the **tutor** explain the claim's
  actual assertion comprehensively — not a passing mention, not topic adjacency? Every
  `covered: true` must cite **all** constituent assistant turn indices; no citable
  turn ⇒ not covered. Full text in `judge-prompt-v1.md` (hash `632b73a34b1a22b1` —
  provenance for the 8/2 hand-run, not reproducible from the published file, which
  hashes to `038fe74e279842e6`; see that file's header —
  recorded on every `.coverage.json` as `judge_prompt_hash`).
- **Session date = `prompt.txt` mtime** (the session's start artifact).

## Artifacts

- `judge-prompt-v1.md` — the exact judge prompt.
- `<session>.coverage.json` — per-session verdicts, cited turns, `judged_at`, `model`,
  `judge_prompt_hash`, doc judged against.
- `union.json` — union of covered claims across the 4 PRIMARY sessions, % over 63.
- `audit-sheet.md` — one row per PRIMARY-union claim for Matt to check (agree/disagree).
- `labels.json` — ground-truth human labels (judge_verdict vs. matt_verdict + confidence) for the 17 union claims; c30 flagged as the judge-prompt-v2 regression case.
- `_run-cost.json` — token totals + Haiku cost for the run.

## Results (2026-08-03 run)

- **Strictness test (`12f3a30d`, shared doc):** 1 of 71 claims covered — honest, not
  generous (see the final report).
- **PRIMARY union (judge, pre-audit):** 17 of 63 claims = **27%** (vs. the tutor's ~40% recap estimate).
- Per-session covered: `f6148c26` 10, `7beee170` 12, `d33800bf` 0, `bb979045` 11.
- Haiku cost: **$0.068** (30,007 in / 7,601 out).

## Post-audit (2026-08-03)

Matt audited the 17-claim PRIMARY union against `audit-sheet.md`: **16 of 17 upheld.**
The lone rejection is **c30** — the judge credited a shape + keyword match. The tutor
(`7beee170#28`) named the *perspective-diverse-verify* example lenses (correctness /
security / reproducibility) as if they were the doc's headline three-way split, which
is actually **correctness / currency / source-authenticity** (source line 86); it never
named currency or source-authenticity. Claim c30 is itself a **faithful** extraction
(claims.json anchor resolution `exact`), so this is a **judge** error, not a bad claim —
which makes c30 the **mandatory regression case for any judge-prompt v2** (v2 must mark
it NOT covered).

- **PRIMARY union (post-audit):** **16 of 63 claims ≈ 25%** — still well under the tutor's
  ~40% recap estimate.
- Ground-truth labels: [`labels.json`](labels.json) — per-claim judge vs. Matt verdict +
  confidence (`familiarity` for the 16 upheld on recognition; `verified` for c30).
