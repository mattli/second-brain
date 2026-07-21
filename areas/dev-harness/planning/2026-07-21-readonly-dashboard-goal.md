---
created_at: 2026-07-21
last_updated: 2026-07-21
type: dev-harness-goal
target_repo: /Users/mattli/development/dev-harness
target_branch: main
verifier_cmd: npm test
status: launched (fire-and-forget, Phase 2 wall-clock defaults)
---

# Goal: Read-only live dashboard (stage 1) — dev-harness run

## Goal
Build a **read-only local web dashboard** that serves a single page showing the live
state of the active (or most recent) dev-harness run, rendering only data that already
exists in the run folder. The page updates in place via polling fetch — a continuously
live view with no visible reload — and never writes to the run folder or any config.

This is a **feature of dev-harness itself**: the run targets this repo
(`/Users/mattli/development/dev-harness`, branch `main`). It is a net-new module built
with Node's built-in `http`/`fs`/`path` modules — **zero new npm dependencies** — with
tests in the repo's existing vitest suite. (The user's brief said "`http.server` or
similar"; `http.server` is Python's stdlib server. In this Node/TypeScript repo the
stdlib-only, no-new-dependency equivalent is Node's built-in `http` module, which is
what "or similar" resolves to here.)

## Data source — real run-folder fields (verified on disk, run `mru5b2o4`)
The dashboard reads two files inside a run folder and must name **these real fields**,
not invented ones:

**`state.json`** (`src/state/types.ts` `RunState`):
- `runId: string`
- `goal: string` — the full goal text (includes YAML frontmatter; render as-is)
- `title: string`
- `startedAt: string` — ISO-8601 timestamp
- `status: "running" | "passed" | "halted"`
- `sprints: { id: number; title: string; description: string }[]`
- `currentSprint: number` — index into `sprints[]`
- `contractVersion: number` — the negotiation round / contract version
- `scores: number[]` — flat append-log of evaluation scores across the run
- `iterations: number`
- `budgetSpentUsd: number`
- `haltReason: string | null`
- `contractFreezeReason: string | null`
- `runDir?: string`, `projectPath?: string` — optional (absent on older runs)

**`trace.jsonl`** (`src/trace/types.ts` `TraceEvent`, one JSON object per line):
- per line: `ts`, `runId`, `sprint`, `phase`, `agentRole`, `contractVersion`,
  `toolCalls[]`, `tokens`, `costUsd`
- `phase` ∈ `"PLAN" | "NEGOTIATE" | "GENERATE" | "EVALUATE" | "DECIDE"`
- `score?` — present on `EVALUATE` events
- The **current step/phase** of a live run is the `phase` of the last line of
  `trace.jsonl`. **Per-sprint scores** are best derived from `EVALUATE` events
  (each carries both `sprint` and `score`); `state.scores[]` is the flat fallback.

### Field → display mapping
- **Goal text** → `state.goal`
- **Current sprint** → `state.currentSprint` + `sprints[currentSprint].title`
- **Current round** → `state.contractVersion`
- **Current step** → `phase` of the last `trace.jsonl` line
- **Per-sprint scores** → `EVALUATE` events' `{sprint, score}` (fallback `state.scores[]`)
- **Elapsed wall-clock** → derived: server's current time − `state.startedAt`
- **Spend (if recorded)** → `state.budgetSpentUsd`
- (also available and worth showing: `status`, `haltReason`, `contractFreezeReason`)

## Behavior (what the dashboard does)
1. **Serve one page** at `GET /` — an HTML page rendering the fields above.
2. **Serve a data endpoint** (e.g. `GET /data`) that returns the current run state as
   JSON assembled from `state.json` + `trace.jsonl`.
3. **The page polls, it does not reload.** Client-side JavaScript fetches the data
   endpoint on a fixed interval and updates the DOM in place. **No `<meta http-equiv=
   "refresh">`, no full-page navigation** — the view reads as continuously live.
4. **Target selection.** The server reads a run folder given as an explicit argument;
   when omitted, it auto-discovers the most recently modified run folder under `runs/`.
   (Tests always pass an explicit fixture directory.)
5. **Graceful degradation.** If `state.json` is missing a field, or is caught
   mid-write and does not parse as valid JSON (a live run rewrites it in place), the
   data endpoint must still respond without throwing, and the page must render what is
   present without crashing. A malformed/partial read serves last-known-good or an
   explicit "updating" signal — it never 500s the page into a blank/error state.

## Verifiability constraints (what the verifier env can/can't do)
- Verifier command: **`npm test`** (vitest). The repo is **green at HEAD** as of
  2026-07-21 (119 passed, 2 skipped — the skips are the `RUN_E2E`-gated live smoke
  test), so the whole-suite baseline is clean.
- Tests are **hermetic**: no network, no live run required. They exercise the server
  against **fixture run directories** checked into the test tree — at minimum:
  (a) a complete finished run, (b) a mid-run partial (valid but incomplete state, e.g.
  `status: "running"` with fewer scores than sprints), (c) a missing-fields case
  (optional fields like `budgetSpentUsd`/`runDir` absent), and (d) a corrupt/half-written
  `state.json` that does not parse.
- **Fetch-level checks** start the server on an ephemeral port and make real HTTP
  requests to it (Node's built-in `http`/`fetch`, no new dependency): assert the server
  starts and `GET /` returns **200**, the page HTML contains the expected elements
  populated from the fixture (goal text, sprint title, a score, elapsed/spend), the data
  endpoint returns **200** with JSON carrying the mapped fields, and the served page's
  JavaScript **polls the data endpoint on an interval** (evidence of a `fetch`/`setInterval`
  loop) rather than relying on page reload (assert **no** meta-refresh tag is present).
- The module is **import-safe**: importing it starts no server and binds no port; the
  server starts only via an explicit call (so tests control lifecycle and no side effect
  fires at import). It imports only Node stdlib + reads run-folder files — it must **not**
  import a heavy harness entrypoint that would drag the Anthropic SDK into the verifier's
  import closure.
- **No credentialed smoke run needed** (per CLAUDE.md): this tool makes **no external
  network calls** — it serves localhost and reads local files. Hermetic fixtures +
  fetch-level checks against a real local server fully cover it.

## Scope (intent-level restrictions — enforced by the sighted critic + verifier + human merge, NOT graded)
- **Render only data the run folder already contains.** Do **not** add to or modify the
  harness's progress-event emission (trace writer, orchestrator, state schema) even if
  richer round-level or step-level detail would make a nicer dashboard. Stage 1 is a pure
  reader over the *existing* on-disk format; changing what runs emit is out of scope.
- **Strictly read-only.** The dashboard must never write, create, or modify any file in
  the run folder, and must never read or write any config. No launch/stop controls, no
  config editing — those are **stage 2, deferred**.
- **No new dependencies.** Node built-in modules only; nothing added to `package.json`
  `dependencies`. Tests use the existing vitest devDependency.
- **True push streaming (SSE/WebSocket) is out of scope for stage 1.** The live feel comes
  from client-side polling, not a server push channel.
- Net-new module + its test file(s) only; do not refactor unrelated harness modules.

## Definition of done (behavioral acceptance — graded)
- Starting the server against a run folder and requesting `GET /` returns a **200** HTML
  page that displays: the goal text, the current sprint number and title, the current
  round (`contractVersion`), the current step/phase, the per-sprint scores, the elapsed
  wall-clock time, and the spend when `budgetSpentUsd` is present.
- The data endpoint returns **200** with JSON assembled from `state.json` + `trace.jsonl`
  carrying the mapped fields.
- The served page's JavaScript fetches the data endpoint on an interval and updates the
  DOM in place; the page contains **no** meta-refresh and performs no full-page reload.
- Against the **missing-fields**, **mid-run partial**, and **corrupt/half-written
  `state.json`** fixtures, the data endpoint responds without throwing and the page
  renders the present fields without crashing (absent fields shown as a placeholder,
  not an error).
- `npm test` passes offline with the new hermetic + fetch-level tests, and the module is
  import-safe (importing it binds no port and starts no server).
