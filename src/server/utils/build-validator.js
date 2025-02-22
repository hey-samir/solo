const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Required files for each environment
const REQUIRED_BUILD_FILES = {
  production: ['index.html', 'assets'],
  staging: ['src/templates/staging.html', 'assets'],
  development: ['index.html', 'assets']
};

// Validate build artifact structure
async function validateBuildStructure(buildDir, env) {
  console.log(`[Build Validator] Validating build structure for ${env} environment in ${buildDir}`);

  const requiredFiles = REQUIRED_BUILD_FILES[env];
  const missing = [];

  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file);
    if (!fs.existsSync(filePath)) {
      missing.push(file);
      console.error(`[Build Validator] Missing required file/directory: ${file}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Invalid build structure. Missing files: ${missing.join(', ')}`);
  }

  return true;
}

// Generate build manifest with checksums
async function generateBuildManifest(buildDir) {
  console.log(`[Build Validator] Generating build manifest for ${buildDir}`);

  const manifest = {
    timestamp: new Date().toISOString(),
    files: {},
    checksums: {}
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

        manifest.files[relativePath] = {
          size: stats.size,
          mtime: stats.mtime
        };
        manifest.checksums[relativePath] = checksum;
      }
    }
  }

  processDirectory(buildDir);
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
      const srcTemplatePath = path.join(buildDir, 'src/templates/staging.html');
      const destPath = path.join(buildDir, 'staging.html');

      if (fs.existsSync(srcTemplatePath)) {
        const templateDir = path.dirname(destPath);
        if (!fs.existsSync(templateDir)) {
          fs.mkdirSync(templateDir, { recursive: true });
        }
        fs.copyFileSync(srcTemplatePath, destPath);
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