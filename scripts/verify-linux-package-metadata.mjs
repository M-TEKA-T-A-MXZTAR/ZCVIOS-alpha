import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const baseConfigPath = "desktop/src-tauri/tauri.conf.json";
const linuxConfigPath = "desktop/src-tauri/tauri.linux.conf.json";
const iconPath = "desktop/src-tauri/icons/icon.png";
const licensePath = "LICENSE";

for (const file of [baseConfigPath, linuxConfigPath, iconPath, licensePath]) {
  await access(file);
}

const baseConfig = JSON.parse(await readFile(baseConfigPath, "utf8"));
const linuxConfigText = await readFile(linuxConfigPath, "utf8");
const linuxConfig = JSON.parse(linuxConfigText);

assert.equal(
  baseConfig.bundle.active,
  false,
  "Branding metadata must not enable installer generation in this milestone",
);
assert.equal(linuxConfig.mainBinaryName, "zcvios-desktop");
assert.equal(linuxConfig.app.enableGTKAppId, true);
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
assert.equal(
  Object.hasOwn(linuxConfig.bundle, "active"),
  false,
  "Linux metadata must inherit the disabled bundle gate from the base configuration",
);

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

const workflow = await readFile(".github/workflows/desktop-ci.yml", "utf8");
assert.match(workflow, /verify-linux-package-metadata\.mjs/);
assert.equal(
  workflow.includes("tauri build --bundles"),
  false,
  "Installer generation belongs to the next controlled milestone",
);

console.log("PASS: Linux branding and package metadata verified.");
