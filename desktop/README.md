# ZCVIOS Desktop

This directory contains the controlled desktop migration built with Tauri 2, React, TypeScript and Vite.

## Current M7.1 scope

- branded native window
- working Dashboard/System navigation
- versioned local SQLite database at the native application-data location
- durable `local-owner` profile and migration-history ledger
- Linux GTK application identity based on `nz.co.mxztar.zcvios`
- stable `zcvios-desktop` executable name
- ZCVIOS launcher icon and Productivity category metadata
- Debian and AppImage targets declared but not generated
- no business workflow records yet
- no hidden application server in production

The SQLite adapter remains implemented in Rust with bundled SQLite. Linux packaging metadata is isolated in `src-tauri/tauri.linux.conf.json`; the base configuration keeps bundling disabled.

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

The staged package identity is:

- Product: `ZCVIOS Desktop`
- Identifier and GTK app ID: `nz.co.mxztar.zcvios`
- Executable: `zcvios-desktop`
- Publisher: `MXZTAR`
- Category: `Productivity`
- License: `MIT`
- Homepage: the ZCVIOS GitHub repository
- Planned formats: Debian package and AppImage

This milestone does not create, upload, sign or install package artifacts. The following packaging mini-job will build test artifacts on an older supported Linux baseline and inspect their launcher metadata and data-preservation behaviour.

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

## Build the frontend only

```bash
cd desktop
npm install
npm run build
```

Installer generation remains deliberately deferred to the next bounded M7 mini-job.
