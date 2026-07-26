/** Hero AI catalog — mỗi ải 1–40 có tổ hợp hero riêng */

import { COMBAT } from './constants.js?v=57';

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
  {
    id: 'hero_mage_06',
    name: 'Diệt Long Sư',
    class: 'MAGE',
    hp: 780, atk: 175, speed: 1.85, range: 3.8, atkSpeed: 0.82, aoeRadius: 2.5,
    target: 'TREASURE', color: '#ea80fc', skills: ['AOE_FIRE', 'FREEZE'],
    description: 'AoE ngang Rồng 7 cost — cần Silence / burst ngay.',
  },
  {
    id: 'hero_mage_07',
    name: 'Hắc Tinh Quân',
    class: 'MAGE',
    hp: 920, atk: 210, speed: 1.7, range: 4.0, atkSpeed: 0.78, aoeRadius: 2.8,
    target: 'TREASURE', color: '#7e57c2', skills: ['AOE_FROST', 'FREEZE', 'AOE_FIRE'],
    description: 'Pháp sư ngang Hydra/Leviathan — free cast là xóa tuyến.',
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
  {
    id: 'hero_warrior_06',
    name: 'Phá Thành Thương',
    class: 'WARRIOR',
    hp: 780, atk: 72, speed: 1.55, range: 1.4, atkSpeed: 1.05, aoeRadius: 0,
    target: 'TREASURE', color: '#ff7043', skills: ['SHIELD'],
    description: 'Chiến binh xung kích — máu dày + dame nặng.',
  },
  {
    id: 'hero_warrior_07',
    name: 'Hộ Vệ Hoàng Kim',
    class: 'WARRIOR',
    hp: 1100, atk: 40, speed: 1.05, range: 1.3, atkSpeed: 0.85, aoeRadius: 0,
    target: 'TREASURE', color: '#ffd54f', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tank hậu kỳ — khiên + taunt, cực khó hạ.',
  },
  {
    id: 'hero_warrior_08',
    name: 'Bạo Chúa Sắt',
    class: 'WARRIOR',
    hp: 900, atk: 88, speed: 1.65, range: 1.5, atkSpeed: 1.1, aoeRadius: 0,
    target: 'TREASURE', color: '#c62828', skills: ['SHIELD', 'TAUNT_SELF'],
    description: 'Elite chiến binh — vừa tank vừa cày kho.',
  },
  {
    id: 'hero_warrior_09',
    name: 'Thiết Giáp Titan',
    class: 'WARRIOR',
    hp: 2200, atk: 145, speed: 1.15, range: 1.45, atkSpeed: 0.95, aoeRadius: 0,
    target: 'TREASURE', color: '#ff8a65', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tank ngang Behemoth 7 cost — cần DoT / Boss burst.',
  },
  {
    id: 'hero_warrior_10',
    name: 'Đại Tướng Huyết',
    class: 'WARRIOR',
    hp: 1850, atk: 190, speed: 1.5, range: 1.6, atkSpeed: 1.2, aoeRadius: 0,
    target: 'TREASURE', color: '#e53935', skills: ['SHIELD', 'TAUNT_SELF'],
    description: 'DPS ngang Rồng 7 cost — đe dọa cả hàng Boss.',
  },
  {
    id: 'hero_warrior_11',
    name: 'Hoàng Đế Phá Thành',
    class: 'WARRIOR',
    hp: 2800, atk: 170, speed: 1.2, range: 1.65, atkSpeed: 1.05, aoeRadius: 0,
    target: 'TREASURE', color: '#b71c1c', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Siêu tank ngang Hydra/Behemoth 8 cost — bỏ sót mất kho.',
  },

  // ——— HEALER ———
  {
    id: 'hero_healer_01',
    name: 'Tu Sĩ Hồi Sinh',
    class: 'HEALER',
    hp: 320, atk: 28, speed: 1.6, range: 2.8, atkSpeed: 0.75, aoeRadius: 0,
    target: 'TREASURE', color: '#fff9c4', skills: ['HEAL_ALLY'],
    description: 'Hồi máu đồng đội — ưu tiên hạ healer trước.',
  },
  {
    id: 'hero_healer_02',
    name: 'Nữ Tư Tế Ánh',
    class: 'HEALER',
    hp: 380, atk: 32, speed: 1.5, range: 3.0, atkSpeed: 0.8, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Heal mạnh + khiên — giữ cả wave sống lâu.',
  },
  {
    id: 'hero_healer_03',
    name: 'Thánh Giả Tận Thế',
    class: 'HEALER',
    hp: 450, atk: 36, speed: 1.45, range: 3.2, atkSpeed: 0.85, aoeRadius: 0,
    target: 'TREASURE', color: '#ffecb3', skills: ['HEAL_ALLY'],
    description: 'Heal elite hậu kỳ — bỏ sót là thua kéo dài.',
  },
  {
    id: 'hero_healer_04',
    name: 'Đại Tư Tế Ánh',
    class: 'HEALER',
    hp: 950, atk: 72, speed: 1.55, range: 3.5, atkSpeed: 0.95, aoeRadius: 0,
    target: 'TREASURE', color: '#fff59d', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Heal ngang Thiên Sứ 7 cost — giữ wall chiến binh sống dai.',
  },
  {
    id: 'hero_healer_05',
    name: 'Thiên Sứ Hồi Sinh',
    class: 'HEALER',
    hp: 1200, atk: 90, speed: 1.4, range: 3.8, atkSpeed: 1.0, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe57f', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Healer Boss-tier — không hạ sớm thì wave không chết.',
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
  {
    id: 'hero_rogue_06',
    name: 'Sát Thủ Huyết Ảnh',
    class: 'ROGUE',
    hp: 580, atk: 165, speed: 3.2, range: 1.3, atkSpeed: 1.6, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#26a69a', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Rogue ngang Wraith/Rồng — bắt buộc Mắt thần.',
  },
  {
    id: 'hero_rogue_07',
    name: 'Ma Ảnh Độc Vương',
    class: 'ROGUE',
    hp: 680, atk: 185, speed: 2.95, range: 2.8, atkSpeed: 1.4, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#00897b', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Rogue Boss-tier — lướt qua tuyến nếu thiếu anti-stealth.',
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
    theme: 'Đột phá cuối — Phá đảo sơ cấp',
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

  // ——— Ải 21–30: khó hơn, nhiều chiến binh, đi theo wave ———
  21: {
    theme: 'Bước vào địa ngục',
    tip: 'Hai wave chiến binh — mang heal quái + burst tank.',
    waves: [
      { delay: 0.6, ids: ['hero_warrior_06', 'hero_warrior_01', 'hero_warrior_03', 'hero_healer_01'] },
      { delay: 16, ids: ['hero_warrior_02', 'hero_warrior_07', 'hero_mage_02'] },
    ],
  },
  22: {
    theme: 'Phalanx sắt',
    tip: 'Toàn chiến binh dày đặc theo 3 đợt.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_05', 'hero_warrior_02', 'hero_warrior_04'] },
      { delay: 12, ids: ['hero_warrior_06', 'hero_warrior_07', 'hero_healer_01'] },
      { delay: 24, ids: ['hero_warrior_08', 'hero_warrior_03', 'hero_warrior_01'] },
    ],
  },
  23: {
    theme: 'Thánh chiến',
    tip: 'Healer đi cùng tank — ưu tiên hạ healer trước.',
    waves: [
      { delay: 0.7, ids: ['hero_healer_02', 'hero_warrior_07', 'hero_warrior_04'] },
      { delay: 14, ids: ['hero_warrior_06', 'hero_healer_01', 'hero_mage_04', 'hero_warrior_02'] },
    ],
  },
  24: {
    theme: 'Đột kích kép',
    tip: 'Wave 1 rogue, wave 2 wall chiến binh.',
    waves: [
      { delay: 0.5, ids: ['hero_rogue_04', 'hero_rogue_02', 'hero_rogue_05', 'hero_rogue_01'] },
      { delay: 15, ids: ['hero_warrior_08', 'hero_warrior_07', 'hero_warrior_06', 'hero_healer_02'] },
    ],
  },
  25: {
    theme: 'Thập tự quân',
    tip: 'Ba wave: scout → phalanx → healer elite.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_03', 'hero_mage_03', 'hero_rogue_03'] },
      { delay: 11, ids: ['hero_warrior_05', 'hero_warrior_06', 'hero_warrior_04', 'hero_warrior_01'] },
      { delay: 23, ids: ['hero_healer_03', 'hero_warrior_07', 'hero_warrior_08'] },
    ],
  },
  26: {
    theme: 'Bão thép',
    tip: 'Chiến binh dồn dập — đừng để kho bị cày.',
    waves: [
      { delay: 0.4, ids: ['hero_warrior_06', 'hero_warrior_08', 'hero_healer_01', 'hero_mage_01'] },
      { delay: 10, ids: ['hero_warrior_07', 'hero_warrior_05', 'hero_warrior_02', 'hero_healer_02'] },
      { delay: 22, ids: ['hero_warrior_08', 'hero_warrior_06', 'hero_warrior_04', 'hero_mage_05'] },
    ],
  },
  27: {
    theme: 'Đêm thánh chiến',
    tip: 'Rogue mở đường + healer giữ wall sau.',
    waves: [
      { delay: 0.5, ids: ['hero_rogue_04', 'hero_rogue_05', 'hero_rogue_02'] },
      { delay: 12, ids: ['hero_healer_02', 'hero_warrior_07', 'hero_warrior_06', 'hero_mage_04'] },
      { delay: 24, ids: ['hero_healer_03', 'hero_warrior_08', 'hero_warrior_05', 'hero_rogue_04'] },
    ],
  },
  28: {
    theme: 'Thành trì bất diệt',
    tip: 'Tank + healer liên tục — cần DoT / boss burst.',
    waves: [
      { delay: 0.6, ids: ['hero_warrior_07', 'hero_healer_02', 'hero_warrior_05', 'hero_warrior_02'] },
      { delay: 13, ids: ['hero_warrior_08', 'hero_healer_03', 'hero_warrior_06', 'hero_warrior_04'] },
      { delay: 26, ids: ['hero_warrior_07', 'hero_warrior_08', 'hero_healer_03', 'hero_mage_05', 'hero_warrior_01'] },
    ],
  },
  29: {
    theme: 'Đêm trước tận thế',
    tip: 'Bốn wave liên hoàn — giữ spell cho đợt cuối.',
    waves: [
      { delay: 0.4, ids: ['hero_mage_05', 'hero_rogue_04', 'hero_warrior_03'] },
      { delay: 10, ids: ['hero_warrior_06', 'hero_warrior_08', 'hero_healer_02', 'hero_rogue_05'] },
      { delay: 20, ids: ['hero_warrior_07', 'hero_healer_03', 'hero_mage_03', 'hero_warrior_05'] },
      { delay: 30, ids: ['hero_warrior_08', 'hero_warrior_07', 'hero_healer_03', 'hero_mage_05'] },
    ],
  },
  30: {
    theme: 'Sảnh tối thượng',
    tip: 'Full war + healer waves — cửa ngõ ải 31.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_06', 'hero_healer_01', 'hero_rogue_04', 'hero_mage_05'] },
      { delay: 12, ids: ['hero_warrior_07', 'hero_warrior_08', 'hero_healer_02', 'hero_warrior_05', 'hero_mage_03'] },
      { delay: 24, ids: ['hero_healer_03', 'hero_warrior_08', 'hero_warrior_07', 'hero_rogue_05', 'hero_mage_05', 'hero_warrior_06'] },
    ],
  },

  // ——— Ải 31–40: hero elite ngang quái 7–8 cost / Boss ———
  31: {
    theme: 'Bước vào vực sâu',
    tip: 'Elite war + mage ngang Boss 7–8 cost.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_09', 'hero_warrior_10', 'hero_healer_04'] },
      { delay: 14, ids: ['hero_mage_06', 'hero_warrior_08', 'hero_rogue_06'] },
      { delay: 26, ids: ['hero_warrior_09', 'hero_healer_03', 'hero_mage_06'] },
    ],
  },
  32: {
    theme: 'Phalanx titan',
    tip: 'Toàn chiến binh Boss-tier — DoT / Hydra / Behemoth.',
    waves: [
      { delay: 0.4, ids: ['hero_warrior_09', 'hero_warrior_07', 'hero_warrior_10'] },
      { delay: 12, ids: ['hero_warrior_11', 'hero_healer_04', 'hero_warrior_08'] },
      { delay: 24, ids: ['hero_warrior_10', 'hero_warrior_09', 'hero_healer_04', 'hero_mage_05'] },
    ],
  },
  33: {
    theme: 'Pháp trận diệt long',
    tip: 'Mage ngang Rồng/Hydra — Silence / áp sát ngay.',
    waves: [
      { delay: 0.5, ids: ['hero_mage_06', 'hero_mage_07', 'hero_healer_04'] },
      { delay: 13, ids: ['hero_warrior_10', 'hero_mage_06', 'hero_rogue_06', 'hero_healer_02'] },
      { delay: 25, ids: ['hero_mage_07', 'hero_warrior_09', 'hero_healer_05'] },
    ],
  },
  34: {
    theme: 'Đêm sát thủ',
    tip: 'Rogue Boss-tier dày đặc — Mắt thần bắt buộc.',
    waves: [
      { delay: 0.4, ids: ['hero_rogue_06', 'hero_rogue_07', 'hero_rogue_04', 'hero_rogue_05'] },
      { delay: 12, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_rogue_06'] },
      { delay: 24, ids: ['hero_rogue_07', 'hero_warrior_09', 'hero_healer_05', 'hero_mage_06'] },
    ],
  },
  35: {
    theme: 'Thánh chiến titan',
    tip: 'Healer 7 cost-tier giữ wall — hạ healer trước.',
    waves: [
      { delay: 0.5, ids: ['hero_healer_05', 'hero_warrior_11', 'hero_warrior_09'] },
      { delay: 11, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_mage_06', 'hero_rogue_06'] },
      { delay: 22, ids: ['hero_healer_05', 'hero_warrior_11', 'hero_warrior_10', 'hero_mage_07'] },
    ],
  },
  36: {
    theme: 'Bão hủy diệt',
    tip: 'Ba wave Boss-tier dồn dập — giữ spell đợt cuối.',
    waves: [
      { delay: 0.4, ids: ['hero_warrior_10', 'hero_mage_06', 'hero_rogue_06', 'hero_healer_04'] },
      { delay: 10, ids: ['hero_warrior_09', 'hero_warrior_11', 'hero_mage_07', 'hero_healer_04'] },
      { delay: 21, ids: ['hero_warrior_10', 'hero_rogue_07', 'hero_healer_05', 'hero_mage_07', 'hero_warrior_08'] },
    ],
  },
  37: {
    theme: 'Vách sắt bất diệt',
    tip: 'Tank + healer ngang 7–8 cost — cần Boss / DoT.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_11', 'hero_healer_05', 'hero_warrior_09'] },
      { delay: 12, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_warrior_11', 'hero_mage_06'] },
      { delay: 24, ids: ['hero_warrior_11', 'hero_healer_05', 'hero_warrior_10', 'hero_rogue_07', 'hero_mage_07'] },
    ],
  },
  38: {
    theme: 'Song diệt thần',
    tip: 'Mage + rogue Boss-tier — đội hình 7–8 cost hoặc thua.',
    waves: [
      { delay: 0.4, ids: ['hero_mage_07', 'hero_rogue_07', 'hero_warrior_10'] },
      { delay: 11, ids: ['hero_healer_05', 'hero_mage_06', 'hero_rogue_06', 'hero_warrior_09'] },
      { delay: 22, ids: ['hero_mage_07', 'hero_rogue_07', 'hero_warrior_11', 'hero_healer_05', 'hero_mage_06'] },
    ],
  },
  39: {
    theme: 'Đêm trước tận thế II',
    tip: 'Bốn wave Boss-tier — giữ spell cho đợt cuối.',
    waves: [
      { delay: 0.35, ids: ['hero_rogue_06', 'hero_mage_06', 'hero_warrior_09'] },
      { delay: 9, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_rogue_07', 'hero_mage_07'] },
      { delay: 18, ids: ['hero_warrior_11', 'hero_healer_05', 'hero_warrior_10', 'hero_mage_06'] },
      { delay: 28, ids: ['hero_warrior_11', 'hero_mage_07', 'hero_healer_05', 'hero_rogue_07', 'hero_warrior_10'] },
    ],
  },
  40: {
    theme: 'Phá đảo tối thượng',
    tip: 'Full elite ngang 7–8 cost — Boss + spell timing.',
    waves: [
      { delay: 0.4, ids: ['hero_warrior_09', 'hero_healer_04', 'hero_mage_06', 'hero_rogue_06'] },
      { delay: 11, ids: ['hero_warrior_10', 'hero_warrior_11', 'hero_healer_05', 'hero_mage_07', 'hero_rogue_07'] },
      { delay: 22, ids: ['hero_healer_05', 'hero_warrior_11', 'hero_mage_07', 'hero_rogue_07', 'hero_warrior_10', 'hero_mage_06'] },
      { delay: 34, ids: ['hero_warrior_11', 'hero_healer_05', 'hero_mage_07', 'hero_warrior_10', 'hero_rogue_07'] },
    ],
  },
};

/**
 * @param {number} level 1–40
 */
export function getWavePlan(level = 1) {
  const lv = Math.max(1, Math.min(40, level | 0));
  return WAVE_PLANS[lv] || WAVE_PLANS[1];
}

function heroScaleForLevel(level) {
  if (level <= 20) return 0.9 + (level - 1) * 0.095;
  if (level <= 30) return 0.9 + 19 * 0.095 + (level - 20) * 0.16;
  return 0.9 + 19 * 0.095 + 10 * 0.16 + (level - 30) * 0.2;
}

/** Flatten plan.ids hoặc plan.waves → danh sách { id, spawnDelay, waveIndex } */
function expandPlanSpawns(plan) {
  if (Array.isArray(plan.waves) && plan.waves.length) {
    const out = [];
    plan.waves.forEach((w, wi) => {
      const base = Number(w.delay) || 0;
      (w.ids || []).forEach((id, i) => {
        out.push({
          id,
          spawnDelay: base + i * Math.min(COMBAT.HERO_SPAWN_INTERVAL, 2.4),
          waveIndex: wi + 1,
        });
      });
    });
    return out;
  }
  return (plan.ids || []).map((id, i) => ({
    id,
    spawnDelay: 0.85 + i * COMBAT.HERO_SPAWN_INTERVAL,
    waveIndex: 1,
  }));
}

/** Build a wave list for dungeon level (1-based). */
export function buildWave(level = 1) {
  const plan = getWavePlan(level);
  const scale = heroScaleForLevel(level);
  const spawns = expandPlanSpawns(plan);
  const waves = [];

  spawns.forEach((slot, i) => {
    const template = HERO_BY_ID[slot.id] || HEROES[0];
    const roleLine =
      template.class === 'WARRIOR'
        ? 'Tuyến trước'
        : template.class === 'HEALER'
          ? 'Hỗ trợ / hồi máu'
          : template.class === 'MAGE'
            ? 'Tuyến sau / phép'
            : template.stealth
              ? 'Sườn / đột phá'
              : 'Áp sát';
    waves.push({
      ...template,
      instanceId: `${template.id}_L${level}_${i}`,
      templateId: template.id,
      hp: Math.round(template.hp * scale),
      maxHp: Math.round(template.hp * scale),
      atk: Math.round(template.atk * scale),
      spawnDelay: slot.spawnDelay,
      waveIndex: slot.waveIndex,
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
    else g = pickSpread(gates); // MAGE + HEALER backline/spread

    h.formation = {
      order: i + 1,
      roleLine:
        h.class === 'WARRIOR'
          ? 'Tuyến trước'
          : h.class === 'HEALER'
            ? 'Hỗ trợ / hồi máu'
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
