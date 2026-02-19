import React, { useEffect, useRef } from 'react'
import { startModelAnimation } from '../animations/modelAnimation.js'

function AsciiAnimation({ modelUrl, effectOptions, className, style }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const controller = startModelAnimation({
      container,
      modelUrl,
      effectOptions
    })

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return
      const { width, height } = entries[0].contentRect
      controller.resize(width, height)
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      controller.dispose()
    }
  }, [modelUrl, effectOptions])

  return <div ref={containerRef} className={className} style={style} />
}

export { AsciiAnimation }
