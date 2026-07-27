import { api, isLoggedIn } from './auth.js?v=82';

function sanitize(state) {
  const {
    souls,
    gold,
    gems,
    inventory,
    monsterUpgrades,
    pityCounter,
    mythicPityCounter,
    rainbowPityCounter,
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
    redeemedCodes,
    achievementGemRev,
  } = state;
  return {
    souls,
    gold,
    gems,
    inventory,
    monsterUpgrades: monsterUpgrades || {},
    pityCounter,
    mythicPityCounter: mythicPityCounter || 0,
    rainbowPityCounter: rainbowPityCounter || 0,
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
    redeemedCodes: redeemedCodes || [],
    achievementGemRev: achievementGemRev || 0,
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

/**
 * Chọn save “mới hơn / tiến hơn”.
 * Không dùng souls làm trọng số chính — sau gacha souls ↓ trong khi pity ↑,
 * save cloud cũ (nhiều LH, pity thấp) từng thắng và xóa pity mythic.
 */
export function pickBetterSave(local, cloud) {
  if (!cloud) return local;
  if (!local) return cloud;

  const lt = Number(local.updatedAt) || 0;
  const ct = Number(cloud.updatedAt) || 0;
  // Lệch ≥ 2s → tin updatedAt (local vừa quay thường mới hơn cloud chưa kịp sync)
  if (Math.abs(lt - ct) > 2000) {
    return lt > ct ? local : cloud;
  }

  const score = (s) =>
    (s.dungeonLevel || 1) * 10000 +
    (s.stats?.wins || 0) * 100 +
    (s.stats?.pulls || 0) * 50 +
    (Number(s.rainbowPityCounter) || 0) * 35 +
    (Number(s.mythicPityCounter) || 0) * 25 +
    (Number(s.pityCounter) || 0) * 10 +
    (Number(s.souls) || 0) * 0.01;
  return score(cloud) > score(local) ? cloud : local;
}
