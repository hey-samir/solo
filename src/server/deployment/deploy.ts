import app from '../server';

async function deploy() {
  try {
    const PORT = parseInt(process.env.PORT || '80', 10);
    console.log(`Starting server on port ${PORT}`);

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

export default deploy;