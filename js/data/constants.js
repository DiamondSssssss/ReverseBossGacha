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
    desc: 'Làm chậm toàn bộ Hero 45% trong 4.5s và rỉa 5% HP tối đa',
    cooldown: 18,
    kind: 'slow_chip',
    duration: 4.5,
    slowFactor: 0.55,
    damageRatio: 0.05,
  },
  blood_thorns: {
    id: 'blood_thorns',
    name: 'Gai Máu',
    desc: 'Quái phản 35% sát thương Hero gây ra trong 5s',
    cooldown: 22,
    kind: 'reflect_aura',
    duration: 5,
    reflectRatio: 0.35,
  },
  bastion_skin: {
    id: 'bastion_skin',
    name: 'Da Thành',
    desc: 'Kho nhận khiên 55 trong 6.5s, 3 quái gần kho nhận khiên 12% HP',
    cooldown: 21,
    kind: 'treasure_barrier',
    shieldHp: 55,
    duration: 6.5,
    allyShieldRatio: 0.12,
    allyCount: 3,
  },
  gate_ram: {
    id: 'gate_ram',
    name: 'Húc Cổng',
    desc: 'Đẩy mọi Hero lùi 3 ô và gây 16 sát thương',
    cooldown: 17,
    kind: 'knock_strike',
    cells: 3,
    damage: 16,
  },
  venom_fog: {
    id: 'venom_fog',
    name: 'Vụ Độc',
    desc: 'Hero trúng độc 6s, mất 18 HP mỗi giây và giảm hồi 45%',
    cooldown: 19,
    kind: 'poison_healcut',
    duration: 6,
    dps: 18,
    healCutFactor: 0.55,
  },
  carrion_howl: {
    id: 'carrion_howl',
    name: 'Tru Hủ',
    desc: 'Quái +28% ATK và +18% tốc đánh trong 6s',
    cooldown: 22,
    kind: 'rage_haste',
    duration: 6,
    atkMul: 1.28,
    atkSpeedMul: 1.18,
  },
  black_lantern: {
    id: 'black_lantern',
    name: 'Đèn Đen',
    desc: 'Phá tàng hình mọi Hero, silence 3.2s và giảm giáp 18%',
    cooldown: 17,
    kind: 'reveal_mark',
    duration: 3.2,
    defShredFactor: 0.82,
  },
  void_pulse: {
    id: 'void_pulse',
    name: 'Mạch Không',
    desc: 'Nổ vùng tại cụm Hero dẫn đầu: gây 12% HP tối đa + 14 damage, choáng 0.8s',
    cooldown: 24,
    kind: 'cluster_blast',
    radius: 2.2,
    damageRatio: 0.12,
    damageFlat: 14,
    stunDuration: 0.8,
  },
  inferno_banner: {
    id: 'inferno_banner',
    name: 'Cờ Dung Nham',
    desc: 'Dựng vùng dung nham 4.2s tại cụm Hero dẫn đầu, đốt 18 DPS',
    cooldown: 25,
    kind: 'ember_field',
    duration: 4.2,
    radius: 2.1,
    dps: 18,
  },
  blast_furnace: {
    id: 'blast_furnace',
    name: 'Lò Xung Kích',
    desc: 'Sóng nhiệt đẩy mọi Hero lùi 2 ô và đốt 16 DPS trong 3.2s',
    cooldown: 16,
    kind: 'knock_burn',
    cells: 2,
    dps: 16,
    duration: 3.2,
  },
  soul_tether: {
    id: 'soul_tether',
    name: 'Dây Hồn',
    desc: 'Liên kết 3 Hero dẫn đầu 5s — mỗi người nhận 40% sát thương của người kia',
    cooldown: 21,
    kind: 'soul_link',
    count: 3,
    duration: 5,
    shareRatio: 0.4,
  },
  ossuary_yank: {
    id: 'ossuary_yank',
    name: 'Giật Cốt',
    desc: 'Kéo mọi Hero về phía kho 2 ô rồi neo chân (choáng) 1.1s',
    cooldown: 19,
    kind: 'gravity_yank',
    cells: 2,
    rootDuration: 1.1,
  },
  rot_tide: {
    id: 'rot_tide',
    name: 'Triều Thối',
    desc: 'Mưa axit lên cụm Hero dẫn đầu: 10% HP tối đa ngay lập tức + độc 20 DPS trong 4s',
    cooldown: 20,
    kind: 'acid_rain',
    radius: 2,
    damageRatio: 0.1,
    duration: 4,
    dps: 20,
  },
  seer_pupil: {
    id: 'seer_pupil',
    name: 'Đồng Tử Soi',
    desc: 'Silence + giảm 45% ATK và 50% tầm đánh của 2 Hero ở xa kho nhất trong 3.5s',
    cooldown: 16,
    kind: 'backline_sap',
    count: 2,
    duration: 3.5,
    atkFactor: 0.55,
    rangeFactor: 0.5,
  },
  vault_oath: {
    id: 'vault_oath',
    name: 'Thệ Kho Báu',
    desc: 'Toàn bộ quái nhận khiên 14% HP trong 4.8s',
    cooldown: 26,
    kind: 'monster_barrier',
    shieldRatio: 0.14,
    duration: 4.8,
  },
  garrison_spike: {
    id: 'garrison_spike',
    name: 'Gai Thành',
    desc: 'Hút Hero gần kho vào rồi nện 14% HP + 18 dmg, choáng 0.7s và giảm 30% ATK 4s',
    cooldown: 20,
    kind: 'treasure_crush',
    radius: 2.8,
    pullCells: 1,
    damageRatio: 0.14,
    damageFlat: 18,
    stunDuration: 0.7,
    debuffDuration: 4,
    atkFactor: 0.7,
  },
  sky_fracture: {
    id: 'sky_fracture',
    name: 'Nứt Trời',
    desc: 'Sét nhảy tối đa 4 Hero: mỗi nhảy ~10% HP + 10 dmg, và dễ vỡ (nhận +20% dmg) 4s',
    cooldown: 23,
    kind: 'chain_bolt',
    hops: 4,
    jumpRadius: 3.2,
    damageRatio: 0.1,
    damageFlat: 10,
    frailDuration: 4,
    frailMul: 1.2,
  },
  ruin_bell: {
    id: 'ruin_bell',
    name: 'Chuông Sụp Đổ',
    desc: 'Choáng toàn bộ Hero 1s và giáng thêm 8% HP tối đa lên mục tiêu dưới 45% máu',
    cooldown: 25,
    kind: 'panic_bell',
    duration: 1,
    executeThreshold: 0.45,
    damageRatio: 0.08,
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
  OIL: 'Dầu — Hero chậm; combo lửa/sét nguy hiểm',
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
