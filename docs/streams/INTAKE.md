# Intake

## I-01 — 2026-10-14 — Secure operator and trusted-group conversations

User requests a future direction supporting node operators, THORNode developers and trusted groups without reinventing Signal.

Disposition: scoped → bodferd. The controlling design records separate device/group authorization and an existing-messenger-first selection gate. V1 remains reporting and bounded replies; no chat implementation is scheduled by this intake.

## I-02 — 2026-10-14 — Report transport: onion pull versus attached email

Adversarial review A08: attached email has no chosen provider, domain or credential owner, exceeds common inbound limits after wrapping, matches the spam-quarantine profile, and creates a permanent third-party copy; the maintainer already uses an onion-only path for responses. R10 recommended onion mailbox plus content-free notification.

Disposition: needs-decision → repository owner. Options: (a) onion pull primary, email as notification only (recommended); (b) keep attached email and record the reason plus provider/credential ownership.

## I-03 — 2026-10-14 — Messaging stack lead: MLS versus libsignal versus stock Signal

Adversarial review A10, A11, A21: the stock-Signal companion cannot meet the Tor-only gate; the libsignal client is a new messenger with no group system supplied by the library and a per-account identity-key model that does not fit the device credential; MLS (OpenMLS / mls-rs) matches the trusted-AS / untrusted-DS split Bodferd already has, with permissive licences and uniffi bindings, but neither library claims a full independent audit.

Disposition: needs-decision → repository owner. Recommended: promote MLS to lead candidate, record the audit caution, drop the stock-Signal companion from the candidate list.
