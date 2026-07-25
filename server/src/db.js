import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bossgacha.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS player_saves (
    user_id INTEGER PRIMARY KEY,
    save_data TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export function createUser(username, password, displayName) {
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
    )
    .run(username, hash, displayName || username);
  return getUserById(info.lastInsertRowid);
}

export function findUserByUsername(username) {
  return db
    .prepare('SELECT * FROM users WHERE lower(username) = lower(?)')
    .get(String(username).trim());
}

export function getUserById(id) {
  return db
    .prepare(
      `SELECT id, username, display_name AS displayName, created_at AS createdAt
       FROM users WHERE id = ?`
    )
    .get(id);
}

export function verifyPassword(userRow, password) {
  return bcrypt.compareSync(password, userRow.password_hash);
}

export function getSave(userId) {
  const row = db
    .prepare('SELECT save_data AS saveData, updated_at AS updatedAt FROM player_saves WHERE user_id = ?')
    .get(userId);
  if (!row) return null;
  try {
    return { data: JSON.parse(row.saveData), updatedAt: row.updatedAt };
  } catch {
    return { data: {}, updatedAt: row.updatedAt };
  }
}

export function upsertSave(userId, saveData) {
  const json = JSON.stringify(saveData ?? {});
  db.prepare(
    `INSERT INTO player_saves (user_id, save_data, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       save_data = excluded.save_data,
       updated_at = datetime('now')`
  ).run(userId, json);
  return getSave(userId);
}
