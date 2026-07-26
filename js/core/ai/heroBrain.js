import { getHeroProfile } from './profiles.js';
import { scoreMonsterForHero, dist } from './targeting.js';
import {
  ensureHeroSkillState,
  tryActivateShield,
  tryTauntSelf,
  tickStealthRegen,
} from './skills.js';
import { findPath, findPathAway, buildBlockedFromMap } from '../pathfinding.js';
import { SPELLS } from '../../data/constants.js';

/**
 * Decide hero combat intent for this frame.
 * Mutates hero; movement/attack executed by CombatEngine helpers via returned action.
 */
export function tickHeroBrain(hero, ctx) {
  const {
    time,
    dt,
    map,
    cellSize,
    monsters,
    blockedExtra,
    globalSlowUntil,
    zones,
    originY,
    combat,
  } = ctx;

  const profile = getHeroProfile(hero.templateId, hero.class);
  hero.aiProfile = profile;
  ensureHeroSkillState(hero, time);
  tryActivateShield(hero, profile, time);
  tickStealthRegen(hero, profile, time, dt);

  if (hero.panicking) {
    return { action: 'flee' };
  }

  // Pick target
  let best = null;
  let bestScore = Infinity;
  for (const m of monsters) {
    if (!m.alive || m.isTrap) continue;
    if (hero.stealth && !hero.revealed) {
      // can still fight if very close and not rushing
      if (profile.stealthRush && dist(hero, m) > cellSize * 1.2) continue;
    }
    const s = scoreMonsterForHero(hero, m, profile, cellSize);
    if (s < bestScore) {
      bestScore = s;
      best = m;
    }
  }

  // Reveal check
  for (const m of monsters) {
    if (!m.alive) continue;
    if (m.passive === 'REVEAL' && dist(hero, m) < m.range) {
      hero.revealed = true;
    }
  }

  const dToTarget = best ? dist(hero, best) : Infinity;
  const range = hero.effectiveRange ?? hero.range;

  // Mage kite
  if (
    profile.archetype === 'mage' &&
    best &&
    dToTarget < (profile.kiteBelow || 1.5) * cellSize &&
    !hero.silenced
  ) {
    return { action: 'kite', target: best, profile };
  }

  // Rogue skip fight if path to treasure relatively clear
  if (
    profile.skipFightIfClear &&
    hero.stealth &&
    !hero.revealed &&
    best &&
    dToTarget > cellSize * 1.8
  ) {
    return { action: 'advance', target: null, profile };
  }

  const shouldEngage =
    best &&
    dToTarget <= range &&
    (!profile.stealthRush || hero.revealed || dToTarget <= cellSize * 1.3 || profile.brawler);

  if (shouldEngage && !hero.panicking) {
    tryTauntSelf(hero, profile, time, monsters, cellSize, combat._float?.bind(combat));
    return { action: 'fight', target: best, profile };
  }

  // Ranged stealth poke
  if (profile.rangedStealth && best && dToTarget <= range) {
    return { action: 'fight', target: best, profile };
  }

  return { action: 'advance', target: best, profile };
}

export function heroSpeedMultiplier(hero, ctx) {
  const { time, globalSlowUntil, zones, monsters, cellSize, map, terrainAt } = ctx;
  let speedMul = hero.slowFactor || 1;
  if (time < globalSlowUntil) speedMul *= SPELLS.slow_wave.slowFactor;
  for (const z of zones) {
    if (dist(hero, z) < z.r) speedMul *= z.factor;
  }
  for (const m of monsters) {
    if (!m.alive || m.passive !== 'SLOW_AURA') continue;
    if (dist(hero, m) < cellSize * 2.2) speedMul *= 0.65;
  }
  // tile terrain / buffs applied by combat via hero.tileSpeedMul
  if (hero.tileSpeedMul) speedMul *= hero.tileSpeedMul;
  return speedMul;
}

export function rebuildHeroPath(hero, ctx) {
  const { map, cellSize, originY, blockedExtra, dynamicBlocked } = ctx;
  const col = Math.max(
    0,
    Math.min(map.cols - 1, Math.floor(hero.x / cellSize))
  );
  const row = Math.max(
    0,
    Math.min(map.rows - 1, Math.floor((hero.y - originY) / cellSize))
  );

  let goal;
  if (hero.panicking) {
    // nearest gate
    goal = map.gate.reduce((best, g) => {
      const d = Math.abs(g.col - col) + Math.abs(g.row - row);
      if (!best || d < best.d) return { ...g, d };
      return best;
    }, null);
  } else {
    goal = map.treasure.reduce((best, t) => {
      const d = Math.abs(t.col - col) + Math.abs(t.row - row);
      if (!best || d < best.d) return { ...t, d };
      return best;
    }, null);
  }

  const blocked = buildBlockedFromMap(map, [
    ...(blockedExtra || []),
    ...(dynamicBlocked || []),
  ]);
  // Allow standing on treasure/gate
  for (const t of map.treasure) blocked.delete(`${t.col},${t.row}`);
  for (const g of map.gate) blocked.delete(`${g.col},${g.row}`);

  const path = findPath(
    { col, row },
    { col: goal.col, row: goal.row },
    map.cols,
    map.rows,
    blocked
  );
  hero.path = path || [{ col: goal.col, row: goal.row }];
  hero.pathIdx = 0;
}

export function rebuildKitePath(hero, threat, ctx) {
  const { map, cellSize, originY, dynamicBlocked } = ctx;
  const col = Math.max(0, Math.min(map.cols - 1, Math.floor(hero.x / cellSize)));
  const row = Math.max(
    0,
    Math.min(map.rows - 1, Math.floor((hero.y - originY) / cellSize))
  );
  const tCol = Math.max(0, Math.min(map.cols - 1, Math.floor(threat.x / cellSize)));
  const tRow = Math.max(
    0,
    Math.min(map.rows - 1, Math.floor((threat.y - originY) / cellSize))
  );
  const blocked = buildBlockedFromMap(map, dynamicBlocked || []);
  const path = findPathAway(
    { col, row },
    { col: tCol, row: tRow },
    map.cols,
    map.rows,
    blocked,
    5
  );
  if (path) {
    hero.path = path;
    hero.pathIdx = 0;
  }
}
