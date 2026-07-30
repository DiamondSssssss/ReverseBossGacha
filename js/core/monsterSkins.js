import { MONSTER_BY_ID } from '../data/monsters.js?v=131';
import { MONSTER_SKINS } from '../data/monsterSkins.js?v=131';
import { saveState } from './storage.js?v=131';

function defaultLifetimeStats() {
  return {
    deployments: 0,
    winsWithInLoadout: 0,
    hardWinsByLevel: {},
    normalWinsByLevel: {},
  };
}

function achievementCount(state) {
  return Object.values(state?.achievements || {}).filter(Boolean).length;
}

export function ensureMonsterSkinState(state) {
  if (!state.monsterSkinsOwned || typeof state.monsterSkinsOwned !== 'object') {
    state.monsterSkinsOwned = {};
  }
  if (!state.monsterSkinEquipped || typeof state.monsterSkinEquipped !== 'object') {
    state.monsterSkinEquipped = {};
  }
  if (!state.monsterLifetimeStats || typeof state.monsterLifetimeStats !== 'object') {
    state.monsterLifetimeStats = {};
  }
  for (const [monsterId, skins] of Object.entries(MONSTER_SKINS)) {
    if (!Array.isArray(skins) || !skins.length) continue;
    const owned = Array.isArray(state.monsterSkinsOwned[monsterId])
      ? state.monsterSkinsOwned[monsterId]
      : [];
    const validIds = new Set(skins.map((skin) => skin.id));
    const normalized = Array.from(
      new Set(
        owned.filter((skinId) => validIds.has(skinId)).concat(
          skins.filter((skin) => skin.unlockedByDefault).map((skin) => skin.id)
        )
      )
    );
    state.monsterSkinsOwned[monsterId] = normalized;
    const equipped = state.monsterSkinEquipped[monsterId];
    state.monsterSkinEquipped[monsterId] = validIds.has(equipped)
      ? equipped
      : normalized[0] || skins[0].id;
  }
  for (const monsterId of Object.keys(state.monsterLifetimeStats)) {
    state.monsterLifetimeStats[monsterId] = {
      ...defaultLifetimeStats(),
      ...(state.monsterLifetimeStats[monsterId] || {}),
    };
  }
}

export function getMonsterSkinList(monsterId) {
  return MONSTER_SKINS[monsterId] || [];
}

export function getMonsterSkin(monsterId, skinId) {
  const skins = getMonsterSkinList(monsterId);
  if (!skins.length) return null;
  return skins.find((skin) => skin.id === skinId) || skins[0];
}

export function getMonsterLifetimeStats(state, monsterId) {
  ensureMonsterSkinState(state);
  if (!state.monsterLifetimeStats[monsterId]) {
    state.monsterLifetimeStats[monsterId] = defaultLifetimeStats();
  }
  return state.monsterLifetimeStats[monsterId];
}

function unlockProgress(state, monsterId, skin) {
  const unlock = skin?.unlock || null;
  const stats = getMonsterLifetimeStats(state, monsterId);
  if (!unlock) return { value: 1, target: 1 };
  switch (unlock.type) {
    case 'mastery_deployments':
      return {
        value: Number(stats.deployments) || 0,
        target: Number(unlock.value) || 0,
      };
    case 'mastery_wins':
      return {
        value: Number(stats.winsWithInLoadout) || 0,
        target: Number(unlock.value) || 0,
      };
    case 'stage_reached':
      return {
        value: Number(state?.dungeonLevel) || 1,
        target: Number(unlock.value) || 0,
      };
    case 'hard_stage_reached':
      return {
        value: Number(state?.hardDungeonLevel) || 1,
        target: Number(unlock.value) || 0,
      };
    case 'achievement_total':
      return {
        value: achievementCount(state),
        target: Number(unlock.value) || 0,
      };
    case 'hard_win_with_loadout': {
      const done = !!stats.hardWinsByLevel?.[Number(unlock.level) || 0];
      return { value: done ? 1 : 0, target: 1 };
    }
    case 'normal_win_with_loadout': {
      const done = !!stats.normalWinsByLevel?.[Number(unlock.level) || 0];
      return { value: done ? 1 : 0, target: 1 };
    }
    default:
      return { value: 0, target: Number(unlock.value) || 0 };
  }
}

export function isMonsterSkinUnlocked(state, monsterId, skinId) {
  ensureMonsterSkinState(state);
  return (state.monsterSkinsOwned?.[monsterId] || []).includes(skinId);
}

export function getEquippedMonsterSkinId(state, monsterId) {
  ensureMonsterSkinState(state);
  const skins = getMonsterSkinList(monsterId);
  if (!skins.length) return 'base';
  const equipped = state.monsterSkinEquipped?.[monsterId];
  if (equipped && getMonsterSkin(monsterId, equipped)) return equipped;
  const fallback = (state.monsterSkinsOwned?.[monsterId] || [skins[0].id])[0] || skins[0].id;
  state.monsterSkinEquipped[monsterId] = fallback;
  return fallback;
}

export function getEquippedMonsterSkin(state, monsterId) {
  return getMonsterSkin(monsterId, getEquippedMonsterSkinId(state, monsterId));
}

export function getEquippedMonsterAppearance(state, monsterId, fallbackMonster = null) {
  const tpl = fallbackMonster || MONSTER_BY_ID[monsterId];
  const skin = getEquippedMonsterSkin(state, monsterId);
  const palette = skin?.visual?.palette || {};
  return {
    skinId: skin?.id || 'base',
    name: skin?.name || 'Mặc Định',
    kind: skin?.visual?.kind || null,
    palette,
    decals: Array.isArray(skin?.visual?.decals) ? skin.visual.decals : [],
    aura: skin?.visual?.aura || null,
    vfx: skin?.visual?.vfx || null,
    color: palette.primary || tpl?.color || '#66bb6a',
    rarity: tpl?.rarity || 1,
  };
}

export function describeSkinUnlock(skin) {
  if (!skin) return 'Mặc định';
  if (skin.unlockedByDefault) return 'Mặc định';
  const unlock = skin.unlock || {};
  switch (unlock.type) {
    case 'mastery_deployments':
      return `Đặt quái này ${unlock.value} lần lên sân`;
    case 'mastery_wins':
      return `Thắng ${unlock.value} trận khi mang quái này trong loadout`;
    case 'stage_reached':
      return `Mở đến ải Thường ${unlock.value}`;
    case 'hard_stage_reached':
      return `Mở đến ải Khó ${unlock.value}`;
    case 'achievement_total':
      return `Mở ${unlock.value} ấn chương`;
    case 'hard_win_with_loadout':
      return `Mang quái này trong loadout và thắng ải Khó ${unlock.level}`;
    case 'normal_win_with_loadout':
      return `Mang quái này trong loadout và thắng ải Thường ${unlock.level}`;
    default:
      return 'Điều kiện đặc biệt';
  }
}

export function describeSkinProgress(state, monsterId, skin) {
  if (!skin) return '';
  if (skin.unlockedByDefault) return 'Đã có sẵn';
  const { value, target } = unlockProgress(state, monsterId, skin);
  return `${Math.min(value, target)}/${target}`;
}

export function getReadyToUnlockSkinCount(state) {
  ensureMonsterSkinState(state);
  let count = 0;
  for (const [monsterId, skins] of Object.entries(MONSTER_SKINS)) {
    for (const skin of skins) {
      if (skin.unlockedByDefault || isMonsterSkinUnlocked(state, monsterId, skin.id)) continue;
      const { value, target } = unlockProgress(state, monsterId, skin);
      if (target > 0 && value >= target) count += 1;
    }
  }
  return count;
}

export function getUnlockedMonsterSkinCount(state) {
  ensureMonsterSkinState(state);
  return Object.values(state.monsterSkinsOwned || {}).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );
}

export function getTotalMonsterSkinCount() {
  return Object.values(MONSTER_SKINS).reduce((sum, skins) => sum + skins.length, 0);
}

export function evaluateMonsterSkinUnlocks(state, { monsterIds = null, save = false } = {}) {
  ensureMonsterSkinState(state);
  const scope = monsterIds ? new Set(monsterIds) : null;
  const unlocked = [];
  for (const [monsterId, skins] of Object.entries(MONSTER_SKINS)) {
    if (scope && !scope.has(monsterId)) continue;
    const owned = state.monsterSkinsOwned[monsterId] || [];
    for (const skin of skins) {
      if (skin.unlockedByDefault || owned.includes(skin.id)) continue;
      const { value, target } = unlockProgress(state, monsterId, skin);
      if (target > 0 && value >= target) {
        owned.push(skin.id);
        unlocked.push({
          monsterId,
          monsterName: MONSTER_BY_ID[monsterId]?.name || monsterId,
          skinId: skin.id,
          skinName: skin.name,
        });
      }
    }
    state.monsterSkinsOwned[monsterId] = Array.from(new Set(owned));
  }
  if (save && unlocked.length) saveState(state);
  return unlocked;
}

export function equipMonsterSkin(state, monsterId, skinId) {
  ensureMonsterSkinState(state);
  const skin = getMonsterSkin(monsterId, skinId);
  if (!skin) return { ok: false, reason: 'Skin không tồn tại' };
  if (!isMonsterSkinUnlocked(state, monsterId, skin.id)) {
    return { ok: false, reason: 'Chưa mở khóa skin này' };
  }
  state.monsterSkinEquipped[monsterId] = skin.id;
  saveState(state);
  return { ok: true, skin };
}

export function addMonsterDeployments(state, entries = []) {
  ensureMonsterSkinState(state);
  for (const entry of entries) {
    const monsterId = typeof entry === 'string' ? entry : entry?.monsterId;
    const count = Math.max(1, Number(entry?.count) || 1);
    if (!monsterId) continue;
    const stats = getMonsterLifetimeStats(state, monsterId);
    stats.deployments += count;
  }
}

export function addLoadoutWinStats(state, loadout = {}) {
  ensureMonsterSkinState(state);
  for (const monsterId of Object.keys(loadout || {})) {
    const stats = getMonsterLifetimeStats(state, monsterId);
    stats.winsWithInLoadout += 1;
  }
}

export function recordHardWinWithLoadout(state, level, loadout = {}) {
  ensureMonsterSkinState(state);
  const lv = Math.max(1, Number(level) || 1);
  for (const monsterId of Object.keys(loadout || {})) {
    const stats = getMonsterLifetimeStats(state, monsterId);
    stats.hardWinsByLevel = {
      ...(stats.hardWinsByLevel || {}),
      [lv]: true,
    };
  }
}

export function recordNormalWinWithLoadout(state, level, loadout = {}) {
  ensureMonsterSkinState(state);
  const lv = Math.max(1, Number(level) || 1);
  for (const monsterId of Object.keys(loadout || {})) {
    const stats = getMonsterLifetimeStats(state, monsterId);
    stats.normalWinsByLevel = {
      ...(stats.normalWinsByLevel || {}),
      [lv]: true,
    };
  }
}
