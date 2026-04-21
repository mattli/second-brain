# Cold Mountain — Design Docs & Content Briefs

Design documentation and content briefs for the Cold Mountain portfolio website (coldmountain.ai).

> The actual website codebase (Next.js 16, deployed on Vercel) lives in a separate repo: github.com/mattli/cold-mountain.

## Current site design

- Homepage with Selected Work grid (7 projects: Second Brain, dotmd, Seasons Journaling, School Search AI, FreshNotes, CIEG, ListenBack)
- /second-brain detail page organized by capability: Intelligence & Research, Validation, Specification & Execution, Continuity Discipline (content sourced from coldmountain.md)
- /wiki section — public Readwise Wiki with index (6 sections) + 26 article pages. Content pulled at build time from the vault (`resources/wiki/`) via sparse clone of the second-brain repo. Markdown rendered with react-markdown + remark-gfm. Lives at coldmountain.ai/wiki.
- Tool links throughout: Bird, Readwise, Parallel, Last 30 Days, Superpowers, G-Stack, Compound Engineering
- Subtle color-coded tags: blue (iOS), purple (Web), green (AI Agent), tan (Dev Tool)
- Name: "Matt Li" (changed from Mathew Thomas Li)
- Tagline: "Product manager. Product builder."
- Project order: Second Brain, dotmd, Seasons Journaling, School Search AI, FreshNotes, CIEG, ListenBack
- Header links: LinkedIn, X, Email (SVG icons), then "Wiki" as a text link (matching footer-link style) — routes to /wiki
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
