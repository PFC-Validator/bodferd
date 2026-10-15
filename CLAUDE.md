# CLAUDE.md

Scaffolded by `statusgen init` — this file is yours to edit: keep the invariants,
replace everything else with your own repo's bindings.

## The ten invariants

These hold in every repo running the methodology, whatever the language, harness
or team. They are the floor, not the whole manual.

1. Evidence or it didn't happen — a claim of done/verified without a recorded command + exit code + real output is an unverified claim, never a fact.
2. Non-implementer verify — whoever verifies a piece of work is not who implemented it; a second person or a second session.
3. Derived, not declared — board/register state is computed from evidence; silence reads as unverified, never as success; never edit generated state by hand.
4. Draft-PR-first; the human merges — all work lands on a branch behind a draft PR; direct pushes to main and self-merges are out.
5. One logical change = one branch = one PR — merged or closed = done; follow-up work is a new branch.
6. Merge, never rebase, never force-push a branch anyone else may have.
7. A red check is a work item, never a wait state — reproduce, fix, push; "flake" needs evidence posted on the PR.
8. A blocked action is a stop signal — never route around a guard, gate, or refusal; escalate to the human instead.
9. Removing a security control is a human decision, always — leave the gate red, escalate with evidence.
10. No attribution lines in commits, PRs, or comments.

## CI recipe

1. Install the pinned statusgen release binary: detect the platform, read its line
   from `.assay-versions` (`statusgen-<platform>  <tag>  <sha256>`), download that
   release asset, and check its sha256 against the pinned digest. An absent pin
   line or a digest mismatch is a REFUSAL, never a guess — nothing unverified is
   ever installed. Re-pin (never edit in place) on an upgrade, so the bump shows
   in a diff.
2. Run `statusgen --lint` on every pull request. A red lint is a work item, not
   a wait state.
3. Regenerate the board on main only: the push-to-main half runs
   `statusgen --root .` and commits STATUS.md. STATUS.md has a SINGLE writer —
   never commit it on a branch.

The scaffolded workflow already does all three. If you rewrite it, keep those
three properties; they are what make the board derived rather than declared.

## This repo's bindings

- Scope: design and static documentation only. CLI, relay and messaging are unimplemented. The authoritative protocol is `docs/design.md`; the original review is `docs/security-review.md`.
- Stream: `docs/streams/bodferd/` tracks independent design review before implementation decomposition. The spec remains draft until a recorded human ruling. Do not self-approve it.
- Tools: Assay v1.0.44; `.assay-versions` records the suite marker and SHA-256-verified macOS ARM64 and Linux AMD64 statusgen and desk-tools release pins. Install exactly the pinned release assets; no floating releases. See `docs/assay-bootstrap.md` for the original bootstrap and the authorized v1.0.44 reset.
- Human gate: the requesting repository owner chooses account/role roster identities; specific approval account is not yet confirmed. Main bootstrap, merges, first ready-flip, release tags, trust grants and changes to crypto/policy authority require the human. An existing unrelated roster is not authorization for this repository.
- Risk paths: `protocol/`, `deploy/`, `k8s/creds/`, authorization and cryptographic implementation require explicit security review before production. Secrets use estate-PGP SOPS records only, never plaintext artifacts or transcripts. No node or maintainer private keys belong on a relay.
- Generated surfaces: `dist/` is rebuilt with `node scripts/build.mjs`; `.github/workflows/assay-statusgen.yml` is the single writer of `STATUS.md` on main. Never commit local STATUS.md on a branch. Generated stream tables are updated by statusgen; author facts in briefs, not status cells.
- Isolation: this is a task-created bootstrap checkout; later implementers use cellctl-created locked worktrees under the Bodferd cell. Branches are `design/...` or `work/...`; no force push or rebase of published history.
- Review identity: independent reviewer App/installation for PFC-Validator/bodferd is unconfirmed. No fabricated bot login or use of an unrelated App identity.
- GitHub: SSH is the configured source transport. If the user authorizes a gh command, supply an explicit `GH_TOKEN` scoped to that command; never use `gh auth switch`, change browser accounts or print/store tokens. A missing authorized token is a blocker, not permission to extract another account's credential.
- Checks before a commit: `node scripts/build.mjs` and paired `statusgen --root . --lint` must pass. No local Docker builds. Future cluster deployments use CI/git/Flux; cluster operations are read-only except authorized Flux reconciliation.
- Publication: the user selected public GitHub Pages at https://pfc-validator.github.io/bodferd/, using the `gh-pages` branch with static output at its root and `.nojekyll`. Publish the reviewed draft assets from `dist/` with source revision provenance; this public reading page is separate from the future onion service. Existing private hosting is historical, not the canonical share link. Do not publish private identities, keys or incident material.
