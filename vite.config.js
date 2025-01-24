import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get the Replit domain from environment variables
const replitDomain = process.env.REPL_SLUG && process.env.REPL_OWNER
  ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : undefined

// Determine if we're in Replit's environment
const isReplit = process.env.REPL_SLUG && process.env.REPL_OWNER

// Define production optimizations
const productionOptimizations = {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: process.env.NODE_ENV === 'production'
    }
  },
  cssMinify: true,
  cssCodeSplit: true,
  modulePreload: true,
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': [
          'react',
          'react-dom',
          'react-router-dom',
          '@tanstack/react-query'
        ],
        'chart': ['chart.js', 'react-chartjs-2'],
        'ui': ['@coreui/coreui', '@popperjs/core', 'bootstrap']
      },
      chunkFileNames: 'assets/[name].[hash].js',
      entryFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash][extname]'
    }
  }
}

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  base: '/',
  publicDir: 'public',
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: isReplit ? {
      clientPort: 443,
      protocol: 'wss',
      host: replitDomain
    } : true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  preview: {
    port: 5000,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'esnext',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    manifest: true,
    ...productionOptimizations
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@coreui/coreui']
  }
})