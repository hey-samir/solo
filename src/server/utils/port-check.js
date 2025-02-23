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
      // Bind to 0.0.0.0 to ensure proper network accessibility
      server.listen(port, '0.0.0.0');
    } catch (err) {
      console.error(`[Port Check] Unexpected error during port check:`, err);
      cleanup();
      resolve(false);
    }
  });
}

async function validatePort(port, env) {
  console.log(`[Port Validation] Starting port validation for ${env} environment on port ${port}`);

  // For staging environment, ensure port 5000
  if (env === 'staging') {
    console.log('[Port Validation] Enforcing staging environment port requirements');
    if (port !== 5000) {
      throw new Error('Staging environment must use port 5000');
    }

    // Attempt to free up port 5000
    console.log('[Port Validation] Attempting to free port 5000');
    await killProcessOnPort(5000);

    // Multiple attempts to ensure port is free
    for (let attempt = 0; attempt < 3; attempt++) {
      console.log(`[Port Validation] Port check attempt ${attempt + 1}/3`);
      const isAvailable = await checkPort(5000);
      if (isAvailable) {
        console.log('[Port Validation] Successfully secured port 5000');
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      await killProcessOnPort(5000);
    }

    throw new Error('Could not secure port 5000 for staging environment after multiple attempts');
  }

  // For other environments, validate the provided port
  const isAvailable = await checkPort(port);
  if (!isAvailable) {
    throw new Error(`Port ${port} is not available for ${env} environment`);
  }

  return true;
}

module.exports = { checkPort, validatePort, killProcessOnPort };