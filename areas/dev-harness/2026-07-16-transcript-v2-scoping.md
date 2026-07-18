# Transcript v2 — Scoping (2026-07-16)

*Extracted from backlog per the "backlog lines stay short, detail lives in linked docs" convention. Status: scoped, not built.*

> **2026-07-17 field evidence:** first real transcript handed to Matt (mrplqx5g, wiki-grounding extraction, 96/100) was unreadable to its intended audience — the verbatim frozen contract (~13 criteria of adversarial legalese) buried the story, and the 4-point deduction and 2 revisions had no narrative at all. Confirms the north star in one sentence: **summarize the contract, narrate the work.** Contract gist target: one line per criterion ("naming, verbatim moves, hermetic tests, exclusion rulings — all met; full text in trace appendix").

## The problem

Today's `transcript.md` violates the "transcript is a product surface" rule two ways: it **dumps frozen contracts verbatim** (the v5 Voice-Tutor contract renders ~9 criteria of dense LLM prose inline, burying the story) and gives **no per-revision narrative** (sprint 1's 12→22→18 revisions collapse to one summed line — no evaluator feedback, no verifier output, no score-change story).

## Matt's spec for what a transcript should be

1. High-level planning/negotiation log — how many rounds, what changed each round, how long
2. Per sprint, **each revision as its own short section** — what was attempted, what the verifier said, what the evaluator docked, the score, cumulative time+$
3. Plain-language "what went wrong" on failure
4. Full contracts + raw detail **collapsed/appended as reference, never blocking the narrative**
5. Keep the existing top summary block (that part works)

## What the trace persists today

(Checked `src/trace/types.ts`, `writer.ts`, `orchestrator/run.ts`, `agents/evaluator.ts`, `agents/negotiator.ts`.) Per event only `ts, phase, agentRole, contractVersion, toolCalls[], tokens, costUsd`, plus `score` on EVALUATE and the full `contract` on NEGOTIATE. Critically, the evaluator's feedback and the verifier's result **are computed at runtime but discarded** — `evaluateArtifact` returns `{score, findings}` and the verifier returns `{passed, findings}`, yet `run.ts` writes only `score`. The negotiator writes **no** per-round events; the orchestrator logs one NEGOTIATE event per sprint at freeze (final contract + `version` + `agreement|round-cap`).

## (a) Recoverable for PAST runs vs. FUTURE-only

**Re-renderable now from existing traces** (pure renderer, retroactive on all 3 archived runs): per-revision **score trajectory** (`[96,12,22,18]` confirmed present), **cost per revision** + cumulative $, **durations** (every event has `ts`), **activity line** from tool-call counts ("wrote N files, ran M commands"), **negotiation round count** (= `contract.version`) + freeze reason, **halt reason** in plain language, and **contract summarize-in-narrative / full-in-appendix** (full contract is on disk).

**FUTURE-only** (never persisted — gone for past runs): the **evaluator's per-revision findings** ("what was docked"), the **verifier's per-revision pass/fail + findings**, and **what changed each negotiation round** (intermediate contract versions + critic feedback — only the final version survives). Per-revision *diffs/code* are also unrecoverable (only the final passing revision is git-committed).

## (b) Scoped v2 — two independently shippable layers

**Layer 1 — Renderer v2** (pure, no schema change, retroactive): restructure into Summary (unchanged) → Planning & Negotiation (rounds, freeze reason, wall time per sprint) → per-revision sections (score, Δ from prior, cost, cumulative $/time, activity, decision) → plain-language outcome → **Reference appendix** (collapsed contract summaries + full verbatim criteria live here, never in the narrative). Contract summary = reduce each criterion to a short gist + count + freeze reason. Guards degrade-don't-throw on absent fields (existing convention), so v1 traces render the skeleton cleanly. Delivers ~80% of the spec on existing runs. Cost: renderer + tests; re-render offline via the existing `finalize()`-duplicate path.

**Layer 2 — Trace enrichment** (additive optional fields, future runs only): add `feedback?: string[]`, `verifierPassed?: boolean`, `verifierFindings?: string[]` to EVALUATE (data already in hand at `run.ts:161`/`156` — just thread it into the `traceEvent` call; trivial) → fills "what the verifier said / what the evaluator docked"; optionally `diffStat?` on GENERATE for richer "what was attempted"; and have `negotiate()` emit a per-round event (round n, critic verdict, contract delta) → fills "what changed each round" (largest slice — touches negotiator control flow). All fields optional ⇒ backward-compatible; renderer v2 shows them when present.

## Sequence

Ship Layer 1 first (immediate, retroactive, zero run-loop risk), then Layer 2's evaluator+verifier fields (cheap, high-value), then negotiation-round tracing (separate, larger). Supersedes the "expose `transcript <run>` CLI" deferred item in the phase-2 plan (that CLI is the natural delivery vehicle for re-rendering v2 over old traces).
