const { forceReleasePort } = require('./port-check');

async function releaseServerPorts() {
  console.log('[Port Release] Starting port release process...');

  // Only release production and staging ports
  const ports = [3000, 5000];
  for (const port of ports) {
    console.log(`[Port Release] Attempting to release port ${port}...`);
    const released = await forceReleasePort(port);
    console.log(`[Port Release] Port ${port} release ${released ? 'successful' : 'failed or not in use'}`);
  }
}

if (require.main === module) {
  releaseServerPorts().catch(console.error);
}

module.exports = releaseServerPorts;