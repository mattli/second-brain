# Reddit Product Validation Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code skill (`product-validation`) that reads a product-validation.md doc, runs wide Reddit retrieval + strict classification, and writes findings back to the product folder.

**Architecture:** Four independent components orchestrated by a skill entry point. Each component has one job and is testable in isolation: `doc_reader` (extract inputs via Claude), `retriever` (wide Reddit search via ScrapeCreators, adjacent-sub discovery, comment enrichment), `classifier` (cheap relevance pre-filter + batched Claude classification), `synthesizer` (pure markdown formatting).

**Tech Stack:** Python 3, Anthropic SDK (Claude API), pytest. Imports `reddit.py`, `reddit_enrich.py`, `score.py`, `relevance.py` from the last30days plugin (pinned to v2.9.5, canonical path `~/.claude/plugins/marketplaces/last30days-skill/scripts/`).

**Spec:** `~/second-brain/projects/product-validation/2026-04-14-reddit-pipeline-design.md`

---

## File Structure

All code lives under `~/.claude/skills/product-validation/`:

```
~/.claude/skills/product-validation/
├── SKILL.md                        # Claude Code skill definition
├── requirements.txt                # anthropic, pytest
├── scripts/
│   ├── validate.py                 # CLI entry point (orchestrator)
│   ├── doc_reader.py               # Extract Hypothesis from product-validation.md
│   ├── retriever.py                # Wide Reddit retrieval + adjacent-sub discovery
│   ├── classifier.py               # Relevance pre-filter + Claude classification
│   ├── synthesizer.py              # Write findings markdown
│   └── lib/
│       ├── schema.py               # Dataclasses: Hypothesis, Candidate, ClassifiedFinding, RunMetadata
│       └── last30days_imports.py   # Path resolver for last30days lib imports
├── tests/
│   ├── test_doc_reader.py
│   ├── test_retriever.py
│   ├── test_classifier.py
│   ├── test_synthesizer.py
│   └── conftest.py                 # Shared fixtures
└── fixtures/
    ├── voice_tutor_doc.md          # Copy of voice-tutor's product-validation.md for tests
    ├── minimal_doc.md              # Only required fields
    ├── missing_required_doc.md     # Missing problem statement
    ├── reddit_search_response.json # Mocked ScrapeCreators response
    ├── reddit_comments_response.json
    ├── candidates_labeled.json     # Candidates with known classifier scores
    └── findings_golden.md          # Expected synthesizer output
```

Each component file is small (100-300 lines) with one responsibility. `lib/schema.py` and `lib/last30days_imports.py` are shared helpers, imported by multiple components.

---

## Task 1: Project skeleton and schema types

**Files:**
- Create: `~/.claude/skills/product-validation/requirements.txt`
- Create: `~/.claude/skills/product-validation/scripts/lib/__init__.py`
- Create: `~/.claude/skills/product-validation/scripts/lib/schema.py`
- Create: `~/.claude/skills/product-validation/scripts/lib/last30days_imports.py`
- Create: `~/.claude/skills/product-validation/tests/conftest.py`
- Create: `~/.claude/skills/product-validation/tests/test_imports.py`

- [ ] **Step 1.1: Create directory skeleton**

```bash
mkdir -p ~/.claude/skills/product-validation/scripts/lib
mkdir -p ~/.claude/skills/product-validation/tests
mkdir -p ~/.claude/skills/product-validation/fixtures
touch ~/.claude/skills/product-validation/scripts/__init__.py
touch ~/.claude/skills/product-validation/scripts/lib/__init__.py
touch ~/.claude/skills/product-validation/tests/__init__.py
```

- [ ] **Step 1.2: Create requirements.txt**

Content of `~/.claude/skills/product-validation/requirements.txt`:

```
anthropic>=0.39.0
pytest>=8.0.0
```

- [ ] **Step 1.3: Install dependencies**

```bash
cd ~/.claude/skills/product-validation
python3 -m pip install -r requirements.txt
```

Expected: anthropic and pytest install without errors.

- [ ] **Step 1.4: Write schema dataclasses**

Create `~/.claude/skills/product-validation/scripts/lib/schema.py`:

```python
"""Shared dataclasses for the product-validation pipeline."""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Hypothesis:
    """Extracted from product-validation.md."""
    problem_statement: str
    target_subreddits: List[str]
    existing_solutions: List[str] = field(default_factory=list)
    success_criteria: Optional[str] = None
    power_user_signals: Optional[str] = None


@dataclass
class CoverageReport:
    """Which fields were extracted from the doc."""
    problem_statement_found: bool
    target_subreddits_found: bool
    existing_solutions_found: bool
    success_criteria_found: bool
    power_user_signals_found: bool
    missing_required: List[str] = field(default_factory=list)
    missing_optional: List[str] = field(default_factory=list)


@dataclass
class Candidate:
    """A Reddit post or comment retrieved for classification."""
    id: str                # Reddit post/comment ID
    kind: str              # "post" or "comment"
    text: str              # Title + selftext for posts, body for comments
    author: str
    subreddit: str
    permalink: str
    created_utc: int
    score: int             # Upvotes
    num_comments: Optional[int] = None   # Posts only
    parent_post_id: Optional[str] = None  # Comments only
    hit_by_query: str = ""              # Which query returned this candidate
    parent_post_text: Optional[str] = None  # Set for comments, so classifier has context


@dataclass
class ClassifiedFinding:
    """A candidate that passed the classifier."""
    candidate: Candidate
    score: int                           # 0-3 from classifier
    evidence_quote: str
    pain_category: Optional[str]
    mentions_existing_solution: Optional[str]
    power_user_signal: bool
    classifier_reasoning: str


@dataclass
class RunMetadata:
    """Logged per-run for the findings doc."""
    queries_generated: List[str] = field(default_factory=list)
    target_subreddits_searched: List[str] = field(default_factory=list)
    adjacent_subreddits_tried: List[str] = field(default_factory=list)
    adjacent_subreddit_hit_counts: dict = field(default_factory=dict)
    total_candidates: int = 0
    after_relevance_prefilter: int = 0
    after_classifier: int = 0
    classifier_threshold: int = 2
    run_timestamp: str = ""
```

- [ ] **Step 1.5: Write last30days import resolver**

Create `~/.claude/skills/product-validation/scripts/lib/last30days_imports.py`:

```python
"""Resolve imports from the last30days plugin's canonical install path.

Pinned to v2.9.5. Importing ScrapeCreators-based Reddit search + relevance
scoring from the plugin marketplace install.
"""

import sys
from pathlib import Path

LAST30DAYS_SCRIPTS = (
    Path.home()
    / ".claude"
    / "plugins"
    / "marketplaces"
    / "last30days-skill"
    / "scripts"
)

if not (LAST30DAYS_SCRIPTS / "lib" / "reddit.py").exists():
    raise RuntimeError(
        f"Cannot find last30days lib at {LAST30DAYS_SCRIPTS}. "
        "Ensure the last30days plugin is installed."
    )

if str(LAST30DAYS_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(LAST30DAYS_SCRIPTS))

# Re-export the modules we depend on
from lib import reddit, reddit_enrich, score, relevance  # noqa: E402, F401
```

- [ ] **Step 1.6: Write pytest conftest**

Create `~/.claude/skills/product-validation/tests/conftest.py`:

```python
"""Shared pytest fixtures for product-validation tests."""

import sys
from pathlib import Path

# Add scripts/ to sys.path so tests can import pipeline modules
SCRIPTS = Path(__file__).parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS))

FIXTURES = Path(__file__).parent.parent / "fixtures"


def fixture_path(name: str) -> Path:
    return FIXTURES / name
```

- [ ] **Step 1.7: Write failing import test**

Create `~/.claude/skills/product-validation/tests/test_imports.py`:

```python
"""Verify last30days lib imports resolve correctly."""

def test_last30days_imports_resolve():
    from lib.last30days_imports import reddit, reddit_enrich, score, relevance
    # Verify the functions we depend on exist
    assert hasattr(reddit, "search_reddit_items") or hasattr(reddit, "search")
    assert hasattr(reddit_enrich, "enrich_reddit_item")
    assert hasattr(score, "compute_reddit_engagement_raw")
    assert hasattr(relevance, "token_overlap_relevance")


def test_schema_dataclasses_importable():
    from lib.schema import (
        Hypothesis,
        CoverageReport,
        Candidate,
        ClassifiedFinding,
        RunMetadata,
    )
    h = Hypothesis(problem_statement="x", target_subreddits=["r/test"])
    assert h.existing_solutions == []
```

- [ ] **Step 1.8: Run test to verify imports resolve**

```bash
cd ~/.claude/skills/product-validation
python3 -m pytest tests/test_imports.py -v
```

Expected: 2 tests pass. If `test_last30days_imports_resolve` fails with `AttributeError`, inspect the actual function names in `~/.claude/plugins/marketplaces/last30days-skill/scripts/lib/reddit.py` and adjust the assertion; the pipeline code in later tasks uses whatever name is canonical.

- [ ] **Step 1.9: Commit**

```bash
cd ~/.claude/skills/product-validation
git init 2>/dev/null || true
git add .
git commit -m "feat: project skeleton, schema types, last30days import resolver"
```

If the user prefers this directory not be its own git repo, skip `git init` and instead commit to their vault. Check with the user before committing if ambiguous.

---

## Task 2: Synthesizer (pure formatting, simplest)

**Rationale:** Build first because it's pure Python with no external API calls. Golden-file test establishes the output contract that later tasks produce data for.

**Files:**
- Create: `~/.claude/skills/product-validation/scripts/synthesizer.py`
- Create: `~/.claude/skills/product-validation/tests/test_synthesizer.py`
- Create: `~/.claude/skills/product-validation/fixtures/findings_golden.md`
- Create: `~/.claude/skills/product-validation/fixtures/classified_findings_sample.json`

- [ ] **Step 2.1: Write the failing test first**

Create `~/.claude/skills/product-validation/tests/test_synthesizer.py`:

```python
"""Golden-file test for synthesizer."""

import json
from pathlib import Path

from lib.schema import (
    Candidate,
    ClassifiedFinding,
    Hypothesis,
    RunMetadata,
)
from synthesizer import render_findings
from conftest import fixture_path


def _load_sample_findings():
    """Load the sample classified findings fixture."""
    with open(fixture_path("classified_findings_sample.json")) as f:
        data = json.load(f)
    findings = []
    for d in data["findings"]:
        cand = Candidate(**d["candidate"])
        finding = ClassifiedFinding(
            candidate=cand,
            score=d["score"],
            evidence_quote=d["evidence_quote"],
            pain_category=d.get("pain_category"),
            mentions_existing_solution=d.get("mentions_existing_solution"),
            power_user_signal=d.get("power_user_signal", False),
            classifier_reasoning=d["classifier_reasoning"],
        )
        findings.append(finding)
    return findings


def test_synthesizer_matches_golden():
    hypothesis = Hypothesis(
        problem_statement="Readwise power users drowning in saves",
        target_subreddits=["r/Readwise", "r/ObsidianMD"],
        existing_solutions=["Ghostreader", "Snipd"],
        power_user_signals="Active Readwise user with 1000+ highlights",
    )
    metadata = RunMetadata(
        queries_generated=["drowning in readwise", "kindle highlights backlog"],
        target_subreddits_searched=["r/Readwise", "r/ObsidianMD"],
        adjacent_subreddits_tried=["r/PKMS"],
        adjacent_subreddit_hit_counts={"r/PKMS": 3},
        total_candidates=50,
        after_relevance_prefilter=20,
        after_classifier=5,
        classifier_threshold=2,
        run_timestamp="2026-04-14",
    )
    findings = _load_sample_findings()

    output = render_findings(hypothesis, findings, metadata, rejected_for_review=[])

    expected = Path(fixture_path("findings_golden.md")).read_text()
    assert output == expected
```

- [ ] **Step 2.2: Create fixture data**

Create `~/.claude/skills/product-validation/fixtures/classified_findings_sample.json`:

```json
{
  "findings": [
    {
      "candidate": {
        "id": "t3_abc123",
        "kind": "post",
        "text": "I save so many articles to Readwise but never read them back. Anyone else feel this way?",
        "author": "user_alice",
        "subreddit": "r/Readwise",
        "permalink": "https://reddit.com/r/Readwise/comments/abc123",
        "created_utc": 1712000000,
        "score": 42,
        "num_comments": 15,
        "parent_post_id": null,
        "hit_by_query": "drowning in readwise"
      },
      "score": 3,
      "evidence_quote": "I save so many articles to Readwise but never read them back",
      "pain_category": "drowning_in_saves",
      "mentions_existing_solution": null,
      "power_user_signal": true,
      "classifier_reasoning": "Direct statement of drowning-in-saves pain; author is active Readwise user."
    },
    {
      "candidate": {
        "id": "t1_xyz789",
        "kind": "comment",
        "text": "I tried Ghostreader but the summaries miss the parts I actually cared about highlighting.",
        "author": "user_bob",
        "subreddit": "r/Readwise",
        "permalink": "https://reddit.com/r/Readwise/comments/abc123/_/xyz789",
        "created_utc": 1712003600,
        "score": 18,
        "num_comments": null,
        "parent_post_id": "t3_abc123",
        "hit_by_query": "ghostreader review"
      },
      "score": 2,
      "evidence_quote": "Ghostreader but the summaries miss the parts I actually cared about",
      "pain_category": "existing_solution_gap",
      "mentions_existing_solution": "Ghostreader",
      "power_user_signal": false,
      "classifier_reasoning": "Author critiques an existing solution, matches the gap we care about."
    }
  ]
}
```

- [ ] **Step 2.3: Create the expected golden output**

Create `~/.claude/skills/product-validation/fixtures/findings_golden.md`:

```markdown
# Reddit Validation Findings — 2026-04-14

**Hypothesis:** Readwise power users drowning in saves

## Coverage

- Queries generated: 2
  - drowning in readwise
  - kindle highlights backlog
- Target subreddits searched: r/Readwise, r/ObsidianMD
- Adjacent subreddits tried: r/PKMS (3 hits)
- Candidates: 50 → 20 after relevance pre-filter → 5 after classifier (threshold: 2)

## Pain Evidence

### Score 3 — r/Readwise — u/user_alice

> I save so many articles to Readwise but never read them back

**Context:** post, 42 upvotes, 15 comments. Hit by query: "drowning in readwise".
**Reasoning:** Direct statement of drowning-in-saves pain; author is active Readwise user.
[View on Reddit](https://reddit.com/r/Readwise/comments/abc123)

### Score 2 — r/Readwise — u/user_bob

> Ghostreader but the summaries miss the parts I actually cared about

**Context:** comment on t3_abc123, 18 upvotes. Hit by query: "ghostreader review".
**Reasoning:** Author critiques an existing solution, matches the gap we care about.
[View on Reddit](https://reddit.com/r/Readwise/comments/abc123/_/xyz789)

## Existing Solutions Mentioned

- **Ghostreader** (1 mention)

## Power User Candidates

### u/user_alice — r/Readwise

> I save so many articles to Readwise but never read them back

[Profile activity](https://reddit.com/user/user_alice)

## Rejected for Review

_None._
```

- [ ] **Step 2.4: Run test to verify it fails**

```bash
cd ~/.claude/skills/product-validation
python3 -m pytest tests/test_synthesizer.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'synthesizer'`.

- [ ] **Step 2.5: Write the synthesizer implementation**

Create `~/.claude/skills/product-validation/scripts/synthesizer.py`:

```python
"""Render classified findings into a markdown report."""

from collections import Counter
from typing import List

from lib.schema import ClassifiedFinding, Hypothesis, RunMetadata


def render_findings(
    hypothesis: Hypothesis,
    findings: List[ClassifiedFinding],
    metadata: RunMetadata,
    rejected_for_review: List[ClassifiedFinding],
) -> str:
    """Return the findings markdown as a single string."""
    parts = []
    parts.append(_render_header(hypothesis, metadata))
    parts.append(_render_coverage(metadata))
    parts.append(_render_pain_evidence(findings))
    parts.append(_render_existing_solutions(findings))
    parts.append(_render_power_users(findings))
    parts.append(_render_rejected(rejected_for_review))
    return "\n".join(parts).rstrip() + "\n"


def _render_header(hypothesis: Hypothesis, metadata: RunMetadata) -> str:
    return (
        f"# Reddit Validation Findings — {metadata.run_timestamp}\n"
        f"\n"
        f"**Hypothesis:** {hypothesis.problem_statement}\n"
    )


def _render_coverage(metadata: RunMetadata) -> str:
    lines = ["## Coverage", ""]
    lines.append(f"- Queries generated: {len(metadata.queries_generated)}")
    for q in metadata.queries_generated:
        lines.append(f"  - {q}")
    lines.append(
        "- Target subreddits searched: "
        + ", ".join(metadata.target_subreddits_searched)
    )
    if metadata.adjacent_subreddits_tried:
        adj_parts = [
            f"{s} ({metadata.adjacent_subreddit_hit_counts.get(s, 0)} hits)"
            for s in metadata.adjacent_subreddits_tried
        ]
        lines.append(f"- Adjacent subreddits tried: {', '.join(adj_parts)}")
    lines.append(
        f"- Candidates: {metadata.total_candidates} → "
        f"{metadata.after_relevance_prefilter} after relevance pre-filter → "
        f"{metadata.after_classifier} after classifier "
        f"(threshold: {metadata.classifier_threshold})"
    )
    return "\n".join(lines) + "\n"


def _render_pain_evidence(findings: List[ClassifiedFinding]) -> str:
    lines = ["## Pain Evidence", ""]
    if not findings:
        lines.append("_No findings passed the classifier._")
        return "\n".join(lines) + "\n"

    sorted_findings = sorted(findings, key=lambda f: f.score, reverse=True)
    for f in sorted_findings:
        c = f.candidate
        lines.append(
            f"### Score {f.score} — {c.subreddit} — u/{c.author}"
        )
        lines.append("")
        lines.append(f"> {f.evidence_quote}")
        lines.append("")
        context = _candidate_context(c)
        lines.append(
            f"**Context:** {context}. Hit by query: \"{c.hit_by_query}\"."
        )
        lines.append(f"**Reasoning:** {f.classifier_reasoning}")
        lines.append(f"[View on Reddit]({c.permalink})")
        lines.append("")
    return "\n".join(lines)


def _candidate_context(c) -> str:
    if c.kind == "post":
        return f"post, {c.score} upvotes, {c.num_comments} comments"
    return f"comment on {c.parent_post_id}, {c.score} upvotes"


def _render_existing_solutions(findings: List[ClassifiedFinding]) -> str:
    mentions = Counter(
        f.mentions_existing_solution
        for f in findings
        if f.mentions_existing_solution
    )
    lines = ["## Existing Solutions Mentioned", ""]
    if not mentions:
        lines.append("_None mentioned in findings._")
        return "\n".join(lines) + "\n"
    for tool, count in mentions.most_common():
        lines.append(f"- **{tool}** ({count} mention{'s' if count != 1 else ''})")
    return "\n".join(lines) + "\n"


def _render_power_users(findings: List[ClassifiedFinding]) -> str:
    power_users = [f for f in findings if f.power_user_signal]
    lines = ["## Power User Candidates", ""]
    if not power_users:
        lines.append("_None identified._")
        return "\n".join(lines) + "\n"

    # Dedupe by author, keep highest-score finding per author
    seen = {}
    for f in power_users:
        author = f.candidate.author
        if author not in seen or f.score > seen[author].score:
            seen[author] = f

    for author, f in seen.items():
        c = f.candidate
        lines.append(f"### u/{author} — {c.subreddit}")
        lines.append("")
        lines.append(f"> {f.evidence_quote}")
        lines.append("")
        lines.append(f"[Profile activity](https://reddit.com/user/{author})")
        lines.append("")
    return "\n".join(lines)


def _render_rejected(rejected: List[ClassifiedFinding]) -> str:
    lines = ["## Rejected for Review", ""]
    if not rejected:
        lines.append("_None._")
        return "\n".join(lines) + "\n"
    for f in rejected[:5]:
        c = f.candidate
        lines.append(f"- {c.subreddit} / u/{c.author}: \"{f.evidence_quote}\" "
                     f"(score {f.score}, reason: {f.classifier_reasoning})")
    return "\n".join(lines) + "\n"
```

- [ ] **Step 2.6: Run test to verify it passes**

```bash
cd ~/.claude/skills/product-validation
python3 -m pytest tests/test_synthesizer.py -v
```

Expected: PASS.

If the test fails on exact whitespace mismatch, print `repr(output)` and `repr(expected)` to find the diff. Update the golden fixture OR the implementation to match (whichever represents the actual desired behavior).

- [ ] **Step 2.7: Commit**

```bash
cd ~/.claude/skills/product-validation
git add scripts/synthesizer.py tests/test_synthesizer.py fixtures/classified_findings_sample.json fixtures/findings_golden.md
git commit -m "feat: synthesizer with golden-file test"
```

---

## Task 3: Doc reader

**Files:**
- Create: `~/.claude/skills/product-validation/scripts/doc_reader.py`
- Create: `~/.claude/skills/product-validation/tests/test_doc_reader.py`
- Create: `~/.claude/skills/product-validation/fixtures/voice_tutor_doc.md`
- Create: `~/.claude/skills/product-validation/fixtures/minimal_doc.md`
- Create: `~/.claude/skills/product-validation/fixtures/missing_required_doc.md`

- [ ] **Step 3.1: Copy voice-tutor doc to fixtures**

```bash
cp ~/second-brain/projects/products/voice-tutor/product-validation.md \
   ~/.claude/skills/product-validation/fixtures/voice_tutor_doc.md
```

- [ ] **Step 3.2: Create minimal and missing-required fixtures**

Create `~/.claude/skills/product-validation/fixtures/minimal_doc.md`:

```markdown
# Minimal Hypothesis

## Purpose

Users struggle to find time to exercise consistently.

## Target Subreddits

- r/fitness
- r/running
- r/bodyweightfitness
```

Create `~/.claude/skills/product-validation/fixtures/missing_required_doc.md`:

```markdown
# Doc with no problem statement

## Target Subreddits

- r/anything
```

- [ ] **Step 3.3: Write failing test**

Create `~/.claude/skills/product-validation/tests/test_doc_reader.py`:

```python
"""Tests for doc_reader."""

import pytest

from doc_reader import read_validation_doc, DocReaderError
from conftest import fixture_path


def test_extract_from_voice_tutor_doc():
    result = read_validation_doc(fixture_path("voice_tutor_doc.md"))
    hypothesis, coverage = result

    assert "drowning" in hypothesis.problem_statement.lower() or \
           "saves" in hypothesis.problem_statement.lower() or \
           "absorb" in hypothesis.problem_statement.lower()
    assert len(hypothesis.target_subreddits) >= 2
    assert any("Readwise" in s or "readwise" in s for s in hypothesis.target_subreddits)
    assert len(hypothesis.existing_solutions) >= 1
    assert any("Ghostreader" in s for s in hypothesis.existing_solutions)

    assert coverage.problem_statement_found
    assert coverage.target_subreddits_found
    assert coverage.existing_solutions_found


def test_extract_from_minimal_doc():
    hypothesis, coverage = read_validation_doc(fixture_path("minimal_doc.md"))
    assert "exercise" in hypothesis.problem_statement.lower()
    assert len(hypothesis.target_subreddits) == 3
    assert coverage.problem_statement_found
    assert coverage.target_subreddits_found
    # Optional fields should be marked missing
    assert not coverage.existing_solutions_found


def test_missing_required_fails_loud():
    with pytest.raises(DocReaderError) as exc_info:
        read_validation_doc(fixture_path("missing_required_doc.md"))
    assert "problem_statement" in str(exc_info.value).lower()
```

- [ ] **Step 3.4: Run test to verify it fails**

```bash
cd ~/.claude/skills/product-validation
python3 -m pytest tests/test_doc_reader.py -v
```

Expected: FAIL with `ModuleNotFoundError`.

- [ ] **Step 3.5: Write doc_reader implementation**

Create `~/.claude/skills/product-validation/scripts/doc_reader.py`:

```python
"""Extract Hypothesis from a product-validation.md doc via Claude."""

import json
import os
from pathlib import Path
from typing import Tuple

import anthropic

from lib.schema import CoverageReport, Hypothesis


class DocReaderError(Exception):
    """Raised when the doc cannot be parsed into a valid Hypothesis."""


EXTRACTION_PROMPT = """You are extracting structured fields from a product-validation plan document.

Return ONLY a JSON object with these keys:
- problem_statement: string. The core pain you're looking for evidence of. Required.
- target_subreddits: list of strings. Subreddit names with or without "r/" prefix. Required.
- existing_solutions: list of strings. Named tools, products, or approaches mentioned as current ways people try to solve this. Optional — empty list if none.
- success_criteria: string or null. What makes a finding valuable. Optional.
- power_user_signals: string or null. What makes someone worth approaching. Optional.

If a required field cannot be determined from the document, set it to null.
Return JSON and nothing else. No prose before or after.

Document:
---
{doc}
---"""


def read_validation_doc(path: Path) -> Tuple[Hypothesis, CoverageReport]:
    """Read a product-validation.md and extract a Hypothesis."""
    doc_text = Path(path).read_text()

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": EXTRACTION_PROMPT.format(doc=doc_text),
            }
        ],
    )
    raw = response.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise DocReaderError(f"Claude returned non-JSON output: {raw[:200]}") from e

    missing_required = []
    if not data.get("problem_statement"):
        missing_required.append("problem_statement")
    subs = data.get("target_subreddits") or []
    if not subs:
        missing_required.append("target_subreddits")

    if missing_required:
        raise DocReaderError(
            f"Doc is missing required fields: {', '.join(missing_required)}. "
            "Add a problem statement and target subreddits to the doc and retry."
        )

    # Normalize subreddit names (ensure "r/" prefix)
    normalized_subs = [s if s.startswith("r/") else f"r/{s}" for s in subs]

    hypothesis = Hypothesis(
        problem_statement=data["problem_statement"],
        target_subreddits=normalized_subs,
        existing_solutions=data.get("existing_solutions") or [],
        success_criteria=data.get("success_criteria"),
        power_user_signals=data.get("power_user_signals"),
    )

    coverage = CoverageReport(
        problem_statement_found=True,
        target_subreddits_found=True,
        existing_solutions_found=bool(hypothesis.existing_solutions),
        success_criteria_found=bool(hypothesis.success_criteria),
        power_user_signals_found=bool(hypothesis.power_user_signals),
        missing_required=[],
        missing_optional=[
            f for f, present in [
                ("existing_solutions", bool(hypothesis.existing_solutions)),
                ("success_criteria", bool(hypothesis.success_criteria)),
                ("power_user_signals", bool(hypothesis.power_user_signals)),
            ] if not present
        ],
    )

    return hypothesis, coverage


def print_coverage(coverage: CoverageReport) -> None:
    """Print a friendly coverage summary."""
    found = [
        name for name, present in [
            ("problem_statement", coverage.problem_statement_found),
            ("target_subreddits", coverage.target_subreddits_found),
            ("existing_solutions", coverage.existing_solutions_found),
            ("success_criteria", coverage.success_criteria_found),
            ("power_user_signals", coverage.power_user_signals_found),
        ] if present
    ]
    print(f"Extracted: {', '.join(found)}")
    if coverage.missing_optional:
        print(f"Missing (optional): {', '.join(coverage.missing_optional)}")
```

- [ ] **Step 3.6: Run tests to verify they pass**

```bash
cd ~/.claude/skills/product-validation
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY python3 -m pytest tests/test_doc_reader.py -v
```

Expected: 3 tests pass. (Requires `ANTHROPIC_API_KEY` in env. Tests make real Claude calls.)

If `test_missing_required_fails_loud` fails because Claude returned non-null `problem_statement` for the missing-required fixture, add an instruction to the prompt: "If the document has no clear problem statement, return null for problem_statement." Re-run.

- [ ] **Step 3.7: Commit**

```bash
cd ~/.claude/skills/product-validation
git add scripts/doc_reader.py tests/test_doc_reader.py fixtures/voice_tutor_doc.md fixtures/minimal_doc.md fixtures/missing_required_doc.md
git commit -m "feat: doc_reader extracts Hypothesis via Claude"
```

---

## Task 4: Classifier

**Files:**
- Create: `~/.claude/skills/product-validation/scripts/classifier.py`
- Create: `~/.claude/skills/product-validation/tests/test_classifier.py`
- Create: `~/.claude/skills/product-validation/fixtures/candidates_labeled.json`

- [ ] **Step 4.1: Create labeled fixture**

Create `~/.claude/skills/product-validation/fixtures/candidates_labeled.json`:

```json
{
  "hypothesis": {
    "problem_statement": "Readwise power users feel they save more highlights than they can absorb or revisit, and existing tools (Ghostreader, manual summarization) don't bridge the gap",
    "target_subreddits": ["r/Readwise", "r/ObsidianMD"],
    "existing_solutions": ["Ghostreader", "Snipd", "manual summarization"],
    "success_criteria": "Someone describes the pain in their own words, has tried solutions that didn't work",
    "power_user_signals": "Active Readwise user, long highlight history, mentions personal knowledge management workflow"
  },
  "candidates": [
    {
      "id": "post_001",
      "kind": "post",
      "text": "My Readwise library has 5000+ highlights. I never go back to any of them. What's the point?",
      "author": "user_high_signal",
      "subreddit": "r/Readwise",
      "permalink": "https://reddit.com/r/Readwise/comments/post_001",
      "created_utc": 1712000000,
      "score": 87,
      "num_comments": 34,
      "hit_by_query": "readwise highlights never read",
      "expected_min_score": 2
    },
    {
      "id": "post_002",
      "kind": "post",
      "text": "What's the best way to sync Readwise to Roam Research?",
      "author": "user_technical",
      "subreddit": "r/Readwise",
      "permalink": "https://reddit.com/r/Readwise/comments/post_002",
      "created_utc": 1712000000,
      "score": 12,
      "num_comments": 4,
      "hit_by_query": "readwise sync",
      "expected_max_score": 1
    },
    {
      "id": "comment_003",
      "kind": "comment",
      "text": "I tried Ghostreader's summaries but they missed the subtle points I cared about. Ended up still digging through the original.",
      "author": "user_tried_solution",
      "subreddit": "r/Readwise",
      "permalink": "https://reddit.com/r/Readwise/comments/abc/_/comment_003",
      "created_utc": 1712000000,
      "score": 24,
      "parent_post_id": "t3_abc",
      "hit_by_query": "ghostreader limitations",
      "expected_min_score": 2
    }
  ]
}
```

- [ ] **Step 4.2: Write failing test**

Create `~/.claude/skills/product-validation/tests/test_classifier.py`:

```python
"""Tests for classifier."""

import json

from lib.schema import Candidate, Hypothesis
from classifier import classify_candidates, prefilter_by_relevance
from conftest import fixture_path


def _load_labeled():
    with open(fixture_path("candidates_labeled.json")) as f:
        return json.load(f)


def _build_hypothesis(data):
    h = data["hypothesis"]
    return Hypothesis(
        problem_statement=h["problem_statement"],
        target_subreddits=h["target_subreddits"],
        existing_solutions=h["existing_solutions"],
        success_criteria=h["success_criteria"],
        power_user_signals=h["power_user_signals"],
    )


def _build_candidates(data):
    return [
        Candidate(
            id=c["id"],
            kind=c["kind"],
            text=c["text"],
            author=c["author"],
            subreddit=c["subreddit"],
            permalink=c["permalink"],
            created_utc=c["created_utc"],
            score=c["score"],
            num_comments=c.get("num_comments"),
            parent_post_id=c.get("parent_post_id"),
            hit_by_query=c["hit_by_query"],
        )
        for c in data["candidates"]
    ]


def test_prefilter_drops_obviously_off_topic():
    data = _load_labeled()
    hypothesis = _build_hypothesis(data)
    candidates = _build_candidates(data)
    kept = prefilter_by_relevance(hypothesis, candidates, min_relevance=0.15)
    # The "sync to Roam" post should be dropped by prefilter
    kept_ids = {c.id for c in kept}
    assert "post_002" not in kept_ids
    assert "post_001" in kept_ids
    assert "comment_003" in kept_ids


def test_classifier_scores_labeled_fixtures():
    data = _load_labeled()
    hypothesis = _build_hypothesis(data)
    candidates = _build_candidates(data)

    findings = classify_candidates(hypothesis, candidates, threshold=2)

    # Only high-signal candidates should pass threshold
    passing_ids = {f.candidate.id for f in findings}
    assert "post_001" in passing_ids
    assert "comment_003" in passing_ids
    assert "post_002" not in passing_ids

    # Verify structure of a finding
    post_001 = next(f for f in findings if f.candidate.id == "post_001")
    assert 2 <= post_001.score <= 3
    assert post_001.evidence_quote  # non-empty
    assert post_001.classifier_reasoning  # non-empty
```

- [ ] **Step 4.3: Run test to verify it fails**

```bash
cd ~/.claude/skills/product-validation
python3 -m pytest tests/test_classifier.py -v
```

Expected: FAIL with `ModuleNotFoundError`.

- [ ] **Step 4.4: Write classifier implementation**

Create `~/.claude/skills/product-validation/scripts/classifier.py`:

```python
"""Classify Reddit candidates against a Hypothesis via Claude."""

import json
from typing import List

import anthropic

from lib.last30days_imports import relevance
from lib.schema import Candidate, ClassifiedFinding, Hypothesis

CLASSIFIER_PROMPT = """You are classifying Reddit posts and comments against a product-validation hypothesis.

HYPOTHESIS
Problem statement: {problem_statement}
Target audience / power-user signals: {power_user_signals}
Success criteria: {success_criteria}
Existing solutions to watch for: {existing_solutions}

For each candidate below, return a JSON object with these fields:
- id: the candidate's id
- score: 0 (irrelevant), 1 (tangential), 2 (relevant pain evidence), 3 (strong match, quotable)
- evidence_quote: the most relevant verbatim substring from the candidate text, or empty string
- pain_category: "drowning_in_saves" | "existing_solution_gap" | "related_pain" | null
- mentions_existing_solution: name of a tool from the watch-list that appears in the text, or null
- power_user_signal: true if the author shows signs of being a power user per the signals described
- reasoning: one short sentence explaining the score

Return a JSON array of these objects (one per candidate), in the same order as the candidates. Return ONLY the JSON array, no prose.

CANDIDATES
{candidates_json}
"""

BATCH_SIZE = 10


def prefilter_by_relevance(
    hypothesis: Hypothesis,
    candidates: List[Candidate],
    min_relevance: float = 0.15,
) -> List[Candidate]:
    """Drop candidates that don't overlap meaningfully with the problem statement."""
    kept = []
    for c in candidates:
        text = c.text
        if c.parent_post_text:
            text = f"{c.parent_post_text}\n{c.text}"
        r = relevance.token_overlap_relevance(hypothesis.problem_statement, text)
        if r >= min_relevance:
            kept.append(c)
    return kept


def classify_candidates(
    hypothesis: Hypothesis,
    candidates: List[Candidate],
    threshold: int = 2,
    min_relevance: float = 0.15,
) -> List[ClassifiedFinding]:
    """Pre-filter + classify candidates, return those at or above threshold."""
    survivors = prefilter_by_relevance(hypothesis, candidates, min_relevance)
    if not survivors:
        return []

    client = anthropic.Anthropic()
    findings: List[ClassifiedFinding] = []

    for i in range(0, len(survivors), BATCH_SIZE):
        batch = survivors[i : i + BATCH_SIZE]
        batch_findings = _classify_batch(client, hypothesis, batch)
        findings.extend(batch_findings)

    return [f for f in findings if f.score >= threshold]


def _classify_batch(
    client: anthropic.Anthropic,
    hypothesis: Hypothesis,
    batch: List[Candidate],
) -> List[ClassifiedFinding]:
    """Classify a single batch via one Claude call."""
    candidates_json = json.dumps(
        [
            {
                "id": c.id,
                "kind": c.kind,
                "subreddit": c.subreddit,
                "author": c.author,
                "text": c.text[:2000],  # cap per-candidate text
                "parent_post_text": (c.parent_post_text or "")[:500] if c.parent_post_text else None,
            }
            for c in batch
        ],
        indent=2,
    )
    prompt = CLASSIFIER_PROMPT.format(
        problem_statement=hypothesis.problem_statement,
        power_user_signals=hypothesis.power_user_signals or "(not specified)",
        success_criteria=hypothesis.success_criteria or "(not specified)",
        existing_solutions=", ".join(hypothesis.existing_solutions) or "(none listed)",
        candidates_json=candidates_json,
    )

    attempt = 0
    last_err = None
    while attempt < 3:
        try:
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                temperature=0,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
                if raw.endswith("```"):
                    raw = raw.rsplit("```", 1)[0]
            parsed = json.loads(raw)
            return _map_to_findings(parsed, batch)
        except (json.JSONDecodeError, anthropic.APIError) as e:
            last_err = e
            attempt += 1

    print(f"WARNING: classifier batch failed after 3 attempts: {last_err}")
    return []  # Drop this batch; synthesizer will note it


def _map_to_findings(
    parsed: List[dict],
    batch: List[Candidate],
) -> List[ClassifiedFinding]:
    """Map Claude's JSON back to ClassifiedFinding objects."""
    by_id = {c.id: c for c in batch}
    out = []
    for item in parsed:
        cand = by_id.get(item["id"])
        if cand is None:
            continue
        out.append(
            ClassifiedFinding(
                candidate=cand,
                score=int(item["score"]),
                evidence_quote=item.get("evidence_quote", ""),
                pain_category=item.get("pain_category"),
                mentions_existing_solution=item.get("mentions_existing_solution"),
                power_user_signal=bool(item.get("power_user_signal", False)),
                classifier_reasoning=item.get("reasoning", ""),
            )
        )
    return out
```

- [ ] **Step 4.5: Run test to verify it passes**

```bash
cd ~/.claude/skills/product-validation
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY python3 -m pytest tests/test_classifier.py -v
```

Expected: 2 tests pass.

If `test_prefilter_drops_obviously_off_topic` drops `post_001` unexpectedly, the relevance threshold needs tuning — lower `min_relevance` to 0.10 and re-run.

If `test_classifier_scores_labeled_fixtures` returns a score of 1 for `post_001` instead of 2+, adjust the classifier prompt to be more explicit that "5000 highlights never revisited" IS drowning-in-saves evidence. Re-run.

- [ ] **Step 4.6: Commit**

```bash
cd ~/.claude/skills/product-validation
git add scripts/classifier.py tests/test_classifier.py fixtures/candidates_labeled.json
git commit -m "feat: classifier with relevance pre-filter and Claude batch scoring"
```

---

## Task 5: Retriever

**Files:**
- Create: `~/.claude/skills/product-validation/scripts/retriever.py`
- Create: `~/.claude/skills/product-validation/tests/test_retriever.py`
- Create: `~/.claude/skills/product-validation/fixtures/reddit_search_response.json`

- [ ] **Step 5.1: Inspect last30days reddit.py to find the search function signature**

```bash
grep -nE "^def |^class " ~/.claude/plugins/marketplaces/last30days-skill/scripts/lib/reddit.py | head -20
```

Expected: a public function like `search_reddit_items(...)` or `search(...)`. Note its exact signature — the retriever will call it.

Also check `reddit_enrich.py`:

```bash
grep -nE "^def " ~/.claude/plugins/marketplaces/last30days-skill/scripts/lib/reddit_enrich.py | head -10
```

Note the enrich function name and signature.

Record the actual names. The code in Step 5.5 below uses `reddit.search_reddit_items(...)` and `reddit_enrich.enrich_reddit_item(...)` as placeholders — **if the actual names differ, substitute them in Step 5.5.**

- [ ] **Step 5.2: Create mocked ScrapeCreators fixture**

Create `~/.claude/skills/product-validation/fixtures/reddit_search_response.json`:

```json
{
  "posts": [
    {
      "id": "t3_fake001",
      "title": "Readwise has ruined my reading habit",
      "selftext": "I save everything now but I never read anything end to end anymore. It all just sits there.",
      "author": "reader_alice",
      "subreddit": "Readwise",
      "permalink": "/r/Readwise/comments/fake001",
      "created_utc": 1712000000,
      "score": 54,
      "num_comments": 23,
      "upvote_ratio": 0.92
    },
    {
      "id": "t3_fake002",
      "title": "How do you sync Readwise to Obsidian?",
      "selftext": "Looking for the cleanest workflow.",
      "author": "workflow_bob",
      "subreddit": "ObsidianMD",
      "permalink": "/r/ObsidianMD/comments/fake002",
      "created_utc": 1712000000,
      "score": 8,
      "num_comments": 3,
      "upvote_ratio": 0.88
    }
  ]
}
```

- [ ] **Step 5.3: Write failing test**

Create `~/.claude/skills/product-validation/tests/test_retriever.py`:

```python
"""Tests for retriever."""

import json
from unittest.mock import patch

from lib.schema import Hypothesis
from retriever import retrieve_candidates, dedupe_candidates, expand_queries
from conftest import fixture_path


def test_dedupe_candidates_by_id():
    from lib.schema import Candidate

    c1 = Candidate(
        id="t3_same",
        kind="post",
        text="first",
        author="a",
        subreddit="r/x",
        permalink="/x/1",
        created_utc=1,
        score=10,
        hit_by_query="q1",
    )
    c1_dup = Candidate(
        id="t3_same",
        kind="post",
        text="first",
        author="a",
        subreddit="r/x",
        permalink="/x/1",
        created_utc=1,
        score=10,
        hit_by_query="q2",
    )
    c2 = Candidate(
        id="t3_other",
        kind="post",
        text="second",
        author="b",
        subreddit="r/x",
        permalink="/x/2",
        created_utc=1,
        score=5,
        hit_by_query="q1",
    )
    out = dedupe_candidates([c1, c1_dup, c2])
    assert len(out) == 2
    ids = {c.id for c in out}
    assert ids == {"t3_same", "t3_other"}


def test_expand_queries_generates_variations():
    hypothesis = Hypothesis(
        problem_statement="Users save too many articles in Readwise and never read them",
        target_subreddits=["r/Readwise"],
        existing_solutions=["Ghostreader"],
    )
    queries = expand_queries(hypothesis, max_queries=10)
    assert 5 <= len(queries) <= 10
    # Original terms should appear somewhere
    joined = " ".join(queries).lower()
    assert "readwise" in joined or "highlights" in joined or "save" in joined


def test_retrieve_candidates_with_mocked_reddit(monkeypatch):
    """End-to-end retrieval with Reddit search mocked."""
    fake_response = json.loads(fixture_path("reddit_search_response.json").read_text())

    def fake_search(query, subreddit=None, **kwargs):
        return fake_response["posts"]

    # Mock the reddit.search_reddit_items (or whatever the real name is) to return fixture
    import retriever
    monkeypatch.setattr(retriever, "_reddit_search", fake_search)
    monkeypatch.setattr(retriever, "_enrich_with_comments", lambda posts: [])

    hypothesis = Hypothesis(
        problem_statement="Readwise users drowning in saves",
        target_subreddits=["r/Readwise", "r/ObsidianMD"],
    )
    # Use fixed queries to avoid Claude call
    candidates, metadata = retrieve_candidates(
        hypothesis,
        queries_override=["drowning in readwise"],
        enable_adjacent_subs=False,
    )

    assert metadata.total_candidates >= 1
    assert len(candidates) >= 1
    # All candidates should be from listed subreddits
    assert all(c.subreddit in {"r/Readwise", "r/ObsidianMD"} for c in candidates)
```

- [ ] **Step 5.4: Run test to verify it fails**

```bash
cd ~/.claude/skills/product-validation
python3 -m pytest tests/test_retriever.py -v
```

Expected: FAIL with `ModuleNotFoundError`.

- [ ] **Step 5.5: Write retriever implementation**

Create `~/.claude/skills/product-validation/scripts/retriever.py`:

**IMPORTANT:** Before writing, verify the function names from Step 5.1. Replace `reddit.search_reddit_items` and `reddit_enrich.enrich_reddit_item` with the actual names if they differ.

```python
"""Wide Reddit retrieval with adjacent-subreddit discovery."""

import json
from typing import List, Optional, Tuple
from collections import Counter

import anthropic

from lib.last30days_imports import reddit, reddit_enrich
from lib.schema import Candidate, Hypothesis, RunMetadata


QUERY_EXPANSION_PROMPT = """Given this product-validation hypothesis, generate search queries that would find Reddit posts and comments describing the pain.

HYPOTHESIS
Problem statement: {problem_statement}
Existing solutions to watch for: {existing_solutions}
Power-user signals: {power_user_signals}

Generate {max_queries} search queries. Include:
- 2-3 literal restatements of the problem in different wording
- 2-3 queries using the language a frustrated user would actually type (not the formal framing)
- 1-2 queries combining the problem with an existing solution name (e.g., "Ghostreader limitations")
- 1-2 queries for workarounds or alternatives people try

Return a JSON array of strings, each a single search query. No prose.
"""


MAX_QUERIES_DEFAULT = 12
POSTS_PER_QUERY_PER_SUBREDDIT = 15
COMMENTS_PER_POST = 8
ADJACENT_SUBS_TO_TRY = 3
ADJACENT_SUB_MIN_HITS = 2


def expand_queries(hypothesis: Hypothesis, max_queries: int = MAX_QUERIES_DEFAULT) -> List[str]:
    """Ask Claude to generate search query variations."""
    client = anthropic.Anthropic()
    prompt = QUERY_EXPANSION_PROMPT.format(
        problem_statement=hypothesis.problem_statement,
        existing_solutions=", ".join(hypothesis.existing_solutions) or "(none)",
        power_user_signals=hypothesis.power_user_signals or "(not specified)",
        max_queries=max_queries,
    )
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
    queries = json.loads(raw)
    # Cap at max_queries
    return queries[:max_queries]


def _reddit_search(query: str, subreddit: Optional[str] = None, limit: int = POSTS_PER_QUERY_PER_SUBREDDIT) -> List[dict]:
    """Wrapper for the last30days reddit search. Centralized so tests can monkeypatch it."""
    # TODO(task-5-step-1): adjust function name and signature to match the actual reddit.py API
    # determined in Step 5.1. Common forms seen: reddit.search_reddit_items(query, subreddit=...),
    # reddit.search(...), or a class-based API. Use whatever the actual library exposes.
    return reddit.search_reddit_items(query=query, subreddit=subreddit, limit=limit)


def _enrich_with_comments(posts: List[dict]) -> List[dict]:
    """Wrapper for comment enrichment. Returns comment dicts with parent_post_id set."""
    comments = []
    for post in posts:
        try:
            enriched = reddit_enrich.enrich_reddit_item(post, max_comments=COMMENTS_PER_POST)
            for cmt in enriched.get("top_comments", []):
                cmt["parent_post_id"] = post["id"]
                cmt["parent_post_text"] = post.get("title", "") + "\n" + post.get("selftext", "")
                comments.append(cmt)
        except Exception as e:
            print(f"WARNING: comment enrichment failed for {post.get('id')}: {e}")
    return comments


def _post_to_candidate(post: dict, query: str) -> Candidate:
    subreddit = post.get("subreddit", "")
    if not subreddit.startswith("r/"):
        subreddit = f"r/{subreddit}"
    permalink = post.get("permalink", "")
    if permalink.startswith("/"):
        permalink = f"https://reddit.com{permalink}"
    return Candidate(
        id=post["id"],
        kind="post",
        text=f"{post.get('title', '')}\n{post.get('selftext', '')}".strip(),
        author=post.get("author", "[unknown]"),
        subreddit=subreddit,
        permalink=permalink,
        created_utc=int(post.get("created_utc", 0)),
        score=int(post.get("score", 0)),
        num_comments=int(post.get("num_comments", 0)),
        hit_by_query=query,
    )


def _comment_to_candidate(comment: dict, query: str) -> Candidate:
    subreddit = comment.get("subreddit", "")
    if not subreddit.startswith("r/"):
        subreddit = f"r/{subreddit}"
    permalink = comment.get("permalink", "")
    if permalink.startswith("/"):
        permalink = f"https://reddit.com{permalink}"
    return Candidate(
        id=comment["id"],
        kind="comment",
        text=comment.get("body", ""),
        author=comment.get("author", "[unknown]"),
        subreddit=subreddit,
        permalink=permalink,
        created_utc=int(comment.get("created_utc", 0)),
        score=int(comment.get("score", 0)),
        parent_post_id=comment.get("parent_post_id"),
        parent_post_text=comment.get("parent_post_text"),
        hit_by_query=query,
    )


def dedupe_candidates(candidates: List[Candidate]) -> List[Candidate]:
    """Dedupe by id. Keep the first occurrence."""
    seen = set()
    out = []
    for c in candidates:
        if c.id in seen:
            continue
        seen.add(c.id)
        out.append(c)
    return out


def retrieve_candidates(
    hypothesis: Hypothesis,
    queries_override: Optional[List[str]] = None,
    enable_adjacent_subs: bool = True,
    max_queries: int = MAX_QUERIES_DEFAULT,
) -> Tuple[List[Candidate], RunMetadata]:
    """Wide retrieval across target subreddits, optional adjacent-sub expansion."""
    metadata = RunMetadata()

    queries = queries_override or expand_queries(hypothesis, max_queries=max_queries)
    metadata.queries_generated = list(queries)
    metadata.target_subreddits_searched = list(hypothesis.target_subreddits)

    # Primary retrieval: queries × target subreddits
    posts_with_query: List[dict] = []
    for query in queries:
        for sub in hypothesis.target_subreddits:
            sub_name = sub.replace("r/", "")
            try:
                results = _reddit_search(query, subreddit=sub_name)
                for r in results:
                    r["_query"] = query
                posts_with_query.extend(results)
            except Exception as e:
                print(f"WARNING: search failed for query='{query}' sub={sub_name}: {e}")

    # Build post candidates
    candidates: List[Candidate] = [
        _post_to_candidate(p, p["_query"]) for p in posts_with_query
    ]

    # Enrich top posts with comments (comments carry the same _query as their parent)
    comments = _enrich_with_comments(posts_with_query)
    for cmt in comments:
        cmt_query = cmt.get("_query") or ""
        candidates.append(_comment_to_candidate(cmt, cmt_query))

    # Adjacent subreddit discovery
    if enable_adjacent_subs:
        sub_counter = Counter(p.get("subreddit", "") for p in posts_with_query)
        target_set = {s.replace("r/", "") for s in hypothesis.target_subreddits}
        adjacent = [
            (sub, count)
            for sub, count in sub_counter.most_common()
            if sub not in target_set and count >= ADJACENT_SUB_MIN_HITS
        ][:ADJACENT_SUBS_TO_TRY]

        adj_subset_queries = queries[: max(3, len(queries) // 3)]  # subset for adjacent subs
        for sub, _ in adjacent:
            metadata.adjacent_subreddits_tried.append(f"r/{sub}")
            hit_count = 0
            for query in adj_subset_queries:
                try:
                    results = _reddit_search(query, subreddit=sub)
                    for r in results:
                        r["_query"] = query
                    for r in results:
                        candidates.append(_post_to_candidate(r, query))
                    hit_count += len(results)
                except Exception:
                    pass
            metadata.adjacent_subreddit_hit_counts[f"r/{sub}"] = hit_count

    candidates = dedupe_candidates(candidates)
    metadata.total_candidates = len(candidates)
    return candidates, metadata
```

Also, update `_enrich_with_comments` so that each comment carries the parent post's `_query` for later tracking:

```python
def _enrich_with_comments(posts: List[dict]) -> List[dict]:
    """Wrapper for comment enrichment. Returns comment dicts with parent_post_id and _query set."""
    comments = []
    for post in posts:
        try:
            enriched = reddit_enrich.enrich_reddit_item(post, max_comments=COMMENTS_PER_POST)
            for cmt in enriched.get("top_comments", []):
                cmt["parent_post_id"] = post["id"]
                cmt["parent_post_text"] = post.get("title", "") + "\n" + post.get("selftext", "")
                cmt["_query"] = post.get("_query", "")
                comments.append(cmt)
        except Exception as e:
            print(f"WARNING: comment enrichment failed for {post.get('id')}: {e}")
    return comments
```

Replace the earlier `_enrich_with_comments` block with this version.

- [ ] **Step 5.6: Run retriever tests (non-live)**

```bash
cd ~/.claude/skills/product-validation
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY python3 -m pytest tests/test_retriever.py -v
```

Expected: 3 tests pass. `test_expand_queries_generates_variations` makes a real Claude call; `test_retrieve_candidates_with_mocked_reddit` does not hit Reddit.

- [ ] **Step 5.7: Live smoke test retriever against a single subreddit**

Run this ad-hoc check to confirm the Reddit backend works:

```bash
cd ~/.claude/skills/product-validation
python3 -c "
import sys
sys.path.insert(0, 'scripts')
from lib.schema import Hypothesis
from retriever import retrieve_candidates
h = Hypothesis(
    problem_statement='Readwise users overwhelmed by highlights they never revisit',
    target_subreddits=['r/Readwise'],
)
cands, meta = retrieve_candidates(h, max_queries=4, enable_adjacent_subs=False)
print(f'Candidates: {len(cands)}')
print(f'Queries: {meta.queries_generated}')
for c in cands[:3]:
    print(f'  [{c.kind}] {c.subreddit} / u/{c.author}: {c.text[:80]}...')
"
```

Expected: returns a non-zero number of candidates from r/Readwise. Requires `SCRAPECREATORS_API_KEY` env var set (same one last30days uses).

If this fails with an auth error, inspect how last30days reads the key (check `~/.claude/plugins/marketplaces/last30days-skill/scripts/lib/env.py` or similar) and ensure it's set in the shell running the test.

- [ ] **Step 5.8: Commit**

```bash
cd ~/.claude/skills/product-validation
git add scripts/retriever.py tests/test_retriever.py fixtures/reddit_search_response.json
git commit -m "feat: retriever with query expansion, adjacent-sub discovery, comment enrichment"
```

---

## Task 6: Skill orchestrator + SKILL.md

**Files:**
- Create: `~/.claude/skills/product-validation/SKILL.md`
- Create: `~/.claude/skills/product-validation/scripts/validate.py`

- [ ] **Step 6.1: Write the validate.py orchestrator**

Create `~/.claude/skills/product-validation/scripts/validate.py`:

```python
"""CLI entry point for the product-validation pipeline.

Usage:
    python3 validate.py <path-to-product-folder> [--threshold 2] [--no-adjacent-subs] [--max-queries 12]

Reads product-validation.md from the given folder, runs the full pipeline,
writes product-validation-findings-YYYY-MM-DD.md back to the same folder.
"""

import argparse
import datetime as dt
import sys
from pathlib import Path

from doc_reader import DocReaderError, print_coverage, read_validation_doc
from retriever import retrieve_candidates
from classifier import classify_candidates, prefilter_by_relevance
from synthesizer import render_findings
from lib.schema import RunMetadata


def main() -> int:
    parser = argparse.ArgumentParser(description="Reddit product validation pipeline.")
    parser.add_argument("product_folder", help="Path to a product folder containing product-validation.md")
    parser.add_argument("--threshold", type=int, default=2, help="Classifier score threshold (0-3). Default 2.")
    parser.add_argument("--no-adjacent-subs", action="store_true", help="Skip adjacent-subreddit discovery.")
    parser.add_argument("--max-queries", type=int, default=12, help="Max queries to generate.")
    parser.add_argument("--min-relevance", type=float, default=0.15, help="Pre-filter relevance threshold.")
    args = parser.parse_args()

    product_folder = Path(args.product_folder).expanduser().resolve()
    doc_path = product_folder / "product-validation.md"
    if not doc_path.exists():
        print(f"ERROR: {doc_path} not found.")
        return 1

    print(f"[1/4] Reading {doc_path}")
    try:
        hypothesis, coverage = read_validation_doc(doc_path)
    except DocReaderError as e:
        print(f"ERROR: {e}")
        return 1
    print_coverage(coverage)
    print(f"  Problem: {hypothesis.problem_statement[:120]}")
    print(f"  Target subreddits: {', '.join(hypothesis.target_subreddits)}")

    print("[2/4] Retrieving candidates from Reddit")
    candidates, run_metadata = retrieve_candidates(
        hypothesis,
        enable_adjacent_subs=not args.no_adjacent_subs,
        max_queries=args.max_queries,
    )
    print(f"  Generated {len(run_metadata.queries_generated)} queries")
    print(f"  {run_metadata.total_candidates} candidates retrieved")
    if run_metadata.adjacent_subreddits_tried:
        print(f"  Adjacent subs tried: {', '.join(run_metadata.adjacent_subreddits_tried)}")

    print("[3/4] Classifying candidates")
    # Pre-filter happens inside classify_candidates; capture the intermediate count
    prefiltered = prefilter_by_relevance(hypothesis, candidates, args.min_relevance)
    run_metadata.after_relevance_prefilter = len(prefiltered)
    findings = classify_candidates(
        hypothesis,
        candidates,
        threshold=args.threshold,
        min_relevance=args.min_relevance,
    )
    run_metadata.after_classifier = len(findings)
    run_metadata.classifier_threshold = args.threshold
    print(f"  {len(prefiltered)} after relevance pre-filter → {len(findings)} after classifier")

    print("[4/4] Writing findings")
    today = dt.date.today().isoformat()
    run_metadata.run_timestamp = today
    output_path = product_folder / f"product-validation-findings-{today}.md"
    markdown = render_findings(hypothesis, findings, run_metadata, rejected_for_review=[])
    output_path.write_text(markdown)
    print(f"  Written to {output_path}")
    print(f"  {len(findings)} findings, "
          f"{sum(1 for f in findings if f.power_user_signal)} power-user candidates, "
          f"{len({f.mentions_existing_solution for f in findings if f.mentions_existing_solution})} existing solutions")

    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 6.2: Write SKILL.md**

Create `~/.claude/skills/product-validation/SKILL.md`:

```markdown
---
name: product-validation
description: Reddit product-validation pipeline. Reads a product-validation.md doc from a product folder, runs wide Reddit retrieval and strict classification, writes findings back. Use when validating a product hypothesis against Reddit conversations, or finding pain evidence and power-user candidates for a specific problem.
---

# product-validation

Reddit-first product-validation pipeline. Given a product folder containing `product-validation.md`, this skill searches target subreddits for posts and comments matching the hypothesis, classifies candidates against the doc's problem statement, and writes a findings report back to the folder.

## When to Use

- The user has a `product-validation.md` file for a product and wants to run Reddit research.
- The user asks to "validate" a product hypothesis or find pain evidence on Reddit.
- The user says "run the product-validation pipeline" or "find Reddit evidence for voice-tutor" (or any product name).

## How to Use

### Step 1: Locate the product folder

Product folders live under `~/second-brain/projects/products/<name>/`. Confirm `product-validation.md` exists inside.

### Step 2: Run the pipeline

```bash
cd ~/.claude/skills/product-validation
python3 scripts/validate.py ~/second-brain/projects/products/<product-name>
```

Optional flags:
- `--threshold N` — classifier score threshold (default 2). Lower = more findings, noisier.
- `--no-adjacent-subs` — skip adjacent-subreddit discovery.
- `--max-queries N` — cap query expansion (default 12).
- `--min-relevance F` — pre-filter relevance threshold (default 0.15).

### Step 3: Report to the user

After the run completes, summarize:
- The number of candidates retrieved, pre-filtered, and classified.
- The output file path.
- Top 3 findings by score.

Do NOT interpret findings for the user unprompted — the output doc is designed to be read directly. Just point them to it.

## Prerequisites

- `ANTHROPIC_API_KEY` set (for query expansion, doc extraction, classification)
- `SCRAPECREATORS_API_KEY` set (for Reddit search, via the last30days library)
- `last30days` plugin installed at the canonical marketplace path (v2.9.5)

## Troubleshooting

- **`DocReaderError`** — the doc is missing a problem statement or target subreddits. Ask the user to add those.
- **Reddit auth errors** — check `SCRAPECREATORS_API_KEY` in the shell env.
- **Zero findings** — the output doc will still write with the coverage log. Check if the queries make sense; iterate on the source doc.
```

- [ ] **Step 6.3: Commit**

```bash
cd ~/.claude/skills/product-validation
git add SKILL.md scripts/validate.py
git commit -m "feat: skill orchestrator and SKILL.md"
```

---

## Task 7: End-to-end smoke test against voice-tutor

**Files:**
- No new files. Run the real pipeline against voice-tutor's real doc.

- [ ] **Step 7.1: Run the pipeline**

```bash
cd ~/.claude/skills/product-validation
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY SCRAPECREATORS_API_KEY=$SCRAPECREATORS_API_KEY \
  python3 scripts/validate.py ~/second-brain/projects/products/voice-tutor
```

Expected:
- Logs show all 4 steps executing.
- A file appears at `~/second-brain/projects/products/voice-tutor/product-validation-findings-YYYY-MM-DD.md`.
- The file has all expected sections: Coverage, Pain Evidence, Existing Solutions Mentioned, Power User Candidates, Rejected for Review.

- [ ] **Step 7.2: Manual review**

Open the findings doc. Verify:
- Pain Evidence section has at least a few findings (if Reddit actually has voice-tutor-adjacent discussions — it almost certainly does).
- Existing Solutions section lists at least Ghostreader or Snipd if they appear in findings.
- Power User Candidates has at least one entry.
- No Python tracebacks or warnings in the logged output.

If pain evidence is empty:
- Check the queries generated — are they reasonable phrasings of the problem?
- Try lowering `--threshold` to 1 and rerun to see what's getting rejected.
- Try `--min-relevance 0.05` to see if the pre-filter is too strict.

- [ ] **Step 7.3: Commit the findings doc**

```bash
cd ~/second-brain
git add projects/products/voice-tutor/
git commit -m "Add first Reddit validation run for voice-tutor"
```

- [ ] **Step 7.4: Update the product-validation project README**

Create `~/second-brain/projects/product-validation/README.md`:

```markdown
# Product Validation Pipeline

Claude Code skill that validates product hypotheses against Reddit conversations. Reads a `product-validation.md` from a product folder, runs wide retrieval + strict classification, writes findings back.

## Status

V1 shipped (YYYY-MM-DD). Reddit-only. Hypothesis-validation mode.

## Usage

```bash
cd ~/.claude/skills/product-validation
python3 scripts/validate.py ~/second-brain/projects/products/<name>
```

Or invoke via the Claude Code skill: `/validate <product-name>`.

## Files

- `~/.claude/skills/product-validation/` — skill code
- `2026-04-14-reddit-pipeline-design.md` — design spec
- `2026-04-14-reddit-pipeline-implementation-plan.md` — implementation plan

## Pinned dependencies

- `last30days` plugin v2.9.5 (do not upgrade to v3 without porting score.py)

## Future (not built)

- Discovery mode (no hypothesis — find pain clusters)
- X as a second source
- Scheduled runs (likely not needed — product validation is interactive)
```

Commit to the vault:

```bash
cd ~/second-brain
git add projects/product-validation/README.md
git commit -m "Add product-validation project README"
```

---

## Spec Coverage Check

| Spec section | Implemented in |
|-|-|
| Four independent components | Tasks 2–5 (one per component) |
| Claude Code skill integration | Task 6 (SKILL.md + validate.py) |
| Reuses last30days lib (pinned v2.9.5) | Task 1 (lib/last30days_imports.py) |
| Doc reader: Claude extraction, fail-loud on required | Task 3 |
| Retriever: query expansion, adjacent subs, comment enrichment | Task 5 |
| Classifier: relevance pre-filter + batched Claude | Task 4 |
| Synthesizer: pure formatting, golden-file test | Task 2 |
| Determinism: temp 0 | Tasks 3, 4, 5 (all Claude calls set temp 0) |
| Error handling at external-API boundaries | Tasks 3, 4 (retry/exit), 5 (warn + continue) |
| Testing strategy per component | Tasks 2–5 (each has its own test file) |
| End-to-end validation | Task 7 |

All spec requirements map to at least one task.

---

## Notes

- **Subreddit search API specifics**: Task 5 Step 1 explicitly verifies the real function name in last30days' `reddit.py` before writing retriever code. This is the only place the plan has an unavoidable dependency on runtime inspection; keep this step — don't skip it.
- **Git strategy**: `~/.claude/skills/product-validation/` can optionally be its own git repo. If the user prefers a single vault repo, the skill directory should be a submodule or symlink. Check with the user before Task 1.9 commits.
- **`claude-sonnet-4-6` model ID**: uses the current Claude Sonnet 4.6 model across all LLM calls. Update if Anthropic ships a newer ID before implementation.
