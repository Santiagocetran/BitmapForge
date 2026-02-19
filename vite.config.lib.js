import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'lib',
    copyPublicDir: false,
    lib: {
      entry: {
        'ascii-3d-animation': resolve(__dirname, 'src/index.js'),
        react: resolve(__dirname, 'src/react/index.js')
      },
      formats: ['es']
    },
    rollupOptions: {
      // Externalize peer dependencies and three/addons imports.
      external: [/^three/, /^react/, /^react-dom/]
    }
  }
})
