---
brief: bodferd/01
title: Review and approve the reporting design
why: Independent review prevents a plausible draft being mistaken for an approved secure protocol.
outcome: none
wave: 0
depends: []
unblocks: []
effort: M
gate: model
risk: {regulatory: no, customer: no, irreversible: no, sensitive-data: no}
issues: []
schema: brief-v1
authored: 2026-10-14 by statusgen newbrief
sources:
  - 'bodferd: Review and approve the reporting design'
---

# Brief 01 — Review and approve the reporting design

## Context

files: docs/design.md, docs/security-review.md, docs/design-review.md, src/overview.html, dist/
facts:
- The requesting user chose protocol design before CLI/service implementation.
- The draft binds chain authority to separate signing/encryption keys, independent recipient policy and Tor-only delivery.
- All ten initial review controls have proposed mechanisms and acceptance requirements, not implementation evidence.
- Raw make-relay signature export, maintainer/registrar identities and independent historical chain verification remain unproven.
- Future conversations reuse an established messaging system; static age reports do not confer group permissions.

Read first: docs/design.md and docs/security-review.md.

## Ground rules

- Independent reviewer, not the design author, produces the technical verdict. A visual review is not cryptographic approval.
- Do not implement the CLI/service, invent identities, register keys, send email or deploy a relay.
- Keep spec draft until a recorded human ruling; stop at implemented for your own deliverables.

## Task

1. Write docs/design-review.md with source revision, signature and framing counterexamples, recipient/delegation trust boundaries, replay/rotation/recovery cases and remaining decisions.
2. Confirm direct raw-signature enrollment and explicitly weaker registrar-witnessed enrollment cannot be confused; assess what evidence can actually be obtained from supported releases.
3. Review all ten acceptance requirements and future messaging boundaries. Record blockers and recommended corrections; do not label future tests as passed.
4. Apply authorized documentation corrections and rebuild the reading page. Record the repository owner's approval, rejection or requested revision as a distinct human ruling.

## Deliverables

Independent protocol review, corrected draft where needed, updated reading page and explicit human decision. This does not approve production use.

## Definition of Done

Each material risk has a disposition and evidence requirement; the review identifies unproven external dependencies. The human ruling is recorded separately. Documentation builds and Assay lint passes. Protocol test fixtures and implementation remain later work.

## Verify

| # | Command | Expect |
|---|---------|--------|
| 1 | `node scripts/build.mjs` | exit 0; full design and findings render |
| 2 | `statusgen --root . --lint` | exit 0 with pinned binary; could-not-check is disclosed |
| 3 | `test -s docs/design-review.md` | exit 0; independent reviewer manually confirms verdict, unresolved decisions and source revision |

## Evidence

Pending independent execution. No technical review or human approval is asserted by this bootstrap.

## Review

Gate: model (documentation review); the spec approval and production authority remain human decisions.
