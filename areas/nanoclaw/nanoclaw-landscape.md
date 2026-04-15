# NanoClaw vs Anthropic's Agent Stack

*Updated March 30, 2026 — reflects computer use now in Claude Code (research preview)*

## What Anthropic Has Shipped (Last 6 Weeks)

The landscape has changed faster than almost anyone expected. Anthropic shipped the following in rapid succession:

- **Cowork scheduled tasks** (February 24) — recurring tasks in Cowork on your desktop
- **Claude Code cloud scheduled tasks** (March 17) — cron-style scheduling on Anthropic's servers, no local hardware required
- **Dispatch** (March 17) — mobile remote control for Cowork desktop sessions via the Claude app
- **Claude Code Channels** (March 19) — official Telegram and Discord integration for Claude Code
- **Computer use via Dispatch** (March 24) — full desktop control via the Cowork/Dispatch stack
- **Computer use in Claude Code** (March 30) — computer use now available directly in the CLI, not just Dispatch/Cowork; Claude can open apps, click through UIs, and test what it built from the terminal; research preview on Pro and Max plans
- **Obsidian plugins** — multiple community plugins now connect Claude Code directly to Obsidian vaults

Two gaps that previously made NanoClaw clearly superior — Telegram integration and vault access — have both been closed. This document reflects that honestly.

---

## What They Share

Both give you mobile control over AI agents, scheduled task execution, vault access, and Telegram integration. Both are early-stage and still evolving rapidly.

---

## Where They Still Differ

### Messaging Interface

**NanoClaw:** Native Telegram integration built into the agent infrastructure. Your agent sends you messages, you send it messages, it responds. No separate app, no separate session. Works 24/7 regardless of whether any computer is open.

**Anthropic Channels:** Claude Code Channels connects Telegram or Discord to a running Claude Code session. Your computer must be on and Claude Code must be running. One significant limitation: if Claude Code needs permission for an action, you can't grant it from Telegram — you have to go to the Mac terminal. In practice this leads many users to enable `--dangerously-skip-permissions` when working remotely, which undermines the security model.

The gap here has narrowed but not closed. NanoClaw's Telegram integration is more native and doesn't require an active desktop session.

### Agent Specialization and Swarms

**NanoClaw:** Each agent runs in its own isolated Docker container with its own independent CLAUDE.md hierarchy — global, group-level, and task-level. Agents have genuinely specialized identities, instructions, and context. A market research agent and a code review agent are completely separate entities with no shared state. Multiple containers run simultaneously with OS-level isolation. If one agent goes wrong, it can't contaminate the others.

**Anthropic's stack:** Claude Code Agent Teams allows parallel worktrees, but they share the same global `~/.claude/CLAUDE.md` and the same session context. There's no per-agent CLAUDE.md isolation. Claude Code Channels gives you one agent, one session — there's no context isolation between channels even in multi-channel setups.

This is the most significant remaining architectural difference. NanoClaw's container isolation model enables genuinely specialized parallel agents. Anthropic's stack doesn't replicate this yet.

### Customization

**NanoClaw:** ~2,000 lines of TypeScript you can read and modify. Agent behavior defined entirely by CLAUDE.md files you control. Skills, scheduling, credential handling, IPC — all yours to change. NanoClaw is a substrate, not a product. It bends to your workflow.

**Anthropic's stack:** Configured through Anthropic's interface. You work within the options they provide. When new capabilities ship, you get what Anthropic decides to build for the median knowledge worker — on their timeline, shaped by their priorities.

**Why this can't be overstated:**

These tools are new and raw. No one knows yet what personal agent infrastructure should look like at its best. With NanoClaw, your system evolves with your thinking. When your workflow changes, the infrastructure changes. When Anthropic ships something valuable, you can integrate it. You're not waiting for a product roadmap.

With Cowork and Channels, you're a user of someone else's vision. That vision may or may not align with what you're building toward.

The open source dimension matters here too. You're not just customizing a tool — you're participating in figuring out what this category of software should become. The problems you're solving, the patterns you're discovering — that's knowledge that doesn't fully exist yet.

### Execution Environment

**NanoClaw:** Agents run in isolated Docker containers. Each task gets its own filesystem, memory, CLAUDE.md, and tools. The Mac Mini runs 24/7 — tasks execute on schedule whether you're present or not. Container isolation limits blast radius if an agent misbehaves.

**Anthropic's stack:** Cowork tasks run on your desktop and require your computer to be awake. Claude Code cloud tasks run on Anthropic's servers but are scoped to GitHub repositories — not arbitrary local directories or Obsidian vaults. No OS-level container isolation per agent.

### Vault Access

**NanoClaw:** Containers mount your Obsidian vault directly at `/workspace/extra/second-brain` with read/write access. Agents read from and write to your vault natively as part of their execution — headlessly, on a machine that never sleeps.

**Anthropic's stack:** Community Obsidian plugins now connect Claude Code to your vault from within Obsidian. This is meaningful — vault access is no longer a NanoClaw-exclusive capability. However these integrations require an active Claude Code session and Obsidian to be open. NanoClaw vault access works headlessly at any hour without any app open.

### Computer Use

**NanoClaw:** Browser automation via `agent-browser`. Agents can open pages, click, fill forms, take screenshots. Scoped to browser only.

**Anthropic's stack:** Full desktop control via Dispatch/Cowork (March 24), and now computer use directly in Claude Code CLI (March 30, research preview on Pro/Max). Claude can operate any app, not just the browser. This capability now exists in both the mobile-controlled desktop stack and the CLI — NanoClaw's browser-only automation is the weaker option here.

### Security Posture

**NanoClaw:** Credential proxy keeps API keys out of containers. Container isolation limits blast radius. You define exactly what each agent can access.

**Anthropic's stack:** Dispatch can trigger reading, moving, or deleting local files based on phone instructions. Anthropic warns explicitly about prompt injection risks. Permissions are coarser. Claude Code Channels with `--dangerously-skip-permissions` enabled — common in practice because permission grants require terminal access — removes most guardrails.

### Credential Security — A Deeper Look

NanoClaw is the only agent framework where agents never see API keys. The credential proxy (port 3001) sits outside the container — agents make requests, the proxy attaches the secret, and the key never enters the container environment or filesystem. Even a successful prompt injection attack inside a container cannot exfiltrate credentials because they don't exist there.

OpenClaw stores API keys in plain text config files. Palo Alto Networks called its security model a "lethal trifecta." Hermes Agent stores credentials in environment variables or config files accessible to the agent process. Both frameworks give the agent direct access to secrets. NanoClaw does not.

### Cost

**NanoClaw:** Covered by your existing Claude subscription via OAuth. No additional infrastructure cost.

**Anthropic's stack:** Included in Pro ($20/month) and Max ($100/month) plans. No additional charge.

---

## When to Use Each

**Use Anthropic's stack when:**
- You want Telegram or Discord access to Claude Code without managing infrastructure
- You need full desktop computer use (native app control)
- You want the simplest possible setup with official support
- Your workflows don't require parallel specialized agents

**Use NanoClaw when:**
- You need truly always-on agents that run 24/7 without an active desktop session
- You're building parallel multi-agent swarms with genuinely specialized agents
- You want OS-level container isolation between agents
- You want full customization — a system that bends to your workflow, not Anthropic's vision
- You want Telegram integration that doesn't require your computer to be on and doesn't require granting permissions from a terminal

---

## NanoClaw vs Hermes Agent

Hermes Agent (Nous Research, launched February 2026) is the strongest alternative for a personal AI agent. Its key advantage is self-improving memory: it auto-generates skill documents from repeated tasks, maintains persistent memory across sessions via MEMORY.md and USER.md, and searches past conversations with FTS5. It supports any LLM provider, not just Claude.

NanoClaw's advantages over Hermes: container isolation (agents never touch credentials), a codebase small enough to modify yourself (~2,000 lines vs a research-grade Python framework), and tight integration with Claude's 200K context and tool calling.

The self-improving memory gap is narrower than it appears. NanoClaw's main group CLAUDE.md already instructs the agent to read and write memory.md each session. The difference is automation — Hermes does it more aggressively by default. A more aggressive memory policy in CLAUDE.md would approximate Hermes's behavior without a platform switch.

Hermes is model-agnostic, which provides flexibility but means it's not optimized for any single model. NanoClaw on Claude is a tighter, more reliable integration.

Bottom line: Hermes is the better choice if self-improving memory is the primary need and you don't require container isolation. NanoClaw is the better choice if security, customizability, and Claude-native integration matter more.

## MCP Extensibility

Adding new MCP integrations to NanoClaw follows a repeatable pattern. The credential proxy was refactored (March 2026) from hardcoded Parallel API key routing to a generic route-to-key mapping. Adding a new MCP server now requires one line in the route table, one line in the agent-runner permissions, and the API key in .env. Readwise MCP was added in a single session following this pattern. This extensibility compounds — each integration makes the next one trivial.

## Claude Code Build Tools (Different Layer)

Tools like gstack (Garry Tan/YC), Superpowers (Jesse Vincent), and Compound Engineering (Every/Kieran Klaassen) operate at the Claude Code layer — they structure how you build with Claude Code through slash commands, subagent dispatch, TDD enforcement, and learning loops. They are not competitors to NanoClaw. They complement it. NanoClaw handles always-on infrastructure (briefings, monitoring, Telegram interface, scheduled tasks). Claude Code plugins handle the interactive build process. Both can run on the same Mac Mini.

---

## The Honest Assessment

Anthropic shipped fast. Telegram integration, vault access, scheduling, computer use — all closed in six weeks. Two of the clearest NanoClaw advantages no longer hold the way they did.

What remains:

**Container isolation for specialized agent swarms** is the strongest remaining architectural advantage. Each NanoClaw agent has its own CLAUDE.md, its own filesystem, its own identity. You can build a market research agent, a competitive analysis agent, and a PRD agent that each specialize deeply in their role and run in parallel with no shared state. Anthropic's stack doesn't replicate this. This is the foundation for the PM agent vision — send a product idea to Telegram and get back a full analysis from a swarm of specialists.

**Customization compounds.** Every session that improves a CLAUDE.md, every agent you specialize, every workflow you encode — that's infrastructure that gets more valuable over time because it reflects accumulated knowledge about how you work best. Anthropic's managed stack resets to zero for every new user. Your NanoClaw system starts where you left off.

**The Telegram integration is still more native.** Channels requires Claude Code to be running and can't grant permissions remotely without terminal access. NanoClaw's Telegram integration is headless, always-on, and fully functional without touching a computer.

**The trajectory:** Anthropic will keep shipping. The case for NanoClaw will rest increasingly on the swarm architecture and customization — the things that require owning your own infrastructure. If those use cases matter to you, NanoClaw is worth maintaining. If you primarily want simple task delegation from your phone, Anthropic's stack now covers that adequately.

You're not building NanoClaw because Anthropic can't eventually build what you need. You're building it because you need it now, shaped exactly the way you want it, with no one else's priorities in the way.
