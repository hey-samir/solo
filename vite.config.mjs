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
    apiUrl: 'http://localhost:5001',
    template: 'staging.html',
    outDir: 'dist/client/staging'
  },
  production: {
    port: 3000,
    apiUrl: 'http://localhost:3000',
    template: 'production.html',
    outDir: 'dist/client/production'
  }
}

export default defineConfig(({ mode }) => {
  const env = mode || 'development'
  const config = envConfigs[env]

  console.log(`Building for ${env} environment:`, config)

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
      },
      cors: true,
      strictPort: true,
      allowedHosts: [
        'localhost',
        '0.0.0.0',
        '.replit.dev',
        '.repl.co',
        '*.picard.replit.dev',
        '*.replit.dev'
      ]
    },
    build: {
      outDir: config.outDir,
      sourcemap: true,
      emptyOutDir: true,
      copyPublicDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, config.template || 'index.html')
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
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