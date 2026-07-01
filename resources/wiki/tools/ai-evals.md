---
created_at: 2026-05-28
last_updated: 2026-05-28

---

# AI Evals

> TLDR: Effective AI evaluation starts with manually reviewing production traces — not with generic metrics dashboards. For agents specifically, the goal is usually floor-raising (eliminating failures that destroy trust) rather than benchmark-maxxing. Label ~100 traces by hand, categorize the failures, fix the obvious ones without an eval, then build targeted LLM-as-judge evals for the subjective problems that remain. Test the running agent path (tools, state, side effects), not isolated prompts. Keep eval suites small and grounded in real failures — prune cases that haven't failed in months.

## Overview

Most teams approach evals backwards: they start with generic scores (helpfulness, toxicity, coherence) from vendor dashboards, then wonder why the numbers don't translate into product improvements. The practical approach inverts this — start with your actual data, discover the real failure modes through manual annotation, and only then build targeted evals for the problems that matter.

This methodology, drawn from qualitative research techniques in the social sciences (open coding and axial coding), treats eval as an extension of product thinking rather than a purely engineering exercise.

Success with AI products hinges on how fast you can iterate across three activities: evaluating quality, debugging issues, and changing system behavior (prompt engineering, fine-tuning, code). Most teams focus exclusively on changing behavior and plateau quickly. If you streamline evaluation, the other two activities become easy — the same way tests in traditional software engineering pay massive dividends despite requiring up-front investment.

## Floor-Raising vs Benchmark-Maxxing

Before designing evals, choose the frame. **Benchmark-maxxing** pushes top-end capability — useful when augmenting experts who can catch mistakes. **Floor-raising** eliminates the failures that destroy user trust — the right frame for agents that replace human workflows.

A finance agent that cross-references accounts and predicts spending is impressive. But if it sometimes can't answer "how much money is in my bank account?", users stop trusting it. Floor-raising addresses exactly this: making the agent reliable where reliability matters, in the workflows users actually run, in the moments where mistakes are expensive [[source]](https://howtoeval.com).

Floor-raising is error analysis. You're not starting with an abstract test suite — you're doing detective work. Finding the places where the system bends, classifying them, and deciding which ones deserve engineering effort. A floor-raising eval suite is a memory of bugs you refuse to reintroduce.

The litmus test: if you could ship with 90% or 99% pass rate, the benchmark-maxxer chooses 99%. The floor-raiser asks "which 1% fails?" [[source]](https://howtoeval.com).

One of the lowest-hanging floor-raising techniques: teaching your agent to refuse. If confidence is low, say "I don't know." Benchmark-maxxers hate this — it lowers their pass rate. Floor-raisers understand that a confident wrong answer is worse than an honest refusal.

## Golden Cases

Before trusting an agent in production, write down 5–10 cases that represent your critical paths. Start with the simplest version: a single common user question the agent should always handle correctly. If your agent starts failing golden cases, you do not ship [[source]](https://howtoeval.com).

For each golden case, don't just check the final output — inspect the full trajectory: user message, tool calls, retrieved context, reasoning chain. The path matters as much as the answer.

## Three Levels of Evaluation

Evals form a cost pyramid. Level 1 (unit tests) runs cheaply on every code change. Level 2 (human and model-based eval) runs on a set cadence. Level 3 (A/B testing) runs only after significant product changes. There's no strict formula for when to introduce each level — balance getting user feedback quickly, managing user perception, and product goals. But conquering Level 1 before moving to Level 2 is important, since model-based tests require more work and time to execute.

## The Trace Review Process

The foundation of good evals is looking at production traces — the full interaction logs between users and your AI system, including system prompts, tool calls, and internal reasoning steps.

**Start with 100 traces.** Review them one by one, writing short notes about what went wrong (or right). The first few are slow; by trace 10 you're fast. The goal is *theoretical saturation* — keep going until you stop learning new things. Most teams find 100 is more than enough.

**Don't root-cause yet.** During review, just journal what you observe. "The conversation dead-ended." "The AI offered virtual tours but there are none." "Markdown formatting in a text message." Don't debug, don't propose solutions — just note the problems.

**Use AI to categorize, not to observe.** Export your notes into a spreadsheet or CSV, then ask an LLM to group them into 5–6 categories (axial codes). Refine the categories until they feel right. Then use the LLM to classify each note into a category. A pivot table instantly shows which problems dominate.

### Asking Your Agent

One underused debugging technique: reconstruct the run exactly as it was passed to the agent, along with the latest response, and ask it directly what happened. This works because reasoning traces are often opaque — passing the trace back to the same model is the closest you can get to understanding its reasoning, since it can use the available trace, context, and prior messages as evidence [[source]](https://howtoeval.com).

Ask something like: "You were wrong. The answer was X. What would I need to have changed for you to get this right?" The answer isn't always the truth, but it surfaces where the agent is misinterpreting or overindexing on specific parts of the prompt.

## Two Types of Evals

**Code-based evals (reference-based):** When there's a clear right answer — dates, specific data lookups, format compliance — write deterministic assertions. These are cheap, fast, and don't need LLM judges. Fix the bug, write the test, move on.

Organize assertions by feature and scenario. For a real estate listing finder: "only one listing matches query" → assert `len(results) == 1`; "multiple matches" → assert `len(results) > 1`; "no matches" → assert `len(results) == 0`. Generic assertions (e.g., regex-checking that UUIDs aren't leaked in user-facing output) apply across all features [[source]](https://hamel.dev/blog/posts/evals/). Hundreds of these tests, continuously updated as new failure modes appear in production data, provide rapid feedback when iterating on prompts or RAG.

Unlike traditional unit tests, a 100% pass rate isn't always required — the acceptable pass rate is a product decision depending on which failures you can tolerate.

**LLM-as-judge evals (reference-free):** For subjective quality — conversational flow, appropriate handoffs, tone — prompt an LLM to judge traces against specific criteria. These are more expensive but provide the most value for iterating on hard problems.

**Not everything needs an eval.** If the fix is obvious (e.g., the model doesn't know today's date because you forgot to include it), just fix it. Evals earn their keep on problems you'll iterate against repeatedly.

## Code-Aware Offline Evals

Testing prompts in isolation makes no sense once the agent is entangled with code, tools, retrieval, permissions, and product state. The behavior lives in the whole system, not in the prompt string. Offline evals should look less like prompt scoring and more like ordinary software testing — Vitest, pytest, or jest [[source]](https://howtoeval.com).

A good offline eval takes an input, runs the real agent path, and asserts on the result: output, tool calls, files changed, structured data, or final state. Sentry's [vitest-evals](https://github.com/getsentry/vitest-evals) demonstrates this with `describeEval(...)`, an app-local harness, an explicit `run(...)`, normal `expect(...)` assertions, and tool-call checks. OpenAI calls the same idea "macro evals" in their agentic systems cookbook: drive the real agent loop on representative inputs and grade the full trajectory [[source]](https://howtoeval.com).

The key principle: evaluate the agent, not an LLM call.

## Building an LLM Judge

Write a judge prompt that specifies the exact criteria for pass/fail. For a human-handoff judge: list the specific failure modes (user requested transfer but was ignored, too many loops before handoff, etc.) and the conditions under which there is no failure.

**Always output binary (pass/fail).** Continuous scales (1–5) introduce enormous complexity. LLMs are poor at consistent numeric scoring, the results aren't actionable ("3.2 vs 3.7 — is that better?"), and they create false precision that erodes stakeholder trust. If you can't define a clear pass/fail threshold, you probably don't understand the problem well enough yet.

**Add explanations alongside the score.** Have the judge output a structured response with both an explanation field and a binary score. The explanation helps you debug the judge's reasoning when it disagrees with your labels.

## Measuring Judge Quality

The critical step most teams skip: validating that the judge actually works. You already have human labels from the trace review — use them as ground truth.

**Never use raw agreement.** If a failure occurs 10% of the time, a judge that always says "no failure" achieves 90% agreement. That looks great on a dashboard and is completely useless.

**Use true positive rate and true negative rate instead.** TPR: how often does the judge correctly identify real failures? TNR: how often does it correctly identify non-failures? A confusion matrix makes this concrete — you can see exactly where the judge is wrong and in which direction. (Note: raw agreement can be appropriate when failure classes are roughly balanced, around 50/50 — but this is rare in production systems.)

One practical alignment workflow: send a domain expert a spreadsheet with the model's response, the critique model's written critique, and the critique model's binary label. The expert fills in their own critique, label, and preferred response for 25–50 examples at a time. Iterate on the critique prompt until alignment stabilizes, then continue periodic spot-checks to monitor drift [[source]](https://hamel.dev/blog/posts/evals/).

Whether the error rates are acceptable is a business decision, not a statistical one. False positives (flagging non-failures) are usually cheaper than false negatives (missing real failures). Look at the specific misclassified traces, iterate on the judge prompt, and re-measure.

**Hold out data when adding examples.** If you put few-shot examples in the judge prompt, don't test against those same examples — you'll get artificially perfect scores.

## Removing Friction from Trace Review

The biggest bottleneck in eval quality is friction in the data-review loop. Render traces in domain-specific ways that put all relevant context on one screen — the trace log, the CRM state, tool outputs, and links to upstream systems. Off-the-shelf logging tools (LangSmith, etc.) are a starting point, but custom viewing and labeling tools built with lightweight frameworks (Gradio, Streamlit, Shiny) in less than a day often outperform them for domain-specific needs [[source]](https://hamel.dev/blog/posts/evals/).

Design choices that compound: make the final LLM output editable by a human so reviewed traces double as curated fine-tuning data. Add filters by feature and scenario. Embed the downstream application view so reviewers see exactly what the user saw.

Start with binary labels (good/bad) rather than granular scores — they're simpler to manage and less onerous for labelers. More advanced techniques (active learning, consensus voting) can come later.

## Production Monitoring

Once a judge is validated, deploy it against production traces:

- **CI integration:** Run judges on test cases whenever you change code or prompts.
- **Sampling in production:** Score a random sample of live traces to monitor whether failure rates are trending up or down.
- **Debugging at scale:** Use judges to find all instances of a specific failure type across production data, then drill into those traces.

Keep the eval suite small — typically under a dozen judges. Each one has maintenance cost (periodic re-labeling, prompt updates as the product evolves). Code-based evals are cheaper to maintain than LLM judges.

### Scaling Review with Volume

The workflow should scale with traffic. At ten agent runs a day, read everything. At ten thousand, the system needs to tell you what deserves attention. The mistake is reaching for high-volume machinery before you have enough raw texture to know what you're looking for [[source]](https://howtoeval.com).

Start with raw logs as the firehose — look for confusion, frustration, near-misses, repeated prompts, and "you're holding it wrong" moments. When the same stumble keeps appearing, promote it to an issue. Track long-horizon behavioral signals (refusal quality, ignored tool errors, context loss, user frustration). Once you understand an issue, ship the fix and compare affected metrics. Production tells you whether the change actually helped.

## Eval Suite Hygiene

Not every bug deserves an eval case. Ask: is this a critical path? Could it regress? Is it representative of a class of failures, or truly one-off? Be ruthless about pruning — 20 high-signal cases beats 200 low-signal ones [[source]](https://howtoeval.com).

A good heuristic: if an eval case hasn't failed in 3 months, it's either not testing something important or the agent has genuinely improved. Either way, question whether it needs to be there. The pattern for non-trivial issues remains: find in production, reproduce locally, add to evals, fix, verify, ship.

Plan to spend 10–20% of agent development time on evaluation and monitoring — not just writing eval cases, but reading traces, tuning signals, and investigating issues [[source]](https://howtoeval.com).

## Synthetic Data for Pre-Launch

Before you have real users, generate synthetic test inputs by defining *dimensions* — the axes of variation that matter for your product. For a property management assistant: customer type (resident vs. manager), property class (luxury vs. standard), interaction type (maintenance vs. leasing). Generate the cross-product, then ask an LLM to create plausible queries for each combination. This explores the input space far more effectively than asking an LLM to "generate some test questions." For more on generating realistic diverse user cohorts — including evolutionary optimization of persona-generating code — see [Synthetic Personas](../concepts/synthetic-personas.md).

Synthetic generation also works for unit test cases. Prompt an LLM to produce N variations of realistic user inputs for a specific feature, then pair each with a verification query. For a CRM contact creator: generate "Create a contact for John Smith (johndoe@apple.com)" paired with "What's the email address of John Smith?" — then assert the round-trip succeeds. One signal that your tests are good: when the model struggles to pass them, those failure modes become tractable targets for fine-tuning [[source]](https://hamel.dev/blog/posts/evals/).

## Eval Infrastructure Reuse

A well-built eval system generates two additional superpowers nearly for free:

**Fine-tuning data.** 99% of the labor in fine-tuning is assembling high-quality data with good coverage. If you have eval infrastructure, you already have synthetic data generators (reuse your test-case prompts), quality filters (Level 1 assertions and Level 2 critique models reject bad examples), and human-curated traces from the labeling tool. Fine-tuning is best for learning syntax, style, and rules; RAG is better for supplying context and up-to-date facts.

**Debugging.** When you get a complaint or observe an error, a robust eval system gives you a searchable trace database, assertion mechanisms that flag known bad behaviors, log navigation tools for root-cause analysis (RAG failure? code bug? model limitation?), and the ability to make a fix and quickly test its efficacy.

## The Collapse of Harnesses

The current model of "agent SDKs that call models" is showing cracks. As models become more capable and agentic, the distinction between "the model" and "the agent" blurs — visible in Claude Code, the Cursor CLI, and emerging agent SDKs. When the agent is just a prompt and a model, with no framework code to instrument and no explicit tool loop to trace, the harness collapses into the model itself [[source]](https://howtoeval.com).

This changes monitoring. Today we trace tool calls because we can. Tomorrow we might record input/output pairs and ask the model to explain what it did — like asking a human what they were thinking. Verification becomes harder.

The implication: end-to-end evaluation becomes even more important. If you cannot inspect the internals, you have to trust and verify the outputs. Golden cases and production monitoring become the only game in town.

## Common Anti-Patterns

- **Generic metrics first:** Starting with helpfulness/toxicity/coherence dashboards instead of looking at actual traces. These generic scores rarely match the real problems in your application.
- **Skipping annotation:** Jumping straight to automated evals without manually reviewing traces. The annotation step is the single most valuable part of the process — even without building any judges, it produces actionable insights.
- **Continuous scoring:** Using 1–5 scales instead of binary pass/fail. Adds exponential complexity for marginal benefit. Teams must be "extremely disciplined" to use Likert scales correctly, and most aren't.
- **Reporting raw agreement:** Using agreement percentage instead of TPR/TNR. Misleading whenever failures are rare (which they usually are in a working system).
- **Over-investing pre-launch:** Building elaborate eval suites before you have real users. Dog-food the product, get a few friendly customers, and save the serious eval infrastructure for when you have enough data that manual review can't keep up.
- **Focusing only on changing behavior:** Jumping straight to prompt engineering or fine-tuning without investing in evaluation and debugging infrastructure. This is the most common root cause of AI products that never progress beyond a demo.
- **Massive eval suites:** Adding every bug as an eval case without pruning. Six months later you have 500 cases, CI takes 20 minutes, and the team starts ignoring failures because "it's always something" [[source]](https://howtoeval.com).

## The Advanced Use for Generic Scores

Generic scores (hallucination, coherence, etc.) have one legitimate use: as a *sampling mechanism*. Sort your traces by a generic score, then manually review the highest-scoring ones to see if the score correlates with anything real. If it does, you've found a useful filter for prioritizing trace review. But never report generic scores directly to stakeholders.

## Sources

- AI Evaluations Clearly Explained in 50 Minutes (Real Example) | Hamel Husain (Peter Yang, video) — foundational source; end-to-end walkthrough of the trace-review-to-LLM-judge pipeline using Nurture Boss (AI property management assistant) as a real-world case study
- [Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/) | Hamel Husain — three-level eval framework (unit tests → human/model eval → A/B testing); Rechat/Lucy case study; assertion-based unit tests; synthetic test generation; custom trace-viewing tools; eval infrastructure reuse for fine-tuning and debugging
- [How to evaluate AI agents](https://howtoeval.com) | howtoeval.com — floor-raising vs benchmark-maxxing frame; golden cases; code-aware offline evals (test the agent, not the LLM); asking your agent directly; eval suite pruning; production monitoring at scale; collapse of harnesses
