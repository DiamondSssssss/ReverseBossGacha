/**
 * Attack pattern definitions + combat FSM helpers.
 * Phases: idle → windup → strike → recover → idle
 */

export const HERO_PATTERNS = {
  melee_slash: {
    kind: 'melee_slash',
    windup: 0.22,
    recover: 0.28,
    hitAt: 0.85, // fraction through windup+strike window (used relative)
    moveDuring: 'lunge',
    telegraph: false,
    anim: 'attack',
  },
  aoe_cast: {
    kind: 'aoe_cast',
    windup: 0.45,
    recover: 0.4,
    hitAt: 1,
    moveDuring: 'none',
    telegraph: true,
    anim: 'cast',
  },
  backstab: {
    kind: 'backstab',
    windup: 0.12,
    recover: 0.2,
    hitAt: 1,
    moveDuring: 'lunge',
    telegraph: false,
    anim: 'attack',
  },
  ranged_poke: {
    kind: 'ranged_poke',
    windup: 0.28,
    recover: 0.32,
    hitAt: 1,
    moveDuring: 'step_back',
    telegraph: true,
    anim: 'cast',
  },
};

export const MONSTER_PATTERNS = {
  slow_swing: {
    kind: 'slow_swing',
    windup: 0.35,
    recover: 0.45,
    hitAt: 1,
    moveDuring: 'lunge',
    telegraph: false,
    anim: 'attack',
  },
  quick_jab: {
    kind: 'quick_jab',
    windup: 0.14,
    recover: 0.18,
    hitAt: 1,
    moveDuring: 'lunge',
    telegraph: false,
    anim: 'attack',
  },
  ranged_shot: {
    kind: 'ranged_shot',
    windup: 0.4,
    recover: 0.35,
    hitAt: 1,
    moveDuring: 'none',
    telegraph: true,
    anim: 'cast',
  },
  trap_burst: {
    kind: 'trap_burst',
    windup: 0.05,
    recover: 0.1,
    hitAt: 1,
    moveDuring: 'none',
    telegraph: false,
    anim: 'attack',
  },
  knock_hit: {
    kind: 'knock_hit',
    windup: 0.2,
    recover: 0.3,
    hitAt: 1,
    moveDuring: 'lunge',
    telegraph: false,
    anim: 'attack',
  },
  silence_cast: {
    kind: 'silence_cast',
    windup: 0.3,
    recover: 0.35,
    hitAt: 1,
    moveDuring: 'none',
    telegraph: true,
    anim: 'cast',
  },
  boss_cleave: {
    kind: 'boss_cleave',
    windup: 0.5,
    recover: 0.45,
    hitAt: 1,
    moveDuring: 'lunge',
    telegraph: true,
    anim: 'attack',
    aoe: true,
  },
  boss_slam: {
    kind: 'boss_slam',
    windup: 0.55,
    recover: 0.5,
    hitAt: 1,
    moveDuring: 'none',
    telegraph: true,
    anim: 'attack',
    aoe: true,
  },
  boss_ranged: {
    kind: 'boss_ranged',
    windup: 0.4,
    recover: 0.4,
    hitAt: 1,
    moveDuring: 'none',
    telegraph: true,
    anim: 'cast',
  },
};

export function patternForHero(hero, profile) {
  if (profile?.archetype === 'mage' || hero.class === 'MAGE') {
    return { ...HERO_PATTERNS.aoe_cast };
  }
  if (
    profile?.archetype === 'archer' ||
    hero.class === 'ARCHER' ||
    profile?.rangedStealth ||
    (hero.class === 'ROGUE' && hero.range > 80)
  ) {
    return { ...HERO_PATTERNS.ranged_poke };
  }
  if (
    profile?.archetype === 'rogue' ||
    hero.class === 'ROGUE' ||
    hero.skills?.includes('BACKSTAB')
  ) {
    return { ...HERO_PATTERNS.backstab };
  }
  return { ...HERO_PATTERNS.melee_slash };
}

export function patternForMonster(m) {
  const role = m.ai?.role || 'chaser';
  const p = m.passive || '';
  if (role === 'trap' || String(p).startsWith('TRAP_')) return { ...MONSTER_PATTERNS.trap_burst };
  if (
    role === 'ranged_guard' ||
    p === 'RANGED_VOLLEY' ||
    p === 'RANGED_BURN' ||
    p === 'RANGED_FROST' ||
    p === 'RANGED_POISON' ||
    p === 'FROST_BOLT' ||
    p === 'MYTHIC_INFERNO' ||
    p === 'MYTHIC_TOXIN' ||
    p === 'MYTHIC_STASIS'
  ) {
    return { ...MONSTER_PATTERNS.ranged_shot };
  }
  if (role === 'knockbacker') return { ...MONSTER_PATTERNS.knock_hit };
  if (role === 'anti_mage' || p === 'SILENCE_ON_HIT') return { ...MONSTER_PATTERNS.silence_cast };
  if (role === 'bait_taunt' || role === 'aura_support') {
    return { ...MONSTER_PATTERNS.slow_swing };
  }
  if (role === 'boss_elite') {
    const cycle = m.bossPatternIdx || 0;
    const list = [
      MONSTER_PATTERNS.boss_cleave,
      MONSTER_PATTERNS.boss_slam,
      MONSTER_PATTERNS.boss_ranged,
    ];
    return { ...list[cycle % list.length] };
  }
  return { ...MONSTER_PATTERNS.quick_jab };
}

/** Ensure attack FSM fields on unit */
export function ensureAttackState(unit) {
  if (!unit.atkPhase) unit.atkPhase = 'idle';
  if (unit.atkPhaseT == null) unit.atkPhaseT = 0;
  if (!unit.atkPattern) unit.atkPattern = null;
  if (!unit.atkTargetId) unit.atkTargetId = null;
  if (unit.hitDelivered == null) unit.hitDelivered = false;
  if (!unit.anim) unit.anim = 'idle';
  if (unit.animT == null) unit.animT = 0;
  if (unit.lungeX == null) unit.lungeX = 0;
  if (unit.lungeY == null) unit.lungeY = 0;
}

/**
 * Start an attack toward target. Returns false if on cooldown / busy.
 */
export function beginAttack(unit, target, pattern, time) {
  ensureAttackState(unit);
  if (unit.atkPhase !== 'idle') return false;
  if (unit.atkCd > 0) return false;
  unit.atkPattern = pattern;
  unit.atkTargetId = target.id;
  unit.atkPhase = 'windup';
  unit.atkPhaseT = 0;
  unit.hitDelivered = false;
  unit.anim = pattern.anim || 'attack';
  unit.animT = 0;
  unit.attackStartedAt = time;
  if (target.x != null) {
    unit.facing = target.x >= unit.x ? 1 : -1;
  }
  return true;
}

/**
 * Tick attack FSM. Calls onHit(target) once when strike connects.
 * @returns {{ busy: boolean, telegraph: boolean, pattern: object|null }}
 */
export function tickAttack(unit, dt, resolveTarget, onHit) {
  ensureAttackState(unit);
  if (unit.atkPhase === 'idle') {
    if (unit.anim === 'attack' || unit.anim === 'cast') {
      // keep run/idle elsewhere
    }
    unit.lungeX *= 0.85;
    unit.lungeY *= 0.85;
    return { busy: false, telegraph: false, pattern: null };
  }

  const p = unit.atkPattern;
  if (!p) {
    unit.atkPhase = 'idle';
    return { busy: false, telegraph: false, pattern: null };
  }

  unit.atkPhaseT += dt;
  const target = resolveTarget(unit.atkTargetId);

  // Lunge toward target during windup/strike
  if (target && (p.moveDuring === 'lunge' || p.moveDuring === 'step_back')) {
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const d = Math.hypot(dx, dy) || 1;
    const sign = p.moveDuring === 'step_back' ? -1 : 1;
    const amp = p.moveDuring === 'step_back' ? 5 : 7;
    const t = unit.atkPhase === 'windup' ? unit.atkPhaseT / p.windup : 1;
    unit.lungeX = (dx / d) * amp * Math.min(1, t) * sign;
    unit.lungeY = (dy / d) * amp * 0.4 * Math.min(1, t) * sign;
  }

  if (unit.atkPhase === 'windup') {
    unit.anim = p.anim || 'attack';
    unit.animT = Math.min(1, unit.atkPhaseT / Math.max(0.01, p.windup));
    if (unit.atkPhaseT >= p.windup) {
      unit.atkPhase = 'strike';
      unit.atkPhaseT = 0;
    }
    return { busy: true, telegraph: !!p.telegraph, pattern: p, target };
  }

  if (unit.atkPhase === 'strike') {
    unit.anim = p.anim || 'attack';
    unit.animT = 1;
    if (!unit.hitDelivered) {
      unit.hitDelivered = true;
      if (target) onHit(target, p);
    }
    // brief strike frame then recover
    if (unit.atkPhaseT >= 0.06) {
      unit.atkPhase = 'recover';
      unit.atkPhaseT = 0;
    }
    return { busy: true, telegraph: false, pattern: p, target };
  }

  if (unit.atkPhase === 'recover') {
    unit.anim = p.anim === 'cast' ? 'idle' : 'attack';
    unit.animT = 1 - Math.min(1, unit.atkPhaseT / Math.max(0.01, p.recover));
    unit.lungeX *= 0.7;
    unit.lungeY *= 0.7;
    if (unit.atkPhaseT >= p.recover) {
      unit.atkPhase = 'idle';
      unit.atkPhaseT = 0;
      unit.atkPattern = null;
      unit.atkTargetId = null;
      unit.lungeX = 0;
      unit.lungeY = 0;
      // boss cycle
      if (unit.ai?.role === 'boss_elite') {
        unit.bossPatternIdx = ((unit.bossPatternIdx || 0) + 1) % 3;
      }
    }
    return { busy: true, telegraph: false, pattern: p, target };
  }

  return { busy: false, telegraph: false, pattern: null };
}

/** Derive display anim from unit combat state */
export function resolveDisplayAnim(unit) {
  ensureAttackState(unit);
  if (!unit.alive) return { anim: 'death', animT: 1 };
  if (unit.atkPhase === 'windup' || unit.atkPhase === 'strike') {
    return { anim: unit.anim || 'attack', animT: unit.animT || 0 };
  }
  if (unit.atkPhase === 'recover' && unit.anim === 'cast') {
    return { anim: 'idle', animT: 0 };
  }
  if (unit.shieldHp > 0 && unit.shieldUntil && unit._time < unit.shieldUntil) {
    return { anim: 'defend', animT: 0.5 };
  }
  if (unit.intent === 'fleeing' || unit.panicking) {
    return { anim: 'flee', animT: (unit.animT || 0) % 1 };
  }
  if (unit.intent === 'fighting' && unit.atkPhase === 'idle') {
    return { anim: 'idle', animT: 0 };
  }
  if (
    unit.intent === 'moving' ||
    unit.intent === 'entering' ||
    unit.intent === 'kiting' ||
    unit.intent === 'draining'
  ) {
    return { anim: 'run', animT: unit.animT || 0 };
  }
  if (unit.flash > 0.05 && unit.intent !== 'fighting') {
    return { anim: 'hurt', animT: 0.5 };
  }
  return { anim: 'idle', animT: 0 };
}
