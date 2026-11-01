# Revotech fork of clawpatch (retired)

This file is the agent guide to `Revotech-Networks/clawpatch`, our fork of
`openclaw/clawpatch`. Upstream owns every other doc in this repository; the only fork edit to an
upstream file is the `<!-- fork:start -->` block at the end of `AGENTS.md`.

## Status: retired and archived

- Revotech retired this fork on 2026-11-01 and archived it on GitHub, so it is
  read-only.
- Do not build, deploy or depend on it. For clawpatch, use upstream:
  `https://github.com/openclaw/clawpatch`.
- Do not unarchive it to make changes. If Revotech needs a clawpatch fix,
  contribute it upstream or start a fresh fork from upstream `main`. This fork's
  history is far behind upstream.

## Why it existed and why it was retired

- It gave the RevoMind worker (`Revotech-Networks/revo-claude-worker`) a
  buildable copy. The worker's scripts cloned it to
  `/root/openclaw-tools/clawpatch` on the worker PC and ran it by hand through
  `scripts/clawpatch_revomind.sh`. No service, timer or cron job called it, and
  the worker's Python code never did.
- `revo-claude-worker` was archived on 2026-10-28, which left this fork with no
  consumer.
- Our `main` stayed on upstream `1fbd2ce` (just after `v0.5.0`). It fell
  **154 commits behind** upstream `main` (`v0.8.4`, `79c1495`), so syncing would
  have cost more than the fork was worth.
- Leftovers on the worker PC are inert: the clone at
  `/root/openclaw-tools/clawpatch` and map state at
  `/root/revo-claude-worker-logs/clawpatch/revomind`. An operator may delete
  them by hand.

## What differs from upstream

Our `main` is upstream `1fbd2ce` plus six squash-merged PRs from the October
2026 audit (tracking issue `Revotech-Networks/clawpatch#1`, evidence in
`QA-HARDENING-REPORT.md`). None changes the CLI surface, config schema, defaults,
CI, `package.json` or `pnpm-lock.yaml`. List them yourself:

```bash
git remote get-url upstream || git remote add upstream https://github.com/openclaw/clawpatch.git
git remote set-url --push upstream DISABLED   # never push to upstream by mistake
git fetch upstream
git log --oneline upstream/main..origin/main
git diff upstream/main...origin/main --stat
```

| Commit    | PR  | Change                                                                          | Status upstream                                                                                                            |
| --------- | --- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `2bf6940` | #3  | ACPX output parsing yields candidates lazily (fix)                              | **Not fixed.** Upstream moved the code to `src/providers/acpx.ts` and still builds every suffix eagerly. Worth upstreaming |
| `3ccb6eb` | #8  | Change paths are correct when `--root` is a nested project (fix)                | Fixed independently by upstream #210 (`ead0ec4`) through `dirtyFiles` in `src/git.ts`                                      |
| `1f87100` | #11 | Gradle and Maven walk each module source tree once (refactor)                   | Not upstream; small win, worth upstreaming                                                                                 |
| `123de2b` | #9  | Node mapper reuses helpers from `src/mappers/shared.ts` (refactor)              | Not upstream; conflicts with upstream's rewrite of `src/mappers/projects.ts`                                               |
| `1bf3fca` | #10 | `src/detect.ts` reuses comment scanners from `src/mappers/shared.ts` (refactor) | Superseded; upstream moved the scanners to `src/source-comments.ts`                                                        |
| `1abf455` | #12 | `QA-HARDENING-REPORT.md` (docs)                                                 | Fork only                                                                                                                  |

### ACPX lazy suffix parsing (`2bf6940`)

`acpxJsonCandidates` and `chunkSuffixCandidates` in `src/provider.ts` yield
candidate JSON strings one at a time instead of building every message suffix
up front. Before the fix, a 4,000-chunk ACPX stream used about 235 MB RSS and
8,000 chunks exhausted a 384 MiB heap; after it, both stay near 74 MB. Retry
order, schema fallback and stop-reason errors are unchanged. It applies to any
command run with `--provider acpx`, for example:

```bash
node dist/cli.js review --provider acpx --model codex:gpt-5-codex --limit 3
```

That needs the separate `acpx` CLI (`npm install -g acpx@latest`). `--model`
takes `<agent>` or `<agent>:<model>`; see `docs/providers.md` (ACPX section). Without it,
verify the fix with:

```bash
pnpm test src/provider.test.ts -t "long thought stream"
pnpm test src/provider.test.ts -t "repeated whitespace suffixes"
```

To upstream it, port the generator and the `Iterable<string>` candidate type to
`src/providers/acpx.ts` on a branch from upstream `main`, and move the two tests
with it.

### Nested project roots (`3ccb6eb`)

`sourceChangedPaths` in `src/change-audit.ts` maps `git status` paths, which
are relative to the Git top level, to paths relative to `--root`. Without it,
running from a nested project could reject a clean tree as dirty, record wrong
patch paths and miss edits to already-dirty files. Paths outside `--root`
(`../...`) still count for the dirty-tree guard. Run from the root of a Git
repository whose package lives in `packages/app` and which has at least one
commit (`fix` requires a clean worktree by default). Set
`CLAWPATCH_PROVIDER=mock` to try it without a real provider:

```bash
node dist/cli.js --root packages/app init
node dist/cli.js --root packages/app map
node dist/cli.js --root packages/app review --limit 3
node dist/cli.js --root packages/app fix --finding <finding-id>
```

`review` prints the finding ID on its `next:` line. `fix` reports
`changedFiles` relative to `packages/app` (for example `src/index.ts`). Verify
with:

```bash
pnpm test src/change-audit.test.ts
pnpm test src/workflow.test.ts -t "records fix files and previews PRs"
```

### Refactors (`123de2b`, `1f87100`, `1bf3fca`)

These are internal refactors with nothing to invoke. Their PRs proved the same
mapper output on test fixtures, and the full suite (`pnpm test`) covers every
mapper.

## Build and test the archived snapshot

Use this only to inspect or reproduce the fork's behaviour. Requirements: Node
22 or newer (CI uses Node 26) and pnpm `11.1.2` (pinned in `package.json`
`packageManager`). `AGENTS.md` lists a shorter pre-handoff check; CI also runs
`format:check` and `pack:smoke`.

On the Omarchy workstation `pnpm` is not on `PATH` and `corepack pnpm` fails
under mise. Put `npm exec --yes --package=pnpm@11.1.2 --` in front of every
`pnpm ...` command in this file, keeping `pnpm` itself, for example:

```bash
npm exec --yes --package=pnpm@11.1.2 -- pnpm install --frozen-lockfile
```

The CI gate (`.github/workflows/ci.yml`), run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm pack:smoke
node dist/cli.js --version   # 0.5.0
```

Expected: 14 test files, 768 passed, 1 skipped (a Windows-only `.cmd` test),
and `packaged CLI smoke mapped 13 features (3 CUDA)`.

`pnpm pack:smoke` fails under npm 12 with `npm pack did not report a tarball
filename`, because npm 12 changed the `npm pack --json` output. CI uses npm 11,
and upstream has already fixed the script. Run it with npm 11 on `PATH`:

```bash
npm exec --yes --package=pnpm@11.1.2 --package=npm@11 -- pnpm pack:smoke
```

To run the CLI end to end without a real provider, set
`CLAWPATCH_PROVIDER=mock`. The mock provider reports a finding for any file that
contains `TODO_BUG`. Use a throwaway Git repository with at least one commit,
because `fix` requires a clean worktree by default.

## GitHub notes

- Pass `--repo Revotech-Networks/clawpatch` to `gh` in a clone with an
  `upstream` remote. Without it, `gh` resolves to `openclaw/clawpatch`.
- Branches other than `main` were copied from upstream when the fork was made
  (`codex/react-router-mapper`, `fix-ruby-rails-node-roots`,
  `chore/setup-baseline-20260522`, `feat/clawpatch-operating-loop`) or belong
  to the October 2026 audit (`audit/...`, `fix/...`, `refactor/...`). The audit
  work landed in `main` through PRs #3 to #12.

## Upstream docs that stay authoritative

Read upstream's current docs at `https://github.com/openclaw/clawpatch`, not the
stale copies here. In this snapshot:

| Read                                     | When                                                |
| ---------------------------------------- | --------------------------------------------------- |
| `AGENTS.md`                              | Before any code change: layout, commands, style     |
| `README.md`, `docs/quickstart.md`        | For what clawpatch does and the command list        |
| `docs/providers.md`                      | For provider setup, including ACPX                  |
| `docs/patching.md`, `docs/validation.md` | For `fix`, `revalidate` and `open-pr`               |
| `docs/safety.md`, `SECURITY.md`          | Before touching provider permissions or Git staging |
| `QA-HARDENING-REPORT.md` (fork only)     | For the evidence behind our six commits             |
