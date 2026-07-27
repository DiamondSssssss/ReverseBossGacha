import { TERRAIN } from '../../data/rooms.js?v=94';
import { COMBAT, MONSTER_UPGRADE } from '../../data/constants.js?v=94';
import { monsterStatMul, raritySurvivabilityMul } from '../monsterUpgrade.js?v=94';
import { monsterScaleForLevel } from '../../data/heroes.js?v=94';

/**
 * Buff / debuff địa hình theo passive element.
 * Đứng đúng ô: mạnh. Sai ô (kể cả sàn thường): bị nerf — ép đổi loadout theo map.
 */
export function terrainAffinityMods(passive, terrain) {
  const out = { atkMul: 1, hpMul: 1, defMul: 1, speedMul: 1 };
  switch (passive) {
    case 'WATER_BUFF':
      if (terrain === TERRAIN.WATER || terrain === 'WATER') {
        out.atkMul = 1.4;
        out.hpMul = 1.4;
      } else {
        // Cạn / không phải nước → yếu
        out.atkMul = 0.7;
        out.hpMul = 0.85;
        out.defMul = 0.85;
        out.speedMul = 0.9;
      }
      break;
    case 'DARK_BUFF':
      if (terrain === TERRAIN.DARK || terrain === 'DARK') {
        out.atkMul = 2;
      } else {
        out.atkMul = 0.65;
        out.defMul = 0.9;
      }
      break;
    case 'FIRE_BUFF':
      if (terrain === TERRAIN.FIRE || terrain === 'FIRE') {
        out.atkMul = 1.45;
        out.hpMul = 1.2;
      } else if (terrain === TERRAIN.WATER || terrain === 'WATER' || terrain === TERRAIN.ICE || terrain === 'ICE') {
        // Lửa gặp nước/băng → nerf nặng
        out.atkMul = 0.55;
        out.hpMul = 0.8;
        out.defMul = 0.8;
      } else {
        out.atkMul = 0.75;
        out.hpMul = 0.9;
      }
      break;
    case 'ICE_BUFF':
      if (terrain === TERRAIN.ICE || terrain === 'ICE') {
        out.atkMul = 1.4;
        out.hpMul = 1.2;
      } else if (terrain === TERRAIN.FIRE || terrain === 'FIRE') {
        out.atkMul = 0.55;
        out.hpMul = 0.8;
        out.speedMul = 0.85;
      } else {
        out.atkMul = 0.75;
        out.hpMul = 0.9;
        out.speedMul = 0.92;
      }
      break;
    case 'POISON_BUFF':
      if (terrain === TERRAIN.POISON || terrain === 'POISON') {
        out.atkMul = 1.4;
        out.hpMul = 1.15;
      } else {
        out.atkMul = 0.72;
        out.hpMul = 0.9;
        out.defMul = 0.88;
      }
      break;
    case 'BUFF_IN_LOW_CEILING_ROOM':
      if (terrain === TERRAIN.HIGH || terrain === 'HIGH') {
        out.atkMul = 0.5;
        out.defMul = 0.85;
      } else if (
        terrain === TERRAIN.LOW_CEILING ||
        terrain === 'LOW_CEILING' ||
        terrain === TERRAIN.DARK ||
        terrain === 'DARK'
      ) {
        out.atkMul = 3;
      } else {
        // Sàn thường / nước / lửa… — không phải hang thấp
        out.atkMul = 0.8;
      }
      break;
    case 'AURA_WATER_ALLY':
      if (terrain === TERRAIN.WATER || terrain === 'WATER') {
        out.atkMul = 1.1;
        out.hpMul = 1.1;
      } else {
        out.atkMul = 0.65;
        out.hpMul = 0.8;
        out.defMul = 0.85;
      }
      break;
    case 'AURA_FIRE_ALLY':
      if (terrain === TERRAIN.FIRE || terrain === 'FIRE') {
        out.atkMul = 1.1;
        out.hpMul = 1.1;
      } else {
        out.atkMul = 0.65;
        out.hpMul = 0.8;
      }
      break;
    case 'AURA_ICE_ALLY':
      if (terrain === TERRAIN.ICE || terrain === 'ICE') {
        out.atkMul = 1.1;
        out.hpMul = 1.1;
      } else {
        out.atkMul = 0.65;
        out.hpMul = 0.8;
        out.speedMul = 0.9;
      }
      break;
    case 'AURA_POISON_ALLY':
      if (terrain === TERRAIN.POISON || terrain === 'POISON') {
        out.atkMul = 1.1;
        out.hpMul = 1.1;
      } else {
        out.atkMul = 0.65;
        out.hpMul = 0.8;
      }
      break;
    case 'AURA_DARK_ALLY':
      if (terrain === TERRAIN.DARK || terrain === 'DARK') {
        out.atkMul = 1.15;
      } else {
        out.atkMul = 0.6;
        out.defMul = 0.85;
      }
      break;
    default:
      break;
  }
  return out;
}

/** Aura element ally chỉ bật khi totem đứng đúng ô. */
export function elementAuraActive(passive, terrain) {
  switch (passive) {
    case 'AURA_WATER_ALLY':
      return terrain === TERRAIN.WATER || terrain === 'WATER';
    case 'AURA_FIRE_ALLY':
      return terrain === TERRAIN.FIRE || terrain === 'FIRE';
    case 'AURA_ICE_ALLY':
      return terrain === TERRAIN.ICE || terrain === 'ICE';
    case 'AURA_POISON_ALLY':
      return terrain === TERRAIN.POISON || terrain === 'POISON';
    case 'AURA_DARK_ALLY':
      return terrain === TERRAIN.DARK || terrain === 'DARK';
    default:
      return false;
  }
}

export function elementAuraTag(passive) {
  switch (passive) {
    case 'AURA_WATER_ALLY':
      return 'water';
    case 'AURA_FIRE_ALLY':
      return 'fire';
    case 'AURA_ICE_ALLY':
      return 'ice';
    case 'AURA_POISON_ALLY':
      return 'poison';
    case 'AURA_DARK_ALLY':
      return 'dark';
    default:
      return null;
  }
}

/**
 * Continuous tile modifiers for a unit standing on a cell.
 * @returns {{ speedMul, atkMul, defMul, rangeAdd, healPerSec, reveal, silence }}
 */
export function getTileModifiers(map, col, row, side, unit) {
  const out = {
    speedMul: 1,
    atkMul: 1,
    defMul: 1,
    rangeAdd: 0,
    healPerSec: 0,
    reveal: false,
    silence: false,
  };

  const key = `${col},${row}`;
  const terrain = map.terrain[key] || TERRAIN.NORMAL;

  if (side === 'hero') {
    if (terrain === TERRAIN.WATER) out.speedMul *= COMBAT.WATER_HERO_SLOW;
    if (terrain === TERRAIN.DARK) out.rangeAdd -= COMBAT.DARK_RANGE_PENALTY;
    if (terrain === TERRAIN.FIRE) out.speedMul *= 0.9;
    if (terrain === TERRAIN.ICE) out.speedMul *= 0.75;
    if (terrain === TERRAIN.POISON) out.speedMul *= 0.92;
  }

  if (side === 'monster' && unit) {
    const aff = terrainAffinityMods(unit.passive, terrain);
    out.atkMul *= aff.atkMul;
    out.defMul *= aff.defMul;
    out.speedMul *= aff.speedMul;
  }

  const buffs = map.buffIndex[key] || [];
  for (const b of buffs) {
    if (b.side !== 'both' && b.side !== side) continue;
    switch (b.kind) {
      case 'ATK_UP':
        out.atkMul *= b.value;
        break;
      case 'DEF_UP':
        out.defMul *= b.value;
        break;
      case 'SPEED_UP':
        out.speedMul *= b.value;
        break;
      case 'SPEED_DOWN':
        out.speedMul *= b.value;
        break;
      case 'HEAL_TICK':
        out.healPerSec += b.value;
        break;
      case 'REVEAL_AURA':
        if (side === 'hero') out.reveal = true;
        break;
      case 'SILENCE_ZONE':
        if (side === 'hero') out.silence = true;
        break;
      case 'FIRE_ZONE':
        if (side === 'monster') out.atkMul *= b.value || 1.25;
        if (side === 'hero') out.speedMul *= 0.88;
        break;
      case 'ICE_ZONE':
        if (side === 'monster') out.atkMul *= b.value || 1.25;
        if (side === 'hero') out.speedMul *= 0.8;
        break;
      case 'POISON_ZONE':
        if (side === 'monster') out.atkMul *= b.value || 1.25;
        if (side === 'hero') out.speedMul *= 0.9;
        break;
      default:
        break;
    }
  }

  return out;
}

/** Base stats at spawn — địa hình ảnh hưởng HP lúc đặt; ATK theo ô mỗi frame qua getTileModifiers */
export function spawnMonsterStats(template, terrain, upgradeLevel = 0, stageLevel = 1) {
  const stats = { ...template.stats };
  const aff = terrainAffinityMods(template.passive, terrain || TERRAIN.NORMAL);
  // ATK gốc không nhân affinity — để getTileModifiers không bị ×2
  let atkMul = 1;
  let hpMul = aff.hpMul;

  const upMul = monsterStatMul(
    Math.min(MONSTER_UPGRADE.MAX_LEVEL, Math.max(0, upgradeLevel || 0))
  );
  const stageMul = monsterScaleForLevel(stageLevel);
  atkMul *= upMul * stageMul;
  hpMul *= upMul * stageMul;

  // Sát thủ tàng hình: nhẹ hơn một chút HP nhưng ATK/spd approach mạnh hơn
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
  if (isAssassin) {
    hpMul *= 1.15;
    atkMul *= 1.28;
  } else if (isTank) {
    hpMul *= 1.4;
    atkMul *= 0.95;
  }
  hpMul *= raritySurvivabilityMul(template);

  return {
    baseHp: Math.round(stats.hp * hpMul),
    baseAtk: Math.round(stats.atk * atkMul),
    hp: Math.round(stats.hp * hpMul),
    maxHp: Math.round(stats.hp * hpMul),
    atk: Math.round(stats.atk * atkMul * aff.atkMul),
    speed: stats.speed * (isAssassin ? 1.1 : 1),
    rangeCells: stats.range,
    atkSpeed: stats.atkSpeed,
    upgradeLevel: upgradeLevel || 0,
    stageLevel: stageLevel || 1,
    stageMul,
  };
}
