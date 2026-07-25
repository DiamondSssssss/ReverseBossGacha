/** Hero AI catalog */

export const HEROES = [
  {
    id: 'hero_mage_01',
    name: 'Pháp Sư Lửa',
    class: 'MAGE',
    hp: 280,
    atk: 55,
    speed: 1.8,
    range: 3.2,
    atkSpeed: 0.7,
    aoeRadius: 1.8,
    target: 'TREASURE',
    color: '#ce93d8',
    skills: ['AOE_FIRE'],
    description: 'Dame lan — sợ quái tốc độ / Silence.',
  },
  {
    id: 'hero_mage_02',
    name: 'Pháp Sư Băng',
    class: 'MAGE',
    hp: 240,
    atk: 48,
    speed: 1.7,
    range: 3.0,
    atkSpeed: 0.75,
    aoeRadius: 1.5,
    target: 'TREASURE',
    color: '#90caf9',
    skills: ['AOE_FROST', 'FREEZE'],
    description: 'AoE + Freeze — vẫn yếu trước Silence.',
  },
  {
    id: 'hero_warrior_01',
    name: 'Chiến Sĩ Thép',
    class: 'WARRIOR',
    hp: 650,
    atk: 42,
    speed: 1.4,
    range: 1.2,
    atkSpeed: 0.9,
    aoeRadius: 0,
    target: 'TREASURE',
    color: '#ef9a9a',
    skills: ['SHIELD'],
    description: 'Trâu bò — sợ Boss 5★ burst đơn mục tiêu.',
  },
  {
    id: 'hero_warrior_02',
    name: 'Hiệp Sĩ Lá Chắn',
    class: 'WARRIOR',
    hp: 800,
    atk: 35,
    speed: 1.2,
    range: 1.3,
    atkSpeed: 0.8,
    aoeRadius: 0,
    target: 'TREASURE',
    color: '#ffcc80',
    skills: ['TAUNT_SELF'],
    description: 'Tank cực khỏe, chậm.',
  },
  {
    id: 'hero_rogue_01',
    name: 'Đạo Tặc Bóng',
    class: 'ROGUE',
    hp: 220,
    atk: 60,
    speed: 2.8,
    range: 1.1,
    atkSpeed: 1.4,
    aoeRadius: 0,
    stealth: true,
    target: 'TREASURE',
    color: '#a5d6a7',
    skills: ['STEALTH'],
    description: 'Tàng hình / chạy nhanh — sợ Mắt thần & Bẫy.',
  },
  {
    id: 'hero_rogue_02',
    name: 'Sát Thủ Lụa',
    class: 'ROGUE',
    hp: 200,
    atk: 70,
    speed: 3.0,
    range: 1.0,
    atkSpeed: 1.5,
    aoeRadius: 0,
    stealth: true,
    target: 'TREASURE',
    color: '#80cbc4',
    skills: ['STEALTH', 'BACKSTAB'],
    description: 'Cực nhanh, máu mỏng.',
  },
];

export const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));

/** Build a wave list for dungeon level (1-based). */
export function buildWave(level = 1) {
  const waves = [];
  // Level 1: 3 heroes; scales up to 8
  const count = Math.min(2 + level, 8);
  // Rotate classes so counters matter
  const order = [
    HEROES.find((h) => h.id === 'hero_mage_01'),
    HEROES.find((h) => h.id === 'hero_warrior_01'),
    HEROES.find((h) => h.id === 'hero_rogue_01'),
    HEROES.find((h) => h.id === 'hero_mage_02'),
    HEROES.find((h) => h.id === 'hero_warrior_02'),
    HEROES.find((h) => h.id === 'hero_rogue_02'),
    HEROES[0],
    HEROES[2],
  ];

  for (let i = 0; i < count; i++) {
    const template = order[i % order.length];
    const scale = 0.92 + (level - 1) * 0.11;
    waves.push({
      ...template,
      instanceId: `${template.id}_L${level}_${i}`,
      hp: Math.round(template.hp * scale),
      maxHp: Math.round(template.hp * scale),
      atk: Math.round(template.atk * scale),
      spawnDelay: i * 2.4,
    });
  }
  return waves;
}
