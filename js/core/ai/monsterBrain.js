import { scoreHeroForMonster, dist } from './targeting.js';
import { los } from '../pathfinding.js';

/**
 * Monster AI tick — returns { action, target }
 * actions: idle | attack | chase | hold
 */
export function tickMonsterBrain(m, ctx) {
  const { heroes, time, map, blocked, cellSize } = ctx;
  const ai = m.ai || { role: 'chaser', leash: 4 };

  if (m.isTrap || ai.role === 'trap' || m.speed <= 0) {
    return { action: 'idle', target: null };
  }

  // Forced taunt from hero TAUNT_SELF
  if (m.forcedTargetId && time < (m.forcedTargetUntil || 0)) {
    const forced = heroes.find((h) => h.id === m.forcedTargetId && h.alive);
    if (forced) {
      if (dist(m, forced) <= m.range) return { action: 'attack', target: forced };
      if (ai.hold || ai.role === 'ranged_guard' || ai.role === 'aura_support') {
        return { action: 'hold', target: forced };
      }
      return { action: 'chase', target: forced };
    }
  }

  let best = null;
  let bestScore = Infinity;
  for (const h of heroes) {
    const s = scoreHeroForMonster(m, h, ai);
    if (s < bestScore) {
      bestScore = s;
      best = h;
    }
  }

  // Reveal passively
  if (m.passive === 'REVEAL' && best && dist(m, best) < m.range) {
    best.revealed = true;
  }

  if (!best) return { action: 'idle', target: null };

  const d = dist(m, best);

  // ranged_guard / aura: stay near home, require LOS for ranged
  if (ai.role === 'ranged_guard' || ai.hold) {
    if (d <= m.range) {
      if (ai.role === 'ranged_guard' && blocked) {
        const from = worldCell(m, cellSize, ctx.originY);
        const to = worldCell(best, cellSize, ctx.originY);
        if (!los(from, to, blocked)) return { action: 'hold', target: best };
      }
      return { action: 'attack', target: best };
    }
    return { action: 'hold', target: best };
  }

  if (ai.role === 'aura_support') {
    if (d <= m.range) return { action: 'attack', target: best };
    // slight drift toward home if too far from leash
    return { action: 'leash', target: best };
  }

  if (d <= m.range) return { action: 'attack', target: best };

  // leash check
  const leash = (ai.leash ?? 4) * cellSize;
  const homeDist = Math.hypot(m.x - m.homeX, m.y - m.homeY);
  if (homeDist > leash && d > m.range * 1.2) {
    return { action: 'leash', target: best };
  }

  return { action: 'chase', target: best };
}

function worldCell(unit, cellSize, originY) {
  return {
    col: Math.floor(unit.x / cellSize),
    row: Math.floor((unit.y - originY) / cellSize),
  };
}

/** Default AI from tags/passive if not set on template */
export function inferMonsterAi(tpl) {
  if (tpl.ai) return { ...tpl.ai };
  const tags = tpl.tags || [];
  const passive = tpl.passive;
  if (tags.includes('trap') || tpl.stats.speed === 0) {
    return { role: 'trap', leash: 0, hold: true, blocksPath: false };
  }
  if (passive === 'TAUNT') {
    return {
      role: 'bait_taunt',
      leash: 2.5,
      hold: tpl.stats.speed < 1,
      blocksPath: tpl.rarity >= 4,
    };
  }
  if (passive === 'REVEAL') {
    return { role: 'anti_rogue', leash: 3, prefer: ['ROGUE'], hold: tpl.stats.speed < 1 };
  }
  if (passive === 'SILENCE_ON_HIT' || tags.includes('anti_mage')) {
    return { role: 'anti_mage', leash: 4, prefer: ['MAGE'] };
  }
  if (passive === 'KNOCK_BACK_ROOM' || tags.includes('knock')) {
    return { role: 'knockbacker', leash: 4 };
  }
  if (passive === 'SLOW_AURA') {
    return { role: 'aura_support', leash: 2, hold: true };
  }
  if (tags.includes('ranged') || (tpl.stats.range >= 2.5 && tpl.stats.speed <= 1.1)) {
    return { role: 'ranged_guard', leash: 1.5, hold: true };
  }
  if (tags.includes('boss') || tpl.rarity >= 5) {
    return {
      role: 'boss_elite',
      leash: 6,
      prefer: tags.includes('anti_warrior') ? ['WARRIOR'] : [],
      blocksPath: true,
    };
  }
  if (tags.includes('tank') || tags.includes('tankette')) {
    return { role: 'bait_taunt', leash: 2.5, blocksPath: tpl.rarity >= 3 };
  }
  return { role: 'chaser', leash: 4 };
}
