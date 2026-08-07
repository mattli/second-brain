---
created: 2026-08-07
type: validation
status: AWAITING MATT'S MARKS — nothing written to labels.json yet
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

Nothing here has been written to `labels.json`. That happens after you mark it.

Context for why this exists: [[2026-08-06-coverage-read-path-review]] — a
22-minute, 83-user-turn session scored 3 covered claims, which is what prompted
building this now.

---

## `c4` — borderline

- [ ] **I agree this was not covered.**

> **Claim.** Graph engineering buys breadth and speed, not better judgment, and a graph is only as honest as its anchors — outputs verified against reality, not against other model outputs.

**What the transcript has.** **Both** clauses of this claim were stated verbatim by the tutor, in its very first substantive turn — including the anchors clause. You then said you didn't know and asked to start from basics, and the topic was never returned to in any session. A keyword search for `anchor` across all ten sessions finds only this turn plus two sign-offs promising to cover the anchors section "next time."

**Closest the conversation came:**

- *2026-07-26, assistant:* “Sure. The document opens with a claim that cuts against how most people think about AI systems: *graph engineering buys you breadth and speed, not better judgment. *. That's counterintuitive — people usually assume more agents means smarter output. But the document says a graph is only as honest as its anchors. What do you make of that framing?”

- *2026-07-26, user:* “I honestly don't know. We need to start from basic.”

- *2026-07-26, user:* “What is a graph?”

- *2026-07-26, assistant:* “Fair. A **graph** here is just a network of tasks — nodes and edges. Each node is one bounded job with an input and output. An edge is a real data dependency: one node waits because it actually needs what another produced. If there's no data passing along that arrow, the edge is fake — and the wait is wasted time. Does that land, or want an example?”

**The judgment call.** Whether a claim the tutor states, unengaged and immediately dropped, is covered. This is the calibration question for the whole map: if stating counts, coverage measures what the tutor said; if engagement is required, it measures what you actually worked through.

**Notes:**

---

## `c31` — borderline

- [ ] **I agree this was not covered.**

> **Claim.** The human gate principle is to place approval where a mistake would be expensive to undo, not on every step — too many gates create a bottleneck defeating the graph's purpose, while too few gates leave irreversible actions unwatched.

**What the transcript has.** One turn states the principle and both of its failure directions — approving everything kills the graph's value, and irreversible actions need the gate. It arrives as an aside inside a conversation about something else, not as its own topic.

**Closest the conversation came:**

- *2026-07-27, assistant:* “Right — and that's actually the human gate principle the document covers later. You don't approve every step, because that kills the graph's value. But you *do* approve where a mistake would be expensive to undo. The irreversible stuff — anything that ships, touches a customer, or sets the architecture for the next six months. The graph runs wide and fast, but the gate sits where judgment matters. That's the balance. Ready to…”

**The judgment call.** Whether a fully-stated principle delivered as a digression counts, when the session never treated it as a subject in its own right.

**Notes:**

---

## `c20` — borderline

- [ ] **I agree this was not covered.**

> **Claim.** Cost-conscious diamond design uses cheap models on boring nodes and the strong model only where judgment matters, with the fan-out → reduce → verify → synthesize skeleton applying across job types like market scans, code review, or research reports.

**What the transcript has.** The claim has two halves. The skeleton half is covered repeatedly and well, including the job types it names — the turns mention market scans and code reviews explicitly. The cost half is absent: a search across all ten sessions for cheap/strong model selection language returns one unrelated hit ("cheap enough to use routinely", about parallelism becoming affordable).

**Closest the conversation came:**

- *2026-07-26, assistant:* “Alright. The diamond has three steps. Step one: **fan-out** — split work across parallel workers. In the market research example, that's five agents each researching a different angle. Step two: **reduce** — compress their results using plain code, not another model call. Just dedupe, flatten, merge the findings. Step three: **synthesize** — one final agent writes the unified answer from the reduced pile. Fan-out, reduce,…”

- *2026-07-26, assistant:* “Exactly. The fan-out gets you breadth — five different perspectives at once. The reduce step is just housekeeping — dedupe, flatten, no thinking required. Then the synthesize agent does the judgment work — reads everything and writes one coherent answer. That's the diamond. And the document says this is the dominant shape in production agent systems — Claude's research feature, code reviews, market scans all use this…”

**The judgment call.** Whether a compound claim is covered when one half is thoroughly covered and the other never comes up at all.

**Notes:**

---

## `c11` — borderline

- [ ] **I agree this was not covered.**

> **Claim.** Nodes and edges both carry contracts: a node contract enforces bounded input, bounded output, and exactly one job via a schema; an edge contract names the data shape crossing it, which lets you verify the edge is real and swap nodes without breaking the graph.

**What the transcript has.** Nodes, edges, bounded jobs and the fake-edge test are all covered, more than once. The claim's specific mechanism — that both carry *contracts*, enforced by a schema, letting you swap nodes without breaking the graph — never appears. The only `schema` hit in ten sessions is about structured extraction to avoid context collapse, a different subject.

**Closest the conversation came:**

- *2026-07-26, assistant:* “Fair. A **graph** here is just a network of tasks — nodes and edges. Each node is one bounded job with an input and output. An edge is a real data dependency: one node waits because it actually needs what another produced. If there's no data passing along that arrow, the edge is fake — and the wait is wasted time. Does that land, or want an example?”

- *2026-07-26, assistant:* “A **node** is one bounded task with a clear input and output — like "research competitors" or "check for typos." An **edge** is a real data dependency: Node B waits for Node A because it actually needs A's output to do its job. If no data passes along that arrow, the edge is fake and you're wasting time. Nodes are the work, edges are the "who waits for whom." Good?”

**The judgment call.** Whether covering a concept covers a claim about the formal mechanism that enforces it.

**Notes:**

---

## `c56` — borderline

- [ ] **I agree this was not covered.**

> **Claim.** The tell for whether a graph is warranted is whether you can find two jobs with no edge between them; if not, it's just a loop, and that's fine.

**What the transcript has.** The ingredients are covered — the fake-edge test, and loop versus graph. The claim states them as a decision rule for whether to build a graph at all. A search for that framing ("two jobs", "no edge between", "warranted", "just a loop") returns **zero** hits across all ten sessions.

**Closest the conversation came:**

- *2026-07-26, assistant:* “Sure. A **graph** is a network of tasks — nodes and edges. A **node** is one bounded job; an **edge** is a real data dependency. If there's no data passing, the edge is fake and you're wasting time. A **loop** is one agent cycling on one task; a **graph** coordinates multiple loops in parallel. The **diamond pattern** is the main shape: fan-out to parallel agents, reduce with code, synthesize with one final agent. The…”

**The judgment call.** Whether material assembled into a decision rule is a distinct claim from the parts, when the rule itself was never stated.

**Notes:**

---

## `c45` — clear-negative

- [ ] **I agree this was not covered.**

> **Claim.** Model selection should match role: cheap, fast models for the main transformation work, and the strongest model reserved for reviewers and rule-writers, since a bad rule propagates downstream; Mike Krieger fanned out twelve subagents on Sonnet for the main migration while reserving the larger model for review.

**What the transcript has.** Zero hits across all ten sessions for role-based model selection, reviewers on stronger models, rule-writers, or the twelve-subagent example. The nearest turns by word overlap share only generic vocabulary ("model", "work", "downstream") and are about verification and routing.

_No turn in any session discusses this. Quotes omitted rather than padded with unrelated ones._

**The judgment call.** Expected: not covered. Here as a control — if this one comes back covered, the problem is the labelling, not the judge.

**Notes:**

---

## `c41` — clear-negative

- [ ] **I agree this was not covered.**

> **Claim.** Forcing a rule citation on every review finding turns vague complaints into actionable queue items, reveals that a rule cited across multiple files is one badly written rule rather than many problems, and treats reviewer disagreement as a sign of rulebook ambiguity requiring an edit rather than a coin flip.

**What the transcript has.** Zero hits for rule citations on review findings. The nearest turns by word overlap are about parallel barriers and a cross-session recap.

_No turn in any session discusses this. Quotes omitted rather than padded with unrelated ones._

**The judgment call.** Expected: not covered. Control.

**Notes:**

---

## `c25` — clear-negative

- [ ] **I agree this was not covered.**

> **Claim.** In the go-to-market kit build, three researchers profile the buyer, map channels, and collect competitor positioning in parallel, merging into a positioning document that requires human approval before three writers draft landing copy, launch posts, and outreach messages, checked against the approved positioning.

**What the transcript has.** The go-to-market kit is one of the document's three worked builds, and none of it appears: zero hits for go-to-market, landing copy, launch posts, or buyer profiling. The nearest turns are about parallelism in general.

_No turn in any session discusses this. Quotes omitted rather than padded with unrelated ones._

**The judgment call.** Expected: not covered. Control — and a check on whether a named worked example that was skipped entirely is scored differently from a concept that was skipped.

**Notes:**

---

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
