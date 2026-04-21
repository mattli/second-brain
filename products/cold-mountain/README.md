# Cold Mountain — Design Docs & Content Briefs

Design documentation and content briefs for the Cold Mountain portfolio website (coldmountain.ai).

> The actual website codebase (Next.js 16, deployed on Vercel) lives in a separate repo: github.com/mattli/cold-mountain.

## Current site design

- Homepage with Selected Work grid (8 projects): Second Brain, Readwise Wiki, dotmd, Seasons Journaling, School Search AI, FreshNotes, CIEG, ListenBack
- Second Brain card is **pinned** — shown with a small rotated pin icon at the top-left corner (`CornerPin` SVG, `#b8b8b8`, `-45deg`). Gated on a `pinned: true` flag in the projects array so more cards can be pinned later.
- Readwise Wiki card links to /wiki. Tag: `Wiki`, slate palette (`#637488` text on `#eef0f3` background).
- /second-brain detail page organized by capability: Intelligence & Research, Validation, Specification & Execution, Continuity Discipline (content sourced from coldmountain.md)
- /wiki section — public Readwise Wiki with index (6 sections) + 26 article pages. Content pulled at build time from the vault (`resources/wiki/`) via sparse clone of the second-brain repo. Markdown rendered with react-markdown + remark-gfm. Lives at coldmountain.ai/wiki. Index shows "Last updated <date>" auto-derived from the max `last_updated` frontmatter across all entries.
- Tool links throughout: Bird, Readwise, Parallel, Last 30 Days, Superpowers, G-Stack, Compound Engineering
- Color-coded tags: blue (iOS), purple (Web), green (AI Agent), tan (Dev Tool), slate (Wiki). All muted pastels.
- Name: "Matt Li" (changed from Mathew Thomas Li)
- Tagline: "Product Manager / Builder"
- No copywriting em dashes in card descriptions — removed by preference. Commas, periods, or restructure instead.
- Header: name + tagline + LinkedIn/X/Email social icons only. No nav bar, no Wiki text link (Wiki reaches via the Selected Work card).
- Scroll-to-top button: small muted circle fixed at bottom-center of viewport, fades in after ~400px scroll. Defined in `app/_components/ScrollToTop.tsx`.
- No page footers — previously had a muted mattli8020@gmail.com line on each page; removed 2026-04-21. The homepage's header Email social icon remains as the sole email link.
- "What I'm Learning" section written but removed from the live page for now — could be re-added later

## Open / next steps

- Resume webpage — built a full /resume page and homepage link but reverted; come back to this when ready
- Wire NanoClaw → Vercel deploy hook so the weekly wiki compile auto-deploys /wiki (backlog item; requires `COLD_MOUNTAIN_DEPLOY_HOOK` env in NanoClaw + curl in readwise-wiki compile script)

## /wiki pipeline

- Source: `~/second-brain/resources/wiki/` (synced to `github.com/mattli/second-brain`)
- Build-time fetch: `scripts/pull-wiki.mjs` does `git clone --depth 1 --filter=blob:none --sparse` of `resources/wiki`, copies into gitignored `.wiki-content/` (cp, not symlink — Turbopack rejects out-of-root symlinks)
- Env vars: `WIKI_LOCAL_PATH` for local dev, `VAULT_REPO_URL` + `VAULT_GITHUB_TOKEN` on Vercel
- Runs via `predev` / `prebuild` scripts in `package.json`
- Excluded: INDEX.md, README.md, LAST_RUN_MANIFEST.md, FOLDER_REVIEW.md, unorganized.md, long-form/, raw/

## Contents

- **README.md** — This file; overview of the site's design and structure
- **coldmountain.md** — Second Brain feature brief (source content for the /second-brain page)
