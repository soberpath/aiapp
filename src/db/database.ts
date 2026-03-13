import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('nextlogicai.db');
    await initializeSchema(db);
  }
  return db;
}

async function initializeSchema(db: SQLite.SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      industry TEXT DEFAULT '',
      email TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'active',
      currentPhase TEXT DEFAULT 'discovery',
      progress INTEGER DEFAULT 0,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      phase TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      taskOrder INTEGER DEFAULT 0,
      dueDate TEXT,
      assignedTo TEXT,
      notes TEXT,
      aiContent TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (clientId) REFERENCES clients(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      businessName TEXT NOT NULL,
      industry TEXT,
      location TEXT,
      website TEXT,
      contactName TEXT,
      contactEmail TEXT,
      phone TEXT,
      notes TEXT,
      aiScore INTEGER,
      aiSummary TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
