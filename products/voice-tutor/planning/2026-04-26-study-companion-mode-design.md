---
status: draft
date: 2026-04-26
mode: design
---

# Study companion mode — design

A document-grounded variant of voice-tutor. User uploads a doc, has a voice conversation about it, ends the session with a button, gets a markdown recap on disk asynchronously.

Purely additive. Existing voice-tutor flow at `/client/` is untouched.

## Goal

Be able to load a paper, blog post, or chapter into the tutor, talk through it for 10–30 minutes, hang up, and walk away with a markdown artifact that captures what we covered.

Not a product. A prototype to see if doc-grounded voice conversation is useful enough to keep building.

## What changes

| Concern | Today | After |
|---|---|---|
| HTTP server | `pipecat.runner.run.main()` builds FastAPI internally | `app.py` builds FastAPI; `bot()` unchanged |
| Entry points | `/client/` (prebuilt UI) | `/client/` + new `/study/` static page |
| Session-start data | offer body unused | offer body carries `document_id` + `session_id` (UUID) for study sessions |
| System prompt | base + profile + wiki INDEX + memory + recent transcript | study mode swaps in: base + profile + doc text only |
| Tools | `read_wiki_page` if `WIKI_ENABLED` | study mode drops the tool |
| Post-session | summary + analysis (Haiku) | study mode adds a third Haiku call: artifact generation |
| Artifacts | none | `~/.voice-tutor/artifacts/<session_id>.md` |
| Cost telemetry | LLM/STT/TTS + post-session Haiku in `<session>.usage.json` and one row in `cost-log.jsonl` | artifact-gen tokens written as a separate `cost-log.jsonl` row (`kind: "artifact"`, same `session_id`); `<session>.usage.json` unchanged |

## Architecture

### File layout

```
voice-tutor/
  bot.py            # changes: build_system_instruction signature, runner_args.body parsing, generate_artifact() + asyncio.create_task hook in save_transcript()
  app.py            # new — FastAPI app; replaces start.sh's invocation of bot.py
  static/
    study.html      # new — single static page, ~150 lines vanilla JS
  start.sh          # changed — exec uvicorn app:app
```

Data:

```
~/.voice-tutor/
  documents/
    <uuid>-<original-filename>      # original upload (PDF/MD/TXT)
    <uuid>.txt                      # extracted text, used at session start
  artifacts/
    <session_uuid>.md               # post-session recap, written async
  transcripts/<session_uuid>.json   # study sessions only — UUID stem
  transcripts/<datetime>.json       # regular sessions — datetime stem (unchanged)
```

No `index.json`. Doc list is computed at request time from `documents/*.txt`.

### HTTP surface (added)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/documents` | Multipart upload. PDF/MD/TXT, 150K char cap. Returns `{document_id, title, char_count}`. |
| GET | `/api/documents` | List uploaded docs: `[{document_id, title, char_count, uploaded_at}]`. |
| GET | `/api/sessions/{session_id}/artifact` | 200 + markdown if file exists, 404 otherwise. |
| GET | `/study/` | Serves `static/study.html`. |
| POST | `/api/offer` | Replicated from pipecat. Reads `request_data.document_id` + `request_data.session_id`, threads into `runner_args.body`. |
| GET | `/client/...` | Mounts `SmallWebRTCPrebuiltUI` unchanged. |
| PATCH | `/api/offer` | Replicated from pipecat (ICE candidates). |

`/start` and `/sessions/{id}/{path:path}` from pipecat's runner are NOT replicated — the prebuilt UI and our `/study/` page both call `/api/offer` directly. Drop them; less code, no observed need.

### Session-start data flow

1. `/study/` page collects `document_id` from picker, generates a `session_id = crypto.randomUUID()` in JS.
2. WebRTC offer POST body: `{sdp, type, request_data: {document_id, session_id}}`.
3. `app.py` offer handler hands `request_data` to `SmallWebRTCRunnerArguments(body=...)`.
4. `bot()` reads `runner_args.body.get("document_id")`. If present:
   - Load `~/.voice-tutor/documents/<doc_id>.txt`
   - Pass `document_id`, `document_text`, `session_id` to `build_system_instruction(study=...)`
   - Use `session_id` as the transcript stem instead of `session_start.strftime(...)`

If `document_id` is absent: existing behavior, unchanged.

### Prompt branching

`build_system_instruction()` gains an optional `study: dict | None = None` parameter. When set:

```
parts = [STUDY_BASE_INSTRUCTION]
if profile: parts.append("## About the person you're talking to\n\n" + profile)
parts.append(f"\n## Document: {doc_title}\n\n{doc_text}")
return "\n".join(parts)
```

`STUDY_BASE_INSTRUCTION` (starting wording, iterate freely):

> You are a study companion helping the user understand a specific document they have loaded. Your job is to help them engage with the material actively — ask what they want to focus on, explain concepts when asked, surface connections, push back when their understanding is shaky, and let them lead the direction.
>
> Reference the document directly. Quote short passages when useful. Don't summarize the whole thing unprompted — wait for them to point at what they want to dig into.
>
> Keep responses tight. One thought at a time. This is voice — long monologues don't work.

Tools: `tools = []` in study mode. No `read_wiki_page`. Wiki INDEX, `memory.md`, and the most-recent transcript are not loaded.

### Document upload + extraction

- `pypdf` for PDFs (added to `pyproject.toml`).
- Markdown / plain text: read as-is.
- Title heuristic: first non-empty line of the extracted text, trimmed to 120 chars. Falls back to original filename if extraction yields no usable line.
- 150K char cap on the extracted text. Reject earlier on file size (e.g. >5MB) to avoid wasted PDF parsing. Reject other extensions with 415.
- `MAX_DOC_CHARS = 150_000`, `MAX_UPLOAD_BYTES = 5_000_000` as constants at the top of the documents module.

### Artifact generation

Triggered from `save_transcript()` when the session metadata flags it as study mode. Fired via `asyncio.create_task` so it doesn't block disconnect.

```python
async def generate_artifact(session_id, doc_title, doc_text, transcript, duration_sec):
    prompt = ARTIFACT_PROMPT.format(
        doc_title=doc_title,
        doc_text=doc_text,
        duration_mmss=f"{int(duration_sec//60)}:{int(duration_sec%60):02d}",
        transcript_json=json.dumps(transcript, indent=2),
    )
    resp = await asyncio.to_thread(
        anthropic.Anthropic().messages.create,
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    (ARTIFACTS_DIR / f"{session_id}.md").write_text(resp.content[0].text)
    append_artifact_cost_row(session_id, resp.usage)
```

`ARTIFACT_PROMPT` takes `{doc_title}`, `{doc_text}`, `{duration_mmss}`, `{transcript_json}` and asks for the template below. Wording lives in `bot.py` next to `SUMMARY_PROMPT` and `ANALYSIS_PROMPT`.

Artifact template (placeholder, easy to swap):

```markdown
# Study session — {doc_title}
Duration: {mm:ss}

## What we covered
- ...

## Key points
### Topic
...

## Open threads
...
```

On failure: log to stderr, do not write a stub, do not crash. The transcript and `.usage.json` are already on disk; the user can re-run later if they care.

### Cost telemetry

`<session>.usage.json` is written synchronously at disconnect (existing behavior, unchanged). Artifact-gen runs *after* it, so it cannot update that file. Instead, `generate_artifact()` appends a separate row to `cost-log.jsonl` after the Haiku call returns:

```json
{"kind": "artifact", "session_id": "...", "input_tokens": ..., "output_tokens": ..., "cost_usd": ...}
```

The existing per-session row stays as-is (no `kind` field today; it gains one — `"kind": "session"` — for symmetry, but readers can default to `"session"` for legacy rows). `cost-log.md` is not touched by artifact-gen — defer the cosmetic question of whether to add an Artifact column until the JSONL shows the cost is non-trivial.

### `/study/` page (single file)

Three view-states toggled by `display: none`:

1. **Picker.** Lists existing docs (calls `GET /api/documents`), upload form, "Start session" button (disabled until a doc is selected).
2. **Session.** Connect button → starts WebRTC offer with `document_id` and a fresh `session_id` UUID. Shows doc title. "End session" button calls `peerConnection.close()` (server's `on_client_disconnected` handles teardown).
3. **Ended.** "Recap will be saved to `~/.voice-tutor/artifacts/<session_id>.md` shortly. [Refresh]". Refresh button calls `GET /api/sessions/<session_id>/artifact`; on 200 renders the markdown inline; on 404 keeps the message.

No framework. No build step. Pure HTML + a single `<script>` block. The WebRTC offer/answer dance is straightforward against `/api/offer`: `RTCPeerConnection` with audio transceivers, `createOffer()`, POST `{sdp, type, request_data: {document_id, session_id}}` to `/api/offer`, set the response as the remote description, then PATCH `/api/offer` with ICE candidates as they trickle. The prebuilt UI's source (`pipecat-ai-small-webrtc-prebuilt`) is the reference; pull only the offer flow, not its UI chrome.

### Server-side session metadata

`bot()` already has access to `runner_args.body`. Stash `{"mode": "study", "document_id": ..., "doc_title": ..., "session_id": ...}` on a closure-local variable that `save_transcript()` reads. No new global state, no DB.

## What's not in scope

- No chunking, no RAG, no embeddings. Full doc in context. The 150K cap is the entire mitigation.
- No edit/delete on uploaded docs. Use `rm` on the filesystem.
- No artifact regeneration UI. Re-run by hand if needed.
- No multi-doc sessions.
- No streaming of the artifact generation. Async write, refresh polls.
- No auth. Tailscale already gates network access.
- No tests. Personal-prototype scope; verification is manual by uploading a real doc.

## Implementation order

Build and verify each step before moving to the next.

1. **`app.py` skeleton.** FastAPI app, mount prebuilt UI at `/client/`, replicate `/api/offer` + PATCH from `pipecat.runner.run`. Update `start.sh` to `exec uv run uvicorn app:app --host 0.0.0.0 --port 7860`. Verify: existing `/client/` flow still works end-to-end (connect, talk, disconnect, transcript saved).
2. **Document upload + listing.** `POST /api/documents`, `GET /api/documents`. `pypdf` extraction. Verify: upload a PDF, MD, and TXT; check `~/.voice-tutor/documents/`.
3. **Study system prompt.** Add `STUDY_BASE_INSTRUCTION`. Branch `build_system_instruction()`. Don't wire offer-body parsing yet — manually call with hardcoded doc to verify the prompt assembles right.
4. **Offer-body wiring.** `app.py` reads `document_id` + `session_id` from offer body, passes through. `bot()` reads them from `runner_args.body`, branches prompt + tool list + transcript stem. Verify: log the assembled system prompt size; confirm doc text is in there and memory/wiki are not.
5. **`/study/` page.** Static HTML with three view-states. Doc-picker hits `/api/documents`. Connect button POSTs offer with `request_data`. End button calls `peerConnection.close()`. Verify: full study session works end-to-end, transcript lands at `transcripts/<uuid>.json`.
6. **Artifact generation.** `asyncio.create_task` from `save_transcript()`. Haiku call, write `artifacts/<uuid>.md`, log cost as a separate `cost-log.jsonl` entry. `GET /api/sessions/<id>/artifact` endpoint. Wire the "Refresh" button on the ended view. Verify: end a study session, wait, refresh shows the markdown.
7. **README updates.** New `## Study companion mode` subsection under Architecture. Status section line for what shipped + any gotchas. Update `bot.py` docstrings if anything moved.

## Open items (deferrable)

- Artifact prompt wording — likely needs 2–3 iterations after first real session.
- Whether the `/study/` page should show a list of past artifacts. Probably yes after a week of use; out of scope for v1.
- Whether `cost-log.md` should add an `Artifact` column. Defer until the JSONL data shows the artifact-gen cost is non-trivial.
- Whether to reuse `session_id` for regular sessions too (would unify transcript naming). Defer; current datetime stems are useful for sortability.
