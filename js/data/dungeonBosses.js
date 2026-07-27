import { SPELLS } from './constants.js?v=83';

/**
 * Boss hầm ngục — mỗi boss = 2 skill passive của “Sếp Tổng”.
 * frostblood = bộ mặc định cũ (Sương Chậm + Huyết Ấn).
 */
export const DUNGEON_BOSSES = [
  {
    id: 'frostblood',
    name: 'Huyết Sương',
    title: 'Sếp Sương Máu',
    color: '#5b8fa8',
    blurb: 'Kiểm soát nhịp Hero + hồi máu đội quái.',
    unlock: { type: 'start' },
    spells: ['slow_wave', 'heal_monsters'],
  },
  {
    id: 'ironward',
    name: 'Thiết Thủ',
    title: 'Sếp Khiên Đá',
    color: '#8a7355',
    blurb: 'Bảo vệ kho báu và đẩy Hero về cổng.',
    unlock: { type: 'wins', value: 3 },
    spells: ['treasure_ward', 'knock_back'],
  },
  {
    id: 'plaguelord',
    name: 'Dịch Chủ',
    title: 'Sếp Đầm Độc',
    color: '#4a7a4a',
    blurb: 'Độc lan Hero + tăng ATK quái.',
    unlock: { type: 'wins', value: 8 },
    spells: ['poison_mire', 'war_drum'],
  },
  {
    id: 'shadowseer',
    name: 'Ảnh Nhãn',
    title: 'Sếp Mắt Bóng',
    color: '#6b4a7a',
    blurb: 'Phá tàng hình / silence + choáng diện rộng.',
    unlock: { type: 'level', value: 10 },
    spells: ['eye_flare', 'quake_stun'],
  },
  {
    id: 'embercrown',
    name: 'Vương Miện Lửa',
    title: 'Sếp Hỏa Ấn',
    color: '#b84f2a',
    blurb: 'Ép nhịp giao tranh bằng công mạnh + hất lùi phòng tuyến.',
    unlock: { type: 'level', value: 15 },
    spells: ['war_drum', 'knock_back'],
  },
  {
    id: 'graveveil',
    name: 'Màn Mộ',
    title: 'Sếp Huyết Hồn',
    color: '#7b6ba8',
    blurb: 'Hồi bầy quái và che nhịp tiếp cận bằng sương chậm.',
    unlock: { type: 'level', value: 20 },
    spells: ['heal_monsters', 'slow_wave'],
  },
  {
    id: 'bogoracle',
    name: 'Tiên Tri Đầm',
    title: 'Sếp Độc Nhãn',
    color: '#557c46',
    blurb: 'Độc diện rộng + soi tàng hình, khắc đội ẩn nấp.',
    unlock: { type: 'level', value: 30 },
    spells: ['poison_mire', 'eye_flare'],
  },
  {
    id: 'citadelcore',
    name: 'Lõi Thành',
    title: 'Sếp Thành Khiên',
    color: '#6a645d',
    blurb: 'Giữ kho cực lì: khiên kho + hồi bầy quái.',
    unlock: { type: 'level', value: 40 },
    spells: ['treasure_ward', 'heal_monsters'],
  },
  {
    id: 'cataclysm',
    name: 'Tai Kiếp',
    title: 'Sếp Tận Thế',
    color: '#a13d54',
    blurb: 'Bộ boss muộn game: tăng công + choáng diện rộng.',
    unlock: { type: 'level', value: 50 },
    spells: ['war_drum', 'quake_stun'],
  },
];

export const DUNGEON_BOSS_BY_ID = Object.fromEntries(
  DUNGEON_BOSSES.map((b) => [b.id, b])
);

export const DEFAULT_BOSS_ID = 'frostblood';

export function getBoss(bossId) {
  return DUNGEON_BOSS_BY_ID[bossId] || DUNGEON_BOSS_BY_ID[DEFAULT_BOSS_ID];
}

export function bossSpells(bossId) {
  const boss = getBoss(bossId);
  return (boss.spells || []).map((id) => SPELLS[id]).filter(Boolean);
}

export function isBossUnlocked(boss, state) {
  if ((state.unlockedBosses || []).includes(boss.id)) return true;
  const u = boss.unlock || { type: 'start' };
  if (u.type === 'start') return true;
  if (u.type === 'wins') return (state.stats?.wins || 0) >= u.value;
  if (u.type === 'level') return (state.dungeonLevel || 1) >= u.value;
  return false;
}

export function unlockHint(boss) {
  const u = boss.unlock || {};
  if (u.type === 'wins') return `Mở khi thắng ${u.value} ải`;
  if (u.type === 'level') return `Mở khi đạt ải ${u.value}`;
  return 'Đã mở';
}

/** Đồng bộ danh sách boss đã mở theo tiến độ */
export function syncUnlockedBosses(state) {
  const set = new Set(state.unlockedBosses || [DEFAULT_BOSS_ID]);
  set.add(DEFAULT_BOSS_ID);
  for (const b of DUNGEON_BOSSES) {
    if (isBossUnlocked(b, state)) set.add(b.id);
  }
  state.unlockedBosses = [...set];
  if (!state.selectedBossId || !set.has(state.selectedBossId)) {
    state.selectedBossId = DEFAULT_BOSS_ID;
  }
  return state.unlockedBosses;
}
