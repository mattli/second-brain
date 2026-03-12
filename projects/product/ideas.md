# Product Ideas

## 1. AI Agent Contribution Review Tool for Open Source

*Inspired by: Redox OS ban, matplotlib incident, Gentoo policy, ongoing HN debates (March 2026)*

**What it is:** A GitHub app that sits in PR review and flags whether code was likely AI-generated — and if so, runs automated quality checks (tests, security scan, benchmark validation) before it ever reaches a human maintainer. Maintainers configure their policy (allow, flag, or block), contributors get instant feedback.

**Why now:** Open source maintainers are in pain. They're getting flooded with AI-generated PRs and reacting with blanket bans — which is a blunt instrument. There's a clear market for a scalpel. Every project that's announced a no-LLM policy is a potential customer.

**Revenue immediately:** GitHub Marketplace with a freemium model. Free for public repos (viral distribution), paid for private repos and teams. $15-29/mo per org. The pain is acute and the buyer (maintainer/org) is already looking for solutions.

**Solo feasibility:** GitHub API + existing AI detection libraries + a simple rules engine. No infrastructure scaling issues early on — runs per PR event.

---

## 2. Agent Reliability & Cost Monitor

*Inspired by: "shipping is still painfully slow" HN thread, Claude Code economics debate, unit economics scrutiny (March 2026)*

**What it is:** A lightweight SDK wrapper + dashboard that tracks your AI agent runs — cost per task, success/failure rate, retry counts, latency — and alerts you when something goes off the rails (runaway costs, degraded success rates, prompt regressions). Like Datadog, but specifically for agentic workflows.

**Why now:** Builders are moving agents into production and immediately hitting the same wall: no visibility into what's actually happening or what it costs. The Claude Code economics debate shows people are actively anxious about spend. There's no good lightweight tool for solo devs and small teams — existing options are enterprise-grade and priced accordingly.

**Revenue immediately:** Usage-based SaaS. Free tier (1 agent, 7-day history), $19/mo for indie devs (5 agents, 30-day history), $79/mo for teams. People will pay immediately because unmonitored agent costs are a real and present danger.

**Solo feasibility:** Thin SDK in Python/TypeScript that wraps API calls, a Postgres backend, and a simple Next.js dashboard. No AI needed to build it — it's pure instrumentation.
