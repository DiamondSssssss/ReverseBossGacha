import { scoreHeroForMonster, dist } from './targeting.js?v=120';
import { los } from '../pathfinding.js?v=120';

function hasTag(unit, tag) {
  return Array.isArray(unit?.tags) && unit.tags.includes(tag);
}

function terrainWantedBy(monster) {
  switch (monster.passive) {
    case 'WATER_BUFF':
      return 'WATER';
    case 'DARK_BUFF':
      return 'DARK';
    case 'BUFF_IN_LOW_CEILING_ROOM':
      return 'LOW_CEILING';
    default:
      return null;
  }
}

function worldCell(unit, cellSize, originY) {
  return {
    col: Math.floor(unit.x / cellSize),
    row: Math.floor((unit.y - originY) / cellSize),
  };
}

function enrichMonsterAi(m, ctx) {
  const base = { ...(m.ai || { role: 'chaser', leash: 4 }) };
  const tags = m.tags || [];
  const behavior = m.monster_behavior || {};
  if (tags.includes('assassin') || tags.includes('speed')) base.flankDive = true;
  if (tags.includes('stun') || tags.includes('knock') || tags.includes('slow')) base.disruptor = true;
  if (tags.includes('support') || tags.includes('heal') || base.role === 'aura_support') base.antiSupport = true;
  if (tags.includes('dps') || tags.includes('assassin')) base.executeLowHp = true;
  if (m.passive === 'ANTI_WARRIOR_BURST') base.guardBreaker = true;
  if (tags.includes('boss') || tags.includes('mythic')) base.treasurePunish = true;
  if (m.passive === 'REVEAL') base.antiStealthAnchor = true;
  const wanted = terrainWantedBy(m);
  if (wanted) base.preferredTerrain = wanted;
  if (
    base.role === 'ranged_guard' ||
    base.role === 'aura_support' ||
    tags.includes('ranged') ||
    tags.includes('heal')
  ) {
    base.prefersBuffAnchor = true;
  }
  if (behavior.targetPriority === 'BACKLINE_DIVE') base.flankDive = true;
  if (behavior.targetPriority === 'EXECUTE_DRAINER') base.treasurePunish = true;
  if (behavior.targetPriority === 'HEALER_BREAK' || behavior.targetPriority === 'CASTER_HUNTER') {
    base.disruptor = true;
    base.antiSupport = true;
  }
  if (behavior.targetPriority === 'SHIELD_BREAK') base.guardBreaker = true;
  if (
    behavior.movementStyle === 'BUFF_ANCHOR' ||
    behavior.movementStyle === 'SENTRY_HOLD' ||
    behavior.movementStyle === 'VISION_SENTINEL'
  ) {
    base.prefersBuffAnchor = true;
  }
  if (ctx?.heroes?.some((h) => h.alive && h.draining)) base.treasurePunish = true;
  return base;
}

function cellCenter(col, row, cellSize, originY) {
  return {
    x: (col + 0.5) * cellSize,
    y: originY + (row + 0.5) * cellSize,
  };
}

function pickAnchorCell(m, ctx, ai) {
  const { map, cellSize, originY, monsters } = ctx;
  const leashCells = Math.max(2, Math.round(ai.leash || 3));
  const home = worldCell({ x: m.homeX, y: m.homeY }, cellSize, originY);
  let best = null;
  let bestScore = -Infinity;
  for (let c = Math.max(0, home.col - leashCells); c <= Math.min(map.cols - 1, home.col + leashCells); c++) {
    for (let r = Math.max(0, home.row - leashCells); r <= Math.min(map.rows - 1, home.row + leashCells); r++) {
      const key = `${c},${r}`;
      if (map.blocked.has(key)) continue;
      let score = 0;
      const terrain = map.terrain?.[key] || 'NORMAL';
      if (ai.preferredTerrain && terrain === ai.preferredTerrain) score += 8;
      if (ai.prefersBuffAnchor) {
        const buffs = map.buffIndex?.[key] || [];
        if (buffs.some((b) => b.side === 'monster' || b.side === 'both')) score += 7;
      }
      if (ai.role === 'aura_support') {
        let alliesNear = 0;
        for (const ally of monsters || []) {
          if (!ally.alive || ally === m || ally.isTrap) continue;
          const ac = ally.col ?? Math.floor(ally.x / cellSize);
          const ar = ally.row ?? Math.floor((ally.y - originY) / cellSize);
          const manhattan = Math.abs(ac - c) + Math.abs(ar - r);
          if (manhattan <= 2) alliesNear++;
          if (['tank', 'tankette', 'boss'].some((tag) => hasTag(ally, tag))) score += Math.max(0, 3 - manhattan);
        }
        score += alliesNear * 0.9;
      }
      score -= (Math.abs(c - home.col) + Math.abs(r - home.row)) * 0.35;
      if (score > bestScore) {
        bestScore = score;
        best = { col: c, row: r };
      }
    }
  }
  return bestScore > 0 ? best : null;
}

/**
 * Monster AI tick — returns { action, target }
 * actions: idle | attack | chase | hold
 */
export function tickMonsterBrain(m, ctx) {
  const { heroes, time, map, blocked, cellSize } = ctx;
  const ai = enrichMonsterAi(m, ctx);

  if (m.isTrap || ai.role === 'trap' || m.speed <= 0) {
    return { action: 'idle', target: null };
  }

  const anchor = pickAnchorCell(m, ctx, ai);
  if (anchor) {
    const pos = cellCenter(anchor.col, anchor.row, cellSize, ctx.originY);
    m.homeX = pos.x;
    m.homeY = pos.y;
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
    const s = scoreHeroForMonster(m, h, ai, ctx);
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
  const curTerrain = map.terrain?.[`${m.col},${m.row}`] || 'NORMAL';
  if (
    ai.preferredTerrain &&
    curTerrain !== ai.preferredTerrain &&
    ai.role !== 'chaser' &&
    Math.hypot(m.x - m.homeX, m.y - m.homeY) > cellSize * 0.6
  ) {
    return { action: 'leash', target: best };
  }

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
  if (
    passive === 'SLOW_AURA' ||
    passive === 'AURA_TAUNT' ||
    passive === 'AURA_STUN' ||
    passive === 'ANTI_HEAL_AURA'
  ) {
    return { role: 'aura_support', leash: 2, hold: true };
  }
  if (passive === 'HEAL_AURA' || passive === 'HEAL_PULSE' || tags.includes('heal')) {
    return { role: 'aura_support', leash: 2.5, hold: true };
  }
  if (
    tags.includes('ranged') ||
    passive === 'RANGED_VOLLEY' ||
    passive === 'RANGED_BURN' ||
    passive === 'RANGED_FROST' ||
    passive === 'RANGED_POISON' ||
    passive === 'FROST_BOLT' ||
    (tpl.stats.range >= 2.5 && tpl.stats.speed <= 1.1)
  ) {
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

