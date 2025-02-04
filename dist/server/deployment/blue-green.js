"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueGreenDeployment = void 0;
class BlueGreenDeployment {
    constructor() {
        this.blue = {
            server: null,
            status: 'inactive',
            port: 5001,
            healthStatus: 'unknown',
            lastDeployment: null,
            deploymentMetrics: {
                startTime: new Date(),
                errorCount: 0,
                responseTime: []
            }
        };
        this.green = {
            server: null,
            status: 'inactive',
            port: 5002,
            healthStatus: 'unknown',
            lastDeployment: null,
            deploymentMetrics: {
                startTime: new Date(),
                errorCount: 0,
                responseTime: []
            }
        };
        this.activeEnvironment = 'blue';
        this.deploymentHistory = [];
        this.monitoringInterval = null;
        this.rollbackConfig = {
            maxErrorThreshold: 3,
            healthCheckInterval: 5000,
            maxResponseTime: 2000,
            stabilizationPeriod: 30000
        };
    }
    getActiveEnvironment() {
        return this.activeEnvironment === 'blue' ? this.blue : this.green;
    }
    getInactiveEnvironment() {
        return this.activeEnvironment === 'blue' ? this.green : this.blue;
    }
    async startHealthMonitoring(environment) {
        if (this.monitoringInterval) {
            clearTimeout(this.monitoringInterval);
        }
        this.monitoringInterval = setInterval(async () => {
            try {
                const startTime = Date.now();
                const healthy = await this.performHealthCheck(environment);
                const responseTime = Date.now() - startTime;
                environment.deploymentMetrics.responseTime.push(responseTime);
                if (!healthy) {
                    environment.deploymentMetrics.errorCount++;
                    console.log(`Health check failed for ${this.activeEnvironment} environment`);
                    if (this.shouldTriggerRollback(environment)) {
                        console.log('Triggering automatic rollback due to health check failures');
                        await this.performRollback();
                    }
                }
            }
            catch (error) {
                console.error('Error during health monitoring:', error);
            }
        }, this.rollbackConfig.healthCheckInterval);
    }
    shouldTriggerRollback(environment) {
        const metrics = environment.deploymentMetrics;
        const avgResponseTime = metrics.responseTime.length > 0
            ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
            : 0;
        return (metrics.errorCount >= this.rollbackConfig.maxErrorThreshold ||
            avgResponseTime > this.rollbackConfig.maxResponseTime);
    }
    async performRollback() {
        const currentEnv = this.getActiveEnvironment();
        const previousEnv = this.getInactiveEnvironment();
        if (!previousEnv.lastDeployment) {
            throw new Error('No previous deployment available for rollback');
        }
        console.log(`Initiating rollback from ${this.activeEnvironment} to previous environment`);
        try {
            // Switch back to the previous environment
            await this.switchEnvironment();
            // Stop the problematic environment
            await this.stopEnvironment(this.activeEnvironment === 'blue' ? 'green' : 'blue');
            // Record the rollback in deployment history
            this.deploymentHistory.push({
                timestamp: new Date(),
                environment: this.activeEnvironment,
                version: previousEnv.version,
                success: true
            });
            console.log('Rollback completed successfully');
        }
        catch (error) {
            console.error('Rollback failed:', error);
            throw error;
        }
    }
    async switchEnvironment() {
        const newActive = this.getInactiveEnvironment();
        const oldActive = this.getActiveEnvironment();
        if (newActive.healthStatus !== 'healthy') {
            throw new Error('Cannot switch to unhealthy environment');
        }
        // Switch the active environment
        this.activeEnvironment = this.activeEnvironment === 'blue' ? 'green' : 'blue';
        newActive.status = 'active';
        oldActive.status = 'inactive';
        // Start monitoring the new environment
        await this.startHealthMonitoring(newActive);
        // Record the switch in deployment history
        this.deploymentHistory.push({
            timestamp: new Date(),
            environment: this.activeEnvironment,
            version: newActive.version,
            success: true
        });
        console.log(`Switched from ${oldActive === this.blue ? 'blue' : 'green'} to ${newActive === this.blue ? 'blue' : 'green'}`);
    }
    async performHealthCheck(environment) {
        try {
            const startTime = Date.now();
            const response = await fetch(`http://localhost:${environment.port}/health`);
            const responseTime = Date.now() - startTime;
            const healthy = response.status === 200 && responseTime < this.rollbackConfig.maxResponseTime;
            environment.healthStatus = healthy ? 'healthy' : 'unhealthy';
            return healthy;
        }
        catch (error) {
            environment.healthStatus = 'unhealthy';
            return false;
        }
    }
    async startEnvironment(app, env, version) {
        const environment = env === 'blue' ? this.blue : this.green;
        if (environment.server) {
            throw new Error(`${env} environment is already running`);
        }
        environment.version = version;
        environment.deploymentMetrics = {
            startTime: new Date(),
            errorCount: 0,
            responseTime: []
        };
        environment.server = app.listen(environment.port, '0.0.0.0', () => {
            console.log(`${env} environment started on port ${environment.port}`);
            environment.lastDeployment = new Date();
        });
        // Start monitoring after environment is up
        await this.startHealthMonitoring(environment);
        // Perform initial health check
        await this.performHealthCheck(environment);
    }
    async stopEnvironment(env) {
        const environment = env === 'blue' ? this.blue : this.green;
        if (environment.server) {
            if (this.monitoringInterval) {
                clearTimeout(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            await new Promise((resolve, reject) => {
                environment.server.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            environment.server = null;
            environment.status = 'inactive';
            environment.healthStatus = 'unknown';
            console.log(`${env} environment stopped`);
        }
    }
    getDeploymentHistory() {
        return this.deploymentHistory;
    }
}
exports.blueGreenDeployment = new BlueGreenDeployment();
exports.default = exports.blueGreenDeployment;
//# sourceMappingURL=blue-green.js.map