import { api, isLoggedIn } from './auth.js';

function sanitize(state) {
  const {
    souls,
    gold,
    gems,
    inventory,
    monsterUpgrades,
    pityCounter,
    dungeonLevel,
    roomUpgrades,
    mapUpgrade,
    unlockedSpells,
    selectedBossId,
    unlockedBosses,
    stats,
    tutorialDone,
    tipsDismissed,
    achievements,
    ownedEver,
    lastLoadout,
  } = state;
  return {
    souls,
    gold,
    gems,
    inventory,
    monsterUpgrades: monsterUpgrades || {},
    pityCounter,
    dungeonLevel,
    roomUpgrades,
    mapUpgrade: mapUpgrade || 0,
    unlockedSpells,
    selectedBossId: selectedBossId || 'frostblood',
    unlockedBosses: unlockedBosses || ['frostblood'],
    stats,
    tutorialDone,
    tipsDismissed,
    achievements,
    ownedEver,
    lastLoadout: lastLoadout || {},
    updatedAt: Date.now(),
  };
}

export async function pushCloudSave(state) {
  if (!isLoggedIn()) return { ok: false, error: 'not_logged_in' };
  try {
    await api('/api/save', {
      method: 'PUT',
      body: JSON.stringify({ data: sanitize(state) }),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function pullCloudSave() {
  if (!isLoggedIn()) return { ok: false, error: 'not_logged_in' };
  try {
    const res = await api('/api/save');
    if (res.empty) return { ok: true, empty: true };
    return { ok: true, data: res.data, updatedAt: res.updatedAt };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

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
