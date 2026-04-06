import { vi } from 'vitest'

// Minimal stubs for export builders — no Three.js mock needed here.

// APNG builder uses a Web Worker
vi.stubGlobal(
  'Worker',
  class {
    constructor() {
      this.terminate = vi.fn()
    }
  }
)

// URL stubs (used by various builders)
URL.createObjectURL = vi.fn(() => 'blob:mock')
URL.revokeObjectURL = vi.fn()

// Canvas stubs — export builders that use canvas get a functional jsdom canvas
// (getContext returns null in jsdom but builders that need real pixels go through
// Playwright instead)
HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () =>
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII='
)
