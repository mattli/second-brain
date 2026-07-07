---
created_at: 2026-07-07
last_updated: 2026-07-07
type: explainer
---

# dev-harness — Plain-Language Explainer

A simple guide to what dev-harness is, how it runs, what it leaves behind, and
how to judge whether the result is any good. For the full design rationale see
[[2026-06-30-dev-harness-design]]; for the goal-reconnection fix see
[[2026-07-06-c1-c2-adversarial-loop-design-note]].

---

## What it does

You point it at a code project and give it a goal in plain English ("add a
`sum.js` with a passing test"). It then drives a real Claude agent to **write the
code, run the tests, and grade its own work** — over and over — until the work is
good enough or a safety cap stops it. You kick it off and walk away; you come back
to reviewable code on a branch, plus a readable log of everything it did.

Think of it as an **automated junior dev that works in a scratch branch under a
strict budget, with a built-in reviewer looking over its shoulder.**

The trick that makes the output better than one agent looping on its own: it uses
**three separate roles** that keep each other honest.

| Role | Job |
|------|-----|
| **Planner** | Breaks the goal into a few small sprints. |
| **Generator** | Writes the actual code for a sprint. |
| **Evaluator** | Grades the code — and it grades *blind* (see below). |

---

## How it works (the two ideas that matter)

**1. A negotiated contract.** Before any code is written, the generator and
evaluator argue out a "contract" — the concrete acceptance criteria for the
sprint (e.g. "`sum.js` exports `sum(a,b)` returning `a+b`; handles negatives").
The evaluator pushes back on lenient or off-goal criteria. They go up to 5 rounds,
then the contract is **frozen**. This is what the code gets measured against.

**2. Blind evaluation.** When the evaluator scores the work, it sees **only the
frozen contract and the actual code change (the diff)** — not the goal, not the
generator's chat, not the commit messages. This is deliberate: it stops the
evaluator from rubber-stamping. Passing tests alone don't earn a good score — the
code has to actually satisfy the contract. (Off-goal code that happens to pass its
own tests scores near zero.)

There's also a **deterministic verifier** — it just runs your real test command
(`npm test` by default) and reports pass/fail. That's the hard, non-negotiable
signal; the evaluator's score is the judgment layer on top.

Everything happens inside a **throwaway git worktree**, so your working copy is
never touched. Nothing is ever auto-merged — a **human merge gate** is the point.

---

## The steps it takes (one sprint)

For each sprint the loop runs these phases:

1. **PLAN** — planner splits the goal into sprints (happens once, up front).
2. **NEGOTIATE** — generator + evaluator agree the contract, then freeze it.
3. **GENERATE** — generator writes/edits code in the worktree.
4. **VERIFY** — the test command runs. Deterministic pass/fail.
5. **EVALUATE** — evaluator grades the diff against the contract → a score 0–100.
6. **DECIDE** — what happens next:
   - Score **≥ 85** → sprint passes, **advance** to the next sprint.
   - Score **< 85** → retry this sprint (generator tries again).
   - Any **hard cap** hit → **halt** immediately.

It keeps going until all sprints pass, or a cap stops it.

### The hard caps (safety stops)

The run halts the moment any of these trips:

| Cap | Default |
|-----|---------|
| Money spent | $10 |
| Retries per sprint | 6 |
| Wall-clock time | 30 min |
| No progress | score gains under 5 pts across 2 sprints |

All of these are adjustable per run (CLI flags / config).

---

## What you get when it finishes

Four things, in two places:

**In your project repo:**
- **A branch** named `run/<slug>-<runId>` with the generated code **committed** on
  it. This survives after the run — it's what you review and choose to merge (or
  not). Your main branch is untouched.

**In `runs/<runId>/`:**
- **`transcript.md`** — a human-readable play-by-play: every phase, every sprint,
  what each agent did, the tool calls, the scores. **Read this first.**
- **`state.json`** — the final machine state: `status`, the list of `scores`, how
  much was spent, and why it stopped (`haltReason`).
- **`trace.jsonl`** — the raw event log (one line per phase). The source the
  transcript is rendered from; useful for tooling or a precise audit.

Two `state.json` fields tell you the headline outcome:
- `status`: `passed` (all sprints cleared) or `halted` (a cap stopped it).
- `haltReason`: `null` if it passed, otherwise which cap tripped (e.g.
  `wall-clock`).

---

## How to assess the output

Don't just trust the score — check three things, in order:

1. **Did it build the *right* thing? (most important)**
   Look at the branch. Does the committed code actually match your goal — the
   right files, doing the right thing? A run can pass its own tests while building
   something off-goal. This is the check the tests *can't* do for you.
   ```
   git -C <project> ls-tree -r --name-only run/<slug>-<runId>
   git -C <project> diff main..run/<slug>-<runId>
   ```

2. **What do the numbers say?**
   Open `state.json`. `status: passed` with `scores` all ≥ 85 is the clean case.
   `halted` means a cap stopped it — read `haltReason` and the transcript to see
   whether it was close or stuck.

3. **Read the transcript.**
   `runs/<runId>/transcript.md` shows where the generator and evaluator diverged —
   where the evaluator pushed back, what it docked points for, how the code
   evolved across retries. If a score looks too high or too low, this is where you
   find out why.

**The trust signal — the score gap.** The evaluator earns its keep only if it can
*tell good from bad*. The proof is that on-goal code scores high (>85) while
off-goal-but-test-passing code scores low (<85) against the same contract — a wide
gap. A gap means it's judging the real code, not rubber-stamping the test result.
(This is exactly what the C1/C2 verification run confirmed: on-goal `sum.js` = 100,
off-goal `isPalindrome.js` = 0.)

**Rule of thumb:** green tests + on-goal code + a real score gap = trust it.
Green tests but off-goal code = the loop drifted; don't merge.

---

## Good to know (v1 limits)

- **Attended, not autonomous.** You start it and watch; it's not a scheduled
  overnight job yet.
- **No Docker sandbox yet.** The generator runs shell commands directly in the
  worktree on your machine. Fine for trusted work you're watching; hardening is a
  later phase.
- **Nothing auto-merges.** The branch is always left for you to review. That human
  merge gate is a feature, not a missing step.
