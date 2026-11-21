import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'data', 'db.json');

export interface Decision {
  id: string;
  text: string;
  timestamp: string;
  superseded?: boolean;
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  completed?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  decisions: Decision[];
  tasks: Task[];
}

export interface DB {
  meetings: Meeting[];
  tasks: Task[];
  stagedBatch: any;
  reminders: any[];
  weeklyDigests: Record<string, any>;
}

let inMemoryDB: DB | null = null;

export async function readDB(): Promise<DB> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    const parsed = JSON.parse(data) as DB;
    inMemoryDB = parsed; // cache
    return parsed;
  } catch (e) {
    if (inMemoryDB) {
      return inMemoryDB;
    }
    throw e;
  }
}

export async function writeDB(db: DB): Promise<void> {
  try {
    const json = JSON.stringify(db, null, 2);
    await fs.writeFile(dbPath, json, 'utf-8');
    inMemoryDB = db; // keep cache updated
  } catch (e) {
    // On read‑only FS (e.g., Vercel), fall back to in‑memory DB
    inMemoryDB = db;
    // Optionally log the error for debugging
    console.error('writeDB fallback to memory due to error:', e);
  }
}

export const seedDB = async () => {
  const seed: DB = {
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

