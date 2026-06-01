# TypeScript Migration Plan

_Analysis date: April 2026_

---

## Executive Summary

The codebase is ~120 production JS/JSX files across three layers: `src/engine/` (~30 files), `src/app/` (~50 files), and `packages/embed/` (~5 files). No TypeScript infrastructure exists yet — no `tsconfig.json`, no `typescript` package, no `@typescript-eslint`. The migration starts from zero but has good foundations: many key engine files already have JSDoc type annotations, and most third-party dependencies (`zustand`, `zundo`, `jszip`, `mp4-muxer`, all Radix UI, dnd-kit, lucide-react) ship bundled `.d.ts` files. Two packages need local declaration shims (`gif.js`, `upng-js`).

**Recommended order**: engine first → embed SDK → app layer. This matches the npm publish ambitions and keeps risk isolated.

**Total estimated effort**: ~3 weeks focused (or 5–6 weeks alongside other work), split across 8 phases.

---

## What Needs Installing

```bash
npm install --save-dev typescript @types/three typescript-eslint
```

| Package             | Why                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `typescript`        | Not installed anywhere in the project                                                                              |
| `@types/three`      | Three.js ships no bundled `.d.ts` — community types are well-maintained                                            |
| `typescript-eslint` | Unified package for ESLint flat config (replaces `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`) |

**Already available (no install needed):**

- `react` / `react-dom` — bundled types in React 19
- `zustand` — bundled
- `zundo` — bundled
- `jszip` — bundled
- `mp4-muxer` — bundled
- `@types/dom-webcodecs` — already in `node_modules` (covers `VideoEncoder`, `VideoFrame` in `useExport.js`)
- All Radix UI, dnd-kit, lucide-react — all ship bundled types

---

## Packages Requiring Local Declaration Shims

Two packages have no types on npm and need short local shims under `src/types/`:

### `src/types/gif.d.ts`

```ts
declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    transparent?: number | null
  }
  export default class GIF extends EventTarget {
    constructor(options: GIFOptions)
    addFrame(canvas: HTMLCanvasElement | CanvasRenderingContext2D, opts?: { delay?: number; copy?: boolean }): void
    render(): void
    on(event: 'finished', cb: (blob: Blob) => void): this
    on(event: 'progress', cb: (p: number) => void): this
    on(event: string, cb: (...args: unknown[]) => void): this
    abort(): void
  }
}
```

### `src/types/upng.d.ts`

```ts
declare module 'upng-js' {
  function encode(bufs: ArrayBuffer[], w: number, h: number, cnum: number, dels?: number[]): ArrayBuffer
  function decode(buffer: ArrayBuffer): {
    width: number
    height: number
    ctype: number
    depth: number
    frames: unknown[]
  }
  function toRGBA8(img: ReturnType<typeof decode>): ArrayBuffer[]
}
```

---

## Phase 0 — Tooling Infrastructure

**Effort**: ~1 day  
**Risk**: low — no source files touched

### 0.1 — Create `tsconfig.json` (root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": false,
    "allowJs": true,
    "checkJs": false,
    "skipLibCheck": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "paths": {
      "@engine/*": ["./src/engine/*"],
      "@app/*": ["./src/app/*"]
    }
  },
  "include": ["src", "packages/embed/src", "test"],
  "exclude": ["node_modules", "dist"]
}
```

Key decisions:

- `allowJs: true` + `checkJs: false` — JS files compile without errors while migration is in progress
- `strict: true` — enforce strict mode from day one on all new `.ts` files
- `noUncheckedIndexedAccess: false` — the renderer registry uses `RENDERERS[mode]` pattern; enable this later once the registry is typed
- `allowImportingTsExtensions: true` — required by Vite's esbuild transpiler when mixing `.ts` and `.js` in the same project

### 0.2 — Create `packages/embed/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationDir": "dist/types",
    "noEmit": false,
    "allowImportingTsExtensions": false,
    "paths": {
      "@engine/*": ["../../src/engine/*"]
    }
  },
  "include": ["src"]
}
```

### 0.3 — Update `eslint.config.js`

Add `typescript-eslint` config block after the existing JS config:

```js
import tseslint from 'typescript-eslint'

export default [
  // ... existing JS config ...
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx']
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // warn, not error — migration period
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
]
```

### 0.4 — Update `vite.config.js`

```js
// Change test.include from:
include: ['**/*.test.{js,jsx}']
// To:
include: ['**/*.test.{js,jsx,ts,tsx}']
```

### 0.5 — Update `package.json`

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

Add a type-check script:

```json
"typecheck": "tsc --noEmit"
```

### 0.6 — Create type shims

Create `src/types/gif.d.ts` and `src/types/upng.d.ts` (see declarations above).

---

## Phase 1 — Engine: Shared Types

**Effort**: ~1 day  
**Risk**: low — new files only

Create `src/engine/types.ts` as the single source of truth for all engine-facing interfaces. Everything else imports from here.

```ts
import type * as THREE from 'three'

// ─── Animation ────────────────────────────────────────────────────────────────

export interface AnimationEffects {
  spinX: boolean
  spinY: boolean
  spinZ: boolean
  float: boolean
  bounce: boolean
  pulse: boolean
  shake: boolean
  orbit: boolean
}

export interface AnimationContext {
  time: number
  animationEffects: AnimationEffects
  camera: THREE.PerspectiveCamera | null
  speed: number
}

// ─── Rendering ────────────────────────────────────────────────────────────────

export interface EffectOptions {
  // Shared
  pixelSize?: number
  colors?: string[]
  transparent?: boolean
  backgroundColor?: string
  // Dithering
  ditherType?: string
  // Halftone
  halftoneDotShape?: 'circle' | 'diamond'
  halftoneAngle?: number
  halftoneCmyk?: boolean
  // LED Matrix
  ledGap?: number
  ledGlowRadius?: number
  ledShape?: 'circle' | 'roundRect'
  // Stipple
  stippleDotSize?: number
  stippleDensity?: number
  // ASCII
  asciiChars?: string
  asciiFont?: string
  asciiFontSize?: number
  asciiInvert?: boolean
  // Post-processing
  crtEnabled?: boolean
  scanlineGap?: number
  scanlineOpacity?: number
  chromaticAberration?: number
  crtVignette?: number
  bloomEnabled?: boolean
  bloomThreshold?: number
  bloomRadius?: number
  bloomStrength?: number
  noiseEnabled?: boolean
  noiseOpacity?: number
  noiseMonochrome?: boolean
  colorShiftEnabled?: boolean
  hueShift?: number
  saturationMultiplier?: number
  // Plugin params
  pluginParams?: Record<string, unknown>
  [key: string]: unknown // allow plugin-registered options
}

export interface Particle {
  idx: number
  startX: number
  startY: number
  finalX: number
  finalY: number
  delay: number
  distFromCenter: number
  brightness: number
  color: string
}

// ─── Plugin API ────────────────────────────────────────────────────────────────

export interface SchemaField {
  type: 'integer' | 'number' | 'boolean' | 'string'
  title?: string
  minimum?: number
  maximum?: number
  enum?: string[]
  default?: unknown
}

export type PluginSchema = Record<string, SchemaField>

export type RendererConstructor = new (options?: EffectOptions) => import('./renderers/BaseRenderer').BaseRenderer
export type PostEffectConstructor = new (
  options?: EffectOptions
) => import('./postprocessing/PostProcessingChain').PostEffect

export interface RendererRegistration {
  RendererClass: RendererConstructor
  schema: PluginSchema
  label: string
}

export interface PostEffectRegistration {
  EffectClass: PostEffectConstructor
  schema: PluginSchema
  label: string
}
```

---

## Phase 2 — Engine Migration

**Effort**: ~5 days  
**Risk**: medium — source files change but engine is isolated from React

Migrate files in dependency order (leaves first, root last). Each file: rename `.js` → `.ts`, add type annotations, fix errors, run `npm test` to verify.

### Dependency order (bottom-up)

```
utils/seededRandom.js           ← no deps, 25 lines, easy
animation/effectTypes.js        ← no deps, JSDoc already there
animation/presets.js            ← no deps, 22 lines
renderers/BaseRenderer.js       ← no deps, most important interface

  renderers/BitmapRenderer.js   ← extends BaseRenderer
  renderers/PixelArtRenderer.js
  renderers/AsciiRenderer.js
  renderers/HalftoneRenderer.js
  renderers/LedMatrixRenderer.js
  renderers/StippleRenderer.js
  renderers/index.js            ← registry, depends on all renderers

effects/ditherStrategies.js     ← no deps, JSDoc already there
loaders/modelLoader.js          ← Three.js types
loaders/shapeGenerator.js
loaders/textGenerator.js
loaders/imageLoader.js

animation/effects/BaseAnimationEffect.js
animation/effects/SpinEffect.js
animation/effects/FloatEffect.js
animation/effects/BounceEffect.js
animation/effects/PulseEffect.js
animation/effects/ShakeEffect.js
animation/effects/OrbitEffect.js

effects/fadeVariants/BaseFadeVariant.js
effects/fadeVariants/{all 5 variants}
effects/fadeVariants/index.js

postprocessing/effects/CrtEffect.js
postprocessing/effects/NoiseEffect.js
postprocessing/effects/ColorShiftEffect.js
postprocessing/effects/BloomEffect.js
postprocessing/PostProcessingChain.js

plugins/PluginRegistry.js       ← imports RendererConstructor from types.ts
plugins/builtinPlugins.js

effects/BaseEffect.js           ← imports Particle, EffectOptions
effects/BitmapEffect.js         ← depends on BaseEffect + renderers

animation/AnimationEngine.js    ← depends on all animation effects
SceneManager.js                 ← root, depends on everything
index.js                        ← just re-exports, update to .ts
```

### High-attention files

**`renderers/BaseRenderer.ts`** — convert to abstract class:

```ts
export abstract class BaseRenderer {
  abstract render(
    imageData: Uint8ClampedArray,
    gridW: number,
    gridH: number,
    getColor: (brightness: number) => string
  ): void
  abstract drawPixel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    brightness: number
  ): void
  abstract beginFrame(ctx: CanvasRenderingContext2D, width: number, height: number): void
  abstract endFrame(ctx: CanvasRenderingContext2D): void
  abstract shouldDraw(brightness: number): boolean
  abstract setSize(width: number, height: number): void
  abstract dispose(): void
}
```

**`plugins/PluginRegistry.ts`** — the `_registered` field is accessed from `builtinPlugins.js`. Keep it `public` (or rename to `isRegistered(): boolean` method) to avoid breaking the guard in `builtinPlugins`.

**`SceneManager.ts`** — the `_disposeGroup` material traversal:

```ts
// Cast to a traversable record — the isTexture/dispose check is intentional
;(material as Record<string, unknown>)[key]
```

The `effectOptions` constructor argument should be typed as `Partial<EffectOptions>`.

**`animation/AnimationEngine.ts`** — `ANIMATION_EFFECT_KEYS` can be narrowed:

```ts
const ANIMATION_EFFECT_KEYS = Object.freeze(Object.keys(DEFAULT_ANIMATION_EFFECTS) as (keyof AnimationEffects)[])
```

This makes `setAnimationEffect(key: keyof AnimationEffects, value: boolean)` fully type-safe.

---

## Phase 3 — `packages/embed/` Migration

**Effort**: ~1 day  
**Risk**: low — 5 files, isolated package

Migrate after engine so the `@engine` alias points to typed files.

1. `projectParser.js` → `.ts` (32 lines, minimal deps)
2. `BitmapForgeElement.js` → `.ts` (125 lines, imports SceneManager)
3. `index.js` → `.ts`

Update `packages/embed/package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./dist/bitmap-forge.es.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}
```

This is the first npm-publishable typed output of the project.

---

## Phase 4 — App Layer: Types Infrastructure

**Effort**: ~1 day  
**Risk**: low — new files only

Create `src/app/types.ts` with all store-facing types before touching any store file:

```ts
import type { AnimationEffects, EffectOptions } from '@engine/types'

// ─── Store ────────────────────────────────────────────────────────────────────

export type RenderMode = 'bitmap' | 'pixelArt' | 'halftone' | 'ledMatrix' | 'stipple' | 'ascii'
export type InputType = 'model' | 'shape' | 'text' | 'image'
export type DitherType = 'bayer4x4' | 'bayer8x8' | 'variableDot' | 'errorDiffusion' | 'none'

export interface ModelInfo {
  file: File
  name: string
  size: number
  format: string
}

export interface StatusState {
  loading: boolean
  error: string
  exporting: boolean
  message: string
  progress: number
}

// ─── Export ───────────────────────────────────────────────────────────────────

export type ExportFormat =
  | 'apng'
  | 'gif'
  | 'webm'
  | 'spriteSheet'
  | 'singleHtml'
  | 'embed'
  | 'react'
  | 'webComponent'
  | 'css'
  | 'lottie'
  | 'codeZip'

export interface ExportOptions {
  format: ExportFormat
  fps: number
  onProgress?: (p: number) => void
}

// ─── Project file ────────────────────────────────────────────────────────────

export interface ProjectFileV2 {
  version: 2
  colors: string[]
  pixelSize: number
  renderMode: RenderMode
  animationEffects: AnimationEffects
  // ... full shape
}
```

---

## Phase 5 — Store Migration

**Effort**: ~3 days  
**Risk**: HIGH — most complex typing in the project

This is the hardest phase. The Zustand 5 + zundo 2 + subscribeWithSelector middleware chain requires precise generic annotation.

### Step 5.1 — Define full store state type

In `src/app/store/types.ts`:

```ts
import type { RenderingSlice } from './slices/renderingSlice'
import type { AnimationSlice } from './slices/animationSlice'
import type { InputSlice } from './slices/inputSlice'
import type { PostEffectsSlice } from './slices/postEffectsSlice'
import type { TransformSlice } from './slices/transformSlice'
import type { StatusSlice } from './slices/statusSlice'

export type StoreState = RenderingSlice & AnimationSlice & InputSlice & PostEffectsSlice & TransformSlice & StatusSlice
```

### Step 5.2 — Convert slices one at a time

Each slice exports both its state type and its creator:

```ts
// renderingSlice.ts
import type { StateCreator } from 'zustand'
import type { StoreState } from '../types'

export interface RenderingSlice {
  colors: string[]
  pixelSize: number
  renderMode: RenderMode
  ditherType: DitherType
  // ... all state fields
  setColors: (colors: string[]) => void
  setPixelSize: (size: number) => void
  // ... all actions
}

export const createRenderingSlice: StateCreator<
  StoreState,
  [['zustand/subscribeWithSelector', never], ['temporal', unknown]],
  [],
  RenderingSlice
> = (set, get) => ({
  // ... implementation
})
```

Repeat for all 6 slices. Each can be migrated and tested independently.

### Step 5.3 — Type the zundo `partialize` callback

The `Object.fromEntries(Object.entries(state).filter(...))` pattern cannot be inferred. Replace with an explicit object:

```ts
// Define which keys are excluded from undo history
type TransientKeys = 'status' | 'model' | 'imageSource' | 'pluginParams'
type TemporalState = Omit<StoreState, TransientKeys | ActionKeys>

// In createStore:
partialize: (state): TemporalState => {
  const { status, model, imageSource, pluginParams, ...rest } = state
  // Filter out functions (actions)
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as TemporalState
}
```

### Step 5.4 — Wire the store creator

```ts
export const useProjectStore = create<StoreState>()(
  temporal(
    subscribeWithSelector((set, get, api) => ({
      ...createRenderingSlice(set, get, api),
      ...createAnimationSlice(set, get, api)
      // ...
    })),
    { partialize, limit: 50 }
  )
)
```

> **Spike recommendation**: do Step 5.2 for just `renderingSlice` + Step 5.4 with a single slice first. Confirm the generic chain works end-to-end before migrating all 6 slices. The Zustand v5 docs have an explicit "Slices Pattern with TypeScript" section — follow it exactly.

---

## Phase 6 — Hooks and Utils

**Effort**: ~2 days  
**Risk**: medium

### Order

1. `utils/clamp.ts` — consolidate the 5 duplicate `clamp` functions from each slice into one utility
2. `utils/projectFile.ts` — `parseProjectData` already has JSDoc, straightforward
3. `utils/framesProvider.ts` — already fully JSDoc'd
4. `utils/apngExport.ts`, `utils/spriteSheetExport.ts` — small, low complexity
5. `utils/codeExport.ts`, `utils/embedExport.ts`, `utils/engineSources.ts`
6. `utils/cssExport.ts`, `utils/lottieExport.ts`
7. `utils/reactComponentExport.ts`, `utils/webComponentExport.ts`
8. `hooks/useAutoSave.ts`, `hooks/useKeyboardShortcuts.ts`
9. `hooks/useExport.ts` — last, most complex

### `useExport.ts` specific notes

- `FORMAT_HANDLERS` map: type each handler's `execute` function explicitly as `(args: ExportHandlerArgs) => Promise<Blob | void>`
- The `manager` parameter in each handler: import `SceneManager` type from `@engine/SceneManager`
- The `gif.js` usage: the local shim above provides the types
- WebM `VideoEncoder` path: `@types/dom-webcodecs` is already installed — add `/// <reference types="@types/dom-webcodecs" />` at the top if needed

---

## Phase 7 — React Components

**Effort**: ~3 days  
**Risk**: medium — largest file count, but most complexity is isolated

### Approach

Rename `.jsx` → `.tsx`. Add explicit `interface Props {}` to each component. The TypeScript compiler will surface all prop-type issues at once.

### Order (easiest to hardest)

1. Small single-purpose components: `ModelUploader`, `LightDirection`, `ExportPanel` toggles
2. `AnimationControls` — key change: `setAnimationEffect(key: keyof AnimationEffects, value)` is now type-checked
3. `ColorPalette` — dnd-kit is typed, straightforward
4. `PluginControls/SchemaControls` — already has some JSDoc; `Object.entries(schema)` becomes `[string, SchemaField][]`
5. `InputSource`, `ShapeSelector`, `TextInput`, `ImageInput`
6. `ExportPanel` — large but mostly prop drilling
7. `QualitySettings` — largest component (601 lines); consider splitting as part of the migration
8. `PreviewCanvas` — engine/React bridge; the `sceneManagerRef` becomes `MutableRefObject<SceneManager | null>`
9. `Layout` — app shell, migrated last

### `PreviewCanvas.tsx` specific notes

```ts
import type { SceneManager } from '@engine/SceneManager'

const sceneManagerRef = useRef<SceneManager | null>(null)
```

The `inputType` switch becomes exhaustive:

```ts
const inputType = useProjectStore(s => s.inputType)  // typed as InputType
switch (inputType) {
  case 'model': ...
  case 'shape': ...
  case 'text': ...
  case 'image': ...
  // TS will error if a case is missing
}
```

---

## Phase 8 — Tests

**Effort**: ~1 day  
**Risk**: low

- Update `vite.config.js` test glob: `**/*.test.{js,jsx,ts,tsx}` (done in Phase 0)
- Rename test files alongside their source files (e.g., `BitmapRenderer.test.js` → `.test.ts`)
- Most tests need only minor type fixes — `as unknown as X` casts in mocks, explicit `vi.fn<[ArgType], ReturnType>()` signatures
- The `packages/embed` test files: rename and update `vi.mock` factories to use proper constructor types

---

## Risk Summary

| Area             | Risk     | Primary challenge                                           |
| ---------------- | -------- | ----------------------------------------------------------- |
| Tooling setup    | Low      | Starting from zero tsconfig                                 |
| Engine files     | Medium   | `_disposeGroup` material cast, renderer registry dispatch   |
| Plugin API       | Medium   | `_registered` visibility, `RendererConstructor` in registry |
| Zustand store    | **High** | 3-layer middleware generics, zundo `partialize` type        |
| `useExport.js`   | Medium   | `gif.js` shim, FORMAT_HANDLERS typing                       |
| React components | Medium   | Volume of files; `QualitySettings` size                     |
| Tests            | Low      | Minor cast updates                                          |

---

## Recommended Approach: Don't Stop the World

The key to making this work alongside ongoing development:

1. **Phase 0 first** — the `allowJs: true` + `checkJs: false` tsconfig means all existing JS files continue to work unchanged. The migration is purely additive at first.
2. **One directory at a time** — finish all of `src/engine/` before touching `src/app/`. PRs stay reviewable.
3. **`npm run typecheck` in CI from day one** — even when most files are still JS, the TS files get checked. Prevents regression as the migration grows.
4. **Spike the Zustand store first** — don't save it for last. Do a proof-of-concept with one slice and the full middleware chain before Phase 5 begins. If the generic chain is unsolvable, the fallback is `as unknown as StoreState` casts in the creators (still safe at runtime, just not inferred). Decide early.
5. **`@typescript-eslint/no-explicit-any` as `warn` not `error`** during migration — flip to `error` after Phase 7 completes.

---

## Phase Checklist

```
[ ] Phase 0 — Tooling (tsconfig, eslint, vite glob, lint-staged, type shims)
[ ] Phase 1 — Engine shared types (src/engine/types.ts, src/app/types.ts)
[ ] Phase 2 — Engine files (bottom-up dependency order, ~27 files)
[ ] Phase 3 — packages/embed/ (5 files, add types to exports)
[ ] Phase 4 — App shared types (src/app/store/types.ts, ExportOptions, etc.)
[ ] Phase 5 — Zustand store (spike renderingSlice first, then all 6 slices)
[ ] Phase 6 — Hooks and utils (~15 files)
[ ] Phase 7 — React components (~25 files)
[ ] Phase 8 — Tests (rename + type fixes)
[ ] Flip @typescript-eslint/no-explicit-any to error
[ ] Enable noUncheckedIndexedAccess in tsconfig
[ ] Publish packages/embed with types field in package.json
```
