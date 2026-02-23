import { ANIMATION_PRESETS } from './presets.js'
import { DEFAULT_ANIMATION_EFFECTS } from './effectTypes.js'

const FLOAT_PRESET = ANIMATION_PRESETS.float

class AnimationEngine {
  constructor() {
    this.useFadeInOut = true
    this.animationEffects = { ...DEFAULT_ANIMATION_EFFECTS }
    this.speed = ANIMATION_PRESETS.spinY.defaultSpeed
    this.showPhaseDuration = 20000
    this.animationDuration = 2500
    this.phaseStartTime = performance.now()
    this.time = 0
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
  }

  update(modelGroup, effect, deltaSeconds = 1 / 60) {
    if (!this.useFadeInOut) {
      if (effect.getAnimationPhase() !== 'show') {
        effect.startAnimation('show')
      }
      this.applyEffects(modelGroup, deltaSeconds)
      return
    }

    const now = performance.now()
    const currentPhase = effect.getAnimationPhase()
    if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
      effect.startAnimation('show')
      this.phaseStartTime = now
    } else if (currentPhase === 'show') {
      this.applyEffects(modelGroup, deltaSeconds)
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
  }

  // Apply the animation state for an absolute position within the loop.
  // Sets model rotation from t=0 and configures effect phase/progress.
  // Safe to call with a paused renderer loop.
  seekTo(absoluteTimeMs, modelGroup, effect) {
    const ts = absoluteTimeMs / 1000

    if (modelGroup) {
      modelGroup.rotation.set(0, 0, 0)
      const e = this.animationEffects
      const speed = this.speed
      if (e.spinX) modelGroup.rotation.x += speed * ts
      if (e.spinY) modelGroup.rotation.y += speed * ts
      if (e.spinZ) modelGroup.rotation.z += speed * ts
      if (e.float) {
        const ox = FLOAT_PRESET?.oscillateX ?? 0.15
        const oz = FLOAT_PRESET?.oscillateZ ?? 0.08
        // Analytical integral of the incremental float deltas applied each frame
        modelGroup.rotation.x += ox * 4 * (1 - Math.cos(0.5 * ts))
        modelGroup.rotation.z += ((oz * 2) / 0.3) * (1 - Math.cos(0.3 * ts))
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
