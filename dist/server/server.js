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
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const auth_1 = __importDefault(require("./middleware/auth"));
const pg_1 = require("pg");
const app = (0, express_1.default)();
exports.app = app;
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 5000);
// Basic middleware
app.use((0, morgan_1.default)(isProduction ? 'combined' : 'dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins in development and production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// PostgreSQL session store setup
const PostgresqlStore = (0, connect_pg_simple_1.default)(express_session_1.default);
const sessionPool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Session configuration with PostgreSQL store
app.use((0, express_session_1.default)({
    store: new PostgresqlStore({
        pool: sessionPool,
        tableName: 'user_sessions'
    }),
    secret: process.env.SESSION_SECRET || 'development-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Initialize Passport
app.use(auth_1.default.initialize());
app.use(auth_1.default.session());
// API Routes
app.use('/api', routes_1.default);
// Serve static files and handle client routing
if (isProduction) {
    // Production: serve from dist
    const distPath = path_1.default.join(__dirname, '../../../dist');
    app.use(express_1.default.static(distPath, {
        index: false, // Don't serve index.html for all routes
        maxAge: '1d' // Cache static assets for 1 day
    }));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(distPath, 'index.html'));
    });
}
else {
    // Development: redirect to dev server
    app.get('/', (_req, res) => {
        res.redirect('http://localhost:3003');
    });
    app.get('*', (req, res) => {
        res.redirect(`http://localhost:3003${req.path}`);
    });
}
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// Start server only if this file is run directly
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
        console.log('Environment:', process.env.NODE_ENV);
    });
}
