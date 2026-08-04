# Voice Tutor — Study Companion Mode — Product Validation Plan

Status: draft
Created: 2026-04-26
Updated: 2026-08-03 — retargeted from "studying alone is hard" to the deadline/stakes thesis after the r/PKMS cold-post result (see [[testers]], Channels → Reddit r/PKMS, 2026-08-03)
Supersedes: _archive/product-validation-2026-04-14.md (Readwise "drowning in saves" framing — outdated since pivot to Study Companion mode)

## Problem Statement

People facing a real deadline or real stakes — an exam, an interview, staying current professionally — have specific documents they *must* absorb, and find that reading them doesn't stick. Re-reading feels productive and isn't. So they jury-rig voice and conversation workarounds: talking through the material with ChatGPT voice, generating a NotebookLM audio overview, explaining it aloud to nobody, hunting for someone to quiz them.

The gap those workarounds leave: **nothing tracks what they've actually covered, and nothing steers the conversation through the material.** ChatGPT voice will talk about anything but isn't bound to the document and forgets where you were. NotebookLM's audio is produced *at* you — passive, not interactive. Anki tests retention of things you already understood; it does nothing for first-pass comprehension.

The Study Companion is a voice-first session bound to one document, steered by a claim map so the session covers the document rather than wandering, with a written recap at the end.

**What this run is testing:** whether deadline/stakes pain produces workaround-builders at a materially higher rate than the "overwhelmed saver" segment does. The 2026-08-03 r/PKMS post found the saver segment concedes the problem but feels it as mild guilt, not pain — no workarounds, no DMs. This run puts the two segments side by side on the same queries and scoring bar.

## Target Subreddits

### Track A — deadline-driven (primary)

Kept from the April run:

- r/GetStudying
- r/medicalschool
- r/lawschool
- r/GradSchool
- r/studytips — retained on evidence, not framing: April's second-biggest producer (5 candidates). Broad, but it is where hand-assembled study stacks get posted.

Added 2026-08-03:

- r/Anki — retention-obsessed and tool-savvy; the segment most likely to have already built something
- r/MCAT — highest-stakes studying, high volume (r/Step1 is the alternate if MCAT under-produces)
- r/EngineeringStudents — dense-textbook deadline pressure outside the med/law axis

### Track B — overwhelmed savers (comparison arm)

Run only to answer the segment question — *not* a target market until it produces score-3 pain:

- r/Readwise
- r/ObsidianMD — capture-heavy queries only ("save more than I read", "reading backlog", "highlights I never revisit")

**r/PKMS is excluded.** Tested by cold post 2026-08-03: problem conceded by every commenter, zero pain signals, zero workarounds, zero DMs. Re-testing it would buy nothing.

Dropped from the April list (broad, low deadline-pressure, or absorbed by the above): r/college, r/PhD, r/AskAcademia, r/productivity, r/selfimprovement.

## Existing Solutions to Look For

Three primary probes — complaints about their specific limits are the strongest signal available:

- **NotebookLM** — the passive-audio complaint. Audio overview is produced at you; you can't interrupt it or steer it.
- **ChatGPT Voice / Advanced Voice Mode** — no document grounding, no memory of what's been covered. The workaround people actually reach for.
- **Anki / spaced repetition** — retention of what you already understood, not comprehension of what you haven't.

Secondary, still worth noting: ChatGPT/Claude with PDF upload, Readwise Ghostreader, Speechify/TTS, Glasp/Recall/Snipd, voice memos to self, study groups and tutors.

## Power-User Signals

**The signal is a WORKAROUND. Workaround-builders are buyers.** Rank a candidate on whether they have already built or improvised something, not on whether they express a wish:

- Uses ChatGPT voice (or any voice AI) to talk through study material
- Complains NotebookLM's audio is passive / not interactive / can't be steered
- Wants to be quizzed aloud; looking for someone or something to test them
- Feynman-technique seekers — "explain it back to me," teaching it to nobody
- Assembled a multi-tool study stack by hand (PDF → ChatGPT → read-aloud, scripts, custom prompts)
- Already pays for a study tool (Anki Pro, NotebookLM Plus, ChatGPT Plus for study) — willingness to pay is established
- Names a real deadline or stakes: exam date, boards, bar, interview, professional currency

Down-rank: generic "I should study better" posts, system-building for its own sake, no named stakes.

## Success Criteria

A finding is valuable if it shows one of:

- A described workaround for talking through material, in the person's own words
- Someone naming precisely what NotebookLM / ChatGPT voice / Anki fails to do for their document
- Someone under a named deadline describing that reading isn't sticking
- Evidence of paying for study tooling already

A finding is NOT valuable if it's generic "I want to study better," "AI is changing education," or system-building with no stakes attached.

**Every finding in this run is tagged by segment — `deadline-driven` or `overwhelmed-saver`.** The comparison is the research question: which segment produces more score-3 pain, and which produces more workaround-builders. That comparison decides where DMs go, and whether a second cold post is worth the channel cost (measured 2026-08-03 at roughly one full emotional day per post).

## What This Plan Is Not

- Not validating the old Readwise "drowning in saves" hypothesis as a *product*. Track B tests that segment only as a comparison against the deadline segment. (See _archive/.)
- Not validating monetization — pricing comes after the problem is confirmed.
- Not validating mobile/iOS — the prototype is desktop-only via Tailscale.
- Not asking whether voice is the right modality in the abstract — only whether the document-bound, covered-tracked voice session is reached for.

## Next Action

Run the product-validation skill against this doc. Output: a findings doc with a DM-candidates section at the top — username, their words, why they qualify — excluding everyone named in the April 2026-04-26 findings (already contacted). Matt decides who and how many get DMs; the run sends none.
