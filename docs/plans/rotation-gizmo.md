# Rotation Gizmo Implementation Plan

## Executive Summary

This document outlines a complete implementation plan for adding an interactive 3D rotation gizmo overlay to the BitmapForge preview canvas. The gizmo will allow users to manually set a base rotation offset on the 3D model, which animates on top of the gizmo's offset (not replace it). The design balances ease of use, visual clarity, and minimal performance impact.

---

## 1. Current Architecture Analysis

### 1.1 Three.js Scene & Model Rotation

**File references:**

- `SceneManager.js:26-28` — Scene setup with Three.js
- `SceneManager.js:107-110` — Model loading (group creation and scene addition)
- `SceneManager.js:258` — Reset: `modelGroup.rotation.set(0, 0, 0)`

**Current state:**

- The loaded 3D model is wrapped in a `THREE.Group` called `modelGroup`
- The model is added to the scene at `SceneManager:110`
- `modelGroup.rotation` is a Three.js `Euler` object (XYZ order by default)
- Rotation is modified **directly** by the animation engine per frame:
  - `AnimationEngine.js:42-44` — Incremental spin (+=) per delta frame
  - `AnimationEngine.js:98-110` — Absolute rotation via `seekTo()` for export

**Key insight:** The modelGroup's Euler rotation is the **only** rotation state. There is no existing base/offset vs. animation-driven separation.

### 1.2 Animation Engine Rotation System

**File references:**

- `AnimationEngine.js:37-52` — `applyEffects()` applies incremental rotation
- `AnimationEngine.js:93-129` — `seekTo()` calculates absolute rotation at a point in time
- `presets.js:1-20` — Animation preset definitions (spinX, spinY, spinZ, float)

**Current rotation logic:**

- **Incremental model:** `applyEffects()` does `+=` on rotation components each frame
- **Absolute model:** `seekTo()` calculates total rotation from t=0 (used for export frame-stepping)
- Spin effects apply a constant angular velocity: `modelGroup.rotation.axis += speed * deltaSeconds`
- Float effect applies oscillatory rotation: `modelGroup.rotation.x += Math.sin(...) * ...`

**Problem for gizmo integration:**

- The animation engine directly mutates `modelGroup.rotation`
- There is no "base offset" layer separating manual rotation from animation-driven rotation
- To prevent fighting, we need to split rotation into two layers:
  1. **Base offset** (set by gizmo/input, stored in store)
  2. **Animation delta** (calculated from presets, applied on top)

### 1.3 Camera Setup

**File reference:**

- `SceneManager.js:27-29` — Camera position and lookAt

```javascript
this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
this.camera.position.set(0, 0.5, 5)
this.camera.lookAt(0, 0, 0)
```

**Current:** Fixed camera at `(0, 0.5, 5)` looking at origin. Aspect ratio updated on resize.

### 1.4 React Canvas Integration

**File references:**

- `PreviewCanvas.jsx:8-24` — SceneManager instantiation
- `PreviewCanvas.jsx:39-72` — Subscription to store changes, calls `manager.updateAnimationOptions()`
- `useSceneManager()` — Shared context ref for accessing SceneManager from other components

**Flow:**

1. PreviewCanvas mounts → creates SceneManager instance in container
2. Store subscriptions → triggers manager methods when state changes
3. ResizeObserver → calls `setSize()` on resize
4. Other components access SceneManager via context ref

### 1.5 Current Layout & Canvas Structure

**File references:**

- `Layout.jsx:26-28` — Main grid: sidebar (340px) + preview area
- `Layout.jsx:92-94` — Preview section: flex column with min-h-[360px]
- `PreviewCanvas.jsx:124-125` — Container div with Tailwind classes

**Current canvas area:**

- Responsive: full width on mobile, 1fr (flexible) on desktop
- Height: min-h-[360px] on mobile, auto-fill on desktop
- BitmapEffect appends a `<canvas>` to the container div

---

## 2. Recommended Gizmo Rendering Approach

### 2.1 Two-Canvas Architecture

**Decision: Separate Three.js renderer + SVG/HTML overlay**

We will create a **second Three.js renderer** specifically for the gizmo, rendered to a separate canvas positioned absolutely on top of the main preview canvas.

**Rationale:**

| Approach                       | Pros                                                                | Cons                                                                 | Verdict                       |
| ------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------- |
| **Separate Three.js (chosen)** | Independent rendering loop; real 3D interactivity; clean separation | Double GPU overhead; manage two renderers                            | ✓ Best for precision rotation |
| SVG axes                       | Lightweight; easy drag handling                                     | 2D axes can't show 3D rotation clearly; misaligns with 3D model view | ✗ Not ideal for 3D gizmo      |
| CSS 3D transform               | Native browser support                                              | Can't handle real 3D interaction; limited by DOM layout              | ✗ Too limited                 |
| Canvas 2D projection           | Lightweight                                                         | Hard to implement 3D projection; no depth handling                   | ✗ More code for less benefit  |

**Implementation:**

- Create `GizmoCanvas.jsx` — renders a small gizmo sphere with colored axis arrows
- Position absolutely in bottom-right corner of preview area (e.g., 120px × 120px)
- Its own Three.js scene with a sphere, three Line geometries (X/Y/Z axes), and simple orthographic camera
- Sync rotation state with main scene via Zustand store
- Capture mouse drag events → update store → both gizmo and main model update

### 2.2 Gizmo Visual Design

**Components:**

1. **Sphere** — 32x32 segments, single color (e.g., zinc-700), represents the model as a whole
2. **Axis arrows** — Three Line segments from center outward:
   - **X-axis** (red): `(1,0,0)` direction, ≈30px long
   - **Y-axis** (green): `(0,1,0)` direction, ≈30px long
   - **Z-axis** (blue): `(0,0,1)` direction, ≈30px long
3. **Grid background** — Optional subtle grid in the gizmo canvas to show rotation clearly

**Size and position:**

- 120px × 120px gizmo canvas in bottom-right of preview area
- 8px margin from edges
- Positioned `absolute` within the preview container (which must be `relative`)
- Render at 2x pixel ratio for crisp visuals on high-DPI displays

### 2.3 Gizmo Rotation Sync

The gizmo sphere's rotation always matches the main model's **base offset rotation** (stored in Zustand). When the user drags the gizmo or types angles in the input panel, both the gizmo and the main model update together.

---

## 3. Drag Interaction Design

### 3.1 Approach: Arcball Rotation

**Decision:** Implement arcball rotation on the gizmo sphere itself.

**Rationale:**

- **Arcball** simulates rotating a virtual ball: intuitive, no gimbal lock issues during interaction
- Convert 2D mouse delta to 3D rotation axis and angle
- Easy to understand: drag left/right → rotate around Y; drag up/down → rotate around X

**Algorithm:**

```
1. On mousedown on gizmo:
   - Store initial mouse position (px, py)
   - Store initial rotation quaternion from Zustand

2. On mousemove:
   - Calculate Δx = current mouse x - initial x
   - Calculate Δy = current mouse y - initial y
   - Map Δx, Δy to normalized arcball coordinates within gizmo bounds
   - Calculate rotation quaternion from arcball delta
   - Combine with initial quaternion → new rotation

3. On mouseup:
   - Update Zustand baseRotation with final quaternion
   - End drag
```

**Why arcball avoids gimbal lock:**

- We'll use **quaternions internally** for the gizmo state and interpolation
- Convert quaternion ↔ Euler only at boundaries (store/model)
- Arcball naturally preserves rotation history without locking

### 3.2 GizmoCanvas Drag Handler

**File to create:** `src/app/components/RotationGizmo/GizmoCanvas.jsx`

The component will:

1. Create a `<canvas>` element with `onMouseDown`, `onMouseMove`, `onMouseUp`
2. Track drag state (isDragging, startPos, startQuat)
3. Use `Raycaster` to detect clicks on the gizmo sphere (optional: for better UX, allow click anywhere in canvas to start drag)
4. Compute arcball rotation on mousemove
5. Update Zustand `baseRotation` on mouseup

---

## 4. State Management Design

### 4.1 Base Rotation State in Zustand

**New store fields to add to `useProjectStore`:**

```javascript
baseRotation: { x: 0, y: 0, z: 0 },  // Euler angles in radians
baseRotationQuat: null,                // Three.Quaternion, optional for internal use
setBaseRotation: (rotX, rotY, rotZ) => {...}
resetBaseRotation: () => {...}
```

**Rationale:**

- Store base rotation as Euler angles for UI (input fields) and persistence
- Optionally cache as quaternion for smooth arcball transitions
- Separate from animation state (animationEffects, animationSpeed, etc.)

### 4.2 Composition: Base + Animation

The key insight is **how the engine applies rotation:**

Currently (`AnimationEngine.js:37-52`):

```javascript
if (e.spinX) modelGroup.rotation.x += speed
if (e.spinY) modelGroup.rotation.y += speed
```

**New flow:**

1. **At frame render** (in AnimationEngine or SceneManager):
   - Retrieve `baseRotation` from store
   - Apply base rotation: `modelGroup.rotation.set(baseX, baseY, baseZ)`
   - Apply animation delta on top: `modelGroup.rotation.x += animSpeed * dt`

2. **For seek/export** (`AnimationEngine.js:93-129`):
   - Start with base rotation: `modelGroup.rotation.set(baseX, baseY, baseZ)`
   - Add animation state as before
   - Continue seamlessly

**Implementation location:**

- Modify `AnimationEngine.update()` to accept a `baseRotation` parameter
- Modify `AnimationEngine.seekTo()` similarly
- Pass base rotation from store subscription in `PreviewCanvas.jsx`

### 4.3 Store Migrations

If persisting to localStorage via `useAutoSave.js`:

- Add default: `baseRotation: { x: 0, y: 0, z: 0 }`
- Load from localStorage on app start
- Save on every state change (as existing code does)

---

## 5. Step-by-Step Implementation Guide

### Phase 1: Zustand Store Extension

**File:** `src/app/store/useProjectStore.js`

1. Add to `DEFAULT_STATE`:

   ```javascript
   baseRotation: { x: 0, y: 0, z: 0 }  // Euler in radians
   ```

2. Add actions:
   ```javascript
   setBaseRotation: (x, y, z) => set({ baseRotation: { x, y, z } })
   resetBaseRotation: () => set({ baseRotation: { x: 0, y: 0, z: 0 } })
   ```

### Phase 2: AnimationEngine Integration

**File:** `src/engine/animation/AnimationEngine.js`

1. Modify constructor:

   ```javascript
   this.baseRotation = { x: 0, y: 0, z: 0 }
   ```

2. Add setter:

   ```javascript
   setBaseRotation(baseRot) {
     this.baseRotation = { ...baseRot }
   }
   ```

3. Modify `update()` method:

   ```javascript
   update(modelGroup, effect, deltaSeconds = 1/60) {
     if (!modelGroup) return

     // Apply base rotation first
     modelGroup.rotation.order = 'XYZ'  // Ensure consistent order
     modelGroup.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z)

     // Then apply animation on top
     this.applyEffects(modelGroup, deltaSeconds)

     // ... rest of phase logic (fadeIn/Out)
   }
   ```

4. Modify `seekTo()` method:

   ```javascript
   seekTo(absoluteTimeMs, modelGroup, effect) {
     // ... existing logic ...
     if (modelGroup) {
       // Start with base rotation, not zero
       modelGroup.rotation.set(this.baseRotation.x, this.baseRotation.y, this.baseRotation.z)

       // Add animation deltas
       const e = this.animationEffects
       const speed = this.speed
       if (e.spinX) modelGroup.rotation.x += speed * ts
       // ... etc
     }
   }
   ```

### Phase 3: Gizmo Component Creation

**Files to create:**

- `src/app/components/RotationGizmo/GizmoCanvas.jsx` — Renderer and drag handler
- `src/app/components/RotationGizmo/RotationGizmoPanel.jsx` — Input fields + gizmo container

**GizmoCanvas.jsx structure:**

```javascript
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useProjectStore } from '../../store/useProjectStore.js'

function GizmoCanvas() {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const sphereRef = useRef(null)
  const dragStateRef = useRef({ isDragging: false, startX: 0, startY: 0, startQuat: null })

  const baseRotation = useProjectStore((state) => state.baseRotation)
  const setBaseRotation = useProjectStore((state) => state.setBaseRotation)

  // Setup Three.js scene
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.z = 2

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(120, 120)
    renderer.setClearColor(0x000000, 0)

    // Create sphere with axes
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x52525b, wireframe: false })
    )
    scene.add(sphere)

    // Axis lines (X=red, Y=green, Z=blue)
    const axisLength = 1
    const axes = {
      x: new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(axisLength, 0, 0)
        ]),
        new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
      ),
      y: new THREE.Line(...),  // green
      z: new THREE.Line(...)   // blue
    }
    Object.values(axes).forEach(axis => scene.add(axis))

    sceneRef.current = scene
    rendererRef.current = renderer
    sphereRef.current = sphere

    // Animation loop
    const animate = () => {
      // Apply stored base rotation to sphere
      sphere.rotation.order = 'XYZ'
      sphere.rotation.set(baseRotation.x, baseRotation.y, baseRotation.z)

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      // Cleanup
    }
  }, [])

  // Sync store rotation to gizmo
  useEffect(() => {
    if (!sphereRef.current) return
    sphereRef.current.rotation.set(baseRotation.x, baseRotation.y, baseRotation.z)
  }, [baseRotation])

  // Drag handlers
  const handleMouseDown = (e) => {
    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRot: { ...baseRotation }
    }
  }

  const handleMouseMove = (e) => {
    const drag = dragStateRef.current
    if (!drag.isDragging) return

    const deltaX = (e.clientX - drag.startX) * 0.01  // Scale to radians
    const deltaY = (e.clientY - drag.startY) * 0.01

    const newRot = {
      x: drag.startRot.x - deltaY,  // up/down → rotate around X
      y: drag.startRot.y + deltaX,  // left/right → rotate around Y
      z: drag.startRot.z
    }

    setBaseRotation(newRot.x, newRot.y, newRot.z)
  }

  const handleMouseUp = () => {
    dragStateRef.current.isDragging = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [baseRotation, setBaseRotation])

  return (
    <canvas
      ref={canvasRef}
      className="h-[120px] w-[120px] cursor-grab active:cursor-grabbing rounded border border-zinc-700 bg-zinc-950"
      onMouseDown={handleMouseDown}
    />
  )
}

export { GizmoCanvas }
```

**RotationGizmoPanel.jsx structure:**

```javascript
import { GizmoCanvas } from './GizmoCanvas.jsx'
import { useProjectStore } from '../../store/useProjectStore.js'

function RotationGizmoPanel() {
  const baseRotation = useProjectStore((state) => state.baseRotation)
  const setBaseRotation = useProjectStore((state) => state.setBaseRotation)
  const resetBaseRotation = useProjectStore((state) => state.resetBaseRotation)

  const toDegrees = (rad) => ((rad * 180) / Math.PI).toFixed(1)
  const toRadians = (deg) => (deg * Math.PI) / 180

  return (
    <section className="space-y-2">
      <GizmoCanvas />

      <div className="space-y-2 border-t border-zinc-700 pt-2">
        <label className="block text-sm">Rotation (°)</label>

        <div className="space-y-1">
          <label htmlFor="rot-x" className="block text-xs text-zinc-400">
            X: {toDegrees(baseRotation.x)}°
          </label>
          <input
            id="rot-x"
            type="range"
            min="-180"
            max="180"
            step="1"
            value={toDegrees(baseRotation.x)}
            onChange={(e) => {
              const newRot = { ...baseRotation, x: toRadians(Number(e.target.value)) }
              setBaseRotation(newRot.x, newRot.y, newRot.z)
            }}
            className="w-full"
          />
        </div>

        {/* Similar for Y and Z ... */}

        <button
          type="button"
          onClick={resetBaseRotation}
          className="w-full rounded bg-zinc-700 px-2 py-1 text-xs hover:bg-zinc-600"
        >
          Reset
        </button>
      </div>
    </section>
  )
}

export { RotationGizmoPanel }
```

### Phase 4: Integration into PreviewCanvas

**File:** `src/app/components/PreviewCanvas/PreviewCanvas.jsx`

1. Subscribe to `baseRotation` from store
2. Pass to SceneManager via new method `setBaseRotation()`
3. SceneManager passes to AnimationEngine

**Additions:**

```javascript
const unsubRotation = useProjectStore.subscribe(
  (state) => state.baseRotation,
  (baseRot) => {
    if (manager?.animationEngine) {
      manager.animationEngine.setBaseRotation(baseRot)
    }
  },
  { equalityFn: shallow }
)
```

### Phase 5: Add RotationGizmoPanel to Layout

**File:** `src/app/components/Layout/Layout.jsx`

Import and add to sidebar (after Light Direction, before Export):

```javascript
<Section title="Rotation Offset">
  <RotationGizmoPanel />
</Section>
```

### Phase 6: Update resetToLoopStart()

**File:** `src/engine/SceneManager.js` line 258

Change:

```javascript
if (this.modelGroup) this.modelGroup.rotation.set(0, 0, 0)
```

To respect base rotation:

```javascript
if (this.modelGroup && this.animationEngine.baseRotation) {
  const br = this.animationEngine.baseRotation
  this.modelGroup.rotation.set(br.x, br.y, br.z)
}
```

---

## 6. UI Layout Specification

### 6.1 Gizmo Canvas Placement

**Container positioning:**

```javascript
// In PreviewCanvas.jsx, wrap the main container:
<div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
  <div ref={containerRef} className="h-full w-full" />

  {/* Gizmo canvas - absolutely positioned */}
  <GizmoCanvas className="absolute bottom-2 right-2 z-10" />
</div>
```

**Size & appearance:**

- 120px × 120px canvas
- Positioned 8px from bottom-right corner
- Rounded border, subtle background
- z-index=10 to stay above main canvas
- Cursor changes on hover (grab hand icon)

### 6.2 Input Panel Layout

**Rotation Offset section in sidebar:**

```
┌─ Rotation Offset ────────┐
│                          │
│  ┌───────────────────┐  │
│  │   [Gizmo Canvas]  │  │
│  │   120×120 px      │  │
│  └───────────────────┘  │
│                          │
│  X: -45.0°              │
│  [────o────] slider     │
│                          │
│  Y: 90.0°               │
│  [o───────] slider      │
│                          │
│  Z: 0.0°                │
│  [────────o] slider     │
│                          │
│  [ Reset ] button       │
│                          │
└──────────────────────────┘
```

**Styling:**

- Gizmo canvas spans full width of section
- Input ranges span full width
- Degress display as `X: -45.0°` (computed from radians)
- Sliders: -180° to +180° per axis
- Reset button: full width, subtle styling

---

## 7. Implementation Gotchas & Solutions

### 7.1 Gimbal Lock & Euler Order

**Problem:**

- Three.js Euler angles can suffer gimbal lock at 90° rotations
- Multiple Euler orders (XYZ, ZYX, etc.) can be confusing

**Solution:**

1. **Enforce consistent order:** Set `rotation.order = 'XYZ'` globally in AnimationEngine
2. **Use quaternions internally for gizmo drag:**
   - Track quaternion during arcball interaction
   - Convert back to Euler only on final store update
   - Prevents interpolation artifacts
3. **User input:** Limit input ranges to ±180° (avoid 90° singularities in UI)
4. **Document:** Add comment explaining XYZ order in store

**Implementation:**

```javascript
// In AnimationEngine.js
setBaseRotation(baseRot) {
  this.baseRotation = { ...baseRot }
  // Enforce order in renderer
  if (this.modelGroup) this.modelGroup.rotation.order = 'XYZ'
}
```

### 7.2 Animation Fighting (Base + Delta)

**Problem:**

- If base rotation is applied, then animation adds delta, the model will rotate twice
- Risk: user expects manual rotation to be offset, not overridden

**Solution:**

1. **Clear contract:** Base rotation is applied first, animation plays on top
2. **PreviewCanvas** subscribes to both baseRotation and animationEffects
3. **AnimationEngine.update()** always starts with base, adds deltas
4. **Seekable:** Export uses same logic, so animated GIFs/videos show correct offset

### 7.3 Canvas Size & High-DPI Displays

**Problem:**

- Gizmo canvas at 120px may be blurry on 2x pixel ratio devices

**Solution:**

```javascript
const pixelRatio = Math.min(window.devicePixelRatio, 2)
renderer.setPixelRatio(pixelRatio)
// Keep CSS size at 120px, but internal resolution scales
```

### 7.4 Drag Outside Canvas

**Problem:**

- User drags mouse outside gizmo canvas → drag stops unexpectedly

**Solution:**

- Attach `mousemove` and `mouseup` listeners to `window`, not canvas
- Check `isDragging` flag on window move
- End drag on window mouseup

**Code in GizmoCanvas.jsx:**

```javascript
useEffect(() => {
  const handleWindowMove = (e) => {
    if (!dragStateRef.current.isDragging) return
    // ... compute new rotation
  }
  const handleWindowUp = () => {
    dragStateRef.current.isDragging = false
  }

  window.addEventListener('mousemove', handleWindowMove)
  window.addEventListener('mouseup', handleWindowUp)
  return () => {
    window.removeEventListener('mousemove', handleWindowMove)
    window.removeEventListener('mouseup', handleWindowUp)
  }
}, [baseRotation, setBaseRotation])
```

### 7.5 Store Persistence

**Problem:**

- baseRotation is new state — localStorage will persist it by default
- On app reload, model loads with old base rotation

**Solution:**

- Add baseRotation to DEFAULT_STATE (already covered in Phase 1)
- useAutoSave.js will automatically persist it (no changes needed)
- Reset button in UI allows users to clear it

### 7.6 Arcball Sensitivity

**Problem:**

- Mouse delta → rotation angle mapping needs tuning for good feel

**Solution:**

- Start with `deltaX * 0.01` and `deltaY * 0.01` (convert pixels to radians)
- Empirically tune based on gizmo size and typical drag distances
- Add comments with sensitivity constants

**Code:**

```javascript
const DRAG_SENSITIVITY = 0.01 // Adjust based on user testing
const deltaX = (e.clientX - drag.startX) * DRAG_SENSITIVITY
const deltaY = (e.clientY - drag.startY) * DRAG_SENSITIVITY
```

### 7.7 Animation Loop Sync

**Problem:**

- GizmoCanvas has its own `requestAnimationFrame` loop
- Main canvas has its own loop via `renderer.setAnimationLoop()`
- Both may flicker or fall out of sync

**Solution:**

- GizmoCanvas loop is independent — that's fine, it just mirrors store state
- Both update from store, so they're always in sync
- No explicit frame sync needed

---

## 8. Testing Checklist

Once implementation is complete:

- [ ] **Drag gizmo** → model rotates in main canvas at same angle
- [ ] **Type angle in input** → gizmo and model update together
- [ ] **Reset button** → rotation returns to 0°, 0°, 0°
- [ ] **Drag outside gizmo canvas** → still works (window drag)
- [ ] **Toggle animation on** → plays on top of base rotation, not replacing it
- [ ] **Export with offset** → video/GIF shows correct base rotation + animation
- [ ] **Reload app** → base rotation persists in localStorage
- [ ] **High-DPI display** → gizmo is crisp (2x pixel ratio)
- [ ] **Keyboard shortcut (future)** → reset rotation (not in v1)
- [ ] **Touch support (future)** → gizmo works on mobile (not in v1)

---

## 9. Files to Create / Modify

### New Files

- `src/app/components/RotationGizmo/GizmoCanvas.jsx`
- `src/app/components/RotationGizmo/RotationGizmoPanel.jsx`
- (Optional) `src/app/components/RotationGizmo/useArcball.js` — arcball helper hook

### Modified Files

1. `src/app/store/useProjectStore.js` — Add baseRotation state + actions
2. `src/engine/animation/AnimationEngine.js` — Add setBaseRotation(), modify update() & seekTo()
3. `src/engine/SceneManager.js` — Update resetToLoopStart() to respect baseRotation
4. `src/app/components/PreviewCanvas/PreviewCanvas.jsx` — Subscribe to baseRotation
5. `src/app/components/Layout/Layout.jsx` — Import & add RotationGizmoPanel

---

## 10. Future Enhancements

- **Touch support:** Detect touch drag on gizmo, apply rotation
- **Keyboard shortcuts:** Arrow keys to nudge rotation, R to reset
- **Quaternion input:** Advanced users might want to paste XYZW quaternions
- **Rotation hints:** Small text labels (X, Y, Z) near axis arrows
- **Gimbal lock warning:** Alert user if rotation approaches singularity
- **Undo/redo:** Persist rotation history in store, navigate with keyboard
- **Export pose:** Save/load rotation presets (e.g., "front view", "iso view")
- **Snap angles:** Snap to 15°/30°/45° increments when modifier key held

---

## 11. References

### Key Code Locations

- Three.js Euler: https://threejs.org/docs/#api/en/math/Euler
- Three.js Quaternion: https://threejs.org/docs/#api/en/math/Quaternion
- Arcball camera model: https://en.wikibooks.org/wiki/OpenGL_Programming/Bounding_volume
- BitmapForge Scene: `src/engine/SceneManager.js:26-50`
- Animation update: `src/engine/animation/AnimationEngine.js:54-76`
- Store: `src/app/store/useProjectStore.js`

### Related Components

- PreviewCanvas: `src/app/components/PreviewCanvas/PreviewCanvas.jsx`
- AnimationControls: `src/app/components/AnimationControls/AnimationControls.jsx`
- LightDirection: `src/app/components/LightDirection/LightDirection.jsx`

---

## 12. Summary

The rotation gizmo feature will be implemented as a separate Three.js renderer with:

1. **State management** in Zustand: `baseRotation` (Euler angles in radians)
2. **Animation layer** in AnimationEngine: applies base offset first, then animation delta
3. **Visual component** in React: `GizmoCanvas` (3D gizmo) + `RotationGizmoPanel` (inputs)
4. **Interaction** via arcball drag on gizmo sphere and range inputs in sidebar
5. **Integration** via PreviewCanvas subscription, no changes to export logic needed

The design avoids gimbal lock via consistent Euler order, prevents animation fighting via layered rotation, and maintains clean separation between engine and UI layers.

---

## Audit Findings (ia-bridge full audit — 2026-02-26)

### Critical Corrections

1. **Parent/child group split — do not `rotation.set()` on the animated node** — The current plan's `update()` implementation does `modelGroup.rotation.set(baseX, baseY, baseZ)` then `+= animDelta`. This **resets accumulated animation every frame**, breaking continuous spin. The correct pattern is a two-group hierarchy:
   - `baseGroup` — holds `baseRotation`; set via `rotation.set()` on each store change
   - `animGroup` (child of baseGroup) — animation applies `+=` incrementally as today; never reset per-frame

   This preserves incremental accumulation. `seekTo()` sets `animGroup.rotation` to the calculated absolute value; `baseGroup` is set from store separately.

2. **Avoid a second Three.js WebGL context for the gizmo** — Creating a second `THREE.WebGLRenderer` doubles GPU memory and context overhead. Use a **reactive 2D canvas overlay** instead: when `baseRotation` changes in the store, re-draw the gizmo onto a `<canvas>` using a 2D projection of the three axis vectors. The gizmo only needs to re-render on state change, not every animation frame. This is lighter and sufficient for a 120px indicator.

3. **Window-level drag listeners must be stable refs** — The current `useEffect` in `GizmoCanvas` lists `[baseRotation, setBaseRotation]` as dependencies, causing the window listeners to re-bind on every rotation change (i.e., every drag tick). Use `useRef` to hold the latest handlers and stabilize with an empty dependency array `[]`. Pattern:

   ```javascript
   const handlersRef = useRef({ onMove: null, onUp: null })
   handlersRef.current.onMove = handleMouseMove // updated each render, stable ref
   useEffect(() => {
     const onMove = (e) => handlersRef.current.onMove(e)
     window.addEventListener('mousemove', onMove)
     // ...
     return () => window.removeEventListener('mousemove', onMove)
   }, []) // stable — never re-binds
   ```

4. **Add angle snapping** — A `SNAP_DEGREES = 15` constant (active when Shift is held) should be included from day one. It dramatically improves usability when manually positioning models. Implementation: `snappedDeg = Math.round(deg / SNAP_DEGREES) * SNAP_DEGREES`.

5. **Screen ↔ canvas coordinate mapping utility** — Create a shared `screenToGizmo(e, canvasRect)` utility to normalize pointer events to gizmo-local coordinates. This prevents coordinate math from being duplicated if touch support is added later.

### Validated Points

- `baseRotation` in Zustand as Euler `{x, y, z}` radians is the correct storage format.
- `resetToLoopStart()` must use `baseRotation` as reset target, not hardcoded `(0,0,0)`. Correct.
- `seekTo()` must start from `baseGroup` rotation (or equivalent base), not zero. Correct.
- Arcball avoids gimbal lock during drag; Euler stored in store is fine for persistence. Correct.
- `baseRotation` persisted via `useAutoSave` with no extra code needed. Correct.

### Revised Architecture (two-group)

```javascript
// SceneManager.js setup
this.baseGroup = new THREE.Group() // holds base pose
this.animGroup = new THREE.Group() // holds animated rotation (child)
this.baseGroup.add(this.animGroup)
this.scene.add(this.baseGroup)

// When model loads:
this.animGroup.add(this.modelGroup)

// AnimationEngine: only touches animGroup.rotation (via +=)
// Store baseRotation changes: SceneManager.setBaseRotation(x, y, z)
//   → this.baseGroup.rotation.set(x, y, z)
```

### Implementation Order (adjusted)

1. **Phase 1** — Add `baseRotation` to store + actions
2. **Phase 2** — Refactor SceneManager to two-group hierarchy; update AnimationEngine to use `animGroup`
3. **Phase 3** — Create `RotationGizmoPanel` with slider inputs only (no gizmo canvas yet; validate the rotation layer works)
4. **Phase 4** — Add reactive 2D gizmo canvas overlay (not a second Three.js renderer)
5. **Phase 5** — Wire drag interaction with stable event handlers + angle snapping
6. **Phase 6** — Add to Layout sidebar
