# Bodferð — secure THORChain communications design

Status: design, not implemented. Updated 2026-10-14. User requested integration of the security review and a public `make relay` key-registration option, then selected finishing the protocol design before building the CLI/service.

This is the controlling design for the proposed relay. It incorporates all ten controls summarized in the review and the detailed [findings register](security-review.md). CLI names and API paths below are proposed contracts, not implemented commands. Repository: [PFC-Validator/bodferd](https://github.com/PFC-Validator/bodferd). Bodferd is the ASCII project name; Bodferð is the display name. Existing THOR-RELAY wire markers below remain proposed v1 identifiers, independent of branding.

Z>>> A22 (Medium): "all ten controls summarized in the review" has no referent. security-review.md contains nineteen findings (R00–R18) and no ten-item summary; the ten are this document's own grouping table and no R-number maps to a row. See adversarial.md A22. <<<Z

## Outcome and privacy promise

A recognized node operator can submit an authenticated confidential message and file to the THORChain maintainer over Tor without disclosing plaintext to the admission service or email provider. Public node-authenticated announcements can bootstrap a separate communication signing key and an age recipient key. Maintainer keys are authenticated through an independently trusted maintainer policy.

The admission relay learns the submitting node identity, time and ciphertext size. The maintainer learns the sender and report contents. Public registration announces participation and may link communication keys to a node. Email providers learn the relay, recipient, time and approximate size. The system does not promise anonymity from the admission relay, deniability of signed reports, forward secrecy with static age keys, or protection after compromise of a plaintext endpoint. These boundaries must appear in CLI documentation.

Z>>> A18 (Medium): this lists what a compromised relay learns, not what it can do. Missing: selective per-node refusal of challenges or renewals (silent expulsion), fabricated delivery-uncertain/failed status, delayed dispatch past an incident window, withheld replies, dropped evidence bundles, serving a still-valid 24-hour-old policy after a revocation, and cross-epoch node/key/recipient graphing. See adversarial.md A18, A24. <<<Z

Production destination: `itzamna@thorchain.org`. Test destination: `pfc@pfc.zone`. These are user-provided routes; neither an email string nor this document establishes ownership of an age identity. No public keys, trusted maintainer roster, new onion address or mail-provider configuration have yet been provisioned.

Z>>> A02 (Critical): the maintainer identity is a user-supplied string and no maintainer-side party participates in this design: nothing requires the maintainer to publish a fingerprint through a channel operators already trust or to countersign the policy entry naming their key. A04 (High): the schema at line 56 has exactly one maintainer and no roster or continuity recipient; after SMTP acceptance the relay has deleted its copy, so a lost maintainer key or an absent maintainer leaves every report unreadable. See adversarial.md A02, A04. <<<Z

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

Use separate signing and encryption keys. Native age encryption keys are not message-signing keys; do not convert an age identity into an Ed25519 signer or derive communication secrets from a node signature. Key generation and private-key storage occur locally. Documentation may show public keys/fingerprints but must not print private identities or mnemonics.

The proposed v1 communication signature scheme is Ed25519. Use a standard implementation and independently reviewed protocol composition. Native X25519 and supported hybrid post-quantum age recipients are acceptable only when explicitly selected by policy and supported by both ends. One report recipient is the default. Do not silently add a sender recovery recipient, mix encryption modes, accept password-only encryption or execute arbitrary plugins selected by a server-provided key.

## Independent trust and recipient policy

The CLI obtains an initial trust bundle independently of the relay: authenticated distribution plus an out-of-band confirmed policy-authority fingerprint. First contact never silently trusts keys returned by the upload service. Test and production trust/configuration are separate.

Z>>> A02 (Critical): "authenticated distribution" ships the trust bundle inside a signed CLI release, so the release-signing identity (unnamed; line 251 leaves it as future work) is the de facto root above the policy authority. The "out-of-band" fingerprint channel is never named; the only public channel this document mentions is Discord, which line 64 says cannot confer authority. See adversarial.md A02. <<<Z

The trust bundle defines policy-authority keys and a signature threshold. Proposal: two independent approvals for production maintainer/registrar authority changes; a separate explicitly trusted single-authority test configuration is allowed. Identities and initial fingerprints remain provisioning prerequisites, not invented identities in this design.

Z>>> A02 (Critical) / A17 (Medium): nothing requires the threshold signers, the relay administrators and the registrars to be different organisations, and nothing requires production and test authority key sets to be disjoint. If one organisation holds both keys and runs the relay, the threshold protects against losing a key file, not against that organisation substituting report_age_recipient, which is the R02 circularity this layer exists to break. See adversarial.md A02, A17. <<<Z

A threshold-signed policy binds:

```text
version, environment, chain_id, service_id, policy_sequence,
issued_at, expires_at,
maintainer: {id, mailbox, report_age_recipient, acknowledgement_ed25519},
relay_receipt_keys, registrar_keys, registrar_threshold,
permitted_registration_assurances,
eligibility, resource_limits, retention, revocations
```

The exact maintainer mailbox is fixed in deployment configuration and compared to the approved policy routing identity. It is never a sender-controlled field. The client verifies the policy signature threshold, service/environment/chain, expiry and highest-seen sequence, then uses that policy's age key for local encryption. The service performs the same comparison at admission and dispatch. It holds public recipient keys only.

The maintainer confirms key possession by signing a policy challenge with the acknowledgement key and successfully decrypting a bounded challenge generated specifically for that registration. This is a possession check, not proof of the person's maintainer role. Only the independent authority establishes that role. A maintainer may publish the policy digest/key through Discord for visibility; a node signature or a familiar Discord account cannot self-grant maintainer authority.

Clients remember the highest accepted policy sequence. Production policies expire within 24 hours by proposed default. Independent publication of signed policy updates and revocations limits withholding; every online refresh still uses Tor. Recovery from expired trust or root compromise requires an independently verified replacement bundle. Normal operation has no `--ignore-key-mismatch` bypass.

Z>>> A03 (High, corroborated by three passes): a 24-hour expiry on a policy signed by offline 2-of-N administrators is a daily ceremony and a crisis-time outage; if the signers are unavailable for 48 hours all reporting stops. "Independent publication" names no channel, so every refresh is GET /v1/policy from the relay. Undefined: ciphertext encrypted under policy N and retried after N+1 with the same recipient key (line 68 covers accepted submissions only); what the registration record's policy_sha256 (line 93) is compared to during its 30-day life. See adversarial.md A03. <<<Z

Rotation keeps already accepted ciphertext associated with its original policy. Re-encryption is not possible without sender/maintainer cooperation. Old maintainer keys may be needed for pending or retained reports. Policy distinguishes accepting new submissions, dispatching already accepted ones and allowing historical verification. A compromised recipient key freezes new submissions; queued data is quarantined under explicit incident policy rather than silently sent to a replacement recipient.

## Operator registration and delegation

### Registration record

The CLI creates a registration record locally after receiving a relay-signed, bounded registration challenge:

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
  "policy_sha256": "<64-lowercase-hex>",
  "challenge_id": "<random-32-byte-base64url>",
  "challenge_nonce": "<random-32-byte-base64url>",
  "issued_at": 0,
  "expires_at": 0
}
```

Placeholders and zero times above illustrate types; this is not a usable registration. Times are integer Unix seconds. The authorizer role is exactly `node-account` or `operator-account`; derive the account address from the verified authorizer public key. Match it against the node's account or `node_operator_address` using independent chain state. Other bond providers are not authorizers.

`issued_at` is the registration record's creation time; `expires_at` is the proposed certificate expiry, bounded to 30 days after creation. `enrollment_mode` is exactly `node-signature-verified` or `registrar-witnessed`, must be allowed by policy, and cannot be changed while keeping the same challenge. The separate relay challenge has its own expiry and hashes the non-challenge registration fields. Direct cryptographic enrollment has a 15-minute challenge; witnessed enrollment allows 48 hours for human approvals. Both certificate and challenge validity constraints must hold at acceptance. A server cannot confuse a long certificate lifetime with a long window for reusing its registration challenge.

The registration digest is SHA-256 over canonical UTF-8 JSON. It covers the full encryption key, including long post-quantum recipients, without requiring that key to fit in a Discord post. Keep the immutable full record locally and submit it through the onion registry. The exact public announcement text is:

Z>>> A05 (High): two digests exist and the text never says which one the node key signs, which goes into the announcement marker, and which the possession statement carries. Line 103 hashes "the non-challenge registration fields"; this line hashes the record, which includes challenge_id, challenge_nonce, issued_at and expires_at. If the parent signs the full record, every 15-minute challenge retry invalidates an already-posted announcement. "Canonical UTF-8 JSON" is not stated to be the RFC 8785 JCS required at line 140. See adversarial.md A05. <<<Z

```text
THOR-RELAY-REGISTER-V1 sha256=<64-lowercase-hex-registration-digest>
```

Publish only this marker/digest using unmodified `make relay`. The CLI displays the record and fingerprints for operator inspection before copying the announcement text. Publication is a user act; the confidential CLI does not automatically invoke `make relay`, post to Discord, or add a direct-network exception. Direct public-key announcements can supplement the digest; an age-only announcement never authorizes a signing key.

### Establishing authorizer evidence

There are two explicit verification paths:

1. **Direct cryptographic evidence (preferred).** A separate sign-only node/wallet adapter signs the registration digest with a fixed application purpose. Alternatively, import the original signed `make relay` envelope if a compatible exporter supplies it. Verify the exact legacy signed bytes and supported account-key algorithm, derive the account address, compare `msg.text` exactly to the announcement, enforce the configured channel if relevant, and match the hashed record. The registration's own challenge/expiry prevents replay; do not assume the old Discord UUID-prefix mechanism provides this service's replay protection. Preserve the original evidence for maintainer verification. No signature-export functionality is assumed to exist today.
2. **Witnessed unmodified `make relay` (explicit weaker assurance).** If raw evidence is unavailable, independently trusted registrars view the announcement in the configured Discord guild/channel through the recognized relay bot, match node identity and digest to the full record, check fresh chain authorization, and sign attestations. Production proposal: two distinct policy-authorized registrars. Each attestation binds the full registration digest, guild/channel/bot/message IDs, observed node, validation height/time, registrar identity and expiry. A message ID/screenshot alone is never accepted. This depends on the existing relay/bot/Discord plus the registrars and is labeled `registrar-witnessed`; it must be explicitly allowed by signed policy. Otherwise unmodified `make relay` is only a public witness and sign-only evidence remains required.

Assurance labels are preserved in every submission bundle and shown by recipient tooling. A witnessed record cannot be silently upgraded to `node-signature-verified`. The preferred long-term automated path uses cryptographic evidence, without a live Discord dependency for routine reports.

Z>>> A01 (Critical) / A05 (High) / A06 (High): path 1 has no implementation route today (line 117 and line 399), so every production registration will use path 2, which the document never concludes. Path 1 gives no byte format, hash mode or envelope for the Cosmos secp256k1 signature; a 32-byte digest signed as a pre-hash is a cross-protocol hazard with transaction signing. Path 2's only signature verification is performed by the THORChain Discord relay server operator, a third party absent from the key table and the privacy promise; the attestation's bot ID defeats webhook impersonation only if registrars check the author application ID, which is not stated; two registrars from one organisation protect against nothing. See adversarial.md A01, A05, A06. <<<Z

### Confirming control and accepting registration

The communication key signs a domain-separated possession statement containing the registration digest and relay challenge. The relay also creates a random 32-byte token, age-encrypts a small fixed-format challenge to the registered reply recipient, and requires a communication-key-signed proof containing its digest and challenge ID after local decryption. Challenges are specific, single-use and short-lived; no endpoint/helper accepts arbitrary ciphertext for decryption or reports detailed decrypt errors.

Z>>> A28 (Low): the client decrypts a relay-chosen ciphertext with its long-term age identity and signs a digest of the result. The rule "no endpoint/helper accepts arbitrary ciphertext for decryption" must also bind the client: parse the fixed format and verify challenge ID, service and environment before signing. See adversarial.md A28. <<<Z

Proposed limits: direct registration challenge 15 minutes, witnessed registration challenge 48 hours, reply-key possession challenge 10 minutes, certificate validity at most 30 days; possession attempts bounded globally and per parent. Longer witnessed windows do not retain upload reservations. Both keys must be demonstrated before activation. Default accepted node statuses are Active and Standby; jail is included as a warning rather than independently making an incident report impossible. Disabled/other states require a separately labeled, policy-authorized recovery attestation. Never fall back to anonymous acceptance after failed chain verification.

Z>>> A01 (Critical): no emergency lane exists for an operator who has not pre-enrolled; R08 asked for "a separate limited lane with an explicit unverified label". A15 (Medium): with a 15-minute registration challenge, a 10-minute possession challenge and "both constraints must hold at acceptance", a flow where evidence is submitted at t=12 and possession confirmed at t=17 fails although every step was in-window. A16 (Medium): THORChain also has Ready and Whitelisted statuses; a Ready node is "other" here and would need a recovery attestation. See adversarial.md A01, A15, A16. <<<Z

Registration states: `pending -> evidence-verified -> possession-verified -> active`, or `rejected/expired`. Acceptance atomically consumes the challenge and inserts the registration. Repeating identical evidence returns the same result; conflicting records or epochs fail. Current chain authority is rechecked on each report admission and before first dispatch, not only at registration.

Z>>> A07 (High): "independent chain state" has no named source; the realistic source is the relay operator's own node, independent of the submitter but not of the relay. No validation height, time or source identifier is recorded in the outer manifest or receipt, and no maximum staleness is defined (R03 asked for both). A16: an operator-account registration whose node_operator_address changes mid-certificate fails this recheck with no stated handling, while a node-account registration keeps working. See adversarial.md A07, A16. <<<Z

### Renewal, rotation and revocation

Each fresh epoch requires a new parent-authorized registration or permitted registrar attestation. A communication key cannot renew its own authority indefinitely. Normal key rotation additionally signs continuity with the previous communication key and proves possession of the new keys. Lost/compromised old keys use parent-authorized recovery; never infer authority from control of an email address or Discord account.

Old registrations become superseded for new admission at activation of the new epoch. Registered reply-key changes are treated as key rotation, not an unauthenticated profile edit. No certificate authorizes accounts or recipients outside its fixed service/environment/chain.

A communication key may revoke itself. Parent-authorized revocation and threshold policy-authority emergency freezes can revoke an entire parent or certificate. A new announcement does not automatically clear an emergency freeze. Clients/relay reject revoked keys for new reports. Maintain revocation epochs and effective times durably; retain enough policy evidence for historical verification. A receipt issued by a compromised relay is not a trustworthy timestamp proving a stolen key was used before compromise. Independently witnessed timestamps would be needed for that stronger claim.

Z>>> A14 (Medium): "cannot renew its own authority indefinitely" implies bounded self-renewal, contradicting the first sentence of line 132. Rotation signs continuity with the previous key, but lost keys use the same parent authority, so the relay cannot distinguish rotation from recovery and continuity carries no enforcement weight unless a flag exists; none is defined. In-flight reservations at an epoch boundary have no defined outcome. See adversarial.md A14. <<<Z

## Message protocol

All application signatures use Ed25519 over `UTF8("THOR-NODE-RELAY/v1/" + purpose + "\n") || JCS(payload)` with distinct purposes for registration possession, content, submission, acknowledgement, challenge and receipt. Use [RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785) with strict schemas, integer times and no duplicate JSON member names. Do not invent a near-JCS implementation. Legacy node signatures are verified separately over their actual exact input; never pretend they use this format.

Reject unknown fields/versions, invalid UTF-8, unsupported algorithms, noncanonical key/hash encodings and invalid types. Digests are 64 lowercase hexadecimal characters. Public Ed25519 keys are unpadded canonical base64url of exactly 32 bytes; signatures are exactly 64 bytes. Identifiers/nonces are CSPRNG-generated 32 bytes. Signed numbers must be safe integers; lengths are bounded nonnegative integers. Free-text bytes are not normalized after signing. Paths are never interpreted from signed names.

### Local report package

The operator creates a submission ID, then packages:

```text
content_manifest: {
  version, environment, chain_id, service_id, submission_id,
  registration_sha256, policy_sha256, maintainer_id,
  report_recipient_sha256, created_at, message,
  attachments: [{name, media_type, byte_length, sha256}],
  reply_registration_sha256
}
content_signature,
attachment bytes
```

V1 supports one file and a message. The communication key signs the content manifest. The exact plaintext framing is ASCII `THOR-RELAY-CONTENT-v1\n`, a four-byte unsigned big-endian JSON byte length, that many bytes of JCS `{content_manifest, content_signature}`, an eight-byte unsigned big-endian file byte length, then the exact file bytes and EOF. The manifest has exactly one attachment, whose length/hash must agree with the file. JSON is at most 32 KiB and the message at most 8 KiB of UTF-8; enforce the configured overall ciphertext limit. Validate lengths before allocation; reject trailing bytes and never interpret the attachment name as a filesystem path. No archive extraction is required.

Encrypt the package locally to the policy's maintainer recipient, finalize immutable ciphertext, then calculate its SHA-256 and length. Preserve the exact ciphertext for retries. Do not upload plaintext, its hash, filename, message or descriptive subject outside encryption. The original file is not automatically deleted or modified. Implementers must provide fixed framing/canonicalization fixtures and interoperable tests rather than choosing a different container.

Z>>> A12 (Medium) / A13 (Medium) / A29 (Low): reply_registration_sha256 is invisible to the relay and unresolvable by the maintainer (the bundle carries only the submitting registration), and nothing requires it to equal registration_sha256. For every *_sha256 except the status capability the pre-image is unstated (JCS body? signed envelope? bech32 recipient string? raw key bytes?). "One file and a message" with "exactly one attachment" leaves a message-only report undefined. See adversarial.md A12, A13, A29. <<<Z

### Admission and complete upload

The signed outer manifest contains:

```text
version, environment, chain_id, service_id,
submission_id, registration_sha256, key_epoch,
policy_sha256, maintainer_id, report_recipient_sha256,
ciphertext_sha256, ciphertext_length, submission_created_at,
status_capability_sha256,
challenge_id, challenge_nonce, issued_at, expires_at
```

The relay verifies delegation evidence and communication signature, current chain eligibility, policy/revocation state, challenge freshness and quotas before granting a short-lived upload capability. The capability is bound to the full signed manifest hash. Size, hash, bounded age format and permitted recipient-type structure are checked after the complete upload. A reader must not confuse these checks with proof of proper encryption: the maintainer performs full decryption/authentication. Do not return `encryption_verified` or inspect plaintext.

Proposed submission challenge lifetime: 5 minutes, with an admitted upload reservation lasting at most 30 minutes. The complete upload is accepted only while its reservation is valid. `submission_created_at` must agree with the inner manifest's `created_at`; new admission accepts at most 24-hour-old submissions with at most two minutes of future clock skew. A retry after a challenge expires may use a new challenge while preserving the same immutable ciphertext, original creation time, status capability and submission ID; durable deduplication keys on environment, sender and submission ID. Return an existing receipt for the same content, or reject different content. Never discard a replay record early while a matching admission remains valid. Quotas still address a malicious authorized sender deliberately creating fresh submissions or dishonest timestamps; replay checks do not establish honesty.

Atomically persist accepted submission metadata, consumed challenge/reservation, quotas and outbox job. Bounded pending uploads live outside that transaction and are deleted after failed/expired validation. Server restarts cannot reset replay protection. Admission/outbox storage must be durable; process-local caches are insufficient.

Z>>> A03 / A13 (Medium): deduplication "keys on environment, sender and submission ID" without defining sender. If sender is registration_sha256, a legitimate retry after key rotation is a second accepted job and a duplicate mail while inner and outer registration digests now disagree; if it is the parent address, the retry deduplicates but the disagreement remains. Row 5's "one accepted job" depends on this choice. The challenge's "submitted context digest" (line 245) cannot be over the manifest, which contains the challenge. See adversarial.md A13. <<<Z

### Mail transport and recipient verification

The mail worker copies the original evidence, registration, policy, outer manifest/signature and ciphertext into a complete submission bundle, then age-encrypts that bundle to the same approved report recipient. Mail plaintext framing is ASCII `THOR-RELAY-MAIL-v1\n`, a four-byte unsigned big-endian metadata length, JCS metadata `{registration, authorizer_evidence, policy, outer_manifest, outer_signature, admission_receipt}`, an eight-byte unsigned big-endian ciphertext length, the original ciphertext bytes and EOF. Metadata is capped at 256 KiB, includes all required historical attestations, and contains no private key. Metadata/body caps and exact EOF are checked before allocations/processing. Size limits account for this wrapper and MIME overhead.

This additional envelope hides node identity/signatures from email providers. The relay still has no report decryption key. Revalidate routing, revocations and recipient incident policy before first dispatch.

Use one fixed server-configured destination, a relay From address, a generic subject, a random generic attachment name and no operator Reply-To. No client email headers, CC/BCC, arbitrary recipient, callback URL or remote-file URL. Base64/MIME overhead counts toward the actual mail-provider limit; choose limits conservatively after testing that provider. Retry temporary failures with bounded backoff; quarantine persistent/uncertain cases visibly. Do not claim exactly-once SMTP delivery. Duplicate messages preserve the signed submission ID; recipient tooling deduplicates them.

Z>>> A08 (High): no provider, domain or credential owner has been chosen; ~14 MB on the wire after metadata, wrapper and base64 fails common 10 MB inbound limits; an unknown relay From address with a generic subject and a random-named opaque binary is the spam-quarantine profile; there is no bounce handling beyond "quarantine visibly". The maintainer already runs the CLI over Tor (line 209), so an onion pull of the bundle removes the provider, credentials, size limit and permanent third-party copy. R10 recommended exactly that; this document keeps attached email without recording why. A14: "revalidate … before first dispatch" (line 187) does not say whether a receipted report whose node churned out or whose key was superseded is sent, quarantined or dropped. See adversarial.md A08, A14. <<<Z

The maintainer locally:

1. Fully unwraps the mail envelope into staging.
2. Independently verifies the original registration/evidence, policy and outer signature; checks admission assurance, sender, destination and exact ciphertext hash/length. A relay's “verified” label is insufficient. Validate admission-time authorization using retained trustworthy history; do not reject a report merely because it was read after certificate expiry.
3. Fully decrypts the report to staging, verifies inner content signature, identity agreement and attachment hashes/lengths.
4. Presents content only after all required checks finish; does not execute, preview HTML, fetch links or automatically extract archives. Optional extraction requires explicit path/symlink/resource defenses.
5. Signs an optional acknowledgement binding submission ID, registration, policy, ciphertext hash, environment and outcome (`received`, `verified`, or `reviewed`). Neither acknowledgement nor signature establishes that a report is true.

A failure discards staged output and leaves an explicit verification error. Valid-node files remain hostile input. Inspection/redaction occurs locally; the CLI never automatically collects node backups or key directories.

Z>>> A13 (Medium): "identity agreement" in step 3 never lists which inner and outer fields must agree, and R06's "explicitly authorized forwarding relationship" is neither defined nor forbidden. A07 (High): step 2's "retained trustworthy history" has no named retainer; THORNode prunes by default, and if the relay retains it the maintainer is checking relay evidence against relay history, contradicting "A relay's verified label is insufficient". See adversarial.md A07, A13. <<<Z

### Receipts, status and replies

Expose `accepted`, `queued`, `smtp-accepted`, `delivery-uncertain`, `failed`, `maintainer-acknowledged` and `quarantined`. A relay-signed receipt proves only that the relay signed that acceptance claim. SMTP acceptance is not maintainer receipt, and no service-side status removes censorship risk.

Private polling uses an unguessable status capability in an authorization header, never a URL/query string. The CLI generates and persists it before submission; the relay stores only its hash, included in the mandatory signed `status_capability_sha256` field. This prevents a lost response from losing access to status. It also prevents an attacker swapping the token to gain status visibility. The capability is 32 CSPRNG-generated bytes, encoded canonical base64url for transport; its digest is over the decoded bytes.

Acknowledgements and optional human replies are encrypted to the operator's registered age recipient and signed by the authorized maintainer acknowledgement key. They bind the original report, original policy, currently trusted acknowledgement policy and reply-recipient fingerprint. The operator checks the acknowledgement key's current authorization/revocation, not just an old certificate bundled by the relay. The maintainer checks reply-recipient revocation before creating a new response; a revoked recipient suspends replies until independently verified replacement-key authorization. Already encrypted replies cannot be repaired by a relay that lacks plaintext and are quarantined if recipient compromise is reported.

The proposed maintainer-response upload is also onion-only. Its signed manifest binds environment, service, original submission/registration/ciphertext digests, current acknowledgement policy, response ID/type, reply-recipient fingerprint, encrypted response digest/length and a single-use response challenge. Use distinct signature purposes for response admission and response content. The relay verifies the current policy-authorized maintainer key, original accepted submission, challenge and bounded body; it cannot decrypt the reply. V1 permits one acknowledgement and one human reply per report, each at most 32 KiB ciphertext, with atomic response-ID deduplication and independent quotas. Signed content inside reply encryption binds the same original context; operator tooling verifies it before presentation. A relay label alone never authenticates the response. Exact response schemas, encoding fixtures and maintainer-tool interoperability remain required before this optional feature ships.

Return replies only through the status capability; email notification contains no operator email. A stolen reply age identity does not authorize new submissions. Public registration keys do not confer permission for an open bidirectional email relay.

Z>>> A12 (Medium) / A23 (Medium): the relay's listed response checks never include "reply-recipient fingerprint equals the accepted submission's registered recipient". The operator's only policy source for checking the acknowledgement key is the relay, which can serve a still-valid previous policy beside a response signed with a just-replaced key; after a normal ack-key rotation, line 68's historical-verification mode is not applied to responses. See adversarial.md A12, A23. <<<Z

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
bodferd receive verify               # Maintainer local verify/decrypt/staging
bodferd receive respond              # Local signed/encrypted response; Tor-only upload
```

`registration prepare` can emit public keys or a digest announcement for the operator to manually enter into `make relay`. It does not print secrets. Signing adapters accept inspectable files and emit attestations; they cannot accept arbitrary remote shell commands. Node keyring/wallet compatibility and envelope-export integration are separate implementation prerequisites.

| Endpoint | Contract |
|---|---|
| `GET /v1/policy` | Threshold-signed public policy, bounded response |
| `POST /v1/registration-challenges` | Bounded claimed parent/service/environment -> signed one-use challenge; claim not yet trusted |
| `POST /v1/registrations` | Exact record, authorizer evidence, comms proof -> bounded encrypted reply-key possession challenge |
| `POST /v1/registrations/confirm` | Signed possession proof -> active registration or explicit rejection |
| `POST /v1/registrations/revoke` | Scoped signed revocation -> durable revocation receipt |
| `POST /v1/submission-challenges` | Claimed registration/policy/context -> signed bounded one-use challenge; verify authority before expensive work |
| `POST /v1/submissions` | Signed manifest and bounded registration/evidence references -> capability/reservation or previous receipt |
| `PUT /v1/submission-body` | Capability in authorization header, raw bounded ciphertext -> accepted receipt after atomic validation/outbox insert |
| `GET /v1/submission-status` | Status capability in authorization header -> signed status and optional maintainer-encrypted response |
| `POST /v1/maintainer-response-challenges` | Bounded signed maintainer context for an accepted report -> policy-key-signed one-use response challenge |
| `POST /v1/maintainer-responses` | Policy-authorized maintainer signature over response manifest plus bounded encrypted body -> response attached to original accepted submission |

Every endpoint is on the dedicated onion service. Requests cannot select URLs/providers/SMTP routes. Signed challenges bind service, chain, environment, purpose, submitted context digest, nonce and expiry; the client verifies the policy-authorized receipt key. Token-bearing headers and bodies are redacted from access/error/trace logs. No public registry dump or list of submitted reports.

Z>>> A23 (Medium): POST /v1/maintainer-response-challenges is described as "policy-key-signed", which names the offline authority as a per-request signer; every other challenge is relay-key-signed (line 39). Likely a wording slip; must be fixed before implementation. See adversarial.md A23. <<<Z

## Standalone repository, deployment, resources and retention

Use this standalone repository for the future CLI, relay, operator/maintainer tooling and documentation. Suggested implementation directories are `cmd/`, `internal/`, `protocol/`, `deploy/` and `docs/`; the current tree ships documents only. Keep this service isolated from unrelated applications and credentials.

Prefer a separate Go CLI/service using supported upstream age and standard signing libraries. Pin actual library/tool versions after compatibility testing; source availability is not a supply-chain guarantee. Authenticated releases, verified dependency hashes/build provenance, reproducible build instructions and independent protocol/parser review precede production use.

Deploy separately from the swap server and its registrar credentials: dedicated namespace/storage/onion identity, private listener reachable only from its Tor endpoint, and an enforceable default-deny network policy. No clearnet ingress. A private socket/shared-pod boundary is an alternative where CNI enforcement is unavailable. Restrict the mail worker's egress to the configured mail transport and required verification route; don't treat an unrestricted Tor proxy as an egress allowlist. Production mail transport must use authenticated TLS with certificate verification.

Keep server-side credentials only as estate-PGP SOPS records under `k8s/creds/`. The relay never receives operator signing/age secrets or maintainer age identities. Operator and maintainer CLI identity files reside in their own protected local environments, outside repository artifacts. Read-only root filesystem, non-root execution, least privilege and resource caps are required. If deployed in the existing estate, all cluster changes follow git/CI/Flux; no local Docker builds or direct cluster mutations. Establish dedicated repository CI and deployment configuration before first deployment.

The submitter needs a local Tor client, not a public relay. The client transport exclusively uses a configured local SOCKS endpoint, passes the pinned onion hostname through SOCKS, rejects redirects/direct fallback, and uses supported stream isolation. No telemetry or background direct-network checks. A high-assurance deployment may restrict the submission process's network access to that local endpoint; local/offline signing remains explicit. Public Discord enrollment is a separate, visibly public operation and is not covered by the Tor-only submission promise.

Z>>> A09 (High): the onion hostname is the service_id pinned in every registration, manifest and policy, so losing or rotating the onion key re-enrolls the entire operator base through the 48-hour path; onion key custody, HA and Tor daemon upgrades are not mentioned. Replay and admission state must be durable, spools are excluded from backups, and nothing says what is backed up: the registration table, consumed-challenge store, tombstones and the revocation high-water marks that must outlive certificates. A host loss with no restore makes revoked keys valid again. See adversarial.md A09. <<<Z

Proposed pilot defaults, subject to provider/load verification before production:

| Control | Default | Reason / verification |
|---|---|---|
| JSON/evidence body | 32 KiB; bounded depth/field lengths | Allow supported keys/evidence while rejecting resource bombs |
| Report ciphertext | 10 MiB; no automatic splitting | Test complete outer/MIME size against real provider limit |
| Pending upload | One per parent operator, 30-minute maximum | Limit authenticated resource pinning; slow Tor upload test |
| Parent quota | 5 reports/day and 25 MiB/day | Count delegates/nodes sharing an operator together; signed-policy incident adjustment |
| Global spool | 512 MiB; bounded concurrent uploads/workers | Backpressure before quota allocation; disk-full tests |
| Report retention | Delete relay ciphertext after SMTP acceptance, or 7 days after acceptance if undelivered | Email copies remain; document irreversibility of already sent mail |
| Receipt/status retention | 30 days | Hash-only minimal metadata where possible; no public identities in logs |
| Consumed challenge retention | Beyond its final valid upload reservation | No restart/time-window replay |
| Accepted-ID tombstones | 90 days; older IDs outside the signed creation window rejected | Durable deduplication without indefinite body retention |

Hash/ID tombstones and minimal authorization records still constitute potentially identifying metadata. Registration remains available for its validity plus a bounded historical-verification window; revocation high-water marks outlive removed certificates. The full acceptance-time evidence is forwarded inside the encrypted mail bundle. Delete expired challenges and failed upload bodies. Do not include report spools in routine backups by default. Limit logs to aggregate health/error classes; review observability settings for token/signature leakage.

V1 has no padding bytes: its exact framing ends at EOF after the attachment. A future version may define authenticated padding to policy-defined size buckets inside client encryption, with explicit framing and interoperability fixtures; overhead counts toward quotas. Batching/delay is optional and disabled for urgent incident reports by default. Static age keys do not supply forward secrecy; rotation and short retention reduce exposure but do not erase mail archives. Supported post-quantum encryption can address future cryptanalysis, not private-key theft. True forward secrecy needs a separately reviewed protocol/key lifecycle.

Z>>> A19 (Medium): 512 MiB is about 50 maximum-size reports draining through one mailbox; the only relief is "signed-policy incident adjustment", i.e. the A03 offline ceremony during the incident. R13 asked for reserved incident capacity; this is a quota. A20 (Medium): with minimal logs, no public status and no push, a broken SMTP credential, a spam rule, an expired policy or a dead Tor daemon all look like "no incidents today"; no canary or heartbeat is designed. See adversarial.md A19, A20. <<<Z

## All ten review controls integrated

| Review item | Owning mechanism | Required acceptance evidence |
|---|---|---|
| 1. Proper-encryption claim | Opaque admission; maintainer full decryption | Signed malformed ciphertext cannot be labeled encryption-verified; recipient rejects it |
| 2. Circular recipient trust | Independent threshold-signed policy, pinning, sequence/expiry | Substituted recipient and expired/rolled-back policy rejected before local encryption |
| 3. Unsafe reuse of `make relay` | Public registration only; separate confidential transport/sign-only adapter | No report contents enter Discord workflow; original evidence or labeled registrar attestations required |
| 4. Powerful key exposure | Ed25519 delegation and scoped renewal/revocation | Routine reports work without node keyring access; delegate cannot extend its own authority |
| 5. Signature binding/replay/authorship | Inner content signature, outer context/ciphertext signature, durable atomic outbox | Changed destination/file/context rejected; retries/concurrency/restarts produce one accepted job |
| 6. Valid operator definition | Exact account authority, fresh state, explicit statuses/recovery | Unrelated provider/self-generated signer rejected; Standby incident reporting succeeds |
| 7. Tor and identity limits | SOCKS-only transport, pinned onion, honest privacy promise | Proxy failure/redirect cannot produce direct egress; relay identity visibility documented |
| 8. Whole-report/email privacy | Client package encryption, encrypted forwarding bundle, generic mail, retention | Mail provider cannot see node identity/message/filename; static-key exposure remains explicit |
| 9. Abuse/hostile attachments | Admission-before-body, quotas/caps, staged recipient verification | Slow/large/authorized floods bounded; no unsafe opening/extraction or partial output presentation |
| 10. Delivery/test separation | Durable status, maintainer-signed ack, distinct policy/keys/routes | SMTP acceptance differs from acknowledgement; test report can never route to production mailbox |

Also test registration key possession, public-announcement substitution, compromised Discord/registrar behavior, wrong maintainer role, simultaneous epoch rotations, emergency freeze persistence, capability substitution, storage loss/restart, retention cleanup, and post-compromise receipt backdating limits. Independent protocol review and implementation evidence are required before marking any control implemented.

Z>>> A22 (Medium): no row maps to an R-number; the review has nineteen findings. A17: Row 10 omits R12's "production refuses to start with test configuration and vice versa". A07: Row 6 claims "fresh state" without a recorded height or staleness bound (R03). A01: Row 6 and the R08 remediation have no emergency lane. See adversarial.md A01, A07, A17, A22. <<<Z

## Evolution into secure operator and trusted-group communications

The intended direction includes operator-to-operator conversations and conversations with THORNode developers and explicitly trusted groups. V1 implements confidential reporting and bounded encrypted replies only. The identity registry is a foundation for later messaging; a report registration is not a grant to join any group, discover all operators, or retrieve another operator's inbox.

### Reuse a messaging system; own identity and authorization

Bodferd should own the chain-to-communication identity binding, developer-role attestations, verification display and group admission policy. It should delegate conversation encryption, session state and device management to an established system or independently reviewed implementation. Evaluate an integration with an existing end-to-end encrypted messenger before building a separate transport. Signal documents distinct protocols for key agreement, ratcheting and multi-device sessions; importing its library alone does not establish compatibility with the Signal service. [Signal technical documentation](https://signal.org/docs/).

For an independent group transport, evaluate a maintained, audited implementation of Messaging Layer Security. RFC 9420 specifies asynchronous group key establishment with forward secrecy and post-compromise security. MLS is a cryptographic component, not a complete chat application, identity directory or anonymity system. Selection of a product/library, versions and license compatibility remains a separate design decision. [RFC 9420](https://www.rfc-editor.org/rfc/rfc9420).

Z>>> A21 (Medium): MLS assumes exactly the split this document already has (trusted Authentication Service = the Bodferd registry; largely untrusted Delivery Service) with group state, membership, epoch rotation and removal inside the protocol, and OpenMLS / mls-rs are built for third-party use with permissive licences and uniffi bindings, which satisfies the "no bespoke FFI" rule from Go where libsignal cannot. Two cautions: neither claims an independent full audit (mls-rs states so; OpenMLS had advisory GHSA-qr9h-x63w-vqfm in 2025, fixed in 0.7.1), so "audited implementation" may be unsatisfiable as written; group ID and epoch are visible to the delivery service. See adversarial.md A21. <<<Z

Do not turn the email relay into a chat server, distribute a shared static age group identity, build a home-grown ratchet, or treat adding recipients to an age header as group membership security. V1 report keys and durable content signatures retain their original semantics. Separate protocol versions and keys must distinguish future conversation traffic from evidentiary incident reports; conversation authentication and deniability requirements need explicit review rather than automatically signing every chat message with the report key.

### Identity and group boundaries

| Principal | Authority source | What it can authorize |
|---|---|---|
| Node operator | Current chain relationship plus scoped delegation | Its communication identity and approved devices; requested group enrollment |
| THORNode developer / maintainer | Independent signed role roster, with out-of-band bootstrap | Actions allowed by that developer role; no automatic node account authority |
| Group administrator | Explicit group-specific policy | Invitations, removals and permitted membership changes in that group |
| Directory / delivery server | No independent role-granting authority | Routing and bounded storage; no silent key substitution or membership expansion |

Z>>> A21 (Medium): if zkgroup is adopted (line 385), whoever holds ServerSecretParams can issue an auth credential for any UID it knows and knows every UID it issued to; the issuer is a membership-authority root and belongs in this table as a trusted role. See adversarial.md A21. <<<Z

Future device credentials bind a device's messaging-protocol public keys to a communication identity, environment, expiry, credential sequence and allowed purposes. They use protocol-native keys and formats where required; the age reply key is never silently repurposed. New-device enrollment requires existing trusted-device approval or explicit parent/role-authorized recovery. Merely authenticating to the relay, controlling an email address or presenting a stale node certificate cannot enroll a device. Key changes appear to peers and administrators with a verification path independent of the directory.

Groups have an immutable group identifier, named policy owner, explicit administrator authority, admission assurance, membership visibility and history policy. A node certificate proves eligibility for a policy check, not that its holder is a developer or already belongs to every operator group. Invitations are bounded, single-use and confirmed by the invitee. Parent chain authority is rechecked at relevant membership changes; node exit, role expiry, device compromise and emergency freeze trigger removal of affected devices and protocol-native epoch/key updates. Removed devices cannot decrypt future messages after an applied removal; they retain previously learned plaintext and keys. No remote deletion promise can undo that exposure.

A membership authority cannot silently grant itself all groups. Clients authenticate membership changes against group policy and surface them to members. Directory proofs, detectable equivocation, administrator collusion and roster compromise require evaluation in the selected messaging system; a signed central roster alone does not prevent different clients receiving conflicting authorized views.

### Delivery, privacy and recovery requirements

An optional encrypted mailbox uses per-device opaque delivery capabilities, bounded offline storage and independent quotas. Device-list refresh, key-package/prekey fetches, delivery, receipts, attachments and any push mechanism all need an explicit Tor transport design. Reusing a messenger that contacts its clearnet servers directly would violate Bodferd's intended network boundary; Tor support, DNS behavior and background traffic must be demonstrated, not assumed. Notification previews contain no message text or node identity by default.

Public node enrollment already reveals participation. Group membership, contact graphs, traffic timing, size and device activity may reveal more. V1 does not promise to hide those from its identity-aware relay. A future metadata-hiding delivery service would need a separately reviewed separation between authenticated enrollment and delivery, with abuse controls that do not recreate a global public contact graph. Contact discovery is opt-in and scoped; do not expose a list of all registered operators or arbitrary unauthenticated key lookups.

Forward secrecy depends on endpoint key deletion and implementation behavior, including backups. Backing up ratchet or group secrets may undermine it. Recovery must reestablish device authorization and notify peers; an operator losing all devices cannot transparently regain old conversation history through a server-held decryption master key. History sharing with new members is disabled by default and requires an explicit, visible group decision if supported. Endpoint compromise, a legitimate member copying messages, message truth and censorship remain outside transport encryption's guarantees.

### Evidence required before expanding scope

Before choosing a conversation stack, demonstrate a two-operator and developer-group pilot over Tor; authenticated device replacement; stale-role and removed-device rejection; independent key verification under directory substitution; offline catch-up and conflicting membership-change recovery; bounded malicious-member uploads; and measured metadata exposure. Use the selected protocol's interoperability and security tests and obtain independent review of the identity integration. No production chat or group API is authorized by the v1 report certificate. The decision gate is whether an existing product can meet these requirements with a small identity adapter; if it cannot, record the specific unmet requirements and implementation cost before proposing a new messenger.

## Signal integration and Bodferd trust

This section is a proposed integration design, not an implemented Signal client. Sources were inspected on 2026-10-14. The recommendation is to keep the reporting CLI small, evaluate a companion workflow using the existing Signal app, and run a bounded libsignal integration investigation before committing to an independent messenger. The strict Tor-only and automatic membership requirements are acceptance gates; a companion workflow that fails them is not the target solution.

### What Signal code actually supplies

`libsignal` contains the message protocol and related components, including private-group primitives. Its supported products for Signal's own use expose Java, Swift and TypeScript interfaces over Rust. Upstream explicitly says third-party use is unsupported and APIs can change. There is no established Go integration promised here. Pin a tested release/commit, isolate its bindings behind a narrow adapter, retain upstream tests and budget continued security-update work. No Signal dependency is installed by this design. [libsignal source and support boundary](https://github.com/signalapp/libsignal).

Signal's server is also open source, but running it brings infrastructure requirements, including FoundationDB, and does not alone provide the complete product or operational setup. A source fork is not a turnkey private Signal deployment. [Signal-Server build documentation](https://raw.githubusercontent.com/signalapp/Signal-Server/main/README.md).

Z>>> A10 (High): "including FoundationDB" understates the magnitude. The server config also requires DynamoDB, four Redis clusters, object storage, APNs and FCM, a registration service, SGX contact discovery, SVR and server zk parameters; and the groups backend (encrypted roster, GroupChange authentication, credential issuance) is a separate AGPL repository, storage-service on Bigtable, not Signal-Server. See adversarial.md A10. <<<Z

The inspected libsignal and server projects use AGPLv3. Bodferd's current original documents and static reading code are MIT-licensed; that does not relicense incorporated Signal code. Choose a compatible distribution structure and satisfy the relevant upstream license before adding a dependency or fork. License selection for a combined messaging product remains a recorded decision. [libsignal license](https://github.com/signalapp/libsignal/blob/main/LICENSE).

### A. Integrating with the existing Signal application

A companion mode can verify a node-authorized Bodferd registration, then help an operator bind it to a Signal contact through a short-lived challenge answered within an encrypted conversation. Both participants independently compare the Signal safety number using the authenticated Bodferd relationship or another trusted channel. Safety numbers belong to a pair of contacts; they are not a universal node certificate. Reinstallations/key changes require renewed verification. A username, profile name or successful account challenge alone cannot establish the node-to-current-identity-key binding. [Signal safety-number documentation](https://support.signal.org/hc/en-us/articles/360007060632-What-is-a-safety-number-and-why-do-I-see-that-it-changed).

Group administrators can inspect current Bodferd credentials, approve invitations and remove members through Signal's normal controls. Signal supports private groups, administrator controls and optional administrator approval of invitations. [Signal group documentation](https://support.signal.org/hc/en-us/articles/360007319331-Group-chats).

This route preserves the existing app's UX and update path, but stock clients do not implement the proposed Bodferd credential rules. This design has not established a supported Signal bot, enrollment or group-management API. A companion label is advisory; it cannot compel an unmodified client to stop sharing group keys after a chain-role revocation. Do not put a decryption bot in every group to enforce membership: that gives the bot access to content and group relationships. Do not claim this route meets Tor-only transport without demonstrating every network path. Use it as an optional pilot, not an automatic fulfillment of the intended policy.

Z>>> A11 (High): this option cannot meet the Tor-only gate at line 257: stock Signal's push (APNs/FCM), CDN, SGX contact discovery, phone-number registration and SVR paths are fixed by the Signal service, official clients offer only a TLS proxy, and a phone number is an identity disclosure never budgeted here. The challenge-in-conversation at line 347 proves that whoever controls the Signal account's sessions can also sign with the comms key at that instant; it does not bind the identity key the service served the peer, and stock Signal exposes no API from which a companion can obtain it. "Administrator approval of invitations" at line 349 is the group-link join-request setting, not invitations. The design should conclude that this option fails its gates rather than pilot it. See adversarial.md A11. <<<Z

### B. An independent client using Signal components

The candidate architecture has three explicit boundaries:

| Layer | Reuse / responsibility | Authority boundary |
|---|---|---|
| Bodferd identity and policy | Verify node relationships, developer attestations, device delegations and group permissions | Authorizes identities/actions; possesses no conversation decryption key |
| Local messaging adapter | Pinned libsignal session/group primitives, encrypted local state and authenticated control messages | Keys remain on endpoints; application policy governs which devices receive them |
| Tor delivery and group storage | Bounded ciphertext queues, encrypted group state and protocol-native proof verification where adopted | Routes data; cannot silently appoint developers, enroll devices or rewrite trusted policy |

The first reporting CLI may remain Go. A future client can use an upstream-exposed TypeScript/Java/Swift interface or a reviewed Rust integration, without claiming that a Go wrapper already exists. Do not build bespoke FFI, prekey or ratchet code as a shortcut. An independent network uses its own service identifiers and deployment; neither stock Signal-server compatibility nor access to Signal's production network is assumed.

Z>>> A10 (High): the identity/policy layer is Go, libsignal has Java/Swift/TypeScript bindings only, and bespoke FFI is forbidden, so the "narrow adapter" in the table above is either FFI, an IPC boundary with a bespoke control protocol, or a second implementation of the verifier in another language. State the consequence: Option B is a new client in TS/Java/Swift/Rust. Also: libsignal supplies a sender-key cipher and distribution messages, not a group system; roster, membership operations, group identifiers and credential issuance live in storage-service and the Signal app code and would have to be written. See adversarial.md A10. <<<Z

Retain library-native authenticated session establishment and ratchet behavior instead of changing KDF inputs or mixing chain signatures into message encryption. Signal publishes PQXDH, Double Ratchet and multi-device session specifications; the selected implementation/version and complete session lifecycle must establish the exact supported security properties. Forward secrecy and compromise recovery require correct state handling, key deletion and subsequent honest exchanges; changing a dependency name does not establish them. Group properties must be evaluated separately from pairwise ratchets. [PQXDH specification](https://signal.org/docs/specifications/pqxdh/), [Double Ratchet specification](https://signal.org/docs/specifications/doubleratchet/), [Sesame specification](https://signal.org/docs/specifications/sesame/).

### Bind trust to the actual device; do not alter the ratchet

A proposed Bodferd messaging credential binds: application purpose/version, environment and chain, authorizer evidence, communication registration digest, subject identifier, messaging device ID, hash of the protocol-native public identity key, credential sequence, issued/expiry times, issuer and explicit capabilities. The communication identity authorizes its device; independent policy grants developer/group-administrator roles. Demonstrate possession through the selected messaging protocol before activation. Do not assume libsignal identity keys are Ed25519, convert age identities, or reuse node secrets as ratchet material.

Z>>> A10 (High): libsignal identity keys are Curve25519 (type byte 0x05, XEdDSA signatures) and in Signal's deployed model are per account, shared by every linked device; (device ID, hash of identity key) is therefore (device ID, hash of account key) and does not identify a device, so "role revocation removes all affected devices" at line 379 cannot be expressed as rejecting an identity key. Choose per-device keys (a departure from the Sesame model cited at line 365) or per-account binding, and say which of the ACI or PNI identity key is hashed. A25 (Low): two identity roots with no stated conflict order for honest re-key or stale credential. See adversarial.md A10, A25. <<<Z

Peers verify the full binding and current authorization before establishing a trusted conversation. The UI shows provenance such as node-signature-verified or registrar-witnessed, role issuer, last chain-state check, expiry and device changes. A witnessed node binding never becomes a stronger label just because it travels through Signal encryption. A delivery server cannot swap an identity key while retaining the old certificate; clients reject mismatch rather than silently applying trust-on-first-use.

Trust is a set of scoped facts and capabilities, not a global numeric score. Examples include current node operator, independently approved developer, member of a named response group and administrator of that group. A policy can require one or more of these facts. Active-to-Standby churn does not by itself remove an operator if both statuses satisfy policy; loss of the actual operator relationship affects the node-derived role, not unrelated independently issued roles. Refresh cadence, maximum staleness and offline behavior are explicit policy choices. Expired or uncertain authority blocks new privileged membership changes; no indefinite silent grace.

### Enforce membership in clients and key distribution

Group policy names eligible roles, permitted assurance levels, policy owner, invitation/removal rules, administrative threshold, visibility and history access. Approved invites bind the group, exact device identity keys, credential digests and expected group-state version. Clients validate them before distributing secrets. The messaging system's authenticated group state/control path carries the membership change; a plaintext badge or a SQL role update is insufficient.

Clients refuse unapproved device additions and policy changes, authenticate the resulting membership revision and stop new confidential sends when removal/key update is pending or views conflict. Role revocation removes all affected devices through the selected group protocol and stops distributing new sender/group secrets to them. Verify the concrete libsignal/client implementation's removal, key-rotation and queued-message behavior; private-group administration alone is not proof of group post-compromise security. Already authorized members can still retain or copy messages, forward secrets, or collude. A bot or server-side ACL cannot revoke previously learned plaintext.

Different read audiences use different encrypted groups. Giving every member the same decryption secret and hiding developer-only messages with a UI role check does not enforce confidentiality. The signed trust credential authenticates eligibility; it is not attached as a transferable node signature to every chat message. Incident reports can remain durably signed while conversation deniability requirements are assessed separately.

Z>>> A21 (Medium): decide rather than defer. Eligibility can only be checked at session establishment and group admission; sender-key group messages carry a per-chain signature and are not deniable among members; and the Bodferd credential is by construction a durable transferable proof that node N operates identity key K. That is materially weaker than pairwise Signal and should be stated as the chosen property. See adversarial.md A21. <<<Z

### Preserve group privacy rather than exposing roles to every server

Signal's private-group design stores encrypted membership state and verifies credential presentations without learning the member identity from that presentation. Its libsignal `zkgroup` components are worth evaluating before building a central plaintext membership database. Keep custom role evidence inside encrypted group state, visible to entitled members, rather than publishing node/developer/group tuples for routing. [Signal private-group system](https://signal.org/blog/signal-private-group-system/).

This is not an invitation to add arbitrary attributes to a zero-knowledge proof. The inspected upstream authentication API has specific identity/time inputs and verification against group parameters; it is not a generic constructor for node-bond or developer-role proofs. Reuse supported issuance/presentation formats. A chain-role credential can gate issuance or be checked by authorized clients, with its exact privacy and issuer knowledge documented. Custom zero-knowledge role proofs require independent cryptographic design and review. [Upstream credential API](https://github.com/signalapp/libsignal/blob/main/node/ts/zkgroup/auth/ServerZkAuthOperations.ts).

Enrollment already knows the node; the report relay remains identity-aware. Future group delivery must separately assess whether issuance and presentation are linkable through accounts, capabilities, logs, timing or colluding services. Do not present separation of two services as unlinkability by itself. Signal's sealed-sender design targets sender metadata, but importing libsignal does not automatically enable it in a new transport. Tor hides network location; it does not erase identifying application headers or global timing correlation. [Signal sealed-sender design](https://signal.org/blog/sealed-sender/).

### What must still be built and verified

Bodferd still owns endpoint storage, rollback-safe atomic session updates, bounded skipped-message keys, device recovery, invitations, abuse controls, attachments, notifications, updates and supply-chain verification. Queue retry/replay handling cannot restore old ratchet state or reuse consumed prekeys. Avoid key-bearing backups that undermine forward secrecy. Do not add message-content telemetry, directory dumps or clearnet fallback. A known-good library protects the primitives; the integration and endpoints can still compromise them.

Before selecting this path, the investigation must demonstrate two operators and a developer group; offline and out-of-order delivery; authenticated device replacement; rejection of substituted devices and stale credentials; concurrent membership changes; multi-device removal with fresh key distribution; crash/restart recovery without state rollback; Tor-only background traffic; and a server compromise that reveals no message plaintext. Record which metadata each server/issuer can see. Assess the pinned component's group security independently, update burden and license compatibility. Keep stock-Signal companion, libsignal client and MLS alternatives open until this evidence distinguishes them; no implementation stack is approved by this document.

## Remaining implementation prerequisites

The design is complete enough to define boundaries, but these external facts remain unverified: actual maintainer/registrar identities and fingerprints; permission/access for any future Discord integration; original signed-envelope export from supported node releases; wallet sign-only format compatibility; independent chain verifier availability and historical-state retention; dedicated onion provisioning; provider attachment/TLS limits; pilot resource/retention suitability. Container framing is specified above; interoperable implementation fixtures remain required validation work.

Z>>> A01 (Critical): draw the conclusion these prerequisites imply: until an upstream sign-only or export primitive ships, production enrollment is registrar-witnessed only, operators must pre-enroll, and a non-enrolled operator cannot report during an incident. A02: the release signer, the out-of-band fingerprint channel and the independent revocation publication location belong on this list. See adversarial.md A01, A02. <<<Z

None requires substituting a weaker claim. Prefer direct cryptographic enrollment; witnessed `make relay` is available only with explicitly authorized registrar trust. Bootstrap maintainer roles independently. Ship initially to the synthetic test environment, verify all controls, and then provision production through the repository release process when requested. This document does not activate services, publish keys, register users, send mail or authorize use of unprovisioned production secrets.
