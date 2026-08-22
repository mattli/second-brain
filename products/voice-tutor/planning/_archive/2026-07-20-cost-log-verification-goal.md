# Goal: verify cost logging — dev-harness run

> target_branch: main · date: 2026-07-20 · from ideas.md item 3

## Goal
Build a pipecat-free `cost_audit.py` that validates `cost-log.jsonl` — recomputing each row's `cost_*_usd` fields from its own usage fields (tokens, tts_chars, stt_minutes_billed) using the pricing constants in `bot.py`, and flagging malformed rows, mismatched math, and orphan `artifact` rows (no matching `session` row) — plus a small CLI entry point that prints a summary report, so we finally know whether the cost numbers we've been trusting are right.

## Verifiability constraints
- The verifier env has no Pipecat, no network, no API keys. `import app` / `import bot` are unwinnable — the audit module must be pure (stdlib + pathlib), with pricing constants either imported from an importable location or relocated into the new module (if relocated, `bot.py` re-imports them; verbatim values).
- Tests are hermetic characterization tests over fixture jsonl content (monkeypatch a module-level log path, same pattern as `sessions.py` / `grounding.py` conftest fixtures). Include fixtures for: a correct study session+artifact pair, a legacy row (no `kind`, no `mode`), a malformed line, an orphan artifact row, and a row whose stored cost disagrees with recomputation.
- Accuracy against actual provider bills is NOT verifiable here — the audit checks internal consistency (stored cost vs. recomputed cost from the row's own fields). Comparing to Anthropic/Deepgram/Cartesia invoices stays a manual step for Matt.

## Hard constraints / out of scope
- Don't modify how costs are logged (no `bot.py` behavior changes beyond re-importing relocated constants, if that path is chosen). This run is read-only diagnosis, not repair — if the audit finds wrong math in the logger, that's a finding for the report, fixed in a follow-up.
- Don't touch the voice pipeline, `app.py` routes, or `study.html`.
- Legacy rows (pre-`kind`) must be tolerated, not flagged as errors.

## Definition of done
- `python -m cost_audit` (or equivalent CLI) against the real log path prints: rows read, rows valid, per-check failure counts, and a list of offending line numbers with reasons.
- Recomputation logic covers session rows (llm/stt/tts/post-session components and `cost_total_usd`) and artifact rows (`cost_usd` from input/output tokens), within a small rounding tolerance.
- All existing tests stay green; new tests are hermetic (pass with API keys unset).
