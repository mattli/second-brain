---
created: 2026-08-07
type: validation
status: COMPLETE 2026-08-07 — all 10 marked; written to labels.json as era 2
document: Graph Engineering (2aa66acc), 63-claim map
---

# False-negative probe — review sheet

`labels.json` holds only claims marked **covered**, so the eval can catch the
judge getting *looser* over time and is structurally blind to it getting
*stricter* — wrongly denying coverage, which under-fills the bar and reads to a
tester as no progress. This sheet is the input to closing that gap: your
verdicts on claims the judge said were **not** covered.

## How to mark this

Every claim below was judged **not covered in all 10 sessions** on Graph
Engineering (42 of the 63 claims were never covered; these are 8 of them,
deliberately mixed).

- **Check the box** if you agree it wasn't covered — the judge was right.
- **Leave it unchecked** if you think the conversation did cover it — the judge
  was too strict, and that's a false negative worth encoding.

Quotes are verbatim, located by search and pulled straight from the transcripts.
Claims marked *clear-negative* are controls: they should be easy checks, and if
one isn't, that's a finding about the labelling rather than the judge.

**What the transcript has** states what is present and what is absent, with the
search that establishes the absence — kept separate from **the judgment call**
so you're weighing the gap rather than my reading of it. Add a note wherever the
reason matters more than the verdict.

**Marked and closed 2026-08-07.** All ten verdicts are written to `labels.json` as `not_covered_review` (era 2). Nine upheld the judge; `c31` is the sole false negative. Era 1's covered-only rows are untouched.

Context for why this exists: [[2026-08-06-coverage-read-path-review]] — a
22-minute, 83-user-turn session scored 3 covered claims, which is what prompted
building this now.

---

## `c4` — borderline — ✅ RESOLVED 2026-08-07: JUDGE WAS RIGHT

**Matt's verdict: correctly not covered. Mentioning is not explaining.** The turn
recites both clauses and asks "what do you make of that framing?" — it never
unpacks what an anchor *is*, or why verifying against reality differs from
verifying against model outputs. Headline, not lesson.

This settles the test for the whole map, and it is **not** about student
engagement — the judgment is on the TUTOR's output. The question is only ever
*was the claim explained?* My earlier framing of this as a stated-versus-engaged
question was wrong; it is corrected below and in the README.

- [x] **I agree this was not covered.**

> **Claim.** Graph engineering buys breadth and speed, not better judgment, and a graph is only as honest as its anchors — outputs verified against reality, not against other model outputs.

**What the transcript has.** **Both** clauses of this claim were RECITED verbatim by the tutor, in its very first substantive turn — including the anchors clause — and then handed straight back as a question. Neither clause is explained anywhere: a keyword search for `anchor` across all ten sessions finds only this turn plus two sign-offs promising to cover the anchors section "next time." So the words appear and the lesson never does.

**Closest the conversation came:**

- *2026-07-26, assistant:* “Sure. The document opens with a claim that cuts against how most people think about AI systems: *graph engineering buys you breadth and speed, not better judgment. *. That's counterintuitive — people usually assume more agents means smarter output. But the document says a graph is only as honest as its anchors. What do you make of that framing?”

- *2026-07-26, user:* “I honestly don't know. We need to start from basic.”

- *2026-07-26, user:* “What is a graph?”

- *2026-07-26, assistant:* “Fair. A **graph** here is just a network of tasks — nodes and edges. Each node is one bounded job with an input and output. An edge is a real data dependency: one node waits because it actually needs what another produced. If there's no data passing along that arrow, the edge is fake — and the wait is wasted time. Does that land, or want an example?”

**The judgment call.** Whether reciting a claim and asking about it is explaining it. *(Answered: no.)*

**Notes:** yes, the tutor did mention it (in the first substantive turn), but mentioning it does not equate to explaining it.

---

## `c31` — borderline — ✅ RESOLVED 2026-08-07: CONFIRMED FALSE NEGATIVE

**Matt's verdict: the judge was too strict.** The turn states the principle and
both failure directions — that is the claim's full content. Encode as
not-covered-but-should-be. See [[#Judge bias — under-crediting digressions]].

- [ ] ~~I agree this was not covered.~~ — *answered: no.*

> **Claim.** The human gate principle is to place approval where a mistake would be expensive to undo, not on every step — too many gates create a bottleneck defeating the graph's purpose, while too few gates leave irreversible actions unwatched.

**What the transcript has.** One turn states the principle and both of its failure directions — approving everything kills the graph's value, and irreversible actions need the gate. It arrives as an aside inside a conversation about something else, not as its own topic.

**Closest the conversation came:**

- *2026-07-27, assistant:* “Right — and that's actually the human gate principle the document covers later. You don't approve every step, because that kills the graph's value. But you *do* approve where a mistake would be expensive to undo. The irreversible stuff — anything that ships, touches a customer, or sets the architecture for the next six months. The graph runs wide and fast, but the gate sits where judgment matters. That's the balance. Ready to…”

**The judgment call.** Whether a fully-stated principle delivered as a digression counts, when the session never treated it as a subject in its own right.

**Notes:** This is still borderline, but it feels natural enough that I would call it covered.

---

## `c20` — borderline

- [x] **I agree this was not covered.**

> **Claim.** Cost-conscious diamond design uses cheap models on boring nodes and the strong model only where judgment matters, with the fan-out → reduce → verify → synthesize skeleton applying across job types like market scans, code review, or research reports.

**What the transcript has.** The claim has two halves. The skeleton half is covered repeatedly and well, including the job types it names — the turns mention market scans and code reviews explicitly. The cost half is absent: a search across all ten sessions for cheap/strong model selection language returns one unrelated hit ("cheap enough to use routinely", about parallelism becoming affordable).

**Closest the conversation came:**

- *2026-07-26, assistant:* “Alright. The diamond has three steps. Step one: **fan-out** — split work across parallel workers. In the market research example, that's five agents each researching a different angle. Step two: **reduce** — compress their results using plain code, not another model call. Just dedupe, flatten, merge the findings. Step three: **synthesize** — one final agent writes the unified answer from the reduced pile. Fan-out, reduce,…”

- *2026-07-26, assistant:* “Exactly. The fan-out gets you breadth — five different perspectives at once. The reduce step is just housekeeping — dedupe, flatten, no thinking required. Then the synthesize agent does the judgment work — reads everything and writes one coherent answer. That's the diamond. And the document says this is the dominant shape in production agent systems — Claude's research feature, code reviews, market scans all use this…”

**The judgment call.** Whether a compound claim is covered when one half is thoroughly covered and the other never comes up at all.

**Notes:** I agree, what is missing is specific mention of the "cheap models on boring nodes and the strong model only where judgment matters" portion of the claim.

---

## `c11` — borderline

- [x] **I agree this was not covered.**

> **Claim.** Nodes and edges both carry contracts: a node contract enforces bounded input, bounded output, and exactly one job via a schema; an edge contract names the data shape crossing it, which lets you verify the edge is real and swap nodes without breaking the graph.

**What the transcript has.** Nodes, edges, bounded jobs and the fake-edge test are all covered, more than once. The claim's specific mechanism — that both carry *contracts*, enforced by a schema, letting you swap nodes without breaking the graph — never appears. The only `schema` hit in ten sessions is about structured extraction to avoid context collapse, a different subject.

**Closest the conversation came:**

- *2026-07-26, assistant:* “Fair. A **graph** here is just a network of tasks — nodes and edges. Each node is one bounded job with an input and output. An edge is a real data dependency: one node waits because it actually needs what another produced. If there's no data passing along that arrow, the edge is fake — and the wait is wasted time. Does that land, or want an example?”

- *2026-07-26, assistant:* “A **node** is one bounded task with a clear input and output — like "research competitors" or "check for typos." An **edge** is a real data dependency: Node B waits for Node A because it actually needs A's output to do its job. If no data passes along that arrow, the edge is fake and you're wasting time. Nodes are the work, edges are the "who waits for whom." Good?”

**The judgment call.** Whether covering a concept covers a claim about the formal mechanism that enforces it.

**Notes:**

---

## `c56` — borderline

- [x] **I agree this was not covered.**

> **Claim.** The tell for whether a graph is warranted is whether you can find two jobs with no edge between them; if not, it's just a loop, and that's fine.

**What the transcript has.** The ingredients are covered — the fake-edge test, and loop versus graph. The claim states them as a decision rule for whether to build a graph at all. A search for that framing ("two jobs", "no edge between", "warranted", "just a loop") returns **zero** hits across all ten sessions.

**Closest the conversation came:**

- *2026-07-26, assistant:* “Sure. A **graph** is a network of tasks — nodes and edges. A **node** is one bounded job; an **edge** is a real data dependency. If there's no data passing, the edge is fake and you're wasting time. A **loop** is one agent cycling on one task; a **graph** coordinates multiple loops in parallel. The **diamond pattern** is the main shape: fan-out to parallel agents, reduce with code, synthesize with one final agent. The…”

**The judgment call.** Whether material assembled into a decision rule is a distinct claim from the parts, when the rule itself was never stated.

**Notes:**

---

## `c45` — clear-negative — ✅ VERIFIED BY READING 2026-08-07

Matt had a faint recollection this came up, so all 625 turns across all ten
sessions were **read in full**, not searched. **Nothing exists.** No turn
discusses choosing different models for different roles, in any phrasing —
no cheap-model-for-bulk / strong-model-for-review distinction, no rule-writer
role, no twelve subagents, no Sonnet. The nearest thing is one turn about
parallelism becoming "cheap enough to use routinely", which is about the
economics of spinning up workers, not about which model to spend on where.

**The recollection is real but attaches to a different turn.** Mike Krieger —
who this claim names — *is* mentioned once, in a passing list of migration
examples. That mention is the likely source of the memory, and it is evidence
for **c62**, not for this claim. See the addendum.

**Matt's verdict 2026-08-07: confirmed not covered.**

- [x] **I agree this was not covered.**

> **Claim.** Model selection should match role: cheap, fast models for the main transformation work, and the strongest model reserved for reviewers and rule-writers, since a bad rule propagates downstream; Mike Krieger fanned out twelve subagents on Sonnet for the main migration while reserving the larger model for review.

**What the transcript has.** Zero hits across all ten sessions for role-based model selection, reviewers on stronger models, rule-writers, or the twelve-subagent example. The nearest turns by word overlap share only generic vocabulary ("model", "work", "downstream") and are about verification and routing.

_No turn in any session discusses this. Quotes omitted rather than padded with unrelated ones._

**The judgment call.** Expected: not covered. Here as a control — if this one comes back covered, the problem is the labelling, not the judge.

**Notes:** Let's double check this one. I faintly recall the claim coming up in conversation, but I'm not sure.

---

## `c41` — clear-negative

- [x] **I agree this was not covered.**

> **Claim.** Forcing a rule citation on every review finding turns vague complaints into actionable queue items, reveals that a rule cited across multiple files is one badly written rule rather than many problems, and treats reviewer disagreement as a sign of rulebook ambiguity requiring an edit rather than a coin flip.

**What the transcript has.** Zero hits for rule citations on review findings. The nearest turns by word overlap are about parallel barriers and a cross-session recap.

_No turn in any session discusses this. Quotes omitted rather than padded with unrelated ones._

**The judgment call.** Expected: not covered. Control.

**Notes:**

---

## `c25` — clear-negative

- [x] **I agree this was not covered.**

> **Claim.** In the go-to-market kit build, three researchers profile the buyer, map channels, and collect competitor positioning in parallel, merging into a positioning document that requires human approval before three writers draft landing copy, launch posts, and outreach messages, checked against the approved positioning.

**What the transcript has.** The go-to-market kit is one of the document's three worked builds, and none of it appears: zero hits for go-to-market, landing copy, launch posts, or buyer profiling. The nearest turns are about parallelism in general.

_No turn in any session discusses this. Quotes omitted rather than padded with unrelated ones._

**The judgment call.** Expected: not covered. Control — and a check on whether a named worked example that was skipped entirely is scored differently from a concept that was skipped.

**Notes:**

---

## Addendum — two claims the c45 read surfaced (added 2026-08-07)

Reading all 625 turns turned up a turn that matters for two claims **not** in the
original eight. Both ranked mid-pack on word overlap (0.20, 0.24) so the
similarity method didn't surface them, and both name a person the transcript
actually names — which is exactly why they need marking rather than assuming.

**The question is the c4 question, applied here: did the tutor EXPLAIN the
claim's content?** Not did it say the name. Both claims below are mostly
*specifics* — figures, methods, gates — so the test is whether any of that was
taught, not whether the example was invoked.

The turn both rest on (2026-08-06, assistant), plus its follow-up:

> “Most of the public examples are migrations — **Jarred Sumner porting a million
> lines of code from one language to another, Mike Krieger converting Python to
> TypeScript**. Those are real, but they're also one-time projects where you
> already know the shape of the work.”

> “…the demos are impressive — **“we ported a million lines in two weeks”** — but
> that doesn't mean it's what most builders need right now.”

### `c61` — Jarred Sumner / Bun — ✅ RESOLVED: JUDGE WAS RIGHT

**Matt's verdict:** the tutor mentioned the name and the scale, then explained a
DIFFERENT point — that one-time migrations don't transfer to VoiceTutor. The
claim's own content (Zig→Rust, the CI gate, the cost figures) never appeared.
**The example was used as evidence, not taught.**

- [x] **I agree this was not covered.**

> **Claim.** Jarred Sumner ported Bun from Zig to Rust — a million lines of code in under two weeks with the full existing test suite passing in CI before merge — burning 5.9 billion uncached input tokens and 690 million output tokens (~$165,000 at API pricing).

**Mentioned:** Sumner by name, "a million lines of code from one language to
another", and "in two weeks" (in the follow-up turn). Bun is also named in *four
other turns* — but in the false-independence/worktree discussion, never
connected to this migration.

**Never explained:** Zig→Rust, the CI test-suite gate, and every cost figure —
which is the bulk of what the claim asserts.

**What the tutor did with it.** It used the migration as an *illustration for a
different point* — that public examples are one-time projects where you already
know the shape of the work, and so don't apply to VoiceTutor. That point is
explained. The migration itself is not.

**The judgment call.** Whether explaining what an example *demonstrates* covers a
claim whose content is the example's own specifics.

### `c62` — Mike Krieger — ✅ RESOLVED: JUDGE WAS RIGHT

**Matt's verdict:** five words in a list, no method, not even a headline.

- [x] **I agree this was not covered.**

> **Claim.** Mike Krieger converted a Python codebase to 165,000 lines of TypeScript over a weekend using hundreds of agents, eight phase gates, three adversarial review rounds, and a final check diffing every command's output against the Python original.

**Mentioned:** Krieger by name, and "converting Python to TypeScript". That is the
entire appearance — a five-word clause inside a list.

**Never explained:** 165,000 lines, the weekend, hundreds of agents, eight phase
gates, three adversarial review rounds, the diff check. The claim's substance is
the *method*, and none of the method appears anywhere in ten sessions.

**The judgment call.** Whether a name-drop is coverage. Under c4's answer this
looks like the clearest "no" of the three, since not even the headline was
stated — only the person and the direction of the migration.

---

## Judge bias — under-crediting digressions

**Confirmed 2026-08-07 from c31.** The judge under-credits a claim the tutor
genuinely **explained** when the explanation arrives as an **aside inside a
conversation about something else** rather than as the session's declared
subject. In c31 the tutor explained the human-gate principle and both of its
failure directions — the claim's entire content — while answering a question
about the limits of AI judgment. Marked not covered in all ten sessions.

This is a **judge-prompt** finding, not a labelling one: the fix is to stop the
judge weighting topical framing over whether an explanation happened, not to
hand-label around it.

### The rule these all sit under

**Was the claim EXPLAINED?** That is the whole v1 test. It judges the TUTOR's
output — there is no student-engagement term, and delivery framing is irrelevant.

The two confirmed verdicts are the same rule reaching opposite answers, not
competing rules:

| | what happened | verdict |
|---|---|---|
| `c31` | explained, but as a digression | **should count** — judge was wrong |
| `c4` | recited verbatim, never explained | **should not count** — judge was right |

An earlier draft of this sheet framed c4 as a stated-versus-engaged question.
That was wrong: Matt's c4 mark is about the tutor mentioning without explaining,
not about whether he took the topic up. Corrected here and in the README so the
judge-prompt work aims at the right target.

## After you mark this

Unchecked items are the false negatives. Those become the not-covered half of
the answer key — claim id, your verdict, a one-line reason — versioned in
alongside the existing covered-only labels so the eval can finally fail in both
directions.

If several unchecked items share a shape, that pattern is worth more than the
individual verdicts, because it points at a judge-prompt change rather than a
labelling change. The three shapes this set is built to separate:

1. **Stated but not engaged** (c4) — the tutor said it; you didn't take it up.
2. **Compound claims** (c20, c4) — one half covered, the other absent.
3. **Concept covered, mechanism absent** (c11, c56) — the topic was discussed,
   but not the specific thing the claim asserts.

c4 is the one to read first. It is the only claim in the set the tutor stated
*verbatim, in full*, and the answer to it sets what coverage means for the other
62.
