# AGENTS.md

Repository role: ZCVIOS-alpha is a web application/repo where stability, authentication correctness, privacy, and compliance matter more than broad rewrites.

Use this file as the compact coding source of truth for AI agents working in this repo.

## Core rules

- Preserve working behaviour before changing layout, structure, routes, auth, or data flow.
- Do not add visible UI, menu items, buttons, feature flags, or settings unless the full workflow exists: handler, data path, error handling, user feedback, logging where useful, and verification.
- Every name is a promise. Remove unused imports, variables, functions, and stale comments. Rename misleading code rather than explaining around it.
- Programming is controlled change. Before editing, identify state before, allowed change, state after, and what happens on failure.
- Keep functions coherent. A function should have one clear responsibility or be split.
- Data shape is the source of truth. Avoid duplicate authority fields and vague status strings. Make invalid states hard to represent.
- Prefer small, reversible changes. Do not perform sweeping refactors unless the task explicitly requires them.
- Do not hide complexity behind vague helpers such as `processData`, `handleThing`, or `doAction`.

## ZCVIOS-specific guardrails

- Treat auth/session code as high risk. Inspect existing route structure before changing auth files.
- Keep privacy-first behaviour. Do not introduce unnecessary tracking, secrets exposure, or server/client leakage.
- Follow New Zealand legal/compliance assumptions unless the repo has a more specific written rule.
- Do not add content or behaviour involving occult, obscene, hateful, grooming, criminal, or exploitative material.

## Workflow for agents

1. Inspect relevant files before editing.
2. State the intended workflow contract in code or docs when adding behaviour.
3. Make the smallest complete change that satisfies the task.
4. Run the narrowest useful verification first; then run broader checks when the change is meaningful.
5. Report changed files, verification performed, and any risk or follow-up.

## Verification ladder

- Documentation-only change: check Markdown clarity and links if relevant.
- TypeScript/route/UI change: run the existing lint/type/build command if present, normally `npm run build` for meaningful app changes.
- Auth, data, or deployment change: run build plus any targeted test or manual verification notes available in the repo.

Never leave dead UI, unverified workflow claims, or unexplained failing checks behind.
