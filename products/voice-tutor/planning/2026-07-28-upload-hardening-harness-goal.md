# Upload Hardening (Backend) — Dev-Harness Goal

**Date:** 2026-07-28
**Status:** Goal doc for a dev-harness run. Pre-share build item: stranger-proof upload, backend half only.
**Target repo:** `~/Development/voice-tutor` (main @ `345c081` — post demo-docs merge; multi-user identity live)
**Parent decisions:** [[2026-07-27-validation-gate-and-preshare-build]] (gate §5 item 3); backlog "Claim extraction input bound" (2026-07-23); the pre-warm gotcha (claims only extract on picker click — invisible to Matt, fatal to a stranger's first session).

---

## Goal (one paragraph)

Make document upload safe for a stranger: after this run, an uploaded document is either **ready to study** (claims extracted automatically, no ritual knowledge required) or **clearly rejected** (too long, with an honest error naming the limit and the doc's word count) — never silently degraded into a plain, un-steered session because the user didn't know to click the doc in the picker first. Two changes on one seam: auto-warm at upload completion, and an input-size tripwire checked before any extraction.

## Part 1 — Auto-warm on upload

- When an upload completes successfully, trigger claim extraction for that document as a background task — the same extraction path the existing prepare/warm endpoint fires, for the uploading user's namespace.
- **Upload success is independent of extraction success.** If extraction fails (API error, truncation tripwire, anything), the upload still succeeds and the doc degrades honestly to plain study mode exactly as an unwarmed doc does today. No new failure mode for upload.
- **Idempotent:** an already-warmed doc (fresh sidecar by `source_hash`) is not re-extracted — the existing cache logic is the guard; the trigger must go through it, not around it.
- The picker-click prepare path stays as-is (it becomes the retry/fallback warm path, and remains how manually-placed `_shared` docs get warmed).

## Part 2 — Input bound (the tripwire)

- One named constant (e.g. `CLAIM_MAX_WORDS = 10_000`) — a tripwire well before the measured cliff (16K output budget, minutes of latency, unusable 300-claim rubrics), not a tuned "right" number. Chosen decade over precision; adjustable by evidence later.
- The check runs on the document text **before any extraction call**, at the warm seam — so it protects both the new upload-triggered warm and the existing prepare path.
- Rejection is a typed, catchable condition surfaced to the user as a clear message: the doc's word count, the limit, and the suggestion to split or excerpt. Not an exception trace, not a silent empty rubric.
- **Log every rejection with the doc's word count** (app log line is sufficient) — each rejection is evidence for tuning the constant later.
- An oversized doc's *upload* still succeeds (the file lands; it just isn't warmed and the user is told why) — rejection applies to extraction, not storage.

## Binding constraints (not renegotiable in the contract)

1. All helper signatures and the required-`user_id` discipline unchanged. No route signature changes beyond what surfacing the rejection message requires.
2. `_shared` namespace behavior untouched (no auto-warm applies to manual placement; prepare path warms shared docs as today; shared sidecar rules from the demo-docs build unchanged).
3. No changes to `bot.py` static prompt content; the pinned `static_prompt_hash` literals stay green.
4. All existing tests stay green — full suite currently 333, including every mirror-image isolation test.
5. House rules: TDD; test via pure helpers (extraction trigger tested with the background task monkeypatched — no live API calls); pipecat pinned; `.venv/bin/python` for tests; run branch only, nothing merged or pushed.

## Acceptance criteria the contract should encode (minimum)

- Upload completion triggers extraction for the uploading user's doc (asserted via a monkeypatched/spied warm task — correct user_id, correct doc_id).
- Upload succeeds even when the triggered extraction raises; the doc remains loadable and unwarmed.
- Already-warmed doc (valid sidecar for current `source_hash`): upload/warm trigger causes **no** re-extraction.
- Doc over the bound: extraction refused with the typed condition; message contains word count and limit; a log line records the rejection; the doc file itself is present and loadable.
- Doc under the bound: proceeds to extraction as normal.
- The bound also fires on the prepare/picker path (one test through that entry).
- Full suite green, hash literals green, mirror tests untouched and green.

## Explicitly out of scope

- All UI: picker labels, warm-progress indicators, "extracting…" states, upload-form changes beyond displaying the rejection message the backend returns.
- PDF/text conversion changes; long-doc strategies (sectioning, hierarchical claims, comprehension levels — deferred per backlog).
- Any change to `_shared` placement/warming, coverage state, or session modules.

## Context for the planner (repo orientation)

Extraction and its cache live in `claims.py` (`generate_claims`, `load_fresh_claims`, `source_hash` freshness, the `ClaimExtractionTruncated` tripwire); the upload endpoint and the prepare/warm endpoint live in `app.py`; documents resolve via `documents.py` (per-user + `_shared` fallback, as of merge `345c081`). Mirror-test patterns and fixtures: `tests/test_documents_list_load.py`, `tests/test_claims.py`, `tests/conftest.py`. The README's identity section describes the multi-user layout.
