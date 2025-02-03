"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var schema_1 = require("./schema");
// Use the DATABASE_URL from environment variables
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}
// Database configuration
var config = {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10
};
// Create the connection
var client = (0, postgres_1.default)(connectionString, config);
// Create the database instance
var db = (0, postgres_js_1.drizzle)(client, { schema: schema_1.default });
exports.db = db;
