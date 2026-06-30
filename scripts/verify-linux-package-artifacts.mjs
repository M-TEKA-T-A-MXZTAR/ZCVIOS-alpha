import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  chmod,
  mkdtemp,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";

const bundleRoot = resolve(
  process.argv[2] ?? "desktop/src-tauri/target/release/bundle",
);

async function collectFiles(root, predicate) {
  const matches = [];

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (predicate(path)) {
        matches.push(path);
      }
    }
  }

  await walk(root);
  return matches.sort();
}

function command(program, args, options = {}) {
  return execFileSync(program, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function desktopValue(content, key) {
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  assert.ok(match, `Generated desktop entry must contain ${key}`);
  return match[1].trim();
}

const debFiles = await collectFiles(
  join(bundleRoot, "deb"),
  (path) => path.endsWith(".deb"),
);
const appImages = await collectFiles(
  join(bundleRoot, "appimage"),
  (path) => path.endsWith(".AppImage"),
);

assert.equal(debFiles.length, 1, "Exactly one Debian test package must be generated");
assert.equal(appImages.length, 1, "Exactly one AppImage test package must be generated");

const [debPath] = debFiles;
const [appImagePath] = appImages;
const debStats = await stat(debPath);
const appImageStats = await stat(appImagePath);
assert.ok(debStats.size > 100_000, "Debian package is unexpectedly small");
assert.ok(appImageStats.size > 100_000, "AppImage package is unexpectedly small");

const debPackage = command("dpkg-deb", ["--field", debPath, "Package"]);
const debVersion = command("dpkg-deb", ["--field", debPath, "Version"]);
const debArchitecture = command("dpkg-deb", ["--field", debPath, "Architecture"]);
assert.equal(debPackage, "zcvios-desktop");
assert.equal(debVersion, "0.1.0");
assert.ok(debArchitecture.length > 0);

const debExtractRoot = await mkdtemp(join(tmpdir(), "zcvios-deb-inspect-"));
command("dpkg-deb", ["--extract", debPath, debExtractRoot]);
const debDesktopEntries = await collectFiles(
  debExtractRoot,
  (path) => path.endsWith(".desktop"),
);
const debBinaries = await collectFiles(
  debExtractRoot,
  (path) => basename(path) === "zcvios-desktop",
);
const debIcons = await collectFiles(
  debExtractRoot,
  (path) => path.endsWith(".png") && path.includes("/icons/"),
);
assert.equal(debDesktopEntries.length, 1, "Debian package must contain one desktop entry");
assert.equal(debBinaries.length, 1, "Debian package must contain zcvios-desktop");
assert.ok(debIcons.length >= 1, "Debian package must contain a launcher icon");

const debDesktop = await readFile(debDesktopEntries[0], "utf8");
assert.equal(desktopValue(debDesktop, "Name"), "ZCVIOS Desktop");
assert.match(desktopValue(debDesktop, "Exec"), /zcvios-desktop/);
assert.ok(desktopValue(debDesktop, "Icon").length > 0);
assert.ok(desktopValue(debDesktop, "Categories").length > 0);

await chmod(appImagePath, 0o755);
const appImageExtractRoot = await mkdtemp(join(tmpdir(), "zcvios-appimage-inspect-"));
execFileSync(appImagePath, ["--appimage-extract"], {
  cwd: appImageExtractRoot,
  stdio: "inherit",
});
const squashRoot = join(appImageExtractRoot, "squashfs-root");
const appImageDesktopEntries = await collectFiles(
  squashRoot,
  (path) => path.endsWith(".desktop"),
);
const appImageBinaries = await collectFiles(
  squashRoot,
  (path) => basename(path) === "zcvios-desktop",
);
const appRuns = await collectFiles(
  squashRoot,
  (path) => basename(path) === "AppRun",
);
assert.equal(appImageDesktopEntries.length, 1, "AppImage must contain one desktop entry");
assert.equal(appImageBinaries.length, 1, "AppImage must contain zcvios-desktop");
assert.equal(appRuns.length, 1, "AppImage must contain AppRun");

const appImageDesktop = await readFile(appImageDesktopEntries[0], "utf8");
assert.equal(desktopValue(appImageDesktop, "Name"), "ZCVIOS Desktop");
assert.match(desktopValue(appImageDesktop, "Exec"), /zcvios-desktop/);
assert.ok(desktopValue(appImageDesktop, "Icon").length > 0);
assert.ok(desktopValue(appImageDesktop, "Categories").length > 0);

const manifest = {
  schemaVersion: 1,
  deb: {
    file: relative(bundleRoot, debPath),
    bytes: debStats.size,
    package: debPackage,
    version: debVersion,
    architecture: debArchitecture,
    desktopEntry: relative(debExtractRoot, debDesktopEntries[0]),
    binary: relative(debExtractRoot, debBinaries[0]),
  },
  appImage: {
    file: relative(bundleRoot, appImagePath),
    bytes: appImageStats.size,
    desktopEntry: relative(squashRoot, appImageDesktopEntries[0]),
    binary: relative(squashRoot, appImageBinaries[0]),
  },
};

await writeFile(
  join(bundleRoot, "package-verification.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(manifest, null, 2));
console.log("PASS: generated Debian and AppImage package structures verified.");
