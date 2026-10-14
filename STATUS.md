<!-- GENERATED FILE — do not edit. Source of truth: docs/streams/*/README.md.
     Regenerate: run statusgen against this repo root — installed release binary `statusgen --root .`, or `go run . --root ..` from statusgen/ inside the assay repo. Channels + pin spec: docs/distribution.md, section: The .assay-versions pin file -->

# Project Status

## Roll-up

### Platform

| Stream | Priority | Status | Briefs done | Last touched | Notes |
|---|---|---|---|---|---|
| [bodferd](docs/streams/bodferd/README.md) | P2 | active | 0/1 | 2026-10-14 |  |

## Next up

> **COULD-NOT-CHECK — dead-claim decay did not run.** PR state through `gh pr list` could not be read: gh pr list: exit status 4 gh: To use GitHub CLI in a GitHub Actions workflow, set the GH_TOKEN environment variable. Example:
  env:
    GH_TOKEN: ${{ github.token }}
> Open branches whose PR/merge request has already **merged or closed** are still counted as claims, so they keep consuming their stream's dispatch cap. The rows below are a **subset**: briefs held behind those dead claims are missing from this board, not absent from the backlog.

| Stream | Brief | Wave | Score |
|---|---|---|---|
| bodferd | 01 — Review and approve the reporting design | 0 | 1000 |

## Intake queue

_0 untriaged entries — the front door is clear._

## Awaiting verification / review (0 desk-actionable of 0 total — 0 at implemented, 0 verified awaiting review)

_Gate-queue ordered by score: priorityWeight + staleness×stalenessPerDay + valueWeight + unblocksWeight×blockedCount. The weights are an evolving heuristic (F-09 discipline) — not a claim of truth. Board segmented by blocker owner: the desk-actionable headline counts only the queue the desk can actually drain._

_`done‡` / `verified‡` = closed over an **UNRUN risk-bearing Verify row**: a live/mutating check with no completed Evidence row behind it. UNRUN is DERIVED from Verify-vs-Evidence coverage — a row counts as run only when an Evidence row names it with a date and a runner, so silence reads as unrun. `--lint` names each one and whether it was routed to a follow-up._

_None._

## Age at the human gate

_Per stream: how long the longest-waiting `gate: human` brief has sat in its CURRENT awaiting status (implemented/verified), from the historian (`.history.jsonl`). Oldest stream first. Render-only — never a Next-up or gate-score input. `—` means the historian has no recorded transition into that status (a brief older than the log, or a fresh checkout): the age is UNKNOWN, not zero._

_Deliberately WIDER than `--signoff-digest`: this counts every `gate: human` brief sitting at implemented/verified, whereas the digest lists only those the per-brief sign-off surface has judged actionable (a recorded model verify pass behind them). A stream appearing here with no digest row is a brief waiting on its VERIFIER, not on the human — a different queue, and worth seeing separately._

_No brief is awaiting the human gate._

## Unresolved findings

_None._

## Incomplete briefs

### bodferd (1 open)

- 01 Review and approve the reporting design — todo (wave 0)

## Done briefs

_`done*` = unbacked (I-08 point quality): the row's Evidence section is empty and/or its Verified/Reviewed cells aren't dated+attributed per brief-16 — see `--lint` for the full list. Plain `done` is evidence-backed._

_`done‡` / `verified‡` = closed over an **UNRUN risk-bearing Verify row**: a live/mutating check with no completed Evidence row behind it. UNRUN is DERIVED from Verify-vs-Evidence coverage — a row counts as run only when an Evidence row names it with a date and a runner, so silence reads as unrun. `--lint` names each one and whether it was routed to a follow-up._

## Totals

**1** streams (**1** active, **0** paused) · **0/1** briefs done · completed initiatives: see `docs/archive/`
