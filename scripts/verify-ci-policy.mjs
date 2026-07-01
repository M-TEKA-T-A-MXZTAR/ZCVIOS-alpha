import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootCiPath = resolve(repositoryRoot, ".github", "workflows", "ci.yml");
const dependencyReviewPath = resolve(
  repositoryRoot,
  ".github",
  "workflows",
  "dependency-review.yml",
);

const rootCi = readFileSync(rootCiPath, "utf8");
const dependencyReview = readFileSync(dependencyReviewPath, "utf8");

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

assert.match(rootCi, /^\s{2}pull_request:\s*$/m, "Root CI must run for pull requests.");
assert.match(rootCi, /^\s{2}workflow_dispatch:\s*$/m, "Root CI must allow manual dispatch.");
assert.doesNotMatch(rootCi, /^\s{2}push:\s*$/m, "Root CI must not duplicate PR runs on push.");
assert.match(rootCi, /^concurrency:\s*$/m, "Root CI must define concurrency control.");
assert.match(
  rootCi,
  /^\s{2}cancel-in-progress:\s*true\s*$/m,
  "Root CI must cancel stale runs for the same pull request.",
);
assert.match(rootCi, /^\s{4}timeout-minutes:\s*\d+\s*$/m, "Root CI jobs must be time-bounded.");
assert.equal(countMatches(rootCi, /npm run build/g), 1, "Root CI must build the application exactly once.");
assert.equal(countMatches(rootCi, /npm ci/g), 1, "Root CI must install npm dependencies exactly once.");
assert.match(rootCi, /file:\.\/ci-build\.db/, "Root CI must retain a disposable build database.");
assert.match(
  rootCi,
  /file:\.\/ci-integration\.db/,
  "Root CI must retain a separate disposable integration database.",
);
assertPinnedActions(rootCi, "Root CI");

assert.match(
  dependencyReview,
  /^\s{2}pull_request:\s*$/m,
  "Dependency review must run for pull requests.",
);
assert.doesNotMatch(
  dependencyReview,
  /^\s{2}push:\s*$/m,
  "Dependency review must not run duplicate push checks.",
);
assert.match(
  dependencyReview,
  /^concurrency:\s*$/m,
  "Dependency review must define concurrency control.",
);
assert.match(
  dependencyReview,
  /^\s{2}cancel-in-progress:\s*true\s*$/m,
  "Dependency review must cancel stale runs for the same pull request.",
);
assert.match(
  dependencyReview,
  /^\s{4}timeout-minutes:\s*\d+\s*$/m,
  "Dependency review must be time-bounded.",
);
assertPinnedActions(dependencyReview, "Dependency review");

console.log("PASS: root CI cost, concurrency, timeout, database, and action-pin policy verified.");
