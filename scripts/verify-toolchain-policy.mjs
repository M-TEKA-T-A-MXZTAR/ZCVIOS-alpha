import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedNodeVersion = "22.18.0";
const expectedNodeRange = ">=22.18.0 <23";
const expectedNpmRange = ">=10 <11";

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path), "utf8"));
}

function readText(path) {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

const rootPackage = readJson("package.json");
const rootLock = readJson("package-lock.json");
const desktopPackage = readJson("desktop/package.json");
const nvmVersion = readText(".nvmrc").trim();

assert.equal(nvmVersion, expectedNodeVersion, ".nvmrc must pin the shared Node version.");

for (const [label, manifest] of [
  ["root package", rootPackage],
  ["desktop package", desktopPackage],
]) {
  assert.equal(manifest.engines?.node, expectedNodeRange, `${label} must declare the shared Node range.`);
  assert.equal(manifest.engines?.npm, expectedNpmRange, `${label} must declare the supported npm major.`);
}

for (const dependency of ["react", "react-dom"]) {
  assert.equal(
    rootPackage.dependencies?.[dependency],
    desktopPackage.dependencies?.[dependency],
    `${dependency} must use the same exact version in root and desktop manifests.`,
  );
  assert.equal(
    rootLock.packages?.[""]?.dependencies?.[dependency],
    rootPackage.dependencies?.[dependency],
    `Root lock metadata must match the ${dependency} manifest version.`,
  );
}

for (const workflowPath of [
  ".github/workflows/ci.yml",
  ".github/workflows/desktop-ci.yml",
  ".github/workflows/desktop-package-ci.yml",
]) {
  const workflow = readText(workflowPath);
  assert.match(
    workflow,
    new RegExp(`^\\s+node-version:\\s*["']?${expectedNodeVersion.replaceAll(".", "\\.")}["']?\\s*$`, "m"),
    `${workflowPath} must use Node ${expectedNodeVersion}.`,
  );
}

console.log(
  "PASS: shared Node 22.18.0 and React manifest alignment verified; Prisma and desktop lockfile alignment remain separately bounded.",
);
