import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Environment-specific configurations
const envConfigs = {
  development: {
    port: 3000,
    apiUrl: 'http://localhost:3003'
  },
  staging: {
    port: 5000,
    apiUrl: 'http://localhost:5001'
  },
  production: {
    port: 3000,
    apiUrl: 'http://localhost:3000'
  }
}

export default defineConfig(({ mode }) => {
  const env = mode || 'development'
  const config = envConfigs[env]

  return {
    root: __dirname,
    plugins: [react()],
    server: {
      port: config.port,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: config.apiUrl,
          changeOrigin: true,
          secure: false
        }
      },
      hmr: {
        clientPort: 443,
        host: '0.0.0.0'
      }
    },
    build: {
      outDir: `dist/client/${env}`,
      sourcemap: true,
      emptyOutDir: true,
      copyPublicDir: true,
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: '[name].[hash].[ext]',
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              '@tanstack/react-query',
              '@react-oauth/google'
            ],
            ui: ['@coreui/coreui', 'bootstrap', '@popperjs/core']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@api': path.resolve(__dirname, './src/api')
      }
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(config.apiUrl),
      'process.env.VITE_USER_NODE_ENV': JSON.stringify(env)
    }
  }
})