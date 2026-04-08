import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { shallow } from 'zustand/shallow'
import { SceneManager } from '../../../engine/SceneManager.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { selectEffectOptions, selectAnimationOptions, selectInputSource } from '../../store/selectors.js'
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
      animationDuration: useProjectStore.getState().animationDuration,
      seed: useProjectStore.getState().seed
    })
    sceneManagerRef.current = manager

    // Sync persisted state that isn't covered by the SceneManager constructor.
    // Subscriptions only fire on *changes*, so without this initial push the
    // engine would use its own defaults until the user moves a control.
    const s = useProjectStore.getState()
    manager.updateAnimationOptions(selectAnimationOptions(s))
    manager.setLightDirection(s.lightDirection.x, s.lightDirection.y, s.lightDirection.z)
    manager.setBaseRotation(s.baseRotation.x, s.baseRotation.y, s.baseRotation.z)
    manager.setModelScale(s.modelScale)
    manager.setRenderMode(s.renderMode)

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
    const unsubEffect = useProjectStore.subscribe(selectEffectOptions, (slice) => manager.updateEffectOptions(slice), {
      equalityFn: shallow
    })

    const unsubAnim = useProjectStore.subscribe(
      selectAnimationOptions,
      (slice) => manager.updateAnimationOptions(slice),
      { equalityFn: shallow }
    )

    const unsubLight = useProjectStore.subscribe(
      (state) => state.lightDirection,
      (ld) => manager.setLightDirection(ld.x, ld.y, ld.z),
      { equalityFn: shallow }
    )

    const unsubRotation = useProjectStore.subscribe(
      (state) => state.baseRotation,
      (br) => manager.setBaseRotation(br.x, br.y, br.z),
      { equalityFn: shallow }
    )

    const unsubModelScale = useProjectStore.subscribe(
      (state) => state.modelScale,
      (scale) => manager.setModelScale(scale)
    )

    const unsubRenderMode = useProjectStore.subscribe(
      (state) => state.renderMode,
      (mode) => manager.setRenderMode(mode)
    )

    return () => {
      unsubEffect()
      unsubAnim()
      unsubLight()
      unsubRotation()
      unsubModelScale()
      unsubRenderMode()
      resizeObserver.disconnect()
      manager.dispose()
      sceneManagerRef.current = null
    }
    // sceneManagerRef is a ref object — its identity is stable and intentionally
    // excluded from deps so the SceneManager is only created once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    model,
    inputType,
    shapeType,
    shapeParams,
    textContent,
    fontSize,
    extrudeDepth,
    bevelEnabled,
    fontFamily,
    imageSource
  } = useProjectStore(useShallow(selectInputSource))
  const isLoading = useProjectStore((state) => state.status.loading)
  const setModel = useProjectStore((state) => state.setModel)

  const handleLoadDemo = useCallback(async () => {
    const res = await fetch('/models/david_head.glb')
    const blob = await res.blob()
    const file = new File([blob], 'david_head.glb', { type: 'model/gltf-binary' })
    setModel(file)
  }, [setModel])

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (!manager) return
    let cancelled = false

    switch (inputType) {
      case 'model': {
        if (!model?.file) {
          manager.disposeModel()
          return
        }
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
      }
      case 'shape':
        manager.loadShape(shapeType, shapeParams)
        break
      case 'text': {
        useProjectStore.getState().setStatus({ loading: true, error: '' })
        manager
          .loadText(textContent, { fontFamily, fontSize, extrudeDepth, bevelEnabled })
          .then(() => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, message: '' })
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
      }
      case 'image': {
        if (!imageSource) {
          manager.disposeModel()
          return
        }
        useProjectStore.getState().setStatus({ loading: true, error: '' })
        manager
          .loadImage(imageSource)
          .then(() => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, message: 'Image loaded.' })
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputType,
    model,
    shapeType,
    shapeParams,
    textContent,
    fontFamily,
    fontSize,
    extrudeDepth,
    bevelEnabled,
    imageSource
  ])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
      <div ref={containerRef} className="h-full w-full" />
      {/* Finding 9: loading spinner overlay */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
        </div>
      )}
      {inputType === 'model' && !model && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="pointer-events-none flex flex-col items-center gap-2 text-zinc-600">
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
            <p className="text-sm">Upload a model to get started</p>
          </div>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Try demo model
          </button>
        </div>
      )}
    </div>
  )
}

export { PreviewCanvas }
