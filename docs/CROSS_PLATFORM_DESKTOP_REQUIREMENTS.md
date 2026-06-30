# Cross-Platform Desktop Requirements

**Status:** Product requirement  
**Target platforms:** Linux, Windows, macOS  
**Last reviewed:** 2026-07-01

## Product commitment

ZCVIOS is one desktop product for Linux, Windows, and macOS.

Linux is the first implementation and verification environment. It is not the only intended production platform. Windows and macOS are equal supported targets, and architectural decisions made during Linux development must not prevent complete support on either platform.

The quality goal is that the same supported ZCVIOS workflow behaves reliably and predictably on all three operating systems. Documentation must not claim that a platform works flawlessly until its complete acceptance gate has passed on real platform runners and representative machines.

## Core rule

```text
one product contract
→ one platform-neutral application core
→ three native adapters and package configurations
→ three independent build and verification gates
```

A capability is not considered cross-platform merely because it compiles from a shared codebase.

It must be built, launched, exercised, restarted, upgraded, and inspected on each supported operating system.

## Supported platform families

### Linux

Initial supported baseline:

- Ubuntu LTS x86_64
- Debian package
- AppImage portable package

Future Linux expansion may include other distributions and architectures only after the Ubuntu baseline is stable.

### Windows

Initial supported baseline:

- supported 64-bit Windows releases
- native Windows executable
- NSIS setup executable and/or MSI package
- Microsoft WebView2 runtime handling

Windows packages should be built and tested on Windows rather than relying on cross-compilation as the primary release route.

### macOS

Initial supported baseline:

- supported macOS releases
- Apple silicon build
- Intel build where product support remains practical
- `.app` application bundle
- DMG direct-download package

macOS packages must be built and tested on macOS. Signing and notarisation are later release gates, but unsigned internal test builds must exist first.

## Platform-neutral application core

The following must remain platform-neutral:

- business-domain types
- deterministic lever calculations
- mission templates and rules
- progress calculations
- SQLite schema and migrations
- repository contracts
- validation rules
- export schemas
- provider-neutral AI contracts
- error categories
- application-level tests and fixtures

Platform-specific code must not leak into those modules.

## Native adapter boundary

Operating-system differences belong behind small adapters for:

- application-data directories
- user-selected file and folder dialogs
- opening a folder or file
- secure credential storage
- notifications
- window behaviour
- process discovery
- local Ollama discovery
- executable and resource lookup
- installer and uninstaller behaviour
- platform permissions

The frontend should call typed application commands rather than inspect the operating system directly.

## Platform-specific Tauri configuration

Use the cross-platform base configuration for shared identity and behaviour.

Use separate merged configurations for native differences:

```text
desktop/src-tauri/tauri.conf.json
desktop/src-tauri/tauri.linux.conf.json
desktop/src-tauri/tauri.windows.conf.json
desktop/src-tauri/tauri.macos.conf.json
```

Each platform configuration may define only genuine platform differences, including:

- package targets
- icon formats
- runtime requirements
- installer metadata
- minimum operating-system version
- platform capabilities
- bundle resources

Shared product identity must remain consistent.

## Required CI matrix

Cross-platform CI should be introduced in controlled stages.

The eventual required matrix is:

| Gate | Linux | Windows | macOS |
|---|---:|---:|---:|
| TypeScript build | Required | Required | Required |
| Rust compile and tests | Required | Required | Required |
| Static architecture checks | Required | Required | Required |
| Native application build | Required | Required | Required |
| Headless or automated launch smoke test | Required | Required | Required |
| SQLite migration and restart test | Required | Required | Required |
| Native package generation | Required | Required | Required |
| Package structure inspection | Required | Required | Required |
| Upgrade preservation test | Required | Required | Required |
| Uninstall/data-preservation test | Required | Required | Required |
| Local operator workflow test | Required | Required | Required |

Build jobs should be path-filtered and manually dispatchable where packaging cost is high. Routine code checks should remain lighter than full package jobs.

## Cross-platform data contract

All supported systems must use the same logical database contract.

Requirements:

- the same migration versions
- the same field meaning and validation
- integer cents for monetary storage
- UTF-8 text handling
- no hard-coded path separators
- no Linux-only home-directory assumptions
- no platform-specific SQL
- no dependency on shell profile files
- user-visible native data location
- backup and export portability between platforms where practical

A database created on one supported platform should remain understandable by the same ZCVIOS version on another platform, subject to an explicit migration or import workflow.

## Cross-platform user-interface contract

The application must preserve the same workflow and meaning across platforms while respecting native conventions.

Verify:

- readable layout at supported display scales
- keyboard navigation
- focus visibility
- text entry and selection
- scrolling
- native file dialogs
- high-DPI behaviour
- window resizing
- error and progress states
- dark and light appearance where supported
- no clipped controls or inaccessible actions

The interface may use native platform differences, but it must not offer a weaker business workflow on one supported system.

## AI and Ollama boundary

The provider-neutral AI contract must work consistently on Linux, Windows, and macOS.

Local Ollama support requires platform-specific verification of:

- installation detection
- loopback connection
- service availability
- model listing
- request cancellation
- process and endpoint error handling
- secure configuration
- GUI application environment behaviour

ZCVIOS will not silently install Ollama or model weights.

Gemini and OpenAI adapters must use the same user-facing consent, data disclosure, cancellation, error, and fallback behaviour on all three systems.

## Rendering-engine boundary

Any visual rendering engine included in ZCVIOS must meet the same three-platform requirement.

Before a renderer is declared supported, verify on Linux, Windows, and macOS:

- required native libraries
- CPU-only execution where advertised
- GPU acceleration where available
- identical project and export contracts
- font and colour handling
- image dimensions and formats
- file-path behaviour
- cancellation and progress reporting
- memory limits
- failure recovery
- output equivalence within documented tolerances

A renderer that works only on Linux must remain an experimental Linux-only module and must not be presented as part of the fully supported cross-platform product.

Rendering support should be modular so a platform-specific backend can be replaced without changing the business workflow or project format.

## Native dependency policy

Before adding a dependency, confirm:

1. it supports Linux, Windows, and macOS, or is isolated behind a replaceable adapter
2. it has an acceptable licence
3. it supports the required CPU architectures
4. it does not require an undisclosed cloud service
5. it has a maintained installation and update path
6. it can be built in platform-native CI
7. its absence produces a recoverable error rather than application failure

Avoid dependencies that force the entire product onto one operating system.

## Release acceptance gate

A platform may be labelled **Supported** only when evidence records:

1. native build success
2. native package creation
3. clean installation
4. first launch
5. local profile and operator baseline save
6. application restart and data reload
7. work-log, revenue, lever, mission, report, export, and deletion workflows when implemented
8. local data-path visibility
9. package upgrade with data preservation
10. uninstall behaviour with explicit data policy
11. offline deterministic operation
12. optional provider failure and fallback
13. representative low-resource hardware result
14. no critical or high-severity unresolved platform defect
15. documented minimum operating-system and hardware requirements

Until a platform passes this gate, label it **Planned** or **Test build**, not Supported.

## Definition of cross-platform parity

Cross-platform parity means:

- the same product purpose
- the same authoritative data
- the same deterministic decisions
- the same privacy controls
- the same user-owned exports
- the same recovery guarantees
- the same optional-AI boundaries
- platform-appropriate native packaging

It does not require pixel-identical windows or identical installer technology.

## Delivery sequence

The controlled sequence is:

```text
platform-neutral core
→ Linux proof
→ Windows native test build
→ macOS native test build
→ shared behaviour fixtures
→ per-platform package and persistence gates
→ platform defect correction
→ signed release preparation
→ supported three-platform release
```

Linux-first verification is a sequencing decision. Three-platform support is the product destination and an architectural requirement from the beginning.
