const fs = require('fs');
const path = require('path');

// Utility to read version.json
function getVersion() {
  const versionPath = path.join(process.cwd(), 'version.json');
  return JSON.parse(fs.readFileSync(versionPath, 'utf8'));
}

// Utility to write version.json
function saveVersion(versionData) {
  const versionPath = path.join(process.cwd(), 'version.json');
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
}

// Create changelog file
function createChangelogFile(version, changes) {
  const epoch = version.split('.')[0];
  const dir = path.join(process.cwd(), 'changelogs', `epoch-${epoch}`);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const changelogPath = path.join(dir, `${version}.md`);
  const date = new Date().toISOString().split('T')[0];
  
  const content = `# Version ${version} (${date})

${changes}
`;
  
  fs.writeFileSync(changelogPath, content);
}

// Bump version utilities
function bumpEpoch() {
  const versionData = getVersion();
  const [epoch] = versionData.version.split('.');
  versionData.version = `${Number(epoch) + 1}.0.0`;
  versionData.lastEpochUpdate = new Date().toISOString().split('T')[0];
  saveVersion(versionData);
  return versionData.version;
}

function bumpMinor() {
  const versionData = getVersion();
  const [epoch, minor, patch] = versionData.version.split('.');
  versionData.version = `${epoch}.${Number(minor) + 1}.${patch}`;
  versionData.lastMinorUpdate = new Date().toISOString().split('T')[0];
  saveVersion(versionData);
  return versionData.version;
}

function bumpPatch() {
  const versionData = getVersion();
  const [epoch, minor, patch] = versionData.version.split('.');
  versionData.version = `${epoch}.${minor}.${Number(patch) + 1}`;
  versionData.lastPatchUpdate = new Date().toISOString().split('T')[0];
  saveVersion(versionData);
  return versionData.version;
}

module.exports = {
  getVersion,
  bumpEpoch,
  bumpMinor,
  bumpPatch,
  createChangelogFile
};
