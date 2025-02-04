import { deployment } from './deployment/blue-green';
declare const app: import("express-serve-static-core").Express;
export { app, deployment as blueGreenDeployment };
