---
brief: bodferd/02
title: Resolve adversarial review findings in the reporting design
why: An adversarial review found two Critical and nine High design defects; the human ruling in brief 01 must not be made against an unrevised draft.
outcome: none
wave: 0
depends: []
unblocks: [bodferd/01]
effort: M
gate: model
risk: {regulatory: no, customer: no, irreversible: no, sensitive-data: no}
issues: []
schema: brief-v1
authored: 2026-10-14 by statusgen newbrief
sources:
  - 'bodferd: Resolve adversarial review findings in the reporting design'
---

# Brief 02 — Resolve adversarial review findings in the reporting design

## Context
files: adversarial.md, docs/design.md, docs/security-review.md, src/overview.html, docs/streams/FINDINGS.md, docs/streams/INTAKE.md
facts:
- adversarial.md (2026-10-14) records findings A01–A30 against the controlling design, its Signal section and the reading website; inline `Z>>>`…`<<<Z` annotations mark each location.
- Six findings need a human decision before any text change: A01 emergency lane, A02 named trust roots and separation rule, A03 policy lifecycle, A04 maintainer roster, A08 transport (INTAKE I-02), A21 messaging stack lead (INTAKE I-03).
- The remaining High/Medium findings are exact-bytes specification gaps (A05, A07, A12–A17, A23, A28, A29) that a reviser can close without a ruling.
- Website wording (A22) and renderer hygiene (A26) are independent of the protocol decisions.
- Nothing is implemented; this brief revises documents only.

Read first: adversarial.md, then the annotated docs/design.md.

## Ground rules
- NEVER git push / trigger workflows / run mutating infra commands. Commit only per the task instructions.
- Do not implement the CLI/service, invent identities, register keys, send email or deploy a relay.
- Never remove an annotation without either resolving the finding in the main text or recording a disposition (accepted / rejected with reason) in adversarial.md.
- The reviser is not the adversarial reviewer; the reviewer re-checks each disposition.
- Stop at `implemented` — you do not set verified/done (a different, non-implementing identity does).
- If anything is unclear or contradicts repo state: report NEEDS_CONTEXT, don't guess.

## Task
1. Obtain the six human decisions (A01, A02, A03, A04, A08, A21) via needs-decision issues or a recorded ruling; record each outcome under a "Dispositions" section in adversarial.md.
2. Revise docs/design.md so every A01–A23 finding is either resolved in the main text or carries a recorded disposition; add the digest pre-image table (A13), the registration_core / registration_full split and parent signing envelope (A05), validation height and staleness (A07), reply-recipient binding (A12), dispatch-time and epoch-boundary outcomes (A14), challenge consumption point (A15), all six node statuses (A16), disjoint environment authority sets and startup refusal (A17), the compromised-relay capability list (A18), and the response-challenge signer correction (A23).
3. Add an "R-number" column to the controls table and change "all ten" to the actual count in docs/design.md:5 and src/overview.html; reword the overview facts box and environment table as requirements (A22).
4. Strip resolved annotations, rebuild `dist/` with `node scripts/build.mjs`, and confirm the reading page shows no `Z>>>` text for resolved items.

## Verify (executable — no prose-only DoD items)
| # | Command | Expect | Class |
|---|---------|--------|-------|
| 1 | `python3 -c "from pathlib import Path; print(sum(p.read_text().count('Z>>>') for p in [Path('docs/design.md'), Path('docs/security-review.md'), Path('src/overview.html')]))"` | zero after all dispositions resolved/accepted; any remaining marker has a matching "Dispositions" entry in adversarial.md; reviewer opens each one | check +dereference |
| 2 | `grep -n 'Dispositions' adversarial.md && grep -c '^- A[0-9][0-9]' adversarial.md` | section present; one disposition line per finding A01–A30, each naming resolved / accepted / rejected with reason | check +dereference |
| 3 | `node --test scripts/markdown.test.mjs && node scripts/check-build.mjs` | tests and reproducible rebuild exit 0; dist/ agrees byte-for-byte with docs/ and src/; the rendered page carries no `Z>>>` for a resolved finding | check +flow |
| 4 | `statusgen --root . --lint` | exit 0 with the pinned binary from .assay-versions | check |
| 5 | `grep -c -e nineteen -e '19 findings' src/overview.html docs/design.md` | at least 1 in each file (A22 count correction) | check |
| 6 | `grep -c -e 'R-number' -e 'R0[0-9]' -e 'R1[0-8]' docs/design.md` | at least 10 (controls table carries the R-number mapping, A22) | check |
<!-- Obligation classes this brief's change SHAPE may owe (brief-rules.md):
     - asserts a checkable FACT -> at least one DEREFERENCING row, not only presence counts (rule 43): rows 1 and 2 require the reviewer to open each disposition. -->

## Evidence
<!-- appended at implementation time by a NON-implementer: one row per Verify item
     (command, exit code, output line(s) or hash, date, runner). -->

## Review
Gate: model (from frontmatter — all four risk answers no). Reviewer records verdict + date in the stream README table. The protocol approval itself remains brief 01's human ruling; this brief only makes the draft fit to rule on.

## Revision boundary

This implementer records local developer validation in docs/review-remediation.md. Evidence above stays reserved for the non-implementer. New on-chain publication and roster semantics require that independent re-check; no approval follows from clean renderer/build/lint output.
