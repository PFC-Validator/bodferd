# Adversarial review: Bodferd protocol, Signal trust model and reading website

Reviewed 2026-10-14 against commit `b5e701e` (`main`). Corpus: `docs/design.md` (controlling design), `docs/security-review.md` (original register R00–R18), `src/overview.html`, `src/shell.html`, `src/read.js`, `scripts/build.mjs`, `dist/`, `README.md`, `PRODUCT.md`, `docs/streams/`, `.impeccable/finish-review.md`. Nothing is implemented; every finding below is a design or documentation defect, not a demonstrated vulnerability in a running service.

Method: five independent review passes (protocol composition, trust model, Signal/MLS feasibility, website and build, operational feasibility), then a skeptical re-read of every finding against the source by the coordinating reviewer. Findings that the design already handles were dropped; a list of those is at the end. Where two passes reached a finding independently it is marked **(corroborated)**. Inline annotations in the reviewed files are wrapped in `Z>>>` … `<<<Z` and reference the IDs below; strip them with `perl -0pi -e 's/\n?Z>>>.*?<<<Z\n?//sg' <file>` or `perl -0pi -e 's/<!-- Z>>>.*?<<<Z -->\n?//sg' <file>` for HTML.

## Verdict

The v1 reporting protocol is unusually careful about what it refuses to promise, and its mechanics (signature domain separation, outer/inner manifests, status capability, honest receipt vocabulary) are sound. It fails as an **incident-reporting system** on three structural points the text never confronts: (1) an operator who has not pre-enrolled cannot report at all, and the only enrollment path that exists today needs two human registrars and up to 48 hours; (2) every "independent" trust root is unnamed and, in the only configuration anyone can provision today, resolves to the proposer; (3) a 24-hour policy expiry signed by an offline two-party authority turns a daily ceremony into a single point of failure that is most likely to fail during a crisis. The Signal section is well-hedged sentence by sentence but keeps two options alive (stock-Signal companion, libsignal client) that its own gates already rule out, while under-weighting the option (MLS) that fits its constraints. The website is honest in its status notes and then undoes that in a facts box and a controls paragraph that read as achieved state.

Severity key: **Critical** = the system would not serve its stated purpose or the stated security claim is false; **High** = a security or availability property is unmet or two implementers would build incompatible/insecure results; **Medium** = unspecified behaviour with a plausible bad outcome; **Low** = hygiene, wording, latent.

## Findings register

### A01 — Critical: there is no way for a non-enrolled operator to report an active incident **(corroborated: ops, trust, website)**

**Component attacked:** the incident-time user journey; the dropped R08 emergency lane.

**Argument:** Before a first `report send`, an operator must have: a verified CLI and out-of-band policy fingerprint; a local Tor daemon; `identity create`; a fetched, threshold-verified policy; a registration challenge; authorizer evidence; possession proofs for both keys inside a 10-minute window; and a passing chain-eligibility check. The preferred evidence path (sign-only adapter or envelope exporter) does not exist today by the design's own admission, so every real enrollment goes through an unmodified public `make relay` post plus two policy-authorized registrars attesting within 48 hours. Those registrars are not provisioned either. R08 explicitly asked for "a separate limited lane with an explicit unverified label" for emergency reporting; the design provides only a status-recovery attestation for Disabled nodes and a hard "never fall back" rule. An operator watching funds drain will DM a maintainer on Discord, which is what the system exists to replace. The design also never states its operating assumption: operators must enroll in advance, and someone must run an enrollment campaign, and until an upstream sign-only or export primitive ships, production enrollment is registrar-witnessed only.

**Evidence:** `docs/design.md:117` "No signature-export functionality is assumed to exist today."; `:103` "witnessed enrollment allows 48 hours for human approvals"; `:118` "Production proposal: two distinct policy-authorized registrars"; `:126` "Never fall back to anonymous acceptance after failed chain verification."; `:399` registrar identities, exporter, adapter and chain verifier all "remain unverified"; `docs/security-review.md:111` (R08 remediation).

**Remediation:** Add a labelled, rate-limited, unauthenticated-or-weakly-authenticated emergency lane (e.g. any current on-chain node key signing a short message, no registration) that the maintainer tool displays as `unverified`. State in the design that launch runs on the witnessed path only and budget the registrar roster. Make "pre-enrollment campaign" an explicit prerequisite.

### A02 — Critical: every "independent" trust root is unnamed and, as provisionable today, resolves to the proposer **(corroborated: trust, ops)**

**Component attacked:** `:38` "Independent offline administrators"; `:47` "trust bundle independently of the relay"; `:64` "Only the independent authority establishes that role"; `:9` "independently trusted maintainer policy".

**Argument:** The design names nobody. The relay is to run in the proposer's estate, the test mailbox is the proposer's domain, the repository owner chooses the roster, and no maintainer-side party participates in the design. If one organisation holds both threshold keys, runs the relay and staffs the registrar seats, the 2-of-N threshold protects against losing one key file, not against that organisation: it can issue a policy naming an attacker-controlled `report_age_recipient` and every pinned CLI will encrypt to it while reporting success, which is exactly the R02 circularity the policy layer was built to break. The trust bundle ships inside the signed CLI release, so the release-signing key (unnamed, future work) is the de facto root above the policy authority. The "out-of-band" fingerprint channel is never named, and the only public channel mentioned (Discord) is one the design says cannot confer authority. Revocations reach clients only via `GET /v1/policy` on the relay. The maintainer's identity (`itzamna@thorchain.org`) is a user-supplied string; nothing requires the maintainer to publish a fingerprint through a channel operators already trust (e.g. a key known from thornode releases) or to countersign the policy. The policy authority also authorises the acknowledgement key, so it, not the relay, can forge "reviewed" acknowledgements.

**Evidence:** `docs/design.md:13`, `:38`, `:47`, `:49`, `:56`, `:64`, `:66`, `:233`, `:251`, `:255`; `CLAUDE.md` "the requesting repository owner chooses account/role roster identities".

**Remediation:** Write a separation rule into the policy schema and the design: no threshold signer may administer the relay; at least one production signer must be from the THORChain maintainer side; the maintainer countersigns the policy entry that names their key. Name the release-signing identity, the transparency/provenance mechanism (R18 pointed at Sigsum) and the out-of-band fingerprint channel. Name an independent publication location for policy and revocations that the relay cannot withhold.

### A03 — High: a 24-hour policy expiry signed by an offline 2-of-N authority is a daily ceremony and a crisis-time outage **(corroborated: ops, protocol, trust)**

**Component attacked:** `:66` "Production policies expire within 24 hours by proposed default."

**Argument:** The whole policy object, including `expires_at` and the relay receipt keys, is threshold-signed by "independent offline administrators". Clients refuse to encrypt and the relay refuses to admit after expiry, with no bypass. That is two humans with offline keys signing every day forever; if they are unavailable for 48 hours (most likely during the incident that makes them busy) all incident reporting stops, and recovery requires "an independently verified replacement bundle". Rotating the relay receipt key is another offline ceremony. The design also leaves undefined what happens to immutable ciphertext encrypted under policy N and retried after policy N+1 (same recipient key, different `policy_sha256`); `:68` covers accepted submissions only. The registration record's `policy_sha256` (`:93`) is stale for most of its 30-day life and nothing says what it is compared to. "Independent publication" of updates (`:66`) names no channel, so every refresh is the relay.

**Evidence:** `docs/design.md:38`, `:49`, `:51-60`, `:62`, `:66`, `:68`, `:93`, `:162`, `:171`, `:179`, `:233`.

**Remediation:** Separate long-lived threshold-signed authority (roster, recipient keys, revocations; weeks to months) from short-lived freshness (an online, relay-independent, single-key-signed "current policy sequence" heartbeat or a published revocation feed). Define retry behaviour across policy sequences explicitly: accept if the recipient key is unchanged and the old policy is within a historical-verification window.

### A04 — High: one maintainer, one mailbox, one age key, no continuity

**Component attacked:** `:56` singular `maintainer: {…}`; `:43` "One report recipient is the default."

**Argument:** The policy schema has exactly one maintainer object and no roster. (`:43` forbids silently adding a *sender* recovery recipient; it says nothing about a maintainer continuity recipient, but none is designed.) If the maintainer is unavailable or loses the age identity, every report is sealed to a key nobody can use; the relay has already deleted its ciphertext after SMTP acceptance; re-encryption needs the sender's cooperation. Acknowledgement is optional, so an operator cannot distinguish "being triaged" from "nobody has looked". The threshold exists only for policy signers, not for the people who read reports.

**Evidence:** `docs/design.md:43`, `:56`, `:68`, `:268`, `:13`.

**Remediation:** Make `maintainer` a list with explicit "any-of" decryption (multiple age recipients in the header is supported by age and is not the group-chat anti-pattern `:304` warns about when the set is a policy-signed roster), an on-call/handoff statement, and a required `received` acknowledgement SLA in the test environment.

### A05 — High: the registration digest and the parent signing input are ambiguous; two implementers will not interoperate **(corroborated: protocol; website noted the consequence)**

**Component attacked:** `:103` "hashes the non-challenge registration fields"; `:105` "SHA-256 over canonical UTF-8 JSON"; `:117` "signs the registration digest with a fixed application purpose".

**Argument:** The record schema includes `challenge_id`, `challenge_nonce`, `issued_at`, `expires_at`. Line 105 hashes the record; line 103 says the relay challenge hashes the non-challenge fields; so two digests exist and the text never says which one the node key signs, which goes into the `THOR-RELAY-REGISTER-V1` marker, and which the possession statement carries. If the parent signs the full-record digest, every challenge retry (15-minute window) invalidates an already-posted Discord announcement. "Canonical UTF-8 JSON" at `:105` is not stated to be the RFC 8785 JCS required at `:140`; `previous_registration_sha256: ""` vs absent is not pinned. For the parent (Cosmos secp256k1) signature, no byte format, hash mode or envelope is given (ADR-036 sign-arbitrary? raw `purpose||digest`? digest as pre-hash?); signing a 32-byte digest as a pre-hash is a cross-protocol hazard with Cosmos transaction signing.

**Evidence:** `docs/design.md:94-97`, `:103`, `:105`, `:108`, `:117`, `:124`, `:140`, `:229`, `:399`.

**Remediation:** Define `registration_core` (no challenge fields) and `registration_full`; state that the parent signs `registration_core_sha256`, the marker carries it, the comms-key possession statement signs `registration_full_sha256 || challenge`. Pin the parent signing envelope (recommend ADR-036 `MsgSignData` with a fixed `signer` and a domain-prefixed `data` payload), the accepted key algorithms and the address derivation.

### A06 — High: in the witnessed path the real verifier is the THORChain Discord relay server operator, who is never listed as a trusted party **(corroborated: trust, ops)**

**Component attacked:** `:118` registrar-witnessed enrollment.

**Argument:** The chain of custody is node signature → existing THORChain relay server verifies and posts → Discord stores → bot message → registrars attest. The relay-server operator (THORChain devops, a third party) performs the only signature verification in that chain and appears in neither the key table nor the privacy promise. The attestation binds guild/channel/bot/message IDs, which does defeat webhook impersonation *if* registrars check the author's application ID; the design should say so. Two registrars protect against one registrar lying, not against a common forged or compromised feed, and if both are from the same organisation (A02) they protect against nothing. Registrar availability, paging and key custody are not described, and this is the path every production registration will use (A01).

**Evidence:** `docs/design.md:31-39`, `:11`, `:118`, `:120`, `:257`.

**Remediation:** Add the relay-server/bot operator to the trusted-party table with what it can do (admit a forged announcement). Require registrars to verify author application ID, not display name. Require registrars from at least two organisations in the production policy.

### A07 — High: "retained trustworthy history" has no retainer, and the chain-state source is probably the relay operator's own node **(corroborated: trust, protocol)**

**Component attacked:** `:194` "Validate admission-time authorization using retained trustworthy history"; `:33`/`:101`/`:128` "independent chain state"; `:286` Row 6 "fresh state".

**Argument:** Verifying months later that node X had `node_operator_address` Y at height H requires archive state; THORNode defaults prune, and `:399` admits historical retention is unverified. No party is assigned to retain it. If the relay retains it, the maintainer's step 2 is checking relay-produced evidence against relay-produced history, which contradicts "A relay's 'verified' label is insufficient". The realistic chain source is the proposer's own THORNode: independent of the submitter, not of the relay. The outer manifest records no validation height, so a lagging or forked relay node can admit a recently removed node with nothing in the evidence bundle showing the height used. R03 asked for recorded height and staleness bounds; Row 6 claims "fresh state" as the owning mechanism without either.

**Evidence:** `docs/design.md:33`, `:101`, `:118`, `:128`, `:166-175`, `:194`, `:286`, `:399`; `docs/security-review.md:61`.

**Remediation:** Add `validation_height`, `validation_time` and `chain_source_id` to the admission receipt and bundle; define maximum staleness; assign history retention (maintainer-side archive node or a signed snapshot feed) and state that the maintainer verifies against its own source.

### A08 — High: email is an unchosen, unowned, spam-shaped transport that the original review recommended against

**Component attacked:** mail worker; the decision to keep SMTP.

**Argument:** 10 MiB ciphertext plus 256 KiB metadata plus the outer age wrapper plus base64 is roughly 14 MB on the wire; that passes Gmail but fails common 10 MB corporate inbound limits, and no provider has been chosen for either domain. A relay `From` address needs a domain with SMTP credentials and SPF/DKIM/DMARC alignment; the design does not say whose domain or whose credentials, and `k8s/creds/` is a human-gated risk path. The resulting mail (unknown sender, generic subject, random-named opaque binary, no text) is the textbook spam-quarantine profile, and there is no bounce/NDR handling beyond "quarantine visibly". The maintainer already runs the CLI over Tor to acknowledge or reply, so an onion pull of the bundle costs nothing extra and removes the provider, the credentials, the size limit and the permanent third-party copy. R10 said "Prefer an onion mailbox plus generic email notification"; the design keeps attached email without recording why.

**Evidence:** `docs/design.md:13`, `:185`, `:189`, `:209`, `:264`; `docs/security-review.md:131`; `CLAUDE.md` risk paths.

**Remediation:** Record the transport decision explicitly. Recommended: onion pull by the maintainer tool as primary, email as a content-free notification only.

### A09 — High: onion key, registration DB, replay DB and revocation marks have no custody, backup or disaster-recovery design

**Component attacked:** deployment and retention sections; `:273` "Do not include report spools in routine backups".

**Argument:** The onion hostname is the `service_id` pinned in every registration, manifest and policy; "No certificate authorizes … outside its fixed service". Losing or rotating the onion key therefore re-enrolls the whole operator base through the 48-hour path, yet onion key custody, HA/OnionBalance and Tor daemon upgrades are never mentioned. The design requires durable replay and admission state and then says spools are excluded from backups, without saying what *is* backed up: the registration table, consumed-challenge store, 90-day tombstones and the revocation high-water marks that must "outlive removed certificates". A host loss with no restore makes revoked keys valid again. There is no runbook for relay operational-key rotation (it is "short-lived policy-authorized", so every rotation is an A03 ceremony).

**Evidence:** `docs/design.md:39`, `:83`, `:134`, `:181`, `:253`, `:255`, `:273`.

**Remediation:** Add a custody/backup/DR subsection: what state is durable, what is backed up and how (encrypted, off-cluster), onion key escrow under the same SOPS rule, and a migration procedure for `service_id` change that re-uses existing parent authorization.

### A10 — High: the libsignal client option is building a messenger, and its device credential does not match Signal's per-account identity key **(Signal pass; Go/FFI contradiction corroborated by protocol pass)**

**Component attacked:** `:339` "including private-group primitives"; `:360` "Pinned libsignal session/group primitives"; `:363` Go CLI, no bespoke FFI; `:369` device credential binds "messaging device ID, hash of the protocol-native public identity key"; `:379` "Role revocation removes all affected devices".

**Argument:** In libsignal, group messaging is a sender-key cipher plus distribution messages; there is no roster, membership operation, group identifier or credential issuance. Signal's private-group system (encrypted roster, master key, GroupChange authentication, zk credential issuance) lives in the separate AGPL `storage-service` (Bigtable) and in the Signal app code, not in libsignal or Signal-Server. Option B therefore means writing a prekey directory, a per-device queue, a group-state store with credential issuance, the client group-change state machine, device linking and a Tor transport (libsignal-net targets the Signal service). The closing list at `:393` concedes most of this, but the layer table reads as reuse. Separately: libsignal identity keys are Curve25519 (type byte 0x05, XEdDSA signatures) and in Signal's deployed model are **per account**, shared by all linked devices; (device ID, H(identity key)) therefore does not identify a device, and "remove a device" cannot be expressed as rejecting an identity key. Per-device identity keys are possible in a bespoke Option B but depart from the Sesame model the design cites. Finally, the Bodferd layer is Go, libsignal has Java/Swift/TypeScript bindings only, and bespoke FFI is forbidden, so the "narrow adapter" is either FFI, an IPC boundary with a bespoke control protocol, or a second implementation of the verifier in another language, which the v1 sections warn against. The server-cost sentence (`:341`) names FoundationDB and omits DynamoDB, four Redis clusters, object storage, APNs/FCM, registration service, CDSI, SVR and the separate groups backend.

**Evidence:** `docs/design.md:339`, `:341`, `:357-363`, `:365`, `:369`, `:379`, `:393`; upstream: `signalapp/libsignal` `rust/protocol/src/group_cipher.rs`, `sender_keys.rs`, `rust/core/src/curve.rs`; `signalapp/storage-service` `GroupsController`; `signalapp/Signal-Server` `service/config/sample.yml`.

**Remediation:** Re-title Option B as "a new messenger reusing libsignal's pairwise ratchet"; state the per-account identity key consequence and choose per-device or per-account binding; replace the Go/no-FFI sentence with the actual consequence (a non-Go client).

### A11 — High: the stock-Signal companion option cannot meet the design's own gates, and should be concluded rather than piloted

**Component attacked:** `:335` "evaluate a companion workflow using the existing Signal app"; `:347` challenge-in-conversation binding; `:349` admin controls; `:351` "Do not claim this route meets Tor-only transport without demonstrating every network path."

**Argument:** Stock Signal's network paths are fixed by the Signal service: APNs/FCM push, CDN attachments, SGX contact discovery, phone-number registration, SVR. None is an onion service and official clients offer only a TLS proxy, not SOCKS; a phone number is an identity disclosure the document never budgets. The gate is structurally unmeetable, so there is nothing to demonstrate. The "challenge answered in an encrypted conversation" proves that whoever controls that Signal account's sessions can also sign with the comms key at that instant; it says nothing about which identity key the service served the peer, and stock Signal exposes no API from which a companion can obtain the identity key or recompute the safety number. The result is per-pair, reset on reinstall, and overridable by tapping through "safety number changed". Admins in a stock client see a phone number or username, never a Bodferd credential. "Optional administrator approval of invitations" conflates group-link join requests with invitations.

**Evidence:** `docs/design.md:257`, `:335`, `:347`, `:349`, `:351`; upstream `Signal-Server` `sample.yml` keys `apn`, `fcm`, `cdn`, `directoryV2`, `registrationService`.

**Remediation:** Record Option A as failing the Tor-only and membership-enforcement gates and remove it from the candidate list, or restate the gates.

### A12 — Medium: the reply recipient is bound by nobody

**Component attacked:** `:154` `reply_registration_sha256` in the inner manifest; `:207`, `:209` reply path.

**Argument:** The inner field is invisible to the relay and unresolvable by the maintainer (the bundle carries only the submitting registration; there is no registry dump). The response manifest binds a "reply-recipient fingerprint" but the relay's listed checks never include "fingerprint equals the accepted submission's registered recipient". A sender who sets the inner field to another operator's digest, or a maintainer tool that honours it, produces a reply encrypted to a third party and attached to the original submission; a tool that ignores it uses the submitter's registration. Two valid implementations, different recipients.

**Evidence:** `docs/design.md:154`, `:185`, `:207`, `:209`, `:245`.

**Remediation:** Require `reply_registration_sha256 == registration_sha256` (or a relay-validated later epoch of the same parent), and require the relay to reject a response whose recipient fingerprint does not match the accepted submission's registration.

### A13 — Medium: "digest over what", "identity agreement" and the deduplication "sender" key are undefined

**Component attacked:** `:93`, `:150-151`, `:171` digests; `:195` "identity agreement"; `:179` dedup "keys on environment, sender and submission ID"; `:245` "submitted context digest"; `:285` Row 5.

**Argument:** The design is explicit about the hash input only for the status capability (`:205`). For `policy_sha256`, `report_recipient_sha256` and `registration_sha256` it does not say whether the hash is over JCS of the body, of the signed envelope including signatures, of the bech32 recipient string, or of raw key bytes. The challenge's "submitted context digest" cannot be over the manifest, which contains the challenge. `:195` never lists which inner/outer fields must agree, and R06's "explicitly authorized forwarding relationship" is neither defined nor forbidden. If dedup "sender" means `registration_sha256`, a legitimate retry after key rotation (new epoch, same ciphertext and ID) is a second accepted job and a duplicate mail while inner/outer registration digests now disagree; if it means parent address the retry is deduplicated but the disagreement remains. Row 5's "one accepted job" depends on this choice.

**Evidence:** as listed; `docs/security-review.md:91`.

**Remediation:** A digest table: for each `*_sha256`, the exact pre-image. Define identity agreement as the tuple (registration parent, environment, chain, service, submission ID, policy, recipient). Key dedup on (environment, parent address, submission ID).

### A14 — Medium: rotation, recovery and dispatch-time revalidation have no enforcement semantics

**Component attacked:** `:128`, `:132`, `:134`, `:136`, `:187`.

**Argument:** "Cannot renew its own authority indefinitely" implies bounded self-renewal, contradicting "each fresh epoch requires a new parent-authorized registration". Rotation "signs continuity with the previous communication key" but lost keys use the same parent authority, so the relay cannot distinguish rotation from recovery and continuity carries no weight unless a continuity-less epoch is rejected for a parent with an active key, which would make recovery impossible without a flag that is only defined for Disabled nodes. A submission admitted under epoch 1 and completed after epoch 2 activates is either accepted with a superseded key or dropped after a receipt. Chain authority is "rechecked … before first dispatch", but if the node churns out, is jailed, or the key is superseded between admission and dispatch, nothing says whether the receipted report is sent, quarantined with a visible status, or dropped. That silent drop is the R08 failure reintroduced after the operator believes delivery is underway.

**Evidence:** as listed; `:203` has a `quarantined` state nothing routes to; `:292` lists "simultaneous epoch rotations" as a test with no expected result.

**Remediation:** State: parent-signed recovery carries an explicit `recovery: true` field; a receipted report is dispatched if admission-time authorization held and is marked `quarantined` only on a revocation that names it; in-flight reservations complete under the admitting epoch.

### A15 — Medium: registration challenge lifetimes are mutually inconsistent at the acceptance point

**Component attacked:** `:103`, `:126`, `:128`.

**Argument:** Direct registration challenge 15 minutes, possession challenge 10 minutes, "Both certificate and challenge validity constraints must hold at acceptance", acceptance being the atomic step that consumes the challenge and inserts the registration. Challenge at t=0; evidence submitted at t=12; possession challenge issued (valid to t=22); confirm at t=17; registration challenge expired at t=15, so acceptance fails although every step was in-window. Either the possession challenge inherits the registration challenge deadline, or the registration challenge is consumed at `evidence-verified`; the text supports both readings. "Repeating identical evidence returns the same result" also conflicts with single-use consumption unless the stored result is returned without re-verification.

**Remediation:** Consume the registration challenge at `evidence-verified`; require only the possession challenge to be live at activation; return the stored outcome for replayed evidence.

### A16 — Medium: eligibility omits THORChain's `Ready` and `Whitelisted` statuses and does not define operator-address change mid-certificate

**Component attacked:** `:126` "Default accepted node statuses are Active and Standby … Disabled/other states require a separately labeled, policy-authorized recovery attestation."

**Argument:** THORChain node status is Unknown / Whitelisted / Standby / Ready / Active / Disabled. A `Ready` node (bonded, queued to churn in, fully relevant to incident reporting) is "other" under this text and would need a recovery attestation, which is almost certainly unintended. If `node_operator_address` changes during a 30-day certificate, a registration authorised under `operator-account` fails the per-admission recheck with no stated handling, while one under `node-account` keeps working, so the two authorizer roles have different mid-incident failure behaviour and the operator is not told which to prefer.

**Remediation:** Enumerate all six statuses with a disposition each; add the operator-address-change case to the recheck rules.

### A17 — Medium: test/production separation is a signed string, not disjoint trust roots, and R12's startup refusal was dropped

**Component attacked:** `:47`, `:49`, `:290` Row 10.

**Argument:** The `environment` field is inside the signed policy, so a test key cannot forge a production policy *unless that key is also in the production bundle*, and nothing forbids that. The likely provisioning is that the proposer's key is the single test authority and one of two production signers. The design does not require disjoint authority key sets, nor that a production CLI build refuse a test bundle. R12 required "Production should refuse to start with test configuration and vice versa"; Row 10 claims "distinct policy/keys/routes" alone.

**Remediation:** Require disjoint authority key sets per environment, and a build-time environment constant that refuses the other environment's bundle.

### A18 — Medium: the privacy promise lists what a compromised relay learns, not what it can do

**Component attacked:** `:11`; `:203`.

**Argument:** Scattered elsewhere the design admits withholding policy, unreliable receipts and censorship. Not stated anywhere, and concretely available to a hostile relay: refuse registration or submission challenges to chosen nodes only (silent, undetectable expulsion); refuse renewals so a target's registration lapses; fabricate `delivery-uncertain`/`failed` to induce resends or abandonment; delay dispatch past an incident window; withhold a node's encrypted reply; drop the evidence bundle so the maintainer rejects; serve a still-valid 24-hour-old policy after a revocation; build a graph of node → comms key → reply recipient → report cadence across epochs. Selective per-node denial is the capability a hostile relay operator in a single-validator project would actually use.

**Remediation:** Add the list to the privacy-promise section and to CLI documentation.

### A19 — Medium: incident surge capacity is a quota, not a reservation

**Component attacked:** `:264-267` limits table; R13 "reserve incident capacity".

**Argument:** 512 MiB holds about 50 maximum-size reports and drains only as fast as one mailbox accepts ~14 MB messages. An incident touching dozens of nodes hits backpressure, and the only relief valve is "signed-policy incident adjustment", which is the A03 offline ceremony during the incident. No priority lane, no small-message fast path that bypasses the spool, no degraded mode (accept manifest and message, defer attachment).

**Remediation:** Reserve a message-only lane with its own spool and quota; define a degraded mode.

### A20 — Medium: nobody can tell the relay is down, censored, spam-filtered or silently dropping

**Component attacked:** `:189` "quarantine persistent/uncertain cases visibly"; `:273` minimal logs; `:245` no public status.

**Argument:** A broken SMTP credential, a provider spam rule, an expired policy (A03) or a dead Tor daemon all look identical to "no incidents today". The operator sees `delivery-uncertain` only on poll; there is no push. "Visibly" names no alert channel or on-call. A synthetic canary (scheduled test-environment report through the real pipeline with the maintainer tool auto-acknowledging) is cheap and would catch every failure class above.

**Remediation:** Design the canary and an operator-visible "last successful end-to-end at <time>" field in the policy or status endpoint.

### A21 — Medium: the zkgroup issuer is a membership root the principal table denies; deniability is deferred where it should be decided; MLS is the better fit for the stated constraints

**Component attacked:** `:313` "Directory / delivery server | No independent role-granting authority"; `:385` zkgroup; `:381` and `:304` deniability; `:302` vs `:335` MLS vs libsignal lead.

**Argument:** In Signal's design the credential issuer and verifier are the same service; whoever holds `ServerSecretParams` can issue an auth credential for any UID it knows and knows every UID it issued to. Bodferd's enrollment relay is identity-aware by design, so the issuer already knows node↔UID; zkgroup's privacy gain is limited to an opaque roster, and the secret-params holder must appear in the principal table as a trusted role. On deniability: eligibility can only be checked at session establishment and group admission, not per message; sender-key group messages carry a per-chain signature and are not deniable among members, and the Bodferd credential is by construction a durable transferable proof that node N operates identity key K. That is materially weaker than pairwise Signal and should be stated as the chosen property. On stack choice: MLS (RFC 9420) assumes exactly the split Bodferd has (trusted Authentication Service, largely untrusted Delivery Service) with group state, membership, epoch rotation and removal inside the protocol; OpenMLS and mls-rs are built for third-party use with permissive licences and `mls-rs-uniffi` bindings, which satisfies the "no bespoke FFI" rule from Go where libsignal cannot. Two cautions: neither MLS library claims an independent full audit (mls-rs says so; OpenMLS had a 2025 forward-secrecy advisory, fixed in 0.7.1), so `:302`'s "audited implementation" criterion may be unsatisfiable as written; and MLS group ID and epoch are visible to the delivery service.

**Evidence:** `docs/design.md:302`, `:304`, `:313`, `:323`, `:335`, `:381`, `:385`, `:389`; upstream `libsignal/node/ts/zkgroup/auth/ServerZkAuthOperations.ts`; RFC 9420 §2; `awslabs/mls-rs` README; `openmls` advisory GHSA-qr9h-x63w-vqfm.

**Remediation:** Promote MLS to the lead candidate with the two cautions recorded; add the secret-params holder (or MLS Authentication Service) to the principal table; state the deniability property as decided.

### A22 — Medium: the website states unprovisioned facts in the present tense and miscounts the review **(corroborated: website, ops)**

**Component attacked:** `src/overview.html:6`, `:27`, `:35`, `:39`; `docs/design.md:5`, `:277`; `.impeccable/finish-review.md`.

**Argument:** The facts box says "Operator identity: Verified against chain authority" and the environment table says production has an "Independently confirmed recipient identity", immediately after a status note saying nothing is implemented; `docs/design.md:13` says neither the email string nor the document establishes ownership and nothing is provisioned. The controls paragraph says "incorporates all ten findings from the initial review"; the review has nineteen findings (R00–R18) and contains no ten-item summary, so the design's own "all ten controls summarized in the review" (`:5`) has no referent; the "ten" is the design's grouping table, which no R-number maps to. "Each control has an observable acceptance check" overstates a column of prose requirements that brief 01 itself calls "acceptance requirements, not implementation evidence". The evidence-path box labels the direct path "preferred … when available" without saying it has no implementation route. `.impeccable/finish-review.md` cites browser captures and measurements that are gitignored and absent from the checkout, which under invariant 1 is an unverified claim presented as a "ship" verdict (a fresh check in this review does confirm zero dangling anchors and zero duplicate ids, but that is this review's evidence, not theirs).

**Remediation:** Reword cells as requirements ("Must be verified against chain authority"; "Recipient identity must be independently confirmed"); change "all ten findings" to "the nineteen findings, grouped into ten controls" and add an R-number column to the design's table; state on the page that the direct path awaits an upstream primitive; either commit the finish-review evidence or mark the verdict unverified.

### A23 — Medium: acknowledgement-key authorization depends solely on relay-served policy, and the response challenge is mis-attributed to the policy key

**Component attacked:** `:207`, `:209`, `:242`.

**Argument:** The operator must check "the acknowledgement key's current authorization/revocation", but its only policy source is the relay, which can serve a still-valid previous policy alongside a response signed with a just-replaced key. After a normal ack-key rotation, a response signed under the policy current at signing time is no longer "currently authorized" when read; `:68`'s historical-verification mode exists for policies but is not applied to responses. The endpoint table says the response challenge is "policy-key-signed", which names the offline authority as a per-request signer; everywhere else challenges are relay-key-signed.

**Remediation:** Apply the historical-verification window to responses; fix the endpoint wording; this is one more reason for the independent revocation feed in A02/A03.

### A24 — Low: durable, attributable evidence lives on the maintainer and operator side, and both are out of scope

**Component attacked:** `:11`, `:162`, `:268`, `:304`.

**Argument:** The design is honest that signed reports are not deniable and mail copies are irreversible. But the maintainer mailbox (who else reads it, retention, third-party disclosure) and the decrypted staging area have no handling rule, while the relay is minutely specified; and the CLI keeps plaintext, ciphertext and the node binding for retries, so a later workstation compromise discloses a signed, node-attributed account of what the operator saw and when. There is no consent moment in the CLI flow.

**Remediation:** A short "what you are signing" confirmation in `report send`; a maintainer-side retention rule; a local `report purge` command.

### A25 — Low: two identity roots (Bodferd credential vs. messaging directory) with no conflict-resolution order

**Component attacked:** `:371`, `:373`, `:315`.

**Argument:** "Reject mismatch" covers substitution but not the honest cases: a legitimate re-key whose credential has not propagated, and a stale-credential replay. Which root is authoritative, how long a client waits, whether sends block or warn, and who issues the resolving credential are unspecified; `:373` says staleness is "explicit policy choices" but names none.

### A26 — Low: latent renderer defects, silent link dropping, unguarded page script, hard-coded dates

**Component attacked:** `scripts/build.mjs`, `src/read.js`, `src/shell.html:17`, `:53`.

**Argument:** None is triggered by the current documents (verified: `dist/` is byte-identical to a fresh build; CSP has no inline styles or handlers; href allowlist rejects `javascript:`; no duplicate ids or dangling anchors). Latent, all reproduced with synthetic input through the build's own functions: a pipe inside a code span in a table cell splits the cell; a paragraph continuation line beginning `NNNN. ` becomes an ordered list; a blank line inside a list splits it; a URL containing `)` truncates; single `*` pairs become `<em>`; a literal `@@FOO@@` in either document throws "Unresolved template marker"; any relative link other than the two hard-coded names becomes plain text with no warning, so a future `docs/design-review.md` link would silently vanish. `read.js` throws if any expected element is missing and has no `IntersectionObserver` guard; the search index includes the literal `#` of every heading link so a `#` query matches every section. Two hard-coded "14 October 2026" strings will drift from `docs/design.md:3`.

**Remediation:** Warn on dropped links; derive the date from the design header; add the three renderer cases to a tiny fixture test.

### A27 — Low: process hygiene: brief 01 mixes reviewer, corrector and ruling-recorder; dangling file; hosting handle in a public README

**Component attacked:** `docs/streams/bodferd/brief-01…md:10-11`, `:23`, `:44`; `README.md:7`.

**Argument:** Brief 01 asks one worker to write the independent review, "apply authorized documentation corrections" to the design it reviewed, and record the human ruling, which blurs invariant 2. Its front matter derives `gate: model` from four "no" risk answers for approving a security-incident protocol, while the body says only a human can approve; the metadata is what statusgen derives from. It lists `docs/design-review.md` under `files:` as if present; it does not exist. The README publishes the owner-private page URL, exposing the hosting account handle and platform for a confidentiality-focused project; the page's privacy rests on that platform, not on anything in the repo. The Discord enumeration consequence (an attacker can list which nodes have a confidential channel and target the rest) is implied at `:11` and `:325` but never stated.

### A28 — Low: the reply-key possession step makes the operator CLI a decrypt-and-sign oracle unless it validates the plaintext first

**Component attacked:** `:124`; `bodferd registration prove`.

**Argument:** The CLI decrypts a relay-chosen ciphertext with the operator's long-term age identity and signs a digest of the result. Nothing says the client must parse the fixed format and check the embedded challenge ID, service and environment before signing. A malicious relay could substitute a stored maintainer-to-operator reply ciphertext and obtain a signed hash of its plaintext. Exploitability is low because replies contain unguessable identifiers, but the rule at `:124` ("no endpoint/helper accepts arbitrary ciphertext for decryption") is written for the server and must also bind the client.

### A29 — Low: framing and field-name ambiguities

**Component attacked:** `:160`, `:96-97`, `:174`.

**Argument:** "One file and a message" but "exactly one attachment": a message-only report needs a zero-length attachment and its `name`/`media_type` are unstated. `issued_at`/`expires_at` mean record creation and 30-day certificate expiry in the registration and the 5-minute challenge window in the outer manifest; the registration record has no field for the challenge expiry it must satisfy. Ed25519 verification strictness (canonical S, small-order points) is not pinned.

### A30 — Low: the ratchet citation is stale for a 2026 pin

**Component attacked:** `:365`.

**Argument:** Current libsignal releases ship a post-quantum ratchet (SPQR, "triple ratchet") by default, so "Double Ratchet" is no longer the property a pinned release provides. The hedge at `:365` is correct; the citation list should name the actual ratchet so independent review scopes it. (Verify the announcement date against signal.org before relying on this.)

## Contradictions between design.md and security-review.md

| Review item | Review required | Design status |
|---|---|---|
| R03 | record validation height; define staleness/unavailability | height only in registrar attestations; no staleness bound (A07) |
| R08 | separate labelled emergency lane if needed | absent; hard "never fall back" (A01) |
| R10 | prefer onion mailbox plus content-free email notification | attached email kept without recorded reason (A08) |
| R12 | production refuses test configuration and vice versa | not stated; Row 10 claims separation by keys/routes (A17) |
| R13 | reserve incident capacity | quota only (A19) |
| R18 | Sigsum-style release proofs | "authenticated releases" with no signer or mechanism (A02) |
| "ten controls summarized in the review" (`design.md:5`) | no such summary exists; the review has 19 findings | A22 |

## Checked and judged adequately handled (not findings)

Outer manifest binds the comms key and epoch transitively through `registration_sha256`; mail-bundle component substitution is prevented by the outer manifest binding registration, policy and ciphertext digests with maintainer re-verification; cross-submission response replay is prevented by the response manifest; the status-capability hash stops token swapping; Ed25519-over-prefix‖JCS is correctly kept separate from Cosmos and age keys; jail as warning, bond-provider exclusion and shared operator quota; mailbox never sender-controlled; receipt is not delivery proof; no anonymity from the relay and Discord enrollment excluded from the Tor-only promise; witnessed label cannot be upgraded; compromised-recipient freeze rather than silent re-route; libsignal bindings, support boundary, AGPL and FoundationDB statements are accurate as far as they go; `ServerZkAuthOperations` characterisation is accurate; `dist/` reproducible; CSP clean; href allowlist safe.

## Remediation path

1. Human decisions first (brief 01's ruling should not be made without them): emergency lane (A01); separation rule and named roots (A02); policy lifecycle (A03); maintainer roster (A04); transport (A08); messaging stack lead (A21 vs A10/A11).
2. Then a design revision brief resolving A05, A07, A12–A17, A23, A28, A29 as exact-bytes specifications with fixtures; see `docs/streams/bodferd/brief-02-…`.
3. Website wording (A22) and renderer hygiene (A26) can land independently.

No file under review was modified except by appending `Z>>>`…`<<<Z` annotations. No service, key, identity, email or deployment was created. This review does not approve the design.

## Dispositions

Revision owner: this documentation session. External review source: commit `26afc0502ba2090cac9e48e15b93c8a1d5737a21`. Original arguments above are retained. “Resolved in draft” describes a specification change only, not implementation or independent verification. The external reviewer must re-check these dispositions. User chat rulings are recorded in docs/review-decisions.md; no key/role holder has been appointed by this revision.

- A01: Accepted user ruling: existing public make-relay contact requests plus monitored follow-up; no unverified upload API. Confidential pre-enrollment requirement and delay/outage residual risk are explicit.
- A02: Resolved authority rule under user ruling: maintainer-side plus independent approval; bootstrap identities/channels/release root remain unprovisioned launch gates, never invented.
- A03: Revised under owner blockchain steering: no daily reapproval; dual-authorized changes anchored on chain with fresh independently verified complete history. Exact publication carrier/light-verification path is unproven and blocks implementation readiness; reviewer must assess replacement freshness model.
- A04: Resolved under user ruling: explicit any-of maintainer reader roster, display/dual approval, bounded retention and agreed on-call targets; actual readers/keys remain unprovisioned.
- A05: Resolved in draft: core/full digest split, public core marker, restricted ADR-036 envelope; adapter compatibility remains unproven.
- A06: Resolved in draft: relay/bot/Discord trust is explicit; application author and separate registrar organizations required.
- A07: Resolved in draft: independent archival verifier, recorded height/source/time, pilot staleness bounds and incomplete-history outcome.
- A08: Resolved in draft under user ruling: attached encrypted email plus authenticated Tor recovery/index, bounded acknowledgement-based retention, measured wire-size caps, provider/bounce prerequisites; no provider ownership claimed.
- A09: Resolved in draft: escrowed onion identity, fenced writer, encrypted metadata backups, rollback/revocation recovery and explicit body-loss/migration outcomes.
- A10: Resolved in candidate draft: libsignal is cryptographic reuse within a new non-Go messenger; group app/infrastructure burden and proposed per-device departure are explicit, subject to interoperability before selection.
- A11: Resolved in draft: stock Signal excluded from compliant candidate set; manual advisory association is outside Bodferd.
- A12: Resolved in draft: v1 reply registration equals sender; replacement requires fresh same-parent authorization and bound response evidence.
- A13: Resolved in draft: digest preimages, pre-challenge context, parent dedup tuple and exact inner/outer comparisons.
- A14: Resolved in draft: no delegate self-renewal; explicit recovery mode; normal versus emergency reservation/dispatch outcomes.
- A15: Resolved in draft: evidence consumes registration challenge; separate 10-minute possession reservation.
- A16: Resolved in draft: six status cases and operator-address-change behavior; release enum compatibility remains a prerequisite.
- A17: Resolved in draft: disjoint test/production authorities, configuration/state separation and startup refusal.
- A18: Resolved in draft: relay censorship, withholding, dishonest status, graphing and freshness-window risks are explicit.
- A19: Resolved in draft under A01 ruling: separately reserved enrolled message-only capacity, bounded verification workers and attachment deferral; no anonymous upload lane.
- A20: Resolved in draft: assigned launch owners, inert canaries across real paths, on-call targets and independently published aggregate health; selective censorship remains possible.
- A21: Resolved under user ruling: MLS leads investigation, libsignal remains alternative; AS/DS separation, actual binding/audit gates, group metadata, zkgroup issuer authority and lack of group/credential deniability are explicit.
- A22: Resolved in draft/page: nineteen findings mapped to ten requirements, future-tense provisioning claims, direct-path availability and archival visual-evidence limitation.
- A23: Resolved in draft: relay receipt key signs response challenges; historical response verification plus independent revocation freshness.
- A24: Resolved in draft: send consent, recipient retention/access prerequisite and scoped local purge without secure-erasure claim.
- A25: Resolved in draft: credentials authorize, directory routes; re-key blocks until authenticated replacement/possession; monotonic sequence and freshness checks.
- A26: Resolved in reading code: tested code/table pipes, paragraph/list boundaries, balanced URLs, literal template markers, warned unsupported links, derived date and guarded optional page enhancements.
- A27: Resolved documentation process: reviewer cannot correct and self-verify; approval brief is human-gated, uses existing review artifact, revisions have separate ownership; public README omits private hosting handle; Discord enumeration risk explicit.
- A28: Resolved in draft: parse fixed possession plaintext/context before signing only random-token digest.
- A29: Resolved in draft: zero/one-file framing, distinct certificate/challenge times and strict Ed25519 verification.
- A30: Resolved in draft: verified primary SPQR announcement dated 2025-10-02; actual pinned behavior requires review.

## Subsequent draft addition — operator teams

The owner requested multi-person node operations after the external review and its remediation. The draft now adds scoped member IDs, per-member epochs/revocation, exact member bindings in both manifests/reply replacement, shared quotas and optional encrypted attribution. Original review arguments and A01–A30 dispositions above are preserved as historical records; they do not independently verify this newer change. Re-check particularly A05/A12/A13/A14/A19/A24/A25 against the revised member model and its required scenarios before implementation.
