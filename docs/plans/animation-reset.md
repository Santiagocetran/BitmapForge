# Animation Reset Implementation Plan

## Feature Summary

When a user toggles off an animation type (e.g., spinY, spinX, float), the 3D object should smoothly return to its original/neutral position (rotation 0,0,0 and original Y position) instead of freezing where it was. This provides better UX feedback when disabling animations.

---

## Current Behavior Analysis

### Animation Loop Architecture

**Per-frame update flow** (SceneManager.js:57-66):

```
renderer.setAnimationLoop(_animationLoop)
  → AnimationEngine.update(modelGroup, effect, deltaSeconds)
    → AnimationEngine.applyEffects(modelGroup, deltaSeconds)
      → Updates modelGroup.rotation.x/y/z
```

- Animation loop runs at ~60 FPS via `renderer.setAnimationLoop()`
- `AnimationEngine.update()` is called each frame with the elapsed time delta
- Current frame time is tracked in `SceneManager.lastFrameTime`
- `AnimationEngine.time` tracks cumulative time for float animation oscillation

### Active Animation Tracking

**Store state** (useProjectStore.js:14):

```javascript
animationEffects: { spinX: false, spinY: true, spinZ: false, float: false }
```

**State flow to engine**:

1. User toggles checkbox in AnimationControls.jsx (line 40)
2. Calls `setAnimationEffect(key, value)` which updates store
3. PreviewCanvas.jsx subscribes to `animationEffects` changes (line 57)
4. Calls `manager.updateAnimationOptions(slice)` on change
5. SceneManager.updateAnimationOptions() → AnimationEngine.setFadeOptions()
6. AnimationEngine updates `this.animationEffects = { ...updated }`

**Current state tracking**: Only the boolean flags are tracked; there's no "resetting" state.

### Animation Toggle Code Path

**When user unchecks an animation**:

1. AnimationControls.jsx:40 fires `onChange` with `e.target.checked = false`
2. Store action `setAnimationEffect(key, false)` updates state atomically
3. PreviewCanvas subscription (line 54-67) detects change via shallow equality check
4. `manager.updateAnimationOptions()` is called immediately
5. AnimationEngine.setFadeOptions() updates `this.animationEffects[key] = false`
6. **Next frame**: `applyEffects()` skips that animation type's rotation code
7. **Result**: Model freezes where it was; no return-to-origin motion

### Model Position Storage

**Rotation storage** (SceneManager.js and AnimationEngine.js):

- `modelGroup.rotation` stores actual Three.js rotation (Euler angles)
- No "baseline" or "original position" is stored separately
- Original position is implicitly (0, 0, 0)
- Float animation does NOT modify Y position (only oscillates X and Z rotation)

**Position reset on load** (SceneManager.js:256-258):

```javascript
resetToLoopStart() {
  this.animationEngine.resetToStart()
  if (this.modelGroup) this.modelGroup.rotation.set(0, 0, 0)  // Hard reset
  if (this.animationEngine.useFadeInOut) {
    this.effect.startAnimation('fadeIn')
  } else {
    this.effect.startAnimation('show')
  }
  this.renderOnce()
}
```

This only happens during export preparation, not during normal animation toggles.

### Key Architectural Points

1. **No state machine**: AnimationEngine doesn't track "mode" (active → resetting → idle)
2. **No transition logic**: Changes to `animationEffects` take effect immediately next frame
3. **No restoration baseline**: Original position is always (0,0,0) but not explicitly preserved
4. **Bayer dithering effect** has independent fade phases (fadeIn/show/fadeOut) but these don't coordinate with position reset
5. **Fade animation** is orthogonal to rotation animation (controls opacity/particles, not position)

---

## Proposed Architecture

### Design Decision: Tween/Lerp Approach in AnimationEngine

**Why this approach?**

- Minimal architectural change: only AnimationEngine needs modification
- Lerp is standard for smooth transitions in graphics/animation
- Decoupled from store/React layer (engine stays framework-agnostic)
- Handles multiple simultaneous resets gracefully
- Works with existing fade animation system

**Alternative approaches rejected:**

- ~~"Return home" animation phase~~: Would require adding a new phase state to BitmapEffect, tightly coupling engine and effect logic
- ~~Storing baseline transform~~: Unnecessary—origin is always (0,0,0); adds state bloat
- ~~Manual reset in React~~: Would violate separation of engine/app layers

### Core Concept

When an animation effect is toggled off:

1. **Detect the change**: AnimationEngine tracks previous `animationEffects` state
2. **Start lerp**: If an effect was active and is now disabled, start a smooth 300ms transition
3. **Apply lerp**: Each frame, interpolate current rotation toward origin (0,0,0) for that axis
4. **Complete**: When lerp duration elapses, stop and lock at (0,0,0)
5. **Handle conflicts**: If the same axis is being rotated by another active animation, skip the reset for that axis

### State to Add to AnimationEngine

```javascript
class AnimationEngine {
  constructor() {
    // ... existing ...
    this.resetTransitions = {
      rotationX: null, // { startRotation, duration, elapsed } or null
      rotationY: null,
      rotationZ: null
    }
  }
}
```

### Algorithm

In `applyEffects()` after applying active animations:

1. For each axis (x, y, z):
   - Check if rotation is being reset
   - If yes, apply lerp correction
   - If lerp is complete, clear the reset state

In `setFadeOptions()` when `animationEffects` changes:

1. Compare previous effects with new effects
2. For each effect that changed from true → false:
   - Identify which axis it affects (spinX→x, spinY→y, spinZ→z, float→x and z)
   - Create reset transition for that axis
   - Capture current rotation as start point

---

## Step-by-Step Implementation Guide

### Files to Modify

1. **src/engine/animation/AnimationEngine.js** (main logic)
2. **src/engine/SceneManager.js** (one-line addition for seekTo)
3. **src/engine/animation/effectTypes.js** (optional: add reset duration constant)

### Implementation Steps

#### Step 1: Add Reset State Structure (AnimationEngine.js)

**Location**: Constructor (after line 14)

Add reset transition tracking:

```javascript
this.resetTransitions = {
  rotationX: null,
  rotationY: null,
  rotationZ: null
}
this.previousAnimationEffects = { ...DEFAULT_ANIMATION_EFFECTS }
this.resetDurationMs = 300 // Duration of return-to-origin lerp
```

Also add a helper method to linearly interpolate rotation:

```javascript
// Helper: Smoothly interpolate a rotation value toward target (typically 0)
_lerpRotation(current, target, t) {
  // t in [0, 1] — linear interpolation
  return current + (target - current) * t
}
```

#### Step 2: Detect Animation Effect Changes (AnimationEngine.js)

**Location**: In `setFadeOptions()` after line 20

Add detection logic before updating `this.animationEffects`:

```javascript
// Track animation effect changes to trigger resets
if (options.animationEffects && typeof options.animationEffects === 'object') {
  const prev = this.animationEffects
  const next = options.animationEffects

  // Detect spinX disabled
  if (prev.spinX && !next.spinX && this.modelGroup) {
    this.resetTransitions.rotationX = {
      startRotation: this.modelGroup.rotation.x,
      duration: this.resetDurationMs,
      elapsed: 0
    }
  }

  // Detect spinY disabled
  if (prev.spinY && !next.spinY && this.modelGroup) {
    this.resetTransitions.rotationY = {
      startRotation: this.modelGroup.rotation.y,
      duration: this.resetDurationMs,
      elapsed: 0
    }
  }

  // Detect spinZ disabled
  if (prev.spinZ && !next.spinZ && this.modelGroup) {
    this.resetTransitions.rotationZ = {
      startRotation: this.modelGroup.rotation.z,
      duration: this.resetDurationMs,
      elapsed: 0
    }
  }

  // Detect float disabled (affects both X and Z oscillation)
  if (prev.float && !next.float && this.modelGroup) {
    // For float, we need to reset the oscillated components of X and Z
    // These are applied via sinusoidal functions, so we reset to pure spin-only values
    const e = this.animationEffects
    const speed = this.speed
    const ts = this.time

    if (!e.spinX) {
      // Only float was contributing to rotation.x oscillation
      this.resetTransitions.rotationX = {
        startRotation: this.modelGroup.rotation.x,
        duration: this.resetDurationMs,
        elapsed: 0
      }
    }
    if (!e.spinZ) {
      // Only float was contributing to rotation.z oscillation
      this.resetTransitions.rotationZ = {
        startRotation: this.modelGroup.rotation.z,
        duration: this.resetDurationMs,
        elapsed: 0
      }
    }
  }

  this.animationEffects = { ...this.animationEffects, ...next }
  this.previousAnimationEffects = { ...prev }
}
```

**Problem**: `setFadeOptions()` receives options but doesn't have access to `modelGroup`.

**Solution**: Pass `modelGroup` as parameter or defer reset initialization to `update()`.

**Revised approach**: Initialize resets in `update()` instead, where we have both `modelGroup` and can check state changes.

#### Step 2 (Revised): Detect Changes in update() Method

**Location**: AnimationEngine.js in `update()` method (line 54)

Add before `if (!this.useFadeInOut)`:

```javascript
update(modelGroup, effect, deltaSeconds = 1 / 60) {
  // Check for animation effect changes and initiate resets
  this._checkAnimationEffectChanges(modelGroup)

  // ... rest of method
}

_checkAnimationEffectChanges(modelGroup) {
  if (!modelGroup) return

  const prev = this.previousAnimationEffects
  const curr = this.animationEffects

  // Detect spinX change
  if (prev.spinX && !curr.spinX && !this.resetTransitions.rotationX) {
    this.resetTransitions.rotationX = {
      startRotation: modelGroup.rotation.x,
      duration: this.resetDurationMs,
      elapsed: 0
    }
  }

  // Detect spinY change
  if (prev.spinY && !curr.spinY && !this.resetTransitions.rotationY) {
    this.resetTransitions.rotationY = {
      startRotation: modelGroup.rotation.y,
      duration: this.resetDurationMs,
      elapsed: 0
    }
  }

  // Detect spinZ change
  if (prev.spinZ && !curr.spinZ && !this.resetTransitions.rotationZ) {
    this.resetTransitions.rotationZ = {
      startRotation: modelGroup.rotation.z,
      duration: this.resetDurationMs,
      elapsed: 0
    }
  }

  // Detect float change
  if (prev.float && !curr.float) {
    // Float affects oscillation in X and Z
    // Only reset if no spin is active on those axes
    if (!curr.spinX && !this.resetTransitions.rotationX) {
      this.resetTransitions.rotationX = {
        startRotation: modelGroup.rotation.x,
        duration: this.resetDurationMs,
        elapsed: 0
      }
    }
    if (!curr.spinZ && !this.resetTransitions.rotationZ) {
      this.resetTransitions.rotationZ = {
        startRotation: modelGroup.rotation.z,
        duration: this.resetDurationMs,
        elapsed: 0
      }
    }
  }

  // Update previous state for next frame
  this.previousAnimationEffects = { ...curr }
}
```

#### Step 3: Apply Reset Transitions in applyEffects() (AnimationEngine.js)

**Location**: End of `applyEffects()` method (after line 52)

Add lerp application:

```javascript
applyEffects(modelGroup, deltaSeconds) {
  if (!modelGroup) return
  const e = this.animationEffects
  const speed = this.speed * deltaSeconds

  if (e.spinX) modelGroup.rotation.x += speed
  if (e.spinY) modelGroup.rotation.y += speed
  if (e.spinZ) modelGroup.rotation.z += speed
  if (e.float) {
    this.time += deltaSeconds
    const ox = FLOAT_PRESET?.oscillateX ?? 0.15
    const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
    modelGroup.rotation.x += Math.sin(this.time * 0.5) * ox * deltaSeconds * 2
    modelGroup.rotation.z += Math.sin(this.time * 0.3) * oz * deltaSeconds * 2
  }

  // NEW: Apply reset transitions
  this._applyResetTransitions(modelGroup, deltaSeconds)
}

_applyResetTransitions(modelGroup, deltaSeconds) {
  if (!modelGroup) return

  const deltaMs = deltaSeconds * 1000

  // X-axis reset
  if (this.resetTransitions.rotationX) {
    const reset = this.resetTransitions.rotationX
    reset.elapsed += deltaMs
    const t = Math.min(reset.elapsed / reset.duration, 1) // Clamp to [0,1]
    modelGroup.rotation.x = this._lerpRotation(reset.startRotation, 0, t)

    if (reset.elapsed >= reset.duration) {
      modelGroup.rotation.x = 0
      this.resetTransitions.rotationX = null
    }
  }

  // Y-axis reset
  if (this.resetTransitions.rotationY) {
    const reset = this.resetTransitions.rotationY
    reset.elapsed += deltaMs
    const t = Math.min(reset.elapsed / reset.duration, 1)
    modelGroup.rotation.y = this._lerpRotation(reset.startRotation, 0, t)

    if (reset.elapsed >= reset.duration) {
      modelGroup.rotation.y = 0
      this.resetTransitions.rotationY = null
    }
  }

  // Z-axis reset
  if (this.resetTransitions.rotationZ) {
    const reset = this.resetTransitions.rotationZ
    reset.elapsed += deltaMs
    const t = Math.min(reset.elapsed / reset.duration, 1)
    modelGroup.rotation.z = this._lerpRotation(reset.startRotation, 0, t)

    if (reset.elapsed >= reset.duration) {
      modelGroup.rotation.z = 0
      this.resetTransitions.rotationZ = null
    }
  }
}

_lerpRotation(current, target, t) {
  // Linear interpolation from current to target
  return current + (target - current) * t
}
```

#### Step 4: Update seekTo() for Consistency (AnimationEngine.js)

**Location**: `seekTo()` method (line 93)

When seeking to a specific time (used during export), clear any active reset transitions to avoid conflicts:

```javascript
seekTo(absoluteTimeMs, modelGroup, effect) {
  // Clear any in-progress resets when seeking — they're incompatible with seek
  this.resetTransitions = {
    rotationX: null,
    rotationY: null,
    rotationZ: null
  }

  // ... rest of method unchanged
}
```

#### Step 5: Update resetToStart() (AnimationEngine.js)

**Location**: `resetToStart()` method (line 85)

Clear reset transitions on manual reset:

```javascript
resetToStart() {
  this.time = 0
  this.phaseStartTime = 0
  this.resetTransitions = {
    rotationX: null,
    rotationY: null,
    rotationZ: null
  }
}
```

#### Step 6: Ensure seekTo Handles Reset State (SceneManager.js)

**Location**: `renderAtTime()` method (line 231)

The current implementation already calls `seekTo()`, which we'll update to clear transitions. No change needed here, but verify the behavior works during export.

---

## Edge Cases and Handling

### 1. User Toggles Animation On and Off Rapidly

**Scenario**: User rapidly clicks spinY checkbox multiple times while animation is resetting.

**Current approach issue**: Each toggle creates a new reset transition, potentially in the middle of an active lerp.

**Solution**: Check if `resetTransitions[axis]` already exists before creating a new one:

```javascript
if (prev.spinY && !curr.spinY && !this.resetTransitions.rotationY) {
  // Only initiate if not already resetting
  this.resetTransitions.rotationY = { ... }
}
```

### 2. Multiple Animations on Same Axis

**Scenario**: spinY and float are both active. User disables spinY. Should X and Z still reset partially if float is also disabled?

**Current approach**: Each animation is tracked independently. Float contributes oscillation on X and Z, spin contributes constant velocity.

**Solution**: When float is disabled, only reset X and Z if spinX and spinZ are also inactive:

```javascript
if (prev.float && !curr.float) {
  if (!curr.spinX && !this.resetTransitions.rotationX) {
    // Reset X only if spinX is not active
    this.resetTransitions.rotationX = { ... }
  }
  // Similar for Z
}
```

### 3. Animation Re-enabled During Reset

**Scenario**: User disables spinY, then re-enables it 100ms into the 300ms reset transition.

**Current approach**: Reset transitions are cleared when an animation is re-enabled... OR they continue and fight the new animation.

**Issue**: If spinY is re-enabled while reset is in progress, spinY will resume adding rotations, but the reset lerp will pull it back to 0, causing jittering.

**Solution**: When an animation is re-enabled, clear its corresponding reset transition:

```javascript
// In _checkAnimationEffectChanges
if (!prev.spinY && curr.spinY && this.resetTransitions.rotationY) {
  // Animation re-enabled; clear any in-progress reset
  this.resetTransitions.rotationY = null
}
```

### 4. Model Reloaded During Reset

**Scenario**: User loads a new model while a reset is in progress.

**Solution**: When `loadModel()` is called in SceneManager, it resets the engine state:

```javascript
// In SceneManager.loadModel (line 111)
this.effect.startAnimation('fadeIn')
// Add:
this.animationEngine.resetToStart() // Clears all transitions
```

Currently `resetToStart()` is only called before export. This would ensure model loads are clean.

### 5. seekTo() Called During Reset (Export Scenario)

**Scenario**: During export, user clicks "Stop" or export process needs to seek while a reset is animating.

**Solution**: Already handled in Step 4—`seekTo()` clears all reset transitions.

### 6. Fade In/Out Phase Reset

**Scenario**: Model is fading in (particle animation). User disables spinY. Should reset happen during fadeIn?

**Current behavior**: The fade phase is independent of rotation, so reset will apply normally during fadeIn. This is correct—reset should happen immediately regardless of fade state.

**Edge case**: If user disables animation during fadeOut phase, reset will still apply over 300ms. Rotation will return to 0 while particles scatter. This is acceptable UX.

---

## Testing Strategy

### Unit Tests (not yet part of codebase, but recommend for this feature)

1. **Basic reset**: Toggle spinY off, verify rotation.y smoothly goes to 0 over ~300ms
2. **Multiple axes**: Toggle spinX and spinZ simultaneously, verify both reset in parallel
3. **Float reset**: Toggle float off with spinY active; verify X and Z reset while Y continues spinning
4. **Rapid toggling**: Toggle same animation 5 times in quick succession; verify no crashes, smooth behavior
5. **Re-enable during reset**: Disable spinY, wait 100ms, re-enable; verify no jitter
6. **Seek clears transitions**: Call seekTo while reset in progress; verify reset state is cleared and seekTo position is correct
7. **Model reload clears transitions**: Load model, disable animation, load different model; verify no state leakage

### Manual Testing (in the browser)

1. Load a model
2. Enable spinY
3. Verify it spins smoothly
4. Uncheck spinY → object should smoothly rotate back to 0 Y-rotation
5. Re-enable spinY → should resume spinning from wherever it stopped
6. Enable float, then disable spinY → X and Z should continue oscillating while Y returns
7. Rapidly toggle spinX on/off → should be smooth, no jitter
8. Disable animation during fadeOut phase → reset should still work

### Export Testing

1. Enable animations
2. Disable one during preview
3. Export GIF/video → should use current animation settings, no interference from reset logic

---

## Implementation Risks and Mitigation

| Risk                                                   | Likelihood | Impact                  | Mitigation                                                        |
| ------------------------------------------------------ | ---------- | ----------------------- | ----------------------------------------------------------------- |
| Reset transitions interfere with active animations     | Medium     | Moderate jitter         | Check axis availability before starting reset (Step 2)            |
| Rapid toggling causes multiple overlapping resets      | Medium     | Unexpected behavior     | Guard with `!this.resetTransitions[axis]` checks                  |
| seekTo called during export while reset in progress    | Low        | Export frames corrupted | Clear transitions in seekTo (Step 4)                              |
| Performance impact of extra lerp calculations          | Very Low   | Minor FPS drop          | Lerp is O(1) per axis; only runs when transitioning               |
| Float + spin interaction on same axis                  | Medium     | Complex reset logic     | Document in comments; test both on/off combinations               |
| User expectations mismatch (reset speed too fast/slow) | Medium     | UX complaint            | 300ms is standard for UI transitions; make configurable if needed |

---

## Open Questions for Developer

1. **Reset duration**: Is 300ms the desired speed? Should it be configurable (store setting)?
2. **Reset easing**: Should reset use linear interpolation, ease-out (decelerate), or ease-in-out? Currently proposed: linear.
3. **Position Y**: The feature description mentions "return to original Y position." The code doesn't animate Y position currently (only rotation). Should this feature include Y translation, or was it just mentioned as part of "neutral position" (0,0,0 rotation)?
4. **Float vs Spin interaction**: When float is active on X/Z and spin is inactive on those axes, toggling float should reset oscillation. Is this the desired behavior, or should float always be able to oscillate independently?
5. **Fade phase coordination**: Should reset animation start immediately, or should it wait for fadeIn to complete? (Currently: starts immediately.)
6. **Testing framework**: The codebase has no tests. Should we add unit tests for animation logic, or keep this feature test-only-in-browser?

---

## Summary

**Implementation complexity**: Low to Moderate

- Mostly isolated to AnimationEngine.js
- No React/store changes needed
- No BitmapEffect (fade animation) changes needed
- Leverages existing per-frame update loop

**Files changed**: 2

- AnimationEngine.js (main logic: ~80 lines)
- SceneManager.js (optional cleanup: 2-3 lines)

**Key principle**: Decouple reset logic from effect system; use independent axis-wise lerp transitions that co-exist with active animations.

---

## Audit Findings (ia-bridge full audit — 2026-02-26)

### Critical Corrections

1. **Single source of change detection** — The current plan has a conflict: `previousAnimationEffects` is written in two places (the setter `setFadeOptions()` and inside `update()` via `_checkAnimationEffectChanges()`). Pick **one**: either detect changes entirely inside `update()` (read `this.animationEffects` diff there), or detect in `setFadeOptions()` and defer initialization to `update()`. Remove the duplicate write.

2. **Explicit "isTransitioning" gate** — Add a boolean flag (e.g., `this.isResetting`) set when any axis reset starts, cleared when all resets are null. Guard `applyEffects()` from mid-tick mixing: if a reset is in progress on an axis, skip that axis's normal animation contribution that tick, then apply the lerp. Prevents one-frame overlap jitter.

3. **Re-enable during reset must cancel cleanly** — The plan mentions cancelling but the code snippet only clears the reset state. Make sure to also snapshot the current lerped position as the new "start" for animation, so the model doesn't snap. Recommended: just clear `resetTransitions[axis] = null` and let animation resume from wherever the rotation currently is.

4. **Reset target = base rotation, not (0,0,0)** — Once the Rotation Gizmo feature is implemented, the reset target will be `this.baseRotation[axis]`, not hardcoded `0`. Implement with a configurable target now (`getResetTarget(axis)` helper) that returns `this.baseRotation?.[axis] ?? 0` so it works correctly regardless of gizmo feature status.

5. **Startup false-positive prevention** — Initialize `previousAnimationEffects` from the **current store state** passed during construction, not from a hardcoded `DEFAULT_ANIMATION_EFFECTS`. Otherwise the first frame after mount will see all `false → true` transitions (or vice versa) and trigger spurious resets.

### Validated Points

- Lerp-in-engine approach is architecturally correct; no React/store changes needed.
- Axis-level guards preventing fight between reset and active animations are correct.
- `seekTo()` clearing transitions is correct and necessary for export determinism.
- `resetToStart()` clearing transitions is correct.
- Float→X/Z logic (only reset if spinX/spinZ are also inactive) is correct.

### Recommended Easing

Use `easeOutCubic` rather than linear for the lerp — the deceleration feels natural (spring-to-rest). Formula: `t = 1 - Math.pow(1 - t, 3)` applied before the lerp.

### Implementation Order

Implement **after** store/engine changes from Rotation Gizmo (Phase 1+2) if both features are built simultaneously, so reset target can reference `baseRotation` from day one.
