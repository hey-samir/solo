const fs = require('fs');
const path = require('path');

// Utility to read version.json
function getVersion() {
  const versionPath = path.join(process.cwd(), 'version.json');
  const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  console.log('Current version:', version);
  return version;
}

// Utility to write version.json
function saveVersion(versionData) {
  const versionPath = path.join(process.cwd(), 'version.json');
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
  console.log('Saved new version:', versionData);
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
  console.log(`Created changelog for version ${version}`);
}

// Bump version utilities
function bumpEpoch() {
  console.log('Bumping epoch version...');
  const versionData = getVersion();
  const [epoch] = versionData.version.split('.');
  versionData.version = `${Number(epoch) + 1}.0.0`;
  versionData.lastEpochUpdate = new Date().toISOString().split('T')[0];
  versionData.lastMinorUpdate = versionData.lastEpochUpdate;
  versionData.lastPatchUpdate = versionData.lastEpochUpdate;
  saveVersion(versionData);
  return versionData.version;
}

function bumpMinor() {
  console.log('Bumping minor version...');
  const versionData = getVersion();
  const [epoch, minor] = versionData.version.split('.');
  versionData.version = `${epoch}.${Number(minor) + 1}.0`;
  versionData.lastMinorUpdate = new Date().toISOString().split('T')[0];
  versionData.lastPatchUpdate = versionData.lastMinorUpdate;
  saveVersion(versionData);
  return versionData.version;
}

function bumpPatch() {
  console.log('Bumping patch version...');
  const versionData = getVersion();
  const [epoch, minor, patch] = versionData.version.split('.');
  versionData.version = `${epoch}.${minor}.${Number(patch) + 1}`;
  versionData.lastPatchUpdate = new Date().toISOString().split('T')[0];
  saveVersion(versionData);
  return versionData.version;
}

// If script is run directly with arguments
if (require.main === module) {
  const command = process.argv[2];
  switch (command) {
    case 'bumpEpoch':
      bumpEpoch();
      break;
    case 'bumpMinor':
      bumpMinor();
      break;
    case 'bumpPatch':
      bumpPatch();
      break;
    default:
      console.error('Invalid command. Use: bumpEpoch, bumpMinor, or bumpPatch');
  }
}

module.exports = {
  getVersion,
  bumpEpoch,
  bumpMinor,
  bumpPatch,
  createChangelogFile
};