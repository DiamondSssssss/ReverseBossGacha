import { MONSTER_UPGRADE } from '../data/constants.js?v=114';
import { MONSTER_BY_ID } from '../data/monsters.js?v=114';
import { monsterScaleForLevel } from '../data/heroes.js?v=114';
import { saveState } from './storage.js?v=114';

export function getMonsterUpgradeLevel(state, monsterId) {
  return Math.max(0, Number(state.monsterUpgrades?.[monsterId]) || 0);
}

export function monsterStatMul(level) {
  const lv = Math.max(0, Number(level) || 0);
  return 1 + lv * MONSTER_UPGRADE.STAT_PER_LEVEL;
}

/**
 * Buff HP 1–4★ để không oneshot; suicide/trap/potion giữ mỏng.
 * Tank/tankette nhận mul cao hơn.
 */
export function raritySurvivabilityMul(template) {
  const rarity = Number(template?.rarity) || 1;
  if (rarity >= 5) return 1;
  const tags = template?.tags || [];
  const passive = template?.passive || '';
  const skills = template?.skills || [];
  const fragile =
    tags.includes('trap') ||
    tags.includes('potion') ||
    passive === 'SELF_DESTRUCT' ||
    skills.includes('SELF_DESTRUCT') ||
    passive === 'BONE_PILE' ||
    String(passive).startsWith('SLIME_EXPLODE') ||
    String(passive).startsWith('TRAP_') ||
    String(passive).startsWith('POTION_');
  if (fragile) return rarity <= 2 ? 1.05 : 1;

  const isTank =
    tags.includes('tank') ||
    tags.includes('tankette') ||
    passive === 'TAUNT' ||
    passive === 'AURA_TAUNT' ||
    passive === 'AURA_STUN' ||
    passive === 'ANTI_HEAL_AURA' ||
    passive === 'HEAL_AURA' ||
    passive === 'HEAL_PULSE' ||
    passive === 'THORNS_PASSIVE' ||
    passive === 'ROOT_AURA';

  const table = isTank
    ? { 1: 1.85, 2: 1.7, 3: 1.55, 4: 1.4 }
    : { 1: 1.55, 2: 1.4, 3: 1.28, 4: 1.18 };
  return table[rarity] ?? 1;
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

/** Stats hiển thị kho / tip (nâng cấp + scale ải nếu có + mul hard/challenge) */
export function displayMonsterStats(template, upgradeLevel = 0, stageLevel = 0, statMul = 1) {
  const upMul = monsterStatMul(upgradeLevel);
  const stageMul = stageLevel > 0 ? monsterScaleForLevel(stageLevel) : 1;
  const extraMul = Number.isFinite(statMul) && statMul > 0 ? statMul : 1;
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
  let hpMul = upMul * stageMul * extraMul;
  let atkMul = upMul * stageMul * extraMul;
  if (isAssassin) {
    hpMul *= 1.15;
    atkMul *= 1.28;
  } else if (isTank) {
    hpMul *= 1.4;
    atkMul *= 0.95;
  }
  const surv = raritySurvivabilityMul(template);
  hpMul *= surv;
  return {
    hp: Math.max(1, Math.round(template.stats.hp * hpMul)),
    atk: Math.max(1, Math.round(template.stats.atk * atkMul)),
    speed: template.stats.speed * (isAssassin ? 1.1 : 1),
    range: template.stats.range,
    atkSpeed: template.stats.atkSpeed,
    /** Cấp ải đã áp (0 = chưa nhân scale ải) */
    stageLevel: stageLevel > 0 ? stageLevel : 0,
    /** Hệ số scale ải (1 = không scale) */
    stageMul,
    /** Hệ số hard/challenge thêm */
    statMul: extraMul,
    /** HP/ATK gốc + nâng cấp, chưa nhân ải — để so sánh */
    baseHp: Math.round(
      template.stats.hp * upMul * (isAssassin ? 1.15 : isTank ? 1.4 : 1) * surv
    ),
    baseAtk: Math.round(
      template.stats.atk * upMul * (isAssassin ? 1.28 : isTank ? 0.95 : 1)
    ),
  };
}

