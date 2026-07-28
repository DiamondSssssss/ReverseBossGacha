import { apiUrl } from '../config.js?v=113';
import { api, isLoggedIn } from './auth.js?v=113';

async function publicApi(path) {
  const res = await fetch(apiUrl(path));
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(data?.error || `Lỗi ${res.status}`);
  }
  return data;
}

/**
 * @param {'normal'|'hard'} mode
 * @returns {Promise<Record<string, { username: string, displayName: string, bestCost: number }>>}
 */
export async function fetchStageRecords(mode = 'normal') {
  const m = mode === 'hard' ? 'hard' : 'normal';
  const data = await publicApi(`/api/stage-records?mode=${m}`);
  return data.records || {};
}

/**
 * @param {'normal'|'hard'} mode
 * @param {number} stage
 * @param {number} cost
 */
export async function submitStageBestCost(mode, stage, cost) {
  if (!isLoggedIn()) return { ok: false, error: 'not_logged_in' };
  return api('/api/stage-cost', {
    method: 'PUT',
    body: JSON.stringify({
      mode: mode === 'hard' ? 'hard' : 'normal',
      stage: Math.floor(Number(stage) || 0),
      cost: Math.floor(Number(cost) || 0),
    }),
  });
}

