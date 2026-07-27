/** Wide stage maps (20 cols) — ải 40–60
 * Boss fights 40/45/50/55/60: 60 cols (×3).
 * Thiết kế theo element: ép đổi loadout (nước / tối / lửa / băng / độc / trần thấp).
 */

function M(id, name, costCap, tiles, extras = {}) {
  return { id, name, costCap, tiles, ...extras };
}

const WW = '####################';
const BBB = '############################################################';

function row(tail) {
  const t = `${tail}`.padEnd(14, '.').slice(0, 14);
  return `#xxxx${t}#`;
}

function gate(tail) {
  const t = `${tail}`.padEnd(14, '.').slice(0, 14);
  return `Gxxxx${t}T`;
}

function W(id, name, costCap, rows, extras = {}) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== 20) {
      throw new Error(`Map ${id} row ${i} width ${rows[i].length} !== 20: ${rows[i]}`);
    }
  }
  return M(id, name, costCap, [WW, ...rows, WW], extras);
}

/** Boss corridor: 60 cols = G/# + xxxx + 54 mid + T/# */
function bossRow(mid) {
  const t = `${mid}`.padEnd(54, '.').slice(0, 54);
  return `#xxxx${t}#`;
}

function bossGate(mid) {
  const t = `${mid}`.padEnd(54, '.').slice(0, 54);
  return `Gxxxx${t}T`;
}

function WB(id, name, costCap, rows, extras = {}) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== 60) {
      throw new Error(`Boss map ${id} row ${i} width ${rows[i].length} !== 60: ${rows[i]}`);
    }
  }
  return M(id, name, costCap, [BBB, ...rows, BBB], extras);
}

const H_NEAR = [
  { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 },
  { cells: ['3,3', '3,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
];

/** Buff hero gần gate trên map dài */
const H_BOSS_NEAR = [
  { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.45 },
  { cells: ['3,3', '3,4', '4,3'], side: 'hero', kind: 'ATK_UP', value: 1.3 },
  { cells: ['5,2', '5,5'], side: 'hero', kind: 'DEF_UP', value: 1.15 },
];

/** Ô quái đứng gần kho — chỉ số cụ thể */
function mAtk(...cells) {
  return { cells, side: 'monster', kind: 'ATK_UP', value: 1.35 };
}
function mDef(...cells) {
  return { cells, side: 'monster', kind: 'DEF_UP', value: 1.4 };
}

export const RAW_WIDE_MAPS = {
  // Boss fight: map ×3 dài — đa nguyên tố
  40: WB(
    'stage_40',
    'Ngai Boss Đa Nguyên Tố',
    12,
    [
      bossRow('~~~~ffff....iiii....pppp....dddd....~~~~....ffff..'),
      bossRow('.oooo......oooo......oooo......oooo......oooo.....'),
      bossGate('..~~..ff..ii..pp..dd......~~..ff..ii..pp..dd......'),
      bossGate('..~~..ff..ii..pp..dd......~~..ff..ii..pp..dd......'),
      bossRow('.oooo......oooo......oooo......oooo......oooo.....'),
      bossRow('~~~~ffff....iiii....pppp....dddd....~~~~....ffff..'),
    ],
    {
      tip: 'Boss fight — map ×3 dài. Segment ~ / f / i / p / d. Pool mang ×5. Focus Hero Boss.',
      buffs: [
        ...H_BOSS_NEAR,
        { cells: ['18,3', '19,4'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
        { cells: ['28,3', '28,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['38,3', '39,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.7 },
        { cells: ['22,2', '22,5'], side: 'both', kind: 'HEAL_TICK', value: 7 },
        mAtk('48,3', '49,3', '48,4'),
        mDef('52,3', '53,4', '54,3'),
        { cells: ['12,3', '12,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 },
        { cells: ['32,3', '32,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.3 },
        { cells: ['42,3', '42,4'], side: 'monster', kind: 'ICE_ZONE', value: 1.3 },
      ],
    }
  ),

  // Water dominant
  41: W(
    'stage_41',
    'Đầm Lầy Ngập',
    11,
    [
      row('~~~~~~~~~~~~~~'),
      row('~~........~~~~'),
      gate('~~..........~~'),
      gate('~~..........~~'),
      row('~~~~........~~'),
      row('~~~~~~~~~~~~~~'),
    ],
    {
      tip: 'Gần như toàn nước — mang Buff nước. Quái lửa/cạn bị yếu nặng.',
      buffs: [
        ...H_NEAR,
        mAtk('10,3', '11,3', '10,4', '11,4'),
        mDef('13,3', '14,4'),
        { cells: ['7,3', '8,4'], side: 'both', kind: 'HEAL_TICK', value: 8 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.7 },
      ],
    }
  ),

  // Dark
  42: W(
    'stage_42',
    'Hầm Đèn Tắt',
    11,
    [
      row('dddddddddddddd'),
      row('dd........dddd'),
      gate('dd..........dd'),
      gate('dd..........dd'),
      row('dddd........dd'),
      row('dddddddddddddd'),
    ],
    {
      tip: 'Toàn bóng tối — Buff tối +100% ATK trên d. Quái không tối bị −35% ATK.',
      buffs: [
        ...H_NEAR,
        mAtk('11,3', '12,3', '11,4'),
        mDef('14,3', '15,4'),
        { cells: ['8,3', '8,4', '9,3'], side: 'monster', kind: 'REVEAL_AURA', value: 1 },
        { cells: ['6,3', '6,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),

  // Fire
  43: W(
    'stage_43',
    'Lò Nung Thép',
    11,
    [
      row('ffffffffffffff'),
      row('ff........ffff'),
      gate('ff....oo....ff'),
      gate('ff....oo....ff'),
      row('ffff........ff'),
      row('ffffffffffffff'),
    ],
    {
      tip: 'Biển lửa — Buff lửa trên f. Đừng đặt quái nước/băng (bị nerf nặng).',
      buffs: [
        ...H_NEAR,
        mAtk('10,3', '11,4', '12,3'),
        mDef('14,3', '15,4'),
        { cells: ['7,3', '7,4', '8,3', '8,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.35 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.75 },
      ],
    }
  ),

  // Ice
  44: W(
    'stage_44',
    'Sảnh Băng Giá',
    11,
    [
      row('iiiiiiiiiiiiii'),
      row('ii........iiii'),
      gate('ii..........ii'),
      gate('ii..........ii'),
      row('iiii........ii'),
      row('iiiiiiiiiiiiii'),
    ],
    {
      tip: 'Toàn băng — Buff băng trên i. Quái lửa đứng đây bị −45% ATK.',
      buffs: [
        ...H_NEAR,
        mAtk('11,3', '12,4'),
        mDef('14,3', '15,4', '16,3'),
        { cells: ['8,3', '8,4', '9,3', '9,4'], side: 'monster', kind: 'ICE_ZONE', value: 1.3 },
        { cells: ['6,3', '6,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.65 },
      ],
    }
  ),

  // Boss fight: bóng + độc dài
  45: WB(
    'stage_45',
    'Hành Lang Boss Bóng Độc',
    13,
    [
      bossRow('ddddddddpppppp........ddddddddpppppp........dddddd'),
      bossRow('dd....pp....dd........pp....dd....pp........pp....'),
      bossGate('dd....pp..............pp....dd..............pp....'),
      bossGate('pp....dd..............dd....pp..............dd....'),
      bossRow('pp....dd....pp........dd....pp....dd........dd....'),
      bossRow('ppppppdddddddd........ppppppdddddddd........pppppp'),
    ],
    {
      tip: 'Boss fight — map ×3. Nửa đầu tối/độc, giữa mixed, gần kho ATK quái. Pool ×5. Focus boss ẩn.',
      buffs: [
        ...H_BOSS_NEAR,
        { cells: ['14,3', '15,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.65 },
        { cells: ['24,3', '24,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['34,2', '34,5'], side: 'both', kind: 'HEAL_TICK', value: 6 },
        { cells: ['44,3', '44,4'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
        mAtk('50,3', '51,3', '50,4'),
        mDef('54,3', '55,4', '56,3'),
        { cells: ['10,3', '11,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.4 },
        { cells: ['40,3', '40,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.35 },
      ],
    }
  ),

  // Low ceiling caves
  46: W(
    'stage_46',
    'Hang Trần Thấp',
    12,
    [
      row('llllllllllllll'),
      row('ll........llll'),
      gate('ll....##....ll'),
      gate('ll....##....ll'),
      row('llll........ll'),
      row('llllllllllllll'),
    ],
    {
      tip: 'Hang thấp — quái Sợ trần cao trên l: +200% ATK. Tránh ô trần cao (h).',
      buffs: [
        ...H_NEAR,
        mAtk('11,3', '12,3', '11,4'),
        mDef('14,3', '15,4'),
        { cells: ['8,3', '8,4'], side: 'both', kind: 'HEAL_TICK', value: 7 },
        { cells: ['5,3', '5,4'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
      ],
    }
  ),

  // Water + Dark split lanes
  47: W(
    'stage_47',
    'Sông & Bóng',
    12,
    [
      row('~~~~~~dddddddd'),
      row('~~~~......dddd'),
      gate('~~..........dd'),
      gate('~~..........dd'),
      row('~~~~......dddd'),
      row('~~~~~~dddddddd'),
    ],
    {
      tip: 'Làn trên nước + làn dưới tối — đặt Buff nước trên ~, Buff tối trên d.',
      buffs: [
        ...H_NEAR,
        mAtk('9,3', '10,3'),
        mAtk('14,3', '15,4'),
        mDef('16,3', '17,4'),
        { cells: ['7,3', '7,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['12,3', '12,4'], side: 'monster', kind: 'REVEAL_AURA', value: 1 },
      ],
    }
  ),

  // Fire + Ice conflict
  48: W(
    'stage_48',
    'Lửa Đối Băng',
    12,
    [
      row('ffffffiiiiiiii'),
      row('ffff......iiii'),
      gate('ff..........ii'),
      gate('ff..........ii'),
      row('ffff......iiii'),
      row('ffffffiiiiiiii'),
    ],
    {
      tip: 'Nửa lửa nửa băng — đặt đúng element. Sai phía = nerf chéo (−45% ATK).',
      buffs: [
        ...H_NEAR,
        { cells: ['8,3', '8,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.25 },
        { cells: ['11,3', '11,4'], side: 'monster', kind: 'ICE_ZONE', value: 1.25 },
        mAtk('14,3', '15,4'),
        mDef('16,3', '17,4'),
      ],
    }
  ),

  // Poison + low ceiling
  49: W(
    'stage_49',
    'Hang Độc Thấp',
    12,
    [
      row('ppppllllllllll'),
      row('pppp......llll'),
      gate('pp..........ll'),
      gate('pp..........ll'),
      row('pppp......llll'),
      row('ppppllllllllll'),
    ],
    {
      tip: 'Độc + trần thấp — Buff độc trên p, Sợ trần cao trên l.',
      buffs: [
        ...H_NEAR,
        mAtk('9,3', '10,4'),
        mAtk('14,3', '15,4'),
        mDef('16,3', '17,4'),
        { cells: ['7,3', '7,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.3 },
      ],
    }
  ),

  // Boss fight: pháp trận hỗn loạn dài
  50: WB(
    'stage_50',
    'Pháp Trận Boss Hỗn Nguyên',
    13,
    [
      bossRow('~~~~ffffiiii~~~~ffffiiii~~~~ffffiiii~~~~ffffiiii~~'),
      bossRow('.pp..dd..##..ll..pp..dd......ll..pp..dd..##..ll..p'),
      bossGate('........##..................##....................'),
      bossGate('........##..................##....................'),
      bossRow('.pp..dd..##..ll..pp..dd......ll..pp..dd..##..ll..p'),
      bossRow('~~~~ffffiiii~~~~ffffiiii~~~~ffffiiii~~~~ffffiiii~~'),
    ],
    {
      tip: 'Boss fight — map ×3. Xen i/f/~ + tường choke. Pool ×5. Focus Pháp vương.',
      buffs: [
        ...H_BOSS_NEAR,
        { cells: ['16,3', '16,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['26,3', '27,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.7 },
        { cells: ['36,3', '36,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['20,2', '20,5'], side: 'both', kind: 'HEAL_TICK', value: 8 },
        mAtk('48,3', '49,3', '48,4'),
        mDef('52,3', '53,4', '54,3'),
        { cells: ['8,3', '8,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 },
        { cells: ['12,3', '12,4'], side: 'monster', kind: 'ICE_ZONE', value: 1.3 },
        { cells: ['42,3', '42,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.35 },
      ],
    }
  ),

  51: W(
    'stage_51',
    'Thác Độc Lửa',
    12,
    [
      row('ffffppppffffpp'),
      row('ff........ppff'),
      gate('ff....^^....pp'),
      gate('ff....^^....pp'),
      row('ff........ppff'),
      row('ppppffffppppff'),
    ],
    {
      tip: 'Lửa ↔ độc xen kẽ + gai giữa — chỉ đặt đúng element; sai ô = yếu.',
      buffs: [
        ...H_NEAR,
        mAtk('10,3', '11,4'),
        mDef('14,3', '15,4'),
        { cells: ['7,3', '8,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 },
        { cells: ['12,3', '13,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.3 },
      ],
    }
  ),

  52: W(
    'stage_52',
    'Hồ Đêm',
    12,
    [
      row('~~~~dddd~~~~dd'),
      row('~~........dd~~'),
      gate('~~..........dd'),
      gate('~~..........dd'),
      row('~~........dd~~'),
      row('dddd~~~~dddd~~'),
    ],
    {
      tip: 'Nước + tối — Buff nước / Buff tối. Hero chậm trên nước, mù trên tối.',
      buffs: [
        ...H_NEAR,
        mAtk('9,3', '10,3', '14,4'),
        mDef('15,3', '16,4'),
        { cells: ['11,3', '11,4'], side: 'monster', kind: 'REVEAL_AURA', value: 1 },
        { cells: ['6,3', '6,4'], side: 'both', kind: 'HEAL_TICK', value: 9 },
      ],
    }
  ),

  53: W(
    'stage_53',
    'Pháo Đài Băng Lửa',
    13,
    [
      row('##ffff##iiii##'),
      row('..ffff..iiii..'),
      gate('..ff......ii..'),
      gate('..ff......ii..'),
      row('..ffff..iiii..'),
      row('##ffff##iiii##'),
    ],
    {
      tip: 'Hai pháo đài lửa/băng — chọn 1 phía element hoặc đội hỗn hợp đúng ô.',
      buffs: [
        ...H_NEAR,
        mAtk('7,3', '8,3'),
        mAtk('12,3', '13,4'),
        mDef('15,3', '16,4'),
        { cells: ['9,3', '10,4'], side: 'both', kind: 'HEAL_TICK', value: 6 },
      ],
    }
  ),

  54: W(
    'stage_54',
    'Mê Cung Tối Thấp',
    13,
    [
      row('ddllddllddlldd'),
      row('dd..ll..dd..ll'),
      gate('dd..........ll'),
      gate('ll..........dd'),
      row('ll..dd..ll..dd'),
      row('llddllddllddll'),
    ],
    {
      tip: 'Tối + trần thấp — Buff tối / Sợ trần cao. Sàn thường = −20%~−35% ATK.',
      buffs: [
        ...H_NEAR,
        mAtk('10,3', '11,4', '12,3'),
        mDef('14,3', '15,4'),
        { cells: ['8,3', '8,4'], side: 'monster', kind: 'REVEAL_AURA', value: 1 },
      ],
    }
  ),

  // Boss fight: đường tiễn gió dài
  55: WB(
    'stage_55',
    'Đường Tiễn Boss Cuồng Phong',
    14,
    [
      bossRow('ffff..........iiii..........ffff..........iiii....'),
      bossRow('oooooooooooooooooooooooooooooooooooooooooooooooooo'),
      bossGate('llll................llll................llll......'),
      bossGate('llll................llll................llll......'),
      bossRow('oooooooooooooooooooooooooooooooooooooooooooooooooo'),
      bossRow('iiii..........ffff..........iiii..........ffff....'),
    ],
    {
      tip: 'Boss fight — map ×3. Trần thấp giữa + lửa/băng mép. Pool ×5. Gap-close Thiên tiễn.',
      buffs: [
        ...H_BOSS_NEAR,
        { cells: ['14,3', '15,4'], side: 'hero', kind: 'SPEED_UP', value: 1.35 },
        { cells: ['28,3', '28,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['40,3', '41,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.65 },
        { cells: ['22,2', '22,5'], side: 'both', kind: 'HEAL_TICK', value: 7 },
        mAtk('50,3', '51,3', '50,4'),
        mDef('54,3', '55,4', '56,3'),
        { cells: ['6,2', '6,5'], side: 'monster', kind: 'FIRE_ZONE', value: 1.35 },
        { cells: ['18,2', '18,5'], side: 'monster', kind: 'ICE_ZONE', value: 1.35 },
        { cells: ['46,3', '46,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 },
      ],
    }
  ),

  56: W(
    'stage_56',
    'Bốn Góc Nguyên Tố',
    13,
    [
      row('ffff......iiii'),
      row('ff..........ii'),
      gate('......##......'),
      gate('......##......'),
      row('pp..........~~'),
      row('pppp......~~~~'),
    ],
    {
      tip: '4 góc: lửa / băng / độc / nước — mỗi góc 1 element. Đặt lệch góc = nerf.',
      buffs: [
        ...H_NEAR,
        mAtk('9,2', '10,2'),
        mAtk('9,5', '10,5'),
        mDef('14,3', '15,4'),
        { cells: ['7,3', '7,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
      ],
    }
  ),

  57: W(
    'stage_57',
    'Thành Trì Độc Nước',
    13,
    [
      row('oooooooooooooo'),
      row('~~pp~~pp~~pp~~'),
      gate('~~pp......pp~~'),
      gate('~~pp......pp~~'),
      row('~~pp~~pp~~pp~~'),
      row('oooooooooooooo'),
    ],
    {
      tip: 'Hành lang nước+độc giữa tường — Buff nước/độc. Tank cạn đứng đây yếu.',
      buffs: [
        ...H_NEAR,
        mAtk('10,3', '11,3', '10,4'),
        mDef('13,3', '14,3', '13,4', '14,4'),
        { cells: ['8,3', '8,4'], side: 'both', kind: 'HEAL_TICK', value: 8 },
      ],
    }
  ),

  58: W(
    'stage_58',
    'Đấu Trường Lửa',
    13,
    [
      row('..ffffffffff..'),
      row('.ff~~~~~~~~ff.'),
      gate('ff..........ff'),
      gate('ff..........ff'),
      row('.ff~~~~~~~~ff.'),
      row('..ffffffffff..'),
    ],
    {
      tip: 'Vành lửa + sông giữa — Buff lửa trên f, Buff nước trên ~. Berserk cạn bị yếu trên cả hai.',
      buffs: [
        ...H_NEAR,
        mAtk('9,3', '10,4'),
        mDef('14,3', '15,4'),
        { cells: ['7,3', '7,4', '12,3', '12,4'], side: 'monster', kind: 'FIRE_ZONE', value: 1.35 },
        { cells: ['8,3', '8,4', '11,3', '11,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.7 },
      ],
    }
  ),

  59: W(
    'stage_59',
    'Tứ Trụ Element',
    13,
    [
      row('##~~##dd##ff##'),
      row('..~~..dd..ff..'),
      gate('..............'),
      gate('..............'),
      row('..ii..pp..ll..'),
      row('##ii##pp##ll##'),
    ],
    {
      tip: '6 trụ element quanh đường giữa — đọc ô trước khi thả. Sai element = −25%~−45% ATK.',
      buffs: [
        ...H_NEAR,
        mAtk('9,3', '10,3', '9,4', '10,4'),
        mDef('14,3', '15,4'),
        { cells: ['7,3', '7,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['12,3', '12,4'], side: 'both', kind: 'HEAL_TICK', value: 9 },
      ],
    }
  ),

  // Boss fight cuối: full palette dài
  60: WB(
    'stage_60',
    'Vương Quốc Boss Tận Thế',
    14,
    [
      bossRow('~~~~ffffiiii~~~~ppppddddllll~~~~ffffiiii~~~~ppppdd'),
      bossRow('ppoooo^^ooooppddoooo^^ooooll~~~~oooo^^ooooffffiiii'),
      bossGate('..#......#........#......#........#......#........'),
      bossGate('...#....#..........#....#..........#....#.........'),
      bossRow('ddoooo^^ooooddppoooo^^ooooffiiii~~~~oooo^^oooollll'),
      bossRow('llllffffiiii~~~~ddddpppp~~~~iiiiffff~~~~ddddpppp~~'),
    ],
    {
      tip: 'Ải 60 Boss — map ×3 đủ element + gai. Pool ×5. Focus Hoàng đế; đọc từng đoạn trước khi thả.',
      buffs: [
        ...H_BOSS_NEAR,
        { cells: ['12,2', '12,5'], side: 'hero', kind: 'DEF_UP', value: 1.2 },
        { cells: ['24,3', '24,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 },
        { cells: ['36,3', '37,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.68 },
        { cells: ['48,3', '48,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
        { cells: ['18,2', '18,5'], side: 'both', kind: 'HEAL_TICK', value: 10 },
        { cells: ['42,2', '42,5'], side: 'both', kind: 'HEAL_TICK', value: 8 },
        mAtk('52,3', '53,3', '52,4'),
        mDef('55,3', '56,4', '57,3'),
        { cells: ['8,2', '8,5'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 },
        { cells: ['28,3', '28,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.35 },
        { cells: ['40,3', '40,4'], side: 'monster', kind: 'ICE_ZONE', value: 1.3 },
      ],
    }
  ),
};
