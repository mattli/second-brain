# Landing page design pass — 2026-08-19

**Status:** shipped and live on getvoicetutor.com.
**Repo:** `mattli/voice-tutor-landing` (`main`), nine commits `f5b5d68`..`22de3d2`.
**Follows:** [[2026-08-18-landing-page-copy-pass]] (copy) and
[[2026-08-18-landing-page-goal]] (the harness run that built the page).

The 8/18 pass fixed what the page *said*. This pass fixed what it *looked like*:
the landing page now uses the app's own design system, so the two read as one
product. Also added the first product screenshot.

## What the app's system turned out to be

Extracted from `voice-tutor` `static/study.html` at commit `3fc0ea2`, read-only,
into a `DESIGN.md` committed in the landing repo (tokens verbatim, derived
additions marked as derived).

Warm and quietly editorial: a cream paper ground (`#faf7f0`) with warm near-black
ink, a serif for every heading, a compact sans for body and UI. Bordered rather
than shadowed — hairline 1px rules do all the delineating, and the entire app
contains exactly one shadow (a transient toast).

Three findings worth keeping:

- **There is no green in the app. At all.** The brief asked for "the coverage-bar
  green"; a sweep of every hex, `rgb()`, and `rgba()` value plus a
  case-insensitive word search returned zero hits. The coverage meter fill is the
  navy accent `#2d4a6b` at 75% opacity. The green was the *landing page's* old
  accent, never the app's — so recoloring green to navy was the single largest
  visual change in matching the two.
- **The app loads webfonts; the landing page must not.** Source Serif 4 + Inter
  from Google Fonts. The zero-external-requests constraint outranks an exact type
  match, so the landing page uses the same stacks with the webfont names dropped.
  Charter and Iowan Old Style ship on Apple platforms and sit close to Source
  Serif 4, so the match is good on iPhone/Mac and degrades to Georgia elsewhere.
- **The app has no dark mode.** No `prefers-color-scheme` anywhere. The landing
  page had one; it was removed rather than inventing a dark palette the app
  cannot match.

## The centering problem, and why two passes failed to fix it

Reported three times as "the page is left-aligned in the viewport with dead space
on the right." **The container was centered the whole time**, at every width
measured (1280/1440/1728/2560: equal gaps, margins resolving to `auto`).

The real defect was in the *ink*, not the box. Every hero element was narrower
than the one above it, all left-aligned: H1 656px, subhead 574, tagline 492, form
420, button 222. A centered box holding a descending left-aligned staircase reads
as off-center. Measured on rendered pixels rather than through the DOM API:

| At 1440px | left gap | right gap | delta |
|---|---|---|---|
| Column box | 360 | 360 | 0 |
| Hero ink (before) | 391 | 423 | 32px |
| H1 ink (before) | 392 | 474 | **82px** |
| Hero ink (after) | 408 | 408 | **0** |
| H1 ink (after) | 434 | 433 | 1px |

**The transferable lesson:** when a visual defect is reported and
`getBoundingClientRect` says everything is fine, the API and the eye are
measuring different things. Decode the rendered PNG and measure where the
non-background pixels actually are. Two passes were spent re-asserting "it is
centered" from DOM geometry before switching to pixels found the real 82px
asymmetry.

Same trap, second instance, same session: the wordmark. `.brand` is a `<p>`, so
the global `p { max-width: 60ch }` capped its box at ~330px. The box hugged left
while `text-align: center` centered the text *inside that narrow box*, putting
the wordmark visibly left of the column center — correct in the DOM, wrong on
screen. Fixed with `max-width: none`.

Resolution: hero and signup are centered ("ceremony"), the middle sections stay
left-aligned ("reading" — steps, cards, and multi-line paragraphs need their left
edge). That centered/left/centered rhythm is **deliberate**, confirmed 8/19, not
an oversight to be tidied on a later pass.

## Also shipped

- **Header bar removed.** The wordmark is now an 11px uppercase tracked eyebrow
  inside the hero, above the H1. The hero is the top of the page; there is no
  `<header>` element left in the document.
- **All six em-dashes replaced** in existing copy. Four became commas; two
  appositives (`Upload a document —`, `not just findable somewhere —`) became
  colons rather than commas or periods, because a comma muddied an
  already-comma-heavy list and a period left a verbless fragment. Deviation from
  the instruction, flagged at the time.
- **Both forms unified**: one 400px block, centered, from a single CSS rule so
  they cannot drift apart, with labels/fields/button sharing one measure and
  full-width buttons.
- **Type scale** raised for landing-page width: H1 36px mobile / 54px desktop at
  weight 600, tighter leading at size.
- **Tagline breaks on phrase boundaries** via two `display: block` spans, verified
  one line per phrase from 320px up. Never breaks mid-sentence "by luck."

## Product screenshot

`screenshot-recap.webp`, 800x982, quality 80, **41.6KB**, from a 996x1222 PNG that
is gitignored and never ships (verified: the PNG returns 404 on the live site).
Renders at 420px, so the 800px asset is the 2x retina source.

**Encoding gotcha:** this machine has no `cwebp`, no ImageMagick, no PIL, and
`sips` *lists* WebP in `--formats` but silently writes nothing. Encoded through
Chromium's canvas via Playwright instead. `canvas.toDataURL('image/webp')`
**silently falls back to PNG** when WebP is unsupported, producing a `.webp` file
that is not one — so the encoder checks the returned MIME type, and `file`
confirms `RIFF ... Web/P`.

**Layout shift proven, not assumed.** A CLS of 0 means little when the image
loads instantly from disk, so the request was intercepted and delayed 2.5s: with
the image still unloaded the box already reserved 420x515 and the following
section sat at the identical y (1507px), document height unchanged. Intrinsic
`width`/`height` attributes do the work. Deliberately **not** `loading="lazy"` —
it sits near the top and would flash in.

## Spec amendment

**Page-weight ceiling raised 50KB → 150KB**, deliberately, to accommodate the
image. Current total is **56.7KB** (16.5KB HTML + 41.6KB WebP). Zero external
requests still holds unchanged — the image is committed and served same-origin.
Recorded in the repo's `DESIGN.md` under "Landing page constraints".

## Open

- ~~**The screenshot's recap body is legible on the public page**, and it is a
  study session about Anthropic's internal build methodology (judge-first
  principle, judges vs. rulebooks). Fine if deliberate; if not, swap the PNG and
  re-encode. Matt's call, flagged 8/19, undecided at session end.~~

  **Corrected same day (2026-08-19), original left above as written.** This was
  never open. Matt reviewed the full capture before shipping and made two
  deliberate choices: keep the recap content (real material, public-safe), and
  exclude the diagnostics block. The flag was raised without checking whether the
  crop was already a decision — the visible content *looked* incidental, and it
  wasn't. Worth keeping because the wrong reading is the transferable part: a
  deliberate editorial crop and an accidental one are indistinguishable from the
  artifact alone, so "was this chosen?" is a question to ask rather than an
  inference to draw.

  What remains is optional and low priority: a future re-shoot on a more broadly
  relatable document (e.g. a generated sample doc) for reach, not safety. **Crop
  rules if it is ever redone: top strip through "What we covered", never the
  diagnostics.**
- Everything on the 8/18 open list still stands: [[2026-08-18-landing-page-copy-pass]]
  (form placement, invite-email disclosure, link-preview image).
