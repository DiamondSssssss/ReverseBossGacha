import { compileMap } from './maps.js?v=88';

function M(id, name, costCap, tiles, extras = {}) {
  return { id, name, costCap, tiles, ...extras };
}

const RAW_CHALLENGE_MAPS = {
  ch01: M(
    'ch01',
    'Hẻm Ướt',
    8,
    [
      '##############',
      '#~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~#',
      'G~~~~~~~~~~~~T',
      'G~~~~~~~~~~~~T',
      '#~~~~~~~~~~~~#',
      '#~~~~~~~~~~~~#',
      '##############',
    ],
    {
      tip: 'Toàn nước — đặt WATER_BUFF / tank ướt.',
      buffs: [
        { cells: ['3,3', '3,4'], side: 'hero', kind: 'HEAL_TICK', value: 5 },
        { cells: ['10,3', '10,4'], side: 'hero', kind: 'HEAL_TICK', value: 4 },
        { cells: ['6,2', '6,5'], side: 'monster', kind: 'ATK_UP', value: 1.2 },
      ],
      treasureHp: 100,
    }
  ),
  ch02: M(
    'ch02',
    'Lò Dầu',
    7,
    [
      '##############',
      '###........###',
      '###.ffppff.###',
      'G...ffppff...T',
      'G...ffppff...T',
      '###.ffppff.###',
      '###........###',
      '##############',
    ],
    {
      tip: 'Hẻm lửa + dầu — trap burn / bait đầu hành lang.',
      buffs: [
        { cells: ['5,3', '5,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.35 },
        { cells: ['7,3', '7,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.25 },
      ],
    }
  ),
  ch03: M(
    'ch03',
    'Mê Cung Soi',
    9,
    [
      '##############',
      '#dd##..##dd..#',
      '#dd......dd..#',
      'G....##......T',
      'G....##......T',
      '#dd......dd..#',
      '#dd##..##dd..#',
      '##############',
    ],
    {
      tip: 'Ô tối + REVEAL — chống rogue.',
      buffs: [
        { cells: ['5,2', '5,5', '8,3', '8,4'], side: 'hero', kind: 'REVEAL_AURA', value: 1 },
        { cells: ['7,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.15 },
      ],
    }
  ),
  ch04: M(
    'ch04',
    'Đấu Trường Trống',
    10,
    [
      '##############',
      '#............#',
      '#............#',
      'G............T',
      'G............T',
      '#............#',
      '#............#',
      '##############',
    ],
    {
      tip: 'Sân trống — cần slow/root + thorns giữa sân.',
      buffs: [{ cells: ['6,3', '7,3', '6,4', '7,4'], side: 'monster', kind: 'DEF_UP', value: 1.25 }],
    }
  ),
  ch05: M(
    'ch05',
    'Thuế Máu',
    9,
    [
      '##############',
      '#..##....##..#',
      '#............#',
      'G............T',
      'G............T',
      '#............#',
      '#..##....##..#',
      '##############',
    ],
    {
      tip: 'Kho máu thấp — tránh mythic tax. Thắng nhanh.',
      treasureHp: 55,
      buffs: [{ cells: ['5,3', '5,4'], side: 'monster', kind: 'ATK_UP', value: 1.2 }],
    }
  ),
  ch06: M(
    'ch06',
    'Cấm Địa Trần',
    8,
    [
      '##############',
      '#llllllllllll#',
      '#llllllllllll#',
      'GllllllllllllT',
      'GllllllllllllT',
      '#llllllllllll#',
      '#llllhhllllll#',
      '##############',
    ],
    {
      tip: 'Trần thấp — DPS sợ độ cao / cost≤2. Tránh ô cao.',
      buffs: [{ cells: ['6,6', '7,6'], side: 'hero', kind: 'SPEED_UP', value: 1.2 }],
    }
  ),
  ch07: M(
    'ch07',
    'Dây Rối',
    10,
    [
      '##############',
      '#....####....#',
      '#.##.####.##.#',
      'G............T',
      'G.##.####.##.T',
      '#.##.####.##.#',
      '#....####....#',
      '##############',
    ],
    {
      tip: 'Đường chữ S — dùng charm/frail rối Hero.',
      buffs: [
        { cells: ['4,3', '9,3'], side: 'monster', kind: 'ATK_UP', value: 1.15 },
        { cells: ['6,2', '6,5'], side: 'hero', kind: 'SPEED_DOWN', value: 0.85 },
      ],
    }
  ),
  ch08: M(
    'ch08',
    'Hiến Tế Thử',
    12,
    [
      '##############',
      '#............#',
      '#...######...#',
      'G............T',
      'G............T',
      '#...######...#',
      '#............#',
      '##############',
    ],
    {
      tip: 'Bắt buộc Oan Hồn Hiến Tế + fodder 1–3★.',
      buffs: [{ cells: ['5,3', '6,3', '5,4', '6,4'], side: 'monster', kind: 'ATK_UP', value: 1.3 }],
    }
  ),
  ch09: M(
    'ch09',
    'Im Lặng Pháp',
    10,
    [
      '##############',
      '#............#',
      '#..##....##..#',
      'G............T',
      'G............T',
      '#..##....##..#',
      '#............#',
      '##############',
    ],
    {
      tip: 'SILENCE_ZONE dày — mage boss. Không silence mythic.',
      buffs: [
        { cells: ['3,2', '3,5', '10,2', '10,5', '4,2', '4,5'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['7,3', '7,4'], side: 'monster', kind: 'DEF_UP', value: 1.2 },
      ],
    }
  ),
  ch10: M(
    'ch10',
    'Toàn Tập',
    11,
    [
      '################',
      '#~~..ff..ii..pp#',
      '#~~..ff..ii..pp#',
      'G..............T',
      'G..............T',
      '#dd..ll..hh..^^#',
      '#dd..ll..hh..^^#',
      '################',
    ],
    {
      tip: 'Đa nguyên tố — ≥4 unit ≤3★, ≤1 Mythic, ≤1 Legendary.',
      buffs: [
        { cells: ['2,3', '2,4'], side: 'monster', kind: 'ATK_UP', value: 1.15 },
        { cells: ['8,3', '8,4'], side: 'monster', kind: 'DEF_UP', value: 1.15 },
        { cells: ['13,3', '13,4'], side: 'hero', kind: 'HEAL_TICK', value: 3 },
      ],
      treasureHp: 90,
    }
  ),
};

export const CHALLENGE_MAPS = {};
for (const [id, def] of Object.entries(RAW_CHALLENGE_MAPS)) {
  CHALLENGE_MAPS[id] = compileMap(def);
}

export function getChallengeMap(mapId) {
  const base = CHALLENGE_MAPS[mapId];
  if (!base) return null;
  const raw = RAW_CHALLENGE_MAPS[mapId];
  return {
    ...base,
    blocked: new Set(base.blocked),
    noPlace: new Set(base.noPlace || []),
    terrain: { ...base.terrain },
    buffIndex: { ...base.buffIndex },
    buffs: (base.buffs || []).map((b) => ({ ...b, cells: [...b.cells] })),
    gate: base.gate.map((g) => ({ ...g })),
    treasure: base.treasure.map((t) => ({ ...t })),
    tiles: base.tiles.map((row) => [...row]),
    walkable: base.walkable.map((row) => [...row]),
    placements: [],
    costCap: base.baseCostCap,
    treasureHp: raw?.treasureHp,
  };
}
