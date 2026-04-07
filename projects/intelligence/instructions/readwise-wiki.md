Readwise Wiki Compiler — Instructions

> Version: 1.0 | Last updated: 2026-04-05

## Purpose

Compile Readwise saves into a persistent, interlinked wiki. This is a knowledge compiler — wiki pages are persistent reference pages that get updated over time, not replaced. The wiki sits between you and the raw Readwise saves, synthesizing information into structured, cross-referenced pages.

This follows Karpathy's LLM Wiki pattern: you read the sources, extract key information, and integrate it into the existing wiki — updating pages, noting where new data connects to or contradicts existing content, and keeping cross-references current. The knowledge is compiled once and kept current.

Output goes to `wiki/` relative to the intelligence project directory.

---

## Workflow

### 1. Read the Wiki Index

Read `wiki/INDEX.md` first. This tells you what pages already exist, what topics are covered, and where to integrate new information. If the index is empty (first run), you'll be building from scratch.

### 2. Fetch Readwise Saves

Use the Readwise MCP tools to get documents to process.

**First run (bootstrap):** Use `mcp__readwise__reader_list_documents` to list all saved documents. Process everything to build the initial wiki.

**Subsequent runs:** Use `mcp__readwise__reader_list_documents` with `updated_after` set to 7 days ago to get only recent saves. If nothing new was saved, stop early — don't reprocess existing content.

### 3. Read Each Save's Content

For each document, use `mcp__readwise__reader_get_document_details` to get the full content. Extract:

- **Key concepts and ideas** — what is this about at a conceptual level?
- **Notable claims, findings, or arguments** — what does this say that's worth remembering?
- **Connections to existing wiki pages** — does this relate to topics already in the wiki?
- **People, projects, or entities** worth tracking

Skip documents that are trivial bookmarks or have no substantive content.

However, do NOT ignore product/tool bookmarks entirely — even if a save is just a landing page with no deep content, note the tool's name, what it does, and its URL on the relevant topic page. The goal is to never lose a bookmarked tool, but to file it as a data point rather than a standalone page.

### 4. Update or Create Wiki Pages

For each meaningful topic identified across the saves:

**If a relevant page exists:** Update it with the new information. Add new sections, refine existing content, add the source to the page's source list. Don't duplicate information already on the page.

**If no relevant page exists:** Create a new one. The page should be a useful reference — not a summary of a single article, but a page about a *topic* that may draw from multiple sources.

**Page guidelines:**
- Pages are about **topics**, not about individual articles. A page on "retrieval-augmented generation" draws from every source that discusses RAG.
- Keep pages concise and scannable — use headers, bullet points, short paragraphs.
- Each page starts with a 1-2 sentence TLDR at the top (helps both humans and LLMs scan quickly).
- Interlink pages with standard markdown links: `[topic name](topic-slug.md)`. Use relative links so they work in Obsidian and GitHub.
- Each page has a `## Sources` section at the bottom listing which Readwise saves informed it (title + author). This is a citation trail, not a bibliography — keep it brief.
- File names use kebab-case: `retrieval-augmented-generation.md`, `andrej-karpathy.md`
- Each page has YAML frontmatter with `created_at` (set once when the page is created) and `last_updated` (set to today's date whenever you modify a page's content, not for trivial formatting fixes).

**What pages to create is your decision.** There are no pre-defined categories. Look at the content and decide what topics deserve their own page. Some heuristics:
- A concept that appears across multiple sources → page
- A person doing notable work that comes up repeatedly → page
- A technique, framework, or tool with enough substance → page
- A broad theme (e.g., "AI agents", "open source models") that many sources touch → page
- A tool or product you bookmarked → don't create a standalone page, but mention it on the relevant topic page as a data point (e.g., a payment tool gets noted on the payments infrastructure page, a marketing tool gets noted on the AI marketing page). Bookmarks are landscape awareness — they should be captured but not given their own wiki entries.

Don't create a page for every minor mention. Create pages when there's enough substance to make a useful reference.

### 5. Update the Index

After every change, update `wiki/INDEX.md`. Every page gets:
- A link to the file
- A one-line summary of what the page covers

Group pages loosely by domain if natural groupings emerge, but don't force a taxonomy. A flat list is fine if that's what the content calls for.

### 6. Periodic Lint (On Every Run)

Before finishing, scan the wiki for:
- **Orphan pages** — pages not linked from any other page (add links where relevant)
- **Missing pages** — topics mentioned frequently across pages but lacking their own page
- **Stale content** — claims that newer sources have superseded

Fix what you find. This keeps the wiki healthy as it grows.

---

## Page Template

```markdown
---
created_at: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Page Title

> TLDR: One or two sentences summarizing this topic.

## Overview

Brief introduction to the topic.

## [Sections as needed]

Content organized by the natural structure of the topic.

## Sources

- "Article Title" — Author Name
- "Another Article" — Another Author
```

---

## After Writing

Once wiki pages are written/updated, commit and push to the vault:

```bash
cd /workspace/extra/second-brain
git add -A
git diff --cached --quiet || git commit -m "readwise wiki update $(date +%Y-%m-%d)"
git push
```

Do not send a confirmation message — the system handles notifications automatically.
