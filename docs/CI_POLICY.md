# ZCVIOS Continuous-Integration Policy

**Status:** Active repository policy  
**Established:** 2026-07-02  
**Scope:** GitHub Actions verification and cost control

## Purpose

ZCVIOS CI must provide trustworthy pull-request evidence without running duplicate full builds or allowing unbounded, stale, or mutable third-party workflow execution.

## Root verification policy

The root `zcvios-ci` workflow:

- runs for pull requests
- may be started manually with `workflow_dispatch`
- does not also run on every branch push, avoiding duplicate push-plus-PR executions
- cancels stale runs for the same pull request or manually selected ref
- uses a bounded job timeout
- installs npm and Python dependencies once
- performs one production build
- preserves separate disposable build and integration SQLite databases
- starts the built application and runs the integration suite in the same bounded job
- retains read-only repository permissions

The root workflow is intentionally not path-filtered while it is a required repository-wide gate. This avoids leaving required checks pending on documentation or cross-boundary changes. More selective required-check architecture may be introduced only with corresponding branch-protection evidence.

## Dependency-review policy

Dependency review:

- runs only for pull requests targeting `main`
- cancels stale runs for the same pull request
- uses a bounded timeout
- keeps only the permissions needed to read repository content and publish the configured PR summary
- pins checkout and dependency-review actions to full commit SHAs

It is not manually dispatched because its comparison contract depends on pull-request dependency snapshots.

## Desktop and packaging workflows

Desktop-shell and Linux package workflows remain separately bounded. Expensive package generation should stay path-filtered and manually dispatchable. Those workflows must not be folded into routine root verification merely to produce a broader green check.

## Action pinning

External actions must use immutable full commit SHAs. Human-readable major-version comments may accompany the SHA, but movable tags such as `@v4` are not sufficient on their own.

When updating an action:

1. resolve the intended official release tag to its current commit
2. inspect the upstream release and repository
3. replace the full SHA deliberately
4. retain or update the readable version comment
5. run the CI policy verifier and affected workflow

## Cost-control rules

- no simultaneous push and pull-request trigger for the same routine root gate
- no duplicate production build in one root workflow run without a recorded reason
- no scheduled heavy package workflow unless explicitly approved
- stale runs should be cancelled
- every job must have a timeout
- package artifacts must remain short-lived unless a release milestone requires otherwise
- manual dispatch is preferred for expensive or exceptional verification

## Verification

Run:

```bash
npm run verify:ci-policy
```

The verifier checks root trigger policy, concurrency cancellation, job timeouts, immutable action pins, one npm installation, one production build, and separate disposable build/integration databases.

## Exclusions

This policy does not decide:

- supported Node, Python, Rust, Prisma, React, or operating-system versions
- package signing or release publication
- Windows or macOS workflow implementation
- business-rule or application-feature acceptance

Those remain separate milestones, including AUD-018 toolchain alignment.
