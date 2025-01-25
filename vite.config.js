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
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'index.html')
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-chart': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  server: {
    host: true,
    port: 5000,
    strictPort: true,
    cors: true,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    },
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.repl.co'
    ]
  },
  preview: {
    port: 5000,
    host: true,
    strictPort: true,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    },
    allowedHosts: [
      'localhost',
      '.replit.dev',
      '.repl.co'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  }
})