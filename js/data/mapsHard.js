/**
 * CHẾ ĐỘ KHÓ — 60 map độc lập 42×8 (Cổng → Kho)
 *
 * QUY CHUẨN THIẾT KẾ (mỗi level = 1 bài toán đố, không chia band theme):
 * 1. Pathfinding: mỗi map bắt buộc ≥1 đường Hero tới Kho; trộn zigzag / fork / choke / spiral / island.
 * 2. Buff tranh chấp: ≥1 HERO_BUFF (SPEED/HEAL/ATK/DEF) trên đường đi chính hoặc ngã rẽ.
 *    ≥1 MONSTER_BUFF ở góc khuất / alcove — thưởng vị trí quái.
 * 3. Nguyên tố: mỗi map ≥2 loại terrain (f/i/p/~ /q dầu) + có thể ^ hazard.
 * 4. Penalty zone: ≥1 SILENCE / DEF_SHRED / HEAL_CUT trên Hero.
 * 5. Không lặp layout: archetype × variant × seed(level) — 60 combo riêng.
 */

import { compileMap } from './maps.js?v=120';

const COLS = 42;
const ROWS = 8;
const MID = 36;
const PLAY_START = 5;

/** @typedef {string[][]} Grid6 — 6 hàng playable (map row 1–6), mỗi hàng 36 ký tự */

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function rngForLevel(level) {
  return mulberry32(level * 2654435761 + 1013904223);
}

function emptyGrid() {
  return Array.from({ length: 6 }, () => Array(MID).fill('.'));
}

function wrapRow(mid) {
  return `#xxxx${mid.join('')}#`;
}

function gateRow(mid) {
  return `Gxxxx${mid.join('')}T`;
}

function assembleTiles(grid) {
  return [
    '#'.repeat(COLS),
    wrapRow(grid[0]),
    wrapRow(grid[1]),
    gateRow(grid[2]),
    gateRow(grid[3]),
    wrapRow(grid[4]),
    wrapRow(grid[5]),
    '#'.repeat(COLS),
  ];
}

function mapCol(gCol) {
  return `${gCol + PLAY_START},`;
}

function cellKey(gCol, mapRow) {
  return `${gCol + PLAY_START},${mapRow}`;
}

function isWalkable(ch) {
  return ch !== '#' && ch !== 'o';
}

/** BFS — Hero phải tới được cột phải (gCol ≥ MID-3) từ cổng hàng 3–4 */
function validateConnectivity(grid) {
  const startRows = [2, 3];
  const seen = new Set();
  const q = [];
  for (const r of startRows) {
    if (isWalkable(grid[r][0])) q.push([0, r]);
  }
  while (q.length) {
    const [c, r] = q.shift();
    const k = `${c},${r}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (c >= MID - 4) return true;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nc >= MID || nr < 0 || nr >= 6) continue;
      if (!isWalkable(grid[nr][nc])) continue;
      q.push([nc, nr]);
    }
  }
  return false;
}

function carveLine(grid, gCol, row, len, ch = 'o') {
  for (let i = 0; i < len; i++) {
    const c = gCol + i;
    if (c >= 0 && c < MID && row >= 0 && row < 6) grid[row][c] = ch;
  }
}

function carveBlock(grid, gCol, row, w, h, ch = 'o') {
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const c = gCol + dc;
      const r = row + dr;
      if (c >= 0 && c < MID && r >= 0 && r < 6) grid[r][c] = ch;
    }
  }
}

const ARCHETYPES = [
  'zigzag',
  'single_choke',
  'double_choke',
  'fork_upper',
  'fork_lower',
  's_curve',
  'spiral',
  'islands',
  'bridge',
  'teeth',
  'lane_weave',
  'pocket',
  'ring',
  'cross',
  'snake',
];

/** 60 tên ải — không theo band theme */
const HARD_NAMES = [
  'Hành Lang Gãy Khúc',
  'Eo Hẹp Đơn',
  'Hầm Hai Khóa',
  'Ngã Ba Trên',
  'Ngã Ba Dưới',
  'Đường S Băng',
  'Xoắn Ốc Dầu',
  'Quần Đảo Lửa',
  'Cầu Chữ Thập',
  'Răng Cưa Độc',
  'Dệt Làn Nước',
  'Hốc Góc Buff',
  'Vòng Ngoài Gai',
  'Chữ Thập Băng',
  'Rắn Sáu Tầng',
  'Zic Trái Phải',
  'Cổ Chai Giữa',
  'Khóa Kép Sét',
  'Phân Luồng Cao',
  'Phân Luồng Thấp',
  'Uốn Cong Độc',
  'Xoáy Tối',
  'Đảo Nhỏ Dầu',
  'Cầu Treo',
  'Gai Xen Kẽ',
  'Dệt Băng Lửa',
  'Alcove Hồi',
  'Vành Đai Câm',
  'Ngã Tư Bẫy',
  'Mạch Rắn Đôi',
  'Khúc Cua Trên',
  'Hẹp Dưới',
  'Choke Sét',
  'Fork Độc',
  'S Lửa',
  'Spiral Nước',
  'Đảo Băng',
  'Bridge Gai',
  'Răng Lửa',
  'Weave Tối',
  'Pocket Giáp',
  'Ring Dầu',
  'Cross Độc',
  'Snake Hồi',
  'Zic Độc',
  'Choke Băng',
  'Khóa Lửa',
  'Fork Sét',
  'Luồng Thấp Độc',
  'Uốn Nước',
  'Xoáy Gai',
  'Đảo Câm',
  'Cầu Băng',
  'Gai Dầu',
  'Dệt Độc',
  'Hốc Tốc',
  'Vòng Shred',
  'Ngã Tư Lửa',
  'Mạch Rắn Băng',
  'Cuối Cùng — Hỗn Mang',
];

const ARCH_ASSIGN = (() => {
  const order = Array.from({ length: 60 }, (_, i) => i);
  let s = 1337;
  for (let i = order.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
})();

function applyArchetype(grid, type, variant, rng) {
  const v = variant % 4;
  const off = v * 3;
  switch (type) {
    case 'zigzag':
      for (let i = 0; i < 5; i++) {
        const col = 4 + i * 6 + off;
        carveBlock(grid, col, i % 2 === 0 ? 0 : 4, 2, 2, 'o');
      }
      break;
    case 'single_choke':
      carveBlock(grid, 14 + off, 0, 4, 2, '#');
      carveBlock(grid, 14 + off, 4, 4, 2, '#');
      grid[2][16 + off] = '.';
      grid[3][16 + off] = '.';
      break;
    case 'double_choke':
      carveBlock(grid, 10 + off, 1, 3, 4, 'o');
      carveBlock(grid, 22 + off, 1, 3, 4, 'o');
      grid[2][11 + off] = grid[3][11 + off] = '.';
      grid[2][23 + off] = grid[3][23 + off] = '.';
      break;
    case 'fork_upper':
      carveLine(grid, 10 + off, 2, 8, 'o');
      carveLine(grid, 10 + off, 3, 8, 'o');
      for (let c = 10 + off; c < 18 + off; c++) {
        grid[0][c] = grid[1][c] = '.';
        grid[4][c] = grid[5][c] = 'o';
      }
      break;
    case 'fork_lower':
      carveLine(grid, 10 + off, 2, 8, 'o');
      carveLine(grid, 10 + off, 3, 8, 'o');
      for (let c = 10 + off; c < 18 + off; c++) {
        grid[4][c] = grid[5][c] = '.';
        grid[0][c] = grid[1][c] = 'o';
      }
      break;
    case 's_curve':
      carveBlock(grid, 6 + off, 0, 10, 2, 'o');
      carveBlock(grid, 18 + off, 4, 10, 2, 'o');
      break;
    case 'spiral':
      carveLine(grid, 2, 1, MID - 4, '#');
      carveLine(grid, 2, 4, MID - 4, '#');
      carveBlock(grid, MID - 6, 1, 2, 3, '#');
      carveBlock(grid, 4 + off, 2, 2, 2, 'o');
      break;
    case 'islands':
      for (let i = 0; i < 6; i++) {
        const c = 3 + i * 5 + (v % 2);
        const r = (i + v) % 4;
        carveBlock(grid, c, r, 2, 2, 'o');
      }
      break;
    case 'bridge':
      for (let c = 0; c < MID; c++) {
        if (c < 8 + off || c > 26 + off) {
          grid[0][c] = grid[1][c] = 'o';
          grid[4][c] = grid[5][c] = 'o';
        }
      }
      grid[2][12 + off] = grid[3][12 + off] = '.';
      break;
    case 'teeth':
      for (let c = 4; c < MID - 2; c += 4) {
        grid[(c + v) % 2 === 0 ? 1 : 4][c] = 'o';
        grid[2][c + 1] = grid[3][c + 1] = '.';
      }
      break;
    case 'lane_weave':
      for (let c = 0; c < MID; c++) {
        grid[0][c] = c % 4 === 0 ? '~' : '.';
        grid[5][c] = c % 4 === 2 ? 'f' : '.';
      }
      break;
    case 'pocket':
      carveBlock(grid, MID - 8, 0, 5, 2, 'o');
      carveBlock(grid, MID - 8, 4, 5, 2, 'o');
      grid[1][MID - 6] = grid[4][MID - 6] = '.';
      break;
    case 'ring':
      carveBlock(grid, 12 + off, 1, 12, 4, 'o');
      grid[2][18 + off] = grid[3][18 + off] = '.';
      grid[1][18 + off] = grid[4][18 + off] = '.';
      break;
    case 'cross':
      carveLine(grid, 16 + off, 0, 1, '#');
      for (let r = 0; r < 6; r++) grid[r][16 + off] = r === 2 || r === 3 ? '.' : '#';
      carveLine(grid, 8 + off, 2, 20, 'o');
      grid[2][8 + off] = grid[3][8 + off] = '.';
      break;
    case 'snake':
      for (let c = 2; c < MID - 2; c++) {
        const r = (Math.floor(c / 3) + v) % 6;
        if (r !== 2 && r !== 3) grid[r][c] = grid[r][c] === '.' ? 'o' : grid[r][c];
      }
      grid[2][2] = grid[3][2] = '.';
      break;
    default:
      break;
  }
}

const ELEMENT_POOLS = [
  ['f', 'i'],
  ['~', 'p'],
  ['f', '~'],
  ['i', 'p'],
  ['q', 'f'],
  ['~', 'i'],
  ['p', 'q'],
  ['f', 'p'],
  ['d', 'f'],
  ['~', 'q'],
  ['i', 'q'],
  ['l', 'p'],
  ['h', '~'],
  ['d', 'i'],
  ['f', 'l'],
];

function scatterElements(grid, level, rng) {
  const pool = ELEMENT_POOLS[(level + level * 7) % ELEMENT_POOLS.length];
  const hazardChance = 0.12 + (level % 5) * 0.02;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < MID; c++) {
      if (grid[r][c] !== '.') continue;
      if (r === 2 || r === 3) {
        if (rng() > 0.22) continue;
      } else if (rng() > 0.14) continue;
      const roll = rng();
      if (roll < hazardChance && r !== 2 && r !== 3) {
        grid[r][c] = '^';
      } else if (roll < 0.55) {
        grid[r][c] = pool[0];
      } else {
        grid[r][c] = pool[1];
      }
    }
  }
  // Giữ hành lang cổng thông thoáng
  for (let c = 0; c < 6; c++) {
    grid[2][c] = grid[2][c] === 'o' || grid[2][c] === '#' ? '.' : grid[2][c];
    grid[3][c] = grid[3][c] === 'o' || grid[3][c] === '#' ? '.' : grid[3][c];
  }
}

const HERO_BUFF_KINDS = [
  { kind: 'SPEED_UP', value: 1.25 },
  { kind: 'SPEED_UP', value: 1.35 },
  { kind: 'HEAL_TICK', value: 6 },
  { kind: 'HEAL_TICK', value: 8 },
  { kind: 'ATK_UP', value: 1.3 },
  { kind: 'DEF_UP', value: 1.25 },
];

const MONSTER_BUFF_KINDS = [
  { kind: 'ATK_UP', value: 1.45 },
  { kind: 'DEF_UP', value: 1.4 },
  { kind: 'FIRE_ZONE', value: 1.3 },
  { kind: 'ICE_ZONE', value: 1.3 },
  { kind: 'POISON_ZONE', value: 1.28 },
  { kind: 'HEAL_TICK', value: 5 },
];

const PENALTY_KINDS = [
  { kind: 'SILENCE_ZONE', value: 1 },
  { kind: 'DEF_SHRED_ZONE', value: 0.7 },
  { kind: 'HEAL_CUT_ZONE', value: 1 },
];

function pickCells(grid, count, rng, preferRows) {
  const cells = [];
  const candidates = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < MID; c++) {
      if (!isWalkable(grid[r][c])) continue;
      if (c < 3 && (r === 2 || r === 3)) continue;
      candidates.push([c, r]);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const sorted = candidates.sort((a, b) => {
    const pa = preferRows.includes(a[1]) ? 0 : 1;
    const pb = preferRows.includes(b[1]) ? 0 : 1;
    return pa - pb || a[0] - b[0];
  });
  for (let i = 0; i < Math.min(count, sorted.length); i++) {
    const [c, r] = sorted[i];
    cells.push(cellKey(c, r + 1));
  }
  return cells;
}

function buildBuffs(level, grid, rng) {
  const buffs = [];
  const hi = HERO_BUFF_KINDS[level % HERO_BUFF_KINDS.length];
  const mi = MONSTER_BUFF_KINDS[(level * 3) % MONSTER_BUFF_KINDS.length];
  const pi = PENALTY_KINDS[(level * 5) % PENALTY_KINDS.length];

  const heroCells = pickCells(grid, 2 + (level % 2), rng, [2, 3]);
  const monCells = pickCells(grid, 2, rng, [0, 1, 4, 5]);
  const penCells = pickCells(grid, 1 + (level % 2), rng, [2, 3, 4]);

  buffs.push({ cells: heroCells, side: 'hero', kind: hi.kind, value: hi.value });
  buffs.push({ cells: monCells, side: 'monster', kind: mi.kind, value: mi.value });
  buffs.push({ cells: penCells, side: 'hero', kind: pi.kind, value: pi.value });

  if (level % 7 === 0) {
    buffs.push({
      cells: pickCells(grid, 2, rng, [1, 4]),
      side: 'both',
      kind: 'HEAL_TICK',
      value: 4,
    });
  }
  if (level % 11 === 0) {
    buffs.push({
      cells: pickCells(grid, 1, rng, [2, 3]),
      side: 'hero',
      kind: 'REVEAL_AURA',
      value: 1,
    });
  }
  return buffs;
}

function buildTip(level, archetype, elements) {
  const hints = [
    'Chặn buff Hero trên đường chính — Taunt/Stun/Bẫy.',
    'Quái đứng ô buff góc để tối đa sát thương.',
    'Đội hình đa hệ — địa hình ép đổi lane.',
    'Vùng câm/shred/heal-cut — đừng cậy stat to một chỗ.',
    'Hero lửa + ô dầu/nước — chuẩn bị quái chịu AoE.',
  ];
  return `Khó · Ải ${level} · ${archetype} · ${elements.join('/')}: ${hints[level % hints.length]}`;
}

function costCapForLevel(level) {
  return Math.min(12, 5 + Math.floor(level / 7));
}

function poolMultForLevel(level) {
  return Math.min(8, 5 + Math.floor(level / 12));
}

function generateHardMapDef(level) {
  const rng = rngForLevel(level);
  const combo = ARCH_ASSIGN[level - 1];
  const archetype = ARCHETYPES[combo % ARCHETYPES.length];
  const variant = Math.floor(combo / ARCHETYPES.length) % 4;
  const elements = ELEMENT_POOLS[(level + combo) % ELEMENT_POOLS.length];

  let grid = emptyGrid();
  applyArchetype(grid, archetype, variant, rng);

  let attempts = 0;
  while (!validateConnectivity(grid) && attempts < 8) {
    grid = emptyGrid();
    applyArchetype(grid, archetype, variant, rng);
    // Nới choke nếu kẹt
    grid[2][0] = grid[3][0] = '.';
    grid[2][1] = grid[3][1] = '.';
    for (let c = 0; c < MID; c++) {
      if (grid[2][c] === '#' || grid[2][c] === 'o') grid[2][c] = '.';
      if (grid[3][c] === '#' || grid[3][c] === 'o') grid[3][c] = '.';
    }
    attempts++;
  }

  scatterElements(grid, level, rng);
  if (!validateConnectivity(grid)) {
    for (let c = 0; c < MID; c++) {
      grid[2][c] = '.';
      grid[3][c] = '.';
    }
  }

  const buffs = buildBuffs(level, grid, rng);

  return {
    id: `hard_${String(level).padStart(2, '0')}`,
    name: HARD_NAMES[level - 1] || `Khó ${level}`,
    costCap: costCapForLevel(level),
    poolMultOverride: poolMultForLevel(level),
    tiles: assembleTiles(grid),
    tip: buildTip(level, archetype, elements),
    buffs,
  };
}

/** @type {Record<number, object>} */
export const HARD_STAGE_MAPS = {};
for (let lv = 1; lv <= 60; lv++) {
  HARD_STAGE_MAPS[lv] = compileMap(generateHardMapDef(lv));
}

export function getHardStageMap(level) {
  const lv = Math.max(1, Math.min(60, level | 0));
  const base = HARD_STAGE_MAPS[lv];
  return {
    ...base,
    tiles: base.tiles.map((row) => [...row]),
    blocked: new Set(base.blocked),
    noPlace: new Set(base.noPlace || []),
    hazard: new Set(base.hazard || []),
    terrain: { ...base.terrain },
    buffs: (base.buffs || []).map((b) => ({ ...b, cells: [...b.cells] })),
    buffIndex: Object.fromEntries(
      Object.entries(base.buffIndex || {}).map(([k, arr]) => [k, arr.map((b) => ({ ...b }))])
    ),
    placements: [],
  };
}

export const HARD_MAP_DESIGN_RULES = {
  cols: COLS,
  rows: ROWS,
  requiredMix: [
    'pathfinding',
    'hero_buff',
    'monster_buff',
    'elements',
    'penalty_zone',
  ],
  archetypes: ARCHETYPES,
};
