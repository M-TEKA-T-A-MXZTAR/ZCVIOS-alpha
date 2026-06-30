# System Overview

## Project Purpose

ZC-VIOS Core is a privacy-first creator workflow and planning workspace designed for solo operators and small business owners.

The system helps users focus on one practical business priority per week, track useful progress, and make clearer decisions about where to invest limited time.

The core philosophy:

> One lever per week. One mission per day. Measured against useful progress.

ZC-VIOS is intended as a user-controlled planning workspace. It does not collect passwords, payment credentials, recovery codes, or private platform tokens. Core functionality can run with deterministic logic, and AI-assisted features are optional.

## System Components

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Lever** | One of six business focus areas: Distribution, Conversion, Pricing, Traffic, Retention, Automation |
| **Progress metric** | A private planning signal comparing useful outcome value with focused work time |
| **Weekly Plan** | Rule-based or user-selected lever for the week |
| **Daily Mission** | Specific task derived from the active lever |
| **Work Log** | Time entries categorized by activity type |

### The Six Levers

1. **Distribution** - Getting your offer in front of more people
2. **Conversion** - Improving the rate at which prospects become customers
3. **Pricing** - Reviewing revenue per transaction and pricing assumptions
4. **Traffic** - Increasing the volume of relevant potential customers
5. **Retention** - Improving repeat value, follow-up quality, and long-term customer usefulness
6. **Automation** - Reducing time spent on recurring tasks while keeping the user in control

## Planned AI Runtime

The desktop AI runtime is planned for a later milestone after deterministic parity. It is not part of the current desktop implementation.

The provider-neutral design will support:

| Mode | Role | Network requirement |
|---|---|---|
| **Off / deterministic** | Authoritative calculations, template missions, reports, and fallback | None |
| **Local Ollama** | Optional private explanations, rewriting, and summaries | Loopback-only local API by default |
| **Gemini API** | Optional cloud assistance using a user-owned key | Explicit cloud request |
| **OpenAI API** | Optional cloud assistance using a user-owned key | Explicit cloud request |

The recommended approach is to bundle the integration contract and guided setup, not the Ollama application or model weights. Users install Ollama separately and choose a model suitable for their hardware. The first practical local text-model baseline under consideration is `llama3.2:3b`, with a smaller fallback for low-resource systems.

AI may explain or reword deterministic results, but it may not become authoritative for revenue calculations, persistence, permissions, publishing, spending, or account access.

Cloud keys must use secure desktop secret storage rather than the SQLite business database, source code, logs, or exports.

See [Local-First AI Runtime Plan](LOCAL_AI_RUNTIME.md).

## Rendering Boundary

ZCVIOS AI assistance is a text decision-support capability. Image generation, mockup creation, pattern rendering, vector generation, and related production engines are separate modules.

Windows and macOS rendering support must be verified independently. Rendering uncertainty must not block the local planning core or the platform-neutral text-provider interface.

## Next.js App Structure

```text
src/app/
├── layout.tsx              # Root layout
├── global-error.tsx        # Error boundary
├── page.tsx                # Landing page
├── login/                  # Authentication
├── register/
├── (app)/                  # Authenticated route group
│   ├── layout.tsx          # SessionProvider wrapper
│   ├── dashboard/          # Main dashboard
│   ├── settings/           # User settings and optional API configuration
│   ├── logs/               # Work session logging
│   ├── revenue/            # Weekly revenue entry
│   ├── onboarding/         # New user setup
│   └── reports/
│       ├── weekly/         # Weekly progress report
│       └── monthly/        # Monthly trend report
└── rpc/                    # API routes
    ├── mission/            # Daily mission generation
    ├── revenue/            # Revenue CRUD
    ├── logs/               # Work log CRUD
    ├── lever-override/     # Manual lever selection
    └── reports/            # Report data endpoints
```
