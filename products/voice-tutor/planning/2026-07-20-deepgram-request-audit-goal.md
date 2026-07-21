---
created_at: 2026-07-20
last_updated: 2026-07-20
type: dev-harness-goal
target_repo: /Users/mattli/development/deepgram-request-audit
target_branch: main
verifier_cmd: python3 -m unittest discover -v
status: launched (fire-and-forget, Phase 2 wall-clock defaults)
---

# Goal: Deepgram request audit — dev-harness run

## Goal
Build a standalone Python script, `deepgram_request_audit.py`, that diagnoses why a
voice app's **local cost ledger under-counts Deepgram STT time versus what Deepgram
actually bills**. It fetches Deepgram's per-request usage from the management API,
matches each billed request against local session rows by time overlap (converting
correctly between naive local time and UTC), and prints a per-session comparison of
wall-clock seconds vs. Deepgram-billed seconds plus a delta and ratio — so the size and
source of the under-count become visible.

This is a **greenfield repo**: there is NO pre-existing application code to target. The
entire deliverable is net-new — create `deepgram_request_audit.py` and its test file
from scratch. Do not import or depend on any other project's code.

## Behavior (what the script does)
1. **Fetch (network, isolated).** `GET https://api.deepgram.com/v1/projects/{project_id}/requests`,
   authenticated with header `Authorization: Token <key>`, paginating across a date range.
   CLI flags `--start` / `--end` take `YYYY-MM-DD`; when omitted, fetch the full available
   range. Pagination MUST be followed to completion (do not stop at the first page) —
   incomplete pagination is the classic cause of a false "we under-counted" reading, so
   completeness here is load-bearing.
2. **Credentials.** Read from a `KEY=VALUE` env file at `~/.voice-tutor-secrets.env`
   (keys: `DEEPGRAM_API_KEY`, `DEEPGRAM_PROJECT_ID`). Parse the file directly — do NOT
   require the variables to already be exported in the environment. Never print any
   credential value anywhere (not in output, errors, or debug lines).
3. **Local ledger.** Read a ledger at a `--ledger <path>`: JSONL where each session row
   carries ISO-8601 **naive local** timestamps `session_start` and `session_end`
   (timezone `America/Los_Angeles`) plus `session_duration_sec`.
4. **Match.** Match each Deepgram request — using its `created` timestamp and its billed
   duration in seconds from the response — to ledger sessions by time overlap, converting
   between local and UTC correctly (see timezone constraints). A request may fall fully
   inside one session, span two adjacent sessions, or fall outside every session.
5. **Report (stdout).** Emit a per-session table: session id/date, wall-clock seconds,
   summed Deepgram-billed seconds, delta, and ratio. List unmatched requests separately
   with their timestamps and durations. Print aggregate totals and an overall ratio.
   `--json` switches to machine-readable output carrying the same information.

## Verifiability constraints (what the verifier env can/can't do)
- The verifier env is **Python 3.9, stdlib only, no network, no API keys, no secrets
  file**. Tests must pass fully offline.
- The network fetcher MUST be isolated behind a **single function** so that ALL
  matching / summing / timezone logic is unit-testable against fixture JSON with no
  network. Tests exercise that logic on in-memory/fixture Deepgram responses; they never
  make an HTTP call and never read `~/.voice-tutor-secrets.env`.
- Verifier command: `python3 -m unittest discover -v`. Place tests in a file discoverable
  by that command (e.g. `test_deepgram_request_audit.py` in the repo root). The main
  module MUST be import-safe: all CLI/network/file-reading side effects live under
  `if __name__ == "__main__":` (or an explicit `main()` guarded that way), so importing
  the module in a test does nothing and touches no network/filesystem.
- **Timezone is stdlib `zoneinfo`** (`ZoneInfo("America/Los_Angeles")`), not a third-party
  package. Include at least one **DST-safe** local→UTC conversion test (e.g. a timestamp
  in Pacific Daylight Time and one in Pacific Standard Time convert with the correct
  −7h / −8h offset respectively).
- **Python-3.9 timestamp parsing caveat:** `datetime.fromisoformat` on 3.9 does NOT accept
  a trailing `Z` or a `+00:00`-style offset the way later versions do. Deepgram's `created`
  field is UTC and may carry `Z` or fractional seconds. Parse Deepgram timestamps
  tolerantly (normalize/strip `Z`, handle optional fractional seconds) so parsing works on
  Python 3.9 — do not rely on a bare `fromisoformat` for the API side.

## Hard constraints / out of scope (intent-level scope — enforced by critic + verifier + human merge, NOT graded)
- **Strictly read-only at runtime.** The script MUST never write, create, or modify any
  file — no cache, no output file, no temp file. Output goes only to stdout.
- **stdlib only.** No `requests`, no `pytz`, no third-party packages. Use `urllib.request`
  for the HTTP call and `zoneinfo` for timezones.
- Net-new files only: `deepgram_request_audit.py` and its test file. Do not add unrelated
  modules, config, or packaging.
- Do not print, log, or echo credential values.

## Definition of done (behavioral acceptance — graded)
- `python3 deepgram_request_audit.py --ledger <path> [--start YYYY-MM-DD] [--end YYYY-MM-DD] [--json]`
  runs. With credentials present it fetches (paginated) and prints the per-session table,
  the unmatched-requests list, and aggregate totals + overall ratio; `--json` prints the
  same data machine-readably.
- Local↔UTC conversion is correct across DST: naive `America/Los_Angeles` ledger
  timestamps and UTC Deepgram timestamps are compared in a single consistent frame.
- Unit tests pass offline (`python3 -m unittest discover -v`) and cover, at minimum:
  (a) a request fully inside one session, (b) a request spanning two sessions,
  (c) a request outside any session (→ unmatched), (d) an empty ledger,
  (e) a DST-safe local→UTC conversion case.
- The output makes the diagnosis legible: it states the time window AND timezone of each
  side, reflects complete pagination, and keeps units (seconds) consistent on both sides —
  so a reader can trust that a reported gap is a real under-count and not a
  window/coverage/unit artifact.
</content>
