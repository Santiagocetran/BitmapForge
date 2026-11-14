import { useRef, useEffect } from 'react'
import * as contracts from '../../utils/uiPropValidators.js'

function ProjectActions({ saveProject, loadProject }) {
  const inputRef = useRef(null)
  useEffect(() => {
    const input = inputRef.current
    const reset = () => {
      input.value = ''
    }
    input.addEventListener('cancel', reset)
    return () => input.removeEventListener('cancel', reset)
  }, [])
  return (
    <div className="bf-project-actions">
      <button type="button" className="bf-button bf-button--secondary" onClick={saveProject}>
        Save .bitmapforge
      </button>
      <button type="button" className="bf-button bf-button--secondary" onClick={() => inputRef.current?.click()}>
        Load .bitmapforge
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".bitmapforge"
        hidden
        aria-label="Load BitmapForge project file"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          event.currentTarget.value = ''
          if (file) loadProject(file)
        }}
      />
    </div>
  )
}
ProjectActions.propTypes = { saveProject: contracts.requiredFunction, loadProject: contracts.requiredFunction }
export { ProjectActions }
