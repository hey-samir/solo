import { Server } from 'http';
import express from 'express';

interface Environment {
  server: Server | null;
  port: number;
  status: 'active' | 'inactive';
  lastDeployment: Date | null;
  version?: string;
}

type DeploymentHistory = {
  timestamp: Date;
  color: 'blue' | 'green';
  version: string;
  status: 'success' | 'failed';
}[];

class BlueGreenDeployment {
  private blue: Environment;
  private green: Environment;
  private activeColor: 'blue' | 'green';
  private history: DeploymentHistory;

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

  public async startEnvironment(
    app: express.Application, 
    color: 'blue' | 'green', 
    version?: string
  ): Promise<Server> {
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
        resolve(env.server!);
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

  public async stopEnvironment(color: 'blue' | 'green'): Promise<void> {
    const env = color === 'blue' ? this.blue : this.green;

    if (env.server) {
      return new Promise((resolve, reject) => {
        env.server!.close((err) => {
          if (err) {
            console.error(`Error stopping ${color} environment:`, err);
            reject(err);
          } else {
            env.server = null;
            env.status = 'inactive';
            console.log(`${color} environment stopped`);
            resolve();
          }
        });
      });
    }
  }

  public async performHealthCheck(env: Environment): Promise<boolean> {
    if (!env.server) {
      return false;
    }

    try {
      const response = await fetch(`http://0.0.0.0:${env.port}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  public async performRollback(): Promise<void> {
    const currentColor = this.activeColor;
    const previousColor = currentColor === 'blue' ? 'green' : 'blue';

    console.log(`Rolling back from ${currentColor} to ${previousColor}`);

    await this.stopEnvironment(currentColor);
    this.activeColor = previousColor;
  }

  public async switchEnvironment(): Promise<void> {
    const newColor = this.activeColor === 'blue' ? 'green' : 'blue';
    console.log(`Switching active environment from ${this.activeColor} to ${newColor}`);
    this.activeColor = newColor;
  }

  public getActiveEnvironment(): Environment {
    return this.activeColor === 'blue' ? this.blue : this.green;
  }

  public getInactiveEnvironment(): Environment {
    return this.activeColor === 'blue' ? this.green : this.blue;
  }

  public getDeploymentHistory(): DeploymentHistory {
    return [...this.history];
  }
}

// Export a singleton instance
export const deployment = new BlueGreenDeployment();