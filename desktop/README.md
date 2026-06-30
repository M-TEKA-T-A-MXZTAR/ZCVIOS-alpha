# ZCVIOS Desktop

This directory contains the controlled desktop migration built with Tauri 2, React, TypeScript and Vite.

## Current M6 scope

- branded native window
- working Dashboard/System navigation
- versioned local SQLite database at the native application-data location
- migration-history ledger
- durable `local-owner` profile and active-profile setting
- reopen test proving profile changes survive a database restart
- desktop error boundary and recoverable persistence startup error
- explicit Open Data Folder action
- no business workflow records yet
- no hidden application server in production

The SQLite adapter is implemented in Rust with `rusqlite` and bundled SQLite. The frontend receives typed Tauri command results and contains no raw SQL.

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

## Verify persistence

```bash
cargo test --manifest-path desktop/src-tauri/Cargo.toml
node scripts/verify-desktop-persistence.mjs
```

## Build the frontend only

```bash
cd desktop
npm install
npm run build
```

Installer packaging belongs to M7 and is deliberately absent here.
