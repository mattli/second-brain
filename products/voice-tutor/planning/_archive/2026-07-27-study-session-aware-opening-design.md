# Study Mode — Session-Aware Opening (design, 2026-07-27)

> Status: **design — ready for review, then hand off to a plan.** Brainstormed
> 2026-07-27 off the Graph Engineering test session's recap feedback. Product
> decisions are locked (see *Decisions* below); this is the spec the
> implementation plan is written from, not a plan itself. Realizes the
> **outline-opener** flagged as an open design choice in
> [[2026-07-23-study-tutor-prompt-v1]] and replaces the passive "ask what he
> wants from this session" opener that same draft flagged as cuttable. Prompt +
> a small pure module + one hot-path swap; gated behind a default-ON flag.

---

## 1. Goal

Give the study tutor a **plan at the top of the session** instead of a blank-slate
opener. Today the session kicks off with a hidden `"Say hello and introduce
yourself briefly"` turn (`bot.py:821`) and the prompt tells the tutor to *"ask what
they want to focus on"* (`bot.py:271`) — so on a fresh document, where the user
often doesn't yet know what to focus on, the tutor hands over the wheel with no
map. The felt gap from the Graph Engineering session: *"at the beginning it would
be great if the tutor had a plan."*

The tutor should open differently depending on whether this is a **first** or a
**returning** session on the same document:

- **First session** → orient, then propose starting at the foundations.
- **Returning session** → briefly recap last time, then let the user choose where
  to continue.

## 2. Behavior spec

### 2.1 First-session opener (prompt-only)

When no prior-session context is present, the tutor opens by, in one short spoken
turn (this is voice — a few sentences, not a monologue):

1. **A one-breath high-level overview** of what the document covers — a 2–4 beat
   lay-of-the-land **synthesized live from the document + the private claim map**.
   Not read from the map verbatim; no claim numbers; the map must not be felt.
2. **A proposed starting point:** start with the foundations and build up
   (*"there's a lot here — I'd suggest we start with the basics"*).
3. **An invitation to redirect** (*"…sound good, or something specific you want to
   start with?"*).

**If the user declines the proposed start,** the tutor offers **2–3 concrete
alternative areas drawn from the claim map** — the claim map is the menu — rather
than falling back to an open *"what do you want to do?"*. No generator or schema
changes: the claim map is already in the prompt; this is purely instruction text.

### 2.2 Returning-session opener (prompt + injected recap)

When prior-session context **is** present, the tutor instead:

1. Briefly recaps **what was covered last time** and **what was left open**
   (sourced from the previous session's recap — see §3.1).
2. Asks whether the user wants to **pick up where they left off** or **revisit
   something first** — and **lets the user choose**. Low-pressure; the tutor does
   not push a next step. (Chosen over "propose advancing" and "retention-check"
   variants — see *Decisions*.)
3. Follows the user's lead from there.

### 2.3 Detection is presence-based, not count-based

The tutor branches on **whether a "Where you left off" block is present in the
prompt**, nothing else. If the block is present → returning-session behavior; if
absent → first-session behavior. There is no separate "is this session N" signal
threaded into the prompt. This makes the two paths fall out of a single fact — did
we successfully load a usable prior recap — and dodges the awkward *"welcome
back… we covered nothing"* case entirely.

## 3. Component design

### 3.1 New pure module `study_history.py`

Pipecat-free, mirroring `sessions.py` / `documents.py` (module-level
`COST_LOG_JSONL_PATH` and `ARTIFACTS_DIR` constants read at **call** time so a test
can `monkeypatch.setattr` them to a tmp ledger/artifacts dir — the repo's
established hermetic-test pattern).

**Contract — "the recap of the last session, or nothing."**

```
previous_session_recap(document_id, exclude_session_id) -> dict | None
```

- Scan the cost-log for `kind == "session"`, `mode == "study"` rows with this
  `document_id`, excluding `exclude_session_id`; take the **single newest** by
  `session_start`.
- **Newest-only, no walk-back.** If that one newest prior session's recap artifact
  (`ARTIFACTS_DIR / f"{session_id}.md"`) is **missing** — still generating, too
  short to have produced one, or generation failed — **return `None`** and let the
  session open first-session style. **Never fall back to an older session's
  recap.** A stale *"last time we covered X"* is worse than no recap.
- When the newest prior recap **is** present, parse it and return the **parsed
  shape** — a compact structure holding just the **"What we covered"** and
  **"Open threads"** bullets: `{"covered": [str, ...], "open_threads": [str, ...]}`.
  The verbose **"Key points"** essay is intentionally dropped — too long for a
  spoken opener.
- If the recap is present but its markdown headers can't be parsed (unexpected
  shape), return the **fallback shape** — a distinct, named key so downstream code
  branches on shape, not on improvisation: `{"fallback_text": str}`, where the
  text is the whole recap **truncated to 1000 characters** (see §6). The two
  shapes are mutually exclusive (`covered`/`open_threads` **or** `fallback_text`,
  never both); §3.2 and the tests are written against both.
- Return `None` when there is no prior study session for the document at all.

The recap format this parses is produced by `ARTIFACT_PROMPT` (`bot.py:291`):
`## What we covered` and `## Open threads` sections of bulleted lines.

**Ledger fields — verified 2026-07-27** against the row-writing code
(`bot.py:779–807`) and real `cost-log.jsonl` rows: `kind == "session"`
(`bot.py:780`), `session_start` (ISO-8601, `bot.py:782`), `mode == "study"`
(`bot.py:806`), and `document_id` (`bot.py:807`) all exist exactly as named here.
Study rows override `session_id` to `study_meta["session_id"]` (`bot.py:805`), and
that same value is what `bot()` passes as `exclude_session_id`. Non-session cost
rows (artifact / post-session generation — `kind != "session"`, no `mode`/
`session_start`) are correctly excluded by the `kind == "session"` filter, so the
scan never mistakes one for a prior study session.

### 3.2 Wiring into `bot()` and `build_system_instruction`

- In `bot()`, when `study_meta` is present **and the flag is on**, call
  `study_history.previous_session_recap(document_id, session_id)` and pass the
  result into `study_arg` as a new optional `previously` field (alongside the
  existing `claims`).
- In `build_system_instruction(study)`, when `study["previously"]` is present,
  inject a `# Where you left off on this document` block. It renders **either**
  shape from §3.1: the parsed shape as a short "covered / still open" summary, or
  the fallback shape as the truncated recap text under the same header. Both
  produce the block whose *presence* the opener branches on (§2.3).

**Injection position — verified against the code, not assumed.** The study branch
assembles parts in this order (`bot.py:506–522`):

```
STUDY_BASE_INSTRUCTION
  (+ "## About the person you're talking to"  — only if profile non-empty)
  (+ "# Background — Matt's prior topics …"    — only if memory non-empty)
## Document: {title}
  (+ "## Claim map (private …)"                — only if claims present)
BREVITY_REMINDER
STUDY_REMINDER
```

Both the profile and memory blocks are **conditional** (`if profile:` / `if
memory:` — memory *is* loaded in study mode today, contrary to the original
premise, but may be empty). The only **unconditional** anchor is the `## Document:`
block. So the "Where you left off" block is injected **immediately before
`## Document:`** (i.e. after profile/memory when they happen to be present, before
the document either way). This deliberately leaves the **claim-map position (after
the document, before both reminders) untouched**, so the pinning test in
`tests/test_study_claim_steering.py` stays green.

### 3.3 Opening-behavior text — edit `STUDY_BASE_INSTRUCTION`

Replace the passive line (*"ask what they want to focus on"*) with an **"Opening
the session"** section encoding §2.1 and §2.2:

- First turn: give a one-breath overview synthesized from the document + claim map,
  then propose starting with the foundations, then invite redirect.
- If the user declines the proposed start: offer 2–3 alternatives **drawn from the
  claim map**, not an open-ended question.
- If a `# Where you left off` block is present: instead recap covered + open
  threads, then ask whether to pick up there or revisit — let the user choose.
- Either path: a few sentences (voice), then follow the user's lead.

This is a wording change to a hashed static string, so it produces a **new
`static_prompt_hash`** — intended and traceable per ledger row.

### 3.4 Kickoff-message swap — `bot.py:821` (study mode only)

The current hidden opener `"Say hello and introduce yourself briefly"` actively
pushes a generic greeting and fights the plan. Extract it to module constants and,
**for study mode only** (and only when the flag is on), use a study kickoff that
triggers the opening section — e.g. `"Begin the session: greet the user and open
per your opening instructions."` Regular (non-study) mode keeps the existing
kickoff verbatim.

### 3.5 Attribution — fold the study kickoff into the hash (chosen)

`static_prompt_hash(study)` (`bot.py:547`) currently hashes only
`STUDY_BASE_INSTRUCTION + BREVITY_REMINDER + STUDY_REMINDER`; the kickoff message
is added later as a context message in `bot()` and is **invisible** to both the
hash and the ledger's `prompt_hash` (`bot.py:801`). Left alone, two materially
different opening behaviors could share a `prompt_hash`.

**Chosen fix: extend the hash input with the study kickoff constant *only when the
flag is on*** — a **conditional** extension, not an unconditional one — rather than
adding a separate flag column to every ledger row.

**Flag-off must preserve the current hash byte-for-byte.** Flag-off behavior is
identical to what produced every historical study row (old base + reminders + old
kickoff), so its `prompt_hash` **must equal the existing pre-change hash**:
`hash(STUDY_BASE_INSTRUCTION + BREVITY_REMINDER + STUDY_REMINDER)`, with the
kickoff **excluded**, exactly as today (`bot.py:547`). If flag-off instead hashed
an extended input, it would mint a brand-new hash for byte-identical behavior,
splitting one behavior across two hashes at the change boundary and breaking
before/after comparisons against historical sessions. So:

- **Flag OFF** → hash input = `STUDY_BASE + BREVITY + STUDY` (unchanged; matches
  historical rows exactly — §3.6's "exact revert" holds down to the ledger
  signature).
- **Flag ON** → hash input = `STUDY_BASE(new) + BREVITY + STUDY + STUDY_KICKOFF`
  (the new opening wording *and* the study kickoff constant that triggers it).

This still yields **distinct hashes per flag state** (the goal — flag-on sessions
are attributable and separable from flag-off ones), while making the hash
self-describing for the new behavior and keeping flag-off continuous with history.
Implementation must therefore make the kickoff term **conditional inside
`static_prompt_hash`**, gated on the same flag, not an unconditional addition to
the hash function. (Preferred over stamping the flag into each row, which would add
a ledger field and still leave the kickoff itself unhashed.)

Requires extracting the kickoff to a module constant so the hash function can read
the same string that runs.

### 3.6 Feature flag — `VOICE_TUTOR_SESSION_OPENING` (default ON)

Mirror the repo's established default-ON idiom (`bot.py:81–82`):

```python
_SESSION_OPENING_DISABLE_VALUES = ("0", "false", "no", "off", "disable", "disabled")
SESSION_OPENING = os.getenv("VOICE_TUTOR_SESSION_OPENING", "").strip().lower() \
    not in _SESSION_OPENING_DISABLE_VALUES
```

Unset/empty → **ON**. Any of `0/false/no/off/disable/disabled` (case-insensitive) →
**OFF**. When **off**, all three surfaces revert to exact current behavior: the old
kickoff, the old `STUDY_BASE_INSTRUCTION` wording (no "Opening the session"
section), and **no** "Where you left off" block injected (and `previous_session_recap`
is not called). This is the no-rebuild revert for a hot-path prompt change, per the
project's "make risky changes easy to revert" rule. Per §3.5 the flag-off hash is
**byte-identical to the pre-change historical hash** (revert is exact down to the
ledger signature), while flag-on carries a distinct hash — so sessions stay
attributable *and* flag-off stays continuous with history.

## 4. Tests (hermetic, pure-helper layer)

Per this repo's convention, the FastAPI route / `study.html` fetch stay untested at
the transport layer; the logic is covered at the pure-helper layer.

**`study_history.previous_session_recap`** (monkeypatched tmp ledger + artifacts):
- Returning session (newest prior session has a recap) → returns the parsed shape
  `{"covered": [...], "open_threads": [...]}`.
- First session (no prior study session for this doc) → `None`.
- **Prior session exists but its recap artifact is missing → `None`, with no
  walk-back** to an older session that *does* have a recap (the newest-only rule).
- Excludes `exclude_session_id` (the current session's own row).
- Recap-parse fallback: recap present but headers unparseable → the fallback shape
  `{"fallback_text": ...}`, text truncated to **1000 chars** (not a crash, not the
  parsed shape).

**`bot.build_system_instruction`** (via the existing `imported_bot` +
`session_state_tmp` fixtures):
- `previously` present → "Where you left off" block appears **before the
  `## Document:` block** and **before the claim map**; claim map stays after the
  document and before both reminders (extend, don't replace, the existing position
  assertions).
- `previously` absent → block omitted; document + reminders still present.

**Flag off** → opening section absent from `STUDY_BASE_INSTRUCTION` output and no
"Where you left off" block, even when a prior recap exists.

**`static_prompt_hash`** → flag-on and flag-off study mode differ; **flag-off
equals the pre-change hash** (`hash(STUDY_BASE + BREVITY + STUDY)`, kickoff
excluded — pin this exact value so a regression that folds the kickoff in
unconditionally is caught); flag-on includes the study kickoff constant.

## 5. Out of scope

Cross-session claim-coverage tracking, retention-check openers, and multi-session
synthesis are deliberately not in this change. The recap is the coverage memory.

## 6. Decisions (locked this session)

- **Session-aware, not always-basics.** First vs. returning sessions open
  differently; the distinction is real (presence of a loadable prior recap), not a
  prompt-only pretense.
- **Returning open = recap + offer the choice.** Neutral and user-steered; not
  "propose advancing," not a retention quiz on re-entry.
- **Coverage source = the previous session's recap artifact**, newest-only. No new
  coverage-tracking store.
- **Attribution via hash, not a ledger column** — flag-on extends the hash input,
  flag-off preserves the historical hash byte-for-byte (§3.5).
- **Flag default ON, exact revert when off** (§3.6).
- **Opener wording is not specced further.** Tune by ear post-ship, **one change
  per hash** (so each wording is attributable), toward the fuller target in
  [[2026-07-23-study-tutor-prompt-v1]]. The plan ships a reasonable first wording;
  iteration is a prompt-only follow-on, not part of this change.
- **Recap-parse fallback truncates at 1000 characters** (§3.1). It feeds a spoken
  few-sentence opener; anything that can't compress from 1000 chars is a prompt
  problem, not a truncation problem.
- **The returning path shows the recap alone — no overview.** The recap *is* the
  orientation for a returning user; stacking overview + recap + choice would
  violate §2.1's own brevity rule. The one-breath overview (§2.1) fires on the
  **first-session path only**. If returning openers later feel unmoored, that's a
  one-line prompt addition under a new hash — explicitly deferred, not designed in
  now.
