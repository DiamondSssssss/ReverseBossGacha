/** Achievement definitions — clear goals toward "clearing" the game */

import { MAP_UPGRADE } from './constants.js?v=84';

/**
 * Tăng khi đổi bảng Gem ấn — load save sẽ cộng phần chênh cho ấn đã mở.
 * Gem chỉ từ ấn (không thưởng Gem mỗi thắng ải).
 */
export const ACHIEVEMENT_GEM_REVISION = 3;

/** Gem đã trả trước revision 3 (để backfill phần tăng). Ấn mới / không có = 0. */
export const ACHIEVEMENT_GEMS_BEFORE_REV = {
  first_win: 1,
  wins_5: 1,
  wins_15: 2,
  reach_level_10: 3,
  reach_level_20: 5,
  reach_level_30: 8,
  reach_level_45: 12,
  clear_game: 15,
  clear_40: 10,
  wins_30: 8,
  own_all: 5,
  own_legendary: 1,
  own_mythic: 3,
  pulls_50: 1,
  mythic_pity_hit: 2,
  max_one_room: 2,
  master_collector: 20,
};

export const ACHIEVEMENTS = [
  // —— Onboarding / first steps ——
  {
    id: 'first_steps',
    title: 'Sếp Tập Sự',
    desc: 'Hoàn thành hướng dẫn lần đầu.',
    icon: '📜',
    category: 'story',
    reward: {},
    check: (s) => !!s.tutorialDone,
  },
  {
    id: 'first_win',
    title: 'Bảo Vệ Thành Công',
    desc: 'Thắng ải đầu tiên.',
    icon: '🛡️',
    category: 'combat',
    reward: { souls: 100, gold: 50, gems: 5 },
    check: (s) => (s.stats?.wins || 0) >= 1,
  },
  {
    id: 'first_pull',
    title: 'Tay Quay Mới',
    desc: 'Quay Gacha lần đầu.',
    icon: '🎲',
    category: 'gacha',
    reward: { souls: 50, gems: 2 },
    check: (s) => (s.stats?.pulls || 0) >= 1,
  },

  // —— Combat progression ——
  {
    id: 'wins_5',
    title: 'Canh Giữ',
    desc: 'Thắng 5 ải.',
    icon: '⚔️',
    category: 'combat',
    reward: { souls: 150, gold: 80, gems: 8 },
    check: (s) => (s.stats?.wins || 0) >= 5,
  },
  {
    id: 'wins_15',
    title: 'Hầm Ngục Bất Khả Xâm',
    desc: 'Thắng 15 ải.',
    icon: '🏰',
    category: 'combat',
    reward: { souls: 300, gold: 150, gems: 15 },
    check: (s) => (s.stats?.wins || 0) >= 15,
  },
  {
    id: 'wins_30',
    title: 'Thành Trì Bất Khả',
    desc: 'Thắng tổng 30 ải.',
    icon: '🏯',
    category: 'combat',
    reward: { souls: 500, gold: 250, gems: 20 },
    check: (s) => (s.stats?.wins || 0) >= 30,
  },
  {
    id: 'reach_level_5',
    title: 'Ải Số 5',
    desc: 'Đạt ải cấp 5.',
    icon: '5️⃣',
    category: 'combat',
    reward: { souls: 200, gold: 100, gems: 10 },
    check: (s) => (s.dungeonLevel || 1) >= 5,
  },
  {
    id: 'reach_level_10',
    title: 'Ải Số 10',
    desc: 'Đạt ải cấp 10.',
    icon: '🔟',
    category: 'combat',
    reward: { souls: 400, gold: 200, gems: 20 },
    check: (s) => (s.dungeonLevel || 1) >= 10,
  },
  {
    id: 'reach_level_20',
    title: 'Ải Số 20',
    desc: 'Vượt ải 20 — cửa ngõ địa ngục.',
    icon: '⚔',
    category: 'combat',
    reward: { souls: 600, gold: 300, gems: 30 },
    check: (s) => (s.dungeonLevel || 1) > 20,
  },
  {
    id: 'reach_level_30',
    title: 'Ải Số 30',
    desc: 'Vượt ải 30 — cửa ngõ elite.',
    icon: '🛡',
    category: 'combat',
    reward: { souls: 800, gold: 400, gems: 40 },
    check: (s) => (s.dungeonLevel || 1) > 30,
  },
  {
    id: 'clear_40',
    title: 'Ngai Tối Thượng',
    desc: 'Thắng ải 40 — bước vào hành trình hỗn mang.',
    icon: '⚔',
    category: 'combat',
    reward: { souls: 600, gold: 300, gems: 45 },
    check: (s) => (s.dungeonLevel || 1) > 40,
  },
  {
    id: 'reach_level_45',
    title: 'Ải Số 45',
    desc: 'Vượt ải 45 — gần phá đảo.',
    icon: '🔥',
    category: 'combat',
    reward: { souls: 900, gold: 450, gems: 35 },
    check: (s) => (s.dungeonLevel || 1) > 45,
  },
  {
    id: 'clear_game',
    title: 'Phá Đảo Hầm Ngục',
    desc: 'Thắng ải 60 — phá đảo chế độ chính.',
    icon: '👑',
    category: 'story',
    reward: { souls: 1000, gold: 500, gems: 50 },
    check: (s) => (s.dungeonLevel || 1) > 60,
  },
  {
    id: 'reach_level_55',
    title: 'Ải Số 55',
    desc: 'Vượt ải 55 — sát núi tận thế.',
    icon: '💀',
    category: 'combat',
    reward: { souls: 1200, gold: 600, gems: 40 },
    check: (s) => (s.dungeonLevel || 1) > 55,
  },

  // —— Collection ——
  {
    id: 'own_10_types',
    title: 'Sưu Tầm Viên',
    desc: 'Sở hữu ít nhất 10 loại quái khác nhau.',
    icon: '📦',
    category: 'collect',
    reward: { souls: 200, gold: 100, gems: 5 },
    check: (s) => Object.keys(s.inventory || {}).filter((id) => (s.inventory[id] || 0) > 0).length >= 10,
  },
  {
    id: 'own_all',
    title: 'Bách Quái Đồ Giám',
    desc: 'Sưu tầm đủ toàn bộ catalog quái.',
    icon: '📖',
    category: 'collect',
    reward: { souls: 800, gold: 400, gems: 15 },
    check: (s, ctx) => {
      const total = ctx?.monsterCount || 14;
      const owned = new Set([
        ...Object.keys(s.inventory || {}).filter((id) => (s.inventory[id] || 0) > 0),
        ...(s.ownedEver || []),
      ]);
      return owned.size >= total;
    },
  },
  {
    id: 'own_legendary',
    title: 'Boss Về Tay',
    desc: 'Sở hữu ít nhất 1 quái 5★.',
    icon: '🐉',
    category: 'collect',
    reward: { souls: 250, gold: 120, gems: 5 },
    check: (s, ctx) => {
      const legendIds = ctx?.legendaryIds || [];
      return legendIds.some((id) => (s.inventory?.[id] || 0) > 0 || (s.ownedEver || []).includes(id));
    },
  },
  {
    id: 'own_mythic',
    title: 'Ấn Mythic',
    desc: 'Sở hữu ít nhất 1 quái Mythic 6★.',
    icon: '🩸',
    category: 'collect',
    reward: { souls: 500, gold: 250, gems: 10 },
    check: (s, ctx) => {
      const ids = ctx?.mythicIds || [];
      return ids.some((id) => (s.inventory?.[id] || 0) > 0 || (s.ownedEver || []).includes(id));
    },
  },

  // —— Gacha ——
  {
    id: 'pulls_50',
    title: 'Nghiện Quay',
    desc: 'Quay Gacha tổng 50 lần.',
    icon: '🎰',
    category: 'gacha',
    reward: { souls: 200, gems: 5 },
    check: (s) => (s.stats?.pulls || 0) >= 50,
  },
  {
    id: 'pity_hit',
    title: 'Bảo Hiểm Kích Hoạt',
    desc: 'Nhận Boss nhờ hệ Pity.',
    icon: '✨',
    category: 'gacha',
    reward: { souls: 150, gold: 80, gems: 3 },
    check: (s) => !!s.stats?.pityHits,
  },
  {
    id: 'mythic_pity_hit',
    title: 'Mythic Bảo Hiểm',
    desc: 'Nhận Mythic nhờ pity 100.',
    icon: '🔮',
    category: 'gacha',
    reward: { souls: 400, gold: 200, gems: 8 },
    check: (s) => !!s.stats?.mythicPityHits,
  },

  // —— Meta / rooms ——
  {
    id: 'upgrade_room',
    title: 'Thợ Cải Tạo',
    desc: 'Nâng cấp hầm (Cost map) 1 lần bằng Gem.',
    icon: '🔧',
    category: 'meta',
    reward: { gold: 50, souls: 50, gems: 2 },
    check: (s) => (s.mapUpgrade || 0) >= 1 || Object.values(s.roomUpgrades || {}).some((lv) => lv >= 1),
  },
  {
    id: 'max_one_room',
    title: 'Hầm Siêu Cấp',
    desc: 'Nâng Cost map lên cấp tối đa.',
    icon: '🏗️',
    category: 'meta',
    reward: { gold: 200, souls: 100, gems: 5 },
    check: (s) =>
      (s.mapUpgrade || 0) >= MAP_UPGRADE.MAX_LEVEL ||
      Object.values(s.roomUpgrades || {}).some((lv) => lv >= MAP_UPGRADE.MAX_LEVEL),
  },
  {
    id: 'use_spell',
    title: 'Phép Sếp Tổng',
    desc: 'Dùng phép hỗ trợ trong chiến đấu.',
    icon: '🪄',
    category: 'combat',
    reward: { souls: 80, gems: 2 },
    check: (s) => !!s.stats?.spellsCast,
  },

  // —— Mastery ——
  {
    id: 'master_collector',
    title: 'Sếp Tổng Hoàn Mỹ',
    desc: 'Phá đảo (ải 60) + sưu tầm đủ catalog.',
    icon: '💎',
    category: 'story',
    reward: { souls: 2000, gold: 1000, gems: 25 },
    check: (s, ctx) => {
      const total = ctx?.monsterCount || 14;
      const owned = new Set([
        ...Object.keys(s.inventory || {}).filter((id) => (s.inventory[id] || 0) > 0),
        ...(s.ownedEver || []),
      ]);
      return (s.dungeonLevel || 1) > 60 && owned.size >= total;
    },
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const CATEGORY_LABELS = {
  story: 'Cốt truyện',
  combat: 'Chiến đấu',
  collect: 'Sưu tầm',
  gacha: 'Gacha',
  meta: 'Xây dựng',
};

/**
 * Cộng Gem chênh lệch khi tăng thưởng ấn (cho người đã mở ấn trước đó).
 * @returns {number} số Gem vừa cộng
 */
export function backfillAchievementGems(state) {
  const rev = Number(state.achievementGemRev) || 0;
  if (rev >= ACHIEVEMENT_GEM_REVISION) return 0;

  let grant = 0;
  for (const ach of ACHIEVEMENTS) {
    if (!state.achievements?.[ach.id]?.unlocked) continue;
    const neu = Number(ach.reward?.gems) || 0;
    const old = Number(ACHIEVEMENT_GEMS_BEFORE_REV[ach.id]) || 0;
    grant += Math.max(0, neu - old);
  }

  if (grant > 0) {
    state.gems = (Number(state.gems) || 0) + grant;
  }
  state.achievementGemRev = ACHIEVEMENT_GEM_REVISION;
  return grant;
}
