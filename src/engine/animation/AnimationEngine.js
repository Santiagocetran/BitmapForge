import { ANIMATION_PRESETS } from './presets.js'
import { DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'

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
    this._resetTransitions = { x: null, y: null, z: null }

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

  applyEffects(modelGroup, deltaSeconds) {
    if (!modelGroup) return
    const e = this.animationEffects
    const speed = this.speed * deltaSeconds

    // Only apply spin/float on axes that are NOT currently being lerped back.
    if (e.spinX && !this._resetTransitions.x) modelGroup.rotation.x += speed
    if (e.spinY && !this._resetTransitions.y) modelGroup.rotation.y += speed
    if (e.spinZ && !this._resetTransitions.z) modelGroup.rotation.z += speed
    if (e.float) {
      this.time += deltaSeconds
      const ox = FLOAT_PRESET?.oscillateX ?? 0.15
      const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
      if (!this._resetTransitions.x) modelGroup.rotation.x += Math.sin(this.time * 0.5) * ox * deltaSeconds * 2
      if (!this._resetTransitions.z) modelGroup.rotation.z += Math.sin(this.time * 0.3) * oz * deltaSeconds * 2
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
  }

  _clearResetTransitions() {
    this._resetTransitions = { x: null, y: null, z: null }
  }

  update(modelGroup, effect, deltaSeconds = 1 / 60) {
    // Initialise the previous-effects snapshot on the very first frame so we
    // never trigger a spurious reset at startup.
    if (this._previousEffects === null) {
      this._previousEffects = { ...this.animationEffects }
    }

    this._checkForResets(modelGroup)
    // Snapshot current state for the next frame — done after _checkForResets so
    // the comparison above always sees the transition that just happened.
    this._previousEffects = { ...this.animationEffects }

    if (!this.useFadeInOut) {
      if (effect.getAnimationPhase() !== 'show') {
        effect.startAnimation('show')
      }
      this.applyEffects(modelGroup, deltaSeconds)
      this._applyResetTransitions(modelGroup, deltaSeconds)
      return
    }

    const now = performance.now()
    const currentPhase = effect.getAnimationPhase()
    if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
      effect.startAnimation('show')
      this.phaseStartTime = now
    } else if (currentPhase === 'show') {
      this.applyEffects(modelGroup, deltaSeconds)
      this._applyResetTransitions(modelGroup, deltaSeconds)
      if (now - this.phaseStartTime >= this.showPhaseDuration) {
        effect.startAnimation('fadeOut')
      }
    } else if (currentPhase === 'fadeOut' && effect.isAnimationComplete()) {
      effect.startAnimation('fadeIn')
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
  }

  // Apply the animation state for an absolute position within the loop.
  // Sets model rotation from t=0 and configures effect phase/progress.
  // Safe to call with a paused renderer loop.
  seekTo(absoluteTimeMs, modelGroup, effect) {
    // Clear any in-progress resets — they're incompatible with deterministic seeking.
    this._clearResetTransitions()

    const ts = absoluteTimeMs / 1000
    this.time = ts

    if (modelGroup) {
      // Start animGroup at zero — baseGroup holds the user's pose offset independently.
      modelGroup.rotation.set(0, 0, 0)
      const e = this.animationEffects
      const speed = this.speed

      // Mirror update(): rotation only accumulates during the 'show' phase.
      // During fadeIn and fadeOut the model is stationary — this keeps particle
      // landing positions consistent with the rotation shown in the show phase.
      let showTs = ts // seconds elapsed within the show phase
      if (this.useFadeInOut) {
        const fadeDurS = this.animationDuration / 1000
        const showDurS = this.showPhaseDuration / 1000
        if (ts < fadeDurS) {
          showTs = 0 // fade-in: model stationary at rotation 0
        } else if (ts < fadeDurS + showDurS) {
          showTs = ts - fadeDurS // show: accumulate from show start
        } else {
          showTs = showDurS // fade-out: frozen at end-of-show rotation
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
