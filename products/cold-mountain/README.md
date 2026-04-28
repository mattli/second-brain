# Cold Mountain — Design Docs & Content Briefs

Design documentation and content briefs for the Cold Mountain portfolio website (coldmountain.ai).

> The actual website codebase (Next.js 16, deployed on Vercel) lives in a separate repo: github.com/mattli/cold-mountain.

## Current site design

- Homepage with Selected Work grid (9 projects): Second Brain, Voice Tutor, Readwise Wiki, dotmd, Seasons Journaling, School Search AI, FreshNotes, CIEG, ListenBack
- Second Brain card is **pinned** — shown with a small rotated pin icon at the top-left corner (`CornerPin` SVG, `#b8b8b8`, `-45deg`). Gated on a `pinned: true` flag in the projects array so more cards can be pinned later.
- Voice Tutor card links to /voice-tutor. Tag: `Voice`, rose palette (`#b85a7a` text on `#f6ecef` background). Carries an italic "in progress" status — driven by an optional `status?: string` field on the project entry; when set, the card shows it lowercased in italic `#9a9a9a` next to the tag, and the detail page mirrors that styling next to its `<h1>`.
- Readwise Wiki card links to /wiki. Tag: `Wiki`, slate palette (`#637488` text on `#eef0f3` background).
- /second-brain detail page organized by capability: Intelligence & Research, Validation, Specification & Execution, Continuity Discipline (content sourced from coldmountain.md)
- /voice-tutor detail page modeled on /second-brain — sections: What it does (default wiki-grounded mode + study companion document mode), Why this exists (Socratic-method framing + thinking-out-loud-on-walks beat), Validation (summary of the two Reddit runs and the positioning that landed: *"ChatGPT voice mode bound to one document, with a recap when you're done"*), What's next (use it daily, run more validation conversations with users surfaced in the Reddit work, then one of three branches: Readwise integration / custom frontend / function calling), Stack. Names the voice pipeline explicitly: linked logos for Pipecat, Deepgram, Cartesia.
- /wiki section — public Readwise Wiki with index (6 sections) + 26 article pages. Content pulled at build time from the vault (`resources/wiki/`) via sparse clone of the second-brain repo. Markdown rendered with react-markdown + remark-gfm. Lives at coldmountain.ai/wiki. Index shows "Last updated <date>" auto-derived from the max `last_updated` frontmatter across all entries.
- /wiki navigation: sticky left sidebar on every /wiki route — section anchors on the index (`WikiNav`, `#slug` in-page) and a per-article H2 TOC on articles (`WikiToc`). Scrollspy via passive-scroll offset walk with a 160px trigger line (no IntersectionObserver). H2 IDs come from a shared `slugifyHeading()` used both by `extractH2s()` in `_lib/wiki.ts` and by an `h2` override in `markdown.tsx`, so the TOC list and the DOM IDs always agree. Back button (`WikiBackButton`) walks a sessionStorage path stack (`coldmountain:wikiStack`) so chains of any depth navigate cleanly: A → B → C → Back → B → Back → A → Back → /wiki → Back → /. Hash changes never touch the stack.
- Tool links throughout: Bird, Readwise, Parallel, Last 30 Days, Superpowers, G-Stack, Compound Engineering
- Color-coded tags: blue (iOS), purple (Web), green (AI Agent), rose (Voice), tan (Dev Tool), slate (Wiki). All muted pastels.
- Name: "Matt Li" (changed from Mathew Thomas Li)
- Tagline: "Product Manager / Builder"
- No copywriting em dashes in card descriptions — removed by preference. Commas, periods, or restructure instead.
- Header: name + tagline + LinkedIn/X/Email social icons only. No nav bar, no Wiki text link (Wiki reaches via the Selected Work card). Header→Selected-Work spacing is `2.5rem` (was `4rem` before the gradient masks were added).
- Site-wide gradient masks at top and bottom of the viewport — `body::before` / `body::after`, 96px each, fixed, `pointer-events: none`, `z-index: 40`, linear-gradient from `#f9f9f7` to transparent so scrolled content fades into the page background instead of being abruptly clipped. Anything fixed in the top/bottom 96px band needs to sit above `z-index: 40` or stay tall enough to peek out.
- Scroll-to-top button: small muted circle fixed at bottom-center of viewport, fades in after ~400px scroll. Defined in `app/_components/ScrollToTop.tsx`.
- No page footers — previously had a muted mattli8020@gmail.com line on each page; removed 2026-04-21. The homepage's header Email social icon remains as the sole email link.
- "What I'm Learning" section written but removed from the live page for now — could be re-added later

## Open / next steps

- Resume webpage — built a full /resume page and homepage link but reverted; come back to this when ready

## /wiki pipeline

- Source: `~/second-brain/resources/wiki/` (synced to `github.com/mattli/second-brain`)
- Build-time fetch: `scripts/pull-wiki.mjs` does `git clone --depth 1 --filter=blob:none --sparse` of `resources/wiki`, copies into gitignored `.wiki-content/` (cp, not symlink — Turbopack rejects out-of-root symlinks)
- Env vars: `WIKI_LOCAL_PATH` for local dev, `VAULT_REPO_URL` + `VAULT_GITHUB_TOKEN` on Vercel
- Runs via `predev` / `prebuild` scripts in `package.json`
- Excluded: index.md, README.md, last-run-manifest.md, folder-review.md, unorganized.md, long-form/, raw/
- **Auto-deploy:** NanoClaw hosts a `POST /cold-mountain-deploy` proxy route that reads `COLD_MOUNTAIN_DEPLOY_HOOK` from its own `.env` and forwards to Vercel. The weekly wiki compile and monthly folder-review jobs both curl the proxy right after `git push`, so the fire is gated on "the push actually contained changes." See the "After Writing" section of `areas/wiki/instructions/readwise-wiki.md`. Wired 2026-04-21.

## Contents

- **README.md** — This file; overview of the site's design and structure
- **coldmountain.md** — Second Brain feature brief (source content for the /second-brain page)
