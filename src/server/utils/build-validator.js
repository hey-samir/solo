const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Required files for each environment
const REQUIRED_BUILD_FILES = {
  production: ['index.html', 'assets'],
  staging: ['staging.html', 'assets', 'manifest.json'],
  development: ['index.html', 'assets']
};

// Required asset types that must be present
const REQUIRED_ASSET_TYPES = {
  staging: {
    js: true,
    css: true,
    map: true
  }
};

// Validate build artifact structure
async function validateBuildStructure(buildDir, env) {
  console.log(`[Build Validator] Validating build structure for ${env} environment in ${buildDir}`);

  const requiredFiles = REQUIRED_BUILD_FILES[env];
  const missing = [];
  const assetTypes = new Set();

  // Check required files exist
  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file);
    if (!fs.existsSync(filePath)) {
      missing.push(file);
      console.error(`[Build Validator] Missing required file/directory: ${file}`);
    }
  }

  // Check assets directory content
  const assetsPath = path.join(buildDir, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    console.log('[Build Validator] Found assets:', assets);

    assets.forEach(asset => {
      const ext = path.extname(asset).toLowerCase();
      if (ext) assetTypes.add(ext.substring(1));
    });

    // Verify required asset types for environment
    if (REQUIRED_ASSET_TYPES[env]) {
      for (const [type, required] of Object.entries(REQUIRED_ASSET_TYPES[env])) {
        if (required && !assetTypes.has(type)) {
          console.error(`[Build Validator] Missing required asset type: ${type}`);
          missing.push(`assets/*.${type}`);
        }
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Invalid build structure. Missing files: ${missing.join(', ')}`);
  }

  console.log('[Build Validator] Asset types found:', Array.from(assetTypes));
  return true;
}

// Generate build manifest with checksums
async function generateBuildManifest(buildDir) {
  console.log(`[Build Validator] Generating build manifest for ${buildDir}`);

  const manifest = {
    timestamp: new Date().toISOString(),
    files: {},
    checksums: {},
    assetTypes: new Set()
  };

  function processDirectory(dir, base = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(base, entry.name);

      if (entry.isDirectory()) {
        processDirectory(fullPath, relativePath);
      } else {
        const stats = fs.statSync(fullPath);
        const fileBuffer = fs.readFileSync(fullPath);
        const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const ext = path.extname(entry.name).toLowerCase();

        if (ext) manifest.assetTypes.add(ext.substring(1));

        manifest.files[relativePath] = {
          size: stats.size,
          mtime: stats.mtime,
          type: ext ? ext.substring(1) : 'unknown'
        };
        manifest.checksums[relativePath] = checksum;
      }
    }
  }

  processDirectory(buildDir);
  manifest.assetTypes = Array.from(manifest.assetTypes);
  return manifest;
}

// Validate build artifacts and generate manifest
async function validateBuildArtifacts(buildDir, env) {
  console.log(`[Build Validator] Starting build validation for ${env} environment`);

  try {
    // 1. Validate build structure
    await validateBuildStructure(buildDir, env);

    // 2. Generate and save build manifest
    const manifest = await generateBuildManifest(buildDir);
    const manifestPath = path.join(buildDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // 3. Post-process for staging environment
    if (env === 'staging') {
      // Ensure staging.html exists
      const templatePath = path.join(buildDir, 'staging.html');
      if (!fs.existsSync(templatePath)) {
        throw new Error('Missing staging.html template');
      }

      // Verify CSS is bundled
      const hasCSS = manifest.assetTypes.includes('css');
      if (!hasCSS) {
        throw new Error('Missing CSS bundle in staging build');
      }
    }

    console.log('[Build Validator] Build validation completed successfully');
    return {
      valid: true,
      manifest,
      buildPath: buildDir
    };
  } catch (error) {
    console.error('[Build Validator] Build validation failed:', error);
    throw error;
  }
}

module.exports = {
  validateBuildStructure,
  generateBuildManifest,
  validateBuildArtifacts,
  REQUIRED_BUILD_FILES
};