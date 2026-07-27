import { MONSTER_UPGRADE } from '../data/constants.js?v=78';
import { MONSTER_BY_ID } from '../data/monsters.js?v=78';
import { monsterScaleForLevel } from '../data/heroes.js?v=78';
import { saveState } from './storage.js?v=78';

export function getMonsterUpgradeLevel(state, monsterId) {
  return Math.max(0, Number(state.monsterUpgrades?.[monsterId]) || 0);
}

export function monsterStatMul(level) {
  const lv = Math.max(0, Number(level) || 0);
  return 1 + lv * MONSTER_UPGRADE.STAT_PER_LEVEL;
}

export function upgradeMonsterCost(monsterId, currentLevel) {
  const m = MONSTER_BY_ID[monsterId];
  if (!m) return null;
  const rarityMul = MONSTER_UPGRADE.RARITY_MULT[m.rarity] ?? 1;
  const lv = Math.max(0, Number(currentLevel) || 0);
  const cost = Math.round(
    MONSTER_UPGRADE.COST_BASE * Math.pow(MONSTER_UPGRADE.COST_GROWTH, lv) * rarityMul
  );
  return Number.isFinite(cost) ? cost : null;
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
  if (cost == null || !Number.isFinite(cost)) {
    return { ok: false, reason: 'Không tính được giá nâng' };
  }
  if (state.gold < cost) {
    return { ok: false, reason: 'Không đủ Vàng' };
  }
  state.gold -= cost;
  if (!state.monsterUpgrades) state.monsterUpgrades = {};
  state.monsterUpgrades[monsterId] = lvl + 1;
  saveState(state);
  return { ok: true, level: lvl + 1, cost };
}

/** Stats hiển thị kho / tip (nâng cấp + scale ải nếu có) */
export function displayMonsterStats(template, upgradeLevel = 0, stageLevel = 0) {
  const upMul = monsterStatMul(upgradeLevel);
  const stageMul = stageLevel > 0 ? monsterScaleForLevel(stageLevel) : 1;
  const isAssassin =
    template.stealth ||
    template.skills?.includes('STEALTH') ||
    template.tags?.includes('assassin');
  const isTank =
    template.tags?.includes('tank') ||
    template.tags?.includes('tankette') ||
    template.passive === 'TAUNT' ||
    template.passive === 'AURA_TAUNT' ||
    template.passive === 'AURA_STUN' ||
    template.passive === 'ANTI_HEAL_AURA' ||
    template.passive === 'HEAL_AURA' ||
    template.passive === 'HEAL_PULSE';
  let hpMul = upMul * stageMul;
  let atkMul = upMul * stageMul;
  if (isAssassin) {
    hpMul *= 1.15;
    atkMul *= 1.28;
  } else if (isTank) {
    hpMul *= 1.4;
    atkMul *= 0.95;
  }
  return {
    hp: Math.round(template.stats.hp * hpMul),
    atk: Math.round(template.stats.atk * atkMul),
    speed: template.stats.speed * (isAssassin ? 1.1 : 1),
    range: template.stats.range,
    atkSpeed: template.stats.atkSpeed,
    /** Cấp ải đã áp (0 = chưa nhân scale ải) */
    stageLevel: stageLevel > 0 ? stageLevel : 0,
    /** Hệ số scale ải (1 = không scale) */
    stageMul,
    /** HP/ATK gốc + nâng cấp, chưa nhân ải — để so sánh */
    baseHp: Math.round(template.stats.hp * upMul * (isAssassin ? 1.15 : isTank ? 1.4 : 1)),
    baseAtk: Math.round(
      template.stats.atk * upMul * (isAssassin ? 1.28 : isTank ? 0.95 : 1)
    ),
  };
}
