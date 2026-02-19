import { useEffect, useRef } from 'react'
import { SceneManager } from '../../../engine/SceneManager.js'
import { useProjectStore } from '../../store/useProjectStore.js'

function PreviewCanvas({ sceneManagerRef }) {
  const containerRef = useRef(null)
  const setStatus = useProjectStore((state) => state.setStatus)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const manager = new SceneManager(container, {
      pixelSize: useProjectStore.getState().pixelSize,
      ditherType: useProjectStore.getState().ditherType,
      colors: useProjectStore.getState().colors,
      backgroundColor: useProjectStore.getState().backgroundColor,
      invert: useProjectStore.getState().invert,
      minBrightness: useProjectStore.getState().minBrightness,
      animationDuration: useProjectStore.getState().animationDuration
    })
    sceneManagerRef.current = manager

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return
      const { width, height } = entries[0].contentRect
      manager.setSize(width, height)
    })
    resizeObserver.observe(container)

    const unsubscribe = useProjectStore.subscribe((state) => {
      manager.updateEffectOptions({
        pixelSize: state.pixelSize,
        ditherType: state.ditherType,
        colors: state.colors,
        invert: state.invert,
        minBrightness: state.minBrightness,
        backgroundColor: state.backgroundColor,
        animationDuration: state.animationDuration
      })
      manager.updateAnimationOptions({
        animationPreset: state.animationPreset,
        animationSpeed: state.animationSpeed,
        showPhaseDuration: state.showPhaseDuration,
        animationDuration: state.animationDuration,
        rotateOnShow: state.rotateOnShow,
        showPreset: state.showPreset
      })
      const ld = state.lightDirection
      manager.setLightDirection(ld.x, ld.y, ld.z)
    })

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
      manager.dispose()
      sceneManagerRef.current = null
    }
  }, [sceneManagerRef, setStatus])

  const model = useProjectStore((state) => state.model)

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (!manager || !model?.file) return
    useProjectStore.getState().setStatus({ loading: true, error: '' })
    manager.loadModel(model.file)
      .then(() => useProjectStore.getState().setStatus({ loading: false, message: 'Model loaded.' }))
      .catch((error) => useProjectStore.getState().setStatus({ loading: false, error: error.message }))
  }, [model, sceneManagerRef])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

export { PreviewCanvas }
