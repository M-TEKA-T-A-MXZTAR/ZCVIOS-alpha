# System Overview

## Project Purpose

ZC-VIOS Core is a revenue-per-hour planning and workflow measurement system designed for solo operators and small business owners.

The system helps users focus on one practical business priority per week, track their Effective Hourly Rate (EHR), and make clearer decisions about where to invest limited time.

The core philosophy:

> One lever per week. One mission per day. Measured against your own EHR.

ZC-VIOS is intended as a user-controlled planning workspace. It does not collect passwords, payment credentials, recovery codes, or private platform tokens. Core functionality can run with deterministic logic, and AI-assisted features are optional.

## System Components

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Lever** | One of six business focus areas: Distribution, Conversion, Pricing, Traffic, Retention, Automation |
| **EHR** | Effective Hourly Rate - revenue divided by logged hours |
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
│       ├── weekly/         # Weekly EHR report
│       └── monthly/        # Monthly trend report
└── rpc/                    # API routes
    ├── mission/            # Daily mission generation
    ├── revenue/            # Revenue CRUD
    ├── logs/               # Work log CRUD
    ├── lever-override/     # Manual lever selection
    └── reports/            # Report data endpoints
