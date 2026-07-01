# ZCVIOS Toolchain Compatibility Policy

**Status:** Active partial policy  
**Established:** 2026-07-02  
**Audit target:** AUD-018

## Purpose

ZCVIOS uses separate browser and desktop build systems, but shared runtime contracts must not depend on accidental version differences. Supported toolchain versions are declared explicitly and verified in CI.

## Shared JavaScript runtime

The current shared baseline is:

- Node.js `22.18.0` in root, desktop-shell, and Linux-package CI
- local Node range `>=22.18.0 <23`
- npm major range `>=10 <11`
- `.nvmrc` pinned to `22.18.0`

Node 20 is no longer an accepted project baseline because the resolved root development graph includes packages whose declared engine baseline begins at Node 22.18.0.

## Shared React contract

The root browser application and desktop React shell both declare exact versions:

- `react`: `19.2.3`
- `react-dom`: `19.2.3`

Shared React contracts must not rely on different patch versions between the two runtimes.

## Build-system differences

The browser and desktop runtimes remain separate delivery systems:

- root: Next.js and the root TypeScript toolchain
- desktop: Vite, Tauri, Rust, and the desktop TypeScript toolchain

Their TypeScript compiler versions are not required to be identical in this bounded slice. Shared TypeScript contracts must continue to compile through both root and desktop verification. A future version change must be deliberate and supported by both affected workflows.

## Package installation policy

The root application already uses `npm ci` with `package-lock.json`.

Desktop workflows currently continue to use `npm install --prefix desktop --ignore-scripts` because no reviewed desktop lockfile is committed yet. Introducing `desktop/package-lock.json` and changing desktop workflows to `npm ci` remain part of the final AUD-018 follow-up and must be reviewed together.

## Prisma boundary still open

The current root manifest declares Prisma client/adapter packages from the 7.4 line while the Prisma CLI resolves from the 7.8 line. This PR does not claim that mismatch is resolved.

The final AUD-018 slice must:

1. choose one exact Prisma version for CLI, client, and adapter
2. regenerate and review the root lockfile
3. verify generate, migrate, seed, build, and integration tests
4. introduce and verify the desktop lockfile if still absent
5. mark AUD-018 resolved only after those checks pass

## Verification

Run:

```bash
npm run verify:toolchain-policy
```

The verifier checks the shared Node version and engine ranges, `.nvmrc`, exact root/desktop React declarations, root lock metadata for React, and Node versions in all three affected workflows.

## Change control

Toolchain changes must remain separate from business-rule, route, report, export, AI, and desktop-feature work. Do not broaden a dependency-alignment PR to opportunistic package upgrades.
