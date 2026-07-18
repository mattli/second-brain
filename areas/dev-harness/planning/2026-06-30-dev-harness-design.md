---
created_at: 2026-06-30
last_updated: 2026-07-15
status: in-progress-phase-2
type: design-spec
---

# dev-harness — Adversarial Agentic-Dev Loop (Design Spec)

> **Status: PHASE 1 SHIPPED — now in phase ② "Harden."** Original design resolved 2026-07-06; re-sequenced 2026-07-13 into five phases after the first real run (see [Phasing](#phasing-prove--harden--automate) and [Resolved 2026-07-13](#resolved-2026-07-13)). Current milestone: make the attended loop trustworthy on one project. Build phase ② when ready — it needs its own step-by-step implementation plan first.

## TLDR

A standalone TypeScript sandbox that runs an **automatic long-running agentic development loop** built around three separated roles — **planner**, **generator**, **evaluator** — with **adversarial contract negotiation** and **blind evaluation** driving quality. Ships with rich human-readable trace logging, hard budget stops, and git-worktree isolation. v1 is *attended* (you kick it off from the CLI and watch); Docker sandboxing, scheduling, and full autonomy are earned in later phases.

The design is a direct implementation of the Planner-Generator-Evaluator harness pattern documented in [[loop-engineering]] (Anthropic's Prabaker/Wilson work), the contract-negotiation mechanism, blind/independent evaluation, the five building blocks, and trace-reading as the primary debugging loop.

Source reference: `~/second-brain/resources/wiki/tools/loop-engineering.md`

---

## Goals

1. **A reusable sandbox** an AI product builder can point at any project and say "build X," then walk away for a bounded window and come back to reviewable work.
2. **Adversarial refinement** between subagents so output quality exceeds any single-agent loop — specifically via contract negotiation + blind evaluation, not a free-for-all debate.
3. **Modularity above all** — each part has one job, a typed interface, and is understandable/testable in isolation. Easy to navigate and extend.
4. **Trace logging as a first-class citizen** — you can sit down and read what each agent did and where its judgment diverged from yours.
5. **Safety by construction** — hard budget stops from day one; a human merge gate; disposable worktrees.

## Non-Goals (v1)

- No Docker sandbox in v1 — deferred as a *reliability* call for attended runs, not a blanket Phase-3 default; revisit on *security* grounds before unattended runs or untrusted-dependency exposure (see Sandboxing).
- No scheduler / cron / unattended overnight runs yet (Phase 3).
- No notification channel (Slack/Telegram pings) yet (Phase 3).
- No automated hill-climbing loop that rewrites its own prompts (Phase 3).
- No Playwright / design-taste evaluation yet (Phase 2).
- No refuter panel yet (Phase 3).
- No target-project skills layer yet — v1 hardcodes a single project's context; the skills abstraction (codified conventions/build steps/gotchas the generator + evaluator read instead of re-deriving) lands when the harness goes multi-project. *Deferred consciously, not by omission.*

Deferring these is deliberate — it follows the article's **prove → harden → automate** build order. We prove the hard part (adversarial loop quality) by hand before automating it. "Skipping ahead is how loops blow up while you sleep."

---

## Key Decisions (from brainstorming, 2026-06-30)

| Decision | Choice | Rationale |
|---|---|---|
| **Substrate** | Standalone git repo; git-worktree isolation (inner, v1) + Docker (outer). Docker deferral is a reliability call, not a blanket Phase-3 one — see Sandboxing. | Standalone repo = modularity + reuse, not coupled to NanoClaw (wrong shape, burns shared Max budget). Worktrees give git-disposability, *not* a security boundary; Docker is the real isolation and its timing is revisited on security grounds before untrusted-dependency or unattended exposure. |
| **Target / verifier** | Pluggable `Verifier` interface; ship `TestSuiteVerifier` first | Deterministic + objective gate works on any codebase. Playwright design-taste gate added Phase 2. Interface = modularity backbone. |
| **Adversarial shape** | Contract negotiation + blind eval | The article's proven pattern. Full three-way debate backfires (evaluator agrees with reasoning it sees; mutual debate converges on shared blind spots). |
| **Tracing** | Rich human-readable JSONL + rendered markdown transcript | Trace-reading is the primary debugging loop. Automation on top (analyst sub-agent, hill-climbing) deferred. |
| **Stack** | TypeScript, Claude Agent SDK | First-class SDK support; matches builder fluency (NanoClaw). |
| **Models by role** | Planner + generator = Opus; evaluator configurable (Opus default, Sonnet option); all per-run overridable | Planning errors cascade → strongest model. |
| **Hard stops** | max-iteration, no-progress detection, token/$ ceiling, run wall-clock deadline — all v1 | Article is emphatic: these ship day one, not later. Defaults in [Loop-Tuning Defaults](#loop-tuning-defaults-v1). |
| **v1 autonomy** | Attended core loop (autonomy ladder L1–L2) | Prove loop quality by hand before automating. |

---

## Design Principle — Harness-as-Product

The "thin harness, fat skills" rule ([[agent-harness]]) — logic lives in skills/prompts, not scaffolding — governs building an agent *to do a task*: keep the scaffolding generic and reusable, push task-specific behavior into swappable skills. NanoClaw is that shape and stays thin accordingly.

dev-harness is a different category: **the harness is the product.** The orchestrator, contract-negotiation, verifier, evaluator, budget, state, and trace modules are the irreducible mechanism of the planner-generator-evaluator loop itself — not scaffolding wrapped around a separate task. There is no other task the harness serves; the mechanism *is* the deliverable. So on the *thickness* axis the rule doesn't apply — thinning the harness would delete the point.

The rule still binds on the *behavior-location* axis: don't hardcode behavior that should be externalized. Two places that lands here — (1) agent behavior stays in editable markdown (`prompts/*.md`), never buried in TS; (2) codified knowledge about the *target project* the harness is pointed at belongs in a **skills layer** the generator + evaluator read, not baked into prompts or re-derived each run (deferred for v1 — see Non-Goals).

Restated: the principle was never thin-vs-fat *harness* — it's *don't hardcode what should be swappable.* Here that means keep the fat harness (it's the product) and keep behavior in prompts + skills.

---

## Sandboxing — Two Senses

"Sandbox" carries two meanings in this spec; they have different answers.

1. **Standalone project** (organizational) — own repo, pointable at any project, not bolted into NanoClaw. Buys modularity and reuse, *not* containment. Unambiguously right (see Substrate).
2. **Execution isolation** (safety) — the boundary around what a run can do to the host. This is the live question.

On the isolation axis the two layers are **not** interchangeable:

- **Git worktrees (inner)** isolate git *state* — disposable branches, cattle-not-pets, a bad run thrown away. But code inside a worktree still runs as you, with your filesystem, network, and env (incl. API keys). Worktrees are git-hygiene, **not a security boundary.**
- **Docker (outer)** is the actual boundary — confined filesystem, controllable network, no host secrets unless mounted.

Why isolation isn't only a Phase 3 concern: Docker is filed under *automate* (Phase 3) alongside scheduling, which treats sandboxing as an *autonomy* problem. But half of what it guards against is **arbitrary code execution**, live from the first attended run — an honest destructive command, or a dependency's install hook, both faster than you can react. "Attended" stops a *runaway loop*; it does not stop a *single bad command*. Autonomy risk and code-execution risk are different clocks, and flat Phase-3 deferral collapses them.

**v1 posture:** worktree-only attended is a *defensible risk acceptance* — but a conscious one, not a category default. Cheap mitigations even without full Docker: run the loop's working dir well away from the vault and anything precious, and scope the generator's shell env to what a run needs (don't hand it the whole `.env`). Pulling a minimal container forward is low-cost here since Docker already runs on the Mini for NanoClaw — which weakens the main reason to defer it.

---

## Architecture

### Module map

Each module has one job, a typed interface, and can be understood/tested alone.

| Module | Job | Depends on |
|---|---|---|
| `cli/` | Entry point: `loop run --goal "…" --project ./app`. Streams progress to terminal. | config, orchestrator |
| `orchestrator/` | The loop driver. Runs phases in order, enforces stops, advances sprints. Kept thin. | everything below |
| `agents/planner.ts` | One-line goal → coarse sprints (deliberately *not* granular — a planning error at that level cascades through every sprint). | trace |
| `agents/generator.ts` | Builds code against the frozen contract, inside the worktree. | workspace, trace |
| `agents/evaluator.ts` | Grades artifact vs contract, **blind** to the generator's reasoning. | verifier, trace |
| `contract/` | The adversarial core: manages generator⇄evaluator markdown negotiation, versions contracts, detects mutual agreement. | trace |
| `verifier/` | Pluggable deterministic gate. `Verifier` interface + `TestSuiteVerifier` (v1). Playwright gate is a later file. | — |
| `workspace/` | Creates/cleans git worktrees per run (disposable — "cattle not pets"). | — |
| `trace/` | `TraceWriter` (JSONL events) + `TranscriptRenderer` (markdown for eyeballing). | — |
| `state/` | Durable run state as JSON (what was tried, contract version, scores, status). Survives restart. | — |
| `budget/` | Hard stops checked every turn: max-iteration, no-progress detection, token/$ ceiling, run wall-clock deadline. Defaults in Loop-Tuning Defaults. | trace |
| `config/` | Per-run config: goal, model overrides, caps, which verifier, worktree path. | — |
| `prompts/*.md` | All three agents' system prompts as **editable markdown**, not buried in TS — so trace-reading → prompt-tuning is a one-file edit. | — |
| `skills/` | Codified knowledge about the *target project* (conventions, build steps, known-gotchas) the generator + evaluator read so they don't re-derive the project each run. **Deferred for v1** (single-target hardcode); the "fat skills" half of the design principle above. | — |

### Proposed repo layout

```
dev-harness/
  src/
    cli/
    orchestrator/
    agents/{planner,generator,evaluator}.ts
    contract/
    verifier/{types.ts, test-suite.ts}
    workspace/
    trace/
    state/
    budget/
    config/
  prompts/          # planner.md, generator.md, evaluator.md, contract-negotiation.md
  runs/             # per-run trace + state output (gitignored)
  tests/
  README.md
```

`prompts/` as editable markdown matters twice: it keeps prompts out of code (modularity) and it makes the trace-reading → prompt-tuning loop a one-file edit.

---

## Loop Lifecycle (one run)

```
loop run --goal "build X" --project ./app
  → config load → budget init → trace dir → worktree create
  → [PLAN]      planner(goal) → sprints[]            (coarse, high-level)
  → for each sprint:
      [NEGOTIATE] generator proposes contract ⇄ evaluator critiques
                  → until BOTH agree (or negotiation-round cap) → contract vN frozen
      [GENERATE]  generator builds against contract vN in the worktree
      [EVALUATE]  verifier runs tests/build/lint → hard signal
                  evaluator (BLIND: fresh session, sees only contract + artifact)
                  → score + findings
      [DECIDE]    score ≥ threshold → sprint done, next sprint
                  else → findings back to generator → re-generate
                         (budget / no-progress / max-iter checked EACH turn)
  → final state written → transcript rendered → run branch left in target repo for YOUR review (merge gate)
```

### The three adversarial guarantees, made structural

1. **Contract negotiation is its own phase, before any code.** Generator and evaluator pass markdown files back and forth ("I'll build X, verify by testing Y" / "scope too big, tests too weak, missed edge case Z") until both agree on granular, testable criteria. Contract granularity drives critique quality — vague criteria → vague critiques the generator shrugs off. The evaluator later grades against *the contract*, not the planner's original spec.
2. **Blind evaluation.** The evaluator runs in a fresh SDK session seeing only `contract + artifact` — never the generator's reasoning or transcript. Anthropic found feeding the evaluator the generator's traces made it *worse*: it starts agreeing with the reasoning that produced the output instead of judging the output on its own terms.
3. **Human merge gate.** The loop never merges. On a passing run it commits to a per-run branch (`run/<goal-slug>-<run_id>`) in the *target* repo's local git and stops; the rendered transcript is your review artifact, and you merge/PR it yourself. (Autonomy ladder L2 — "a human must review before anything irreversible.") Auto-draft-PR handoff is a Phase 3 unattended-mode feature — see [Resolved Decisions](#resolved-decisions).

### Separation of concerns: verifier vs evaluator

- **`verifier/`** = deterministic, non-LLM. Runs tests/build/lint, returns `{passed, findings}`. Pure signal.
- **`agents/evaluator.ts`** = agentic judgment. *Uses* the verifier's hard signal, then layers rubric-based grading on top and produces the score + findings the DECIDE step reads.

Keeping them separate means the deterministic gate is unit-testable without any LLM, and the judgment layer is swappable.

---

## Error Handling & Stops

- `budget/` checked every turn → on any stop (max-iteration, no-progress, token/$ ceiling, run wall-clock deadline), clean halt + reason written to state and trace.
- Transient API/SDK errors → bounded retry at the agent-invoke layer (mirrors NanoClaw's credential-proxy retry pattern: bounded attempts + wall-clock deadline).
- Any phase failure → traced, state marked, graceful halt. Never corrupt state; never leave the loop turning in place.
- Writes idempotent where feasible; worktree is disposable, so a failed run is thrown away, not repaired.

---

## Loop-Tuning Defaults (v1)

Starting dial positions, all per-run overridable via `config/`. Philosophy per [[loop-engineering]]: **start strict, loosen once real runs calibrate** (the explicitness gradient). The two host-level backstops — the per-run `$` ceiling and the run wall-clock deadline — trip regardless of per-sprint logic, so a run always halts gracefully even if a sprint's own caps misbehave.

| Knob | Default | Rationale |
|---|---|---|
| Score scale | 0–100 rubric | Evaluator grades artifact vs contract on a weighted 0–100 rubric. Legible in traces. |
| Advance threshold | **≥ 85** | Sprint passes only at 85+. Strict start — churn beats advancing mediocre work. Most likely knob to loosen after calibration. |
| No-progress | **2 flat iterations** (< +5 pts each) | Two consecutive re-generations improving < 5 pts → "stuck," halt the sprint. Catches thrashing early. |
| Max iterations / sprint | **6** | Hard cap on regenerate cycles per sprint regardless of score. Backstop if no-progress doesn't trip. |
| Negotiation round cap | **5 rounds** | One round = generator proposes ⇄ evaluator critiques. Force a contract freeze at 5. (Retro-game demo's "27" was *criteria* count, not rounds.) |
| Per-run $ ceiling | **$10** | Hard dollar stop, checked every turn. A runaway costs a coffee, not a paycheck. |
| Run wall-clock deadline | **30 min** | v1 is attended; a stuck run can't silently burn while you step away. (Distinct from the per-invoke retry deadline in Error Handling.) |

Worst-case per-sprint spend ≈ (5 negotiation rounds × 2 agents) + (6 iterations × generate + evaluate); the `$10` / 30-min ceilings are the real backstops. Expect the **85 threshold** (may over-churn) and the **$10 ceiling** (an ambitious multi-sprint goal on Opus can exceed it — for v1 prove-out, hitting the ceiling and stopping *is* correct, informative behavior) to need the earliest tuning.

---

## Trace & State Formats

- **Trace event (JSONL, append-only, per run):** `{ ts, run_id, sprint, phase, agent_role, contract_version, input_digest, tool_calls[], output_digest, tokens, cost }`. One line per turn/tool-call.
- **Transcript (markdown, rendered from JSONL):** human-readable narrative of the run for eyeball review — the artifact you actually read to find where judgment diverged.
- **State (JSON, per article's preference over markdown — models overwrite JSON less):** `{ run_id, goal, status, sprints[], current_sprint, contract_version, scores[], iterations, budget_spent, halt_reason }`. Timestamped-breadcrumb pattern (what was tried, evaluated, found, fixed) so a human or later run can pick up where this stopped.

---

## Testing Strategy

- **Unit** — pure modules against their interfaces: `verifier`, `budget` (all four stops), contract-agreement detection, `trace` writer, `state` serialization.
- **Integration** — one cheap-model test: does the loop turn, freeze a contract, and halt on budget?
- **E2E smoke** — trivial goal ("a function returning 2+2 with a passing test") through the full loop under a tight cap. Proves the whole pipeline end to end for a few cents.

---

## Phasing (Prove → Harden → Automate)

Status as of 2026-07-13. Phase 1 shipped; two unplanned surfaces (legible runs, run
observability) shipped on top of it. We are now in "Harden." The old three-phase plan
has been re-sequenced into five; the cap/verification/dashboard decisions are captured
in [Resolved 2026-07-13](#resolved-2026-07-13).

**① Prove — DONE.** Attended core loop (planner / contract negotiation / generator /
blind evaluator), git worktrees, `TestSuiteVerifier`, rich traces, budget stops, CLI.
Shipped on top: **legible runs** (human-readable transcript + dated run folders) and
**run observability** (contract freeze reason + frozen contract embedded in the trace).

**② Harden — "trustworthy on one project."** ✅ **Stop-early core SHIPPED 2026-07-15**
(`main` @ `0356ce2`): caps rework (wall-clock primary/per-sprint, dollar off-by-default,
usage-limit graceful pause), ≤6 sprint cap in code, honest CLI flags, per-sprint tests,
`FINAL SCORE:` marker (closes the score-misread residual), "Paused not failed" summary.
Built subagent-driven (fresh implementer + independent reviewer per task); whole-branch
reviewed on opus (one usage-limit over-match caught + fixed); verified live ($0.42 run
scored 98/100, the sprint's contract required and the generator produced `sum.js` +
`sum.test.js`). One watch-item: the real-SDK usage-limit *error shape* is still
unconfirmed (only observable when an actual limit is hit). **Remaining in ②: the
read-only dashboard** (below). — Make the attended loop reliable
enough to actually reach for. Resolves the three stop-early items from the csv2json
trial (2026-07-07) as one coherent design:

- **Caps rebuilt around a subscription, not an API bill.** Wall-clock is the **primary
  cap, scoped per-sprint** (generous default, 30 min/sprint); the dollar figure is
  **informational and off by default**; an Anthropic **usage-limit becomes a graceful
  first-class stop**; hitting any cap is a **pause, not a failure**; caps are **honestly
  labeled as approximate** (checked between steps, can overshoot by one in-flight step).
- **Enforce the sprint-count cap in code (≤6)** so the worst-case run length is bounded
  in fact, not just by a planner instruction.
- **Honest CLI** — wire `--wall-clock-ms` (now the primary cap) and fix the docs so every
  advertised flag is real.
- **Every sprint leaves tested, working code** — the planner stops deferring tests to a
  terminal sprint; each sprint is a vertical slice (behavior + its tests) whose contract
  includes test criteria, so the generator writes tests as it goes; an early stop is
  reported honestly ("sprint N incomplete, unverified").
- Fold in the `parseScore` pre-verdict residual (last known score-misread path).
- **Read-only live dashboard** — stage 1 of the [Dashboard](#dashboard) vision.

**③ Breadth — "works on any project": the skills layer.** Today the harness hardcodes a
single target project's context. The skills layer lets the generator + evaluator read a
project's conventions / build steps / gotchas so the harness can be pointed at any repo.
The natural milestone after "trustworthy": solid on one project → portable across many.
(Promoted from the old "Deferred" list.)

**④ New capability — the evaluation gate (was Phase 2).** Playwright design-taste gate
(`Verifier` #2, weighted design/originality/craft/functionality rubric with few-shot
calibration) + trace-analyst sub-agent (point it at a batch of runs to surface recurring
failure patterns).

**⑤ Automate — the autonomy ladder (was Phase 3).** Docker sandbox boundary → cron
scheduling → notification channel (interrupt-driven review) → **the hard-stop machinery**
(true mid-work interrupt + hung-call guard + hard *total* time ceiling — bundled here
because all three only become load-bearing once no one is watching) → refuter panel
(dedicated break-it sub-agent) → hill-climbing loop (reads traces, rewrites
prompts/rubric). Plus **dashboard stage 2** (config editing + launch/stop control panel),
which wants real usage behind it before it's designed. Each promotion up the autonomy
ladder triggers a **security review**, not just a reliability review.

## Dashboard

An internal, local web dashboard for operating the harness — born from the same friction
as legible runs (reading a raw transcript over SSH is painful). Staged in two increments:

- **Stage 1 — read-only live monitor (Harden, ②).** A local web view of the active run:
  goal, current sprint / round / step, scores so far, elapsed time and spend —
  auto-refreshing from the run folder. Safe to build now because it only renders data the
  run already writes; the one addition needed is slightly finer-grained progress events so
  it can show *which negotiation round* it's in, not just the phase. It is "the transcript,
  but live and formatted."
- **Stage 2 — control panel (later, after real usage).** Edit caps/config and launch/stop
  runs from a button. Deferred because launching means a backend that spawns and supervises
  the harness process — the real work — and because the controls should be designed around
  real usage, not guessed at up front.

**Design constraint (locked now, both stages): config has a single source of truth.** One
config object; the CLI, a config file, and the dashboard are all just *editors* that write
to it. This keeps the surfaces from drifting — the same class of bug as the CLI advertising
flags that don't exist.

---

## Resolved Decisions

Open questions from the 2026-06-30 brainstorm, resolved 2026-07-06.

1. **Name** — `dev-harness` (chosen 2026-07-01; plain/internal, not branded).
2. **Score threshold & no-progress** — advance a sprint at **≥ 85/100**; **no-progress = 2 consecutive re-generations improving < 5 pts**. Strict start, loosen after calibration. See [Loop-Tuning Defaults](#loop-tuning-defaults-v1).
3. **Negotiation round cap** — **5 rounds** (generator proposal ⇄ evaluator critique), then force a contract freeze. See Loop-Tuning Defaults.
4. **Budget defaults** — **$10** per-run hard `$` ceiling, **30-min** run wall-clock deadline, **6** max iterations/sprint. All per-run overridable. See Loop-Tuning Defaults.
5. **Approval handoff / merge-gate** — the loop **never merges**. It commits generated work to a per-run branch (`run/<goal-slug>-<run_id>`) in the *target* repo's local git — **one commit per passing sprint, plus a partial-work commit on any halt** — *before* the worktree is force-removed, so the branch survives **non-empty** and reviewable (the commit is for review, not endorsement; the score + transcript carry the quality signal). The rendered transcript is the review artifact; you merge/PR manually. **Auto-draft-PR handoff deferred to Phase 3** (unattended mode) — it requires a *pre-existing* remote and never auto-creates one (use a remote only if one already exists, else fall back to local). Rationale: pushing to a remote is an outward-facing action; v1 stays fully contained, and a PR buys little while you're watching. *(Implemented 2026-07-06. The commit-before-removal step was essential: without it, `git worktree remove --force` discarded the uncommitted work and the branch was empty — a guarantee that only held at the real-git boundary. See `~/dev-harness/docs/solutions/conventions/test-guarantees-at-their-boundary.md`.)*
6. **Repo location** — the dev-harness repo lives at **`~/dev-harness`** as a standalone **private** GitHub repo, remote created upfront. Set repo-local `user.email` to the noreply form (`mattli@users.noreply.github.com`) **before the first commit** to avoid the GH007 private-email rejection.

### Resolved during implementation (2026-07-06)

Not in the original brainstorm — these surfaced when the built loop turned against the real SDK and produced on-contract-but-off-goal output (it committed `isPalindrome.js` for a "sum" goal, scored 100). Full rationale in [[2026-07-06-c1-c2-adversarial-loop-design-note]].

- **C1 — contract authorship.** **Option A**: the generator proposes the contract ⇄ the evaluator critiques it, with **both now seeing the goal + sprint** (the first build dropped the sprint on the floor — the generator invented contracts from nothing). Adversarial pressure comes from the evaluator's critique + the mutual-agreement freeze + the later independent blind grade, not from denying the generator authorship. **Option B** (evaluator authors the contract; generator only builds) is held as an **evidence-gated fallback** if traces show the generator gaming a lenient bar.
- **C2 — evaluator artifact boundary.** During EVALUATE the evaluator sees **only the frozen contract + the artifact (the worktree diff) + the verifier result** — never the generator's transcript, its commit messages, or the goal/sprint (it grades against the *contract*, per guarantee #2; C1 makes the contract goal-faithful). The boundary is **enforced by a test** on the constructed prompt (it must contain the diff and exclude transcript/commit-messages/goal), not by the prompt wording alone. Editorializing code comments ride along in the diff and are **de-weighted by instruction**, with the non-LLM verifier as the hard signal.

### Resolved 2026-07-13

Surfaced by the first real external run (csv2json trial, 2026-07-07) and settled in a
product-planning pass on 2026-07-13. The three "stop-early" backlog items turned out to be
one question — *what should a run guarantee when it stops early?* — resolved together.

- **Caps measured the wrong unit for a subscription.** The dollar ceiling was designed as
  if paying per-token; on a subscription it's a notional number, not real money, while the
  true constraint is the plan's usage window. Decision: **wall-clock is the primary cap,
  scoped per-sprint** (generous default 30 min/sprint — the planner is expected to split
  work into manageable sprints); the **dollar figure stays visible as a "what did this
  cost" signal but does not halt by default** (opt-in for pay-per-token use); an **Anthropic
  usage-limit is caught and handled as a graceful first-class stop** (commit partial work,
  say so plainly, don't crash). *Per-sprint* (not total-run) was chosen so a slow early
  sprint can't starve later ones — the "don't fail easily" goal. A **hard total-run ceiling
  is deferred to ⑤**, because while attended the human is the total-time backstop.
- **A cap is a pause, not a failure.** A halted run always ends with the partial work
  committed to its branch and a plain-language transcript note — never lost work.
- **Caps are honest about being approximate.** The budget is checked *between* the loop's
  major steps, not during them, so a run stops at the next step boundary after crossing a
  limit and can overshoot by one in-flight step (typically a few minutes). While attended
  that's fine — the human is the real stop button. A precise mid-step interrupt, a
  hung-call guard, and a hard total-time ceiling all need the same "interrupt an in-flight
  call" machinery and all only matter unattended, so they're **built once, together, in ⑤**.
- **Enforce the sprint-count cap in code (≤6).** The planner prompt requests 3–6 sprints
  but nothing enforced it; without a code cap the worst-case run length is unbounded.
  Enforcing it makes "6 sprints × 30 min = 3h worst case" true in fact, not just by
  instruction.
- **Verification moves into every sprint.** The planner no longer schedules "write the
  tests" as a terminal sprint (the trial halted before reaching it, leaving unverified
  work). Each sprint is a vertical slice whose contract includes test criteria; the
  generator — which already authors both code and tests — writes tests as it goes. Grounded
  in [[loop-engineering]]: "instrument the gate before you scale the loop." An early stop
  then leaves N verified sprints instead of a pile of unchecked code.
- **Honest CLI.** Wire `--wall-clock-ms`; remove or wire any advertised flag that isn't real.
- **Dashboard (new direction).** An internal local web dashboard, staged monitor-first —
  see [Dashboard](#dashboard).

### Deferred items — now sequenced (updated 2026-07-13)

The former "deferred, not resolved" items now have homes in the phasing above:

- **Target-project skills layer** → promoted to phase **③** (was "Phase 2+"). See Non-Goals.
- **Single hung agent call / mid-work interrupt (was Phase 1.5)** → phase **⑤**, bundled
  with the hard-stop machinery (mid-work interrupt + hung-call guard + hard total-time
  ceiling share one AbortController + per-call-deadline mechanism). TODO still in `invoke.ts`.
- **`parseScore` pre-verdict-reasoning residual** → folded into phase **②** hardening.
- **Docker / execution-isolation timing** → phase **⑤**, but note the risk is *not* purely
  an autonomy concern: arbitrary code execution is live from the first attended run. See
  [Sandboxing](#sandboxing--two-senses); v1 runs worktree-only-attended (a conscious risk
  acceptance).

---

## Provenance

Brainstormed 2026-06-30 via the superpowers brainstorming flow. Grounded in [[loop-engineering]]. Approved decisions captured above; this doc is the pre-implementation design spec. Next step when ready: turn this into a step-by-step implementation plan.

Re-sequenced 2026-07-13 (brainstorming pass) after the first real external run: Phase 1 marked done, legible-runs + observability recorded as shipped, the three stop-early backlog items resolved as one "caps + verification" design, the skills layer promoted to its own phase, and the dashboard added as a monitor-first direction. See [Resolved 2026-07-13](#resolved-2026-07-13).
