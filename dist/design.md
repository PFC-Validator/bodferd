# Bodferð — secure THORChain communications design

Status: design, not implemented. Updated 2026-10-14. User requested integration of the security review and a public `make relay` key-registration option, then selected finishing the protocol design before building the CLI/service.

This is the controlling design for the proposed relay. It groups the nineteen original findings (R00–R18) from the [findings register](security-review.md) into ten controls. The external review and per-finding dispositions are retained in [adversarial.md](../adversarial.md). These are design requirements, not controls proven by implementation. CLI names and API paths below are proposed contracts, not implemented commands. Repository: [PFC-Validator/bodferd](https://github.com/PFC-Validator/bodferd). Bodferd is the ASCII project name; Bodferð is the display name. Existing THOR-RELAY wire markers below remain proposed v1 identifiers, independent of branding.

## How a report is delivered

Bodferð is a proposed way for THORChain node operators to send private reports and files to maintainers. **You submit through Tor; maintainers receive an encrypted email attachment.**

In the proposed first version:

1. **You register your identity.** Prove that you control an eligible node and authorize a separate communication key.
2. **You prepare a report on your computer.** The Bodferd command-line tool signs your message and optional file, then encrypts them for the approved maintainers.
3. **You send it through Tor to a relay.** The relay checks your authorization and forwards the encrypted package to the designated maintainer mailbox. It cannot read the contents.
4. **A maintainer decrypts and verifies it locally.** Their tool checks who sent it and whether anything changed before presenting the report. If email fails, they can retrieve the package directly through Tor while it remains retained.
5. **You check for acknowledgement through Tor.** A signed maintainer acknowledgement confirms receipt; an email delivery status alone does not. The design also allows an encrypted reply through the same private status channel.

Discord carries public registration announcements. The blockchain helps verify node authority and the current approved recipient policy. Neither carries your confidential report.

The first version is a reporting channel. Private conversations and group chat are a later direction. The CLI and relay are not implemented.

## Outcome and privacy promise

A recognized node operator can submit an authenticated confidential message and file to the THORChain maintainer over Tor without disclosing plaintext to the admission service or email provider. Public node-authenticated announcements can bootstrap a separate communication signing key and an age recipient key. Maintainer keys are authenticated through an independently trusted maintainer policy; current approved policy is published by a finalized on-chain commitment, subject to the publication adapter acceptance gate below.

The admission relay learns the submitting node identity, time and ciphertext size. The maintainer learns the sender and report contents. Public registration announces participation and may link communication keys to a node. Attackers can enumerate enrolled nodes and target both participants and nodes without an established confidential channel. Email providers learn the relay, recipient, time and approximate size. The system does not promise anonymity from the admission relay, deniability of signed reports, forward secrecy with static age keys, or protection after compromise of a plaintext endpoint. A malicious relay can refuse challenges or renewals selectively, suppress uploads, delay dispatch, omit evidence, lie about delivery status, withhold replies, and correlate node/key/recipient changes across epochs. It can withhold newer policy information until the independently enforced freshness deadline; it cannot make its own signatures prove honest delivery or chronology. Independent refresh and monitoring limit this exposure but cannot establish absence of selective censorship. These boundaries must appear in CLI documentation.

Production destination: `itzamna@thorchain.org`. Test destination: `pfc@pfc.zone`. These are user-provided routes; neither an email string nor this document establishes ownership of an age identity. No public keys, trusted maintainer roster, new onion address or mail-provider configuration have yet been provisioned.

## What the existing Discord relay supports

The official node-launcher README describes general node messages sent to a public development Discord channel, subject to anti-abuse restrictions. THORChain's release documentation explicitly describes publishing an age public key with `make relay` to receive an encrypted patch. The proposed registration fits that documented purpose; this is not evidence of permission to automate channel access or of a public registration/export API.

The existing command signs and broadcasts. It must never receive a confidential report. A public key or registration digest is suitable public content. Source inspection found the existing signed envelope to be `{msg:{text,channel,uuid},signature,pubkey}`, with the signing input `UUID|Channel|Text`. The CLI invokes preparation and broadcast; it does not export a reusable proof of delegation as its documented result.

Discord is an announcement/witness channel, not the authoritative key database. A username, screenshot, copied bot message or Discord message ID is not a node signature. Do not claim that a new service can automatically verify unmodified `make relay` output without acquiring its original signed envelope or introducing a trusted witness.

Evidence inspected on 2026-10-14:

- [Node-launcher README, pinned source](https://gitlab.com/thorchain/devops/node-launcher/-/blob/4467f8d64eb6ca0b8e8ec09f77f37227d3ae9252/README.md) and [launcher relay wrapper](https://gitlab.com/thorchain/devops/node-launcher/-/blob/4467f8d64eb6ca0b8e8ec09f77f37227d3ae9252/scripts/relay.sh).
- [THORChain release documentation](https://dev.thorchain.org/release.html), section Mainnet Release (Private Image).
- THORNode `develop` source: [relay](https://gitlab.com/thorchain/thornode/-/blob/develop/common/relay/relay.go), [signing helper](https://gitlab.com/thorchain/thornode/-/blob/develop/common/sign.go), and [query command](https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/client/cli/query.go). The helper uses the Cosmos account keyring; consensus and TSS keys are not communication signers. An operator's installed release/configuration still needs a compatibility check.

## Key roles and custody

| Key | Purpose | Private-key custody | What possession proves |
|---|---|---|---|
| Node Cosmos account key or exact on-chain operator account key | Authorize/revoke communication delegation | Existing local node keyring or operator wallet | Account authority, after independent chain-state validation |
| Operator communication Ed25519 key | Sign registration possession proof, content and submission manifests | Operator workstation, encrypted storage or supported hardware signer | Control of the delegated communication key |
| Operator age identity | Decrypt replies and controlled registration challenge | Operator workstation or supported protected identity | Ability to decrypt to the registered recipient |
| Maintainer age identity | Decrypt reports | Maintainer environment; absent from relay/cluster | Ability to decrypt reports to the authorized maintainer recipient |
| Maintainer operational Ed25519 key | Sign acknowledgements and key-possession statements | Maintainer environment | Control of a role-authorized acknowledgement key |
| Offline policy authority Ed25519 keys | Authorize maintainer roles/recipients, registrars, service identities and emergency revocations | Independent offline administrators | Policy authority established out of band |
| Relay operational Ed25519 key | Sign challenges, admission receipts and status | Relay; short-lived policy-authorized key | A statement by the relay, not proof of maintainer delivery |
| Existing THORChain relay/bot credentials | Publish public announcements after upstream node-signature checks | Existing THORChain relay/bot operator, outside Bodferd | Bot-origin authenticity only; compromised upstream can forge announcements believed by witnesses |

Use separate signing and encryption keys. Native age encryption keys are not message-signing keys; do not convert an age identity into an Ed25519 signer or derive communication secrets from a node signature. Key generation and private-key storage occur locally. Documentation may show public keys/fingerprints but must not print private identities or mnemonics.

The proposed v1 communication signature scheme is Ed25519. Use a standard implementation and independently reviewed protocol composition. Native X25519 and supported hybrid post-quantum age recipients are acceptable only when explicitly selected by policy and supported by both ends. The owner approved an explicit maintainer roster: reports use age any-of encryption to every active approved report recipient, and all those recipients can read the same plaintext. The CLI shows the complete reader set; no implicit recovery reader is added. Do not silently add a sender recovery recipient, mix encryption modes, accept password-only encryption or execute arbitrary plugins selected by a server-provided key.

## Independent trust and recipient policy

The CLI obtains its initial trust bundle independently of the upload relay. The production authority requires a maintainer-side signer and an independently administered signer for policy changes; the relay administrator must not control both. Registrars likewise come from separate administrative organizations. Each maintainer countersigns its exact roster entry with its acknowledgement key and proves age key possession. Those proofs establish possession; the policy threshold and independently confirmed identity establish the role.

Initial signer names, organizations, release-signing fingerprint, authorized on-chain publisher accounts and fingerprint-confirmation channels remain **unprovisioned launch prerequisites**. Record them in a public bootstrap manifest, approved by the maintainer-side and independent signers. Operators confirm the bootstrap digest/fingerprints through two preexisting authenticated channels, including one controlled by maintainers independently of the relay; do not invent a trusted website/account or accept a Discord display name. Signed releases carry the same bundle and build provenance, with a pinned release signer and transparency/inclusion evidence where available (for example Sigsum). A release signature alone cannot override locally confirmed policy roots. Root recovery requires the same independently confirmed replacement process, not a relay-delivered update.

Test and production root-authority, release-verification, registrar, relay-receipt, maintainer acknowledgement and age key sets must be disjoint, with separate onion identities, stores, mail credentials, publisher accounts and fixed routes. Every process chooses one environment before loading configuration and refuses cross-environment bundles/state; startup checks reject overlapping key fingerprints or wrong mailbox/chain/service values. A runtime flag cannot turn a production process into a test relay. The explicitly weaker single-authority test bundle is synthetic-data-only and cannot authorize production.

### Approved roster and policy body

The threshold-signed policy body is exactly:

```text
version, environment, chain_id, service_id, policy_sequence,
previous_policy_sha256, issued_at,
maintainer_roster: [{id, report_age_recipient, acknowledgement_ed25519,
                    role, accepts_new_reports, entry_possession_evidence_sha256}],
routing: {mailbox, on_call_maintainer_id, acknowledgement_target_seconds},
relay_receipt_keys, registrar_keys, registrar_threshold,
authorized_publishers, permitted_registration_assurances, historical_policy_admission,
eligibility, resource_limits, retention, revocations
```

A separate envelope contains policy signatures and maintainer entry/possession evidence. Every roster entry has a stable ID, exact canonical recipient, independent acknowledgement key and explicit role. Reports encrypt to all and only entries with `accepts_new_reports:true` and role `report-reader`; empty sets block preparation. Canonical order is lexicographic by ID, unique IDs/recipients required, with a pilot maximum of eight active readers to bound evidence and age-header work. Each entry and its full possession evidence must fit the existing metadata limits. Backup/on-call readers are real plaintext recipients, not routing aliases. Names, keys and mailbox-access readers remain unchosen. The fixed production mailbox is `itzamna@thorchain.org`, test mailbox `pfc@pfc.zone`; policy must match deployment routing. No client controls mailbox, CC or BCC. Mailbox readers without an authorized age identity see ciphertext only; any shared decryption access must be disclosed as reader expansion.

For possession, `entry_authorization_sha256` hashes JCS of the roster entry excluding only `entry_possession_evidence_sha256`; this avoids a circular evidence hash. Each recipient proves possession with a fixed-format service/environment/entry-authorization-digest-bound encrypted token, validated before signing as for operator possession; no arbitrary decrypted-plaintext hashes. The acknowledgement key countersigns the complete resulting entry using purpose `maintainer-entry`; possession evidence uses `maintainer-key-possession`, never a report/response purpose. The policy signature threshold authorizes each roster addition/removal and recipient change. The CLI compares independently verified current policy with the relay's stored digest before encryption; mismatch fails, without an ignore option. The service compares the same policy at admission and dispatch. Neither holds maintainer private age identities.

Pilot acknowledgement target: on-call maintainer fetches and acknowledges an inert canary within 30 minutes and urgent real-report receipt within one hour; these are unmeasured launch targets requiring explicit maintainer agreement, not promises already in force. Escalation goes to the approved backup/on-call roster. If no reader is available, status remains unacknowledged and Tor recovery remains available until the bounded deadline. Key loss of one reader need not lose the report while another approved reader remains; loss/compromise of all reader keys cannot be repaired by the relay. Adding a reader later cannot grant access to an already encrypted report without sender/maintainer re-encryption and explicit consent.

### On-chain publication instead of daily reapproval

Owner steering for A03: use the trusted blockchain to publish policy changes, rather than add daily offline approvals or independent online freshness signers. **Authorize a policy once when it changes; verify its currentness against a fresh independently verified chain head when using it.** An unchanged policy is not re-signed every day. The chain establishes publication and order; it does not grant an arbitrary poster maintainer authority. Every accepted policy still needs maintainer-side plus independent authorization.

Proposed publication is a compact commitment in a successful finalized native THORChain transaction from a policy-authorized dedicated publication account: ASCII `BODFERD-POLICY-V1:<environment>:<service_sha256>:<policy_sequence>:<policy_sha256>`, with SHA-256 of the canonical onion hostname UTF-8 for `service_sha256`. The complete canonical policy, threshold signatures and possession evidence are mirrored on at least two independently operated onion endpoints; only public trust metadata goes on chain. No report, node communication secret, status token or incident content is published. An unavailable current policy body blocks reporting; it cannot justify using an older key.

The [official native CLI transaction example](https://dev.thorchain.org/cli/overview) documents `/types.MsgSend` with a transaction memo. That is evidence of a candidate carrier, **not a tested arbitrary-commitment protocol**. Before adopting it, prove the exact supported message/memo encoding, non-financial side effects, fee/funding ownership, successful inclusion/result, finality verification, pruning/index availability and replay-safe scan behavior against pinned THORNode releases. Never use an unrecognized `MsgDeposit` memo or a privileged node key as a shortcut. No transaction is authorized by this document. If the carrier fails, return the design to the owner for a different on-chain publication mechanism; do not silently substitute the prior daily-signing design.

A pinned genesis bootstrap checkpoint defines authority, authorized publisher accounts, service/environment and the starting policy digest/sequence. An independently operated verifier scans every successful transaction from that checkpoint through a consensus-verified fresh finalized head, with durable cursor/block hashes and no gaps; REST search/index completeness alone is not proof that no newer update exists. Clients use a supported light-verification route with completeness evidence or their independently operated full verifier over Tor; a single relay-provided “latest policy” response is insufficient. The exact light/completeness proof remains an implementation gate, not an invented THORChain API. A direct full-node verifier is the fallback candidate, and its operating/trust cost must be disclosed.

An update must match service/environment, an authorized publisher from the preceding policy, valid dual policy signatures, `policy_sequence = previous+1`, and `previous_policy_sha256` equal to the last accepted body. Repeated identical commitments are idempotent; foreign publishers and demonstrably invalid policy signatures cannot change state. Missing bodies, gaps or conflicting otherwise valid same-sequence updates suspend new admission and require independent resolution; never pick whichever the relay returned first. Publication-account compromise can cause withholding/spam/availability problems but cannot substitute a recipient without both policy approvals. Changing publishers/roots follows the preceding policy's authority rules. Emergency revocation/freeze is an authorized policy update; root compromise requires out-of-band recovery.

Clients persist highest accepted policy sequence, digest and verified chain checkpoint. Pilot chain freshness uses the 120-second/two-block bounds below; a stopped chain, unverifiable history or missing latest body yields an explicit unavailable state. There is no 24-hour expiry on the offline recipient policy and no reapproval ceremony. Individual relay/registrar/role credentials still have scoped validity and cannot be self-renewed. Chain publication is permanent and publicly reveals policy/recipient changes; confidentiality of incident traffic does not extend to that governance metadata.

A registration's policy digest is its issuance authority reference, retained for historical verification. During its at-most-30-day life, new admission uses the latest verified policy to check current allowed assurance, parent/key revocations and eligibility; it does not demand that the issuance digest equal today's policy. Report inner/outer manifests instead name the current preparation/admission policy. An unaccepted ciphertext prepared under N may be retried under N+1 only if the active reader-set digest, routing, registration authority and relevant limits/revocations remain unchanged and N+1 explicitly permits historical-policy admission; otherwise fail with `policy-changed` and require deliberate new preparation/new ID. Never rewrite the signed inner policy. Already accepted reports retain N and their original reader set through normal rotation. Compromised-recipient reports are quarantined visibly; the relay cannot re-encrypt them.

## Operator registration and delegation

### Registration record

The CLI prepares the stable registration core locally, then obtains a relay-signed challenge bound to its digest:

```json
{
  "version": 1,
  "purpose": "thor-node-relay/register",
  "environment": "test",
  "enrollment_mode": "node-signature-verified",
  "chain_id": "<configured-chain-id>",
  "service_id": "<independently-pinned-onion-hostname>",
  "registration_id": "<random-32-byte-base64url>",
  "node_address": "<node-account-address>",
  "authorizer_role": "node-account",
  "authorizer_address": "<node-account-or-operator-address>",
  "communication_ed25519": "<32-byte-public-key-base64url>",
  "reply_age_recipient": "<native-age-public-recipient>",
  "permissions": ["report.submit", "report.status"],
  "key_epoch": 1,
  "previous_registration_sha256": "",
  "change_mode": "initial",
  "policy_sha256": "<64-lowercase-hex>",
  "record_created_at": 0,
  "certificate_expires_at": 0
}
```

Placeholders and zero times above illustrate types; this is not a usable registration. Times are integer Unix seconds. The authorizer role is exactly `node-account` or `operator-account`; derive the account address from the verified authorizer public key. Match it against the node's account or `node_operator_address` using independent chain state. Other bond providers are not authorizers.

`registration_core` is exactly the object above, without transport challenges or signatures. `record_created_at` and `certificate_expires_at` describe the certificate, bounded to 30 days; they are not challenge timestamps. `change_mode` is `initial`, `rotation`, `renewal` or `recovery`. Initial records use epoch 1 and an empty previous digest; subsequent records name the previous registration and increment its epoch by one. Recovery carries an explicit lost/compromised-key reason in authorizer evidence and cannot clear a policy freeze.

The parent authorizes `registration_core_sha256 = SHA256(JCS(registration_core))`. A challenge refresh does not change the public marker or parent signature while this core remains valid. Changes to a core, including creation/expiry times, keys, assurance or policy, require new parent evidence. The separate registration challenge is a relay-signed object with `version, purpose, environment, chain_id, service_id, registration_core_sha256, challenge_id, challenge_nonce, challenge_issued_at, challenge_expires_at`.

`registration_challenge` above is the challenge payload; its relay signature is stored beside it. `registration_full` is exactly `{registration_core, registration_challenge}` and includes that payload only. Its digest, `registration_sha256 = SHA256(JCS(registration_full))`, identifies the activated certificate used in reports. Parent evidence and possession signatures travel beside this object and are not part of either digest. Communication possession binds both digests and the exact challenge. The original authorizer evidence is required; a service-issued certificate cannot replace it.

The exact public announcement is:

```text
THOR-RELAY-REGISTER-V1 sha256=<registration_core_sha256>
```

Publish only this marker/digest using unmodified `make relay`. The CLI displays the record and fingerprints for operator inspection before copying the announcement text. Publication is a user act; the confidential CLI does not automatically invoke `make relay`, post to Discord, or add a direct-network exception. Direct public-key announcements can supplement the digest; an age-only announcement never authorizes a signing key.

### Establishing authorizer evidence

There are two explicit verification paths:

1. **Direct cryptographic evidence (preferred).** A separate sign-only node/wallet adapter signs the restricted off-chain envelope below. Alternatively, import the original signed `make relay` envelope if a compatible exporter supplies it. Verify the exact legacy signed bytes and supported account-key algorithm, derive the account address, compare `msg.text` exactly to the announcement, enforce the configured channel if relevant, and match the core digest. The core's certificate expiry and epoch, plus the separately consumed relay challenge, prevent replay; do not assume the old Discord UUID-prefix mechanism provides this service's replay protection. Preserve the original evidence for maintainer verification. No signature-export functionality is assumed to exist today.
2. **Witnessed unmodified `make relay` (explicit weaker assurance).** If raw evidence is unavailable, independently trusted registrars view the announcement in the configured Discord guild/channel through the recognized relay bot, match node identity and core digest to the immutable registration core, check fresh chain authorization, and sign attestations. Production requirement: two distinct policy-authorized registrars. Each attestation binds the core digest, guild/channel/message IDs, expected bot author ID and application ID, observed node, validation height/time/source, registrar identity and expiry. Registrars verify the actual message author/application, not display names, embeds or webhook text. Two signers must belong to separate administrative organizations and collect evidence independently; two views of the same bot are not independent cryptographic verification of the node signature. A message ID/screenshot alone is never accepted. This explicitly trusts the THORChain relay-server/bot operator to check the node signature, Discord to present the authentic message, and the registrars and is labeled `registrar-witnessed`; it must be explicitly allowed by signed policy. Otherwise unmodified `make relay` is only a public witness and sign-only evidence remains required.

Assurance labels are preserved in every submission bundle and shown by recipient tooling. A witnessed record cannot be silently upgraded to `node-signature-verified`. The preferred long-term automated path uses cryptographic evidence, without a live Discord dependency for routine reports. No compatible sign-only adapter or envelope exporter has been demonstrated. Until one passes interoperability checks, the only documented enrollment path is registrar-witnessed, and deployment must either explicitly authorize that weaker path or remain closed. Do not advertise raw-signature enrollment as available.

### Unenrolled incident contact: existing public channel

User ruling for A01: do not add an unverified Bodferd upload endpoint. An unenrolled operator uses existing `make relay` to publish a short, non-sensitive request for maintainer contact/enrollment. No confidential report, attachment, secrets or report ciphertext enters that workflow. The public digest announcement remains appropriate when a registration core has been prepared.

A designated channel-monitoring role checks the expected guild/channel and bot author/application IDs, records follow-up privately and directs enrollment; a notification is not proof of a node signature without the original envelope or authorized registrar evidence. Production requires a named monitor, backup monitor and tested paging/escalation procedure. Monitor outages, Discord/bot outages and enrollment delay can still prevent emergency confidential reporting. This residual A01 risk is accepted by the owner's choice of public contact over a separate anonymous lane, and must be displayed before enrollment. The normal verified lane must never be relabeled as unverified after failed authorization. Advance enrollment remains strongly recommended for incident readiness.

### Restricted parent signing envelope

The sign-only adapter proposes Cosmos ADR-036 `sign/MsgSignData`, subject to a compatibility test against the supported THORNode/wallet release. It must not fall back to transaction signing or sign a caller-supplied raw prehash. The UTF-8 data is exactly `THOR-NODE-RELAY/v1/authorize-registration\n` followed by JCS `{version:1, environment, chain_id, service_id, registration_core_sha256}`. No trailing newline is added. `data` uses canonical padded base64 of those bytes.

The Amino sign document has exactly `account_number:"0", chain_id:"", fee:{amount:[],gas:"0"}, memo:"", msgs:[{type:"sign/MsgSignData",value:{signer:<authorizer_address>,data:<base64>}}], sequence:"0"`. The adapter constructs this document itself and uses the SDK/wallet's canonical Amino sign bytes, not the report JCS encoder. The outer off-chain chain ID is empty; the actual network is bound inside the application data. Verify SHA-256 of those Amino sign bytes with canonical secp256k1 signatures (low-S, 64-byte r||s) and the 33-byte compressed public key; derive and compare the configured THORChain account address. Pin the pubkey type `tendermint/PubKeySecp256k1`; reject unknown sign modes, extra messages, fees, memo, sequence or nonzero account number. Retain complete sign document, public key and signature for independent verification. The legacy imported relay envelope remains a distinct verification path over its documented bytes.

[Cosmos ADR-036](https://github.com/cosmos/cosmos-sdk/blob/main/docs/architecture/adr-036-arbitrary-signature.md) is an upstream draft, not proof that a THORNode release exposes this command. Exact SDK serialization and positive/negative cross-wallet fixtures are prerequisites to enabling the adapter. If unsupported, enrollment fails explicitly instead of requesting a transaction-shaped signature.

### Confirming control and accepting registration

The communication key signs the full/core digests and registration challenge with the `registration-possession` purpose. Once parent evidence, certificate validity and this signature pass while the registration challenge is live, the relay atomically consumes that challenge and stores an `evidence-verified` reservation. Identical replays return the same reservation/result; conflicting records fail. A fresh challenge may rebind the same core before activation; only one full record may activate that core/epoch.

The relay generates a new 32-byte random token and encrypts a bounded JCS possession object to the reply recipient. The exact decrypted object is `{version:1,purpose:"thor-node-relay/reply-key-possession",environment,chain_id,service_id,registration_core_sha256,registration_sha256,challenge_id,challenge_nonce,challenge_issued_at,challenge_expires_at,token}`. The client verifies every context field against its local pending record and the relay-signed challenge, integer times, allowed schema and canonical token encoding **before signing**. It signs a `reply-key-possession` statement containing the context and `token_sha256` (decoded token bytes); it never signs a hash of arbitrary decrypted plaintext or accepts a reply/report as a possession challenge. Decryption/parser failures share a generic error class. This local helper is not a general decryption/signing endpoint.

Proposed limits: direct registration challenge 15 minutes, witnessed challenge 48 hours, then a separate possession reservation of 10 minutes from successful evidence verification; certificate validity at most 30 days. The registration challenge need not remain live during the subsequent possession step: evidence at minute 12 and possession at minute 17 is valid, if the new 10-minute window and certificate still hold. Bound attempts globally and per parent; expired reservations require fresh challenges and evidence evaluation. Activation atomically consumes the possession reservation and creates the certificate. Both keys must be demonstrated. Longer witnessed windows reserve no upload capacity.

Registration states are `pending -> evidence-verified -> active`, with possession verified in the activation transaction, or `rejected/expired`. Current parent authority and chain eligibility are checked at activation and every new admission. Jail is a visible warning, not an independent prohibition on incident reports. The six node-status cases must be implemented explicitly:

| Status | New verified reports |
|---|---|
| Active | Allowed with current exact account relationship |
| Standby | Allowed with current exact account relationship |
| Ready | Allowed with current exact account relationship |
| Whitelisted | Allowed with current exact account relationship |
| Disabled | Recovery assurance only, with policy-authorized parent evidence |
| Unknown / missing / unrecognized | Reject normal admission; no implied account authority |

This is a proposed eligibility policy, not a claim that all installed releases expose identical status strings. Release compatibility checks must confirm the complete enum. A changed `node_operator_address` immediately invalidates new reports under its former operator-account certificate; node-account certificates remain dependent on their own unchanged exact address/status. Failed chain verification never silently downgrades a verified report to anonymous.

### Chain evidence and historical verification

Before activation/admission, record `validation_height, validation_block_hash, validation_block_time, validation_observed_at, validation_source_id, node_address, node_status, authorizer_role, authorizer_address, observed_operator_address` in a signed admission receipt and complete evidence bundle. Require an independently operated verifying full node; relay-owned or submitter-owned REST results alone are insufficient. A maintainer-controlled archival verifier retains block/header and node/operator relationship history for the entire 30-day report verification window, and operators/maintainers configure its identity separately from relay administration. Its access may be through Tor or authenticated snapshots; it is not a client-selected URL. Multiple REST sources are a weaker availability heuristic and cannot replace this gate without a recorded policy change.

Pilot freshness proposal: latest verified chain observation at most 120 seconds old, head lag at most two blocks against the independently observed head, and client clock skew at most 120 seconds. These are unmeasured defaults; test chain stalls, lag and skew before production, then put the confirmed bounds in policy. Unavailable or stale verification blocks new verified admission, with a distinct error. Dispatch retains the accepted evidence: a later node exit does not retrospectively invalidate an authenticated report. The maintainer verifies historical authorization against its independently retained history, not solely relay snapshots or receipt timestamps. Do not assert cryptographic inclusion proofs for THORChain state until the supported state-proof format is demonstrated. Historical verification unavailable is an explicit incomplete-authentication result, never “verified.”

### Renewal, rotation and revocation

Each fresh epoch requires a new parent-authorized registration or permitted registrar attestation. A communication key cannot renew its own authority at all; every new certificate/epoch requires fresh parent authorization. Normal key rotation additionally signs continuity with the previous communication key and proves possession of the new keys. Lost/compromised old keys use parent-authorized recovery; never infer authority from control of an email address or Discord account.

Old registrations become superseded for new admission at activation of the new epoch. Normal rotation/renewal honors an already granted upload reservation until its original deadline under the original certificate/policy; it neither extends the reservation nor changes the immutable signed report. Emergency key/parent revocation or recipient compromise quarantines such uploads and queued reports with a visible reason. Supersession or ordinary node churn after acceptance does not drop a receipted report. First dispatch rechecks recipient/routing incident policy and any emergency freeze, while preserving admission-time authorization; a hold is explicit and bounded by retention. Registered reply-key changes are treated as key rotation, not an unauthenticated profile edit. No certificate authorizes accounts or recipients outside its fixed service/environment/chain.

A communication key may revoke itself. Parent-authorized revocation and threshold policy-authority emergency freezes can revoke an entire parent or certificate. A new announcement does not automatically clear an emergency freeze. Clients/relay reject revoked keys for new reports. Maintain revocation epochs and effective times durably; retain enough policy evidence for historical verification. A receipt issued by a compromised relay is not a trustworthy timestamp proving a stolen key was used before compromise. On-chain policy publication establishes a revocation order, not an authentic creation timestamp for an off-chain report/response. A separately reviewed independent timestamp or individual report commitment would be needed for that stronger claim; incident reports are not publicly committed by this protocol.

## Message protocol

All application signatures use Ed25519 over `UTF8("THOR-NODE-RELAY/v1/" + purpose + "\n") || JCS(payload)` with distinct purposes for registration possession, content, submission, acknowledgement, challenge and receipt. Use [RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785) with strict schemas, integer times and no duplicate JSON member names. Do not invent a near-JCS implementation. Legacy node signatures are verified separately over their actual exact input; never pretend they use this format.

Reject unknown fields/versions, invalid UTF-8, unsupported algorithms, noncanonical key/hash encodings and invalid types. Digests are 64 lowercase hexadecimal characters. Public Ed25519 keys are unpadded canonical base64url of exactly 32 bytes; signatures are exactly 64 bytes. Use a vetted strict verifier: reject S >= the group order, noncanonical public-key/R point encodings and small-order public-key/R points. Pin library behavior with negative interoperability vectors rather than relying on a permissive default. Identifiers/nonces are CSPRNG-generated 32 bytes. Signed numbers must be safe integers; lengths are bounded nonnegative integers. Free-text bytes are not normalized after signing. Paths are never interpreted from signed names.

### Local report package

The operator creates a submission ID, then packages:

```text
content_manifest: {
  version, environment, chain_id, service_id, submission_id,
  registration_sha256, policy_sha256, maintainer_roster_sha256,
  report_recipient_set_sha256, created_at, message,
  attachments: [{name, media_type, byte_length, sha256}],
  reply_registration_sha256
}
content_signature,
attachment bytes
```

V1 supports a message with zero or one file. The communication key signs the content manifest. The exact plaintext framing is ASCII `THOR-RELAY-CONTENT-v1\n`, a four-byte unsigned big-endian JSON byte length, that many bytes of JCS `{content_manifest, content_signature}`, an eight-byte unsigned big-endian file byte length, then the exact file bytes and EOF. For one attachment, its length/hash must agree with the file. For message-only reports `attachments` is `[]`, the eight-byte file length is zero and EOF follows immediately; an empty file instead has one explicit attachment with SHA-256 of empty bytes. No synthetic filename is required for message-only reports. JSON is at most 32 KiB and the message at most 8 KiB of UTF-8; enforce the configured overall ciphertext limit. Validate lengths before allocation; reject trailing bytes and never interpret the attachment name as a filesystem path. No archive extraction is required.

Encrypt the package locally to the policy's approved reader set, finalize immutable ciphertext, then calculate its SHA-256 and length. Preserve the exact ciphertext for retries. Do not upload plaintext, its hash, filename, message or descriptive subject outside encryption. The original file is not automatically deleted or modified. Before send, the CLI displays the exact signing identity/assurance, recipient fingerprints, report permanence, relay metadata visibility and configured retention, and obtains explicit local confirmation (or a documented deliberate noninteractive flag). `report purge` removes selected locally generated packages, ciphertext, capabilities and receipts after showing their paths; it never automatically deletes original evidence and makes no secure-erasure claim on SSDs, snapshots or backups. Maintainer tooling restricts staging permissions, removes abandoned staging on failure, and requires a documented plaintext/archive retention and access policy before production. Email recipients/provider backups may retain irreversible ciphertext copies. Implementers must provide fixed framing/canonicalization fixtures and interoperable tests rather than choosing a different container.

### Admission and complete upload

The signed outer manifest contains:

```text
version, environment, chain_id, service_id,
submission_id, registration_sha256, key_epoch,
policy_sha256, maintainer_roster_sha256, report_recipient_set_sha256,
ciphertext_sha256, ciphertext_length, submission_created_at,
status_capability_sha256,
challenge_id, challenge_nonce, challenge_issued_at, challenge_expires_at
```

The relay verifies delegation evidence and communication signature, current chain eligibility, policy/revocation state, challenge freshness and quotas before granting a short-lived upload capability. The capability is bound to the full signed manifest hash. Size, hash, bounded age format and permitted recipient-type structure are checked after the complete upload. A reader must not confuse these checks with proof of proper encryption: the maintainer performs full decryption/authentication. Do not return `encryption_verified` or inspect plaintext.

Proposed submission challenge lifetime: 5 minutes, with an admitted upload reservation lasting at most 30 minutes. The complete upload is accepted only while its reservation is valid. `submission_created_at` must agree with the inner manifest's `created_at`; new admission accepts at most 24-hour-old submissions with at most two minutes of future clock skew. A retry after a challenge expires may use a new challenge while preserving the same immutable ciphertext, original creation time, status capability and submission ID; durable deduplication keys on `(environment, chain_id, service_id, node_address, authorizer_role, authorizer_address, submission_id)`, derived from verified parent evidence rather than caller-supplied identity or registration digest. The quota identity aggregates delegates/nodes under their independently verified operator address, distinct from this deduplication tuple. Return an existing receipt only for the original immutable report context, ciphertext hash/length and status-capability hash, or reject different content. A new registration cannot replace the original inner/outer identity while reusing an accepted ID. A rotated operator may retrieve an existing result with its original persisted capability; preparing a different report requires a new ID, encryption and signature. An expired original registration cannot authorize new admission merely because its parent has since renewed. Never discard a replay record early while a matching admission remains valid. Quotas still address a malicious authorized sender deliberately creating fresh submissions or dishonest timestamps; replay checks do not establish honesty.

Atomically persist accepted submission metadata, consumed challenge/reservation, quotas and outbox job. Bounded pending uploads live outside that transaction and are deleted after failed/expired validation. Server restarts cannot reset replay protection. Admission/outbox storage must be durable; process-local caches are insufficient.

### Digest preimages and context agreement

All JSON digest inputs are RFC 8785 JCS encoded in UTF-8, with no prefix/newline unless expressly listed. Signed envelopes never change the digest of their payload. Required preimages are:

| Field | Exact SHA-256 input |
|---|---|
| `registration_core_sha256` | JCS of the complete registration core |
| `registration_sha256`, `previous_registration_sha256`, `reply_registration_sha256` | JCS of `registration_full`, excluding evidence/signatures; previous is empty only for initial enrollment; v1 reply equals submitting full-record digest |
| `maintainer_roster_sha256` | JCS of the complete canonical active report-reader roster entries, ordered by ID; possession evidence itself is carried separately and bound by each entry digest |
| `entry_authorization_sha256` | JCS of the exact roster entry excluding only `entry_possession_evidence_sha256` |
| `service_sha256` | UTF-8 of the canonical lowercase bare onion hostname, without scheme, port, path or newline |
| `mail_bundle_sha256` | Exact final outer age bundle ciphertext bytes before MIME encoding |
| `entry_possession_evidence_sha256` | JCS of the complete entry possession evidence excluding its signatures |
| `policy_sha256`, `acknowledgement_policy_sha256` | JCS of policy body excluding its signature array; signature verification is separate |
| `report_recipient_set_sha256` | JCS of the lexicographically sorted unique array of exact canonical native age recipient strings for active report readers |
| `reply_recipient_sha256` | UTF-8 of the canonical registered reply age recipient, without whitespace/newline |
| `ciphertext_sha256`, `response_ciphertext_sha256` | Exact final transmitted ciphertext bytes, not armor/MIME text |
| Attachment `sha256` | Exact original file bytes |
| `status_capability_sha256`, `token_sha256` | Decoded 32-byte random secret/token bytes |
| `manifest_sha256` (upload capability binding) | JCS of the complete outer manifest, excluding its signature |
| Submission challenge `context_sha256` | JCS of outer-manifest fields except `challenge_id`, `challenge_nonce`, `challenge_issued_at`, `challenge_expires_at` |
| Response challenge `context_sha256` | JCS of response-manifest fields except the same four challenge fields |

Outer-manifest challenge fields are named `challenge_issued_at` and `challenge_expires_at`; they describe the single-use challenge, not certificate validity or report creation. The signed challenge separately contains purpose, context digest, service/chain/environment, ID, nonce and these times. The client checks that it matches the pre-challenge context before signing the final manifest. A new challenge changes only those fields and the outer signature, preserving ciphertext/content identity for a valid retry.

Maintainer verification requires inner/outer equality of `version, environment, chain_id, service_id, submission_id, registration_sha256, policy_sha256, maintainer_roster_sha256, report_recipient_set_sha256`, plus inner `created_at` equals outer `submission_created_at`. The registration supplies the signing key, epoch and exact parent identity; receipt, historical evidence, policy and both manifests must agree. `reply_registration_sha256` equals `registration_sha256` in v1. Forwarding another operator's ciphertext is forbidden; a new outer signature cannot confer plaintext authorship. Reject mismatch before displaying or saving attachment output.

### Delivery choice: encrypted email with Tor retrieval fallback

The owner selected attached encrypted email plus Tor retrieval fallback on 2026-10-14, preserving the original mailbox workflow. Onion-pull-only delivery would reduce mail dependencies and archived copies, but is not the selected default. No provider, sending-domain owner or mailbox access roster has been provisioned; production remains closed until those are confirmed.

Persist the complete encrypted mail bundle before dispatch, bind `mail_bundle_sha256` and `mail_bundle_length` in the relay-signed delivery record, and retain it for either transport until a valid maintainer acknowledgement of receipt/verification or seven days after admission, whichever comes first. SMTP acceptance alone never deletes it. Acknowledgement `received` means the maintainer has durably obtained the complete encrypted bundle; `verified` additionally means successful local authentication/decryption. At deadline, mark an unacknowledged report `expired-unacknowledged`, erase its body and expose the expiry through the status capability; do not imply receipt. Sender tooling warns before expiration and may prepare a new signed submission after deliberate consent. Deletion cannot erase delivered mailbox/provider copies.

The maintainer retrieves bundles through `GET /v1/maintainer-bundle` with a short-lived, relay-challenged request signed by its currently policy-authorized acknowledgement key. Include environment/service, submission ID, request ID and expiry; no secret or report identifier belongs in a public URL. Provide a bounded signed pending-report index accessible only to the same authorized maintainer role, with paginated opaque IDs and delivery/expiry metadata. Neither index nor bundle capability grants decryption. Authenticate and rate-limit each request, reject revocation/stale freshness, use Tor exclusively, and locally verify original sender evidence as for mail. Relay substitution/withholding remains possible; the exact signed inner/outer report checks apply to both transports. The status capability never lets one operator enumerate or retrieve other reports.

The email worker computes exact post-wrapper, MIME/base64 wire length before sending. The effective report cap is the minimum of policy and the verified sender-provider **and recipient-mailbox** limits, with measured safety margin; 10 MiB is a storage upper bound, not an asserted deliverable mail size. Oversize mail goes directly to `retrieval-required` with retained encrypted bundle and content-free fixed-recipient notice, rather than arbitrary splitting or plaintext alternatives. Temporary mail failures retry with bounded backoff while retrieval remains available; permanent rejects, known bounces or deadline exhaustion yield explicit `retrieval-required`/`delivery-uncertain` status. Notifications can themselves be filtered; the maintainer polls the authenticated pending index independently.

Before enabling production email, the deployment owner records the fixed From domain/provider and credential custodian, confirms the recipient domain/mailbox and authorized readers with the maintainer, tests authenticated TLS, SPF/DKIM/DMARC and allowlisting, measures complete attachment sizes through the real path, and exercises spam/quarantine/bounce handling. Use a fixed private bounce route and authenticated provider feedback where supported; reject forged/ambiguous bounce reports as evidence of failure, correlate by opaque delivery attempt ID and never expose node identity. No bounce message or notification changes recipient authorization. Mail credentials remain SOPS-protected. Provider acceptance does not authenticate the maintainer or prove delivery.

### Mail transport and recipient verification

The mail worker copies the original evidence, registration, policy, outer manifest/signature and ciphertext into a complete submission bundle, then age-encrypts that bundle to the same approved report-recipient set. Mail plaintext framing is ASCII `THOR-RELAY-MAIL-v1\n`, a four-byte unsigned big-endian metadata length, JCS metadata `{registration, authorizer_evidence, policy, outer_manifest, outer_signature, admission_receipt}`, an eight-byte unsigned big-endian ciphertext length, the original ciphertext bytes and EOF. Metadata is capped at 256 KiB, includes all required historical attestations, and contains no private key. Metadata/body caps and exact EOF are checked before allocations/processing. Size limits account for this wrapper and MIME overhead.

This additional envelope hides node identity/signatures from email providers. The relay still has no report decryption key. Revalidate routing, revocations and recipient incident policy before first dispatch.

Use one fixed server-configured destination, a relay From address, a generic subject, a random generic attachment name and no operator Reply-To. No client email headers, CC/BCC, arbitrary recipient, callback URL or remote-file URL. Base64/MIME overhead counts toward the actual mail-provider limit; choose limits conservatively after testing that provider. Retry temporary failures with bounded backoff; quarantine persistent/uncertain cases visibly. Do not claim exactly-once SMTP delivery. Duplicate messages preserve the signed submission ID; recipient tooling deduplicates them.

The maintainer locally:

1. Fully unwraps the mail envelope into staging.
2. Independently verifies the original registration/evidence, policy and outer signature; checks admission assurance, sender, destination and exact ciphertext hash/length. A relay's “verified” label is insufficient. Validate admission-time authorization using retained trustworthy history; do not reject a report merely because it was read after certificate expiry.
3. Fully decrypts the report to staging, verifies inner content signature, identity agreement and attachment hashes/lengths.
4. Presents content only after all required checks finish; does not execute, preview HTML, fetch links or automatically extract archives. Optional extraction requires explicit path/symlink/resource defenses.
5. Signs an optional acknowledgement binding submission ID, registration, policy, ciphertext hash, environment and outcome (`received`, `verified`, or `reviewed`). Neither acknowledgement nor signature establishes that a report is true.

A failure discards staged output and leaves an explicit verification error. Valid-node files remain hostile input. Inspection/redaction occurs locally; the CLI never automatically collects node backups or key directories.

### Receipts, status and replies

Expose `accepted`, `queued`, `smtp-accepted`, `retrieval-required`, `delivery-uncertain`, `failed`, `maintainer-acknowledged`, `expired-unacknowledged`, `body-lost` and `quarantined`. A relay-signed receipt proves only that the relay signed that acceptance claim. SMTP acceptance is not maintainer receipt, and no service-side status removes censorship risk.

Private polling uses an unguessable status capability in an authorization header, never a URL/query string. The CLI generates and persists it before submission; the relay stores only its hash, included in the mandatory signed `status_capability_sha256` field. This prevents a lost response from losing access to status. It also prevents an attacker swapping the token to gain status visibility. The capability is 32 CSPRNG-generated bytes, encoded canonical base64url for transport; its digest is over the decoded bytes.

Acknowledgements and optional human replies are encrypted to the operator's registered age recipient and signed by the authorized maintainer acknowledgement key. They bind the original report, original policy, currently trusted acknowledgement policy and reply-recipient fingerprint. The operator checks the acknowledgement key's current authorization/revocation, not just an old certificate bundled by the relay. The maintainer checks reply-recipient revocation before creating a new response; a revoked recipient suspends replies until independently verified replacement-key authorization. Already encrypted replies cannot be repaired by a relay that lacks plaintext and are quarantined if recipient compromise is reported.

The proposed maintainer-response upload is also onion-only. Its signed manifest binds environment, service, original submission/registration/ciphertext digests, current acknowledgement policy, response ID/type, reply-recipient fingerprint, encrypted response digest/length and a single-use response challenge. Use distinct signature purposes for response admission and response content. The relay verifies the current policy-authorized maintainer key, original accepted submission, challenge and bounded body; it cannot decrypt the reply. V1 permits one acknowledgement and one human reply per report, each at most 32 KiB ciphertext, with atomic response-ID deduplication and independent quotas. Signed content inside reply encryption binds the same original context; operator tooling verifies it before presentation. A relay label alone never authenticates the response. Exact response schemas, encoding fixtures and maintainer-tool interoperability remain required before this optional feature ships.

The relay compares each response's reply-recipient fingerprint to the accepted registration, not a submitted arbitrary recipient. A replacement reply recipient requires a later full parent-authorized registration for the same exact parent tuple, possession proof, current policy/freshness checks and a maintainer-signed response explicitly naming both original and replacement registration digests; include the replacement evidence in the response bundle. Communication-key-only reassignment is forbidden. Historical responses are verified under their original acknowledgement policy/key at response creation, plus independently refreshed current compromise/revocation information. Ordinary key rotation does not invalidate an earlier authenticated reply; a compromised-key effective-time uncertainty is shown instead of trusting relay timestamps.

Return replies only through the status capability; email notification contains no operator email. A stolen reply age identity does not authorize new submissions. Public registration keys do not confer permission for an open bidirectional email relay.

## Proposed CLI and API boundaries

```text
bodferd identity create              # Local comms signing key + reply age identity
bodferd registration prepare        # Local record, fingerprints and public relay text
bodferd registration prove           # Local signing/decryption, no public posting
bodferd registration submit          # Tor-only evidence/possession import
bodferd registration inspect         # Show status, assurance, expiry and key epoch
bodferd registration rotate|revoke   # Explicit scoped authority, Tor-only submission
bodferd report prepare               # Local message/file manifest + age ciphertext
bodferd report send                  # Tor-only admission/upload; persist receipt
bodferd report status|reply          # Private Tor polling and local reply verification
bodferd report purge                 # Explicit local artifact cleanup, no secure-erase claim
bodferd receive list|fetch           # Authenticated Tor recovery/index, local ciphertext
bodferd receive verify               # Maintainer local verify/decrypt/staging
bodferd receive respond              # Local signed/encrypted response; Tor-only upload
```

`registration prepare` can emit public keys or a digest announcement for the operator to manually enter into `make relay`. It does not print secrets. Signing adapters accept inspectable files and emit attestations; they cannot accept arbitrary remote shell commands. Node keyring/wallet compatibility and envelope-export integration are separate implementation prerequisites.

| Endpoint | Contract |
|---|---|
| `GET /v1/policy` | Bounded policy body/signatures/publication reference; currentness independently verified on chain |
| `POST /v1/registration-challenges` | Bounded claimed parent/service/environment -> signed one-use challenge; claim not yet trusted |
| `POST /v1/registrations` | Exact record, authorizer evidence, comms proof -> bounded encrypted reply-key possession challenge |
| `POST /v1/registrations/confirm` | Signed possession proof -> active registration or explicit rejection |
| `POST /v1/registrations/revoke` | Scoped signed revocation -> durable revocation receipt |
| `POST /v1/submission-challenges` | Claimed registration/policy/context -> signed bounded one-use challenge; verify authority before expensive work |
| `POST /v1/submissions` | Signed manifest and bounded registration/evidence references -> capability/reservation or previous receipt |
| `PUT /v1/submission-body` | Capability in authorization header, raw bounded ciphertext -> accepted receipt after atomic validation/outbox insert |
| `GET /v1/submission-status` | Status capability in authorization header -> signed status and optional maintainer-encrypted response |
| `POST /v1/maintainer-retrieval-challenges` | Bounded maintainer-signed retrieval/index context -> relay-receipt-key-signed one-use challenge |
| `POST /v1/maintainer-pending` | Current maintainer signature, challenge, bounded cursor in body -> private paginated pending index |
| `GET /v1/maintainer-bundle` | Current challenged maintainer signature/context in headers -> bounded complete encrypted bundle |
| `POST /v1/maintainer-response-challenges` | Bounded signed maintainer context for an accepted report -> relay-receipt-key-signed one-use response challenge |
| `POST /v1/maintainer-responses` | Policy-authorized maintainer signature over response manifest plus bounded encrypted body -> response attached to original accepted submission |

Every endpoint is on the dedicated onion service. Requests cannot select URLs/providers/SMTP routes. Signed challenges bind service, chain, environment, purpose, submitted context digest, nonce and expiry; the client verifies the policy-authorized receipt key. Token-bearing headers and bodies are redacted from access/error/trace logs. No public registry dump or list of submitted reports.

## Standalone repository, deployment, resources and retention

Use this standalone repository for the future CLI, relay, operator/maintainer tooling and documentation. Suggested implementation directories are `cmd/`, `internal/`, `protocol/`, `deploy/` and `docs/`; the current tree ships documents only. Keep this service isolated from unrelated applications and credentials.

Prefer a separate Go CLI/service using supported upstream age and standard signing libraries. Pin actual library/tool versions after compatibility testing; source availability is not a supply-chain guarantee. Authenticated releases, verified dependency hashes/build provenance, reproducible build instructions and independent protocol/parser review precede production use.

Deploy with dedicated registrar credentials and infrastructure: dedicated namespace/storage/onion identity, private listener reachable only from its Tor endpoint, and an enforceable default-deny network policy. No clearnet ingress. A private socket/shared-pod boundary is an alternative where CNI enforcement is unavailable. Restrict the mail worker's egress to the configured mail transport and required verification route; don't treat an unrestricted Tor proxy as an egress allowlist. Production mail transport must use authenticated TLS with certificate verification.

Keep server-side credentials only as estate-PGP SOPS records under `k8s/creds/`. The relay never receives operator signing/age secrets or maintainer age identities. Operator and maintainer CLI identity files reside in their own protected local environments, outside repository artifacts. Read-only root filesystem, non-root execution, least privilege and resource caps are required. If deployed in the existing estate, all cluster changes follow git/CI/Flux; no local Docker builds or direct cluster mutations. Establish dedicated repository CI and deployment configuration before first deployment.

The submitter needs a local Tor client, not a public relay. The client transport exclusively uses a configured local SOCKS endpoint, passes the pinned onion hostname through SOCKS, rejects redirects/direct fallback, and uses supported stream isolation. No telemetry or background direct-network checks. A high-assurance deployment may restrict the submission process's network access to that local endpoint; local/offline signing remains explicit. Public Discord enrollment is a separate, visibly public operation and is not covered by the Tor-only submission promise.

### Custody, restart and disaster recovery

The deployment custodian owns the onion identity; its encrypted offline recovery copy and Tor configuration/version are escrowed separately from relay hosts, with two-person restore access. A standby must never independently run divergent writable admission state under the same onion identity. Prefer one fenced writer plus tested standby failover, a shared transactional store, and a supported Tor upgrade procedure that preserves identity and validates listener isolation. Do not silently rotate an onion key.

Back up registration/evidence history, consumed challenge/reservation IDs, accepted-ID tombstones, quota/outbox metadata, policy/revocation high-water marks and receipt-key authorization, with consistent encrypted off-cluster snapshots and monotonic journal checkpoints. No operator or maintainer decryption secret enters the backup. Report ciphertext spools are excluded by default: a restored job without its body becomes explicit `body-lost`, prompts sender retry/new submission, and cannot claim delivery. If a separately consented spool backup is enabled, its retention/deletion must follow the report deadline. Never restore stale metadata and reopen admission: reconcile consumed IDs and revocations against independent checkpoints/publication, invalidate all restored live challenges/capabilities/reservations, fence the former writer and quarantine ambiguous jobs before issuing fresh challenges. If replay/revocation continuity cannot be established, remain closed and require an independently authorized new service epoch.

Losing the onion identity requires an independent policy-authority-signed service-migration statement binding old/new service IDs, environment/chain, migration epoch and expiry, independently confirmed by clients. Existing certificates cannot be silently rewritten to the new service. A migration adapter may use preserved parent evidence to issue a new service-scoped registration only after new challenge/key-possession proofs and fresh authorization; old ciphertext stays scoped to its original service, retrievable only as an explicitly labeled historical bundle. No automatic cross-service resubmission or key grant. Test host loss, rollback, duplicate writer, spool loss and onion restore before deployment; the custodian records recovery evidence without exposing escrow material.

### Incident capacity and monitoring

Reserve independent bounded queues, workers and disk budgets for **enrolled message-only reports** so attachment uploads cannot exhaust incident signaling. Pilot proposal: 64 MiB of the 512 MiB spool, one independent admission worker and 20 small reports per operator/day reserved for message-only traffic, with 64 KiB ciphertext cap; the remaining 448 MiB and normal parent byte/report quotas serve attachments. All limits are unmeasured proposals to load-test. A distinct bounded verification queue prevents attachment floods from consuming every chain-check worker; global connection/CPU limits remain necessary. Reserve capacity atomically before upload; overload returns retry-after without losing an accepted job. The public `make relay` monitor for unenrolled operators is separate and cannot consume or bypass this verified reserve. During surge, defer attachments visibly while accepting eligible short incident reports. No incident adjustment requires weakening signatures, freshness or revocation checks.

Before launch, assign relay/mail/Tor on-call and channel-monitoring owners with independent alert delivery and escalation timers. Run a synthetic end-to-end canary through each configured path: registration/eligibility, policy freshness, Tor upload, mail delivery, independent maintainer fetch, local decryption/verification and signed acknowledgement. Production-route tests require explicit maintainer consent and inert synthetic content with separately authorized canary credentials; a test-environment canary cannot prove the production route works. Pilot target: check every 15 minutes and page after two missed acknowledgements, plus immediate stale-chain/credential-expiry, backlog-age, disk-pressure and Tor-liveness alerts. These are acceptance targets, not a current operating SLA. Publish a signed, identity-free aggregate health statement on an independently operated onion health mirror with last successful canary time and bounded validity; stale/missing health is unknown, not healthy. No node IDs, report counts small enough to identify senders, tokens or content in metrics. Canaries detect broad failures but cannot rule out selective relay censorship or targeted mailbox filtering.

Proposed pilot defaults, subject to provider/load verification before production:

| Control | Default | Reason / verification |
|---|---|---|
| JSON/evidence body | 32 KiB; bounded depth/field lengths | Allow supported keys/evidence while rejecting resource bombs |
| Report ciphertext | 10 MiB storage ceiling; no automatic splitting | Actual mail cap is lower when measured limits require; Tor retrieval remains available |
| Pending upload | One per parent operator, 30-minute maximum | Limit authenticated resource pinning; slow Tor upload test |
| Parent quota | 5 reports/day and 25 MiB/day | Count delegates/nodes sharing an operator together; signed-policy incident adjustment |
| Global spool | 512 MiB; bounded concurrent uploads/workers | Backpressure before quota allocation; disk-full tests |
| Report retention | Delete relay bundle only after a verified maintainer acknowledgement, or 7 days after acceptance regardless of transport outcome | Keep Tor recovery available while retained; email copies remain irreversible |
| Receipt/status retention | 30 days | Hash-only minimal metadata where possible; no public identities in logs |
| Consumed challenge retention | Beyond its final valid upload reservation | No restart/time-window replay |
| Accepted-ID tombstones | 90 days; older IDs outside the signed creation window rejected | Durable deduplication without indefinite body retention |

Hash/ID tombstones and minimal authorization records still constitute potentially identifying metadata. Registration remains available for its validity plus a bounded historical-verification window; revocation high-water marks outlive removed certificates. The full acceptance-time evidence is forwarded inside the encrypted mail bundle. Delete expired challenges and failed upload bodies. Do not include report spools in routine backups by default. Limit logs to aggregate health/error classes; review observability settings for token/signature leakage.

V1 has no padding bytes: its exact framing ends at EOF after the attachment. A future version may define authenticated padding to policy-defined size buckets inside client encryption, with explicit framing and interoperability fixtures; overhead counts toward quotas. Batching/delay is optional and disabled for urgent incident reports by default. Static age keys do not supply forward secrecy; rotation and short retention reduce exposure but do not erase mail archives. Supported post-quantum encryption can address future cryptanalysis, not private-key theft. True forward secrecy needs a separately reviewed protocol/key lifecycle.

## Nineteen original findings grouped into ten controls

| Review item | R-number | Owning mechanism | Required acceptance requirements |
|---|---|---|---|
| 1. Proper-encryption claim | R01 | Opaque admission; maintainer full decryption | Signed malformed ciphertext cannot be labeled encryption-verified; recipient rejects it |
| 2. Circular recipient trust | R02 | Independent threshold-dual-authorized policy, pinning, on-chain sequence/currentness | Substituted recipient, withheld on-chain update and rolled-back policy rejected before local encryption |
| 3. Unsafe reuse of `make relay` | R00 | Public registration only; separate confidential transport/sign-only adapter | No report contents enter Discord workflow; original evidence or labeled registrar attestations required |
| 4. Powerful key exposure | R04, R18 | Ed25519 delegation and scoped renewal/revocation | Routine reports work without node keyring access; delegate cannot extend its own authority |
| 5. Signature binding/replay/authorship | R05, R06, R07 | Inner content signature, outer context/ciphertext signature, durable atomic outbox | Changed destination/file/context rejected; retries/concurrency/restarts produce one accepted job |
| 6. Valid operator definition | R03, R08 | Exact account authority, fresh state, explicit statuses/recovery | Unrelated provider/self-generated signer rejected; Standby incident reporting succeeds |
| 7. Tor and identity limits | R09, R16, R17 | SOCKS-only transport, pinned onion, honest privacy promise | Proxy failure/redirect cannot produce direct egress; relay identity visibility documented |
| 8. Whole-report/email privacy | R10, R11 | Client package encryption, encrypted forwarding bundle, generic mail, retention | Mail provider cannot see node identity/message/filename; static-key exposure remains explicit |
| 9. Abuse/hostile attachments | R13, R14 | Admission-before-body, quotas/caps, staged recipient verification | Slow/large/authorized floods bounded; no unsafe opening/extraction or partial output presentation |
| 10. Delivery/test separation | R12, R15 | Durable status, maintainer-signed ack, distinct policy/keys/routes | SMTP acceptance differs from acknowledgement; startup rejects cross-environment configuration, keys and routes |

Also test registration key possession, public-announcement substitution, compromised Discord/registrar behavior, wrong maintainer role, simultaneous epoch rotations, emergency freeze persistence, capability substitution, storage loss/restart, retention cleanup, and post-compromise receipt backdating limits. Independent protocol review and implementation evidence are required before marking any control implemented.

## Evolution into secure operator and trusted-group communications

The intended direction includes operator-to-operator conversations and conversations with THORNode developers and explicitly trusted groups. V1 implements confidential reporting and bounded encrypted replies only. The identity registry is a foundation for later messaging; a report registration is not a grant to join any group, discover all operators, or retrieve another operator's inbox.

### Reuse a messaging system; own identity and authorization

Bodferd should own the chain-to-communication identity binding, developer-role attestations, verification display and group admission policy. It should delegate conversation encryption, session state and device management to an established system or independently reviewed implementation. Evaluate an integration with an existing end-to-end encrypted messenger before building a separate transport. Signal documents distinct protocols for key agreement, ratcheting and multi-device sessions; importing its library alone does not establish compatibility with the Signal service. [Signal technical documentation](https://signal.org/docs/).

The owner selected **MLS as the lead investigation candidate**, retaining libsignal as an alternative. Evaluate maintained implementations of Messaging Layer Security; an independent audit of the selected version/integration remains required before production and must not be assumed from RFC conformance. RFC 9420 specifies asynchronous group key establishment with forward secrecy and post-compromise security. MLS is a cryptographic component, not a complete chat application, identity directory or anonymity system. Selection of a product/library, versions and license compatibility remains a separate design decision. [RFC 9420](https://www.rfc-editor.org/rfc/rfc9420).

Do not turn the email relay into a chat server, distribute a shared static age group identity, build a home-grown ratchet, or treat adding recipients to an age header as group membership security. V1 report keys and durable content signatures retain their original semantics. Separate protocol versions and keys must distinguish future conversation traffic from evidentiary incident reports; conversation authentication and deniability requirements need explicit review rather than automatically signing every chat message with the report key.

### Identity and group boundaries

| Principal | Authority source | What it can authorize |
|---|---|---|
| Node operator | Current chain relationship plus scoped delegation | Its communication identity and approved devices; requested group enrollment |
| THORNode developer / maintainer | Independent signed role roster, with out-of-band bootstrap | Actions allowed by that developer role; no automatic node account authority |
| Group administrator | Explicit group-specific policy | Invitations, removals and permitted membership changes in that group |
| Directory / delivery server | No independent role-granting authority | Routing and bounded storage; no silent key substitution or membership expansion |
| Optional zkgroup authentication issuer | Policy-authorized custody of `ServerSecretParams`; a trusted issuance authority | Can mint supported UID authentication credentials; sees issuance identities, and compromise permits forged issuance; not merely a ciphertext router |

Future device credentials bind a device's messaging-protocol public keys to a communication identity, environment, expiry, credential sequence and allowed purposes. They use protocol-native keys and formats where required; the age reply key is never silently repurposed. New-device enrollment requires existing trusted-device approval or explicit parent/role-authorized recovery. Merely authenticating to the relay, controlling an email address or presenting a stale node certificate cannot enroll a device. Key changes appear to peers and administrators with a verification path independent of the directory.

Groups have an immutable group identifier, named policy owner, explicit administrator authority, admission assurance, membership visibility and history policy. A node certificate proves eligibility for a policy check, not that its holder is a developer or already belongs to every operator group. Invitations are bounded, single-use and confirmed by the invitee. Parent chain authority is rechecked at relevant membership changes; node exit, role expiry, device compromise and emergency freeze trigger removal of affected devices and protocol-native epoch/key updates. Removed devices cannot decrypt future messages after an applied removal; they retain previously learned plaintext and keys. No remote deletion promise can undo that exposure.

A membership authority cannot silently grant itself all groups. Clients authenticate membership changes against group policy and surface them to members. Directory proofs, detectable equivocation, administrator collusion and roster compromise require evaluation in the selected messaging system; a signed central roster alone does not prevent different clients receiving conflicting authorized views.

### Delivery, privacy and recovery requirements

An optional encrypted mailbox uses per-device opaque delivery capabilities, bounded offline storage and independent quotas. Device-list refresh, key-package/prekey fetches, delivery, receipts, attachments and any push mechanism all need an explicit Tor transport design. Reusing a messenger that contacts its clearnet servers directly would violate Bodferd's intended network boundary; Tor support, DNS behavior and background traffic must be demonstrated, not assumed. Notification previews contain no message text or node identity by default.

Public node enrollment already reveals participation. Group membership, contact graphs, traffic timing, size and device activity may reveal more. V1 does not promise to hide those from its identity-aware relay. A future metadata-hiding delivery service would need a separately reviewed separation between authenticated enrollment and delivery, with abuse controls that do not recreate a global public contact graph. Contact discovery is opt-in and scoped; do not expose a list of all registered operators or arbitrary unauthenticated key lookups.

Forward secrecy depends on endpoint key deletion and implementation behavior, including backups. Backing up ratchet or group secrets may undermine it. Recovery must reestablish device authorization and notify peers; an operator losing all devices cannot transparently regain old conversation history through a server-held decryption master key. History sharing with new members is disabled by default and requires an explicit, visible group decision if supported. Endpoint compromise, a legitimate member copying messages, message truth and censorship remain outside transport encryption's guarantees.

### Evidence required before expanding scope

Before choosing a conversation stack, demonstrate a two-operator and developer-group pilot over Tor; authenticated device replacement; stale-role and removed-device rejection; independent key verification under directory substitution; offline catch-up and conflicting membership-change recovery; bounded malicious-member uploads; and measured metadata exposure. Use the selected protocol's interoperability and security tests and obtain independent review of the identity integration. No production chat or group API is authorized by the v1 report certificate. The decision gate is whether an existing product can meet these requirements with a small identity adapter; if it cannot, record the specific unmet requirements and implementation cost before proposing a new messenger.

## MLS-first conversation investigation

This is the owner-selected investigation order, not approval to implement a messenger. RFC 9420 supplies group establishment, authenticated membership commits, epochs, forward secrecy and post-compromise security under its assumptions. Bodferd supplies the Authentication Service contract: independently verified parent/developer roles, scoped device credentials and group-specific admission decisions. A separate largely untrusted Delivery Service stores/routes ciphertext and key packages; it does not grant roles or hold group secrets. [RFC 9420](https://www.rfc-editor.org/rfc/rfc9420).

| Layer | Reused component / Bodferd responsibility | Trust and privacy boundary |
|---|---|---|
| Authentication Service | Bodferd credential validation and chain/role evidence; selected MLS credential-validation hook | Trusted to bind identities/roles; enrollment observes node-to-device associations; compromise can issue false credentials |
| MLS endpoint | Upstream key-package, group commit, epoch and secret management | Device-local secrets; peers authenticate credentials and group policy before accepting additions/changes |
| Delivery Service | Tor-only queues, bounded key-package availability and offline delivery | Can suppress/reorder/drop traffic, observe routing/timing/size and potentially group IDs/epochs; no plaintext guarantee against compromised endpoints |
| Group policy owner | Explicit member/device/administrator authorization | Can approve membership within the group; is not automatically a maintainer or authority for other groups |

MLS does not by itself decide whether a node deserves membership. Clients validate the authenticated credential and group-specific policy on every membership change, then apply the protocol-native commit. Role expiry/removal blocks new sends until the removal commit and new epoch are applied; delivery of delayed old-epoch ciphertext does not restore eligibility. A malicious delivery service can withhold commits and split views, so the pilot must demonstrate conflict detection, offline catch-up and convergence without sending new secrets to stale or removed devices. Do not promise removal erases old history or secret material already copied by members.

Candidate libraries are [mls-rs](https://github.com/awslabs/mls-rs) (MIT/Apache-2.0) and [OpenMLS](https://github.com/openmls/openmls) (MIT); pin actual versions and crypto providers only after tests. mls-rs explicitly states that a full third-party security audit is not yet completed; conformance is not an audit. OpenMLS published a secret-tree persistence advisory [GHSA-qr9h-x63w-vqfm](https://github.com/openmls/openmls/security/advisories/GHSA-qr9h-x63w-vqfm), fixed in 0.7.1. These primary sources were checked on 2026-10-14; do not infer audit coverage of Bodferd from a fixed vulnerability. Obtain and review actual audit scope for the chosen release/provider or commission the missing review before production.

Use a supported Rust consumer for the first bounded investigation, or a demonstrably supported upstream binding for the actual target client. Existing UniFFI modules are not evidence of a maintained Go wrapper; no bespoke FFI is authorized. The reporting CLI can remain Go without owning conversation state. Investigate the real credential-validation entry point, key-package lifecycle, storage transactions and interoperability vectors from the selected crate/version rather than write group crypto or a parallel ratchet. Native age report encryption stays separate; no MLS export key silently becomes a report or node signing key.

Acceptance evidence must cover two operators plus a developer group over Tor, per-device authorization, malicious/stale credential rejection, concurrent commits, device recovery, removal during offline/queued traffic, state rollback/crash handling, storage-key deletion/backups and measured exposed metadata. All key-package fetches, ciphertext delivery, attachment storage and notifications must follow the Tor boundary. No APNs/FCM or other clearnet background path is implied. The investigation records the remaining messenger work: endpoint UX/storage, notifications, updates, abuse controls and group policy integration. If MLS fails a material gate, compare the documented libsignal alternative and return a concrete recommendation to the owner.

## Signal integration and Bodferd trust

This section is a proposed integration design, not an implemented Signal client. Sources were inspected on 2026-10-14. Keep the reporting CLI small. Stock Signal is excluded from the compliant candidate set; a libsignal investigation would assess an independent messenger, not a small stock-app integration. The owner selected MLS to lead the investigation, with libsignal retained as an alternative (A21); this section scopes that alternative. The strict Tor-only and automatic membership requirements are acceptance gates; a companion workflow that fails them is not the target solution.

### What Signal code actually supplies

`libsignal` contains the message protocol and related components, including private-group primitives. Its supported products for Signal's own use expose Java, Swift and TypeScript interfaces over Rust. Upstream explicitly says third-party use is unsupported and APIs can change. There is no established Go integration promised here. Pin a tested release/commit, isolate its bindings behind a narrow adapter, retain upstream tests and budget continued security-update work. No Signal dependency is installed by this design. [libsignal source and support boundary](https://github.com/signalapp/libsignal).

Signal's server is also open source, but its [sample configuration](https://github.com/signalapp/Signal-Server/blob/main/service/config/sample.yml) includes DynamoDB, Redis clusters, object storage, push and registration/recovery/contact-discovery dependencies in addition to FoundationDB. Group roster/control storage also lives in the separate [storage-service application](https://github.com/signalapp/storage-service/blob/main/src/main/java/org/signal/storageservice/StorageService.java), which uses Bigtable and its own group controllers. A fork therefore needs an explicit inventory and operating plan for multiple services; deploying Signal-Server alone does not provide the complete product or operational setup. A source fork is not a turnkey private Signal deployment. [Signal-Server build documentation](https://raw.githubusercontent.com/signalapp/Signal-Server/main/README.md).

The inspected libsignal and server projects use AGPLv3. Bodferd's current original documents and static reading code are MIT-licensed; that does not relicense incorporated Signal code. Choose a compatible distribution structure and satisfy the relevant upstream license before adding a dependency or fork. License selection for a combined messaging product remains a recorded decision. [libsignal license](https://github.com/signalapp/libsignal/blob/main/LICENSE).

### A. Integrating with the existing Signal application

A companion mode can verify a node-authorized Bodferd registration, then help an operator bind it to a Signal contact through a short-lived challenge answered within an encrypted conversation. Both participants independently compare the Signal safety number using the authenticated Bodferd relationship or another trusted channel. Safety numbers belong to a pair of contacts; they are not a universal node certificate. Reinstallations/key changes require renewed verification. A username, profile name or successful account challenge alone cannot establish the node-to-current-identity-key binding. [Signal safety-number documentation](https://support.signal.org/hc/en-us/articles/360007060632-What-is-a-safety-number-and-why-do-I-see-that-it-changed).

Group administrators could inspect Bodferd credentials manually and remove members through Signal's normal controls. Signal supports private groups, administrator controls and optional approval of group-link join requests, which is not automatic credential enforcement. [Signal group documentation](https://support.signal.org/hc/en-us/articles/360007319331-Group-chats).

This route preserves the existing app's UX and update path, but stock clients do not implement the proposed Bodferd credential rules. This design has not established a supported Signal bot, enrollment or group-management API. A companion label is advisory; it cannot compel an unmodified client to stop sharing group keys after a chain-role revocation. Do not put a decryption bot in every group to enforce membership: that gives the bot access to content and group relationships. Do not claim this route meets Tor-only transport without demonstrating every network path. Stock Signal fails the specified Tor-only transport and automatic membership gates and is excluded from implementation candidates. An account challenge is only an advisory association; no supported companion API binds a served identity key or enforces revocation. Its phone-number registration introduces identity disclosure outside the stated model. Users may separately choose stock Signal for ordinary communication, but that is outside Bodferd's confidentiality/transport contract; this design does not schedule a pilot claiming compliance.

### B. A new messenger reusing libsignal cryptographic components

The candidate architecture has three explicit boundaries:

| Layer | Reuse / responsibility | Authority boundary |
|---|---|---|
| Bodferd identity and policy | Verify node relationships, developer attestations, device delegations and group permissions | Authorizes identities/actions; possesses no conversation decryption key |
| Local messaging adapter | Pinned libsignal pairwise sessions/sender-key primitives, encrypted local state; a separately reviewed group application | Keys remain on endpoints; application policy governs which devices receive them |
| Tor delivery and group storage | Bounded ciphertext queues, encrypted group state and protocol-native proof verification where adopted | Routes data; cannot silently appoint developers, enroll devices or rewrite trusted policy |

The first reporting CLI may remain Go. Option B requires a new client in TypeScript, Java or Swift using upstream bindings, or a separately justified Rust integration; it cannot reuse Go verification code in-process without a supported language boundary. Port the public verifier contract with cross-language fixtures rather than promise a nonexistent Go wrapper or invent security-sensitive IPC. libsignal supplies pairwise ratchets and sender-key distribution/cipher operations, not group lifecycle, authenticated rosters, device enrollment, notifications, attachment handling or encrypted local backups. Those require client/server application work and independent review; the reuse claim is limited to the imported cryptographic primitives. Do not build bespoke FFI, prekey or ratchet code as a shortcut. An independent network uses its own service identifiers and deployment; neither stock Signal-server compatibility nor access to Signal's production network is assumed.

Retain library-native authenticated session establishment and ratchet behavior instead of changing KDF inputs or mixing chain signatures into message encryption. Signal publishes PQXDH, ratchet and multi-device session specifications. Its 2 October 2025 [SPQR announcement](https://signal.org/blog/spqr/) describes combining the Sparse Post Quantum Ratchet with Double Ratchet as the Triple Ratchet. Do not equate a 2026 dependency pin with the older Double Ratchet alone; the selected implementation/version and complete session lifecycle must establish the exact supported security properties. Forward secrecy and compromise recovery require correct state handling, key deletion and subsequent honest exchanges; changing a dependency name does not establish them. Group properties must be evaluated separately from pairwise ratchets. [PQXDH specification](https://signal.org/docs/specifications/pqxdh/), [Double Ratchet specification](https://signal.org/docs/specifications/doubleratchet/), [Sesame specification](https://signal.org/docs/specifications/sesame/).

### Bind trust to the actual device; do not alter the ratchet

For the independent libsignal candidate, the proposed model uses a separate protocol identity key per Bodferd device, rather than Signal's account identity shared by linked devices. This is a departure from the deployed account/ACI/PNI model and needs demonstrated session/device interoperability before selection; it does not claim stock Signal compatibility. A device public-key hash covers SHA-256 of the exact library-native serialized identity public key (including its type byte), not an Ed25519 or age key. A proposed Bodferd messaging credential binds: application purpose/version, environment and chain, authorizer evidence, communication registration digest, subject identifier, messaging device ID, hash of the protocol-native public identity key, credential sequence, issued/expiry times, issuer and explicit capabilities. The communication identity authorizes its device; independent policy grants developer/group-administrator roles. Demonstrate possession through the selected messaging protocol before activation. Do not assume libsignal identity keys are Ed25519, convert age identities, or reuse node secrets as ratchet material.

Peers verify the full binding and current authorization before establishing a trusted conversation. The UI shows provenance such as node-signature-verified or registrar-witnessed, role issuer, last chain-state check, expiry and device changes. A witnessed node binding never becomes a stronger label just because it travels through Signal encryption. A delivery server cannot swap an identity key while retaining the old certificate; clients reject mismatch rather than silently applying trust-on-first-use. The authenticated Bodferd credential is the authorization root; the messaging directory supplies routing/key material and cannot grant identity. Honest re-key blocks new sends until a newly authorized credential, device possession proof and authenticated peer/group update agree with the directory. Cache highest credential sequences and current revocation information; stale replay cannot overwrite them. Show a pending re-verification state instead of a warning bypass. Existing decrypted history remains local; offline credential expiry blocks privileged changes and new sessions. The enrollment/role issuer, not the directory, resolves replacement credentials.

Trust is a set of scoped facts and capabilities, not a global numeric score. Examples include current node operator, independently approved developer, member of a named response group and administrator of that group. A policy can require one or more of these facts. Active-to-Standby churn does not by itself remove an operator if both statuses satisfy policy; loss of the actual operator relationship affects the node-derived role, not unrelated independently issued roles. Refresh cadence, maximum staleness and offline behavior are explicit policy choices. Expired or uncertain authority blocks new privileged membership changes; no indefinite silent grace.

### Enforce membership in clients and key distribution

Group policy names eligible roles, permitted assurance levels, policy owner, invitation/removal rules, administrative threshold, visibility and history access. Approved invites bind the group, exact device identity keys, credential digests and expected group-state version. Clients validate them before distributing secrets. The messaging system's authenticated group state/control path carries the membership change; a plaintext badge or a SQL role update is insufficient.

Clients refuse unapproved device additions and policy changes, authenticate the resulting membership revision and stop new confidential sends when removal/key update is pending or views conflict. Role revocation removes all affected devices through the selected group protocol and stops distributing new sender/group secrets to them. Verify the concrete libsignal/client implementation's removal, key-rotation and queued-message behavior; private-group administration alone is not proof of group post-compromise security. Already authorized members can still retain or copy messages, forward secrets, or collude. A bot or server-side ACL cannot revoke previously learned plaintext.

Different read audiences use different encrypted groups. Giving every member the same decryption secret and hiding developer-only messages with a UI role check does not enforce confidentiality. The signed trust credential authenticates eligibility; it is not attached as a transferable node signature to every chat message. Incident reports remain durably signed. Bodferd identity/device credentials are transferable identity bindings, and sender-key group messages have verification signatures visible to members. This draft makes no cryptographic deniability promise for group conversation traffic or those credentials, even when pairwise encryption retains upstream Signal authentication properties. Do not add a node/report signature to each chat message; assess the chosen protocol's actual deniability separately and show the identity-binding limitation in product documentation.

### Preserve group privacy rather than exposing roles to every server

Signal's private-group design stores encrypted membership state and verifies credential presentations without learning the member identity from that presentation. Its libsignal `zkgroup` components are worth evaluating before building a central plaintext membership database. Keep custom role evidence inside encrypted group state, visible to entitled members, rather than publishing node/developer/group tuples for routing. [Signal private-group system](https://signal.org/blog/signal-private-group-system/).

This is not an invitation to add arbitrary attributes to a zero-knowledge proof. The inspected upstream authentication API has specific identity/time inputs and verification against group parameters; it is not a generic constructor for node-bond or developer-role proofs. Reuse supported issuance/presentation formats. A chain-role credential can gate issuance or be checked by authorized clients, with its exact privacy and issuer knowledge documented. The holder of `ServerSecretParams` can issue credentials for supported UIDs and is an explicit authentication trust root. Issuer compromise, impersonation, issuance logs and collusion are review cases; group admission still requires authenticated device credentials and group-owner authorization, with no claim that proof privacy hides identities from the issuer. Custom zero-knowledge role proofs require independent cryptographic design and review. [Upstream credential API](https://github.com/signalapp/libsignal/blob/main/node/ts/zkgroup/auth/ServerZkAuthOperations.ts).

Enrollment already knows the node; the report relay remains identity-aware. Future group delivery must separately assess whether issuance and presentation are linkable through accounts, capabilities, logs, timing or colluding services. Do not present separation of two services as unlinkability by itself. Signal's sealed-sender design targets sender metadata, but importing libsignal does not automatically enable it in a new transport. Tor hides network location; it does not erase identifying application headers or global timing correlation. [Signal sealed-sender design](https://signal.org/blog/sealed-sender/).

### What must still be built and verified

Bodferd still owns endpoint storage, rollback-safe atomic session updates, bounded skipped-message keys, device recovery, invitations, abuse controls, attachments, notifications, updates and supply-chain verification. Queue retry/replay handling cannot restore old ratchet state or reuse consumed prekeys. Avoid key-bearing backups that undermine forward secrecy. Do not add message-content telemetry, directory dumps or clearnet fallback. A known-good library protects the primitives; the integration and endpoints can still compromise them.

Before selecting this path, the investigation must demonstrate two operators and a developer group; offline and out-of-order delivery; authenticated device replacement; rejection of substituted devices and stale credentials; concurrent membership changes; multi-device removal with fresh key distribution; crash/restart recovery without state rollback; Tor-only background traffic; and a server compromise that reveals no message plaintext. Record which metadata each server/issuer can see. Assess the pinned component's group security independently, update burden and license compatibility. Keep libsignal-client and MLS alternatives open until this evidence distinguishes them; stock Signal is excluded from the compliant candidate set; no implementation stack is approved by this document.

## Remaining implementation prerequisites

The corrected draft still needs an independent re-check. Before implementation readiness, prove the on-chain policy carrier and complete freshness-verification route. These external facts also remain unverified: actual maintainer/registrar identities and fingerprints; permission/access for any future Discord integration; original signed-envelope export from supported node releases; wallet sign-only format compatibility; independent chain verifier availability and historical-state retention; dedicated onion provisioning; provider attachment/TLS limits; pilot resource/retention suitability. Container framing is specified above; interoperable implementation fixtures remain required validation work.

None requires substituting a weaker claim. Prefer direct cryptographic enrollment; witnessed `make relay` is available only with explicitly authorized registrar trust. Bootstrap maintainer roles independently. Ship initially to the synthetic test environment, verify all controls, and then provision production through the repository release process when requested. This document does not activate services, publish keys, register users, send mail or authorize use of unprovisioned production secrets.


The owner decisions and accepted availability/metadata risks are recorded in [review-decisions.md](review-decisions.md). Draft dispositions are not independent findings closure; the original external reviewer must re-check them against this revision.
