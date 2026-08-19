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

## Meetup 2026-08-11 — five contacts

Three hours, a lot of socializing, socially anxious throughout. Matt's read on his
own performance: talked anxiously and self-deprecatingly at times. Worth recording
that the outputs — five contacts, several open to trying it — do not match that
self-assessment.

**The ask used:** *"Do you have any documents you're trying to study?"* → *"Would
you be willing? Can I send you a link to try it sometime this week?"* Matt did
**not** ask what they'd study — judged (reasonably) as a strange question to put
to a stranger at a networking event. That question moves to the follow-up message.

**Status: links sent Sat 2026-08-15.** All five, LinkedIn DM, same message with the name swapped.
Per-person tokens minted the same afternoon; `matt`'s token rotated at the same time (and with it a
weak 9-character alias that had been a second live credential).

**What the message said.** Body: what it is (talk through a document, it tracks which claims you've
covered), upload your own or use the sample, and a heads-up that the recap takes a few seconds to
appear so don't close the tab. Then a plain disclosure block — runs off a Mac Mini in his apartment
(hence the odd link), uploads and transcripts are stored there and he can read them, voice passes
through third-party speech and AI services, and the link is effectively a password so don't forward
it. Closed with *"let me know how it goes or if you run into any trouble."*

That closer was a deliberate choice over *"does this solve a real or imagined problem for you"* —
the latter is answerable **without opening the link**, which is exactly the polite non-signal to
avoid. "How did it go" requires use, and "or if you run into any trouble" gives an easy way to
report a dead link rather than silently giving up. That silent-giving-up is what cost the John
session in July.

Ethan's was the only one meaningfully different: it opened by asking to see **his** LinkedIn
product, since he'd offered. He has an ask of his own, which makes him the most likely to reply.

**What to watch for, per the gate:** whether they upload their own document or use the sample, and
whether anyone returns unprompted. Do **not** ask "would you use it again" — asking corrupts the
answer.

| Name | Who they are | Notes |
|---|---|---|
| **Chelsea Eiling** | Product designer, early career | Kind. Said she'd try it "this week" (w/o 08-17). |
| **Mike Lindle** | Ex-Deloitte → ad producer → vibe coder | |
| **Abhiraj Parikh** | Data scientist — predictive coffee bean quality | |
| **Lucy Zhang** | — | Sent same as the others; see caveat below on note reliability. |
| **Ethan Sokol** | Senior at NYU; Harvard-Westlake | Wanted to share a private LinkedIn product — his message led with that. Matt signed up for it ~08-15 and pitched Voice Tutor in the same exchange; Ethan owes the reply. When he responds, the ask: anyone in his program this would help. |

Notes recorded 2026-08-12, the day after, from memory, and **per-person accuracy is
unverified** — the "hard to understand" and investing details attached to Lucy may
belong to a different conversation from that night. Names and the agreed-to-try
list are solid; personal details are best-effort. What each person said about their
own study material was **not captured** — the ask in the room didn't include it,
which was the right call for a networking setting.

**What happened after the send (from the server log, checked 08-17 and 08-19):**
four of the five links were opened in real browsers (chelsea, ethan, mike, abhiraj
— lucy's link was also loaded, though one public IP opened three different links,
so the person-count is uncertain). **Zero connect attempts, zero uploads, zero
sessions from any of them.** The one "lucy" session on 08-15 (10.7s, no speech)
was Matt's own incognito link-check from his MacBook. Everyone who reached the app
stopped at the first screen.

**What they're getting:** production on `main` (`:7860`), not the live-coverage branch. Coverage
appears on the picker, the pre-connect screen and after the session ends — but **no live meter
during the conversation**. Shipped the same afternoon: TTS speed dropped to 0.9 (the tutor had been
talking too fast), and the ended-view coverage layout unified so the inline bar shows without a
manual refresh.

### What to do with these

The qualifying question (what document would you bring) was carried by the 08-15
message itself — "upload whatever you're actually trying to learn." Nobody has
answered it with behavior yet.

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

### Reddit DMs — targeted, profile-verified (2026-08-18 → 08-19)

Six cold DMs sent across two days, every recipient profile-checked before sending.
The check earned its keep: **five candidate reads were reversed by it** — connerpro
(advice-giver, not sufferer), Ok_Necessary6426 (competitor doing his own discovery),
Inspector3949 (shell account), Rare_Dependent4686 (app-seeding account),
deer-wolf/Longjumping_Bee (same). The formal rule that fell out: **no DM without a
profile read; repeated product mentions across unrelated threads disqualifies the
account as evidence, whatever it is.**

| Sent | Who | Why them | Status |
|---|---|---|---|
| 08-18 | **connerpro** (r/GetStudying) | "Fluency theater without an external check" — states the thesis. Advice-giver, not in-segment; treated as conversation, not tester | **Replied 08-19** ("sounds cool! what is it") → sent description + landing page |
| 08-18 | **DocTaufeek** (r/Anki) | Med student, hand-built chapter→ChatGPT→mindmap→cards pipeline. Workaround-builder | No reply yet |
| 08-18 | **Aromatic-Swan-7525** (r/Anki) | Med student, ERPM licensing exam, 100–300pp lecture PDFs, asked publicly for a workflow. Strongest candidate | No reply yet |
| 08-19 | **Professional_Dare904** (r/GetStudying) | ACCA + full-time work, £1000 iPad workaround history, stated intent to record herself. First stranger routed **page-first** | No reply yet |
| 08-19 | **Head_Ad1010** (r/studytips) | Struggling CS undergrad, exams close, asking-thread OP. More charity than validation | No reply yet |
| 08-19 | **-pocoto** (r/studytips, 10mo-old post) | Ran the exact use case as a personal experiment across five AI tools, documented each failure, "beginning to lose hope." Heavy intended usage, price-sensitive | No reply yet |

All six got the landing page (getvoicetutor.com), not an app token — the page is the
front door; signup → minted token + full disclosure in the invite message.

**Sourcing lesson, twice-confirmed (2026-08-19): asking-threads select for real
humans; advice-threads select for marketers.** Both genuine finds came from
someone asking a question. Every advice-thread swept was seeded (WillowVoice,
blekota, mildliner, studybuddy.vc, okti, villson, revisionfy — seven products
across four threads). okti is marketing directly on the explain-out-loud thesis
with cards bolted on: the positioning ground is contested, and the no-cards line
does real work.

Next sweep ~Fri 08-21, after this batch resolves: question-shaped queries
("how do I", "what should I use") against deadline subs (r/ACCA, r/CFA, r/Step1,
r/barexam), fresh comments over old viral threads.

## Leads (not yet testers)

- **RecentPhilosopher851** (Reddit, r/indiehackers) — asked the sharpest question yet: how is this different from NotebookLM's interactive mode. Year-old account, thin history, possibly a shell. Answered publicly 7/31; the reply doubles as findable positioning. Offer a link if they respond like a human.
- **FaithlessnessNeat725** (r/studytips) — med student, uses NotebookLM podcasts on lecture PDFs, names their failure ("gloss over the entire lecture without much depth"). Profile not yet checked; candidate for the Friday batch.
- ~~**Unable-Connection-58** (r/Learning)~~ — **DISQUALIFIED 2026-08-19 on profile check.** Karma-farming content account, not a student: 7mo old, "content writing enthusiast" bio, every post a first-person crisis story in a different sub (finance, marketing, corporate, investing, studying) with the identical malformed closer ("I am very curious to know about your thoughts and personal stories that how...") and "got depressed" as a verbatim tic across four posts. The studying post was manufactured engagement bait — which is itself a signal: the illusion-of-productivity story performs so reliably that farmers write it. New disqualifier for the pipeline gate: **same-shaped emotional posts across unrelated subs = content farm**, distinct from the app-seeder pattern.
- **AccomplishedTune3297** (r/csMajors, StudyBuddyCS launch thread) — asked for the podcast to "quiz you and ask if you understood" — interactive checking requested by name. Profile check Friday.
- **Emotional-Sundae-777** (same thread) — nurse (NRP cert), "helpful for things I need to have down by memory." Deadline-segment, retention frame verbatim. Profile check Friday.
- **StudyBuddyCS OP** (peer, not target) — built the passive half (notes→podcast), independently discovered "the conversation is what taught me best," shipped the one-way version anyway. Builder conversation, low priority. Market signal worth keeping: a listening tool's own users immediately asked for quizzing — the passive pole generates demand for the active one.
- **No_Woodpecker_3571** (r/UPSC) — UPSC Mains aspirant, posted a full workaround spec (PDF → prompt → active-recall notes, 59 upvotes). Profile hidden, so exam cycle unverifiable — and Mains is Aug 21, so **do not DM before then**. Queue for after 08-21 with "how did Mains go" as the opener. Honest bridge required: their ask is notes-generation, not conversation.
- **r/UPSC as a pond** (found 2026-08-19, outside the 115-sub sweep, which was Western-exam shaped): 436k subs, 126k weekly visitors, 7.1k weekly contributions — an order of magnitude more active than any sub profiled. Massive text volumes, workaround-industrious, already deep in AI-PDF workflows. Rule 5 bans commercial promotion → DM-and-asking-threads only, never posts. Friday's sweep should add the Indian exam ecosystem: r/UPSC, state-PSC subs, r/CAT and adjacent.
- **Justin Sung's orbit** — learning-science practitioner named in the r/PKMS thread; audience is exactly "people who care how learning works." Unexplored since 08-03.

---

## External evidence — the effort-direction argument (added 2026-08-19)

A large-scale study published this week lands directly on Voice Tutor's founding
premise, and is the citation for the standing objection ("doesn't AI-assisted
studying hurt learning?").

**The pair of findings, and why the pair is the point:**

- **China study (Stromberg / Lei / Wu, 27,000 students aged 12–18, 6 months):**
  students using AI on homework scored +18% on homework, finished faster (64 → 45
  min) — and scored **−20% on exams** versus non-users. The AI did the cognitive
  work; nothing was retained.
  https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6868618
- **Middlebury study (Contractor / Reyes):** students taught an unfamiliar topic
  *with* an AI chatbot beat controls on tests **and held the gain a week later**.
  Same technology, opposite outcome — there the AI made them think rather than
  thinking for them.
- **Economist write-up of both:**
  https://www.economist.com/graphic-detail/2026/08/18/does-ai-stop-children-from-learning
  Its closer is the tagline's argument in a broadsheet's voice: *"Students must
  resist the temptation to reach for an AI-generated answer before thinking
  things through for themselves."*
- Color, for a post someday: NY Post piece on a professor catching 32 of 35
  students using AI on a final via the same lazy mistake:
  https://nypost.com/2026/07/28/opinion/college-professor-busted-32-out-of-35-students-using-ai-on-a-final-after-they-all-made-the-same-lazy-mistake/

**The axis the two studies draw is Voice Tutor's positioning axis:** which
direction the effort flows. Card-generators (the entire "free AI study tools"
SERP: Penseum, Turbo, StudyFetch, Studyable, okti et al.) remove the effortful
step and sell the removal — the China-study product. Voice Tutor forces the
effortful step (you explain, out loud, checked against the source) and measures
it. Usable line: **"AI that does the studying for you makes exam scores worse.
This one makes you do it."**

**Caveats, so this doesn't get overclaimed later:** the China study is homework-
*writing*, closer to cheating displacement than study-tool use — the analogy
transfers at the framing level, not as proof Voice Tutor works. Middlebury
supports "AI tutoring can produce durable learning" but n/design unverified.
Narrative, not evidence.

## What the record says so far (updated 2026-08-19)

- Seven meetup/warm contacts hold app links (John, Jorge, + five from 08-11). Four of the five opened the page; **zero connected, zero uploaded**. Nobody has used the product. Chelsea's "this week" runs out ~Fri 08-21; one light follow-up is legitimate then.
- Six Reddit strangers have the landing page. One replied within a day (connerpro). The landing page (live 08-18, getvoicetutor.com, analytics on) is now the front door for all cold outreach.
- No session to date belongs to an outside user working their own document. The 08-15 "lucy" session was Matt's own incognito check.
- The gate remains **0/1**: no recruited tester has completed a session on their own document and returned. The differentiation question is not answerable by building; only a tester answers it.
