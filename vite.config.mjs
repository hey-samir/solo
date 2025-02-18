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
    apiUrl: 'http://localhost:5000'
  },
  production: {
    port: 3000,
    apiUrl: 'http://localhost:3000'
  }
};

export default defineConfig(({ mode }) => {
  const env = mode || 'development';
  const config = envConfigs[env];

  console.log(`Building for ${env} environment:`, config);

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: '@vitejs/plugin-react',
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      })
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
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: true,
      manifest: true,
      copyPublicDir: true,
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, env === 'staging' ? 'staging.html' : 'index.html')
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(env),
      'import.meta.env.MODE': JSON.stringify(env),
      'import.meta.env.VITE_API_URL': JSON.stringify(config.apiUrl),
      'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(env)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    esbuild: {
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    }
  };
});