# Goal: Voice Tutor landing page

**Status:** spec, not yet run. Written 2026-08-18.
**Runner:** dev-harness (self-contained new artifact, hermetic verification sufficient).
**Prerequisite:** Supabase `signups` table + RLS policy created by hand in the dashboard first.

---

## Why this exists

Voice Tutor has no public front door. The app is served from a Tailscale Funnel
URL (`matts-mac-mini.taild1f9b7.ts.net`) which cannot be shared publicly — it
looks untrustworthy from a cold link and each URL carries a live access token.

Written the day after the first five tester links went out. Four of five opened
the link; **none connected, none uploaded, none tried and failed** — no upload
requests at all, and failures would have been logged. So this page is a
*distribution unblock*, not a fix for that drop-off. It opens channels currently
unusable (sanctioned self-promo threads, public replies, anywhere a `ts.net` link
reads as sketchy). It does not answer whether anyone will actually talk through a
document and come back.

---

## Deliverable

A single self-contained `index.html` — inline CSS, no build step, no framework,
no npm, no bundler. Deployable by dropping one file on a static host.

Its ONLY conversion action is an email signup. It must NOT link to the app, and
must not contain any `?u=` token.

## Positioning

Product: a voice-based study tool. You upload a document, talk through it out
loud, and it steers the conversation and tracks which of the document's claims
you've actually covered. Hands-free — designed to be used walking, phone in
pocket.

Committed differentiator, do not soften: **no flashcards, no decks, no quizzes.**
Competitors (okti, Novis) generate cards. Voice Tutor deliberately does not.

Audience: people who need material *in their head*, not just findable in their
notes. Exams, interviews, a new domain at work, or something they genuinely want
to understand. This deliberately includes motivated self-learners with no formal
deadline. It deliberately excludes note-taking hobbyists and productivity-system
builders — people who enjoy organizing information for its own sake. Do not write
copy about vaults, capture, tagging, or knowledge management.

Primary tagline: **No cards. No quizzes. No flashcards. Just a conversation.**

Do not use the phrase "AI-native".

## Required sections, in order

1. **Hero** — headline, one-sentence subhead, the tagline, email form.
   Lead on the outcome (studying without reading; studying on a walk), not on
   the technology.

2. **How it works** — three steps, one line each: upload a document → talk
   through it out loud → see what you actually covered.

3. **What makes it different** — the no-cards commitment, and hands-free use
   (works with the phone in your pocket; card-based tools need your eyes and
   hands). Two short blocks, no comparison table.

4. **Who it's for** — concrete cases, per the audience note above. One short
   paragraph.

5. **Honest disclosure** — early solo project; runs on a machine in the
   builder's apartment; uploaded documents and conversation transcripts are
   stored there and the builder reads them; voice passes through third-party
   speech and AI services. Plain, unapologetic, in the body of the page. It is
   a trust asset, not fine print — not a footer, not a modal.

6. **Signup** — repeat of the form.

## The form

Two fields:
- Email (required)
- "What's the one document you're trying to get into your head right now?"
  (optional, free text, single line)

The second field is the qualifying question — it turns a list of addresses into
a list of people with actual material. Label it in plain language.

### Supabase

Submits to a Supabase table via the REST API using `fetch`.

Table `signups`, created by hand in the dashboard before this runs:

```
id           uuid primary key default gen_random_uuid()
email        text not null
document     text
created_at   timestamptz default now()
```

**RLS enabled with an insert-only policy for the `anon` role — insert permitted,
select denied.** The anon key is public by design; the policy is what protects
the data. Getting this wrong makes the signup list world-readable via the same
key, which is the most common Supabase mistake.

Requirements:
- Supabase URL and anon key in TWO clearly marked placeholder constants at the
  top of the file. Do not scatter them.
- The anon key is public and belongs in client code. Do NOT add obfuscation,
  encoding, or any scheme that pretends otherwise.
- Never reference the service-role key. If it appears anywhere, that is a
  critical failure.
- Handle insert-succeeds-but-select-denied: do not read the row back.
- Success and error states render inline without navigating away.
- On network or API failure, show a plain message with a `mailto:` fallback so a
  motivated person can still reach the builder.
- Basic client-side email format check before submitting, with a clear inline
  error. Do not block on anything else.
- Submit button disables while in flight so a double-click can't double-insert.

## Constraints

- One file. No external CSS/JS/font requests — system font stack only. The
  Supabase REST call is the ONLY outbound request the page makes.
- No analytics, no trackers, no cookie banner. Nothing to consent to.
- Mobile-first. Must read well at 375px; the audience is phone-first.
- Semantic HTML, labels tied to inputs, visible focus states, adequate contrast,
  keyboard navigable.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Page under 50KB.
- No stock photography, no illustration placeholders, no lorem ipsum. CSS only
  if a visual is needed.
- No fake social proof — no logos, testimonials, user counts, "trusted by".
  There are no users yet.
- No manufactured scarcity ("only N spots").

## Verification (hermetic — no network, no credentials, no live Supabase calls)

1. Valid HTML5.
2. Exactly one outbound request target in the source, and it is the Supabase
   REST endpoint. Assert no `<link href="http`, no `<script src="http`, no
   `@import`, no `url(http`.
3. The Supabase URL and anon key each appear exactly once, as marked placeholders.
4. The string `service_role` appears nowhere.
5. No occurrence of `taild1f9b7`, `ts.net`, `?u=`, or any token-shaped string.
6. Every input has an associated `<label>`.
7. No horizontal scroll at 375px.
8. Under 50KB.
9. All six sections present, in order.
10. The submit handler disables the button before the request and re-enables on
    failure — verify by reading the code, not by executing it.

## Out of scope

Domain purchase, DNS, hosting, the Supabase project and its RLS policies, and any
change to the Voice Tutor app or repo. This produces one file.

---

## Open questions, deliberately deferred

- **Domain** not yet purchased. The page is static and portable, so this doesn't
  block the build.
- **Scarcity framing** ("only N spots") considered and left out. Rationing implies
  demand to ration; four people had live links and didn't start.
- **Whether the page is the right investment at all.** The measured drop-off is at
  the app's first screen, not before it. A page that brings more people to that
  same screen doesn't fix it. Built anyway because the channels it unblocks are
  otherwise closed — but the first-screen question stays open.
