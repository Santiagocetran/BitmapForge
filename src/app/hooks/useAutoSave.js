import { useEffect, useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore.js'

const STORAGE_KEY = 'bitmapforge:project-settings:v1'

function serializeState(state) {
  return {
    colors: state.colors,
    pixelSize: state.pixelSize,
    ditherType: state.ditherType,
    invert: state.invert,
    minBrightness: state.minBrightness,
    backgroundColor: state.backgroundColor,
    animationPreset: state.animationPreset,
    animationSpeed: state.animationSpeed,
    showPhaseDuration: state.showPhaseDuration,
    animationDuration: state.animationDuration,
    rotateOnShow: state.rotateOnShow,
    showPreset: state.showPreset,
    lightDirection: state.lightDirection
  }
}

function useAutoSave() {
  const timerRef = useRef(null) // Finding 18: useRef instead of module-level _timer

  // Finding 17: use getState() directly — no setStatus in dep array
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const settings = JSON.parse(raw)
      useProjectStore.setState((state) => ({ ...state, ...settings }))
      useProjectStore.getState().setStatus({
        message: 'Settings restored from previous session. Re-upload your model to continue.'
      })
    } catch {
      // ignore malformed saved data
    }
  }, [])

  useEffect(() => {
    const unsubscribe = useProjectStore.subscribe((state) => {
      const data = serializeState(state)
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }, 500)
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timerRef.current)
    }
  }, [])
}

export { useAutoSave, STORAGE_KEY }
