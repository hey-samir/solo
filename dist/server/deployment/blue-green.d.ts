import express from 'express';
import { Server } from 'http';
interface DeploymentEnvironment {
    server: Server | null;
    status: 'active' | 'inactive';
    port: number;
    healthStatus: 'healthy' | 'unhealthy' | 'unknown';
    lastDeployment: Date | null;
    version?: string;
    deploymentMetrics?: {
        startTime: Date;
        errorCount: number;
        responseTime: number[];
    };
}
declare class BlueGreenDeployment {
    private blue;
    private green;
    private activeEnvironment;
    private deploymentHistory;
    private rollbackConfig;
    private monitoringInterval;
    constructor();
    getActiveEnvironment(): DeploymentEnvironment;
    getInactiveEnvironment(): DeploymentEnvironment;
    private startHealthMonitoring;
    private shouldTriggerRollback;
    performRollback(): Promise<void>;
    switchEnvironment(): Promise<void>;
    performHealthCheck(environment: DeploymentEnvironment): Promise<boolean>;
    startEnvironment(app: express.Application, env: 'blue' | 'green', version?: string): Promise<void>;
    stopEnvironment(env: 'blue' | 'green'): Promise<void>;
    getDeploymentHistory(): {
        timestamp: Date;
        environment: "blue" | "green";
        version?: string;
        success: boolean;
    }[];
}
export declare const blueGreenDeployment: BlueGreenDeployment;
export default blueGreenDeployment;
