/** @typedef {'WATER'|'LOW_CEILING'|'DARK'|'NORMAL'|'HIGH'} Terrain */

export const SAVE_KEY = 'rbg_save_v2';

export const GACHA = {
  PULL_COST_SOULS: 100,
  PULL10_COST_SOULS: 900,
  /** Pity Legendary (5★) */
  PITY_THRESHOLD: 50,
  /** Pity Mythic (6★) */
  MYTHIC_PITY_THRESHOLD: 100,
  RATES: {
    common: 0.58, // 1★
    rare: 0.3, // 2★–3★
    epic: 0.085, // 4★
    legendary: 0.03, // 5★
    mythic: 0.005, // 6★
  },
};

export const COST_BY_RARITY = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 9,
};

export const COMBAT = {
  TREASURE_HP: 120,
  PANIC_HP_RATIO: 0.28,
  GRID_COLS: 14,
  GRID_ROWS: 8,
  CELL_SIZE: 44,
  TICK_CAP_MS: 50,
  HERO_SPAWN_INTERVAL: 3.5,
  /** Tốc độ gốc chậm để xem được; nút ×1/×2/×3 nhân lên */
  BASE_TIME_SCALE: 0.52,
  /** Camera trái tối thiểu — hiện Cổng + hero đang vào */
  CAMERA_MIN_X: -40,
  WATER_HERO_SLOW: 0.85,
  DARK_RANGE_PENALTY: 0.5,
};

export const SPELLS = {
  slow_wave: {
    id: 'slow_wave',
    name: 'Sương Chậm',
    desc: 'Làm chậm toàn bộ Hero 50% trong 4s',
    cooldown: 18,
    kind: 'slow',
    duration: 4,
    slowFactor: 0.5,
  },
  heal_monsters: {
    id: 'heal_monsters',
    name: 'Huyết Ấn',
    desc: 'Hồi 30% HP tối đa cho mọi quái',
    cooldown: 22,
    kind: 'heal',
    healRatio: 0.3,
  },
  treasure_ward: {
    id: 'treasure_ward',
    name: 'Khiên Kho',
    desc: 'Kho nhận khiên hấp thụ 45 sát thương trong 6s',
    cooldown: 20,
    kind: 'treasure_shield',
    shieldHp: 45,
    duration: 6,
  },
  knock_back: {
    id: 'knock_back',
    name: 'Đẩy Cổng',
    desc: 'Đẩy mọi Hero lùi về phía Cổng ~2 ô',
    cooldown: 16,
    kind: 'knock',
    cells: 2,
  },
  poison_mire: {
    id: 'poison_mire',
    name: 'Đầm Độc',
    desc: 'Hero trúng độc: mất HP theo thời gian trong 5s',
    cooldown: 19,
    kind: 'poison',
    duration: 5,
    dps: 12,
  },
  war_drum: {
    id: 'war_drum',
    name: 'Trống Chiến',
    desc: 'Quái +40% ATK trong 5s',
    cooldown: 21,
    kind: 'rage',
    duration: 5,
    atkMul: 1.4,
  },
  eye_flare: {
    id: 'eye_flare',
    name: 'Mắt Soi',
    desc: 'Phá tàng hình mọi Hero + Silence 3s',
    cooldown: 17,
    kind: 'reveal_silence',
    duration: 3,
  },
  quake_stun: {
    id: 'quake_stun',
    name: 'Địa Chấn',
    desc: 'Choáng toàn bộ Hero 1.6s',
    cooldown: 24,
    kind: 'stun',
    duration: 1.6,
  },
};

/** Sở hữu tối đa mỗi loại quái — dư hoàn Linh Hồn */
export const INVENTORY_CAP = 3;

/** Hoàn LH khi quay trùng / vượt cap (theo độ hiếm) */
export const DUPLICATE_SOUL_REFUND = {
  1: 25,
  2: 40,
  3: 55,
  4: 90,
  5: 160,
  6: 280,
};

/** Nâng cấp quái bằng Vàng */
export const MONSTER_UPGRADE = {
  MAX_LEVEL: 5,
  /** +12% HP/ATK mỗi cấp */
  STAT_PER_LEVEL: 0.12,
  COST_BASE: 40,
  COST_GROWTH: 1.45,
  RARITY_MULT: { 1: 1, 2: 1.25, 3: 1.6, 4: 2.2, 5: 3.2, 6: 4.5 },
};

/**
 * Cải tạo hầm bằng Gem — tăng Cost cap mọi ải.
 * Cap gốc map ~5–12; muốn rộng phải nâng hầm (sink Gem muộn game).
 */
export const MAP_UPGRADE = {
  COST_BASE: 1,
  COST_GROWTH: 1.5,
  COST_CAP_BONUS: 2,
  /** Trước 6 — mở rộng vì ải 50 + người chơi dư Gem */
  MAX_LEVEL: 12,
};

/** @deprecated alias */
export const ROOM_UPGRADE = MAP_UPGRADE;

export const TILE_LABELS = {
  WALL: 'Tường',
  WATER: 'Nước',
  DARK: 'Tối',
  LOW_CEILING: 'Trần thấp',
  HIGH: 'Trần cao',
  OBSTACLE: 'Chướng ngại',
  HAZARD: 'Nguy hiểm',
  NOPLACE: 'Hành lang (không đặt)',
};

export const REWARDS = {
  WIN_SOULS_BASE: 180,
  WIN_GOLD_BASE: 80,
  PER_HERO_SOULS: 25,
  PER_HERO_GOLD: 12,
  LOSE_SOULS: 60,
  /** Thua nhưng vẫn thưởng vàng theo Hero đã hạ / bỏ chạy */
  LOSE_PER_HERO_GOLD: 50,
};

export const STARTING = {
  /** Đủ 1 lần quay Gacha sau tutorial — tránh tay trắng kẹt loop */
  souls: 120,
  gold: 50,
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

export const TERRAIN_HINTS = {
  NORMAL: 'Không buff đặc biệt',
  WATER: 'Buff quái hệ nước; Hero chậm trên nước',
  LOW_CEILING: 'Buff quái trần thấp (đặt đúng ô l)',
  DARK: 'Buff quái bóng tối; Hero giảm tầm',
  HIGH: 'Trần cao — quái trần thấp yếu đi',
};

/** Ải cuối chế độ chính (thắng → dungeonLevel = MAX_STAGE + 1). */
export const MAX_STAGE = 50;

export const HERO_CLASS_LABELS = {
  MAGE: 'Pháp sư',
  WARRIOR: 'Chiến sĩ',
  ROGUE: 'Đạo tặc',
  HEALER: 'Hồi máu',
  ARCHER: 'Cung thủ',
  TANK: 'Thuần tank',
  BERSERKER: 'Berserker',
};

export const LANE_LABELS = ['Trên', 'Giữa', 'Dưới'];

export const RARITY_LABELS = {
  1: 'Common',
  2: 'Rare',
  3: 'Rare+',
  4: 'Epic',
  5: 'Legendary',
  6: 'Mythic',
};

export const RARITY_COLORS = {
  1: '#7a7164',
  2: '#2f6f5e',
  3: '#3d7a6a',
  4: '#5b4a7a',
  5: '#9a6b2a',
  6: '#c62828',
};
