# Clawpatch audit and hardening report

## Status and ownership

Disposition: **PARTIAL — BLOCKED** for comprehensive audit coverage. Both
accepted P1 repairs and all three separately authorized Ponytail reuse repairs
are merged, verified on the fetched target, and closed. Integrated validation
passes. Live provider and native platform gaps prevent an exhaustion verdict;
there is no finding quota and no claim that 50 qualifying issues exist.

This report records the verified source target before its own documentation
commit. Its publication and the final repository readback are delivery gates,
not additional findings. The tracking issue records the report PR and final SHA.

- Repository: `Revotech-Networks/clawpatch`, a fork of `openclaw/clawpatch`.
- Tracking issue: <https://github.com/Revotech-Networks/clawpatch/issues/1>.
- Target branch: `main`.
- Started: 2026-10-29 UTC.
- Starting target: `1fbd2cee7ecfe059bb8c3450b9440713520706b4`.
- Latest verified source target: `1bf3fca653961ec7bae5b14ab7f63defe1229e89`.
- Accountable T3 thread: `mcp:1bcc883b-f567-47d1-b7ba-fe86175b3627`.
- Portfolio coordinator: `d4ba2482-746c-4bf0-a13d-667f3134c71f`.
- Engineering lane: Standard audit. Each repair receives a separate classification
  based on its actual effects and preserved authority boundaries.

The initial paginated GitHub issue and PR inventories returned empty lists. Both
local worktrees were clean at the starting revision. There was no earlier QA
report, repository audit branch, or competing T3 repository owner. Fresh remote
`AGENTS.md`, `SECURITY.md`, `CODEOWNERS`, workflows, and recent history were read.
GitHub reported no branch protection or rulesets. Existing controls will remain
intact. The portfolio coordinator enabled Issues, and issue creation succeeded.

## Scope and product contract

The scoped inventory contains 123 tracked files at the starting revision,
including 66 under `src/`; the repaired source target contains 124 and 67
respectively, before this report is added. This is an inventory count, not a
claim of exhaustive branch coverage.

The audit covers tracked first-party TypeScript, colocated tests, package and
tool configuration, GitHub workflows, scripts, durable Markdown, and static
website source at the starting revision. Generated `dist/`, installed
dependencies, caches, runtime `.clawpatch/` state, and binary assets are excluded
from source analysis. Website asset integrity is covered by its smoke check.
`PROJECT.md` is absent.

Clawpatch is an early Node CLI for repository maintainers. It maps source into
feature records, submits bounded context to local agent providers, validates and
stores findings, and runs an explicit fix for one selected finding. Fixing does
not commit or publish. A separate `open-pr` command commits the recorded patch
files and uses Git and GitHub CLI to publish a PR. There is no automatic landing.

Critical journeys are initialization, mapping and remapping, concurrent review,
reporting and triage, explicit fix and validation, revalidation, PR creation, and
recovery after interruption. Persistent JSON records live in the configured
state directory. Important boundaries are source versus state files, repository
paths and symlinks, provider execution permissions, provider output validation,
trusted validation commands, and Git staging and branch identity.

Node 22 or newer is promised. Mapping covers multiple language and build
systems. Provider adapters depend on separately installed CLIs and their account
state. Mock-provider tests establish deterministic orchestration behavior, not
live external-provider acceptance.

## Baseline

Environment: Linux x64, Node `v26.12.1`, pnpm `11.1.2`, Vitest `4.1.7`.
The shared host had about 11 GiB available memory and load near 6 before tests.
Vitest used two workers. The dependency lockfile remained unchanged.

`pnpm` was absent from PATH and the existing Corepack shim had no configured
version. The task used `npm exec --yes --package=pnpm@11.1.2 -- pnpm` as a
temporary launcher, without a global installation or host configuration change.
Dependencies were prepared with `install --frozen-lockfile --ignore-scripts`.

The commands below use that launcher prefix.

| Command                      | Result at starting revision                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| `pnpm typecheck`             | Passed                                                                      |
| `pnpm lint`                  | Passed                                                                      |
| `pnpm format:check`          | Passed, 110 files checked                                                   |
| `pnpm test --maxWorkers=2`   | 750 passed, 1 skipped, 13 test files, 13.27 seconds                         |
| `pnpm build`                 | Passed                                                                      |
| `pnpm pack:smoke`            | Passed, installed packaged CLI mapped 13 features including 3 CUDA features |
| `pnpm website:smoke`         | Passed                                                                      |
| `node dist/cli.js --version` | `0.5.0`                                                                     |
| `node dist/cli.js --help`    | Passed                                                                      |

## Coverage and assignments

| Area                                                 | Owner                    | Current evidence and remaining work                                                                                              |
| ---------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Mapping, detection, language heuristics              | Mapping discovery child  | Source contracts and each mapper surveyed; three reuse repairs independently proved and merged; detailed parser branches sampled |
| Providers, execution, prompts, validation            | Provider discovery child | Source audit returned; ACPX resource defect independently reproduced                                                             |
| Workflow, state, Git, concurrency, recovery          | Workflow discovery child | Source audit returned; nested-root fix defect independently reproduced                                                           |
| CLI, reporting, package scripts, configuration, docs | Repository root          | Source and contract inspection complete; baseline and synthetic CLI journeys passed                                              |
| Static website                                       | Repository root          | Smoke and source inspection passed; background browser search/theme/anchor checks at 1280px and 375px passed                     |
| Real CLI workflows                                   | Repository root          | Packaged init/map and synthetic init/map/review/triage/fix-preview/revalidate/report/error journeys passed                       |
| Live provider integrations                           | Repository root          | Real Codex review completed; Claude requires unavailable API-key auth in documented bare mode; other integrations unverified     |
| Performance and bounded stress                       | Repository root          | Bounded ACPX 1k/2k/4k/8k chunk benchmark reproduced and repaired memory amplification                                            |
| Native Windows and macOS compatibility               | Repository root          | Not exercised on this Linux host                                                                                                 |

Discovery children had read-only assignments at the starting revision. One
bounded implementation child changed the nested-root repair in its assigned
worktree; the root ran its Git-backed and full-suite verification. A final
read-only composition check found no substantiated new P0/P1 lead. The root owns
admission, deduplication, tests, issues, Git, the report, merges, and acceptance.
Children do not independently publish findings or count completed lifecycles.

## Delivery boundaries

The complete workflow inventory contains CI, CodeQL, Dependency Review, Pages,
and manually dispatched Crabbox hydration. Only Pages deploys. Its automatic
trigger requires a push to `main` affecting `website/**` or
`.github/workflows/pages.yml`. Changes to those paths require the portfolio
coordinator's delivery resolution before a triggering action. No workflow is
dispatched manually by this audit. No release or package publication is in scope.

## Findings and merge waves

Accepted qualifying findings: two P1 defects. Both are merged, target-verified,
and closed: P0 0, P1 2, F0 0, F1 0. Three completed Ponytail reuse repairs are
recorded separately. The tracking issue and this report PR are not counted;
portfolio acceptance remains conditional on report publication and final readback.

| Issue                                                                                | Class | Evidence                                                                                                                                                                            | Delivery state                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#2](https://github.com/Revotech-Networks/clawpatch/issues/2) ACPX suffix allocation | P1    | 4,000 chunks / 560 KB used 235,432 KiB RSS; 8,000 chunks exhausted a capped 384 MiB heap. Lazy iteration reduces 4,000 chunks to 73,312 KiB and permits 8,000 chunks at 73,848 KiB. | [PR #3](https://github.com/Revotech-Networks/clawpatch/pull/3), head `ada558d9b1e8cc15181f376f7c44c1729b6dfdcc`; merged `2bf6940060826a4013139ae267e11beb355f7361`; issue closed |
| [#4](https://github.com/Revotech-Networks/clawpatch/issues/4) nested-root auditing   | P1    | Real CLI mock-provider fixtures reproduce false dirty-state rejection, incorrect patch paths and missed already-dirty edits. Root control passes.                                   | [PR #8](https://github.com/Revotech-Networks/clawpatch/pull/8), head `d28b0e4a1c201d016361dabe77b7b17276ef55ec`; merged `3ccb6eb87794181d6b0a16622cb1763091f73055`; issue closed |

Verified simplicity findings, counted separately after merge and target checks:

| Issue                                                         | Reuse repair             | PR / exact head                                                                                           | Evidence                                                                              |
| ------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [#5](https://github.com/Revotech-Networks/clawpatch/issues/5) | Shared Node helpers      | [#9](https://github.com/Revotech-Networks/clawpatch/pull/9), `8489d88dac82e05ffb78f91ed96c89f8ad021c3b`   | 128 manager and 180 command comparisons; 30 net lines removed                         |
| [#6](https://github.com/Revotech-Networks/clawpatch/issues/6) | Shared comment scanners  | [#10](https://github.com/Revotech-Networks/clawpatch/pull/10), `e43657c1e1b3a2add398807828006acfe116bde9` | 1,575 identical scanner comparisons; 83 net lines removed                             |
| [#7](https://github.com/Revotech-Networks/clawpatch/issues/7) | One JVM module inventory | [#11](https://github.com/Revotech-Networks/clawpatch/pull/11), `897c821e90cfe05b259c590be89bb1d57676c46c` | Complete seed equivalence; Gradle reads 66→44, Maven 45→23; 67 fewer lstat calls each |

Each simplicity candidate passed typecheck, lint, formatting, all 750 baseline
tests (one Windows-only skip), and build in its isolated worktree. These are Tiny
internal reuse repairs, with unchanged public contracts and no new tests that
mirror the removed code.

All worktrees are beneath `/home/cohearn/.t3/worktrees/clawpatch/`. The root
retained ownership of Git and serialized all merges.

| Issue | Branch                        | Worktree directory       | Merge SHA                                  |
| ----- | ----------------------------- | ------------------------ | ------------------------------------------ |
| #2    | `fix/2-acpx-suffixes`         | `fix-2-acpx-suffixes`    | `2bf6940060826a4013139ae267e11beb355f7361` |
| #4    | `fix/4-nested-root`           | `fix-4-nested-root`      | `3ccb6eb87794181d6b0a16622cb1763091f73055` |
| #5    | `refactor/5-node-helpers`     | `fix-5-node-helpers`     | `123de2b7f15014c742eb324c6c93845ef0bd6767` |
| #6    | `refactor/6-comment-scanners` | `fix-6-comment-scanners` | `1bf3fca653961ec7bae5b14ab7f63defe1229e89` |
| #7    | `refactor/7-jvm-inventory`    | `fix-7-jvm-inventory`    | `1f871003db82785d5a0cb33dc8e465752af998c6` |

The provider measurements are synthetic local evidence, not live ACPX performance
claims. The repair preserves schema fallback, retry order and stop errors.
The nested-root repair preserves repository-wide dirty guards, renames,
symlink roots and fail-closed Git failures; focused tests exercise these cases.

The portfolio coordinator completed owner-approved bounded fork activation.
Fresh readback confirmed CI, CodeQL, and Dependency Review active; Pages and
Crabbox Hydrate disabled manually. Earlier filename activation/disable requests
returned 404 and did not themselves establish success. No billing exception or
gate waiver was applied.

Existing PRs did not start automatically. One close/reopen recovery per PR
preserved all five heads and produced actual PR-associated CI and CodeQL runs.
Dependency Review does not apply to these source-only diffs. No source commit,
push, manual dispatch, deployment, or additional settings change was needed.

PR #3 passed [CI](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896415902)
and [CodeQL](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896416268),
then merged as `2bf6940060826a4013139ae267e11beb355f7361`. Its fetched target
tree equals the reviewed candidate tree, `adbe9555347515cd9fe485fe0b2db477e7a5a0bb`.
All 137 provider tests passed from the isolated target checkout with a 384 MiB
heap cap and one worker, including the long-stream regression. Issue #2 closed
after this proof.

PR #8 passed [CI](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896521321)
and [CodeQL](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896521454),
then merged as `3ccb6eb87794181d6b0a16622cb1763091f73055`. The three changed
files on the fetched target match its reviewed candidate. With both P1 repairs
present, 151 change-audit/provider tests and four selected Git-backed workflow
regressions passed under the same 384 MiB heap cap with one worker. The workflow
selection covers root and nested clean/dirty recording, PR preview, and removed
dirty files; 109 unrelated workflow cases were filtered out. Issue #4 closed
after this proof.

PR #9 passed [CI](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896534165)
and [CodeQL](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896534222),
with clean hosted Code/Security review, then merged as
`123de2b7f15014c742eb324c6c93845ef0bd6767`. The fetched target's project and
shared helper files match the reviewed candidate. All 63 selected Node,
workspace, package-manager, Nx, Turbo, and React mapper regressions passed with
one worker under the 384 MiB cap (356 unrelated cases filtered out). Issue #5
closed after proof.

PR #11 passed [CI](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896550133)
and [CodeQL](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896550214),
with clean hosted Code/Security review, then merged as
`1f871003db82785d5a0cb33dc8e465752af998c6`. Its fetched target's Gradle and
Maven files match the reviewed candidate. All 123 selected Gradle, Maven, JVM,
Kotlin, and Android mapper regressions passed with one worker under the 384 MiB
cap (296 unrelated cases filtered out). Issue #7 closed after proof.

PR #10 passed [CI](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896542313)
and [CodeQL](https://github.com/Revotech-Networks/clawpatch/actions/runs/40896542672),
then merged as `1bf3fca653961ec7bae5b14ab7f63defe1229e89`. Security review
completed; Code Review still reported running, with no posted findings, at
merge. No completed code-review verdict is claimed. Its retained Tiny mechanical
reuse classification requires feedback reconciliation, not waiting for a hosted
review. The detection/shared-scanner files on the fetched target match the
candidate. All 48 selected Swift, Mix, Elixir, and comment-related mapper cases
passed with one worker under the 384 MiB cap (371 unrelated cases filtered out).
Issue #6 closed after proof.

## Final integrated verification

The combined source target is `1bf3fca653961ec7bae5b14ab7f63defe1229e89`, tree
`6a6fdf34e8cbc798f5713d03ba15f7babaf57931`. Its normal push-triggered
[CI run](https://github.com/Revotech-Networks/clawpatch/actions/runs/40898593476)
passed dependency installation, typecheck, lint, formatting, all **768 tests**
(one Windows-only skip across 14 files), build, and package smoke. The installed
package mapped 13 expected features, including three CUDA features.
[CodeQL](https://github.com/Revotech-Networks/clawpatch/actions/runs/40898593480)
also passed. Dependency Review was not applicable: no dependency or workflow
files changed.

The root-owned `integration-proof-20261029` checkout fetched and checked each
merge in sequence. Per-merge targeted commands used the existing pnpm launcher,
`NODE_OPTIONS=--max-old-space-size=384`, and `--maxWorkers=1`. The final local
`pnpm build` passed in 2.17 seconds (392,364 KiB observed child peak RSS), with no
parallel local build or new heavy-build allocation. The host had about 7.3 GiB
available memory before this bounded compile. An unavailable optional `time`
executable caused no build to run; the actual compile used Python's process
measurement instead.

The freshly compiled CLI passed 14 synthetic commands covering init, heuristic
map, two-worker mock review, report/show/next, false-positive/open triage, fix
preview, revalidation, status/lock cleanup, and invalid mode/flag errors. Source
cleanliness was preserved. This is actual CLI orchestration with a mock provider,
not live provider E2E. Previously passed live Codex acceptance remains distinct.

The final isolated 8,000-chunk ACPX parser check passed under the 384 MiB heap
cap: 1,120,241 transcript bytes, 74,076 KiB peak RSS, approximately 5.25 ms.
The standalone Node process was launched from Python to avoid inheriting the
tool launcher's historical peak-RSS counter. These are synthetic parser results,
not a claim about external ACPX service latency or general provider scalability.

A fresh bounded source-discovery child inspected the combined helper imports,
JVM partitioning, fix-to-PR path coordinates, and ACPX schema-to-workflow handoff.
It found no substantiated composition-dependent P0/P1 lead. In the inspected
seams, snapshot differences still select committed patch files, parent-directory
patch paths remain rejected, and schema validation remains inside lazy candidate
selection. This was read-only source evidence: the child did not execute tests,
inspect Git metadata, call providers, or independently verify the root's revision
and runtime claims. It does not establish exhaustion of unsampled parser branches.

Reproduction, deduplication, impact, root cause, acceptance criteria, and the
smallest durable repair must be established before a finding is accepted.
Security-sensitive evidence remains private under `SECURITY.md`.

## Additional audit evidence and rejected leads

The Windows-only `.cmd` execution test is the one skipped baseline test.
Codex doctor and a real read-only review succeeded. Claude, Grok, OpenCode and Pi
version checks succeeded. A real Claude review failed with `terminal_reason=api_error`;
a bounded direct diagnostic returned not logged in. The docs explicitly require
API-key authentication and exclude subscription OAuth in `--bare` mode, so the
existing subscription login is insufficient; no credential changes were made.
Other version checks do not prove integration acceptance. ACPX is not installed. Cursor doctor refuses an unverifiable security-sensitive version;
that refusal was preserved.

The registry production audit reports Zod advisory `GHSA-mrhx-c7xc-m3w5`.
Inspection of its upstream fixing commit shows early rejection for collections
with explicit upper bounds. Clawpatch's schemas do not use those bounds, so a
version bump alone is not a proven causal repair for this repository. No major
finding has been accepted from that advisory. GitHub also lists 15 development
dependency alerts involving Vitest, Vite, Tinypool, PostCSS and source-map-js.
The inspected build uses TypeScript and Node-mode `vitest run`, not browser-mode
mock registration or an exposed Vite server. No reachable prototype-pollution
primitive or untrusted CSS transformation was established. These alerts remain
open provider records, not completed fixes or evidence of safety for every use.

Rejected scope expansions include broad React discovery consolidation (different
fallbacks), Ruby grouping replacement (feature identity risk), an unmeasured
nearby-test scan optimization, minor invalid-limit behavior, and stale descriptive
docs. No issue was created for these lower-impact observations.

## Gaps and final disposition

All five accepted issues have merged repairs and passed fetched-target checks.
There are no accepted findings parked or deferred. This is **PARTIAL — BLOCKED**
for comprehensive coverage, not an exhaustion verdict or a claim that every
supported integration is production-ready.

| Remaining surface                  | Evidence limit                                                                                                                 | Owner and next action                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Claude live provider               | Documented bare mode needs API-key authentication; the attempted review and diagnostic failed with existing subscription login | Portfolio coordinator can supply an already authorized compatible test environment; this task made no credential changes      |
| ACPX live provider                 | CLI absent; synthetic production-parser tests establish the repair, not provider service acceptance                            | Portfolio coordinator can provide an approved existing ACPX environment; no installation is authorized here                   |
| Cursor live provider               | Doctor refused an unverifiable security-sensitive version                                                                      | Preserve the refusal; environment owner must provide a supported verified version before further probing                      |
| Grok, OpenCode, Pi                 | Version checks only; live provider execution, enforcement and failure behavior remain unverified                               | Confirm authorized test accounts and safe integration environments before additional live coverage                            |
| Windows, macOS and Node 22 minimum | Linux/Node 26 executed; the Windows-only test remains skipped                                                                  | Run the existing checks in suitable approved platform environments; no new workflow or host installation is implied           |
| Detailed language-parser branches  | Every mapper area surveyed, selected contracts and adversarial cases inspected; not every branch or fixture examined           | Repository root can extend bounded source coverage when the portfolio schedules continuation; no exhaustive correctness claim |

The repository root retains responsibility for the report and final issue/PR
readback. The portfolio coordinator owns acceptance of this bounded result and
any environment/credential/platform follow-through. Existing dependency alerts
remain provider records with the reachability limits described above; no broad
dependency upgrade or severity inflation was used to increase counts.

No deployment, release, package publication, production mutation, permission
change, protection bypass, or denied Cursor probe replay occurred. The tracking
issue remains open for these coverage gaps after report publication, with no
unmerged accepted source repair hidden behind that disposition.
