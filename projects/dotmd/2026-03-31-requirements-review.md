---
date: 2026-03-31
topic: dotmd
type: document-review
document: 2026-03-30-dotmd-requirements.md
---

# dotmd Requirements Review

**Document:** 2026-03-30-dotmd-requirements.md
**Type:** requirements
**Reviewers:** coherence, feasibility, product-lens, design-lens, scope-guardian, adversarial
- product-lens — user-facing dashboard features, adoption success criteria
- design-lens — web dashboard (R6-R9), interaction models, onboarding
- scope-guardian — 9 requirements with scope boundaries
- adversarial — 9 requirements, architectural decisions, new abstractions

0 auto-fixes applied. 0 batched. 22 findings to consider (9 errors, 13 omissions).

---

## P0 — Must Fix

### Errors

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 1 | Requirements R8 / Scope Boundaries | R8 ("edit from dashboard") directly contradicts scope boundary ("it tracks and displays, users edit"). Every reviewer flagged this. Resolve before planning — it's a load-bearing identity question (read-only tracker vs. read-write tool). | product-lens, design-lens, scope-guardian, adversarial, coherence | 0.88 |

## P1 — Should Fix

### Errors

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 2 | Requirements R2 / Dependencies | Default glob patterns (e.g. `~/.claude/projects/*/CLAUDE.md`) don't match actual Claude Code directory structure — feasibility reviewer checked the real filesystem and found zero matches. Zero-config promise breaks on day one. | feasibility | 0.90 |
| 3 | Problem Frame / Dependencies | Dual-master problem: "open-source tool" and "pmtxt foundation" pull in opposite directions. No priority stated when they conflict. Already visible in dashboard-first decision (serves pmtxt, not CLI-native developer audience). | adversarial, product-lens | 0.85 |
| 4 | Success Criteria | Success criteria are unmeasurable — no adoption threshold, no criterion validating the core "visibility into changes" problem is solved. A dev could set up in 3 minutes, never return, and the criteria pass. | adversarial | 0.82 |
| 5 | Dependencies / Assumptions | Tech stack reusability dependency is unresolved — states "depends on choosing the same tech stack" but no owner, timeline, or mitigation if stacks diverge. | coherence | 0.82 |
| 6 | Key Decisions | Web dashboard as primary interface may be wrong for CLI-native developers. Validation research shows all competitor traction is CLI tools. Two of three justifications for dashboard-first serve pmtxt, not dotmd users. | product-lens | 0.72 |

### Omissions

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 7 | Problem Frame / Requirements | No requirement addresses "catch unexpected modifications" — the stated differentiator. R5 and R9 are pull-based (user must check). No push notification, session-start summary, or `dotmd status` command. | product-lens | 0.85 |
| 8 | Requirements R6 | File organization model completely unspecified — "organized by location/scope" doesn't define groupings, hierarchy depth, or navigation pattern. Implementer must invent the entire IA. | design-lens | 0.85 |
| 9 | Success Criteria / Requirements | Adoption success criterion has no requirement driving it — no packaging, installation, documentation, or contributor experience requirements. | product-lens, scope-guardian | 0.82 |
| 10 | Requirements R9 | "Modified since last viewed" has no interaction design — what counts as "viewed"? How do highlights appear? Can users mark-as-read? | design-lens | 0.82 |
| 11 | Requirements R5 | Timeline view has no interaction model — could be a feed, calendar heatmap, table, or git-log list. No filtering, no global-vs-per-file decision. | design-lens | 0.80 |

## P2 — Consider Fixing

### Errors

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 12 | Scope Boundaries / Dependencies | V1 "local only" may conflict with pmtxt reusability if pmtxt needs multi-machine support — creates potential rework. | coherence | 0.75 |
| 13 | Requirements R5 / R6 | "Change timeline view" (R5) relationship to "web dashboard" (R6-R9) unclear — is the timeline a dashboard feature or a separate interface? | coherence | 0.68 |
| 14 | Dependencies / Assumptions | Assumed audience size (5+ files, success criterion says 10+) is unvalidated. Most Claude Code users may have 2-3 files, where `grep` suffices. | adversarial | 0.65 |

### Omissions

| # | Section | Issue | Reviewer | Confidence |
|---|---------|-------|----------|------------|
| 15 | Dependencies / Assumptions | pmtxt "Unit 2, Unit 3, Unit 8" references are opaque — reader cannot verify the mapping without external docs. | coherence | 0.85 |
| 16 | Requirements R1/R2 | No exclude mechanism for `**/CLAUDE.md` pattern — will match inside node_modules, .git, vendor. Config format needs an exclusion field. | feasibility | 0.82 |
| 17 | Requirements R6-R9 | No empty/error/loading states specified for any dashboard view — first thing new users encounter. | design-lens | 0.82 |
| 18 | Requirements R3 / Outstanding Questions | Snapshot frequency/mechanism entirely undefined. Cron vs. watcher vs. on-demand fundamentally shapes the product. At minimum, state the constraint it must satisfy. | coherence, adversarial | 0.80 |
| 19 | Requirements R1 | No root anchor for relative glob patterns — `**/CLAUDE.md` needs a scan root. CWD varies when triggered from shell hooks. | feasibility | 0.80 |
| 20 | Requirements R2 | "Sensible defaults" not enumerated — research deferred but R2 is already a requirement. | coherence | 0.78 |
| 21 | Success Criteria / Requirements | First-run/onboarding flow unspecified — gap between "install" and "seeing your files" is the entire UX. | design-lens, product-lens | 0.78 |
| 22 | Success Criteria | pmtxt reusability goal has no requirement — "reusable" is undefined in concrete terms (shared packages? API contracts?). | scope-guardian | 0.72 |

## Residual Concerns

| # | Concern | Source |
|---|---------|--------|
| 1 | Shell hook modifying ~/.zshrc is sensitive — malformed hook or incomplete uninstall could break shell startup | feasibility |
| 2 | TypeScript/Next.js stack choice driven by pmtxt reuse, not by what's best for a local dev tool | adversarial |
| 3 | Open-source contributors may immediately demand features (sync, team dashboards) that conflict with local-only scope | adversarial |
| 4 | Snapshot frequency has direct UX implications — too frequent = noisy timeline, too infrequent = unreliable highlights | design-lens |

## Deferred Questions

| # | Question | Source |
|---|---------|--------|
| 1 | What is the priority hierarchy when dotmd-as-OSS-tool and dotmd-as-pmtxt-foundation conflict? | adversarial, product-lens |
| 2 | What is the actual distribution of AI instruction file counts among Claude Code users? | adversarial |
| 3 | Has a simpler alternative been considered (e.g., git pre-commit hook that snapshots known files)? | adversarial |
| 4 | Is the actual user the individual developer or a team lead wanting visibility into team configs? | product-lens |
| 5 | When a file is in both dotmd snapshots and git, how are the two change histories presented? | design-lens |
| 6 | What is the content hierarchy on the main dashboard — file list, change feed, or summary? | design-lens |

## Coverage

| Persona | Status | Findings | Auto | Batch | Present | Residual |
|---------|--------|----------|------|-------|---------|----------|
| coherence | completed | 6 | 0 | 0 | 6 | 1 |
| feasibility | completed | 4 | 0 | 0 | 4 | 2 |
| product-lens | completed | 4 | 0 | 0 | 4 | 1 |
| design-lens | completed | 5 | 0 | 0 | 5 | 1 |
| scope-guardian | completed | 1 | 0 | 0 | 1 | 1 |
| adversarial | completed | 3 | 0 | 0 | 3 | 1 |
| security-lens | not activated | -- | -- | -- | -- | -- |
