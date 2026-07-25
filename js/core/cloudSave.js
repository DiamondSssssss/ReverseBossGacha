import { getSupabase, getUser, isLoggedIn } from './auth.js';
import { isCloudConfigured } from '../config.js';

/**
 * @param {object} state
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function pushCloudSave(state) {
  if (!isCloudConfigured() || !isLoggedIn()) return { ok: false, error: 'not_logged_in' };
  const sb = getSupabase();
  const user = getUser();
  const payload = {
    user_id: user.id,
    save_data: sanitize(state),
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from('player_saves').upsert(payload, { onConflict: 'user_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * @returns {Promise<{ ok: boolean, data?: object, updatedAt?: string, error?: string, empty?: boolean }>}
 */
export async function pullCloudSave() {
  if (!isCloudConfigured() || !isLoggedIn()) {
    return { ok: false, error: 'not_logged_in' };
  }
  const sb = getSupabase();
  const user = getUser();
  const { data, error } = await sb
    .from('player_saves')
    .select('save_data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: true, empty: true };
  return { ok: true, data: data.save_data, updatedAt: data.updated_at };
}

function sanitize(state) {
  // Không gửi field runtime
  const {
    souls,
    gold,
    gems,
    inventory,
    pityCounter,
    dungeonLevel,
    roomUpgrades,
    unlockedSpells,
    stats,
    tutorialDone,
    tipsDismissed,
    achievements,
    ownedEver,
  } = state;
  return {
    souls,
    gold,
    gems,
    inventory,
    pityCounter,
    dungeonLevel,
    roomUpgrades,
    unlockedSpells,
    stats,
    tutorialDone,
    tipsDismissed,
    achievements,
    ownedEver,
    updatedAt: Date.now(),
  };
}

/** Chọn save “tiến xa hơn” khi conflict local vs cloud */
export function pickBetterSave(local, cloud) {
  if (!cloud) return local;
  if (!local) return cloud;
  const score = (s) =>
    (s.dungeonLevel || 1) * 10000 +
    (s.stats?.wins || 0) * 100 +
    (s.souls || 0) +
    (s.stats?.pulls || 0);
  return score(cloud) >= score(local) ? cloud : local;
}
