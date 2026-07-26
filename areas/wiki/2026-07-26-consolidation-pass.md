---
created_at: 2026-07-26
type: record
---

# Wiki Consolidation Pass — 2026-07-26

An ad-hoc structural consolidation of `resources/wiki/` done in a Claude Code session — the venue the [README](README.md) designates for structural changes ("page splits, folder reorgs, dedup happen ad-hoc in Claude Code sessions, not on a schedule"). This is a **record** of the pass plus the reusable process it produced; it also closes the backlog item "Investigate wiki reorganization workflow for spin-off articles."

## Why the daily pipeline can't do this

The daily list-maker + per-doc workers only ever **append** to an existing page or **create** a new one per-article. Every worker sees only its one Readwise doc + the index — no agent ever holds the whole corpus. So overlap, sprawl, and drift accumulate silently and can only be fixed by a global pass like this one.

## Trigger condition — when a sub-topic warrants its own first-class page

Spin a sub-topic out of a broader page (or dedupe it into an existing dedicated page) when **any** of these hold:

1. **It's referenced as if a standalone page already exists** — dead links point at a not-yet-created page. (`context-engineering.md` had two inbound dead links before it existed.)
2. **The same substance is duplicated across ≥2 pages** — the append-only pipeline can't dedupe. (Graph engineering and the PGE harness were written out in full in two places each.)
3. **One page has grown to cover multiple distinct topics** — `agentic-engineering.md` was 735 lines carrying Managed Agents, context engineering, graph, agent-marketplace, etc.
4. **The sub-topic recurs as a major section across ≥3 pages with no canonical home** — context engineering appeared as a full section in 4+ pages.

## The repeatable process

1. **Map globally.** Read the corpus (or fan out readers), identify overlap clusters, oversized pages, and dead-link-implied gaps. This is the view the daily pipeline structurally lacks.
2. **Merge before you collapse.** For each spin-off, move any *unique* material from the duplicate into the canonical/new page **first** — never lose content. (E.g. the model-capability timeline table lived only in `agentic-engineering.md`'s PGE copy; it was moved into `loop-engineering.md` before that copy was collapsed.)
3. **Collapse to a pointer stub, keep the heading.** Replace the duplicate body with a `>` blockquote + link, but keep the original heading so its anchor survives for existing inbound links.
4. **Use a heading-boundary script for large collapses**, not hand-transcription — match from the section heading to the next heading and swap the span. Avoids exact-match transcription errors.
5. **Wire it up.** Add the new page to `index.md`; repoint inbound links to the new canonical home.
6. **Crawl for broken links.** Anchors are GitHub-style slugs (lowercase, spaces→hyphens, punctuation stripped — note en-dashes/arrows are *dropped*, so `OpenAI–Hugging` slugs to `openaihugging`). Run a full internal-link + anchor crawl and fix anything broken. Reusable checker:

```python
import io, os, re
ROOT = "/Users/mattli/second-brain/resources/wiki"
link_re = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
heading_re = re.compile(r"^#{1,6}\s+(.*?)\s*$")
def slug(h):
    h = h.strip().lower()
    return "".join(c for c in h if c.isalnum() or c in " -_").replace(" ", "-")
cache = {}
def headings(p):
    if p in cache: return cache[p]
    s = set()
    try:
        with io.open(p, encoding="utf-8") as f:
            for ln in f:
                m = heading_re.match(ln)
                if m: s.add(slug(m.group(1)))
    except OSError: pass
    cache[p] = s; return s
probs = []
for dp, _, files in os.walk(ROOT):
    if "_archive" in dp: continue
    for fn in files:
        if not fn.endswith(".md"): continue
        fp = os.path.join(dp, fn)
        with io.open(fp, encoding="utf-8") as f: content = f.read()
        for t in link_re.findall(content):
            t = t.strip()
            if t.startswith(("http://", "https://", "mailto:")): continue
            if t.startswith("#"):
                if t[1:] and slug(t[1:]) not in headings(fp):
                    probs.append(f"{fp}: same-file anchor {t}")
                continue
            path, _, anc = t.partition("#")
            if not path.endswith(".md"): continue
            r = os.path.normpath(os.path.join(dp, path))
            if not os.path.exists(r): probs.append(f"{fp}: missing {t}")
            elif anc and slug(anc) not in headings(r): probs.append(f"{fp}: anchor {t}")
print("\n".join(probs) if probs else "clean")
```

7. **Land one labeled commit for a clean revert point.** Caveat on this machine: the vault sync cron (every 30 min) will likely commit your working-tree changes first, bundling them into a `vault sync <timestamp>` commit. That commit is still a clean single-hash revert handle **as long as it contains only your intended files** (the tree is otherwise clean between cron runs) — identify it with `git log --stat` and use `git revert <hash>`. Don't amend/rewrite it (it's pushed; rewriting fights the cron).

## What this pass did

**Tier 1 — mechanical (committed in `vault sync 2026-07-26 09:00`):** fixed 6 broken/mis-pointed internal links, corrected 3 stale `index.md` one-liners (Frontier Models, Claude Mythos, Loop Engineering lineage), added a missing H1 to `tech-crash-cycles.md`.

**Tier 2 — structural (committed in `vault sync 2026-07-26 09:30`, revert handle `e4a5813`):**
- Confirmed `graph-engineering.md` and `loop-engineering.md` were **already** standalone; consolidated their duplicated copies out of `agentic-engineering.md` into pointer stubs (moved the unique model-capability timeline table into `loop-engineering.md` first).
- Created **`concepts/context-engineering.md`** — a new canonical hub (Software 3.0, four operations, context rot, RAG-vs-long-context), fed by trimming the scattered copies in `agentic-engineering.md`, `llm-knowledge-bases.md`, and `agent-harness.md` to pointers.
- Created **`tools/managed-agents.md`** — extracted the Anthropic + OpenAI/AWS Managed Agents sections out of `agentic-engineering.md`.
- Moved the Ronin solo-operator case study to its canonical home in `solo-business.md`; `services-as-software.md`'s copy is a pointer stub. (Harvey/Sierra was investigated and left alone — illustrative references, not a real duplication.)
- Net: **`agentic-engineering.md` −130 lines**; two new first-class pages; a full link crawl passes clean; 5 pre-existing broken links fixed as a bonus.
