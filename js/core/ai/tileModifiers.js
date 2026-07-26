import { TERRAIN } from '../../data/rooms.js?v=67';
import { COMBAT, MONSTER_UPGRADE } from '../../data/constants.js?v=67';
import { monsterStatMul } from '../monsterUpgrade.js?v=67';

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

  // Terrain effects
  if (side === 'hero') {
    if (terrain === TERRAIN.WATER) out.speedMul *= COMBAT.WATER_HERO_SLOW;
    if (terrain === TERRAIN.DARK) out.rangeAdd -= COMBAT.DARK_RANGE_PENALTY;
  }

  if (side === 'monster' && unit) {
    switch (unit.passive) {
      case 'WATER_BUFF':
        if (terrain === TERRAIN.WATER) {
          out.atkMul *= 1.4;
          // HP already scaled at spawn if placed on water; keep atk continuous
        }
        break;
      case 'DARK_BUFF':
        if (terrain === TERRAIN.DARK) out.atkMul *= 2;
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

  // Buff zones
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
      default:
        break;
    }
  }

  return out;
}

/** Base stats at spawn — địa hình + cấp nâng quái (vàng) */
export function spawnMonsterStats(template, terrain, upgradeLevel = 0) {
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
    default:
      break;
  }

  const upMul = monsterStatMul(
    Math.min(MONSTER_UPGRADE.MAX_LEVEL, Math.max(0, upgradeLevel || 0))
  );
  atkMul *= upMul;
  hpMul *= upMul;

  return {
    baseHp: Math.round(stats.hp * hpMul),
    baseAtk: Math.round(stats.atk * atkMul),
    hp: Math.round(stats.hp * hpMul),
    maxHp: Math.round(stats.hp * hpMul),
    atk: Math.round(stats.atk * atkMul),
    speed: stats.speed,
    rangeCells: stats.range,
    atkSpeed: stats.atkSpeed,
    upgradeLevel: upgradeLevel || 0,
  };
}
