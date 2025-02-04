"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const postgres_js_1 = require("drizzle-orm/postgres-js");
const migrator_1 = require("drizzle-orm/postgres-js/migrator");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
dotenv.config();
const runMigration = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
    }
    console.log('Starting migration process...');
    try {
        // Ensure drizzle directory exists
        const drizzleDir = path.join(process.cwd(), 'drizzle');
        if (!fs.existsSync(drizzleDir)) {
            fs.mkdirSync(drizzleDir);
        }
        // Ensure meta directory exists
        const metaDir = path.join(drizzleDir, 'meta');
        if (!fs.existsSync(metaDir)) {
            fs.mkdirSync(metaDir);
        }
        // Create _journal.json if it doesn't exist
        const journalPath = path.join(metaDir, '_journal.json');
        if (!fs.existsSync(journalPath)) {
            fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }));
        }
        const migrationClient = (0, postgres_1.default)(process.env.DATABASE_URL, { max: 1 });
        const db = (0, postgres_js_1.drizzle)(migrationClient);
        console.log('Running migrations...');
        await (0, migrator_1.migrate)(db, {
            migrationsFolder: 'drizzle'
        });
        console.log('Migrations completed successfully');
        await migrationClient.end();
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};
runMigration();
//# sourceMappingURL=migrate.js.map