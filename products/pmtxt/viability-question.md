---
title: pmtxt — Viability Question
date: 2026-04-08
status: inquiry
audience: just me
---

# pmtxt — Viability Question

*A document for me, not for anyone else. The goal is honest clarity, not a finished argument.*

## The question

**Why would pmtxt exist as a standalone product instead of as a feature inside Notion, Linear, or another tool the PM already uses?**

That's the surface question. The deeper question underneath it:

**Would I be building this if YC hadn't put "Cursor for PMs" on their RFS two months ago?**

Honest answer: no. I wouldn't. I need to sit with what that means.

## Origin story (honest version)

Two months ago, I was already thinking about an AI-native spec generator. That idea existed. Then I came across YC's RFS and the very first item on the list was essentially my idea, or close enough that I read it as validation. The validation from an institution I respect landed on a thought I'd already had, and the combination created a narrative with multiple payoffs:

1. **The YC application angle.** I could apply to YC with a product YC explicitly asked for. The RFS is a signal that YC wants to fund this space. Building pmtxt is a way to turn a passing interest into a concrete application artifact.

2. **The portfolio piece angle.** A well-executed pmtxt would be something to show when I'm looking for my next role. "Former PM who built an AI-native PM tool" is a coherent story that could help with hiring.

3. **The former-PM-building-PM-tools narrative.** I used to be a PM. Building for PMs is a credible story about my background. It plays to an identity I already have.

All three of those motivations stacked together made pmtxt feel *right* in a way that was hard to separate from whether the product itself was right. That's not a bad reason to start building — a lot of good products start with some mix of external validation and personal narrative. The problem is that I never stopped to check whether those motivations were separable from the product's actual merit. This past week of exploration has been, in part, the process of unstacking them.

## This past week was exploration, not commitment

I want to be honest with myself about what I've actually done this past week, because the framing matters for what comes next.

I read the YC RFS carefully and thought about which parts I agreed with and which I didn't. I ran a G-Stack office-hours session with an adversarial cross-model challenge, and when the challenge landed on Premise 3, I revised it from "persistent context makes AI smarter" to "forced externalization of tacit knowledge is the real value." I drafted a v1 spec. I drafted a v0.1 product spec. I drafted a conversation spec. I ran a full five-question roleplay with a fictional PM (Sarah, first PM at a 12-person logistics SaaS called Relay) and honestly evaluated what pmtxt could produce from her answers. I went on a walk and noticed a bigger doubt (Notion as incumbent). I came back and articulated the origin story.

That's not "building the wrong thing." That's exploration working correctly. Exploration is supposed to surface the real doubts, and it has. The fact that the exploration is leading me toward harder questions isn't evidence that the past week was wasted — it's evidence that it was valuable. A worse version of me would have skipped the exploration, started building, and arrived at these same doubts three months from now with much more sunk cost.

So when I evaluate what to do next, I shouldn't frame it as "I already committed and now I'm losing faith." I should frame it as "I'm in the middle of an exploration and new information is coming in."

## What the roleplay told me

I ran all five interview questions with Sarah, playing pmtxt myself. The four-dimension honest evaluation at the end:

- **Could pmtxt populate the KB files usefully from Sarah's answers?** Yes. The interview produces real signal — named customers, named competitors, decision history, constraints, internal dynamics. A good KB is possible from five questions plus pushback.

- **Could pmtxt generate recommendations from the KB?** Yes. The LLM can produce recommendations that reference specific things Sarah said.

- **Could pmtxt generate coding-agent-ready prompts from those recommendations?** **No.** The prompts would claim to be grounded in Sarah's product context but they'd be pattern-matching to plausible-sounding structure, not actual knowledge of her codebase. Without access to the real product — repo, schema, components — the "coding-agent-ready" framing is aspirational, not deliverable.

- **Does pmtxt address Sarah's actual problem?** **No.** Sarah's nagging problem is strategic decision paralysis ("is this sales cycle shift a real pattern or am I overreacting?"), not feature selection. The output format the spec commits to (3 recommendations with agent prompts) doesn't match what she actually needs.

Two yeses and two nos, and the two nos are on the dimensions that matter most. The two yeses don't justify a standalone product — "populate a KB from a structured interview" is a prompting pattern any AI tool can copy. The two nos are where pmtxt was supposed to be differentiated, and the differentiation doesn't hold.

This is the actual answer to the viability question, and I arrived at it through experiment rather than speculation.

## The standalone-vs-feature question

The steelman case for pmtxt existing as a standalone:

Focus wins against feature bloat. Linear beat Jira, Superhuman beat Gmail, Cursor is beating VS Code on a specific axis. A focused startup can be 10x better at one specific thing. pmtxt could be to an incumbent what Linear was to Jira — same category, dramatically better experience for one specific workflow.

Where the steelman weakens:

The Linear playbook only works when the incumbent is hated. Jira is hated. Notion is not. Notion users mostly love Notion. Notion ships AI features fast and has a well-funded AI team. The Linear-vs-Jira precondition (beloved alternative to a hated incumbent) doesn't exist in the Notion case.

"Forced externalization of tacit knowledge through a structured interview" is a feature, not a product. It's a prompting pattern any AI-enabled tool can copy. Notion can ship a "run a product strategy interview" feature in a quarter if they choose to. The insight is good but it doesn't moat.

The YC RFS is a lagging signal, not a leading one. YC calling for a product means "this should exist," not "only a startup can build this." If Notion shipped this feature tomorrow, YC would still have been right that the product should exist — it would just exist inside Notion.

## Candidates for a real wedge

If pmtxt were going to exist as a standalone product, it would need a specific user for whom it's 10x better than Notion's best version of this feature, in a way Notion can't easily copy. Here are the candidates I thought through:

**Candidate 1: PMs who need coding-agent-ready prompts.** Real wedge, but requires access to actual codebase to be more than vibes. Without repo connection, the coding-agent prompts are just longer feature descriptions claiming to be grounded. With repo connection, we're competing with Cursor and Claude Code themselves.

**Candidate 2: Technical founders who live in the terminal.** Real audience, one I understand because I am one. Smaller market but sharper wedge. Sidesteps Notion entirely.

**Candidate 3: Solo founders and 2-3 person teams with no PM tool adoption.** Real but small, and these users are the worst at paying. Probably not a wedge.

**Candidate 4: A specific vertical (fintech, healthtech, compliance-heavy).** I don't have vertical expertise. Picking one would be forced.

**Candidate 5: No wedge.** pmtxt doesn't have a defensible position. The walk doubt was pointing at this.

**Candidate 6: GitHub-first technical founder tool.** A tool that integrates GitHub first — connects to a repo, scans the code structure, data entities, recent commits, README — and uses that as the foundation for producing the same PM-category documents (customers.md, competitors.md, decisions.md, etc.) that pmtxt's interview is trying to generate. The interview still exists, but it runs *on top of* the codebase context, not instead of it. The AI asks questions grounded in what it already saw in the repo: "I noticed you have a `certifications` model with `expiry_date` and `driver_id` fields. Is certification tracking the core of what your product does, or a side feature?" That's a fundamentally different quality of question than "describe your product." This directly addresses the gap the roleplay surfaced — the grounding problem — because the grounding is now in actual code rather than PM description. The audience is different too: technical founders and PM-engineer hybrids who already have a repo. Potentially a sharper wedge than any of Candidates 1-5, and aligned with who I actually am as a builder. Parked for now, but worth exploring separately.

## The honest read

Candidate 2 (terminal-native) and Candidate 6 (GitHub-first) are the only candidates I have real conviction about. They're related — both are for technical builders rather than traditional PMs, both sidestep Notion, both play to my actual strengths. Candidate 6 is the sharper version because the GitHub grounding directly solves the problem the roleplay surfaced.

Everything in the current pmtxt spec — the web app, the three screens, the dashboard, the onboarding flow, the happy hour demo at a PM meetup — is pointed at a user who is not me and whose context I don't have.

The office-hours subagent on April 6 said: *"your personal intelligence system is closer to how a modern PM-founder hybrid works than the ICE-scoring pipeline you described."* That was a hint I didn't take seriously enough at the time. The walk doubt and the roleplay are the same hint arriving louder and with evidence.

## Good pivot vs. bad pivot

There's a scenario where founders start building, learn more, pivot, adapt, and find PMF. Slack, Twitter, Instagram all work that way. I don't want to dismiss this scenario just because it's convenient.

But I also want to distinguish good-pivot from bad-pivot scenarios honestly:

**Good pivots have users.** Stewart Butterfield had engineers and users when he pivoted to Slack. Kevin Systrom had Burbn users telling him what they cared about. The pivot was triggered by data that could only come from shipping and watching real behavior.

**Bad pivots are pre-user spec revision.** No users, no ship, no customer discovery — just another round of internal speculation dressed up as "iterating." The "pivot" isn't a response to data; it's a deferral of the hard decision by telling yourself you'll figure it out later.

My current state is closer to bad-pivot territory. I don't have users. I don't have a shipped v0.1. Building pmtxt for two more weeks to "see what happens" would be burning time on a shape the roleplay already told me doesn't work.

## What I actually want to do

The plan:

1. **pmtxt is parked.** No more spec iteration. No more conversation spec filling in. No more prompt session work. The current v1-spec.md, v0.1-spec.md, and v0.1-conversation-spec.md stay in the vault as a record of what I explored, and this viability doc sits alongside them as the record of why I stopped.

2. **Explore the GitHub-first technical founder tool (Candidate 6) separately.** Not as a pivot from pmtxt, but as a new inquiry with its own shape. The fact that my mind is already going there is signal worth following. Separate exploration, separate notes, separate artifacts. It might become a real thing or it might not.

3. **The PM happy hour on April 21 is no longer a pmtxt deadline.** I might go, I don't really want to, I might go just for the heck of it. If I do go, it's not for pmtxt — it's because I'm curious about where PMs are now and what's changed. The project stays parked regardless of whether I go. Discovery work is fine if it happens naturally, but I'm not forcing it. The goal is to let the space be interesting to me without it being load-bearing for a product I'm trying to keep alive.

4. **Revisit this doc only if something changes.** Not on a schedule. If I find myself thinking about pmtxt again with real pull, open this doc first and re-read it before doing anything. The doc exists so future-me doesn't accidentally restart the project without remembering why I stopped.

## What "parked" actually means

I want to be specific about this because "parked" is a word that can mean anything from "I'll pick this up tomorrow" to "this is dead and I'm lying to myself about it."

For pmtxt specifically, parked means:

- **No active work.** I'm not going to fill in the conversation spec, draft interview questions, build any UI, run prompt engineering sessions, or do any work that assumes pmtxt is going to ship. Every hour spent on pmtxt from here is an hour taken from something that might actually matter.
- **The artifacts stay in the vault.** The v1 spec, v0.1 spec, conversation spec, wireframe, prompt session doc, and this viability doc all stay where they are. They're a record of the exploration, not trash to throw away. If future-me ever wants to reference what was considered, it's there.
- **The project isn't formally dead.** I'm not announcing anything, not deleting anything, not archiving the GitHub repo. I'm just not working on it. If a month from now I have a conversation that changes my mind and I want to pick it back up, I can. But the burden of proof shifts: resuming work requires new information, not just renewed enthusiasm.
- **The YC angle is released.** If I apply to YC in the future, it'll be with something I can't stop thinking about, not something I built because they asked for it. That's a better application anyway.
- **The portfolio-piece angle is released.** My actual portfolio is dotmd, NanoClaw, this vault, the stack article, the Readwise wiki. Those are things I built because I wanted them, which is why they're good. pmtxt built as a portfolio piece would have been worse than no portfolio piece at all.
- **The former-PM-narrative is released.** I'm a builder now, not a PM who used to build things. The narrative that said "build for PMs because you used to be one" was pointing at the past. The present-tense version of me is someone who builds tools for builders, including himself.

Parked is not a half-measure. It's the decision to stop, with the door left slightly open because I don't want to melodramatically declare things dead when the honest state is "I don't want to work on this and I don't think I should."

## Open questions to sit with

- Which of the three stacked motivations (YC application, portfolio piece, former-PM narrative) hurts most to lose? That answer tells me which one was actually load-bearing for my identity, and whether the pain is about the product or about the story.
- If I imagine myself six months from now having parked pmtxt and built something else instead, do I feel relief or regret? (Right now, sitting with this: relief.)
- If I imagine myself six months from now having shipped pmtxt as currently specced and getting five users who politely say "this is interesting," do I feel proud or flat? (Right now: flat.)
- Is the GitHub-first tool actually a different product, or am I trying to build a version that's easier for me because I don't have to talk to PMs I don't know? (Worth watching for this failure mode.)
- The deepest one: did I start building pmtxt because I wanted to build it, or because YC validated a space I thought I should be in? I already know the answer. The question is what I do with that knowledge. The answer to that, now, is: park it and move on.
