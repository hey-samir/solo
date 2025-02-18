const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`[Port Check] Port ${port} is in use`);
          resolve(false);
        } else {
          console.error(`[Port Check] Error checking port ${port}:`, err);
          resolve(false);
        }
      })
      .once('listening', () => {
        server.close();
        console.log(`[Port Check] Port ${port} is available`);
        resolve(true);
      })
      .listen(port, '0.0.0.0');
  });
}

module.exports = { checkPort };
