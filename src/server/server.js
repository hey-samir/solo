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
var _this = this;
var express = require('express');
var cors = require('cors');
var dotenv = require('dotenv');
var path = require('path');
var postgres = require('postgres');
var drizzle = require('drizzle-orm/postgres-js').drizzle;
var schema = require('./db/schema');
var eq = require('drizzle-orm').eq;
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
            /\.repl\.co$/,
            /\.replit\.dev$/,
            /^https?:\/\/localhost/,
            /^http?:\/\/localhost/,
            /^https?:\/\/127\.0\.0\.1/,
            /^http?:\/\/127\.0\.0\.1/
        ];
        var isAllowed = allowedDomains.some(function (domain) { return domain.test(origin); });
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
// Serve static files from the dist directory
var distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);
// MIME type mapping
var mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'application/font-woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
};
// Serve static files with proper MIME types
app.use(express.static(distPath, {
    index: false,
    setHeaders: function (res, filePath) {
        var ext = path.extname(filePath).toLowerCase();
        var contentType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        if (ext === '.html') {
            res.setHeader('Cache-Control', 'no-cache');
        }
        else {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));
// API Routes
app.get('/api/health', function (_req, res) {
    res.json({ status: 'healthy' });
});
// User routes
app.get('/api/user/:username', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
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
app.get('/api/climbs', function (_req, res, next) { return __awaiter(_this, void 0, void 0, function () {
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
app.get('/api/routes', function (_req, res, next) { return __awaiter(_this, void 0, void 0, function () {
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
// Catch-all route handler for the SPA
app.get('*', function (req, res, next) {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    var indexPath = path.join(distPath, 'index.html');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexPath, function (err) {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});
// Error handling middleware
app.use(function (err, _req, res, _next) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
var PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', function () {
    console.log("Server running on port ".concat(PORT, " in ").concat(process.env.NODE_ENV || 'development', " mode"));
    console.log('Static files being served from:', distPath);
}).on('error', function (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
});
module.exports = { db: db };
