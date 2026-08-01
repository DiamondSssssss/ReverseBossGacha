import { api } from './auth.js?v=136';

export async function fetchPublicPatchLogs() {
  const data = await api('/api/patch-logs');
  return data.logs || [];
}
