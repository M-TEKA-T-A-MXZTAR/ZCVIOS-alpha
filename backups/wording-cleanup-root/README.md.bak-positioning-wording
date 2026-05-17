# ZC-VIOS Core v1.1.1-alpha

## ## Privacy-First Creator Workflow and Revenue Planning Engine

Open-source planning and measurement workspace designed to help solo creators structure design-to-commerce operations.

ZC-VIOS helps creators organize workflow data, review progress, estimate effective hourly return, and choose clearer next actions. It is intended for practical planning, local development, and creator-business decision support.

> **Alpha disclaimer:** This repository is an alpha template focused on core engine stability, reproducible local development, and transparent documentation.

## Privacy-first positioning

ZC-VIOS is designed as a user-controlled planning tool.

It does not collect passwords, payment credentials, recovery codes, private platform tokens, or private account data. Core functionality works locally with deterministic logic. External AI features are optional, user-configured, and not required for basic operation.

Any public-page review or storefront analysis should be user-initiated and limited to information the user is authorized to provide or publicly visible information.

## Architecture

- **Framework:** Next.js 16 (App Router) full-stack (API routes in `src/app/rpc/*`)
- **Database:** SQLite (Prisma ORM)
- **Auth:** NextAuth (email/password)
- **Route structure:** Authenticated pages under `(app)` route group with scoped SessionProvider

### App structure

```txt
src/app/
├── layout.tsx              # Minimal root layout (no providers)
├── global-error.tsx        # Minimal error boundary
├── page.tsx                # Landing page
├── login/                  # Public auth pages
├── register/
└── (app)/                  # Authenticated route group
    ├── layout.tsx          # SessionProvider wrapper
    ├── dashboard/
    ├── settings/
    ├── logs/
    ├── revenue/
    ├── onboarding/
    └── reports/
        ├── weekly/
        └── monthly/
```

## Local setup

1. Install dependencies
```bash
npm install
```

2. Create local environment file
```bash
cp .env.example .env.local
```

3. Generate Prisma client
```bash
npx prisma generate
```

4. Run database migrations
```bash
npx prisma migrate deploy
```

5. Seed demo data
```bash
npm run seed
```

6. Start development server
```bash
npm run dev
```

Open: `http://localhost:3000`

**Demo account:**
- Email: `demo@zcvios.local`
- Password: `DemoPass123!`

## Environment variables

Defined in `.env.example`:

```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Notes:**
- Deterministic mode works without OpenAI key
- OpenAI is optional (BYO key per user in Settings)

## Verification

```bash
npm run lint      # ESLint
npm run build     # Production build
npm run test      # Integration tests (requires app running)
```

## CI workflow

The GitHub Actions workflow runs two jobs:

1. **Build & Verify** - Install, migrate, seed, lint, build
2. **Integration Tests** - Python pytest suite against running app (requires Build to pass)

## Documentation

- [System Overview](docs/SYSTEM_OVERVIEW.md) - Architecture, components, and engine concepts
- [Product Thesis](docs/PRODUCT_THESIS.md) - Core user, problem, and promise
- [Architecture Principles](docs/ARCHITECTURE_PRINCIPLES.md) - Design principles for development
- [ZC-VIOS Lore](docs/ZCVIOS_LORE.md) - Vision and philosophy behind the system
- [ZCcode Language](docs/ZCCODE_LANGUAGE.md) - Structured prompting language for system design
- [Roadmap](docs/ROADMAP.md) - Current status and future direction
- [v1.2.0 Execution Plan](docs/V1_2_0_EXECUTION_PLAN.md) - Next milestone deliverables
- [v1.2.0 Work Queue](docs/V1_2_0_WORK_QUEUE.md) - Implementation planning
- [Support](docs/SUPPORT.md) - How to support development

## License

MIT
