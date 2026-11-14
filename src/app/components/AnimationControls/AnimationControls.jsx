import { ANIMATION_EFFECT_KEYS } from '../../../engine/animation/effectTypes.js'
import { FADE_VARIANT_KEYS, FADE_VARIANT_LABELS } from '../../../engine/effects/fadeVariants/index.js'
import { useProjectStore } from '../../store/useProjectStore.js'

const EFFECT_LABELS = {
  spinX: 'Spin X',
  spinY: 'Spin Y',
  spinZ: 'Spin Z',
  float: 'Float',
  bounce: 'Bounce',
  pulse: 'Pulse',
  shake: 'Shake',
  orbit: 'Orbit'
}

function AnimationControls() {
  const useFadeInOut = useProjectStore((state) => state.useFadeInOut)
  const fadeVariant = useProjectStore((state) => state.fadeVariant)
  const animationEffects = useProjectStore((state) => state.animationEffects)
  const animationSpeed = useProjectStore((state) => state.animationSpeed)
  const showPhaseDuration = useProjectStore((state) => state.showPhaseDuration)
  const animationDuration = useProjectStore((state) => state.animationDuration)
  const fadeMode = useProjectStore((state) => state.fadeMode)
  const setUseFadeInOut = useProjectStore((state) => state.setUseFadeInOut)
  const setFadeVariant = useProjectStore((state) => state.setFadeVariant)
  const setFadeMode = useProjectStore((state) => state.setFadeMode)
  const setAnimationEffect = useProjectStore((state) => state.setAnimationEffect)
  const setAnimationSpeed = useProjectStore((state) => state.setAnimationSpeed)
  const setShowPhaseDuration = useProjectStore((state) => state.setShowPhaseDuration)
  const setAnimationDuration = useProjectStore((state) => state.setAnimationDuration)

  return (
    <section className="bf-control-group">
      <div className="bf-control-group">
        <h3 className="bf-group-title">Loop animation</h3>
        <label className="bf-check-row">
          <input type="checkbox" checked={useFadeInOut} onChange={(e) => setUseFadeInOut(e.target.checked)} />
          Fade in / out
        </label>

        {useFadeInOut && (
          <div className="bf-control-group">
            <fieldset>
              <legend className="bf-label">Fade direction</legend>
              <div className="bf-choice-grid">
                {[
                  { key: 'both', label: 'Both' },
                  { key: 'in', label: 'Fade in only' },
                  { key: 'out', label: 'Fade out only' }
                ].map(({ key, label }) => (
                  <label key={key} className="bf-check-row">
                    <input
                      type="radio"
                      name="fade-mode"
                      value={key}
                      checked={(fadeMode ?? 'both') === key}
                      onChange={() => setFadeMode(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="bf-label">Fade style</legend>
              <div className="bf-choice-grid">
                {FADE_VARIANT_KEYS.map((key) => (
                  <label key={key} className="bf-check-row">
                    <input
                      type="radio"
                      name="fade-variant"
                      value={key}
                      checked={fadeVariant === key}
                      onChange={() => setFadeVariant(key)}
                    />
                    {FADE_VARIANT_LABELS[key]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <fieldset className="bf-group">
        <legend className="bf-group-title">Motion (combine any)</legend>
        <p className="bf-help">Combine continuous effects independently of the static pose.</p>
        <div className="bf-choice-grid">
          {ANIMATION_EFFECT_KEYS.map((key) => {
            const label = EFFECT_LABELS[key] ?? key
            return (
              <label key={key} className="bf-check-row">
                <input
                  type="checkbox"
                  checked={animationEffects[key] ?? false}
                  onChange={(e) => setAnimationEffect(key, e.target.checked)}
                />
                {label}
              </label>
            )
          })}
        </div>

        <label htmlFor="anim-speed" className="bf-label">
          Speed: {animationSpeed.toFixed(2)} rad/s
        </label>
        <input
          id="anim-speed"
          type="range"
          min="0.05"
          max="2"
          step="0.01"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(Number(e.target.value))}
          className="bf-range"
        />
      </fieldset>
      {useFadeInOut && (
        <div className="bf-group bf-control-group">
          <h3 className="bf-group-title">Timing</h3>
          <label htmlFor="anim-fade-duration" className="bf-label">
            Fade duration: {animationDuration}ms
          </label>
          <input
            id="anim-fade-duration"
            type="range"
            min="300"
            max="8000"
            step="100"
            value={animationDuration}
            onChange={(e) => setAnimationDuration(Number(e.target.value))}
            className="bf-range"
          />
          <label htmlFor="anim-show-duration" className="bf-label">
            Show duration: {showPhaseDuration}ms
          </label>
          <input
            id="anim-show-duration"
            type="range"
            min="1000"
            max="40000"
            step="500"
            value={showPhaseDuration}
            onChange={(e) => setShowPhaseDuration(Number(e.target.value))}
            className="bf-range"
          />
        </div>
      )}
    </section>
  )
}

export { AnimationControls }
