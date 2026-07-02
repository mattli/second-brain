---
created_at: 2026-06-30
last_updated: 2026-06-30
status: work-in-progress
type: design-spec
---

# dev-harness — Adversarial Agentic-Dev Loop (Design Spec)

> **Status: WORK IN PROGRESS.** Draft for review. Decisions below are approved-in-principle from the brainstorming session on 2026-06-30; treat open questions at the bottom as live.

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

- No Docker sandbox yet (Phase 3).
- No scheduler / cron / unattended overnight runs yet (Phase 3).
- No notification channel (Slack/Telegram pings) yet (Phase 3).
- No automated hill-climbing loop that rewrites its own prompts (Phase 3).
- No Playwright / design-taste evaluation yet (Phase 2).
- No refuter panel yet (Phase 3).

Deferring these is deliberate — it follows the article's **prove → harden → automate** build order. We prove the hard part (adversarial loop quality) by hand before automating it. "Skipping ahead is how loops blow up while you sleep."

---

## Key Decisions (from brainstorming, 2026-06-30)

| Decision | Choice | Rationale |
|---|---|---|
| **Substrate** | Standalone git repo; worktree isolation inner, Docker outer (deferred to Phase 3) | Literal "sandbox," reusable across every product, most modular. Not coupled to NanoClaw (which is a chat assistant, wrong shape, and would burn its shared Max budget). |
| **Target / verifier** | Pluggable `Verifier` interface; ship `TestSuiteVerifier` first | Deterministic + objective gate works on any codebase. Playwright design-taste gate added Phase 2. Interface = modularity backbone. |
| **Adversarial shape** | Contract negotiation + blind eval | The article's proven pattern. Full three-way debate backfires (evaluator agrees with reasoning it sees; mutual debate converges on shared blind spots). |
| **Tracing** | Rich human-readable JSONL + rendered markdown transcript | Trace-reading is the primary debugging loop. Automation on top (analyst sub-agent, hill-climbing) deferred. |
| **Stack** | TypeScript, Claude Agent SDK | First-class SDK support; matches builder fluency (NanoClaw). |
| **Models by role** | Planner + generator = Opus; evaluator configurable (Opus default, Sonnet option); all per-run overridable | Planning errors cascade → strongest model. |
| **Hard stops** | max-iteration, no-progress detection, token/$ ceiling — all v1 | Article is emphatic: these ship day one, not later. |
| **v1 autonomy** | Attended core loop (autonomy ladder L1–L2) | Prove loop quality by hand before automating. |

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
| `budget/` | Three hard stops: max-iteration, no-progress detection, token/$ ceiling. Checked every turn. | trace |
| `config/` | Per-run config: goal, model overrides, caps, which verifier, worktree path. | — |
| `prompts/*.md` | All three agents' system prompts as **editable markdown**, not buried in TS — so trace-reading → prompt-tuning is a one-file edit. | — |

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
  → final state written → transcript rendered → worktree left for YOUR review (merge gate)
```

### The three adversarial guarantees, made structural

1. **Contract negotiation is its own phase, before any code.** Generator and evaluator pass markdown files back and forth ("I'll build X, verify by testing Y" / "scope too big, tests too weak, missed edge case Z") until both agree on granular, testable criteria. Contract granularity drives critique quality — vague criteria → vague critiques the generator shrugs off. The evaluator later grades against *the contract*, not the planner's original spec.
2. **Blind evaluation.** The evaluator runs in a fresh SDK session seeing only `contract + artifact` — never the generator's reasoning or transcript. Anthropic found feeding the evaluator the generator's traces made it *worse*: it starts agreeing with the reasoning that produced the output instead of judging the output on its own terms.
3. **Human merge gate.** The loop never merges. It leaves the worktree for your review (autonomy ladder L2 — "a human must review before anything irreversible").

### Separation of concerns: verifier vs evaluator

- **`verifier/`** = deterministic, non-LLM. Runs tests/build/lint, returns `{passed, findings}`. Pure signal.
- **`agents/evaluator.ts`** = agentic judgment. *Uses* the verifier's hard signal, then layers rubric-based grading on top and produces the score + findings the DECIDE step reads.

Keeping them separate means the deterministic gate is unit-testable without any LLM, and the judgment layer is swappable.

---

## Error Handling & Stops

- `budget/` checked every turn → on any of the three stops (max-iteration, no-progress, token/$ ceiling), clean halt + reason written to state and trace.
- Transient API/SDK errors → bounded retry at the agent-invoke layer (mirrors NanoClaw's credential-proxy retry pattern: bounded attempts + wall-clock deadline).
- Any phase failure → traced, state marked, graceful halt. Never corrupt state; never leave the loop turning in place.
- Writes idempotent where feasible; worktree is disposable, so a failed run is thrown away, not repaired.

---

## Trace & State Formats

- **Trace event (JSONL, append-only, per run):** `{ ts, run_id, sprint, phase, agent_role, contract_version, input_digest, tool_calls[], output_digest, tokens, cost }`. One line per turn/tool-call.
- **Transcript (markdown, rendered from JSONL):** human-readable narrative of the run for eyeball review — the artifact you actually read to find where judgment diverged.
- **State (JSON, per article's preference over markdown — models overwrite JSON less):** `{ run_id, goal, status, sprints[], current_sprint, contract_version, scores[], iterations, budget_spent, halt_reason }`. Timestamped-breadcrumb pattern (what was tried, evaluated, found, fixed) so a human or later run can pick up where this stopped.

---

## Testing Strategy

- **Unit** — pure modules against their interfaces: `verifier`, `budget` (all three stops), contract-agreement detection, `trace` writer, `state` serialization.
- **Integration** — one cheap-model test: does the loop turn, freeze a contract, and halt on budget?
- **E2E smoke** — trivial goal ("a function returning 2+2 with a passing test") through the full loop under a tight cap. Proves the whole pipeline end to end for a few cents.

---

## Phasing (Prove → Harden → Automate)

- **Phase 1 (this spec):** Attended core loop — planner/contract-negotiation/generator/blind-evaluator, worktrees, `TestSuiteVerifier`, rich traces, budget stops, CLI. No Docker/scheduler.
- **Phase 2:** Playwright design-taste gate (`Verifier` #2, weighted design/originality/craft/functionality rubric with few-shot calibration) + trace-analyst sub-agent (point it at a batch of runs to surface recurring failure patterns).
- **Phase 3:** Docker sandbox boundary → cron scheduling → notification channel (interrupt-driven review) → refuter panel (dedicated break-it sub-agent) → hill-climbing loop (reads traces, rewrites prompts/rubric). Each promotion up the autonomy ladder triggers a security review, not just a reliability review.

---

## Open Questions (to resolve on next pass)

1. **Name** — resolved: `dev-harness` (chosen 2026-07-01; plain/internal, not branded).
2. **Score threshold & no-progress definition** — what score gate advances a sprint, and how many flat iterations count as "no progress"? Probably start explicit/strict, then loosen (Zakariasson's explicitness gradient).
3. **Negotiation round cap** — how many contract back-and-forths before forcing a freeze? (Retro-game demo negotiated 27 *criteria*; that's criteria count, not round count — need a round cap to bound cost.)
4. **Budget defaults** — starting token/$ ceiling and max-iteration count for a typical run.
5. **Where does the built code land on approval?** Merge worktree → branch → you PR it yourself? Define the handoff.
6. **Repo location** — where does the `dev-harness` repo itself live on disk (`~/dev-harness`?), and does it get its own GitHub remote (noreply-email caveat applies on first push)?

---

## Provenance

Brainstormed 2026-06-30 via the superpowers brainstorming flow. Grounded in [[loop-engineering]]. Approved decisions captured above; this doc is the pre-implementation design spec. Next step when ready: turn this into a step-by-step implementation plan.
