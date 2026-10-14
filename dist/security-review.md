# Adversarial review: proposed THORChain confidential node relay

Reviewed 2026-10-14. This reviews the user's proposed CLI/service design, not an implemented relay. Findings describe design risks, not demonstrated vulnerabilities in an implemented Bodferd service. Independent identity and cryptography/privacy reviews informed this register; recommendations below are application design judgments.

## Scope and verdict

Proposal: a node operator signs a communication using a node/operator key, encrypts a file locally with age after checking the recipient against the service, uploads over Tor, and the service validates it before emailing `itzamna@thorchain.org`. Testing uses `pfc@pfc.zone`.

The architecture is viable for confidential, authenticated submissions. The stated requirement that an opaque relay verify correct encryption needs revision. Recipient trust, exact signature semantics, replay protection, node authorization, delivery semantics, and recipient handling must be specified before implementation.

Intended boundaries:

- The relay sees the submitting node identity and admission metadata, but has no report decryption key.
- The maintainer sees the report and its verified sender identity.
- Email systems see delivery metadata and retain ciphertext; they should not see report contents or node identity.
- Tor reduces network-location exposure. It does not make a signed node submission anonymous to the relay.
- Compromise of the submitting machine or the maintainer's decryption environment can disclose plaintext. Compromise of the relay can disclose admission metadata, disrupt delivery, or issue dishonest receipts.

No actual recipient public key, maintainer key confirmation, current node-launcher version, or email-provider arrangement was supplied. Those are prerequisites, not facts established by this review.

## Findings register

### R01 — Critical: correct encryption is not publicly verifiable with ordinary age

**Component attacked:** server validates that the file is properly encrypted to the maintainer.

**Argument:** a public-key-only relay can check bounded format and a signed declaration, but ordinary age does not provide a proof of recipient decryptability or full ciphertext integrity. A signature over garbage remains a valid signature. Giving the relay the maintainer's private key destroys the intended confidentiality boundary.

**Evidence:** the [age format](https://c2sp.org/age@v1.1.0) authenticates the header and payload using secret material. Native X25519 stanzas do not disclose the recipient public key. Tagged recipient types support recipient matching, but matching alone does not authenticate the payload.

**Remediation:** promise “authorized sender, declared recipient policy, bounded age-format ciphertext,” with full decryption verification at the maintainer. Do not label syntax inspection “encryption verified.” A stronger publicly verifiable encryption requirement would need a separately reviewed cryptographic scheme, not a header check. A malicious sender already controls their plaintext; no client protocol prevents them sharing it elsewhere.

### R02 — Critical: checking a key against the service is circular trust

**Component attacked:** local encryption recipient confirmed using the relay's stored key.

**Argument:** if that service supplies and approves an attacker's key, the CLI can confidentially send the report to the attacker while appearing successful.

**Evidence:** no independent trust anchor is present in the proposal. Onion authentication authenticates the chosen service, not its assertions about a maintainer key.

**Remediation:** independently confirm the maintainer's key. Pin an offline policy-signing root in authenticated CLI releases. Serve a signed policy binding recipient public key/fingerprint, maintainer identity, environment, onion identity, policy version, validity, and revocations. Verify it locally before encryption; reject rollback, expiry, disagreement, and unapproved changes. Remember the highest accepted policy version. Specify root recovery and revocation publication; a compromised relay can withhold a newer policy, so use short validity and an independent refresh path. Never provide a routine “ignore mismatch” option.

### R00 — High: existing `make relay` broadcasts rather than only signing

**Component attacked:** reuse `make relay` as the signing step for confidential submissions.

**Argument:** the existing command prepares and broadcasts a message through the Discord relay workflow. Calling it with report text can publish confidential text through the wrong service; even publishing ciphertext exposes identity and timing. It is not a local sign-only primitive.

**Evidence:** the [launcher wrapper](https://gitlab.com/thorchain/devops/node-launcher/-/blob/4467f8d64eb6ca0b8e8ec09f77f37227d3ae9252/scripts/relay.sh) passes channel/message to the node wrapper. The current [THORNode query command](https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/client/cli/query.go) calls `Prepare()` and `Broadcast()`. Its [relay implementation](https://gitlab.com/thorchain/thornode/-/blob/develop/common/relay/relay.go) fetches a UUID prefix, signs `UUID|Channel|Text`, and posts to the configured relay using ordinary Go HTTP calls with no explicit Tor transport. The current default configuration names the existing Discord relay service. Source was inspected through public GitLab raw/API reads; this does not establish the version/configuration installed on a particular operator's node or the existing relay server's replay guarantees.

**Remediation:** implement a separate local sign-only adapter with a restricted purpose and inspectable payload. Never pass confidential report text to the existing broadcast command. The [signing helper](https://gitlab.com/thorchain/thornode/-/blob/develop/common/sign.go) uses the Cosmos account keyring signer; distinguish that account key from validator consensus and TSS/vault keys. Specify and test signature compatibility with the actual supported node release rather than assuming a generic wallet signature is interchangeable.

### R03 — High: a valid signature does not establish node/operator authorization

**Component attacked:** signer is a valid node operator.

**Argument:** anyone can create a key and produce a cryptographically valid signature. The supplied public key must be mapped to authoritative THORChain state. A provider funding a pooled node must not automatically be treated as its operator.

**Evidence:** official [THORNode Stack documentation](https://docs.thorchain.org/thornodes/overview/thornode-stack) distinguishes node signing material from the operator key and says `make relay` uses node material. The [Node Operations API example](https://docs.thorchain.org/thornodes/overview/node-operations) separately lists node keys, operator address, bond providers, and status.

**Remediation:** define node-key and operator-key verification paths separately. Pin the supported network/chain ID and signature format. Derive the signer's account address from its verified public key; authorize the exact node Cosmos account or on-chain `node_operator_address`, not a claimed address or any bond provider. Check that relationship against fresh, trusted chain state. Prefer an independently operated full node; multiple REST providers are a trust heuristic, not cryptographic state verification. Do not trust the submitting node's own membership claim. Record the validation height and define staleness/unavailability behavior. Allow one operator to correspond to multiple nodes without multiplying quotas accidentally.

### R04 — High: routine CLI use can endanger powerful keys

**Component attacked:** CLI calls the node or operator signer on every report.

**Argument:** a vulnerable or malicious binary installed near validator secrets can do more than sign a report. A publicly reachable arbitrary signing API creates another attack surface. Node and operator keys have different consequences on compromise.

**Evidence:** the Stack documentation associates these keys with chain operations; the proposal has no signer isolation or restricted authorization scope.

**Remediation:** prefer a dedicated communication key authorized by a short-lived, domain-separated delegation certificate signed locally by the node/operator key. Bind node identity, delegate key, audience, network, environment, allowed action, expiry, certificate ID, and quotas. Recheck the parent authorization at submission. Define delegate revocation and independent emergency denial, including what happens after parent compromise. Keep the node helper small and local: no remote scripts, mnemonic export, generic remote signing endpoint, or arbitrary shell command accepted from the relay. Use authenticated releases and offline signing support.

### R05 — High: insufficient signature binding permits attachment substitution and misuse

**Component attacked:** sign the communication, then attach a file.

**Argument:** signing a greeting or challenge does not authorize the uploaded bytes. An ambiguous encoding or missing destination/environment can allow reuse in another context.

**Evidence:** no signed payload schema is specified. [The age author's authentication discussion](https://words.filippo.io/age-authentication/) distinguishes encryption integrity from sender authentication and identifies problems in naive signing/encryption composition.

**Remediation:** sign an unambiguous versioned manifest containing protocol purpose, service identity, network, environment, sender/delegation, recipient policy digest, ciphertext SHA-256 and byte length, submission ID, one-use challenge, and expiry. Specify exact canonical bytes and algorithms; reject duplicate keys, unsupported fields/versions, and noncanonical encodings. Use a distinct domain for delegation, content authorship, submission admission, and receipts. Do not publish a transaction-shaped signature or rely on a delimiter-concatenated string.

### R06 — High: signing ciphertext alone does not prove authorship of its plaintext

**Component attacked:** uploaded file originated from the signing operator.

**Argument:** another authorized sender can sign copied ciphertext without knowing its contents. Submission authorization and content authorship are different assertions.

**Evidence:** the age author's discussion explicitly identifies this issue in encrypt-then-sign composition.

**Remediation:** inside the encrypted package, include a signed content manifest covering the message, file hashes/lengths, submission ID, intended maintainer/policy, network, and environment. The maintainer must check agreement between inner author and outer submitter, or an explicitly authorized forwarding relationship. Neither signature alone should be described as proving human intent. Obtain review of this application protocol before release.

### R07 — High: replay protection must survive retries, concurrency, and restarts

**Component attacked:** a validated submission triggers an email.

**Argument:** captured valid submissions can otherwise produce repeated delivery. Process-local nonce storage disappears on rollout. Concurrent requests can both pass a naive check.

**Evidence:** the proposal has no replay state, atomic acceptance, or retry behavior.

**Remediation:** use unpredictable, short-lived challenges bound to the manifest's identity, recipient policy, and submission. Maintain durable submission IDs and atomic nonce consumption plus queue insertion after complete verification. An identical retry returns the previous receipt; different bytes with the same ID fail. Limit pending reservations and clean up unfinished uploads. Retain replay records for the full acceptance window. SMTP delivery is separate and may duplicate after an uncertain network result; recipient tooling deduplicates using the signed submission ID.

### R08 — High: node status policy can exclude operators during the incident being reported

**Component attacked:** valid-node requirement.

**Argument:** “active validators only” can exclude a churned-out or jailed node reporting an attack. “Any historical node” can admit indefinitely compromised or abandoned identities.

**Evidence:** THORChain node status changes through churn; the proposal leaves eligibility undefined.

**Remediation:** specify accepted statuses and a bounded recently-authorized recovery category. Distinguish trust levels in the encrypted evidence. If emergency unauthenticated reporting is needed, give it a separate limited lane with an explicit unverified label. Never silently fall back to accepting unverifiable node identity when chain verification fails.

### R09 — High: Tor transport does not conceal signed node identity

**Component attacked:** privacy of the operator.

**Argument:** the relay needs a node-linked identity to enforce the proposed admission rule. It can correlate submissions, and public node records may associate that identity with a node IP. Signed reports also create transferable evidence if disclosed.

**Evidence:** node identity is part of the proposed verification. [Tor's onion-service explanation](https://community.torproject.org/onion-services/overview/) describes location hiding and service authentication, not anonymization of identifying application data.

**Remediation:** state “node-authenticated and confidential; relay knows node identity.” Reduce retained identity data. If identity must be hidden from the relay, move verification to the maintainer or design unlinkable admission credentials as a separate project. A delegated communication key still identifies its parent through its certificate.

### R10 — High: email leaks metadata and creates durable copies

**Component attacked:** encrypted attachment emailed to maintainer.

**Argument:** encrypting only the attachment leaves subject, message, filename, node identity, reply address, timing, and size exposed where used in ordinary email fields. Mail archives and forwarding multiply ciphertext copies.

**Evidence:** the proposal does not define encrypted message boundaries. These leaks follow from plaintext mail headers and attachment metadata.

**Remediation:** encrypt the whole report, including message and original filenames. Use a generic fixed subject, relay From address, randomized generic attachment name, fixed configured destination, and no operator Reply-To. Wrap the complete submission manifest, signatures, delegation and ciphertext in an additional age envelope for email, so providers do not see node identity. The relay needs only the pinned public recipient key for this outer envelope. Providers still see size, timing, relay and recipient. Padding inside encryption and optional batching reduce easy correlation at a cost in bandwidth and urgency. Prefer an onion mailbox plus generic email notification when metadata minimization matters more than attached-email convenience.

### R11 — High: static recipient keys do not provide forward secrecy

**Component attacked:** long-term confidentiality of stored reports.

**Argument:** theft of a maintainer's decryption key exposes retained historical ciphertext encrypted to that key. Rotation does not undo exposure while old keys/copies remain.

**Evidence:** this follows from static-key encryption and retained SMTP copies; the age author's article distinguishes forward secrecy from its ordinary encryption use.

**Remediation:** isolate decryption from the upload/mail service, protect identities and backups, minimize retention, and practice key-loss/compromise recovery. Consider supported hybrid post-quantum age recipients for long-lived incident material after interoperability testing; [upstream age documentation](https://github.com/FiloSottile/age/blob/main/README.md) documents support in v1.3.0+. Post-quantum encryption does not solve key theft or provide forward secrecy. A true forward-secrecy requirement needs a different reviewed protocol/key lifecycle.

### R12 — High: testing can misroute confidential production reports

**Component attacked:** test recipient `pfc@pfc.zone`, production recipient `itzamna@thorchain.org`.

**Argument:** an email-only switch can send ciphertext to the wrong person, or reuse a test decryption key in production. Client-controlled recipients create an open mail relay or exfiltration route.

**Evidence:** test and production routing are named but their key/environment separation is unspecified.

**Remediation:** use distinct signed policies, age keys, service identities, configuration, credentials and queues. Bind environment and recipient policy in signatures. Fix the destination server-side; reject client overrides, CC/BCC, arbitrary subject/headers, callbacks, or URLs to fetch. Test only with synthetic data. Production should refuse to start with test configuration and vice versa. Independently confirm each intended recipient possesses the corresponding identity.

### R13 — High: authorized senders and unauthenticated uploads can exhaust the service

**Component attacked:** public onion upload and mail dispatch.

**Argument:** signatures do not prevent anonymous bandwidth floods or a legitimate/compromised node flooding maintainers. Tor peers are unsuitable as meaningful per-operator IP quota keys.

**Evidence:** no resource limits are proposed. [Tor's onion DoS guidance](https://community.torproject.org/onion-services/advanced/dos/) recommends service-level defenses; these do not replace application limits.

**Remediation:** admit a small signed manifest first, verify eligibility/quota, and issue a short-lived capability for a bounded upload. Still enforce global connection, byte, time, CPU, challenge and spool limits. Stream ciphertext to bounded storage; do not buffer unbounded bodies. Enforce quotas by parent operator/node and globally, bound worker retries, and reserve incident capacity. Tor client authorization is optional if onboarding permits it. Treat Tor PoW as congestion mitigation, not proof of node identity.

### R14 — High: encrypted hostile files endanger the maintainer

**Component attacked:** recipient opens a validated attachment.

**Argument:** encryption prevents relay content scanning. A valid-node signature does not make a file safe, and reported logs can contain secrets or attacker-controlled strings.

**Evidence:** authentication authenticates a key, not the safety or truthfulness of content.

**Remediation:** provide recipient verification/decryption tooling. Stage output until full integrity and required signature checks finish; discard partial output after any failure. Do not auto-open, execute, preview HTML, fetch links, or extract archives. If extraction is offered, reject traversal, symlinks and resource bombs. Review reports in a restricted environment. Offer local inspection/redaction for mnemonics, keys, credentials and identifying log data; do not automatically gather node backup/key directories.

### R15 — High: relay receipts cannot prove maintainer delivery

**Component attacked:** successful upload means delivered report.

**Argument:** a compromised relay can drop the report and claim success. An SMTP server accepting responsibility does not prove the maintainer read or decrypted it.

**Evidence:** [SMTP RFC 5321](https://www.rfc-editor.org/rfc/rfc5321.html) specifies transfer of delivery responsibility and subsequent failures, not human acknowledgement.

**Remediation:** distinguish accepted, queued, SMTP accepted, failed, and maintainer acknowledged. Return a signed receipt binding submission ID and ciphertext hash. Permit private status polling using a high-entropy capability in a header, with limited retention; do not place it in logged URLs. An end-to-end acknowledgement should be signed with a separately trusted maintainer acknowledgement key and bind the submission hash. It can be polled over Tor or encrypted to a one-time reply recipient. Never imply a relay receipt removes censorship risk.

### R16 — High: sharing an unrelated backend enlarges the confidentiality boundary

**Component attacked:** deployment alongside the current swap application.

**Argument:** unrelated app compromise could expose node identities, queues or mail credentials. Onion reachability alone does not make a shared backend inaccessible over other paths.

**Evidence:** no Bodferd backend has been deployed. This is a proposed deployment threat: sharing public ingress, execution, storage or unrelated signing credentials enlarges the attack surface. HTTP method restrictions do not provide durable isolation for a confidential upload service.

**Remediation:** prefer a dedicated relay deployment, onion identity, storage, Tor client/service and minimal mail worker. No public ingress, public load balancer, or dependency on untrusted Host/forwarded headers for Tor-only admission. Restrict backend reachability with enforceable network policy or a same-host private socket. Use independent credentials, least privilege, non-root execution, resource caps, ciphertext-only bounded queues, and minimal logs. Follow this repo's SOPS-only rule for service secrets. Keep the maintainer age identity off the cluster.

### R17 — Medium: a proxy setting alone is not a reliable Tor-only client guarantee

**Component attacked:** local Tor relay required for communication.

**Argument:** clients need a Tor client/daemon, not to operate a public Tor relay. Proxy bypass, redirects, direct diagnostics, DNS, update checks and telemetry can reveal activity.

**Evidence:** [Tor's SOCKS extensions](https://spec.torproject.org/socks-extensions.html) describe hostname addressing and stream isolation. [Tor's limitations](https://support.torproject.org/about-tor/security/attacks-on-onion-routing/) include timing correlation.

**Remediation:** explicitly connect to a configured local SOCKS endpoint, pass the pinned onion hostname through SOCKS, reject redirects and direct fallback, disable telemetry and automatic network update checks, and apply supported stream isolation. A high-assurance mode should enforce network access to only the local Tor endpoint, while preserving explicit local/offline signing. Do not promise resistance to an observer monitoring both ends. Padding/batching do not eliminate this threat.

### R18 — High: open source does not establish trust in downloaded binaries

**Component attacked:** public CLI running near sensitive operator material.

**Argument:** a compromised release, dependency or installer can steal plaintext before encryption or misuse signer access. This bypasses the protocol entirely.

**Evidence:** the proposal specifies open source but no distribution verification.

**Remediation:** use a small CLI, preferably Go given available age/THORChain libraries; select audited compatible versions rather than implementing primitives. Pin dependencies, publish authenticated checksums/build provenance and reproducible build instructions, isolate release signing, and prohibit shell-piped installers. Upstream age provides Sigsum release proofs. Keep network submission separable from local signing so an operator can inspect exactly what is authorized. Review the protocol and parsers independently before production.

## Recommended flow for the first implementation

1. Independently bootstrap policy-root trust, onion identity, supported chain and maintainer recipient key. Configure production and test separately.
2. Generate a communication key locally. Authorize it using a narrow, expiring node/operator delegation. Direct signing can be an explicit fallback with the same admission semantics.
3. Fetch and locally verify the signed current recipient policy over Tor; check it against the client's trust and rollback state.
4. Create a submission ID. Package the message, file, original metadata and inner signed content manifest locally. Encrypt that package using the approved age recipient. Finalize immutable ciphertext, hash it and measure its length.
5. Obtain a bounded one-use admission challenge over Tor. Sign the canonical outer manifest binding that challenge, ciphertext and destination policy.
6. Relay verifies the manifest, fresh node/operator authorization, delegation, expiry and quotas before granting upload capacity. On complete upload it verifies exact size/hash and bounded age structure. Atomically accept and queue; return a receipt. It cannot attest successful maintainer decryption.
7. Mail worker uses a fixed destination and pinned public key to encrypt the complete original submission bundle into a generic mail attachment. Forward the original signatures and delegation, not just a relay's validation assertion.
8. Maintainer tooling unwraps the mail envelope, checks the original admission signature and authorization evidence against its own trust, decrypts the report, then verifies the inner manifest and file hashes before presenting content. Validation expiry refers to acceptance time, not arbitrary delayed reading time. An optional signed acknowledgement returns through private Tor polling.

## Verification cases required before shipping

- Arbitrary self-generated signers, unrelated bond providers, stale/wrong chain state, wrong network, churn/status boundaries, parent revocation and expired delegates.
- Policy substitution, downgrade, expiry, rotation and offline-root recovery; cross-environment key and email routing.
- Modified ciphertext, truncation, wrong declared size, malformed headers, unsupported recipient types, ambiguous manifests, duplicate JSON keys and mismatched inner/outer authors.
- Concurrent replay, retries after lost responses, restart/rollout persistence, incomplete uploads, uncertain SMTP acceptance and recipient deduplication.
- Large/slow uploads, challenge floods, compromised authorized-node floods, full queues and storage exhaustion.
- Tor failure produces no direct connection; clearnet/backend paths cannot submit; redirects are rejected; logs contain no report body, identity-bearing signature or private status capability by default.
- Recipient rejects partial decryption and unsafe extraction. Missing maintainer keys fail visibly. SMTP acceptance and end-to-end acknowledgement remain distinct.
- Relay compromise simulation cannot decrypt an existing valid client-encrypted report or substitute an independently trusted recipient key. It can still suppress delivery and observe admission metadata; document that residual risk.

## Remediation path

First settle encryption-validation semantics, recipient trust, signer eligibility and the privacy promise. Then specify exact manifest/delegation/receipt formats and recipient handling; only then implement CLI, isolated service and synthetic test deployment. This review creates documentation only. No application/cluster changes, commits, pushes, tags, PRs or test emails were performed. Repository instructions reserve PR creation/merging to the user and prohibit GitHub CLI/MCP, so the durable local report is the review handoff.

Follow-up, 2026-10-14: the user requested integration of the findings with public `make relay` key registration and selected protocol design before implementation. The controlling [node relay protocol](design.md) maps all ten summarized controls to mechanisms and acceptance evidence, separates age encryption from communication signing, and distinguishes original node signatures from registrar-witnessed Discord enrollment. These are designed controls, not implemented remediations; this review's findings remain open until implementation and verification evidence exist.
