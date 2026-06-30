# ZCVIOS Desktop Shell

This directory contains the M5 desktop-shell milestone: Tauri 2, React, TypeScript and Vite.

## Current scope

- branded native window
- working Dashboard/System navigation
- empty dashboard state
- active local-profile provider stub
- desktop error boundary
- status footer
- explicit Open Data Folder action
- no business database or business-data writes
- no hidden application server in production

## Ubuntu development prerequisites

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

Install the current stable Rust toolchain before running the shell.

## Run locally

```bash
cd desktop
npm install
npm run tauri:dev
```

Vite is used only as the development frontend server. Production builds load static files from `desktop/dist` inside the native Tauri window.

## Build the frontend only

```bash
cd desktop
npm install
npm run build
```

SQLite persistence and real local-profile onboarding belong to M6 and are deliberately absent here.
