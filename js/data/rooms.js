import { COMBAT } from './constants.js';

/** Terrain templates & dungeon layouts */

export const TERRAIN = {
  NORMAL: 'NORMAL',
  WATER: 'WATER',
  LOW_CEILING: 'LOW_CEILING',
  DARK: 'DARK',
  HIGH: 'HIGH',
};

/**
 * Base dungeon template — rooms between Gate and Treasure.
 * costCap can be boosted by room upgrades at runtime.
 */
export const DUNGEON_TEMPLATE = {
  id: 'main_dungeon',
  name: 'Hầm Ngục Sếp Tổng',
  rooms: [
    {
      id: 'room_1',
      name: 'Hành Lang Ẩm',
      terrain: TERRAIN.WATER,
      costCap: 6,
      cols: COMBAT.GRID_COLS,
      rows: COMBAT.GRID_ROWS,
    },
    {
      id: 'room_2',
      name: 'Hầm Trần Thấp',
      terrain: TERRAIN.LOW_CEILING,
      costCap: 8,
      cols: COMBAT.GRID_COLS,
      rows: COMBAT.GRID_ROWS,
    },
    {
      id: 'room_3',
      name: 'Phòng Tối',
      terrain: TERRAIN.DARK,
      costCap: 7,
      cols: COMBAT.GRID_COLS,
      rows: COMBAT.GRID_ROWS,
    },
    {
      id: 'room_4',
      name: 'Sảnh Rộng',
      terrain: TERRAIN.HIGH,
      costCap: 10,
      cols: COMBAT.GRID_COLS,
      rows: COMBAT.GRID_ROWS,
    },
  ],
};

export function cloneDungeonRooms() {
  return DUNGEON_TEMPLATE.rooms.map((r) => ({
    ...r,
    placements: [], // { monsterId, col, row }
  }));
}
