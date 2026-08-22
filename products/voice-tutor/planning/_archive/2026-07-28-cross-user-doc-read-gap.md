---
title: Cross-User Document Read via Crafted doc_id — fix-session note
date: 2026-07-28
status: Finding note for a scheduled fix (hard pre-tester gate). Not yet fixed.
severity: High (cross-user data read) — pre-existing, predates the demo-docs work
---

# Cross-User Document Read via Crafted `doc_id`

Hand-off note for tomorrow's fix session. Surfaced by the independent whole-branch
review of the demo-docs run ([[2026-07-28-demo-docs-harness-goal]], branch
`run-ms5dcz2z`, now merged to `main`). The gap is **pre-existing** — it is not
introduced by the demo-docs work, and the demo-docs branch was correctly forbidden
to touch the file it lives in. Backlog item: "Cross-user document read via crafted
doc id" (2026-07-28), a **hard gate — closed before the first invite link goes out.**

## What the bug is

A logged-in user can read **another user's document text** by supplying a crafted
`document_id` that escapes their own namespace.

- The document loader builds the path by string-joining the id:
  `documents.py` `_load_from_dir` does roughly `dir / f"{doc_id}.txt"`.
- So a `document_id` of the shape **`../<other_user_id>/<their_doc_uuid>`** resolves
  out of the caller's `documents/<user_id>/` directory and into another user's
  directory — returning that user's document text.
- The id is attacker-controllable on the read paths below because it comes from the
  **client** (the WebRTC offer body) or from a **stored session log** that was
  written from a client value.

## Affected paths (as of the 2026-07-29-merge review — verify line numbers before editing)

Entry points that call `load_document(user_id, document_id)` (or the claims path)
with an **unsanitized** `document_id`:

- `bot.py:~709` — document id taken from the WebRTC/pipeline body.
- `app.py:~311` and `app.py:~344` — read paths passing the client/stored id straight through.
- `sessions.py:~75` — id read back from a stored session log.

Root mechanism is shared: `_load_from_dir` (and the claims `_claims_path`) trust the
id as a path component.

## Why the UPLOAD / warm path is already safe (don't "fix" what isn't broken)

- **`save_upload` never uses `doc_id` for the directory.** It writes only under
  `user_dir(user_id)`; the reserved-name guard on `user_id` (see below) plus the
  fact that the id never selects the directory means an upload cannot land in
  another user's dir or in `_shared/`. The demo-docs review pinned this
  (`test_save_upload_never_writes_to_shared`).
- **The warm/claims-prepare route sanitizes.** `prepare_claims` does
  `safe_id = Path(doc_id).name` (`app.py:~119`) before touching the filesystem, which
  collapses `../x/y` to `y` — so that route is contained. The vulnerable read paths
  are the ones that skip this step.
- **`user_id` itself is guarded.** `identity.sanitize_user_id` rejects `_shared` and
  anything with `/ . ` uppercase/whitespace (charset `[a-z0-9_-]+`), so the *user*
  half of the path can't be spoofed. The gap is purely the **document_id** half on
  the read paths.

## Suggested shape of the fix (for tomorrow — not tonight)

- Sanitize `document_id` to a single path component at the **helper boundary**, so
  containment doesn't depend on every caller remembering to. Options: apply
  `Path(doc_id).name` (or reject any id containing `/`, `..`, or a path separator)
  inside `load_document` / `_load_from_dir` and the claims path — one layer that all
  read paths inherit. This is the defense-in-depth the review flagged as "one layer
  deep" today (`user_dir` / `_claims_path` / `write_claims` don't independently
  reject a `../`-bearing id).
- Add **regression tests** that pin containment at the helper: `load_document(u,
  "../other/uuid")` and `generate_claims(u, "../other/uuid", …)` must not read/write
  outside `documents/<u>/`. The demo-docs suite deliberately did NOT pin this (the
  guard lived upstream at the route), so it's a genuine coverage gap to close.
- Confirm the sanitize doesn't break the **shared-namespace resolution** just merged:
  a legitimate shared doc is resolved by *filename within* `_shared/`, not by a
  slash-bearing id, so `Path(name).name` leaves it intact — but verify against the
  new `test_*shared*` tests.

## Process (per the blast-radius rule)

Security seam → **one fresh whole-branch reviewer** on a separate fix branch, same as
the demo-docs run got. Do not self-approve the patch. Closed **before any tester
invite link is sent**.

## Provenance
- Found: independent Opus whole-branch review of `run-ms5dcz2z`, 2026-07-28 (evening, local).
- Related: [[2026-07-28-identity-and-isolation-spec]] (the isolation model this protects),
  [[2026-07-27-validation-gate-and-preshare-build]] (the pre-share gate this blocks).
