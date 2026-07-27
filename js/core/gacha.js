import { GACHA } from '../data/constants.js?v=80';
import { monstersByRarityBucket } from '../data/monsters.js?v=80';
import { addToInventory, saveState } from './storage.js?v=80';

function rand() {
  return Math.random();
}

/**
 * @param {'rainbow'|'mythic'|'legendary'|false} force
 */
function pickBucket(force = false) {
  if (force === 'rainbow') return 'rainbow';
  if (force === 'mythic') return 'mythic';
  if (force === 'legendary') return 'legendary';
  const r = rand();
  const { common, rare, epic, legendary, mythic, rainbow } = GACHA.RATES;
  let t = 0;
  t += common;
  if (r < t) return 'common';
  t += rare;
  if (r < t) return 'rare';
  t += epic;
  if (r < t) return 'epic';
  t += legendary;
  if (r < t) return 'legendary';
  t += mythic;
  if (r < t) return 'mythic';
  t += rainbow || 0;
  if (r < t) return 'rainbow';
  return 'legendary';
}

function pickMonster(bucket) {
  const list = monstersByRarityBucket(bucket);
  if (!list.length) {
    if (bucket === 'rainbow') return pickMonster('mythic');
    return pickMonster(bucket === 'mythic' ? 'legendary' : 'common');
  }
  return list[Math.floor(rand() * list.length)];
}

/**
 * Single pull. Mutates state.
 * @returns {{ monster, pityHit, mythicPityHit, rainbowPityHit, bucket, isNew, refunded, soulsRefunded, atCap }}
 */
export function pullOnce(state) {
  if (!state.stats) state.stats = {};
  if (state.mythicPityCounter == null) state.mythicPityCounter = 0;
  if (state.pityCounter == null) state.pityCounter = 0;
  if (state.rainbowPityCounter == null) state.rainbowPityCounter = 0;

  const forceRainbow = state.rainbowPityCounter >= GACHA.RAINBOW_PITY_THRESHOLD;
  const forceMythic =
    !forceRainbow && state.mythicPityCounter >= GACHA.MYTHIC_PITY_THRESHOLD;
  const forceLegendary =
    !forceRainbow && !forceMythic && state.pityCounter >= GACHA.PITY_THRESHOLD;
  const force = forceRainbow
    ? 'rainbow'
    : forceMythic
      ? 'mythic'
      : forceLegendary
        ? 'legendary'
        : false;

  const bucket = pickBucket(force);
  const monster = pickMonster(bucket);
  const rainbowPityHit = forceRainbow;
  const mythicPityHit = forceMythic;
  const pityHit = forceLegendary || forceMythic || forceRainbow;
  const prevCount = state.inventory[monster.id] || 0;

  if (monster.rarity >= 7) {
    state.rainbowPityCounter = 0;
    state.pityCounter = 0;
  } else if (monster.rarity >= 6) {
    state.mythicPityCounter = 0;
    state.pityCounter = 0;
    state.rainbowPityCounter = (state.rainbowPityCounter || 0) + 1;
  } else if (monster.rarity === 5) {
    state.pityCounter = 0;
    state.mythicPityCounter = (state.mythicPityCounter || 0) + 1;
    state.rainbowPityCounter = (state.rainbowPityCounter || 0) + 1;
  } else {
    state.pityCounter = (state.pityCounter || 0) + 1;
    state.mythicPityCounter = (state.mythicPityCounter || 0) + 1;
    state.rainbowPityCounter = (state.rainbowPityCounter || 0) + 1;
  }

  if (pityHit) {
    state.stats.pityHits = (state.stats.pityHits || 0) + 1;
  }
  if (mythicPityHit) {
    state.stats.mythicPityHits = (state.stats.mythicPityHits || 0) + 1;
  }
  if (rainbowPityHit) {
    state.stats.rainbowPityHits = (state.stats.rainbowPityHits || 0) + 1;
  }

  const add = addToInventory(state, monster.id, 1);
  state.stats.pulls = (state.stats.pulls || 0) + 1;
  saveState(state);

  return {
    monster,
    pityHit,
    mythicPityHit,
    rainbowPityHit,
    /** Mythic rơi thường (không phải soft pity) */
    naturalMythic: monster.rarity === 6 && !forceMythic,
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
