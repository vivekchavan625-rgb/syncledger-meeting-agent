import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const dbPath = path.resolve(__dirname, '..', 'data', 'db.json');
const tmpDbPath = path.join(os.tmpdir(), 'syncledger-db.json');

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

const globalForDB = globalThis as unknown as { __syncledgerDB?: DB | null };
if (globalForDB.__syncledgerDB === undefined) {
  globalForDB.__syncledgerDB = null;
}

export async function readDB(): Promise<DB> {
  if (globalForDB.__syncledgerDB) {
    return globalForDB.__syncledgerDB;
  }

  try {
    const tmpData = await fs.readFile(tmpDbPath, 'utf-8');
    const parsedTmp = JSON.parse(tmpData) as DB;
    globalForDB.__syncledgerDB = parsedTmp;
    return parsedTmp;
  } catch {
    // Fallback to bundled seed/data file
  }

  const data = await fs.readFile(dbPath, 'utf-8');
  const parsed = JSON.parse(data) as DB;
  globalForDB.__syncledgerDB = parsed;
  return parsed;
}

export const getDB = readDB;

export async function writeDB(db: DB): Promise<void> {
  globalForDB.__syncledgerDB = db;
  const json = JSON.stringify(db, null, 2);

  try {
    await fs.writeFile(tmpDbPath, json, 'utf-8');
  } catch {
    // Ignore tmp write errors if restricted
  }

  try {
    await fs.writeFile(dbPath, json, 'utf-8');
  } catch {
    // Read-only FS on Vercel is expected; memory + /tmp handle persistence during warm/instance lifecycle
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
