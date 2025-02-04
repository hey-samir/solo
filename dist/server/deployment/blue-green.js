"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployment = void 0;
class BlueGreenDeployment {
    constructor() {
        this.blue = {
            server: null,
            port: 5001,
            status: 'inactive',
            lastDeployment: null
        };
        this.green = {
            server: null,
            port: 5002,
            status: 'inactive',
            lastDeployment: null
        };
        this.activeColor = 'blue';
        this.history = [];
    }
    async startEnvironment(app, color, version) {
        const env = color === 'blue' ? this.blue : this.green;
        if (env.server) {
            throw new Error(`${color} environment is already running`);
        }
        return new Promise((resolve, reject) => {
            env.server = app.listen(env.port, '0.0.0.0', () => {
                console.log(`${color} environment started on port ${env.port}`);
                env.status = 'active';
                env.lastDeployment = new Date();
                env.version = version;
                this.activeColor = color;
                this.history.push({
                    timestamp: new Date(),
                    color,
                    version: version || 'unknown',
                    status: 'success'
                });
                resolve(env.server);
            });
            env.server.on('error', (error) => {
                console.error(`Failed to start ${color} environment:`, error);
                this.history.push({
                    timestamp: new Date(),
                    color,
                    version: version || 'unknown',
                    status: 'failed'
                });
                reject(error);
            });
        });
    }
    async stopEnvironment(color) {
        const env = color === 'blue' ? this.blue : this.green;
        if (env.server) {
            return new Promise((resolve, reject) => {
                env.server.close((err) => {
                    if (err) {
                        console.error(`Error stopping ${color} environment:`, err);
                        reject(err);
                    }
                    else {
                        env.server = null;
                        env.status = 'inactive';
                        console.log(`${color} environment stopped`);
                        resolve();
                    }
                });
            });
        }
    }
    async performHealthCheck(env) {
        if (!env.server) {
            return false;
        }
        try {
            const response = await fetch(`http://0.0.0.0:${env.port}/health`);
            return response.status === 200;
        }
        catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
    async performRollback() {
        const currentColor = this.activeColor;
        const previousColor = currentColor === 'blue' ? 'green' : 'blue';
        console.log(`Rolling back from ${currentColor} to ${previousColor}`);
        await this.stopEnvironment(currentColor);
        this.activeColor = previousColor;
    }
    async switchEnvironment() {
        const newColor = this.activeColor === 'blue' ? 'green' : 'blue';
        console.log(`Switching active environment from ${this.activeColor} to ${newColor}`);
        this.activeColor = newColor;
    }
    getActiveEnvironment() {
        return this.activeColor === 'blue' ? this.blue : this.green;
    }
    getInactiveEnvironment() {
        return this.activeColor === 'blue' ? this.green : this.blue;
    }
    getDeploymentHistory() {
        return [...this.history];
    }
}
// Export a singleton instance
exports.deployment = new BlueGreenDeployment();
//# sourceMappingURL=blue-green.js.map