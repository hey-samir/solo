const { forceReleasePort } = require('./port-check');

async function releaseServerPorts() {
  console.log('[Port Release] Starting port release process...');
  
  const ports = [5000, 3000];
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
