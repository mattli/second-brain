# Session Analysis — 2026-04-27-150617

# WikiTutor Session Analysis

## Session overview

| Metric         | Value   |
| -------------- | ------- |
| **Duration**   | 33m 23s |
| **Turns**      | 97      |
| **Total cost** | $4.57   |
| **Cost/min**   | $0.137  |
| **LLM cost**   | $2.12   |
| **STT cost**   | $0.26   |
| **TTS cost**   | $2.20   |

---

## On-demand tool calls

| Timestamp | Page | Latency to first audio |
|-----------|------|------------------------|
| 15:06:41 | tools/agent-harness.md | 0.147s |
| 15:10:38 | tools/agent-harness.md | 3.251s |

**Pattern notes:** Both calls fetch the same page. The second call has ~22x longer latency (3.25s vs 0.15s), suggesting either a cache miss or increased load. No failed lookups observed. No filler speech detected before lookups.

---

## Topics covered

1. **Enforce invariants, not implementations** — Rules that must always hold (architectural boundaries) should be locked down mechanically, while the implementation approach stays flexible.

2. **ReAct vs. Plan-and-execute** — Two orchestration strategies: ReAct calls the model at every step (flexible, slower); Plan-and-execute commits to a full plan upfront (faster by 3.6x, less adaptive).

3. **Reasoning traces over raw tool outputs** — Keeping agent thinking but compressing raw data reduces tokens by 26–54% without significant performance loss.

4. **Verification loop design** — Computational checks (linters, tests) are certain but rigid; inferential (LLM-as-judge) catches subtler issues but is slower and less reliable.

5. **Permission architecture** — Whether agents can use tools freely (permissive, fast, risky) or must ask permission first (restrictive, safer, slower).

6. **Tool scoping and skills** — Fewer, more powerful tools perform better than many weak ones; skills (markdown guides) teach agents *how* to use tools, while tools are the *execution* layer.

7. **Agent-first software design** — CLIs and MCP servers are optimized for agent consumption, not human UI; includes vertical models, skill files, and structured interfaces.

8. **Cloud code hooks** — Lifecycle events (session_start, pre_tool_use, post_tool_use, stop) that fire automatically rather than relying on agent instruction-following.

9. **Sandboxing** — Isolating agent execution (Docker, VMs) to prevent breakouts; different from directory-level permission boundaries.

10. **Framework implementation philosophies** — Four approaches: dumb loop (Claude, OpenAI), explicit state graph (LangGraph), role-based teams (CrewAI), conversation-driven (AutoGen).

---

## Wiki usage vs general knowledge

| Source | Approx turns | Notes |
|--------|--------------|-------|
| **On-demand wiki pages** | ~40 | Two fetches of agent-harness.md; content directly cited (ReAct, LLMCompiler, Vercel example, frameworks) |
| **Pre-loaded wiki** | ~20 | Matt references his own wiki page on "thin harness, fat skills" and CLAUDE.md instructions; Matt's prior knowledge woven in |
| **General LLM knowledge** | ~25 | Explanations of concepts like sandboxing, permission models, vertical AI models; filled gaps where article was silent |
| **Matt's own knowledge/ideas** | ~12 | His use case (CLAUDE.md is sufficient), end-of-session rituals, current Claude Code practices |

**Key finding:** The wiki page was **central**. Matt used WikiTutor primarily to work *through* the agent-harness article in real-time, asking clarifying questions section by section. LLM general knowledge filled only the gaps (e.g., "the article doesn't say X, but my sense is..."). Matt's own ideas were sparse but grounded the discussion in his immediate work context.

---

## Interaction quality notes

- **Pacing issues (critical):** Matt explicitly asked WikiTutor to slow down twice (turns 6–9). Initial response was too dense (~150 words on invariants). After feedback, assistant adapted to single-concept statements with modest expansion. Pattern stabilized by turn 10.

- **STT errors:** Minimal. One potential mishear: "cloud code hooks" (turn 55) may have been transcribed slightly oddly but remained intelligible. No turn required clarification due to misrecognition.

- **Response length compliance:** After turn 9, assistant consistently delivered 1–2 sentences per turn, expanding only on Matt's prompt "you can expand upon it a little bit." Maintained this discipline for ~60 subsequent turns.

- **Interruptions:** None. Matt's speech patterns showed natural thinking pauses ("Which...what's an example") but these were captured as separate turns, not dropped.

- **Engagement dynamics:**
  - Matt drove the conversation (reading the article section-by-section, asking targeted follow-ups).
  - Assistant took a reactive, clarification-focused role rather than lecturing.
  - Matt occasionally signaled readiness to move on ("I just want...a one liner") and assistant respected scope.
  - Turn 55 (cloud code hooks): Matt noted the concept without immediate use case; assistant validated this as reasonable ("sounds like you're just noting it for later").
  - Turn 67: Matt tested understanding by asking when `stop` hook fires; assistant was honest about gaps in the article and deferred to empirical testing.

- **Token efficiency:** Session used heavy prompt caching (5.03M cache-read tokens, 104.5K cache-write), suggesting the article was pre-loaded and reused across context windows.

- **Overall tone:** Collaborative, learner-centered. WikiTutor prioritized Matt's comprehension over completeness.