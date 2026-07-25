import { cloneDungeonRooms } from '../data/rooms.js';
import { MONSTER_BY_ID } from '../data/monsters.js';
import { ROOM_UPGRADE } from '../data/constants.js';
import { buildWave, getWavePlan } from '../data/heroes.js';

export function createRunState(playerState) {
  const level = playerState.dungeonLevel || 1;
  const plan = getWavePlan(level);
  const rooms = cloneDungeonRooms().map((room) => {
    const lvl = playerState.roomUpgrades[room.id] || 0;
    return {
      ...room,
      costCap: room.costCap + lvl * ROOM_UPGRADE.COST_CAP_BONUS,
      upgradeLevel: lvl,
      placements: [],
    };
  });

  return {
    level,
    rooms,
    wave: buildWave(level),
    waveTheme: plan.theme,
    waveTip: plan.tip,
    selectedMonsterId: null,
    selectedRoomIndex: 0,
  };
}

export function roomUsedCost(room) {
  return room.placements.reduce((sum, p) => {
    const m = MONSTER_BY_ID[p.monsterId];
    return sum + (m ? m.cost : 0);
  }, 0);
}

export function canPlace(room, monsterId, col, row) {
  const m = MONSTER_BY_ID[monsterId];
  if (!m) return { ok: false, reason: 'Quái không tồn tại' };
  if (col < 0 || row < 0 || col >= room.cols || row >= room.rows) {
    return { ok: false, reason: 'Ngoài lưới' };
  }
  if (room.placements.some((p) => p.col === col && p.row === row)) {
    return { ok: false, reason: 'Ô đã có quái' };
  }
  const used = roomUsedCost(room);
  if (used + m.cost > room.costCap) {
    return { ok: false, reason: `Vượt Cost (${used + m.cost}/${room.costCap})` };
  }
  return { ok: true };
}

export function placeMonster(run, roomIndex, monsterId, col, row, inventory) {
  const room = run.rooms[roomIndex];
  const check = canPlace(room, monsterId, col, row);
  if (!check.ok) return check;
  if (!(inventory[monsterId] > 0)) {
    return { ok: false, reason: 'Không còn trong kho' };
  }
  room.placements.push({ monsterId, col, row });
  inventory[monsterId] -= 1;
  if (inventory[monsterId] <= 0) delete inventory[monsterId];
  return { ok: true };
}

export function removePlacement(run, roomIndex, col, row, inventory) {
  const room = run.rooms[roomIndex];
  const idx = room.placements.findIndex((p) => p.col === col && p.row === row);
  if (idx < 0) return false;
  const [p] = room.placements.splice(idx, 1);
  inventory[p.monsterId] = (inventory[p.monsterId] || 0) + 1;
  return true;
}

export function totalPlacements(run) {
  return run.rooms.reduce((n, r) => n + r.placements.length, 0);
}

export function upgradeRoomCost(currentLevel) {
  return Math.round(
    ROOM_UPGRADE.COST_BASE * Math.pow(ROOM_UPGRADE.COST_GROWTH, currentLevel)
  );
}

export function tryUpgradeRoom(playerState, roomId) {
  const lvl = playerState.roomUpgrades[roomId] || 0;
  if (lvl >= ROOM_UPGRADE.MAX_LEVEL) {
    return { ok: false, reason: 'Đã max cấp phòng' };
  }
  const cost = upgradeRoomCost(lvl);
  if (playerState.gold < cost) {
    return { ok: false, reason: 'Không đủ Vàng' };
  }
  playerState.gold -= cost;
  playerState.roomUpgrades[roomId] = lvl + 1;
  return { ok: true, level: lvl + 1, cost };
}
