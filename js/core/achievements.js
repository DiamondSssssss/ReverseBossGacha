import { ACHIEVEMENTS } from '../data/achievements.js';
import { MONSTERS } from '../data/monsters.js';
import { saveState } from './storage.js';

function checkCtx() {
  return {
    monsterCount: MONSTERS.length,
    legendaryIds: MONSTERS.filter((m) => m.rarity === 5).map((m) => m.id),
    mythicIds: MONSTERS.filter((m) => m.rarity === 6).map((m) => m.id),
  };
}

/** Track monsters ever owned for collection achievements. */
export function trackOwned(state, monsterId) {
  if (!state.ownedEver) state.ownedEver = [];
  if (!state.ownedEver.includes(monsterId)) {
    state.ownedEver.push(monsterId);
  }
}

/**
 * Evaluate all achievements; unlock new ones, grant rewards.
 * @returns {object[]} newly unlocked achievement defs
 */
export function evaluateAchievements(state) {
  if (!state.achievements) state.achievements = {};
  const ctx = checkCtx();
  const unlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (state.achievements[ach.id]?.unlocked) continue;
    let ok = false;
    try {
      ok = !!ach.check(state, ctx);
    } catch {
      ok = false;
    }
    if (!ok) continue;

    state.achievements[ach.id] = {
      unlocked: true,
      at: Date.now(),
      claimed: true,
    };
    const r = ach.reward || {};
    if (r.souls) state.souls += r.souls;
    if (r.gold) state.gold += r.gold;
    if (r.gems) state.gems += r.gems;
    unlocked.push(ach);
  }

  if (unlocked.length) saveState(state);
  return unlocked;
}

export function achievementProgress(state) {
  const total = ACHIEVEMENTS.length;
  const done = ACHIEVEMENTS.filter((a) => state.achievements?.[a.id]?.unlocked).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function isGameCleared(state) {
  // Beat stage 40 → dungeonLevel becomes 41
  return (state.dungeonLevel || 1) > 40;
}
