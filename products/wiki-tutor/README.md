# WikiTutor

Local web app for tutored learning through a personal markdown wiki. The **web track** of the WikiTutor concept, parallel to the existing Telegram wiki-tutor group (NanoClaw `wiki-tutor`, see `areas/nanoclaw/2026-04-11-001-feat-wiki-tutor-group-plan.md`) and the voice-tutor (`products/voice-tutor/`).

Repo: `~/Development/wiki-tutor/` (local, not yet pushed).

## Status

**V0 shipped** (2026-04-22). Next.js 14 + TypeScript + Tailwind + App Router. Reads a markdown wiki directory (default `./sample-wiki/`, overridable via `WIKI_PATH` env var) and exposes four screens:

- **Home** — coverage stats, four entry-point cards (Pick a page, By topic, Recent activity, Uncovered) + substring search
- **Session** — 3-pane layout: question list with progress, Q&A with placeholder tutor reply, metadata + linked pages + backlinks
- **Session wrap** — template markdown document saved to `./sessions/YYYY-MM-DD-HHmm-<id>.md` in the project root
- **Coverage grid** — colored dashboard at `/coverage`, click a cell to start a session

All LLM-shaped work is placeholder for V0, isolated in `src/lib/tutor.ts` (two functions: `generateQuestions`, `placeholderTutorReply`). Swap-in for a real Anthropic API call is mechanical.

## Why it exists

Testing the Karpathy-pattern wiki loop as a **local web UI** with real data instead of another hour of spec'ing. The goal of V0 is to see how the data layer and interaction model feel on a real wiki — not to ship a product.

Three existing WikiTutor surfaces as of 2026-04-22:

1. **Telegram wiki-tutor group** (NanoClaw) — reference-librarian persona, menu-first, nugget not summary. Shipped 2026-04-11.
2. **Voice tutor** — conversational companion to the wiki via SmallWebRTC + phone browser. V1 shipped 2026-04-13; Reddit validation 2026-04-14.
3. **Web V0** (this) — tutored learning session with coverage tracking and branchable linked pages. Shipped 2026-04-22.

Strategic context in `products/voice-tutor/README.md` status section (Wikiwise finding, 2026-04-16): Readwise's founder is shipping his own Karpathy-pattern wiki tool, so the tutored-companion angle is WikiTutor's edge, not wiki compilation itself.

## Key decisions

- **Wiki directory is read-only by design.** WikiTutor never writes to it. All state lives in `./.wikitutor/state.json` and `./sessions/*.md` inside the project root. Both paths are in `.gitignore`.
- **Tutor swap-in is a single file.** `src/lib/tutor.ts` is the entire LLM boundary. Dropping in a real Claude call only touches those two functions.
- **Sample wiki models real wiki shape.** 13 pages across `concepts/`, `people/`, `sources/` with rich cross-linking — mirrors the structure of `resources/wiki/` so UI decisions tested on samples translate.
- **V0 defaults (documented in repo README):** folders-as-topics, 20 template questions per page, `discussed` threshold at 50% of questions answered, substring search, desktop-only.

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

- Run V0 against `resources/wiki/` on Matt's actual content and react. Open design questions that only surface with real data: does 20 questions feel right? Are folders-as-topics enough? Does the branch-to-linked-page flow encourage the right kind of exploration?
- If the UI pattern holds up: plug in a real Claude call in `src/lib/tutor.ts`. Questions from page content, tutor responses that actually engage with the user's answer.
- Decide whether this converges with voice-tutor (shared session format, memory.md) or stays a distinct surface.
- If it keeps moving: add a CLAUDE.md to the repo with the conventions that aren't obvious from the README.
