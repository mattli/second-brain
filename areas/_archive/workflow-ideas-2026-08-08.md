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

If the goal is to learn skill authoring on something that compounds, the candidate isn't the ritual. It's **something reused across projects that currently gets re-explained each time.** Three live candidates, in descending order of obviousness — all three are the harness workflow's connective tissue, all three are rebuilt by hand every time, and all three carry hard-won lessons that currently survive only in Matt's head or in scattered docs.

### 1. The harness goal doc — the natural first

Four written in a week: coverage judge, codebase-map, incremental judging, plus the wiring brief. Same skeleton every time:

- Why this exists (the problem in plain terms)
- What to build — the contract: what goes in, what comes out
- The mechanics that must be right (what acceptance actually tests)
- Verification — hermetic tests **plus a credentialed smoke as acceptance criteria, not an afterthought**
- Explicitly out of scope
- Hard rules (read-only paths, never restart production, don't push)
- Done means

They've gotten better each time. The last one carried "the prompt is a versioned INPUT the module doesn't own" — a framing that only exists because Matt pushed back mid-conversation. That accumulated learning has no home. A skill with the template plus two real examples would make each new goal doc start at the current best rather than from scratch.

### 2. The review brief

**What it is:** the document handed to a *fresh* Claude Code session so it can review a branch cold — without having built the thing, and without inheriting the builder's assumptions. Written three times so far (wiring review, read-path review, incremental module's upcoming one), same structure each time:

- **Focus areas ordered by blast radius** — what to attack first, hardest. File-moving and authorization outrank display logic.
- **Hard constraints** the change must not violate (e.g. the judge never blocks the voice path; a coverage failure degrades to no data, never to a broken session).
- **The honest warning about what tests don't cover** — "the suite is 643 passing, but per this repo's standing rule a green suite proves nothing about `bot.py` or the browser."
- **Report by severity. Fix nothing.** Matt sees findings before anything changes.

**The hard-won rule embedded in it:** reviewers must be **fresh context**. An in-process "adversarial lens" shares the author's assumptions and does not count — this was caught mid-review once, when the review machinery disclosed it couldn't find a peer CLI and fell back to reviewing itself. A skill would carry that rule automatically instead of depending on catching it again.

### 3. Launch preconditions — less obvious, arguably highest value

**What it is:** the checks that must pass *before* a harness run starts, because failing them costs hours rather than minutes. Every launch needs the same ones:

- Target repo clean and on the expected branch
- The API key reachable **by absolute path from inside a worktree** — `.env` is gitignored, so it does not exist there
- **The verifier command actually runs in a worktree** — a worktree contains only *tracked* files, so a gitignored `.venv` isn't there and bare `pytest` resolves to a system Python with nothing installed
- Any repo the run needs to create actually exists (a greenfield target needs `git init` before launch)
- Read-only targets confirmed readable

This is where the most time has been lost. The venv trap cost a sprint on the codebase-map run and an hour on the incremental-judging run. It's a checklist, it's identical every time, and forgetting it is expensive — which is exactly the profile of a thing that should be a skill rather than a habit.

---

## The pattern underneath all of this

Modularize when a thing is **reused, changing, or heavy**. The ritual is none of those yet. The goal-doc and review-brief formats are the first two.

## Skills vs. lessons — the filter that actually decides

A fair objection: most of the above is *already* written down, in `CLAUDE.md` sticky notes and `docs/solutions/` compound-engineering docs. So why would a skill add anything?

The distinction is **rules vs. artifacts, and knowing vs. doing.**

- A **lesson** says *"the verifier env must live outside the repo."* A fact you need at the right moment. CLAUDE.md is good at this — always loaded, short, broadly applicable. `docs/solutions/` is the long-form version with the worked example.
- A **skill** produces *a thing*. Not "remember goal docs need a credentialed smoke" but "here is the template, here are two real examples, fill it in." The output is an artifact, not a recollection.

**The specific evidence that lessons alone aren't enough here:** the venv lesson was written on 2026-08-06 — a `docs/solutions/` doc *and* a sticky note in dev-harness's `CLAUDE.md`, which is loaded at session start. On 2026-08-07 the incremental-judging run hit the same wall and lost roughly an hour. The rule existed, was documented, was pointed at from the file read at startup — and it still didn't fire, because nothing forced the check to *happen* at the moment of launching.

**So the filter is:** add a skill only where the failure mode is *not-remembering-at-the-moment-of-doing*, not where the failure mode is *not-knowing*. Lessons fix not-knowing. Checklists and templates fix not-doing.

By that filter:

1. **Launch preconditions** — strongest candidate. Documented failure that *recurred despite being documented*.
2. **Harness goal doc** — second. Rebuilt from memory each time, so each version is only as good as what happened to be top of mind (the "prompt is a versioned input" framing exists in exactly one of four).
3. **Review brief** — third, and may not need it.

