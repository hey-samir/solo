const net = require('net');

async function checkPort(port) {
  console.log(`[Port Check] Testing port ${port} availability`);

  return new Promise((resolve) => {
    const server = net.createServer();
    let timeoutId;

    const cleanup = () => {
      clearTimeout(timeoutId);
      server.close();
    };

    server.once('error', (err) => {
      console.error(`[Port Check] Error binding to port ${port}:`, {
        code: err.code,
        message: err.message,
        errno: err.errno
      });
      cleanup();
      resolve(false);
    });

    server.once('listening', () => {
      console.log(`[Port Check] Successfully bound to port ${port}`);
      cleanup();
      resolve(true);
    });

    timeoutId = setTimeout(() => {
      console.log(`[Port Check] Binding attempt timed out on port ${port}`);
      cleanup();
      resolve(false);
    }, 5000);

    try {
      server.listen(port, '0.0.0.0');
    } catch (err) {
      console.error(`[Port Check] Unexpected error during port check:`, err);
      cleanup();
      resolve(false);
    }
  });
}

async function validatePort(port, env) {
  // Validate port assignment based on environment
  if (env === 'production' && port !== 3000) {
    throw new Error('Production environment must use port 3000');
  }
  if (env === 'staging' && port !== 5000) {
    throw new Error('Staging environment must use port 5000');
  }

  const isAvailable = await checkPort(port);
  if (!isAvailable) {
    throw new Error(`Port ${port} is not available for ${env} environment`);
  }
  return true;
}

async function forceReleasePort(port) {
  console.log(`[Port Release] Attempting to release port ${port}`);

  return new Promise((resolve) => {
    const client = new net.Socket();
    let timeoutId;

    const cleanup = () => {
      clearTimeout(timeoutId);
      client.destroy();
    };

    client.once('error', (err) => {
      console.log(`[Port Release] Socket reset error:`, err);
      cleanup();
      resolve(false);
    });

    client.connect({ port, host: '0.0.0.0' }, () => {
      console.log(`[Port Release] Connected to port ${port}, sending FIN`);
      client.end();
      setTimeout(() => {
        console.log(`[Port Release] Socket reset completed`);
        cleanup();
        resolve(true);
      }, 1000);
    });

    timeoutId = setTimeout(() => {
      console.log(`[Port Release] Socket reset timeout`);
      cleanup();
      resolve(false);
    }, 2000);
  });
}

module.exports = { checkPort, validatePort, forceReleasePort };