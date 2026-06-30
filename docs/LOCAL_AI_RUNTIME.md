# Local-First AI Runtime Plan

**Status:** Planned — not implemented  
**Target slice:** M8.9, after deterministic desktop parity  
**Last reviewed:** 2026-07-01

## Purpose

ZCVIOS must remain fully useful without an AI provider. Optional AI may improve explanations, mission wording, summaries, and interpretation of user-entered business signals, but it must never become the source of truth for calculations, persistence, permissions, or irreversible actions.

The planned provider order is:

1. **Deterministic mode** — default and always available
2. **Local Ollama** — preferred optional AI path
3. **Gemini API** — optional bring-your-own-key cloud path
4. **OpenAI API** — optional bring-your-own-key cloud path

No provider is currently wired into the desktop application.

## What “baked in” means

ZCVIOS should bake in the **provider interface, detection, safety controls, and guided setup**. It should not bundle the Ollama application or model weights inside the ZCVIOS installer.

Bundling model weights would create avoidable problems:

- very large installers
- hardware mismatch between users
- stale model versions
- model-specific licence obligations
- difficult updates and removals
- increased Windows and macOS packaging complexity

The user should install Ollama separately and deliberately download a model. ZCVIOS may detect that installation, show compatible models, test the local connection, and provide copyable setup commands. It must not silently install Ollama or download a model.

## Planned AI modes

### Off — deterministic mode

This remains the default.

- no AI process is contacted
- no prompt or business record leaves the device
- weekly lever calculations remain deterministic
- template-based missions remain available
- reports and exports remain available
- no warning or reduced-function penalty is shown merely because AI is disabled

### Local Ollama

This is the preferred optional mode for privacy-conscious users.

- ZCVIOS connects only to a loopback Ollama endpoint by default
- the initial expected endpoint is `http://127.0.0.1:11434`
- no API key is required for a local Ollama server
- model execution and data remain on the user's machine
- local inference may be slower on CPU-only or older hardware
- model downloads consume disk space and are governed by each model's own licence

Ollama currently provides native installation paths for Linux, Windows, and macOS. Official installation and API documentation:

- https://docs.ollama.com/
- https://docs.ollama.com/linux
- https://docs.ollama.com/windows
- https://docs.ollama.com/macos
- https://docs.ollama.com/api/introduction

### Initial model policy

The first supported local text model should be configurable rather than hard-coded.

A practical initial baseline is:

```text
llama3.2:3b
```

This model is approximately 2 GB in its standard Ollama package and is intended for instruction following, summarization, prompt rewriting, and tool-oriented text tasks. It is suitable for testing ZCVIOS explanations and mission wording on modest hardware.

A smaller fallback may be:

```text
llama3.2:1b
```

The application should eventually inspect available memory, CPU, GPU support, and installed Ollama models before recommending a model. The user must be able to override the recommendation.

The first implementation must not install multiple models automatically. One selected text model is sufficient.

## Resource-governor requirements

Local AI must respect the user's hardware.

The planned defaults are:

- one AI request at a time
- no parallel heavy model jobs
- cancellable requests
- visible working state and elapsed time
- conservative CPU use on older systems
- configurable low-resource, balanced, and performance modes
- bounded context and output size
- timeout and recovery handling
- deterministic fallback after repeated provider failures

ZCVIOS must not freeze the desktop interface while a model is running.

## Gemini API option

Gemini may be offered as an optional bring-your-own-key provider.

- the user obtains their own Gemini API key
- availability and free-tier limits depend on the selected model and the user's Google project
- free-tier quotas are limited and may change
- the user must see what data will be sent before enabling the provider
- cloud requests must be clearly labelled

Official documentation:

- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/docs/rate-limits

## OpenAI API option

OpenAI may be offered as an optional bring-your-own-key provider.

- the OpenAI API uses API keys
- API usage is billed separately from a ChatGPT subscription
- the user controls their API account, limits, and billing
- cloud requests must be clearly labelled

Official documentation:

- https://platform.openai.com/docs/api-reference/authentication
- https://platform.openai.com/docs/pricing
- https://help.openai.com/en/articles/8156019-how-can-i-move-my-chatgpt-subscription-to-the-api

## Secret storage

Cloud API keys must not be stored in:

- the SQLite business database
- frontend source code
- the packaged JavaScript bundle
- logs
- exports
- crash reports
- GitHub Actions secrets intended for the project maintainer

The desktop implementation should use an operating-system-backed credential store or an equivalently encrypted local secret store. The settings screen should support test, replace, and delete actions without displaying a stored key in full.

## Privacy disclosure

Before the first cloud request, ZCVIOS should show:

- selected provider and model
- the categories of data being sent
- whether the request includes work logs, revenue, profile context, or only user-selected text
- a clear confirmation action
- a reminder that deterministic and local Ollama modes remain available

Provider selection must be reversible.

## Planned settings surface

A future **Settings → AI Assistance** panel should contain:

- AI assistance: Off / Local Ollama / Gemini / OpenAI
- provider status
- model selection
- Test connection
- local endpoint field, defaulting to loopback only
- resource mode
- timeout
- privacy disclosure
- clear provider data
- delete stored cloud key

The panel must not imply that an unavailable provider blocks the core workflow.

## AI responsibilities

Optional AI may:

- explain a deterministic lever recommendation in plainer language
- rewrite a template mission without changing its objective
- summarize user-entered weekly observations
- identify questions the user may need to answer
- present alternatives for human review

Optional AI must not:

- calculate or overwrite authoritative revenue totals
- choose a provider or paid model without consent
- publish content
- spend money
- log into marketplaces
- collect credentials
- make hidden network requests
- override deterministic guardrails
- claim guaranteed financial outcomes

## Rendering-engine boundary

The ZCVIOS AI plan is a text decision-support capability. It does not require or guarantee a visual rendering engine.

Any image-generation, mockup, pattern, vector, or other rendering engine should remain a separate module with its own hardware assessment and Windows/macOS compatibility work. Uncertainty about cross-platform rendering must not block the deterministic ZCVIOS planning core or the local text-model adapter.

## Cross-platform boundary

The provider interface should be platform-neutral. Platform-specific work is limited to:

- detecting an Ollama installation
- starting or locating the local service where appropriate
- opening official installation guidance
- secure secret storage
- native firewall and loopback behaviour
- packaging and permission tests

Linux is the first locally verified desktop target. Windows and macOS support should be added through separate controlled test-build milestones rather than assumed from Linux behaviour.

## Implementation order

AI work begins only after the deterministic loop is stable:

1. operator baseline
2. focused work logging
3. weekly revenue history
4. deterministic weekly lever
5. template daily mission
6. weekly review and export
7. provider-neutral AI contract
8. Ollama detection and local text generation
9. optional Gemini and OpenAI adapters
10. platform-specific verification

## Acceptance gate

The AI milestone is not complete until:

- ZCVIOS works normally with AI set to Off
- no model or provider is silently installed
- local requests are loopback-only by default
- cloud requests require explicit provider configuration
- keys are absent from SQLite, source, logs, and exports
- provider failures fall back safely
- AI output is visibly labelled
- the user can inspect, reject, edit, and ignore AI suggestions
- CPU-only operation remains responsive
- Windows and macOS claims are supported by actual tests rather than assumptions
