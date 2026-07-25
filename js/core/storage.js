import { SAVE_KEY, STARTING, SPELLS } from '../data/constants.js';
import { isLoggedIn } from './auth.js';
import { pushCloudSave } from './cloudSave.js';

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
    pityCounter: 0,
    dungeonLevel: 1,
    roomUpgrades: {},
    unlockedSpells: ['slow_wave', 'heal_monsters'],
    stats: { pulls: 0, wins: 0, losses: 0, pityHits: 0, spellsCast: 0 },
    tutorialDone: false,
    tipsDismissed: {},
    achievements: {},
    ownedEver: Object.keys(STARTING.starterMonsters),
    updatedAt: Date.now(),
  };
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
    return {
      ...base,
      ...parsed,
      souls: Number(parsed.souls) || 0,
      gold: Number(parsed.gold) || 0,
      gems: Number(parsed.gems) || 0,
      inventory: parsed.inventory
        ? { ...parsed.inventory }
        : { ...STARTING.starterMonsters },
      roomUpgrades: parsed.roomUpgrades || {},
      unlockedSpells: parsed.unlockedSpells || Object.keys(SPELLS),
      stats: { ...base.stats, ...(parsed.stats || {}) },
      tipsDismissed: parsed.tipsDismissed || {},
      achievements: parsed.achievements || {},
      ownedEver: Array.from(
        new Set([...(parsed.ownedEver || []), ...Object.keys(parsed.inventory || {})])
      ),
      tutorialDone: !!parsed.tutorialDone,
      updatedAt: parsed.updatedAt || Date.now(),
    };
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
    roomUpgrades: data.roomUpgrades || {},
    unlockedSpells: data.unlockedSpells || Object.keys(SPELLS),
    stats: { ...base.stats, ...(data.stats || {}) },
    tipsDismissed: data.tipsDismissed || {},
    achievements: data.achievements || {},
    ownedEver: Array.from(
      new Set([...(data.ownedEver || []), ...Object.keys(data.inventory || {})])
    ),
    souls: Number(data.souls) || 0,
    gold: Number(data.gold) || 0,
    gems: Number(data.gems) || 0,
  });
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

export function addToInventory(state, monsterId, count = 1) {
  state.inventory[monsterId] = (state.inventory[monsterId] || 0) + count;
  if (!state.ownedEver) state.ownedEver = [];
  if (!state.ownedEver.includes(monsterId)) state.ownedEver.push(monsterId);
  return state;
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
