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
- Weekly and monthly progress reports
- Privacy controls, including data export and account deletion

---

## Current Project Positioning

ZC-VIOS is a privacy-first planning and workflow measurement workspace for solo creators, small business owners, and independent operators.

The system is intended to help users:

- review work and revenue signals,
- choose one weekly business lever,
- generate practical daily missions,
- measure useful progress per focused session,
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

## Desktop Migration Workstream

ZCVIOS is planned to move from a browser-delivered Next.js application to an installable local-first desktop application through small, reversible milestones.

The current browser application remains operational during migration. It will not be retired until desktop feature parity, data migration, installer upgrades, export, backup, and deletion have been verified.

Desktop planning documents:

- [Desktop Migration Plan](DESKTOP_MIGRATION_PLAN.md)
- [Desktop Feature-Parity Matrix](DESKTOP_FEATURE_PARITY_MATRIX.md)
- [Desktop Data Ownership and Lifecycle](DESKTOP_DATA_OWNERSHIP.md)
- [Desktop Installer and Release Plan](DESKTOP_INSTALLER_PLAN.md)

Initial desktop packaging targets:

- Debian package (`.deb`) as the primary Ubuntu installer
- AppImage as the portable Linux fallback
- unsigned Windows and macOS test packages in later controlled portability milestones

The desktop workstream must not displace the creator-engine priorities by combining unrelated feature expansion with migration work. Each implementation PR should address one bounded architectural or workflow milestone.

---

## Optional AI Runtime Workstream

The desktop AI runtime is planned only after the deterministic product loop has been restored and verified.

The required sequence is:

1. local operator baseline
2. focused work logging
3. weekly revenue history
4. deterministic weekly lever
5. template daily mission
6. weekly review and export
7. provider-neutral AI contract
8. local Ollama detection and text generation
9. optional Gemini and OpenAI adapters
10. Windows and macOS provider verification

The planned provider order is:

- **Off / deterministic** — default and always available
- **Local Ollama** — preferred optional provider
- **Gemini API** — optional bring-your-own-key cloud provider
- **OpenAI API** — optional bring-your-own-key cloud provider

ZCVIOS will bundle provider integration and guided setup, not Ollama binaries or model weights. Users must deliberately install Ollama and choose a model suitable for their hardware. A practical initial local text-model baseline is `llama3.2:3b`, with a smaller fallback for lower-resource systems.

The AI runtime must include:

- one request at a time
- visible working and cancellation states
- conservative resource modes
- loopback-only local connections by default
- secure cloud-key storage outside SQLite
- explicit cloud-data consent
- deterministic fallback when a provider fails
- no silent model installation or download

See [Local-First AI Runtime Plan](LOCAL_AI_RUNTIME.md).

Rendering engines are outside this workstream. Image generation, mockups, patterns, vectors, and similar production capabilities require separate hardware and Windows/macOS verification.

---

## Future Direction

**Creator Planning Workspace — Longer-Term Vision**

### Potential areas of exploration

- Multi-user support for small teams
- Optional user-authorized import/export workflows for revenue records
- Historical progress trend review
- Mobile-optimized interface for daily logging
- Public-page review for user-provided storefront or product URLs
- Plugin-style extensions that remain optional, transparent, and user-controlled

### Guardrails for future work

Future work should remain aligned with these principles:

- One lever per week remains the core constraint
- useful progress remains the main measurement signal
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
