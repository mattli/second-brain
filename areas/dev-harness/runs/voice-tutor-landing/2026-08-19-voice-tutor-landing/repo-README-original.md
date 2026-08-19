# voice-tutor-landing

A single self-contained `index.html` — the public front door for Voice Tutor.
Built by dev-harness against the goal doc in the vault
(`products/voice-tutor/planning/2026-08-18-landing-page-goal.md` + its addendum).

Deploy by dropping `index.html` on any static host. No build step.

## Verification

`node verify.mjs` grades `index.html` against the frozen contract (30 checks).
It is hermetic: Chromium loads a `file://` URL and the script asserts that no
non-`file://` request is made. Tooling lives outside the repo, because the
harness runs the verifier inside a git worktree that contains tracked files only:

- `~/.node-tools/playwright` (+ Chromium in `~/Library/Caches/ms-playwright`)
- `~/.node-tools/html-validate`

`verify.mjs` is a fixed artifact. It defines the bar; it is not the work.
