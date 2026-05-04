import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

type DB = ReturnType<typeof Database>;

declare global {
  // eslint-disable-next-line no-var
  var __meetingsDb: DB | undefined;
}

function open(): DB {
  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, 'meetings.db'));
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      participants TEXT NOT NULL,
      purpose TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

function getDb(): DB {
  if (!globalThis.__meetingsDb) {
    globalThis.__meetingsDb = open();
  }
  return globalThis.__meetingsDb;
}

const proxy = new Proxy({} as DB, {
  get(_target, prop) {
    const db = getDb();
    const value = (db as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(db) : value;
  },
});

export default proxy;
