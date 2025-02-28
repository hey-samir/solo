// Server startup file for the project
const { startServer } = require('./src/server/server');

async function main() {
  try {
    console.log(`[${new Date().toISOString()}] Starting server in ${process.env.NODE_ENV || 'development'} mode`);
    const server = await startServer();
    console.log(`[${new Date().toISOString()}] Server started successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
    process.exit(1);
  }
}

main();