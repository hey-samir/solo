import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Standardized port configuration
const PORT_CONFIG = {
  client: {
    production: 3000,
    staging: 5000,
    development: 3000
  },
  server: {
    production: 3000,
    staging: 5000,
    development: 3000
  }
};

// Environment configuration with standardized ports
const envConfigs = {
  development: {
    port: PORT_CONFIG.client.development,
    apiUrl: `http://localhost:${PORT_CONFIG.server.development}`,
    template: 'src/templates/index.html'
  },
  staging: {
    port: PORT_CONFIG.client.staging,
    apiUrl: `http://0.0.0.0:${PORT_CONFIG.server.staging}`,
    hmrHost: '0.0.0.0',
    template: 'src/templates/staging.html',
    outputHtml: 'index.html' // Specify output HTML name
  },
  production: {
    port: PORT_CONFIG.client.production,
    apiUrl: `http://0.0.0.0:${PORT_CONFIG.server.production}`,
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
    template: config.template,
    outputHtml: config.outputHtml
  });

  return {
    root: PROJECT_ROOT,
    base: '/',
    plugins: [
      react(),
      {
        name: 'generate-manifest',
        generateBundle(options, bundle) {
          // Always generate manifest for both staging and production
          const manifest = {
            timestamp: new Date().toISOString(),
            files: Object.keys(bundle),
            mode: env,
            port: config.port,
            version: JSON.parse(fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/config/version.json'), 'utf-8')).version
          };
          this.emitFile({
            type: 'asset',
            fileName: 'manifest.json',
            source: JSON.stringify(manifest, null, 2)
          });

          // Copy HTML template for staging
          if (env === 'staging') {
            const templateContent = fs.readFileSync(path.resolve(PROJECT_ROOT, config.template), 'utf-8');
            this.emitFile({
              type: 'asset',
              fileName: config.outputHtml || 'index.html',
              source: templateContent
            });
          }
        }
      }
    ],
    server: {
      port: config.port,
      host: '0.0.0.0',
      hmr: env === 'staging' ? {
        clientPort: 443,
        host: config.hmrHost
      } : true
    },
    build: {
      outDir: path.resolve(PROJECT_ROOT, `dist/${env}`),
      emptyOutDir: true,
      sourcemap: true,
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
        'assets': path.resolve(PROJECT_ROOT, 'src/assets'),
        '~': path.resolve(PROJECT_ROOT)
      }
    },
    publicDir: path.resolve(PROJECT_ROOT, 'public'),
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    }
  };
});