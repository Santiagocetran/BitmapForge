import { useProjectStore } from '../../store/useProjectStore.js'

function QualitySettings() {
  const pixelSize = useProjectStore((state) => state.pixelSize)
  const ditherType = useProjectStore((state) => state.ditherType)
  const invert = useProjectStore((state) => state.invert)
  const minBrightness = useProjectStore((state) => state.minBrightness)
  const backgroundColor = useProjectStore((state) => state.backgroundColor)
  const setPixelSize = useProjectStore((state) => state.setPixelSize)
  const setDitherType = useProjectStore((state) => state.setDitherType)
  const setInvert = useProjectStore((state) => state.setInvert)
  const setMinBrightness = useProjectStore((state) => state.setMinBrightness)
  const setBackgroundColor = useProjectStore((state) => state.setBackgroundColor)

  return (
    <section className="space-y-3">
      <label className="block text-sm">
        Pixel Size: {pixelSize}
        <input
          type="range"
          min="1"
          max="20"
          value={pixelSize}
          onChange={(event) => setPixelSize(Number(event.target.value))}
          className="w-full"
        />
      </label>

      <details className="rounded border border-zinc-700 p-2">
        <summary className="cursor-pointer text-sm">Advanced</summary>
        <div className="mt-2 space-y-3">
          <label className="block text-sm">
            Dither Type
            <select
              className="mt-1 w-full rounded bg-zinc-800 p-1"
              value={ditherType}
              onChange={(event) => setDitherType(event.target.value)}
            >
              <option value="bayer4x4">Bayer 4x4</option>
              <option value="bayer8x8">Bayer 8x8</option>
              <option value="variableDot">Variable Dot</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
            Invert Brightness
          </label>

          <label className="block text-sm">
            Min Brightness: {minBrightness.toFixed(2)}
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={minBrightness}
              onChange={(event) => setMinBrightness(Number(event.target.value))}
              className="w-full"
            />
          </label>

          <label className="block text-sm">
            Background
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                className="rounded bg-zinc-700 px-2 py-1 text-xs"
                onClick={() => setBackgroundColor('transparent')}
              >
                Transparent
              </button>
              <input
                type="color"
                value={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
              />
            </div>
          </label>
        </div>
      </details>
    </section>
  )
}

export { QualitySettings }
