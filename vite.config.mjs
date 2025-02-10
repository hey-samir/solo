import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simplified environment configuration
const envConfigs = {
  development: {
    port: 3000,
    apiUrl: 'http://localhost:3000'
  },
  staging: {
    port: 5000,
    apiUrl: 'http://localhost:5000'
  },
  production: {
    port: 5000,
    apiUrl: 'http://localhost:5000'
  }
};

export default defineConfig(({ mode }) => {
  const env = mode || 'development';
  const config = envConfigs[env];

  console.log(`Building for ${env} environment:`, config);

  return {
    root: __dirname,
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace('%MODE%', env.charAt(0).toUpperCase() + env.slice(1));
        }
      }
    ],
    server: {
      port: config.port,
      host: '0.0.0.0',
      hmr: {
        clientPort: 443,
        host: '0.0.0.0'
      },
      cors: true,
      strictPort: true
    },
    build: {
      outDir: `dist/client/${env}`,
      sourcemap: true,
      emptyOutDir: true,
      copyPublicDir: true
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(config.apiUrl),
      'process.env.VITE_USER_NODE_ENV': JSON.stringify(env)
    }
  };
});