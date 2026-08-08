# Idea capture — skills, and what's actually worth modularizing

**Date:** 2026-08-08
**Status:** vetted, nothing built
**Context:** Matt has never authored a skill. These came up as shower-thoughts about improving the workflow; captured and reasoned through rather than acted on.

---

## Idea 1 — End-of-session ritual as a skill

**Verdict: good instinct, not worth building yet. Trigger recorded below.**

The appeal is the engineering pattern: the ritual is a component, and components get extracted. That instinct is right in general.

But run the usual payoffs of extraction against this case:

| Why you'd extract a module | Does it apply here? |
|---|---|
| Reuse across contexts | No — used in exactly one place |
| Independent versioning / testing | No — never tested independently |
| Isolating change | No — it changes rarely |
| Shrinking the caller | Marginally — it's ~15 lines of CLAUDE.md |

The only real win is context weight, and fifteen lines isn't a weight problem.

**The counter-pattern is also from engineering: premature extraction.** Pulling something into its own module before it needs to be one adds indirection you then maintain, plus a seam that leaks.

**And there's a specific seam here that would leak.** The ritual isn't purely shared — the Mini holds the vault git repo and the NanoClaw sync rules; the MacBook doesn't. Today that works because CLAUDE.md is *layered*: shared rules in `~/dotfiles/claude/CLAUDE.shared.md`, machine-specific overrides in each machine's local `~/.claude/CLAUDE.md` which `@import`s the shared file. A skill folder is a single artifact with no import-and-override structure. Two workarounds, both bad:

- Put both machines' variants in the skill with "if on the Mini, do X" conditionals — reintroduces exactly what the layering was designed to avoid.
- Skill covers only genuinely shared steps, machine-specific bits stay in CLAUDE.md — the ritual now lives in two places; bloat traded for fragmentation.

**Trigger to revisit: if the ritual grows** — enough steps, edge cases, worked examples, or conditional branches that its context cost becomes real. Then extraction earns its keep. Same trigger discipline as everything else: don't pre-build.

**Mechanics, for whenever it does happen:** a skill is a folder with a `SKILL.md` (plus supporting files), invoked on demand ("run the end-of-session ritual") rather than loaded every session. It'd live in the dotfiles repo so it syncs to both machines by the existing mechanism.

## Idea 2 — A "plain-language report" skill for Claude Code

**Verdict: tabled. It wouldn't change the behavior it was meant to change.**

The idea: a skill instructing Claude Code to open every report with what happened / what it means / what's Matt's call, with technical detail below — so reports arrive readable and don't need translating in Claude.ai.

Why it was tabled: **the translation isn't why the pasting happens.** Two distinct reasons to paste a CC report into Claude.ai:

1. **Translation** — wanting the plain-language version. Skill-shaped, fixable at the source.
2. **Thinking partner** — wanting to *decide* something (merge or not, is this finding real, does this change the plan). Not translation; needs the accumulated conversation context that Claude.ai has and a skill can't carry.

As long as reason 2 exists, the paste happens anyway — and once pasted, the plain-language version comes for free. So the skill would prevent very little.

Honest secondary note: the plain-language preference is *already* in the Claude.ai project instructions and isn't followed consistently there either. Fixing instruction-adherence in the place that already has the instruction is the cheaper problem.

## The better first skill — what to actually watch for

If the goal is to learn skill authoring on something that compounds, the candidate isn't the ritual. It's **something reused across projects that currently gets re-explained each time.** Two live candidates:

- **The harness goal-doc format** — written repeatedly, in different repos, same shape each time (what to build, the contract, verification including credentialed smoke, out-of-scope, hard rules, done-means).
- **The review brief structure** — focus areas by blast radius, hard constraints, the "green suite proves nothing about X" warning, report-by-severity, fix-nothing.

Both are genuinely reusable, both are currently rebuilt by hand, and neither has a machine-specific split. That's where a skill would actually pay.

---

## The pattern underneath all three

Modularize when a thing is **reused, changing, or heavy**. The ritual is none of those yet. The goal-doc and review-brief formats are the first two.
