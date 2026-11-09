import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DB_DIR = process.env.MEMORY_DB_DIR || join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'memory.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  statement TEXT NOT NULL,
  type TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'long_term',
  importance_score INTEGER NOT NULL DEFAULT 3,
  confidence_score INTEGER NOT NULL DEFAULT 90,
  sensitivity_level TEXT NOT NULL DEFAULT 'personal',
  source_type TEXT NOT NULL DEFAULT 'manual',
  why_saved TEXT,
  is_verified_fact INTEGER NOT NULL DEFAULT 1,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS memories_type_idx ON memories(type);
CREATE INDEX IF NOT EXISTS memories_tier_idx ON memories(tier);
CREATE INDEX IF NOT EXISTS memories_created_idx ON memories(created_at DESC);

CREATE TABLE IF NOT EXISTS commitments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner TEXT NOT NULL DEFAULT 'Me',
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  related_project TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS commitments_status_idx ON commitments(status);
`;

let database: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (database) return database;
  mkdirSync(DB_DIR, { recursive: true });
  database = new DatabaseSync(DB_PATH);
  database.exec('PRAGMA journal_mode = WAL');
  database.exec(SCHEMA);
  return database;
}

export const dbPath = DB_PATH;
