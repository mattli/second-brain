# Landing page copy pass — 2026-08-18 (evening)

**Status:** shipped and live on getvoicetutor.com.
**Repo:** `mattli/voice-tutor-landing` (`main`), five commits `6547232`..`d67831b`.
**Supersedes:** the "Copy edits still open" list in
[[2026-08-18-landing-page-goal]] (that doc is a record of the harness run and was
deliberately left unedited).

The page shipped as dev-harness generated it. This pass rewrote the hero, both
form fields, one how-it-works step, the disclosure, and the page metadata, by
hand rather than through another harness run — the edits were specified copy, not
a problem to solve.

## What changed

| Element | Before | After |
|---|---|---|
| Headline | Study out loud, without ever looking at your notes. | Learn by talking. Measure your understanding. |
| Subhead | Upload what you're learning, then talk it through on a walk, phone in your pocket, while Voice Tutor keeps the conversation on track and tracks what you've actually covered. | Upload a document and talk it through with an AI tutor that guides the conversation. Voice Tutor tracks exactly what you covered and what you skipped. |
| Tagline | same text, 19px | same text, 24px mobile / 29px desktop |
| Form label (x2) | What's the one document you're trying to get into your head right now? | What are you studying? |
| Form helper (x2) | two different lines | A chapter, a spec, an exam. Optional. |
| Step 3 | See what you actually covered, claim by claim, and what you skipped. | Hang up and get a recap: what you covered, what you skipped, claim by claim. |
| Disclosure body | two paragraphs of specifics | one sentence, deferring specifics to the invite email |
| `<title>` | Voice Tutor: study out loud, hands-free | Voice Tutor: learn by talking, measure your understanding |
| og/meta tags | none existed | title, description, og:title, og:description, og:type, og:url, twitter:card |

The tagline ("No cards. No quizzes. No flashcards. Just a conversation.") was the
strongest line on the page and rendered as small green caption text under the
subhead. Text unchanged; only its weight moved, to sit between the headline
(32px) and the subhead (18px) rather than below both.

## Two of the three original copy edits are done

From the goal doc's open list:

1. **Hero subhead doing four jobs** — done, replaced entirely.
2. **tracks/tracks repetition** — done, the phrase is gone.
3. **The form sits above the fold before anyone knows what the product is** —
   **still open.** The hero form is untouched and still above the fold. This was
   never asked for in this pass, and it is a layout decision, not a copy one.

## What this pass created that wasn't there before

- **The disclosure now writes a cheque the invite email has to cash.** The page
  used to state, at signup time, that documents and transcripts sit on a machine
  in the apartment where they can be read, that voice passes through third-party
  speech-to-text and AI services, and that nothing confidential should be
  uploaded. That is now one sentence promising "when I send you a link, I'll tell
  you exactly how it runs and where your data goes." **The invite email does not
  yet say any of that.** Until it does, the specifics are disclosed nowhere.
  Backlog item added.
- **Link previews are text-only.** og:title and og:description are set, but there
  is no og:image, so a DM preview renders a blank card with text. Needs a
  ~1200x630 image committed to the repo and referenced by absolute URL.

## Verification

Every claim below was checked against the live page, not the local file, using a
cache-busted request — the first live check of the session returned the OLD
headline from a Cloudflare cache HIT, which would have read as a failed deploy.

- All copy live on both `getvoicetutor.com` and the `www` host.
- **No horizontal overflow at 375px** (Playwright + Chromium at
  `~/.node-tools/playwright`): document scroll width exactly 375px, zero elements
  past the viewport edge. Re-run after each push.
- Supabase wiring untouched: both fields still submit `name="document"`, ids and
  `aria-describedby` intact.
- Page is **11KB**, under the 50KB constraint.
- Banned-word check (`agent`, `grounded`, `AI-native`) run **with a positive
  control** so a zero count proves the check executed. No em-dashes in any new
  copy.

**The "zero external requests" constraint holds for the file but not the served
page.** `index.html` contains no external `src` or `href`. The live page loads
`static.cloudflareinsights.com/beacon.min.js` — Cloudflare Web Analytics,
injected at the edge, not in the repo. Removing it is a Cloudflare dashboard
toggle, not a code change.

## Related

- [[2026-08-18-landing-page-goal]] — the harness run that built the page
- [[2026-08-18-landing-page-goal-addendum]] — verifier resolutions for that run
- [[2026-08-03-positioning-what-voice-tutor-is]] — the positioning this copy draws on
