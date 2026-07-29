import { MAX_STAGE } from './constants.js?v=117';
import { MONSTER_BY_ID } from './monsters.js?v=117';
import { tryAddToLoadout, loadoutMaxPoolCost } from '../core/loadout.js?v=117';

/** @typedef {'normal' | 'hard'} StageMode */

/**
 * @typedef {object} HardRarityLimits
 * @property {number|null} maxLegendary
 * @property {number|null} maxMythic
 * @property {number|null} maxRainbow
 */

/**
 * Band modifiers for Hard mode — map riêng 42×8 (mapsHard.js), Hero↑ pool lớn hơn.
 * Rarity caps scale by band; see HARD_STAGE_RARITY_OVERRIDES for per-stage tweaks.
 */
const HARD_BANDS = [
  {
    max: 10,
    heroStatMul: 1.25,
    monsterStatMul: 0.92,
    costCapDelta: -1,
    treasureHpMul: 0.9,
    poolMultBonus: 2,
    maxLegendary: 1,
    maxMythic: 0,
    maxRainbow: 0,
    rules: 'Hero mạnh hơn · Cap −1 · ≤1 Legendary · cấm Mythic/Rainbow',
    extraMapBuffs: [],
  },
  {
    max: 20,
    heroStatMul: 1.32,
    monsterStatMul: 0.9,
    costCapDelta: -1,
    treasureHpMul: 0.88,
    poolMultBonus: 2,
    maxLegendary: 2,
    maxMythic: 0,
    maxRainbow: 0,
    rules: 'Hero ↑ · Cap −1 · ≤2 Legendary · cấm Mythic/Rainbow',
    extraMapBuffs: [],
  },
  {
    max: 30,
    heroStatMul: 1.4,
    monsterStatMul: 0.88,
    costCapDelta: -1,
    treasureHpMul: 0.85,
    poolMultBonus: 2,
    maxLegendary: 2,
    maxMythic: 1,
    maxRainbow: 0,
    rules: 'Mid hard · ≤2 Legendary · ≤1 Mythic · cấm Rainbow',
    extraMapBuffs: [],
  },
  {
    max: 40,
    heroStatMul: 1.45,
    monsterStatMul: 0.86,
    costCapDelta: -2,
    treasureHpMul: 0.82,
    poolMultBonus: 2,
    maxLegendary: 3,
    maxMythic: 1,
    maxRainbow: 0,
    rules: 'Cap −2 · ≤3 Legendary · ≤1 Mythic · cấm Rainbow',
    extraMapBuffs: [],
  },
  {
    max: 50,
    heroStatMul: 1.5,
    monsterStatMul: 0.85,
    costCapDelta: -2,
    treasureHpMul: 0.8,
    poolMultBonus: 2,
    maxLegendary: 3,
    maxMythic: 2,
    maxRainbow: 0,
    rules: 'Late hard · ≤3 Legendary · ≤2 Mythic · cấm Rainbow',
    extraMapBuffs: [],
  },
  {
    max: 60,
    heroStatMul: 1.55,
    monsterStatMul: 0.85,
    costCapDelta: -2,
    treasureHpMul: 0.78,
    poolMultBonus: 2,
    maxLegendary: 4,
    maxMythic: 2,
    maxRainbow: 1,
    rules: 'Endgame Khó · ≤4 Legendary · ≤2 Mythic · ≤1 Rainbow',
    extraMapBuffs: [],
  },
];

/** Giới hạn rarity riêng theo ải (ghi đè band). Boss / ải đặc biệt thường chặt hơn. */
const HARD_STAGE_RARITY_OVERRIDES = {
  10: { maxLegendary: 1, maxMythic: 0, maxRainbow: 0 },
  20: { maxLegendary: 2, maxMythic: 0, maxRainbow: 0 },
  30: { maxLegendary: 2, maxMythic: 1, maxRainbow: 0 },
  40: { maxLegendary: 2, maxMythic: 1, maxRainbow: 0 },
  45: { maxLegendary: 2, maxMythic: 1, maxRainbow: 0 },
  50: { maxLegendary: 2, maxMythic: 2, maxRainbow: 0 },
  55: { maxLegendary: 3, maxMythic: 2, maxRainbow: 0 },
  60: { maxLegendary: 3, maxMythic: 2, maxRainbow: 1 },
  43: { maxLegendary: 2, maxMythic: 1, maxRainbow: 0 },
  47: { maxLegendary: 2, maxMythic: 1, maxRainbow: 0 },
  52: { maxLegendary: 3, maxMythic: 2, maxRainbow: 0 },
  57: { maxLegendary: 2, maxMythic: 1, maxRainbow: 0 },
};

function bandForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_STAGE, level | 0));
  for (const band of HARD_BANDS) {
    if (lv <= band.max) return band;
  }
  return HARD_BANDS[HARD_BANDS.length - 1];
}

/**
 * Giới hạn Legendary / Mythic / Rainbow mang vào ải Khó.
 * @param {number} level
 * @returns {HardRarityLimits}
 */
export function hardRarityLimitsForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_STAGE, level | 0));
  const band = bandForLevel(lv);
  const base = {
    maxLegendary: band.maxLegendary ?? null,
    maxMythic: band.maxMythic ?? null,
    maxRainbow: band.maxRainbow ?? null,
  };
  const over = HARD_STAGE_RARITY_OVERRIDES[lv];
  if (!over) return base;
  return {
    maxLegendary: over.maxLegendary ?? base.maxLegendary,
    maxMythic: over.maxMythic ?? base.maxMythic,
    maxRainbow: over.maxRainbow ?? base.maxRainbow,
  };
}

/** @param {object} loadout */
export function countHardRarityLoadout(loadout) {
  const counts = { legendary: 0, mythic: 0, rainbow: 0 };
  for (const [id, n] of Object.entries(loadout || {})) {
    const m = MONSTER_BY_ID[id];
    if (!m || !(n > 0)) continue;
    if (m.rarity >= 7) counts.rainbow += n;
    else if (m.rarity === 6) counts.mythic += n;
    else if (m.rarity === 5) counts.legendary += n;
  }
  return counts;
}

function rarityBucket(monster) {
  if (!monster) return null;
  if (monster.rarity >= 7) return 'rainbow';
  if (monster.rarity === 6) return 'mythic';
  if (monster.rarity === 5) return 'legendary';
  return null;
}

/** Chuỗi hiển thị giới hạn rarity. */
export function hardRaritySummary(limits) {
  if (!limits) return '';
  const parts = [];
  if (limits.maxLegendary === 0) parts.push('cấm Legendary');
  else if (limits.maxLegendary != null) parts.push(`≤${limits.maxLegendary} Legendary`);
  if (limits.maxMythic === 0) parts.push('cấm Mythic');
  else if (limits.maxMythic != null) parts.push(`≤${limits.maxMythic} Mythic`);
  if (limits.maxRainbow === 0) parts.push('cấm Rainbow');
  else if (limits.maxRainbow != null) parts.push(`≤${limits.maxRainbow} Rainbow`);
  return parts.join(' · ');
}

/** Lý do cứng — quái này bị cấm hoàn toàn ở ải Khó. */
export function hardRarityBlockReason(limits, monster) {
  if (!limits || !monster) return null;
  const bucket = rarityBucket(monster);
  if (!bucket) return null;
  if (bucket === 'rainbow' && limits.maxRainbow === 0) return 'Khó cấm Rainbow';
  if (bucket === 'mythic' && limits.maxMythic === 0) return 'Khó cấm Mythic';
  if (bucket === 'legendary' && limits.maxLegendary === 0) return 'Khó cấm Legendary';
  return null;
}

function wouldExceedHardRarity(limits, loadout, monster, add = 1) {
  const hard = hardRarityBlockReason(limits, monster);
  if (hard) return hard;
  const counts = countHardRarityLoadout(loadout);
  const bucket = rarityBucket(monster);
  if (bucket === 'rainbow' && limits.maxRainbow != null && counts.rainbow + add > limits.maxRainbow) {
    return `Tối đa ${limits.maxRainbow} Rainbow`;
  }
  if (bucket === 'mythic' && limits.maxMythic != null && counts.mythic + add > limits.maxMythic) {
    return `Tối đa ${limits.maxMythic} Mythic`;
  }
  if (bucket === 'legendary' && limits.maxLegendary != null && counts.legendary + add > limits.maxLegendary) {
    return `Tối đa ${limits.maxLegendary} Legendary`;
  }
  return null;
}

/** @param {HardRarityLimits} limits @param {object} loadout */
export function validateHardLoadout(limits, loadout) {
  const errors = [];
  if (!limits) return { ok: true, errors: [] };
  const counts = countHardRarityLoadout(loadout);
  for (const [id, n] of Object.entries(loadout || {})) {
    if (!(n > 0)) continue;
    const m = MONSTER_BY_ID[id];
    const hard = hardRarityBlockReason(limits, m);
    if (hard) errors.push(hard);
  }
  if (limits.maxRainbow != null && counts.rainbow > limits.maxRainbow) {
    errors.push(`Tối đa ${limits.maxRainbow} Rainbow`);
  }
  if (limits.maxMythic != null && counts.mythic > limits.maxMythic) {
    errors.push(`Tối đa ${limits.maxMythic} Mythic`);
  }
  if (limits.maxLegendary != null && counts.legendary > limits.maxLegendary) {
    errors.push(`Tối đa ${limits.maxLegendary} Legendary`);
  }
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

/** Cắt quái vượt quota rarity khỏi loadout. */
export function sanitizeHardLoadout(limits, loadout) {
  const out = { ...(loadout || {}) };
  if (!limits) return out;
  for (const id of Object.keys(out)) {
    const m = MONSTER_BY_ID[id];
    if (m && hardRarityBlockReason(limits, m)) delete out[id];
  }
  const trim = (pred, maxKey) => {
    const max = limits[maxKey];
    if (max == null) return;
    let count = 0;
    for (const [id, n] of Object.entries(out)) {
      const m = MONSTER_BY_ID[id];
      if (m && pred(m)) count += n;
    }
    while (count > max) {
      const id = Object.keys(out).find((k) => {
        const m = MONSTER_BY_ID[k];
        return m && pred(m) && out[k] > 0;
      });
      if (!id) break;
      if (out[id] <= 1) delete out[id];
      else out[id] -= 1;
      count -= 1;
    }
  };
  trim((m) => m.rarity >= 7, 'maxRainbow');
  trim((m) => m.rarity === 6, 'maxMythic');
  trim((m) => m.rarity === 5, 'maxLegendary');
  return out;
}

export function tryAddHardLoadout(limits, loadout, inventory, monsterId, costCap, level, poolMult) {
  const m = MONSTER_BY_ID[monsterId];
  const hard = hardRarityBlockReason(limits, m);
  if (hard) return { ok: false, reason: hard, loadout };
  const exceed = wouldExceedHardRarity(limits, loadout, m, 1);
  if (exceed) return { ok: false, reason: exceed, loadout };

  const res = tryAddToLoadout(loadout, inventory, monsterId, costCap, level, poolMult);
  if (!res.ok) return res;

  const check = validateHardLoadout(limits, res.loadout);
  if (!check.ok && check.errors.length) {
    return { ok: false, reason: check.errors[0], loadout };
  }
  return res;
}

/** Gợi ý loadout Khó — ưu tiên utility, tránh vượt cap rarity. */
export function suggestHardLoadout(limits, inventory, costCap, level, poolMult) {
  const maxPool = loadoutMaxPoolCost(costCap, level, poolMult);
  const ranked = Object.entries(inventory || {})
    .filter(([id, n]) => n > 0 && MONSTER_BY_ID[id])
    .map(([id]) => MONSTER_BY_ID[id])
    .filter((m) => !hardRarityBlockReason(limits, m))
    .sort((a, b) => {
      const score = (m) => {
        let s = 0;
        const tags = m.tags || [];
        if (tags.includes('trap') || tags.includes('detect')) s += 40;
        if (tags.includes('silence') || tags.includes('stun')) s += 22;
        if (tags.includes('tank') || tags.includes('tankette')) s += 18;
        if (tags.includes('utility')) s += 12;
        s += (8 - m.cost) * 3;
        s -= m.rarity * 2;
        return s;
      };
      return score(b) - score(a) || a.cost - b.cost;
    });

  const loadout = {};
  let pool = 0;
  for (const m of ranked) {
    const have = inventory[m.id] || 0;
    for (let i = 0; i < have; i++) {
      if (wouldExceedHardRarity(limits, loadout, m, 1)) break;
      if (pool + m.cost > maxPool) break;
      loadout[m.id] = (loadout[m.id] || 0) + 1;
      pool += m.cost;
    }
    if (pool >= maxPool) break;
  }
  return sanitizeHardLoadout(limits, loadout);
}

function rulesForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_STAGE, level | 0));
  const over = HARD_STAGE_RARITY_OVERRIDES[lv];
  if (over?.rules) return over.rules;
  const band = bandForLevel(lv);
  const rarity = hardRaritySummary(hardRarityLimitsForLevel(lv));
  const base = band.rules?.split(' · ')[0] || 'Khó';
  return rarity ? `${base} · ${rarity}` : band.rules;
}

/**
 * @param {number} level
 * @returns {{
 *   heroStatMul: number,
 *   monsterStatMul: number,
 *   costCapDelta: number,
 *   treasureHpMul: number,
 *   poolMultBonus: number,
 *   rules: string,
 *   extraMapBuffs: Array<object>,
 *   rarityLimits: HardRarityLimits,
 * }}
 */
export function hardModifiersForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_STAGE, level | 0));
  const band = bandForLevel(lv);
  const rarityLimits = hardRarityLimitsForLevel(lv);
  return {
    heroStatMul: band.heroStatMul,
    monsterStatMul: band.monsterStatMul,
    costCapDelta: band.costCapDelta,
    treasureHpMul: band.treasureHpMul,
    poolMultBonus: band.poolMultBonus || 0,
    rules: rulesForLevel(lv),
    rarityLimits,
    extraMapBuffs: (band.extraMapBuffs || []).map((b) => ({
      ...b,
      cells: [...b.cells],
    })),
  };
}

/** @param {object} state @param {StageMode} mode */
export function frontierForMode(state, mode) {
  if (mode === 'hard') {
    return Math.max(1, Number(state?.hardDungeonLevel) || 1);
  }
  return Math.max(1, Number(state?.dungeonLevel) || 1);
}

/** Stages already cleared in mode: 1..frontier-1 (capped at MAX_STAGE). */
export function clearedStagesForMode(state, mode) {
  const frontier = frontierForMode(state, mode);
  const lastCleared = Math.min(MAX_STAGE, Math.max(0, frontier - 1));
  const out = [];
  for (let i = 1; i <= lastCleared; i++) out.push(i);
  return out;
}

/**
 * @param {object} state
 * @param {StageMode} mode
 * @param {number} stage
 * @returns {'locked' | 'frontier' | 'cleared'}
 */
export function stageAccess(state, mode, stage) {
  const s = Math.max(1, Math.min(MAX_STAGE, stage | 0));
  const frontier = frontierForMode(state, mode);
  if (frontier > MAX_STAGE) {
    return s <= MAX_STAGE ? 'cleared' : 'locked';
  }
  if (s < frontier) return 'cleared';
  if (s === frontier) return 'frontier';
  return 'locked';
}

/**
 * Record personal best pool cost (min). Returns true if updated.
 * @param {object} state
 * @param {StageMode} mode
 * @param {number} stage
 * @param {number} cost
 */
export function recordPersonalBestCost(state, mode, stage, cost) {
  const m = mode === 'hard' ? 'hard' : 'normal';
  const s = Math.floor(Number(stage) || 0);
  const c = Math.floor(Number(cost));
  if (s < 1 || s > MAX_STAGE || !Number.isFinite(c) || c < 0) return false;
  if (!state.stageBestCost || typeof state.stageBestCost !== 'object') {
    state.stageBestCost = { normal: {}, hard: {} };
  }
  if (!state.stageBestCost[m] || typeof state.stageBestCost[m] !== 'object') {
    state.stageBestCost[m] = {};
  }
  const prev = state.stageBestCost[m][s];
  if (prev == null || c < prev) {
    state.stageBestCost[m][s] = c;
    return true;
  }
  return false;
}

export function personalBestCost(state, mode, stage) {
  const m = mode === 'hard' ? 'hard' : 'normal';
  const s = Math.floor(Number(stage) || 0);
  const v = state?.stageBestCost?.[m]?.[s];
  return Number.isFinite(Number(v)) ? Number(v) : null;
}

