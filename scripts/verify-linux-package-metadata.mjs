import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const baseConfigPath = "desktop/src-tauri/tauri.conf.json";
const linuxConfigPath = "desktop/src-tauri/tauri.linux.conf.json";
const iconPath = "desktop/src-tauri/icons/icon.png";
const licensePath = "LICENSE";
const packageWorkflowPath = ".github/workflows/desktop-package-ci.yml";
const artifactVerifierPath = "scripts/verify-linux-package-artifacts.mjs";
const persistenceVerifierPath = "scripts/test-linux-package-persistence.sh";

for (const file of [
  baseConfigPath,
  linuxConfigPath,
  iconPath,
  licensePath,
  packageWorkflowPath,
  artifactVerifierPath,
  persistenceVerifierPath,
]) {
  await access(file);
}

const baseConfig = JSON.parse(await readFile(baseConfigPath, "utf8"));
const linuxConfigText = await readFile(linuxConfigPath, "utf8");
const linuxConfig = JSON.parse(linuxConfigText);

assert.equal(
  baseConfig.bundle.active,
  false,
  "Non-Linux builds must retain the explicit no-bundle default",
);
assert.equal(linuxConfig.mainBinaryName, "zcvios-desktop");
assert.equal(linuxConfig.app.enableGTKAppId, true);
assert.equal(linuxConfig.bundle.active, true);
assert.equal(linuxConfig.bundle.useLocalToolsDir, true);
assert.deepEqual(linuxConfig.bundle.targets, ["deb", "appimage"]);
assert.equal(linuxConfig.bundle.category, "Productivity");
assert.equal(linuxConfig.bundle.publisher, "MXZTAR");
assert.equal(
  linuxConfig.bundle.homepage,
  "https://github.com/M-TEKA-T-A-MXZTAR/ZCVIOS-alpha",
);
assert.equal(linuxConfig.bundle.license, "MIT");
assert.equal(linuxConfig.bundle.licenseFile, "../../LICENSE");
assert.equal(linuxConfig.bundle.shortDescription.length > 10, true);
assert.equal(linuxConfig.bundle.longDescription.length > 40, true);
assert.deepEqual(linuxConfig.bundle.icon, ["icons/icon.png"]);
assert.equal(linuxConfig.bundle.linux.appimage.bundleMediaFramework, false);
assert.deepEqual(linuxConfig.bundle.linux.deb.files, {});
assert.deepEqual(linuxConfig.bundle.linux.appimage.files, {});

for (const marker of ["privateKey", "password", "SIGN_KEY"]) {
  assert.equal(
    linuxConfigText.includes(marker),
    false,
    `Linux package metadata must not contain signing secret marker ${marker}`,
  );
}

const icon = await readFile(iconPath);
assert.deepEqual(
  [...icon.subarray(0, 8)],
  [137, 80, 78, 71, 13, 10, 26, 10],
  "Launcher icon must be a PNG file",
);
assert.equal(icon.readUInt32BE(16), 128, "Launcher icon width must be 128 pixels");
assert.equal(icon.readUInt32BE(20), 128, "Launcher icon height must be 128 pixels");

const license = await readFile(licensePath, "utf8");
assert.match(license, /MIT License/);

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
assert.equal(
  packageJson.scripts["verify:linux-package-metadata"],
  "node scripts/verify-linux-package-metadata.mjs",
);
assert.match(packageJson.scripts["test:core"], /verify:linux-package-metadata/);

const desktopWorkflow = await readFile(".github/workflows/desktop-ci.yml", "utf8");
assert.match(desktopWorkflow, /verify-linux-package-metadata\.mjs/);
assert.equal(
  desktopWorkflow.includes("--bundles deb,appimage"),
  false,
  "Routine desktop smoke CI must not rebuild installer artifacts",
);

const packageWorkflow = await readFile(packageWorkflowPath, "utf8");
assert.match(packageWorkflow, /pull_request:/);
assert.match(packageWorkflow, /workflow_dispatch:/);
assert.match(packageWorkflow, /runs-on: ubuntu-22\.04/);
assert.match(packageWorkflow, /--bundles deb,appimage/);
assert.match(packageWorkflow, /verify-linux-package-artifacts\.mjs/);
assert.match(packageWorkflow, /test-linux-package-persistence\.sh/);
assert.match(packageWorkflow, /dpkg-deb/);
assert.match(packageWorkflow, /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/);
assert.match(packageWorkflow, /retention-days: 3/);
assert.match(
  packageWorkflow,
  /\bcontents\s*:\s*read\b/,
  "Package workflow must declare contents: read",
);
assert.doesNotMatch(
  packageWorkflow,
  /^\s*[\w-]+\s*:\s*write\s*$/m,
  "Package workflow must not grant write permissions to any scope",
);

function workflowEventPresent(yaml, event) {
  const escapedEvent = event.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Block-mapping form:  on:\n  event:
  if (new RegExp(`^on:\\s*\\n(?:[ \\t]+[^\\n]*\\n)*[ \\t]+${escapedEvent}\\s*:`, "m").test(yaml)) return true;
  // Direct top-level key form:  event:
  if (new RegExp(`^${escapedEvent}\\s*:`, "m").test(yaml)) return true;
  // Flow-sequence form:  on: [event]
  if (new RegExp(`\\bon\\s*:\\s*\\[[^\\]]*\\b${escapedEvent}\\b`).test(yaml)) return true;
  // Flow-mapping form:  on: { event: {} }
  if (new RegExp(`\\bon\\s*:\\s*\\{(?:[^{}]|\\{[^}]*\\})*\\b${escapedEvent}\\s*:`).test(yaml)) return true;
  return false;
}

{
  const blockForm = "on:\n  push:\n    branches: [main]\n";
  assert.equal(workflowEventPresent(blockForm, "push"), true, "event detector: block form push");
  assert.equal(workflowEventPresent(blockForm, "release"), false, "event detector: block form no release");
  const flowSeqForm = "on: [pull_request, push]\n";
  assert.equal(workflowEventPresent(flowSeqForm, "push"), true, "event detector: flow-seq push");
  assert.equal(workflowEventPresent(flowSeqForm, "release"), false, "event detector: flow-seq no release");
  const flowMapForm = "on: { pull_request: {}, push: {} }\n";
  assert.equal(workflowEventPresent(flowMapForm, "push"), true, "event detector: flow-map push");
  assert.equal(workflowEventPresent(flowMapForm, "release"), false, "event detector: flow-map no release");
  const releaseBlockForm = "on:\n  release:\n    types: [published]\n";
  assert.equal(workflowEventPresent(releaseBlockForm, "release"), true, "event detector: block form release");
  assert.equal(workflowEventPresent(releaseBlockForm, "push"), false, "event detector: block form no push");
}

for (const event of ["push", "release"]) {
  assert.equal(
    workflowEventPresent(packageWorkflow, event),
    false,
    `Package smoke workflow must not contain ${event} trigger`,
  );
}
for (const forbidden of [
  "contents: write",
  "id-token: write",
  "gh release",
  "action-gh-release",
  "APPIMAGETOOL_SIGN_PASSPHRASE",
]) {
  assert.equal(
    packageWorkflow.includes(forbidden),
    false,
    `Package smoke workflow must not contain publication or signing marker ${forbidden}`,
  );
}

const artifactVerifier = await readFile(artifactVerifierPath, "utf8");
assert.match(artifactVerifier, /dpkg-deb/);
assert.match(artifactVerifier, /--appimage-extract/);
assert.match(artifactVerifier, /package-verification\.json/);

const persistenceVerifier = await readFile(persistenceVerifierPath, "utf8");
assert.match(persistenceVerifier, /APPIMAGE_EXTRACT_AND_RUN/);
assert.match(persistenceVerifier, /dpkg-deb --extract/);
assert.match(persistenceVerifier, /Debian Persistence Test/);
assert.match(persistenceVerifier, /AppImage Persistence Test/);

console.log("PASS: Linux test-package configuration and safety boundaries verified.");
