import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const requiredFiles = [
  "desktop/package.json",
  "desktop/index.html",
  "desktop/vite.config.ts",
  "desktop/src/App.tsx",
  "desktop/src/main.tsx",
  "desktop/src/components/ErrorBoundary.tsx",
  "desktop/src/adapters/local-profile-provider.ts",
  "desktop/src-tauri/Cargo.toml",
  "desktop/src-tauri/icons/icon.png",
  "desktop/src-tauri/src/lib.rs",
  "desktop/src-tauri/src/main.rs",
  "desktop/src-tauri/tauri.conf.json",
  "desktop/src-tauri/capabilities/default.json",
];

for (const file of requiredFiles) {
  await access(path.resolve(file));
}

const desktopPackage = JSON.parse(await readFile("desktop/package.json", "utf8"));
assert.equal(desktopPackage.private, true);
assert.equal(desktopPackage.scripts.build, "tsc -b && vite build");
assert.equal(desktopPackage.scripts["tauri:dev"], "tauri dev");
assert.equal(desktopPackage.dependencies.react.startsWith("19."), true);
assert.equal(Boolean(desktopPackage.dependencies["@tauri-apps/api"]), true);
assert.equal(Boolean(desktopPackage.devDependencies["@tauri-apps/cli"]), true);

const forbiddenDependencies = [
  "@tauri-apps/plugin-sql",
  "better-sqlite3",
  "sqlite3",
  "prisma",
  "next",
  "next-auth",
];

for (const dependency of forbiddenDependencies) {
  const isPresent = Boolean(
    desktopPackage.dependencies?.[dependency] || desktopPackage.devDependencies?.[dependency],
  );
  assert.equal(
    isPresent,
    false,
    `Desktop shell must not add persistence or browser-runtime dependency ${dependency}`,
  );
}

const tauriConfig = JSON.parse(await readFile("desktop/src-tauri/tauri.conf.json", "utf8"));
assert.equal(tauriConfig.productName, "ZCVIOS Desktop");
assert.equal(tauriConfig.identifier, "nz.co.mxztar.zcvios");
assert.equal(tauriConfig.build.frontendDist, "../dist");
assert.equal(tauriConfig.bundle.active, false);
assert.equal(tauriConfig.app.windows[0].label, "main");
assert.match(tauriConfig.app.windows[0].title, /ZCVIOS/);

const cargoManifest = await readFile("desktop/src-tauri/Cargo.toml", "utf8");
assert.match(cargoManifest, /license = "MIT"/);
assert.match(cargoManifest, /tauri = \{ version = "=2\.11\.1"/);
assert.match(cargoManifest, /tauri-plugin-opener = "=2\.5\.4"/);
assert.match(cargoManifest, /time = "=0\.3\.51"/);

const icon = await readFile("desktop/src-tauri/icons/icon.png");
assert.deepEqual(
  [...icon.subarray(0, 8)],
  [137, 80, 78, 71, 13, 10, 26, 10],
  "Desktop icon must be a valid PNG file",
);
assert.equal(icon.length > 256, true, "Desktop icon must not be an empty placeholder");

const localProfileSource = await readFile(
  "desktop/src/adapters/local-profile-provider.ts",
  "utf8",
);
assert.match(localProfileSource, /LOCAL_OWNER_PROFILE_ID = "local-owner"/);
assert.match(localProfileSource, /ActiveProfileProvider/);
assert.match(localProfileSource, /initialize_local_profile/);
assert.match(localProfileSource, /save_operator_baseline/);
assert.equal(
  localProfileSource.includes('source: "local-profile"'),
  false,
  "Desktop profile identity must come from the persistence adapter rather than a hard-coded stub",
);

const appSource = await readFile("desktop/src/App.tsx", "utf8");
assert.match(appSource, /localProfileProvider/);
assert.match(appSource, /invoke<string>\("open_data_folder"\)/);
assert.match(appSource, /Operator baseline/);
assert.match(appSource, /Recommendations and missions remain/);
assert.match(appSource, /No listening application server/);
assert.doesNotMatch(appSource, /generate.*lever/i);
assert.doesNotMatch(appSource, /generate.*mission/i);

const errorBoundarySource = await readFile(
  "desktop/src/components/ErrorBoundary.tsx",
  "utf8",
);
assert.match(errorBoundarySource, /componentDidCatch/);
assert.match(errorBoundarySource, /Reload desktop shell/);

const rustSource = await readFile("desktop/src-tauri/src/lib.rs", "utf8");
assert.match(rustSource, /fn open_data_folder/);
assert.match(rustSource, /app_data_dir/);
assert.match(rustSource, /create_dir_all/);
assert.match(rustSource, /to_string_lossy\(\)\.into_owned\(\)/);
assert.match(rustSource, /tauri_plugin_opener/);

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(target)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(target);
    }
  }

  return files;
};

const forbiddenRuntimeMarkers = [
  "fetch(",
  "XMLHttpRequest",
  "WebSocket(",
  "createServer(",
  ".listen(",
];

for (const file of await collectSourceFiles("desktop/src")) {
  const source = await readFile(file, "utf8");

  for (const forbidden of forbiddenRuntimeMarkers) {
    assert.equal(
      source.includes(forbidden),
      false,
      `${file} must not introduce a network or listening-server runtime`,
    );
  }

  assert.equal(
    source.includes("http://localhost"),
    false,
    `${file} must not depend on a localhost runtime`,
  );
}

console.log("PASS: Tauri desktop shell and local operator baseline boundary verified.");
