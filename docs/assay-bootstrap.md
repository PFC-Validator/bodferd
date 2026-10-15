# Assay bootstrap evidence and remaining acts

Prepared 2026-10-14. Exported as a fresh clean repository after the user requested removing earlier-project references and recreating the remote. This repository contains a draft design and reading website; no relay, CLI or production identity is implemented.

## Verified locally

- Plugin: Assay v1.0.42. Paired statusgen v1.0.29 fetched from its official release and SHA-256 verified against the plugin's paired-versions manifest. macOS ARM64 and CI Linux AMD64 pins are recorded in `.assay-versions`.
- `statusgen init --root /Users/iholsman/pfc/bodferd --forge github` emitted the corpus, bindings and two-part single-writer CI. Its example brief was replaced with `bodferd/01`, an independent design-review handoff. Lint exits 0 after removing the stale example row. No finding is marked remediated and no brief is claimed verified/done.
- The generated CI keeps the PR lint/main regeneration structure and bootstrap-safe porcelain guard. Binary acquisition uses verified HTTPS, not a floating version or implicit gh login. Roster-backed checks explicitly disclose missing configuration.
- `cellctl` v1.0.41 created the house cell using the existing operator configuration by symlink; it copied no private key. `CELL_HARNESS=codex` and `CELL_ROOTS=PFC-Validator/bodferd=/Users/iholsman/pfc/bodferd-clean`. The actual cell directory is `/Users/iholsman/jojig/cells/bodferd`. Its repo/root map points to `/Users/iholsman/pfc/bodferd-clean`; the desks remain unbooted.
- `cellctl check bodferd` exits 0: checkout, stream root, resident rules, plugin discovery, Codex and installed desk verbs meet its local prerequisites. This check does not prove GitHub App installation or authorize this repository.
- The client pre-commit main guard is installed at `.githooks/pre-commit` and `core.hooksPath=.githooks`. Its branch refusal is additionally checked using an isolated temporary repository before committing.
- The static reading site builds with `node scripts/build.mjs`. Desktop/mobile layout, section anchors and local search were checked in the browser; visual review is recorded separately.

## Limits and required human setup

The operator's current roster does not include PFC-Validator/bodferd in allowed/scan repositories. It is shared operator configuration: do not edit it implicitly or assume unrelated App grants transfer. The cell remains unbooted. Confirm the driver's account, trusted role identities, repository authorization and reviewer installation before using the desks. A dedicated scoped cell may be preferable if the operator wishes separate custody; this house cell is a local orchestration scaffold, not an isolation guarantee for operator credentials.

The clean export intentionally retains no earlier Git history. `origin/main`, merge-history, branch-diff and historical-stamp checks cannot be fully verified until the recreated repository is populated and fetched. Missing evidence remains could-not-check; local lint is not a technical protocol approval or proof of a CI run.

The requesting user will delete and recreate the public remote after reviewing the clean-source verification. Do not push the old checkout, its refs or an inherited archive. The fresh local root commit is the sole source for the new remote. Confirm the recreated remote is empty before its initial authorized main push; no force push or release tag is needed.

Configure the five nonsecret Actions roster variables named by the generated workflow, grant/provision reviewer identity for this repository, and decide branch protection plus any dedicated board-writer App/bypass. Credentials stay in their existing protected custody and are never committed. Main's CI is the only STATUS.md writer; never stage preview boards on a branch. STATUS.md is deliberately not gitignored: CI must be able to stage its first generated board. A clean-fixture test checks this bootstrap condition.

After main initialization, verify the first statusgen CI run and board generation, fetch origin/main, rerun local lint with history available and create subsequent draft PRs normally. Only an independent technical review plus a recorded human ruling can approve the protocol. Exercise one seed brief across review, human merge and independent verification before claiming the full Assay lifecycle proven.

## Authorized v1.0.44 reset

On 2026-10-15 the repository owner explicitly directed a reset of this new
project to Assay v1.0.44, with manual compatibility repairs. This supersedes
the original v1.0.42 plugin / v1.0.29 statusgen pairing above. The prior pin file
had no umbrella marker, so the normal upgrade resolver could not identify a
starting suite version. This is an owner-authorized initialization of the target
composition, not a claim that the automated migration path ran successfully.

`.assay-versions` now records the v1.0.44 umbrella and the published per-platform
SHA-256 digests for statusgen and desk-tools. Digests come from the
[v1.0.44 release checksums](https://github.com/medici-finance/assay/releases/download/v1.0.44/checksums.txt).
The existing brief schemas remain subject to the target statusgen lint. This
repository change does not change App identities, grant permissions, or update
machine-wide installations.

The statusgen workflow checks out full history so main-comparison gates can run,
and supplies its workflow token to both board-generation steps with explicit
pull-request read permission. Generated board files remain main-only outputs.

Local validation of this reset: `deskpins --check --root .` passed;
`deskversion --root . --fetch` reported `state: known`, umbrella v1.0.44,
with statusgen and desk-tools v1.0.44; the installed statusgen digest matched
the Darwin ARM64 pin. `statusgen --root . --lint`, `node scripts/build.mjs`,
`actionlint .github/workflows/assay-statusgen.yml`, and `git diff --check`
all exited zero. Offline lint does not validate live branch claims. A separate
isolated v1.0.44 preview generated the board and README tables with the desk
App credential and main history available; hosted workflow-token behavior
still requires the normal CI run after publication and merge.
