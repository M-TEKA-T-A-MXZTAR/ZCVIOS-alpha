# ZCVIOS Master Build Plan

**Status:** Authoritative build-order document  
**Established:** 2026-07-01  
**Baseline commit:** `bbf8c002dd9d63c5cbdd5c20786898409c012e8b`  
**Companion documents:**

- [State-of-System Audit — 2026-07-01](STATE_OF_SYSTEM_AUDIT_2026-07-01.md)
- [Progress Ledger](PROGRESS_LEDGER.md)
- [Desktop Feature-Parity Matrix](DESKTOP_FEATURE_PARITY_MATRIX.md)
- [Cross-Platform Desktop Requirements](CROSS_PLATFORM_DESKTOP_REQUIREMENTS.md)
- [Local-First AI Runtime Plan](LOCAL_AI_RUNTIME.md)

## 1. Authority and purpose

This document is the source of truth for **what ZCVIOS builds next and in what dependency order**.

It supersedes earlier work queues as the active build-order authority. Older plans remain useful historical and specialist inputs, but they must not override this document.

The Progress Ledger is the source of truth for **what has actually happened**. A roadmap statement, source file, or pull-request description does not make a milestone complete unless the ledger records acceptance evidence.

## 2. Product promise

ZCVIOS is a local-first, privacy-first decision-support system for solo creators, small business owners, and independent operators.

It helps the user answer:

> Given where my business stands now, what is the single highest-value action to focus on next, what should I avoid, and did the action produce useful progress?

The complete product loop is:

```text
understand the operator
→ record the current business position
→ identify the constrained business lever
→ produce one practical daily mission
→ execute and record focused work
→ measure useful outcomes
→ review what changed
→ adapt the next decision
```

The longer-term intelligence promise is:

> From concept to end user, ZCVIOS helps the operator clarify, validate, execute, inspect, position, deliver, and learn—while preserving human authority.

That promise does not authorise premature feature breadth. It is delivered through controlled, verified layers.

## 3. Product boundaries

ZCVIOS is not:

- a generic task manager
- an enterprise resource-planning suite
- a hidden marketplace operator
- a credential-collection system
- a payment processor
- a spam or mass-publishing engine
- a guaranteed-income or predictive-income service
- an AI system with authority to spend, publish, delete, or impersonate the user
- automatically a rendering engine, mockup engine, pattern engine, or image generator

Rendering capabilities may later connect through a replaceable capability boundary, but they must not distort the core decision-support product.

## 4. Non-negotiable engineering principles

### 4.1 Deterministic core first

The useful core must operate without internet access, an AI key, Ollama, or a cloud provider.

### 4.2 One authoritative business rule

Business calculations and decisions live in platform-neutral core/application contracts. Browser, Linux, Windows, and macOS adapters must not implement competing rules.

### 4.3 Complete vertical slices

A visible control is not complete until it has:

- handler
- validated data contract
- persistence or side-effect boundary
- loading/working state
- success feedback
- recoverable failure state
- audit/logging where useful
- focused tests
- restart or package evidence where applicable

### 4.4 User authority

Recommendations are decision support. The user can inspect, reject, edit, defer, or override them.

### 4.5 Privacy-first data flow

Do not collect private platform credentials, payment credentials, recovery codes, or restricted account data. Cloud disclosure must be explicit. Local data location, export, backup, and deletion must remain visible.

### 4.6 Cross-platform from the architecture boundary

Linux is the first verification platform, not the only product target. Platform-specific differences belong behind typed native adapters. Windows and macOS claims require native evidence.

### 4.7 Resource kindness

Long work must be asynchronous, cancellable, bounded, and visible. Local AI and rendering must not freeze the interface or assume high-end hardware.

### 4.8 Honest status

Use only these delivery labels:

- Planned
- Active
- Blocked
- Implemented
- Verified
- Test build
- Supported
- Deferred
- Superseded

“Implemented” does not mean “Verified.” “Builds in CI” does not mean “Supported.”

## 5. Source-of-truth hierarchy

When documents conflict, apply this order:

1. `MASTER_BUILD_PLAN.md` — build order and milestone authority
2. `PROGRESS_LEDGER.md` — actual status, evidence, decisions, and blockers
3. `STATE_OF_SYSTEM_AUDIT_2026-07-01.md` — audited baseline and findings
4. `DESKTOP_FEATURE_PARITY_MATRIX.md` — browser-to-desktop capability evidence
5. `CROSS_PLATFORM_DESKTOP_REQUIREMENTS.md` — Linux/Windows/macOS acceptance contract
6. `LOCAL_AI_RUNTIME.md` — AI provider and privacy requirements
7. `DESKTOP_MIGRATION_PLAN.md` — migration architecture and retirement conditions
8. product thesis and architecture principles
9. older execution plans, work queues, release notes, and PR descriptions

A later dated specialist document may refine its own boundary but may not silently reorder the master plan.

## 6. Change-control protocol

Every implementation PR must declare:

### State before

- current behaviour
- relevant data schema
- known tests
- known limitation or defect

### Allowed change

- exact files/domains intended
- acceptance criteria
- explicit exclusions

### State after

- user-visible behaviour
- data and migration effect
- failure/recovery behaviour
- verification evidence

### Stop condition

Stop and repair the current increment when:

- existing behaviour regresses
- tests cannot express the expected contract
- data migration is irreversible or ambiguous
- a platform-specific assumption leaks into core logic
- deterministic mode becomes dependent on AI
- the PR requires unrelated fixes to appear complete
- a dead control or hidden failure path is introduced

## 7. Pull-request discipline

- One bounded outcome per PR.
- Reliability work and feature work do not share a PR.
- AI architecture and cross-platform packaging do not share a PR.
- Documentation must describe actual state, planned state, or acceptance state explicitly.
- Draft PRs remain draft until focused checks pass and review findings are resolved.
- Do not merge because a branch merely compiles.
- Do not rewrite branch history unless there is a clear safety or review benefit.
- Package and costly CI jobs remain path-filtered or manually dispatched.
- Record every merged milestone in the Progress Ledger.

## 8. Definition of done

A milestone is **Verified** only when relevant evidence includes:

1. implementation commit or PR
2. focused automated tests
3. regression tests
4. lint/type/build result
5. error-path result
6. persistence/restart result for stored data
7. migration result for schema changes
8. package/platform evidence where relevant
9. privacy/export/deletion evidence where relevant
10. final diff review confirming bounded scope
11. documentation and ledger update
12. manual workflow evidence where automation cannot prove usability

## 9. Build programme overview

```text
Phase 0  Governance and reliability reset
Phase 1  Deterministic desktop product loop
Phase 2  Privacy, portability, and browser transition
Phase 3  Three-platform native parity
Phase 4  Provider-neutral AI and intelligent assistance
Phase 5  Concept-to-end-user intelligence
Phase 6  Optional rendering/production capability boundary
Phase 7  Release engineering and supported distribution
```

Phases express dependency order. Small preparatory work from a later phase may occur only when it does not displace the active critical path.

# Phase 0 — Governance and Reliability Reset

## Objective

Create one trustworthy build state before adding capabilities.

## P0.1 — Establish audit, master plan, and progress ledger

**Status at establishment:** Active documentation milestone

### Deliverables

- state-of-system audit
- master build plan
- append-only progress ledger
- README links to control documents

### Acceptance gate

- documents identify audited commit
- authority hierarchy is explicit
- confirmed defects are separated from decisions and risks
- next reliability increments are bounded
- no runtime behaviour changes

## P0.2 — Repository hygiene and reproducible commands

### Purpose

Ensure the repository can be reviewed and tested without generated-file pollution or machine-specific paths.

### Required changes

- clean malformed `.gitignore` entries
- add Python bytecode/cache exclusions
- remove tracked `.pyc` and cache files
- confirm desktop and Rust generated-output exclusions
- replace `/root/.venv/bin/python` scripts with portable commands
- define isolated test database configuration
- prevent tests from touching developer databases accidentally
- add a focused repository-hygiene verifier
- align README verification commands with executable scripts

### Acceptance gate

- clean checkout does not produce tracked generated files after standard tests
- `npm test` uses a portable command contract
- integration tests run against an explicitly isolated database
- corrupted-key regression test restores or discards all test state
- Linux CI passes
- Windows/macOS command syntax is not knowingly excluded

### Exclusions

- no business-logic changes
- no UI changes
- no new AI provider
- no package target additions

## P0.3 — Deterministic metric correctness

### Purpose

Make the core measurement signal trustworthy before it is migrated further.

### Required decisions

- authoritative meaning of focused work
- whether `ASSET_BUILD` is included in focused yield or reported separately
- missing-hours and missing-revenue semantics
- rolling-slope behaviour when baseline is zero
- projection/scenario language

### Required changes

- remove fictitious one-hour substitutions
- return explicit metric availability/status
- distinguish zero from missing
- add zero-hour, zero-revenue, first-week, sparse-history, and negative-slope fixtures
- update weekly/monthly report contracts
- align names and documentation with formulas

### Acceptance gate

- no report fabricates hours
- no divide-by-zero, `NaN`, or misleading `$0/h` state
- focused and total yield use approved categories
- insufficient history is explicit
- no calculation is presented as guaranteed or predictive income
- browser and pure-core fixtures match

### Exclusions

- no desktop report UI yet
- no AI explanation changes

## P0.4 — Calendar and monetary domain contracts

### Purpose

Prevent date and currency ambiguity before desktop work logs and revenue history are added.

### Required decisions

- operator time zone
- Monday-week boundary
- date-only storage and transport type
- DST-safe calendar arithmetic
- ISO currency code
- minor-unit conversion rules
- display locale versus authoritative currency

### Required changes

- introduce tested date-only parse/format helpers
- eliminate `new Date("YYYY-MM-DD")` ambiguity
- eliminate fixed-24-hour calendar assumptions where inappropriate
- add currency code to the relevant shared contract before desktop revenue history
- define migration/default behaviour for existing records

### Acceptance gate

- date-only fixtures pass across positive and negative UTC offsets
- DST transitions do not shift operator dates or week boundaries
- monetary values are unambiguous in export and UI
- display locale does not change stored meaning

### Exclusions

- no currency conversion or exchange-rate service
- no tax engine

## P0.5 — Route atomicity and error integrity

### Purpose

Ensure browser behaviour remains a trustworthy reference during migration.

### Required changes

- repair revenue-save/strategy partial-success semantics
- make `strategyTriggered` represent actual state
- transactionally replace pause windows
- reject past custom pause dates
- introduce typed validation/conflict/internal errors
- add safe diagnostic correlation without secret leakage
- add explicit unusable-AI-key health state while preserving deterministic fallback

### Acceptance gate

- a failed strategy step never masquerades as an invalid revenue input
- retries are idempotent where expected
- user-visible state matches persisted state
- pause replacement cannot leave contradictory active records
- corrupted AI key is recoverable and visible

## P0.6 — Privacy and portability contract repair

### Required changes

- define versioned export envelope
- include every user-owned record, including `FreedomDefinition`
- add source runtime, app version, export schema version, and generated timestamp
- define whether secrets are excluded and say so explicitly
- add completeness fixtures
- verify deletion covers all related records

### Acceptance gate

- export is complete against an authoritative owned-record inventory
- export contains no password hash or API secret
- deletion and export tests pass
- future import can identify the export schema

## P0.7 — Domain, version, and documentation alignment

### Required decisions

- canonical six-versus-eight lever set
- names and descriptions of all levers
- product version policy
- desktop package version policy
- schema and export version policy
- browser and desktop runtime authority

### Required changes

- align code, Prisma enum, prompts, missions, tests, overview, thesis, and UI
- establish one version source or enforced consistency check
- add an `Unreleased` changelog section for PRs #55–#67
- update release-status wording without claiming a public release
- mark old work queue and execution plan as historical inputs
- update repository description/topics after terminology is approved

### Acceptance gate

- no authoritative document contradicts domain types
- visible versions are consistent by policy
- public metadata accurately describes current alpha direction
- old plans cannot be mistaken for active build order

# Phase 1 — Deterministic Desktop Product Loop

## Objective

Migrate complete user workflows into the local desktop application while preserving platform-neutral rules and browser-reference equivalence.

## P1.1 — Shared desktop application-state contract

### Purpose

Prevent the desktop UI from becoming a monolith as additional workflows arrive.

### Deliverables

- typed application commands/use cases for dashboard state
- repository contracts for operator, work logs, revenue, plans, missions, and reports
- presentation DTOs separate from persistence rows
- central loading/error state conventions
- architecture verifier that rejects raw SQL and platform logic in UI/core

### Acceptance gate

- UI contains no business calculations or SQL
- application services are testable with in-memory adapters
- browser and desktop can consume shared domain fixtures

## P1.2 — Desktop dashboard state

### Deliverables

- read-only dashboard composition from local data
- honest missing-data states
- current baseline and next required input
- no lever or mission before required evidence exists

### Acceptance gate

- restart-safe
- no dead actions
- no fabricated metrics
- screen remains useful with no historical data

## P1.3 — Focused work logging

### Deliverables

- schema migration for work-log records
- add/list workflow
- edit/delete only if the approved contract requires them
- category definitions aligned with metric contract
- validation, empty state, failure recovery
- dashboard recalculation

### Acceptance gate

- date, duration, category, completion, and note validation
- restart persistence
- correct week/time-zone scoping
- no UI freeze
- browser/shared fixture equivalence

## P1.4 — Weekly revenue history

### Deliverables

- currency-aware weekly revenue records
- optional operating signals
- week-scoped add/update workflow
- explicit strategy state separate from revenue save state
- history view and restart persistence

### Acceptance gate

- integer minor-unit storage
- safe date/week handling
- zero revenue valid
- partial strategy failure does not corrupt or misreport revenue
- export coverage added with the model

## P1.5 — Deterministic weekly lever

### Deliverables

- approved canonical lever set
- explainable rule engine
- one active weekly plan
- manual override and reason
- lever-history record sufficient for later review

### Acceptance gate

- shared fixtures match browser reference or approved corrected behaviour
- no AI required
- recommendation explains load-bearing signals
- manual override persists and remains visible
- only one primary lever is active

## P1.6 — Template daily mission

### Deliverables

- offline mission generation
- source and prompt/template version recording
- existing/reset/regenerate rules
- completion state if approved
- “do not do yet” guardrail

### Acceptance gate

- mission is scoped to operator date and active lever
- restart persistence
- no duplicate mission for the same date unless explicit regeneration occurs
- regeneration is auditable
- inactive/pause behaviour is tested

## P1.7 — Weekly and monthly review

### Deliverables

- truthful focused and total yield
- consistency and drift signals
- lever and mission outcomes
- sparse-history states
- week-over-week comparison
- decision-support next-focus explanation

### Acceptance gate

- shared calculation fixtures
- no fictitious hours
- no predictive-income language
- missing data is distinguished from zero
- reports render without AI

## P1.8 — Local export, backup, deletion, and restore/import preparation

### Deliverables

- versioned JSON export
- user-selected export destination
- dated SQLite backup
- clear local data deletion scope
- restore/import design and validation preview

### Acceptance gate

- export includes all owned data
- backup is non-blocking and verifiable
- deletion requires explicit confirmation and explains retained backups
- data location remains visible
- no secret material exported

# Phase 2 — Browser Coexistence and Transition

## Objective

Use the browser implementation as a behavioural reference without allowing it to remain a competing permanent architecture.

## P2.1 — Browser/desktop parity fixtures

- one shared fixture set for calculations and workflow decisions
- expected outputs versioned with the domain contract
- browser adapters and desktop adapters run against the same cases

## P2.2 — Browser export to desktop import

- validate browser export envelope
- preview import effects
- map identities and dates/currency explicitly
- reject unsupported versions safely
- preserve original export as rollback evidence

## P2.3 — Browser retirement readiness audit

Browser retirement is permitted only when:

- every required parity row is Verified
- import has succeeded on representative data
- desktop export, backup, deletion, and upgrade are proven
- no core capability depends on Next.js, NextAuth, or Prisma
- rollback instructions exist
- user-facing transition instructions exist

The retirement decision is separate from the technical readiness audit.

# Phase 3 — Three-Platform Native Parity

## Objective

Deliver one coherent desktop product on Linux, Windows, and macOS.

## P3.1 — Platform-neutral architecture verifier

### Deliverables

- static checks for path separators, shell assumptions, Linux-only process logic, raw OS inspection in frontend, and platform imports in core
- native-adapter interfaces for paths, files, secure secrets, process discovery, and package behaviour

## P3.2 — Windows unsigned test build

### Deliverables

- Windows Tauri configuration
- required icon formats
- NSIS and/or MSI test package
- WebView2 handling
- native data-path and SQLite proof

### Acceptance gate

- build on Windows runner
- package inspection
- first launch
- baseline save/restart
- upgrade and data-preservation test
- no Linux path assumptions

## P3.3 — macOS unsigned test build

### Deliverables

- macOS Tauri configuration
- `.app` and DMG test package
- Apple silicon build
- Intel support decision based on evidence
- native data-path and SQLite proof

### Acceptance gate

- build on macOS runner
- package inspection
- first launch
- baseline save/restart
- upgrade and data-preservation test
- no Linux/Windows assumptions

## P3.4 — Shared three-platform workflow matrix

Run supported workflow fixtures on all three native runners:

- baseline
- work logs
- revenue
- lever
- mission
- reports
- export/backup/delete
- deterministic offline operation

## P3.5 — Platform support declaration

A platform remains `Test build` until the complete acceptance gate in `CROSS_PLATFORM_DESKTOP_REQUIREMENTS.md` passes on CI and representative hardware.

# Phase 4 — Provider-Neutral AI Assistance

## Objective

Add sophisticated optional intelligence without weakening deterministic authority, privacy, responsiveness, or platform parity.

## P4.1 — AI domain and provider contracts

### Deliverables

- `AiProvider` interface
- capability model
- model descriptor
- structured-generation request/result
- cancellation contract
- timeout/error taxonomy
- deterministic provider/adapter
- no network provider yet

### Acceptance gate

- application services depend only on provider-neutral contracts
- deterministic mode satisfies every AI-assisted workflow with a bounded fallback
- provider output cannot write authoritative records directly

## P4.2 — Versioned prompt-contract registry

Each agent contract records:

- stable identifier
- version
- purpose
- allowed input categories
- structured output schema
- forbidden behaviour
- maximum context/output
- deterministic fallback
- evaluation fixtures
- provider capability requirements

Initial contracts:

- strategy explanation
- mission wording
- weekly observation summary
- concept clarification

## P4.3 — Local Ollama adapter and resource governor

### Deliverables

- loopback-only default endpoint
- installation/service detection
- installed-model inventory
- configurable model selection
- health test
- one active request at a time
- cancellation and timeout
- low-resource, balanced, and performance profiles
- visible elapsed time and fallback state

### Acceptance gate

- no silent Ollama/model installation
- CPU-only system remains responsive
- provider absence is recoverable
- model licence and disk requirements are visible
- Linux, Windows, and macOS adapter behaviour is separately verified

## P4.4 — Migrate Strategy and Execution agents

Replace direct browser OpenAI coupling with provider-neutral services.

AI may:

- explain deterministic lever reasoning
- rewrite mission wording without changing the approved objective
- suggest questions for missing context

AI may not:

- select an unapproved lever outside the deterministic/manual contract
- overwrite revenue or logs
- publish, spend, delete, or access private accounts

## P4.5 — Optional Gemini and OpenAI adapters

### Deliverables

- user-owned credentials
- OS-backed secure storage
- explicit cloud-data disclosure
- provider/model test
- usage/cost warning
- replace/delete credential workflow
- same cancellation and fallback contract as Ollama

### Acceptance gate

- keys absent from SQLite, logs, exports, and frontend bundles
- ChatGPT/consumer subscriptions are not represented as API entitlement
- cloud failure never blocks deterministic operation

## P4.6 — AI audit ledger

Record for each AI result:

- agent contract/version
- provider/model
- context categories supplied
- deterministic source facts
- generated suggestion
- validation result
- fallback status
- user accepted/edited/rejected outcome
- resulting approved action reference

Do not record secret prompts or sensitive data beyond the approved audit contract.

# Phase 5 — Concept-to-End-User Intelligence

## Objective

Deliver the sophisticated operator journey without turning agents into autonomous authorities.

## P5.1 — Concept Intake Agent

Transforms an incomplete idea into a structured, reviewable concept:

- audience
- problem
- intended outcome
- asset or offer type
- constraints
- commercial purpose
- unknowns
- evidence needed

## P5.2 — Opportunity and Market-Gap Agent

- evaluates user-supplied and authorised evidence
- distinguishes demand evidence from speculation
- identifies saturation, underserved audiences, buyer objections, and differentiation
- does not invent market validation

## P5.3 — Offer Architect

- defines core offer, deliverables, licence, packaging, price assumptions, channel fit, derivative opportunities, and buyer result
- produces a human-approved offer specification, not an automatic listing

## P5.4 — Production Planner

- determines required creation tools, formats, dimensions, quality thresholds, resource class, review gates, and fallback route
- queries capability registry instead of assuming rendering support

## P5.5 — Buyer-Journey Agent

Reviews:

```text
discovery
→ comprehension
→ trust
→ decision
→ delivery
→ use
→ support
→ repeat value
```

It tests whether the promise, preview, licence, files, instructions, and delivery package form one honest experience.

## P5.6 — Quality and Compliance Inspector

Deterministic and specialist checks cover:

- schema completeness
- unsupported claims
- contradictions
- duplicate/near-duplicate risk
- format and package integrity
- licensing notices
- platform capability
- buyer clarity
- zero-tolerance content policy
- human review requirement

## P5.7 — Approved-learning loop

The system learns only from recorded, user-approved outcomes:

- what was suggested
- what the user changed
- what was executed
- what measurable outcome followed
- which lesson was approved for reuse

No model output becomes a permanent rule automatically.

# Phase 6 — Optional Rendering and Production Capability Boundary

## Objective

Connect production engines only when they satisfy the product and platform contract.

## P6.1 — Capability registry

A renderer or production tool declares:

- supported operating systems and architectures
- CPU/GPU requirements
- input/output contracts
- formats and colour handling
- cancellation/progress support
- memory/disk requirements
- licence
- deterministic fallback
- known tolerances

## P6.2 — Replaceable rendering adapter

The business workflow depends on a rendering contract, not a Linux-specific executable or library.

## P6.3 — Three-platform renderer verification

A renderer becomes part of supported ZCVIOS only after Linux, Windows, and macOS evidence covers:

- installation
- launch
- project compatibility
- output dimensions/formats
- font/colour behaviour
- cancellation
- resource limits
- failure recovery
- output equivalence within documented tolerances

A Linux-only renderer remains an experimental module and does not define the product.

# Phase 7 — Release Engineering and Supported Distribution

## P7.1 — Version and migration freeze candidate

- release candidate version
- schema/export/prompt-contract versions
- migration rehearsal
- compatibility matrix
- known-limitations record

## P7.2 — Signing and notarisation

- Linux package checksums/signing policy
- Windows code-signing preparation
- macOS signing and notarisation
- secret isolation and manual release gates

## P7.3 — Upgrade and rollback

- previous-supported-version fixtures
- upgrade preserves user data
- failed migration recovery
- backup before high-risk migration
- rollback instructions

## P7.4 — Update mechanism

Automatic updating is added only after signed release and rollback contracts are proven. It must never silently migrate or remove user data.

## P7.5 — Supported release gate

A release is labelled supported only when:

- deterministic product loop is complete
- privacy/export/delete/backup/import are verified
- supported-platform matrices pass
- no unresolved P0 or P1 defect remains
- AI remains optional
- minimum system requirements are documented
- installation and removal behaviour are documented
- release notes and changelog match the artifacts

## 10. Current critical path

At the establishment of this plan, the critical path is:

```text
P0.1 planning controls
→ P0.2 repository hygiene
→ P0.3 deterministic metric correctness
→ P0.4 date and currency contracts
→ P0.5 route atomicity and error integrity
→ P0.6 export/privacy portability
→ P0.7 domain/version/docs alignment
→ Phase 1 deterministic desktop workflows
```

AI, Windows/macOS package code, and rendering code must not displace this sequence.

## 11. Initial proposed PR sequence

Numbers are indicative and must follow the actual GitHub sequence.

1. **Planning control documents** — audit, master plan, ledger
2. **Repository hygiene and portable verification**
3. **Deterministic metric correctness**
4. **Date-only and currency contracts**
5. **Revenue/pause atomicity and typed errors**
6. **Versioned complete export and deletion verification**
7. **Lever/domain/version/document alignment**
8. **Shared desktop application-state boundary**
9. **Desktop work logging**
10. **Desktop weekly revenue history**
11. **Desktop deterministic weekly lever**
12. **Desktop daily mission**
13. **Desktop reports**
14. **Desktop export/backup/delete/import preparation**
15. **Browser/desktop parity audit**
16. **Windows unsigned test build**
17. **macOS unsigned test build**
18. **Provider-neutral AI contracts**
19. **Ollama adapter and resource governor**
20. **Sophisticated agent slices**

Each item may require more than one PR when the bounded acceptance gate demands it.

## 12. Progress reporting

After every meaningful change:

- update the milestone status in `PROGRESS_LEDGER.md`
- append a dated entry
- record PR and merge commit
- record verification actually performed
- record unresolved risks and next allowed action
- do not rewrite historical ledger entries; append corrections

## 13. Plan change rule

This plan may change when evidence changes, but changes require:

1. reason
2. affected dependencies
3. risk of changing versus not changing
4. updated acceptance gate
5. ledger decision entry

Do not silently reorder the programme inside an implementation PR.
