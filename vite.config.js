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
      manualChunks: (id) => {
        if (id.includes('node_modules')) {
          if (id.includes('react')) return 'vendor-react'
          if (id.includes('chart.js')) return 'vendor-chart'
          if (id.includes('bootstrap') || id.includes('@popperjs') || id.includes('@coreui')) return 'vendor-ui'
          return 'vendor'
        }
      },
      chunkFileNames: 'assets/[name]-[hash].js',
      entryFileNames: 'assets/[name]-[hash].js',
      assetFileNames: (assetInfo) => {
        const extType = assetInfo.name.split('.').at(1)
        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
          return 'assets/images/[name]-[hash][extname]'
        }
        if (/css/i.test(extType)) {
          return 'assets/css/[name]-[hash][extname]'
        }
        return 'assets/[name]-[hash][extname]'
      }
    }
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: isReplit ? {
      clientPort: 443,
      protocol: 'wss',
      host: replitDomain,
      timeout: 120000
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
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
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