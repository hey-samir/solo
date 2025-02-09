import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Environment-specific configurations
const envConfigs = {
  development: {
    entry: path.resolve(__dirname, 'src/main.tsx'),
    server: {
      port: 3000,
      proxy: {
        '/api': 'http://localhost:3003'
      }
    },
    outDir: 'dist/client/development'
  },
  staging: {
    entry: path.resolve(__dirname, 'src/main.tsx'),
    server: {
      port: 5000,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        }
      },
      hmr: {
        clientPort: process.env.REPL_SLUG ? 443 : undefined,
        host: '0.0.0.0'
      }
    },
    outDir: 'dist/client/staging'
  }
};

export default defineConfig(({ mode }) => {
  const env = mode || 'development'
  const envConfig = envConfigs[env]

  console.log(`Starting Vite in ${env} mode with config:`, {
    entry: envConfig.entry,
    server: envConfig.server,
    outDir: envConfig.outDir
  })

  return {
    plugins: [react()],
    server: envConfig.server,
    build: {
      outDir: envConfig.outDir,
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        input: {
          main: envConfig.template || path.resolve(__dirname, 'index.html') // added fallback for template
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
            ui: [
              '@coreui/coreui',
              'bootstrap',
              '@popperjs/core'
            ]
          }
        }
      }
    },
    publicDir: path.resolve(__dirname, 'public'), //Added back publicDir
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@api': path.resolve(__dirname, './src/api')
      }
    }
  }
})