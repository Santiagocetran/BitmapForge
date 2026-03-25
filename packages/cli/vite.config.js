import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/headless-entry.js'),
      formats: ['es'],
      fileName: () => 'headless.js'
    },
    rollupOptions: {
      external: ['three']
    }
  },
  resolve: {
    alias: {
      '@engine': resolve(__dirname, '../../src/engine')
    }
  }
})
