# Goal: Voice Tutor landing page

**Status:** SHIPPED 2026-08-18. Live at **https://getvoicetutor.com**
**Runner:** dev-harness (self-contained new artifact, hermetic verification sufficient).
**Prerequisite:** DONE — Supabase `signups` table, insert grant, and insert-only RLS policy created and verified.

---

## Outcome

Built by dev-harness run `mszdr5c6`, $2.93, 32/32 verification checks passing.
Deployed on Vercel from a private GitHub repo (`mattli/voice-tutor-landing`),
auto-deploying on push to `main`. Domain `getvoicetutor.com`, ~$10/yr.

**Domain decision:** `voicetutor.ai` was available at $70–180/yr and passed over.
The reasoning: the `.ai` signal tells the audience something they already assume
(nobody thinks a voice tutor has a human on the line), and "AI product" is the
category Voice Tutor competes *in*, not the thing that distinguishes it —
okti and Novis are AI too. `.com` is more trusted by students and self-learners,
who are the actual audience. Upgrade later with evidence if it's ever worth it.

**The catch that mattered.** The pre-push check for `taild1f9b7` / `ts.net` /
`?u=` failed — not in `index.html`, which was clean, but in `verify.mjs`. That
file contained all three strings *because it was the blocklist*. Vercel serves
everything at the repo root, so it would have been fetchable at
`getvoicetutor.com/verify.mjs`, publishing the tailnet name on the public site.
Fixed by rebuilding `main` as a single commit containing only `index.html`,
`README.md`, and `.gitignore` — a merge wouldn't have worked, since deleting a
file doesn't remove it from history and the repo's history is public once the
repo is. **Generalizable: a static host serves the whole repo, so "what's in the
repo" and "what's published" are the same question.**

Also worth recording: the first history scan returned clean on every pattern
while being broken — zsh wasn't word-splitting the commit list, so every grep
errored. The positive control caught it. That's the `||` false-all-clear rule
added to `CLAUDE.shared.md` on 2026-08-15 firing in a different repo three days
later.

**Harness finding, unresolved:** the planner split the job into four sprints, but
the verifier is all-or-nothing — sprint one couldn't pass without building the
whole page, so it did, scored 98, and sprints two through four had no work left.
The run reported "Scored 98, 0, 0, 0" and stopped on the no-progress guard, which
reads as failure and isn't. Cost ~$1.79 in wasted retries. An all-or-nothing
contract and an incremental sprint plan are in tension.

**Copy edits still open** (page shipped as generated):
- Hero subhead is one sentence doing four jobs, in the position where people
  decide whether to keep reading. Cut to two short sentences.
- "keeps the conversation on track and tracks what you've actually covered" —
  tracks/tracks.
- The form sits above the fold before anyone knows what this is. The bottom
  form, after the context and the disclosure, is the one doing real work.

**Housekeeping:** clear the `test@example.com` rows from the Supabase table.

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

Table `signups`, created in the dashboard 2026-08-18 and verified:

```
id           uuid primary key default gen_random_uuid()
email        text not null
document     text
created_at   timestamptz default now()
```

**Live values — use these directly, no placeholders needed:**

```
SUPABASE_URL  = https://vxslotmvmuwxlixutvbi.supabase.co
SUPABASE_KEY  = sb_publishable_kAeVtbJztjtIMdPxyOKIiw_SjemghWX
```

Endpoint is `${SUPABASE_URL}/rest/v1/signups`. Both `apikey` and
`Content-Type: application/json` headers are required on the POST.

**RLS verified working 2026-08-18.** Insert returns `201 Created`; a subsequent
`select=*` with the same key returns `[]` while the rows are visibly present in
the dashboard. So writes land and reads are denied, which is the property that
matters — the key is public by design and the policy is the only thing protecting
the list.

Requirements:
- Supabase URL and key in TWO clearly marked named constants at the top of the
  file, using the live values above. Do not scatter them through the code.
- The key is public and belongs in client code. Do NOT add obfuscation,
  encoding, or any scheme that pretends otherwise.
- Never reference the service-role key. If it appears anywhere, that is a
  critical failure.
- Handle insert-succeeds-but-select-denied: do not read the row back. A
  successful insert returns `201` with an empty body — treat that as success,
  not as a failed response.
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
3. The Supabase URL and key each appear exactly once, as named constants at the
   top of the file.
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
