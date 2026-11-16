import { useLayoutEffect, useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore.js'
import { isExportProgressMessage } from '../../hooks/useExport.js'
import { optionalBoolean } from '../../utils/uiPropValidators.js'

export function StatusNotice({ suspended = false }) {
  const [display, setDisplay] = useState(null)
  useLayoutEffect(() => {
    if (suspended) return
    let active = true
    let queued = false
    // One cancellable delivery per turn, including initial attachment/resume.
    // Read at delivery, not notification: hidden/intermediate history is omitted.
    const schedule = () => {
      if (queued) return
      queued = true
      queueMicrotask(() => {
        queued = false
        if (!active) return
        const status = useProjectStore.getState().status
        const next = {
          error: status.error,
          message: status.exporting
            ? !status.loading && isExportProgressMessage(status.message)
              ? status.message
              : 'Exporting…'
            : status.loading
              ? 'Loading model…'
              : status.message
        }
        setDisplay((previous) => {
          // Also guard deferred React processing after a newer suspension commit.
          if (!active) return previous
          return previous?.error === next.error && previous?.message === next.message ? previous : next
        })
      })
    }
    const unsubscribe = useProjectStore.subscribe((state) => state.status, schedule)
    schedule()
    return () => {
      active = false
      unsubscribe()
    }
  }, [suspended])
  const dismiss = () => useProjectStore.getState().setStatus({ error: '', message: '' })
  return (
    <div className="bf-notice" hidden={suspended} inert={suspended}>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={display?.message && !display.error ? 'bf-notice-message' : ''}
      >
        {!display?.error && display?.message}
      </div>
      {display?.error && (
        <div role="alert" className="bf-notice-error">
          <span>{display.error}</span>
          <button type="button" className="bf-button bf-button--ghost" aria-label="Dismiss error" onClick={dismiss}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
StatusNotice.propTypes = { suspended: optionalBoolean }
