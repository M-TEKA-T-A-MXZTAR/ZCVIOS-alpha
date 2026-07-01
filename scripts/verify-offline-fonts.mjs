import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(repositoryRoot, "src");
const layoutPath = resolve(sourceRoot, "app", "layout.tsx");
const globalStylesPath = resolve(sourceRoot, "app", "globals.css");
const inspectedExtensions = new Set([".css", ".js", ".jsx", ".mjs", ".ts", ".tsx"]);

function collectSourceFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
    } else if (entry.isFile() && inspectedExtensions.has(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

const forbiddenRemoteFontPatterns = [
  {
    label: "next/font/google helper",
    pattern: /next\/font\/google/i,
  },
  {
    label: "Google Fonts stylesheet host",
    pattern: /fonts\.googleapis\.com/i,
  },
  {
    label: "Google Fonts asset host",
    pattern: /fonts\.gstatic\.com/i,
  },
];

const violations = [];

for (const filePath of collectSourceFiles(sourceRoot)) {
  const content = readFileSync(filePath, "utf8");

  for (const { label, pattern } of forbiddenRemoteFontPatterns) {
    if (pattern.test(content)) {
      violations.push(`${filePath.slice(repositoryRoot.length + 1)}: ${label}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Remote font dependencies are not permitted in application source:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

const layoutSource = readFileSync(layoutPath, "utf8");
const globalStyles = readFileSync(globalStylesPath, "utf8");

assert.doesNotMatch(
  layoutSource,
  /next\/font\/google/i,
  "The root layout must not import Google-hosted font helpers.",
);
assert.match(
  globalStyles,
  /--font-family-body:[^;]*system-ui/i,
  "The body font stack must include a dependable system-ui fallback.",
);
assert.match(
  globalStyles,
  /--font-family-heading:[^;]*system-ui/i,
  "The heading font stack must include a dependable system-ui fallback.",
);

console.log("PASS: application source uses system fonts without Google Font retrieval.");
