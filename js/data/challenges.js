/**
 * Challenge Mode — 10 ải cam go (mở từ ải thường ≥30).
 * Mỗi màn: chủ đề map + wave hero khớp + constraint riêng (không copy cùng 1 kiểu cấm).
 */

export const CHALLENGE_TITLES = {
  title_stream_walker: { id: 'title_stream_walker', name: 'Người Lội Suối' },
  title_narrow_fire: { id: 'title_narrow_fire', name: 'Thợ Lửa Hẹp' },
  title_night_eye: { id: 'title_night_eye', name: 'Mắt Đêm' },
  title_arena_lord: { id: 'title_arena_lord', name: 'Chủ Đấu Trường' },
  title_vault_clerk: { id: 'title_vault_clerk', name: 'Kế Toán Kho' },
  title_low_ceiling: { id: 'title_low_ceiling', name: 'Người Sợ Trần' },
  title_puppet: { id: 'title_puppet', name: 'Kẻ Rối Dây' },
  title_blood_priest: { id: 'title_blood_priest', name: 'Tư Tế Đỏ' },
  title_seal_breaker: { id: 'title_seal_breaker', name: 'Phá Ấn' },
  title_challenge_lord: { id: 'title_challenge_lord', name: 'Chúa Tể Hầm Thách' },
};

/**
 * @typedef {object} ChallengeDef
 * @property {number} id
 * @property {string} mapId
 * @property {string} name
 * @property {string} blurb
 * @property {object} unlock
 * @property {object} [constraints]
 * @property {object[]} [objectives]
 * @property {object} wave
 * @property {object} reward
 * @property {number} [costCap] — Cap sân cố định (ghi đè map)
 * @property {number} [poolMult] — bội pool mang theo (mặc định 3)
 * @property {Record<string, number>} [forcedLoadout] — loadout bắt buộc
 * @property {boolean} [lockLoadout] — khóa không cho đổi loadout
 */

/** @type {ChallengeDef[]} */
export const CHALLENGES = [
  {
    id: 1,
    mapId: 'ch01',
    name: 'Hẻm Ướt',
    blurb: 'Hành lang nước — cấm DPS. Chỉ tank / utility / bẫy chống thủy quân.',
    unlock: { dungeonLevel: 30 },
    costCap: 16,
    poolMult: 3,
    constraints: {
      banRoles: ['dps'],
      banMythic: false,
      allowPotion: true,
    },
    objectives: [
      { type: 'treasure_ratio', min: 0.45, label: 'Giữ kho ≥45%' },
    ],
    wave: {
      theme: 'Thủy quân áp sát',
      tip: '3 đợt — WATER_BUFF + tank ướt + slow. Không mang DPS thuần.',
      squads: [
        {
          wave: 1,
          gap: 1.4,
          ids: [
            'hero_warrior_04',
            'hero_warrior_05',
            'hero_healer_02',
            'hero_mage_03',
            'hero_archer_02',
          ],
        },
        {
          wave: 2,
          gap: 1.3,
          ids: [
            'hero_tank_02',
            'hero_warrior_07',
            'hero_healer_03',
            'hero_mage_04',
            'hero_support_01',
          ],
        },
        {
          wave: 3,
          gap: 1.2,
          ids: [
            'hero_tank_04',
            'hero_warrior_09',
            'hero_healer_05',
            'hero_mage_06',
            'hero_archer_04',
          ],
        },
      ],
    },
    reward: { titleId: 'title_stream_walker', souls: 120, gems: 3 },
  },
  {
    id: 2,
    mapId: 'ch02',
    name: 'Lò Dầu',
    blurb: 'Hẻm lửa — cấm heal + potion. Chỉ burst / trap / CC, tối đa 8 unit sân.',
    unlock: { clearPrev: true },
    costCap: 18,
    poolMult: 3,
    constraints: {
      banRoles: ['heal'],
      allowPotion: false,
      maxUnits: 10,
    },
    objectives: [
      { type: 'max_units_placed', max: 10, label: 'Không đặt quá 10 unit' },
      { type: 'treasure_ratio', min: 0.3, label: 'Giữ kho ≥30%' },
    ],
    wave: {
      theme: 'Hỏa kích liên hoàn',
      tip: 'Berserker + mage lửa. Không hồi — phải chặn đầu hành lang.',
      squads: [
        {
          wave: 1,
          gap: 1.35,
          ids: [
            'hero_berserker_02',
            'hero_mage_02',
            'hero_archer_03',
            'hero_warrior_06',
            'hero_berserker_03',
          ],
        },
        {
          wave: 2,
          gap: 1.25,
          ids: [
            'hero_berserker_04',
            'hero_mage_05',
            'hero_warrior_08',
            'hero_archer_04',
            'hero_bomber_01',
          ],
        },
        {
          wave: 3,
          gap: 1.2,
          ids: [
            'hero_berserker_05',
            'hero_mage_07',
            'hero_warrior_10',
            'hero_archer_05',
          ],
        },
      ],
    },
    reward: { titleId: 'title_narrow_fire', souls: 130, gems: 3 },
  },
  {
    id: 3,
    mapId: 'ch03',
    name: 'Mê Cung Soi',
    blurb: 'Rogue đêm — cấm tank. Phải detect / trap / DPS bắt bóng.',
    unlock: { clearPrev: true },
    costCap: 18,
    poolMult: 3,
    constraints: {
      banRoles: ['tank'],
      banStealthMythic: true,
    },
    objectives: [
      { type: 'kill_rogue_before_drain', min: 2, label: 'Hạ ≥2 rogue trước khi rút kho' },
      { type: 'treasure_ratio', min: 0.4, label: 'Giữ kho ≥40%' },
    ],
    wave: {
      theme: 'Bóng đêm đổ bộ',
      tip: 'Rogue + scout ẩn. Không tank — đặt mắt thần / bẫy trên path.',
      squads: [
        {
          wave: 1,
          gap: 1.2,
          ids: [
            'hero_rogue_02',
            'hero_rogue_03',
            'hero_scout_01',
            'hero_rogue_04',
            'hero_warrior_05',
          ],
        },
        {
          wave: 2,
          gap: 1.1,
          ids: [
            'hero_rogue_05',
            'hero_scout_02',
            'hero_rogue_06',
            'hero_archer_04',
            'hero_rogue_07',
          ],
        },
        {
          wave: 3,
          gap: 1.0,
          ids: [
            'hero_rogue_08',
            'hero_rogue_09',
            'hero_warrior_09',
            'hero_mage_05',
            'hero_healer_04',
            'hero_support_02',
          ],
        },
      ],
    },
    reward: { titleId: 'title_night_eye', souls: 140, gems: 4 },
  },
  {
    id: 4,
    mapId: 'ch04',
    name: 'Đấu Trường Trống',
    blurb: 'Loadout BẮT BUỘC — dùng đúng bộ bài giao, cấm chiêu boss.',
    unlock: { clearPrev: true },
    costCap: 17,
    poolMult: 2,
    forcedLoadout: {
      goblin_bait: 2,
      tin_knight: 2,
      bone_pile: 2,
      spike_trap: 2,
      oil_slick: 1,
      ward_eye: 1,
      moss_slug: 2,
      candle_bug: 2,
      mute_mite: 1,
    },
    constraints: {
      noBossSpells: true,
    },
    objectives: [
      { type: 'no_boss_spells', label: 'Không dùng chiêu boss' },
      { type: 'treasure_ratio', min: 0.4, label: 'Giữ kho ≥40%' },
    ],
    wave: {
      theme: 'Đấu sĩ trường lớn',
      tip: 'Sân trống — slow/root giữa sân. Không được đổi loadout.',
      squads: [
        {
          wave: 1,
          gap: 1.35,
          ids: [
            'hero_warrior_05',
            'hero_tank_02',
            'hero_archer_03',
            'hero_healer_02',
            'hero_mage_03',
          ],
        },
        {
          wave: 2,
          gap: 1.2,
          ids: [
            'hero_warrior_07',
            'hero_tank_03',
            'hero_berserker_03',
            'hero_healer_03',
            'hero_archer_04',
            'hero_mage_04',
          ],
        },
        {
          wave: 3,
          gap: 1.15,
          ids: [
            'hero_warrior_10',
            'hero_tank_05',
            'hero_berserker_05',
            'hero_healer_05',
            'hero_shatter_01',
          ],
        },
      ],
    },
    reward: { titleId: 'title_arena_lord', souls: 150, gems: 4 },
  },
  {
    id: 5,
    mapId: 'ch05',
    name: 'Thuế Máu',
    blurb: 'Kho mỏng — cấm utility. Chỉ tank + DPS sống sót dưới áp lực.',
    unlock: { clearPrev: true, dungeonLevel: 32 },
    costCap: 22,
    poolMult: 3,
    constraints: {
      banRoles: ['utility'],
      banRainbow: true,
      maxMythic: 2,
    },
    objectives: [
      { type: 'treasure_ratio', min: 0.25, label: 'Giữ kho ≥25%' },
      { type: 'time_limit', max: 220, label: 'Thắng trong 220s' },
    ],
    wave: {
      theme: 'Áp lực kho',
      tip: 'Không utility — xếp tường thịt + DPS. Kho máu thấp.',
      squads: [
        {
          wave: 1,
          gap: 1.2,
          ids: [
            'hero_berserker_03',
            'hero_rogue_05',
            'hero_mage_04',
            'hero_healer_03',
            'hero_warrior_07',
          ],
        },
        {
          wave: 2,
          gap: 1.1,
          ids: [
            'hero_berserker_04',
            'hero_rogue_07',
            'hero_mage_06',
            'hero_healer_04',
            'hero_archer_05',
            'hero_tank_04',
          ],
        },
        {
          wave: 3,
          gap: 1.0,
          ids: [
            'hero_berserker_06',
            'hero_rogue_09',
            'hero_mage_08',
            'hero_healer_06',
            'hero_warrior_11',
            'hero_support_03',
          ],
        },
      ],
    },
    reward: { titleId: 'title_vault_clerk', souls: 160, gems: 5 },
  },
  {
    id: 6,
    mapId: 'ch06',
    name: 'Cấm Địa Trần',
    blurb: 'Trần thấp — chỉ quái low-ceiling hoặc cost ≤2. Tránh ô HIGH.',
    unlock: { clearPrev: true },
    costCap: 16,
    poolMult: 4,
    constraints: {
      onlyLowCeilingOrCheap: true,
    },
    objectives: [
      { type: 'high_tile_time', max: 4, label: 'Quái đứng ô HIGH ≤4s tổng' },
      { type: 'treasure_ratio', min: 0.4, label: 'Giữ kho ≥40%' },
    ],
    wave: {
      theme: 'Trần thấp · cung tiễn',
      tip: 'Pool ×4 nhưng chỉ cost≤2 / low-ceiling. Archer thích ô cao — đừng theo.',
      squads: [
        {
          wave: 1,
          gap: 1.3,
          ids: [
            'hero_archer_03',
            'hero_archer_04',
            'hero_warrior_06',
            'hero_mage_04',
            'hero_healer_03',
          ],
        },
        {
          wave: 2,
          gap: 1.15,
          ids: [
            'hero_archer_05',
            'hero_archer_06',
            'hero_warrior_08',
            'hero_mage_05',
            'hero_scout_02',
            'hero_tank_03',
          ],
        },
        {
          wave: 3,
          gap: 1.05,
          ids: [
            'hero_archer_07',
            'hero_warrior_10',
            'hero_mage_07',
            'hero_healer_05',
            'hero_berserker_04',
            'hero_hex_05',
          ],
        },
      ],
    },
    reward: { titleId: 'title_low_ceiling', souls: 170, gems: 5 },
  },
  {
    id: 7,
    mapId: 'ch07',
    name: 'Dây Rối',
    blurb: 'Charm / frail — cấm silence. Phải rối loạn bằng control khác.',
    unlock: { clearPrev: true, dungeonLevel: 35 },
    costCap: 18,
    poolMult: 3,
    constraints: {
      banRoles: ['silence'],
      maxMythic: 1,
      maxLegendary: 2,
    },
    objectives: [
      { type: 'hero_deaths', min: 5, label: '≥5 Hero chết' },
      { type: 'treasure_ratio', min: 0.35, label: 'Giữ kho ≥35%' },
    ],
    wave: {
      theme: 'Rối loạn tâm trí',
      tip: 'Hex charm + frail. Cấm silence — dùng root/charm/stun/knock.',
      squads: [
        {
          wave: 1,
          gap: 1.25,
          ids: [
            'hero_hex_charm',
            'hero_frail_blade',
            'hero_hex_03',
            'hero_warrior_07',
            'hero_healer_04',
          ],
        },
        {
          wave: 2,
          gap: 1.15,
          ids: [
            'hero_hex_04',
            'hero_hex_05',
            'hero_mage_06',
            'hero_warrior_09',
            'hero_cleanse_monk',
            'hero_support_02',
          ],
        },
        {
          wave: 3,
          gap: 1.05,
          ids: [
            'hero_hex_06',
            'hero_hex_07',
            'hero_frail_blade',
            'hero_hex_charm',
            'hero_healer_06',
            'hero_warrior_11',
            'hero_mage_08',
          ],
        },
      ],
    },
    reward: { titleId: 'title_puppet', souls: 180, gems: 5 },
  },
  {
    id: 8,
    mapId: 'ch08',
    name: 'Hiến Tế Thử',
    blurb: 'Bắt buộc Oan Hồn Hiến Tế + fodder ≤3★. Hiến tế ≥5 lần.',
    unlock: { clearPrev: true },
    costCap: 22,
    poolMult: 3,
    forcedLoadout: {
      blood_tithe_wraith: 1,
      goblin_bait: 4,
      bone_pile: 3,
      news_rat: 3,
      candle_bug: 2,
      pebble_imp: 2,
    },
    lockLoadout: false,
    constraints: {
      requireMonster: 'blood_tithe_wraith',
      fillerMaxRarity: 3,
      mustIncludeRequired: true,
    },
    objectives: [
      { type: 'tithes', min: 5, label: 'Hiến tế ≥5 lần' },
      { type: 'treasure_ratio', min: 0.35, label: 'Giữ kho ≥35%' },
    ],
    wave: {
      theme: 'Đoàn quân hiến tế',
      tip: 'Tithe đã có sẵn trong loadout — nuôi fodder, hiến tế liên tục.',
      squads: [
        {
          wave: 1,
          gap: 1.2,
          ids: [
            'hero_tank_03',
            'hero_warrior_08',
            'hero_berserker_04',
            'hero_healer_03',
            'hero_mage_05',
          ],
        },
        {
          wave: 2,
          gap: 1.1,
          ids: [
            'hero_tank_05',
            'hero_warrior_10',
            'hero_berserker_05',
            'hero_healer_05',
            'hero_archer_05',
            'hero_tank_06',
          ],
        },
        {
          wave: 3,
          gap: 1.0,
          ids: [
            'hero_warrior_11',
            'hero_berserker_06',
            'hero_healer_06',
            'hero_mage_07',
            'hero_tank_06',
            'hero_support_03',
            'hero_shatter_01',
          ],
        },
      ],
    },
    reward: { titleId: 'title_blood_priest', souls: 200, gems: 6 },
  },
  {
    id: 9,
    mapId: 'ch09',
    name: 'Im Lặng Pháp',
    blurb: 'Pháp ấn — cấm silence. Mage + boss; boss không được rút kho.',
    unlock: { clearPrev: true, dungeonLevel: 40 },
    costCap: 22,
    poolMult: 3,
    constraints: {
      banRoles: ['silence'],
      maxLegendary: 2,
      maxMythic: 1,
    },
    objectives: [
      { type: 'boss_no_drain', label: 'Boss hero không được rút kho' },
      { type: 'treasure_ratio', min: 0.35, label: 'Giữ kho ≥35%' },
    ],
    wave: {
      theme: 'Pháp ấn tận diệt',
      tip: 'Cấm silence — dùng knock / stun / invuln / anti-mage khác.',
      squads: [
        {
          wave: 1,
          gap: 1.2,
          ids: [
            'hero_mage_04',
            'hero_mage_05',
            'hero_hex_04',
            'hero_healer_04',
            'hero_warrior_08',
          ],
        },
        {
          wave: 2,
          gap: 1.1,
          ids: [
            'hero_mage_06',
            'hero_mage_07',
            'hero_mage_08',
            'hero_cleanse_monk',
            'hero_hex_06',
            'hero_support_02',
          ],
        },
        {
          wave: 3,
          gap: 1.0,
          ids: [
            'hero_boss_40',
            'hero_mage_07',
            'hero_mage_08',
            'hero_healer_06',
            'hero_hex_07',
            'hero_warrior_11',
          ],
        },
      ],
    },
    reward: { titleId: 'title_seal_breaker', souls: 220, gems: 7 },
  },
  {
    id: 10,
    mapId: 'ch10',
    name: 'Toàn Tập',
    blurb: 'Gauntlet cuối — ≤1 Mythic, ≤1 Legendary, ≥5 unit ≤3★. Đa nguyên tố.',
    unlock: { clearPrev: true, dungeonLevel: 45 },
    costCap: 26,
    poolMult: 3,
    constraints: {
      maxMythic: 1,
      maxLegendary: 1,
      minLowStarUnits: 5,
      lowStarMaxRarity: 3,
      allowPotion: false,
    },
    objectives: [
      { type: 'treasure_ratio', min: 0.3, label: 'Kho ≥30%' },
      { type: 'time_limit', max: 260, label: 'Trong 260s' },
      { type: 'no_potion', label: 'Không dùng potion' },
    ],
    wave: {
      theme: 'Toàn tập hầm ngục',
      tip: '3 đợt hỗn hợp — cần đa dạng low-star, không spam mythic.',
      squads: [
        {
          wave: 1,
          gap: 1.2,
          ids: [
            'hero_warrior_08',
            'hero_mage_05',
            'hero_archer_05',
            'hero_healer_04',
            'hero_rogue_06',
            'hero_tank_04',
          ],
        },
        {
          wave: 2,
          gap: 1.1,
          ids: [
            'hero_berserker_05',
            'hero_hex_05',
            'hero_scout_02',
            'hero_mage_07',
            'hero_warrior_10',
            'hero_healer_05',
            'hero_archer_06',
          ],
        },
        {
          wave: 3,
          gap: 1.05,
          ids: [
            'hero_boss_45',
            'hero_rogue_09',
            'hero_mage_08',
            'hero_tank_06',
            'hero_berserker_06',
            'hero_healer_06',
            'hero_warrior_11',
          ],
        },
      ],
    },
    reward: { titleId: 'title_challenge_lord', souls: 300, gems: 12 },
  },
];

export const CHALLENGE_BY_ID = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));

export function getChallenge(id) {
  return CHALLENGE_BY_ID[id] || null;
}

/** Map role → tags quái */
export const CHALLENGE_ROLE_TAGS = {
  tank: ['tank', 'tankette'],
  dps: ['dps'],
  utility: ['utility'],
  heal: ['heal'],
  trap: ['trap'],
  silence: ['silence'],
  detect: ['detect'],
  potion: ['potion'],
};
