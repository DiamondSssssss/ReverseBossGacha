import jwt from 'jsonwebtoken';
import { isUserAdmin, isUserBanned } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bossgacha-dev-secret-change-me';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, isAdmin: !!user.isAdmin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }
  if (isUserBanned(payload.id)) {
    return res.status(403).json({ error: 'Tài khoản bị khóa' });
  }
  req.user = payload;
  next();
}

export function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!isUserAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Không có quyền admin' });
    }
    next();
  });
}
