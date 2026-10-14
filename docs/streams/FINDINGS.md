# Findings

Append-only findings register. No new Assay findings filed during bootstrap.

The inherited 19 protocol design findings remain in [security-review.md](../security-review.md), with all ten summarized controls mapped in [design.md](../design.md). Designing mitigations does not close them; implementation and independent evidence are required.

## 2026-10-14 — Adversarial review of protocol, Signal trust model and website

Register: [adversarial.md](../../adversarial.md) (A01–A30; inline `Z>>>`…`<<<Z` annotations in `docs/design.md`, `docs/security-review.md`, `src/overview.html`). Five independent passes plus a skeptical re-read; nothing implemented, nothing approved. Headline findings, each a design or documentation defect:

- F-01 — A01 Critical — No path for a non-enrolled operator to report an active incident; the preferred enrollment path has no implementation route and the witnessed path takes up to 48 hours. R08's emergency lane was dropped.
- F-02 — A02 Critical — Every "independent" trust root (policy authority, registrars, release signer, out-of-band channel, maintainer identity) is unnamed and resolves to the proposer as provisionable today; the threshold protects against nothing in that configuration.
- F-03 — A03 High — 24-hour policy expiry signed by an offline 2-of-N authority is a daily ceremony and a crisis-time outage; retry across policy sequences is undefined.
- F-04 — A04 High — Single maintainer, single age key, no roster or continuity; relay deletes its copy after SMTP acceptance.
- F-05 — A05 High — Registration digest input (full record vs non-challenge fields) and the Cosmos parent signing envelope are unspecified; two implementers will not interoperate.
- F-06 — A06 High — The THORChain Discord relay server operator is the real verifier in the witnessed path and is absent from the trusted-party table.
- F-07 — A07 High — "Retained trustworthy history" has no retainer; chain-state source is likely the relay operator's node; no validation height in the evidence bundle.
- F-08 — A08 High — Email transport is unchosen, unowned and spam-shaped; R10's onion-pull recommendation was not carried and the reason not recorded.
- F-09 — A09 High — No custody, backup or disaster-recovery design for the onion key, registration DB, replay DB and revocation marks.
- F-10 — A10/A11 High — The libsignal client option is building a messenger (no group system in libsignal; per-account identity keys break the device credential; Go/no-FFI contradiction); the stock-Signal companion option cannot meet the Tor-only gate and should be concluded, not piloted.
- F-11 — A22 Medium — Website states unprovisioned facts in the present tense and cites "all ten findings" of a nineteen-finding review; design.md:5's "ten controls summarized in the review" has no referent; finish-review evidence is not in the checkout.
- F-12 — A12–A21, A23 Medium — Underspecified bindings (reply recipient, digest pre-images, identity agreement, dedup key), rotation/recovery/dispatch semantics, challenge lifetimes, node statuses, environment separation, relay-capability honesty, surge capacity, observability, zkgroup/MLS/deniability.

Disposition: open. Resolution is brief bodferd/02; human decisions A01–A04, A08 and A21 precede brief 01's ruling. No finding is remediated by this entry.
