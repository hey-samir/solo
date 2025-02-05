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
    template: path.resolve(__dirname, 'index.html')
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
      outDir: envConfig.outDir,
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: env !== 'production',
      rollupOptions: {
        input: {
          main: envConfig.entry,
        },
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