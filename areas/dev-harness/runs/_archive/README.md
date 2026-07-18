# runs/_archive

Superseded or one-off run artifacts, kept (never deleted) for reference.

## Pre-symlink manual copies (archived 2026-07-18)

Before `runs/` became the symlink target for `~/Development/dev-harness/runs`,
harness run transcripts were copied into the vault by hand as flat files. These
are now redundant — the harness owns the canonical copies under
`runs/<project>/<date>-<title>/transcript.md`. Each archived file below was
verified byte-identical to its canonical run-folder transcript before archiving:

- `voice-tutor-harness-run-2026-07-15-voice-tutor-characterization-mrmqlip7.md`
  → `runs/_archive/voice-tutor-harness-run/2026-07-15-voice-tutor-characterization/transcript.md`
- `voice-tutor-harness-run-2026-07-16-extract-session-state-helpers-2-mrn0iav3.md`
  → `runs/_archive/voice-tutor-harness-run/2026-07-16-extract-session-state-helpers-2/transcript.md`
- `voice-tutor-harness-run-2026-07-16-extract-session-state-helpers-mrmzffye.md`
  → `runs/_archive/voice-tutor-harness-run/2026-07-16-extract-session-state-helpers/transcript.md`
- `2026-07-17-mrplqx5g-transcript.md` (was at `areas/dev-harness/` root)
  → `runs/voice-tutor/2026-07-18-wiki-grounding-extraction/transcript.md`

## Archived run folders (2026-07-18)

`runs/` follows the harness convention `runs/<project>/<date>-<title>/` (per
`src/state/run-path.ts`). These folders predate or fall outside that convention
and were moved here whole (never deleted); the harness's own `runs/<project>/`
tree is left untouched:

- `e2e/` — a gated real-SDK E2E run in the **legacy flat layout** (`runs/<runId>/`,
  no project/title grouping). Superseded by the `runs/<project>/<date>-<title>/` scheme.
- `e2e-qreye4/` — another **legacy flat-layout** E2E run (`sum-js-module`), same reason.
- `mrbb5zo5/` — an early run keyed only by an opaque timestamp id — the exact
  **legacy flat-layout** unreadability that motivated the legible-runs redesign.
- `voice-tutor-harness-run/` — runs executed against the **now-retired Voice Tutor
  clone repo** (`~/Development/voice-tutor-harness-run`); real work later moved to
  the primary `~/Development/voice-tutor` repo, so this run history is historical.
