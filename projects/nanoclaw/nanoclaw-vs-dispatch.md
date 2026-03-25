# NanoClaw vs Claude Dispatch

*Updated March 24, 2026 based on Dispatch launch*

## What Dispatch Actually Is

Dispatch is not a hosted agent service — it's a mobile remote control for Claude Cowork running on your own desktop. Released March 17, 2026 as a research preview for Pro and Max subscribers.

The architecture: you send a task from your phone via the Claude mobile app, it routes through Anthropic's servers, and Claude Cowork executes the task on your desktop computer. Your files stay local. Your computer must be awake with Claude Desktop running. When your computer sleeps, Dispatch stops working.

This is meaningfully different from a hosted service. Dispatch is closer to NanoClaw's `/remote-control` feature than to a competing infrastructure platform.

---

## What They Share

Both give you mobile control over an AI agent running on your own machine. Both can execute tasks on local files without those files leaving your hardware. Both are early-stage and still rough around the edges.

---

## Where They Differ

### Execution Environment

**NanoClaw:** Agents run in isolated Docker containers. Each task gets its own filesystem, memory, CLAUDE.md, and tools. Containers run in parallel with concurrency controls. The Mac Mini runs 24/7 — tasks execute on schedule whether you're present or not.

**Dispatch:** Agents run inside Claude Cowork on your desktop. No container isolation. Tasks execute in a shared environment with access to whatever Cowork has permission to use. Requires your computer to be awake and Claude Desktop to be open — not a true always-on system.

### Scheduling and Autonomy

**NanoClaw:** Fully scheduled. Daily briefings at 7am, vault sync every 30 minutes, weekly summaries on Saturday — all running whether you're there or not, on a Mac Mini that never sleeps.

**Dispatch:** No native scheduling — you send a task from your phone and Claude executes it now on your current desktop session.

**However — Anthropic has now shipped scheduling in two places:**

- **Cowork scheduled tasks** (launched February 24, 2026) — recurring and on-demand tasks in Cowork. Daily, weekly, weekdays, hourly, or on demand. Each scheduled task spins up its own Cowork session with access to every connected tool and MCP server. Runs on your desktop — requires your computer to be awake.

- **Claude Code cloud scheduled tasks** (launched March 17, 2026) — cron-style scheduling that runs on Anthropic's servers, not your local machine. Your computer does not need to be awake. You connect a GitHub repository, define a schedule, write a prompt, and Claude executes it in the cloud on the designated schedule.

The Claude Code cloud scheduling is the most significant development. It directly competes with NanoClaw's scheduled task architecture for code-related workflows — and unlike Cowork tasks, it doesn't depend on your hardware staying on.

### Messaging Interface

**NanoClaw:** Telegram. Any messaging app you already use, on any device. Native integration, no new app required.

**Dispatch:** Requires the Claude mobile app. No Telegram, no WhatsApp, no existing messaging platform. A new app you have to install and remember to use.

### Agent Swarms and Parallelism

**NanoClaw:** Each agent is an isolated container. Multiple containers run simultaneously with independent filesystems and CLAUDE.md files. The `add-telegram-swarm` skill gives each subagent its own bot identity. Purpose-built for parallel multi-agent workflows.

**Dispatch:** Single agent execution within Cowork. No native multi-agent coordination or parallel execution model.

### Customization

**NanoClaw:** ~2,000 lines of TypeScript you can read and modify. Agent behavior defined entirely by CLAUDE.md files you control. Skills, scheduling, credential handling, IPC — all yours to change. New capabilities can be added in an afternoon — the Parallel AI MCP integration, for example, was installed in a single session. NanoClaw is a substrate, not a product. It bends to your workflow.

**Dispatch/Cowork:** Configured through Anthropic's interface. You work within the options they provide. When new capabilities ship, you get what Anthropic decides to build for the median knowledge worker — on their timeline, shaped by their priorities.

**Why this can't be overstated:**

These tools are new and raw. No one knows yet what personal agent infrastructure should look like at its best. The workflows, patterns, and integrations that matter most haven't been discovered yet — they're being figured out right now by people building systems like yours.

With NanoClaw, your system evolves with your thinking. When your workflow changes, the infrastructure changes. When a new capability emerges in the ecosystem, you can integrate it. When Anthropic ships something valuable, you can add it. You're not waiting for a product roadmap.

With Cowork, you're a user of someone else's vision for what a personal AI assistant should be. That vision may or may not align with what you're building toward.

The open source dimension matters here too. You're not just customizing a tool — you're participating in figuring out what this category of software should become. The problems you're solving, the patterns you're discovering, the integrations you're building — that's knowledge that doesn't fully exist yet. You're at the frontier of a genuinely new kind of infrastructure.

### Cost

**NanoClaw:** Covered by your existing Claude subscription via OAuth. No additional cost for the infrastructure.

**Dispatch:** Included in Pro ($20/month) and Max ($100/month) plans. No additional charge on top of existing subscription.

### Computer Use

**NanoClaw:** Has browser automation via the `agent-browser` tool already installed in containers. Agents can open pages, click, fill forms, take screenshots, and extract data. Scoped to browser only — not full desktop control.

**Dispatch + Cowork (launched March 24, 2026):** Claude can now control your entire computer — open any app, navigate the browser, interact with spreadsheets, fill forms, click buttons. Full desktop control, not just browser automation. Research preview for Pro and Max subscribers.

This is a meaningful capability gap closing. NanoClaw's browser tool handles web automation well but doesn't give agents control over native desktop apps. Dispatch's computer use does. For workflows that require interacting with desktop software — not just web pages — Dispatch now has an edge NanoClaw doesn't currently match.

### Security Posture

**NanoClaw:** Credential proxy keeps API keys out of containers. Container isolation limits blast radius if an agent misbehaves. You define exactly what each agent can access.

**Dispatch:** Anthropic warns explicitly: instructions from your phone can trigger reading, moving, or deleting local files and interacting with connected services. Prompt injection is flagged as a real risk. Permissions are coarser — Cowork's existing access applies to everything Dispatch can trigger.

---

## When to Use Each

**Use Dispatch when:**
- You want to trigger occasional tasks from your phone right now
- The task runs on your current desktop session and doesn't need scheduling
- You're already in the Claude ecosystem and don't want to manage infrastructure
- You're a non-technical user who wants simple mobile-to-desktop task delegation

**Use NanoClaw when:**
- You need always-on scheduled agents that run whether you're at your computer or not
- You want Telegram (or any existing messaging app) as your interface
- You're building toward parallel multi-agent workflows
- You want OS-level container isolation for each agent
- You want to own and modify every part of your agent infrastructure

---

## The Honest Assessment

The landscape shifted significantly in March 2026. Anthropic now has:

- **Dispatch** — mobile remote control for desktop Cowork sessions
- **Cowork scheduled tasks** — recurring tasks on your desktop
- **Claude Code cloud scheduled tasks** — truly always-on scheduled execution on Anthropic's servers, no local hardware required
- **Computer use** — full desktop control, Claude can operate any app on your computer

The cloud scheduling is the most direct challenge to NanoClaw's core value proposition. For code-related scheduled workflows, Claude Code cloud tasks can now do what previously required a Mac Mini running NanoClaw.

**What NanoClaw still does that Anthropic's stack doesn't:**

- **Telegram integration** — Dispatch requires the Claude mobile app. NanoClaw works in the messaging app you already use.
- **Vault access** — NanoClaw containers mount your local Obsidian vault directly. Claude Code cloud tasks work with GitHub repositories, not arbitrary local directories.
- **Container isolation for agent swarms** — OS-level isolation per agent, purpose-built for parallel multi-agent coordination.
- **Full customization** — every part of the execution environment is yours to modify.
- **Persistent data stays on your hardware** — your vault files, briefings, agent memory, and CLAUDE.md files live on your Mac Mini. Both NanoClaw and Anthropic's stack send content to the Anthropic API to generate responses — that's unavoidable. The difference is that with NanoClaw you control exactly what context gets sent per task, and your persistent data never lives on Anthropic's infrastructure. With Cowork, Anthropic has broader access to your connected folders and the permission model is coarser.

**For your specific setup** — daily briefings writing to your Obsidian vault, Telegram delivery, scheduled intelligence — Anthropic's stack still can't replicate it cleanly. The vault mounting and Telegram integration are the gaps.

**The trajectory is clear though.** Anthropic is shipping fast. Scheduling, computer use, mobile control, cloud execution — all shipped in the last six weeks. The case for NanoClaw will increasingly rest on Telegram integration, container isolation for swarms, and keeping your data local. Those are real advantages but they're narrowing.
