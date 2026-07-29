import { MONSTER_BY_ID, MONSTERS } from '../data/monsters.js?v=130';
import { BOSS_FIGHT_STAGES } from '../data/constants.js?v=130';

/**
 * Pool mang vào ải = bội số Cap map.
 * Cap 5 → mang tối đa 15; trên sân chỉ đặt ≤ Cap gốc (1×) — phần dư thả khi có slot.
 * Ải Hero Boss (40/45/50/55/60): ×5.
 */
export const LOADOUT_POOL_MULT = 3;
export const LOADOUT_POOL_MULT_BOSS = 5;

/** Cap đặt trên sân / trong trận = Cap gốc (1×), không theo pool mang. */
export const PLACE_COST_MULT = 1;

/** @deprecated Không còn giới hạn loại — giữ export để tương thích cũ */
export const LOADOUT_MAX_TYPES = Infinity;

export function isBossFightStage(level) {
  return BOSS_FIGHT_STAGES.includes(Number(level) || 0);
}

export function loadoutPoolMultForLevel(level) {
  return isBossFightStage(level) ? LOADOUT_POOL_MULT_BOSS : LOADOUT_POOL_MULT;
}

/** Pool cost tối đa mang vào ải (3× hoặc 5× Cap map theo ải). */
export function loadoutMaxPoolCost(costCap, level, poolMultOverride) {
  const cap = Math.max(1, Number(costCap) || 1);
  const mult =
    poolMultOverride != null
      ? Math.max(1, Number(poolMultOverride) || 1)
      : loadoutPoolMultForLevel(level);
  return Math.max(cap, Math.floor(cap * mult));
}

/** Cost tối đa xếp trên sân cùng lúc (1× Cap gốc). */
export function placeMaxCost(costCap) {
  const cap = Math.max(1, Number(costCap) || 1);
  return Math.max(cap, Math.floor(cap * PLACE_COST_MULT));
}

export function loadoutPoolCost(loadout) {
  let sum = 0;
  for (const [id, n] of Object.entries(loadout || {})) {
    const m = MONSTER_BY_ID[id];
    if (!m || !(n > 0)) continue;
    sum += m.cost * n;
  }
  return sum;
}

export function loadoutUnitCount(loadout) {
  return Object.values(loadout || {}).reduce((s, n) => s + (Number(n) || 0), 0);
}

export function loadoutTypeCount(loadout) {
  return Object.values(loadout || {}).filter((n) => n > 0).length;
}

/** Khóa ổn định để so sánh loadout */
export function loadoutFingerprint(loadout) {
  const keys = Object.keys(loadout || {})
    .filter((id) => (loadout[id] || 0) > 0)
    .sort();
  const norm = {};
  for (const k of keys) norm[k] = loadout[k];
  return JSON.stringify(norm);
}

/**
 * Chuẩn hóa loadout theo kho + pool ≤ maxPool (không giới hạn số loại).
 * @returns {{ [id: string]: number }}
 */
export function sanitizeLoadout(loadout, inventory, costCap = Infinity, level, poolMultOverride) {
  const out = {};
  if (!loadout) return out;
  for (const [id, n] of Object.entries(loadout)) {
    if (!MONSTER_BY_ID[id]) continue;
    const have = inventory[id] || 0;
    const take = Math.min(Math.max(0, Math.floor(Number(n) || 0)), have);
    if (take > 0) out[id] = take;
  }
  const maxPool = Number.isFinite(costCap)
    ? loadoutMaxPoolCost(costCap, level, poolMultOverride)
    : Infinity;
  if (Number.isFinite(maxPool)) {
    while (loadoutPoolCost(out) > maxPool) {
      const ranked = Object.keys(out)
        .map((id) => ({ id, cost: MONSTER_BY_ID[id]?.cost || 1, n: out[id] }))
        .sort((a, b) => b.cost - a.cost || b.n - a.n);
      if (!ranked.length) break;
      const top = ranked[0];
      if (out[top.id] <= 1) delete out[top.id];
      else out[top.id] -= 1;
    }
  }
  return out;
}

/**
 * Gợi ý loadout: ưu tiên utility/trap, nhiều loại tùy ý, tổng Cost ≤ pool.
 */
export function suggestLoadout(inventory, costCap, level, poolMultOverride) {
  const maxPool = loadoutMaxPoolCost(costCap, level, poolMultOverride);
  const owned = MONSTERS.filter((m) => (inventory[m.id] || 0) > 0).sort((a, b) => {
    const score = (m) => {
      let s = 0;
      const tags = m.tags || [];
      if (tags.includes('silence')) s += 30;
      if (tags.includes('trap') || tags.includes('detect')) s += 28;
      if (tags.includes('utility')) s += 20;
      if (tags.includes('tank') || tags.includes('tankette')) s += 12;
      if (tags.includes('boss')) s += 8;
      s += (6 - m.cost) * 3;
      s += m.rarity;
      return s;
    };
    return score(b) - score(a) || a.cost - b.cost;
  });

  const loadout = {};
  let pool = 0;

  for (const m of owned) {
    const have = inventory[m.id] || 0;
    for (let i = 0; i < have; i++) {
      if (pool + m.cost > maxPool) break;
      loadout[m.id] = (loadout[m.id] || 0) + 1;
      pool += m.cost;
    }
    if (pool >= maxPool) break;
  }

  if (pool === 0 && owned[0] && owned[0].cost <= maxPool) {
    loadout[owned[0].id] = 1;
  }

  return loadout;
}

/**
 * Thêm 1 copy vào loadout nếu còn slot kho + pool Cost.
 * @returns {{ ok: boolean, reason?: string, loadout: object }}
 */
export function tryAddToLoadout(loadout, inventory, monsterId, costCap, level, poolMultOverride) {
  const m = MONSTER_BY_ID[monsterId];
  if (!m) return { ok: false, reason: 'Quái không tồn tại', loadout };
  const have = inventory[monsterId] || 0;
  const cur = loadout[monsterId] || 0;
  if (cur >= have) return { ok: false, reason: 'Hết số lượng trong kho', loadout };
  const mult =
    poolMultOverride != null
      ? Math.max(1, Number(poolMultOverride) || 1)
      : loadoutPoolMultForLevel(level);
  const maxPool = loadoutMaxPoolCost(costCap, level, poolMultOverride);
  const pool = loadoutPoolCost(loadout);
  if (pool + m.cost > maxPool) {
    return {
      ok: false,
      reason: `Pool đầy (tối đa ${maxPool} = ${mult}× Cap map)`,
      loadout,
    };
  }
  const next = { ...loadout, [monsterId]: cur + 1 };
  return { ok: true, loadout: next };
}

export function tryRemoveFromLoadout(loadout, monsterId) {
  const cur = loadout[monsterId] || 0;
  if (cur <= 0) return { ok: false, loadout };
  const next = { ...loadout };
  if (cur <= 1) delete next[monsterId];
  else next[monsterId] = cur - 1;
  return { ok: true, loadout: next };
}

