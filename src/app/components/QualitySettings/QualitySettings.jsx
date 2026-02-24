import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'

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

  // Finding 15: track details open state for aria-expanded
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <section className="space-y-3">
      {/* Finding 13: explicit id/htmlFor for range inputs */}
      <label htmlFor="quality-pixel-size" className="block text-sm">
        Pixel Size: {pixelSize}
      </label>
      <input
        id="quality-pixel-size"
        type="range"
        min="1"
        max="20"
        value={pixelSize}
        onChange={(event) => setPixelSize(Number(event.target.value))}
        className="w-full"
      />

      {/* Finding 15: controlled details with aria-expanded */}
      <details
        className="rounded border border-zinc-700 p-2"
        open={advancedOpen}
        onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
      >
        <summary className="cursor-pointer text-sm" aria-expanded={advancedOpen}>
          Advanced
        </summary>
        <div className="mt-2 space-y-3">
          <label className="block text-sm">
            Dither Type
            {/* Finding 23: bg-zinc-800 for form inputs */}
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

          {/* Finding 13: explicit id/htmlFor for range input */}
          <label htmlFor="quality-min-brightness" className="block text-sm">
            Min Brightness: {minBrightness.toFixed(2)}
          </label>
          <input
            id="quality-min-brightness"
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={minBrightness}
            onChange={(event) => setMinBrightness(Number(event.target.value))}
            className="w-full"
          />

          <label className="block text-sm">
            Background
            <div className="mt-1 flex items-center gap-2">
              {/* Finding 22: standardized button style */}
              <button
                type="button"
                className={`${BTN.base} ${BTN.secondary}`}
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
