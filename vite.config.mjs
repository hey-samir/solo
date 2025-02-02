import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3003,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})