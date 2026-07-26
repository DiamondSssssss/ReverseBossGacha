import { MONSTER_UPGRADE } from '../data/constants.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import { saveState } from './storage.js';

export function getMonsterUpgradeLevel(state, monsterId) {
  return Math.max(0, Number(state.monsterUpgrades?.[monsterId]) || 0);
}

export function monsterStatMul(level) {
  const lv = Math.max(0, Number(level) || 0);
  return 1 + lv * MONSTER_UPGRADE.STAT_PER_LEVEL;
}

export function upgradeMonsterCost(monsterId, currentLevel) {
  const m = MONSTER_BY_ID[monsterId];
  if (!m) return Infinity;
  const rarityMul = MONSTER_UPGRADE.RARITY_MULT[m.rarity] || 1;
  return Math.round(
    MONSTER_UPGRADE.COST_BASE *
      Math.pow(MONSTER_UPGRADE.COST_GROWTH, currentLevel) *
      rarityMul
  );
}

/**
 * @returns {{ ok: boolean, reason?: string, level?: number, cost?: number }}
 */
export function tryUpgradeMonster(state, monsterId) {
  const m = MONSTER_BY_ID[monsterId];
  if (!m) return { ok: false, reason: 'Quái không tồn tại' };
  if (!(state.inventory[monsterId] > 0)) {
    return { ok: false, reason: 'Chưa sở hữu quái này' };
  }
  const lvl = getMonsterUpgradeLevel(state, monsterId);
  if (lvl >= MONSTER_UPGRADE.MAX_LEVEL) {
    return { ok: false, reason: 'Đã max cấp quái' };
  }
  const cost = upgradeMonsterCost(monsterId, lvl);
  if (state.gold < cost) {
    return { ok: false, reason: 'Không đủ Vàng' };
  }
  state.gold -= cost;
  if (!state.monsterUpgrades) state.monsterUpgrades = {};
  state.monsterUpgrades[monsterId] = lvl + 1;
  saveState(state);
  return { ok: true, level: lvl + 1, cost };
}

/** Stats hiển thị kho (đã tính nâng cấp) */
export function displayMonsterStats(template, upgradeLevel = 0) {
  const mul = monsterStatMul(upgradeLevel);
  return {
    hp: Math.round(template.stats.hp * mul),
    atk: Math.round(template.stats.atk * mul),
    speed: template.stats.speed,
    range: template.stats.range,
    atkSpeed: template.stats.atkSpeed,
  };
}
