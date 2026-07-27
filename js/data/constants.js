/** @typedef {'WATER'|'LOW_CEILING'|'DARK'|'NORMAL'|'HIGH'} Terrain */

export const SAVE_KEY = 'rbg_save_v2';

export const GACHA = {
  PULL_COST_SOULS: 100,
  PULL10_COST_SOULS: 900,
  /** Pity Legendary (5★) */
  PITY_THRESHOLD: 50,
  /** Pity Mythic (6★) */
  MYTHIC_PITY_THRESHOLD: 100,
  /** Pity Cầu vồng (7★) — rất dài */
  RAINBOW_PITY_THRESHOLD: 200,
  RATES: {
    common: 0.5792, // 1★
    rare: 0.3, // 2★–3★
    epic: 0.085, // 4★
    legendary: 0.03, // 5★
    mythic: 0.005, // 6★
    rainbow: 0.0008, // 7★
  },
};

export const COST_BY_RARITY = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 9,
  7: 15,
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
  hemofrost: {
    id: 'hemofrost',
    name: 'Huyết Sương',
    desc: 'Làm chậm toàn bộ Hero 45% trong 4.5s',
    cooldown: 18,
    kind: 'slow',
    duration: 4.5,
    slowFactor: 0.55,
  },
  crimson_thaw: {
    id: 'crimson_thaw',
    name: 'Tan Huyết',
    desc: 'Hồi 26% HP tối đa cho mọi quái',
    cooldown: 23,
    kind: 'heal',
    healRatio: 0.26,
  },
  bastion_skin: {
    id: 'bastion_skin',
    name: 'Da Thành',
    desc: 'Kho nhận khiên hấp thụ 55 sát thương trong 7s',
    cooldown: 21,
    kind: 'treasure_shield',
    shieldHp: 55,
    duration: 7,
  },
  gate_ram: {
    id: 'gate_ram',
    name: 'Húc Cổng',
    desc: 'Đẩy mọi Hero lùi 3 ô về phía cổng vào',
    cooldown: 17,
    kind: 'knock',
    cells: 3,
  },
  venom_fog: {
    id: 'venom_fog',
    name: 'Vụ Độc',
    desc: 'Hero trúng độc 6s, mất 11 HP mỗi giây',
    cooldown: 19,
    kind: 'poison',
    duration: 6,
    dps: 11,
  },
  carrion_howl: {
    id: 'carrion_howl',
    name: 'Tru Hủ',
    desc: 'Quái +32% ATK trong 6s',
    cooldown: 22,
    kind: 'rage',
    duration: 6,
    atkMul: 1.32,
  },
  black_lantern: {
    id: 'black_lantern',
    name: 'Đèn Đen',
    desc: 'Phá tàng hình mọi Hero và silence 3.5s',
    cooldown: 17,
    kind: 'reveal_silence',
    duration: 3.5,
  },
  void_pulse: {
    id: 'void_pulse',
    name: 'Mạch Không',
    desc: 'Choáng toàn bộ Hero 1.4s',
    cooldown: 23,
    kind: 'stun',
    duration: 1.4,
  },
  inferno_banner: {
    id: 'inferno_banner',
    name: 'Cờ Dung Nham',
    desc: 'Quái +55% ATK trong 4.5s',
    cooldown: 24,
    kind: 'rage',
    duration: 4.5,
    atkMul: 1.55,
  },
  blast_furnace: {
    id: 'blast_furnace',
    name: 'Lò Xung Kích',
    desc: 'Sóng nhiệt đẩy mọi Hero lùi 2 ô',
    cooldown: 15,
    kind: 'knock',
    cells: 2,
  },
  winter_wake: {
    id: 'winter_wake',
    name: 'Gọi Đông',
    desc: 'Làm chậm toàn bộ Hero 42% trong 5.5s',
    cooldown: 20,
    kind: 'slow',
    duration: 5.5,
    slowFactor: 0.58,
  },
  grave_bloom: {
    id: 'grave_bloom',
    name: 'Nở Mộ',
    desc: 'Hồi 18% HP tối đa cho mọi quái',
    cooldown: 18,
    kind: 'heal',
    healRatio: 0.18,
  },
  rot_tide: {
    id: 'rot_tide',
    name: 'Triều Thối',
    desc: 'Hero trúng độc 4.5s, mất 16 HP mỗi giây',
    cooldown: 18,
    kind: 'poison',
    duration: 4.5,
    dps: 16,
  },
  seer_pupil: {
    id: 'seer_pupil',
    name: 'Đồng Tử Soi',
    desc: 'Phá tàng hình mọi Hero và silence 2.5s',
    cooldown: 15,
    kind: 'reveal_silence',
    duration: 2.5,
  },
  vault_oath: {
    id: 'vault_oath',
    name: 'Thệ Kho Báu',
    desc: 'Kho nhận khiên hấp thụ 80 sát thương trong 8s',
    cooldown: 24,
    kind: 'treasure_shield',
    shieldHp: 80,
    duration: 8,
  },
  stone_feast: {
    id: 'stone_feast',
    name: 'Yến Đá',
    desc: 'Hồi 20% HP tối đa cho mọi quái',
    cooldown: 20,
    kind: 'heal',
    healRatio: 0.2,
  },
  doom_march: {
    id: 'doom_march',
    name: 'Hành Khúc Tai Kiếp',
    desc: 'Quái +25% ATK trong 8s',
    cooldown: 20,
    kind: 'rage',
    duration: 8,
    atkMul: 1.25,
  },
  ruin_bell: {
    id: 'ruin_bell',
    name: 'Chuông Sụp Đổ',
    desc: 'Choáng toàn bộ Hero 2s',
    cooldown: 25,
    kind: 'stun',
    duration: 2,
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
  7: 500,
};

/** Nâng cấp quái bằng Vàng */
export const MONSTER_UPGRADE = {
  MAX_LEVEL: 5,
  /** +14% HP/ATK mỗi cấp — bám hero scale muộn game */
  STAT_PER_LEVEL: 0.14,
  COST_BASE: 40,
  COST_GROWTH: 1.45,
  RARITY_MULT: { 1: 1, 2: 1.25, 3: 1.6, 4: 2.2, 5: 3.2, 6: 4.5, 7: 6.5 },
};

/**
 * Cải tạo hầm bằng Gem — tăng Cost cap mọi ải.
 * Cap gốc map ~5–12; muốn rộng phải nâng hầm (sink Gem muộn game).
 */
export const MAP_UPGRADE = {
  COST_BASE: 1,
  COST_GROWTH: 1.5,
  COST_CAP_BONUS: 2,
  /** Trước 6 — mở rộng vì ải 60 + người chơi dư Gem */
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
export const MAX_STAGE = 60;

export const HERO_CLASS_LABELS = {
  MAGE: 'Pháp sư',
  WARRIOR: 'Chiến sĩ',
  ROGUE: 'Đạo tặc',
  HEALER: 'Hồi máu',
  ARCHER: 'Cung thủ',
  TANK: 'Thuần tank',
  BERSERKER: 'Berserker',
  HEXER: 'Diệt hồi',
  SCOUT: 'Trinh sát',
  BOSS: 'Hero Boss',
};

export const LANE_LABELS = ['Trên', 'Giữa', 'Dưới'];

export const RARITY_LABELS = {
  1: 'Common',
  2: 'Rare',
  3: 'Rare+',
  4: 'Epic',
  5: 'Legendary',
  6: 'Mythic',
  7: 'Cầu vồng',
};

export const RARITY_COLORS = {
  1: '#7a7164',
  2: '#2f6f5e',
  3: '#3d7a6a',
  4: '#5b4a7a',
  5: '#9a6b2a',
  6: '#c62828',
  7: '#e040fb',
};

/** Ải Hero Boss — pool mang ×5, map dài */
export const BOSS_FIGHT_STAGES = [40, 45, 50, 55, 60];
