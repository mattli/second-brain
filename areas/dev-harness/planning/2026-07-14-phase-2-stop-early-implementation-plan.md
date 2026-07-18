# Phase ② Stop-Early Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the attended loop trustworthy on one project by rebuilding the caps around a subscription (wall-clock primary & per-sprint, dollar informational, subscription usage-limit as a graceful stop), enforcing a sprint-count ceiling, making the CLI honest, moving verification into every sprint, and closing the last `parseScore` residual.

**Architecture:** Small, surgical changes across the existing config → budget → orchestrator → report pipeline, plus two prompt edits. The budget model changes from "two per-run halts (dollar, wall-clock)" to "wall-clock per-sprint (primary), dollar opt-in/off-by-default, plus a new usage-limit halt raised from the agent-invocation layer." Every behavioral change is driven by a failing test first; prompt-only changes (verification-per-sprint) are validated by trace reading, not unit tests, and that is called out explicitly.

**Tech Stack:** TypeScript (strict, ESM — imports use `.js` suffixes), vitest, zod (config validation), commander (CLI), `@anthropic-ai/claude-agent-sdk`.

## Global Constraints

- **ESM imports** — every relative import ends in `.js` (e.g. `from "../budget/tracker.js"`), even for `.ts` sources.
- **Don't parse model output by position — emit a marker and key on it.** (Project lesson; drives the `parseScore` fix.)
- **Test guarantees at their real-I/O boundary.** A guarantee that only holds at the real SDK/git/FS boundary needs a test against the real thing, not a fake. This specifically gates the usage-limit work (Task Group 4).
- **A fix is unreviewed code.** Anything touching caps or loop control-flow gets an independent review before merge.
- **Filenames** are lowercase kebab-case. **Test files** live in `tests/<name>.test.ts` and import from `../src/...`.
- **Run a single test file:** `npx vitest run tests/<name>.test.ts`. **Full suite:** `npx vitest run`. **Typecheck:** `npx tsc --noEmit`.
- Commit after each task with a conventional-commit message.
- DRY, YAGNI, TDD, frequent commits.

---

## File Structure (what changes and why)

| File | Change |
|------|--------|
| `src/config/types.ts` | `caps.dollarCeiling` → `number \| null`; rename `caps.wallClockMs` → `caps.wallClockMsPerSprint`. |
| `src/config/defaults.ts` | `dollarCeiling: null` (off); `wallClockMsPerSprint: 30*60*1000`. |
| `src/config/load.ts` | zod schema: `dollarCeiling` nullable; rename wall-clock key. |
| `src/budget/tracker.ts` | Per-sprint wall-clock (reset baseline each sprint); dollar guarded by null; new `"usage-limit"` StopReason; `resetSprint(nowMs)`. |
| `src/orchestrator/run.ts` | `resetSprint(deps.nowMs())`; outer `BudgetHalt` catch so a usage-limit from any agent call halts gracefully. |
| `src/agents/invoke.ts` | `isUsageLimitError()`; throw `BudgetHalt("usage-limit")` (no retry) on a usage-limit. |
| `src/agents/planner.ts` | Enforce `MAX_SPRINTS = 6` (truncate + report count). |
| `src/agents/evaluator.ts` | `parseScore` keys on a unique `FINAL SCORE:` marker; `buildEvaluatePrompt` emits it. |
| `src/cli/index.ts` | Extract `buildRunOverrides()`; wire `--wall-clock-ms`, `--max-iterations`; keep `--dollar-ceiling` (opt-in). |
| `prompts/planner.md` | Each sprint is a vertical slice (behavior + its tests); no terminal "write the tests" sprint. |
| `prompts/contract-negotiation.md` | Every contract must include test criteria; a contract with none is under-scoped. |
| `prompts/evaluator.md` | Update score-format instruction to `FINAL SCORE:` if present. |
| `src/report/summary.ts` | `HALT_TEXT` reframes cap-halts as "Paused" (+ usage-limit text + approximate-cap note). |
| `README.md` | Rewrite the caps table: honest flags, dollar off-by-default, wall-clock per-sprint. |

---

## Task Group 1: Caps data model (config)

Foundation for everything else: dollar becomes optional, wall-clock becomes per-sprint by name.

### Task 1: Make `dollarCeiling` nullable and rename wall-clock to per-sprint

**Files:**
- Modify: `src/config/types.ts:9-14`
- Modify: `src/config/defaults.ts`
- Modify: `src/config/load.ts:16-21`
- Test: `tests/config.test.ts`

**Interfaces:**
- Produces: `RunConfig.caps = { maxIterationsPerSprint: number; negotiationRounds: number; dollarCeiling: number | null; wallClockMsPerSprint: number }`

- [ ] **Step 1: Write the failing test** — append to `tests/config.test.ts`:

```typescript
import { loadConfig } from "../src/config/load.js";

test("dollar ceiling defaults to null (off) and wall-clock is per-sprint", () => {
  const c = loadConfig({ runId: "r", goal: "g", projectPath: "/p" });
  expect(c.caps.dollarCeiling).toBeNull();
  expect(c.caps.wallClockMsPerSprint).toBe(30 * 60 * 1000);
});

test("a dollar ceiling override is accepted", () => {
  const c = loadConfig({ runId: "r", goal: "g", projectPath: "/p", caps: { dollarCeiling: 5 } });
  expect(c.caps.dollarCeiling).toBe(5);
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/config.test.ts`
Expected: FAIL (property `wallClockMsPerSprint` missing / `dollarCeiling` not null).

- [ ] **Step 3: Update the types** — `src/config/types.ts`, replace the `caps` block:

```typescript
  caps: {
    maxIterationsPerSprint: number;
    negotiationRounds: number;
    dollarCeiling: number | null; // null = off (informational only); set to opt into a $ halt
    wallClockMsPerSprint: number; // primary cap, scoped per sprint
  };
```

- [ ] **Step 4: Update the defaults** — `src/config/defaults.ts`, in `caps`:

```typescript
  caps: {
    maxIterationsPerSprint: 6,
    negotiationRounds: 5,
    dollarCeiling: null,
    wallClockMsPerSprint: 30 * 60 * 1000,
  },
```

- [ ] **Step 5: Update the zod schema** — `src/config/load.ts`, replace the `caps` object in `schema`:

```typescript
  caps: z.object({
    maxIterationsPerSprint: z.number().int().min(1),
    negotiationRounds: z.number().int().min(1),
    dollarCeiling: z.number().positive().nullable(),
    wallClockMsPerSprint: z.number().int().positive(),
  }),
```

- [ ] **Step 6: Run tests + typecheck**

Run: `npx vitest run tests/config.test.ts && npx tsc --noEmit`
Expected: config tests PASS. `tsc` will now report errors in `tracker.ts`, `budget.test.ts`, and `cli/index.ts` referencing the old `wallClockMs` — those are fixed in later tasks; note them and proceed.

- [ ] **Step 7: Commit**

```bash
git add src/config tests/config.test.ts
git commit -m "feat(config): dollar ceiling off-by-default, wall-clock scoped per-sprint"
```

---

## Task Group 2: BudgetTracker — per-sprint wall-clock, optional dollar, usage-limit reason

### Task 2: Per-sprint wall-clock + null-guarded dollar + new StopReason

**Files:**
- Modify: `src/budget/tracker.ts`
- Test: `tests/budget.test.ts`

**Interfaces:**
- Produces: `StopReason = "max-iteration" | "no-progress" | "dollar-ceiling" | "wall-clock" | "usage-limit"`; `resetSprint(nowMs: number): void`; `Caps` interface mirrors `RunConfig.caps`.

- [ ] **Step 1: Update the caps fixture + write failing tests** — in `tests/budget.test.ts`, change the fixture and add tests:

```typescript
const caps = { maxIterationsPerSprint: 6, negotiationRounds: 5, dollarCeiling: null as number | null, wallClockMsPerSprint: 1000 };

test("dollar ceiling does NOT trip when null (off)", () => {
  const b = new BudgetTracker(caps, thr, 0);
  b.recordCost(9999);
  expect(b.checkStops(0)).toBeNull();
});

test("dollar ceiling trips only when a ceiling is set", () => {
  const b = new BudgetTracker({ ...caps, dollarCeiling: 10 }, thr, 0);
  b.recordCost(11);
  expect(b.checkStops(0)).toBe("dollar-ceiling");
});

test("wall clock is per-sprint: resetSprint rebaselines the clock", () => {
  const b = new BudgetTracker(caps, thr, 0);
  expect(b.checkStops(1001)).toBe("wall-clock"); // 1001ms since start of sprint
  b.resetSprint(1001);                           // new sprint starts at t=1001
  expect(b.checkStops(1500)).toBeNull();         // only 499ms into the new sprint
  expect(b.checkStops(2002)).toBe("wall-clock"); // 1001ms into the new sprint
});
```

Also update the two existing tests that call `b.resetSprint()` (no-arg) to pass a time: `b.resetSprint(0)`. And update the existing `"dollar ceiling trips"` and `"checkStops precedence"` tests to construct with `{ ...caps, dollarCeiling: 10 }` (since the fixture dollar is now null). And the `"wall clock trips on injected time"` test still holds (`checkStops(1001)` → wall-clock).

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/budget.test.ts`
Expected: FAIL (`resetSprint` arity; dollar-null behavior; per-sprint clock).

- [ ] **Step 3: Rewrite the tracker** — `src/budget/tracker.ts`:

```typescript
export type StopReason = "max-iteration" | "no-progress" | "dollar-ceiling" | "wall-clock" | "usage-limit";

/** Thrown to abort work mid-flight when a hard stop trips somewhere the DECIDE
 *  point can't reach it (inside negotiation, or a usage-limit raised from an
 *  agent call). The orchestrator catches it and routes through the graceful
 *  halt-and-return path. */
export class BudgetHalt extends Error {
  constructor(public readonly reason: StopReason) {
    super(`budget halt: ${reason}`);
    this.name = "BudgetHalt";
  }
}

interface Caps { maxIterationsPerSprint: number; negotiationRounds: number; dollarCeiling: number | null; wallClockMsPerSprint: number; }
interface Thresholds { advanceScore: number; noProgressDelta: number; noProgressWindow: number; }

export class BudgetTracker {
  private spentUsd = 0;
  private iterations = 0;
  private flatCount = 0;
  private lastScore: number | null = null;
  private sprintStartMs: number;

  constructor(private caps: Caps, private thr: Thresholds, startMs: number) {
    this.sprintStartMs = startMs;
  }

  recordCost(usd: number): void { this.spentUsd += usd; }
  recordIteration(): void { this.iterations += 1; }

  recordScore(score: number): void {
    if (this.lastScore !== null && score - this.lastScore < this.thr.noProgressDelta) {
      this.flatCount += 1;
    } else {
      this.flatCount = 0;
    }
    this.lastScore = score;
  }

  /** Call when starting a new sprint. Iteration/progress counters AND the
   *  wall-clock baseline are per-sprint, so pass the current clock. */
  resetSprint(nowMs: number): void {
    this.iterations = 0; this.flatCount = 0; this.lastScore = null;
    this.sprintStartMs = nowMs;
  }

  get spent(): number { return this.spentUsd; }

  checkStops(nowMs: number): StopReason | null {
    if (this.caps.dollarCeiling !== null && this.spentUsd >= this.caps.dollarCeiling) return "dollar-ceiling";
    if (nowMs - this.sprintStartMs >= this.caps.wallClockMsPerSprint) return "wall-clock";
    if (this.iterations >= this.caps.maxIterationsPerSprint) return "max-iteration";
    if (this.flatCount >= this.thr.noProgressWindow) return "no-progress";
    return null;
  }
}
```

- [ ] **Step 4: Run tests + typecheck**

Run: `npx vitest run tests/budget.test.ts && npx tsc --noEmit`
Expected: budget tests PASS. `tsc` still flags `run.ts` (`resetSprint()` no-arg) and `cli/index.ts` — fixed next.

- [ ] **Step 5: Commit**

```bash
git add src/budget/tracker.ts tests/budget.test.ts
git commit -m "feat(budget): per-sprint wall-clock, opt-in dollar ceiling, usage-limit reason"
```

---

## Task Group 3: Orchestrator wiring

### Task 3: Per-sprint reset + graceful halt on usage-limit from any agent call

**Files:**
- Modify: `src/orchestrator/run.ts:120` and `src/orchestrator/run.ts:115-193` (the main try/finally)
- Test: `tests/orchestrator.test.ts`

**Interfaces:**
- Consumes: `BudgetHalt` (from `../budget/tracker.js`, already imported).
- Produces: a run that halts with `haltReason === "usage-limit"` (status `halted`) when any agent call throws `BudgetHalt("usage-limit")`.

- [ ] **Step 1: Write the failing test** — add to `tests/orchestrator.test.ts`, following the existing dep-stub style in that file (stub `generateCode` to throw):

```typescript
import { BudgetHalt } from "../src/budget/tracker.js";

test("a usage-limit thrown during generation halts gracefully with the partial work committed", async () => {
  const deps = makeDeps(); // existing helper in this file; returns a full LoopDeps stub
  deps.generateCode = async () => { throw new BudgetHalt("usage-limit"); };
  let committed = false;
  deps.commitWorktree = async () => { committed = true; return true; };
  const state = await runLoop(makeConfig(), deps); // makeConfig() = existing helper
  expect(state.status).toBe("halted");
  expect(state.haltReason).toBe("usage-limit");
  expect(committed).toBe(true); // partial work committed before the worktree is removed
});
```

If `tests/orchestrator.test.ts` has no `makeDeps`/`makeConfig` helpers, mirror the stubbing pattern already used by the file's existing tests; do not invent new infrastructure.

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/orchestrator.test.ts`
Expected: FAIL — the `BudgetHalt` propagates out of `runLoop` (only the negotiation phase catches it today), so `runLoop` rejects instead of returning a halted state.

- [ ] **Step 3: Rebaseline the sprint clock** — `src/orchestrator/run.ts`, line 120, change:

```typescript
      budget.resetSprint(deps.nowMs());
```

- [ ] **Step 4: Add the outer BudgetHalt catch** — wrap the main loop. Change the `try { ... } finally { ... }` (lines 115–193) so the `try` gains a `catch` before the `finally`:

```typescript
  try {
    // ... unchanged loop body ...
    update({ status: "passed", budgetSpentUsd: budget.spent });
    finalize(runDir, trace, state);
    return store.read();
  } catch (e) {
    // A BudgetHalt from ANY agent call (generate/evaluate/propose/critique) —
    // most importantly a subscription usage-limit — halts gracefully: commit the
    // partial work, mark halted, render. Non-BudgetHalt errors still throw.
    if (e instanceof BudgetHalt) return await haltRun(e.reason);
    throw e;
  } finally {
    await deps.removeWorktree(config.projectPath, wt.path); // branch survives for review
  }
```

The inner negotiation `try/catch` (lines 124–144) stays as-is — it already returns `haltRun` for a `BudgetHalt` raised by `checkStop` during negotiation; the new outer catch covers the generate/evaluate calls the inner one doesn't.

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run tests/orchestrator.test.ts && npx tsc --noEmit`
Expected: PASS, and `tsc` clean except `cli/index.ts` (Task 6).

- [ ] **Step 6: Commit**

```bash
git add src/orchestrator/run.ts tests/orchestrator.test.ts
git commit -m "feat(orchestrator): per-sprint clock reset; graceful halt on usage-limit from any agent call"
```

---

## Task Group 4: Usage-limit detection at the SDK boundary

> ⚠️ **Real-I/O boundary caveat (blocking before trust):** the exact shape of the SDK's subscription usage-limit signal is not confirmed in code. This task builds the detector against *assumed* shapes with unit tests, but the guarantee ("a real usage-limit halts gracefully, not crashes") only holds at the real SDK boundary. **Before this is trusted, confirm the real error shape** — trigger or mock a real usage-limit against `@anthropic-ai/claude-agent-sdk` and adjust `isUsageLimitError` — per the project's "test guarantees at their real-I/O boundary" lesson. Until confirmed, treat the detector as best-effort.

### Task 4: `isUsageLimitError` + no-retry graceful halt

**Files:**
- Modify: `src/agents/invoke.ts`
- Test: `tests/invoke.test.ts`

**Interfaces:**
- Produces: `isUsageLimitError(err: unknown): boolean` (exported, pure). `invokeAgent` throws `BudgetHalt("usage-limit")` (without retrying) when a usage-limit is detected.

- [ ] **Step 1: Write the failing tests** — add to `tests/invoke.test.ts`:

```typescript
import { isUsageLimitError, invokeAgent } from "../src/agents/invoke.js";
import { BudgetHalt } from "../src/budget/tracker.js";

test("isUsageLimitError matches known usage-limit signals", () => {
  expect(isUsageLimitError({ status: 429 })).toBe(true);
  expect(isUsageLimitError(new Error("Usage limit reached. Resets at ..."))).toBe(true);
  expect(isUsageLimitError({ error: { type: "rate_limit_error" } })).toBe(true);
  expect(isUsageLimitError(new Error("connection reset"))).toBe(false);
  expect(isUsageLimitError(null)).toBe(false);
});

test("invokeAgent halts (BudgetHalt) on a usage-limit WITHOUT retrying", async () => {
  let calls = 0;
  const queryFn = () => { calls++; throw new Error("Usage limit reached"); };
  await expect(invokeAgent({ queryFn: queryFn as any, prompt: "p", systemPrompt: "s", model: "m", maxRetries: 3, sleep: async () => {} }))
    .rejects.toBeInstanceOf(BudgetHalt);
  expect(calls).toBe(1); // not retried
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/invoke.test.ts`
Expected: FAIL (`isUsageLimitError` not exported; invokeAgent retries and throws a plain Error).

- [ ] **Step 3: Implement** — `src/agents/invoke.ts`. Add the import at top and the detector, and short-circuit the retry loop:

```typescript
import { BudgetHalt } from "../budget/tracker.js";

/** Best-effort detection of a subscription usage-limit / rate-limit signal from
 *  the Agent SDK. NOTE: confirm against the real SDK error shape (see plan
 *  caveat) — this matches plausible signals but is not boundary-verified. */
export function isUsageLimitError(err: unknown): boolean {
  if (!err) return false;
  const anyErr = err as { status?: number; error?: { type?: string }; message?: string };
  if (anyErr.status === 429) return true;
  if (anyErr.error?.type === "rate_limit_error") return true;
  const msg = (anyErr.message ?? String(err)).toLowerCase();
  return /usage limit|rate limit|resets? at|429/.test(msg);
}
```

In `invokeAgent`, inside the `catch (err)` block, before the retry decision:

```typescript
    } catch (err) {
      if (isUsageLimitError(err)) throw new BudgetHalt("usage-limit"); // don't retry — halt gracefully
      lastErr = err;
      if (attempt < maxRetries) await sleep(attempt * 1000);
    }
```

- [ ] **Step 4: Run tests + typecheck**

Run: `npx vitest run tests/invoke.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/agents/invoke.ts tests/invoke.test.ts
git commit -m "feat(invoke): detect subscription usage-limit and halt gracefully (no retry)"
```

---

## Task Group 5: Sprint-count cap

### Task 5: Enforce `MAX_SPRINTS = 6` in the planner

**Files:**
- Modify: `src/agents/planner.ts`
- Test: `tests/agents.test.ts`

**Interfaces:**
- Produces: `PlanResult = { title: string; sprints: Sprint[]; proposedCount: number }` — `sprints` is capped at 6; `proposedCount` is how many the planner actually returned (so the orchestrator/transcript can note a truncation).

- [ ] **Step 1: Write the failing test** — add to `tests/agents.test.ts`:

```typescript
import { planRun } from "../src/agents/planner.js";

test("planRun caps sprints at 6 and reports the proposed count", async () => {
  const eight = Array.from({ length: 8 }, (_, i) => ({ title: `s${i}`, description: "d" }));
  const queryFn = async function* () {
    yield { type: "assistant", message: { content: [{ type: "text", text: JSON.stringify({ title: "t", sprints: eight }) }] } };
    yield { type: "result", subtype: "success", total_cost_usd: 0, usage: { input_tokens: 1, output_tokens: 1 } };
  };
  const res = await planRun({ queryFn: queryFn as any, model: "m", goal: "g" });
  expect(res.sprints.length).toBe(6);
  expect(res.proposedCount).toBe(8);
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/agents.test.ts`
Expected: FAIL (returns 8; no `proposedCount`).

- [ ] **Step 3: Implement** — `src/agents/planner.ts`:

```typescript
export const MAX_SPRINTS = 6;
export interface PlanResult { title: string; sprints: Sprint[]; proposedCount: number; }
```

In `planRun`, replace the `return`:

```typescript
  const all = obj.sprints.map((s, id) => ({ id, title: s.title, description: s.description }));
  return { title: obj.title, sprints: all.slice(0, MAX_SPRINTS), proposedCount: all.length };
```

- [ ] **Step 4: Thread the note into the trace (optional-but-legible)** — `src/orchestrator/run.ts`, the PLAN trace event (line 116). `deps.planRun` returns `{ title, sprints }` today; if the wired `planRun` now also returns `proposedCount`, widen the `LoopDeps.planRun` return type to include it and note truncation in the PLAN digest:

```typescript
    const dropped = (plan as { proposedCount?: number }).proposedCount ?? plan.sprints.length;
    traceEvent({ phase: "PLAN", agentRole: "planner", outputDigest: `${plan.sprints.length} sprints${dropped > plan.sprints.length ? ` (planner proposed ${dropped}, capped at ${plan.sprints.length})` : ""}` });
```

Keep `LoopDeps.planRun`'s declared return as `{ title; sprints }` and read `proposedCount` defensively (as above) so this task doesn't force a signature change across the stub tests. Update `src/cli/wire.ts` only if it re-shapes the planner result (grep `planRun` there; if it passes the result through, no change needed).

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run tests/agents.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/agents/planner.ts src/orchestrator/run.ts tests/agents.test.ts
git commit -m "feat(planner): enforce <=6 sprint cap in code; note truncation in trace"
```

---

## Task Group 6: parseScore marker fix

### Task 6: Key the score on a unique `FINAL SCORE:` marker

**Files:**
- Modify: `src/agents/evaluator.ts` (`parseScore` + `buildEvaluatePrompt`)
- Modify: `prompts/evaluator.md` (if it references the score format — grep first)
- Test: `tests/evaluator-discrimination.e2e.test.ts` or a plain `tests/evaluator.test.ts` unit for `parseScore` (prefer a fast unit test; create `tests/evaluator.test.ts` if none exists)

**Interfaces:**
- Produces: `parseScore(text)` returns the number after the first `FINAL SCORE:` label, else null; `buildEvaluatePrompt` instructs the model to end with `FINAL SCORE: <0-100>`.

- [ ] **Step 1: Write the failing test** — create/append `tests/evaluator.test.ts`:

```typescript
import { expect, test } from "vitest";
import { parseScore } from "../src/agents/evaluator.js";

test("parseScore ignores a score mentioned in reasoning before the verdict", () => {
  const text = "The code sets score = 40 internally, but that's irrelevant.\nFINAL SCORE: 88\n- finding one";
  expect(parseScore(text)).toBe(88);
});

test("parseScore tolerates markdown and trailing text on the marker", () => {
  expect(parseScore("**FINAL SCORE:** 90/100")).toBe(90);
});

test("parseScore returns null when no marker is present", () => {
  expect(parseScore("I think it's pretty good, score of 95 maybe")).toBeNull();
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/evaluator.test.ts`
Expected: FAIL — current `parseScore` matches `score = 40` (first `score:` / `score=`), returning 40 not 88, and returns 95 for the no-marker case.

- [ ] **Step 3: Implement** — `src/agents/evaluator.ts`. Change the prompt line in `buildEvaluatePrompt` (line 27):

```typescript
    `Grade the ARTIFACT against this FROZEN contract. Judge behavior against the criteria and the verifier result. Treat any narration or self-justification in code comments as unverified claims, not evidence. End with a line "FINAL SCORE: <0-100>", then list concrete findings.`,
```

And rewrite `parseScore`:

```typescript
/** Extract the evaluator's 0–100 grade, keyed on the unique `FINAL SCORE:`
 *  marker the evaluate prompt is told to emit exactly once. Keying on a
 *  distinctive marker (not a bare "score:") removes the residual where a
 *  colon-labelled number in the model's reasoning could hijack the grade.
 *  Returns null when the marker is absent so callers distinguish "no score"
 *  from a genuine 0. Tolerant of markdown (`**FINAL SCORE:** 88`) and trailing
 *  text (`FINAL SCORE: 88/100`). */
export function parseScore(text: string): number | null {
  const m = text.match(/final\s+score\s*[:=]\s*\**\s*(\d{1,3})/i);
  if (!m) return null;
  return Math.min(100, parseInt(m[1], 10));
}
```

- [ ] **Step 4: Align the system prompt** — `grep -n -i score prompts/evaluator.md`. If it instructs a `SCORE:` line, update it to `FINAL SCORE:` so the system prompt and the constructed prompt agree.

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run tests/evaluator.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/agents/evaluator.ts prompts/evaluator.md tests/evaluator.test.ts
git commit -m "fix(evaluator): key score on a unique FINAL SCORE marker, killing the pre-verdict residual"
```

---

## Task Group 7: Honest CLI

### Task 7: Wire the real flags; make advertised = real

**Files:**
- Modify: `src/cli/index.ts`
- Test: `tests/cli-wire.test.ts`

**Interfaces:**
- Produces: `buildRunOverrides(opts, runId): RawConfig` — a pure mapping from parsed CLI options to a config-override object, so the flag→config wiring is unit-testable without invoking `runLoop`.

- [ ] **Step 1: Write the failing test** — add to `tests/cli-wire.test.ts`:

```typescript
import { buildRunOverrides } from "../src/cli/index.js";

test("buildRunOverrides maps caps flags to config overrides", () => {
  const o = buildRunOverrides({ goal: "g", project: "/p", wallClockMs: 60000, maxIterations: 3, dollarCeiling: 5 }, "rid");
  expect(o.caps).toEqual({ wallClockMsPerSprint: 60000, maxIterationsPerSprint: 3, dollarCeiling: 5 });
});

test("buildRunOverrides omits caps entirely when no cap flags are given", () => {
  const o = buildRunOverrides({ goal: "g", project: "/p" }, "rid");
  expect(o.caps).toBeUndefined();
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/cli-wire.test.ts`
Expected: FAIL (`buildRunOverrides` not exported).

- [ ] **Step 3: Implement** — `src/cli/index.ts`. Extract and export the mapping, wire the flags:

```typescript
export function buildRunOverrides(opts: {
  goal: string; project: string; evalModel?: string; testCmd?: string;
  dollarCeiling?: number; wallClockMs?: number; maxIterations?: number;
}, runId: string) {
  const caps: Record<string, number> = {};
  if (opts.dollarCeiling !== undefined) caps.dollarCeiling = opts.dollarCeiling;
  if (opts.wallClockMs !== undefined) caps.wallClockMsPerSprint = opts.wallClockMs;
  if (opts.maxIterations !== undefined) caps.maxIterationsPerSprint = opts.maxIterations;
  return {
    runId, goal: opts.goal, projectPath: opts.project,
    models: opts.evalModel ? { evaluator: opts.evalModel } : undefined,
    caps: Object.keys(caps).length ? caps : undefined,
    verifier: opts.testCmd ? { command: opts.testCmd } : undefined,
  };
}
```

Add the options to the `run` command and use the helper in `.action`:

```typescript
  .option("--eval-model <model>")
  .option("--dollar-ceiling <n>", "opt-in $ ceiling (off by default)", parseFloat)
  .option("--wall-clock-ms <n>", "per-sprint wall-clock cap in ms", (v) => parseInt(v, 10))
  .option("--max-iterations <n>", "generate/evaluate retries per sprint", (v) => parseInt(v, 10))
  .option("--test-cmd <cmd>", "verifier command")
  .action(async (opts) => {
    const runId = `${Date.now().toString(36)}`;
    const config = loadConfig(buildRunOverrides(opts, runId));
    // ...unchanged...
  });
```

- [ ] **Step 4: Fix the README caps table** — `README.md`, replace the "Hard stops (four caps)" section:

```markdown
## Caps (checked between steps — approximate)

Caps are checked *between* the loop's major steps, not mid-step, so a run can run
a little past a cap before it halts (typically one step's worth). While you're
watching a run, you're the real stop button. Hitting a cap is a **pause, not a
failure** — the partial work is committed to the run branch and the transcript
says what happened.

| Cap | Default | Flag |
|-----|---------|------|
| Wall clock (per sprint) | 30 min | `--wall-clock-ms` |
| Iterations per sprint | 6 | `--max-iterations` |
| Dollar ceiling | off (informational) | `--dollar-ceiling` (opt-in) |
| No-progress window | 2 iterations with delta < 5 pts | (thresholds config) |
| Subscription usage limit | graceful stop | (automatic) |

On a subscription, the dollar figure is notional, so it's shown for information
but does not halt a run unless you set `--dollar-ceiling`.
```

- [ ] **Step 5: Run tests + typecheck**

Run: `npx vitest run tests/cli-wire.test.ts && npx tsc --noEmit`
Expected: PASS, and `tsc` now fully clean across the repo.

- [ ] **Step 6: Commit**

```bash
git add src/cli/index.ts README.md tests/cli-wire.test.ts
git commit -m "feat(cli): wire --wall-clock-ms/--max-iterations; docs: honest caps table"
```

---

## Task Group 8: Verification moves into every sprint (prompt-only)

> **No unit test — validated by trace reading.** These are prompt changes; the guarantee ("each sprint leaves tested code") is an LLM-behavior property, not a pure function. It is verified by running the loop and reading the transcript/trace (each sprint's contract shows test criteria; each sprint commits tests), not by a vitest assertion. This is the honest boundary for prompt work.

### Task 8: Planner + contract prompts require per-sprint tests

**Files:**
- Modify: `prompts/planner.md`
- Modify: `prompts/contract-negotiation.md`

- [ ] **Step 1: Edit `prompts/planner.md`** — add a paragraph after the existing sprint-shape guidance:

```
Each sprint must be a VERTICAL SLICE that delivers working, TESTED behavior —
some functionality plus the tests that prove it. Do NOT schedule "write the
tests" (or "add test coverage") as its own separate or final sprint: a run can
stop early, and a testing-last plan leaves the earlier sprints unverified. Every
sprint stands on its own as shippable, tested work.
```

- [ ] **Step 2: Edit `prompts/contract-negotiation.md`** — append:

```
Every contract MUST include at least one criterion for automated tests covering
the sprint's behavior (tests written alongside the implementation, verified by
the test suite). A contract with no test criterion is under-scoped — the
evaluator rejects it during critique.
```

- [ ] **Step 3: Commit**

```bash
git add prompts/planner.md prompts/contract-negotiation.md
git commit -m "feat(prompts): each sprint is a vertical slice with its own tests"
```

- [ ] **Step 4: Note for verification** — record in the PR/handoff that this task's guarantee is checked by the gated E2E (Task Group 9's smoke run / the existing `RUN_E2E=1` path): confirm a real run's trace shows test criteria in each sprint's frozen contract and test files committed per sprint. Do not mark verified from unit tests alone.

---

## Task Group 9: Honest transcript & summary labeling

### Task 9: "Paused, not failed" language + usage-limit + approximate-cap note

**Files:**
- Modify: `src/report/summary.ts`
- Test: `tests/summary.test.ts`

**Interfaces:**
- Produces: `describeOutcome` renders cap-halts as "Paused …", includes a `usage-limit` case, and notes work is saved; the approximate-cap note appears for cap-halts.

- [ ] **Step 1: Write the failing tests** — add to `tests/summary.test.ts` (mirror the existing state-fixture style in that file):

```typescript
import { describeOutcome } from "../src/report/summary.js";

const halted = (reason: string) => ({
  runId: "r", goal: "g", title: "t", startedAt: "2026-07-14T00:00:00.000Z",
  status: "halted" as const, sprints: [], currentSprint: 0, contractVersion: 0,
  scores: [], iterations: 0, budgetSpentUsd: 3.2, haltReason: reason, contractFreezeReason: null,
});

test("a wall-clock halt reads as paused, not failed", () => {
  expect(describeOutcome(halted("wall-clock"))).toMatch(/paused/i);
});

test("a subscription usage-limit has its own plain-language line", () => {
  expect(describeOutcome(halted("usage-limit"))).toMatch(/subscription usage limit/i);
});
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run tests/summary.test.ts`
Expected: FAIL (`usage-limit` maps to the generic `Stopped — usage-limit`; wall-clock says "Stopped early").

- [ ] **Step 3: Implement** — `src/report/summary.ts`, replace `HALT_TEXT` and adjust `describeOutcome`:

```typescript
const HALT_TEXT: Record<string, string> = {
  "wall-clock": "Paused — hit the per-sprint time limit (your work so far is saved)",
  "dollar-ceiling": "Paused — hit the spending limit you set",
  "usage-limit": "Paused — hit your Anthropic subscription usage limit (your work so far is saved)",
  "max-iteration": "Stopped — no improvement after the retry limit",
  "no-progress": "Stopped — the score stopped improving",
  "evaluator-parse-error": "Stopped — an internal grading error",
  "planner-error": "Stopped — could not plan the run (the planner returned unusable output)",
};

const APPROX_CAP_REASONS = new Set(["wall-clock", "dollar-ceiling", "usage-limit"]);

export function describeOutcome(state: RunState): string {
  if (state.status === "passed") return "Finished successfully — all stages passed";
  if (state.status === "running") return "Still running";
  const reason = state.haltReason ?? "unknown";
  const base = HALT_TEXT[reason] ?? `Stopped — ${reason}`;
  if (reason === "dollar-ceiling") return `${base} ($${state.budgetSpentUsd.toFixed(2)})`;
  if (APPROX_CAP_REASONS.has(reason)) return `${base}. Caps are checked between steps, so a run can go a little past them.`;
  return base;
}
```

- [ ] **Step 4: Run tests + typecheck**

Run: `npx vitest run tests/summary.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Full suite**

Run: `npx vitest run && npx tsc --noEmit`
Expected: entire suite PASS, typecheck clean.

- [ ] **Step 6: Commit**

```bash
git add src/report/summary.ts tests/summary.test.ts
git commit -m "feat(report): paused-not-failed language, usage-limit line, approximate-cap note"
```

---

## Final verification (before review/merge)

- [ ] `npx vitest run` — full suite green.
- [ ] `npx tsc --noEmit` — clean.
- [ ] **Gated E2E** (`RUN_E2E=1 npx vitest run`, real SDK, real cost) — confirm: (a) a run's transcript shows per-sprint test criteria and committed tests (Task Group 8); (b) an early stop leaves committed, tested work; (c) the summary reads "Paused …" with work saved.
- [ ] **Confirm the usage-limit boundary** (Task Group 4 caveat) against the real SDK error shape, or explicitly flag it as unverified in the handoff.
- [ ] **Independent review** of everything touching caps + loop control-flow (Task Groups 2, 3, 4) before merge — a fix is unreviewed code.

## Out of scope (deliberately deferred)

- The **read-only live dashboard** (phase ② stage 1 of the Dashboard) — separate track.
- The **true mid-work interrupt / hung-call guard / hard total-time ceiling** — phase ⑤ (only load-bearing unattended).
- Any change to the **negotiation/blind-eval adversarial mechanics** beyond the two prompt additions.

**Follow-ups surfaced by the first E2E run against a real repo (run `b79d8ron5`, Voice Tutor, 2026-07-15):**

- **Contract feasibility smoke-check.** Before generation starts, verify the frozen
  contract's acceptance-criteria commands can actually *execute* in the run env —
  e.g. that the tests/imports the criteria demand can at least be collected. In
  `b79d8ron5` sprint 1's contract required a dual-import proof (`import bot`), but the
  minimal verifier env lacked `bot.py`'s eager top-level deps (`anthropic`, Pipecat),
  so the suite died at collection and the contract was unsatisfiable — yet the loop
  spent a full sprint and ~$25 discovering that the slow way. A pre-generation
  feasibility gate would fail fast (or reject the contract at negotiation). See
  `docs/solutions/conventions/match-verifier-env-to-sprint-contract-imports.md`.
- **Stall detection — halt on no score improvement over N consecutive revisions.**
  Sprint 1 scored 12 → 22 → 18 and ran out the 30-min wall-clock instead of halting
  on lack of progress. Refines the existing no-progress mechanism
  (`noProgressDelta`/`noProgressWindow`), which didn't fire here because the scores
  oscillated (only one inter-iteration delta was < 5) and iterations were slow enough
  that wall-clock bound first. Detect a *plateau/ceiling* (best score over a window
  not improving), not just consecutive small deltas, so a stuck sprint stops on
  signal rather than on the clock.
- **Expose on-demand transcript rendering as a CLI command** — render any run's
  `transcript.md` from its `trace.jsonl` at will (covers killed runs, crashes, and
  re-rendering after renderer improvements). **Mostly built:** `renderTranscript(events,
  state)` is already a pure function that works on any trace regardless of run state —
  it has explicit branches for non-terminal runs ("Still running", "stopped while
  preparing this stage"). Confirmed 2026-07-16 by rendering the killed run `mrmzffye`'s
  transcript with a 9-line script that just duplicates `finalize()`'s body (read
  `state.json` + `trace.jsonl` → `renderTranscript` → write) — no trace hand-editing,
  no renderer workaround. Remaining work is thin wrapping: a `transcript <run>` command
  that resolves the run dir and calls the existing path. One cosmetic caveat — an
  externally *killed* process never writes a terminal status, so its `state.json` stays
  `status: "running"` and the header reads "Still running" rather than "Killed"; the
  command could optionally stamp a "(process not finalized)" note, but that's an
  enhancement, not a blocker.
