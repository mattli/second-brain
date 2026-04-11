---
title: "feat: Multi-Bot Telegram Channel"
type: feat
status: active
date: 2026-04-11
deepened: 2026-04-11
---

# feat: Multi-Bot Telegram Channel

## Overview

Teach NanoClaw's Telegram channel to operate **two** bot identities simultaneously (the existing "Second Brain" default bot plus a dedicated "Wiki Tutor" bot), so the Wiki Tutor group presents with its own bot name and avatar in Telegram instead of reusing the Second Brain persona in a group-of-two. The implementation is scoped to the 2-bot case correctly, not an N-bot framework.

After pressure-testing the original scoping document against three constraints — merge-conflict surface with upstream, compatibility with the pending OneCLI Agent Vault v1.2.35 upgrade, and scope limitation to 2 bots — the recommended design is **a JSON config file** (`~/.config/nanoclaw/telegram-bots.json`) that maps group folder → bot ID, read at channel startup by `src/channels/telegram.ts`. Tokens stay in `.env` under `TELEGRAM_BOT_TOKEN` (default) plus named `TELEGRAM_BOT_TOKEN_<ID>` variables.

This replaces the earlier in-DB design that would have touched `src/channels/telegram.ts`, `src/db.ts`, `src/ipc.ts`, and `src/types.ts`. The revised design touches exactly **one** core source file (`src/channels/telegram.ts`), plus the sibling config file and `.env.example`.

## Problem Frame

The user is building a chat-based wiki tutor persona (plan 001) that works better when it feels like a conversation with a distinct character — a bot named "Wiki Tutor" with its own avatar — rather than the Second Brain bot that also runs admin tasks and daily briefings elsewhere. Telegram bot identity is inherent to the token: one bot can't have two names, and you can't rename per-chat without affecting every chat the bot is in. The only clean way to get a second visual persona is a second BotFather bot.

Today, `src/channels/telegram.ts:46-56` holds a single `Bot | null` and `:284-293` loads exactly one `TELEGRAM_BOT_TOKEN`. Every `tg:*` JID routes through that one bot. To support a second persona, the channel needs to (a) load multiple tokens, (b) route inbound to the right group without double-responding when both bots share a chat, and (c) route outbound through the bot the group is configured to use — while keeping the single-bot case working byte-identically.

The **constraint set** framing this plan:

1. **Merge-conflict surface.** This repo is a personal fork of upstream NanoClaw. `/update-nanoclaw` uses `git merge` with conflict preview and no blessed extension pattern — every core file touched becomes a potential conflict region on every upstream pull. The original scoping doc proposed changes across `telegram.ts`, `db.ts`, `ipc.ts`, and `types.ts`. That's four hot spots instead of one.
2. **OneCLI Agent Vault v1.2.35 is pending.** That upgrade touches credential handling. This change must not overlap with anything the Vault upgrade is likely to move.
3. **Exactly 2 bots.** No N-bot framework needed. The code path generalizes for free, but spec and testing target the 2-bot case.

## Requirements Trace

- **R1.** A user can create a second Telegram bot via BotFather, drop its token into `.env`, name it in a small config file, and the Wiki Tutor group starts using it — without touching code paths used by other groups.
- **R2.** The existing single-token setup (`TELEGRAM_BOT_TOKEN` in `.env`, no bot-map file present) continues to work byte-identically — `main`, `readwise-wiki`, and the current `wiki-tutor` group keep using the default bot with zero config change.
- **R3.** When both bots happen to be members of the same chat (during a persona transition, or if the user experiments), only the bot that the group is assigned to responds. The other bot's inbound handler drops the message silently.
- **R4.** Outbound messages for a group go out via the group's configured bot. Groups not listed in the bot map route via the default bot.
- **R5.** Bot-token storage stays in `.env`, matching every other credential in this project. No new credential store.
- **R6.** Group → bot-ID assignment lives in a standalone JSON file read at channel startup. No schema change to `registered_groups`. No changes to `src/db.ts` or `src/ipc.ts`.
- **R7.** Bot identity is orthogonal to `ASSISTANT_NAME` and `TRIGGER_PATTERN`. Those stay global. Visual persona (name + avatar in Telegram) is the whole ask — a per-bot trigger word is a separate, deferrable change.
- **R8.** The change touches exactly one core `src/` file (`src/channels/telegram.ts`), plus `.env.example` and a new sibling config file. This is non-negotiable under constraint #1.

## Scope Boundaries

**In scope:**
- Multi-token env loading in the Telegram channel factory (`TELEGRAM_BOT_TOKEN` + `TELEGRAM_BOT_TOKEN_<ID>` via prefix scan)
- `TelegramChannel` refactor from `this.bot: Bot | null` to `this.bots: Map<string, Bot>` keyed by bot ID
- New config file at `~/.config/nanoclaw/telegram-bots.json` mapping group folder → bot ID
- Startup-time validation that every bot ID in the map has a corresponding loaded token
- Inbound handler filter that drops messages when the polling bot's ID doesn't match the group's assigned bot
- Outbound `sendMessage` that consults the group→bot map and falls back to the default bot when unassigned
- Smoke tests covering the 2-bot case

**Out of scope (explicit non-goals):**
- **No OneCLI / Vault / secret-store integration.** The brief mentioned a "OneCLI Vault integration" but no such integration exists in the current repo (full-repo grep: zero hits for `vault|OneCLI|onecli|credential.?store`). Tokens live in `.env` as every other channel credential does. The pending v1.2.35 upgrade is explicitly a separate change; this plan neither blocks nor depends on it (see Key Technical Decisions: "Why this plan will not conflict with the OneCLI Vault upgrade").
- **No DB schema migration.** The earlier scoping-doc design added a `telegram_bot_id` column to `registered_groups`. That design is rejected here because it creates a merge-conflict hot spot in `src/db.ts` that a config file avoids at zero capability cost for 2 bots.
- **No IPC extension.** The earlier design added a `telegramBotId` field to the register-group IPC action. That's unnecessary when bot assignment lives in a file the main-channel agent can edit directly as part of its normal file-editing repertoire.
- **No `RegisteredGroup` type changes.** No touch on `src/types.ts`.
- **No multi-instance channel registry.** The channel registry (`src/channels/registry.ts`) stays one-factory-one-instance. Multi-bot lives inside the single `TelegramChannel` instance.
- **No per-bot `ASSISTANT_NAME` or `TRIGGER_PATTERN`.** Both stay global. Wiki Tutor uses `requiresTrigger: false` anyway so the trigger word is moot for that group.
- **No credential-proxy route for Telegram.** Telegram tokens live in the host Node process and never cross into containers. The credential proxy is unaffected.
- **No automatic bot creation.** User creates bots through BotFather the normal way.
- **No changes to Slack, Discord, WhatsApp, Gmail, or any other channel.** Telegram only.
- **No support beyond 2 bots in testing or documentation.** The code path generalizes but smoke testing covers exactly 2 bots — default + wiki_tutor.
- **No retroactive migration of existing groups.** No group is moved to a new bot without an explicit map-file edit.
- **No hot reload of the bot map.** Changing the map requires a NanoClaw restart — the same cycle already required for any `src/` change per CLAUDE.md.

## Context & Research

### Relevant Code and Patterns

**Single-bot factory and long-poll:** `src/channels/telegram.ts:284-293` — factory reads one `TELEGRAM_BOT_TOKEN` via `readEnvFile`, constructs one `TelegramChannel`. `:46, 56` holds one `Bot | null`, `:213` starts one long-poll loop. Every edit for this plan lives in this file.

**Inbound handler structure:** `src/channels/telegram.ts:78-155` — text message handler. Forms `chatJid = tg:${ctx.chat.id}` (`:82`), looks up registered group at `:131`, drops silently for unregistered chats (`:132-138`). The `ctx.me?.username` read at `:102` for `@mention` translation already works per-bot naturally, because in a multi-bot handler each bot's `ctx.me` reflects its own identity.

**Outbound path:** `router.ts:47-52` → `telegram.ts:229-255`. `ownsJid` at `:261-263` claims any `tg:` prefix unconditionally (correct — bot selection is an internal detail). `sendMessage` uses `this.bot.api` — the one place that must learn the multi-bot dispatch.

**Precedent for multi-bot in-repo:** `.claude/skills/add-telegram-swarm/SKILL.md` implements a multi-bot pool pattern for agent-team personas (not distinct-chat personas). The pattern is:
- **Send-only `Api` pool** — additional bots use Grammy's `Api` class directly instead of `Bot` + `start()`, so they don't spin up their own long-poll loop. Send cost only.
- **Keyed map** — `senderBotMap: Map<string, number>` keyed as `"{groupFolder}:{senderName}"` → pool index.
- **Round-robin assignment** with stable caching per key.
- **`setMyName()` rename at assignment** to re-label bots as personas on the fly.

That skill's use case is different — "multiple personas posting in one shared group, user talks to a single polling bot" — so its pool-rename trick does **not** directly solve the distinct-chat case (the Wiki Tutor bot has to *poll its own chat* to receive the user's messages, so it can't be send-only, and renaming a global polling bot per-chat would leak names across other chats). But the skill proves three things that matter for this plan:
1. NanoClaw accepts multi-bot Telegram patterns in principle.
2. Grammy supports multiple bot instances cleanly in one process (the scaling question is answered).
3. The house pattern is a stable-keyed `Map<string, Bot>` inside `TelegramChannel`. This plan follows the same shape.

The skill is **not installed** in the current repo — only partial scaffolding exists (`sender` parameter on the IPC MCP tool at `container/agent-runner/src/ipc-mcp-stdio.ts:47, 54`). No conflict with the present work.

**Group storage (read-only reference):** `src/db.ts:76-84, 601-635` defines and reads `registered_groups`. This plan **does not modify** the schema or accessors. The existing `getAllRegisteredGroups()` output is sufficient — group folder is the map key.

**Channel-opts plumbing already exposes what we need:** `src/channels/registry.ts:8-12` passes a `registeredGroups: () => Record<string, RegisteredGroup>` getter to every channel factory. `TelegramChannel` already calls it at inbound (`:131`). The group-lookup needed for outbound bot selection uses the same getter — no new plumbing.

**Config-file convention:** `~/.config/nanoclaw/mount-allowlist.json` already exists as a sibling-of-repo config file (per `src/types.ts:12-19` comment: "This file should be stored at `~/.config/nanoclaw/mount-allowlist.json` and is NOT mounted into any container, making it tamper-proof from agents."). A new `telegram-bots.json` in the same directory follows established convention: outside the repo, outside container mounts, hand-editable, survives upstream merges unconditionally.

**Bot Privacy mode reminder (from repo CLAUDE.md):** Every BotFather bot starts with Group Privacy **on**. Bots with privacy on only see commands (`/...`), `@mentions`, and replies to their own messages. For `requiresTrigger: false` groups — which is what the Wiki Tutor group uses — privacy must be turned off in BotFather before the new bot can see plain messages. This is per-bot and global across every chat that bot joins. Not a code concern, but the implementation checklist must surface it.

### Institutional Learnings

- **CLAUDE.md: "Any changes to `src/` must be committed before the session ends."** This plan does modify `src/channels/telegram.ts`. Commit before the session ends.
- **CLAUDE.md: "Never pass third-party API keys directly into containers."** Telegram tokens live in the host Node process. Not a concern.
- **CLAUDE.md: "On first spawn, each group gets a copy of `container/agent-runner/src/`... NOT updated automatically."** The agent-runner has no awareness of which Telegram bot identity is talking to it. No session-copy invalidation needed.
- **REQUIREMENTS.md philosophy: "Customization = code changes."** Accepted. But customization is a *spectrum* — a 40-line change in one file is dramatically cheaper than a 40-line change spread across four files, because merge conflicts happen at the file level and each file edit is a separate conflict surface. The scope of "code changes" is something this plan actively optimizes.
- **`/update-nanoclaw` skill (`.claude/skills/update-nanoclaw/SKILL.md`):** Uses plain `git merge` with `--no-commit --no-ff` dry-run for conflict preview. Opens only conflicted files for manual resolution. No blessed "sibling file" pattern exists, so the only way to reduce conflict surface is to touch fewer core files. This plan does exactly that.

### External References

None needed. Grammy (the Telegram library) supports multiple `Bot` instances in one process — confirmed by the `add-telegram-swarm` skill's pool implementation and by Grammy's public API. No external research required.

## Alternative Approaches Considered

### Alternative 1: In-DB field (`telegram_bot_id` on `registered_groups`) — REJECTED

**Shape:** Add a `TEXT` column to `registered_groups`, thread `telegramBotId?: string` through `RegisteredGroup` in `src/types.ts`, extend `getRegisteredGroup`/`setRegisteredGroup`/`getAllRegisteredGroups` in `src/db.ts`, and add a field to the register-group IPC action in `src/ipc.ts`. `TelegramChannel` reads `group.telegramBotId` for routing.

**Capability:** Slightly richer — IPC-validated assignment at registration time, field travels with the rest of the group row.

**Cost:**
- **Merge-conflict surface: 4 core files.** `src/channels/telegram.ts` + `src/db.ts` + `src/ipc.ts` + `src/types.ts`. Each is a hot zone upstream may also touch in future releases — `db.ts` especially, where migration try/catch blocks accumulate on every schema change upstream ships.
- **OneCLI Vault risk:** If v1.2.35 touches `src/db.ts` (adding a credential-related column, rewriting the init path, or changing how migrations are registered), the conflict zone grows. Keeping `db.ts` untouched in this plan eliminates that interaction entirely.
- **IPC complexity:** Extending the register-group IPC action means the main-channel agent must learn a new field, the admin docs must document it, and input validation must reject unknown bot IDs. All solvable, none free.

**Why rejected:** The only capability the config-file design gives up is "assignment validated at IPC time instead of channel-startup time." For 2 bots, the startup-time fail-fast is more than sufficient, and the 3-core-file savings directly serve constraint #1. This is the strongest tradeoff in the entire plan and the rejection is load-bearing.

### Alternative 2: Second NanoClaw process per bot — STRONGLY REJECTED

**Shape:** Duplicate the launchd plist, run two `nanoclaw` processes with separate `STORE_DIR`, `DATA_DIR`, `GROUPS_DIR`, and `CREDENTIAL_PROXY_PORT`. Process A owns `[main, readwise-wiki]` with the default bot token, process B owns `[wiki-tutor]` with the wiki_tutor token.

**Capability:** Theoretically zero code change needed — if everything were already parameterized.

**Cost (what the research actually found):**
- **Not actually zero code.** Research identified **four blockers** requiring code changes:
  1. `src/config.ts` — `CREDENTIAL_PROXY_PORT` defaults to 3001 and is hardcoded into startup. Second process would fail to bind. Fixable via env var (already somewhat supported), but tests show the parameter isn't fully threaded.
  2. `src/db.ts` / `src/config.ts` — `STORE_DIR` is `path.resolve(PROJECT_ROOT, 'store')`. Two processes sharing `messages.db` race on `router_state.last_timestamp` and the schema migration ALTER blocks. Either parameterize `STORE_DIR` per instance, or add an `instance_id` column and filter everywhere — both substantial.
  3. `src/container-runtime.ts:104-127` — `cleanupOrphans()` kills every container matching `nanoclaw-*`. A second process starting 100ms after the first would kill the first's running containers. Requires instance tagging on container names plus cleanup-filter changes in `src/container-runner.ts:293-294`.
  4. `src/index.ts` — `getAllRegisteredGroups()` returns every group. Two processes each think they own every group. Requires env-var-based group filtering before the main loop.
- **Core files touched: `src/config.ts`, `src/db.ts`, `src/container-runtime.ts`, `src/container-runner.ts`, `src/index.ts`.** *Five* core files, versus the one file the config-file design touches.
- **Operational cost:** Double the launchd services, double the credential proxies, double the orphan-cleanup loops, double the session-snapshot writers, double the log streams. Non-trivial when the machine is a personal laptop.
- **Capability loss:** Two processes can't share session state, can't observe each other's groups, can't be coordinated by the main-channel agent without out-of-band glue. Registering a new group becomes "which process owns it?" with no single source of truth.
- **OneCLI Vault risk:** If the Vault upgrade touches `src/config.ts` or `src/db.ts`, this plan's Option 2 edits in those files would collide.

**Why strongly rejected:** This alternative does worse than the in-DB design it was supposed to beat, on exactly the metric (merge-conflict surface) the user raised it to optimize. The research made this unambiguous.

### Alternative 3: JSON config file (`~/.config/nanoclaw/telegram-bots.json`) — RECOMMENDED

**Shape:** A map loaded at channel startup, keyed by group folder. `TelegramChannel` holds `bots: Map<string, Bot>` and `groupBotMap: Map<string, string>` (groupFolder → botId). Everything else — registration flow, DB schema, types, IPC — is unchanged.

**Capability:** Functionally equivalent to the in-DB design for this use case. The *only* capability difference is that edit-and-use requires a NanoClaw restart instead of an IPC round-trip. That restart is already mandatory per CLAUDE.md ("Any changes to `src/` must be committed before the session ends" → rebuild → restart), and for 2 bots the map changes almost never.

**Cost:**
- **Merge-conflict surface: 1 core file.** `src/channels/telegram.ts`. Plus `.env.example` (trivially mergeable, not a core file) and a new file `~/.config/nanoclaw/telegram-bots.json` that lives outside the repo entirely.
- **OneCLI Vault risk: none.** The Vault upgrade is about credential handling. `telegram.ts` reads env vars and a file path — it doesn't touch the credential proxy, `.env` parsing infrastructure, or any database credential table. Whatever v1.2.35 changes, it won't overlap here.
- **Validation:** One new startup check: every bot ID in the map must have a corresponding loaded token. Log a warning and fall back to default bot for unknown IDs — same fail-loud-at-startup behavior the in-DB design provided.

**Why recommended:** Minimizes merge-conflict surface by 3×, isolates from the pending Vault upgrade, and preserves every capability that matters at 2 bots. For constraint set (1-2-3), this is the correct answer.

### Alternative 4: Package Alternative 3 inside a skill (`.claude/skills/add-multi-bot-telegram/`) — DEFERRED

**Shape:** Same code change as Alternative 3, but wrapped in a `/add-multi-bot-telegram` skill so it can be re-applied after an upstream merge or reproduced on another fork.

**Capability:** Identical to Alternative 3 at runtime.

**Cost:** Some upfront work to write the skill, and a small ongoing maintenance cost if the upstream `telegram.ts` drifts and the skill's patch target moves.

**Why deferred:** Worth doing *after* Alternative 3 lands and the design is validated against real usage. Creating the skill speculatively, before the code itself is proven in the repo, inverts the normal work order. Revisit as a follow-up once the Wiki Tutor bot has been running for a few weeks.

## Key Technical Decisions

- **Config file, not DB column, not second process.** For the reasons enumerated in Alternatives Considered: the config file touches one core file, isolates from the Vault upgrade, and gives up only a feature (IPC-time assignment validation) that nobody will notice at 2 bots.

- **Config file path: `~/.config/nanoclaw/telegram-bots.json`.** *Rationale:* Follows the `mount-allowlist.json` convention already documented at `src/types.ts:12-19`. Sits outside the repo, outside container mounts, and survives upstream merges unconditionally — the file is never part of a pull, so no merge path can touch it. Hand-editable for the user, file-editable for the main-channel agent.

- **Config file schema: a flat object mapping group folder → bot ID.** *Rationale:* The smallest thing that works. Example:
  ```json
  {
    "wiki-tutor": "wiki_tutor"
  }
  ```
  Groups absent from the map use the default bot. The file may be missing entirely — treat as `{}`. Empty object and missing file behave identically: every group routes to default.

- **Env var naming: `TELEGRAM_BOT_TOKEN` (default) + `TELEGRAM_BOT_TOKEN_<ID>`, uppercased.** *Rationale:* Backward-compatible — the existing `.env` line works unchanged. New bots join by adding a line, no migration. Prefix-scan over `process.env` at factory time. Case-folding the suffix to lowercase ensures `telegram-bots.json` is written in normal casing while env keys stay in shell-convention uppercase.

- **Default bot uses sentinel ID `"default"`.** *Rationale:* Single source of truth for "the bot loaded from `TELEGRAM_BOT_TOKEN`." Every code path that needs "the default bot" references the sentinel string from one place. Prevents the classic silent-drop regression where a typo means every message routes to an empty bot slot.

- **Bot selection happens inside `TelegramChannel`, not in the router.** *Rationale:* `ownsJid` stays `jid.startsWith('tg:')`. The channel-boundary contract is "this channel handles `tg:*` JIDs" — true regardless of how many bots the channel runs internally. Bot selection is a dispatch detail, not a routing surface. Keeps `src/router.ts` untouched.

- **Inbound filtering is the first thing the handler does after group lookup.** *Rationale:* Each bot's handler closure captures its `botId`. On inbound, resolve the group, compute `expectedBotId = groupBotMap.get(group.folder) ?? 'default'`, and return early with a debug log if `expectedBotId !== this.botId`. This has to come before any side effect (storing metadata, calling `onMessage`) or we get doubled responses when both bots share a chat. Fail closed, not open.

- **Outbound selection consults the group→bot map, falls back to default.** *Rationale:* `sendMessage(jid, text)` reads `this.opts.registeredGroups()[jid]` (already-available getter), takes `group?.folder`, looks up `groupBotMap.get(folder)`, defaults to `'default'`, picks the `Bot` from `this.bots`, and uses its `.api`. If the resolved bot is missing, log a warning and fall through to the default bot. Degraded but functional — the user sees a message, just from the wrong persona, which is noisy-but-recoverable.

- **Bot-map validation is fail-loud at startup, not fail-silent at runtime.** *Rationale:* If `telegram-bots.json` references a bot ID with no corresponding env var, log an error at startup with the exact offending key, and either (a) refuse to start, or (b) treat the unmapped group as "route to default." This plan picks option (b) — log loudly, use default — because refusing to start would take down the whole NanoClaw instance for what might be a stale entry after a bot was removed. The user notices quickly when the Wiki Tutor chat starts responding as Second Brain.

- **One file touched, one new file created, `.env.example` updated.** *Rationale:* This is the explicit merge-conflict-surface commitment. Any deviation — adding a touch on `db.ts` "just to add a small helper," touching `types.ts` "for the interface" — re-creates the problem this plan exists to avoid. The whole of the feature lives in `TelegramChannel`.

- **Why this plan will not conflict with the OneCLI Vault v1.2.35 upgrade.** The Vault upgrade (whatever its exact shape) is credential-handling infrastructure. The most likely files it touches are: `src/credential-proxy.ts` (the current credential egress point for containers), `src/env.ts` / `.env` parsing (the current credential ingress point for the host), possibly a new `src/vault.ts` or equivalent, and possibly `src/db.ts` if it stores credential metadata. **This plan touches none of those files.** `src/channels/telegram.ts` reads env vars through `readEnvFile` (which is probably one of the things Vault touches) but only uses it to read bot tokens — exactly like every other channel does today. If Vault changes `readEnvFile`'s signature or adds a new loader, the adaptation needed here is at most renaming one call, in one file, in one function. That's the minimum achievable coupling short of not reading env vars at all.

- **`isConnected()` returns true when at least one bot is up.** *Rationale:* Matches the current permissive semantics. If one bot fails to start (bad token), log the error and continue serving traffic for the working bot(s). Not a breaking change.

- **`/chatid` and `/ping` commands register per-bot.** *Rationale:* Each polling bot registers its own command handlers. In a chat with both bots present, `/chatid` would reply twice (one reply per bot). During setup this is actually useful — it confirms each bot can see the chat. Not worth suppressing.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

**Load order at startup (all inside the Telegram factory at `src/channels/telegram.ts:284-293`):**

```
1. Scan env for TELEGRAM_BOT_TOKEN + TELEGRAM_BOT_TOKEN_<ID> → tokens: Map<botId, token>
   - TELEGRAM_BOT_TOKEN → tokens.set('default', ...)
   - TELEGRAM_BOT_TOKEN_WIKI_TUTOR → tokens.set('wiki_tutor', ...)
2. Read ~/.config/nanoclaw/telegram-bots.json (optional; missing file = empty map)
   → groupBotMap: Map<groupFolder, botId>
3. Validate: every botId in groupBotMap exists in tokens. Orphans logged, treated as 'default'.
4. Return new TelegramChannel(tokens, groupBotMap, opts)
```

**Channel state:**

```
TelegramChannel {
  bots: Map<botId, Bot>            // one Bot per loaded token
  groupBotMap: Map<folder, botId>  // from config file
  opts: { registeredGroups(), onMessage, onChatMetadata }
}
```

**Inbound dispatch (per bot, per message):**

```
on('message:text') handler closure captures botId:
  chatJid = tg:${ctx.chat.id}
  storeChatMetadata(chatJid, ...)       // always, for chat discovery
  group = registeredGroups()[chatJid]
  if !group: return                      // unregistered chat
  expectedBotId = groupBotMap.get(group.folder) ?? 'default'
  if expectedBotId !== botId:
    log.debug("ignoring message on non-owning bot")
    return                               // other bot will handle
  onMessage(chatJid, ...)                // normal flow
```

**Outbound dispatch:**

```
sendMessage(jid, text):
  group = registeredGroups()[jid]
  botId = (group && groupBotMap.get(group.folder)) ?? 'default'
  bot = bots.get(botId) ?? bots.get('default')
  if !bot: log.warn and return
  bot.api.sendMessage(jid without 'tg:' prefix, text, ...)
```

**Single-bot backward compat:**

```
If tokens has only 'default' and groupBotMap is empty (or file missing):
  - bots is { 'default': Bot } — exactly one bot polls
  - inbound expectedBotId is always 'default' — filter never triggers
  - outbound always picks 'default' — identical to current behavior
  Byte-for-byte same behavior as today.
```

## Implementation Units

- [ ] **Unit 1: Multi-token loading + bot map in `TelegramChannel`**

**Goal:** Load multiple tokens from env, load the group-folder → bot-ID map from `~/.config/nanoclaw/telegram-bots.json`, and store both on `TelegramChannel`. No behavior change yet to inbound/outbound paths — this unit lays the foundation that Unit 2 will wire into the handlers.

**Requirements:** R1, R2, R5, R6, R8

**Dependencies:** None

**Files:**
- Modify: `src/channels/telegram.ts`
- Modify: `.env.example`
- Create: `src/channels/telegram.test.ts` *(extend existing)*

**Approach:**
- Factory at `:284-293`: scan `process.env` for `TELEGRAM_BOT_TOKEN` (default) and `TELEGRAM_BOT_TOKEN_<ID>` (additional). Build `tokens: Map<string, string>`. If `tokens` is empty, return `null` with the existing "not set" warning.
- Factory: attempt to read `~/.config/nanoclaw/telegram-bots.json`. Missing file → empty map. Invalid JSON → log warning, empty map. Valid JSON → `groupBotMap: Map<string, string>`.
- Factory: validate that every bot ID referenced in `groupBotMap` exists in `tokens`. Orphans → log error with the offending key, leave them in the map but they'll fall back to default at lookup time.
- `TelegramChannel` constructor: accept `tokens: Map<string, string>` and `groupBotMap: Map<string, string>`. Store on `this`. Leave `this.bot` in place for now to keep the rest of the file compiling — Unit 2 replaces it.
- `.env.example`: add a commented-out `TELEGRAM_BOT_TOKEN_WIKI_TUTOR=` line with a short explanatory comment.

**Patterns to follow:**
- `src/types.ts:12-19` comment for `~/.config/nanoclaw/mount-allowlist.json` — the established pattern for sibling config files outside the repo.
- `src/env.ts` `readEnvFile` — existing env-reading helper. Either extend or layer a prefix-scan on top; do not bypass.

**Test scenarios:**
- *Happy path:* Single `TELEGRAM_BOT_TOKEN` set, no config file → `tokens` has one entry (`default`), `groupBotMap` is empty. Matches current behavior.
- *Happy path:* `TELEGRAM_BOT_TOKEN` + `TELEGRAM_BOT_TOKEN_WIKI_TUTOR` set, config file maps `wiki-tutor → wiki_tutor` → both loaded, map parsed, validation passes.
- *Edge case:* Config file exists but is empty (`{}`) → `groupBotMap` empty, treated as "all groups use default."
- *Edge case:* Config file missing entirely → same as empty; no error logged.
- *Edge case:* Config file contains malformed JSON → warning logged, `groupBotMap` defaults to empty, startup continues.
- *Error path:* Config file references `wiki_tutor` but `TELEGRAM_BOT_TOKEN_WIKI_TUTOR` is unset → validation logs error with key name, leaves entry in map (fallback-at-lookup path proves itself in Unit 2 tests).
- *Error path:* No `TELEGRAM_BOT_TOKEN*` env vars at all → factory returns `null`, existing "credentials missing" skip path in `src/index.ts:585-591` fires.
- *Edge case:* `TELEGRAM_BOT_TOKEN_` (empty suffix after underscore) → prefix scan skips empty IDs to avoid a map entry keyed by `""`.

**Verification:**
- Build succeeds with no type errors.
- With only `TELEGRAM_BOT_TOKEN` set (current .env state), NanoClaw boots and the existing Telegram behavior is unchanged. Logs should show exactly one Telegram bot connected.
- With a second `TELEGRAM_BOT_TOKEN_WIKI_TUTOR` set and no config file, startup still shows one `default` bot (Unit 2 adds the second bot instantiation).

---

- [ ] **Unit 2: Multi-bot instantiation, inbound filter, outbound dispatch**

**Goal:** Replace the single `this.bot: Bot | null` with `this.bots: Map<string, Bot>`. Instantiate one `Bot` per loaded token. Each bot's handler closures capture their own `botId` and drop messages intended for other bots. `sendMessage` picks the right bot based on the group→bot map.

**Requirements:** R1, R2, R3, R4, R7, R8

**Dependencies:** Unit 1

**Files:**
- Modify: `src/channels/telegram.ts`
- Modify: `src/channels/telegram.test.ts`

**Approach:**
- Replace `private bot: Bot | null = null` with `private bots = new Map<string, Bot>()`.
- `connect()`: iterate `this.tokens`, construct `new Bot(token)` per entry, attach handlers via a helper that takes `botId` as a closure variable, call `bot.start({ onStart })` for each, and `Promise.all` them so connect completes only when every bot has started.
- Handler registration: factor out the current inline `.command('chatid')`, `.command('ping')`, `.on('message:text')`, and all `storeNonText` calls into a `registerHandlers(bot: Bot, botId: string)` method. The closures used inside reference `botId`.
- Inbound text handler: after the group lookup at `:131-138`, add the bot-ID filter:
  ```
  const expectedBotId = this.groupBotMap.get(group.folder) ?? 'default';
  if (expectedBotId !== botId) return;
  ```
- `storeNonText`: same filter, same position (after the unregistered-chat return at `:160-161`).
- `sendMessage`: resolve group from `opts.registeredGroups()[jid]`, compute `botId` from `groupBotMap` with `'default'` fallback, `bots.get(botId) ?? bots.get('default')`, then call the chosen bot's `.api.sendMessage`. If no bot is resolvable, log warning and return.
- `setTyping`: same resolution path as `sendMessage`.
- `isConnected()`: `this.bots.size > 0`.
- `disconnect()`: stop every bot, clear the map.

**Execution note:** Extend the existing `src/channels/telegram.test.ts` first with two-bot scenarios below before modifying the source. This unit is the one where a routing bug would look like "bot replies in wrong chat" in production — worth driving with tests so the filter logic is exercised before manual smoke testing.

**Patterns to follow:**
- `.claude/skills/add-telegram-swarm/SKILL.md` — the stable-keyed `Map<string, ...>` pattern for multi-bot state inside `TelegramChannel`. This plan's map is over `Bot` instances (not send-only `Api`), but the keying discipline is identical.
- Existing handler structure at `telegram.ts:58-205` — the new `registerHandlers(bot, botId)` method is a straight extraction, not a rewrite. Preserve every existing handler and error path.

**Test scenarios:**
- *Happy path (single bot):* `tokens = { default }`, `groupBotMap = {}`. Inbound to any registered group: `expectedBotId === 'default' === botId`, message flows through. Outbound uses `bots.get('default')`. Identical to current behavior.
- *Happy path (two bots, wiki-tutor assigned):* `tokens = { default, wiki_tutor }`, `groupBotMap = { 'wiki-tutor': 'wiki_tutor' }`. Inbound to the `wiki-tutor` group on the `wiki_tutor` bot: passes. Inbound to the same group on the `default` bot: dropped at the filter, no `onMessage` call. Outbound to the wiki-tutor group uses the `wiki_tutor` bot. Outbound to the `main` group uses `default`.
- *Edge case:* Inbound to the `wiki-tutor` group on the `default` bot when both bots are members of the chat → default bot's filter returns early without calling `onMessage`. Verifies no double-delivery.
- *Error path:* `groupBotMap` references `wiki_tutor` but `tokens` doesn't contain it (orphan from Unit 1) → inbound lookup returns `wiki_tutor`, `bots.get('wiki_tutor')` is undefined, outbound falls back to `bots.get('default')` with a warning log. Message still delivered — degraded but functional.
- *Integration:* Simulate an inbound message to the `wiki-tutor` group on the `wiki_tutor` bot. Verify the `onMessage` callback fires exactly once (not twice, not zero). Verify a subsequent `sendMessage` call to the same JID goes through the `wiki_tutor` bot's `api.sendMessage` stub, not the `default` bot's.
- *Edge case:* `sendMessage` to a JID for an unregistered chat → no group lookup hit, defaults to `'default'` bot. Unchanged from today (the message wouldn't have been routable to this channel otherwise).
- *Error path:* All tokens fail to start (bad tokens) → `connect()` rejects; `isConnected()` returns false; existing `index.ts:595-598` "no channels connected" fatal path fires.
- *Error path:* One of two tokens fails to start → log the failure, continue with the working bot; `isConnected()` returns true; the group assigned to the failed bot sends via fallback to `default` with a warning.

**Verification:**
- Build succeeds and type-checks.
- Existing single-bot behavior is byte-identical — checked by setting only `TELEGRAM_BOT_TOKEN`, no config file, and confirming that `main`, `readwise-wiki`, and `wiki-tutor` all still receive and respond normally.
- With a second bot token + config-file assignment, the Wiki Tutor chat receives and responds via the second bot only; the default bot's inbound-handler filter drops messages intended for it from that chat (observable in debug logs).
- `npm run typecheck` and `npm test` pass.

---

- [ ] **Unit 3: Smoke-test checklist and documentation**

**Goal:** Run the end-to-end smoke test with a real second BotFather bot, confirm the single-bot regression path holds, and add the Wiki Tutor bot to real use. Also update the Wiki Tutor group's `CLAUDE.md` with a one-line note that it uses a dedicated bot.

**Requirements:** All (R1–R8) — this is the acceptance gate, not code.

**Dependencies:** Unit 2

**Files:**
- Modify: `groups/wiki-tutor/CLAUDE.md` *(add one-line note)*
- Create: `~/.config/nanoclaw/telegram-bots.json` *(user-side file, not committed)*
- Modify: `.env` *(user-side, not committed)*

**Approach:** Run this sequence, pausing after each step for confirmation.

**Phase 0 — Regression baseline (no config file, no second token):**
1. With `.env` containing only the existing `TELEGRAM_BOT_TOKEN` and no `telegram-bots.json` file at all: build, restart NanoClaw, send a test message to `main` and to `wiki-tutor`. Confirm both respond normally via the existing Second Brain bot. **This is the non-negotiable gate — if this fails, Unit 2 is wrong.**

**Phase 1 — Create the second bot in BotFather:**
2. Open BotFather, create a new bot named "Wiki Tutor" with an avatar. Capture the token.
3. **Turn Group Privacy OFF** for the new bot: BotFather → `/mybots` → select → Bot Settings → Group Privacy → Turn off. Without this, the bot will appear dead in the Wiki Tutor chat because it cannot see plain messages. (This is the #1 debugging trap per the existing NanoClaw CLAUDE.md.)
4. Add `TELEGRAM_BOT_TOKEN_WIKI_TUTOR=<token>` to `.env`.

**Phase 2 — Assign the Wiki Tutor group to the new bot:**
5. Create `~/.config/nanoclaw/telegram-bots.json` with:
   ```json
   {
     "wiki-tutor": "wiki_tutor"
   }
   ```
6. Build and restart NanoClaw. Confirm startup logs show two Telegram bots connected (`default` and `wiki_tutor`), with their respective `@username`s from BotFather.

**Phase 3 — Swap bot membership in the Wiki Tutor chat:**
7. In the Wiki Tutor Telegram chat, remove the old Second Brain bot from the members list. Add the new Wiki Tutor bot.
8. Send a test message in the chat. Confirm the response comes from the Wiki Tutor bot (check the sender's avatar and display name), not from Second Brain.

**Phase 4 — Cross-bot-ignore validation:**
9. Temporarily re-add the Second Brain bot to the Wiki Tutor chat while leaving the Wiki Tutor bot in place.
10. Send a test message. Confirm only the Wiki Tutor bot responds — Second Brain should stay silent. Check NanoClaw logs for a debug line from the default bot's handler saying it ignored the message because of the bot-ID filter.
11. Remove the Second Brain bot again.

**Phase 5 — Unaffected-group validation:**
12. Send a test message in the `main` group (or `readwise-wiki`). Confirm the Second Brain bot responds normally — no regression.

**Phase 6 — Reboot persistence:**
13. Restart NanoClaw (launchd kickstart). Confirm both bots reconnect, the Wiki Tutor chat still routes to the Wiki Tutor bot, and the `main` group still routes to Second Brain.

**Patterns to follow:** None. Smoke testing is manual and observation-based.

**Test scenarios:** Covered in the phased checklist above.

**Verification:**
- Every step in Phases 0–6 passes as described.
- Wiki Tutor group conversations visually come from a distinct bot identity in Telegram.
- `main`, `readwise-wiki`, and the current `wiki-tutor` group continue working (though `wiki-tutor` now responds via a different bot).
- Logs show no errors related to bot routing.

## System-Wide Impact

- **Interaction graph:** Inbound messages still land in `onMessage(chatJid, msg)` callbacks — the closure for each bot lands in the same central handler. No new call sites. Outbound still goes through `Channel.sendMessage(jid, text)` — one method, internal dispatch.
- **Error propagation:** A failed `bot.start()` for a non-default bot does not abort NanoClaw startup; the working bots continue. A group mapped to a failed bot sends via the default bot with a warning log. A missing config file is not an error.
- **State lifecycle risks:** None new. No new persistent state. The `groupBotMap` lives only in `TelegramChannel` memory; editing the file requires a restart to take effect, which is consistent with the rest of the codebase's no-hot-reload posture.
- **API surface parity:** The `Channel` interface at `src/types.ts:84-95` is **unchanged**. `ownsJid`, `sendMessage`, `connect`, `disconnect`, `isConnected`, `setTyping` all keep their current signatures. No downstream consumer of the Channel interface is affected.
- **Integration coverage:** The filter logic in `registerHandlers(bot, botId)` needs an explicit integration test — the unit test at `telegram.test.ts` should simulate two `Bot` instances and confirm only the expected one calls `onMessage`. This is the single place where a routing bug could double-deliver messages in production.
- **Unchanged invariants:**
  - `registered_groups` schema: untouched.
  - `RegisteredGroup` type: untouched.
  - `ipc.ts`: untouched. Main-channel agent's register-group flow is unchanged; bot assignment happens out-of-band via file edit.
  - `router.ts`: untouched. `findChannel` continues to match `tg:*` JIDs to the single Telegram channel instance; bot selection is internal.
  - `credential-proxy.ts`: untouched. Telegram tokens do not flow through the proxy.
  - Every other channel (Slack, Discord, WhatsApp, Gmail): untouched.

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| **Group Privacy mode left on for the new bot.** #1 debugging trap per the existing repo CLAUDE.md — bot appears "dead" in the Wiki Tutor chat. | Phase 1 step 3 of Unit 3 makes this an explicit gate. Debug: if the Wiki Tutor bot doesn't respond, check BotFather → `/mybots` → Bot Settings → Group Privacy first. |
| **Double-response regression if the inbound filter is positioned wrong.** Filter must run before `onMessage` or both bots store and forward the same message. | Unit 2 test scenarios explicitly cover "two bots in one chat, only one responds." Execution note requires writing those tests before modifying the source. |
| **Silent drop if `'default'` sentinel is typoed.** Every code path that means "the default bot" must reference the same literal; a typo collapses to a missing Map entry. | Define the literal once at the top of the file as a `const DEFAULT_BOT_ID = 'default'` and reference it everywhere. Lint-level discipline. |
| **Orphan entries in `telegram-bots.json` after a bot is removed.** E.g., `wiki_tutor` mapped in the JSON but the env var was deleted. | Startup validation logs the orphan explicitly. Fallback-at-lookup keeps the group functional via the default bot. User notices because the Wiki Tutor chat starts responding as Second Brain and fixes the file. |
| **OneCLI Vault v1.2.35 upgrade changes `readEnvFile`.** If the signature changes, the bot-token prefix scan has to adapt. | Adaptation is one call site, in one file (`src/channels/telegram.ts`), in one function (the factory). Minimum possible coupling short of not reading env vars at all. Explicitly non-blocking for the Vault upgrade. |
| **Upstream NanoClaw touches `src/channels/telegram.ts` in a future release.** One core file is touched by this plan — merge conflicts are possible. | Single-file change is the minimum achievable. `/update-nanoclaw` previews conflicts and the user resolves them the normal way. The channel file has been stable in structure — the handler shape and the factory function are the most likely to drift. |
| **Both bots' `/chatid` replies show up in a shared chat.** Noisy during setup. | Not a bug — users need to confirm each bot can see the chat. Not worth suppressing. Document in Unit 3's smoke-test notes. |
| **Bot-token leakage via logs.** If a bot fails to start, logging the exception could stringify the token. | Strip token from error messages before logging. Use the bot ID, not the token, in every log line. Standard hygiene — existing `telegram.ts` already does this for the single-bot case. |

**Dependencies:**
- No blocking code dependencies. The existing Grammy `Bot` class supports multi-instance in one process (confirmed by `add-telegram-swarm` skill precedent).
- BotFather bot creation is a user-side prerequisite before Unit 3 can run.
- The pending OneCLI Vault v1.2.35 upgrade is **explicitly non-blocking**. This plan should merge cleanly regardless of which order the two land in.

## Documentation / Operational Notes

- **`.env.example`** gains a commented example for `TELEGRAM_BOT_TOKEN_<ID>`.
- **`groups/wiki-tutor/CLAUDE.md`** gains a one-line note saying the group uses a dedicated bot via `~/.config/nanoclaw/telegram-bots.json`, so future-Matt (or a future agent session) knows why the group has a different bot identity.
- **`CLAUDE.md` Telegram privacy section** at the project root is already adequate — it warns about the privacy-mode trap. No update needed; the new bot inherits the same concern automatically.
- **Post-implementation follow-up (deferred):** consider packaging this change as a `/add-multi-bot-telegram` skill under `.claude/skills/` once it's been validated in real use for a few weeks (Alternative 4). That would make the change reproducible across forks and explicitly re-appliable after upstream merges that break `src/channels/telegram.ts`.
- **No rollout risk.** Single machine, single user, no shared state with others.
- **No monitoring changes.** Existing logger emits the new fields (bot ID in Telegram logs) at debug level.

## Open Questions

### Resolved During Planning

- **In-DB column vs config file vs second process?** Config file. See Alternatives Considered — rejection of the in-DB option and strong rejection of the second-process option are both load-bearing. (Resolved.)
- **Where should the config file live?** `~/.config/nanoclaw/telegram-bots.json`, following the `mount-allowlist.json` convention documented at `src/types.ts:12-19`. (Resolved.)
- **Does the existing `add-telegram-swarm` skill solve this?** No — it handles send-only personas inside one shared group, not distinct-chat personas with independent polling. But its multi-bot state-management pattern is precedent to follow. (Resolved via skill research.)
- **Does multi-process reduce merge-conflict surface?** No — it strictly increases it, touching 5 core files versus 1. Strong reject. (Resolved via code-path research.)
- **Can two Grammy bots coexist in one process?** Yes, confirmed by `add-telegram-swarm` skill precedent and Grammy's public API. No external research needed. (Resolved.)
- **Does this plan conflict with the OneCLI Vault v1.2.35 upgrade?** No. The only overlap surface is `readEnvFile`, and the adaptation cost if Vault changes its signature is one call site in one file. (Resolved.)
- **Should bot assignment validation fail startup on orphan entries?** No. Log loudly, fall back to default bot at lookup time. Degraded-but-functional beats refuse-to-start for a personal-scale deployment. (Resolved.)
- **Per-bot `ASSISTANT_NAME` or `TRIGGER_PATTERN`?** Out of scope. The Wiki Tutor group uses `requiresTrigger: false` so this is moot for the current use case. Defer. (Resolved.)

### Deferred to Implementation

- **Exact shape of the `registerHandlers(bot, botId)` extraction.** Whether to make it a private method, a free function, or an inline closure factory is a style call that's easier to make while editing the file. Not plan-blocking.
- **Whether `isConnected()` should also surface per-bot status for future diagnostics.** Not needed now — the existing `boolean` contract is sufficient. If a future operational need arises, add it then.
- **Whether to pre-scan config file JSON for typos (e.g., `wiki-tutor` vs `wiki_tutor` mismatch between map key folder name and the actual `registered_groups.folder`).** A group folder in the map that doesn't exist in `registered_groups` is silently inert — it just never matches anything. Worth a debug log but not a validation error. Decide at implementation time based on how noisy or useful the log turns out to be.
- **Whether to package as a skill (Alternative 4) now or after real usage.** Defer until the implementation has been in production for a few weeks and the code shape is stable.

## Sources & References

- **Origin document:** This file (revised in-place from the original scoping pass dated 2026-04-11).
- **Related plan:** [2026-04-11-001-feat-wiki-tutor-group-plan.md](./2026-04-11-001-feat-wiki-tutor-group-plan.md) — the Wiki Tutor group that motivates this change.
- **Related skill (precedent, not drop-in solution):** `.claude/skills/add-telegram-swarm/SKILL.md` — multi-bot pool pattern for agent-team personas.
- **Related skill (merge-conflict context):** `.claude/skills/update-nanoclaw/SKILL.md` — the `/update-nanoclaw` flow and its conflict-resolution expectations.
- **Relevant code:**
  - `src/channels/telegram.ts:46-293` — the single file this plan modifies.
  - `src/channels/registry.ts:8-12` — `ChannelOpts.registeredGroups` getter already provides the plumbing the outbound path needs.
  - `src/types.ts:12-19` — precedent for sibling config files at `~/.config/nanoclaw/`.
  - `src/db.ts:76-84, 601-635` — `registered_groups` schema and accessors. Read-only reference; **not modified** by this plan.
  - `src/ipc.ts` — **not modified** by this plan.
  - `src/router.ts:47-52` — `findChannel` semantics, unchanged.
- **Repo CLAUDE.md sections relied on:**
  - "Telegram Bot Privacy Mode" — privacy-off requirement for `requiresTrigger: false` groups.
  - "Commit Before Ending a Session" — mandatory commit of `src/` changes.
  - "Credential Proxy Pattern" — why Telegram tokens are NOT a credential-proxy concern.
