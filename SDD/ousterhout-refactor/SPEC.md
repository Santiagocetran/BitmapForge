# SPEC: Ousterhout Refactor — Deep Modules & Information Hiding

**Version:** 1.0
**Status:** Draft
**Date:** 2026-03-26

## Problem Statement

BitmapForge's engine layer follows Ousterhout's principles well (deep modules, good information hiding, clean polymorphism). However, the app layer has accumulated five architectural red flags that increase coupling, duplicate logic, and make the codebase harder to extend:

1. **God Object Store** — `useProjectStore` has 79 fields and 58 actions with no domain grouping
2. **Temporal Decomposition in AnimationEngine** — 8 effects have logic duplicated across `applyEffects()` and `seekTo()`, plus a parallel reset system
3. **Temporal Decomposition in useExport** — each export format repeats the same boilerplate (progress, error handling, abort, download)
4. **Information Leakage in PreviewCanvas** — subscribes to 30+ individual store fields, calls 12+ SceneManager methods as pass-through
5. **Config Duplication in Export Utilities** — `reactComponentExport` and `webComponentExport` have identical `createComponentConfig`; `codeExport` is a divergent subset

## Functional Requirements

### REQ-001: Store Domain Slices

The Zustand store must be refactored from a flat namespace into domain-specific slices, each with semantic methods.

**Acceptance Criteria:**

- Given the store has 79 fields, when refactored, then fields are grouped into named slices: `rendering`, `animation`, `input`, `transform`, `postEffects`, `status`
- Given a UI component that only needs rendering settings, when it subscribes, then it only accesses the `rendering` slice — not the full store
- Given the undo system excludes `status`, `model`, `imageSource`, `pluginParams`, when slices are introduced, then undo exclusions still work identically
- Given the `setRenderMode` action has side effects (bumps pixelSize for ASCII), when refactored, then cross-slice side effects are handled within the action without leaking to callers
- Given `useAutoSave` persists on every state change, when slices are introduced, then auto-save still triggers correctly on any slice change

### REQ-002: Animation Effect Classes

Each animation effect (spinX, spinY, spinZ, float, bounce, pulse, shake, orbit) must be extracted into its own class that owns both per-frame update and deterministic seek logic.

**Acceptance Criteria:**

- Given 8 animation effects with logic in `applyEffects()` and `seekTo()`, when refactored, then each effect is a class implementing `update(group, dt, speed)` and `seekTo(group, timeSeconds, speed)`
- Given the reset transition system detects toggle-off and lerps back to origin, when refactored, then each effect class owns its own reset detection and transition logic
- Given `seekTo()` must produce identical visual output to accumulated `update()` calls, when refactored, then seek-update parity is preserved (existing tests pass)
- Given new effects may be added in the future, when the refactoring is done, then adding a new effect requires creating one file with no changes to AnimationEngine's core orchestration

### REQ-003: Export Format Registry

Export functions must be unified through a registry pattern that eliminates boilerplate duplication.

**Acceptance Criteria:**

- Given 11 export functions with repeated patterns (AbortController, setStatus, try/catch, friendlyExportError, downloadBlob), when refactored, then a single `executeExport(formatId, options)` function handles all shared orchestration
- Given each format has unique logic (GIF uses gif.js workers, Video uses mp4-muxer, Code ZIP builds file tree), when refactored, then format-specific logic is isolated in format handler objects
- Given progress reporting varies per format, when refactored, then each format handler can report progress through a standard callback
- Given exports are dynamically imported for code splitting, when refactored, then lazy loading is preserved

### REQ-004: PreviewCanvas Bridge Simplification

PreviewCanvas must be simplified from 6 granular subscriptions + 12 direct method calls to a thinner bridge.

**Acceptance Criteria:**

- Given PreviewCanvas subscribes to 26 effect fields, 8 animation fields, and 4 individual fields, when refactored, then subscriptions align with store domain slices (one subscription per slice that the engine cares about)
- Given PreviewCanvas calls `manager.updateEffectOptions(slice)` passing 26+ fields, when refactored, then the engine receives domain-scoped option objects (not the full flat bag)
- Given PreviewCanvas handles model/shape/text/image loading with separate useEffect blocks, when refactored, then input loading logic is consolidated
- Given cleanup is thorough (6 unsubscribes + resize observer + dispose), when refactored, then cleanup is equally thorough

### REQ-005: Shared Export Config Builder

Export utilities that serialize store state into configuration must share a single config builder.

**Acceptance Criteria:**

- Given `reactComponentExport` and `webComponentExport` have identical `createComponentConfig` functions, when refactored, then both import from a single shared module
- Given `codeExport` is a divergent subset (missing `fadeVariant`, `useFadeInOut`, `animationEffects`, `baseRotation`), when refactored, then it uses the same shared config builder (full config, not a subset)
- Given export configs are used to generate standalone code (Code ZIP, React component, Web Component), when refactored, then the generated code still initializes the engine identically
- Given the store may gain new fields over time, when a new rendering/animation field is added to the store, then the shared config builder picks it up without manual field enumeration

### REQ-006: Test Refactoring

Tests must be updated to reflect the new architecture and themselves follow Ousterhout's principles.

**Acceptance Criteria:**

- Given existing tests verify current behavior, when the refactoring is done, then all existing behavioral assertions still pass (tests may be restructured but behavior coverage is preserved)
- Given animation tests verify seek-update parity, when effect classes are introduced, then each effect class has its own focused test file
- Given export tests verify format output, when the registry pattern is introduced, then shared orchestration is tested once and format-specific logic is tested per format
- Given the test suite has 517+ tests, when refactoring is done, then the test count is equal or greater (no coverage regression)

## Out of Scope

- No new features (renderers, effects, export formats)
- No changes to the engine's rendering pipeline (BitmapEffect → Renderer → PostProcessing)
- No changes to the plugin system (PluginRegistry, SchemaControls)
- No UI/UX changes — all components render identically
- No changes to project file format or localStorage persistence

## Decision Log

| Decision                             | Rationale                                                             | Date       |
| ------------------------------------ | --------------------------------------------------------------------- | ---------- |
| Scope all 5 red flags together       | #4 and #5 are symptoms of #1; fixing store first makes others natural | 2026-03-26 |
| Incremental with dependency ordering | Store refactor must land first; AnimationEngine is independent        | 2026-03-26 |
| Breaking internal API changes OK     | Improve quality while maintaining identical external behavior         | 2026-03-26 |
| Tests refactored alongside code      | Tests should also follow deep module principles                       | 2026-03-26 |
| Parallel worker execution model      | Tasks will include cold agent context for worktree isolation          | 2026-03-26 |
