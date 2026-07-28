# Validation Gate + Pre-Share Build — Design Conversation Capture

**Date:** 2026-07-27
**Status:** Decisions + open questions from a planning conversation. Not yet a spec — this is the input doc for the specs that follow. Gate numbers are draft pending Matt's reaction (flagged below).
**Context:** Same-day continuation of the roadmap discussion. Prior context: session-aware opening shipped to branch (unmerged, minors applied, live-tested "pretty good"); differentiation discussion (the edge — claim map, coverage state, per-doc memory — is real but invisible in a demo); control-surface brainstorm ([2026-07-27-control-surface-brainstorm](2026-07-27-control-surface-brainstorm.md)).

---

## 1. Strategy calls made

**Roadmap direction: derive backwards from the gate, not forwards from ideas.md.** The inbox is a list of what interests Matt; a roadmap built from it is a build-what's-fun list with dates. Instead: define the minimum for one stranger to have a real session and report back — let that select from the inbox. Most inbox items (bounded choices, drill-me mode, comprehension levels) are post-first-user. That most don't make the cut is the roadmap working.

**V1 is an event, not a feature list:** one person who isn't Matt completes a session on their own document and comes back for a second one. Work backwards from that event; scope defines itself. (Same pattern as the briefing validation gate.)

**Dev-harness goal-authoring work: declined.** Most procrastination-shaped item on the list — building a tool to help plan instead of planning. The working pipeline (brainstorm conversationally → distill → hand off) produced session-aware opening in one day, spec through ship. The goal-intake interview item stays backlogged behind its unfired trigger.

**Self-testing: continue, but only for what it can still answer.** Prompt tuning by ear — yes. Whether differentiation lands for someone who didn't build it, whether the opener reads as knowledgeable-friend to a stranger, whether anyone else wants this — self-testing structurally cannot answer these anymore. Feedback from strangers is the priority, per Matt's own stated belief.

**Progress bar: build before sharing — passes the gate test on the merits.** Normally pre-share polish is stalling; this one is the artifact that gives a stranger a reason to return (the gate event). Without it, everything differentiating the product from generic voice chat is invisible. Ending a session at "14 of 22 claims, here's what you haven't touched" creates the unfinished-business pull that produces session two. Cheap: coverage state exists, claim map is per-doc, **ended-view is the first home** (no live-updating — that needs the deferred mark_claim machinery). Rule: bar and claim list on screen, not in the tutor's mouth — *numbers on the screen, narrative in the voice.*

**Packaged content (shipping Matt's wiki as an AI content tutor): declined — bigger fork than it looks.** The wedge (steering brainstorm, verbatim) is *"the consumption layer for docs never meant to be read — MY wiki → ME is the gap."* Shipping Matt's wiki to users deletes the wedge: it becomes a content product competing with podcasts/courses, for users with no relationship to the material, walking away from the sharpest audience insight (PKM people are findable *because* they already have documents). The bleed tell from the reading-mode resolution applies: it makes *acquisition* easier by changing what the product is. Legitimate reconsideration point: if the your-docs wedge fails with real users — a pivot with evidence, not a drift now.

**The contained version of that idea: demo docs.** One or two wiki pages included as sample content — "try it on this first, then upload your own." First session frictionless; second session on their doc, which is the gate event anyway. Sample content, not packaged content.

---

## 2. The validation gate (draft — numbers are judgment calls, react to them)

**Gate statement:** Within **4 weeks** of sharing, at least **1 of 3** recruited testers completes a real session on **their own document** and voluntarily starts a **second session** without prompting.

**Reasoning per component:**
- **3 testers:** one is an anecdote (a flake tells you nothing); ten is a recruiting project that delays start by a month. Three PKM/Readwise people is a week of DMs from the hypothesized audience, flake-tolerant, honest bar.
- **"Their own document" is load-bearing:** demo-doc sessions are onboarding, not validation — they test the mechanism, not the wedge. Only their doc tests "your knowledge base, returned to you." Demo doc = warm-up, explicitly not the gate event.
- **"Voluntarily returns" is the success signal, not "says it's cool":** everyone says it's cool. Ban politeness the way the briefing gate banned engagement data. A second session is a behavior, not an opinion — and it's precisely what the coverage bar exists to cause.
- **"Without prompting" carve-out:** asking "did you try it again?" is fine. Scheduling session two or sitting with them isn't. Distinction: did the pull come from the product or the relationship.
- **4 weeks:** session two needs organic time; longer and the experiment loses its edge.

**Outcomes decided in advance:**
- **Pass** → wedge has a pulse. Roadmap question becomes "what did the returner ask for" — outranks everything in ideas.md.
- **Fail on return** (sessions happen, nobody comes back) → mechanism works, doesn't pull. Interrogate the coverage/recap loop before adding features. This is the evidence-arrival point for reconsidering packaged content.
- **Fail on first session** (can't get 3 people to try their own doc) → acquisition/wedge problem, not product problem. Fix pitch or audience before writing more code.

**Scope decision (leaning yes, Matt to confirm): self-serve upload.** "Their own document" means they upload it unassisted. Self-serve is part of the wedge (hand-holding can't scale past 3; upload friction is real data). Consequence: upload must be stranger-proof, **including the pre-warm gotcha** — claims only extract when a doc is clicked in the picker, invisible to Matt, fatal to a stranger. Fixing that is on the pre-share list.

---

> **Spec (2026-07-28):** sections 3 + 4 are transcribed and made buildable in
> [[2026-07-28-identity-and-isolation-spec]] (surface inventory, `session-log.jsonl`
> `user_id` schema + backfill, profile/memory migration, cookie + voice-session
> identity plumbing). Pre-plan, awaiting review.

## 3. Identity: link + cookie, not accounts

**Unbundle "account":** identity (which rows/files are whose), access control (strangers out), authentication (passwords/resets/email). For 3 recruited testers: need the first, sort of the second, not the third. Building login for 3 friendly testers is infrastructure ahead of evidence — real auth's trigger is a tester Matt *didn't* personally recruit, or genuinely sensitive content.

**Mechanism:** each tester gets a tokened link (`/study/?u=k7f2x9` — unguessable token, not a name). First visit sets a **long-lived cookie** (a year, not session); identity is read from the cookie thereafter. The link is the key, the cookie is the memory — the tokened link needs using once per browser.

**Why identity became necessary today:** session continuity keys on `document_id` — without a user filter, tester B studying a shared doc gets *Matt's* "where you left off." Same class of lying-opener bug as the walk-back problem, arriving via multi-tenancy instead of async timing.

**Read order (implementation note for the CC session):** cookie first, URL param second, otherwise the paste-your-code gate; when the URL param is present, refresh the cookie. Links always safe to re-click; a re-sent link self-heals a lost cookie with no special recovery path.

**Failure modes + answers:**
- New device / cleared cookies → bare URL with no cookie shows a dead-simple gate: "Enter your invite link or code." Recovery = Matt re-sends the same link. That's the entire account-recovery system for 3 people over 4 weeks.
- **Anti-pattern, do not build: a name-picker on the bare URL.** Converts a lost cookie into an identity mix-up — wrong tap and Sarah's sessions write into Dev's memory, her tutor greets her with someone else's history. Wrong identity is much worse than a re-paste moment, because memory/profile/recaps/opening all compound on identity being right. **Fail closed (ask for the token), never fail guessy.**
- Matt himself: mint a token, visit it once per browser — tester zero for the flow.

**Data-layer rule, day one:** `user_id` is **required in the data layer** (ledger rows, file paths) even while id-*issuing* stays casual. Retrofitting identity into unkeyed data is the painful part; issuing it politely later (real accounts) is trivial if the keys exist. Existing rows backfill as `user_id: "matt"` once.

---

## 4. Isolation: structural withholding, not discipline

**Identity ≠ isolation.** The cookie establishes who someone is; it does nothing to stop the app showing them everyone's stuff. "Unprofessional" lives in the second property.

**Current leak surfaces (each is a leak until filtered by user):**
- Document picker (`list_documents`) — one shared dir; a tester's first screen shows Matt's wiki pages and other testers' uploads.
- Sessions history (`GET /api/sessions`) — built "shared-pool / no-auth / cost-visible for this validation build"; right call at one user, at three it's everyone reading everyone's study history *and Matt's costs*.
- Recap browser — same pool, with content: recaps contain what someone said about their own documents.
- `previous_session_recap` — without a `user_id` filter, cross-user "where you left off" on shared docs. Wrong experience delivered confidently.
- `memory.md` / `profile.md` — shared singletons mean the tutor knows things about Sarah that Dev told it. → namespace as `profiles/<user_id>.md`, `memory/<user_id>.md` (the migration earlier discipline kept cheap: nothing else joins them).

**Design principle (Matt already owns this pattern):** enforce isolation the way evaluator blindness is enforced — **by structural withholding, not discipline.** Wrong version: remember an `if user_id matches` in every endpoint (the prompt-only-fix pattern; fails the first time a new feature forgets). Right version: every data-access helper (`list_documents`, sessions query, artifacts lookup, recap scan) takes `user_id` as a **required argument** and reads only within that user's namespace. No caller can ask for "all sessions" because no signature offers it. Same move as `scope?: never` on the blind grader — the leak becomes an API-shape impossibility, not a code-review catch.

**Demo docs: the deliberate exception, split correctly.** The *document* is shared (in everyone's picker); all *state about it* — sessions, recaps, coverage, "where you left off" — is per-user. Sharing content is fine; sharing experience is the leak. The `user_id + document_id` compound key handles this for free.

**Test shape: mirror-image cross-user tests.** For each surface, a hermetic test that user B sees *nothing* of user A's: B's picker lacks A's docs; B's sessions list is empty after A's sessions; B's recap scan on a doc A studied returns `None`. Cheap against existing fixtures; turns "professional" into a regression guard that catches the *next* feature's forgotten filter — the failure that actually happens.

---

## 5. The pre-share build list (full shape, ~a week)

1. **Identity threading** — token link + long-lived cookie; `user_id` required in ledger rows and file paths; backfill `"matt"`; paste-your-code gate for cookieless visits. (Biggest single item, mechanical.)
2. **Isolation** — user-scoped required-argument access helpers across picker / sessions / recaps / recap-scan; namespace `profile.md` + `memory.md` per user; namespaced uploads; mirror-image cross-user tests. (Same CC session as #1 — same edit touched twice.)
3. **Stranger-proof upload** — self-serve upload path including the pre-warm fix (claims must extract without knowing to click the doc in the picker).
4. **Coverage bar** — ended-view first; bar + covered/uncovered claim list; numbers on screen, narrative in voice.
5. **Demo docs** — 1–2 wiki pages as sample content; shared document, per-user state.

**Then:** recruit 3 from the PKM/Readwise audience; run the 4-week gate; keep self-testing in parallel for prompt tuning only.

---

## 6. Open questions

- Gate numbers: 3 testers / 1 returner / 4 weeks — Matt to accept or move deliberately.
- Self-serve upload as a hard gate requirement — leaning yes, unconfirmed.
- Sequencing within the week: identity+isolation first (unblocks everything) vs. coverage bar first (testable solo immediately)?
- Does the coverage bar's ended-view placement need any claim-coverage signal that doesn't exist yet, or does the recap's "what we covered" section suffice for v0? (If the latter, the bar may be cheaper than assumed; if it needs per-claim state, it brushes against the deferred mark_claim machinery — check before speccing.)
- Where do tester-facing docs live (a one-page "how to use this" for the 3 recruits)?
