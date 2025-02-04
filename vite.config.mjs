import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Environment-specific configurations
const envConfigs = {
  development: {
    server: {
      port: 3000,
      proxy: {
        '/api': 'http://localhost:3003'
      }
    }
  },
  staging: {
    server: {
      port: 5000,
      proxy: {
        '/api': 'http://localhost:5001'
      }
    }
  },
  production: {
    server: {
      port: 80,
      proxy: {
        '/api': 'http://localhost:3003'
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = mode || 'development'
  const envConfig = envConfigs[env]

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      ...envConfig.server,
      strictPort: true,
    },
    build: {
      outDir: 'dist/client',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: env !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
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