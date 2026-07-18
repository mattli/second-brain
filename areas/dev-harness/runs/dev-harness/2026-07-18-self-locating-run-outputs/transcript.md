self-locating run outputs — 2026-07-18
Outcome:  Stopped — the score stopped improving
Progress: 0 of 1 stages finished
Quality:  scored 3, 0, 4 out of 100
Spent:    $2.41
Code:     saved on branch run/make-dev-harness-run-outputs-self-locati-mrqghymn in the target project
Folder:   runs/dev-harness/2026-07-18-self-locating-run-outputs

────────────────────────────────────────────

## Stage 0 — Self-locating run outputs   [✗ stopped (last score 4/100)] · $2.41
  revised 10 times, ran 6 commands.
  Stopped: no-progress.
  Requirements:
    - In src/state/run-path.ts, runBranch(goal, runId) is rewritten to `return `run-${runId}`;` — dropping the slugified goal and the 'run/' prefix. The `goal` param stays in the signature (unused) for call-site compatibility; the slugify import remains because buildRunDir/projectSlug still use it.
    - In tests/run-path.test.ts, the 'runBranch composes...' test asserts exact equality runBranch('Build a CSV converter','abc')==='run-abc', and the stale expected string 'run/build-a-csv-converter-abc' no longer appears anywhere in the file.
    - In src/state/types.ts, RunState gains an optional `projectPath?: string` field, documented and placed mirroring the existing optional `runDir?` field so legacy on-disk runs lacking it still typecheck. Absoluteness of the value is an input contract (whatever config supplies), not enforced by this type.
    - In src/orchestrator/run.ts, the initial `const state: RunState = {...}` literal (~line 60) sets `projectPath: config.projectPath` (config.projectPath already exists on RunConfig). NOTE: this is a Read-only/static check — because projectPath is optional, tsc passes whether or not the field is present, and no runtime test renders a summary from an orchestrator-produced state, so the verifier command cannot catch a missing assignment here.
    - In src/report/summary.ts, renderSummary's 'Code:' line becomes exactly `Code:     branch ${runBranch(state.goal, state.runId)} in ${state.projectPath ?? '(unknown project path)'}`, naming the branch and the project path together with a graceful fallback, and dropping the stale phrases 'saved on' and 'in the target project'. The line interpolates state.projectPath verbatim (its absoluteness is supplied by the caller/test fixture, not enforced by renderSummary).
    - In src/report/summary.ts, the old 'Folder:' line is relabeled to exactly `Records:  ${state.runDir ?? '(unknown)'}`, printing state.runDir verbatim; the label 'Folder:' no longer appears in summary.ts. (The 'absolute run directory' wording of the sprint is an input contract on state.runDir; renderSummary interpolates whatever string it is given.)
    - In src/report/summary.ts, the 'Code:' line's branch string is still sourced from `runBranch(state.goal, state.runId)` (not hardcoded as `run-${state.runId}` or a literal), preserving the single-source-of-truth the run-path comment protects; summary.ts still imports runBranch from ../state/run-path.js.
    - In tests/summary.test.ts, the base() RunState factory (a) adds an absolute projectPath literal '/Users/me/dev/csv-tool', and (b) changes its runDir to an ABSOLUTE path (e.g. '/Users/me/dev/csv-tool/runs/csv-tool/2026-07-08-csv-json-converter') so the 'Records:' assertion genuinely demonstrates an absolute run directory (resolving the prior relative-runDir contradiction). The assertion formerly checking 'branch run/build-a-csv-converter-abc' now asserts the 'Code:' line names branch 'run-abc' together with that absolute project path; the 'which folder holds the run's artifacts' test asserts the 'Records:' line shows that absolute run directory. The stale strings 'run/build-a-csv-converter-abc' and 'Folder:' no longer appear anywhere in the file.
    - tests/summary.test.ts includes a test exercising the graceful projectPath fallback: it renders a RunState with projectPath deleted/undefined (mirroring the existing legacy-startedAt test) and asserts renderSummary does not throw and emits the fallback token '(unknown project path)'.
    - The summary block labels remain column-aligned: 'Code:' is followed by 5 spaces and 'Records:' by 2 spaces so their content starts at the same column as the existing labels (Outcome:, Progress:, Quality:, Spent:), preserving the aligned layout.
    - No files other than src/state/run-path.ts, tests/run-path.test.ts, src/state/types.ts, src/orchestrator/run.ts, src/report/summary.ts, and tests/summary.test.ts are modified.
    - The full verifier passes: `npx tsc --noEmit && npx vitest run` exits 0.
