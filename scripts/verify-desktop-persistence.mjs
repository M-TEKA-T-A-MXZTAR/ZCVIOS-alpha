import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "desktop/src-tauri/src/persistence.rs",
  "desktop/src/adapters/local-profile-provider.ts",
];

for (const file of requiredFiles) {
  await access(file);
}

const cargoManifest = await readFile("desktop/src-tauri/Cargo.toml", "utf8");
assert.match(cargoManifest, /rusqlite = \{ version = "=0\.40\.1", features = \["bundled"\] \}/);
assert.match(cargoManifest, /serde = \{ version = "=1\.0\.228", features = \["derive"\] \}/);

const persistenceSource = await readFile("desktop/src-tauri/src/persistence.rs", "utf8");
for (const expected of [
  "zcvios.sqlite3",
  "migration_history",
  "local_profiles",
  "application_settings",
  "active_profile_id",
  "profile_changes_survive_database_reopen",
]) {
  assert.equal(
    persistenceSource.includes(expected),
    true,
    `Desktop persistence source must include ${expected}`,
  );
}
assert.match(persistenceSource, /transaction\(\)/);
assert.match(persistenceSource, /INSERT OR IGNORE INTO local_profiles/);
assert.match(persistenceSource, /CURRENT_SCHEMA_VERSION: i64 = 1/);

const rustEntry = await readFile("desktop/src-tauri/src/lib.rs", "utf8");
assert.match(rustEntry, /mod persistence/);
assert.match(rustEntry, /fn initialize_local_profile/);
assert.match(rustEntry, /bootstrap_database/);
assert.match(rustEntry, /generate_handler!\[/);

const providerSource = await readFile(
  "desktop/src/adapters/local-profile-provider.ts",
  "utf8",
);
assert.match(providerSource, /invoke<DesktopBootstrapStatus>\("initialize_local_profile"\)/);
assert.match(providerSource, /schemaVersion: number/);
assert.match(providerSource, /migrationCount: number/);

const appSource = await readFile("desktop/src/App.tsx", "utf8");
assert.match(appSource, /localProfileProvider\.initialize\(\)/);
assert.match(appSource, /Retry persistence/);
assert.match(appSource, /Migration history/);
assert.match(appSource, /zcvios\.sqlite3/);
assert.match(appSource, /No business data is written/);

for (const frontendFile of [
  "desktop/src/App.tsx",
  "desktop/src/adapters/local-profile-provider.ts",
]) {
  const source = await readFile(frontendFile, "utf8");
  for (const sqlMarker of ["CREATE TABLE", "SELECT ", "INSERT INTO", "UPDATE local_profiles"]) {
    assert.equal(
      source.includes(sqlMarker),
      false,
      `${frontendFile} must not contain raw SQL; persistence stays in the Rust adapter`,
    );
  }
}

const workflow = await readFile(".github/workflows/desktop-ci.yml", "utf8");
assert.match(workflow, /Test desktop persistence/);
assert.match(workflow, /cargo test --quiet --manifest-path desktop\/src-tauri\/Cargo\.toml/);
assert.match(workflow, /verify-desktop-persistence\.mjs/);

console.log("PASS: desktop SQLite persistence boundary verified.");
