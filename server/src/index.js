import express from 'express';
import cors from 'cors';
import {
  createUser,
  findUserByUsername,
  getUserById,
  verifyPassword,
  getSave,
  upsertSave,
  listLeaderboard,
  getPublicProfile,
  ensureAdminAccount,
  seedDefaultRedeemCodes,
  getAdminStats,
  listUsersAdmin,
  getUserAdmin,
  patchUserAdmin,
  deleteUserAdmin,
  listPatchLogs,
  listPatchLogsAdmin,
  createPatchLogAdmin,
  updatePatchLogAdmin,
  deletePatchLogAdmin,
  listRedeemCodesAdmin,
  createRedeemCodeAdmin,
  updateRedeemCodeAdmin,
  deleteRedeemCodeAdmin,
  redeemCodeForUser,
  isUserBanned,
  upsertStageBestCost,
  listStageRecordHolders,
} from './db.js';
import { signToken, authMiddleware, adminMiddleware } from './auth.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Bootstrap admin + default redeem codes
seedDefaultRedeemCodes();
const adminUser = process.env.ADMIN_USERNAME || 'admin';
const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
ensureAdminAccount(adminUser, adminPass, process.env.ADMIN_DISPLAY_NAME || 'Quản trị viên');
console.log(`[admin] account "${adminUser}" ready (set ADMIN_USERNAME/ADMIN_PASSWORD in prod)`);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'bossgacha' });
});

app.post('/api/register', (req, res) => {
  const { username, password, displayName } = req.body || {};
  const u = String(username || '').trim();
  const p = String(password || '');
  const d = String(displayName || '').trim();

  if (!u || !p) {
    return res.status(400).json({ error: 'Thiếu username/password' });
  }
  if (u.length < 3 || p.length < 3) {
    return res.status(400).json({ error: 'Username/password tối thiểu 3 ký tự' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(u)) {
    return res.status(400).json({ error: 'Username chỉ gồm chữ, số, gạch dưới' });
  }
  if (findUserByUsername(u)) {
    return res.status(400).json({ error: 'Username đã tồn tại' });
  }

  const user = createUser(u, p, d || u);
  const token = signToken(user);
  res.json({ token, user });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const row = findUserByUsername(username);
  if (!row || !verifyPassword(row, String(password || ''))) {
    return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
  }
  if (isUserBanned(row.id)) {
    return res.status(403).json({ error: 'Tài khoản bị khóa' });
  }
  const user = getUserById(row.id);
  const token = signToken(user);
  res.json({ token, user });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Không tìm thấy user' });
  res.json({ user });
});

app.get('/api/save', authMiddleware, (req, res) => {
  const save = getSave(req.user.id);
  if (!save) return res.json({ empty: true });
  res.json({ empty: false, data: save.data, updatedAt: save.updatedAt });
});

app.put('/api/save', authMiddleware, (req, res) => {
  const body = req.body?.data ?? req.body?.save_data ?? req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Thiếu dữ liệu save' });
  }
  const save = upsertSave(req.user.id, body);
  res.json({ ok: true, updatedAt: save.updatedAt });
});

app.post('/api/redeem', authMiddleware, (req, res) => {
  const code = req.body?.code;
  try {
    const result = redeemCodeForUser(req.user.id, code);
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (e) {
    res.status(400).json({ ok: false, reason: e.message || 'Lỗi đổi mã' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const entries = listLeaderboard(limit);
  res.json({ entries });
});

app.put('/api/stage-cost', authMiddleware, (req, res) => {
  const mode = req.body?.mode === 'hard' ? 'hard' : 'normal';
  const stage = Number(req.body?.stage);
  const cost = Number(req.body?.cost);
  const result = upsertStageBestCost(req.user.id, mode, stage, cost);
  if (!result.ok) return res.status(400).json({ error: result.error || 'invalid' });
  res.json(result);
});

app.get('/api/stage-records', (req, res) => {
  const mode = req.query.mode === 'hard' ? 'hard' : 'normal';
  const records = listStageRecordHolders(mode);
  res.json({ mode, records });
});

app.get('/api/players/:username', (req, res) => {
  const profile = getPublicProfile(req.params.username);
  if (!profile) return res.status(404).json({ error: 'Không tìm thấy người chơi' });
  res.json({ profile });
});

app.get('/api/patch-logs', (_req, res) => {
  res.json({ logs: listPatchLogs({ activeOnly: true }) });
});

// ——— Admin ———
app.get('/api/admin/stats', adminMiddleware, (_req, res) => {
  res.json({ stats: getAdminStats() });
});

app.get('/api/admin/users', adminMiddleware, (req, res) => {
  const q = String(req.query.q || '');
  const limit = Number(req.query.limit) || 50;
  res.json({ users: listUsersAdmin({ q, limit }) });
});

app.get('/api/admin/users/:id', adminMiddleware, (req, res) => {
  const detail = getUserAdmin(Number(req.params.id));
  if (!detail) return res.status(404).json({ error: 'Không tìm thấy user' });
  res.json(detail);
});

app.patch('/api/admin/users/:id', adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id && req.body?.isBanned) {
    return res.status(400).json({ error: 'Không thể tự khóa tài khoản admin' });
  }
  const detail = patchUserAdmin(id, req.body || {});
  if (!detail) return res.status(404).json({ error: 'Không tìm thấy user' });
  res.json(detail);
});

app.delete('/api/admin/users/:id', adminMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Không thể xóa chính mình' });
  }
  deleteUserAdmin(id);
  res.json({ ok: true });
});

app.get('/api/admin/redeem-codes', adminMiddleware, (_req, res) => {
  res.json({ codes: listRedeemCodesAdmin() });
});

app.get('/api/admin/patch-logs', adminMiddleware, (_req, res) => {
  res.json({ logs: listPatchLogsAdmin() });
});

app.post('/api/admin/patch-logs', adminMiddleware, (req, res) => {
  try {
    const log = createPatchLogAdmin(req.body || {});
    res.json({ log });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Không tạo được patch log' });
  }
});

app.patch('/api/admin/patch-logs/:id', adminMiddleware, (req, res) => {
  try {
    const log = updatePatchLogAdmin(Number(req.params.id), req.body || {});
    if (!log) return res.status(404).json({ error: 'Không tìm thấy patch log' });
    res.json({ log });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Không cập nhật được patch log' });
  }
});

app.delete('/api/admin/patch-logs/:id', adminMiddleware, (req, res) => {
  deletePatchLogAdmin(Number(req.params.id));
  res.json({ ok: true });
});

app.post('/api/admin/redeem-codes', adminMiddleware, (req, res) => {
  try {
    const code = createRedeemCodeAdmin(req.body || {});
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Không tạo được mã' });
  }
});

app.patch('/api/admin/redeem-codes/:id', adminMiddleware, (req, res) => {
  const code = updateRedeemCodeAdmin(Number(req.params.id), req.body || {});
  if (!code) return res.status(404).json({ error: 'Không tìm thấy mã' });
  res.json({ code });
});

app.delete('/api/admin/redeem-codes/:id', adminMiddleware, (req, res) => {
  deleteRedeemCodeAdmin(Number(req.params.id));
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`bossgacha-server listening on :${PORT}`);
});
