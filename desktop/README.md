# ZCVIOS Desktop

This directory contains the controlled desktop migration built with Tauri 2, React, TypeScript and Vite.

## Current M7.2 scope

- branded native window
- working Dashboard/System navigation
- versioned local SQLite database at the native application-data location
- durable `local-owner` profile and migration-history ledger
- Linux GTK application identity based on `nz.co.mxztar.zcvios`
- stable `zcvios-desktop` executable name
- ZCVIOS launcher icon and Productivity category metadata
- bounded Debian and AppImage test-package generation
- generated launcher, binary, icon and package-field inspection
- packaged restart and data-preservation smoke tests
- no business workflow records yet
- no hidden application server in production

The SQLite adapter remains implemented in Rust with bundled SQLite. Linux packaging is isolated in `src-tauri/tauri.linux.conf.json`; the cross-platform base configuration remains explicitly non-bundling.

## Desktop database

The native bootstrap creates:

```text
<application data directory>/zcvios.sqlite3
```

Schema version 1 contains only:

- `migration_history`
- `local_profiles`
- `application_settings`

Work logs, revenue, plans, missions and reports remain disconnected until their controlled vertical milestones.

## Linux package identity

The test-package identity is:

- Product: `ZCVIOS Desktop`
- Identifier and GTK app ID: `nz.co.mxztar.zcvios`
- Executable: `zcvios-desktop`
- Publisher: `MXZTAR`
- Category: `Productivity`
- License: `MIT`
- Homepage: the ZCVIOS GitHub repository
- Test formats: Debian package and AppImage

The package workflow runs on Ubuntu 22.04 only when package-related files change or when manually dispatched. It has read-only repository permissions, performs no signing, and publishes no GitHub release. Its compressed test artifact expires after three days.

## Package verification

The package job:

1. builds one `.deb` and one AppImage
2. inspects Debian control fields and generated desktop entries
3. extracts and inspects the AppImage payload
4. launches the AppImage twice against an isolated data directory
5. extracts the Debian payload, launches it, removes the extracted application files, then extracts and launches it again
6. verifies that the `local-owner` profile and schema-v1 migration ledger survive those replacement cycles
7. uploads a short-lived archive plus SHA-256 checksum

A real local Ubuntu menu inspection and a user-driven package installation remain required before the M7 rows can be marked Verified.

## Ubuntu development prerequisites

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

Install the current stable Rust toolchain before running the application.

## Run locally

```bash
cd desktop
npm install
npm run tauri:dev
```

Vite is used only as the development frontend server. Production builds load static files from `desktop/dist` inside the native Tauri window.

## Verify the desktop foundation

```bash
cargo test --manifest-path desktop/src-tauri/Cargo.toml
node scripts/verify-desktop-persistence.mjs
node scripts/verify-linux-package-metadata.mjs
```

## Build and inspect Linux test packages

```bash
npm run tauri:build --prefix desktop -- --bundles deb,appimage
node scripts/verify-linux-package-artifacts.mjs
bash scripts/test-linux-package-persistence.sh
```

These commands create local test artifacts only. They do not sign or publish a release.
