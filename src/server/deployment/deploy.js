const app = require('../server');

async function deploy() {
  try {
    const PORT = parseInt(process.env.PORT || '80', 10);
    console.log(`Starting server on port ${PORT}`);
    console.log('Setting up static file serving for staging');
    console.log('Static path:', process.cwd() + '/dist/client');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
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