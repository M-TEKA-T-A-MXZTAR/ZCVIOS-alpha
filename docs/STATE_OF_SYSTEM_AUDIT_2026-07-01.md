# ZCVIOS State-of-System Audit — 2026-07-01

**Audit role:** Senior systems audit and build-planning baseline  
**Repository:** `M-TEKA-T-A-MXZTAR/ZCVIOS-alpha`  
**Audited main commit:** `bbf8c002dd9d63c5cbdd5c20786898409c012e8b`  
**Latest audited milestone:** PR #67  
**Status:** Authoritative planning input; no runtime fixes are included in this audit

## 1. Purpose

This document records the observable state of ZCVIOS before the July 2026 reliability programme and before further feature construction.

It exists to answer five questions:

1. What is ZCVIOS intended to become?
2. What currently works in the browser and desktop runtimes?
3. Which claims are verified, partial, planned, stale, or contradictory?
4. Which defects and architectural risks must be addressed before feature expansion?
5. What evidence should govern the master build plan and progress ledger?

The audit intentionally separates **confirmed defects**, **design decisions**, **unverified risks**, and **future capabilities**. A suspected issue is not labelled fixed merely because a document describes the intended behaviour.

## 2. Audit method and limits

The evidence pass covered:

- repository metadata, description, topics, tags, merge settings, and default branch
- merged PRs #55 through #67
- current browser and desktop architecture documents
- product thesis, roadmap, work queue, release notes, and changelog
- root and desktop package manifests
- GitHub Actions workflows
- authentication, registration, API-key encryption, mission, revenue, work-log, pause, export, and deletion paths
- deterministic strategy, mission, progress, and reporting modules
- desktop Tauri shell, SQLite migrations, operator baseline, packaging, and persistence verification
- AI and cross-platform requirement documents
- repository hygiene files and test wiring

This was a repository-wide structural and high-risk-path audit. It did not execute the repository locally. GitHub CI evidence is recorded separately from local verification notes. Files not directly inspected remain subject to later focused review during the bug-hunt phases.

## 3. Executive verdict

### 3.1 Product thesis

**Status: Strong and coherent.**

ZCVIOS has a defensible market purpose:

> Help a solo operator decide the single highest-value weekly focus, translate it into a practical daily mission, and measure whether focused work produced useful progress.

The core loop is clear:

```text
current position
→ one weekly lever
→ one daily mission
→ focused work and outcome records
→ weekly review
→ next decision
```

The product is not intended to be a generic task manager, enterprise suite, hidden account operator, or guaranteed-income system.

### 3.2 Current browser runtime

**Status: Operational alpha with material technical debt.**

The Next.js browser application contains the broadest feature set:

- registration and authentication
- onboarding and settings
- work-log entry
- weekly revenue entry
- deterministic and optional OpenAI-assisted strategy
- daily missions
- pause mode
- weekly and monthly reports
- JSON data export
- account deletion

PR #67 fixed a genuine resilience defect: unreadable encrypted OpenAI-key data now falls back to deterministic mode rather than breaking mission and revenue flows.

The PR #67 head passed both `zcvios-ci` and dependency review. Notes in the PR description about local build and test blockers are historical local observations, not the final GitHub CI result.

### 3.3 Current desktop runtime

**Status: Sound foundation, incomplete product.**

The Tauri desktop application currently includes:

- branded desktop shell
- local `local-owner` identity
- Rust-owned SQLite persistence
- versioned schema through version 2
- operator baseline editing and validation
- visible application-data location
- Linux `.deb` and AppImage test-package generation
- packaged restart and data-preservation checks

It does **not** yet include desktop work logs, revenue history, deterministic lever selection, missions, reports, export, backup, deletion, AI providers, Windows packaging, or macOS packaging.

### 3.4 Release readiness

**Status: Not release-ready.**

The repository is suitable for controlled alpha development, but not yet for a supported public three-platform desktop release. The immediate priority is reliability, governance, and deterministic correctness—not feature expansion.

## 4. Runtime and delivery map

| Area | Current implementation | Verified evidence | Current classification |
|---|---|---|---|
| Browser application | Next.js, Prisma, SQLite, NextAuth | Root CI and integration tests passed on PR #67 | Operational alpha |
| Desktop application | Tauri, React/Vite, Rust, SQLite | Desktop and Linux package milestones through PR #64 | Foundation / partial migration |
| Deterministic engine | Pure TypeScript core modules | `scripts/verify-core-engine.ts` | Implemented, correctness audit required |
| Browser AI | Direct OpenAI adapter with deterministic fallback | Browser routes and CI | Implemented legacy adapter |
| Desktop AI | Provider-neutral plan only | PR #65 documentation | Planned |
| Linux packaging | Debian and AppImage test packages | PR #63 workflow and package checks | Test-build capability |
| Windows packaging | Requirement document only | PR #66 | Planned |
| macOS packaging | Requirement document only | PR #66 | Planned |
| Browser-to-desktop import | No proven workflow | Migration documents only | Planned |
| Signed release/update | No signing, notarisation, or updater | Explicitly excluded from current package jobs | Planned |

## 5. Strengths to preserve

### 5.1 Clear product constraint

“One lever per week” protects the product from becoming another overloaded productivity dashboard.

### 5.2 Deterministic fallback

Core operation is intended to remain available without an AI provider, cloud account, or API charge.

### 5.3 Desktop persistence boundary

The desktop frontend calls typed Tauri commands while SQL, migration handling, and path resolution remain in Rust. This is a strong boundary and should remain intact.

### 5.4 Versioned local database

Desktop schema migrations are transactionally recorded. Operator-baseline save, validation, and reopen paths have focused Rust tests.

### 5.5 Package data-preservation intent

Linux package tests distinguish application payloads from user data and verify that data remains outside the replaceable program payload.

### 5.6 Controlled migration sequence

The existing desktop migration plan correctly favours complete vertical slices over a risky rewrite.

### 5.7 Privacy and authority boundaries

The documents consistently reject hidden private-account access, credential harvesting, unreviewed publishing, spending, and guaranteed-income claims.

## 6. Readiness assessment

| Dimension | Status | Audit conclusion |
|---|---|---|
| Product purpose | Green | Clear market problem and operating loop |
| Browser feature breadth | Amber | Broad alpha capability, but debt and contract drift remain |
| Deterministic calculation correctness | Red | Confirmed zero-hour report defect and unresolved metric definitions |
| Browser reliability | Amber | CI passes; route atomicity, dates, errors, and test isolation need repair |
| Desktop foundation | Green | Clean shell, local identity, SQLite, baseline, and Linux package proof |
| Desktop product parity | Red | Most user workflows are not yet migrated |
| Linux packaging | Amber | CI test packages exist; local supported-machine acceptance remains incomplete |
| Windows readiness | Red | Requirements only; no native build/package proof |
| macOS readiness | Red | Requirements only; no native build/package proof |
| AI architecture | Amber | Strong plan, but desktop code is absent and browser adapter is provider-specific |
| Documentation governance | Red | Multiple competing plans, stale release records, and domain contradictions |
| Repository hygiene | Red | Tracked bytecode, malformed ignore rules, and non-portable scripts observed |
| Public release readiness | Red | No complete parity, import, signing, three-platform verification, or release gate |

## 7. Audit findings

### Severity vocabulary

- **P0 — Critical:** confirmed data loss, secret exposure, or unusable core system requiring immediate stop
- **P1 — High:** confirmed correctness/reliability defect or governance conflict that can mislead users or corrupt workflow state
- **P2 — Medium:** maintainability, portability, test, documentation, or incomplete-contract problem
- **P3 — Low:** polish, metadata, or low-impact consistency problem

No P0 defect was confirmed during this evidence pass. That does not prove none exists; it means no P0 claim is made without executable evidence.

### AUD-001 — Fabricated report yield when no hours are logged

- **Severity:** P1
- **Type:** Confirmed defect
- **Evidence:** `src/core/reports.ts`
- **Observed behaviour:** Weekly and historical report calculations pass `hours || 1` into `calcEhr`. Revenue recorded with zero focused hours is therefore divided by a fictitious one-hour value.
- **Impact:** Reports can display a false efficiency/yield figure instead of an explicit “no hours logged” state.
- **Test gap:** Core tests verify `calcEhr(..., 0)` directly but do not test a zero-hour weekly or monthly report.
- **Required resolution:** Represent missing-hour states explicitly; never synthesize one hour for a report calculation; add regression fixtures for zero hours, zero revenue, and missing data.

### AUD-002 — Focused-work metric definition is contradictory

- **Severity:** P1
- **Type:** Domain decision required
- **Evidence:** `src/core/progress.ts`, `scripts/verify-core-engine.ts`, `docs/V1_2_0_WORK_QUEUE.md`
- **Observed conflict:** Current code and tests count `LEVER` plus `ASSET_BUILD` as `leverHours`. The old work queue says focused-session yield must count `LEVER` only.
- **Impact:** Reports and strategy signals can change depending on which document is treated as authoritative.
- **Required resolution:** Define authoritative categories in the master domain contract, rename fields if necessary, update fixtures, reports, and documents together.

### AUD-003 — Revenue save and strategy calculation are not atomic

- **Severity:** P1
- **Type:** Confirmed architectural defect
- **Evidence:** `src/app/rpc/revenue/route.ts`
- **Observed behaviour:** Weekly revenue is persisted and marked `strategyTriggered: true` before strategy calculation and weekly-plan persistence complete. A later failure can return `400 Invalid revenue entry` even though revenue was saved.
- **Impact:** The user can retry and misunderstand the actual state; `strategyTriggered` can claim success prematurely.
- **Required resolution:** Separate validation errors from internal failures; define transaction or two-stage status semantics; set strategy status only after successful strategy persistence; test partial-failure recovery.

### AUD-004 — Date-only values use unsafe JavaScript Date parsing

- **Severity:** P1
- **Type:** Confirmed portability risk
- **Evidence:** `src/lib/time.ts`, revenue, log, and pause routes
- **Observed behaviour:** `new Date("YYYY-MM-DD")`, local midnight mutation, `toISOString().slice(0, 10)`, and fixed 24-hour day arithmetic are mixed.
- **Impact:** Calendar dates can shift across time zones and daylight-saving transitions, especially when browser, server, CI, and desktop environments differ.
- **Required resolution:** Introduce a tested date-only contract; parse components explicitly; define operator time zone/locale; use calendar arithmetic rather than assumed 24-hour periods.

### AUD-005 — Pause mode accepts past custom end dates

- **Severity:** P2
- **Type:** Confirmed validation defect
- **Evidence:** `src/app/rpc/pause/route.ts`
- **Observed behaviour:** Custom dates are capped at one year in the future but are not required to be today or later.
- **Impact:** The route can return success for an immediately expired pause and create misleading history.
- **Required resolution:** Add minimum-date validation, transactionally close/create pauses, and test past, today, DST, and maximum cases.

### AUD-006 — Export omits an owned domain record

- **Severity:** P1
- **Type:** Confirmed privacy-contract defect
- **Evidence:** `prisma/schema.prisma`, `src/app/rpc/data-export/route.ts`
- **Observed behaviour:** `FreedomDefinition` belongs to the user but is not included in data export.
- **Impact:** “Export all owned data” is not currently true.
- **Required resolution:** Define a versioned export schema, include every owned record or explicitly document exclusions, and add export completeness tests.

### AUD-007 — Catch-all error responses misreport system failures

- **Severity:** P2
- **Type:** Confirmed reliability/usability defect
- **Evidence:** registration, log, revenue, pause, and deletion routes
- **Observed behaviour:** Broad catches map validation, database, migration, and internal errors to messages such as “Invalid input” or “Type DELETE to confirm.”
- **Impact:** Users and maintainers receive false diagnoses; recovery becomes harder.
- **Required resolution:** Use typed validation errors, conflict errors, not-found errors, and internal failure responses; log safe diagnostic identifiers without exposing secrets.

### AUD-008 — AI-key fallback hides key corruption from the user

- **Severity:** P2
- **Type:** Resilience improvement with unresolved health state
- **Evidence:** PR #67 and `src/lib/crypto.ts`
- **Observed behaviour:** Unreadable ciphertext now safely returns `null`, but the saved-key indicator and last-four metadata can remain, while requests silently use deterministic mode.
- **Impact:** The core workflow survives, but the user may believe AI is active when the stored key is unusable.
- **Required resolution:** Preserve fail-closed behaviour, add an explicit provider/key health state, allow clear/replace, and avoid exposing cryptographic details.

### AUD-009 — Browser AI is hard-wired to one provider and model

- **Severity:** P2
- **Type:** Architectural debt
- **Evidence:** `src/lib/ai.ts`
- **Observed behaviour:** Business services call a direct OpenAI HTTP implementation with a hard-coded model. There is no provider contract, timeout, cancellation, capability discovery, or provider health status.
- **Impact:** The implementation cannot cleanly support Ollama, Gemini, resource-aware routing, or sophisticated agent orchestration.
- **Required resolution:** Do not patch provider branches into the current helper. Introduce provider-neutral contracts only after deterministic desktop parity, as defined in the master build plan.

### AUD-010 — Product documents disagree on the number of levers

- **Severity:** P1
- **Type:** Domain-governance defect
- **Evidence:** `src/core/domain.ts`, Prisma enum, `docs/SYSTEM_OVERVIEW.md`, product documents
- **Observed conflict:** Code defines eight levers, including `AssetBuild` and `Authority`. The system overview describes six.
- **Impact:** UI, AI schemas, deterministic rules, reports, migrations, and public explanation cannot remain reliably aligned.
- **Required resolution:** Decide the canonical lever set and meanings. Update domain types, database enum, prompts, deterministic missions, tests, UI, and documents in one controlled domain-alignment milestone.

### AUD-011 — Multiple competing plans claim authority

- **Severity:** P1
- **Type:** Governance defect
- **Evidence:** roadmap, v1.2 execution plan, v1.2 work queue, desktop migration plan, parity matrix, AI plan, cross-platform requirements
- **Observed behaviour:** The old work queue calls itself the source of truth while the project has since shifted to desktop migration and new specialised plans.
- **Impact:** Agents and contributors can follow an obsolete sequence or implement browser-only work that conflicts with the desktop destination.
- **Required resolution:** Establish `MASTER_BUILD_PLAN.md` as the build-order authority and `PROGRESS_LEDGER.md` as the status authority. Mark older plans as historical or subordinate inputs.

### AUD-012 — Browser and desktop runtime authority is unclear

- **Severity:** P1
- **Type:** Delivery-governance defect
- **Evidence:** README, roadmap, system overview, desktop migration plan, parity matrix
- **Observed behaviour:** Browser features are described as current and operational, while desktop is the declared future delivery target. There is no concise current-state contract stating what is canonical, what must be ported, and when browser code may retire.
- **Impact:** New features may be built in the wrong runtime or duplicated without shared contracts.
- **Required resolution:** Browser remains the behavioural reference only until a desktop slice reaches verified parity. New product logic belongs in platform-neutral core/application contracts first. Browser retirement requires import, parity, rollback, export, and deletion proof.

### AUD-013 — Version identity is fragmented

- **Severity:** P2
- **Type:** Confirmed consistency defect
- **Evidence:** README, root `package.json`, root metadata, desktop `package.json`, changelog, release notes
- **Observed values:** `1.1.1-alpha`, `1.1.0-alpha`, and desktop `0.1.0` coexist without a documented version policy.
- **Impact:** Build artifacts, UI, support reports, migrations, and release notes can identify the same system differently.
- **Required resolution:** Define product version, desktop package version, schema version, and release channel. Generate or verify visible versions from one source of truth.

### AUD-014 — Root test commands are machine-specific

- **Severity:** P1
- **Type:** Confirmed reproducibility defect
- **Evidence:** root `package.json`
- **Observed behaviour:** `npm test` and `test:privacy` call `/root/.venv/bin/python`.
- **Impact:** Standard local environments, Windows, macOS, and many Linux users cannot run the advertised command.
- **Required resolution:** Use `python -m pytest` or a documented cross-platform runner; separate server-start requirements from test invocation; verify on supported environments.

### AUD-015 — Repository ignore rules are malformed and incomplete

- **Severity:** P1
- **Type:** Confirmed hygiene defect
- **Evidence:** `.gitignore`, PR #67
- **Observed behaviour:** `.gitignore` contains literal `-e` lines, duplicated environment rules, and no Python bytecode exclusions. PR #67 included tracked `.pyc` files.
- **Impact:** Generated files can pollute diffs, reviews, and release archives.
- **Required resolution:** Clean `.gitignore`, remove tracked bytecode, add Python, desktop build, and Rust output rules where appropriate, and add a hygiene verifier.

### AUD-016 — PR #67 integration test mutates a shared database directly

- **Severity:** P1
- **Type:** Confirmed test-isolation defect
- **Evidence:** `tests/test_rpc_authenticated_flows.py`
- **Observed behaviour:** The test locates root `dev.db` and directly writes corrupted ciphertext. It does not restore the record and assumes a specific SQLite file location.
- **Impact:** Tests are order-sensitive, unsuitable for parallel execution, and can contaminate developer data if run against the wrong database.
- **Required resolution:** Use an isolated test database, a test fixture/helper at the repository boundary, deterministic cleanup, and explicit environment guards.

### AUD-017 — CI policy is inconsistent and unnecessarily expensive

- **Severity:** P2
- **Type:** Workflow debt
- **Evidence:** `.github/workflows/ci.yml`, desktop workflows
- **Observed behaviour:** Root CI runs on both every push and every pull request, lacks concurrency cancellation and job timeouts, builds twice, and uses unpinned action tags. Desktop workflows are path-filtered, timeout-bounded, and SHA-pinned.
- **Impact:** Duplicate cost, slower feedback, inconsistent supply-chain discipline, and stale runs.
- **Required resolution:** Adopt a documented CI policy: PR checks plus manual dispatch where appropriate, concurrency cancellation, pinned actions, bounded timeouts, and no duplicate full builds without a clear reason.

### AUD-018 — Root and desktop toolchains are not aligned

- **Severity:** P2
- **Type:** Build-governance debt
- **Evidence:** package manifests and workflows
- **Observed behaviour:** Root uses Node 20 in CI while desktop uses Node 22; React patch versions differ; Prisma CLI and client versions differ.
- **Impact:** Behaviour can vary between environments and dependency resolution can drift.
- **Required resolution:** Define supported toolchain versions and compatibility policy; align Prisma packages; use lockfile-based installs; document intentional runtime differences.

### AUD-019 — Remote Google Fonts weaken reproducible/offline builds

- **Severity:** P2
- **Type:** Build and privacy risk
- **Evidence:** `src/app/layout.tsx`
- **Observed behaviour:** The browser root imports Google-hosted fonts through `next/font/google`.
- **Impact:** Clean/offline builds may depend on external font retrieval, and the project’s local-first direction is weakened.
- **Required resolution:** Use system fonts or properly licensed local font assets without distributing third-party font files through support channels. Verify offline production build.

### AUD-020 — Currency and locale are not explicit domain data

- **Severity:** P1
- **Type:** Cross-platform/domain decision required
- **Evidence:** desktop baseline and browser revenue models
- **Observed behaviour:** Money is stored as integer cents, but no currency code is stored. Desktop formatting is hard-coded to `en-NZ` while the UI describes “your usual currency.”
- **Impact:** Values become ambiguous when users, exports, or machines cross locales and countries.
- **Required resolution:** Add an ISO currency-code and locale/time-zone policy before desktop revenue history. Never infer authoritative currency from display locale alone.

### AUD-021 — Work-log capability is not full CRUD

- **Severity:** P2
- **Type:** Documentation/capability mismatch
- **Evidence:** logs route and roadmap language
- **Observed behaviour:** Browser work logs support list and create; no update/delete implementation was found.
- **Impact:** “CRUD” claims overstate capability and parity gates are unclear.
- **Required resolution:** Either implement bounded edit/delete workflows with audit/recalculation behaviour or rename the capability accurately.

### AUD-022 — Report projection language conflicts with non-prediction guardrails

- **Severity:** P2
- **Type:** Product-language risk
- **Evidence:** `projectionRange` and weekly report output
- **Observed behaviour:** The core emits a calculated projection range from current EHR and slope.
- **Impact:** It may be interpreted as predictive income or expected future performance, contrary to product guardrails.
- **Required resolution:** Remove it, rename it as a clearly hypothetical scenario, or define a non-predictive analytical contract with explicit uncertainty and no income promise.

### AUD-023 — Export lacks schema and application-version metadata

- **Severity:** P2
- **Type:** Portability defect
- **Evidence:** data export route
- **Observed behaviour:** Export contains `exportedAt` and data but no export schema version, application version, source runtime, or migration information.
- **Impact:** Future import, support, and cross-platform portability cannot reliably interpret old exports.
- **Required resolution:** Define a versioned export envelope before desktop import/export work.

### AUD-024 — Public repository description and topics are stale

- **Severity:** P3
- **Type:** Public-positioning defect
- **Observed metadata:** Topics emphasise Next.js, Prisma, SaaS template, and workflow automation while omitting Tauri, desktop, local-first, cross-platform, Rust, and optional local AI.
- **Impact:** Visitors receive an outdated view of the project and its market position.
- **Required resolution:** Update description/topics only after the master plan terminology is approved. Avoid claiming supported platforms before acceptance gates pass.

### AUD-025 — Changelog and release notes do not record the desktop programme

- **Severity:** P2
- **Type:** Documentation debt
- **Evidence:** `CHANGELOG.md`, `RELEASE_NOTES_v1.1.1-alpha.md`
- **Observed behaviour:** They stop at March 2026 and omit PRs #55–#67.
- **Impact:** The repository lacks a reliable historical narrative of architecture, packaging, AI planning, cross-platform requirements, operator baseline, and resilience fixes.
- **Required resolution:** Backfill a concise unreleased section from merged PR evidence; do not invent release claims.

## 8. Architectural decisions required before further desktop data models

The following decisions must be resolved in documents and fixtures before corresponding implementation:

1. Canonical lever set: six or eight, with explicit definitions.
2. Focused-work categories: `LEVER` only or `LEVER + ASSET_BUILD`.
3. Currency: ISO currency code, minor-unit rules, display locale, and migration default.
4. Operator calendar: time zone, week-start rule, date-only representation, DST behaviour.
5. Browser authority: behavioural reference only, not a second permanent source of truth.
6. Export/import envelope and compatibility guarantees.
7. AI output authority and agent audit record.
8. Rendering-engine relationship: separate module unless explicitly accepted into ZCVIOS scope.

## 9. Immediate stop conditions

Do not begin a broad feature milestone while any of the following remains true:

- master plan and ledger are absent or contradictory
- a P1 calculation defect has no regression test
- a new desktop record lacks currency/date/domain decisions it depends on
- browser and desktop implement competing business rules
- a PR mixes reliability, new features, AI, and cross-platform packaging
- a control is added without persistence, feedback, recovery, and verification
- a provider failure can block deterministic operation
- package or migration work risks user data without a tested rollback

## 10. Recommended reliability sequence

The next work after this documentation milestone should be split into bounded PRs:

### Reliability PR A — Repository hygiene and reproducible commands

- repair `.gitignore`
- remove tracked Python bytecode
- replace machine-specific Python paths
- isolate test database configuration
- add a generated-file/hygiene check
- align documented verification commands

### Reliability PR B — Deterministic metric correctness

- define focused-work categories
- remove fictitious one-hour substitutions
- represent missing hours/revenue explicitly
- review rolling-slope zero baseline
- resolve projection semantics
- add edge-case fixtures

### Reliability PR C — Calendar and monetary domain contracts

- implement safe date-only parsing and formatting
- define operator time zone and Monday-week behaviour
- define ISO currency storage/display
- add DST and cross-locale tests

### Reliability PR D — Route atomicity and error integrity

- repair revenue/strategy partial-success semantics
- transactionally manage pause replacement
- use typed error responses
- expose AI-key health without breaking deterministic fallback

### Reliability PR E — Privacy and portability contracts

- complete versioned export
- include every owned record
- define import compatibility
- verify deletion and export completeness

### Reliability PR F — Governance and public truth alignment

- resolve lever count and terminology
- establish version policy
- update system overview, roadmap, changelog, release notes, description, and topics
- mark older work queues historical or superseded

## 11. Audit disposition

This audit does not authorise all findings to be fixed in one branch. Each repair must be implemented as the smallest complete change with:

- state before
- allowed change
- state after
- failure behaviour
- regression evidence
- final scope review

The authoritative implementation order is defined in `MASTER_BUILD_PLAN.md`. Current status and evidence are maintained in `PROGRESS_LEDGER.md`.
