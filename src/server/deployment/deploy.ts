import { app, blueGreenDeployment } from '../server';

async function deploy() {
  try {
    // Get current active and inactive environments
    const activeEnv = blueGreenDeployment.getActiveEnvironment();
    const inactiveEnv = blueGreenDeployment.getInactiveEnvironment();
    const newColor = activeEnv === blueGreenDeployment['blue'] ? 'green' : 'blue';

    console.log(`Starting deployment to ${newColor} environment`);

    // Start the new environment
    process.env.DEPLOYMENT_COLOR = newColor;
    await blueGreenDeployment.startEnvironment(app, newColor);

    // Wait for the new environment to be healthy
    let attempts = 0;
    const maxAttempts = 5;
    let isHealthy = false;

    while (attempts < maxAttempts && !isHealthy) {
      console.log(`Performing health check attempt ${attempts + 1}/${maxAttempts}`);
      isHealthy = await blueGreenDeployment.performHealthCheck(inactiveEnv);
      
      if (!isHealthy && attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
      }
      attempts++;
    }

    if (!isHealthy) {
      throw new Error(`New ${newColor} environment failed health checks`);
    }

    // Switch traffic to the new environment
    await blueGreenDeployment.switchEnvironment();
    console.log(`Successfully switched to ${newColor} environment`);

    // Stop the old environment
    const oldColor = newColor === 'blue' ? 'green' : 'blue';
    await blueGreenDeployment.stopEnvironment(oldColor);
    console.log(`Stopped old ${oldColor} environment`);

  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  deploy();
}

export default deploy;
