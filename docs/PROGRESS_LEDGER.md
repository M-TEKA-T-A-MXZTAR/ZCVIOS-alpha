# ZCVIOS Progress Ledger

**Status:** Authoritative status and evidence record  
**Established:** 2026-07-01  
**Initial baseline commit:** `bbf8c002dd9d63c5cbdd5c20786898409c012e8b`  
**Build-order authority:** [Master Build Plan](MASTER_BUILD_PLAN.md)

## Purpose

This ledger records what ZCVIOS has actually completed, what is active, what is blocked, and what evidence supports each status.

The ledger is append-only in meaning:

- do not rewrite history to make the past appear cleaner
- append corrections and link them to the earlier entry
- source presence and PR prose are evidence of intent, not proof of verification
- record CI, local, persistence, package, and manual evidence separately
- update this ledger in every meaningful milestone PR

## Status vocabulary

| Status | Meaning |
|---|---|
| Proposed | Defined but not approved for active work |
| Active | Current bounded work is underway |
| Blocked | A named dependency prevents progress |
| Implemented | Source exists; full acceptance gate has not passed |
| Verified | Relevant acceptance evidence has passed |
| Merged | PR merged; workflow may still need verification |
| Test build | Controlled native artifact, not a supported release |
| Supported | Complete platform/release gate passed |
| Deferred | Intentionally postponed with reason |
| Superseded | Replaced but retained for history |

## Current checkpoint

| Field | Value |
|---|---|
| Audited main | `bbf8c002dd9d63c5cbdd5c20786898409c012e8b` |
| Latest merged milestone PR | #69 |
| Current main merge commit | `fd399eabc761a235e76d7dab1fad56016981fef1` |
| Active reliability PR | #70 — draft |
| Browser runtime | Operational alpha; reliability repair required |
| Desktop runtime | M8.1 operator baseline implemented; parity incomplete |
| Linux packaging | Debian/AppImage test-build capability |
| Windows packaging | Planned |
| macOS packaging | Planned |
| Desktop AI | Planned; no provider runtime implemented |
| Active critical path | P0.2 offline and reproducible root build |
| Supported public release | None |

## Historical milestone register

| PR | Milestone | Recorded result | Current classification |
|---:|---|---|---|
| #55 | Desktop migration foundation | Added migration, parity, ownership, and release plans | Merged |
| #56 | Core calculation extraction | Moved deterministic calculations toward pure TypeScript | Merged; correctness audit required |
| #57 | Workflow calculation extraction | Separated mission/report calculations | Merged; parity fixtures incomplete |
| #58 | Application repository boundaries | Introduced service/repository separation | Merged |
| #59 | Active profile identity | Added delivery-neutral profile contract | Merged |
| #60 | Tauri React shell | Added native window, navigation, error boundary, and folder action | Merged / Implemented |
| #61 | Desktop SQLite persistence | Added Rust adapter, migrations, local-owner, and tests | Merged / Verified foundation |
| #62 | Linux identity and package metadata | Added executable, GTK identity, icon, and verifier | Merged / Implemented |
| #63 | Linux test packages | Added `.deb`/AppImage build, inspection, launch, and persistence tests | Merged / Test build |
| #64 | Local operator baseline | Added schema v2, editable baseline, validation, and persistence coverage | Merged / Implemented |
| #65 | Local-first AI direction | Defined deterministic/Ollama/Gemini/OpenAI architecture | Merged / Planned architecture |
| #66 | Three-platform requirements | Defined Linux, Windows, and macOS product gates | Merged / Planned architecture |
| #67 | Unreadable AI-key resilience | Optional-key failure now falls back to deterministic operation | Merged; CI passed |
| #68 | Master build plan and progress ledger | Added audit, authoritative build order, ledger, and README links | Merged / P0.1 complete |
| #69 | Repository hygiene and test isolation | Added portable Python discovery, generated-file enforcement, and disposable integration databases | Merged / P0.2A complete |

## PR #67 evidence record

| Field | Record |
|---|---|
| Title | Handle unreadable stored OpenAI keys in mission and revenue RPC routes |
| Merge commit | `bbf8c002dd9d63c5cbdd5c20786898409c012e8b` |
| Final head | `fa0fc39a3d8ba84affc9f3e15f92204b49598e9d` |
| GitHub checks | Dependency review passed; `zcvios-ci` passed |
| Result | Deterministic mission/revenue flows survive unreadable optional-key ciphertext |
| Remaining risk | UI can still report a saved but unusable key; test mutates shared `dev.db`; bytecode files entered the PR |

## Current capability register

| Capability | Browser | Desktop | Status note |
|---|---|---|---|
| Operator baseline | Implemented | Implemented locally | Desktop M8.1 |
| Work logging | Add/list | Not implemented | Domain/date repair required first |
| Weekly revenue | Implemented | Baseline only | Desktop history planned |
| Weekly lever | Deterministic plus optional OpenAI | Not implemented | Metric/domain repair required |
| Daily mission | Template/AI/reset | Not implemented | Desktop M8.6 |
| Pause mode | Implemented with validation gap | Not implemented | Reliability repair required |
| Weekly/monthly reports | Implemented with confirmed metric defect | Not implemented | Blocked by P0.3 |
| Export | JSON but incomplete/unversioned | Not implemented | Blocked by P0.6 |
| Backup/import | Incomplete | Not implemented | Required before browser retirement |
| Local Ollama | Not implemented | Not implemented | Phase 4 |
| Gemini | Not implemented | Not implemented | Phase 4 |
| OpenAI | Direct legacy adapter | Not implemented | Provider-neutral migration planned |
| Linux packages | Not applicable | `.deb` and AppImage test builds | Test build |
| Windows packages | Not applicable | Not implemented | Planned |
| macOS packages | Not applicable | Not implemented | Planned |

## Audit finding register

Full analysis: [State-of-System Audit — 2026-07-01](STATE_OF_SYSTEM_AUDIT_2026-07-01.md)

| ID | Severity | Summary | Status | Target |
|---|---|---|---|---|
| AUD-001 | P1 | Reports fabricate one hour when none is logged | Proposed | P0.3 |
| AUD-002 | P1 | Focused-work category definition conflicts | Decision required | P0.3/P0.7 |
| AUD-003 | P1 | Revenue save and strategy calculation are not atomic | Proposed | P0.5 |
| AUD-004 | P1 | Date-only/time-zone/DST contract is unsafe | Proposed | P0.4 |
| AUD-005 | P2 | Past custom pause dates accepted | Proposed | P0.5 |
| AUD-006 | P1 | Export omits an owned record | Proposed | P0.6 |
| AUD-007 | P2 | Catch-all responses misreport failures | Proposed | P0.5 |
| AUD-008 | P2 | Unusable saved AI key lacks health state | Proposed | P0.5 |
| AUD-009 | P2 | Browser AI is provider-specific | Deferred | Phase 4 |
| AUD-010 | P1 | Documents say six levers; code defines eight | Decision required | P0.7 |
| AUD-011 | P1 | Multiple plans claim authority | Resolved by PR #68 | P0.1 |
| AUD-012 | P1 | Browser/desktop authority is unclear | Partially resolved by PR #68 | P0.1/P0.7 |
| AUD-013 | P2 | Product/package versions conflict | Proposed | P0.7 |
| AUD-014 | P1 | Root tests use a machine-specific Python path | Resolved by PR #69 | P0.2 |
| AUD-015 | P1 | Ignore rules malformed; bytecode tracked | Resolved by PR #69 | P0.2 |
| AUD-016 | P1 | Regression test mutates shared `dev.db` | Resolved by PR #69 | P0.2 |
| AUD-017 | P2 | Root CI policy is costly and inconsistent | Proposed follow-up | P0.2 |
| AUD-018 | P2 | Toolchain and Prisma versions drift | Proposed | P0.2/P0.7 |
| AUD-019 | P2 | Remote fonts weaken reproducible/offline builds | Active in PR #70 | P0.2 |
| AUD-020 | P1 | Currency and locale are not authoritative data | Decision required | P0.4 |
| AUD-021 | P2 | Work logs are not full CRUD | Proposed | P0.7/P1.3 |
| AUD-022 | P2 | Projection language risks predictive claims | Proposed | P0.3 |
| AUD-023 | P2 | Export has no schema/application version | Proposed | P0.6 |
| AUD-024 | P3 | Public description/topics are stale | Proposed | P0.7 |
| AUD-025 | P2 | Changelog/release notes omit desktop programme | Proposed | P0.7 |

## Decision register

| ID | Decision | Status |
|---|---|---|
| DEC-001 | Desktop is the intended primary delivery target | Approved |
| DEC-002 | Browser remains a temporary behavioural reference until parity/import/rollback proof | Approved |
| DEC-003 | Deterministic mode is mandatory and authoritative | Approved |
| DEC-004 | Linux, Windows, and macOS are equal intended targets | Approved |
| DEC-005 | Provider order: Off → Ollama → Gemini → OpenAI | Approved as planned architecture |
| DEC-006 | Do not silently bundle/install Ollama or model weights | Approved |
| DEC-007 | One bounded outcome per PR | Approved |
| DEC-008 | Do not label a platform Supported without complete native evidence | Approved |
| DEC-009 | Master plan controls order; progress ledger controls status | Approved by merged PR #68 |

## Active queue

| Order | Work item | Status | Exit condition |
|---:|---|---|---|
| 1 | P0.1 planning controls | Merged / complete | Audit, plan, ledger linked and merged |
| 2 | P0.2 repository hygiene and reproducible verification | Active — PR #70 second bounded slice | Offline-safe root build, followed by separately bounded CI and toolchain work |
| 3 | P0.3 metric correctness | Blocked by P0.2 | Zero/missing/focused metric fixtures pass |
| 4 | P0.4 date/currency contracts | Blocked by P0.3 decisions | Date/time-zone/currency fixtures pass |
| 5 | P0.5 route atomicity/errors | Blocked | Partial-failure and typed-error tests pass |
| 6 | P0.6 export/privacy portability | Blocked | Complete versioned export/deletion proof |
| 7 | P0.7 domain/version/docs alignment | Blocked | No authoritative contradictions |
| 8 | Phase 1 desktop workflows | Blocked by Phase 0 | Deterministic desktop loop complete |

## Initial ledger entries

### LED-2026-07-01-001 — State audit initiated

- **Status before:** No single current repository-wide audit
- **Change:** Inspected PR #67, metadata, core/browser/desktop paths, workflows, documents, packaging, AI, and platform plans
- **Status after:** 25 findings classified
- **Unresolved risk:** Source inspection and CI evidence do not replace local executable testing
- **Next allowed action:** Complete planning-control documents

### LED-2026-07-01-002 — PR #67 evidence corrected

- **Status before:** PR prose suggested build/core checks remained blocked
- **Correction:** Final PR head shows dependency review and `zcvios-ci` success
- **Status after:** Stale local notes are separated from final GitHub evidence
- **Next allowed action:** Repair portability and test isolation separately

### LED-2026-07-01-003 — Metric defect recorded

- **Finding:** Weekly/monthly report code substitutes one hour when no focused hours exist
- **Status after:** AUD-001 registered as P1 confirmed defect
- **Next allowed action:** P0.3 after P0.2 makes verification reproducible

### LED-2026-07-01-004 — Planning authority established on branch

- **Status before:** Multiple plans could compete for build order
- **Change:** Added state audit, master build plan, and progress ledger on `docs/master-build-plan-ledger`
- **Status after:** P0.1 Active pending review and merge
- **Next allowed action:** Link documents from README, review documentation-only diff, open draft PR

### LED-2026-07-01-005 — Planning-control PR opened

- **Milestone:** P0.1
- **Change:** Opened draft PR #68, `Establish master build plan and progress ledger`
- **PR head before this ledger update:** `ad83a4a9b224d74a44e43e40765348f515a90f5d`
- **Scope evidence:** Three new control documents and README links only
- **Status after:** Active / draft review
- **Unresolved risk:** Documentation requires review; no runtime defect is fixed by this PR
- **Next allowed action:** Inspect PR checks and review comments once, then repair documentation findings only

### LED-2026-07-01-006 — Planning controls merged

- **Milestone:** P0.1
- **Status before:** PR #68 active
- **Change:** PR #68 merged
- **PR / commit:** #68 / `438a82a48490651d5d4e7f7e54039e81b72c6d7e`
- **Verification performed:** GitHub merge state confirmed; four-document scope retained
- **Status after:** P0.1 Merged / complete
- **Unresolved risk:** Planning documents describe, but do not themselves fix, runtime defects
- **Next allowed action:** Begin P0.2 repository hygiene and reproducible verification

### LED-2026-07-01-007 — Repository hygiene slice opened

- **Milestone / audit IDs:** P0.2; AUD-014, AUD-015, AUD-016
- **Status before:** P0.2 blocked by planning controls
- **Change:** Opened draft PR #69, `Repair repository hygiene and isolate integration tests`
- **PR / branch:** #69 / `fix/repository-hygiene-portable-tests`
- **Verification requested:** repository hygiene verifier, deterministic checks, isolated Prisma migration/seed/build, portable `npm test`, dependency review
- **Status after:** P0.2 Active — first bounded slice
- **Unresolved risk:** Offline font build, CI cost policy, and toolchain alignment remain separate P0.2 follow-ups
- **Next allowed action:** Inspect PR #69 checks and review findings; fix only this slice before merge

## Entry template

```markdown
### LED-YYYY-MM-DD-NNN — <title>

- **Milestone / audit IDs:**
- **Status before:**
- **Change:**
- **PR / commit:**
- **Verification performed:**
- **Status after:**
- **Unresolved risk:**
- **Next allowed action:**
```

## Correction template

```markdown
### COR-YYYY-MM-DD-NNN — Correction to <entry ID>

- **Original statement:**
- **Corrected statement:**
- **Reason / evidence:**
- **Effect on plan or status:**
```

### LED-2026-07-01-008 — PR #69 review defects accepted for repair

- **Milestone / audit IDs:** P0.2; AUD-014, AUD-015, AUD-016
- **Status before:** PR #69 draft review found unresolved defects in the first repository-hygiene slice
- **Change:** Copilot review identified three valid follow-up defects: Python discovery only checked executable availability instead of Python 3 capability; the repository-hygiene verifier did not cover every generated artifact it claimed to guard; and the README instructed local Prisma users to rely on `.env.local`, which Prisma CLI does not reliably consume as its root database configuration
- **PR / commit:** #69 / review follow-up pending repair commit
- **Verification performed:** Review threads inspected; branch scope compared with `origin/main`; all three findings accepted for repair
- **Status after:** PR #69 remains unmerged and pending verification after the accepted review repairs
- **Unresolved risk:** Final local verification and post-fix review evidence still required before merge readiness can be claimed
- **Next allowed action:** Apply the narrow repairs, rerun required verification, and report the resulting evidence without widening scope

### LED-2026-07-02-009 — Repository hygiene slice merged

- **Milestone / audit IDs:** P0.2A; AUD-014, AUD-015, AUD-016
- **Status before:** PR #69 remained pending after accepted review repairs
- **Change:** The narrow review repairs were completed and PR #69 merged without widening the repository-hygiene and test-isolation scope
- **PR / commit:** #69 / `fd399eabc761a235e76d7dab1fad56016981fef1`; final head `843c1c9058cd1d7c392ee23513611fe523965f9e`
- **Verification performed:** Dependency review, `zcvios-desktop-shell-ci`, `zcvios-ci`, and `zcvios-linux-package-ci` all completed successfully on the final PR head
- **Status after:** P0.2A Merged / complete; AUD-014, AUD-015, and AUD-016 resolved
- **Unresolved risk:** AUD-019, AUD-017, and AUD-018 remain separate bounded P0.2 follow-ups
- **Next allowed action:** Begin P0.2B offline and reproducible root-build work for AUD-019

### LED-2026-07-02-010 — Offline and reproducible root-build slice opened

- **Milestone / audit IDs:** P0.2B; AUD-019
- **Status before:** PR #69 is merged; the browser root still imports Google-hosted fonts through `next/font/google`; the current checkpoint had not yet recorded the PR #69 merge
- **Change:** Created `fix/offline-reproducible-root-build`, removed the remote font helper, introduced system-font stacks, added focused static verification, and opened draft PR #70
- **PR / branch:** #70 / `fix/offline-reproducible-root-build`
- **Verification performed:** Confirmed `main` equals PR #69 merge commit; confirmed no open PR preceded #70; verified the new static checker against an isolated local fixture; branch diff remained within root typography, verification wiring, and this ledger
- **Status after:** P0.2B Active / draft review
- **Unresolved risk:** Full repository hygiene, core, lint, and production-build checks remain pending; a production build without external network access has not yet been proven
- **Next allowed action:** Inspect PR #70 checks and review findings, repair only AUD-019 or ledger defects, and do not claim offline-build verification unless it is actually performed

### COR-2026-07-02-011 — Correction to LED-2026-07-02-010

- **Original statement:** The new static checker was verified against an isolated local fixture.
- **Corrected statement:** No independent local-fixture execution was recorded. GitHub Actions `Build & Verify` on implementation head `a0c05e9ef8566c544be528591d6e6adfd955b1c6` successfully ran `npm run test:core`, including `verify:offline-fonts`, followed by lint and the production build.
- **Reason / evidence:** Verification records must distinguish actual GitHub execution from unrecorded local claims.
- **Effect on plan or status:** P0.2B remains Active. The source verifier and ordinary production build have CI evidence, while a production build with external network access disabled remains unverified.
