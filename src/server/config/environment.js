const path = require('path');

// Port configuration
const PORT_CONFIG = {
  production: 3000,
  staging: [5000, 5001, 5002],  // Added fallback ports for staging
  development: 3000
};

// Environment-specific configurations
const ENV_CONFIG = {
  production: {
    port: PORT_CONFIG.production,
    clientDir: path.resolve(process.cwd(), 'dist/production'),
    templateName: 'index.html',
    logLevel: 'info',
    corsOrigins: ['.replit.dev', '0.0.0.0']
  },
  staging: {
    ports: PORT_CONFIG.staging,
    clientDir: path.resolve(process.cwd(), 'dist/staging'),
    templateName: 'staging.html',
    logLevel: 'debug',
    corsOrigins: ['.replit.dev', '0.0.0.0']
  },
  development: {
    port: PORT_CONFIG.development,
    clientDir: path.resolve(process.cwd(), 'dist/development'),
    templateName: 'index.html',
    logLevel: 'debug',
    corsOrigins: ['localhost', '0.0.0.0']
  }
};

// Environment validation with enhanced logging
function validateEnvironment(env) {
  console.log(`[Environment] Validating environment: ${env}`);

  if (!ENV_CONFIG[env]) {
    throw new Error(`Invalid environment: ${env}`);
  }

  const config = ENV_CONFIG[env];
  const clientDir = path.resolve(process.cwd(), config.clientDir);

  console.log('[Environment] Configuration:', {
    environment: env,
    ports: env === 'staging' ? config.ports : config.port,
    clientDir,
    templateName: config.templateName,
    logLevel: config.logLevel,
    cwd: process.cwd(),
    dirname: __dirname
  });

  if (!require('fs').existsSync(clientDir)) {
    console.warn(`[Environment] Warning: Client directory not found: ${clientDir}`);
    const distDir = path.resolve(process.cwd(), 'dist');
    if (require('fs').existsSync(distDir)) {
      console.warn('[Environment] Available directories in dist:', require('fs').readdirSync(distDir));
    } else {
      console.warn('[Environment] dist directory does not exist');
    }
  }

  return config;
}

// Get environment configuration with port selection for staging
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  const config = validateEnvironment(env);

  // For staging, try to find an available port
  if (env === 'staging') {
    config.port = config.ports[0]; // Default to first port, deploy.js will try others if needed
  }

  return config;
}

module.exports = {
  getConfig,
  validateEnvironment,
  PORT_CONFIG,
  ENV_CONFIG
};