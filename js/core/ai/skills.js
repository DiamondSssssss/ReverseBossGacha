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
