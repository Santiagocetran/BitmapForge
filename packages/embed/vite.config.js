import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'BitmapForge',
      formats: ['es', 'iife'],
      fileName: (fmt) => `bitmap-forge.${fmt}.js`
    },
    rollupOptions: {
      external: ['three'],
      output: { globals: { three: 'THREE' } }
    }
  },
  resolve: {
    alias: {
      // Build-time only — must not leak into dist
      '@engine': resolve(__dirname, '../../src/engine')
    }
  }
})
