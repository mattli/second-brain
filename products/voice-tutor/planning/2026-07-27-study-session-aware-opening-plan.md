# Study Mode Session-Aware Opening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the study tutor a plan at the top of each session — orient-then-propose on a first session, recap-then-offer-the-choice on a returning session — instead of a blank-slate greeting.

**Architecture:** A new Pipecat-free module (`study_history.py`) loads the *newest* prior session's recap for a document from the cost-log ledger + artifacts dir. `bot.py` injects that recap into the study prompt as a "Where you left off" block, adds an "Opening the session" behavior section to a new study base constant, and swaps the study kickoff message. All behavior is gated behind `VOICE_TUTOR_SESSION_OPENING` (default ON); flag-off is byte-identical to today and preserves the historical `static_prompt_hash`.

**Tech Stack:** Python 3.12, pytest, existing hermetic-fixture conventions (`monkeypatch` of module-level path constants; `imported_bot` pipecat-stub fixture). No new dependencies.

**Spec:** `products/voice-tutor/planning/2026-07-27-study-session-aware-opening-design.md` (read it first).

## Global Constraints

- **Pure modules stay Pipecat-free.** `study_history.py` imports only stdlib. Module-level path constants (`COST_LOG_JSONL_PATH`, `ARTIFACTS_DIR`) are read at **call time**, never bound into locals at import, so tests can `monkeypatch.setattr` them (mirrors `sessions.py`/`documents.py`).
- **No route/TestClient tests.** `app.py` imports pipecat at module top. Test pure helpers directly and `bot.build_system_instruction`/`bot.static_prompt_hash` via the `imported_bot` fixture. `bot()`'s `on_client_connected` glue stays untested at the transport layer.
- **Flag default ON.** `VOICE_TUTOR_SESSION_OPENING` unset/empty → ON. Disable spellings (case-insensitive): `0`, `false`, `no`, `off`, `disable`, `disabled`. Mirror the exact idiom at `bot.py:81-82`.
- **Flag-off must be byte-identical to current behavior**, including `static_prompt_hash(study=True)` equal to today's value: `sha256(STUDY_BASE_INSTRUCTION + BREVITY_REMINDER + STUDY_REMINDER)` with the kickoff **excluded**. The kickoff term is folded into the hash **only when the flag is on**.
- **Claim-map position is load-bearing.** It stays after the document and before both reminders; `tests/test_study_claim_steering.py` must stay green.
- **"Where you left off" block is injected immediately before the `## Document:` block** (after profile/memory when present).
- **Newest-only, no walk-back.** Only the single newest prior study session is considered; missing artifact → `None`, never an older session's recap.
- **Recap-parse fallback truncates at 1000 characters.**
- **Returning path shows the recap alone — no overview.** The one-breath overview fires on the first-session path only.
- **Filenames lowercase kebab-case.**

---

## File Structure

- **Create `study_history.py`** — pure module: `parse_recap_sections(text)` and `previous_session_recap(document_id, exclude_session_id)`. One responsibility: "the newest prior session's recap for this document, parsed, or nothing."
- **Create `tests/test_study_history.py`** — hermetic tests for the new module.
- **Create `tests/test_study_opening.py`** — tests for the flag, kickoff selection, base selection, "Where you left off" injection + position, and hash continuity.
- **Modify `tests/conftest.py`** — add a `study_history_tmp` fixture (redirect the new module's two path constants to tmp).
- **Modify `bot.py`** — add flag + kickoff constants + `kickoff_message()`; add `STUDY_BASE_INSTRUCTION_WITH_OPENING` + `_previously_block()`; gate base selection and block injection in `build_system_instruction`; conditionally fold the kickoff into `static_prompt_hash`; wire the recap fetch + kickoff selection into `bot()`.

Interfaces (locked across tasks):

```
# study_history.py
parse_recap_sections(text: str) -> dict
    # {"covered": list[str], "open_threads": list[str]}  OR  {"fallback_text": str}
previous_session_recap(document_id: str, exclude_session_id: str | None) -> dict | None

# bot.py
SESSION_OPENING: bool                       # module constant, read at call time
DEFAULT_KICKOFF_MESSAGE: str
STUDY_KICKOFF_MESSAGE: str
kickoff_message(study: bool) -> str
STUDY_BASE_INSTRUCTION_WITH_OPENING: str
_previously_block(previously: dict) -> str
build_system_instruction(study: dict | None = None) -> str   # honors study["previously"]
static_prompt_hash(study: bool) -> str
```

---

## Task 1: Recap section parser (`parse_recap_sections`)

**Files:**
- Create: `study_history.py`
- Test: `tests/test_study_history.py`

**Interfaces:**
- Produces: `parse_recap_sections(text: str) -> dict` — either `{"covered": [...], "open_threads": [...]}` (parsed shape) or `{"fallback_text": str}` (fallback shape, mutually exclusive). Fallback text is `text[:1000]`.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_study_history.py
import study_history as sh

_RECAP = """# Study session — Graph Engineering
Duration: 22:46

## What we covered
- What a graph is: nodes and edges
- The fake-edge test

## Key points
### Nodes
Long essay that must NOT appear in the parsed result.

## Open threads
- How to resolve hidden edges
- The verification architecture section
"""


def test_parses_covered_and_open_threads():
    out = sh.parse_recap_sections(_RECAP)
    assert out == {
        "covered": ["What a graph is: nodes and edges", "The fake-edge test"],
        "open_threads": [
            "How to resolve hidden edges",
            "The verification architecture section",
        ],
    }
    assert "fallback_text" not in out


def test_open_threads_optional_empty_list_when_absent():
    text = "## What we covered\n- Only this\n\n## Key points\nblah\n"
    out = sh.parse_recap_sections(text)
    assert out == {"covered": ["Only this"], "open_threads": []}


def test_unparseable_returns_truncated_fallback():
    text = "x" * 5000  # no headers at all
    out = sh.parse_recap_sections(text)
    assert out == {"fallback_text": "x" * 1000}
    assert "covered" not in out
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_study_history.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'study_history'`.

- [ ] **Step 3: Write the module with the parser**

```python
# study_history.py
"""Pure, Pipecat-free helper: the newest prior study session's recap for a
document, parsed into a compact shape for the session-opening prompt.

Module-level path constants are read at CALL time (not bound at import) so tests
can monkeypatch them to per-test tmp paths — mirroring documents.DOCUMENTS_DIR /
sessions.COST_LOG_JSONL_PATH.
"""

import json
from pathlib import Path

COST_LOG_JSONL_PATH = (
    Path.home() / "second-brain" / "products" / "voice-tutor" / "validation" / "cost-log.jsonl"
)
ARTIFACTS_DIR = Path.home() / ".voice-tutor" / "artifacts"

_FALLBACK_MAX_CHARS = 1000


def _section_bullets(text: str, header: str) -> list[str]:
    """Bullet lines under a `## <header>` section, up to the next `## ` header."""
    lines = text.splitlines()
    out: list[str] = []
    in_section = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("## "):
            in_section = stripped[3:].strip().lower() == header.lower()
            continue
        if in_section and (stripped.startswith("- ") or stripped.startswith("* ")):
            out.append(stripped[2:].strip())
    return out


def parse_recap_sections(text: str) -> dict:
    """Parsed shape {"covered", "open_threads"} if a non-empty 'What we covered'
    section is found; else the fallback shape {"fallback_text": text[:1000]}."""
    covered = _section_bullets(text, "What we covered")
    if not covered:
        return {"fallback_text": text[:_FALLBACK_MAX_CHARS]}
    open_threads = _section_bullets(text, "Open threads")
    return {"covered": covered, "open_threads": open_threads}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `.venv/bin/python -m pytest tests/test_study_history.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add study_history.py tests/test_study_history.py
git commit -m "feat: recap section parser for session-aware opening"
```

---

## Task 2: Newest-prior-recap lookup (`previous_session_recap`)

**Files:**
- Modify: `study_history.py`
- Modify: `tests/conftest.py` (add `study_history_tmp` fixture)
- Test: `tests/test_study_history.py`

**Interfaces:**
- Consumes: `parse_recap_sections` (Task 1).
- Produces: `previous_session_recap(document_id, exclude_session_id) -> dict | None`.

- [ ] **Step 1: Add the hermetic fixture**

```python
# tests/conftest.py  (append near cost_log_tmp)
@pytest.fixture
def study_history_tmp(tmp_path, monkeypatch):
    """Redirect study_history's ledger + artifacts constants to per-test tmp.

    study_history reads COST_LOG_JSONL_PATH / ARTIFACTS_DIR at call time, so
    patching the module attributes is the real resolution path. Guards the real
    vault cost-log and ~/.voice-tutor artifacts dir against mutation.
    """
    import study_history as sh

    real_ledger = sh.COST_LOG_JSONL_PATH
    real_artifacts = sh.ARTIFACTS_DIR
    before_ledger = _file_state(real_ledger)
    before_artifacts = _snapshot(real_artifacts)

    ledger = tmp_path / "cost-log.jsonl"
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(sh, "COST_LOG_JSONL_PATH", ledger)
    monkeypatch.setattr(sh, "ARTIFACTS_DIR", artifacts)

    yield ledger, artifacts

    assert _file_state(real_ledger) == before_ledger, "production cost-log.jsonl mutated"
    assert _snapshot(real_artifacts) == before_artifacts, "production artifacts dir mutated"
```

- [ ] **Step 2: Write the failing tests**

```python
# tests/test_study_history.py  (append)
import json

import study_history as sh

_RECAP_TEXT = (
    "# Study session — Doc\n\n## What we covered\n- Alpha\n- Beta\n\n"
    "## Open threads\n- Gamma\n"
)


def _row(session_id, document_id, session_start, mode="study", kind="session"):
    return json.dumps({
        "kind": kind, "mode": mode, "session_id": session_id,
        "document_id": document_id, "session_start": session_start,
    })


def _seed(ledger, artifacts, rows, recaps):
    ledger.write_text("\n".join(rows) + "\n")
    for sid, text in recaps.items():
        (artifacts / f"{sid}.md").write_text(text)


def test_returns_newest_prior_recap_parsed(study_history_tmp):
    ledger, artifacts = study_history_tmp
    _seed(
        ledger, artifacts,
        rows=[
            _row("s-old", "doc-1", "2026-07-20T10:00:00"),
            _row("s-new", "doc-1", "2026-07-25T10:00:00"),
        ],
        recaps={"s-old": "OLD", "s-new": _RECAP_TEXT},
    )
    out = sh.previous_session_recap("doc-1", exclude_session_id="s-current")
    assert out == {"covered": ["Alpha", "Beta"], "open_threads": ["Gamma"]}


def test_first_session_returns_none(study_history_tmp):
    ledger, artifacts = study_history_tmp
    _seed(ledger, artifacts, rows=[_row("s-other", "doc-OTHER", "2026-07-25T10:00:00")],
          recaps={"s-other": _RECAP_TEXT})
    assert sh.previous_session_recap("doc-1", exclude_session_id="s-current") is None


def test_newest_missing_artifact_returns_none_no_walkback(study_history_tmp):
    ledger, artifacts = study_history_tmp
    # Newest (s-new) has NO artifact; older (s-old) DOES. Must NOT walk back.
    _seed(
        ledger, artifacts,
        rows=[
            _row("s-old", "doc-1", "2026-07-20T10:00:00"),
            _row("s-new", "doc-1", "2026-07-25T10:00:00"),
        ],
        recaps={"s-old": _RECAP_TEXT},  # only the OLD one has a recap
    )
    assert sh.previous_session_recap("doc-1", exclude_session_id="s-current") is None


def test_excludes_current_session(study_history_tmp):
    ledger, artifacts = study_history_tmp
    _seed(ledger, artifacts, rows=[_row("s-current", "doc-1", "2026-07-25T10:00:00")],
          recaps={"s-current": _RECAP_TEXT})
    assert sh.previous_session_recap("doc-1", exclude_session_id="s-current") is None


def test_ignores_non_session_and_non_study_rows(study_history_tmp):
    ledger, artifacts = study_history_tmp
    _seed(
        ledger, artifacts,
        rows=[
            _row("s-art", "doc-1", "2026-07-26T10:00:00", kind="artifact"),
            _row("s-open", "doc-1", "2026-07-26T09:00:00", mode="open"),
            _row("s-real", "doc-1", "2026-07-24T10:00:00"),
        ],
        recaps={"s-art": "X", "s-open": "Y", "s-real": _RECAP_TEXT},
    )
    out = sh.previous_session_recap("doc-1", exclude_session_id="s-current")
    assert out == {"covered": ["Alpha", "Beta"], "open_threads": ["Gamma"]}
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_study_history.py -k previous_session -v`
Expected: FAIL — `AttributeError: module 'study_history' has no attribute 'previous_session_recap'`.

- [ ] **Step 4: Implement `previous_session_recap`**

```python
# study_history.py  (append)
def previous_session_recap(document_id, exclude_session_id):
    """The newest prior study session's parsed recap for ``document_id``, or None.

    Newest-only, no walk-back: if the single newest qualifying session has no
    recap artifact, return None rather than an older session's recap. A stale
    "last time we covered X" is worse than no recap.
    """
    path = COST_LOG_JSONL_PATH
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
    artifact = ARTIFACTS_DIR / f"{best_sid}.md"
    if not artifact.exists():
        return None  # newest-only: do not walk back to an older recap
    return parse_recap_sections(artifact.read_text())
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `.venv/bin/python -m pytest tests/test_study_history.py -v`
Expected: PASS (all).

- [ ] **Step 6: Commit**

```bash
git add study_history.py tests/test_study_history.py tests/conftest.py
git commit -m "feat: newest-prior-recap lookup (no walk-back)"
```

---

## Task 3: Feature flag + kickoff constants + `kickoff_message()`

**Files:**
- Modify: `bot.py` (flag near `bot.py:81`; kickoff constants + helper near `STUDY_BASE_INSTRUCTION`, ~`bot.py:289`)
- Test: `tests/test_study_opening.py`

**Interfaces:**
- Produces: `SESSION_OPENING: bool`, `DEFAULT_KICKOFF_MESSAGE`, `STUDY_KICKOFF_MESSAGE`, `kickoff_message(study: bool) -> str`.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_study_opening.py
def test_kickoff_default_for_regular_mode(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    assert imported_bot.kickoff_message(study=False) == imported_bot.DEFAULT_KICKOFF_MESSAGE


def test_kickoff_study_uses_study_message_when_flag_on(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    assert imported_bot.kickoff_message(study=True) == imported_bot.STUDY_KICKOFF_MESSAGE


def test_kickoff_study_falls_back_when_flag_off(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", False)
    assert imported_bot.kickoff_message(study=True) == imported_bot.DEFAULT_KICKOFF_MESSAGE


def test_default_kickoff_is_unchanged_string(imported_bot):
    assert imported_bot.DEFAULT_KICKOFF_MESSAGE == "Say hello and introduce yourself briefly."
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -v`
Expected: FAIL — `AttributeError: module 'bot' has no attribute 'kickoff_message'` (or `DEFAULT_KICKOFF_MESSAGE`).

- [ ] **Step 3: Add the flag (near `bot.py:82`, beside `USAGE_DEDUP`)**

```python
# Session-aware opening. ON by default: the study tutor opens with a plan
# (orient + propose on a first session; recap + offer the choice on a return).
# To revert to the legacy blank-slate greeting with NO rebuild, set
# VOICE_TUTOR_SESSION_OPENING to any of these (case-insensitive): 0, false, no,
# off, disable, disabled. ANY OTHER value — including empty/unset — leaves it ON.
_SESSION_OPENING_DISABLE_VALUES = ("0", "false", "no", "off", "disable", "disabled")
SESSION_OPENING = (
    os.getenv("VOICE_TUTOR_SESSION_OPENING", "").strip().lower()
    not in _SESSION_OPENING_DISABLE_VALUES
)
```

- [ ] **Step 4: Add kickoff constants + helper (just after `STUDY_BASE_INSTRUCTION`, ~`bot.py:289`)**

```python
# Hidden first-turn trigger. The default produces a generic greeting; the study
# variant (flag ON) triggers the "Opening the session" behavior in the study base.
DEFAULT_KICKOFF_MESSAGE = "Say hello and introduce yourself briefly."
STUDY_KICKOFF_MESSAGE = (
    "Begin the study session now. Open by orienting the user per your "
    '"Opening the session" instructions — do not just say a generic hello.'
)


def kickoff_message(study: bool) -> str:
    """The hidden opening turn. Study + flag ON → the plan-triggering message;
    otherwise the legacy greeting (regular mode, or study with the flag off)."""
    if study and SESSION_OPENING:
        return STUDY_KICKOFF_MESSAGE
    return DEFAULT_KICKOFF_MESSAGE
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -v`
Expected: PASS (4 passed).

- [ ] **Step 6: Commit**

```bash
git add bot.py tests/test_study_opening.py
git commit -m "feat: VOICE_TUTOR_SESSION_OPENING flag + kickoff selection"
```

---

## Task 4: Study base with the "Opening the session" section

**Files:**
- Modify: `bot.py` (add `STUDY_BASE_INSTRUCTION_WITH_OPENING` after `STUDY_BASE_INSTRUCTION`; select it in `build_system_instruction`, ~`bot.py:507`)
- Test: `tests/test_study_opening.py`

**Interfaces:**
- Consumes: `SESSION_OPENING` (Task 3).
- Produces: `STUDY_BASE_INSTRUCTION_WITH_OPENING`; `build_system_instruction` selects the base by flag.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_study_opening.py  (append)
_DOC = {"doc_title": "Graph Engineering", "doc_text": "Graphs are nodes and edges."}


def test_opening_section_present_when_flag_on(imported_bot, session_state_tmp, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    prompt = imported_bot.build_system_instruction(study={**_DOC})
    assert "## Opening the session" in prompt


def test_opening_section_absent_when_flag_off(imported_bot, session_state_tmp, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", False)
    prompt = imported_bot.build_system_instruction(study={**_DOC})
    assert "## Opening the session" not in prompt
    # Flag-off uses the original base verbatim.
    assert prompt.startswith(imported_bot.STUDY_BASE_INSTRUCTION)


def test_flag_off_base_is_the_original_constant(imported_bot):
    # The legacy constant must remain byte-identical (hash continuity depends on it).
    assert imported_bot.STUDY_BASE_INSTRUCTION.startswith("You are a study companion")


def test_with_opening_is_derived_from_the_shipped_base(imported_bot):
    # The passive opener line is present in the original and REMOVED in the derived
    # constant; the opening section is added. This proves WITH_OPENING is exactly
    # one change off the shipped base (no freehand drift), so the first flag-on
    # hash reflects precisely the opening change.
    original = imported_bot.STUDY_BASE_INSTRUCTION
    derived = imported_bot.STUDY_BASE_INSTRUCTION_WITH_OPENING
    assert imported_bot._PASSIVE_OPENER_LINE in original
    assert imported_bot._PASSIVE_OPENER_LINE not in derived
    assert "## Opening the session" in derived
    assert derived != original  # a no-op replace would be a silent bug
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -k opening_section -v`
Expected: FAIL — `## Opening the session` not found (constant + selection not yet added).

- [ ] **Step 3: Add the derived base constant (immediately after `STUDY_BASE_INSTRUCTION`)**

Keep `STUDY_BASE_INSTRUCTION` **unchanged** (flag-off + hash continuity depend on it). Do **NOT** write `WITH_OPENING` as a freehand literal — **derive** it from the shipped constant with a single `.replace()`, so the diff is provably just the opening change and the first flag-on hash reflects exactly one edit. A module-level `assert` makes a failed replace break import loudly instead of silently shipping an identical string.

`_PASSIVE_OPENER_LINE` must be copied **verbatim** from the current `bot.py` base (the assembled string, after implicit literal concatenation — verify by eye against `bot.py:268-289`, note the em dash `—`). `_OPENING_SECTION` rewors the same sentence without the passive opener and appends the new section. This is the shippable first wording (tuned by ear later, one change per hash — see spec §6).

```python
# The passive opener the session-aware behavior replaces. Copied VERBATIM from
# STUDY_BASE_INSTRUCTION above — if that string is reworded, update this too or
# the module-level assert below will fire at import.
_PASSIVE_OPENER_LINE = (
    "Help them engage actively — ask what they want to focus on, explain "
    "concepts when asked, surface connections, push back when their "
    "understanding is shaky, and let them lead the direction."
)

# Replacement: the same engagement sentence minus the passive opener, then the
# new "## Opening the session" section (first wording; tune by ear post-ship).
_OPENING_SECTION = (
    "Help them engage actively — explain concepts when asked, surface "
    "connections, push back when their understanding is shaky, and let them "
    "lead the direction once the session is underway.\n\n"
    "## Opening the session\n"
    "Do NOT open with a generic greeting or an open-ended \"what do you want "
    "to focus on?\". Open with orientation, in one short spoken turn:\n"
    "- If there is NO \"Where you left off\" section below, this is a first "
    "session. Give a one-breath, high-level lay-of-the-land of what this "
    "document covers (two to four beats, synthesized from the document and "
    "your private claim map — never recite the map), then propose starting "
    "with the foundations and building up, then invite them to redirect "
    "(\"…sound good, or is there something specific you want to start "
    "with?\").\n"
    "- If the user declines your proposed starting point, offer two or three "
    "concrete alternative areas drawn from the claim map — the map is your "
    "menu — rather than asking an open-ended question.\n"
    "- If there IS a \"Where you left off\" section below, this is a returning "
    "session. Briefly recap what was covered last time and what was left "
    "open, then ask whether they want to pick up where they left off or "
    "revisit something first — and let them choose. Do not push a next step.\n"
    "Keep the opening to a few sentences — this is voice — then follow their "
    "lead."
)

STUDY_BASE_INSTRUCTION_WITH_OPENING = STUDY_BASE_INSTRUCTION.replace(
    _PASSIVE_OPENER_LINE, _OPENING_SECTION
)
assert STUDY_BASE_INSTRUCTION_WITH_OPENING != STUDY_BASE_INSTRUCTION, (
    "_PASSIVE_OPENER_LINE did not match STUDY_BASE_INSTRUCTION — the opening "
    "section was not injected. Re-copy the line verbatim from the base."
)
```

- [ ] **Step 4: Select the base by flag in `build_system_instruction` (`bot.py:506-507`)**

Replace `parts = [STUDY_BASE_INSTRUCTION]` in the `study is not None` branch with:

```python
    if study is not None:
        base = STUDY_BASE_INSTRUCTION_WITH_OPENING if SESSION_OPENING else STUDY_BASE_INSTRUCTION
        parts = [base]
```

(Reference the module global `SESSION_OPENING` by name at call time — do not bind it into a default argument — so `monkeypatch.setattr(bot, "SESSION_OPENING", ...)` takes effect.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -v`
Expected: PASS. Also run the pinned claim-steering suite — it must stay green:
Run: `.venv/bin/python -m pytest tests/test_study_claim_steering.py -v`
Expected: PASS (claim map still after document, before reminders).

- [ ] **Step 6: Commit**

```bash
git add bot.py tests/test_study_opening.py
git commit -m "feat: opening-the-session behavior in study base (flag-gated)"
```

---

## Task 5: "Where you left off" block injection

**Files:**
- Modify: `bot.py` (add `_previously_block`; inject in `build_system_instruction` before `## Document:`, ~`bot.py:516`)
- Test: `tests/test_study_opening.py`

**Interfaces:**
- Consumes: `SESSION_OPENING`; the `previously` shapes from `parse_recap_sections` (Task 1).
- Produces: `_previously_block(previously: dict) -> str`; `build_system_instruction` injects it when `SESSION_OPENING and study.get("previously")`.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_study_opening.py  (append)
_PREV_PARSED = {"covered": ["Nodes and edges", "The diamond pattern"],
                "open_threads": ["Verification architecture"]}
_PREV_FALLBACK = {"fallback_text": "Some recap prose that could not be parsed."}


def test_previously_block_before_document_and_before_claim_map(imported_bot, session_state_tmp, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    prompt = imported_bot.build_system_instruction(
        study={**_DOC, "claims": ["Claim one."], "previously": _PREV_PARSED}
    )
    prev_pos = prompt.index("# Where you left off on this document")
    doc_pos = prompt.index("## Document: Graph Engineering")
    map_pos = prompt.index("## Claim map")
    brevity_pos = prompt.index("# Reminder")
    # Position contract: previously < document < claim map < reminders.
    assert prev_pos < doc_pos < map_pos < brevity_pos
    assert "Nodes and edges" in prompt
    assert "Verification architecture" in prompt


def test_previously_block_renders_fallback_text(imported_bot, session_state_tmp, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    prompt = imported_bot.build_system_instruction(study={**_DOC, "previously": _PREV_FALLBACK})
    assert "# Where you left off on this document" in prompt
    assert "Some recap prose that could not be parsed." in prompt


def test_no_previously_block_when_absent_or_none(imported_bot, session_state_tmp, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    for study in ({**_DOC}, {**_DOC, "previously": None}):
        prompt = imported_bot.build_system_instruction(study=study)
        assert "# Where you left off" not in prompt


def test_no_previously_block_when_flag_off(imported_bot, session_state_tmp, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", False)
    prompt = imported_bot.build_system_instruction(study={**_DOC, "previously": _PREV_PARSED})
    assert "# Where you left off" not in prompt
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -k previously -v`
Expected: FAIL — `# Where you left off` not found.

- [ ] **Step 3: Add `_previously_block` (near the other prompt helpers, e.g. after `_claim_map_block`)**

```python
def _previously_block(previously: dict) -> str:
    """Render the prior-session recap for the returning-session opener. Accepts
    either shape from study_history.parse_recap_sections: the parsed
    {"covered", "open_threads"} or the {"fallback_text"} fallback."""
    header = "\n# Where you left off on this document\n"
    guide = (
        "\n(This is a returning session. Use this to recap briefly and offer to "
        "continue or revisit — see \"Opening the session\". Never read it verbatim.)"
    )
    if "fallback_text" in previously:
        return f"{header}\nRecap of the previous session:\n\n{previously['fallback_text']}\n{guide}"

    lines = [header, "\nIn the previous session you covered:"]
    for item in previously.get("covered", []):
        lines.append(f"- {item}")
    open_threads = previously.get("open_threads", [])
    if open_threads:
        lines.append("\nLeft open:")
        for item in open_threads:
            lines.append(f"- {item}")
    lines.append(guide)
    return "\n".join(lines)
```

- [ ] **Step 4: Inject it in `build_system_instruction` (immediately before the `## Document:` append, `bot.py:516`)**

```python
        # ... after the optional profile and memory blocks ...
        previously = study.get("previously") if SESSION_OPENING else None
        if previously:
            parts.append(_previously_block(previously))
        parts.append(f"\n## Document: {study['doc_title']}\n\n{study['doc_text']}")
        # ... claim map append stays exactly as-is (after the document) ...
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py tests/test_study_claim_steering.py -v`
Expected: PASS (claim-map position unchanged; previously-block sits before the document).

- [ ] **Step 6: Commit**

```bash
git add bot.py tests/test_study_opening.py
git commit -m "feat: inject 'Where you left off' recap block before the document"
```

---

## Task 6: Conditional kickoff fold into `static_prompt_hash`

**Files:**
- Modify: `bot.py` (`static_prompt_hash`, `bot.py:547-562`)
- Test: `tests/test_study_opening.py`

**Interfaces:**
- Consumes: `SESSION_OPENING`, `STUDY_BASE_INSTRUCTION_WITH_OPENING`, `STUDY_KICKOFF_MESSAGE`.
- Produces: flag-aware `static_prompt_hash(study)`.

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_study_opening.py  (append)
import hashlib

# Captured from `main` BEFORE any code change — `bot.static_prompt_hash(study=True)`
# on the current tree — and cross-checked against the prompt_hash of real study
# rows in cost-log.jsonl (both 2026-07-26 sessions carry this exact value). Pinned
# as a LITERAL, not recomputed from the constants: an accidental byte change to
# STUDY_BASE_INSTRUCTION/BREVITY/STUDY reminders must break this test loudly rather
# than silently breaking continuity with every historical ledger row.
PRE_CHANGE_STUDY_HASH = "4b937a122fd6b7a5297061be1d853e03833214a66de18491af667cbf13b5a3b0"


def test_flag_off_study_hash_equals_pre_change_value(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", False)
    # Equality against the LITERAL is the continuity guard (not a recomputation).
    assert imported_bot.static_prompt_hash(study=True) == PRE_CHANGE_STUDY_HASH


def test_flag_on_study_hash_differs_and_includes_kickoff(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    on_expected = hashlib.sha256(
        (imported_bot.STUDY_BASE_INSTRUCTION_WITH_OPENING
         + imported_bot.BREVITY_REMINDER
         + imported_bot.STUDY_REMINDER
         + imported_bot.STUDY_KICKOFF_MESSAGE).encode("utf-8")
    ).hexdigest()
    got = imported_bot.static_prompt_hash(study=True)
    assert got == on_expected               # flag-on folds in the new base + kickoff
    assert got != PRE_CHANGE_STUDY_HASH      # and is distinct from the historical hash


def test_regular_mode_hash_unaffected_by_flag(imported_bot, monkeypatch):
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", True)
    on = imported_bot.static_prompt_hash(study=False)
    monkeypatch.setattr(imported_bot, "SESSION_OPENING", False)
    off = imported_bot.static_prompt_hash(study=False)
    assert on == off  # non-study mode is untouched by session-opening
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -k hash -v`
Expected: FAIL — flag-on hash currently equals the flag-off value (kickoff not folded, new base not used).

- [ ] **Step 3: Update `static_prompt_hash` (study branch only, `bot.py:558-559`)**

```python
    if study:
        if SESSION_OPENING:
            static = (
                STUDY_BASE_INSTRUCTION_WITH_OPENING
                + BREVITY_REMINDER
                + STUDY_REMINDER
                + STUDY_KICKOFF_MESSAGE
            )
        else:
            # Byte-identical to the pre-change input — preserves the historical
            # hash for flag-off sessions. Do NOT add the kickoff here.
            static = STUDY_BASE_INSTRUCTION + BREVITY_REMINDER + STUDY_REMINDER
    else:
        static = BASE_INSTRUCTION + (WIKI_TAGLINE if WIKI_ENABLED else "") + BREVITY_REMINDER
    return hashlib.sha256(static.encode("utf-8")).hexdigest()
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `.venv/bin/python -m pytest tests/test_study_opening.py -v`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add bot.py tests/test_study_opening.py
git commit -m "feat: fold study kickoff into prompt hash only when flag on"
```

---

## Task 7: Wire the recap fetch + kickoff into `bot()`

**Files:**
- Modify: `bot.py` (import `study_history`; set `study_arg["previously"]` ~`bot.py:607`; use `kickoff_message` at `bot.py:821`)
- Verify: full test suite + a manual live check (no new unit test — transport-layer glue per repo convention)

**Interfaces:**
- Consumes: `study_history.previous_session_recap`, `kickoff_message`, `SESSION_OPENING`.

- [ ] **Step 1: Add the import (with the other pure-module imports near the top of `bot.py`)**

```python
import study_history
```

- [ ] **Step 2: Fetch the prior recap into `study_arg` (in the `if study_meta:` block that builds `study_arg`, ~`bot.py:600-611`)**

```python
        previously = None
        if SESSION_OPENING:
            previously = study_history.previous_session_recap(
                study_meta["document_id"], study_meta["session_id"]
            )
        study_arg = {
            "doc_title": study_meta["doc_title"],
            "doc_text": study_meta["doc_text"],
            "claims": claim_texts,
            "previously": previously,
        }
```

- [ ] **Step 3: Use `kickoff_message` for the opening turn (`bot.py:820-821`)**

```python
    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        context.add_message({
            "role": "user",
            "content": kickoff_message(study=study_meta is not None),
        })
        await task.queue_frames([LLMRunFrame()])
```

- [ ] **Step 4: Run the full test suite (no import breakage, everything green)**

Run: `.venv/bin/python -m pytest -q`
Expected: PASS (all suites, including `test_study_history`, `test_study_opening`, `test_study_claim_steering`).

- [ ] **Step 5: Manual live verification (flag on, real server)**

Restart the server (Python change): `./start.sh`, wait for `INFO: Application startup complete`.
- **First-session check:** pick a document you have no prior session on, start `/study/`. Expected: the tutor opens with a one-breath overview + proposes starting with the basics + invites redirect (not "say hello").
- **Returning-session check:** after that session ends and its recap artifact lands (`~/.voice-tutor/artifacts/<session_id>.md`), start a new session on the same document. Expected: the tutor recaps last time and offers to continue or revisit.
- **Revert check:** `VOICE_TUTOR_SESSION_OPENING=off ./start.sh` → the tutor reverts to the old brief greeting; confirm a study session's `prompt_hash` in `cost-log.jsonl` matches a pre-change study row's hash.

- [ ] **Step 6: Commit**

```bash
git add bot.py
git commit -m "feat: wire session-aware opening into study session start"
```

---

## Self-Review (completed against the spec)

- **Spec coverage:** §3.1 → Tasks 1–2; §3.2 → Task 5; §3.3 → Task 4; §3.4 → Tasks 3 + 7; §3.5 → Task 6; §3.6 → Task 3 (+ enforced in Tasks 4/6). §2.1/§2.2 behavior lives in the Task 4 prompt wording; §2.3 presence-based detection is realized by Task 5's block + Task 4's opener text.
- **Newest-only / no walk-back:** pinned by `test_newest_missing_artifact_returns_none_no_walkback`.
- **Hash continuity:** pinned by `test_flag_off_study_hash_equals_pre_change_value`.
- **Claim-map position:** re-verified in Task 5 tests + existing `test_study_claim_steering.py`.
- **Fallback 1000 chars / shape:** `test_unparseable_returns_truncated_fallback`, `test_previously_block_renders_fallback_text`.
- **Flag semantics:** off → old base, no block, no kickoff swap, historical hash (Tasks 3–6 tests).
- **Placeholder scan:** none — every step carries real code.
- **Type consistency:** `previously` shapes (`covered`/`open_threads` | `fallback_text`) are consistent across `parse_recap_sections`, `_previously_block`, and their tests; `kickoff_message(study: bool)` and `static_prompt_hash(study: bool)` signatures match call sites.

## Out of scope (from the spec, verbatim)

Cross-session claim-coverage tracking, retention-check openers, and multi-session synthesis are deliberately not in this change. The recap is the coverage memory.
