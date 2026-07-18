# Trace Contract Observability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a run's transcript/trace self-explanatory about its contracts — record *why* each contract froze (evaluator agreement vs. forced at the round cap) and *what* each score was measured against (the frozen criteria).

**Architecture:** Two related observability gaps, folded into one pass because both touch `negotiate.ts` and `run.ts`'s NEGOTIATE handling. (1) `negotiate()` currently discards *why* it froze — it returns a bare `Contract` whether the evaluator agreed or the round cap forced the freeze; we change it to return `{ contract, freezeReason }` and surface the reason in run state + transcript. (2) The frozen contract's criteria live only in memory; we embed them in the NEGOTIATE trace event so `trace.jsonl` is self-contained and the rendered transcript shows what each sprint's score was graded against.

**Tech Stack:** TypeScript (ESM, `.js` import specifiers), Vitest, Zod. Node built-ins only.

## Global Constraints

- ESM import specifiers end in `.js` even for `.ts` sources (e.g. `import ... from "./types.js"`).
- Test command: `npm test` (= `vitest run`); the gated E2E suite stays skipped unless `RUN_E2E=1`. Typecheck: `npm run typecheck`.
- Follow the existing single-source-of-truth state rule (`src/orchestrator/run.ts:45-53`): mutate in-memory `state` and persist the same patch via `update()`; never write disk-only.
- Follow the existing trace idiom of encoding a semantic outcome in `outputDigest` as a short string (mirrors `halt:${reason}` at `run.ts:75`).
- Commit messages end with the repo trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- We are on `main`; create branch `feat/trace-contract-observability` before the first commit.

## Design decisions (and one considered-and-dropped alternative)

- **Freeze reason as a structured value, not a parsed string.** `negotiate()` returns `{ contract, freezeReason }` where `freezeReason: "agreement" | "round-cap"`. Agreement is checked before the round-cap so a round that both agrees *and* is the last round reports `"agreement"` (the real reason). Consistent with the repo lesson "don't parse model output by position — key on a marker": the reason is produced at its source, not re-derived downstream.
- **`contractFreezeReason` on `RunState` is a snapshot**, mirroring the existing `contractVersion` field (single current value, overwritten each sprint). The per-sprint history lives in `trace.jsonl`'s NEGOTIATE events; state.json is the point-in-time view. This matches how `contractVersion` already works.
- **Embed the frozen contract in the NEGOTIATE trace event** (`contract?: Contract` on `TraceEvent`) rather than dumping a separate `contract-sprint<N>.json`. Rationale: the primary debugging loop is *reading the transcript*, which renders from the trace; embedding keeps `trace.jsonl` self-contained and lets the transcript directly answer "what was this score measured against." The backlog's "and/or dump it to a file" is explicitly optional; a standalone file would be a second, redundant mechanism (more code, more tests) for no additional debugging value. **Dropped** on YAGNI grounds — trivial to add later if a tool needs a per-contract file.

## File Structure

- `src/contract/types.ts` — add `FreezeReason` union (contract-domain vocabulary).
- `src/contract/negotiate.ts` — `negotiate()` returns `NegotiationOutcome` instead of `Contract`.
- `src/state/types.ts` — `RunState` gains `contractFreezeReason: FreezeReason | null`.
- `src/trace/types.ts` — `TraceEvent` gains optional `contract?: Contract`.
- `src/trace/renderer.ts` — render criteria when an event carries a contract.
- `src/orchestrator/run.ts` — consume the new negotiate return; wire freeze reason + frozen contract into state and the NEGOTIATE trace event.
- Test files touched: `tests/contract.test.ts`, `tests/state.test.ts`, `tests/trace.test.ts`, `tests/orchestrator.test.ts`.

---

## Task 0: Branch

- [ ] **Step 1: Create the feature branch**

```bash
cd ~/development/dev-harness
git checkout -b feat/trace-contract-observability
```

Expected: `Switched to a new branch 'feat/trace-contract-observability'`

---

## Task 1: `negotiate()` reports the freeze reason

**Files:**
- Modify: `src/contract/types.ts` (add `FreezeReason`)
- Modify: `src/contract/negotiate.ts` (return `NegotiationOutcome`)
- Test: `tests/contract.test.ts:13-32` (update the two freeze tests)

**Interfaces:**
- Produces: `export type FreezeReason = "agreement" | "round-cap"` (in `contract/types.ts`); `export interface NegotiationOutcome { contract: Contract; freezeReason: FreezeReason }` (in `negotiate.ts`); `negotiate(deps: NegotiateDeps): Promise<NegotiationOutcome>`.
- Consumes: existing `Contract`, `NegotiateDeps`, `PriorRound` (unchanged).

- [ ] **Step 1: Update the two return-shape tests to fail against the current API**

In `tests/contract.test.ts`, replace the body of `test("negotiate freezes when critique agrees", ...)` (lines 13-22) with:

```ts
test("negotiate freezes when critique agrees", async () => {
  let round = 0;
  const result = await negotiate({
    propose: async (prev) => c((prev?.contract.version ?? 0) + 1),
    critique: async (contract) => { round++; return { agreed: round >= 2, contract, critique: "crit" }; },
    maxRounds: 5,
  });
  expect(result.contract.frozen).toBe(true);
  expect(result.contract.version).toBe(2);
  expect(result.freezeReason).toBe("agreement");
});
```

And replace `test("negotiate force-freezes at round cap", ...)` (lines 24-32) with:

```ts
test("negotiate force-freezes at round cap", async () => {
  const result = await negotiate({
    propose: async (prev) => c((prev?.contract.version ?? 0) + 1),
    critique: async (contract) => ({ agreed: false, contract, critique: "crit" }),
    maxRounds: 3,
  });
  expect(result.contract.frozen).toBe(true);
  expect(result.contract.version).toBe(3);
  expect(result.freezeReason).toBe("round-cap");
});
```

(The other two tests in this file — "feeds the prior contract" and "runs checkStop" — don't inspect the return value, so they need no change.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/contract.test.ts`
Expected: FAIL — `result.contract` is undefined / `result.freezeReason` does not exist (negotiate still returns a bare `Contract`).

- [ ] **Step 3: Add the `FreezeReason` type**

In `src/contract/types.ts`, append:

```ts
/** Why a contract froze: the evaluator agreed, or negotiation hit the round cap
 *  without agreement (the one bypass of the adversarial gate — deserves scrutiny). */
export type FreezeReason = "agreement" | "round-cap";
```

- [ ] **Step 4: Change `negotiate()` to return the outcome**

In `src/contract/negotiate.ts`, update the import and replace the `negotiate` function. New file contents:

```ts
import type { Contract, FreezeReason } from "./types.js";

export function parseAgreement(text: string): boolean {
  return /^AGREEMENT:\s*yes/im.test(text);
}

/** What the previous negotiation round produced: the proposed contract and the
 *  evaluator's critique of it. Carried into the next propose() so the generator
 *  revises against the critique instead of re-proposing blind. */
export interface PriorRound { contract: Contract; critique: string; }

/** The outcome of a negotiation: the frozen contract plus WHY it froze —
 *  "agreement" (evaluator agreed) vs "round-cap" (forced at maxRounds without
 *  agreement). Callers surface the reason so a cap-forced freeze, which entered
 *  GENERATE/EVALUATE without the adversarial gate's blessing, is visible. */
export interface NegotiationOutcome { contract: Contract; freezeReason: FreezeReason; }

export interface NegotiateDeps {
  propose: (prev: PriorRound | null) => Promise<Contract>;
  critique: (c: Contract) => Promise<{ agreed: boolean; contract: Contract; critique: string }>;
  maxRounds: number;
  /** Optional guard evaluated at the top of each round, BEFORE the next pair of
   *  agent calls. If it throws, negotiation aborts and the error propagates to
   *  the caller (the orchestrator throws BudgetHalt so a long negotiation can't
   *  overshoot the wall-clock/$ backstops). Agent- and budget-agnostic. */
  checkStop?: () => void;
}

export async function negotiate(deps: NegotiateDeps): Promise<NegotiationOutcome> {
  let prev: PriorRound | null = null;
  for (let round = 1; round <= deps.maxRounds; round++) {
    deps.checkStop?.();
    const proposed = await deps.propose(prev);
    const { agreed, contract, critique } = await deps.critique(proposed);
    prev = { contract, critique };
    // Agreement wins over the cap: a final round that also agrees froze because
    // the evaluator agreed, not because it ran out of rounds.
    if (agreed) return { contract: { ...contract, frozen: true }, freezeReason: "agreement" };
    if (round === deps.maxRounds) return { contract: { ...contract, frozen: true }, freezeReason: "round-cap" };
  }
  // unreachable (maxRounds >= 1 guaranteed by config validation), satisfies types
  return { contract: { ...(prev as PriorRound).contract, frozen: true }, freezeReason: "round-cap" };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/contract.test.ts`
Expected: PASS (all tests in the file green). This will NOT yet typecheck the whole project — `run.ts` still expects the old return shape; that is fixed in Task 2.

- [ ] **Step 6: Commit**

```bash
git add src/contract/types.ts src/contract/negotiate.ts tests/contract.test.ts
git commit -m "$(cat <<'EOF'
feat(contract): negotiate reports freeze reason (agreement | round-cap)

Return {contract, freezeReason} instead of a bare Contract so callers can
distinguish an evaluator-agreed freeze from a round-cap-forced one.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Record the freeze reason in run state + transcript

**Files:**
- Modify: `src/state/types.ts` (add `contractFreezeReason` to `RunState`)
- Modify: `src/orchestrator/run.ts` (consume new negotiate return; init + update state; encode reason in NEGOTIATE `outputDigest`)
- Modify: `tests/state.test.ts:8-12` (add field to the `base` literal so it typechecks)
- Test: `tests/orchestrator.test.ts` (add two tests)

**Interfaces:**
- Consumes: `NegotiationOutcome` from Task 1; `FreezeReason` from `contract/types.ts`.
- Produces: `RunState.contractFreezeReason: FreezeReason | null`; NEGOTIATE trace/transcript line reads `frozen (agreement)` / `frozen (round-cap)`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/orchestrator.test.ts` (the `happyDeps().critiqueContract` agrees, so the happy path freezes by agreement):

```ts
test("records the agreement freeze reason in state", async () => {
  const state = await runLoop(cfg(), happyDeps());
  expect(state.contractFreezeReason).toBe("agreement");
});

test("records the round-cap freeze reason in state and transcript", async () => {
  const runsDir = mkdtempSync(join(tmpdir(), "runs-"));
  const deps: LoopDeps = {
    ...happyDeps(),
    runsDir,
    // Never agree → negotiation is forced to freeze when it hits the round cap.
    critiqueContract: async (_sprint, c) => ({ agreed: false, contract: c, critique: "no" }),
  };
  const state = await runLoop(cfg({ caps: { negotiationRounds: 2 } }), deps);
  expect(state.status).toBe("passed");
  expect(state.contractFreezeReason).toBe("round-cap");

  const transcript = readFileSync(join(runsDir, "r1", "transcript.md"), "utf8");
  expect(transcript).toContain("frozen (round-cap)");
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/orchestrator.test.ts`
Expected: FAIL — `state.contractFreezeReason` is `undefined`; transcript contains `frozen`, not `frozen (round-cap)`. (Note: the whole project won't typecheck yet because `run.ts` still uses the old negotiate return — the failing run itself is the signal.)

- [ ] **Step 3: Add the state field**

In `src/state/types.ts`, add the import and field. New file contents:

```ts
import type { FreezeReason } from "../contract/types.js";

export type RunStatus = "running" | "passed" | "halted";
export interface Sprint { id: number; title: string; description: string; }
export interface RunState {
  runId: string; goal: string; status: RunStatus;
  sprints: Sprint[]; currentSprint: number; contractVersion: number;
  scores: number[]; iterations: number; budgetSpentUsd: number;
  haltReason: string | null;
  /** Why the current/most-recent contract froze — a snapshot mirroring
   *  contractVersion. Per-sprint history lives in the trace; this is the
   *  single-point state view. Null before the first contract freezes. */
  contractFreezeReason: FreezeReason | null;
}
```

- [ ] **Step 4: Keep the state-store test literal typechecking**

In `tests/state.test.ts`, update the `base` literal (lines 8-12) to include the new field:

```ts
const base: RunState = {
  runId: "r1", goal: "g", status: "running", sprints: [],
  currentSprint: 0, contractVersion: 0, scores: [], iterations: 0,
  budgetSpentUsd: 0, haltReason: null, contractFreezeReason: null,
};
```

- [ ] **Step 5: Wire the reason through `run.ts`**

In `src/orchestrator/run.ts`:

(a) Update the contract-types import (line 4) to pull in `FreezeReason`:

```ts
import type { Contract, FreezeReason } from "../contract/types.js";
```

(b) Add `contractFreezeReason: null` to the initial state literal (lines 38-42):

```ts
  const state: RunState = {
    runId: config.runId, goal: config.goal, status: "running", sprints: [],
    currentSprint: 0, contractVersion: 0, scores: [], iterations: 0,
    budgetSpentUsd: 0, haltReason: null, contractFreezeReason: null,
  };
```

(c) Replace the negotiate call + the two lines after it (lines 89-110) with the version that captures `freezeReason`:

```ts
      let contract: Contract;
      let freezeReason: FreezeReason;
      try {
        const outcome = await negotiate({
          propose: (prev) => deps.proposeContract(sprint, prev, wt.path),
          critique: (c) => deps.critiqueContract(sprint, c),
          maxRounds: config.caps.negotiationRounds,
          // Enforce the wall-clock/$ backstops at the top of every negotiation
          // round, before the next pair of Opus calls — otherwise a long
          // negotiation could overshoot the caps between DECIDE-point checks.
          checkStop: () => {
            const r = budget.checkStops(deps.nowMs());
            if (r) throw new BudgetHalt(r);
          },
        });
        contract = outcome.contract;
        freezeReason = outcome.freezeReason;
      } catch (e) {
        if (e instanceof BudgetHalt) {
          return await haltRun(e.reason); // outer finally still removes the worktree; branch survives
        }
        throw e;
      }
      update({ contractVersion: contract.version, contractFreezeReason: freezeReason });
      traceEvent({ phase: "NEGOTIATE", contractVersion: contract.version, outputDigest: `frozen (${freezeReason})` });
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run tests/orchestrator.test.ts tests/state.test.ts`
Expected: PASS (including the two new tests and all pre-existing ones).

- [ ] **Step 7: Commit**

```bash
git add src/state/types.ts src/orchestrator/run.ts tests/state.test.ts tests/orchestrator.test.ts
git commit -m "$(cat <<'EOF'
feat(orchestrator): record contract freeze reason in state + transcript

RunState.contractFreezeReason snapshots why the current contract froze, and
the NEGOTIATE transcript line now reads "frozen (agreement|round-cap)" so a
cap-forced freeze (adversarial gate bypassed) is visible when reading a run.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Embed the frozen contract in the NEGOTIATE trace event

**Files:**
- Modify: `src/trace/types.ts` (add optional `contract` to `TraceEvent`)
- Modify: `src/trace/renderer.ts` (render criteria when present)
- Modify: `src/orchestrator/run.ts` (attach `contract` to the NEGOTIATE trace event)
- Test: `tests/trace.test.ts` (renderer test), `tests/orchestrator.test.ts` (trace-carries-criteria test)

**Interfaces:**
- Consumes: `Contract`/`Criterion` from `contract/types.ts`.
- Produces: `TraceEvent.contract?: Contract`; transcript lines `- criteria:` then `  - <id>: <description> [verify: <verifyBy>]` under NEGOTIATE events.

- [ ] **Step 1: Write the failing renderer test**

Append to `tests/trace.test.ts`:

```ts
test("renderer lists contract criteria when the event carries a frozen contract", () => {
  const md = renderTranscript([
    ev({
      phase: "NEGOTIATE", agentRole: "system", outputDigest: "frozen (round-cap)",
      contract: {
        version: 2, frozen: true,
        criteria: [{ id: "c1", description: "sum(a,b) returns a+b", verifyBy: "node:test" }],
      },
    }),
  ]);
  expect(md).toContain("frozen (round-cap)");
  expect(md).toContain("- criteria:");
  expect(md).toContain("c1: sum(a,b) returns a+b [verify: node:test]");
});
```

- [ ] **Step 2: Write the failing orchestrator test**

Append to `tests/orchestrator.test.ts`:

```ts
test("NEGOTIATE trace event carries the frozen contract's criteria", async () => {
  const runsDir = mkdtempSync(join(tmpdir(), "runs-"));
  const deps: LoopDeps = {
    ...happyDeps(),
    runsDir,
    proposeContract: async (_sprint, prev) => ({
      version: (prev?.contract.version ?? 0) + 1, frozen: false,
      criteria: [{ id: "c1", description: "sum(a,b)=a+b", verifyBy: "node:test" }],
    }),
  };
  const state = await runLoop(cfg(), deps);
  expect(state.status).toBe("passed");

  const trace = readFileSync(join(runsDir, "r1", "trace.jsonl"), "utf8")
    .trim().split("\n").map((l) => JSON.parse(l));
  const neg = trace.find((e) => e.phase === "NEGOTIATE");
  expect(neg.contract.criteria[0].id).toBe("c1");

  const transcript = readFileSync(join(runsDir, "r1", "transcript.md"), "utf8");
  expect(transcript).toContain("c1: sum(a,b)=a+b [verify: node:test]");
});
```

- [ ] **Step 3: Run to verify both fail**

Run: `npx vitest run tests/trace.test.ts tests/orchestrator.test.ts`
Expected: FAIL — renderer emits no `- criteria:` line; the NEGOTIATE trace event has no `contract` field.

- [ ] **Step 4: Add the optional field to `TraceEvent`**

In `src/trace/types.ts`, add the import and field. New file contents:

```ts
import type { Contract } from "../contract/types.js";

export type Phase = "PLAN" | "NEGOTIATE" | "GENERATE" | "EVALUATE" | "DECIDE";
export type AgentRole = "planner" | "generator" | "evaluator" | "system";
export interface TraceEvent {
  ts: string; runId: string; sprint: number; phase: Phase;
  agentRole: AgentRole; contractVersion: number;
  inputDigest: string; toolCalls: string[]; outputDigest: string;
  tokens: number; costUsd: number;
  /** The frozen contract, present only on NEGOTIATE events, so trace.jsonl is
   *  self-contained: a reader can see exactly what each score was measured
   *  against without loading another file. */
  contract?: Contract;
}
```

- [ ] **Step 5: Render the criteria**

In `src/trace/renderer.ts`, add a helper and splice its output into each event's lines. New file contents:

```ts
import type { TraceEvent } from "./types.js";

function renderCriteria(contract: NonNullable<TraceEvent["contract"]>): string[] {
  if (!contract.criteria.length) return ["- criteria: (none)"];
  return ["- criteria:", ...contract.criteria.map((c) => `  - ${c.id}: ${c.description} [verify: ${c.verifyBy}]`)];
}

export function renderTranscript(events: TraceEvent[]): string {
  const runId = events[0]?.runId ?? "unknown";
  const lines: string[] = [`# Run ${runId}`, ""];
  let lastSprint = -1;
  for (const e of events) {
    if (e.sprint !== lastSprint) { lines.push(`## Sprint ${e.sprint}`, ""); lastSprint = e.sprint; }
    lines.push(
      `### ${e.phase} — ${e.agentRole} (contract v${e.contractVersion})`,
      `- tokens: ${e.tokens}, cost: $${e.costUsd.toFixed(4)}`,
      e.toolCalls.length ? `- tools: ${e.toolCalls.join(", ")}` : "",
      `- in: ${e.inputDigest}`,
      `- out: ${e.outputDigest}`,
      ...(e.contract ? renderCriteria(e.contract) : []),
      "",
    );
  }
  return lines.filter((l) => l !== "").join("\n") + "\n";
}
```

- [ ] **Step 6: Attach the contract to the NEGOTIATE trace event**

In `src/orchestrator/run.ts`, update the NEGOTIATE `traceEvent(...)` line (the one added in Task 2, Step 5c) to include the contract:

```ts
      traceEvent({ phase: "NEGOTIATE", contractVersion: contract.version, outputDigest: `frozen (${freezeReason})`, contract });
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run tests/trace.test.ts tests/orchestrator.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/trace/types.ts src/trace/renderer.ts src/orchestrator/run.ts tests/trace.test.ts tests/orchestrator.test.ts
git commit -m "$(cat <<'EOF'
feat(trace): embed frozen contract in NEGOTIATE event; render criteria

trace.jsonl now carries the frozen contract on the NEGOTIATE event and the
transcript lists its criteria, so a reader can see what each sprint's score
was graded against without reconstructing it from memory.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Full verification

- [ ] **Step 1: Typecheck the whole project**

Run: `npm run typecheck`
Expected: no errors (exit 0).

- [ ] **Step 2: Run the full (non-E2E) suite**

Run: `npm test`
Expected: all files pass, gated E2E skipped (no `RUN_E2E`).

- [ ] **Step 3: Report results** — paste the typecheck + test output; do not claim success without it.

---

## Self-Review

- **Spec coverage.** Backlog item "Persist frozen contract contents to trace + run dir" → Task 3 (embed in NEGOTIATE trace event; rendered in transcript; standalone file dropped per documented decision). Backlog item "Record contract freeze reason in trace + state" → Task 1 (negotiate returns reason) + Task 2 (state field + transcript `frozen (reason)` line). Both `negotiate.ts` and `run.ts` — the files both backlog items flagged — are covered.
- **Placeholder scan.** No TBD/TODO; every code step shows complete file contents or the exact line to replace.
- **Type consistency.** `FreezeReason` defined in `contract/types.ts`, imported by `negotiate.ts` (via `NegotiationOutcome`), `state/types.ts`, and `run.ts`. `NegotiationOutcome` produced in Task 1, consumed in Task 2 Step 5c (`outcome.contract` / `outcome.freezeReason`). `TraceEvent.contract` produced in Task 3 Step 4, consumed by the renderer (Step 5) and asserted in tests (Steps 1-2). `contractFreezeReason` name identical across `state/types.ts`, `run.ts` init + update, and both test files.
