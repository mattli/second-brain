# Per-User Identity + Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [[2026-07-28-identity-and-isolation-spec]] (binding). Gate doc: [[2026-07-27-validation-gate-and-preshare-build]] §3–§4.

**Goal:** Give Voice Tutor per-user identity (tokened link + long-lived cookie) and structural per-user data isolation, so three recruited testers can each study their own documents without seeing each other's (or Matt's) docs, sessions, recaps, memory, or costs.

**Architecture:** Identity is issued by a hand-maintained token registry and carried by an HttpOnly cookie whose value is the invite token, resolved server-side to a `user_id` on every request. Isolation is enforced by **structural withholding**: every data-access helper takes `user_id` as a **required argument** and reads only within that user's filesystem namespace — no signature offers unscoped access. The voice pipeline learns identity by the `/api/offer` route stamping `user_id` (from the cookie) into the WebRTC body server-side, never trusting client JS.

**Tech Stack:** Python 3, FastAPI, pipecat (pinned — do not bump), pytest. Pure Pipecat-free helper modules tested hermetically by monkeypatching module-level path constants (established `tests/conftest.py` pattern).

## Global Constraints

- **`user_id` is a REQUIRED argument** on every data-access helper. No default, no unscoped overload. (Spec §6.1 — the isolation guarantee IS the signature shape.)
- **`user_id` charset:** `[a-z0-9_-]`, human-readable slugs (`matt`, `sarah`, `dev`). Sanitize via reject-if-not-matching + `Path(user_id).name`. The **token is the secret; the id is a filename.** (Spec §9.3)
- **Token registry lives at `~/.voice-tutor/tokens.json` — NEVER the vault** (vault pushes to GitHub; tokens are credentials). Never commit it anywhere. (Spec §6.2, §9.4)
- **Existing data backfills to `user_id = "matt"`.** (Spec §2, §4.3)
- **`static_prompt_hash` output must not change in any flag state** — historical ledger rows carry `prompt_hash`. (Spec §8.0)
- **Fail closed, never fail guessy.** No name-picker. Cookieless → paste-your-code gate. `/api/offer` with no resolvable `user_id` → `403`. (Spec §3, §6.2)
- **Client-supplied `user_id` is ignored** — only the server-stamped (cookie-derived) value is trusted. (Spec §5.3)
- **Never delete files** — migrations archive to `_archive/` first, then rewrite/move. Migrations are idempotent + re-runnable. (Global rule; spec §4.3, §5.1, §5.2, §5.4)
- **Do not bump `pipecat-ai`.** Do not touch `.env*.local` secret files. (Project CLAUDE.md)
- **Test via pure helpers, not `TestClient`** — `app.py` imports pipecat at module top; route logic stays thin, the pure helpers carry the coverage. (Project CLAUDE.md)

---

## File Structure

**New files:**
- `identity.py` — pure, Pipecat-free. Token-registry load, `resolve_user(token, registry)`, `sanitize_user_id`, cookie name/attribute constants, gate-page HTML string. Tested hermetically.
- `migrate_identity.py` — standalone, idempotent one-time migration + backfill script (ledger `user_id`, move profile/memory/docs/artifacts/transcripts/analyses into `matt/`). Archive-first. Pure helpers tested; `__main__` runs against real dirs.
- `tests/test_identity.py`, `tests/test_migrate_identity.py`, and per-surface mirror-image tests (extend existing test files where one already exists for the module).

**Modified (each gains `user_id`; see spec §6.1 for the full signature list):**
- `documents.py`, `claims.py` — per-user document + claim-sidecar namespace.
- `sessions.py` — `list_study_sessions(user_id)`.
- `study_history.py` — `previous_session_recap(user_id, …)` + per-user artifacts dir.
- `session_state.py` — profile/memory/transcripts per-user.
- `session_naming.py` — `user_id` in writer + reader (preserve `SHORTID_LEN` unity).
- `bot.py` — thread `user_id` through the pipeline; `build_system_instruction(user_id, study=None)`; writers into `<user_id>/`; ledger rows carry `user_id`; fail-closed.
- `app.py` — `require_user` dependency; `/study/` cookie read-order + gate; `offer()` stamps `user_id`; all data routes scoped; session-scoped ownership check; delete duplicate `MEMORY_PATH`/`PROFILE_PATH`; cost-log Matt-only; `/api/whoami`.
- `static/study.html` — `/api/whoami` call; hide the cost-log context-link for non-Matt.
- `~/second-brain/products/voice-tutor/session-analyses/README.md` — document the `<user_id>/` subdir layout (spec §5.4a).

**Task ordering rationale:** hash baseline is captured first (must be pristine). Then the pure identity module, then data-layer schema/backfill, then each helper module scoped bottom-up (leaf helpers before `bot.py`), then `bot.py` wiring, then the `app.py` identity + routing layer, then the frontend, then the real-data migration, then a full-suite + manual verification gate.

---

## Task 1: Pin the prompt-hash baseline (must run on the pristine tree)

Capture the three static-prompt hashes as **literals** before any code changes, so later tasks that touch `bot.py`/`build_system_instruction` can't silently break continuity with historical ledger rows (spec §8.0). The flag-off study literal already exists (`4b937a12…`); capture flag-on-study and regular-mode too.

**Files:**
- Modify: `tests/test_study_opening.py` (append near the existing `PRE_CHANGE_STUDY_HASH` block, ~line 103)

**Interfaces:**
- Consumes: `bot.static_prompt_hash(study: bool)`, `bot.SESSION_OPENING` (existing).
- Produces: pinned literals `PRE_CHANGE_STUDY_HASH_FLAG_ON`, `PRE_CHANGE_REGULAR_HASH` used by the Task 9 continuity assertion.

- [ ] **Step 1: Capture the two missing hashes from the current checkout**

Run (records values only — no source change yet):
```bash
cd /Users/mattli/development/voice-tutor
.venv/bin/python -c "
import bot
bot.SESSION_OPENING = True
print('flag_on_study =', bot.static_prompt_hash(study=True))
bot.SESSION_OPENING = False
print('flag_off_study=', bot.static_prompt_hash(study=True))  # must equal 4b937a12...
print('regular       =', bot.static_prompt_hash(study=False))
"
```
Expected: `flag_off_study` prints `4b937a122fd6b7a5297061be1d853e03833214a66de18491af667cbf13b5a3b0` (sanity check that the tree is pristine). Copy the other two values.

- [ ] **Step 2: Write the pinned-literal regression tests**

Add to `tests/test_study_opening.py` (fill the two literals from Step 1):
```python
# Captured from the pristine tree BEFORE identity threading (Task 1). Pinned as
# LITERALS so any accidental change to static prompt CONTENT breaks loudly —
# every historical session-log.jsonl row carries prompt_hash and must stay attributable.
PRE_CHANGE_STUDY_HASH_FLAG_ON = "<paste flag_on_study from Step 1>"
PRE_CHANGE_REGULAR_HASH = "<paste regular from Step 1>"


def test_flag_on_study_hash_matches_pinned_literal(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    assert imported_bot.static_prompt_hash(study=True) == PRE_CHANGE_STUDY_HASH_FLAG_ON


def test_regular_mode_hash_matches_pinned_literal(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", False)
    assert imported_bot.static_prompt_hash(study=False) == PRE_CHANGE_REGULAR_HASH
```

- [ ] **Step 3: Run to verify they pass on the pristine tree**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -v`
Expected: PASS (all, including the two new literals and the existing `4b937a12…` check).

- [ ] **Step 4: Commit**

```bash
git add tests/test_study_opening.py
git commit -m "test: pin flag-on and regular static_prompt_hash baselines before identity threading"
```

---

## Task 2: `identity.py` — pure token/cookie resolution + gate page

The identity foundation: token-registry load, `resolve_user`, `sanitize_user_id`, cookie constants, and the gate HTML. No FastAPI, no pipecat — pure and hermetically testable.

**Files:**
- Create: `identity.py`
- Test: `tests/test_identity.py`

**Interfaces:**
- Produces:
  - `TOKENS_PATH: Path` (module constant, read at call time — monkeypatchable)
  - `COOKIE_NAME = "vt_uid"`, `COOKIE_MAX_AGE = 31_536_000`
  - `sanitize_user_id(raw: str) -> str | None` — returns the id if it matches `^[a-z0-9_-]+$`, else `None`
  - `load_registry() -> dict[str, str]` — `{token: user_id}`; `{}` if file absent/malformed
  - `resolve_user(token: str | None, registry: dict[str, str]) -> str | None` — the user_id for a valid token, else `None`
  - `GATE_HTML: str` — self-contained paste-your-code page
- Consumes: nothing from other tasks.

- [ ] **Step 1: Write the failing tests**

`tests/test_identity.py`:
```python
import json
import identity


def test_sanitize_accepts_slug():
    assert identity.sanitize_user_id("sarah_dev-1") == "sarah_dev-1"


def test_sanitize_rejects_traversal_and_junk():
    for bad in ["../matt", "a/b", "MATT", "sa rah", "", "a.b", "x/../y"]:
        assert identity.sanitize_user_id(bad) is None


def test_load_registry_reads_map(tmp_path, monkeypatch):
    p = tmp_path / "tokens.json"
    p.write_text(json.dumps({"k7f2x9": "sarah", "aa11bb": "dev"}))
    monkeypatch.setattr(identity, "TOKENS_PATH", p)
    assert identity.load_registry() == {"k7f2x9": "sarah", "aa11bb": "dev"}


def test_load_registry_absent_or_malformed_is_empty(tmp_path, monkeypatch):
    monkeypatch.setattr(identity, "TOKENS_PATH", tmp_path / "nope.json")
    assert identity.load_registry() == {}
    bad = tmp_path / "tokens.json"
    bad.write_text("{not json")
    monkeypatch.setattr(identity, "TOKENS_PATH", bad)
    assert identity.load_registry() == {}


def test_resolve_user_valid_and_invalid():
    reg = {"k7f2x9": "sarah"}
    assert identity.resolve_user("k7f2x9", reg) == "sarah"
    assert identity.resolve_user("unknown", reg) is None
    assert identity.resolve_user(None, reg) is None


def test_resolve_user_registry_value_still_sanitized():
    # A hand-edited registry mapping to a bad id must not leak a bad filename.
    assert identity.resolve_user("t", {"t": "../etc"}) is None
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_identity.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'identity'`.

- [ ] **Step 3: Implement `identity.py`**

```python
"""Pure, Pipecat-free identity primitives: invite-token registry, cookie
constants, user_id sanitization, and the cookieless paste-your-code gate page.

Module-level ``TOKENS_PATH`` is read at CALL time so tests can monkeypatch it —
mirroring documents.DOCUMENTS_DIR / sessions.SESSION_LOG_JSONL_PATH.
"""

import json
import re
from pathlib import Path

TOKENS_PATH = Path.home() / ".voice-tutor" / "tokens.json"

COOKIE_NAME = "vt_uid"          # value is the invite TOKEN, resolved server-side
COOKIE_MAX_AGE = 31_536_000     # 1 year

_USER_ID_RE = re.compile(r"^[a-z0-9_-]+$")


def sanitize_user_id(raw: str) -> str | None:
    """Return ``raw`` if it is a filename-safe slug, else None. The user_id is a
    filename (not a secret); this guards path traversal and odd characters."""
    if not raw or not _USER_ID_RE.match(raw):
        return None
    # Belt-and-suspenders: the regex already forbids separators.
    return raw if Path(raw).name == raw else None


def load_registry() -> dict[str, str]:
    """Load the {token: user_id} map. Absent or malformed → empty (fail closed)."""
    path = TOKENS_PATH
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text())
    except Exception:
        return {}
    if not isinstance(data, dict):
        return {}
    return {str(k): str(v) for k, v in data.items()}


def resolve_user(token: str | None, registry: dict[str, str]) -> str | None:
    """Resolve an invite token to a sanitized user_id, or None. A registry value
    that isn't a valid slug resolves to None rather than leaking a bad filename."""
    if not token:
        return None
    user_id = registry.get(token)
    if user_id is None:
        return None
    return sanitize_user_id(user_id)


GATE_HTML = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Voice Tutor — Enter your invite</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background:#faf7f0; color:#1c1a17;
         display:flex; min-height:100vh; margin:0; align-items:center; justify-content:center; }
  .card { max-width:360px; padding:32px 28px; }
  h1 { font-size:20px; margin:0 0 8px; }
  p { color:#6b6459; font-size:14px; margin:0 0 20px; }
  input { width:100%; padding:10px 12px; font-size:15px; border:1px solid #d9d2c2;
          border-radius:8px; box-sizing:border-box; }
  button { margin-top:12px; width:100%; padding:10px; font-size:15px; border:0;
           border-radius:8px; background:#2d4a6b; color:#fff; cursor:pointer; }
</style></head>
<body><main class="card">
  <h1>Enter your invite link or code</h1>
  <p>Paste the invite code you were sent, or open your invite link again.</p>
  <form onsubmit="event.preventDefault(); var c=document.getElementById('code').value.trim();
                  if(c) location.href='/study/?u='+encodeURIComponent(c);">
    <input id="code" autofocus autocomplete="off" placeholder="invite code">
    <button type="submit">Continue</button>
  </form>
</main></body></html>
"""
```

- [ ] **Step 4: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_identity.py -v`
Expected: PASS (all 6).

- [ ] **Step 5: Commit**

```bash
git add identity.py tests/test_identity.py
git commit -m "feat: add pure identity module (token registry, cookie constants, user_id sanitize, gate page)"
```

---

## Task 3: `session-log.jsonl` — `user_id` field + backfill helper

Add the `user_id` field to the ledger schema and a pure, idempotent backfill helper (spec §4). Backfill sets `user_id: "matt"` on every existing row (both `kind`s) lacking one; already-tagged rows are untouched.

**Files:**
- Create: `migrate_identity.py` (start it here with the ledger backfill; later tasks add the file-move helpers)
- Test: `tests/test_migrate_identity.py`

**Interfaces:**
- Produces: `migrate_identity.backfill_ledger_user_id(lines: list[str], default_user_id: str = "matt") -> list[str]` — pure line-transform; every row emerges with a `user_id`; non-JSON lines pass through unchanged.
- Consumes: nothing.

- [ ] **Step 1: Write the failing tests**

`tests/test_migrate_identity.py`:
```python
import json
import migrate_identity as mig


def test_backfill_adds_user_id_to_untagged_rows():
    lines = [
        json.dumps({"kind": "session", "session_id": "s1"}),
        json.dumps({"kind": "artifact", "session_id": "s1", "document_id": "d1"}),
    ]
    out = [json.loads(l) for l in mig.backfill_ledger_user_id(lines)]
    assert all(row["user_id"] == "matt" for row in out)


def test_backfill_is_idempotent():
    tagged = json.dumps({"kind": "session", "session_id": "s1", "user_id": "sarah"})
    out = mig.backfill_ledger_user_id([tagged])
    assert json.loads(out[0])["user_id"] == "sarah"  # not overwritten


def test_backfill_preserves_all_other_fields_and_line_count():
    row = {"kind": "session", "session_id": "s1", "cost_total_usd": 0.42, "turns": 7}
    out = mig.backfill_ledger_user_id([json.dumps(row)])
    assert len(out) == 1
    got = json.loads(out[0])
    assert got["cost_total_usd"] == 0.42 and got["turns"] == 7


def test_backfill_passes_through_non_json_lines():
    out = mig.backfill_ledger_user_id(["not json\n", ""])
    assert out == ["not json\n", ""]
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_migrate_identity.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'migrate_identity'`.

- [ ] **Step 3: Implement the backfill helper**

`migrate_identity.py`:
```python
"""One-time, idempotent identity migration + ledger backfill.

Pure helpers are unit-tested; the ``__main__`` block (added in Task 14) runs them
against the real ~/.voice-tutor and vault dirs, archiving originals first.
"""

import json

DEFAULT_USER_ID = "matt"


def backfill_ledger_user_id(lines: list[str], default_user_id: str = DEFAULT_USER_ID) -> list[str]:
    """Return ledger lines with ``user_id`` added to any JSON row lacking one.

    Idempotent (rows already carrying user_id are unchanged); non-JSON lines pass
    through verbatim; no other field is touched; line count is preserved.
    """
    out: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            out.append(line)
            continue
        try:
            row = json.loads(stripped)
        except Exception:
            out.append(line)
            continue
        if isinstance(row, dict) and "user_id" not in row:
            row = {"user_id": default_user_id, **row}
            out.append(json.dumps(row))
        else:
            out.append(line if not isinstance(row, dict) else json.dumps(row))
    return out
```

- [ ] **Step 4: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_migrate_identity.py -v`
Expected: PASS (all 4).

- [ ] **Step 5: Commit**

```bash
git add migrate_identity.py tests/test_migrate_identity.py
git commit -m "feat: ledger user_id backfill helper (idempotent, field-preserving)"
```

---

## Task 4: `sessions.list_study_sessions(user_id)` — scope + mirror-image test

Filter the history listing to one user's rows (spec §3.1). Rows now carry `user_id`; the helper requires it.

**Files:**
- Modify: `sessions.py:27` (`list_study_sessions`)
- Test: `tests/test_sessions_listing.py`

**Interfaces:**
- Consumes: ledger rows now carry `user_id` (Task 3).
- Produces: `sessions.list_study_sessions(user_id: str) -> list[dict]` — only rows whose `user_id == user_id`.

- [ ] **Step 1: Write the failing mirror-image test**

Add to `tests/test_sessions_listing.py` (reuse the file's existing `cost_log_tmp` + doc-materializing helpers; a row-writer that stamps `user_id` is needed — extend the existing seed helper to accept `user_id`):
```python
def test_list_scoped_to_user_and_mirror_image(cost_log_tmp, docs_dir):
    # Materialize docs so titles resolve (existing helper pattern in this file).
    _make_doc(docs_dir, "doc-a", "# A\nx")
    _make_doc(docs_dir, "doc-b", "# B\ny")
    _seed_session(cost_log_tmp, session_id="sa", document_id="doc-a", user_id="matt")
    _seed_session(cost_log_tmp, session_id="sb", document_id="doc-b", user_id="sarah")

    matt = sessions.list_study_sessions("matt")
    sarah = sessions.list_study_sessions("sarah")
    dev = sessions.list_study_sessions("dev")

    assert [r["session_id"] for r in matt] == ["sa"]
    assert [r["session_id"] for r in sarah] == ["sb"]
    assert dev == []  # mirror image: a user with no sessions sees nothing
```
(If `_seed_session`/`_make_doc` helpers don't yet accept `user_id`/exist under these names, add a thin local `_seed_session(path, *, session_id, document_id, user_id)` that appends a `{"kind":"session","mode":"study",...,"user_id":user_id}` row.)

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_sessions_listing.py::test_list_scoped_to_user_and_mirror_image -v`
Expected: FAIL — `list_study_sessions()` takes no argument / TypeError.

- [ ] **Step 3: Scope the helper**

In `sessions.py`, change the signature and add the filter (after the `mode != "study"` check, before extracting output fields):
```python
def list_study_sessions(user_id: str) -> list[dict]:
    ...
            if entry.get("mode") != "study":
                continue
            if entry.get("user_id") != user_id:      # <-- structural scope
                continue
            doc_id = entry.get("document_id")
    ...
```
Update the module docstring to note the required `user_id` scope.

- [ ] **Step 4: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_sessions_listing.py -v`
Expected: PASS (new test; update any pre-existing call sites in the test file to pass a `user_id`).

- [ ] **Step 5: Commit**

```bash
git add sessions.py tests/test_sessions_listing.py
git commit -m "feat: scope list_study_sessions to a required user_id (mirror-image tested)"
```

---

## Task 5: `study_history.previous_session_recap(user_id, …)` + per-user artifacts

Close the founding cross-user "where you left off" leak (gate §3) and move artifacts under `<user_id>/`.

**Files:**
- Modify: `study_history.py` (`ARTIFACTS_DIR` usage in `previous_session_recap`, line ~45–88)
- Test: `tests/test_study_history.py`

**Interfaces:**
- Consumes: ledger rows carry `user_id` (Task 3); artifacts live at `ARTIFACTS_DIR/<user_id>/<session_id>.md` (Task 9 writer will honor this).
- Produces: `study_history.previous_session_recap(user_id: str, document_id, exclude_session_id) -> dict | None`.

- [ ] **Step 1: Write the failing mirror-image test**

Add to `tests/test_study_history.py` (uses the existing `study_history_tmp` fixture yielding `(ledger, artifacts)`):
```python
def test_recap_is_user_scoped(study_history_tmp):
    ledger, artifacts = study_history_tmp
    import json
    # A studied doc D and left a recap; B never studied D.
    ledger.write_text(
        json.dumps({"kind": "session", "mode": "study", "session_id": "sa",
                    "document_id": "D", "session_start": "2026-07-27T10:00:00",
                    "user_id": "matt"}) + "\n"
    )
    (artifacts / "matt").mkdir(parents=True, exist_ok=True)
    (artifacts / "matt" / "sa.md").write_text("# Study session — D\n\n## What we covered\n- x\n")

    # matt sees the recap; sarah (mirror image) sees None on the same doc.
    assert sh.previous_session_recap("matt", "D", exclude_session_id="live") is not None
    assert sh.previous_session_recap("sarah", "D", exclude_session_id="live") is None
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_study_history.py::test_recap_is_user_scoped -v`
Expected: FAIL — signature mismatch / reads flat artifacts dir.

- [ ] **Step 3: Scope the helper**

In `study_history.py`, add `user_id` as the first parameter, filter ledger rows by `user_id`, and resolve the artifact under the user's subdir:
```python
def previous_session_recap(user_id, document_id, exclude_session_id):
    path = SESSION_LOG_JSONL_PATH
    if not path.exists():
        return None
    best_start = None
    best_sid = None
    with path.open() as f:
        for line in f:
            try:
                entry = json.loads(line)
            except Exception:
                continue
            if not isinstance(entry, dict):
                continue
            if entry.get("kind") != "session" or entry.get("mode") != "study":
                continue
            if entry.get("user_id") != user_id:          # <-- scope
                continue
            if entry.get("document_id") != document_id:
                continue
            sid = entry.get("session_id")
            if sid is None or sid == exclude_session_id:
                continue
            start = entry.get("session_start") or ""
            if best_start is None or start > best_start:
                best_start, best_sid = start, sid
    if best_sid is None:
        return None
    artifact = ARTIFACTS_DIR / user_id / f"{best_sid}.md"   # <-- per-user path
    if not artifact.exists():
        return None
    ...
```

- [ ] **Step 4: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_study_history.py -v`
Expected: PASS (update any existing calls in the test file to pass `user_id`).

- [ ] **Step 5: Commit**

```bash
git add study_history.py tests/test_study_history.py
git commit -m "feat: scope previous_session_recap to user_id + per-user artifacts dir"
```

---

## Task 6: `session_state` — per-user profile / memory / transcripts

Namespace `profile.md`/`memory.md` to `profiles/<user_id>.md` / `memory/<user_id>.md`, and transcripts to `transcripts/<user_id>/` (spec §5.1, §5.4). Helpers require `user_id`.

**Files:**
- Modify: `session_state.py` (path constants + `load_profile`, `load_memory`, `append_to_memory`, `load_most_recent_transcript_block`)
- Modify: `tests/conftest.py` (`session_state_tmp` fixture — add per-user dir constants), `tests/session_state_cases.py`, `tests/_ss_coverage_driver.py`
- Test: `tests/test_session_state_characterization.py`

**Interfaces:**
- Produces:
  - `session_state.PROFILES_DIR`, `session_state.MEMORY_DIR` (module constants)
  - `profile_path(user_id) -> Path`, `memory_path(user_id) -> Path`
  - `load_profile(user_id) -> str`, `load_memory(user_id) -> str`
  - `append_to_memory(user_id, transcript, summary_text) -> None`
  - `load_most_recent_transcript_block(user_id) -> str | None` (reads `TRANSCRIPTS_DIR/<user_id>/`)
- Consumes: `user_id` from `bot.py` (Task 9).

- [ ] **Step 1: Write the failing mirror-image test**

Add to `tests/test_session_state_characterization.py` (extend `session_state_tmp` first — see Step 3):
```python
def test_profile_memory_are_user_scoped(session_state_tmp):
    ss.PROFILES_DIR.mkdir(parents=True, exist_ok=True)
    ss.MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    ss.profile_path("matt").write_text("I am Matt.\n")
    ss.memory_path("matt").write_text("# Memory\n\nmatt stuff\n")

    assert ss.load_profile("matt") == "I am Matt.\n"
    assert ss.load_memory("matt") == "# Memory\n\nmatt stuff\n"
    # Mirror image: a different user sees empty, never matt's data.
    assert ss.load_profile("sarah") == ""
    assert ss.load_memory("sarah") == ""


def test_append_to_memory_is_user_scoped(session_state_tmp, deterministic_locale):
    ss.MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    ss.append_to_memory("sarah", {"session_start": "2026-07-27T09:05:00", "turns": []}, "- s said x")
    assert ss.memory_path("sarah").exists()
    assert not ss.memory_path("matt").exists()  # write landed only in sarah's file
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_session_state_characterization.py::test_profile_memory_are_user_scoped -v`
Expected: FAIL — `PROFILES_DIR`/`profile_path` undefined, `load_profile` takes no arg.

- [ ] **Step 3: Implement per-user paths**

In `session_state.py` replace the singleton constants and helpers:
```python
VOICE_TUTOR_DIR = Path.home() / ".voice-tutor"
TRANSCRIPTS_DIR = VOICE_TUTOR_DIR / "transcripts"
PROFILES_DIR = VOICE_TUTOR_DIR / "profiles"
MEMORY_DIR = VOICE_TUTOR_DIR / "memory"


def profile_path(user_id: str) -> Path:
    return PROFILES_DIR / f"{Path(user_id).name}.md"


def memory_path(user_id: str) -> Path:
    return MEMORY_DIR / f"{Path(user_id).name}.md"


def load_profile(user_id: str) -> str:
    p = profile_path(user_id)
    return p.read_text() if p.exists() else ""


def load_memory(user_id: str) -> str:
    p = memory_path(user_id)
    return p.read_text() if p.exists() else ""


def append_to_memory(user_id: str, transcript: dict, summary_text: str):
    p = memory_path(user_id)
    header = f"## {_format_memory_date(transcript['session_start'])}\n"
    entry = header + summary_text.strip() + "\n\n"
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(
            "# Memory — what we've discussed\n\n"
            "One section per session, append-only. Summaries are lifted from "
            "the `.summary.md` sidecar written alongside each transcript.\n\n"
        )
    with p.open("a") as f:
        f.write(entry)


def load_most_recent_transcript_block(user_id: str) -> str | None:
    user_dir = TRANSCRIPTS_DIR / Path(user_id).name
    if not user_dir.exists():
        return None
    files = sorted(
        (f for f in user_dir.glob("*.json") if not f.name.endswith(".usage.json")),
        reverse=True,
    )
    if not files:
        return None
    transcript = json.loads(files[0].read_text())
    return _format_full_transcript_block(transcript, header_suffix=" (most recent)")
```
Note: keep `PROFILE_PATH`/`MEMORY_PATH` **removed** — do not leave the singletons, so no caller can silently read the shared file.

- [ ] **Step 4: Update fixtures and old characterization tests**

In `tests/conftest.py` `session_state_tmp`, replace the two singleton patches with:
```python
    monkeypatch.setattr(ss, "PROFILES_DIR", root / "profiles")
    monkeypatch.setattr(ss, "MEMORY_DIR", root / "memory")
    monkeypatch.setattr(ss, "TRANSCRIPTS_DIR", root / "transcripts")
```
Update existing `test_session_state_characterization.py`, `session_state_cases.py`, `_ss_coverage_driver.py` calls to the new `user_id` signatures (e.g. `ss.load_profile("matt")`, writing into `ss.profile_path("matt")`). The dual-import tests keep working — they assert `imported_bot.load_profile is session_state.load_profile`.

- [ ] **Step 5: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_session_state_characterization.py tests/test_session_state_module.py -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add session_state.py tests/conftest.py tests/test_session_state_characterization.py tests/session_state_cases.py tests/_ss_coverage_driver.py
git commit -m "feat: per-user profile/memory/transcripts in session_state (required user_id)"
```

---

## Task 7: `documents` — per-user namespace + required `user_id`

Namespace uploads/text/summaries under `documents/<user_id>/` and require `user_id` on `list_documents`, `save_upload`, `load_document` (spec §5.2). This is isolation of the existing upload *write path* only — no upload-UX changes.

**Files:**
- Modify: `documents.py` (`DOCUMENTS_DIR` usage in the three public helpers + `_summary_path`)
- Modify: `tests/conftest.py` (`docs_dir` fixture already redirects `DOCUMENTS_DIR`; helpers now target a `<user_id>/` subdir)
- Test: `tests/test_documents_list_load.py`

**Interfaces:**
- Produces:
  - `documents.user_dir(user_id: str) -> Path` = `DOCUMENTS_DIR / <sanitized user_id>`
  - `list_documents(user_id: str) -> list[dict]`
  - `save_upload(user_id: str, filename: str, raw: bytes) -> dict`
  - `load_document(user_id: str, doc_id: str) -> tuple[str, str] | None`
- Consumes: `user_id` from `app.py` routes + `bot.py`.

- [ ] **Step 1: Write the failing mirror-image test**

Add to `tests/test_documents_list_load.py`:
```python
def test_documents_are_user_scoped(docs_dir):
    a = save_upload("matt", "a.md", b"# A\nbody")
    b = save_upload("sarah", "b.md", b"# B\nbody")

    matt_ids = {d["document_id"] for d in asyncio.run(list_documents("matt"))}
    sarah_ids = {d["document_id"] for d in asyncio.run(list_documents("sarah"))}

    assert a["document_id"] in matt_ids and a["document_id"] not in sarah_ids
    assert b["document_id"] in sarah_ids and b["document_id"] not in matt_ids
    # Mirror image: cross-user load_document returns None.
    assert load_document("sarah", a["document_id"]) is None
    assert load_document("matt", a["document_id"]) is not None
    # A fresh user's picker is empty (demo docs deferred — spec §1).
    assert asyncio.run(list_documents("dev")) == []
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_documents_list_load.py::test_documents_are_user_scoped -v`
Expected: FAIL — signatures take no `user_id`.

- [ ] **Step 3: Implement per-user resolution**

In `documents.py`, add `user_dir` and route all path building through it:
```python
def user_dir(user_id: str) -> Path:
    return DOCUMENTS_DIR / Path(user_id).name


def _summary_path(user_id: str, doc_id: str) -> Path:
    return user_dir(user_id) / f"{doc_id}.summary.txt"
```
- `save_upload(user_id, filename, raw)`: `d = user_dir(user_id); d.mkdir(parents=True, exist_ok=True)` and write `d / f"{doc_id}-{safe_name}"`, `d / f"{doc_id}.txt"`, `_summary_path(user_id, doc_id)`.
- `list_documents(user_id)`: `d = user_dir(user_id); if not d.exists(): return []`; glob within `d`; `_summary_path(user_id, ...)`.
- `load_document(user_id, doc_id)`: resolve `user_dir(user_id) / f"{doc_id}.txt"` and its `{doc_id}-*` sibling.

- [ ] **Step 4: Update existing documents tests**

Update `test_documents_list_load.py`, `test_documents_validation.py`, `test_documents_extraction.py`, `test_documents_title.py` calls to pass a `user_id` (e.g. `save_upload("matt", ...)`). The `docs_dir` fixture is unchanged (still patches `DOCUMENTS_DIR`); files now land under `DOCUMENTS_DIR/matt/`.

- [ ] **Step 5: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_documents_list_load.py tests/test_documents_validation.py tests/test_documents_extraction.py tests/test_documents_title.py -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add documents.py tests/test_documents_list_load.py tests/test_documents_validation.py tests/test_documents_extraction.py tests/test_documents_title.py
git commit -m "feat: per-user document namespace (required user_id on list/save/load)"
```

---

## Task 8: `claims` — per-user sidecar path + required `user_id`

Claim sidecars (`{doc_id}.claims.json`) live in the documents dir, so they follow the per-user namespace (spec §5.2, §7.4). `generate_claims` and `load_fresh_claims` require `user_id`.

**Files:**
- Modify: `claims.py` (`DOCUMENTS_DIR`, `_claims_path`, `generate_claims`, `load_fresh_claims`)
- Modify: `tests/conftest.py` (`claims_docs_dir` fixture — files land under `<user_id>/`)
- Test: `tests/test_claims.py`

**Interfaces:**
- Produces:
  - `claims.generate_claims(user_id: str, doc_id: str, text: str) -> ...` (return type unchanged)
  - `claims.load_fresh_claims(user_id: str, doc_id: str, text: str) -> list | None`
  - `claims._claims_path(user_id: str, doc_id: str) -> Path` = `DOCUMENTS_DIR/<user_id>/<doc_id>.claims.json`
- Consumes: `user_id` from `app.prepare_claims` (Task 12) and `bot.bot` (Task 9).

- [ ] **Step 1: Write the failing mirror-image test**

Add to `tests/test_claims.py` (use `claims_docs_dir`; if extraction is a live LLM call, target only the cache-read path `load_fresh_claims`, seeding a fresh sidecar by hand — mirror the existing fresh/stale tests in this file):
```python
def test_load_fresh_claims_is_user_scoped(claims_docs_dir):
    text = "Some doc text."
    # Seed a fresh sidecar for matt only (reuse the file's existing sidecar-writing
    # helper / source_hash computation).
    _seed_fresh_sidecar(claims_docs_dir, user_id="matt", doc_id="D", text=text)
    assert claims.load_fresh_claims("matt", "D", text) is not None
    # Mirror image: sarah has no sidecar for D → None (degrade to plain study).
    assert claims.load_fresh_claims("sarah", "D", text) is None
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_claims.py::test_load_fresh_claims_is_user_scoped -v`
Expected: FAIL — signature/path mismatch.

- [ ] **Step 3: Implement per-user sidecar path**

In `claims.py`, make `_claims_path` user-aware and thread `user_id` through both public helpers:
```python
def _claims_path(user_id: str, doc_id: str) -> Path:
    return DOCUMENTS_DIR / Path(user_id).name / f"{doc_id}.claims.json"
```
`generate_claims(user_id, doc_id, text)` and `load_fresh_claims(user_id, doc_id, text)` pass `user_id` into `_claims_path`; the writer `mkdir(parents=True, exist_ok=True)` on the user subdir before writing. Keep the `source_hash` freshness logic unchanged.

- [ ] **Step 4: Update existing claims tests**

Update `test_claims.py` call sites to pass a `user_id`. Adjust `_seed_fresh_sidecar`/path helpers to write under `<user_id>/`.

- [ ] **Step 5: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_claims.py -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add claims.py tests/test_claims.py tests/conftest.py
git commit -m "feat: per-user claim sidecar path (required user_id)"
```

---

## Task 9: `session_naming` — `user_id` in writer + reader (preserve unity)

Add `user_id` to both the filename builder and the finder, moving analyses under `<user_id>/`. **This module was fixed 2026-07-27 for exactly the writer/reader drift failure** (spec §5.4c) — change both together, keep `SHORTID_LEN` shared, re-pin the round-trip.

**Files:**
- Modify: `session_naming.py` (`find_analysis_path`; `session_analysis_filename` stays name-only but the caller writes under `<user_id>/`)
- Test: `tests/test_session_naming.py`

**Interfaces:**
- Produces: `find_analysis_path(directory: Path, user_id: str, session_id: str) -> Path | None` — globs within `directory/<user_id>/`.
- `session_analysis_filename(session_start, session_id)` is unchanged (returns a bare filename); the **directory** it's written into gains `<user_id>/` at the `bot.py` call site (Task 10) and the app read side passes `user_id` to `find_analysis_path`.
- Consumes: `user_id` from `bot.py` writer + `app.py` readers.

- [ ] **Step 1: Write the failing round-trip + mirror-image test**

Add to `tests/test_session_naming.py`:
```python
from datetime import datetime
import session_naming as sn


def test_find_analysis_path_round_trip_within_user_dir(tmp_path):
    start = datetime(2026, 7, 27, 14, 30, 5)
    sid = "abcd1234-0000-0000-0000-000000000000"
    name = sn.session_analysis_filename(start, sid)      # writer's name
    user_dir = tmp_path / "matt"
    user_dir.mkdir()
    (user_dir / name).write_text("analysis")

    # Reader finds it within matt/; a different user finds nothing (mirror image).
    assert sn.find_analysis_path(tmp_path, "matt", sid) == user_dir / name
    assert sn.find_analysis_path(tmp_path, "sarah", sid) is None


def test_shortid_len_shared_between_writer_and_reader():
    # Guards the drift the 2026-07-27 fix closed: the reader must glob on exactly
    # the shortid the writer embeds.
    start = datetime(2026, 7, 27, 14, 30, 5)
    sid = "abcdef12-9999-0000-0000-000000000000"
    name = sn.session_analysis_filename(start, sid)
    assert f"-{sid[:sn.SHORTID_LEN]}.md" in name
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_session_naming.py::test_find_analysis_path_round_trip_within_user_dir -v`
Expected: FAIL — `find_analysis_path` takes `(directory, session_id)`.

- [ ] **Step 3: Add `user_id` to the finder**

In `session_naming.py`:
```python
def find_analysis_path(directory: Path, user_id: str, session_id: str) -> Path | None:
    shortid = session_id[:SHORTID_LEN]
    if not shortid or not shortid.isalnum():
        return None
    user_dir = directory / Path(user_id).name
    matches = sorted(user_dir.glob(f"session-analysis-*-{shortid}.md"))
    return matches[0] if matches else None
```
Update the module docstring's round-trip note to mention the `<user_id>/` subdir.

- [ ] **Step 4: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_session_naming.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add session_naming.py tests/test_session_naming.py
git commit -m "feat: user-scoped find_analysis_path (writer/reader/SHORTID_LEN unity preserved)"
```

---

## Task 10: `bot.py` — thread `user_id` through the pipeline

Wire `user_id` from the WebRTC body into every helper, write all artifacts under `<user_id>/`, stamp `user_id` on both ledger row kinds, and keep `static_prompt_hash` byte-identical (Task 1 guard). Fail closed if `user_id` is missing.

**Files:**
- Modify: `bot.py` (`bot()`, `build_system_instruction`, `save_transcript`, `generate_artifact`, `generate_session_analysis` call, the `.prompt.txt` write)
- Test: `tests/test_study_claim_steering.py` (build_system_instruction), `tests/test_study_opening.py` (hash guard from Task 1 must stay green)

**Interfaces:**
- Consumes: `documents.load_document(user_id, doc_id)`, `claims.load_fresh_claims(user_id, doc_id, text)`, `study_history.previous_session_recap(user_id, …)`, `session_state.load_profile(user_id)`/`load_memory(user_id)`/`append_to_memory(user_id, …)`/`load_most_recent_transcript_block(user_id)`, `session_naming.session_analysis_filename` (name only).
- Produces: `build_system_instruction(user_id: str, study: dict | None = None) -> str`; ledger rows with top-level `user_id`; artifacts/transcripts/analyses under `<user_id>/`.

- [ ] **Step 1: Write the failing test (build_system_instruction requires user_id + hash unchanged)**

Add to `tests/test_study_claim_steering.py`:
```python
def test_build_system_instruction_requires_user_id_and_scopes_profile(imported_bot, session_state_tmp):
    import session_state as ss
    ss.PROFILES_DIR.mkdir(parents=True, exist_ok=True)
    ss.profile_path("matt").write_text("Matt profile")
    ss.profile_path("sarah").write_text("Sarah profile")
    prompt_matt = imported_bot.build_system_instruction("matt", study={"doc_title": "T", "doc_text": "D"})
    prompt_sarah = imported_bot.build_system_instruction("sarah", study={"doc_title": "T", "doc_text": "D"})
    assert "Matt profile" in prompt_matt and "Sarah profile" not in prompt_matt
    assert "Sarah profile" in prompt_sarah and "Matt profile" not in prompt_sarah
```
(The Task 1 hash tests in `test_study_opening.py` are the continuity guard — they must remain green after this task.)

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_study_claim_steering.py::test_build_system_instruction_requires_user_id_and_scopes_profile -v`
Expected: FAIL — `build_system_instruction` takes `(study=None)`.

- [ ] **Step 3: Thread `user_id` through `bot.py`**

Changes (each is mechanical — `user_id` becomes the first argument / path segment):
1. `build_system_instruction(user_id, study=None)`: `profile = load_profile(user_id)`; `memory = load_memory(user_id)` in both branches; `load_most_recent_transcript_block(user_id)` in the regular branch. **Do not** change any static string → hash stays identical.
2. In `bot()`:
   ```python
   body = getattr(runner_args, "body", None) or {}
   user_id = body.get("user_id")            # server-stamped by app.offer()
   if not user_id:
       print("[bot] no user_id on session body; refusing (fail closed)", file=sys.stderr, flush=True)
       return                                # fail closed — no session
   document_id = body.get("document_id")
   ...
   loaded = documents.load_document(user_id, document_id)
   ...
   cached = claims.load_fresh_claims(user_id, study_meta["document_id"], study_meta["doc_text"])
   ...
   previously = study_history.previous_session_recap(user_id, study_meta["document_id"], study_meta["session_id"])
   ...
   system_instruction = build_system_instruction(user_id, study=study_arg)
   ```
   Carry `user_id` into `study_meta` so `save_transcript`/`generate_artifact` can use it.
3. Writers → per-user dirs:
   - `.prompt.txt`: `(TRANSCRIPTS_DIR / user_id).mkdir(parents=True, exist_ok=True)` then write `TRANSCRIPTS_DIR / user_id / f"{stem}.prompt.txt"`.
   - transcript `.json`, `.usage.json`, `.summary.md`: under `TRANSCRIPTS_DIR / user_id /`.
   - `generate_session_summary`/`generate_session_analysis`/`generate_artifact`: write under the user's subdir (analysis: `SESSION_ANALYSIS_DIR / user_id / session_analysis_filename(...)`; artifact: `ARTIFACTS_DIR / user_id / f"{session_id}.md"`).
   - `append_to_memory(user_id, transcript, summary_path.read_text())`.
4. Ledger rows: add `jsonl_entry["user_id"] = user_id` (session row) and `row["user_id"] = user_id` (artifact row).
5. `session_state.TRANSCRIPTS_DIR`-derived reads inside `save_transcript` (`summary_path`, `.usage.json`) must all use the `TRANSCRIPTS_DIR / user_id` base — define `user_tx = TRANSCRIPTS_DIR / user_id` once and reuse.

- [ ] **Step 4: Run to verify pass + hash continuity green**

Run: `.venv/bin/python -m pytest tests/test_study_claim_steering.py tests/test_study_opening.py -v`
Expected: PASS — including the Task 1 literals (`test_flag_on_study_hash_matches_pinned_literal`, `test_regular_mode_hash_matches_pinned_literal`, and the existing `4b937a12…` check). If any hash test fails, a static string was changed — revert that content change.

- [ ] **Step 5: Commit**

```bash
git add bot.py tests/test_study_claim_steering.py
git commit -m "feat: thread user_id through the voice pipeline (fail-closed, per-user writers, prompt-hash unchanged)"
```

---

## Task 11: `app.py` — identity layer (cookie, gate, offer stamping, whoami)

The FastAPI identity plumbing: read the cookie → resolve user_id; serve the page vs. gate per read-order; stamp `user_id` into the WebRTC body server-side; `/api/whoami`.

**Files:**
- Modify: `app.py` (imports; `study_page`; `offer`; the `/sessions/{id}` proxy; new `require_user` dependency + `/api/whoami`)
- Test: `tests/test_app_identity.py` (new — pure helper `resolve_request_user` tested without a `TestClient`, per CLAUDE.md)

**Interfaces:**
- Produces:
  - `app.resolve_request_user(cookie_value: str | None) -> str | None` — pure: `identity.resolve_user(cookie_value, identity.load_registry())`.
  - `require_user(request: Request) -> str` FastAPI dependency — 403 if unresolved.
  - `study_page` honoring the cookie→URL-param→gate read order + Set-Cookie.
  - `offer(request, background_tasks, http_request: Request)` stamping `user_id` into `request.request_data`.
  - `GET /api/whoami -> {"user_id": str}`.
- Consumes: `identity.*` (Task 2).

- [ ] **Step 1: Write the failing test for the pure resolver**

`tests/test_app_identity.py` (import the pure function only — do NOT import `app` if it drags pipecat; test the resolver by monkeypatching `identity.TOKENS_PATH` and calling `identity.resolve_user` composition. If `app` can't import in this env, put `resolve_request_user`'s logic in `identity.py` as `resolve_cookie(cookie_value)` and test there):
```python
import json
import identity


def test_resolve_cookie_end_to_end(tmp_path, monkeypatch):
    reg = tmp_path / "tokens.json"
    reg.write_text(json.dumps({"k7f2x9": "sarah"}))
    monkeypatch.setattr(identity, "TOKENS_PATH", reg)
    assert identity.resolve_cookie("k7f2x9") == "sarah"
    assert identity.resolve_cookie("bad") is None
    assert identity.resolve_cookie(None) is None
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_app_identity.py -v`
Expected: FAIL — `identity.resolve_cookie` undefined.

- [ ] **Step 3: Add `resolve_cookie` to `identity.py`**

```python
def resolve_cookie(cookie_value: str | None) -> str | None:
    """Convenience: resolve a cookie's token value to a user_id via the on-disk
    registry. Reads the registry fresh each call so a newly minted/revoked token
    takes effect without a restart."""
    return resolve_user(cookie_value, load_registry())
```

- [ ] **Step 4: Wire the FastAPI layer in `app.py`**

```python
import identity
from fastapi import Cookie, Depends
from fastapi.responses import RedirectResponse

def require_user(request: Request) -> str:
    user_id = identity.resolve_cookie(request.cookies.get(identity.COOKIE_NAME))
    if user_id is None:
        raise HTTPException(status_code=403, detail="no valid identity")
    return user_id


@app.get("/api/whoami")
async def whoami(user_id: str = Depends(require_user)):
    return {"user_id": user_id}
```
Rewrite `study_page` (both `/study` and `/study/`) to honor the read order (spec §6.2):
```python
@app.get("/study/", include_in_schema=False)
@app.get("/study", include_in_schema=False)
async def study_page(request: Request, u: str | None = Query(None)):
    cookie_uid = identity.resolve_cookie(request.cookies.get(identity.COOKIE_NAME))
    token_uid = identity.resolve_cookie(u) if u else None
    # URL param present + valid → set/refresh cookie, redirect to clean URL.
    if token_uid is not None:
        resp = RedirectResponse(url="/study/", status_code=303)
        resp.set_cookie(
            identity.COOKIE_NAME, u, max_age=identity.COOKIE_MAX_AGE,
            httponly=True, samesite="lax", path="/",
            secure=request.url.scheme == "https",
        )
        return resp
    if cookie_uid is not None:
        return FileResponse(STUDY_HTML, media_type="text/html")
    # Neither cookie nor valid token → paste-your-code gate. Fail closed.
    return HTMLResponse(identity.GATE_HTML)
```
Stamp `user_id` in `offer()` (add an `http_request: Request` param; both the direct route and the proxy pass it):
```python
@app.post("/api/offer")
async def offer(request: SmallWebRTCRequest, background_tasks: BackgroundTasks, http_request: Request):
    user_id = identity.resolve_cookie(http_request.cookies.get(identity.COOKIE_NAME))
    if user_id is None:
        raise HTTPException(status_code=403, detail="no valid identity")
    rd = dict(request.request_data or {})
    rd["user_id"] = user_id                 # server-stamped; client value ignored
    request.request_data = rd
    async def webrtc_connection_callback(connection):
        runner_args = SmallWebRTCRunnerArguments(webrtc_connection=connection, body=request.request_data)
        background_tasks.add_task(bot.bot, runner_args)
    return await small_webrtc_handler.handle_web_request(request=request, webrtc_connection_callback=webrtc_connection_callback)
```
In the `/sessions/{id}/{path}` proxy, the POST-offer branch already has `request: Request` — pass it: `return await offer(webrtc_request, background_tasks, request)`. The PATCH/ice branch is unchanged (identity was established on offer). Update the direct `@app.patch("/api/offer")` — no user_id needed there.

- [ ] **Step 5: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_app_identity.py -v`
Expected: PASS. Also `./start.sh` boots without import error (manual — see Task 15).

- [ ] **Step 6: Commit**

```bash
git add identity.py app.py tests/test_app_identity.py
git commit -m "feat: FastAPI identity layer — cookie read-order, gate, offer user_id stamping, whoami"
```

---

## Task 12: `app.py` — scope every data route + delete duplicate constants

Thread `require_user` into every data route, scope the helper calls, add ownership checks on session-scoped reads, delete the duplicate `MEMORY_PATH`/`PROFILE_PATH`, and make cost-log Matt-only.

**Files:**
- Modify: `app.py` (routes: `list_documents_route`, `upload_document`, `prepare_claims`, `get_artifact`, `get_latest_session`, `list_sessions`, `_lookup_session_doc`, `get_telemetry`, `view_memory`, `view_profile`, `view_cost_log`, `view_prompt`, `view_analysis`)
- Test: covered indirectly (routes stay `TestClient`-untested per CLAUDE.md); the scoping logic lives in the already-tested pure helpers. Add one pure test for the ownership-check helper.

**Access-tier principle (decided post-spec, 2026-07-28):** tester-visible surfaces
are artifacts about *their own learning* (recap, sessions list, own costs, own
memory/profile). **Matt-only** surfaces are artifacts about *the machine*: the
system prompt (which contains the private claim map — a tester reading it spoils
the steering the validation gate measures), the session analysis, and the global
cost-log. Matt-only surfaces get a hard `user_id != "matt" → 404`, **in addition
to** the ownership check for Matt's own requests; and the telemetry composite must
**not leak them through a side door**.

**Interfaces:**
- Consumes: `require_user` (Task 11); all scoped helpers (Tasks 4–9).
- Produces (both pure, in `sessions.py`):
  - `sessions.session_belongs_to(user_id: str, session_id: str) -> bool` — ownership predicate (reads ledger).
  - `sessions.can_view_machine_artifacts(user_id: str) -> bool` — `True` only for `"matt"`; gates prompt/analysis/cost-log viewers.
  - `sessions.redact_telemetry_for_user(telemetry: dict, user_id: str) -> dict` — strips the Matt-only fields (`analysis`, `has_prompt`) for non-Matt users; returns unchanged for Matt.

- [ ] **Step 1: Write the failing tests (ownership + Matt-only gate + telemetry redaction)**

Add to `tests/test_sessions_listing.py` (or a small new `tests/test_app_ownership.py` importing only the ledger-reading logic). Prefer putting the pure predicate in `sessions.py`:
```python
# in sessions.py
def session_belongs_to(user_id: str, session_id: str) -> bool:
    """True iff a session row with this session_id carries this user_id."""
    path = SESSION_LOG_JSONL_PATH
    if not path.exists():
        return False
    with path.open() as f:
        for line in f:
            try:
                e = json.loads(line)
            except Exception:
                continue
            if isinstance(e, dict) and e.get("kind") == "session" and e.get("session_id") == session_id:
                return e.get("user_id") == user_id
    return False
```
Tests:
```python
def test_session_belongs_to(cost_log_tmp):
    _seed_session(cost_log_tmp, session_id="sa", document_id="d", user_id="matt")
    assert sessions.session_belongs_to("matt", "sa") is True
    assert sessions.session_belongs_to("sarah", "sa") is False
    assert sessions.session_belongs_to("matt", "missing") is False


def test_can_view_machine_artifacts_matt_only():
    # Mirror image: a non-matt user is denied prompt/analysis/cost-log surfaces.
    assert sessions.can_view_machine_artifacts("matt") is True
    assert sessions.can_view_machine_artifacts("sarah") is False


def test_redact_telemetry_strips_matt_only_fields_for_non_matt():
    full = {"recap": "r", "cost": {"x": 1}, "memory_append": "m",
            "analysis": "AAA", "has_prompt": True, "document_title": "T"}
    # Matt sees everything.
    assert sessions.redact_telemetry_for_user(full, "matt") == full
    # Sarah's composite must not carry the analysis or a prompt reference.
    red = sessions.redact_telemetry_for_user(full, "sarah")
    assert red["analysis"] is None and red["has_prompt"] is False
    # Her own learning artifacts survive.
    assert red["recap"] == "r" and red["cost"] == {"x": 1} and red["memory_append"] == "m"
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_sessions_listing.py -k "belongs_to or machine_artifacts or redact_telemetry" -v`
Expected: FAIL — the three helpers are undefined.

- [ ] **Step 3: Implement the three pure helpers + scope all routes**

Add to `sessions.py`:
```python
MATT_ONLY_USER = "matt"


def can_view_machine_artifacts(user_id: str) -> bool:
    """Prompt + analysis + global cost-log are about the MACHINE, not the tester's
    learning. Only Matt may view them. (The prompt embeds the private claim map,
    which reading would spoil the steering the validation gate measures.)"""
    return user_id == MATT_ONLY_USER


def redact_telemetry_for_user(telemetry: dict, user_id: str) -> dict:
    """Strip Matt-only fields from the telemetry composite for non-Matt users so
    the single endpoint can't leak the analysis/prompt through a side door. The
    tester keeps their own learning artifacts (recap, cost, memory_append)."""
    if can_view_machine_artifacts(user_id):
        return telemetry
    redacted = dict(telemetry)
    redacted["analysis"] = None
    redacted["has_prompt"] = False
    return redacted
```
Then in `app.py`:
- Add `user_id: str = Depends(require_user)` to: `list_documents_route`, `upload_document`, `prepare_claims`, `get_artifact`, `get_latest_session`, `list_sessions`, `get_telemetry`, `view_memory`, `view_profile`, `view_cost_log`, `view_prompt`, `view_analysis`.
- Scope calls:
  - `documents.list_documents(user_id)`, `documents.save_upload(user_id, ...)`, `documents.load_document(user_id, doc_id)` everywhere in app.py (including `_lookup_session_doc`, `get_latest_session`).
  - `prepare_claims`: `documents.load_document(user_id, safe_id)`, `claims.load_fresh_claims(user_id, safe_id, text)`, `claims.generate_claims(user_id, ...)` (the `_warm_claims` background task takes `user_id`); the in-flight set key becomes `(user_id, safe_id)`.
  - `sessions.list_study_sessions(user_id)`.
  - `get_latest_session`: filter ledger rows by `user_id` (add the check in the reverse scan).
  - Artifacts/transcripts/analysis reads: build paths under `<user_id>/` — `ARTIFACTS_DIR / user_id / f"{safe_id}.md"`, `TRANSCRIPTS_DIR / user_id / ...`, `session_naming.find_analysis_path(SESSION_ANALYSES_DIR, user_id, safe_id)`.
  - **Ownership check** on session-scoped reads (`get_artifact`, `get_telemetry`, `view_prompt`, `view_analysis`): `if not sessions.session_belongs_to(user_id, safe_id): raise HTTPException(404)` before reading (defense in depth beyond path scoping).
- **Matt-only viewers** — `view_prompt` and `view_analysis` additionally gate: `if not sessions.can_view_machine_artifacts(user_id): raise HTTPException(404)` (placed **before** the ownership check, so a non-Matt user never even reaches their own prompt/analysis). These are machine artifacts, not tester-visible.
- **Telemetry redaction** — `get_telemetry` builds its composite dict as today, then returns `sessions.redact_telemetry_for_user(result, user_id)` so a non-Matt tester's composite carries no `analysis` content and `has_prompt=False`. The tester keeps `recap`, `cost`, `memory_append`, and the document fields (their own learning). Keep the ownership 404 as well.
- **Delete** `app.py`'s duplicate `MEMORY_PATH`/`PROFILE_PATH` (lines 230–231). `view_memory`/`view_profile` call `session_state.load_memory(user_id)` / `load_profile(user_id)` instead — these stay **user-scoped and visible** (transparency about a tester's own data is a feature).
- `view_cost_log`: `if not sessions.can_view_machine_artifacts(user_id): raise HTTPException(404)` before rendering (spec §5.5) — same predicate as prompt/analysis.

- [ ] **Step 4: Run to verify pass + full suite**

Run: `.venv/bin/python -m pytest -q`
Expected: PASS (whole suite). Fix any lingering old-signature calls surfaced here.

- [ ] **Step 5: Commit**

```bash
git add app.py sessions.py tests/test_sessions_listing.py
git commit -m "feat: scope all app.py data routes to user_id; ownership checks; cost-log Matt-only; drop duplicate constants"
```

---

## Task 13: `static/study.html` — hide Matt-only links (cost-log, prompt, analysis) for non-Matt

The page rides the cookie automatically (no client `user_id` needed). Client change: hide the **Matt-only** surfaces — the aggregate cost-log context-link *and* the per-session prompt + analysis diagnostic rows — for non-Matt users, using `/api/whoami` (spec §5.5, §6.3; access-tier principle in Task 12). Server-side redaction (Task 12) already omits `analysis`/`has_prompt` from a non-Matt telemetry response, so the prompt/analysis rows won't populate anyway; this is the belt-and-suspenders client mirror so no Matt-only link ever renders.

**Files:**
- Modify: `static/study.html` (boot block ~line 1438; `renderTelemetry`/diagnostics ~line 1218; `updateContextLinks` ~line 1174)

**Interfaces:**
- Consumes: `GET /api/whoami -> {user_id}` (Task 11).
- Produces: no new interface.

- [ ] **Step 1: Capture identity once at boot into a module flag**

In the boot IIFE (~line 1438), before `loadDocs()`:
```javascript
    // Matt-only surfaces (cost-log, prompt, analysis) are hidden for testers.
    try {
      const me = await fetch('/api/whoami').then(r => r.ok ? r.json() : null);
      window.__isMatt = !!(me && me.user_id === 'matt');
    } catch { window.__isMatt = false; }
    if (!window.__isMatt) {
      // Hide the doc-agnostic cost-log context link. (Confirm the cost-log link's
      // data-base value by grepping study.html — adjust the selector to the actual markup.)
      document.querySelectorAll('.js-context-link[data-base="/view/cost-log"]')
        .forEach(a => { const li = a.closest('li') || a; li.style.display = 'none'; });
    }
```

- [ ] **Step 2: Suppress the prompt + analysis diagnostic rows for non-Matt**

In `renderTelemetry` (~line 1218), guard the prompt and analysis sections so they never render for a tester even if a field slipped through. Find where `diag-prompt` and `diag-analysis` are shown (they're gated on `data.has_prompt` / `data.analysis`) and add `window.__isMatt &&` to those conditions, e.g.:
```javascript
    if (window.__isMatt && data.analysis) { /* show diag-analysis as today */ }
    if (window.__isMatt && data.has_prompt) { /* show diag-prompt as today */ }
```
(Grep `study.html` for `diag-analysis` / `diag-prompt` / `has_prompt` to locate the exact blocks; wrap their show-conditions, leave the tester-visible `diag-cost` / `diag-memory` untouched.)

- [ ] **Step 3: Verify statically (no server restart needed — static file)**

Run: `grep -n "cost-log\|diag-prompt\|diag-analysis\|__isMatt" static/study.html`
Expected: cost-log link, prompt row, and analysis row all gated on `__isMatt`. Manual browser check deferred to Task 15.

- [ ] **Step 4: Commit**

```bash
git add static/study.html
git commit -m "feat: hide Matt-only surfaces (cost-log, prompt, analysis) for non-Matt users via /api/whoami"
```

---

## Task 14: Real-data migration + backfill runner + README

Complete `migrate_identity.py` with the file-move helpers and a `__main__` that runs everything against the real dirs (archive-first, idempotent), and update the session-analyses README (spec §5.4a).

**Files:**
- Modify: `migrate_identity.py` (add move helpers + `__main__`)
- Modify: `~/second-brain/products/voice-tutor/session-analyses/README.md`
- Test: `tests/test_migrate_identity.py`

**Interfaces:**
- Produces:
  - `migrate_identity.plan_moves(root: Path, user_id="matt") -> list[tuple[Path, Path]]` — pure: maps existing flat files under `~/.voice-tutor` to their `<user_id>/` destinations for docs/artifacts/transcripts (and singleton profile.md/memory.md → profiles/matt.md, memory/matt.md). Skips subdirectories (so an already-nested `matt/` is a no-op → idempotent).
  - `migrate_identity.plan_analysis_moves(analyses_dir: Path, user_id="matt") -> list[tuple[Path, Path]]` — pure: maps **only** files whose name matches the `session-analysis-*.md` pattern (covers all legacy generations: date-only, date+timestamp, date+shortid) into `<user_id>/`, **explicitly excluding** `README.md`, `_archive/`, and any subdirectory. The `session-analyses/` folder is NOT a flat dir of only analyses — a naive sweep would move the README and `_archive/` — so it needs this dedicated, pattern-matched helper.
- Consumes: `backfill_ledger_user_id` (Task 3).

- [ ] **Step 1: Write the failing tests for `plan_moves` and `plan_analysis_moves`**

Add to `tests/test_migrate_identity.py`:
```python
def test_plan_moves_maps_flat_files_into_user_dir(tmp_path):
    vt = tmp_path / ".voice-tutor"
    (vt / "documents").mkdir(parents=True)
    (vt / "documents" / "d1.txt").write_text("x")
    (vt / "documents" / "d1-orig.md").write_text("x")
    (vt / "artifacts").mkdir()
    (vt / "artifacts" / "s1.md").write_text("x")
    (vt / "profile.md").write_text("p")
    (vt / "memory.md").write_text("m")

    moves = dict(mig.plan_moves(vt, user_id="matt"))
    assert moves[vt / "documents" / "d1.txt"] == vt / "documents" / "matt" / "d1.txt"
    assert moves[vt / "artifacts" / "s1.md"] == vt / "artifacts" / "matt" / "s1.md"
    assert moves[vt / "profile.md"] == vt / "profiles" / "matt.md"
    assert moves[vt / "memory.md"] == vt / "memory" / "matt.md"
    # Idempotent: already-nested files are not re-planned.
    (vt / "documents" / "matt").mkdir()
    (vt / "documents" / "matt" / "d2.txt").write_text("x")
    moves2 = dict(mig.plan_moves(vt, user_id="matt"))
    assert (vt / "documents" / "matt" / "d2.txt") not in moves2


def test_plan_analysis_moves_only_touches_analysis_files(tmp_path):
    d = tmp_path / "session-analyses"
    d.mkdir()
    # All three legacy generations (per the session-analyses README):
    gen_date = d / "session-analysis-2026-07-20.md"                  # date-only
    gen_ts   = d / "session-analysis-2026-07-25-143005.md"           # date + timestamp
    gen_sid  = d / "session-analysis-2026-07-27-143005-abcd1234.md"  # date + shortid
    for p in (gen_date, gen_ts, gen_sid):
        p.write_text("analysis")
    # Non-analysis siblings that must NOT be swept:
    (d / "README.md").write_text("readme")
    (d / "_archive").mkdir()
    (d / "_archive" / "session-analysis-2026-01-01.md").write_text("old")  # inside a subdir → untouched

    moves = dict(mig.plan_analysis_moves(d, user_id="matt"))
    assert set(moves) == {gen_date, gen_ts, gen_sid}
    assert moves[gen_sid] == d / "matt" / gen_sid.name
    assert (d / "README.md") not in moves
    assert (d / "_archive" / "session-analysis-2026-01-01.md") not in moves
    # Idempotent: files already under matt/ are not re-planned.
    (d / "matt").mkdir(exist_ok=True)
    (d / "matt" / "session-analysis-2026-08-01.md").write_text("new")
    assert (d / "matt" / "session-analysis-2026-08-01.md") not in dict(mig.plan_analysis_moves(d, "matt"))
```

- [ ] **Step 2: Run to verify failure**

Run: `.venv/bin/python -m pytest tests/test_migrate_identity.py -k "plan_moves or plan_analysis_moves" -v`
Expected: FAIL — `plan_moves` / `plan_analysis_moves` undefined.

- [ ] **Step 3: Implement `plan_moves`, `plan_analysis_moves`, move runner + `__main__`**

Add to `migrate_identity.py`:
```python
import re
from pathlib import Path
import shutil

# Matches every legacy analysis filename generation: date-only, date+timestamp,
# date+shortid — all share the "session-analysis-" prefix and ".md" suffix.
_ANALYSIS_NAME_RE = re.compile(r"^session-analysis-.*\.md$")


def plan_moves(root: Path, user_id: str = DEFAULT_USER_ID) -> list[tuple[Path, Path]]:
    uid = Path(user_id).name
    moves: list[tuple[Path, Path]] = []
    # documents/* (txt, summary.txt, <id>-orig, .claims.json) → documents/<uid>/
    # artifacts/* and transcripts/* → <sub>/<uid>/ . is_file() skips the <uid>/
    # subdir on a re-run, so this is idempotent.
    for sub in ("documents", "artifacts", "transcripts"):
        d = root / sub
        if d.exists():
            for p in d.iterdir():
                if p.is_file():
                    moves.append((p, d / uid / p.name))
    if (root / "profile.md").exists():
        moves.append((root / "profile.md", root / "profiles" / f"{uid}.md"))
    if (root / "memory.md").exists():
        moves.append((root / "memory.md", root / "memory" / f"{uid}.md"))
    return moves


def plan_analysis_moves(analyses_dir: Path, user_id: str = DEFAULT_USER_ID) -> list[tuple[Path, Path]]:
    """Move ONLY analysis files into <user_id>/, never README.md, _archive/, or any
    subdirectory. iterdir() is non-recursive, so files already under <uid>/ (or in
    _archive/) are never seen → idempotent and safe."""
    uid = Path(user_id).name
    moves: list[tuple[Path, Path]] = []
    if not analyses_dir.exists():
        return moves
    for p in analyses_dir.iterdir():
        if p.is_file() and _ANALYSIS_NAME_RE.match(p.name):
            moves.append((p, analyses_dir / uid / p.name))
    return moves


def run_moves(moves: list[tuple[Path, Path]]) -> int:
    """Execute planned moves (dest parent created; skip if dest already exists)."""
    done = 0
    for src, dst in moves:
        if dst.exists():
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst))
        done += 1
    return done
```
`__main__` (runs against real paths — **only executed at Task 15 with Matt present**):
1. **Archive first** (copy, never delete): timestamped snapshot into `_archive/` of `~/.voice-tutor` (documents, artifacts, transcripts, profile.md, memory.md) and the vault `session-log.jsonl` + `session-analyses/`.
2. **Backfill the ledger**: read lines → `backfill_ledger_user_id` → write back.
3. **Move files**: `run_moves(plan_moves(VOICE_TUTOR_DIR))` for home state, then `run_moves(plan_analysis_moves(SESSION_ANALYSES_DIR))` for the vault analyses.
4. **Print a summary** (rows backfilled, files moved, analysis files moved). Idempotent — a second run reports 0/0/0.

**Do not run it in this task** — it runs against real data at Task 15 under Matt's eye.

- [ ] **Step 4: Update the session-analyses README**

Edit `~/second-brain/products/voice-tutor/session-analyses/README.md` to document the new layout: analyses now live under `session-analyses/<user_id>/session-analysis-<YYYY-MM-DD-HHMMSS>-<shortid>.md`; the flat scheme was the 2026-07-27 date-first names, now nested per user (2026-07-28). Keep it factual — record, not retro-edit of prior dated notes.

- [ ] **Step 5: Run to verify pass**

Run: `.venv/bin/python -m pytest tests/test_migrate_identity.py -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add migrate_identity.py tests/test_migrate_identity.py
git commit -m "feat: identity migration runner (plan_moves, archive-first, idempotent) + analyses README"
# The README lives in the vault — it auto-syncs; do not git-commit the vault.
```

---

## Task 15: Full-suite green + guided real-data migration + manual verification

Final gate: whole suite green, run the migration against real data (Matt present), then drive the app end-to-end with a real token to confirm isolation.

**Files:** none (verification only). This is the **verification-before-completion** gate.

- [ ] **Step 1: Whole suite green**

Run: `.venv/bin/python -m pytest -q`
Expected: PASS, no skips beyond the pre-existing environment-gated ones.

- [ ] **Step 2: Seed a token registry + run the migration (Matt present)**

Create the registry (single-line, Matt runs it):
```bash
echo '{"matt-dev-token":"matt","sarah-token":"sarah"}' > ~/.voice-tutor/tokens.json
```
Dry-run then execute the migration:
```bash
.venv/bin/python migrate_identity.py
```
Expected: prints archive location, rows-backfilled count, files-moved count. Re-run once → reports 0 moves, 0 backfills (idempotent). Confirm `~/.voice-tutor/documents/matt/`, `artifacts/matt/`, `transcripts/matt/`, `profiles/matt.md`, `memory/matt.md`, and vault `session-analyses/matt/` exist and the originals are archived.

- [ ] **Step 3: Boot and verify identity gate**

Run `./start.sh`; wait for `INFO: Application startup complete`. Then:
- Open `http://localhost:7860/study/` with **no cookie** → the **paste-your-code gate** renders (not the picker). Fail-closed confirmed.
- Open `http://localhost:7860/study/?u=matt-dev-token` → redirects to `/study/`, sets cookie, picker shows **only Matt's** docs. `GET /api/whoami` → `{"user_id":"matt"}`.

- [ ] **Step 4: Mirror-image cross-user check (the acceptance criterion)**

- In a fresh private window, open `/study/?u=sarah-token` → picker is **empty** (demo docs deferred; Sarah has no uploads). History empty. "View last session" → 404/empty.
- Upload a doc as Sarah, run a short study session (set `VOICE_TUTOR_MIN_TELEMETRY_SEC=30` in `.env` for a fast recap if desired), end it.
- Back as Matt (original window): Sarah's doc and session are **absent** from Matt's picker/history. Directly requesting Sarah's session id at `/api/sessions/<sid>/telemetry` while holding Matt's cookie → **404**.
- Confirm the cost-log link is **hidden** for Sarah and **visible** for Matt.

- [ ] **Step 5: Confirm hash continuity against a live post-migration row**

After Matt's first post-migration study session, check the new `session-log.jsonl` row carries `user_id: "matt"` and a `prompt_hash` equal to one of the Task 1 pinned literals (flag state depending on `VOICE_TUTOR_SESSION_OPENING`).

- [ ] **Step 6: Final commit / summary**

```bash
git add -A
git status   # confirm only intended files; tokens.json is in ~ (never in repo)
git commit -m "chore: identity + isolation build complete (verification passed)"
```
Report the verification evidence (gate renders, mirror-image empty, cross-user 404, hash literal match) back to Matt.

---

## Self-Review

**Spec coverage** — every spec section maps to a task:
- §3 inventory (enumeration, session-scoped, session-start, write surfaces) → Tasks 4–9 (helpers), 11–12 (routes), 10 (pipeline).
- §4 ledger `user_id` + backfill → Task 3 (helper), Task 14/15 (runner).
- §5.1 profile/memory migration → Task 6 + Task 14.
- §5.2 documents + claims namespace → Tasks 7, 8, 14.
- §5.3 pipeline learns user_id (offer stamping, fail closed) → Tasks 10, 11.
- §5.4 artifacts/transcripts/analyses per-user + **reversal** + README + session_naming care → Tasks 5, 9, 10, 14.
- §5.5 cost-log Matt-only + hide link → Tasks 12, 13.
- **Post-spec access-tier decision (2026-07-28):** prompt + analysis viewers are Matt-only (machine artifacts; the prompt embeds the claim map), telemetry composite redacts them for non-Matt, memory/profile stay tester-visible → Task 12 (`can_view_machine_artifacts`, `redact_telemetry_for_user`, viewer 404s), Task 13 (client hide of cost-log/prompt/analysis).
- §6.1 required-arg signatures → Tasks 4–10 (each).
- §6.2 token registry + cookie + read order + gate → Tasks 2, 11.
- §7 code contradictions (latest leak, duplicate constants, claims dir, regular mode, prompt.txt path) → Tasks 12 (latest, duplicates), 8 (claims), 6/10 (regular mode transcript block), 10 (prompt.txt path).
- §8.0 hash pin → Task 1 + Task 10 guard.
- §8.1 mirror-image tests → every helper task (4–9) + Task 15 live check.

**Placeholder scan:** no "TBD"/"add error handling"/"similar to Task N" — each task carries real code. A few spots intentionally defer to the executor to *read* the current markup: the `study.html` cost-log / `diag-prompt` / `diag-analysis` selectors (Task 13, grep-confirmed) and the `_seed_session`/`_make_doc`/`_seed_fresh_sidecar` test helpers (Tasks 4/8/12, extend-or-add against the file's existing pattern). These are localized and instructed, not hand-waves.

**Type consistency:** `user_id: str` is the first argument uniformly. `list_study_sessions(user_id)`, `previous_session_recap(user_id, document_id, exclude_session_id)`, `load_document(user_id, doc_id)`, `load_fresh_claims(user_id, doc_id, text)`, `find_analysis_path(directory, user_id, session_id)`, `build_system_instruction(user_id, study=None)`, `resolve_cookie(cookie_value)`, `session_belongs_to(user_id, session_id)`, `can_view_machine_artifacts(user_id)`, `redact_telemetry_for_user(telemetry, user_id)`, `plan_moves(root, user_id)`, `plan_analysis_moves(analyses_dir, user_id)` — names match across producing and consuming tasks. (Fixed a self-inconsistency during review: Task 12's ownership predicate is `sessions.session_belongs_to`, not the earlier draft's `app._session_owner`.)
