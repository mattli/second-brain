# Study session — Voice Tutor — Grounded Assessment
Duration: 28:30

## What we covered
- Cost reconciliation via voice provider APIs and what you learned from that work
- The three architectural pieces of grounded assessment: claim extraction, conversation steering, and scoring
- Whether to ship the voice conversation first and add scoring later, or whether scoring is load-bearing for the product
- Claim extraction: upfront vs. live vs. hybrid approaches
- How the tutor should steer toward uncovered topics without making the session feel like a quiz
- Whether to build claim extraction before testing core adoption

## Key points

### The core bet: is scoring load-bearing?

You kept circling back to whether grounded assessment—the claim-level scoring—is the product or just a feature. You eventually landed that the scoring *is* the product because it's what gives you a deterministic, measurable outcome. A conversation alone could feel like "learning," but the checklist against the source is what actually tells you whether you covered the material. That feedback loop is what differentiates this from just using ChatGPT voice mode with a doc in context. Without it, you're testing whether people like voice chat, not whether they want to know if they actually understand something.

### Claim extraction: simpler is better, for now

You explored three approaches: extract all claims upfront, extract live during conversation, and a hybrid (high-level upfront, details live). You settled on upfront extraction because it's simple—kick it off as a background task when the doc loads, cache the result, done. It costs only a few cents per document at batch rates. The hybrid approach sounded clever but adds complexity you don't need yet. The risk of live extraction is that the tutor flies blind, not knowing what gaps exist. You can always add sophistication later if startup time becomes a real problem.

### Steering without quizzing

The tension you kept hitting: how do you guide the user toward uncovered claims without turning it into a quiz? You don't want the tutor saying "now articulate claim three." You want the checklist tracking claims internally, but the conversation staying natural. You also realized you can't ask someone to articulate something they haven't heard yet—so the pattern has to be: tutor explains an uncovered claim first, *then* later asks the user to articulate it back. The exact phrasing ("explain that back to me" vs. "how does this work") matters less than the timing. This is something you'll have to feel out in practice by running sessions and tweaking the system prompt.

### Middle path: claims without scoring

Partway through, you questioned whether you even need formal claim extraction if you just tighten the system prompt to steer back to the document. The tutor could stay grounded without an explicit claims list. But then you realized: without a claims list, the tutor has no map, and it becomes just ChatGPT voice mode with a doc nearby. Claims give the tutor structure to steer by. So the middle ground emerged: extract and use claims to guide the conversation, but skip the scoring layer for now. Test whether the steering itself is valuable before building the evaluation machinery.

### Proxy metrics as an alternative

You also floated whether simpler signals—time spent, number of turns, relevance of questions—could proxy for learning instead of claim-level scoring. These are easier to implement but fuzzier. They tell you engagement, not understanding. The conversation is ambiguous: someone could talk for 30 minutes and still miss the argument. Proxies might be enough to validate initial adoption, but they don't deliver on the core promise of "know whether you actually understand it."

## Open threads

- How to operationalize "steering toward uncovered claims" in the system prompt without making it feel like a quiz—what tone and prompt shapes actually work in practice
- Whether claims-based steering alone (without the scoring layer) is enough to make the product differentiated, or whether you need the claim-level coverage/correctness evaluation to have a real moat
- When to add back the scoring piece: after one person validates they'll use it twice, or earlier if claims extraction becomes necessary for good steering
