---
created_at: 2026-07-21
last_updated: 2026-07-21
type: dev-harness-goal
target_repo: /Users/mattli/development/dev-harness
target_branch: main
verifier_cmd: npm test
status: launched (fire-and-forget, Phase 2 wall-clock defaults)
---

# Goal: Port the dashboard v2 design into the merged dashboard code — dev-harness run

## Goal
**Restyle and restructure the existing read-only dashboard to match the committed v2
prototype and design-decisions doc.** The v1 dashboard now lives on `main`
(`src/dashboard/reader.ts` + `src/dashboard/server.ts`, with tests in
`tests/dashboard-*.test.ts` and fixtures under `tests/fixtures/dashboard/`). This run
brings the served page up to the v2 design without changing what a run emits — it stays
a **strictly read-only reader** over the existing on-disk run-folder format.

The authoritative design lives **in the repo**, committed as the design reference:
- `docs/design/2026-07-21-dashboard-v2-prototype.html` — the interactive prototype;
  the exact target layout, halt-reason wording (`HALT_REASONS` map), run-strip
  behavior, and per-sprint metrics line all live here.
- `docs/design/2026-07-21-dashboard-v2-design-decisions.md` — the decisions and the
  rationale behind each element.

Follow the prototype for structure and wording. Visual/aesthetic fidelity is judged by
the human in the morning — **this run is NOT graded on aesthetics beyond the structural
criteria below.**

## Data source — real run-folder fields (all already emitted; verified on disk)
Everything the v2 design shows is derivable from the two files the dashboard already
reads. **Do not add new emission** to make any of this easier.

**`state.json`** (`src/state/types.ts` `RunState`): `runId`, `goal` (full goal text),
`title`, `startedAt`, `status` (`running | passed | halted`), `sprints[]`,
`currentSprint`, `contractVersion`, `scores[]`, `budgetSpentUsd`, `haltReason`,
`contractFreezeReason`, optional `runDir` / `projectPath`.

**`trace.jsonl`** (`src/trace/types.ts` `TraceEvent`, one JSON object per line):
`ts`, `runId`, `sprint`, `phase` (`PLAN | NEGOTIATE | GENERATE | EVALUATE | DECIDE`),
`agentRole`, `contractVersion`, `toolCalls[]`, `tokens`, `costUsd`, and `score?` (on
`EVALUATE`).

### Deriving the new v2 per-sprint metrics (the metrics sub-line)
Each planned sprint shows: **`<N> negotiation rounds · <N> build attempts · <N> file
edits · $<cost>`**. All four come from existing data:
- **negotiation rounds** = the frozen `contractVersion` on that sprint's `NEGOTIATE`
  trace event (already derived by the v1 reader).
- **build attempts** = count of `GENERATE` trace events for that sprint. **Derive it by
  counting `GENERATE` events — do NOT read `state.iterations`; it is known-stale
  (initialized to 0 and never updated) and fixing it is harness machinery, out of
  scope.**
- **file edits** = count of `"Edit"` entries in the `toolCalls[]` arrays of that
  sprint's `GENERATE` events.
- **cost** = sum of `costUsd` across that sprint's trace events.

### The header goal line
The **one-line goal** is **lifted verbatim from the run's goal text** (`state.goal`) —
its first meaningful line (skip any YAML frontmatter and a leading `#` heading), used
as-is, **never AI-summarized**. The **full goal** opens on its own view rendering the
complete `state.goal`.

### The run strip
Coarse, **monotonic (forward-only)** `Plan → Generate → Done`. **No per-sprint
segments** — the three stages are fixed; only their fill/color advances. Colored by
outcome: in-progress → accent, `passed` → green ("Done"), `halted` → amber
("Paused"). Derived from `state.status` + whether a plan/sprints exist.

## Behavior (what the ported dashboard renders)
1. **Goal-first header:** repo name (basename of `projectPath`/`runDir`) leads, then
   the run ID, then a status pill; the one-line goal prominent on the **planning**
   state and a small "View goal" link on every other state; a full-goal view.
2. **The `Plan → Generate → Done` run strip**, full-width under the header.
3. **Stats tiles** — `Sprint X / N`, `Elapsed` (relabels to `Duration` when finished),
   `Spend` — shown once a plan exists; **absent during planning**.
4. **Sprint cards:** title + score (score when done; "best N" when halted); the plan
   description; on the active sprint the phase pipeline
   `Negotiate → Generate → Evaluate → Decide`; and the **quiet metrics sub-line** above.
5. **Plain-language halt banner** on a paused/stopped run, translating the raw code to
   a sentence (wording from the prototype's `HALT_REASONS`).
6. **All four run states render:** `planning` / `live` (running) / `passed` / `halted`.
7. **Retain from the current code:** dark mode, mobile-friendly responsive layout,
   client-side **polling fetch** with in-place DOM updates (no meta-refresh), and
   graceful degradation on a mid-write/corrupt `state.json`.

### Halt reasons — translate every code to plain language
The banner must map **all `StopReason` codes** (`src/budget/tracker.ts`:
`max-iteration`, `no-progress`, `dollar-ceiling`, `wall-clock`, `usage-limit`) **plus
the `evaluator-parse-error` fault** to a plain-language sentence. The `StopReason`
codes are graceful **"Paused"**; `evaluator-parse-error` is a **"Stopped"** fault. Exact
wording is in the prototype's `HALT_REASONS` map — match it.

## Verifiability constraints (what the verifier env can/can't do)
- Verifier command: **`npm test`** (vitest). The whole suite is **green on `main`** as
  of this run's base (348 passed, 4 skipped — the skips are the `RUN_E2E`-gated live
  smoke test). Tests are **hermetic**: no network, no live run.
- Tests exercise the server against **fixture run directories** under
  `tests/fixtures/dashboard/` — **extend them as needed** so all four run states are
  covered, including a **`halted` fixture** carrying a real `haltReason` code and trace
  events that exercise the per-sprint metrics (multiple `GENERATE` events, `"Edit"`
  entries in `toolCalls[]`, per-event `costUsd`).
- **Fetch-level checks** start the server on an ephemeral port and assert the served
  `GET /` page (200) contains the **v2 structural elements**: the `Plan → Generate →
  Done` run strip, the goal-first header with the one-line goal, the per-sprint metrics
  sub-line ("negotiation rounds"/"build attempts"/"file edits"), and — for the halted
  fixture — the **plain-language halt-reason text**. The `/data` endpoint still returns
  200 JSON and the page still polls (a `fetch`/`setInterval` loop, **no** meta-refresh).
- The module stays **import-safe**: importing it binds no port and starts no server; it
  imports only Node stdlib + reads run-folder files (no heavy harness entrypoint that
  would drag the Anthropic SDK into the verifier's import closure).
- **No credentialed smoke run needed:** the dashboard makes no external network calls —
  it serves localhost and reads local files. Hermetic fixtures + fetch-level checks
  against a real local server fully cover it.

## Scope (intent-level restrictions — enforced by the sighted critic + verifier + human merge, NOT graded)
- **No changes outside the dashboard module and its tests.** Only
  `src/dashboard/*` and `tests/dashboard-*` (+ `tests/fixtures/dashboard/*`) may change.
- **No changes to trace emission, `run.ts`, or any harness machinery.** In particular,
  do **not** "fix" `state.iterations` — derive build attempts from `GENERATE` events
  instead. Changing what runs emit is out of scope even where richer data would make a
  nicer dashboard.
- **Server stays stdlib-only Node** (built-in `http`/`fs`/`path`), **polling fetch**,
  and **strictly read-only** — never writes/creates/modifies any run-folder or config
  file; no launch/stop controls, no config editing (those remain deferred).
- **No new dependencies** in `package.json`; tests use the existing vitest devDependency.
- A stdlib-only markdown/`goal` renderer is fine; do not add a markdown library.

## Definition of done (behavioral acceptance — graded)
- `GET /` returns a **200** HTML page whose structure matches the v2 design: a
  **goal-first header** (repo · run ID · status pill) with the **one-line goal lifted
  verbatim** from `state.goal`, and a reachable **full-goal view**.
- The page renders the **coarse monotonic `Plan → Generate → Done` run strip** with no
  per-sprint segments.
- Each sprint card shows the **quiet metrics sub-line** `negotiation rounds · build
  attempts · file edits · cost`, with **build attempts derived by counting `GENERATE`
  trace events** (not `state.iterations`), file edits from `"Edit"` `toolCalls`, and
  per-sprint cost summed from the trace.
- The dashboard renders **all four run states** (planning / live / passed / halted),
  and on a halted run shows the **plain-language halt-reason translation** covering
  every `StopReason` code plus `evaluator-parse-error`.
- **Dark mode and mobile-friendly** layout are retained; the page still **polls**
  (in-place DOM updates, no meta-refresh) and **degrades gracefully** on a corrupt or
  mid-write `state.json`.
- `npm test` passes offline with the extended hermetic + fetch-level tests covering all
  four states, and the module remains import-safe (importing it binds no port and starts
  no server). **Full suite green.**
