import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignoreFile = readFileSync(resolve(repositoryRoot, ".gitignore"), "utf8");
const ignoreLines = ignoreFile.split(/\r?\n/).map((line) => line.trim());

assert.equal(
  ignoreLines.includes("-e"),
  false,
  ".gitignore must not contain shell-output fragments such as a literal -e line.",
);

for (const requiredRule of [
  "node_modules/",
  ".next/",
  "build/",
  "dist/",
  "out/",
  "coverage/",
  "desktop/dist/",
  "desktop/src-tauri/target/",
  "__pycache__/",
  "*.py[cod]",
  ".pytest_cache/",
  "htmlcov/",
  "*.db",
  "*.db-journal",
  "*.db-shm",
  "*.db-wal",
  "*.sqlite",
  "*.sqlite-journal",
  "*.sqlite-shm",
  "*.sqlite-wal",
  "*.sqlite3",
  "*.sqlite3-journal",
  "*.sqlite3-shm",
  "*.sqlite3-wal",
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

const escapeForRegExp = (value) => value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
const pathSegmentPattern = (segment) => new RegExp(`(^|/)${escapeForRegExp(segment)}/`);
const fileExtensionPattern = (extension) => new RegExp(`${escapeForRegExp(extension)}$`);

const forbiddenTrackedPatterns = [
  pathSegmentPattern("__pycache__"),
  fileExtensionPattern(".pyc"),
  fileExtensionPattern(".pyo"),
  fileExtensionPattern(".pyd"),
  pathSegmentPattern(".pytest_cache"),
  pathSegmentPattern("node_modules"),
  pathSegmentPattern(".next"),
  pathSegmentPattern("build"),
  pathSegmentPattern("dist"),
  pathSegmentPattern("out"),
  pathSegmentPattern("coverage"),
  pathSegmentPattern("htmlcov"),
  pathSegmentPattern("desktop/dist"),
  pathSegmentPattern("desktop/src-tauri/target"),
  fileExtensionPattern(".db"),
  fileExtensionPattern(".db-journal"),
  fileExtensionPattern(".db-shm"),
  fileExtensionPattern(".db-wal"),
  fileExtensionPattern(".sqlite"),
  fileExtensionPattern(".sqlite-journal"),
  fileExtensionPattern(".sqlite-shm"),
  fileExtensionPattern(".sqlite-wal"),
  fileExtensionPattern(".sqlite3"),
  fileExtensionPattern(".sqlite3-journal"),
  fileExtensionPattern(".sqlite3-shm"),
  fileExtensionPattern(".sqlite3-wal"),
];

const forbiddenTrackedFiles = trackedFiles.filter((file) =>
  forbiddenTrackedPatterns.some((pattern) => pattern.test(file)),
);

if (forbiddenTrackedFiles.length > 0) {
  console.error("Generated files must not be tracked:");
  for (const file of forbiddenTrackedFiles) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("PASS: repository ignore rules and tracked-file hygiene verified.");
