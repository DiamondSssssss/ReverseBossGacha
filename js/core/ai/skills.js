/** Combat skill effects for heroes + shared status helpers */

export function ensureHeroSkillState(hero, time) {
  if (hero.shieldHp == null) hero.shieldHp = 0;
  if (hero.shieldUntil == null) hero.shieldUntil = 0;
  if (hero.tauntUntil == null) hero.tauntUntil = 0;
  if (hero.outOfCombat == null) hero.outOfCombat = 0;
  if (hero.lastCombatTime == null) hero.lastCombatTime = time;
}

export function applyIncomingDamage(unit, dmg, time) {
  ensureHeroSkillState(unit, time);
  if (unit.shieldHp > 0 && time < unit.shieldUntil) {
    const absorbed = Math.min(unit.shieldHp, dmg);
    unit.shieldHp -= absorbed;
    dmg -= absorbed;
    if (unit.shieldHp <= 0) {
      unit.shieldHp = 0;
      unit.shieldUntil = 0;
    }
  }
  return Math.max(0, dmg);
}

/** Phá khiên — xóa sạch lớp khiên đang có */
export function applyShieldBreak(attacker, target, time, floatFn) {
  const skills = attacker.skills || [];
  const passive = attacker.passive || '';
  if (
    !skills.includes('SHIELD_BREAK') &&
    passive !== 'SHIELD_BREAK' &&
    !attacker.tags?.includes('shield_break')
  ) {
    return false;
  }
  ensureHeroSkillState(target, time);
  if (!(target.shieldHp > 0 && time < target.shieldUntil)) return false;
  target.shieldHp = 0;
  target.shieldUntil = 0;
  floatFn?.(target.x, target.y - 12, 'Phá khiên!', '#81d4fa');
  return true;
}

/** Có khiên đang hoạt động không */
export function activeShieldHp(unit, time) {
  if (!unit) return 0;
  if (unit.shieldHp > 0 && time < (unit.shieldUntil || 0)) return unit.shieldHp;
  return 0;
}

export function tryActivateShield(hero, profile, time) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('SHIELD')) return false;
  if (hero.shieldCdUntil && time < hero.shieldCdUntil) return false;
  const threshold = profile.shieldAt ?? 0.4;
  if (hero.hp / hero.maxHp > threshold) return false;
  hero.shieldHp = Math.round(hero.maxHp * 0.28);
  hero.shieldUntil = time + 3.2;
  hero.shieldCdUntil = time + 10;
  return true;
}

/** Monster SHIELD — cùng cơ chế absorb HP khi máu thấp. */
export function tryActivateMonsterShield(m, time) {
  ensureHeroSkillState(m, time);
  if (!m.skills?.includes('SHIELD')) return false;
  if (m.shieldCdUntil && time < m.shieldCdUntil) return false;
  if (m.hp / m.maxHp > 0.45) return false;
  m.shieldHp = Math.round(m.maxHp * 0.26);
  m.shieldUntil = time + 3.0;
  m.shieldCdUntil = time + 11;
  return true;
}

export function tryTauntSelf(hero, profile, time, monsters, cellSize, floatFn) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('TAUNT_SELF') && !profile.tauntSelf) return false;
  if (hero.tauntCdUntil && time < hero.tauntCdUntil) return false;
  if (hero.intent !== 'fighting') return false;
  hero.tauntUntil = time + 2.5;
  hero.tauntCdUntil = time + 12;
  for (const m of monsters) {
    if (!m.alive) continue;
    const d = Math.hypot(m.x - hero.x, m.y - hero.y);
    if (d < cellSize * 3.5) {
      m.forcedTargetId = hero.id;
      m.forcedTargetUntil = time + 2.5;
    }
  }
  floatFn?.(hero.x, hero.y, 'Khiêu khích!', '#ffcc80');
  return true;
}

/** Monster TAUNT_SELF — ép hero gần phải đánh mình. */
export function tryMonsterTauntSelf(m, time, heroes, cellSize, floatFn) {
  if (!m.skills?.includes('TAUNT_SELF')) return false;
  if (m.tauntCdUntil && time < m.tauntCdUntil) return false;
  let hit = false;
  for (const h of heroes) {
    if (!h.alive) continue;
    const d = Math.hypot(h.x - m.x, h.y - m.y);
    if (d < cellSize * 3.2) {
      h.forcedTargetId = m.id;
      h.forcedTargetUntil = time + 2.4;
      hit = true;
    }
  }
  if (!hit) return false;
  m.tauntCdUntil = time + 12;
  floatFn?.(m.x, m.y, 'Khiêu khích!', '#ffcc80');
  return true;
}

export function applyBurn(target, time, { dps = 10, duration = 3.5 } = {}) {
  target.burnUntil = Math.max(target.burnUntil || 0, time + duration);
  target.burnDps = Math.max(target.burnDps || 0, dps);
}

export function applyPoison(target, time, { dps = 8, duration = 4.5 } = {}) {
  target.poisonUntil = Math.max(target.poisonUntil || 0, time + duration);
  target.poisonDps = Math.max(target.poisonDps || 0, dps);
}

export function applyFreeze(target, time, duration = 1.2) {
  target.frozenUntil = Math.max(target.frozenUntil || 0, time + duration);
}

export function applyStun(target, time, duration = 0.9) {
  target.stunnedUntil = Math.max(target.stunnedUntil || 0, time + duration);
}

export function applySlow(target, time, { factor = 0.55, duration = 3 } = {}) {
  target.slowUntil = Math.max(target.slowUntil || 0, time + duration);
  target.slowFactor = Math.min(target.slowFactor ?? 1, factor);
}

export function applyDefShred(target, time, { factor = 0.7, duration = 4 } = {}) {
  target.defShredUntil = Math.max(target.defShredUntil || 0, time + duration);
  target.defShredFactor = Math.min(target.defShredFactor ?? 1, factor);
}

export function tickStatusDots(unit, time, dt) {
  let dmg = 0;
  if (unit.burnUntil && time < unit.burnUntil && unit.burnDps > 0) {
    dmg += unit.burnDps * dt;
  }
  if (unit.poisonUntil && time < unit.poisonUntil && unit.poisonDps > 0) {
    dmg += unit.poisonDps * dt;
  }
  return dmg;
}

export function statusTelegraphColor(skillsOrPassive) {
  const s = Array.isArray(skillsOrPassive)
    ? skillsOrPassive
    : [skillsOrPassive].filter(Boolean);
  if (s.some((x) => /BURN|FIRE|AOE_FIRE|TRAP_BURN/.test(x))) return '#ff7043';
  if (s.some((x) => /FROST|FREEZE|ICE|TRAP_FREEZE/.test(x))) return '#81d4fa';
  if (s.some((x) => /POISON|TRAP_POISON/.test(x))) return '#9ccc65';
  if (s.some((x) => /STUN|TRAP_STUN/.test(x))) return '#ffe082';
  if (s.some((x) => /SILENCE/.test(x))) return '#b39ddb';
  return null;
}

export function computeHeroAttackDamage(hero, target, time) {
  let dmg = hero.atk;
  const skills = hero.skills || [];
  const isAoe =
    skills.includes('AOE_FIRE') ||
    skills.includes('AOE_FROST') ||
    (hero.class === 'MAGE' && hero.aoeRadius > 0);

  if (hero.silenced && hero.class === 'MAGE') {
    return { dmg: Math.round(hero.atk * 0.35), silenced: true, isAoe: false };
  }

  if (skills.includes('BACKSTAB') || (hero.stealth && !hero.revealed)) {
    const approachingFromBehind =
      (hero.facing >= 0 && target.x >= hero.x) ||
      (hero.facing < 0 && target.x < hero.x);
    if (approachingFromBehind || (hero.stealth && !hero.revealed)) {
      dmg = Math.round(dmg * 1.5);
    }
  }

  if (skills.includes('BERSERK') || hero.class === 'BERSERKER') {
    const ratio = Math.max(0, Math.min(1, hero.hp / Math.max(1, hero.maxHp)));
    if (ratio < 0.5) {
      const mul = 1.3 + (0.5 - ratio) * 1.4;
      dmg = Math.round(dmg * mul);
    }
  }

  const pierce = skills.includes('PIERCE');

  return {
    dmg,
    silenced: false,
    isAoe,
    freeze: skills.includes('FREEZE') || skills.includes('FROST_BOLT'),
    burn: skills.includes('BURN_ON_HIT') || skills.includes('AOE_FIRE'),
    poison: skills.includes('POISON_ON_HIT'),
    stun: skills.includes('STUN_ON_HIT'),
    defShred: skills.includes('DEF_SHRED'),
    pierce,
    lifesteal: skills.includes('LIFESTEAL'),
  };
}

export function applyOnHitStatuses(attacker, target, time, flags = {}) {
  const skills = attacker.skills || [];
  const passive = attacker.passive || '';

  const stun =
    flags.stun ||
    skills.includes('STUN_ON_HIT') ||
    passive === 'STUN_ON_HIT' ||
    passive === 'MYTHIC_STASIS';
  const burn =
    flags.burn ||
    skills.includes('BURN_ON_HIT') ||
    skills.includes('AOE_FIRE') ||
    passive === 'BURN_ON_HIT' ||
    passive === 'RANGED_BURN' ||
    passive === 'MYTHIC_INFERNO';
  const poison =
    flags.poison ||
    skills.includes('POISON_ON_HIT') ||
    passive === 'POISON_ON_HIT' ||
    passive === 'RANGED_POISON' ||
    passive === 'MYTHIC_TOXIN';
  const freeze =
    flags.freeze ||
    skills.includes('FREEZE') ||
    skills.includes('FROST_BOLT') ||
    passive === 'FROST_BOLT' ||
    passive === 'RANGED_FROST';
  const defShred = flags.defShred || skills.includes('DEF_SHRED') || passive === 'DEF_SHRED';

  const applied = [];
  if (burn) {
    const dps = attacker.rarity >= 5 || attacker.class === 'MAGE' ? 14 : 10;
    applyBurn(target, time, { dps, duration: 3.2 });
    applied.push('burn');
  }
  if (poison) {
    applyPoison(target, time, { dps: 9, duration: 4 });
    applied.push('poison');
  }
  if (freeze) {
    applyFreeze(
      target,
      time,
      skills.includes('FROST_BOLT') || passive === 'FROST_BOLT' ? 1.4 : 1.15
    );
    applied.push('freeze');
  }
  if (stun) {
    applyStun(target, time, passive === 'MYTHIC_STASIS' ? 1.4 : 0.85);
    applied.push('stun');
    if (passive === 'MYTHIC_STASIS') {
      attacker._stasisSelfLock = time + 1.8;
    }
  }
  if (defShred) {
    applyDefShred(target, time, { factor: 0.65, duration: 4.5 });
    applied.push('defShred');
  }
  return applied;
}

export const TRAP_EFFECTS = {
  TRAP_SPIKE: { kind: 'spike', dmgMul: 1, consume: true },
  TRAP_SLOW: { kind: 'slow', dmgMul: 0.45, slowFactor: 0.4, slowDur: 3.5, consume: true },
  TRAP_BURN: { kind: 'burn', dmgMul: 0.55, burnDps: 14, burnDur: 4, consume: true },
  TRAP_POISON: { kind: 'poison', dmgMul: 0.4, poisonDps: 11, poisonDur: 5, consume: true },
  TRAP_FREEZE: { kind: 'freeze', dmgMul: 0.35, freezeDur: 1.6, consume: true },
  TRAP_STUN: { kind: 'stun', dmgMul: 0.5, stunDur: 1.3, consume: true },
};

export function isTrapPassive(passive) {
  return !!TRAP_EFFECTS[passive];
}

export function tickStealthRegen(hero, profile, time, dt) {
  if (!hero.stealth && !hero.skills?.includes('STEALTH')) return;
  if (hero.intent === 'fighting') {
    hero.lastCombatTime = time;
    return;
  }
  if (hero.revealed && time - (hero.lastCombatTime || 0) > 3.5) {
    hero.revealed = false;
  }
}

export function tryHealAlly(hero, allies, time, floatFn, particles) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('HEAL_ALLY') && hero.class !== 'HEALER') return false;
  if (hero.silenced) return false;
  if (hero.healCdUntil && time < hero.healCdUntil) return false;

  let best = null;
  let bestMissing = 0;
  for (const a of allies) {
    if (!a.alive || a === hero) continue;
    const missing = a.maxHp - a.hp;
    if (missing < a.maxHp * 0.12) continue;
    const d = Math.hypot(a.x - hero.x, a.y - hero.y);
    if (d > (hero.range || 2.8) * 44 * 1.15) continue;
    if (missing > bestMissing) {
      bestMissing = missing;
      best = a;
    }
  }
  if (!best) return false;

  const eliteHeal = ['hero_healer_04', 'hero_healer_05', 'hero_healer_06'].includes(
    hero.templateId || hero.id
  );
  // Soft-cap: heal không ăn full stage-scaled maxHp (tránh double-dip ải 31+)
  const healBase = Math.min(best.maxHp, 900 + best.maxHp * 0.35);
  const ratio = hero.class === 'HEALER' ? (eliteHeal ? 0.2 : 0.14) : 0.1;
  const raw = Math.round(healBase * ratio);
  const mul = Math.max(0, Number(best.healRecvMul) ?? 1);
  const amount = Math.max(0, Math.round(raw * mul));
  hero.healCdUntil = time + (eliteHeal ? 3.0 : 3.4);
  if (amount <= 0) {
    floatFn?.(best.x, best.y - 10, 'Giảm hồi!', '#a1887f');
    return true;
  }
  best.hp = Math.min(best.maxHp, best.hp + amount);
  floatFn?.(
    best.x,
    best.y - 10,
    mul < 0.99 ? `+${amount}↓` : `+${amount}`,
    mul < 0.99 ? '#a1887f' : '#81c784'
  );
  particles?.heal?.(best.x, best.y - 8);

  if (hero.skills?.includes('SLOW_AURA_ALLY')) {
    hero._justHealedSlow = true;
  }
  return true;
}

export function applyHealCutOnHit(attacker, target, time) {
  const skills = attacker.skills || [];
  if (
    !skills.includes('HEAL_CUT_HIT') &&
    attacker.passive !== 'HEAL_CUT_ON_HIT' &&
    attacker.passive !== 'HEAL_CUT_BOLT'
  ) {
    return;
  }
  const dur = attacker.rarity >= 5 || attacker.class === 'HEXER' ? 5.5 : 4;
  const factor =
    attacker.rarity >= 5 ||
    attacker.id?.includes('hex_05') ||
    attacker.templateId === 'hero_hex_05'
      ? 0.2
      : attacker.rarity >= 4 || attacker.templateId === 'hero_hex_04'
        ? 0.3
        : 0.4;
  target.healCutUntil = Math.max(target.healCutUntil || 0, time + dur);
  target.healCutFactor = Math.min(target.healCutFactor ?? 1, factor);
}

export function auraRadiusCells(unit) {
  if (unit.auraRadius != null) return unit.auraRadius;
  const p = unit.passive;
  if (
    p === 'SLOW_AURA' ||
    p === 'HEAL_AURA' ||
    p === 'HEAL_PULSE' ||
    p === 'ANTI_HEAL_AURA' ||
    p === 'AURA_TAUNT' ||
    p === 'AURA_STUN'
  ) {
    return 2.2;
  }
  return unit.rangeCells || 2;
}
