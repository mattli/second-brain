---
title: "DRAFT — Voice Tutor characterization run (dev-harness)"
status: RUN — both sprints executed (as two single-sprint runs); relocation passed 96/100. Remaining work is harvest into the real repo (see backlog).
date: 2026-07-15
last_updated: 2026-07-16
product: voice-tutor
tool: dev-harness
base_branch: feat/study-companion-mode
---

# DRAFT — Voice Tutor characterization run (dev-harness)

> **UPDATE 2026-07-16 — this has now been run.** Both sprints were executed as
> two *separate single-sprint* runs (the planner is per-run, so each sprint got
> its own goal + contract):
> - **Sprint 1 (documents.py characterization)** → run **b79d8ron5**, scored 96,
>   re-verified `26 passed`. Its tests are cherry-picked onto
>   `feat/study-companion-mode` @ `9ee4200` in the clone.
> - **Sprint 2 (relocate pure helpers → `session_state.py`)** → run **mrn0iav3**
>   (2026-07-16), scored 96/100; relocation independently verified byte-for-byte
>   verbatim. On branch `run/plan-this-as-exactly-one-sprint-mechanic-mrn0iav3`.
>
> Two run-setup lessons came out of this, both now in dev-harness
> `docs/solutions/conventions/`: the verifier env must carry what the contract
> *imports* (`match-verifier-env-to-sprint-contract-imports.md`), and the NEGOTIATE
> critic must inspect the *target* worktree, not the harness's own repo
> (`evaluator-cwd-blind-scorer-sighted-critic.md` — a bug found and fixed this run).
> Remaining work is **harvest into the real repo** — see the Voice Tutor backlog
> item, including the HEAD-keyed-test caveat. The original two-sprint draft below
> is kept as the spec the per-sprint contracts were held to.

## Purpose

Have the dev-harness write **characterization tests** that pin Voice Tutor's
*current* behavior — a safety net before future refactors. In scope:
doc-grounding (document ingestion) and session/conversation-state logic. Out of
scope: STT/TTS/Pipecat pipeline wiring, and the LLM-backed recap functions
(`generate_session_summary` / `generate_session_analysis` / `generate_artifact`)
— their output is non-deterministic and can't be pinned by a deterministic
verifier without mocking the model.

## Ground facts (already set up)

- **Base branch:** `feat/study-companion-mode` — confirmed the only viable base
  (`documents.py` and all of study mode exist only here; `main` predates them).
- **Clone:** `~/Development/voice-tutor-harness-run` (the original is untouched).
  Prep committed at `6d98a3d`.
- **Test env:** `~/Development/voice-tutor-harness-run/.harness-venv` — a
  dedicated venv with `pytest` + `pypdf`, referenced by absolute path so it
  survives every harness worktree iteration. Green baseline seeded
  (`tests/test_sanity.py`, 1 passed).
- **PDF fixture:** `tests/fixtures/sample.pdf` — a 640-byte static, valid PDF
  committed during prep. `documents._extract_text` deterministically returns
  `'Hello Voice Tutor\nThis is a fixture document.'` from it. Nothing generates a
  PDF at test time and no PDF-authoring dependency was added.
- **Per-run test command:**
  `/Users/mattli/Development/voice-tutor-harness-run/.harness-venv/bin/python -m pytest -q`
  (must be `python -m pytest` with cwd = worktree, so the worktree root is on
  `sys.path` and `import documents` resolves).

## The run command (do not launch yet)

```
cd ~/Development/dev-harness
npm run loop -- run \
  --goal "<GOAL STRING BELOW>" \
  --project ~/Development/voice-tutor-harness-run \
  --test-cmd "/Users/mattli/Development/voice-tutor-harness-run/.harness-venv/bin/python -m pytest -q"
```

### Proposed `--goal` string

The harness *plans its own sprints* from the goal, so the goal has to encode the
two-sprint split explicitly (see "Known constraints" for why this isn't
guaranteed):

> Plan this as exactly two sprints. Add characterization tests that pin the
> CURRENT behavior of Voice Tutor, changing NO runtime behavior. Sprint 1: add
> pytest tests under `tests/` that characterize `documents.py` (title derivation,
> upload-validation error paths, text extraction — including the PDF path via the
> committed `tests/fixtures/sample.pdf` — and list/load), monkeypatching the
> documents directory to a temp path; change NO production source. Sprint 2:
> mechanically relocate the pure, Pipecat-free helper functions from `bot.py`
> ONLY into a new `session_state.py` that `bot.py` re-imports (a verbatim move —
> zero logic changes; any logic change inside a moved function is a failure), then
> add characterization tests for those helpers. Do NOT touch `wiki.py`, the
> STT/TTS/Pipecat pipeline, or the LLM-backed recap functions.

---

## Sprint 1 — characterize `documents.py` (zero source changes)

**Sprint title:** Characterization tests for the document-grounding layer

**Description:** Pin the current behavior of `documents.py` with pytest tests
under `tests/`. Touch no production source — only add test files (and fixtures).
Tests must be deterministic: monkeypatch `documents.DOCUMENTS_DIR` to a temp
directory so nothing reads or writes the real `~/.voice-tutor/`.

**Draft contract (harness format — `{id, description, verifyBy}`):**

- **c1 — `_derive_title` branches.** Tests assert the exact current return value
  for: YAML-frontmatter skip, markdown-H1 preference, first-non-empty-line
  fallback, filename-stem fallback, and 120-char truncation.
  *verifyBy:* pytest assertions on literal return values.
- **c2 — `_extract_text` (md/txt AND pdf paths).** md/txt: UTF-8 decode, collapse
  of 3+ newlines to 2, leading/trailing strip. PDF: extract text from the
  committed `tests/fixtures/sample.pdf` and assert the exact current output
  (`'Hello Voice Tutor\nThis is a fixture document.'`). The test reads the static
  fixture — it must NOT generate a PDF at runtime or add a dependency.
  *verifyBy:* pytest assertions for both paths against literal current output.
- **c3 — `save_upload` validation.** Each failure branch asserts the raised
  `UploadError.status_code` AND that no files were written: oversized→413,
  disallowed extension→415, extracted-text-too-long→413, empty-text→422. Plus a
  success case asserting the returned `{document_id, title, char_count}` shape and
  that both the original file and the `.txt` are persisted.
  *verifyBy:* pytest with a monkeypatched temp `DOCUMENTS_DIR`.
- **c4 — `list_documents` / `load_document`.** `list_documents`: empty when the
  dir is absent; ordering by `uploaded_at` desc; title/char_count derivation.
  `load_document`: `None` when missing; returns `(title, text)` when present.
  *verifyBy:* pytest against a temp dir with fixture files.
- **c5 — no production source changed.** The artifact diff adds only files under
  `tests/` (plus optional fixtures). `documents.py` and every other production
  `.py` are byte-for-byte unchanged.
  *verifyBy:* `git diff` touches no production module.
- **c6 — deterministic + green.** The whole suite passes under the pinned command
  with no network and no writes outside the temp dir.
  *verifyBy:* `python -m pytest -q` exit 0; no `~/.voice-tutor` access.

---

## Sprint 2 — relocate pure helpers, then characterize them

**Sprint title:** Extract Pipecat-free helpers to `session_state.py`, then pin them

**Description:** `bot.py` imports Pipecat at module load, so its pure
session-state helpers can't be tested cheaply where they sit. **Mechanically
move** them into a new `session_state.py` that imports no Pipecat; `bot.py`
re-imports them so its behavior is unchanged. This is a **pure relocation** —
verbatim move, zero logic changes — then characterize the moved helpers.

**Functions to relocate (verbatim) from `bot.py` ONLY:**
`_format_memory_date`, `_format_session_time`, `_format_full_transcript_block`,
`load_profile`, `load_memory`, `append_to_memory`,
`load_most_recent_transcript_block` — plus the path constants they need
(`VOICE_TUTOR_DIR`, `TRANSCRIPTS_DIR`, `PROFILE_PATH`, `MEMORY_PATH`).

**`wiki.py` is out of scope for this run — deferred entirely.** `_load_index`,
`system_prompt_block`, and `build_system_instruction` (the grounding-assembly
logic) all wait for a later run. This sprint touches `bot.py` and the new
`session_state.py` only; `wiki.py` is not modified.

**Draft contract:**

- **c1 — new Pipecat-free module.** `session_state.py` imports no `pipecat`; it
  (and its test file) import successfully in the minimal `.harness-venv`.
  *verifyBy:* `python -c "import session_state"` succeeds in `.harness-venv`.
- **c2 — verbatim relocation + re-import.** The listed helpers move into
  `session_state.py`; `bot.py` imports them from there so its symbols/behavior
  are unchanged.
  *verifyBy:* diff shows the bodies moved, not rewritten; `bot.py` references
  still resolve.
- **c3 — ZERO logic change (hard guard).** Every moved function's body is
  byte-for-byte identical to the original (formatting aside). **Any change to
  logic inside a moved function is a sprint FAILURE.**
  *verifyBy:* the evaluator compares removed-vs-added lines in the diff; moved
  bodies must match exactly.
- **c4 — characterize the moved helpers, deterministically.** With path constants
  monkeypatched to temp dirs: exact formatted strings from `_format_memory_date`
  and `_format_session_time` across AM/PM and edge times; transcript-block
  formatting (role labels "You"/"Matt", header line); `append_to_memory` (header
  format, file-init text, append semantics); `load_most_recent_transcript_block`
  (sorting, `.usage.json` exclusion, `None` when empty).
  *verifyBy:* pytest assertions; no `~/.voice-tutor` writes.
- **c5 — tests stay in the minimal env.** Test files import `session_state`, NOT
  `bot` (importing `bot` would pull Pipecat and fail the minimal env).
  *verifyBy:* no test imports `bot`/`pipecat`; suite green under the pinned
  command.

---

## Known constraints / wrinkles (read before launching)

1. **The harness plans its own sprints.** v1's planner generates 3–6 sprints from
   `--goal`; it can't be *forced* to produce exactly these two. The goal string is
   written to steer it, but watch the plan output — if it splits differently, this
   draft is the spec to hold the per-sprint contract to, and you can cancel/re-run.
   (You're the stop button; v1 is attended.)
2. **Sprint 2 modifies Voice Tutor source.** The relocation is behavior-preserving
   and diff-verifiable, but it *does* touch `bot.py` (only). It happens in the
   clone; whether it later lands in the real repo is a separate decision.
3. **Recap is out of scope.** The three `generate_*` functions call Claude; pinning
   them needs a mocked client and only pins structure, not text. Excluded here.
4. **PDF extraction — resolved.** `tests/fixtures/sample.pdf` is committed and its
   current extraction output is known, so the PDF path is now deterministically
   characterizable (sprint 1, c2). No runtime generation, no new deps.
5. **`wiki.py` grounding-assembly deferred.** `_load_index`, `system_prompt_block`,
   and `build_system_instruction` are out of this run entirely — a later run.
6. **Base is unmerged feature work.** `feat/study-companion-mode` is 15 commits
   ahead of `main` (all pushed). Characterizing it *before* the eventual merge is a
   feature, not a problem — but the tests describe feat's behavior, not main's.
