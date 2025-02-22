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
    template: 'src/templates/staging.html'
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

  // Resolve template path relative to project root
  const templatePath = path.resolve(PROJECT_ROOT, config.template);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  console.log(`[Vite Config] Building for ${env} environment:`, {
    mode: env,
    port: config.port,
    apiUrl: config.apiUrl,
    template: templatePath
  });

  return {
    root: PROJECT_ROOT,
    base: '/',
    plugins: [react()],
    server: {
      port: config.port,
      host: '0.0.0.0',
      hmr: env === 'staging' ? {
        clientPort: 443,
        host: config.hmrHost
      } : true
    },
    build: {
      outDir: path.resolve(PROJECT_ROOT, 'dist', env),
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: templatePath,
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
    }
  };
});
