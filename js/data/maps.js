/** Per-stage continuous battle maps — 1 ải = 1 map */

import { TERRAIN } from './rooms.js?v=76';
import { RAW_WIDE_MAPS } from './mapsWide.js?v=76';

export const TILE = {
  WALL: '#',
  FLOOR: '.',
  WATER: '~',
  DARK: 'd',
  LOW: 'l',
  HIGH: 'h',
  OBSTACLE: 'o',
  HAZARD: '^',
  FIRE: 'f',
  ICE: 'i',
  POISON: 'p',
  GATE: 'G',
  TREASURE: 'T',
  /** Hành lang — Hero đi được, không đặt quái (chống gatekeep) */
  NOPLACE: 'x',
};

const CHAR_TERRAIN = {
  '~': TERRAIN.WATER,
  d: TERRAIN.DARK,
  l: TERRAIN.LOW_CEILING,
  h: TERRAIN.HIGH,
  f: TERRAIN.FIRE,
  i: TERRAIN.ICE,
  p: TERRAIN.POISON,
  '.': TERRAIN.NORMAL,
  G: TERRAIN.NORMAL,
  T: TERRAIN.NORMAL,
  '^': TERRAIN.NORMAL,
  x: TERRAIN.NORMAL,
};

/**
 * @param {object} def
 * @returns {object} compiled map (no placements yet)
 */
export function compileMap(def) {
  const rows = def.tiles.length;
  const cols = def.tiles[0].length;
  const gate = [];
  const treasure = [];
  const blocked = new Set();
  const noPlace = new Set();
  const hazard = new Set();
  const terrain = {};
  const walkable = [];

  for (let r = 0; r < rows; r++) {
    walkable[r] = [];
    const line = def.tiles[r];
    if (line.length !== cols) {
      throw new Error(`Map ${def.id} row ${r} width mismatch`);
    }
    for (let c = 0; c < cols; c++) {
      const ch = line[c];
      const key = `${c},${r}`;
      if (ch === TILE.WALL || ch === TILE.OBSTACLE) {
        blocked.add(key);
        walkable[r][c] = false;
      } else {
        walkable[r][c] = true;
        if (ch === TILE.GATE) gate.push({ col: c, row: r });
        if (ch === TILE.TREASURE) treasure.push({ col: c, row: r });
        if (ch === TILE.NOPLACE) noPlace.add(key);
        if (ch === TILE.HAZARD) hazard.add(key);
        const t = CHAR_TERRAIN[ch] || TERRAIN.NORMAL;
        if (t !== TERRAIN.NORMAL) terrain[key] = t;
      }
    }
  }

  // merge explicit terrain overrides
  if (def.terrain) {
    for (const [k, v] of Object.entries(def.terrain)) terrain[k] = v;
  }
  // optional extra no-place cells (any walkable tile)
  for (const cell of def.noPlace || []) noPlace.add(cell);

  const buffIndex = {};
  for (const b of def.buffs || []) {
    for (const cell of b.cells) {
      if (!buffIndex[cell]) buffIndex[cell] = [];
      buffIndex[cell].push(b);
    }
  }

  return {
    id: def.id,
    name: def.name,
    tip: def.tip || '',
    cols,
    rows,
    cellSize: def.cellSize || 44,
    costCap: def.costCap,
    baseCostCap: def.costCap,
    gate: gate.length ? gate : [{ col: 0, row: Math.floor(rows / 2) }],
    treasure: treasure.length
      ? treasure
      : [{ col: cols - 1, row: Math.floor(rows / 2) }],
    tiles: def.tiles.map((row) => row.split('')),
    blocked,
    noPlace,
    hazard,
    terrain,
    buffs: def.buffs || [],
    buffIndex,
    walkable,
    placements: [],
  };
}

export function terrainAt(map, col, row) {
  return map.terrain[`${col},${row}`] || TERRAIN.NORMAL;
}

export function isPlaceable(map, col, row) {
  if (col < 0 || row < 0 || col >= map.cols || row >= map.rows) return false;
  const key = `${col},${row}`;
  if (map.blocked.has(key)) return false;
  if (map.noPlace?.has(key)) return false;
  if (map.gate.some((g) => g.col === col && g.row === row)) return false;
  if (map.treasure.some((t) => t.col === col && t.row === row)) return false;
  return true;
}

export function cellKey(col, row) {
  return `${col},${row}`;
}

/** Compact factory */
function M(id, name, costCap, tiles, extras = {}) {
  return { id, name, costCap, tiles, ...extras };
}

/**
 * 40 unique stage layouts. Legend:
 * # wall  o obstacle  . floor  ~ water  d dark  l low  h high  ^ hazard
 * G gate  T treasure  x no-place corridor (Hero đi, không đặt quái)
 */
const RAW_MAPS = {
  1: M(
    'stage_01',
    'Hành Lang Mở',
    5,
    [
      '##############',
      '#.....ff.....#',
      '#.....ii.....#',
      'G............T',
      'G............T',
      '#.....pp.....#',
      '#......f.....#',
      '##############',
    ],
    {
      tip: 'Map mở — chặn giữa hành lang. Cost thấp, tập xếp.',
      buffs: [{ cells: ['6,3', '6,4'], side: 'monster', kind: 'ATK_UP', value: 1.15 }],
    }
  ),
  2: M(
    'stage_02',
    'Ngã Ba Nhẹ',
    5,
    [
      '##############',
      '#......##....#',
      '#......##....#',
      'G............T',
      'G............T',
      '#......##....#',
      '#......##....#',
      '##############',
    ],
    {
      tip: 'Hai lối phụ quanh trụ giữa — đừng để lọt một đường.',
      buffs: [{ cells: ['5,3', '5,4'], side: 'monster', kind: 'DEF_UP', value: 1.2 }],
    }
  ),
  3: M(
    'stage_03',
    'Choke Đôi',
    5,
    [
      '##############',
      '#..##....##..#',
      '#.....i......#',
      'G............T',
      'G............T',
      '#.....ff.....#',
      '#..##....##..#',
      '##############',
    ],
    {
      tip: 'Hai choke hẹp — đặt bait/tank tại eo đất.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['4,3', '4,4', '9,3', '9,4'], side: 'monster', kind: 'ATK_UP', value: 1.25 },
        { cells: ['7,2', '7,5'], side: 'hero', kind: 'SPEED_UP', value: 1.15 },
      ],
    }
  ),
  4: M(
    'stage_04',
    'Ngã Ba Sâu',
    5,
    [
      '##############',
      '#....#.......#',
      '#....#..oo...#',
      'G....#.......T',
      'G........#...T',
      '#...oo...#...#',
      '#.....ii.#...#',
      '##############',
    ],
    {
      tip: 'Ba nhánh tới kho — phủ anti-stealth trên nhánh hẹp.',
      buffs: [{ cells: ['8,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.3 }],
    }
  ),
  5: M(
    'stage_05',
    'Đầm Lầy Hẹp',
    5,
    [
      '##############',
      '#~~~~....~~~~#',
      '#~~~~.##.~~~~#',
      'G~~~~....~~~~T',
      'G~~~~....~~~~T',
      '#~~~~.##.~~~~#',
      '#~~~~....~~~~#',
      '##############',
    ],
    {
      tip: 'Nước làm chậm Hero — đặt quái WATER_BUFF trên ~.',
      buffs: [
        { cells: ['3,3', '3,4', '10,3', '10,4'], side: 'monster', kind: 'ATK_UP', value: 1.2 },
        { cells: ['6,3', '7,4'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  6: M(
    'stage_06',
    'Mê Cung Nước',
    5,
    [
      '##############',
      '#~~....~~..~~#',
      '#~~.##.~~##~~#',
      'G~~....~~....T',
      'G~~.##.~~##..T',
      '#~~....~~....#',
      '#~~....~~..~~#',
      '##############',
    ],
    {
      tip: 'Đường nước quanh co — Leviathan / Hàu mạnh ở đây.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },{ cells: ['5,3', '8,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.35 }],
    }
  ),
  7: M(
    'stage_07',
    'Hồ Chữ U',
    5,
    [
      '##############',
      '#~~~~~~~~~~~~#',
      '#~~......~~..#',
      'G~~..##..~~..T',
      'G~~..##..~~..T',
      '#~~......~~..#',
      '#~~~~~~~~~~~~#',
      '##############',
    ],
    {
      tip: 'Vòng nước ngoài + lối khô giữa — chọn choke khô hoặc buff nước.',
      buffs: [
      { kind: 'SPEED_DOWN', side: 'hero', value: 0.75, cells: ['3,3','3,4','4,3','4,4'] },
        { kind: 'ICE_ZONE', side: 'monster', value: 1.3, cells: ['8,3','8,4','9,3','9,4'] },
        { cells: ['6,3', '6,4'], side: 'monster', kind: 'DEF_UP', value: 1.25 },
        { cells: ['2,1', '11,1'], side: 'hero', kind: 'SPEED_DOWN', value: 0.8 },
      ],
    }
  ),
  8: M(
    'stage_08',
    'Hành Lang Tối',
    5,
    [
      '##############',
      '#dddd....dddd#',
      '#dd..####..dd#',
      'Gdd........ddT',
      'Gdd........ddT',
      '#dd..####..dd#',
      '#dddd....dddd#',
      '##############',
    ],
    {
      tip: 'Tối giảm tầm Hero — DARK_BUFF / Mắt thần trên d.',
      buffs: [
      { kind: 'REVEAL_AURA', side: 'monster', value: 1, cells: ['4,2','4,3','4,4'] },
        { kind: 'POISON_ZONE', side: 'monster', value: 1.3, cells: ['5,4','5,5','6,4','6,5'] },
        { cells: ['4,3', '4,4', '9,3', '9,4'], side: 'monster', kind: 'ATK_UP', value: 1.3 },
        { cells: ['6,3', '7,4'], side: 'hero', kind: 'REVEAL_AURA', value: 1 },
      ],
    }
  ),
  9: M(
    'stage_09',
    'Song Đạo Bóng',
    6,
    [
      '##############',
      '#dddd#...#ddd#',
      '#dddd#...#ddd#',
      'Gdddd.....dddT',
      'Gdddd.....dddT',
      '#dddd#...#ddd#',
      '#dddd#...#ddd#',
      '##############',
    ],
    {
      tip: 'Hai hành lang tối + giữa sáng — rogue thích mép.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },{ cells: ['5,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.25 }],
    }
  ),
  10: M(
    'stage_10',
    'Hầm Đèn Lồng',
    6,
    [
      '##############',
      '#d..d..d..d..#',
      '#d##d##d##d##d',
      'Gd...........T',
      'Gd...........T',
      '#d##d##d##d##d',
      '#d..d..d..d..#',
      '##############',
    ],
    {
      tip: 'Cột tối xen kẽ — đặt reveal ở nút giao.',
      buffs: [
        { cells: ['3,3', '6,3', '9,4'], side: 'monster', kind: 'ATK_UP', value: 1.2 },
        { cells: ['7,3', '7,4'], side: 'hero', kind: 'SPEED_UP', value: 1.15 },
      ],
    }
  ),
  11: M(
    'stage_11',
    'Hang Trần Thấp',
    6,
    [
      '##############',
      '#llllllllllll#',
      '#ll##ll##ll##l',
      'Gll........llT',
      'Gll........llT',
      '#ll##ll##ll##l',
      '#llllllllllll#',
      '##############',
    ],
    {
      tip: 'Trần thấp — Rồng Sợ Độ Cao cực mạnh. Đặt ở l.',
      buffs: [{ cells: ['5,3', '5,4', '8,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.35 }],
    }
  ),
  12: M(
    'stage_12',
    'Hang Động Hẹp',
    6,
    [
      '##############',
      '#ll....ll....#',
      '#ll.##.ll.##.#',
      'Gll.##.ll.##.T',
      'Gll....ll....T',
      '#ll.##.ll.##.#',
      '#ll....ll....#',
      '##############',
    ],
    {
      tip: 'Nhiều eo hẹp — tank + boss trần thấp.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['4,3', '9,4'], side: 'monster', kind: 'DEF_UP', value: 1.3 },
        { cells: ['6,2', '7,5'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  13: M(
    'stage_13',
    'Mê Cung Trần',
    6,
    [
      '##############',
      '#l.l.l.l.l.l.#',
      '#l#l#l#l#l#l#l',
      'Gl.l.l.l.l.l.T',
      'Gl.l.l.l.l.l.T',
      '#l#l#l#l#l#l#l',
      '#l.l.l.l.l.l.#',
      '##############',
    ],
    {
      tip: 'Lưới cột — rogue có đường phụ, warrior đi thẳng.',
      buffs: [{ cells: ['6,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.4 }],
    }
  ),
  14: M(
    'stage_14',
    'Sảnh Rộng',
    6,
    [
      '##############',
      '#hhhhhhhhhhhh#',
      '#hh........hh#',
      'Ghh........hhT',
      'Ghh........hhT',
      '#hh........hh#',
      '#hhhhhhhhhhhh#',
      '##############',
    ],
    {
      tip: 'Trần cao / mở — mage kite mạnh; quái trần thấp yếu.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'REVEAL_AURA', side: 'monster', value: 1, cells: ['4,2','4,3','4,4'] },
        { cells: ['5,3', '8,4'], side: 'hero', kind: 'SPEED_UP', value: 1.25 },
        { cells: ['6,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.15 },
      ],
    }
  ),
  15: M(
    'stage_15',
    'Quảng Trường',
    6,
    [
      '##############',
      '#hh..oooo..hh#',
      '#hh........hh#',
      'Ghh...##...hhT',
      'Ghh...##...hhT',
      '#hh........hh#',
      '#hh..oooo..hh#',
      '##############',
    ],
    {
      tip: 'Nhiều lane — phủ aura / ranged, đừng dồn một điểm.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },{ cells: ['4,3', '9,4'], side: 'monster', kind: 'ATK_UP', value: 1.2 }],
    }
  ),
  16: M(
    'stage_16',
    'Đấu Trường Cao',
    6,
    [
      '##############',
      '#h..........h#',
      '#h..######..h#',
      'Gh..........hT',
      'Gh..........hT',
      '#h..######..h#',
      '#h..........h#',
      '##############',
    ],
    {
      tip: 'Vòng ngoài + lõi tường — chọn phòng thủ vành đai hay cổng kho.',
      buffs: [
        { cells: ['3,3', '10,4'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
        { cells: ['6,3', '7,4'], side: 'monster', kind: 'DEF_UP', value: 1.35 },
      ],
    }
  ),
  17: M(
    'stage_17',
    'Pháo Đài Kép',
    6,
    [
      '##############',
      '#~~..##..dd..#',
      '#~~......dd..#',
      'G............T',
      'G............T',
      '#ll......hh..#',
      '#ll..##..hh..#',
      '##############',
    ],
    {
      tip: 'Bốn vùng địa hình — chọn quái theo ô đặt.',
      buffs: [
        { cells: ['2,1', '2,2'], side: 'monster', kind: 'ATK_UP', value: 1.3 },
        { cells: ['10,1', '10,2'], side: 'monster', kind: 'ATK_UP', value: 1.3 },
        { cells: ['6,3', '7,4'], side: 'hero', kind: 'SPEED_UP', value: 1.15 },
      ],
    }
  ),
  18: M(
    'stage_18',
    'Thành Lũy',
    6,
    [
      '##############',
      '#....oooo....#',
      '#..##....##..#',
      'G............T',
      'G............T',
      '#..##....##..#',
      '#....oooo....#',
      '##############',
    ],
    {
      tip: 'Lõi phòng thủ + hai sườn — chặn cả ba đường vào kho.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['5,3', '8,3', '5,4', '8,4'], side: 'monster', kind: 'DEF_UP', value: 1.4 },
        { cells: ['3,3', '10,4'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  19: M(
    'stage_19',
    'Pháo Đài Hỗn Địa',
    6,
    [
      '##############',
      '#~~dd##llhh~~#',
      '#~~..##..~~..#',
      'G............T',
      'G............T',
      '#..~~##..dd..#',
      '#hhll##dd~~hh#',
      '##############',
    ],
    {
      tip: 'Hỗn địa hình — đọc ô trước khi thả boss.',
      buffs: [
        { cells: ['3,3', '10,4'], side: 'monster', kind: 'ATK_UP', value: 1.35 },
        { cells: ['6,3', '7,4'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
        { cells: ['1,1', '12,6'], side: 'both', kind: 'HEAL_TICK', value: 4 },
      ],
    }
  ),
  20: M(
    'stage_20',
    'Sảnh Boss Lệch',
    6,
    [
      '##############',
      '#d....####...#',
      '#d...........#',
      'G.....#......T',
      'G......#.....T',
      '#~~~~~.......#',
      '#~~~~~####...#',
      '##############',
    ],
    {
      tip: 'Đường chính hẹp + sườn nước/tối — kho hở một cánh.',
      buffs: [
      { kind: 'ICE_ZONE', side: 'monster', value: 1.3, cells: ['8,3','8,4','9,3','9,4'] },
        { kind: 'POISON_ZONE', side: 'monster', value: 1.3, cells: ['5,4','5,5','6,4','6,5'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['5,3', '5,4'], side: 'monster', kind: 'ATK_UP', value: 1.45 },
        { cells: ['10,2', '10,5'], side: 'hero', kind: 'SPEED_UP', value: 1.25 },
        { cells: ['2,5', '3,5'], side: 'monster', kind: 'ATK_UP', value: 1.3 },
      ],
    }
  ),
  21: M(
    'stage_21',
    'Cổng Địa Ngục',
    7,
    [
      '##############',
      '#~~..........#',
      '#~~.##..##...#',
      'G............T',
      'G............T',
      '#...##..##.~~#',
      '#.....pp...~~#',
      '##############',
    ],
    {
      tip: 'Ải 21+ khó hơn — hai cánh nước, cost 7.',
      buffs: [
        { cells: ['5,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.25 },
        { cells: ['3,3', '10,4'], side: 'hero', kind: 'SPEED_UP', value: 1.15 },
      ],
    }
  ),
  22: M(
    'stage_22',
    'Hành Lang Phalanx',
    7,
    [
      '##############',
      '#....oooo....#',
      '#..##....##..#',
      'G............T',
      'G............T',
      '#..##....##..#',
      '#....oooo....#',
      '##############',
    ],
    {
      tip: 'Choke kép — chiến binh dễ giữ tuyến.',
      buffs: [
      { kind: 'ICE_ZONE', side: 'monster', value: 1.3, cells: ['8,3','8,4','9,3','9,4'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['4,3', '9,4'], side: 'monster', kind: 'DEF_UP', value: 1.3 },
        { cells: ['6,3', '7,4'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
      ],
    }
  ),
  23: M(
    'stage_23',
    'Thánh Địa Máu',
    7,
    [
      '##############',
      '#hh........hh#',
      '#..d......d..#',
      'G............T',
      'G............T',
      '#..d......d..#',
      '#hh........hh#',
      '##############',
    ],
    {
      tip: 'Ô heal giữa — healer địch lợi hại nếu để sống.',
      buffs: [
        { cells: ['6,3', '7,4'], side: 'both', kind: 'HEAL_TICK', value: 5 },
        { cells: ['3,3', '10,4'], side: 'monster', kind: 'ATK_UP', value: 1.3 },
      ],
    }
  ),
  24: M(
    'stage_24',
    'Song Đột Kích',
    7,
    [
      '##############',
      '#d...........#',
      '#d..oooo.....#',
      'G............T',
      'G............T',
      '#.....oooo..d#',
      '#......f....d#',
      '##############',
    ],
    {
      tip: 'Sườn tối + chướng ngại — anti-rogue trước.',
      buffs: [
        { cells: ['2,2', '11,5'], side: 'monster', kind: 'ATK_UP', value: 1.35 },
        { cells: ['5,3', '8,4'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  25: M(
    'stage_25',
    'Thập Tự Đỏ',
    8,
    [
      '##############',
      '#xxx.##..~~..#',
      '#xxx.##......#',
      'Gxxx....ll...T',
      'Gxxx....hh...T',
      '#xxx...##....#',
      '#xxx.~~##..~~#',
      '##############',
    ],
    {
      tip: 'Hành lang cổng không đặt được — xếp giữa/cuối. Cost 8.',
      buffs: [
        { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.3 },
        { cells: ['3,3', '3,4'], side: 'hero', kind: 'ATK_UP', value: 1.15 },
        { cells: ['6,3', '7,4', '8,3'], side: 'monster', kind: 'ATK_UP', value: 1.35 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.3 },
        { cells: ['5,2', '5,5'], side: 'hero', kind: 'HEAL_TICK', value: 4 },
      ],
    }
  ),
  26: M(
    'stage_26',
    'Lò Thép',
    8,
    [
      '##############',
      '#xxx.l....l..#',
      '#xxx.^^^^.dd.#',
      'Gxxx..llhh...T',
      'Gxxx..hhll...T',
      '#xxx.dd.^^^^.#',
      '#xxx.l....l..#',
      '##############',
    ],
    {
      tip: 'Cổng trống + hazard giữa — đặt sau lò, đọc địa hình.',
      buffs: [
      { kind: 'POISON_ZONE', side: 'monster', value: 1.3, cells: ['5,4','5,5','6,4','6,5'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['1,3', '2,4', '3,3'], side: 'hero', kind: 'SPEED_UP', value: 1.35 },
        { cells: ['2,2', '2,5'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
        { cells: ['6,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.4 },
        { cells: ['10,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.35 },
        { cells: ['8,2', '8,5'], side: 'both', kind: 'HEAL_TICK', value: 5 },
      ],
    }
  ),
  27: M(
    'stage_27',
    'Đêm Thánh',
    8,
    [
      '##############',
      '#xxxdddd..~~.#',
      '#xxx..i......#',
      'Gxxx..##ll...T',
      'Gxxx..##hh...T',
      '#xxx..ff.....#',
      '#xxx~~..dddd.#',
      '##############',
    ],
    {
      tip: 'Không gatekeep — tối/nước sau hành lang. Mắt thần giữa.',
      buffs: [
        { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.3 },
        { cells: ['3,2', '3,5'], side: 'hero', kind: 'HEAL_TICK', value: 5 },
        { cells: ['6,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.4 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.3 },
        { cells: ['5,1', '5,6'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
        { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),
  28: M(
    'stage_28',
    'Thành Bất Diệt',
    8,
    [
      '##############',
      '#xxxoooooo...#',
      '#xxx##....##.#',
      'Gxxx..~~~~...T',
      'Gxxx..dddd...T',
      '#xxx##....##.#',
      '#xxxoooooo...#',
      '##############',
    ],
    {
      tip: 'Hành lang cổng trống — phòng thủ bắt đầu từ giữa map.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ICE_ZONE', side: 'monster', value: 1.3, cells: ['8,3','8,4','9,3','9,4'] },
        { cells: ['1,3', '2,4', '3,3', '3,4'], side: 'hero', kind: 'SPEED_UP', value: 1.35 },
        { cells: ['2,3', '2,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['6,3', '7,3', '6,4', '7,4'], side: 'monster', kind: 'DEF_UP', value: 1.45 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'ATK_UP', value: 1.35 },
        { cells: ['5,2', '5,5'], side: 'both', kind: 'HEAL_TICK', value: 6 },
      ],
    }
  ),
  29: M(
    'stage_29',
    'Tiền Đình Tận Thế',
    8,
    [
      '##############',
      '#xxx~~dd##ll.#',
      '#xxx..ii.....#',
      'Gxxx..^^hh...T',
      'Gxxx..hh^^...T',
      '#xxx..pp.....#',
      '#xxxll##dd~~.#',
      '##############',
    ],
    {
      tip: 'Cổng không đặt — hỗn địa hình giữa. Giữ spell.',
      buffs: [
        { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.3 },
        { cells: ['3,3', '3,4'], side: 'hero', kind: 'HEAL_TICK', value: 6 },
        { cells: ['6,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.45 },
        { cells: ['9,2', '10,5'], side: 'monster', kind: 'DEF_UP', value: 1.35 },
        { cells: ['5,2', '8,5'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
        { cells: ['4,1', '4,6'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  30: M(
    'stage_30',
    'Sảnh Tối Thượng',
    8,
    [
      '##############',
      '#xxx~~~~##~~~#',
      '#xxx...f.....#',
      'Gxxx..#..dd..T',
      'Gxxx...#.ll..T',
      '#xxx..i......#',
      '#xxx~~~##~~~~#',
      '##############',
    ],
    {
      tip: 'Ải 30 — hành lang cổng trống, buff hero mạnh gần G.',
      buffs: [
      { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
        { cells: ['3,3', '3,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['3,2', '3,5'], side: 'hero', kind: 'HEAL_TICK', value: 5 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.5 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.4 },
        { cells: ['6,2', '6,5'], side: 'both', kind: 'HEAL_TICK', value: 5 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),
  31: M(
    'stage_31',
    'Vực Titan',
    9,
    [
      '##############',
      '#xxxx.oo..~~.#',
      '#xxxx.##.....#',
      'Gxxxx..llhh..T',
      'Gxxxx..hhll..T',
      '#xxxx.ff.##..#',
      '#xxxx.oo..~~.#',
      '##############',
    ],
    {
      tip: '4 ô cổng không đặt — Boss-tier. Cap 9.',
      buffs: [
        { cells: ['1,3', '2,4', '3,3', '4,4'], side: 'hero', kind: 'SPEED_UP', value: 1.35 },
        { cells: ['2,3', '3,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.45 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.4 },
        { cells: ['6,2', '6,5'], side: 'hero', kind: 'HEAL_TICK', value: 6 },
        { cells: ['5,1', '5,6'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  32: M(
    'stage_32',
    'Hành Lang Titan',
    9,
    [
      '##############',
      '#xxxx.####...#',
      '#xxxx.oo..oo.#',
      'Gxxxx..~~~~..T',
      'Gxxxx..dddd..T',
      '#xxxx.oo..oo.#',
      '#xxxx.####...#',
      '##############',
    ],
    {
      tip: 'Choke sau hành lang trống — tank giữa map.',
      buffs: [
        { cells: ['1,3', '2,3', '3,4', '4,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
        { cells: ['2,2', '3,5'], side: 'hero', kind: 'ATK_UP', value: 1.3 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'DEF_UP', value: 1.5 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'ATK_UP', value: 1.4 },
        { cells: ['6,3', '6,4'], side: 'both', kind: 'HEAL_TICK', value: 7 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),
  33: M(
    'stage_33',
    'Pháp Điện Đen',
    9,
    [
      '##############',
      '#xxxxdd....dd#',
      '#xxxx..~~....#',
      'Gxxxx..ll....T',
      'Gxxxx..hh....T',
      '#xxxx.ii.~~..#',
      '#xxxxdd....dd#',
      '##############',
    ],
    {
      tip: 'Cổng trống + silence zone — chặn mage elite.',
      buffs: [
        { cells: ['1,3', '2,4', '3,3'], side: 'hero', kind: 'SPEED_UP', value: 1.35 },
        { cells: ['4,3', '4,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['3,2', '3,5'], side: 'hero', kind: 'HEAL_TICK', value: 5 },
        { cells: ['6,3', '7,4'], side: 'monster', kind: 'ATK_UP', value: 1.45 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.35 },
        { cells: ['5,3', '5,4', '8,3'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['8,2', '8,5'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
  34: M(
    'stage_34',
    'Mê Cung Ảnh',
    9,
    [
      '##############',
      '#xxxxoooooo.d#',
      '#xxxx.pp....d#',
      'Gxxxx..~~ll..T',
      'Gxxxx..hh~~..T',
      '#xxxxd.......#',
      '#xxxxdoooooo.#',
      '##############',
    ],
    {
      tip: 'Không đặt gần cổng — tối/sườn cho rogue.',
      buffs: [
        { cells: ['1,3', '2,3', '3,4', '4,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
        { cells: ['2,4', '3,3'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.5 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.35 },
        { cells: ['6,2', '6,5'], side: 'both', kind: 'HEAL_TICK', value: 6 },
        { cells: ['5,1', '5,6'], side: 'hero', kind: 'HEAL_TICK', value: 4 },
        { cells: ['11,3', '11,4'], side: 'hero', kind: 'SPEED_UP', value: 1.15 },
      ],
    }
  ),
  35: M(
    'stage_35',
    'Thánh Điện Máu',
    9,
    [
      '##############',
      '#xxxx.##..hh.#',
      '#xxxx..f.....#',
      'Gxxxx..~~....T',
      'Gxxxx..dd....T',
      '#xxxx.i......#',
      '#xxxx.hh..##.#',
      '##############',
    ],
    {
      tip: 'Heal hero gần cổng — hạ healer địch trước.',
      buffs: [
      { kind: 'POISON_ZONE', side: 'monster', value: 1.3, cells: ['5,4','5,5','6,4','6,5'] },
        { kind: 'ATK_UP', side: 'monster', value: 1.2, cells: ['10,2','10,3','10,4','10,5'] },
        { cells: ['1,3', '2,4', '3,3', '4,4'], side: 'hero', kind: 'HEAL_TICK', value: 8 },
        { cells: ['2,3', '3,4'], side: 'hero', kind: 'SPEED_UP', value: 1.3 },
        { cells: ['4,2', '4,5'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.45 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.4 },
        { cells: ['6,3', '6,4'], side: 'both', kind: 'HEAL_TICK', value: 7 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),
  36: M(
    'stage_36',
    'Lò Hủy Diệt',
    10,
    [
      '##############',
      '#xxxxl.^^^^.l#',
      '#xxxxl......l#',
      'Gxxxx..ddhh..T',
      'Gxxxx..hhdd..T',
      '#xxxxl......l#',
      '#xxxxl.^^^^.l#',
      '##############',
    ],
    {
      tip: 'Cost 10 — cổng trống + hazard. Đặt sau lò.',
      buffs: [
      { kind: 'POISON_ZONE', side: 'monster', value: 1.3, cells: ['5,4','5,5','6,4','6,5'] },
        { kind: 'FIRE_ZONE', side: 'monster', value: 1.3, cells: ['6,2','6,3','7,2','7,3'] },
        { kind: 'REVEAL_AURA', side: 'monster', value: 1, cells: ['4,2','4,3','4,4'] },
        { cells: ['1,3', '2,3', '3,4', '4,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
        { cells: ['2,4', '3,3'], side: 'hero', kind: 'ATK_UP', value: 1.3 },
        { cells: ['4,2', '4,5'], side: 'hero', kind: 'HEAL_TICK', value: 6 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.5 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.45 },
        { cells: ['6,1', '6,6'], side: 'hero', kind: 'SPEED_UP', value: 1.25 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'ATK_UP', value: 1.15 },
      ],
    }
  ),
  37: M(
    'stage_37',
    'Thành Sắt Đen',
    10,
    [
      '##############',
      '#xxxxoooooo..#',
      '#xxxx##.....##',
      'Gxxxx..oo....T',
      'Gxxxx....oo..T',
      '#xxxx##.....##',
      '#xxxxoooooo..#',
      '##############',
    ],
    {
      tip: 'Phòng thủ sau hành lang — Boss/DoT bắt buộc.',
      buffs: [
        { cells: ['1,3', '2,4', '3,3', '4,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
        { cells: ['2,3', '3,4'], side: 'hero', kind: 'ATK_UP', value: 1.3 },
        { cells: ['3,2', '3,5'], side: 'hero', kind: 'HEAL_TICK', value: 5 },
        { cells: ['7,3', '8,3', '7,4', '8,4'], side: 'monster', kind: 'DEF_UP', value: 1.55 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'ATK_UP', value: 1.45 },
        { cells: ['6,2', '6,5'], side: 'both', kind: 'HEAL_TICK', value: 7 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),
  38: M(
    'stage_38',
    'Song Diệt Thần',
    10,
    [
      '##############',
      '#xxxx~~dd..~~#',
      '#xxxx.ff.....#',
      'Gxxxx..##ll..T',
      'Gxxxx..##hh..T',
      '#xxxx.ii.....#',
      '#xxxx~~..dd~~#',
      '##############',
    ],
    {
      tip: 'Đa địa hình sau cổng trống — đội hình đa dụng.',
      buffs: [
        { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.35 },
        { cells: ['3,3', '4,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['3,2', '4,5'], side: 'hero', kind: 'HEAL_TICK', value: 6 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.5 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.4 },
        { cells: ['6,3', '6,4'], side: 'both', kind: 'HEAL_TICK', value: 8 },
        { cells: ['5,1', '5,6'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
        { cells: ['8,2', '8,5'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),
  39: M(
    'stage_39',
    'Tiền Đình Hỗn Mang',
    10,
    [
      '##############',
      '#xxxx~~dd##ll#',
      '#xxxx.^^^^...#',
      'Gxxxx........T',
      'Gxxxx........T',
      '#xxxx...^^^^.#',
      '#xxxxll##dd~~#',
      '##############',
    ],
    {
      tip: 'Hỗn địa hình + 4 wave — không gatekeep cổng.',
      buffs: [
        { cells: ['1,3', '2,4', '3,3', '4,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
        { cells: ['2,3', '3,4'], side: 'hero', kind: 'ATK_UP', value: 1.3 },
        { cells: ['4,2', '4,5'], side: 'hero', kind: 'HEAL_TICK', value: 7 },
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'ATK_UP', value: 1.55 },
        { cells: ['9,3', '10,4'], side: 'monster', kind: 'DEF_UP', value: 1.45 },
        { cells: ['6,3', '6,4'], side: 'both', kind: 'HEAL_TICK', value: 8 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['11,2', '11,5'], side: 'hero', kind: 'SPEED_UP', value: 1.2 },
      ],
    }
  ),
};

Object.assign(RAW_MAPS, RAW_WIDE_MAPS);

export const STAGE_MAPS = {};
for (let i = 1; i <= 60; i++) {
  STAGE_MAPS[i] = compileMap(RAW_MAPS[i]);
}

export function getStageMap(level) {
  const lv = Math.max(1, Math.min(60, level | 0));
  const base = STAGE_MAPS[lv];
  return {
    ...base,
    blocked: new Set(base.blocked),
    noPlace: new Set(base.noPlace || []),
    terrain: { ...base.terrain },
    buffIndex: { ...base.buffIndex },
    buffs: base.buffs.map((b) => ({ ...b, cells: [...b.cells] })),
    gate: base.gate.map((g) => ({ ...g })),
    treasure: base.treasure.map((t) => ({ ...t })),
    tiles: base.tiles.map((row) => [...row]),
    walkable: base.walkable.map((row) => [...row]),
    placements: [],
    costCap: base.baseCostCap,
  };
}
