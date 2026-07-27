import {
  ACHIEVEMENTS,
  backfillAchievementGems,
} from '../data/achievements.js?v=100';
import { MONSTERS } from '../data/monsters.js?v=100';
import { MAX_STAGE } from '../data/constants.js?v=100';
import { saveState } from './storage.js?v=100';

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
 * Backfill Gem tăng thưởng cho ấn đã mở trước đó.
 * @returns {object[]} newly unlocked achievement defs
 */
export function evaluateAchievements(state) {
  if (!state.achievements) state.achievements = {};
  const ctx = checkCtx();
  const unlocked = [];

  // Trước: cộng chênh Gem cho ấn cũ (tránh cộng đúp với unlock mới bên dưới)
  const gemBackfill = backfillAchievementGems(state);

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

  if (unlocked.length || gemBackfill > 0) saveState(state);
  return unlocked;
}

export function achievementProgress(state) {
  const total = ACHIEVEMENTS.length;
  const done = ACHIEVEMENTS.filter((a) => state.achievements?.[a.id]?.unlocked).length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function isGameCleared(state) {
  // Beat final stage → dungeonLevel becomes MAX_STAGE + 1
  return (state.dungeonLevel || 1) > MAX_STAGE;
}
