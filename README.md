# Bodferð · Bodferd

Secure THORChain operator communications over Tor. **Design draft: the CLI, relay and group messaging are not implemented.**

- [Protocol design](docs/design.md): node-authorized delegation, local age encryption, Tor-only admission and independently verified delivery.
- [Security review](docs/security-review.md): durable findings and required verification.
- [Reading page](https://bodferd-design.ian407468.chatgpt.site) (owner-private).
- Future direction: operator-to-operator, developer and trusted-group communication through established messaging protocols, with a concrete Signal integration proposal in the design.

Repository: https://github.com/PFC-Validator/bodferd. The reading website is separate from the future onion service. `docs/design.md` is the authoritative protocol source.

Build with `node scripts/build.mjs`; preview with `python3 -m http.server 8765 --directory dist`. No build dependencies, external fonts, analytics or network requests are required. The page includes the full protocol and review, a shorter overview, section navigation, local search and print/download actions.

Assay tracks design approval and future work under `docs/streams/`. The Bodferd house cell uses this checkout and existing operator configuration; it must remain unbooted until repository authorization and the independent reviewer identity are confirmed. See `docs/assay-bootstrap.md` for bootstrap evidence and remaining human acts.


License: MIT.
