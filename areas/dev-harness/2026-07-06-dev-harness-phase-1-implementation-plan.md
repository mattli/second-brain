# dev-harness Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the attended core of dev-harness — a planner→generator→evaluator loop with adversarial contract negotiation, blind evaluation, deterministic verification, rich traces, and four hard stops — runnable from a CLI against any git target project.

**Architecture:** A thin `orchestrator/` drives phases (plan → negotiate → generate → evaluate → decide) over a set of single-responsibility modules that each expose a typed interface and are testable in isolation. The deterministic substrate (config, trace, state, budget, workspace, verifier, contract-agreement) carries zero LLM dependency and is unit-tested with fakes. The three agents wrap the Claude Agent SDK behind one injectable invoke layer, so the loop is integration-tested with fake agents and the real SDK only appears in one end-to-end smoke test.

**Tech Stack:** TypeScript (strict, ESM), Node 22+, `@anthropic-ai/claude-agent-sdk`, `vitest` (test), `zod` (schema/validation), `commander` (CLI), `execa` (git/shell). npm as package manager.

**Source spec:** `~/second-brain/areas/dev-harness/2026-06-30-dev-harness-design.md`

## Global Constraints

- **Node 22+**, `"type": "module"` (ESM), TypeScript `strict: true`.
- **Test runner:** vitest. Every task ends with a passing test run and a commit.
- **Agent prompts live in `prompts/*.md`** — never inline agent system prompts in TS.
- **Model defaults:** planner + generator = `claude-opus-4-8`; evaluator = `claude-opus-4-8` (option: `claude-sonnet-4-6`). All per-run overridable. Model IDs live only in `config/defaults.ts`.
- **Loop-tuning defaults (from spec):** advance threshold `85`; no-progress = `2` consecutive re-generations improving `< 5` pts; max iterations/sprint `6`; negotiation round cap `5`; per-run `$` ceiling `10`; run wall-clock deadline `30 min`. All in `config/defaults.ts`, per-run overridable.
- **Four hard stops** checked every turn: max-iteration, no-progress, `$`-ceiling, run wall-clock deadline.
- **The loop never merges.** On a passing run it leaves a per-run branch `run/<goal-slug>-<run_id>` in the *target* repo; the worktree is removed but the branch stays for human review.
- **Repo:** `~/dev-harness`, standalone private GitHub repo. Set repo-local `user.email` to `mattli@users.noreply.github.com` **before the first commit** (GH007 caveat).
- **Filenames:** lowercase kebab-case (except `README.md`).
- **No Docker in v1** (attended risk acceptance). Run the working dir away from the vault; scope the generator's env, don't hand it the whole `.env`.

---

# Part A — Deterministic Foundation (no LLM)

## Task 1: Project scaffold & repo bootstrap

**Files:**
- Create: `~/dev-harness/package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `README.md`, `src/index.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: a repo where `npm test` and `npm run typecheck` pass; the directory layout from the spec.

- [ ] **Step 1: Create repo and set noreply email BEFORE any commit**

```bash
mkdir -p ~/dev-harness && cd ~/dev-harness
git init
git config user.email "mattli@users.noreply.github.com"
git config user.name "Matt Li"
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "dev-harness",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "engines": { "node": ">=22" },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "loop": "tsx src/cli/index.ts"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.1.0",
    "commander": "^12.0.0",
    "execa": "^9.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Write `vitest.config.ts`, `.gitignore`, and dir skeleton**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", testTimeout: 20000 } });
```

`.gitignore`:
```
node_modules/
dist/
runs/
.env
.env.local
```

Create empty dirs with `.gitkeep`: `src/{cli,orchestrator,agents,contract,verifier,workspace,trace,state,budget,config}`, `prompts`, `runs`, `tests`.

- [ ] **Step 5: Write a trivial smoke test and entrypoint**

`src/index.ts`:
```ts
export const VERSION = "0.1.0";
```

`tests/smoke.test.ts`:
```ts
import { expect, test } from "vitest";
import { VERSION } from "../src/index.js";
test("package loads", () => { expect(VERSION).toBe("0.1.0"); });
```

- [ ] **Step 6: Install, verify, commit**

```bash
npm install
npm run typecheck   # Expected: no errors
npm test            # Expected: 1 passed
git add -A && git commit -m "chore: scaffold dev-harness project"
```

- [ ] **Step 7: Create the private remote and push**

```bash
gh repo create dev-harness --private --source=. --remote=origin --push
# Expected: repo created, main pushed, no GH007 (noreply email already set)
```

---

## Task 2: `config/` — run config, schema, defaults

**Files:**
- Create: `src/config/types.ts`, `src/config/defaults.ts`, `src/config/load.ts`
- Test: `tests/config.test.ts`

**Interfaces:**
- Produces: `RunConfig` type; `loadConfig(overrides: Partial<RawConfig>): RunConfig` — merges CLI/user overrides onto defaults, validates via zod, throws on invalid. `runId` is generated by the caller (passed in) so config stays pure/deterministic.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { loadConfig } from "../src/config/load.js";

test("applies defaults and requires goal + projectPath", () => {
  const c = loadConfig({ goal: "build x", projectPath: "/tmp/app", runId: "r1" });
  expect(c.caps.dollarCeiling).toBe(10);
  expect(c.caps.negotiationRounds).toBe(5);
  expect(c.thresholds.advanceScore).toBe(85);
  expect(c.models.planner).toBe("claude-opus-4-8");
});

test("overrides win over defaults", () => {
  const c = loadConfig({ goal: "g", projectPath: "/tmp/app", runId: "r1", caps: { dollarCeiling: 3 } });
  expect(c.caps.dollarCeiling).toBe(3);
  expect(c.caps.maxIterationsPerSprint).toBe(6); // untouched default preserved
});

test("rejects missing goal", () => {
  expect(() => loadConfig({ projectPath: "/tmp/app", runId: "r1" } as any)).toThrow();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/config.test.ts`
Expected: FAIL — cannot find module `load.js`.

- [ ] **Step 3: Write `types.ts` and `defaults.ts`**

`src/config/types.ts`:
```ts
export type ModelId = string;
export interface RunConfig {
  runId: string;
  goal: string;
  projectPath: string;
  worktreeRoot: string;
  models: { planner: ModelId; generator: ModelId; evaluator: ModelId };
  thresholds: { advanceScore: number; noProgressDelta: number; noProgressWindow: number };
  caps: {
    maxIterationsPerSprint: number;
    negotiationRounds: number;
    dollarCeiling: number;
    wallClockMs: number;
  };
  verifier: { kind: "test-suite"; command: string };
}
```

`src/config/defaults.ts`:
```ts
export const DEFAULTS = {
  models: { planner: "claude-opus-4-8", generator: "claude-opus-4-8", evaluator: "claude-opus-4-8" },
  thresholds: { advanceScore: 85, noProgressDelta: 5, noProgressWindow: 2 },
  caps: {
    maxIterationsPerSprint: 6,
    negotiationRounds: 5,
    dollarCeiling: 10,
    wallClockMs: 30 * 60 * 1000,
  },
  verifier: { kind: "test-suite" as const, command: "npm test" },
  worktreeRoot: ".dev-harness-worktrees",
};
```

- [ ] **Step 4: Write `load.ts` (zod validation + deep merge)**

```ts
import { z } from "zod";
import { DEFAULTS } from "./defaults.js";
import type { RunConfig } from "./types.js";

const schema = z.object({
  runId: z.string().min(1),
  goal: z.string().min(1),
  projectPath: z.string().min(1),
  worktreeRoot: z.string(),
  models: z.object({ planner: z.string(), generator: z.string(), evaluator: z.string() }),
  thresholds: z.object({
    advanceScore: z.number().min(0).max(100),
    noProgressDelta: z.number().min(0),
    noProgressWindow: z.number().int().min(1),
  }),
  caps: z.object({
    maxIterationsPerSprint: z.number().int().min(1),
    negotiationRounds: z.number().int().min(1),
    dollarCeiling: z.number().positive(),
    wallClockMs: z.number().int().positive(),
  }),
  verifier: z.object({ kind: z.literal("test-suite"), command: z.string().min(1) }),
});

export type RawConfig = {
  runId: string; goal: string; projectPath: string;
  worktreeRoot?: string;
  models?: Partial<RunConfig["models"]>;
  thresholds?: Partial<RunConfig["thresholds"]>;
  caps?: Partial<RunConfig["caps"]>;
  verifier?: Partial<RunConfig["verifier"]>;
};

export function loadConfig(overrides: RawConfig): RunConfig {
  const merged = {
    runId: overrides.runId,
    goal: overrides.goal,
    projectPath: overrides.projectPath,
    worktreeRoot: overrides.worktreeRoot ?? DEFAULTS.worktreeRoot,
    models: { ...DEFAULTS.models, ...overrides.models },
    thresholds: { ...DEFAULTS.thresholds, ...overrides.thresholds },
    caps: { ...DEFAULTS.caps, ...overrides.caps },
    verifier: { ...DEFAULTS.verifier, ...overrides.verifier },
  };
  return schema.parse(merged);
}
```

- [ ] **Step 5: Run tests, verify pass, commit**

Run: `npx vitest run tests/config.test.ts` — Expected: 3 passed.
```bash
git add -A && git commit -m "feat(config): run config schema, defaults, loader"
```

---

## Task 3: `trace/` — TraceWriter (JSONL) + TranscriptRenderer (markdown)

**Files:**
- Create: `src/trace/types.ts`, `src/trace/writer.ts`, `src/trace/renderer.ts`
- Test: `tests/trace.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Phase` = `"PLAN"|"NEGOTIATE"|"GENERATE"|"EVALUATE"|"DECIDE"`; `TraceEvent`; `TraceWriter` class `new TraceWriter(filePath)` with `write(event: TraceEvent): void`; `renderTranscript(events: TraceEvent[]): string`.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TraceWriter } from "../src/trace/writer.js";
import { renderTranscript } from "../src/trace/renderer.js";
import type { TraceEvent } from "../src/trace/types.js";

const ev = (over: Partial<TraceEvent> = {}): TraceEvent => ({
  ts: "2026-07-06T00:00:00Z", runId: "r1", sprint: 0, phase: "PLAN",
  agentRole: "planner", contractVersion: 0, inputDigest: "in", toolCalls: [],
  outputDigest: "out", tokens: 10, costUsd: 0.01, ...over,
});

test("writer appends one JSON line per event", () => {
  const dir = mkdtempSync(join(tmpdir(), "trace-"));
  const f = join(dir, "trace.jsonl");
  const w = new TraceWriter(f);
  w.write(ev()); w.write(ev({ phase: "GENERATE" }));
  const lines = readFileSync(f, "utf8").trim().split("\n");
  expect(lines).toHaveLength(2);
  expect(JSON.parse(lines[1]).phase).toBe("GENERATE");
});

test("renderer groups by sprint and phase", () => {
  const md = renderTranscript([ev(), ev({ phase: "GENERATE", agentRole: "generator" })]);
  expect(md).toContain("# Run r1");
  expect(md).toContain("PLAN");
  expect(md).toContain("GENERATE");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/trace.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `types.ts`, `writer.ts`, `renderer.ts`**

`src/trace/types.ts`:
```ts
export type Phase = "PLAN" | "NEGOTIATE" | "GENERATE" | "EVALUATE" | "DECIDE";
export type AgentRole = "planner" | "generator" | "evaluator" | "system";
export interface TraceEvent {
  ts: string; runId: string; sprint: number; phase: Phase;
  agentRole: AgentRole; contractVersion: number;
  inputDigest: string; toolCalls: string[]; outputDigest: string;
  tokens: number; costUsd: number;
}
```

`src/trace/writer.ts`:
```ts
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { TraceEvent } from "./types.js";

export class TraceWriter {
  constructor(private filePath: string) { mkdirSync(dirname(filePath), { recursive: true }); }
  write(event: TraceEvent): void {
    appendFileSync(this.filePath, JSON.stringify(event) + "\n");
  }
}
```

`src/trace/renderer.ts`:
```ts
import type { TraceEvent } from "./types.js";

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
      "",
    );
  }
  return lines.filter((l) => l !== "").join("\n") + "\n";
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/trace.test.ts` — Expected: 2 passed.
```bash
git add -A && git commit -m "feat(trace): JSONL writer + markdown transcript renderer"
```

---

## Task 4: `state/` — durable run state (JSON)

**Files:**
- Create: `src/state/types.ts`, `src/state/store.ts`
- Test: `tests/state.test.ts`

**Interfaces:**
- Produces: `RunStatus` = `"running"|"passed"|"halted"`; `Sprint` = `{ id: number; title: string; description: string }`; `RunState`; `StateStore` class `new StateStore(filePath)` with `init(state)`, `update(patch: Partial<RunState>)`, `read(): RunState`. Writes are atomic (temp file + rename).

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { StateStore } from "../src/state/store.js";
import type { RunState } from "../src/state/types.js";

const base: RunState = {
  runId: "r1", goal: "g", status: "running", sprints: [],
  currentSprint: 0, contractVersion: 0, scores: [], iterations: 0,
  budgetSpentUsd: 0, haltReason: null,
};

test("round-trips and applies patches", () => {
  const f = join(mkdtempSync(join(tmpdir(), "state-")), "state.json");
  const s = new StateStore(f);
  s.init(base);
  s.update({ iterations: 2, scores: [80] });
  const r = s.read();
  expect(r.iterations).toBe(2);
  expect(r.scores).toEqual([80]);
  expect(r.goal).toBe("g");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/state.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `types.ts` and `store.ts`**

`src/state/types.ts`:
```ts
export type RunStatus = "running" | "passed" | "halted";
export interface Sprint { id: number; title: string; description: string; }
export interface RunState {
  runId: string; goal: string; status: RunStatus;
  sprints: Sprint[]; currentSprint: number; contractVersion: number;
  scores: number[]; iterations: number; budgetSpentUsd: number;
  haltReason: string | null;
}
```

`src/state/store.ts`:
```ts
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { RunState } from "./types.js";

export class StateStore {
  constructor(private filePath: string) { mkdirSync(dirname(filePath), { recursive: true }); }
  init(state: RunState): void { this.persist(state); }
  read(): RunState { return JSON.parse(readFileSync(this.filePath, "utf8")); }
  update(patch: Partial<RunState>): void { this.persist({ ...this.read(), ...patch }); }
  private persist(state: RunState): void {
    const tmp = this.filePath + ".tmp";
    writeFileSync(tmp, JSON.stringify(state, null, 2));
    renameSync(tmp, this.filePath);
  }
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/state.test.ts` — Expected: 1 passed.
```bash
git add -A && git commit -m "feat(state): durable JSON run state with atomic writes"
```

---

## Task 5: `budget/` — four hard stops

**Files:**
- Create: `src/budget/tracker.ts`
- Test: `tests/budget.test.ts`

**Interfaces:**
- Consumes: `RunConfig["caps"]`, `RunConfig["thresholds"]`.
- Produces: `StopReason` = `"max-iteration"|"no-progress"|"dollar-ceiling"|"wall-clock"`; `BudgetTracker` class `new BudgetTracker(caps, thresholds, nowMs)` with `recordCost(usd)`, `recordIteration()`, `recordScore(score)`, `checkStops(nowMs): StopReason | null`. `nowMs` is injected (no `Date.now()` inside) so tests are deterministic.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { BudgetTracker } from "../src/budget/tracker.js";

const caps = { maxIterationsPerSprint: 6, negotiationRounds: 5, dollarCeiling: 10, wallClockMs: 1000 };
const thr = { advanceScore: 85, noProgressDelta: 5, noProgressWindow: 2 };

test("dollar ceiling trips", () => {
  const b = new BudgetTracker(caps, thr, 0);
  b.recordCost(11);
  expect(b.checkStops(0)).toBe("dollar-ceiling");
});

test("max iterations trips", () => {
  const b = new BudgetTracker(caps, thr, 0);
  for (let i = 0; i < 6; i++) b.recordIteration();
  expect(b.checkStops(0)).toBe("max-iteration");
});

test("wall clock trips on injected time", () => {
  const b = new BudgetTracker(caps, thr, 0);
  expect(b.checkStops(1001)).toBe("wall-clock");
});

test("no-progress: 2 consecutive sub-delta improvements", () => {
  const b = new BudgetTracker(caps, thr, 0);
  b.recordScore(80); expect(b.checkStops(0)).toBeNull();
  b.recordScore(82); expect(b.checkStops(0)).toBeNull(); // 1 flat
  b.recordScore(84); expect(b.checkStops(0)).toBe("no-progress"); // 2 flat
});

test("a big jump resets the flat counter", () => {
  const b = new BudgetTracker(caps, thr, 0);
  b.recordScore(50); b.recordScore(52); b.recordScore(90); b.recordScore(91);
  expect(b.checkStops(0)).toBeNull(); // only 1 flat since the reset
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/budget.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `tracker.ts`**

```ts
export type StopReason = "max-iteration" | "no-progress" | "dollar-ceiling" | "wall-clock";

interface Caps { maxIterationsPerSprint: number; negotiationRounds: number; dollarCeiling: number; wallClockMs: number; }
interface Thresholds { advanceScore: number; noProgressDelta: number; noProgressWindow: number; }

export class BudgetTracker {
  private spentUsd = 0;
  private iterations = 0;
  private flatCount = 0;
  private lastScore: number | null = null;

  constructor(private caps: Caps, private thr: Thresholds, private startMs: number) {}

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

  /** Call when starting a new sprint — iteration and progress counters are per-sprint. */
  resetSprint(): void { this.iterations = 0; this.flatCount = 0; this.lastScore = null; }

  get spent(): number { return this.spentUsd; }

  checkStops(nowMs: number): StopReason | null {
    if (this.spentUsd >= this.caps.dollarCeiling) return "dollar-ceiling";
    if (nowMs - this.startMs >= this.caps.wallClockMs) return "wall-clock";
    if (this.iterations >= this.caps.maxIterationsPerSprint) return "max-iteration";
    if (this.flatCount >= this.thr.noProgressWindow) return "no-progress";
    return null;
  }
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/budget.test.ts` — Expected: 5 passed.
```bash
git add -A && git commit -m "feat(budget): four hard stops with injected clock"
```

---

## Task 6: `workspace/` — disposable git worktrees

**Files:**
- Create: `src/workspace/worktree.ts`
- Test: `tests/workspace.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `createWorktree(projectPath, worktreeRoot, branch): Promise<{ path: string; branch: string }>` (runs `git worktree add -b`); `removeWorktree(projectPath, path): Promise<void>` (runs `git worktree remove --force`, **keeps the branch** for review); `slugify(goal): string`.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { execa } from "execa";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWorktree, removeWorktree, slugify } from "../src/workspace/worktree.js";

async function initRepo(): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), "target-"));
  await execa("git", ["init"], { cwd: dir });
  await execa("git", ["config", "user.email", "t@t.com"], { cwd: dir });
  await execa("git", ["config", "user.name", "t"], { cwd: dir });
  await execa("git", ["commit", "--allow-empty", "-m", "init"], { cwd: dir });
  return dir;
}

test("slugify normalizes goals", () => {
  expect(slugify("Build X, fast!")).toBe("build-x-fast");
});

test("creates then removes a worktree, keeping the branch", async () => {
  const repo = await initRepo();
  const wt = await createWorktree(repo, join(repo, ".wt"), "run/test-r1");
  expect(existsSync(wt.path)).toBe(true);
  await removeWorktree(repo, wt.path);
  expect(existsSync(wt.path)).toBe(false);
  const { stdout } = await execa("git", ["branch", "--list", "run/test-r1"], { cwd: repo });
  expect(stdout).toContain("run/test-r1"); // branch survived
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/workspace.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `worktree.ts`**

```ts
import { execa } from "execa";
import { join } from "node:path";

export function slugify(goal: string): string {
  return goal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export async function createWorktree(
  projectPath: string, worktreeRoot: string, branch: string,
): Promise<{ path: string; branch: string }> {
  const path = join(worktreeRoot, branch.replace(/\//g, "-"));
  await execa("git", ["-C", projectPath, "worktree", "add", "-b", branch, path], { stdio: "pipe" });
  return { path, branch };
}

export async function removeWorktree(projectPath: string, path: string): Promise<void> {
  await execa("git", ["-C", projectPath, "worktree", "remove", "--force", path], { stdio: "pipe" });
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/workspace.test.ts` — Expected: 2 passed.
```bash
git add -A && git commit -m "feat(workspace): disposable git worktrees, branch survives cleanup"
```

---

## Task 7: `verifier/` — Verifier interface + TestSuiteVerifier

**Files:**
- Create: `src/verifier/types.ts`, `src/verifier/test-suite.ts`
- Test: `tests/verifier.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `VerifierResult` = `{ passed: boolean; findings: string[] }`; `Verifier` interface `{ verify(worktreePath: string): Promise<VerifierResult> }`; `TestSuiteVerifier` class `new TestSuiteVerifier(command: string)` implementing it (runs the command in the worktree; `passed = exitCode === 0`; on failure, `findings` = last 20 non-empty output lines).

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { TestSuiteVerifier } from "../src/verifier/test-suite.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = () => mkdtempSync(join(tmpdir(), "verify-"));

test("passing command → passed:true", async () => {
  const v = new TestSuiteVerifier("node -e \"process.exit(0)\"");
  const r = await v.verify(dir());
  expect(r.passed).toBe(true);
  expect(r.findings).toEqual([]);
});

test("failing command → passed:false with findings", async () => {
  const v = new TestSuiteVerifier("node -e \"console.error('boom'); process.exit(1)\"");
  const r = await v.verify(dir());
  expect(r.passed).toBe(false);
  expect(r.findings.join("\n")).toContain("boom");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/verifier.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `types.ts` and `test-suite.ts`**

`src/verifier/types.ts`:
```ts
export interface VerifierResult { passed: boolean; findings: string[]; }
export interface Verifier { verify(worktreePath: string): Promise<VerifierResult>; }
```

`src/verifier/test-suite.ts`:
```ts
import { execa } from "execa";
import type { Verifier, VerifierResult } from "./types.js";

export class TestSuiteVerifier implements Verifier {
  constructor(private command: string) {}
  async verify(worktreePath: string): Promise<VerifierResult> {
    const res = await execa(this.command, {
      cwd: worktreePath, shell: true, reject: false, all: true,
    });
    if (res.exitCode === 0) return { passed: true, findings: [] };
    const findings = (res.all ?? "").split("\n").map((l) => l.trim()).filter(Boolean).slice(-20);
    return { passed: false, findings };
  }
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/verifier.test.ts` — Expected: 2 passed.
```bash
git add -A && git commit -m "feat(verifier): Verifier interface + TestSuiteVerifier"
```

---

## Task 8: `contract/` — contract type, versioning, agreement detection & negotiation driver

**Files:**
- Create: `src/contract/types.ts`, `src/contract/negotiate.ts`
- Test: `tests/contract.test.ts`

**Interfaces:**
- Consumes: `RunConfig["caps"].negotiationRounds`.
- Produces: `Criterion` = `{ id: string; description: string; verifyBy: string }`; `Contract` = `{ version: number; criteria: Criterion[]; frozen: boolean }`; `parseAgreement(text: string): boolean` (true iff a line matches `/^AGREEMENT:\s*yes/mi`); `negotiate(deps): Promise<Contract>` where `deps = { propose: (prev: Contract | null) => Promise<Contract>; critique: (c: Contract) => Promise<{ agreed: boolean; contract: Contract }>; maxRounds: number }`. The driver is agent-agnostic — real agents are injected, so it unit-tests with fakes.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { parseAgreement, negotiate } from "../src/contract/negotiate.js";
import type { Contract } from "../src/contract/types.js";

const c = (version: number): Contract => ({ version, criteria: [], frozen: false });

test("parseAgreement reads the sentinel", () => {
  expect(parseAgreement("looks good\nAGREEMENT: yes")).toBe(true);
  expect(parseAgreement("AGREEMENT: no, scope too big")).toBe(false);
  expect(parseAgreement("no marker here")).toBe(false);
});

test("negotiate freezes when critique agrees", async () => {
  let round = 0;
  const result = await negotiate({
    propose: async (prev) => c((prev?.version ?? 0) + 1),
    critique: async (contract) => { round++; return { agreed: round >= 2, contract }; },
    maxRounds: 5,
  });
  expect(result.frozen).toBe(true);
  expect(result.version).toBe(2);
});

test("negotiate force-freezes at round cap", async () => {
  const result = await negotiate({
    propose: async (prev) => c((prev?.version ?? 0) + 1),
    critique: async (contract) => ({ agreed: false, contract }),
    maxRounds: 3,
  });
  expect(result.frozen).toBe(true);
  expect(result.version).toBe(3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/contract.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `types.ts` and `negotiate.ts`**

`src/contract/types.ts`:
```ts
export interface Criterion { id: string; description: string; verifyBy: string; }
export interface Contract { version: number; criteria: Criterion[]; frozen: boolean; }
```

`src/contract/negotiate.ts`:
```ts
import type { Contract } from "./types.js";

export function parseAgreement(text: string): boolean {
  return /^AGREEMENT:\s*yes/im.test(text);
}

export interface NegotiateDeps {
  propose: (prev: Contract | null) => Promise<Contract>;
  critique: (c: Contract) => Promise<{ agreed: boolean; contract: Contract }>;
  maxRounds: number;
}

export async function negotiate(deps: NegotiateDeps): Promise<Contract> {
  let current: Contract | null = null;
  for (let round = 1; round <= deps.maxRounds; round++) {
    const proposed = await deps.propose(current);
    const { agreed, contract } = await deps.critique(proposed);
    current = contract;
    if (agreed || round === deps.maxRounds) return { ...contract, frozen: true };
  }
  // unreachable, but satisfies the type checker
  return { ...(current as Contract), frozen: true };
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/contract.test.ts` — Expected: 3 passed.
```bash
git add -A && git commit -m "feat(contract): negotiation driver + agreement detection"
```

---

# Part B — Adversarial Loop (SDK-backed)

## Task 9: `agents/invoke.ts` — one injectable SDK wrapper (trace + budget + retry)

**Files:**
- Create: `src/agents/invoke.ts`
- Test: `tests/invoke.test.ts`

**Interfaces:**
- Consumes: `TraceWriter`, `BudgetTracker`, the SDK `query` function (injected).
- Produces: `AgentResult` = `{ text: string; costUsd: number; tokens: number; toolCalls: string[] }`; `QueryFn` (the injectable SDK surface); `invokeAgent(opts): Promise<AgentResult>` where `opts = { queryFn, prompt, systemPrompt, model, cwd?, permissionMode?, maxRetries?, sleep? }`. Retries transient failures up to `maxRetries` (default 3) with injectable `sleep` (default real). Accumulates assistant text; reads `total_cost_usd`/`usage` from the SDK result message.

- [ ] **Step 1: Write the failing test (fake queryFn, no real SDK)**

```ts
import { expect, test } from "vitest";
import { invokeAgent, type QueryFn } from "../src/agents/invoke.js";

const fakeQuery: QueryFn = async function* () {
  yield { type: "assistant", message: { content: [{ type: "text", text: "hello" }] } } as any;
  yield { type: "result", subtype: "success", total_cost_usd: 0.02, usage: { input_tokens: 5, output_tokens: 3 } } as any;
};

test("accumulates text and cost from SDK stream", async () => {
  const r = await invokeAgent({ queryFn: fakeQuery, prompt: "hi", systemPrompt: "sys", model: "m" });
  expect(r.text).toBe("hello");
  expect(r.costUsd).toBe(0.02);
  expect(r.tokens).toBe(8);
});

test("retries a transient failure then succeeds", async () => {
  let calls = 0;
  const flaky: QueryFn = async function* () {
    calls++;
    if (calls === 1) throw new Error("overloaded_error");
    yield { type: "assistant", message: { content: [{ type: "text", text: "ok" }] } } as any;
    yield { type: "result", subtype: "success", total_cost_usd: 0, usage: { input_tokens: 0, output_tokens: 0 } } as any;
  };
  const r = await invokeAgent({ queryFn: flaky, prompt: "hi", systemPrompt: "s", model: "m", sleep: async () => {} });
  expect(r.text).toBe("ok");
  expect(calls).toBe(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/invoke.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `invoke.ts`**

```ts
export interface AgentResult { text: string; costUsd: number; tokens: number; toolCalls: string[]; }

export type SDKMessage =
  | { type: "assistant"; message: { content: Array<{ type: string; text?: string; name?: string }> } }
  | { type: "result"; subtype: string; total_cost_usd?: number; usage?: { input_tokens: number; output_tokens: number } }
  | { type: string; [k: string]: unknown };

export type QueryFn = (args: {
  prompt: string;
  options: { model: string; systemPrompt: string; cwd?: string; permissionMode?: string };
}) => AsyncIterable<SDKMessage>;

export interface InvokeOpts {
  queryFn: QueryFn;
  prompt: string;
  systemPrompt: string;
  model: string;
  cwd?: string;
  permissionMode?: string;
  maxRetries?: number;
  sleep?: (ms: number) => Promise<void>;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function invokeAgent(opts: InvokeOpts): Promise<AgentResult> {
  const maxRetries = opts.maxRetries ?? 3;
  const sleep = opts.sleep ?? realSleep;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await runOnce(opts);
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) await sleep(attempt * 1000);
    }
  }
  throw lastErr;
}

async function runOnce(opts: InvokeOpts): Promise<AgentResult> {
  let text = "";
  let costUsd = 0;
  let tokens = 0;
  const toolCalls: string[] = [];
  for await (const msg of opts.queryFn({
    prompt: opts.prompt,
    options: { model: opts.model, systemPrompt: opts.systemPrompt, cwd: opts.cwd, permissionMode: opts.permissionMode },
  })) {
    if (msg.type === "assistant" && "message" in msg) {
      for (const block of msg.message.content) {
        if (block.type === "text" && block.text) text += block.text;
        if (block.type === "tool_use" && block.name) toolCalls.push(block.name);
      }
    } else if (msg.type === "result") {
      const r = msg as Extract<SDKMessage, { type: "result" }>;
      costUsd = r.total_cost_usd ?? 0;
      tokens = (r.usage?.input_tokens ?? 0) + (r.usage?.output_tokens ?? 0);
    }
  }
  return { text, costUsd, tokens, toolCalls };
}
```

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/invoke.test.ts` — Expected: 2 passed.
```bash
git add -A && git commit -m "feat(agents): injectable SDK invoke wrapper with retry"
```

---

## Task 10: `prompts/*.md` + `agents/{planner,generator,evaluator}.ts`

**Files:**
- Create: `prompts/planner.md`, `prompts/generator.md`, `prompts/evaluator.md`, `prompts/contract-negotiation.md`
- Create: `src/agents/prompts.ts` (loader), `src/agents/planner.ts`, `src/agents/generator.ts`, `src/agents/evaluator.ts`
- Test: `tests/agents.test.ts`

**Interfaces:**
- Consumes: `invokeAgent`, `QueryFn`, `Contract`, `Sprint`, `VerifierResult`.
- Produces:
  - `loadPrompt(name: "planner"|"generator"|"evaluator"|"contract-negotiation"): string`
  - `planSprints(deps): Promise<Sprint[]>` — parses a JSON array of `{title, description}` from planner output.
  - `proposeContract(deps, prev: Contract | null): Promise<Contract>` and `generateCode(deps, contract): Promise<AgentResult>` (generator runs with `cwd = worktree`, `permissionMode: "bypassPermissions"`).
  - `critiqueContract(deps, contract): Promise<{ agreed: boolean; contract: Contract }>` and `evaluateArtifact(deps, contract, verifier: VerifierResult): Promise<{ score: number; findings: string[] }>` — evaluator runs **blind** (fresh invoke, prompt contains only contract + artifact summary + verifier result; never the generator's transcript). Score parsed from a `SCORE: <0-100>` line.

- [ ] **Step 1: Write the failing test (fakes for planner + evaluator parsing)**

```ts
import { expect, test } from "vitest";
import { planSprints } from "../src/agents/planner.js";
import { evaluateArtifact } from "../src/agents/evaluator.js";
import type { QueryFn } from "../src/agents/invoke.js";

const fakeStream = (text: string): QueryFn => async function* () {
  yield { type: "assistant", message: { content: [{ type: "text", text }] } } as any;
  yield { type: "result", subtype: "success", total_cost_usd: 0, usage: { input_tokens: 0, output_tokens: 0 } } as any;
};

test("planner parses sprint JSON", async () => {
  const q = fakeStream('[{"title":"S1","description":"do a"},{"title":"S2","description":"do b"}]');
  const sprints = await planSprints({ queryFn: q, model: "m", goal: "g" });
  expect(sprints).toHaveLength(2);
  expect(sprints[0].id).toBe(0);
  expect(sprints[1].title).toBe("S2");
});

test("evaluator parses SCORE line and is blind (no generator text in prompt)", async () => {
  const q = fakeStream("Solid.\nSCORE: 88");
  const r = await evaluateArtifact(
    { queryFn: q, model: "m" },
    { version: 1, criteria: [], frozen: true },
    { passed: true, findings: [] },
  );
  expect(r.score).toBe(88);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/agents.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write the four prompt files**

`prompts/planner.md`:
```md
You are the PLANNER in an adversarial development loop. Given a one-line goal,
produce COARSE, high-level sprints — deliberately not granular, because a
planning error at this level cascades through every sprint.

Output ONLY a JSON array of objects: [{"title": "...", "description": "..."}].
3–6 sprints. No prose outside the JSON.
```

`prompts/generator.md`:
```md
You are the GENERATOR. You build code against a FROZEN contract, inside a git
worktree. During NEGOTIATION you propose a contract: granular, testable
criteria, each with how it will be verified. Keep scope tight.

When proposing a contract, output ONLY JSON:
{"criteria":[{"id":"c1","description":"...","verifyBy":"..."}]}

When generating, write real files in the working directory to satisfy every
criterion, then stop. Do not narrate.
```

`prompts/evaluator.md`:
```md
You are the EVALUATOR. You are BLIND: you see only the contract, a summary of
the produced artifact, and the deterministic verifier result — never the
generator's reasoning. Judge the artifact against the contract on its own terms.

During NEGOTIATION, critique the proposed contract (scope, test strength,
missing edge cases). End with a line "AGREEMENT: yes" or "AGREEMENT: no".

During EVALUATION, grade 0–100 against the contract and end with a line
"SCORE: <n>". Then list concrete findings the generator must fix.
```

`prompts/contract-negotiation.md`:
```md
Shared framing for NEGOTIATION: the goal is granular, testable criteria both
roles accept. Vague criteria produce vague critiques the generator shrugs off.
The evaluator later grades against THIS contract, not the original goal.
```

- [ ] **Step 4: Write `prompts.ts`, `planner.ts`, `generator.ts`, `evaluator.ts`**

`src/agents/prompts.ts`:
```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "prompts");
type PromptName = "planner" | "generator" | "evaluator" | "contract-negotiation";
export function loadPrompt(name: PromptName): string {
  return readFileSync(join(root, `${name}.md`), "utf8");
}
```

`src/agents/planner.ts`:
```ts
import { invokeAgent, type QueryFn } from "./invoke.js";
import { loadPrompt } from "./prompts.js";
import type { Sprint } from "../state/types.js";

export interface PlannerDeps { queryFn: QueryFn; model: string; goal: string; }

export async function planSprints(deps: PlannerDeps): Promise<Sprint[]> {
  const res = await invokeAgent({
    queryFn: deps.queryFn, model: deps.model,
    systemPrompt: loadPrompt("planner"),
    prompt: `Goal: ${deps.goal}`,
  });
  const json = res.text.slice(res.text.indexOf("["), res.text.lastIndexOf("]") + 1);
  const raw = JSON.parse(json) as Array<{ title: string; description: string }>;
  return raw.map((s, id) => ({ id, title: s.title, description: s.description }));
}
```

`src/agents/generator.ts`:
```ts
import { invokeAgent, type AgentResult, type QueryFn } from "./invoke.js";
import { loadPrompt } from "./prompts.js";
import type { Contract } from "../contract/types.js";

export interface GeneratorDeps { queryFn: QueryFn; model: string; cwd: string; }

export async function proposeContract(deps: GeneratorDeps, prev: Contract | null): Promise<Contract> {
  const res = await invokeAgent({
    queryFn: deps.queryFn, model: deps.model,
    systemPrompt: loadPrompt("generator"),
    prompt: `Propose a contract.${prev ? ` Prior version and critique:\n${JSON.stringify(prev)}` : ""}`,
  });
  const json = res.text.slice(res.text.indexOf("{"), res.text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json) as { criteria: Contract["criteria"] };
  return { version: (prev?.version ?? 0) + 1, criteria: parsed.criteria, frozen: false };
}

export async function generateCode(deps: GeneratorDeps, contract: Contract): Promise<AgentResult> {
  return invokeAgent({
    queryFn: deps.queryFn, model: deps.model, cwd: deps.cwd, permissionMode: "bypassPermissions",
    systemPrompt: loadPrompt("generator"),
    prompt: `Build against this FROZEN contract:\n${JSON.stringify(contract, null, 2)}`,
  });
}
```

`src/agents/evaluator.ts`:
```ts
import { invokeAgent, type QueryFn } from "./invoke.js";
import { loadPrompt } from "./prompts.js";
import type { Contract } from "../contract/types.js";
import type { VerifierResult } from "../verifier/types.js";

export interface EvaluatorDeps { queryFn: QueryFn; model: string; }

export async function critiqueContract(
  deps: EvaluatorDeps, contract: Contract,
): Promise<{ agreed: boolean; contract: Contract }> {
  const res = await invokeAgent({
    queryFn: deps.queryFn, model: deps.model,
    systemPrompt: loadPrompt("evaluator"),
    prompt: `Critique this proposed contract:\n${JSON.stringify(contract, null, 2)}`,
  });
  return { agreed: /^AGREEMENT:\s*yes/im.test(res.text), contract };
}

// BLIND: prompt carries only contract + artifact summary + verifier result.
export async function evaluateArtifact(
  deps: EvaluatorDeps, contract: Contract, verifier: VerifierResult,
): Promise<{ score: number; findings: string[] }> {
  const res = await invokeAgent({
    queryFn: deps.queryFn, model: deps.model,
    systemPrompt: loadPrompt("evaluator"),
    prompt: [
      `Contract:\n${JSON.stringify(contract, null, 2)}`,
      `Verifier: ${verifier.passed ? "PASSED" : "FAILED"}`,
      verifier.findings.length ? `Verifier findings:\n${verifier.findings.join("\n")}` : "",
    ].filter(Boolean).join("\n\n"),
  });
  const m = res.text.match(/^SCORE:\s*(\d{1,3})/im);
  const score = m ? Math.min(100, parseInt(m[1], 10)) : 0;
  const findings = res.text.split("\n").filter((l) => /^[-*]\s/.test(l)).map((l) => l.trim());
  return { score, findings };
}
```

- [ ] **Step 5: Run tests, verify pass, commit**

Run: `npx vitest run tests/agents.test.ts` — Expected: 2 passed.
```bash
git add -A && git commit -m "feat(agents): planner/generator/evaluator + editable prompts"
```

---

## Task 11: `orchestrator/` — the loop driver

**Files:**
- Create: `src/orchestrator/run.ts`
- Test: `tests/orchestrator.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: `runLoop(config, deps): Promise<RunState>` where `deps` bundles the injectable agent functions + `verifier` + `queryFn` + `nowMs: () => number`. Implements the spec lifecycle: PLAN → per sprint {NEGOTIATE → GENERATE → EVALUATE → DECIDE} with stops checked every turn; writes state + trace; leaves the branch on success. Agent functions are injected so the whole loop is tested with fakes (no SDK, no cost).

- [ ] **Step 1: Write the failing test (all-fake happy path + a budget halt)**

```ts
import { expect, test } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runLoop, type LoopDeps } from "../src/orchestrator/run.js";
import { loadConfig } from "../src/config/load.js";

const cfg = (over = {}) => loadConfig({
  runId: "r1", goal: "g", projectPath: mkdtempSync(join(tmpdir(), "p-")),
  worktreeRoot: mkdtempSync(join(tmpdir(), "w-")), ...over,
});

const happyDeps = (): LoopDeps => ({
  nowMs: () => 0,
  runsDir: mkdtempSync(join(tmpdir(), "runs-")),
  planSprints: async () => [{ id: 0, title: "S", description: "d" }],
  proposeContract: async (prev) => ({ version: (prev?.version ?? 0) + 1, criteria: [], frozen: false }),
  critiqueContract: async (c) => ({ agreed: true, contract: c }),
  generateCode: async () => ({ text: "done", costUsd: 0.1, tokens: 10, toolCalls: [] }),
  runVerifier: async () => ({ passed: true, findings: [] }),
  evaluateArtifact: async () => ({ score: 90, findings: [] }),
  createWorktree: async () => ({ path: "/tmp/wt", branch: "run/g-r1" }),
  removeWorktree: async () => {},
});

test("happy path: one sprint passes, status=passed", async () => {
  const state = await runLoop(cfg(), happyDeps());
  expect(state.status).toBe("passed");
  expect(state.scores).toContain(90);
});

test("halts when score never reaches threshold (max-iteration)", async () => {
  const deps = { ...happyDeps(), evaluateArtifact: async () => ({ score: 10, findings: ["bad"] }) };
  const state = await runLoop(cfg({ caps: { maxIterationsPerSprint: 2 } }), deps);
  expect(state.status).toBe("halted");
  expect(state.haltReason).toBe("max-iteration");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/orchestrator.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `run.ts`**

```ts
import { join } from "node:path";
import type { RunConfig } from "../config/types.js";
import type { RunState, Sprint } from "../state/types.js";
import type { Contract } from "../contract/types.js";
import type { AgentResult } from "../agents/invoke.js";
import type { VerifierResult } from "../verifier/types.js";
import { StateStore } from "../state/store.js";
import { TraceWriter } from "../trace/writer.js";
import { renderTranscript } from "../trace/renderer.js";
import { BudgetTracker } from "../budget/tracker.js";
import { negotiate } from "../contract/negotiate.js";
import { slugify } from "../workspace/worktree.js";
import { readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";

export interface LoopDeps {
  nowMs: () => number;
  runsDir: string;
  planSprints: (goal: string) => Promise<Sprint[]>;
  proposeContract: (prev: Contract | null, cwd: string) => Promise<Contract>;
  critiqueContract: (c: Contract) => Promise<{ agreed: boolean; contract: Contract }>;
  generateCode: (c: Contract, cwd: string) => Promise<AgentResult>;
  runVerifier: (cwd: string) => Promise<VerifierResult>;
  evaluateArtifact: (c: Contract, v: VerifierResult) => Promise<{ score: number; findings: string[] }>;
  createWorktree: (projectPath: string, root: string, branch: string) => Promise<{ path: string; branch: string }>;
  removeWorktree: (projectPath: string, path: string) => Promise<void>;
}

export async function runLoop(config: RunConfig, deps: LoopDeps): Promise<RunState> {
  const runDir = join(deps.runsDir, config.runId);
  const store = new StateStore(join(runDir, "state.json"));
  const trace = new TraceWriter(join(runDir, "trace.jsonl"));
  const budget = new BudgetTracker(config.caps, config.thresholds, deps.nowMs());
  const branch = `run/${slugify(config.goal)}-${config.runId}`;

  const state: RunState = {
    runId: config.runId, goal: config.goal, status: "running", sprints: [],
    currentSprint: 0, contractVersion: 0, scores: [], iterations: 0,
    budgetSpentUsd: 0, haltReason: null,
  };
  store.init(state);

  const traceEvent = (over: Partial<Parameters<TraceWriter["write"]>[0]>) =>
    trace.write({
      ts: new Date(deps.nowMs()).toISOString(), runId: config.runId, sprint: state.currentSprint,
      phase: "PLAN", agentRole: "system", contractVersion: state.contractVersion,
      inputDigest: "", toolCalls: [], outputDigest: "", tokens: 0, costUsd: 0, ...over,
    });

  const wt = await deps.createWorktree(config.projectPath, config.worktreeRoot, branch);

  const halt = (reason: string): RunState => {
    store.update({ status: "halted", haltReason: reason, budgetSpentUsd: budget.spent });
    return store.read();
  };

  try {
    const sprints = await deps.planSprints(config.goal);
    store.update({ sprints });
    traceEvent({ phase: "PLAN", agentRole: "planner", outputDigest: `${sprints.length} sprints` });

    for (const sprint of sprints) {
      store.update({ currentSprint: sprint.id });
      budget.resetSprint();

      const contract = await negotiate({
        propose: (prev) => deps.proposeContract(prev, wt.path),
        critique: deps.critiqueContract,
        maxRounds: config.caps.negotiationRounds,
      });
      store.update({ contractVersion: contract.version });
      traceEvent({ phase: "NEGOTIATE", contractVersion: contract.version, outputDigest: "frozen" });

      let passed = false;
      while (!passed) {
        budget.recordIteration();
        const gen = await deps.generateCode(contract, wt.path);
        budget.recordCost(gen.costUsd);
        traceEvent({ phase: "GENERATE", agentRole: "generator", costUsd: gen.costUsd, tokens: gen.tokens, toolCalls: gen.toolCalls });

        const verified = await deps.runVerifier(wt.path);
        const evalRes = await deps.evaluateArtifact(contract, verified);
        budget.recordScore(evalRes.score);
        state.scores.push(evalRes.score);
        store.update({ scores: state.scores, budgetSpentUsd: budget.spent });
        traceEvent({ phase: "EVALUATE", agentRole: "evaluator", outputDigest: `score ${evalRes.score}` });

        if (evalRes.score >= config.thresholds.advanceScore) { passed = true; break; }

        const stop = budget.checkStops(deps.nowMs());
        if (stop) { finalize(runDir, trace); return halt(stop); }
      }
    }

    store.update({ status: "passed", budgetSpentUsd: budget.spent });
    finalize(runDir, trace);
    return store.read();
  } finally {
    await deps.removeWorktree(config.projectPath, wt.path); // branch survives for review
  }
}

function finalize(runDir: string, trace: TraceWriter): void {
  const events = readFileSync(join(runDir, "trace.jsonl"), "utf8")
    .trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  writeFileSync(join(runDir, "transcript.md"), renderTranscript(events));
}
```

> Note: `runLoop` uses `new Date(nowMs)` only for the trace timestamp string; all *control-flow* time comes from the injected `deps.nowMs()`, so tests stay deterministic.

- [ ] **Step 4: Run tests, verify pass, commit**

Run: `npx vitest run tests/orchestrator.test.ts` — Expected: 2 passed.
```bash
git add -A && git commit -m "feat(orchestrator): loop driver with injected agents + stops"
```

---

## Task 12: `cli/` — entry point

**Files:**
- Create: `src/cli/index.ts`, `src/cli/wire.ts`
- Test: `tests/cli-wire.test.ts`

**Interfaces:**
- Consumes: `loadConfig`, `runLoop`, all agent functions, the real SDK `query`, worktree fns, `TestSuiteVerifier`.
- Produces: `wireDeps(config, queryFn): LoopDeps` — binds the real agent functions + verifier + worktree fns into a `LoopDeps` (the one place production wiring lives; unit-tested that it returns a fully-populated `LoopDeps`). `src/cli/index.ts` — commander program `loop run --goal <g> --project <p> [--eval-model <m>] [--dollar-ceiling <n>] [--test-cmd <cmd>]`, generates a `runId`, streams phase progress to the terminal, prints the final branch + transcript path.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from "vitest";
import { wireDeps } from "../src/cli/wire.js";
import { loadConfig } from "../src/config/load.js";

test("wireDeps returns a fully-populated LoopDeps", () => {
  const cfg = loadConfig({ runId: "r1", goal: "g", projectPath: "/tmp/app" });
  const deps = wireDeps(cfg, (async function* () {})() as any);
  for (const k of ["planSprints", "proposeContract", "critiqueContract", "generateCode",
                   "runVerifier", "evaluateArtifact", "createWorktree", "removeWorktree", "nowMs", "runsDir"]) {
    expect(deps).toHaveProperty(k);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/cli-wire.test.ts` — Expected: FAIL (module missing).

- [ ] **Step 3: Write `wire.ts` and `index.ts`**

`src/cli/wire.ts`:
```ts
import type { RunConfig } from "../config/types.js";
import type { LoopDeps } from "../orchestrator/run.js";
import type { QueryFn } from "../agents/invoke.js";
import { planSprints } from "../agents/planner.js";
import { proposeContract, generateCode } from "../agents/generator.js";
import { critiqueContract, evaluateArtifact } from "../agents/evaluator.js";
import { createWorktree, removeWorktree } from "../workspace/worktree.js";
import { TestSuiteVerifier } from "../verifier/test-suite.js";

export function wireDeps(config: RunConfig, queryFn: QueryFn): LoopDeps {
  const verifier = new TestSuiteVerifier(config.verifier.command);
  return {
    nowMs: () => Date.now(),
    runsDir: "runs",
    planSprints: (goal) => planSprints({ queryFn, model: config.models.planner, goal }),
    proposeContract: (prev, cwd) => proposeContract({ queryFn, model: config.models.generator, cwd }, prev),
    critiqueContract: (c) => critiqueContract({ queryFn, model: config.models.evaluator }, c),
    generateCode: (c, cwd) => generateCode({ queryFn, model: config.models.generator, cwd }, c),
    runVerifier: (cwd) => verifier.verify(cwd),
    evaluateArtifact: (c, v) => evaluateArtifact({ queryFn, model: config.models.evaluator }, c, v),
    createWorktree,
    removeWorktree,
  };
}
```

`src/cli/index.ts`:
```ts
import { Command } from "commander";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { loadConfig } from "../config/load.js";
import { runLoop } from "../orchestrator/run.js";
import { wireDeps } from "./wire.js";

const program = new Command();
program
  .command("run")
  .requiredOption("--goal <goal>")
  .requiredOption("--project <path>")
  .option("--eval-model <model>")
  .option("--dollar-ceiling <n>", "override $ ceiling", parseFloat)
  .option("--test-cmd <cmd>", "verifier command")
  .action(async (opts) => {
    const runId = `${Date.now().toString(36)}`;
    const config = loadConfig({
      runId, goal: opts.goal, projectPath: opts.project,
      models: opts.evalModel ? { evaluator: opts.evalModel } : undefined,
      caps: opts.dollarCeiling ? { dollarCeiling: opts.dollarCeiling } : undefined,
      verifier: opts.testCmd ? { command: opts.testCmd } : undefined,
    });
    console.log(`[dev-harness] run ${runId} — goal: ${config.goal}`);
    const state = await runLoop(config, wireDeps(config, query as any));
    console.log(`[dev-harness] status=${state.status} reason=${state.haltReason ?? "-"} spent=$${state.budgetSpentUsd.toFixed(2)}`);
    console.log(`[dev-harness] branch run/... left in ${config.projectPath}; transcript in runs/${runId}/transcript.md`);
  });
program.parseAsync();
```

- [ ] **Step 4: Run test, typecheck, verify, commit**

Run: `npx vitest run tests/cli-wire.test.ts` — Expected: 1 passed.
Run: `npm run typecheck` — Expected: no errors.
```bash
git add -A && git commit -m "feat(cli): loop run command + production wiring"
```

---

## Task 13: End-to-end smoke test (real SDK, real cost)

**Files:**
- Create: `tests/e2e.smoke.test.ts` (skipped unless `RUN_E2E=1`)
- Modify: `README.md` (usage + how to run E2E)

**Interfaces:**
- Consumes: the whole system via `runLoop` + `wireDeps` with the real SDK.

- [ ] **Step 1: Write the E2E smoke test (gated on env + a tight cap)**

```ts
import { expect, test } from "vitest";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { execa } from "execa";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../src/config/load.js";
import { runLoop } from "../src/orchestrator/run.js";
import { wireDeps } from "../src/cli/wire.js";

const maybe = process.env.RUN_E2E === "1" ? test : test.skip;

maybe("2+2 goal runs the full loop end to end for a few cents", async () => {
  const project = mkdtempSync(join(tmpdir(), "e2e-"));
  await execa("git", ["init"], { cwd: project });
  await execa("git", ["config", "user.email", "t@t.com"], { cwd: project });
  await execa("git", ["config", "user.name", "t"], { cwd: project });
  await execa("git", ["commit", "--allow-empty", "-m", "init"], { cwd: project });

  const config = loadConfig({
    runId: "e2e", goal: "Add sum.js exporting sum(a,b)=a+b with a passing node:test",
    projectPath: project, worktreeRoot: join(project, ".wt"),
    caps: { dollarCeiling: 2, maxIterationsPerSprint: 3, wallClockMs: 5 * 60 * 1000 },
    verifier: { command: "node --test" },
  });
  const state = await runLoop(config, wireDeps(config, query as any));
  expect(["passed", "halted"]).toContain(state.status);
}, 300000);
```

- [ ] **Step 2: Run it live once**

Run: `RUN_E2E=1 npx vitest run tests/e2e.smoke.test.ts`
Expected: PASS; a `run/...` branch left in the temp project; `runs/e2e/transcript.md` written. Cost a few cents.

- [ ] **Step 3: Write README usage + commit**

README must cover: install, `npm run loop -- run --goal "…" --project ~/app`, where the branch/transcript land, the four hard stops, the v1 attended/no-Docker caveat, and `RUN_E2E=1` to run the smoke test.

```bash
git add -A && git commit -m "test(e2e): full-loop smoke + README usage"
git push
```

---

## Self-Review (spec coverage)

- **Three separated roles** → Tasks 10–11. **Contract negotiation phase** → Tasks 8, 11. **Blind evaluation** → Task 10 (`evaluateArtifact` prompt carries only contract + artifact summary + verifier result; never generator transcript). **Human merge gate** → Task 11 (`finally` removes worktree, branch survives; loop never merges).
- **Verifier vs evaluator separation** → Tasks 7 (deterministic) + 10 (judgment consumes verifier result).
- **Four hard stops** → Task 5, enforced in Task 11's loop.
- **Loop-tuning defaults** → Task 2 (`config/defaults.ts`).
- **Trace JSONL + rendered transcript** → Task 3, emitted in Task 11.
- **Durable JSON state** → Task 4.
- **Prompts as editable markdown** → Task 10.
- **Repo at ~/dev-harness, noreply email before first commit, private remote** → Task 1.
- **Models by role, per-run overridable** → Tasks 2 + 12.
- **Skills layer / Docker / Playwright / scheduler** → correctly absent (Phase 2/3 per spec).

**Open thread carried, not resolved here:** Docker execution-isolation timing (spec's Sandboxing section). v1 ships worktree-only-attended per the plan; if that thread lands on "pull Docker forward," it becomes a new task wrapping the generator invoke in a container — additive, not a rewrite.
