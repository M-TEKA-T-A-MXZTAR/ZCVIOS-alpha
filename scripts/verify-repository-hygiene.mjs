import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const ignoreFile = readFileSync(resolve(repositoryRoot, ".gitignore"), "utf8");
const ignoreLines = ignoreFile.split(/\r?\n/).map((line) => line.trim());

assert.equal(
  ignoreLines.includes("-e"),
  false,
  ".gitignore must not contain shell-output fragments such as a literal -e line.",
);

for (const requiredRule of [
  "node_modules/",
  "desktop/src-tauri/target/",
  "__pycache__/",
  "*.py[cod]",
  ".pytest_cache/",
  "*.db",
]) {
  assert.ok(ignoreLines.includes(requiredRule), `.gitignore must include ${requiredRule}`);
}

const trackedResult = spawnSync("git", ["ls-files", "-z"], {
  cwd: repositoryRoot,
  encoding: "utf8",
  shell: false,
});

if (trackedResult.error || trackedResult.status !== 0) {
  throw new Error(
    `Unable to inspect tracked files with git ls-files: ${trackedResult.error?.message ?? trackedResult.stderr}`,
  );
}

const trackedFiles = trackedResult.stdout.split("\0").filter(Boolean);
const forbiddenTrackedPatterns = [
  /(^|\/)__pycache__\//,
  /\.py[co]$/,
  /(^|\/)\.pytest_cache\//,
  /(^|\/)node_modules\//,
  /^\.next\//,
  /^desktop\/dist\//,
  /^desktop\/src-tauri\/target\//,
];

const forbiddenTrackedFiles = trackedFiles.filter((file) =>
  forbiddenTrackedPatterns.some((pattern) => pattern.test(file)),
);

assert.deepEqual(
  forbiddenTrackedFiles,
  [],
  `Generated files must not be tracked:\n${forbiddenTrackedFiles.join("\n")}`,
);

console.log("PASS: repository ignore rules and tracked-file hygiene verified.");
