# Bodferð · Bodferd

Secure THORChain operator communications over Tor. **Design draft: the CLI, relay and group messaging are not implemented.**

In the proposed first version, you submit a report through Tor and maintainers receive an encrypted email attachment. Your computer signs and encrypts the contents; the relay checks your authorization and forwards the package without being able to read it. See [how a report is delivered](docs/design.md#how-a-report-is-delivered) for the full journey, including Tor recovery and acknowledgements.

- [Protocol design](docs/design.md): node-authorized delegation, local age encryption, Tor-only admission and independently verified delivery.
- [Original security review](docs/security-review.md): nineteen findings and required verification.
- [External review and dispositions](adversarial.md): thirty findings, draft corrections and residual gates.
- [Owner decisions](docs/review-decisions.md): trust separation, roster, public incident contact and transport direction.
- [Public reading edition](https://pfc-validator.github.io/bodferd/): shareable GitHub Pages site, published from `gh-pages`. Build `dist/` locally for previews.
- [Operator teams](docs/design.md#node-teams-and-optional-personal-attribution): several independently authorized people per node, with optional encrypted personal labels.
- Future direction: operator-to-operator, developer and trusted-group communication through established messaging protocols, with a concrete Signal integration proposal in the design.

Repository: https://github.com/PFC-Validator/bodferd. The reading website is separate from the future onion service. `docs/design.md` is the authoritative protocol source.

Run renderer regression checks with `node --test scripts/markdown.test.mjs`, then build with `node scripts/build.mjs`; preview with `python3 -m http.server 8765 --directory dist`. No build dependencies, external fonts, analytics or network requests are required. The page includes the full protocol and review, a shorter overview, section navigation, local search and print/download actions.

Assay tracks design approval and future work under `docs/streams/`. The Bodferd house cell uses this checkout and existing operator configuration; it must remain unbooted until repository authorization and the independent reviewer identity are confirmed. See `docs/assay-bootstrap.md` for bootstrap evidence and remaining human acts.


License: MIT.
