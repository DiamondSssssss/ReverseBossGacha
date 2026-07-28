import { MAX_STAGE } from './constants.js?v=101';

/** @typedef {'normal' | 'hard'} StageMode */

/**
 * Band modifiers for Hard mode (same maps as Normal).
 * hero↑ monster↓ cap/treasure tighter + light map buff overlay for heroes.
 */
const HARD_BANDS = [
  {
    max: 10,
    heroStatMul: 1.25,
    monsterStatMul: 0.92,
    costCapDelta: -1,
    treasureHpMul: 0.9,
    rules: 'Hero mạnh hơn · Cap −1 · Kho mỏng hơn',
    extraMapBuffs: [
      { cells: ['1,3', '1,4'], side: 'hero', kind: 'ATK_UP', value: 1.12 },
    ],
  },
  {
    max: 20,
    heroStatMul: 1.32,
    monsterStatMul: 0.9,
    costCapDelta: -1,
    treasureHpMul: 0.88,
    rules: 'Hero ↑ · Quái ↓ · Cap −1',
    extraMapBuffs: [
      { cells: ['1,3', '1,4'], side: 'hero', kind: 'ATK_UP', value: 1.15 },
      { cells: ['2,2', '2,5'], side: 'hero', kind: 'SPEED_UP', value: 1.1 },
    ],
  },
  {
    max: 30,
    heroStatMul: 1.4,
    monsterStatMul: 0.88,
    costCapDelta: -1,
    treasureHpMul: 0.85,
    rules: 'Áp lực mid · Cap −1 · Kho ×0.85',
    extraMapBuffs: [
      { cells: ['1,3', '1,4'], side: 'hero', kind: 'ATK_UP', value: 1.18 },
      { cells: ['2,3', '2,4'], side: 'hero', kind: 'DEF_UP', value: 1.12 },
    ],
  },
  {
    max: 40,
    heroStatMul: 1.45,
    monsterStatMul: 0.86,
    costCapDelta: -2,
    treasureHpMul: 0.82,
    rules: 'Cap −2 · Hero mạnh · Quái yếu hơn',
    extraMapBuffs: [
      { cells: ['1,2', '1,5'], side: 'hero', kind: 'ATK_UP', value: 1.2 },
      { cells: ['2,3', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.12 },
    ],
  },
  {
    max: 50,
    heroStatMul: 1.5,
    monsterStatMul: 0.85,
    costCapDelta: -2,
    treasureHpMul: 0.8,
    rules: 'Late hard · Cap −2 · Kho ×0.8',
    extraMapBuffs: [
      { cells: ['1,3', '1,4'], side: 'hero', kind: 'ATK_UP', value: 1.22 },
      { cells: ['2,2', '2,5'], side: 'hero', kind: 'DEF_UP', value: 1.15 },
    ],
  },
  {
    max: 60,
    heroStatMul: 1.55,
    monsterStatMul: 0.85,
    costCapDelta: -2,
    treasureHpMul: 0.78,
    rules: 'Endgame Khó · Cap −2 · Hero rất mạnh',
    extraMapBuffs: [
      { cells: ['1,3', '1,4'], side: 'hero', kind: 'ATK_UP', value: 1.25 },
      { cells: ['2,3', '2,4'], side: 'hero', kind: 'SPEED_UP', value: 1.15 },
      { cells: ['3,2', '3,5'], side: 'hero', kind: 'DEF_UP', value: 1.12 },
    ],
  },
];

/**
 * @param {number} level
 * @returns {{
 *   heroStatMul: number,
 *   monsterStatMul: number,
 *   costCapDelta: number,
 *   treasureHpMul: number,
 *   rules: string,
 *   extraMapBuffs: Array<object>,
 * }}
 */
export function hardModifiersForLevel(level) {
  const lv = Math.max(1, Math.min(MAX_STAGE, level | 0));
  for (const band of HARD_BANDS) {
    if (lv <= band.max) {
      return {
        heroStatMul: band.heroStatMul,
        monsterStatMul: band.monsterStatMul,
        costCapDelta: band.costCapDelta,
        treasureHpMul: band.treasureHpMul,
        rules: band.rules,
        extraMapBuffs: (band.extraMapBuffs || []).map((b) => ({
          ...b,
          cells: [...b.cells],
        })),
      };
    }
  }
  const last = HARD_BANDS[HARD_BANDS.length - 1];
  return {
    heroStatMul: last.heroStatMul,
    monsterStatMul: last.monsterStatMul,
    costCapDelta: last.costCapDelta,
    treasureHpMul: last.treasureHpMul,
    rules: last.rules,
    extraMapBuffs: (last.extraMapBuffs || []).map((b) => ({
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

