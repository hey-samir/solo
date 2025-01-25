var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var express = require('express');
var cors = require('cors');
var dotenv = require('dotenv');
var path = require('path');
var postgres = require('postgres');
var drizzle = require('drizzle-orm/postgres-js').drizzle;
var schema = require('./db/schema');
var eq = require('drizzle-orm').eq;
const session = require('express-session');
const passport = require('./middleware/auth').default;
const authRoutes = require('./routes/auth').default;

dotenv.config();

// Initialize express app
var app = express();

// Database setup
var db;
try {
    console.log('Connecting to database...');
    var client = postgres(process.env.DATABASE_URL, {
        max: 20,
        idle_timeout: 30,
        connect_timeout: 10,
    });
    db = drizzle(client);
    console.log('Database connection successful');
}
catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
}

// CORS Configuration
var corsOptions = {
    origin: function (origin, callback) {
        if (!origin || process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
        }
        var allowedDomains = [
            'https://gosolo.nyc',
            /\.repl\.co$/,
            /\.replit\.dev$/,
            /^https?:\/\/localhost/,
        ];
        var isAllowed = allowedDomains.some(function (domain) { 
            return typeof domain === 'string' ? domain === origin : domain.test(origin); 
        });
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/auth', authRoutes);

// Serve static files from the dist directory
var distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

app.use(express.static(distPath, {
    fallthrough: true // Allow falling through to next middleware if file not found
}));

// SPA fallback
app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});


// API Routes
app.get('/api/health', function (_req, res) {
    res.json({ status: 'healthy' });
});
// User routes
app.get('/api/user/:username', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var username, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                username = req.params.username;
                return [4 /*yield*/, db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1)];
            case 1:
                user = _a.sent();
                if (!user || user.length === 0) {
                    res.status(404).json({ error: 'User not found' });
                    return [2 /*return*/];
                }
                res.json({
                    id: user[0].id,
                    username: user[0].username,
                    profilePhoto: user[0].profilePhoto,
                    memberSince: user[0].memberSince,
                    gymId: user[0].gymId
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching user:', error_1);
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Climbs routes
app.get('/api/climbs', function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userClimbs, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db.select().from(schema.climbs)];
            case 1:
                userClimbs = _a.sent();
                res.json(userClimbs);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching climbs:', error_2);
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Routes routes
app.get('/api/routes', function (_req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userRoutes, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db.select().from(schema.routes)];
            case 1:
                userRoutes = _a.sent();
                res.json(userRoutes);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error fetching routes:', error_3);
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });

// Error handling
app.use(function (err, _req, res, _next) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

var PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', function () {
    console.log("Server running on port " + PORT + " in " + (process.env.NODE_ENV || 'development') + " mode");
}).on('error', function (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = { db: db };