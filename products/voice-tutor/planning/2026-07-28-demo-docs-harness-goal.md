# Demo Docs Plumbing — Dev-Harness Goal

**Date:** 2026-07-28
**Status:** Goal doc for a dev-harness run. Pre-share build item #5 (plumbing half only).
**Target repo:** `~/Development/voice-tutor` (main @ post-identity merge, README describes the multi-user layout)
**Parent decisions:** [[2026-07-27-validation-gate-and-preshare-build]] (gate §4: "demo docs — shared document, per-user state"); [[2026-07-28-identity-and-isolation-spec]] §5.2 (the demo-doc seam: fallback resolution, *no signature churn*).

---

## Goal (one paragraph)

Add a shared document namespace to Voice Tutor so demo documents can be offered to every user without weakening per-user isolation. Documents placed in `~/.voice-tutor/documents/_shared/` appear in **every** user's picker and are loadable by every user; **all state about them stays per-user** (sessions, recaps, "where you left off", coverage — keyed by `user_id + document_id`, which already works and must keep working). Claim sidecars for shared docs are themselves shared (extracted once, in `_shared/`). No UI changes, no migration, no demo-doc content selection — plumbing only.

## Binding design constraints (from the identity spec — not renegotiable in the contract)

1. **No signature changes.** `list_documents(user_id)`, `load_document(user_id, doc_id)`, `save_upload(user_id, ...)`, `generate_claims(user_id, doc_id, text)`, `load_fresh_claims(user_id, doc_id, text)` keep their exact signatures. The shared namespace is a *resolution fallback inside* these helpers, per the seam reserved in spec §5.2.
2. **Resolution order: user first, then shared.** `load_document` and `load_fresh_claims` resolve in the user's namespace first; on miss, fall back to `_shared/`. A user's own doc with a colliding id shadows the shared one (deterministic, tested).
3. **`save_upload` NEVER writes to `_shared/`.** Uploads always land in the acting user's namespace. Shared docs are placed manually (by Matt, on the filesystem) — there is no write path to `_shared/` in the app.
4. **Claims for shared docs:** the sidecar lives at `documents/_shared/<doc_id>.claims.json` — one extraction serves everyone. `generate_claims` (and the warm endpoint's background task) writes the sidecar into `_shared/` **iff** the document itself resolved from `_shared/`; otherwise per-user as today. `source_hash` freshness logic unchanged.
5. **`_shared` is a reserved name.** `identity.sanitize_user_id` (or registry validation — implementer's choice, stated in the contract) must reject `_shared` as a user_id, so no minted user can alias the shared namespace. This closes a real hole: the current charset `[a-z0-9_-]` would accept it.
6. **Per-user state stays per-user — no exceptions for shared docs.** `previous_session_recap`, `list_study_sessions`, artifacts, transcripts, analyses, memory: all continue to key on `user_id` (+ `document_id`). Two users studying the same shared doc must never see each other's recaps or "where you left off". No changes to these modules are expected; the contract covers them via tests, not code.
7. **All existing tests stay green**, including the full mirror-image isolation suite and the pinned `static_prompt_hash` literals. This build must not touch `bot.py` prompt content.
8. House rules: TDD; test via pure helpers (no TestClient); pipecat pinned; never delete files; `.venv/bin/python` for tests; nothing pushed or merged — run branch only.

## Acceptance criteria the contract should encode (minimum)

- A doc seeded in `_shared/` appears in `list_documents("matt")` **and** `list_documents("sarah")` (and any third user), while each user's own uploads remain invisible to the others (existing mirror tests still green).
- `load_document(user, shared_doc_id)` succeeds for two different users; `load_document(user, other_users_doc_id)` still returns `None`.
- Shadowing: a user doc and a shared doc with the same id → the user's resolves.
- `save_upload` for any user writes only under that user's dir — a test asserts nothing lands in `_shared/`.
- Shared claims: sidecar written once into `_shared/` (via the resolved-from-shared path), then `load_fresh_claims` returns it for **both** users; a per-user doc's sidecar stays per-user.
- `sanitize_user_id("_shared")` (or the registry path) rejects; test pinned.
- Per-user state on a shared doc: seed sessions/recaps for users A and B on the same shared doc id; `previous_session_recap(A, D, …)` returns only A's, `previous_session_recap(B, D, …)` only B's, and a user with no sessions on D gets `None`.
- Full suite green including hash literals.

## Explicitly out of scope

- Choosing/copying the actual demo documents into `_shared/` (Matt does this by hand afterward).
- Any picker UI labeling ("sample" badges) — pre-share item #3 territory.
- Upload-flow/UX changes, coverage UI, migration scripts.
- Any change to route signatures, `identity.py` cookie logic (beyond the `_shared` rejection), or `bot.py` static prompt content.

## Context for the planner (repo orientation)

The repo just landed per-user isolation (merge `2e05e33`): every data helper takes a required `user_id`; documents/claims live under `documents/<user_id>/`; the mirror-image test pattern lives in `tests/test_documents_list_load.py`, `tests/test_claims.py`, `tests/test_study_history.py`; fixtures in `tests/conftest.py` monkeypatch module path constants (`docs_dir`, `claims_docs_dir`, `study_history_tmp`). The README's "Identity & isolation (multi-user)" section describes the layout. This goal extends `documents.py` + `claims.py` (and one guard in `identity.py`); nothing else should need edits.
