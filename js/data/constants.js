/** @typedef {'WATER'|'LOW_CEILING'|'DARK'|'NORMAL'|'HIGH'} Terrain */

export const SAVE_KEY = 'rbg_save_v2';

export const GACHA = {
  PULL_COST_SOULS: 100,
  PULL10_COST_SOULS: 900,
  PITY_THRESHOLD: 50,
  RATES: {
    common: 0.6,   // 1★
    rare: 0.3,     // 2★–3★
    epic: 0.08,    // 4★
    legendary: 0.02, // 5★
  },
};

export const COST_BY_RARITY = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
};

export const COMBAT = {
  TREASURE_HP: 120,
  PANIC_HP_RATIO: 0.28,
  GRID_COLS: 6,
  GRID_ROWS: 3,
  CELL_SIZE: 48,
  TICK_CAP_MS: 50,
  HERO_SPAWN_INTERVAL: 2.5,
};

export const SPELLS = {
  slow_wave: {
    id: 'slow_wave',
    name: 'Sương Chậm',
    desc: 'Làm chậm toàn bộ Hero 50% trong 4s',
    cooldown: 18,
    duration: 4,
    slowFactor: 0.5,
  },
  heal_monsters: {
    id: 'heal_monsters',
    name: 'Huyết Ấn',
    desc: 'Hồi 30% HP tối đa cho mọi quái',
    cooldown: 22,
    healRatio: 0.3,
  },
};

export const ROOM_UPGRADE = {
  COST_BASE: 200,
  COST_GROWTH: 1.5,
  COST_CAP_BONUS: 2,
  MAX_LEVEL: 5,
};

export const REWARDS = {
  WIN_SOULS_BASE: 180,
  WIN_GOLD_BASE: 80,
  PER_HERO_SOULS: 25,
  PER_HERO_GOLD: 12,
  LOSE_SOULS: 40,
};

export const STARTING = {
  souls: 0,
  gold: 0,
  gems: 0,
  /** Chỉ vài quái 1★ mở sẵn — còn lại phải quay / thắng ải */
  starterMonsters: {
    goblin_bait: 3,
    bone_pile: 2,
    candle_bug: 2,
  },
};

export const TERRAIN_LABELS = {
  NORMAL: 'Thường',
  WATER: 'Ngập nước',
  LOW_CEILING: 'Trần thấp',
  DARK: 'Tối',
  HIGH: 'Trần cao / Rộng',
};

export const RARITY_LABELS = {
  1: 'Common',
  2: 'Rare',
  3: 'Rare+',
  4: 'Epic',
  5: 'Legendary',
};

export const RARITY_COLORS = {
  1: '#7a7164',
  2: '#2f6f5e',
  3: '#3d7a6a',
  4: '#5b4a7a',
  5: '#9a6b2a',
};
