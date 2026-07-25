/**
 * API backend (username / password / tên hiển thị — giống GameBanCa).
 * Trên production cùng domain: để trống → gọi /api/...
 * Dev local không qua nginx: http://127.0.0.1:3007
 */
export const API_BASE = '';

export function apiUrl(path) {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Cloud luôn “bật” khi có backend; Guest vẫn chơi được không login */
export function isCloudConfigured() {
  return true;
}
