# ZCcode Language

## Overview

ZCcode is a structured prompting language used to communicate system design intentions to AI assistants and collaborators. It provides a consistent format for describing what should be built, why, and how components relate to each other.

## Purpose

Traditional development communication often suffers from:

- Ambiguous requirements
- Unstated assumptions
- Missing context
- Scope creep through incremental changes

ZCcode addresses these issues by providing a structured vocabulary for system design conversations.

## Basic Structure

A ZCcode block follows this pattern:

```
[COMPONENT_TYPE]: name
[PURPOSE]: what it does
[INPUTS]: what it receives
[OUTPUTS]: what it produces
[CONSTRAINTS]: boundaries and rules
[DEPENDENCIES]: what it relies on
```

## Component Types

| Type | Usage |
|------|-------|
| `PAGE` | A user-facing route/view |
| `API` | A backend endpoint |
| `MODEL` | A database entity |
| `SERVICE` | Business logic module |
| `HOOK` | React hook or state logic |
| `UTIL` | Pure utility function |

## Example: Defining an API Endpoint

```
[API]: /rpc/mission
[PURPOSE]: Generate or retrieve daily mission for authenticated user
[INPUTS]: 
  - session (required)
  - date (optional, defaults to today)
[OUTPUTS]:
  - primaryTask: string
  - supportTask: string
  - recommendedMinutes: number
  - source: "TEMPLATE" | "AI"
[CONSTRAINTS]:
  - Requires valid session
  - Returns 401 if unauthenticated
  - Falls back to deterministic if AI fails
[DEPENDENCIES]:
  - WeeklyPlan (for active lever)
  - User (for preferences)
  - OpenAI (optional)
```

## Example: Defining a Page

```
[PAGE]: /dashboard
[PURPOSE]: Main operator view showing current mission and weekly status
[INPUTS]:
  - session (redirects to /login if missing)
[OUTPUTS]:
  - Current mission card
  - Weekly lever indicator
  - EHR summary
  - Quick-log button
[CONSTRAINTS]:
  - Must load within 2 seconds
  - Shows skeleton while fetching
  - Graceful degradation if API fails
[DEPENDENCIES]:
  - /rpc/mission
  - /rpc/revenue (for EHR)
  - SessionProvider
```

## Modifiers

ZCcode supports modifiers to indicate state or intent:

| Modifier | Meaning |
|----------|---------|
| `[WIP]` | Work in progress, not complete |
| `[DEPRECATED]` | Scheduled for removal |
| `[OPTIONAL]` | Not required for core function |
| `[STUB]` | Placeholder implementation |
| `[TESTED]` | Has test coverage |

## Usage in Development

### 1. Specification

Before building, write ZCcode blocks to define what you're building:

```
[API]: /rpc/lever-override
[PURPOSE]: Allow user to manually select weekly lever
[WIP]
```

### 2. Communication

When requesting changes or fixes, include ZCcode context:

```
[BUG]: /rpc/mission returns 500
[EXPECTED]: Returns mission object
[ACTUAL]: TypeError: Cannot read property 'lever' of null
[CONTEXT]: WeeklyPlan missing for new users
```

### 3. Documentation

ZCcode blocks serve as inline documentation:

```typescript
/**
 * [SERVICE]: generateStrategy
 * [PURPOSE]: Select weekly lever based on signals
 * [INPUTS]: EHR slope, execution %, business signals
 * [OUTPUTS]: lever, reasoning, recommendation
 */
export async function generateStrategy(input: StrategyInput) {
  // ...
}
```

## Best Practices

1. **Be explicit** - State inputs and outputs clearly
2. **Include constraints** - Boundaries prevent scope creep
3. **List dependencies** - Makes integration requirements visible
4. **Use modifiers** - Indicate completion state
5. **Keep blocks focused** - One component per block

## Limitations

ZCcode is a communication tool, not a programming language. It does not:

- Execute or compile
- Replace actual code
- Guarantee implementation accuracy
- Substitute for testing

It is a **shared vocabulary** for faster, clearer technical communication.
