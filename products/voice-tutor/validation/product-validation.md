# Voice Tutor — Study Companion Mode — Product Validation Plan

Status: draft
Created: 2026-04-26
Supersedes: _archive/product-validation-2026-04-14.md (Readwise "drowning in saves" framing — outdated since pivot to Study Companion mode)

## Problem Statement

People who study from a single document (textbook chapter, paper, course PDF, dense article) get stuck reading alone. They re-read passages without absorbing them, lose track of what they've already understood, and have no one to ask "wait, what does this actually mean?" mid-paragraph. The existing tools — highlighting, Anki, ChatGPT-with-PDF — either come *after* reading (review) or require typing while you're trying to think. There's no companion that sits beside the document, talks with you while you read it, and leaves a written recap when you're done.

The Study Companion is a voice-first session bound to one document. Voice in, voice out, focused conversation, async markdown artifact at the end. We're validating whether the pain of "studying dense material alone" is real and acute enough that a focused voice tool would be reached for.

## Target Subreddits

Primary (people actively studying from documents):

- r/GetStudying
- r/college
- r/studytips
- r/medicalschool
- r/lawschool
- r/GradSchool
- r/PhD
- r/AskAcademia

Secondary (knowledge workers studying papers / dense docs):

- r/ObsidianMD
- r/Anki
- r/productivity
- r/selfimprovement

## Existing Solutions to Look For

Mentions of any of these — and especially complaints about their limits — are signal:

- **NotebookLM** (Google) — closest comparable; document-grounded chat + audio overview
- **ChatGPT / Claude with PDF upload** — text chat against a doc
- **ChatGPT Voice / Advanced Voice Mode** — voice but no doc grounding
- **Readwise Ghostreader** — Q&A on highlights/articles
- **Speechify / Audible / TTS tools** — passive listening, not interactive
- **Anki / spaced repetition** — review, not first-pass study
- **Glasp / Recall / Snipd** — capture/summarize, not conversational
- **Voice memos to self** — DIY workaround
- **Study groups / tutors / office hours** — the human version of what we're replacing

## Power-User Signals

A Reddit user is a strong candidate to approach if they show 2+ of these:

- Studies from PDFs / textbooks / papers regularly (medical, law, grad student, self-learner)
- Talks about active recall, Feynman technique, "explain it back to me"
- Uses voice tools (dictation, voice memos, ChatGPT voice) by preference
- Complains about reading dense material alone — re-reading without absorbing
- Already pays for a study tool (Anki Pro, Readwise, NotebookLM Plus, etc.) — signals willingness to pay
- Builds their own study workflows in Obsidian, Notion, or scripts — high agency

## Success Criteria

A finding is valuable if it shows one of:

- Someone describing, in their own words, the pain of studying a dense document alone (re-reading, losing focus, wanting to ask questions but having no one to ask)
- Someone using NotebookLM / ChatGPT-with-PDF specifically *for studying a document* and naming what falls short
- Someone who built a workaround (voice memos, study group, AI prompts) for talking through a doc
- A Readwise/Obsidian power user who treats studying a single doc as a recurring ritual

A finding is NOT valuable if it's just generic "I want to study better" or "AI is changing education" — too broad to act on.

## What This Plan Is Not

- Not validating the old Readwise "drowning in saves" hypothesis. That was a different product. (See _archive/.)
- Not validating monetization — pricing comes after the problem is confirmed.
- Not validating mobile/iOS — the prototype is desktop-only via Tailscale; mobile is a later question.
- Not asking whether voice is the right modality in the abstract — only whether the document-bound voice study session is reached for.

## Next Action

Run product-validation skill against this doc to pull Reddit evidence. Then identify 5–10 power-user candidates for phase-2 conversations.
