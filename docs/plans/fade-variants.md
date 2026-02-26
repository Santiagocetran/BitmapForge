# Fade Variants Implementation Plan

**Date:** 2026-02-26
**Scope:** Expand fade in/out animation options from a single "fadeInOut" preset to 6-8 distinct, mutually exclusive fade variants.

## Executive Summary

Currently, BitmapForge has one fade-in/out animation style driven by a particle gather/scatter system with easeInOutCubic easing. This plan proposes **6-8 named fade variants** (Dissolve, Scan-line, Radial, Glitch, Vignette, Pixel Burst, Wave, Crystallize) with distinct visual behaviors while maintaining the existing phase-based architecture. The implementation modularizes fade logic into variant classes, allowing users to select one at a time via a UI radio control.

---

## Part 1: Current Fade System (End-to-End)

### Architecture Overview

The fade system spans three layers:

#### Layer 1: Store (State Management)

- **File:** `src/app/store/useProjectStore.js:13`
- **State:**
  - `useFadeInOut` (boolean, default `true`) — globally enables/disables fade
  - `animationDuration` (number, default `2500ms`) — fade animation duration
  - `showPhaseDuration` (number, default `20000ms`) — how long model displays between fades
  - `animationEffects` — separate boolean flags for spin/float (unrelated to fade type)

#### Layer 2: Animation Engine (Phase Orchestration)

- **File:** `src/engine/animation/AnimationEngine.js`
- **Key states:**
  - `useFadeInOut` (boolean) — controls whether to use fade phases at all
  - `animationDuration` — drives duration of fadeIn/fadeOut phases
  - `showPhaseDuration` — duration of 'show' phase
- **Phase workflow** (AnimationEngine.update, line 54–76):
  1. `fadeIn` → `show` (when fadeIn completes)
  2. `show` → `fadeOut` (when showPhaseDuration elapsed)
  3. `fadeOut` → `fadeIn` (when fadeOut completes)
  4. Loop duration: `2 * animationDuration + showPhaseDuration`
- **Seeking support** (AnimationEngine.seekTo, line 93–129):
  - Pre-calculates phase and progress for frame-by-frame export (GIF/video)

#### Layer 3: Rendering Effect (Visual Implementation)

- **File:** `src/engine/effects/BitmapEffect.js` + `BaseEffect.js`
- **Particle system** (BaseEffect.initializeParticles, line 169–222):
  - For each visible pixel in the grid, creates a particle with:
    - `startX/startY` — scattered radially around canvas center (300–800px away)
    - `finalX/finalY` — the pixel's actual grid position
    - `delay` — staggered by distance from center (0–40% of animation duration)
    - `brightness`, `color` — from WebGL pixel sample
  - Delay creates "gather inward" on fadeIn, "scatter outward" on fadeOut
- **Animation logic** (BitmapEffect.renderBitmap, line 134–161):
  - If `animationPhase === 'fadeIn'`:
    - Lerp each particle from `startX/startY` → `finalX/finalY`
    - Alpha ramps: `progress * 2` (0→1 over first 50% of fade)
    - Easing: `easeInOutCubic`
  - If `animationPhase === 'fadeOut'`:
    - Reverse lerp: `finalX/finalY` → `startX/startY`
    - Alpha ramps: `1 - progress * 2` (1→0 over first 50% of fade)
  - If not animating: render static grid (no particles)

---

## Part 2: Proposed Fade Variant Catalogue

Each variant is **mutually exclusive** with others (radio group in UI). All variants inherit from a new `BaseFadeVariant` class and share:

- Same phase system (fadeIn → show → fadeOut → loop)
- Same `animationDuration` and `showPhaseDuration` parameters
- Particle initialization (populated on first render of each phase)

### Variant 1: **Dissolve** (Current default, rename from "fadeInOut")

**Visual:** Pixels materialize from the center outward in a radial burst. On fadeOut, they scatter back to center.

**Parameters:**

- `startRadius`: distance particles scatter to (default: 400)
- `decayFunction`: controls how far outer pixels scatter (default: 1.0 = uniform)

**Implementation:**

- Particles already initialized with radial start positions (see BaseEffect line 197–202)
- On fadeIn: gather inward with easeInOutCubic
- On fadeOut: scatter outward with easeInOutCubic
- **Complexity:** ⭐ Minimal — keep existing particle logic, rename preset

**Key code references:**

- Particle initialization: BaseEffect:197–202
- Rendering: BitmapEffect:149–159

---

### Variant 2: **Scan-line** (Top-to-bottom sweep)

**Visual:** A horizontal bar "wipes" from top to bottom on fadeIn. Pixels appear row-by-row as the bar passes. On fadeOut, pixels vanish top-to-bottom.

**Parameters:**

- `direction`: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
- `wipeWidth`: height of the active band in pixels (default: 50)

**Implementation:**

- In `initializeParticles`: for each particle, calculate its row (y / pixelSize) and store as `scanlineIndex`
- During render: check if particle's y-position is within the active "wipe band"
  - Band position = `eased * gridHeight` (for top-to-bottom)
  - If particle within band and progress > 0: draw with alpha = ease(progress)
  - Otherwise: don't draw (immediate transition, no particle motion)
- **Complexity:** ⭐⭐ Medium — new grid-aware initialization, conditional visibility

**Pseudo-code:**

```javascript
// In variant class
initialize(gridWidth, gridHeight, particles) {
  particles.forEach(p => {
    p.scanlineIndex = Math.floor(p.finalY / pixelSize)
  })
}

// During render
scanlineWipeProgress = eased * gridHeight
particles.forEach(p => {
  if (Math.abs(p.scanlineIndex - scanlineWipeProgress) < wipeWidth) {
    alpha = eased
    drawPixel(p.finalX, p.finalY, alpha, ...)
  }
})
```

**Key locations to modify:**

- New method in variant: `calculateVisibility(progress, gridWidth, gridHeight)`
- Override render logic in BitmapEffect

---

### Variant 3: **Radial** (Circle grows/shrinks from center)

**Visual:** A circular mask expands from the canvas center on fadeIn. Pixels appear as the circle grows to full size. On fadeOut, circle shrinks to nothing.

**Parameters:**

- `centerX`, `centerY`: center of radial expansion (default: canvas center)
- `easing`: optional override (default: easeInOutCubic)

**Implementation:**

- Particle initialization: for each particle, calculate `distFromCenter` (distance from canvas center) and store
- During render: circle radius = `eased * maxDist` where `maxDist` is canvas diagonal / 2
  - If particle's `distFromCenter` <= radius: draw with alpha = eased
  - Otherwise: skip
- **Complexity:** ⭐⭐ Medium — distance-based visibility, no particle motion

**Key code:**

- Distance calculation: BaseEffect:205 (already computed for delay; reuse)
- Override render phase in variant

---

### Variant 4: **Glitch** (Pixel noise/corruption)

**Visual:** Pixels appear to "glitch" in and out randomly. Each pixel has an independent random probability of being visible. Creates a TV-static or data-corruption aesthetic.

**Parameters:**

- `noiseSeed`: RNG seed for deterministic glitching across loops (default: 0)
- `glitchFrequency`: how chaotic the noise (0–1, default: 0.6)
- `colorShift`: apply random color jitter to pixels (boolean, default: false)

**Implementation:**

- Particle initialization: generate a seeded noise value per pixel using simplex-like hash
- During render: for each particle, compute noise value and check if > (1 - progress)
  - If visible: optionally shift color by small random amount
  - Alpha: full (1.0) if visible, invisible (0) otherwise
  - Creates a "filling in" effect as progress → 1
- **Complexity:** ⭐⭐⭐ Medium-High — per-pixel random generation, optional color shift

**Pseudo-code (seeded hash):**

```javascript
// In variant initialization
function seededNoise(idx, seed) {
  const x = Math.sin(idx * 12.9898 + seed * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// During render
particles.forEach((p) => {
  const noise = seededNoise(p.idx, noiseSeed)
  if (noise < progress) {
    drawPixel(p.finalX, p.finalY, (alpha = 1), color)
  }
})
```

**Key locations:**

- Similar to BaseEffect:197–198 (existing noise calc)
- New variant with particle.idx tracking
- Override render loop

---

### Variant 5: **Vignette** (Outer edges fade)

**Visual:** Brightness falls off towards the canvas edges on fadeIn. Center pixels appear first, edges appear last. Creates an "iris open" effect. On fadeOut, reverses.

**Parameters:**

- `falloffShape`: 'linear' | 'quadratic' | 'exponential' (default: 'quadratic')
- `falloffStrength`: how quickly brightness drops (0.5–2.0, default: 1.0)

**Implementation:**

- Particle initialization: calculate each particle's `edgeDistance` (distance to nearest canvas edge) and store
- During render: compute falloff = `1 - (edgeDistance / maxEdgeDistance) ^ falloffStrength`
  - Effective progress = `eased * falloff`
  - Alpha = effective progress
  - Outer pixels have lower effective progress, appear later
- **Complexity:** ⭐⭐ Medium — edge-distance calc, falloff function

---

### Variant 6: **Pixel Burst** (Explode outward from center)

**Visual:** On fadeOut, pixels explode outward from the center with velocity. Unlike Dissolve (smooth easing), this uses a more violent, physics-like scatter. On fadeIn, particles converge back to center with acceleration.

**Parameters:**

- `velocityMultiplier`: controls burst speed (default: 1.0)
- `gravity`: pulls particles back toward center during scatter (default: 0.3)

**Implementation:**

- Particle initialization: same as Dissolve (radial scatter positions)
- New particle field: `velocity` (computed from startX/startY vs finalX/finalY)
- During render (fadeOut):
  - Apply velocity each frame: `position += velocity * deltaT * velocityMultiplier`
  - Apply gravity: `velocity *= (1 - gravity)` (damping)
  - Easing: `easeOutCubic` instead of `easeInOutCubic` (fast start, slow finish)
- **Complexity:** ⭐⭐⭐ Medium-High — per-frame velocity updates, needs deltaT tracking

---

### Variant 7: **Wave** (Undulating ripple)

**Visual:** A sine-wave ripple propagates from the center outward on fadeIn. Pixels appear as the wave passes. Gives a "liquid surface" or "shockwave" aesthetic.

**Parameters:**

- `wavelength`: distance between wave peaks in pixels (default: 80)
- `amplitude`: how much pixels oscillate (default: 15)
- `propagationSpeed`: how fast the wave expands (default: 1.0)

**Implementation:**

- Particle initialization: store particle's `distFromCenter` and `angle` from center
- During render:
  - Wave front position = `eased * maxDist` (radial expansion)
  - For each particle:
    - Distance to wave front = `|distFromCenter - waveFront|`
    - Phase = `(distFromCenter - waveFront) / wavelength * 2π`
    - Oscillation = `sin(phase) * amplitude`
    - Actual position = `(finalX + oscX, finalY + oscY)` (offset by oscillation)
    - Alpha = eased (pixel visible once wave reaches it)
- **Complexity:** ⭐⭐⭐ Medium-High — trigonometric motion, per-frame phase calc

---

### Variant 8: **Crystallize** (Mosaic growth)

**Visual:** Pixels form crystalline clusters that grow from random seed points. Each cluster expands until the canvas is fully covered. Creates a fractured, ice-like appearance.

**Parameters:**

- `crystalSeed`: number of initial seed points (default: 4)
- `spreadRate`: how fast crystals grow (default: 1.0)
- `colorize`: vary color per crystal (boolean, default: true)

**Implementation:**

- Particle initialization: assign each particle to nearest seed crystal (via distance)
  - Store `crystalID` and `distToSeed` per particle
  - Compute bounding distance for each crystal
- During render:
  - Spread radius = `eased * maxSprreadRadius`
  - For each particle:
    - If `distToSeed <= spreadRadius`: draw (with optional per-crystal color tint)
    - Otherwise: skip
  - Creates expanding regions from seed points
- **Complexity:** ⭐⭐⭐ Medium-High — seed point clustering, per-particle crystal assignment

---

## Part 3: Architecture Changes

### 3.1 New Fade Variant System

Create a new abstraction to encapsulate variant-specific logic:

```
src/engine/effects/fadeVariants/
├── BaseFadeVariant.js       (base class, shared logic)
├── DissolveVariant.js        (current behavior, refactored)
├── ScanlineVariant.js        (new)
├── RadialVariant.js          (new)
├── GlitchVariant.js          (new)
├── VignetteVariant.js        (new)
├── PixelBurstVariant.js      (new)
├── WaveVariant.js            (new)
├── CrystallizeVariant.js     (new)
└── index.js                  (exports all variants)
```

### 3.2 BaseFadeVariant Interface

```javascript
// src/engine/effects/fadeVariants/BaseFadeVariant.js
class BaseFadeVariant {
  constructor(options = {}) {
    this.options = options
  }

  // Called once per phase (fadeIn/fadeOut) when phase starts
  initialize(gridWidth, gridHeight, particles, imageData) {
    // Variant-specific particle metadata setup
  }

  // Called per-frame during animation
  render(gridWidth, gridHeight, particles, progress, phase, bitmapCtx, pixelSize) {
    // Variant-specific rendering logic
    // particles: array of base particles with position/color/brightness
    // progress: 0–1 animation progress within the phase
    // phase: 'fadeIn' or 'fadeOut'
  }

  // For export: pre-compute all frames to validate visuals
  getFrameAtProgress(progress, phase, particles, gridWidth, gridHeight) {
    // Return array of visible pixels at this progress
  }
}
```

### 3.3 Store Changes (useProjectStore.js)

**Current state** (line 13):

```javascript
useFadeInOut: true
```

**New state:**

```javascript
useFadeInOut: true,
fadeVariant: 'dissolve',  // 'dissolve' | 'scanline' | 'radial' | 'glitch' | 'vignette' | 'pixelBurst' | 'wave' | 'crystallize'
fadeVariantOptions: {
  // Variant-specific options stored as JSON
  // Example for scanline:
  // { direction: 'top', wipeWidth: 50 }
}
```

**New actions:**

```javascript
setFadeVariant: (fadeVariant) => set({ fadeVariant }),
setFadeVariantOptions: (options) => set((state) => ({
  fadeVariantOptions: { ...state.fadeVariantOptions, ...options }
}))
```

### 3.4 BitmapEffect Changes

**Current approach** (line 134–161): Hardcoded particle gather/scatter in renderBitmap()

**New approach:**

1. Instantiate the selected variant on `updateOptions()`:

   ```javascript
   updateOptions(nextOptions = {}) {
     // ... existing code ...
     if (nextOptions.fadeVariant) {
       this.fadeVariant = createFadeVariant(nextOptions.fadeVariant, nextOptions.fadeVariantOptions)
     }
   }
   ```

2. Delegate animation to variant in `renderBitmap()`:

   ```javascript
   renderBitmap() {
     // ... existing code (dither, brightness calc, non-animated render) ...

     if (this.isAnimating && this.fadeVariant) {
       if (!this.particlesInitialized) {
         this.fadeVariant.initialize(this.gridWidth, this.gridHeight, this.particles, imageData)
         this.particlesInitialized = true
       }
       this.fadeVariant.render(
         this.gridWidth, this.gridHeight, this.particles,
         this.animationProgress, this.animationPhase,
         this.bitmapCtx, this.options.pixelSize
       )
     }
   }
   ```

### 3.5 Presets Update (presets.js)

**Current** (line 12–19):

```javascript
fadeInOut: {
  key: 'fadeInOut',
  type: 'fadeInOut',
  showDuration: 20000,
  animationDuration: 2500,
  rotateOnShow: false,
  showPreset: 'spinY'
}
```

**Proposal:** Keep this preset as-is for backwards compatibility, but internally it selects `fadeVariant: 'dissolve'`. Or create new preset structure:

```javascript
const FADE_VARIANT_PRESETS = {
  dissolve: { key: 'dissolve', type: 'fade', variant: 'dissolve' },
  scanline: { key: 'scanline', type: 'fade', variant: 'scanline' }
  // ... etc
}
```

---

## Part 4: Step-by-Step Implementation Guide

### Phase 1: Foundation & Refactoring

1. **Create variant base class** (`src/engine/effects/fadeVariants/BaseFadeVariant.js`)
   - Define interface with `initialize()`, `render()`, `getFrameAtProgress()`
   - Implement shared easing/color utilities (reuse from BaseEffect)

2. **Refactor current dissolve** (`src/engine/effects/fadeVariants/DissolveVariant.js`)
   - Move renderBitmap particle logic into `render()`
   - Test against existing footage to ensure no visual change

3. **Update BitmapEffect.js** to delegate to variant
   - Add `this.fadeVariant` instance variable
   - Modify `renderBitmap()` to call `fadeVariant.render()` when animating
   - Test existing UI — should look identical

### Phase 2: Implement 3 High-Impact Variants

Priority order (based on simplicity & visual distinctiveness):

1. **Scanline** (top-to-bottom wipe)
   - Highest visual variety with moderate complexity
   - Easy to verify: users see pixel rows appear sequentially

2. **Radial** (circle grows from center)
   - Conceptually simple, unique aesthetic
   - Good visual contrast to Dissolve

3. **Glitch** (random noise)
   - Eye-catching, modern feel
   - Relatively straightforward noise implementation

### Phase 3: Implement Remaining Variants

4. **Vignette** (outer edges fade)
5. **Pixel Burst** (velocity-based scatter)
6. **Wave** (ripple propagation)
7. **Crystallize** (seed-based growth)

### Phase 4: UI Integration

1. **Update AnimationControls.jsx** (line 11–98)
   - Replace single "Fade in / out" checkbox with:
     - Checkbox: "Enable fade animations"
     - Radio group or dropdown: select variant
     - Collapse/expand: variant-specific options (e.g., scanline direction)

2. **Add variant options panel**
   - Dynamic form based on selected variant
   - Example: Scanline shows "Direction" dropdown + "Wipe width" slider

3. **Store integration**
   - Hook `useFadeVariant` and `useFadeVariantOptions` in component
   - Dispatch `setFadeVariant()` and `setFadeVariantOptions()`

### Phase 5: Export & Seeking

1. **AnimationEngine.seekTo()** compatibility
   - Variants must support frame-stepping (used by GIF/video export)
   - Call `fadeVariant.getFrameAtProgress()` during seekTo
   - Test GIF export with each variant

2. **Loop duration** edge case
   - Some variants (e.g., Wave) may need per-variant timing adjustments
   - Store `loopDurationMs` per variant or compute dynamically

### Phase 6: Testing & Polish

1. **Visual QA**
   - Record GIF for each variant with standard settings
   - Verify particle count doesn't cause performance regression
   - Check animation smoothness on 60fps / 120fps displays

2. **Backwards compatibility**
   - Existing projects with `useFadeInOut: true` should default to 'dissolve'
   - localStorage migration (if needed) to populate `fadeVariant`

---

## Part 5: UI/UX Recommendations

### Control Layout

```
[✓] Enable fade animations
    └─ Fade variant: ◯ Dissolve  ◯ Scanline  ◯ Radial  ◯ Glitch
                      ◯ Vignette  ◯ Burst    ◯ Wave   ◯ Crystallize

       [Variant-specific options collapse]
       Direction (for Scanline): ▼ Top-to-Bottom
       Wipe width: [===========●] 50px

       Animation duration: [===========●] 2500ms
       Show duration:      [==============●] 20000ms
```

### Behavior

1. **Mutual exclusivity:** Only one variant can be active
   - Implement as radio group (not checkboxes)
   - Store a single `fadeVariant: string` (not flags)

2. **Smart defaults per variant**
   - When user switches variants, reset variant options to defaults
   - Or keep previous values if user switches back

3. **Variant preview**
   - Optional: show small preview thumbnail of fade animation
   - Triggers a quick loop render on variant change

4. **Help text**
   - Tooltip per variant: brief description + use case
   - Example: "Scanline: Classic CRT monitor wipe effect, great for retro styles"

---

## Part 6: Edge Cases & Open Questions

### Animation Phase Consistency

**Q:** Should all variants use the same phase timeline (fadeIn → show → fadeOut)?
**A:** Yes. Keeps export logic simple and predictable. Variants differ only in _visual rendering_, not timing.

### Particle Count Scalability

**Issue:** High-res canvases (1920×1080) with small pixels (pixelSize=1) = 2M+ particles.
**Solutions:**

- Limit max particles (e.g., 1M) and skip off-screen particles
- Use canvas-space culling (don't initialize particles outside viewport)
- For expensive variants (Crystallize), consider lazy initialization

### Color Handling in Variants

**Q:** Can variants apply custom color tints (e.g., per-crystal in Crystallize)?
**A:** Only apply tints if within user's color palette. Avoid adding colors beyond what's set.

### Backwards Compatibility

**Scenario:** Old project has `useFadeInOut: true` but no `fadeVariant` field.
**Solution:** Default to `fadeVariant: 'dissolve'` in store initialization.

### Export Determinism

**Q:** Glitch variant uses seeded RNG. Will exported GIF be reproducible?
**A:** Yes, if `noiseSeed` is stored in project. Use project ID or hash for seed.

---

## Part 7: Files to Modify / Create

### New Files (to create)

```
src/engine/effects/fadeVariants/
├── BaseFadeVariant.js              (150 lines)
├── DissolveVariant.js              (80 lines, refactored from BitmapEffect)
├── ScanlineVariant.js              (100 lines)
├── RadialVariant.js                (90 lines)
├── GlitchVariant.js                (110 lines)
├── VignetteVariant.js              (100 lines)
├── PixelBurstVariant.js            (120 lines)
├── WaveVariant.js                  (140 lines)
├── CrystallizeVariant.js           (150 lines)
└── index.js                        (30 lines, export factory function)

src/app/components/AnimationControls/
└── FadeVariantSelector.jsx         (new component, 100 lines)
```

### Modified Files

```
src/engine/effects/BitmapEffect.js
  └─ Remove hardcoded particle render logic (lines 134–161)
  └─ Add fadeVariant instance, delegation to variant.render()

src/engine/effects/BaseEffect.js
  └─ Extract particle initialization to private method for reuse

src/app/store/useProjectStore.js
  └─ Add fadeVariant, fadeVariantOptions state
  └─ Add setFadeVariant(), setFadeVariantOptions() actions
  └─ Update DEFAULT_STATE

src/app/components/AnimationControls/AnimationControls.jsx
  └─ Replace "Fade in / out" checkbox with FadeVariantSelector
  └─ Add conditional rendering of variant-specific options

src/engine/animation/presets.js
  └─ (Optional) Add FADE_VARIANT_PRESETS or update ANIMATION_PRESETS
```

---

## Part 8: Testing Strategy

### Unit Tests (conceptual)

```javascript
// For each variant, test:
describe('DissolveVariant', () => {
  it('should initialize particles with radial scatter', () => {})
  it('should render fadeIn phase correctly', () => {})
  it('should render fadeOut phase correctly', () => {})
  it('should handle empty grid', () => {})
  it('should respect minBrightness threshold', () => {})
})

// Repeat for each variant
```

### Integration Tests

```javascript
// Test BitmapEffect integration
describe('BitmapEffect with fadeVariants', () => {
  it('should switch variants without errors', () => {})
  it('should export GIF with correct frame count', () => {})
  it('should handle animate phase transitions', () => {})
})

// Test store integration
describe('useProjectStore fade state', () => {
  it('should default fadeVariant to "dissolve"', () => {})
  it('should persist fadeVariant in localStorage', () => {})
})
```

### Visual QA Checklist

- [ ] Dissolve: particles gather/scatter smoothly
- [ ] Scanline: rows appear sequentially, wipeWidth adjusts band size
- [ ] Radial: circle expands from center, fills entire canvas
- [ ] Glitch: random noise fills in progressively, deterministic per seed
- [ ] Vignette: center appears first, edges appear last
- [ ] PixelBurst: particles burst outward with bounce/gravity
- [ ] Wave: ripple expands from center, pixels oscillate
- [ ] Crystallize: clusters grow from seed points, mosaic appearance

---

## Part 9: Performance Considerations

### Particle System Load

Current system: ~1000–5000 particles typical (depends on pixel size)

**Variant impact:**

- Dissolve, Scanline, Radial: O(1) per particle
- Glitch: O(1) per particle (hash)
- Vignette: O(1) per particle (distance already computed)
- PixelBurst: O(1) per particle (velocity vectors)
- Wave: O(1) per particle (sine calc)
- Crystallize: O(n log n) seed clustering (one-time on initialize)

**Optimization:**

- Pre-compute invariant values on `initialize()` (don't recalc per frame)
- Use lookup tables for trig functions if needed (Wave variant)
- Profile each variant on target device (mobile, desktop)

---

## Part 10: Migration Path

### Phase 1 (Backwards Compat)

- Introduce fade variants alongside existing `useFadeInOut` flag
- If `useFadeInOut === true` and `fadeVariant` is undefined, default to 'dissolve'
- Old localStorage projects load without modification

### Phase 2 (Deprecation)

- Recommend fadeVariant in docs
- Optionally emit console warning if old mode detected (v2.0+)

### Phase 3 (Removal)

- Remove `useFadeInOut` flag entirely (v3.0+)
- Fade control is now "select variant" or "none"

---

## Summary of Changes

| Component                 | Change                    | Impact                         |
| ------------------------- | ------------------------- | ------------------------------ |
| **presets.js**            | Add variant metadata      | Minor (additive)               |
| **effectTypes.js**        | No change                 | None (fade is separate system) |
| **AnimationEngine.js**    | No change                 | None (phases unchanged)        |
| **BitmapEffect.js**       | Delegate to variant       | Medium (refactoring)           |
| **BaseEffect.js**         | Extract particle init     | Minor (internal refactor)      |
| **useProjectStore.js**    | Add fadeVariant + options | Medium (new state)             |
| **AnimationControls.jsx** | New UI layout             | Medium (UI change)             |
| **New fadeVariants/**     | 8 new classes             | High (8 files, ~1100 LOC)      |

**Total estimated lines of code added: ~1200 (engine) + 200 (UI) = ~1400 LOC**

---

## Appendix: Variant Comparison Matrix

| Variant     | Visual Style       | Complexity | GPU Load    | Export Ready | Notes              |
| ----------- | ------------------ | ---------- | ----------- | ------------ | ------------------ |
| Dissolve    | Radial gather      | ⭐         | Low         | ✓            | Current default    |
| Scanline    | Top-to-bottom wipe | ⭐⭐       | Low         | ✓            | Grid-aware         |
| Radial      | Circle grows       | ⭐⭐       | Low         | ✓            | Distance-based     |
| Glitch      | Random noise       | ⭐⭐⭐     | Medium      | ✓            | Seeded RNG         |
| Vignette    | Outer edges fade   | ⭐⭐       | Low         | ✓            | Falloff function   |
| PixelBurst  | Explosive scatter  | ⭐⭐⭐     | Medium      | ✓            | Velocity + gravity |
| Wave        | Ripple propagation | ⭐⭐⭐     | Medium      | ✓            | Trigonometric      |
| Crystallize | Mosaic growth      | ⭐⭐⭐     | Medium-High | ✓            | Seed clustering    |

---

## Appendix: Code Location Reference

| System                  | File                  | Key Lines                                     |
| ----------------------- | --------------------- | --------------------------------------------- |
| **Fade state (store)**  | useProjectStore.js    | 13, 77                                        |
| **Phase orchestration** | AnimationEngine.js    | 54–76 (update), 93–129 (seekTo)               |
| **Particle init**       | BaseEffect.js         | 103–222 (resetParticles, initializeParticles) |
| **Particle render**     | BitmapEffect.js       | 134–161 (renderBitmap)                        |
| **Effect options**      | BitmapEffect.js       | 56–70 (setSize, updateOptions)                |
| **UI controls**         | AnimationControls.jsx | 11–98 (whole component)                       |
| **Animation loop**      | SceneManager.js       | 57–67 (\_animationLoop)                       |

---

---

## Audit Findings (ia-bridge full audit — 2026-02-26)

### Critical Corrections

1. **BitmapEffect owns drawing — variants compute state only** — Variants must NOT call canvas drawing APIs (fillRect, drawImage, etc.) directly. `BitmapEffect.renderBitmap()` remains the single drawing owner. Instead, each variant's `render()` method should return (or populate) an array of `{ x, y, alpha, color }` descriptors; BitmapEffect iterates and draws them. This prevents dithering and color-mapping logic from being duplicated across 8 variant files.

2. **Split particle metadata: shared vs. motion** — `BaseEffect.initializeParticles()` computes position/brightness/color that all variants need. Only burst/wave/dissolve variants need motion metadata (velocity vectors, scatter positions). Don't initialize motion fields for all variants — add a `initializeVariantMetadata(particles, variant)` call after base init, invoked only when fade is enabled and a variant is selected.

3. **Mutual exclusivity must be engine-enforced, not just UI** — The store already holds one `fadeVariant` string (correct), but BitmapEffect must also validate that only one variant is active when `updateOptions()` is called. When variant changes, call `this.fadeVariant.cleanup()` on the outgoing instance and reset `this.particlesInitialized = false` to force re-initialization. Don't rely solely on UI radio group.

4. **`setPhaseProgress()` / `seekTo()` compatibility** — Each variant must support deterministic frame rendering at arbitrary progress values (used by GIF/video export). The `getFrameAtProgress(progress, phase)` method in `BaseFadeVariant` must be synchronous and side-effect free. Variants that use per-frame velocity simulation (PixelBurst, Wave) must pre-compute the state at `progress` without stepping through intermediate frames.

5. **V1 scope: Dissolve refactor + 2–3 variants** — The audit agrees with scoping v1 to Dissolve (refactored) + Scanline + Radial + Glitch. Defer Vignette, PixelBurst, Wave, and Crystallize to v2. This reduces initial risk surface and gets working variants in front of users faster.

### Validated Points

- Phase architecture (fadeIn → show → fadeOut) is unchanged — variants differ in visual rendering only. Correct.
- `fadeVariant: string` in store enforces mutual exclusivity at state level. Correct.
- Default to `'dissolve'` when `useFadeInOut: true` and no `fadeVariant` field exists. Correct migration path.
- Resetting variant-specific options to defaults when switching variants is the right UX.
- `BaseFadeVariant` interface (`initialize`, `render`, `getFrameAtProgress`) is sound.

### Recommended Architecture Tweak

```
BaseFadeVariant.render(progress, phase, particles)
  → returns: Array<{ idx, x, y, alpha }>   // just position + alpha overrides

BitmapEffect.renderBitmap()
  → calls variant.render() to get visibility data
  → iterates the returned array
  → applies existing dither + color mapping per pixel
  → draws via canvas 2D API
```

This keeps color/dither logic in one place and makes variants purely about layout/visibility.

### Implementation Order

1. Refactor `DissolveVariant` and wire up `BitmapEffect` delegation (verify no visual change)
2. Add `ScanlineVariant`
3. Add `RadialVariant`
4. Add `GlitchVariant`
5. UI: radio group selector in `AnimationControls.jsx`
6. Defer remaining 4 variants to v2

**Document Status:** Ready for implementation (v1 scope confirmed by audit)
**Maintainer:** Engineering team
**Last Updated:** 2026-02-26
