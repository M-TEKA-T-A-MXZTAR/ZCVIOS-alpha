import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowsRoot = resolve(repositoryRoot, ".github", "workflows");

const workflowFiles = {
  rootCi: resolve(workflowsRoot, "ci.yml"),
  dependencyReview: resolve(workflowsRoot, "dependency-review.yml"),
  desktopShell: resolve(workflowsRoot, "desktop-ci.yml"),
  linuxPackages: resolve(workflowsRoot, "desktop-package-ci.yml"),
};

const workflows = Object.fromEntries(
  Object.entries(workflowFiles).map(([key, path]) => [key, readFileSync(path, "utf8")]),
);

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function assertPinnedActions(source, label) {
  const actionReferences = [...source.matchAll(/^\s*uses:\s*([^@\s]+)@([^\s#]+)/gm)];

  assert.ok(actionReferences.length > 0, `${label} must contain action references.`);

  for (const [, action, reference] of actionReferences) {
    assert.match(
      reference,
      /^[0-9a-f]{40}$/,
      `${label} must pin ${action} to a full commit SHA, received ${reference}.`,
    );
  }
}

function assertContentsReadPermission(source, label) {
  assert.doesNotMatch(source, /^permissions:\s*read-all\s*$/m, `${label} must not use read-all.`);
  assert.match(
    source,
    /^permissions:\s*$\n\s{2}contents:\s*read\s*$/m,
    `${label} must grant contents: read explicitly.`,
  );
}

function assertBoundedWorkflow(source, label) {
  assert.match(source, /^\s{2}pull_request:\s*$/m, `${label} must run for pull requests.`);
  assert.doesNotMatch(source, /^\s{2}push:\s*$/m, `${label} must not run duplicate push checks.`);
  assert.match(source, /^concurrency:\s*$/m, `${label} must define concurrency control.`);
  assert.match(
    source,
    /^\s{2}cancel-in-progress:\s*true\s*$/m,
    `${label} must cancel stale runs for the same pull request.`,
  );
  assert.match(source, /^\s{4}timeout-minutes:\s*\d+\s*$/m, `${label} must be time-bounded.`);
  assertPinnedActions(source, label);
  assertContentsReadPermission(source, label);
}

const { rootCi, dependencyReview, desktopShell, linuxPackages } = workflows;

assertBoundedWorkflow(rootCi, "Root CI");
assert.match(rootCi, /^\s{2}workflow_dispatch:\s*$/m, "Root CI must allow manual dispatch.");
assert.equal(countMatches(rootCi, /npm run build/g), 1, "Root CI must build the application exactly once.");
assert.equal(countMatches(rootCi, /npm ci/g), 1, "Root CI must install npm dependencies exactly once.");
assert.match(rootCi, /file:\.\/ci-build\.db/, "Root CI must retain a disposable build database.");
assert.match(
  rootCi,
  /file:\.\/ci-integration\.db/,
  "Root CI must retain a separate disposable integration database.",
);

assertBoundedWorkflow(dependencyReview, "Dependency review");
assert.match(
  dependencyReview,
  /^\s{4}branches:\s*\["main"\]\s*$/m,
  "Dependency review must target pull requests into main.",
);
assert.match(
  dependencyReview,
  /^\s{2}pull-requests:\s*write\s*$/m,
  "Dependency review must retain pull-request write access for its configured summary comment.",
);

for (const [source, label] of [
  [desktopShell, "Desktop shell CI"],
  [linuxPackages, "Linux package CI"],
]) {
  assertBoundedWorkflow(source, label);
  assert.match(source, /^\s{2}workflow_dispatch:\s*$/m, `${label} must allow manual dispatch.`);
  assert.match(source, /^\s{4}paths:\s*$/m, `${label} must remain path-filtered.`);
}

console.log(
  "PASS: CI trigger, concurrency, timeout, permission, action-pin, build-count, database, and expensive-workflow policy verified.",
);
