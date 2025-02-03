"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueGreenDeployment = void 0;
var BlueGreenDeployment = /** @class */ (function () {
    function BlueGreenDeployment() {
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
    BlueGreenDeployment.prototype.getActiveEnvironment = function () {
        return this.activeEnvironment === 'blue' ? this.blue : this.green;
    };
    BlueGreenDeployment.prototype.getInactiveEnvironment = function () {
        return this.activeEnvironment === 'blue' ? this.green : this.blue;
    };
    BlueGreenDeployment.prototype.startHealthMonitoring = function (environment) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.monitoringInterval) {
                    clearTimeout(this.monitoringInterval);
                }
                this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    var startTime, healthy, responseTime, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                startTime = Date.now();
                                return [4 /*yield*/, this.performHealthCheck(environment)];
                            case 1:
                                healthy = _a.sent();
                                responseTime = Date.now() - startTime;
                                environment.deploymentMetrics.responseTime.push(responseTime);
                                if (!!healthy) return [3 /*break*/, 3];
                                environment.deploymentMetrics.errorCount++;
                                console.log("Health check failed for ".concat(this.activeEnvironment, " environment"));
                                if (!this.shouldTriggerRollback(environment)) return [3 /*break*/, 3];
                                console.log('Triggering automatic rollback due to health check failures');
                                return [4 /*yield*/, this.performRollback()];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3: return [3 /*break*/, 5];
                            case 4:
                                error_1 = _a.sent();
                                console.error('Error during health monitoring:', error_1);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }, this.rollbackConfig.healthCheckInterval);
                return [2 /*return*/];
            });
        });
    };
    BlueGreenDeployment.prototype.shouldTriggerRollback = function (environment) {
        var metrics = environment.deploymentMetrics;
        var avgResponseTime = metrics.responseTime.length > 0
            ? metrics.responseTime.reduce(function (a, b) { return a + b; }, 0) / metrics.responseTime.length
            : 0;
        return (metrics.errorCount >= this.rollbackConfig.maxErrorThreshold ||
            avgResponseTime > this.rollbackConfig.maxResponseTime);
    };
    BlueGreenDeployment.prototype.performRollback = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentEnv, previousEnv, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentEnv = this.getActiveEnvironment();
                        previousEnv = this.getInactiveEnvironment();
                        if (!previousEnv.lastDeployment) {
                            throw new Error('No previous deployment available for rollback');
                        }
                        console.log("Initiating rollback from ".concat(this.activeEnvironment, " to previous environment"));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // Switch back to the previous environment
                        return [4 /*yield*/, this.switchEnvironment()];
                    case 2:
                        // Switch back to the previous environment
                        _a.sent();
                        // Stop the problematic environment
                        return [4 /*yield*/, this.stopEnvironment(this.activeEnvironment === 'blue' ? 'green' : 'blue')];
                    case 3:
                        // Stop the problematic environment
                        _a.sent();
                        // Record the rollback in deployment history
                        this.deploymentHistory.push({
                            timestamp: new Date(),
                            environment: this.activeEnvironment,
                            version: previousEnv.version,
                            success: true
                        });
                        console.log('Rollback completed successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Rollback failed:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BlueGreenDeployment.prototype.switchEnvironment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newActive, oldActive;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newActive = this.getInactiveEnvironment();
                        oldActive = this.getActiveEnvironment();
                        if (newActive.healthStatus !== 'healthy') {
                            throw new Error('Cannot switch to unhealthy environment');
                        }
                        // Switch the active environment
                        this.activeEnvironment = this.activeEnvironment === 'blue' ? 'green' : 'blue';
                        newActive.status = 'active';
                        oldActive.status = 'inactive';
                        // Start monitoring the new environment
                        return [4 /*yield*/, this.startHealthMonitoring(newActive)];
                    case 1:
                        // Start monitoring the new environment
                        _a.sent();
                        // Record the switch in deployment history
                        this.deploymentHistory.push({
                            timestamp: new Date(),
                            environment: this.activeEnvironment,
                            version: newActive.version,
                            success: true
                        });
                        console.log("Switched from ".concat(oldActive === this.blue ? 'blue' : 'green', " to ").concat(newActive === this.blue ? 'blue' : 'green'));
                        return [2 /*return*/];
                }
            });
        });
    };
    BlueGreenDeployment.prototype.performHealthCheck = function (environment) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response, responseTime, healthy, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startTime = Date.now();
                        return [4 /*yield*/, fetch("http://localhost:".concat(environment.port, "/health"))];
                    case 1:
                        response = _a.sent();
                        responseTime = Date.now() - startTime;
                        healthy = response.status === 200 && responseTime < this.rollbackConfig.maxResponseTime;
                        environment.healthStatus = healthy ? 'healthy' : 'unhealthy';
                        return [2 /*return*/, healthy];
                    case 2:
                        error_3 = _a.sent();
                        environment.healthStatus = 'unhealthy';
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BlueGreenDeployment.prototype.startEnvironment = function (app, env, version) {
        return __awaiter(this, void 0, void 0, function () {
            var environment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        environment = env === 'blue' ? this.blue : this.green;
                        if (environment.server) {
                            throw new Error("".concat(env, " environment is already running"));
                        }
                        environment.version = version;
                        environment.deploymentMetrics = {
                            startTime: new Date(),
                            errorCount: 0,
                            responseTime: []
                        };
                        environment.server = app.listen(environment.port, '0.0.0.0', function () {
                            console.log("".concat(env, " environment started on port ").concat(environment.port));
                            environment.lastDeployment = new Date();
                        });
                        // Start monitoring after environment is up
                        return [4 /*yield*/, this.startHealthMonitoring(environment)];
                    case 1:
                        // Start monitoring after environment is up
                        _a.sent();
                        // Perform initial health check
                        return [4 /*yield*/, this.performHealthCheck(environment)];
                    case 2:
                        // Perform initial health check
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BlueGreenDeployment.prototype.stopEnvironment = function (env) {
        return __awaiter(this, void 0, void 0, function () {
            var environment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        environment = env === 'blue' ? this.blue : this.green;
                        if (!environment.server) return [3 /*break*/, 2];
                        if (this.monitoringInterval) {
                            clearTimeout(this.monitoringInterval);
                            this.monitoringInterval = null;
                        }
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                environment.server.close(function (err) {
                                    if (err)
                                        reject(err);
                                    else
                                        resolve();
                                });
                            })];
                    case 1:
                        _a.sent();
                        environment.server = null;
                        environment.status = 'inactive';
                        environment.healthStatus = 'unknown';
                        console.log("".concat(env, " environment stopped"));
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BlueGreenDeployment.prototype.getDeploymentHistory = function () {
        return this.deploymentHistory;
    };
    return BlueGreenDeployment;
}());
exports.blueGreenDeployment = new BlueGreenDeployment();
exports.default = exports.blueGreenDeployment;
