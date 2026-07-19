---
created_at: 2026-07-18
last_updated: 2026-07-18
type: dev-harness-goal
target_repo: /Users/mattli/development/voice-tutor
target_branch: feat/study-companion-mode
verifier_cmd: pytest
---

# Dev-harness goal — Past Sessions history surface

## One-line goal

Add a **"Past sessions" history surface** to the `/study/` UI so that any visitor can
browse previously completed study sessions and open each one's saved recap — without
already knowing a session's UUID. Today those recaps are unreachable from the UI.

## Why this is scoped the way it is (read before planning)

This is an **early-validation, single-user, no-auth** build. The goal is to make past
recaps *discoverable*, nothing more. Two design decisions are already made and are **not**
open for the harness to re-litigate:

- **Shared pool, no per-user identity.** There is no `client_id`, cookie, login, or
  ownership field. Every study session is visible to everyone. Do **not** add user
  accounts, device IDs, or filtering-by-owner.
- **Cost in dollars stays visible** in this version (it is an internal validation build,
  not the productized one).

## The verifiability constraint (this is the load-bearing part)

`app.py` imports `pipecat` and `bot` at module top (see `app.py` lines ~25–35). Therefore
**`import app` requires the full pipecat/ML stack** and will fail in a Pipecat-free
environment. A contract whose tests do `from app import app` + `TestClient` is
**unwinnable** in the verifier venv and will burn wall-clock money for nothing — the same
class of failure as the "`import bot` without bot's deps" incident.

**Mandatory approach:** put the session-listing logic in a **pure, importable helper**
(no FastAPI, no pipecat import) and test *that helper* hermetically — exactly the pattern
the repo already uses for `documents.py`, `session_state.py`, and `grounding.py`. The
FastAPI route is a thin wrapper around the pure helper.

- The pure helper reads the append-only ledger
  `~/second-brain/products/voice-tutor/validation/cost-log.jsonl`.
- Its cost-log path **must be a module-level constant** (e.g. `COST_LOG_JSONL_PATH`) so a
  test can `monkeypatch.setattr` it to a per-test `tmp_path` fixture — mirror the existing
  hermetic fixtures in `tests/conftest.py` (`docs_dir`, `grounding_tmp`,
  `session_state_tmp`), including a snapshot guard proving the real vault cost-log is never
  mutated.
- **Tests MUST NOT import `app.py`, import `pipecat`, or construct a `TestClient`.**

## Verifier

- Test command: `pytest` (run from repo root). The existing suite lives in `tests/` and
  already runs Pipecat-free via the `conftest.py` stub machinery.
- The **deterministic verifier covers the pure listing helper only.** The browser UI has
  no test rig in this repo (the suite is Python-only). The UI is judged by **review of the
  diff**, not by any executed test.
- **Do NOT negotiate any acceptance criterion that requires a browser, a headless DOM, a
  running uvicorn server, Playwright/Selenium, or hitting a live HTTP endpoint.** No such
  tooling exists here; any such criterion is unwinnable by construction. UI acceptance =
  static inspection of `static/study.html`.

## Natural sprint breakdown (guidance)

The planner may adjust, but the verifiability asymmetry strongly suggests two sprints:

### Sprint 1 — pure listing helper + thin route (deterministically verified)

- Add a pure helper — suggested name `list_study_sessions()` in a **new pipecat-free
  module `sessions.py`** (single purpose: read the cost-log session ledger). It returns
  the study sessions **newest first**, each as:
  - `session_id`
  - `document_title` (resolved via `documents.load_document(document_id)`; the existing
    `/api/sessions/latest` route in `app.py` does exactly this join and is the reference
    implementation to mirror)
  - `session_start` (ISO string from the ledger)
  - `session_duration_sec`
  - `cost_total_usd`
- **Study sessions only.** A row qualifies iff `kind == "session"`, `mode == "study"`, and
  it has a non-null `document_id`. Open-chat / doc-less sessions are excluded. (A study row
  looks like the sample in `cost-log.jsonl`: it carries `session_id`, `session_start`,
  `session_end`, `session_duration_sec`, `cost_total_usd`, `mode`, `document_id`.)
- Malformed / non-JSON lines in the ledger are skipped, not fatal (match the defensive
  `try/except json.loads` the existing `/api/sessions/latest` uses).
- Add a thin FastAPI route **`GET /api/sessions`** in `app.py` that returns
  `list_study_sessions()`. Thin wrapper only — no business logic in the route.
- **Hermetic pytest tests on the pure helper** (not the route): newest-first ordering;
  study-only filtering (open-chat and doc-less rows excluded); all five fields present and
  correct; malformed lines skipped; empty/absent ledger → empty list. Redirect the
  cost-log path via monkeypatch to a seeded `tmp_path`; guard the real vault file is
  untouched.

### Sprint 2 — history UI in study.html (diff-reviewed)

All edits in `static/study.html` (served fresh per request — no server restart needed).

- **New screen `#screen-history`** following the existing `.screen` section pattern. Add a
  corresponding entry to the `screenFor` map inside `showState(...)` (e.g.
  `'history': 'screen-history'`). Use the standard header back button behavior to return
  to the picker (`'picker'`).
- On entering the history screen, `fetch('/api/sessions')` and render a **newest-first
  list**. Each row shows: **document title · human date (from `session_start`) ·
  duration (from `session_duration_sec`, e.g. "8m") · cost (from `cost_total_usd`, e.g.
  "$1.39")**. Empty state: "No past sessions yet."
- **Clicking a row calls the existing `loadSessionView(sid)`** (already defined ~line
  1203) — do **not** reimplement recap/telemetry rendering. That function already renders
  the full ended view (recap + diagnostics) from a `session_id` via existing endpoints.
- **Promote + relabel the entry point.** The current entry is a link at the *bottom* of
  the picker (`.last-session-row` / `#view-last-session`, "View last session →"). Replace
  its role with a **prominent "Past sessions →" entry placed at the TOP of
  `#screen-picker`, above the `Documents` section-label and the document list**, that
  opens `#screen-history`. The new history list subsumes "view last session" (the most
  recent session is simply the top row).

## Hard constraints (do not violate — from the repo's CLAUDE.md and architecture)

- **Do not break the `/chat/` prebuilt-UI routes:** `POST /start`,
  `POST /sessions/{id}/api/offer`, `PATCH /sessions/{id}/api/ice-candidate`. Leave them
  intact.
- **Do not touch the voice pipeline** (`bot.py` pipeline entrypoint / STT / TTS / LLM
  functions) or the pipecat imports.
- **Never delete files.** In particular, leave the existing `/api/sessions/latest` route
  and `#view-last-session` handler in place even if no longer the primary entry point
  (archive rather than delete if removal is genuinely required).
- Keep `app.py`'s route thin; all listing logic lives in the pure helper module.

## Out of scope (do not build)

- User accounts, `client_id`, cookies, ownership, or any per-user filtering.
- A "regenerate recap" action (all existing sessions already have saved recaps).
- Search / filtering / pagination of the history list.
- Including open-chat (doc-less) sessions.
- A deep-linkable `/study/history` server route (the in-app screen is enough; `?session=`
  deep-linking to a recap already exists and is untouched).

## Definition of done (behavioral)

1. `GET /api/sessions` returns all study sessions, newest first, each with
   `session_id`, `document_title`, `session_start`, `session_duration_sec`,
   `cost_total_usd`; open-chat/doc-less sessions excluded.
2. The listing logic lives in a pure, pipecat-free helper with passing hermetic pytest
   coverage; `pytest` is green and the pre-existing suite is not weakened.
3. `/study/` shows a prominent "Past sessions" entry at the top of the picker that opens a
   newest-first history list; each row shows title, date, duration, and cost; clicking a
   row opens that session's recap via the existing `loadSessionView`.
4. Empty ledger → the history list shows "No past sessions yet." rather than erroring.

## Likely planner mis-negotiations to watch (author notes)

- **Over-reach:** trying to test the route via `TestClient`/`import app` (unwinnable —
  pipecat). Force testing at the pure-helper layer.
- **Over-reach:** proposing a browser/DOM/e2e acceptance criterion for the UI (no rig
  exists — unwinnable). UI is diff-reviewed only.
- **Under-reach:** letting the UI sprint pass on "endpoint exists" without actually
  wiring the top-of-picker entry point + `#screen-history` + `loadSessionView` click-through.
- **Scope drift:** re-introducing per-user identity because "history" sounds like it needs
  it. It does not — shared pool is deliberate.
