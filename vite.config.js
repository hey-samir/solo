import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html')
      }
    }
  },
  server: {
    host: true,
    port: 5000,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost'
    }
  },
  preview: {
    port: 5000,
    host: true,
    strictPort: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    },
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.repl.co'
    ]
  }
})