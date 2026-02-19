import { useEffect } from 'react'
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
  const setStatus = useProjectStore((state) => state.setStatus)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const settings = JSON.parse(raw)
      useProjectStore.setState((state) => ({ ...state, ...settings }))
      setStatus({
        message: 'Settings restored from previous session. Re-upload your model to continue.'
      })
    } catch {
      // ignore malformed saved data
    }
  }, [setStatus])

  useEffect(() => {
    const unsubscribe = useProjectStore.subscribe((state) => {
      const data = serializeState(state)
      window.clearTimeout(useAutoSave._timer)
      useAutoSave._timer = window.setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }, 500)
    })
    return () => {
      unsubscribe()
      window.clearTimeout(useAutoSave._timer)
    }
  }, [])
}

useAutoSave._timer = null

export { useAutoSave, STORAGE_KEY }
