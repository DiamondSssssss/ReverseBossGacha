import { getStageMap, isPlaceable } from '../data/maps.js';
import { MONSTER_BY_ID } from '../data/monsters.js?v=54';
import { MAP_UPGRADE } from '../data/constants.js';
import { buildWave, getWavePlan, assignHeroFormation } from '../data/heroes.js';
import { sanitizeLoadout, suggestLoadout } from './loadout.js';

export function createRunState(playerState) {
  const level = playerState.dungeonLevel || 1;
  const plan = getWavePlan(level);
  const map = getStageMap(level);
  const upgradeLv = playerState.mapUpgrade || 0;
  map.costCap = map.baseCostCap + upgradeLv * MAP_UPGRADE.COST_CAP_BONUS;
  map.upgradeLevel = upgradeLv;

  const wave = assignHeroFormation(buildWave(level), map);
  const inv = playerState.inventory || {};
  let loadout = sanitizeLoadout(playerState.lastLoadout, inv, map.costCap);
  if (loadoutPoolEmpty(loadout)) {
    loadout = suggestLoadout(inv, map.costCap);
  }

  return {
    level,
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
