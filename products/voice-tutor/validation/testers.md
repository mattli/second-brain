# Testers

Running record of who has a link, what they did with it, and whether they came back.

**The gate** (from [2026-07-27-validation-gate-and-preshare-build](../planning/2026-07-27-validation-gate-and-preshare-build.md)): one recruited tester completes a session on their own document and voluntarily returns for a second.

**Status: 0 / 1.** No tester has yet run a full session on their own document and returned.

---

## John Moore — Agora (Key Accounts / BD)

Met at a meetup. Voice-infra professional, not the PKM profile — his read validates the voice layer, not the tutoring thesis.

| | |
|---|---|
| Asked | Tue 2026-07-28, 10:12pm (LinkedIn) |
| Said yes | Wed 2026-07-29, 12:18pm |
| Link sent | Thu 2026-07-30 |
| Sessions | 1 completed (+ 4 failed attempts) |
| Returned? | Not yet |

- **Thu 7/30 morning — 4 failed attempts, 10:28–12:06.** Zero audio, zero turns. Cause was the remote-session WebRTC bug (candidates never delivered over Funnel). His failures are what surfaced it. Nothing to analyze — no content exists.
- **Thu 7/30, 5:21pm — session `a3cca4a3`, 103s, 3 turns.** Used **his own document**: a Danish healthcare-chatbot trust study (~39k respondents, diabetes focus). His only input the whole session: *"Can you give me a different overview?"* The tutor reframed around the four scenarios; he pursued neither follow-up and disconnected. Analysis calls it "stalled or cut short rather than reaching a natural stopping point."
- **Fri 7/31, 10:30am — call.** Good conversation. Surprised the connection felt smooth. Talked distribution and revenue models; noted **usage caps produce bad user feedback when people hit the max**. Raised one-to-one hybrid vs. one-to-many formats. Pitched Agora lightly (offered promotion help). Shared a book and invited Matt to an event he's hosting. Closed with "try it again, no pressure."
- **Read:** relationship is real and warming — peer register, not just vendor. But zero thesis signal: he has not studied a document end to end, and a BD person's natural mode is talking *about* the product rather than using it.

## Jorge — biotech

Met at the same meetup. Closer to the ICP than John — plausibly has a pile of papers he's meant to absorb.

| | |
|---|---|
| Asked | Thu 2026-07-30 |
| Said yes | Yes |
| Link sent | Fri 2026-07-31 |
| Sessions | 0 |
| Returned? | — |

- Token was exposed in a chat log on send; rotated same day, corrected link to follow.
- Matt replied to Jorge Fri 7/31; deliberately giving him space — no nudge planned for now.

## Meetup 2026-08-11 — five contacts, links not yet sent

Three hours, a lot of socializing, socially anxious throughout. Matt's read on his
own performance: talked anxiously and self-deprecatingly at times. Worth recording
that the outputs — five contacts, several open to trying it — do not match that
self-assessment.

**The ask used:** *"Do you have any documents you're trying to study?"* → *"Would
you be willing? Can I send you a link to try it sometime this week?"* Matt did
**not** ask what they'd study — judged (reasonably) as a strange question to put
to a stranger at a networking event. That question moves to the follow-up message.

**Status: LinkedIn connections in progress, some not yet formalized. No links sent.**
Plan is to send on the weekend (Sat 2026-08-15), which also allows time to mint
per-person tokens and swap in a more broadly appealing sample document.

| Name | Who they are | Notes |
|---|---|---|
| **Chelsea Eiling** | Product designer, early career | Kind. |
| **Mike Lindle** | Ex-Deloitte → ad producer → vibe coder | |
| **Abhiraj Parikh** | Data scientist — predictive coffee bean quality | |
| **Lucy Zhang** | — | Hard to understand in conversation; may need written follow-up to do the work. |
| **Ethan Sokol** | Senior at NYU; Harvard-Westlake | Wants to share a private LinkedIn product with Matt — he has an ask too, which is a reason to expect a reply. |

Notes recorded 2026-08-12, the day after, from memory. What each person said about
their own study material was **not captured** — the ask didn't include it.

### What to do with these

The follow-up message has to do the qualifying work the room didn't. Draft shape:

> Good to meet you last night. You mentioned you'd be up for trying the study
> tool — do you have a document you're actually trying to get into your head
> right now? Happy to send you a link.

Lead with their own document; keep the sample as the fallback, not the headline.
Ask **nothing else** up front — every question is a tax on opening the link at all.

**Afterwards, one open question only:** *"How'd it go? Anything weird or confusing?"*
Not "what did you think" — that gets politeness. A story is where the signal is.

**Do not ask "would you use it again."** Asking corrupts the answer. The two things
worth learning are observable, not askable:

1. **Did they upload their own document or use a sample?** Own document = they had
   real material and this was the tool for it.
2. **Did they come back unprompted?** That is the gate.

### A framing tension worth holding

Matt's own description of what he wants from these: *does it solve a problem for
them, could they foresee it solving one, is there a version that would.* That is
**problem discovery**, which sits earlier than the stated validation gate. Both are
legitimate; they need different things. Discovery can happen without anyone opening
the app. The gate needs a solo session on their own material. Aiming at both in one
message tends to produce a polite "yeah, I could see that being useful" and no
session.

## Channels

### Reddit — r/PKMS (cold)

- **Mon 2026-08-03, ~11am — posted.** Title: "How do you actually make use of your knowledge base?" Problem-first discovery post, no product link, no pitch — Matt's own arc (Readwise → Karpathy-style LLM wiki → "one thing to hoard information, another to actually learn from it and apply it"). Speech-to-speech Q&A mentioned once, unlabeled, as a tripwire for interested readers.
- **Purpose:** discovery + standing for later DMs; testers are a byproduct. Watch for anyone describing the learn/apply gap in their own words — those are DM candidates.
- **Results (read same day, ~7h in — 2.7K views, 12 comments, 0 net score):**
  - **The problem was conceded by everyone; the method was attacked by everyone.** Not one commenter disputed that capture-without-retention is real. Every pushback targeted the pipeline: curate harder upstream, save less, tag better. When a room rejects the solution but concedes the problem, the problem is validating.
  - **Zero pain signals, zero "me too," zero DMs, no bite on the speech-to-speech tripwire.** PKM hobbyists experience the gap as mild guilt solved by more system — not as pain that drives workarounds. Contrast the April student findings (people jury-rigging ChatGPT voice calls for Feynman technique): **deadline people build workarounds; workaround-builders are buyers.** The likely lesson is wrong *segment*, not just wrong subreddit — system-lovers vs. outcome-needers.
  - **The objection map** (in their own words, useful for positioning and the meetup): (1) "curate upstream, volume is the wrong focus” — 1–2 quality pieces/day (trivetgods); (2) "without ground truth there's no conversation" — the epistemology objection to LLM-synthesized wikis (micseydel); (3) "tag/group it and apply learning techniques" — the more-system answer (YouWillConcur, Early_Key_823).
  - **One lead to chase:** Justin Sung's learning techniques (named by a commenter) — learning-science practitioner, squarely Voice Tutor's intellectual territory.
  - **Channel cost, now measured:** one cold post ≈ one full emotional day for moderate signal. Anonymous scored channels charge Matt a real personal tax; warm channels (meetup produced John + Jorge, book, event invite) outperform on both signal and cost. **Meetup 8/11 confirmed as the primary channel.**
  - **r/Zettelkasten reconsidered and skipped:** closer to the retention problem philosophically, but its core dogma is manual processing-as-learning — an LLM-written wiki automates away their sacred step. Would get a smarter version of the same objection.
  - **Next cold move, if any: student/deadline spaces, not PKM spaces** — pending the meetup's evidence on which framing (vault-substrate vs. deadline-pain) lands. No cross-posting this week.
- **Remaining thread obligation:** two optional warm thank-yous (YouWillConcur, Early_Key_823). Everything else is closed — no further replies.

### Meetup — 2026-08-11 (warm) — RAN

Produced five contacts (above). Confirms the doctrine: warm rooms are the only
channel that has produced testers. Ran three hours; the tagline
*"No decks. No quizzes. No flashcards. Just a conversation."* went out to live
humans for the first time — no recorded read on how it landed.

## Leads (not yet testers)

- **RecentPhilosopher851** (Reddit, r/indiehackers) — asked the sharpest question yet: how is this different from NotebookLM's interactive mode. Year-old account, thin history, possibly a shell. Answered publicly 7/31; the reply doubles as findable positioning. Offer a link if they respond like a human.
- **PKM subreddits** — participation not started. Planned: a problem-first post (capture outran retention) in r/PKMS or r/ObsidianMD, no product link, DMs only after genuine thread participation.

---

## What the record says so far

- Two people have a link. One has used it, briefly, on a real document of his own.
- Five more agreed to try it and are awaiting links.
- Every session to date has been shorter than 2 minutes. Nobody has worked through a document.
- The differentiation question — does claim-map steering help someone retain their reading pile — remains **structurally unanswered**. It is not answerable by building; only a tester answers it.
