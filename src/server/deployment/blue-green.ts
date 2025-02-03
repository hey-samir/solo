import express from 'express';
import { Server } from 'http';

interface DeploymentEnvironment {
  server: Server | null;
  status: 'active' | 'inactive';
  port: number;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastDeployment: Date | null;
}

class BlueGreenDeployment {
  private blue: DeploymentEnvironment;
  private green: DeploymentEnvironment;
  private activeEnvironment: 'blue' | 'green';

  constructor() {
    this.blue = {
      server: null,
      status: 'inactive',
      port: 5001,
      healthStatus: 'unknown',
      lastDeployment: null
    };
    
    this.green = {
      server: null,
      status: 'inactive',
      port: 5002,
      healthStatus: 'unknown',
      lastDeployment: null
    };
    
    this.activeEnvironment = 'blue';
  }

  public getActiveEnvironment(): DeploymentEnvironment {
    return this.activeEnvironment === 'blue' ? this.blue : this.green;
  }

  public getInactiveEnvironment(): DeploymentEnvironment {
    return this.activeEnvironment === 'blue' ? this.green : this.blue;
  }

  public async switchEnvironment(): Promise<void> {
    const newActive = this.getInactiveEnvironment();
    const oldActive = this.getActiveEnvironment();

    if (newActive.healthStatus !== 'healthy') {
      throw new Error('Cannot switch to unhealthy environment');
    }

    // Switch the active environment
    this.activeEnvironment = this.activeEnvironment === 'blue' ? 'green' : 'blue';
    newActive.status = 'active';
    oldActive.status = 'inactive';

    console.log(`Switched from ${oldActive === this.blue ? 'blue' : 'green'} to ${newActive === this.blue ? 'blue' : 'green'}`);
  }

  public async performHealthCheck(environment: DeploymentEnvironment): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${environment.port}/health`);
      const healthy = response.status === 200;
      environment.healthStatus = healthy ? 'healthy' : 'unhealthy';
      return healthy;
    } catch (error) {
      environment.healthStatus = 'unhealthy';
      return false;
    }
  }

  public async startEnvironment(app: express.Application, env: 'blue' | 'green'): Promise<void> {
    const environment = env === 'blue' ? this.blue : this.green;
    
    if (environment.server) {
      throw new Error(`${env} environment is already running`);
    }

    environment.server = app.listen(environment.port, '0.0.0.0', () => {
      console.log(`${env} environment started on port ${environment.port}`);
      environment.lastDeployment = new Date();
    });

    // Perform initial health check
    await this.performHealthCheck(environment);
  }

  public async stopEnvironment(env: 'blue' | 'green'): Promise<void> {
    const environment = env === 'blue' ? this.blue : this.green;
    
    if (environment.server) {
      await new Promise<void>((resolve, reject) => {
        environment.server!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      environment.server = null;
      environment.status = 'inactive';
      environment.healthStatus = 'unknown';
      console.log(`${env} environment stopped`);
    }
  }
}

export const blueGreenDeployment = new BlueGreenDeployment();
export default blueGreenDeployment;
