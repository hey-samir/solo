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
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui': ['@popperjs/core', 'bootstrap', '@coreui/coreui'],
        'chart': ['chart.js', 'react-chartjs-2'],
        'utils': ['axios', '@tanstack/react-query']
      },
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: (assetInfo) => {
        const extType = assetInfo.name.split('.').at(1)
        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
          return 'assets/images/[name]-[hash][extname]'
        }
        if (/css/i.test(extType)) {
          return 'assets/css/[name]-[hash][extname]'
        }
        if (/woff2?|ttf|eot|otf/i.test(extType)) {
          return 'assets/fonts/[name]-[hash][extname]'
        }
        return 'assets/other/[name]-[hash][extname]'
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
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.repl.co',
      '.replit.dev',
      '.repl.dev',
      '1f44956e-bc47-48a8-a13e-c5f6222c2089-00-35jfb2x2btqr5.picard.replit.dev'
    ]
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