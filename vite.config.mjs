import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
const envConfigs = {
  development: {
    port: 3000,
    apiUrl: 'http://localhost:3000'
  },
  staging: {
    port: 5000,
    apiUrl: 'http://0.0.0.0:5000'  // Changed back to HTTP since HTTPS isn't needed
  },
  production: {
    port: 3000,
    apiUrl: 'http://0.0.0.0:3000'
  }
};

export default defineConfig(({ mode }) => {
  const env = mode || 'development';
  const config = envConfigs[env];

  console.log(`Building for ${env} environment:`, {
    mode: env,
    port: config.port,
    apiUrl: config.apiUrl
  });

  return {
    root: __dirname,
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
      hmr: {
        clientPort: 443,
        host: '0.0.0.0'
      },
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
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: true,
      manifest: true,
      copyPublicDir: true,
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(config.apiUrl),
      'process.env.VITE_USER_NODE_ENV': JSON.stringify(env)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});