const path = require('path');
const fs = require('fs');

// Required environment variables by environment
const REQUIRED_ENV_VARS = {
  production: [
    'NODE_ENV',
    'DATABASE_URL',
    'CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'SESSION_SECRET'
  ],
  staging: [
    'NODE_ENV',
    'DATABASE_URL',
    'CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'SESSION_SECRET'
  ],
  development: [
    'NODE_ENV',
    'DATABASE_URL'
  ]
};

// Port configuration
const PORT_CONFIG = {
  production: process.env.PORT || 3000,
  staging: 5000, // Staging must always use port 5000
  development: process.env.PORT || 3000
};

// Environment-specific configurations
const ENV_CONFIG = {
  production: {
    port: PORT_CONFIG.production,
    clientDir: path.resolve(process.cwd(), 'dist/production'),
    templateName: 'index.html',
    logLevel: 'info',
    corsOrigins: ['.replit.dev', '0.0.0.0'],
    rateLimitWindow: 900000, // 15 minutes
    rateLimitMax: 100,
    apiTimeout: 30000,
    enableBetaFeatures: false,
    enableAnalytics: true
  },
  staging: {
    port: PORT_CONFIG.staging,
    clientDir: path.resolve(process.cwd(), 'dist/staging'),
    templateName: 'staging.html',
    logLevel: 'debug',
    corsOrigins: ['.replit.dev', '0.0.0.0'],
    rateLimitWindow: 900000,
    rateLimitMax: 200,
    apiTimeout: 30000,
    enableBetaFeatures: true,
    enableAnalytics: false,
    host: '0.0.0.0'  // Ensure proper network binding
  },
  development: {
    port: PORT_CONFIG.development,
    clientDir: path.resolve(process.cwd(), 'dist/development'),
    templateName: 'index.html',
    logLevel: 'debug',
    corsOrigins: ['localhost', '0.0.0.0'],
    rateLimitWindow: 0, // No rate limiting in development
    rateLimitMax: 0,
    apiTimeout: 60000,
    enableBetaFeatures: true,
    enableAnalytics: false
  }
};

// Validate required environment variables
function validateRequiredEnvVars(env) {
  const missing = [];
  const required = REQUIRED_ENV_VARS[env];

  if (!required) {
    throw new Error(`Invalid environment: ${env}`);
  }

  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${env} environment: ${missing.join(', ')}\n` +
        'Please check your .env file and environment configuration.'
    );
  }
}

// Validate database URL format
function validateDatabaseUrl(url) {
  if (!url) return false;
  try {
    const dbUrl = new URL(url);
    return dbUrl.protocol === 'postgresql:';
  } catch (e) {
    return false;
  }
}

// Validate environment with enhanced logging
function validateEnvironment(env) {
  console.log(`[Environment] Validating environment: ${env}`);

  // Basic environment check
  if (!ENV_CONFIG[env]) {
    throw new Error(`Invalid environment: ${env}`);
  }

  // Validate required environment variables
  validateRequiredEnvVars(env);

  // Validate Database URL
  if (!validateDatabaseUrl(process.env.DATABASE_URL)) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const config = ENV_CONFIG[env];
  const clientDir = path.resolve(process.cwd(), config.clientDir);

  // Log configuration for debugging
  console.log('[Environment] Configuration:', {
    environment: env,
    ports: env === 'staging' ? config.ports : config.port,
    clientDir,
    templateName: config.templateName,
    logLevel: config.logLevel,
    cwd: process.cwd(),
    dirname: __dirname
  });

  // Verify client directory exists
  if (!fs.existsSync(clientDir)) {
    console.warn(`[Environment] Warning: Client directory not found: ${clientDir}`);
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      console.warn('[Environment] Available directories in dist:', fs.readdirSync(distDir));
    } else {
      console.warn('[Environment] dist directory does not exist');
    }
  }

  return config;
}

// Get environment configuration with enhanced validation
function getConfig() {
  const env = process.env.NODE_ENV || 'development';

  try {
    const config = validateEnvironment(env);

    // Enforce port 5000 for staging environment
    if (env === 'staging' && config.port !== 5000) {
      console.warn('[Environment] Overriding port to 5000 for staging environment');
      config.port = 5000;
    }

    // Add runtime configuration
    config.buildNumber = process.env.BUILD_NUMBER || 'dev';
    config.gitCommit = process.env.GIT_COMMIT || 'local';

    // Log final configuration
    console.log('[Environment] Final configuration:', {
      environment: env,
      port: config.port,
      clientDir: config.clientDir,
      buildNumber: config.buildNumber,
      logLevel: config.logLevel,
      host: config.host || '0.0.0.0'
    });

    return config;
  } catch (error) {
    console.error('[Environment] Configuration error:', error);
    throw error;
  }
}

module.exports = {
  getConfig,
  validateEnvironment,
  validateRequiredEnvVars,
  validateDatabaseUrl,
  PORT_CONFIG,
  ENV_CONFIG,
  REQUIRED_ENV_VARS
};