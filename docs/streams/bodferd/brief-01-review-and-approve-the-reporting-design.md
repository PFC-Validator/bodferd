---
brief: bodferd/01
title: Review and approve the reporting design
why: Independent review prevents a plausible draft being mistaken for an approved secure protocol.
outcome: none
wave: 1
depends: [bodferd/02]
unblocks: []
effort: M
gate: human
gate-why: Human approval of the confidentiality and authority model is required before routing a protocol intended to handle sensitive incident reports.
risk: {regulatory: no, customer: no, irreversible: no, sensitive-data: yes}
issues: []
schema: brief-v1
authored: 2026-10-14 by statusgen newbrief
sources:
  - 'bodferd: Review and approve the reporting design'
---

# Brief 01 — Review and approve the reporting design

## Context

files: docs/design.md, docs/security-review.md, adversarial.md, docs/review-decisions.md, src/overview.html, dist/
facts:
- The requesting user chose protocol design before CLI/service implementation.
- The draft binds chain authority to separate signing/encryption keys, independent recipient policy and Tor-only delivery.
- The nineteen initial findings mapped to ten control groups have proposed mechanisms and acceptance requirements, not implementation evidence.
- Raw make-relay signature export, maintainer/registrar identities and independent historical chain verification remain unproven.
- Future conversations reuse an established messaging system; static age reports do not confer group permissions.

Read first: docs/design.md and docs/security-review.md.

## Ground rules

- Independent reviewer, not the design author, produces the technical verdict. A visual review is not cryptographic approval.
- Do not implement the CLI/service, invent identities, register keys, send email or deploy a relay.
- Keep spec draft until a recorded human ruling; stop at implemented for your own deliverables.

## Task

1. Re-check the external review in adversarial.md against the corrected source revision and every A01–A30 disposition, especially the on-chain freshness replacement. Record an independent verdict and remaining blockers in that existing review artifact; no nonexistent report is assumed.
2. Confirm direct-signature enrollment remains unavailable until compatibility evidence exists, and witnessed enrollment preserves its weaker trust label.
3. Review the nineteen-to-ten mapping, proposed acceptance requirements and future messaging boundaries. Record requested corrections; do not modify reviewed protocol text and then verify your own changes. The reviser applies corrections under brief 02, followed by a distinct reviewer re-check.
4. Record the owner's approval, rejection or requested revision as a separate dated human ruling, only after an actual explicit decision. Documentation review cannot approve protocol implementation or production deployment.

## Deliverables

Independent protocol re-check and explicit human decision; corrections belong to brief 02. This does not approve production use.

## Definition of Done

Each material risk has a disposition and evidence requirement; the review identifies unproven external dependencies. The human ruling is recorded separately. Documentation builds and Assay lint passes. Protocol test fixtures and implementation remain later work.

## Verify

| # | Command | Expect | Class |
|---|---------|--------|-------|
| 1 | `node scripts/build.mjs && node scripts/check-build.mjs` | exit 0; source design and all review/disposition sections flow into reproducible output; reviewer checks actual rendered claims | check +flow |
| 2 | `statusgen --root . --lint` | exit 0 with pinned binary; could-not-check is disclosed | check |
| 3 | `test -s adversarial.md && test -s docs/review-decisions.md` | exit 0; independent reviewer dereferences each A01–A30 disposition against the actual revised contract and owner ruling, records source hash and unresolved decisions | check +dereference |

## Evidence

Pending independent execution. No technical review or human approval is asserted by this bootstrap.

## Review

Gate: human (design ruling); independent technical review remains required; the spec approval and production authority remain human decisions.
