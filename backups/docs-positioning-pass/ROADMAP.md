# Roadmap

## Current Stable

**v1.1.1-alpha**  
**Status:** Early alpha foundation

### What was stabilized

- CI/build pipeline restructured into separate Build and Integration Test jobs
- Next.js prerender failures resolved for global-error boundary
- Authenticated pages moved under `(app)` route group with scoped SessionProvider
- Root layout simplified to minimal implementation
- Documentation updated to better match the current codebase state

### Core features operational

- Email/password authentication
- Weekly lever recommendation using deterministic logic and optional AI assistance
- Daily mission generation
- Work session logging
- Weekly and monthly EHR reports
- Privacy controls, including data export and account deletion

---

## Current Project Positioning

ZC-VIOS is a privacy-first planning and workflow measurement workspace for solo creators, small business owners, and independent operators.

The system is intended to help users:

- review work and revenue signals,
- choose one weekly business lever,
- generate practical daily missions,
- measure Effective Hourly Rate,
- and improve execution consistency over time.

ZC-VIOS is not intended to collect passwords, payment credentials, recovery codes, private platform tokens, or restricted account data.

---

## Next Milestone

**v1.2.0 — Creator Engine Foundations**

### Planned work

- Refine strategy selection logic based on real usage patterns
- Improve mission quality for each lever type
- Add clearer week-over-week comparison in reports
- Strengthen test coverage for edge cases
- Improve report-generation performance
- Improve user-facing explanations for why a lever was recommended

### Documentation work

- Keep feature descriptions aligned with implemented functionality
- Clearly label experimental concepts
- Keep privacy and responsible-use language visible
- Improve onboarding text for non-technical users

### Under consideration

- CSV export for work logs
- Dark mode toggle
- Better local reporting summaries
- Improved manual import/export workflows
- Optional public-page review for user-provided URLs and publicly visible information

---

## Future Direction

**Creator Planning Workspace — Longer-Term Vision**

### Potential areas of exploration

- Multi-user support for small teams
- Optional user-authorized import/export workflows for revenue records
- Historical EHR trend review
- Mobile-optimized interface for daily logging
- Public-page review for user-provided storefront or product URLs
- Plugin-style extensions that remain optional, transparent, and user-controlled

### Guardrails for future work

Future work should remain aligned with these principles:

- One lever per week remains the core constraint
- EHR remains the main measurement signal
- Deterministic mode always works without external AI dependencies
- Privacy controls remain first-class features
- No credential collection
- No hidden private account access
- No unauthorized scraping
- No gamification or shame-based motivation
- No guaranteed-income claims
- User review remains required before publishing, spending money, or changing business strategy

---

## Integration Policy

Any future integration must be:

- optional,
- clearly disclosed,
- user-authorized,
- compliant with the relevant platform rules,
- removable by the user,
- and unnecessary for the core local workflow.

The core product should remain useful without external integrations.

---

## Contributing to the Roadmap

Feature suggestions are welcome.

Open an issue using the feature request template.

Prioritization considers:

- alignment with the core philosophy,
- user benefit,
- privacy impact,
- implementation complexity,
- maintenance burden,
- and whether the feature keeps the user in control.
