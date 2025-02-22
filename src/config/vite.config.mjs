import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Standardized port configuration
const PORT_CONFIG = {
  client: 3000,
  server: 5000
};

// Environment configuration with standardized ports
const envConfigs = {
  development: {
    port: PORT_CONFIG.client,
    apiUrl: `http://localhost:${PORT_CONFIG.server}`,
    template: 'src/templates/index.html'
  },
  staging: {
    port: PORT_CONFIG.server,
    apiUrl: `http://0.0.0.0:${PORT_CONFIG.server}`,
    hmrHost: '0.0.0.0',
    template: 'src/templates/staging.html'
  },
  production: {
    port: PORT_CONFIG.client,
    apiUrl: `http://0.0.0.0:${PORT_CONFIG.server}`,
    template: 'src/templates/production.html'
  }
};

export default defineConfig(({ mode }) => {
  const env = mode || 'development';
  const config = envConfigs[env];

  console.log(`[Vite Config] Building for ${env} environment:`, {
    mode: env,
    port: config.port,
    apiUrl: config.apiUrl,
    template: config.template
  });

  return {
    root: PROJECT_ROOT,
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            '%MODE%', 
            env.charAt(0).toUpperCase() + env.slice(1)
          );
        }
      }
    ],
    server: {
      port: config.port,
      host: '0.0.0.0',
      hmr: env === 'staging' ? {
        clientPort: 443,
        host: config.hmrHost
      } : true,
      cors: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: config.apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    preview: {
      port: config.port,
      host: '0.0.0.0'
    },
    build: {
      outDir: path.resolve(PROJECT_ROOT, `dist/client/${env}`),
      emptyOutDir: true,
      sourcemap: true,
      manifest: true,
      copyPublicDir: true,
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: path.resolve(PROJECT_ROOT, config.template)
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@clerk/clerk-react', '@tanstack/react-query']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(PROJECT_ROOT, 'src'),
        'assets': path.resolve(PROJECT_ROOT, 'src/assets')
      }
    },
    publicDir: path.resolve(PROJECT_ROOT, 'public'),
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.gif']
  };
});