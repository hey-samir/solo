import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

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
    outDir: 'dist/client/development',
    template: path.resolve(__dirname, 'index.html')
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
        clientPort: 443,
        host: '0.0.0.0'
      }
    },
    outDir: 'dist/client/staging',
    template: path.resolve(__dirname, 'index.html')
  },
  production: {
    entry: path.resolve(__dirname, 'src/production.tsx'),
    server: {
      port: 3000,
      proxy: {
        '/api': 'http://localhost:3000'
      }
    },
    outDir: 'dist/client/production',
    template: path.resolve(__dirname, 'production.html')
  }
}

export default defineConfig(({ mode }) => {
  const env = mode || 'development'
  const envConfig = envConfigs[env]

  console.log(`Starting Vite in ${env} mode with config:`, envConfig)

  // Ensure public directory exists
  const publicDir = path.resolve(__dirname, 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Copy logo to public directory if it doesn't exist
  const logoSrc = path.resolve(__dirname, 'attached_assets/solo-clear.png')
  const logoDest = path.resolve(publicDir, 'images/solo-clear.png')
  if (fs.existsSync(logoSrc) && !fs.existsSync(logoDest)) {
    fs.mkdirSync(path.dirname(logoDest), { recursive: true })
    fs.copyFileSync(logoSrc, logoDest)
  }

  // For production, ensure the HTML file is in the correct location
  if (env === 'production') {
    const productionOutDir = path.resolve(__dirname, envConfig.outDir)
    if (!fs.existsSync(productionOutDir)) {
      fs.mkdirSync(productionOutDir, { recursive: true })
    }

    const productionHtmlSrc = path.resolve(__dirname, 'src/production.html')
    if (fs.existsSync(productionHtmlSrc)) {
      fs.copyFileSync(
        productionHtmlSrc,
        path.resolve(productionOutDir, 'production.html')
      )
      fs.copyFileSync(
        productionHtmlSrc,
        path.resolve(__dirname, 'production.html')
      )
    }
  }

  return {
    plugins: [react()],
    server: envConfig.server,
    build: {
      outDir: envConfig.outDir,
      emptyOutDir: true,
      sourcemap: env !== 'production',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        input: {
          main: envConfig.template
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
    publicDir,
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