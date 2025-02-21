const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function killProcessOnPort(port) {
  console.log(`[Port Kill] Attempting to kill process on port ${port}`);
  try {
    // For Linux/Unix systems
    const { stdout } = await execAsync(`lsof -i :${port} -t`);
    if (stdout) {
      const pids = stdout.trim().split('\n');
      for (const pid of pids) {
        console.log(`[Port Kill] Killing process ${pid} on port ${port}`);
        await execAsync(`kill -9 ${pid}`);
      }
      // Wait a bit after killing
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
  } catch (error) {
    // ENOENT means no process found, which is fine
    if (error.code !== 'ENOENT') {
      console.error(`[Port Kill] Error killing process:`, error);
    }
  }
  return false;
}

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

  // For staging environment, forcefully kill any process on port 5000
  if (env === 'staging' && port === 5000) {
    await killProcessOnPort(port);
  }

  // Multiple attempts to check port availability
  for (let i = 0; i < 3; i++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return true;
    }
    console.log(`[Port Check] Attempt ${i + 1} failed, waiting before retry...`);

    // For staging, try killing the process again
    if (env === 'staging' && port === 5000) {
      await killProcessOnPort(port);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  throw new Error(`Port ${port} is not available for ${env} environment after multiple attempts`);
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
      if (err.code === 'ECONNREFUSED') {
        console.log(`[Port Release] Port ${port} is already free`);
      } else {
        console.log(`[Port Release] Socket reset error:`, err);
      }
      cleanup();
      resolve(true);
    });

    client.connect({ port, host: '0.0.0.0' }, () => {
      console.log(`[Port Release] Connected to port ${port}, sending FIN`);
      client.end();
      setTimeout(() => {
        console.log(`[Port Release] Socket reset completed`);
        cleanup();
        resolve(true);
      }, 2000);
    });

    timeoutId = setTimeout(() => {
      console.log(`[Port Release] Socket reset timeout`);
      cleanup();
      resolve(true);
    }, 3000);
  });
}

module.exports = { checkPort, validatePort, forceReleasePort, killProcessOnPort };