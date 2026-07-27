/** Hero AI catalog — mỗi ải 1–40 có tổ hợp hero riêng */

import { COMBAT } from './constants.js?v=74';

export const HEROES = [
  // ——— MAGE ———
  {
    id: 'hero_mage_01',
    name: 'Pháp Sư Lửa',
    class: 'MAGE',
    hp: 240, atk: 60, speed: 1.8, range: 3.2, atkSpeed: 0.7, aoeRadius: 1.8,
    target: 'TREASURE', color: '#ce93d8', skills: ['AOE_FIRE', 'BURN_ON_HIT'],
    description: 'Dame lan lửa — sợ Silence / áp sát.',
  },
  {
    id: 'hero_mage_02',
    name: 'Pháp Sư Băng',
    class: 'MAGE',
    hp: 200, atk: 52, speed: 1.7, range: 3.0, atkSpeed: 0.75, aoeRadius: 1.5,
    target: 'TREASURE', color: '#90caf9', skills: ['AOE_FROST', 'FREEZE'],
    description: 'AoE + đóng băng — vẫn yếu trước Silence.',
  },
  {
    id: 'hero_mage_03',
    name: 'Lôi Thuật Sư',
    class: 'MAGE',
    hp: 220, atk: 68, speed: 1.9, range: 3.4, atkSpeed: 0.85, aoeRadius: 1.2,
    target: 'TREASURE', color: '#fff59d', skills: ['AOE_FIRE'],
    description: 'Tick sét nhanh — máu mỏng, sợ silence.',
  },
  {
    id: 'hero_mage_04',
    name: 'Độc Cô Nữ',
    class: 'MAGE',
    hp: 250, atk: 48, speed: 1.5, range: 2.8, atkSpeed: 0.65, aoeRadius: 2.2,
    target: 'TREASURE', color: '#aed581', skills: ['AOE_FROST', 'POISON_ON_HIT'],
    description: 'AoE độc rộng — chậm, dễ bị áp sát.',
  },
  {
    id: 'hero_mage_05',
    name: 'Huyền Không Sư',
    class: 'MAGE',
    hp: 185, atk: 78, speed: 2.0, range: 3.6, atkSpeed: 0.6, aoeRadius: 2.0,
    target: 'TREASURE', color: '#b39ddb', skills: ['AOE_FIRE', 'FREEZE'],
    description: 'Burst phép cực mạnh — cực sợ Silence.',
  },
  {
    id: 'hero_mage_06',
    name: 'Diệt Long Sư',
    class: 'MAGE',
    hp: 480, atk: 190, speed: 1.85, range: 3.8, atkSpeed: 0.82, aoeRadius: 2.5,
    target: 'TREASURE', color: '#ea80fc', skills: ['AOE_FIRE', 'FREEZE'],
    description: 'AoE ngang Rồng 7 cost — cần Silence / burst ngay.',
  },
  {
    id: 'hero_mage_07',
    name: 'Hắc Tinh Quân',
    class: 'MAGE',
    hp: 560, atk: 230, speed: 1.7, range: 4.0, atkSpeed: 0.78, aoeRadius: 2.8,
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
    hp: 260, atk: 28, speed: 1.6, range: 2.8, atkSpeed: 0.75, aoeRadius: 0,
    target: 'TREASURE', color: '#fff9c4', skills: ['HEAL_ALLY'],
    description: 'Hồi máu đồng đội — ưu tiên hạ healer trước.',
  },
  {
    id: 'hero_healer_02',
    name: 'Nữ Tư Tế Ánh',
    class: 'HEALER',
    hp: 300, atk: 32, speed: 1.5, range: 3.0, atkSpeed: 0.8, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Heal mạnh + khiên — giữ cả wave sống lâu.',
  },
  {
    id: 'hero_healer_03',
    name: 'Thánh Giả Tận Thế',
    class: 'HEALER',
    hp: 340, atk: 36, speed: 1.45, range: 3.2, atkSpeed: 0.85, aoeRadius: 0,
    target: 'TREASURE', color: '#ffecb3', skills: ['HEAL_ALLY'],
    description: 'Heal elite hậu kỳ — bỏ sót là thua kéo dài.',
  },
  {
    id: 'hero_healer_04',
    name: 'Đại Tư Tế Ánh',
    class: 'HEALER',
    hp: 480, atk: 48, speed: 1.55, range: 3.5, atkSpeed: 0.85, aoeRadius: 0,
    target: 'TREASURE', color: '#fff59d', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Heal mạnh — ưu tiên hạ trước, ATK hỗ trợ thấp.',
  },
  {
    id: 'hero_healer_05',
    name: 'Thiên Sứ Hồi Sinh',
    class: 'HEALER',
    hp: 560, atk: 55, speed: 1.4, range: 3.8, atkSpeed: 0.9, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe57f', skills: ['HEAL_ALLY', 'SHIELD'],
    description: 'Healer hậu kỳ — hồi mạnh nhưng sát thương cá nhân yếu.',
  },

  // ——— ROGUE ———
  {
    id: 'hero_rogue_01',
    name: 'Đạo Tặc Bóng',
    class: 'ROGUE',
    hp: 190, atk: 65, speed: 2.8, range: 1.1, atkSpeed: 1.4, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#a5d6a7', skills: ['STEALTH'],
    description: 'Tàng hình — sợ Mắt thần & Bẫy.',
  },
  {
    id: 'hero_rogue_02',
    name: 'Sát Thủ Lụa',
    class: 'ROGUE',
    hp: 170, atk: 76, speed: 3.0, range: 1.0, atkSpeed: 1.5, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#80cbc4', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Cực nhanh, máu mỏng.',
  },
  {
    id: 'hero_rogue_03',
    name: 'Song Đao Khách',
    class: 'ROGUE',
    hp: 220, atk: 60, speed: 2.4, range: 1.3, atkSpeed: 1.6, aoeRadius: 0,
    stealth: false, target: 'TREASURE', color: '#ef9a9a', skills: ['BACKSTAB'],
    description: 'DPS gần nhanh — không tàng hình, dễ focus.',
  },
  {
    id: 'hero_rogue_04',
    name: 'Ảo Ảnh Tặc',
    class: 'ROGUE',
    hp: 155, atk: 64, speed: 3.2, range: 1.2, atkSpeed: 1.35, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#ce93d8', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Siêu nhanh + ẩn — bắt buộc anti-rogue.',
  },
  {
    id: 'hero_rogue_05',
    name: 'Cung Thủ Bóng',
    class: 'ROGUE',
    hp: 200, atk: 58, speed: 2.2, range: 2.8, atkSpeed: 1.1, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#81c784', skills: ['STEALTH'],
    description: 'Tàng hình bắn xa — Mắt thần + áp sát.',
  },
  {
    id: 'hero_rogue_06',
    name: 'Sát Thủ Huyết Ảnh',
    class: 'ROGUE',
    hp: 360, atk: 180, speed: 3.2, range: 1.3, atkSpeed: 1.6, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#26a69a', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Rogue ngang Wraith/Rồng — bắt buộc Mắt thần.',
  },
  {
    id: 'hero_rogue_07',
    name: 'Ma Ảnh Độc Vương',
    class: 'ROGUE',
    hp: 400, atk: 200, speed: 2.95, range: 2.8, atkSpeed: 1.4, aoeRadius: 0,
    stealth: true, target: 'TREASURE', color: '#00897b', skills: ['STEALTH', 'BACKSTAB'],
    description: 'Rogue Boss-tier — lướt qua tuyến nếu thiếu anti-stealth.',
  },

  // ——— Cung thủ (ARCHER) ———
  {
    id: 'hero_archer_01',
    name: 'Cung Thủ Đồng',
    class: 'ARCHER',
    hp: 180, atk: 52, speed: 2.0, range: 3.6, atkSpeed: 1.15, aoeRadius: 0,
    target: 'TREASURE', color: '#a5d6a7', skills: [],
    description: 'Bắn xa, máu mỏng — áp sát / gap-close.',
  },
  {
    id: 'hero_archer_02',
    name: 'Xạ Thủ Rừng',
    class: 'ARCHER',
    hp: 200, atk: 64, speed: 2.15, range: 3.8, atkSpeed: 1.25, aoeRadius: 0,
    target: 'TREASURE', color: '#66bb6a', skills: [],
    description: 'Tầm rất xa + tốc độ bắn — đừng để kite tự do.',
  },
  {
    id: 'hero_archer_03',
    name: 'Cung Bạc Săn',
    class: 'ARCHER',
    hp: 260, atk: 86, speed: 2.2, range: 4.0, atkSpeed: 1.35, aoeRadius: 0,
    target: 'TREASURE', color: '#43a047', skills: [],
    description: 'Cung thủ trung cấp — ưu tiên chase / silence vùng.',
  },
  {
    id: 'hero_archer_04',
    name: 'Cung Long Tiễn',
    class: 'ARCHER',
    hp: 400, atk: 170, speed: 2.35, range: 4.2, atkSpeed: 1.45, aoeRadius: 0,
    target: 'TREASURE', color: '#2e7d32', skills: [],
    description: 'Elite tầm xa ngang 7 cost — cần gap-close mạnh.',
  },
  {
    id: 'hero_archer_05',
    name: 'Thiên Tiễn Vương',
    class: 'ARCHER',
    hp: 480, atk: 215, speed: 2.4, range: 4.5, atkSpeed: 1.55, aoeRadius: 0,
    target: 'TREASURE', color: '#1b5e20', skills: [],
    description: 'Boss-tier cung — kite toàn map nếu thiếu áp sát.',
  },

  // ——— Thuần tank (TANK) ———
  {
    id: 'hero_tank_01',
    name: 'Khiên Gỗ',
    class: 'TANK',
    hp: 520, atk: 22, speed: 1.35, range: 1.2, atkSpeed: 0.65, aoeRadius: 0,
    target: 'TREASURE', color: '#90a4ae', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'HP cao, dame thấp — khiêu khích + khiên.',
  },
  {
    id: 'hero_tank_02',
    name: 'Thành Đồng',
    class: 'TANK',
    hp: 680, atk: 28, speed: 1.25, range: 1.25, atkSpeed: 0.6, aoeRadius: 0,
    target: 'TREASURE', color: '#78909c', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Tường sống — cần DoT / %HP / Boss.',
  },
  {
    id: 'hero_tank_03',
    name: 'Tháp Sắt',
    class: 'TANK',
    hp: 900, atk: 35, speed: 1.2, range: 1.3, atkSpeed: 0.55, aoeRadius: 0,
    target: 'TREASURE', color: '#607d8b', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Siêu trâu, chậm — đừng đánh tay không.',
  },
  {
    id: 'hero_tank_04',
    name: 'Thành Bastion',
    class: 'TANK',
    hp: 1400, atk: 55, speed: 1.15, range: 1.35, atkSpeed: 0.55, aoeRadius: 0,
    target: 'TREASURE', color: '#455a64', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Elite tank ngang Behemoth — DoT bắt buộc.',
  },
  {
    id: 'hero_tank_05',
    name: 'Pháo Đài Bất Diệt',
    class: 'TANK',
    hp: 1900, atk: 70, speed: 1.1, range: 1.4, atkSpeed: 0.5, aoeRadius: 0,
    target: 'TREASURE', color: '#37474f', skills: ['TAUNT_SELF', 'SHIELD'],
    description: 'Boss-tier thuần tank — wall + healer là ác mộng.',
  },

  // ——— Berserker ———
  {
    id: 'hero_berserker_01',
    name: 'Cuồng Binh',
    class: 'BERSERKER',
    hp: 300, atk: 62, speed: 2.3, range: 1.25, atkSpeed: 1.35, aoeRadius: 0,
    target: 'TREASURE', color: '#ef5350', skills: ['BERSERK'],
    description: 'Máu càng thấp càng mạnh — burst sớm hoặc kite.',
  },
  {
    id: 'hero_berserker_02',
    name: 'Rìu Máu',
    class: 'BERSERKER',
    hp: 340, atk: 72, speed: 2.45, range: 1.3, atkSpeed: 1.4, aoeRadius: 0,
    target: 'TREASURE', color: '#e53935', skills: ['BERSERK'],
    description: 'Rush thẳng — đừng để vào vùng máu đỏ.',
  },
  {
    id: 'hero_berserker_03',
    name: 'Cuồng Chiến',
    class: 'BERSERKER',
    hp: 420, atk: 95, speed: 2.55, range: 1.35, atkSpeed: 1.5, aoeRadius: 0,
    target: 'TREASURE', color: '#c62828', skills: ['BERSERK'],
    description: 'Berserk mạnh khi <50% HP — CC / slow hữu ích.',
  },
  {
    id: 'hero_berserker_04',
    name: 'Huyết Cuồng',
    class: 'BERSERKER',
    hp: 720, atk: 175, speed: 2.7, range: 1.4, atkSpeed: 1.55, aoeRadius: 0,
    target: 'TREASURE', color: '#b71c1c', skills: ['BERSERK'],
    description: 'Elite berserk — càng đánh càng nguy hiểm nếu kéo dài.',
  },
  {
    id: 'hero_berserker_05',
    name: 'Thần Cuồng Hủy',
    class: 'BERSERKER',
    hp: 900, atk: 220, speed: 2.85, range: 1.45, atkSpeed: 1.65, aoeRadius: 0,
    target: 'TREASURE', color: '#880e4f', skills: ['BERSERK'],
    description: 'Boss-tier berserker — burst hoặc chết dưới rìu.',
  },

  // ——— Diệt hồi (HEXER) — giảm heal quái ———
  {
    id: 'hero_hex_01',
    name: 'Lang Y Ô Uế',
    class: 'HEXER',
    hp: 220, atk: 46, speed: 1.9, range: 2.4, atkSpeed: 0.95, aoeRadius: 0,
    target: 'TREASURE', color: '#7e57c2', skills: ['HEAL_CUT'],
    description: 'Aura giảm hồi máu quái — khắc chế heal support.',
  },
  {
    id: 'hero_hex_02',
    name: 'Phù Thủy Vết',
    class: 'HEXER',
    hp: 260, atk: 60, speed: 2.0, range: 2.6, atkSpeed: 1.0, aoeRadius: 0,
    target: 'TREASURE', color: '#5e35b1', skills: ['HEAL_CUT'],
    description: 'Cắt hồi mạnh hơn — ưu tiên đứng gần cụm heal quái.',
  },
  {
    id: 'hero_hex_03',
    name: 'Sứ Giả Chí Mạng',
    class: 'HEXER',
    hp: 360, atk: 85, speed: 2.1, range: 2.8, atkSpeed: 1.05, aoeRadius: 0,
    target: 'TREASURE', color: '#4527a0', skills: ['HEAL_CUT', 'HEAL_CUT_HIT'],
    description: 'Aura + đánh trúng chồng giảm hồi — diệt tuyến heal.',
  },
  {
    id: 'hero_hex_04',
    name: 'Đại Dịch Sứ',
    class: 'HEXER',
    hp: 480, atk: 150, speed: 2.15, range: 3.0, atkSpeed: 1.1, aoeRadius: 0,
    target: 'TREASURE', color: '#311b92', skills: ['HEAL_CUT', 'HEAL_CUT_HIT'],
    description: 'Elite anti-heal — aura rộng, đánh trúng kéo dài vết thương.',
  },
  {
    id: 'hero_hex_05',
    name: 'Chúa Tể Hư Hồi',
    class: 'HEXER',
    hp: 560, atk: 190, speed: 2.2, range: 3.2, atkSpeed: 1.15, aoeRadius: 0,
    target: 'TREASURE', color: '#1a237e', skills: ['HEAL_CUT', 'HEAL_CUT_HIT'],
    description: 'Boss-tier giảm hồi — heal quái gần như tắt trong vùng.',
  },
  {
    id: 'hero_archer_06',
    name: 'Băng Cung',
    class: 'ARCHER',
    hp: 220, atk: 72, speed: 2.1, range: 4.0, atkSpeed: 1.2, aoeRadius: 0,
    target: 'TREASURE', color: '#81d4fa', skills: ['FREEZE', 'FROST_BOLT'],
    description: 'Cung băng đóng mục tiêu — máu mỏng.',
  },
  {
    id: 'hero_mage_08',
    name: 'Hỏa Ấn Sư',
    class: 'MAGE',
    hp: 210, atk: 68, speed: 1.75, range: 3.3, atkSpeed: 0.72, aoeRadius: 1.6,
    target: 'TREASURE', color: '#ff7043', skills: ['AOE_FIRE', 'BURN_ON_HIT'],
    description: 'AoE + đốt DoT — glass cannon.',
  },
  {
    id: 'hero_rogue_08',
    name: 'Độc Ảnh',
    class: 'ROGUE',
    hp: 175, atk: 68, speed: 2.9, range: 1.15, atkSpeed: 1.45, aoeRadius: 0,
    target: 'TREASURE', color: '#9ccc65', stealth: true,
    skills: ['STEALTH', 'POISON_ON_HIT', 'BACKSTAB'],
    description: 'Stealth + độc — HP cực thấp.',
  },
  {
    id: 'hero_tank_06',
    name: 'Lôi Khiên',
    class: 'TANK',
    hp: 1100, atk: 42, speed: 1.15, range: 1.35, atkSpeed: 0.58, aoeRadius: 0,
    target: 'TREASURE', color: '#ffe082', skills: ['TAUNT_SELF', 'SHIELD', 'STUN_ON_HIT'],
    description: 'Tank khiêu khích + choáng ngắn khi đánh.',
  },
  {
    id: 'hero_healer_06',
    name: 'Sương Y',
    class: 'HEALER',
    hp: 300, atk: 30, speed: 1.55, range: 3.1, atkSpeed: 0.8, aoeRadius: 0,
    target: 'TREASURE', color: '#b3e5fc', skills: ['HEAL_ALLY', 'SLOW_AURA_ALLY'],
    description: 'Heal + làm chậm quái gần khi hồi — không tank.',
  },
  {
    id: 'hero_hex_06',
    name: 'Phá Giáp Hex',
    class: 'HEXER',
    hp: 280, atk: 58, speed: 2.0, range: 2.7, atkSpeed: 1.05, aoeRadius: 0,
    target: 'TREASURE', color: '#ff8a65', skills: ['HEAL_CUT', 'DEF_SHRED', 'HEAL_CUT_HIT'],
    description: 'Giảm hồi + phá giáp thay vì máu cao.',
  },
  {
    id: 'hero_archer_07',
    name: 'Cung Xuyên',
    class: 'ARCHER',
    hp: 240, atk: 80, speed: 2.2, range: 4.1, atkSpeed: 1.3, aoeRadius: 0,
    target: 'TREASURE', color: '#ffcc80', skills: ['PIERCE'],
    description: 'Mũi tên xuyên giáp — bỏ qua một phần DEF.',
  },
  {
    id: 'hero_berserker_06',
    name: 'Cuồng Huyết',
    class: 'BERSERKER',
    hp: 380, atk: 88, speed: 2.5, range: 1.3, atkSpeed: 1.45, aoeRadius: 0,
    target: 'TREASURE', color: '#e57373', skills: ['BERSERK', 'LIFESTEAL'],
    description: 'Berserk + hút máu nhẹ khi đánh.',
  },
  {
    id: 'hero_bomber_01',
    name: 'Cảm Tử',
    class: 'BERSERKER',
    hp: 220, atk: 55, speed: 2.4, range: 1.2, atkSpeed: 1.2, aoeRadius: 0,
    target: 'TREASURE', color: '#ff7043', skills: ['SELF_DESTRUCT', 'BERSERK'],
    description: 'Khi chết nổ gây sát thương quanh — cảm tử.',
  },
  {
    id: 'hero_phoenix_01',
    name: 'Phượng Y',
    class: 'HEALER',
    hp: 340, atk: 36, speed: 1.5, range: 3.0, atkSpeed: 0.85, aoeRadius: 0,
    target: 'TREASURE', color: '#ffcc80', skills: ['HEAL_ALLY', 'REVIVE', 'SHIELD'],
    description: 'Healer sống lại 1 lần — khó hạ hẳn trong một đợt.',
  },
  {
    id: 'hero_shatter_01',
    name: 'Phá Khiên Sĩ',
    class: 'WARRIOR',
    hp: 520, atk: 72, speed: 1.7, range: 1.4, atkSpeed: 1.05, aoeRadius: 0,
    target: 'TREASURE', color: '#4fc3f7', skills: ['SHIELD_BREAK', 'SHIELD'],
    description: 'Phá lớp khiên quái + tự có khiên phòng thân.',
  },
  {
    id: 'hero_hex_07',
    name: 'Phá Khiên Hex',
    class: 'HEXER',
    hp: 300, atk: 62, speed: 2.0, range: 2.8, atkSpeed: 1.1, aoeRadius: 0,
    target: 'TREASURE', color: '#81d4fa', skills: ['HEAL_CUT', 'SHIELD_BREAK', 'HEAL_CUT_HIT'],
    description: 'Cắt hồi + phá khiên — khắc tank có khiên và healer.',
  },
  {
    id: 'hero_rogue_09',
    name: 'Bóng Nổ',
    class: 'ROGUE',
    hp: 190, atk: 70, speed: 2.85, range: 1.2, atkSpeed: 1.4, aoeRadius: 0,
    target: 'TREASURE', color: '#ab47bc', stealth: true,
    skills: ['STEALTH', 'BACKSTAB', 'SELF_DESTRUCT'],
    description: 'Tàng hình áp sát — chết cũng nổ.',
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
    theme: 'Bát bộ tiên phong',
    tip: 'Ải 40 — đủ 8 class + utility mới (bomber/phoenix/shatter). Wave sau chỉ vào khi đợt trước hết.',
    waves: [
      { delay: 0.4, ids: ['hero_warrior_10', 'hero_healer_04', 'hero_hex_03', 'hero_archer_04', 'hero_bomber_01'] },
      { delay: 11, ids: ['hero_tank_04', 'hero_mage_07', 'hero_rogue_06', 'hero_berserker_04', 'hero_shatter_01'] },
      { delay: 22, ids: ['hero_healer_05', 'hero_hex_04', 'hero_archer_05', 'hero_phoenix_01', 'hero_warrior_11'] },
      { delay: 34, ids: ['hero_mage_06', 'hero_berserker_05', 'hero_rogue_07', 'hero_tank_05', 'hero_hex_07', 'hero_mage_08'] },
    ],
  },

  // ——— Ải 41–50: mỗi ải nhấn 1–2 class ———
  41: {
    theme: 'Pháp trận hỗn mang',
    tip: 'Nhấn Mage + Hexer — Silence / anti-heal / áp sát.',
    waves: [
      { delay: 0.4, ids: ['hero_mage_06', 'hero_mage_07', 'hero_mage_08', 'hero_hex_03'] },
      { delay: 12, ids: ['hero_hex_04', 'hero_healer_04', 'hero_mage_07', 'hero_archer_04'] },
      { delay: 24, ids: ['hero_mage_07', 'hero_hex_05', 'hero_tank_04', 'hero_warrior_10', 'hero_healer_05'] },
    ],
  },
  42: {
    theme: 'Mưa tiễn',
    tip: 'Nhấn Cung thủ — gap-close / rush; có healer giữ tuyến.',
    waves: [
      { delay: 0.35, ids: ['hero_archer_04', 'hero_archer_05', 'hero_rogue_06'] },
      { delay: 11, ids: ['hero_archer_06', 'hero_healer_06', 'hero_hex_06', 'hero_mage_06'] },
      { delay: 22, ids: ['hero_archer_05', 'hero_archer_04', 'hero_tank_04', 'hero_berserker_04', 'hero_healer_04'] },
    ],
  },
  43: {
    theme: 'Thành bất khả xâm',
    tip: 'Nhấn Thuần tank + Healer — Boss/DoT/%HP.',
    waves: [
      { delay: 0.5, ids: ['hero_tank_05', 'hero_tank_04', 'hero_healer_05'] },
      { delay: 13, ids: ['hero_tank_05', 'hero_warrior_11', 'hero_healer_04', 'hero_hex_04'] },
      { delay: 26, ids: ['hero_tank_05', 'hero_healer_05', 'hero_mage_07', 'hero_archer_04', 'hero_rogue_07'] },
    ],
  },
  44: {
    theme: 'Cuồng huyết',
    tip: 'Nhấn Berserker — burst sớm; hexer cắt hồi nếu kéo dài.',
    waves: [
      { delay: 0.35, ids: ['hero_berserker_04', 'hero_berserker_05', 'hero_rogue_06'] },
      { delay: 10, ids: ['hero_berserker_05', 'hero_healer_04', 'hero_hex_04', 'hero_warrior_10'] },
      { delay: 21, ids: ['hero_berserker_05', 'hero_tank_04', 'hero_healer_05', 'hero_archer_05', 'hero_hex_03'] },
    ],
  },
  45: {
    theme: 'Đêm sát thủ tối',
    tip: 'Nhấn Rogue + Hexer — Mắt thần + anti-heal.',
    waves: [
      { delay: 0.35, ids: ['hero_rogue_06', 'hero_rogue_07', 'hero_hex_04'] },
      { delay: 10, ids: ['hero_rogue_07', 'hero_healer_05', 'hero_archer_04', 'hero_hex_05'] },
      { delay: 20, ids: ['hero_rogue_06', 'hero_berserker_04', 'hero_tank_04', 'hero_mage_07'] },
      { delay: 32, ids: ['hero_rogue_07', 'hero_hex_05', 'hero_healer_05', 'hero_warrior_11', 'hero_archer_05'] },
    ],
  },
  46: {
    theme: 'Thập tự quân cuối',
    tip: 'Nhấn Warrior + Healer — wall dày, hạ healer trước.',
    waves: [
      { delay: 0.4, ids: ['hero_warrior_09', 'hero_warrior_10', 'hero_healer_05'] },
      { delay: 11, ids: ['hero_warrior_11', 'hero_healer_04', 'hero_hex_04', 'hero_tank_04'] },
      { delay: 22, ids: ['hero_warrior_10', 'hero_warrior_11', 'hero_healer_05', 'hero_mage_07', 'hero_archer_04'] },
      { delay: 34, ids: ['hero_warrior_11', 'hero_tank_05', 'hero_healer_05', 'hero_berserker_04', 'hero_rogue_07'] },
    ],
  },
  47: {
    theme: 'Diệt hồi tuyệt đối',
    tip: 'Nhấn Hexer — heal quái yếu; vẫn cần burst tank/berserk.',
    waves: [
      { delay: 0.35, ids: ['hero_hex_04', 'hero_hex_05', 'hero_mage_06'] },
      { delay: 10, ids: ['hero_hex_05', 'hero_healer_05', 'hero_tank_04', 'hero_archer_05'] },
      { delay: 20, ids: ['hero_hex_04', 'hero_berserker_05', 'hero_warrior_10', 'hero_rogue_07'] },
      { delay: 31, ids: ['hero_hex_05', 'hero_hex_04', 'hero_tank_05', 'hero_healer_05', 'hero_mage_07', 'hero_archer_04'] },
    ],
  },
  48: {
    theme: 'Thiên tiễn & thánh',
    tip: 'Cung + Healer + Mage — kite xa; gap-close bắt buộc.',
    waves: [
      { delay: 0.35, ids: ['hero_archer_05', 'hero_mage_07', 'hero_healer_05'] },
      { delay: 11, ids: ['hero_archer_05', 'hero_hex_04', 'hero_healer_04', 'hero_tank_04'] },
      { delay: 22, ids: ['hero_mage_07', 'hero_archer_04', 'hero_healer_05', 'hero_warrior_11', 'hero_rogue_06'] },
      { delay: 34, ids: ['hero_archer_05', 'hero_mage_06', 'hero_healer_05', 'hero_hex_05', 'hero_berserker_04'] },
    ],
  },
  49: {
    theme: 'Đêm trước tận thế III',
    tip: '4 wave xoay class — đọc đội hình từng đợt.',
    waves: [
      { delay: 0.3, ids: ['hero_rogue_07', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 9, ids: ['hero_tank_05', 'hero_healer_05', 'hero_mage_07', 'hero_berserker_04'] },
      { delay: 18, ids: ['hero_warrior_11', 'hero_hex_05', 'hero_archer_05', 'hero_healer_04', 'hero_rogue_06'] },
      { delay: 28, ids: ['hero_berserker_05', 'hero_tank_05', 'hero_mage_07', 'hero_healer_05', 'hero_hex_05', 'hero_archer_05'] },
    ],
  },
  50: {
    theme: 'Ngai hỗn mang tối thượng',
    tip: 'Ải 50 — đủ 8 class Boss-tier. Phá đảo nửa đường.',
    waves: [
      { delay: 0.3, ids: ['hero_warrior_11', 'hero_hex_05', 'hero_archer_05', 'hero_healer_05', 'hero_bomber_01'] },
      { delay: 10, ids: ['hero_tank_05', 'hero_mage_07', 'hero_rogue_07', 'hero_berserker_05', 'hero_shatter_01'] },
      { delay: 20, ids: ['hero_healer_05', 'hero_archer_05', 'hero_phoenix_01', 'hero_warrior_10', 'hero_hex_05', 'hero_mage_08'] },
      { delay: 32, ids: ['hero_berserker_05', 'hero_rogue_09', 'hero_tank_05', 'hero_hex_07', 'hero_archer_06', 'hero_mage_07', 'hero_warrior_11'] },
    ],
  },

  // ——— Ải 51–60: endgame — map rộng, đa dạng class ———
  51: {
    theme: 'Pháo đài tự hủy',
    tip: 'Bomber + Berserk rush — giữ tank/hexer cho đợt 2.',
    waves: [
      { delay: 0.35, ids: ['hero_bomber_01', 'hero_berserker_04', 'hero_rogue_06', 'hero_archer_04'] },
      { delay: 11, ids: ['hero_tank_04', 'hero_healer_04', 'hero_hex_04', 'hero_warrior_10', 'hero_mage_06'] },
      { delay: 23, ids: ['hero_bomber_01', 'hero_berserker_05', 'hero_shatter_01', 'hero_healer_05', 'hero_rogue_07'] },
    ],
  },
  52: {
    theme: 'Hồi sinh bất tử',
    tip: 'Phoenix + Healer dày — burst trước khi hồi lần 2.',
    waves: [
      { delay: 0.4, ids: ['hero_phoenix_01', 'hero_healer_04', 'hero_tank_03', 'hero_mage_06'] },
      { delay: 12, ids: ['hero_phoenix_01', 'hero_healer_05', 'hero_warrior_11', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 24, ids: ['hero_healer_05', 'hero_tank_05', 'hero_phoenix_01', 'hero_berserker_04', 'hero_mage_07', 'hero_hex_05'] },
    ],
  },
  53: {
    theme: 'Phá khiên tuyệt đối',
    tip: 'Shatter + Mage pierce — tank địch có shield dày.',
    waves: [
      { delay: 0.35, ids: ['hero_shatter_01', 'hero_mage_07', 'hero_mage_08', 'hero_archer_04'] },
      { delay: 11, ids: ['hero_tank_05', 'hero_shatter_01', 'hero_warrior_10', 'hero_healer_04', 'hero_hex_03'] },
      { delay: 22, ids: ['hero_shatter_01', 'hero_tank_04', 'hero_berserker_05', 'hero_mage_06', 'hero_rogue_09'] },
      { delay: 34, ids: ['hero_tank_05', 'hero_shatter_01', 'hero_hex_07', 'hero_healer_05', 'hero_archer_05', 'hero_mage_07'] },
    ],
  },
  54: {
    theme: 'Đêm tàng hình II',
    tip: 'Rogue stealth + Hexer — Mắt thần + anti-heal bắt buộc.',
    waves: [
      { delay: 0.35, ids: ['hero_rogue_09', 'hero_rogue_07', 'hero_rogue_06', 'hero_hex_04'] },
      { delay: 10, ids: ['hero_rogue_08', 'hero_hex_05', 'hero_healer_05', 'hero_archer_04', 'hero_mage_06'] },
      { delay: 21, ids: ['hero_rogue_09', 'hero_berserker_04', 'hero_hex_07', 'hero_tank_04', 'hero_mage_08'] },
      { delay: 32, ids: ['hero_rogue_07', 'hero_hex_05', 'hero_archer_05', 'hero_healer_05', 'hero_warrior_11', 'hero_rogue_06'] },
    ],
  },
  55: {
    theme: 'Thiên tiễn cuồng phong',
    tip: 'Toàn Cung + Healer kite — gap-close hoặc silence.',
    waves: [
      { delay: 0.35, ids: ['hero_archer_04', 'hero_archer_05', 'hero_archer_06', 'hero_healer_04'] },
      { delay: 10, ids: ['hero_archer_05', 'hero_mage_07', 'hero_healer_05', 'hero_hex_06', 'hero_tank_04'] },
      { delay: 20, ids: ['hero_archer_06', 'hero_healer_05', 'hero_mage_08', 'hero_berserker_04', 'hero_hex_04'] },
      { delay: 31, ids: ['hero_archer_05', 'hero_archer_06', 'hero_healer_05', 'hero_tank_05', 'hero_mage_07', 'hero_hex_05'] },
    ],
  },
  56: {
    theme: 'Hỗn mang nguyên tố',
    tip: 'Mage đa element + Warrior wall — DoT và Silence.',
    waves: [
      { delay: 0.35, ids: ['hero_mage_06', 'hero_mage_07', 'hero_mage_08', 'hero_warrior_10'] },
      { delay: 10, ids: ['hero_mage_07', 'hero_healer_04', 'hero_warrior_11', 'hero_hex_04', 'hero_archer_04'] },
      { delay: 20, ids: ['hero_mage_08', 'hero_berserker_05', 'hero_tank_04', 'hero_hex_05', 'hero_healer_05'] },
      { delay: 30, ids: ['hero_mage_07', 'hero_mage_06', 'hero_warrior_11', 'hero_healer_05', 'hero_rogue_07', 'hero_hex_07'] },
    ],
  },
  57: {
    theme: 'Thành trì tuyệt đối',
    tip: 'Tank + Healer siêu dày — mang %HP / DoT / phá khiên.',
    waves: [
      { delay: 0.4, ids: ['hero_tank_05', 'hero_tank_04', 'hero_healer_05', 'hero_hex_04'] },
      { delay: 12, ids: ['hero_tank_05', 'hero_healer_04', 'hero_warrior_11', 'hero_shatter_01', 'hero_mage_06'] },
      { delay: 24, ids: ['hero_tank_05', 'hero_healer_05', 'hero_phoenix_01', 'hero_hex_05', 'hero_archer_05', 'hero_berserker_04'] },
      { delay: 36, ids: ['hero_tank_05', 'hero_tank_04', 'hero_healer_05', 'hero_warrior_10', 'hero_hex_07', 'hero_mage_07'] },
    ],
  },
  58: {
    theme: 'Cuồng chiến tận thế',
    tip: 'Berserker + Bomber — burst sớm hoặc bị cuốn.',
    waves: [
      { delay: 0.3, ids: ['hero_berserker_04', 'hero_berserker_05', 'hero_bomber_01', 'hero_rogue_06'] },
      { delay: 9, ids: ['hero_berserker_05', 'hero_healer_04', 'hero_hex_04', 'hero_warrior_10', 'hero_archer_04'] },
      { delay: 18, ids: ['hero_berserker_05', 'hero_bomber_01', 'hero_tank_04', 'hero_healer_05', 'hero_mage_07'] },
      { delay: 28, ids: ['hero_berserker_05', 'hero_rogue_09', 'hero_hex_05', 'hero_archer_05', 'hero_phoenix_01', 'hero_shatter_01'] },
    ],
  },
  59: {
    theme: 'Tứ đại thiên vương',
    tip: '4 wave full elite — đọc từng đợt, giữ spell cuối.',
    waves: [
      { delay: 0.3, ids: ['hero_warrior_11', 'hero_mage_08', 'hero_rogue_09', 'hero_hex_05'] },
      { delay: 9, ids: ['hero_tank_05', 'hero_healer_05', 'hero_archer_06', 'hero_berserker_05', 'hero_shatter_01'] },
      { delay: 18, ids: ['hero_phoenix_01', 'hero_bomber_01', 'hero_hex_07', 'hero_mage_07', 'hero_warrior_10', 'hero_healer_04'] },
      { delay: 28, ids: ['hero_tank_05', 'hero_archer_05', 'hero_berserker_05', 'hero_rogue_07', 'hero_healer_05', 'hero_mage_08', 'hero_hex_05'] },
    ],
  },
  60: {
    theme: 'Vương quốc tàn lửa',
    tip: 'Ải 60 — phá đảo. Mọi class + mọi utility. Wave sau chỉ vào khi đợt trước hết.',
    waves: [
      { delay: 0.25, ids: ['hero_warrior_11', 'hero_hex_05', 'hero_archer_06', 'hero_healer_05', 'hero_bomber_01'] },
      { delay: 9, ids: ['hero_tank_05', 'hero_mage_08', 'hero_rogue_09', 'hero_berserker_05', 'hero_shatter_01', 'hero_phoenix_01'] },
      { delay: 18, ids: ['hero_healer_05', 'hero_archer_05', 'hero_hex_07', 'hero_warrior_10', 'hero_mage_07', 'hero_tank_04'] },
      { delay: 28, ids: ['hero_berserker_05', 'hero_rogue_07', 'hero_phoenix_01', 'hero_bomber_01', 'hero_shatter_01', 'hero_hex_05', 'hero_archer_06', 'hero_mage_08', 'hero_warrior_11', 'hero_tank_05', 'hero_healer_05'] },
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
            : template.class === 'HEALER'
              ? 'Hỗ trợ / hồi máu'
              : template.class === 'MAGE' || template.class === 'ARCHER'
                ? 'Tuyến sau / tầm xa'
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
    if (h.class === 'WARRIOR' || h.class === 'TANK') g = pickSpread(centerFirst);
    else if (h.class === 'ROGUE' || h.class === 'BERSERKER') g = pickSpread(edgeFirst);
    else g = pickSpread(gates);

    h.formation = {
      order: i + 1,
      roleLine:
        h.class === 'WARRIOR' || h.class === 'TANK'
          ? 'Tuyến trước'
          : h.class === 'BERSERKER'
            ? 'Rush / cuồng chiến'
            : h.class === 'HEXER'
              ? 'Diệt hồi / giảm heal'
              : h.class === 'HEALER'
                ? 'Hỗ trợ / hồi máu'
                : h.class === 'MAGE' || h.class === 'ARCHER'
                  ? 'Tuyến sau / tầm xa'
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
