# Architecture Principles

## Purpose

ZC-VIOS is designed as a privacy-first planning and workflow measurement workspace for solo creators, small business owners, and independent operators.

The architecture should remain simple, inspectable, and user-controlled.

The system should help users:

- measure time and revenue signals,
- review workflow consistency,
- identify one practical weekly focus,
- generate clear daily missions,
- and improve creator-business execution over time.

ZC-VIOS is not intended to control private accounts, collect credentials, bypass platform rules, or guarantee financial outcomes.

---

## 1. Local-First Core

Core functionality should work without external AI services or third-party platform connections.

The local-first core should support:

- deterministic weekly lever recommendations,
- template-based daily mission generation,
- work log entry,
- revenue entry,
- user settings,
- and basic reporting.

External services may be added later as optional enhancements, but the core system should remain useful without them.

---

## 2. User-Controlled Data

The user should remain in control of their business data.

The system should not request or store:

- passwords,
- payment credentials,
- recovery codes,
- private platform tokens,
- private messages,
- or restricted account data.

Any business information used by the system should come from:

- user-entered records,
- uploaded files the user chooses to provide,
- public information the user is authorized to review,
- or optional integrations explicitly configured by the user.

---

## 3. Deterministic Fallback

AI assistance must never be required for basic operation.

If an optional AI provider is not configured, unavailable, or returns an error, the system should fall back to deterministic logic.

This protects the user from:

- service outages,
- unexpected API costs,
- incomplete responses,
- vendor lock-in,
- and workflow interruption.

---

## 4. Explainable Recommendations

ZC-VIOS should not simply tell the user what to do.

It should explain why a recommendation was made using clear business signals such as:

- Effective Hourly Rate trend,
- logged hours,
- revenue entries,
- execution consistency,
- selected weekly lever,
- and user-provided business context.

Recommendations should be treated as decision support, not commands.

The user remains responsible for choosing what action to take.

---

## 5. One Lever at a Time

The system should reduce scattered effort.

Each weekly plan should focus on one primary business lever:

- Distribution
- Conversion
- Pricing
- Traffic
- Retention
- Automation

This keeps the system practical and helps the user avoid overloading themselves with too many simultaneous priorities.

---

## 6. No Hidden Account Access

ZC-VIOS should not perform hidden account access or private account actions.

The system should not:

- request login credentials,
- impersonate the user,
- bypass platform protections,
- scrape restricted areas,
- send spam,
- or make private account changes without explicit user action.

Any future platform connection must be optional, clearly disclosed, user-authorized, and compliant with the relevant platform rules.

---

## 7. Modular, Not Monolithic

The system should be built from clear modules.

Suggested module categories:

- planning,
- work logging,
- revenue tracking,
- reporting,
- mission generation,
- optional AI assistance,
- public-page review,
- and export/import workflows.

Modules should be replaceable where practical, so the project can evolve without becoming brittle.

---

## 8. Privacy-First Public Review

If public web presence review is added or expanded, it should be limited to user-provided URLs and publicly visible information.

The purpose of public review should be practical improvement, such as:

- clearer product positioning,
- stronger listing descriptions,
- better keyword alignment,
- improved buyer clarity,
- and better workflow prioritization.

It should not be used for credential collection, unauthorized scraping, deceptive marketing, or platform abuse.

---

## 9. Honest Scope

Documentation should separate:

- implemented features,
- alpha-stage features,
- planned features,
- and experimental ideas.

This matters for trust.

The project should avoid wording that implies finished capability where the feature is still exploratory.

---

## 10. User Export and Deletion

Where user data is stored, the system should support clear export and deletion paths.

Users should be able to understand:

- what data is stored,
- where it is stored,
- how to export it,
- and how to remove it.

This principle supports transparency, portability, and user trust.

---

## 11. Responsible Automation

Automation should help users reduce repetitive work while keeping them in control.

Automation should not be used to:

- mislead customers,
- mass-produce spam,
- bypass rules,
- create deceptive listings,
- or make unsupported financial claims.

The system should encourage review before publishing or acting on generated recommendations.

---

## 12. Stable Foundation Before Expansion

The project should prioritize a stable, useful core before adding broad integrations.

Recommended order:

1. Local planning and measurement
2. Work log and revenue tracking
3. Weekly lever recommendations
4. Daily mission generation
5. Reports and export tools
6. Optional AI assistance
7. Optional public-page review
8. Optional user-authorized integrations

This keeps the project credible, testable, and easier to maintain.
