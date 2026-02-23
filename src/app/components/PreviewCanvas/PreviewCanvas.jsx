import { useEffect, useRef } from 'react'
import { shallow } from 'zustand/shallow'
import { SceneManager } from '../../../engine/SceneManager.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { useSceneManager } from '../../context/SceneManagerContext.jsx'

function PreviewCanvas() {
  const sceneManagerRef = useSceneManager()
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

    // Finding 4: targeted subscriptions to avoid unnecessary updates
    const unsubEffect = useProjectStore.subscribe(
      (state) => ({
        pixelSize: state.pixelSize,
        ditherType: state.ditherType,
        colors: state.colors,
        invert: state.invert,
        minBrightness: state.minBrightness,
        backgroundColor: state.backgroundColor,
        animationDuration: state.animationDuration
      }),
      (slice) => manager.updateEffectOptions(slice),
      { equalityFn: shallow }
    )

    const unsubAnim = useProjectStore.subscribe(
      (state) => ({
        useFadeInOut: state.useFadeInOut,
        animationEffects: state.animationEffects,
        animationSpeed: state.animationSpeed,
        showPhaseDuration: state.showPhaseDuration,
        animationDuration: state.animationDuration,
        animationPreset: state.animationPreset,
        rotateOnShow: state.rotateOnShow,
        showPreset: state.showPreset
      }),
      (slice) => manager.updateAnimationOptions(slice),
      { equalityFn: shallow }
    )

    const unsubLight = useProjectStore.subscribe(
      (state) => state.lightDirection,
      (ld) => manager.setLightDirection(ld.x, ld.y, ld.z),
      { equalityFn: shallow }
    )

    return () => {
      unsubEffect()
      unsubAnim()
      unsubLight()
      resizeObserver.disconnect()
      manager.dispose()
      sceneManagerRef.current = null
    }
    // sceneManagerRef is a ref object — its identity is stable and intentionally
    // excluded from deps so the SceneManager is only created once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const model = useProjectStore((state) => state.model)
  const isLoading = useProjectStore((state) => state.status.loading) // Finding 9

  // Findings 1+2: cancelled flag + sceneManagerRef guard to prevent stale updates
  useEffect(() => {
    const manager = sceneManagerRef.current
    if (!manager) return

    if (!model?.file) {
      manager.disposeModel()
      return
    }

    let cancelled = false
    useProjectStore.getState().setStatus({ loading: true, error: '' })
    manager
      .loadModel(model.file)
      .then(() => {
        if (!cancelled && sceneManagerRef.current === manager) {
          useProjectStore.getState().setStatus({ loading: false, message: 'Model loaded.' })
        }
      })
      .catch((error) => {
        if (!cancelled && sceneManagerRef.current === manager) {
          useProjectStore.getState().setStatus({ loading: false, error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
    // sceneManagerRef is a stable ref — excluded intentionally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
      <div ref={containerRef} className="h-full w-full" />
      {/* Finding 9: loading spinner overlay */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
        </div>
      )}
      {!model && !isLoading && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
          <p className="text-sm">Upload a model to preview it here</p>
        </div>
      )}
    </div>
  )
}

export { PreviewCanvas }
