import { api } from './auth.js?v=88';

export async function fetchAdminStats() {
  const data = await api('/api/admin/stats');
  return data.stats;
}

export async function fetchAdminUsers(q = '', limit = 80) {
  const qs = new URLSearchParams({ q, limit: String(limit) });
  const data = await api(`/api/admin/users?${qs}`);
  return data.users || [];
}

export async function fetchAdminUser(id) {
  return api(`/api/admin/users/${id}`);
}

export async function patchAdminUser(id, body) {
  return api(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteAdminUser(id) {
  return api(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export async function fetchRedeemCodesAdmin() {
  const data = await api('/api/admin/redeem-codes');
  return data.codes || [];
}

export async function createRedeemCodeAdmin(body) {
  const data = await api('/api/admin/redeem-codes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.code;
}

export async function updateRedeemCodeAdmin(id, body) {
  const data = await api(`/api/admin/redeem-codes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return data.code;
}

export async function deleteRedeemCodeAdmin(id) {
  return api(`/api/admin/redeem-codes/${id}`, { method: 'DELETE' });
}

export async function redeemCodeServer(code) {
  return api('/api/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
