# Run notes — msdsrc8x (coverage_judge, Launch 2)

## Finding: the harness can only seed a run off the project's currently checked-out branch

**What.** A new run's workspace is a git worktree created with
`git worktree add -b <run-branch> <path>` and **no base ref**
(`src/workspace/worktree.ts:17`), so it always branches off whatever the
`--project` repo currently has checked out (HEAD). There is no `--base` /
`--from-ref` CLI flag or config field to seed from an arbitrary branch or commit.

**Why it mattered here.** Launch 1 (`msdql2bo`) left its passing Stage 0 parsing
core only on the `run-msdql2bo` branch, not on voice-tutor `main` — and `main` is
where a fresh run would have based. To REUSE Stage 0 instead of rebuilding it, we
had to stage it by hand: create a dedicated voice-tutor worktree checked out at the
Stage 0 commit and point `--project` at that worktree.

**Phase 2 candidate.** A `--base <ref>` (seed-from-ref) option on `run`, so a run can
continue from a prior run's branch/commit without hand-staging a worktree. Today's
hand-staging is the evidence and the workaround.

## This run's seed
- **Seed commit:** voice-tutor `f34b470` — "sprint 0 — core data contract + parsing
  defenses passed (score 97)" (from run `msdql2bo`).
- **Staged as:** worktree `~/development/voice-tutor-cj-base`, branch
  `coverage-judge-base`. Verified green (39 hermetic tests) before launch.
- **Wall clock:** 45 min/sprint (`--wall-clock-ms 2700000`); Launch 1 paused at the
  30-min cap.
- **Plan:** the planner correctly produced **4 sprints (Stage 1+ only)**, not 5 — it
  did not re-plan the seeded Stage 0.
