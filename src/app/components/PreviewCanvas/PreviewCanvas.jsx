import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { shallow } from 'zustand/shallow'
import { optionalFunction } from '../../utils/uiPropValidators.js'
import { SceneManager } from '../../../engine/SceneManager.js'
import { useProjectStore } from '../../store/useProjectStore.js'
import { selectEffectOptions, selectAnimationOptions, selectInputSource } from '../../store/selectors.js'
import { useSceneManager } from '../../context/SceneManagerContext.jsx'

function applyActiveScale(manager, { inputType, modelScale, imageScale }) {
  if (inputType === 'image') {
    manager.setImageScale(imageScale)
  } else {
    manager.setModelScale(modelScale)
  }
}

function PreviewCanvas({ onChooseSource }) {
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
    applyActiveScale(manager, s)
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

    const unsubScale = useProjectStore.subscribe(
      (state) => ({ inputType: state.inputType, modelScale: state.modelScale, imageScale: state.imageScale }),
      (s) => applyActiveScale(manager, s),
      { equalityFn: shallow }
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
      unsubScale()
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
    letterSpacing,
    imageSource
  } = useProjectStore(useShallow(selectInputSource))
  const isLoading = useProjectStore((state) => state.status.loading)
  const statusError = useProjectStore((state) => state.status.error)
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
    function cancelLoad() {
      cancelled = true
      // Shape/empty replacement may not start another asynchronous load.
      // Retire only this producer's busy flag, never the export flag/message.
      if (useProjectStore.getState().status.loading) useProjectStore.getState().setStatus({ loading: false })
    }

    applyActiveScale(manager, useProjectStore.getState())

    switch (inputType) {
      case 'model': {
        if (!model?.file) {
          manager.disposeModel()
          return
        }
        useProjectStore.getState().setStatus({ loading: true, error: '', message: '' })
        manager
          .loadModel(model.file)
          .then(() => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, error: '', message: 'Model loaded.' })
            }
          })
          .catch((error) => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, error: error.message, message: '' })
            }
          })
        return cancelLoad
      }
      case 'shape':
        manager.loadShape(shapeType, shapeParams)
        break
      case 'text': {
        useProjectStore.getState().setStatus({ loading: true, error: '', message: '' })
        manager
          .loadText(textContent, { fontFamily, fontSize, extrudeDepth, bevelEnabled, letterSpacing })
          .then(() => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, error: '', message: '' })
            }
          })
          .catch((error) => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, error: error.message, message: '' })
            }
          })
        return cancelLoad
      }
      case 'image': {
        if (!imageSource) {
          manager.disposeModel()
          return
        }
        useProjectStore.getState().setStatus({ loading: true, error: '', message: '' })
        manager
          .loadImage(imageSource)
          .then(() => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, error: '', message: 'Image loaded.' })
            }
          })
          .catch((error) => {
            if (!cancelled && sceneManagerRef.current === manager) {
              useProjectStore.getState().setStatus({ loading: false, error: error.message, message: '' })
            }
          })
        return cancelLoad
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
    letterSpacing,
    imageSource
  ])

  return (
    <div className="bf-canvas-surface">
      <div ref={containerRef} className="h-full w-full" />
      {/* Finding 9: loading spinner overlay */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-[var(--bf-accent)]" />
        </div>
      )}
      {((inputType === 'model' && !model) || (inputType === 'image' && !imageSource)) && !isLoading && !statusError && (
        <div className="bf-empty-scroll">
          <div className="bf-empty">
            <h1>{inputType === 'image' ? 'Choose an image' : 'Start with a source'}</h1>
            <p>Choose a source, tune its look, then export.</p>
            <div className="bf-source-routes">
              {[
                ['model', '3D model'],
                ['shape', 'Shapes'],
                ['text', 'Text'],
                ['image', 'Image']
              ].map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  className="bf-button bf-button--secondary"
                  onClick={(event) => onChooseSource?.(kind, event)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(event) => {
                // The image invitation also offers the existing model demo.
                // Use the same source bridge first; keep demo fetch/load intact.
                if (inputType === 'image') onChooseSource?.('model', event)
                handleLoadDemo()
              }}
              className="bf-button bf-button--ghost"
            >
              Try demo model
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
PreviewCanvas.propTypes = { onChooseSource: optionalFunction }
export { PreviewCanvas }
