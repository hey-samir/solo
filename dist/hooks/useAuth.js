"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
// Re-export the useAuth hook from the AuthContext to maintain a single source of truth
var AuthContext_1 = require("../contexts/AuthContext");
Object.defineProperty(exports, "useAuth", { enumerable: true, get: function () { return AuthContext_1.useAuth; } });
