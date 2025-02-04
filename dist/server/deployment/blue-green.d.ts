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
declare class BlueGreenDeployment {
    private blue;
    private green;
    private activeColor;
    private history;
    constructor();
    startEnvironment(app: express.Application, color: 'blue' | 'green', version?: string): Promise<Server>;
    stopEnvironment(color: 'blue' | 'green'): Promise<void>;
    performHealthCheck(env: Environment): Promise<boolean>;
    performRollback(): Promise<void>;
    switchEnvironment(): Promise<void>;
    getActiveEnvironment(): Environment;
    getInactiveEnvironment(): Environment;
    getDeploymentHistory(): DeploymentHistory;
}
export declare const deployment: BlueGreenDeployment;
export {};
