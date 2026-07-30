# Graph Engineering — unresolved anchors, for manual review

Doc `ac4b826f-b189-442e-98c0-a59bb066d600` · **15 of 71** claims are `anchor_unresolved`. For each: the claim, the passage the model **cited** as its source, and the **nearest region** in the actual source text (fuzzy match). No accuracy judgment is made here — claim, cited passage, and source are laid out side by side for you to judge.

**0 of 15** had NO similar source region found.

---

## 1. `c8`

**Claim.** The AI engineering stack layers wrap each other in order: prompt engineering, context engineering, harness engineering, loop engineering, then graph engineering, and skipping a lower layer causes the graph to fail in a more elaborate way.

**Cited passage** (model's anchor):
> prompt engineering (the words you send) → context engineering (everything the model sees) → harness engineering (the code around the model) → loop engineering (the autonomous cycle driving one agent toward a goal) → graph engineering (the coordination layer across many loops). Skip a lower layer and the graph just fails in a more elaborate way.

**Nearest source region** (fuzzy ratio **0.72**; longest shared fragment: *“(the autonomous cycle driving one agent toward a goal) →”*):
> …years is exactly what you want to trust with production work. Each layer in the AI engineering stack wraps the one before it: **prompt engineering** (the words you send) → **[context engineering](../concepts/llm-knowledge-bases.md)** (everything the model sees) → **[harness engineering](agent-harness.md)** (the code around the model) → **[loop engineering](loop-engineering.md)** (the autonomous cycle driving one agent toward a goal) → **graph engineering** (the coordination layer across many loops). Skip a lower layer and the graph just fails in a more elaborate way. A single agent loop is just a one-node graph with an edge pointing back to itself — graphs don't replace loops, they…

---

## 2. `c17`

**Claim.** A loop hides the critical 'what runs next' decision inside a black box, making it invisible and unauditable, whereas a graph makes that decision explicit and inspectable before the run starts.

**Cited passage** (model's anchor):
> A [loop](loop-engineering.md) hides one critical decision inside a black box: *what runs next*. Every time a loop agent decides whether to retry, escalate, or move on, that decision happens inside the model's own reasoning — invisible to you, unauditable after the fact... A graph makes that same decision explicit, written down, inspectable before the run even starts.

**Nearest source region** (fuzzy ratio **0.77**; longest shared fragment: *“A [loop](loop-engineering.md) hides one critical decision inside a black box: *what runs next*. Every time a loop agent decides whether to retry, escalate, or move on, that decision happens inside the model's own reasoning — invisible to you, unauditable after the fact”*):
> …Auditability Argument Most of graph engineering's practical value — parallelism, cost savings, verification — is covered elsewhere on this page. But there is a deeper, structural argument for graphs that goes beyond efficiency: **auditability**. A [loop](loop-engineering.md) hides one critical decision inside a black box: *what runs next*. Every time a loop agent decides whether to retry, escalate, or move on, that decision happens inside the model's own reasoning — invisible to you, unauditable after the fact, impossible to inspect without re-reading raw output and hoping the model explained itself honestly. A graph makes that same decision explicit, written down, inspectable before the run even starts.…

---

## 3. `c19`

**Claim.** Commitment 1, Immutable Plan, requires that the execution plan be locked once generated and not shift mid-run, trading flexibility for inspectability.

**Cited passage** (model's anchor):
> **Commitment 1: Immutable Plan.** The execution plan cannot shift mid-run. Once generated and locked, it exists as one fixed version for the duration of the run... Locking the plan trades flexibility for inspectability

**Nearest source region** (fuzzy ratio **0.78**; longest shared fragment: *“1: Immutable Plan.** The execution plan cannot shift mid-run. Once generated and locked, it exists as one fixed version for the duration of the run.”*):
> …empirical question. Understanding a rigorously argued proposal that hasn't yet been proven at scale is more useful than pretending it's settled. ### Three Commitments **Commitment 1: Immutable Plan.** The execution plan cannot shift mid-run. Once generated and locked, it exists as one fixed version for the duration of the run. An agent that can freely revise its own plan mid-run is exactly the agent whose behavior becomes impossible to audit, because the plan you'd review afterward isn't the plan that was actually followed. Locking the plan trades flexibility for…

---

## 4. `c23`

**Claim.** Each of the three commitments can be tested for sloppy implementation, such as confirming escalation occurs rather than silent adaptation, checking that failure reports contain no forward-looking decisions, and confirming clean escalation at the defined recovery limit.

**Cited passage** (model's anchor):
> To test immutable plan: construct a mid-run scenario where the "obviously correct" next step would deviate from the locked plan — confirm the system escalates rather than silently adapting. To test separated layers: check whether the execution layer's failure reports contain any decision about what should happen next... To test strict escalation: feed the system a failure that neither defined recovery attempt can fix and confirm it escalates cleanly at the defined limit

**Nearest source region** (fuzzy ratio **0.75**; longest shared fragment: *“To test immutable plan: construct a mid-run scenario where the "obviously correct" next step would deviate from the locked plan — confirm the system escalates rather than silently adapting. To test separated layers: check whether the execution layer's failure reports contain any decision about what should happen next”*):
> …state with defined transitions, rather than a decision happening silently inside a single model call. ### Testing the Three Commitments Each commitment has its own way of quietly failing if implemented sloppily. To test immutable plan: construct a mid-run scenario where the "obviously correct" next step would deviate from the locked plan — confirm the system escalates rather than silently adapting. To test separated layers: check whether the execution layer's failure reports contain any decision about what should happen next ("this probably needs a different approach") — if so, the separation is cosmetic. To test strict escalation: feed the system a failure that neither defined recovery attempt can fix and confirm it escalates cleanly at the defined limit rather than attempting an undefined third approach. Track…

---

## 5. `c25`

**Claim.** The fake-edge test asks, at each workflow step, whether it actually needs the result of the step before it; most workflows have two or three fake edges that only run sequentially because of typing order, not data dependency.

**Cited passage** (model's anchor):
> walk your current workflow step by step and at each step ask — *does this step actually need the result of the one before it?*... Most workflows have two or three fake edges — sequential steps that only run in order because that's the order they were typed, not because of any data dependency.

**Nearest source region** (fuzzy ratio **0.76**; longest shared fragment: *“. Most workflows have two or three fake edges — sequential steps that only run in order because that's the order they were typed, not because of any data dependen”*):
> …the task is uniformly hard. ## The Fake-Edge Test The single most useful technique in graph engineering: walk your current workflow step by step and at each step ask — *does this step actually need the result of the one before it?* If yes, the edge is real. If no, the two tasks can run simultaneously. Most workflows have two or three fake edges — sequential steps that only run in order because that's the order they were typed, not because of any data dependency. A linear workflow with 40 steps has 40 points of sequential failure and the latency of all 40 summed. The same 40 tasks drawn as a graph execute at the speed of the slowest…

---

## 6. `c27`

**Claim.** The diamond pattern — fan out, reduce, synthesize — is the dominant graph shape in production agent systems, exemplified by Claude's research feature where a lead plans angles, workers gather in parallel, findings get checked, and one report reaches the user.

**Cited passage** (model's anchor):
> The dominant graph shape in production agent systems: **fan-out, reduce, synthesize.**... Claude's research feature runs exactly this: a lead plans angles, workers gather in parallel, findings get checked, and one report reaches the user.

**Nearest source region** (fuzzy ratio **0.71**; longest shared fragment: *“Claude's research feature runs exactly this: a lead plans angles, workers gather in parallel, findings get checked, and one report reaches the user.”*):
> …synthesize.** 1. **Fan out** — split work across parallel workers (one per angle, file, or subtask) 2. **Reduce** — compress results with plain code (not another LLM call) 3. **Synthesize** — a final agent writes the unified answer Claude's research feature runs exactly this: a lead plans angles, workers gather in parallel, findings get checked, and one report reaches the user. The coordination is code, not conversation — passing results between agents costs zero extra context. Two implementation details make fan-out robust. First, the parallel barrier waits for every worker before returning,…

---

## 7. `c33`

**Claim.** In the SEO content machine build, three parallel researchers feed an outline, a writer drafts from it, and a fact-checker flags unsupported claims, with nothing publishing without human review.

**Cited passage** (model's anchor):
> Three parallel researchers cover what top-ranking pages include, what real questions people ask, and what everyone misses. Their outputs merge into an outline, a writer drafts from the outline, and a fact-checker flags every claim without a source... nothing publishes without human review.

**Nearest source region** (fuzzy ratio **0.83**; longest shared fragment: *“Three parallel researchers cover what top-ranking pages include, what real questions people ask, and what everyone misses. Their outputs merge into an outline, a writer drafts from the outline, and a fact-checker flags every claim without a s”*):
> …skeptic node attacks every finding, trying to disprove it — only survivors reach the final report, ranked by confidence. The skeptic pass is the difference between research and rumor collection. **SEO content machine.** Three parallel researchers cover what top-ranking pages include, what real questions people ask, and what everyone misses. Their outputs merge into an outline, a writer drafts from the outline, and a fact-checker flags every claim without a source. The draft lands in a folder with flagged claims listed at the top — nothing publishes without human review. **Go-to-market kit.** Three researchers profile the buyer…

---

## 8. `c43`

**Claim.** Anthropic's build methodology starts with building the judge first: deciding a machine-checkable pass/fail criterion for the work before writing instructions about the work itself.

**Cited passage** (model's anchor):
> Before writing a single instruction about the work itself, decide how a machine tells you the work is correct... You have a judge when you can answer this without opening the output: *what command tells me this passed?*

**Nearest source region** (fuzzy ratio **0.59**; longest shared fragment: *“. You have a judge when you can answer this without opening the output: *what command tells me this pa”*):
> …correct. For code, this wraps the test runner. For documents, it checks required sections and forbidden patterns. For data, it validates schema and row counts. When a check is too fuzzy for a script, the judge calls a model with the source material and a yes/no question and parses the answer. You have a judge when you can answer this without opening the output: *what command tells me this passed?* ### 2. Validate the judge in both directions A judge that never fails is decoration. Run it against a known-good input (should pass) and a deliberately broken copy…

---

## 9. `c49`

**Claim.** Two independent reviewers should run in fresh sessions with clean context, seeing only the output and rulebook, and every finding should require a rule citation, since disagreement between reviewers usually signals rulebook ambiguity.

**Cited passage** (model's anchor):
> Run two fresh sessions per item, each seeing only the output and the rulebook, nothing else. No worker reasoning, no chat history... Force a rule citation on every finding... Disagreement between the two reviewers usually means the rulebook is ambiguous at that spot.

**Nearest source region** (fuzzy ratio **0.69**; longest shared fragment: *“Run two fresh sessions per item, each seeing only the output and the rulebook, nothing else. No worker reasoning, no chat history.”*):
> …picks up at 60% because the disk remembers. ### 6. Two independent reviewers with clean context One reviewer in the same context as the worker will agree with the worker — it has seen the reasoning and is primed to accept it. Run two fresh sessions per item, each seeing only the output and the rulebook, nothing else. No worker reasoning, no chat history. Force a rule citation on every finding. A citation turns a vague complaint into a queue item. A rule cited three times across different files is not three problems — it's one badly written rule. Disagreement between the two reviewers usually means the…

---

## 10. `c52`

**Claim.** Model selection should use cheap, fast models for the main transformation work and reserve the strongest model for reviewers and rule-writing, since bad rules propagate into every downstream output; Mike Krieger used twelve Sonnet subagents for migration and a larger model for review.

**Cited passage** (model's anchor):
> Use cheap, fast models for workers doing the main transformation. Save the strong model for reviewers and anything that writes rules other agents will follow — a bad rule propagates into every downstream output... Mike Krieger fanned out twelve subagents on Sonnet for the main migration, reserving the larger model for review.

**Nearest source region** (fuzzy ratio **0.83**; longest shared fragment: *“e cheap, fast models for workers doing the main transformation. Save the strong model for reviewers and anything that writes rules other agents will follow — a bad rule propagates into every downstream output”*):
> …binary. Ten agents each triggering a full rebuild means paying ten times for work that batches into one. ### Model selection by role Don't run the largest model everywhere. Use cheap, fast models for workers doing the main transformation. Save the strong model for reviewers and anything that writes rules other agents will follow — a bad rule propagates into every downstream output, which is exactly where capability is worth paying for. Mike Krieger fanned out twelve subagents on Sonnet for the main migration, reserving the larger model for review. ## Failure Modes ### Context collapse Fan out a thousand nodes, then feed all outputs into one final step — you blow past…

---

## 11. `c59`

**Claim.** Self-routing dynamic workflows let the model write its own orchestration script for jobs that can't be planned in advance, decomposing the task and spawning a coordinated fleet, and good runs can be saved as version-controlled, re-runnable scripts.

**Cited passage** (model's anchor):
> With dynamic workflows, you describe the objective and the model writes the orchestration script itself — decomposing the task, choosing the fan-out, spawning a coordinated fleet of subagents, and synthesizing the result... When a run is good, save its script — version-controlled, re-runnable by name

**Nearest source region** (fuzzy ratio **0.79**; longest shared fragment: *“With dynamic workflows, you describe the objective and the model writes the orchestration script itself — decomposing the task, choosing the fan-out, spawning a coordinated fleet of subagents, and synthesizing the result.”*):
> …cosmetic — topology is the single biggest lever on wall-clock time. ## Self-Routing (Dynamic Workflows) The final move: stop drawing the graph by hand for jobs you can't plan in advance. With dynamic workflows, you describe the objective and the model writes the orchestration script itself — decomposing the task, choosing the fan-out, spawning a coordinated fleet of subagents, and synthesizing the result. You get a graph tailored to *this* run instead of a fixed one you hoped would fit. When a run is good, save its script — version-controlled, re-runnable by name, a graph anyone who clones the repo can launch. This is where graph engineering…

---

## 12. `c62`

**Claim.** Choosing between a loop and a graph is a genuine tradeoff between adaptiveness and auditability, not a maturity ladder: loops suit genuinely exploratory work, while graphs suit tasks with enumerable failure modes, expensive unbounded retries, or a need for inspection by reviewers.

**Cited passage** (model's anchor):
> The two patterns are not mutually exclusive, and choosing between them is a genuine tradeoff, not a maturity ladder. Reach for a loop when the task is genuinely exploratory... Reach for a graph when failure modes are enumerable in advance, when unbounded retry cycles would be expensive, and when a reviewer... needs to inspect what the system was capable of doing

**Nearest source region** (fuzzy ratio **0.63**; longest shared fragment: *“. Reach for a graph when failure modes are enumerable in advance, when unbounded retry cycles would be expensive, and when a reviewer”*):
> …failure in advance and the model's ability to improvise is exactly the capability you're relying on. Research, open-ended debugging where the root cause is unknown at the start, and creative work where rigid structure would hurt the output all favor a loop's adaptiveness. Reach for a graph when failure modes are enumerable in advance, when unbounded retry cycles would be expensive, and when a reviewer — compliance, security, or your future self debugging a production incident — needs to inspect what the system was capable of doing without re-reading a full transcript. Migrations, financial transactions, regulated data, and long-running unattended work all favor a graph's structure. A common pragmatic…

---

## 13. `c64`

**Claim.** Amdahl's law gives a speedup ceiling: N agents buy at most 1/((1-p)+p/N) speedup where p is the parallelizable fraction; at 95% parallel, sixteen agents yield roughly 9x and even 256 agents only reach about 18.6x.

**Cited passage** (model's anchor):
> if a fraction *p* of the work is parallelizable and the rest is serial (the final merge, the verify, every real edge), then *N* agents buy you at most 1 / ((1 − p) + p/N) speedup. At 95% parallel, sixteen agents buy roughly 9× — not 16×... even 256 agents at 95% parallel only reach ~18.6×.

**Nearest source region** (fuzzy ratio **0.78**; longest shared fragment: *“work is parallelizable and the rest is serial (the final merge, the verify, every real edge), then *N* agents buy you at most 1 / ((1 − p) + p/N) speedup. At 95% parallel, sixteen agents buy roughly 9× — not 16×.”*):
> …valuable. ## Amdahl's Law: The Speedup Ceiling You can know the real speedup before deploying a single agent. **Amdahl's law** gives the ceiling: if a fraction *p* of the work is parallelizable and the rest is serial (the final merge, the verify, every real edge), then *N* agents buy you at most 1 / ((1 − p) + p/N) speedup. At 95% parallel, sixteen agents buy roughly 9× — not 16×. The merge-and-verify tail eats the difference. Push further and the ceiling holds: even 256 agents at 95% parallel only reach ~18.6×. The critical path from the fake-edge test is the floor (the fastest the work can ever finish). The serial fraction…

---

## 14. `c66`

**Claim.** There are six ready-made graph recipes reusing the same skeleton — security sweep, cited research, module port, adversarial diff-review, scheduled ecosystem scan, and unknown-size discovery.

**Cited passage** (model's anchor):
> Six concrete jobs that reuse the same skeleton with a different task line: 1. **Security sweep.**... 2. **Cited research.**... 3. **Module port.**... 4. **Adversarial diff-review.**... 5. **Scheduled ecosystem scan.**... 6. **Unknown-size discovery.**

**Nearest source region** (fuzzy ratio **0.43**; longest shared fragment: *“Six concrete jobs that reuse the same skeleton with a different task line: 1. **Security sweep.**”*):
> …independent nodes, and you have your number before a single agent runs. ## Six Ready-Made Recipes The method is one — find the real edges, fan out, verify on fresh context, isolate the workers. Six concrete jobs that reuse the same skeleton with a different task line: 1. **Security sweep.** One agent per file hunts a missing auth check; an independent verifier confirms every hit before it reaches the report. 2. **Cited research.** The question splits into angles, search runs in parallel, and agents refute each other before a word gets written. (Claude Code ships this as `/deep-research`…

---

## 15. `c67`

**Claim.** A graph needs anchors — outputs that cannot be argued with, like tests that actually ran, revenue that landed in the bank, and customers who actually stayed — because topology alone does not buy truth, and letting a system grade its own reports leaves it confidently wrong.

**Cited passage** (model's anchor):
> A graph needs **anchors** — nodes whose outputs cannot be argued with: tests that actually ran (not "should pass" — *did* pass), revenue that landed in the bank, customers who actually stayed... Judge a graph on numbers that can't argue back and it stays grounded. Let it grade its own reports and it will be confidently wrong.

**Nearest source region** (fuzzy ratio **0.65**; longest shared fragment: *“A graph needs **anchors** — nodes whose outputs cannot be argued with: tests that actually ran (not "should pass" — *did* pass), revenue that landed in the bank, customers who actually stayed.”*):
> …nodes, and meta-nodes, and every node reads a report that came from the same system. Everything is consistent. Nothing is verified against reality. Topology alone does not buy truth. A graph needs **anchors** — nodes whose outputs cannot be argued with: tests that actually ran (not "should pass" — *did* pass), revenue that landed in the bank, customers who actually stayed. Some constraints must be frozen — kept off-limits precisely because they're the ones an optimizer would weaken to win. Judge a graph on numbers that can't argue back and it stays grounded. Let it grade its own reports and it will be confidently wrong. ## Cost Reality A graph costs more than…

---