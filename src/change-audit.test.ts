import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdir, rm, symlink } from "node:fs/promises";
import { join, relative } from "node:path";
import {
  changedPathsBetweenSnapshots,
  hasSourceDirtyWorktree,
  sourceChangedSnapshots,
} from "./change-audit.js";
import { runCommand } from "./exec.js";
import { fixtureRoot, writeFixture } from "./test-helpers.js";

vi.mock("./exec.js", () => ({ runCommand: vi.fn() }));

describe("change auditing", () => {
  let workspace: string;
  let gitRoot: string;
  let root: string;
  let stateDir: string;
  let status: string;
  let failedQueries: string[];

  beforeEach(async () => {
    workspace = await fixtureRoot("clawpatch-change-audit-");
    gitRoot = join(workspace, "repo");
    root = join(gitRoot, "packages/app");
    stateDir = join(root, ".clawpatch");
    status = "";
    failedQueries = [];
    await writeFixture(root, "src/index.ts", "export const value = 1;\n");
    await writeFixture(stateDir, "config.json", "{}\n");
    vi.mocked(runCommand).mockImplementation(async (command, cwd) => {
      const query = command.startsWith("git status ") ? "status" : "root";
      if (query === "root" && command !== "git rev-parse --show-toplevel") {
        throw new Error(`unexpected command: ${command}`);
      }
      const failed = failedQueries.includes(query);
      return {
        command,
        cwd,
        exitCode: failed ? 1 : 0,
        durationMs: 0,
        stdout: failed ? "" : query === "status" ? status : `${gitRoot}\n`,
        stderr: failed ? "synthetic Git query failure" : "",
      };
    });
  });

  afterEach(async () => {
    vi.resetAllMocks();
    await rm(workspace, { recursive: true, force: true });
  });

  it.each(["", "packages/app/"])(
    "filters state and records project-relative edits for root %s",
    async (prefix) => {
      root = join(gitRoot, prefix);
      stateDir = join(root, ".clawpatch");
      await writeFixture(root, "src/index.ts", "export const value = 1;\n");
      status = `?? ${prefix}.clawpatch/config.json\0`;

      expect(await hasSourceDirtyWorktree(root, stateDir)).toBe(false);
      const before = (await sourceChangedSnapshots(root, stateDir))!;
      expect([...before]).toEqual([]);

      await writeFixture(root, "src/index.ts", "export const value = 2;\n");
      status += ` M ${prefix}src/index.ts\0`;
      const after = (await sourceChangedSnapshots(root, stateDir))!;

      expect(await hasSourceDirtyWorktree(root, stateDir)).toBe(true);
      expect(changedPathsBetweenSnapshots(before, after)).toEqual(["src/index.ts"]);
      expect(after.get("src/index.ts")).toMatch(/^file:/u);
    },
  );

  it("detects further edits to an already-dirty nested file", async () => {
    status = " M packages/app/src/index.ts\0";
    const before = (await sourceChangedSnapshots(root, stateDir))!;
    await writeFixture(root, "src/index.ts", "export const value = 2;\n");
    const after = (await sourceChangedSnapshots(root, stateDir))!;

    expect(changedPathsBetweenSnapshots(before, after)).toEqual(["src/index.ts"]);
    expect(before.get("src/index.ts")).toMatch(/^file:/u);
    expect(after.get("src/index.ts")).toMatch(/^file:/u);
  });

  it.each(["README.md", "packages/sibling/file.txt", ".clawpatch/config.json"])(
    "keeps repository-wide dirtiness visible for %s",
    async (path) => {
      await writeFixture(gitRoot, path, "user change\n");
      status = ` M ${path}\0`;
      const externalStateDir = join(gitRoot, ".clawpatch");

      expect(await hasSourceDirtyWorktree(root, stateDir)).toBe(true);
      expect(await hasSourceDirtyWorktree(root, externalStateDir)).toBe(true);
      const snapshots = (await sourceChangedSnapshots(root, stateDir))!;
      const projectPath = relative(root, join(gitRoot, path)).replace(/\\/gu, "/");
      expect([...snapshots.keys()]).toEqual([projectPath]);
      expect(snapshots.get(projectPath)).toMatch(/^file:/u);
    },
  );

  it("does not exclude source names that only start with the state directory name", async () => {
    await writeFixture(root, ".clawpatch-source.txt", "source\n");
    status = "?? packages/app/.clawpatch-source.txt\0";

    expect(await hasSourceDirtyWorktree(root, stateDir)).toBe(true);
    expect([...(await sourceChangedSnapshots(root, stateDir))!.keys()]).toEqual([
      ".clawpatch-source.txt",
    ]);
  });

  (process.platform === "win32" ? it.skip : it)(
    "uses project-relative paths for symlinked roots",
    async () => {
      const alias = join(workspace, "alias");
      await symlink(gitRoot, alias, "dir");
      const aliasRoot = join(alias, "packages/app");
      stateDir = join(aliasRoot, ".clawpatch");
      status = "?? packages/app/.clawpatch/config.json\0";
      expect(await hasSourceDirtyWorktree(aliasRoot, stateDir)).toBe(false);

      status += " M packages/app/src/index.ts\0";
      const snapshots = (await sourceChangedSnapshots(aliasRoot, stateDir))!;
      expect([...snapshots.keys()]).toEqual(["src/index.ts"]);
      expect(snapshots.get("src/index.ts")).toMatch(/^file:/u);
    },
  );

  it.each(["R", "C"])("preserves destination-only %s records", async (kind) => {
    await writeFixture(root, "src/renamed.ts", "export const renamed = 1;\n");
    status = `${kind}  packages/app/src/renamed.ts\0packages/app/src/original.ts\0 M packages/app/src/index.ts\0`;
    const snapshots = (await sourceChangedSnapshots(root, stateDir))!;

    expect([...snapshots.keys()]).toEqual(["src/index.ts", "src/renamed.ts"]);
    expect(snapshots.get("src/renamed.ts")).toMatch(/^file:/u);
  });

  it.each([["status"], ["root"], ["status", "root"]])(
    "fails the clean guard closed and falls back to source snapshots on query failures %j",
    async (...queries) => {
      failedQueries = queries;
      status = "?? packages/app/.clawpatch/config.json\0";
      await writeFixture(root, "node_modules/dependency.js", "generated\n");
      await writeFixture(root, "dist/index.js", "generated\n");

      expect(await hasSourceDirtyWorktree(root, stateDir)).toBe(true);
      const before = (await sourceChangedSnapshots(root, stateDir))!;
      expect([...before.keys()]).toEqual(["src/index.ts"]);
      await writeFixture(root, "src/index.ts", "export const value = 2;\n");
      const after = (await sourceChangedSnapshots(root, stateDir))!;
      expect(changedPathsBetweenSnapshots(before, after)).toEqual(["src/index.ts"]);
    },
  );

  it("fails closed even when a failed Git query falls back to an empty project", async () => {
    failedQueries = ["status", "root"];
    const emptyRoot = join(workspace, "empty");
    await mkdir(emptyRoot);

    expect(await hasSourceDirtyWorktree(emptyRoot, join(emptyRoot, ".clawpatch"))).toBe(true);
    expect([...(await sourceChangedSnapshots(emptyRoot, join(emptyRoot, ".clawpatch")))!]).toEqual(
      [],
    );
  });
});
