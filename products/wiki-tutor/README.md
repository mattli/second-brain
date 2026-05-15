# WikiTutor

Single-document study tutor (working name; will rename before external launch — see `product-framing.md`). User uploads a PDF, studies it conversationally with an AI tutor, gets an async recap. Validated 2026-04-26 (Reddit research).

Repo: `~/Development/wiki-tutor/` (local, not yet pushed).

**Canonical product docs**: `product-framing.md`, `architecture.md`, `mvp-scope.md` (all in this folder). Read these before non-trivial work.

## Status

**V1 in progress (status as of 2026-05-14).** Features #1–6 shipped (with #5/#6 in narrow form — single Explain action, no chat). Reading-progress, document delete, persistent explanation cache, paragraph notes, and tiered explanations layered on top. The tiered-explanation work (TLDR / Expanded / With Examples) is the first feature that genuinely reads as "tutor" rather than "reader" — escalating help in service of comprehension. Strategic flag still stands: the chat/session/artifact loop (#7 → #9) is the differentiator and is not yet built.

- **#1 Auth (✅ shipped 2026-04-29)** — Supabase magic-link, RLS-isolated per user. Code at `src/lib/supabase/`, `src/middleware.ts`, `src/app/login/`, `src/app/auth/`.
- **#2 PDF upload + storage (✅ shipped 2026-04-29)** — `POST /api/documents` (multipart, ≤50MB, PDF magic-byte validation), SHA-256 content-hash dedup, original + extracted markdown stored in private Supabase Storage bucket `documents/<user_id>/<doc_id>/`. Extraction via `unpdf` (Mozilla pdf.js, no native deps). Migration: `supabase/migrations/0001_documents_schema.sql`.
- **#3 Library view + upload UI (✅ shipped 2026-04-30)** — Server-rendered library at `/` with the document list and a drag-and-drop dropzone. Synchronous upload (no job queue — v1.5 concern); indeterminate progress bar with branched copy. Click-through to `/document/[id]`. Old V0 wiki home moved to `/wiki` (still routable, not linked).
- **#3.5 Markdown file support (✅ shipped 2026-04-30)** — Same upload endpoint accepts `.md`/`.markdown` alongside `.pdf`. Frontmatter stripped via `gray-matter`; body stored verbatim — wikilinks, dataview blocks, callouts, code fences pass through. Frontmatter `title` becomes the document title when non-empty, else filename. `source = 'markdown_upload'`. SHA-256 dedup is cross-kind.
- **#4 Reading view (⚠️ partially shipped 2026-04-30)** — `/document/[id]` server-renders, branches on `documents.source`. Markdown renders via the unified pipeline (wikilinks render as inert greyed `wikilink-missing` spans since uploads aren't part of a wiki). PDF renders the *original* file via `react-pdf` (dynamic import, `ssr: false`). Stable ID schemes locked in for feature #10 reuse: markdown paragraphs `<docId>-p<paraIdx>` (interactive unit), markdown sentences `<docId>-p<paraIdx>-s<sIdx>` (still emitted as inert spans for RAG chunking), PDF `<docId>-page<pageNumber>-s<sIdx>`. **Markdown paragraph-click works.** **PDF sentence-click is disabled** behind `PDF_OVERLAYS_ENABLED = false` flag — the Option B matching algorithm (substring-match `extracted.md` sentences against pdf.js textLayer spans) produced false-positive overlays on real academic papers; matcher still runs for diagnostic logs. Architectural decision deferred.
- **#5 (preview) Click-to-explain (✅ shipped 2026-04-30; PDF native-selection 2026-05-01; persistent cache + brevity prompt 2026-05-11)** — Single fixed action ("Explain"), click-driven on markdown paragraphs, native browser selection on PDFs. Right-side panel slides in with a Sonnet 4.6 explanation grounded in the full document. Persistent highlight on the source paragraph as a memory cue. **Cache now survives reloads** via `paragraph_explanations` table (markdown only — PDF selection ids are character-offset based and not re-clickable); seeded into the in-memory cache at page render. Late responses still cache even if the user clicks away mid-fetch (the network request is no longer aborted on supersede). Brevity rule in the prompt (2026-05-11) — explanation should be no longer than the passage. Out of scope (do NOT extend without scoping): multi-action menu, chat / follow-up, session state, streaming, RAG / chunking.
- **Reading-progress feature (✅ shipped 2026-05-07; gutter rework + dwell threshold 2026-05-11)** — Markdown only. Eye icon in a 32px left gutter when a paragraph dwells in the upper 25% of the viewport for ≥1.5s (dwell filters fast-scroll false positives). Sparkle icon in the same gutter on click-to-explain. 2px progress bar across the reader top, scaleX-driven so it clips inside the visible reader area when the explain panel opens. Resume button in the header that scrolls to the highest-index read paragraph; shifts left in lockstep when the panel opens. Marks hidden below 768px. Per-doc progress bars on each library row (`paragraph_count` denominator, `COUNT(DISTINCT paragraph_read)` numerator). Engagement events (`paragraph_read` added in migration `0003`) feed the UI today and the recall layer later.
- **Document delete (✅ shipped 2026-05-07)** — `DELETE /api/documents/[id]` removes storage objects + row; library row hover-revealed trash icon with two-step inline confirm.
- **Paragraph notes (✅ shipped 2026-05-14)** — Markdown only. One editable note per paragraph hosted in the same panel as the explanation; display-mode card with a pencil affordance, click to edit, Cmd/Ctrl+Enter to save, Escape to revert an in-progress edit. New `paragraph_notes` table keyed on `(user, doc, chunk) UNIQUE`. Pencil joins eye/sparkle in the gutter (column order: eye → sparkle → note). PDFs excluded — selection IDs aren't re-readable, so notes would orphan. Migrations `0006` + `0007` (adds `note_save` / `note_delete` events).
- **Tiered explanations (✅ shipped 2026-05-14)** — The Explain panel now grows progressively through three prompts: **TLDR** (the gist), **Expanded** ("Still confused?" → adds the implicit bridge: unstated steps, undefined terms, leaned-on assumptions), **With Examples** ("Define terms & give an example" → term defs inline + worked example). Each tier appends below the prior without restating; prior tiers passed into the user-turn so the model knows what to skip. New tutor-identity system header ("you're a tutor sitting next to someone reading"). `paragraph_explanations` now keyed on `(user, doc, chunk, depth)` — up to three rows per paragraph; reloads preserve whatever depth was unlocked. New `explanation_expand` engagement event captures the difficulty signal that `paragraph_click` can't (every paragraph view starts with a click). Migrations `0008` + `0009`. First feature that reads as "tutor" rather than "polished reader."

**V1 remaining**: PDF sentence-click decision still parked (native browser selection works; per-sentence overlays still gated off — see `open-questions.md` "PDF reading experience"), full multi-action menu (#5 proper), chat (#7), session state (#8), end-of-session artifact (#9 — `mvp-scope.md` flags this as the load-bearing one), vector storage + RAG with grounding constraint (#10), source-type metadata (#11 — woven throughout), full progress tracking (#12 — currently markdown only). See `mvp-scope.md` for build order.

### Strategic flag (2026-05-11)

The reading layer (auth, upload, library, reader, click-to-explain, read-tracking) is connective tissue that any reading app needs — including Readwise Reader. Continuing to polish the reading view will make WikiTutor converge on Readwise by default. The validated 2026-04-26 pain was specifically "no listener for active recall," not "I want a nicer reader." The differentiator lives in the unbuilt #7→#9 loop (chat → session → artifact). Next move: ship a crappy artifact prototype over today's engagement events to validate whether the recap concept itself feels valuable, before investing in chat + session infrastructure.

### Open architectural decision (next session)

PDF sentence-click matching produced false-positive overlays on a real academic PDF (Elmira van den Broek "Unpacking AI at work" — body pages 11–47% matched, bibliography pages 14–20%, with many "matches" landing on whitespace or unrelated text). Two paths:

- **(A)** Replace substring matching with stronger alignment (token-level Smith-Waterman / fuzzy diff that tracks position, not just first occurrence).
- **(B)** Drop per-sentence overlays for v1 PDFs entirely; rely on native browser text selection. Markdown documents keep overlays since alignment is exact.

PDF reading still works today — pages render, text selection is fully functional. Only the per-sentence click overlays are suppressed. Captured in repo `CLAUDE.md` "PDF sentence-click implementation" section with the failure modes spelled out.

### Earlier in the day (context for the pivot)

The day involved several product reframings before settling on single-document PDF study:

- Morning: V0 markdown-wiki reader still in place. Considered Readwise import as v1 feature #2 (planned but not built — no code written).
- Afternoon: 2026-04-26 validation findings (Reddit research, 1,330 posts) re-anchored the product to single-doc study tutor — the validated pain is "PDF paralysis" and "no listener for active recall," not wiki management. Product docs rewritten (`product-framing.md`, `mvp-scope.md`, `architecture.md`).
- Evening: V1 build kicked off against the new anchor. Auth + PDF pipeline shipped.

V0 surfaces (home page list, session screen, coverage grid) still exist in the repo as scaffolding — the routes are gated behind auth now but otherwise unchanged. They will be retired or repurposed as V1 features land (library view in #3 will likely replace the V0 home).

### V0 history (for reference)

V0 was a local markdown-wiki reader, shipped 2026-04-22, then iterated through two session-UX pivots:

- **2026-04-23** — "hidden wiki, reveal on answer" (one question per `##` section, answering unlocks that section).
- **2026-04-29 (morning)** — replaced again, around a [Claude Design](https://claude.ai/design) handoff bundle ("Wiki Tutor — Study Companion"). Three layouts proposed; **Layout A · Floating context card** chosen. Cozy reading-app aesthetic — warm paper, dim sepia ink, Newsreader serif body + Inter Tight UI, single muted amber-clay accent.

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

## Next steps (V1 build)

Per `mvp-scope.md`:

- **#3 Library view** — list of uploaded documents, click to open. First UI for the upload pipeline.
- **#4 Reading view** — PDF rendering with text selection (drives highlight + scroll/time tracking later).
- **#5 Highlight + selection mechanic** — define / explain / ask actions on selected text.
- **#6 LLM API integration** — wire AI behind menu actions. Source-only grounding constraint kicks in here (validated user is law/med; hallucination is a dealbreaker).
- **#7 Chat / Q&A** — follow-up surface.
- **#8 Session state + artifact generation** — closes the loop.
- **#9 Vector + RAG with grounding constraints** — what makes it not-NotebookLM.
- **#10 Source-type metadata** — woven throughout, not a discrete step.
- **#11 Progress tracking** — passive scroll/time + engagement signals.

V1.5 (post-validation): **voice mode**. The validated workaround is voice ChatGPT + PDF; voice should be added once the text loop ships. See `product-framing.md` "Voice: in scope, deferred to v1.5+".
