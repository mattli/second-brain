# Coverage judge — open findings from the second review pass

**Date:** 2026-08-03
**Subject:** the standalone `coverage_judge` module built by dev-harness run `msdsrc8x`, after the seven-fix pass and a focused three-reviewer follow-up.
**Related:** [[2026-08-02-live-coverage-design]] (the design this module implements) · [[backlog]]

Both priority areas of the second review came back **correct** — the turn-citation
validator produced no false accept or false reject under adversarial probing, and the
document identity proved stable across whitespace, key-order, and formatting
differences in claim files. Trivial findings were fixed in that pass. Six items were
surfaced as judgment calls rather than fixed. This doc records all six and their
disposition.

---

## Doing in the migration pass (not deferred)

### 1. The cross-document merge guard has an all-undeclared hole
The union refuses to merge sessions from *different* documents, and refuses a mix of
identified and unidentified sets. It does **not** refuse a merge where *no* set
declares a document at all — those merge silently. No current caller can reach this
(both real paths supply the identity from the claim sidecar), so it is a
future-caller hole, not a live bug. But it is the one way the guard can be bypassed
without an error, and the module's own comment ("stamp an identity on every set") is
a convention rather than an enforcement.

**Decision:** refuse merges when no verdict set declares a document identity.

### 2. The non-retryable error lives under the retryable base class
The truncation error exists precisely because it must *not* be retried (retrying a
cut-off reply at temperature 0 re-fails identically and doubles the bill). Today that
guarantee holds only because of *where* the error is raised, not because its type
enforces it — any future code that catches the retryable family would silently
re-enable the double-billing the fix removed.

**Decision:** move it out from under the retryable base class so the type enforces
what placement currently does.

---

## Deferred — reachable only once the live pipeline wires this in

These four share a shape: **the module fails the whole session rather than the one
bad part, and a failed attempt's cost goes unrecorded.** All are invisible today
because the judge runs offline against frozen fixtures; they become user-visible once
a live session calls it.

### 3. One bad citation discards every verdict
If the model cites a turn that does not exist for a single claim, the entire verdict
set is rejected — on the real answer key that is 63 claims thrown away for one bad
index. The whole call is then retried, and on a second failure the session gets no
coverage number at all. Classifying it as retryable is right (it is model error, and
temperature-0 output is not perfectly deterministic), but the blast radius is the
question: a single bad citation could instead downgrade just that one claim to
not-covered.

Measured counter-evidence: the credentialed smoke ran five live sessions across the
63- and 71-claim maps with **zero retries**, so the real-world false-reject rate looks
low.

### 4. A malformed rationale field kills the run
The judge's per-claim reasoning is auditing metadata, not the answer. If the model
returns it in the wrong type, the verdict set is rejected, a retry is burned, and the
session produces no coverage number. A harmless model quirk costs the whole result.
Options: coerce it, or drop it and keep the verdict.

### 5. Cost is not recorded when a run fails
The cost file is written only after a successful judge call. So a run that burned two
attempts and then failed records **nothing**, while a clean single-call run records
its spend. This is exactly backwards from the intent of the accumulate-across-retries
fix: spend is captured when it did not spike and dropped when it did.

### 6. Partial token counts print as if complete
If only some attempts report usage, the sum is emitted with no indication it is
partial. Worst case, a count that was never observed is written as a confident zero,
where the previous behavior would have omitted the field. A reader cannot tell an
incomplete measurement from a real one.

---

## Why these are worth fixing before the pipeline, not after

The coverage number is a **user-facing** figure on the study screen. Three of these
four turn a recoverable hiccup into "no number at all" for that session, and the other
two corrupt the cost record that the reconciliation work depends on. A tester seeing a
blank coverage bar reads it as the product being broken, not as a judge retry having
failed — which is the same demoralization risk that motivated the false-negative probe
item.
