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
exports.isAuthenticated = void 0;
var passport_1 = require("passport");
var passport_google_oauth20_1 = require("passport-google-oauth20");
var db_1 = require("../db");
var schema_1 = require("../db/schema");
var drizzle_orm_1 = require("drizzle-orm");
// Will be replaced by actual credentials from environment variables
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Passport Google OAuth strategy setup
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://gosolo.nyc/auth/google/callback'
        : 'http://localhost:5000/auth/google/callback',
    scope: ['profile', 'email']
}, function (_accessToken, _refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
    var existingUser, newUser, error_1;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                console.log('Google OAuth callback:', { profile_id: profile.id });
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.users)
                        .where((0, drizzle_orm_1.eq)(schema_1.users.email, (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value))
                        .limit(1)];
            case 1:
                existingUser = _d.sent();
                if (existingUser.length > 0) {
                    console.log('Existing user found:', existingUser[0].id);
                    return [2 /*return*/, done(null, existingUser[0])];
                }
                return [4 /*yield*/, db_1.db
                        .insert(schema_1.users)
                        .values({
                        username: profile.displayName,
                        name: profile.displayName,
                        email: (_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value,
                        profile_photo: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                        password_hash: '', // Google auth doesn't need password
                        created_at: new Date(),
                        member_since: new Date(),
                        user_type: 'user'
                    })
                        .returning()];
            case 2:
                newUser = (_d.sent())[0];
                console.log('New user created:', newUser.id);
                return [2 /*return*/, done(null, newUser)];
            case 3:
                error_1 = _d.sent();
                console.error('OAuth error:', error_1);
                return [2 /*return*/, done(error_1)];
            case 4: return [2 /*return*/];
        }
    });
}); }));
// Serialize user for the session
passport_1.default.serializeUser(function (user, done) {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});
// Deserialize user from the session
passport_1.default.deserializeUser(function (id, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('Deserializing user:', id);
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.users)
                        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                        .limit(1)];
            case 1:
                user = (_a.sent())[0];
                if (!user) {
                    console.error('User not found during deserialization:', id);
                    return [2 /*return*/, done(null, false)];
                }
                done(null, user);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Deserialization error:', error_2);
                done(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Middleware to check if user is authenticated
var isAuthenticated = function (req, res, next) {
    var _a;
    console.log('Auth check:', {
        isAuthenticated: req.isAuthenticated(),
        user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        session: req.session
    });
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};
exports.isAuthenticated = isAuthenticated;
exports.default = passport_1.default;
