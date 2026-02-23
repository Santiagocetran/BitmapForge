import { createContext, useContext, useRef } from 'react'

const SceneManagerContext = createContext(null)

/**
 * Provides a shared ref for the SceneManager instance.
 *
 * The ref is populated by PreviewCanvas on mount and set to null on unmount.
 * Other components (e.g. ExportPanel) read it via useSceneManager().
 */
function SceneManagerProvider({ children }) {
  const sceneManagerRef = useRef(null)
  return <SceneManagerContext.Provider value={sceneManagerRef}>{children}</SceneManagerContext.Provider>
}

/**
 * Returns the shared SceneManager ref.
 *
 * The ref's .current may be null if PreviewCanvas hasn't mounted yet
 * or has been unmounted. Consumers should guard against null.
 *
 * @returns {import('react').MutableRefObject<import('../../engine/SceneManager.js').SceneManager | null>}
 */
function useSceneManager() {
  const ref = useContext(SceneManagerContext)
  if (!ref) {
    throw new Error('useSceneManager must be used within a SceneManagerProvider')
  }
  return ref
}

export { SceneManagerProvider, useSceneManager }
