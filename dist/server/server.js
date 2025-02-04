"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueGreenDeployment = exports.startServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = __importDefault(require("fs"));
const pg_1 = require("pg");
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const routes_1 = __importDefault(require("./routes"));
const auth_1 = __importDefault(require("./middleware/auth"));
const blueGreenDeployment = __importStar(require("./deployment/blue-green"));
exports.blueGreenDeployment = blueGreenDeployment;
const app = (0, express_1.default)();
exports.app = app;
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 3003);
// Debug middleware to log all requests with more details
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Environment:', environment);
    console.log('Port:', PORT);
    if (!isProduction) {
        console.log('Headers:', req.headers);
    }
    next();
});
// Add health check endpoint before any other middleware
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        environment: process.env.DEPLOYMENT_COLOR || 'blue',
        timestamp: new Date().toISOString()
    });
});
// Middleware setup
app.use((0, morgan_1.default)(isProduction ? 'combined' : 'dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
// Add CORS configuration
const corsOrigins = [
    ...(isProduction ? ['https://gosolo.nyc'] : []),
    ...(isStaging ? ['https://staging.gosolo.nyc'] : []),
    ...(!isProduction ? [
        'http://localhost:3000',
        'http://localhost:3003',
        'http://localhost:5000',
        'http://0.0.0.0:3000',
        'http://0.0.0.0:3003',
        'http://0.0.0.0:5000'
    ] : []),
    /\.repl\.co$/,
    /\.replit\.dev$/,
    /\.repl\.co:\d+$/,
    /\.replit\.dev:\d+$/
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        try {
            const isAllowed = corsOrigins.some(allowedOrigin => {
                if (allowedOrigin instanceof RegExp) {
                    return allowedOrigin.test(origin);
                }
                return allowedOrigin === origin;
            });
            if (isAllowed) {
                callback(null, true);
            }
            else {
                console.log('Blocked by CORS:', origin);
                callback(new Error('Not allowed by CORS'));
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
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'temporary_staging_secret_key_123',
    resave: false,
    saveUninitialized: false,
    name: 'solo.sid',
    cookie: {
        secure: isProduction || isStaging,
        httpOnly: true,
        sameSite: (isProduction || isStaging ? 'strict' : 'lax'),
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};
if (isProduction) {
    const PostgreSQLStore = (0, connect_pg_simple_1.default)(express_session_1.default);
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    sessionConfig.store = new PostgreSQLStore({
        pool,
        createTableIfMissing: true,
        tableName: 'session'
    });
}
app.use((0, express_session_1.default)(sessionConfig));
// Initialize passport after session middleware
app.use(auth_1.default.initialize());
app.use(auth_1.default.session());
// API Routes
app.use('/api', routes_1.default);
// Serve static files in production/staging
if (isProduction || isStaging) {
    const rootDir = path_1.default.resolve(__dirname, '../..');
    const distDir = path_1.default.join(rootDir, 'dist');
    console.log('Static files directory:', distDir);
    app.use(express_1.default.static(distDir, {
        index: false,
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
            else if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
            else if (filePath.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html');
            }
            if (filePath.includes('/assets/')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
            }
        }
    }));
    // Serve index.html for client-side routing
    app.get('*', (req, res) => {
        const indexPath = path_1.default.join(distDir, 'index.html');
        try {
            if (req.path.startsWith('/api')) {
                res.status(404).json({ error: 'API endpoint not found' });
                return;
            }
            const indexContent = fs_1.default.readFileSync(indexPath, 'utf-8');
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
app.use((err, _req, res, _next) => {
    console.error('Server Error:', {
        message: err.message,
        stack: !isProduction ? err.stack : undefined
    });
    res.status(500).json({
        error: isProduction ? 'Internal Server Error' : err.message
    });
});
// Function to start the server
const startServer = async () => {
    try {
        if (isProduction) {
            const deploymentColor = process.env.DEPLOYMENT_COLOR || 'blue';
            console.log(`Starting ${deploymentColor} environment on port ${PORT}`);
            await blueGreenDeployment.startEnvironment(app, deploymentColor);
            return blueGreenDeployment.getActiveEnvironment().server;
        }
        else {
            return new Promise((resolve) => {
                const server = app.listen(PORT, '0.0.0.0', () => {
                    console.log(`Server running on http://0.0.0.0:${PORT}`);
                    console.log('Environment:', environment);
                    resolve(server);
                });
            });
        }
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
// Start the server if this file is run directly
if (require.main === module) {
    startServer().catch((error) => {
        console.error('Server failed to start:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=server.js.map