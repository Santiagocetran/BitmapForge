import { ANIMATION_EFFECT_KEYS } from '../../../engine/animation/effectTypes.js'
import { FADE_VARIANT_KEYS, FADE_VARIANT_LABELS } from '../../../engine/effects/fadeVariants/index.js'
import { useProjectStore } from '../../store/useProjectStore.js'

const EFFECT_LABELS = {
  spinX: 'Spin X',
  spinY: 'Spin Y',
  spinZ: 'Spin Z',
  float: 'Float'
}

function AnimationControls() {
  const useFadeInOut = useProjectStore((state) => state.useFadeInOut)
  const fadeVariant = useProjectStore((state) => state.fadeVariant)
  const animationEffects = useProjectStore((state) => state.animationEffects)
  const animationSpeed = useProjectStore((state) => state.animationSpeed)
  const showPhaseDuration = useProjectStore((state) => state.showPhaseDuration)
  const animationDuration = useProjectStore((state) => state.animationDuration)
  const setUseFadeInOut = useProjectStore((state) => state.setUseFadeInOut)
  const setFadeVariant = useProjectStore((state) => state.setFadeVariant)
  const setAnimationEffect = useProjectStore((state) => state.setAnimationEffect)
  const setAnimationSpeed = useProjectStore((state) => state.setAnimationSpeed)
  const setShowPhaseDuration = useProjectStore((state) => state.setShowPhaseDuration)
  const setAnimationDuration = useProjectStore((state) => state.setAnimationDuration)

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useFadeInOut} onChange={(e) => setUseFadeInOut(e.target.checked)} />
          Fade in / out
        </label>

        {useFadeInOut && (
          <div className="space-y-1.5 pl-1">
            <span className="text-xs font-medium text-zinc-400">Style</span>
            <div className="flex flex-wrap gap-2">
              {FADE_VARIANT_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-xs">
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
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-zinc-400">Motion (combine any)</span>
        <div className="flex flex-wrap gap-2">
          {ANIMATION_EFFECT_KEYS.map((key) => {
            const label = EFFECT_LABELS[key] ?? key
            return (
              <label key={key} className="flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-xs">
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
      </div>

      <label htmlFor="anim-speed" className="block text-sm">
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
        className="w-full"
      />

      {useFadeInOut && (
        <div className="space-y-2 border-t border-zinc-700 pt-2">
          <label htmlFor="anim-fade-duration" className="block text-sm">
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
            className="w-full"
          />
          <label htmlFor="anim-show-duration" className="block text-sm">
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
            className="w-full"
          />
        </div>
      )}
    </section>
  )
}

export { AnimationControls }
