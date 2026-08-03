# Coverage Judge Module — goal doc only

This folder holds **only the goal doc** (`goal.md`) for the coverage_judge run.

**The run's records live in the sibling folder
[`2026-08-03-coverage-judge-module-2/`](../2026-08-03-coverage-judge-module-2/)** —
`state.json`, `trace.jsonl`, and `transcript.md`.

Why the split: the harness derives its run-folder name (`<date>-<slug-of-goal-title>`)
and creates it fresh, appending `-2` on collision. This folder already existed
(pre-seeded with the goal doc), so the harness used the `-2` sibling for its records.

Run: `msdql2bo` · launched 2026-08-03.
