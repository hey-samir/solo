const path = require('path');
const app = require('../app');

async function deploy() {
  try {
    const PORT = parseInt(process.env.PORT || '5001', 10);
    const environment = process.env.NODE_ENV || 'development';

    console.log(`Starting server in ${environment} mode`);
    console.log(`Port: ${PORT}`);

    // Ensure the app is properly configured before starting
    if (!app) {
      throw new Error('Failed to load server application');
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
      console.log(`Environment: ${environment}`);
      console.log('Static files path:', path.join(process.cwd(), 'dist/client'));
    });

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM signal, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
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