/** Hero AI catalog — mỗi ải 1–40 có tổ hợp hero riêng */

import { COMBAT } from './constants.js?v=129';

export const HEROES = [
  // ——— MAGE ———
  {
    id: 'hero_mage_01',
    name: 'Pháp Sư Lửa',
    class: 'MAGE',
    hp: 240, atk: 41, speed: 1.8, range: 3.2, atkSpeed: 0.47, aoeRadius: 1.8,
    target: 'TREASURE', color: '#ce93d8', skills: ['AOE_FIRE', 'BURN_ON_HIT'],
    description: 'Dame lan lửa — sợ Silence / áp sát.',
  },
  {
    id: 'hero_mage_02',
    name: 'Pháp Sư Băng',
    class: 'MAGE',
    hp: 200, atk: 43, speed: 1.7, range: 3.0, atkSpeed: 0.48, aoeRadius: 1.5,
    target: 'TREASURE', color: '#90caf9', skills: ['AOE_FROST', 'FREEZE'],
    description: 'AoE + đóng băng — vẫn yếu trước Silence.',
  },
  {
    id: 'hero_mage_03',
    name: 'Lôi Thuật Sư',
    class: 'MAGE',
    hp: 220, atk: 46, speed: 1.9, range: 3.4, atkSpeed: 0.51, aoeRadius: 1.2,
    target: 'TREASURE', color: '#fff59d', skills: ['AOE_FIRE'],
    description: 'Tick sét nhanh — máu mỏng, sợ silence.',
  },
  {
    id: 'hero_mage_04',
    name: 'Độc Cô Nữ',
    class: 'MAGE',
    hp: 250, atk: 33, speed: 1.5, range: 2.8, atkSpeed: 0.46, aoeRadius: 2.2,
    target: 'TREASURE', color: '#aed581', skills: ['AOE_FROST', 'POISON_ON_HIT'],
    description: 'AoE độc rộng — chậm, dễ bị áp sát.',
  },
  {
    id: 'hero_mage_05',
    name: 'Huyền Không Sư',
    class: 'MAGE',
    hp: 185, atk: 53, speed: 2.0, range: 3.6, atkSpeed: 0.45, aoeRadius: 2.0,
    target: 'TREASURE', color: '#b39ddb', skills: ['AOE_FIRE', 'FREEZE'],
    description: 'Burst phép cực mạnh — cực sợ Silence.',
  },
  {
    id: 'hero_mage_06',
    name: 'Diệt Long Sư',
    class: 'MAGE',
    hp: 480, atk: 129, speed: 1.85, range: 3.8, atkSpeed: 0.5, aoeRadius: 2.5,
    target: 'TREASURE', color: '#ea80fc', skills: ['AOE_FIRE', 'FREEZE'],
    description: 'AoE ngang Rồng 7 cost — cần Silence / burst ngay.',
  },
  {
    id: 'hero_mage_07',
    name: 'Hắc Tinh Quân',
    class: 'MAGE',
    hp: 560, atk: 156, speed: 1.7, range: 4.0, atkSpeed: 0.49, aoeRadius: 2.8,
    target: 'TREASURE', color: '#7e57c2', skills: ['AOE_FROST', 'FREEZE', 'AOE_FIRE'],
    description: 'Pháp sư ngang Hydra/Leviathan — free cast là xóa tuyến.',
  },

  // ——— WARRIOR ———
  {
    id: 'hero_warrior_01',
    name: 'Chiến Sĩ Thép',
    class: 'WARRIOR',
    hp: 650, atk: 42, speed: 1.4, range: 1.2, atkSpeed: 0.33, aoeRadius: 0,
    target: 'TREASURE', color: '#ef9a9a', skills: ['SHIELD'],
    description: 'Trâu ổn — sợ Boss 5★ burst.',
  },
  {
    id: 'hero_warrior_02',
    name: 'Hiệp Sĩ Lá Chắn',
    class: 'WARRIOR',
    hp: 800, atk: 35, speed: 1.2, range: 1.3, atkSpeed: 0.32, aoeRadius: 0,
    target: 'TREASURE', color: '#ffcc80', skills: ['TAUNT_SELF'],
    description: 'Tank cực khỏe, chậm.',
  },
  {
    id: 'hero_warrior_03',
    name: 'Cuồng Chiến',
    class: 'WARRIOR',
    hp: 520, atk: 68, speed: 1.8, range: 1.4, atkSpeed: 0.36, aoeRadius: 0,
    target: 'TREASURE', color: '#e57373', skills: ['SHIELD'],
    description: 'Dame cao, máu vừa — sợ bẫy + kite.',
  },
  {
    id: 'hero_warrior_04',
    name: 'Thập Tự Quân',
    class: 'WARRIOR',
    hp: 720, atk: 48, speed: 1.35, range: 1.5, atkSpeed: 0.33, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tank kiêm DPS — cần burst mạnh.',
  },
  {
    id: 'hero_warrior_05',
    name: 'Cự Binh Thành',
    class: 'WARRIOR',
    hp: 980, atk: 30, speed: 0.95, range: 1.2, atkSpeed: 0.32, aoeRadius: 0,
    target: 'TREASURE', color: '#b0bec5', skills: ['TAUNT_SELF'],
    description: 'Siêu tank bò — chỉ Boss / DoT mới cắn nổi.',
  },
  {
    id: 'hero_warrior_06',
    name: 'Phá Thành Thương',
    class: 'WARRIOR',
    hp: 780, atk: 72, speed: 1.55, range: 1.4, atkSpeed: 0.34, aoeRadius: 0,
    target: 'TREASURE', color: '#ff7043', skills: ['SHIELD'],
    description: 'Chiến binh xung kích — máu dày + dame nặng.',
  },
  {
    id: 'hero_warrior_07',
    name: 'Hộ Vệ Hoàng Kim',
    class: 'WARRIOR',
    hp: 1100, atk: 40, speed: 1.05, range: 1.3, atkSpeed: 0.33, aoeRadius: 0,
    target: 'TREASURE', color: '#ffd54f', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tank hậu kỳ — khiên + taunt, cực khó hạ.',
  },
  {
    id: 'hero_warrior_08',
    name: 'Bạo Chúa Sắt',
    class: 'WARRIOR',
    hp: 900, atk: 88, speed: 1.65, range: 1.5, atkSpeed: 0.35, aoeRadius: 0,
    target: 'TREASURE', color: '#c62828', skills: ['SHIELD', 'TAUNT_SELF'],
    description: 'Elite chiến binh — vừa tank vừa cày kho.',
  },
  {
    id: 'hero_warrior_09',
    name: 'Thiết Giáp Titan',
    class: 'WARRIOR',
    hp: 2200, atk: 145, speed: 1.15, range: 1.45, atkSpeed: 0.34, aoeRadius: 0,
    target: 'TREASURE', color: '#ff8a65', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tank ngang Behemoth 7 cost — cần DoT / Boss burst.',
  },
  {
    id: 'hero_warrior_10',
    name: 'Đại Tướng Huyết',
    class: 'WARRIOR',
    hp: 1850, atk: 190, speed: 1.5, range: 1.6, atkSpeed: 0.36, aoeRadius: 0,
    target: 'TREASURE', color: '#e53935', skills: ['SHIELD', 'TAUNT_SELF'],
    description: 'DPS ngang Rồng 7 cost — đe dọa cả hàng Boss.',
  },
  {
    id: 'hero_warrior_11',
    name: 'Hoàng Đế Phá Thành',
    class: 'WARRIOR',
    hp: 2800, atk: 170, speed: 1.2, range: 1.65, atkSpeed: 0.35, aoeRadius: 0,
    target: 'TREASURE', color: '#b71c1c', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Siêu tank ngang Hydra/Behemoth 8 cost — bỏ sót mất kho.',
  },

  // ——— HEALER ———
  {
    id: 'hero_healer_01',
    name: 'Tu Sĩ Hồi Sinh',
    class: 'HEALER',
    hp: 260, atk: 27, speed: 1.6, range: 2.8, atkSpeed: 0.38, aoeRadius: 0,
    target: 'TREASURE', color: '#fff9c4', skills: ['HEAL_ALLY'],
    description: 'Hồi máu đồng đội — ưu tiên hạ healer trước.',
  },
  {
    id: 'hero_healer_02',
    name: 'Nữ Tư Tế Ánh',
    class: 'HEALER',
    hp: 300, atk: 30, speed: 1.5, range: 3.0, atkSpeed: 0.38, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Heal mạnh + khiên — giữ cả wave sống lâu.',
  },
  {
    id: 'hero_healer_03',
    name: 'Thánh Giả Tận Thế',
    class: 'HEALER',
    hp: 340, atk: 34, speed: 1.45, range: 3.2, atkSpeed: 0.4, aoeRadius: 0,
    target: 'TREASURE', color: '#ffecb3', skills: ['HEAL_ALLY'],
    description: 'Heal elite hậu kỳ — bỏ sót là thua kéo dài.',
  },
  {
    id: 'hero_healer_04',
    name: 'Đại Tư Tế Ánh',
    class: 'HEALER',
    hp: 480, atk: 46, speed: 1.55, range: 3.5, atkSpeed: 0.4, aoeRadius: 0,
    target: 'TREASURE', color: '#fff59d', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Heal mạnh — ưu tiên hạ trước, ATK hỗ trợ thấp.',
  },
  {
    id: 'hero_healer_05',
    name: 'Thiên Sứ Hồi Sinh',
    class: 'HEALER',
    hp: 560, atk: 52, speed: 1.4, range: 3.8, atkSpeed: 0.42, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe57f', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Healer hậu kỳ — hồi mạnh nhưng sát thương cá nhân yếu.',
  },

  // ——— ROGUE ———
  {
    id: 'hero_rogue_01',
    name: 'Đạo Tặc Bóng',
    class: 'ROGUE',
    hp: 190, atk: 65, speed: 2.8, range: 1.1, atkSpeed: 0.69, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#a5d6a7', skills: ['STEALTH'],
    description: 'Tàng hình — sợ Mắt thần & Bẫy.',
  },
  {
    id: 'hero_rogue_02',
    name: 'Sát Thủ Lụa',
    class: 'ROGUE',
    hp: 170, atk: 76, speed: 3.0, range: 1.0, atkSpeed: 0.72, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#80cbc4', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Cực nhanh, máu mỏng.',
  },
  {
    id: 'hero_rogue_03',
    name: 'Song Đao Khách',
    class: 'ROGUE',
    hp: 220, atk: 60, speed: 2.4, range: 1.3, atkSpeed: 0.73, aoeRadius: 0,
    stealth: false, target: 'TREASURE', color: '#ef9a9a', skills: ['BACKSTAB'],
    description: 'DPS gần nhanh — không tàng hình, dễ focus.',
  },
  {
    id: 'hero_rogue_04',
    name: 'Ảo Ảnh Tặc',
    class: 'ROGUE',
    hp: 155, atk: 64, speed: 3.2, range: 1.2, atkSpeed: 0.68, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#ce93d8', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Siêu nhanh + ẩn — bắt buộc anti-rogue.',
  },
  {
    id: 'hero_rogue_05',
    name: 'Cung Thủ Bóng',
    class: 'ROGUE',
    hp: 200, atk: 58, speed: 2.2, range: 2.8, atkSpeed: 0.66, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#81c784', skills: ['STEALTH'],
    description: 'Tàng hình bắn xa — Mắt thần + áp sát.',
  },
  {
    id: 'hero_rogue_06',
    name: 'Sát Thủ Huyết Ảnh',
    class: 'ROGUE',
    hp: 360, atk: 180, speed: 3.2, range: 1.3, atkSpeed: 0.74, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#26a69a', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Rogue ngang Wraith/Rồng — bắt buộc Mắt thần.',
  },
  {
    id: 'hero_rogue_07',
    name: 'Ma Ảnh Độc Vương',
    class: 'ROGUE',
    hp: 400, atk: 200, speed: 2.95, range: 2.8, atkSpeed: 0.7, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#00897b', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Rogue Boss-tier — lướt qua tuyến nếu thiếu anti-stealth.',
  },

  // ——— Cung thủ (ARCHER) ———
  {
    id: 'hero_archer_01',
    name: 'Cung Thủ Đồng',
    class: 'ARCHER',
    hp: 180, atk: 52, speed: 2.0, range: 3.6, atkSpeed: 0.82, aoeRadius: 0,
    target: 'TREASURE', color: '#a5d6a7', skills: [],
    description: 'Bắn xa, máu mỏng — áp sát / gap-close.',
  },
  {
    id: 'hero_archer_02',
    name: 'Xạ Thủ Rừng',
    class: 'ARCHER',
    hp: 200, atk: 64, speed: 2.15, range: 3.8, atkSpeed: 0.85, aoeRadius: 0,
    target: 'TREASURE', color: '#66bb6a', skills: [],
    description: 'Tầm rất xa + tốc độ bắn — đừng để kite tự do.',
  },
  {
    id: 'hero_archer_03',
    name: 'Cung Bạc Săn',
    class: 'ARCHER',
    hp: 260, atk: 86, speed: 2.2, range: 4.0, atkSpeed: 0.87, aoeRadius: 0,
    target: 'TREASURE', color: '#43a047', skills: [],
    description: 'Cung thủ trung cấp — ưu tiên chase / silence vùng.',
  },
  {
    id: 'hero_archer_04',
    name: 'Cung Long Tiễn',
    class: 'ARCHER',
    hp: 400, atk: 170, speed: 2.35, range: 4.2, atkSpeed: 0.89, aoeRadius: 0,
    target: 'TREASURE', color: '#2e7d32', skills: [],
    description: 'Elite tầm xa ngang 7 cost — cần gap-close mạnh.',
  },
  {
    id: 'hero_archer_05',
    name: 'Thiên Tiễn Vương',
    class: 'ARCHER',
    hp: 480, atk: 215, speed: 2.4, range: 4.5, atkSpeed: 0.9, aoeRadius: 0,
    target: 'TREASURE', color: '#1b5e20', skills: [],
    description: 'Boss-tier cung — kite toàn map nếu thiếu áp sát.',
  },

  // ——— Thuần tank (TANK) ———
  {
    id: 'hero_tank_01',
    name: 'Khiên Gỗ',
    class: 'TANK',
    hp: 520, atk: 20, speed: 1.35, range: 1.2, atkSpeed: 0.28, aoeRadius: 0,
    target: 'TREASURE', color: '#90a4ae', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'HP cao, dame thấp — khiêu khích + khiên.',
  },
  {
    id: 'hero_tank_02',
    name: 'Thành Đồng',
    class: 'TANK',
    hp: 680, atk: 26, speed: 1.25, range: 1.25, atkSpeed: 0.27, aoeRadius: 0,
    target: 'TREASURE', color: '#78909c', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tường sống — cần DoT / %HP / Boss.',
  },
  {
    id: 'hero_tank_03',
    name: 'Tháp Sắt',
    class: 'TANK',
    hp: 900, atk: 32, speed: 1.2, range: 1.3, atkSpeed: 0.25, aoeRadius: 0,
    target: 'TREASURE', color: '#607d8b', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Siêu trâu, chậm — đừng đánh tay không.',
  },
  {
    id: 'hero_tank_04',
    name: 'Thành Bastion',
    class: 'TANK',
    hp: 1400, atk: 51, speed: 1.15, range: 1.35, atkSpeed: 0.26, aoeRadius: 0,
    target: 'TREASURE', color: '#455a64', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Elite tank ngang Behemoth — DoT bắt buộc.',
  },
  {
    id: 'hero_tank_05',
    name: 'Pháo Đài Bất Diệt',
    class: 'TANK',
    hp: 1900, atk: 64, speed: 1.1, range: 1.4, atkSpeed: 0.25, aoeRadius: 0,
    target: 'TREASURE', color: '#37474f', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Boss-tier thuần tank — wall + healer là ác mộng.',
  },

  // ——— Berserker ———
  {
    id: 'hero_berserker_01',
    name: 'Cuồng Binh',
    class: 'BERSERKER',
    hp: 300, atk: 62, speed: 2.3, range: 1.25, atkSpeed: 0.58, aoeRadius: 0,
    target: 'TREASURE', color: '#ef5350', skills: ['BERSERK'],
    description: 'Máu càng thấp càng mạnh — burst sớm hoặc kite.',
  },
  {
    id: 'hero_berserker_02',
    name: 'Rìu Máu',
    class: 'BERSERKER',
    hp: 340, atk: 72, speed: 2.45, range: 1.3, atkSpeed: 0.59, aoeRadius: 0,
    target: 'TREASURE', color: '#e53935', skills: ['BERSERK'],
    description: 'Rush thẳng — đừng để vào vùng máu đỏ.',
  },
  {
    id: 'hero_berserker_03',
    name: 'Cuồng Chiến',
    class: 'BERSERKER',
    hp: 420, atk: 95, speed: 2.55, range: 1.35, atkSpeed: 0.61, aoeRadius: 0,
    target: 'TREASURE', color: '#c62828', skills: ['BERSERK'],
    description: 'Berserk mạnh khi <50% HP — CC / slow hữu ích.',
  },
  {
    id: 'hero_berserker_04',
    name: 'Huyết Cuồng',
    class: 'BERSERKER',
    hp: 720, atk: 175, speed: 2.7, range: 1.4, atkSpeed: 0.62, aoeRadius: 0,
    target: 'TREASURE', color: '#b71c1c', skills: ['BERSERK'],
    description: 'Elite berserk — càng đánh càng nguy hiểm nếu kéo dài.',
  },
  {
    id: 'hero_berserker_05',
    name: 'Thần Cuồng Hủy',
    class: 'BERSERKER',
    hp: 900, atk: 220, speed: 2.85, range: 1.45, atkSpeed: 0.63, aoeRadius: 0,
    target: 'TREASURE', color: '#880e4f', skills: ['BERSERK'],
    description: 'Boss-tier berserker — burst hoặc chết dưới rìu.',
  },

  // ——— Diệt hồi (HEXER) — giảm heal quái ———
  {
    id: 'hero_hex_01',
    name: 'Lang Y Ô Uế',
    class: 'HEXER',
    hp: 220, atk: 44, speed: 1.9, range: 2.4, atkSpeed: 0.5, aoeRadius: 0,
    target: 'TREASURE', color: '#7e57c2', skills: ['HEAL_CUT'],
    description: 'Aura giảm hồi máu quái — khắc chế heal support.',
  },
  {
    id: 'hero_hex_02',
    name: 'Phù Thủy Vết',
    class: 'HEXER',
    hp: 260, atk: 57, speed: 2.0, range: 2.6, atkSpeed: 0.51, aoeRadius: 0,
    target: 'TREASURE', color: '#5e35b1', skills: ['HEAL_CUT'],
    description: 'Cắt hồi mạnh hơn — ưu tiên đứng gần cụm heal quái.',
  },
  {
    id: 'hero_hex_03',
    name: 'Sứ Giả Chí Mạng',
    class: 'HEXER',
    hp: 360, atk: 81, speed: 2.1, range: 2.8, atkSpeed: 0.52, aoeRadius: 0,
    target: 'TREASURE', color: '#4527a0', skills: ['HEAL_CUT', 'HEAL_CUT_HIT'],
    description: 'Aura + đánh trúng chồng giảm hồi — diệt tuyến heal.',
  },
  {
    id: 'hero_hex_04',
    name: 'Đại Dịch Sứ',
    class: 'HEXER',
    hp: 480, atk: 143, speed: 2.15, range: 3.0, atkSpeed: 0.53, aoeRadius: 0,
    target: 'TREASURE', color: '#311b92', skills: ['HEAL_CUT', 'HEAL_CUT_HIT'],
    description: 'Elite anti-heal — aura rộng, đánh trúng kéo dài vết thương.',
  },
  {
    id: 'hero_hex_05',
    name: 'Chúa Tể Hư Hồi',
    class: 'HEXER',
    hp: 560, atk: 181, speed: 2.2, range: 3.2, atkSpeed: 0.55, aoeRadius: 0,
    target: 'TREASURE', color: '#1a237e', skills: ['HEAL_CUT', 'HEAL_CUT_HIT'],
    description: 'Boss-tier giảm hồi — heal quái gần như tắt trong vùng.',
  },
  {
    id: 'hero_archer_06',
    name: 'Băng Cung',
    class: 'ARCHER',
    hp: 220, atk: 72, speed: 2.1, range: 4.0, atkSpeed: 0.83, aoeRadius: 0,
    target: 'TREASURE', color: '#81d4fa', skills: ['FREEZE', 'FROST_BOLT'],
    description: 'Cung băng đóng mục tiêu — máu mỏng.',
  },
  {
    id: 'hero_mage_08',
    name: 'Hỏa Ấn Sư',
    class: 'MAGE',
    hp: 210, atk: 46, speed: 1.75, range: 3.3, atkSpeed: 0.48, aoeRadius: 1.6,
    target: 'TREASURE', color: '#ff7043', skills: ['AOE_FIRE', 'BURN_ON_HIT'],
    description: 'AoE + đốt DoT — glass cannon.',
  },
  {
    id: 'hero_rogue_08',
    name: 'Độc Ảnh',
    class: 'ROGUE',
    hp: 175, atk: 68, speed: 2.9, range: 1.15, atkSpeed: 0.71, aoeRadius: 0,
    target: 'TREASURE', color: '#9ccc65', stealth: true,
    skills: ['STEALTH', 'POISON_ON_HIT', 'BACKSTAB'],
    description: 'Stealth + độc — HP cực thấp.',
  },
  {
    id: 'hero_tank_06',
    name: 'Lôi Khiên',
    class: 'TANK',
    hp: 1100, atk: 39, speed: 1.15, range: 1.35, atkSpeed: 0.26, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['TAUNT_SELF', 'SHIELD', 'STUN_ON_HIT'],
    description: 'Tank khiêu khích + choáng ngắn khi đánh.',
  },
  {
    id: 'hero_healer_06',
    name: 'Sương Y',
    class: 'HEALER',
    hp: 300, atk: 29, speed: 1.55, range: 3.1, atkSpeed: 0.39, aoeRadius: 0,
    target: 'TREASURE', color: '#b3e5fc', skills: ['HEAL_ALLY', 'SLOW_AURA_ALLY'],
    description: 'Heal + làm chậm quái gần khi hồi — không tank.',
  },
  {
    id: 'hero_hex_06',
    name: 'Phá Giáp Hex',
    class: 'HEXER',
    hp: 280, atk: 55, speed: 2.0, range: 2.7, atkSpeed: 0.52, aoeRadius: 0,
    target: 'TREASURE', color: '#ff8a65', skills: ['HEAL_CUT', 'DEF_SHRED', 'HEAL_CUT_HIT'],
    description: 'Giảm hồi + phá giáp thay vì máu cao.',
  },
  {
    id: 'hero_archer_07',
    name: 'Cung Xuyên',
    class: 'ARCHER',
    hp: 240, atk: 80, speed: 2.2, range: 4.1, atkSpeed: 0.86, aoeRadius: 0,
    target: 'TREASURE', color: '#ffcc80', skills: ['PIERCE'],
    description: 'Mũi tên xuyên giáp — bỏ qua một phần DEF.',
  },
  {
    id: 'hero_berserker_06',
    name: 'Cuồng Huyết',
    class: 'BERSERKER',
    hp: 380, atk: 88, speed: 2.5, range: 1.3, atkSpeed: 0.6, aoeRadius: 0,
    target: 'TREASURE', color: '#e57373', skills: ['BERSERK', 'LIFESTEAL'],
    description: 'Berserk + hút máu nhẹ khi đánh.',
  },
  {
    id: 'hero_bomber_01',
    name: 'Cảm Tử',
    class: 'BERSERKER',
    hp: 220, atk: 55, speed: 2.4, range: 1.2, atkSpeed: 0.57, aoeRadius: 0,
    target: 'TREASURE', color: '#ff7043', skills: ['SELF_DESTRUCT', 'BERSERK'],
    description: 'Khi chết nổ gây sát thương quanh — cảm tử.',
  },
  {
    id: 'hero_phoenix_01',
    name: 'Phượng Y',
    class: 'HEALER',
    hp: 340, atk: 34, speed: 1.5, range: 3.0, atkSpeed: 0.41, aoeRadius: 0,
    target: 'TREASURE', color: '#ffcc80', skills: ['HEAL_ALLY', 'REVIVE', 'SHIELD'],
    description: 'Healer sống lại 1 lần — khó hạ hẳn trong một đợt.',
  },
  {
    id: 'hero_shatter_01',
    name: 'Phá Khiên Sĩ',
    class: 'WARRIOR',
    hp: 520, atk: 72, speed: 1.7, range: 1.4, atkSpeed: 0.35, aoeRadius: 0,
    target: 'TREASURE', color: '#4fc3f7', skills: ['SHIELD_BREAK', 'SHIELD'],
    description: 'Phá lớp khiên quái + tự có khiên phòng thân.',
  },
  {
    id: 'hero_hex_07',
    name: 'Phá Khiên Hex',
    class: 'HEXER',
    hp: 300, atk: 59, speed: 2.0, range: 2.8, atkSpeed: 0.54, aoeRadius: 0,
    target: 'TREASURE', color: '#81d4fa', skills: ['HEAL_CUT', 'SHIELD_BREAK', 'HEAL_CUT_HIT'],
    description: 'Cắt hồi + phá khiên — khắc tank có khiên và healer.',
  },
  {
    id: 'hero_rogue_09',
    name: 'Bóng Nổ',
    class: 'ROGUE',
    hp: 190, atk: 70, speed: 2.85, range: 1.2, atkSpeed: 0.7, aoeRadius: 0,
    target: 'TREASURE', color: '#ab47bc', stealth: true,
    skills: ['STEALTH', 'BACKSTAB', 'SELF_DESTRUCT'],
    description: 'Tàng hình áp sát — chết cũng nổ.',
  },
  {
    id: 'hero_scout_01',
    name: 'Mắt Thần',
    class: 'SCOUT',
    hp: 360, atk: 128, speed: 2.3, range: 4.4, atkSpeed: 0.72, aoeRadius: 0,
    target: 'MONSTER', color: '#ffb300',
    skills: ['REVEAL'],
    description: 'Soi quái tàng hình trong tầm — phe bạn nhắm và đánh bình thường.',
  },
  {
    id: 'hero_scout_02',
    name: 'Nhãn Quang',
    class: 'SCOUT',
    hp: 430, atk: 168, speed: 2.45, range: 4.8, atkSpeed: 0.75, aoeRadius: 0,
    target: 'MONSTER', color: '#ffca28',
    skills: ['REVEAL'],
    description: 'Trinh sát tầm xa — lộ mọi quái ẩn trong phạm vi đánh.',
  },
  {
    id: 'hero_boss_40',
    name: 'Vệ Vương Thép',
    class: 'BOSS',
    isBoss: true,
    hp: 7200, atk: 90, speed: 0.7, range: 1.6, atkSpeed: 0.34, aoeRadius: 1.4,
    target: 'MONSTER', color: '#c9a227',
    skills: ['SHIELD', 'TAUNT_SELF', 'STUN_ON_HIT', 'AOE_FIRE'],
    description: 'Hero Boss — đi chậm, khiên + khiêu khích + choáng + hỏa vực.',
  },
  {
    id: 'hero_boss_45',
    name: 'Chúa Bóng Đêm',
    class: 'BOSS',
    isBoss: true,
    hp: 5600, atk: 133, speed: 0.85, range: 1.5, atkSpeed: 0.37, aoeRadius: 0,
    target: 'TREASURE', color: '#6a1b9a',
    stealth: true,
    skills: ['STEALTH', 'REVEAL', 'BACKSTAB', 'HEAL_CUT'],
    description: 'Hero Boss — tàng hình + soi hình + lén đâm + cắt hồi.',
  },
  {
    id: 'hero_boss_50',
    name: 'Pháp Vương Hỗn Nguyên',
    class: 'BOSS',
    isBoss: true,
    hp: 6400, atk: 147, speed: 0.65, range: 4.2, atkSpeed: 0.35, aoeRadius: 2.2,
    target: 'MONSTER', color: '#5c6bc0',
    skills: ['AOE_FROST', 'FREEZE', 'AOE_FIRE', 'PIERCE'],
    description: 'Hero Boss — băng/hỏa vực + đóng băng + xuyên giáp, đi rất chậm.',
  },
  {
    id: 'hero_boss_55',
    name: 'Thiên Tiễn Hoàng',
    class: 'BOSS',
    isBoss: true,
    hp: 5200, atk: 166, speed: 0.75, range: 5.5, atkSpeed: 0.39, aoeRadius: 0,
    target: 'MONSTER', color: '#43a047',
    skills: ['PIERCE', 'POISON_ON_HIT', 'DEF_SHRED'],
    description: 'Hero Boss — tầm cực xa, xuyên giáp + độc + phá giáp.',
  },
  {
    id: 'hero_boss_60',
    name: 'Hoàng Đế Tàn Lửa',
    class: 'BOSS',
    isBoss: true,
    hp: 9600, atk: 157, speed: 0.55, range: 2.0, atkSpeed: 0.36, aoeRadius: 1.8,
    target: 'MONSTER', color: '#d84315',
    skills: ['SHIELD', 'AOE_FIRE', 'LIFESTEAL', 'BERSERK'],
    description: 'Hero Boss cuối — khiên + hỏa vực + hút máu + berserk, siêu chậm.',
  },
  {
    id: 'hero_boss_05',
    name: 'Kỵ Sĩ Cổng Sương',
    class: 'BOSS',
    isBoss: true,
    hp: 3600, atk: 72, speed: 0.95, range: 1.55, atkSpeed: 0.34, aoeRadius: 1.2,
    target: 'MONSTER', color: '#90caf9',
    skills: ['SHIELD', 'FREEZE', 'STUN_ON_HIT'],
    description: 'Hero Boss Hard 5 — tanker băng mở màn, ép choke bằng khiên và đòn đóng băng.',
  },
  {
    id: 'hero_boss_10',
    name: 'Nhãn Quỷ Săn Đêm',
    class: 'BOSS',
    isBoss: true,
    hp: 4200, atk: 88, speed: 1.1, range: 1.6, atkSpeed: 0.38, aoeRadius: 0,
    target: 'TREASURE', color: '#7e57c2',
    stealth: true,
    skills: ['STEALTH', 'REVEAL', 'BACKSTAB', 'HEAL_CUT'],
    description: 'Hero Boss Hard 10 — sát thủ tàng hình soi ngược và cắt hồi tuyến sau.',
  },
  {
    id: 'hero_boss_15',
    name: 'Phù Thủy Chuông Rỗng',
    class: 'BOSS',
    isBoss: true,
    hp: 5000, atk: 102, speed: 0.82, range: 4.0, atkSpeed: 0.36, aoeRadius: 1.8,
    target: 'MONSTER', color: '#ab47bc',
    skills: ['AOE_FROST', 'FREEZE', 'AOE_FIRE', 'PIERCE'],
    description: 'Hero Boss Hard 15 — pháp sư công thành, dựng nhịp đóng băng rồi đốt cụm quái.',
  },
  {
    id: 'hero_boss_20',
    name: 'Hầu Tước Dung Nham',
    class: 'BOSS',
    isBoss: true,
    hp: 5900, atk: 116, speed: 0.88, range: 1.8, atkSpeed: 0.37, aoeRadius: 1.4,
    target: 'TREASURE', color: '#ff7043',
    skills: ['AOE_FIRE', 'LIFESTEAL', 'BERSERK', 'SHIELD'],
    description: 'Hero Boss Hard 20 — bruiser lửa đốt tuyến đầu rồi hút máu kéo giao tranh.',
  },
  {
    id: 'hero_boss_25',
    name: 'Thiên Tiễn Độc Hậu',
    class: 'BOSS',
    isBoss: true,
    hp: 5400, atk: 132, speed: 0.92, range: 5.2, atkSpeed: 0.39, aoeRadius: 0,
    target: 'MONSTER', color: '#66bb6a',
    skills: ['PIERCE', 'POISON_ON_HIT', 'DEF_SHRED', 'REVEAL'],
    description: 'Hero Boss Hard 25 — xạ thủ độc xuyên giáp, soi tàng hình và bóc tank/carry từ xa.',
  },
  {
    id: 'hero_boss_30',
    name: 'Giáo Chủ Huyết Khế',
    class: 'BOSS',
    isBoss: true,
    hp: 7000, atk: 118, speed: 0.72, range: 2.1, atkSpeed: 0.34, aoeRadius: 1.5,
    target: 'MONSTER', color: '#c62828',
    skills: ['SHIELD', 'TAUNT_SELF', 'HEAL_ALLY', 'STUN_ON_HIT'],
    description: 'Hero Boss Hard 30 — thủ lĩnh nghi lễ, tự che chắn và câu kéo cho cả đoàn support.',
  },
  {
    id: 'hero_boss_35',
    name: 'Vương Không Ảnh',
    class: 'BOSS',
    isBoss: true,
    hp: 7600, atk: 136, speed: 0.84, range: 4.4, atkSpeed: 0.37, aoeRadius: 2.0,
    target: 'MONSTER', color: '#5c6bc0',
    stealth: true,
    skills: ['STEALTH', 'REVEAL', 'AOE_FIRE', 'FREEZE'],
    description: 'Hero Boss Hard 35 — pháp vương bóng tối vừa ẩn vừa ném AoE, buộc bạn chia cụm và soi hình.',
  },
  {
    id: 'hero_support_01',
    name: 'Chiến Kỳ Sư',
    class: 'HEALER',
    hp: 420, atk: 40, speed: 1.75, range: 3.2, atkSpeed: 0.42, aoeRadius: 0,
    target: 'MONSTER', color: '#ffb74d',
    skills: ['HERO_AURA_ATK', 'HEAL_ALLY'],
    description: 'Hỗ trợ hậu tuyến: buff công cho Hero gần và vá máu nhẹ.',
  },
  {
    id: 'hero_support_02',
    name: 'Hộ Ấn Sư',
    class: 'HEALER',
    hp: 460, atk: 34, speed: 1.6, range: 3.0, atkSpeed: 0.39, aoeRadius: 0,
    target: 'MONSTER', color: '#90caf9',
    skills: ['HERO_AURA_SHIELD', 'HEAL_ALLY', 'SHIELD'],
    description: 'Hỗ trợ tạo khiên theo nhịp cho đồng minh đứng gần.',
  },
  {
    id: 'hero_support_03',
    name: 'Phong Hành Sư',
    class: 'SCOUT',
    hp: 360, atk: 72, speed: 2.1, range: 3.8, atkSpeed: 0.69, aoeRadius: 0,
    target: 'MONSTER', color: '#80cbc4',
    skills: ['HERO_AURA_SPEED', 'REVEAL'],
    description: 'Buff tốc chạy cho Hero gần, đồng thời soi quái tàng hình.',
  },
  {
    id: 'hero_hex_charm',
    name: 'Mê Vu Sư',
    class: 'HEXER',
    hp: 380, atk: 52, speed: 1.7, range: 3.0, atkSpeed: 0.5, aoeRadius: 0,
    target: 'MONSTER', color: '#f48fb1',
    skills: ['HEAL_CUT', 'ROOT_ON_HIT', 'FRAIL_ON_HIT'],
    description: 'Hexer — cắt hồi + kẹp chân + Frail lên quái.',
  },
  {
    id: 'hero_frail_blade',
    name: 'Đao Dễ Vỡ',
    class: 'ROGUE',
    stealth: true,
    hp: 340, atk: 95, speed: 2.2, range: 1.6, atkSpeed: 0.67, aoeRadius: 0,
    target: 'MONSTER', color: '#ce93d8',
    skills: ['STEALTH', 'BACKSTAB', 'FRAIL_ON_HIT'],
    description: 'Sát thủ — lén đâm + gắn Frail khiến quái nhận thêm dame.',
  },
  {
    id: 'hero_cleanse_monk',
    name: 'Tăng Thanh Tẩy',
    class: 'HEALER',
    hp: 480, atk: 38, speed: 1.55, range: 3.2, atkSpeed: 0.41, aoeRadius: 0,
    target: 'MONSTER', color: '#a5d6a7',
    skills: ['HEAL_ALLY', 'CLEANSE_ALLY', 'SHIELD'],
    description: 'Healer — hồi + tẩy debuff đồng minh định kỳ.',
  },
  {
    id: 'hero_stasis_01',
    name: 'Băng Giáp',
    class: 'TANK',
    hp: 680, atk: 42, speed: 1.1, range: 1.3, atkSpeed: 0.28, aoeRadius: 0,
    target: 'TREASURE', color: '#81d4fa',
    skills: ['STASIS_REVIVE', 'SHIELD', 'TAUNT_SELF'],
    description: 'Tank ngủ đông — lần đầu hết máu vào trạng thái bất tử 5 giây rồi hồi full máu.',
  },
  {
    id: 'hero_stasis_02',
    name: 'Tuyết Kiếm',
    class: 'WARRIOR',
    hp: 480, atk: 68, speed: 1.65, range: 1.4, atkSpeed: 0.38, aoeRadius: 0,
    target: 'TREASURE', color: '#b3e5fc',
    skills: ['STASIS_REVIVE', 'STUN_ON_HIT'],
    description: 'Chiến binh băng — ngủ đông 1 lần khi hết máu, tỉnh lại full HP.',
  },
  {
    id: 'hero_stasis_03',
    name: 'Hàn Tinh',
    class: 'MAGE',
    hp: 260, atk: 52, speed: 1.7, range: 3.4, atkSpeed: 0.48, aoeRadius: 1.6,
    target: 'TREASURE', color: '#4fc3f7',
    skills: ['STASIS_REVIVE', 'AOE_FROST', 'FREEZE'],
    description: 'Pháp sư băng — ngủ đông hồi sinh + băng vực, khó hạ trong một combo.',
  },
  {
    id: 'hero_support_04',
    name: 'Khiên Sư',
    class: 'HEALER',
    hp: 440, atk: 32, speed: 1.65, range: 3.4, atkSpeed: 0.4, aoeRadius: 0,
    target: 'MONSTER', color: '#64b5f6',
    skills: ['SHIELD_ALLY', 'HEAL_ALLY'],
    description: 'Support — trao khiên chủ động cho đồng minh thiếu máu trong tầm.',
  },
];

function AB(targetPriority, movementStyle, skillTrigger, environmentalReaction, brainLogic, extra = {}) {
  return {
    targetPriority,
    movementStyle,
    skillTrigger: Array.isArray(skillTrigger) ? skillTrigger : [skillTrigger],
    environmentalReaction: Array.isArray(environmentalReaction)
      ? environmentalReaction
      : [environmentalReaction],
    brain_logic: brainLogic,
    ...extra,
  };
}

const HERO_AI_BEHAVIORS = {
  hero_mage_01: AB('CROWD_DENSEST', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'ON_TRAP_TRIGGER'], ['HERO_BUFF_SEEKER', 'HAZARD_EXPLOITER'], 'Canh choke có dầu/lửa rồi dồn cầu lửa vào cụm quái đông nhất; ưu tiên đốt lane đang giữ buff Hero.', { preferredTiles: ['FIRE', 'OIL'], secondaryTarget: 'BUFF_GUARD' }),
  hero_mage_02: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Giữ tầm bắn tối đa, ưu tiên đóng băng quái lao vào tuyến sau hoặc quái chuẩn bị dẫm ô buff.', { preferredTiles: ['ICE'], secondaryTarget: 'DIVER_STOP' }),
  hero_mage_03: AB('CROWD_DENSEST', 'ZONING_ORBIT', ['ON_TRAP_TRIGGER', 'ON_CROWD_ENTER'], ['HAZARD_EXPLOITER', 'HERO_BUFF_SEEKER'], 'Lượn quanh các ô nước/buff để tạo tia lan, nã vào nơi quái đứng dày nhất thay vì bắn mục tiêu đơn.', { preferredTiles: ['WATER', 'HERO_BUFF_ZONE'], secondaryTarget: 'CHAIN_CLUSTER' }),
  hero_mage_04: AB('LOWEST_HP_ALLOY', 'KEEP_DISTANCE', ['ON_CROWD_ENTER'], ['HAZARD_EXPLOITER', 'HAZARD_AVOIDER'], 'Rải độc vào tuyến quái đã trầy máu, thích quét lại lane có bẫy độc để kết liễu hàng loạt.', { preferredTiles: ['POISON'], secondaryTarget: 'WOUNDED_CLUSTER' }),
  hero_mage_05: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Săn boss/support tuyến sau bằng burst phép, sẽ bẻ hướng để chiếm ô buff tăng tầm trước khi xả chiêu.', { preferredTiles: ['HERO_BUFF_ZONE'], secondaryTarget: 'BACKLINE_SUPPORT' }),
  hero_mage_06: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Nhìn thấy quái trâu hoặc boss là giữ khoảng cách rồi nuke trước, bỏ qua quái mồi nhỏ ở mép.', { preferredTiles: ['HIGH', 'HERO_BUFF_ZONE'], secondaryTarget: 'BOSS_BREAK' }),
  hero_mage_07: AB('CROWD_DENSEST', 'ZONING_ORBIT', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_EXPLOITER'], 'Di chuyển như chỉ huy pháo đài, xoay quanh ô buff lớn và quét AoE vào điểm giao tranh đông nhất.', { preferredTiles: ['HERO_BUFF_ZONE', 'FIRE', 'ICE'], secondaryTarget: 'SIEGE_CENTER' }),
  hero_warrior_01: AB('NEAREST', 'TANK_WALL', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Đè tuyến trước, nhận đòn cho tuyến sau rồi mới bật khiên khi máu xuống thấp.', { guardRole: 'FRONT_HOLD', secondaryTarget: 'LANE_BLOCKER' }),
  hero_warrior_02: AB('NEAREST', 'TANK_WALL', ['ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Luôn chen vào giữa đội hình quái và pháp sư đồng minh để khiêu khích cụm quái đang tràn qua choke.', { guardRole: 'BODYGUARD', secondaryTarget: 'TAUNT_CLUSTER' }),
  hero_warrior_03: AB('HIGH_THREAT', 'CHARGER', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Là đấu sĩ chủ động lao vào DPS hoặc quái gây hiệu ứng mạnh, càng thấp máu càng đẩy nhịp tấn công.', { finisherBias: 'BACKLINE_DPS', secondaryTarget: 'LOW_ARMOR_DPS' }),
  hero_warrior_04: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Bám theo healer/support quan trọng, chặn ngay trước người đang mang aura hoặc cờ buff.', { guardRole: 'AURA_ESCORT', secondaryTarget: 'ALLY_PROTECT' }),
  hero_warrior_05: AB('TREASURE_RUSH', 'BULL_RUSH', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Chậm nhưng lì, nếu tuyến quái hở là bỏ giao tranh nhỏ để bò thẳng vào Kho.', { guardRole: 'SIEGE_RAM', secondaryTarget: 'TREASURE_PATH' }),
  hero_warrior_06: AB('HIGH_THREAT', 'CHARGER', ['ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Phá thành thương luôn chọn lane có nhiều quái cản đường buff Hero rồi xuyên thẳng vào đó.', { finisherBias: 'CHOKE_BREAK', secondaryTarget: 'BUFF_BLOCKER' }),
  hero_warrior_07: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Giữ vị trí trước đồng minh quý giá; nếu đồng minh chết gần đó sẽ ép mình lên cao hơn để vá lỗ hổng.', { guardRole: 'ROYAL_GUARD', secondaryTarget: 'ALLY_REVENGE' }),
  hero_warrior_08: AB('HIGH_THREAT', 'BULL_RUSH', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Tìm mục tiêu xứng đáng nhất ở tuyến giữa rồi ép giao tranh liên tục, không thích bị câu kéo ở mép map.', { finisherBias: 'MIDLINE_BREAK', secondaryTarget: 'HEAVY_BRUISER' }),
  hero_warrior_09: AB('TREASURE_RUSH', 'TANK_WALL', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Titan giáp nặng ưu tiên giữ trục giữa và nghiền những gì đứng giữa hắn với Kho.', { guardRole: 'SLOW_SIEGE', secondaryTarget: 'TREASURE_GATE' }),
  hero_warrior_10: AB('HIGH_THREAT', 'CHARGER', ['ON_ALLY_DEATH', 'ON_LOW_HP'], ['HAZARD_AVOIDER', 'HAZARD_EXPLOITER'], 'Khi tuyến trước ngã xuống, hắn chuyển ngay sang săn DPS/boss để trả đũa và phá nhịp quái.', { finisherBias: 'REVENGE_DIVE', secondaryTarget: 'BOSS_OR_CARRY' }),
  hero_warrior_11: AB('TREASURE_RUSH', 'TANK_WALL', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Hoàng đế phá thành giữ lộ trình ngắn nhất vào Kho, nhưng nếu có buff quan trọng gần đó sẽ chiếm rồi trụ luôn.', { guardRole: 'IMPERIAL_PUSH', secondaryTarget: 'TREASURE_CORE' }),
  hero_healer_01: AB('LOWEST_HP_ALLOY', 'KEEP_DISTANCE', ['ON_LOW_HP'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Đi sau đội hình, tìm đồng minh tụt máu đầu tiên rồi trôi nhẹ sang ô hồi/ô buff để duy trì tuyến.', { supportFocus: 'EMERGENCY_HEAL', secondaryTarget: 'ALLY_CRITICAL' }),
  hero_healer_02: AB('AOE_BUFF_CARRIER', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Ưu tiên bọc cho tank đang đứng giữ choke hoặc đồng minh cầm buff quan trọng.', { supportFocus: 'SHIELD_HEAL_PAIR', secondaryTarget: 'TANK_ANCHOR' }),
  hero_healer_03: AB('LOWEST_HP_ALLOY', 'ZONING_ORBIT', ['ON_ALLY_DEATH', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Đi vòng quanh vùng an toàn gần buff để cứu lane vừa sập, hồi mục tiêu đang hấp hối trước.', { supportFocus: 'LATE_SAVE', secondaryTarget: 'BROKEN_LANE' }),
  hero_healer_04: AB('AOE_BUFF_CARRIER', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Bám sát mũi tấn công mạnh nhất và dồn hồi/giáp cho người đang mở đường ăn buff.', { supportFocus: 'PUSH_SUPPORT', secondaryTarget: 'LEAD_DIVER' }),
  hero_healer_05: AB('AOE_BUFF_CARRIER', 'ZONING_ORBIT', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Thiên sứ chủ động giữ đội hình sống đủ lâu để lật giao tranh kéo dài, nhất là quanh ô buff trung tâm.', { supportFocus: 'ENDGAME_SUSTAIN', secondaryTarget: 'ALLY_WITH_AURA' }),
  hero_rogue_01: AB('TREASURE_RUSH', 'STEALTH_AMBUSH', ['ON_TRAP_TRIGGER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Men theo rìa map, chỉ dừng đánh nếu quái cản ngay trước mặt hoặc có buff Hero lộ ra bên sườn.', { flankLane: 'EDGE', secondaryTarget: 'OPEN_TREASURE_PATH' }),
  hero_rogue_02: AB('BACKLINE_DIVE', 'STEALTH_AMBUSH', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Tàng hình sâu rồi nhảy vào mục tiêu máu giấy ở tuyến sau; nếu bị lộ sẽ cố kết liễu thật nhanh.', { flankLane: 'BACK_DOOR', secondaryTarget: 'RANGED_SUPPORT' }),
  hero_rogue_03: AB('LOWEST_HP_ALLOY', 'FLANKING', ['ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HAZARD_EXPLOITER'], 'Đánh vòng để ăn những quái đã mất máu, tận dụng bẫy hoặc lane hẹp để chém dứt điểm liên tục.', { flankLane: 'MID_FLANK', secondaryTarget: 'EXECUTE_CHAIN' }),
  hero_rogue_04: AB('BACKLINE_DIVE', 'STEALTH_AMBUSH', ['ON_TRAP_TRIGGER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Ảo ảnh tặc thích lao qua lane ít quân, móc vào pháp sư/healer đang đứng canh ô buff.', { flankLane: 'SOFT_SIDE', secondaryTarget: 'BUFFED_BACKLINE' }),
  hero_rogue_05: AB('HIGH_THREAT', 'KITING', ['ON_TRAP_TRIGGER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Vừa là rogue vừa là cung thủ: tìm góc bắn an toàn, tự soi đường và quấy rối mục tiêu quan trọng từ mép map.', { flankLane: 'WIDE_ANGLE', secondaryTarget: 'STEALTH_SAFE_POKE' }),
  hero_rogue_06: AB('BACKLINE_DIVE', 'STEALTH_AMBUSH', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER'], 'Huyết Ảnh đợi mở giao tranh rồi xộc vào giết carry trước khi quái kịp xoay đầu.', { flankLane: 'DEEP_DIVE', secondaryTarget: 'CARRY_EXECUTE' }),
  hero_rogue_07: AB('HIGH_THREAT', 'STEALTH_AMBUSH', ['ON_TRAP_TRIGGER', 'ON_CROWD_ENTER'], ['HAZARD_EXPLOITER', 'HERO_BUFF_SEEKER'], 'Độc vương sẽ chọn lane có ô độc/hazard để vừa bắn vừa lùa quái đứng sai vị trí.', { flankLane: 'POISON_EDGE', secondaryTarget: 'HAZARD_FINISH' }),
  hero_archer_01: AB('NEAREST', 'KEEP_DISTANCE', ['ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Giữ góc bắn cơ bản, ưu tiên quái gần nhất để giữ nhịp phòng thủ cho bản thân và tuyến sau.', { firingDiscipline: 'SAFE_LANE', secondaryTarget: 'LANE_STABILIZE' }),
  hero_archer_02: AB('HIGH_THREAT', 'KITING', ['ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Rừng thủ bẻ góc lấy tầm bắn đẹp rồi rút lại mỗi khi quái áp sát, chuyên rỉa support/ranged quái.', { firingDiscipline: 'KITE_SNIPER', secondaryTarget: 'RANGED_MONSTER' }),
  hero_archer_03: AB('LOWEST_HP_ALLOY', 'KEEP_DISTANCE', ['ON_CROWD_ENTER'], ['HAZARD_AVOIDER'], 'Bắn dọn quái đã bị thương để mở đường cho tuyến trước thay vì phí tên vào mục tiêu đầy máu.', { firingDiscipline: 'EXECUTE_ARCHER', secondaryTarget: 'WOUNDED_FRONT' }),
  hero_archer_04: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Long tiễn tìm line-of-fire dài nhất để bắn vào pháp sư/boss; nếu bị ép thì lùi ngay qua lane trống.', { firingDiscipline: 'BOSS_SNIPER', secondaryTarget: 'CHANNEL_BREAK' }),
  hero_archer_05: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Thiên tiễn vương đứng ở ô nhìn rộng rồi tập trung bắn carry nguy hiểm nhất trên bàn.', { firingDiscipline: 'ROYAL_SNIPER', secondaryTarget: 'TOP_THREAT' }),
  hero_tank_01: AB('NEAREST', 'TANK_WALL', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Khiên gỗ che thân cho đồng đội yếu máu ở gần nhất, không tự ý rời tuyến.', { guardRole: 'BASIC_BODYBLOCK', secondaryTarget: 'ALLY_SCREEN' }),
  hero_tank_02: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Thành đồng chỉ thích đứng lên đúng ô chặn giữa choke và buộc quái dồn vào mình.', { guardRole: 'CHOKE_ANCHOR', secondaryTarget: 'BUFF_HOLDER_GUARD' }),
  hero_tank_03: AB('NEAREST', 'TANK_WALL', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Tháp sắt là cọc tiêu di động: tìm giao điểm nhiều quái rồi cắm trụ ở đó càng lâu càng tốt.', { guardRole: 'STATIC_ANCHOR', secondaryTarget: 'DENSE_FRONT' }),
  hero_tank_04: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_ALLY_DEATH', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Thành Bastion sẽ nhích lên bọc các pháp sư/healer vừa bị hở góc sau khi đồng minh ngã xuống.', { guardRole: 'BASTION_REFORM', secondaryTarget: 'BACKLINE_SHIELD' }),
  hero_tank_05: AB('TREASURE_RUSH', 'TANK_WALL', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Pháo đài bất diệt không chase lẻ, chỉ tiến từng nhịp vào lõi Kho và buộc quái phải dồn tài nguyên vào mình.', { guardRole: 'SIEGE_ANCHOR', secondaryTarget: 'TREASURE_ZONE' }),
  hero_berserker_01: AB('NEAREST', 'CHARGER', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Cuồng binh chỉ cần thấy quái là lao vào, càng xuống máu càng bỏ qua phòng thủ để ép trao đổi.', { rageStyle: 'EARLY_ALL_IN', secondaryTarget: 'OPEN_DUEL' }),
  hero_berserker_02: AB('HIGH_THREAT', 'BULL_RUSH', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HAZARD_EXPLOITER'], 'Rìu máu chọn lane đông hoặc quái mạnh rồi đập thẳng, chấp nhận lướt qua bẫy nhẹ để chạm mục tiêu.', { rageStyle: 'THREAT_CHASE', secondaryTarget: 'HEAVY_TARGET' }),
  hero_berserker_03: AB('LOWEST_HP_ALLOY', 'CHARGER', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Berserker trung cấp thích săn những quái đã mẻ máu để lấy đà cuồng hóa nhanh hơn.', { rageStyle: 'EXECUTE_RAGE', secondaryTarget: 'BLOOD_SCENT' }),
  hero_berserker_04: AB('HIGH_THREAT', 'BULL_RUSH', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HAZARD_AVOIDER'], 'Huyết cuồng xem cái chết đồng đội như cò súng để lập tức nhảy vào mục tiêu giá trị nhất.', { rageStyle: 'REVENGE_RAGE', secondaryTarget: 'ALLY_KILLER' }),
  hero_berserker_05: AB('TREASURE_RUSH', 'BULL_RUSH', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HAZARD_EXPLOITER'], 'Thần cuồng hủy chỉ hạ quái khi bắt buộc; còn lại ưu tiên đạp xuyên bãi mìn để áp Kho thật nhanh.', { rageStyle: 'APOCALYPSE_PUSH', secondaryTarget: 'TREASURE_SHRED' }),
  hero_hex_01: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Lang y ô uế chuyên tìm cụm quái đang được hồi máu hoặc đứng trong ô hồi để đặt lời nguyền.', { curseFocus: 'ANTI_HEAL_OPEN', secondaryTarget: 'HEALING_CLUSTER' }),
  hero_hex_02: AB('AOE_BUFF_CARRIER', 'KITING', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Phù thủy vết bám theo mũi tấn công và dằn lời nguyền lên quái chặn đầu choke.', { curseFocus: 'FRONTLINE_ROT', secondaryTarget: 'TANKED_CLUSTER' }),
  hero_hex_03: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER'], 'Sứ giả chí mạng ưu tiên mục tiêu đang hồi máu hoặc có khiên để biến nó thành điểm vỡ của đội quái.', { curseFocus: 'FOCUS_CONDEMN', secondaryTarget: 'SHIELDED_HEALER' }),
  hero_hex_04: AB('CROWD_DENSEST', 'ZONING_ORBIT', ['ON_CROWD_ENTER', 'ON_ALLY_DEATH'], ['HAZARD_EXPLOITER', 'HERO_BUFF_SEEKER'], 'Đại dịch sứ xoay quanh vùng giao tranh lớn nhất, rải debuff cho cả cụm để quái không gượng dậy nổi.', { curseFocus: 'PLAGUE_FIELD', secondaryTarget: 'DENSE_HEAL_STACK' }),
  hero_hex_05: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Chúa tể hư hồi bỏ qua mồi nhử, chỉ nhằm vào boss/tank đang được bảo kê nặng nhất.', { curseFocus: 'BOSS_DENIAL', secondaryTarget: 'MAX_SUSTAIN_TARGET' }),
  hero_archer_06: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Băng cung ưu tiên mục tiêu lao nhanh vào tuyến sau để ghim chậm và mở khoảng thở.', { firingDiscipline: 'FREEZE_PICK', secondaryTarget: 'FAST_DIVER' }),
  hero_mage_08: AB('CROWD_DENSEST', 'KEEP_DISTANCE', ['ON_TRAP_TRIGGER', 'ON_CROWD_ENTER'], ['HAZARD_EXPLOITER', 'HERO_BUFF_SEEKER'], 'Hỏa ấn sư thích nổ combo quanh oil/fire rồi lùi đúng tầm trước khi quái phản công.', { preferredTiles: ['FIRE', 'OIL'], secondaryTarget: 'BURN_COMBO' }),
  hero_rogue_08: AB('LOWEST_HP_ALLOY', 'STEALTH_AMBUSH', ['ON_TRAP_TRIGGER'], ['HAZARD_EXPLOITER', 'HAZARD_AVOIDER'], 'Độc ảnh tìm đường qua các ô độc để gặm dần quái máu mỏng rồi rút trước khi bị giữ chân.', { flankLane: 'POISON_STITCH', secondaryTarget: 'POISON_EXECUTE' }),
  hero_tank_06: AB('HIGH_THREAT', 'TANK_WALL', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Lôi khiên chủ động kẹp boss/bruiser nguy hiểm để stun ngắt nhịp đúng lúc.', { guardRole: 'STUN_ANCHOR', secondaryTarget: 'BOSS_PIN' }),
  hero_healer_06: AB('AOE_BUFF_CARRIER', 'ZONING_ORBIT', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Sương y thích đứng lệch ở mép choke để hồi đồng đội và rải làm chậm lên quái tiếp cận.', { supportFocus: 'SLOW_HEAL_AURA', secondaryTarget: 'CHOKE_SUPPORT' }),
  hero_hex_06: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HAZARD_AVOIDER'], 'Phá giáp hex truy đúng mục tiêu giáp cao hoặc đang có shield rồi đục thủng nó cho đồng đội dồn sát thương.', { curseFocus: 'DEF_BREAK', secondaryTarget: 'MAX_DEF_TARGET' }),
  hero_archer_07: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Cung xuyên tìm góc bắn xuyên qua nhiều quái và ưu tiên lane có tank đứng chắn phía trước.', { firingDiscipline: 'PIERCE_LINE', secondaryTarget: 'DEF_STACK_LINE' }),
  hero_berserker_06: AB('LOWEST_HP_ALLOY', 'CHARGER', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HAZARD_AVOIDER', 'HAZARD_EXPLOITER'], 'Cuồng huyết chọn con đang chảy máu để hút máu hồi đà, thích lao vào lane đang hỗn loạn.', { rageStyle: 'LIFESTEAL_CHAIN', secondaryTarget: 'WOUNDED_FEED' }),
  hero_bomber_01: AB('CROWD_DENSEST', 'SUICIDE_CHARGE', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HAZARD_EXPLOITER'], 'Cảm tử lao thẳng vào cụm quái dày nhất hoặc điểm có bẫy để nổ trúng tối đa mục tiêu.', { detonationBias: 'MAX_CLUSTER', secondaryTarget: 'HAZARD_BOMB' }),
  hero_phoenix_01: AB('AOE_BUFF_CARRIER', 'ZONING_ORBIT', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Phượng y giữ mình ở lane còn đồng minh sống đông nhất để tận dụng hồi sinh và hồi máu dây chuyền.', { supportFocus: 'REVIVE_PIVOT', secondaryTarget: 'ALLY_CLUSTER_CORE' }),
  hero_shatter_01: AB('HIGH_THREAT', 'CHARGER', ['ON_CROWD_ENTER'], ['HAZARD_AVOIDER'], 'Phá khiên sĩ khóa đúng quái đang có khiên hoặc đứng trong ô tăng giáp rồi lao vào phá lớp bảo kê.', { finisherBias: 'SHIELD_BREAK', secondaryTarget: 'MAX_SHIELD_TARGET' }),
  hero_hex_07: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Phá khiên hex vừa cắt hồi vừa bóc khiên, thích quét support-tank đứng cùng nhau.', { curseFocus: 'SHIELD_HEAL_BREAK', secondaryTarget: 'PROTECTED_HEALER' }),
  hero_rogue_09: AB('CROWD_DENSEST', 'SUICIDE_CHARGE', ['ON_LOW_HP', 'ON_TRAP_TRIGGER'], ['HAZARD_EXPLOITER'], 'Bóng nổ luồn vào cụm quái tuyến sau rồi chấp nhận chết để nổ mở khoảng trống.', { detonationBias: 'BACKLINE_BOMB', secondaryTarget: 'CARRY_CLUSTER' }),
  hero_scout_01: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Mắt thần tìm ô nhìn rộng nhất rồi khóa mọi mục tiêu tàng hình hoặc sát thủ đang chuẩn bị lao ra.', { visionRole: 'WIDE_REVEAL', secondaryTarget: 'STEALTH_REVEAL' }),
  hero_scout_02: AB('HIGH_THREAT', 'ZONING_ORBIT', ['INTERRUPT_CHANNEL', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Nhãn quang thay đổi vị trí ít hơn, ưu tiên chiếm ô cao/tầm rộng và chỉ thị focus liên tục vào carry ẩn.', { visionRole: 'SNIPER_REVEAL', secondaryTarget: 'HIDDEN_CARRY' }),
  hero_boss_40: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_EXPLOITER'], 'Vệ vương đi chậm nhưng luôn kéo giao tranh vào giữa map, bật khống chế khi quái tụ quá đông trước mặt.', { bossPattern: 'MID_SIEGE', secondaryTarget: 'CENTER_BREAK' }),
  hero_boss_45: AB('BACKLINE_DIVE', 'STEALTH_AMBUSH', ['INTERRUPT_CHANNEL', 'ON_LOW_HP'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Chúa bóng đêm lẩn ở mép tối rồi đánh thẳng vào support/ranged yếu máu nhất.', { bossPattern: 'SHADOW_ASSASSIN', secondaryTarget: 'SOFT_BACKLINE' }),
  hero_boss_50: AB('CROWD_DENSEST', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_EXPLOITER'], 'Pháp vương giữ khoảng cách kiểu pháo đài, chờ quái gom cụm mới tung combo băng-hỏa diện rộng.', { bossPattern: 'ARTILLERY_MAGE', secondaryTarget: 'CHANNEL_CLUSTER' }),
  hero_boss_55: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Thiên tiễn hoàng luôn giữ tầm xa nhất có thể và chỉ bắn vào mục tiêu đáng giá nhất đang lộ góc.', { bossPattern: 'IMPERIAL_SNIPER', secondaryTarget: 'TOP_CARRY_LINE' }),
  hero_boss_60: AB('TREASURE_RUSH', 'BULL_RUSH', ['ON_CROWD_ENTER', 'ON_ALLY_DEATH'], ['HAZARD_EXPLOITER', 'HERO_BUFF_SEEKER'], 'Hoàng đế tàn lửa vừa đốt đường vừa tiến vào Kho; nếu thuộc hạ chết sẽ đổi sang trạng thái nghiền nát tuyến giữa.', { bossPattern: 'FINAL_SIEGE', secondaryTarget: 'CORE_COLLAPSE' }),
  hero_boss_05: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER'], 'Kỵ sĩ cổng sương giữ ngay tâm choke đầu, dùng khiên và đóng băng để kéo dài giao tranh mở màn.', { bossPattern: 'FROST_GATE', secondaryTarget: 'CHOKE_ANCHOR' }),
  hero_boss_10: AB('BACKLINE_DIVE', 'STEALTH_AMBUSH', ['INTERRUPT_CHANNEL', 'ON_LOW_HP'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Nhãn quỷ men rìa tối rồi nhảy thẳng vào healer/ranged lộ góc, chỉ lộ mặt khi đã tới điểm kết liễu.', { bossPattern: 'DUSK_DIVE', secondaryTarget: 'SOFT_BACKLINE' }),
  hero_boss_15: AB('CROWD_DENSEST', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_EXPLOITER'], 'Phù thủy chuông rỗng chờ quái dồn cụm trước choke rồi mới nện băng-hỏa từ khoảng cách an toàn.', { bossPattern: 'HOLLOW_ARTILLERY', secondaryTarget: 'FROZEN_CLUSTER' }),
  hero_boss_20: AB('TREASURE_RUSH', 'BULL_RUSH', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HAZARD_EXPLOITER'], 'Hầu tước dung nham lao vào lane đông nhất, đốt đường đi và hút máu để duy trì áp lực trước Kho.', { bossPattern: 'MAGMA_CRUSH', secondaryTarget: 'BURN_FRONT' }),
  hero_boss_25: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Thiên tiễn độc hậu luôn lùi vừa đủ để giữ góc bắn và ưu tiên carry hoặc boss đang đứng lộ trên ô mạnh.', { bossPattern: 'VENOM_SNIPER', secondaryTarget: 'TOP_CARRY_LINE' }),
  hero_boss_30: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_LOW_HP', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER'], 'Giáo chủ huyết khế kéo giao tranh vào giữa đội hình support, tự chắn trước và câu kéo để healer làm việc.', { bossPattern: 'BLOOD_RITUAL', secondaryTarget: 'SUPPORT_CORE' }),
  hero_boss_35: AB('CROWD_DENSEST', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'INTERRUPT_CHANNEL'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Vương không ảnh thích ẩn mình ở mép giao tranh, chỉ lộ ra khi đã khóa được cụm quái bằng AoE và băng.', { bossPattern: 'VOID_ECLIPSE', secondaryTarget: 'SHADOW_CLUSTER' }),
  hero_support_01: AB('AOE_BUFF_CARRIER', 'ZONING_ORBIT', ['ON_CROWD_ENTER', 'ON_ALLY_DEATH'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Chiến kỳ sư chủ động đứng sát ô buff hoặc choke để đồng đội bám theo cờ và giao tranh đúng chỗ.', { supportFocus: 'BANNER_ANCHOR', secondaryTarget: 'AURA_FORMATION' }),
  hero_support_02: AB('AOE_BUFF_CARRIER', 'KEEP_DISTANCE', ['ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Hộ ấn sư nhìn đồng minh sắp vỡ tuyến là đặt ấn che ngay, ưu tiên tank đang chắn lane hẹp.', { supportFocus: 'MARK_SHIELD', secondaryTarget: 'FRONTLINE_SAVE' }),
  hero_support_03: AB('HIGH_THREAT', 'KITING', ['ON_TRAP_TRIGGER', 'ON_CROWD_ENTER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Phong hành sư vừa thả diều vừa đổi góc liên tục quanh choke để quấy rối quái lao nhanh.', { supportFocus: 'WIND_KITE', secondaryTarget: 'FAST_CHASER' }),
  hero_hex_charm: AB('HIGH_THREAT', 'KITING', ['INTERRUPT_CHANNEL', 'ON_TRAP_TRIGGER'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Mê vu sư thích bẻ góc nhìn ở khúc cua rồi thả mê hoặc vào mục tiêu nguy hiểm sắp chạm tuyến sau.', { curseFocus: 'CHARM_DISRUPT', secondaryTarget: 'CONTROL_TARGET' }),
  hero_frail_blade: AB('LOWEST_HP_ALLOY', 'FLANKING', ['ON_LOW_HP'], ['HAZARD_AVOIDER'], 'Đao dễ vỡ không đánh lâu; hắn vòng sườn, chém nhanh vào mục tiêu sắp chết rồi rút ra trước khi bị focus.', { flankLane: 'HIT_AND_RUN', secondaryTarget: 'FRAGILE_EXECUTE' }),
  hero_cleanse_monk: AB('AOE_BUFF_CARRIER', 'ZONING_ORBIT', ['INTERRUPT_CHANNEL', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Tăng thanh tẩy đi gần lõi đội hình để xóa hiệu ứng xấu và cứu người dính zone độc/câm.', { supportFocus: 'CLEANSE_CORE', secondaryTarget: 'DEBUFFED_ALLY' }),
  hero_stasis_01: AB('AOE_BUFF_CARRIER', 'TANK_WALL', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Băng giáp cố ý trụ ở cửa choke, dùng lần ngủ đông như một nhịp chặn đường thứ hai.', { guardRole: 'STASIS_WALL', secondaryTarget: 'SECOND_LIFE_ANCHOR' }),
  hero_stasis_02: AB('HIGH_THREAT', 'CHARGER', ['ON_LOW_HP', 'INTERRUPT_CHANNEL'], ['HAZARD_AVOIDER', 'HERO_BUFF_SEEKER'], 'Tuyết kiếm đâm vào carry nguy hiểm nhất, chấp nhận đổi máu vì biết mình còn một lần ngủ đông.', { finisherBias: 'STASIS_DUELIST', secondaryTarget: 'RESET_DIVE' }),
  hero_stasis_03: AB('HIGH_THREAT', 'KEEP_DISTANCE', ['ON_CROWD_ENTER', 'ON_LOW_HP'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Hàn tinh giữ khoảng cách, ép quái commit vào mình rồi dùng ngủ đông như bẫy kéo nhịp giao tranh.', { preferredTiles: ['ICE', 'HERO_BUFF_ZONE'], secondaryTarget: 'STASIS_BAIT' }),
  hero_support_04: AB('LOWEST_HP_ALLOY', 'KEEP_DISTANCE', ['ON_LOW_HP', 'ON_ALLY_DEATH'], ['HERO_BUFF_SEEKER', 'HAZARD_AVOIDER'], 'Khiên sư luôn tìm đồng minh nguy hiểm nhất sắp vỡ máu để trao khiên trước, đặc biệt ở lane có buff tranh chấp.', { supportFocus: 'PROACTIVE_SHIELD', secondaryTarget: 'ALLY_ABOUT_TO_BREAK' }),
};

for (const hero of HEROES) {
  const behavior =
    HERO_AI_BEHAVIORS[hero.id] ||
    AB('NEAREST', 'CHARGER', 'ON_CROWD_ENTER', 'HAZARD_AVOIDER', 'Fallback AI.');
  hero.ai_behavior = behavior;
  hero.brain_logic = behavior.brain_logic;
}

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
    tip: 'Tank + healer — mang DoT / anti-heal (Đỉa Gỉ, Cóc Ô Uế).',
    waves: [
      { delay: 0.6, ids: ['hero_warrior_07', 'hero_healer_02', 'hero_warrior_05', 'hero_hex_01'] },
      { delay: 13, ids: ['hero_warrior_08', 'hero_healer_03', 'hero_warrior_06', 'hero_hex_02'] },
      { delay: 26, ids: ['hero_warrior_07', 'hero_warrior_08', 'hero_healer_03', 'hero_hex_02', 'hero_warrior_01'] },
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
    tip: 'Cửa ngõ ải 31 — xuất hiện Cung / Tank / Berserk.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_06', 'hero_archer_01', 'hero_rogue_04', 'hero_mage_05'] },
      { delay: 12, ids: ['hero_tank_01', 'hero_warrior_08', 'hero_healer_02', 'hero_berserker_01', 'hero_mage_03'] },
      { delay: 24, ids: ['hero_healer_03', 'hero_berserker_02', 'hero_archer_02', 'hero_tank_02', 'hero_warrior_07', 'hero_rogue_05'] },
    ],
  },

  // ——— Ải 31–40: elite + class mới ———
  31: {
    theme: 'Bước vào vực sâu',
    tip: 'Elite war + cung thủ — gap-close / DoT. Wave sau chỉ vào khi đợt trước hết.',
    waves: [
      { delay: 0.5, ids: ['hero_warrior_09', 'hero_archer_03', 'hero_healer_04'] },
      { delay: 14, ids: ['hero_mage_06', 'hero_tank_03', 'hero_berserker_02', 'hero_shatter_01'] },
      { delay: 26, ids: ['hero_warrior_09', 'hero_healer_03', 'hero_archer_03', 'hero_bomber_01'] },
    ],
  },
  32: {
    theme: 'Phalanx titan',
    tip: 'Thuần tank + chiến binh — DoT / %HP.',
    waves: [
      { delay: 0.4, ids: ['hero_tank_03', 'hero_warrior_09', 'hero_tank_02'] },
      { delay: 12, ids: ['hero_warrior_11', 'hero_healer_04', 'hero_berserker_03'] },
      { delay: 24, ids: ['hero_tank_04', 'hero_warrior_10', 'hero_healer_04', 'hero_archer_03'] },
    ],
  },
  33: {
    theme: 'Pháp trận diệt long',
    tip: 'Mage + cung xa — Silence / áp sát ngay.',
    waves: [
      { delay: 0.5, ids: ['hero_mage_06', 'hero_archer_04', 'hero_healer_04'] },
      { delay: 13, ids: ['hero_warrior_10', 'hero_mage_06', 'hero_berserker_03', 'hero_healer_02'] },
      { delay: 25, ids: ['hero_mage_07', 'hero_archer_04', 'hero_healer_05'] },
    ],
  },
  34: {
    theme: 'Đêm sát thủ',
    tip: 'Rogue + berserk rush — Mắt thần + CC.',
    waves: [
      { delay: 0.4, ids: ['hero_rogue_06', 'hero_berserker_03', 'hero_rogue_04', 'hero_archer_02'] },
      { delay: 12, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_berserker_04'] },
      { delay: 24, ids: ['hero_rogue_07', 'hero_tank_03', 'hero_healer_05', 'hero_mage_06'] },
    ],
  },
  35: {
    theme: 'Thánh chiến titan',
    tip: 'Tank + healer + diệt hồi — hạ healer / hexer trước.',
    waves: [
      { delay: 0.5, ids: ['hero_healer_05', 'hero_tank_04', 'hero_hex_03'] },
      { delay: 11, ids: ['hero_berserker_04', 'hero_healer_04', 'hero_archer_04', 'hero_hex_04'] },
      { delay: 22, ids: ['hero_healer_05', 'hero_tank_04', 'hero_hex_04', 'hero_mage_07'] },
    ],
  },
  36: {
    theme: 'Bão hủy diệt',
    tip: 'Ba class mới + Boss-tier. Wave sau chỉ vào khi đợt trước hết.',
    waves: [
      { delay: 0.4, ids: ['hero_archer_04', 'hero_mage_06', 'hero_berserker_03', 'hero_healer_04'] },
      { delay: 10, ids: ['hero_tank_04', 'hero_shatter_01', 'hero_mage_07', 'hero_berserker_04'] },
      { delay: 21, ids: ['hero_archer_05', 'hero_rogue_09', 'hero_phoenix_01', 'hero_tank_04', 'hero_hex_07'] },
    ],
  },
  37: {
    theme: 'Vách sắt bất diệt',
    tip: 'Thuần tank dày — cần Boss / DoT / phá khiên / %HP.',
    waves: [
      { delay: 0.5, ids: ['hero_tank_05', 'hero_phoenix_01', 'hero_tank_04'] },
      { delay: 12, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_tank_05', 'hero_shatter_01'] },
      { delay: 24, ids: ['hero_tank_05', 'hero_healer_05', 'hero_bomber_01', 'hero_rogue_07', 'hero_hex_07'] },
    ],
  },
  38: {
    theme: 'Song diệt thần',
    tip: 'Cung + berserk Boss-tier — đội hình 7–8 cost.',
    waves: [
      { delay: 0.4, ids: ['hero_archer_05', 'hero_berserker_05', 'hero_warrior_10'] },
      { delay: 11, ids: ['hero_healer_05', 'hero_mage_06', 'hero_archer_04', 'hero_tank_04'] },
      { delay: 22, ids: ['hero_archer_05', 'hero_berserker_05', 'hero_tank_05', 'hero_healer_05', 'hero_mage_07'] },
    ],
  },
  39: {
    theme: 'Đêm trước tận thế II',
    tip: 'Bốn wave hỗn hợp class mới — giữ spell cuối.',
    waves: [
      { delay: 0.35, ids: ['hero_rogue_06', 'hero_archer_04', 'hero_berserker_03'] },
      { delay: 9, ids: ['hero_tank_04', 'hero_healer_04', 'hero_berserker_04', 'hero_mage_07'] },
      { delay: 18, ids: ['hero_warrior_11', 'hero_healer_05', 'hero_archer_05', 'hero_mage_06'] },
      { delay: 28, ids: ['hero_tank_05', 'hero_mage_07', 'hero_healer_05', 'hero_berserker_05', 'hero_archer_05'] },
    ],
  },
  40: {
    theme: 'Boss: Vệ Vương Thép',
    tip: 'Boss fight dài — map ×3 / pool lớn. Focus Vệ Vương; boss ép giao tranh nhiều nhịp.',
    waves: [
      { delay: 0.4, ids: ['hero_support_04', 'hero_warrior_09', 'hero_archer_04', 'hero_mage_06', 'hero_rogue_06'] },
      { delay: 12, ids: ['hero_boss_40', 'hero_stasis_01', 'hero_healer_04', 'hero_tank_04', 'hero_hex_03', 'hero_support_02'] },
      { delay: 26, ids: ['hero_boss_40', 'hero_berserker_04', 'hero_healer_05', 'hero_archer_05', 'hero_mage_07', 'hero_support_01'] },
      { delay: 42, ids: ['hero_boss_40', 'hero_stasis_02', 'hero_tank_05', 'hero_healer_05', 'hero_shatter_01', 'hero_support_04'] },
    ],
  },

  // ——— Ải 41–50: mỗi ải nhấn 1–2 class ———
  41: {
    theme: 'Pháp trận hỗn mang',
    tip: 'Mage + Hexer nhiều đợt trên map dài — Silence / anti-heal / áp sát.',
    waves: [
      { delay: 0.4, ids: ['hero_scout_01', 'hero_support_04', 'hero_mage_06', 'hero_mage_07', 'hero_mage_08', 'hero_hex_03'] },
      { delay: 12, ids: ['hero_hex_04', 'hero_healer_04', 'hero_mage_07', 'hero_archer_04'] },
      { delay: 24, ids: ['hero_mage_07', 'hero_stasis_03', 'hero_hex_05', 'hero_tank_04', 'hero_warrior_10', 'hero_healer_05'] },
      { delay: 37, ids: ['hero_mage_08', 'hero_hex_07', 'hero_support_01', 'hero_support_04', 'hero_rogue_07'] },
    ],
  },
  42: {
    theme: 'Mưa tiễn',
    tip: 'Nhấn Cung thủ — gap-close / rush; có healer giữ tuyến.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_01', 'hero_archer_04', 'hero_archer_05', 'hero_rogue_06'] },
      { delay: 11, ids: ['hero_archer_06', 'hero_support_04', 'hero_healer_06', 'hero_hex_06', 'hero_mage_06', 'hero_support_03'] },
      { delay: 22, ids: ['hero_archer_05', 'hero_stasis_02', 'hero_archer_04', 'hero_tank_04', 'hero_berserker_04', 'hero_healer_04'] },
      { delay: 35, ids: ['hero_archer_06', 'hero_support_03', 'hero_support_04', 'hero_hex_05', 'hero_rogue_09'] },
    ],
  },
  43: {
    theme: 'Thành bất khả xâm',
    tip: 'Nhấn Thuần tank + Healer — Boss/DoT/%HP.',
    waves: [
      { delay: 0.5, ids: ['hero_scout_01', 'hero_tank_05', 'hero_tank_04', 'hero_healer_05'] },
      { delay: 13, ids: ['hero_tank_05', 'hero_stasis_01', 'hero_warrior_11', 'hero_healer_04', 'hero_hex_04'] },
      { delay: 26, ids: ['hero_tank_05', 'hero_healer_05', 'hero_mage_07', 'hero_archer_04', 'hero_rogue_07', 'hero_support_04'] },
      { delay: 40, ids: ['hero_tank_05', 'hero_stasis_01', 'hero_shatter_01', 'hero_healer_05', 'hero_support_02'] },
    ],
  },
  44: {
    theme: 'Cuồng huyết',
    tip: 'Nhấn Berserker — burst sớm; hexer cắt hồi nếu kéo dài.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_01', 'hero_berserker_04', 'hero_berserker_05', 'hero_rogue_06'] },
      { delay: 10, ids: ['hero_berserker_05', 'hero_stasis_02', 'hero_healer_04', 'hero_hex_04', 'hero_warrior_10', 'hero_support_01'] },
      { delay: 21, ids: ['hero_berserker_05', 'hero_tank_04', 'hero_healer_05', 'hero_archer_05', 'hero_hex_03', 'hero_support_04'] },
      { delay: 34, ids: ['hero_berserker_05', 'hero_bomber_01', 'hero_support_03', 'hero_hex_07', 'hero_stasis_02'] },
    ],
  },
  45: {
    theme: 'Boss: Chúa Bóng Đêm',
    tip: 'Boss fight — map ×3 / pool lớn. Focus Chúa Bóng; Mắt thần + anti-heal bắt buộc.',
    waves: [
      { delay: 0.35, ids: ['hero_rogue_06', 'hero_rogue_07', 'hero_hex_04', 'hero_scout_01', 'hero_support_03'] },
      { delay: 11, ids: ['hero_boss_45', 'hero_healer_05', 'hero_hex_05', 'hero_archer_04', 'hero_support_04'] },
      { delay: 24, ids: ['hero_boss_45', 'hero_stasis_01', 'hero_rogue_09', 'hero_berserker_04', 'hero_tank_04', 'hero_mage_07'] },
      { delay: 40, ids: ['hero_boss_45', 'hero_rogue_09', 'hero_support_03', 'hero_hex_07', 'hero_healer_05'] },
    ],
  },
  46: {
    theme: 'Thập tự quân cuối',
    tip: 'Nhấn Warrior + Healer — wall dày, hạ healer trước.',
    waves: [
      { delay: 0.4, ids: ['hero_scout_01', 'hero_warrior_09', 'hero_warrior_10', 'hero_healer_05'] },
      { delay: 11, ids: ['hero_warrior_11', 'hero_healer_04', 'hero_hex_04', 'hero_tank_04'] },
      { delay: 22, ids: ['hero_warrior_10', 'hero_stasis_02', 'hero_warrior_11', 'hero_healer_05', 'hero_mage_07', 'hero_archer_04', 'hero_support_04'] },
      { delay: 34, ids: ['hero_warrior_11', 'hero_tank_05', 'hero_healer_05', 'hero_berserker_04', 'hero_rogue_07'] },
      { delay: 48, ids: ['hero_warrior_11', 'hero_support_01', 'hero_support_04', 'hero_shatter_01', 'hero_tank_05'] },
    ],
  },
  47: {
    theme: 'Diệt hồi tuyệt đối',
    tip: 'Nhấn Hexer — heal quái yếu; vẫn cần burst tank/berserk.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_01', 'hero_hex_04', 'hero_hex_05', 'hero_mage_06'] },
      { delay: 10, ids: ['hero_hex_05', 'hero_stasis_03', 'hero_healer_05', 'hero_tank_04', 'hero_archer_05'] },
      { delay: 20, ids: ['hero_hex_04', 'hero_berserker_05', 'hero_warrior_10', 'hero_rogue_07'] },
      { delay: 31, ids: ['hero_hex_05', 'hero_hex_04', 'hero_tank_05', 'hero_healer_05', 'hero_mage_07', 'hero_archer_04', 'hero_support_04'] },
      { delay: 44, ids: ['hero_hex_07', 'hero_support_01', 'hero_support_04', 'hero_stasis_03', 'hero_archer_06'] },
    ],
  },
  48: {
    theme: 'Thiên tiễn & thánh',
    tip: 'Cung + Healer + Mage — kite xa; gap-close bắt buộc.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_01', 'hero_archer_05', 'hero_mage_07', 'hero_healer_05'] },
      { delay: 11, ids: ['hero_archer_05', 'hero_hex_04', 'hero_healer_04', 'hero_tank_04'] },
      { delay: 22, ids: ['hero_mage_07', 'hero_stasis_01', 'hero_archer_04', 'hero_healer_05', 'hero_warrior_11', 'hero_rogue_06'] },
      { delay: 34, ids: ['hero_archer_05', 'hero_mage_06', 'hero_healer_05', 'hero_hex_05', 'hero_berserker_04', 'hero_support_04'] },
      { delay: 47, ids: ['hero_archer_06', 'hero_support_03', 'hero_support_04', 'hero_mage_08', 'hero_stasis_02'] },
    ],
  },
  49: {
    theme: 'Đêm trước tận thế III',
    tip: '4 wave xoay class — đọc đội hình từng đợt.',
    waves: [
      { delay: 0.3, ids: ['hero_scout_01', 'hero_rogue_07', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 9, ids: ['hero_tank_05', 'hero_stasis_02', 'hero_healer_05', 'hero_mage_07', 'hero_berserker_04'] },
      { delay: 18, ids: ['hero_warrior_11', 'hero_hex_05', 'hero_archer_05', 'hero_healer_04', 'hero_rogue_06'] },
      { delay: 28, ids: ['hero_berserker_05', 'hero_tank_05', 'hero_mage_07', 'hero_healer_05', 'hero_hex_05', 'hero_stasis_01', 'hero_support_04'] },
      { delay: 42, ids: ['hero_support_01', 'hero_support_03', 'hero_support_04', 'hero_phoenix_01', 'hero_shatter_01'] },
    ],
  },
  50: {
    theme: 'Boss: Pháp Vương Hỗn Nguyên',
    tip: 'Boss fight — map ×3 / pool lớn. Focus Pháp Vương; Silence / áp sát mage.',
    waves: [
      { delay: 0.3, ids: ['hero_support_04', 'hero_mage_06', 'hero_mage_07', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 12, ids: ['hero_boss_50', 'hero_stasis_03', 'hero_healer_05', 'hero_tank_04', 'hero_warrior_10', 'hero_support_02'] },
      { delay: 26, ids: ['hero_boss_50', 'hero_mage_08', 'hero_healer_05', 'hero_hex_05', 'hero_shatter_01', 'hero_support_03'] },
      { delay: 43, ids: ['hero_boss_50', 'hero_stasis_03', 'hero_support_04', 'hero_healer_05', 'hero_archer_06', 'hero_hex_07'] },
    ],
  },

  // ——— Ải 51–60: endgame — map rộng, đa dạng class ———
  51: {
    theme: 'Pháo đài tự hủy',
    tip: 'Bomber + Berserk rush — giữ tank/hexer cho đợt 2.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_02', 'hero_support_04', 'hero_bomber_01', 'hero_berserker_04', 'hero_rogue_06', 'hero_archer_04'] },
      { delay: 11, ids: ['hero_stasis_01', 'hero_tank_04', 'hero_healer_04', 'hero_hex_04', 'hero_warrior_10', 'hero_mage_06'] },
      { delay: 23, ids: ['hero_bomber_01', 'hero_berserker_05', 'hero_shatter_01', 'hero_healer_05', 'hero_rogue_07'] },
      { delay: 37, ids: ['hero_bomber_01', 'hero_support_03', 'hero_support_04', 'hero_stasis_02', 'hero_hex_07'] },
    ],
  },
  52: {
    theme: 'Hồi sinh bất tử',
    tip: 'Phoenix + ngủ đông — burst trước khi hồi lần 2.',
    waves: [
      { delay: 0.4, ids: ['hero_scout_02', 'hero_phoenix_01', 'hero_stasis_02', 'hero_healer_04', 'hero_tank_03', 'hero_mage_06'] },
      { delay: 12, ids: ['hero_phoenix_01', 'hero_stasis_01', 'hero_healer_05', 'hero_warrior_11', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 24, ids: ['hero_healer_05', 'hero_tank_05', 'hero_phoenix_01', 'hero_stasis_03', 'hero_berserker_04', 'hero_mage_07', 'hero_hex_05', 'hero_support_04'] },
      { delay: 39, ids: ['hero_phoenix_01', 'hero_stasis_01', 'hero_support_02', 'hero_support_04', 'hero_healer_06'] },
    ],
  },
  53: {
    theme: 'Phá khiên tuyệt đối',
    tip: 'Shatter + Mage pierce — tank địch có shield dày.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_02', 'hero_shatter_01', 'hero_mage_07', 'hero_mage_08', 'hero_archer_04'] },
      { delay: 11, ids: ['hero_tank_05', 'hero_shatter_01', 'hero_warrior_10', 'hero_healer_04', 'hero_hex_03'] },
      { delay: 22, ids: ['hero_shatter_01', 'hero_stasis_01', 'hero_tank_04', 'hero_berserker_05', 'hero_mage_06', 'hero_rogue_09'] },
      { delay: 34, ids: ['hero_tank_05', 'hero_shatter_01', 'hero_hex_07', 'hero_healer_05', 'hero_archer_05', 'hero_mage_07', 'hero_support_04'] },
      { delay: 49, ids: ['hero_shatter_01', 'hero_stasis_01', 'hero_support_01', 'hero_support_04', 'hero_mage_08'] },
    ],
  },
  54: {
    theme: 'Đêm tàng hình II',
    tip: 'Rogue stealth + Hexer — Mắt thần + anti-heal bắt buộc.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_02', 'hero_rogue_09', 'hero_rogue_07', 'hero_rogue_06', 'hero_hex_04'] },
      { delay: 10, ids: ['hero_rogue_08', 'hero_stasis_03', 'hero_hex_05', 'hero_healer_05', 'hero_archer_04', 'hero_mage_06', 'hero_support_03'] },
      { delay: 21, ids: ['hero_rogue_09', 'hero_berserker_04', 'hero_hex_07', 'hero_tank_04', 'hero_mage_08'] },
      { delay: 32, ids: ['hero_rogue_07', 'hero_hex_05', 'hero_archer_05', 'hero_healer_05', 'hero_warrior_11', 'hero_rogue_06'] },
      { delay: 46, ids: ['hero_rogue_09', 'hero_support_03', 'hero_support_04', 'hero_stasis_03', 'hero_hex_charm'] },
    ],
  },
  55: {
    theme: 'Boss: Thiên Tiễn Hoàng',
    tip: 'Boss fight — map ×3 / pool lớn. Focus Thiên Tiễn; gap-close / silence bắt buộc.',
    waves: [
      { delay: 0.35, ids: ['hero_support_04', 'hero_archer_04', 'hero_archer_05', 'hero_healer_04', 'hero_mage_06'] },
      { delay: 11, ids: ['hero_boss_55', 'hero_stasis_02', 'hero_healer_05', 'hero_hex_06', 'hero_tank_04', 'hero_support_02'] },
      { delay: 24, ids: ['hero_boss_55', 'hero_archer_06', 'hero_healer_05', 'hero_berserker_04', 'hero_mage_08', 'hero_hex_charm', 'hero_support_03'] },
      { delay: 41, ids: ['hero_boss_55', 'hero_support_04', 'hero_archer_06', 'hero_stasis_02', 'hero_healer_06'] },
    ],
  },
  56: {
    theme: 'Hỗn mang nguyên tố',
    tip: 'Mage đa element + Warrior wall — DoT và Silence.',
    waves: [
      { delay: 0.35, ids: ['hero_scout_02', 'hero_mage_06', 'hero_mage_07', 'hero_mage_08', 'hero_warrior_10'] },
      { delay: 10, ids: ['hero_mage_07', 'hero_stasis_03', 'hero_healer_04', 'hero_warrior_11', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 20, ids: ['hero_mage_08', 'hero_berserker_05', 'hero_tank_04', 'hero_hex_05', 'hero_healer_05'] },
      { delay: 30, ids: ['hero_mage_07', 'hero_mage_06', 'hero_warrior_11', 'hero_healer_05', 'hero_rogue_07', 'hero_hex_07', 'hero_support_04'] },
      { delay: 44, ids: ['hero_mage_08', 'hero_support_01', 'hero_support_04', 'hero_stasis_03', 'hero_archer_06'] },
    ],
  },
  57: {
    theme: 'Thành trì tuyệt đối',
    tip: 'Tank + Healer siêu dày — mang %HP / DoT / phá khiên.',
    waves: [
      { delay: 0.4, ids: ['hero_scout_02', 'hero_tank_05', 'hero_stasis_01', 'hero_tank_04', 'hero_healer_05', 'hero_hex_04'] },
      { delay: 12, ids: ['hero_tank_05', 'hero_healer_04', 'hero_warrior_11', 'hero_shatter_01', 'hero_mage_06'] },
      { delay: 24, ids: ['hero_tank_05', 'hero_healer_05', 'hero_phoenix_01', 'hero_stasis_02', 'hero_hex_05', 'hero_archer_05', 'hero_berserker_04'] },
      { delay: 36, ids: ['hero_tank_05', 'hero_tank_04', 'hero_healer_05', 'hero_warrior_10', 'hero_hex_07', 'hero_mage_07', 'hero_support_04'] },
      { delay: 51, ids: ['hero_tank_05', 'hero_stasis_01', 'hero_support_02', 'hero_support_04', 'hero_phoenix_01'] },
    ],
  },
  58: {
    theme: 'Cuồng chiến tận thế',
    tip: 'Berserker + Bomber — burst sớm hoặc bị cuốn.',
    waves: [
      { delay: 0.3, ids: ['hero_scout_02', 'hero_berserker_04', 'hero_berserker_05', 'hero_bomber_01', 'hero_rogue_06'] },
      { delay: 9, ids: ['hero_berserker_05', 'hero_stasis_02', 'hero_healer_04', 'hero_hex_04', 'hero_warrior_10', 'hero_archer_04'] },
      { delay: 18, ids: ['hero_berserker_05', 'hero_bomber_01', 'hero_tank_04', 'hero_healer_05', 'hero_mage_07'] },
      { delay: 28, ids: ['hero_berserker_05', 'hero_rogue_09', 'hero_hex_05', 'hero_archer_05', 'hero_stasis_01', 'hero_shatter_01', 'hero_support_04'] },
      { delay: 42, ids: ['hero_berserker_05', 'hero_bomber_01', 'hero_support_03', 'hero_support_04', 'hero_stasis_02'] },
    ],
  },
  59: {
    theme: 'Tứ đại thiên vương',
    tip: '4 wave full elite — đọc từng đợt, giữ spell cuối.',
    waves: [
      { delay: 0.3, ids: ['hero_scout_02', 'hero_warrior_11', 'hero_mage_08', 'hero_stasis_03', 'hero_rogue_09', 'hero_hex_05'] },
      { delay: 9, ids: ['hero_tank_05', 'hero_healer_05', 'hero_archer_06', 'hero_berserker_05', 'hero_shatter_01'] },
      { delay: 18, ids: ['hero_phoenix_01', 'hero_stasis_01', 'hero_bomber_01', 'hero_hex_07', 'hero_mage_07', 'hero_warrior_10', 'hero_healer_04'] },
      { delay: 28, ids: ['hero_tank_05', 'hero_archer_05', 'hero_berserker_05', 'hero_rogue_07', 'hero_healer_05', 'hero_mage_08', 'hero_hex_05', 'hero_support_04'] },
      { delay: 43, ids: ['hero_phoenix_01', 'hero_stasis_03', 'hero_support_01', 'hero_support_03', 'hero_support_04', 'hero_shatter_01'] },
    ],
  },
  60: {
    theme: 'Boss: Hoàng Đế Tàn Lửa',
    tip: 'Ải 60 Boss cực dài — map ×3 / pool lớn. Focus Hoàng Đế; giữ tài nguyên cho các đợt cuối.',
    waves: [
      { delay: 0.25, ids: ['hero_support_04', 'hero_warrior_11', 'hero_hex_05', 'hero_archer_06', 'hero_healer_05', 'hero_bomber_01'] },
      { delay: 10, ids: ['hero_boss_60', 'hero_stasis_01', 'hero_tank_05', 'hero_mage_08', 'hero_shatter_01', 'hero_phoenix_01', 'hero_support_02'] },
      { delay: 22, ids: ['hero_boss_60', 'hero_stasis_02', 'hero_healer_05', 'hero_berserker_05', 'hero_rogue_07', 'hero_hex_07', 'hero_archer_05', 'hero_support_01'] },
      { delay: 36, ids: ['hero_boss_60', 'hero_stasis_03', 'hero_phoenix_01', 'hero_bomber_01', 'hero_tank_05', 'hero_mage_08', 'hero_healer_05', 'hero_warrior_11', 'hero_support_04'] },
      { delay: 54, ids: ['hero_boss_60', 'hero_stasis_01', 'hero_stasis_03', 'hero_support_02', 'hero_support_03', 'hero_support_04', 'hero_shatter_01'] },
    ],
  },

};

/**
 * @param {number} level 1–60
 */
export function getWavePlan(level = 1) {
  const lv = Math.max(1, Math.min(60, level | 0));
  return WAVE_PLANS[lv] || WAVE_PLANS[1];
}

function heroScaleForLevel(level) {
  if (level <= 20) return 0.9 + (level - 1) * 0.095;
  if (level <= 30) return 0.9 + 19 * 0.095 + (level - 20) * 0.16;
  // 31+ flattened — trước +0.2/lv làm HP/ATK (và heal %maxHp) phình quá nhanh
  if (level <= 40) return 0.9 + 19 * 0.095 + 10 * 0.16 + (level - 30) * 0.12;
  if (level <= 50) return 0.9 + 19 * 0.095 + 10 * 0.16 + 10 * 0.12 + (level - 40) * 0.11;
  // 51–60 endgame — tăng chậm hơn để vẫn đánh được
  return 0.9 + 19 * 0.095 + 10 * 0.16 + 10 * 0.12 + 10 * 0.11 + (level - 50) * 0.09;
}

/**
 * Scale quái theo ải — ~42% đà hero (trước ~72% làm ải 31 ≈ ×3.5 quá cao).
 * Hero scale giữ nguyên; chỉ nerf hệ số quái.
 */
export function monsterScaleForLevel(level) {
  const hs = heroScaleForLevel(level);
  return 1 + (hs - 0.9) * 0.42;
}

export { heroScaleForLevel };

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
      template.class === 'WARRIOR' || template.class === 'TANK'
        ? 'Tuyến trước'
        : template.class === 'BERSERKER'
          ? 'Rush / cuồng chiến'
          : template.class === 'HEXER'
            ? 'Diệt hồi / giảm heal'
            : template.class === 'BOSS'
              ? 'Hero Boss'
              : template.class === 'HEALER'
              ? 'Hỗ trợ / hồi máu'
              : template.class === 'MAGE' || template.class === 'ARCHER' || template.class === 'SCOUT'
                ? template.class === 'SCOUT'
                  ? 'Trinh sát / soi hình'
                  : 'Tuyến sau / tầm xa'
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
 * Warrior/Tank → cổng giữa; Rogue/Berserker → mép; Mage/Archer/Healer → spread.
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
    if (h.class === 'WARRIOR' || h.class === 'TANK' || h.class === 'BOSS') g = pickSpread(centerFirst);
    else if (h.class === 'ROGUE' || h.class === 'BERSERKER') g = pickSpread(edgeFirst);
    else g = pickSpread(gates);

    h.formation = {
      order: i + 1,
      roleLine:
        h.class === 'WARRIOR' || h.class === 'TANK'
          ? 'Tuyến trước'
          : h.class === 'BOSS'
            ? 'Hero Boss'
          : h.class === 'BERSERKER'
            ? 'Rush / cuồng chiến'
            : h.class === 'HEXER'
              ? 'Diệt hồi / giảm heal'
              : h.class === 'HEALER'
                ? 'Hỗ trợ / hồi máu'
                : h.class === 'MAGE' || h.class === 'ARCHER' || h.class === 'SCOUT'
                  ? h.class === 'SCOUT'
                    ? 'Trinh sát / soi hình'
                    : 'Tuyến sau / tầm xa'
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

