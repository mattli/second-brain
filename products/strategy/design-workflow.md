# Solo Builder Design Workflow

## Claude Design → v0 → Claude Code

A solid sequence for solo builders that plays to each tool's strengths.

### Why this order works

- *Claude Design* — fastest visual exploration, interactive prototypes, full-screen flows, and design system fidelity from prompts + your DESIGN.md. Start here.
- *v0* — the "make it look premium" layer. Turns rougher outputs into clean, beautiful shadcn/Tailwind React components with great defaults for spacing, animations, variants, and modern aesthetics. Quick conversational tweaks: "improve hierarchy, add subtle motion, refine mobile layout."
- *Claude Code + frontend-design skill* — takes polished components, integrates them into the real codebase, adds logic/state/backend connections, and ensures consistency and production-readiness.

This avoids the common pitfall of Claude Code generating functional but visually underwhelming UI, while keeping the loop agentic and fast.

---

### When to skip or adjust v0

- Go *Claude Design → Claude Code* directly if the prototype already looks strong — use the official Handoff Bundle export, which preserves intent, components, and reasoning better than screenshots or raw HTML.
- Insert v0 when you want extra polish, shadcn-specific components, or when Claude Design output needs aesthetic elevation.

---

### Practical flow

1. *Claude Design* — prototype the screen/feature, iterate visually
2. *Export* — use "Export as HTML", screenshots, or the handoff bundle
3. *v0 (optional but recommended for polish)* — paste code/screenshot + prompt:
   > "Polish this Claude Design output into production-ready shadcn/Tailwind components. Match our DESIGN.md exactly. Improve spacing, hierarchy, add Framer Motion micro-interactions where appropriate."
4. *Claude Code* — paste v0 components + invoke frontend-design skill:
   > "Integrate these polished v0 components using frontend-design skill. Follow our DESIGN.md. Add full functionality, state management, and responsiveness."

*Pro tip:* After your first successful pass, save a reusable prompt template referencing your DESIGN.md for consistency across all three tools.
