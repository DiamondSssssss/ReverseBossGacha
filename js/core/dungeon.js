import { getStageMap, isPlaceable } from '../data/maps.js?v=100';
import { MONSTER_BY_ID } from '../data/monsters.js?v=100';
import { MAP_UPGRADE, COMBAT, MAX_STAGE } from '../data/constants.js?v=100';
import { buildWave, getWavePlan, assignHeroFormation } from '../data/heroes.js?v=100';
import {
  sanitizeLoadout,
  suggestLoadout,
  placeMaxCost,
  loadoutPoolMultForLevel,
} from './loadout.js?v=100';
import {
  frontierForMode,
  hardModifiersForLevel,
} from '../data/hardMode.js?v=100';

function reindexBuffs(map) {
  const buffIndex = {};
  for (const b of map.buffs || []) {
    for (const cell of b.cells || []) {
      if (!buffIndex[cell]) buffIndex[cell] = [];
      buffIndex[cell].push(b);
    }
  }
  map.buffIndex = buffIndex;
}

function applyHardMapMods(map, mods) {
  const delta = Number(mods.costCapDelta) || 0;
  if (delta) {
    map.baseCostCap = Math.max(1, (map.baseCostCap || map.costCap || 5) + delta);
  }
  if (mods.extraMapBuffs?.length) {
    map.buffs = [...(map.buffs || []), ...mods.extraMapBuffs];
    reindexBuffs(map);
  }
  const thMul = Number(mods.treasureHpMul);
  if (Number.isFinite(thMul) && thMul > 0 && thMul !== 1) {
    const base = map.treasureHp || COMBAT.TREASURE_HP;
    map.treasureHp = Math.max(40, Math.round(base * thMul));
  }
}

function scaleWaveHeroes(wave, mul) {
  if (!mul || mul === 1) return wave;
  for (const h of wave || []) {
    h.hp = Math.round((h.hp || h.maxHp || 0) * mul);
    h.maxHp = Math.round((h.maxHp || h.hp || 0) * mul);
    h.atk = Math.round((h.atk || 0) * mul);
  }
  return wave;
}

/**
 * @param {object} playerState
 * @param {{ mode?: 'normal'|'hard', level?: number }} [opts]
 */
export function createRunState(playerState, opts = {}) {
  const mode = opts.mode === 'hard' ? 'hard' : 'normal';
  const frontier = frontierForMode(playerState, mode);
  let level =
    opts.level != null ? Math.floor(Number(opts.level) || 1) : frontier;
  level = Math.max(1, Math.min(MAX_STAGE, level));
  if (level > frontier) level = frontier;

  const isReplay = level < frontier;
  const plan = getWavePlan(level);
  const map = getStageMap(level);
  const hardMods = mode === 'hard' ? hardModifiersForLevel(level) : null;
  if (hardMods) applyHardMapMods(map, hardMods);

  const upgradeLv = playerState.mapUpgrade || 0;
  /** Cap gốc (sau nâng hầm) — dùng cho pool loadout */
  const refCap = map.baseCostCap + upgradeLv * MAP_UPGRADE.COST_CAP_BONUS;
  map.refCostCap = refCap;
  /** Cap sân = Cap gốc (1×); pool mang = 3× hoặc 5× (boss) */
  map.costCap = placeMaxCost(refCap);
  map.upgradeLevel = upgradeLv;
  map.poolMult = loadoutPoolMultForLevel(level);

  let wave = assignHeroFormation(buildWave(level), map);
  if (hardMods) wave = scaleWaveHeroes(wave, hardMods.heroStatMul);

  const inv = playerState.inventory || {};
  let loadout = sanitizeLoadout(playerState.lastLoadout, inv, map.refCostCap, level);
  if (loadoutPoolEmpty(loadout)) {
    loadout = suggestLoadout(inv, map.refCostCap, level);
  }

  return {
    mode,
    difficulty: mode,
    level,
    isReplay,
    hardRules: hardMods?.rules || null,
    monsterStatMul: hardMods?.monsterStatMul || 1,
    treasureHpOverride: map.treasureHp || null,
    map,
    /** @deprecated compat — UI/combat use map only */
    rooms: [map],
    wave,
    waveTheme: plan.theme,
    waveTip: plan.tip || map.tip,
    selectedMonsterId: null,
    /** Quái mang vào xếp trận { id: count } */
    loadout,
    loadoutReady: false,
    appliedLoadoutKey: null,
    loadoutPoolCost: null,
  };
}

function loadoutPoolEmpty(loadout) {
  return !Object.values(loadout || {}).some((n) => n > 0);
}

export function mapUsedCost(map) {
  return map.placements.reduce((sum, p) => {
    const m = MONSTER_BY_ID[p.monsterId];
    return sum + (m ? m.cost : 0);
  }, 0);
}

/** @deprecated use mapUsedCost */
export function roomUsedCost(room) {
  return mapUsedCost(room);
}

export function canPlace(map, monsterId, col, row) {
  const m = MONSTER_BY_ID[monsterId];
  if (!m) return { ok: false, reason: 'Quái không tồn tại' };
  if (!isPlaceable(map, col, row)) {
    return { ok: false, reason: 'Ô không đặt được (tường / cổng / kho)' };
  }
  if (map.placements.some((p) => p.col === col && p.row === row)) {
    return { ok: false, reason: 'Ô đã có quái' };
  }
  const used = mapUsedCost(map);
  if (used + m.cost > map.costCap) {
    return { ok: false, reason: `Vượt Cost (${used + m.cost}/${map.costCap})` };
  }
  return { ok: true };
}

export function placeMonster(run, _roomIndex, monsterId, col, row, inventory) {
  const map = run.map;
  const maxU = run.challenge?.constraints?.maxUnits;
  if (maxU != null && map.placements.length >= maxU) {
    return { ok: false, reason: `Thử thách tối đa ${maxU} unit trên sân` };
  }
  const check = canPlace(map, monsterId, col, row);
  if (!check.ok) return check;
  if (!(inventory[monsterId] > 0)) {
    return { ok: false, reason: 'Không còn trong kho' };
  }
  map.placements.push({ monsterId, col, row });
  inventory[monsterId] -= 1;
  if (inventory[monsterId] <= 0) delete inventory[monsterId];
  return { ok: true };
}

export function removePlacement(run, _roomIndex, col, row, inventory) {
  const map = run.map;
  const idx = map.placements.findIndex((p) => p.col === col && p.row === row);
  if (idx < 0) return false;
  const [p] = map.placements.splice(idx, 1);
  inventory[p.monsterId] = (inventory[p.monsterId] || 0) + 1;
  return true;
}

export function totalPlacements(run) {
  return run.map?.placements?.length || 0;
}

export function upgradeMapCost(currentLevel) {
  return Math.round(
    MAP_UPGRADE.COST_BASE * Math.pow(MAP_UPGRADE.COST_GROWTH, currentLevel)
  );
}

/** @deprecated */
export function upgradeRoomCost(currentLevel) {
  return upgradeMapCost(currentLevel);
}

export function tryUpgradeMap(playerState) {
  const lvl = playerState.mapUpgrade || 0;
  if (lvl >= MAP_UPGRADE.MAX_LEVEL) {
    return { ok: false, reason: 'Đã max cấp hầm' };
  }
  const cost = upgradeMapCost(lvl);
  if ((playerState.gems || 0) < cost) {
    return { ok: false, reason: 'Không đủ Gem' };
  }
  playerState.gems -= cost;
  playerState.mapUpgrade = lvl + 1;
  return { ok: true, level: lvl + 1, cost };
}

/** @deprecated — upgrades global map cap */
export function tryUpgradeRoom(playerState, _roomId) {
  return tryUpgradeMap(playerState);
}
