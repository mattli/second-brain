---
date: 2026-03-31
topic: dotmd
type: document-review
document: 2026-03-30-001-feat-dotmd-v1-plan.md
---

# dotmd Implementation Plan Review

**Document:** 2026-03-30-001-feat-dotmd-v1-plan.md
**Type:** plan
**Reviewers:** coherence, feasibility, product-lens, design-lens, scope-guardian, adversarial
- product-lens — user-facing features, scope decisions, CLI-first alignment
- design-lens — dashboard interaction models, state coverage, IA
- scope-guardian — unit sizing, R8 removal, missing R10-R12
- adversarial — glob root, performance assumptions, concurrency

Applied 7 auto-fixes (R8 removal from trace/units/system-impact, R2 scoped to Claude Code, origin link updated, overview reframed CLI-first, edit mechanism marked resolved). 12 findings to consider (5 errors, 7 omissions).

---

## P0 — Must Fix

### Omissions

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 1 | Units / Unit 3 | **R10 (session-start notifications) has no implementation.** Unit 3 runs `dotmd scan --quiet` but doesn't specify the notification output format — which files, when, one-line diff summary. This is the highest-value CLI-first feature with zero coverage. | all reviewers | 0.95 |
| 2 | Units / Unit 1 | **R11 (npm packaging) and R12 (auto-discovery onboarding) have no units.** Unit 1's init just creates config.yaml — it doesn't auto-discover files, show results, or run first snapshot. No unit covers npm bin field or packaging. | all reviewers | 0.92 |

## P1 — Should Fix

### Errors

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 3 | Default patterns | **`~/.claude/projects/*/CLAUDE.md` matches zero files.** Feasibility reviewer checked real filesystem — Claude Code uses path-encoded dirs with no CLAUDE.md inside them. Zero-config promise breaks. | feasibility | 0.90 |
| 4 | Default patterns / Unit 2 | **`**/CLAUDE.md` has no defined root.** Shell hook CWD varies per session. From $HOME, this walks the entire filesystem tree. Performance claim ("milliseconds") is unvalidated and load-bearing. | feasibility, adversarial | 0.85 |
| 5 | Unit 1 | **No glob exclusion mechanism.** `**/CLAUDE.md` will match inside node_modules, .git, vendor. Config format has no exclude field. Risk table mentions "default exclusions" but no unit implements them. | feasibility | 0.85 |

### Omissions

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 6 | Unit 4 | **Change indicator (R9) has no interaction design.** What counts as "viewed"? What visual form? Can users mark-as-read? | design-lens | 0.85 |
| 7 | Unit 4 | **Dashboard IA underspecified.** "Grouped by scope" but no classification rules, no navigation model between list and detail, no definition of what [id] is. | design-lens | 0.82 |
| 8 | Key Decisions | **No CLI commands for viewing data.** CLI surface is init/scan/serve/install-hook. A CLI-first tool needs `dotmd status`, `dotmd log`, or `dotmd diff` that work without the web server. | adversarial, product-lens | 0.88 |
| 9 | Key Decisions | **OSS-first and Claude Code first decisions not stated.** Plan still frames around pmtxt reuse without the priority hierarchy. | coherence | 0.82 |

## P2 — Consider Fixing

### Errors

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 10 | System-Wide Impact | **Concurrent SQLite access between shell hook and dashboard.** "No concurrency expected" is wrong — opening a terminal while dashboard is running is the expected use case. Need WAL mode. | feasibility, adversarial | 0.80 |

### Omissions

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 11 | Unit 4 | **Scan-on-page-load has no loading/failure UX.** What does the user see while scan runs? What if it fails? | design-lens | 0.75 |
| 12 | Units | **~30 files may be over-structured for V1.** Scanner could be 1-2 files instead of 4 (glob, reader, differ, git). | scope-guardian | 0.70 |

## Deferred Questions

| # | Question | Source |
|---|---------|--------|
| 1 | Should `dotmd timeline`/`dotmd log` exist as CLI commands, not just a dashboard page? | adversarial, product-lens |
| 2 | Should Unit 5 (now just timeline) merge into Unit 4? | scope-guardian, design-lens |
| 3 | Should the shell hook scan run async (backgrounded) as a fallback if performance is slow? | adversarial |

## Coverage

| Persona | Status | Findings | Auto | Batch | Present | Residual |
|---------|--------|----------|------|-------|---------|----------|
| coherence | completed | 2 | 4 | 1 | 1 | 1 |
| feasibility | completed | 4 | 0 | 0 | 4 | 2 |
| product-lens | completed | 2 | 2 | 0 | 2 | 1 |
| design-lens | completed | 4 | 0 | 0 | 4 | 1 |
| scope-guardian | completed | 2 | 1 | 0 | 1 | 1 |
| adversarial | completed | 3 | 0 | 1 | 3 | 1 |
| security-lens | not activated | -- | -- | -- | -- | -- |
