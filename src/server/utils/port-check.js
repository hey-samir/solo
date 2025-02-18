const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function listProcessesOnPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -P -n`);
    console.log(`[Port Check] Current processes on port ${port}:\n${stdout}`);
    return stdout;
  } catch (error) {
    console.log(`[Port Check] No processes found on port ${port}`);
    return '';
  }
}

async function checkPort(port) {
  console.log(`[Port Check] Starting detailed port ${port} check`);

  // First, list all processes on the port
  await listProcessesOnPort(port);

  try {
    // Try to kill any existing processes
    const { stdout } = await execAsync(`lsof -i :${port} -t`);
    if (stdout) {
      const pids = stdout.trim().split('\n');
      console.log(`[Port Check] Found processes using port ${port}:`, pids);

      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`[Port Check] Terminated process ${pid}`);
          // Wait a bit after killing
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`[Port Check] Failed to terminate process ${pid}:`, err);
        }
      }
    }
  } catch (error) {
    // lsof returns non-zero if no process is found
    console.log(`[Port Check] No existing process found on port ${port}`);
  }

  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', async (err) => {
      console.error(`[Port Check] Error binding to port ${port}:`, err);
      // List processes again if binding failed
      await listProcessesOnPort(port);
      server.close();
      resolve(false);
    });

    server.once('listening', () => {
      console.log(`[Port Check] Successfully bound to port ${port}`);
      server.close(() => {
        console.log(`[Port Check] Released test binding on port ${port}`);
        resolve(true);
      });
    });

    console.log(`[Port Check] Attempting to bind to port ${port}`);
    server.listen(port, '0.0.0.0');
  });
}

async function forceReleasePort(port) {
  console.log(`[Port Release] Starting force release for port ${port}`);

  try {
    // First try to identify and kill processes
    const result = await checkPort(port);
    if (result) {
      console.log(`[Port Release] Port ${port} is now available`);
      return true;
    }

    // If still not available, try socket reset
    console.log(`[Port Release] Attempting socket reset on port ${port}`);
    const client = new net.Socket();

    return new Promise((resolve) => {
      client.once('error', (err) => {
        console.error(`[Port Release] Socket reset error:`, err);
        client.destroy();
        resolve(false);
      });

      client.connect({ port, host: '0.0.0.0' }, () => {
        console.log(`[Port Release] Connected to port ${port}, sending FIN`);
        client.end();
        setTimeout(() => {
          console.log(`[Port Release] Socket reset completed`);
          resolve(true);
        }, 1000);
      });

      // Add timeout
      setTimeout(() => {
        console.log(`[Port Release] Socket reset timeout`);
        client.destroy();
        resolve(false);
      }, 2000);
    });
  } catch (error) {
    console.error(`[Port Release] Error during force release:`, error);
    return false;
  }
}

module.exports = { checkPort, forceReleasePort, listProcessesOnPort };