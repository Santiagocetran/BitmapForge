import { ANIMATION_PRESETS } from './presets.js'

class AnimationEngine {
  constructor() {
    this.presetKey = 'spinY'
    this.speed = ANIMATION_PRESETS.spinY.defaultSpeed
    this.showPhaseDuration = 20000
    this.animationDuration = 2500
    this.rotateOnShow = false
    this.showPreset = 'spinY'
    this.phaseStartTime = performance.now()
    this.time = 0
  }

  setPreset(presetKey) {
    this.presetKey = presetKey
    const preset = ANIMATION_PRESETS[presetKey]
    if (preset?.type === 'fadeInOut') {
      this.showPhaseDuration = preset.showDuration
      this.animationDuration = preset.animationDuration
      this.rotateOnShow = preset.rotateOnShow
      this.showPreset = preset.showPreset
    }
  }

  setSpeed(speedRadPerSec) {
    this.speed = Math.max(0.01, speedRadPerSec)
  }

  setFadeOptions({ showPhaseDuration, animationDuration, rotateOnShow, showPreset }) {
    if (typeof showPhaseDuration === 'number') this.showPhaseDuration = showPhaseDuration
    if (typeof animationDuration === 'number') this.animationDuration = animationDuration
    if (typeof rotateOnShow === 'boolean') this.rotateOnShow = rotateOnShow
    if (typeof showPreset === 'string') this.showPreset = showPreset
  }

  applyModelTransform(modelGroup, presetKey, deltaSeconds) {
    const preset = ANIMATION_PRESETS[presetKey]
    if (!modelGroup || !preset) return

    if (preset.type === 'spin') {
      modelGroup.rotation[preset.axis] += this.speed * deltaSeconds
      return
    }

    if (preset.type === 'float') {
      this.time += deltaSeconds
      modelGroup.rotation.y += this.speed * deltaSeconds
      modelGroup.rotation.x = Math.sin(this.time * 0.5) * preset.oscillateX
      modelGroup.rotation.z = Math.sin(this.time * 0.3) * preset.oscillateZ
    }
  }

  update(modelGroup, effect, deltaSeconds = 1 / 60) {
    const preset = ANIMATION_PRESETS[this.presetKey] ?? ANIMATION_PRESETS.spinY
    if (preset.type !== 'fadeInOut') {
      if (effect.getAnimationPhase() !== 'show') {
        effect.startAnimation('show')
      }
      this.applyModelTransform(modelGroup, this.presetKey, deltaSeconds)
      return
    }

    const now = performance.now()
    const currentPhase = effect.getAnimationPhase()
    if (currentPhase === 'fadeIn' && effect.isAnimationComplete()) {
      effect.startAnimation('show')
      this.phaseStartTime = now
    } else if (currentPhase === 'show') {
      if (this.rotateOnShow) {
        this.applyModelTransform(modelGroup, this.showPreset, deltaSeconds)
      }
      if (now - this.phaseStartTime >= this.showPhaseDuration) {
        effect.startAnimation('fadeOut')
      }
    } else if (currentPhase === 'fadeOut' && effect.isAnimationComplete()) {
      effect.startAnimation('fadeIn')
    }
  }

  getLoopDurationMs() {
    const preset = ANIMATION_PRESETS[this.presetKey] ?? ANIMATION_PRESETS.spinY
    if (preset.type === 'fadeInOut') {
      return this.animationDuration * 2 + this.showPhaseDuration
    }
    // full 2pi revolution
    return Math.round((2 * Math.PI / this.speed) * 1000)
  }
}

export { AnimationEngine }
