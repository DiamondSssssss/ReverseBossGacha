/** Wide stage maps (20 cols) — ải 40–60 */

function M(id, name, costCap, tiles, extras = {}) {
  return { id, name, costCap, tiles, ...extras };
}

const WW = '####################';

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

const H_BUFF = [
  { cells: ['1,3', '2,3', '1,4', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.45 },
  { cells: ['3,3', '3,4', '4,3'], side: 'hero', kind: 'ATK_UP', value: 1.3 },
  { cells: ['4,4', '3,2', '3,5'], side: 'hero', kind: 'HEAL_TICK', value: 8 },
];
const M_BUFF = [
  { cells: ['12,3', '13,3', '12,4', '13,4'], side: 'monster', kind: 'ATK_UP', value: 1.55 },
  { cells: ['14,3', '15,4'], side: 'monster', kind: 'DEF_UP', value: 1.5 },
  { cells: ['10,3', '10,4'], side: 'both', kind: 'HEAL_TICK', value: 7 },
];

export const RAW_WIDE_MAPS = {
  40: W('stage_40', 'Ngai Tối Thượng', 10, [
    row('~~~~....##....'), row('.oooo..ff.....'), gate('....#....dd....'), gate('.....#...ll.....'),
    row('...oooo..ii....'), row('~~##....pp.....'),
  ], { tip: 'Ải 40 — map rộng, cổng trống. Hai làn lửa/độc hai bên.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['6,2', '6,5'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 }, { cells: ['16,2', '16,5'], side: 'monster', kind: 'POISON_ZONE', value: 1.25 }] }),

  41: W('stage_41', 'Cổng Hỗn Mang', 11, [
    row('~~..^^....~~..'), row('.##.....oo.....'), gate('..............'), gate('..............'),
    row('.....oo..##....'), row('..^^....~~.....'),
  ], { tip: 'Hành lang rộng + bẫy gai giữa — đặt trap/DoT hai bên.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['9,3', '9,4', '10,3', '10,4'], side: 'both', kind: 'SPEED_DOWN', value: 0.8 }, { cells: ['7,2', '7,5', '8,2', '8,5'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }] }),

  42: W('stage_42', 'Thung Lũng Tiễn', 11, [
    row('hhhh...........'), row('.pp.....oo.....'), gate('..~~...........'), gate('.....~~........'),
    row('..f.....ii.....'), row('.i..hhhh.......'),
  ], { tip: 'Cao địa hai bên — cung địch kite. Gap-close giữa đường.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['5,3', '5,4', '6,3'], side: 'hero', kind: 'SPEED_DOWN', value: 0.75 }, { cells: ['14,1', '14,6'], side: 'monster', kind: 'ATK_UP', value: 1.35 }, { cells: ['11,2', '11,5'], side: 'monster', kind: 'ICE_ZONE', value: 1.25 }] }),

  43: W('stage_43', 'Thành Bastion', 11, [
    row('oooooooo.......'), row('##.....##......'), gate('..dd............'), gate('.....dd.........'),
    row('##.....##......'), row('oooooooo.......'),
  ], { tip: 'Hành lang siêu rộng — tank địch chậm nhưng trâu.', buffs: [...H_BUFF, { cells: ['12,3', '13,3', '12,4', '13,4'], side: 'monster', kind: 'DEF_UP', value: 1.65 }, { cells: ['14,3', '15,4', '16,3'], side: 'monster', kind: 'DEF_UP', value: 1.55 }, { cells: ['10,3', '10,4'], side: 'both', kind: 'HEAL_TICK', value: 8 }, { cells: ['8,3', '8,4'], side: 'hero', kind: 'DEF_UP', value: 1.15 }] }),

  44: W('stage_44', 'Đấu Trường Máu', 11, [
    row('^^..^^....ff...'), row('.ff.....ii.....'), gate('..~~~~..........'), gate('.....~~~~.......'),
    row('.ii.....ff.....'), row('..^^..^^.......'),
  ], { tip: 'Sông chậm giữa + bãi chông — Berserk bị kẹt.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['9,3', '9,4', '10,3', '10,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.7 }, { cells: ['7,3', '7,4'], side: 'hero', kind: 'FIRE_ZONE', value: 1.2 }, { cells: ['6,2', '6,5'], side: 'both', kind: 'HEAL_TICK', value: 6 }] }),

  45: W('stage_45', 'Tam Hình Diệt', 12, [
    row('~~dd##ll.......'), row('.^^^^....oo....'), gate('..............'), gate('..............'),
    row('....oo..^^^^...'), row('ll##dd~~.......'),
  ], { tip: 'Cost 12 — đa địa hình rộng. Bốn class cùng lúc.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['6,2', '6,5'], side: 'monster', kind: 'FIRE_ZONE', value: 1.35 }, { cells: ['15,2', '15,5'], side: 'hero', kind: 'SPEED_UP', value: 1.25 }] }),

  46: W('stage_46', 'Bão Class', 12, [
    row('l.oooo.l.......'), row('l........l.....'), gate('..ddhh..........'), gate('..hhdd..........'),
    row('l........l.....'), row('l.oooo.l.......'),
  ], { tip: 'Arena trung tâm — mọi class xuất hiện.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['9,1', '9,6'], side: 'hero', kind: 'SPEED_UP', value: 1.3 }, { cells: ['11,3', '11,4'], side: 'hero', kind: 'ATK_UP', value: 1.2 }] }),

  47: W('stage_47', 'Vực Không Đáy', 12, [
    row('~~~~##~~.......'), row('.oooo...^^.....'), gate('..#.............'), gate('...#............'),
    row('...^^..oooo....'), row('~~##~~~~.......'),
  ], { tip: '4 wave — hành lang rộng, bẫy giữa map.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['9,3', '9,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['7,3', '7,4', '8,3'], side: 'both', kind: 'SPEED_DOWN', value: 0.85 }] }),

  48: W('stage_48', 'Thiên Tiễn & Thành', 12, [
    row('hhhh##oo.......'), row('.pp............'), gate('..~~............'), gate('.....~~.........'),
    row('..f............'), row('oo##hhhh.......'),
  ], { tip: 'Cung xa + tank — hai lối tấn công song song.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['6,2', '6,3', '7,2', '7,3'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 }, { cells: ['5,4', '5,5', '6,4'], side: 'monster', kind: 'POISON_ZONE', value: 1.3 }, { cells: ['13,3', '13,4'], side: 'monster', kind: 'ICE_ZONE', value: 1.25 }] }),

  49: W('stage_49', 'Tiền Đình Tận Thế', 12, [
    row('~~dd##ll..oo...'), row('.^^^^..........'), gate('..............'), gate('..............'),
    row('..........^^^^.'), row('oo..ll##dd~~...'),
  ], { tip: 'Gần phá đảo — map dài, 4 wave elite.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['14,2', '14,5'], side: 'hero', kind: 'SPEED_UP', value: 1.3 }, { cells: ['11,3', '11,4'], side: 'both', kind: 'HEAL_TICK', value: 9 }] }),

  50: W('stage_50', 'Ngai Hỗn Mang', 12, [
    row('~~~~##~~..^^...'), row('.oooo....ff....'), gate('..#.............'), gate('...#............'),
    row('.ff....oooo....'), row('^^..~~##~~~~...'),
  ], { tip: 'Ải 50 — nửa hành trình. Map rộng, buff hero dày.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['2,2', '2,5'], side: 'hero', kind: 'DEF_UP', value: 1.2 }, { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['16,3', '16,4'], side: 'monster', kind: 'ATK_UP', value: 1.2 }] }),

  51: W('stage_51', 'Pháo Đài Tự Hủy', 12, [
    row('..^^^^..^^^^...'), row('.ff....ff......'), gate('....##..........'), gate('.....##.........'),
    row('......ff..ff...'), row('..^^^^..^^^^...'),
  ], { tip: 'Hai hàng bẫy lửa — Bomber địch nổ giữa map.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['7,3', '7,4', '8,3', '8,4'], side: 'hero', kind: 'FIRE_ZONE', value: 1.25 }, { cells: ['11,2', '11,5'], side: 'monster', kind: 'ATK_UP', value: 1.5 }] }),

  52: W('stage_52', 'Hồi Sinh Bất Tử', 12, [
    row('~~~~~~~~.......'), row('.##....##......'), gate('..............'), gate('..............'),
    row('.##....##......'), row('~~~~~~~~.......'),
  ], { tip: 'Sông hồi máu giữa — Phoenix/Healer mạnh trên nước.', buffs: [...H_BUFF, { cells: ['9,3', '9,4', '10,3', '10,4'], side: 'both', kind: 'HEAL_TICK', value: 12 }, ...M_BUFF, { cells: ['6,3', '6,4'], side: 'hero', kind: 'HEAL_TICK', value: 10 }] }),

  53: W('stage_53', 'Phá Khiên Tuyệt Đối', 13, [
    row('##..........##.'), row('..oooo..oooo..#'), gate('..............'), gate('..............'),
    row('..oooo..oooo..#'), row('##..........##.'),
  ], { tip: 'Hai pháo đài tank — Shatter/Mage pierce cần thiết.', buffs: [...H_BUFF, { cells: ['11,3', '11,4', '12,3', '12,4'], side: 'monster', kind: 'DEF_UP', value: 1.7 }, { cells: ['14,3', '15,4'], side: 'monster', kind: 'ATK_UP', value: 1.55 }, { cells: ['8,3', '8,4'], side: 'hero', kind: 'ATK_UP', value: 1.35 }] }),

  54: W('stage_54', 'Đêm Tàng Hình II', 13, [
    row('dd..........dd.'), row('..##....##.....'), gate('...d.........d..'), gate('....d.......d...'),
    row('..##....##.....'), row('dd..........dd.'),
  ], { tip: 'Tối hai bên — Rogue ẩn tiến từ rìa. Reveal toàn map.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['5,2', '5,5', '15,2', '15,5'], side: 'monster', kind: 'DARK', value: 1 }, { cells: ['9,3', '9,4'], side: 'hero', kind: 'REVEAL_AURA', value: 1 }] }),

  55: W('stage_55', 'Thiên Tiễn Cuồng Phong', 13, [
    row('hhhh....hhhh...'), row('............pp.'), gate('..~~~~~~~~......'), gate('.....~~~~~~~~...'),
    row('.pp............'), row('hhhh....hhhh...'),
  ], { tip: 'Lane cao + sông — Archer kite cực xa.', buffs: [...H_BUFF, { cells: ['14,2', '14,5', '15,3', '16,4'], side: 'monster', kind: 'ATK_UP', value: 1.6 }, { cells: ['7,3', '7,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.65 }, { cells: ['10,3', '10,4'], side: 'both', kind: 'HEAL_TICK', value: 6 }] }),

  56: W('stage_56', 'Hỗn Mang Nguyên Tố', 13, [
    row('ff....ii....pp.'), row('.~~..##..~~....'), gate('..............'), gate('..............'),
    row('.~~..##..~~....'), row('pp....ii....ff.'),
  ], { tip: 'Bốn góc nguyên tố — Mage/DoT mạnh khi đứng đúng ô.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['4,1', '4,2'], side: 'monster', kind: 'FIRE_ZONE', value: 1.4 }, { cells: ['4,5', '4,6'], side: 'monster', kind: 'ICE_ZONE', value: 1.35 }, { cells: ['15,1', '15,2'], side: 'monster', kind: 'POISON_ZONE', value: 1.35 }, { cells: ['15,5', '15,6'], side: 'monster', kind: 'FIRE_ZONE', value: 1.3 }] }),

  57: W('stage_57', 'Thành Trì Tuyệt Đối', 13, [
    row('oooooooooo.....'), row('##........##...'), gate('..dd....dd......'), gate('....dd..dd......'),
    row('##........##...'), row('oooooooooo.....'),
  ], { tip: 'Pháo đài kép — tank+healer siêu dày, map dài.', buffs: [...H_BUFF, { cells: ['12,3', '13,3', '12,4', '13,4', '14,3'], side: 'monster', kind: 'DEF_UP', value: 1.75 }, { cells: ['10,3', '10,4'], side: 'both', kind: 'HEAL_TICK', value: 10 }, { cells: ['8,3', '8,4'], side: 'hero', kind: 'DEF_UP', value: 1.2 }] }),

  58: W('stage_58', 'Cuồng Chiến Tận Thế', 13, [
    row('..^^....^^.....'), row('.ff..~~~~..ff..'), gate('..............'), gate('..............'),
    row('.ff..~~~~..ff..'), row('..^^....^^.....'),
  ], { tip: 'Arena mở — Berserk/Bomber lao thẳng. CC giữa sông.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['9,3', '9,4', '10,3', '10,4'], side: 'hero', kind: 'SPEED_DOWN', value: 0.6 }, { cells: ['6,3', '6,4'], side: 'hero', kind: 'FIRE_ZONE', value: 1.3 }, { cells: ['14,3', '14,4'], side: 'hero', kind: 'FIRE_ZONE', value: 1.3 }] }),

  59: W('stage_59', 'Tứ Đại Thiên Vương', 13, [
    row('##..~~~~..##...'), row('.^^........^^..'), gate('....#..#........'), gate('.....#..#.......'),
    row('.^^........^^..'), row('##..~~~~..##...'),
  ], { tip: '4 wave full elite — hai trụ chắn giữa map rộng.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['11,3', '11,4'], side: 'both', kind: 'HEAL_TICK', value: 9 }, { cells: ['15,2', '15,5'], side: 'hero', kind: 'SPEED_UP', value: 1.35 }] }),

  60: W('stage_60', 'Vương Quốc Tàn Lửa', 13, [
    row('~~~~ff~~ff~~~~'), row('.oooo^^oooo....'), gate('..#......#.....'), gate('...#....#......'),
    row('....oooo^^oooo'), row('~~~~ff~~ff~~~~'),
  ], { tip: 'Ải 60 — PHÁ ĐẢO. Map dài nhất, mọi nguyên tố + bẫy.', buffs: [...H_BUFF, ...M_BUFF, { cells: ['2,2', '2,5'], side: 'hero', kind: 'DEF_UP', value: 1.25 }, { cells: ['8,3', '8,4'], side: 'hero', kind: 'SILENCE_ZONE', value: 1 }, { cells: ['6,2', '6,5', '7,3', '7,4'], side: 'both', kind: 'FIRE_ZONE', value: 1.35 }, { cells: ['14,2', '14,5'], side: 'monster', kind: 'POISON_ZONE', value: 1.4 }, { cells: ['16,3', '17,4'], side: 'hero', kind: 'SPEED_UP', value: 1.4 }, { cells: ['11,3', '11,4'], side: 'both', kind: 'HEAL_TICK', value: 11 }] }),
};
