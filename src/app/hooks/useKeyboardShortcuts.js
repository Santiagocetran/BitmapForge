import { useEffect, useCallback } from 'react'
import { useProjectStore } from '../store/useProjectStore.js'

function isTyping(e) {
  const tag = e.target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable
}

function useKeyboardShortcuts({ onShowHelp, onSaveProject } = {}) {
  const resetBaseRotation = useProjectStore((s) => s.resetBaseRotation)

  const handleKeyDown = useCallback(
    (e) => {
      if (e.defaultPrevented) return
      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+Z → undo
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        const { undo, pastStates } = useProjectStore.temporal.getState()
        if (pastStates.length > 0) undo()
        return
      }

      // Ctrl+Shift+Z → redo
      if (ctrl && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        const { redo, futureStates } = useProjectStore.temporal.getState()
        if (futureStates.length > 0) redo()
        return
      }

      // Ctrl+S → save project (intercept before browser save dialog)
      if (ctrl && !e.shiftKey && e.key === 's') {
        e.preventDefault()
        onSaveProject?.()
        return
      }

      // Don't intercept other keys while typing in inputs
      if (isTyping(e)) return

      if (e.key === 'r' || e.key === 'R') {
        resetBaseRotation()
        return
      }

      if (e.key === '?') {
        onShowHelp?.()
      }
    },
    [resetBaseRotation, onShowHelp, onSaveProject]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export { useKeyboardShortcuts }
