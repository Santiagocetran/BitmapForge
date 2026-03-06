import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { BTN } from '../../styles/buttonStyles.js'
import { InfoTooltip } from '../ui/InfoTooltip.jsx'

function QualitySettings() {
  const pixelSize = useProjectStore((state) => state.pixelSize)
  const ditherType = useProjectStore((state) => state.ditherType)
  const invert = useProjectStore((state) => state.invert)
  const minBrightness = useProjectStore((state) => state.minBrightness)
  const backgroundColor = useProjectStore((state) => state.backgroundColor)
  const seed = useProjectStore((state) => state.seed)
  const setPixelSize = useProjectStore((state) => state.setPixelSize)
  const setDitherType = useProjectStore((state) => state.setDitherType)
  const setInvert = useProjectStore((state) => state.setInvert)
  const setMinBrightness = useProjectStore((state) => state.setMinBrightness)
  const setBackgroundColor = useProjectStore((state) => state.setBackgroundColor)
  const randomizeSeed = useProjectStore((state) => state.randomizeSeed)
  const setSeed = useProjectStore((state) => state.setSeed)

  // Finding 15: track details open state for aria-expanded
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <section className="space-y-3">
      <label htmlFor="quality-pixel-size" className="flex items-center text-sm">
        Pixel Size: {pixelSize}
        <InfoTooltip content="Grid resolution. Smaller = more detail, larger = blockier/more pixelated." />
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
            <span className="flex items-center">
              Dither Type
              <InfoTooltip content="Algorithm for shading. Bayer = ordered grid pattern. Variable Dot = halftone circles. Floyd-Steinberg / Atkinson = error-diffusion (smoother gradients, slower)." />
            </span>
            <select
              className="mt-1 w-full rounded bg-zinc-800 p-1"
              value={ditherType}
              onChange={(event) => setDitherType(event.target.value)}
            >
              <option value="bayer4x4">Bayer 4×4</option>
              <option value="bayer8x8">Bayer 8×8</option>
              <option value="variableDot">Variable Dot</option>
              <option value="floydSteinberg">Floyd-Steinberg</option>
              <option value="atkinson">Atkinson</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
            Invert Brightness
            <InfoTooltip content="Swaps light and dark areas — bright areas become dark and vice versa." />
          </label>

          <label htmlFor="quality-min-brightness" className="flex items-center text-sm">
            Min Brightness: {minBrightness.toFixed(2)}
            <InfoTooltip content="Pixels below this luminance threshold are treated as fully dark and not drawn." />
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

          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm">
              Particle seed
              <InfoTooltip content="Controls the scatter pattern during fade animations. Different seeds = different visual patterns. Null uses a classic deterministic pattern." />
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-zinc-400">
                {seed === null ? 'auto' : `#${seed.toString(16).padStart(8, '0')}`}
              </span>
              <button
                type="button"
                onClick={randomizeSeed}
                className="rounded bg-zinc-700 px-2 py-0.5 text-xs hover:bg-zinc-600"
                title="Generate new random seed"
              >
                ↻
              </button>
              {seed !== null && (
                <button
                  type="button"
                  onClick={() => setSeed(null)}
                  className="rounded bg-zinc-700 px-2 py-0.5 text-xs hover:bg-zinc-600"
                  title="Reset to auto (deterministic hash)"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <label className="block text-sm">
            <span className="flex items-center">
              Background
              <InfoTooltip content="Canvas background color. Choose Transparent for PNG/GIF exports with alpha." />
            </span>
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
