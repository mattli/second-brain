# Study Companion Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a document-grounded "study companion" mode to voice-tutor — upload a doc, voice-chat about it, hang up via UI button, get a markdown recap on disk.

**Architecture:** Move HTTP server ownership from `pipecat.runner.run.main()` into our own `app.py` so we can add custom routes. Voice pipeline (`bot.py`) gains a study-mode branch that swaps the system prompt and disables tools when an offer carries `document_id`. New `/study/` static page provides upload + connect + end-session UI. Artifact generation runs as a fire-and-forget `asyncio.create_task` after the session ends.

**Tech Stack:** FastAPI, uvicorn, pipecat (existing), `pypdf` (new), Anthropic SDK (existing), vanilla HTML/JS for `/study/`. Python 3.12, `uv` for deps.

**Spec:** `~/second-brain/products/voice-tutor/planning/2026-04-26-study-companion-mode-design.md`

**Repo:** `/Users/mattli/development/voice-tutor`

**Note on TDD:** This is a personal prototype; per Matt's guidance there are no automated tests. Each task ends with a manual verification command and a commit. The bite-size discipline still applies — keep steps to 2–5 minutes of work each.

---

## File Map

**New files (in voice-tutor repo):**
- `app.py` — FastAPI app, owns the HTTP surface
- `documents.py` — upload/extract/list helpers (kept separate from `bot.py` to keep `bot.py` focused on the pipeline)
- `static/study.html` — single-page study UI

**Modified files:**
- `bot.py` — add study-mode branching in `build_system_instruction()`, study-mode body parsing, `generate_artifact()`, JSONL `kind` field
- `pyproject.toml` — add `pypdf` and `python-multipart`
- `start.sh` — `uvicorn app:app` instead of `python bot.py`
- `README.md` — `## Study companion mode` subsection + status line

**Touched data dirs (created on demand):**
- `~/.voice-tutor/documents/`
- `~/.voice-tutor/artifacts/`

---

## Task 1: Skeleton `app.py` replacing pipecat's runner

**Files:**
- Modify: `pyproject.toml`
- Create: `app.py`
- Modify: `start.sh`

- [ ] **Step 1.1: Add deps to `pyproject.toml`**

Edit `/Users/mattli/development/voice-tutor/pyproject.toml`. Replace the `dependencies` block:

```toml
dependencies = [
    "pipecat-ai[anthropic,deepgram,cartesia,silero,webrtc,runner]",
    "pipecat-ai-small-webrtc-prebuilt",
    "python-dotenv",
    "fastapi",
    "uvicorn[standard]",
    "python-multipart",
    "pypdf",
]
```

`fastapi` and `uvicorn` are pulled in transitively by pipecat today, but we now depend on them directly — pin them explicitly so a future pipecat refactor doesn't drop them.

- [ ] **Step 1.2: Sync deps**

Run from the repo root:

```bash
cd /Users/mattli/development/voice-tutor && uv sync
```

Expected: clean resolve, no errors. New packages in `.venv`: `pypdf`, `python-multipart` (the others already present).

- [ ] **Step 1.3: Create `app.py` with the WebRTC offer flow**

Create `/Users/mattli/development/voice-tutor/app.py`:

```python
"""FastAPI app for voice-tutor.

Owns the HTTP surface so we can add study-mode routes alongside the WebRTC
offer flow. Replaces pipecat.runner.run.main — that helper hides the FastAPI
app inside its CLI entry point with no extension hook, so we replicate the
~30 lines of WebRTC plumbing it would have set up.

The voice pipeline lives in bot.py; this module only handles HTTP.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pipecat.runner.types import SmallWebRTCRunnerArguments
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.request_handler import (
    IceCandidate,
    SmallWebRTCPatchRequest,
    SmallWebRTCRequest,
    SmallWebRTCRequestHandler,
)
from pipecat_ai_small_webrtc_prebuilt.frontend import SmallWebRTCPrebuiltUI

import bot

HOST = os.getenv("VOICE_TUTOR_HOST", "0.0.0.0")
small_webrtc_handler = SmallWebRTCRequestHandler(esp32_mode=False, host=HOST)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await small_webrtc_handler.close()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing voice-tutor entry point — unchanged behavior.
app.mount("/client", SmallWebRTCPrebuiltUI)


@app.post("/api/offer")
async def offer(request: SmallWebRTCRequest, background_tasks: BackgroundTasks):
    async def webrtc_connection_callback(connection: SmallWebRTCConnection):
        runner_args = SmallWebRTCRunnerArguments(
            webrtc_connection=connection,
            body=request.request_data,
        )
        background_tasks.add_task(bot.bot, runner_args)

    return await small_webrtc_handler.handle_web_request(
        request=request,
        webrtc_connection_callback=webrtc_connection_callback,
    )


@app.patch("/api/offer")
async def ice_candidate(request: SmallWebRTCPatchRequest):
    await small_webrtc_handler.handle_patch_request(request)
    return {"status": "success"}
```

- [ ] **Step 1.4: Verify `pipecat.runner.types` exposes `SmallWebRTCRunnerArguments`**

Pipecat's public surface for the runner-args type matters; if the import path differs, the offer route will 500 at request time.

```bash
cd /Users/mattli/development/voice-tutor && uv run python -c "from pipecat.runner.types import SmallWebRTCRunnerArguments; print('ok')"
```

Expected: `ok`. If `ImportError`, the type lives at `pipecat.runner.run.SmallWebRTCRunnerArguments` (re-exported there per `dir()` output we already saw); update the import in `app.py` to:

```python
from pipecat.runner.run import SmallWebRTCRunnerArguments
```

- [ ] **Step 1.5: Rewrite `start.sh` to launch via uvicorn**

Replace `/Users/mattli/development/voice-tutor/start.sh` with:

```bash
#!/bin/bash
set -e

cd "$(dirname "$0")"

# Clear any prior bot still bound to port 7860
lsof -ti :7860 | xargs kill -9 2>/dev/null || true

# Source .env for API keys
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Check required keys
for key in ANTHROPIC_API_KEY DEEPGRAM_API_KEY CARTESIA_API_KEY; do
    if [ -z "${!key}" ]; then
        echo "Error: $key is not set. Add it to .env"
        exit 1
    fi
done

exec uv run uvicorn app:app --host 0.0.0.0 --port 7860 "$@"
```

`exec uv run uvicorn` ensures signals propagate cleanly. The `"$@"` lets future args (e.g. `--reload`) pass through.

- [ ] **Step 1.6: Smoke-test the existing `/client/` flow**

```bash
cd /Users/mattli/development/voice-tutor && ./start.sh > voice-tutor.log 2>&1 &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:7860/client/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:7860/
lsof -ti :7860 | xargs kill -9
```

Expected: `200` for `/client/`, `307` (redirect) or `404` for `/` (we removed pipecat's root redirect — that's fine; we'll leave `/` unhandled for v1).

Then open `http://localhost:7860/client/` in a browser, click Connect, say "hello, can you hear me?", click Disconnect. Confirm:
- Bot responds in voice (existing behavior intact)
- A new transcript file appears in `~/.voice-tutor/transcripts/`
- Bot log shows the cost summary line

- [ ] **Step 1.7: Commit**

```bash
cd /Users/mattli/development/voice-tutor && git add pyproject.toml uv.lock app.py start.sh && git commit -m "$(cat <<'EOF'
Move HTTP server into app.py; replicate pipecat's WebRTC offer routes

Sets up the foundation for study-mode-specific routes (upload, artifact)
that pipecat.runner.run.main() doesn't expose hooks for.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Document upload + listing

**Files:**
- Create: `documents.py`
- Modify: `app.py`

- [ ] **Step 2.1: Create `documents.py`**

Create `/Users/mattli/development/voice-tutor/documents.py`:

```python
"""Document storage and text extraction for study-mode sessions.

No DB. Doc list is computed at request time from ~/.voice-tutor/documents/*.txt
(extracted text), with the original file kept alongside under
<uuid>-<original-filename> for provenance.
"""

import io
import re
import uuid
from datetime import datetime
from pathlib import Path

from pypdf import PdfReader

DOCUMENTS_DIR = Path.home() / ".voice-tutor" / "documents"
MAX_DOC_CHARS = 150_000
MAX_UPLOAD_BYTES = 5_000_000
ALLOWED_EXTS = {".pdf", ".md", ".txt", ".markdown"}


class UploadError(Exception):
    """Raised for user-correctable upload problems (wrong type, too big, etc.)."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _extract_text(filename: str, raw: bytes) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        reader = PdfReader(io.BytesIO(raw))
        text = "\n\n".join((page.extract_text() or "") for page in reader.pages)
    else:
        text = raw.decode("utf-8", errors="replace")
    # Collapse runs of blank lines; trim.
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def _derive_title(text: str, filename: str) -> str:
    for line in text.splitlines():
        line = line.strip().lstrip("#").strip()
        if line:
            return line[:120]
    return filename


def save_upload(filename: str, raw: bytes) -> dict:
    """Validate, extract, and persist a document. Returns metadata."""
    if len(raw) > MAX_UPLOAD_BYTES:
        raise UploadError(413, f"file too large (max {MAX_UPLOAD_BYTES} bytes)")
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise UploadError(415, f"unsupported file type: {ext or '(none)'}")

    text = _extract_text(filename, raw)
    if len(text) > MAX_DOC_CHARS:
        raise UploadError(
            413,
            f"extracted text too long ({len(text)} chars, max {MAX_DOC_CHARS})",
        )
    if not text:
        raise UploadError(422, "could not extract any text from this file")

    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    doc_id = str(uuid.uuid4())
    safe_name = Path(filename).name  # strip any path components
    (DOCUMENTS_DIR / f"{doc_id}-{safe_name}").write_bytes(raw)
    (DOCUMENTS_DIR / f"{doc_id}.txt").write_text(text)

    return {
        "document_id": doc_id,
        "title": _derive_title(text, safe_name),
        "char_count": len(text),
    }


def list_documents() -> list[dict]:
    if not DOCUMENTS_DIR.exists():
        return []
    docs = []
    for txt_path in sorted(DOCUMENTS_DIR.glob("*.txt")):
        doc_id = txt_path.stem
        text = txt_path.read_text()
        # Find the matching original (any extension) for the upload time.
        originals = [p for p in DOCUMENTS_DIR.glob(f"{doc_id}-*") if p != txt_path]
        original = originals[0] if originals else txt_path
        docs.append({
            "document_id": doc_id,
            "title": _derive_title(text, original.name),
            "char_count": len(text),
            "uploaded_at": datetime.fromtimestamp(original.stat().st_mtime).isoformat(),
        })
    docs.sort(key=lambda d: d["uploaded_at"], reverse=True)
    return docs


def load_document(doc_id: str) -> tuple[str, str] | None:
    """Return (title, text) or None if not found."""
    txt_path = DOCUMENTS_DIR / f"{doc_id}.txt"
    if not txt_path.exists():
        return None
    text = txt_path.read_text()
    originals = [p for p in DOCUMENTS_DIR.glob(f"{doc_id}-*") if p != txt_path]
    original_name = originals[0].name if originals else f"{doc_id}.txt"
    return _derive_title(text, original_name), text
```

- [ ] **Step 2.2: Wire upload + listing routes into `app.py`**

Add to `app.py` (after the PATCH `/api/offer` handler):

```python
from fastapi import HTTPException, UploadFile

import documents


@app.post("/api/documents")
async def upload_document(file: UploadFile):
    try:
        raw = await file.read()
        return documents.save_upload(file.filename or "untitled", raw)
    except documents.UploadError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@app.get("/api/documents")
async def list_documents_route():
    return documents.list_documents()
```

Move the `from fastapi import ...` line at the top of `app.py` to also include `HTTPException, UploadFile` — keep imports tidy.

- [ ] **Step 2.3: Verify upload + listing**

Make a tiny test markdown:

```bash
mkdir -p /tmp/voice-tutor-plan && cat > /tmp/voice-tutor-plan/sample.md <<'EOF'
# Test Document

This is a sample doc for verifying the upload path.

## Section A
Some content here.
EOF
```

Restart the server, then:

```bash
cd /Users/mattli/development/voice-tutor && ./start.sh > voice-tutor.log 2>&1 &
sleep 3

# Upload
curl -s -F "file=@/tmp/voice-tutor-plan/sample.md" http://localhost:7860/api/documents

# List
curl -s http://localhost:7860/api/documents | python -m json.tool

# Reject unsupported type
curl -s -o /dev/null -w "%{http_code}\n" -F "file=@/tmp/voice-tutor-plan/sample.md;filename=sample.docx" http://localhost:7860/api/documents

lsof -ti :7860 | xargs kill -9
```

Expected:
- POST returns `{"document_id": "...", "title": "Test Document", "char_count": <small>}`
- GET returns a single-element list with the same doc
- The reject case returns `415`
- `~/.voice-tutor/documents/` contains `<uuid>-sample.md` and `<uuid>.txt`

- [ ] **Step 2.4: Commit**

```bash
cd /Users/mattli/development/voice-tutor && git add app.py documents.py && git commit -m "$(cat <<'EOF'
Add document upload + listing endpoints for study mode

POST /api/documents accepts PDF/MD/TXT under 5MB; extracts text via pypdf
for PDFs; rejects oversized output (>150K chars). GET /api/documents lists
docs derived from the filesystem — no index file to keep in sync.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Study system prompt + artifact prompt

**Files:**
- Modify: `bot.py`

- [ ] **Step 3.1: Add study-mode constants to `bot.py`**

In `bot.py`, after the existing `ANALYSIS_PROMPT` block (around line 209), add:

```python
STUDY_BASE_INSTRUCTION = (
    "You are a study companion helping the user understand a specific document "
    "they have loaded. Help them engage actively — ask what they want to focus "
    "on, explain concepts when asked, surface connections, push back when their "
    "understanding is shaky, and let them lead the direction.\n\n"
    "Reference the document directly. Quote short passages when useful. Don't "
    "summarize the whole thing unprompted — wait for the user to point at what "
    "they want to dig into.\n\n"
    "Keep responses tight. One thought at a time. This is voice — long monologues "
    "don't work."
)

ARTIFACT_PROMPT = """\
You are writing a markdown recap of a voice-mode study session about a specific \
document. Output ONLY markdown — no preamble, no trailing prose.

Use this structure exactly:

# Study session — {doc_title}
Duration: {duration_mmss}

## What we covered
- short bullets, one per topic discussed

## Key points
### <topic>
Substantive notes — paraphrase both sides, capture concrete claims, quote the \
document where it sharpens the point. Two to four short paragraphs per topic.

## Open threads
Things raised but not resolved — questions to come back to. One bullet each. \
Skip this section if there are none.

### Document
{doc_text}

### Transcript
{transcript_json}
"""
```

- [ ] **Step 3.2: Branch `build_system_instruction()` for study mode**

Replace the existing `build_system_instruction()` (currently around `bot.py:354–375`) with:

```python
def build_system_instruction(study: dict | None = None) -> str:
    """Assemble the system prompt.

    Regular mode: base + profile + wiki INDEX + memory + most-recent transcript.
    Study mode (study={doc_title, doc_text}): base + profile + the doc itself.
    Study mode skips memory, the most-recent transcript, the wiki INDEX, and the
    wiki tagline — the doc is the world for that session.
    """
    profile = load_profile()

    if study is not None:
        parts = [STUDY_BASE_INSTRUCTION]
        if profile:
            parts.append(f"\n## About the person you're talking to\n\n{profile}")
        parts.append(f"\n## Document: {study['doc_title']}\n\n{study['doc_text']}")
        return "\n".join(parts)

    base = BASE_INSTRUCTION + (WIKI_TAGLINE if WIKI_ENABLED else "")
    parts = [base]

    if profile:
        parts.append(f"\n## About the person you're talking to\n\n{profile}")

    if WIKI_ENABLED:
        wiki_block = wiki.system_prompt_block()
        if wiki_block:
            parts.append(wiki_block)

    memory = load_memory()
    if memory:
        parts.append(f"\n# What we've discussed\n\n{memory}")

    most_recent = load_most_recent_transcript_block()
    if most_recent:
        parts.append(f"\n# Most recent session\n\n{most_recent}")

    return "\n".join(parts)
```

- [ ] **Step 3.3: Verify the prompt assembles in both modes**

```bash
cd /Users/mattli/development/voice-tutor && uv run python -c "
import bot
regular = bot.build_system_instruction()
study = bot.build_system_instruction(study={'doc_title': 'TEST DOC', 'doc_text': 'BODY GOES HERE'})
print(f'regular: {len(regular)} chars; contains memory? {\"What we\" in regular}; contains wiki? {\"wiki\" in regular.lower()}')
print(f'study:   {len(study)} chars; contains memory? {\"What we\" in study}; contains wiki? {\"knowledge wiki\" in study}; contains doc body? {\"BODY GOES HERE\" in study}')
"
```

Expected:
- regular has memory/wiki blocks (assuming they exist in `~/.voice-tutor/`)
- study has neither, but does contain `BODY GOES HERE`
- study is significantly smaller (no wiki INDEX, no memory.md)

- [ ] **Step 3.4: Commit**

```bash
cd /Users/mattli/development/voice-tutor && git add bot.py && git commit -m "$(cat <<'EOF'
Add STUDY_BASE_INSTRUCTION and ARTIFACT_PROMPT; branch system prompt on study mode

Study-mode prompt drops the wiki INDEX, memory.md, and the most-recent
transcript — the doc itself is the world for that session. Profile.md still
loads (the tutor still knows who they're talking to).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Offer-body wiring (`document_id` and `session_id`)

**Files:**
- Modify: `bot.py`

`app.py` already passes `request.request_data` straight through to `runner_args.body` (Task 1.3). No changes needed there. All wiring this task is in `bot.py`.

- [ ] **Step 4.1: Read study fields from `runner_args.body` in `bot()`**

In `bot.py`, near the top of the `async def bot(runner_args):` body (currently `bot.py:378`), after the `transport = ...` block and before the `system_instruction = build_system_instruction()` line, insert:

```python
    body = getattr(runner_args, "body", None) or {}
    document_id = body.get("document_id")
    session_id_override = body.get("session_id")

    study_meta: dict | None = None
    if document_id:
        loaded = documents.load_document(document_id)
        if loaded is None:
            print(f"[bot] document_id={document_id} not found; falling back to regular mode", file=sys.stderr, flush=True)
        else:
            doc_title, doc_text = loaded
            study_meta = {
                "document_id": document_id,
                "doc_title": doc_title,
                "doc_text": doc_text,
                "session_id": session_id_override or document_id,  # graceful fallback if client omits it
            }
```

Add `import documents` near the other imports at the top of `bot.py`.

- [ ] **Step 4.2: Use study-mode prompt and disable tools in study mode**

Replace the line:

```python
    system_instruction = build_system_instruction()
```

with:

```python
    system_instruction = build_system_instruction(
        study={"doc_title": study_meta["doc_title"], "doc_text": study_meta["doc_text"]}
        if study_meta else None
    )
```

Then, further down, replace:

```python
    tools = [wiki.tool_schema()] if WIKI_ENABLED else []
```

with:

```python
    tools = [] if study_meta else ([wiki.tool_schema()] if WIKI_ENABLED else [])
```

And replace:

```python
    if WIKI_ENABLED:
        llm.register_function("read_wiki_page", wiki.make_tool_handler(usage.mark_tool_call))
```

with:

```python
    if WIKI_ENABLED and not study_meta:
        llm.register_function("read_wiki_page", wiki.make_tool_handler(usage.mark_tool_call))
```

- [ ] **Step 4.3: Use `session_id` as transcript stem in study mode**

In `save_transcript()` (currently `bot.py:458`), replace:

```python
        stem = session_start.strftime("%Y-%m-%d-%H%M%S")
```

with:

```python
        stem = study_meta["session_id"] if study_meta else session_start.strftime("%Y-%m-%d-%H%M%S")
```

`save_transcript` is a closure over `study_meta`, so this just works.

- [ ] **Step 4.4: Tag the JSONL row with `kind: "session"`**

In the `jsonl_entry = {...}` dict at the bottom of `save_transcript()` (`bot.py` around line 549), add `"kind": "session"` as the first key:

```python
        jsonl_entry = {
            "kind": "session",
            "session_id": session_start.strftime("%Y-%m-%dT%H%M%S"),
            ...rest unchanged...
        }
```

For study sessions, also overwrite the `session_id` field to use the study session UUID so the artifact row (Task 6) lines up:

```python
        if study_meta:
            jsonl_entry["session_id"] = study_meta["session_id"]
            jsonl_entry["mode"] = "study"
            jsonl_entry["document_id"] = study_meta["document_id"]
```

Place this block right before the `with COST_LOG_JSONL_PATH.open("a") as f:` line.

- [ ] **Step 4.5: Smoke-test offer-body wiring without the UI**

We need a doc on disk first. If Task 2.3 left one, reuse it; otherwise upload one again per Task 2.3.

```bash
cd /Users/mattli/development/voice-tutor && ./start.sh > voice-tutor.log 2>&1 &
sleep 3
DOC_ID=$(curl -s -F "file=@/tmp/voice-tutor-plan/sample.md" http://localhost:7860/api/documents | python -c "import sys,json; print(json.load(sys.stdin)['document_id'])")
echo "doc_id: $DOC_ID"
```

Open `http://localhost:7860/client/` in a browser, **but before clicking Connect**, open DevTools → Network. Click Connect. Find the `POST /api/offer` request. The `request_data` field will be empty (the prebuilt UI doesn't set it) — that's OK, we're verifying the regular path still works.

Then disconnect, kill the server, and inspect `voice-tutor.log` — you should NOT see "[bot] document_id=" (because the prebuilt UI doesn't send one). Regular mode behavior preserved.

For now, manually inject `document_id` to test study-mode plumbing without the UI: edit `app.py` temporarily — OR — use a Python REPL:

```bash
cd /Users/mattli/development/voice-tutor && uv run python -c "
import documents, bot
loaded = documents.load_document('$DOC_ID')
assert loaded is not None
title, text = loaded
prompt = bot.build_system_instruction(study={'doc_title': title, 'doc_text': text})
assert 'STUDY_BASE_INSTRUCTION' not in prompt  # the constant name should not leak
assert 'study companion' in prompt.lower()
assert title in prompt
assert 'sample.md' in prompt or 'Test Document' in prompt
assert 'wiki' not in prompt.lower()
assert 'What we\'ve discussed' not in prompt
print(f'study prompt OK ({len(prompt)} chars)')
"
```

Expected: `study prompt OK (<n> chars)`. No assertion errors.

```bash
lsof -ti :7860 | xargs kill -9 2>/dev/null || true
```

- [ ] **Step 4.6: Commit**

```bash
cd /Users/mattli/development/voice-tutor && git add bot.py && git commit -m "$(cat <<'EOF'
Wire offer-body to study mode in bot.py

Reads document_id + session_id from runner_args.body, loads doc text,
swaps system prompt, disables tools, uses session_id as the transcript
stem. Tag JSONL rows with kind/mode/document_id so the artifact row
(coming next) can be associated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `/study/` static page

**Files:**
- Create: `static/study.html`
- Modify: `app.py`

- [ ] **Step 5.1: Create `static/study.html`**

```bash
mkdir -p /Users/mattli/development/voice-tutor/static
```

Create `/Users/mattli/development/voice-tutor/static/study.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Voice Tutor — Study</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
  h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
  .muted { color: #666; }
  .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; cursor: pointer; }
  .card.selected { border-color: #2a6df4; background: #eef4ff; }
  .card.selected::before { content: "✓ "; color: #2a6df4; }
  button { font-size: 1rem; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #2a6df4; background: #2a6df4; color: #fff; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  button.secondary { background: #fff; color: #2a6df4; }
  .hidden { display: none; }
  pre { white-space: pre-wrap; background: #f5f5f5; padding: 1rem; border-radius: 6px; }
  .row { display: flex; gap: 0.75rem; align-items: center; margin: 0.75rem 0; }
</style>
</head>
<body>

<h1>Voice Tutor — Study</h1>
<p class="muted">Pick a document or upload one, then start a voice session grounded in it.</p>

<section id="picker">
  <h2 style="font-size:1rem;">Documents</h2>
  <div id="docList" class="muted">Loading…</div>
  <form id="uploadForm" class="row">
    <input type="file" id="fileInput" accept=".pdf,.md,.markdown,.txt" required />
    <button type="submit" class="secondary">Upload</button>
  </form>
  <div class="row">
    <button id="startBtn" disabled>Start session</button>
    <span id="pickerStatus" class="muted"></span>
  </div>
</section>

<section id="session" class="hidden">
  <p>Session about: <strong id="sessionDocTitle"></strong></p>
  <audio id="remoteAudio" autoplay playsinline></audio>
  <div class="row">
    <button id="endBtn">End session</button>
    <span id="sessionStatus" class="muted">Connecting…</span>
  </div>
</section>

<section id="ended" class="hidden">
  <p>Session ended. Recap will be saved to <code>~/.voice-tutor/artifacts/<span id="endedSessionId"></span>.md</code> shortly.</p>
  <div class="row">
    <button id="refreshBtn" class="secondary">Refresh</button>
    <button id="newBtn" class="secondary">New session</button>
  </div>
  <pre id="artifactView" class="hidden"></pre>
</section>

<script>
const $ = id => document.getElementById(id);
const show = id => { ['picker','session','ended'].forEach(s => $(s).classList.toggle('hidden', s !== id)); };

let selectedDocId = null;
let selectedDocTitle = null;
let pc = null;
let pcId = null;
let sessionId = null;

async function loadDocs() {
  const docs = await fetch('/api/documents').then(r => r.json());
  const list = $('docList');
  if (!docs.length) { list.textContent = 'No documents yet — upload one to start.'; return; }
  list.innerHTML = '';
  for (const d of docs) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = d.document_id;
    card.innerHTML = `<strong>${escapeHtml(d.title)}</strong><br><span class="muted">${d.char_count.toLocaleString()} chars · ${d.uploaded_at.slice(0,16)}</span>`;
    card.onclick = () => selectDoc(d.document_id, d.title, card);
    list.appendChild(card);
  }
}

function selectDoc(id, title, cardEl) {
  selectedDocId = id;
  selectedDocTitle = title;
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  $('startBtn').disabled = false;
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

$('uploadForm').onsubmit = async e => {
  e.preventDefault();
  const file = $('fileInput').files[0];
  if (!file) return;
  $('pickerStatus').textContent = 'Uploading…';
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/documents', { method: 'POST', body: fd });
  if (!r.ok) {
    $('pickerStatus').textContent = 'Upload failed: ' + (await r.text());
    return;
  }
  $('pickerStatus').textContent = 'Uploaded.';
  $('fileInput').value = '';
  await loadDocs();
};

$('startBtn').onclick = async () => {
  if (!selectedDocId) return;
  sessionId = crypto.randomUUID();
  $('sessionDocTitle').textContent = selectedDocTitle;
  show('session');
  $('sessionStatus').textContent = 'Connecting…';
  await connect();
};

async function connect() {
  pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  pc.addTransceiver('audio', { direction: 'sendrecv' });
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const t of stream.getTracks()) pc.addTrack(t, stream);
  pc.ontrack = ev => { $('remoteAudio').srcObject = ev.streams[0]; };
  pc.onconnectionstatechange = () => { $('sessionStatus').textContent = 'State: ' + pc.connectionState; };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const resp = await fetch('/api/offer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sdp: offer.sdp,
      type: offer.type,
      request_data: { document_id: selectedDocId, session_id: sessionId },
    }),
  });
  const answer = await resp.json();
  pcId = answer.pc_id;
  await pc.setRemoteDescription(answer);

  pc.onicecandidate = async ev => {
    if (!ev.candidate) return;
    await fetch('/api/offer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pc_id: pcId, candidates: [ev.candidate.toJSON()] }),
    });
  };
}

$('endBtn').onclick = () => {
  if (pc) pc.close();
  $('endedSessionId').textContent = sessionId;
  show('ended');
};

$('refreshBtn').onclick = async () => {
  const r = await fetch(`/api/sessions/${sessionId}/artifact`);
  const view = $('artifactView');
  if (r.ok) {
    view.textContent = await r.text();
    view.classList.remove('hidden');
  } else {
    view.textContent = '(not ready yet — try again in a few seconds)';
    view.classList.remove('hidden');
  }
};

$('newBtn').onclick = () => {
  selectedDocId = null;
  selectedDocTitle = null;
  $('startBtn').disabled = true;
  $('artifactView').classList.add('hidden');
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
  show('picker');
  loadDocs();
};

loadDocs();
</script>

</body>
</html>
```

- [ ] **Step 5.2: Serve `study.html` from `app.py`**

Add to `app.py` (after the document routes, before any closing constructs):

```python
from fastapi.responses import FileResponse

STUDY_HTML = Path(__file__).parent / "static" / "study.html"


@app.get("/study/", include_in_schema=False)
@app.get("/study", include_in_schema=False)
async def study_page():
    return FileResponse(STUDY_HTML, media_type="text/html")
```

Add `from pathlib import Path` to the existing imports if not already present (Task 1.3 imports it).

- [ ] **Step 5.3: End-to-end smoke test**

```bash
cd /Users/mattli/development/voice-tutor && ./start.sh > voice-tutor.log 2>&1 &
sleep 3
```

Open `http://localhost:7860/study/`. You should see the document picker with the doc(s) uploaded earlier. Pick one, click "Start session", grant mic permission, say "what's this document about?", listen for a response, click "End session".

After 5–10s of waiting (artifact-gen is Task 6, not yet wired — for now we're verifying that the transcript and the session_id stem work):

```bash
ls -la ~/.voice-tutor/transcripts/ | head
```

Expected: a new `<uuid>.json` (study session) and `<uuid>.usage.json` exist. Open the JSON; the transcript should reference the doc; the system prompt was study-mode (verify in `voice-tutor.log` if you added a debug print, otherwise trust the assertions from Task 4.5).

Also confirm in `voice-tutor.log` that there's no `[wiki-tool]` activity for that session.

```bash
lsof -ti :7860 | xargs kill -9 2>/dev/null || true
```

- [ ] **Step 5.4: Commit**

```bash
cd /Users/mattli/development/voice-tutor && git add static/study.html app.py && git commit -m "$(cat <<'EOF'
Add /study/ page — single-file picker → session → ended UI

Vanilla HTML/JS, no framework. WebRTC offer flow injects document_id and
a client-generated session_id into the offer body's request_data, which
the bot reads via runner_args.body.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Artifact generation + retrieval

**Files:**
- Modify: `bot.py`
- Modify: `app.py`

- [ ] **Step 6.1: Add `ARTIFACTS_DIR` and `generate_artifact()` to `bot.py`**

Near the top of `bot.py`, alongside the existing `VOICE_TUTOR_DIR`/`TRANSCRIPTS_DIR`/etc constants (around `bot.py:160`):

```python
ARTIFACTS_DIR = VOICE_TUTOR_DIR / "artifacts"
```

Add `import asyncio` at the top of the imports if not already present.

After `generate_session_analysis(...)` (around `bot.py:351`), add:

```python
async def generate_artifact(session_id: str, study_meta: dict, transcript: dict, duration_sec: float):
    """Fire-and-forget Haiku call writing ~/.voice-tutor/artifacts/<session_id>.md.

    Writes a separate row to cost-log.jsonl with kind="artifact" so the cost is
    auditable without retroactively patching the synchronous session row.
    """
    duration_mmss = f"{int(duration_sec // 60)}:{int(duration_sec % 60):02d}"
    prompt = ARTIFACT_PROMPT.format(
        doc_title=study_meta["doc_title"],
        doc_text=study_meta["doc_text"],
        duration_mmss=duration_mmss,
        transcript_json=json.dumps(transcript, indent=2),
    )
    try:
        client = anthropic.Anthropic()
        resp = await asyncio.to_thread(
            client.messages.create,
            model="claude-haiku-4-5-20251001",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        markdown = resp.content[0].text
    except Exception as e:
        print(f"[artifact] failed for session_id={session_id}: {e}", file=sys.stderr, flush=True)
        return

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = ARTIFACTS_DIR / f"{session_id}.md"
    out_path.write_text(markdown)
    print(f"[artifact] wrote {out_path}", file=sys.stderr, flush=True)

    # Append a separate cost-log.jsonl row for this artifact-gen call.
    in_tok = resp.usage.input_tokens
    out_tok = resp.usage.output_tokens
    cost = (
        in_tok / 1_000_000 * PRICE_ANTHROPIC_HAIKU_INPUT_PER_MTOK
        + out_tok / 1_000_000 * PRICE_ANTHROPIC_HAIKU_OUTPUT_PER_MTOK
    )
    row = {
        "kind": "artifact",
        "session_id": session_id,
        "document_id": study_meta["document_id"],
        "input_tokens": in_tok,
        "output_tokens": out_tok,
        "cost_usd": round(cost, 4),
    }
    COST_LOG_JSONL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with COST_LOG_JSONL_PATH.open("a") as f:
        f.write(json.dumps(row) + "\n")
```

- [ ] **Step 6.2: Schedule `generate_artifact` from `save_transcript()`**

At the very end of `save_transcript()` (after the `with COST_LOG_JSONL_PATH.open("a") as f: ... write(...)` block, around `bot.py:573`), add:

```python
        if study_meta:
            asyncio.create_task(generate_artifact(
                session_id=study_meta["session_id"],
                study_meta=study_meta,
                transcript=transcript,
                duration_sec=summary["session_duration_sec"],
            ))
```

This runs because `save_transcript()` is invoked from the async `on_client_disconnected` handler — there's a running event loop, so `asyncio.create_task` is valid. The task outlives `bot()`; it lives in the FastAPI app's loop until completion.

- [ ] **Step 6.3: Add the artifact GET endpoint to `app.py`**

In `app.py`, after the document routes:

```python
ARTIFACTS_DIR = Path.home() / ".voice-tutor" / "artifacts"


@app.get("/api/sessions/{session_id}/artifact")
async def get_artifact(session_id: str):
    safe_id = Path(session_id).name  # belt and suspenders against path traversal
    path = ARTIFACTS_DIR / f"{safe_id}.md"
    if not path.exists():
        raise HTTPException(status_code=404, detail="artifact not ready or not found")
    return FileResponse(path, media_type="text/markdown")
```

- [ ] **Step 6.4: Full end-to-end smoke test**

```bash
cd /Users/mattli/development/voice-tutor && ./start.sh > voice-tutor.log 2>&1 &
sleep 3
```

Open `http://localhost:7860/study/`. Pick a doc, start a session, have a 1–2 minute conversation about it (long enough that the recap has substance), click "End session".

Wait ~10 seconds, then click "Refresh". Expected: the markdown recap appears inline (the placeholder template populated by Haiku).

Also verify on the filesystem:

```bash
ls -la ~/.voice-tutor/artifacts/
tail -2 ~/second-brain/products/voice-tutor/validation/cost-log.jsonl
lsof -ti :7860 | xargs kill -9 2>/dev/null || true
```

Expected:
- `<session_id>.md` exists in `~/.voice-tutor/artifacts/`
- The last two lines of `cost-log.jsonl` are: a `kind: "session"` row with `mode: "study"` and an `kind: "artifact"` row with the same `session_id`

- [ ] **Step 6.5: Commit**

```bash
cd /Users/mattli/development/voice-tutor && git add bot.py app.py && git commit -m "$(cat <<'EOF'
Add async artifact generation + GET /api/sessions/<id>/artifact

Fire-and-forget Haiku call after disconnect writes ~/.voice-tutor/
artifacts/<session_id>.md and appends a separate kind="artifact" row to
cost-log.jsonl. Endpoint returns 200+markdown if present, 404 otherwise.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: README + product README updates

**Files:**
- Modify: `README.md` (voice-tutor repo)
- Modify: `~/second-brain/products/voice-tutor/README.md`

- [ ] **Step 7.1: Add `## Study companion mode` to repo README**

Insert this section in `/Users/mattli/development/voice-tutor/README.md` between `## Architecture` and `## Data` (the existing Architecture section ends at line 51):

```markdown
## Study companion mode

A document-grounded variant of the regular voice tutor.

- Open `http://localhost:7860/study/` (or the Tailscale URL with `/study/` appended on phone)
- Upload a PDF / Markdown / plain-text doc (≤5MB, ≤150K characters of extracted text)
- Pick the doc, click **Start session**, grant mic access, talk through it
- Click **End session** when done; the WebRTC connection closes and the existing
  on-disconnect pipeline runs (transcript save + summary + analysis)
- A markdown recap is generated asynchronously by Haiku 4.5 and lands at
  `~/.voice-tutor/artifacts/<session-id>.md`
- The "Refresh" button on the ended view fetches `GET /api/sessions/<id>/artifact`
  and renders the markdown inline once it exists

Study sessions skip `memory.md`, the most-recent transcript, and the wiki INDEX —
the doc is the world for that session. `profile.md` still loads.

Storage:
- `~/.voice-tutor/documents/<uuid>-<original-filename>` — original upload
- `~/.voice-tutor/documents/<uuid>.txt` — extracted text used at session start
- `~/.voice-tutor/transcripts/<uuid>.json` — study session transcripts (UUID
  stem instead of datetime; the `/study/` page generates the UUID client-side)
- `~/.voice-tutor/artifacts/<uuid>.md` — the recap
- A separate `cost-log.jsonl` row with `kind: "artifact"` accounts for the
  artifact-generation Haiku call

The regular `/client/` flow is untouched — same UI, same behavior, same prompt.
```

- [ ] **Step 7.2: Add a status line to the product README**

Add a new bullet to the Status section at the top of `/Users/mattli/second-brain/products/voice-tutor/README.md`, immediately after the "Cost optimizations — Haiku for post-session..." entry:

```markdown
**Study companion mode shipped** (2026-04-26). New `/study/` page lets you upload a PDF/MD/TXT (≤150K chars), have a doc-grounded voice conversation, end via UI button, and get an async markdown recap at `~/.voice-tutor/artifacts/<session_id>.md`. Document text replaces the wiki INDEX/memory/most-recent-transcript in the system prompt for that session; profile.md still loads. Tools disabled in study mode. Artifact generation uses Haiku 4.5 (~$0.01–0.03/session); logged as a separate `kind: "artifact"` row in `cost-log.jsonl`. Existing `/client/` flow unchanged. Spec/plan in `planning/2026-04-26-study-companion-mode-{design,plan}.md`.
```

- [ ] **Step 7.3: Commit voice-tutor README**

```bash
cd /Users/mattli/development/voice-tutor && git add README.md && git commit -m "$(cat <<'EOF'
Document study companion mode in README

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7.4: Vault auto-syncs the product README**

The vault has an auto-commit cron task (every 30 minutes per `~/second-brain/areas/nanoclaw/`). The product-README change in `~/second-brain/products/voice-tutor/README.md` will land in the next vault sync; nothing to do manually unless you want it in this minute — in which case:

```bash
cd /Users/mattli/second-brain && git add products/voice-tutor/README.md && git commit -m "voice-tutor README: study companion mode shipped 2026-04-26"
```

Otherwise, leave it staged or unmodified — the next `vault sync` cron run will commit it.

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task |
|---|---|
| HTTP server in `app.py` | Task 1 |
| `/client/` mount | Task 1.3 |
| `/api/offer` POST + PATCH replicated | Task 1.3 |
| `POST /api/documents` | Task 2.2 |
| `GET /api/documents` | Task 2.2 |
| 150K char cap, 5MB upload cap | Task 2.1 (`MAX_DOC_CHARS`, `MAX_UPLOAD_BYTES`) |
| `pypdf` extraction | Task 2.1 |
| `STUDY_BASE_INSTRUCTION` | Task 3.1 |
| `ARTIFACT_PROMPT` | Task 3.1 |
| `build_system_instruction(study=...)` branch | Task 3.2 |
| Tools disabled in study mode | Task 4.2 |
| Wiki/memory/transcript skipped in study mode | Task 3.2 |
| `document_id` + `session_id` in offer body → `runner_args.body` | Task 4.1 |
| `session_id` as transcript stem | Task 4.3 |
| `/study/` static page, three view-states | Task 5.1 |
| End-session via `peerConnection.close()` (no server endpoint) | Task 5.1 (`endBtn.onclick`) |
| `asyncio.create_task` artifact-gen | Task 6.2 |
| Haiku 4.5 model | Task 6.1 |
| Separate JSONL row, `kind: "artifact"` | Task 6.1 |
| `<session>.usage.json` unchanged | not modified — confirmed by absence in any task |
| `GET /api/sessions/{id}/artifact` 200/404 | Task 6.3 |
| Refresh button polling | Task 5.1 (`refreshBtn.onclick`) |
| README updates | Task 7 |

All spec items mapped. Out-of-scope items in the spec ("No tests", "No auth", etc.) match this plan's omissions.

**2. Placeholder scan:** No `TBD`, `TODO`, "implement later", or vague handlers. The artifact prompt template is intentionally a placeholder, but the spec flags this and the plan includes the literal text — no engineer-side decision to make.

**3. Type consistency:**

- `study_meta` keys used everywhere: `document_id`, `doc_title`, `doc_text`, `session_id`. Task 4.1 sets all four; Tasks 4.2, 4.3, 6.2 read them by those exact names.
- `build_system_instruction(study=...)` accepts a dict with `doc_title` and `doc_text`. Task 4.2 passes exactly those two keys. ✓
- `documents.load_document(doc_id)` returns `tuple[str, str] | None`. Task 4.1 unpacks as `title, text`. ✓
- `cost-log.jsonl` rows: session rows have `kind: "session"` (Task 4.4); artifact rows have `kind: "artifact"` (Task 6.1). ✓
- WebRTC offer body shape: client sends `{sdp, type, request_data: {...}}`; server reads `request.request_data` and forwards to `SmallWebRTCRunnerArguments(body=...)` (Task 1.3); bot reads `runner_args.body` (Task 4.1). ✓
- `pcId` returned in offer answer used in PATCH `/api/offer` (Task 5.1). Matches pipecat's `SmallWebRTCRequest.pc_id`. ✓

No drifted names found.

---

## Execution Handoff

Plan complete and saved to `~/second-brain/products/voice-tutor/planning/2026-04-26-study-companion-mode-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
