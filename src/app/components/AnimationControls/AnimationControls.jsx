import { useProjectStore } from '../../store/useProjectStore.js'

const PRESETS = ['spinY', 'spinX', 'spinZ', 'float', 'fadeInOut']

function AnimationControls() {
  const animationPreset = useProjectStore((state) => state.animationPreset)
  const animationSpeed = useProjectStore((state) => state.animationSpeed)
  const showPhaseDuration = useProjectStore((state) => state.showPhaseDuration)
  const animationDuration = useProjectStore((state) => state.animationDuration)
  const rotateOnShow = useProjectStore((state) => state.rotateOnShow)
  const showPreset = useProjectStore((state) => state.showPreset)
  const setAnimationPreset = useProjectStore((state) => state.setAnimationPreset)
  const setAnimationSpeed = useProjectStore((state) => state.setAnimationSpeed)
  const setShowPhaseDuration = useProjectStore((state) => state.setShowPhaseDuration)
  const setAnimationDuration = useProjectStore((state) => state.setAnimationDuration)
  const setRotateOnShow = useProjectStore((state) => state.setRotateOnShow)
  const setShowPreset = useProjectStore((state) => state.setShowPreset)

  const isFade = animationPreset === 'fadeInOut'

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={`rounded px-2 py-1 text-xs ${
              animationPreset === preset ? 'bg-emerald-500 text-black' : 'bg-zinc-700'
            }`}
            onClick={() => setAnimationPreset(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      {!isFade && (
        <label className="block text-sm">
          Speed: {animationSpeed.toFixed(2)} rad/s
          <input
            type="range"
            min="0.05"
            max="2"
            step="0.01"
            value={animationSpeed}
            onChange={(event) => setAnimationSpeed(Number(event.target.value))}
            className="w-full"
          />
        </label>
      )}

      {isFade && (
        <div className="space-y-2">
          <label className="block text-sm">
            Fade Duration: {animationDuration}ms
            <input
              type="range"
              min="300"
              max="8000"
              step="100"
              value={animationDuration}
              onChange={(event) => setAnimationDuration(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="block text-sm">
            Show Duration: {showPhaseDuration}ms
            <input
              type="range"
              min="1000"
              max="40000"
              step="500"
              value={showPhaseDuration}
              onChange={(event) => setShowPhaseDuration(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rotateOnShow}
              onChange={(event) => setRotateOnShow(event.target.checked)}
            />
            Rotate During Show
          </label>
          {rotateOnShow && (
            <label className="block text-sm">
              Show Rotation Preset
              <select
                className="mt-1 w-full rounded bg-zinc-800 p-1"
                value={showPreset}
                onChange={(event) => setShowPreset(event.target.value)}
              >
                <option value="spinY">Spin Y</option>
                <option value="spinX">Spin X</option>
                <option value="spinZ">Spin Z</option>
                <option value="float">Float</option>
              </select>
            </label>
          )}
        </div>
      )}
    </section>
  )
}

export { AnimationControls }
