# Goal: Coverage Judge Module (standalone, hermetic + label-verified)

**Date:** 2026-08-03
**Target repo:** voice-tutor (`~/development/voice-tutor`)
**Type:** self-contained new module — harness lane (no live-code changes, no app wiring)
**Design doc:** `~/second-brain/products/voice-tutor/planning/2026-08-02-live-coverage-design.md`
**Eval set:** `~/second-brain/products/voice-tutor/validation/coverage-experiment/labels.json`

## What to build

A standalone Python module `coverage_judge.py` (plus tests) that judges claim coverage for one study session:

- **Input:** a claim list (id + claim text), an indexed transcript (list of `{index, role, content}` turns), and config (model, judge-prompt version).
- **Output:** a verdict object — for every claim id exactly once: `{claim_id, covered: bool, turns: [int, ...]}` — plus metadata: `judged_at`, `model`, `judge_prompt_hash`.
- One model call per invocation (Haiku, temperature 0), strict-JSON response parsing with the transport-layer defenses this repo has learned the hard way: markdown-fence stripping, truncation detection (verdict count must equal claim count), and a bounded retry on malformed output.
- A pure function `union_coverage(verdict_sets) -> {covered_ids, percentage}` that merges verdicts across sessions per the design doc (union by claim id, percentage derived at read time).
- A small CLI: `python -m coverage_judge --claims <file> --transcript <file> --out <file>` so the module is runnable standalone before any app wiring exists.

## The judge prompt is part of the deliverable — v2, not v1

Start from `judge-prompt-v1.md` in the eval-set folder (hash `632b73a34b1a22b1`). v1 is strict against topic adjacency but has ONE PROVEN FAILURE: it credits *fluent wrongness* — an explanation that matches a claim's shape and keywords while contradicting its specific content (see the c30 note in labels.json: the tutor taught the doc's sub-example triad as the headline three-way split, and v1 credited it).

**v2 must add a content-match requirement:** covered means the tutor's explanation is *consistent with the claim's specific assertions* — same substance, not merely same shape, topic, or shared keywords. An explanation that substitutes different specifics (different list members, different mechanism, contradicting details) is NOT covered even if fluent and adjacent.

Record the v2 prompt in the module (versioned, hashed the same way) so every verdict carries `judge_prompt_hash`.

## Verification (contract acceptance criteria)

Two layers, per this repo's learned rules:

**1. Hermetic tests (no network):** input validation, JSON parsing defenses (fenced output, truncated verdict lists, missing claim ids), union logic, CLI wiring, deterministic prompt-hash computation. Mock the model call.

**2. Credentialed smoke against the eval set (REQUIRED — this is the acceptance bar, not an afterthought):**
Run the real judge (real Haiku call, key from the repo `.env` — never echo it) against the frozen fixtures and require **label agreement**:

- Fixtures: the four PRIMARY transcripts + the matt doc's 63-claim list, and the strictness-test transcript + the shared doc's 71-claim list. Copy them into the module's test fixtures from:
  - transcripts: `~/.voice-tutor/transcripts/matt/` (sessions f6148c26, 7beee170, d33800bf, bb979045, 12f3a30d)
  - claim maps: the two docs' `.claims.json` sidecars
- **Pass criteria against `labels.json`:**
  - The 16 upheld claims (c1,c2,c3,c5,c6,c8,c9,c15,c17,c21,c27,c28,c31,c46,c47,c48) must come back covered in the union of the four primary sessions.
  - **c30 must come back NOT covered** — this is the mandatory regression case; v1 fails it, v2 must not.
  - Strictness test: session 12f3a30d against the 71-claim map must produce ≤ 2 covered claims (v1 produced exactly 1; small headroom allowed, but crediting a handful means the strictness regressed).
- If v2 prompt changes flip any of the 16 upheld labels to not-covered, that is a FAILURE of this run's criteria (do not silently trade recall for the c30 fix). Iterate the prompt until all 17 labels agree.

## Constraints

- New files only. Do not modify `bot.py`, the server, prompts, or any live path. App wiring is a separate, later CC-session task.
- Module lives in the repo (suggested: `coverage/` package or alongside existing standalone tools — follow the repo's existing module conventions).
- Costs: each credentialed smoke run is ~5 Haiku calls (~$0.07). Bound smoke invocations sensibly (don't re-run per hermetic test).
- Respect the ledger pattern if trivially available, but do NOT wire ledger writes into the app — a `--cost-out` JSON from the CLI is sufficient for now.
- Runs on Matt's Claude subscription — normal harness usage limits apply.

## Out of scope (explicitly)

- The live in-session judge loop, sidecar writes into `~/.voice-tutor`, UI/polling, topics rollup, teardown integration — all later CC work per the design doc.
- Any change to claim extraction or the claim maps.
- Re-judging or modifying `labels.json` — it is the frozen answer key. If the generated judge repeatedly fails on one specific label and the disagreement looks principled, STOP and surface it in the run report rather than tuning the prompt to force agreement.

## Success looks like

`coverage_judge.py` + tests merged on a branch, hermetic suite green, credentialed smoke green with 17/17 label agreement (16 covered + c30 not-covered) and strictness ≤ 2 on the trap session, v2 prompt versioned and hashed, CLI runnable end to end. Ready for a CC session to wire into the app.

---

## Launch 2 amendments (2026-08-03)

*Additive amendments for the second launch, after Launch 1 (run `msdql2bo`) paused on the per-sprint wall clock partway through Stage 1. The record above is unchanged; these amendments override it where they conflict.*

### The v1 prompt is INPUT, not a deliverable — verify, never reproduce
`judge-prompt-v1.md` is a fixed input to VERIFY, not something to author or reconstruct.
- Copy `judge-prompt-v1.md` from the eval-set folder into the module's test fixtures **verbatim** (byte-for-byte).
- The hash `632b73a34b1a22b1` is **provenance to verify on the copied file**: hash the copied bytes with the module's hash function and assert it equals `632b73a34b1a22b1`. It is NOT a target to reproduce by authoring or tuning a prompt.
- **If that verification fails, STOP and report it** — do not reconstruct, paraphrase, or tune anything to force the hash. A mismatch means the copy or the hash function is wrong; that is a finding, not something to engineer around.

### The v2 prompt is the authored deliverable — new hash, no reproduction target
- v2 is authored (per the v2 content-match requirement above), hashed with the **same** hash function, and its **new** hash is recorded in every verdict's `judge_prompt_hash`.
- There is **no** byte-reproduction target for v2. Do not attempt to hit any particular v2 hash.

### The parsing core already exists — build on it, do NOT rebuild
This run is **seeded from the Stage 0 result of Launch 1** (voice-tutor commit `f34b470`, "sprint 0 — core data contract + parsing defenses", scored 97). The repo the run starts in ALREADY CONTAINS, and its hermetic tests already pass (39 green):
- `coverage_judge.py` — claim-list loading, indexed-transcript loading/validation, markdown-fence stripping, strict verdict parsing, and the typed parse/validation error hierarchy.
- `tests/test_coverage_judge.py` — the passing hermetic tests for the above.

Therefore:
- **Do NOT re-plan or rebuild Stage 0.** Verify the parsing core is present and its tests pass, then plan and build **Stage 1 onward only** (v2 prompt authored + hashed; single-invocation judge + verdict assembly; `union_coverage` + CLI; credentialed smoke with 17/17 label agreement), building ON the existing core rather than re-deriving it.
- New Stage 1+ code and tests EXTEND the existing files (same `coverage_judge.py`, same `tests/test_coverage_judge.py`); do not duplicate the Stage 0 surface.

### Wall clock
Per-sprint wall clock raised to **45 minutes** for this launch (Stage 1 hit the 30-minute cap on a single generation attempt last time; the credentialed-smoke stage may legitimately need multiple iterations).
