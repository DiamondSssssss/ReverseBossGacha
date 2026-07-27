import {
  SAVE_KEY,
  STARTING,
  SPELLS,
  INVENTORY_CAP,
  DUPLICATE_SOUL_REFUND,
} from '../data/constants.js?v=71';
import { DEFAULT_BOSS_ID, syncUnlockedBosses } from '../data/dungeonBosses.js?v=71';
import { MONSTER_BY_ID } from '../data/monsters.js?v=71';
import { isLoggedIn } from './auth.js?v=71';
import { pushCloudSave } from './cloudSave.js?v=71';

const LEGACY_KEYS = ['rbg_save_v1'];

let cloudTimer = 0;
let cloudSyncEnabled = true;

export function setCloudSyncEnabled(on) {
  cloudSyncEnabled = !!on;
}

function defaultState() {
  return {
    souls: STARTING.souls,
    gold: STARTING.gold,
    gems: STARTING.gems,
    inventory: { ...STARTING.starterMonsters },
    monsterUpgrades: {},
    pityCounter: 0,
    mythicPityCounter: 0,
    dungeonLevel: 1,
    mapUpgrade: 0,
    roomUpgrades: {},
    unlockedSpells: ['slow_wave', 'heal_monsters'],
    selectedBossId: DEFAULT_BOSS_ID,
    unlockedBosses: [DEFAULT_BOSS_ID],
    stats: { pulls: 0, wins: 0, losses: 0, pityHits: 0, mythicPityHits: 0, spellsCast: 0 },
    tutorialDone: false,
    tipsDismissed: {},
    achievements: {},
    ownedEver: Object.keys(STARTING.starterMonsters),
    lastLoadout: {},
    redeemedCodes: [],
    updatedAt: Date.now(),
  };
}

/** Cắt inventory về cap; hoàn LH cho phần dư (migration / cloud). */
export function clampInventoryToCap(state) {
  let refund = 0;
  const inv = state.inventory || {};
  for (const id of Object.keys(inv)) {
    const have = Number(inv[id]) || 0;
    if (have <= INVENTORY_CAP) continue;
    const overflow = have - INVENTORY_CAP;
    inv[id] = INVENTORY_CAP;
    const rarity = MONSTER_BY_ID[id]?.rarity || 1;
    refund += overflow * (DUPLICATE_SOUL_REFUND[rarity] || DUPLICATE_SOUL_REFUND[1]);
  }
  if (refund > 0) state.souls = (Number(state.souls) || 0) + refund;
  return refund;
}

function clearLegacySaves() {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function loadState() {
  clearLegacySaves();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    const merged = {
      ...base,
      ...parsed,
      souls: Number(parsed.souls) || 0,
      gold: Number(parsed.gold) || 0,
      gems: Number(parsed.gems) || 0,
      pityCounter: Math.max(0, Number(parsed.pityCounter) || 0),
      mythicPityCounter: Math.max(0, Number(parsed.mythicPityCounter) || 0),
      inventory: parsed.inventory
        ? { ...parsed.inventory }
        : { ...STARTING.starterMonsters },
      monsterUpgrades: parsed.monsterUpgrades || {},
      roomUpgrades: parsed.roomUpgrades || {},
      mapUpgrade:
        parsed.mapUpgrade ??
        Math.max(0, ...Object.values(parsed.roomUpgrades || { _: 0 }), 0),
      unlockedSpells: parsed.unlockedSpells || Object.keys(SPELLS),
      selectedBossId: parsed.selectedBossId || DEFAULT_BOSS_ID,
      unlockedBosses: parsed.unlockedBosses || [DEFAULT_BOSS_ID],
      stats: { ...base.stats, ...(parsed.stats || {}) },
      tipsDismissed: parsed.tipsDismissed || {},
      achievements: parsed.achievements || {},
      ownedEver: Array.from(
        new Set([...(parsed.ownedEver || []), ...Object.keys(parsed.inventory || {})])
      ),
      lastLoadout: parsed.lastLoadout || {},
      redeemedCodes: Array.isArray(parsed.redeemedCodes) ? [...parsed.redeemedCodes] : [],
      tutorialDone: !!parsed.tutorialDone,
      achievementGemRev: Number(parsed.achievementGemRev) || 0,
      updatedAt: parsed.updatedAt || Date.now(),
    };
    clampInventoryToCap(merged);
    syncUnlockedBosses(merged);
    return merged;
  } catch {
    return defaultState();
  }
}

/** Áp cloud/local object lên state đang dùng (mutate). */
export function applySaveData(state, data) {
  if (!data) return state;
  const base = defaultState();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, {
    ...base,
    ...data,
    inventory: data.inventory ? { ...data.inventory } : { ...STARTING.starterMonsters },
    monsterUpgrades: data.monsterUpgrades || {},
    roomUpgrades: data.roomUpgrades || {},
    mapUpgrade:
      data.mapUpgrade ??
      Math.max(0, ...Object.values(data.roomUpgrades || { _: 0 }), 0),
    unlockedSpells: data.unlockedSpells || Object.keys(SPELLS),
    selectedBossId: data.selectedBossId || DEFAULT_BOSS_ID,
    unlockedBosses: data.unlockedBosses || [DEFAULT_BOSS_ID],
    stats: { ...base.stats, ...(data.stats || {}) },
    tipsDismissed: data.tipsDismissed || {},
    achievements: data.achievements || {},
    ownedEver: Array.from(
      new Set([...(data.ownedEver || []), ...Object.keys(data.inventory || {})])
    ),
    lastLoadout: data.lastLoadout || {},
    redeemedCodes: Array.isArray(data.redeemedCodes) ? [...data.redeemedCodes] : [],
    tutorialDone: !!data.tutorialDone,
    souls: Number(data.souls) || 0,
    gold: Number(data.gold) || 0,
    gems: Number(data.gems) || 0,
    pityCounter: Math.max(0, Number(data.pityCounter) || 0),
    mythicPityCounter: Math.max(0, Number(data.mythicPityCounter) || 0),
    achievementGemRev: Number(data.achievementGemRev) || 0,
    updatedAt: data.updatedAt || Date.now(),
  });
  clampInventoryToCap(state);
  syncUnlockedBosses(state);
  return state;
}

export function saveState(state, { syncCloud = true } = {}) {
  state.updatedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));

  if (!syncCloud || !cloudSyncEnabled || !isLoggedIn()) return;

  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    pushCloudSave(state).catch(() => {});
  }, 1200);
}

export async function saveStateNow(state) {
  state.updatedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  if (!isLoggedIn()) return { ok: false, error: 'not_logged_in' };
  return pushCloudSave(state);
}

export function resetState() {
  const s = defaultState();
  saveState(s, { syncCloud: true });
  return s;
}

/**
 * Thêm quái vào kho, tối đa INVENTORY_CAP mỗi loại.
 * Phần dư → hoàn Linh Hồn theo độ hiếm.
 * @returns {{ added: number, overflow: number, soulsRefunded: number, atCap: boolean }}
 */
export function addToInventory(state, monsterId, count = 1) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  if (!state.ownedEver) state.ownedEver = [];
  if (!state.ownedEver.includes(monsterId)) state.ownedEver.push(monsterId);

  const have = state.inventory[monsterId] || 0;
  const room = Math.max(0, INVENTORY_CAP - have);
  const added = Math.min(n, room);
  const overflow = n - added;

  if (added > 0) {
    state.inventory[monsterId] = have + added;
  }

  let soulsRefunded = 0;
  if (overflow > 0) {
    const rarity = MONSTER_BY_ID[monsterId]?.rarity || 1;
    const per = DUPLICATE_SOUL_REFUND[rarity] || DUPLICATE_SOUL_REFUND[1];
    soulsRefunded = overflow * per;
    state.souls = (Number(state.souls) || 0) + soulsRefunded;
  }

  return {
    added,
    overflow,
    soulsRefunded,
    atCap: (state.inventory[monsterId] || 0) >= INVENTORY_CAP,
  };
}

export function consumeFromInventory(state, monsterId, count = 1) {
  const have = state.inventory[monsterId] || 0;
  if (have < count) return false;
  state.inventory[monsterId] = have - count;
  if (state.inventory[monsterId] <= 0) delete state.inventory[monsterId];
  return true;
}

export function inventoryCopy(state) {
  return { ...state.inventory };
}

export { defaultState };
