"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const auth_1 = __importDefault(require("./middleware/auth"));
// Initialize express app
const app = (0, express_1.default)();
exports.app = app;
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = Number(process.env.PORT || 5000);
// Basic middleware setup with enhanced logging
app.use((0, morgan_1.default)(isProduction ? 'combined' : 'dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
// Enhanced error logging
console.log('Environment:', environment);
console.log('Session Secret Available:', !!process.env.SESSION_SECRET);
console.log('Database URL Available:', !!process.env.DATABASE_URL);
// CORS configuration
const corsOrigins = (() => {
    if (isProduction)
        return ['https://gosolo.nyc'];
    if (isStaging)
        return process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ['https://staging.gosolo.nyc'];
    return ['http://localhost:3003'];
})();
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Session configuration with enhanced security for staging
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'temporary_staging_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction || isStaging,
        httpOnly: true,
        sameSite: isProduction || isStaging ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
};
// Apply session configuration
app.use((0, express_session_1.default)(sessionConfig));
// Initialize Passport
app.use(auth_1.default.initialize());
app.use(auth_1.default.session());
// Routes setup
app.use('/api', routes_1.default);
// Static file serving with improved error handling
if (isProduction || isStaging) {
    const distPath = path_1.default.resolve(__dirname, '..', '..');
    app.use(express_1.default.static(path_1.default.join(distPath, 'dist'), {
        maxAge: '1d',
        index: false,
        etag: true
    }));
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            environment,
            config: {
                corsOrigins,
                hasDb: !!process.env.DATABASE_URL,
                hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
                hasSession: true
            }
        });
    });
    // Serve index.html for all non-API routes with improved error handling
    app.get('*', (req, res) => {
        try {
            if (req.path.startsWith('/api')) {
                res.status(404).json({ error: 'API endpoint not found' });
            }
            else {
                res.sendFile(path_1.default.join(distPath, 'dist', 'index.html'));
            }
        }
        catch (error) {
            console.error('Error serving static file:', error);
            res.status(500).json({ error: 'Internal server error', details: !isProduction ? error.message : undefined });
        }
    });
}
else {
    app.get('*', (req, res) => {
        res.redirect(`http://localhost:3003${req.path}`);
    });
}
// Enhanced error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        error: isProduction ? 'Internal Server Error' : err.message,
        details: !isProduction ? err.stack : undefined
    });
});
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
        console.log('Environment:', environment);
        console.log('CORS Origins:', corsOrigins);
    });
}
//# sourceMappingURL=server.js.map