import { ANIMATION_PRESETS } from './presets.js'
import { DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'
import { SpinEffect } from './effects/SpinEffect.js'
import { FloatEffect } from './effects/FloatEffect.js'
import { BounceEffect } from './effects/BounceEffect.js'
import { PulseEffect } from './effects/PulseEffect.js'
import { ShakeEffect } from './effects/ShakeEffect.js'
import { OrbitEffect } from './effects/OrbitEffect.js'

/** Deterministic execution order for all animation effects. */
const EFFECT_ORDER = ['spinX', 'spinY', 'spinZ', 'float', 'bounce', 'pulse', 'shake', 'orbit']

class AnimationEngine {
  constructor() {
    this.useFadeInOut = true
    this.fadeMode = 'both'
    this.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS }
    this.speed = ANIMATION_PRESETS.spinY.defaultSpeed
    this.showPhaseDuration = 20000
    this.animationDuration = 2500
    this.phaseStartTime = performance.now()
    this.time = 0

    // Base rotation offset (set by the rotation gizmo; reset target for lerps).
    this.baseRotation = { x: 0, y: 0, z: 0 }

    // --- Effect instances ---
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
    this._effectList = EFFECT_ORDER.map((key) => ({ key, effect: this._effectMap[key] }))

    // Backward-compatible proxy: tests and external code may read/write
    // _resetTransitions directly. This object delegates to the effect instances.
    this._resetTransitions = this._createResetTransitionsProxy()

    // Snapshot of previous effects — populated on the first update() call so
    // startup never triggers a spurious reset.
    this._previousEffects = null

    // Spin-aligned show duration computed once when entering the show phase.
    // Rounds up to the nearest full rotation so fadeOut always fires at a
    // complete spin boundary (360°, 720°, …).
    this._effectiveShowDuration = this.showPhaseDuration
  }

  // Build a proxy object that maps the old _resetTransitions shape to effect internals.
  _createResetTransitionsProxy() {
    const self = this
    return {
      get x() {
        return self._effectMap.spinX._reset
      },
      set x(val) {
        self._effectMap.spinX._reset = val
      },
      get y() {
        return self._effectMap.spinY._reset
      },
      set y(val) {
        self._effectMap.spinY._reset = val
      },
      get z() {
        return self._effectMap.spinZ._reset
      },
      set z(val) {
        self._effectMap.spinZ._reset = val
      },
      get positionY() {
        return self._effectMap.bounce._reset
      },
      set positionY(val) {
        self._effectMap.bounce._reset = val
      },
      get scale() {
        return self._effectMap.pulse._reset
      },
      set scale(val) {
        self._effectMap.pulse._reset = val
      }
    }
  }

  // Backward-compatible proxy for orbit baseline
  get _orbitBaseline() {
    return this._effectMap.orbit._baseline
  }

  set _orbitBaseline(val) {
    this._effectMap.orbit._baseline = val
  }

  get _orbitRestorePending() {
    return this._effectMap.orbit._restorePending
  }

  set _orbitRestorePending(val) {
    this._effectMap.orbit._restorePending = val
  }

  // Compute the show phase duration rounded up to the nearest complete spin
  // so fadeOut always fires at a 360°/720°/… boundary.
  // Falls back to raw showPhaseDuration when no spin effect is active.
  _computeSpinAlignedShowDuration() {
    const hasSpin = this.animationEffects.spinX || this.animationEffects.spinY || this.animationEffects.spinZ
    if (!hasSpin) return this.showPhaseDuration
    const spinPeriodMs = (2 * Math.PI / this.speed) * 1000
    const minSpins = Math.max(1, Math.ceil(this.showPhaseDuration / spinPeriodMs))
    return minSpins * spinPeriodMs
  }

  // Called by SceneManager when an external event (e.g. fade variant change)
  // triggers a new fadeIn mid-loop so the 3D model rotation is reset before
  // particles are captured.
  onExternalFadeRestart(modelGroup) {
    this._resetSpinRotations(modelGroup)
  }

  // Reset accumulated rotation to 0 for every active spin axis.
  // Called at cycle boundaries so each fadeIn always starts from the front.
  _resetSpinRotations(modelGroup) {
    if (!modelGroup) return
    const e = this.animationEffects
    if (e.spinX) modelGroup.rotation.x = 0
    if (e.spinY) modelGroup.rotation.y = 0
    if (e.spinZ) modelGroup.rotation.z = 0
  }

  setFadeOptions(options = {}) {
    if (typeof options.useFadeInOut === 'boolean') this.useFadeInOut = options.useFadeInOut
    if (options.fadeMode === 'both' || options.fadeMode === 'in' || options.fadeMode === 'out') {
      this.fadeMode = options.fadeMode
    }
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

    // Advance shared time for all time-dependent effects (once per frame)
    if (e.float || e.bounce || e.pulse || e.shake || e.orbit) {
      this.time += deltaSeconds
    }

    const context = {
      time: this.time,
      animationEffects: e,
      camera: camera || null
    }

    for (const { key, effect } of this._effectList) {
      if (e[key]) {
        effect.update(modelGroup, deltaSeconds, this.speed, context)
      }
    }
  }

  // Detect which axes just lost their driving animation and start lerps for them.
  _checkForResets(modelGroup) {
    if (!modelGroup) return

    const prev = this._previousEffects
    const curr = this.animationEffects
    const context = { animationEffects: curr }

    for (const { key, effect } of this._effectList) {
      effect.checkReset(curr[key], prev[key], modelGroup, context)
    }
  }

  // Advance all active lerps and write corrected rotation values.
  _applyResetTransitions(modelGroup, deltaSeconds) {
    if (!modelGroup) return

    // SpinEffect and FloatEffect store elapsed in seconds.
    // BounceEffect and PulseEffect also store elapsed in seconds now.
    // But the old tests set elapsed = 0 and pass deltaSeconds directly,
    // so we need to convert: old code used ms internally (elapsed += deltaSeconds * 1000,
    // compared against RESET_DURATION_MS = 300). New effects use seconds
    // (elapsed += deltaSeconds, compared against 0.3).
    //
    // The proxy exposes the effect's internal _reset objects directly.
    // Since the old tests set { startValue: 0.5, elapsed: 0 } and call
    // _applyResetTransitions(group, 1.0), the effect's applyReset must
    // handle elapsed in seconds (1.0 > 0.3, so reset completes). This works.

    for (const { effect } of this._effectList) {
      effect.applyReset(modelGroup, deltaSeconds)
    }
  }

  _clearResetTransitions() {
    for (const { effect } of this._effectList) {
      effect.clearReset()
    }
  }

  update(modelGroup, effect, deltaSeconds = 1 / 60, camera) {
    // Initialise the previous-effects snapshot on the very first frame so we
    // never trigger a spurious reset at startup.
    if (this._previousEffects === null) {
      this._previousEffects = { ...this.animationEffects }
    }

    this._checkForResets(modelGroup)

    // Restore camera from orbit baseline when orbit was just toggled off
    this._effectMap.orbit.restoreCamera(camera)

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

    if (this.fadeMode === 'in') {
      // Sequence: fadeIn → show → fadeIn → … (no fadeOut)
      if (currentPhase === 'fadeOut') {
        // Landed here from a mode switch — jump back to fadeIn.
        this._resetSpinRotations(modelGroup)
        effect.startAnimation('fadeIn')
      } else if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
        this._effectiveShowDuration = this._computeSpinAlignedShowDuration()
        effect.startAnimation('show')
        this.phaseStartTime = now
      } else if (currentPhase === 'show') {
        this.applyEffects(modelGroup, deltaSeconds, camera)
        this._applyResetTransitions(modelGroup, deltaSeconds)
        if (now - this.phaseStartTime >= this._effectiveShowDuration) {
          // Reset spin to front so the next fadeIn always assembles facing forward.
          this._resetSpinRotations(modelGroup)
          effect.startAnimation('fadeIn')
        }
      }
    } else if (this.fadeMode === 'out') {
      // Sequence: show → fadeOut → show → … (no fadeIn)
      if (currentPhase === 'fadeIn') {
        // Initial state or mode switch — skip directly to show.
        this._effectiveShowDuration = this._computeSpinAlignedShowDuration()
        effect.startAnimation('show')
        this.phaseStartTime = now
      } else if (currentPhase === 'show') {
        this.applyEffects(modelGroup, deltaSeconds, camera)
        this._applyResetTransitions(modelGroup, deltaSeconds)
        if (now - this.phaseStartTime >= this._effectiveShowDuration) {
          effect.startAnimation('fadeOut')
        }
      } else if (currentPhase === 'fadeOut') {
        this.applyEffects(modelGroup, deltaSeconds, camera)
        this._applyResetTransitions(modelGroup, deltaSeconds)
        if (effect.isAnimationComplete()) {
          // Reset spin to front before the next show phase so the object always
          // starts facing forward after fading back in.
          this._resetSpinRotations(modelGroup)
          this._effectiveShowDuration = this._computeSpinAlignedShowDuration()
          effect.startAnimation('show')
          this.phaseStartTime = now
        }
      }
    } else {
      // 'both' — fadeIn → show → fadeOut → …
      if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
        this._effectiveShowDuration = this._computeSpinAlignedShowDuration()
        effect.startAnimation('show')
        this.phaseStartTime = now
        // Do NOT call applyEffects here. The transition frame must render at the same
        // rotation the particles were computed from — any increment would cause a visible
        // tilt as the static render snaps to a different pose than the particle positions.
        // Rotation begins on the next frame when the show branch runs normally.
      } else if (currentPhase === 'show') {
        this.applyEffects(modelGroup, deltaSeconds, camera)
        this._applyResetTransitions(modelGroup, deltaSeconds)
        if (now - this.phaseStartTime >= this._effectiveShowDuration) {
          effect.startAnimation('fadeOut')
        }
      } else if (currentPhase === 'fadeOut') {
        // Continue rotating during fade-out — particles are 2D snapshots that fade
        // independently of the 3D model, so rotation here is visually seamless.
        this.applyEffects(modelGroup, deltaSeconds, camera)
        this._applyResetTransitions(modelGroup, deltaSeconds)
        if (effect.isAnimationComplete()) {
          // Reset spin to front so the next fadeIn always assembles facing forward.
          this._resetSpinRotations(modelGroup)
          effect.startAnimation('fadeIn')
        }
      }
    }
  }

  getLoopDurationMs() {
    if (!this.useFadeInOut) {
      return Math.round(((2 * Math.PI) / this.speed) * 1000)
    }
    const effectiveShow = this._computeSpinAlignedShowDuration()
    if (this.fadeMode === 'in' || this.fadeMode === 'out') {
      return this.animationDuration + effectiveShow
    }
    return this.animationDuration * 2 + effectiveShow
  }

  resetToStart() {
    this.time = 0
    this.phaseStartTime = 0
    this._clearResetTransitions()
    this._effectMap.orbit.clearBaseline()
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

      // Mirror update(): rotation only accumulates during the 'show' phase.
      // During fadeIn the model is stationary — this keeps particle landing
      // positions consistent with the rotation shown in the show phase.
      let showTs = ts // seconds elapsed within the show phase
      if (this.useFadeInOut) {
        const fadeDurS = this.animationDuration / 1000
        if (this.fadeMode === 'in') {
          // Loop: [fadeIn(dur), show(showDur)]
          if (ts < fadeDurS) {
            showTs = 0 // fadeIn: model stationary
          } else {
            showTs = ts - fadeDurS
          }
        } else if (this.fadeMode === 'out') {
          // Loop: [show(showDur), fadeOut(dur)] — no static phase, rotation runs from start.
          showTs = ts
        } else {
          // 'both': [fadeIn(dur), show(showDur), fadeOut(dur)]
          if (ts < fadeDurS) {
            showTs = 0 // fadeIn: model stationary
          } else {
            showTs = ts - fadeDurS
          }
        }
      }

      const context = {
        time: showTs,
        animationEffects: e,
        camera: camera || null
      }

      for (const { key, effect: fx } of this._effectList) {
        if (key === 'orbit') continue // orbit handled separately below (uses raw ts)
        if (e[key]) {
          fx.seekTo(modelGroup, showTs, this.speed, context)
        }
      }
    }

    // Orbit uses the full absolute time (not showTs) and operates on camera
    if (this.animationEffects.orbit && camera) {
      const context = {
        time: ts,
        animationEffects: this.animationEffects,
        camera
      }
      this._effectMap.orbit.seekTo(null, ts, this.speed, context)
    }

    if (effect) {
      if (this.useFadeInOut) {
        const dur = this.animationDuration
        const show = this._computeSpinAlignedShowDuration()
        const t = absoluteTimeMs
        if (this.fadeMode === 'in') {
          // Loop: [fadeIn(dur), show(showDur)]
          if (t < dur) {
            effect.setPhaseProgress('fadeIn', t / dur)
          } else {
            effect.setPhaseProgress('show', 1)
          }
        } else if (this.fadeMode === 'out') {
          // Loop: [show(showDur), fadeOut(dur)]
          if (t < show) {
            effect.setPhaseProgress('show', 1)
          } else {
            effect.setPhaseProgress('fadeOut', (t - show) / dur)
          }
        } else {
          // 'both': [fadeIn(dur), show(showDur), fadeOut(dur)]
          if (t < dur) {
            effect.setPhaseProgress('fadeIn', t / dur)
          } else if (t < dur + show) {
            effect.setPhaseProgress('show', 1)
          } else {
            effect.setPhaseProgress('fadeOut', (t - dur - show) / dur)
          }
        }
      } else {
        effect.setPhaseProgress('show', 1)
      }
    }
  }
}

export { AnimationEngine, EFFECT_ORDER }
