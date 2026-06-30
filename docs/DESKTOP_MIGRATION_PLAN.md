# ZCVIOS Desktop Migration Plan

**Status:** Approved foundation plan  
**Date established:** 2026-06-30  
**Migration branch:** `feat/desktop-migration-foundation`

## Purpose

Convert ZCVIOS-alpha from a browser-delivered Next.js application into an installable, local-first desktop application without discarding the working creator-planning engine or attempting a risky one-step rewrite.

The desktop migration must preserve the core operating loop:

> One lever per week. One mission per day. Measured against useful progress.

## Architectural decision

The desktop edition will use:

- **Tauri 2** for the desktop shell and Linux packaging
- **React and TypeScript** for the user interface
- **Vite** for the desktop frontend build
- **SQLite** for local application data
- **Pure TypeScript core modules** for lever selection, mission generation, reporting, and progress calculations
- **Repository interfaces** between application services and persistence adapters

The current Next.js application remains operational during migration. It will be retired only after the desktop edition reaches verified feature parity and data migration is proven.

## Non-goals for the foundation stage

This first stage does not:

- add Tauri dependencies
- move the current source tree
- alter the Prisma schema
- change authentication behaviour
- change the working browser interface
- retire Next.js
- add automatic updates
- publish a production installer

## Target runtime

The completed desktop edition must:

- launch from the Ubuntu application menu
- open in its own desktop window
- operate without opening a browser
- require no public or localhost web server
- work offline for deterministic core workflows
- keep user data in a documented local application-data directory
- preserve user data across application upgrades
- expose clear export, backup, and deletion controls
- keep optional AI separate from deterministic operation

## Target architecture

```text
Desktop UI
  -> application use cases
    -> domain/core engine
    -> repository contracts
      -> desktop SQLite adapters
      -> temporary Prisma adapters while browser compatibility remains
```

The UI must not contain business calculations or raw SQL. Core modules must not import React, Next.js, NextAuth, Prisma, browser APIs, or Tauri APIs.

## Controlled migration sequence

### M0: Foundation documentation

Deliverables:

- desktop migration plan
- desktop feature-parity matrix
- desktop data-ownership plan
- desktop installer and release plan
- roadmap link to these documents

Gate:

- no runtime or dependency changes
- current browser application remains unchanged

### M1: Extract deterministic core logic

Move lever selection, mission generation, progress calculations, and report calculations into pure TypeScript modules.

Gate:

- existing Next.js routes call the extracted modules
- deterministic tests pass without starting Next.js
- browser behaviour remains unchanged

### M2: Introduce application services

Create explicit use cases such as:

- get dashboard state
- save work log
- save revenue
- calculate weekly plan
- generate daily mission
- build weekly report
- export user data

Gate:

- pages and route handlers no longer own business rules

### M3: Introduce repository contracts

Define persistence interfaces for users, work logs, revenue, missions, plans, reports, settings, and pause windows.

Gate:

- Prisma is one adapter rather than a dependency of core logic

### M4: Introduce local desktop identity

Replace web-session assumptions with an explicit active local profile for the desktop edition.

Gate:

- application services operate from a supplied profile identifier
- NextAuth remains available only to the browser edition during coexistence

### M5: Add the Tauri desktop shell

Create a minimal desktop application containing:

- branded window
- navigation shell
- empty dashboard route
- error boundary
- status footer
- open-data-folder action
- clean startup and exit handling

Gate:

- the application opens as a desktop window
- no browser is launched
- no business data is written yet

### M6: Add desktop SQLite persistence

Implement desktop repository adapters and versioned migrations.

Gate:

- a local profile can be created
- data survives restart
- migration history is recorded

### M7: Produce test installers

Generate:

- Debian package as the primary Ubuntu installer
- AppImage as the portable Linux fallback

Gate:

- clean install, launch, upgrade, uninstall, and reinstall tests pass
- user-created data is not silently removed

### M8: Migrate complete vertical workflows

Migration order:

1. onboarding and local profile
2. read-only dashboard
3. work logging
4. revenue entry
5. weekly lever selection
6. daily mission generation
7. weekly and monthly reports
8. exports, backups, and deletion
9. optional AI assistance

Each workflow must be fully connected before the next begins.

### M9: Desktop parity audit

Gate:

- every required row in `DESKTOP_FEATURE_PARITY_MATRIX.md` is verified
- browser and desktop calculations produce equivalent results for shared fixtures
- import from the browser database is proven or clearly documented

### M10: Browser retirement decision

The browser runtime may be retired only after:

- desktop parity is complete
- installer upgrades preserve data
- rollback instructions exist
- export and deletion are verified
- no critical workflow depends on Next.js or NextAuth

## Proposed PR sequence

1. `docs: define desktop migration foundation`
2. `refactor: extract progress and lever engine`
3. `refactor: extract mission and report engine`
4. `refactor: add application services and repository contracts`
5. `refactor: support explicit local profile identity`
6. `desktop: add Tauri React shell`
7. `desktop: add SQLite persistence and migrations`
8. `desktop: add Linux branding and package metadata`
9. `desktop: generate deb and AppImage test packages`
10. `desktop: migrate dashboard and work logging`
11. `desktop: migrate revenue and weekly planning`
12. `desktop: migrate missions and reports`
13. `desktop: add export backup and deletion`
14. `release: complete installer and parity audit`

## Universal acceptance rules

Every desktop workflow must satisfy all of the following:

1. Works without internet access when using deterministic mode.
2. Persists data across application restart.
3. Contains no dead controls.
4. Displays validation errors and recoverable failures.
5. Does not freeze during long operations.
6. Makes the data location inspectable.
7. Does not open a browser.
8. Does not require a listening network port.
9. Has deterministic tests for core calculations.
10. Preserves export and deletion capability.
11. Avoids guaranteed-income or predictive-income claims.
12. Keeps user review and control over recommendations.

## Baseline verification

Before each implementation branch, record the current result of:

```bash
npm ci
npm run prisma:generate
npm run lint
npm run build
npm run test
```

The foundation branch is documentation-only. Runtime verification must be performed in the local repository or CI before merge; the GitHub connector used to author these documents does not execute the project.

## Stop conditions

Stop and repair the current increment before proceeding when:

- existing browser behaviour regresses
- data migration is not reversible
- a UI control lacks a complete workflow
- the desktop shell requires a hidden localhost server
- core logic imports a delivery framework
- an installer upgrade overwrites user data
- deterministic mode becomes dependent on AI or an external service
