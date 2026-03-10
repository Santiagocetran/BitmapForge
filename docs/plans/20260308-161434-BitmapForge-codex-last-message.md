**Findings**

- High: Back-compat wrappers omit the existing “fadeIn” kick. Today, `loadModel/loadShape/...` trigger `effect.startAnimation('fadeIn')`. The new wrappers must preserve this on the 0→1 layer transition; otherwise users won’t see the expected entry animation.
- High: Disposal correctness. `removeLayer/clearLayers` must traverse and dispose geometries, materials, textures, and revoke object URLs per layer to avoid GPU/memory leaks. Shapes/text layers need geometry/material disposal; image layers must dispose textures.
- High: Preview diffing can thrash and double-load. A naïve deep-diff on `layers` risks re-adding objects on every transform/name change (new object identities). Per vercel-react-best-practices, prefer event-driven updates over broad effects; if diffing, use stable IDs and primitive compares only.
- Medium: Render order uncertainty. Reordering by mutating `animGroup.children` alone isn’t stable for transparency; set each layer group’s `renderOrder` to the store index to guarantee paint order.
- Medium: Undo stack bloat. Including `layers` with full transforms in temporal middleware can explode history during drag/gizmo moves. Filter or throttle transform updates (e.g., only push to history on pointer up) to keep undo usable.
- Medium: `fileRegistry` lifetime. Module-level `Map` survives undo/redo but can leak across HMR/tests. Provide `resetFileRegistry()` and clear entries when a layer is permanently removed; document test helpers.
- Low: Scale API only supports uniform scale. If non-uniform scaling may be needed later, keep structure `scale: {x,y,z}` internally even if UI exposes a uniform slider.
- Low: Migration path can double-load. “Keep old 4-effect until layers.length > 0” risks loading both paths once. Add an explicit feature flag or a one-shot switch.

**Plan**

- Implement `layers` Map in engine + full disposal + renderOrder.
- Keep back-compat methods; trigger fade-in on 0→1 layers.
- Add action-driven engine bridge; use minimal diff as fallback.
- Introduce `fileRegistry` with clear/reset helpers.
- Add Layer Panel UI and “Add to Scene” flow.
- Tame undo noise: filter transform updates and exclude `selectedLayerId`.

**Patch-ready edits**

- `src/engine/SceneManager.js`
  - Replace `this.modelGroup`/`this.currentObjectUrl` with `this.layers = new Map()`.
  - Add methods: `addModelLayer/addShapeLayer/addTextLayer/addImageLayer/removeLayer/clearLayers/setLayerVisible/setLayerTransform/reorderLayers/hasLayers`.
  - In `add*Layer`: create a `THREE.Group` with `id`, attach object, set defaults, set `group.renderOrder = index`, store `{ id, group, objectUrl, type, name, visible }` in the Map.
  - In `removeLayer`: remove from `animGroup`, traverse `group` to `dispose()` materials, geometries, textures; `URL.revokeObjectURL(objectUrl)` if present.
  - In `clearLayers`: iterate `this.layers.values()` and call `removeLayer(id)`.
  - In `setLayerTransform`: set position/rotation; for scale support uniform (`setScalar`) now, but accept `{ x,y,z }` internally.
  - In `reorderLayers(ids)`: update each group’s `renderOrder` to its index; optionally reorder `animGroup.children` to mirror store.
  - Back-compat: implement `loadModel/loadShape/loadText/loadImage` as `clearLayers()` + `add*Layer(nanoid(), ...)`; if previous `layers.size === 0` before add, call `this.effect.startAnimation('fadeIn')`.
  - Replace animation loop guard with `if (this.hasLayers())`.
- `src/app/store/fileRegistry.js` (new)
  - `export const fileRegistry = new Map()`; add helpers `registerFile(id, file)`, `getFile(id)`, `deleteFile(id)`, `resetFileRegistry()` for tests.
- `src/app/store/useProjectStore.js`
  - Add `layers: []`, `selectedLayerId: null`.
  - Add actions: `addLayerDescriptor`, `removeLayerDescriptor`, `setLayerVisible`, `setLayerTransform`, `updateLayer`, `reorderLayers`, `selectLayer`.
  - Temporal middleware: include `layers`, exclude `selectedLayerId`. Add a transform-update filter: only commit transform changes to history on end-of-interaction (pointer up) or debounce to RAF; otherwise store live transforms in a ref and flush on end.
  - Retain legacy fields during migration but gate legacy auto-load with a feature flag `compositionEnabled` (default true in dev behind issue #22).
- `src/app/components/PreviewCanvas/PreviewCanvas.jsx`
  - Add a single subscription to `layers` via `useStore.subscribe(s => s.layers, shallow)`.
  - Engine bridge (preferred): subscribe to specific store actions (add/remove/reorder/update/visibility/transform) and forward to engine one-for-one (vercel rerender-move-effect-to-event). If keeping diff: compare by `id`, and within an id only compare primitives `visible`, `position/rotation/scale` numbers; never compare whole objects by identity.
  - Maintain migration switch: when `compositionEnabled` OR `layers.length > 0`, disable the four legacy effects; else keep legacy path.
- `src/app/components/LayerPanel/LayerPanel.jsx`, `src/app/components/LayerPanel/LayerItem.jsx` (new)
  - Implement list with dnd-kit; wire `selectLayer`, `setLayerVisible`, `reorderLayers`, `removeLayerDescriptor`. Inline rename uses `updateLayer(id, { name })`. Transform controls write to `setLayerTransform`.
- `src/app/components/InputSource/InputSource.jsx`
  - Replace “load immediately” with “Add to Scene”. On click, build a `LayerDescriptor` (with `id = nanoid()`), call `addLayerDescriptor`, and for file inputs register in `fileRegistry`.
- `src/app/components/Layout/Layout.jsx`
  - Add collapsible “Layers” section that renders `LayerPanel`.

**Verification commands**

- Static checks
  - `npm run lint`
  - `npm run build`
- Unit tests (vital new ones)
  - Engine: add `src/engine/SceneManager.layers.test.js` covering 0→1 fade-in, add/remove/clear, reorder sets `renderOrder`, transform setters, disposal revokes URLs.
  - Store: add `useProjectStore.layers.test.js` for add/remove/reorder/visibility/transform and temporal filter behavior.
  - Registry: add `fileRegistry.test.js` for register/get/delete/reset.
  - Run: `npm test`
- Manual sanity
  - Start dev: `npm run dev`, add multiple layers (model + text + image); verify fade-in only on first layer, per-layer visibility/transform, reorder visual stacking (especially with transparency), undo/redo doesn’t explode history, removing layers frees GPU memory (track in devtools if available).

**Risks & edge cases**

- Transparent materials still sort by depth; `renderOrder` enforces painter’s order but may not perfectly solve all camera angles. Document limitation; consider per-material `depthWrite=false` where appropriate.
- Transform undo throttling: if too aggressive, users may lose fine-grained undo steps. Tune thresholds or toggle “record transforms continuously” in dev.
- HMR and tests: `fileRegistry` persistence may surprise. Ensure `resetFileRegistry()` is called in `beforeEach()` of tests and on hot dispose during dev.
- Text/shape disposal: fonts/extrude geometries can hold references; make sure any loaders created per layer are also cleaned up.
- Migration: dual-path loading can lead to orphaned engine nodes. Ensure legacy effects early-return when composition is active.

**One higher-upside, higher-risk alternative**

- Move engine sync to action-middleware only (no diffing). Implement a dedicated store middleware that intercepts `addLayerDescriptor/remove/...` and calls SceneManager immediately. This eliminates expensive diff logic and prevents redundant loads (aligns with vercel “move effect logic to events”), but requires carefully routing every layer action through the middleware and increases coupling between store and engine.

**Confidence + unknowns**

- Confidence: medium-high on architecture/risk calls; low on small integration details (exact method/prop names) without the code open.
- Unknowns: exact disposal utilities available today, how `effect` is wired, whether non-uniform scale is needed, and existing test harness.

**Short rationale**
The plan is directionally right: make the engine multi-layer without breaking callers, then add a thin UI/store layer. The main pitfalls are resource disposal, preserving current animation behavior, and avoiding a heavy diff-based React effect. Tightening those aligns with React best practices and keeps runtime costs predictable.
