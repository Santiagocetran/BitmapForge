import { useId } from 'react'
import { BTN } from '../../styles/buttonStyles.js'
import * as contracts from '../../utils/uiPropValidators.js'

const FORMAT_OPTIONS = [
  {
    value: 'apng',
    label: 'APNG',
    description: 'Animated PNG with full color and alpha transparency.'
  },
  {
    value: 'gif',
    label: 'GIF',
    description: 'Animated GIF with up to 256 colors and limited transparency; no partial alpha.'
  },
  {
    value: 'webm',
    label: 'Video',
    description: 'MP4 video with WebM fallback. The generated container depends on browser codec support.'
  },
  {
    value: 'spritesheet',
    label: 'Sprite Sheet',
    description: 'PNG grid of animation frames for game engines or custom playback code.'
  },
  {
    value: 'css',
    label: 'CSS Anim',
    description: 'Sprite sheet and CSS animation files for website integration.'
  },
  {
    value: 'react',
    label: 'React',
    description: 'Generated React component with the live animation engine and project settings.'
  },
  {
    value: 'webcomponent',
    label: 'Web Component',
    description: 'Generated <bitmap-animation> custom element with the live animation engine.'
  },
  {
    value: 'embed',
    label: 'Embed',
    description: 'Static site files with the live runtime for self-hosting; not a published URL.'
  },
  {
    value: 'zip',
    label: 'Code ZIP',
    description: 'Engine source archive for developers building a custom integration.'
  }
]

function ExportPanel({ selectedFormat, onSelectFormat, exportSelected, cancelExport, exporting, disabledReason }) {
  const descriptionId = useId()
  const selectedOption = FORMAT_OPTIONS.find((f) => f.value === selectedFormat)
  return (
    <section className="bf-control-group">
      <div role="group" aria-label="Export format" className="bf-control-group">
        {[
          { heading: 'Animation & assets', formats: FORMAT_OPTIONS.slice(0, 4) },
          { heading: 'Website integration', formats: FORMAT_OPTIONS.slice(4, 8) },
          { heading: 'Developer source', formats: FORMAT_OPTIONS.slice(8) }
        ].map(({ heading, formats }) => (
          <section key={heading}>
            <h3 className="bf-group-title">{heading}</h3>
            <div className="bf-choice-grid">
              {formats.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selectedFormat === value}
                  aria-describedby={selectedFormat === value ? descriptionId : undefined}
                  onClick={() => onSelectFormat(value)}
                  className="bf-choice"
                >
                  {selectedFormat === value && <span aria-hidden="true">✓ </span>}
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p id={descriptionId} className="bf-help">
        {selectedOption?.description}
      </p>
      {disabledReason && (
        <p id={`${descriptionId}-reason`} className="bf-help">
          {disabledReason}
        </p>
      )}
      <button
        type="button"
        disabled={exporting || Boolean(disabledReason)}
        aria-describedby={disabledReason ? `${descriptionId}-reason` : undefined}
        onClick={exportSelected}
        className={`w-full ${BTN.base} ${BTN.primary}`}
      >
        {exporting ? 'Exporting…' : `Export ${selectedOption?.label}`}
      </button>
      {exporting && (
        <button type="button" onClick={cancelExport} className={`${BTN.base} ${BTN.secondary}`}>
          Cancel export
        </button>
      )}
    </section>
  )
}
ExportPanel.propTypes = {
  selectedFormat: contracts.exportFormat,
  onSelectFormat: contracts.requiredFunction,
  exportSelected: contracts.requiredFunction,
  cancelExport: contracts.cancelExport,
  exporting: contracts.optionalBoolean,
  disabledReason: contracts.optionalString
}
export { ExportPanel }
