---
date: 2026-03-31
topic: dotmd marketing
---

# dotmd — Marketing Plan

## Positioning

**One-line:** Git blame for your AI instruction files.

**Problem statement (in the words of the community):**
> "Context management is the real bottleneck, not model quality." — @NandinoAI
> "I spent way more time on our CLAUDE.md files than on actual prompts." — @a_protsyuk
> "How are you managing AI agent config sprawl?" — r/VibeCodersNest (24 comments)

**What makes dotmd different:** Existing tools sync or manage instruction files. dotmd is the only tool that tracks *what changed, when, and why* — including changes made by AI agents themselves. The "who changed my CLAUDE.md?" problem has no other solution.

**Audience:** Developers actively using Claude Code, Cursor, Codex, or Windsurf with more than 5 AI instruction files. The sweet spot is developers who have invested in their CLAUDE.md setup and have noticed it drifting.

---

## Distribution Channels (Priority Order)

### 1. r/ClaudeAI + r/VibeCodersNest (Highest priority)
These are the exact communities where the problem was validated. The r/VibeCodersNest thread "How are you managing AI agent config sprawl?" is a direct invitation. Strategy:
- Post in threads where people are already describing the problem — don't cold-launch, engage first
- Show HN-style post: "I built a tool that tracks changes to CLAUDE.md and other AI instruction files" with a demo screenshot
- Target r/GithubCopilot for Copilot/Cursor crossover audience

### 2. X (Claude Code developer community)
The Claude Code developer community is highly active on X. Key voices already validated the problem (@NandinoAI, @a_protsyuk, @imadeburo). Strategy:
- Engage those voices directly — they've already described the pain, show them the solution
- Post dashboard screenshots showing real diffs — "here's what changed in my CLAUDE.md this week"
- Thread format: "I tracked every change to my AI instruction files for 30 days — here's what I found"

### 3. Hacker News (Show HN)
Strong Show HN candidate. Developer tool, open source, solves a specific pain, ships as `npx dotmd`. Show HN posts that do well tend to:
- Lead with the problem, not the tool
- Have something to show immediately (the dashboard)
- Be genuinely novel (change tracking for AI config files is novel)

### 4. MCP Server as Sales Team (from Greg Isenberg)
Build a dotmd MCP server. When a Claude user asks "how do I track my CLAUDE.md changes?", dotmd appears as a suggested tool. Zero CAC, high intent. This is a natural fit — dotmd is already in the Claude Code ecosystem and MCP discovery is how Claude users find tools.

### 5. Viral Artifact
The dotmd dashboard diff view is inherently shareable. "Here's my CLAUDE.md change history" is the kind of thing developers will screenshot and post. Design the diff view to be screenshot-worthy — clean, branded, sharable. Every share reaches more Claude Code developers.

---

## Launch Strategy

### Pre-launch (before v1 ships)
- Post in r/VibeCodersNest and r/ClaudeAI threads where the problem is discussed — establish presence before pitching
- Build a small waitlist by sharing a mockup of the dashboard in those communities: "building this — who wants early access?"
- Engage @NandinoAI, @a_protsyuk, @imadeburo on X — they've already articulated the problem, ask if they'd try a solution

### Launch day
1. **npm publish** — `npm install -g dotmd` live, `npx dotmd init` works in under 2 minutes
2. **Show HN** — title: "Show HN: dotmd – track changes to CLAUDE.md and AI instruction files"
3. **r/ClaudeAI post** — lead with the problem, show the dashboard screenshot
4. **X thread** — "I built a tool that shows you what's changed in your AI instruction files" — screenshot of a real diff, link to GitHub
5. **GitHub README** — polished, with a GIF of `dotmd init` running and the dashboard appearing

### Post-launch growth
- Respond to every HN comment, Reddit comment, X reply — early community engagement is the highest leverage activity
- Collect and post dashboard screenshots from real users (with permission)

---

## Content Strategy

### Answer Engine Optimization (AEO)
Developers increasingly ask AI assistants questions like "how do I track CLAUDE.md changes" or "how do I manage AI instruction files across projects." A well-indexed README and a simple docs page means dotmd becomes the answer. Target these queries:
- "how to track CLAUDE.md changes"
- "AI instruction file management"
- "CLAUDE.md change history"
- "managing AI config files across projects"

### Content angle: "The file that controls your AI agent is changing without you knowing"
This is a provocation that maps exactly to dotmd's core value. One blog post or X thread built around this premise could drive significant awareness. Walk through a real example: "I ran dotmd for a week. Here's every change that happened to my CLAUDE.md — including three I didn't make."

### Distribution-first content (from Greg Isenberg)
Build a free tool that acts as top-of-funnel: a web-based "AI Config Scanner" that lets someone paste in their CLAUDE.md and see a structured breakdown of what it does. Zero install required, instant value, captures email, introduces dotmd. The tool is the marketing.

---

## Growth Flywheel

```
Developer discovers dotmd (Reddit/HN/X)
        │
        v
npx dotmd init → sees value in < 5 min
        │
        v
Dashboard shows their real config history
        │
        v
Screenshots it, posts it on X
        │
        v
New developers discover dotmd
```

The key mechanic: the dashboard output is shareable. Make it beautiful enough that developers want to show it off.

---

## Metrics to Track

- GitHub stars (primary signal for open-source adoption)
- npm weekly downloads
- Referral sources (HN, Reddit, X — use UTM params on launch posts)
- Discord/community presence (are people recommending dotmd in Claude Code communities?)

---

## Connection to pmtxt

dotmd's open-source adoption builds the developer audience that becomes pmtxt's early users. The same people managing CLAUDE.md files are the ones who would use a plain-text PM tool. The marketing flywheel for dotmd seeds pmtxt's waitlist.
