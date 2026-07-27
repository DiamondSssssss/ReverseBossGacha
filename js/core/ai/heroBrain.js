import { getHeroProfile } from './profiles.js?v=94';
import { scoreMonsterForHero, dist } from './targeting.js?v=94';
import {
  ensureHeroSkillState,
  tryActivateShield,
  tryTauntSelf,
  tickStealthRegen,
  tryHealAlly,
  applySlow,
} from './skills.js?v=94';
import { findPath, findPathAway, buildBlockedFromMap } from '../pathfinding.js?v=94';

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

  // Healer: ưu tiên hồi máu đồng minh trước khi đánh
  if (profile.healPriority || hero.skills?.includes('HEAL_ALLY') || hero.class === 'HEALER') {
    const allies = ctx.heroes || combat?.heroes || [];
    tryHealAlly(
      hero,
      allies,
      time,
      combat?._float?.bind(combat),
      combat?.particles
    );
    if (hero._justHealedSlow) {
      hero._justHealedSlow = false;
      for (const m of monsters) {
        if (!m.alive || m.isTrap) continue;
        if (dist(hero, m) < (hero.range || 3) * cellSize) {
          applySlow(m, time, { factor: 0.7, duration: 2.2 });
        }
      }
    }
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

  // Forced taunt from monster TAUNT_SELF
  if (hero.forcedTargetId && time < (hero.forcedTargetUntil || 0)) {
    const forced = monsters.find((x) => x.id === hero.forcedTargetId && x.alive && !x.isTrap);
    if (forced) best = forced;
  }

  // Reveal check — quái soi hero tàng hình
  for (const m of monsters) {
    if (!m.alive) continue;
    if (m.passive === 'REVEAL' && dist(hero, m) < m.range) {
      hero.revealed = true;
    }
  }
  // Hero soi quái tàng hình
  const heroSkills = hero.skills || [];
  if (heroSkills.includes('REVEAL')) {
    const revealRange = hero.effectiveRange ?? hero.range ?? cellSize * 3;
    for (const m of monsters) {
      if (!m.alive || !m.stealth || m.revealed) continue;
      if (dist(hero, m) <= revealRange) {
        m.revealed = true;
        m.lastCombatTime = time;
      }
    }
  }

  const dToTarget = best ? dist(hero, best) : Infinity;
  const range = hero.effectiveRange ?? hero.range;

  // Mage / Archer / Hexer / Scout / ranged boss kite
  if (
    (profile.archetype === 'mage' ||
      profile.archetype === 'archer' ||
      profile.archetype === 'hexer' ||
      profile.archetype === 'scout' ||
      (profile.archetype === 'boss' && profile.kiteBelow)) &&
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
  const { time, globalSlowUntil, globalSlowFactor, zones, monsters, cellSize } = ctx;
  let speedMul = 1;
  if (time < globalSlowUntil) speedMul *= globalSlowFactor ?? 0.55;
  for (const z of zones) {
    if (dist(hero, z) < z.r) speedMul *= z.factor;
  }
  for (const m of monsters) {
    if (!m.alive || m.passive !== 'SLOW_AURA') continue;
    // Slow đã tick qua applySlow trong combatEngine — không nhân thêm lần 2
  }
  if (hero.tileSpeedMul) speedMul *= hero.tileSpeedMul;
  if (hero._allyAuraMoveSpeed) speedMul *= hero._allyAuraMoveSpeed;
  if (hero.slowUntil && time < hero.slowUntil) {
    speedMul *= hero.slowFactor ?? 0.55;
  }
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
