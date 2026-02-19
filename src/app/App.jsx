import { useEffect } from 'react'
import { Layout } from './components/Layout/Layout.jsx'
import { useAutoSave } from './hooks/useAutoSave.js'

function App() {
  useAutoSave()

  useEffect(() => {
    document.title = 'BitmapForge'
  }, [])

  return <Layout />
}

export { App }
