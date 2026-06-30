# ZCVIOS Desktop Data Ownership and Lifecycle

**Status:** Desktop architecture constraint  
**Last updated:** 2026-06-30

## Purpose

Define where the desktop edition stores data, who controls it, how upgrades affect it, and how users can export, back up, migrate, or delete it.

ZCVIOS remains a user-controlled planning application. Desktop packaging must not weaken the repository's privacy-first principles.

## Ownership principles

1. User-entered business data belongs to the user.
2. Core records remain local unless the user explicitly exports or configures an optional external service.
3. The deterministic core must work without an account on an external service.
4. The application must disclose where its data is stored.
5. Upgrades must preserve user data.
6. Uninstalling application binaries must not silently erase user-created data.
7. Export and deletion must be ordinary supported workflows, not recovery-only procedures.
8. No hidden collection of credentials, private messages, payment credentials, recovery codes, or restricted account data is permitted.

## Proposed Linux data layout

Use the operating system's application-data and user-document conventions rather than writing beside the executable.

Logical layout:

```text
ZCVIOS application data/
├── data/
│   └── zcvios.sqlite
├── migrations/
│   └── migration-state.json
├── backups/
├── exports/
├── logs/
└── settings/
    └── desktop-settings.json
```

The final implementation must resolve this through the desktop runtime's application-data path API. No absolute username-specific path may be hard-coded.

## Database ownership

The primary desktop database is SQLite.

Required characteristics:

- versioned schema
- migration history
- transaction use for multi-record operations
- foreign-key enforcement
- deterministic integer storage for currency cents
- profile-scoped records
- safe handling of interrupted writes
- backup before destructive or irreversible migrations

React components must not execute raw SQL. SQL access belongs in desktop repository adapters behind application-level interfaces.

## Local identity

The desktop edition initially supports one active local owner profile.

The existing `User` domain record may be retained for migration compatibility, but the desktop edition must not require:

- an email address as a remote identity
- a password to access a single-user local installation
- a NextAuth session
- cookies
- `NEXTAUTH_URL`
- a running web server

A later multi-profile feature may add optional local access controls, but it is outside the first parity milestone.

## Secrets and optional AI

Optional provider keys must be treated separately from ordinary settings and business records.

Requirements:

- no key is required for deterministic mode
- keys are never written to logs or exports
- UI displays only masked key status where appropriate
- removing a key disables that provider without affecting local records
- failure of an external AI service falls back to deterministic operation
- packaging must not include development secrets or `.env` files

The exact secure-storage implementation is a later bounded milestone. Until it is implemented and verified, the desktop alpha must not claim secure key storage.

## Export

The desktop edition must support user-initiated export containing:

- local profile and business settings
- weekly revenue records
- weekly plans and overrides
- work log sessions
- freedom/target definition
- daily missions
- pause windows
- relevant application settings that contain no secrets
- schema version
- export format version
- export timestamp

Preferred export formats:

- JSON for complete structured data
- CSV for tabular records where useful
- PDF for human-readable reports
- Markdown for portable summaries where useful

Export destination must be selected or clearly shown to the user.

## Backup

Backup is distinct from export.

A backup should preserve the database in a restorable form and include enough metadata to identify:

- application version
- schema version
- backup timestamp
- source profile
- integrity result

Backup workflow:

```text
request backup
-> finish or pause active writes
-> create consistent database copy
-> verify copy can be opened
-> record result
-> show destination
```

Backups must not block the UI without progress or status feedback.

## Upgrade behaviour

Installer upgrades must replace application binaries and resources without overwriting the application-data directory.

Before a schema migration that could alter or remove data:

1. inspect current schema version
2. create a verified backup
3. apply migrations in a transaction where supported
4. verify expected tables and required records
5. record migration result
6. start the application only after the migration succeeds

On migration failure:

- do not continue with a partially migrated database
- show a clear recoverable error
- preserve the pre-migration backup
- provide a path to logs and recovery instructions

## Uninstall behaviour

Normal package removal should remove installed program files and launchers while retaining user-owned application data.

The application may provide a separate, explicit "Delete all local ZCVIOS data" workflow. That workflow must:

- explain exactly what will be removed
- distinguish database records, backups, exports, and logs
- require explicit confirmation
- close active database connections
- report success or failure
- avoid deleting files outside the ZCVIOS-owned data scope

## Browser-to-desktop import

The migration must not assume that copying the existing Prisma SQLite file directly is always safe.

A controlled importer should:

1. identify the source schema/version
2. open the source read-only where possible
3. inventory supported records
4. map browser user IDs to a local profile
5. transform records into the desktop schema
6. validate counts and required relationships
7. write through desktop repositories in a transaction
8. generate an import report
9. leave the source unchanged

The importer must be tested with:

- complete data
- empty optional fields
- multiple weeks of data
- duplicate week constraints
- unsupported/newer source schema
- interrupted import

## Logs

Logs should support diagnosis without becoming a private-data copy.

Do log:

- application version
- schema version
- workflow name
- success/failure status
- safe error category
- migration identifiers

Do not log:

- passwords
- API keys
- full exported records
- private notes unless technically unavoidable and explicitly disclosed
- payment credentials
- recovery codes

Log retention and user deletion controls must be documented before production release.

## Data lifecycle acceptance gate

Desktop data handling is ready for alpha release only when:

- data path is visible in the UI
- database survives restart
- upgrade preserves records
- failed migration preserves a recoverable backup
- structured export includes all owned records
- backup restores successfully in a test installation
- deletion removes only the confirmed ZCVIOS data scope
- uninstall does not silently destroy user records
- optional AI failure does not block deterministic access to local data
