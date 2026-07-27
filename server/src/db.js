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

  CREATE TABLE IF NOT EXISTS redeem_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL COLLATE NOCASE,
    label TEXT NOT NULL DEFAULT '',
    reward_json TEXT NOT NULL DEFAULT '{}',
    max_uses INTEGER,
    uses_count INTEGER NOT NULL DEFAULT 0,
    per_user_once INTEGER NOT NULL DEFAULT 1,
    active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS redeem_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    redeemed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(code_id, user_id),
    FOREIGN KEY (code_id) REFERENCES redeem_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

migrateLeaderboardColumns();
migrateAdminColumns();
backfillLeaderboardStats();

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

function migrateAdminColumns() {
  const cols = new Set(tableColumns('users'));
  if (!cols.has('is_admin')) {
    db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
  }
  if (!cols.has('is_banned')) {
    db.exec('ALTER TABLE users ADD COLUMN is_banned INTEGER NOT NULL DEFAULT 0');
  }
}

function userPublicRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName ?? row.display_name,
    createdAt: row.createdAt ?? row.created_at,
    isAdmin: !!(row.isAdmin ?? row.is_admin),
    isBanned: !!(row.isBanned ?? row.is_banned),
  };
}

export function ensureAdminAccount(username, password, displayName) {
  const u = String(username || '').trim();
  const p = String(password || '');
  if (!u || !p) return null;
  let row = findUserByUsername(u);
  if (!row) {
    createUser(u, p, displayName || 'Admin');
    row = findUserByUsername(u);
  } else if (p) {
    const hash = bcrypt.hashSync(p, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.id);
  }
  db.prepare('UPDATE users SET is_admin = 1, is_banned = 0 WHERE id = ?').run(row.id);
  return getUserById(row.id);
}

export function seedDefaultRedeemCodes() {
  const defaults = [
    { code: 'SEPTONGMOI', label: 'Quà SEPTONGMOI', reward: { souls: 1000 } },
    { code: 'BOSSGACHA', label: 'Quà BOSSGACHA', reward: { souls: 1000 } },
  ];
  const ins = db.prepare(
    `INSERT OR IGNORE INTO redeem_codes (code, label, reward_json, per_user_once, active)
     VALUES (?, ?, ?, 1, 1)`
  );
  for (const d of defaults) {
    ins.run(d.code, d.label, JSON.stringify(d.reward));
  }
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
  const stagesCleared = Math.min(Math.max(dungeonLevel - 1, 0), 60);


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
  const row = db
    .prepare(
      `SELECT id, username, display_name AS displayName, created_at AS createdAt,
              is_admin AS isAdmin, is_banned AS isBanned
       FROM users WHERE id = ?`
    )
    .get(id);
  return userPublicRow(row);
}

export function isUserAdmin(id) {
  const row = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(id);
  return !!row?.is_admin;
}

export function isUserBanned(id) {
  const row = db.prepare('SELECT is_banned FROM users WHERE id = ?').get(id);
  return !!row?.is_banned;
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

export function getAdminStats() {
  const users = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const saves = db.prepare('SELECT COUNT(*) AS n FROM player_saves').get().n;
  const codes = db.prepare('SELECT COUNT(*) AS n FROM redeem_codes WHERE active = 1').get().n;
  const redemptions = db.prepare('SELECT COUNT(*) AS n FROM redeem_redemptions').get().n;
  const banned = db.prepare('SELECT COUNT(*) AS n FROM users WHERE is_banned = 1').get().n;
  return { users, saves, codes, redemptions, banned };
}

export function listUsersAdmin({ q = '', limit = 50 } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const term = `%${String(q || '').trim()}%`;
  const rows = db
    .prepare(
      `SELECT u.id, u.username, u.display_name AS displayName, u.created_at AS createdAt,
              u.is_admin AS isAdmin, u.is_banned AS isBanned,
              COALESCE(s.stages_cleared, 0) AS stagesCleared,
              COALESCE(s.unique_monsters, 0) AS uniqueMonsters,
              COALESCE(s.wins, 0) AS wins,
              s.updated_at AS saveUpdatedAt
       FROM users u
       LEFT JOIN player_saves s ON s.user_id = u.id
       WHERE (? = '%%' OR u.username LIKE ? OR u.display_name LIKE ?)
       ORDER BY u.created_at DESC
       LIMIT ?`
    )
    .all(term === '%%' ? '%%' : term, term, term, lim);
  return rows.map((r) => ({
    ...userPublicRow(r),
    stagesCleared: r.stagesCleared,
    uniqueMonsters: r.uniqueMonsters,
    wins: r.wins,
    saveUpdatedAt: r.saveUpdatedAt,
  }));
}

export function getUserAdmin(id) {
  const user = getUserById(id);
  if (!user) return null;
  const save = getSave(id);
  return {
    user,
    save: save?.data || null,
    saveUpdatedAt: save?.updatedAt || null,
  };
}

export function patchUserAdmin(id, patch = {}) {
  const row = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!row) return null;

  if (patch.displayName != null) {
    db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(
      String(patch.displayName).trim() || 'Player',
      id
    );
  }
  if (patch.isBanned != null) {
    db.prepare('UPDATE users SET is_banned = ? WHERE id = ?').run(patch.isBanned ? 1 : 0, id);
  }
  if (patch.isAdmin != null) {
    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(patch.isAdmin ? 1 : 0, id);
  }

  const grant = patch.grant || {};
  const hasGrant = grant.souls || grant.gold || grant.gems;
  if (hasGrant || patch.resetSave) {
    const cur = getSave(id);
    let data = cur?.data && typeof cur.data === 'object' ? { ...cur.data } : {};
    if (patch.resetSave) {
      data = {
        souls: 500,
        gold: 0,
        gems: 0,
        inventory: {},
        ownedEver: [],
        dungeonLevel: 1,
        redeemedCodes: [],
        stats: { wins: 0, losses: 0 },
      };
    }
    if (grant.souls) data.souls = (Number(data.souls) || 0) + Number(grant.souls);
    if (grant.gold) data.gold = (Number(data.gold) || 0) + Number(grant.gold);
    if (grant.gems) data.gems = (Number(data.gems) || 0) + Number(grant.gems);
    upsertSave(id, data);
  }

  return getUserAdmin(id);
}

export function deleteUserAdmin(id) {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

export function listRedeemCodesAdmin() {
  return db
    .prepare(
      `SELECT id, code, label, reward_json AS rewardJson, max_uses AS maxUses,
              uses_count AS usesCount, per_user_once AS perUserOnce, active,
              expires_at AS expiresAt, created_at AS createdAt
       FROM redeem_codes ORDER BY created_at DESC`
    )
    .all()
    .map((r) => ({
      id: r.id,
      code: r.code,
      label: r.label,
      reward: JSON.parse(r.rewardJson || '{}'),
      maxUses: r.maxUses,
      usesCount: r.usesCount,
      perUserOnce: !!r.perUserOnce,
      active: !!r.active,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
    }));
}

export function createRedeemCodeAdmin(body) {
  const code = String(body.code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!code) throw new Error('Thiếu mã');
  const reward = body.reward || {};
  const info = db
    .prepare(
      `INSERT INTO redeem_codes (code, label, reward_json, max_uses, per_user_once, active, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      code,
      String(body.label || code).trim(),
      JSON.stringify(reward),
      body.maxUses == null || body.maxUses === '' ? null : Number(body.maxUses),
      body.perUserOnce === false ? 0 : 1,
      body.active === false ? 0 : 1,
      body.expiresAt || null
    );
  return listRedeemCodesAdmin().find((c) => c.id === info.lastInsertRowid);
}

export function updateRedeemCodeAdmin(id, body) {
  const cur = db.prepare('SELECT id FROM redeem_codes WHERE id = ?').get(id);
  if (!cur) return null;
  if (body.label != null) {
    db.prepare('UPDATE redeem_codes SET label = ? WHERE id = ?').run(String(body.label), id);
  }
  if (body.reward != null) {
    db.prepare('UPDATE redeem_codes SET reward_json = ? WHERE id = ?').run(
      JSON.stringify(body.reward),
      id
    );
  }
  if (body.maxUses !== undefined) {
    db.prepare('UPDATE redeem_codes SET max_uses = ? WHERE id = ?').run(
      body.maxUses == null || body.maxUses === '' ? null : Number(body.maxUses),
      id
    );
  }
  if (body.perUserOnce != null) {
    db.prepare('UPDATE redeem_codes SET per_user_once = ? WHERE id = ?').run(
      body.perUserOnce ? 1 : 0,
      id
    );
  }
  if (body.active != null) {
    db.prepare('UPDATE redeem_codes SET active = ? WHERE id = ?').run(body.active ? 1 : 0, id);
  }
  if (body.expiresAt !== undefined) {
    db.prepare('UPDATE redeem_codes SET expires_at = ? WHERE id = ?').run(body.expiresAt || null, id);
  }
  return listRedeemCodesAdmin().find((c) => c.id === id);
}

export function deleteRedeemCodeAdmin(id) {
  db.prepare('DELETE FROM redeem_codes WHERE id = ?').run(id);
}

export function redeemCodeForUser(userId, rawCode) {
  const code = String(rawCode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!code) return { ok: false, reason: 'Nhập mã quà' };

  const row = db
    .prepare(
      `SELECT id, code, label, reward_json AS rewardJson, max_uses AS maxUses,
              uses_count AS usesCount, per_user_once AS perUserOnce, active,
              expires_at AS expiresAt
       FROM redeem_codes WHERE code = ? COLLATE NOCASE`
    )
    .get(code);

  if (!row || !row.active) return { ok: false, reason: 'Mã không hợp lệ' };
  if (row.expiresAt && new Date(row.expiresAt) < new Date()) {
    return { ok: false, reason: 'Mã đã hết hạn' };
  }
  if (row.maxUses != null && row.usesCount >= row.maxUses) {
    return { ok: false, reason: 'Mã đã hết lượt dùng' };
  }

  if (row.perUserOnce) {
    const used = db
      .prepare('SELECT 1 FROM redeem_redemptions WHERE code_id = ? AND user_id = ?')
      .get(row.id, userId);
    if (used) return { ok: false, reason: 'Bạn đã nhập mã này rồi' };
  }

  let reward = {};
  try {
    reward = JSON.parse(row.rewardJson || '{}');
  } catch {
    reward = {};
  }

  const save = getSave(userId);
  const data = save?.data && typeof save.data === 'object' ? { ...save.data } : {};
  if (!Array.isArray(data.redeemedCodes)) data.redeemedCodes = [];
  const codeKey = String(row.code).toUpperCase();
  if (row.perUserOnce && data.redeemedCodes.includes(codeKey)) {
    return { ok: false, reason: 'Bạn đã nhập mã này rồi' };
  }

  if (reward.souls) data.souls = (Number(data.souls) || 0) + Number(reward.souls);
  if (reward.gold) data.gold = (Number(data.gold) || 0) + Number(reward.gold);
  if (reward.gems) data.gems = (Number(data.gems) || 0) + Number(reward.gems);
  if (row.perUserOnce && !data.redeemedCodes.includes(codeKey)) {
    data.redeemedCodes.push(codeKey);
  }

  const tx = db.transaction(() => {
    upsertSave(userId, data);
    db.prepare(
      'INSERT INTO redeem_redemptions (code_id, user_id) VALUES (?, ?)'
    ).run(row.id, userId);
    db.prepare('UPDATE redeem_codes SET uses_count = uses_count + 1 WHERE id = ?').run(row.id);
  });
  tx();

  return { ok: true, reward, label: row.label || row.code, save: data };
}
