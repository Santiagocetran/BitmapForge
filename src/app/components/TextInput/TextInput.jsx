import { headingRef } from '../../utils/uiPropValidators.js'
import { BTN } from '../../styles/buttonStyles.js'
import { useProjectStore } from '../../store/useProjectStore.js'

function TextInput({ textareaRef } = {}) {
  const textContent = useProjectStore((state) => state.textContent)
  const fontSize = useProjectStore((state) => state.fontSize)
  const extrudeDepth = useProjectStore((state) => state.extrudeDepth)
  const bevelEnabled = useProjectStore((state) => state.bevelEnabled)
  const fontFamily = useProjectStore((state) => state.fontFamily)
  const letterSpacing = useProjectStore((state) => state.letterSpacing)
  const setTextContent = useProjectStore((state) => state.setTextContent)
  const setFontSize = useProjectStore((state) => state.setFontSize)
  const setExtrudeDepth = useProjectStore((state) => state.setExtrudeDepth)
  const setBevelEnabled = useProjectStore((state) => state.setBevelEnabled)
  const setFontFamily = useProjectStore((state) => state.setFontFamily)
  const setLetterSpacing = useProjectStore((state) => state.setLetterSpacing)
  const resetTextConfig = useProjectStore((state) => state.resetTextConfig)

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="source-text" className="bf-label">
          Text
        </label>
        <textarea
          ref={textareaRef}
          id="source-text"
          aria-describedby="source-text-help"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="BitmapForge"
          rows={3}
          maxLength={200}
          className="bf-textarea resize-none"
        />
        <p id="source-text-help" className="bf-help">
          Up to 200 characters.
        </p>
      </div>

      <div>
        <label htmlFor="source-font" className="bf-label">
          Font
        </label>
        <select
          id="source-font"
          className="bf-select"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          <option value="helvetiker">Helvetiker</option>
          <option value="helvetikerBold">Helvetiker Bold</option>
          <option value="gentilisRegular">Gentilis</option>
          <option value="gentilisBold">Gentilis Bold</option>
          <option value="optimer">Optimer</option>
          <option value="optimerBold">Optimer Bold</option>
          <option value="droidMono">Droid Mono</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between gap-2">
          <label htmlFor="source-font-size" className="bf-label">
            Font Size
          </label>
          <span className="bf-value">{fontSize.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="2"
          step="0.1"
          id="source-font-size"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="bf-range"
        />
      </div>

      <div>
        <div className="flex justify-between gap-2">
          <label htmlFor="source-letter-spacing" className="bf-label">
            Letter Spacing
          </label>
          <span className="bf-value">{letterSpacing.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="-0.2"
          max="1"
          step="0.05"
          id="source-letter-spacing"
          value={letterSpacing}
          onChange={(e) => setLetterSpacing(Number(e.target.value))}
          className="bf-range"
        />
      </div>

      <div>
        <div className="flex justify-between gap-2">
          <label htmlFor="source-extrude-depth" className="bf-label">
            Extrude Depth
          </label>
          <span className="bf-value">{extrudeDepth.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          id="source-extrude-depth"
          value={extrudeDepth}
          onChange={(e) => setExtrudeDepth(Number(e.target.value))}
          className="bf-range"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="bf-check-row">
          <input type="checkbox" checked={bevelEnabled} onChange={(e) => setBevelEnabled(e.target.checked)} />
          Bevel
        </label>
        <button type="button" onClick={resetTextConfig} className={`${BTN.base} ${BTN.ghost}`}>
          Reset defaults
        </button>
      </div>
    </div>
  )
}

TextInput.propTypes = { textareaRef: headingRef }

export { TextInput }
