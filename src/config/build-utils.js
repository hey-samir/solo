const fs = require('fs');
const path = require('path');

function getVersionInfo() {
  const versionPath = path.join(process.cwd(), 'src/config/version.json');
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  return versionData;
}

function generateManifest(mode) {
  const version = getVersionInfo();
  return {
    timestamp: new Date().toISOString(),
    version: version.version,
    mode,
    port: mode === 'staging' ? 5000 : 3000,
    files: [], // This will be populated by Vite during build
  };
}

module.exports = {
  getVersionInfo,
  generateManifest,
};