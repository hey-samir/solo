import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false, // Allow fallback ports
    hmr: {
      clientPort: process.env.REPL_SLUG ? 443 : 3000,
      protocol: process.env.REPL_SLUG ? 'wss' : 'ws',
      host: process.env.REPL_SLUG ? 
        `${process.env.REPL_ID}.${process.env.REPL_OWNER}.repl.co` : 
        'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // IMPORTANT: This allowedHosts configuration is required for Replit environment
    // DO NOT REMOVE OR MODIFY - It ensures proper host access in Replit's infrastructure
    allowedHosts: [
      'localhost',
      '0.0.0.0',
      '.repl.co',
      '.replit.dev',
      '.repl.dev',
      '.picard.replit.dev',
      process.env.REPL_SLUG ? `${process.env.REPL_ID}.${process.env.REPL_OWNER}.repl.co` : undefined,
      process.env.REPL_SLUG ? `${process.env.REPL_ID}-00-*.picard.replit.dev` : undefined
    ].filter(Boolean)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api')
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.REPL_SLUG ? '/api' : 'http://localhost:5000/api'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
})