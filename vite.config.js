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
      },
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
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
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@api': path.resolve(__dirname, 'src/api')
    }
  }
})