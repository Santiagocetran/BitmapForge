import { useEffect } from 'react'
import { Layout } from './components/Layout/Layout.jsx'
import { useAutoSave } from './hooks/useAutoSave.js'
import { SceneManagerProvider } from './context/SceneManagerContext.jsx'

function App() {
  useAutoSave()

  useEffect(() => {
    document.title = 'BitmapForge'
  }, [])

  return (
    <SceneManagerProvider>
      <Layout />
    </SceneManagerProvider>
  )
}

export { App }
