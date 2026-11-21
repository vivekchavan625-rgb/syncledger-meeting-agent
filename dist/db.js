"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDB = void 0;
exports.readDB = readDB;
exports.writeDB = writeDB;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, '..', 'data', 'db.json');
let inMemoryDB = null;
async function readDB() {
    try {
        const data = await fs_1.promises.readFile(dbPath, 'utf-8');
        const parsed = JSON.parse(data);
        inMemoryDB = parsed; // cache
        return parsed;
    }
    catch (e) {
        if (inMemoryDB) {
            return inMemoryDB;
        }
        throw e;
    }
}
async function writeDB(db) {
    try {
        const json = JSON.stringify(db, null, 2);
        await fs_1.promises.writeFile(dbPath, json, 'utf-8');
        inMemoryDB = db; // keep cache updated
    }
    catch (e) {
        // On read‑only FS (e.g., Vercel), fall back to in‑memory DB
        inMemoryDB = db;
        // Optionally log the error for debugging
        console.error('writeDB fallback to memory due to error:', e);
    }
}
const seedDB = async () => {
    const seed = {
        meetings: [
            {
                id: 'm1',
                title: 'Product Kickoff Sync',
                date: '2026-11-15',
                decisions: [
                    { id: 'd1', text: 'Launch date locked for Friday', timestamp: '2026-11-15T10:00:00Z' },
                    { id: 'd2', text: 'OAuth/Google SSO selected for authentication', timestamp: '2026-11-15T10:15:00Z' }
                ],
                tasks: [
                    { id: 't1', title: 'Prepare launch checklist', owner: 'alice', deadline: '2026-11-20' }
                ]
            }
        ],
        tasks: [
            { id: 't1', title: 'Prepare launch checklist', owner: 'alice', deadline: '2026-11-20', completed: false }
        ],
        stagedBatch: null,
        reminders: [],
        weeklyDigests: {}
    };
    await writeDB(seed);
};
exports.seedDB = seedDB;
