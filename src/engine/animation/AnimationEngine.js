import { ANIMATION_PRESETS } from './presets.js'
import { DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'
import { createRNG } from '../utils/seededRandom.js'

const FLOAT_PRESET = ANIMATION_PRESETS.float

// Duration (ms) for the smooth return-to-origin lerp when an animation is toggled off.
const RESET_DURATION_MS = 300

// easeOutCubic: decelerates into the target position — feels like a natural spring-to-rest.
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

class AnimationEngine {
  constructor() {
    this.useFadeInOut = true
    this.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS }
    this.speed = ANIMATION_PRESETS.spinY.defaultSpeed
    this.showPhaseDuration = 20000
    this.animationDuration = 2500
    this.phaseStartTime = performance.now()
    this.time = 0

    // Base rotation offset (set by the rotation gizmo; reset target for lerps).
    this.baseRotation = { x: 0, y: 0, z: 0 }

    // Per-axis lerp state. null = no reset in progress.
    // { startRotation: number, elapsed: number }
    this._resetTransitions = { x: null, y: null, z: null, positionY: null, scale: null }

    // Orbit camera baseline — captured on first frame with orbit active.
    this._orbitBaseline = null
    this._orbitRestorePending = null

    // Snapshot of previous effects — populated on the first update() call so
    // startup never triggers a spurious reset.
    this._previousEffects = null
  }

  setFadeOptions(options = {}) {
    if (typeof options.useFadeInOut === 'boolean') this.useFadeInOut = options.useFadeInOut
    if (options.animationEffects && typeof options.animationEffects === 'object') {
      this.animationEffects = { ...this.animationEffects, ...options.animationEffects }
    }
    if (typeof options.animationSpeed === 'number') this.speed = Math.max(0.01, options.animationSpeed)
    if (typeof options.showPhaseDuration === 'number') this.showPhaseDuration = options.showPhaseDuration
    if (typeof options.animationDuration === 'number') this.animationDuration = options.animationDuration
    // legacy
    if (options.animationPreset) {
      const preset = ANIMATION_PRESETS[options.animationPreset]
      if (preset?.type === 'fadeInOut') this.useFadeInOut = true
    }
    if (typeof options.rotateOnShow === 'boolean' && options.rotateOnShow && options.showPreset) {
      const p = ANIMATION_PRESETS[options.showPreset]
      if (p?.type === 'spin') this.animationEffects = { ...this.animationEffects, [options.showPreset]: true }
      if (p?.type === 'float') this.animationEffects = { ...this.animationEffects, float: true }
    }
  }

  setBaseRotation(baseRot) {
    this.baseRotation = { ...baseRot }
  }

  applyEffects(modelGroup, deltaSeconds, camera) {
    if (!modelGroup) return
    const e = this.animationEffects
    const speed = this.speed * deltaSeconds

    // Only apply spin/float on axes that are NOT currently being lerped back.
    if (e.spinX && !this._resetTransitions.x) modelGroup.rotation.x += speed
    if (e.spinY && !this._resetTransitions.y) modelGroup.rotation.y += speed
    if (e.spinZ && !this._resetTransitions.z) modelGroup.rotation.z += speed

    // Advance shared time for all time-dependent effects (once per frame)
    if (e.float || e.bounce || e.pulse || e.shake || e.orbit) {
      this.time += deltaSeconds
    }

    if (e.float) {
      const ox = FLOAT_PRESET?.oscillateX ?? 0.15
      const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
      if (!this._resetTransitions.x) modelGroup.rotation.x += Math.sin(this.time * 0.5) * ox * deltaSeconds * 2
      if (!this._resetTransitions.z) modelGroup.rotation.z += Math.sin(this.time * 0.3) * oz * deltaSeconds * 2
    }

    if (e.bounce && !this._resetTransitions.positionY && modelGroup.position) {
      modelGroup.position.y = Math.abs(Math.sin(this.time * this.speed * 1.8)) * 0.5
    }

    if (e.pulse && !this._resetTransitions.scale && modelGroup.scale?.setScalar) {
      modelGroup.scale.setScalar(1 + Math.sin(this.time * this.speed * 1.5) * 0.12)
    }

    if (e.shake && modelGroup.position) {
      const shakeSeed = (Math.floor(this.time * 30) * 0x9e3779b9) >>> 0
      const rng = createRNG(shakeSeed)
      modelGroup.position.x = (rng() - 0.5) * 0.08
      modelGroup.position.z = (rng() - 0.5) * 0.08
    }

    if (e.orbit && camera) {
      if (!this._orbitBaseline) {
        this._orbitBaseline = {
          pos: camera.position.clone(),
          quat: camera.quaternion.clone()
        }
      }
      const r = this._orbitBaseline.pos.length()
      const angle = this.time * this.speed * 0.5
      camera.position.set(Math.sin(angle) * r, this._orbitBaseline.pos.y, Math.cos(angle) * r)
      camera.lookAt(0, 0, 0)
    }
  }

  // Detect which axes just lost their driving animation and start lerps for them.
  _checkForResets(modelGroup) {
    if (!modelGroup) return

    const prev = this._previousEffects
    const curr = this.animationEffects

    // spinX drives rotation.x
    if (prev.spinX && !curr.spinX && !this._resetTransitions.x) {
      this._resetTransitions.x = { startRotation: modelGroup.rotation.x, elapsed: 0 }
    }
    // If spinX was re-enabled, cancel any in-progress reset on x
    if (!prev.spinX && curr.spinX) {
      this._resetTransitions.x = null
    }

    // spinY drives rotation.y
    if (prev.spinY && !curr.spinY && !this._resetTransitions.y) {
      this._resetTransitions.y = { startRotation: modelGroup.rotation.y, elapsed: 0 }
    }
    if (!prev.spinY && curr.spinY) {
      this._resetTransitions.y = null
    }

    // spinZ drives rotation.z
    if (prev.spinZ && !curr.spinZ && !this._resetTransitions.z) {
      this._resetTransitions.z = { startRotation: modelGroup.rotation.z, elapsed: 0 }
    }
    if (!prev.spinZ && curr.spinZ) {
      this._resetTransitions.z = null
    }

    // float drives oscillation on x and z — only reset those axes if the
    // corresponding spin is also inactive (otherwise spin continues to own them).
    if (prev.float && !curr.float) {
      if (!curr.spinX && !this._resetTransitions.x) {
        this._resetTransitions.x = { startRotation: modelGroup.rotation.x, elapsed: 0 }
      }
      if (!curr.spinZ && !this._resetTransitions.z) {
        this._resetTransitions.z = { startRotation: modelGroup.rotation.z, elapsed: 0 }
      }
    }
    if (!prev.float && curr.float) {
      // float re-enabled: cancel resets on axes it owns (if spin isn't active there)
      if (!curr.spinX) this._resetTransitions.x = null
      if (!curr.spinZ) this._resetTransitions.z = null
    }

    // bounce drives position.y
    if (prev.bounce && !curr.bounce && !this._resetTransitions.positionY && modelGroup.position) {
      this._resetTransitions.positionY = { startValue: modelGroup.position.y, elapsed: 0 }
    }
    if (!prev.bounce && curr.bounce) this._resetTransitions.positionY = null

    // pulse drives scale
    if (prev.pulse && !curr.pulse && !this._resetTransitions.scale && modelGroup.scale) {
      this._resetTransitions.scale = { startValue: modelGroup.scale.x ?? 1, elapsed: 0 }
    }
    if (!prev.pulse && curr.pulse) this._resetTransitions.scale = null

    // shake: snap to zero immediately on toggle-off (jitter doesn't need smooth lerp)
    if (prev.shake && !curr.shake && modelGroup.position) {
      modelGroup.position.x = 0
      modelGroup.position.z = 0
    }

    // orbit: flag baseline for restoration on toggle-off (camera restore happens in update())
    if (prev.orbit && !curr.orbit && this._orbitBaseline) {
      this._orbitRestorePending = this._orbitBaseline
      this._orbitBaseline = null
    }
    if (!prev.orbit && curr.orbit) {
      this._orbitRestorePending = null
    }
  }

  // Advance all active lerps and write corrected rotation values.
  _applyResetTransitions(modelGroup, deltaSeconds) {
    if (!modelGroup) return
    const deltaMs = deltaSeconds * 1000

    for (const axis of ['x', 'y', 'z']) {
      const r = this._resetTransitions[axis]
      if (!r) continue

      r.elapsed += deltaMs
      const raw = Math.min(r.elapsed / RESET_DURATION_MS, 1)
      const t = easeOutCubic(raw)
      // Target is always 0 — baseGroup handles the user's offset layer separately.
      modelGroup.rotation[axis] = r.startRotation * (1 - t)

      if (r.elapsed >= RESET_DURATION_MS) {
        modelGroup.rotation[axis] = 0
        this._resetTransitions[axis] = null
      }
    }

    // positionY lerp (bounce toggle-off)
    const pY = this._resetTransitions.positionY
    if (pY && modelGroup.position) {
      pY.elapsed += deltaSeconds * 1000
      const t = easeOutCubic(Math.min(pY.elapsed / RESET_DURATION_MS, 1))
      modelGroup.position.y = pY.startValue * (1 - t)
      if (pY.elapsed >= RESET_DURATION_MS) {
        modelGroup.position.y = 0
        this._resetTransitions.positionY = null
      }
    }

    // scale lerp (pulse toggle-off)
    const sc = this._resetTransitions.scale
    if (sc && modelGroup.scale?.setScalar) {
      sc.elapsed += deltaSeconds * 1000
      const t = easeOutCubic(Math.min(sc.elapsed / RESET_DURATION_MS, 1))
      modelGroup.scale.setScalar(sc.startValue + (1 - sc.startValue) * t)
      if (sc.elapsed >= RESET_DURATION_MS) {
        modelGroup.scale.setScalar(1)
        this._resetTransitions.scale = null
      }
    }
  }

  _clearResetTransitions() {
    this._resetTransitions = { x: null, y: null, z: null, positionY: null, scale: null }
    this._orbitRestorePending = null
  }

  update(modelGroup, effect, deltaSeconds = 1 / 60, camera) {
    // Initialise the previous-effects snapshot on the very first frame so we
    // never trigger a spurious reset at startup.
    if (this._previousEffects === null) {
      this._previousEffects = { ...this.animationEffects }
    }

    this._checkForResets(modelGroup)

    // Restore camera from orbit baseline when orbit was just toggled off
    if (this._orbitRestorePending && camera) {
      camera.position.copy(this._orbitRestorePending.pos)
      camera.quaternion.copy(this._orbitRestorePending.quat)
      this._orbitRestorePending = null
    }

    // Snapshot current state for the next frame — done after _checkForResets so
    // the comparison above always sees the transition that just happened.
    this._previousEffects = { ...this.animationEffects }

    if (!this.useFadeInOut) {
      if (effect.getAnimationPhase() !== 'show') {
        effect.startAnimation('show')
      }
      this.applyEffects(modelGroup, deltaSeconds, camera)
      this._applyResetTransitions(modelGroup, deltaSeconds)
      return
    }

    const now = performance.now()
    const currentPhase = effect.getAnimationPhase()
    if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
      effect.startAnimation('show')
      this.phaseStartTime = now
      // Do NOT call applyEffects here. The transition frame must render at the same
      // rotation the particles were computed from — any increment would cause a visible
      // tilt as the static render snaps to a different pose than the particle positions.
      // Rotation begins on the next frame when the show branch runs normally.
    } else if (currentPhase === 'show') {
      this.applyEffects(modelGroup, deltaSeconds, camera)
      this._applyResetTransitions(modelGroup, deltaSeconds)
      if (now - this.phaseStartTime >= this.showPhaseDuration) {
        effect.startAnimation('fadeOut')
      }
    } else if (currentPhase === 'fadeOut') {
      // Continue rotating during fade-out — particles are 2D snapshots that fade
      // independently of the 3D model, so rotation here is visually seamless.
      this.applyEffects(modelGroup, deltaSeconds, camera)
      this._applyResetTransitions(modelGroup, deltaSeconds)
      if (effect.isAnimationComplete()) {
        effect.startAnimation('fadeIn')
      }
    }
  }

  getLoopDurationMs() {
    if (!this.useFadeInOut) {
      return Math.round(((2 * Math.PI) / this.speed) * 1000)
    }
    return this.animationDuration * 2 + this.showPhaseDuration
  }

  resetToStart() {
    this.time = 0
    this.phaseStartTime = 0
    this._clearResetTransitions()
    this._orbitBaseline = null
  }

  // Apply the animation state for an absolute position within the loop.
  // Sets model rotation from t=0 and configures effect phase/progress.
  // Safe to call with a paused renderer loop.
  seekTo(absoluteTimeMs, modelGroup, effect, camera) {
    // Clear any in-progress resets — they're incompatible with deterministic seeking.
    this._clearResetTransitions()

    const ts = absoluteTimeMs / 1000
    this.time = ts

    if (modelGroup) {
      // Start animGroup at zero — baseGroup holds the user's pose offset independently.
      modelGroup.rotation.set(0, 0, 0)
      // Reset position and scale before analytically computing new values
      if (modelGroup.position) {
        modelGroup.position.x = 0
        modelGroup.position.y = 0
        modelGroup.position.z = 0
      }
      if (modelGroup.scale?.setScalar) modelGroup.scale.setScalar(1)
      const e = this.animationEffects
      const speed = this.speed

      // Mirror update(): rotation only accumulates during the 'show' phase.
      // During fadeIn and fadeOut the model is stationary — this keeps particle
      // landing positions consistent with the rotation shown in the show phase.
      let showTs = ts // seconds elapsed within the show phase
      if (this.useFadeInOut) {
        const fadeDurS = this.animationDuration / 1000
        if (ts < fadeDurS) {
          showTs = 0 // fade-in: model stationary at rotation 0
        } else {
          // Both show and fade-out: rotation runs continuously from show start.
          // fade-out keeps the model spinning (matches live animation behaviour).
          showTs = ts - fadeDurS
        }
      }

      if (e.spinX) modelGroup.rotation.x += speed * showTs
      if (e.spinY) modelGroup.rotation.y += speed * showTs
      if (e.spinZ) modelGroup.rotation.z += speed * showTs
      if (e.float) {
        const ox = FLOAT_PRESET?.oscillateX ?? 0.15
        const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
        // Analytical integral of the incremental float deltas applied per frame
        modelGroup.rotation.x += ox * 4 * (1 - Math.cos(0.5 * showTs))
        modelGroup.rotation.z += ((oz * 2) / 0.3) * (1 - Math.cos(0.3 * showTs))
      }

      if (e.bounce && modelGroup.position) {
        modelGroup.position.y = Math.abs(Math.sin(showTs * speed * 1.8)) * 0.5
      }
      if (e.pulse && modelGroup.scale?.setScalar) {
        modelGroup.scale.setScalar(1 + Math.sin(showTs * speed * 1.5) * 0.12)
      }
      if (e.shake && modelGroup.position) {
        const shakeSeed = (Math.floor(showTs * 30) * 0x9e3779b9) >>> 0
        const rng = createRNG(shakeSeed)
        modelGroup.position.x = (rng() - 0.5) * 0.08
        modelGroup.position.z = (rng() - 0.5) * 0.08
      }
    }

    if (this.animationEffects.orbit && camera) {
      const showTs = absoluteTimeMs / 1000
      const r = this._orbitBaseline ? this._orbitBaseline.pos.length() : 5
      const baseY = this._orbitBaseline ? this._orbitBaseline.pos.y : 0.5
      const angle = showTs * this.speed * 0.5
      camera.position.set(Math.sin(angle) * r, baseY, Math.cos(angle) * r)
      camera.lookAt(0, 0, 0)
    }

    if (effect) {
      if (this.useFadeInOut) {
        const dur = this.animationDuration
        const show = this.showPhaseDuration
        const t = absoluteTimeMs
        if (t < dur) {
          effect.setPhaseProgress('fadeIn', t / dur)
        } else if (t < dur + show) {
          effect.setPhaseProgress('show', 1)
        } else {
          effect.setPhaseProgress('fadeOut', (t - dur - show) / dur)
        }
      } else {
        effect.setPhaseProgress('show', 1)
      }
    }
  }
}

export { AnimationEngine }
