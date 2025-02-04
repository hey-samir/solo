"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
async function deploy() {
    try {
        // Get current active and inactive environments
        const activeEnv = server_1.blueGreenDeployment.getActiveEnvironment();
        const inactiveEnv = server_1.blueGreenDeployment.getInactiveEnvironment();
        const newColor = activeEnv === server_1.blueGreenDeployment['blue'] ? 'green' : 'blue';
        console.log(`Starting deployment to ${newColor} environment`);
        // Start the new environment
        process.env.DEPLOYMENT_COLOR = newColor;
        const version = process.env.DEPLOYMENT_VERSION || new Date().toISOString();
        await server_1.blueGreenDeployment.startEnvironment(server_1.app, newColor, version);
        // Wait for the new environment to be healthy
        let attempts = 0;
        const maxAttempts = 5;
        let isHealthy = false;
        while (attempts < maxAttempts && !isHealthy) {
            console.log(`Performing health check attempt ${attempts + 1}/${maxAttempts}`);
            isHealthy = await server_1.blueGreenDeployment.performHealthCheck(inactiveEnv);
            if (!isHealthy) {
                if (attempts === maxAttempts - 1) {
                    // If we've reached max attempts and still unhealthy, rollback
                    console.log('Health checks failed, initiating rollback...');
                    await server_1.blueGreenDeployment.performRollback();
                    throw new Error('Deployment failed health checks, rolled back to previous version');
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
            }
            attempts++;
        }
        // Switch traffic to the new environment
        await server_1.blueGreenDeployment.switchEnvironment();
        console.log(`Successfully switched to ${newColor} environment`);
        // Stop the old environment
        const oldColor = newColor === 'blue' ? 'green' : 'blue';
        await server_1.blueGreenDeployment.stopEnvironment(oldColor);
        console.log(`Stopped old ${oldColor} environment`);
        // Start monitoring period
        console.log('Starting deployment monitoring period...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Monitor for 30 seconds
        const deploymentHistory = server_1.blueGreenDeployment.getDeploymentHistory();
        console.log('Recent deployment history:', deploymentHistory);
    }
    catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    deploy();
}
exports.default = deploy;
//# sourceMappingURL=deploy.js.map