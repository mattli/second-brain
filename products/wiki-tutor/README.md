# WikiTutor

Local web app for tutored learning through a personal markdown wiki. The **web track** of the WikiTutor concept, parallel to the existing Telegram wiki-tutor group (NanoClaw `wiki-tutor`, see `areas/nanoclaw/2026-04-11-001-feat-wiki-tutor-group-plan.md`) and the voice-tutor (`products/voice-tutor/`).

Repo: `~/Development/wiki-tutor/` (local, not yet pushed).

## Status

**V0 shipped** (2026-04-22). **Session UX pivoted twice since:**

- **2026-04-23** — "hidden wiki, reveal on answer" (one question per `##` section, answering unlocks that section).
- **2026-04-29** — replaced again, this time around a [Claude Design](https://claude.ai/design) handoff bundle ("Wiki Tutor — Study Companion"). The bundle proposed three layouts; **Layout A · Floating context card** was the chosen direction. Cozy reading-app aesthetic — warm paper, dim sepia ink, Newsreader serif body + Inter Tight UI, single muted amber-clay accent. The 20-question loop and the reveal-on-answer flow are both gone; the new shape is reader-led, sentence-level retrieval.

How a session works now:

- **Home** — folder-grouped page list. Search bar, header coverage stat, and per-row coverage dots are all currently **hidden** (commented out, not deleted; one-line uncomment to restore each).
- **Session** — single full-width article rendered with sentence-level segmentation (`<span class="sentence" data-sid="...">` per sentence, depth-aware so wikilinks aren't sliced). Click any sentence → action chip with **Explain simply / Define / Examples** → context card appears tethered to the selection with a thin dashed connector. Floating voice orb (bottom-right) for placeholder voice exchanges with ghost-text transcript. End-session button writes a markdown summary to `./sessions/<stamp>-<id>.md` and shows a summary-card overlay.
- **Coverage grid** — currently 404'd via `notFound()`; render logic preserved as a private function so re-enabling is one line.

Internals:

- State shape rewritten: per-page `{ highlights: { [sentenceId]: action }, sentenceCount, lastSession, sessionIds }`; per-session `{ pageSlug, highlights, history, voice, … }`. Coverage tiers are now `untouched / explored / deep` based on % of sentences highlighted (`DEEP_RATIO = 0.4`). Old `responses[]` / 20-question / section-question state is gone — no backwards compat (gitignored anyway).
- Tutor boundary collapsed to two placeholder functions in `src/lib/tutor.ts`: `getContext(page, sentenceText, action)` and `voiceReply(page, userText)`. `generateQuestions` and `gradeAnswer` are gone.
- Sentence segmentation lives in `src/lib/markdown.ts` (`renderPage(page, index)`); `src/lib/sections.ts` deleted. Splitting builds a depth-aware plain-text-to-HTML offset map and only accepts boundaries at depth zero.

Repo README at `~/Development/wiki-tutor/README.md` is up to date as of 2026-04-29. New project `CLAUDE.md` codifies the "hide, don't delete" working pattern for V0 iteration.

## Why it exists

Testing the Karpathy-pattern wiki loop as a **local web UI** with real data instead of another hour of spec'ing. The goal of V0 is to see how the data layer and interaction model feel on a real wiki — not to ship a product.

Three existing WikiTutor surfaces as of 2026-04-22:

1. **Telegram wiki-tutor group** (NanoClaw) — reference-librarian persona, menu-first, nugget not summary. Shipped 2026-04-11.
2. **Voice tutor** — conversational companion to the wiki via SmallWebRTC + phone browser. V1 shipped 2026-04-13; Reddit validation 2026-04-14.
3. **Web V0** (this) — tutored learning session with coverage tracking and branchable linked pages. Shipped 2026-04-22.

Strategic context in `products/voice-tutor/README.md` status section (Wikiwise finding, 2026-04-16): Readwise's founder is shipping his own Karpathy-pattern wiki tool, so the tutored-companion angle is WikiTutor's edge, not wiki compilation itself.

## Key decisions

- **Wiki directory is read-only by design.** WikiTutor never writes to it. All state lives in `./.wikitutor/state.json` and `./sessions/*.md` inside the project root. Both paths are in `.gitignore`.
- **Tutor swap-in is a single file.** `src/lib/tutor.ts` is the entire LLM boundary. Two functions only: `getContext(page, sentenceText, action)` and `voiceReply(page, userText)`. Streaming both is the natural next step when wiring real model calls.
- **Layout A is the chosen direction (2026-04-29).** From the Claude Design handoff bundle. Floating context card tethers to the selected sentence. Layouts B (margin notes) and C (inline expansion) exist in the design source but were not chosen — don't reintroduce them without asking.
- **No backwards compatibility during V0 iteration (2026-04-29).** Each pivot wipes `./.wikitutor/state.json` and `./sessions/`. Both are gitignored; nothing in them is durable.
- **"Hide, don't delete" during iteration (2026-04-29).** When Matt says "hide X" he means comment out the call site, not delete the implementation. State/computation that backs hidden surfaces should keep updating. Captured in the repo `CLAUDE.md`.
- **Sample wiki models real wiki shape.** 13 pages across `concepts/`, `people/`, `sources/` with rich cross-linking — mirrors `resources/wiki/` so UI decisions tested on samples translate.
- **Coverage tiers (V0.2):** `untouched` (no sentences highlighted) / `explored` (≥1) / `deep` (≥40% of the page's sentences). Currently surfaced nowhere in the UI but state still updates.

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

- **Run V0.2 against `resources/wiki/`** on real content. Sample wiki has been the testbed; real content will surface where the sentence segmenter misbehaves (Markdown lists with sentence-shape items, multi-sentence figure captions, etc.).
- **Wikilink hover-to-peek.** Wikilinks render inside the article but are inert in the floating-card flow. Likely next addition: a small peek card on hover, separate from the sentence chip.
- **Plug in a real Claude call** in `src/lib/tutor.ts`. Streaming preferred for both `getContext` and `voiceReply`. The API routes (`/api/sessions/[id]`) already pass the necessary context — no wiring changes needed.
- **Real voice loop.** Voice orb is a placeholder ghost-typer today. Reuse the voice-tutor pipeline (Pipecat + Cartesia + Deepgram) here? Open question — see "convergence" below.
- **Convergence with voice-tutor.** Voice-tutor's study-companion mode (shipped 2026-04-26 on `feat/study-companion-mode`) and this share the same shape: pick a doc, get tutored on it, get a session artifact. Decide whether they merge (shared session format, shared transcript schema) or stay distinct surfaces tuned to text vs. voice.
- **Re-enable hidden surfaces deliberately.** Coverage page, home search, header coverage stat, per-row coverage dots are all commented out. Re-enable individually as the product needs them — not all at once.
