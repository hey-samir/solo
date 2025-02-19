const path = require('path');
const app = require('../server');

async function deploy() {
  try {
    // Kill any existing processes on the deployment port
    const PORT = parseInt(process.env.PORT || '3000', 10);
    const environment = process.env.NODE_ENV || 'production';

    // Validate environment-specific port
    if (environment === 'production' && PORT !== 3000) {
      throw new Error('Production must run on port 3000');
    }
    if (environment === 'staging' && PORT !== 5000) {
      throw new Error('Staging must run on port 5000');
    }

    console.log(`Starting deployment server in ${environment} mode`);
    console.log(`Port: ${PORT}`);
    console.log('Static files path:', path.join(process.cwd(), 'dist/client'));

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log(`Deployment server started in ${environment} mode`);
      console.log(`Listening on http://0.0.0.0:${PORT}`);
      console.log(`Process ID: ${process.pid}`);
      console.log(`Node version: ${process.version}`);
      console.log(`Current directory: ${process.cwd()}`);
      console.log('='.repeat(50));
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM signal, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      server.close(() => {
        console.log('Server closed due to uncaught exception');
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        console.log('Server closed due to unhandled rejection');
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  deploy();
}

module.exports = deploy;