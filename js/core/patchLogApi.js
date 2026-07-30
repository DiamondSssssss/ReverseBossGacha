import { api } from './auth.js?v=135';

export async function fetchPublicPatchLogs() {
  const data = await api('/api/patch-logs');
  return data.logs || [];
}
