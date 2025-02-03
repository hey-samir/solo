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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueGreenDeployment = exports.startServer = exports.app = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var express_session_1 = require("express-session");
var compression_1 = require("compression");
var morgan_1 = require("morgan");
var cookie_parser_1 = require("cookie-parser");
var fs_1 = require("fs");
var routes_1 = require("./routes");
var auth_1 = require("./middleware/auth");
var blue_green_1 = require("./deployment/blue-green");
exports.blueGreenDeployment = blue_green_1.default;
var app = (0, express_1.default)();
exports.app = app;
var environment = process.env.NODE_ENV || 'development';
var isProduction = environment === 'production';
var isStaging = environment === 'staging';
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 5000);
// Add health check endpoint
app.get('/health', function (req, res) {
    res.status(200).json({ status: 'healthy', environment: process.env.DEPLOYMENT_COLOR || 'blue' });
});
// Debug middleware to log all requests with more details
app.use(function (req, res, next) {
    console.log("[".concat(new Date().toISOString(), "] ").concat(req.method, " ").concat(req.url));
    if (!isProduction) {
        console.log('Headers:', req.headers);
    }
    next();
});
// Middleware setup
app.use((0, morgan_1.default)(isProduction ? 'combined' : 'dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
// Add CORS configuration
var corsOrigins = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], (isProduction ? ['https://gosolo.nyc'] : []), true), (isStaging ? ['https://staging.gosolo.nyc'] : []), true), (!isProduction ? [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:5000'
] : []), true), [
    /\.repl\.co$/,
    /\.replit\.dev$/,
    /\.repl\.co:\d+$/,
    /\.replit\.dev:\d+$/
], false);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin) {
            callback(null, true);
            return;
        }
        try {
            var originWithoutProtocol = origin.replace(/^https?:\/\//, '');
            var baseOrigin = originWithoutProtocol.split(':')[0];
            var isAllowed = corsOrigins.some(function (allowedOrigin) {
                if (allowedOrigin instanceof RegExp) {
                    return allowedOrigin.test(origin);
                }
                return allowedOrigin === origin;
            });
            if (isAllowed) {
                callback(null, true);
            }
            else {
                var error = new Error('Not allowed by CORS');
                console.log('Blocked by CORS:', origin);
                callback(error);
            }
        }
        catch (error) {
            console.error('CORS validation error:', error);
            callback(error instanceof Error ? error : new Error('CORS validation failed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Session configuration
var sessionConfig = {
    secret: process.env.SESSION_SECRET || 'temporary_staging_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction || isStaging,
        httpOnly: true,
        sameSite: (isProduction || isStaging ? 'strict' : 'lax'),
        maxAge: 24 * 60 * 60 * 1000
    }
};
if (isProduction) {
    var PostgreSQLStore = require('connect-pg-simple')(express_session_1.default);
    sessionConfig.store = new PostgreSQLStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
    });
}
app.use((0, express_session_1.default)(sessionConfig));
app.use(auth_1.default.initialize());
app.use(auth_1.default.session());
// API Routes
app.use('/api', routes_1.default);
// Serve static files in production/staging
if (isProduction || isStaging) {
    var rootDir = path_1.default.resolve(__dirname, '../..');
    var distDir_1 = path_1.default.join(rootDir, 'dist');
    // Serve static files with caching
    app.use(express_1.default.static(distDir_1, {
        index: false,
        etag: true,
        lastModified: true,
        setHeaders: function (res, filePath) {
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
            else if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
            else if (filePath.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html');
            }
            // Cache assets for 1 year
            if (filePath.includes('/assets/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
            }
        }
    }));
    // Handle all other routes by serving index.html
    app.get('*', function (req, res) {
        if (req.path.startsWith('/api')) {
            res.status(404).json({ error: 'API endpoint not found' });
            return;
        }
        var indexPath = path_1.default.join(distDir_1, 'index.html');
        try {
            var indexContent = fs_1.default.readFileSync(indexPath, 'utf-8');
            res.set('Content-Type', 'text/html');
            res.send(indexContent);
        }
        catch (error) {
            console.error('Error reading index.html:', error);
            res.status(500).send('Internal Server Error');
        }
    });
}
// Error handler
app.use(function (err, _req, res, _next) {
    console.error('Server Error:', {
        message: err.message,
        stack: !isProduction ? err.stack : undefined
    });
    res.status(500).json({
        error: isProduction ? 'Internal Server Error' : err.message
    });
});
// Update the startServer function to support blue-green deployment
var startServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var deploymentColor, PORT_1, server, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                console.log('Starting server with configuration:');
                console.log('Environment:', environment);
                if (!isProduction) return [3 /*break*/, 2];
                deploymentColor = process.env.DEPLOYMENT_COLOR || 'blue';
                console.log("Starting ".concat(deploymentColor, " environment"));
                return [4 /*yield*/, blue_green_1.default.startEnvironment(app, deploymentColor)];
            case 1:
                _a.sent();
                return [2 /*return*/, blue_green_1.default.getActiveEnvironment().server];
            case 2:
                PORT_1 = process.env.PORT ? parseInt(process.env.PORT, 10) : (isStaging ? 5000 : 3003);
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var server = app.listen(PORT_1, '0.0.0.0', function () {
                            console.log("Server running on http://0.0.0.0:".concat(PORT_1));
                            console.log('Environment:', environment);
                            console.log('API Routes mounted at /api');
                            resolve(server);
                        });
                        server.on('error', function (error) {
                            console.error('Server failed to start:', error);
                            reject(error);
                        });
                    })];
            case 3:
                server = _a.sent();
                return [2 /*return*/, server];
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Failed to start server:', error_1);
                process.exit(1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.startServer = startServer;
// Only start the server if this file is run directly
if (require.main === module) {
    startServer().catch(function (error) {
        console.error('Server failed to start:', error);
        process.exit(1);
    });
}
