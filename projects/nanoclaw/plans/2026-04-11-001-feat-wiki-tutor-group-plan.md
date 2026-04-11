---
title: "feat: Wiki Tutor Group"
type: feat
status: active
date: 2026-04-11
---

# feat: Wiki Tutor Group

## Overview

Add a new NanoClaw group, `wiki-tutor`, that acts as a chat-based reference librarian for the user's personal Readwise-compiled wiki at `~/second-brain/projects/intelligence/wiki/`. The group is accessed via a dedicated Telegram chat. Interaction is user-initiated and menu-first: the tutor starts from `wiki/INDEX.md`, walks the user down the category → page tree, and serves a short "nugget" (2–4 sentences of the single most interesting claim) from each page. The user then drives tempo and direction conversationally — ask for more detail, move sideways to a connected page, pick a new category, or stop.

No code changes. This is a config and filesystem change patterned exactly on the existing `readwise-wiki` group, plus a new per-group `CLAUDE.md` that defines the librarian persona.

## Problem Frame

The user has built a wiki compiled by an agent from Readwise saves he mostly hasn't read. The wiki knows more about its topics than he does. Reading the pages would feel like more homework, which is exactly the problem that caused the backlog in the first place. The goal is to get learning value from the wiki without turning it into yet another reading queue.

Over multiple design iterations, the following shape converged:

- **User-initiated, not pushed.** No scheduled task, no daily notifications. The user opens the group when he wants to learn something.
- **Menu before content.** First response is always the category tree from `wiki/INDEX.md`, not a lecture.
- **Nugget first, elaboration on demand.** First contact with any page is 2–4 sentences of the *one* most interesting claim — not a summary, not a quiz question.
- **User steers.** The tutor offers 2–3 natural next moves in prose at the end of each turn but never demands engagement and never evaluates the user.
- **No testing, no scoring, no learning log.** This is a reference-librarian posture, not a teacher posture. The only state is "what page are we looking at" so sessions can resume.

The underlying insight from the conversation that drove this design: a quiz-shaped tutor would feel like a daily failure and get abandoned; a librarian-shaped one meets adult self-directed learning behavior where it actually lives.

## Requirements Trace

- **R1.** User can send any message in the `wiki-tutor` Telegram chat and the tutor responds — no `@Second Brain` prefix required on each turn.
- **R2.** On session start (or when the user asks for the menu), the tutor reads `wiki/INDEX.md` and responds with the five top-level category folders and their page counts.
- **R3.** User can drill down: category → page list → individual page nugget, with each step a small, scannable response.
- **R4.** First contact with any page is a 2–4 sentence "nugget" pulled from the most surprising or load-bearing claim on the page — **not** a TLDR, summary, or section dump.
- **R5.** At the end of each tutor message, 2–3 natural follow-up moves are offered in prose (e.g., "I can go deeper on the LeCun argument, or tell you who else is working on this"). Not as a numbered menu. Not as questions the user must answer.
- **R6.** The tutor never quizzes, scores, tracks mastery, or tells the user what they "should" know.
- **R7.** The wiki is mounted **read-only**. The tutor can read every page but cannot write to the wiki under any circumstance.
- **R8.** Conversation state persists across sessions via the existing NanoClaw session-id mechanism. If the user returns the next day and sends a message, the tutor picks up where the previous conversation left off.
- **R9.** Nothing scheduled. Nothing pushed. No cron, no task-scheduler entry.
- **R10.** Telegram chat is dedicated to the tutor — not the user's main channel, not shared with any other group — so tutor conversations don't pollute other contexts.

## Scope Boundaries

**In scope:**
- A new `groups/wiki-tutor/` directory with `CLAUDE.md` defining the librarian persona and flow
- A new Telegram chat registered as a NanoClaw group with the wiki mounted read-only
- A mount-allowlist update if the wiki path is not already covered
- Smoke testing the menu → category → page → nugget → continuation flow end-to-end

**Out of scope (explicit non-goals):**
- No scheduled task or push notification ("daily nugget," etc.) — explicitly rejected during brainstorming
- No quiz, spaced repetition, mastery tracking, or learning log
- No changes to the Readwise wiki compiler (`readwise-wiki` group). The tutor is read-only; what's in the wiki is what the tutor has
- No changes to `wiki/INDEX.md` structure. The tutor uses whatever's there
- No new NanoClaw channels, credentials, or code-level features
- No multi-folder split into multiple tutor agents (one tutor, whole wiki mounted — rejected as arbitrary partitioning during brainstorming)
- No cross-linking back into the daily briefing (was considered as "option 4," rejected in favor of direct librarian access)
- No changes to `requiresTrigger` defaults or global trigger behavior — only this one group opts out
- No attempt to teach from the original Readwise sources. The tutor teaches from the compiled wiki pages, the same way a textbook teaches from its own pages

## Context & Research

### Relevant Code and Patterns

- **Existing reference group:** `groups/readwise-wiki/` — follow its shape exactly for directory layout, `CLAUDE.md` placement, and DB `containerConfig` schema. This group already has the intelligence folder mounted, which proves the mount path works.
- **Group registration flow:** `src/index.ts:98-120` (`registerGroup`) and `src/db.ts:582-599` (`setRegisteredGroup`) — the registration path that the main-channel IPC handler invokes.
- **Group folder validation:** `src/group-folder.ts:5` — folder name must match `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`. `wiki-tutor` passes.
- **Container mount logic:** `src/container-runner.ts:268-270` — reads `readonly` flag from each `additionalMounts` entry and passes platform-specific read-only args. Already wired; no code change.
- **Mount allowlist enforcement:** `src/mount-security.ts:54-119` — validates every `additionalMounts` entry against `~/.config/nanoclaw/mount-allowlist.json` at spawn time. This is where misconfiguration fails loudly.
- **Telegram JID → group resolution:** `src/channels/telegram.ts:131-149` — inbound messages from unregistered chats are silently ignored. Registration is the only switch that turns the tutor on.
- **Trigger behavior:** `src/index.ts:173-181, 414-420` — `requiresTrigger: false` causes every inbound message in the group to wake the agent (rather than accumulating until `@Second Brain` appears). This is the lever for "conversational" vs "command-style" interaction. The trigger name itself is resolved at runtime from `ASSISTANT_NAME` in `.env` (currently `"Second Brain"`) via `src/config.ts:11-12, 65-66`.
- **Per-group CLAUDE.md reference:** `groups/readwise-wiki/CLAUDE.md` (3.8 KB) is the working example of a task-specific group persona. `groups/main/nanoclaw-admin.md` is the main channel's equivalent.
- **Built-in session persistence:** `src/db.ts:72-74, 516-527` (sessions table) and `src/index.ts:275-276, 329-332` — NanoClaw automatically persists `session_id` per group across agent runs, which is the native mechanism for conversation continuity. No separate `session.md` needed for continuation.
- **Register-group IPC:** already implemented (`src/ipc.ts`), callable from the main channel by asking the main-channel agent to register the new group. No code change.

### Institutional Learnings

- **CLAUDE.md says:** "Never pass third-party API keys directly into containers." The tutor group involves no third-party keys — only the existing Anthropic key already used by all groups. No credential-proxy work required.
- **CLAUDE.md says:** "Any changes to `src/` must be committed before the session ends." This plan explicitly does not change `src/`, so that caveat does not apply here. Only `groups/wiki-tutor/` files and a mount-allowlist entry will be created.
- **CLAUDE.md says:** "On first spawn, each group gets a copy of `container/agent-runner/src/` at `data/sessions/<group>/agent-runner-src/`. This copy is NOT updated automatically." New groups inherit whatever agent-runner source is canonical at creation time — fine for a fresh group, no cleanup needed.
- **NanoClaw philosophy:** "Customization = code changes" is the general principle, but also "Skills over features." This group is a *content* customization, not a code customization — the minimal shape matches the project's preference for small, understandable changes.

## Key Technical Decisions

- **Pattern match on `readwise-wiki` exactly.** Same directory shape (`groups/wiki-tutor/CLAUDE.md` + `logs/` + `conversations/`), same DB registration schema, same mount style. *Rationale:* `readwise-wiki` is proven, actively used, and already has the intelligence folder mounted. Divergence without a reason is risk. Using the identical pattern also means there's nothing new for the implementer to invent.

- **`requiresTrigger: false` for this group only.** Every message in the tutor chat is a conversational turn — no `@Second Brain` prefix on each message. *Rationale:* The librarian UX is a back-and-forth dialogue. Forcing `@Second Brain` on each turn would make the flow feel like a command line, not a conversation, and would violate R1. The token cost tradeoff is acceptable because (a) the user opts into these sessions deliberately, (b) sessions are short (5–15 turns), and (c) this group has no passive-listener use case where accumulating context without response would matter. This is a per-group opt-out, not a global change.

- **Mount the wiki read-only at `/workspace/extra/wiki`.** Use `{"hostPath": "~/second-brain/projects/intelligence/wiki", "containerPath": "wiki", "readonly": true}`. *Rationale:* The tutor is explicitly a read-only consumer (R7). Making this a mount-level guarantee rather than a prompt instruction removes an entire class of failure (prompt drift causing accidental writes). Mount allowlist already supports the `readonly` flag — this is a configuration choice, not a code change.

- **Scope the mount to `wiki/` specifically, not the whole `intelligence/` folder.** The existing `readwise-wiki` group mounts `intelligence/` because the compiler writes briefings, manifests, and state outside of `wiki/`. The tutor needs *only* the wiki, and giving it less is strictly better for safety and for context economy. *Rationale:* Least privilege. Also keeps the tutor from accidentally reading briefings, manifests, or other compiler state that would confuse its librarian posture.

- **Use the built-in `session_id` for conversation continuity — no custom `session.md` file.** NanoClaw already persists a session ID per group across runs, which means the Claude Agent SDK picks up conversation history automatically. *Rationale:* A custom `session.md` would be a second, parallel state mechanism with nothing to add. Session-id continuation is the native pattern, already working for other groups. Less state is better state.

- **Model choice: `opus`, matching other groups.** *Rationale:* Consistency with `readwise-wiki` and other intelligence groups. The tutor's prompt is small (one CLAUDE.md plus the loaded wiki pages) so per-turn cost is low even on opus. If cost proves problematic after real usage, switching to `sonnet` is a single DB field update — revisit with data.

- **Menu-first flow is enforced by the persona, not by code.** The `CLAUDE.md` instructs the tutor to always start from `wiki/INDEX.md`, always present categories before pages, always serve a nugget not a summary, always offer 2–3 prose follow-ups. There is no state machine, no structured-output schema, no router. *Rationale:* The entire point of NanoClaw's small-surface-area design is that prompts carry the behavior. A state machine here would be over-engineering for a single conversational agent.

- **New dedicated Telegram chat, not reuse of an existing one.** The user creates a new empty Telegram group, adds the bot, captures the chat ID via `/chatid`, and registers it. *Rationale:* R10 — tutor conversations should be isolated from other contexts. Reusing an existing chat would mix tutor output with whatever else that chat is for.

- **Registration happens via the main channel, not by hand-editing SQLite.** Ask the main-channel agent to register the new group via its admin IPC path. *Rationale:* Matches how every other NanoClaw group has been added — there's already a working path for this, no need for a one-off SQL session that could corrupt `registered_groups`.

## Open Questions

### Resolved During Planning

- **Does the tutor need code changes?** No. All required infrastructure (mounts, read-only flag, per-group CLAUDE.md, session-id persistence, trigger override, Telegram routing) already exists. This is configuration only. (Resolved via repo research.)
- **Should this be per-folder (5 tutors) or one unified tutor?** One tutor with the whole wiki mounted. Per-folder splitting was rejected during brainstorming as arbitrary — 20 pages across 5 folders is too small to warrant partitioning, and wiki folders are a filing system rather than a curriculum. (Resolved during conversation.)
- **Should the tutor push daily nuggets on a schedule?** No. Explicitly rejected — feels quiz-adjacent, creates a failure-streak feeling, violates R9. (Resolved during conversation.)
- **Should trigger be `@Second Brain` or no trigger?** No trigger for this group specifically. See Key Technical Decisions. (Resolved during planning.)
- **Where does session state live?** Native `session_id` persistence in the SQLite sessions table. No custom files. (Resolved via repo research.)
- **Read-only vs read-write mount for the wiki?** Read-only. The tutor is explicitly not an editor. (Resolved during planning.)

### Deferred to Implementation

- **Telegram chat ID.** Can only be captured after the user creates the new Telegram chat, adds the bot, and runs `/chatid`. Recorded at Unit 3 execution time.
- **Exact wording of the librarian persona.** The CLAUDE.md content needs iteration. The first draft should capture menu-first, nugget-first, prose-follow-ups, no-quizzing — but wording will almost certainly need tuning after the first real session. Plan to revisit after 3–5 sessions of actual use.
- **Whether `wiki/` needs a separate mount-allowlist entry.** The existing `readwise-wiki` group mounts `intelligence/` as read-write. Whether the allowlist already covers `intelligence/wiki/` as a distinct entry, or whether the existing parent entry is sufficient, will be clear when running the allowlist validator. If a new entry is needed, add it at Unit 1 execution time.
- **Whether follow-up moves should be offered as bullet points or inline prose.** Directional guidance says prose. May switch to bullets if prose turns out to read as too dense in Telegram's rendering. Revisit after first real session.

## Implementation Units

- [ ] **Unit 1: Mount allowlist verification**

**Goal:** Ensure the host path `~/second-brain/projects/intelligence/wiki` is permitted by the NanoClaw mount allowlist, so the registered group can spawn containers without failing validation.

**Requirements:** R7

**Dependencies:** None

**Files:**
- Inspect: `~/.config/nanoclaw/mount-allowlist.json`
- Possibly modify: `~/.config/nanoclaw/mount-allowlist.json`

**Approach:**
- Read the existing allowlist file.
- Confirm whether `~/second-brain/projects/intelligence` (parent of the wiki) is already listed as an allowed root, which would implicitly cover `wiki/`, or whether a more specific entry is needed.
- If not covered, add a new entry permitting `~/second-brain/projects/intelligence/wiki` (read-only mounts permitted).
- Do not remove or relax any existing entries.

**Patterns to follow:**
- The existing entry that permits `readwise-wiki` to mount `~/second-brain/projects/intelligence` — mirror its structure.
- `src/mount-security.ts:54-119` for how validation actually runs, if something behaves unexpectedly.

**Test scenarios:**
- *Happy path:* After the allowlist is saved, running the mount validator against the intended mount spec (`{hostPath: ~/second-brain/projects/intelligence/wiki, containerPath: wiki, readonly: true}`) returns success.
- *Edge case:* The existing allowlist already covers the path implicitly via a parent entry — in which case no change is needed and the unit is still satisfied.
- *Error path:* If the validator rejects the mount, the error message clearly identifies which allowlist entry is missing, not just a generic failure. (If not, flag this as a follow-up — but don't fix it in this unit.)

**Verification:**
- `~/.config/nanoclaw/mount-allowlist.json` either already permits or newly permits the wiki mount.
- The file is still valid JSON after editing.
- No unrelated entries were modified.

---

- [ ] **Unit 2: Create `groups/wiki-tutor/` directory and `CLAUDE.md`**

**Goal:** Create the group directory, its logs/conversations subdirectories, and the `CLAUDE.md` that defines the librarian persona and flow.

**Requirements:** R2, R3, R4, R5, R6

**Dependencies:** None

**Files:**
- Create: `groups/wiki-tutor/CLAUDE.md`
- Create: `groups/wiki-tutor/logs/` (empty)
- Create: `groups/wiki-tutor/conversations/` (empty)

**Approach:**
- Mirror the directory layout of `groups/readwise-wiki/` exactly (CLAUDE.md at the root, `logs/` and `conversations/` alongside).
- The `CLAUDE.md` defines a single-role persona: **reference librarian for the user's personal wiki**. It must specify:
  - **Identity:** "You are the wiki tutor, a reference librarian for Matt's personal knowledge wiki at `/workspace/extra/wiki/`."
  - **Opening move:** On the first turn of any session, always read `/workspace/extra/wiki/INDEX.md` and present the five top-level categories (with page counts) as a short menu. No preamble, no "hi how can I help" filler.
  - **Drill-down flow:** When the user picks a category (by name or number), list the pages in that category with their one-line summaries from INDEX.md. When the user picks a page, read that page and serve a **nugget**: 2–4 sentences capturing the single most surprising or load-bearing claim from the page. Not a TLDR, not a summary, not a section dump.
  - **Nugget sourcing:** The nugget should be the claim a smart friend would mention at dinner — the sharpest or most counterintuitive piece, not an overview. If the page genuinely has no single sharp claim, pick the one most specific factual detail and present it.
  - **Continuation:** After each nugget, offer 2–3 natural next moves in **prose** at the end of the message (e.g., "I can go deeper on the LeCun argument, or tell you who's working on the other side of this, or we can pick a different page"). Not as a numbered menu. Not as questions that demand an answer.
  - **Never do:** quiz the user, test them, score them, track mastery, tell them what they "should" know, create a learning log, push content unsolicited, or write to the wiki.
  - **Always do:** stay in librarian posture — reactive, helpful, concise, never evaluative. Let the user drive tempo. If they go silent, the conversation ends; no nagging.
  - **Resumption:** If the session is resumed (the SDK restores prior context), pick up where the conversation left off. If the user's first new message is ambiguous ("continue", "more", "yes"), interpret it against the most recent turn.
  - **Read-only awareness:** The wiki is mounted read-only. Do not attempt file writes to `/workspace/extra/wiki/`. If the user asks to update a page, explain that the tutor is read-only and suggest they edit in Obsidian (or ask the `readwise-wiki` compiler to regenerate on the next run).
- Draft the CLAUDE.md conservatively on the first pass — better to understate than to ship a wordy persona that wastes context on every turn. Target: under 2 KB.

**Patterns to follow:**
- `groups/readwise-wiki/CLAUDE.md` for length, structural shape, and tone calibration.
- `groups/main/nanoclaw-admin.md` as a second reference point for how these persona files read.

**Test scenarios:**
- *Happy path (dry read):* After writing the file, re-read it and confirm every requirement (R2–R6) is explicitly addressed somewhere in the prose. Use a self-check: "If I forgot R4, would the tutor still serve nuggets, or would it default to TLDRs?"
- *Length check:* File is under 2 KB. If larger, the persona is probably over-specified.
- *Structural match:* Directory layout matches `readwise-wiki` — no extra files, no missing expected subdirectories.
- *Placeholder test for flow:* Trace through a mock conversation in your head using only what's in the CLAUDE.md: user sends "start" → does the instructions tell the tutor what to do? User sends "1" → does it tell the tutor how to interpret that? User sends "world models" → does it know to serve a nugget rather than a summary?

**Verification:**
- `groups/wiki-tutor/CLAUDE.md` exists, is under 2 KB, and explicitly addresses menu-first, nugget-first, prose follow-ups, no-quizzing, and read-only awareness.
- `groups/wiki-tutor/logs/` and `groups/wiki-tutor/conversations/` exist as empty directories.
- The directory structure visually matches `groups/readwise-wiki/` (ignoring the specific markdown files inside).

---

- [ ] **Unit 3: Create and capture the Telegram chat**

**Goal:** Create a dedicated Telegram chat for the wiki tutor, add the NanoClaw bot to it, and capture the chat ID for registration.

**Requirements:** R10

**Dependencies:** None (can run in parallel with Units 1 and 2; must complete before Unit 4)

**Files:**
- None modified on disk. This unit produces a piece of data (the chat ID) used in Unit 4.

**Approach:**
- Create a new Telegram group chat (or a new one-on-one chat if the user prefers — either works; a group is recommended so additional people could be added later if ever useful, but not required).
- Name it something memorable like "Wiki Tutor" so it's findable in the Telegram chat list.
- Add the NanoClaw Telegram bot to the chat.
- Send `/chatid` in the chat. The bot responds with `tg:<numeric chat id>`.
- Record that chat ID for Unit 4.

**Patterns to follow:**
- The `/chatid` handler at `src/channels/telegram.ts:59-71` is the authoritative source of the ID — do not hand-construct one.
- Any other existing group (e.g., the main channel's Telegram chat) was set up this way; this is just the standard path.

**Test scenarios:**
- *Happy path:* Bot responds to `/chatid` with `tg:<id>` within a second or two.
- *Edge case:* Bot does not respond — indicates either the bot isn't in the chat yet or the Telegram channel isn't running. Check NanoClaw logs (`cat ~/nanoclaw/logs/nanoclaw.log`) for `TelegramChannel` errors. This is diagnostic, not a reason to proceed.
- *Verification of isolation:* The new chat is empty of prior history and is not the same chat as the main channel or any other group. (If by mistake the bot is added to an existing chat, unregistered messages will be silently ignored per `src/channels/telegram.ts:131-138`, so the blast radius of a mistake here is low — but noticing early saves confusion.)

**Verification:**
- A new Telegram chat exists, dedicated to the wiki tutor.
- The bot is a member of the chat.
- `tg:<chat id>` is recorded for Unit 4.

---

- [ ] **Unit 4: Register the group via the main channel**

**Goal:** Tell NanoClaw that the new chat ID is a registered group named `wiki-tutor`, with the wiki mounted read-only and trigger-free conversational behavior.

**Requirements:** R1, R7, R8, R9, R10

**Dependencies:** Unit 1 (allowlist), Unit 2 (group directory), Unit 3 (chat ID)

**Files:**
- Modified: `store/messages.db` — one new row in the `registered_groups` table, written via the existing `register_group` IPC path (not by hand).

**Approach:**
- From the user's main channel (self-chat), ask the main-channel agent to register the new group. The registration must specify:
  - `jid`: `tg:<chat id from Unit 3>`
  - `name`: `"Wiki Tutor"` (human-readable)
  - `folder`: `"wiki-tutor"` (must match the directory created in Unit 2; validated by `src/group-folder.ts:5`)
  - `trigger`: `"@Second Brain"` (unused when `requiresTrigger: false`, but set for consistency with other groups in case the flag is ever flipped)
  - `requiresTrigger`: `false` — this is the key deviation from defaults; call it out explicitly in the registration request so the main-channel agent doesn't silently use the default
  - `isMain`: `false`
  - `containerConfig`:
    - `additionalMounts`:
      - `{hostPath: "~/second-brain/projects/intelligence/wiki", containerPath: "wiki", readonly: true}`
    - `model`: `"opus"` (matches other intelligence groups; revisit with data if cost is an issue)
    - `timeout`: reasonable conversational default — match whatever the main channel or readwise-wiki uses rather than inventing a new value
- Do **not** hand-edit `store/messages.db`. Use the IPC path that's already in place (`src/ipc.ts`, `registerGroup` in `src/index.ts:98-120`). This ensures validation runs and the `groups/wiki-tutor/logs/` directory gets auto-created if missed in Unit 2.

**Patterns to follow:**
- Existing `registered_groups` rows for `readwise-wiki` and other groups — look at their `containerConfig` JSON as the shape reference before composing the registration.
- The main-channel admin flow that was used to register every existing group is the same one to use here; no new path.

**Test scenarios:**
- *Happy path:* After registration, spawning a container for `wiki-tutor` (e.g., by sending a message in the Telegram chat) succeeds. Mount validation passes. The agent starts. The `CLAUDE.md` is visible inside the container. `/workspace/extra/wiki/INDEX.md` is readable.
- *Edge case — read-only enforcement:* Inside a running container, attempting to write to `/workspace/extra/wiki/test.md` fails with a read-only filesystem error. This is the critical check for R7 and must actually be verified, not assumed.
- *Edge case — trigger-free behavior:* A plain message like "hi" (no `@Second Brain`) in the tutor chat wakes the agent and triggers a response. Confirms R1 and validates `requiresTrigger: false` took effect.
- *Edge case — session continuity:* Send a message, get a response, wait several minutes (or come back the next day), send another message. The second response references the earlier conversation. Confirms R8.
- *Error path — wrong folder name:* If the folder name in the registration doesn't match `groups/wiki-tutor/`, the group registers but the agent has no `CLAUDE.md` to load. Catch this by reading back the folder field after registration.
- *Error path — wrong chat ID:* If the chat ID is off by one, the bot silently ignores messages in the intended chat and (worse) might wake up in some other chat. Catch this by sending a test message from the real chat and confirming it triggers processing in the logs.
- *Integration — mount path inside container:* Confirm by asking the tutor "what's at /workspace/extra/wiki/INDEX.md" on the first real turn — the tutor should be able to read it without errors. If it can't, Unit 1 or the registration's mount spec is wrong.

**Verification:**
- A new row exists in `registered_groups` with `jid = tg:<chat id>` and `folder = wiki-tutor`.
- The row's `containerConfig` JSON includes the wiki mount with `readonly: true` and `requiresTrigger: false`.
- The tutor responds to plain messages in the tutor chat (no `@Second Brain` required).
- Read-only write attempts inside the container are actually rejected.
- Conversation state persists across messages separated by minutes or hours.

---

- [ ] **Unit 5: End-to-end smoke test of the librarian flow**

**Goal:** Walk through the full intended UX once, in the real Telegram chat, and confirm the tutor behaves as specified by the requirements.

**Requirements:** R1–R10 (integration of all)

**Dependencies:** Units 1, 2, 3, 4

**Files:**
- None modified. This is verification of the running system.

**Approach:**
- Send `start` (or similar) in the tutor chat and observe the response.
- Drill down: pick a category, pick a page, receive a nugget.
- Exercise continuation: ask for more detail on a nugget, then ask for a different page, then ask to move to a related page.
- Stop for at least 10 minutes, then return and send `continue` or a related question. Verify the tutor picks up prior context (R8).
- Try to break it: ask the tutor to "update the page" or "add a note" — confirm it refuses and explains the read-only posture without panic.
- Send a message with no clear request ("?") and observe that the response stays in librarian posture (helpful, no quiz, no lecture).

**Patterns to follow:**
- The requirements themselves (R1–R10) are the checklist. Run through each and confirm.
- `cat ~/nanoclaw/logs/nanoclaw.log` to watch real-time agent spawning and confirm no mount errors, no trigger errors, no unexpected DB writes.

**Test scenarios:**
- *Happy path — menu (R2):* First message to the tutor returns the five category menu with page counts pulled from `wiki/INDEX.md`.
- *Happy path — drill down (R3):* Picking a category returns the page list for that category (not the full wiki).
- *Happy path — nugget (R4):* Picking a page returns 2–4 sentences of a single sharp claim — not a TLDR dump, not a section list.
- *Happy path — follow-ups (R5):* Each tutor message ends with 2–3 prose follow-up suggestions, not a numbered menu, not a quiz question.
- *Happy path — no trigger (R1):* Plain messages (no `@Second Brain`) work throughout the whole session.
- *Happy path — no quiz (R6):* The tutor never asks "do you know what X is" or "what do you think" as a graded-sounding question. It offers, it doesn't demand.
- *Integration — read-only (R7):* Attempting to make the tutor modify the wiki is refused at either the persona level or the filesystem level. Both layers should hold, and at least one must.
- *Integration — resumption (R8):* Returning hours later, the tutor remembers which page you were exploring.
- *Integration — no push (R9):* Nothing arrives from the tutor unprompted. No scheduled task was created by Units 1–4 (verify by asking the main channel to list tasks).
- *Integration — isolation (R10):* Tutor messages only appear in the tutor chat, never in the main channel or in any other registered group chat.

**Verification:**
- Every R1–R10 behavior has been observed at least once in the live chat.
- NanoClaw logs show clean spawns with no mount or trigger errors.
- The user's subjective read after the first real session is "this feels like a librarian I can come back to," not "this feels like homework." If it doesn't, iterate on the `CLAUDE.md` rather than the infrastructure.

## System-Wide Impact

- **Interaction graph:** Minimal. One new row in `registered_groups`. One new directory under `groups/`. One new Telegram chat. The tutor group is fully isolated from every other group by NanoClaw's existing per-group container design — it cannot see the main channel's files, the readwise-wiki group's files, or any other group's state.
- **Error propagation:** If the mount allowlist rejects the wiki mount, the tutor's container fails to spawn and the user sees a spawn error in logs and in the tutor chat. No other group is affected. If the tutor's `CLAUDE.md` is malformed, only this group's agent is affected — other groups load their own `CLAUDE.md` independently.
- **State lifecycle risks:** None novel. The tutor uses the existing session-id persistence mechanism, the same as every other group. The tutor never writes to shared state. The only shared resource touched is the wiki itself, and the read-only mount prevents writes at the filesystem layer.
- **API surface parity:** No APIs changed. No public contracts touched.
- **Integration coverage:** The mount-allowlist validator, the per-group `containerConfig` schema, and the `requiresTrigger: false` code path are all existing pathways exercised by other groups — but in new combinations. Unit 4's test scenarios explicitly verify each of those paths actually fires for this group.
- **Unchanged invariants:**
  - No changes to `src/` of any kind. Production regression surface is unchanged.
  - No changes to `readwise-wiki` or its schedule. The wiki compiler keeps running Mon/Thu 3am untouched.
  - No changes to the main channel. No changes to any other registered group.
  - No changes to global trigger behavior — `requiresTrigger: false` is per-row, not a default flip.
  - No changes to credentials, mount allowlist semantics, or container-runtime mount logic. Only allowlist *entries* potentially change (Unit 1), not the rules.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Mount allowlist does not cover the wiki path and the failure surfaces late at container-spawn time, after registration | Unit 1 runs first and explicitly validates the mount before registration; Unit 4's first smoke test catches any remaining gap |
| `requiresTrigger: false` is accidentally omitted from the registration, causing the librarian to feel like a command line | Called out explicitly in Unit 4's registration checklist; Unit 5's happy-path test for R1 catches this on first real message |
| The librarian persona `CLAUDE.md` is too wordy and wastes tokens on every turn | Unit 2 caps the file at under 2 KB; Unit 5 expects iteration on wording as a normal part of shipping the feature, not a surprise |
| The tutor produces summaries instead of nuggets, defeating the whole point | The `CLAUDE.md` must explicitly name "nugget, not summary" and give an example; Unit 5's R4 test is the early-warning signal if this fails |
| Read-only mount is bypassed somehow (mount allowlist misconfig, `readonly: false` typo in registration) | Unit 4's explicit write-attempt test actually tries to write inside the container rather than trusting the config |
| Wiki pages are thin or slop-flavored, so nuggets feel flat | Out of scope for this plan, but surfaces as a diagnostic: if the tutor's output is consistently flat, the upstream compiler (not the tutor) is the problem. Document this in the post-launch note, don't try to fix the compiler as part of this plan |
| The tutor is used once and never again because the user forgets it exists | Genuinely acceptable. Plan explicitly rejects push notifications. If the tutor provides no pull-value, the honest signal is that the wiki isn't a knowledge source the user returns to, and building more infra would be wasteful. Revisit the concept, not the code, if this happens |
| A new NanoClaw update changes group-registration schema or mount semantics, breaking the tutor | Low likelihood given the project's stability guarantees. If it happens, the fix is the same as for any other group: re-register. No wiki-tutor-specific code to maintain |
| Session continuity fails and the tutor forgets prior context each new day | Unit 5's R8 test catches this. If it fails, the fix is not in this plan's scope — it's a bug in the existing session-id persistence used by every group |

## Documentation / Operational Notes

- **Update `CLAUDE.md` in the repo root** with a one-line entry under "Quick Context" or the groups table to mention the new `wiki-tutor` group exists. Keep the line short — a pointer, not documentation. Optional, but helpful for future sessions that grep for "wiki-tutor."
- **No README updates required.** The tutor is a personal customization, not a shipped feature. Users who fork NanoClaw do not inherit it.
- **No monitoring or alerting changes.** The tutor is a pull-mode feature with no scheduled tasks, so there's nothing to alert on.
- **First-session retrospective:** After the first real tutor session, briefly note anywhere in the vault (or in the `wiki-tutor` group's CLAUDE.md as a comment) what worked and what felt off. The first iteration of the persona is almost certain to need tuning. Expect and budget for this.
- **Sunset conditions:** If after, say, 2–3 weeks the tutor has not been opened voluntarily, the honest move is to delete the group row rather than add features to attract the user. The plan should not treat removal as failure — a clean "this shape was wrong" outcome is more valuable than a persistent unused feature.

## Sources & References

- **Origin document:** None. This plan derives from the design conversation with the user across multiple turns, synthesized into the requirements trace above. No `ce:brainstorm` was run because the design converged interactively through iteration and rejection of earlier shapes (daily nugget push, per-folder split, briefing cross-references, quiz-style TA).
- **Related code:**
  - `groups/readwise-wiki/CLAUDE.md` — persona pattern reference
  - `groups/main/nanoclaw-admin.md` — second persona reference
  - `src/index.ts:98-120` — group registration
  - `src/db.ts:72-84, 516-527, 582-599` — sessions table, session persistence, `setRegisteredGroup`
  - `src/container-runner.ts:268-270` — read-only mount handling
  - `src/mount-security.ts:54-119` — mount allowlist validation
  - `src/channels/telegram.ts:55-227` — Telegram channel routing
  - `src/channels/telegram.ts:131-149` — inbound-message group resolution
  - `src/group-folder.ts:5` — folder name validation
- **Related files on disk:**
  - `~/.config/nanoclaw/mount-allowlist.json` — mount allowlist, modified in Unit 1 if needed
  - `store/messages.db` — contains `registered_groups` table, modified in Unit 4 via IPC
  - `~/second-brain/projects/intelligence/wiki/` — the mount target, read-only
  - `~/second-brain/projects/intelligence/wiki/INDEX.md` — the curriculum root the tutor reads first
- **Related PRs/issues:** None. This is a personal customization.
- **External docs:** None. No external research was needed — the entire feature is local-only, config-only, and well-patterned on an existing group.
