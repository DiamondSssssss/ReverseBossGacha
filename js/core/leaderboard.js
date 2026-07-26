import { apiUrl } from '../config.js?v=59';

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

export async function fetchLeaderboard(limit = 50) {
  const data = await publicApi(`/api/leaderboard?limit=${limit}`);
  return data.entries || [];
}

export async function fetchPlayerProfile(username) {
  const data = await publicApi(`/api/players/${encodeURIComponent(username)}`);
  return data.profile;
}
