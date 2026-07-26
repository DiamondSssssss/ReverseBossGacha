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
} from './db.js';
import { signToken, authMiddleware } from './auth.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

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

app.get('/api/leaderboard', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const entries = listLeaderboard(limit);
  res.json({ entries });
});

app.get('/api/players/:username', (req, res) => {
  const profile = getPublicProfile(req.params.username);
  if (!profile) return res.status(404).json({ error: 'Không tìm thấy người chơi' });
  res.json({ profile });
});

app.listen(PORT, () => {
  console.log(`bossgacha-server listening on :${PORT}`);
});
