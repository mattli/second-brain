# WikiTutor

Local web app for tutored learning through a personal markdown wiki. The **web track** of the WikiTutor concept, parallel to the existing Telegram wiki-tutor group (NanoClaw `wiki-tutor`, see `areas/nanoclaw/2026-04-11-001-feat-wiki-tutor-group-plan.md`) and the voice-tutor (`products/voice-tutor/`).

Repo: `~/Development/wiki-tutor/` (local, not yet pushed).

## Status

**V0 shipped** (2026-04-22). **Session UX redesigned** (2026-04-23) around "hidden wiki, reveal on answer" — page content is locked by default; the tutor asks one question per `##` section and answering unlocks that section on the page. Next.js 14 + TypeScript + Tailwind + App Router. Reads a markdown wiki directory (default `./sample-wiki/`, overridable via `WIKI_PATH` env var) and exposes four screens:

- **Home** — folder-grouped page list with coverage dots, substring search, coverage stats in header. (Simplified 2026-04-23 from the original 2×2 card grid.)
- **Session** — two panes. **Left:** the wiki page with each `##` section rendered as a locked block (heading visible, body hidden under an italic placeholder); current section gets an accent left border. **Right (fixed 440px):** tutor card with one question + textarea. On Reveal, the section body fades in on the left; right pane shows user's answer + Got it / Missed it / Try again. Self-rating advances to the next section.
- **Session wrap** — template markdown document saved to `./sessions/YYYY-MM-DD-HHmm-<id>.md` in the project root
- **Coverage grid** — colored dashboard at `/coverage`, click a cell to start a session

All LLM-shaped work is placeholder for V0, isolated in `src/lib/tutor.ts` (now a single function: `generateQuestions(page, sections)`). Section-split helper in `src/lib/sections.ts`. Swap-in for a real Anthropic API call means replacing `generateQuestions` with content-aware question generation and adding a `gradeAnswer(page, section, userAnswer)` call to replace the self-rating step.

## Why it exists

Testing the Karpathy-pattern wiki loop as a **local web UI** with real data instead of another hour of spec'ing. The goal of V0 is to see how the data layer and interaction model feel on a real wiki — not to ship a product.

Three existing WikiTutor surfaces as of 2026-04-22:

1. **Telegram wiki-tutor group** (NanoClaw) — reference-librarian persona, menu-first, nugget not summary. Shipped 2026-04-11.
2. **Voice tutor** — conversational companion to the wiki via SmallWebRTC + phone browser. V1 shipped 2026-04-13; Reddit validation 2026-04-14.
3. **Web V0** (this) — tutored learning session with coverage tracking and branchable linked pages. Shipped 2026-04-22.

Strategic context in `products/voice-tutor/README.md` status section (Wikiwise finding, 2026-04-16): Readwise's founder is shipping his own Karpathy-pattern wiki tool, so the tutored-companion angle is WikiTutor's edge, not wiki compilation itself.

## Key decisions

- **Wiki directory is read-only by design.** WikiTutor never writes to it. All state lives in `./.wikitutor/state.json` and `./sessions/*.md` inside the project root. Both paths are in `.gitignore`.
- **Tutor swap-in is a single file.** `src/lib/tutor.ts` is the entire LLM boundary. Dropping in a real Claude call only touches that file (and will add a `gradeAnswer` function to replace the self-rating step).
- **Hidden wiki, reveal on answer** (2026-04-23). The session UI reveals the wiki section-by-section as the user answers. The page acts as a spatial anchor + scoreboard — by session end, the whole page is rendered on the left. Decision made after rejecting (a) chat thread alongside the full visible page, (b) stacked-reveal column with no left-side anchor. Framing: the wiki shouldn't be a reader; it should be the reward for engagement.
- **Questions are section-scoped** (2026-04-23). One template question per `##` section (plus the pre-`##` intro). Cheap V0 fallback; real LLM generates reasoning questions later. Replaces the original 20-questions-per-page template list.
- **Sample wiki models real wiki shape.** 13 pages across `concepts/`, `people/`, `sources/` with rich cross-linking — mirrors the structure of `resources/wiki/` so UI decisions tested on samples translate.
- **V0 defaults:** folders-as-topics, one question per `##` section, `discussed` threshold at 50% of per-page section count (via new `SessionUpdate.questionsTotalForPage`), substring search, desktop-only.

## Setup

```bash
cd ~/Development/wiki-tutor
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000) against `./sample-wiki/` by default. Against the real wiki:

```bash
WIKI_PATH=~/second-brain/resources/wiki npm run dev
```

## Next steps (not started)

- **Revisit loop** is where the tutor beats a reader. V0 with placeholder tutor is structurally close to a markdown reader for first-encounter material. The differentiator — retrieval practice on pages read weeks ago — needs a home-page surface ("you learned about X 17 days ago, want to refresh?") that uses existing coverage state + mtime. Cheap to build, high leverage. Likely next direction.
- Run v0.1 against `resources/wiki/` on real content. Open taste-sensitive bits surfaced 2026-04-23: locked-state treatment (italic placeholder vs. blurred text vs. heading-only), "Opening" label for intro sections, accent-stripe styling.
- Plug in a real Claude call in `src/lib/tutor.ts`. Section-aware questions, judged grading, conversational follow-ups. Deferred behind revisit loop — the LLM makes it a *better* tutor, the revisit loop makes it a *different product* than a reader.
- Decide whether this converges with voice-tutor (shared session format, memory.md) or stays a distinct surface.
- If it keeps moving: add a CLAUDE.md to the repo with the conventions that aren't obvious from the README.
- **Repo README out of date** — still describes the old 3-pane quiz flow. Refresh when v0.1 stabilizes.
