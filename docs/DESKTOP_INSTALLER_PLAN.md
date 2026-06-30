# ZCVIOS Desktop Installer and Release Plan

**Status:** Required desktop workstream  
**Last updated:** 2026-06-30

## Purpose

Define the packaging, installation, upgrade, removal, and release requirements for the ZCVIOS desktop edition.

The installer is part of the desktop product architecture. It is not a final cosmetic task.

## Initial supported platform

Primary target:

- 64-bit Ubuntu-compatible Linux on `amd64`

Initial package formats:

1. **Debian package (`.deb`)** — primary installed edition
2. **AppImage** — portable Linux fallback and test artifact

Windows, macOS, Snap, Flatpak, RPM, ARM, and automatic update delivery are outside the first desktop alpha milestone.

## Proposed application identity

```text
Product name: ZCVIOS
Publisher: MXZTAR
Application identifier: nz.co.mxztar.zcvios
Executable name: zcvios
Desktop category: Office;Utility;
Initial desktop version target: 1.2.0-alpha
```

The final identifier must remain stable after the first installer release because desktop settings, application-data paths, and updater identity may depend on it.

## Required package outputs

Expected release artifacts:

```text
ZCVIOS_1.2.0-alpha_amd64.deb
ZCVIOS_1.2.0-alpha_amd64.AppImage
SHA256SUMS
RELEASE_NOTES_1.2.0-alpha.md
```

Exact filenames may be normalized by the Tauri bundler, but release documentation must show the actual generated names.

## Proposed desktop project layout

```text
desktop/
├── src/
├── package.json
├── vite.config.ts
├── packaging/
│   ├── README.md
│   ├── release-checklist.md
│   ├── verify-deb.sh
│   └── verify-appimage.sh
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── capabilities/
    ├── icons/
    └── src/
```

This layout is planned only. It must not be created until the bounded Tauri-shell milestone begins.

## Debian package requirements

The `.deb` installer must:

- install the ZCVIOS executable and required resources
- add a correct application-menu launcher
- install the branded icon at suitable Linux resolutions
- declare runtime dependencies generated or required by the Tauri Linux bundle
- expose product name, version, identifier, and publisher consistently
- launch without a terminal window
- use the operating system's application-data directory
- preserve user data during package upgrade
- retain user data during ordinary package removal
- support normal package-manager installation and removal

Reference installation command for local testing:

```bash
sudo apt install ./ZCVIOS_1.2.0-alpha_amd64.deb
```

The actual generated filename must be used during verification.

## AppImage requirements

The AppImage must:

- be executable after permission is granted
- launch without installation
- use the same documented user-data location as the installed edition
- display the same product name and icon
- not write application data beside the AppImage
- coexist safely with a `.deb` installation using the same schema/version rules

Reference local test:

```bash
chmod +x ZCVIOS_1.2.0-alpha_amd64.AppImage
./ZCVIOS_1.2.0-alpha_amd64.AppImage
```

## Branding assets

Before the first package build, provide source-controlled application icons suitable for the Tauri bundler and Linux desktop environments.

Requirements:

- square master artwork
- transparent background where appropriate
- clear recognition at small launcher sizes
- no external font-file dependency in the repository
- no unlicensed third-party artwork
- consistent MXZTAR/ZCVIOS identity

The packaging PR must verify that the icon appears correctly in:

- the Ubuntu application menu
- the running window
- package metadata where displayed
- file-manager presentation where supported

## Build scripts

The desktop project should expose stable repository scripts rather than requiring contributors to remember raw commands.

Planned commands:

```bash
npm run desktop:dev
npm run desktop:build
npm run desktop:bundle:deb
npm run desktop:bundle:appimage
npm run desktop:verify
```

The exact implementation will be defined when the Tauri shell is added.

## Version control

The following versions must agree before release:

- root package/release version where retained
- desktop frontend package version
- Tauri configuration version
- Rust crate version where applicable
- installer filename/version metadata
- release notes
- Git tag

A release must stop when versions disagree.

## Installer lifecycle tests

### Clean install

- install on a clean supported Ubuntu user account
- confirm package-manager success
- confirm application-menu entry
- confirm icon and product name
- launch without opening a browser
- confirm no listening application port is required
- complete local onboarding
- close and reopen the application
- confirm data persistence

### Upgrade

- install an earlier test package
- create representative user records
- install the newer package over it
- confirm application version changed
- confirm database and exports remain intact
- run any schema migration
- confirm all representative records remain readable

### Removal and reinstall

- remove the package normally
- confirm executable and launcher are removed
- confirm user data remains
- reinstall the same or newer package
- confirm existing data is discovered safely

### AppImage

- run from a user-owned directory
- create and reload data
- move the AppImage and launch again
- confirm user data is not tied to the AppImage location
- verify behaviour when a `.deb` edition is also installed

### Failure handling

- insufficient disk space
- unwritable export destination
- unavailable runtime dependency
- corrupt or unsupported database
- interrupted migration
- missing icon/resource

Each failure must be visible and must not silently destroy data.

## Release evidence

A desktop installer release requires:

- source commit SHA
- successful desktop build
- successful `.deb` package creation
- successful AppImage creation
- SHA-256 checksums
- clean-install result
- upgrade-preservation result
- uninstall/reinstall result
- application-menu screenshot or equivalent manual evidence
- database schema/version evidence
- release notes
- known limitations

## Signing and updater policy

Package signing and automatic updates are deferred until repeatable manual packaging and data-preserving upgrades are proven.

Correct order:

```text
working desktop application
-> repeatable local packages
-> clean-install verification
-> upgrade and rollback verification
-> checksums and signed release artifacts
-> optional signed automatic updater
```

No automatic updater should be introduced before:

- signing keys have an explicit ownership and backup policy
- update metadata has a controlled hosting location
- failed update recovery is tested
- application data remains independent of installed binaries

## Packaging security rules

Release artifacts must not contain:

- `.env` files
- API keys
- development database contents
- personal user data
- test credentials
- local absolute paths
- build-machine secrets

The release checklist must inspect bundle contents before publication.

## Installer milestone definition of done

The installer milestone is complete when:

1. `.deb` and AppImage are reproducibly generated from a documented commit.
2. ZCVIOS appears correctly in the Ubuntu application menu.
3. Launching opens a desktop window and no browser.
4. Deterministic workflows operate offline.
5. Data survives restart and package upgrade.
6. Normal uninstall retains user-owned data.
7. Explicit in-app deletion removes only the confirmed ZCVIOS data scope.
8. Checksums and release notes accompany the artifacts.
9. No secrets or development data are present in the bundles.
10. The parity matrix records the installer rows as verified.
