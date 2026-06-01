# Image Scale Feature — Implementation Plan

## Summary

Add a "Scale" slider to the Image tab in the Input section, mirroring the existing 3D model scale control. Users will be able to uniformly resize their uploaded image inside the app before exporting.

---

## How It Works Today (Model Scale Reference)

| Layer        | File                                                       | What it does                                                                |
| ------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| Store        | `src/app/store/slices/transformSlice.js`                   | `modelScale: 1.0` state, `setModelScale(scale)` setter clamped to [0.1, 10] |
| Engine       | `src/engine/SceneManager.js:229`                           | `setModelScale(scale)` → `this.baseGroup.scale.setScalar(scale)`            |
| React bridge | `src/app/components/PreviewCanvas/PreviewCanvas.jsx:75-78` | Subscription that calls `manager.setModelScale(scale)` on state change      |
| UI           | `src/app/components/InputSource/InputSource.jsx:40-57`     | Range slider visible only when `inputType === 'model' && model`             |

The key insight: `modelScale` and the upcoming `imageScale` both write to `baseGroup.scale`. Only one input type is active at a time, but the state values can still change together during project load, reset, or undo/redo. Therefore scale synchronization must have exactly one active decision point: apply `imageScale` only when `inputType === 'image'`; otherwise apply `modelScale`.

---

## Implementation Steps

### Step 1 — Store: `src/app/store/slices/transformSlice.js`

Add `imageScale` to `TRANSFORM_DEFAULTS` and add a setter.

```js
export const TRANSFORM_DEFAULTS = {
  lightDirection: { x: 3, y: 4, z: 5 },
  baseRotation: { x: 0, y: 0, z: 0 },
  modelScale: 1.0,
  imageScale: 1.0 // NEW
}

export const createTransformSlice = (set) => ({
  ...TRANSFORM_DEFAULTS,

  setLightDirection: (lightDirection) => set({ lightDirection }),
  setBaseRotation: (x, y, z) => set({ baseRotation: { x, y, z } }),
  resetBaseRotation: () => set({ baseRotation: { x: 0, y: 0, z: 0 } }),
  setModelScale: (scale) => set({ modelScale: clamp(scale, 0.1, 10) }),
  setImageScale: (scale) => set({ imageScale: clamp(scale, 0.1, 10) }) // NEW
})
```

**Why separate state?** Model scale and image scale are independent preferences. A user who zoomed in on a model shouldn't have that carry over to their next image (and vice versa). They each persist independently.

---

### Step 2 — Engine: `src/engine/SceneManager.js`

Add `setImageScale()` immediately after `setModelScale()` (around line 231):

```js
/**
 * Uniformly scale the image plane. Mirrors setModelScale but kept separate
 * so model and image scales don't bleed into each other on tab switch.
 * @param {number} scale
 */
setImageScale(scale) {
  this.baseGroup.scale.setScalar(scale)
}
```

The body is identical to `setModelScale` — both target `baseGroup.scale`. The separation is semantic and lives at the store/React layer.

---

### Step 3 — React bridge: `src/app/components/PreviewCanvas/PreviewCanvas.jsx`

Two changes are needed:

**3a. Replace the model-only scale subscription with one active-scale subscription.**

Do **not** add separate `modelScale` and `imageScale` subscriptions that both write to `baseGroup.scale`. If both values change in the same store update, the last subscription to run can leave the active object with the wrong scale.

Add a small helper inside the SceneManager setup effect:

```js
const applyActiveScale = ({ inputType, modelScale, imageScale }) => {
  if (inputType === 'image') {
    manager.setImageScale(imageScale)
  } else {
    manager.setModelScale(modelScale)
  }
}
```

Use it for initial sync:

```js
applyActiveScale(s)
```

Then subscribe to the combined active-scale inputs:

```js
const unsubScale = useProjectStore.subscribe(
  (state) => ({
    inputType: state.inputType,
    modelScale: state.modelScale,
    imageScale: state.imageScale
  }),
  applyActiveScale,
  { equalityFn: shallow }
)
```

Call `unsubScale()` in cleanup. Remove the existing `unsubModelScale` subscription.

**3b. Re-apply the correct scale before loading content on input/source changes.**

The combined subscription handles normal state changes, but the content-loading effect is still the right place to make the invariant explicit before any `loadModel()`, `loadShape()`, `loadText()`, or `loadImage()` call:

```js
// Re-apply the correct scale for the active input type so switching tabs
// doesn't leave the previous type's scale on baseGroup.
const { modelScale, imageScale } = useProjectStore.getState()
if (inputType === 'image') {
  manager.setImageScale(imageScale)
} else {
  manager.setModelScale(modelScale)
}
```

This ensures that if a user had a 3× model scale and then switches to Image, the image starts at its own saved scale (default 1.0) rather than inheriting 3×.

**3c. Add `imageScale` to the selector only if the loading effect depends on it.**

With the combined active-scale subscription above, the content-loading effect does not need `imageScale` or `modelScale` in `selectInputSource`. Avoid adding either scale value to that selector unless the effect needs to reload content when scale changes. Scaling should not reload the object.

---

### Step 4 — UI: `src/app/components/InputSource/InputSource.jsx`

**4a. Pull `imageScale` and `setImageScale` from the store:**

```js
const imageScale = useProjectStore((state) => state.imageScale)
const setImageScale = useProjectStore((state) => state.setImageScale)
const imageSource = useProjectStore((state) => state.imageSource)
```

**4b. Add the slider after `<ImageInput />` (line 60), conditional on `imageSource` being set:**

```jsx
{
  inputType === 'image' && <ImageInput />
}
{
  inputType === 'image' && imageSource && (
    <div className="space-y-1">
      <label htmlFor="input-image-scale" className="flex items-center text-xs text-zinc-400">
        Scale: {imageScale.toFixed(2)}×
        <InfoTooltip content="Uniformly scales the image. Useful when the image appears too large or too small in the preview." />
      </label>
      <input
        id="input-image-scale"
        type="range"
        min="0.1"
        max="10"
        step="0.05"
        value={imageScale}
        onChange={(e) => setImageScale(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
```

This matches the model scale slider exactly in structure and style.

---

## Files Changed

| File                                                 | Change                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/app/store/slices/transformSlice.js`             | Add `imageScale: 1.0` default + `setImageScale()` setter                   |
| `src/engine/SceneManager.js`                         | Add `setImageScale(scale)` method                                          |
| `src/app/components/PreviewCanvas/PreviewCanvas.jsx` | Add subscription + re-sync on tab switch                                   |
| `src/app/components/InputSource/InputSource.jsx`     | Add slider UI + pull `imageScale`/`setImageScale`/`imageSource` from store |

No new runtime files needed. No changes to image loading logic or test configuration.

Tests should be updated or added because this touches shared transform state and preview synchronization.

---

## Edge Cases

| Case                                           | Handled by                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| User switches from model (scale 3×) to image   | Step 3b re-applies `imageScale` (1.0) on inputType change                                          |
| User switches from image (scale 0.5×) to model | Step 3b re-applies `modelScale` on inputType change                                                |
| Image removed and re-uploaded                  | Scale persists (same behavior as model scale — intentional)                                        |
| No image uploaded yet                          | Slider hidden (`imageSource` guard)                                                                |
| Project file save/load                         | `imageScale` is not transient, so `.bitmapforge` save/load includes it via `buildProjectPayload()` |
| Undo/redo changes both scales                  | Combined active-scale subscription applies only the scale for the current `inputType`              |

---

## Out of Scope

- Separate X/Y scale (non-uniform stretch) — not needed, aspect ratio is preserved by the image plane geometry
- Scale reset button — model scale doesn't have one either; consistent omission
- Scale range beyond [0.1, 10] — covers any practical use case
- Re-enabling localStorage auto-save — `useAutoSave` is currently disabled, so `imageScale` will not persist to localStorage unless that feature is restored separately

---

## Export Follow-Up

Live canvas exports (`APNG`, `GIF`, `Video`, `Sprite Sheet`, and CSS animation capture paths) use the current `SceneManager`, so they should reflect `imageScale` once the preview scale sync is correct.

Generated/runtime exports need an explicit decision:

| Export path       | Current behavior                                                  | Recommendation                                                                              |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| React component   | Applies `lightDirection` and `baseRotation`, but not `modelScale` | Add scale to `buildExportConfig()` and call `manager.setModelScale(config.modelScale ?? 1)` |
| Web Component ZIP | Applies `lightDirection` and `baseRotation`, but not `modelScale` | Same as React component                                                                     |
| Code ZIP          | Currently model-centric and does not apply scale                  | Either apply `modelScale` or document current limitation                                    |
| Embed ZIP / SDK   | Image input is blocked, but model scale is still not applied      | Apply `modelScale` from settings for non-image inputs                                       |
| CLI harness       | Does not apply transform scale from project settings              | Apply active scale from settings after manager creation                                     |

This is technically broader than the image slider UI, but the phrase "before exporting" should be interpreted carefully. If generated exports are expected to match preview, include this in the implementation or open a separate export parity task.

---

## Recommended Tests

| Area                       | Test                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Store                      | `DEFAULT_STATE` includes `imageScale`; `setImageScale()` clamps to `[0.1, 10]`; `resetToDefaults()` restores `1.0` |
| Project files              | `buildProjectPayload()` includes `imageScale` in `settings`                                                        |
| Preview sync               | Mock `SceneManager` and verify combined updates apply `imageScale` only for image input and `modelScale` otherwise |
| UI                         | Image scale slider appears only when `inputType === 'image'` and an image file exists                              |
| Export parity, if included | Generated React/Web Component configs include scale and generated code applies it                                  |
