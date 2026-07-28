# Control Surface Brainstorm — Bounded Choices, Preferences, Visible Coverage

**Date:** 2026-07-27
**Status:** Brainstorm — no decisions, no build commitments. Captured same-day from a post-test-session conversation (first day of live session-aware opening testing, branch unmerged).
**Context:** Raw feedback jotted after a steered study session that "seemed pretty good." Adjacent conversation: the differentiation question — the product's edge (claim map, coverage state, per-doc memory) is real but *invisible* in a demo. These ideas are, in different ways, about making that state visible and steerable.

## The synthesis

The notes are three ideas with one connecting thread: **giving the student a control surface for state that currently exists but is invisible and implicit.** The tutor holds a claim map, coverage state, and a sense of pacing. Each idea below is a different way to let the user see and steer that state.

Cluster 3 (visible coverage) is the direct continuation of the legibility gap: the coverage UI is the artifact a generic voice assistant cannot produce, made visible. Differentiation that only the builder can see doesn't convert.

## Idea 1 — Bounded choices instead of open questions

**Raw idea:** Replace open-ended tutor questions ("does that land, or want to dive deeper?") with standardized two-option offers: "I could give you a brief summary of that, or we can continue to the next topic."

**Feedback:**
- Strong, and voice-native. Open questions in voice create a cognitive stall — the user must invent an answer with no visual menu. Two concrete options fit spoken working memory and keep momentum.
- Refinement: standardize the **shape**, not the content. The shape is "two doors, both forward"; the specific doors should come from the claim map. The map is already the menu — this is the menu surfacing as dialogue.
- Note: every binary the tutor offers is implicitly steering. Which two doors it presents *is* the steering mechanism, wearing a friendlier face.
- Lineage: the session-aware opening's decline path ("offer 2–3 alternatives drawn from the claim map, not an open question") is the same principle already shipped at the session's first turn. This idea extends it to mid-session.

## Idea 2 — Where preferences live: toggles vs. learned memory

**Raw idea:** Should the app have UI toggles for experience configuration (brevity/depth of coverage)? Could "recite it back to me" be a mode? Or skip toggles and let the agent learn how the user likes to learn over time via memory?

**Feedback — a third option the notes skipped: in-conversation control, first.**
- "Keep it brief," "quiz me on that," "go deeper" — spoken, instant, zero UI. Voice is uniquely good at this; a settings panel is a screen-app reflex.
- Memory's job then becomes noticing repeated corrections and promoting them to defaults ("you usually want brief — starting there"). Learned defaults, spoken overrides.
- Toggles earn a place only for things awkward to say aloud or that users want set **before** the session starts.
- The recite-back idea may be the genuine exception: it reads as a deliberate mode you *enter* ("drill me") rather than a preference you *set* — a verb, not a toggle. Possible future front door for the elicitation shapes parked in the v1 prompt draft (application / prediction / contrast / flipped-role).

## Idea 3 — Making coverage visible: spoken milestones + progress UI

**Raw idea:** (a) Tutor proactively announces coverage milestones ("we've covered X% of the material"). (b) UI visualization of progress: progress bar, highlight which claims/topics are covered vs. not, possibly streaming transcript of both sides.

**Feedback — split the two; they pull opposite directions:**
- **UI half: unambiguously right, strategically important.** Progress bar + covered/uncovered claim highlighting is the legibility artifact — the thing a skeptical user can see that ChatGPT voice cannot produce. Glanceable without interrupting the conversation.
- **Spoken milestones: caution.** "We've covered 60%" is the syllabus voice — the exact failure the first steered-session test was checking against. A knowledgeable friend doesn't announce percentages; they say "you've got most of the core now — the main thing we haven't touched is X." Same information, in-frame.
- **Rule of thumb: numbers on the screen, narrative in the voice.**
- Transcript streaming is standard voice-app furniture — fine, but undifferentiated. If build order forces a choice: coverage visualization before transcript.

## Connections to existing threads

- **Legibility/differentiation:** coverage UI is the demo-visible artifact; see the 2026-07-27 differentiation discussion (edge is the claim engine + state, not the voice conversation; risk is being "differentiated in a way only the builder can see").
- **Steering-first framing** (ideas.md, 2026-07-23): bounded choices and door-selection are steering; the coverage UI is coverage-as-progress-metric made literal.
- **Scoring's future front door:** claim highlighting in the UI is a step toward coverage display without building the strict judge — visible coverage may generate the evidence that decides whether/when scoring is needed.
- **Session-aware opening (shipped to branch 2026-07-27):** the decline-path menu is Idea 1's principle at turn one.

## Open questions (parked, no answers owed yet)

- Does in-conversation control need any prompt support to work reliably, or does the model already honor "keep it brief" for a whole session?
- What's the smallest coverage UI worth shipping — a bare percentage? A claim list with checkmarks? Does it live on the study page during the session or in the ended/recap view first?
- If drill-me becomes a mode/verb, does it reuse the claim map as its question source (it should), and does that make it the first consumer of per-claim coverage state?
- Milestone narration: should the *prompt* explicitly ban percentages in speech, or is that over-specification before it's observed?
