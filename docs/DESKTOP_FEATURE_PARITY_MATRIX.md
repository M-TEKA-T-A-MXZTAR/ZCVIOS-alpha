# ZCVIOS Desktop Feature-Parity Matrix

**Status:** Migration control document  
**Last updated:** 2026-07-01

## Purpose

This matrix prevents the desktop conversion from quietly dropping working ZCVIOS capabilities. A browser feature is not considered migrated until its complete desktop workflow has been implemented, persisted, restarted, and verified.

## Status vocabulary

- **Browser working:** Present in the current Next.js application according to repository documentation and source structure.
- **Planned:** Defined for desktop migration but not implemented.
- **In progress:** Implementation exists on an active branch but has not passed the complete gate.
- **Verified:** Acceptance gate has passed locally or in CI with recorded evidence.
- **Deferred:** Intentionally excluded from the current desktop milestone with a documented reason.

## Core parity matrix

| Capability | Browser baseline | Desktop status | Planned slice | Desktop parity gate |
|---|---|---|---|---|
| Application launch | Runs through Next.js in a browser | In progress — native Tauri shell, frontend build and headless launch smoke test added; local Ubuntu launch still required | M5 | Opens as a branded desktop window without launching a browser or requiring a listening port |
| Registration | Email/password registration | Planned replacement — local-owner record exists without web registration | M4/M8 | Replaced by local profile onboarding; no web session required |
| Login and session | NextAuth email/password session behind an active-profile provider | In progress — durable SQLite local-owner profile and active-profile setting added; no desktop login required | M4/M6 | Active local profile is resolved on startup and survives restart |
| Onboarding | Authenticated onboarding page | In progress — editable operator/business name, focused capacity, weekly revenue baseline, primary channel and active offer added with validation and SQLite persistence | M8.1 | Profile and business settings validate, save, reload, and survive restart |
| Dashboard | Authenticated dashboard | In progress — operator baseline completion, capacity, baseline revenue, channel and active offer are shown; lever and mission remain disconnected | M8.2 | Displays current lever, mission, work time, revenue signal, progress signal, and next action from local data |
| Work logging | Work-session CRUD | Planned | M8.3 | Add, validate, display, restart, edit/delete where currently supported, and recalculate dashboard/report state |
| Revenue entry | Weekly revenue CRUD | Planned — M8.1 stores only the starting baseline in integer cents, not weekly history | M8.4 | Store integer cents, enforce week scope, reload after restart, and update reports |
| Weekly lever recommendation | Deterministic logic with optional AI assistance | Planned | M1/M8.5 | Shared fixtures return equivalent lever and explanation in browser and desktop adapters |
| Manual lever override | RPC-based override | Planned | M8.5 | Override, reason, persistence, report visibility, and restart verification work locally |
| Daily mission generation | Template and optional AI paths | Planned | M1/M8.6 | Template mission works offline; source is recorded; mission persists and reloads |
| Mission reset/regeneration | Existing mission route behaviour | Planned | M8.6 | Reset is explicit, scoped to the correct date/profile, auditable, and recoverable |
| Pause window | Persisted pause records | Planned | M8 | Pause state survives restart and is reflected consistently in mission/planning behaviour |
| Weekly report | Authenticated report page/API | Planned | M1/M8.7 | Report calculations match shared fixtures and render from desktop SQLite data |
| Monthly report | Authenticated report page/API | Planned | M1/M8.7 | Monthly aggregation matches shared fixtures and handles missing-data periods clearly |
| PDF export | Existing PDF generation dependencies | Planned | M8.8 | User selects destination, export succeeds, file opens, and failure is visible |
| User data export | Privacy control documented as operational | Planned | M8.8 | Export includes all owned records, schema/version metadata, and a clear destination |
| Account/data deletion | Privacy control documented as operational | Planned replacement | M8.8 | Local profile deletion explains scope, requires explicit confirmation, and verifies removal |
| Settings | Authenticated settings page | In progress — operator baseline values can be edited, reloaded and saved locally; broader privacy/export settings remain planned | M8.1/M8.8 | Settings persist locally, reload after restart, and do not expose secrets |
| Optional AI key/configuration | User-configured optional AI | Deferred until deterministic parity | M8.9 | AI can be disabled; unavailable AI falls back without blocking core operation |
| Public-page review | Under consideration/optional | Deferred | Post-parity | User-supplied public URL only, explicit action, rate limits, and no hidden account access |
| Error handling | Next.js error boundary and route errors | In progress — desktop render boundary, recoverable SQLite startup error, validation errors and retry control added | M5 onward | Desktop error boundary, visible failure state, logs, and safe recovery path |
| Data location visibility | Local SQLite through Prisma | In progress — `zcvios.sqlite3` path is displayed and the native data folder can be opened | M6 | Settings shows the application data path and provides an Open Data Folder action |
| Backup | Manual export-oriented baseline | Planned | M8.8 | User-initiated backup creates a dated copy without freezing the UI |
| Upgrade preservation | Not applicable to browser deployment | In progress — package payload replacement test preserves the SQLite profile and operator baseline; real version-to-version upgrade remains pending | M7 | Installing a newer package preserves database and user exports |
| Uninstall behaviour | Not applicable to browser deployment | In progress — CI removes the extracted Debian application payload and confirms the external profile and operator baseline remain intact; local package-manager test pending | M7 | Program removal does not silently delete user-created data |
| Ubuntu application menu | Not applicable | In progress — generated Debian launcher, executable and icon are inspected; local Ubuntu menu confirmation pending | M7 | `.deb` install creates a correct launcher, icon, name, category, and executable entry |
| Portable Linux launch | Not applicable | In progress — AppImage is generated, extracted, inspected and launched twice on Ubuntu 22.04 with persistent profile and operator baseline data; local supported-machine launch pending | M7 | AppImage launches on the supported baseline and uses the same documented data location |
| Windows packaging | Not applicable | Planned — platform-neutral core is required now; unsigned Windows test build belongs to a separate portability slice | M7.3 | Unsigned test package launches, uses the native data path, and preserves the same schema without Linux-only assumptions |
| macOS packaging | Not applicable | Planned — platform-neutral core is required now; unsigned macOS test build belongs to a separate portability slice | M7.3 | Unsigned test app launches, uses the native data path, and preserves the same schema without Linux-only assumptions |

## Data-model coverage

The desktop persistence layer must cover every currently relevant model before parity is declared:

| Model/domain record | Desktop repository contract | Desktop SQLite adapter | Migration/import verified |
|---|---:|---:|---:|
| User / local profile | In progress — active-profile contract, durable local-owner provider and editable display name established | In progress — create/load/update/reopen tests added | Planned |
| OperatorBaseline | In progress — focused capacity, baseline revenue, primary channel and active offer contract added | In progress — schema-v2 table, transaction, validation and reopen tests added | Not applicable |
| WeeklyRevenue | Planned | Planned | Planned |
| WeeklyPlan | Planned | Planned | Planned |
| WorkLogSession | Planned | Planned | Planned |
| FreedomDefinition | Planned | Planned | Planned |
| DailyMission | Planned | Planned | Planned |
| PauseWindow | Planned | Planned | Planned |
| ApplicationSettings | In progress — active profile setting defined | In progress — SQLite table and bootstrap adapter added | Not applicable |
| SchemaVersion | In progress — schema version exposed by bootstrap status | In progress — migration ledger maximum enforced through schema v2 | Not applicable |
| MigrationHistory | In progress — versioned migration runner defined | In progress — transactionally recorded in SQLite | Not applicable |

## Verification evidence required per row

A row may be changed to **Verified** only when the relevant PR or verification record includes:

1. implementation commit
2. focused automated tests
3. relevant regression tests
4. lint/build result
5. manual desktop workflow result
6. restart/persistence result where data is involved
7. error-path result
8. data-location or export evidence where applicable
9. installer evidence where packaging is involved
10. final diff review confirming no unrelated scope

## Parity exclusions

The following are not required before the first desktop alpha installer:

- automatic updater
- signed or publicly distributed Windows/macOS packages
- multi-user team support
- mobile interface
- public-page review
- new AI providers
- broad redesign of the visual language
- new revenue or strategy features unrelated to migration

Windows and macOS remain planned supported platforms; only their signed public-distribution work is excluded from the first Linux alpha gate.

These exclusions prevent the migration from becoming a general product rewrite.

## Update rule

Update this matrix in the same PR that changes a capability's desktop state. Do not mark a row **Verified** based only on source presence; the complete workflow and its persistence or packaging gate must pass.
