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
    staging: 5001,
    development: 3000
  }
};

// Environment configuration with standardized ports
const envConfigs = {
  development: {
    port: PORT_CONFIG.client.development,
    apiUrl: `http://localhost:${PORT_CONFIG.server.development}`,
    template: 'index.html'
  },
  staging: {
    port: PORT_CONFIG.client.staging,
    apiUrl: `http://0.0.0.0:${PORT_CONFIG.server.staging}`,
    hmrHost: '0.0.0.0',
    template: 'index.html'
  },
  production: {
    port: PORT_CONFIG.client.production,
    apiUrl: `http://0.0.0.0:${PORT_CONFIG.server.production}`,
    template: 'index.html'
  }
};

// Read version from version.json
function getVersion() {
  const versionPath = path.resolve(PROJECT_ROOT, 'src/config/version.json');
  try {
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    return versionData.version;
  } catch (error) {
    console.error('Error reading version.json:', error);
    return 'unknown';
  }
}

export default defineConfig(({ mode }) => {
  const env = mode || 'development';
  const config = envConfigs[env];
  const version = getVersion();

  console.log(`[Vite Config] Building for ${env} environment:`, {
    mode: env,
    port: config.port,
    apiUrl: config.apiUrl,
    version
  });

  return {
    root: PROJECT_ROOT,
    base: '/',
    plugins: [
      react(),
      {
        name: 'generate-manifest',
        generateBundle(options, bundle) {
          const manifest = {
            timestamp: new Date().toISOString(),
            files: Object.keys(bundle),
            mode: env,
            port: config.port,
            version
          };

          this.emitFile({
            type: 'asset',
            fileName: 'manifest.json',
            source: JSON.stringify(manifest, null, 2)
          });
        }
      }
    ],
    server: {
      port: config.port,
      host: '0.0.0.0',
      hmr: env === 'staging' ? {
        clientPort: 443,
        host: '0.0.0.0'
      } : true,
      proxy: {
        '/api': {
          target: config.apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: path.resolve(PROJECT_ROOT, `dist/${env}`),
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(PROJECT_ROOT, config.template)
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
            ui: ['@clerk/clerk-react']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(PROJECT_ROOT, 'src'),
        '@assets': path.resolve(PROJECT_ROOT, 'src/assets'),
        '@images': path.resolve(PROJECT_ROOT, 'src/assets/images'),
        '@components': path.resolve(PROJECT_ROOT, 'src/components'),
        '@pages': path.resolve(PROJECT_ROOT, 'src/pages'),
        '@api': path.resolve(PROJECT_ROOT, 'src/api'),
        '~': path.resolve(PROJECT_ROOT)
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(version)
    }
  };
});