import { COMBAT } from './constants.js?v=135';
import { HERO_BY_ID, WAVE_PLANS, heroScaleForLevel } from './heroes.js?v=135';

const HARD_BOSS_BY_LEVEL = {
  5: 'hero_boss_05',
  10: 'hero_boss_10',
  15: 'hero_boss_15',
  20: 'hero_boss_20',
  25: 'hero_boss_25',
  30: 'hero_boss_30',
  35: 'hero_boss_35',
  40: 'hero_boss_40',
  45: 'hero_boss_45',
  50: 'hero_boss_50',
  55: 'hero_boss_55',
  60: 'hero_boss_60',
};

const TAGS = {
  fortress: {
    label: 'khóa cửa',
    tip: 'Tank/warrior đi đầu để mở đường buff Hero; cần DoT, phá khiên, anti-heal.',
    pool: [
      'hero_warrior_04',
      'hero_warrior_07',
      'hero_warrior_09',
      'hero_warrior_10',
      'hero_warrior_11',
      'hero_tank_03',
      'hero_tank_04',
      'hero_tank_05',
      'hero_shatter_01',
    ],
  },
  sustain: {
    label: 'câu kéo',
    tip: 'Có healer/stasis/phoenix kéo dài giao tranh; anti-heal và burst đúng nhịp rất quan trọng.',
    pool: [
      'hero_healer_04',
      'hero_healer_05',
      'hero_healer_06',
      'hero_support_01',
      'hero_support_02',
      'hero_support_04',
      'hero_phoenix_01',
      'hero_stasis_01',
      'hero_stasis_02',
      'hero_stasis_03',
    ],
  },
  magic: {
    label: 'vùng phép',
    tip: 'Mage tận dụng địa hình rất mạnh; silence, áp sát và chia lane để giảm AoE.',
    pool: [
      'hero_mage_05',
      'hero_mage_06',
      'hero_mage_07',
      'hero_mage_08',
      'hero_archer_06',
      'hero_hex_04',
      'hero_hex_05',
    ],
  },
  stealth: {
    label: 'đột nhập',
    tip: 'Stealth/rush ăn buff sớm nếu thủng tuyến; cần reveal, taunt và bẫy giữ nhịp.',
    pool: [
      'hero_rogue_05',
      'hero_rogue_06',
      'hero_rogue_07',
      'hero_rogue_08',
      'hero_rogue_09',
      'hero_scout_01',
      'hero_scout_02',
    ],
  },
  rush: {
    label: 'xung phong',
    tip: 'Berserker/bomber dồn nhịp đầu, buộc giữ choke thật lâu trước khi tuyến sau tràn vào.',
    pool: [
      'hero_berserker_03',
      'hero_berserker_04',
      'hero_berserker_05',
      'hero_bomber_01',
      'hero_warrior_10',
      'hero_rogue_06',
    ],
  },
  pressure: {
    label: 'mưa đạn',
    tip: 'Tuyến sau bắn dài từ góc khuất; gap-close và chia mục tiêu giúp tránh bị kite.',
    pool: [
      'hero_archer_03',
      'hero_archer_04',
      'hero_archer_05',
      'hero_archer_06',
      'hero_hex_06',
      'hero_hex_07',
      'hero_support_03',
    ],
  },
  collapse: {
    label: 'ép giao tranh',
    tip: 'Wave cuối thường dồn support + hex để khóa vùng buff; đừng all-in từ wave đầu.',
    pool: [
      'hero_hex_04',
      'hero_hex_05',
      'hero_hex_06',
      'hero_hex_07',
      'hero_support_01',
      'hero_support_03',
      'hero_support_04',
      'hero_shatter_01',
    ],
  },
};

const HARD_SPECIAL_BOSS_PLANS = {
  5: {
    theme: 'Boss Khó 5: Kỵ Sĩ Cổng Sương',
    tip: 'Boss fight mở màn Hard. Dồn boss sớm, đừng để tank băng giữ choke quá lâu.',
    waves: [
      { delay: 0.4, ids: ['hero_scout_01', 'hero_warrior_04', 'hero_healer_02'] },
      { delay: 9, ids: ['hero_boss_05', 'hero_tank_02', 'hero_healer_03', 'hero_archer_02'] },
      { delay: 19, ids: ['hero_boss_05', 'hero_mage_03', 'hero_warrior_06', 'hero_support_02'] },
    ],
  },
  10: {
    theme: 'Boss Khó 10: Nhãn Quỷ Săn Đêm',
    tip: 'Stealth boss stage. Mắt thần, taunt và anti-heal sẽ lời hơn tham full damage.',
    waves: [
      { delay: 0.35, ids: ['hero_rogue_04', 'hero_archer_02', 'hero_scout_01'] },
      { delay: 9, ids: ['hero_boss_10', 'hero_healer_04', 'hero_hex_02', 'hero_archer_03'] },
      { delay: 21, ids: ['hero_boss_10', 'hero_rogue_06', 'hero_support_03', 'hero_tank_03'] },
    ],
  },
  15: {
    theme: 'Boss Khó 15: Phù Thủy Chuông Rỗng',
    tip: 'Boss mage stage. Chia cụm, silence đúng nhịp và đừng để cả bãi đứng cùng một lane.',
    waves: [
      { delay: 0.35, ids: ['hero_support_02', 'hero_mage_05', 'hero_warrior_06', 'hero_archer_03'] },
      { delay: 10, ids: ['hero_boss_15', 'hero_healer_04', 'hero_hex_03', 'hero_tank_03'] },
      { delay: 23, ids: ['hero_boss_15', 'hero_mage_06', 'hero_support_03', 'hero_berserker_03', 'hero_scout_01'] },
    ],
  },
  20: {
    theme: 'Boss Khó 20: Hầu Tước Dung Nham',
    tip: 'Boss bruiser stage. Cần chống nhịp lao đầu và không để hắn hút máu miễn phí.',
    waves: [
      { delay: 0.35, ids: ['hero_berserker_03', 'hero_warrior_07', 'hero_support_01'] },
      { delay: 10, ids: ['hero_boss_20', 'hero_healer_04', 'hero_tank_04', 'hero_mage_06'] },
      { delay: 23, ids: ['hero_boss_20', 'hero_berserker_04', 'hero_hex_04', 'hero_archer_04', 'hero_support_03'] },
    ],
  },
  25: {
    theme: 'Boss Khó 25: Thiên Tiễn Độc Hậu',
    tip: 'Boss archer stage. Gap-close, chia góc và bắt support trước khi boss free-hit quá lâu.',
    waves: [
      { delay: 0.35, ids: ['hero_archer_04', 'hero_support_03', 'hero_scout_01', 'hero_healer_04'] },
      { delay: 10, ids: ['hero_boss_25', 'hero_tank_04', 'hero_hex_04', 'hero_archer_05'] },
      { delay: 24, ids: ['hero_boss_25', 'hero_archer_06', 'hero_healer_05', 'hero_support_04', 'hero_berserker_04'] },
    ],
  },
  30: {
    theme: 'Boss Khó 30: Giáo Chủ Huyết Khế',
    tip: 'Boss support-core stage. Nếu không đục vỡ lõi healer/support đủ nhanh sẽ bị câu đến kiệt tài nguyên.',
    waves: [
      { delay: 0.35, ids: ['hero_support_01', 'hero_support_02', 'hero_tank_04', 'hero_healer_05'] },
      { delay: 11, ids: ['hero_boss_30', 'hero_stasis_01', 'hero_hex_05', 'hero_shatter_01'] },
      { delay: 25, ids: ['hero_boss_30', 'hero_healer_05', 'hero_support_04', 'hero_warrior_10', 'hero_archer_04'] },
      { delay: 40, ids: ['hero_boss_30', 'hero_stasis_02', 'hero_support_03', 'hero_healer_06'] },
    ],
  },
  35: {
    theme: 'Boss Khó 35: Vương Không Ảnh',
    tip: 'Boss bóng tối trước endgame. Vừa phải soi tàng hình vừa phải dạt đội hình để tránh ăn trọn AoE.',
    waves: [
      { delay: 0.3, ids: ['hero_rogue_06', 'hero_support_03', 'hero_mage_06', 'hero_scout_02'] },
      { delay: 10, ids: ['hero_boss_35', 'hero_hex_05', 'hero_healer_05', 'hero_tank_04'] },
      { delay: 23, ids: ['hero_boss_35', 'hero_mage_07', 'hero_stasis_03', 'hero_archer_05', 'hero_support_04'] },
      { delay: 39, ids: ['hero_boss_35', 'hero_rogue_09', 'hero_healer_06', 'hero_hex_07', 'hero_support_03'] },
    ],
  },
};

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function flattenBasePlan(level) {
  const base = WAVE_PLANS[level] || WAVE_PLANS[1];
  if (Array.isArray(base.waves) && base.waves.length) {
    return base.waves.flatMap((w) => w.ids || []);
  }
  return [...(base.ids || [])];
}

function classifyIds(ids) {
  const score = {
    fortress: 0,
    sustain: 0,
    magic: 0,
    stealth: 0,
    rush: 0,
    pressure: 0,
    collapse: 0,
  };
  for (const id of ids) {
    const hero = HERO_BY_ID[id];
    if (!hero) continue;
    if (hero.class === 'WARRIOR' || hero.class === 'TANK') score.fortress += 2;
    if (hero.class === 'HEALER') score.sustain += 2;
    if (hero.class === 'MAGE') score.magic += 2;
    if (hero.class === 'ARCHER' || hero.class === 'SCOUT') score.pressure += 2;
    if (hero.class === 'HEXER') {
      score.collapse += 2;
      score.sustain += 1;
    }
    if (hero.class === 'BERSERKER') score.rush += 2;
    if (hero.stealth || hero.skills?.includes('STEALTH')) score.stealth += 2;
    if (hero.skills?.includes('SHIELD_ALLY') || hero.skills?.includes('REVIVE')) score.sustain += 2;
    if (hero.skills?.includes('DEF_SHRED') || hero.skills?.includes('SHIELD_BREAK')) score.collapse += 1;
  }
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

function waveCountForLevel(level) {
  if (level <= 10) return 5;
  if (level <= 25) return 6;
  if (level <= 45) return 7;
  return 8;
}

function delayForWave(level, waveIndex) {
  const base = level <= 15 ? 6.75 : level <= 35 ? 6 : 5.4;
  return Number((0.4 + waveIndex * base).toFixed(2));
}

function targetHeroCountForLevel(level, isBossStage = false) {
  let count = 26;
  if (level > 10) count = 30;
  if (level > 20) count = 34;
  if (level > 30) count = 38;
  if (level > 40) count = 44;
  if (level > 50) count = 50;
  return count + (isBossStage ? 2 : 0);
}

function distributeWaveSizes(totalHeroes, totalWaves, minSize, maxSize) {
  const weights = Array.from({ length: totalWaves }, (_, i) => i + 2);
  const totalWeight = weights.reduce((sum, n) => sum + n, 0);
  const sizes = weights.map((w) =>
    Math.min(maxSize, Math.max(minSize, Math.round((totalHeroes * w) / totalWeight)))
  );
  let sum = sizes.reduce((acc, n) => acc + n, 0);

  while (sum < totalHeroes) {
    let changed = false;
    for (let i = totalWaves - 1; i >= 0 && sum < totalHeroes; i--) {
      if (sizes[i] >= maxSize) continue;
      sizes[i] += 1;
      sum += 1;
      changed = true;
    }
    if (!changed) break;
  }

  while (sum > totalHeroes) {
    let changed = false;
    for (let i = 0; i < totalWaves && sum > totalHeroes; i++) {
      if (sizes[i] <= minSize) continue;
      sizes[i] -= 1;
      sum -= 1;
      changed = true;
    }
    if (!changed) break;
  }

  return sizes;
}

function pickUniqueFromPool(pool, count, used, rng) {
  const filtered = shuffle(
    pool.filter((id) => HERO_BY_ID[id]),
    rng
  );
  const out = [];
  for (const id of filtered) {
    const times = used[id] || 0;
    if (times >= 2 && rng() < 0.75) continue;
    out.push(id);
    used[id] = times + 1;
    if (out.length >= count) break;
  }
  return out;
}

function fillWaveToSize(ids, desiredSize, pools, used, rng) {
  const seen = new Set(ids);
  const poolList = pools.filter((pool) => Array.isArray(pool) && pool.length);
  let guard = 0;
  while (ids.length < desiredSize && poolList.length && guard < 200) {
    const pool = poolList[guard % poolList.length];
    const shuffled = shuffle(pool.filter((id) => HERO_BY_ID[id]), rng);
    let picked = false;
    for (const id of shuffled) {
      if (seen.has(id) && rng() < 0.82) continue;
      const times = used[id] || 0;
      if (times >= 3 && rng() < 0.55) continue;
      ids.push(id);
      seen.add(id);
      used[id] = times + 1;
      picked = true;
      break;
    }
    if (!picked) {
      const fallback = shuffled[Math.floor(rng() * shuffled.length)];
      if (!fallback) break;
      ids.push(fallback);
      used[fallback] = (used[fallback] || 0) + 1;
    }
    guard += 1;
  }
  return ids;
}

function rebalanceHardPlan(level, seedPlan, bossId = null) {
  const seedIds = (seedPlan?.waves || []).flatMap((w) => w.ids || []).filter((id) => HERO_BY_ID[id]);
  const rankedTags = classifyIds(seedIds.length ? seedIds : flattenBasePlan(level));
  const tags = [...new Set([rankedTags[0], rankedTags[1], rankedTags[2] || 'collapse'])].filter(Boolean);
  const totalWaves = waveCountForLevel(level);
  const targetHeroes = targetHeroCountForLevel(level, !!bossId);
  const minSize = level <= 12 ? 3 : 4;
  const maxSize = level >= 45 ? 10 : 9;
  const waveSizes = distributeWaveSizes(targetHeroes, totalWaves, minSize, maxSize);
  const rng = mulberry32(level * 2654435761 + 701);
  const used = {};
  const basePool = shuffle(seedIds.length ? seedIds : flattenBasePlan(level), rng);
  const thematicPool = shuffle(tags.flatMap((tag) => TAGS[tag]?.pool || []), rng);
  const collapsePool = shuffle(TAGS.collapse.pool, rng);
  const waves = [];

  for (let wi = 0; wi < totalWaves; wi++) {
    const desiredSize = waveSizes[wi];
    const sourceWave = seedPlan?.waves?.[Math.min(wi, (seedPlan.waves?.length || 1) - 1)] || { ids: [] };
    const ids = [];

    for (const id of sourceWave.ids || []) {
      if (!HERO_BY_ID[id]) continue;
      if (ids.length >= desiredSize) break;
      ids.push(id);
      used[id] = (used[id] || 0) + 1;
    }

    if (bossId && wi >= totalWaves - 3 && !ids.includes(bossId) && ids.length < desiredSize) {
      ids.unshift(bossId);
      used[bossId] = (used[bossId] || 0) + 1;
    }

    if (wi >= 1) {
      ids.push(...pickUniqueFromPool(thematicPool, Math.min(2, Math.max(1, desiredSize - ids.length)), used, rng));
    }
    if (wi >= Math.floor(totalWaves / 2)) {
      ids.push(...pickUniqueFromPool(collapsePool, 1, used, rng));
    }

    fillWaveToSize(ids, desiredSize, [thematicPool, basePool, collapsePool], used, rng);

    waves.push({
      delay: delayForWave(level, wi),
      ids: ids.filter((id) => HERO_BY_ID[id]).slice(0, desiredSize),
    });
  }

  return {
    theme: seedPlan?.theme || `Khó: ${tags.map((tag) => TAGS[tag]?.label || tag).slice(0, 2).join(' + ')}`,
    tip: seedPlan?.tip || tags.map((tag) => TAGS[tag]?.tip || '').filter(Boolean).join(' '),
    waves,
  };
}

function buildHardPlan(level) {
  if (HARD_SPECIAL_BOSS_PLANS[level]) {
    return rebalanceHardPlan(level, HARD_SPECIAL_BOSS_PLANS[level], HARD_BOSS_BY_LEVEL[level] || null);
  }
  const rng = mulberry32(level * 2654435761 + 97);
  const baseIds = flattenBasePlan(level).filter((id) => HERO_BY_ID[id]);
  const rankedTags = classifyIds(baseIds);
  const tags = [...new Set([rankedTags[0], rankedTags[1], rankedTags[2] || 'collapse'])].filter(Boolean);
  const waves = [];
  const used = {};
  const basePool = shuffle(baseIds, rng);
  const extraPool = shuffle(tags.flatMap((tag) => TAGS[tag]?.pool || []), rng);
  const bossId = HARD_BOSS_BY_LEVEL[level] || null;
  const totalWaves = waveCountForLevel(level);
  const targetHeroes = targetHeroCountForLevel(level, !!bossId);
  const waveSizes = distributeWaveSizes(
    targetHeroes,
    totalWaves,
    level <= 12 ? 3 : 4,
    level >= 45 ? 10 : 9
  );

  for (let wi = 0; wi < totalWaves; wi++) {
    const ids = [];
    const desiredSize = waveSizes[wi];
    const baseTake = Math.min(basePool.length, Math.max(2, Math.floor(desiredSize * 0.45)));
    for (let i = 0; i < baseTake; i++) {
      const pick = basePool[(wi * 3 + i) % basePool.length];
      if (!pick) continue;
      ids.push(pick);
      used[pick] = (used[pick] || 0) + 1;
    }

    const extraTake = Math.min(
      extraPool.length,
      wi === 0 ? 2 : wi >= totalWaves - 2 ? 4 : 3
    );
    ids.push(...pickUniqueFromPool(extraPool, extraTake, used, rng));

    if (wi >= 1) {
      const tacticalTag = tags[wi % tags.length];
      ids.push(...pickUniqueFromPool(TAGS[tacticalTag]?.pool || [], wi >= totalWaves - 2 ? 2 : 1, used, rng));
    }
    if (level >= 20 && wi >= totalWaves - 2) {
      ids.push(...pickUniqueFromPool(TAGS.collapse.pool, 2, used, rng));
    }
    if (bossId && wi >= totalWaves - 3) {
      ids.unshift(bossId);
    }

    fillWaveToSize(ids, desiredSize, [extraPool, basePool, TAGS[tags[wi % tags.length]]?.pool || [], TAGS.collapse.pool], used, rng);

    waves.push({
      delay: delayForWave(level, wi),
      ids: ids.filter((id) => HERO_BY_ID[id]).slice(0, desiredSize),
    });
  }

  const theme = `Khó: ${tags
    .slice(0, 2)
    .map((tag) => TAGS[tag]?.label || tag)
    .join(' + ')}`;
  const tip = tags
    .slice(0, 2)
    .map((tag) => TAGS[tag]?.tip || '')
    .filter(Boolean)
    .join(' ');

  return { theme, tip, waves };
}

export const HARD_WAVE_PLANS = Object.fromEntries(
  Array.from({ length: 60 }, (_, i) => {
    const level = i + 1;
    return [level, buildHardPlan(level)];
  })
);

export function getHardWavePlan(level = 1) {
  const lv = Math.max(1, Math.min(60, level | 0));
  return HARD_WAVE_PLANS[lv] || HARD_WAVE_PLANS[1];
}

function expandPlanSpawns(plan) {
  if (Array.isArray(plan.waves) && plan.waves.length) {
    const out = [];
    plan.waves.forEach((w, wi) => {
      const base = Number(w.delay) || 0;
      (w.ids || []).forEach((id, i) => {
        out.push({
          id,
          spawnDelay: base + i * Math.min(COMBAT.HERO_SPAWN_INTERVAL, 2.2),
          waveIndex: wi + 1,
        });
      });
    });
    return out;
  }
  return [];
}

export function buildHardWave(level = 1) {
  const plan = getHardWavePlan(level);
  const scale = heroScaleForLevel(level);
  const spawns = expandPlanSpawns(plan);
  const waves = [];

  spawns.forEach((slot, i) => {
    const template = HERO_BY_ID[slot.id];
    if (!template) return;
    const roleLine =
      template.class === 'WARRIOR' || template.class === 'TANK'
        ? 'Khóa choke / tuyến trước'
        : template.class === 'BERSERKER'
          ? 'Rush / phá nhịp đầu'
          : template.class === 'HEXER'
            ? 'Phá heal / ép giao tranh'
            : template.class === 'BOSS'
              ? 'Boss áp lực chính'
              : template.class === 'HEALER'
                ? 'Support / kéo dài trận'
                : template.class === 'SCOUT'
                  ? 'Reveal / bắn hỗ trợ'
                  : template.class === 'MAGE' || template.class === 'ARCHER'
                    ? 'Tuyến sau / chiếm buff'
                    : template.stealth
                      ? 'Luồn sườn / ăn buff'
                      : 'Áp sát';
    waves.push({
      ...template,
      instanceId: `${template.id}_H${level}_${i}`,
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
