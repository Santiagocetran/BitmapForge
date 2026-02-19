import { useEffect, useRef } from 'react'
import { SceneManager } from '../../../engine/SceneManager.js'
import { useProjectStore } from '../../store/useProjectStore.js'

function PreviewCanvas({ sceneManagerRef }) {
  const containerRef = useRef(null)

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

    // Size the canvas immediately — ResizeObserver fires asynchronously so the
    // first few render frames would otherwise use the 1×1 default grid.
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      manager.setSize(container.clientWidth, container.clientHeight)
    }

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
        useFadeInOut: state.useFadeInOut,
        animationEffects: state.animationEffects,
        animationSpeed: state.animationSpeed,
        showPhaseDuration: state.showPhaseDuration,
        animationDuration: state.animationDuration,
        animationPreset: state.animationPreset,
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
  // sceneManagerRef is a ref object — its identity is stable and intentionally
  // excluded from deps so the SceneManager is only created once per mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const model = useProjectStore((state) => state.model)

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (!manager) return

    if (!model?.file) {
      manager.disposeModel()
      return
    }

    useProjectStore.getState().setStatus({ loading: true, error: '' })
    manager.loadModel(model.file)
      .then(() => useProjectStore.getState().setStatus({ loading: false, message: 'Model loaded.' }))
      .catch((error) => useProjectStore.getState().setStatus({ loading: false, error: error.message }))
  // sceneManagerRef is a stable ref — excluded intentionally.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
      <div ref={containerRef} className="h-full w-full" />
      {!model && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <p className="text-sm">Upload a model to preview it here</p>
        </div>
      )}
    </div>
  )
}

export { PreviewCanvas }
