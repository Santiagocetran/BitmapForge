# Code Modularity & Organization

Guide for improving the codebase so contributors can work on isolated sections without needing deep knowledge of the whole project.

---

## Current State

The architecture already has a good foundation:

- **`src/engine/`** has zero imports from `src/app/` — it's framework-agnostic
- **All UI components** communicate through a single Zustand store — no deep prop drilling
- **Utilities** (`codeExport.js`, `projectFile.js`) are pure functions

But there are three coupling points that make it harder for contributors:

| Problem                      | Where                                                        | Impact                                                                    |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `sceneManagerRef` threading  | Layout → PreviewCanvas, Layout → ExportPanel                 | Implicit communication channel; new contributors won't discover it easily |
| Legacy dead code             | `src/animations/`, `src/effects/`                            | Confusing — which files are the "real" engine?                            |
| Implicit animation contracts | Store's `animationEffects` keys must match `AnimationEngine` | Adding a new animation requires changes in two disconnected files         |

---

## Change 1: Delete Legacy Dead Code

Remove these files — they are the original npm package code, superseded by `src/engine/`:

```
src/animations/modelAnimation.js   ← replaced by src/engine/SceneManager.js + AnimationEngine.js
src/effects/BitmapEffect.js        ← replaced by src/engine/effects/BitmapEffect.js
src/effects/ColoredAsciiEffect.js  ← unused, can be rebuilt from BaseEffect when ASCII mode is added
```

Also remove the empty `src/react/` directory if it still exists.

All of this code is preserved in git history and can be referenced when implementing the ASCII rendering mode later.

---

## Change 2: SceneManager React Context

### Problem

Currently, `Layout` creates a `useRef(null)` and threads it as a prop:

- `Layout` → `PreviewCanvas` (which populates `ref.current` with the SceneManager instance)
- `Layout` → `ExportPanel` (which reads `ref.current` via the `useExport` hook)

This is invisible to a contributor reading `ExportPanel` in isolation — there's no obvious indication of where the SceneManager comes from or what its lifecycle is.

### Solution

Create a `SceneManagerProvider` context that owns the ref. Components that need the engine use a `useSceneManager()` hook.

**Create `src/app/context/SceneManagerContext.jsx`:**

```jsx
import { createContext, useContext, useRef } from 'react'

const SceneManagerContext = createContext(null)

function SceneManagerProvider({ children }) {
  const sceneManagerRef = useRef(null)
  return <SceneManagerContext.Provider value={sceneManagerRef}>{children}</SceneManagerContext.Provider>
}

function useSceneManager() {
  const ref = useContext(SceneManagerContext)
  if (!ref) throw new Error('useSceneManager must be used within SceneManagerProvider')
  return ref
}

export { SceneManagerProvider, useSceneManager }
```

**Update `App.jsx`:**

```jsx
import { useEffect } from 'react'
import { Layout } from './components/Layout/Layout.jsx'
import { useAutoSave } from './hooks/useAutoSave.js'
import { SceneManagerProvider } from './context/SceneManagerContext.jsx'

function App() {
  useAutoSave()

  useEffect(() => {
    document.title = 'BitmapForge'
  }, [])

  return (
    <SceneManagerProvider>
      <Layout />
    </SceneManagerProvider>
  )
}

export { App }
```

**Update `PreviewCanvas.jsx`:** Replace `{ sceneManagerRef }` prop with:

```jsx
import { useSceneManager } from '../../context/SceneManagerContext.jsx'
// ...
function PreviewCanvas() {
  const sceneManagerRef = useSceneManager()
  // ... rest unchanged
}
```

**Update `ExportPanel.jsx`:** Same pattern:

```jsx
import { useSceneManager } from '../../context/SceneManagerContext.jsx'
// ...
function ExportPanel() {
  const sceneManagerRef = useSceneManager()
  const { exportGif, ... } = useExport(sceneManagerRef)
  // ... rest unchanged
}
```

**Update `Layout.jsx`:** Remove the `useRef` and stop passing `sceneManagerRef` as a prop:

```jsx
function Layout() {
  const model = useProjectStore((state) => state.model)
  const status = useProjectStore((state) => state.status)
  // ...
  <PreviewCanvas />
  // ...
  <ExportPanel />
}
```

### Why this matters for contributors

- A contributor working on a new panel that needs engine access just imports `useSceneManager()` — no need to understand the Layout component's ref wiring
- The pattern is explicit and discoverable via IDE "Find References"
- It follows the same convention as `useProjectStore` — hooks for shared state

---

## Change 3: JSDoc on the Engine Public API

Since the project stays with JavaScript (no TypeScript), JSDoc comments on `SceneManager`'s public methods are the primary way contributors learn the engine API.

Add JSDoc to each public method in `src/engine/SceneManager.js`:

```js
/**
 * Load a 3D model file into the scene. Disposes any previous model.
 * Supported formats: .stl, .obj, .gltf, .glb
 * @param {File} file - The model file to load
 * @returns {Promise<void>}
 */
async loadModel(file) { ... }

/**
 * Update bitmap rendering options. Changes apply immediately to the live preview.
 * @param {{ pixelSize?: number, ditherType?: string, colors?: string[], invert?: boolean, minBrightness?: number, backgroundColor?: string, animationDuration?: number }} options
 */
updateEffectOptions(options) { ... }

/**
 * Update animation behavior. Changes apply on the next animation frame.
 * @param {{ useFadeInOut?: boolean, animationEffects?: { spinX: boolean, spinY: boolean, spinZ: boolean, float: boolean }, animationSpeed?: number, showPhaseDuration?: number, animationDuration?: number }} options
 */
updateAnimationOptions(options) { ... }

/**
 * Pause the animation loop. Use before frame-stepping during export.
 * Always call resumeLoop() when done.
 */
pauseLoop() { ... }

/**
 * Seek animation to a specific time and render one frame.
 * Used for export: step through the loop to capture frames.
 * @param {number} absoluteTimeMs - Time in milliseconds within the loop
 */
renderAtTime(absoluteTimeMs) { ... }

/**
 * Get the total duration of one animation loop in milliseconds.
 * Used by export functions to know how many frames to capture.
 * @returns {number}
 */
getLoopDurationMs() { ... }
```

---

## Change 4: Shared Animation Effect Definitions

### Problem

The store defines `animationEffects: { spinX: false, spinY: true, spinZ: false, float: false }` and `AnimationEngine` reads those same keys. There's no shared definition — the contract is implicit.

### Solution

Create a shared constants file that both the store and engine import:

**Create `src/engine/animation/effectTypes.js`:**

```js
/**
 * All available animation effect keys.
 * Used by both the Zustand store and AnimationEngine.
 * To add a new animation effect:
 *   1. Add the key here
 *   2. Implement the rotation logic in AnimationEngine.update()
 *   3. Add UI controls in AnimationControls component
 */
const ANIMATION_EFFECT_KEYS = ['spinX', 'spinY', 'spinZ', 'float']

/** Default enabled/disabled state for each effect */
const DEFAULT_ANIMATION_EFFECTS = Object.fromEntries(ANIMATION_EFFECT_KEYS.map((key) => [key, key === 'spinY']))

export { ANIMATION_EFFECT_KEYS, DEFAULT_ANIMATION_EFFECTS }
```

Import `DEFAULT_ANIMATION_EFFECTS` in `useProjectStore.js` and use it for the default state. Import `ANIMATION_EFFECT_KEYS` in `AnimationEngine.js` to validate incoming keys.

This way, a contributor adding a new animation type (e.g., `bounce`) follows a clear, documented path: one file to add the key, one file for the logic, one component for the UI.

---

## Resulting Module Boundaries

After these changes, the architecture has clear, enforceable boundaries:

```
src/engine/                          # NEVER imports from src/app/
  SceneManager.js                    # Facade — the ONLY class app code touches
  animation/effectTypes.js           # Shared contract (imported by both layers)
  animation/AnimationEngine.js       # Internal to engine
  animation/presets.js               # Internal to engine
  effects/BaseEffect.js              # Internal to engine
  effects/BitmapEffect.js            # Internal to engine
  loaders/modelLoader.js             # Internal to engine

src/app/                             # NEVER imports engine internals, only SceneManager
  context/SceneManagerContext.jsx     # Engine access via useSceneManager()
  store/useProjectStore.js           # All app state via useProjectStore()
  components/                        # Each component is self-contained:
    ColorPalette/                    #   imports: useProjectStore
    AnimationControls/               #   imports: useProjectStore, effectTypes
    ExportPanel/                     #   imports: useProjectStore, useSceneManager, useExport
    PreviewCanvas/                   #   imports: useProjectStore, useSceneManager, SceneManager
    QualitySettings/                 #   imports: useProjectStore
    LightDirection/                  #   imports: useProjectStore
    ModelUploader/                   #   imports: useProjectStore
    Layout/                          #   imports: all components (composition root only)
```

### Rules for contributors

1. **Working on a UI component?** You only need to know `useProjectStore` (what state exists) and optionally `useSceneManager` (if your component needs engine access). You don't need to understand how the engine works internally.
2. **Working on the engine?** You only need to understand `SceneManager` and the files under `src/engine/`. You never touch React.
3. **Adding a new animation?** Follow the path in `effectTypes.js` — add the key, implement in `AnimationEngine`, add UI in `AnimationControls`.
4. **Adding a new export format?** Add a function in `useExport.js`, add a button in `ExportPanel`. Both access the engine only through `useSceneManager()`.

---

## Implementation Order

1. Delete legacy dead code (`src/animations/`, `src/effects/`, `src/react/`)
2. Create `SceneManagerContext.jsx`, update `App.jsx`, `PreviewCanvas.jsx`, `ExportPanel.jsx`, `Layout.jsx`
3. Create `effectTypes.js`, update store and `AnimationEngine` to import from it
4. Add JSDoc to `SceneManager.js` public methods
