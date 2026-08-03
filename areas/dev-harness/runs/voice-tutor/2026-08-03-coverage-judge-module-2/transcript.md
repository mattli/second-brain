coverage judge module — 2026-08-03
Outcome:  Paused — hit the per-sprint time limit (your work so far is saved). Caps are checked between steps, so a run can go a little past them.
Progress: 1 of 5 stages finished
Quality:  scored 97, 45 out of 100
Spent:    $12.74
Code:     branch run-msdql2bo in /Users/mattli/development/voice-tutor
Records:  runs/voice-tutor/2026-08-03-coverage-judge-module-2

────────────────────────────────────────────

## Stage 0 — core data contract + parsing defenses   [✓ 97/100] · $6.54
  created 2 files, revised 7 times, ran 8 commands.
  Requirements:
    - A standalone module importable as top-level `coverage_judge` (either a `coverage_judge.py` module or a `coverage_judge/` package — in both cases runnable later via `python -m coverage_judge`) is added to the voice-tutor repo, with a hermetic test file at tests/test_coverage_judge.py. The hermetic tests make NO network/LLM calls; no Anthropic client is constructed at import time, and none is constructed during the hermetic test run (the suite runs with no API key and no network). A lazily-defined, never-reached model-invocation seam (repo-standard, per claims.py) is permitted. Nothing reachable from the hermetic tests imports bot.py, the server, pipecat, or any live app path.
    - Claim-list loading: a function loads a claim list into an ordered collection of claims each exposing an id and claim text, tolerant of the repo's actual .claims.json sidecar shape ({"claims":[{"id","claim",...}]}) — normalizing the `claim` field to text and accepting either the sidecar envelope or a bare list. Preserves input order and rejects an empty claim list.
    - Claim-list validation surfaces clear, typed errors (module-defined exception, not bare KeyError/IndexError) on malformed input: missing id, missing/blank text, duplicate claim ids, and non-list/non-envelope top-level shape.
    - Transcript loading/validation: a function loads an indexed transcript as a list of turns each normalized to {index:int, role, content}, guaranteeing a stable integer index space so verdict `turns:[int]` can reference transcript indices. Rule: if NO turn carries an `index`, assign contiguous 0-based indices in list order; if indices ARE supplied, they must all be ints and unique and are preserved as-is. Malformed input (missing role/content, non-int supplied index, a partially-supplied index set where some turns have an index and some do not, duplicate supplied indices, non-list top-level) raises the module's typed validation error.
    - Markdown-fence stripping: a pure function strips surrounding ```json / ``` fences (and plain ``` fences, with or without a language tag, with surrounding whitespace) from a model text response and returns the inner text (parsing is a separate step so the two functions compose cleanly), and is a no-op on already-clean JSON text.
    - Strict verdict parsing produces, for a given claim-id set, a collection of verdict objects each of shape {claim_id, covered: bool, turns: [int]} with types validated (covered is bool, turns is a list of ints). An empty `turns` list ([]) is valid (e.g. a covered:false verdict): type validation checks list-of-int and emptiness is permitted, not an error. Malformed verdict entries (non-bool covered, missing fields, non-int turns element) raise the module's parse error.
    - Completeness/truncation detection uses a defined exception hierarchy: a single module-defined base parse error with distinguishable subclasses (or a typed discriminator attribute) covering (a) invalid JSON, (b) truncation/count-mismatch, (c) unknown/extra claim_id, (d) duplicate claim_id in output, and (e) missing claim_id. Verdict claim_ids must exactly match the input claim-id set. The count/completeness check is measured against the TOTAL claim count (every claim id must appear exactly once regardless of its covered value).
    - Invalid JSON (non-JSON text after fence stripping) raises the module's defined parse-error base (or a subclass) rather than an unhandled json.JSONDecodeError, so callers/retry logic can catch a single defined exception type.
  Scope (not graded — enforced at review):
    - New files only within the voice-tutor repo (top-level `coverage_judge` module/package + tests/test_coverage_judge.py, matching the repo's flat top-level module style like claims.py/documents.py). Do NOT modify bot.py, the server, existing prompts, labels.json, claim maps, transcripts, or any live path under ~/.voice-tutor.
    - Sprint 0 is offline foundations only: no live Anthropic/model call implementation exercised, no fixtures copied yet, no credentialed smoke, and no app wiring/ledger writes. The actual judge invocation, v2 prompt hashing against fixtures, union_coverage, CLI, and credentialed label-agreement smoke belong to later sprints and are out of scope here.
    - Transport-defense parsing functions must be pure and model-independent (no Anthropic client dependency); any model-call surface must be injectable/mockable so hermetic tests stay network-free.

## Stage 1 — v2 judge prompt (versioned + hashed)   [✗ stopped (last score 45/100)] · $6.21
  revised 1 time, ran 28 commands.
  Stopped: wall-clock.
  Requirements:
    - The module (top-level coverage_judge.py, a new file following the repo's flat top-level module convention) defines the v2 judge prompt as an in-module, embedded, versioned artifact: the full prompt text is loadable in-process via a stable module symbol/accessor (a module constant or packaged resource embedded in the source, NOT read from the external eval-set folder at runtime) and carries an explicit version identifier equal to 'v2'.
    - The module implements a deterministic prompt-hash function that reproduces the repo's exact v1 hashing scheme. The v1 prompt input used for verification is the byte-for-byte contents of judge-prompt-v1.md (embedded as a test fixture/constant, copied verbatim, not paraphrased or reformatted), and hashing that exact v1 text with the module's public hash function yields exactly the literal '632b73a34b1a22b1'.
    - The prompt-hash function is a genuine content-sensitive hash primitive (not a lookup table): it is pure and deterministic (same input always yields the same output across calls), maps different inputs to different outputs, is the single public function used to hash both v1 and v2, and produces a correct digest for arbitrary inputs — not only the two known prompt texts. The module documents (in source, e.g. docstring/comment) the concrete hash primitive it uses (algorithm plus any truncation/digest-size), and the SAME primitive that the function actually computes must be the one that reproduces the v1 target '632b73a34b1a22b1' in c2 (one hash function, cross-checked two ways — not independently guessable per criterion).
    - The module exposes the v2 prompt's hash computed via the same public scheme, derived from the v2 text at load time (not a hardcoded literal), in a form suitable for embedding into every verdict's metadata as judge_prompt_hash.
    - v2 is a strict tightening of v1, not a replacement that trades recall. v2 must (i) contain a named/labeled section that constrains coverage against topic/keyword/shape adjacency (the v1 strictness dimension — an explanation merely on the same topic or sharing keywords/shape is not automatically covered), AND (ii) contain a DISTINCT, separately-labeled content-match section requiring that 'covered' means the tutor's explanation is consistent with the claim's SPECIFIC assertions (same substance), enumerating the fluent-wrongness exclusions — an explanation that substitutes different list members, uses a different mechanism, or contradicts/substitutes specifics is NOT covered even if fluent and adjacent (targeting the c30 failure). v2 prompt text must not be byte-equal to v1.
    - All Sprint 1 hermetic tests live in the single file tests/test_coverage_judge.py, construct no network client at import time, and make NO network/LLM calls.
  Scope (not graded — enforced at review):
    - New files only in the voice-tutor repo (top-level coverage_judge.py following the repo's flat module convention, plus tests/test_coverage_judge.py and any test fixtures under tests/). Do NOT modify bot.py, the server, existing prompts, labels.json, judge-prompt-v1.md, or any live/app path.
    - This sprint delivers only the versioned+hashed v2 prompt artifact and its deterministic hashing/exposure. No live model call, CLI, union logic, transcript/claim parsing, or credentialed smoke is required to pass Sprint 1; stubs may exist but need not be exercised.
    - Do not re-judge, tune against, or modify labels.json; it is the frozen answer key and is not touched in this sprint.

## Stage 2 — single-invocation judge + verdict assembly   (not reached)
  Not started — the run stopped at an earlier stage.

## Stage 3 — union coverage + standalone CLI   (not reached)
  Not started — the run stopped at an earlier stage.

## Stage 4 — credentialed smoke: 17/17 label agreement   (not reached)
  Not started — the run stopped at an earlier stage.
