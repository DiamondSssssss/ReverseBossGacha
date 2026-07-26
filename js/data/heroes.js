/** Hero AI catalog — mỗi ải 1–20 có tổ hợp hero riêng */

import { COMBAT } from './constants.js';

export const HEROES = [
  // ——— MAGE ———
  {
    id: 'hero_mage_01',
    name: 'Pháp Sư Lửa',
    class: 'MAGE',
    hp: 280, atk: 55, speed: 1.8, range: 3.2, atkSpeed: 0.7, aoeRadius: 1.8,
    target: 'TREASURE', color: '#ce93d8', skills: ['AOE_FIRE'],
    description: 'Dame lan lửa — sợ Silence / áp sát.',
  },
  {
    id: 'hero_mage_02',
    name: 'Pháp Sư Băng',
    class: 'MAGE',
    hp: 240, atk: 48, speed: 1.7, range: 3.0, atkSpeed: 0.75, aoeRadius: 1.5,
    target: 'TREASURE', color: '#90caf9', skills: ['AOE_FROST', 'FREEZE'],
    description: 'AoE + đóng băng — vẫn yếu trước Silence.',
  },
  {
    id: 'hero_mage_03',
    name: 'Lôi Thuật Sư',
    class: 'MAGE',
    hp: 260, atk: 62, speed: 1.9, range: 3.4, atkSpeed: 0.85, aoeRadius: 1.2,
    target: 'TREASURE', color: '#fff59d', skills: ['AOE_FIRE'],
    description: 'Tick sét nhanh — máu mỏng, sợ silence.',
  },
  {
    id: 'hero_mage_04',
    name: 'Độc Cô Nữ',
    class: 'MAGE',
    hp: 300, atk: 44, speed: 1.5, range: 2.8, atkSpeed: 0.65, aoeRadius: 2.2,
    target: 'TREASURE', color: '#aed581', skills: ['AOE_FROST'],
    description: 'AoE độc rộng — chậm, dễ bị áp sát.',
  },
  {
    id: 'hero_mage_05',
    name: 'Huyền Không Sư',
    class: 'MAGE',
    hp: 220, atk: 70, speed: 2.0, range: 3.6, atkSpeed: 0.6, aoeRadius: 2.0,
    target: 'TREASURE', color: '#b39ddb', skills: ['AOE_FIRE', 'FREEZE'],
    description: 'Burst phép cực mạnh — cực sợ Silence.',
  },

  // ——— WARRIOR ———
  {
    id: 'hero_warrior_01',
    name: 'Chiến Sĩ Thép',
    class: 'WARRIOR',
    hp: 650, atk: 42, speed: 1.4, range: 1.2, atkSpeed: 0.9, aoeRadius: 0,
    target: 'TREASURE', color: '#ef9a9a', skills: ['SHIELD'],
    description: 'Trâu ổn — sợ Boss 5★ burst.',
  },
  {
    id: 'hero_warrior_02',
    name: 'Hiệp Sĩ Lá Chắn',
    class: 'WARRIOR',
    hp: 800, atk: 35, speed: 1.2, range: 1.3, atkSpeed: 0.8, aoeRadius: 0,
    target: 'TREASURE', color: '#ffcc80', skills: ['TAUNT_SELF'],
    description: 'Tank cực khỏe, chậm.',
  },
  {
    id: 'hero_warrior_03',
    name: 'Cuồng Chiến',
    class: 'WARRIOR',
    hp: 520, atk: 68, speed: 1.8, range: 1.4, atkSpeed: 1.15, aoeRadius: 0,
    target: 'TREASURE', color: '#e57373', skills: ['SHIELD'],
    description: 'Dame cao, máu vừa — sợ bẫy + kite.',
  },
  {
    id: 'hero_warrior_04',
    name: 'Thập Tự Quân',
    class: 'WARRIOR',
    hp: 720, atk: 48, speed: 1.35, range: 1.5, atkSpeed: 0.95, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tank kiêm DPS — cần burst mạnh.',
  },
  {
    id: 'hero_warrior_05',
    name: 'Cự Binh Thành',
    class: 'WARRIOR',
    hp: 980, atk: 30, speed: 0.95, range: 1.2, atkSpeed: 0.7, aoeRadius: 0,
    target: 'TREASURE', color: '#b0bec5', skills: ['TAUNT_SELF'],
    description: 'Siêu tank bò — chỉ Boss / DoT mới cắn nổi.',
  },

  // ——— ROGUE ———
  {
    id: 'hero_rogue_01',
    name: 'Đạo Tặc Bóng',
    class: 'ROGUE',
    hp: 220, atk: 60, speed: 2.8, range: 1.1, atkSpeed: 1.4, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#a5d6a7', skills: ['STEALTH'],
    description: 'Tàng hình — sợ Mắt thần & Bẫy.',
  },
  {
    id: 'hero_rogue_02',
    name: 'Sát Thủ Lụa',
    class: 'ROGUE',
    hp: 200, atk: 70, speed: 3.0, range: 1.0, atkSpeed: 1.5, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#80cbc4', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Cực nhanh, máu mỏng.',
  },
  {
    id: 'hero_rogue_03',
    name: 'Song Đao Khách',
    class: 'ROGUE',
    hp: 260, atk: 55, speed: 2.4, range: 1.3, atkSpeed: 1.6, aoeRadius: 0,
    stealth: false, target: 'TREASURE', color: '#ef9a9a', skills: ['BACKSTAB'],
    description: 'DPS gần nhanh — không tàng hình, dễ focus.',
  },
  {
    id: 'hero_rogue_04',
    name: 'Ảo Ảnh Tặc',
    class: 'ROGUE',
    hp: 180, atk: 58, speed: 3.2, range: 1.2, atkSpeed: 1.35, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#ce93d8', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Siêu nhanh + ẩn — bắt buộc anti-rogue.',
  },
  {
    id: 'hero_rogue_05',
    name: 'Cung Thủ Bóng',
    class: 'ROGUE',
    hp: 240, atk: 52, speed: 2.2, range: 2.8, atkSpeed: 1.1, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#81c784', skills: ['STEALTH'],
    description: 'Tàng hình bắn xa — Mắt thần + áp sát.',
  },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));

/**
 * Tổ hợp riêng từng ải — theme + hero ids + gợi ý khắc chế.
 * Mỗi ải khác nhau để người chơi phải đổi đội hình.
 */
export const WAVE_PLANS = {
  1: {
    theme: 'Đội mở đầu',
    tip: 'Wave cơ bản — tập xếp cost & đọc class.',
    ids: ['hero_warrior_01', 'hero_mage_01', 'hero_rogue_01'],
  },
  2: {
    theme: 'Áp lực phép',
    tip: 'Toàn Pháp sư — ưu tiên Silence / áp sát.',
    ids: ['hero_mage_01', 'hero_mage_02', 'hero_mage_03'],
  },
  3: {
    theme: 'Bức tường thép',
    tip: 'Toàn Chiến sĩ — mang Boss burst / DoT nặng.',
    ids: ['hero_warrior_01', 'hero_warrior_02', 'hero_warrior_05'],
  },
  4: {
    theme: 'Bóng đêm',
    tip: 'Toàn Đạo tặc tàng hình — Mắt thần + Bẫy gai.',
    ids: ['hero_rogue_01', 'hero_rogue_02', 'hero_rogue_04'],
  },
  5: {
    theme: 'Song kiếm lửa',
    tip: 'Mage + Warrior — Silence một bên, burst tank một bên.',
    ids: ['hero_mage_01', 'hero_warrior_01', 'hero_mage_03', 'hero_warrior_03'],
  },
  6: {
    theme: 'Sát thủ & khiên',
    tip: 'Rogue ẩn + Tank — anti-rogue trước, rồi cày tank.',
    ids: ['hero_rogue_02', 'hero_warrior_02', 'hero_rogue_01', 'hero_warrior_04'],
  },
  7: {
    theme: 'Bão sét độc',
    tip: 'Mage tick nhanh + AoE độc — Silence càng giá trị.',
    ids: ['hero_mage_03', 'hero_mage_04', 'hero_mage_02', 'hero_mage_01'],
  },
  8: {
    theme: 'Cuồng phong',
    tip: 'Warrior dame cao + Rogue nhanh — đừng để lọt kho.',
    ids: ['hero_warrior_03', 'hero_rogue_03', 'hero_rogue_02', 'hero_warrior_01'],
  },
  9: {
    theme: 'Ảo thuật đoàn',
    tip: 'Nhiều tàng hình + cung xa — phủ Mắt thần cả map.',
    ids: ['hero_rogue_04', 'hero_rogue_05', 'hero_rogue_01', 'hero_mage_02'],
  },
  10: {
    theme: 'Đột phá giữa chừng',
    tip: 'Đủ 3 class cân bằng — đội hình đa dụng.',
    ids: [
      'hero_mage_05',
      'hero_warrior_04',
      'hero_rogue_04',
      'hero_mage_01',
      'hero_warrior_01',
    ],
  },
  11: {
    theme: 'Pháo đài',
    tip: 'Tank siêu trâu — Boss 5★ / slow + chip.',
    ids: [
      'hero_warrior_05',
      'hero_warrior_02',
      'hero_warrior_04',
      'hero_warrior_01',
      'hero_mage_04',
    ],
  },
  12: {
    theme: 'Hư không',
    tip: 'Burst mage cực mạnh — Silence ngay từ cửa cổng.',
    ids: [
      'hero_mage_05',
      'hero_mage_03',
      'hero_mage_01',
      'hero_mage_02',
      'hero_rogue_03',
    ],
  },
  13: {
    theme: 'Đêm trường',
    tip: 'Rogue swarm — bẫy dày + reveal.',
    ids: [
      'hero_rogue_01',
      'hero_rogue_02',
      'hero_rogue_04',
      'hero_rogue_05',
      'hero_rogue_03',
      'hero_warrior_03',
    ],
  },
  14: {
    theme: 'Thập tự & độc',
    tip: 'Paladin + độc sư — vừa tank vừa AoE.',
    ids: [
      'hero_warrior_04',
      'hero_mage_04',
      'hero_warrior_02',
      'hero_mage_02',
      'hero_rogue_05',
    ],
  },
  15: {
    theme: 'Tinh nhuệ',
    tip: 'Elite mix — đọc từng hero, đừng spam một kiểu.',
    ids: [
      'hero_mage_05',
      'hero_warrior_05',
      'hero_rogue_04',
      'hero_mage_03',
      'hero_warrior_03',
      'hero_rogue_05',
    ],
  },
  16: {
    theme: 'Song sát',
    tip: 'Hai nhịp: stealth trước, tank sau.',
    ids: [
      'hero_rogue_04',
      'hero_rogue_02',
      'hero_rogue_01',
      'hero_warrior_05',
      'hero_warrior_02',
      'hero_mage_01',
    ],
  },
  17: {
    theme: 'Lôi đình',
    tip: 'Mage tốc độ cao — silence + slow aura.',
    ids: [
      'hero_mage_03',
      'hero_mage_05',
      'hero_mage_01',
      'hero_mage_04',
      'hero_warrior_03',
      'hero_rogue_03',
    ],
  },
  18: {
    theme: 'Thành trì cuối',
    tip: 'Toàn tank + hỗ trợ — kéo dài trận, dùng spell.',
    ids: [
      'hero_warrior_05',
      'hero_warrior_02',
      'hero_warrior_04',
      'hero_warrior_01',
      'hero_mage_04',
      'hero_mage_02',
      'hero_rogue_05',
    ],
  },
  19: {
    theme: 'Đêm trước bão',
    tip: 'Rogue + burst mage — chống lọt + silence.',
    ids: [
      'hero_rogue_04',
      'hero_rogue_05',
      'hero_mage_05',
      'hero_rogue_02',
      'hero_warrior_03',
      'hero_mage_03',
      'hero_rogue_01',
    ],
  },
  20: {
    theme: 'Đột phá cuối — Phá đảo',
    tip: 'Full roster tinh nhuệ — đội hình cân 3 class + spell timing.',
    ids: [
      'hero_mage_05',
      'hero_warrior_05',
      'hero_rogue_04',
      'hero_mage_03',
      'hero_warrior_04',
      'hero_rogue_05',
      'hero_mage_01',
      'hero_warrior_03',
    ],
  },
};

/**
 * @param {number} level 1–20
 */
export function getWavePlan(level = 1) {
  const lv = Math.max(1, Math.min(20, level | 0));
  return WAVE_PLANS[lv] || WAVE_PLANS[1];
}

/** Build a wave list for dungeon level (1-based). */
export function buildWave(level = 1) {
  const plan = getWavePlan(level);
  const scale = 0.9 + (level - 1) * 0.095;
  const waves = [];

  plan.ids.forEach((id, i) => {
    const template = HERO_BY_ID[id] || HEROES[0];
    const roleLine =
      template.class === 'WARRIOR'
        ? 'Tuyến trước'
        : template.class === 'MAGE'
          ? 'Tuyến sau / phép'
          : template.stealth
            ? 'Sườn / đột phá'
            : 'Áp sát';
    waves.push({
      ...template,
      instanceId: `${template.id}_L${level}_${i}`,
      hp: Math.round(template.hp * scale),
      maxHp: Math.round(template.hp * scale),
      atk: Math.round(template.atk * scale),
      spawnDelay: 0.85 + i * COMBAT.HERO_SPAWN_INTERVAL,
      waveTheme: plan.theme,
      waveTip: plan.tip,
      formation: {
        order: i + 1,
        roleLine,
        gateIndex: 0,
        col: 0,
        row: 0,
      },
    });
  });

  return waves;
}

/**
 * Gán ô cổng / lane cố định theo đội hình — gọi khi có map.
 * Warrior → cổng giữa; Rogue → mép; Mage → spread.
 */
export function assignHeroFormation(wave, map) {
  if (!wave?.length || !map?.gate?.length) return wave;
  const gates = map.gate;
  const mid = (gates.length - 1) / 2;
  const sortedGates = gates
    .map((g, i) => ({ ...g, i, distMid: Math.abs(i - mid) }))
    .sort((a, b) => a.distMid - b.distMid || a.row - b.row);

  const centerFirst = [...sortedGates];
  const edgeFirst = [...sortedGates].sort(
    (a, b) => b.distMid - a.distMid || a.row - b.row
  );

  const useCount = {};
  function pickSpread(preferList) {
    const pool = preferList.length ? preferList : gates;
    let best = pool[0];
    let bestN = Infinity;
    for (const g of pool) {
      const key = `${g.col},${g.row}`;
      const n = useCount[key] || 0;
      if (n < bestN) {
        bestN = n;
        best = g;
      }
    }
    const key = `${best.col},${best.row}`;
    useCount[key] = (useCount[key] || 0) + 1;
    return best;
  }

  wave.forEach((h, i) => {
    let g;
    if (h.class === 'WARRIOR') g = pickSpread(centerFirst);
    else if (h.class === 'ROGUE') g = pickSpread(edgeFirst);
    else g = pickSpread(gates);

    h.formation = {
      order: i + 1,
      roleLine:
        h.class === 'WARRIOR'
          ? 'Tuyến trước'
          : h.class === 'MAGE'
            ? 'Tuyến sau / phép'
            : h.stealth
              ? 'Sườn / đột phá'
              : 'Áp sát',
      gateIndex: gates.findIndex((x) => x.col === g.col && x.row === g.row),
      col: g.col,
      row: g.row,
      spawnAt: h.spawnDelay,
    };
  });

  return wave;
}
