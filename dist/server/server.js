"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = parseInt(process.env.PORT || (isProduction ? '80' : '3000'), 10);
// Basic middleware setup
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev')); // Add logging
// Import routes
try {
    app.use('/api', routes_1.default);
}
catch (error) {
    console.error('Error loading routes:', error);
    process.exit(1);
}
// Health check endpoint (available in all environments)
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        environment,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Serve static files in production/staging
if (isProduction || isStaging) {
    const staticPath = path_1.default.resolve(__dirname, '../../dist/client');
    console.log(`[${environment}] Configuring static files from: ${staticPath}`);
    console.log('Current directory:', process.cwd());
    console.log('__dirname:', __dirname);
    // Verify the static directory exists
    if (!fs_1.default.existsSync(staticPath)) {
        console.error(`Error: Static directory not found at ${staticPath}`);
        console.error('Build process may have failed or not been run');
        process.exit(1);
    }
    console.log('Static directory verified successfully');
    // Serve static files with specific options
    app.use(express_1.default.static(staticPath, {
        etag: true, // Enable ETag for caching
        lastModified: true,
        maxAge: '1h' // Cache static assets for 1 hour
    }));
    // Handle client-side routing - must come after static file serving
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(staticPath, 'index.html'), (err) => {
            if (err) {
                console.error('Error sending index.html:', err);
                res.status(500).send('Error loading application');
            }
        });
    });
}
// Enhanced error handler
app.use((err, _req, res, _next) => {
    console.error('[Server Error]:', err);
    res.status(500).json({
        error: isProduction ? 'Internal Server Error' : err.message,
        timestamp: new Date().toISOString(),
        path: _req.path
    });
});
// Only start the server if this file is run directly
if (require.main === module) {
    try {
        console.log(`[${environment}] Starting server on port ${PORT}...`);
        console.log('Current working directory:', process.cwd());
        console.log('Available files in current directory:');
        console.log(fs_1.default.readdirSync('.'));
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('='.repeat(50));
            console.log(`Server started in ${environment} mode`);
            console.log(`Listening on http://0.0.0.0:${PORT}`);
            console.log(`Process ID: ${process.pid}`);
            console.log(`Node version: ${process.version}`);
            console.log(`Current directory: ${process.cwd()}`);
            console.log('='.repeat(50));
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM signal, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            server.close(() => {
                console.log('Server closed due to uncaught exception');
                process.exit(1);
            });
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            server.close(() => {
                console.log('Server closed due to unhandled rejection');
                process.exit(1);
            });
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
exports.default = app;
