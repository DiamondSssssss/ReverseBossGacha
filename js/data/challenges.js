/**
 * Challenge Mode — 10 ải puzzle + Title độc bản.
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

/** @type {import('./challenges.js').ChallengeDef[]} */
export const CHALLENGES = [
  {
    id: 1,
    mapId: 'ch01',
    name: 'Hẻm Ướt',
    blurb: 'Hành lang nước — chỉ 1–3★ + potion.',
    unlock: { dungeonLevel: 5 },
    constraints: { maxRarity: 3, allowPotion: true, banMythic: true, banLegendary: true },
    objectives: [{ type: 'treasure_ratio', min: 0.6, label: 'Giữ kho ≥60%' }],
    wave: {
      theme: 'Thủy quân',
      tip: 'WATER_BUFF + trap dầu',
      ids: ['hero_warrior_02', 'hero_archer_01', 'hero_healer_01', 'hero_mage_02'],
    },
    reward: { titleId: 'title_stream_walker', souls: 80, gems: 2 },
  },
  {
    id: 2,
    mapId: 'ch02',
    name: 'Lò Dầu',
    blurb: 'Hẻm lửa hẹp — tối đa 6 unit, chỉ 1–3★ + trap.',
    unlock: { clearPrev: true },
    constraints: { maxRarity: 3, allowTrap: true, maxUnits: 6, banMythic: true, banLegendary: true },
    objectives: [{ type: 'max_units_placed', max: 6, label: 'Không đặt quá 6 unit' }],
    wave: {
      theme: 'Hỏa kích',
      tip: 'Trap burn + ROOT bait',
      ids: ['hero_warrior_03', 'hero_berserker_01', 'hero_mage_01', 'hero_archer_02'],
    },
    reward: { titleId: 'title_narrow_fire', souls: 90, gems: 2 },
  },
  {
    id: 3,
    mapId: 'ch03',
    name: 'Mê Cung Soi',
    blurb: 'Rogue wave — tối đa 1× 4★, cấm stealth mythic.',
    unlock: { clearPrev: true },
    constraints: { maxEpic: 1, banStealthMythic: true, maxRarity: 5 },
    objectives: [{ type: 'kill_rogue_before_drain', min: 1, label: 'Hạ ≥1 rogue trước khi rút kho' }],
    wave: {
      theme: 'Bóng đêm',
      tip: 'REVEAL + spike',
      ids: ['hero_rogue_02', 'hero_rogue_04', 'hero_scout_01', 'hero_warrior_04'],
    },
    reward: { titleId: 'title_night_eye', souls: 100, gems: 3 },
  },
  {
    id: 4,
    mapId: 'ch04',
    name: 'Đấu Trường Trống',
    blurb: 'Sân rộng — tối đa 1 Legendary, không dùng boss spell.',
    unlock: { clearPrev: true },
    constraints: { maxLegendary: 1, banMythic: true, noBossSpells: true },
    objectives: [{ type: 'no_boss_spells', label: 'Không dùng chiêu boss' }],
    wave: {
      theme: 'Đấu sĩ',
      tip: 'Thorns + slow giữa sân',
      ids: ['hero_warrior_05', 'hero_tank_02', 'hero_archer_03', 'hero_healer_02', 'hero_mage_03'],
    },
    reward: { titleId: 'title_arena_lord', souls: 110, gems: 3 },
  },
  {
    id: 5,
    mapId: 'ch05',
    name: 'Thuế Máu',
    blurb: 'Kho mỏng — tối đa 1 Mythic, cấm Rainbow. Thắng &lt;90s.',
    unlock: { clearPrev: true, dungeonLevel: 15 },
    constraints: { maxMythic: 1, banRainbow: true },
    objectives: [{ type: 'time_limit', max: 90, label: 'Thắng trong &lt;90 giây' }],
    wave: {
      theme: 'Áp lực kho',
      tip: 'Low-star utility &gt; mythic tax',
      ids: ['hero_berserker_03', 'hero_rogue_05', 'hero_mage_04', 'hero_healer_03'],
    },
    reward: { titleId: 'title_vault_clerk', souls: 120, gems: 4 },
  },
  {
    id: 6,
    mapId: 'ch06',
    name: 'Cấm Địa Trần',
    blurb: 'Chỉ BUFF_IN_LOW_CEILING hoặc cost ≤2.',
    unlock: { clearPrev: true },
    constraints: { onlyLowCeilingOrCheap: true, maxCostOrPassive: true },
    objectives: [{ type: 'high_tile_time', max: 3, label: 'Không đứng ô HIGH &gt;3s (quái)' }],
    wave: {
      theme: 'Trần thấp',
      tip: 'DPS sợ độ cao đúng ô l',
      ids: ['hero_warrior_06', 'hero_archer_03', 'hero_mage_05'],
    },
    reward: { titleId: 'title_low_ceiling', souls: 130, gems: 4 },
  },
  {
    id: 7,
    mapId: 'ch07',
    name: 'Dây Rối',
    blurb: 'Charm/frail — tối đa 1 Mythic + 1 Legendary.',
    unlock: { clearPrev: true, dungeonLevel: 20 },
    constraints: { maxMythic: 1, maxLegendary: 1 },
    objectives: [{ type: 'hero_deaths', min: 3, label: '≥3 Hero chết' }],
    wave: {
      theme: 'Rối loạn',
      tip: 'Charm fungus + frail',
      ids: [
        'hero_hex_charm',
        'hero_frail_blade',
        'hero_healer_04',
        'hero_warrior_07',
        'hero_mage_06',
      ],
    },
    reward: { titleId: 'title_puppet', souls: 140, gems: 5 },
  },
  {
    id: 8,
    mapId: 'ch08',
    name: 'Hiến Tế Thử',
    blurb: 'Bắt buộc blood_tithe_wraith + filler ≤3★. Hiến tế ≥4 lần.',
    unlock: { clearPrev: true },
    constraints: {
      requireMonster: 'blood_tithe_wraith',
      fillerMaxRarity: 3,
      mustIncludeRequired: true,
    },
    objectives: [{ type: 'tithes', min: 4, label: 'Hiến tế ≥4 lần' }],
    wave: {
      theme: 'Hiến tế',
      tip: 'Nuôi fodder cost 1 quanh Tithe',
      ids: ['hero_tank_03', 'hero_warrior_08', 'hero_berserker_04', 'hero_healer_03'],
    },
    reward: { titleId: 'title_blood_priest', souls: 160, gems: 5 },
  },
  {
    id: 9,
    mapId: 'ch09',
    name: 'Im Lặng Pháp',
    blurb: 'Mage boss — max 2× 5★, cấm silence mythic. Boss không rút kho.',
    unlock: { clearPrev: true, dungeonLevel: 30 },
    constraints: { maxLegendary: 2, banSilenceMythic: true, maxRarity: 5 },
    objectives: [{ type: 'boss_no_drain', label: 'Boss hero không được rút kho' }],
    wave: {
      theme: 'Pháp ấn',
      tip: 'Invuln tank + cleanse + knock',
      ids: ['hero_boss_40', 'hero_mage_07', 'hero_mage_06', 'hero_cleanse_monk', 'hero_hex_04'],
    },
    reward: { titleId: 'title_seal_breaker', souls: 180, gems: 6 },
  },
  {
    id: 10,
    mapId: 'ch10',
    name: 'Toàn Tập',
    blurb: '≤1 Mythic, ≤1 Legendary, ≥4 unit ≤3★.',
    unlock: { clearPrev: true, dungeonLevel: 40 },
    constraints: {
      maxMythic: 1,
      maxLegendary: 1,
      minLowStarUnits: 4,
      lowStarMaxRarity: 3,
    },
    objectives: [
      { type: 'treasure_ratio', min: 0.5, label: 'Kho ≥50%' },
      { type: 'time_limit', max: 120, label: 'Trong 120s' },
      { type: 'no_potion', label: 'Không dùng potion' },
    ],
    reward: { titleId: 'title_challenge_lord', souls: 250, gems: 10 },
  },
];

export const CHALLENGE_BY_ID = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));

export function getChallenge(id) {
  return CHALLENGE_BY_ID[id] || null;
}
