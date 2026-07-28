---
title: Per-User Identity + Isolation — Build Spec
date: 2026-07-28
status: spec (pre-plan) — awaiting Matt's review before planning
owns_decisions_from: "[[2026-07-27-validation-gate-and-preshare-build]] §3 (identity), §4 (isolation)"
scope: pre-share build items #1 (identity threading) + #2 (isolation)
---

# Per-User Identity + Isolation — Build Spec

Implements sections **3 (Identity)** and **4 (Isolation)** of
[[2026-07-27-validation-gate-and-preshare-build]]. That gate doc's decisions are
**binding inputs** here; this spec transcribes them, then does the four pieces of
spec work the gate doc left open: (1) a verified read/write surface inventory,
(2) the `session-log.jsonl` schema change + backfill, (3) the profile/memory
migration, (4) the cookie + voice-session identity plumbing. It closes with
**contradictions found in the code** against the gate doc's assumptions.

**Spec only. No implementation.** Signatures below are load-bearing (the
isolation guarantee *is* the signature shape — see §6), but they are the
contract to review, not final code.

---

## 1. Scope

### In scope
- **Identity threading** (gate §3 / build item #1): tokened links, long-lived
  cookie, `user_id` required in the data layer (ledger rows + file paths),
  one-time backfill to `"matt"`, paste-your-code gate for cookieless visits.
- **Isolation** (gate §4 / build item #2): every data-access helper takes
  `user_id` as a **required argument**; per-user namespacing of documents,
  profile, memory, and (newly discovered) claim sidecars; ownership checks on
  session-scoped reads; mirror-image cross-user tests per surface.

### Out of scope — verbatim from the build request
> real authentication, upload-flow changes (separate item), coverage bar, demo
> doc selection. Isolation of EXISTING surfaces only.

Consequences of those exclusions, stated so they aren't surprises:
- **Real auth** stays unbuilt: identity is issued by hand-minted tokens; there
  are no passwords/resets/email (gate §3 "unbundle account").
- **Upload-flow changes** are item #3. This spec **namespaces** the existing
  upload write path (`save_upload` writes into the caller's namespace) because
  that is isolation of an existing surface — but it does **not** touch the
  stranger-proof upload UX / pre-warm fix.
- **Demo docs** are item #5. Because they're deferred, a **new user's picker is
  empty until they upload** (all existing docs backfill to `matt`). This is
  correct isolation, just stark; §5.2 documents the shared-namespace seam so
  demo docs slot in later without re-churning signatures.

---

## 2. Binding decisions (transcribed from the gate doc)

Restated so this spec is self-contained. Source: gate doc §3–§4.

**Identity model (§3):**
- Each tester gets an **unguessable tokened link**: `/study/?u=<token>` (a
  random token, *not* a name).
- First visit sets a **long-lived cookie** (a year). Identity is read from the
  cookie thereafter. The link is the key; the cookie is the memory.
- **Read order:** cookie first → URL param second → else the paste-your-code
  gate. When the URL param is present, **refresh the cookie**. Re-clicking a
  link is always safe and self-heals a lost cookie.
- **Fail closed, never fail guessy.** A bare URL with no cookie shows a
  dead-simple "enter your invite link or code" gate. **No name-picker** — a
  wrong tap writes one person's session into another's memory, which is far
  worse than a re-paste. Recovery = Matt re-sends the same link.
- **`user_id` is REQUIRED in the data layer from day one** (ledger rows, file
  paths), even while *issuing* ids stays casual. Existing data backfills to
  `user_id: "matt"` once.

**Isolation model (§4):**
- **Structural withholding, not discipline.** Every data-access helper takes
  `user_id` as a **required argument** and reads only within that namespace. No
  signature offers unscoped access — the leak becomes an API-shape
  impossibility, the way `scope?: never` enforces evaluator blindness.
- **Demo docs are the deliberate split:** the *document* is shared; all *state*
  about it (sessions, recaps, coverage, "where you left off") is per-user. The
  `user_id + document_id` compound key handles this.
- **Mirror-image cross-user tests** per surface: user B sees *nothing* of user
  A — B's picker lacks A's docs, B's session list is empty after A's sessions,
  B's recap scan on a doc A studied returns `None`.

---

## 3. Verified surface inventory

Every place the app reads or writes per-user state, checked against `app.py`,
`bot.py`, and the helper modules. **Bold = leaks today.** Rows marked **(gate
doc missed)** are surfaces the gate §4 list did not enumerate; the build request
asked me to find these.

### 3.1 Enumeration surfaces (list/browse — leak the *set* of others' data)

| Surface | Route / entry | Reads | Leak today |
|---|---|---|---|
| **Document picker** | `GET /api/documents` → `documents.list_documents()` | `~/.voice-tutor/documents/*` (flat, shared) | **Yes** — everyone's docs |
| **Sessions history** | `GET /api/sessions` → `sessions.list_study_sessions()` | `session-log.jsonl` (all rows) | **Yes** — everyone's history *and costs* |
| **"View last session"** — *(gate doc missed)* | `GET /api/sessions/latest` → `app._…` iterates `session-log.jsonl` | `session-log.jsonl` | **Yes** — newest study session across *all* users; same class as `/api/sessions` |
| **memory viewer** | `GET /view/memory` | `~/.voice-tutor/memory.md` (singleton) | **Yes** — tutor's cross-user memory dump |
| **profile viewer** | `GET /view/profile` | `~/.voice-tutor/profile.md` (singleton) | **Yes** |
| **cost-log viewer** — *(gate doc partial)* | `GET /view/cost-log` | `…/validation/cost-log.md` (global aggregate) | **Yes** — Matt's/global costs; see §5.5 decision |

### 3.2 Session-scoped surfaces (keyed by unguessable UUID — leak on *ownership*, not enumeration)

Reachable only if you already hold a `session_id`. You only get one from an
enumeration surface (above) or from your own live session, so scoping §3.1
mostly closes these — but structural withholding requires an explicit ownership
check so a leaked/guessed id can't cross users.

| Surface | Route | Reads |
|---|---|---|
| Recap / artifact | `GET /api/sessions/{id}/artifact` | `~/.voice-tutor/artifacts/{id}.md` |
| Telemetry composite — *(gate doc missed)* | `GET /api/sessions/{id}/telemetry` | artifact + `transcripts/{id}.{usage.json,summary.md,prompt.txt}` + session-analysis + ledger join |
| Prompt viewer — *(gate doc missed)* | `GET /view/sessions/{id}/prompt` | `transcripts/{id}.prompt.txt` |
| Analysis viewer — *(gate doc missed)* | `GET /view/sessions/{id}/analysis` | `session-analyses/…-{shortid}.md` |

### 3.3 Session-start (voice pipeline) surfaces

| Surface | Entry | Reads |
|---|---|---|
| **`previous_session_recap`** | `bot.bot` → `study_history.previous_session_recap(document_id, …)` | `session-log.jsonl` + `artifacts/` | **Yes** — cross-user "where you left off" on a shared doc (gate §3's founding bug) |
| **profile + memory injection** | `bot.build_system_instruction` → `load_profile()` / `load_memory()` | `profile.md` / `memory.md` singletons | **Yes** — tutor knows what *another* user told it |
| **claim map** — *(gate doc missed)* | `bot.bot` → `claims.load_fresh_claims(doc_id, text)` | `~/.voice-tutor/documents/{doc_id}.claims.json` | Follows the document namespace (see §5.2) |

### 3.4 Write surfaces (must write into the acting user's namespace)

| Writer | Location today | Called from |
|---|---|---|
| Session ledger row (`kind:"session"`) | `session-log.jsonl` | `bot.save_transcript()` |
| Artifact ledger row (`kind:"artifact"`) + recap file | `session-log.jsonl`, `artifacts/{id}.md` | `bot.generate_artifact()` |
| Transcript + sidecars | `transcripts/{id}.{json,usage.json,summary.md,prompt.txt}` | `bot.save_transcript()` |
| Session analysis | `session-analyses/…-{shortid}.md` | `bot.generate_session_analysis()` |
| Memory append | `memory.md` | `bot.save_transcript()` → `append_to_memory()` |
| Uploaded doc + text + summary | `documents/{id}*` | `documents.save_upload()` |
| Claim sidecar | `documents/{id}.claims.json` | `claims.generate_claims()` |

### 3.5 Not in scope but noted
- **Regular `/chat/` mode** shares `memory.md`/`profile.md` globally too (via the
  same `build_system_instruction` non-study branch, plus
  `load_most_recent_transcript_block`). It's Matt's dogfood surface; it inherits
  `user_id = "matt"` via Matt's own cookie (§5.3). No separate work, but the
  helpers it calls get the same required-`user_id` signatures.
- **`cost-log.md`** is a *global aggregate* (one running table, not per-session);
  it cannot be cheaply split per-user. Decision in §5.5.

---

## 4. Data layer: `session-log.jsonl` schema + backfill

### 4.1 Current schema (verified on disk, 2026-07-28)

Two row kinds, no `user_id` today:

- **`kind:"session"`** — keys: `session_id, session_start, session_end,
  session_duration_sec, turns, tts_chars, …, prompt_hash, tool_calls`, and (study
  rows only) `mode:"study"`, `document_id`. Written by `bot.save_transcript()`
  (`bot.py:921–951`).
- **`kind:"artifact"`** — keys: `session_id, document_id, input_tokens,
  output_tokens, cost_usd`. Written by `bot.generate_artifact()`
  (`bot.py:550–560`).

### 4.2 Change

Add a **top-level `user_id` (string, required) to both row kinds.** It is the
identity field the isolation queries filter on. Written at row-creation time from
the pipeline's resolved `user_id` (§5.3). Place it first for readability; order
is cosmetic (rows are parsed by key).

### 4.3 One-time backfill

A standalone, idempotent script (pattern: `reconcile_costs.py` — parses paths
directly, no `source`):

- For **every** existing row in `session-log.jsonl` lacking `user_id`, set
  `user_id: "matt"`. Covers both `kind:"session"` and `kind:"artifact"`.
- Idempotent: rows already carrying `user_id` are left untouched (re-runnable).
- Archive the pre-backfill file to `_archive/` first (never delete — global
  rule), then rewrite in place.
- Verify: line count unchanged; every row now has `user_id`; no other field
  mutated (round-trip `json.loads`/`dumps` diff on all non-`user_id` keys).

---

## 5. Data layer: namespacing + migration

### 5.1 Profile + memory → per-user files

**Today** (two independent definitions — a drift hazard, see §7):
- `session_state.py`: `PROFILE_PATH`, `MEMORY_PATH` = `~/.voice-tutor/{profile,memory}.md`;
  `load_profile()`, `load_memory()`, `append_to_memory()` read/write them.
- `app.py:230–231`: its **own** duplicate `MEMORY_PATH`/`PROFILE_PATH` constants
  for the `/view/memory` and `/view/profile` routes.

**Target layout:**
```
~/.voice-tutor/profiles/<user_id>.md
~/.voice-tutor/memory/<user_id>.md
```

**Change:** the three `session_state.py` helpers take `user_id` and resolve the
path from a base dir:
- `load_profile(user_id) -> str`
- `load_memory(user_id) -> str`
- `append_to_memory(user_id, transcript, summary_text) -> None`

Path builders: `profile_path(user_id) = PROFILES_DIR / f"{user_id}.md"`,
`memory_path(user_id) = MEMORY_DIR / f"{user_id}.md"`. `user_id` is sanitized to
a filename-safe token (`Path(user_id).name`, and reject non-`[a-z0-9_-]`) so it
can't traverse. The `app.py` viewer routes call these same helpers instead of
their duplicate constants — **delete the app.py duplicates** (§7).

**Writers:** `append_to_memory` is called from `bot.save_transcript()`, which
now has `user_id` in scope (§5.3).

**Migration (one-time, idempotent, archive-first):**
- `~/.voice-tutor/profile.md` → `profiles/matt.md`
- `~/.voice-tutor/memory.md` → `memory/matt.md`
- Leave originals archived; new writers only touch the namespaced paths.

### 5.2 Documents + claim sidecars → per-user namespace

**Today:** `documents.py` and `claims.py` **each** define
`DOCUMENTS_DIR = ~/.voice-tutor/documents` (flat, shared). Docs are
`{id}.txt`, `{id}-{original}`, `{id}.summary.txt`; claim sidecars
`{id}.claims.json` land in the same dir.

**Target layout:**
```
~/.voice-tutor/documents/<user_id>/<id>.txt
                                   /<id>-<original>
                                   /<id>.summary.txt
                                   /<id>.claims.json
```

**Change — every document/claim helper takes `user_id`:**
- `documents.list_documents(user_id)` — reads only that user's subdir.
- `documents.save_upload(user_id, filename, raw)` — writes into that subdir.
- `documents.load_document(user_id, doc_id)` — resolves within that subdir.
- `claims.generate_claims(user_id, doc_id, text)`,
  `claims.load_fresh_claims(user_id, doc_id, text)`, and the internal
  `_claims_path(user_id, doc_id)`.

Callers to thread `user_id` through (from §3): `app.py` upload/list/prepare/
telemetry/latest/lookup routes, `bot.bot` session start, `sessions.py`
title-join, `study_history` (indirect via artifacts — see §5.4).

**Demo-doc seam (forward-compat, not built now):** `load_document` /
`list_documents` are specified to resolve **the user's namespace only** for now.
When demo docs land (item #5), resolution gains a fallback to a shared
`documents/_shared/` namespace *without changing the signature* — the `user_id`
argument stays, demo docs just also appear. Stating this now so the compound-key
model (gate §4) is honored from day one and the signature doesn't churn later.

### 5.3 Where the pipeline learns `user_id` (the load-bearing plumbing)

The voice session must **carry identity, not just the page** (build request
item 4). Client JS **cannot** be trusted for `user_id` (and can't read the
HttpOnly cookie anyway). Identity is **stamped server-side**:

1. `app.offer()` gains an incoming-`Request` parameter, reads the `vt_uid`
   cookie, resolves it to a `user_id` (§6.2), and **injects `user_id` into the
   WebRTC body** (`request_data["user_id"]`) before `bot.bot` runs.
2. Both entry paths funnel through `offer()`:
   - direct `POST /api/offer` (the `/study/` flow), and
   - the `/sessions/{id}/api/offer` proxy (`/chat/` prebuilt flow) — the proxy
     already holds a `Request`; it passes it into `offer()`.
3. `bot.bot` reads `body["user_id"]` and threads it into
   `build_system_instruction`, `load_document`, `load_fresh_claims`,
   `previous_session_recap`, `save_transcript`, `generate_artifact`, and every
   ledger row.
4. **Fail closed:** an `/api/offer` request with no resolvable `user_id` is
   rejected (`403`), not defaulted. Matt reaches regular `/chat/` mode fine
   because he has minted himself a token and holds the cookie (gate §3 "tester
   zero"). Client-supplied `user_id` in the body is ignored — only the
   server-stamped value is trusted.

### 5.4 Artifacts / transcripts / analyses

These are keyed by `session_id` (UUID). Two options were considered; the spec
chooses **path-namespacing by user** for consistency with docs/profile, so the
filesystem itself encodes ownership and directory listings can't cross users:

```
~/.voice-tutor/artifacts/<user_id>/<session_id>.md
~/.voice-tutor/transcripts/<user_id>/<session_id>.{json,usage.json,summary.md,prompt.txt}
~/second-brain/.../session-analyses/<user_id>/…-<shortid>.md
```

- Writers (`bot.save_transcript`, `generate_artifact`, `generate_session_analysis`)
  write into `<user_id>/`.
- Readers (`study_history.previous_session_recap`, the `/artifact`,
  `/telemetry`, `/view/.../prompt`, `/view/.../analysis` routes,
  `session_naming.find_analysis_path`) take `user_id` and resolve within it.
- `session_naming.find_analysis_path(directory, session_id)` gains a `user_id`
  (globs within `directory/<user_id>/`).

**Alternative considered (flat files + ledger ownership check):** keep files
flat, and on every session-scoped read, look up the row's `user_id` in the
ledger and `404` if it ≠ requester. Rejected as the *primary* mechanism because
it's the discipline pattern the gate doc warns against (a forgotten check
leaks), but the ownership check is still applied as **defense in depth** on the
session-scoped routes (§3.2): resolve the requester's `user_id`, and if the
path's `<user_id>/` segment doesn't match, return `404` (not `403` — don't
confirm the id exists).

### 5.5 cost-log.md (global aggregate) — decision

`cost-log.md` is a single running table across all sessions; there is no cheap
per-user split, and per-user cost accounting is out of scope. **Decision:
withhold it.** `GET /view/cost-log` becomes **Matt-only** (`user_id == "matt"`
→ render; else `404`). Per-session cost shown in a user's *own* telemetry is
fine (it's their session). This closes the "…and Matt's costs" leak the gate §4
flagged, without building per-user cost logs. *(Flagged for review — see §8.)*

---

## 6. Isolation mechanism: signatures + gate

### 6.1 Required-argument helper signatures (the guarantee)

The isolation property is that **no signature offers unscoped access.** Summary
of every changed signature:

```
# documents.py
list_documents(user_id)                          # was list_documents()
save_upload(user_id, filename, raw)              # was save_upload(filename, raw)
load_document(user_id, doc_id)                   # was load_document(doc_id)

# claims.py
generate_claims(user_id, doc_id, text)
load_fresh_claims(user_id, doc_id, text)

# sessions.py
list_study_sessions(user_id)                     # filters rows by user_id

# study_history.py
previous_session_recap(user_id, document_id, exclude_session_id)

# session_state.py
load_profile(user_id)
load_memory(user_id)
append_to_memory(user_id, transcript, summary_text)

# session_naming.py
find_analysis_path(directory, user_id, session_id)

# bot.py
build_system_instruction(user_id, study=None)    # profile/memory keyed by user_id
```

`sessions.list_study_sessions(user_id)` and
`study_history.previous_session_recap(user_id, …)` filter the ledger to rows
whose `user_id` matches — there is deliberately **no** "all sessions" entry
point. `app.get_latest_session` and `_lookup_session_doc` likewise gain
`user_id` and filter.

### 6.2 Identity resolution (FastAPI layer)

**Token registry:** `~/.voice-tutor/tokens.json`, a hand-maintained map
`{ "<token>": "<user_id>" }`. Matt mints a tester by adding a line; revokes by
removing one. (Not a secret file in the CLAUDE.md sense — it's access-control
config, safe for Claude to create/read; but it lives in `~/.voice-tutor/`,
already gitignored home state.)

**Cookie:**
- **Name:** `vt_uid`.
- **Value:** the **invite token** (opaque), *not* the raw `user_id`. Resolved
  token→`user_id` server-side on every request via the registry. Rationale:
  (a) a forged/edited cookie carrying an unknown token resolves to nothing →
  fail closed; (b) removing a token from the registry instantly locks out its
  cookie (revocation for free). No client-trusted identity.
- **Attributes:** `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=31536000`
  (1 year), `Secure` when the request is HTTPS (the tailnet `serve` origin; skip
  on `http://localhost` dev so the cookie still sets).

**`require_user` dependency** (data routes — §3.1, §3.2 and the write/offer
routes): read `vt_uid` → registry lookup → `user_id`; if missing/unknown →
`403`. Used by every `/api/*` and `/view/*` data route and by `offer()`.

**Page-serving read order** (`GET /study/` and `/study`), matching gate §3:
1. **Cookie present** → resolve `user_id`, serve `study.html`.
2. **No cookie but `?u=<token>` present and valid** → set/refresh the `vt_uid`
   cookie, then serve (redirect to a clean `/study/` URL so the token doesn't
   linger in history/referrer).
3. **Cookie present *and* `?u=` present** → the URL param refreshes the cookie
   (re-set it), then serve — re-clicking a link always self-heals.
4. **Neither, or an invalid token** → serve the **paste-your-code gate**: a
   minimal self-contained HTML page, one field ("Enter your invite link or
   code"), whose submit navigates to `/study/?u=<entered>` (reusing path 2 — no
   new endpoint). **No name-picker.** Fail closed.

### 6.3 What each formerly-leaking surface becomes

- Picker / sessions / latest / memory-view / profile-view: scoped to
  `require_user`'s `user_id`; render only that namespace.
- `cost-log` view: Matt-only (§5.5).
- Session-scoped reads (§3.2): `require_user` + path-segment ownership match →
  `404` on mismatch.
- `previous_session_recap`, profile/memory injection, claim map: keyed by the
  pipeline's server-stamped `user_id` (§5.3).

---

## 7. Contradictions / gotchas found in the code (flagged, not silently adapted)

1. **`/api/sessions/latest` is a leak the gate §4 list omits.** "View last
   session" returns the newest study session across *all* users — same class as
   `GET /api/sessions`. Must be `user_id`-scoped. (§3.1)
2. **The gate §4 surface list is incomplete.** Beyond picker / sessions / recap
   browser / `previous_session_recap` / memory+profile / uploads, the code also
   exposes: the **telemetry composite**, **artifact**, **prompt viewer**,
   **analysis viewer** (§3.2), and — undocumented anywhere — **claim sidecars**
   in the shared documents dir (§3.3, §5.2). All are covered here.
3. **`app.py` duplicates `MEMORY_PATH`/`PROFILE_PATH`** (lines 230–231)
   independently of `session_state.py`. Two definitions to keep in sync during
   the migration — the exact "writer green, reader stale" trap CLAUDE.md's
   filename-scheme lesson warns about. Fix: viewer routes call the
   `session_state` helpers; delete the app.py duplicates.
4. **`claims.py` has its own `DOCUMENTS_DIR`** (line 51), separate from
   `documents.py`. Namespacing documents per-user requires changing *both*, and
   the claim-warming endpoint (`POST /api/documents/{id}/claims/prepare`) +
   `bot`'s cache-only read must thread `user_id`. Do not miss the claims module
   when moving the documents dir.
5. **`cost-log.md` can't be per-user cheaply** — it's a global aggregate.
   Withholding (Matt-only view) is the isolation move; per-user cost logs are
   out of scope. Flagged for confirmation (§8).
6. **Regular `/chat/` mode shares memory/profile too.** Not the gate's focus,
   but the shared helpers it calls get the required-`user_id` signatures; it
   resolves to `matt` via Matt's cookie. `load_most_recent_transcript_block`
   (regular mode only) reads the newest transcript globally — with per-user
   transcript dirs (§5.4) it must take `user_id`.
7. **`prompt.txt` is written at session start** (`bot.py:753`) before
   `user_id`-namespacing would apply — ensure the write target already includes
   `<user_id>/` (the pipeline has `user_id` from §5.3 step 3, available before
   this write).

---

## 8. Test shape (gate §4: mirror-image cross-user)

Reuse the established `conftest.py` monkeypatch-the-module-constant pattern
(`docs_dir`, `cost_log_tmp`, `session_state_tmp`, `study_history_tmp`), extended
so fixtures seed **two users** (A and B) into the tmp namespaces. For each
surface, a hermetic test asserting **B sees nothing of A**:

| Surface | Mirror-image assertion |
|---|---|
| Picker | seed A's upload; `list_documents("B")` omits it (and is empty if B uploaded nothing) |
| Sessions list | seed A's session rows; `list_study_sessions("B") == []` |
| Latest session | seed A's session; `get_latest_session("B")` → 404/None |
| Recap scan | A studied doc D; `previous_session_recap("B", D, …)` → `None` |
| Profile/memory | write A's memory; `load_memory("B") == ""`, `load_profile("B") == ""` |
| Claim sidecar | warm A's claims for D; `load_fresh_claims("B", D, text)` → `None` |
| Session-scoped read | A owns session S; B's ownership-checked read of S → 404 |

Plus **positive** pins (A sees A's own data) and a **round-trip** per namespace
(write under user U's builder path → the user-scoped reader finds it), mirroring
the writer+reader-agree property CLAUDE.md requires for scheme changes.

The `app.py` routes stay untested at the transport layer (per CLAUDE.md "test
via pure helpers, not `TestClient`"); the `user_id` filtering lives in the pure
helpers and is fully covered there. `require_user` / cookie / token-registry
resolution is a small pure function (`resolve_user(cookie_value, registry) ->
user_id | None`) tested hermetically against a seeded registry dict.

---

## 9. Open questions for review

1. **cost-log view (§5.5):** Matt-only withhold — accept, or fully hide the
   `/view/cost-log` link for non-Matt (no route at all)?
2. **Artifact/transcript layout (§5.4):** path-namespace by user (chosen), vs
   flat files + ledger ownership check? Chosen for filesystem-encoded ownership;
   confirm the migration cost of moving existing flat files into `matt/` is
   acceptable.
3. **`user_id` charset:** proposed `[a-z0-9_-]`, sanitized via `Path(...).name`
   + reject others. Confirm testers get slug-y ids (`sarah`, `dev`) vs opaque.
4. **Token registry location:** `~/.voice-tutor/tokens.json` — or would you
   rather it live in the vault so minting is a vault edit?
5. **Regular `/chat/` mode (§7.6):** thread `user_id="matt"` and move on
   (chosen), or leave regular mode entirely untouched and only namespace study
   mode? (Chosen keeps one code path.)
