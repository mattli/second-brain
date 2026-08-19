# Addendum: Voice Tutor landing page — runnable verification contract

**Status:** addendum to [[2026-08-18-landing-page-goal]]. Written 2026-08-18, before the run launched.
**Why this exists:** the goal doc's Verification section had two criteria that no tool on
this machine could check, one with no anchors to check against, and one that contradicted
another. This doc records the resolutions Matt made and the contract as actually frozen.
The goal doc is a record and was not edited.

**Run target:** `~/development/voice-tutor-landing` (new repo, created for this run).
Nothing in `~/development/voice-tutor` is touched — the goal's out-of-scope list requires it.

---

## What was wrong, and how it was resolved

**1. "No horizontal scroll at 375px" — needed a layout engine; nothing here had one.**
Resolved by installing Playwright + Chromium (one-time download, offline thereafter),
now available for future frontend goals. Widened at Matt's direction: no horizontal
overflow at **375px, 768px, and 1280px**, plus **no console errors** at each.

> **Hermeticity.** Chromium loads a `file://` URL only. The verifier registers a
> request listener and fails the run if any non-`file://` request is attempted, so the
> browser stage cannot silently become a network test. No credentials, no live Supabase
> call, no DNS. The insert path is verified by reading the code, never by executing it.

**2. "Valid HTML5" — no validator present.** The only installed tool was Apple's `tidy`,
built 2006, which predates HTML5 and would have rejected correct markup outright.
Resolved by installing `html-validate` (pure JS, offline).

**3. "All six sections present, in order" — nothing to key on.** Resolved by pinning
six `<section>` elements with ids in document order:
`hero`, `how-it-works`, `different`, `who`, `disclosure`, `signup`.

**4. Criterion 5 contradicted criterion 3.** As written it banned "any token-shaped
string" while criterion 3 required the Supabase publishable key — which is token-shaped.
That is [[dev-harness]] unwinnable-contract cause #4 (a contract demanding what the goal
forbids), and it would have failed correct work for containing exactly what the spec
required. Rewritten to ban three literals only: `taild1f9b7`, `ts.net`, `?u=`.

## The Supabase key is public by design

`sb_publishable_…` is a client-side key. It ships in the page in the clear, in a named
constant. **No obfuscation, no encoding, no scrubbing** — the insert-only RLS policy is
what protects the list, and pretending otherwise would only obscure that. The verifier
pins the key's exact value and asserts `service_role` appears nowhere.

## Deliberately NOT machine-checked

**Visual quality and copy.** The verifier proves the page is structurally sound,
accessible, hermetic, and within budget. It cannot judge whether the writing lands, the
positioning holds, or the page looks credible. **Matt reviews the rendered page himself
after the run** — this is where the original 375px criterion's intent survives: the
browser check proves nothing *overflows*, not that it *reads well*.

Also unenforced by machine: the no-cards commitment, the ban on "AI-native", no fake
social proof, and the tone of the honest-disclosure section. These are graded by the
harness evaluator against the goal text, and by Matt on read.

## The frozen contract — 30 checks in `verify.mjs`

Static: valid HTML5 · exactly one outbound host and it is Supabase · no `<link href="http`,
`<script src="http`, `@import`, `url(http` · URL and key each appear exactly once, bound
to `const SUPABASE_URL` / `const SUPABASE_KEY` · no `service_role` · none of the three
banned literals · every field has a `<label for=…>` · under 50KB · six section ids in
order · button disabled before `fetch` and re-enabled on the failure path · a `catch`
path exists · `mailto:` fallback present · viewport meta present.

Browser (file:// only): no horizontal overflow and no console errors at 375 / 768 / 1280px.

`verify.mjs` is committed to the target repo and **must not be modified by the generator** —
it defines the bar, it is not the work. Verified by hash after the run.

**Preflighted before launch** (per the harness's own rule that a verifier be proven to
start, and proven satisfiable): the script was run against a missing file, a junk stub,
and a hand-written minimal page. It failed the first two with legible reasons and passed
the third **30/30**, so the contract is winnable. Both tools were positive-controlled
first — Chromium correctly caught a 2008px overflow and 2 console errors on a bad fixture.

## Related

- [[2026-08-18-landing-page-goal]] — the goal this addendum serves
- Backlog item *"Playwright verifier lane for UI goals"* (2026-07-18) — this run is that
  trigger firing. The lane now exists as a per-run script; whether it becomes a
  first-class harness verifier option is still open.
