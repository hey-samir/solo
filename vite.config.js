import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get the Replit domain from environment variables
const replitDomain = process.env.REPL_SLUG && process.env.REPL_OWNER
  ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : undefined

// Determine if we're in Replit's environment
const isReplit = process.env.REPL_SLUG && process.env.REPL_OWNER

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
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '1f44956e-bc47-48a8-a13e-c5f6222c2089-00-35jfb2x2btqr5.picard.replit.dev',
      '.repl.co',
      '.replit.dev'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    cssMinify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@popperjs/core', 'bootstrap', '@coreui/coreui'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['axios', '@tanstack/react-query']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'chart.js', '@tanstack/react-query']
  }
})