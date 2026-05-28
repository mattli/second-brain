---
created_at: 2026-05-28
last_updated: 2026-05-28
---

# AI Evals

## TLDR

Effective AI evaluation starts with manually reviewing production traces — not with generic metrics dashboards. Label ~100 traces by hand, categorize the failures, fix the obvious ones without an eval, then build targeted LLM-as-judge evals for the subjective problems that remain. Always validate judges against human labels using true positive/true negative rates, never raw agreement.

## Overview

Most teams approach evals backwards: they start with generic scores (helpfulness, toxicity, coherence) from vendor dashboards, then wonder why the numbers don't translate into product improvements. The practical approach inverts this — start with your actual data, discover the real failure modes through manual annotation, and only then build targeted evals for the problems that matter.

This methodology, drawn from qualitative research techniques in the social sciences (open coding and axial coding), treats eval as an extension of product thinking rather than a purely engineering exercise.

## The Trace Review Process

The foundation of good evals is looking at production traces — the full interaction logs between users and your AI system, including system prompts, tool calls, and internal reasoning steps.

**Start with 100 traces.** Review them one by one, writing short notes about what went wrong (or right). The first few are slow; by trace 10 you're fast. The goal is *theoretical saturation* — keep going until you stop learning new things. Most teams find 100 is more than enough.

**Don't root-cause yet.** During review, just journal what you observe. "The conversation dead-ended." "The AI offered virtual tours but there are none." "Markdown formatting in a text message." Don't debug, don't propose solutions — just note the problems.

**Use AI to categorize, not to observe.** Export your notes into a spreadsheet or CSV, then ask an LLM to group them into 5–6 categories (axial codes). Refine the categories until they feel right. Then use the LLM to classify each note into a category. A pivot table instantly shows which problems dominate.

## Two Types of Evals

**Code-based evals (reference-based):** When there's a clear right answer — dates, specific data lookups, format compliance — write deterministic assertions. These are cheap, fast, and don't need LLM judges. Fix the bug, write the test, move on.

**LLM-as-judge evals (reference-free):** For subjective quality — conversational flow, appropriate handoffs, tone — prompt an LLM to judge traces against specific criteria. These are more expensive but provide the most value for iterating on hard problems.

**Not everything needs an eval.** If the fix is obvious (e.g., the model doesn't know today's date because you forgot to include it), just fix it. Evals earn their keep on problems you'll iterate against repeatedly.

## Building an LLM Judge

Write a judge prompt that specifies the exact criteria for pass/fail. For a human-handoff judge: list the specific failure modes (user requested transfer but was ignored, too many loops before handoff, etc.) and the conditions under which there is no failure.

**Always output binary (pass/fail).** Continuous scales (1–5) introduce enormous complexity. LLMs are poor at consistent numeric scoring, the results aren't actionable ("3.2 vs 3.7 — is that better?"), and they create false precision that erodes stakeholder trust. If you can't define a clear pass/fail threshold, you probably don't understand the problem well enough yet.

**Add explanations alongside the score.** Have the judge output a structured response with both an explanation field and a binary score. The explanation helps you debug the judge's reasoning when it disagrees with your labels.

## Measuring Judge Quality

The critical step most teams skip: validating that the judge actually works. You already have human labels from the trace review — use them as ground truth.

**Never use raw agreement.** If a failure occurs 10% of the time, a judge that always says "no failure" achieves 90% agreement. That looks great on a dashboard and is completely useless.

**Use true positive rate and true negative rate instead.** TPR: how often does the judge correctly identify real failures? TNR: how often does it correctly identify non-failures? A confusion matrix makes this concrete — you can see exactly where the judge is wrong and in which direction.

Whether the error rates are acceptable is a business decision, not a statistical one. False positives (flagging non-failures) are usually cheaper than false negatives (missing real failures). Look at the specific misclassified traces, iterate on the judge prompt, and re-measure.

**Hold out data when adding examples.** If you put few-shot examples in the judge prompt, don't test against those same examples — you'll get artificially perfect scores.

## Production Monitoring

Once a judge is validated, deploy it against production traces:

- **CI integration:** Run judges on test cases whenever you change code or prompts.
- **Sampling in production:** Score a random sample of live traces to monitor whether failure rates are trending up or down.
- **Debugging at scale:** Use judges to find all instances of a specific failure type across production data, then drill into those traces.

Keep the eval suite small — typically under a dozen judges. Each one has maintenance cost (periodic re-labeling, prompt updates as the product evolves). Code-based evals are cheaper to maintain than LLM judges.

## Synthetic Data for Pre-Launch

Before you have real users, generate synthetic test inputs by defining *dimensions* — the axes of variation that matter for your product. For a property management assistant: customer type (resident vs. manager), property class (luxury vs. standard), interaction type (maintenance vs. leasing). Generate the cross-product, then ask an LLM to create plausible queries for each combination. This explores the input space far more effectively than asking an LLM to "generate some test questions."

## Common Anti-Patterns

- **Generic metrics first:** Starting with helpfulness/toxicity/coherence dashboards instead of looking at actual traces. These generic scores rarely match the real problems in your application.
- **Skipping annotation:** Jumping straight to automated evals without manually reviewing traces. The annotation step is the single most valuable part of the process — even without building any judges, it produces actionable insights.
- **Continuous scoring:** Using 1–5 scales instead of binary pass/fail. Adds exponential complexity for marginal benefit. Teams must be "extremely disciplined" to use Likert scales correctly, and most aren't.
- **Reporting raw agreement:** Using agreement percentage instead of TPR/TNR. Misleading whenever failures are rare (which they usually are in a working system).
- **Over-investing pre-launch:** Building elaborate eval suites before you have real users. Dog-food the product, get a few friendly customers, and save the serious eval infrastructure for when you have enough data that manual review can't keep up.

## The Advanced Use for Generic Scores

Generic scores (hallucination, coherence, etc.) have one legitimate use: as a *sampling mechanism*. Sort your traces by a generic score, then manually review the highest-scoring ones to see if the score correlates with anything real. If it does, you've found a useful filter for prioritizing trace review. But never report generic scores directly to stakeholders.

## Sources

- AI Evaluations Clearly Explained in 50 Minutes (Real Example) | Hamel Husain (Peter Yang, video) — foundational source; end-to-end walkthrough of the trace-review-to-LLM-judge pipeline using Nurture Boss (AI property management assistant) as a real-world case study
