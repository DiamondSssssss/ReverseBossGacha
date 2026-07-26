import { GACHA } from '../data/constants.js';
import { monstersByRarityBucket } from '../data/monsters.js';
import { addToInventory, saveState } from './storage.js';

function rand() {
  return Math.random();
}

function pickBucket(forceLegendary = false) {
  if (forceLegendary) return 'legendary';
  const r = rand();
  const { common, rare, epic } = GACHA.RATES;
  if (r < common) return 'common';
  if (r < common + rare) return 'rare';
  if (r < common + rare + epic) return 'epic';
  return 'legendary';
}

function pickMonster(bucket) {
  const list = monstersByRarityBucket(bucket);
  return list[Math.floor(rand() * list.length)];
}

/**
 * Single pull. Mutates state, returns { monster, pityHit, bucket, isNew, refunded, soulsRefunded }.
 */
export function pullOnce(state) {
  const force = state.pityCounter >= GACHA.PITY_THRESHOLD;
  const bucket = pickBucket(force);
  const monster = pickMonster(bucket);
  const pityHit = force;
  const prevCount = state.inventory[monster.id] || 0;

  if (monster.rarity === 5) {
    state.pityCounter = 0;
  } else {
    state.pityCounter = (state.pityCounter || 0) + 1;
  }

  if (pityHit) {
    state.stats.pityHits = (state.stats.pityHits || 0) + 1;
  }

  const add = addToInventory(state, monster.id, 1);
  state.stats.pulls = (state.stats.pulls || 0) + 1;
  saveState(state);

  return {
    monster,
    pityHit,
    bucket,
    isNew: prevCount === 0 && add.added > 0,
    refunded: add.overflow > 0,
    soulsRefunded: add.soulsRefunded,
    atCap: add.atCap,
  };
}

/**
 * Attempt pull(s) if enough souls. Returns results array or { error }.
 */
export function tryPull(state, count = 1) {
  const cost =
    count === 10 ? GACHA.PULL10_COST_SOULS : GACHA.PULL_COST_SOULS * count;
  if (state.souls < cost) {
    return { error: 'Không đủ Linh Hồn!', cost };
  }
  state.souls -= cost;
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(pullOnce(state));
  }
  saveState(state);
  return { results, cost };
}
