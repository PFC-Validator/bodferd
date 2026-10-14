# External-review remediation handoff

2026-10-14. Worktree: `bodferd-clean/.worktrees/remediation`, branch `design/review-remediation`, based on supplied external review commit `26afc0502ba2090cac9e48e15b93c8a1d5737a21`. The owner subsequently authorized committing and pushing this revision and removing the superseded original checkout. The original logo work remains preserved in `bodferd-clean/.worktrees/brand`; its assets are included here. No service, identity, policy transaction, email or website publication is activated by this commit.

## What changed

All thirty findings have individual dispositions in [adversarial.md](../adversarial.md). The original external review is unchanged byte-for-byte. The original nineteen findings remain open as implementation risks and are mapped into ten requirement groups. Source annotations were removed only after draft resolutions or recorded owner decisions.

Owner choices are recorded in [review-decisions.md](review-decisions.md): public make-relay contact for unenrolled operators; maintainer-side plus independent approval; explicitly approved any-of reader roster; attached encrypted email plus Tor recovery; MLS-first investigation with libsignal alternative. For A03, the owner questioned daily reapproval and proposed using the trusted chain; the draft replaces the ceremony with a **proposed, gated** on-chain policy commitment/currentness design, not a demonstrated protocol.

Exact core/full hashes, restricted parent-signature envelope, challenge/rotation outcomes, independent historical chain evidence, reply bindings and zero/one-file framing are specified. Recovery, incident capacity, canary/ownership, recipient handling and residual relay powers are explicit. The local reading page includes the supplied review and dispositions, corrected requirements wording and the requested 512×512 brand asset. Renderer/parser changes address the external review's reproduced edge cases.

## Developer validation — not independent verification

- `node --test scripts/markdown.test.mjs`: seven targeted regression cases pass (table/code pipes, list/paragraph boundaries, template literals, balanced/unsafe links, derived dates, review annotations and absent optional browser features).
- `node scripts/build.mjs` and `node scripts/check-build.mjs`: generated output matches a fresh isolated rebuild (12 files).
- Paired statusgen v1.0.29 `--root . --lint`: passes. Repository authorization/reviewer App remains unprovisioned; global roster existence is not a Bodferd grant. Offline origin-claim filtering could not run under the restricted network; no dispatch was attempted.
- Browser at desktop 1512px and mobile 390×844: no horizontal overflow, broken fragment links, duplicate IDs or broken images; mobile contents collapse; search for `registration_core_sha256` returns six sections and `##` yields no false heading-link matches. No captured browser errors/warnings.
- Repository content scan: zero forbidden legacy-name matches, including brand asset metadata; exactly thirty unique A01–A30 disposition lines; no review annotations remain in revised protocol/review/overview sources.
- Original external review prefix equals the supplied HEAD artifact exactly; no arguments were rewritten.

Current source SHA-256: `f47aac58badc0be883d692fddc9231ed08c29e79e0ba6b689a6556e157957971`. Current reading HTML SHA-256: `a747d7b4a503e024302ae15632e04f3adec45eabbaa863e7abd7df03fabb5e67`. Captures: [desktop](evidence/review-remediation-desktop.png), [mobile](evidence/review-remediation-mobile.png). These are implementer UI checks, not the independent reviewer's Evidence or crypto approval. Historical finish-review screenshots were absent; that older verdict is explicitly marked archival/unverified for this revision.

## Re-check requested from the user's external reviewer

Re-read every disposition against the actual revised [design](design.md), especially the new roster/hash definitions and on-chain freshness replacement. The revision does **not** close A02/A03 provisioning facts: named initial signers/confirmation channels, the native policy-commitment carrier, consensus/completeness verification and independently retained chain history still lack evidence. Also check the restricted ADR-036 adapter against actual supported releases; it is not implemented or claimed available. No crypto interoperability tests have run.

Production and implementation readiness remain gated on these facts, actual reader keys/provider/monitor/on-call owners, measured limits and independent cryptographic/parser review. Do not mark either brief verified/done from this document. No draft correction authorizes a maintainer identity, sends a transaction or approves a messaging stack for production.

## Historical scope after the operator-team addition

The hashes and developer validation above describe the external-review remediation in commit `6d44a81`, before the later multi-person requirement. They do not validate the new member schema, per-member lifecycle or optional attribution. That addition requires an independent protocol re-check; new reading-page build checks do not close that gate.
