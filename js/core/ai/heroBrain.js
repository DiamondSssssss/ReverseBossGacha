import { getHeroProfile } from './profiles.js?v=135';
import { scoreMonsterForHero, dist } from './targeting.js?v=135';
import {
  ensureHeroSkillState,
  tryActivateShield,
  tryTauntSelf,
  tickStealthRegen,
  tryHealAlly,
  applySlow,
  tryShieldAlly,
} from './skills.js?v=135';
import { findPath, findPathAway, buildBlockedFromMap } from '../pathfinding.js?v=135';

function hasFlag(value, flag) {
  return Array.isArray(value) ? value.includes(flag) : value === flag;
}

function unitCell(unit, cellSize, originY = 0, map = null) {
  return {
    col: Math.max(0, Math.min((map?.cols || Infinity) - 1, Math.floor(unit.x / cellSize))),
    row: Math.max(0, Math.min((map?.rows || Infinity) - 1, Math.floor((unit.y - originY) / cellSize))),
  };
}

function isBadHeroCell(map, key) {
  if (map.hazard?.has(key)) return true;
  const terrain = map.terrain?.[key];
  return terrain === 'FIRE' || terrain === 'POISON' || terrain === 'OIL';
}

function chooseHeroBuffGoal(hero, ctx) {
  const { map, cellSize, originY } = ctx;
  const here = unitCell(hero, cellSize, originY, map);
  let best = null;
  let bestScore = Infinity;
  for (const [key, buffs] of Object.entries(map.buffIndex || {})) {
    if (!buffs.some((b) => b.side === 'hero' || b.side === 'both')) continue;
    const [colRaw, rowRaw] = key.split(',');
    const col = Number(colRaw);
    const row = Number(rowRaw);
    if (!Number.isFinite(col) || !Number.isFinite(row)) continue;
    if (col === here.col && row === here.row) continue;
    const forward = Math.max(0, col - here.col);
    if (col < here.col) continue;
    const density = buffs.length;
    const score = Math.abs(col - here.col) + Math.abs(row - here.row) - forward * 0.75 - density * 0.4;
    if (score < bestScore) {
      bestScore = score;
      best = { col, row };
    }
  }
  return best;
}

function chooseFlankGoal(hero, ctx) {
  const { map, cellSize, originY } = ctx;
  const here = unitCell(hero, cellSize, originY, map);
  if (here.col >= Math.floor(map.cols * 0.65)) return null;
  const top = 1;
  const bottom = Math.max(1, map.rows - 2);
  const preferTop = ((hero.formation?.order || 0) + hero.templateId.length) % 2 === 0;
  return {
    col: Math.min(map.cols - 3, here.col + 4),
    row: preferTop ? top : bottom,
  };
}

function chooseChargeGoal(hero, ctx, target) {
  const { map, cellSize, originY } = ctx;
  if (target) {
    return {
      col: Math.max(0, Math.min(map.cols - 1, target.col ?? Math.floor(target.x / cellSize))),
      row: Math.max(0, Math.min(map.rows - 1, target.row ?? Math.floor((target.y - originY) / cellSize))),
    };
  }
  const treasure = map.treasure?.[0];
  return treasure ? { col: Math.max(0, treasure.col - 1), row: treasure.row } : null;
}

function pickAdvanceGoal(hero, ctx, target = null) {
  const behavior = hero.ai_behavior || {};
  const movement = behavior.movementStyle;
  const env = behavior.environmentalReaction || [];
  if (hasFlag(env, 'HERO_BUFF_SEEKER')) {
    const goal = chooseHeroBuffGoal(hero, ctx);
    if (goal) return goal;
  }
  if (movement === 'FLANKING' || movement === 'STEALTH_AMBUSH') {
    return chooseFlankGoal(hero, ctx);
  }
  if (movement === 'CHARGER' || movement === 'BULL_RUSH' || movement === 'SUICIDE_CHARGE') {
    return chooseChargeGoal(hero, ctx, target);
  }
  return null;
}

function pickProtectedAlly(hero, allies, ctx) {
  const behavior = hero.ai_behavior || {};
  const guardRole = behavior.guardRole || '';
  const supportFocus = behavior.supportFocus || '';
  if (!guardRole && !supportFocus) return null;
  const { cellSize, originY, map } = ctx;
  const here = unitCell(hero, cellSize, originY, map);
  let best = null;
  let bestScore = -Infinity;
  for (const ally of allies || []) {
    if (!ally?.alive || ally === hero) continue;
    const allyCell = unitCell(ally, cellSize, originY, map);
    let score = 0;
    score -= Math.abs(allyCell.col - here.col) * 0.8 + Math.abs(allyCell.row - here.row) * 0.5;
    score += allyCell.col * 0.35;
    if (
      guardRole === 'BODYGUARD' ||
      guardRole === 'AURA_ESCORT' ||
      guardRole === 'BACKLINE_SHIELD' ||
      supportFocus === 'ALLY_WITH_AURA'
    ) {
      if (['HEALER', 'MAGE', 'ARCHER', 'SCOUT'].includes(ally.class)) score += 6;
      if (ally.skills?.includes('HEAL_ALLY') || ally.skills?.includes('SHIELD_ALLY')) score += 4;
    }
    if (
      supportFocus === 'TANK_ANCHOR' ||
      supportFocus === 'FRONTLINE_SAVE' ||
      supportFocus === 'PUSH_SUPPORT'
    ) {
      if (['WARRIOR', 'TANK', 'BOSS'].includes(ally.class)) score += 7;
      score += (ally.maxHp || ally.hp || 0) / 250;
    }
    if (supportFocus === 'LEAD_DIVER' || supportFocus === 'EMERGENCY_HEAL') {
      score += (ally.atk || 0) / 40;
      if ((ally.hp || 0) / Math.max(1, ally.maxHp || ally.hp || 1) < 0.55) score += 5;
    }
    if (score > bestScore) {
      bestScore = score;
      best = ally;
    }
  }
  return best;
}

function escortGoalForAlly(hero, ally, ctx) {
  if (!ally) return null;
  const { map, cellSize, originY } = ctx;
  const allyCell = unitCell(ally, cellSize, originY, map);
  const supportFocus = hero.ai_behavior?.supportFocus || '';
  const behind =
    supportFocus === 'EMERGENCY_HEAL' ||
    supportFocus === 'CLEANSE_CORE' ||
    supportFocus === 'PROACTIVE_SHIELD';
  return {
    col: Math.max(0, Math.min(map.cols - 1, allyCell.col + (behind ? -1 : 1))),
    row: Math.max(0, Math.min(map.rows - 1, allyCell.row)),
  };
}

function pickInterceptTarget(hero, allies, monsters, ctx) {
  const behavior = hero.ai_behavior || {};
  if (!behavior.guardRole && !behavior.supportFocus && !behavior.visionRole) return null;
  const protectedAlly = pickProtectedAlly(hero, allies, ctx);
  const ref = protectedAlly || hero;
  let best = null;
  let bestScore = Infinity;
  for (const m of monsters || []) {
    if (!m?.alive || m.isTrap) continue;
    const d = dist(ref, m);
    if (behavior.visionRole && m.stealth) return m;
    let score = d;
    if (behavior.guardRole) score -= (m.atk || 0) * 0.05;
    if (behavior.supportFocus === 'EMERGENCY_HEAL' && d < ctx.cellSize * 2.8) score -= ctx.cellSize * 1.4;
    if (score < bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

function pickSpecialTarget(hero, monsters) {
  const behavior = hero.ai_behavior || {};
  const secondary = behavior.secondaryTarget || '';
  const curseFocus = behavior.curseFocus || '';
  let best = null;
  let bestScore = -Infinity;
  for (const m of monsters || []) {
    if (!m?.alive || m.isTrap) continue;
    let score = 0;
    if (secondary.includes('SHIELD') || curseFocus.includes('SHIELD')) {
      score += (m.shieldHp || 0) * 1.2;
    }
    if (secondary.includes('DEF') || curseFocus === 'DEF_BREAK') {
      score += (m.tileDefMul || 1) * 80 + (m.maxHp || 0) * 0.02;
    }
    if (
      secondary.includes('HEALER') ||
      secondary.includes('HEAL') ||
      curseFocus.includes('HEAL') ||
      curseFocus === 'BOSS_DENIAL'
    ) {
      if (
        m.passive === 'HEAL_AURA' ||
        m.passive === 'HEAL_PULSE' ||
        m.passive === 'ANTI_HEAL_AURA' ||
        m.tags?.includes('support')
      ) {
        score += 180;
      }
    }
    if (secondary.includes('FAST') || secondary.includes('DIVER')) {
      score += (m.speed || 0) * 60;
    }
    if (secondary.includes('BOSS') || secondary.includes('CARRY') || curseFocus === 'BOSS_DENIAL') {
      if (m.isBoss) score += 260;
      score += (m.atk || 0) * 0.8;
      score += (m.rangeCells || 0) * 45;
    }
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return bestScore > 0 ? best : null;
}

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
  const behavior = hero.ai_behavior || {};
  const allies = ctx.heroes || combat?.heroes || [];
  hero.aiProfile = profile;
  ensureHeroSkillState(hero, time);
  tryActivateShield(hero, profile, time);
  tickStealthRegen(hero, profile, time, dt);

  if (hero.panicking) {
    return { action: 'flee' };
  }

  // Healer / Support: hồi máu hoặc trao khiên đồng minh
  if (profile.healPriority || hero.skills?.includes('HEAL_ALLY') || hero.class === 'HEALER') {
    tryShieldAlly(
      hero,
      allies,
      time,
      cellSize,
      combat?._float?.bind(combat),
      combat?.particles
    );
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
    const s = scoreMonsterForHero(hero, m, profile, cellSize, monsters, map);
    if (s < bestScore) {
      bestScore = s;
      best = m;
    }
  }

  const intercept = pickInterceptTarget(hero, allies, monsters, ctx);
  if (intercept) {
    const currentBestScore = best ? dist(hero, best) : Infinity;
    if (!best || dist(hero, intercept) <= currentBestScore + cellSize * 1.2) {
      best = intercept;
    }
  }
  const special = pickSpecialTarget(hero, monsters);
  if (special && (!best || dist(hero, special) <= dist(hero, best) + cellSize * 1.5)) {
    best = special;
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
  const hpPct = hero.hp / Math.max(1, hero.maxHp || hero.hp || 1);
  const triggers = behavior.skillTrigger || [];
  const movement = behavior.movementStyle;
  const targetPriority = behavior.targetPriority;
  hero.aiGoalCell = pickAdvanceGoal(hero, ctx, best);
  if (!hero.aiGoalCell) {
    const protectedAlly = pickProtectedAlly(hero, allies, ctx);
    const escortGoal = escortGoalForAlly(hero, protectedAlly, ctx);
    if (escortGoal) hero.aiGoalCell = escortGoal;
  }

  // Mage / Archer / Hexer / Scout / ranged boss kite
  if (
    (movement === 'KITING' ||
      movement === 'KEEP_DISTANCE' ||
      profile.archetype === 'mage' ||
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

  if (
    targetPriority === 'TREASURE_RUSH' &&
    best &&
    best.passive !== 'TAUNT' &&
    dToTarget > cellSize * 0.95 &&
    !profile.holdFight
  ) {
    return { action: 'advance', target: null, profile };
  }

  const shouldEngage =
    best &&
    dToTarget <= range &&
    (!profile.stealthRush || hero.revealed || dToTarget <= cellSize * 1.3 || profile.brawler);

  const lowHpAggro =
    hasFlag(triggers, 'ON_LOW_HP') &&
    hpPct <= 0.3 &&
    best &&
    dToTarget <= range * 1.1;
  const suicideCommit =
    movement === 'SUICIDE_CHARGE' &&
    best &&
    (hpPct <= 0.12 || dToTarget <= cellSize * 1.25);

  if ((shouldEngage || lowHpAggro || suicideCommit) && !hero.panicking) {
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
  } else if (hero.aiGoalCell) {
    goal = {
      col: Math.max(0, Math.min(map.cols - 1, hero.aiGoalCell.col)),
      row: Math.max(0, Math.min(map.rows - 1, hero.aiGoalCell.row)),
    };
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
  const env = hero.ai_behavior?.environmentalReaction || [];
  const movement = hero.ai_behavior?.movementStyle;
  const avoidHazards =
    hasFlag(env, 'HAZARD_AVOIDER') &&
    movement !== 'CHARGER' &&
    movement !== 'BULL_RUSH' &&
    movement !== 'SUICIDE_CHARGE';
  if (avoidHazards) {
    for (let c = 0; c < map.cols; c++) {
      for (let r = 0; r < map.rows; r++) {
        const key = `${c},${r}`;
        if (key === `${goal.col},${goal.row}`) continue;
        if (isBadHeroCell(map, key)) blocked.add(key);
      }
    }
  }
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
  if (!path && avoidHazards) {
    const relaxedBlocked = buildBlockedFromMap(map, [
      ...(blockedExtra || []),
      ...(dynamicBlocked || []),
    ]);
    for (const t of map.treasure) relaxedBlocked.delete(`${t.col},${t.row}`);
    for (const g of map.gate) relaxedBlocked.delete(`${g.col},${g.row}`);
    const fallback = findPath(
      { col, row },
      { col: goal.col, row: goal.row },
      map.cols,
      map.rows,
      relaxedBlocked
    );
    hero.path = fallback || [{ col: goal.col, row: goal.row }];
  } else {
    hero.path = path || [{ col: goal.col, row: goal.row }];
  }
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

