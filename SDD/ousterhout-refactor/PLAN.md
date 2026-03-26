# PLAN: Ousterhout Refactor

**Version:** 1.1 (post-audit)
**Date:** 2026-03-26
**Spec:** [SPEC.md](./SPEC.md)

## Architecture Overview

The refactoring reorganizes code into deeper modules with better information hiding, without changing any user-visible behavior. The approach is **incremental with dependency ordering**: Wave 1 (store + animation) unblocks Wave 2 (preview bridge + export).

```
Wave 1 (parallel — no dependencies between them):
  REQ-001: Store domain slices
  REQ-002: Animation effect classes + engineSources.js update

Wave 2 (depends on Wave 1):
  REQ-004: PreviewCanvas simplification (depends on REQ-001)
  REQ-005: Shared export config builder (depends on REQ-001)
  REQ-003: Export format registry (depends on REQ-002 + REQ-005)

Wave 3:
  REQ-006: Test refactoring (depends on all above)
```

> **Audit fix (v1.1):** REQ-003 now explicitly depends on REQ-002 because `engineSources.js`
> must include the new effect class files before export ZIPs can bundle them.
> The `engineSources.js` update is staged in Wave 1 alongside REQ-002.

---

## REQ-001: Store Domain Slices

### Approach: Zustand Slice Pattern (Flat Merge)

Zustand's [slice pattern](https://docs.pmnd.rs/zustand/guides/slices-pattern) composes multiple slice creators into a single store. The store's `getState()` still returns a **flat object** — all fields remain accessible via `getState().fieldName`. This preserves backward compatibility with all 17 consumer components, `projectFile.js` serialization, `usePresetStore`, and tests.

**What changes:** The implementation file is split into domain-specific slice files. Each slice owns its state fields and actions. The root store file composes them.

**What doesn't change:** The external API. `useProjectStore.getState().pixelSize` still works. `useProjectStore((s) => s.setPixelSize)` still works. `useProjectStore.temporal` still works.

### Slice Definitions

**File: `src/app/store/slices/renderingSlice.js`**
- **State (12 fields):** `colors`, `pixelSize`, `ditherType`, `invert`, `minBrightness`, `backgroundColor`, `renderMode`, `seed`, `charRamp`, `asciiColored`, `halftoneDotShape`, `halftoneAngle`, `ledGap`, `ledShape`, `stippleDotSize`, `stippleDensity`
- **Actions (18):** `setColors`, `reorderColors`, `addColor`, `removeColor`, `setColorAt`, `setPixelSize`, `setDitherType`, `setInvert`, `setMinBrightness`, `setBackgroundColor`, `setRenderMode` (with ASCII pixelSize bump), `setSeed`, `randomizeSeed`, `setCharRamp`, `setAsciiColored`, `setHalftoneDotShape`, `setHalftoneAngle`, `setLedGap`, `setLedShape`, `setStippleDotSize`, `setStippleDensity`
- **Rationale:** All fields that flow to `BitmapEffect.updateOptions()` and renderers. Grouped because they share one PreviewCanvas subscription. Includes renderer-specific fields because they're consumed through the same `updateEffectOptions` path.

**File: `src/app/store/slices/animationSlice.js`**
- **State (8 fields):** `useFadeInOut`, `fadeVariant`, `animationEffects`, `animationSpeed`, `showPhaseDuration`, `animationDuration`, `animationPreset` (legacy), `rotateOnShow` (legacy), `showPreset` (legacy)
- **Actions (8):** `setUseFadeInOut`, `setFadeVariant`, `setAnimationEffect`, `setAnimationPreset`, `setAnimationSpeed`, `setShowPhaseDuration`, `setAnimationDuration`, `setRotateOnShow`, `setShowPreset`
- **Rationale:** All fields that flow to `AnimationEngine.setFadeOptions()`. Matches PreviewCanvas subscription 2.

**File: `src/app/store/slices/postEffectsSlice.js`**
- **State (11 fields):** `crtEnabled`, `scanlineGap`, `scanlineOpacity`, `chromaticAberration`, `crtVignette`, `noiseEnabled`, `noiseAmount`, `noiseMonochrome`, `colorShiftEnabled`, `colorShiftHue`, `colorShiftSaturation`
- **Actions (11):** One setter per field with clamping
- **Rationale:** Post-processing fields are consumed by `PostProcessingChain` through `updateEffectOptions`. They're independent of renderers and animation. Separating them makes the QualitySettings "Post Effects" section self-contained.

**File: `src/app/store/slices/inputSlice.js`**
- **State (10 fields):** `model`, `inputType`, `shapeType`, `shapeParams`, `textContent`, `fontSize`, `extrudeDepth`, `bevelEnabled`, `fontFamily`, `imageSource`
- **Actions (10):** `setModel`, `setInputType`, `setShapeType`, `setShapeParam`, `setTextContent`, `setFontSize`, `setExtrudeDepth`, `setBevelEnabled`, `setFontFamily`, `setImageSource`
- **Rationale:** Input source configuration. Used by `InputSource`, `ShapeSelector`, `TextInput`, `ImageInput`, `ModelUploader`, and PreviewCanvas model-loading effects.

**File: `src/app/store/slices/transformSlice.js`**
- **State (3 fields):** `lightDirection`, `baseRotation`, `modelScale`
- **Actions (4):** `setLightDirection`, `setBaseRotation`, `resetBaseRotation`, `setModelScale`
- **Rationale:** Scene pose/positioning. Each has its own PreviewCanvas subscription.

**File: `src/app/store/slices/statusSlice.js`**
- **State (2 fields):** `status`, `pluginParams`
- **Actions (2):** `setStatus`, `setPluginParam`
- **Rationale:** Transient state excluded from undo. Isolated to prevent polluting domain slices.

**Root store file: `src/app/store/useProjectStore.js`**
- Imports all 6 slices
- Composes via: `create(temporal(subscribeWithSelector((...a) => ({ ...renderingSlice(...a), ...animationSlice(...a), ...postEffectsSlice(...a), ...inputSlice(...a), ...transformSlice(...a), ...statusSlice(...a), resetToDefaults: () => set((state) => ({ ...state, ...DEFAULT_STATE })) })), { partialize, limit: 50 }))`
- `DEFAULT_STATE` assembled from slice defaults — **must contain only serializable fields** (no `model`, `imageSource`, functions). This ensures `resetToDefaults` merges without clobbering transient/binary fields.
- `partialize` logic unchanged (excludes `status`, `model`, `imageSource`, `pluginParams`, functions)
- **Middleware order:** Must match current stack exactly: `create(temporal(subscribeWithSelector(...)))` — verify during implementation.

### Existing Pattern Reference
- Zustand slice pattern: standard Zustand docs pattern
- Current `subscribeWithSelector` + `temporal` middleware stack (lines 86-206 of current `useProjectStore.js`) is preserved exactly

### Risks
- **Cross-slice side effects:** `setRenderMode` bumps `pixelSize` (rendering slice) when switching to ASCII. Solution: slice creators receive `(set, get)` — the rendering slice's `setRenderMode` reads current `pixelSize` via `get()` and sets both fields atomically.
- **Undo coherence:** All slices merge into one store, so `temporal` sees a single flat state. No risk.

---

## REQ-002: Animation Effect Classes

### Approach: Effect Registry with Per-Effect Classes

Extract each of the 8 animation effects into a class that implements a common interface. The `AnimationEngine` orchestrates effects without knowing their internals.

### Interface

> **Audit fix (v1.1):** All time parameters use **seconds** consistently. `context` includes
> `animationEffects` map so effects like Float can inspect sibling state during reset checks.
> Execution order is enforced via an explicit **ordered array**, not object iteration.

```javascript
// src/engine/animation/effects/BaseAnimationEffect.js
class BaseAnimationEffect {
  /** Per-frame incremental update */
  update(target, deltaSeconds, speed, context) {}

  /** Deterministic state at absolute time */
  seekTo(target, timeSeconds, speed, context) {}

  /** Detect toggle-off and initiate reset */
  checkReset(active, previouslyActive, target, context) {}

  /** Apply in-progress reset transitions. deltaSeconds (not ms!) */
  applyReset(target, deltaSeconds) { return false /* true = still resetting */ }

  /** Clear any reset state */
  clearReset() {}
}
```

**`target`** = `modelGroup` (for rotation/position/scale effects) or `camera` (for orbit).
**`context`** = `{ time, rng, animationEffects }` — shared time counter, RNG factory, and full effects map (for cross-effect queries like Float checking Spin state).

### Effect Classes

| File | Effect | update() | seekTo() | Reset |
|------|--------|----------|----------|-------|
| `SpinEffect.js` | spinX/spinY/spinZ | `rotation[axis] += speed * dt` | `rotation[axis] += speed * t` | Lerp rotation to nearest `2π` multiple over 300ms |
| `FloatEffect.js` | float | Oscillation on x/z via `Math.sin` | Integral: `4*(1-cos(0.5*t))` | Lerp x/z to 0 (only if corresponding spin inactive) |
| `BounceEffect.js` | bounce | `position.y = abs(sin(t*speed*1.8))*0.5` | Same formula with absolute time | Lerp position.y to 0 |
| `PulseEffect.js` | pulse | `scale = 1 + sin(t*speed*1.5)*0.12` | Same formula | Lerp scale to 1 |
| `ShakeEffect.js` | shake | Seeded random x/z offset | Same with time-based seed | Snap to 0 (immediate) |
| `OrbitEffect.js` | orbit | Camera circular path | Same formula | Restore baseline camera pose |

**SpinEffect** handles all 3 axes via constructor parameter (`new SpinEffect('x')`), producing 3 instances.

### AnimationEngine Changes

> **Audit fix (v1.1):** Effects are stored in an **ordered array** (not object) to guarantee
> deterministic execution order matching the current inline branch order. This preserves
> seek-update parity and avoids subtle visual changes from reordered transform composition.

```javascript
// Before: 8 if-branches in applyEffects() + 8 in seekTo() + 8 in _checkForResets()
// After:
// EFFECT_ORDER defines deterministic execution order (matches current inline branch order)
const EFFECT_ORDER = ['spinX', 'spinY', 'spinZ', 'float', 'bounce', 'pulse', 'shake', 'orbit']

class AnimationEngine {
  constructor() {
    this._effectMap = {
      spinX: new SpinEffect('x'),
      spinY: new SpinEffect('y'),
      spinZ: new SpinEffect('z'),
      float: new FloatEffect(),
      bounce: new BounceEffect(),
      pulse: new PulseEffect(),
      shake: new ShakeEffect(),
      orbit: new OrbitEffect()
    }
    // Ordered array for deterministic iteration
    this._effectList = EFFECT_ORDER.map(key => ({ key, effect: this._effectMap[key] }))
  }

  applyEffects(modelGroup, deltaSeconds, camera) {
    const context = { time: this.time, rng: createRNG, animationEffects: this.animationEffects }
    for (const { key, effect } of this._effectList) {
      if (this.animationEffects[key]) {
        effect.update(key === 'orbit' ? camera : modelGroup, deltaSeconds, this.speed, context)
      }
    }
    this.time += deltaSeconds * this.speed
  }

  seekTo(absoluteTimeMs, modelGroup, effect, camera) {
    // ... phase calculation unchanged ...
    const context = { time: showTs, rng: createRNG, animationEffects: this.animationEffects }
    for (const { key, eff } of this._effectList) {
      if (this.animationEffects[key]) {
        eff.seekTo(key === 'orbit' ? camera : modelGroup, showTs, this.speed, context)
      }
    }
  }
}
```

### Existing Pattern Reference
- `BaseRenderer` interface pattern (`src/engine/renderers/BaseRenderer.js:1-109`) — same approach: base class with method stubs, subclasses implement specifics
- `createRNG` usage in current `applyEffects()` (`AnimationEngine.js:96-98`)

### Risks
- **Seek-update parity:** Each effect must produce identical results from `update()` accumulation and `seekTo()` analytical calculation. Existing tests verify this — they'll catch regressions.
- **Float-spin interaction:** Float resets only when corresponding spin is inactive. Solution: `FloatEffect.checkReset()` receives `context.animationEffects` to inspect spin states.
- **Shared time counter:** Effects that depend on `this.time` (float, bounce, pulse, shake) receive it via `context.time`. The `AnimationEngine` still owns the time counter and advances it once per frame.
- **Execution order (audit fix):** `EFFECT_ORDER` array matches the exact order of current inline if-branches in `applyEffects()` and `seekTo()`. This is tested explicitly.

---

## REQ-005: Shared Export Config Builder

### Approach: Single `buildExportConfig(state)` Function

**File: `src/app/utils/exportConfig.js`**

```javascript
export function buildExportConfig(state) {
  return {
    modelFileName: state.model?.name ?? null,
    effectOptions: {
      colors: state.colors,
      pixelSize: state.pixelSize,
      ditherType: state.ditherType,
      invert: state.invert,
      minBrightness: state.minBrightness,
      backgroundColor: state.backgroundColor,
      animationDuration: state.animationDuration,
      fadeVariant: state.fadeVariant,
      renderMode: state.renderMode ?? 'bitmap',
      seed: state.seed,
      // Renderer-specific
      charRamp: state.charRamp,
      asciiColored: state.asciiColored,
      halftoneDotShape: state.halftoneDotShape,
      halftoneAngle: state.halftoneAngle,
      ledGap: state.ledGap,
      ledShape: state.ledShape,
      stippleDotSize: state.stippleDotSize,
      stippleDensity: state.stippleDensity,
      // Post-effects
      crtEnabled: state.crtEnabled,
      scanlineGap: state.scanlineGap,
      scanlineOpacity: state.scanlineOpacity,
      chromaticAberration: state.chromaticAberration,
      crtVignette: state.crtVignette,
      noiseEnabled: state.noiseEnabled,
      noiseAmount: state.noiseAmount,
      noiseMonochrome: state.noiseMonochrome,
      colorShiftEnabled: state.colorShiftEnabled,
      colorShiftHue: state.colorShiftHue,
      colorShiftSaturation: state.colorShiftSaturation,
    },
    useFadeInOut: state.useFadeInOut,
    animationEffects: state.animationEffects,
    animationSpeed: state.animationSpeed,
    showPhaseDuration: state.showPhaseDuration,
    lightDirection: state.lightDirection,
    baseRotation: state.baseRotation,
    rotateOnShow: state.rotateOnShow,
    showPreset: state.showPreset,
  }
}
```

This replaces:
- `reactComponentExport.js:createComponentConfig()` (lines 3-27)
- `webComponentExport.js:createComponentConfig()` (lines 4-28) — **identical** to react version
- `codeExport.js:createAnimationConfig()` (lines 3-26) — **subset**, now uses full config

### Existing Pattern Reference
- Current `reactComponentExport.js:3-27` is the most complete version — the shared builder is based on it with additions for renderer-specific and post-effect fields

---

## REQ-004: PreviewCanvas Bridge Simplification

### Approach: Selector Functions + Slice-Aligned Subscriptions

Instead of 26+ inline field names in each subscription, define selector functions colocated with the store slices. PreviewCanvas imports selectors, not field names.

**File: `src/app/store/selectors.js`**

```javascript
import { shallow } from 'zustand/shallow'

/** Fields consumed by BitmapEffect.updateOptions() */
export const selectEffectOptions = (s) => ({
  pixelSize: s.pixelSize, ditherType: s.ditherType, colors: s.colors,
  invert: s.invert, minBrightness: s.minBrightness, backgroundColor: s.backgroundColor,
  animationDuration: s.animationDuration, fadeVariant: s.fadeVariant, seed: s.seed,
  charRamp: s.charRamp, asciiColored: s.asciiColored,
  halftoneDotShape: s.halftoneDotShape, halftoneAngle: s.halftoneAngle,
  ledGap: s.ledGap, ledShape: s.ledShape,
  stippleDotSize: s.stippleDotSize, stippleDensity: s.stippleDensity,
  crtEnabled: s.crtEnabled, scanlineGap: s.scanlineGap, scanlineOpacity: s.scanlineOpacity,
  chromaticAberration: s.chromaticAberration, crtVignette: s.crtVignette,
  noiseEnabled: s.noiseEnabled, noiseAmount: s.noiseAmount, noiseMonochrome: s.noiseMonochrome,
  colorShiftEnabled: s.colorShiftEnabled, colorShiftHue: s.colorShiftHue,
  colorShiftSaturation: s.colorShiftSaturation,
})

/** Fields consumed by AnimationEngine.setFadeOptions() */
export const selectAnimationOptions = (s) => ({
  useFadeInOut: s.useFadeInOut, animationEffects: s.animationEffects,
  animationSpeed: s.animationSpeed, showPhaseDuration: s.showPhaseDuration,
  animationDuration: s.animationDuration, animationPreset: s.animationPreset,
  rotateOnShow: s.rotateOnShow, showPreset: s.showPreset,
})

/** Fields for model/input loading */
export const selectInputSource = (s) => ({
  model: s.model, inputType: s.inputType, shapeType: s.shapeType,
  shapeParams: s.shapeParams, textContent: s.textContent, fontSize: s.fontSize,
  extrudeDepth: s.extrudeDepth, bevelEnabled: s.bevelEnabled,
  fontFamily: s.fontFamily, imageSource: s.imageSource,
})
```

**PreviewCanvas changes:**
```javascript
// Before (inline, 26 fields):
const unsubEffect = useProjectStore.subscribe(
  (state) => ({ pixelSize: state.pixelSize, ditherType: state.ditherType, ... }),
  (slice) => manager.updateEffectOptions(slice),
  { equalityFn: shallow }
)

// After (selector import):
import { selectEffectOptions, selectAnimationOptions, selectInputSource } from '../../store/selectors'

const unsubEffect = useProjectStore.subscribe(selectEffectOptions,
  (slice) => manager.updateEffectOptions(slice),
  { equalityFn: shallow }
)
```

This reduces PreviewCanvas from a component that **knows** 30+ field names to one that **delegates** to named selectors. Adding a new field means updating the selector, not PreviewCanvas.

### Input Loading Consolidation

The 4 separate `useEffect` blocks for model/shape/text/image loading can be consolidated into 1 effect that dispatches on `inputType`:

```javascript
// Before: 4 separate useEffects watching model, shapeType, textContent, imageSource
// After: 1 useEffect watching selectInputSource
useEffect(() => {
  const input = useProjectStore.getState()
  switch (input.inputType) {
    case 'model': if (input.model) manager.loadModel(input.model); break
    case 'shape': manager.loadShape(input.shapeType, input.shapeParams); break
    case 'text': manager.loadText(input.textContent, {...}); break
    case 'image': if (input.imageSource) manager.loadImage(input.imageSource); break
  }
}, [inputSource])  // single subscription
```

### Existing Pattern Reference
- Current subscription pattern (`PreviewCanvas.jsx:60-93`) — selectors extract the same fields, just moved to a shared module

### Risks
- **Equality semantics:** `shallow` comparison on the selector output must still prevent unnecessary re-renders. Since the selectors return the same shape as current inline selectors, behavior is identical.
- **Input loading consolidation:** Must handle the case where only `shapeParams` changes (within the same `inputType`). The subscription fires for any field in `selectInputSource`, which is correct — it matches current behavior where each `useEffect` has its own dependency list.

---

## REQ-003: Export Format Registry

### Approach: Format Descriptor Map + Single `executeExport()`

**File: `src/app/hooks/useExport.js`** (refactored)

```javascript
const FORMAT_HANDLERS = {
  apng: { label: 'APNG', needsFrames: true, handler: handleApngExport },
  gif: { label: 'GIF', needsFrames: true, handler: handleGifExport },
  video: { label: 'Video', needsFrames: true, handler: handleVideoExport },
  spriteSheet: { label: 'Sprite Sheet', needsFrames: true, handler: handleSpriteSheetExport },
  codeZip: { label: 'Code ZIP', needsState: true, handler: handleCodeZipExport },
  reactComponent: { label: 'React', needsState: true, handler: handleReactExport },
  webComponent: { label: 'Web Component', needsState: true, handler: handleWebComponentExport },
  cssAnimation: { label: 'CSS', needsFrames: true, needsState: true, handler: handleCssExport },
  embed: { label: 'Embed', needsState: true, handler: handleEmbedExport },
  singleHtml: { label: 'HTML', needsFrames: true, handler: handleSingleHtmlExport },
}

async function executeExport(formatId, { manager, fps, frameCount, columns, signal, onProgress }) {
  const format = FORMAT_HANDLERS[formatId]
  if (!format) throw new Error(`Unknown export format: ${formatId}`)

  const state = format.needsState ? getState() : null
  const frames = format.needsFrames
    ? await captureFrames(manager, getFrameCount(manager, fps), { signal, onProgress })
    : null

  return format.handler({ manager, state, frames, fps, frameCount, columns, signal, onProgress })
}
```

Each format handler is a **pure function** that receives its dependencies and returns a `Blob` or triggers a download. The shared orchestration (abort, status updates, error handling, download) lives in the hook's `exportAs(formatId)` method.

**The hook's public API becomes:**
```javascript
function useExport(managerRef) {
  return {
    exportAs: (formatId, options) => { /* shared orchestration */ },
    cancelExport: () => { /* abort */ },
    saveProject: () => { /* unchanged */ },
    loadProject: (file) => { /* unchanged */ },
  }
}
```

**ExportPanel** calls `exportAs('apng', { fps: 30 })` instead of `exportApng(30)`.

### Existing Pattern Reference
- Current `exportApng()` (`useExport.js:123-149`) — the handler is the format-specific body of this function

### Risks
- **ExportPanel API change:** Components that call specific export functions (`exportApng`, `exportGif`) must switch to `exportAs('apng')`. This is a straightforward search-replace.
- **Video format complexity:** `exportVideo` has two paths (WebCodecs + legacy MediaRecorder). Both are kept inside `handleVideoExport`, which is a valid deep module.
- **Abort isolation (audit fix):** Each `exportAs()` call creates its own `AbortController`. The hook tracks the active controller for `cancelExport()` but never shares controllers across concurrent calls.
- **Lazy loading preserved:** Format handlers use dynamic `import()` internally (same as current per-function pattern). The `FORMAT_HANDLERS` map holds references to handler functions, not to the imported modules themselves.

---

## REQ-006: Test Refactoring

### Approach

Tests follow the same structural changes:

1. **Store tests** (`useProjectStore.test.js`): Split into per-slice test files. Each slice file tests its state defaults, action clamping, and cross-slice interactions (e.g., `setRenderMode` bumping `pixelSize`).

2. **Animation effect tests** (`AnimationEngine.test.js`): Split into per-effect test files. Each effect file tests `update()`, `seekTo()`, reset transitions, and seek-update parity. The orchestration tests (phase transitions, loop duration) stay in `AnimationEngine.test.js`.

3. **Export tests** (`useExport.test.js`): Test the shared `executeExport` orchestration once (abort, status, error handling). Per-format tests remain but are simplified since they only test the handler function.

4. **PreviewCanvas tests**: Update subscription tests to use selector imports.

5. **Export config test**: New test for `buildExportConfig()` — verifies all fields are included and match the store's rendering + animation state.

### Test Count Target
Current: 517+ tests. Target: >= 517 (restructured, not reduced).

---

## File Change Manifest

| File | Action | REQ | Notes |
|------|--------|-----|-------|
| `src/app/store/slices/renderingSlice.js` | CREATE | REQ-001 | 16 state fields, 20 actions |
| `src/app/store/slices/animationSlice.js` | CREATE | REQ-001 | 9 state fields, 9 actions |
| `src/app/store/slices/postEffectsSlice.js` | CREATE | REQ-001 | 11 state fields, 11 actions |
| `src/app/store/slices/inputSlice.js` | CREATE | REQ-001 | 10 state fields, 10 actions |
| `src/app/store/slices/transformSlice.js` | CREATE | REQ-001 | 3 state fields, 4 actions |
| `src/app/store/slices/statusSlice.js` | CREATE | REQ-001 | 2 state fields, 2 actions |
| `src/app/store/useProjectStore.js` | MODIFY | REQ-001 | Compose slices, keep temporal/partialize |
| `src/app/store/selectors.js` | CREATE | REQ-004 | Named selectors for engine subscriptions |
| `src/engine/animation/effects/BaseAnimationEffect.js` | CREATE | REQ-002 | Base class interface |
| `src/engine/animation/effects/SpinEffect.js` | CREATE | REQ-002 | Handles x/y/z via axis param |
| `src/engine/animation/effects/FloatEffect.js` | CREATE | REQ-002 | |
| `src/engine/animation/effects/BounceEffect.js` | CREATE | REQ-002 | |
| `src/engine/animation/effects/PulseEffect.js` | CREATE | REQ-002 | |
| `src/engine/animation/effects/ShakeEffect.js` | CREATE | REQ-002 | |
| `src/engine/animation/effects/OrbitEffect.js` | CREATE | REQ-002 | |
| `src/engine/animation/AnimationEngine.js` | MODIFY | REQ-002 | Use effect registry, remove inline logic |
| `src/app/utils/exportConfig.js` | CREATE | REQ-005 | `buildExportConfig(state)` |
| `src/app/utils/codeExport.js` | MODIFY | REQ-005 | Import shared config builder |
| `src/app/utils/reactComponentExport.js` | MODIFY | REQ-005 | Import shared config builder, delete local `createComponentConfig` |
| `src/app/utils/webComponentExport.js` | MODIFY | REQ-005 | Import shared config builder, delete local `createComponentConfig` |
| `src/app/components/PreviewCanvas/PreviewCanvas.jsx` | MODIFY | REQ-004 | Use selector imports, consolidate input loading |
| `src/app/hooks/useExport.js` | MODIFY | REQ-003 | Format registry + `executeExport()` |
| `src/app/components/ExportPanel/ExportPanel.jsx` | MODIFY | REQ-003 | Call `exportAs(formatId)` |
| `src/app/store/useProjectStore.test.js` | MODIFY | REQ-006 | Restructure for slice-based tests |
| `src/engine/animation/AnimationEngine.test.js` | MODIFY | REQ-006 | Restructure for per-effect tests |
| `src/app/hooks/useExport.test.js` | MODIFY | REQ-006 | Test shared orchestration + per-format handlers |
| `src/app/utils/exportConfig.test.js` | CREATE | REQ-006 | Test shared config builder |
| `src/app/utils/engineSources.js` | MODIFY | REQ-002 | Add effect class files to manifest (7 new entries: BaseAnimationEffect + 6 effects) |

## Rollback Procedure

Each wave is independently revertable:
- **Wave 1:** `git revert` the store slice commits OR the animation effect commits
- **Wave 2:** `git revert` preview/export commits (store slices remain valid standalone)

No database migrations, no external service changes, no breaking API changes.

## Failure Modes

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Undo breaks after slicing | Low | `temporal` sees flat merged state; `partialize` unchanged |
| Seek-update parity regresses | Medium | Existing parity tests in `AnimationEngine.test.js` catch immediately |
| Export format output changes | Low | `exportConformance.test.js` validates all 7 format structures |
| PreviewCanvas re-render storm | Low | Selectors return same-shaped objects with `shallow` equality |
| Cross-slice action atomicity | Low | Zustand `set()` is synchronous; multi-field updates in one `set()` call |

## Observability

- All 517+ tests must pass after each wave
- `npm run build` produces zero errors
- No new console warnings in dev mode

---

## Audit Log (v1.1)

**Reviewer:** Codex (gpt-5) via ia-bridge
**Date:** 2026-03-26
**Full report:** [20260326-124241-BitmapForge-codex-second-opinion.md](./20260326-124241-BitmapForge-codex-second-opinion.md)

**Changes applied from audit:**
1. Standardized effect API to use seconds everywhere (was ms in `applyReset`)
2. Added `animationEffects` map to `context` parameter for cross-effect queries
3. Changed effect iteration from object to explicit `EFFECT_ORDER` array for deterministic execution
4. Added `checkReset` `context` parameter to interface signature
5. Made `resetToDefaults` use merge pattern `set(state => ({...state, ...DEFAULT_STATE}))`
6. Added explicit REQ-002 dependency to REQ-003 (engineSources.js)
7. Fixed count: 7 new engineSources entries (BaseAnimationEffect + 6 effects)
8. Added abort isolation and lazy loading notes to REQ-003 risks
9. Added middleware order verification note

**Caveat:** The reviewing agent (Codex) did not have direct file access. Findings referencing specific file contents were verified against the actual codebase before being applied.
