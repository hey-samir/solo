"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema_1 = __importDefault(require("./schema"));
// Use the DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// Database configuration
const config = {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10
};
// Create the connection
const client = (0, postgres_1.default)(connectionString, config);
// Create the database instance
const db = (0, postgres_js_1.drizzle)(client, { schema: schema_1.default });
exports.db = db;
//# sourceMappingURL=index.js.map