/** Combat skill effects for heroes */

export function ensureHeroSkillState(hero, time) {
  if (hero.shieldHp == null) hero.shieldHp = 0;
  if (hero.shieldUntil == null) hero.shieldUntil = 0;
  if (hero.tauntUntil == null) hero.tauntUntil = 0;
  if (hero.outOfCombat == null) hero.outOfCombat = 0;
  if (hero.lastCombatTime == null) hero.lastCombatTime = time;
}

export function applyIncomingDamage(hero, dmg, time) {
  ensureHeroSkillState(hero, time);
  if (hero.shieldHp > 0 && time < hero.shieldUntil) {
    const absorbed = Math.min(hero.shieldHp, dmg);
    hero.shieldHp -= absorbed;
    dmg -= absorbed;
  }
  return Math.max(0, dmg);
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

export function tryTauntSelf(hero, profile, time, monsters, cellSize, floatFn) {
  ensureHeroSkillState(hero, time);
  if (!hero.skills?.includes('TAUNT_SELF') && !profile.tauntSelf) return false;
  if (hero.tauntCdUntil && time < hero.tauntCdUntil) return false;
  if (hero.intent !== 'fighting') return false;
  hero.tauntUntil = time + 2.5;
  hero.tauntCdUntil = time + 12;
  // Mark nearby monsters to prefer this hero
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

  // Backstab: from behind (hero facing toward target's back) or stealthed
  if (skills.includes('BACKSTAB') || (hero.stealth && !hero.revealed)) {
    const approachingFromBehind =
      (hero.facing >= 0 && target.x >= hero.x) ||
      (hero.facing < 0 && target.x < hero.x);
    if (approachingFromBehind || (hero.stealth && !hero.revealed)) {
      dmg = Math.round(dmg * 1.5);
    }
  }

  return { dmg, silenced: false, isAoe, freeze: skills.includes('FREEZE') };
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

/**
 * Healer hồi máu hero đồng minh gần nhất (thiếu máu nhất).
 * @returns {boolean} có heal không
 */
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

  const eliteHeal = ['hero_healer_04', 'hero_healer_05'].includes(hero.templateId || hero.id);
  const ratio = hero.class === 'HEALER' ? (eliteHeal ? 0.28 : 0.18) : 0.12;
  const amount = Math.round(best.maxHp * ratio);
  best.hp = Math.min(best.maxHp, best.hp + amount);
  hero.healCdUntil = time + (eliteHeal ? 2.6 : 3.2);
  floatFn?.(best.x, best.y - 10, `+${amount}`, '#81c784');
  particles?.heal?.(best.x, best.y - 8);
  return true;
}
