# ZC-VIOS Core v1.1.1-alpha

## Privacy-First Creator Workflow and Planning Workspace

Open-source planning and measurement workspace designed to help solo creators structure design-to-commerce operations.

ZC-VIOS helps creators organize workflow data, review progress, review useful progress, and choose clearer next actions. It is intended for practical planning, local development, and creator-business decision support.

> **Alpha disclaimer:** This repository is an alpha template focused on core engine stability, reproducible local development, and transparent documentation.

## Privacy-first positioning

ZC-VIOS is designed as a user-controlled planning tool.

It does not collect passwords, payment credentials, recovery codes, private platform tokens, or private account data. Core functionality works locally with deterministic logic. External AI features are optional, user-configured, and not required for basic operation.

Any public-page review or storefront analysis should be user-initiated and limited to information the user is authorized to provide or publicly visible information.

## AI runtime direction

The desktop AI runtime is **planned, not implemented**.

ZC-VIOS will continue to work with AI disabled. The planned provider order is:

1. deterministic mode — default and always available
2. local Ollama — preferred optional path with no per-request cloud API charge
3. Gemini API — optional bring-your-own-key provider
4. OpenAI API — optional bring-your-own-key provider

ZC-VIOS should bake in provider detection, safety controls, and guided setup rather than bundling Ollama binaries or model weights inside the application installer. Users will deliberately install Ollama and select a model appropriate for their hardware. No model should be downloaded silently.

A practical initial local text-model baseline is `llama3.2:3b`, with a smaller model available for lower-resource systems. The final implementation must detect available resources and installed models instead of assuming one machine profile.

Cloud API keys must not be stored in the SQLite business database, frontend bundle, logs, or exports. API access and billing remain separate from ordinary ChatGPT or Google account subscriptions.

See [Local-First AI Runtime Plan](docs/LOCAL_AI_RUNTIME.md) for provider, installation, privacy, resource-governor, and cross-platform requirements.

The AI plan covers text decision support. Visual rendering, image generation, mockups, patterns, and vector workflows remain separate modules with their own hardware and Windows/macOS compatibility gates.

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

- Deterministic mode works without any AI key.
- The current browser implementation may expose optional provider configuration, but the desktop local-AI adapter is not implemented yet.
- Future Gemini and OpenAI support will require user-owned API credentials and explicit cloud-data consent.
- A ChatGPT subscription does not provide OpenAI API usage.
- Local Ollama will require a separate user-controlled Ollama installation and model download.

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
- [Local-First AI Runtime Plan](docs/LOCAL_AI_RUNTIME.md) - Planned Ollama, Gemini, and OpenAI provider boundaries
- [ZC-VIOS Lore](docs/ZCVIOS_LORE.md) - Vision and philosophy behind the system
- [ZCcode Language](docs/ZCCODE_LANGUAGE.md) - Structured prompting language for system design
- [Roadmap](docs/ROADMAP.md) - Current status and future direction
- [v1.2.0 Execution Plan](docs/V1_2_0_EXECUTION_PLAN.md) - Next milestone deliverables
- [v1.2.0 Work Queue](docs/V1_2_0_WORK_QUEUE.md) - Implementation planning
- [Support](docs/SUPPORT.md) - How to support development

## License

MIT
