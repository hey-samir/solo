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
        '/api': 'http://localhost:5000'
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
    template: path.resolve(__dirname, 'production.html'),
    assets: {
      // Copy logo to production assets
      'solo-clear.png': path.resolve(__dirname, 'attached_assets/solo-clear.png')
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = mode || 'development'
  const envConfig = envConfigs[env]

  // Copy production assets if in production mode
  if (env === 'production' && envConfig.assets) {
    Object.entries(envConfig.assets).forEach(([dest, src]) => {
      if (fs.existsSync(src)) {
        const destDir = path.join(envConfig.outDir, 'assets')
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        fs.copyFileSync(src, path.join(destDir, dest))
      }
    })
  }

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      ...envConfig.server,
      strictPort: true,
    },
    build: {
      outDir: envConfig.outDir,
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: env !== 'production',
      rollupOptions: {
        input: envConfig.template,
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
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
    }
  }
})