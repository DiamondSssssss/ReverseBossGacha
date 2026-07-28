import { COMBAT } from './constants.js?v=101';

/** @deprecated Multi-room strip removed — see maps.js STAGE_MAPS */

export const TERRAIN = {
  NORMAL: 'NORMAL',
  WATER: 'WATER',
  LOW_CEILING: 'LOW_CEILING',
  DARK: 'DARK',
  HIGH: 'HIGH',
  FIRE: 'FIRE',
  ICE: 'ICE',
  POISON: 'POISON',
};

/**
 * Legacy template kept for reference / migration docs.
 * Runtime uses getStageMap() from maps.js.
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
  ],
};

export function cloneDungeonRooms() {
  return DUNGEON_TEMPLATE.rooms.map((r) => ({
    ...r,
    placements: [],
  }));
}

