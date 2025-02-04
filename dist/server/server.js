"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const pg_1 = require("pg");
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const routes_1 = __importDefault(require("./routes"));
const auth_1 = __importDefault(require("./middleware/auth"));
const app = (0, express_1.default)();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 3003);
// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        environment,
        timestamp: new Date().toISOString()
    });
});
// Configure middleware
app.use((0, morgan_1.default)(isProduction ? 'combined' : 'dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
// CORS configuration
const corsOptions = {
    origin: isProduction
        ? ['https://gosolo.nyc']
        : ['http://localhost:3000', 'http://0.0.0.0:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'development_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
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
        createTableIfMissing: true
    });
}
app.use((0, express_session_1.default)(sessionConfig));
app.use(auth_1.default.initialize());
app.use(auth_1.default.session());
// API Routes - all API routes should be prefixed with /api
app.use('/api', routes_1.default);
// Development specific middleware
if (!isProduction) {
    // In development, proxy requests to the Vite dev server
    app.use('/', (req, res, next) => {
        if (req.url.startsWith('/api')) {
            return next();
        }
        // Proxy to Vite dev server
        res.redirect(`http://localhost:3000${req.url}`);
    });
}
else {
    // Serve static files in production
    const clientDir = path_1.default.resolve(__dirname, '../client');
    app.use(express_1.default.static(clientDir, {
        maxAge: '1y',
        etag: true
    }));
    // Handle client-side routing
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            res.status(404).json({ error: 'API endpoint not found' });
            return;
        }
        res.sendFile(path_1.default.join(clientDir, 'index.html'));
    });
}
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: isProduction ? 'Internal Server Error' : err.message,
        timestamp: new Date().toISOString()
    });
});
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT} (${environment} mode)`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map