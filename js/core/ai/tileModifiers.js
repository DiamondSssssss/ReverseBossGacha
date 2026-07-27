import { TERRAIN } from '../../data/rooms.js?v=71';
import { COMBAT, MONSTER_UPGRADE } from '../../data/constants.js?v=71';
import { monsterStatMul } from '../monsterUpgrade.js?v=71';
import { monsterScaleForLevel } from '../../data/heroes.js?v=71';

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
    switch (unit.passive) {
      case 'WATER_BUFF':
        if (terrain === TERRAIN.WATER) out.atkMul *= 1.4;
        break;
      case 'DARK_BUFF':
        if (terrain === TERRAIN.DARK) out.atkMul *= 2;
        break;
      case 'FIRE_BUFF':
        if (terrain === TERRAIN.FIRE) out.atkMul *= 1.45;
        break;
      case 'ICE_BUFF':
        if (terrain === TERRAIN.ICE) out.atkMul *= 1.4;
        break;
      case 'POISON_BUFF':
        if (terrain === TERRAIN.POISON) out.atkMul *= 1.4;
        break;
      case 'BUFF_IN_LOW_CEILING_ROOM':
        if (terrain === TERRAIN.HIGH) out.atkMul *= 0.5;
        else if (terrain === TERRAIN.LOW_CEILING || terrain === TERRAIN.DARK) {
          out.atkMul *= 3;
        }
        break;
      default:
        break;
    }
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

/** Base stats at spawn — địa hình + cấp nâng quái (vàng) + scale ải */
export function spawnMonsterStats(template, terrain, upgradeLevel = 0, stageLevel = 1) {
  const stats = { ...template.stats };
  let atkMul = 1;
  let hpMul = 1;

  switch (template.passive) {
    case 'BUFF_IN_LOW_CEILING_ROOM':
      if (terrain === 'HIGH') atkMul = 0.5;
      else if (terrain === 'LOW_CEILING' || terrain === 'DARK') atkMul = 3;
      break;
    case 'WATER_BUFF':
      if (terrain === 'WATER') {
        atkMul = 1.4;
        hpMul = 1.4;
      }
      break;
    case 'DARK_BUFF':
      if (terrain === 'DARK') atkMul = 2;
      break;
    case 'FIRE_BUFF':
      if (terrain === 'FIRE') {
        atkMul = 1.45;
        hpMul = 1.2;
      }
      break;
    case 'ICE_BUFF':
      if (terrain === 'ICE') {
        atkMul = 1.4;
        hpMul = 1.2;
      }
      break;
    case 'POISON_BUFF':
      if (terrain === 'POISON') {
        atkMul = 1.4;
        hpMul = 1.15;
      }
      break;
    default:
      break;
  }

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

  return {
    baseHp: Math.round(stats.hp * hpMul),
    baseAtk: Math.round(stats.atk * atkMul),
    hp: Math.round(stats.hp * hpMul),
    maxHp: Math.round(stats.hp * hpMul),
    atk: Math.round(stats.atk * atkMul),
    speed: stats.speed * (isAssassin ? 1.1 : 1),
    rangeCells: stats.range,
    atkSpeed: stats.atkSpeed,
    upgradeLevel: upgradeLevel || 0,
    stageLevel: stageLevel || 1,
    stageMul,
  };
}
