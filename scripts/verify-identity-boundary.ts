import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { resolveActiveProfile } from "../src/application/identity.ts";

const browserProfile = {
  id: "browser-user",
  displayName: "Browser Operator",
  email: "browser@example.test",
  source: "browser-session",
};

const localProfile = {
  id: "local-owner",
  displayName: "Local Operator",
  email: null,
  source: "local-profile",
};

assert.deepEqual(
  await resolveActiveProfile({ getActiveProfile: async () => browserProfile }),
  browserProfile,
);
assert.deepEqual(
  await resolveActiveProfile({ getActiveProfile: async () => localProfile }),
  localProfile,
);
assert.equal(
  await resolveActiveProfile({ getActiveProfile: async () => null }),
  null,
);

const routeRoot = path.resolve("src/app/rpc");

const collectRouteFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRouteFiles(target)));
    } else if (entry.name === "route.ts") {
      files.push(target);
    }
  }

  return files;
};

for (const file of await collectRouteFiles(routeRoot)) {
  const source = await readFile(file, "utf8");
  assert.equal(
    source.includes("requireSession"),
    false,
    `${path.relative(process.cwd(), file)} still imports the legacy session helper`,
  );
  assert.equal(
    source.includes("session.user.id"),
    false,
    `${path.relative(process.cwd(), file)} still depends on the NextAuth session shape`,
  );
}

console.log("PASS: active profile identity boundary verified.");
