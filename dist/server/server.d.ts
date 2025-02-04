import * as blueGreenDeployment from './deployment/blue-green';
declare const app: import("express-serve-static-core").Express;
declare const startServer: () => Promise<any>;
export { app, startServer, blueGreenDeployment };
