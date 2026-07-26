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
    stages_cleared INTEGER NOT NULL DEFAULT 0,
    unique_monsters INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

migrateLeaderboardColumns();
backfillLeaderboardStats();

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

function migrateLeaderboardColumns() {
  const cols = new Set(tableColumns('player_saves'));
  if (!cols.has('stages_cleared')) {
    db.exec('ALTER TABLE player_saves ADD COLUMN stages_cleared INTEGER NOT NULL DEFAULT 0');
  }
  if (!cols.has('unique_monsters')) {
    db.exec('ALTER TABLE player_saves ADD COLUMN unique_monsters INTEGER NOT NULL DEFAULT 0');
  }
  if (!cols.has('wins')) {
    db.exec('ALTER TABLE player_saves ADD COLUMN wins INTEGER NOT NULL DEFAULT 0');
  }
}

export function computeLeaderboardStats(saveData) {
  const data = saveData && typeof saveData === 'object' ? saveData : {};
  const dungeonLevel = Number(data.dungeonLevel) || 1;
  const stagesCleared = Math.min(Math.max(dungeonLevel - 1, 0), 40);


  const owned = new Set();
  for (const id of data.ownedEver || []) {
    if (id) owned.add(String(id));
  }
  const inv = data.inventory || {};
  for (const [id, count] of Object.entries(inv)) {
    if ((Number(count) || 0) > 0) owned.add(String(id));
  }

  const wins = Number(data.stats?.wins) || 0;
  return {
    stagesCleared,
    uniqueMonsters: owned.size,
    wins,
  };
}

function backfillLeaderboardStats() {
  const rows = db.prepare('SELECT user_id, save_data FROM player_saves').all();
  const upd = db.prepare(
    `UPDATE player_saves
     SET stages_cleared = ?, unique_monsters = ?, wins = ?
     WHERE user_id = ?`
  );
  const tx = db.transaction(() => {
    for (const row of rows) {
      let data = {};
      try {
        data = JSON.parse(row.save_data || '{}');
      } catch {
        data = {};
      }
      const stats = computeLeaderboardStats(data);
      upd.run(stats.stagesCleared, stats.uniqueMonsters, stats.wins, row.user_id);
    }
  });
  tx();
}

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
  const stats = computeLeaderboardStats(saveData);
  db.prepare(
    `INSERT INTO player_saves (user_id, save_data, updated_at, stages_cleared, unique_monsters, wins)
     VALUES (?, ?, datetime('now'), ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       save_data = excluded.save_data,
       updated_at = datetime('now'),
       stages_cleared = excluded.stages_cleared,
       unique_monsters = excluded.unique_monsters,
       wins = excluded.wins`
  ).run(userId, json, stats.stagesCleared, stats.uniqueMonsters, stats.wins);
  return getSave(userId);
}

export function listLeaderboard(limit = 50) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 100);
  return db
    .prepare(
      `SELECT
         u.id,
         u.username,
         u.display_name AS displayName,
         COALESCE(s.stages_cleared, 0) AS stagesCleared,
         COALESCE(s.unique_monsters, 0) AS uniqueMonsters,
         COALESCE(s.wins, 0) AS wins,
         s.updated_at AS updatedAt
       FROM users u
       INNER JOIN player_saves s ON s.user_id = u.id
       ORDER BY
         s.stages_cleared DESC,
         s.unique_monsters DESC,
         s.wins DESC,
         s.updated_at ASC
       LIMIT ?`
    )
    .all(lim)
    .map((row, i) => ({
      rank: i + 1,
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      stagesCleared: row.stagesCleared,
      uniqueMonsters: row.uniqueMonsters,
      wins: row.wins,
      updatedAt: row.updatedAt,
    }));
}

export function getPublicProfile(username) {
  const user = findUserByUsername(username);
  if (!user) return null;

  const save = getSave(user.id);
  const data = save?.data || {};
  const stats = computeLeaderboardStats(data);

  const inventory = {};
  for (const [id, count] of Object.entries(data.inventory || {})) {
    const n = Number(count) || 0;
    if (n > 0) inventory[id] = n;
  }

  const ownedEver = Array.from(
    new Set([...(data.ownedEver || []).map(String), ...Object.keys(inventory)])
  );

  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    createdAt: user.created_at,
    stagesCleared: stats.stagesCleared,
    uniqueMonsters: stats.uniqueMonsters,
    wins: stats.wins,
    dungeonLevel: Number(data.dungeonLevel) || 1,
    selectedBossId: data.selectedBossId || null,
    ownedEver,
    inventory,
    monsterUpgrades: data.monsterUpgrades || {},
    updatedAt: save?.updatedAt || null,
  };
}
